# Fehlerbehebung

Beginnen Sie mit Beobachtung und reversiblen Tests. Nehmen Sie keine Neu-Partitionierung, Neuformatierung, Reparatur eines Dateisystems, Löschung einer Sitzung oder Überschreibung von Boot-Dateien vor, bevor wichtige Daten gesichert wurden und das fehlerhafte Gerät anhand von Modell, Größe, Dateisystem und Einhängepunkt identifiziert ist.

Verwenden Sie [Backup und Wiederherstellung](/administration/Backup-Recovery.md) vor destruktiven Maßnahmen und [Boot-Wiederherstellung](/administration/Boot-Recovery.md), wenn Firmware, Bootloader, Kernel oder installierte Boot-Dateien betroffen sind.

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

### MiniOS-Quellenfehler

Verwenden Sie [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md) für die vollständigen Regeln zur Quellreihenfolge und Pfadauflösung. Die wichtigsten Details für die Diagnose sind:

- Ein explizites `from=http://...` hat Vorrang vor `ip=`; `ip=` liefert dann die statische HTTP-ISO-Adresse. Andernfalls wählt jedes nicht-leere `ip=` PXE. Keiner der Netzwerkpfade fällt auf lokale Medien zurück.
- Die lokale Erkennung durchläuft 45 Durchgänge und prüft Blockgerät-Namen in sortierter Reihenfolge. Das erste Gerät mit einer passenden Quelle wird verwendet, nicht unbedingt das gewünschte Gerät oder ein vollständiges Modulpaket.
- `/dev/disk/by-label/LABEL/path` wird in `from=` unterstützt. UUID-, PARTUUID- und by-id-Pfade werden von diesem Parser nicht unterstützt.
- Die genaue Syntax für benutzerdefinierte Pfade verwendet Doppelpunkte, z. B. `from=askdisk:custom:dir`. Slash-Syntax testet stattdessen stillschweigend den Standardpfad `minios`.
- Wenn die Erkennung in die fatale initramfs-Shell führt, behebt das Verlassen der Shell weder die Quelle noch gibt es ein Fallback. Der Bootvorgang kann lediglich in einen späteren, weniger klaren Fehler fortgesetzt werden.

In einer initramfs-Shell beginnen Sie mit einer schreibgeschützten Überprüfung:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Notieren Sie den ersten Quell-, Mount- oder Download-Fehler. Führen Sie keine Dateisystemreparatur durch und entfernen Sie keine Medien, solange sie eingehängt sind.

### Modul- und Root-Fehler

Verwenden Sie [Initrd-Modulladung](/configuration/Initrd-Module-Loading.md) für Auswahl-, Reihenfolge- und Vereinigungsregeln. Prüfen Sie zuerst diese häufigen Ursachen:

- `load=` und `noload=` sind reguläre Ausdrucksfilter. Es gibt keinen geschützten Core- oder Kernel-Satz, daher kann ein Filter `00-core` oder das laufende Kernel-`01-kernel`-Modul ausschließen; `noload=` hat Vorrang, wenn beide Filter zutreffen.
- Modulpfade werden auf ihren Basename reduziert. Zwei Kandidaten mit demselben Basename belegen einen Ersetzungsplatz, sodass eine spätere Quellstufe den früheren Kandidaten ersetzen kann, anstatt eine weitere Ebene hinzuzufügen.
- Ein `.sb`-Suffix beweist nicht, dass ein Kandidat ein gültiges SquashFS-Image ist. Einzelne Loop- oder Modul-Mount-Fehler können den Bootvorgang mit einer fehlenden Ebene fortsetzen lassen. Notieren Sie den ersten Mount-Fehler.
- `toram=full` und `toram=trim` prüfen den verfügbaren RAM nicht im Voraus. Kopier- oder Trennfehler können dazu führen, dass die Originalquelle eingehängt bleibt; entfernen Sie daher Medien oder trennen Sie eine HTTP-Verbindung nicht nur, weil `toram` angegeben wurde.

Nach erfolgreicher Übergabe prüfen diese Befehle den Zustand, ohne ihn zu verändern:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Für die Auswahl und Fehler der beschreibbaren Ebene siehe [Initrd-Persistenz](/configuration/Initrd-Persistence.md). Persistenz kann nach einigen Aktivierungsfehlern auf ein temporäres RAM-Upper zurückfallen, während das Scheitern beim Erstellen der Root-Union zur fatalen initramfs-Shell führt.

## Anzeigeprobleme

Bei schwarzem Bildschirm, unlesbarer Auflösung oder einer Endlosschleife des Display-Managers:

1. Versuchen Sie den Boot-Parameter `text`. Wenn eine Konsole startet, ist das Basissystem gebootet und der Fehler liegt wahrscheinlich bei der Grafik, X11 oder dem Display-Manager.
2. Entfernen Sie einen manuell angegebenen `xorg-driver` oder `xorg-resolution`-Parameter.
3. Testen Sie eine neue Sitzung, um eine persistente Anzeige-Konfiguration auszuschließen.
4. Notieren Sie die GPU und den geladenen Treiber mit `lspci -nnk`.
5. Prüfen Sie Fehler des aktuellen Boots mit `journalctl -b -p warning` und `dmesg --level=err,warn`.

