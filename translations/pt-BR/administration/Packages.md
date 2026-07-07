# Lista de Pacotes do MiniOS

Este documento fornece uma visão geral abrangente de todos os pacotes incluídos nas diferentes edições do MiniOS. O MiniOS está disponível em três edições principais, cada uma com um conjunto diferente de softwares pré-instalados:

- **Padrão** - Sistema mínimo com funcionalidades básicas
- **Toolbox** - Ferramentas de administração e diagnóstico do sistema
- **Ultra** - Ambiente desktop completo com aplicativos

## Utilitários de console e pacotes de sistema

### ⚙️ Pacotes principais do sistema

| Pacote                        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                     |
| :---------------------------- | :-----: | :-----: | :---: | :---------------------------------------------------------- |
| minios-tools                  |   ✅    |   ✅    |  ✅   | Ferramentas e scripts essenciais do MiniOS.                 |
| minios-welcome                |   ✅    |   ✅    |  ✅   | Mensagem de boas-vindas no navegador.                      |
| minios-live-config            |   ✅    |   ✅    |  ✅   | Scripts de configuração do sistema Live.                    |
| minios-live-config-systemd    |   ✅    |   ✅    |  ✅   | Configuração do sistema Live para systemd.                  |
| minios-live-config-doc        |   ✅    |   ✅    |  ✅   | Documentação do minios-live-config.                        |
| user-setup                    |   ✅    |   ✅    |  ✅   | Utilitário de configuração de usuário.                     |
| linux-base                    |   ✅    |   ✅    |  ✅   | Scripts base para o sistema Linux.                         |
| kbd                           |   ✅    |   ✅    |  ✅   | Utilitários para gerenciar layout de teclado no console.    |
| keyboard-configuration        |   ✅    |   ✅    |  ✅   | Sistema de configuração de teclado.                        |
| locales                       |   ✅    |   ✅    |  ✅   | Bibliotecas e dados para localização (suporte a idiomas).  |
| console-setup                 |   ✅    |   ✅    |  ✅   | Configuração de fonte e codificação do console.             |
| systemd-timesyncd             |   ✅    |   ✅    |  ✅   | Serviço para sincronização de horário via rede.             |
| polkitd / policykit-1 / pkexec|   ✅    |   ✅    |  ✅   | Framework para gerenciamento de privilégios de serviços do sistema. |

### 📦 Gerenciamento de pacotes e softwares

| Pacote             | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                            |
| :----------------- | :-----: | :-----: | :---: | :----------------------------------------------------------------- |
| apt-transport-https|   ✅    |   ✅    |  ✅   | Permite o uso de repositórios via protocolo HTTPS.                 |
| gettext-base       |   ✅    |   ✅    |  ✅   | Utilitários para internacionalização e localização de software.     |
| man-db             |   ✅    |   ✅    |  ✅   | Sistema para visualização de páginas de manual (man).              |
| bash-completion    |   ✅    |   ✅    |  ✅   | Fornece auto-completar de comandos no shell Bash.                  |

### 🌐 Utilitários de rede

| Pacote                    | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                         |
| :------------------------ | :-----: | :-----: | :---: | :-------------------------------------------------------------- |
| network-manager / connman |   ✅    |   ✅    |  ✅   | Gerenciadores de conexão de rede.                               |
| dnsmasq-base              |   ✅    |   ✅    |  ✅   | Servidor leve de DNS e DHCP (arquivos base).                    |
| wpasupplicant             |   ✅    |   ✅    |  ✅   | Utilitário para conexão a redes Wi-Fi seguras (WPA/WPA2).       |
| iputils-ping              |   ✅    |   ✅    |  ✅   | Utilitário `ping` para checar disponibilidade de hosts.         |
| ssh                       |   ✅    |   ✅    |  ✅   | Cliente e servidor para conexões remotas seguras (SSH).         |
| wget                      |   ✅    |   ✅    |  ✅   | Utilitário para download de arquivos pela rede.                 |
| curl                      |   ✅    |   ✅    |  ✅   | Utilitário para transferência de dados usando vários protocolos.|
| ipset                     |   ✅    |   ✅    |  ✅   | Utilitário para administrar conjuntos de endereços IP no kernel.|
| whois                     |   ✅    |   ✅    |  ✅   | Cliente para obter informações de domínio e IP.                 |
| nmap                      |   ❌    |   ✅    |  ✅   | Scanner de rede poderoso e ferramenta de auditoria de segurança.|
| ncat                      |   ❌    |   ✅    |  ✅   | Versão aprimorada do `netcat` do pacote nmap.                   |
| ndiff                     |   ❌    |   ✅    |  ✅   | Utilitário para comparar resultados de varredura do nmap.       |
| iperf3                    |   ❌    |   ✅    |  ✅   | Ferramenta para medir largura de banda de rede.                 |
| netcat                    |   ❌    |   ✅    |  ✅   | Utilitário de rede para leitura/escrita de dados via TCP/IP.    |
| netcat-openbsd            |   ❌    |   ✅    |  ✅   | Implementação alternativa do `netcat` do OpenBSD.               |
| open-iscsi                |   ❌    |   ❌    |  ✅   | Cliente (initiador) para uso de armazenamento iSCSI.            |
| tgt                       |   ❌    |   ❌    |  ✅   | Servidor (target) para fornecer armazenamento iSCSI.            |

