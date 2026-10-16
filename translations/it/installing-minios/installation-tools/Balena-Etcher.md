---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher è un pratico programma multipiattaforma per scrivere immagini ISO su unità USB. È compatibile con Windows, macOS e Linux.

## Importante

**Attenzione:** La selezione di un dispositivo errato comporta la perdita dei dati. Controlla sempre due volte l'unità selezionata e fai un backup dei dati importanti.

## Requisiti dell'unità

### Dimensioni dell'unità

Consulta [la guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Preparazione

1. Scarica Balena Etcher dal [sito ufficiale](https://www.balena.io/etcher/)
2. Installa il programma sul tuo sistema operativo
3. Collega l'unità USB

## Creazione di un'unità USB avviabile

1. Avvia Balena Etcher
2. Seleziona l'immagine ISO MiniOS:
   - Fai clic su "Flash from file"
   - Specifica il percorso del file ISO
3. Seleziona l'unità USB di destinazione:
   - Fai clic su "Select target"
   - Controlla il modello e la capacità del dispositivo
4. Avvia la scrittura:
   - Fai clic su "Flash!"
   - Attendi il completamento del processo (5–15 minuti)

## Risultato e persistenza

Etcher scrive l'immagine in modalità raw: copia la struttura dell'ISO sull'intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio inutilizzato, non crea una sessione di persistenza e non esegue il deployment dell'Installatore MiniOS.

La persistenza viene abilitata solo quando una voce di avvio o la riga di comando del kernel la richiede e necessita comunque di spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
