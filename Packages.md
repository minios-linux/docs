# MiniOS Package List

This document provides a comprehensive overview of all packages included in different MiniOS editions. MiniOS comes in three main editions, each with a different set of pre-installed software:

- **Standard** - Minimal system with basic functionality
- **Toolbox** - System administration and diagnostic tools
- **Ultra** - Complete desktop environment with applications

## Console utilities and system packages

### ⚙️ Core system packages

| Package                        | Standard | Toolbox | Ultra | ℹ️ Package information                                   |
| :----------------------------- | :------: | :-----: | :---: | :------------------------------------------------------ |
| minios-tools                   |    ✅     |    ✅    |   ✅   | Core tools and scripts for MiniOS.                      |
| minios-welcome                 |    ✅     |    ✅    |   ✅   | Welcome message in browser.                             |
| minios-live-config             |    ✅     |    ✅    |   ✅   | Configuration scripts for Live system.                  |
| minios-live-config-systemd     |    ✅     |    ✅    |   ✅   | Live system configuration for systemd.                  |
| minios-live-config-doc         |    ✅     |    ✅    |   ✅   | Documentation for minios-live-config.                   |
| user-setup                     |    ✅     |    ✅    |   ✅   | User configuration utility.                             |
| linux-base                     |    ✅     |    ✅    |   ✅   | Base scripts for Linux system.                          |
| kbd                            |    ✅     |    ✅    |   ✅   | Utilities for managing keyboard layout in console.      |
| keyboard-configuration         |    ✅     |    ✅    |   ✅   | Keyboard configuration system.                          |
| locales                        |    ✅     |    ✅    |   ✅   | Libraries and data for localization (language support). |
| console-setup                  |    ✅     |    ✅    |   ✅   | Console font and encoding configuration.                |
| systemd-timesyncd              |    ✅     |    ✅    |   ✅   | Service for network time synchronization.               |
| polkitd / policykit-1 / pkexec |    ✅     |    ✅    |   ✅   | Framework for managing system service privileges.       |

### 📦 Package and software management

| Package             | Standard | Toolbox | Ultra | ℹ️ Package information                                         |
| :------------------ | :------: | :-----: | :---: | :------------------------------------------------------------ |
| apt-transport-https |    ✅     |    ✅    |   ✅   | Allows using repositories over HTTPS protocol.                |
| gettext-base        |    ✅     |    ✅    |   ✅   | Utilities for software internationalization and localization. |
| man-db              |    ✅     |    ✅    |   ✅   | System for viewing manual pages (man).                        |
| bash-completion     |    ✅     |    ✅    |   ✅   | Provides command auto-completion in Bash shell.               |

### 🌐 Network utilities

| Package                   | Standard | Toolbox | Ultra | ℹ️ Package information                                       |
| :------------------------ | :------: | :-----: | :---: | :---------------------------------------------------------- |
| network-manager / connman |    ✅     |    ✅    |   ✅   | Network connection managers.                                |
| dnsmasq-base              |    ✅     |    ✅    |   ✅   | Lightweight DNS and DHCP server (base files).               |
| wpasupplicant             |    ✅     |    ✅    |   ✅   | Utility for connecting to secure Wi-Fi networks (WPA/WPA2). |
| iputils-ping              |    ✅     |    ✅    |   ✅   | `ping` utility for checking host availability.              |
| ssh                       |    ✅     |    ✅    |   ✅   | Client and server for secure remote connections (SSH).      |
| wget                      |    ✅     |    ✅    |   ✅   | Utility for downloading files from network.                 |
| curl                      |    ✅     |    ✅    |   ✅   | Utility for data transfer using various protocols.          |
| ipset                     |    ✅     |    ✅    |   ✅   | Utility for administering IP address sets in kernel.        |
| whois                     |    ✅     |    ✅    |   ✅   | Client for getting domain name and IP information.          |
| nmap                      |    ❌     |    ✅    |   ✅   | Powerful network scanner and security auditing tool.        |
| ncat                      |    ❌     |    ✅    |   ✅   | Enhanced version of `netcat` from nmap suite.               |
| ndiff                     |    ❌     |    ✅    |   ✅   | Utility for comparing nmap scan results.                    |
| iperf3                    |    ❌     |    ✅    |   ✅   | Tool for measuring network bandwidth.                       |
| netcat                    |    ❌     |    ✅    |   ✅   | Network utility for reading/writing data over TCP/IP.       |
| netcat-openbsd            |    ❌     |    ✅    |   ✅   | Alternative `netcat` implementation from OpenBSD.           |
| open-iscsi                |    ❌     |    ❌    |   ✅   | Client (initiator) for working with iSCSI storage.          |
| tgt                       |    ❌     |    ❌    |   ✅   | Server (target) for providing iSCSI storage.                |

