# MiniOS Paketliste

Dieses Dokument bietet einen umfassenden Überblick über alle Pakete, die in den verschiedenen MiniOS-Editionen enthalten sind. MiniOS ist in drei Haupteditionen erhältlich, die jeweils unterschiedliche vorinstallierte Softwarepakete bieten:

- **Standard** – Minimales System mit grundlegender Funktionalität
- **Toolbox** – Systemverwaltungs- und Diagnosetools
- **Ultra** – Vollständige Desktop-Umgebung mit Anwendungen

## Konsolenprogramme und Systempakete

### ⚙️ Zentrale Systempakete

| Paket                         | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                      |
| :---------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------- |
| minios-tools                  |    ✅     |    ✅    |   ✅   | Zentrale Tools und Skripte für MiniOS.                    |
| minios-welcome                |    ✅     |    ✅    |   ✅   | Willkommensnachricht im Browser.                          |
| minios-live-config            |    ✅     |    ✅    |   ✅   | Konfigurationsskripte für das Live-System.                |
| minios-live-config-systemd    |    ✅     |    ✅    |   ✅   | Live-System-Konfiguration für systemd.                    |
| minios-live-config-doc        |    ✅     |    ✅    |   ✅   | Dokumentation zu minios-live-config.                      |
| user-setup                    |    ✅     |    ✅    |   ✅   | Dienstprogramm zur Benutzerkonfiguration.                 |
| linux-base                    |    ✅     |    ✅    |   ✅   | Basisskripte für das Linux-System.                        |
| kbd                           |    ✅     |    ✅    |   ✅   | Tools zur Verwaltung des Tastaturlayouts in der Konsole.  |
| keyboard-configuration        |    ✅     |    ✅    |   ✅   | System zur Tastaturkonfiguration.                         |
| locales                       |    ✅     |    ✅    |   ✅   | Bibliotheken und Daten für Lokalisierung (Sprachunterstützung). |
| console-setup                 |    ✅     |    ✅    |   ✅   | Konfiguration von Konsolenschriftarten und Zeichencodierung. |
| systemd-timesyncd             |    ✅     |    ✅    |   ✅   | Dienst zur Netzwerksynchronisation der Systemzeit.        |
| polkitd / policykit-1 / pkexec|    ✅     |    ✅    |   ✅   | Framework zur Verwaltung von Systemdienst-Berechtigungen. |

### 📦 Paket- und Softwareverwaltung

| Paket              | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                         |
| :----------------- | :------: | :-----: | :---: | :----------------------------------------------------------- |
| apt-transport-https|    ✅     |    ✅    |   ✅   | Ermöglicht die Nutzung von Repositories über das HTTPS-Protokoll. |
| gettext-base       |    ✅     |    ✅    |   ✅   | Tools für Internationalisierung und Lokalisierung von Software. |
| man-db             |    ✅     |    ✅    |   ✅   | System zum Anzeigen von Handbuchseiten (man).                |
| bash-completion    |    ✅     |    ✅    |   ✅   | Bietet automatische Befehlsvervollständigung in der Bash-Shell. |

### 🌐 Netzwerk-Tools

| Paket                      | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                         |
| :------------------------- | :------: | :-----: | :---: | :----------------------------------------------------------- |
| network-manager / connman  |    ✅     |    ✅    |   ✅   | Netzwerkverwalter für Verbindungen.                          |
| dnsmasq-base               |    ✅     |    ✅    |   ✅   | Leichter DNS- und DHCP-Server (Basisdateien).                |
| wpasupplicant              |    ✅     |    ✅    |   ✅   | Tool zur Verbindung mit sicheren WLAN-Netzen (WPA/WPA2).     |
| iputils-ping               |    ✅     |    ✅    |   ✅   | `ping`-Dienstprogramm zur Überprüfung der Erreichbarkeit.    |
| ssh                        |    ✅     |    ✅    |   ✅   | Client und Server für sichere Fernverbindungen (SSH).         |
| wget                       |    ✅     |    ✅    |   ✅   | Tool zum Herunterladen von Dateien aus dem Netzwerk.         |
| curl                       |    ✅     |    ✅    |   ✅   | Tool für Datentransfer über verschiedene Protokolle.         |
| ipset                      |    ✅     |    ✅    |   ✅   | Verwaltung von IP-Adresslisten im Kernel.                    |
| whois                      |    ✅     |    ✅    |   ✅   | Client zur Abfrage von Domain- und IP-Informationen.         |
| nmap                       |    ❌     |    ✅    |   ✅   | Leistungsstarker Netzwerkscanner und Security-Audit-Tool.    |
| ncat                       |    ❌     |    ✅    |   ✅   | Erweiterte Version von `netcat` aus der nmap-Suite.          |
| ndiff                      |    ❌     |    ✅    |   ✅   | Tool zum Vergleichen von nmap-Scan-Ergebnissen.              |
| iperf3                     |    ❌     |    ✅    |   ✅   | Tool zur Messung der Netzwerkbandbreite.                     |
| netcat                     |    ❌     |    ✅    |   ✅   | Netzwerk-Tool zum Lesen/Schreiben von Daten über TCP/IP.     |
| netcat-openbsd             |    ❌     |    ✅    |   ✅   | Alternative `netcat`-Implementierung von OpenBSD.            |
| open-iscsi                 |    ❌     |    ❌    |   ✅   | Client (Initiator) für die Arbeit mit iSCSI-Speicher.        |
| tgt                        |    ❌     |    ❌    |   ✅   | Server (Target) zur Bereitstellung von iSCSI-Speicher.       |

