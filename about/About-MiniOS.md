# About MiniOS

MiniOS is a Debian-based Linux distribution designed to run from removable
media or a local disk. Its read-only system is assembled from SquashFS modules,
with optional writable sessions for files, settings, and installed packages.
MiniOS supports 64-bit x86 systems and can boot through UEFI or legacy BIOS.

## System model

- The base system and optional software are separate modules. Modules can be
  selected at boot or added without rebuilding the whole system.
- A fresh live session leaves the base modules unchanged.
- Persistence can store changes in a native directory, an expandable
  DynFileFS container, a fixed-size raw image, or an encrypted LUKS container,
  depending on the installation and target filesystem.
- The MiniOS Installer can make a modular live installation or, when the image
  supports it, deploy a conventional native Linux installation.

See [System architecture](/about/System-Architecture.md) for the boot and module
layout, and [Session management](/configuration/Session-Management.md) for
persistent sessions.

## Editions

Available editions depend on the release and base distribution:

- **Minimum** uses the Flux environment and a reduced package set. It is suited
  to systems where a smaller software selection is preferred.
- **Standard** is the general-purpose edition. Current standard Debian and
  Ubuntu builds use Xfce.
- **Toolbox** adds system administration, storage, diagnostic, and recovery
  tools.
- **Ultra** adds a broader application set on top of the other editions.

Xfce is the usual desktop in Standard, Toolbox, and Ultra images, but it is not
the only MiniOS environment. Minimum uses Flux, and supported build
configurations may offer other environments. Check the release description
before downloading if the desktop environment matters.

For the software included in each edition, see the
[package list](/administration/Packages.md).

## Installation and persistence

An ISO can be written as a bootable image, copied to a multiboot device, or
installed with MiniOS Installer. These methods do not have identical storage
behavior. Image-writing tools such as `dd` and Etcher reproduce the ISO layout;
Ventoy boots the ISO file; MiniOS Installer can allocate and configure writable
session storage. Do not assume that a writing method creates persistence.

Start with [Quick start](/installation/Quick-Start.md) and use the linked guide
for the selected installation method. Persistence can also be selected from an
appropriate boot menu or configured with the documented boot parameters when
writable storage is available.

## Project resources

- [MiniOS website](https://minios.dev)
- [Source code](https://github.com/minios-linux/minios-live)
- [Issue tracker](https://github.com/minios-linux/minios-live/issues)
