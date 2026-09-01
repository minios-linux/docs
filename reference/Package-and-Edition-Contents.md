---
updated: 2026-08-31
---
# Package and edition contents

MiniOS package contents are generated from conditional source lists. The final set depends on the distribution suite, architecture, init system, desktop environment, locale, kernel options, and repository availability. This page documents the user-facing packages requested by the maintained Flux and Xfce manifests. It omits build-only toolchains and dependencies pulled in by APT.

`Yes` means that the current manifest requests the package for that edition.
`Conditional` means that the package name or inclusion depends on a build option or target platform. A dash means that the edition does not request it.
The completed image remains authoritative.

## Edition layout

The maintained Xfce editions build on one another: Standard is the compact everyday desktop, Toolbox targets professional system administration, diagnostics, and recovery, and Ultra turns that base into a full-featured desktop for general work, creativity, and development. Flux is a separate ultra-lightweight Fluxbox configuration for minimal resource use and older hardware; it is not simply a smaller Xfce package list.

| Edition | Package variant and environment | Main purpose |
|---|---|---|
| **Standard** | `standard` with `xfce` | Minimal everyday Xfce desktop with basic functionality |
| **Toolbox** | `toolbox` with `xfce` | Professional system administration, diagnostics, and recovery |
| **Ultra** | `ultra` with `xfce` | Full-featured desktop for general work, creativity, and development |
| **Flux** | `minimum` with `flux` | Ultra-lightweight Fluxbox desktop for minimal resource use and older hardware |

Other supported environments have their own module chains and must be checked separately. In particular, package availability in an LXQt or console build must not be inferred from the Xfce tables below.

## Core MiniOS and system packages

These packages provide the live-system runtime, configuration, localization, privilege handling, and basic command-line environment.

| Package | Flux | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Yes | Yes | Yes | Yes | Module creation, conversion, inspection, activation, and change capture |
| `minios-image-compose` | Yes | Yes | Yes | Yes | Command-line MiniOS ISO composition |
| `minios-live-config` | Yes | Yes | Yes | Yes | Live-session configuration components |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Conditional | Conditional | Conditional | Conditional | Init-system integration; one implementation is selected |
| `minios-live-config-doc` | Yes | Yes | Yes | Yes | Installed live-config reference |
| `minios-welcome` | Yes | Yes | Yes | Yes | MiniOS welcome page and launcher |
| `user-setup` | Yes | Yes | Yes | Yes | Live-user account setup |
| `linux-base` | Yes | Yes | Yes | Yes | Common Linux image and system scripts |
| `kbd`, `keyboard-configuration`, `console-setup` | Yes | Yes | Yes | Yes | Console keyboard and display configuration |
| `locales` | Yes | Yes | Yes | Yes | Locale data and generation |
| `network-manager` | Yes | Yes | Yes | Yes | Network connection management |
| `netplan.io` | Conditional | Conditional | Conditional | Conditional | Requested only on supported Ubuntu suites |
| `dracut-core` | Conditional | Conditional | Conditional | Conditional | Requested when Dracut is the initramfs builder |
| `gpg`, `gnupg` | Yes | Yes | Yes | Yes | Package and file signature tools |
| `file`, `cpio` | Yes | Yes | Yes | Yes | File identification and archive handling |
| `gettext-base` / `gettext` | Conditional | Conditional | Conditional | Conditional | Translation utilities selected by availability |
| `polkitd` / `policykit-1`, `pkexec` | Conditional | Conditional | Conditional | Conditional | Privilege authorization and elevation |
| `bash-completion` | Yes | Yes | Yes | Yes | Shell command completion |
| `man-db` | Yes | Yes | Yes | Yes | Manual-page reader and database |
| `mc` | Yes | Yes | Yes | Yes | Midnight Commander file manager |
| `gpm` | Yes | Yes | Yes | Yes | Console mouse support |
| `ssh` | Yes | Yes | Yes | Yes | OpenSSH client and server packages selected by APT |
| `systemd-timesyncd` / `chrony` | Conditional | Conditional | Conditional | Conditional | Time synchronization selected by suite and init system |
| `tlp` | Yes | Yes | Yes | Yes | Laptop power management |

Some bootstrap parity packages are requested only for specific base suites.
They are implementation dependencies rather than edition features and are not listed individually here.

## Network tools

