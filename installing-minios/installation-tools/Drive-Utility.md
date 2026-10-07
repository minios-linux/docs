---
updated: 2026-10-06
program_commits:
  driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---
# Drive Utility

Drive Utility is a general GTK disk utility included with MiniOS. It can write an existing disk image, create an image from a physical device, format a whole device, or erase it. It is not limited to MiniOS media and it is not a replacement for MiniOS Installer.

Open it from the application menu under **System**, or run:

```bash
driveutility
```

## Safety

Writing an image, formatting, and wiping are destructive operations. Verify the target by device, model, and capacity before confirming. Keep backups of anything important and disconnect unrelated removable drives when practical.

Mounted disks are hidden by default. You can explicitly show them, but Drive Utility warns before destructive use and the backend attempts to unmount the selected device and its partitions before changing it. If the mount state is ambiguous or a filesystem remains mounted, the operation fails instead of continuing underneath an active filesystem.

## Write an image

**Write** copies an image byte-for-byte to the selected device. Compressed image input is detected by the backend where supported.

Typical uses include writing a MiniOS ISO to USB or SD media and restoring a previously created whole-device image.
For a MiniOS ISO, this is a raw image write. It copies the ISO partition and boot layout exactly as stored in the image. It does **not** create an additional writable data partition, create a persistence session, or perform a managed MiniOS Installer deployment.

Persistence after a raw write still depends on the boot mode and writable storage that the resulting image exposes. For a managed target layout or pre-created session, use [MiniOS Installer](/installing-minios/MiniOS-Installer).

CLI example:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Create a device image

**Create Image** reads a physical device into an image file. The output can remain raw or be compressed while it is written.

Supported compression choices are:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) when the required Python zstd support is installed

The graphical application can also assign the resulting file to the desktop user so a root-created backup is immediately usable without a separate ownership fix.
CLI example:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

The compression-specific extension is added automatically by the command-line reader.

## Format a device

**Format** creates a new single-filesystem layout on the selected device. Current filesystem choices are:

- FAT32
- exFAT
- NTFS
- ext4

You can set a volume label. For ext4, Drive Utility can assign the root directory to the selected user and group.

Formatting is independent from writing a MiniOS ISO. Filesystem choices on this page describe Drive Utility's formatting operation; they do not alter the filesystem layout embedded in a raw ISO write.

CLI example:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```
## Erase a device

**Wipe** chooses among controller-native erase operations, discard/TRIM, and host-side overwrites according to the selected device and requested method.

Current backends include:

- **Secure erase** — automatically selects a controller-supported method when available.
- **ATA Secure Erase / Enhanced Secure Erase** — issued through UDisks2 for supported SATA/ATA drives; frozen or unsupported devices are rejected.
- **NVMe User Data Erase / Cryptographic Erase** — uses NVMe Format NVM only when the controller reports the requested capability.
- **Discard / secure discard** — uses `blkdiscard` when the block device supports discard.
- **Zero overwrite** — writes zeroes from the host.
- **Random overwrite** — writes random data for the requested number of passes and can add a final zero pass.

Controller secure erase is not equivalent to repeatedly overwriting every logical block from the host. Availability depends on the device firmware, kernel interfaces, UDisks2, `nvme-cli`, and `blkdiscard` support.
For NVMe devices, Drive Utility preserves the active namespace LBA format, metadata setting, and protection-information setting when issuing Format NVM. It also refuses controller operations whose scope can affect multiple namespaces when the target cannot be proven safe as a single-namespace operation.

Examples:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Use overwrite-pass and partial-size controls only for the traditional zero/random methods. Controller erase and discard operate according to the device command rather than a host-side byte count.

## Command-line tools

Drive Utility installs four lower-level commands:

| Command | Purpose |
|---|---|
| `driveutility-write` | Write a raw or supported compressed image to a block device. |
| `driveutility-read` | Create a raw or compressed image from a block device. |
| `driveutility-format` | Create FAT32, exFAT, NTFS, or ext4 storage on a device. |
| `driveutility-wipe` | Erase through controller, discard, or overwrite methods. |

All destructive commands should be run only after verifying the exact target device. Use their installed man pages and `--help` output for version-specific options.
## Drive Utility versus MiniOS Installer

Use **Drive Utility** when the desired operation is a generic disk action: raw image writing, device imaging, formatting, or erasing.

Use **MiniOS Installer** when you want MiniOS-aware deployment with controlled placement, filesystem and boot-layout choices, module selection, configuration, or optional live-session creation.

For other ways to put MiniOS on media, see [Installation methods](/installing-minios/Installation-Methods). For saved changes after boot, see [Boot modes](/using-minios/Boot-Modes) and [Sessions and persistence](/using-minios/Sessions-and-Persistence).
