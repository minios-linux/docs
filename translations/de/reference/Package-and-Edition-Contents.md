---
updated: 2026-08-31
---

# Paket- und Editionsinhalte

Die MiniOS-Paketinhalte werden aus bedingten Quelllisten generiert. Die endgültige Zusammenstellung hängt von der Distribution, Architektur, dem Init-System, der Desktop-Umgebung, der Spracheinstellung, Kernel-Optionen und der Verfügbarkeit der Repositories ab. Diese Seite dokumentiert die für den Nutzer sichtbaren Pakete, die durch die gepflegten Flux- und Xfce-Manifeste angefordert werden. Build-only-Toolchains und durch APT eingebrachte Abhängigkeiten werden ausgelassen.

`Yes` bedeutet, dass das aktuelle Manifest das Paket für diese Edition anfordert.
`Conditional` bedeutet, dass der Paketname oder die Aufnahme von einer Build-Option oder Zielplattform abhängt. Ein Bindestrich bedeutet, dass die Edition es nicht anfordert.
Das fertige Abbild bleibt maßgeblich.

## Editionsübersicht

Die gepflegten Xfce-Editionen bauen aufeinander auf: Standard ist der kompakte Alltags-Desktop, Toolbox richtet sich an professionelle Systemadministration, Diagnose und Wiederherstellung, und Ultra erweitert diese Basis zu einem voll ausgestatteten Desktop für allgemeine Arbeit, Kreativität und Entwicklung. Flux ist eine eigenständige, ultraleichte Fluxbox-Konfiguration für minimalen Ressourcenverbrauch und ältere Hardware; es handelt sich nicht einfach um eine kleinere Xfce-Paketliste.

| Edition | Paketvariante und Umgebung | Hauptzweck |
|---|---|---|
| **Standard** | `standard` mit `xfce` | Minimaler Xfce-Alltagsdesktop mit Grundfunktionen |
| **Toolbox** | `toolbox` mit `xfce` | Professionelle Systemadministration, Diagnose und Wiederherstellung |
| **Ultra** | `ultra` mit `xfce` | Voll ausgestatteter Desktop für Arbeit, Kreativität und Entwicklung |
| **Flux** | `minimum` mit `flux` | Ultraleichter Fluxbox-Desktop für minimalen Ressourcenverbrauch und ältere Hardware |

Andere unterstützte Umgebungen verfügen über eigene Modulkettens und müssen separat geprüft werden. Insbesondere darf die Paketverfügbarkeit in einem LXQt- oder Konsolen-Build nicht aus den Xfce-Tabellen unten abgeleitet werden.

## Zentrale MiniOS- und Systempakete

Diese Pakete stellen die Laufzeitumgebung des Live-Systems, Konfiguration, Lokalisierung, Rechteverwaltung und die grundlegende Kommandozeilenumgebung bereit.