### 💾 Gerenciamento de disco e sistemas de arquivos

| Pacote        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                            |
| :------------ | :-----: | :-----: | :---: | :----------------------------------------------------------------- |
| parted        |   ✅    |   ✅    |  ✅   | Programa para criar e modificar partições de disco.                |
| dosfstools    |   ✅    |   ✅    |  ✅   | Utilitários para criar e verificar sistemas de arquivos FAT.        |
| ntfs-3g       |   ✅    |   ✅    |  ✅   | Driver para leitura e gravação em partições NTFS.                  |
| mdadm         |   ✅    |   ✅    |  ✅   | Utilitário para gerenciar arrays RAID por software.                |
| hdparm        |   ✅    |   ✅    |  ✅   | Utilitário para configurar e visualizar parâmetros do HD.          |
| sdparm        |   ✅    |   ✅    |  ✅   | Utilitário para acessar parâmetros de dispositivos SCSI/SATA/SAS.  |
| btrfs-progs   |   ✅    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos Btrfs.          |
| xfsprogs      |   ✅    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos XFS.            |
| exfat-utils   |   ✅    |   ✅    |  ✅   | Utilitários para exFAT (implementação legada).                     |
| exfat-fuse    |   ✅    |   ✅    |  ✅   | Módulo FUSE para suporte ao sistema de arquivos exFAT.             |
| exfatprogs    |   ✅    |   ✅    |  ✅   | Utilitários para criar e verificar sistema de arquivos exFAT.      |
| cifs-utils    |   ✅    |   ✅    |  ✅   | Utilitários para montar compartilhamentos de rede Windows (Samba/CIFS). |
| nfs-common    |   ✅    |   ✅    |  ✅   | Arquivos comuns para suporte ao sistema de arquivos NFS (cliente). |
| smartmontools |   ✅    |   ✅    |  ✅   | Utilitários para monitoramento de saúde do disco via S.M.A.R.T.    |
| gpart         |   ❌    |   ✅    |  ✅   | Utilitário para "adivinhar" tabela de partição em discos danificados.|
| mtools        |   ❌    |   ✅    |  ✅   | Conjunto de utilitários para acessar disquetes e partições MS-DOS. |
| gddrescue     |   ❌    |   ✅    |  ✅   | Ferramenta para copiar dados de mídias danificadas.               |
| zfsutils-linux|   ❌    |   ✅    |  ✅   | Utilitários para gerenciar pools e sistema de arquivos ZFS.        |
| davfs2        |   ❌    |   ✅    |  ✅   | Permite montar recursos WebDAV como sistema de arquivos local.     |
| f2fs-tools    |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos F2FS.           |
| hfsutils      |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos "clássico" da Apple (HFS). |
| hfsprogs      |   ❌    |   ✅    |  ✅   | Utilitários para criar e verificar sistema de arquivos HFS+.       |
| jfsutils      |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos JFS.            |
| reiserfsprogs |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos ReiserFS (v3).  |
| reiser4progs  |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos Reiser4.        |
| udftools      |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos UDF (DVD/Blu-ray).|
| nilfs-tools   |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com sistema de arquivos log-structured NILFS2. |
| sshfs         |   ❌    |   ✅    |  ✅   | Monta sistema de arquivos remoto via SSH.                         |
| lvm2          |   ❌    |   ✅    |  ✅   | Gerenciador de volumes lógicos (LVM).                             |
| cryptsetup    |   ❌    |   ✅    |  ✅   | Utilitário para configurar partições criptografadas (LUKS).       |
| zulucrypt-cli |   ❌    |   ✅    |  ✅   | CLI para gerenciamento de volumes criptografados (LUKS, VeraCrypt, etc.).|
| zulumount-cli |   ❌    |   ✅    |  ✅   | CLI para montagem de volumes gerenciados pelo zulucrypt.          |

### 💻 Utilitários de sistema e monitoramento

