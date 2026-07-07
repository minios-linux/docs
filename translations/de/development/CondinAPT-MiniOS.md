# CondinAPT in MiniOS: Integrationsleitfaden

Dieses Dokument beschreibt die spezifischen Aspekte der Nutzung von CondinAPT im MiniOS-Build-System.

> **📚 Hauptdokumentation:** Für grundlegende Funktionen von CondinAPT siehe das Hauptdokument `CondinAPT.md`

## Inhaltsverzeichnis

- [Integration mit dem MiniOS-Build-System](#integration-mit-dem-minios-build-system)
- [MiniOS-Konfiguration](#minios-konfiguration)
- [Verwendung in Modulen](#verwendung-in-modulen)
- [Beispiele für MiniOS](#beispiele-für-minios)

## Integration mit dem MiniOS-Build-System

### Verwendung in MiniOS-Modulen

CondinAPT ist ein Standardwerkzeug zur Paketinstallation in MiniOS-Modulen. Es integriert sich über das Standard-Modul-Interface in den Build-Prozess.

**Im Modul-Installationsskript (`install`):**
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

### MiniOS Modulstruktur

Jedes Modul in `/linux-live/scripts/` folgt einer standardisierten Struktur:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## MiniOS-Konfiguration

### Inhalt von `condinapt.map` in MiniOS

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

### MiniOS-Konfigurationsvariablen

**Hauptvariablen aus `build.conf`:**
- `DISTRIBUTION` – Ziel-Distribution (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` – Architektur (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` – Desktop-Umgebung (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` – Paketvariante (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` – Kernel-Paket installieren (true/false)
- `KERNEL_FLAVOUR` – Kernel-Variante (none, rt, cloud)
- `KERNEL_AUFS` – AUFS-Unterstützung (true/false)
- `KERNEL_BUILD_DKMS` – DKMS-Module bauen (true/false)
- `INITRAMFS_BUILDER` – Initramfs-Builder (livekit, dracut)
- `LOCALE` – System-Locale (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` – Mehrsprachigkeit (true/false)
- `KEEP_LOCALES` – Locales beibehalten (true/false)

**Automatisch berechnete Variablen (aus `minioslib`):**
- `DISTRIBUTION_TYPE` – Distributions-Typ (debian, ubuntu) – wird automatisch anhand von `DISTRIBUTION` bestimmt
  - `legacy`: stretch, buster, orel, bionic
  - `current`: bullseye, bookworm, focal, jammy, noble  
  - `future`: trixie, kali-rolling, sid

## Verwendung in Modulen

### Beispiel für ein Multimedia-Modul

**`packages.list`:**
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

### Beispiel für ein Treibermodul

**`packages.list`:**
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

### Beispiel für ein Lokalisierungsmodul

**`packages.list`:**
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

## Beispiele für MiniOS

### Erweiterte Filterverwendung in MiniOS

**`packages.list`:**
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

### Optimierung für MiniOS

**Gruppierung nach Funktionalität:**
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

## Integration mit dem MiniOS-Build-Prozess

### Modul-Umgebungsvariablen

Im Kontext eines MiniOS-Moduls stehen folgende Variablen zur Verfügung:
- `$CWD` – aktuelles Modulverzeichnis
- `$LIVEKITNAME` – Systemname (meistens "minios")
- `$MODULE` – aktueller Modulname

### Verwendung von minioslib

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


**Für vollständige Informationen zu den Funktionen von CondinAPT siehe das Hauptdokument `CondinAPT.md`**
