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

| Modus | Speicher | Wichtigste Einschränkungen | MiniOS-Ebene für LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Änderungen werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares Dateisystem, das die Linux-Metadaten und -Vorgänge unterstützt, nach denen MiniOS sucht. Die Kapazität richtet sich nach dem verfügbaren Speicherplatz des zugrunde liegenden Speichers; `perchsize` ist nicht anwendbar. | Nein |
| `dynfilefs` | Erweiterbares `virtual.dat` auf Basis von Dateien im Format 600 mit ext4 im Inneren | Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen. Belegt Speicherplatz bei Bedarf. | Ja |
| `dynblk` | Dünn bereitgestelltes ext4-Dateisystem auf einem Kernel-Blockgerät, das auf `volumeNNN.db`-Dateien basiert | Erfordert die DynBlk-CLI, ein Kernelmodul und Unterstützung durch die initrd. Die beim Booten erstellte Größe beträgt standardmäßig bis zu 16 GiB; die Höchstgröße wird gemeldet von `dynblk limits`. Auf dem Datenträger gespeicherte Zuordnungen verwenden einen begrenzten Metadaten-Cache. | Ja |
| `vmdk` | Dünn bereitgestelltes ext4-Dateisystem auf einer standardmäßigen, aufgeteilten Sparse-VMDK, bereitgestellt durch den Treiber DynBlk | Verwendet `volume.vmdk` und `volume-sNNN.vmdk`. Keine Komprimierung. Erfordert `vmdk-session-v1` in der Markierung für die initrd-Funktionen der laufenden Sitzung. Derselbe manuelle Standardwert von 16 GiB wie bei DynBlk; Grenzwerte abfragen mit `dynblk limits --format vmdk` für Grenzwerte. | Ja |
| `raw` | Einzelne `changes.img`-Datei mit ext4 | Feste logische Kapazität, die nur explizit erweitert werden kann. Funktioniert auf beschreibbaren POSIX-, FAT32-, NTFS- und exFAT-Dateisystemen; bei FAT32 gilt eine Grenze von 4000 MiB. | Ja |
| `squashfs` | Komprimierter Snapshot in `changes.sb`; der zur Laufzeit beschreibbare obere Layer wird in RAM rekonstruiert | `perchsize` ist nicht anwendbar. Vorhandene Snapshots können von unterstützten beschreibbaren Medien wiederhergestellt werden; zum exakten Speichern ist ein geeigneter POSIX-fähiger Persistenzspeicher erforderlich. | Nein |

Raw, DynFileFS, DynBlk und VMDK können optional eine LUKS2-Verschlüsselungsebene enthalten. Das Speicher-Backend bleibt der Sitzungsmodus; Sitzungsmetadaten erfassen die Verschlüsselung separat. DynFileFS und mit `minios-session` erstelltes Raw verwenden standardmäßig 4000 MiB; DynBlk und VMDK verwenden standardmäßig 16 GiB. Größenangaben werden in MiB zugewiesen; `GB` und `TB`-Endungen werden in 1000 bzw. 1.000.000 MiB umgerechnet. Raw ist auf FAT32 unabhängig von einer Verschlüsselung auf 4000 MiB begrenzt. DynFileFS speichert Indexseiten auf dem Datenträger und lädt sie bei Bedarf in den Cache. DynBlk speichert Zuordnungstabellen auf dem Datenträger und verwendet einen begrenzten Metadaten-Cache in RAM, standardmäßig 1 MiB statt eines Prozentsatzes von RAM. Die Vektoren für Bereiche und Dateien sowie die Verzeichnisse wachsen mit den deklarierten Teilen; zum Befüllen der Nutzdaten ist keine vollständig im Speicher gehaltene Zuordnung erforderlich. Die installierte Kapazitätsgrenze lässt sich abfragen mit `dynblk limits --format dynblk`. Tatsächliche Schreibvorgänge bleiben durch den freien Speicherplatz des zugrunde liegenden Dateisystems und die Ressourcenfreigabe des Backends begrenzt. Container können nur vergrößert werden; ein Verkleinern wird nicht unterstützt.

