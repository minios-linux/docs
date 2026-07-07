# MiniOS Virtualisierungsleitfaden

Dieser Leitfaden behandelt das Ausführen von MiniOS in virtuellen Maschinen, die Optimierung der Performance und die Nutzung von MiniOS als Virtualisierungshost. MiniOS basiert auf Debian 13 "Trixie" und enthält integrierte Virtualisierungstreiber sowie Gast-Tools für optimale Leistung.

## MiniOS-spezifische Virtualisierungsfunktionen

MiniOS bietet integrierte Unterstützung für Virtualisierungserkennung und automatische Auflösungsanpassung. Das System enthält das Skript `minios-virtreschange`, das virtuelle Umgebungen (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) automatisch erkennt und die Bildschirmauflösung entsprechend anpasst.

**Automatische Auflösungsverwaltung:**
- **Kernel-Parameter:** `virtres=BREITExHÖHE` (z. B. `virtres=1920x1080`)
- **Automatische Anpassung deaktivieren:** Kernel-Parameter `novirtres`
- **Standardauflösung:** 1280x800 (wenn kein virtres-Parameter angegeben ist)
- **Erkennung:** Erkennt VM-Umgebungen automatisch und passt die Auflösung an

## MiniOS als Gastsystem ausführen

### Allgemeine VM-Konfiguration

**Empfohlene Einstellungen (alle Plattformen):**
- **Arbeitsspeicher:** Mindestens 2 GB, empfohlen 4 GB (Standard Edition: mindestens 1 GB)
- **Prozessoren:** Mindestens 2 Kerne
- **Speicher:** Mindestens 4 GB (für Persistenz werden 8 GB empfohlen)
- **Betriebssystemtyp:** Linux 64-bit / Other Linux 64-bit

**Auswahl des Festplattencontrollers:**
- **VMware:** SCSI-Controller für bessere Performance verwenden
- **VirtualBox:** SATA-Controller mit AHCI verwenden
- **QEMU/KVM:** VirtIO-Blockgeräte verwenden
- **Hyper-V:** SCSI-Controller verwenden

**Auswahl des Netzwerkadapters:**
- **VMware:** VMXNET3 für bessere Performance verwenden
- **VirtualBox:** Intel PRO/1000 MT Desktop verwenden
- **QEMU/KVM:** VirtIO-Netzwerkschnittstelle verwenden
- **Hyper-V:** Synthetischer Netzwerkadapter verwenden

### Installation von Gast-Tools

**VMware (VMware Workstation/Player):**
In den MiniOS Toolbox- und Ultra-Editionen ist `open-vm-tools` vorinstalliert. Für die Standard Edition:
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
In den MiniOS Toolbox- und Ultra-Editionen ist `qemu-guest-agent` vorinstalliert. Für die Standard Edition:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Integrationskomponenten sind in MiniOS vorinstalliert. Für erweiterte Funktionen:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## MiniOS als Virtualisierungshost nutzen

MiniOS bietet in den Toolbox- und Ultra-Editionen integrierte Unterstützung für das Ausführen von Containern und virtuellen Maschinen. Die Ultra Edition bietet vollständigen Docker- sowie KVM/QEMU-Support, während Toolbox nur Virtualisierungstools enthält.

### Docker-Unterstützung

**Ultra Edition:** Docker ist vorinstalliert, inklusive lazydocker – einer UI zur Verwaltung von Docker

**Andere Editionen:** Docker kann manuell installiert werden:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### KVM/QEMU-Unterstützung

**Toolbox- und Ultra-Editionen:** KVM-Tools sind vorinstalliert, inklusive virt-manager – einer grafischen Oberfläche zur Verwaltung virtueller Maschinen

**Andere Editionen:** Virtualisierungstools können manuell installiert werden:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### VirtualBox-Unterstützung

VirtualBox ist nicht in den offiziellen Debian 13-Repositories enthalten, kann aber über die offiziellen Oracle-Pakete installiert werden:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Nutzer werden automatisch der Gruppe `vboxusers` hinzugefügt, um auf VirtualBox-Funktionen zugreifen zu können.
