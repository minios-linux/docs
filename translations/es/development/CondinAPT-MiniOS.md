---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT en MiniOS: Guía de Integración

Este documento describe los aspectos específicos del uso de CondinAPT en el sistema de construcción de MiniOS.

> **Documentación principal:** Para las funciones básicas de CondinAPT, consulta el documento principal `CondinAPT.md`

## Tabla de Contenidos

- [Integración con el sistema de construcción de MiniOS](#integracion-con-el-sistema-de-construccion-de-minios)
- [Configuración de MiniOS](#configuracion-de-minios)
- [Uso en módulos](#uso-en-modulos)
- [Ejemplos para MiniOS](#ejemplos-para-minios)

## Integración con el sistema de construcción de MiniOS

### Uso en módulos de MiniOS

CondinAPT es una herramienta estándar para la instalación de paquetes en los módulos de MiniOS. Se integra en el proceso de construcción a través de la interfaz estándar de módulos.

**En el script de instalación del módulo (`install`):**
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

### Estructura de los módulos de MiniOS

Cada módulo en `/linux-live/scripts/` sigue una estructura estandarizada:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Configuración de MiniOS

### Contenido de `condinapt.map` en MiniOS

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

### Variables de configuración de MiniOS

**Variables principales de `build.conf`:**
- `DISTRIBUTION` - distribución de destino (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - arquitectura (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - entorno de escritorio (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - variante de paquetes (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - instalar paquete del kernel (true/false)
- `KERNEL_FLAVOUR` - tipo de kernel (none, rt, cloud)
- `KERNEL_PROVIDER` - proveedor del paquete de kernel (distribution, minios)
- `MINIOS_KERNEL_SERIES` - serie del kernel de MiniOS (auto, 6.1, 6.12)
- `KERNEL_PAYLOAD_MODE` - modo de carga útil del kernel (runtime, full)
- `KERNEL_BUILD_DKMS` - compilar módulos DKMS (true/false)
- `INITRAMFS_BUILDER` - generador de initramfs (livekit, dracut)
- `LOCALE` - configuración regional del sistema (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - soporte multilingüe (true/false)
- `KEEP_LOCALES` - conservar configuraciones regionales (true/false)

**Variables calculadas automáticamente (de `minioslib`):**
- `DISTRIBUTION_PROFILE` - familia de paquetes (debian o ubuntu)
- `INIT_SYSTEM` - sistema de inicio seleccionado para el destino (systemd o sysvinit)

`KERNEL_CAPABILITIES` es diferente de las variables normales `build.conf`. El script de construcción de `01-kernel` crea este array después de que el kernel seleccionado ha sido instalado e inspeccionado. CondinAPT utiliza `kc` como un filtro exacto de pertenencia al array al seleccionar herramientas opcionales de compilación y paquetes DKMS. Los valores actuales incluyen `aufs`, `ntfs3`, `btf_modules` y los controladores soportados en árbol `rtw88_*`.

## Uso en módulos

### Ejemplo de módulo multimedia

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

### Ejemplo de módulo de drivers

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

### Ejemplo de módulo de localización

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

## Ejemplos para MiniOS

### Uso avanzado de filtros en MiniOS

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

### Optimización para MiniOS

**Agrupación por funcionalidad:**
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

## Integración con el proceso de construcción de MiniOS

### Variables de entorno del módulo

Dentro del contexto del módulo de MiniOS, están disponibles las siguientes variables:
- `$CWD` - directorio actual del módulo
- `$LIVEKITNAME` - nombre del sistema (normalmente "minios")
- `$MODULE` - nombre del módulo actual

### Uso de minioslib

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








**Para información completa sobre las funciones de CondinAPT, consulta el documento principal `CondinAPT.md`**
