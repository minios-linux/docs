---
updated: 2026-10-15
---

# Conteúdo dos pacotes e das edições

O conteúdo dos pacotes da MiniOS é gerado a partir de listas condicionais de fontes. O conjunto final depende da suíte de distribuição, da arquitetura, do sistema init, do ambiente de desktop, da localidade, das opções do kernel e da disponibilidade nos repositórios. Esta página documenta os pacotes voltados ao usuário solicitados pelos manifestos mantidos do Flux e do Xfce. Ela não inclui toolchains usadas apenas na compilação nem dependências instaladas pelo APT.

`Yes` significa que o manifesto atual solicita o pacote para essa edição.
`Conditional` significa que o nome ou a inclusão do pacote depende de uma opção de compilação ou da plataforma de destino. Um traço indica que a edição não o solicita.
A imagem concluída continua sendo a referência definitiva.

## Estrutura das edições

As edições Xfce mantidas são construídas umas sobre as outras: Standard é um desktop compacto para o dia a dia; Toolbox é voltada à administração profissional de sistemas, diagnósticos e recuperação; e Ultra transforma essa base em um desktop completo para trabalho geral, criatividade e desenvolvimento. Flux é uma configuração Fluxbox independente e ultraleve, feita para consumir poucos recursos e funcionar em hardware mais antigo; não é simplesmente uma lista menor de pacotes Xfce.

| Edição | Variante do pacote e ambiente | Objetivo principal |
|---|---|---|
| **Standard** | `standard` com `xfce` | Desktop Xfce básico e minimalista para o dia a dia |
| **Toolbox** | `toolbox` com `xfce` | Administração profissional de sistemas, diagnósticos e recuperação |
| **Ultra** | `ultra` com `xfce` | Desktop completo para trabalho geral, criatividade e desenvolvimento |
| **Flux** | `minimum` com `flux` | Desktop Fluxbox ultraleve para uso mínimo de recursos e hardware mais antigo |

Outros ambientes com suporte têm suas próprias cadeias de módulos e devem ser verificados separadamente. Em particular, não se deve deduzir a disponibilidade de pacotes em uma compilação LXQt ou de console com base nas tabelas do Xfce abaixo.

## Pacotes principais de MiniOS e do sistema

Esses pacotes fornecem o ambiente de execução do sistema live, configuração, localização, gerenciamento de privilégios e o ambiente básico de linha de comando.

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Sim | Sim | Sim | Sim | Criação, conversão, inspeção, ativação de módulos e captura de alterações |
| `minios-image-compose` | - | Sim | Sim | Sim | Composição de ISO de linha de comando com MiniOS |
| `minios-deploy`, `minios-kernel`, `minios-session` | - | Sim | Sim | Sim | Backends de implantação por linha de comando, kernel e sessão, independentemente dos aplicativos gráficos |
| `minios-live-config` | Sim | Sim | Sim | Sim | Componentes de configuração da sessão live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Condicional | Condicional | Condicional | Condicional | Integração com o sistema init; uma implementação é selecionada |
| `minios-live-config-doc` | Sim | Sim | Sim | Sim | Referência instalada do live-config |
| `minios-welcome` | Sim | Sim | Sim | Sim | Página de boas-vindas e inicializador do MiniOS |
| `user-setup` | Sim | Sim | Sim | Sim | Configuração da conta de usuário live |
| `linux-base` | Sim | Sim | Sim | Sim | Scripts comuns de imagem Linux e do sistema |
| `kbd`, `keyboard-configuration`, `console-setup` | Sim | Sim | Sim | Sim | Configuração de teclado e tela do console |
| `locales` | Sim | Sim | Sim | Sim | Dados e geração de localidades |
| `network-manager` | Sim | Sim | Sim | Sim | Gerenciamento de conexões de rede |
| `netplan.io` | Condicional | Condicional | Condicional | Condicional | Solicitado somente nas suítes Ubuntu compatíveis |
| `dracut-core` | Condicional | Condicional | Condicional | Condicional | Solicitado quando o Dracut é usado para criar o initramfs |
| `gpg`, `gnupg` | Sim | Sim | Sim | Sim | Ferramentas para assinatura de pacotes e arquivos |
| `file`, `cpio` | Sim | Sim | Sim | Sim | Identificação de arquivos e manipulação de arquivos compactados |
| `gettext-base` / `gettext` | Condicional | Condicional | Condicional | Condicional | Utilitários de tradução selecionados conforme a disponibilidade |
| `polkitd` / `policykit-1`, `pkexec` | Condicional | Condicional | Condicional | Condicional | Autorização e elevação de privilégios |
| `bash-completion` | Sim | Sim | Sim | Sim | Conclusão de comandos do shell |
| `man-db` | Sim | Sim | Sim | Sim | Leitor e banco de dados de páginas de manual |
| `mc` | Sim | Sim | Sim | Sim | Gerenciador de arquivos Midnight Commander |
| `gpm` | Sim | Sim | Sim | Sim | Suporte a mouse no console |
| `ssh` | Sim | Sim | Sim | Sim | Pacotes cliente e servidor OpenSSH selecionados pelo APT |
| `systemd-timesyncd` / `chrony` | Condicional | Condicional | Condicional | Condicional | Sincronização de horário definida pela suíte e pelo sistema init |
| `tlp` | Sim | Sim | Sim | Sim | Gerenciamento de energia em laptops |

