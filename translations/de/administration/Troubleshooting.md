# Fehlerbehebung

Beginnen Sie mit Beobachtung und reversiblen Tests. Partitionieren, formatieren,
reparieren Sie kein Dateisystem, löschen Sie keine Sitzung und überschreiben Sie keine Boot-Dateien,
bevor wichtige Daten gesichert und das fehlerhafte Gerät eindeutig anhand von Modell, Größe,
Dateisystem und Einhängepunkt identifiziert wurden.

## Erste Überprüfungen

1. Überprüfen Sie das heruntergeladene ISO mit
   [Downloads verifizieren](/installation/Verifying-Downloads.md).
2. Testen Sie einen frischen Start ohne Persistenz. So lassen sich Basis-System- und
   Hardwareprobleme von einer beschädigten oder inkompatiblen Sitzung unterscheiden.
3. Probieren Sie einen anderen USB-Port und, wenn möglich, ein anderes, als funktionierend bekanntes Gerät.
4. Notieren Sie den genauen Boot-Menü-Eintrag, alle hinzugefügten Parameter und den ersten Fehler
   statt nur des letzten Fehlers.
5. Prüfen Sie [Hardware-Kompatibilität](/installation/Hardware-Compatibility.md) sowie
die Anleitung für das verwendete Schreib-Tool.

## Startprobleme

Wenn das Gerät nicht im Firmware-Boot-Menü erscheint, prüfen Sie, ob es
für UEFI, Legacy BIOS oder beides geschrieben wurde. Deaktivieren Sie vorübergehend das schnelle Booten in der Firmware,
nutzen Sie das einmalige Boot-Menü der Firmware und testen Sie einen anderen Port, bevor Sie
das Gerät neu schreiben. Ändern Sie nicht die Partitionstabelle der internen Festplatte, um ein USB-Boot-Problem zu diagnostizieren.

Erscheint das MiniOS-Boot-Menü, schlägt der Start aber fehl:

- Starten Sie eine frische Sitzung ohne `perch`, `perchdir` oder `perchmode`.
- Entfernen Sie optionale Parameter und Modulfiler.
- Vergewissern Sie sich, dass ISO und beschriebene Medien nicht beschädigt sind.
- Erfassen Sie die vollständige Fehlermeldung. Die Parameter `debug` und `timing` geben Boot-Ausgaben aus;
  `rd.break` öffnet eine initramfs-Shell für erweiterte Diagnose.
- Wenn MiniOS-Daten nicht gefunden werden, prüfen Sie den Wert von `from` und den Gerätepfad anhand der
  [Boot-Parameter](/configuration/Boot-Parameters.md).

Für PXE- oder HTTP-ISO-Start nutzen Sie die gezielte
[Netzwerk-Boot](/installation/Network-Boot.md)-Anleitung. Das frühe Boot-Netzwerk ist
getrennt von NetworkManager in der laufenden Sitzung.

## Anzeigeprobleme

Bei schwarzem Bildschirm, unlesbarer Auflösung oder einer Display-Manager-Schleife:

1. Probieren Sie den Boot-Parameter `text`. Wenn eine Konsole startet, ist das Basissystem gebootet
   und der Fehler liegt vermutlich bei Grafik, X11 oder dem Display-Manager.
2. Entfernen Sie einen manuell gesetzten `xorg-driver`- oder `xorg-resolution`-Parameter.
3. Testen Sie eine frische Sitzung, um eine persistente Anzeige-Konfiguration auszuschließen.
4. Notieren Sie die GPU und den geladenen Treiber mit `lspci -nnk`.
5. Untersuchen Sie Fehler des aktuellen Starts mit `journalctl -b -p warning` und
   `dmesg --level=err,warn`.

Die in `virtres` und `novirtres` dokumentierten Auflösungssteuerungen für virtuelle Maschinen
gelten nur für die Xfce-Umgebung. Siehe
[Virtualisierung](/administration/Virtualization.md) für Gastsystem-spezifische Einrichtung.

## Netzwerkprobleme

Stellen Sie fest, ob das Interface existiert, bevor Sie die Konfiguration ändern:

```bash
ip link
ip address
ip route
```

