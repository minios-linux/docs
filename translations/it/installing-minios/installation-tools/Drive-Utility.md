---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilità disco

Utilità disco è un'utilità generica per dischi GTK inclusa con MiniOS. Permette di scrivere un'immagine disco esistente, creare un'immagine da un dispositivo fisico, formattare o cancellare un intero dispositivo. Non è limitata ai supporti MiniOS e non sostituisce l'Installatore MiniOS.

Aprila dal menu delle applicazioni sotto **Sistema**, oppure esegui:

```bash
driveutility
```

## Sicurezza

Scrivere un'immagine, formattare e cancellare sono operazioni distruttive. Verifica il dispositivo di destinazione per nome, modello e capacità prima di confermare. Conserva copie di backup di tutto ciò che è importante e scollega i dischi rimovibili non necessari quando possibile.

I dischi montati sono nascosti per impostazione predefinita. Puoi mostrarli esplicitamente, ma Utilità disco avvisa prima di operazioni distruttive e il backend tenta di smontare il dispositivo selezionato e le sue partizioni prima di modificarlo. Se lo stato di montaggio è ambiguo o un filesystem resta montato, l'operazione viene annullata invece di proseguire su un filesystem attivo.

## Scrivi un'immagine

**Scrivi** copia un'immagine byte per byte sul dispositivo selezionato. Se supportato, il backend rileva automaticamente input di immagini compresse.

Gli utilizzi tipici includono la scrittura di una ISO MiniOS su una chiavetta USB o SD e il ripristino di un'immagine di un intero dispositivo creata in precedenza.
Per una ISO MiniOS, si tratta di una scrittura raw. La partizione ISO e la struttura di avvio vengono copiate esattamente come presenti nell'immagine. Non **crea** una partizione dati aggiuntiva scrivibile, non crea una sessione persistente e non esegue un deployment gestito tramite Installatore MiniOS.

La persistenza dopo una scrittura raw dipende comunque dalla modalità di avvio e dallo spazio scrivibile reso disponibile dall'immagine risultante. Per un layout gestito o una sessione pre-creata, utilizza [Installatore MiniOS](/installing-minios/MiniOS-Installer).

Esempio CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Crea un'immagine del dispositivo

**Crea immagine** legge un dispositivo fisico e lo salva in un file immagine. Il file risultante può restare raw oppure essere compresso durante la scrittura.

Le opzioni di compressione supportate sono:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) quando è installato il supporto Python zstd richiesto

L'applicazione grafica può anche assegnare il file risultante all'utente desktop, così un backup creato da root è subito utilizzabile senza dover correggere i permessi.
Esempio CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

L'estensione specifica della compressione viene aggiunta automaticamente dal comando a riga di comando.

## Formatta un dispositivo

**Formatta** crea una nuova struttura a singolo filesystem sul dispositivo selezionato. Le opzioni di filesystem attualmente disponibili sono:

- FAT32
- exFAT
- NTFS
- ext4

Puoi impostare un'etichetta di volume. Per ext4, Utilità disco può assegnare la directory root all'utente e gruppo selezionati.

La formattazione è indipendente dalla scrittura di una ISO MiniOS. Le opzioni di filesystem in questa pagina si riferiscono all'operazione di formattazione di Utilità disco; non modificano la struttura del filesystem incorporata in una scrittura raw di una ISO.

Esempio CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Cancella un dispositivo

**Cancella** sceglie tra operazioni di cancellazione native del controller, discard/TRIM e sovrascritture lato host in base al dispositivo selezionato e al metodo richiesto.

I backend attualmente disponibili includono:

- **Cancellazione sicura** — seleziona automaticamente un metodo supportato dal controller quando disponibile.
- **ATA Secure Erase / Enhanced Secure Erase** — eseguito tramite UDisks2 per dischi SATA/ATA supportati; dispositivi congelati o non supportati vengono rifiutati.
- **NVMe User Data Erase / Cryptographic Erase** — utilizza NVMe Format NVM solo se il controller segnala la capacità richiesta.
- **Discard / secure discard** — utilizza `blkdiscard` quando il dispositivo a blocchi supporta il discard.
- **Sovrascrittura con zeri** — scrive zeri dal sistema host.
- **Sovrascrittura casuale** — scrive dati casuali per il numero di passaggi richiesto e può aggiungere un passaggio finale con zeri.

La cancellazione sicura tramite controller non equivale a sovrascrivere ripetutamente ogni blocco logico dal sistema host. La disponibilità dipende dal firmware del dispositivo, dalle interfacce del kernel, da UDisks2, `nvme-cli` e dal supporto di `blkdiscard`.
Per dispositivi NVMe, Utilità disco mantiene il formato LBA, le impostazioni dei metadati e delle informazioni di protezione della namespace attiva quando esegue Format NVM. Inoltre, rifiuta le operazioni del controller che possono interessare più namespace se non è possibile garantire che l'operazione sia sicura per una sola namespace.

Esempi:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Utilizza i controlli overwrite-pass e partial-size solo per i metodi tradizionali di sovrascrittura con zeri o dati casuali. La cancellazione tramite controller e discard avviene secondo il comando del dispositivo, non in base a una quantità di byte dal sistema host.

## Strumenti da riga di comando

Utilità disco installa quattro comandi di basso livello:

| Comando | Funzione |
|---|---|
| `driveutility-write` | Scrive un'immagine raw o compressa supportata su un dispositivo a blocchi. |
| `driveutility-read` | Crea un'immagine raw o compressa da un dispositivo a blocchi. |
| `driveutility-format` | Crea uno storage FAT32, exFAT, NTFS o ext4 su un dispositivo. |
| `driveutility-wipe` | Cancella tramite controller, discard o metodi di sovrascrittura. |

Tutti i comandi distruttivi devono essere eseguiti solo dopo aver verificato il dispositivo di destinazione esatto. Consulta le pagine man installate e `--help` per le opzioni specifiche della versione.

## Utilità disco rispetto a Installatore MiniOS

Usa **Utilità disco** quando l'operazione desiderata è un'azione generica su disco: scrittura raw di immagini, creazione di immagini dispositivo, formattazione o cancellazione.

Usa **Installatore MiniOS** quando vuoi un deployment consapevole di MiniOS con gestione di destinazione, scelta di filesystem e layout di avvio, selezione dei moduli, configurazione o creazione opzionale di una sessione live.

Per altri modi di mettere MiniOS su un supporto, vedi [Metodi di installazione](/installing-minios/Installation-Methods). Per salvare le modifiche dopo l'avvio, consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Sessioni e persistenza](/using-minios/Sessions-and-Persistence).