### 💾 Festplatten- und Dateisystemverwaltung

| Paket         | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                              |
| :------------ | :------: | :-----: | :---: | :--------------------------------------------------------------- |
| parted        |    ✅     |    ✅    |   ✅   | Programm zum Erstellen und Bearbeiten von Partitionen.           |
| dosfstools    |    ✅     |    ✅    |   ✅   | Tools zum Erstellen und Überprüfen von FAT-Dateisystemen.        |
| ntfs-3g       |    ✅     |    ✅    |   ✅   | Treiber für Lese-/Schreibzugriff auf NTFS-Partitionen.           |
| mdadm         |    ✅     |    ✅    |   ✅   | Tool zur Verwaltung von Software-RAID-Arrays.                    |
| hdparm        |    ✅     |    ✅    |   ✅   | Dienstprogramm zur Konfiguration und Anzeige von Festplattenparametern. |
| sdparm        |    ✅     |    ✅    |   ✅   | Tool zum Zugriff auf SCSI/SATA/SAS-Geräteeinstellungen.          |
| btrfs-progs   |    ✅     |    ✅    |   ✅   | Tools für das Arbeiten mit dem Btrfs-Dateisystem.                |
| xfsprogs      |    ✅     |    ✅    |   ✅   | Tools für das Arbeiten mit dem XFS-Dateisystem.                  |
| exfat-utils   |    ✅     |    ✅    |   ✅   | Tools für exFAT-Dateisystem (veraltete Implementierung).         |
| exfat-fuse    |    ✅     |    ✅    |   ✅   | FUSE-Modul für exFAT-Unterstützung.                              |
| exfatprogs    |    ✅     |    ✅    |   ✅   | Tools zum Erstellen und Überprüfen von exFAT-Dateisystemen.      |
| cifs-utils    |    ✅     |    ✅    |   ✅   | Tools zum Einbinden von Windows-Freigaben (Samba/CIFS).          |
| nfs-common    |    ✅     |    ✅    |   ✅   | Gemeinsame Dateien für NFS-Unterstützung (Client).               |
| smartmontools |    ✅     |    ✅    |   ✅   | Tools zur Überwachung des Festplattenzustands via S.M.A.R.T.     |
| gpart         |    ❌     |    ✅    |   ✅   | Tool zum „Erraten“ von Partitionstabellen auf beschädigten Datenträgern. |
| mtools        |    ❌     |    ✅    |   ✅   | Toolsammlung für Zugriff auf Disketten und MS-DOS-Partitionen.   |
| gddrescue     |    ❌     |    ✅    |   ✅   | Tool zum Kopieren von Daten von beschädigten Datenträgern.       |
| zfsutils-linux|    ❌     |    ✅    |   ✅   | Tools zur Verwaltung von ZFS-Pools und Dateisystemen.            |
| davfs2        |    ❌     |    ✅    |   ✅   | Erlaubt das Einbinden von WebDAV-Ressourcen als lokales Dateisystem. |
| f2fs-tools    |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit dem F2FS-Dateisystem.                 |
| hfsutils      |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit dem „klassischen“ Apple-Dateisystem (HFS). |
| hfsprogs      |    ❌     |    ✅    |   ✅   | Tools zum Erstellen und Überprüfen von HFS+-Dateisystemen.       |
| jfsutils      |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit dem JFS-Dateisystem.                  |
| reiserfsprogs |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit dem ReiserFS (v3)-Dateisystem.        |
| reiser4progs  |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit dem Reiser4-Dateisystem.              |
| udftools      |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit UDF-Dateisystemen (DVD/Blu-ray).      |
| nilfs-tools   |    ❌     |    ✅    |   ✅   | Tools für das Arbeiten mit log-strukturiertem NILFS2-Dateisystem.|
| sshfs         |    ❌     |    ✅    |   ✅   | Entferntes Dateisystem über SSH einbinden.                       |
| lvm2          |    ❌     |    ✅    |   ✅   | Logical Volume Manager.                                          |
| cryptsetup    |    ❌     |    ✅    |   ✅   | Tool zur Einrichtung verschlüsselter Partitionen (LUKS).         |
| zulucrypt-cli |    ❌     |    ✅    |   ✅   | CLI zur Verwaltung verschlüsselter Volumes (LUKS, VeraCrypt, etc.). |
| zulumount-cli |    ❌     |    ✅    |   ✅   | CLI zum Einbinden von Volumes, die von zulucrypt verwaltet werden. |

