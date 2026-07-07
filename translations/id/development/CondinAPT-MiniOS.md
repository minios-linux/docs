# CondinAPT di MiniOS: Panduan Integrasi

Dokumen ini menjelaskan aspek-aspek spesifik penggunaan CondinAPT dalam sistem build MiniOS.

> **📚 Dokumentasi Utama:** Untuk fitur dasar CondinAPT, lihat dokumen utama `CondinAPT.md`

## Daftar Isi

- [Integrasi dengan Sistem Build MiniOS](#integrasi-dengan-sistem-build-minios)
- [Konfigurasi MiniOS](#konfigurasi-minios)
- [Penggunaan di Modul](#penggunaan-di-modul)
- [Contoh untuk MiniOS](#contoh-untuk-minios)

## Integrasi dengan Sistem Build MiniOS

### Penggunaan di Modul MiniOS

CondinAPT adalah alat standar untuk instalasi paket di modul MiniOS. CondinAPT terintegrasi dalam proses build melalui antarmuka modul standar.

**Pada skrip instalasi modul (`install`):**
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

### Struktur Modul MiniOS

Setiap modul di `/linux-live/scripts/` mengikuti struktur yang sudah distandarisasi:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Konfigurasi MiniOS

### Isi dari `condinapt.map` di MiniOS

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

### Variabel Konfigurasi MiniOS

**Variabel utama dari `build.conf`:**
- `DISTRIBUTION` - distribusi target (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - arsitektur (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - lingkungan desktop (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - varian paket (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - instal paket kernel (true/false)
- `KERNEL_FLAVOUR` - varian kernel (none, rt, cloud)
- `KERNEL_AUFS` - dukungan AUFS (true/false)
- `KERNEL_BUILD_DKMS` - build modul DKMS (true/false)
- `INITRAMFS_BUILDER` - builder initramfs (livekit, dracut)
- `LOCALE` - locale sistem (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - dukungan multibahasa (true/false)
- `KEEP_LOCALES` - simpan locale (true/false)

**Variabel yang dihitung otomatis (dari `minioslib`):**
- `DISTRIBUTION_TYPE` - tipe distribusi (debian, ubuntu) - ditentukan otomatis berdasarkan `DISTRIBUTION`
  - `legacy`: stretch, buster, orel, bionic
  - `current`: bullseye, bookworm, focal, jammy, noble  
  - `future`: trixie, kali-rolling, sid

## Penggunaan di Modul

### Contoh Modul Multimedia

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

### Contoh Modul Driver

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

### Contoh Modul Lokalisasi

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

## Contoh untuk MiniOS

### Penggunaan Filter Lanjutan di MiniOS

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

### Optimasi untuk MiniOS

**Pengelompokan berdasarkan fungsionalitas:**
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

## Integrasi dengan Proses Build MiniOS

### Variabel Lingkungan Modul

Dalam konteks modul MiniOS, variabel berikut tersedia:
- `$CWD` - direktori modul saat ini
- `$LIVEKITNAME` - nama sistem (biasanya "minios")
- `$MODULE` - nama modul saat ini

### Menggunakan minioslib

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


**Untuk informasi lengkap tentang fitur CondinAPT, silakan lihat dokumen utama `CondinAPT.md`**
