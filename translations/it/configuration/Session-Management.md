# Gestione delle Sessioni in MiniOS 🔄

## 🤔 Cosa sono le Sessioni?

Le sessioni di MiniOS offrono uno spazio di archiviazione persistente per le tue modifiche, permettendoti di:

- **Salvare le modifiche** effettuate durante una sessione live
- **Riprendere il lavoro** da dove l’avevi lasciato dopo il riavvio
- **Gestire più** ambienti di lavoro separati
- **Passare tra** diverse configurazioni

Le sessioni utilizzano la tecnologia **Union Filesystem** (AUFS o OverlayFS) per sovrapporre le modifiche al sistema base in sola lettura.

---

## 📋 Tipi e Modalità di Sessione

### **Azioni Sessione**

- **`resume`** - Continua dall’ultima sessione utilizzata (predefinito)
- **`new`** - Crea una nuova sessione
- **`ask`** - Selezione interattiva della sessione durante l’avvio
- **`fresh`** - Nessuna persistenza (sessione temporanea)

### **Modalità di Archiviazione**

- **`native`** - Archiviazione diretta su filesystem (richiede filesystem POSIX: ext4, btrfs, xfs)
- **`dynfilefs`** - File contenitore espandibili (funziona su qualsiasi filesystem, consigliato per FAT32/NTFS/exFAT)
- **`raw`** - File immagine a dimensione fissa (funziona su qualsiasi filesystem)

---

## 🚀 Parametri di Avvio per il Controllo delle Sessioni

### **Parametri Principali della Sessione**

| Parametro | Valori | Descrizione |
|-----------|--------|-------------|
| `perch` | - | Abilita le modifiche persistenti |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Azione sessione o directory |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Modalità di archiviazione |
| `perchsize` | `<size_in_MB>` | Dimensione iniziale per modalità contenitore/immagine |

### **Struttura delle Directory di Sessione**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Integrazione con il Bootloader

### **Configurazione GRUB**

MiniOS fornisce voci di menu GRUB preconfigurate per le diverse modalità di sessione:

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **Configurazione SYSLINUX**

Voci corrispondenti per SYSLINUX:

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Comandi per la Gestione delle Sessioni

### **Utilizzo di MiniOS Session Manager (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Funzionalità:**
- Visualizza tutte le sessioni disponibili con i metadati
- Crea nuove sessioni con modalità differenti
- Attiva/cambia sessione
- Elimina sessioni vecchie
- Pulisci sessioni più vecchie di un certo numero di giorni

### **Utilizzo di minios-session (CLI)**

⚠️ **Privilegi Amministrativi Richiesti:**

Lo strumento CLI richiede privilegi root e li controllerà automaticamente. Esegui i comandi con `sudo` o tramite `pkexec`:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Comandi di Base:**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Opzioni Avanzate:**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Differenze Principali tra i Comandi:**

- `active` - Mostra la sessione che verrà utilizzata al prossimo avvio
- `running` - Mostra la sessione attualmente in uso (se presente)
- `resize` - Modifica la dimensione della sessione (solo per modalità dynfilefs/raw)
- `export` - Esporta la sessione in un archivio .tar.zst per backup
- `import` - Importa una sessione da archivio con eventuale conversione di modalità
- `copy` - Copia una sessione con eventuale conversione di modalità
- `info` - Verifica la compatibilità del filesystem e fornisce raccomandazioni

---

## 📦 Backup e Migrazione delle Sessioni

### **Esportazione delle Sessioni**

Esporta le sessioni in archivi compressi per backup o trasferimento:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Funzionalità:**
- Crea un archivio compresso .tar.zst
- Mantiene tutti i dati e i metadati della sessione
- Può essere importato su qualsiasi sistema MiniOS
- Compressione automatica per ottimizzare lo spazio

### **Importazione delle Sessioni**

Importa sessioni da archivi con conversione opzionale della modalità:

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Funzionalità:**
- Ripristina i dati della sessione dall’archivio
- Converte automaticamente tra modalità di archiviazione se specificato
- Salta i file già esistenti per evitare la perdita di dati
- Crea automaticamente un nuovo numero di sessione

### **Copia e Conversione delle Sessioni**

Copia le sessioni tra diverse modalità di archiviazione:

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Conversioni Supportate:**
- native ⇄ dynfilefs ⇄ raw
- Tutte le combinazioni di modalità supportate
- Gestione automatica della dimensione
- Mantiene i dati della sessione durante la conversione