### 💻 Systemwerkzeuge und Überwachung

| Paket         | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                             |
| :------------ | :------: | :-----: | :---: | :--------------------------------------------------------------- |
| pciutils      |    ✅     |    ✅    |   ✅   | Tools zur Anzeige von PCI-Geräteinformationen.                   |
| usbutils      |    ✅     |    ✅    |   ✅   | Tools zur Anzeige von USB-Geräteinformationen.                   |
| psmisc        |    ✅     |    ✅    |   ✅   | Toolsammlung für Prozessverwaltung (`fuser`, `killall`).         |
| lsof          |    ✅     |    ✅    |   ✅   | Zeigt, welche Dateien von welchen Prozessen genutzt werden.      |
| htop          |    ✅     |    ✅    |   ✅   | Interaktiver Prozessmonitor.                                     |
| rfkill        |    ✅     |    ✅    |   ✅   | Tool zum Aktivieren/Deaktivieren von Funkgeräten.                |
| file          |    ✅     |    ✅    |   ✅   | Bestimmt den Dateityp.                                           |
| usb-modeswitch|    ✅     |    ✅    |   ✅   | Schaltet USB-Gerätemodi um (z. B. Modems).                       |
| ncdu          |    ✅     |    ✅    |   ✅   | Festplattenbelegungsanalyse mit ncurses-Oberfläche.              |
| lshw          |    ❌     |    ✅    |   ✅   | Zeigt detaillierte Hardwareinformationen an.                     |
| screen        |    ❌     |    ✅    |   ✅   | Terminal-Multiplexer, ermöglicht Sitzungsverwaltung.             |
| nmon          |    ❌     |    ✅    |   ✅   | Tool zur Überwachung der Systemleistung.                         |
| inxi          |    ❌     |    ✅    |   ✅   | Skript zur Sammlung und Anzeige detaillierter Systeminformationen.|

### 🗜️ Archivierung und Komprimierung

| Paket        | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                         |
| :----------- | :------: | :-----: | :---: | :----------------------------------------------------------- |
| zip          |    ✅     |    ✅    |   ✅   | Archivierungsprogramm zum Erstellen und Entpacken von .zip-Dateien. |
| unzip        |    ✅     |    ✅    |   ✅   | Tool zum Entpacken von .zip-Archiven.                        |
| xz-utils     |    ✅     |    ✅    |   ✅   | Tools zur Datenkomprimierung mit LZMA/XZ-Algorithmus.        |
| zstd         |    ✅     |    ✅    |   ✅   | Tool zur Datenkomprimierung mit Zstandard.                   |
| lz4          |    ✅     |    ✅    |   ✅   | Sehr schnelles Komprimierungstool.                           |
| liblz4-tools |    ✅     |    ✅    |   ✅   | Zusätzliche Tools für das lz4-Format.                        |
| bzip2        |    ✅     |    ✅    |   ✅   | Tool zur Datenkomprimierung mit bzip2-Algorithmus.           |
| 7zip         |    ✅     |    ✅    |   ✅   | Leistungsstarker Archivierer mit Unterstützung vieler Formate, inkl. 7z. |
| pv           |    ❌     |    ✅    |   ✅   | Tool zur Anzeige des Fortschritts beim Datentransfer durch eine Pipe. |
| pigz         |    ❌     |    ✅    |   ✅   | Parallele (multithreaded) gzip-Implementierung.              |
| pixz         |    ❌     |    ✅    |   ✅   | Parallele, indexierbare xz-Implementierung.                   |
| plzip        |    ❌     |    ✅    |   ✅   | Parallele Implementierung von lzip.                           |
| lrzip        |    ❌     |    ✅    |   ✅   | Langstrecken-Archivierer, effizient für große Dateien.        |
| lzop         |    ❌     |    ✅    |   ✅   | Sehr schnelles Komprimierungstool.                            |
| pbzip2       |    ❌     |    ✅    |   ✅   | Parallele Implementierung von bzip2.                          |
| cabextract   |    ❌     |    ✅    |   ✅   | Tool zum Entpacken von Microsoft .cab-Archiven.               |

### 🕵️ Wiederherstellung und Forensik

| Paket      | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                |
| :--------- | :------: | :-----: | :---: | :-------------------------------------------------- |
| clonezilla |    ❌     |    ✅    |   ✅   | Tool zum Klonen und Sichern von Festplatten.         |
| testdisk   |    ❌     |    ✅    |   ✅   | Tool zur Wiederherstellung gelöschter Partitionen und Dateien. |
| chntpw     |    ❌     |    ✅    |   ✅   | Tool zum Zurücksetzen von Windows-Passwörtern.       |
| reglookup  |    ❌     |    ✅    |   ✅   | Tool zum Lesen und Analysieren der Windows-Registry. |
| hexedit    |    ❌     |    ✅    |   ✅   | Einfacher Hexadezimaleditor für die Konsole.         |

### ☁️ Virtualisierung und Container

