# Using the `dd` command

`dd` is a versatile command-line utility for bit-by-bit copying of data between files and devices. Most commonly used for writing ISO images to USB drives, creating backups and data recovery.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

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


## Automatic Change Persistence

On first boot, MiniOS will check the drive's filesystem type and select the optimal change persistence mode. When free space is available, the system will automatically create an ext4 partition for maximum performance.

### Parameter Configuration (for advanced users)

For precise persistence configuration, boot parameters can be used:

- `perchmode=native` - Direct partition saving (default, fastest)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Storage space size for data in MB for image files

Details in [boot parameters](Boot-Parameters.md).