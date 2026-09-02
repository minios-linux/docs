---
updated: 2026-08-26
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

| Modus | Speicherung | Hauptbeschränkungen |
|------|---------|------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem wie ext2/3/4, Btrfs, XFS, F2FS oder ReiserFS. |
| `dynfilefs` | Erweiterbarer ext4-Container, aufgeteilt in Backing-Dateien | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Erfordert das DynFileFS-Backend. |
| `raw` | Feste Größe `changes.img` mit ext4-Inhalt | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. |
| `luks` | LUKS2-verschlüsselter `changes.luks` mit ext4-Inhalt | Erfordert `cryptsetup`, Loop-Unterstützung und den MiniOS initrd LUKS-Hook. |
| `squashfs` | Komprimierter Snapshot in `changes.sb` | Das Speichern erfordert ein POSIX-Persistenzdateisystem, das Links, Besitzrechte, Modi, xattrs, ACLs, Capabilities und Whiteouts erhalten kann. |

`dynfilefs`, `raw` und `luks`, die mit `minios-session` erstellt wurden, haben standardmäßig 4000 MiB. Größenwerte werden in MiB zugewiesen; die Suffixe `GB` und `TB` entsprechen 1000 bzw. 1.000.000 MiB. Der MiniOS-Sitzungsmanager begrenzt Raw- und LUKS-Dateien auf 4000 MiB bei FAT32. Verlassen Sie sich nicht darauf als generelle initrd-Garantie: Eine zu große Raw-Boot-Anfrage kann bis zur Zuweisung gelangen und dann fehlschlagen, statt verkleinert zu werden. Container-Resize-Operationen können eine Sitzung nur vergrößern; Verkleinerungen werden nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Wahl auf einem kompatiblen Dateisystem.
Verwenden Sie DynFileFS, wenn das Persistenzdateisystem keine Linux-Metadaten abbilden kann.
Verwenden Sie Raw, wenn eine feste Zuweisung erforderlich ist, LUKS, wenn die Sitzung verschlüsselt sein muss, und SquashFS für einen exakten komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das tatsächliche Persistenzdateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Auf schreibgeschützten Medien kann keine Sitzung erstellt werden. Das initrd kann einen bestehenden SquashFS-Snapshot, der auf beschreibbarem FAT, exFAT oder NTFS gespeichert ist, lesen und aktivieren, da es den Snapshot in ein temporäres ext4-Upper extrahiert. Das Erstellen oder exakte Speichern eines Snapshots ist jedoch anders: Der private Arbeitsbereich muss sich auf einem geeigneten POSIX-Dateisystem befinden, das Linux-Metadaten und Union-Whiteouts erhält.

## Boot-Auswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten in der Regel Einträge für Fortsetzen, Neu, Auswahl und Nicht-Persistent. Die maßgebliche Beschreibung der Selektor-, Kompatibilitäts-, Fallback- und Aktivierungslogik findet sich unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den alten Best-Effort-Fortsetzungsweg. Es wird der Standardwert aus den Metadaten versucht, aber kein Ersatz erstellt, wenn keiner nutzbar ist. |
| `perchdir=resume` | Setzt den Standardwert aus den Metadaten fort und erlaubt, falls dieser fehlt oder inkompatibel ist, dem initrd einen neuen kompatiblen Ersatz zu erstellen. Dies entspricht dem aktuellen Verhalten beim Fortsetzen im Boot-Menü. |
| `perchdir=new` | Eine neue nummerierte Sitzung anlegen. |
| `perchdir=ask` | Eine bestehende Sitzung auswählen oder beim Booten eine neue erstellen. |
| `perchdir=<id>` | Diese nummerierte Sitzung direkt auswählen. |
| `perchdir=<device/path>` | Eine Persistenz-Position auf einem Gerät verwenden, einschließlich `/dev/...` und `label:...`-Formate, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | Setze `native`, `dynfilefs`, `raw`, `luks`, oder `squashfs`. |
| `perchsize=<size>` | Eine neue oder größere Containergröße festlegen; reine Werte werden in MiB zugewiesen und `MB`, `GB`, und `TB`-Suffixe werden akzeptiert. |