| Pacote        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                              |
| :------------ | :-----: | :-----: | :---: | :------------------------------------------------------------------- |
| pciutils      |   ✅    |   ✅    |  ✅   | Utilitários para visualizar informações de dispositivos PCI.          |
| usbutils      |   ✅    |   ✅    |  ✅   | Utilitários para visualizar informações de dispositivos USB.          |
| psmisc        |   ✅    |   ✅    |  ✅   | Conjunto de utilitários para trabalhar com processos (`fuser`, `killall`).|
| lsof          |   ✅    |   ✅    |  ✅   | Mostra quais arquivos estão sendo usados por quais processos.         |
| htop          |   ✅    |   ✅    |  ✅   | Monitor de processos interativo.                                     |
| rfkill        |   ✅    |   ✅    |  ✅   | Ferramenta para ativar/desativar dispositivos sem fio.               |
| file          |   ✅    |   ✅    |  ✅   | Determina o tipo de arquivo.                                         |
| usb-modeswitch|   ✅    |   ✅    |  ✅   | Alterna modos de dispositivos USB (ex.: modems).                     |
| ncdu          |   ✅    |   ✅    |  ✅   | Analisador de uso de disco com interface ncurses.                    |
| lshw          |   ❌    |   ✅    |  ✅   | Exibe informações detalhadas de hardware.                            |
| screen        |   ❌    |   ✅    |  ✅   | Multiplexador de terminal, permite gerenciar sessões.                |
| nmon          |   ❌    |   ✅    |  ✅   | Utilitário para monitoramento de desempenho do sistema.              |
| inxi          |   ❌    |   ✅    |  ✅   | Script para coletar e exibir informações detalhadas do sistema.      |

### 🗜️ Compactadores e arquivadores

| Pacote        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                      |
| :------------ | :-----: | :-----: | :---: | :----------------------------------------------------------- |
| zip           |   ✅    |   ✅    |  ✅   | Arquivador para criar e extrair arquivos .zip.               |
| unzip         |   ✅    |   ✅    |  ✅   | Utilitário para extrair arquivos .zip.                       |
| xz-utils      |   ✅    |   ✅    |  ✅   | Utilitários para compressão de dados usando LZMA/XZ.         |
| zstd          |   ✅    |   ✅    |  ✅   | Utilitário para compressão de dados usando Zstandard.        |
| lz4           |   ✅    |   ✅    |  ✅   | Utilitário para compressão de dados muito rápida.            |
| liblz4-tools  |   ✅    |   ✅    |  ✅   | Ferramentas adicionais para o formato lz4.                   |
| bzip2         |   ✅    |   ✅    |  ✅   | Utilitário para compressão de dados usando bzip2.            |
| 7zip          |   ✅    |   ✅    |  ✅   | Arquivador poderoso com suporte a vários formatos, incluindo 7z. |
| pv            |   ❌    |   ✅    |  ✅   | Utilitário para monitorar o progresso de transferência de dados via pipe. |
| pigz          |   ❌    |   ✅    |  ✅   | Implementação paralela (multi-thread) do gzip.               |
| pixz          |   ❌    |   ✅    |  ✅   | Implementação paralela indexável do xz.                      |
| plzip         |   ❌    |   ✅    |  ✅   | Implementação paralela do lzip.                              |
| lrzip         |   ❌    |   ✅    |  ✅   | Arquivador de longo alcance, eficiente para arquivos grandes.|
| lzop          |   ❌    |   ✅    |  ✅   | Utilitário de compressão muito rápida.                       |
| pbzip2        |   ❌    |   ✅    |  ✅   | Implementação paralela do bzip2.                             |
| cabextract    |   ❌    |   ✅    |  ✅   | Utilitário para extrair arquivos .cab da Microsoft.          |

### 🕵️ Recuperação e forense

| Pacote    | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                 |
| :-------- | :-----: | :-----: | :---: | :------------------------------------------------------ |
| clonezilla|   ❌    |   ✅    |  ✅   | Ferramenta para clonagem e backup de disco.             |
| testdisk  |   ❌    |   ✅    |  ✅   | Utilitário para recuperar partições e arquivos apagados.|
| chntpw    |   ❌    |   ✅    |  ✅   | Utilitário para redefinir senhas do Windows.            |
| reglookup |   ❌    |   ✅    |  ✅   | Utilitário para leitura e análise do registro do Windows.|
| hexedit   |   ❌    |   ✅    |  ✅   | Editor hexadecimal simples para console.                |

### ☁️ Virtualização e containers

