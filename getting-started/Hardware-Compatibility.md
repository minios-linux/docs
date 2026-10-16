---
updated: 2026-10-15
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

Secure Boot depends on the image's complete kernel and EFI chain, not just its architecture. Debian/Ubuntu amd64 builds using the matching signed distribution kernel and EFI components can support Secure Boot. A custom or MiniOS-provided unsigned kernel does not become trusted merely because signed EFI files are present. DynBlk and the external AUFS-NG driver are unsigned: Secure Boot disables DynBlk/VMDK sessions and normally leaves OverlayFS for module composition.

Current i386 images use a MiniOS-built kernel where the selected base no longer supplies a suitable 32-bit kernel. MiniOS kernels are separate builds with MiniOS integration, not a guarantee of byte-identical Debian binaries, and are not part of Debian's signed chain. **Secure Boot is not supported by these i386 images.** Firmware bitness is a separate boot-compatibility consideration.

## Memory

Memory requirements depend on the actual release, desktop, applications, and session type. Flux generally needs less than the full XFCE editions; a browser, office suite, virtual machine, or large persistence snapshot can need substantially more than the desktop alone. Use the release's stated requirements and test the intended workload rather than treating an old edition-wide RAM figure as sufficient for every current image.

**Run from RAM** needs additional memory because MiniOS data is copied into RAM alongside the running system and applications. Larger images therefore require substantially more memory in this mode.

See [Boot modes](/using-minios/Boot-Modes) before using **Run from RAM** on a memory-constrained computer.

## Graphics

Current amd64 MiniOS images use the Debian graphics stack with Xorg and Mesa.
Depending on the selected kernel, its modules cover Intel `i915` and `xe`, AMD `amdgpu` and `radeon`, and open-source NVIDIA `nouveau` hardware.

Xorg includes its generic `modesetting` driver together with Intel, AMD/ATI, Radeon, Nouveau, VESA, and framebuffer drivers. Mesa provides the normal 3D acceleration stack used by Intel, AMD, and supported open-source drivers.

Debian-based MiniOS images request Debian firmware collections alongside vendor-specific packages, including `firmware-intel-graphics` on Trixie and Excalibur. Actual installed firmware depends on repository availability and the completed image. Ubuntu-based images use `linux-firmware` instead.

The maintained MiniOS package lists do not include the proprietary NVIDIA kernel driver. NVIDIA hardware therefore uses the included `nouveau` driver by default. Hardware or features that specifically require NVIDIA's proprietary driver need it to be added separately.

Virtual graphics are also covered by kernel and Xorg drivers for common VMware, QXL, Bochs, and Hyper-V devices.

### XFCE scaling and window management

Debian 13 and Devuan Excalibur XFCE images use MiniOS-adapted settings and desktop packages, the MiniOS tasklist and Show Desktop plugins, and `xfwm4-gl` in place of `xfwm4`. Display Settings provides Automatic interface scaling or manual 100–200% choices in 25% steps, with a timed preview and rollback. Text, controls, decorations, and themed cursors follow interface scaling; output pixel scale and monitor resolution remain separate controls. Saved manual choices override Automatic.

`xfwm4-gl` uses OpenGL by default with XRender fallback. Window Manager Tweaks configures blur, animations, fullscreen compositing bypass, and Alt+Tab appearance. Alt+Tab and taskbar thumbnails can dim or hide other windows for Peek without activating the previewed window; cached minimized images are used when available. Fade/scaling and Peek work on both renderers, while blur and Magic Lamp require OpenGL. Other suites retain their distribution XFCE components.

### Optional MateBook E packages

Huawei MateBook E 2023 support is available through separately installable Linux 6.12 packages; do not assume they are bundled in a release image. `matebook-e-dsi-dkms` supplies an experimental internal-display backport: residual colored bands and unvalidated suspend/resume remain limitations. Camera integration uses `matebook-e-cameras-dkms` and the amd64/systemd `matebook-e-cameras` userspace package. The camera packages do not install the experimental pen driver.

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
