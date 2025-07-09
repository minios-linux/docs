# Getting Started with MiniOS 🌟

Welcome to MiniOS, where Linux flexibility and portability meet convenience and ease of use. If you're new to MiniOS, this comprehensive guide will help you get started and make the most of your operating system.

## Step 1: Choose the Right MiniOS Edition 📦

MiniOS offers three main editions, each tailored for specific use cases:

### 🚀 **Standard** - The Reliable Workhorse
Your go-to edition for daily computing tasks. Reliable, well-equipped with essential applications, and ready for productive work right out of the box.

### 🧰 **Toolbox** - The Power User's Toolkit
Comprehensive suite designed for system administrators, IT professionals, and power users. Includes advanced utilities for system diagnosis, disk partitioning, data recovery, and network troubleshooting.

### ⚡ **Ultra** - The All-in-One Powerhouse
The most comprehensive version of MiniOS, combining all features and tools from the Standard and Toolbox editions, plus additional software for development, multimedia, and advanced networking. Ideal for users who want a complete portable workstation with everything ready out of the box.

**Download Options:**
- **Official Website**: [minios.dev](https://minios.dev) - Complete edition overview and direct downloads
- **GitHub Releases**: [Latest releases](https://github.com/minios-linux/minios-live/releases) - All versions and release notes

For a detailed breakdown of packages included in each edition, see the [Package List](Packages.md).

## Step 2: Create a Bootable USB Drive 🔌

Choose from several reliable methods to create your bootable MiniOS USB drive:

### 🖥️ **Windows Methods**
- **[Rufus](Rufus.md)** - Simple utility for bootable USB creation ⭐ **Recommended**
- **[Balena Etcher](Balena-Etcher.md)** - Cross-platform, user-friendly ⭐ **Recommended**
- **[UNetbootin](UNetbootin.md)** - Cross-platform bootable USB creator
- **[Ventoy](Ventoy.md)** - Multi-boot USB solution ⭐ **Recommended**

### 🐧 **Linux Methods**
- **[dd command](dd.md)** - Command-line utility ⭐ **Recommended**
- **[Balena Etcher](Balena-Etcher.md)** - GUI application ⭐ **Recommended**
- **[Ventoy](Ventoy.md)** - Multi-boot support ⭐ **Recommended**
- **UNetbootin** - Available in most distributions
- **MintStick** - Simple USB writer (included in Toolbox edition)

### 🍎 **macOS Methods**
- **[dd command](dd.md)** - Built-in command-line tool ⭐ **Recommended**
- **[Balena Etcher](Balena-Etcher.md)** - User-friendly GUI ⭐ **Recommended**
- **[UNetbootin](UNetbootin.md)** - Cross-platform solution

### 🔧 **Advanced Method**
- **[Original Method](Original-Method.md)** - Manual installation using bootinst scripts
  
### 🏠 **Built-in MiniOS Methods**
- **MiniOS Installer** - Built-in graphical installer included in all editions
  - Launch from: Applications Menu → System → MiniOS Installer
  - Command line: `sudo minios-installer`
  - Features: GTK3 interface, multi-language support, UEFI/BIOS compatibility
  - Supports: Multiple filesystems (ext4, btrfs, fat32, etc.)

**Requirements**: USB drive with at least 4GB space (8GB+ recommended for persistence).

**Important Notes:**
- **MiniOS Installer is the preferred method** when already running MiniOS live
- Links above lead to detailed step-by-step guides for each external method
- Recommended methods are marked with ⭐ for reliability and ease of use
- Choose the method that best fits your operating system and experience level

## Step 3: Boot and Explore 🖥️

After booting from USB, explore the MiniOS desktop environment:

**Key features to discover**:
- Applications menu (bottom-left panel)
- System settings and preferences
- File manager (Thunar)
- Pre-installed applications (browser, office suite, utilities)
- Desktop customization options

The default desktop environment is XFCE, providing a balance of features and performance.

## Step 4: Package Management & Software Installation 🔄

MiniOS is built on Debian, giving you access to thousands of software packages through the APT package management system.

### 📦 **Basic APT Commands**

```bash
sudo apt update                   # Update package lists
sudo apt upgrade                  # Upgrade installed packages
sudo apt install package-name     # Install new software
sudo apt remove package-name      # Remove software
sudo apt search keyword           # Search for packages
sudo apt show package-name        # Show package information
sudo apt autoremove               # Remove unnecessary packages
```

### 🔄 **Module vs APT Installation**

**Module-based Installation (SquashFS bundles)**
- **How it works**: Pre-built compressed filesystem images (.sb files)
- **Persistent**: Modules survive reboots automatically once loaded
- **Efficient**: SquashFS compression saves significant disk space
- **System Integration**: In `merged` mode, modules are fully integrated (users, packages, caches)
- **Performance**: Fast loading, read-only for security
- **Use case**: Large software packages, desktop environments, complete application suites
- **Management**: Loaded at boot time or via module management tools

**APT Installation (Traditional Debian packages)**
- **How it works**: Downloads and installs .deb packages from repositories
- **Requires persistence**: Changes lost without persistence enabled
- **Real-time**: Immediate installation, updates, and dependency resolution
- **System Integration**: Direct installation to root filesystem
- **Flexibility**: Install any available Debian package
- **Use case**: Small utilities, development tools, personal software preferences
- **Management**: Standard `apt` commands (`install`, `remove`, `upgrade`)

### ⚙️ **System Configuration**

**Live Module Mode Settings:**

MiniOS operates in different module integration modes that affect how the system handles multiple SquashFS modules:

- **`merged` mode** (default): Integrates all modules into a unified system
  - **User/Group Integration**: Merges user accounts, groups, and permissions from all modules
  - **Package Database Sync**: Creates unified APT/dpkg database from all modules
  - **System Cache Updates**: Updates desktop databases, MIME types, icons, and font caches
  - **Kernel Module Loading**: Automatically loads kernel modules from all bundles
  - **Best for**: Multiple modules with potential overlapping packages and users

- **`simple` mode**: Modules work independently with minimal integration
  - **Basic Module Mounting**: Each module is mounted without deep system integration
  - **No User Merging**: User accounts from different modules remain separate
  - **Independent Package Databases**: Each module maintains its own package information
  - **Best for**: Single module systems or when modules don't conflict

Configure in `config.conf`:
```bash
LIVE_MODULE_MODE="merged"    # Full integration (default)
# or
LIVE_MODULE_MODE="simple"    # Minimal integration
```

**Boot Parameter Configuration:**
You can also set this temporarily via boot parameters:
```bash
module-mode=merged     # or module-mode=simple
```

### ⚠️ **Important Notes**
- **Live mode**: APT installations are temporary without persistence enabled
- **Module integration**: `merged` mode (default) provides full system integration of modules
- **User account merging**: In `merged` mode, user accounts from all modules are combined
- **Package database**: `merged` mode creates unified APT database from all loaded modules
- **System updates**: Regular updates keep your system secure and current
- **Module conflicts**: System automatically handles overlapping packages by version priority
- **Performance impact**: `merged` mode runs background processes for system integration

## Step 5: Understanding Data Persistence 💾

MiniOS automatically sets up persistent storage when you create a bootable USB drive using any of the supported installation methods. This allows you to save your files, settings, and installed software across reboots. Your data travels with you on the USB drive.

### 🔧 **Automatic Persistence Setup**

**🧠 Intelligent Persistence Selection:**
The system automatically chooses the best persistence method based on your USB drive's filesystem:
- **Native partition mode**: For Linux filesystems (ext4, etc.) - Direct file storage, fastest performance
- **DynFileFS mode**: For Windows filesystems (FAT32, NTFS) - Dynamic image files, maximum compatibility

### 🔧 **Manual Configuration (Advanced Users)**

If you need to customize persistence behavior, you can use boot parameters:

**2. Boot Parameter Configuration**
- Configure persistence using kernel boot parameters only
- Press **<key>Tab</key>** (SYSLINUX) or **<key>E</key>** (GRUB) during boot to add parameters
- Examples:
  - `perchdir=1` - Use persistence profile #1
  - `perchdir=ask` - Choose persistence location at boot
  - `perchdir=/dev/sda1/changes` - Specify exact location

**3. Advanced Configuration**
- Custom persistence modes and sizes via boot parameters
- `perchmode=native|dynfilefs|raw` - Override automatic mode selection
- `perchsize=8000` - Set custom persistence size in MB (default: auto-detected)
- `perchdir=askdisk` - Select disk and create persistence manually

### 📋 **Persistence Modes**

| Mode | Description | Best For |
|------|-------------|----------|
| **native** | Direct file storage (default) | Linux-formatted drives (ext4, etc.) |
| **dynfilefs** | Dynamic image files | Default for FAT32/NTFS drives |
| **raw** | Fixed-size image file | Consistent storage allocation |

### 💡 **Best Practices**
- **Automatic Setup**: Persistence works out-of-the-box with all supported installation methods
- **Test First**: Verify persistence works as expected after first setup
- **Backup Regularly**: Use external storage for important files  
- **Monitor Space**: Check available space on persistence storage
- **Use Cloud Storage**: For critical documents and additional backup
- **Default Size**: System auto-detects optimal size, customize with `perchsize` boot parameter if needed

### ⚙️ **Advanced Configuration (Optional)**

**Boot Parameters (For advanced customization only)**
Persistence is automatically configured, but you can customize behavior through kernel boot parameters:

```bash
# Basic persistence options
perchdir=1                        # Use profile #1 
perchdir=ask                      # Choose at boot time
perchdir=resume                   # Resume last session
perchdir=new                      # Start new session

# Specify exact locations
perchdir=/dev/sda1/changes        # Direct path
perchdir=/dev/disk/by-label/USB/changes
perchdir=askdisk                  # Manual disk selection

# Advanced configuration  
perchsize=8000                    # Custom size in MB (overrides auto-detection)
perchmode=native                  # Force storage mode
perchmode=dynfilefs               # Force DynFileFS for compatibility
perchmode=raw                     # Force fixed size file
```

**Persistent Configuration File**
After persistence is enabled, settings are automatically saved in:
- **config.conf**: Located in `minios/` folder on USB drive
- **Automatic updates**: System updates this file when changes are made

## Step 6: Default User Accounts & Security 🔐

MiniOS creates user accounts automatically during the first boot via live-config:

### 👤 **Default Credentials**

**Standard User Account:**
- **Username**: `live`
- **Password**: `evil`
- **Purpose**: Daily computing tasks with standard user privileges

**Administrator Account:**
- **Username**: `root` 
- **Password**: `toor`
- **Purpose**: System administration and privileged operations

### 🔒 **Security Configuration**

**Immediate Security Steps:**
1. **Change default passwords** using the `passwd` command (after first boot)
2. **Modify config.conf** to customize username and passwords before first boot
3. **Change default username** in config.conf (recommended instead of creating new accounts)
4. **Use strong, unique passwords** for all accounts

**Configuration Methods:**

**Option 1: Command Line**
```bash
passwd live         # Change user password
sudo passwd root    # Change root password
```

**Option 2: Configuration File (Recommended)**
Edit `minios/config.conf` on your USB drive to change username and passwords (applied only on first boot):
```bash
# Generate encrypted passwords
mkpasswd -m yescrypt your_new_password

# Update these lines in config.conf:
LIVE_USERNAME="yourusername"         # Change default username
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$your_encrypted_password...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$your_encrypted_password...'
```

**Option 3: Boot Parameters (First boot only)**
Add parameters during boot (press <kbd>Tab</kbd> in SYSLINUX or <kbd>E</kbd> in GRUB):
```bash
username=yourusername                # Set username (live-config parameter)
user-password=yourpassword           # Set user password in plain text
root-password=yourrootpassword       # Set root password in plain text
# Or use crypted passwords:
user-password-crypted='$y$j9T$...'   # Set encrypted user password
root-password-crypted='$y$j9T$...'   # Set encrypted root password
```

### ⚠️ **Important Security Notes**
- **SSH is enabled by default** - Change passwords immediately if using network connections
- **Default credentials are publicly known** - Never use them in production environments
- **Command-line password changes** - Work immediately but are lost without persistence
- **Username/password changes via config.conf or boot parameters work only on first boot**
- **Recommended approach**: Change default username via `LIVE_USERNAME` instead of creating new accounts
- **Boot parameters**: Use correct live-config parameters (`username`, `user-password`, `root-password`)
- **Consider disabling root login** - Use `sudo` for administrative tasks instead

## Step 7: Customize and Explore 🛠️

Make MiniOS your own by exploring customization options:

**Customization areas**:
- Desktop themes and wallpapers
- Panel layout and widgets
- Application preferences
- Keyboard shortcuts
- System settings and preferences

**Tips for new users**:
- Experiment freely - changes can be reset by rebooting without persistence
- Join the MiniOS community for tips and support
- Explore the documentation for advanced features
- Try different software to find your preferred applications

## Advanced Tips & Boot Parameters 🚀

### 🔧 **Useful Boot Parameters**

MiniOS supports various boot parameters for advanced configuration. Press **<key>Tab</key>** (SYSLINUX) or **<key>E</key>** (GRUB) during boot to add these:

**Common Parameters:**
```bash
toram                             # Load system to RAM (faster performance)
toram=trim                        # Load only essential modules to RAM
text                              # Boot to text console (no GUI)
perchdir=ask                      # Choose persistence location at boot
perchsize=8000                    # Set persistence size (MB)
from=/path/to/minios              # Load from custom location
load=00-core,01-firmware          # Load only specific modules
noload=05-apps                    # Skip specific modules
```

**Network & Services:**
```bash
enable_services=ssh,docker        # Enable services at boot
disable_services=apache2          # Disable services at boot
ssh_key=my_keys                   # Use custom SSH keys
```

**User Authentication:**
```bash
username=myuser                   # Change default username (first boot only)
user-password=mypassword          # Set user password in plain text (first boot only)
root-password=rootpassword        # Set root password in plain text (first boot only)
user-password-crypted='$y$...'    # Set encrypted user password (first boot only)
root-password-crypted='$y$...'    # Set encrypted root password (first boot only)
```

**System Configuration:**
```bash
default_target=multi-user         # Boot to console (no GUI)
hostname=my-minios               # Set custom hostname
debug                            # Enable debug output
module-mode=merged               # Set module integration mode
```

### 🛠️ **System Customization**

**Desktop Environment Tweaks:**
- **Themes**: Explore Settings → Appearance for desktop themes
- **Panels**: Right-click panels to customize layout and widgets
- **Shortcuts**: Settings → Keyboard for custom key bindings
- **Startup Applications**: Configure auto-start programs

**Advanced File Management:**
- **Thunar**: Default file manager with plugin support
- **Network Shares**: Access SMB/CIFS shares through network locations
- **Archives**: Built-in support for various archive formats
- **Search**: Use Catfish for advanced file searching

### 🎯 **Performance Optimization**

**RAM Usage Optimization:**
- Use `toram=trim` to load only essential modules
- Disable unnecessary services via boot parameters
- Monitor memory usage with `htop` or `free -h`

**Storage Management:**
- Regular cleanup with `sudo apt autoremove`
- Clear package cache: `sudo apt clean`
- Monitor disk usage: `df -h` and `du -sh *`

### 🔍 **Troubleshooting Tips**

**Boot Issues:**
- Try `toram` parameter if USB is slow
- Use `debug` parameter to see detailed boot process
- Check `from=` parameter if MiniOS files aren't found

**Network Problems:**
- Verify network manager service: `systemctl status NetworkManager`
- Check available networks: `nmcli device wifi list`
- Reset network: `sudo systemctl restart NetworkManager`

**Persistence Issues:**
- Verify persistence location and permissions
- Check available space: `df -h /mnt/live/memory/changes`
- Test with `perchdir=ask` to manually select location

## Getting Help & Community Resources 💬

### 📚 **Official Documentation**
- **MiniOS Wiki**: [Complete guides and tutorials](https://github.com/minios-linux/minios-live/wiki)
- **Building Guide**: [Custom MiniOS creation](Building-MiniOS)
- **Configuration Reference**: [Boot parameters and config files](Configuration-File)
- **Package Lists**: [Software included in each edition](Packages)

### 🐛 **Bug Reports & Issues**
- **GitHub Issues**: [Report bugs and request features](https://github.com/minios-linux/minios-live/issues)
- **Include**: System info, error messages, steps to reproduce
- **Logs**: Check `/var/log/` or enable `EXPORT_LOGS="true"` in config

### 🌐 **Community & Support**
- **Official Website**: [minios.dev](https://minios.dev) - Latest news and downloads
- **GitHub Repository**: [Source code and development](https://github.com/minios-linux/minios-live)
- **Debian Community**: MiniOS benefits from Debian's extensive community support

### 📖 **Learning Resources**
- **Linux Basics**: Since MiniOS is Debian-based, general Linux tutorials apply
- **Debian Documentation**: [Official Debian guides](https://www.debian.org/doc/)
- **Live System Concepts**: Understanding how live Linux distributions work
- **System Administration**: Learning Linux command line and system management

### 🔧 **Advanced Topics**
Once you're comfortable with the basics, explore:
- **Custom Module Creation**: Build your own software modules
- **System Building**: Create custom MiniOS editions
- **Boot Configuration**: Advanced boot parameter usage
- **Network Services**: Setting up servers and services
- **Automation**: Scripting and system automation

## Conclusion ✨

MiniOS combines the power and flexibility of Linux with the convenience of portability. This guide provides the foundation for making the most of your MiniOS experience.

**Key Takeaways:**
- **Choose the right edition** for your needs (Standard/Ultra/Toolbox)
- **Set up persistence** to keep your data and settings
- **Secure your system** by changing default passwords
- **Explore customization** to make MiniOS truly yours
- **Join the community** for ongoing support and learning

Whether you're using MiniOS for system recovery, portable computing, digital forensics, or as your daily driver, you now have the knowledge to unlock its full potential. Welcome to the MiniOS community! 🎉