Wenn für eine neue Sitzung kein Modus angegeben ist, wird beim Booten der native Modus verwendet. Auf FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw- oder LUKS-Boot-Container ist standardmäßig 4000 MiB groß; eine neue DynFileFS-Boot-Sitzung ohne `perchsize` wird anhand des verfügbaren Speicherplatzes unter Berücksichtigung einer Sicherheitsreserve dimensioniert.
SquashFS-Sitzungen werden aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`; `perchdir=new perchmode=squashfs` erstellt kein Snapshot im initrd.

Beim Fortsetzen prüft MiniOS die gespeicherte Version, Edition, das Union-Dateisystem und den Modus. Ein wörtliches `perchdir=resume` kann eine neue Sitzung erstellen, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Reine `perch`, direkte numerische Auswahl und andere alte Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Bei interaktiver Auswahl erscheint eine Warnung, bevor eine inkompatible Sitzung zugelassen wird. Schlägt die Auswahl oder Aktivierung weiterhin fehl, startet das Booten normalerweise mit einem RAM-Upper und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie pro Sitzung Modus, Version, Edition, Union-Dateisystem, Größe, Status und modusspezifische Einstellungen.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden, aber nicht für den aktuellen Laufzeitstatus bürgen. Bearbeiten oder verschieben Sie nummerierte Sitzungsdaten nicht, solange eine Sitzung eingehängt ist; verwenden Sie stattdessen den MiniOS-Sitzungsmanager oder `minios-session`.

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

`create` ohne Modus wählt nativ aus. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschalt-Strategie ist standardmäßig `shutdown`; periodisches Speichern ist standardmäßig deaktiviert.

Eine SquashFS-Sitzung speichern und konfigurieren:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gültige periodische Intervalle sind `30`, `60`, `120`, `240`, und `480` Minuten; `0` deaktiviert das periodische Speichern. Die Einstellungen für Abschalten und periodisches Speichern sind unabhängig voneinander.

Exportieren und Importieren von `.tar.zst`-Archiven:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Nur `.tar.zst`-Importe werden akzeptiert. Pfade und Archiv-Inhalte werden geprüft, und die Extraktion ist begrenzt. `--auto-convert` wählt automatisch einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus aus. Export, Kopieren und Konvertieren werden für SquashFS-Sitzungen nicht unterstützt; speichern Sie stattdessen das Snapshot und kopieren Sie das komplette inaktive Sitzungsverzeichnis.

Sitzung kopieren oder konvertieren:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` weist immer eine neue Sitzungs-ID zu. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session` um die Quelle zu bewahren. Eine Größe ist nur für ein Container-Ziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS-, Raw- und LUKS-Sitzungen und erfordert eine größere Zielgröße als die aktuelle. Die Bereinigung betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

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

Für native, DynFileFS-, Raw- und LUKS-Sitzungen verwenden Sie `export` für Backups, statt ein eingehängtes Sitzungsverzeichnis zu kopieren. Bewahren Sie das resultierende Archiv auf einem anderen Gerät auf und prüfen Sie, ob es importiert werden kann, bevor Sie sich darauf verlassen. Beim Import wird immer eine neue nummerierte Sitzung erstellt; aktivieren Sie diese explizit, wenn sie einsatzbereit ist.
Für SquashFS- und Komplettgeräte-Backup-Verfahren siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung nach vollem Speicher, unterbrochenem Schreibvorgang oder wiederholtem Anlegen leerer Sitzungen fehlschlägt, verändern Sie den betroffenen Speicher nicht weiter. Exportieren Sie zuerst eine lesbare, nicht laufende Sitzung, wenn möglich, und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Beginnen Sie die Diagnose, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Booten werden Container-Dateisysteme vor der beschreibbaren Aktivierung geprüft. Schwere Fehler bei der Dateisystemprüfung bewahren den Container zur Wiederherstellung, anstatt ihn beschreibbar einzuhängen. SquashFS erkennt einen nicht bereinigten vorherigen Zustand und stellt das zuletzt erfolgreich gespeicherte Snapshot wieder her. Löschen Sie Sitzungen nur über den MiniOS-Sitzungsmanager oder `minios-session delete`; entfernen Sie Sitzungsverzeichnisse nicht manuell.
