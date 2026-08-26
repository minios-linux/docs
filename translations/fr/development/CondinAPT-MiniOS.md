---
updated: 2026-08-26
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT dans MiniOS : Guide d'intégration

Ce document décrit les aspects spécifiques de l'utilisation de CondinAPT dans le système de build MiniOS.

> **Documentation principale :** Pour les fonctionnalités de base de CondinAPT, consultez le document principal `CondinAPT.md`

## Table des matières

- [Intégration avec le système de construction MiniOS](#integration-avec-le-systeme-de-construction-minios)
- [Configuration de MiniOS](#configuration-de-minios)
- [Utilisation dans les modules](#utilisation-dans-les-modules)
- [Exemples pour MiniOS](#exemples-pour-minios)

## Intégration avec le système de construction MiniOS

### Utilisation dans les modules MiniOS

CondinAPT est un outil standard pour l'installation de paquets dans les modules MiniOS. Il s'intègre au processus de construction via l'interface standard des modules.

**Dans le script d'installation du module (`install`) :**
```bash
#!/bin/bash
set -e

# Load MiniOS library
. /minioslib || exit 1

# Install packages via CondinAPT
/linux-live/condinapt \
    -l "$CWD/packages.list" \
    -c /linux-live/build.conf \
    -m /linux-live/condinapt.map
```

### Structure d'un module MiniOS

Chaque module dans `/linux-live/scripts/` suit une structure standardisée :

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Configuration de MiniOS

### Contenu de `condinapt.map` dans MiniOS

```text
d=DISTRIBUTION
da=DISTRIBUTION_ARCH
dt=DISTRIBUTION_TYPE
de=DESKTOP_ENVIRONMENT
pv=PACKAGE_VARIANT
ik=INSTALL_KERNEL
kf=KERNEL_FLAVOUR
ka=KERNEL_AUFS
kbd=KERNEL_BUILD_DKMS
ib=INITRAMFS_BUILDER
lo=LOCALE
ml=MULTILINGUAL
kl=KEEP_LOCALES
```

### Variables de configuration MiniOS

**Variables principales de `build.conf` :**
- `DISTRIBUTION` - distribution cible (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - architecture (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - environnement de bureau (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - variante du paquet (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - installer le paquet noyau (true/false)
- `KERNEL_FLAVOUR` - saveur du noyau (none, rt, cloud)
- `KERNEL_AUFS` - support AUFS (true/false)
- `KERNEL_BUILD_DKMS` - compiler les modules DKMS (true/false)
- `INITRAMFS_BUILDER` - générateur d'initramfs (livekit, dracut)
- `LOCALE` - locale système (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - support multilingue (true/false)
- `KEEP_LOCALES` - conserver les locales (true/false)

**Variables calculées automatiquement (depuis `minioslib`) :**
- `DISTRIBUTION_TYPE` - type de distribution (debian, ubuntu) - déterminé automatiquement selon `DISTRIBUTION`
  - `legacy` : stretch, buster, orel, bionic
  - `current` : bullseye, bookworm, focal, jammy, noble
  - `future` : trixie, kali-rolling, sid

## Utilisation dans les modules

### Exemple de module multimédia

**`packages.list` :**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal variant
gstreamer1.0-plugins-bad -pv=minimum
gstreamer1.0-plugins-ugly -pv=minimum
gstreamer1.0-libav -pv=minimum

# Professional tools - only for toolbox and ultra
audacity +{pv=toolbox|pv=ultra}
kdenlive +{pv=toolbox|pv=ultra} +{de=xfce|de=lxqt}

---

# Distribution-specific packages from backports
ffmpeg @bookworm-backports +d=bookworm
```

### Exemple de module pilote

**`packages.list` :**
```text
# Basic drivers
mesa-utils
xserver-xorg-video-all

# NVIDIA drivers - only for non-free distributions
nvidia-driver +d=bookworm -{pv=minimum&de=core}

# AMD drivers - for modern distributions
firmware-amd-graphics +{d=trixie|d=noble}
mesa-vulkan-drivers +{d=trixie|d=noble}

# Old drivers - for old systems
xserver-xorg-video-radeon +d=bookworm
```

### Exemple de module de localisation

**`packages.list` :**
```text
# Basic locales - always
locales

# Russian localization
language-pack-ru +lo=ru_RU
fonts-liberation +lo=ru_RU
firefox-esr-l10n-ru +lo=ru_RU +{de=xfce|de=lxqt}

# Multilingual support
task-russian +ml=true +lo=ru_RU
hunspell-ru +ml=true +lo=ru_RU

# Keeping locales
vlc-l10n +kl=true +{pv=toolbox|pv=ultra}

# Regional settings for different locales
language-pack-pt +lo=pt_BR
language-pack-de +lo=de_DE
language-pack-fr +lo=fr_FR
```

## Exemples pour MiniOS

### Utilisation avancée des filtres dans MiniOS

**`packages.list` :**
```text
# DKMS modules with kernel and distribution conditions
ntfs3-dkms -ka=true -d=buster -d=trixie -d=sid
zfs-dkms +{pv=toolbox|pv=ultra} +da=amd64 +kbd=true -kf=none

# Drivers for old systems
broadcom-sta-dkms -d=jammy -ka=true -da=i386
aufs-dkms +dt=debian +d=buster

# Exclusion for new distributions
realtek-rtl8821cu-dkms -d=trixie -d=sid
firmware-b43-installer -d=bionic

# Complex alternatives with filters
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum

# Localization with exclusions and conditions
vlc-l10n -lo=en_US +{pv=toolbox|pv=ultra}
language-pack-gnome-ru-base +lo=ru_RU +dt=ubuntu
language-pack-gnome-ru-base +ml=true +dt=ubuntu
language-pack-gnome-ru-base +kl=true +dt=ubuntu
```

### Optimisation pour MiniOS

**Regroupement par fonctionnalité :**
```text
#=== Core System ===
systemd +pv=standard +pv=toolbox +pv=ultra
dbus

#=== Desktop Environment ===
xfce4-panel +de=xfce
lxqt-panel +de=lxqt
fluxbox +de=flux

#=== Applications by Variant ===
firefox-esr +{pv=standard|pv=toolbox|pv=ultra}
thunderbird +{pv=toolbox|pv=ultra}
libreoffice +pv=ultra
```

## Intégration avec le processus de construction MiniOS

### Variables d'environnement du module

Dans le contexte d'un module MiniOS, les variables suivantes sont disponibles :
- `$CWD` - répertoire courant du module
- `$LIVEKITNAME` - nom du système (généralement "minios")
- `$MODULE` - nom du module courant

### Utilisation de minioslib

```bash
#!/bin/bash
set -e

# Load MiniOS library
. /minioslib || exit 1

# Check module conditions
if [ "$PACKAGE_VARIANT" = "minimum" ] && [ "$DESKTOP_ENVIRONMENT" = "core" ]; then
    echo "Skipping module for minimal core build"
    exit 0
fi

# Install packages
/linux-live/condinapt \
    -l "$CWD/packages.list" \
    -c /linux-live/build.conf \
    -m /linux-live/condinapt.map
```

---






**Pour toute information complète sur les fonctionnalités de CondinAPT, veuillez consulter le document principal `CondinAPT.md`**
