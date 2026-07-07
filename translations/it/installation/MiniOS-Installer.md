# Utilizzo di MiniOS Installer

MiniOS Installer è uno strumento grafico per installare MiniOS su hard disk o unità USB con supporto UEFI/BIOS e compatibilità con diversi filesystem.

## Importante

⚠️ **Attenzione:** Una selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre due volte il dispositivo selezionato ed esegui il backup dei dati importanti.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

### Filesystem supportati

- **ext4** (consigliato per Linux)
- **Btrfs** (filesystem moderno con snapshot)
- **FAT32** (massima compatibilità)
- **NTFS** (compatibilità con Windows)

## Creazione dell’installazione

### Avvio di MiniOS Installer

**Dal menu delle applicazioni:**
1. Apri il menu → Sistema → "Installa MiniOS"

**Dal terminale:**
```bash
sudo minios-installer
```

### Procedura di installazione

1. **Configura le impostazioni di sistema (Opzionale ma consigliato):**
   - Clicca sul pulsante **"Configura MiniOS prima dell’installazione"**
   - Imposta le tue preferenze:
     - Lingua e localizzazione del sistema
     - Fuso orario e layout tastiera  
     - Account utente e password
     - Nome host e servizi di sistema
   - Salva e chiudi il configuratore
   
2. **Seleziona il dispositivo di destinazione:**
   - Scegli un hard disk o una chiavetta USB dall’elenco
   - Verifica dimensione e modello del dispositivo
   
3. **Seleziona il filesystem:**
   - **ext4**: consigliato nella maggior parte dei casi
   - **Btrfs**: per utenti avanzati
   - **FAT32**: per massima compatibilità
   
4. **Conferma la cancellazione del disco:**
   - Tutti i dati sul dispositivo selezionato saranno eliminati
   - Assicurati di aver selezionato il dispositivo corretto
   
5. **Avvia l’installazione:**
   - Clicca sul pulsante "Installa"
   - Attendi il completamento del processo
   
6. **Completamento:**
   - Riavvia il sistema
   - Rimuovi LiveUSB/LiveCD
   - **Risultato:** Il sistema si avvia con le impostazioni preconfigurate

## Configurazione pre-installazione

### Vantaggi dell’utilizzo del Configuratore MiniOS prima dell’installazione

**Flusso di lavoro consigliato per i nuovi utenti:**

1. **Configurazione unica**: Imposta tutte le preferenze di sistema una sola volta prima dell’installazione
2. **Pronto all’uso**: Il sistema installato si avvia con lingua, tastiera e impostazioni utente corrette
3. **Nessuna configurazione post-installazione**: Salta la configurazione manuale al primo avvio
4. **Esperienza coerente**: Stesse impostazioni su tutte le installazioni

**Opzioni di configurazione disponibili:**
- **🌍 Localizzazione**: Lingua di sistema, localizzazione e fuso orario
- **⌨️ Input**: Layout tastiera e opzioni di cambio  
- **👤 Account**: Nome utente, nome completo, password e gruppi utente
- **🖥️ Sistema**: Nome host, servizi abilitati/disabilitati
- **🔒 Sicurezza**: Configurazione password sicura prima della connessione a Internet

**Flusso di lavoro semplice:**
- Configura le tue preferenze una sola volta prima dell’installazione
- Installa MiniOS con le tue impostazioni personalizzate
- Avvia un sistema già completamente configurato

## Persistenza automatica delle modifiche

Dopo l’installazione, MiniOS Installer crea un sistema sul dispositivo selezionato:

- **Compatibilità UEFI/BIOS**: Creazione automatica delle partizioni di avvio necessarie
- **Persistenza delle modifiche**: Supporto completo per le modalità di persistenza di MiniOS
- **Filesystem**: Supporto per ext4, Btrfs, FAT32, NTFS

### Configurazione dei parametri (per utenti avanzati)

Per una configurazione precisa della persistenza, è possibile utilizzare i parametri di avvio:

- `perchmode=native` - Salvataggio diretto sulla partizione (quando c’è spazio libero)
- `perchmode=dynfilefs` - File espandibile dinamicamente
- `perchmode=raw` - File a dimensione fissa
- `perchsize=8000` - Dimensione dello spazio dati in MB

Dettagli nei [parametri di avvio](/configuration/Boot-Parameters.md).