Wenn die aktuelle Laufzeitumgebung DynFileFS erstmals einen vorhandenen Container im Format 400 oder 500 einbindet, konvertiert sie ihn automatisch direkt vor Ort in das Format 600, sofern die alte Aufteilung eine gerade MiB-Anzahl hat. Eine Aufteilung mit einer ungeraden MiB-Anzahl wird abgelehnt, ohne die Quelle zu ändern. Dabei wird das Containerformat aktualisiert, nicht der `dynfilefs`-Sitzungsmodus. Erstellen Sie eine getrennte Sicherung und aktualisieren Sie die Boot-initrd vor der Konvertierung; ältere Hilfsprogramme können den konvertierten Container nicht öffnen.

Der Native-Modus ist die einfachste und schnellste Option auf einem kompatiblen Dateisystem.
Verwenden Sie DynFileFS, wenn das Dateisystem für die Persistenz keine Linux-Metadaten darstellen kann.
Verwenden Sie DynBlk, wenn Sie ein echtes Kernel-Blockgerät mit dünn bereitgestellten Backing-Dateien benötigen. Der Treiber kann mehrere unabhängige DynBlk-Volumes gleichzeitig eingebunden halten, und Session Manager verwendet den vom Treiber zurückgegebenen Gerätepfad, statt davon auszugehen, dass `/dev/dynblk0` frei ist. DynBlk und VMDK sind nicht verfügbar, solange UEFI Secure Boot aktiviert ist, da MiniOS das externe Kernelmodul DynBlk nicht signiert. Installer und Session Manager blenden diese Modi daher aus und lehnen explizite Erstellungsanfragen ab, bevor sie versuchen, das Modul zu laden.
Verwenden Sie raw, wenn eine feste Speicherzuweisung erforderlich ist, fügen Sie LUKS2 hinzu, wenn die Sitzung verschlüsselt werden muss, und verwenden Sie SquashFS für einen exakt komprimierten Snapshot.

Führen Sie die folgenden Befehle aus, um das tatsächliche Dateisystem für die Persistenz und die darauf verfügbaren Modi zu prüfen:

```bash
sudo minios-session info
sudo minios-session status
```

Auf schreibgeschützten Medien kann keine Sitzung erstellt werden. Die Initrd kann einen vorhandenen SquashFS-Snapshot lesen und aktivieren, der auf beschreibbarem FAT, exFAT oder NTFS gespeichert ist, da sie den Snapshot in einen temporären ext4-Upper entpackt. Einen Snapshot zu erstellen oder exakt zu speichern ist etwas anderes: Der Persistenzspeicher muss die erforderlichen POSIX-Metadaten und eine private, dauerhafte Veröffentlichung unterstützen. Der Arbeitsbaum für die exakte Erfassung verwendet, sofern verfügbar, vertrusted RAM; falls RAM nicht ausreicht, wird auf einen Arbeitsbereich auf dem Datenträger zurückgegriffen.

## Boot-Auswahl

