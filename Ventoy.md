# Using Ventoy

Ventoy is a popular tool for creating bootable USB drives that allows you to store multiple ISO files on one device and boot from any of them.


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

## Installing Ventoy

### Method 1: Standard Installation

1. **Download Ventoy** from the [official website](https://www.ventoy.net/)
2. **Run the Ventoy installer** and select your USB drive
3. **Install Ventoy** on the drive (all data will be deleted)
4. **Copy the MiniOS ISO file** to the root folder of the USB drive

After installation, the drive will be ready to use. MiniOS will automatically create storage for saving changes.

### Method 2: Installation with Separate Data Partition (Recommended)

1. **Download Ventoy** from the [official website](https://www.ventoy.net/)
2. **Run the Ventoy installer** and select your USB drive  
3. **Enable the "Reserve Space" option** during installation to create an additional partition
4. **Install Ventoy** on the drive
5. **Copy the MiniOS ISO file** to the root folder of the USB drive
6. **Create an ext4 partition** in the reserved space with the label `persistence`

This method provides faster data operation and greater control over storage.


## Integration with MiniOS

MiniOS includes built-in Ventoy support and automatically detects when running in a Ventoy environment. The system automatically configures change persistence without additional user configuration.

### Automatic Change Persistence

MiniOS automatically detects running in a Ventoy environment and configures change persistence:

- **With separate `persistence` partition**: Uses it for direct data storage (native mode, maximum speed)
- **With standard installation**: Creates a dynamic file in the main Ventoy partition (dynfilefs mode)

### Parameter Configuration (for Advanced Users)

When precise configuration is needed, boot parameters can be used:

**For separate `persistence` partition (all modes available):**
- `perchmode=native` - Direct saving to partition (fastest)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file

**For standard Ventoy installation (two modes available):**
- `perchmode=dynfilefs` - Dynamically expandable file (default, saves space)
- `perchmode=raw` - Fixed-size file

**Common parameters for files:**
- `perchsize=8000` - Data storage space size in MB

More details in [boot parameters](Boot-Parameters.md).


## Using MiniOS with Ventoy

### Booting

After installing Ventoy and copying the MiniOS ISO file to the drive:

1. **Boot from the USB drive** - select it in BIOS/UEFI
2. **Select MiniOS** from the list of available ISO files in the Ventoy menu
3. **Wait for loading** - the system will automatically configure for operation