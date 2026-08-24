# Quick start

This guide covers downloading, writing, booting, and performing the initial
configuration of MiniOS.

## 1. Choose an edition

- **Minimum** provides a reduced package set and the Flux environment.
- **Standard** is the general-purpose Xfce edition.
- **Toolbox** adds administration, diagnostic, storage, and recovery tools.
- **Ultra** includes the broadest application set.

Edition and desktop availability varies by release. See
[About MiniOS](/about/About-MiniOS.md) and the
[package list](/administration/Packages.md) before downloading.

Download an ISO from [minios.dev](https://minios.dev) or the
[GitHub releases page](https://github.com/minios-linux/minios-live/releases).
Verify its checksum before using it; see
[Verifying downloads](/installation/Verifying-Downloads.md).

## 2. Prepare a target device

Use a device large enough for the selected ISO and any data or persistent
session you intend to keep. ISO sizes change between releases, so check the
download and the writing tool rather than relying on a fixed size listed in a
guide. Back up the target device first: most installation methods overwrite
some or all of it.

Choose one method and read its guide before selecting a device:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), or
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), or
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) or
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- From MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Other documented methods are [UNetbootin](/installation/tools/UNetbootin.md)
and the [original method](/installation/tools/Original-Method.md). See
[USB creation tools](/installation/tools/USB-Creation-Tools.md) for a comparison
and [Installing MiniOS](/installation/Installing-MiniOS.md) for the installation
overview.

## 3. Understand persistence before writing

Persistence is not created by every write or boot method.

- A raw image write with `dd`, Etcher, or a similar tool reproduces the ISO. It
  does not by itself configure a persistent session.
- Ventoy normally boots the ISO as a file. MiniOS persistence must be arranged
  separately.
- MiniOS Installer can create a live installation and configure native,
  DynFileFS, raw, or encrypted LUKS session storage.
- A fresh boot deliberately runs without persistence. Other MiniOS boot-menu
  entries can resume, create, or select sessions when writable storage is
  available.
- A native installation is a conventional installed system and does not use
  live-session persistence in the same way.

See [Session management](/configuration/Session-Management.md) and
[Boot parameters](/configuration/Boot-Parameters.md) before changing session
storage. Keep a backup of important files regardless of persistence mode.

## 4. Boot MiniOS

1. Shut down the computer and attach the prepared device.
2. Open the firmware boot menu and select the device's UEFI or legacy entry.
3. Select a fresh session for an initial hardware test, or a persistent session
   only if one has already been configured.
4. Confirm that graphics, keyboard, storage, and networking work before making
   destructive installation changes.

If the device is not listed or the desktop does not start, see
[Hardware compatibility](/installation/Hardware-Compatibility.md) and
[Troubleshooting](/administration/Troubleshooting.md).

## 5. Configure the system

Open **Applications > System > Configure MiniOS**, or run:

```bash
minios-configurator
```

The Configurator edits `/etc/live/config.conf`. It can set user identity,
passwords, locale, timezone, keyboard, hostname, services, user-directory
storage, and security controls. It does not change the running system directly;
saved settings are applied according to each setting's applicability, normally
after reboot or when a new session is created.

Security profiles fill concrete settings for sudo, PolicyKit, SSH, XRDP, X11,
password hints, screen locking, and autologin. Review the resulting controls
rather than treating the profile name as a runtime setting. See
[Security hardening](/administration/Security-Hardening.md) and the
[MiniOS Configurator guide](/configuration/MiniOS-Configurator.md). The
[configuration file reference](/configuration/Configuration-File.md) documents
the underlying keys.

## 6. Install software and save work

APT changes made in a live session survive reboot only when that session is
persistent. SquashFS modules remain separate from the writable session and can
be loaded as part of the modular system; see
[Creating modules](/development/Creating-Modules.md).

Store important files on known writable storage and test one clean shutdown and
reboot before relying on a persistent session.

## Getting help

- [Performance optimization](/administration/Performance-Optimization.md)
- [Kernel management](/administration/Kernel-Management.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Rebuilding an ISO](/development/Rebuilding-ISO.md)
- [GitHub issues](https://github.com/minios-linux/minios-live/issues)
- [MiniOS source](https://github.com/minios-linux/minios-live)
- [Debian documentation](https://www.debian.org/doc/)
