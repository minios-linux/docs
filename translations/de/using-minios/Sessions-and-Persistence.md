---
updated: 2026-09-26
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
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares Dateisystem, das die Linux-Metadaten und Operationen erhält, die MiniOS prüft. Die Kapazität entspricht dem verfügbaren Speicherplatz im Backend; `perchsize` ist nicht relevant. | Nein |
| `dynfilefs` | Erweiterbares ext4-`virtual.dat`-Dateisystem, das von format-400 Segmentdateien unterstützt wird | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Das Payload ist schlank, aber der Mapping-Index wächst mit der deklarierten logischen Kapazität. | Ja |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das von `volumeNNN.db`-Dateien unterstützt wird | Erfordert das DynBlk-CLI, Kernel-Modul und initrd-Unterstützung. Die beim Booten erstellte Größe beträgt standardmäßig bis zu 16 GiB; das Maximum wird von `dynblk limits` gemeldet. Auf der Festplatte gespeicherte Zuordnungen verwenden einen begrenzten Metadaten-Cache. | Ja |
| `vmdk` | Schlankes ext4-Dateisystem auf einer standardmäßig geteilten, sparsamen VMDK, bereitgestellt durch den DynBlk-Treiber | Verwendet `volume.vmdk` und `volume-sNNN.vmdk`. Keine Komprimierung. Erfordert `vmdk-session-v1` im laufenden initrd-Fähigkeitsmarker. Gleicher manueller Standardwert von 16 GiB wie DynBlk; prüfen Sie `dynblk limits --format vmdk` für Begrenzungen. | Ja |
| `raw` | Einzelne `changes.img`-Datei mit ext4 | Feste logische Kapazität, die nur explizit vergrößert werden kann. Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen; bei FAT32 ist die Größe auf 4000 MiB begrenzt. | Ja |
| `squashfs` | Komprimierter Snapshot in `changes.sb`; zur Laufzeit wird die beschreibbare obere Schicht in RAM rekonstruiert | `perchsize` ist nicht relevant. Vorhandene Snapshots können von unterstützten beschreibbaren Medien wiederhergestellt werden; für exaktes Speichern ist ein geeignetes POSIX-fähiges Persistenz-Backend erforderlich. | Nein |

Raw-, DynFileFS-, DynBlk- und VMDK-Container können optional eine LUKS2-Verschlüsselungsschicht enthalten. Das Speicher-Backend bleibt dabei der Sitzungsmodus, und Sitzungsmetadaten erfassen die Verschlüsselung separat. DynFileFS und Raw, die mit `minios-session` erstellt wurden, haben standardmäßig 4000 MiB; DynBlk und VMDK standardmäßig 16 GiB. Größenwerte werden in MiB zugewiesen; `GB` und `TB`-Suffixe entsprechen 1000 bzw. 1.000.000 MiB. Raw ist auf FAT32, unabhängig von Verschlüsselung, auf 4000 MiB begrenzt. DynFileFS-Payload-Daten wachsen nach Bedarf, aber der format-400-Index wird für die volle logische Kapazität angelegt und benötigt etwa 2 MiB RAM sowie ca. 2 MiB Backendspeicher pro GiB. DynBlk speichert Mapping-Tabellen auf der Festplatte und einen begrenzten Metadaten-Cache in RAM, standardmäßig 1 MiB statt eines prozentualen Anteils von RAM. Die Vektoren für Bereiche/Dateien und Verzeichnisse wachsen mit deklarierten Teilen, während die Payload-Befüllung keine vollständige resident Map benötigt. Die installierte Kapazitätsgrenze kann mit `dynblk limits --format dynblk` abgefragt werden. Tatsächliche Schreibvorgänge sind durch den freien Speicherplatz des unteren Dateisystems und die Ressourcenfreigabe des Backends begrenzt. Container-Resize-Operationen können eine Sitzung nur vergrößern; Verkleinerungen werden nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Option auf einem kompatiblen Dateisystem.
Verwenden Sie DynFileFS, wenn das Persistenz-Dateisystem keine Linux-Metadaten darstellen kann.
Nutzen Sie DynBlk, wenn Sie ein echtes Kernel-Blockgerät mit Thin-Backed-Dateien wünschen; der Treiber kann mehrere unabhängige DynBlk-Volumes gleichzeitig anbinden, und der Sitzungsmanager verwendet den vom Treiber zurückgegebenen Gerätepfad, statt anzunehmen, dass `/dev/dynblk0` frei ist. DynBlk und VMDK sind nicht verfügbar, solange UEFI Secure Boot aktiviert ist, da MiniOS das externe DynBlk-Kernelmodul nicht signiert. Installer und Sitzungsmanager blenden diese Modi daher aus und lehnen explizite Erstellung ab, bevor sie versuchen, das Modul zu laden.
Verwenden Sie Raw bei fester Allokation, ergänzen Sie LUKS2 bei Verschlüsselungsbedarf und nutzen Sie SquashFS für einen exakten komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das aktuelle Persistenz-Dateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Auf schreibgeschützten Medien kann keine Sitzung erstellt werden. Das initrd kann einen bestehenden SquashFS-Snapshot, der auf FAT, exFAT oder NTFS liegt, lesen und aktivieren, da der Snapshot in ein temporäres ext4-Upper extrahiert wird. Das Erstellen oder exakte Speichern eines Snapshots ist anders: Das Persistenz-Backend muss die erforderlichen POSIX-Metadaten und eine private, dauerhafte Veröffentlichung unterstützen. Der Exact-Capture-Arbeitsbaum verwendet, wenn verfügbar, vertrauenswürdige RAM, andernfalls einen Festplattenarbeitsbereich, falls RAM nicht ausreicht.

