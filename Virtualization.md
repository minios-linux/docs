# MiniOS Virtualization Guide

This guide covers running MiniOS in virtual machines, optimizing performance, and using MiniOS as a virtualization host. MiniOS is based on Debian 13 "Trixie" and includes built-in virtualization drivers and guest tools for optimal performance.

## MiniOS Specific Virtualization Features

MiniOS includes built-in support for virtualization detection and automatic resolution adjustment. The system includes the `minios-virtreschange` script, which automatically detects virtual environments (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) and adjusts the screen resolution accordingly.

**Automatic Resolution Management:**
- **Kernel parameter:** `virtres=WIDTHxHEIGHT` (e.g., `virtres=1920x1080`)
- **Disable auto-adjustment:** `novirtres` kernel parameter
- **Default resolution:** 1280x800 (if virtres parameter is not specified)
- **Detection:** Automatically detects VM environments and adjusts accordingly

## Running MiniOS as a Guest System

### General VM Configuration

**Recommended settings (all platforms):**
- **Memory:** 2 GB minimum, 4 GB recommended (Standard edition: 1 GB minimum)
- **Processors:** 2 cores minimum
- **Storage:** 4 GB minimum (8 GB recommended for persistence)
- **OS Type:** Linux 64-bit / Other Linux 64-bit

**Disk Controller Selection:**
- **VMware:** Use SCSI controller for better performance
- **VirtualBox:** Use SATA controller with AHCI
- **QEMU/KVM:** Use VirtIO block devices
- **Hyper-V:** Use SCSI controller

**Network Adapter Selection:**
- **VMware:** Use VMXNET3 for better performance
- **VirtualBox:** Use Intel PRO/1000 MT Desktop
- **QEMU/KVM:** Use VirtIO network interface
- **Hyper-V:** Use synthetic network adapter

### Installing Guest Tools

**VMware (VMware Workstation/Player):**
In MiniOS Toolbox and Ultra editions, `open-vm-tools` is pre-installed. For Standard edition:
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
In MiniOS Toolbox and Ultra editions, `qemu-guest-agent` is pre-installed. For Standard edition:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Integration components are pre-installed in MiniOS. For advanced features:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Using MiniOS as a Virtualization Host

MiniOS includes built-in support for running containers and virtual machines in Toolbox and Ultra editions. The Ultra edition provides full Docker and KVM/QEMU support, while Toolbox only includes virtualization tools.

### Docker Support
**Ultra Edition:** Docker is pre-installed, including lazydocker - a UI for managing Docker

**Other editions:** Docker can be installed manually:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### KVM/QEMU Support
**Toolbox and Ultra Editions:** KVM tools are pre-installed, including virt-manager - a GUI for managing virtual machines

**Other editions:** Virtualization tools can be installed manually:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### VirtualBox Support
VirtualBox is not included in the official Debian 13 repositories, but can be installed via official Oracle packages:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Users are automatically added to the `vboxusers` group to access VirtualBox features.