| Paket | Flux | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Ja | Ja | Ja | Ja | Modulerstellung, -konvertierung, -inspektion, -aktivierung und Änderungsprotokollierung |
| `minios-image-compose` | Ja | Ja | Ja | Ja | Kommandozeilen-MiniOS-ISO-Erstellung |
| `minios-live-config` | Ja | Ja | Ja | Ja | Komponenten zur Live-Session-Konfiguration |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Bedingt | Bedingt | Bedingt | Bedingt | Init-System-Integration; eine Implementierung wird ausgewählt |
| `minios-live-config-doc` | Ja | Ja | Ja | Ja | Referenz für installierte live-config |
| `minios-welcome` | Ja | Ja | Ja | Ja | MiniOS-Willkommensseite und Starter |
| `user-setup` | Ja | Ja | Ja | Ja | Live-Benutzerkontoeinrichtung |
| `linux-base` | Ja | Ja | Ja | Ja | Allgemeine Linux-Image- und Systemskripte |
| `kbd`, `keyboard-configuration`, `console-setup` | Ja | Ja | Ja | Ja | Tastatur- und Anzeige-Konfiguration für die Konsole |
| `locales` | Ja | Ja | Ja | Ja | Sprachdaten und -generierung |
| `network-manager` | Ja | Ja | Ja | Ja | Netzwerkverbindungsverwaltung |
| `netplan.io` | Bedingt | Bedingt | Bedingt | Bedingt | Nur auf unterstützten Ubuntu-Suites angefordert |
| `dracut-core` | Bedingt | Bedingt | Bedingt | Bedingt | Wird angefordert, wenn Dracut der Initramfs-Builder ist |
| `gpg`, `gnupg` | Ja | Ja | Ja | Ja | Paket- und Dateisignatur-Tools |
| `file`, `cpio` | Ja | Ja | Ja | Ja | Dateiidentifikation und Archivverwaltung |
| `gettext-base` / `gettext` | Bedingt | Bedingt | Bedingt | Bedingt | Übersetzungswerkzeuge je nach Verfügbarkeit |
| `polkitd` / `policykit-1`, `pkexec` | Bedingt | Bedingt | Bedingt | Bedingt | Rechteautorisierung und -erhöhung |
| `bash-completion` | Ja | Ja | Ja | Ja | Shell-Befehlsvervollständigung |
| `man-db` | Ja | Ja | Ja | Ja | Manpage-Reader und -Datenbank |
| `mc` | Ja | Ja | Ja | Ja | Midnight Commander Dateimanager |
| `gpm` | Ja | Ja | Ja | Ja | Mausunterstützung in der Konsole |
| `ssh` | Ja | Ja | Ja | Ja | OpenSSH-Client und -Server-Pakete, durch APT ausgewählt |
| `systemd-timesyncd` / `chrony` | Bedingt | Bedingt | Bedingt | Bedingt | Zeitsynchronisation je nach Suite und Init-System |
| `tlp` | Ja | Ja | Ja | Ja | Energiemanagement für Laptops |

Einige Bootstrap-Paritäts-Pakete werden nur für bestimmte Basissuites angefordert.
Sie sind Implementierungsabhängigkeiten und keine Editionsmerkmale und werden hier nicht einzeln aufgeführt.

## Netzwerkwerkzeuge

| Paket | Flux | Standard | Toolbox | Ultra | Zweck |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Ja | Ja | Ja | Ja | WPA/WPA2-WLAN-Authentifizierung |
| `rfkill` | Ja | Ja | Ja | Ja | Steuerung des WLAN-Gerätestatus |
| `usb-modeswitch` | Ja | Ja | Ja | Ja | USB-Modem- und Multi-Mode-Geräteumschaltung |
| `dnsmasq-base` | - | Ja | Ja | Ja | DNS- und DHCP-Unterstützung für Netzwerk-Workflows |
| `cifs-utils` | - | Ja | Ja | Ja | SMB/CIFS-Netzwerkdateisystem-Client |
| `nfs-common` | - | Ja | Ja | Ja | NFS-Client-Unterstützung |
| `ipset` | - | Ja | Ja | Ja | Kernel-IP-Set-Administration |
| `whois` | - | Ja | Ja | Ja | Domain- und Adressabfrage |
| `netcat`, `netcat-openbsd` | - | - | Ja | Ja | TCP- und UDP-Stream-Testwerkzeuge |
| `nmap`, `ncat`, `ndiff` | - | - | Ja | Ja | Netzwerkentdeckung, -übertragung und Scan-Vergleich |
| `iw` | - | - | Ja | Ja | WLAN-Geräte- und Linkkonfiguration |
| `iperf3` | - | - | Ja | Ja | Netzwerkdurchsatz-Tests |
| `aria2` | - | - | Ja | Ja | Multi-Protokoll-Download-Utility |
| `davfs2` | - | - | Ja | Ja | WebDAV-Dateisystem-Client |
| `sshfs` | - | - | Ja | Ja | Dateisystemzugriff über SSH |
| `open-iscsi` | - | - | - | Ja | iSCSI-Initiator |
| `tgt` | - | - | - | Ja | iSCSI-Target-Service |

## Speicher und Dateisysteme

