---
updated: 2026-08-28
program_commits:
  minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT in MiniOS: Integration Guide


This document describes the specific aspects of using CondinAPT in the MiniOS build system.

> **Main Documentation:** For basic CondinAPT features, see the main document `CondinAPT.md`

## Table of Contents

- [Integration with MiniOS Build System](#integration-with-minios-build-system)
- [MiniOS Configuration](#minios-configuration)
- [Usage in Modules](#usage-in-modules)
- [Examples for MiniOS](#examples-for-minios)

## Integration with MiniOS Build System

### Usage in MiniOS Modules

CondinAPT is a standard tool for package installation in MiniOS modules. It integrates into the build process through the standard module interface.

**In the module installation script (`install`):**
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

### MiniOS Module Structure

Each module in `/linux-live/scripts/` follows a standardized structure:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## MiniOS Configuration

### Contents of `condinapt.map` in MiniOS

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

### MiniOS Configuration Variables

**Main variables from `build.conf`:**
- `DISTRIBUTION` - target distribution (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - architecture (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - desktop environment (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - package variant (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - install kernel package (true/false)
- `KERNEL_FLAVOUR` - kernel flavour (none, rt, cloud)
- `KERNEL_PROVIDER` - kernel package provider (distribution, minios)
- `MINIOS_KERNEL_SERIES` - MiniOS kernel series (auto, 6.1, 6.12)
- `KERNEL_PAYLOAD_MODE` - kernel payload mode (runtime, full)
- `KERNEL_BUILD_DKMS` - build DKMS modules (true/false)
- `INITRAMFS_BUILDER` - initramfs builder (livekit, dracut)
- `LOCALE` - system locale (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - multilingual support (true/false)
- `KEEP_LOCALES` - keep locales (true/false)

**Automatically calculated variables (from `minioslib`):**
- `DISTRIBUTION_PROFILE` - package family (debian or ubuntu)
- `INIT_SYSTEM` - init system selected for the target (systemd or sysvinit)

`KERNEL_CAPABILITIES` is different from the normal `build.conf` variables. The
`01-kernel` build script creates this array after the selected kernel has been
installed and inspected. CondinAPT uses `kc` as an exact array-membership
filter while selecting optional build tools and DKMS packages. Current values
include `aufs`, `ntfs3`, `btf_modules`, and the supported in-tree `rtw88_*`
drivers.

## Usage in Modules

### Multimedia Module Example

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

### Driver Module Example

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

### Localization Module Example

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

## Examples for MiniOS

### Advanced Filter Usage in MiniOS

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

### Optimization for MiniOS

**Grouping by functionality:**
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

## Integration with MiniOS Build Process

### Module Environment Variables

Within the MiniOS module context, the following variables are available:
- `$CWD` - current module directory
- `$LIVEKITNAME` - system name (usually "minios")
- `$MODULE` - current module name

### Using minioslib

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

**For complete information on CondinAPT features, refer to the main document `CondinAPT.md`**
