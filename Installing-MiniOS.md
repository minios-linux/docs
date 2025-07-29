# Installing MiniOS

This guide describes various ways to install MiniOS on storage devices.

## 1. Download the MiniOS ISO File

- Download the MiniOS ISO file from the official website.

## 2. Create a Bootable Drive

Choose one of the following methods:

- [Original Method](Original-Method.md)
- [Using Rufus](Rufus.md) (Windows) (Recommended)
- [Using UNetbootin](UNetbootin.md) (Windows/Linux/MacOS)
- [Using Ventoy](Ventoy.md) (Windows/Linux) (Recommended)
- [Using Balena Etcher](Balena-Etcher.md) (Windows/Linux/MacOS) (Recommended)
- [Using `dd`](dd.md) (Linux/MacOS) (Recommended)
- [Using Drive Utility](Drive-Utility.md) (Linux) (Recommended)
- [Using MiniOS Installer](MiniOS-Installer.md) (Recommended, MiniOS only)

## 3. Booting from the Drive

1.  Reboot your computer.
2.  Select the bootable drive in your computer's boot menu to boot from it.

## 4. Notes

- The boot installer does not support multiboot; only MiniOS will be bootable from the drive.
- Your disk must use the `msdos` partition scheme (use MBR, not GPT).
- The drive must be formatted with one of the supported file systems: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---

**Reminder:** The original installation method is no longer the main recommendation as it can be difficult for novice users. When using Balena Etcher, `dd`, or Drive Utility, the partition for saving changes will be created automatically.