---
updated: 2026-08-26
---
# dd


`dd` is a versatile command-line utility for bit-by-bit copying of data between files and devices. Most commonly used for writing ISO images to USB drives, creating backups and data recovery.


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](/getting-started/Hardware-Compatibility) for detailed system requirements and drive sizes.

## Preparation

1. Identify your USB drive:
   - **Linux:** `lsblk` or `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Unmount the drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Creating Bootable USB Drive

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Replace:**
- `MiniOS.iso` - path to your ISO file
- `/dev/sdX` - your USB drive (e.g., `/dev/sdb`)


## Result and persistence

`dd` performs a raw image write: it copies the ISO layout to the whole target device. It does not create an ext4 partition in unused space, create a persistence session, or perform a MiniOS Installer deployment.

Persistence is enabled only when a boot entry or kernel command line requests it, and it still requires suitable writable storage. See [Boot modes](/using-minios/Boot-Modes) and [Initrd persistence](/reference/boot-process/Persistence-Internals) before relying on saved changes.
