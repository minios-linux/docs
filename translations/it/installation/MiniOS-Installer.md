# Utilizzo di MiniOS Installer

MiniOS Installer è una procedura guidata GTK con backend a riga di comando per il deployment di MiniOS da una sessione live di MiniOS. Installa su un disco di destinazione; non è lo stesso che scrivere un file ISO su un supporto avviabile.

## Prima di iniziare

Una scelta errata del target o del partizionamento può causare la perdita dei dati. Esegui il backup dei file importanti, scollega i dischi non necessari e identifica il target tramite percorso del dispositivo, modello e capacità. La conferma finale è l’ultimo punto in cui è possibile annullare l’installazione in modo sicuro.

Il disco che contiene il sistema live MiniOS in esecuzione è escluso dalla selezione del target. Per indicazioni generali sulla capacità, consulta la [Guida alla compatibilità hardware](Hardware-Compatibility.md).

## Modalità di installazione

La modalità live copia i moduli MiniOS compressi selezionati e i file di avvio. Il risultato mantiene la struttura modulare del sistema live e può utilizzare la persistenza della sessione MiniOS.

La modalità nativa espande i moduli selezionati in un tradizionale filesystem root Linux, configura il target, installa i pacchetti necessari, genera l’initramfs e installa il bootloader. L’installer rileva il supporto nativo dall’immagine avviata. Se i metadati richiesti del kernel e il contratto di architettura EFI sono assenti, la modalità compatibilità consente solo l’installazione live.

Questa modalità di distribuzione è diversa dalla semplice scrittura di una ISO grezza, da una configurazione multiboot di file ISO con Ventoy o da uno strumento live-media basato su file. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) per il confine tra sistemi live e nativi.

## Avvio dell’installer grafico

Apri il menu delle applicazioni, seleziona Sistema, poi Installa MiniOS. Può essere avviato anche da terminale:

```bash
sudo minios-installer
```

La procedura guidata raccoglie modalità di installazione, sicurezza, posizione, rete cablata, tastiera, account, moduli, impostazioni di archiviazione e di avvio. Esamina la geometria esatta delle partizioni e il riepilogo delle operazioni prima di confermare in modo definitivo e distruttivo.

## Posizionamento e layout di avvio

L’installer grafico offre queste opzioni di posizionamento quando il target è idoneo:

- Cancella tutto crea una nuova tabella delle partizioni e distrugge tutti i dati sul disco di destinazione.
- Spazio libero utilizza spazio non allocato idoneo senza ridurre un filesystem esistente.
- Accanto riduce una partizione finale ext2, ext3, ext4 o NTFS idonea e non montata. Layout sporchi, montati, annidati, ambigui o comunque non sicuri vengono rifiutati. L’installer può chiedere conferma prima di scaricare strumenti mancanti per i filesystem.
- Partizionamento manuale è disponibile solo per installazioni native GUI su dischi diretti idonei. Le modifiche vengono applicate solo dopo la conferma finale.

I layout di avvio automatici sono BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funziona con layout GPT o MBR primario. BIOS è supportato su MBR primario, non su GPT. I layout MBR estesi o logici non sono supportati.

La modalità manuale permette di creare, eliminare, formattare e riutilizzare partizioni; ridurre un filesystem supportato dalla fine; assegnare punti di mount, una partizione di sistema EFI e swap; annullare o ripristinare le modifiche in sospeso. Non supporta LVM, RAID, root LUKS nativi, storage mappato o annidato, bcache, ZFS o modifica di subvolumi Btrfs. La persistenza LUKS non cifra un filesystem root nativo.

## Filesystem

- I layout live possono utilizzare ext2, ext4, Btrfs, FAT32 o NTFS se sono installati gli strumenti necessari.
- I filesystem root nativi possono essere ext2, ext4 o Btrfs. Ext4 è il predefinito per uso generale.
- I filesystem ext3 esistenti possono essere riutilizzati o ridotti dove supportato, ma ext3 non viene offerto per nuove formattazioni.
- FAT32 è limitato a file inferiori a 4 GiB ed è disponibile solo per layout live.
- NTFS è disponibile solo per layout live, anche se una partizione NTFS idonea può essere ridotta per l’installazione accanto.

