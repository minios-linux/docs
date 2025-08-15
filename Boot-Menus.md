# MiniOS Boot Menus Guide

MiniOS provides a powerful boot menu system that allows you to choose how the system starts and operates. This guide explains the available boot options and how to customize them.

## Overview

MiniOS uses GRUB as the primary bootloader, providing a graphical interface with multilingual support. On older BIOS systems, SYSLINUX may be used as an alternative. Both bootloaders offer the same functionality with slightly different interfaces.

## Boot Menu Options

### 1. Resume Previous Session
**What it does:** Attempts to continue from your last session, but adapts automatically based on available storage.

- **When to use:** This is the default option - suitable for most users in most situations
- **What happens:** 
  - **On writable media with existing session:** Restores your saved files, applications, and settings
  - **On writable media without session:** Automatically creates the first session (session #1)
  - **On read-only media (DVD, CD):** Runs like "Fresh Start" since no storage is available
  - **If session is incompatible:** Creates a new session (e.g., when using different MiniOS version)
  - System automatically handles compatibility checks and storage limitations
- **Result:** You always get a working system, optimized for your storage type

### 2. Start a New Session
**What it does:** Creates a fresh workspace while keeping all existing sessions available.

- **When to use:** When you want a clean slate for different work or testing
- **What happens:**
  - Creates a new numbered session (e.g., if you had session 1, creates session 2)
  - Starts with a clean desktop environment
  - All new changes will be saved to the new session
  - All existing sessions remain unchanged and available for switching
- **Note:** You can switch between sessions using "Choose session during startup" option

### 3. Choose Session During Startup
**What it does:** Shows an interactive menu to select from existing sessions or create a new one.

- **When to use:** When you have multiple sessions and want to choose which one to use
- **What happens:**
  - Shows a dialog box during startup with list of available sessions
  - Displays session information (number, last access time, disk usage)
  - Options to resume any existing session or start a new session
  - Allows selection of different storage devices if multiple are available
- **Benefits:** Full control over which session to use, perfect for users managing multiple workspaces

### 4. Fresh Start
**What it does:** Runs MiniOS without saving any changes.

- **When to use:** 
  - Testing the system on writable media without affecting existing sessions
  - Troubleshooting without modifying saved data
  - Maximum privacy (no data is saved)
  - When you want to ensure no persistent changes are made
- **What happens:**
  - Fastest boot time
  - Changes are lost when you shut down
  - No storage device access for persistence
- **Note:** When running from read-only media (DVD, CD), "Resume Previous Session" automatically behaves like "Fresh Start" since no storage is available for sessions

### 5. Copy to RAM
**What it does:** Loads the entire system into computer memory for maximum performance.

- **When to use:**
  - You have plenty of RAM (4GB+ recommended)
  - Want the fastest possible performance
  - Need to remove the USB drive after booting
  - Working with intensive applications
- **What happens:**
  - Copies all system files to RAM during boot
  - USB drive can be removed after loading completes
  - System runs entirely from memory
  - Fastest response times for all operations
- **Requirements:** Sufficient RAM to hold the entire system

For advanced `toram` options and memory optimization techniques, see **[Performance Optimization](Performance-Optimization.md)**.

## How to Use the Boot Menu

### Navigating the Menu
- Use **arrow keys** to move between options
- Press **Enter** to select an option
- Press **Esc** to return to previous menu (in GRUB)
- The menu will automatically select the default option after 10 seconds

### Language Selection (GRUB)
If your MiniOS USB drive supports multiple languages:
1. The first screen will show language options
2. Select your preferred language
3. The boot menu will appear in the selected language
4. All subsequent system messages will use this language

⚠️ **Important:** The multilingual menu overrides any locale settings specified in `config.conf`. The language selected in the boot menu takes precedence over pre-configured locale settings. See **[Configuration File](Configuration-File.md)** and **[live-config](live-config.md)** for details about system configuration files.

## Customizing Boot Options

### Editing Boot Parameters Temporarily
You can modify boot options for a single boot session:

**In GRUB:**
1. Select the menu option you want to modify
2. Press **'e'** to edit
3. Navigate to the line starting with `linux`
4. Add or modify parameters at the end of the line
5. Press **Ctrl+X** or **F10** to boot with your changes

**In SYSLINUX:**
1. Select the menu option you want
2. Press **Tab** before pressing Enter
3. Add parameters to the command line that appears
4. Press **Enter** to boot

### Common Boot Parameter Modifications
- `debug` - Show detailed boot messages (useful for troubleshooting)
- `toram=trim` - Copy only essential files to RAM (when full `toram` uses too much memory)
- `perchsize=2000` - Set session storage size to 2GB (adjust as needed)
- `locale=ru_RU.UTF-8` - Force specific language/locale

For a complete list of available boot parameters, see **[Boot Parameters](Boot-Parameters.md)**.

## Configuration File Locations

### On Your MiniOS USB Drive
- **GRUB configuration:** `/minios/boot/grub/grub.cfg`
- **SYSLINUX configuration:** `/minios/boot/syslinux.cfg` (if present)
- **Boot images:** `/minios/boot/bootlogo.png`
- **Language files:** `/minios/boot/grub/locale/`

### In Running System
- **Current boot parameters:** `/proc/cmdline`
- **MiniOS data directory:** `/run/initramfs/memory/data/minios/`

### Editing Configuration Files

⚠️ **Warning:** Only edit boot configuration files if you understand what you're doing. Incorrect changes can make your USB drive unbootable.

**To edit GRUB configuration:**
1. Mount your MiniOS USB drive
2. Navigate to `/minios/boot/grub/`
3. Edit `grub.cfg` with a text editor
4. Save and safely eject the USB drive

**Common changes:**
- Modify `set timeout=10` to change menu timeout
- Change `set default=0` to change default menu option
- Add custom menu entries

