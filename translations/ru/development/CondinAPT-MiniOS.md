---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT в MiniOS: Руководство по интеграции

В этом документе описаны особенности использования CondinAPT в системе сборки MiniOS.

> **Основная документация:** Для базовых возможностей CondinAPT см. основной документ `CondinAPT.md`

## Оглавление

- [Интеграция с системой сборки MiniOS](#integration-with-minios-build-system)
- [Конфигурация MiniOS](#minios-configuration)
- [Использование в модулях](#usage-in-modules)
- [Примеры для MiniOS](#examples-for-minios)

## Интеграция с системой сборки MiniOS

### Использование в модулях MiniOS

CondinAPT — стандартный инструмент для установки пакетов в модулях MiniOS. Он интегрируется в процесс сборки через стандартный интерфейс модуля.

**В скрипте установки модуля (`install`):**
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

### Структура модуля MiniOS

Каждый модуль в `/linux-live/scripts/` имеет стандартизированную структуру:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Конфигурация MiniOS

### Содержимое `condinapt.map` в MiniOS

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

### Переменные конфигурации MiniOS

**Основные переменные из `build.conf`:**
- `DISTRIBUTION` — целевой дистрибутив (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` — архитектура (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` — рабочее окружение (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` — вариант набора пакетов (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` — устанавливать пакет ядра (true/false)
- `KERNEL_FLAVOUR` — тип ядра (none, rt, cloud)
- `KERNEL_PROVIDER` — поставщик пакета ядра (distribution, minios)
- `MINIOS_KERNEL_SERIES` — серия ядра MiniOS (auto, 6.1, 6.12)
- `KERNEL_PAYLOAD_MODE` — режим загрузки ядра (runtime, full)
- `KERNEL_BUILD_DKMS` — собирать модули DKMS (true/false)
- `INITRAMFS_BUILDER` — сборщик initramfs (livekit, dracut)
- `LOCALE` — системная локаль (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` — поддержка мультиязычности (true/false)
- `KEEP_LOCALES` — сохранять локали (true/false)

**Автоматически рассчитываемые переменные (из `minioslib`):**
- `DISTRIBUTION_PROFILE` — семейство пакетов (debian или ubuntu)
- `INIT_SYSTEM` — выбранная для цели система инициализации (systemd или sysvinit)

`KERNEL_CAPABILITIES` отличается от обычных переменных `build.conf`. Скрипт сборки `01-kernel` формирует этот массив после установки и анализа выбранного ядра. CondinAPT использует `kc` как точный фильтр по членству в массиве при выборе дополнительных инструментов сборки и пакетов DKMS. Текущие значения включают `aufs`, `ntfs3`, `btf_modules`, а также поддерживаемые встроенные драйверы `rtw88_*`.

## Использование в модулях

### Пример мультимедийного модуля

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

### Пример модуля драйверов

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

### Пример модуля локализации

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

## Примеры для MiniOS

### Продвинутое использование фильтра в MiniOS

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

### Оптимизация для MiniOS

**Группировка по функционалу:**
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

## Интеграция с процессом сборки MiniOS

### Переменные окружения модуля

В контексте модуля MiniOS доступны следующие переменные:
- `$CWD` — текущий каталог модуля
- `$LIVEKITNAME` — имя системы (обычно "minios")
- `$MODULE` — имя текущего модуля

### Использование minioslib

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





**Для получения полной информации о возможностях CondinAPT смотрите основной документ `CondinAPT.md`**
