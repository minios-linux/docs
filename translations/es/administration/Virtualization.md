# Guía de Virtualización de MiniOS

Esta guía cubre la ejecución de MiniOS en máquinas virtuales, la optimización del rendimiento y el uso de MiniOS como anfitrión de virtualización. MiniOS está basado en Debian 13 "Trixie" e incluye controladores de virtualización y herramientas de invitado integradas para un rendimiento óptimo.

## Funciones Específicas de Virtualización en MiniOS

MiniOS incluye soporte integrado para la detección de virtualización y el ajuste automático de resolución. El sistema incluye el script `minios-virtreschange`, que detecta automáticamente entornos virtuales (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) y ajusta la resolución de pantalla en consecuencia.

**Gestión Automática de Resolución:**
- **Parámetro del kernel:** `virtres=ANCHOxALTO` (ejemplo: `virtres=1920x1080`)
- **Desactivar ajuste automático:** parámetro del kernel `novirtres`
- **Resolución predeterminada:** 1280x800 (si no se especifica el parámetro virtres)
- **Detección:** Detecta automáticamente entornos de VM y ajusta según corresponda

## Ejecutar MiniOS como Sistema Invitado

### Configuración General de la Máquina Virtual

**Configuración recomendada (todas las plataformas):**
- **Memoria:** 2 GB mínimo, 4 GB recomendado (Edición Standard: 1 GB mínimo)
- **Procesadores:** 2 núcleos mínimo
- **Almacenamiento:** 4 GB mínimo (8 GB recomendado para persistencia)
- **Tipo de SO:** Linux 64-bit / Otro Linux 64-bit

**Selección de Controlador de Disco:**
- **VMware:** Utilizar controlador SCSI para mejor rendimiento
- **VirtualBox:** Utilizar controlador SATA con AHCI
- **QEMU/KVM:** Utilizar dispositivos de bloque VirtIO
- **Hyper-V:** Utilizar controlador SCSI

**Selección de Adaptador de Red:**
- **VMware:** Utilizar VMXNET3 para mejor rendimiento
- **VirtualBox:** Utilizar Intel PRO/1000 MT Desktop
- **QEMU/KVM:** Utilizar interfaz de red VirtIO
- **Hyper-V:** Utilizar adaptador de red sintético

### Instalación de Herramientas de Invitado

**VMware (VMware Workstation/Player):**
En las ediciones Toolbox y Ultra de MiniOS, `open-vm-tools` viene preinstalado. Para la edición Standard:
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
En las ediciones Toolbox y Ultra de MiniOS, `qemu-guest-agent` viene preinstalado. Para la edición Standard:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Los componentes de integración vienen preinstalados en MiniOS. Para funciones avanzadas:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Usar MiniOS como Anfitrión de Virtualización

MiniOS incluye soporte integrado para ejecutar contenedores y máquinas virtuales en las ediciones Toolbox y Ultra. La edición Ultra ofrece soporte completo para Docker y KVM/QEMU, mientras que Toolbox solo incluye herramientas de virtualización.

### Soporte para Docker

**Edición Ultra:** Docker viene preinstalado, incluyendo lazydocker - una interfaz para gestionar Docker

**Otras ediciones:** Docker se puede instalar manualmente:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Soporte para KVM/QEMU

**Ediciones Toolbox y Ultra:** Las herramientas de KVM vienen preinstaladas, incluyendo virt-manager - una interfaz gráfica para gestionar máquinas virtuales

**Otras ediciones:** Las herramientas de virtualización se pueden instalar manualmente:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Soporte para VirtualBox

VirtualBox no está incluido en los repositorios oficiales de Debian 13, pero se puede instalar mediante los paquetes oficiales de Oracle:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Los usuarios se agregan automáticamente al grupo `vboxusers` para acceder a las funciones de VirtualBox.
