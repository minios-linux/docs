---
updated: 2026-08-26
program_commits:
  minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Using MiniOS Installer


MiniOS Installer is a GTK wizard and command-line backend for deploying MiniOS from a MiniOS live session. It installs to a target disk; it is not the same as writing an ISO to bootable media.

## Before starting

An incorrect target or partitioning choice can destroy data. Back up important files, disconnect disks that are not needed, and identify the target by device path, model, and capacity. The final confirmation is the last point at which an installation can be cancelled safely.

The disk containing the running MiniOS live system is excluded from target selection. For general capacity guidance, see the [Hardware compatibility guide](Hardware-Compatibility.md).

## Installation modes

Live mode copies the selected compressed MiniOS modules and boot assets. The result keeps the modular live-system layout and can use MiniOS session persistence.

Native mode expands the selected modules into a conventional Linux root filesystem, configures the target, installs required packages, generates initramfs, and installs the bootloader. The installer detects native support from the booted image. If required kernel metadata and the EFI architecture contract are absent, compatibility mode permits only live installation.

This deployment is different from a raw ISO write, a Ventoy ISO-file multiboot setup, or a file-based live-media tool. See [Boot modes](/configuration/Boot-Modes.md) for the boundary between live and native systems.

## Start the graphical installer

Open the applications menu, select System, then select Install MiniOS. It can also be started from a terminal:

```bash
sudo minios-installer
```

The wizard collects installation mode, security, location, wired network, keyboard, account, module, storage, and boot settings. Review the exact partition geometry and operation summary before accepting the final destructive confirmation.

## Placement and boot layouts

The graphical installer offers these placement choices when the target is eligible:

- Erase all creates a new partition table and destroys all data on the target disk.
- Free space uses suitable unallocated space without shrinking an existing filesystem.
- Alongside shrinks an eligible, unmounted final ext2, ext3, ext4, or NTFS partition. Dirty, mounted, nested, ambiguous, and otherwise unsafe layouts are refused. The installer may ask before downloading missing filesystem tools.
- Manual partitioning is available only for native GUI installations on eligible direct disks. Changes are staged until final confirmation.

Automatic boot layouts are BIOS/MBR, UEFI/MBR, and UEFI/GPT. UEFI works with GPT or primary MBR layouts. BIOS is supported on primary MBR, not GPT. Extended or logical MBR preserve layouts are unsupported.

Manual mode can create, delete, format, and reuse partitions; shrink a supported filesystem from its end; assign mount points, an EFI system partition, and swap; and undo or reset staged changes. It does not support LVM, RAID, native LUKS roots, mapped or nested storage, bcache, ZFS, or Btrfs subvolume editing. LUKS session persistence does not encrypt a native root filesystem.

## Filesystems

- Live layouts can use ext2, ext4, Btrfs, FAT32, or NTFS when the required tools are installed.
- Native root filesystems can use ext2, ext4, or Btrfs. Ext4 is the general-purpose default.
- Existing ext3 filesystems may be reused or shrunk where supported, but ext3 is not offered for new formatting.
- FAT32 is limited to files smaller than 4 GiB and is available only for live layouts.
- NTFS is available only for live layouts, although an eligible NTFS partition may be shrunk for alongside placement.

Required space includes the selected module data, boot assets, requested persistence, and a 25 percent filesystem reserve. EFI and native swap space are calculated separately.

## Configuration and security

The installer can set locale, timezone, keyboard, username, passwords, user groups, hostname, services, boot menu, and module selection. Selecting a higher MiniOS module includes its required lower layers.

Security profiles are `convenient`, `balanced`, and `strict`. Live mode defaults to `convenient`; native mode defaults to `balanced`. SSH and XRDP controls are separate from the selected profile. Review remote-access services before the first network connection.

Network configuration covers the hostname and wired DHCP or static IPv4. The installer does not create or modify Wi-Fi profiles. Native and alongside installations may need network access, with your consent, to obtain GRUB, EFI, initramfs, `os-prober`, or filesystem resize packages before disk changes.

## Live session persistence

Persistence applies only to live installations:

- Native persistence stores changes directly on a POSIX-compatible target filesystem. It is not offered on FAT32 or NTFS.
- DynFileFS uses an expandable container.
- Raw uses a fixed-size image.
- LUKS uses an encrypted image created by the initrd on first boot. The passphrase is requested at boot and is never received or stored by the installer.

Container modes default to 4000 MiB. Raw and LUKS containers cannot exceed 4000 MiB on FAT32; DynFileFS is not subject to that single-file limit. LUKS is offered only when both the running initrd and each copied source initrd advertise the required crypto support.

The resulting boot options use `perchmode` and `perchsize`. See [Initrd persistence](/configuration/Initrd-Persistence.md) and [Boot parameters](/configuration/Boot-Parameters.md) for their runtime meaning and activation requirements.

## Command-line deployment

`minios-deploy` is intended for automation, testing, and recovery. Manual partitioning and interactive wired network setup remain GUI-only.

List the disks recognized as installable:

```bash
minios-deploy list-disks
```

Replace `/dev/sdb` in every example with the verified target disk. First print a non-destructive plan:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Preview the matching deployment commands without writing to disk:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Run the real installation only after checking the plan, target identity, and dry-run output. `--yes` authorizes destructive changes:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

For a native installation into existing free space, use the same storage options for planning and installation:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Native mode may not appear in CLI help on an image that lacks native-install support. The CLI also accepts configuration options for accounts, locale, timezone, keyboard, hostname, services, and a base `config.conf`. Check the exact options provided by the running image:

```bash
minios-deploy install --help
man minios-deploy
```

Avoid `--password` and `--root-password` in shared environments because plaintext command-line arguments can be exposed in shell history and the process list. Use the graphical installer or a protected configuration workflow instead.
