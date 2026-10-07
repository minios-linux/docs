---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sitzungen und Persistenz

MiniOS-Sitzungen bewahren Änderungen am laufenden System auch nach einem Neustart. Jede Sitzung ist ein nummeriertes Verzeichnis unter `minios/changes/`; die schreibgeschützten MiniOS-Module bleiben unverändert und die ausgewählte Sitzung stellt die beschreibbare Union-Filesystem-Schicht bereit.

Nutzen Sie den MiniOS-Sitzungsmanager aus einem laufenden MiniOS-System:

```bash
minios-session-manager
```

Das entsprechende Kommandozeilen-Tool ist `minios-session`. Für ändernde Befehle sind Administratorrechte erforderlich, daher wird in den folgenden Beispielen `sudo`. verwendet.

## Sitzungsmodi

| Modus | Speicher | Hauptbeschränkungen | MiniOS LUKS2-Schicht |
|------|---------|------------------|--------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares Dateisystem, das die Linux-Metadaten und Operationen erhält, die MiniOS prüft. Die Kapazität entspricht dem verfügbaren Speicherplatz im Hintergrund; `perchsize` ist nicht anwendbar. | Nein |
| `dynfilefs` | Erweiterbares ext4-`virtual.dat`-Dateisystem, unterstützt durch format-400 Segmentdateien | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Die Nutzlast ist schlank, aber der Mapping-Index skaliert mit der deklarierten logischen Kapazität. | Ja |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das von `volumeNNN.db`-Dateien unterstützt wird | Erfordert das DynBlk CLI, Kernelmodul und initrd-Fähigkeit. Die beim Booten erstellte Größe beträgt standardmäßig bis zu 16 GiB; das Maximum wird von `dynblk limits` gemeldet. Festplattenbasierte Zuordnungen verwenden einen begrenzten Metadatencache. | Ja |
| `vmdk` | Schlankes ext4-Dateisystem auf einer standardmäßig geteilten Sparse-VMDK, bereitgestellt durch den DynBlk-Treiber | Verwendet `volume.vmdk` und `volume-sNNN.vmdk`. Keine Komprimierung. Erfordert `vmdk-session-v1` im laufenden initrd-Fähigkeitsmarker. Derselbe manuelle Standardwert von 16 GiB wie DynBlk; prüfen Sie `dynblk limits --format vmdk` für Grenzwerte. | Ja |
| `raw` | Einzelne `changes.img`-Datei mit ext4 | Feste logische Kapazität mit explizitem Wachstum. Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen; FAT32 ist auf 4000 MiB begrenzt. | Ja |
| `squashfs` | Komprimierter Snapshot in `changes.sb`; die zur Laufzeit beschreibbare obere Schicht wird in RAM rekonstruiert | `perchsize` ist nicht anwendbar. Vorhandene Snapshots können von unterstützten beschreibbaren Medien wiederhergestellt werden; exaktes Speichern erfordert einen geeigneten POSIX-fähigen Persistenzspeicher. | Nein |

Raw-, DynFileFS-, DynBlk- und VMDK-Sitzungen können optional eine LUKS2-Verschlüsselungsschicht enthalten. Das Speicher-Backend bleibt der Sitzungsmodus, und Sitzungsmetadaten erfassen die Verschlüsselung separat. DynFileFS und Raw, die mit `minios-session` erstellt wurden, haben standardmäßig 4000 MiB; DynBlk und VMDK standardmäßig 16 GiB. Größenwerte werden in MiB zugewiesen; `GB` und `TB`-Suffixe entsprechen 1000 bzw. 1.000.000 MiB. Raw ist auf FAT32 unabhängig von der Verschlüsselung auf 4000 MiB begrenzt. DynFileFS-Nutzdaten wachsen bei Bedarf, aber sein format-400-Index ist für die gesamte logische Kapazität dimensioniert und benötigt etwa 2 MiB RAM plus etwa 2 MiB Speicherplatz pro GiB. DynBlk speichert Mapping-Tabellen auf der Festplatte und einen begrenzten Metadatencache in RAM, standardmäßig 1 MiB statt eines Prozentsatzes von RAM. Seine Extent-/Dateivektoren und Verzeichnisse wachsen mit deklarierten Teilen, während die Nutzlastfüllung keine vollständige Residenzkarte benötigt. Die installierte Kapazitätsgrenze kann mit `dynblk limits --format dynblk` abgefragt werden. Tatsächliche Schreibvorgänge sind weiterhin durch den freien Speicherplatz des unteren Dateisystems und die Ressourcenaufnahme des Backends begrenzt. Container-Resize-Operationen können eine Sitzung nur vergrößern; eine Verkleinerung wird nicht unterstützt.

