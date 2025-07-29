# Using MiniOS Installer

MiniOS Installer is a graphical tool for installing MiniOS to hard drives or USB drives with UEFI/BIOS support and multiple filesystem compatibility.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss!

Before starting:
1. Double-check the selected installation device
2. Backup important data from the target device
3. Ensure the system is booted from LiveUSB/LiveCD

## Drive Requirements

### Drive Size
- **Standard (787 MB)**: minimum 2 GB
- **Toolbox (1.2 GB)**: minimum 4 GB  
- **Ultra (1.7 GB)**: minimum 4 GB
- **Recommended size**: 8 GB or larger for comfortable operation

### Supported Filesystems
- **ext4** (recommended for Linux)
- **Btrfs** (modern filesystem with snapshots)
- **FAT32** (maximum compatibility)
- **NTFS** (Windows compatibility)

## Creating Installation

### Launching MiniOS Installer

**Through applications menu:**
1. Open menu → System → "Install MiniOS"

**Through terminal:**
```bash
sudo minios-installer
```

### Installation Process

1. **Select target device:**
   - Choose a hard drive or USB drive from the list
   - Verify device size and model
   
2. **Select filesystem:**
   - **ext4**: recommended for most cases
   - **Btrfs**: for advanced users
   - **FAT32**: for maximum compatibility
   
3. **Confirm disk wipe:**
   - All data on the selected device will be deleted
   - Ensure correct device selection
   
4. **Start installation:**
   - Click "Install" button
   - Wait for process completion
   
5. **Completion:**
   - Restart the system
   - Remove LiveUSB/LiveCD

## Automatic Change Persistence

After installation, MiniOS Installer creates a system on the selected device:

- **UEFI/BIOS compatibility**: Automatic creation of necessary boot partitions
- **Change persistence**: Full support for MiniOS persistence modes
- **Filesystems**: Support for ext4, Btrfs, FAT32, NTFS

### Parameter Configuration (for advanced users)

For precise persistence configuration, boot parameters can be used:

- `perchmode=native` - Direct partition saving (when free space available)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Storage space size for data in MB

Details in [boot parameters](Boot-Parameters.md).