Alguns pacotes de compatibilidade de bootstrap são solicitados somente para suítes-base específicas.
Eles são dependências de implementação, não recursos das edições, e por isso não são listados individualmente aqui.

## Ferramentas de rede

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Sim | Sim | Sim | Sim | Autenticação sem fio WPA/WPA2 |
| `rfkill` | Sim | Sim | Sim | Sim | Controle do estado de dispositivos sem fio |
| `usb-modeswitch` | Sim | Sim | Sim | Sim | Modems USB e alternância entre modos de dispositivo |
| `dnsmasq-base` | - | Sim | Sim | Sim | Suporte a DNS e DHCP usado pelos fluxos de trabalho de rede |
| `cifs-utils` | - | Sim | Sim | Sim | Cliente de sistema de arquivos de rede SMB/CIFS |
| `nfs-common` | - | Sim | Sim | Sim | Suporte a cliente NFS |
| `ipset` | - | Sim | Sim | Sim | Administração de conjuntos IP do kernel |
| `whois` | - | Sim | Sim | Sim | Consulta de domínios e registros de endereços |
| `netcat`, `netcat-openbsd` | - | - | Sim | Sim | Ferramentas de teste de fluxos TCP e UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Sim | Sim | Descoberta de rede, transferência e comparação de varreduras |
| `iw` | - | - | Sim | Sim | Configuração de dispositivos sem fio e conexões |
| `iperf3` | - | - | Sim | Sim | Teste de taxa de transferência da rede |
| `aria2` | - | - | Sim | Sim | Utilitário de download multiprotocolo |
| `davfs2` | - | - | Sim | Sim | Cliente de sistema de arquivos WebDAV |
| `sshfs` | - | - | Sim | Sim | Acesso a sistemas de arquivos via SSH |
| `open-iscsi` | - | - | - | Sim | Iniciador iSCSI |
| `tgt` | - | - | - | Sim | Serviço de destino iSCSI |

