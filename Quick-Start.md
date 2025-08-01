# Getting Started with MiniOS 🌟

Welcome to MiniOS, where Linux flexibility and portability meet convenience and ease of use. If you're new to MiniOS, this comprehensive guide will help you get started and make the most of your operating system.

## Step 1: Choose the Right MiniOS Edition 📦

MiniOS offers three main editions, each tailored for specific use cases:

- **🚀 Standard** - The reliable workhorse for daily computing tasks
- **🧰 Toolbox** - Power user's toolkit with advanced system utilities  
- **⚡ Ultra** - All-in-one powerhouse with complete feature set

For detailed descriptions of each edition's features and included software, see [About MiniOS](About-MiniOS.md).

**Download Options:**
- **Official Website**: [minios.dev](https://minios.dev) - Complete edition overview and direct downloads
- **GitHub Releases**: [Latest releases](https://github.com/minios-linux/minios-live/releases) - All versions and release notes

For a detailed breakdown of packages included in each edition, see the [Package List](Packages.md).

## Step 2: Create a Bootable USB Drive 🔌

**Recommended Installation Methods:**

### 🖥️ **Windows**
- **[Rufus](Rufus.md)** ⭐ - Simple and reliable
- **[Balena Etcher](Balena-Etcher.md)** ⭐ - Cross-platform GUI
- **[Ventoy](Ventoy.md)** ⭐ - Multi-boot support

### 🐧 **Linux** 
- **[dd command](dd.md)** ⭐ - Fast command-line tool
- **[Balena Etcher](Balena-Etcher.md)** ⭐ - User-friendly GUI

### 🍎 **macOS**
- **[Balena Etcher](Balena-Etcher.md)** ⭐ - Easy-to-use GUI
- **[dd command](dd.md)** ⭐ - Built-in terminal tool

### 🏠 **From MiniOS**
- **[MiniOS Installer](MiniOS-Installer.md)** - Built-in graphical tool

**Additional methods:** [UNetbootin](UNetbootin.md), [Drive Utility](Drive-Utility.md), [Original Method](Original-Method.md)

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

## Step 4: Software Installation 🔄

MiniOS provides multiple ways to install software:

### 📦 **APT Package Manager** 
Basic Debian package management - use `man apt` for detailed command reference.

### 🔄 **Module System**
Advanced SquashFS modules for persistent software - see [Creating Modules](Creating-Modules.md) guide.

**Key difference:** APT installations require persistence to survive reboots, while modules are automatically persistent.

## Step 5: Data Persistence 💾

**Good news:** MiniOS automatically sets up data persistence during installation! Your files, settings, and software installations are automatically saved.

### How It Works
- **Automatic Setup**: All installation methods create persistence automatically
- **Smart Detection**: System chooses optimal persistence mode for your drive filesystem
- **Portable**: Your data travels with you on the USB drive

### Advanced Configuration
For custom persistence setup, see detailed [Configuration File](Configuration-File.md) guide and [Boot Parameters](Boot-Parameters.md) reference.

## Step 6: Security Setup 🔐

### 👤 **Default Accounts**
- **User**: `live` / `evil`  
- **Root**: `root` / `toor`

### 🔒 **Important Security Steps**
1. **Change passwords immediately** - Default credentials are publicly known
2. **Use strong, unique passwords** for all accounts

### Configuration Methods
- **Quick change**: `passwd live` and `sudo passwd root`
- **Advanced setup**: See [Security Hardening](Security-Hardening.md) guide
- **Pre-boot configuration**: Edit `config.conf` or use boot parameters

⚠️ **Never use default credentials on networked systems!**

## Step 7: Customization & Advanced Topics 🛠️

### 🎨 **Basic Customization**
- Desktop themes and wallpapers via Settings
- Panel layout and application preferences  
- Keyboard shortcuts and system settings

### 🚀 **Advanced Configuration**
- **Boot Parameters**: [Complete reference](Boot-Parameters.md) for system tuning
- **Performance**: [Optimization guide](Performance-Optimization.md) for better speed
- **Hardware**: [Compatibility guide](Hardware-Compatibility.md) for device support

### 🔧 **Power User Features**  
- **Custom Builds**: [Building MiniOS](Building-MiniOS.md) from source
- **Module Creation**: [Advanced modules](Creating-Modules.md) development
- **Kernel Updates**: [Kernel replacement](Kernel-Replacement.md) guide

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
