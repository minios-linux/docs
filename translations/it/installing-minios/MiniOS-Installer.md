---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
---

# Installatore MiniOS

Installatore MiniOS è una procedura guidata GTK e un backend a riga di comando per distribuire un sistema da una sessione live MiniOS in esecuzione. Scrivere o copiare MiniOS su un supporto rimovibile è già un metodo di installazione; l’Installatore MiniOS è lo strumento di distribuzione gestita da usare quando si desidera controllare la disposizione delle partizioni di destinazione, configurare la persistenza o eseguire la conversione nativa facoltativa.

## Prima di iniziare

Una scelta errata del dispositivo di destinazione o del partizionamento può causare la perdita dei dati. Esegui il backup dei file importanti, scollega i dischi non necessari e identifica il dispositivo di destinazione in base al percorso, al modello e alla capacità. La conferma finale è l’ultimo momento in cui è possibile annullare l’installazione senza rischi.

Il disco che contiene il sistema live MiniOS in esecuzione è escluso dalla selezione della destinazione. Per indicazioni generali sulla capacità, consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility).

## Modalità di installazione

**Modalità live** copia i moduli compressi MiniOS e i file di avvio selezionati. Il risultato resta MiniOS: mantiene la struttura modulare del sistema live, la configurazione di avvio MiniOS, i flussi di gestione MiniOS e la persistenza facoltativa della sessione.

**Modalità nativa** crea un ambiente desktop Debian convenzionale dall’immagine MiniOS selezionata. Espande i moduli selezionati in un file system root scrivibile, mantiene l’ambiente desktop selezionato e le applicazioni standard, rimuove il runtime live MiniOS e le utilità specifiche per il sistema live, installa i pacchetti Debian necessari, genera un initramfs convenzionale e installa il bootloader. L’installatore rileva il supporto per la modalità nativa dall’immagine avviata. Se mancano i metadati del kernel necessari e i requisiti di architettura EFI, la modalità di compatibilità consente solo l’installazione live.

::: warning La modalità nativa cambia il modo in cui si gestisce il sistema
Il sistema installato mantiene la familiare esperienza desktop MiniOS — aspetto, ambiente desktop selezionato e applicazioni standard — ma non utilizza più l’architettura live MiniOS. Durante la conversione, l’installatore rimuove i `minios-*` pacchetti e le altre utilità specifiche per il sistema live, perché le sessioni, i `.sb` moduli, la gestione modulare del kernel e la configurazione di avvio live non sono più pertinenti. Dopo il riavvio, gestisci il sistema come un ambiente desktop Debian convenzionale, usando APT, i pacchetti kernel Debian, l’initramfs standard e il bootloader installato. Consulta [Informazioni su MiniOS](/getting-started/About-MiniOS).
:::

Questa modalità di distribuzione è diversa dalla scrittura diretta di un file ISO, da una configurazione multiboot con file ISO Ventoy o da un’installazione live basata su file. Consulta [Metodi di installazione](/installing-minios/Installation-Methods) per conoscere le differenze.

## Avviare il programma di installazione grafico

Apri l’Installatore MiniOS dalla categoria **MiniOS** del menu delle applicazioni. Puoi anche avviarlo da un terminale; quando necessario, richiederà l’autorizzazione di amministratore:

```bash
minios-installer
```

La procedura guidata raccoglie le impostazioni relative a modalità di installazione, sicurezza, località, rete cablata, tastiera, account, moduli, archiviazione e avvio. Prima di confermare l’operazione distruttiva, verifica la geometria esatta delle partizioni e il riepilogo delle operazioni.

## Posizionamento e configurazioni di avvio

L’installatore grafico offre le seguenti opzioni di posizionamento quando il dispositivo di destinazione è idoneo:

- Cancella tutto crea una nuova tabella delle partizioni e cancella tutti i dati presenti sul disco di destinazione.
- Spazio libero usa lo spazio non allocato idoneo senza ridimensionare un file system esistente.
- Accanto ridimensiona una partizione finale ext2, ext3, ext4 o NTFS idonea e non montata. Le configurazioni danneggiate, montate, annidate, ambigue o comunque non sicure vengono rifiutate. Prima di scaricare gli strumenti per i file system mancanti, l’installatore potrebbe chiedere conferma.
- Il partizionamento manuale è disponibile solo per le conversioni native nell’interfaccia grafica e sui dischi diretti idonei. Le modifiche vengono preparate ma applicate solo dopo la conferma finale.

