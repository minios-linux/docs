# MiniOS system architecture

MiniOS boots a read-only operating system assembled from SquashFS modules and
adds one writable layer for the current session. The initramfs is responsible
for finding the media, selecting modules and persistence, constructing the root
filesystem, applying early configuration, and handing control to the installed
init system.

## Boot discovery

The BIOS or UEFI bootloader loads a Linux kernel and MiniOS initramfs from
`minios/boot/`. The initramfs then searches block devices for a `minios`
directory containing `.sb` modules. The `from=` boot parameter can instead name
a directory, block device and path, local ISO file, or interactive `askdisk`
selection. A local ISO is loop-mounted before its `minios` directory is used.

The same discovery stage supports HTTP ISO and PXE sources. Optional early-boot
networking is only for **loading MiniOS over the network** (PXE / HTTP ISO). It
is not durable session network configuration. See
[Network boot](/installation/Network-Boot.md).

After discovery, `toram=trim` can copy the selected modules and required data to
RAM, while `toram=full` copies the media data tree. See
[Boot parameters](/configuration/Boot-Parameters.md) for source, filtering, and
RAM-copy options.

## Module composition

Each `.sb` file is a read-only SquashFS filesystem. Built-in modules are stored
directly under `minios/`; additional modules can be stored under
`minios/modules/`, including durable module storage on a writable persistence
device. The initramfs discovers both locations, applies `load=` and `noload=`
filters, sorts the selected files by their numeric filename prefix, and mounts
them read-only.

A typical Xfce image contains the following ordered roles, although exact names
and numbers depend on the build and modules skipped for that target:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Later modules have higher precedence and can replace paths supplied by earlier
modules. A module can depend on files in every lower-numbered module, so a set
of module files is an ordered composition rather than a collection of
independent packages.

## AUFS and OverlayFS

MiniOS uses a union filesystem to present the modules and writable layer as one
root filesystem. It selects AUFS when the running kernel supports it and falls
back to OverlayFS otherwise. `union=aufs` requests AUFS but still falls back to
OverlayFS when AUFS is unavailable; `union=overlayfs` selects OverlayFS.

The two implementations have an important operational difference:

- AUFS starts with the writable branch and adds mounted modules as read-only
  branches. MiniOS can activate or deactivate a module in the running root when
  the AUFS mount supports that operation.
- OverlayFS receives its complete ordered `lowerdir` list when the root is
  mounted, plus an `upperdir` and `workdir`. Its lower-module set cannot be
  changed in place by Module Manager.

Module Manager therefore separates **Running now**, the mounted module set,
from **Next boot**, the modules selected by current media and boot rules. Adding
or removing a durable module normally changes the next boot only. Creating or
opening a module does not activate it. Runtime activation and deactivation are
available only with AUFS.

## Writable layer and sessions

Without persistence, the writable layer is memory-backed and disappears at
shutdown. Persistence places that layer in a numbered session under
`minios/changes/`. `session.conf` records the default session for the next boot,
the session used by the current boot, compatibility metadata, state, and
mode-specific settings.

| Mode | Writable storage | Notes |
|------|------------------|-------|
| `native` | Files stored directly in the session directory | Requires a writable POSIX filesystem that preserves Linux metadata. |
| `dynfilefs` | Expandable ext4 filesystem split across backing files | Supports POSIX filesystems and FAT32, NTFS, or exFAT media. |
| `raw` | Fixed-size `changes.img` containing ext4 | Supports POSIX filesystems and FAT32, NTFS, or exFAT media. |
| `luks` | LUKS2 `changes.luks` containing ext4 | Requires cryptsetup and an initramfs built with MiniOS encryption support. The passphrase is requested during boot. |
| `squashfs` | Compressed `changes.sb` snapshot | Unpacked into RAM for use; saving rebuilds and atomically replaces the snapshot. The persistence filesystem must preserve Linux metadata during the save. |

The active session is the default for the next boot. The running session is the
one already mounted into the current root. Activating another session does not
replace the current writable layer. Session compatibility checks include the
MiniOS version, edition, union filesystem, and persistence mode.

See [Session management](/configuration/Session-Management.md) for creation,
selection, sizing, encryption, conversion, export, and recovery commands.

## Configuration precedence

The media configuration is `minios/config.conf`, with optional fragments in
`minios/config.conf.d/`. The runtime copies are `/etc/live/config.conf` and
`/etc/live/config.conf.d/` in the composed root.

At boot, MiniOS compares modification times and copies a newer media file into
the runtime root. If the media is writable and the runtime copy is newer, it is
copied back to the media. Fragment files are synchronized by filename in both
directions. If the clock has moved backwards since the previous synchronization,
MiniOS avoids timestamp replacement and only fills missing destinations.

Kernel command-line options override corresponding values read from the runtime
configuration for that boot. This means the effective order for an explicitly
supported setting is the boot parameter, then the synchronized runtime/media
configuration, then the built-in default. Persistent runtime edits can become
the media configuration when the source is writable; read-only ISO media cannot
receive that update.

See [Configuration file](/configuration/Configuration-File.md) and
[live-config](/configuration/live-config.md) for the supported settings.

## Shutdown and save lifecycle

Normal shutdown first gives the running system a chance to flush services and
session data. A SquashFS session with shutdown saving enabled is rebuilt and
validated before filesystem teardown. The save backend writes a completion
marker for the exact running session; the shutdown initramfs checks that marker
and leaves the session dirty if the required save failed.

The shutdown initramfs then detaches unused loop devices, unmounts the old root
and writable layer, records a successful session as clean, unmounts the media,
and closes a MiniOS-owned LUKS mapping. Optical media can then be ejected before
poweroff or reboot. Manual and periodic SquashFS saves use the same snapshot
backend, but only the configured shutdown policy blocks clean finalization on a
missing shutdown save.

## Media tree

A current image is organized as follows. Optional directories appear only when
the related feature has created content.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

The booted paths under `/run/initramfs/memory/` are implementation mounts, not a
second persistent copy of this tree.

## Related documentation

- [Boot parameters](/configuration/Boot-Parameters.md)
- [Boot menus](/configuration/Boot-Menus.md)
- [Configuration file](/configuration/Configuration-File.md)
- [Session management](/configuration/Session-Management.md)
- [Network boot](/installation/Network-Boot.md)
- [Creating modules](/development/Creating-Modules.md)
