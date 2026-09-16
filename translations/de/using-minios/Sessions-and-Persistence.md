---
updated: 2026-09-16
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

| Modus | Speicher | Hauptbeschränkungen | MiniOS LUKS2-Schicht |
|------|---------|------------------|--------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares Dateisystem, das die Linux-Metadaten erhält und für das MiniOS Operationen prüft. Die Kapazität entspricht dem verfügbaren Speicherplatz im Backend; `perchsize` ist nicht relevant. | Nein |
| `dynfilefs` | Erweiterbares ext4- `virtual.dat`-Dateisystem, gestützt durch Format-400-Segmentdateien | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Das Nutzdaten-Image ist schlank, aber der Mapping-Index wächst mit der deklarierten logischen Kapazität. | Ja |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das von `volumeNNN.db`-Dateien unterstützt wird | Erfordert das DynBlk CLI, Kernel-Modul und initrd-Unterstützung. Die beim Booten erstellte Größe beträgt standardmäßig bis zu 16 GiB; das Format-Limit liegt bei 512 GiB. Das Sparse-Mapping RAM wird separat budgetiert. | Ja |
| `raw` | Einzelne `changes.img`-Datei mit ext4 | Feste logische Kapazität mit expliziter Erweiterung. Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen; bei FAT32 ist die Größe auf 4000 MiB begrenzt. | Ja |
| `squashfs` | Komprimierter Snapshot in `changes.sb`; zur Laufzeit wird das beschreibbare Upper in RAM rekonstruiert | `perchsize` ist nicht relevant. Vorhandene Snapshots können von unterstützten beschreibbaren Medien wiederhergestellt werden; für das exakte Speichern ist jedoch ein POSIX-fähiges Staging-Dateisystem erforderlich. | Nein |

Raw, DynFileFS und DynBlk können optional eine LUKS2-Verschlüsselungsschicht enthalten. Das Speicher-Backend bleibt der Sitzungsmodus, und die Sitzungsmetadaten erfassen die Verschlüsselung separat. DynFileFS und Raw, die mit `minios-session` erstellt werden, sind standardmäßig 4000 MiB groß; DynBlk ist standardmäßig 16 GiB. Die Größenangaben werden in MiB zugewiesen; `GB` und `TB`-Suffixe entsprechen 1000 bzw. 1.000.000 MiB. Raw ist auf FAT32 – unabhängig von Verschlüsselung – auf 4000 MiB begrenzt. DynFileFS-Nutzdaten wachsen bei Bedarf, aber der Format-400-Index wird für die volle logische Kapazität angelegt und benötigt etwa 2 MiB RAM sowie etwa 2 MiB Backend-Speicher pro GiB. Die DynBlk-Kapazität ist schlank und das Laufzeit-Mapping ist spärlich: Dichte Mappings kosten etwa 8 MiB/GiB, während ungenutzte virtuelle Kapazität keinen Mapping-Chunk belegt. Der DynBlk-Treiber wählt automatisch ein Mapping-Budget von etwa 25 % des nutzbaren RAM, begrenzt auf 4096 MiB; MiniOS überschreibt diese Vorgabe nicht. Tatsächliche Schreibvorgänge sind weiterhin durch den freien Speicherplatz des unteren Dateisystems und die Ressourcenverfügbarkeit des Backends begrenzt. Container-Resize-Operationen können eine Sitzung nur vergrößern; Verkleinerungen werden nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Option auf einem kompatiblen Dateisystem.
Verwenden Sie DynFileFS, wenn das Persistenz-Dateisystem keine Linux-Metadaten speichern kann.
Verwenden Sie DynBlk, wenn Sie ein echtes Kernel-Blockgerät mit schlanken Backing-Dateien benötigen; der Treiber kann mehrere unabhängige DynBlk-Volumes gleichzeitig anbinden, und der Sitzungsmanager nutzt den vom Treiber zurückgegebenen Gerätepfad, anstatt anzunehmen, dass `/dev/dynblk0` frei ist.
Verwenden Sie Raw, wenn eine feste Zuweisung erforderlich ist, fügen Sie LUKS2 hinzu, wenn die Sitzung verschlüsselt werden muss, und nutzen Sie SquashFS für einen exakten komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das tatsächliche Persistenz-Dateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Auf schreibgeschützten Medien kann keine Sitzung erstellt werden. Das initrd kann einen vorhandenen SquashFS-Snapshot, der auf FAT, exFAT oder NTFS gespeichert ist, einlesen und aktivieren, da der Snapshot in ein temporäres ext4-Upper extrahiert wird. Das Erstellen oder exakte Speichern eines Snapshots ist jedoch anders: Der private Staging-Arbeitsbereich muss sich auf einem geeigneten POSIX-Dateisystem befinden, das Linux-Metadaten und Union-Whiteouts erhält.

