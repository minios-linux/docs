---
updated: 2026-08-31
---

# Conteúdo dos pacotes e edições

O conteúdo dos pacotes MiniOS é gerado a partir de listas de fontes condicionais. O conjunto final depende da suíte de distribuição, arquitetura, sistema de inicialização, ambiente de desktop, localidade, opções do kernel e disponibilidade de repositórios. Esta página documenta os pacotes visíveis ao usuário solicitados pelos manifestos mantidos do Flux e do Xfce. Ferramentas de compilação e dependências utilizadas apenas na construção, que são trazidas pelo APT, são omitidas.

`Yes` indica que o manifesto atual solicita o pacote para aquela edição.
`Conditional` significa que o nome do pacote ou sua inclusão depende de uma opção de compilação ou da plataforma de destino. Um traço indica que a edição não o solicita.
A imagem finalizada permanece como referência oficial.

## Estrutura das edições

As edições mantidas do Xfce são construídas uma sobre a outra: Standard é o desktop compacto para uso diário, Toolbox é voltada para administração profissional de sistemas, diagnósticos e recuperação, e Ultra transforma essa base em um desktop completo para trabalho geral, criatividade e desenvolvimento. Flux é uma configuração separada e ultraleve do Fluxbox para uso mínimo de recursos e hardware mais antigo; não se trata apenas de uma lista menor de pacotes do Xfce.

| Edição | Variante de pacote e ambiente | Principal finalidade |
|---|---|---|
| **Standard** | `standard` com `xfce` | Desktop Xfce minimalista para uso diário com funcionalidades básicas |
| **Toolbox** | `toolbox` com `xfce` | Administração profissional de sistemas, diagnósticos e recuperação |
| **Ultra** | `ultra` com `xfce` | Desktop completo para trabalho geral, criatividade e desenvolvimento |
| **Flux** | `minimum` com `flux` | Desktop Fluxbox ultraleve para uso mínimo de recursos e hardware antigo |

Outros ambientes suportados possuem suas próprias cadeias de módulos e devem ser verificados separadamente. Em especial, a disponibilidade de pacotes em uma build LXQt ou console não deve ser inferida a partir das tabelas do Xfce abaixo.

## Pacotes principais do sistema e do MiniOS

Esses pacotes fornecem o ambiente de execução do sistema live, configuração, localização, gerenciamento de privilégios e ambiente básico de linha de comando.

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Sim | Sim | Sim | Sim | Criação, conversão, inspeção, ativação e captura de alterações de módulos |
| `minios-image-compose` | Sim | Sim | Sim | Sim | Composição de ISO MiniOS por linha de comando |
| `minios-live-config` | Sim | Sim | Sim | Sim | Componentes de configuração da sessão live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Condicional | Condicional | Condicional | Condicional | Integração com sistema de inicialização; uma implementação é selecionada |
| `minios-live-config-doc` | Sim | Sim | Sim | Sim | Referência de live-config instalado |
| `minios-welcome` | Sim | Sim | Sim | Sim | Página de boas-vindas e lançador MiniOS |
| `user-setup` | Sim | Sim | Sim | Sim | Configuração da conta do usuário live |
| `linux-base` | Sim | Sim | Sim | Sim | Scripts comuns de sistema e imagem Linux |
| `kbd`, `keyboard-configuration`, `console-setup` | Sim | Sim | Sim | Sim | Configuração de teclado e exibição no console |
| `locales` | Sim | Sim | Sim | Sim | Dados e geração de localidade |
| `network-manager` | Sim | Sim | Sim | Sim | Gerenciamento de conexões de rede |
| `netplan.io` | Condicional | Condicional | Condicional | Condicional | Solicitado apenas em suítes Ubuntu suportadas |
| `dracut-core` | Condicional | Condicional | Condicional | Condicional | Solicitado quando Dracut é o construtor do initramfs |
| `gpg`, `gnupg` | Sim | Sim | Sim | Sim | Ferramentas de assinatura de pacotes e arquivos |
| `file`, `cpio` | Sim | Sim | Sim | Sim | Identificação de arquivos e manipulação de arquivos compactados |
| `gettext-base` / `gettext` | Condicional | Condicional | Condicional | Condicional | Utilitários de tradução selecionados conforme disponibilidade |
| `polkitd` / `policykit-1`, `pkexec` | Condicional | Condicional | Condicional | Condicional | Autorização e elevação de privilégios |
| `bash-completion` | Sim | Sim | Sim | Sim | Completação de comandos no shell |
| `man-db` | Sim | Sim | Sim | Sim | Leitor e banco de dados de páginas de manual |
| `mc` | Sim | Sim | Sim | Sim | Gerenciador de arquivos Midnight Commander |
| `gpm` | Sim | Sim | Sim | Sim | Suporte a mouse no console |
| `ssh` | Sim | Sim | Sim | Sim | Pacotes cliente e servidor OpenSSH selecionados pelo APT |
| `systemd-timesyncd` / `chrony` | Condicional | Condicional | Condicional | Condicional | Sincronização de horário selecionada por suíte e sistema de inicialização |
| `tlp` | Sim | Sim | Sim | Sim | Gerenciamento de energia para notebooks |

