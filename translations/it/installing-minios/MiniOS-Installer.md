---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
---

# Installatore MiniOS

L'Installatore MiniOS è una procedura guidata GTK e un backend da riga di comando per il deployment di un sistema a partire da una sessione live MiniOS in esecuzione. Scrivere o copiare MiniOS su supporti rimovibili è già un metodo di installazione; l'Installatore MiniOS è lo strumento di deployment gestito da utilizzare quando si desidera un layout di destinazione controllato, la configurazione della persistenza o una conversione nativa opzionale.

## Prima di iniziare

Una scelta errata della destinazione o del partizionamento può causare la perdita dei dati. Effettua il backup dei file importanti, scollega i dischi non necessari e identifica la destinazione tramite percorso del dispositivo, modello e capacità. La conferma finale è l'ultimo momento in cui è possibile annullare l'installazione in sicurezza.

Il disco che contiene il sistema live MiniOS in esecuzione è escluso dalla selezione delle destinazioni. Per indicazioni generali sulla capacità, consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility).

## Modalità di installazione

**Modalità live** copia i moduli MiniOS compressi selezionati e i componenti di avvio. Il risultato resta MiniOS: mantiene la struttura modulare del sistema live, la configurazione di avvio MiniOS, i flussi di lavoro di gestione MiniOS e, opzionalmente, la persistenza della sessione.

**Modalità nativa** crea un desktop Debian tradizionale dall'immagine MiniOS selezionata. Espande i moduli scelti in un filesystem root scrivibile, mantiene l'ambiente desktop e le applicazioni selezionate, rimuove il runtime live MiniOS e le utility specifiche per il live, installa i pacchetti Debian necessari, genera un initramfs convenzionale e installa il bootloader. L'installer rileva il supporto nativo dall'immagine avviata. Se mancano i metadati del kernel richiesti e il contratto di architettura EFI, la modalità compatibilità consente solo l'installazione live.

::: warning La modalità nativa cambia la gestione del sistema
Il sistema installato mantiene l'esperienza desktop familiare MiniOS — aspetto, ambiente desktop selezionato e applicazioni — ma non utilizza più l'architettura live MiniOS. Durante la conversione, l'installer rimuove i `minios-*` pacchetti e le altre utility specifiche per il live, poiché le sessioni, `.sb` i moduli, la gestione modulare del kernel e la configurazione di avvio live non sono più applicabili. Dopo il riavvio, il sistema va gestito come un normale desktop Debian tramite APT, pacchetti kernel Debian, initramfs standard e bootloader installato. Consulta [Informazioni su MiniOS](/getting-started/About-MiniOS).
:::

Questa modalità di deployment è diversa dalla scrittura diretta di una ISO, da una configurazione multiboot ISO-file Ventoy o da un'installazione live basata su file. Consulta [Metodi di installazione](/installing-minios/Installation-Methods) per le differenze.

## Avvia l'installer grafico

Apri il menu delle applicazioni, seleziona Sistema, quindi seleziona Installatore MiniOS. Può essere avviato anche da terminale:

```bash
sudo minios-installer
```

La procedura guidata raccoglie le impostazioni di modalità di installazione, sicurezza, localizzazione, rete cablata, tastiera, account, moduli, storage e avvio. Controlla la geometria esatta delle partizioni e il riepilogo delle operazioni prima di confermare in modo definitivo e distruttivo.

## Posizionamento e layout di avvio

L'installer grafico offre queste opzioni di posizionamento quando la destinazione è idonea:

- Cancella tutto crea una nuova tabella delle partizioni e distrugge tutti i dati sul disco di destinazione.
- Spazio libero utilizza lo spazio non allocato disponibile senza ridurre un filesystem esistente.
- Accanto riduce una partizione finale ext2, ext3, ext4 o NTFS idonea e smontata. Layout sporchi, montati, annidati, ambigui o comunque non sicuri vengono rifiutati. L'installer può chiedere conferma prima di scaricare gli strumenti mancanti per il filesystem.
- Il partizionamento manuale è disponibile solo per le conversioni native tramite GUI su dischi diretti idonei. Le modifiche vengono applicate solo dopo la conferma finale.

