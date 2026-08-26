---
updated: 2026-08-26
---

# Pakete und Editionen

Die Inhalte der MiniOS-Pakete werden aus bedingten Quelllisten generiert. Sie variieren je nach Distributionssuite, Architektur, Init-System, Desktop-Umgebung, Spracheinstellung, Kernel-Optionen und Verfügbarkeit der Repositories. Diese Seite beschreibt die Vererbung der Editionen und repräsentative Inhalte; sie stellt keine vollständige Paketübersicht für alle Releases dar.

## Edition-Vererbung

Die öffentlichen Editionen bilden eine additive Abfolge:

1. **Flux** stellt das gemeinsame Live-System und die schlanke Flux-Umgebung bereit.
2. **Standard** übernimmt die gemeinsame Paketbasis und ergänzt allgemeine Verwaltungs-, Desktop- und MiniOS-Management-Tools.
3. **Toolbox** erbt von Standard und erweitert um Recovery-, Diagnose-, Speicher-, Netzwerk- und Virtualisierungstools.
4. **Ultra** erbt von Toolbox und ergänzt umfangreichere Workstation-, Medien-, Office- und Container-Software.

Mit bedingten Ausdrücken können Alternativen ausgewählt oder ein Paket für eine Suite, Architektur, Umgebung oder Build-Option ausgelassen werden. Ein unten aufgeführtes Paket steht daher exemplarisch für die aktuellen Quelllisten und ist keine Zusicherung, dass das gleiche Debian-Binärpaket in jeder MiniOS-Version existiert.

## Desktop- und Umgebungsscope

Desktop-Pakete stammen aus der geordneten Modulkette der gewählten Umgebung. Die Umgebungen Xfce, Fluxbox, LXQt, Core und Debug enthalten nicht identische Module oder Paketsätze. Die folgenden Beispiele orientieren sich an den aktuellen Xfce-Listen, sofern eine Funktion nicht aus der gemeinsamen Core-Liste stammt. Ein Konsolen- oder anderer Desktop-Build muss separat betrachtet werden.

## Repräsentative Inhalte

### Flux

Die gemeinsame Flux-Zusammenstellung umfasst MiniOS-Live-Konfiguration und Image-Tools, NetworkManager, SSH, Unterstützung für Tastatur und Spracheinstellungen, zielgerichtet ausgewählte Firmware sowie Werkzeuge zur Hardware-Inspektion und für gängige Speicheraufgaben. Repräsentative Pakete sind `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill` und `wpasupplicant`.

Die Flux-Desktop-Kette ergänzt Fluxbox und die von den Quelllisten ausgewählten unterstützenden Tools. Sie enthält nicht das vollständige Xfce-Anwendungs- und MiniOS-GUI-Set, das unter Standard beschrieben wird.

Die in jeder Edition, einschließlich Flux, enthaltenen MiniOS-Utilities sind `minios-tools`, `minios-image-compose`, `minios-live-config`, die passende systemd- oder SysV-init-Integration, `minios-live-config-doc` und `minios-welcome`.

### Standard

Standard ergänzt gemeinsame Funktionen wie DNS-Unterstützung, zusätzliche Komprimierungs- und Dateisystemtools, Netzwerkdateisystem-Clients, FUSE, Partitionierung und ISO-Erstellung. Repräsentative Pakete sind `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` oder die suite-spezifische Alternative, `cifs-utils`, `nfs-common`, `parted`, `7zip` und `genisoimage`.

In Xfce fügen Standard und spätere Editionen die aktuellen MiniOS-GUI- und Administrationswerkzeuge hinzu: `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager` und `driveutility`. Außerdem kommen LightDM, Desktop-Audio- und Bluetooth-Integration, Screenshots, Aufgabenverwaltung, Benachrichtigungen und das Xfce-Terminal hinzu.

### Toolbox

Toolbox erweitert um Kommandozeilen-Tools für Speicher, Wiederherstellung, Performance, Netzwerk und virtuelle Maschinen. Aktuelle Beispiele sind LVM- und LUKS-Tools, Clonezilla, Partclone, TestDisk, `gddrescue`, ZFS-Tools (sofern im Build unterstützt), Nmap, iperf3, QEMU, libvirt, Gastagenten, fio, sysbench und Hardware-Reporting.

Das Xfce-Anwendungsmodul ergänzt repräsentative Tools wie GParted, GSmartControl, Guymager, Rettungs- und Festplattenwerkzeuge, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit und grafische Verschlüsselungswerkzeuge. Die genauen Paketnamen hängen von der Suite ab; eine Quellliste kann z. B. verschiedene Paketalternativen nutzen.

### Ultra

Ultra behält das Toolbox-Set bei und ergänzt Container- und Workstation-Software. Repräsentative gemeinsame Ergänzungen sind Docker-Pakete (je nach Ziel-Repository), Compose-Unterstützung, `lazydocker`, iSCSI-Tools und Utilities für Benutzer-Namespaces. Die aktuelle Xfce-Anwendungsliste enthält LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic und zugehörige Desktop-Integrationspakete.

## Exakte Release-Inhalte inspizieren

Das laufende System ist maßgeblich für die tatsächlich in diesem Release installierten Pakete. Paketnamen und -versionen lassen sich auflisten mit:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Die geordneten Module, die das laufende Root-System bilden, sollten separat von den für den nächsten Start ausgewählten Dateien betrachtet werden. Der MiniOS-Modulmanager stellt dies als **Aktuell laufend** und **Nächster Start** dar. Im Terminal können die zur Laufzeit eingebundenen SquashFS-Mounts mit folgendem Befehl angezeigt werden:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Für Offline-Medien oder ein eingebundenes ISO kann man die Quellmoduldateien direkt inventarisieren:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Für einen Quell-Build sind die folgenden Dateien und Verzeichnisse die maßgeblichen Quell-Manifeste und Auswahlgrundlagen:

- `linux-live/environments/<environment>/` für die geordnete Modulkette.
- `linux-live/scripts/00-core/packages.list` für die gemeinsame Edition-Auswahl.
- `linux-live/scripts/01-kernel/packages.list` und `02-firmware/packages.list` für bedingte Kernel-Erweiterungen und Firmware.
- Das `packages.list` jedes ausgewählten Desktop- und Anwendungsmoduls.
- `linux-live/build.conf` für Suite, Architektur, Umgebung, Paketvariante, Init-System, Kernel, Sprache und weitere Filterwerte.
- `linux-live/condinapt.map` für die Bedeutung der Präfixe in Paketlisten-Filtern.

Quelllisten beschreiben angeforderte Pakete und Alternativen. Nur das fertige Abbild und `dpkg-query` zeigen die exakt aufgelöste Abhängigkeitsmenge und Versionen für ein bestimmtes Release. Paketverfügbarkeit und Paketnamen können sich zwischen Debian-, Ubuntu- und Devuan-Suiten sowie zwischen Desktop-Umgebungen unterscheiden.

Das Quell-Build-System bezeichnet seine kleinste Paketvariante als `minimum`. Dies ist ein interner `PACKAGE_VARIANT`-Wert, der von CondinAPT-Filtern verwendet wird, nicht der Name einer veröffentlichten MiniOS-Edition. Die veröffentlichte Edition, die aus dieser Paketvariante und der Flux-Umgebung gebaut wird, ist **Flux**.

Siehe [Systemarchitektur](/about/System-Architecture.md) für die Modulreihenfolge und [CondinAPT in MiniOS](/development/CondinAPT-MiniOS.md) für die bedingte Paketauswahl.