## Boot-Auswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS Boot-Menüs bieten in der Regel Einträge für Fortsetzen, Neu, Auswahl und Nicht-Persistent. Die maßgebliche Beschreibung der Selektor-, Kompatibilitäts-, Fallback- und Aktivierungslogik findet sich unter[Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den Legacy-Best-Effort-Fortsetzungsweg. Es wird der Standardwert aus den Metadaten versucht, aber kein Ersatz erstellt, wenn keiner nutzbar ist. |
| `perchdir=resume` | Setzt den Standardwert aus den Metadaten fort und erlaubt, falls dieser fehlt oder inkompatibel ist, dem initrd die Erstellung eines neuen kompatiblen Ersatzes. Dies ist das aktuelle Verhalten beim Fortsetzen über das Boot-Menü. |
| `perchdir=new` | Erstellt eine neue nummerierte Sitzung. |
| `perchdir=ask` | Wählt eine bestehende Sitzung aus oder erstellt eine während des Bootvorgangs. |
| `perchdir=<id>` | Wählt diese nummerierte Sitzung direkt aus. |
| `perchdir=<device/path>` | Verwendet einen Persistenzspeicherort auf einem Gerät, einschließlich`/dev/...` und `label:...`-Formate, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | Setzt `native`, `dynfilefs`, `dynblk`, `raw`, oder `squashfs`. |
| `perchencrypt=luks` | Verschlüsselt eine neu erstellte Raw-, DynFileFS- oder DynBlk-Sitzung mit LUKS2. Bestehende Sitzungen übernehmen die Verschlüsselung nur aus den Metadaten. |
| `perchcomp=<codec>` | Wählt DynBlk-Backend-Kompression für eine neue DynBlk-Sitzung. Die Kompression wird auf `none` erzwungen, wenn DynBlk in LUKS2 eingebettet ist. |
| `perchsize=<size>` | Legt eine neue oder größere Containergröße fest; reine Zahlenwerte werden in MiB zugewiesen und `MB`, `GB`, und `TB`-Suffixe werden akzeptiert. |

Wird für eine neue Sitzung kein Modus angegeben, verwendet der Bootvorgang den nativen Modus. Auf FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw-Container hat standardmäßig 4000 MiB. Neue DynFileFS- und DynBlk-Boot-Sitzungen ohne `perchsize` nutzen bis zu 16 GiB; wenn nach der Sicherheitsreserve weniger Speicherplatz verbleibt, wird die automatische Größe reduziert. DynFileFS berücksichtigt auch den Index-Overhead und das RAM-Limit. Explizites DynBlk-Wachstum ist auf 512 GiB begrenzt.
SquashFS-Sitzungen können aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`. Die Initrd-Einrichtung erstellt nur Metadaten der Generation Null und hält die beschreibbare obere Ebene in RAM. Das laufende System erstellt den ersten `changes.sb` Snapshot bei Bedarf oder beim Herunterfahren.

Beim Fortsetzen prüft MiniOS die aufgezeichnete Version, Edition, das Union-Dateisystem und den Modus. Ein explizites `perchdir=resume` kann eine neue Sitzung erstellen, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Reine `perch`, direkte numerische Auswahl und andere Legacy-Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Bei interaktiver Auswahl wird eine Warnung angezeigt, bevor eine inkompatible Sitzung zugelassen wird. Falls Auswahl oder Aktivierung dennoch fehlschlagen, startet das System normalerweise mit einer RAM-oberen Ebene und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie pro Sitzung Modus, Version, Edition, Union-Dateisystem, Größe, Status und modusspezifische Einstellungen.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden, aber für sich allein keinen Nachweis über den aktuellen Laufzeitstatus liefern. Bearbeiten oder verschieben Sie keine nummerierten Sitzungsdaten, während eine Sitzung eingehängt ist; verwenden Sie den MiniOS-Sitzungsmanager oder `minios-session`.

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

Sitzungen auflisten und den Store prüfen:

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
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` ohne Modus wählt nativ aus. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschaltregel ist standardmäßig `shutdown`; periodisches Speichern ist standardmäßig deaktiviert.

