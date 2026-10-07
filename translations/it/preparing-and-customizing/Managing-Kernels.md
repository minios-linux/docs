---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gestione dei kernel

Il Gestore kernel MiniOS consente di impacchettare, ispezionare, attivare e rimuovere i bundle kernel per il sistema live modulare MiniOS. Un kernel MiniOS è un insieme coordinato: l'immagine del kernel, il relativo initramfs e il modulo corrispondente `01-kernel-<version>.sb` devono restare insieme.

Questo flusso di lavoro si applica solo all'architettura live. Un'installazione nativa utilizza i normali pacchetti kernel di Debian o Ubuntu, gli strumenti initramfs standard e il bootloader installato.

## Cosa fa il Gestore kernel

L'interfaccia grafica **Gestore kernel MiniOS** e la `minios-kernel` CLI utilizzano lo stesso backend. Permettono di:

- elencare i kernel impacchettati e distinguere tra versione in esecuzione, attiva e inattiva;
- impacchettare un kernel reale e versionato dai repository APT configurati;
- impacchettare un insieme coerente di pacchetti kernel locali `.deb`;
- aggiungere opzionalmente driver selezionati dal catalogo DKMS curato MiniOS durante l'impacchettamento di un kernel da repository;
- generare il relativo initramfs MiniOS e il modulo kernel SquashFS;
- preparare i bundle completati nel repository kernel MiniOS;
- attivare un bundle completo per il prossimo avvio e aggiornare la configurazione del bootloader supportato;
- rimuovere un kernel impacchettato e inattivo.

Il Gestore kernel non compila un albero sorgente kernel arbitrario. Se hai bisogno di modificare direttamente gli input di build del kernel MiniOS, utilizza invece il flusso di lavoro di build da sorgente MiniOS.

## Avvia il gestore grafico

Avvialo dal menu delle applicazioni MiniOS oppure esegui:

```bash
minios-kernel-manager
```

L'applicazione separa la gestione dei kernel installati dall'impacchettamento. I kernel dei repository possono essere cercati per nome pacchetto o per versione kernel visualizzata. I controlli dei pacchetti non sono disponibili quando la root MiniOS rilevata non è scrivibile.

Le operazioni backend privilegiate utilizzano PolicyKit. La CLI standalone `minios-kernel` richiede i permessi di root per ogni comando, eccetto per la guida.

## Impacchetta un kernel da repository

Seleziona **Repository** nella vista di impacchettamento e scegli un pacchetto kernel reale e versionato, ad esempio:

```text
linux-image-6.12.107+deb13-amd64
```

I metapacchetti di tracciamento come `linux-image-amd64` non sono accettati come sorgente del pacchetto. La modalità repository utilizza le sorgenti APT configurate nel sistema in esecuzione, la configurazione di trust e le liste dei pacchetti. Le dipendenze split-kernel versionate vengono risolte automaticamente quando la distribuzione le utilizza.

La GUI non esegue `apt update` solo perché le liste dei pacchetti sono vecchie. Aggiornale manualmente quando necessario, oppure usa `--force-update` con la CLI.

### Aggiungi driver DKMS curati

L'impacchettamento da repository può aggiungere driver selezionati dal catalogo DKMS MiniOS `01-kernel`. La GUI mostra le scelte compatibili per il kernel selezionato; la CLI accetta l'opzione ripetibile `--dkms-driver` :

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

I driver selezionati vengono compilati in un overlay/chroot isolato con header corrispondenti. Il backend verifica che i moduli prodotti corrispondano al kernel di destinazione prima di includerli e registra la provenienza dei driver all'interno del bundle sotto `/usr/share/minios/kernel-dkms/`.

Questa è una funzione di compatibilità curata, non un frontend DKMS generico. I pacchetti kernel locali manuali non permettono la selezione dei driver perché non è possibile dedurre in modo affidabile gli header di repository corrispondenti.

## Impacchetta kernel locali

Per un kernel locale, fornisci tutti i file richiesti `.deb` dalla stessa build del kernel:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian e Ubuntu possono suddividere un kernel in più pacchetti. Il backend verifica che l'immagine, i moduli, il base e gli eventuali pacchetti modules-extra forniti formino una versione coerente, invece di combinare silenziosamente revisioni non correlate.