| Pacote                | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                         |
| :-------------------- | :-----: | :-----: | :---: | :-------------------------------------------------------------- |
| open-vm-tools         |   ❌    |   ✅    |  ✅   | Conjunto de utilitários para melhor integração com VMware.       |
| hyperv-daemons        |   ❌    |   ✅    |  ✅   | Serviços para integração com o hipervisor Microsoft Hyper-V.     |
| qemu-system-x86       |   ❌    |   ✅    |  ✅   | Emulador para rodar sistemas operacionais x86/x86_64.            |
| qemu-utils            |   ❌    |   ✅    |  ✅   | Utilitários para trabalhar com imagens de disco QEMU.            |
| libvirt-daemon-system |   ❌    |   ✅    |  ✅   | Daemon para gerenciamento de máquinas virtuais.                  |
| virt-what             |   ❌    |   ✅    |  ✅   | Script para detectar se o sistema está rodando em VM.            |
| uidmap                |   ❌    |   ❌    |  ✅   | Utilitários para trabalhar com namespaces de usuário.            |
| docker.io             |   ❌    |   ❌    |  ✅   | Plataforma de conteinerização de aplicações.                     |
| docker-compose        |   ❌    |   ❌    |  ✅   | Ferramenta para gerenciar aplicações Docker multi-contêiner.     |
| lazydocker            |   ❌    |   ❌    |  ✅   | Interface de terminal para gerenciar Docker e Docker Compose.    |
| selinux-policy-default|   ❌    |   ❌    |  ✅   | Política de segurança padrão do SELinux.                         |

### 🧩 Diversos

| Pacote        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                                            |
| :------------ | :-----: | :-----: | :---: | :--------------------------------------------------------------------------------- |
| mc            |   ✅    |   ✅    |  ✅   | Gerenciador de arquivos Midnight Commander.                                        |
| gpg           |   ✅    |   ✅    |  ✅   | GNU Privacy Guard - utilitário de criptografia e assinatura.                       |
| gnupg         |   ✅    |   ✅    |  ✅   | Suite completa do GNU Privacy Guard.                                               |
| squashfs-tools|   ✅    |   ✅    |  ✅   | Utilitários para criar e extrair imagens SquashFS.                                 |
| xorriso       |   ✅    |   ✅    |  ✅   | Utilitário para criar e gravar imagens ISO-9660.                                   |
| genisoimage   |   ✅    |   ✅    |  ✅   | Cria imagens de sistema de arquivos ISO-9660.                                      |
| eject         |   ✅    |   ✅    |  ✅   | Utilitário para ejetar mídias removíveis (CD/DVD/USB).                             |
| fuse3 / fuse  |   ✅    |   ✅    |  ✅   | Framework para criação de sistemas de arquivos em espaço de usuário.                |
| libfuse2      |   ✅    |   ✅    |  ✅   | Biblioteca de compatibilidade para aplicações FUSE legadas.                         |
| memtest86+    |   ❌    |   ✅    |  ✅   | Programa para testar memória RAM.                                                  |
| xmount        |   ❌    |   ✅    |  ✅   | Ferramenta para montar imagens de disco de vários formatos.                        |
| aria2         |   ❌    |   ✅    |  ✅   | Gerenciador de downloads multi-protocolo.                                          |
| fio           |   ❌    |   ✅    |  ✅   | Ferramenta avançada para testes e benchmarks de desempenho de disco (Flexible I/O Tester).|
| bonnie++      |   ❌    |   ✅    |  ✅   | Benchmark para testar desempenho de sistemas de arquivos.                          |
| iozone3       |   ❌    |   ✅    |  ✅   | Benchmark para testar desempenho de I/O em disco.                                  |
| stress        |   ❌    |   ✅    |  ✅   | Ferramenta para gerar carga no sistema (CPU, memória, I/O).                        |
| sysbench      |   ❌    |   ✅    |  ✅   | Benchmark completo para testar CPU, memória, I/O, bancos de dados.                 |

## Firmware e drivers

### 📦 Drivers (DKMS)

| Pacote                  | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                                                                 |
| :---------------------- | :-----: | :-----: | :---: | :------------------------------------------------------------------------------------------------------ |
| broadcom-sta-dkms       |   ✅    |   ✅    |  ✅   | Driver proprietário Broadcom 802.11 STA para placas Wi-Fi. Necessário para muitos notebooks com chips Broadcom. |
| zfs-dkms                |   ❌    |   ✅    |  ✅   | Módulos do kernel para suporte ao sistema de arquivos ZFS.                                             |
| realtek-rtl8821au-dkms  |   ✅    |   ✅    |  ✅   | Driver DKMS para chipsets Realtek RTL8812AU/8821AU Wi-Fi.                                              |
| realtek-rtl88xxau-dkms  |   ✅    |   ✅    |  ✅   | Driver DKMS para várias séries Realtek RTL88xxAU Wi-Fi.                                                |
| realtek-rtl8188eus-dkms |   ✅    |   ✅    |  ✅   | Driver DKMS para chipsets Realtek RTL8188EUS Wi-Fi.                                                    |
| realtek-rtl8814au-dkms  |   ✅    |   ✅    |  ✅   | Driver DKMS para chipsets Realtek RTL8814AU Wi-Fi.                                                     |

