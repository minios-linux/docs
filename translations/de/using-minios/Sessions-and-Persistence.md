---
updated: 2026-09-13
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sitzungen und Persistenz

MiniOS-Sitzungen bewahren Änderungen am Live-System über Neustarts hinweg. Jede Sitzung ist ein nummeriertes Verzeichnis unter `minios/changes/`; die schreibgeschützten MiniOS-Module bleiben unverändert und die gewählte Sitzung stellt die beschreibbare Union-Dateisystem-Schicht bereit.

Verwenden Sie den MiniOS-Sitzungsmanager aus einem laufenden MiniOS-System:

```bash
minios-session-manager
```

Das entsprechende Kommandozeilenwerkzeug ist `minios-session`. Für Befehle, die Änderungen vornehmen, sind Administratorrechte erforderlich, daher verwenden die folgenden Beispiele `sudo`.

## Sitzungsmodi

| Modus | Speicher | Haupt-Einschränkungen |
|------|---------|------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Benötigt ein beschreibbares POSIX-Dateisystem wie ext2/3/4, Btrfs, XFS, F2FS oder ReiserFS. |
| `dynfilefs` | Erweiterbarer ext4-Container, aufgeteilt in Backing-Dateien | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Erfordert das DynFileFS-Backend. |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das von`volumeNNN.db`-Dateien unterstützt wird | Benötigt das dynblk-CLI, Kernel-Modul und initrd-Unterstützung. Die virtuelle Größe beträgt standardmäßig 16 GiB und ist auf 512 GiB begrenzt. |
| `raw` | Feste Größe `changes.img` mit ext4 | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. |
| `luks` | LUKS2-verschlüsselt `changes.luks` mit ext4 | Benötigt `cryptsetup`, Loop-Unterstützung und den MiniOS initrd-LUKS-Hook. |
| `squashfs` | Komprimierter Snapshot in `changes.sb` | Zum Speichern ist ein POSIX-Persistenzdateisystem erforderlich, das Links, Besitzrechte, Modi, xattrs, ACLs, Capabilities und Whiteouts erhalten kann. |

`dynfilefs`, `raw`, und `luks` erstellt mit `minios-session` haben standardmäßig 4000 MiB; `dynblk` hat standardmäßig 16 GiB. Größenwerte werden in MiB zugewiesen; `GB` und `TB`-Suffixe entsprechen 1000 bzw. 1.000.000 MiB. MiniOS-Sitzungsmanager begrenzt Raw- und LUKS-Dateien auf 4000 MiB bei FAT32. Die dynblk-Kapazität ist virtuell und thin-provisioned statt vorab zugewiesen, aber tatsächliche Schreibvorgänge sind durch den freien Speicherplatz des darunterliegenden Dateisystems und die dynblk-Ressourcenzulassung begrenzt. Container können nur vergrößert werden; Verkleinerungen werden nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Wahl auf einem kompatiblen Dateisystem.
DynFileFS verwenden, wenn das Persistenzdateisystem keine Linux-Metadaten abbilden kann.
dynblk verwenden, wenn ein echtes Kernel-Blockgerät mit Thin-Backing-Dateien benötigt wird; der Treiber kann mehrere unabhängige dynblk-Volumes gleichzeitig anbinden und der Session Manager verwendet den vom Treiber zurückgegebenen Gerätepfad, anstatt anzunehmen, dass `/dev/dynblk0` frei ist.
Raw verwenden, wenn eine feste Größe erforderlich ist, LUKS, wenn die Sitzung verschlüsselt werden muss, und SquashFS für einen exakten komprimierten Snapshot.

Führen Sie folgende Befehle aus, um das tatsächliche Persistenzdateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Es kann keine Sitzung auf einem nur-lesbaren Medium erstellt werden. Das initrd kann einen vorhandenen SquashFS-Snapshot auf beschreibbarem FAT, exFAT oder NTFS lesen und aktivieren, da der Snapshot in ein temporäres ext4-Upper extrahiert wird. Das Erstellen oder exakte Speichern eines Snapshots ist anders: Der private Staging-Bereich muss auf einem geeigneten POSIX-Dateisystem liegen, das Linux-Metadaten und Union-Whiteouts erhält.

## Startauswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten normalerweise Fortsetzen, Neu, Auswahl und nicht-persistente Einträge. Die kanonische Beschreibung von Selektor-, Kompatibilitäts-, Fallback- und Aktivierungssemantik findet sich unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den Legacy-Best-Effort-Fortsetzungspfad. Versucht den Metadaten-Standard, erstellt aber keinen Ersatz, wenn keiner nutzbar ist. |
| `perchdir=resume` | Setzt den Metadaten-Standard fort und erlaubt, falls dieser fehlt oder inkompatibel ist, dem initrd einen neuen kompatiblen Ersatz zu erstellen. Dies ist das aktuelle Verhalten beim Fortsetzen im Boot-Menü. |
| `perchdir=new` | Weist eine neue nummerierte Sitzung zu. |
| `perchdir=ask` | Wählt eine bestehende Sitzung aus oder erstellt eine während des Starts. |
| `perchdir=<id>` | Wählt diese nummerierte Sitzung direkt aus. |
| `perchdir=<device/path>` | Verwendet einen Persistenzspeicherort auf einem Gerät, einschließlich `/dev/...` und `label:...`-Formen, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | Setzt `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, oder `squashfs`. |
| `perchsize=<size>` | Setzt eine neue oder größere Containergröße; reine Werte werden in MiB zugewiesen und `MB`, `GB`, und `TB`-Suffixe werden akzeptiert. |

Wird für eine neue Sitzung kein Modus angegeben, verwendet der Bootvorgang den Native-Modus. Bei FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw- oder LUKS-Bootcontainer hat standardmäßig 4000 MiB; eine neue DynFileFS-Bootsitzung ohne `perchsize` wird anhand des verfügbaren Speicherplatzes unter Berücksichtigung einer Sicherheitsreserve dimensioniert. Eine neue dynblk-Bootsitzung ohne `perchsize` verwendet den 16 GiB-Standardwert des Treibers; explizites dynblk-Wachstum ist auf 512 GiB begrenzt.
SquashFS-Sitzungen werden aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`; `perchdir=new perchmode=squashfs` erstellt keinen Snapshot im initrd.

Beim Fortsetzen prüft MiniOS die gespeicherte Version, Edition, das Union-Dateisystem und den Modus. Ein `perchdir=resume` kann eine neue Sitzung anlegen, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Reine `perch`, direkte numerische Auswahl und andere Legacy-Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Bei der interaktiven Auswahl erscheint eine Warnung, bevor eine inkompatible Sitzung zugelassen wird. Falls Auswahl oder Aktivierung dennoch fehlschlagen, startet das System normalerweise mit einem RAM-Upper und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie Modus, Version, Edition, Union-Dateisystem, Größe, Status und modusspezifische Einstellungen pro Sitzung.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden und keinen Beweis für den aktuellen Laufzeitstatus darstellen. Bearbeiten oder verschieben Sie nummerierte Sitzungsdaten nicht, während eine Sitzung eingehängt ist; verwenden Sie den MiniOS-Sitzungsmanager oder `minios-session`.

## Aktive und laufende Sitzungen

Diese Begriffe beschreiben unterschiedliche Zustände:

- Die **aktive** Sitzung ist standardmäßig für den nächsten Start ausgewählt.
- Begrifflich ist die **laufende** Sitzung diejenige, deren beschreibbare Ebene tatsächlich die Persistenz für den aktuellen Start bereitstellt.

