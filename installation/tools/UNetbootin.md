---
updated: 2026-08-26
---

# Using UNetbootin


UNetbootin is a cross-platform open-source utility that allows you to create bootable USB drives for various Linux distributions, including MiniOS.


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](/installation/Hardware-Compatibility.md) for detailed system requirements and drive sizes.

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

## Result and persistence

UNetbootin extracts files and installs boot files on the selected filesystem, creating file-based live media rather than performing a raw image write or a MiniOS Installer deployment. Its use does not guarantee FAT32 formatting, EFI support, or persistence.

Persistence is enabled only when a boot entry or kernel command line requests it, and it still requires suitable writable storage. See [Boot modes](/configuration/Boot-Modes.md) and [Initrd persistence](/configuration/Initrd-Persistence.md) before relying on saved changes.
