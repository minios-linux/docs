---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilità disco

Utilità disco è un’utilità disco generica per GTK inclusa con MiniOS. Può scrivere un’immagine disco esistente, creare un’immagine da un dispositivo fisico, formattare un intero dispositivo o cancellarlo. Non è limitata ai supporti MiniOS e non sostituisce l’Installatore MiniOS.

Aprila dal menu delle applicazioni, alla voce **Sistema**, oppure esegui:

```bash
driveutility
```

## Sicurezza

La scrittura di un’immagine, la formattazione e la cancellazione sono operazioni distruttive. Prima di confermare, verifica il dispositivo di destinazione, il modello e la capacità. Conserva copie di backup di tutto ciò che è importante e, quando possibile, scollega le unità rimovibili non coinvolte.

Per impostazione predefinita, i dischi montati sono nascosti. Puoi mostrarli esplicitamente, ma Utilità disco avvisa prima di eseguire operazioni distruttive e il backend tenta di smontare il dispositivo selezionato e le relative partizioni prima di modificarlo. Se lo stato di montaggio non è chiaro o un filesystem rimane montato, l’operazione non prosegue e viene interrotta, anziché continuare con un filesystem attivo.

## Scrivere un’immagine

**Scrivi** copia un’immagine byte per byte sul dispositivo selezionato. Se supportato, il backend rileva i file immagine compressi.

Tra gli usi più comuni: scrivere un’immagine ISO MiniOS su un supporto USB o SD e ripristinare un’immagine di un intero dispositivo creata in precedenza.
Con un’immagine ISO MiniOS, si tratta di una scrittura dell’immagine in formato raw. Copia esattamente la partizione e la struttura di avvio dell’ISO così come sono memorizzate nell’immagine. **non** crea una partizione dati aggiuntiva scrivibile, una sessione di persistenza né esegue una distribuzione gestita dell’Installatore MiniOS.

La persistenza dopo una scrittura raw dipende comunque dalla modalità di avvio e dallo spazio di archiviazione scrivibile disponibile nell’immagine risultante. Per una struttura di destinazione gestita o una sessione precreata, usa [Installatore MiniOS](/installing-minios/MiniOS-Installer).

Esempio da CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Creare un’immagine del dispositivo

**Crea immagine** legge i dati di un dispositivo fisico e li salva in un file immagine. Il file risultante può rimanere in formato raw oppure essere compresso durante la scrittura.

Formati di compressione supportati:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) se è installato il supporto Python zstd richiesto

L’applicazione grafica può anche assegnare il file risultante all’utente desktop, così che un backup creato con privilegi di root sia subito utilizzabile senza dover correggere separatamente i permessi.
Esempio da CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

Il lettore da riga di comando aggiunge automaticamente l’estensione specifica del formato di compressione.

## Formattare un dispositivo

**La formattazione** crea un nuovo layout con un singolo filesystem sul dispositivo selezionato. I filesystem attualmente disponibili sono:

- FAT32
- exFAT
- NTFS
- ext4

Puoi impostare un'etichetta per il volume. Per ext4, Utilità disco può assegnare la directory radice all'utente e al gruppo selezionati.

La formattazione è indipendente dalla scrittura di un'immagine ISO MiniOS. I filesystem disponibili in questa pagina si riferiscono all'operazione di formattazione di Utilità disco; non modificano il layout del filesystem incluso nella scrittura di un'ISO raw.

Esempio CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Cancellare un dispositivo

**La cancellazione** sceglie tra le operazioni di cancellazione native del controller, discard/TRIM e sovrascritture eseguite dal sistema host, in base al dispositivo selezionato e al metodo richiesto.

I metodi attualmente disponibili includono:

- **Cancellazione sicura** — seleziona automaticamente un metodo supportato dal controller, se disponibile.
- **Cancellazione sicura ATA / Cancellazione sicura avanzata ATA** — eseguita tramite UDisks2 per le unità SATA/ATA supportate; i dispositivi bloccati o non supportati vengono rifiutati.
- **Cancellazione dei dati utente NVMe / Cancellazione crittografica** — usa NVMe Format NVM solo se il controller dichiara di supportare la funzionalità richiesta.
- **Discard / discard sicuro** — usa `blkdiscard` se il dispositivo a blocchi supporta discard.
- **Sovrascrittura con zeri** — scrive zeri dal sistema host.
- **Sovrascrittura con dati casuali** — scrive dati casuali per il numero di passaggi richiesto e può aggiungere un passaggio finale con zeri.

La cancellazione sicura eseguita dal controller non equivale a sovrascrivere ripetutamente ogni blocco logico dal sistema host. La disponibilità dipende dal firmware del dispositivo, dalle interfacce del kernel, da UDisks2, `nvme-cli` e dal supporto di `blkdiscard`.
Per i dispositivi NVMe, Utilità disco mantiene il formato LBA dello spazio dei nomi attivo, l'impostazione dei metadati e quella delle informazioni di protezione quando esegue Format NVM. Inoltre, rifiuta le operazioni del controller che possono interessare più spazi dei nomi quando non è possibile garantire che il dispositivo di destinazione sia sicuro come operazione su un singolo spazio dei nomi.

Esempi:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Usa i controlli per il numero di passaggi di sovrascrittura e per la dimensione parziale solo con i metodi tradizionali con zeri o dati casuali. La cancellazione del controller e discard vengono eseguiti in base al comando del dispositivo, non a un numero di byte specificato dal sistema host.

## Strumenti da riga di comando

Utilità disco installa quattro comandi di livello inferiore:

| Comando | Scopo |
|---|---|
| `driveutility-write` | Scrive un'immagine raw o compressa supportata su un dispositivo a blocchi. |
| `driveutility-read` | Crea un'immagine raw o compressa da un dispositivo a blocchi. |
| `driveutility-format` | Crea un filesystem FAT32, exFAT, NTFS o ext4 su un dispositivo. |
| `driveutility-wipe` | Cancella tramite controller, discard o sovrascrittura. |

Esegui i comandi distruttivi solo dopo aver verificato con precisione il dispositivo di destinazione. Consulta le pagine man installate e l'output di `--help` per le opzioni specifiche della versione.

## Utilità disco o Installatore MiniOS

Usa **Utilità disco** quando vuoi eseguire un'operazione generica sul disco: scrivere un'immagine raw, creare un'immagine di un dispositivo, formattare o cancellare.

Usa **Installatore MiniOS** quando vuoi eseguire un'installazione compatibile con MiniOS, controllando il posizionamento, il filesystem e il layout di avvio, la selezione dei moduli, la configurazione o la creazione facoltativa di una sessione live.

Per altri modi di installare MiniOS su un supporto, consulta [Metodi di installazione](/installing-minios/Installation-Methods). Per salvare le modifiche dopo l'avvio, consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Sessioni e persistenza](/using-minios/Sessions-and-Persistence).
