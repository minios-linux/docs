# Getting Started with MiniOS 🌟

Welcome to MiniOS, where Linux flexibility and portability meet convenience and ease of use. If you're new to MiniOS, this comprehensive guide will help you get started and make the most of your operating system.

## Step 1: Choose the Right MiniOS Edition 📦

MiniOS offers three main editions, each tailored for specific use cases:

- **🚀 Standard** - The reliable workhorse for daily computing tasks
- **🧰 Toolbox** - Power user's toolkit with advanced system utilities
- **⚡ Ultra** - All-in-one powerhouse with complete feature set

For detailed descriptions of each edition's features and included software, see [About MiniOS](/about/About-MiniOS.md).

**Download Options:**
- **Official Website**: [minios.dev](https://minios.dev) - Complete edition overview and direct downloads
- **GitHub Releases**: [Latest releases](https://github.com/minios-linux/minios-live/releases) - All versions and release notes

For a detailed breakdown of packages included in each edition, see the [Package List](/administration/Packages.md).

## Step 2: Create a Bootable USB Drive 🔌

**Recommended Installation Methods:**

### 🖥️ **Windows**
- **[Rufus](/installation/tools/Rufus.md)** ⭐ - Simple and reliable
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Cross-platform GUI
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ - Multi-boot support

### 🐧 **Linux**
- **[dd command](/installation/tools/dd.md)** ⭐ - Fast command-line tool
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - User-friendly GUI

### 🍎 **macOS**
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - Easy-to-use GUI
- **[dd command](/installation/tools/dd.md)** ⭐ - Built-in terminal tool

### 🏠 **From MiniOS**
- **[MiniOS Installer](/installation/MiniOS-Installer.md)** - Built-in graphical tool

**Additional methods:** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Original Method](/installation/tools/Original-Method.md)

### Drive Size Requirements
- **Standard (787 MB)**: minimum 2 GB
- **Toolbox (1.2 GB)**: minimum 4 GB
- **Ultra (1.7 GB)**: minimum 4 GB
- **Recommended size**: 8 GB or larger for comfortable operation with change persistence

**Important Notes:**
- Each link above provides detailed step-by-step instructions
- Recommended methods (⭐) are tested for reliability and ease of use
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

## Step 4: System Configuration 🌐

**Configure your system language, keyboard, timezone, and other preferences:**

### 🔧 **Using MiniOS Configurator** (Recommended)

**Access:** Applications Menu → System → Configure MiniOS

**Key settings you can configure:**
- **🌍 Language & Locale**: Set system language (e.g., `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Timezone**: Configure your time zone (e.g., `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Keyboard**: Set layouts and switching options (e.g., `us,ru` with `Alt+Shift` toggle)
- **👤 User Settings**: Change username, full name, and user groups
- **🔐 Passwords**: Set secure passwords for user and root accounts
- **🖥️ System**: Configure hostname, enable/disable services
- **🔧 Advanced**: Boot options and system behavior

**How to use:**
1. Open MiniOS Configurator from the system menu
2. Navigate through tabs to configure different aspects
3. Make your changes and save
4. **Reboot to apply changes** - settings take effect after restart and persist across reboots

**Technical note:** MiniOS Configurator modifies `/etc/live/config.conf`, which is MiniOS's main configuration file that controls system behavior at boot time. For detailed information on configuration parameters and their behavior, see the [Configuration File](/configuration/Configuration-File.md) guide.

### 💻 **Alternative: Command Line Configuration**

**Immediate changes (applied right away):**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**For persistent changes across reboots:** Use MiniOS Configurator or edit `/etc/live/config.conf` directly.

### 📋 **Additional Configuration Options**

- **Direct file editing**: Edit `/etc/live/config.conf` manually for advanced users
- **Boot-time setup**: Use [Boot Parameters](/configuration/Boot-Parameters.md) to configure system before it starts
- **Configuration file guide**: See [Configuration File](/configuration/Configuration-File.md) for detailed config.conf reference
- **Pre-installation**: Configure before installing with [MiniOS Installer](/installation/MiniOS-Installer.md)

**Important:** Changes to `/etc/live/config.conf` (via MiniOS Configurator or manual editing) require a reboot to take effect. Command-line tools like `localectl` and `timedatectl` apply changes immediately but may not persist across reboots without proper configuration.

## Step 5: Software Installation 🔄

MiniOS provides multiple ways to install software:

### 📦 **APT Package Manager**
Basic Debian package management - use `man apt` for detailed command reference.

### 🔄 **Module System**
Advanced SquashFS modules for persistent software - see [Creating Modules](/development/Creating-Modules.md) guide.

**Key difference:** APT installations require persistence to survive reboots, while modules are automatically persistent.

## Step 6: Data Persistence 💾

**Good news:** MiniOS automatically sets up data persistence during installation! Your files, settings, and software installations are automatically saved.

### How It Works
- **Automatic Setup**: All installation methods create persistence automatically
- **Smart Detection**: System chooses optimal persistence mode for your drive filesystem
- **Portable**: Your data travels with you on the USB drive

### Advanced Configuration
For custom persistence setup, see detailed [Configuration File](/configuration/Configuration-File.md) guide and [Boot Parameters](/configuration/Boot-Parameters.md) reference.

## Step 7: Security Setup 🔐

### 👤 **Default Accounts**
- **User**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Important Security Steps**
1. **Change passwords immediately** - Default credentials are publicly known
2. **Use strong, unique passwords** for all accounts

### Password Configuration Methods
- **🔧 Recommended**: Use **MiniOS Configurator** (Applications Menu → System → Configure MiniOS → User tab)
- **💻 Command Line**: `passwd live` and `sudo passwd root`
- **📋 Advanced**: See [Security Hardening](/administration/Security-Hardening.md) guide for detailed security setup

⚠️ **Never use default credentials on networked systems!**

## Step 8: Customization & Advanced Topics 🛠️

### 🎨 **Basic Customization**
- Desktop themes and wallpapers via Settings
- Panel layout and application preferences
- Keyboard shortcuts and system settings

### 🚀 **Advanced Configuration**
- **Boot Parameters**: [Complete reference](/configuration/Boot-Parameters.md) for system tuning
- **Performance**: [Optimization guide](/administration/Performance-Optimization.md) for better speed
- **Hardware**: [Compatibility guide](/installation/Hardware-Compatibility.md) for device support

### 🔧 **Power User Features**
- **Custom Builds**: [Building MiniOS](/development/Building-MiniOS.md) from source
- **Module Creation**: [Advanced modules](/development/Creating-Modules.md) development
- **ISO Rebuilding**: [Repack live system](/development/Rebuilding-ISO.md) into bootable ISO
- **Kernel Updates**: [Kernel management](/administration/Kernel-Management.md) guide

## Getting Help & Community Resources 💬

### 📚 **Documentation**
- **Official Website**: [minios.dev](https://minios.dev) - Latest news and downloads
- **All Guides**: Available in this documentation collection

### 🐛 **Support & Issues**
- **Bug Reports**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Source Code**: [GitHub Repository](https://github.com/minios-linux/minios-live)

### 📖 **Learning More**
- **Debian Documentation**: [www.debian.org/doc](https://www.debian.org/doc/) - Since MiniOS is Debian-based
- **Linux Basics**: General Linux tutorials apply to MiniOS

## Welcome to MiniOS! 🎉

You now have everything needed to get started with MiniOS. The system combines Linux power with portable convenience - perfect for system recovery, portable computing, or daily use.

**Next steps:** Choose your edition, create your USB drive, and start exploring! 🚀
