# Using MiniOS Installer

MiniOS Installer is a graphical tool for installing MiniOS to hard drives or USB drives with UEFI/BIOS support and multiple filesystem compatibility.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected device and backup important data.

## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

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

1. **Configure system settings (Optional but Recommended):**
   - Click **"Configure MiniOS before installation"** button
   - Set up your preferences:
     - System language and locale
     - Timezone and keyboard layout  
     - User accounts and passwords
     - Hostname and system services
   - Save and close configurator
   
2. **Select target device:**
   - Choose a hard drive or USB drive from the list
   - Verify device size and model
   
3. **Select filesystem:**
   - **ext4**: recommended for most cases
   - **Btrfs**: for advanced users
   - **FAT32**: for maximum compatibility
   
4. **Confirm disk wipe:**
   - All data on the selected device will be deleted
   - Ensure correct device selection
   
5. **Start installation:**
   - Click "Install" button
   - Wait for process completion
   
6. **Completion:**
   - Restart the system
   - Remove LiveUSB/LiveCD
   - **Result:** System boots with your pre-configured settings

## Pre-Installation Configuration

### Benefits of Using MiniOS Configurator Before Installation

**Recommended workflow for new users:**

1. **One-time setup**: Configure all system preferences once before installation
2. **Ready to use**: Installed system boots with correct language, keyboard, and user settings
3. **No post-installation work**: Skip manual configuration after first boot
4. **Consistent experience**: Same settings across all installations

**Configuration options available:**
- **🌍 Localization**: System language, locale, and timezone
- **⌨️ Input**: Keyboard layouts and switching options  
- **👤 Accounts**: Username, full name, passwords, and user groups
- **🖥️ System**: Hostname, enabled/disabled services
- **🔒 Security**: Secure password setup before going online

**Simple workflow:**
- Configure your preferences once before installation
- Install MiniOS with your custom settings
- Boot into a fully configured system

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