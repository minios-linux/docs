# Sitzungsverwaltung in MiniOS

MiniOS-Sitzungen bewahren Änderungen am Live-System über Neustarts hinweg. Jede Sitzung ist ein nummeriertes Verzeichnis unter `minios/changes/`; die schreibgeschützten MiniOS-Module bleiben unverändert und die gewählte Sitzung stellt die beschreibbare Union-Filesystem-Schicht bereit.

Verwenden Sie den Sitzungsmanager aus einem laufenden MiniOS-System:

```bash
minios-session-manager
```

Das entsprechende Kommandozeilen-Tool ist `minios-session`. Für Befehle, die Änderungen vornehmen, sind Administratorrechte erforderlich, daher verwenden die folgenden Beispiele `sudo`.

## Sitzungsmodi

| Modus | Speicherung | Hauptbeschränkungen |
|------|-------------|----------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem wie ext2/3/4, Btrfs, XFS, F2FS oder ReiserFS. |
| `dynfilefs` | Erweiterbarer ext4-Container, aufgeteilt in Backing-Dateien | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Erfordert das DynFileFS-Backend. |
| `raw` | Feste Größe: `changes.img` mit ext4-Inhalt | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. |
| `luks` | LUKS2-verschlüsselter `changes.luks` mit ext4-Inhalt | Erfordert `cryptsetup`, Loop-Unterstützung und den MiniOS-initrd-LUKS-Hook. |
| `squashfs` | Komprimierter Snapshot in `changes.sb` | Speichern erfordert ein POSIX-Persistenzdateisystem, das Links, Besitzrechte, Modi, xattrs, ACLs, Fähigkeiten und Whiteouts erhalten kann. |

`dynfilefs`, `raw` und `luks`, die mit `minios-session` erstellt wurden, haben standardmäßig 4000 MB. Größen verwenden dezimale `MB`, `GB` oder `TB`-Einheiten und sind auf 1 TB begrenzt. Raw- und LUKS-Dateien sind auf FAT32 auf 4000 MB limitiert. Container-Resize-Operationen können eine Sitzung nur vergrößern; Verkleinerungen werden nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Wahl auf einem kompatiblen Dateisystem. Verwenden Sie DynFileFS, wenn das Persistenzdateisystem keine Linux-Metadaten abbilden kann. Verwenden Sie Raw, wenn eine feste Zuweisung erforderlich ist, LUKS, wenn die Sitzung verschlüsselt werden muss, und SquashFS für einen exakten, komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das tatsächliche Persistenzdateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Auf schreibgeschützten Medien kann keine Sitzung erstellt werden. Die SquashFS-Aktivierung auf FAT32/NTFS/exFAT bleibt deaktiviert, bis ein metadatenbewahrender Staging-Arbeitsbereich verfügbar ist.

## Boot-Auswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten normalerweise Resume-, Neu-, Auswahl- und Nicht-Persistent-Einträge.

| Parameter | Bedeutung |
|-----------|----------|
| `perch` | Persistenz anfordern. |
| `perchdir=resume` | Die Standardsitzung fortsetzen. Dies ist bestmöglich und läuft im Speicher weiter, wenn keine beschreibbare, kompatible Sitzung verfügbar ist. |
| `perchdir=new` | Eine neue nummerierte Sitzung anlegen. |
| `perchdir=ask` | Eine bestehende Sitzung auswählen oder beim Booten eine neue erstellen. |
| `perchdir=<id>` | Diese nummerierte Sitzung direkt auswählen. |
| `perchdir=<device/path>` | Einen Persistenzspeicherort auf einem Gerät verwenden, einschließlich `/dev/...` und `label:...`-Formen, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | `native`, `dynfilefs`, `raw`, `luks` oder `squashfs` setzen. |
| `perchsize=<size>` | Neue oder größere Containergröße festlegen; reine Werte sind MB und `MB`, `GB` und `TB`-Suffixe werden akzeptiert. |

Wird für eine neue Sitzung kein Modus angegeben, verwendet der Bootvorgang den Native-Modus. Bei FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw- oder LUKS-Boot-Container hat standardmäßig 4000 MB; eine neue DynFileFS-Boot-Sitzung ohne `perchsize` wird anhand des verfügbaren Speicherplatzes unter Beibehaltung einer Sicherheitsreserve dimensioniert. SquashFS-Sitzungen werden mit dem Sitzungsmanager oder `minios-session create squashfs` aus dem laufenden System aufgenommen; `perchdir=new perchmode=squashfs` erstellt kein Snapshot im initrd.

Beim Fortsetzen prüft MiniOS die aufgezeichnete Version, Edition, das Union-Filesystem und den Modus. Der normale `resume`-Pfad erstellt eine neue Sitzung, anstatt eine inkompatible zu ersetzen. Die interaktive Auswahl zeigt eine Warnung an, bevor eine inkompatible Sitzung zugelassen wird.

Der Sitzungsstore hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie pro Sitzung Modus, Version, Edition, Union-Filesystem, Größe, Status und modusspezifische Einstellungen. Es handelt sich um die Konfiguration, die vom Boot-Implementierung übernommen wird. Bearbeiten Sie diese Datei nicht und verschieben Sie keine nummerierten Sitzungsdaten, während eine Sitzung eingehängt ist; verwenden Sie stattdessen den Sitzungsmanager oder `minios-session`.

## Aktive und laufende Sitzungen

Diese Begriffe beschreiben unterschiedliche Zustände:

- Die **aktive** Sitzung ist die Standardauswahl für den nächsten Bootvorgang.
- Die **laufende** Sitzung stellt die Persistenz für den aktuellen Boot bereit.