Der Native-Modus ist die einfachste und schnellste Wahl auf einem kompatiblen Dateisystem.
Verwenden Sie DynFileFS, wenn das Persistenz-Dateisystem keine Linux-Metadaten speichern kann.
Verwenden Sie DynBlk, wenn Sie ein echtes Kernel-Blockgerät mit Thin-Backed-Dateien wünschen; der Treiber kann mehrere unabhängige DynBlk-Volumes gleichzeitig einbinden, und der Sitzungsmanager verwendet den vom Treiber zurückgegebenen Gerätepfad, anstatt anzunehmen, dass `/dev/dynblk0` frei ist. DynBlk und VMDK sind nicht verfügbar, solange UEFI Secure Boot aktiviert ist, da MiniOS das externe DynBlk-Kernelmodul nicht signiert. Der Installer und der Sitzungsmanager blenden diese Modi daher aus und lehnen explizite Erstellung ab, bevor versucht wird, das Modul zu laden.
Verwenden Sie Raw, wenn eine feste Zuweisung erforderlich ist, fügen Sie LUKS2 hinzu, wenn die Sitzung verschlüsselt werden muss, und verwenden Sie SquashFS für einen exakten komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das tatsächliche Persistenz-Dateisystem und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Es kann keine Sitzung auf schreibgeschützten Medien erstellt werden. Das initrd kann einen vorhandenen SquashFS-Snapshot, der auf FAT, exFAT oder NTFS gespeichert ist, lesen und aktivieren, da es den Snapshot in ein temporäres ext4-Upper extrahiert. Das Erstellen oder exakte Speichern eines Snapshots ist anders: Der Persistenzspeicher muss die erforderlichen POSIX-Metadaten sowie private, dauerhafte Veröffentlichung unterstützen. Der exakte Arbeitsbaum nutzt vertrauenswürdige RAM, wenn verfügbar, mit einer Festplatten-Workspace-Alternative, falls RAM nicht ausreicht.

