# Gestione del Kernel in MiniOS 🔧

## 🤔 Perché sostituire il Kernel?

MiniOS viene fornito con un kernel predefinito, ma ci sono diversi motivi per cui potresti volerlo sostituire:

### 🔧 **Diverse varianti del kernel Debian**

Debian offre diverse varianti di kernel ottimizzate per differenti casi d'uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel standard per sistemi a 64 bit (predefinito in MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel real-time per applicazioni critiche in tempo reale
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Ottimizzato per ambienti cloud e virtualizzati

> **📝 Nota:** I numeri di versione (come `6.12.38+deb13`) cambiano con gli aggiornamenti. Per trovare i kernel attualmente disponibili:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### 🎯 **Casi d’uso specializzati**

- **Calcolo real-time** - Kernel RT per produzione audio, controllo industriale
- **Gaming e bassa latenza** - Kernel personalizzati con ottimizzazioni per il gaming
- **Rafforzamento della sicurezza** - Kernel con patch di sicurezza aggiuntive (grsecurity, ecc.)
- **Compatibilità hardware** - Kernel più recenti per supporto a hardware di ultima generazione
- **Ottimizzazione delle prestazioni** - Kernel compilati su misura con ottimizzazioni specifiche

### 🛠️ **Funzionalità personalizzate del kernel**

- **Patch personalizzate** - Applica patch specifiche per il tuo hardware o caso d’uso
- **Moduli kernel** - Aggiungi supporto per hardware o filesystem specializzati
- **Ottimizzazioni del compilatore** - Compila con diversi flag di ottimizzazione
- **Ottimizzazione delle dimensioni** - Rimuovi driver non necessari per ridurre la dimensione del kernel

### 📈 **Scenari comuni**

- **Workstation per produzione audio** - Usa kernel RT per latenza audio minima
- **Sistemi gaming** - Applica patch e ottimizzazioni specifiche per il gaming
- **Ambienti server** - Usa kernel ottimizzati per il cloud per una migliore virtualizzazione
- **Hardware legacy** - Usa kernel più vecchi per la compatibilità con sistemi datati
- **Sistemi di sviluppo** - Testa applicazioni su diverse versioni di kernel

---

## ⚙️ Panoramica di MiniOS Kernel Manager

MiniOS mette a disposizione due strumenti per la gestione dei kernel:

1. **🖥️ MiniOS Kernel Manager (GUI):** Un’applicazione grafica intuitiva per il packaging, l’installazione e la gestione dei kernel
2. **⌨️ minios-kernel (CLI):** Uno strumento da linea di comando per utenti avanzati e automazione

Entrambi gli strumenti gestiscono automaticamente:
- **Packaging del kernel** in formato SquashFS
- **Generazione dell’initramfs** con i driver e gli script di avvio corretti
- **Installazione** nel repository kernel di MiniOS
- **Aggiornamento della configurazione del bootloader**
- **Attivazione** e cambio del kernel

### ⚠️ **Considerazioni importanti:**

- **🔑 Privilegi amministrativi:** Entrambi gli strumenti richiedono privilegi amministrativi e richiederanno autenticazione tramite PolicyKit
- **🔗 Compatibilità kernel:** Assicurati che i kernel siano compatibili con MiniOS. Si raccomanda l’uso dei kernel del repository
- **💾 Directory MiniOS:** Gli strumenti rilevano automaticamente la directory MiniOS (`/minios/`) e verificano i permessi di scrittura
- **🔄 Aggiornamenti automatici:** Le configurazioni del bootloader vengono aggiornate automaticamente quando i kernel vengono attivati

---

## 🖥️ Metodo 1: utilizzo di MiniOS Kernel Manager (GUI)

Il gestore grafico dei kernel offre un’interfaccia intuitiva per tutte le operazioni sui kernel.

### 📝 **Passaggi:**

#### 1. 🚀 **Avvia l’applicazione**

```bash
minios-kernel-manager
```

Oppure cerca "MiniOS Kernel Manager" nel menu delle applicazioni.

#### 2. 📦 **Crea un nuovo pacchetto kernel**

**Utilizzando la scheda Package Kernel:**

1. **Seleziona la sorgente del kernel:**
   - **Pacchetto manuale:** Sfoglia e seleziona un pacchetto kernel `.deb` locale
   - **Repository:** Scegli tra i kernel disponibili nei repository Debian/Ubuntu

