---
updated: 2026-08-26
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Gestione del Kernel in MiniOS

## Perché sostituire il kernel?

MiniOS viene fornito con un kernel predefinito, ma ci sono diversi motivi per cui potresti volerlo sostituire:

### **Diverse varianti di kernel Debian**

Debian offre diverse varianti di kernel ottimizzate per vari scenari d’uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel standard per sistemi a 64 bit (predefinito in MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel real-time per applicazioni critiche in tempo reale
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Ottimizzato per ambienti cloud e virtualizzati

> **Nota:** I numeri di versione (come `6.12.38+deb13`) cambiano con gli aggiornamenti. Per trovare i kernel attualmente disponibili:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Casi d’uso specializzati**

- **Calcolo real-time** - Kernel RT per produzione audio, controllo industriale
- **Gaming e bassa latenza** - Kernel personalizzati con ottimizzazioni per il gaming
- **Rafforzamento della sicurezza** - Kernel con patch di sicurezza aggiuntive (grsecurity, ecc.)
- **Compatibilità hardware** - Kernel più recenti per supporto a hardware di ultima generazione
- **Ottimizzazione delle prestazioni** - Kernel compilati su misura con ottimizzazioni specifiche

### **Funzionalità personalizzate del kernel**

- **Patch personalizzate** - Applica patch specifiche per il tuo hardware o caso d’uso
- **Moduli kernel** - Aggiungi supporto per hardware o filesystem specializzati
- **Ottimizzazioni del compilatore** - Compila con flag di ottimizzazione differenti
- **Ottimizzazione delle dimensioni** - Rimuovi driver non necessari per ridurre la dimensione del kernel

### **Scenari comuni**

- **Workstation per produzione audio** - Utilizza kernel RT per latenza audio minima
- **Sistemi da gaming** - Applica patch e ottimizzazioni specifiche per il gaming
- **Ambienti server** - Usa kernel ottimizzati per il cloud per una migliore virtualizzazione
- **Hardware legacy** - Usa kernel più vecchi per compatibilità con sistemi datati
- **Sistemi di sviluppo** - Testa le applicazioni su diverse versioni di kernel

---

## Panoramica di MiniOS Kernel Manager

MiniOS offre due strumenti per la gestione del kernel:

1. **MiniOS Kernel Manager (GUI):** Un’applicazione grafica intuitiva per impacchettare, installare e gestire i kernel
2. **minios-kernel (CLI):** Uno strumento da riga di comando per utenti avanzati e automazione

Entrambi gli strumenti gestiscono automaticamente:
- **Impacchettamento del kernel** in formato SquashFS
- **Generazione dell’initramfs** con i driver e gli script di avvio necessari
- **Installazione** nel repository kernel di MiniOS
- **Aggiornamento della configurazione del bootloader**
- **Attivazione e switch del kernel**

Questa pagina tratta le installazioni live modulari. Le installazioni native utilizzano invece i propri pacchetti kernel installati, GRUB e initramfs; vedi
[Modalità di avvio](/configuration/Boot-Modes.md). Per il comportamento coordinato esatto del kernel con l’initrd, consulta
[Caricamento moduli initrd](/configuration/Initrd-Module-Loading.md).

### **Considerazioni importanti:**

- **Privilegi amministrativi:** Entrambi gli strumenti richiedono privilegi amministrativi e richiederanno l’autenticazione tramite PolicyKit
- **Compatibilità kernel:** Assicurati che i kernel siano compatibili con MiniOS. Si consiglia di utilizzare kernel dal repository
- **Directory MiniOS:** Gli strumenti rilevano automaticamente la directory di MiniOS (`/minios/`) e verificano i permessi di scrittura
- **Aggiornamenti automatici:** Le configurazioni del bootloader vengono aggiornate automaticamente quando si attiva un kernel

---

## Metodo 1: Utilizzo di MiniOS Kernel Manager (GUI)

Il gestore grafico del kernel offre un’interfaccia intuitiva per tutte le operazioni sul kernel.

### **Passaggi:**

#### 1. **Avvia l’applicazione**

```bash
minios-kernel-manager
```

Oppure cerca "MiniOS Kernel Manager" nel menu delle applicazioni.

#### 2. **Impacchetta un nuovo kernel**

**Utilizzando la scheda Package Kernel:**

1. **Seleziona la sorgente del kernel:**
   - **Pacchetto manuale:** Sfoglia e seleziona un pacchetto kernel locale `.deb`
   - **Repository:** Scegli tra i kernel disponibili nei repository Debian/Ubuntu

2. **Configura la compressione:**
   - Seleziona la compressione SquashFS: `zstd` (consigliato), `lz4`, `lzo`, `xz` o `gzip`

3. **Impacchetta il kernel:**
   - Clicca sul pulsante "Package Kernel"
   - Monitora l’avanzamento nel log di impacchettamento
   - I file vengono installati automaticamente nel repository di MiniOS

#### 3. **Gestisci i kernel installati**

**Utilizzando la scheda Manage Kernels:**

1. **Visualizza i kernel disponibili:**
   - Visualizza tutti i kernel impacchettati con badge di stato:
     - **ACTIVE:** Kernel attualmente configurato
     - **RUNNING:** Kernel attualmente avviato
     - **AVAILABLE:** Disponibile per l’attivazione

2. **Attiva un kernel:**
   - Clicca col tasto destro su un kernel e seleziona "Activate Kernel"
   - Conferma la finestra di dialogo di attivazione
   - La configurazione del bootloader viene aggiornata automaticamente

3. **Elimina un kernel:**
   - Clicca col tasto destro su un kernel inattivo e seleziona "Delete Kernel"
   - Conferma l’eliminazione (operazione irreversibile)

---

## Metodo 2: Utilizzo di minios-kernel (CLI)

Lo strumento da riga di comando offre funzionalità di gestione kernel scriptabili.

### **Privilegi amministrativi richiesti:**

Lo strumento CLI richiede privilegi root e li verificherà automaticamente. Esegui i comandi con `sudo` oppure tramite `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Comandi di base:**

#### 1. **Elenca i kernel disponibili**

```bash
sudo minios-kernel list
```

Mostra tutti i kernel impacchettati con il relativo stato.

#### 2. **Impacchetta un kernel**

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

#### 3. **Attiva un kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Elimina un kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Verifica lo stato**

```bash
sudo minios-kernel status
```

Mostra lo stato della directory MiniOS e le informazioni sul kernel attuale.

#### 6. **Mostra informazioni sul kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Visualizza informazioni dettagliate su un kernel specifico, incluso stato e disponibilità.

### **Opzioni CLI avanzate:**

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

## Risoluzione dei problemi

### Problemi comuni e soluzioni:

#### **Directory MiniOS non trovata**

- **Causa:** Gli strumenti non riescono a individuare la directory MiniOS
- **Soluzione:** Assicurati di operare su un sistema MiniOS o che la chiavetta USB sia montata correttamente
- **Verifica:** Esegui `sudo minios-kernel status` per controllare il rilevamento della directory

#### **Permesso negato**

- **Causa:** La directory MiniOS è in sola lettura o i permessi sono insufficienti
- **Soluzione:** Assicurati di avere privilegi amministrativi e che il filesystem sia scrivibile
- **Verifica:** Controlla lo stato della directory MiniOS tramite GUI o CLI

#### **Installazione del pacchetto non riuscita**

- **Causa:** Pacchetto corrotto, problemi di rete o dipendenze mancanti
- **Soluzione:**
  - Verifica l’integrità del file del pacchetto
  - Controlla la connettività di rete per i pacchetti da repository
  - Aggiorna gli elenchi dei pacchetti: `sudo apt update`

#### **Kernel panic dopo l’attivazione**

- **Causa:** Kernel incompatibile o driver mancanti
- **Soluzione:**
  - Segui [Recupero avvio](/administration/Boot-Recovery.md) per avviare un supporto di ripristino compatibile e attivare un set di kernel noto e funzionante
  - Verifica la compatibilità del kernel con il tuo hardware

#### **Il sistema avvia il vecchio kernel**

- **Causa:** La configurazione del bootloader non è stata aggiornata correttamente
- **Soluzione:**
  - Ripeti l’attivazione del kernel: `sudo minios-kernel activate <version>`
  - Controlla che il kernel sia stato impacchettato e installato correttamente

#### **Hardware non funzionante dopo il cambio kernel**

- **Causa:** Driver mancanti nel nuovo kernel
- **Soluzione:**
  - Verifica che il file modulo kernel SquashFS sia stato installato
  - Controlla se il nuovo kernel supporta il tuo hardware
  - Valuta l’utilizzo di una variante di kernel differente

#### **Recupero del Kernel dall'immagine originale di MiniOS**

Non eseguire il recupero copiando singolarmente un'immagine del kernel, un initramfs o un modulo `01-kernel-*.sb`. Una versione avviabile richiede il triplo coordinato e l'attivazione deve aggiornare la configurazione del bootloader come parte di un'operazione supportata. Segui la guida [Rollback modulare del kernel](/administration/Boot-Recovery.md) per utilizzare un supporto di ripristino compatibile e attivare un set completo e funzionante. Se non è disponibile un set completo con versioni corrispondenti, reinstalla il sistema; non assemblare asset di avvio parziali.

### **Comandi diagnostici:**

**Verifica lo stato attuale del sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifica i file del kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Controlla la configurazione del bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Panoramica della struttura dei file

MiniOS Kernel Manager gestisce automaticamente questi file:

### **Struttura del repository kernel:**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Nota:** Il modulo standard `01-kernel-<version>.sb` fornito con MiniOS contiene driver aggiuntivi rispetto a quelli inclusi nei pacchetti kernel originali del repository. Questi driver aggiuntivi garantiscono una maggiore compatibilità hardware per adattatori wireless e dispositivi di archiviazione.

### **Indicatori di stato:**

- **ATTIVO:** Kernel configurato nel bootloader (verrà avviato al prossimo riavvio)
- **IN ESECUZIONE:** Kernel attualmente in esecuzione
- **DISPONIBILE:** Pacchettizzato e pronto per l'attivazione

### **Operazioni automatiche:**

- Impacchettamento e compressione del kernel
- Generazione dell’initramfs con i driver necessari
- Installazione nel repository MiniOS
- Aggiornamento della configurazione del bootloader
- Gestione dei symlink per i kernel attivi
- Pulizia dei file temporanei

---

## Best practice

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

- Conserva sempre un tripletto kernel completo e funzionante
- Sappi come avviare da un supporto di ripristino se necessario
- Documenta quali kernel funzionano con la tua configurazione hardware