Alguns pacotes de paridade de bootstrap são solicitados apenas para suítes base específicas.
Eles são dependências de implementação, não recursos das edições, e não estão listados individualmente aqui.

## Ferramentas de rede

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Sim | Sim | Sim | Sim | Autenticação wireless WPA/WPA2 |
| `rfkill` | Sim | Sim | Sim | Sim | Controle de estado de dispositivos wireless |
| `usb-modeswitch` | Sim | Sim | Sim | Sim | Alternância de modem USB e dispositivos multi-modo |
| `dnsmasq-base` | - | Sim | Sim | Sim | Suporte a DNS e DHCP usado pelos fluxos de rede |
| `cifs-utils` | - | Sim | Sim | Sim | Cliente de sistema de arquivos de rede SMB/CIFS |
| `nfs-common` | - | Sim | Sim | Sim | Suporte a cliente NFS |
| `ipset` | - | Sim | Sim | Sim | Administração de conjuntos de IP do kernel |
| `whois` | - | Sim | Sim | Sim | Consulta de registro de domínio e endereço |
| `netcat`, `netcat-openbsd` | - | - | Sim | Sim | Ferramentas de teste de fluxo TCP e UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Sim | Sim | Descoberta de rede, transferência e comparação de varreduras |
| `iw` | - | - | Sim | Sim | Configuração de dispositivos e links wireless |
| `iperf3` | - | - | Sim | Sim | Teste de throughput de rede |
| `aria2` | - | - | Sim | Sim | Utilitário de download multiprotocolo |
| `davfs2` | - | - | Sim | Sim | Cliente de sistema de arquivos WebDAV |
| `sshfs` | - | - | Sim | Sim | Acesso a sistemas de arquivos via SSH |
| `open-iscsi` | - | - | - | Sim | Iniciador iSCSI |
| `tgt` | - | - | - | Sim | Serviço alvo iSCSI |

## Armazenamento e sistemas de arquivos

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Sim | Sim | Sim | Sim | Inspeção e ajuste de dispositivos ATA e SCSI |
| `mdadm` | Sim | Sim | Sim | Sim | Gerenciamento de RAID por software Linux |
| `smartmontools` | Sim | Sim | Sim | Sim | Monitoramento e testes S.M.A.R.T. |
| `dosfstools` | Sim | Sim | Sim | Sim | Criação e verificação de sistemas de arquivos FAT |
| `ntfs-3g` | Sim | Sim | Sim | Sim | Driver e ferramentas NTFS em espaço de usuário |
| `btrfs-progs` | Sim | Sim | Sim | Sim | Administração de Btrfs |
| `xfsprogs` | - | Sim | Sim | Sim | Administração de XFS |
| `exfatprogs` / `exfat-utils` com `exfat-fuse` | - | Condicional | Condicional | Condicional | Implementação exFAT selecionada conforme disponibilidade do pacote |
| `fuse3` / `fuse`, `libfuse2` | - | Condicional | Condicional | Condicional | Runtime FUSE e biblioteca de compatibilidade |
| `dynfilefs` | - | Condicional | Condicional | Condicional | Persistência segmentada em suítes suportadas |
| `parted` | - | Sim | Sim | Sim | Criação e edição de tabela de partições |
| `gpart` | - | - | Sim | Sim | Recuperação de tabela de partições |
| `mtools` | - | - | Sim | Sim | Ferramentas para mídias FAT e DOS |
| `gddrescue` | - | - | Sim | Sim | Cópia tolerante a falhas de dispositivos de bloco |
| `lvm2` | - | - | Sim | Sim | Gerenciador de volumes lógicos (LVM) |
| `cryptsetup` | - | - | Sim | Sim | Gerenciamento de volumes LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Sim | Sim | Gerenciamento e montagem de volumes criptografados |
| `f2fs-tools` | - | - | Sim | Sim | Administração de F2FS |
| `hfsutils`, `hfsprogs` | - | - | Sim | Sim | Ferramentas para HFS e HFS+, quando disponíveis |
| `jfsutils` | - | - | Sim | Sim | Administração de JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Sim | Sim | Ferramentas para ReiserFS e Reiser4, quando disponíveis |
| `udftools` | - | - | Sim | Sim | Ferramentas para sistema de arquivos óptico UDF |
| `nilfs-tools` | - | - | Sim | Sim | Administração de NILFS2 |
| `zfsutils-linux` | - | - | Condicional | Condicional | Ferramentas ZFS em espaço de usuário quando o kernel suporta ZFS |

