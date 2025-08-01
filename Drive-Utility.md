# Using Drive Utility

Drive Utility is a graphical tool for writing MiniOS ISO images to USB drives.

**Installation:** Available in MiniOS by default, for other distributions see https://github.com/minios-linux/driveutility


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size (for MiniOS writing)
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

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

## Automatic Change Persistence

When writing MiniOS through Drive Utility, an exact copy of the ISO image is created. MiniOS will automatically detect the writing method and configure change persistence on first boot.

### Parameter Configuration (for advanced users)

For precise persistence configuration, boot parameters can be used:

- `perchmode=native` - Direct partition saving (when free space available)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Storage space size for data in MB

Details in [boot parameters](Boot-Parameters.md).