## Armazenamento e sistemas de arquivos

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Sim | Sim | Sim | Sim | Inspeção e ajuste de dispositivos ATA e SCSI |
| `mdadm` | Sim | Sim | Sim | Sim | Gerenciamento de RAID por software no Linux |
| `smartmontools` | Sim | Sim | Sim | Sim | Monitoramento e testes S.M.A.R.T. |
| `dosfstools` | Sim | Sim | Sim | Sim | Criação e verificação de sistemas de arquivos FAT |
| `ntfs-3g` | Sim | Sim | Sim | Sim | Driver de NTFS em espaço de usuário e ferramentas |
| `btrfs-progs` | Sim | Sim | Sim | Sim | Administração do Btrfs |
| `xfsprogs` | - | Sim | Sim | Sim | Administração do XFS |
| `exfatprogs` / `exfat-utils` com `exfat-fuse` | - | Condicional | Condicional | Condicional | Implementação do exFAT definida pela disponibilidade do pacote |
| `fuse3` / `fuse`, `libfuse2` | - | Condicional | Condicional | Condicional | Biblioteca de compatibilidade e ambiente de execução do FUSE |
| `dynfilefs` | - | Condicional | Condicional | Condicional | Armazenamento de persistência segmentado em distribuições compatíveis |
| `dynblk` | - | Sim | Sim | Sim | CLI para armazenamento thin DynBlk com suporte do kernel e VMDK dividido; para usar as sessões, também são necessários o driver e um initrd compatível |
| `parted` | - | Sim | Sim | Sim | Criação e edição de tabelas de partição |
| `gpart` | - | - | Sim | Sim | Recuperação de tabelas de partição |
| `mtools` | - | - | Sim | Sim | Ferramentas para mídia FAT e DOS |
| `gddrescue` | - | - | Sim | Sim | Cópia tolerante a falhas de dispositivos de bloco |
| `lvm2` | - | - | Sim | Sim | Gerenciador de volumes lógicos |
| `cryptsetup` | - | - | Sim | Sim | Gerenciamento de volumes LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Sim | Sim | Gerenciamento e montagem de volumes criptografados |
| `f2fs-tools` | - | - | Sim | Sim | Administração do F2FS |
| `hfsutils`, `hfsprogs` | - | - | Sim | Sim | Ferramentas para HFS e HFS+, quando disponíveis |
| `jfsutils` | - | - | Sim | Sim | Administração do JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Sim | Sim | Ferramentas para ReiserFS e Reiser4, quando disponíveis |
| `udftools` | - | - | Sim | Sim | Ferramentas do sistema de arquivos UDF para mídia óptica |
| `nilfs-tools` | - | - | Sim | Sim | Administração do NILFS2 |
| `zfsutils-linux` | - | - | Condicional | Condicional | Ferramentas de espaço de usuário do ZFS quando a compilação do kernel oferece suporte ao ZFS |

## Arquivos compactados e formatos de imagem

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Sim | Sim | Sim | Sim | Compactação usada por pacotes, módulos e imagens |
| `zip`, `unzip` | Sim | Sim | Sim | Sim | Criação e extração de arquivos ZIP |
| `xorriso` | Sim | Sim | Sim | Sim | Criação e inspeção de imagens ISO |
| `squashfs-tools` | Sim | Sim | Sim | Sim | Criação e extração de módulos SquashFS |
| `lz4` / `liblz4-tools` | - | Condicional | Condicional | Condicional | Implementação de LZ4 definida pela disponibilidade |
| `bzip2` | - | Sim | Sim | Sim | Compactação bzip2 |
| `7zip` | - | Sim | Sim | Sim | Formatos de arquivo compactado 7z e relacionados |
| `genisoimage` | - | Sim | Sim | Sim | Criação de imagens ISO-9660 |
| `pv` | - | - | Sim | Sim | Exibição do progresso de processos encadeados |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Sim | Sim | Ferramentas de compactação paralela |
| `lrzip`, `lzop` | - | - | Sim | Sim | Formatos de compactação adicionais |
| `cabextract` | - | - | Sim | Sim | Extração de arquivos Microsoft Cabinet |
| `xmount` | - | - | Sim | Sim | Conversão e montagem de formatos de imagem de disco |

## Recuperação, diagnóstico e desempenho

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Sim | Sim | Sim | Sim | Inspeção de dispositivos PCI e USB |
| `psmisc` | Sim | Sim | Sim | Sim | Ferramentas de processos, como `fuser` e `killall` |
| `htop` | - | Sim | Sim | Sim | Monitor interativo de processos |
| `ncdu` | - | Sim | Sim | Sim | Analisador de uso de disco no terminal |
| `lsof` | - | Sim | Sim | Sim | Inspeção de arquivos abertos e processos |
| `clonezilla` | - | - | Sim | Sim | Fluxos de clonagem de discos e partições |
| `partclone`, `partimage` | - | - | Sim | Sim | Ferramentas de criação de imagens compatíveis com sistemas de arquivos |
| `testdisk` | - | - | Sim | Sim | Recuperação de partições e arquivos |
| `chntpw`, `reglookup` | - | - | Sim | Sim | Ferramentas offline para contas e registro do Windows |
| `hexedit` | - | - | Sim | Sim | Editor hexadecimal para terminal |
| `lshw`, `inxi` | - | - | Sim | Sim | Relatórios detalhados de hardware e sistema |
| `screen` | - | - | Sim | Sim | Multiplexador de terminal |
| `nmon` | - | - | Sim | Sim | Monitor interativo de desempenho |
| `fio`, `bonnie++`, `iozone3` | - | - | Sim | Sim | Benchmarks de armazenamento e sistemas de arquivos |
| `stress`, `sysbench` | - | - | Sim | Sim | Benchmarks de CPU, memória e sistema |
| `memtest86+` | - | - | Sim | Sim | Teste de memória durante a inicialização |
| `rsync` | - | - | Sim | Sim | Utilitário de sincronização e cópia de arquivos |
| `git` | - | - | Sim | Sim | Cliente de controle de versão |