Le configurazioni di avvio automatiche sono BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funziona con GPT o con configurazioni MBR primarie. BIOS è supportato su MBR primario, ma non su GPT. Le configurazioni MBR con partizioni estese o logiche non sono supportate per il mantenimento delle partizioni.

Per **Cancella tutto** in modalità Live, **Automatico** seleziona MBR anche quando l’installatore viene avviato in modalità UEFI. Le destinazioni Live MBR mantengono i file EFI e ricevono un bootloader BIOS, quindi supportano entrambe le modalità firmware. Per i dischi da 2 TiB in su è necessario scegliere esplicitamente **UEFI/GPT**; le destinazioni Live GPT supportano solo UEFI. La cancellazione completa in modalità nativa segue una politica distinta, basata sul firmware. Le installazioni nello spazio libero e accanto a quelle esistenti mantengono la tabella delle partizioni attuale.

La modalità manuale consente di creare, eliminare, formattare e riutilizzare partizioni; ridimensionare un file system supportato a partire dalla sua fine; assegnare punti di mount, una partizione di sistema EFI e lo spazio di swap; annullare o reimpostare le modifiche preparate. Non supporta LVM, RAID, root native LUKS, archiviazione mappata o annidata, bcache, ZFS né la modifica dei sottovolumi Btrfs. La cifratura LUKS2 di una sessione Live con persistenza non cifra un file system root nativo.

## File system

- Le configurazioni Live possono usare ext2, ext4, Btrfs, FAT32 o NTFS, se sono installati gli strumenti necessari.
- Il file system root creato durante la conversione nativa può essere ext2, ext4 o Btrfs. Ext4 è l’opzione predefinita per uso generico.
- I file system ext3 esistenti possono essere riutilizzati o ridimensionati, se supportato; ext3 non è però disponibile per la nuova formattazione.
- FAT32 limita la dimensione dei file a meno di 4 GiB ed è disponibile solo per le configurazioni Live.
- NTFS è disponibile solo per le configurazioni Live, anche se una partizione NTFS idonea può essere ridimensionata per installare il sistema accanto a quello esistente.

Lo spazio necessario include i dati dei moduli selezionati, i file di avvio, la persistenza richiesta e una riserva del 25% per il file system. Lo spazio EFI e quello per lo swap nativo vengono calcolati separatamente.

## Configurazione e sicurezza

L’installatore può impostare lingua e impostazioni locali, fuso orario, tastiera, nome utente, password, gruppi utente, hostname, servizi, menu di avvio e moduli. Selezionando un livello di sistema superiore vengono inclusi i livelli inferiori richiesti. I moduli personalizzati provenienti da `minios/modules/` vengono selezionati separatamente, anche quando i loro nomi di file ricordano quelli dei moduli di sistema o del kernel.

I profili di sicurezza sono `convenient`, `balanced` e `strict`. La modalità Live usa per impostazione predefinita `convenient`; la conversione nativa parte da `balanced`. Le impostazioni per SSH e XRDP sono indipendenti dal profilo selezionato. Controlla i servizi di accesso remoto prima di connetterti per la prima volta alla rete. Dopo la conversione nativa, la configurazione di sicurezza successiva segue la normale procedura di amministrazione di sistema Debian.

La configurazione di rete include l’hostname e la connessione cablata tramite DHCP o IPv4 statico. L’installatore non crea né modifica i profili Wi-Fi. Per la conversione nativa e alcune operazioni di installazione accanto a un sistema esistente potrebbe essere necessario accedere alla rete, con il tuo consenso, per scaricare GRUB, EFI, initramfs, `os-prober` o i pacchetti per il ridimensionamento dei file system prima di apportare modifiche al disco.

## Persistenza della sessione Live

La persistenza è disponibile solo per le installazioni Live. Quando `minios-session` è disponibile, l’Installatore MiniOS può creare e attivare direttamente sulla destinazione una sessione numerata reale prima del completamento dell’installazione. **Configura automaticamente al primo avvio** salta questo passaggio; MiniOS può quindi creare in seguito lo spazio per la sessione usando la normale logica di persistenza all’avvio.

L’installatore offre i seguenti backend di archiviazione, se supportati dal sistema in esecuzione e dalla destinazione:

