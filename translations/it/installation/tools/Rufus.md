# Utilizzo di Rufus (Windows)

Rufus è un'utility molto diffusa per Windows che consente di formattare e creare unità USB avviabili.

## Importante

⚠️ **Attenzione:** Una selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre con attenzione l'unità selezionata ed effettua il backup dei dati importanti.

## Requisiti dell'unità

### Dimensione del drive

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni dei drive.

## Installazione di Rufus

1. **Scarica Rufus** dal [sito ufficiale](https://rufus.ie/)
2. **Avvia il programma** - Rufus non richiede installazione, è un'applicazione portatile

## Creazione di una USB avviabile

Rufus offre due metodi per scrivere MiniOS su una unità USB:

### Metodo 1: Modalità DD (Consigliato)

1. **Avvia Rufus** come amministratore
2. **Seleziona l'unità USB** nel campo "Dispositivo"
3. **Seleziona il file ISO di MiniOS**:
   - Clicca sul pulsante "SELEZIONA"
   - Trova e seleziona il file ISO di MiniOS scaricato
4. **Scegli la modalità di scrittura**:
   - Nella finestra di dialogo "Immagine ISO ibrida rilevata", seleziona **"Scrivi in modalità immagine DD"**
5. **Avvia il processo**: clicca sul pulsante "AVVIA"
6. **Conferma l'operazione** - tutti i dati sull'unità verranno eliminati
7. **Attendi il completamento** del processo di scrittura

### Metodo 2: Modalità ISO (Alternativa)

1. **Avvia Rufus** come amministratore
2. **Seleziona l'unità USB** nel campo "Dispositivo"
3. **Seleziona il file ISO di MiniOS**:
   - Clicca sul pulsante "SELEZIONA"
   - Trova e seleziona il file ISO di MiniOS scaricato
4. **Scegli la modalità di scrittura**:
   - Nella finestra di dialogo "Immagine ISO ibrida rilevata", seleziona **"Scrivi in modalità immagine ISO"**
5. **Configura le impostazioni**:
   - **File system**: FAT32 (consigliato) oppure NTFS
   - ⚠️ **Se scegli NTFS**: l'avvio in modalità EFI potrebbe non essere disponibile
6. **Avvia il processo**: clicca sul pulsante "AVVIA"
7. **Conferma la formattazione** - tutti i dati sull'unità verranno eliminati

## Risultato e persistenza

La modalità DD esegue una scrittura raw dell'immagine e copia la struttura dell'ISO sull’intero dispositivo di destinazione. La modalità ISO formatta un filesystem ed estrae i contenuti dell’ISO per creare un supporto live basato su file. Nessuna delle due modalità rappresenta un deployment dell’installer di MiniOS, e Rufus non crea automaticamente una partizione ext4 o una sessione di persistenza.

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
