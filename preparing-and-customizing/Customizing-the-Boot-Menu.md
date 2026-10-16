---
updated: 2026-10-15
---
# Customizing the boot menu


MiniOS boot menus provide convenient entries for common live boot modes. This guide explains how to select and edit those entries.

## Overview

MiniOS images can use GRUB or Syslinux depending on firmware, image layout, and build. Their menu graphs, editing keys, language handling, and available entries are not necessarily identical. The bootloader ultimately passes a kernel command line to the same initrd; see [Boot modes](/using-minios/Boot-Modes) for the resulting source, persistence, RAM-copy, and media-dependency behavior.

## Boot Menu Options

The supplied image commonly presents these semantic choices, although titles, availability, order, and default selection can vary by image:

| Menu choice | Typical initrd selector | Purpose |
|---|---|---|
| Start MiniOS | `perchdir=resume` | Try the default compatible session and permit replacement creation under the documented conditions. |
| Start a new session | `perchdir=setup` | Open the persistence-backend chooser, then create an additional numbered session while keeping existing sessions unchanged. |
| Choose a saved session | `perchdir=ask` | Select an existing saved session interactively; on empty storage MiniOS enters the same setup flow so the first session can be created. |
| Start without saving | no persistence selector | Use a temporary writable layer in RAM. |
| Run from RAM | `toram` | Copy MiniOS system data to RAM; with persistence, the default `perchtoram=trim` separately copies the selected supported session. |

These are selectors, not guarantees that storage is writable, a session is compatible, RAM is sufficient, or source media has detached. See [Boot modes](/using-minios/Boot-Modes) for behavior and combinations, [Initrd persistence](/reference/boot-process/Persistence-Internals) for selector edge cases, and [Performance optimization](/maintenance-and-recovery/Performance) for RAM and I/O tradeoffs.

## How to Use the Boot Menu

### Navigating the Menu
- Use **arrow keys** to move between options
- Press **Enter** to select an option
- Press **Esc** to return to previous menu (in GRUB)
- Automatic selection and timeout duration depend on the active menu configuration; some menus may wait indefinitely

### Help and language selection

Current multilingual GRUB and native SYSLINUX menus start with boot modes, not a language-selection screen. **F1** opens boot help and **F2** opens language selection. Choosing a language returns to the translated mode menu. Single-language media keeps help but does not offer unavailable language navigation.

The initial multilingual menu leaves the configured system locale in effect. Only an explicit language selection adds locale settings that override `config.conf` for that boot. It does not guarantee that every startup or application message is translated. See [Configuration file](/reference/configuration/config.conf) and [live-config](/reference/configuration/live-config).

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
- `perchsize=2000` - Request 2000 MiB for a new or growing supported container; this does not size native or SquashFS sessions
- `locales=ru_RU.UTF-8` - Request a specific language/locale

For a complete list of available boot parameters, see **[Boot Parameters](/reference/Boot-Parameters)**.

## Configuration File Locations

### On Your MiniOS USB Drive
- **GRUB configuration:** `/minios/boot/grub/grub.cfg`
- **GRUB mode and language menus:** `/minios/boot/grub/main.cfg` and `/minios/boot/grub/languages.cfg`; localized builds can select other generated files
- **SYSLINUX configuration:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot artwork:** inspect the active SYSLINUX `MENU BACKGROUND` or GRUB theme setting; the paths depend on the selected bootloader
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