## Boot-Auswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten in der Regel Fortsetzen-, Neu-, Auswahl- und Nicht-Persistent-Einträge. Die maßgebliche Beschreibung von Selektor-, Kompatibilitäts-, Fallback- und Aktivierungssemantik findet sich unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den Legacy-Best-Effort-Wiederherstellungspfad. Versucht den Metadaten-Standard, erstellt aber keinen Ersatz, wenn keiner nutzbar ist. |
| `perchdir=resume` | Setzt den Metadaten-Standard fort und erlaubt dem initrd, bei Abwesenheit oder Inkompatibilität einen neuen, kompatiblen Ersatz zu erstellen. Dies ist das aktuelle Verhalten des Bootmenü-Fortsetzens. |
| `perchdir=new` | Neue nummerierte Sitzung anlegen. |
| `perchdir=ask` | Vorhandene Sitzung auswählen oder beim Booten eine neue erstellen. |
| `perchdir=<id>` | Diese nummerierte Sitzung direkt auswählen. |
| `perchdir=<device/path>` | Verwenden Sie einen Persistenzspeicherort auf einem Gerät, einschließlich `/dev/...` und `label:...`-Formen, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | Setzen Sie `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, oder `squashfs`. |
| `perchencrypt=luks` | Verschlüsselt eine neu erstellte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung mit LUKS2. Bestehende Sitzungen übernehmen die Verschlüsselung nur aus den Metadaten. |
| `perchcomp=<codec>` | Wählen Sie DynBlk-Backend-Komprimierung für eine neue DynBlk-Sitzung. Die Komprimierung wird auf `none` erzwungen, wenn DynBlk in LUKS2 eingebettet ist. |
| `perchsize=<size>` | Setzt eine neue oder größere Containergröße; reine Werte werden in MiB zugewiesen und `MB`, `GB`, und `TB`-Suffixe werden akzeptiert. |

Wenn für eine neue Sitzung kein Modus angegeben ist, verwendet der Bootvorgang den Native-Modus. Bei FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw-Container hat standardmäßig 4000 MiB. Neue DynFileFS-, DynBlk- und VMDK-Boot-Sitzungen ohne `perchsize` nutzen bis zu 16 GiB; wenn nach der Sicherheitsreserve weniger Speicherplatz verbleibt, wird die automatische Größe reduziert. DynFileFS berücksichtigt auch seinen Index-Overhead und das RAM-Limit. Explizites DynBlk-Wachstum folgt der installierten Backend-Grenze, die mit `dynblk limits --format dynblk` abgefragt werden kann. Unter Secure Boot bietet initrd kein DynBlk/VMDK an und behandelt eine explizite oder fortgesetzte DynBlk/VMDK-Sitzung als nicht verfügbar, anstatt zu versuchen, das unsignierte Modul zu laden.
SquashFS-Sitzungen können aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`. Die Initrd-Einrichtung erstellt nur Metadaten der Generation Null und hält die beschreibbare obere Schicht in RAM. Das laufende System erstellt den ersten `changes.sb`-Snapshot bei Bedarf oder beim Herunterfahren.