Eine SquashFS-Sitzung speichern und konfigurieren:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gültige Intervalle für periodisches Speichern sind `30`, `60`, `120`, `240`, und `480` Minuten; `0` deaktiviert das periodische Speichern. Abschalt- und periodische Einstellungen sind unabhängig voneinander.

Exportieren und Importieren von `.tar.zst`-Archiven:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Nur `.tar.zst`-Importe werden akzeptiert. Pfade und Archiv-Inhalte werden überprüft, und die Extraktion ist begrenzt. `--auto-convert` wählt einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus. Export, Kopieren und Konvertierung werden für SquashFS-Sitzungen nicht unterstützt; speichern Sie stattdessen den Snapshot und kopieren Sie das komplette inaktive Sitzungsverzeichnis.

Sitzung kopieren oder konvertieren:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` ist eine logische Dateisystem-Kopie und weist immer eine neue Sitzungs-ID zu. Backend, Kapazität oder Verschlüsselung können geändert werden; neue ext4- und LUKS-Identitäten werden erstellt. `clone` kopiert ein getrenntes Backend physisch und erhält dessen LUKS-Header, Keyslots, LUKS-UUID und ext4-UUID. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session` um die Quelle zu erhalten. Eine Größe ist nur für ein Container-Ziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS, DynBlk und Raw-Sitzungen, auch in verschlüsselter Form, und erfordert eine größere Zielgröße als die aktuelle. DynBlk-Resize vergrößert zuerst das virtuelle Blockgerät und erweitert dann das ext4-Dateisystem; die neue virtuelle Kapazität wird dabei nicht vorab zugewiesen. Die Bereinigung betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

Alle Befehle akzeptieren `--json`, und ein anderer Sitzungs-Store kann mit `--sessions-dir PATH` ausgewählt werden:

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

LUKS2 ist eine optionale Schicht über Raw `changes.img`, DynFileFS `virtual.dat`, oder direkt auf dem DynBlk-Gerät. Diese Option steht nur zur Verfügung, wenn `/run/initramfs/etc/minios-initramfs-crypt` enthalten ist `luks-layer-v1` und die Tools und Funktionen des gewählten Backends verfügbar sind.

Bei der interaktiven Erstellung von LUKS wird das Passwort zweimal abgefragt. Vorgänge zum Lesen oder Erstellen von LUKS-Daten können das Passwort über die Standard-Eingabe mit `--password-stdin`.
Passwörter werden nicht in Befehlsargumenten oder Sitzungsmetadaten gespeichert. Beim Systemstart fordert das initrd das Passwort auf der Konsole an. Nach drei fehlgeschlagenen Versuchen wird der Bootvorgang abgebrochen; MiniOS fährt nicht mit Klartext, RAM, einem anderen Backend oder einer Ersatzsitzung unter derselben Anfrage fort.

Verschlüsselte Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht das verschlüsselte Backend. Beim Importieren, Kopieren oder Konvertieren nach LUKS wird ein neues verschlüsseltes Backend mit neuen Identitäten erstellt.

## Backups und fehlgeschlagene Sitzungen

Für native, DynFileFS, DynBlk und Raw-Sitzungen, einschließlich verschlüsselter Varianten, verwenden Sie `export` für logische Backups anstelle des Kopierens eines gemounteten Sitzungsverzeichnisses. Bewahren Sie das erstellte Archiv auf einem anderen Gerät auf und prüfen Sie, ob es importiert werden kann, bevor Sie sich darauf verlassen. Beim Import wird immer eine neue, nummerierte Sitzung erstellt; aktivieren Sie diese explizit, sobald sie einsatzbereit ist.
Für SquashFS- und Komplettgeräte-Backup-Verfahren siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung fehlschlägt, nachdem der Speicher voll ist, ein Schreibvorgang unterbrochen wurde oder wiederholt leere Sitzungen entstehen, nehmen Sie keine weiteren Änderungen am betroffenen Speicher vor. Exportieren Sie nach Möglichkeit zuerst eine lesbare, nicht laufende Sitzung und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Beginnen Sie die Diagnose, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Systemstart werden Container-Dateisysteme vor dem schreibbaren Aktivieren geprüft. Schwere Fehler bei der Dateisystemprüfung bewahren den Container zur Wiederherstellung, anstatt ihn schreibbar einzubinden. SquashFS erkennt einen nicht ordnungsgemäß beendeten Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Sitzungen löschen Sie ausschließlich über den MiniOS-Sitzungsmanager oder `minios-session delete`; entfernen Sie Sitzungsverzeichnisse nicht manuell.
