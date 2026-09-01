---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilità disco

Utilità disco è uno strumento grafico per scrivere immagini ISO MiniOS su unità USB.

**Installazione:** Disponibile di default in MiniOS, per altre distribuzioni vedi https://github.com/minios-linux/driveutility

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità (per scrittura MiniOS)

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### File system supportati

- **FAT32**: massima compatibilità
- **NTFS**: compatibilità con Windows
- **EXT4**: consigliato per Linux

## Avvio di Utilità disco

**Dal menu delle applicazioni:**
1. Apri il menu → Sistema → "Utilità disco"

**Dal terminale:**
```bash
driveutility
```

## Creazione di una chiavetta USB avviabile

1. **Seleziona la modalità "Scrivi"** nella finestra principale del programma
2. **Seleziona il file ISO di MiniOS:**
   - Clicca sul pulsante "Sfoglia" accanto al campo "Sorgente"
   - Trova e seleziona il file MiniOS.iso scaricato
3. **Seleziona l’unità di destinazione:**
   - Scegli la tua unità USB dall’elenco dei dispositivi
   - Verifica la selezione tramite dimensione e modello
4. **Avvia la scrittura:**
   - Clicca sul pulsante "Scrivi"
   - Conferma l’operazione: tutti i dati sull’unità verranno eliminati
5. **Attendi il completamento** - il processo richiederà alcuni minuti

## Risultato e persistenza

La modalità scrittura esegue una scrittura raw dell’immagine: copia la struttura dell’ISO sull’intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio inutilizzato, non avvia una sessione di persistenza e non esegue il deployment tramite Installatore MiniOS. Le opzioni del filesystem sopra riportate si applicano alle operazioni di Utilità disco che formattano un filesystem, non alla struttura delle partizioni copiata tramite scrittura ISO.

La persistenza viene attivata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno spazio di archiviazione scrivibile adatto. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sulle modifiche salvate.
