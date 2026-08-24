# Packages and editions

MiniOS package contents are generated from conditional source lists. They vary
by distribution suite, architecture, init system, desktop environment, locale,
kernel options, and repository availability. This page describes edition
inheritance and representative contents; it is not an exhaustive release
package table.

## Edition inheritance

The package variants form an additive sequence:

1. **Minimum** provides the common live system and the smallest selected desktop.
2. **Standard** inherits Minimum and adds general administration, desktop, and MiniOS management tools.
3. **Toolbox** inherits Standard and adds recovery, diagnostics, storage, networking, and virtualization tools.
4. **Ultra** inherits Toolbox and adds broader workstation, media, office, and container software.

Conditional expressions can select alternatives or omit a package for a suite,
architecture, environment, or build option. A package named below is therefore
representative of the current source lists, not a promise that the same Debian
binary package name exists in every MiniOS release.

## Desktop and environment scope

Desktop packages come from the selected environment's ordered module chain.
The Xfce, Fluxbox, LXQt, core, and debug environments do not have identical
module or package sets. The examples below use the current Xfce lists unless a
capability comes from the shared core list. A console or another desktop build
must be inspected independently.

## Representative contents

### Minimum

The common Minimum composition includes MiniOS live configuration and image
tools, NetworkManager, SSH, keyboard and locale support, firmware selected for
the target, and utilities for hardware inspection and common storage tasks.
Representative packages include `minios-tools`, `minios-image-compose`,
`minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`,
`ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill`, and
`wpasupplicant`.

The Xfce Minimum chain adds Xorg, Blackbox or Openbox as selected by the source
list, Thunar, Mousepad, the Xfce panel, session, settings, desktop and window
manager components, NetworkManager's desktop applet, ALSA controls, Xarchiver,
battery support, and Firefox or Firefox ESR as selected for the distribution
family.

The MiniOS utilities present in every edition, including Xfce Minimum, are
`minios-tools`, `minios-image-compose`, `minios-live-config`, the matching
systemd or SysV init integration, `minios-live-config-doc`, and
`minios-welcome`.

### Standard

Standard adds shared capabilities such as DNS support, additional compression
and filesystem tools, network filesystem clients, FUSE, partitioning, and ISO
creation. Representative packages include `dnsmasq-base`, `ncdu`, `lsof`,
`xfsprogs`, `exfatprogs` or its suite-specific alternative, `cifs-utils`,
`nfs-common`, `parted`, `7zip`, and `genisoimage`.

In Xfce, Standard and later editions add the current MiniOS graphical and
administrative utilities: `minios-configurator`, `minios-installer`,
`minios-session-manager`, `minios-kernel-manager`, `minios-store`,
`minios-store-gui`, `minios-image-builder`, `minios-module-manager`, and
`driveutility`. They also add LightDM, desktop audio and Bluetooth integration,
screenshots, task management, notifications, and the Xfce terminal.

### Toolbox

Toolbox adds command-line storage, recovery, performance, network, and virtual
machine capabilities. Current examples include LVM and LUKS tools, Clonezilla,
Partclone, TestDisk, `gddrescue`, ZFS tools when the build supports them, Nmap,
iperf3, QEMU, libvirt, guest agents, fio, sysbench, and hardware reporting.

The Xfce application module adds representative tools such as GParted,
GSmartControl, Guymager, Rescue and disk utilities, Wireshark, Remmina,
Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit, and graphical
encryption tools. Exact names are suite-dependent; for example, a source list
may use one of several package alternatives.

### Ultra

Ultra retains the Toolbox set and adds container and workstation software.
Representative shared additions include Docker packages selected for the target
repository, Compose support, `lazydocker`, iSCSI tools, and user-namespace
utilities. The current Xfce application list adds LibreOffice, GIMP, Inkscape,
Blender, Audacity, OBS Studio, RawTherapee, Synaptic, and related desktop
integration packages.

## Inspect exact release contents

The running system is authoritative for packages that were actually installed
in that release. List package names and versions with:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Inspect the ordered modules composing the running root separately from the
files selected for the next boot. MiniOS Module Manager presents these as
**Running now** and **Next boot**. From a shell, the runtime SquashFS mounts can
be listed with:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

For offline media or a mounted ISO, inventory the source module files directly:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

For a source build, the following files and directories are the authoritative
source manifests and selection inputs:

- `linux-live/environments/<environment>/` for the ordered module chain.
- `linux-live/scripts/00-core/packages.list` for shared edition selection.
- `linux-live/scripts/01-kernel/packages.list` and `02-firmware/packages.list` for conditional kernel additions and firmware.
- Each selected desktop and application module's `packages.list`.
- `linux-live/build.conf` for suite, architecture, environment, package variant, init system, kernel, locale, and other filter values.
- `linux-live/condinapt.map` for the meaning of package-list filter prefixes.

Source lists describe requested packages and alternatives. Only the completed
image and `dpkg-query` show the exact resolved dependency set and versions for a
particular release. Package availability and package names can change between
Debian, Ubuntu, and Devuan suites and between desktop environments.

See [System architecture](/about/System-Architecture.md) for module ordering and
[CondinAPT in MiniOS](/development/CondinAPT-MiniOS.md) for conditional package
selection.
