# Utilizzo di Balena Etcher

Balena Etcher è un programma multipiattaforma pratico per scrivere immagini ISO su unità USB. Compatibile con Windows, macOS e Linux.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre attentamente l’unità selezionata e fai il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Preparazione

1. Scarica Balena Etcher dal [sito ufficiale](https://www.balena.io/etcher/)
2. Installa il programma sul tuo sistema operativo
3. Collega l’unità USB

## Creazione dell’unità USB avviabile

1. Avvia Balena Etcher
2. Seleziona l’immagine ISO di MiniOS:
   - Clicca su "Flash from file"
   - Specifica il percorso del file ISO
3. Seleziona l’unità USB di destinazione:
   - Clicca su "Select target"
   - Verifica modello e dimensione del dispositivo
4. Avvia la scrittura:
   - Clicca su "Flash!"
   - Attendi il completamento del processo (5–15 minuti)

## Persistenza automatica delle modifiche

Al primo avvio, MiniOS controllerà il tipo di file system dell’unità e sceglierà la modalità di persistenza delle modifiche ottimale. Se è disponibile spazio libero, il sistema creerà automaticamente una partizione ext4 per prestazioni massime.

### Configurazione dei parametri (per utenti esperti)

Quando è necessaria una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (predefinito, più veloce)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Spazio di archiviazione dati in MB per i file immagine

Dettagli in [parametri di avvio](/configuration/Boot-Parameters.md).