- `native` memorizza le modifiche della sessione Live direttamente nella directory della sessione su un file system di destinazione compatibile con POSIX. Nonostante il nome, si tratta di un **backend di persistenza Live** e non è collegato all’installazione nativa. Non è disponibile su FAT32 o NTFS.
- DynFileFS crea uno spazio ext4 espandibile basato su file. La dimensione selezionata è il limite massimo logico, non lo spazio riservato in anticipo. La dimensione predefinita è 4000 MiB.
- DynBlk crea un file system ext4 su un dispositivo a blocchi thin fornito dal driver del kernel DynBlk. I dati della sessione sono archiviati in file segmentati `volumeNNN.db` allocati quando necessario, quindi la dimensione selezionata è un limite massimo logico e non lo spazio occupato in anticipo sul disco. Per le nuove sessioni DynBlk, l’installatore imposta una dimensione predefinita di 16384 MiB. Per le sessioni DynBlk non cifrate, l’installatore può selezionare un codec di compressione supportato sia dal sistema in esecuzione sia dall’initrd copiato sulla destinazione.
- VMDK usa il driver DynBlk per creare uno spazio VMDK sparse standard suddiviso in più file (`volume.vmdk` e `volume-sNNN.vmdk`). Ha lo stesso modello di allocazione thin e la stessa dimensione predefinita di 16384 MiB di DynBlk, ma la compressione del backend non è disponibile.
- Raw crea un’immagine ext4 di dimensione fissa e riserva immediatamente la capacità selezionata. La dimensione predefinita è 4000 MiB.

LUKS2 è un livello di cifratura separato che può contenere lo spazio di archiviazione della sessione Raw, DynFileFS, DynBlk o VMDK. Per creare la sessione, l’installatore acquisisce la passphrase confermata, la invia a `minios-session` tramite lo standard input e non la inserisce negli argomenti della riga di comando, nei log o nella configurazione persistente. La passphrase sarà necessaria per sbloccare la sessione cifrata all’avvio. LUKS2 è disponibile solo se l’ambiente in esecuzione e l’initrd copiato sulla destinazione dichiarano un supporto compatibile. La compressione DynBlk è disattivata quando si seleziona LUKS2.

Lo spazio di archiviazione delle sessioni DynBlk e VMDK non è disponibile quando UEFI Secure Boot è attivo, perché il modulo kernel esterno DynBlk usato da questi backend non è firmato da MiniOS. I container Raw sono limitati a 4000 MiB su FAT32; DynFileFS, DynBlk e lo spazio VMDK suddiviso in più file non dipendono da un singolo file che superi il limite di 4 GiB di FAT32, ma restano soggetti ai limiti specifici del backend e dello spazio libero.

Poiché l’installatore crea e attiva la sessione selezionata sulla destinazione, non si affida a `perchmode` né a `perchsize` per creare lo spazio di archiviazione al primo avvio. Questi parametri di avvio descrivono comunque la creazione e la selezione della persistenza tramite initrd, al di fuori del percorso in cui l’installatore crea la sessione in anticipo. Vedi [Gestione delle sessioni](/using-minios/Sessions-and-Persistence), [Persistenza tramite initrd](/reference/boot-process/Persistence-Internals) e [Parametri di avvio](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

## Installazione da riga di comando

`minios-deploy` è pensata per l'automazione, i test e il ripristino. Il partizionamento manuale e la configurazione interattiva della rete cablata sono disponibili solo tramite interfaccia grafica.

Elenca i dischi riconosciuti come installabili:

```bash
minios-deploy list-disks
```

Sostituisci `/dev/sdb` in ogni esempio con il disco di destinazione verificato. Per prima cosa, stampa un piano non distruttivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Visualizza in anteprima i comandi di installazione corrispondenti senza scrivere sul disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Esegui l'installazione effettiva solo dopo aver verificato il piano, l'identità della destinazione e l'output dell'esecuzione di prova. `--yes` autorizza le modifiche distruttive:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Se vuoi deliberatamente eseguire una conversione nativa nello spazio libero esistente, usa le stesse opzioni di archiviazione per pianificare e installare:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversione nativa potrebbe non comparire nella guida della CLI se l'immagine non supporta l'installazione nativa. La CLI accetta anche opzioni di configurazione per account, lingua, fuso orario, tastiera, nome host, servizi e un `config.conf`. Verifica le opzioni esatte disponibili nell'immagine in esecuzione:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` e `--root-password` negli ambienti condivisi, perché gli argomenti della riga di comando in testo semplice possono essere visibili nella cronologia della shell e nell'elenco dei processi. Usa invece il programma di installazione grafico o una procedura di configurazione protetta.