## Arquivos compactados e formatos de imagem

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Sim | Sim | Sim | Sim | Compactação usada por pacotes, módulos e imagens |
| `zip`, `unzip` | Sim | Sim | Sim | Sim | Criação e extração de arquivos ZIP |
| `xorriso` | Sim | Sim | Sim | Sim | Criação e inspeção de ISO |
| `squashfs-tools` | Sim | Sim | Sim | Sim | Criação e extração de módulos SquashFS |
| `lz4` / `liblz4-tools` | - | Condicional | Condicional | Condicional | Implementação LZ4 selecionada conforme disponibilidade |
| `bzip2` | - | Sim | Sim | Sim | Compactação bzip2 |
| `7zip` | - | Sim | Sim | Sim | Arquivos 7z e formatos relacionados |
| `genisoimage` | - | Sim | Sim | Sim | Criação de imagem ISO-9660 |
| `pv` | - | - | Sim | Sim | Exibição de progresso em pipelines |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Sim | Sim | Ferramentas de compactação paralela |
| `lrzip`, `lzop` | - | - | Sim | Sim | Formatos de compactação adicionais |
| `cabextract` | - | - | Sim | Sim | Extração de arquivos Microsoft Cabinet |
| `xmount` | - | - | Sim | Sim | Conversão e montagem de formatos de imagem de disco |

## Recuperação, diagnóstico e desempenho

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Sim | Sim | Sim | Sim | Inspeção de dispositivos PCI e USB |
| `psmisc` | Sim | Sim | Sim | Sim | Ferramentas de processos como `fuser` e `killall` |
| `htop` | - | Sim | Sim | Sim | Monitor de processos interativo |
| `ncdu` | - | Sim | Sim | Sim | Analisador de uso de disco no terminal |
| `lsof` | - | Sim | Sim | Sim | Inspeção de arquivos abertos e processos |
| `clonezilla` | - | - | Sim | Sim | Fluxos de clonagem de disco e partição |
| `partclone`, `partimage` | - | - | Sim | Sim | Ferramentas de imagem com reconhecimento de sistema de arquivos |
| `testdisk` | - | - | Sim | Sim | Recuperação de partições e arquivos |
| `chntpw`, `reglookup` | - | - | Sim | Sim | Ferramentas offline para contas e registro do Windows |
| `hexedit` | - | - | Sim | Sim | Editor hexadecimal para terminal |
| `lshw`, `inxi` | - | - | Sim | Sim | Relatórios detalhados de hardware e sistema |
| `screen` | - | - | Sim | Sim | Multiplexador de terminal |
| `nmon` | - | - | Sim | Sim | Monitor de desempenho interativo |
| `fio`, `bonnie++`, `iozone3` | - | - | Sim | Sim | Benchmarks de armazenamento e sistemas de arquivos |
| `stress`, `sysbench` | - | - | Sim | Sim | Benchmarks de CPU, memória e sistema |
| `memtest86+` | - | - | Sim | Sim | Teste de memória na inicialização |
| `rsync` | - | - | Sim | Sim | Utilitário de sincronização e cópia de arquivos |