| Paket                  | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                         |
| :--------------------- | :------: | :-----: | :---: | :---------------------------------------------------------- |
| open-vm-tools          |    ❌     |    ✅    |   ✅   | Toolsammlung für bessere VMware-Integration.                |
| hyperv-daemons         |    ❌     |    ✅    |   ✅   | Dienste zur Integration mit Microsoft Hyper-V Hypervisor.   |
| qemu-system-x86        |    ❌     |    ✅    |   ✅   | Emulator zum Ausführen von x86/x86_64-Betriebssystemen.     |
| qemu-utils             |    ❌     |    ✅    |   ✅   | Tools für die Arbeit mit QEMU-Festplattenabbildern.         |
| libvirt-daemon-system  |    ❌     |    ✅    |   ✅   | Daemon zur Verwaltung von virtuellen Maschinen.              |
| virt-what              |    ❌     |    ✅    |   ✅   | Skript zur Erkennung, ob das System in einer VM läuft.      |
| uidmap                 |    ❌     |    ❌    |   ✅   | Tools für die Arbeit mit User-Namespaces.                   |
| docker.io              |    ❌     |    ❌    |   ✅   | Plattform für Containerisierung von Anwendungen.             |
| docker-compose         |    ❌     |    ❌    |   ✅   | Tool zur Verwaltung von Multi-Container-Docker-Anwendungen. |
| lazydocker             |    ❌     |    ❌    |   ✅   | Terminal-Oberfläche zur Verwaltung von Docker und Docker Compose. |
| selinux-policy-default |    ❌     |    ❌    |   ✅   | Standard-SELinux-Sicherheitsrichtlinie.                     |

### 🧩 Verschiedenes

| Paket         | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                                  |
| :------------ | :------: | :-----: | :---: | :----------------------------------------------------------------------------------- |
| mc            |    ✅     |    ✅    |   ✅   | Dateimanager Midnight Commander.                                                     |
| gpg           |    ✅     |    ✅    |   ✅   | GNU Privacy Guard – Tool zum Verschlüsseln und Signieren.                            |
| gnupg         |    ✅     |    ✅    |   ✅   | Komplette GNU Privacy Guard Suite.                                                   |
| squashfs-tools|    ✅     |    ✅    |   ✅   | Tools zum Erstellen und Entpacken von SquashFS-Abbildern.                            |
| xorriso       |    ✅     |    ✅    |   ✅   | Tool zum Erstellen und Brennen von ISO-9660-Abbildern.                               |
| genisoimage   |    ✅     |    ✅    |   ✅   | Erstellt ISO-9660-Dateisystemabbilder.                                               |
| eject         |    ✅     |    ✅    |   ✅   | Tool zum Auswerfen von Wechselmedien (CD/DVD/USB).                                   |
| fuse3 / fuse  |    ✅     |    ✅    |   ✅   | Framework zur Erstellung von Userspace-Dateisystemen.                                |
| libfuse2      |    ✅     |    ✅    |   ✅   | Kompatibilitätsbibliothek für ältere FUSE-Anwendungen.                               |
| memtest86+    |    ❌     |    ✅    |   ✅   | Programm zum Testen des Arbeitsspeichers.                                            |
| xmount        |    ❌     |    ✅    |   ✅   | Tool zum Einbinden von Datenträgerabbildern verschiedener Formate.                   |
| aria2         |    ❌     |    ✅    |   ✅   | Multi-Protokoll Download-Manager.                                                    |
| fio           |    ❌     |    ✅    |   ✅   | Fortgeschrittenes Tool für Festplatten-I/O-Performance-Tests und Benchmarking (Flexible I/O Tester). |
| bonnie++      |    ❌     |    ✅    |   ✅   | Benchmark zum Testen der Dateisystem-Performance.                                    |
| iozone3       |    ❌     |    ✅    |   ✅   | Benchmark zum Testen der Festplatten-I/O-Leistung.                                   |
| stress        |    ❌     |    ✅    |   ✅   | Tool zur Erzeugung von Systemlast (CPU, RAM, I/O).                                   |
| sysbench      |    ❌     |    ✅    |   ✅   | Umfassender Benchmark für CPU, RAM, I/O, Datenbanken.                                |

## Firmware und Treiber

### 📦 Treiber (DKMS)

| Paket                    | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                                                 |
| :----------------------- | :------: | :-----: | :---: | :--------------------------------------------------------------------------------------------------- |
| broadcom-sta-dkms        |    ✅     |    ✅    |   ✅   | Proprietärer Broadcom 802.11 STA-Treiber für WLAN-Karten. Erforderlich für viele Laptops mit Broadcom-Chips. |
| zfs-dkms                 |    ❌     |    ✅    |   ✅   | Kernel-Module für ZFS-Dateisystem-Unterstützung.                                                    |
| realtek-rtl8821au-dkms   |    ✅     |    ✅    |   ✅   | DKMS-Treiber für Realtek RTL8812AU/8821AU WLAN-Chipsätze.                                           |
| realtek-rtl88xxau-dkms   |    ✅     |    ✅    |   ✅   | DKMS-Treiber für verschiedene Realtek RTL88xxAU WLAN-Chipsätze.                                     |
| realtek-rtl8188eus-dkms  |    ✅     |    ✅    |   ✅   | DKMS-Treiber für Realtek RTL8188EUS WLAN-Chipsätze.                                                 |
| realtek-rtl8814au-dkms   |    ✅     |    ✅    |   ✅   | DKMS-Treiber für Realtek RTL8814AU WLAN-Chipsätze.                                                  |