I layout di avvio automatici sono BIOS/MBR, UEFI/MBR e UEFI/GPT. UEFI funziona con layout GPT o MBR primario. BIOS è supportato solo su MBR primario, non su GPT. I layout MBR estesi o logici non sono supportati.

La modalità manuale permette di creare, eliminare, formattare e riutilizzare partizioni; ridurre un filesystem supportato dalla fine; assegnare punti di mount, una partizione EFI di sistema e swap; annullare o ripristinare le modifiche in sospeso. Non supporta LVM, RAID, root LUKS nativi, storage mappato o annidato, bcache, ZFS o la modifica di subvolumi Btrfs. La cifratura LUKS2 per una sessione live persistente non cifra il filesystem root nativo.

## Filesystem

- I layout live possono utilizzare ext2, ext4, Btrfs, FAT32 o NTFS se sono installati gli strumenti necessari.
- Il filesystem root creato da una conversione nativa può essere ext2, ext4 o Btrfs. Ext4 è l'opzione predefinita per uso generico.
- I filesystem ext3 esistenti possono essere riutilizzati o ridotti dove supportato, ma ext3 non è disponibile per nuove formattazioni.
- FAT32 è limitato a file inferiori a 4 GiB ed è disponibile solo per layout live.
- NTFS è disponibile solo per layout live, anche se una partizione NTFS idonea può essere ridotta per il posizionamento accanto.

Lo spazio richiesto include i dati dei moduli selezionati, i componenti di avvio, la persistenza richiesta e una riserva del 25 percento per il filesystem. Lo spazio EFI e swap nativo vengono calcolati separatamente.

## Configurazione e sicurezza

L'installer può impostare localizzazione, fuso orario, tastiera, nome utente, password, gruppi utente, hostname, servizi, menu di avvio e selezione dei moduli. Selezionare un modulo MiniOS superiore include automaticamente i livelli inferiori richiesti.

I profili di sicurezza sono `convenient`, `balanced` e `strict`. La modalità live prevede come predefinito `convenient`; la conversione nativa parte da `balanced`. I controlli SSH e XRDP sono separati dal profilo selezionato. Verifica i servizi di accesso remoto prima della prima connessione di rete. Dopo la conversione nativa, la configurazione della sicurezza segue il normale flusso di amministrazione di sistema Debian.

La configurazione di rete riguarda l'hostname e il DHCP cablato o IPv4 statico. L'installer non crea né modifica profili Wi-Fi. La conversione nativa e alcune operazioni accanto possono richiedere l'accesso alla rete, con il tuo consenso, per ottenere GRUB, EFI, initramfs, `os-prober`, o pacchetti per il ridimensionamento del filesystem prima di modificare il disco.

## Persistenza della sessione live

La persistenza si applica solo alle installazioni live. Quando `minios-session` è disponibile, l'Installatore MiniOS può creare e attivare una sessione numerata reale direttamente sulla destinazione prima che l'installazione termini. **Configurazione automatica al primo avvio** salta questo passaggio; MiniOS può quindi creare lo storage della sessione successivamente tramite la sua logica di persistenza all'avvio.

L'installer offre questi backend di storage quando il sistema in esecuzione e la destinazione li supportano:

