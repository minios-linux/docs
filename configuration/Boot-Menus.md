---
updated: 2026-08-26
---

# MiniOS Boot Menus Guide


MiniOS boot menus provide convenient entries for common live boot modes. This
guide explains how to select and edit those entries.

## Overview

MiniOS images can use GRUB or Syslinux depending on firmware, image layout, and
build. Their menu graphs, editing keys, language handling, and available entries
are not necessarily identical. The bootloader ultimately passes a kernel command
line to the same initrd; see [Boot modes](/configuration/Boot-Modes.md) for the
resulting source, persistence, RAM-copy, and media-dependency behavior.

## Boot Menu Options

The supplied image commonly presents these semantic choices, although titles,
availability, order, and default selection can vary by image:

| Menu choice | Typical initrd selector | Purpose |
|---|---|---|
| Resume Previous Session | `perchdir=resume` | Try the default compatible session and permit replacement creation under the documented conditions. |
| Start a New Session | `perchdir=new` | Allocate a new numbered persistent session. |
| Choose Session During Startup | `perchdir=ask` | Select an existing session or request a new one interactively. |
| Fresh Start | no persistence selector | Use a temporary writable layer. |
| Copy to RAM | `toram` | Request the full RAM-copy path. |

These are selectors, not guarantees that storage is writable, a session is
compatible, RAM is sufficient, or source media has detached. See
[Boot modes](/configuration/Boot-Modes.md) for behavior and combinations,
[Initrd persistence](/configuration/Initrd-Persistence.md) for selector edge
cases, and [Performance optimization](/administration/Performance-Optimization.md)
for RAM and I/O tradeoffs.

## How to Use the Boot Menu

### Navigating the Menu
- Use **arrow keys** to move between options
- Press **Enter** to select an option
- Press **Esc** to return to previous menu (in GRUB)
- Automatic selection and timeout duration depend on the active menu configuration; some menus may wait indefinitely

### Language Selection (GRUB)
If your MiniOS USB drive supports multiple languages:
1. The first screen will show language options
2. Select your preferred language
3. The boot menu will appear in the selected language
4. The selection can also pass locale settings to later startup, but it does not guarantee that every boot or application message is translated

**Important:** The multilingual menu overrides any locale settings specified in `config.conf`. The language selected in the boot menu takes precedence over pre-configured locale settings. See **[Configuration File](/configuration/Configuration-File.md)** and **[live-config](/configuration/live-config.md)** for details about system configuration files.

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
- `toram=trim` - Copy the filtered module set and limited required data to RAM
- `perchsize=2000` - Set session storage size to 2GB (adjust as needed)
- `locales=ru_RU.UTF-8` - Request a specific language/locale

For a complete list of available boot parameters, see **[Boot Parameters](/configuration/Boot-Parameters.md)**.

## Configuration File Locations

### On Your MiniOS USB Drive
- **GRUB configuration:** `/minios/boot/grub/grub.cfg`
- **SYSLINUX configuration:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot images:** `/minios/boot/bootlogo.png`
- **Language files:** `/minios/boot/grub/locale/`

### In Running System
- **Current boot parameters:** `/proc/cmdline`
- **MiniOS data directory:** `/run/initramfs/memory/data/minios/`

### Editing Configuration Files

**Warning:** Only edit boot configuration files if you understand what you're doing. Incorrect changes can make your USB drive unbootable.

**To edit GRUB configuration:**
1. Mount your MiniOS USB drive
2. Navigate to `/minios/boot/grub/`
3. Edit `grub.cfg` with a text editor
4. Save and safely eject the USB drive

**Common changes:**
- Modify the timeout directive used by the active GRUB or Syslinux menu
- Change `set default=0` to change default menu option
- Add custom menu entries