### 🔌 Firmware

| Pacote                   | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                               |
| :----------------------- | :-----: | :-----: | :---: | :-------------------------------------------------------------------- |
| firmware-linux-free      |   ✅    |   ✅    |  ✅   | Coleção de firmwares livres (licença) para vários hardwares.           |
| firmware-linux-nonfree   |   ✅    |   ✅    |  ✅   | Metapacote incluindo todos os firmwares não livres (proprietários).    |
| firmware-atheros         |   ✅    |   ✅    |  ✅   | Firmware para placas de rede sem fio com chips Atheros.                |
| firmware-iwlwifi         |   ✅    |   ✅    |  ✅   | Firmware para placas de rede Intel Wireless (Wi-Fi).                   |
| firmware-zd1211          |   ✅    |   ✅    |  ✅   | Firmware para dispositivos Wi-Fi baseados em ZyDAS ZD1211/ZD1211B.     |
| firmware-realtek         |   ✅    |   ✅    |  ✅   | Firmware para vários dispositivos Realtek (rede, Bluetooth, etc.).     |
| firmware-bnx2            |   ✅    |   ✅    |  ✅   | Firmware para adaptadores de rede Broadcom NetXtreme II.               |
| firmware-brcm80211       |   ✅    |   ✅    |  ✅   | Firmware para placas Broadcom/Cypress 802.11 wireless.                 |
| firmware-cavium          |   ✅    |   ✅    |  ✅   | Firmware para processadores e adaptadores de rede Cavium.              |
| firmware-ipw2x00         |   ✅    |   ✅    |  ✅   | Firmware para placas Intel Pro/Wireless 2100/2200/2915 legadas.        |
| firmware-libertas        |   ✅    |   ✅    |  ✅   | Firmware para placas Marvell Libertas 8xxx wireless.                   |
| firmware-ti-connectivity |   ✅    |   ✅    |  ✅   | Firmware para chips combo da Texas Instruments (Wi-Fi, Bluetooth).     |
| firmware-b43-installer   |   ✅    |   ✅    |  ✅   | Instalador de firmware para placas Broadcom B43 legacy.                |
| firmware-sof-signed      |   ✅    |   ✅    |  ✅   | Firmware assinado para plataforma Sound Open Firmware (DSP de áudio).  |

## Interface gráfica básica

### 🖥️ Sistema gráfico (Xorg)

| Pacote                  | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                         |
| :---------------------- | :-----: | :-----: | :---: | :-------------------------------------------------------------- |
| xserver-xorg            |   ✅    |   ✅    |  ✅   | Servidor principal do sistema gráfico X.Org.                    |
| xserver-xorg-video-all  |   ✅    |   ✅    |  ✅   | Metapacote que instala todos os drivers de vídeo 2D para X.Org. |
| xserver-xorg-video-intel|   ✅    |   ✅    |  ✅   | Driver de vídeo para gráficos integrados Intel.                 |
| xserver-xorg-input-all  |   ✅    |   ✅    |  ✅   | Metapacote que instala todos os drivers de dispositivos de entrada (mouse, teclado).|
| xinit                   |   ✅    |   ✅    |  ✅   | Utilitário para iniciar o servidor X.                           |
| xterm                   |   ✅    |   ✅    |  ✅   | Emulador de terminal padrão para X.                             |
| blackbox ou openbox     |   ✅    |   ✅    |  ✅   | Gerenciadores de janelas leves.                                 |
| libxcursor1             |   ✅    |   ✅    |  ✅   | Biblioteca para trabalhar com cursores X11.                     |
| breeze-cursor-theme     |   ✅    |   ✅    |  ✅   | Tema de cursor Breeze do KDE.                                   |
| x11-utils               |   ✅    |   ✅    |  ✅   | Conjunto de utilitários básicos do X11.                         |
| wmctrl                  |   ✅    |   ✅    |  ✅   | Utilitário para controlar janelas pela linha de comando.        |
| xdotool                 |   ✅    |   ✅    |  ✅   | Utilitário para simular entrada de teclado e mouse.             |
| libdrm-intel1           |   ✅    |   ✅    |  ✅   | Biblioteca de espaço de usuário para Intel DRM (Direct Rendering Manager).|
| libgl1-mesa-dri         |   ✅    |   ✅    |  ✅   | Implementação livre do OpenGL para renderização direta.         |
| libglu1-mesa            |   ✅    |   ✅    |  ✅   | Biblioteca utilitária Mesa OpenGL (GLU).                        |