## Virtualização e contêineres

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Sim | Sim | Integração de máquinas virtuais com VMware e QEMU |
| `virtualbox-guest-utils` | - | - | Condicional | Condicional | Integração de máquinas virtuais com VirtualBox em distribuições selecionadas |
| `hyperv-daemons` | - | - | Sim | Sim | Serviços de máquina virtual do Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Sim | Sim | Ambiente de execução e ferramentas de imagem para máquinas virtuais |
| `libvirt-daemon-system` | - | - | Sim | Sim | Serviço libvirt do sistema |
| `virt-what` | - | - | Sim | Sim | Detecção de hipervisor |
| `uidmap` | - | - | - | Sim | Mapeamento de IDs de namespace de usuário |
| Pilha do Docker CE / `docker.io` com `docker-compose` | - | - | - | Condicional | Ambiente de execução de contêiner selecionado entre os disponíveis no repositório |
| `lazydocker` | - | - | - | Sim | Interface de terminal para Docker |
| `selinux-policy-default` | - | - | - | Sim | Pacote de política SELinux padrão |

## Firmware e drivers de kernel

A seleção de firmware segue o perfil da distribuição: as compilações Debian e Devuan usam pacotes de firmware separados, enquanto as compilações Ubuntu usam `linux-firmware`. Os drivers DKMS também são filtrados por arquitetura, provedor do kernel, série do kernel e recursos já fornecidos pelo kernel selecionado.

| Pacote | Edições | Finalidade ou condição |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Condicional, todas | Coleções de firmware do Debian e Devuan |
| `firmware-intel-graphics` | Condicional, todas | Firmware gráfico Intel no Trixie e Excalibur |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Condicional, todas | Firmware sem fio para dispositivos Atheros, Intel e ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Condicional, todas | Firmware Realtek e MediaTek; o MediaTek depende da suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Condicional, todas | Firmware de rede Broadcom e Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Condicional, todas | Famílias adicionais de firmware sem fio |
| `firmware-b43-installer` | Condicional, todas | Instalador do firmware Broadcom B43 legado |
| `firmware-sof-signed` | Condicional, todas | Imagens do Sound Open Firmware |
| `linux-firmware-minimal` / `linux-firmware` e pacotes de firmware de fabricantes | Condicional, todas | Alternativa de firmware básico do Ubuntu, além de pacotes AMD, Intel, Broadcom, MediaTek, Qualcomm, Marvell e Realtek específicos da suite |
| `ntfs3-dkms` | Condicional, todas | Driver NTFS3 quando não estiver disponível no kernel selecionado |
| `aufs-dkms` / `aufs-ng-dkms` | Condicional, todas | AUFS selecionado de acordo com a suite e o kernel |
| `dynblk-dkms` | Condicional, todas | Driver DynBlk selecionado para Linux 6.12 quando a compilação DKMS está habilitada; não assinado e indisponível com o Secure Boot |
| `broadcom-sta-dkms` | Condicional, todas | Driver sem fio Broadcom STA nos destinos compatíveis |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Condicional, todas | Drivers sem fio de fabricantes filtrados pelos recursos do kernel integrado e pela plataforma de destino |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Condicional, todas | Drivers de fabricantes mantidos nos destinos compatíveis para dispositivos ou recursos adicionais |
| `zfs-dkms` | Condicional, Toolbox e Ultra | Módulo de kernel ZFS nas compilações amd64 compatíveis |

