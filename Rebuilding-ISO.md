# Rebuilding ISO

This guide explains how to rebuild and customize MiniOS ISO images using the built-in tools. Whether you want to create lightweight versions, add custom software, or distribute customized systems, these tools make it easy to repack your live system into a new bootable ISO.

## Overview

MiniOS provides powerful tools for rebuilding ISO images directly from a running live system. This allows you to:

- **Remove unwanted software** to create lighter distributions
- **Add custom modules** with additional software
- **Create specialized versions** for specific use cases
- **Distribute customized systems** to other users
- **Create installation media** with your current configuration

## Quick Start

The simplest way to create an ISO from your current system:

```bash
sudo sb2iso
```

This creates `minios-YYYYMMDD_HHMM.iso` in your current directory with all currently loaded modules.

## Main Tool: sb2iso

**sb2iso** is the primary tool for rebuilding ISO images. It reads your current live system and packages it into a bootable ISO file.

### Basic Usage

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Exclude files/modules matching pattern | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Specify output filename | `--name minios_custom.iso` |
| `--menu TYPE` | Set menu language or type | `--menu ru_RU` or `--menu multilang` |
| `--help` | Show help information | `--help` |
| `--version` | Show version | `--version` |

### Supported Menu Types

- **multilang** (default) - Multi-language menu with language selection
- **Language codes** - Single language menus: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Practical Examples

### Creating Lightweight Versions

**Remove heavy applications:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Create text-mode only system:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Remove multimedia applications:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Adding Custom Software

**Add development tools:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Add gaming applications:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### Language-Specific ISOs

**Create Russian localized ISO:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Create German ISO:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Professional/Educational Distributions

**Educational ISO with learning tools:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**Business ISO:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Advanced Customization Workflow

### 1. Prepare Your System

Start with a clean MiniOS system and customize it:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Create Custom Modules

Save your changes as modules:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Test Your Modules

Before creating the final ISO, test your modules:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Create Final ISO

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Working with Modules

### Understanding Module Numbers

Modules load in numerical order:
- **00-core** - Base system (always included)
- **01-kernel** - Kernel and drivers
- **02-firmware** - Hardware firmware
- **03-gui-base** - Basic GUI components
- **04-desktop** - Desktop environment
- **05-apps** - Applications
- **06+** - Additional modules

### Module Management Commands

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Excluding Content Patterns

The `--exclude` option uses regular expressions to match file paths. Common patterns:

### Application Exclusions
```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### System Component Exclusions
```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Combined Exclusions
```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## System Requirements

### Running sb2iso

- **System**: Must be running from MiniOS live system
- **Privileges**: Root access required (`sudo`)
- **Memory**: Sufficient RAM for temporary files
- **Storage**: Free space for output ISO (typically 1-4 GB)

### Boot Files Requirement

**sb2iso** requires boot files to be available. If you loaded the system to RAM, use:

```bash
# Boot with full RAM copy
toram=full
```

Or ensure boot files are accessible on the original media.

## Troubleshooting

### Common Issues

**"Cannot find MiniOS source directory"**
- Ensure you're running on a live MiniOS system
- Check that boot files are available
- Try using `toram=full` boot parameter

**"Required file not found"**
- Boot files may be missing
- Ensure you're using a complete MiniOS system

**ISO creation fails**
- Check available disk space
- Verify you have write permissions
- Ensure no files are in use during creation

**Module not included**
- Check module file exists and is readable
- Verify module format (.sb files)
- Ensure sufficient space for all modules

### Debug Information

Enable verbose output for troubleshooting:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Best Practices

### Planning Your ISO

1. **Start Clean**: Begin with a fresh MiniOS system
2. **Test Thoroughly**: Validate all customizations before creating ISO
3. **Document Changes**: Keep track of modifications made
4. **Size Considerations**: Monitor ISO size for distribution needs

### Module Organization

1. **Logical Grouping**: Group related software in modules
2. **Proper Numbering**: Use appropriate module numbers
3. **Testing**: Test each module individually
4. **Dependencies**: Understand module dependencies

### Distribution Preparation

1. **Naming Convention**: Use descriptive ISO names
2. **Documentation**: Include usage instructions
3. **Language Support**: Consider international users
4. **Size Optimization**: Remove unnecessary components

## Integration with Other Tools

### Creating Custom Modules

Before rebuilding ISO, you may want to create custom modules:

- **apt2sb** - Create modules from package installation
- **script2sb** - Create modules using custom scripts
- **chroot2sb** - Create modules interactively
- **savechanges** - Save current system modifications

See the [Creating Modules](Creating-Modules.md) guide for detailed instructions.

### Building from Source

For complete customization, consider building from source:

- **minios-live** - Build complete systems from scratch
- **minios-cmd** - Simplified build interface

See the [Building MiniOS](Building-MiniOS.md) guide for source builds.

## Conclusion

The ISO rebuilding tools in MiniOS provide a powerful way to customize and redistribute Linux systems. Whether you're creating specialized distributions, removing unwanted software, or adding custom functionality, these tools make it straightforward to package your live system into a professional ISO image.

Start with simple customizations and gradually work toward more complex distributions as you become familiar with the module system and available options.