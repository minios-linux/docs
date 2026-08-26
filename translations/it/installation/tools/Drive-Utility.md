# Utilizzo di Drive Utility

Drive Utility è uno strumento grafico per scrivere immagini ISO di MiniOS su unità USB.

**Installazione:** Incluso di default in MiniOS, per altre distribuzioni vedi https://github.com/minios-linux/driveutility

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre attentamente l’unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell'unità (per la scrittura di MiniOS)

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### File system supportati

- **FAT32**: massima compatibilità
- **NTFS**: compatibilità con Windows
- **EXT4**: consigliato per Linux

## Avvio di Drive Utility

**Dal menu applicazioni:**
1. Apri il menu → Sistema → "Drive Utility"

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
   - Scegli la tua unità USB dall’elenco dispositivi
   - Verifica la selezione tramite dimensione e modello
4. **Avvia la scrittura:**
   - Clicca sul pulsante "Scrivi"
   - Conferma l’operazione – tutti i dati sull’unità verranno eliminati
5. **Attendi il completamento** – il processo richiederà alcuni minuti

## Risultato e persistenza

La modalità di scrittura esegue una scrittura raw dell'immagine: copia la struttura dell'ISO sull'intero dispositivo di destinazione. Non crea una partizione ext4 nello spazio inutilizzato, non crea una sessione di persistenza e non esegue un deployment dell'Installer di MiniOS. Le scelte del filesystem sopra indicate si applicano alle operazioni di Drive Utility che formattano un filesystem, non al layout delle partizioni copiato tramite scrittura ISO.

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede, e richiede comunque uno spazio di archiviazione scrivibile adeguato. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sulle modifiche salvate.
