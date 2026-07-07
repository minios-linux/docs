# Guida ai Menu di Avvio di MiniOS

MiniOS offre un sistema di menu di avvio avanzato che ti permette di scegliere come avviare e utilizzare il sistema. Questa guida spiega le opzioni di avvio disponibili e come personalizzarle.

## Panoramica

MiniOS utilizza GRUB come bootloader principale, offrendo un'interfaccia grafica con supporto multilingue. Su sistemi BIOS più datati, può essere utilizzato SYSLINUX come alternativa. Entrambi i bootloader offrono le stesse funzionalità con interfacce leggermente diverse.

## Opzioni del Menu di Avvio

### 1. Riprendi Sessione Precedente

**Cosa fa:** Tenta di continuare dalla tua ultima sessione, adattandosi automaticamente in base allo spazio di archiviazione disponibile.

- **Quando usarla:** Questa è l'opzione predefinita - adatta alla maggior parte degli utenti nella maggior parte delle situazioni
- **Cosa succede:**
  - **Su supporti scrivibili con sessione esistente:** Ripristina i tuoi file, applicazioni e impostazioni salvate
  - **Su supporti scrivibili senza sessione:** Crea automaticamente la prima sessione (sessione n°1)
  - **Su supporti in sola lettura (DVD, CD):** Funziona come "Avvio da Zero" poiché non è disponibile spazio di archiviazione
  - **Se la sessione è incompatibile:** Crea una nuova sessione (es. quando si utilizza una versione diversa di MiniOS)
  - Il sistema gestisce automaticamente i controlli di compatibilità e le limitazioni di spazio
- **Risultato:** Avrai sempre un sistema funzionante, ottimizzato per il tipo di archiviazione utilizzato

### 2. Avvia una Nuova Sessione

**Cosa fa:** Crea un nuovo ambiente di lavoro mantenendo tutte le sessioni esistenti disponibili.

- **Quando usarla:** Quando vuoi un ambiente pulito per lavori diversi o test
- **Cosa succede:**
  - Crea una nuova sessione numerata (es. se avevi la sessione 1, crea la sessione 2)
  - Avvia un desktop pulito
  - Tutte le nuove modifiche verranno salvate nella nuova sessione
  - Tutte le sessioni esistenti rimangono inalterate e disponibili per il passaggio
- **Nota:** Puoi passare tra le sessioni utilizzando l'opzione "Scegli sessione all'avvio"

### 3. Scegli Sessione all'Avvio

**Cosa fa:** Mostra un menu interattivo per selezionare tra le sessioni esistenti o crearne una nuova.

- **Quando usarla:** Quando hai più sessioni e vuoi scegliere quale utilizzare
- **Cosa succede:**
  - Mostra una finestra di dialogo all'avvio con l'elenco delle sessioni disponibili
  - Visualizza informazioni sulla sessione (numero, ultimo accesso, spazio su disco)
  - Opzioni per riprendere una sessione esistente o avviarne una nuova
  - Permette di selezionare diversi dispositivi di archiviazione se disponibili
- **Vantaggi:** Controllo totale su quale sessione utilizzare, ideale per chi gestisce più ambienti di lavoro

### 4. Avvio da Zero

**Cosa fa:** Avvia MiniOS senza salvare alcuna modifica.

- **Quando usarla:**
  - Per testare il sistema su supporti scrivibili senza influire sulle sessioni esistenti
  - Per la risoluzione dei problemi senza modificare i dati salvati
  - Massima privacy (nessun dato viene salvato)
  - Quando vuoi assicurarti che non vengano apportate modifiche permanenti
- **Cosa succede:**
  - Avvio più rapido
  - Le modifiche vengono perse allo spegnimento
  - Nessun accesso ai dispositivi di archiviazione per la persistenza
- **Nota:** Quando si avvia da supporti in sola lettura (DVD, CD), "Riprendi Sessione Precedente" si comporta automaticamente come "Avvio da Zero" poiché non è disponibile spazio per le sessioni

### 5. Copia in RAM

**Cosa fa:** Carica l'intero sistema nella memoria del computer per prestazioni massime.