Jeder erkannte Persistenzparameter aktiviert die Verarbeitung der Persistenz. MiniOS Bootmenüs bieten normalerweise Einträge zum Fortsetzen, zum Starten einer neuen Sitzung, zur Auswahl und ohne Persistenz. Die maßgebliche Beschreibung der Auswahl-, Kompatibilitäts-, Fallback- und Aktivierungssemantik finden Sie unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Parameter | Bedeutung |
|-----------|---------|
| `perch` | Verwendet den bisherigen Best-Effort-Pfad zum Fortsetzen. Dabei wird der Metadatenstandard versucht, aber kein Ersatz erstellt, wenn kein nutzbarer Eintrag vorhanden ist. |
| `perchdir=resume` | Setzt die Metadatenstandardsitzung fort und ermöglicht der Initrd, eine neue kompatible Sitzung zu erstellen, wenn diese fehlt oder inkompatibel ist. Dies entspricht dem aktuellen Verhalten beim Fortsetzen über das Bootmenü. |
| `perchdir=setup` | Öffnet die interaktive Auswahl des Persistenz-Backends und erstellt anschließend eine neue Sitzung mit Sitzungsnummer. Dies entspricht dem aktuellen **Neue Sitzung beginnen**-Verhalten. |
| `perchdir=new` | Erstellt direkt eine neue Sitzung mit Sitzungsnummer anhand der angeforderten bzw. standardmäßigen Backend-, Verschlüsselungs-, Komprimierungs- und Größeneinstellungen, ohne die Backend-Auswahl zu öffnen. |
| `perchdir=ask` | Wählt eine vorhandene Sitzung aus. Ist der Speicher leer, wird automatisch derselbe Einrichtungsablauf wie bei `perchdir=setup` gestartet. |
| `perchdir=<id>` | Wählt diese Sitzung mit Sitzungsnummer direkt aus. |
| `perchdir=<device/path>` | Verwendet einen Persistenzspeicherort auf einem Gerät, einschließlich `/dev/...` und `label:...`-Formaten, die von der Initrd verarbeitet werden. |
| `perchmode=<mode>` | Legt `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, oder `squashfs`. |
| `perchencrypt=luks` | Verschlüsselt eine neu erstellte Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung mit LUKS2. Bei vorhandenen Sitzungen wird die Verschlüsselung ausschließlich anhand der Metadaten bestimmt. |
| `perchcomp=<codec>` | Wählt die Backend-Komprimierung DynBlk für eine neue DynBlk-Sitzung aus. Die Komprimierung wird auf `none` festgelegt, wenn DynBlk in LUKS2 eingebunden ist. |
| `perchsize=<size>` | Legt die Größe eines neuen oder größeren Containers fest. Werte ohne Einheit werden in MiB angegeben; akzeptiert werden auch die Suffixe `MB`, `GB` und `TB`. |

Wenn für eine neue Sitzung kein Modus angegeben ist, verwendet der Start den nativen Modus. Auf FAT32/NTFS/exFAT oder wenn die Prüfungen des nativen Dateisystems fehlschlagen, wird beim Start DynBlk bevorzugt, sofern das Hilfsprogramm verfügbar ist und Secure Boot dies zulässt; andernfalls wird auf DynFileFS zurückgegriffen. Dieser Fallback ändert den Speichermodus einer vorhandenen Sitzung nicht. Für einen neuen Raw-Container gilt standardmäßig eine Größe von 4000 MiB. Neue DynFileFS-, DynBlk- und VMDK-Bootsitzungen ohne `perchsize` verwenden bis zu 16 GiB. Wenn nach Abzug der Sicherheitsreserve weniger Speicherplatz verfügbar ist, wird die automatische Größe reduziert. Die Kapazitätsprüfungen des Backends gelten weiterhin. Eine ausdrücklich angeforderte Vergrößerung von DynBlk richtet sich nach der installierten Backend-Grenze, die mit `dynblk limits --format dynblk` abgefragt wird. Bei aktiviertem Secure Boot bietet die Initrd DynBlk/VMDK nicht an und behandelt eine ausdrücklich angeforderte oder fortzusetzende Sitzung mit DynBlk/VMDK als nicht verfügbar, anstatt zu versuchen, das nicht signierte Modul zu laden.
SquashFS-Sitzungen lassen sich vom laufenden System aus mit dem MiniOS-Sitzungsmanager oder `minios-session create squashfs` erfassen. Bei der Einrichtung durch die Initrd werden nur Metadaten für Sitzungsgeneration null erstellt; die beschreibbare obere Ebene bleibt in RAM. Das laufende System erstellt den ersten `changes.sb`-Snapshot nach Bedarf oder beim Herunterfahren.

Beim Fortsetzen prüft MiniOS die aufgezeichnete Version, Edition, das Union-Dateisystem und den Modus. Mit dem Literal `perchdir=resume` kann eine neue Sitzung erstellt werden, anstatt einen fehlenden oder inkompatiblen Standard zu verwenden. Ein bloßes `perch`, eine direkte Auswahl anhand der Sitzungsnummer und andere Anfragen zum Fortsetzen nach bisherigem Verfahren erstellen diesen Ersatz nicht automatisch.
Bei der interaktiven Auswahl wird eine Warnung angezeigt, bevor eine inkompatible Sitzung zugelassen wird. Falls die Auswahl oder Aktivierung dennoch fehlschlägt, wird der Start normalerweise mit einer RAM-Oberfläche und einer Persistenzwarnung fortgesetzt.

Der Sitzungsspeicher hat folgende Form:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` speichert die Standard- und laufenden IDs sowie Modus, Version, Edition, Union-Dateisystem, Größe, Status und modusspezifische Einstellungen für jede Sitzung.
Es handelt sich um persistente Metadaten, die von der Boot-Implementierung geschrieben werden und für sich genommen keinen Beleg für den aktuellen Laufzeitstatus darstellen. Bearbeiten Sie diese Daten nicht und verschieben Sie keine nummerierten Sitzungsdaten, solange eine Sitzung eingebunden ist. Verwenden Sie den MiniOS-Sitzungsmanager oder `minios-session`.

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