### 💾 Disk and filesystem management

| Package        | Standard | Toolbox | Ultra | ℹ️ Package information                                          |
| :------------- | :------: | :-----: | :---: | :------------------------------------------------------------- |
| parted         |    ✅     |    ✅    |   ✅   | Program for creating and modifying disk partitions.            |
| dosfstools     |    ✅     |    ✅    |   ✅   | Utilities for creating and checking FAT filesystems.           |
| ntfs-3g        |    ✅     |    ✅    |   ✅   | Driver for reading and writing NTFS partitions.                |
| mdadm          |    ✅     |    ✅    |   ✅   | Utility for managing software RAID arrays.                     |
| hdparm         |    ✅     |    ✅    |   ✅   | Utility for configuring and viewing hard disk parameters.      |
| sdparm         |    ✅     |    ✅    |   ✅   | Utility for accessing SCSI/SATA/SAS device parameters.         |
| btrfs-progs    |    ✅     |    ✅    |   ✅   | Utilities for working with Btrfs filesystem.                   |
| xfsprogs       |    ✅     |    ✅    |   ✅   | Utilities for working with XFS filesystem.                     |
| exfat-utils    |    ✅     |    ✅    |   ✅   | Utilities for exFAT filesystem (legacy implementation).        |
| exfat-fuse     |    ✅     |    ✅    |   ✅   | FUSE module for exFAT filesystem support.                      |
| exfatprogs     |    ✅     |    ✅    |   ✅   | Utilities for creating and checking exFAT filesystem.          |
| cifs-utils     |    ✅     |    ✅    |   ✅   | Utilities for mounting Windows network shares (Samba/CIFS).    |
| nfs-common     |    ✅     |    ✅    |   ✅   | Common files for NFS filesystem support (client).              |
| smartmontools  |    ✅     |    ✅    |   ✅   | Utilities for monitoring disk health via S.M.A.R.T.            |
| gpart          |    ❌     |    ✅    |   ✅   | Utility for "guessing" partition table on damaged disks.       |
| mtools         |    ❌     |    ✅    |   ✅   | Set of utilities for accessing floppies and MS-DOS partitions. |
| gddrescue      |    ❌     |    ✅    |   ✅   | Tool for copying data from damaged media.                      |
| zfsutils-linux |    ❌     |    ✅    |   ✅   | Utilities for managing ZFS pools and filesystem.               |
| davfs2         |    ❌     |    ✅    |   ✅   | Allows mounting WebDAV resources as local filesystem.          |
| f2fs-tools     |    ❌     |    ✅    |   ✅   | Utilities for working with F2FS filesystem.                    |
| hfsutils       |    ❌     |    ✅    |   ✅   | Utilities for working with "classic" Apple filesystem (HFS).   |
| hfsprogs       |    ❌     |    ✅    |   ✅   | Utilities for creating and checking HFS+ filesystem.           |
| jfsutils       |    ❌     |    ✅    |   ✅   | Utilities for working with JFS filesystem.                     |
| reiserfsprogs  |    ❌     |    ✅    |   ✅   | Utilities for working with ReiserFS (v3) filesystem.           |
| reiser4progs   |    ❌     |    ✅    |   ✅   | Utilities for working with Reiser4 filesystem.                 |
| udftools       |    ❌     |    ✅    |   ✅   | Utilities for working with UDF filesystem (DVD/Blu-ray).       |
| nilfs-tools    |    ❌     |    ✅    |   ✅   | Utilities for working with log-structured NILFS2 filesystem.   |
| sshfs          |    ❌     |    ✅    |   ✅   | Mount remote filesystem over SSH.                              |
| lvm2           |    ❌     |    ✅    |   ✅   | Logical Volume Manager.                                        |
| cryptsetup     |    ❌     |    ✅    |   ✅   | Utility for setting up encrypted partitions (LUKS).            |
| zulucrypt-cli  |    ❌     |    ✅    |   ✅   | CLI for managing encrypted volumes (LUKS, VeraCrypt, etc.).    |
| zulumount-cli  |    ❌     |    ✅    |   ✅   | CLI for mounting volumes managed by zulucrypt.                 |