- **Quando usarla:**
  - Hai molta RAM disponibile (consigliati almeno 4GB)
  - Vuoi le massime prestazioni possibili
  - Devi rimuovere la chiavetta USB dopo l'avvio
  - Lavori con applicazioni intensive
- **Cosa succede:**
  - Copia tutti i file di sistema nella RAM durante l'avvio
  - La chiavetta USB può essere rimossa dopo il caricamento
  - Il sistema funziona interamente dalla memoria
  - Tempi di risposta più rapidi per tutte le operazioni
- **Requisiti:** RAM sufficiente per contenere l'intero sistema

Per opzioni avanzate `toram` e tecniche di ottimizzazione della memoria, vedi **[Ottimizzazione delle Prestazioni](/administration/Performance-Optimization.md)**.

## Come Usare il Menu di Avvio

### Navigazione nel Menu

- Usa i **tasti freccia** per spostarti tra le opzioni
- Premi **Invio** per selezionare un'opzione
- Premi **Esc** per tornare al menu precedente (in GRUB)
- Il menu selezionerà automaticamente l'opzione predefinita dopo 10 secondi

### Selezione Lingua (GRUB)

Se la tua chiavetta USB MiniOS supporta più lingue:
1. La prima schermata mostrerà le opzioni di lingua
2. Seleziona la lingua preferita
3. Il menu di avvio apparirà nella lingua scelta
4. Tutti i messaggi successivi del sistema utilizzeranno questa lingua

⚠️ **Importante:** Il menu multilingue ha la precedenza su qualsiasi impostazione locale specificata in `config.conf`. La lingua selezionata nel menu di avvio prevale sulle impostazioni locali preconfigurate. Consulta **[File di Configurazione](/configuration/Configuration-File.md)** e **[live-config](/configuration/live-config.md)** per dettagli sui file di configurazione del sistema.

## Personalizzazione delle Opzioni di Avvio

### Modifica Temporanea dei Parametri di Avvio

Puoi modificare le opzioni di avvio per una singola sessione:

**In GRUB:**
1. Seleziona l'opzione di menu che vuoi modificare
2. Premi **'e'** per modificare
3. Vai alla riga che inizia con `linux`
4. Aggiungi o modifica i parametri alla fine della riga
5. Premi **Ctrl+X** o **F10** per avviare con le modifiche

**In SYSLINUX:**
1. Seleziona l'opzione di menu desiderata
2. Premi **Tab** prima di premere Invio
3. Aggiungi i parametri nella riga di comando che appare
4. Premi **Invio** per avviare

### Modifiche Comuni ai Parametri di Avvio

- `debug` - Mostra messaggi dettagliati durante l'avvio (utile per la diagnostica)
- `toram=trim` - Copia solo i file essenziali in RAM (quando il `toram` completo usa troppa memoria)
- `perchsize=2000` - Imposta la dimensione dello storage della sessione a 2GB (modifica secondo necessità)
- `locale=ru_RU.UTF-8` - Forza una lingua/locale specifica

Per l'elenco completo dei parametri di avvio disponibili, consulta **[Parametri di Avvio](/configuration/Boot-Parameters.md)**.

## Posizione dei File di Configurazione

### Sulla tua Chiavetta USB MiniOS

- **Configurazione GRUB:** `/minios/boot/grub/grub.cfg`
- **Configurazione SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Immagini di avvio:** `/minios/boot/bootlogo.png`
- **File lingua:** `/minios/boot/grub/locale/`

### Nel Sistema in Esecuzione

- **Parametri di avvio correnti:** `/proc/cmdline`
- **Directory dati MiniOS:** `/run/initramfs/memory/data/minios/`

### Modifica dei File di Configurazione

⚠️ **Attenzione:** Modifica i file di configurazione di avvio solo se sai cosa stai facendo. Cambiamenti errati possono rendere la chiavetta USB non avviabile.

**Per modificare la configurazione di GRUB:**
1. Monta la chiavetta USB MiniOS
2. Vai su `/minios/boot/grub/`
3. Modifica `grub.cfg` con un editor di testo
4. Salva ed espelli in modo sicuro la chiavetta USB

**Modifiche comuni:**
- Modifica `set timeout=10` per cambiare il tempo di attesa del menu
- Cambia `set default=0` per modificare l'opzione predefinita del menu
- Aggiungi voci personalizzate al menu
