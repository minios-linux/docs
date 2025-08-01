# Using UNetbootin

UNetbootin is a cross-platform open-source utility that allows you to create bootable USB drives for various Linux distributions, including MiniOS.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

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