## Virtualização e containers

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Sim | Sim | Integração de convidados VMware e QEMU |
| `virtualbox-guest-utils` | - | - | Condicional | Condicional | Integração de convidados VirtualBox em suítes selecionadas |
| `hyperv-daemons` | - | - | Sim | Sim | Serviços de convidados Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Sim | Sim | Ferramentas de execução e imagem de máquinas virtuais |
| `libvirt-daemon-system` | - | - | Sim | Sim | Serviço libvirt do sistema |
| `virt-what` | - | - | Sim | Sim | Detecção de hipervisor |
| `uidmap` | - | - | - | Sim | Mapeamento de IDs de namespace de usuário |
| Docker CE stack / `docker.io` com `docker-compose` | - | - | - | Condicional | Runtime de container selecionado a partir do repositório disponível |
| `lazydocker` | - | - | - | Sim | Interface de terminal para Docker |
| `selinux-policy-default` | - | - | - | Sim | Pacote de política padrão do SELinux |

## Firmware e drivers do kernel

A seleção de firmware segue o perfil da distribuição: builds do Debian e Devuan utilizam pacotes de firmware separados, enquanto builds do Ubuntu usam `linux-firmware`. Drivers DKMS também são filtrados por arquitetura, provedor do kernel, série do kernel e recursos já fornecidos pelo kernel selecionado.

| Pacote | Edições | Finalidade ou condição |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Condicional, todas | Coleções de firmware do Debian e Devuan |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Condicional, todas | Firmware wireless para dispositivos Atheros, Intel e ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Condicional, todas | Firmware Realtek e MediaTek; MediaTek depende da suíte |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Condicional, todas | Firmware de rede Broadcom e Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Condicional, todas | Famílias adicionais de firmware wireless |
| `firmware-b43-installer` | Condicional, todas | Instalador de firmware Broadcom B43 legado |
| `firmware-sof-signed` | Condicional, todas | Imagens Sound Open Firmware |
| `linux-firmware` | Condicional, todas | Coleção de firmware do Ubuntu |
| `ntfs3-dkms` | Condicional, todas | Driver NTFS3 quando ausente no kernel selecionado |
| `aufs-dkms` / `aufs-ng-dkms` | Condicional, todas | Driver AUFS selecionado por suíte e kernel |
| `broadcom-sta-dkms` | Condicional, todas | Driver wireless Broadcom STA em alvos suportados |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Condicional, todas | Drivers wireless de fabricante filtrados pelas capacidades do kernel e plataforma de destino |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Condicional, todas | Drivers de fabricante mantidos em alvos suportados para dispositivos ou recursos adicionais |
| `zfs-dkms` | Condicional, Toolbox e Ultra | Módulo de kernel ZFS em builds amd64 suportadas |

## Base gráfica

Os ambientes gráficos compartilham a base do Xorg e de renderização abaixo. O Flux utiliza então sua própria lista de desktop; Standard, Toolbox e Ultra utilizam a lista mantida do Xfce.

| Pacote | Flux | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Sim | Sim | Sim | Sim | Servidor X.Org e ferramentas de inicialização |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Sim | Sim | Sim | Sim | Drivers de vídeo X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Sim | Sim | Sim | Sim | Drivers de entrada e suporte a inicialização legada |
| `xterm` | Sim | Sim | Sim | Sim | Terminal X básico |
| `blackbox` / `openbox` | Condicional | Condicional | Condicional | Condicional | Gerenciador de janelas leve de fallback selecionado pelo ambiente |
| `x11-utils`, `wmctrl`, `xdotool` | Sim | Sim | Sim | Sim | Inspeção X11 e automação de janelas |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Sim | Sim | Sim | Sim | Bibliotecas de renderização DRM e Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Sim | Sim | Sim | Sim | Temas de cursor e ícones |
| `elementary-minios-icon-theme` | Sim | Sim | Sim | Sim | Tema de ícones MiniOS fora do LXQt |
| `librsvg2-common` | Sim | Sim | Sim | Sim | Suporte a renderização SVG |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Condicional | Condicional | Condicional | Condicional | Agente gráfico PolicyKit selecionado conforme disponibilidade |
| `xrdp`, `xorgxrdp` | - | - | Sim | Sim | Login gráfico remoto via RDP |

## Desktop Flux e aplicativos

| Pacote | Finalidade ou condição |
|---|---|
| `fluxbox-flux` | Configuração do gerenciador de janelas Fluxbox do MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Painel e indicador de layout de teclado |
| `xwallpaper`, `gpicview` / `feh` | Exibição de papel de parede e imagens |
| `compton` | Compositor X |
| `alsa-utils`, `volumeicon-alsa` | Controles de áudio ALSA |
| `systrayicon`, `cbatticon` | Indicadores de bandeja e bateria |
| `xlunch`, `gtkask`, `flux-tools` | Lançador e utilitários do desktop Flux do MiniOS |
| `scrot` | Utilitário de captura de tela |
| `mousepad`, `pcmanfm` | Editor de texto e gerenciador de arquivos |
| `galculator`, `lxtask`, `xarchiver` | Calculadora, gerenciador de tarefas e gerenciador de arquivos compactados |
| `network-manager-gnome` | Applet de desktop do NetworkManager |
| `firefox` / `firefox-esr` | Navegador selecionado pela suíte, com pacotes de localização selecionados |

