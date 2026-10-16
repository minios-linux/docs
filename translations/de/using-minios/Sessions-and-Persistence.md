---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sitzungen und Persistenz

MiniOS-Sitzungen bewahren Änderungen am laufenden System auch nach einem Neustart. Jede Sitzung ist ein nummeriertes Verzeichnis unter `minios/changes/`; die schreibgeschützten MiniOS-Module bleiben unverändert und die gewählte Sitzung stellt die beschreibbare Union-Dateisystemschicht bereit.

Nutzen Sie den MiniOS-Sitzungsmanager aus einem laufenden MiniOS-System:

```bash
minios-session-manager
```

Das entsprechende Kommandozeilen-Tool ist `minios-session`. Alle Befehle außer Hilfe erfordern Administratorrechte; führen Sie die Beispiele mit `sudo`. aus.

Diese Workflows mit nummerierten Sitzungen stehen bei ausgewähltem **Ventoy Persistence Plugin**-Abbild nicht zur Verfügung. Dieses Abbild bietet eine persistente Umgebung, die in Ventoy ausgewählt wird, ohne MiniOS-Sitzungsmetadaten. Normale Ventoy-Starts ohne ausgewähltes Plugin-Backend behalten MiniOS-Sitzungen bei; siehe [Ventoy](/installing-minios/installation-tools/Ventoy).

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

Jeder erkannte Persistenz-Parameter aktiviert die Persistenzverwaltung. MiniOS-Bootmenüs bieten in der Regel Einträge für Fortsetzen, Neu, Auswahl und Nicht-persistent. Die maßgebliche Beschreibung von Selektor-, Kompatibilitäts-, Fallback- und Aktivierungslogik findet sich unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den Legacy-Best-Effort-Fortsetzungsmodus. Es wird versucht, den Metadaten-Standard zu nutzen, aber es wird kein Ersatz erstellt, wenn keiner verfügbar ist. |
| `perchdir=resume` | Setzt den Metadaten-Standard fort und erlaubt, falls dieser fehlt oder inkompatibel ist, dem Initrd, einen neuen kompatiblen Ersatz zu erstellen. Dies entspricht dem aktuellen Fortsetzungsverhalten im Boot-Menü. |
| `perchdir=setup` | Öffnet den interaktiven Persistenz-Backend-Auswahldialog und legt anschließend eine neue nummerierte Sitzung an. Dies ist das aktuelle **Neue Sitzung beginnen**-Verhalten. |
| `perchdir=new` | Legt eine neue nummerierte Sitzung direkt anhand der gewünschten oder voreingestellten Backend-, Verschlüsselungs-, Komprimierungs- und Größeneinstellungen an, ohne den Backend-Auswahldialog zu öffnen. |
| `perchdir=ask` | Wählt eine bestehende Sitzung aus; ist der Speicher leer, wird automatisch derselbe Einrichtungsablauf wie bei `perchdir=setup` gestartet. |
| `perchdir=<id>` | Wählt diese nummerierte Sitzung direkt aus. |
| `perchdir=<device/path>` | Verwendet einen Persistenzspeicherort auf einem Gerät, einschließlich `/dev/...` und `label:...`-Formaten, die vom Initrd verarbeitet werden. |
| `perchmode=<mode>` | Setzt `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw` oder `squashfs`. |
| `perchencrypt=luks` | Verschlüsselt eine neu erstellte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung mit LUKS2. Bestehende Sitzungen übernehmen die Verschlüsselung nur aus den Metadaten. |
| `perchcomp=<codec>` | Wählt DynBlk-Backend-Komprimierung für eine neue DynBlk-Sitzung. Die Komprimierung wird auf `none` erzwungen, wenn DynBlk in LUKS2 eingebettet ist. |
| `perchsize=<size>` | Legt eine neue oder größere Containergröße fest; reine Zahlenwerte werden in MiB zugewiesen und `MB`, `GB` sowie `TB`-Suffixe werden akzeptiert. |