Das Aktivieren einer Sitzung ändert den nächsten Boot, wechselt aber nicht das aktuelle Union-Filesystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Die aktive Sitzung kann nicht gelöscht oder direkt konvertiert werden. Eine laufende Sitzung kann normalerweise nicht gelöscht, exportiert, kopiert, vergrößert oder konvertiert werden. Auch das Aufräumen schützt beide IDs.

## Befehlsreferenz

Sitzungen auflisten und den Store inspizieren:

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

`create` ohne Modus wählt nativ aus. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschaltpolitik ist standardmäßig `shutdown`; periodisches Speichern ist standardmäßig deaktiviert.

SquashFS-Sitzung speichern und konfigurieren:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gültige Intervalle für periodisches Speichern sind `30`, `60`, `120`, `240` und `480` Minuten; `0` deaktiviert das periodische Speichern. Die Einstellungen für Abschaltung und periodisches Speichern sind unabhängig voneinander.

`.tar.zst`-Archive exportieren und importieren:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Es werden nur `.tar.zst`-Importe akzeptiert. Pfade und Archivmitglieder werden validiert, und die Extraktion ist begrenzt. `--auto-convert` wählt einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus aus. Export, Kopieren und Konvertierung werden für SquashFS-Sitzungen nicht unterstützt; speichern Sie stattdessen den Snapshot und kopieren Sie das komplette inaktive Sitzungsverzeichnis.

Sitzung kopieren oder konvertieren:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` weist immer eine neue Sitzungs-ID zu. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session`, um die Quelle zu erhalten. Eine Größe ist nur für ein Container-Ziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS-, raw- und LUKS-Sitzungen und erfordert eine größere Größe als die aktuelle. Bereinigen betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

Alle Befehle akzeptieren `--json`, und ein anderer Sitzungs-Store kann mit `--sessions-dir PATH` ausgewählt werden:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## SquashFS-Speicherverhalten

Eine SquashFS-Sitzung wird für die laufende beschreibbare Schicht in den RAM entpackt. Beim Speichern wird ein exakter Snapshot neu erstellt und validiert, dann `changes.sb` atomar ersetzt. Es wird keine Rollback-Generation aufbewahrt. "Jetzt speichern" ist über das Tray-Icon, den Sitzungsmanager oder `minios-session save` unabhängig von der automatischen Strategie verfügbar.

Das Speichern beim Herunterfahren wird durch den MiniOS-Shutdown-Trigger und das `minios-squashfs-save`-Backend umgesetzt, sodass es nicht davon abhängt, ob der Sitzungsmanager geöffnet oder installiert ist. Das periodische Speichern wird alle 30 Minuten durch einen systemd-Timer oder einen SysV-Worker geprüft; beide rufen dasselbe Autosave-Backend auf. Das Neuerstellen des Snapshots benötigt CPU und schreibt den kompletten Snapshot; Intervalle von einer Stunde oder länger werden empfohlen.

Während des RAM-basierten SquashFS-Betriebs kann ein neu erstellter und aktivierter SquashFS-Snapshot das aktuelle Speichertarget übernehmen. Nach dieser Übergabe kann der alte laufende Snapshot ohne Neustart entfernt werden:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Diese Ausnahme gilt nur für eine gültige SquashFS-Übergabe im aktuellen Boot. Andere laufende Persistenzmodi bleiben vor dem Löschen geschützt.

## Verschlüsselung

Der LUKS-Modus speichert ein ext4-Dateisystem direkt in einer LUKS2-`changes.luks`-Datei; es gibt keine Partitionstabelle oder verschachtelten DynFileFS-Container. LUKS-Optionen sind nur verfügbar, wenn `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` und `losetup` vorhanden sind.

Die interaktive LUKS-Erstellung fragt das Passwort zweimal ab. Vorgänge, die LUKS-Daten lesen oder erstellen, können diese über die Standardeingabe mit `--password-stdin` einlesen. Passwörter werden nicht in Befehlsargumenten oder Sitzungsmetadaten abgelegt. Beim Boot fragt das initrd das Passwort auf der Konsole ab und weicht nicht auf unverschlüsselte Persistenz aus, falls die Aktivierung fehlschlägt.

LUKS-Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht `changes.luks`. Das Importieren oder Konvertieren in LUKS erstellt immer einen neuen verschlüsselten Container.

## Backups und Wiederherstellung

Für native, DynFileFS-, raw- und LUKS-Sitzungen verwenden Sie `export` für Backups, anstatt ein eingebundenes Sitzungsverzeichnis zu kopieren. Bewahren Sie das resultierende Archiv auf einem anderen Gerät auf und prüfen Sie, ob es aufgelistet oder importiert werden kann, bevor Sie sich darauf verlassen. Der Import erstellt immer eine neue nummerierte Sitzung; aktivieren Sie sie explizit, wenn sie einsatzbereit ist. Für SquashFS- und Whole-Device-Backup-Verfahren siehe [Backup und Wiederherstellung](/administration/Backup-Recovery.md).

Für die Wiederherstellung nach einem vollen Speichermedium, einem unterbrochenen Schreibvorgang oder wiederholter Erstellung leerer Sitzungen folgen Sie der speziellen [DynFileFS- und dynblk-Wiederherstellungsanleitung](./DynFileFS-Recovery.md).

Diagnose starten, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Booten werden Container-Dateisysteme vor der schreibbaren Aktivierung geprüft. Schwere Fehler bei der Dateisystemprüfung bewahren den Container zur Wiederherstellung, anstatt ihn schreibbar einzubinden. SquashFS erkennt einen nicht bereinigten vorherigen Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Sitzungen nur über den Session Manager oder `minios-session delete` löschen; Sitzungsverzeichnisse nicht manuell entfernen.