### 💻 System utilities and monitoring

| Package        | Standard | Toolbox | Ultra | ℹ️ Package information                                             |
| :------------- | :------: | :-----: | :---: | :---------------------------------------------------------------- |
| pciutils       |    ✅     |    ✅    |   ✅   | Utilities for viewing PCI device information.                     |
| usbutils       |    ✅     |    ✅    |   ✅   | Utilities for viewing USB device information.                     |
| psmisc         |    ✅     |    ✅    |   ✅   | Set of utilities for working with processes (`fuser`, `killall`). |
| lsof           |    ✅     |    ✅    |   ✅   | Shows which files are used by which processes.                    |
| htop           |    ✅     |    ✅    |   ✅   | Interactive process monitor.                                      |
| rfkill         |    ✅     |    ✅    |   ✅   | Tool for enabling/disabling wireless devices.                     |
| file           |    ✅     |    ✅    |   ✅   | Determines file type.                                             |
| usb-modeswitch |    ✅     |    ✅    |   ✅   | Switches USB device modes (e.g., modems).                         |
| ncdu           |    ✅     |    ✅    |   ✅   | Disk usage analyzer with ncurses interface.                       |
| lshw           |    ❌     |    ✅    |   ✅   | Displays detailed hardware information.                           |
| screen         |    ❌     |    ✅    |   ✅   | Terminal multiplexer, allows managing sessions.                   |
| nmon           |    ❌     |    ✅    |   ✅   | Utility for monitoring system performance.                        |
| inxi           |    ❌     |    ✅    |   ✅   | Script for collecting and displaying detailed system information. |

### 🗜️ Archivers and compression

| Package      | Standard | Toolbox | Ultra | ℹ️ Package information                                          |
| :----------- | :------: | :-----: | :---: | :------------------------------------------------------------- |
| zip          |    ✅     |    ✅    |   ✅   | Archiver for creating and extracting .zip files.               |
| unzip        |    ✅     |    ✅    |   ✅   | Utility for extracting .zip archives.                          |
| xz-utils     |    ✅     |    ✅    |   ✅   | Utilities for data compression using LZMA/XZ algorithm.        |
| zstd         |    ✅     |    ✅    |   ✅   | Utility for data compression using Zstandard.                  |
| lz4          |    ✅     |    ✅    |   ✅   | Utility for very fast data compression.                        |
| liblz4-tools |    ✅     |    ✅    |   ✅   | Additional tools for lz4 format.                               |
| bzip2        |    ✅     |    ✅    |   ✅   | Utility for data compression using bzip2 algorithm.            |
| 7zip         |    ✅     |    ✅    |   ✅   | Powerful archiver with support for many formats, including 7z. |
| pv           |    ❌     |    ✅    |   ✅   | Utility for monitoring data transfer progress through pipe.    |
| pigz         |    ❌     |    ✅    |   ✅   | Parallel (multi-threaded) implementation of gzip.              |
| pixz         |    ❌     |    ✅    |   ✅   | Parallel indexable implementation of xz.                       |
| plzip        |    ❌     |    ✅    |   ✅   | Parallel implementation of lzip.                               |
| lrzip        |    ❌     |    ✅    |   ✅   | Long-range archiver, efficient for large files.                |
| lzop         |    ❌     |    ✅    |   ✅   | Very fast compression utility.                                 |
| pbzip2       |    ❌     |    ✅    |   ✅   | Parallel implementation of bzip2.                              |
| cabextract   |    ❌     |    ✅    |   ✅   | Utility for extracting Microsoft .cab archives.                |

### 🕵️ Recovery and forensics

| Package    | Standard | Toolbox | Ultra | ℹ️ Package information                                |
| :--------- | :------: | :-----: | :---: | :--------------------------------------------------- |
| clonezilla |    ❌     |    ✅    |   ✅   | Tool for disk cloning and backup.                    |
| testdisk   |    ❌     |    ✅    |   ✅   | Utility for recovering deleted partitions and files. |
| chntpw     |    ❌     |    ✅    |   ✅   | Utility for resetting Windows passwords.             |
| reglookup  |    ❌     |    ✅    |   ✅   | Utility for reading and analyzing Windows registry.  |
| hexedit    |    ❌     |    ✅    |   ✅   | Simple hexadecimal editor for console.               |

