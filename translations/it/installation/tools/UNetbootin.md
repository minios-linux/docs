---
updated: 2026-08-26
---

# Utilizzo di UNetbootin

UNetbootin è un'utility open-source multipiattaforma che consente di creare unità USB avviabili per diverse distribuzioni Linux, incluso MiniOS.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre due volte l'unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell'unità

### Dimensione del drive

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni dei drive.

## Installazione di UNetbootin

1. **Scarica UNetbootin** dal [sito ufficiale](https://unetbootin.github.io/)
2. **Installa il programma** sul tuo sistema:
   - **Windows**: Esegui l’installer come amministratore
   - **Linux**: Installa dal repository o usa AppImage
   - **macOS**: Trascina l’applicazione nella cartella Applicazioni

## Creazione di una USB avviabile

1. **Avvia UNetbootin** come amministratore/root
2. **Seleziona la sorgente dell’immagine:**
   - Imposta l’opzione su "Disk image"
   - Clicca sul pulsante "..." e seleziona il file ISO di MiniOS
3. **Seleziona il dispositivo di destinazione:**
   - Nell’elenco "Drive", seleziona la tua unità USB
   - Assicurati di aver selezionato il dispositivo corretto
4. **Avvia il processo:** Clicca su "OK"
5. **Attendi il completamento** – il processo può richiedere 10-20 minuti

## Risultato e persistenza

UNetbootin estrae i file e installa i file di avvio sul filesystem selezionato, creando un supporto live basato su file invece di eseguire una scrittura raw dell'immagine o un'installazione tramite MiniOS Installer. Il suo utilizzo non garantisce la formattazione FAT32, il supporto EFI o la persistenza.

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