## Output e compressione dell'impacchettamento

L'impacchettamento produce l'immagine del kernel, l'initramfs e il modulo kernel SquashFS. Alcuni metadati del pacchetto selezionato vengono mantenuti all'interno del modulo sotto `/usr/share/minios/kernel-dpkg/`.

La compressione predefinita SquashFS è `zstd`. Altri metodi sono disponibili solo se gli strumenti necessari sono presenti; il supporto attuale include `lz4`, `lzo`, `gzip`, `lzma`, `xz`, e `bzip2`.

Quando viene rilevata una root MiniOS scrivibile e l'output richiesto si trova altrove, il bundle completato viene preparato in modo atomico in:

```text
<MiniOS-root>/kernels/<version>/
```

I download dai repository sono input temporanei per la build e vengono rimossi dopo un'operazione di impacchettamento completata o fallita. Gli input locali `.deb` restano di proprietà di chi li ha forniti.

## Compatibilità con la persistenza cifrata

Se l'initramfs MiniOS in esecuzione pubblicizza la persistenza LUKS stratificata, un kernel sostitutivo deve preservare il percorso di avvio dm-crypt. L'initramfs generato viene controllato per il supporto cryptsetup richiesto, il modulo dm-crypt e il marker di capacità crypto MiniOS.

L'impacchettamento fallisce invece di produrre un bundle kernel che renderebbe non avviabile una sessione con persistenza cifrata.

## Attiva e rimuovi kernel

La vista di gestione distingue:

- **IN ESECUZIONE** — il kernel attualmente in esecuzione;
- **ATTIVO** — il bundle completo selezionato per il prossimo avvio;
- **DISPONIBILE** — un altro bundle impacchettato nel repository MiniOS.

L'attivazione richiede una voce completa nel repository. Vengono preparati insieme l'immagine del kernel, l'initramfs, il modulo attivo SquashFS, il marker active-version e le modifiche al bootloader come un'unica operazione coordinata. È richiesta la configurazione di GRUB; la configurazione nativa di SYSLINUX viene aggiornata se presente. In caso di errore nell'attivazione, i file di avvio preparati vengono ripristinati.

L'attivazione modifica solo il prossimo avvio; non riavvia il sistema corrente. Mantieni almeno un bundle completo e funzionante finché la sostituzione non è stata avviata con successo.

Elimina solo un kernel impacchettato e inattivo che non ti serve più. Non mescolare manualmente immagine kernel, initramfs o `01-kernel-*.sb` di bundle diversi.

## Riferimento da riga di comando

I comandi tipici sono:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Impacchetta da repository o file locali:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Aggiungi `--json` per un output strutturato. Consulta la guida e il manuale installati per le opzioni esatte fornite dalla versione in esecuzione:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Struttura dello storage

Il Gestore kernel rileva la root dei contenuti MiniOS invece di assumere un nome specifico per il block device. I percorsi gestiti sono relativi a quella root:

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
Il percorso canonico del modulo runtime è `/lib/modules/<version>`. Nei sistemi usrmerged corrisponde a `/usr/lib/modules/<version>`; i layout più vecchi possono memorizzarlo fisicamente sotto `/lib`. L'impacchettamento rifiuta un albero moduli della stessa versione già presente invece di mescolarlo con una revisione di pacchetto diversa.

## Recupero dopo un kernel non funzionante

Se un kernel appena attivato non funziona, avvia un set kernel completo e funzionante MiniOS se ancora disponibile. Non riparare l'installazione copiando singoli file kernel, initramfs o SquashFS da un'altra immagine: questi file costituiscono un unico bundle coordinato.

Se non rimane alcun bundle completo e funzionante, avvia un supporto di recupero affidabile, salva i dati importanti e reinstalla o ripristina l'installazione MiniOS interessata. Vedi [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting) e [Backup di MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentazione correlata

- [Architettura di sistema MiniOS](/reference/System-Architecture)
- [Caricamento moduli initrd](/reference/boot-process/Module-Loading)
- [Compilazione di MiniOS](/development/Building-MiniOS)
- [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting)