| Paket | Flux | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Ja | Ja | Ja | Ja | ATA- und SCSI-Geräteinspektion und -optimierung |
| `mdadm` | Ja | Ja | Ja | Ja | Linux-Software-RAID-Verwaltung |
| `smartmontools` | Ja | Ja | Ja | Ja | S.M.A.R.T.-Überwachung und Tests |
| `dosfstools` | Ja | Ja | Ja | Ja | FAT-Dateisystem-Erstellung und -Überprüfung |
| `ntfs-3g` | Ja | Ja | Ja | Ja | NTFS-Userspace-Treiber und Werkzeuge |
| `btrfs-progs` | Ja | Ja | Ja | Ja | Btrfs-Administration |
| `xfsprogs` | - | Ja | Ja | Ja | XFS-Administration |
| `exfatprogs` / `exfat-utils` mit `exfat-fuse` | - | Bedingt | Bedingt | Bedingt | exFAT-Implementierung je nach Paketverfügbarkeit |
| `fuse3` / `fuse`, `libfuse2` | - | Bedingt | Bedingt | Bedingt | FUSE-Laufzeit und Kompatibilitätsbibliothek |
| `dynfilefs` | - | Bedingt | Bedingt | Bedingt | Segmentierter Persistenzspeicher auf unterstützten Suites |
| `parted` | - | Ja | Ja | Ja | Partitionstabellen-Erstellung und -Bearbeitung |
| `gpart` | - | - | Ja | Ja | Partitionstabellen-Wiederherstellung |
| `mtools` | - | - | Ja | Ja | FAT- und DOS-Medienwerkzeuge |
| `gddrescue` | - | - | Ja | Ja | Fehlertolerantes Blockgeräte-Kopieren |
| `lvm2` | - | - | Ja | Ja | Logical Volume Manager |
| `cryptsetup` | - | - | Ja | Ja | LUKS-Volume-Verwaltung |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Ja | Ja | Verwaltung und Einbindung verschlüsselter Volumes |
| `f2fs-tools` | - | - | Ja | Ja | F2FS-Administration |
| `hfsutils`, `hfsprogs` | - | - | Ja | Ja | HFS- und HFS+-Werkzeuge, sofern verfügbar |
| `jfsutils` | - | - | Ja | Ja | JFS-Administration |
| `reiserfsprogs`, `reiser4progs` | - | - | Ja | Ja | ReiserFS- und Reiser4-Werkzeuge, sofern verfügbar |
| `udftools` | - | - | Ja | Ja | UDF-Optical-Media-Dateisystem-Tools |
| `nilfs-tools` | - | - | Ja | Ja | NILFS2-Administration |
| `zfsutils-linux` | - | - | Bedingt | Bedingt | ZFS-Userspace-Tools, wenn der Kernel ZFS unterstützt |

## Archive und Abbildformate

| Paket | Flux | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Ja | Ja | Ja | Ja | Komprimierung für Pakete, Module und Abbilder |
| `zip`, `unzip` | Ja | Ja | Ja | Ja | ZIP-Archiv-Erstellung und -Extraktion |
| `xorriso` | Ja | Ja | Ja | Ja | ISO-Erstellung und -Inspektion |
| `squashfs-tools` | Ja | Ja | Ja | Ja | SquashFS-Modulerstellung und -Extraktion |
| `lz4` / `liblz4-tools` | - | Bedingt | Bedingt | Bedingt | LZ4-Implementierung je nach Verfügbarkeit |
| `bzip2` | - | Ja | Ja | Ja | bzip2-Komprimierung |
| `7zip` | - | Ja | Ja | Ja | 7z und verwandte Archivformate |
| `genisoimage` | - | Ja | Ja | Ja | ISO-9660-Abbilderstellung |
| `pv` | - | - | Ja | Ja | Fortschrittsanzeige für Pipelines |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Ja | Ja | Parallele Komprimierungswerkzeuge |
| `lrzip`, `lzop` | - | - | Ja | Ja | Zusätzliche Komprimierungsformate |
| `cabextract` | - | - | Ja | Ja | Microsoft Cabinet-Archiv-Extraktion |
| `xmount` | - | - | Ja | Ja | Konvertierung und Einbindung von Festplattenabbild-Formaten |

## Wiederherstellung, Diagnose und Performance