### 🔌 Firmware

| Paket                   | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                  |
| :---------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------------- |
| firmware-linux-free     |    ✅     |    ✅    |   ✅   | Sammlung von freier (lizenzrechtlich) Firmware für verschiedene Hardware. |
| firmware-linux-nonfree  |    ✅     |    ✅    |   ✅   | Metapaket mit sämtlicher nicht-freier (proprietärer) Firmware.         |
| firmware-atheros        |    ✅     |    ✅    |   ✅   | Firmware für WLAN-Karten mit Atheros-Chips.                            |
| firmware-iwlwifi        |    ✅     |    ✅    |   ✅   | Firmware für Intel Wireless (WLAN)-Karten.                             |
| firmware-zd1211         |    ✅     |    ✅    |   ✅   | Firmware für WLAN-Geräte mit ZyDAS ZD1211/ZD1211B.                     |
| firmware-realtek        |    ✅     |    ✅    |   ✅   | Firmware für verschiedene Realtek-Geräte (Netzwerkkarten, Bluetooth, etc.). |
| firmware-bnx2           |    ✅     |    ✅    |   ✅   | Firmware für Broadcom NetXtreme II Netzwerkkarten.                     |
| firmware-brcm80211      |    ✅     |    ✅    |   ✅   | Firmware für Broadcom/Cypress 802.11 WLAN-Karten.                      |
| firmware-cavium         |    ✅     |    ✅    |   ✅   | Firmware für Cavium Netzwerkprozessoren und Adapter.                   |
| firmware-ipw2x00        |    ✅     |    ✅    |   ✅   | Firmware für ältere Intel Pro/Wireless 2100/2200/2915 Karten.          |
| firmware-libertas       |    ✅     |    ✅    |   ✅   | Firmware für Marvell Libertas 8xxx WLAN-Karten.                        |
| firmware-ti-connectivity|    ✅     |    ✅    |   ✅   | Firmware für Texas Instruments Kombi-Chips (WLAN, Bluetooth).          |
| firmware-b43-installer  |    ✅     |    ✅    |   ✅   | Installer für Broadcom B43 Legacy-WLAN-Firmware.                       |
| firmware-sof-signed     |    ✅     |    ✅    |   ✅   | Signierte Firmware für die Sound Open Firmware Plattform (Audio DSP).  |

## Basis-GUI

### 🖥️ Grafiksystem (Xorg)

| Paket                   | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                               |
| :---------------------- | :------: | :-----: | :---: | :----------------------------------------------------------------- |
| xserver-xorg            |    ✅     |    ✅    |   ✅   | Hauptserver des X.Org-Grafiksystems.                               |
| xserver-xorg-video-all  |    ✅     |    ✅    |   ✅   | Metapaket zur Installation aller 2D-Videotreiber für X.Org.        |
| xserver-xorg-video-intel|    ✅     |    ✅    |   ✅   | Videotreiber für Intel-Grafiklösungen.                             |
| xserver-xorg-input-all  |    ✅     |    ✅    |   ✅   | Metapaket zur Installation aller Eingabegerätetreiber (Maus, Tastatur). |
| xinit                   |    ✅     |    ✅    |   ✅   | Tool zum Starten des X-Servers.                                    |
| xterm                   |    ✅     |    ✅    |   ✅   | Standard-Terminalemulator für X.                                   |
| blackbox oder openbox   |    ✅     |    ✅    |   ✅   | Schlanke Fenstermanager.                                           |
| libxcursor1             |    ✅     |    ✅    |   ✅   | Bibliothek zur Arbeit mit X11-Cursorn.                             |
| breeze-cursor-theme     |    ✅     |    ✅    |   ✅   | Breeze-Cursor-Theme von KDE.                                       |
| x11-utils               |    ✅     |    ✅    |   ✅   | Sammlung grundlegender X11-Tools.                                  |
| wmctrl                  |    ✅     |    ✅    |   ✅   | Tool zur Fenstersteuerung über die Kommandozeile.                  |
| xdotool                 |    ✅     |    ✅    |   ✅   | Tool zum Simulieren von Tastatur- und Mauseingaben.                |
| libdrm-intel1           |    ✅     |    ✅    |   ✅   | Userspace-Bibliothek für Intel DRM (Direct Rendering Manager).     |
| libgl1-mesa-dri         |    ✅     |    ✅    |   ✅   | Freie OpenGL-Implementierung für direktes Rendering.               |
| libglu1-mesa            |    ✅     |    ✅    |   ✅   | Mesa OpenGL Utility Library (GLU).                                 |