2. **Configura la compressione:**
   - Seleziona la compressione SquashFS: `zstd` (consigliato), `lz4`, `lzo`, `xz` o `gzip`

3. **Crea il pacchetto kernel:**
   - Clicca sul pulsante "Package Kernel"
   - Monitora l’avanzamento nel log di packaging
   - I file vengono installati automaticamente nel repository di MiniOS

#### 3. 🔄 **Gestisci i kernel installati**

**Utilizzando la scheda Manage Kernels:**

1. **Visualizza i kernel disponibili:**
   - Visualizza tutti i kernel pacchettizzati con badge di stato:
     - **ACTIVE:** Kernel attualmente configurato
     - **RUNNING:** Kernel attualmente in esecuzione
     - **AVAILABLE:** Disponibile per l’attivazione

2. **Attiva un kernel:**
   - Clicca col tasto destro su un kernel e seleziona "Activate Kernel"
   - Conferma la finestra di dialogo di attivazione
   - La configurazione del bootloader viene aggiornata automaticamente

3. **Elimina un kernel:**
   - Clicca col tasto destro su un kernel inattivo e seleziona "Delete Kernel"
   - Conferma l’eliminazione (operazione irreversibile)

---

## ⌨️ Metodo 2: utilizzo di minios-kernel (CLI)

Lo strumento da linea di comando offre funzionalità di gestione kernel automatizzabili tramite script.

### ⚠️ **Privilegi amministrativi richiesti:**

Lo strumento CLI richiede privilegi root e li verificherà automaticamente. Esegui i comandi con `sudo` o tramite `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### 📝 **Comandi di base:**

#### 1. 📋 **Elenca i kernel disponibili**

```bash
sudo minios-kernel list
```

Mostra tutti i kernel pacchettizzati con il loro stato.

#### 2. 📦 **Crea un pacchetto kernel**

**Dal repository:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Da file .deb locale:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Con compressione personalizzata:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Attiva un kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Elimina un kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Verifica lo stato**

```bash
sudo minios-kernel status
```

Mostra lo stato della directory MiniOS e le informazioni sul kernel attuale.

#### 6. ℹ️ **Mostra informazioni sul kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Mostra informazioni dettagliate su uno specifico kernel, incluso stato e disponibilità.

### 🔧 **Opzioni CLI avanzate:**

#### **Output JSON (per scripting):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Opzioni avanzate di packaging:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Aiuto e utilizzo:**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## 🔧 Risoluzione dei problemi

### Problemi comuni e soluzioni:

#### **🚫 Directory MiniOS non trovata**

- **Causa:** Gli strumenti non riescono a individuare la directory MiniOS
- **Soluzione:** Assicurati di essere su un sistema MiniOS o che la chiavetta USB sia correttamente montata
- **Verifica:** Esegui `sudo minios-kernel status` per verificare il rilevamento della directory

#### **🔒 Permesso negato**

- **Causa:** La directory MiniOS è in sola lettura o i permessi sono insufficienti
- **Soluzione:** Assicurati di avere privilegi amministrativi e che il filesystem sia scrivibile
- **Verifica:** Controlla lo stato della directory MiniOS tramite GUI o CLI

#### **📦 Installazione pacchetto fallita**

- **Causa:** Pacchetto corrotto, problemi di rete o dipendenze mancanti
- **Soluzione:** 
  - Verifica l’integrità del file del pacchetto
  - Controlla la connessione di rete per i pacchetti da repository
  - Aggiorna le liste dei pacchetti: `sudo apt update`

#### **💥 Kernel panic dopo l’attivazione**

- **Causa:** Kernel incompatibile o driver mancanti
- **Soluzione:** 
  - Avvia in modalità di recupero o con un kernel precedente
  - Usa `sudo minios-kernel activate <working-version>` per attivare un kernel funzionante
  - Verifica la compatibilità del kernel con il tuo hardware

#### **🔄 Il sistema avvia il vecchio kernel**

- **Causa:** La configurazione del bootloader non è stata aggiornata correttamente
- **Soluzione:** 
  - Ripeti l’attivazione del kernel: `sudo minios-kernel activate <version>`
  - Verifica che il kernel sia stato pacchettizzato e installato correttamente

#### **⚠️ Hardware non funzionante dopo il cambio kernel**

- **Causa:** Driver mancanti nel nuovo kernel
- **Soluzione:**
  - Verifica che il modulo kernel SquashFS sia stato installato
  - Controlla se il nuovo kernel supporta il tuo hardware
  - Considera l’uso di una variante diversa del kernel

#### **🚨 Recupero kernel dall’immagine originale di MiniOS**

Se hai bisogno di recuperare da un kernel corrotto o incompatibile, puoi avviare dal file ISO/USB originale di MiniOS:

```bash
# Boot from original MiniOS image with from= parameter
# At boot prompt, specify your installed MiniOS device
from=/dev/sda1  # Replace with your actual MiniOS device
```

**Procedura di recupero:**
Quando avvii dal file ISO/USB originale di MiniOS e specifichi nel parametro `from=` il dispositivo dove MiniOS è installato, il sistema di init lo rileva e ti permette di accedere al tuo sistema MiniOS installato. Il metodo di recupero dipende dalla presenza dei file kernel originali:

1. **Se il kernel originale è ancora presente:** 
   - L’avvio avviene senza problemi con il kernel originale dall’ISO/USB
   - Attiva manualmente il kernel originale: `sudo minios-kernel activate <original-kernel-version>`

2. **Se il kernel originale è stato eliminato:** 
   - Copia manualmente i file kernel dall’immagine originale di MiniOS e ripristinali nelle posizioni corrette sulla tua installazione MiniOS
   - Attiva manualmente il kernel ripristinato: `sudo minios-kernel activate <original-kernel-version>`

In entrambi i casi, l’attivazione del kernel richiede un intervento manuale dopo il recupero.

### 🔍 **Comandi diagnostici:**

**Verifica lo stato attuale del sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifica i file kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Controlla la configurazione del bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 Panoramica della struttura dei file

MiniOS Kernel Manager gestisce automaticamente questi file:

### **Struttura del repository del kernel:**

```
/minios/
├── 01-kernel.sb                   # Active kernel module (standard location)
├── kernels/                       # Repository of inactive/alternative kernels
│   ├── 01-kernel-<version>.sb     # SquashFS kernel modules
│   ├── vmlinuz-<version>          # Kernel binaries
│   └── initrfs-<version>.img      # Initial RAM filesystems
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Nota:** Il modulo standard `01-kernel.sb` fornito con MiniOS include driver aggiuntivi rispetto a quelli presenti nei pacchetti kernel del repository originale. Questi driver extra garantiscono una compatibilità hardware superiore per adattatori wireless e dispositivi di archiviazione.