## Zurückgeben ungenutzter DynFileFS, DynBlk und VMDK-Speicher

Wenn Sie Dateien innerhalb einer persistenten Sitzung löschen, werden die `changes.dat`-Segmente des Hosts **nicht** unbedingt kleiner. Das interne ext4-Dateisystem weiß, welche Blöcke frei sind, aber das Speicher-Backend kann diese Blöcke weiterhin als belegt betrachten. Die **Free Space...**-Aktion soll Speicherplatz auf dem USB-Laufwerk zurückgewinnen, nicht die logische Kapazität der Sitzung erhöhen.

Für DynFileFS haben die Vorgänge unterschiedliche Zwecke:

| Mechanismus | Wofür Sie ihn verwenden | Was dabei tatsächlich geschieht |
| --- | --- | --- |
| **TRIM / Verwerfen** | Sie haben Dateien in einer unverschlüsselten ext4-Sitzung gelöscht und möchten dem Backend mitteilen, welche Blöcke nicht mehr benötigt werden. | `fstrim` informiert DynFileFS über ungenutzte logische Blöcke. Ganze 4-KiB-Blöcke können freigegeben werden; Teilbereiche werden mit Nullen überschrieben. Physische Speicherplätze können wiederverwendet werden, sobald sie nicht mehr referenziert werden. Das ist nicht dasselbe wie sicheres Löschen. |
| **Automatisches Hole-Punching und Kürzen am Dateiende** | Sie möchten Speicherplatz im Host-Dateisystem zurückgewinnen, ohne vorhandene Daten zu verschieben. | Nach erfolgreichem Verwerfen kann DynFileFS ungenutzte physische Bereiche in einem unterstützenden Backing-Dateisystem (z. B. ext4) freigeben und vollständig freie Segmentenden kürzen. FAT32/exFAT können innere Lücken auf diese Weise im Allgemeinen nicht freigeben. |
| **Speicherplatz zurückgewinnen** (standardmäßig **Free Space...**) | Sie haben Dateien gelöscht und möchten eine Bereinigung ohne Verschieben durchführen, einschließlich der Rückgewinnung ungenutzter Speicherplätze aus früheren Einbindungen. | Session Manager führt FITRIM auf dem internen ext4-Dateisystem aus und ruft `dynfilefs --reclaim` auf. Dadurch kann Speicherplatz an den Host zurückgegeben werden oder es werden lediglich physische Speicherplätze im Container zur Wiederverwendung freigegeben. Dabei werden aktive Blöcke **nicht** verschoben. |
| **Komprimierung** (`--compact`) | Sie verwenden FAT32/exFAT oder haben fragmentierte Segmentdateien, deren freie Speicherplätze *vor* aktiven Daten liegen und deren Dateien durch eine Bereinigung ohne Verschieben nicht gekürzt werden können. | Verschiebt aktive Blöcke auf freie Speicherplätze mit niedrigeren Nummern und kürzt anschließend, sofern möglich, freie Dateiende. Dabei können deutlich mehr Schreibvorgänge anfallen und der Vorgang kann wesentlich länger dauern. Verwenden Sie diese Option nur, wenn der zurückgewonnene Speicherplatz auf dem Host den Aufwand wert ist. |

