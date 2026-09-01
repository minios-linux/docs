---
updated: 2026-08-31
---

# Rufus

Rufus è un'utilità molto diffusa per Windows che aiuta a formattare e creare unità USB avviabili.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre attentamente l'unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell'unità

### Dimensione dell'unità

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Installazione di Rufus

1. **Scarica Rufus** dal [sito ufficiale](https://rufus.ie/)
2. **Avvia il programma** - Rufus non richiede installazione, è un'applicazione portatile

## Creazione di una chiavetta USB avviabile

Rufus può creare supporti MiniOS in due modi diversi. La modalità ISO normale è la scelta migliore quando si desidera che la chiavetta USB rimanga sia un normale filesystem scrivibile che un dispositivo di avvio.

### Metodo 1: modalità ISO

1. **Avvia Rufus** come amministratore.
2. **Seleziona la chiavetta USB** nel campo **Dispositivo**.
3. **Seleziona il file ISO di MiniOS** con **SELEZIONA**.
4. Quando Rufus chiede come scrivere l'immagine ibrida, lascia **Modalità immagine ISO**.
5. Scegli un filesystem adatto. FAT32 offre la massima compatibilità con il firmware; NTFS può limitare l'avvio UEFI diretto su alcuni sistemi.
6. Clicca su **AVVIA** e conferma la formattazione del dispositivo selezionato.

La modalità ISO estrae i file MiniOS su un filesystem normale. Dopo l'installazione, lo spazio libero rimanente può ancora essere utilizzato per file ordinari. Di solito, questa è la disposizione Rufus più comoda per una chiavetta MiniOS portatile.

### Metodo 2: modalità DD

Scegli la **modalità DD Image** solo quando desideri specificamente una copia esatta, blocco per blocco, dell’ISO pubblicato. Rufus riproduce quindi la struttura dell’ISO sull’intero dispositivo, in modo simile a `dd`, Etcher o alla modalità di scrittura di Utilità disco.

La modalità DD è semplice e prevedibile, ma il dispositivo non avrà più il normale layout con un singolo filesystem scrivibile, come ci si aspetta da una chiavetta USB generica.

## Risultato e persistenza

La modalità ISO crea supporti MiniOS basati su file su un filesystem normale e scrivibile. La modalità DD crea supporti immagine raw. Nessuna delle due modalità è una distribuzione tramite Installatore MiniOS, e nessuna crea automaticamente una sessione persistente.

La persistenza di MiniOS può utilizzare uno spazio di archiviazione scrivibile adatto su un’installazione Rufus basata su file quando viene selezionata una modalità di avvio persistente. Vedi [Modalità di avvio](/using-minios/Boot-Modes) e [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).
