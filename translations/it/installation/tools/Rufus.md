# Utilizzo di Rufus (Windows)

Rufus è un'utility molto diffusa per Windows che consente di formattare e creare unità USB avviabili.

## Importante

⚠️ **Attenzione:** Una selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre con attenzione l'unità selezionata ed effettua il backup dei dati importanti.

## Requisiti dell'unità

### Dimensione dell'unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

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

## Persistenza automatica delle modifiche

MiniOS rileva automaticamente il metodo di scrittura e configura la persistenza delle modifiche:

- **Modalità DD**: Se è disponibile spazio libero, verrà creata una partizione ext4 per massime prestazioni
- **Modalità ISO**: Utilizza un file dinamico per il salvataggio delle modifiche

### Configurazione dei parametri (per utenti avanzati)

Quando è necessaria una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (per modalità DD)
- `perchmode=dynfilefs` - File dinamicamente espandibile
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Dimensione dello spazio di archiviazione dati in MB

Dettagli in [parametri di avvio](/configuration/Boot-Parameters.md).
