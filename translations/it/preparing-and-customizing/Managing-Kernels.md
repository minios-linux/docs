---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gestione dei kernel

Il Gestore kernel MiniOS crea pacchetti, esamina, attiva e rimuove bundle di kernel per il sistema live modulare MiniOS. Un kernel MiniOS è un insieme coordinato: l’immagine del kernel, il relativo initramfs e il corrispondente `01-kernel-<version>.sb` modulo devono rimanere insieme.

Questo flusso di lavoro si applica solo all’architettura live. Un’installazione nativa usa i normali pacchetti kernel Debian o Ubuntu, gli strumenti standard per initramfs e il bootloader installato.

## Funzioni del Gestore kernel

L’interfaccia grafica **Gestore kernel MiniOS** e la CLI `minios-kernel` usano lo stesso backend. Consentono di:

- elencare i kernel inclusi nei pacchetti e distinguere le versioni in esecuzione, attive e inattive;
- creare un pacchetto per un kernel con versione specifica disponibile nei repository APT configurati;
- creare un pacchetto da un insieme coerente di file `.deb` kernel locali;
- aggiungere facoltativamente i driver selezionati dal catalogo DKMS MiniOS curato durante la creazione del pacchetto di un kernel da repository;
- creare l’initramfs MiniOS e il modulo kernel SquashFS corrispondenti;
- preparare i bundle completati nel repository kernel MiniOS;
- attivare un bundle completo per il prossimo avvio e aggiornare la configurazione del bootloader supportato;
- rimuovere un kernel inattivo installato tramite pacchetto.

Il Gestore kernel non compila alberi di codice sorgente arbitrari. Se devi modificare direttamente gli input MiniOS per la compilazione del kernel, usa invece il flusso di lavoro per la compilazione dai sorgenti MiniOS.

## Avviare il gestore grafico

Avvialo dal menu delle applicazioni MiniOS oppure esegui:

```bash
minios-kernel-manager
```

L’applicazione separa la gestione dei kernel installati dalla creazione dei pacchetti. Puoi cercare i kernel dei repository per nome del pacchetto o visualizzare la versione del kernel. I controlli per la gestione dei pacchetti non sono disponibili se la root MiniOS rilevata non è scrivibile.

Le operazioni privilegiate del backend usano PolicyKit. La CLI autonoma `minios-kernel` richiede i privilegi di root per tutti i comandi, tranne help.

## Creare un pacchetto per un kernel dai repository

Nella vista di creazione pacchetti, scegli **Repository** e seleziona un pacchetto kernel con una versione specifica, ad esempio:

```text
linux-image-6.12.107+deb13-amd64
```

I metapacchetti di tracciamento, come `linux-image-amd64`, non sono accettati come sorgente del pacchetto. La modalità Repository usa le sorgenti APT, la configurazione di attendibilità e gli elenchi dei pacchetti configurati nel sistema in esecuzione. Se la distribuzione li usa, le dipendenze corrispondenti dei pacchetti kernel suddivisi per versione vengono risolte automaticamente.

L’interfaccia grafica non esegue `apt update` solo perché gli elenchi dei pacchetti sono obsoleti. Aggiornali esplicitamente quando necessario oppure usa `--force-update` dalla CLI.

### Aggiungere driver DKMS selezionati

La creazione dei pacchetti dal repository può aggiungere driver selezionati dal catalogo MiniOS `01-kernel` DKMS. L'interfaccia grafica mostra le opzioni compatibili con il kernel selezionato; la CLI accetta un'opzione `--dkms-driver` ripetibile:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

I driver selezionati vengono compilati in un overlay/chroot isolato con gli header corrispondenti. Il backend verifica che i moduli prodotti siano compatibili con il kernel di destinazione prima di includerli e registra la provenienza dei driver nel bundle in `/usr/share/minios/kernel-dkms/`.

Questa è una funzionalità di compatibilità con driver selezionati, non un'interfaccia generica per DKMS. I pacchetti kernel locali installati manualmente non consentono di selezionare i driver, perché non è possibile determinare in modo affidabile gli header corrispondenti nel repository.

## Creare pacchetti per kernel locali

Per un kernel locale, fornire tutti i `.deb` file richiesti dalla stessa compilazione del kernel:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian e Ubuntu possono distribuire un kernel in più pacchetti. Il backend verifica che i pacchetti forniti per l'immagine, i moduli, il pacchetto base e, facoltativamente, i moduli extra abbiano versioni coerenti, evitando di combinare inavvertitamente revisioni non correlate.