| Paket | Flux | Standard | Toolbox | Ultra | Zweck |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Ja | Ja | Ja | Ja | PCI- und USB-Geräteinspektion |
| `psmisc` | Ja | Ja | Ja | Ja | Prozesswerkzeuge wie `fuser` und `killall` |
| `htop` | - | Ja | Ja | Ja | Interaktiver Prozessmonitor |
| `ncdu` | - | Ja | Ja | Ja | Terminalbasierter Speicherplatz-Analysator |
| `lsof` | - | Ja | Ja | Ja | Offene Dateien und Prozesse inspizieren |
| `clonezilla` | - | - | Ja | Ja | Klonen von Festplatten und Partitionen |
| `partclone`, `partimage` | - | - | Ja | Ja | Dateisystembewusste Imaging-Tools |
| `testdisk` | - | - | Ja | Ja | Wiederherstellung von Partitionen und Dateien |
| `chntpw`, `reglookup` | - | - | Ja | Ja | Offline-Windows-Konto- und Registry-Tools |
| `hexedit` | - | - | Ja | Ja | Terminal-Hexadezimaleditor |
| `lshw`, `inxi` | - | - | Ja | Ja | Detaillierte Hardware- und Systemberichte |
| `screen` | - | - | Ja | Ja | Terminal-Multiplexer |
| `nmon` | - | - | Ja | Ja | Interaktiver Performance-Monitor |
| `fio`, `bonnie++`, `iozone3` | - | - | Ja | Ja | Speicher- und Dateisystem-Benchmarks |
| `stress`, `sysbench` | - | - | Ja | Ja | CPU-, Speicher- und System-Benchmarks |
| `memtest86+` | - | - | Ja | Ja | Speichertest beim Systemstart |
| `rsync` | - | - | Ja | Ja | Dateisynchronisations- und Kopierwerkzeug |

## Virtualisierung und Container

| Paket | Flux | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Ja | Ja | VMware- und QEMU-Gastintegration |
| `virtualbox-guest-utils` | - | - | Bedingt | Bedingt | VirtualBox-Gastintegration auf ausgewählten Suites |
| `hyperv-daemons` | - | - | Ja | Ja | Microsoft Hyper-V-Gastdienste |
| `qemu-system-x86`, `qemu-utils` | - | - | Ja | Ja | Virtuelle Maschinen-Laufzeit und Abbildwerkzeuge |
| `libvirt-daemon-system` | - | - | Ja | Ja | System-libvirt-Dienst |
| `virt-what` | - | - | Ja | Ja | Hypervisor-Erkennung |
| `uidmap` | - | - | - | Ja | User-Namespace-ID-Zuordnung |
| Docker CE Stack / `docker.io` mit `docker-compose` | - | - | - | Bedingt | Container-Laufzeit, aus dem verfügbaren Repository ausgewählt |
| `lazydocker` | - | - | - | Ja | Terminal-Interface für Docker |
| `selinux-policy-default` | - | - | - | Ja | Standard-SELinux-Policy-Paket |

## Firmware und Kernel-Treiber

Die Firmware-Auswahl richtet sich nach dem Distributionsprofil: Debian- und Devuan-Builds nutzen aufgeteilte Firmware-Pakete, während Ubuntu-Builds `linux-firmware` verwenden. DKMS-Treiber werden außerdem nach Architektur, Kernel-Anbieter, Kernel-Serie und bereits durch den gewählten Kernel bereitgestellten Funktionen gefiltert.

| Paket | Editionen | Zweck oder Bedingung |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Bedingt, alle | Debian- und Devuan-Firmware-Sammlungen |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Bedingt, alle | Drahtlos-Firmware für Atheros-, Intel- und ZyDAS-Geräte |
| `firmware-realtek`, `firmware-mediatek` | Bedingt, alle | Realtek- und MediaTek-Firmware; MediaTek abhängig von Suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Bedingt, alle | Broadcom- und Cavium-Netzwerk-Firmware |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Bedingt, alle | Weitere drahtlose Firmware-Familien |
| `firmware-b43-installer` | Bedingt, alle | Legacy Broadcom B43 Firmware-Installer |
| `firmware-sof-signed` | Bedingt, alle | Sound Open Firmware Images |
| `linux-firmware` | Bedingt, alle | Ubuntu-Firmware-Sammlung |
| `ntfs3-dkms` | Bedingt, alle | NTFS3-Treiber, wenn dieser nicht im gewählten Kernel enthalten ist |
| `aufs-dkms` / `aufs-ng-dkms` | Bedingt, alle | AUFS-Treiber, ausgewählt nach Suite und Kernel |
| `broadcom-sta-dkms` | Bedingt, alle | Broadcom STA WLAN-Treiber auf unterstützten Systemen |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Bedingt, alle | Hersteller-WLAN-Treiber, gefiltert nach Kernel-Fähigkeiten und Zielplattform |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Bedingt, alle | Hersteller-Treiber auf unterstützten Systemen für zusätzliche Geräte oder Funktionen |
| `zfs-dkms` | Bedingt, Toolbox und Ultra | ZFS-Kernelmodul auf unterstützten amd64-Builds |