| Package | Flux | Standard | Toolbox | Ultra | Purpose |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Yes | Yes | Yes | Yes | WPA/WPA2 wireless authentication |
| `rfkill` | Yes | Yes | Yes | Yes | Wireless-device state control |
| `usb-modeswitch` | Yes | Yes | Yes | Yes | USB modem and multi-mode device switching |
| `dnsmasq-base` | - | Yes | Yes | Yes | DNS and DHCP support used by network workflows |
| `cifs-utils` | - | Yes | Yes | Yes | SMB/CIFS network filesystem client |
| `nfs-common` | - | Yes | Yes | Yes | NFS client support |
| `ipset` | - | Yes | Yes | Yes | Kernel IP set administration |
| `whois` | - | Yes | Yes | Yes | Domain and address registration lookup |
| `netcat`, `netcat-openbsd` | - | - | Yes | Yes | TCP and UDP stream testing tools |
| `nmap`, `ncat`, `ndiff` | - | - | Yes | Yes | Network discovery, transfer, and scan comparison |
| `iw` | - | - | Yes | Yes | Wireless device and link configuration |
| `iperf3` | - | - | Yes | Yes | Network throughput testing |
| `aria2` | - | - | Yes | Yes | Multi-protocol download utility |
| `davfs2` | - | - | Yes | Yes | WebDAV filesystem client |
| `sshfs` | - | - | Yes | Yes | Filesystem access over SSH |
| `open-iscsi` | - | - | - | Yes | iSCSI initiator |
| `tgt` | - | - | - | Yes | iSCSI target service |

## Storage and filesystems

| Package | Flux | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Yes | Yes | Yes | Yes | ATA and SCSI device inspection and tuning |
| `mdadm` | Yes | Yes | Yes | Yes | Linux software RAID management |
| `smartmontools` | Yes | Yes | Yes | Yes | S.M.A.R.T. monitoring and tests |
| `dosfstools` | Yes | Yes | Yes | Yes | FAT filesystem creation and checking |
| `ntfs-3g` | Yes | Yes | Yes | Yes | NTFS userspace driver and tools |
| `btrfs-progs` | Yes | Yes | Yes | Yes | Btrfs administration |
| `xfsprogs` | - | Yes | Yes | Yes | XFS administration |
| `exfatprogs` / `exfat-utils` with `exfat-fuse` | - | Conditional | Conditional | Conditional | exFAT implementation selected by package availability |
| `fuse3` / `fuse`, `libfuse2` | - | Conditional | Conditional | Conditional | FUSE runtime and compatibility library |
| `dynfilefs` | - | Conditional | Conditional | Conditional | Segmented persistence storage on supported suites |
| `parted` | - | Yes | Yes | Yes | Partition table creation and editing |
| `gpart` | - | - | Yes | Yes | Partition table recovery |
| `mtools` | - | - | Yes | Yes | FAT and DOS media tools |
| `gddrescue` | - | - | Yes | Yes | Fault-tolerant block-device copying |
| `lvm2` | - | - | Yes | Yes | Logical Volume Manager |
| `cryptsetup` | - | - | Yes | Yes | LUKS volume management |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Yes | Yes | Encrypted-volume management and mounting |
| `f2fs-tools` | - | - | Yes | Yes | F2FS administration |
| `hfsutils`, `hfsprogs` | - | - | Yes | Yes | HFS and HFS+ tools, where available |
| `jfsutils` | - | - | Yes | Yes | JFS administration |
| `reiserfsprogs`, `reiser4progs` | - | - | Yes | Yes | ReiserFS and Reiser4 tools, where available |
| `udftools` | - | - | Yes | Yes | UDF optical-media filesystem tools |
| `nilfs-tools` | - | - | Yes | Yes | NILFS2 administration |
| `zfsutils-linux` | - | - | Conditional | Conditional | ZFS userspace tools when the kernel build supports ZFS |

## Archives and image formats

| Package | Flux | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Yes | Yes | Yes | Yes | Compression used by packages, modules, and images |
| `zip`, `unzip` | Yes | Yes | Yes | Yes | ZIP archive creation and extraction |
| `xorriso` | Yes | Yes | Yes | Yes | ISO creation and inspection |
| `squashfs-tools` | Yes | Yes | Yes | Yes | SquashFS module creation and extraction |
| `lz4` / `liblz4-tools` | - | Conditional | Conditional | Conditional | LZ4 implementation selected by availability |
| `bzip2` | - | Yes | Yes | Yes | bzip2 compression |
| `7zip` | - | Yes | Yes | Yes | 7z and related archive formats |
| `genisoimage` | - | Yes | Yes | Yes | ISO-9660 image creation |
| `pv` | - | - | Yes | Yes | Pipeline progress display |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Yes | Yes | Parallel compression tools |
| `lrzip`, `lzop` | - | - | Yes | Yes | Additional compression formats |
| `cabextract` | - | - | Yes | Yes | Microsoft Cabinet archive extraction |
| `xmount` | - | - | Yes | Yes | Conversion and mounting of disk-image formats |