Lo spazio richiesto include i dati dei moduli selezionati, i file di avvio, la persistenza richiesta e una riserva del 25 percento per il filesystem. Lo spazio EFI e swap nativo vengono calcolati separatamente.

## Configurazione e sicurezza

L’installer può impostare lingua, fuso orario, tastiera, nome utente, password, gruppi utente, hostname, servizi, menu di avvio e selezione dei moduli. Selezionando un modulo MiniOS superiore vengono inclusi anche i livelli inferiori richiesti.

I profili di sicurezza sono `convenient`, `balanced` e `strict`. La modalità live predefinita è `convenient`; la modalità nativa predefinita è `balanced`. I controlli SSH e XRDP sono separati dal profilo selezionato. Verifica i servizi di accesso remoto prima della prima connessione di rete.

La configurazione di rete copre hostname e DHCP cablato o IPv4 statico. L’installer non crea né modifica profili Wi-Fi. Le installazioni native e accanto possono richiedere l’accesso alla rete, con il tuo consenso, per ottenere GRUB, EFI, initramfs, `os-prober` o pacchetti di ridimensionamento filesystem prima delle modifiche al disco.

## Persistenza della sessione live

La persistenza si applica solo alle installazioni live:

- La persistenza nativa salva le modifiche direttamente su un filesystem di destinazione compatibile POSIX. Non è disponibile su FAT32 o NTFS.
- DynFileFS utilizza un contenitore espandibile.
- Raw utilizza un’immagine a dimensione fissa.
- LUKS utilizza un’immagine cifrata creata dall’initrd al primo avvio. La passphrase viene richiesta all’avvio e non viene mai ricevuta o memorizzata dall’installer.

Le modalità contenitore predefinite sono di 4000 MiB. I contenitori Raw e LUKS non possono superare i 4000 MiB su FAT32; DynFileFS non è soggetto a questo limite di file singolo. LUKS è disponibile solo quando sia l’initrd in esecuzione sia ogni initrd sorgente copiato dichiarano il supporto crypto richiesto.

Le opzioni di avvio risultanti utilizzano `perchmode` e `perchsize`. Consulta [Persistenza initrd](/configuration/Initrd-Persistence.md) e [Parametri di avvio](/configuration/Boot-Parameters.md) per il loro significato a runtime e i requisiti di attivazione.

## Deployment da riga di comando

`minios-deploy` è pensato per automazione, test e recupero. Il partizionamento manuale e la configurazione interattiva della rete cablata restano disponibili solo tramite GUI.

Elenca i dischi riconosciuti come installabili:

```bash
minios-deploy list-disks
```

Sostituisci `/dev/sdb` in ogni esempio con il disco di destinazione verificato. Prima stampa un piano non distruttivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Visualizza in anteprima i comandi di deployment corrispondenti senza scrivere su disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Esegui l’installazione reale solo dopo aver verificato il piano, l’identità del target e l’output della simulazione. `--yes` autorizza le modifiche distruttive:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Per un’installazione nativa su spazio libero esistente, usa le stesse opzioni di storage per pianificazione e installazione:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La modalità nativa potrebbe non comparire nell’help CLI su un’immagine che non supporta l’installazione nativa. La CLI accetta anche opzioni di configurazione per account, lingua, fuso orario, tastiera, hostname, servizi e un `config.conf` di base. Verifica le opzioni esatte fornite dall’immagine in esecuzione:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` e `--root-password` in ambienti condivisi, perché gli argomenti in chiaro della riga di comando possono essere esposti nella cronologia della shell e nell’elenco dei processi. Usa invece l’installer grafico o un workflow di configurazione protetto.