### ☁️ Virtualization and containers

| Package                | Standard | Toolbox | Ultra | ℹ️ Package information                                       |
| :--------------------- | :------: | :-----: | :---: | :---------------------------------------------------------- |
| open-vm-tools          |    ❌     |    ✅    |   ✅   | Set of utilities for improved VMware integration.           |
| hyperv-daemons         |    ❌     |    ✅    |   ✅   | Services for integration with Microsoft Hyper-V hypervisor. |
| qemu-system-x86        |    ❌     |    ✅    |   ✅   | Emulator for running x86/x86_64 operating systems.          |
| qemu-utils             |    ❌     |    ✅    |   ✅   | Utilities for working with QEMU disk images.                |
| libvirt-daemon-system  |    ❌     |    ✅    |   ✅   | Daemon for managing virtual machines.                       |
| virt-what              |    ❌     |    ✅    |   ✅   | Script for detecting if system is running in VM.            |
| uidmap                 |    ❌     |    ❌    |   ✅   | Utilities for working with user namespaces.                 |
| docker.io              |    ❌     |    ❌    |   ✅   | Application containerization platform.                      |
| docker-compose         |    ❌     |    ❌    |   ✅   | Tool for managing multi-container Docker applications.      |
| lazydocker             |    ❌     |    ❌    |   ✅   | Terminal UI for managing Docker and Docker Compose.         |
| selinux-policy-default |    ❌     |    ❌    |   ✅   | Default SELinux security policy.                            |

### 🧩 Miscellaneous

| Package        | Standard | Toolbox | Ultra | ℹ️ Package information                                                                  |
| :------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------------- |
| mc             |    ✅     |    ✅    |   ✅   | Midnight Commander file manager.                                                       |
| gpg            |    ✅     |    ✅    |   ✅   | GNU Privacy Guard - encryption and signing utility.                                    |
| gnupg          |    ✅     |    ✅    |   ✅   | Complete GNU Privacy Guard suite.                                                      |
| squashfs-tools |    ✅     |    ✅    |   ✅   | Utilities for creating and extracting SquashFS images.                                 |
| xorriso        |    ✅     |    ✅    |   ✅   | Utility for creating and burning ISO-9660 images.                                      |
| genisoimage    |    ✅     |    ✅    |   ✅   | Creates ISO-9660 filesystem images.                                                    |
| eject          |    ✅     |    ✅    |   ✅   | Utility for ejecting removable media (CD/DVD/USB).                                     |
| fuse3 / fuse   |    ✅     |    ✅    |   ✅   | Framework for creating userspace filesystems.                                          |
| libfuse2       |    ✅     |    ✅    |   ✅   | Compatibility library for legacy FUSE applications.                                    |
| memtest86+     |    ❌     |    ✅    |   ✅   | Program for testing RAM.                                                               |
| xmount         |    ❌     |    ✅    |   ✅   | Tool for mounting disk images of various formats.                                      |
| aria2          |    ❌     |    ✅    |   ✅   | Multi-protocol download manager.                                                       |
| fio            |    ❌     |    ✅    |   ✅   | Advanced tool for disk I/O performance testing and benchmarking (Flexible I/O Tester). |
| bonnie++       |    ❌     |    ✅    |   ✅   | Benchmark for testing filesystem performance.                                          |
| iozone3        |    ❌     |    ✅    |   ✅   | Benchmark for testing disk I/O performance.                                            |
| stress         |    ❌     |    ✅    |   ✅   | Tool for creating system load (CPU, memory, I/O).                                      |
| sysbench       |    ❌     |    ✅    |   ✅   | Comprehensive benchmark for testing CPU, memory, I/O, databases.                       |

## Firmware and drivers

### 📦 Drivers (DKMS)

