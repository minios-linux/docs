---
updated: 2026-08-31
---

# Rufus

Rufus è una popolare utility per Windows che consente di formattare e creare unità USB avviabili.

## Importante

**Attenzione:** La scelta del dispositivo errato comporta la perdita dei dati! Controlla sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensioni dell’unità

Consulta [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per informazioni dettagliate sui requisiti di sistema e sulle dimensioni delle unità.

## Installazione di Rufus

1. **Scarica Rufus** dal [sito ufficiale](https://rufus.ie/)
2. **Avvia il programma** - Rufus non richiede installazione: è un'applicazione portatile

## Creazione di un'unità USB avviabile

Rufus può creare supporti MiniOS in due modi diversi. La modalità ISO standard è la scelta migliore se vuoi che l'unità USB rimanga un normale filesystem scrivibile, oltre che un dispositivo di avvio.

### Metodo 1: modalità ISO

1. **Avvia Rufus** come amministratore.
2. **Seleziona l'unità USB** nel campo **Dispositivo** .
3. **Seleziona il file ISO MiniOS** con **SELEZIONA**.
4. Quando Rufus chiede come scrivere l'immagine ibrida, mantieni **Modalità immagine ISO**.
5. Scegli un filesystem adatto. FAT32 offre la massima compatibilità con il firmware; NTFS può limitare l'avvio UEFI diretto su alcuni sistemi.
6. Fai clic su **AVVIA** e conferma la formattazione del dispositivo selezionato.

La modalità ISO estrae i file MiniOS su un filesystem normale. Al termine dell'installazione, lo spazio libero rimanente può essere usato per i normali file. Di solito è la configurazione Rufus più pratica per un'unità MiniOS portatile.

### Metodo 2: modalità DD

Scegli **Modalità immagine DD** solo se vuoi ottenere una copia esatta, blocco per blocco, dell'ISO pubblicata. Rufus riproduce quindi la struttura dell'ISO sull'intero dispositivo, come fanno `dd`, Etcher o la modalità di scrittura dell'Utilità disco.

La modalità DD è semplice e prevedibile, ma il dispositivo non presenta più la normale struttura con un unico filesystem scrivibile, tipica di un'unità flash multiuso.

## Risultato e persistenza

La modalità ISO crea supporti MiniOS basati su file, su un normale filesystem scrivibile. La modalità DD crea supporti con immagini raw. Nessuna delle due modalità esegue il deployment di un Installatore MiniOS, né crea automaticamente una sessione persistente.

La persistenza MiniOS può utilizzare uno spazio di archiviazione scrivibile adeguato su un'installazione Rufus basata su file, se è selezionata una modalità di avvio persistente. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).
