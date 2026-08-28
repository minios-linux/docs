---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT no MiniOS: Guia de Integração

Este documento descreve os aspectos específicos do uso do CondinAPT no sistema de build do MiniOS.

> **Documentação Principal:** Para recursos básicos do CondinAPT, consulte o documento principal `CondinAPT.md`

## Índice

- [Integração com o Sistema de Build do MiniOS](#integracao-com-o-sistema-de-build-do-minios)
- [Configuração do MiniOS](#configuracao-do-minios)
- [Uso em Módulos](#uso-em-modulos)
- [Exemplos para MiniOS](#exemplos-para-minios)

## Integração com o Sistema de Build do MiniOS

### Uso em Módulos do MiniOS

O CondinAPT é uma ferramenta padrão para instalação de pacotes em módulos do MiniOS. Ele se integra ao processo de build por meio da interface padrão de módulos.

**No script de instalação do módulo (`install`):**
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

### Estrutura do Módulo MiniOS

Cada módulo em `/linux-live/scripts/` segue uma estrutura padronizada:

```
XX-module-name/
├── packages.list                     # Package list with conditions
├── install                           # Installation script (uses CondinAPT)
├── rootcopy-install/                 # (optional) Files to copy
└── rootcopy-postinstall/             # (optional) Files after installation
```

## Configuração do MiniOS

### Conteúdo de `condinapt.map` no MiniOS

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

### Variáveis de Configuração do MiniOS

**Principais variáveis de `build.conf`:**
- `DISTRIBUTION` - distribuição de destino (bookworm, trixie, jammy, noble)
- `DISTRIBUTION_ARCH` - arquitetura (amd64, i386, i386-pae)
- `DESKTOP_ENVIRONMENT` - ambiente de desktop (core, flux, xfce, lxqt)
- `PACKAGE_VARIANT` - variante de pacote (minimum, standard, toolbox, ultra)
- `INSTALL_KERNEL` - instalar pacote do kernel (true/false)
- `KERNEL_FLAVOUR` - flavor do kernel (none, rt, cloud)
- `KERNEL_PROVIDER` - provedor do pacote do kernel (distribution, minios)
- `MINIOS_KERNEL_SERIES` - série do kernel MiniOS (auto, 6.1, 6.12)
- `KERNEL_PAYLOAD_MODE` - modo de payload do kernel (runtime, full)
- `KERNEL_BUILD_DKMS` - compilar módulos DKMS (true/false)
- `INITRAMFS_BUILDER` - construtor do initramfs (livekit, dracut)
- `LOCALE` - localidade do sistema (C, en_US, ru_RU, es_ES, pt_BR)
- `MULTILINGUAL` - suporte multilíngue (true/false)
- `KEEP_LOCALES` - manter localidades (true/false)

**Variáveis calculadas automaticamente (de `minioslib`):**
- `DISTRIBUTION_PROFILE` - família de pacotes (debian ou ubuntu)
- `INIT_SYSTEM` - sistema de inicialização selecionado para o destino (systemd ou sysvinit)

`KERNEL_CAPABILITIES` é diferente das variáveis normais `build.conf`. O script de build
`01-kernel` cria esse array após o kernel selecionado ter sido instalado e inspecionado. O CondinAPT usa `kc` como um filtro exato de pertencimento ao array ao selecionar ferramentas de build opcionais e pacotes DKMS. Os valores atuais incluem `aufs`, `ntfs3`, `btf_modules` e os drivers suportados in-tree `rtw88_*`.

## Uso em Módulos

### Exemplo de Módulo Multimídia

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

### Exemplo de Módulo de Driver

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

### Exemplo de Módulo de Localização

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

## Exemplos para MiniOS

### Uso Avançado de Filtros no MiniOS

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

### Otimização para MiniOS

**Agrupamento por funcionalidade:**
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

## Integração com o Processo de Build do MiniOS

### Variáveis de Ambiente do Módulo

Dentro do contexto do módulo MiniOS, as seguintes variáveis estão disponíveis:
- `$CWD` - diretório atual do módulo
- `$LIVEKITNAME` - nome do sistema (geralmente "minios")
- `$MODULE` - nome do módulo atual

### Usando minioslib

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








**Para informações completas sobre os recursos do CondinAPT, consulte o documento principal `CondinAPT.md`**
