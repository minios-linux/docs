# Guida alla Virtualizzazione di MiniOS

Questa guida copre l'esecuzione di MiniOS in macchine virtuali, l’ottimizzazione delle prestazioni e l’utilizzo di MiniOS come host di virtualizzazione. MiniOS è basato su Debian 13 "Trixie" e include driver di virtualizzazione integrati e guest tools per prestazioni ottimali.

## Funzionalità di Virtualizzazione Specifiche di MiniOS

MiniOS include il supporto integrato per il rilevamento della virtualizzazione e la regolazione automatica della risoluzione. Il sistema include lo script `minios-virtreschange`, che rileva automaticamente gli ambienti virtuali (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) e regola di conseguenza la risoluzione dello schermo.

**Gestione Automatica della Risoluzione:**
- **Parametro del kernel:** `virtres=WIDTHxHEIGHT` (es. `virtres=1920x1080`)
- **Disabilita la regolazione automatica:** parametro del kernel `novirtres`
- **Risoluzione predefinita:** 1280x800 (se il parametro virtres non è specificato)
- **Rilevamento:** Rileva automaticamente gli ambienti VM e regola di conseguenza

## Esecuzione di MiniOS come Sistema Guest

### Configurazione Generale della VM

**Impostazioni consigliate (tutte le piattaforme):**
- **Memoria:** minimo 2 GB, consigliati 4 GB (edizione Standard: minimo 1 GB)
- **Processori:** minimo 2 core
- **Archiviazione:** minimo 4 GB (8 GB consigliati per la persistenza)
- **Tipo OS:** Linux 64-bit / Other Linux 64-bit

**Selezione del Controller Disco:**
- **VMware:** usa controller SCSI per prestazioni migliori
- **VirtualBox:** usa controller SATA con AHCI
- **QEMU/KVM:** usa dispositivi VirtIO block
- **Hyper-V:** usa controller SCSI

**Selezione della Scheda di Rete:**
- **VMware:** usa VMXNET3 per prestazioni migliori
- **VirtualBox:** usa Intel PRO/1000 MT Desktop
- **QEMU/KVM:** usa interfaccia di rete VirtIO
- **Hyper-V:** usa scheda di rete sintetica

### Installazione dei Guest Tools

**VMware (VMware Workstation/Player):**
Nelle edizioni MiniOS Toolbox e Ultra, `open-vm-tools` è preinstallato. Per l’edizione Standard:
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

**VirtualBox:**
```bash
# Insert Guest Additions CD and install
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot
```

**QEMU/KVM:**
Nelle edizioni MiniOS Toolbox e Ultra, `qemu-guest-agent` è preinstallato. Per l’edizione Standard:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
I componenti di integrazione sono già preinstallati in MiniOS. Per funzionalità avanzate:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Utilizzo di MiniOS come Host di Virtualizzazione

MiniOS include il supporto integrato per l’esecuzione di container e macchine virtuali nelle edizioni Toolbox e Ultra. L’edizione Ultra offre il pieno supporto a Docker e KVM/QEMU, mentre Toolbox include solo strumenti di virtualizzazione.

### Supporto Docker

**Edizione Ultra:** Docker è preinstallato, incluso lazydocker - un’interfaccia grafica per la gestione di Docker

**Altre edizioni:** Docker può essere installato manualmente:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Supporto KVM/QEMU

**Edizioni Toolbox e Ultra:** Gli strumenti KVM sono preinstallati, incluso virt-manager - un’interfaccia grafica per la gestione delle macchine virtuali

**Altre edizioni:** Gli strumenti di virtualizzazione possono essere installati manualmente:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Supporto VirtualBox

VirtualBox non è incluso nei repository ufficiali di Debian 13, ma può essere installato tramite i pacchetti ufficiali Oracle:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Gli utenti vengono aggiunti automaticamente al gruppo `vboxusers` per accedere alle funzionalità di VirtualBox.
