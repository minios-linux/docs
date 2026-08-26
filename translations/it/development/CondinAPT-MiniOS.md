---
updated: 2026-08-26
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT in MiniOS: Guida all'integrazione

Questo documento descrive gli aspetti specifici dell'utilizzo di CondinAPT nel sistema di build di MiniOS.

> **Documentazione principale:** Per le funzionalità di base di CondinAPT, consulta il documento principale `CondinAPT.md`

## Indice

- [Integrazione con il sistema di build di MiniOS](#integrazione-con-il-sistema-di-build-di-minios)
- [Configurazione di MiniOS](#configurazione-di-minios)
- [Utilizzo nei moduli](#utilizzo-nei-moduli)
- [Esempi per MiniOS](#esempi-per-minios)

## Integrazione con il sistema di build di MiniOS

### Utilizzo nei moduli MiniOS

CondinAPT è uno strumento standard per l'installazione dei pacchetti nei moduli MiniOS. Si integra nel processo di build tramite l'interfaccia standard dei moduli.

**Nello script di installazione del modulo (`install`):**
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

### Struttura del modulo MiniOS

Ogni modulo in `/linux-live/scripts/` segue una struttura standardizzata:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Configurazione di MiniOS

### Contenuto di `condinapt.map` in MiniOS

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

### Variabili di configurazione di MiniOS

**Variabili principali da `build.conf`:**
- `DISTRIBUTION` - distribuzione di destinazione (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - architettura (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - ambiente desktop (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - variante del pacchetto (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - installa il pacchetto kernel (true/false)
- `KERNEL_FLAVOUR` - flavour del kernel (none, rt, cloud)
- `KERNEL_AUFS` - supporto AUFS (true/false)
- `KERNEL_BUILD_DKMS` - build dei moduli DKMS (true/false)
- `INITRAMFS_BUILDER` - builder initramfs (livekit, dracut)
- `LOCALE` - locale di sistema (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - supporto multilingua (true/false)
- `KEEP_LOCALES` - mantieni le locali (true/false)

**Variabili calcolate automaticamente (da `minioslib`):**
- `DISTRIBUTION_TYPE` - tipo di distribuzione (debian, ubuntu) - determinato automaticamente in base a `DISTRIBUTION`
  - `legacy`: stretch, buster, orel, bionic
  - `current`: bullseye, bookworm, focal, jammy, noble
  - `future`: trixie, kali-rolling, sid

## Utilizzo nei moduli

### Esempio modulo Multimedia

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

### Esempio modulo Driver

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

### Esempio modulo Localizzazione

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

## Esempi per MiniOS

### Utilizzo avanzato dei filtri in MiniOS

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

### Ottimizzazione per MiniOS

**Raggruppamento per funzionalità:**
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

## Integrazione con il processo di build di MiniOS

### Variabili d'ambiente del modulo

Nel contesto del modulo MiniOS, sono disponibili le seguenti variabili:
- `$CWD` - directory corrente del modulo
- `$LIVEKITNAME` - nome del sistema (solitamente "minios")
- `$MODULE` - nome del modulo corrente

### Utilizzo di minioslib

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






**Per informazioni complete sulle funzionalità di CondinAPT, consulta il documento principale `CondinAPT.md`**
