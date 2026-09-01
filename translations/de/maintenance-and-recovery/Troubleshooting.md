---
updated: 2026-08-31
---

# Fehlerbehebung

Beginnen Sie mit Beobachtung und reversiblen Tests. Nehmen Sie keine Neu-Partitionierung, Formatierung, Reparatur eines Dateisystems, Löschung einer Sitzung oder das Ersetzen von Boot-Dateien vor, nur um zu sehen, ob es hilft. Sichern Sie wichtige Daten zuerst.

## Erste Überprüfungen

1. [Überprüfen Sie das heruntergeladene Abbild](/installing-minios/Verifying-Downloads).
2. Starten Sie mit **Ohne Speichern starten**. Wenn das Problem verschwindet, untersuchen Sie die persistente Sitzung oder deren Konfiguration anstelle des Basis-Abbilds.
3. Entfernen Sie benutzerdefinierte Boot-Parameter und Modulfiler, es sei denn, sie sind zur Reproduktion des Problems erforderlich.
4. Probieren Sie einen anderen USB-Anschluss und, wenn möglich, ein anderes bekannt funktionierendes Gerät oder einen anderen Computer.
5. Notieren Sie den ersten Fehler und den genauen Boot-Menü-Eintrag, nicht nur die zuletzt auf dem Bildschirm angezeigte Meldung.
6. Prüfen Sie die [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility), wenn dasselbe verifizierte Abbild auf einem Rechner fehlschlägt, aber auf einem anderen funktioniert.

## Das Gerät erreicht das MiniOS Boot-Menü nicht

Bestimmen Sie zunächst, wie das MiniOS Gerät erstellt wurde.

- Bei einem direkt geschriebenen Abbild (`dd`, Etcher, Rufus DD-Modus oder Schreiben des Abbilds mit dem Laufwerksprogramm), reparieren Sie keine einzelnen Bootdateien. Ist die Kopie beschädigt, schreiben Sie das komplette Gerät aus einem verifizierten Abbild neu.
- Bei einer dateibasierten MiniOS Installation erstellen Sie das bootfähige Layout mit der gleichen dokumentierten Installationsmethode neu, anstatt GRUB-, Syslinux- oder EFI-Dateien von einer anderen Version zu kopieren.
- Ventoy besitzt einen eigenen Bootloader und ein eigenes Layout. Installieren Sie den MiniOS Bootloader nicht über ein Ventoy Gerät; verwenden Sie stattdessen die [Ventoy](/installing-minios/installation-tools/Ventoy) Prozedur.
- Nach einer nativen Konvertierung verwendet das Ziel einen konventionellen Debian-Bootloader und ein Standard-Dateisystemlayout. Das MiniOS Desktop-Design kann erhalten bleiben, aber die MiniOS Live-Infrastruktur und die spezifischen Live-Tools sind nicht mehr vorhanden. Sichern Sie wiederherstellbare Daten, bevor Sie die Debian-Bootloader-Reparatur oder die für BIOS/UEFI und Partitionslayout passende Neuinstallation durchführen.

Erscheint ein neu erstelltes Gerät immer noch nicht im Firmware-Boot-Menü, prüfen Sie den Firmware-Modus, die Secure-Boot-Unterstützung der gewählten Architektur, USB-Anschluss/-Gerät und die [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility).

## Das MiniOS Boot-Menü erscheint, aber der Start schlägt fehl

Entfernen Sie zuerst optionale Parameter. Verwenden Sie `debug` und `timing`, wenn mehr Ausgaben beim frühen Systemstart benötigt werden. `rd.break` dient zur erweiterten initramfs-Inspektion, nicht zur Reparatur.

Kann MiniOS seine Quelle nicht finden, siehe [Systemerkennung](/reference/boot-process/System-Discovery). In einer initramfs-Shell sind folgende schreibgeschützte Informationen nützlich:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Ein temporäres `from=askdisk` kann helfen, das Gerät zu identifizieren, das tatsächlich die MiniOS Daten enthält. Verwenden Sie danach die dokumentierte `from=` Syntax, anstatt Gerätenamen zu raten.

Für PXE- oder HTTP-ISO-Start siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). Das frühe Netzwerk beim Booten ist getrennt vom NetworkManager in der laufenden Sitzung.

### Modul- oder Root-Union-Fehler

Siehe [Modulladen](/reference/boot-process/Module-Loading) für die tatsächlichen Regeln zur Modulauswahl und -reihenfolge. Insbesondere gilt:

- `load=` und `noload=` können essenzielle Basis- oder Kernel-Module ausschließen; `noload=` hat Vorrang, wenn beide zutreffen;
- Kandidaten mit demselben Basisnamen belegen denselben Ersetzungsslot;
- ein `.sb` Dateiname beweist nicht, dass die Datei ein gültiges SquashFS Abbild ist;
- der laufende Kernel muss zum koordinierten MiniOS Kernelmodul und den Boot-Dateien passen.

Nach erfolgreichem Booten inspizieren Sie den tatsächlichen Zustand, ohne Änderungen vorzunehmen:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Anzeigeprobleme

Bei schwarzem Bildschirm, unbrauchbarer Auflösung oder einer Display-Manager-Schleife:

1. Probieren Sie den Boot-Parameter `text`. Eine funktionierende Konsole trennt ein Grafik-/Desktop-Problem von einem früheren Boot-Fehler.
2. Entfernen Sie manuell angegebene `xorg-driver` oder `xorg-resolution` Parameter.
3. Testen Sie **Ohne Speichern starten**, um persistente Anzeigeeinstellungen auszuschließen.
4. Notieren Sie die GPU und den Treiber mit `lspci -nnk`.
5. Untersuchen Sie `journalctl -b -p warning` und `dmesg --level=err,warn`.

Für virtuelle Maschinen siehe [Virtualisierung](/maintenance-and-recovery/Virtualization).

## Netzwerkprobleme

Normale kabelgebundene und WLAN-Verbindungen werden über NetworkManager verwaltet; siehe [Netzwerk](/using-minios/Networking).

Bestimmen Sie zunächst, ob das Interface existiert:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Wenn kein Interface existiert, notieren Sie `lspci -nnk` oder `lsusb` und suchen Sie nach Firmware- oder Treiberfehlern in `dmesg`.
- Wenn das Interface existiert, aber keine Adresse hat, unterscheiden Sie Verbindungs-/DHCP-Probleme von fehlender Hardwareunterstützung.
- Wenn eine Adresse vorhanden ist, testen Sie das Gateway, dann eine IP-Adresse, dann einen DNS-Namen, um Verbindungs-, Routing- und DNS-Fehler zu trennen.
- Der Boot-Parameter `ip=` gehört zum frühen Netzwerk-Boot und konfiguriert keine persistente NetworkManager-Verbindung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

## Probleme mit Persistenz

Starten Sie **Ohne Speichern starten**, bevor Sie einen verdächtigen Persistenzspeicher ändern. Reparieren oder löschen Sie keine einzige Kopie einer Sitzung, während sie aktiv ist.

Untersuchen Sie, was MiniOS aktuell sieht:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Überprüfen Sie den gewählten Boot-Modus, verfügbaren beschreibbaren Speicherplatz, Dateisystem-Kompatibilität und Sitzungs-Kompatibilität. Die detaillierten Auswahlregeln finden Sie unter [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) und [Persistenz-Interna](/reference/boot-process/Persistence-Internals).

Wenn eine wichtige, nicht laufende `native`, `dynfilefs`, `raw` oder `luks` Sitzung noch lesbar ist, exportieren Sie sie **bevor** Sie mit dem Speicher experimentieren:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Wenn der Sitzungsmanager die Sitzung nicht lesen oder exportieren kann, beenden Sie das Schreiben auf die Quelle und sichern Sie eine Offline-Kopie des betroffenen Speichers, bevor Sie weiterarbeiten. MiniOS definiert kein universelles manuelles Verfahren zum Wiederherstellen von DynFileFS-Segmenten, Reparieren eines internen Dateisystems oder Rekonstruieren von Sitzungsmetadaten. Eine solche Wiederherstellung ist dateisystem-/container-spezifisch und sollte nur an einer Kopie versucht werden, wenn der Wert der Daten dies rechtfertigt.

Siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) für unterstützte Backup- und Sitzungsimport-Workflows.

## Speicher- und Freiplatzprobleme

Untersuchen Sie Geräte und Einhängepunkte, ohne Änderungen vorzunehmen:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Ein volles Dateisystem kann zu fehlgeschlagenen Paketoperationen, unvollständigen Sitzungs-Sicherungen und weiteren Folgefehlern führen. Schaffen Sie freien Speicherplatz, indem Sie bekannte Daten verschieben oder löschen – aber erst, nachdem Sie das richtige Dateisystem bestätigt haben. Verwenden Sie für das Löschen von Sitzungen den MiniOS-Sitzungsmanager, anstatt nummerierte Sitzungsverzeichnisse von Hand zu entfernen.

Die Reparatur eines Dateisystems ist keine generische MiniOS-Operation. Ist das Dateisystem selbst beschädigt, hängen Sie es aus, sichern Sie zunächst wichtige Daten oder ein Abbild, und verwenden Sie ein für dieses Dateisystem und Speichermedium geeignetes Reparaturverfahren.

## Paketänderungen und Systemaktualisierungen

Wenn Probleme nach APT-Paketänderungen auftraten, beachten Sie, dass eine Live-Persistenzsitzung Dateien aus den schreibgeschützten MiniOS Modulen überschreiben kann. Testen Sie **Ohne Speichern starten**, um mit dem ursprünglichen Modulsatz zu vergleichen. Siehe [Aktualisierung von MiniOS](/maintenance-and-recovery/Updating-MiniOS) für den Unterschied zwischen APT-Wartung und dem Wechsel von MiniOS-Versionen.

## Protokolle sammeln

Nützliche Informationen sind unter anderem:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Bei wiederholten Boot-Fehlern auf beschreibbaren MiniOS Medien exportiert `EXPORT_LOGS=true` in `config.conf` Boot-Protokolle unter `minios/log/`. Siehe [config.conf](/reference/configuration/config.conf).

Entfernen Sie Zugangsdaten, private Schlüssel, WLAN-Passwörter und andere vertrauliche Informationen, bevor Sie Protokolle weitergeben. Für einen reproduzierbaren Fehler fügen Sie die relevanten Auszüge bei und eröffnen Sie ein Issue im [MiniOS Issue Tracker](https://github.com/minios-linux/minios-live/issues).