## Recovery, diagnostics, and performance

| Package | Flux | Standard | Toolbox | Ultra | Purpose |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Yes | Yes | Yes | Yes | PCI and USB device inspection |
| `psmisc` | Yes | Yes | Yes | Yes | Process tools such as `fuser` and `killall` |
| `htop` | - | Yes | Yes | Yes | Interactive process monitor |
| `ncdu` | - | Yes | Yes | Yes | Terminal disk usage analyzer |
| `lsof` | - | Yes | Yes | Yes | Open-file and process inspection |
| `clonezilla` | - | - | Yes | Yes | Disk and partition cloning workflows |
| `partclone`, `partimage` | - | - | Yes | Yes | Filesystem-aware imaging tools |
| `testdisk` | - | - | Yes | Yes | Partition and file recovery |
| `chntpw`, `reglookup` | - | - | Yes | Yes | Offline Windows account and registry tools |
| `hexedit` | - | - | Yes | Yes | Terminal hexadecimal editor |
| `lshw`, `inxi` | - | - | Yes | Yes | Detailed hardware and system reports |
| `screen` | - | - | Yes | Yes | Terminal multiplexer |
| `nmon` | - | - | Yes | Yes | Interactive performance monitor |
| `fio`, `bonnie++`, `iozone3` | - | - | Yes | Yes | Storage and filesystem benchmarks |
| `stress`, `sysbench` | - | - | Yes | Yes | CPU, memory, and system benchmarks |
| `memtest86+` | - | - | Yes | Yes | Boot-time memory testing |
| `rsync` | - | - | Yes | Yes | File synchronization and copy utility |

## Virtualization and containers

| Package | Flux | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Yes | Yes | VMware and QEMU guest integration |
| `virtualbox-guest-utils` | - | - | Conditional | Conditional | VirtualBox guest integration on selected suites |
| `hyperv-daemons` | - | - | Yes | Yes | Microsoft Hyper-V guest services |
| `qemu-system-x86`, `qemu-utils` | - | - | Yes | Yes | Virtual machine runtime and image tools |
| `libvirt-daemon-system` | - | - | Yes | Yes | System libvirt service |
| `virt-what` | - | - | Yes | Yes | Hypervisor detection |
| `uidmap` | - | - | - | Yes | User namespace ID mapping |
| Docker CE stack / `docker.io` with `docker-compose` | - | - | - | Conditional | Container runtime selected from the available repository |
| `lazydocker` | - | - | - | Yes | Terminal interface for Docker |
| `selinux-policy-default` | - | - | - | Yes | Default SELinux policy package |

## Firmware and kernel drivers

Firmware selection follows the distribution profile: Debian and Devuan builds use split firmware packages, while Ubuntu builds use `linux-firmware`. DKMS drivers are also filtered by architecture, kernel provider, kernel series, and features already supplied by the selected kernel.

| Package | Editions | Purpose or condition |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Conditional, all | Debian and Devuan firmware collections |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Conditional, all | Wireless firmware for Atheros, Intel, and ZyDAS devices |
| `firmware-realtek`, `firmware-mediatek` | Conditional, all | Realtek and MediaTek firmware; MediaTek depends on suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Conditional, all | Broadcom and Cavium network firmware |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Conditional, all | Additional wireless firmware families |
| `firmware-b43-installer` | Conditional, all | Legacy Broadcom B43 firmware installer |
| `firmware-sof-signed` | Conditional, all | Sound Open Firmware images |
| `linux-firmware` | Conditional, all | Ubuntu firmware collection |
| `ntfs3-dkms` | Conditional, all | NTFS3 driver when it is absent from the selected kernel |
| `aufs-dkms` / `aufs-ng-dkms` | Conditional, all | AUFS driver selected by suite and kernel |
| `broadcom-sta-dkms` | Conditional, all | Broadcom STA wireless driver on supported targets |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Conditional, all | Vendor wireless drivers filtered by in-tree kernel capabilities and target platform |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Conditional, all | Vendor drivers retained on supported targets for additional devices or features |
| `zfs-dkms` | Conditional, Toolbox and Ultra | ZFS kernel module on supported amd64 builds |

## Graphical base

The graphical environments share the Xorg and rendering base below. Flux then uses its own desktop list; Standard, Toolbox, and Ultra use the maintained Xfce list.

