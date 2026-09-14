---
updated: 2026-09-13
---

# Fehlerbehebung

Beginnen Sie mit Beobachtung und umkehrbaren Tests. Nehmen Sie keine Neu-Partitionierung, Formatierung, Dateisystemreparatur, Sitzungs­löschung oder Austausch von Boot-Dateien vor, nur um zu prüfen, ob es hilft. Sichern Sie zuerst wichtige Daten.

## Erste Überprüfungen

1. [Heruntergeladenes Abbild verifizieren](/installing-minios/Verifying-Downloads).
2. Starten **Ohne Speichern starten**. Wenn das Problem nicht mehr auftritt, prüfen Sie die persistente Sitzung oder deren Konfiguration statt des Basis-Abbilds.
3. Entfernen Sie benutzerdefinierte Startparameter und Modulfiter, sofern sie nicht zur Reproduktion des Problems benötigt werden.
4. Probieren Sie einen anderen USB-Anschluss und, wenn möglich, ein anderes bekannt funktionierendes Gerät oder einen anderen Computer.
5. Notieren Sie den ersten Fehler und den genauen Eintrag im Boot-Menü, nicht nur die letzte auf dem Bildschirm angezeigte Meldung.
6. Prüfen Sie die [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility) wenn dasselbe verifizierte Abbild auf einem Rechner fehlschlägt, aber auf einem anderen funktioniert.

## Das Gerät erreicht das MiniOS Bootmenü nicht

Ermitteln Sie zuerst, wie das MiniOS Gerät erstellt wurde.

- Für ein direkt geschriebenes Abbild (`dd`, Etcher, Rufus DD-Modus oder Laufwerksprogramm-Abbildschreibung) reparieren Sie keine einzelnen Bootdateien. Ist die Kopie beschädigt, schreiben Sie das gesamte Gerät mit einem verifizierten Abbild neu.
- Bei einer dateibasierten MiniOS Installation erstellen Sie das bootfähige Layout mit der dokumentierten Installationsmethode neu, anstatt GRUB-, Syslinux- oder EFI-Dateien aus einer anderen Version zu kopieren.
- Ventoy besitzt einen eigenen Bootloader und ein eigenes Layout. Installieren Sie den MiniOS Bootloader nicht über ein Ventoy Gerät; verwenden Sie stattdessen die [Ventoy](/installing-minios/installation-tools/Ventoy)-Prozedur.
- Nach der nativen Konvertierung verwendet das Ziel einen herkömmlichen Debian-Bootloader und ein Standard-Dateisystemlayout. Die MiniOS Desktop-Oberfläche kann erhalten bleiben, aber die MiniOS Live-Infrastruktur und spezifische Live-Tools sind nicht mehr vorhanden. Sichern Sie wiederherstellbare Daten, bevor Sie die für BIOS/UEFI und die Partitionierung passende Debian-Bootloader-Reparatur oder -Neuinstallation durchführen.

Wenn ein neu erstelltes Gerät weiterhin nicht im Firmware-Bootmenü erscheint, überprüfen Sie den Firmware-Modus, die Secure-Boot-Unterstützung der gewählten Architektur, USB-Anschluss/-Gerät und die [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility).

## Das MiniOS Boot-Menü erscheint, aber der Startvorgang schlägt fehl

Entfernen Sie zuerst die optionalen Parameter. Verwenden Sie `debug` und `timing` für eine ausführlichere Ausgabe beim frühen Systemstart. `rd.break` ist für die erweiterte Analyse von initramfs gedacht, nicht für Reparaturen.

Wenn MiniOS seine Quelle nicht findet, siehe [Systemerkennung](/reference/boot-process/System-Discovery). In einer initramfs-Shell sind folgende schreibgeschützte Informationen hilfreich:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Ein temporäres `from=askdisk` kann helfen, das Gerät zu identifizieren, das tatsächlich die MiniOS-Daten enthält. Danach nutzen Sie die dokumentierte `from=` Syntax, anstatt Gerätenamen zu raten.

Für PXE- oder HTTP-ISO-Start siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). Die Netzwerkfunktion beim frühen Systemstart ist unabhängig vom NetworkManager in der laufenden Sitzung.

### Modul- oder Root-Union-Fehler

Siehe [Modul-Ladevorgang](/reference/boot-process/Module-Loading) für die tatsächlichen Regeln zur Modulauswahl und -reihenfolge. Insbesondere:

- `load=` und `noload=` können essentielle Basis- oder Kernel-Module ausschließen; `noload=` gewinnt, wenn beide übereinstimmen;
- Kandidaten mit demselben Basisnamen belegen denselben Ersetzungsslot;
- eine `.sb`-Datei beweist nicht, dass die Datei ein gültiges SquashFS-Image ist;
- der laufende Kernel muss mit dem koordinierten MiniOS-Kernelmodul und den Boot-Dateien übereinstimmen.

Nach einem erfolgreichen Bootvorgang können Sie den aktuellen Zustand prüfen, ohne Änderungen vorzunehmen:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Anzeigeprobleme

Bei schwarzem Bildschirm, unbrauchbarer Auflösung oder einer Display-Manager-Schleife:

1. Versuchen Sie den `text` Boot-Parameter. Eine funktionierende Konsole grenzt ein Grafik-/Desktop-Problem von einem früheren Boot-Fehler ab.
2. Entfernen Sie manuell angegebene `xorg-driver` oder `xorg-resolution` Parameter.
3. Testen Sie **Start ohne Speichern** um eine persistente Anzeige-Konfiguration auszuschließen.
4. Notieren Sie GPU und Treiber mit `lspci -nnk`.
5. Überprüfen Sie `journalctl -b -p warning` und `dmesg --level=err,warn`.