## Boot-Auswahl

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten normalerweise Fortsetzen-, Neu-, Auswahl- und nicht-persistente Einträge. Die maßgebliche Beschreibung der Selektor-, Kompatibilitäts-, Fallback- und Aktivierungslogik finden Sie unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den alten Best-Effort-Fortsetzungsweg. Er versucht den Metadaten-Standard, erstellt aber keinen Ersatz, wenn keiner verfügbar ist. |
| `perchdir=resume` | Setzt den Metadaten-Standard fort und erlaubt dem initrd, einen neuen kompatiblen Ersatz zu erstellen, wenn dieser fehlt oder inkompatibel ist. Dies ist das aktuelle Verhalten im Bootmenü beim Fortsetzen. |
| `perchdir=setup` | Öffnet den interaktiven Persistenz-Backend-Auswahldialog und legt dann eine neue nummerierte Sitzung an. Dies ist das aktuelle **Neue Sitzung beginnen**-Verhalten. |
| `perchdir=new` | Legt direkt eine neue nummerierte Sitzung mit den gewünschten/Standard-Backend-, Verschlüsselungs-, Komprimierungs- und Größeneinstellungen an, ohne den Backend-Auswahldialog zu öffnen. |
| `perchdir=ask` | Wählt eine bestehende Sitzung aus; falls der Speicher leer ist, wird automatisch derselbe Einrichtungsablauf wie bei `perchdir=setup` gestartet. |
| `perchdir=<id>` | Wählt diese nummerierte Sitzung direkt aus. |
| `perchdir=<device/path>` | Verwendet einen Persistenzspeicherort auf einem Gerät, einschließlich `/dev/...` und `label:...`-Formen, die vom initrd verarbeitet werden. |
| `perchmode=<mode>` | Setzen Sie `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw` oder `squashfs`. |
| `perchencrypt=luks` | Verschlüsselt eine neu erstellte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung mit LUKS2. Bestehende Sitzungen übernehmen die Verschlüsselung nur aus den Metadaten. |
| `perchcomp=<codec>` | Wählt die DynBlk-Backend-Komprimierung für eine neue DynBlk-Sitzung. Die Komprimierung wird auf `none` erzwungen, wenn DynBlk in LUKS2 eingebettet ist. |
| `perchsize=<size>` | Legt eine neue oder größere Containergröße fest; reine Werte werden in MiB zugewiesen und `MB`, `GB`, und `TB`-Suffixe werden akzeptiert. |

Wird für eine neue Sitzung kein Modus angegeben, wird beim Booten der Native-Modus verwendet. Auf FAT32/NTFS/exFAT fällt die native Boot-Erstellung auf DynFileFS zurück. Ein neuer Raw-Container hat standardmäßig 4000 MiB. Neue DynFileFS-, DynBlk- und VMDK-Bootsitzungen ohne `perchsize` nutzen bis zu 16 GiB; wenn nach der Sicherheitsreserve weniger Speicherplatz verbleibt, wird die automatische Größe reduziert. DynFileFS berücksichtigt auch seinen Index-Overhead und das RAM-Limit. Explizites DynBlk-Wachstum folgt dem installierten Backend-Limit, das mit `dynblk limits --format dynblk` abgefragt werden kann. Unter Secure Boot bietet initrd DynBlk/VMDK nicht an und behandelt eine explizite oder fortgesetzte DynBlk/VMDK-Sitzung als nicht verfügbar, anstatt zu versuchen, das unsignierte Modul zu laden.
SquashFS-Sitzungen können aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`. Die Initrd-Einrichtung erstellt nur Sitzungsmetadaten der Generation Null und hält die beschreibbare obere Schicht in RAM. Das laufende System erstellt den ersten `changes.sb`-Snapshot bei Bedarf oder beim Herunterfahren.

Beim Fortsetzen prüft MiniOS die aufgezeichnete Version, Edition, das Union-Filesystem und den Modus. Ein `perchdir=resume` kann eine neue Sitzung erstellen, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Nur `perch`-, direkte numerische Auswahl und andere alte Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Die interaktive Auswahl zeigt eine Warnung an, bevor eine inkompatible Sitzung zugelassen wird. Wenn Auswahl oder Aktivierung dennoch fehlschlagen, startet das System normalerweise mit einer RAM-Upper und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` protokolliert die Standard- und laufenden IDs sowie Modus, Version, Edition, Union-Filesystem, Größe, Status und modusspezifische Einstellungen pro Sitzung.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden, aber nicht selbst den aktuellen Laufzeitstatus beweisen. Bearbeiten oder verschieben Sie keine nummerierten Sitzungsdaten, während eine Sitzung eingehängt ist; verwenden Sie den MiniOS-Sitzungsmanager oder `minios-session`.

## Aktive und laufende Sitzungen

Diese Begriffe beschreiben unterschiedliche Zustände:

- Die **aktive** Sitzung ist die standardmäßig für den nächsten Boot ausgewählte.
- Konzeptionell ist die **laufende** Sitzung diejenige, deren beschreibbare Schicht tatsächlich die Persistenz für den aktuellen Boot bereitstellt.

Das persistente `running=`-Feld protokolliert diese beabsichtigte Beziehung. Ein Absturz, ein fehlgeschlagener Union-Aufbau, ein kopierter Speicher oder ein unterbrochener Shutdown können es veraltet lassen, selbst wenn der aktuelle Boot RAM oder eine andere Sitzung verwendet. Vorgänge wie das Speichern von SquashFS erfordern daher den geschützten, boot-ID-gebundenen aktuellen Boot-Status des initrd und das verifizierte eingehängte Upper; sie vertrauen nicht nur auf `running=` allein. Siehe [Aktiv, laufend und aktueller Boot-Status](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Das Aktivieren einer Sitzung ändert den nächsten Boot, wechselt aber nicht das aktuelle Union-Filesystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Die aktive Sitzung kann nicht gelöscht oder vor Ort konvertiert werden. Eine laufende Sitzung kann normalerweise nicht gelöscht, exportiert, kopiert, vergrößert oder konvertiert werden. Die Bereinigung schützt auch beide IDs.

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
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` ohne Modus wählt Native. Die Erstellung von SquashFS erfasst die aktuellen Live-Änderungen und hat keine feste Größe. Die Abschalt-Strategie ist standardmäßig auf `shutdown` gesetzt; periodisches Speichern ist standardmäßig deaktiviert.

Eine laufende SquashFS-Sitzung oder eine unterstützte Persistenzsitzung, die der aktuelle Boot nach RAM kopiert hat, speichern:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Für SquashFS `save` wird der aktuelle Snapshot neu erstellt. Bei einer von RAM unterstützten Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung wird die RAM-Kopie zurück in den ursprünglichen Persistenzspeicher geschrieben. `--as-new` bewahrt die ursprünglich gespeicherte Sitzung und veröffentlicht den RAM-Status stattdessen unter einer neuen Sitzungsnummer. Das ursprüngliche Medium muss weiterhin vorhanden, beschreibbar und mit der beim Boot aufgezeichneten Dateisystem-Identität übereinstimmen.

Automatisches SquashFS-Speichern separat konfigurieren:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Gültige periodische Intervalle sind `30`, `60`, `120`, `240`, und `480` Minuten; `0` deaktiviert das periodische Speichern. Die Einstellungen für Abschalten und periodisches Speichern sind unabhängig.

Exportieren und Importieren von `.tar.zst`-Archiven:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Es werden nur `.tar.zst`-Importe akzeptiert. Pfade und Archivmitglieder werden validiert und die Extraktion ist begrenzt. `--auto-convert` wählt einen kompatiblen Modus für das aktuelle Dateisystem. `--force-mode <mode>` wählt explizit einen verfügbaren Modus aus. Export, generisches Kopieren/Klonen und Konvertieren werden für SquashFS-Sitzungen nicht unterstützt; verwenden Sie dessen Speicher-Workflow und beachten Sie [Backups von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) anstatt Sitzungsinhalte manuell zu rekonstruieren oder zu kopieren.

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

`copy` ist eine logische Dateisystemkopie und weist immer eine neue Sitzungs-ID zu. Sie kann Backend, Kapazität oder Verschlüsselung ändern und erstellt neue ext4- und LUKS-Identitäten. `clone` kopiert ein getrenntes Backend physisch und bewahrt dessen LUKS-Header, Keyslots, LUKS-UUID und ext4-UUID. `convert` ersetzt standardmäßig die Quelle; verwenden Sie `--new-session` um die Quelle zu bewahren. Eine Größe ist nur für ein Container-Ziel relevant.

Sitzungen vergrößern, löschen oder bereinigen:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize unterstützt DynFileFS-, DynBlk-, VMDK- und Raw-Sitzungen, einschließlich verschlüsselter Formen, und erfordert eine größere Zielgröße als die aktuelle. DynBlk-Resize vergrößert zuerst das virtuelle Blockgerät und erweitert dann das ext4-Dateisystem; die neue virtuelle Kapazität wird nicht vorab zugewiesen. Die Bereinigung betrifft standardmäßig Sitzungen, die älter als 30 Tage sind.

Alle Befehle akzeptieren `--json`, und ein anderer Sitzungspeicher kann mit `--sessions-dir PATH` ausgewählt werden:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## RAM-gestütztes Sitzungs-Write-Back

Wenn initrd eine unterstützte Persistenzsitzung in RAM kopiert, `perchtoram`, schreibt die laufende Sitzung nicht mehr direkt auf ihr ursprüngliches Backend. MiniOS speichert das ursprüngliche Speicherziel anhand der Dateisystem-UUID und der Sitzungsnummer, anstatt sich auf einen `/dev/sdX` Namen zu verlassen. Der Sitzungsmanager hält diese RAM-Sitzung sichtbar, auch wenn das ursprüngliche Gerät vorübergehend entfernt ist.

Wenn das ursprüngliche Speicherziel vorhanden, beschreibbar und unverändert ist, **Jetzt speichern** schreibt den RAM-Status zurück in die ursprüngliche Sitzung. **Als neue Sitzung auf Speicher sichern** belässt die gespeicherte Quelle unverändert und veröffentlicht den RAM-Status als neue, nummerierte Sitzung. Die entsprechenden CLI-Befehle sind `minios-session save <id>` und `minios-session save <id> --as-new`. Beim Speichern wird der Kopierfortschritt angezeigt und der Vorgang kann vor der Veröffentlichungsphase abgebrochen werden; die Veröffentlichung selbst wird nach dem Start atomar abgeschlossen.

Wenn das ursprüngliche Medium fehlt, schreibgeschützt ist, nicht mehr mit der Boot-Identität übereinstimmt oder die ursprüngliche Sitzung unabhängig verändert wurde, wird das Write-Back verweigert, anstatt ein anderes Gerät anhand des Namens zu verwenden. Schließen Sie das ursprüngliche Medium wieder an und versuchen Sie es erneut, oder nutzen Sie die Option "Als neue Sitzung speichern", wenn die ursprüngliche Sitzung abgewichen ist. Native Verzeichnissitzungen werden von der aktuellen `perchtoram` Implementierung nicht kopiert, daher gilt dieser Write-Back-Weg für Raw-, DynFileFS-, DynBlk-, VMDK- und SquashFS-Sitzungen.

## SquashFS-Speicherverhalten

Eine SquashFS-Sitzung wird in RAM für die laufende beschreibbare Schicht entpackt. Das Speichern erstellt und validiert einen exakten Snapshot neu und ersetzt dann `changes.sb` atomar.
Es wird keine Rollback-Generation aufbewahrt. „Jetzt speichern“ ist über das Tray-Icon, den MiniOS-Sitzungsmanager oder `minios-session save` unabhängig von der automatischen Richtlinie verfügbar.

Bei jedem Speichern kopiert MiniOS eine stabile Ansicht des geänderten Baums in privaten RAM-Speicher, sofern genügend Speicher vorhanden ist. Die Komprimierung schreibt **ein** Abbild in ein privates Verzeichnis innerhalb der nummerierten Sitzung. Erst nach Überprüfung des Dateisysteminhalts, des Digests, der Identität und des dauerhaften Syncs ersetzt das Speichertool `changes.sb`. Es gibt kein vollständiges zweites komprimiertes Abbild in RAM oder einen zweiten Schreibvorgang dieses Abbilds auf das Persistenzgerät. Ist zu wenig RAM für den Baum vorhanden, fällt nur dieser Arbeitsbaum auf die Festplatte zurück; der komprimierte Kandidat benötigt dennoch einen Schreibvorgang. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Cache- und Protokollschreibregeln.

Boot-Diagnosen für eine dauerhafte SquashFS-Sitzung werden unter `boot-logs/minios/` und `boot-logs/live/`-Verzeichnissen gespeichert. Sie sind nicht von einem erfolgreichen Shutdown-Snapshot abhängig und bleiben auch dann verfügbar, wenn die letzten Änderungen an der RAM-Upper nicht gespeichert werden konnten. Der Speicher muss weiterhin beschreibbar sein; gewöhnliche Journaldateien können temporär sein, wenn `LIVE_LOG_STORAGE=volatile` ausgewählt ist.

Das Speichern beim Herunterfahren wird durch den Kern-MiniOS-Shutdown-Trigger und das `minios-squashfs-save`-Backend umgesetzt, sodass es nicht davon abhängt, dass der MiniOS-Sitzungsmanager geöffnet oder installiert ist. Das periodische Speichern wird alle 30 Minuten von einem systemd-Timer oder einem SysV-Worker geprüft, die beide dasselbe Autosave-Backend aufrufen. Das Neuerstellen des Snapshots beansprucht CPU und schreibt den kompletten Snapshot; Intervalle von einer Stunde oder mehr werden empfohlen.

Während des RAM-gestützten SquashFS-Betriebs kann ein neu erfasster und aktivierter SquashFS-Snapshot das Ziel für das laufende Speichern übernehmen. Nach dieser Übergabe kann der alte laufende Snapshot ohne Neustart entfernt werden:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Diese Ausnahme gilt nur für eine gültige aktuelle SquashFS-Übergabe. Andere laufende Persistenzmodi bleiben vor Löschung geschützt.

## Verschlüsselung

LUKS2 ist eine optionale Verschlüsselungsschicht über Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzungsspeicher; es ist kein separater Sitzungsmodus. Sie ist nur verfügbar, wenn `/run/initramfs/etc/minios-initramfs-crypt` enthält `luks-layer-v1` und die Tools und Fähigkeiten des gewählten Backends verfügbar sind. DynBlk-Backend-Komprimierung ist deaktiviert, wenn LUKS2 ausgewählt ist.

Die interaktive LUKS-Erstellung fragt das Passwort zweimal ab. Vorgänge, die LUKS-Daten lesen oder erstellen, können das Passwort per Standard-Eingabe mit `--password-stdin` einlesen. Passwörter werden nicht in Befehlsargumenten oder Sitzungsmetadaten gespeichert. Beim Boot fragt das initrd das Passwort auf der Konsole ab. Drei abgelehnte Versuche führen zu einem fatalen Boot-Abbruch; MiniOS fährt nicht im Klartext, mit RAM, einem anderen Backend oder einer Ersatzsitzung unter derselben Anfrage fort.

Für eine inaktive, getrennte verschlüsselte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung bietet der Sitzungsmanager **Passwort ändern...** an. Das CLI-Äquivalent ist:

```bash
sudo minios-session change-passphrase <id>
```

Es fragt nach dem aktuellen Passwort, dem neuen Passwort und der Bestätigung. Mit `--password-stdin` geben Sie diese drei Zeilen in dieser Reihenfolge ein. Der gewählte Keyslot wird ersetzt, ohne alle Dateien neu zu formatieren oder zu verschlüsseln. Aktive, laufende oder eingehängte Sitzungen müssen zuerst getrennt werden; zusätzliche LUKS-Keyslots, die außerhalb des Sitzungsmanagers verwaltet werden, werden nicht geändert.

Verschlüsselte Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht das verschlüsselte Backend. Importieren, Kopieren oder Konvertieren in LUKS erstellt ein neues verschlüsseltes Backend mit neuen Identitäten.

## Einbinden einer inaktiven Sitzung

Der Sitzungsmanager kann eine inaktive, nicht laufende Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung mit Schreibzugriff einbinden, ohne sie als Boot-Standard zu setzen. Klicken Sie mit der rechten Maustaste auf die Sitzung und wählen Sie **Sitzung einbinden**; verschlüsselte Sitzungen fragen nach ihrem LUKS-Passwort. Mehrere verschiedene Sitzungs-IDs können gleichzeitig eingebunden werden. **Eingebundenen Ordner öffnen** öffnet das angehängte Dateisystem, während **Sitzungsordner öffnen** das nummerierte Verzeichnis mit den zugehörigen Backing-Dateien öffnet.

Das Schließen des Sitzungsmanagers beendet eine GUI-verwaltete Einbindung nicht. Öffnen Sie die Anwendung erneut, um sie anzuzeigen und wählen Sie **Sitzung aushängen**. Ist das Aushängen beschäftigt, lässt MiniOS den Backing-Daemon, das Loop-Device oder das DynBlk-Gerät verbunden, anstatt den Speicher unter einem laufenden Dateisystem zu trennen.

Das eigenständige CLI hält die Einbindung aufrecht, bis die Standardeingabe geschlossen wird oder es ein Ctrl+C erhält:

```bash
sudo minios-session mount <id>
```

Der Befehl verweigert die aktive oder laufende Sitzung und formatiert niemals ein bestehendes Dateisystem, weil das Einbinden fehlgeschlagen ist.

## Backups und fehlgeschlagene Sitzungen

Für Native-, DynFileFS-, DynBlk-, VMDK- und Raw-Sitzungen, einschließlich verschlüsselter Varianten, verwenden Sie `export` für logische Backups, anstatt ein eingebundenes Sitzungsverzeichnis zu kopieren. Bewahren Sie das resultierende Archiv auf einem anderen Gerät auf und prüfen Sie, ob es importiert werden kann, bevor Sie sich darauf verlassen. Der Import erstellt immer eine neue nummerierte Sitzung; aktivieren Sie sie explizit, wenn sie einsatzbereit ist.
Für SquashFS- und Komplettgeräte-Backups siehe [Backups von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung nach Speicherüberlauf, unterbrochenem Schreibvorgang oder wiederholtem Erstellen leerer Sitzungen fehlschlägt, stoppen Sie Änderungen am betroffenen Speicher. Exportieren Sie zuerst eine lesbare, nicht laufende Sitzung, wenn möglich, und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Beginnen Sie die Diagnose, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Booten werden Container-Dateisysteme vor der beschreibbaren Aktivierung geprüft. Schwere Dateisystemprüfungsfehler bewahren den Container zur Wiederherstellung, anstatt ihn beschreibbar einzubinden. SquashFS erkennt einen unsauberen vorherigen Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Löschen Sie Sitzungen nur über den MiniOS-Sitzungsmanager oder `minios-session delete`; entfernen Sie Sitzungsverzeichnisse nicht manuell.

## Nicht genutzten DynFileFS-, DynBlk- und VMDK-Speicher freigeben

Im Sitzungsmanager klicken Sie mit der rechten Maustaste auf eine DynFileFS-, DynBlk- oder VMDK-Sitzung und wählen Sie **Freier Speicher...**. Der Dialog funktioniert für eine laufende oder inaktive unterstützte Sitzung und kann auch eine Sitzung wiederverwenden, die bereits über den Sitzungsmanager eingebunden ist. Bei einer Klartext-Sitzung führt MiniOS FITRIM auf dem tatsächlichen inneren ext4-Dateisystem aus und bittet anschließend das Backend, den als frei bekannten Speicherplatz freizugeben. Getrennte Sitzungen werden temporär eingebunden und erst nach sauberem Aushängen wieder freigegeben.

DynFileFS-Freigabe erfordert DynFileFS 4.6.0 oder neuer. Wurde das Paket aktualisiert, während ein älterer DynFileFS-Daemon noch aktiv ist, starten Sie in das aktualisierte Backend neu, bevor Sie die Freigabe für diese laufende Sitzung durchführen.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

Die Kompaktierungs-Checkbox ist **standardmäßig deaktiviert**, auch auf exFAT. Es gibt keine
automatische Kompaktierungs-Alternative. Verschlüsselte Sitzungen geben nur Speicher frei, der dem Backend bereits bekannt ist; dieser Vorgang aktiviert kein Discard über LUKS oder
zeigt dessen Belegungsmuster. Gerätefehler und fehlgeschlagene Trims beenden den Vorgang.
.

### Low-Level-Treiberbefehle

Mit dem aktuellen DynBlk nativen oder geteilten VMDK-Backend wird beim Verwerfen kompletter Grains
deren Platz wiederverwendbar. Auf einem ext4-Backing-Dateisystem können ausgemusterte Bereiche
auch automatisch gelocht werden. Unter exFAT entfernt die automatische Bereinigung nur
vollständig freie Dateiende.**Automatische Bereinigung verschiebt niemals aktive Daten.**

Verwenden Sie `fstrim` auf dem gemounteten inneren Changes-Dateisystem (nicht auf dem kombinierten AUFS/OverlayFS
Root), um gelöschte Blöcke zu melden, dann `dynblk reclaim /dev/dynblkN --execute` für
eine bereinigende, nicht verschiebende Aktion. Wählen Sie das tatsächliche Sitzungsgerät aus, nicht einen angenommenen Index.
Um eine schreibintensive In-Place-Kompaktierung manuell anzufordern, fügen Sie `--compact`hinzu.
Dies funktioniert, ohne das Abbild zu konvertieren oder die Größe des virtuellen Dateisystems zu ändern;
andere Lese-/Schreibvorgänge können zwischen den Bereinigungsschritten stattfinden. Es ist kein automatisches Fallback.
Die optionale Funktion `--scan-zeroes`liest zugeordnete Grains und ist standardmäßig nicht aktiviert.

Diese Befehle sind auch im neu aufgebauten initrd DynBlk CLI verfügbar. Keine automatische
Kompaktierung beim Start ist aktiviert. Verschlüsselte Sitzungen behalten ihre bestehende Discard-
Richtlinie bei; die Tools aktivieren dm-crypt Discard-Passthrough nicht stillschweigend.
Schreibgeschützte oder `cache=unsafe`Anhänge können nicht bereinigt werden. Gemeldete gelochte
Bereiche und gekürzte Längen entsprechen nicht dem gemessenen freien Speicherplatz des Dateisystems.

## VMDK-Sitzungs-Workflows

VMDK ist ein separater Sitzungsmodus, kein neues Komprimierungsverfahren. Erstellen, aktivieren,
vergrößern, exportieren/importieren, kopieren, klonen und konvertieren nutzen die gleichen Sitzungsmanager-
Befehle wie andere Containermodi:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Sitzungsarchive enthalten logische Dateien und Metadaten, aber keine beliebigen externen
VMDK-Einbindungen. Verwaltete VMDK-Sitzungen verwenden den kanonischen `volume.vmdk`Deskriptor
und alle seine `volume-sNNN.vmdk`Teile. Benennen Sie keine Teile um und kopieren Sie kein laufendes Image
hinter dem Treiber. Das Wechseln zwischen nativen DynBlk- und VMDK-Modus erfordert eine explizite
Kopie/Konvertierung; das manuelle Ändern von `session_mode` ist keine Konvertierung.

Der Installer bietet VMDK nur an, wenn dies zur Laufzeit unterstützt wird, und lehnt Quell-
Images ab, deren kopierte initrds die `vmdk-session-v1`-Fähigkeit nicht besitzen. Aktualisieren Sie CLI,
Treiber, Sitzungstools und Bootskripte gemeinsam, bevor Sie VMDK-Sitzungen erstellen.
