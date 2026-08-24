# Pakete und Editionen

Die Inhalte der MiniOS-Pakete werden aus bedingten Quelllisten generiert. Sie variieren je nach Distributionssuite, Architektur, Init-System, Desktop-Umgebung, Spracheinstellung, Kernel-Optionen und Verfügbarkeit der Repositories. Diese Seite beschreibt die Vererbung der Editionen und repräsentative Inhalte; sie stellt keine vollständige Paketübersicht für alle Releases dar.

## Editionsvererbung

Die Paketvarianten bauen additiv aufeinander auf:

1. **Minimum** bietet das gemeinsame Live-System und die kleinste ausgewählte Desktop-Umgebung.
2. **Standard** erbt Minimum und ergänzt allgemeine Verwaltungs-, Desktop- und MiniOS-Management-Tools.
3. **Toolbox** erbt Standard und fügt Werkzeuge für Wiederherstellung, Diagnose, Speicher, Netzwerk und Virtualisierung hinzu.
4. **Ultra** erbt Toolbox und erweitert um umfangreichere Workstation-, Medien-, Office- und Container-Software.

Bedingte Ausdrücke können Alternativen auswählen oder ein Paket für eine Suite, Architektur, Umgebung oder Build-Option auslassen. Ein unten genanntes Paket steht daher repräsentativ für die aktuellen Quelllisten und garantiert nicht, dass der gleiche Debian-Binärpaketname in jeder MiniOS-Version existiert.

## Desktop- und Umgebungsscope

Desktop-Pakete stammen aus der geordneten Modulkette der gewählten Umgebung. Die Umgebungen Xfce, Fluxbox, LXQt, Core und Debug enthalten nicht identische Module oder Paketsätze. Die folgenden Beispiele orientieren sich an den aktuellen Xfce-Listen, sofern eine Funktion nicht aus der gemeinsamen Core-Liste stammt. Ein Konsolen- oder anderer Desktop-Build muss separat betrachtet werden.

## Repräsentative Inhalte

### Minimum

Die gemeinsame Minimum-Zusammenstellung enthält MiniOS-Live-Konfiguration und Image-Tools, NetworkManager, SSH, Tastatur- und Sprachunterstützung, gezielt ausgewählte Firmware sowie Werkzeuge zur Hardware-Inspektion und für gängige Speicheraufgaben. Repräsentative Pakete sind `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` und `wpasupplicant`.

Die Xfce-Minimum-Kette ergänzt Xorg, Blackbox oder Openbox (je nach Quellliste), Thunar, Mousepad, das Xfce-Panel, Sitzungs-, Einstellungs-, Desktop- und Fenstermanager-Komponenten, das NetworkManager-Desktop-Applet, ALSA-Steuerung, Xarchiver, Akkuunterstützung sowie Firefox oder Firefox ESR (je nach Distributionsfamilie).

Die in jeder Edition enthaltenen MiniOS-Utilities, auch in Xfce Minimum, sind `minios-tools`, `minios-image-compose`, `minios-live-config`, die passende systemd- oder SysV-Init-Integration, `minios-live-config-doc` und `minios-welcome`.

### Standard

Standard ergänzt gemeinsame Funktionen wie DNS-Unterstützung, zusätzliche Komprimierungs- und Dateisystemtools, Netzwerkdateisystem-Clients, FUSE, Partitionierung und ISO-Erstellung. Repräsentative Pakete sind `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` oder die suite-spezifische Alternative, `cifs-utils`, `nfs-common`, `parted`, `7zip` und `genisoimage`.

In Xfce fügen Standard und spätere Editionen die aktuellen MiniOS-GUI- und Administrationswerkzeuge hinzu: `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager` und `driveutility`. Außerdem kommen LightDM, Desktop-Audio- und Bluetooth-Integration, Screenshots, Aufgabenverwaltung, Benachrichtigungen und das Xfce-Terminal hinzu.

### Toolbox

Toolbox erweitert um Kommandozeilen-Tools für Speicher, Wiederherstellung, Performance, Netzwerk und virtuelle Maschinen. Aktuelle Beispiele sind LVM- und LUKS-Tools, Clonezilla, Partclone, TestDisk, `gddrescue`, ZFS-Tools (sofern im Build unterstützt), Nmap, iperf3, QEMU, libvirt, Gastagenten, fio, sysbench und Hardware-Reporting.

Das Xfce-Anwendungsmodul ergänzt repräsentative Tools wie GParted, GSmartControl, Guymager, Rettungs- und Festplattenwerkzeuge, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit und grafische Verschlüsselungswerkzeuge. Die genauen Paketnamen hängen von der Suite ab; eine Quellliste kann z. B. verschiedene Paketalternativen nutzen.

### Ultra

Ultra behält das Toolbox-Set bei und ergänzt Container- und Workstation-Software. Repräsentative gemeinsame Ergänzungen sind Docker-Pakete (je nach Ziel-Repository), Compose-Unterstützung, `lazydocker`, iSCSI-Tools und Utilities für Benutzer-Namespaces. Die aktuelle Xfce-Anwendungsliste enthält LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic und zugehörige Desktop-Integrationspakete.

## Exakte Release-Inhalte prüfen

Das laufende System ist maßgeblich für die tatsächlich in diesem Release installierten Pakete. Paketnamen und Versionen lassen sich anzeigen mit:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Die geordneten Module des laufenden Root-Systems sollten separat von den für den nächsten Start ausgewählten Dateien betrachtet werden. Der MiniOS-Modulmanager zeigt diese als **Jetzt aktiv** und **Nächster Start** an. Aus der Shell heraus können die aktuell eingebundenen SquashFS-Mounts gelistet werden mit:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Für Offline-Medien oder ein eingebundenes ISO können die Quellmoduldateien direkt inventarisiert werden:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Für einen Quell-Build sind folgende Dateien und Verzeichnisse die maßgeblichen Quellmanifeste und Auswahlinputs:

- `linux-live/environments/<environment>/` für die geordnete Modulkette.
- `linux-live/scripts/00-core/packages.list` für die gemeinsame Editionsauswahl.
- `linux-live/scripts/01-kernel/packages.list` und `02-firmware/packages.list` für bedingte Kernel-Ergänzungen und Firmware.
- Das `packages.list` jedes gewählten Desktop- und Anwendungsmoduls.
- `linux-live/build.conf` für Suite, Architektur, Umgebung, Paketvariante, Init-System, Kernel, Spracheinstellung und andere Filterwerte.
- `linux-live/condinapt.map` für die Bedeutung der Präfixe in Paketlisten-Filtern.

Quelllisten beschreiben angeforderte Pakete und Alternativen. Nur das fertige Abbild und `dpkg-query` zeigen die exakt aufgelöste Abhängigkeitsmenge und Versionen für ein bestimmtes Release. Paketverfügbarkeit und Paketnamen können sich zwischen Debian, Ubuntu und Devuan sowie zwischen Desktop-Umgebungen unterscheiden.

Siehe [Systemarchitektur](/about/System-Architecture.md) für die Modulreihenfolge und [CondinAPT in MiniOS](/development/CondinAPT-MiniOS.md) für die bedingte Paketauswahl.
