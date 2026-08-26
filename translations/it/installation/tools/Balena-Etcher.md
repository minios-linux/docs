# Utilizzo di Balena Etcher

Balena Etcher è un programma multipiattaforma pratico per scrivere immagini ISO su unità USB. Compatibile con Windows, macOS e Linux.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre attentamente l’unità selezionata e fai il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione del drive

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni dei drive.

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

## Risultato e persistenza

Etcher esegue una scrittura raw dell'immagine: copia la struttura dell'ISO su tutto il dispositivo di destinazione. Non crea una partizione ext4 nello spazio inutilizzato, non crea una sessione di persistenza e non esegue un deployment dell'Installer di MiniOS.

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