| Package                 | Standard | Toolbox | Ultra | ℹ️ Package information                                                                                  |
| :---------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------------------------------------- |
| broadcom-sta-dkms       |    ✅     |    ✅    |   ✅   | Proprietary Broadcom 802.11 STA driver for Wi-Fi cards. Required for many laptops with Broadcom chips. |
| zfs-dkms                |    ❌     |    ✅    |   ✅   | Kernel modules for ZFS filesystem support.                                                             |
| realtek-rtl8821au-dkms  |    ✅     |    ✅    |   ✅   | DKMS driver for Realtek RTL8812AU/8821AU Wi-Fi chipsets.                                               |
| realtek-rtl88xxau-dkms  |    ✅     |    ✅    |   ✅   | DKMS driver for various Realtek RTL88xxAU series Wi-Fi chipsets.                                       |
| realtek-rtl8188eus-dkms |    ✅     |    ✅    |   ✅   | DKMS driver for Realtek RTL8188EUS Wi-Fi chipsets.                                                     |
| realtek-rtl8814au-dkms  |    ✅     |    ✅    |   ✅   | DKMS driver for Realtek RTL8814AU Wi-Fi chipsets.                                                      |

### 🔌 Firmware

| Package                  | Standard | Toolbox | Ultra | ℹ️ Package information                                                  |
| :----------------------- | :------: | :-----: | :---: | :--------------------------------------------------------------------- |
| firmware-linux-free      |    ✅     |    ✅    |   ✅   | Collection of free (license-wise) firmware for various hardware.       |
| firmware-linux-nonfree   |    ✅     |    ✅    |   ✅   | Metapackage including all non-free (proprietary) firmware.             |
| firmware-atheros         |    ✅     |    ✅    |   ✅   | Firmware for wireless network cards on Atheros chips.                  |
| firmware-iwlwifi         |    ✅     |    ✅    |   ✅   | Firmware for Intel Wireless (Wi-Fi) network cards.                     |
| firmware-zd1211          |    ✅     |    ✅    |   ✅   | Firmware for Wi-Fi devices based on ZyDAS ZD1211/ZD1211B.              |
| firmware-realtek         |    ✅     |    ✅    |   ✅   | Firmware for various Realtek devices (network cards, Bluetooth, etc.). |
| firmware-bnx2            |    ✅     |    ✅    |   ✅   | Firmware for Broadcom NetXtreme II network adapters.                   |
| firmware-brcm80211       |    ✅     |    ✅    |   ✅   | Firmware for Broadcom/Cypress 802.11 wireless cards.                   |
| firmware-cavium          |    ✅     |    ✅    |   ✅   | Firmware for Cavium network processors and adapters.                   |
| firmware-ipw2x00         |    ✅     |    ✅    |   ✅   | Firmware for legacy Intel Pro/Wireless 2100/2200/2915 cards.           |
| firmware-libertas        |    ✅     |    ✅    |   ✅   | Firmware for Marvell Libertas 8xxx wireless cards.                     |
| firmware-ti-connectivity |    ✅     |    ✅    |   ✅   | Firmware for Texas Instruments combo chips (Wi-Fi, Bluetooth).         |
| firmware-b43-installer   |    ✅     |    ✅    |   ✅   | Installer for Broadcom B43 legacy wireless card firmware.              |
| firmware-sof-signed      |    ✅     |    ✅    |   ✅   | Signed firmware for Sound Open Firmware platform (audio DSP).          |

## Basic GUI

### 🖥️ Graphics system (Xorg)

| Package                  | Standard | Toolbox | Ultra | ℹ️ Package information                                              |
| :----------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------- |
| xserver-xorg             |    ✅     |    ✅    |   ✅   | Main X.Org graphics system server.                                 |
| xserver-xorg-video-all   |    ✅     |    ✅    |   ✅   | Metapackage installing all 2D video drivers for X.Org.             |
| xserver-xorg-video-intel |    ✅     |    ✅    |   ✅   | Video driver for Intel integrated graphics.                        |
| xserver-xorg-input-all   |    ✅     |    ✅    |   ✅   | Metapackage installing all input device drivers (mouse, keyboard). |
| xinit                    |    ✅     |    ✅    |   ✅   | Utility for starting X server.                                     |
| xterm                    |    ✅     |    ✅    |   ✅   | Standard terminal emulator for X.                                  |
| blackbox or openbox      |    ✅     |    ✅    |   ✅   | Lightweight window managers.                                       |
| libxcursor1              |    ✅     |    ✅    |   ✅   | Library for working with X11 cursors.                              |
| breeze-cursor-theme      |    ✅     |    ✅    |   ✅   | Breeze cursor theme from KDE.                                      |
| x11-utils                |    ✅     |    ✅    |   ✅   | Set of basic X11 utilities.                                        |
| wmctrl                   |    ✅     |    ✅    |   ✅   | Utility for controlling windows from command line.                 |
| xdotool                  |    ✅     |    ✅    |   ✅   | Utility for simulating keyboard and mouse input.                   |
| libdrm-intel1            |    ✅     |    ✅    |   ✅   | Userspace library for Intel DRM (Direct Rendering Manager).        |
| libgl1-mesa-dri          |    ✅     |    ✅    |   ✅   | Free OpenGL implementation for direct rendering.                   |
| libglu1-mesa             |    ✅     |    ✅    |   ✅   | Mesa OpenGL utility library (GLU).                                 |