Os pacotes de tela/câmera do MateBook E estão disponíveis para instalação separada, com as limitações descritas em [Compatibilidade de hardware](/getting-started/Hardware-Compatibility). As listas de pacotes de desenvolvimento podem selecionar esses drivers, mas isso não garante que eles serão incluídos nas imagens da versão final.

## Base gráfica

Os ambientes gráficos compartilham a base Xorg e de renderização abaixo. O Flux usa sua própria lista de desktop; Standard, Toolbox e Ultra usam a lista mantida do Xfce.

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Sim | Sim | Sim | Sim | Servidor X.Org e ferramentas de inicialização |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Sim | Sim | Sim | Sim | Drivers de vídeo X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Sim | Sim | Sim | Sim | Drivers de entrada e suporte a inicialização legada |
| `xterm` | Sim | Sim | Sim | Sim | Terminal X básico |
| `blackbox` / `openbox` | Condicional | Condicional | Condicional | Condicional | Gerenciador de janelas leve de contingência selecionado pelo ambiente |
| `x11-utils`, `wmctrl`, `xdotool` | Sim | Sim | Sim | Inspeção do X11 e automação de janelas | , |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Sim | Sim | Sim | Sim | Bibliotecas de renderização DRM e Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Sim | Sim | Sim | Sim | Temas de cursor e ícones |
| `elementary-minios-icon-theme` | Sim | Sim | Sim | Sim | Tema de ícones MiniOS fora do LXQt |
| `librsvg2-common` | Sim | Sim | Sim | Sim | Suporte à renderização SVG |
| `fonts-inter-minimal`, `fonts-jetbrains-mono-minimal` | Sim | Sim | Sim | Sim | Fontes para interface e monoespaçadas |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Condicional | Condicional | Condicional | Condicional | Agente gráfico do PolicyKit selecionado conforme disponibilidade |
| `xrdp`, `xorgxrdp` | - | - | Sim | Sim | Login gráfico remoto por RDP |

## Desktop Flux e aplicativos

| Pacote | Finalidade ou condição |
|---|---|
| `fluxbox-flux` | Configuração do gerenciador de janelas Fluxbox MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Painel e indicador de layout do teclado |
| `xwallpaper`, `gpicview` / `feh` | Papel de parede e visualização de imagens |
| `compton` | Compositor X |
| `alsa-utils`, `volumeicon-alsa` | Controles de áudio ALSA |
| `systrayicon`, `cbatticon` | Indicadores da bandeja e da bateria |
| `xlunch`, `gtkask`, `flux-tools` | Inicializador e utilitários do desktop Flux MiniOS |
| `scrot` | Utilitário de captura de tela |
| `mousepad`, `pcmanfm` | Editor de texto e gerenciador de arquivos |
| `galculator`, `lxtask`, `xarchiver` | Calculadora, gerenciador de tarefas e gerenciador de arquivos compactados |
| `network-manager-gnome` | Applet de desktop do NetworkManager |
| `firefox` / `firefox-esr` | Navegador selecionado pela suite, com pacotes de localização selecionados |

## Desktop Xfce e aplicativos MiniOS

