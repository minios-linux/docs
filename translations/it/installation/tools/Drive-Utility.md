# Utilizzo di Drive Utility

Drive Utility è uno strumento grafico per scrivere immagini ISO di MiniOS su unità USB.

**Installazione:** Incluso di default in MiniOS, per altre distribuzioni vedi https://github.com/minios-linux/driveutility

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre attentamente l’unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità (per scrittura di MiniOS)

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

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

## Persistenza automatica delle modifiche

Quando si scrive MiniOS tramite Drive Utility, viene creata una copia esatta dell’immagine ISO. MiniOS rileverà automaticamente il metodo di scrittura e configurerà la persistenza delle modifiche al primo avvio.

### Configurazione dei parametri (per utenti avanzati)

Per una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (se spazio disponibile)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Dimensione dello spazio dati in MB

Dettagli nei [parametri di avvio](/configuration/Boot-Parameters.md).
