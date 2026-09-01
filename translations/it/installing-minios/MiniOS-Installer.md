---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Installatore MiniOS

Installatore MiniOS è una procedura guidata GTK e un backend da riga di comando per il deployment di un sistema a partire da una sessione live di MiniOS in esecuzione. Scrivere o copiare MiniOS su supporti rimovibili è già un metodo di installazione; Installatore MiniOS è lo strumento di deployment gestito da utilizzare quando si desidera un layout di destinazione controllato, la configurazione della persistenza o una conversione nativa opzionale.

## Prima di iniziare

Una scelta errata del disco di destinazione o del partizionamento può causare la perdita dei dati. Effettua il backup dei file importanti, scollega i dischi non necessari e identifica il disco di destinazione tramite percorso del dispositivo, modello e capacità. La conferma finale è l'ultimo punto in cui è possibile annullare in sicurezza l'installazione.

Il disco che contiene il sistema live MiniOS in esecuzione è escluso dalla selezione dei target. Per indicazioni generali sulla capacità, consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility).

## Modalità di installazione

**Modalità live** copia i moduli compressi MiniOS selezionati e gli asset di avvio. Il risultato rimane MiniOS: mantiene la struttura modulare del sistema live, la configurazione di avvio MiniOS, i workflow di gestione MiniOS e, opzionalmente, la persistenza della sessione.

**Modalità nativa** crea un desktop Debian convenzionale dall'immagine MiniOS selezionata. Espande i moduli selezionati in un filesystem root scrivibile, mantiene l'ambiente desktop selezionato e le applicazioni standard, rimuove il runtime live MiniOS e le utility specifiche del live, installa i pacchetti Debian richiesti, genera un initramfs convenzionale e installa il bootloader. L’installer rileva il supporto nativo dall’immagine avviata. Se i metadati del kernel richiesti e il contratto EFI dell’architettura non sono presenti, la modalità di compatibilità permette solo l’installazione live.

::: warning La modalità nativa cambia la gestione del sistema
Il sistema installato mantiene l’esperienza desktop familiare MiniOS — aspetto, ambiente desktop selezionato e applicazioni standard — ma non utilizza più l’architettura live MiniOS. Durante la conversione, l’installer rimuove i pacchetti `minios-*` e altre utility specifiche del live perché sessioni, moduli `.sb`, gestione modulare del kernel e configurazione di avvio live non sono più applicabili. Dopo il riavvio, il sistema si gestisce come un normale desktop Debian con APT, pacchetti kernel Debian, initramfs standard e il bootloader installato. Vedi [Informazioni su MiniOS](/getting-started/About-MiniOS).
:::

Questo deployment è diverso da una semplice scrittura ISO, da una configurazione multiboot con file ISO Ventoy o da un’installazione live basata su file. Vedi [Metodi di installazione](/installing-minios/Installation-Methods) per le differenze.

## Avvia l'installatore grafico

Apri il menu delle applicazioni, seleziona Sistema, poi seleziona Installatore MiniOS. Può essere avviato anche da terminale:

```bash
sudo minios-installer
```

La procedura guidata raccoglie le impostazioni di modalità di installazione, sicurezza, posizione, rete cablata, tastiera, account, modulo, archiviazione e avvio. Rivedi l'esatta geometria delle partizioni e il riepilogo delle operazioni prima di confermare definitivamente l'operazione distruttiva.

## Posizionamento e layout di avvio

L’installer grafico offre queste opzioni di posizionamento quando il target è idoneo:

- Cancella tutto crea una nuova tabella delle partizioni e distrugge tutti i dati sul disco di destinazione.
- Spazio libero utilizza lo spazio non allocato disponibile senza ridurre un filesystem esistente.
- Accanto riduce una partizione finale ext2, ext3, ext4 o NTFS idonea e non montata. Layout sporchi, montati, annidati, ambigui o comunque non sicuri vengono rifiutati. L’installer può chiedere conferma prima di scaricare gli strumenti mancanti per il filesystem.
- Partizionamento manuale è disponibile solo per le conversioni native nell’interfaccia grafica su dischi diretti idonei. Le modifiche vengono preparate fino alla conferma finale.

I layout di avvio automatici sono BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funziona sia con layout GPT che MBR primario. BIOS è supportato su MBR primario, non su GPT. I layout MBR estesi o logici non sono supportati.

La modalità manuale permette di creare, eliminare, formattare e riutilizzare partizioni; ridurre un filesystem supportato dalla fine; assegnare punti di mount, una partizione di sistema EFI e swap; annullare o ripristinare le modifiche preparate. Non supporta LVM, RAID, root LUKS nativi, storage mappato o annidato, bcache, ZFS o la modifica di subvolume Btrfs. La persistenza della sessione LUKS non cripta il filesystem root nativo.