Beim Fortsetzen prüft MiniOS die aufgezeichnete Version, Edition, das Union-Dateisystem und den Modus. Ein `perchdir=resume` kann eine neue Sitzung erstellen, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Einfache `perch`-, direkte numerische Auswahl und andere Legacy-Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Die interaktive Auswahl zeigt eine Warnung, bevor eine inkompatible Sitzung zugelassen wird. Falls Auswahl oder Aktivierung weiterhin fehlschlagen, startet der Bootvorgang wie gewohnt mit einem RAM-Upper und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie pro Sitzung Modus, Version, Edition, Union-Dateisystem, Größe, Status und modusspezifische Einstellungen.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden, jedoch kein Beweis für den aktuellen Laufzeitstatus sind. Bearbeiten oder verschieben Sie nummerierte Sitzungsdaten nicht, solange eine Sitzung eingebunden ist; verwenden Sie den MiniOS-Sitzungsmanager oder `minios-session`.

## Aktive und laufende Sitzungen

Diese Begriffe beschreiben unterschiedliche Zustände:

- Die **aktive** Sitzung ist standardmäßig für den nächsten Start ausgewählt.
- Begrifflich ist die **laufende** Sitzung diejenige, deren beschreibbare Ebene tatsächlich die Persistenz für den aktuellen Start bereitstellt.