- `native` memorizza le modifiche della sessione live direttamente nella directory della sessione su un filesystem di destinazione compatibile POSIX. Nonostante il nome, si tratta di un **backend di persistenza live** e non è collegato all'installazione nativa. Non è disponibile su FAT32 o NTFS.
- DynFileFS crea uno storage ext4 espandibile basato su file. La dimensione selezionata rappresenta il massimo logico e non lo spazio riservato in anticipo. La dimensione predefinita è 4000 MiB.
- DynBlk crea un filesystem ext4 su un dispositivo a blocchi thin fornito dal driver kernel DynBlk. I dati della sessione sono supportati da file segmentati `volumeNNN.db` che vengono allocati secondo necessità, quindi la dimensione selezionata è un massimo logico e non un utilizzo preallocato del disco. L'installer imposta per default le nuove sessioni DynBlk a 16384 MiB. Per le sessioni DynBlk non cifrate, l'installer può selezionare un codec di compressione supportato sia dal sistema in esecuzione sia dall'initrd copiato sulla destinazione.
- VMDK utilizza il driver DynBlk per creare uno storage VMDK standard suddiviso e sparso (`volume.vmdk` e `volume-sNNN.vmdk`). Adotta lo stesso modello di allocazione thin e il valore predefinito di 16384 MiB di DynBlk, ma la compressione backend non è disponibile.
- Raw crea un'immagine ext4 a dimensione fissa e riserva subito la capacità selezionata. La dimensione predefinita è 4000 MiB.

LUKS2 è un layer di cifratura separato che può avvolgere lo storage di sessione Raw, DynFileFS, DynBlk o VMDK. L'installer raccoglie la passphrase confermata solo per la creazione della sessione e la invia a `minios-session` tramite input standard, senza inserirla negli argomenti della riga di comando, nei log o nella configurazione persistente. La passphrase sarà richiesta al momento dello sblocco della sessione cifrata all'avvio. LUKS2 è disponibile solo se l'ambiente in esecuzione e l'initrd copiato sulla destinazione dichiarano supporto compatibile. La compressione DynBlk viene disabilitata se si seleziona LUKS2.

DynBlk e lo storage di sessione VMDK non sono disponibili con UEFI Secure Boot attivo, poiché il modulo kernel esterno DynBlk utilizzato da questi backend non è firmato da MiniOS. I contenitori Raw sono limitati a 4000 MiB su FAT32; DynFileFS, DynBlk e lo storage VMDK suddiviso non dipendono da un singolo file che superi il limite di 4 GiB di FAT32, anche se si applicano comunque i limiti propri del backend e dello spazio libero.

Poiché l'installer crea e attiva la sessione selezionata sulla destinazione, non si affida a `perchmode` e `perchsize` per creare quello storage al primo avvio. Questi parametri di avvio descrivono comunque la creazione e selezione della persistenza guidata da initrd al di fuori del percorso di pre-creazione della sessione da parte dell'installer. Consulta [Gestione delle sessioni](/using-minios/Sessions-and-Persistence), [Persistenza initrd](/reference/boot-process/Persistence-Internals), e [Parametri di avvio](/reference/Boot-Parameters).

## Deployment da riga di comando

`minios-deploy` è pensato per automazione, test e ripristino. Il partizionamento manuale e la configurazione interattiva della rete cablata restano disponibili solo tramite GUI.

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

Esegui l'installazione reale solo dopo aver controllato il piano, l'identità della destinazione e l'output della simulazione. `--yes` autorizza le modifiche distruttive:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Se desideri deliberatamente una conversione nativa nello spazio libero esistente, usa le stesse opzioni di storage sia per la pianificazione che per l'installazione:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

La conversione nativa potrebbe non comparire nell'help CLI su un'immagine che non supporta l'installazione nativa. La CLI accetta anche opzioni di configurazione per account, localizzazione, fuso orario, tastiera, hostname, servizi e un set base di `config.conf`. Verifica le opzioni esatte fornite dall'immagine in esecuzione:

```bash
minios-deploy install --help
man minios-deploy
```

Evita `--password` e `--root-password` in ambienti condivisi perché gli argomenti in chiaro della riga di comando possono essere esposti nella cronologia della shell e nell'elenco dei processi. Usa invece l'installer grafico o un flusso di configurazione protetto.