## Grafische Basis

Die grafischen Umgebungen teilen sich die unten aufgeführte Xorg- und Rendering-Basis. Flux verwendet anschließend seine eigene Desktop-Liste; Standard, Toolbox und Ultra nutzen die gepflegte Xfce-Liste.

| Paket | Flux | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Ja | Ja | Ja | Ja | X.Org-Server und Startwerkzeuge |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Ja | Ja | Ja | Ja | X.Org-Videotreiber |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Ja | Ja | Ja | Ja | Eingabegeräte-Treiber und Legacy-Startunterstützung |
| `xterm` | Ja | Ja | Ja | Ja | Einfaches X-Terminal |
| `blackbox` / `openbox` | Bedingt | Bedingt | Bedingt | Bedingt | Leichtgewichtiger Fallback-Window-Manager, je nach Umgebung |
| `x11-utils`, `wmctrl`, `xdotool` | Ja | Ja | Ja | Ja | X11-Inspektion und Fensterautomatisierung |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Ja | Ja | Ja | Ja | DRM- und Mesa-Rendering-Bibliotheken |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Ja | Ja | Ja | Ja | Cursor- und Icon-Themes |
| `elementary-minios-icon-theme` | Ja | Ja | Ja | Ja | MiniOS-Icon-Theme außerhalb von LXQt |
| `librsvg2-common` | Ja | Ja | Ja | Ja | SVG-Rendering-Unterstützung |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Bedingt | Bedingt | Bedingt | Bedingt | Grafischer PolicyKit-Agent, je nach Verfügbarkeit |
| `xrdp`, `xorgxrdp` | - | - | Ja | Ja | Grafische Fernanmeldung über RDP |

## Flux-Desktop und Anwendungen

| Paket | Zweck oder Bedingung |
|---|---|
| `fluxbox-flux` | MiniOS Fluxbox-Fenstermanager-Konfiguration |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panel und Tastatur-Layout-Anzeige |
| `xwallpaper`, `gpicview` / `feh` | Hintergrundbild- und Bildanzeige |
| `compton` | X-Compositor |
| `alsa-utils`, `volumeicon-alsa` | ALSA-Audiosteuerung |
| `systrayicon`, `cbatticon` | Tray- und Batterieanzeige |
| `xlunch`, `gtkask`, `flux-tools` | Starter und MiniOS Flux-Desktop-Helfer |
| `scrot` | Screenshot-Tool |
| `mousepad`, `pcmanfm` | Texteditor und Dateimanager |
| `galculator`, `lxtask`, `xarchiver` | Rechner, Aufgabenmanager und Archivmanager |
| `network-manager-gnome` | NetworkManager-Desktop-Applet |
| `firefox` / `firefox-esr` | Browser je nach Suite, mit ausgewählten Lokalisierungspaketen |

## Xfce-Desktop und MiniOS-Anwendungen