### 🔌 Remote access (XRDP)

| Package           | Standard | Toolbox | Ultra | ℹ️ Package information                                        |
| :---------------- | :------: | :-----: | :---: | :----------------------------------------------------------- |
| xrdp and xorgxrdp |    ❌     |    ✅    |   ✅   | Server for connecting to graphical desktop via RDP protocol. |

### 🎨 Interface components

| Package                      | Standard | Toolbox | Ultra | ℹ️ Package information                     |
| :--------------------------- | :------: | :-----: | :---: | :---------------------------------------- |
| librsvg2-common              |    ✅     |    ✅    |   ✅   | Library for rendering SVG images.         |
| adwaita-icon-theme-antix     |    ✅     |    ✅    |   ✅   | Adwaita icon theme.                       |
| elementary-minios-icon-theme |    ✅     |    ✅    |   ✅   | Special elementary icon theme for MiniOS. |

## XFCE

### 🖼️ Desktop environment (XFCE)

| Package               | Standard | Toolbox | Ultra | ℹ️ Package information                                                                   |
| :-------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------------------------------- |
| dbus-x11              |    ✅     |    ✅    |   ✅   | Starts D-Bus message bus in X11 session, necessary for inter-application communication. |
| libxfce4ui-utils      |    ✅     |    ✅    |   ✅   | Libraries with common widgets and utilities for XFCE interface.                         |
| thunar                |    ✅     |    ✅    |   ✅   | Default file manager in XFCE.                                                           |
| thunar-volman         |    ✅     |    ✅    |   ✅   | Manages automatic mounting of removable media in Thunar.                                |
| xfce4-appfinder       |    ✅     |    ✅    |   ✅   | Utility for quickly finding and launching applications.                                 |
| xfce4-panel           |    ✅     |    ✅    |   ✅   | XFCE desktop panel.                                                                     |
| xfce4-session         |    ✅     |    ✅    |   ✅   | XFCE session manager, controls session startup and shutdown.                            |
| xfce4-settings        |    ✅     |    ✅    |   ✅   | XFCE settings control center.                                                           |
| xfconf                |    ✅     |    ✅    |   ✅   | Configuration system for XFCE.                                                          |
| xfdesktop4            |    ✅     |    ✅    |   ✅   | Manages desktop: wallpapers, icons, menu.                                               |
| xfwm4                 |    ✅     |    ✅    |   ✅   | XFCE window manager.                                                                    |
| greybird-gtk-theme    |    ✅     |    ✅    |   ✅   | Popular and clean GTK theme, often used in XFCE.                                        |
| xfce4-xkb-plugin      |    ✅     |    ✅    |   ✅   | Panel plugin for switching keyboard layouts.                                            |
| xfce4-notifyd         |    ❌     |    ✅    |   ✅   | Daemon for displaying desktop notifications.                                            |
| menulibre             |    ❌     |    ✅    |   ✅   | Advanced menu editor for GTK environments.                                              |
| network-manager-gnome |    ✅     |    ✅    |   ✅   | Graphical applet for managing network connections (NetworkManager).                     |

### 🛠️ System and GUI utilities

| Package                   | Standard | Toolbox | Ultra | ℹ️ Package information                                                                             |
| :------------------------ | :------: | :-----: | :---: | :------------------------------------------------------------------------------------------------ |
| gvfs-backends             |    ✅     |    ✅    |   ✅   | Set of backends for GVfs, provides access to FTP, SFTP, SMB, etc. through file manager.           |
| open-vm-tools-desktop     |    ❌     |    ✅    |   ✅   | Components for improved guest OS integration with VMware (clipboard, resolution changes).         |
| gtk-update-icon-cache     |    ❌     |    ✅    |   ✅   | Utility for updating GTK icon theme cache.                                                        |
| libglib2.0-bin            |    ✅     |    ✅    |   ✅   | Binary utilities for GLib 2.0 library.                                                            |
| at-spi2-core              |    ✅     |    ✅    |   ✅   | Protocol and libraries for accessibility support (screen readers, etc.).                          |
| qt5/qt6-gtk-platformtheme |    ❌     |    ✅    |   ✅   | Plugins for Qt5/Qt6 applications to use GTK theme for consistent appearance.                      |
| policykit-1-gnome         |    ✅     |    ✅    |   ✅   | PolicyKit authentication agent for GTK environments, prompts for password for privileged actions. |
| libxml2-utils             |    ✅     |    ✅    |   ✅   | Command-line utilities for working with XML files (e.g., `xmllint`).                              |
| xmlstarlet                |    ✅     |    ✅    |   ✅   | Powerful command-line tool for parsing, transforming, and editing XML.                            |