Für virtuelle Maschinen siehe [Virtualisierung](/maintenance-and-recovery/Virtualization).

## Netzwerkprobleme

Normale kabelgebundene und WLAN-Verbindungen werden über NetworkManager verwaltet; siehe [Netzwerk](/using-minios/Networking).

Bestimmen Sie zunächst, ob das Interface vorhanden ist:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Falls kein Interface vorhanden ist, notieren Sie `lspci -nnk` oder `lsusb` und prüfen Sie auf Firmware- oder Treiberfehler in `dmesg`.
- Falls das Interface existiert, aber keine Adresse hat, unterscheiden Sie zwischen Verbindungs-/DHCP-Problemen und fehlender Hardwareunterstützung.
- Wenn eine Adresse vorhanden ist, testen Sie zunächst das Gateway, dann eine IP-Adresse und anschließend einen DNS-Namen, um Verbindungs-, Routing- und DNS-Fehler zu unterscheiden.
- Der Boot-Parameter `ip=` gehört zum frühen Netzwerk-Boot und konfiguriert keine dauerhafte NetworkManager-Verbindung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

## Persistenzprobleme

Boot **Ohne Speichern starten** bevor Sie einen verdächtigen Persistenzspeicher ändern. Reparieren oder löschen Sie keine einzige Kopie einer Sitzung, solange sie aktiv ist.

Überprüfen Sie, was MiniOS aktuell erkennt:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Prüfen Sie den gewählten Boot-Modus, verfügbaren beschreibbaren Speicherplatz, Dateisystemkompatibilität und Sitzungs-Kompatibilität. Die detaillierten Auswahlregeln finden Sie unter [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence) und [Persistenz-Interna](/reference/boot-process/Persistence-Internals).

Wenn eine wichtige, nicht laufende `native`, `dynfilefs`, `dynblk`, `raw`, oder `luks`-Sitzung noch lesbar ist, exportieren Sie sie **bevor** Sie mit dem Speicher experimentieren:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Wenn der Sitzungsmanager die Sitzung nicht lesen oder exportieren kann, stoppen Sie alle Schreibvorgänge auf die Quelle und sichern Sie eine Offline-Kopie des betroffenen Speichers, bevor Sie fortfahren. Für eine getrennte dynblk-Sitzung bieten `dynblk inspect /path/to/volume000.db` und `dynblk check /path/to/volume000.db` nur Lese-Diagnosen des Formats; führen Sie diese nicht auf einem noch verbundenen Volume aus. MiniOS definiert kein universelles manuelles Verfahren zum Wiederherstellen von DynFileFS-Segmenten, zum Rekonstruieren von dynblk-Backings, zur Reparatur eines internen Dateisystems oder zur Wiederherstellung von Sitzungsmetadaten. Eine solche Wiederherstellung ist dateisystem- bzw. container-spezifisch und sollte nur an einer Kopie versucht werden, wenn der Wert der Daten dies rechtfertigt.

Siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) für unterstützte Backup- und Sitzungsimport-Workflows.

## Speicher- und Speicherplatzprobleme

Geräte und Einhängepunkte prüfen, ohne Änderungen vorzunehmen:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Ein volles Dateisystem kann zu fehlgeschlagenen Paketoperationen, unvollständigen Sitzungs-Speicherungen und weiteren Folgefehlern führen. Schaffen Sie freien Speicherplatz, indem Sie bekannte Daten verschieben oder löschen – aber erst, nachdem Sie das richtige Dateisystem bestätigt haben. Für das Löschen von Sitzungen verwenden Sie den MiniOS-Sitzungsmanager, anstatt nummerierte Sitzungsverzeichnisse manuell zu entfernen.

Die Reparatur eines Dateisystems ist keine allgemeine MiniOS-Operation. Wenn das Dateisystem selbst beschädigt ist, hängen Sie es aus, sichern Sie wichtige Daten oder ein Abbild, und führen Sie eine für das jeweilige Dateisystem und Speichermedium geeignete Reparaturprozedur durch.

## Paketänderungen und Systemaktualisierungen

Wenn Probleme nach APT-Paketänderungen aufgetreten sind, beachten Sie, dass eine Live-Persistenz-Sitzung Dateien aus den schreibgeschützten MiniOS-Modulen überschreiben kann. Testen Sie **Ohne Speichern starten** zum Vergleich mit dem ursprünglichen Modulsatz. Siehe [MiniOS aktualisieren](/maintenance-and-recovery/Updating-MiniOS) für den Unterschied zwischen APT-Wartung und dem Wechsel von MiniOS-Releases.

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

Bei wiederholten Startfehlern auf beschreibbaren MiniOS-Medien, `EXPORT_LOGS=true` in `config.conf` werden Startprotokolle exportiert unter `minios/log/`. Siehe [config.conf](/reference/configuration/config.conf).

Entfernen Sie Zugangsdaten, private Schlüssel, WLAN-Passwörter und andere vertrauliche Informationen, bevor Sie Protokolle weitergeben. Bei einem reproduzierbaren Fehler fügen Sie die relevanten Ausschnitte bei und eröffnen ein Ticket im [MiniOS-Issue-Tracker](https://github.com/minios-linux/minios-live/issues).