| Pacote | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Sim | Sim | Sim | Gerenciador de arquivos e integração com mídias removíveis |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Sim | Sim | Sim | As configurações usam o pacote adaptado ao MiniOS, com escala automática da interface no Trixie/Excalibur |
| `xfdesktop4`, `xfconf` | Sim | Sim | Sim | Desktop e serviço de configuração; Trixie/Excalibur usam a integração de menu do desktop MiniOS |
| `xfwm4-gl` / `xfwm4` | Condicional | Condicional | Condicional | Trixie/Excalibur selecionam `xfwm4-gl` com OpenGL/XRender, efeitos e Peek; as outras suites selecionam `xfwm4` |
| `xfce4-tasklist-minios-plugin`, `xfce4-showdesktop-minios-plugin` | Condicional | Condicional | Condicional | Barra de tarefas fixa MiniOS, prévias agrupadas e faixa Mostrar área de trabalho no Trixie/Excalibur |
| `greybird-minios-gtk-theme` / `greybird-gtk-theme` | Condicional | Condicional | Condicional | Tema claro/escuro MiniOS, com o tema da distribuição como alternativa quando não estiver disponível |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Sim | Sim | Sim | Localizador de aplicativos e indicador de teclado |
| `mousepad`, `ristretto` | Sim | Sim | Sim | Editor de texto e visualizador de imagens |
| `at-spi2-core`, `dbus-x11` | Sim | Sim | Sim | Acessibilidade e suporte ao barramento de mensagens do desktop |
| `gvfs-backends` | Sim | Sim | Sim | Integração de sistemas de arquivos remotos e removíveis com o gerenciador de arquivos |
| `lightdm`, `lightdm-gtk-greeter` | Sim | Sim | Sim | Gerenciador gráfico de login |
| `network-manager-gnome`, `blueman` | Sim | Sim | Sim | Controles de rede e Bluetooth do desktop |
| `avahi-daemon` | Sim | Sim | Sim | Descoberta de serviços na rede local |
| Pilha PipeWire / pilha PulseAudio | Condicional | Condicional | Condicional | Áudio do desktop selecionado pela suite |
| `pavucontrol` | Sim | Sim | Sim | Mixer gráfico de áudio |
| `engrampa`, `thunar-archive-plugin` | Sim | Sim | Sim | Gerenciador de arquivos compactados e integração com o gerenciador de arquivos |
| `xfce4-screensaver`, `xfce4-screenshooter` | Sim | Sim | Sim | Bloqueio de tela e capturas de tela |
| `xfce4-power-manager-plugins` | Sim | Sim | Sim | Integração de gerenciamento de energia do Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Sim | Sim | Sim | Gerenciador de tarefas e emulador de terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Sim | Sim | Sim | Menu de aplicativos e notificações |
| `minios-configurator` | Sim | Sim | Sim | Editor de configuração de inicialização e sessão MiniOS |
| `minios-installer` | Sim | Sim | Sim | Instalador gráfico e `minios-deploy` CLI |
| `minios-session-manager` | Sim | Sim | Sim | Gerenciador de sessão persistente e `minios-session` CLI |
| `minios-kernel-manager` | Sim | Sim | Sim | Gerenciador modular de kernel e `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Sim | Sim | Sim | Catálogo e instalador de aplicativos MiniOS |
| `minios-image-builder` | Sim | Sim | Sim | Ambiente gráfico para remasterização de ISO |
| `minios-module-manager` | Sim | Sim | Sim | Gerenciador gráfico de módulo`.sb` module manager |
| `minios-help` | Sim | Sim | Sim | Visualizador da documentação instalada MiniOS |
| `driveutility` | Sim | Sim | Sim | Gravação, leitura, formatação e apagamento de imagens de disco |
| `firefox` / `firefox-esr` | Condicional | Condicional | Condicional | Navegador e localização selecionados pela suite e localidade |
| `menulibre` | - | Sim | Sim | Editor gráfico de menu |
| `open-vm-tools-desktop` | - | Sim | Sim | Integração do desktop com VMware |
| `virtualbox-guest-x11` | - | Condicional | Condicional | Integração do desktop com VirtualBox em suites selecionadas |
| Temas de plataforma GTK para Qt | - | Sim | Sim | Integração da aparência GTK para aplicativos Qt |

## Aplicativos gráficos do Toolbox

O Xfce `05-apps` módulo está incluído no Toolbox e no Ultra e não é instalado no Standard.

| Pacote | Finalidade ou condição |
|---|---|
| `gparted` | Editor gráfico de partições |
| `gsmartcontrol`, `qdiskinfo` | Saúde do disco e informações do dispositivo |
| `guymager`, `qphotorec` | Criação de imagens forenses e recuperação de arquivos; `qphotorec` não está incluído no Buster e no Beowulf |
| `kdiskmark` | Benchmark de disco |
| `isomaster` | Editor de imagens ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnóstico de hardware e gráficos |
| `baobab` | Analisador gráfico de uso do disco |
| `doublecmd-gtk` | Gerenciador de arquivos com dois painéis |
| `grsync` | Interface gráfica `rsync` de |
| `bleachbit` | Limpeza de cache e arquivos temporários |
| `czkawka` / `czkawka-gui` | Localizador de arquivos duplicados e indesejados |
| `gtkhash` | Calculadora de checksum |
| `wxhexeditor` | Editor hexadecimal de arquivos grandes |
| `keepassxc` | Gerenciador de senhas |
| `veracrypt` | Gerenciamento de contêineres criptografados e discos; não incluído no Buster e no Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Ferramentas gráficas para volumes criptografados |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gerenciamento de máquinas virtuais e suporte a vídeo SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Cliente de área de trabalho remota |
| `rescuezilla` | Backup, restauração e clonagem gráfica de discos |
| `transume` | Backup, restauração e clonagem com base no Clonezilla, além de navegação por imagens; depende de pacotes compatíveis do repositório |
| `wireshark`, `zenmap`, `gnome-nettool` | Análise e diagnóstico gráfico de rede |
| `x11vnc` | Acesso VNC à sessão X atual |
| `uget` | Gerenciador gráfico de downloads |
| `android-file-transfer` | Transferência de arquivos via MTP do Android |
| `vlc` e plugins selecionados | Suporte à reprodução de mídia, localização, Samba e BitTorrent |
| `pdfarranger` | Organização de páginas PDF |
| `codium` | Editor de código para amd64, instalado do repositório de terceiros assinado do próprio fornecedor |
| `onboard` | Teclado virtual |
| `galculator` | Calculadora |

## Aplicativos do Ultra

O Ultra inclui todos os aplicativos do Toolbox e adiciona:

| Pacote | Finalidade |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suíte de escritório e integração com a área de trabalho |
| `gimp` | Editor de gráficos raster |
| `inkscape` | Editor de gráficos vetoriais |
| `blender` | Suíte de criação 3D |
| `audacity` | Editor de áudio |
| `obs-studio`, `obs-plugins` | Gravação e transmissão de tela |
| `rawtherapee` | Processador de fotos RAW |
| `synaptic` | Gerenciador gráfico de pacotes |
| `eddy`, `eddy-handler` | Instalador de pacotes Debian locais, quando disponível |
| `fonts-open-sans` | Família de fontes Open Sans |

## Inspecionar pacotes instalados

O sistema em execução é a fonte oficial de informações sobre os pacotes realmente instalados.
Liste os nomes e as versões dos pacotes com:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifestos de compilação do código-fonte

As tabelas de pacotes acima são derivadas do [`minios-live`sistema de compilação](https://github.com/minios-linux/minios-live). Os caminhos abaixo são relativos à raiz desse repositório de código-fonte e são relevantes ao compilar ou personalizar uma imagem a partir do código-fonte:

- `linux-live/environments/<environment>/` define a cadeia ordenada de módulos.
- `linux-live/scripts/00-core/packages.list` define a base compartilhada e os pacotes adicionais de cada variante.
- `linux-live/scripts/01-kernel/packages.list` define pacotes condicionais de compilação do kernel e DKMS.
- `linux-live/scripts/02-firmware/packages.list` define o firmware específico de cada distribuição.
- `linux-live/scripts/03-gui-base/packages.list` define a base gráfica compartilhada.
- `linux-live/scripts/04-flux-desktop/packages.list` e `05-flux-apps/packages.list` definem o Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` define o Xfce e as ferramentas de área de trabalho MiniOS.
- `linux-live/scripts/05-apps/packages.list` define os aplicativos gráficos do Toolbox e do Ultra.
- `linux-live/scripts/10-firefox/packages.list` define os pacotes de navegador específicos da suíte e da localidade.
- Os arquivos `install` e `skip_conditions.conf` de cada módulo determinam se e como sua lista de pacotes é usada.
- `linux-live/build.conf` seleciona a suíte, a arquitetura, o ambiente, a variante de pacotes, o sistema init, o kernel e a localidade.
- `linux-live/condinapt.map` define os prefixos de condição das listas de pacotes.

As listas de código-fonte descrevem os pacotes solicitados e as alternativas. Somente a imagem concluída e os `dpkg-query` mostram o conjunto de dependências resolvido e as versões exatas de uma determinada versão.

Consulte [Arquitetura do sistema](/reference/System-Architecture) para ver a ordem dos módulos e [CondinAPT em MiniOS](/development/CondinAPT) para saber mais sobre a seleção condicional de pacotes.