Die für virtuelle Maschinen dokumentierten Auflösungssteuerungen `virtres` und `novirtres` gelten nur für die Xfce-Umgebung. Siehe [Virtualisierung](/administration/Virtualization.md) für Gastsystem-spezifische Einstellungen.

## Netzwerkprobleme

Für normale kabelgebundene und WLAN-Einrichtung, Persistenz und NetworkManager-Befehle siehe [Netzwerkkonfiguration](/configuration/Network-Configuration.md).

Prüfen Sie, ob die Schnittstelle existiert, bevor Sie die Konfiguration ändern:

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

- Wenn keine Schnittstelle erscheint, notieren Sie die Ausgaben von `lspci -nnk` oder `lsusb` und prüfen Sie auf fehlende Firmware in `dmesg`.
- Wenn die Schnittstelle existiert, aber keine Adresse hat, testen Sie DHCP, bevor Sie statische Werte eintragen.
- Wenn eine Adresse vorhanden ist, testen Sie das Gateway, dann eine IP-Adresse, dann einen DNS-Namen, um zwischen Verbindungs-, Routing- und DNS-Fehlern zu unterscheiden.
- Der Installer konfiguriert kabelgebundenes DHCP oder statisches IPv4. Vorhandene WLAN-Profile bleiben unverändert.
- Der Boot-Parameter `ip=` konfiguriert den frühen PXE-Download, nicht das Netzwerk der laufenden Sitzung. Siehe [Netzwerk-Boot](/installation/Network-Boot.md).

## Persistenzprobleme

Starten Sie zunächst ohne Persistenz und erstellen Sie eine vollständige Kopie des Verzeichnisses `minios/changes`. Führen Sie keine Reparaturtools gegen die einzige Kopie oder eine aktive Sitzung aus.

Prüfen Sie den Sitzungsstatus mit:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Häufige Ursachen sind das Booten des frischen Eintrags, die Verwendung einer ISO-Schreibmethode ohne Persistenzkonfiguration, unzureichender freier Speicherplatz, Auswahl einer Sitzung aus einer anderen Edition oder Version, Dateisysteminkompatibilität und ein unsauberer Shutdown. Siehe [Sitzungsverwaltung](/configuration/Session-Management.md).

Wenn MiniOS wiederholt leere Sitzungen erstellt, DynFileFS nicht fortsetzen kann oder Containerfehler meldet, folgen Sie [DynFileFS- und dynblk-Wiederherstellung](/configuration/DynFileFS-Recovery.md). Diese Anleitung beginnt mit einer vollständigen Kopie und schreibgeschützten Prüfungen. LUKS-Sitzungen erfordern außerdem das richtige Passwort und ein initrd mit LUKS-Persistenzunterstützung.

## Speicher- und Platzprobleme

Identifizieren Sie Geräte und Mounts, ohne sie zu verändern:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Bestätigen Sie Modell und Größe des Geräts vor jeglichen Operationen. Ein volles Dateisystem kann zu fehlgeschlagenen Updates, unvollständigen Sitzungs-Schreibvorgängen und Wiederherstellung beim Booten führen. Schaffen Sie freien Speicherplatz, indem Sie bekannte Benutzerdaten erst nach einem Backup verschieben oder löschen; löschen Sie niemals manuell nummerierte Persistenzverzeichnisse, solange eines aktiv ist. Verwenden Sie den Sitzungsmanager oder `minios-session` für Sitzungsoperationen.

Dateisystemreparatur ist ein späterer Schritt. Hängen Sie das Dateisystem vorher aus, arbeiten Sie nach Möglichkeit mit einer Kopie und verwenden Sie das spezifische Prüfwerkzeug für das Dateisystem. Formatieren Sie ein Gerät niemals als Diagnosetest.

## Protokolle sammeln

Notieren Sie die MiniOS-Edition und -Version, die Boot-Methode, den Persistenzmodus, die Hardware und die Schritte zur Reproduktion des Problems. Nützliche Befehle sind:

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

Entfernen Sie Passwörter, private Schlüssel, WLAN-Zugangsdaten, öffentliche IP-Adressen und andere sensible Daten, bevor Sie Protokolle weitergeben. `journalctl -b -1` kann den vorherigen Boot anzeigen, wenn das Journal persistent ist.

Bei wiederholten Boot-Fehlern auf beschreibbaren MiniOS-Medien setzen Sie `EXPORT_LOGS=true` in der Konfigurationsdatei. MiniOS kopiert seine Boot-Protokolle in ein zeitgestempeltes Verzeichnis unter `minios/log/`, wenn das Medium beschreibbar ist. Siehe [Konfigurationsdatei](/configuration/Configuration-File.md).

Wenn Sie einen reproduzierbaren Fehler melden, fügen Sie die relevanten Auszüge bei und öffnen Sie ein Issue im [MiniOS Issue Tracker](https://github.com/minios-linux/minios-live/issues).
