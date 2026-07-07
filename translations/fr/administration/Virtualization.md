# Guide de virtualisation MiniOS

Ce guide explique comment exécuter MiniOS dans des machines virtuelles, optimiser les performances et utiliser MiniOS comme hôte de virtualisation. MiniOS est basé sur Debian 13 "Trixie" et inclut des pilotes de virtualisation et des outils invités intégrés pour des performances optimales.

## Fonctionnalités de virtualisation spécifiques à MiniOS

MiniOS intègre la détection de virtualisation et l’ajustement automatique de la résolution. Le système inclut le script `minios-virtreschange`, qui détecte automatiquement les environnements virtuels (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) et ajuste la résolution d’écran en conséquence.

**Gestion automatique de la résolution :**
- **Paramètre du noyau :** `virtres=WIDTHxHEIGHT` (ex. : `virtres=1920x1080`)
- **Désactiver l’ajustement automatique :** paramètre du noyau `novirtres`
- **Résolution par défaut :** 1280x800 (si le paramètre virtres n’est pas spécifié)
- **Détection :** Détecte automatiquement les environnements VM et ajuste la résolution en conséquence

## Exécuter MiniOS en tant que système invité

### Configuration générale de la VM

**Paramètres recommandés (toutes plateformes) :**
- **Mémoire :** 2 Go minimum, 4 Go recommandés (Edition Standard : 1 Go minimum)
- **Processeurs :** 2 cœurs minimum
- **Stockage :** 4 Go minimum (8 Go recommandés pour la persistance)
- **Type d’OS :** Linux 64 bits / Autre Linux 64 bits

**Sélection du contrôleur de disque :**
- **VMware :** Utiliser un contrôleur SCSI pour de meilleures performances
- **VirtualBox :** Utiliser un contrôleur SATA avec AHCI
- **QEMU/KVM :** Utiliser des périphériques de bloc VirtIO
- **Hyper-V :** Utiliser un contrôleur SCSI

**Sélection de l’adaptateur réseau :**
- **VMware :** Utiliser VMXNET3 pour de meilleures performances
- **VirtualBox :** Utiliser Intel PRO/1000 MT Desktop
- **QEMU/KVM :** Utiliser l’interface réseau VirtIO
- **Hyper-V :** Utiliser l’adaptateur réseau synthétique

### Installation des outils invités

**VMware (VMware Workstation/Player) :**
Dans les éditions MiniOS Toolbox et Ultra, `open-vm-tools` est préinstallé. Pour l’édition Standard :
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

**VirtualBox :**
```bash
# Insert Guest Additions CD and install
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot
```

**QEMU/KVM :**
Dans les éditions MiniOS Toolbox et Ultra, `qemu-guest-agent` est préinstallé. Pour l’édition Standard :
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V :**
Les composants d’intégration sont préinstallés dans MiniOS. Pour des fonctionnalités avancées :
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Utiliser MiniOS comme hôte de virtualisation

MiniOS intègre la prise en charge native de l’exécution de conteneurs et de machines virtuelles dans les éditions Toolbox et Ultra. L’édition Ultra offre une prise en charge complète de Docker et KVM/QEMU, tandis que Toolbox inclut uniquement les outils de virtualisation.

### Prise en charge de Docker

**Edition Ultra :** Docker est préinstallé, incluant lazydocker – une interface pour la gestion de Docker

**Autres éditions :** Docker peut être installé manuellement :
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Prise en charge de KVM/QEMU

**Editions Toolbox et Ultra :** Les outils KVM sont préinstallés, y compris virt-manager – une interface graphique pour la gestion des machines virtuelles

**Autres éditions :** Les outils de virtualisation peuvent être installés manuellement :
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Prise en charge de VirtualBox

VirtualBox n’est pas inclus dans les dépôts officiels de Debian 13, mais peut être installé via les paquets officiels Oracle :

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Les utilisateurs sont automatiquement ajoutés au groupe `vboxusers` pour accéder aux fonctionnalités de VirtualBox.
