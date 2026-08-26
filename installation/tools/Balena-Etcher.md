# Using Balena Etcher

Balena Etcher is a convenient cross-platform program for writing ISO images to USB drives. Suitable for Windows, macOS, and Linux.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](/installation/Hardware-Compatibility.md) for detailed system requirements and drive sizes.

## Preparation

1. Download Balena Etcher from the [official website](https://www.balena.io/etcher/)
2. Install the program on your OS
3. Connect the USB drive


## Creating Bootable USB Drive

1. Launch Balena Etcher
2. Select the MiniOS ISO image:
   - Click "Flash from file"
   - Specify the path to the ISO file
3. Select the target USB drive:
   - Click "Select target"
   - Check the device model and size
4. Start writing:
   - Click "Flash!"
   - Wait for the process to complete (5–15 minutes)


## Result and persistence

Etcher performs a raw image write: it copies the ISO layout to the whole target device. It does not create an ext4 partition in unused space, create a persistence session, or perform a MiniOS Installer deployment.

Persistence is enabled only when a boot entry or kernel command line requests it, and it still requires suitable writable storage. See [Boot modes](/configuration/Boot-Modes.md) and [Initrd persistence](/configuration/Initrd-Persistence.md) before relying on saved changes.