**Welche Option sollten Sie wählen?** Wählen Sie normalerweise **Free Space...** ohne Komprimierung, nachdem Sie eine erhebliche Datenmenge gelöscht haben. Prüfen Sie anschließend den tatsächlich freien Speicherplatz auf dem USB-Laufwerk. Aktivieren Sie **Komprimierung** nur, wenn die Backing-Dateien trotz freien Speicherplatzes in der Sitzung groß bleiben, insbesondere bei FAT32/exFAT. Wenn nichts gelöscht wurde oder der Speicher bereits vollständig belegt ist, gewinnen Sie durch die Rückgewinnung von Speicherplatz und die Komprimierung möglicherweise nichts. Betrachten Sie diese Vorgänge nicht als regelmäßige SSD-Wartung oder als Ersatz für eine Sicherung.

**Einschränkungen:** Das Löschen in einem Dateisystem beweist nicht, dass die betreffenden Blöcke verworfen wurden; das interne Dateisystem muss ungenutzte Blöcke melden. Bei verschlüsselten LUKS-Sitzungen werden Verwerfungsanforderungen nicht automatisch durch die Verschlüsselungsschicht weitergeleitet. Wie viel Speicherplatz tatsächlich zurückgegeben werden kann, hängt von der Unterstützung durch das Backing-Dateisystem und der Anordnung aktiver Blöcke ab. Die Boot-Option `perchtoram=trim` hat damit nichts zu tun: Sie legt fest, welche Sitzungen nach RAM kopiert werden, nicht, ob Dateisystemblöcke verworfen werden.

Klicken Sie im Session Manager mit der rechten Maustaste auf eine DynFileFS, einen DynBlk oder eine VMDK-Sitzung und wählen Sie **Freien Speicherplatz ...**. Der Dialog funktioniert mit einer laufenden oder inaktiven unterstützten Sitzung und verwendet auch eine Sitzung wieder, die bereits über den Session Manager eingebunden ist. Bei einer Klartext-Sitzung führt MiniOS FITRIM auf dem tatsächlichen inneren ext4-Dateisystem aus und fordert anschließend das zuständige Backend auf, den als frei bekannten Speicherplatz im zugrunde liegenden Speicher freizugeben. Getrennte Sitzungen werden vorübergehend eingebunden und erst freigegeben, nachdem ihr Dateisystem sauber ausgehängt wurde.

DynFileFS-Snapshots können Blöcke enthalten, die Sie aus dem Arbeitsimage gelöscht haben. Beim Freigeben von Speicherplatz werden Snapshots niemals gelöscht. Wurde das Paket aktualisiert, während noch ein älterer DynFileFS-Daemon aktiv ist, starten Sie mit der aktualisierten initrd neu, damit für diese Startsitzung die aktuelle Laufzeitumgebung verwendet wird.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

Das Kontrollkästchen für die Komprimierung ist **standardmäßig deaktiviert**, auch bei exFAT. Es gibt keine
automatische Ausweichkomprimierung. Bei verschlüsselten Sitzungen wird nur Speicherplatz freigegeben, der dem Backend bereits
als frei bekannt ist; dieser Vorgang aktiviert weder Discard über LUKS noch
legt er das Belegungsmuster offen. Gerätefehler und fehlgeschlagene TRIM-Vorgänge brechen den Vorgang ab.

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
