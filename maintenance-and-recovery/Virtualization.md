---
updated: 2026-08-31
---
# Virtualization

MiniOS can run as a guest in VirtualBox, VMware, QEMU/KVM, and Hyper-V.
Toolbox and Ultra also include software for running QEMU/KVM virtual machines from MiniOS itself.

This page documents MiniOS-specific virtualization behavior. For ordinary VM creation and hypervisor settings, use the documentation of the hypervisor.

## Running MiniOS as a guest

### Recommended VM layout

For the widest compatibility, attach the MiniOS boot media and any virtual disk that will contain a MiniOS live installation through an **IDE or SATA controller**. This recommendation applies to VirtualBox, VMware, QEMU/KVM, and Hyper-V whenever such a controller is available.

Other virtual storage controllers can work, but MiniOS must be able to access its live source during the initramfs stage, before the full kernel module tree from `01-kernel-*.sb` is available.
### Early-boot storage support

MiniOS intentionally carries only a selected set of storage drivers in the initramfs. The current Dracut and LiveKit builders use the same policy:

| Storage interface | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Yes | Yes |
| NVMe | Yes | Yes |
| USB mass storage / UAS | Yes | Yes |
| Hyper-V storage (`hv_storvsc`) | Yes | Yes |
| VirtIO block / SCSI | No | Yes |
| VMware PVSCSI | No | Yes |
| Xen block frontend | No | No |

Common SAS/RAID drivers such as `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas`, and `aacraid` are present in the full kernel module tree but are not included in the MiniOS initramfs.

This distinction matters only before the MiniOS live source has been found and the full system has started. Hardware that works normally after boot is not necessarily suitable for holding the live source itself.

For this reason, **IDE or SATA remains the recommended VM storage choice**, even for editions whose initramfs also contains VirtIO or VMware PVSCSI support.
### Guest integration

The kernel already provides the basic virtual hardware drivers used by the main hypervisors. Toolbox and Ultra add guest-service packages for tighter integration:

| Platform | Included guest integration in Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` on supported bases |
| Hyper-V | `hyperv-daemons` |

The current Debian kernel used by amd64 MiniOS also contains VirtualBox guest drivers, VMware graphics/network drivers, VirtIO, and Hyper-V drivers. Guest service packages add integration features; they are not what makes the basic VM boot possible.

### Xfce resolution handling

MiniOS provides `/usr/bin/minios-virtual-resolution` through `minios-tools` and starts it from the Xfce autostart session. It detects common virtual machines and uses XRandR only when active guest tools are not already managing the display.

Without an override, the requested resolution is `1280x800`. Use `virtres=WIDTHxHEIGHT` to request another resolution or `novirtres` to disable this MiniOS adjustment.
After a successful adjustment, the utility creates `~/.config/minios/virtual-resolution-configured`. In a persistent session it will not apply the automatic adjustment again until that marker is removed.

## Using MiniOS as a virtualization host

Toolbox and Ultra include the QEMU/KVM stack used for local virtual machines:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra additionally includes its Docker stack and `lazydocker` for container workloads.

This documentation does not describe installing virtualization products that are not part of an edition.

## See also

- [Hardware compatibility](/getting-started/Hardware-Compatibility)
- [Initrd system discovery](/reference/boot-process/System-Discovery)
- [Boot parameters](/reference/Boot-Parameters)
- [Packages and editions](/reference/Package-and-Edition-Contents)