Wenn für eine neue Sitzung kein Modus angegeben ist, verwendet der Bootvorgang den nativen Modus. Auf FAT32/NTFS/exFAT oder wenn die nativen Dateisystemprüfungen fehlschlagen, bevorzugt der Start DynBlk, sofern dessen Helfer verfügbar ist und Secure Boot dies zulässt; andernfalls wird auf DynFileFS zurückgegriffen. Ein Aktivierungsfehler wandelt eine bestehende Sitzung nicht stillschweigend um. Ein neuer Raw-Container ist standardmäßig 4000 MiB groß. Neue DynFileFS-, DynBlk- und VMDK-Boot-Sitzungen ohne `perchsize` nutzen bis zu 16 GiB; wenn nach der Sicherheitsreserve weniger Speicherplatz verbleibt, wird die automatische Größe reduziert. DynFileFS berücksichtigt auch den Index-Overhead und das RAM-Limit. Explizites DynBlk-Wachstum folgt dem installierten Backend-Limit, das mit `dynblk limits --format dynblk` abgefragt werden kann. Unter Secure Boot bietet das Initrd keine DynBlk/VMDK-Option an und behandelt eine explizite oder fortgesetzte DynBlk/VMDK-Sitzung als nicht verfügbar, anstatt das unsignierte Modul zu laden.
SquashFS-Sitzungen können aus dem laufenden System mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs`. Die Initrd-Einrichtung erzeugt nur Generation-Null-Sitzungsmetadaten und hält die beschreibbare obere Ebene in RAM. Das laufende System erstellt das erste `changes.sb`-Schnappschuss bei Bedarf oder beim Herunterfahren.

Beim Fortsetzen prüft MiniOS die gespeicherte Version, Edition, das Union-Dateisystem und den Modus. Durch die Angabe von `perchdir=resume` kann eine neue Sitzung erstellt werden, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Reine `perch`-, direkte numerische Auswahl und andere Legacy-Fortsetzungsanfragen erstellen diesen Ersatz nicht automatisch.
Bei der interaktiven Auswahl wird vor dem Zulassen einer inkompatiblen Sitzung eine Warnung angezeigt. Falls Auswahl oder Aktivierung dennoch fehlschlagen, startet das System in der Regel mit einem RAM-Upper und einer Persistenzwarnung.

Der Sitzungspeicher hat folgendes Format:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie den Modus, die Version, Edition, das Union-Dateisystem, die Größe, den Status und die modusspezifischen Einstellungen pro Sitzung.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden, aber nicht für den aktuellen Laufzeitstatus bürgen. Bearbeiten Sie diese Daten nicht und verschieben Sie keine nummerierten Sitzungsdaten, während eine Sitzung eingehängt ist; verwenden Sie stattdessen den MiniOS-Sitzungsmanager oder `minios-session`.

## Aktive und laufende Sitzungen

Diese Begriffe beschreiben unterschiedliche Zustände:

- Die **aktive** Sitzung ist standardmäßig für den nächsten Start ausgewählt.
- Begrifflich ist die **laufende** Sitzung diejenige, deren beschreibbare Ebene tatsächlich die Persistenz für den aktuellen Start bereitstellt.

Das persistente `running=` Feld dokumentiert diese beabsichtigte Beziehung. Ein Absturz, ein fehlgeschlagener Union-Aufbau, ein kopierter Speicher oder ein unterbrochener Shutdown können dazu führen, dass es veraltet ist, selbst wenn der aktuelle Start RAM oder eine andere Sitzung verwendet. Vorgänge wie das Speichern von SquashFS erfordern daher den geschützten, boot-ID-gebundenen Current-Boot-Status des initrd und das verifizierte eingehängte obere Verzeichnis; sie vertrauen nicht nur auf `running=` allein. Siehe [Aktiver, laufender und Current-Boot-Status](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Das Aktivieren einer Sitzung ändert den nächsten Start, wechselt aber nicht das aktuelle Union-Dateisystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Die aktive Sitzung kann weder gelöscht noch direkt umgewandelt werden. Eine laufende Sitzung kann in der Regel nicht gelöscht, exportiert, kopiert, vergrößert oder konvertiert werden. Die Bereinigung schützt außerdem beide IDs.

<a id="command-reference"></a>

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

Wenn initrd eine unterstützte Persistenzsitzung in RAM kopiert, `perchtoram`schreibt die laufende Sitzung nicht mehr direkt auf das ursprüngliche Backend. MiniOS speichert das ursprüngliche Medium anhand der Dateisystem-UUID und der Sitzungsnummer, anstatt sich auf einen `/dev/sdX`Namen zu verlassen. Der Session Manager zeigt diese RAM-Sitzung weiterhin an, selbst wenn das ursprüngliche Gerät vorübergehend entfernt wurde.

Ist das ursprüngliche Medium vorhanden, beschreibbar und unverändert, **Jetzt speichern**schreibt den RAM-Status zurück in die ursprüngliche Sitzung. **Als neue Sitzung auf Speicher sichern**belässt die gespeicherte Quelle unverändert und veröffentlicht den RAM-Status als neue, nummerierte Sitzung. Die entsprechenden CLI-Befehle sind `minios-session save <id>`und `minios-session save <id> --as-new`. Während des Speicherns wird der Kopiervorgang angezeigt und kann vor der Veröffentlichungsphase abgebrochen werden; die Veröffentlichung selbst erfolgt nach dem Start atomar.

Fehlt das ursprüngliche Medium, ist es schreibgeschützt, stimmt die Identität beim Booten nicht mehr überein oder wurde die ursprüngliche Sitzung unabhängig verändert, wird das Write-Back abgelehnt, anstatt auf ein anderes Gerät mit demselben Namen zuzugreifen. Schließen Sie das ursprüngliche Medium wieder an und versuchen Sie es erneut, oder verwenden Sie "Als neue Sitzung speichern", wenn die ursprüngliche Sitzung abweicht. Native Verzeichnis-Sitzungen werden von `perchtoram`: eine erfolgreiche RAM-Anfrage startet stattdessen einen neuen, leeren Container, ohne native Daten zu importieren. Verwenden Sie `perchtoram=off`um diese native Sitzung zu behalten. Während eines Native-Session-Resets ist das Kopieren für diesen Bootvorgang deaktiviert, um die erhaltenen Daten zu schützen.

## Eine inkompatible Sitzung zurücksetzen

Das Boot-Menü **Gespeicherte Sitzung auswählen** kann eine inkompatible Sitzung vor der Aktivierung zurücksetzen. **Zurücksetzen, Einstellungen behalten** entfernt systemweit installierte Software, behält jedoch System­einstellungen und Daten bei. **Zurücksetzen, Daten behalten** setzt auch die Standard-Systemkonfiguration zurück. Beide Optionen bewahren `/home` und `/root` – darunter persönliche Einstellungen sowie im Home-Verzeichnis installierte Anwendungen, Konten, Passwörter und Schlüssel. Nicht aufgeführte, manuell an anderen Orten installierte Dateien können ebenfalls erhalten bleiben; dies ist keine vollständige Softwarebereinigung.

Für das Zurücksetzen wird ausreichend freier Speicherplatz für eine zweite Kopie der zu behaltenden Daten benötigt. Ein fehlgeschlagener oder unterbrochener Austausch von Verzeichnissen wird beim nächsten Einhängen zurückgesetzt oder wiederhergestellt. Ein automatischer Neustart setzt eine Sitzung niemals stillschweigend zurück. Bei SquashFS wirkt sich das Zurücksetzen nur auf die wiederhergestellte RAM-Schicht aus, bis ein erfolgreiches Speichern den neuen Snapshot und dessen Kompatibilitätsinformationen veröffentlicht. Sichern Sie wichtige Daten vor dem Zurücksetzen; siehe [Details zur Persistenz](/reference/boot-process/Persistence-Internals).

## SquashFS-Speicherverhalten

Eine SquashFS-Sitzung wird für die laufende beschreibbare Ebene in RAM entpackt. Beim Speichern wird ein exakter Schnappschuss erstellt und validiert und anschließend atomar ersetzt.`changes.sb`.
Es wird keine Rollback-Generation aufbewahrt. "Jetzt speichern" ist über das Tray-Symbol, den MiniOS-Sitzungsmanager oder `minios-session save` unabhängig von der automatischen Richtlinie verfügbar.

Bei jedem Speichervorgang kopiert MiniOS eine stabile Ansicht des geänderten Baums in den privaten RAM-Speicher, sofern genügend Arbeitsspeicher vorhanden ist. Die Komprimierung schreibt **ein** Abbild in ein privates Verzeichnis innerhalb der nummerierten Sitzung. Erst nachdem die Dateisysteminhalte, der Hashwert, die Identität und das dauerhafte Sync überprüft wurden, ersetzt der Speicherprozess `changes.sb`. Es gibt kein vollständiges zweites komprimiertes Abbild in RAM und auch keinen zweiten Schreibvorgang dieses Abbilds auf das Persistenzgerät. Ist zu wenig RAM für den Baum vorhanden, wird nur dieser Arbeitsbaum auf die Festplatte ausgelagert; das komprimierte Kandidatenabbild benötigt dennoch einen Schreibvorgang. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Cache- und Protokoll-Schreibrichtlinien.

Boot-Diagnosen für eine dauerhafte SquashFS-Sitzung werden unter deren `boot-logs/minios/` und `boot-logs/live/` Verzeichnissen gespeichert. Sie sind nicht von einem erfolgreichen Shutdown-Schnappschuss abhängig und bleiben auch dann verfügbar, wenn die letzten Änderungen am RAM-Upper nicht gespeichert werden konnten. Das zugrundeliegende Speichermedium muss weiterhin beschreibbar sein; normale Journaldateien können stattdessen temporär sein, falls `LIVE_LOG_STORAGE=volatile` ausgewählt ist.

Das Speichern beim Herunterfahren wird durch den Kern-MiniOS-Shutdown-Trigger und das `minios-squashfs-save` Backend umgesetzt, sodass es nicht davon abhängt, dass der MiniOS-Sitzungsmanager geöffnet oder installiert ist. Das periodische Speichern wird alle 30 Minuten durch einen systemd-Timer oder einen SysV-Worker überprüft; beide rufen dasselbe Autosave-Backend auf. Das Erstellen des Schnappschusses beansprucht CPU und schreibt den vollständigen Schnappschuss; Intervalle von einer Stunde oder länger werden empfohlen.

Während des RAM-gestützten SquashFS-Betriebs kann ein neu erstellter und aktivierter SquashFS-Schnappschuss das Ziel des laufenden Speicherns übernehmen. Nach dieser Übergabe kann der alte laufende Schnappschuss ohne Neustart entfernt werden:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Diese Ausnahme gilt nur für eine gültige Übergabe des aktuellen Boot-SquashFS. Andere laufende Persistenzmodi bleiben vor dem Löschen geschützt.

## Verschlüsselung

LUKS2 ist eine optionale Verschlüsselungsschicht über Raw, DynFileFS, DynBlk oder VMDK-Sitzungsspeicher; es handelt sich nicht um einen eigenen Sitzungsmodus. Diese Option steht nur zur Verfügung, wenn `/run/initramfs/etc/minios-initramfs-crypt` enthalten ist `luks-layer-v1` und die Tools sowie Funktionen des gewählten Backends verfügbar sind. Die DynBlk Backend-Komprimierung ist deaktiviert, wenn LUKS2 ausgewählt ist.

Die interaktive LUKS-Erstellung fordert die Passphrase zweimal ab. Vorgänge, die LUKS-Daten lesen oder erstellen, können diese über die Standard-Eingabe mit `--password-stdin`. Passphrasen werden nicht in Befehlsargumenten oder Sitzungsmetadaten gespeichert. Beim Systemstart fordert das initrd die Passphrase auf der Konsole an. Drei abgelehnte Versuche führen zu einem fatalen Abbruch des Bootvorgangs; MiniOS fährt nicht im Klartext fort, RAM, mit einem anderen Backend oder einer Ersatzsitzung unter derselben Anforderung.

Für eine inaktive, getrennte verschlüsselte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung bietet der Sitzungsmanager die Option **Passphrase ändern...**. Das entsprechende CLI-Kommando lautet:

```bash
sudo minios-session change-passphrase <id>
```

Es werden die aktuelle Passphrase, die neue Passphrase und eine Bestätigung abgefragt. Mit `--password-stdin`, geben Sie diese drei Zeilen in dieser Reihenfolge ein. Der ausgewählte Keyslot wird ersetzt, ohne alle Dateien neu zu formatieren oder zu verschlüsseln. Aktive, laufende oder eingehängte Sitzungen müssen vorher getrennt werden; zusätzliche LUKS-Keyslots, die außerhalb des Sitzungsmanagers verwaltet werden, bleiben unverändert.

Verschlüsselte Exporte enthalten entschlüsselte logische Sitzungsdateien, nicht das verschlüsselte Backend. Beim Importieren, Kopieren oder Konvertieren nach LUKS wird ein neues verschlüsseltes Backend mit neuen Identitäten erstellt.

## Einbinden einer inaktiven Sitzung

Mit dem Session Manager können Sie eine inaktive, nicht laufende Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung im Lese-/Schreibmodus einbinden, ohne sie als Boot-Standard festzulegen. Klicken Sie mit der rechten Maustaste auf die Sitzung und wählen Sie **Sitzung einbinden**; bei verschlüsselten Sitzungen wird nach der LUKS-Passphrase gefragt. Mehrere verschiedene Sitzungs-IDs können gleichzeitig eingebunden werden. **Eingebundenen Ordner öffnen** öffnet das zugehörige Dateisystem, während **Sitzungsordner öffnen** das nummerierte Verzeichnis mit den zugehörigen Backing-Dateien öffnet.

Das Schließen des Session Managers hebt eine von der GUI verwaltete Einbindung nicht auf. Öffnen Sie die Anwendung erneut, um sie anzuzeigen, und wählen Sie **Sitzung aushängen**. Ist das Aushängen ausgelastet, lässt MiniOS den Backing-Daemon, das Loop-Gerät oder das DynBlk-Gerät verbunden, anstatt den Speicher unterhalb eines laufenden Dateisystems zu trennen.

Das eigenständige CLI hält die Einbindung aufrecht, bis die Standardeingabe geschlossen wird oder ein Ctrl+C empfangen wird:

```bash
sudo minios-session mount <id>
```

Der Befehl verweigert die aktive oder laufende Sitzung und formatiert niemals ein bestehendes Dateisystem, weil das Einbinden fehlgeschlagen ist.

## Backups und fehlgeschlagene Sitzungen

Für native, DynFileFS, DynBlk, VMDK und Raw-Sitzungen, einschließlich verschlüsselter Varianten, verwenden Sie `export` für logische Backups anstelle des Kopierens eines gemounteten Sitzungsverzeichnisses. Bewahren Sie das resultierende Archiv auf einem anderen Gerät auf und überprüfen Sie vor der Nutzung, ob es importiert werden kann. Beim Import wird immer eine neue, nummerierte Sitzung erstellt; aktivieren Sie diese explizit, sobald sie einsatzbereit ist.
Für SquashFS und vollständige Geräte-Backup-Verfahren siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Wenn eine Sitzung nach vollem Speicher, unterbrochenem Schreibvorgang oder wiederholt leeren Sitzungen fehlschlägt, nehmen Sie keine weiteren Änderungen am betroffenen Speicher vor. Exportieren Sie nach Möglichkeit zuerst eine lesbare, nicht laufende Sitzung und folgen Sie dann [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

Beginnen Sie die Diagnose, ohne Sitzungsdaten zu verändern:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Beim Start werden Container-Dateisysteme vor der schreibbaren Aktivierung überprüft. Bei schwerwiegenden Fehlern bei der Dateisystemprüfung bleibt der Container zum Zweck der Wiederherstellung erhalten und wird nicht schreibbar eingehängt. SquashFS erkennt einen nicht ordnungsgemäß beendeten vorherigen Zustand und stellt den zuletzt erfolgreich gespeicherten Snapshot wieder her. Löschen Sie Sitzungen ausschließlich über den MiniOS-Sitzungsmanager oder `minios-session delete`; entfernen Sie Sitzungsverzeichnisse nicht manuell.

## Nicht verwendete DynFileFS, DynBlk und VMDK-Speicher zurückgeben

Klicken Sie im Session Manager mit der rechten Maustaste auf eine DynFileFS, DynBlk oder eine VMDK-Sitzung und wählen Sie **Speicher freigeben...**. Der Dialog funktioniert sowohl für laufende als auch für inaktive unterstützte Sitzungen und verwendet auch eine bereits über den Session Manager eingebundene Sitzung erneut. Bei einer Klartext-Sitzung führt MiniOS FITRIM auf dem tatsächlichen inneren ext4-Dateisystem aus und fordert anschließend das zugehörige Backend auf, als frei bekannten Speicherplatz zurückzugeben. Getrennte Sitzungen werden vorübergehend eingebunden und erst nach sauberem Aushängen ihres Dateisystems wieder freigegeben.

Für die Rückgewinnung von DynFileFS ist DynFileFS 4.6.0 oder neuer erforderlich. Wurde das Paket aktualisiert, während noch ein älterer DynFileFS-Daemon aktiv ist, starten Sie das aktualisierte Backend neu, bevor Sie die laufende Sitzung zurückgewinnen.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

Das Komprimierungs-Kontrollkästchen ist **standardmäßig deaktiviert**, auch bei exFAT. Es gibt keine
automatische Komprimierungs-Alternative. Verschlüsselte Sitzungen geben nur Speicherplatz frei, der bereits
dem Backend bekannt ist; dieser Vorgang aktiviert kein Discard über LUKS und
gibt das Belegungsmuster nicht preis. Gerätefehler und fehlgeschlagene Trim-Vorgänge beenden den Vorgang.

### Low-Level-Treiberbefehle

Mit dem aktuellen DynBlk-Backend (nativ oder gesplittetes VMDK) wird das Verwerfen kompletter Grains
deren Speicherplatz wiederverwendbar gemacht. Auf einem ext4-Backingsystem können ausgemusterte Bereiche
auch automatisch gelocht werden. Bei exFAT werden beim automatischen Bereinigen nur
vollständig freie Dateiende gekürzt.**Automatische Bereinigung verschiebt niemals aktive Daten.**

Verwenden Sie `fstrim` auf dem gemounteten inneren Changes-Dateisystem (nicht auf dem kombinierten AUFS/OverlayFS
Root), um gelöschte Blöcke zu melden, dann `dynblk reclaim /dev/dynblkN --execute` für
eine Bereinigung ohne Datenverschiebung. Wählen Sie das tatsächliche Sitzungsgerät aus, nicht einen angenommenen Index.
Um eine schreibintensive In-Place-Komprimierung manuell anzufordern, fügen Sie `--compact`hinzu.
Dies funktioniert, ohne das Abbild zu konvertieren oder die Größe des virtuellen Dateisystems zu ändern;
andere Lese-/Schreibvorgänge können zwischen den Rückgewinnungsschritten stattfinden. Es ist kein automatischer Fallback.
Die optionale Funktion `--scan-zeroes`liest zugeordnete Grains aus und ist standardmäßig deaktiviert.

Diese Befehle stehen auch in der neu aufgebauten initrd-DynBlk-CLI zur Verfügung. Es ist keine automatische
Kompaktierung beim Start aktiviert. Verschlüsselte Sitzungen behalten ihre bestehende Discard-
Richtlinie bei; die Tools aktivieren dm-crypt-Discard-Passthrough nicht stillschweigend.
Schreibgeschützte oder `cache=unsafe`Anhänge können nicht zurückgewonnen werden. Gemeldete gelochte
Bereiche und gekürzte Längen entsprechen nicht dem tatsächlich gemessenen freien Speicherplatz des Dateisystems.

## VMDK-Session-Workflows

VMDK ist ein separater Sitzungsmodus und kein neuer Komprimierungscodec. Sie können Sitzungen erstellen, aktivieren,
vergrößern/verkleinern, exportieren/importieren, kopieren, klonen und konvertieren – alles mit demselben Session Manager
wie bei anderen Containermodi:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Sitzungsarchive enthalten logische Dateien und Metadaten, nicht jedoch eine beliebige externe
VMDK-Anbindung. Verwaltete VMDK-Sitzungen nutzen den kanonischen`volume.vmdk` Deskriptor
und alle dazugehörigen`volume-sNNN.vmdk` Teile. Benennen Sie keine Komponenten um und kopieren Sie kein laufendes Abbild
hinter dem Treiber. Das Wechseln zwischen nativen DynBlk- und VMDK-Modus erfordert eine explizite
Kopie/Konvertierung; das manuelle Ändern von`session_mode` ist keine Konvertierung.

Der Installer bietet VMDK nur an, wenn es von der Laufzeitumgebung unterstützt wird, und lehnt Quellabbilder ab,
deren kopierte initrds nicht über die`vmdk-session-v1`-Funktion verfügen. Aktualisieren Sie CLI,
Treiber, Session-Tools und Boot-Skripte gemeinsam, bevor Sie VMDK-Sitzungen erstellen.
