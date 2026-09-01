---
updated: 2026-08-31
---
# Hardware compatibility

MiniOS is designed to run on different x86 computers rather than being tied to one machine. The most reliable compatibility test is therefore to boot the actual MiniOS image on the target hardware and check the devices you intend to use.

Hardware support depends on the selected image: its architecture, base distribution, kernel, firmware, drivers, desktop, and edition all matter. A newer or different MiniOS image can support hardware that an older one does not.

## Architecture

MiniOS supports both 64-bit and 32-bit x86 systems:

| Image architecture | Use it for |
|---|---|
| **amd64** | 64-bit x86 computers |
| **i386** | Supported 32-bit x86 computers |

Use the architecture stated in the image name and release description. The availability of 32-bit images depends on the MiniOS release and base distribution.

## Firmware and boot

MiniOS PC images can boot through legacy BIOS and UEFI when the required boot files are present in the selected image. Firmware implementations vary widely, so the same USB device may appear differently in the boot menu on different computers.

Current 64-bit MiniOS images use the Debian kernel and Debian EFI components.
They therefore support **Secure Boot** on amd64 systems.

The 32-bit i386 images use a MiniOS-built kernel because Debian no longer publishes 32-bit kernel packages. This kernel is kept identical to the corresponding Debian kernel, but it is built by MiniOS and is not part of Debian's signed boot chain. Therefore **Secure Boot is not supported by i386 MiniOS images**.

## Memory

Recommended minimum memory depends on the edition:

| Edition | Recommended minimum RAM |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

These values are for normal use from the boot medium. Actual applications may need more memory.

**Run from RAM** needs additional memory because MiniOS data is copied into RAM alongside the running system and applications. Larger images therefore require substantially more memory in this mode.

See [Boot modes](/using-minios/Boot-Modes) before using **Run from RAM** on a memory-constrained computer.

## Graphics

Current amd64 MiniOS images use the Debian graphics stack with Xorg and Mesa.
The kernel includes Intel `i915` and `xe`, AMD `amdgpu` and `radeon`, and the open-source NVIDIA `nouveau` driver.

Xorg includes its generic `modesetting` driver together with Intel, AMD/ATI, Radeon, Nouveau, VESA, and framebuffer drivers. Mesa provides the normal 3D acceleration stack used by Intel, AMD, and supported open-source drivers.

Debian-based MiniOS images install the Debian firmware collections alongside vendor-specific firmware packages. The current Trixie Standard image includes `firmware-amd-graphics` and `firmware-misc-nonfree`; Ubuntu-based images use `linux-firmware` instead.

The maintained MiniOS package lists do not include the proprietary NVIDIA kernel driver. NVIDIA hardware therefore uses the included `nouveau` driver by default. Hardware or features that specifically require NVIDIA's proprietary driver need it to be added separately.

Virtual graphics are also covered by kernel and Xorg drivers for common VMware, QXL, Bochs, and Hyper-V devices.

## Network hardware

Current amd64 MiniOS images use the Debian kernel with its normal networking driver set. The 6.12 kernel used by current Trixie images includes drivers for common Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell, and other Ethernet and Wi-Fi hardware.

Common Ethernet drivers include Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, and `ixgbe`; Realtek `8139` and `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x`, and `bnxt`; Atheros `atl*` and `alx`; Marvell `sky2`; and common USB Ethernet drivers such as ASIX, `r8152`, CDC Ethernet/NCM, and RNDIS.

Wi-Fi support includes Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, and `ath12k`; Broadcom `brcmfmac`, `brcmsmac`, and `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, and `rtw89`; and several older Marvell, Intersil, ZyDAS, and other drivers.

MiniOS also adds DKMS modules for hardware not covered well enough by the stock kernel. The current amd64 module set includes additional Realtek USB Wi-Fi drivers for RTL8188EU, RTL8814AU, RTL8811/RTL8821AU and related RTL88xxAU adapters, plus the Broadcom STA `wl` driver.

The firmware set includes Debian firmware packages for Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium, and other common network hardware.
Exact availability still depends on the MiniOS release, architecture, and selected kernel.

For ordinary networking after boot, MiniOS uses NetworkManager. If an adapter is not detected at all, changing NetworkManager settings will not supply a missing kernel driver or firmware. See [Network configuration](/using-minios/Networking) for normal network use.

## Storage

For a live MiniOS boot, the storage controller matters twice: the firmware must be able to start the bootloader, and the MiniOS initramfs must then be able to see the device that contains the `minios/` data tree.

MiniOS intentionally includes only selected storage drivers in its initramfs.
The current builders always include IDE/PATA/SATA, NVMe, SD/MMC, USB mass storage/UAS, and Hyper-V storage support. Standard, Toolbox, and Ultra also add VirtIO block/SCSI and VMware PVSCSI support to the initramfs; Flux does not.

The full kernel module tree contains additional storage drivers that are not available during early MiniOS source discovery. If the boot menu appears but MiniOS cannot find its modules, see [Initrd system discovery](/reference/boot-process/System-Discovery).

## Virtual machines

MiniOS supports the common virtual hardware used by VirtualBox, VMware, QEMU/KVM, and Hyper-V. For boot media and installation target disks, prefer an **IDE or SATA controller** when the hypervisor offers one. These controllers provide the most predictable behavior during early boot and installation.

The current Debian 6.12 kernel already includes the main guest hardware drivers:

| Hypervisor | Drivers included in the kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, network, graphics, input, balloon, SCSI, sound, and related drivers |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`, and Hyper-V input support |

These kernel drivers are enough for basic guest operation. Additional guest services provide host integration such as automatic display handling, clean shutdown, filesystem sharing, and host/guest communication.

Toolbox and Ultra include `open-vm-tools` and `open-vm-tools-desktop` for VMware, `qemu-guest-agent` for QEMU/KVM, and `hyperv-daemons` for Hyper-V. On supported suites, including current Trixie images, they also include `virtualbox-guest-utils` and `virtualbox-guest-x11`. Flux and Standard do not include these guest-service packages by default.

See [Virtualization](/maintenance-and-recovery/Virtualization) and [Packages and editions](/reference/Package-and-Edition-Contents) for edition-specific software.

## Test a computer before relying on it

1. Boot the exact MiniOS image you plan to use.
2. Use the default **Start MiniOS** mode for normal testing, or **Start without saving** when you explicitly do not want to open or create a persistent session.
3. Check graphics, keyboard and pointing devices, sound, wired and wireless networking, the storage devices you need, and suspend/resume if you intend to use it.
4. If you plan to use persistence, make a small test change, reboot, and confirm that the expected session was activated and the change survived.
5. Only then rely on the machine for important work or perform destructive disk operations.

If something fails, first determine whether the problem occurs before the boot menu, during MiniOS source discovery, or after the operating system has started.
That distinction usually identifies whether to investigate firmware, initramfs, or normal Linux hardware support.