### 🧰 Applications

| Package                        | Standard | Toolbox | Ultra | ℹ️ Package information                                                                                                   |
| :----------------------------- | :------: | :-----: | :---: | :---------------------------------------------------------------------------------------------------------------------- |
| minios-installer               |    ✅     |    ✅    |   ✅   | Graphical MiniOS system installer.                                                                                      |
| minios-configurator            |    ✅     |    ✅    |   ✅   | MiniOS system configurator.                                                                                             |
| mintstick                      |    ✅     |    ✅    |   ✅   | Utility for formatting USB drives and writing ISO images.                                                               |
| mousepad                       |    ✅     |    ✅    |   ✅   | Simple and fast text editor for XFCE.                                                                                   |
| ristretto                      |    ✅     |    ✅    |   ✅   | Simple and fast image viewer for XFCE.                                                                                  |
| **Web browsers**               |
| firefox-esr                    |    ✅     |    ✅    |   ✅   | Firefox web browser with Extended Support Release (ESR). Stable version receiving security updates for extended period. |
| **Multimedia**                 |
| vlc                            |    ❌     |    ✅    |   ✅   | Powerful and popular media player supporting many formats.                                                              |
| vlc-plugin-bittorrent          |    ❌     |    ✅    |   ✅   | VLC plugin for playing video directly from torrent files.                                                               |
| vlc-plugin-samba               |    ❌     |    ✅    |   ✅   | VLC plugin for accessing files on Samba (Windows) network shares.                                                       |
| vlc-l10n                       |    ❌     |    ✅    |   ✅   | Localization packages for VLC interface.                                                                                |
| gimp                           |    ❌     |    ❌    |   ✅   | Powerful raster graphics editor, Adobe Photoshop alternative.                                                           |
| obs-studio                     |    ❌     |    ❌    |   ✅   | Program for recording and streaming video from screen and other sources.                                                |
| obs-plugins                    |    ❌     |    ❌    |   ✅   | Additional plugins and effects for OBS Studio.                                                                          |
| inkscape                       |    ❌     |    ❌    |   ✅   | Professional vector graphics editor, Adobe Illustrator alternative.                                                     |
| blender                        |    ❌     |    ❌    |   ✅   | Professional 3D graphics, animation, and video creation suite.                                                          |
| audacity                       |    ❌     |    ❌    |   ✅   | Popular audio editor for recording and processing sound.                                                                |
| rawtherapee                    |    ❌     |    ❌    |   ✅   | Advanced editor for processing RAW photographs.                                                                         |
| **Office and Documents**       |
| pdfarranger                    |    ❌     |    ✅    |   ✅   | Simple utility for merging, splitting, and rearranging PDF pages.                                                       |
| libreoffice                    |    ❌     |    ❌    |   ✅   | Full office suite (word processor, spreadsheets, presentations).                                                        |
| libreoffice-gtk3               |    ❌     |    ❌    |   ✅   | LibreOffice integration with GTK3 theme for consistent appearance.                                                      |
| libreoffice-style-elementary   |    ❌     |    ❌    |   ✅   | Elementary icon theme for LibreOffice.                                                                                  |
| fonts-open-sans                |    ❌     |    ❌    |   ✅   | Popular and readable Open Sans font.                                                                                    |
| **System utilities (GUI)**     |
| gparted                        |    ❌     |    ✅    |   ✅   | Graphical disk partition editor.                                                                                        |
| gsmartcontrol                  |    ❌     |    ✅    |   ✅   | Graphical interface for smartmontools utility (disk monitoring).                                                        |
| baobab                         |    ❌     |    ✅    |   ✅   | Graphical disk usage analyzer.                                                                                          |
| hardinfo                       |    ❌     |    ✅    |   ✅   | Utility for collecting and displaying detailed system and hardware information.                                         |
| virt-manager                   |    ❌     |    ✅    |   ✅   | Graphical interface for managing virtual machines via libvirt.                                                          |
| gir1.2-spiceclientgtk-3.0      |    ❌     |    ✅    |   ✅   | Library for SPICE protocol integration (remote VM access).                                                              |
| doublecmd-gtk                  |    ❌     |    ✅    |   ✅   | Two-panel file manager similar to Total Commander.                                                                      |
| onboard                        |    ❌     |    ✅    |   ✅   | On-screen keyboard for people with disabilities.                                                                        |
| grsync                         |    ❌     |    ✅    |   ✅   | Graphical interface for powerful `rsync` synchronization utility.                                                       |
| rescuezilla                    |    ❌     |    ✅    |   ✅   | Simple tool for creating disk backups and recovery, Clonezilla alternative.                                             |
| kdiskmark                      |    ❌     |    ✅    |   ✅   | Tool for testing disk performance, CrystalDiskMark alternative.                                                         |
| qdiskinfo                      |    ❌     |    ✅    |   ✅   | Tool for displaying disk information, CrystalDiskInfo alternative.                                                      |
| bleachbit                      |    ❌     |    ✅    |   ✅   | Utility for cleaning system of temporary and unnecessary files.                                                         |
| gtkhash                        |    ❌     |    ✅    |   ✅   | Simple utility for calculating file hash sums.                                                                          |
| czkawka / czkawka-gui          |    ❌     |    ✅    |   ✅   | Utility for finding and removing duplicate files, empty folders, etc.                                                   |
| zulucrypt-gui                  |    ❌     |    ✅    |   ✅   | Graphical interface for managing encrypted volumes.                                                                     |
| zulumount-gui                  |    ❌     |    ✅    |   ✅   | Graphical interface for mounting encrypted volumes.                                                                     |
| keepassxc                      |    ❌     |    ✅    |   ✅   | Cross-platform password manager.                                                                                        |
| guymager                       |    ❌     |    ✅    |   ✅   | Tool for forensic disk copying (creating images).                                                                       |
| isomaster                      |    ❌     |    ✅    |   ✅   | Graphical editor for ISO disk images.                                                                                   |
| qphotorec                      |    ❌     |    ✅    |   ✅   | Graphical shell for PhotoRec utility (file recovery).                                                                   |
| veracrypt                      |    ❌     |    ✅    |   ✅   | Program for creating and managing encrypted containers and disks.                                                       |
| wxhexeditor                    |    ❌     |    ✅    |   ✅   | Advanced hexadecimal editor for large files.                                                                            |
| synaptic                       |    ❌     |    ❌    |   ✅   | Classic graphical package manager for Debian/Ubuntu.                                                                    |
| eddy / eddy-handler            |    ❌     |    ❌    |   ✅   | Simple graphical installer for local .deb packages.                                                                     |
| **Network applications (GUI)** |
| wireshark                      |    ❌     |    ✅    |   ✅   | Powerful network traffic analyzer.                                                                                      |
| remmina                        |    ❌     |    ✅    |   ✅   | Remote desktop client with RDP, VNC, SSH, and other protocol support.                                                   |
| remmina-plugin-rdp             |    ❌     |    ✅    |   ✅   | Plugin for RDP protocol support in Remmina.                                                                             |
| remmina-plugin-vnc             |    ❌     |    ✅    |   ✅   | Plugin for VNC protocol support in Remmina.                                                                             |
| gnome-nettool                  |    ❌     |    ✅    |   ✅   | Set of graphical network utilities (ping, traceroute, port scan).                                                       |
| zenmap                         |    ❌     |    ✅    |   ✅   | Official graphical interface for nmap network scanner.                                                                  |
| x11vnc                         |    ❌     |    ✅    |   ✅   | VNC server that allows remote control of current X session.                                                             |
| uget                           |    ❌     |    ✅    |   ✅   | Graphical download manager.                                                                                             |
| android-file-transfer          |    ❌     |    ✅    |   ✅   | Utility for transferring files from Android devices via MTP protocol.                                                   |
| **Development**                |
| codium                         |    ❌     |    ✅    |   ✅   | Free build of VS Code editor without Microsoft telemetry.                                                               |
