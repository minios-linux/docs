# Using UNetbootin

UNetbootin is a cross-platform open-source utility that allows you to create bootable USB drives for various Linux distributions, including MiniOS.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss!

Before starting:
1. Double-check the selected USB drive
2. Save important data from the drive
3. Do not disconnect the drive until writing is complete


## Drive Requirements

### Drive Size
- **Standard (787 MB)**: minimum 2 GB
- **Toolbox (1.2 GB)**: minimum 4 GB  
- **Ultra (1.7 GB)**: minimum 4 GB
- **Recommended size**: 8 GB or larger for comfortable operation with change persistence

## Installing UNetbootin

1. **Download UNetbootin** from the [official website](https://unetbootin.github.io/)
2. **Install the program** on your system:
   - **Windows**: Run the installer as administrator
   - **Linux**: Install from repository or use AppImage
   - **macOS**: Drag the application to the Applications folder

## Creating Bootable USB Drive

1. **Launch UNetbootin** as administrator/root
2. **Select image source:**
   - Set the toggle to "Disk image"
   - Click the "..." button and select the MiniOS ISO file
3. **Select target device:**
   - In the "Drive" list, select your USB drive
   - Ensure the correct device is selected
4. **Start the process:** Click "OK"
5. **Wait for completion** - the process may take 10-20 minutes

## Automatic Change Persistence

UNetbootin automatically formats the drive to FAT32, so MiniOS will use dynfilefs mode for saving changes. This ensures maximum compatibility with various systems, including EFI boot support.

### Parameter Configuration (for Advanced Users)

When precise configuration is needed, boot parameters can be used:

- `perchmode=dynfilefs` - Dynamically expandable file (default)
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Data storage space size in MB

Details in [boot parameters](Boot-Parameters.md).