Das persistente `running=` Feld dokumentiert diese beabsichtigte Beziehung. Ein Absturz, ein fehlgeschlagener Union-Aufbau, ein kopierter Store oder ein unterbrochener Shutdown können dazu führen, dass es veraltet ist, selbst wenn der aktuelle Start RAM oder eine andere Sitzung verwendet. Vorgänge wie das Speichern von SquashFS erfordern daher den geschützten, boot-ID-gebundenen Current-Boot-Status des initrd und das verifizierte, eingehängte Upper; sie vertrauen nicht nur auf `running=` allein. Siehe [Aktive, laufende und Current-Boot-Zustände](/reference/boot-process/Persistence-Internals#aktiver-laufender-und-aktueller-boot-status).

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
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` ohne Modus wählt Native. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschalt-Policy ist standardmäßig auf `shutdown` gesetzt; periodisches Speichern ist standardmäßig deaktiviert.

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
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Nur `.tar.zst`-Importe werden akzeptiert. Pfade und Archivmitglieder werden validiert, und die Extraktion ist begrenzt. `--auto-convert` wählt einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus. Export, Kopieren und Konvertierung werden für SquashFS-Sitzungen nicht unterstützt; speichern Sie den Snapshot und kopieren Sie stattdessen das komplette inaktive Sitzungsverzeichnis.

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

`copy` ist eine logische Dateisystemkopie und weist immer eine neue Sitzungs-ID zu. Es kann Backend, Kapazität oder Verschlüsselung ändern und erstellt neue ext4- und LUKS-Identitäten. `clone` kopiert ein getrenntes Backend physisch und behält LUKS-Header, Keyslots, LUKS-UUID und ext4-UUID bei. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session` um die Quelle zu erhalten. Eine Größe ist nur für ein Containerziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS-, DynBlk-, VMDK- und Raw-Sitzungen, auch in verschlüsselter Form, und erfordert eine größere Zielgröße als die aktuelle. DynBlk-Resize vergrößert zuerst das virtuelle Blockgerät und erweitert dann das ext4-Dateisystem; die neue virtuelle Kapazität wird nicht vorab zugewiesen. Die Bereinigung betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

Alle Befehle akzeptieren `--json`, und ein anderer Sitzungspeicher kann mit `--sessions-dir PATH` ausgewählt werden:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## SquashFS-Speicherverhalten

Eine SquashFS-Sitzung wird in RAM für die laufende beschreibbare Schicht entpackt. Beim Speichern wird ein exakter Snapshot neu erstellt und validiert, dann wird `changes.sb`.
Es wird keine Rollback-Generation aufbewahrt. "Jetzt speichern" ist über das Tray-Symbol, den MiniOS-Sitzungsmanager oder `minios-session save` unabhängig von der automatischen Richtlinie verfügbar.

Für jeden Speichervorgang kopiert MiniOS eine stabile Ansicht des modifizierten Baums in privaten RAM-Speicher, sofern genügend Arbeitsspeicher vorhanden ist. Die Komprimierung schreibt **ein** Abbild in ein privates Verzeichnis innerhalb der nummerierten Sitzung. Erst nach Überprüfung des Dateisysteminhalts, des Hashwerts, der Identität und des dauerhaften Syncs ersetzt der Saver `changes.sb`. Es gibt kein vollständiges zweites komprimiertes Abbild in RAM und keinen zweiten Schreibvorgang dieses Abbilds auf das Persistenzgerät. Ist zu wenig RAM für den Baum vorhanden, fällt nur dieser Arbeitsbaum auf die Festplatte zurück; das komprimierte Kandidat benötigt dennoch einen Schreibvorgang. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Cache- und Log-Schreibregeln.

Boot-Diagnosen für eine dauerhafte SquashFS-Sitzung werden unter `boot-logs/minios/` und `boot-logs/live/`-Verzeichnissen gespeichert. Sie sind nicht von einem erfolgreichen Shutdown-Snapshot abhängig und bleiben auch dann verfügbar, wenn die letzten Änderungen an der RAM-Upper nicht gespeichert werden konnten. Das Backend muss weiterhin beschreibbar sein; normale Journaldateien können temporär sein, wenn `LIVE_LOG_STORAGE=volatile` ausgewählt ist.

Das Speichern beim Herunterfahren wird vom Core-MiniOS-Shutdown-Trigger und dem `minios-squashfs-save`-Backend umgesetzt und ist daher nicht davon abhängig, dass der MiniOS-Sitzungsmanager geöffnet oder installiert ist. Periodisches Speichern wird alle 30 Minuten durch einen systemd-Timer oder einen SysV-Worker geprüft, beide rufen das gleiche Autosave-Backend auf. Das Neuerstellen des Snapshots benötigt CPU und schreibt den kompletten Snapshot; Intervalle von einer Stunde oder länger werden empfohlen.

Während des RAM-gestützten SquashFS-Betriebs kann ein neu erstellter und aktivierter SquashFS-Snapshot das Ziel für laufende Speicherungen übernehmen. Nach dieser Übergabe kann der alte laufende Snapshot ohne Neustart entfernt werden:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Diese Ausnahme gilt nur für eine gültige aktuelle SquashFS-Übergabe des aktuellen Bootvorgangs. Andere laufende Persistenzmodi bleiben vor Löschung geschützt.

## Verschlüsselung

LUKS2 ist eine optionale Schicht über Raw `changes.img`, DynFileFS `virtual.dat`, oder direkt auf dem DynBlk-Gerät. Diese Option steht nur zur Verfügung, wenn `/run/initramfs/etc/minios-initramfs-crypt` enthalten ist `luks-layer-v1` und die Tools und Funktionen des gewählten Backends verfügbar sind.

Bei der interaktiven Erstellung von LUKS wird das Passwort zweimal abgefragt. Vorgänge zum Lesen oder Erstellen von LUKS-Daten können das Passwort über die Standard-Eingabe mit `--password-stdin`.
Passwörter werden nicht in Befehlsargumenten oder Sitzungsmetadaten gespeichert. Beim Systemstart fordert das initrd das Passwort auf der Konsole an. Nach drei fehlgeschlagenen Versuchen wird der Bootvorgang abgebrochen; MiniOS fährt nicht mit Klartext, RAM, einem anderen Backend oder einer Ersatzsitzung unter derselben Anfrage fort.

Verschlüsselte Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht das verschlüsselte Backend. Beim Importieren, Kopieren oder Konvertieren nach LUKS wird ein neues verschlüsseltes Backend mit neuen Identitäten erstellt.

## Backups und fehlgeschlagene Sitzungen

Für Native-, DynFileFS-, DynBlk-, VMDK- und Raw-Sitzungen, auch in verschlüsselter Form, verwenden Sie `export` für logische Backups anstelle des Kopierens eines gemounteten Sitzungsverzeichnisses. Bewahren Sie das resultierende Archiv auf einem anderen Gerät auf und überprüfen Sie, ob es importiert werden kann, bevor Sie sich darauf verlassen. Der Import erstellt immer eine neue nummerierte Sitzung; aktivieren Sie sie explizit, wenn sie einsatzbereit ist.
Für SquashFS- und vollständige Geräte-Backup-Verfahren siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung nach vollem Speicher, unterbrochenem Schreibvorgang oder wiederholtem Erstellen leerer Sitzungen fehlschlägt, stoppen Sie alle Änderungen am betroffenen Speicher. Exportieren Sie nach Möglichkeit zuerst eine lesbare, nicht laufende Sitzung und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Beginnen Sie die Diagnose, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Booten werden Container-Dateisysteme vor der beschreibbaren Aktivierung geprüft. Schwere Dateisystemprüfungsfehler bewahren den Container zur Wiederherstellung, anstatt ihn beschreibbar zu mounten. SquashFS erkennt einen nicht bereinigten vorherigen Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Löschen Sie Sitzungen nur über den MiniOS-Sitzungsmanager oder `minios-session delete`; entfernen Sie Sitzungsverzeichnisse nicht manuell.

## Nicht genutzten DynBlk- und VMDK-Speicher zurückgeben

Klicken Sie im Sitzungsmanager mit der rechten Maustaste auf eine DynBlk- oder VMDK-Sitzung und wählen Sie **Freier Speicher...**.
Der Dialog funktioniert sowohl für die laufende Sitzung als auch für eine inaktive Sitzung. Bei einer
Plaintext-Sitzung wird zuerst das interne ext4 getrimmt, bevor der Treiber aufgefordert wird,
Speicher freizugeben. Eine inaktive Sitzung wird temporär verbunden und anschließend getrennt; das
Gerät der laufenden Sitzung bleibt verbunden.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

Das Kompaktieren-Kontrollkästchen ist **standardmäßig deaktiviert**, auch bei exFAT. Es gibt keine
automatische Kompaktierungs-Alternative. Verschlüsselte Sitzungen geben nur Speicher frei, der dem Treiber bereits bekannt ist; dieser Vorgang aktiviert kein Discard durch LUKS und
offenbart nicht das Allokationsmuster. Gerätefehler und fehlgeschlagenes Trimmen beenden den Vorgang.
.

### Low-Level-Treiberbefehle

Beim aktuellen DynBlk-Native- oder Split-VMDK-Backend macht das Verwerfen kompletter Grains
deren Platzierung wiederverwendbar. Auf einem ext4-unterlegten Dateisystem können ausgemusterte Bereiche
auch automatisch gelocht werden. Bei exFAT beschränkt sich die automatische Bereinigung auf das Abschneiden
vollständig freier Dateiende. **Die automatische Bereinigung verschiebt niemals Live-Daten.**

Verwenden Sie `fstrim` auf dem gemounteten inneren Änderungsdateisystem (nicht auf dem kombinierten AUFS/OverlayFS
Root), um gelöschte Blöcke zu melden, dann `dynblk reclaim /dev/dynblkN --execute` für
nicht-verschiebende Bereinigung. Wählen Sie das tatsächliche Sitzungsgerät aus, nicht einen angenommenen Index.
Um eine schreibintensive In-Place-Kompaktierung manuell anzufordern, fügen Sie `--compact` hinzu.
Dies funktioniert, ohne das Image zu konvertieren oder die Größe des virtuellen Dateisystems zu ändern;
andere Lese-/Schreibvorgänge können zwischen den Rückgewinnungsschritten erfolgen. Es ist keine automatische Alternative.
Die optionale `--scan-zeroes` liest zugeordnete Grains und ist standardmäßig deaktiviert.

Diese Befehle sind auch im neu aufgebauten initrd-DynBlk-CLI verfügbar. Keine automatische
Kompaktierung beim Start aktiviert. Verschlüsselte Sitzungen behalten ihre bestehende Discard-Policy bei; die Tools aktivieren dm-crypt-Discard-Passthrough nicht stillschweigend.
Nur-Lese- oder 
\-Anbindungen können nicht zurückgewonnen werden. Gemeldete gelochte`cache=unsafe`Bereiche und abgeschnittene Längen entsprechen nicht dem gemessenen freien Dateisystemplatz.
.

## VMDK-Sitzungs-Workflows

VMDK ist ein eigenständiger Sitzungsmodus, kein neuer Komprimierungscodec. Erstellen, Aktivieren,
Vergrößern, Export/Import, Kopieren, Klonen und Konvertieren nutzen dieselben Sitzungsmanager-
Befehle wie andere Containermodi:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Sitzungsarchive enthalten logische Dateien und Metadaten, aber kein beliebiges externes
VMDK-Volume. Verwaltete VMDK-Sitzungen verwenden den kanonischen `volume.vmdk`Descriptor
und alle zugehörigen `volume-sNNN.vmdk`Teildateien. Benennen Sie keine Teile um und kopieren Sie kein laufendes Image
am Treiber vorbei. Der Wechsel zwischen Native-DynBlk und VMDK erfordert eine explizite
Kopie/Konvertierung; das manuelle Ändern von `session_mode` ist keine Konvertierung.

Der Installer bietet VMDK nur an, wenn es zur Laufzeit unterstützt wird, und lehnt Quell-
Images ab, deren kopierte initrds die `vmdk-session-v1`-Fähigkeit nicht enthalten. Aktualisieren Sie CLI,
Treiber, Sitzungstools und Boot-Skripte gemeinsam, bevor Sie VMDK-Sitzungen erstellen.
