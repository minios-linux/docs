# Using Rufus (Windows)

Rufus is a popular utility for Windows that helps format and create bootable USB drives.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

## Installing Rufus

1. **Download Rufus** from the [official website](https://rufus.ie/)
2. **Run the program** - Rufus doesn't require installation, it's a portable application

## Creating Bootable USB Drive

Rufus offers two methods for writing MiniOS to a USB drive:

### Method 1: DD Mode (Recommended)

1. **Launch Rufus** as administrator
2. **Select the USB drive** in the "Device" field
3. **Select the MiniOS ISO file**:
   - Click the "SELECT" button
   - Find and select the downloaded MiniOS ISO file
4. **Choose write mode**:
   - In the "Hybrid ISO image detected" dialog, select **"Write in DD Image mode"**
5. **Start the process**: Click the "START" button
6. **Confirm the action** - all data on the drive will be deleted
7. **Wait for completion** of the writing process

### Method 2: ISO Mode (Alternative)

1. **Launch Rufus** as administrator
2. **Select the USB drive** in the "Device" field
3. **Select the MiniOS ISO file**:
   - Click the "SELECT" button
   - Find and select the downloaded MiniOS ISO file
4. **Choose write mode**:
   - In the "Hybrid ISO image detected" dialog, select **"Write in ISO Image mode"**
5. **Configure settings**:
   - **File system**: FAT32 (recommended) or NTFS
   - ⚠️ **When choosing NTFS**: EFI mode booting may be unavailable
6. **Start the process**: Click the "START" button
7. **Confirm formatting** - all data on the drive will be deleted

## Automatic Change Persistence

MiniOS will automatically detect the writing method and configure change persistence:

- **DD mode**: If free space is available, will create an ext4 partition for maximum performance
- **ISO mode**: Uses a dynamic file for saving changes

### Parameter Configuration (for Advanced Users)

When precise persistence configuration is needed, boot parameters can be used:

- `perchmode=native` - Direct saving to partition (for DD mode)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Data storage space size in MB

Details in [boot parameters](Boot-Parameters.md).