| Package | Flux | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Yes | Yes | Yes | Yes | X.Org server and startup tools |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Yes | Yes | Yes | Yes | X.Org video drivers |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Yes | Yes | Yes | Yes | Input drivers and legacy launch support |
| `xterm` | Yes | Yes | Yes | Yes | Basic X terminal |
| `blackbox` / `openbox` | Conditional | Conditional | Conditional | Conditional | Lightweight fallback window manager selected by environment |
| `x11-utils`, `wmctrl`, `xdotool` | Yes | Yes | Yes | Yes | X11 inspection and window automation |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Yes | Yes | Yes | Yes | DRM and Mesa rendering libraries |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Yes | Yes | Yes | Yes | Cursor and icon themes |
| `elementary-minios-icon-theme` | Yes | Yes | Yes | Yes | MiniOS icon theme outside LXQt |
| `librsvg2-common` | Yes | Yes | Yes | Yes | SVG rendering support |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Conditional | Conditional | Conditional | Conditional | Graphical PolicyKit agent selected by availability |
| `xrdp`, `xorgxrdp` | - | - | Yes | Yes | Remote graphical login over RDP |

## Flux desktop and applications

| Package | Purpose or condition |
|---|---|
| `fluxbox-flux` | MiniOS Fluxbox window manager configuration |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panel and keyboard layout indicator |
| `xwallpaper`, `gpicview` / `feh` | Wallpaper and image display |
| `compton` | X compositor |
| `alsa-utils`, `volumeicon-alsa` | ALSA audio controls |
| `systrayicon`, `cbatticon` | Tray and battery indicators |
| `xlunch`, `gtkask`, `flux-tools` | Launcher and MiniOS Flux desktop helpers |
| `scrot` | Screenshot utility |
| `mousepad`, `pcmanfm` | Text editor and file manager |
| `galculator`, `lxtask`, `xarchiver` | Calculator, task manager, and archive manager |
| `network-manager-gnome` | NetworkManager desktop applet |
| `firefox` / `firefox-esr` | Browser selected by suite, with selected localization packages |

## Xfce desktop and MiniOS applications

