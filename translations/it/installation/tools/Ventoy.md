# Utilizzo di Ventoy

Ventoy è uno strumento molto diffuso per creare unità USB avviabili che permette di memorizzare più file ISO su un unico dispositivo e avviare qualsiasi di essi.

## Importante

⚠️ **Attenzione:** La selezione errata del dispositivo comporta la perdita dei dati! Controlla sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

⚠️ **Requisito modalità di avvio:** Per far funzionare correttamente MiniOS con Ventoy, DEVI selezionare la **modalità GRUB2** all’avvio, oppure rinominare il file ISO aggiungendo il suffisso `VTGRUB2` (es. `minios-standard-amd64_VTGRUB2.iso`) per forzare automaticamente la modalità GRUB2.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md#system-requirements) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Installazione di Ventoy

### Metodo 1: Installazione standard

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l’installer di Ventoy** e seleziona la tua unità USB
3. **Installa Ventoy** sull’unità (tutti i dati verranno eliminati)
4. **Copia il file ISO di MiniOS** nella cartella principale dell’unità USB

Dopo l’installazione, l’unità sarà pronta all’uso. MiniOS creerà automaticamente lo spazio per il salvataggio delle modifiche.

### Metodo 2: Installazione con partizione dati separata (Consigliato)

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l’installer di Ventoy** e seleziona la tua unità USB  
3. **Abilita l’opzione "Riserva spazio"** durante l’installazione per creare una partizione aggiuntiva
4. **Installa Ventoy** sull’unità
5. **Copia il file ISO di MiniOS** nella cartella principale dell’unità USB
6. **Crea una partizione ext4** nello spazio riservato con etichetta `persistence`

Questo metodo garantisce operazioni sui dati più rapide e un maggiore controllo sullo spazio di archiviazione.

## Integrazione con MiniOS

MiniOS include il supporto integrato per Ventoy e rileva automaticamente quando viene eseguito in ambiente Ventoy. Il sistema configura automaticamente la persistenza delle modifiche senza ulteriori configurazioni da parte dell’utente.

### Persistenza automatica delle modifiche

MiniOS rileva automaticamente l’esecuzione in ambiente Ventoy e configura la persistenza delle modifiche:

- **Con partizione `persistence` separata**: Utilizza questa partizione per l’archiviazione diretta dei dati (modalità nativa, massima velocità)
- **Con installazione standard**: Crea un file dinamico nella partizione principale di Ventoy (modalità dynfilefs)

### Configurazione dei parametri (per utenti avanzati)

Quando è necessaria una configurazione precisa, è possibile utilizzare i parametri di avvio:

**Per partizione `persistence` separata (tutte le modalità disponibili):**
- `perchmode=native` - Salvataggio diretto sulla partizione (più veloce)
- `perchmode=dynfilefs` - File dinamico espandibile
- `perchmode=raw` - File a dimensione fissa

**Per installazione standard di Ventoy (due modalità disponibili):**
- `perchmode=dynfilefs` - File dinamico espandibile (predefinito, risparmia spazio)
- `perchmode=raw` - File a dimensione fissa

**Parametri comuni per i file:**
- `perchsize=8000` - Dimensione dello spazio dati in MB

Ulteriori dettagli in [parametri di avvio](/configuration/Boot-Parameters.md).

## Utilizzo di MiniOS con Ventoy

### Avvio

Dopo aver installato Ventoy e copiato il file ISO di MiniOS sull’unità:

1. **Avvia dal drive USB** - selezionalo nel BIOS/UEFI
2. **Seleziona MiniOS** dall’elenco dei file ISO disponibili nel menu di Ventoy
3. **⚠️ IMPORTANTE: Seleziona la modalità GRUB2** quando richiesto da Ventoy
4. **Attendi il caricamento** - il sistema verrà configurato automaticamente per l’uso

### **Requisiti modalità di avvio Ventoy**

**Per il corretto funzionamento di MiniOS:**
- **Modalità GRUB2** - Necessaria per il funzionamento corretto di MiniOS

**Soluzione alternativa:**
- Aggiungi il suffisso `VTGRUB2` al nome del file ISO (es. `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- In questo modo Ventoy utilizzerà automaticamente la modalità GRUB2 senza richiedere conferma
