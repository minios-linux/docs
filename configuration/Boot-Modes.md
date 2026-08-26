---
updated: 2026-08-26
---

# MiniOS boot modes


Boot modes describe where the live system comes from, whether its writable
layer is temporary or persistent, and whether MiniOS copies its source into
RAM. They do not describe a different firmware or bootloader protocol. GRUB,
Syslinux, Ventoy, or a PXE loader starts the same basic MiniOS early-userspace
pipeline by loading a kernel and initramfs with a kernel command line.

Use this page to choose a mode and understand the resulting dependencies. For
the individual command-line options, see
[Boot parameters](/configuration/Boot-Parameters.md). For the entries supplied
by an image, see [Boot menus](/configuration/Boot-Menus.md).

## Firmware, bootloader, and early userspace

Firmware and the bootloader run before MiniOS can inspect live modules or
sessions. BIOS or UEFI starts a local bootloader, or network firmware starts a
PXE loader. That loader chooses and loads the MiniOS kernel and initramfs and
passes their command line. Ventoy also belongs to this layer: it presents an ISO
through its own boot environment before MiniOS early userspace discovers it.

The kernel then starts the MiniOS initramfs. This early userspace discovers the
live source, prepares optional RAM copies and persistence, mounts the modules,
and constructs the root filesystem. A menu label such as Fresh Start or Resume
Previous Session is therefore mostly a convenient choice of initramfs
parameters, not a separate bootloader implementation.

Native installations are different. They boot an expanded conventional Linux
root with the installed system's GRUB and initramfs. They do not use the modular
live pipeline described below.

## Live boot sequence

The live pipeline runs in this order:

1. **Load the kernel and initramfs.** The firmware-selected bootloader loads both
   files and supplies the kernel command line. At this point no MiniOS
   SquashFS root has been assembled.
2. **Discover the source.** The initramfs searches local block devices, follows
   an explicit `from=` location, loop-mounts a local ISO, mounts an HTTP ISO, or
   downloads the PXE data set. Source discovery and persistence discovery are
   related but distinct operations.
3. **Copy to RAM when requested.** Bare `toram` and `toram=full` copy the full
   MiniOS data tree, subject to persistence handling. `toram=trim` copies the
   selected modules and required configuration instead. The initramfs then
   attempts to detach the original source. A completed copy alone does not
   prove that detachment succeeded.
4. **Select persistence.** If persistence was requested, the initramfs resolves
   the persistence location and session, checks it, and prepares its writable
   layer. Resume, new, and interactive selection differ only in how that
   session is chosen or created. Without a persistence request, the writable
   layer is memory-backed.
5. **Reconcile the running kernel set.** The kernel is already running and
   cannot be changed at this stage. MiniOS checks that the active data tree has
   the `01-kernel` module, kernel image, and initramfs matching that running
   kernel. If the complete matching set exists in the inactive kernel
   repository, MiniOS attempts to activate it and moves other active kernel
   sets into the repository. This is reconciliation of files, not a kernel
   fallback or an in-place kernel switch.
6. **Mount modules.** Selected `.sb` files from the MiniOS data tree and any
   applicable writable module store are sorted, filtered by `load=` and
   `noload=`, and loop-mounted read-only.
7. **Construct AUFS or OverlayFS.** MiniOS combines the mounted modules with one
   writable layer. AUFS adds the ordered module mounts as read-only branches.
   OverlayFS receives the complete ordered lower-directory list plus its upper
   and work directories when the root is mounted. The resulting union is the
   live root filesystem.
8. **Apply `rootcopy` and run `minios-boot`.** Files under the source
   `rootcopy/` directory are copied into the assembled root. The initramfs then
   runs `minios-boot` in a chroot to synchronize MiniOS configuration and apply
   early boot-time userspace settings. It also prepares `fstab` and runs an
   optional `rootcopy/run/preinit.sh` hook before handoff.
9. **Hand off to normal userspace.** LiveKit uses `pivot_root` for its final
   handoff, while dracut prepares the same assembled root and performs the final
   `switch_root`. The installed init system then starts normal services and the
   desktop or console session. Early network-fetch settings are not durable
   userspace network configuration.

The detailed discovery, module, and persistence contracts are documented in
[Initrd system discovery](/configuration/Initrd-System-Discovery.md),
[Initrd module loading](/configuration/Initrd-Module-Loading.md), and
[Initrd persistence](/configuration/Initrd-Persistence.md).

## Mode matrix