| Package | Standard | Toolbox | Ultra | Purpose or condition |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Yes | Yes | Yes | File manager and removable-media integration |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Yes | Yes | Yes | Xfce panel, session, and settings services |
| `xfdesktop4`, `xfwm4`, `xfconf` | Yes | Yes | Yes | Desktop, window manager, and configuration service |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Yes | Yes | Yes | Application finder and keyboard indicator |
| `mousepad`, `ristretto` | Yes | Yes | Yes | Text editor and image viewer |
| `at-spi2-core`, `dbus-x11` | Yes | Yes | Yes | Accessibility and desktop message-bus support |
| `gvfs-backends` | Yes | Yes | Yes | Remote and removable filesystem integration for the file manager |
| `lightdm`, `lightdm-gtk-greeter` | Yes | Yes | Yes | Graphical login manager |
| `network-manager-gnome`, `blueman` | Yes | Yes | Yes | Network and Bluetooth desktop controls |
| `avahi-daemon` | Yes | Yes | Yes | Local-network service discovery |
| PipeWire stack / PulseAudio stack | Conditional | Conditional | Conditional | Desktop audio selected by suite |
| `pavucontrol` | Yes | Yes | Yes | Graphical audio mixer |
| `engrampa`, `thunar-archive-plugin` | Yes | Yes | Yes | Archive manager and file-manager integration |
| `xfce4-screensaver`, `xfce4-screenshooter` | Yes | Yes | Yes | Screen locking and screenshots |
| `xfce4-power-manager-plugins` | Yes | Yes | Yes | Xfce power management integration |
| `xfce4-taskmanager`, `xfce4-terminal` | Yes | Yes | Yes | Task manager and terminal emulator |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Yes | Yes | Yes | Application menu and notifications |
| `minios-configurator` | Yes | Yes | Yes | MiniOS boot and session configuration editor |
| `minios-installer` | Yes | Yes | Yes | Graphical installer and `minios-deploy` CLI |
| `minios-session-manager` | Yes | Yes | Yes | Persistent session manager and `minios-session` CLI |
| `minios-kernel-manager` | Yes | Yes | Yes | Modular kernel manager and `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Yes | Yes | Yes | MiniOS application catalog and installer |
| `minios-image-builder` | Yes | Yes | Yes | Graphical ISO remastering workspace |
| `minios-module-manager` | Yes | Yes | Yes | Graphical `.sb` module manager |
| `minios-help` | Yes | Yes | Yes | Installed MiniOS documentation viewer |
| `driveutility` | Yes | Yes | Yes | Disk image writing, reading, formatting, and wiping |
| `firefox` / `firefox-esr` | Conditional | Conditional | Conditional | Browser and localization selected by suite and locale |
| `menulibre` | - | Yes | Yes | Graphical menu editor |
| `open-vm-tools-desktop` | - | Yes | Yes | VMware desktop integration |
| `virtualbox-guest-x11` | - | Conditional | Conditional | VirtualBox desktop integration on selected suites |
| Qt GTK platform themes | - | Yes | Yes | GTK appearance integration for Qt applications |

## Toolbox graphical applications

The Xfce `05-apps` module is included for Toolbox and Ultra and is skipped for Standard.

| Package | Purpose or condition |
|---|---|
| `gparted` | Graphical partition editor |
| `gsmartcontrol`, `qdiskinfo` | Disk health and device information |
| `guymager`, `qphotorec` | Forensic imaging and file recovery; `qphotorec` is excluded on Buster and Beowulf |
| `kdiskmark` | Disk benchmark |
| `isomaster` | ISO image editor |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Hardware and graphics diagnostics |
| `baobab` | Graphical disk usage analyzer |
| `doublecmd-gtk` | Two-panel file manager |
| `grsync` | Graphical `rsync` frontend |
| `bleachbit` | Cache and temporary-file cleanup |
| `czkawka` / `czkawka-gui` | Duplicate and unwanted file finder |
| `gtkhash` | Checksum calculator |
| `wxhexeditor` | Large-file hexadecimal editor |
| `keepassxc` | Password manager |
| `veracrypt` | Encrypted container and disk management; excluded on Buster and Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Graphical encrypted-volume tools |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Virtual machine management and SPICE display support |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Remote desktop client |
| `wireshark`, `zenmap`, `gnome-nettool` | Graphical network analysis and diagnostics |
| `x11vnc` | VNC access to the current X session |
| `uget` | Graphical download manager |
| `android-file-transfer` | Android MTP file transfer |
| `vlc` and selected plugins | Media playback, localization, Samba, and BitTorrent support |
| `pdfarranger` | PDF page arrangement |
| `codium` | Code editor |
| `onboard` | On-screen keyboard |
| `galculator` | Calculator |

## Ultra applications

Ultra contains all Toolbox applications and adds:

| Package | Purpose |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Office suite and desktop integration |
| `gimp` | Raster graphics editor |
| `inkscape` | Vector graphics editor |
| `blender` | 3D creation suite |
| `audacity` | Audio editor |
| `obs-studio`, `obs-plugins` | Screen recording and streaming |
| `rawtherapee` | RAW photo processor |
| `synaptic` | Graphical package manager |
| `eddy`, `eddy-handler` | Local Debian package installer, where available |
| `fonts-open-sans` | Open Sans font family |

## Inspect installed packages

The running system is authoritative for packages that were actually installed.
List package names and versions with:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Source build manifests

The package tables above are derived from the [`minios-live` build system](https://github.com/minios-linux/minios-live). The paths below are relative to the root of that source repository and are relevant when building or customizing an image from source:

- `linux-live/environments/<environment>/` defines the ordered module chain.
- `linux-live/scripts/00-core/packages.list` defines the shared base and package-variant additions.
- `linux-live/scripts/01-kernel/packages.list` defines conditional kernel build and DKMS packages.
- `linux-live/scripts/02-firmware/packages.list` defines distribution-specific firmware.
- `linux-live/scripts/03-gui-base/packages.list` defines the shared graphical base.
- `linux-live/scripts/04-flux-desktop/packages.list` and `05-flux-apps/packages.list` define Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` defines Xfce and MiniOS desktop tools.
- `linux-live/scripts/05-apps/packages.list` defines Toolbox and Ultra graphical applications.
- `linux-live/scripts/10-firefox/packages.list` defines the suite- and locale-specific browser packages.
- Each module's `install` and `skip_conditions.conf` files determine whether and how its package list is used.
- `linux-live/build.conf` selects the suite, architecture, environment, package variant, init system, kernel, and locale.
- `linux-live/condinapt.map` defines package-list condition prefixes.

Source lists describe requested packages and alternatives. Only the completed image and `dpkg-query` show the resolved dependency set and exact versions for a particular release.

See [System architecture](/reference/System-Architecture) for module ordering and [CondinAPT in MiniOS](/development/CondinAPT) for conditional package selection.
