# Guia de Virtualização do MiniOS

Este guia aborda como executar o MiniOS em máquinas virtuais, otimizar o desempenho e usar o MiniOS como host de virtualização. O MiniOS é baseado no Debian 13 "Trixie" e inclui drivers de virtualização e ferramentas de integração para convidados já integrados, garantindo desempenho ideal.

## Recursos Específicos de Virtualização do MiniOS

O MiniOS possui suporte nativo para detecção de virtualização e ajuste automático de resolução. O sistema inclui o script `minios-virtreschange`, que detecta automaticamente ambientes virtuais (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) e ajusta a resolução da tela conforme necessário.

**Gerenciamento Automático de Resolução:**
- **Parâmetro do kernel:** `virtres=LARGURAxALTURA` (ex: `virtres=1920x1080`)
- **Desabilitar ajuste automático:** parâmetro do kernel `novirtres`
- **Resolução padrão:** 1280x800 (caso o parâmetro virtres não seja especificado)
- **Detecção:** Detecta automaticamente ambientes de VM e ajusta conforme necessário

## Executando o MiniOS como Sistema Convidado

### Configuração Geral da VM

**Configurações recomendadas (todas as plataformas):**
- **Memória:** mínimo de 2 GB, recomendado 4 GB (Edição Standard: mínimo de 1 GB)
- **Processadores:** mínimo de 2 núcleos
- **Armazenamento:** mínimo de 4 GB (8 GB recomendados para persistência)
- **Tipo de SO:** Linux 64-bit / Outro Linux 64-bit

**Seleção do Controlador de Disco:**
- **VMware:** Use o controlador SCSI para melhor desempenho
- **VirtualBox:** Use o controlador SATA com AHCI
- **QEMU/KVM:** Use dispositivos de bloco VirtIO
- **Hyper-V:** Use o controlador SCSI

**Seleção do Adaptador de Rede:**
- **VMware:** Use VMXNET3 para melhor desempenho
- **VirtualBox:** Use Intel PRO/1000 MT Desktop
- **QEMU/KVM:** Use interface de rede VirtIO
- **Hyper-V:** Use adaptador de rede sintético

### Instalando Ferramentas para Convidado

**VMware (VMware Workstation/Player):**
Nas edições Toolbox e Ultra do MiniOS, o `open-vm-tools` já vem pré-instalado. Para a edição Standard:
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

**VirtualBox:**
```bash
# Insert Guest Additions CD and install
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot
```

**QEMU/KVM:**
Nas edições Toolbox e Ultra do MiniOS, o `qemu-guest-agent` já vem pré-instalado. Para a edição Standard:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Os componentes de integração já estão pré-instalados no MiniOS. Para recursos avançados:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Usando o MiniOS como Host de Virtualização

O MiniOS oferece suporte nativo para execução de containers e máquinas virtuais nas edições Toolbox e Ultra. A edição Ultra fornece suporte completo ao Docker e KVM/QEMU, enquanto a Toolbox inclui apenas ferramentas de virtualização.

### Suporte ao Docker

**Edição Ultra:** O Docker já vem pré-instalado, incluindo o lazydocker – uma interface para gerenciar o Docker

**Outras edições:** O Docker pode ser instalado manualmente:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Suporte ao KVM/QEMU

**Edições Toolbox e Ultra:** As ferramentas KVM já vêm pré-instaladas, incluindo o virt-manager – uma interface gráfica para gerenciar máquinas virtuais

**Outras edições:** As ferramentas de virtualização podem ser instaladas manualmente:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Suporte ao VirtualBox

O VirtualBox não está incluído nos repositórios oficiais do Debian 13, mas pode ser instalado pelos pacotes oficiais da Oracle:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Os usuários são adicionados automaticamente ao grupo `vboxusers` para acessar os recursos do VirtualBox.
