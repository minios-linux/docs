# Using Balena Etcher

Balena Etcher is a convenient cross-platform program for writing ISO images to USB drives. Suitable for Windows, macOS, and Linux.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

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


## Automatic Change Persistence

On first boot, MiniOS will check the drive's file system type and choose the optimal change persistence mode. If free space is available, the system will automatically create an ext4 partition for maximum performance.


### Parameter Configuration (for Advanced Users)

When precise persistence configuration is needed, boot parameters can be used:

- `perchmode=native` - Direct saving to partition (default, fastest)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Data storage space size in MB for image files

Details in [boot parameters](Boot-Parameters.md).