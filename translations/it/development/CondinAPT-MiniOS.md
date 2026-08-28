---
updated: 2026-08-28
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
dp=DISTRIBUTION_PROFILE
is=INIT_SYSTEM
de=DESKTOP_ENVIRONMENT
pv=PACKAGE_VARIANT
ik=INSTALL_KERNEL
kf=KERNEL_FLAVOUR
kp=KERNEL_PROVIDER
kc=KERNEL_CAPABILITIES
kbd=KERNEL_BUILD_DKMS
ib=INITRAMFS_BUILDER
lo=LOCALE
ml=MULTILINGUAL
kl=KEEP_LOCALES
```

### Variabili di configurazione di MiniOS

**Principali variabili da `build.conf`:**
- `DISTRIBUTION` - distribuzione di destinazione (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - architettura (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - ambiente desktop (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - variante del pacchetto (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - installa il pacchetto kernel (true/false)
- `KERNEL_FLAVOUR` - tipo di kernel (none, rt, cloud)
- `KERNEL_PROVIDER` - fornitore del pacchetto kernel (distribution, minios)
- `MINIOS_KERNEL_SERIES` - serie kernel MiniOS (auto, 6.1, 6.12)
- `KERNEL_PAYLOAD_MODE` - modalità payload kernel (runtime, full)
- `KERNEL_BUILD_DKMS` - compila moduli DKMS (true/false)
- `INITRAMFS_BUILDER` - generatore initramfs (livekit, dracut)
- `LOCALE` - locale di sistema (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - supporto multilingua (true/false)
- `KEEP_LOCALES` - mantieni le localizzazioni (true/false)

**Variabili calcolate automaticamente (da `minioslib`):**
- `DISTRIBUTION_PROFILE` - famiglia del pacchetto (debian o ubuntu)
- `INIT_SYSTEM` - sistema di init selezionato per la destinazione (systemd o sysvinit)

`KERNEL_CAPABILITIES` è diversa dalle normali variabili `build.conf`. Lo script di build `01-kernel` crea questo array dopo che il kernel selezionato è stato installato e analizzato. CondinAPT utilizza `kc` come filtro esatto di appartenenza all’array durante la selezione degli strumenti di build opzionali e dei pacchetti DKMS. I valori attuali includono `aufs`, `ntfs3`, `btf_modules` e i driver in-tree supportati `rtw88_*`.

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
# Kernel build tools and DKMS modules selected from actual kernel capabilities
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
zfs-dkms +{pv=toolbox|pv=ultra} +da=amd64 +kbd=true -kf=none

# Distribution filters remain where package availability or compatibility requires them
broadcom-sta-dkms -d=jammy -da=i386
aufs-dkms +dp=debian +d=buster +d=beowulf -kc=aufs

# Do not build a vendor driver already provided by the selected kernel
realtek-rtl8821cu-dkms -kc=rtw88_8821cu
firmware-b43-installer -d=bionic

# Complex alternatives with filters
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum

# Localization with exclusions and conditions
vlc-l10n -lo=en_US +{pv=toolbox|pv=ultra}
language-pack-gnome-ru-base +lo=ru_RU +dp=ubuntu
language-pack-gnome-ru-base +ml=true +dp=ubuntu
language-pack-gnome-ru-base +kl=true +dp=ubuntu
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
