---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Gestione dei kernel

## Perché sostituire il kernel?

MiniOS include un kernel predefinito, ma ci sono diversi motivi per cui potresti volerlo sostituire:

### **Diverse varianti del kernel Debian**

Debian offre diverse varianti di kernel ottimizzate per vari scenari d’uso:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel standard per sistemi a 64 bit (predefinito in MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel real-time per applicazioni critiche in tempo reale
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Ottimizzato per ambienti cloud e virtualizzati

> **Nota:** I numeri di versione (ad esempio `6.12.38+deb13`) cambiano con gli aggiornamenti. Per visualizzare i kernel attualmente disponibili:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Casi d'uso specializzati**

- **Computazione real-time** - Kernel RT per produzione audio, controllo industriale
- **Gaming e bassa latenza** - Kernel personalizzati con ottimizzazioni per il gaming
- **Rafforzamento della sicurezza** - Kernel con patch di sicurezza aggiuntive (grsecurity, ecc.)
- **Compatibilità hardware** - Kernel più recenti per supportare hardware di ultima generazione
- **Ottimizzazione delle prestazioni** - Kernel compilati su misura con ottimizzazioni specifiche

### **Funzionalità personalizzate del kernel**

- **Patch personalizzate** - Applica patch specifiche per il tuo hardware o caso d'uso
- **Moduli kernel** - Aggiungi supporto per hardware o filesystem specializzati
- **Ottimizzazioni del compilatore** - Compila con diversi flag di ottimizzazione
- **Ottimizzazione delle dimensioni** - Rimuovi driver non necessari per ridurre la dimensione del kernel

### **Scenari comuni**

- **Workstation per produzione audio** - Usa il kernel RT per ridurre al minimo la latenza audio
- **Sistemi gaming** - Applica patch e ottimizzazioni specifiche per il gaming
- **Ambienti server** - Usa kernel ottimizzati per il cloud per una migliore virtualizzazione
- **Hardware legacy** - Usa kernel più vecchi per la compatibilità con sistemi datati
- **Sistemi di sviluppo** - Testa le applicazioni con diverse versioni di kernel

---

## MiniOS Panoramica del Gestore kernel

MiniOS offre due strumenti per la gestione dei kernel:

1. **MiniOS Gestore kernel (GUI):** Un'applicazione grafica intuitiva per il packaging, l'installazione e la gestione dei kernel
2. **minios-kernel (CLI):** Uno strumento da riga di comando per utenti avanzati e automazione

Entrambi gli strumenti gestiscono automaticamente:
- **Packaging del kernel** nel formato SquashFS
- **Generazione dell'initramfs** con i driver e gli script di boot appropriati
- **Installazione** nel repository kernel MiniOS
- **Aggiornamento della configurazione del bootloader**
- **Attivazione e switch del kernel**

Questa pagina riguarda il sistema live modulare MiniOS. MiniOS Gestore kernel e `minios-kernel` sono disponibili per quell’architettura live e il relativo modulo kernel coordinato, `vmlinuz`, e il set di initramfs. Dopo la conversione nativa, il sistema utilizza il normale workflow kernel di Debian; gli strumenti live kernel MiniOS vengono rimossi perché il modello kernel modulare non è più applicabile, quindi si usano i pacchetti kernel Debian, gli strumenti initramfs e il bootloader installato. Consulta [Informazioni su MiniOS](/getting-started/About-MiniOS) e [Modalità di avvio](/using-minios/Boot-Modes). Per il comportamento esatto del kernel coordinato dell’initrd live, vedi [Caricamento moduli initrd](/reference/boot-process/Module-Loading).

### **Considerazioni importanti:**

- **Privilegi amministrativi:** Entrambi gli strumenti richiedono privilegi amministrativi e chiederanno autenticazione tramite PolicyKit
- **Compatibilità kernel:** Assicurati che i kernel siano compatibili con MiniOS. Si raccomandano i kernel del repository
- **Directory MiniOS:** Gli strumenti rilevano automaticamente la directory di MiniOS (`/minios/`) e verificano i permessi di scrittura
- **Aggiornamenti automatici:** Le configurazioni del bootloader vengono aggiornate automaticamente quando si attivano i kernel

---

## Metodo 1: Utilizzo del Gestore kernel MiniOS (GUI)

Il gestore kernel grafico offre un’interfaccia intuitiva per tutte le operazioni sui kernel.

### **Passaggi:**

#### 1. **Avvia l'applicazione**

```bash
minios-kernel-manager
```

Oppure cerca "Gestore kernel MiniOS" nel menu delle applicazioni.

#### 2. **Crea il pacchetto di un nuovo kernel**

**Utilizzando la scheda Package Kernel:**

1. **Seleziona la sorgente del kernel:**
   - **Pacchetto manuale:** Sfoglia e seleziona un pacchetto kernel locale `.deb`
   - **Repository:** Scegli tra i kernel disponibili nei repository Debian/Ubuntu

2. **Configura la compressione:**
   - Seleziona la compressione SquashFS: `zstd` (consigliato), `lz4`, `lzo`, `xz` o `gzip`

3. **Crea il pacchetto del kernel:**
   - Clicca sul pulsante "Package Kernel"
   - Monitora l'avanzamento nel log di packaging
   - I file vengono installati automaticamente nel repository di MiniOS

#### 3. **Gestisci i kernel installati**

**Utilizzando la scheda Manage Kernels:**

1. **Visualizza i kernel disponibili:**
   - Vedi tutti i kernel pacchettizzati con badge di stato:
     - **ACTIVE:** Kernel attualmente configurato
     - **RUNNING:** Kernel attualmente avviato
     - **AVAILABLE:** Disponibile per l'attivazione

2. **Attiva un kernel:**
   - Fai clic destro su un kernel e seleziona "Activate Kernel"
   - Conferma la finestra di attivazione
   - La configurazione del bootloader viene aggiornata automaticamente

3. **Elimina un kernel:**
   - Fai clic destro su un kernel inattivo e seleziona "Delete Kernel"
   - Conferma l'eliminazione (operazione irreversibile)

---

## Metodo 2: Utilizzo di minios-kernel (CLI)

Lo strumento da riga di comando offre funzionalità di gestione kernel automatizzabili tramite script.

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

Mostra tutti i kernel pacchettizzati con il relativo stato.

#### 2. **Pacchettizza un kernel**

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

#### 5. **Verifica stato**

```bash
sudo minios-kernel status
```

Mostra lo stato della directory MiniOS e le informazioni sul kernel attuale.

#### 6. **Mostra informazioni sul kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Visualizza informazioni dettagliate su uno specifico kernel, incluso stato e disponibilità.

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

#### **Opzioni avanzate di pacchettizzazione:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Guida e utilizzo:**

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
- **Soluzione:** Assicurati di operare da un sistema MiniOS o che la chiavetta USB sia correttamente montata
- **Verifica:** Esegui `sudo minios-kernel status` per controllare il rilevamento della directory

#### **Permesso negato**

- **Causa:** La directory MiniOS è in sola lettura o non hai i permessi necessari
- **Soluzione:** Assicurati di avere i privilegi amministrativi e che il filesystem sia scrivibile
- **Verifica:** Controlla lo stato della directory MiniOS tramite GUI o CLI

#### **Installazione del pacchetto non riuscita**

- **Causa:** Pacchetto corrotto, problemi di rete o dipendenze mancanti
- **Soluzione:**
  - Verifica l'integrità del file del pacchetto
  - Controlla la connettività di rete per i pacchetti da repository
  - Aggiorna la lista dei pacchetti: `sudo apt update`

#### **Kernel panic dopo l'attivazione**

- **Causa:** Kernel incompatibile o driver mancanti
- **Cosa fare:** Avvia un sistema MiniOS funzionante, salva i dati importanti e ripristina un set completo di kernel funzionante solo se disponibile. In caso contrario, reinstalla l'installazione MiniOS interessata. Non tentare di riparare il sistema mescolando singoli file kernel, initramfs o `01-kernel-*.sb`. Consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

#### **Il sistema avvia il vecchio kernel**

- **Causa:** La configurazione del bootloader non è stata aggiornata correttamente
- **Soluzione:**
  - Riattiva il kernel: `sudo minios-kernel activate <version>`
  - Verifica che il kernel sia stato pacchettizzato e installato correttamente

#### **Hardware non funzionante dopo il cambio kernel**

- **Causa:** Driver mancanti nel nuovo kernel
- **Soluzione:**
  - Verifica che il file modulo kernel SquashFS sia stato installato
  - Controlla se il nuovo kernel supporta il tuo hardware
  - Valuta l'utilizzo di una variante kernel diversa

#### **Recupero dopo un cambio kernel non riuscito**

Non copiare un'immagine kernel, un initramfs o un modulo `01-kernel-*.sb` singolarmente da un'altra immagine. Un kernel MiniOS avviabile richiede il set coordinato. Se un set completo e funzionante non è già disponibile tramite il flusso di lavoro di gestione kernel, reinstalla l'installazione MiniOS interessata invece di assemblare manualmente i componenti di avvio. Prima salva i dati importanti; consulta [Risoluzione dei problemi](/maintenance-and-recovery/Troubleshooting).

### **Comandi diagnostici:**

**Verifica stato attuale del sistema:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifica file del kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Controlla configurazione del bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Panoramica della struttura dei file

Il Gestore kernel MiniOS gestisce automaticamente questi file:

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

**Nota:** Il modulo standard `01-kernel-<version>.sb` fornito con MiniOS include driver aggiuntivi rispetto a quelli presenti nei pacchetti kernel originali del repository. Questi driver extra garantiscono una compatibilità hardware migliorata per adattatori wireless e dispositivi di archiviazione.

### **Indicatori di Stato:**

- **ATTIVO:** Kernel configurato nel bootloader (verrà avviato al prossimo riavvio)
- **IN ESECUZIONE:** Kernel attualmente in esecuzione
- **DISPONIBILE:** Impacchettato e pronto per l'attivazione

### **Operazioni Automatiche:**

- Impacchettamento e compressione del kernel
- Generazione di initramfs con i driver appropriati
- Installazione nel repository MiniOS
- Aggiornamento della configurazione del bootloader
- Gestione dei symlink per i kernel attivi
- Pulizia dei file temporanei

---

## Best Practice

### **Selezione del Kernel:**

- Utilizzare, quando possibile, kernel dai repository ufficiali Debian/Ubuntu
- Testare i nuovi kernel prima in ambienti non di produzione
- Mantenere sempre almeno un kernel funzionante noto per il recupero

### **Prima dell'Installazione:**

- Verificare che la directory MiniOS sia scrivibile
- Assicurarsi di avere spazio su disco sufficiente (i kernel possono occupare 100-500MB)
- Aggiornare le liste dei pacchetti per i kernel del repository

### **Dopo l'Installazione:**

- Testare accuratamente il nuovo kernel
- Verificare che tutto l'hardware funzioni correttamente
- Conservare il kernel precedente come backup finché il nuovo non si dimostra stabile

### **Pianificazione del Recupero:**

- Conservare sempre un tripletto di kernel funzionante e verificato
- Sapere come avviare da un supporto di recupero se necessario
- Documentare quali kernel funzionano con la propria configurazione hardware