## Desktop Xfce e aplicativos MiniOS

| Pacote | Standard | Toolbox | Ultra | Finalidade ou condição |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Sim | Sim | Sim | Gerenciador de arquivos e integração com mídias removíveis |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Sim | Sim | Sim | Painel, sessão e serviços de configuração do Xfce |
| `xfdesktop4`, `xfwm4`, `xfconf` | Sim | Sim | Sim | Desktop, gerenciador de janelas e serviço de configuração |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Sim | Sim | Sim | Localizador de aplicativos e indicador de teclado |
| `mousepad`, `ristretto` | Sim | Sim | Sim | Editor de texto e visualizador de imagens |
| `at-spi2-core`, `dbus-x11` | Sim | Sim | Sim | Suporte à acessibilidade e barramento de mensagens do desktop |
| `gvfs-backends` | Sim | Sim | Sim | Integração de sistemas de arquivos remotos e removíveis no gerenciador de arquivos |
| `lightdm`, `lightdm-gtk-greeter` | Sim | Sim | Sim | Gerenciador gráfico de login |
| `network-manager-gnome`, `blueman` | Sim | Sim | Sim | Controles de rede e Bluetooth no desktop |
| `avahi-daemon` | Sim | Sim | Sim | Descoberta de serviços em rede local |
| PipeWire stack / PulseAudio stack | Condicional | Condicional | Condicional | Áudio do desktop selecionado pela suíte |
| `pavucontrol` | Sim | Sim | Sim | Mixer de áudio gráfico |
| `engrampa`, `thunar-archive-plugin` | Sim | Sim | Sim | Gerenciador de arquivos compactados e integração com o gerenciador de arquivos |
| `xfce4-screensaver`, `xfce4-screenshooter` | Sim | Sim | Sim | Bloqueio de tela e capturas de tela |
| `xfce4-power-manager-plugins` | Sim | Sim | Sim | Integração de gerenciamento de energia do Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Sim | Sim | Sim | Gerenciador de tarefas e emulador de terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Sim | Sim | Sim | Menu de aplicativos e notificações |
| `minios-configurator` | Sim | Sim | Sim | Editor gráfico de configuração de boot e sessão do MiniOS |
| `minios-installer` | Sim | Sim | Sim | Instalador gráfico e `minios-deploy` CLI |
| `minios-session-manager` | Sim | Sim | Sim | Gerenciador de sessões persistentes e `minios-session` CLI |
| `minios-kernel-manager` | Sim | Sim | Sim | Gerenciador modular de kernel e `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Sim | Sim | Sim | Catálogo de aplicativos MiniOS e instalador |
| `minios-image-builder` | Sim | Sim | Sim | Espaço de trabalho gráfico para remasterização de ISO |
| `minios-module-manager` | Sim | Sim | Sim | Gerenciador gráfico de módulos `.sb` |
| `minios-help` | Sim | Sim | Sim | Visualizador de documentação instalada do MiniOS |
| `driveutility` | Sim | Sim | Sim | Escrita, leitura, formatação e limpeza de imagens de disco |
| `firefox` / `firefox-esr` | Condicional | Condicional | Condicional | Navegador e localização selecionados conforme suíte e localidade |
| `menulibre` | - | Sim | Sim | Editor gráfico de menus |
| `open-vm-tools-desktop` | - | Sim | Sim | Integração de desktop VMware |
| `virtualbox-guest-x11` | - | Condicional | Condicional | Integração de desktop VirtualBox em suítes selecionadas |
| Qt GTK platform themes | - | Sim | Sim | Integração visual do GTK para aplicativos Qt |

## Aplicativos gráficos do Toolbox

O módulo Xfce `05-apps` é incluído no Toolbox e Ultra e omitido no Standard.

| Pacote | Finalidade ou condição |
|---|---|
| `gparted` | Editor gráfico de partições |
| `gsmartcontrol`, `qdiskinfo` | Diagnóstico de disco e informações de dispositivos |
| `guymager`, `qphotorec` | Imagem forense e recuperação de arquivos; `qphotorec` é excluído no Buster e Beowulf |
| `kdiskmark` | Benchmark de disco |
| `isomaster` | Editor de imagens ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnóstico de hardware e gráficos |
| `baobab` | Analisador gráfico de uso de disco |
| `doublecmd-gtk` | Gerenciador de arquivos de dois painéis |
| `grsync` | Frontend gráfico para `rsync` |
| `bleachbit` | Limpeza de cache e arquivos temporários |
| `czkawka` / `czkawka-gui` | Localizador de arquivos duplicados e indesejados |
| `gtkhash` | Calculadora de checksum |
| `wxhexeditor` | Editor hexadecimal para arquivos grandes |
| `keepassxc` | Gerenciador de senhas |
| `veracrypt` | Gerenciamento de containers e discos criptografados; excluído no Buster e Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Ferramentas gráficas para volumes criptografados |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Gerenciamento de máquinas virtuais e suporte a exibição SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Cliente de área de trabalho remota |
| `wireshark`, `zenmap`, `gnome-nettool` | Análise e diagnóstico de rede com interface gráfica |
| `x11vnc` | Acesso VNC à sessão X atual |
| `uget` | Gerenciador gráfico de downloads |
| `android-file-transfer` | Transferência de arquivos Android MTP |
| `vlc` e plugins selecionados | Reprodução de mídia, localização, suporte a Samba e BitTorrent |
| `pdfarranger` | Organização de páginas PDF |
| `codium` | Editor de código |
| `onboard` | Teclado virtual |
| `galculator` | Calculadora |

## Aplicativos Ultra

Ultra inclui todos os aplicativos do Toolbox e adiciona:

| Pacote | Finalidade |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suíte de escritório e integração com o desktop |
| `gimp` | Editor de imagens raster |
| `inkscape` | Editor de gráficos vetoriais |
| `blender` | Suíte de criação 3D |
| `audacity` | Editor de áudio |
| `obs-studio`, `obs-plugins` | Gravação e transmissão de tela |
| `rawtherapee` | Processador de fotos RAW |
| `synaptic` | Gerenciador gráfico de pacotes |
| `eddy`, `eddy-handler` | Instalador local de pacotes Debian, quando disponível |
| `fonts-open-sans` | Família de fontes Open Sans |

## Inspecionar pacotes instalados

O sistema em execução é a referência para os pacotes que foram realmente instalados.
Liste os nomes e versões dos pacotes com:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifestos de compilação de fontes

As tabelas de pacotes acima são derivadas do [sistema de build `minios-live`](https://github.com/minios-linux/minios-live). Os caminhos abaixo são relativos à raiz desse repositório de fontes e são relevantes ao compilar ou personalizar uma imagem a partir do código-fonte:

- `linux-live/environments/<environment>/` define a cadeia ordenada de módulos.
- `linux-live/scripts/00-core/packages.list` define a base compartilhada e os acréscimos de variantes de pacotes.
- `linux-live/scripts/01-kernel/packages.list` define o build condicional do kernel e pacotes DKMS.
- `linux-live/scripts/02-firmware/packages.list` define firmware específico de distribuição.
- `linux-live/scripts/03-gui-base/packages.list` define a base gráfica compartilhada.
- `linux-live/scripts/04-flux-desktop/packages.list` e `05-flux-apps/packages.list` definem o Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` define o Xfce e as ferramentas de desktop MiniOS.
- `linux-live/scripts/05-apps/packages.list` define os aplicativos gráficos do Toolbox e Ultra.
- `linux-live/scripts/10-firefox/packages.list` define os pacotes de navegador específicos por suíte e localidade.
- Os arquivos `install` e `skip_conditions.conf` de cada módulo determinam se e como sua lista de pacotes é usada.
- `linux-live/build.conf` seleciona a suíte, arquitetura, ambiente, variante de pacote, sistema de inicialização, kernel e localidade.
- `linux-live/condinapt.map` define os prefixos de condição das listas de pacotes.

As listas de fontes descrevem pacotes solicitados e alternativas. Apenas a imagem finalizada e `dpkg-query` mostram o conjunto de dependências resolvido e as versões exatas para um determinado lançamento.

Veja [Arquitetura do sistema](/reference/System-Architecture) para ordenação de módulos e [CondinAPT em MiniOS](/development/CondinAPT) para seleção condicional de pacotes.
