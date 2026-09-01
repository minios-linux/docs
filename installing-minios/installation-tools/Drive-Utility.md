---
updated: 2026-08-26
program_commits:
  driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---
# Drive Utility


Drive Utility is a graphical tool for writing MiniOS ISO images to USB drives.

**Installation:** Available in MiniOS by default, for other distributions see https://github.com/minios-linux/driveutility


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size (for MiniOS writing)
See [Hardware Compatibility Guide](/getting-started/Hardware-Compatibility) for detailed system requirements and drive sizes.

### Supported Filesystems
- **FAT32**: maximum compatibility
- **NTFS**: Windows compatibility
- **EXT4**: recommended for Linux

## Launching Drive Utility

**Through applications menu:**
1. Open menu → System → "Drive Utility"

**Through terminal:**
```bash
driveutility
```

## Creating Bootable USB Drive

1. **Select "Write" mode** in the main program window
2. **Select MiniOS ISO file:**
   - Click "Browse" button next to "Source" field
   - Find and select the downloaded MiniOS.iso file
3. **Select target drive:**
   - Choose your USB drive from the device list
   - Verify selection by size and model
4. **Start writing:**
   - Click "Write" button
   - Confirm operation - all data on the drive will be deleted
5. **Wait for completion** - process will take several minutes

## Result and persistence

Write mode performs a raw image write: it copies the ISO layout to the whole target device. It does not create an ext4 partition in unused space, create a persistence session, or perform a MiniOS Installer deployment. The filesystem choices above apply to Drive Utility operations that format a filesystem, not to the partition layout copied by an ISO write.

Persistence is enabled only when a boot entry or kernel command line requests it, and it still requires suitable writable storage. See [Boot modes](/using-minios/Boot-Modes) and [Initrd persistence](/reference/boot-process/Persistence-Internals) before relying on saved changes.