### 🔌 Acesso remoto (XRDP)

| Pacote           | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                        |
| :--------------- | :-----: | :-----: | :---: | :------------------------------------------------------------- |
| xrdp e xorgxrdp   |   ❌    |   ✅    |  ✅   | Servidor para conexão ao desktop gráfico via protocolo RDP.    |

### 🎨 Componentes de interface

| Pacote                      | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                   |
| :-------------------------- | :-----: | :-----: | :---: | :---------------------------------------- |
| librsvg2-common             |   ✅    |   ✅    |  ✅   | Biblioteca para renderização de imagens SVG.|
| adwaita-icon-theme-antix    |   ✅    |   ✅    |  ✅   | Tema de ícones Adwaita.                   |
| elementary-minios-icon-theme|   ✅    |   ✅    |  ✅   | Tema de ícones elementary especial para MiniOS.|

## XFCE

### 🖼️ Ambiente desktop (XFCE)

| Pacote               | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                                                |
| :------------------- | :-----: | :-----: | :---: | :------------------------------------------------------------------------------------- |
| dbus-x11             |   ✅    |   ✅    |  ✅   | Inicia o barramento de mensagens D-Bus na sessão X11, necessário para comunicação entre aplicativos. |
| libxfce4ui-utils     |   ✅    |   ✅    |  ✅   | Bibliotecas com widgets e utilitários comuns da interface XFCE.                        |
| thunar               |   ✅    |   ✅    |  ✅   | Gerenciador de arquivos padrão do XFCE.                                                |
| thunar-volman        |   ✅    |   ✅    |  ✅   | Gerencia montagem automática de mídias removíveis no Thunar.                           |
| xfce4-appfinder      |   ✅    |   ✅    |  ✅   | Utilitário para localizar e iniciar aplicativos rapidamente.                           |
| xfce4-panel          |   ✅    |   ✅    |  ✅   | Painel do desktop XFCE.                                                                |
| xfce4-session        |   ✅    |   ✅    |  ✅   | Gerenciador de sessão XFCE, controla inicialização e encerramento da sessão.           |
| xfce4-settings       |   ✅    |   ✅    |  ✅   | Central de controle de configurações do XFCE.                                          |
| xfconf               |   ✅    |   ✅    |  ✅   | Sistema de configuração do XFCE.                                                       |
| xfdesktop4           |   ✅    |   ✅    |  ✅   | Gerencia o desktop: papéis de parede, ícones, menu.                                    |
| xfwm4                |   ✅    |   ✅    |  ✅   | Gerenciador de janelas do XFCE.                                                        |
| greybird-gtk-theme   |   ✅    |   ✅    |  ✅   | Tema GTK popular e limpo, muito usado no XFCE.                                         |
| xfce4-xkb-plugin     |   ✅    |   ✅    |  ✅   | Plugin de painel para alternar layouts de teclado.                                     |
| xfce4-notifyd        |   ❌    |   ✅    |  ✅   | Daemon para exibir notificações na área de trabalho.                                   |
| menulibre            |   ❌    |   ✅    |  ✅   | Editor de menus avançado para ambientes GTK.                                           |
| network-manager-gnome|   ✅    |   ✅    |  ✅   | Applet gráfico para gerenciar conexões de rede (NetworkManager).                       |

### 🛠️ Utilitários de sistema e interface gráfica

| Pacote                   | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                                                          |
| :----------------------- | :-----: | :-----: | :---: | :---------------------------------------------------------------------------------------------- |
| gvfs-backends            |   ✅    |   ✅    |  ✅   | Conjunto de backends do GVfs, fornece acesso a FTP, SFTP, SMB etc. pelo gerenciador de arquivos.|
| open-vm-tools-desktop    |   ❌    |   ✅    |  ✅   | Componentes para melhor integração do SO convidado com VMware (área de transferência, resolução).|
| gtk-update-icon-cache    |   ❌    |   ✅    |  ✅   | Utilitário para atualizar o cache de temas de ícones GTK.                                       |
| libglib2.0-bin           |   ✅    |   ✅    |  ✅   | Utilitários binários para a biblioteca GLib 2.0.                                                |
| at-spi2-core             |   ✅    |   ✅    |  ✅   | Protocolo e bibliotecas para acessibilidade (leitores de tela, etc.).                           |
| qt5/qt6-gtk-platformtheme|   ❌    |   ✅    |  ✅   | Plugins para aplicações Qt5/Qt6 usarem tema GTK para aparência consistente.                     |
| policykit-1-gnome        |   ✅    |   ✅    |  ✅   | Agente de autenticação PolicyKit para ambientes GTK, solicita senha para ações privilegiadas.   |
| libxml2-utils            |   ✅    |   ✅    |  ✅   | Utilitários de linha de comando para trabalhar com arquivos XML (ex.: `xmllint`).               |
| xmlstarlet               |   ✅    |   ✅    |  ✅   | Ferramenta poderosa de linha de comando para parsear, transformar e editar XML.                 |