| Mode | Live source | Writable layer | Source dependency after boot |
|------|-------------|----------------|------------------------------|
| Fresh local | Local `minios/` tree or local ISO | Temporary RAM | Remains unless a requested nonpersistent `toram` copy detached it successfully. |
| Persistent resume | Local or explicitly selected persistence store | Existing compatible session when available | Source and persistence storage normally remain in use. Resume is not a promise that every missing or damaged session will be recovered. |
| Persistent new | Writable persistence store | Newly allocated numbered session | Source and persistence storage remain in use. Creation requires compatible writable storage and sufficient space. |
| Persistent choose | Interactive persistence location and session choice | Selected or newly created session | Depends on the selected source and persistence store. Selection does not make an incompatible session safe. |
| Bare or full `toram` | Any discoverable live source | Temporary RAM unless persistence is also requested | Bare `toram` means `toram=full`. Media is removable only after successful nonpersistent source detachment. |
| Trim `toram` | Any discoverable live source | Temporary RAM unless persistence is also requested | Copies only the filtered module set and required data. The same detachment condition applies. |
| Local ISO or Ventoy | Loop-mounted ISO or Ventoy-presented ISO | Temporary RAM or a separately selected session | ISO and underlying mappings remain required unless nonpersistent `toram` detaches them successfully. |
| HTTP ISO | ISO mounted through `httpfs2` over HTTP | Temporary RAM or a separately selected session | The fetch path and network remain relevant while the root is backed by httpfs; `toram` can remove that dependency only if detachment succeeds. |
| PXE | Kernel and initramfs from the loader, MiniOS data downloaded by the initramfs | Temporary RAM or a separately selected session | Early networking is for loading data, not session network policy. Exact dependencies depend on what was downloaded and mounted. |
| Native installation | Expanded installed root, not `.sb` live modules | Normal installed filesystems | Does not use live discovery, live sessions, `toram`, module union assembly, or this live handoff pipeline. |

## Combinations and boundaries

Source, persistence, and RAM-copy choices are separate axes. A local directory,
local ISO, HTTP ISO, or PXE data source can supply live modules. Persistence can
then be omitted, resumed, created, or selected where supported. `toram=full` or
`toram=trim` can be requested with a supported live source.

Persistence and `toram` can appear together, but this is not the same contract
as ordinary persistent operation. MiniOS copies requested session data into the
RAM data tree before persistence setup. Do not assume that later writes will be
saved back to the original store, and do not remove its media on the strength of
the `toram` option alone. The removable-media boundary is narrower: removal is
safe only after MiniOS has successfully detached a **nonpersistent** RAM copy
from the original source. If detachment fails, the source remains mounted. For
Ventoy, MiniOS releases its mappings only after that successful nonpersistent
detachment; mapping cleanup is best-effort.

`toram=trim` honors the module selection filters, so an excluded module is not
available merely because the original medium still exists. Full `toram`
requires enough RAM for the copied data, while trim still needs enough RAM for
the selected set and the writable workload. Neither mode guarantees that an
undersized machine will boot safely.

HTTP ISO and PXE networking belongs to the initramfs. A literal
`from=http://...` takes precedence and can use `ip=` for static early
addressing. Without that HTTP ISO source, a non-empty `ip=` selects the PXE data
path and skips local-media discovery. It is not a static address for the running
desktop. HTTP ISO supports `http://`, not `https://`. If an HTTP root was not
detached into RAM, later network reconfiguration can interrupt its backing
source. See [Network boot](/installation/Network-Boot.md) before combining
network loading with userspace network changes.

Persistence requires a suitable writable target and mode. Read-only media
cannot host a new session, encrypted persistence does not silently become
unencrypted when activation fails, and interactive acceptance does not remove
session compatibility risks. Use
[Session management](/configuration/Session-Management.md) for storage modes,
compatibility, and recovery rules.

## Decision guide

| Goal | Start with | Check before relying on it |
|------|------------|----------------------------|
| Test MiniOS without keeping changes | Fresh local | Existing sessions are not selected; ordinary source media remains in use. |
| Continue normal work | Persistent resume | The persistence target is writable and the session is compatible. |
| Keep an old session and start clean | Persistent new | There is enough space and the filesystem supports the chosen persistence mode. |
| Select among several workspaces | Persistent choose | You can identify the intended device and session; review compatibility warnings. |
| Remove local boot media after startup | Nonpersistent `toram` or `toram=trim` | Wait for successful source detachment. Do not infer success from the menu label. |
| Reduce RAM use while copying to RAM | `toram=trim` | The `load=` and `noload=` result contains every module the system needs. |
| Boot an ISO stored on a local disk or Ventoy device | Local ISO discovery | Keep the host filesystem and mappings available unless detachment is confirmed. |
| Load an ISO from a web server | HTTP ISO | Wired initramfs networking, plain HTTP availability, and continued source access. |
| Load MiniOS data from deployment infrastructure | PXE | Correct MiniOS `ip=` syntax and a supported wired interface; do not treat it as userspace network configuration. |
| Run MiniOS as a conventional installed system | Native installation | Follow native installation and recovery documentation, not live-session or `toram` procedures. |

When a boot fails before the live root is assembled, first identify whether the
failure is in firmware/bootloader startup, source discovery, persistence, module
mounting, or root construction. Avoid repair commands until the storage layout
is known. See [Boot recovery](/administration/Boot-Recovery.md).

## Related documentation

- [Initrd system discovery](/configuration/Initrd-System-Discovery.md)
- [Initrd module loading](/configuration/Initrd-Module-Loading.md)
- [Initrd persistence](/configuration/Initrd-Persistence.md)
- [Boot parameters](/configuration/Boot-Parameters.md)
- [Boot menus](/configuration/Boot-Menus.md)
- [Network boot](/installation/Network-Boot.md)
- [Session management](/configuration/Session-Management.md)
- [System architecture](/about/System-Architecture.md)
- [Boot recovery](/administration/Boot-Recovery.md)