Für die normale laufende Sitzung prüfen Sie NetworkManager, sofern vorhanden:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Falls kein Interface erscheint, notieren Sie die Ausgabe von `lspci -nnk` oder `lsusb` und prüfen Sie auf
  fehlende Firmware in `dmesg`.
- Existiert das Interface, hat aber keine Adresse, testen Sie DHCP, bevor Sie statische
  Werte eintragen.
- Existiert eine Adresse, testen Sie das Gateway, dann eine IP-Adresse und dann einen DNS-Namen, um
  Verbindungs-, Routing- und DNS-Fehler zu unterscheiden.
- Der Installer konfiguriert kabelgebundenes DHCP oder statisches IPv4. Vorhandene WLAN-Profile
  bleiben unverändert.
- Der Boot-Parameter `ip=` konfiguriert den frühen PXE-Download, nicht das Netzwerk der persistierenden Sitzung.
  Siehe [Netzwerk-Boot](/installation/Network-Boot.md).

## Persistenzprobleme

Starten Sie zunächst ohne Persistenz und erstellen Sie eine vollständige Kopie des `minios/changes`-
Verzeichnisses. Führen Sie keine Reparaturtools gegen die einzige Kopie oder gegen eine aktive
Sitzung aus.

Prüfen Sie den Sitzungsstatus mit:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Häufige Ursachen sind das Booten des frischen Eintrags, eine ISO-Schreibmethode,
die nie Persistenz eingerichtet hat, zu wenig freier Speicherplatz, Auswahl einer Sitzung aus
einer anderen Edition oder Version, Dateisystem-Inkompatibilität und ein unsauberer
Shutdown. Siehe [Sitzungsverwaltung](/configuration/Session-Management.md).

Wenn MiniOS wiederholt leere Sitzungen erstellt, DynFileFS nicht fortsetzen kann oder
Containerfehler meldet, folgen Sie [DynFileFS- und dynblk-Wiederherstellung](/configuration/DynFileFS-Recovery.md).
Diese Anleitung beginnt mit einer vollständigen Kopie und Prüfungen im Nur-Lese-Modus. LUKS-Sitzungen
erfordern außerdem das richtige Passwort und ein initrd mit LUKS-Persistenz-Support.

## Speicher- und Platzprobleme

Identifizieren Sie Geräte und Einhängepunkte, ohne Änderungen vorzunehmen:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Bestätigen Sie Modell und Größe des Geräts vor jeder Aktion. Ein volles Dateisystem kann
fehlgeschlagene Updates, unvollständige Sitzungs-Schreibvorgänge und Wiederherstellung beim Booten verursachen. Schaffen Sie freien Speicherplatz,
indem Sie nur bekannte Benutzerdaten verschieben oder löschen – immer erst nach einem Backup; löschen Sie niemals manuell nummerierte Persistenzverzeichnisse, während eines aktiv ist. Verwenden Sie den Sitzungsmanager oder `minios-session` für Sitzungsoperationen.

Eine Dateisystemreparatur ist ein späterer Schritt. Hängen Sie das Dateisystem vorher aus, arbeiten Sie nach Möglichkeit an einer Kopie und verwenden Sie das spezifische Prüfwerkzeug für das Dateisystem. Formatieren Sie ein Gerät niemals als Diagnosetest.

## Protokolle sammeln

Notieren Sie die MiniOS-Edition und -Version, die Startmethode, den Persistenzmodus, die Hardware
und die Schritte, um das Problem zu reproduzieren. Nützliche Befehle sind:

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

Entfernen Sie Passwörter, private Schlüssel, WLAN-Zugangsdaten, öffentliche IP-Adressen und
andere sensible Daten, bevor Sie Protokolle weitergeben. `journalctl -b -1` kann den
letzten Start anzeigen, wenn das Journal persistent ist.

Bei wiederholten Startfehlern auf beschreibbaren MiniOS-Medien setzen Sie `EXPORT_LOGS=true` in
der Konfigurationsdatei. MiniOS kopiert seine Boot-Protokolle nach `minios/logs`, wenn das
Medium beschreibbar ist. Siehe [Konfigurationsdatei](/configuration/Configuration-File.md).

Wenn Sie einen reproduzierbaren Fehler melden, fügen Sie die relevanten Auszüge bei und eröffnen Sie ein
Ticket im [MiniOS Issue Tracker](https://github.com/minios-linux/minios-live/issues).