**Casi d’Uso:**
- Migrazione da filesystem FAT32 a ext4 (dynfilefs → native)
- Creazione di sessioni portatili (native → dynfilefs/raw)
- Ottimizzazione per filesystem differenti
- Backup delle sessioni con modalità diverse

---

## 🏗️ Dettaglio delle Modalità di Archiviazione Sessione

### **Modalità Native**

**Ideale per:** Sistemi su filesystem POSIX (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Caratteristiche:**
- Accesso diretto al filesystem senza contenitore
- Piena compatibilità POSIX (hard link, permessi, attributi estesi)
- Migliori prestazioni tra tutte le modalità
- **Requisiti:** Filesystem compatibile POSIX (ext4, btrfs, xfs)
- **Non compatibile:** FAT32, NTFS, exFAT

### **Modalità DynFileFS**

**Ideale per:** Filesystem non POSIX (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Caratteristiche:**
- Contenitore espandibile con filesystem ext4 all’interno
- Si espande automaticamente fino allo spazio disponibile
- Funziona su qualsiasi tipo di filesystem
- Leggero overhead prestazionale rispetto alla modalità native
- **Dimensione predefinita:** 1000MB, espandibile dinamicamente
- **Consigliato per:** filesystem FAT32, NTFS, exFAT

### **Modalità Raw**

**Ideale per:** Esigenze a dimensione fissa su qualsiasi filesystem

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Caratteristiche:**
- Immagine a dimensione fissa con filesystem ext4 all’interno
- Utilizzo del disco prevedibile e costante
- Funziona su qualsiasi tipo di filesystem
- La dimensione deve essere specificata alla creazione
- **Dimensione predefinita:** 1000MB se non specificato
- **Casi d’uso:** Sessioni portatili, quote di archiviazione, allocazione spazio prevedibile

---

## 🗂️ Metadati e Compatibilità delle Sessioni

### **Formati dei Metadati di Sessione**

**Formato Predefinito (session.conf):**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**Formato JSON (se jq è disponibile):**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Nota:** MiniOS rileva automaticamente se `jq` è disponibile e utilizza il formato JSON quando possibile, altrimenti passa al formato conf tradizionale.

### **Verifica della Compatibilità**

MiniOS controlla automaticamente la compatibilità delle sessioni:

- **Versione diversa** - Crea una nuova sessione se la versione di MiniOS è differente
- **Edizione diversa** - Crea una nuova sessione se l’edizione è diversa (standard/toolbox/ultra)
- **Union FS diverso** - Crea una nuova sessione se il filesystem union è diverso (aufs/overlayfs)
- **Cambio modalità** - Crea una nuova sessione se cambia la modalità di archiviazione

### **Sistema di Avvisi**

Quando si selezionano sessioni non compatibili, MiniOS mostra degli avvisi:
- Avvisi di incompatibilità di versione
- Notifiche di edizione differente
- Problemi di compatibilità con il filesystem union
- Possibilità di procedere a rischio dell’utente

---

## 🎯 Configurazione Avanzata delle Sessioni

### **Percorsi Personalizzati delle Sessioni**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Gestione Dimensione Sessione**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Gestione automatica delle sessioni**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Risoluzione dei problemi delle sessioni

### **Problemi comuni**

#### **Sessione non trovata**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Problemi di autorizzazione**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Errori nella modalità di archiviazione**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Recupero sessione**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Pulizia delle sessioni**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Best practice per le sessioni

### **Scelta delle modalità di archiviazione**

- **Modalità nativa:** Usare quando MiniOS è su filesystem POSIX (ext4, btrfs, xfs) - migliori prestazioni
- **Modalità DynFileFS:** Usare per filesystem FAT32, NTFS, exFAT - gestione automatica dello spazio
- **Modalità raw:** Usare quando serve una dimensione fissa su qualsiasi filesystem - utilizzo disco prevedibile

### **Pianificazione delle dimensioni**

- **Sessioni piccole:** 1-2GB per modifiche di configurazione di base
- **Sviluppo:** 4-8GB per ambienti di sviluppo
- **Carichi di lavoro intensi:** 8GB+ per installazione software estesa

### **Gestione delle sessioni**

- Pulisci regolarmente le sessioni obsolete
- Usa nomi descrittivi per le sessioni nella gestione manuale
- Monitora l'utilizzo dello spazio su disco
- Mantieni almeno una sessione funzionante per il recupero

### **Ottimizzazione delle prestazioni**

- Usa la modalità nativa quando possibile per le migliori prestazioni
- Conserva le sessioni su dispositivi di archiviazione veloci
- Considera l'uso di SSD per le sessioni utilizzate frequentemente

---