### 🧰 Aplicativos

| Pacote                        | Padrão | Toolbox | Ultra | ℹ️ Informações do pacote                                                                                       |
| :---------------------------- | :-----: | :-----: | :---: | :------------------------------------------------------------------------------------------------------------ |
| minios-installer              |   ✅    |   ✅    |  ✅   | Instalador gráfico do sistema MiniOS.                                                                         |
| minios-configurator           |   ✅    |   ✅    |  ✅   | Configurador do sistema MiniOS.                                                                               |
| mintstick                     |   ✅    |   ✅    |  ✅   | Utilitário para formatar pendrives USB e gravar imagens ISO.                                                  |
| mousepad                      |   ✅    |   ✅    |  ✅   | Editor de texto simples e rápido para XFCE.                                                                   |
| ristretto                     |   ✅    |   ✅    |  ✅   | Visualizador de imagens simples e rápido para XFCE.                                                           |
| **Navegadores web**           |
| firefox-esr                   |   ✅    |   ✅    |  ✅   | Navegador Firefox com Extended Support Release (ESR). Versão estável que recebe atualizações de segurança por período estendido. |
| **Multimídia**                |
| vlc                           |   ❌    |   ✅    |  ✅   | Reprodutor de mídia poderoso e popular, suporta vários formatos.                                              |
| vlc-plugin-bittorrent         |   ❌    |   ✅    |  ✅   | Plugin do VLC para reproduzir vídeos diretamente de arquivos torrent.                                         |
| vlc-plugin-samba              |   ❌    |   ✅    |  ✅   | Plugin do VLC para acessar arquivos em compartilhamentos de rede Samba (Windows).                             |
| vlc-l10n                      |   ❌    |   ✅    |  ✅   | Pacotes de localização para interface do VLC.                                                                |
| gimp                          |   ❌    |   ❌    |  ✅   | Editor de imagens raster poderoso, alternativa ao Adobe Photoshop.                                            |
| obs-studio                    |   ❌    |   ❌    |  ✅   | Programa para gravação e transmissão de vídeo da tela e outras fontes.                                        |
| obs-plugins                   |   ❌    |   ❌    |  ✅   | Plugins e efeitos adicionais para o OBS Studio.                                                              |
| inkscape                      |   ❌    |   ❌    |  ✅   | Editor profissional de gráficos vetoriais, alternativa ao Adobe Illustrator.                                  |
| blender                       |   ❌    |   ❌    |  ✅   | Suite profissional para criação de gráficos 3D, animação e vídeo.                                            |
| audacity                      |   ❌    |   ❌    |  ✅   | Editor de áudio popular para gravação e processamento de som.                                                 |
| rawtherapee                   |   ❌    |   ❌    |  ✅   | Editor avançado para processamento de fotos RAW.                                                             |
| **Office e Documentos**       |
| pdfarranger                   |   ❌    |   ✅    |  ✅   | Utilitário simples para mesclar, dividir e reorganizar páginas PDF.                                          |
| libreoffice                   |   ❌    |   ❌    |  ✅   | Suite office completa (editor de texto, planilhas, apresentações).                                           |
| libreoffice-gtk3              |   ❌    |   ❌    |  ✅   | Integração do LibreOffice com tema GTK3 para aparência consistente.                                          |
| libreoffice-style-elementary  |   ❌    |   ❌    |  ✅   | Tema de ícones elementary para o LibreOffice.                                                               |
| fonts-open-sans               |   ❌    |   ❌    |  ✅   | Fonte Open Sans popular e legível.                                                                          |
| **Utilitários de sistema (GUI)**|
| gparted                       |   ❌    |   ✅    |  ✅   | Editor gráfico de partições de disco.                                                                      |
| gsmartcontrol                 |   ❌    |   ✅    |  ✅   | Interface gráfica para o utilitário smartmontools (monitoramento de disco).                                 |
| baobab                        |   ❌    |   ✅    |  ✅   | Analisador gráfico de uso de disco.                                                                        |
| hardinfo                      |   ❌    |   ✅    |  ✅   | Utilitário para coletar e exibir informações detalhadas do sistema e hardware.                              |
| virt-manager                  |   ❌    |   ✅    |  ✅   | Interface gráfica para gerenciar máquinas virtuais via libvirt.                                            |
| gir1.2-spiceclientgtk-3.0     |   ❌    |   ✅    |  ✅   | Biblioteca para integração do protocolo SPICE (acesso remoto a VMs).                                       |
| doublecmd-gtk                 |   ❌    |   ✅    |  ✅   | Gerenciador de arquivos de dois painéis, similar ao Total Commander.                                       |
| onboard                       |   ❌    |   ✅    |  ✅   | Teclado virtual para pessoas com deficiência.                                                             |
| grsync                        |   ❌    |   ✅    |  ✅   | Interface gráfica para o poderoso utilitário de sincronização `rsync`.                                     |
| rescuezilla                   |   ❌    |   ✅    |  ✅   | Ferramenta simples para criar backups e recuperação de disco, alternativa ao Clonezilla.                   |
| kdiskmark                     |   ❌    |   ✅    |  ✅   | Ferramenta para testar desempenho de disco, alternativa ao CrystalDiskMark.                                |
| qdiskinfo                     |   ❌    |   ✅    |  ✅   | Ferramenta para exibir informações de disco, alternativa ao CrystalDiskInfo.                               |
| bleachbit                     |   ❌    |   ✅    |  ✅   | Utilitário para limpar arquivos temporários e desnecessários do sistema.                                   |
| gtkhash                       |   ❌    |   ✅    |  ✅   | Utilitário simples para calcular somas de hash de arquivos.                                                |
| czkawka / czkawka-gui         |   ❌    |   ✅    |  ✅   | Utilitário para encontrar e remover arquivos duplicados, pastas vazias, etc.                               |
| zulucrypt-gui                 |   ❌    |   ✅    |  ✅   | Interface gráfica para gerenciamento de volumes criptografados.                                            |
| zulumount-gui                 |   ❌    |   ✅    |  ✅   | Interface gráfica para montagem de volumes criptografados.                                                 |
| keepassxc                     |   ❌    |   ✅    |  ✅   | Gerenciador de senhas multiplataforma.                                                                    |
| guymager                      |   ❌    |   ✅    |  ✅   | Ferramenta para cópia forense de discos (criação de imagens).                                             |
| isomaster                     |   ❌    |   ✅    |  ✅   | Editor gráfico para imagens de disco ISO.                                                                 |
| qphotorec                     |   ❌    |   ✅    |  ✅   | Interface gráfica para o utilitário PhotoRec (recuperação de arquivos).                                   |
| veracrypt                     |   ❌    |   ✅    |  ✅   | Programa para criar e gerenciar contêineres e discos criptografados.                                      |
| wxhexeditor                   |   ❌    |   ✅    |  ✅   | Editor hexadecimal avançado para arquivos grandes.                                                        |
| synaptic                      |   ❌    |   ❌    |  ✅   | Gerenciador de pacotes gráfico clássico para Debian/Ubuntu.                                               |
| eddy / eddy-handler           |   ❌    |   ❌    |  ✅   | Instalador gráfico simples para pacotes .deb locais.                                                      |
| **Aplicativos de rede (GUI)** |
| wireshark                     |   ❌    |   ✅    |  ✅   | Analisador de tráfego de rede poderoso.                                                                  |
| remmina                       |   ❌    |   ✅    |  ✅   | Cliente de desktop remoto com suporte a RDP, VNC, SSH e outros protocolos.                                |
| remmina-plugin-rdp            |   ❌    |   ✅    |  ✅   | Plugin para suporte ao protocolo RDP no Remmina.                                                         |
| remmina-plugin-vnc            |   ❌    |   ✅    |  ✅   | Plugin para suporte ao protocolo VNC no Remmina.                                                         |
| gnome-nettool                 |   ❌    |   ✅    |  ✅   | Conjunto de utilitários gráficos de rede (ping, traceroute, varredura de portas).                        |
| zenmap                        |   ❌    |   ✅    |  ✅   | Interface gráfica oficial para o scanner de rede nmap.                                                   |
| x11vnc                        |   ❌    |   ✅    |  ✅   | Servidor VNC que permite controle remoto da sessão X atual.                                              |
| uget                          |   ❌    |   ✅    |  ✅   | Gerenciador de downloads gráfico.                                                                        |
| android-file-transfer         |   ❌    |   ✅    |  ✅   | Utilitário para transferir arquivos de dispositivos Android via protocolo MTP.                           |
| **Desenvolvimento**           |
| codium                        |   ❌    |   ✅    |  ✅   | Versão livre do editor VS Code sem telemetria da Microsoft.                                              |