### 🔌 Fernzugriff (XRDP)

| Paket            | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                        |
| :--------------- | :------: | :-----: | :---: | :---------------------------------------------------------- |
| xrdp und xorgxrdp |    ❌     |    ✅    |   ✅   | Server für die Verbindung zum grafischen Desktop über das RDP-Protokoll. |

### 🎨 Interface-Komponenten

| Paket                       | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                     |
| :-------------------------- | :------: | :-----: | :---: | :--------------------------------------- |
| librsvg2-common             |    ✅     |    ✅    |   ✅   | Bibliothek zum Rendern von SVG-Bildern.  |
| adwaita-icon-theme-antix    |    ✅     |    ✅    |   ✅   | Adwaita-Icon-Theme.                     |
| elementary-minios-icon-theme|    ✅     |    ✅    |   ✅   | Spezielles elementary-Icon-Theme für MiniOS. |

## XFCE

### 🖼️ Desktop-Umgebung (XFCE)

| Paket                | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                                   |
| :------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------------- |
| dbus-x11             |    ✅     |    ✅    |   ✅   | Startet den D-Bus-Nachrichtenbus in der X11-Sitzung, notwendig für die Kommunikation zwischen Anwendungen. |
| libxfce4ui-utils     |    ✅     |    ✅    |   ✅   | Bibliotheken mit gemeinsamen Widgets und Tools für die XFCE-Oberfläche.                |
| thunar               |    ✅     |    ✅    |   ✅   | Standard-Dateimanager in XFCE.                                                         |
| thunar-volman        |    ✅     |    ✅    |   ✅   | Automatisches Einbinden von Wechselmedien in Thunar.                                   |
| xfce4-appfinder      |    ✅     |    ✅    |   ✅   | Tool zum schnellen Finden und Starten von Anwendungen.                                 |
| xfce4-panel          |    ✅     |    ✅    |   ✅   | XFCE-Desktop-Panel.                                                                    |
| xfce4-session        |    ✅     |    ✅    |   ✅   | XFCE-Sitzungsmanager, steuert Start und Beenden der Sitzung.                           |
| xfce4-settings       |    ✅     |    ✅    |   ✅   | XFCE-Einstellungszentrum.                                                              |
| xfconf               |    ✅     |    ✅    |   ✅   | Konfigurationssystem für XFCE.                                                         |
| xfdesktop4           |    ✅     |    ✅    |   ✅   | Desktop-Verwaltung: Hintergründe, Symbole, Menü.                                       |
| xfwm4                |    ✅     |    ✅    |   ✅   | XFCE-Fenstermanager.                                                                   |
| greybird-gtk-theme   |    ✅     |    ✅    |   ✅   | Beliebtes und schlichtes GTK-Theme, oft in XFCE genutzt.                               |
| xfce4-xkb-plugin     |    ✅     |    ✅    |   ✅   | Panel-Plugin zum Umschalten von Tastaturlayouts.                                       |
| xfce4-notifyd        |    ❌     |    ✅    |   ✅   | Daemon zur Anzeige von Desktop-Benachrichtigungen.                                     |
| menulibre            |    ❌     |    ✅    |   ✅   | Erweiterter Menüeditor für GTK-Umgebungen.                                             |
| network-manager-gnome|    ✅     |    ✅    |   ✅   | Grafisches Applet zur Verwaltung von Netzwerkverbindungen (NetworkManager).            |

### 🛠️ System- und GUI-Werkzeuge

| Paket                    | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                                             |
| :----------------------- | :------: | :-----: | :---: | :---------------------------------------------------------------------------------------------- |
| gvfs-backends            |    ✅     |    ✅    |   ✅   | Backends für GVfs, ermöglicht Zugriff auf FTP, SFTP, SMB usw. über den Dateimanager.            |
| open-vm-tools-desktop    |    ❌     |    ✅    |   ✅   | Komponenten für bessere Gastintegration mit VMware (Zwischenablage, Auflösungsänderungen).      |
| gtk-update-icon-cache    |    ❌     |    ✅    |   ✅   | Tool zum Aktualisieren des GTK-Icon-Theme-Caches.                                               |
| libglib2.0-bin           |    ✅     |    ✅    |   ✅   | Binäre Tools für die GLib 2.0-Bibliothek.                                                       |
| at-spi2-core             |    ✅     |    ✅    |   ✅   | Protokoll und Bibliotheken für Barrierefreiheit (Screenreader usw.).                            |
| qt5/qt6-gtk-platformtheme|    ❌     |    ✅    |   ✅   | Plugins für Qt5/Qt6-Anwendungen zur Nutzung des GTK-Themes für ein einheitliches Erscheinungsbild. |
| policykit-1-gnome        |    ✅     |    ✅    |   ✅   | PolicyKit-Authentifizierungsagent für GTK-Umgebungen, fragt nach Passwort für privilegierte Aktionen. |
| libxml2-utils            |    ✅     |    ✅    |   ✅   | Kommandozeilen-Tools zur Arbeit mit XML-Dateien (z. B. `xmllint`).                             |
| xmlstarlet               |    ✅     |    ✅    |   ✅   | Leistungsstarkes Kommandozeilen-Tool zum Parsen, Transformieren und Bearbeiten von XML.         |