### **Indicatori di stato:**

- **ATTIVO:** Kernel configurato nel bootloader (verrà avviato al prossimo riavvio)
- **IN ESECUZIONE:** Kernel attualmente in esecuzione
- **DISPONIBILE:** Pacchettizzato e pronto per l'attivazione

### **Operazioni automatiche:**

- ✅ Packaging e compressione del kernel
- ✅ Generazione dell'initramfs con i driver appropriati
- ✅ Installazione nel repository MiniOS
- ✅ Aggiornamento della configurazione del bootloader
- ✅ Gestione dei symlink per i kernel attivi
- ✅ Pulizia dei file temporanei

---

## 🎯 Best practice

### **Selezione del kernel:**

- Utilizza kernel dai repository ufficiali Debian/Ubuntu quando possibile
- Testa i nuovi kernel prima in ambienti non di produzione
- Mantieni sempre almeno un kernel funzionante come riserva per il ripristino

### **Prima dell'installazione:**

- Verifica che la directory di MiniOS sia scrivibile
- Assicurati di avere spazio su disco sufficiente (i kernel possono occupare 100-500MB)
- Aggiorna la lista dei pacchetti per i kernel del repository

### **Dopo l'installazione:**

- Testa accuratamente il nuovo kernel
- Verifica che tutto l'hardware funzioni correttamente
- Conserva il kernel precedente come backup finché il nuovo non si dimostra stabile

### **Pianificazione del ripristino:**

- Mantieni sempre un backup di un kernel funzionante
- Sappi come avviare da un supporto di ripristino se necessario
- Documenta quali kernel sono compatibili con la tua configurazione hardware