Das persistente `running=` Feld dokumentiert diese beabsichtigte Beziehung. Ein Absturz, ein fehlgeschlagener Union-Aufbau, ein kopierter Store oder ein unterbrochener Shutdown können dazu führen, dass es veraltet ist, selbst wenn der aktuelle Start RAM oder eine andere Sitzung verwendet. Vorgänge wie das Speichern von SquashFS erfordern daher den geschützten, boot-ID-gebundenen Current-Boot-Status des initrd und das verifizierte, eingehängte Upper; sie vertrauen nicht nur auf `running=` allein. Siehe [Aktive, laufende und Current-Boot-Zustände](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Das Aktivieren einer Sitzung ändert den nächsten Start, wechselt aber nicht das aktuelle Union-Dateisystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Die aktive Sitzung kann weder gelöscht noch direkt konvertiert werden. Eine laufende Sitzung kann in der Regel nicht gelöscht, exportiert, kopiert, vergrößert oder konvertiert werden. Die Bereinigung schützt außerdem beide IDs.

## Befehlsreferenz

Sitzungen auflisten und Speicher prüfen:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Sitzungen erstellen:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` ohne Modus wählt Native. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschalt-Strategie ist standardmäßig `shutdown`; periodisches Speichern ist standardmäßig aus.

Eine SquashFS-Sitzung speichern und konfigurieren:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gültige Intervalle für periodisches Speichern sind `30`, `60`, `120`, `240`, und `480` Minuten; `0` deaktiviert das periodische Speichern. Die Einstellungen für Abschaltung und periodisches Speichern sind unabhängig.

Exportieren und Importieren von `.tar.zst`-Archiven:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
```

Nur `.tar.zst`-Importe werden akzeptiert. Pfade und Archivmitglieder werden validiert und die Extraktion ist begrenzt. `--auto-convert` wählt einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus. Export, Kopieren und Konvertieren werden für SquashFS-Sitzungen nicht unterstützt; speichern Sie stattdessen den Snapshot und kopieren Sie das komplette inaktive Sitzungsverzeichnis.

Sitzung kopieren oder konvertieren:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` weist immer eine neue Sitzungs-ID zu. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session` um die Quelle zu erhalten. Eine Größe ist nur für ein Container-Ziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS-, dynblk-, Raw- und LUKS-Sitzungen und benötigt eine größere Zielgröße als aktuell. dynblk-Resize vergrößert zuerst das virtuelle Blockgerät und erweitert dann dessen ext4-Dateisystem; die neue virtuelle Kapazität wird nicht vorab zugewiesen. Die Bereinigung betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

Alle Befehle akzeptieren `--json`, und ein anderer Sitzungspeicher kann mit `--sessions-dir PATH` ausgewählt werden:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## SquashFS-Speicherverhalten

Eine SquashFS-Sitzung wird in RAM für die laufende beschreibbare Ebene entpackt. Beim Speichern wird ein exaktes Snapshot neu erstellt und validiert, dann wird `changes.sb`.
Es wird keine Rollback-Generation aufbewahrt. "Jetzt speichern" ist über das Tray-Icon, den MiniOS-Sitzungsmanager oder `minios-session save` unabhängig von der automatischen Richtlinie verfügbar.

Das Speichern beim Herunterfahren wird vom Core-MiniOS-Shutdown-Trigger und dem `minios-squashfs-save`-Backend umgesetzt, sodass es nicht davon abhängt, ob der MiniOS-Sitzungsmanager geöffnet oder installiert ist. Das periodische Speichern wird alle 30 Minuten von einem systemd-Timer oder einem SysV-Worker geprüft, die beide das gleiche Autosave-Backend aufrufen. Das Neuerstellen des Snapshots beansprucht CPU und schreibt das komplette Snapshot; Intervalle von einer Stunde oder länger werden empfohlen.

Während des RAM-gestützten SquashFS-Betriebs kann ein neu erfasstes und aktiviertes SquashFS-Snapshot das Ziel für das laufende Speichern übernehmen. Nach dieser Übergabe kann das alte laufende Snapshot ohne Neustart entfernt werden:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Diese Ausnahme gilt nur für eine gültige Current-Boot-SquashFS-Übergabe. Andere laufende Persistenzmodi bleiben vor dem Löschen geschützt.

## Verschlüsselung

Im LUKS-Modus wird ein ext4-Dateisystem direkt in einer LUKS2-`changes.luks`-Datei gespeichert; es gibt keine Partitionstabelle oder einen verschachtelten DynFileFS-Container. LUKS-Optionen sind nur verfügbar, wenn `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` und `losetup` vorhanden sind.

Bei der interaktiven LUKS-Erstellung wird das Passwort zweimal abgefragt. Vorgänge, die LUKS-Daten lesen oder erstellen, können das Passwort über die Standardeingabe mit `--password-stdin` einlesen.
Passwörter werden nicht in Befehlsargumenten oder Sitzungsmetadaten gespeichert. Beim Booten fragt das initrd das Passwort auf der Konsole ab und fällt bei einem Fehlschlag nicht auf unverschlüsselte Persistenz zurück.

LUKS-Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht `changes.luks`.
Das Importieren oder Konvertieren nach LUKS erstellt einen neuen verschlüsselten Container.

## Backups und fehlgeschlagene Sitzungen

Für Native-, DynFileFS-, dynblk-, Raw- und LUKS-Sitzungen verwenden Sie `export` für Backups, anstatt ein eingebundenes Sitzungsverzeichnis zu kopieren. Bewahren Sie das erzeugte Archiv auf einem anderen Gerät auf und prüfen Sie, ob es importiert werden kann, bevor Sie sich darauf verlassen. Der Import erstellt immer eine neue nummerierte Sitzung; aktivieren Sie sie explizit, wenn sie einsatzbereit ist.
Für SquashFS- und Komplettgeräte-Backup-Verfahren siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung nach vollem Speicher, unterbrochenem Schreibvorgang oder wiederholtem Erstellen leerer Sitzungen fehlschlägt, stoppen Sie alle Änderungen am betroffenen Speicher. Exportieren Sie zuerst eine lesbare, nicht laufende Sitzung, wenn möglich, und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Diagnose ohne Änderung der Sitzungsdaten starten:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Start werden Container-Dateisysteme vor der beschreibbaren Aktivierung geprüft. Schwere Fehler beim Dateisystem-Check bewahren den Container zur Wiederherstellung, anstatt ihn beschreibbar einzubinden. SquashFS erkennt einen nicht bereinigten vorherigen Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Sitzungen nur über den MiniOS-Sitzungsmanager oder `minios-session delete` löschen; entfernen Sie Sitzungsverzeichnisse nicht manuell.