## Output della creazione dei pacchetti e compressione

La creazione dei pacchetti produce l'immagine del kernel, l'initramfs e il modulo del kernel SquashFS. I metadati selezionati dei pacchetti vengono conservati nel modulo in `/usr/share/minios/kernel-dpkg/`.

La compressione predefinita SquashFS è `zstd`. Gli altri metodi sono disponibili solo se gli strumenti necessari sono installati; quelli attualmente supportati includono `lz4`, `lzo`, `gzip`, `lzma`, `xz` e `bzip2`.

Se viene rilevata una root MiniOS scrivibile e l'output richiesto si trova altrove, il bundle completato viene trasferito atomicamente in:

```text
<MiniOS-root>/kernels/<version>/
```

I download dal repository sono input temporanei della compilazione e vengono rimossi al termine di un'operazione di creazione dei pacchetti completata o gestita in caso di errore. Gli input `.deb` locali restano sotto la responsabilità del chiamante.

## Compatibilità con la persistenza cifrata

Se l'initramfs MiniOS in esecuzione dichiara il supporto alla persistenza LUKS a livelli, il kernel sostitutivo deve mantenere il percorso di avvio dm-crypt. L'initramfs generato viene verificato per accertare il supporto richiesto di cryptsetup, la presenza del modulo dm-crypt e del marcatore di funzionalità crittografica MiniOS.

La creazione dei pacchetti viene interrotta, anziché produrre un bundle del kernel che impedirebbe l'avvio di una sessione con persistenza cifrata.

## Attivare e rimuovere i kernel

La vista di gestione distingue:

- **IN ESECUZIONE** — il kernel in esecuzione durante l'avvio corrente;
- **ATTIVO** — il bundle completo selezionato per il prossimo avvio;
- **DISPONIBILE** — un altro bundle pacchettizzato nel repository MiniOS.

L'attivazione richiede una voce completa nel repository. L'operazione prepara l'immagine del kernel, l'initramfs, il modulo SquashFS attivo, l'indicatore della versione attiva e le modifiche al bootloader in un'unica operazione coordinata. È necessaria la configurazione di GRUB; la configurazione nativa di SYSLINUX viene aggiornata se presente. In caso di errore durante l'attivazione, i file di avvio preparati vengono ripristinati.

L'attivazione modifica solo il prossimo avvio; il sistema attualmente in esecuzione non viene riavviato. Mantieni almeno un bundle completo di cui conosci il corretto funzionamento finché il bundle sostitutivo non si è avviato correttamente.

Elimina solo un kernel pacchettizzato inattivo di cui non hai più bisogno. Non combinare manualmente un'immagine del kernel, un initramfs o `01-kernel-*.sb` provenienti da bundle diversi.

<a id="command-line-reference"></a>

## Riferimento della riga di comando

Comandi tipici:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Pacchetto da un repository o da file locali:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Aggiungi `--json` per ottenere un output strutturato. Per conoscere le opzioni esatte disponibili nella versione in esecuzione, consulta la guida e il manuale installati:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Struttura di archiviazione

Kernel Manager individua la directory radice dei contenuti MiniOS senza presupporre un nome specifico per il dispositivo a blocchi. I percorsi gestiti sono relativi a questa directory:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
Il percorso canonico del modulo di runtime è `/lib/modules/<version>`. Nei sistemi usrmerged, questo percorso corrisponde a `/usr/lib/modules/<version>`; nelle strutture più datate, il modulo può essere archiviato fisicamente in `/lib`. Il processo di pacchettizzazione rifiuta una directory del modulo della stessa versione già presente, anziché combinarla con una revisione diversa del pacchetto.

## Ripristino dopo un kernel difettoso

Se un kernel appena attivato non funziona, avvia un set completo di kernel MiniOS di cui conosci il corretto funzionamento, se ancora disponibile. Non riparare l'installazione copiando singoli file del kernel, dell'initramfs o SquashFS da un'altra immagine: questi file costituiscono un unico bundle coordinato.

Se non è rimasto alcun bundle completo di cui conosci il corretto funzionamento, avvia un supporto di ripristino attendibile, salva i dati importanti e reinstalla o ripristina l'installazione di MiniOS interessata. Consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) e [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentazione correlata

- [Architettura del sistema MiniOS](/reference/System-Architecture)
- [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading)
- [Creazione di MiniOS](/development/Building-MiniOS)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