## Filesystem

- I layout live possono utilizzare ext2, ext4, Btrfs, FAT32 o NTFS se sono installati gli strumenti necessari.
- Il filesystem root creato dalla conversione nativa può essere ext2, ext4 o Btrfs. Ext4 è il predefinito per uso generico.
- I filesystem ext3 esistenti possono essere riutilizzati o ridotti dove supportato, ma ext3 non è offerto per nuove formattazioni.
- FAT32 è limitato a file inferiori a 4 GiB ed è disponibile solo per layout live.
- NTFS è disponibile solo per layout live, anche se una partizione NTFS idonea può essere ridotta per il posizionamento accanto.

Lo spazio richiesto include i dati dei moduli selezionati, gli asset di avvio, la persistenza richiesta e una riserva del filesystem del 25 percento. Lo spazio EFI e swap nativo sono calcolati separatamente.

## Configurazione e sicurezza

L’installer può impostare lingua, fuso orario, tastiera, nome utente, password, gruppi utente, hostname, servizi, menu di avvio e selezione dei moduli. Selezionare un modulo MiniOS superiore include i livelli inferiori richiesti.

I profili di sicurezza sono `convenient`, `balanced` e `strict`. La modalità live predefinita è `convenient`; la conversione nativa parte da `balanced`. I controlli SSH e XRDP sono separati dal profilo selezionato. Verifica i servizi di accesso remoto prima della prima connessione di rete. Dopo la conversione nativa, la configurazione di sicurezza successiva segue il normale workflow di amministrazione di sistema Debian.

La configurazione di rete riguarda l’hostname e il DHCP cablato o IPv4 statico. L’installer non crea né modifica profili Wi-Fi. La conversione nativa e alcune operazioni accanto possono richiedere l’accesso alla rete, con il tuo consenso, per ottenere GRUB, EFI, initramfs, `os-prober` o pacchetti di ridimensionamento filesystem prima delle modifiche al disco.

## Persistenza della sessione live

La persistenza si applica solo alle installazioni live:

- La modalità di persistenza `native` salva le modifiche della sessione live direttamente su un filesystem di destinazione compatibile POSIX. Nonostante il nome, questa è una **backend di persistenza live** e non è collegata all’installazione nativa. Non è disponibile su FAT32 o NTFS.
- DynFileFS utilizza un contenitore espandibile.
- Raw usa un’immagine a dimensione fissa.
- LUKS usa un’immagine cifrata creata dall’initrd al primo avvio. La passphrase viene richiesta all’avvio e non viene mai ricevuta o memorizzata dall’installer.

Le modalità contenitore predefinite sono 4000 MiB. I contenitori Raw e LUKS non possono superare i 4000 MiB su FAT32; DynFileFS non è soggetto a questo limite di dimensione per singolo file. LUKS è disponibile solo se sia l’initrd in esecuzione sia ogni initrd sorgente copiato dichiarano il supporto crittografico richiesto.

Le opzioni di avvio risultanti usano `perchmode` e `perchsize`. Vedi [Persistenza initrd](/reference/boot-process/Persistence-Internals) e [Parametri di avvio](/reference/Boot-Parameters) per il loro significato a runtime e i requisiti di attivazione.

## Deployment da riga di comando

`minios-deploy` è pensato per automazione, test e recupero. Il partizionamento manuale e la configurazione interattiva della rete cablata restano disponibili solo nell’interfaccia grafica.

Elenca i dischi riconosciuti come installabili:

```bash
minios-deploy list-disks
```

Sostituisci `/dev/sdb` in ogni esempio con il disco di destinazione verificato. Prima stampa un piano non distruttivo:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Visualizza in anteprima i comandi di deployment corrispondenti senza scrivere sul disco:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Esegui l’installazione reale solo dopo aver controllato il piano, l’identità del target e l’output della simulazione. `--yes` autorizza le modifiche distruttive:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Se desideri deliberatamente una conversione nativa nello spazio libero esistente, usa le stesse opzioni di storage sia per la pianificazione che per l’installazione:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversione nativa potrebbe non comparire nell’help CLI su un’immagine priva del supporto native-install. La CLI accetta anche opzioni di configurazione per account, lingua, fuso orario, tastiera, hostname, servizi e un `config.conf` di base. Controlla le opzioni esatte fornite dall’immagine in esecuzione:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` e `--root-password` in ambienti condivisi perché gli argomenti in chiaro della riga di comando possono essere esposti nella cronologia della shell e nell’elenco dei processi. Usa invece l’installer grafico o un workflow di configurazione protetto.