| Paket | Standard | Toolbox | Ultra | Zweck oder Bedingung |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Ja | Ja | Ja | Dateimanager und Integration von Wechselmedien |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Ja | Ja | Ja | Xfce-Panel-, Sitzungs- und Einstellungsdienste |
| `xfdesktop4`, `xfwm4`, `xfconf` | Ja | Ja | Ja | Desktop, Fenstermanager und Konfigurationsdienst |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Ja | Ja | Ja | Anwendungsfinder und Tastaturanzeige |
| `mousepad`, `ristretto` | Ja | Ja | Ja | Texteditor und Bildbetrachter |
| `at-spi2-core`, `dbus-x11` | Ja | Ja | Ja | Barrierefreiheit und Desktop-Message-Bus-Unterstützung |
| `gvfs-backends` | Ja | Ja | Ja | Integration von Remote- und Wechseldateisystemen für den Dateimanager |
| `lightdm`, `lightdm-gtk-greeter` | Ja | Ja | Ja | Grafischer Login-Manager |
| `network-manager-gnome`, `blueman` | Ja | Ja | Ja | Netzwerk- und Bluetooth-Desktop-Steuerung |
| `avahi-daemon` | Ja | Ja | Ja | Lokale Netzwerkdienst-Erkennung |
| PipeWire-Stack / PulseAudio-Stack | Bedingt | Bedingt | Bedingt | Desktop-Audio, je nach Suite ausgewählt |
| `pavucontrol` | Ja | Ja | Ja | Grafischer Audiomixer |
| `engrampa`, `thunar-archive-plugin` | Ja | Ja | Ja | Archivmanager und Dateimanager-Integration |
| `xfce4-screensaver`, `xfce4-screenshooter` | Ja | Ja | Ja | Bildschirmsperre und Screenshots |
| `xfce4-power-manager-plugins` | Ja | Ja | Ja | Xfce-Energiemanagement-Integration |
| `xfce4-taskmanager`, `xfce4-terminal` | Ja | Ja | Ja | Aufgabenmanager und Terminalemulator |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Ja | Ja | Ja | Anwendungsmenü und Benachrichtigungen |
| `minios-configurator` | Ja | Ja | Ja | MiniOS-Boot- und Sitzungs-Konfigurationseditor |
| `minios-installer` | Ja | Ja | Ja | Grafischer Installer und `minios-deploy` CLI |
| `minios-session-manager` | Ja | Ja | Ja | Persistenter Sitzungsmanager und `minios-session` CLI |
| `minios-kernel-manager` | Ja | Ja | Ja | Modularer Kernel-Manager und `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Ja | Ja | Ja | MiniOS-Anwendungskatalog und Installer |
| `minios-image-builder` | Ja | Ja | Ja | Grafische ISO-Remastering-Umgebung |
| `minios-module-manager` | Ja | Ja | Ja | Grafischer `.sb` Modulmanager |
| `minios-help` | Ja | Ja | Ja | Installierter MiniOS-Dokumentationsbetrachter |
| `driveutility` | Ja | Ja | Ja | Schreiben, Lesen, Formatieren und Löschen von Festplattenabbildern |
| `firefox` / `firefox-esr` | Bedingt | Bedingt | Bedingt | Browser und Lokalisierung je nach Suite und Spracheinstellung |
| `menulibre` | - | Ja | Ja | Grafischer Menüeditor |
| `open-vm-tools-desktop` | - | Ja | Ja | VMware-Desktop-Integration |
| `virtualbox-guest-x11` | - | Bedingt | Bedingt | VirtualBox-Desktop-Integration auf ausgewählten Suites |
| Qt-GTK-Plattform-Themes | - | Ja | Ja | GTK-Designintegration für Qt-Anwendungen |

## Toolbox-Grafikanwendungen

Das Xfce-`05-apps`-Modul ist für Toolbox und Ultra enthalten und wird für Standard übersprungen.

| Paket | Zweck oder Bedingung |
|---|---|
| `gparted` | Grafischer Partitionseditor |
| `gsmartcontrol`, `qdiskinfo` | Festplattenzustand und Geräteinformationen |
| `guymager`, `qphotorec` | Forensisches Imaging und Dateiwiederherstellung; `qphotorec` ist auf Buster und Beowulf ausgeschlossen |
| `kdiskmark` | Festplatten-Benchmark |
| `isomaster` | ISO-Image-Editor |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Hardware- und Grafikdiagnose |
| `baobab` | Grafischer Speicherplatz-Analysator |
| `doublecmd-gtk` | Zwei-Spalten-Dateimanager |
| `grsync` | Grafisches `rsync`-Frontend |
| `bleachbit` | Cache- und Temporärdatei-Bereinigung |
| `czkawka` / `czkawka-gui` | Duplikat- und unerwünschte Datei-Finder |
| `gtkhash` | Prüfsummenrechner |
| `wxhexeditor` | Hexadezimaleditor für große Dateien |
| `keepassxc` | Passwortmanager |
| `veracrypt` | Verwaltung verschlüsselter Container und Laufwerke; ausgeschlossen auf Buster und Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Grafische Tools für verschlüsselte Volumes |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Verwaltung virtueller Maschinen und SPICE-Anzeigeunterstützung |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Remote-Desktop-Client |
| `wireshark`, `zenmap`, `gnome-nettool` | Grafische Netzwerkanalyse und -diagnose |
| `x11vnc` | VNC-Zugriff auf die aktuelle X-Sitzung |
| `uget` | Grafischer Download-Manager |
| `android-file-transfer` | Android-MTP-Dateiübertragung |
| `vlc` und ausgewählte Plugins | Medienwiedergabe, Lokalisierung, Samba- und BitTorrent-Unterstützung |
| `pdfarranger` | PDF-Seitenanordnung |
| `codium` | Code-Editor |
| `onboard` | Bildschirmtastatur |
| `galculator` | Rechner |

## Ultra-Anwendungen

Ultra enthält alle Toolbox-Anwendungen und ergänzt sie um:

| Paket | Zweck |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Office-Suite und Desktop-Integration |
| `gimp` | Rastergrafikeditor |
| `inkscape` | Vektorgrafikeditor |
| `blender` | 3D-Design-Suite |
| `audacity` | Audioeditor |
| `obs-studio`, `obs-plugins` | Bildschirmaufnahme und Streaming |
| `rawtherapee` | RAW-Foto-Entwicklung |
| `synaptic` | Grafischer Paketmanager |
| `eddy`, `eddy-handler` | Lokaler Debian-Paketinstaller, sofern verfügbar |
| `fonts-open-sans` | Open Sans-Schriftfamilie |

## Installierte Pakete prüfen

Das laufende System ist maßgeblich für tatsächlich installierte Pakete. Paketnamen und Versionen können mit folgendem Befehl aufgelistet werden:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Quell-Build-Manifeste

Die obigen Paket-Tabellen werden aus dem [`minios-live`-Buildsystem](https://github.com/minios-linux/minios-live) abgeleitet. Die unten stehenden Pfade sind relativ zum Wurzelverzeichnis dieses Quell-Repositories und relevant, wenn ein Abbild aus dem Quellcode gebaut oder angepasst wird:

- `linux-live/environments/<environment>/` definiert die geordnete Modulkette.
- `linux-live/scripts/00-core/packages.list` definiert die gemeinsame Basis und Paketvarianten-Ergänzungen.
- `linux-live/scripts/01-kernel/packages.list` definiert Kernel-Build- und DKMS-Pakete nach Bedingung.
- `linux-live/scripts/02-firmware/packages.list` definiert distributionsspezifische Firmware.
- `linux-live/scripts/03-gui-base/packages.list` definiert die gemeinsame grafische Basis.
- `linux-live/scripts/04-flux-desktop/packages.list` und `05-flux-apps/packages.list` definieren Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` definiert Xfce und MiniOS-Desktop-Tools.
- `linux-live/scripts/05-apps/packages.list` definiert Toolbox- und Ultra-Grafikanwendungen.
- `linux-live/scripts/10-firefox/packages.list` definiert die suite- und sprachspezifischen Browserpakete.
- Die `install`- und `skip_conditions.conf`-Dateien jedes Moduls bestimmen, ob und wie dessen Paketliste verwendet wird.
- `linux-live/build.conf` wählt Suite, Architektur, Umgebung, Paketvariante, Init-System, Kernel und Spracheinstellung.
- `linux-live/condinapt.map` definiert Präfixe für Paketlisten-Bedingungen.

Quelllisten beschreiben angeforderte Pakete und Alternativen. Nur das fertige Abbild und `dpkg-query` zeigen die aufgelöste Abhängigkeitsmenge und exakte Versionen für eine bestimmte Veröffentlichung.

Siehe [Systemarchitektur](/reference/System-Architecture) für die Modulreihenfolge und [CondinAPT in MiniOS](/development/CondinAPT) für die bedingte Paketauswahl.