### 🧰 Anwendungen

| Paket                         | Standard | Toolbox | Ultra | ℹ️ Paketinformationen                                                                                                   |
| :---------------------------- | :------: | :-----: | :---: | :--------------------------------------------------------------------------------------------------------------------- |
| minios-installer              |    ✅     |    ✅    |   ✅   | Grafischer MiniOS-System-Installer.                                                                                    |
| minios-configurator           |    ✅     |    ✅    |   ✅   | MiniOS-Systemkonfigurator.                                                                                             |
| mintstick                     |    ✅     |    ✅    |   ✅   | Tool zum Formatieren von USB-Sticks und Schreiben von ISO-Abbildern.                                                   |
| mousepad                      |    ✅     |    ✅    |   ✅   | Einfacher und schneller Texteditor für XFCE.                                                                           |
| ristretto                     |    ✅     |    ✅    |   ✅   | Einfacher und schneller Bildbetrachter für XFCE.                                                                       |
| **Webbrowser**                |
| firefox-esr                   |    ✅     |    ✅    |   ✅   | Firefox-Webbrowser mit Extended Support Release (ESR). Stabile Version mit Sicherheitsupdates über längeren Zeitraum.  |
| **Multimedia**                |
| vlc                           |    ❌     |    ✅    |   ✅   | Leistungsstarker und beliebter Mediaplayer mit Unterstützung vieler Formate.                                            |
| vlc-plugin-bittorrent         |    ❌     |    ✅    |   ✅   | VLC-Plugin zum direkten Abspielen von Videos aus Torrent-Dateien.                                                      |
| vlc-plugin-samba              |    ❌     |    ✅    |   ✅   | VLC-Plugin für Zugriff auf Dateien in Samba (Windows)-Freigaben.                                                       |
| vlc-l10n                      |    ❌     |    ✅    |   ✅   | Lokalisierungspakete für die VLC-Oberfläche.                                                                           |
| gimp                          |    ❌     |    ❌    |   ✅   | Leistungsstarker Rastergrafik-Editor, Alternative zu Adobe Photoshop.                                                  |
| obs-studio                    |    ❌     |    ❌    |   ✅   | Programm zum Aufnehmen und Streamen von Video vom Bildschirm und anderen Quellen.                                      |
| obs-plugins                   |    ❌     |    ❌    |   ✅   | Zusätzliche Plugins und Effekte für OBS Studio.                                                                         |
| inkscape                      |    ❌     |    ❌    |   ✅   | Professioneller Vektorgrafik-Editor, Alternative zu Adobe Illustrator.                                                  |
| blender                       |    ❌     |    ❌    |   ✅   | Professionelle 3D-Grafik-, Animations- und Videosuite.                                                                 |
| audacity                      |    ❌     |    ❌    |   ✅   | Beliebter Audio-Editor zum Aufnehmen und Bearbeiten von Ton.                                                           |
| rawtherapee                   |    ❌     |    ❌    |   ✅   | Fortgeschrittener Editor zur Bearbeitung von RAW-Fotos.                                                                |
| **Office und Dokumente**      |
| pdfarranger                   |    ❌     |    ✅    |   ✅   | Einfaches Tool zum Zusammenfügen, Teilen und Neuordnen von PDF-Seiten.                                                 |
| libreoffice                   |    ❌     |    ❌    |   ✅   | Vollständiges Office-Paket (Textverarbeitung, Tabellen, Präsentationen).                                               |
| libreoffice-gtk3              |    ❌     |    ❌    |   ✅   | LibreOffice-Integration mit GTK3-Theme für einheitliches Erscheinungsbild.                                             |
| libreoffice-style-elementary  |    ❌     |    ❌    |   ✅   | Elementary-Icon-Theme für LibreOffice.                                                                                 |
| fonts-open-sans               |    ❌     |    ❌    |   ✅   | Beliebte und gut lesbare Open Sans Schriftart.                                                                         |
| **Systemwerkzeuge (GUI)**     |
| gparted                       |    ❌     |    ✅    |   ✅   | Grafischer Editor für Festplattenpartitionen.                                                                          |
| gsmartcontrol                 |    ❌     |    ✅    |   ✅   | Grafische Oberfläche für das smartmontools-Tool (Festplattenüberwachung).                                              |
| baobab                        |    ❌     |    ✅    |   ✅   | Grafischer Festplattenbelegungsanalysator.                                                                             |
| hardinfo                      |    ❌     |    ✅    |   ✅   | Tool zur Sammlung und Anzeige detaillierter System- und Hardwareinformationen.                                          |
| virt-manager                  |    ❌     |    ✅    |   ✅   | Grafische Oberfläche zur Verwaltung virtueller Maschinen über libvirt.                                                  |
| gir1.2-spiceclientgtk-3.0     |    ❌     |    ✅    |   ✅   | Bibliothek für SPICE-Protokollintegration (Remote-VM-Zugriff).                                                         |
| doublecmd-gtk                 |    ❌     |    ✅    |   ✅   | Zweispaltiger Dateimanager ähnlich Total Commander.                                                                    |
| onboard                       |    ❌     |    ✅    |   ✅   | Bildschirmtastatur für Menschen mit Behinderungen.                                                                     |
| grsync                        |    ❌     |    ✅    |   ✅   | Grafische Oberfläche für das leistungsstarke Synchronisationstool `rsync`.                                             |
| rescuezilla                   |    ❌     |    ✅    |   ✅   | Einfaches Tool zum Erstellen von Festplattensicherungen und Wiederherstellung, Alternative zu Clonezilla.              |
| kdiskmark                     |    ❌     |    ✅    |   ✅   | Tool zum Testen der Festplattenleistung, Alternative zu CrystalDiskMark.                                               |
| qdiskinfo                     |    ❌     |    ✅    |   ✅   | Tool zur Anzeige von Festplatteninformationen, Alternative zu CrystalDiskInfo.                                          |
| bleachbit                     |    ❌     |    ✅    |   ✅   | Tool zum Bereinigen des Systems von temporären und unnötigen Dateien.                                                   |
| gtkhash                       |    ❌     |    ✅    |   ✅   | Einfaches Tool zur Berechnung von Dateiprüfsummen.                                                                     |
| czkawka / czkawka-gui         |    ❌     |    ✅    |   ✅   | Tool zum Finden und Entfernen von doppelten Dateien, leeren Ordnern usw.                                               |
| zulucrypt-gui                 |    ❌     |    ✅    |   ✅   | Grafische Oberfläche zur Verwaltung verschlüsselter Volumes.                                                            |
| zulumount-gui                 |    ❌     |    ✅    |   ✅   | Grafische Oberfläche zum Einbinden verschlüsselter Volumes.                                                             |
| keepassxc                     |    ❌     |    ✅    |   ✅   | Plattformübergreifender Passwortmanager.                                                                               |
| guymager                      |    ❌     |    ✅    |   ✅   | Tool zum forensischen Kopieren von Datenträgern (Image-Erstellung).                                                    |
| isomaster                     |    ❌     |    ✅    |   ✅   | Grafischer Editor für ISO-Abbilder.                                                                                    |
| qphotorec                     |    ❌     |    ✅    |   ✅   | Grafische Oberfläche für das Tool PhotoRec (Dateiwiederherstellung).                                                   |
| veracrypt                     |    ❌     |    ✅    |   ✅   | Programm zum Erstellen und Verwalten verschlüsselter Container und Datenträger.                                        |
| wxhexeditor                   |    ❌     |    ✅    |   ✅   | Fortgeschrittener Hexadezimaleditor für große Dateien.                                                                 |
| synaptic                      |    ❌     |    ❌    |   ✅   | Klassischer grafischer Paketmanager für Debian/Ubuntu.                                                                 |
| eddy / eddy-handler           |    ❌     |    ❌    |   ✅   | Einfacher grafischer Installer für lokale .deb-Pakete.                                                                 |
| **Netzwerkanwendungen (GUI)** |
| wireshark                     |    ❌     |    ✅    |   ✅   | Leistungsstarker Netzwerk-Traffic-Analysator.                                                                          |
| remmina                       |    ❌     |    ✅    |   ✅   | Remote-Desktop-Client mit Unterstützung für RDP, VNC, SSH und weitere Protokolle.                                      |
| remmina-plugin-rdp            |    ❌     |    ✅    |   ✅   | Plugin für RDP-Unterstützung in Remmina.                                                                               |
| remmina-plugin-vnc            |    ❌     |    ✅    |   ✅   | Plugin für VNC-Unterstützung in Remmina.                                                                               |
| gnome-nettool                 |    ❌     |    ✅    |   ✅   | Sammlung grafischer Netzwerktools (ping, traceroute, Portscan).                                                        |
| zenmap                        |    ❌     |    ✅    |   ✅   | Offizielle grafische Oberfläche für den nmap-Netzwerkscanner.                                                          |
| x11vnc                        |    ❌     |    ✅    |   ✅   | VNC-Server, der die Fernsteuerung der aktuellen X-Sitzung ermöglicht.                                                  |
| uget                          |    ❌     |    ✅    |   ✅   | Grafischer Download-Manager.                                                                                           |
| android-file-transfer         |    ❌     |    ✅    |   ✅   | Tool zum Übertragen von Dateien von Android-Geräten über das MTP-Protokoll.                                            |
| **Entwicklung**               |
| codium                        |    ❌     |    ✅    |   ✅   | Freier Build des VS Code-Editors ohne Microsoft-Telemetrie.                                                            |
