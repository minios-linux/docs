# Utilizzo di UNetbootin

UNetbootin è un'utility open-source multipiattaforma che consente di creare unità USB avviabili per diverse distribuzioni Linux, incluso MiniOS.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre attentamente l'unità selezionata ed esegui il backup dei dati importanti.

## Requisiti dell'unità

### Dimensione dell'unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

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

## Persistenza automatica delle modifiche

UNetbootin formatta automaticamente l’unità in FAT32, quindi MiniOS utilizzerà la modalità dynfilefs per il salvataggio delle modifiche. Questo garantisce la massima compatibilità con diversi sistemi, incluso il supporto all’avvio EFI.

### Configurazione dei parametri (per utenti avanzati)

Quando è necessaria una configurazione precisa, è possibile utilizzare i parametri di avvio:

- `perchmode=dynfilefs` - File espandibile dinamicamente (predefinito)
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Dimensione dello spazio di archiviazione dati in MB

Dettagli in [parametri di avvio](/configuration/Boot-Parameters.md).
