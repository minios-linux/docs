---
updated: 2026-09-16
---

# Persistenz-Interna

Diese Seite erklärt die Boot-Parameter `perch`, `perchdir`, `perchmode`, `perchsize` und `perchreserve`. Diese Parameter steuern, wo Änderungen aus einer Live-Sitzung gespeichert werden. Für den normalen Gebrauch wählen Sie einen persistenten Eintrag im Boot-Menü oder verwenden Sie den MiniOS-Sitzungsmanager, anstatt die Parameter manuell zu bearbeiten.

MiniOS baut das Live-Root aus schreibgeschützten Modulen und einer beschreibbaren oberen Ebene auf.
Das initrd entscheidet, ob diese obere Ebene eine nummerierte persistente Sitzung oder ein temporäres Verzeichnis in RAM ist. Diese Seite beschreibt diese Entscheidung und den Aktivierungspfad beim Booten. Für die benutzerseitigen Einstellungen siehe [Boot-Modi](/using-minios/Boot-Modes) und [Boot-Parameter](/reference/Boot-Parameters).

## Einfach erklärt

Ohne einen Persistenz-Parameter speichert MiniOS Änderungen in RAM und verwirft sie beim Herunterfahren. Ein Persistenz-Parameter weist MiniOS an, beschreibbaren Speicher zu finden, eine nummerierte Sitzung auszuwählen oder zu erstellen, die Kompatibilität zu prüfen und diese Sitzung als beschreibbare Ebene zu verwenden.

Das Anfordern von Persistenz garantiert nicht, dass sie tatsächlich aktiv ist. Ist das Ziel schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS mit einer temporären RAM-Ebene fortfahren. Lesen Sie die Startwarnung, bevor Sie sich auf gespeicherte Änderungen verlassen.

## Parameter erklärt

| Parameter | Was es MiniOS mitteilt | Typische Auswahl |
|---|---|---|
| `perchdir=resume` | Öffnet die standardmäßige kompatible Sitzung und erstellt, sofern unterstützt, einen Ersatz, wenn diese nicht verwendet werden kann. | Normale tägliche Arbeit. |
| `perchdir=new` | Eine neue nummerierte Sitzung erstellen. | Einen bestehenden Arbeitsbereich unverändert lassen. |
| `perchdir=ask` | Zeigt gespeicherte Sitzungen an, nachdem ein fortsetzbarer Speicher gefunden wurde, und ermöglicht die Auswahl. Die erste Sitzung kann auf leerem Speicher nicht erstellt werden. | Mehrere bestehende Arbeitsbereiche auf einem Gerät; verwenden Sie `perchdir=new` für die erste Sitzung. |
| `perchdir=NUMBER` | Eine bestimmte nummerierte Sitzung anfordern. | Stabiler benutzerdefinierter Boot-Eintrag nach Überprüfung der Sitzungs-ID. |
| `perchmode=MODE` | Wählen Sie `native`, `dynfilefs`, `dynblk`, `raw` oder `squashfs`. | Das zugrunde liegende Dateisystem und das gewünschte Persistenzmodell anpassen. |
| `perchencrypt=luks` | Fügen Sie beim Erstellen einer Raw-, DynFileFS- oder DynBlk-Sitzung eine LUKS2-Schicht hinzu. | Einen unterstützten Container-Backend verschlüsseln. |
| `perchsize=SIZE` | Die Größe einer neuen oder wachsenden Container-Sitzung anfordern. | DynFileFS, DynBlk oder raw; Verschlüsselung ändert nichts an der Backend-Größenlogik. |
| `perchcomp=CODEC` | Wählen Sie DynBlk Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate` oder `842`; die Verfügbarkeit hängt weiterhin vom laufenden Kernel ab. Die Komprimierung ist deaktiviert, wenn LUKS DynBlk umschließt. |
| `perchreserve=MB` | Beim Festlegen der Größe eines neuen oder wachsenden Containers wird eine Reserve abgezogen und die Warnschwelle für wenig Speicherplatz gesetzt. | Beim Anlegen eines Containers wird Arbeitsbereich freigehalten; dies ist kein Laufzeit-Kontingent. |
| `perch` | Das ältere Resume-Verhalten ohne automatische Ersatz-Erstellung verwenden. | Kompatibilität mit einem bestehenden benutzerdefinierten Eintrag; bevorzugen Sie `perchdir=resume` für aktuelle Menüs. |

Kombinieren Sie Persistenz nicht mit `toram` wenn Sie erwarten, dass Änderungen auf das Originalgerät zurückgeschrieben werden. MiniOS aktiviert die kopierte Sitzung in RAM, und Änderungen an dieser Kopie gehen beim Herunterfahren verloren.

## Persistenz ist explizit

Das initrd aktiviert die Persistenzverwaltung nur, wenn auf der Kernel-Befehlszeile einer dieser anerkannten Tokens vorhanden ist:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Fehlt einer dieser Tokens – auch wenn nur ein nicht erkannter `perch...` Name vorhanden ist, erstellt MiniOS ein neues beschreibbares Upper-Verzeichnis in RAM. Änderungen während dieses Starts werden beim Herunterfahren verworfen.

Die Selektoren sind nicht alle gleichwertig:

| Selektor | Initrd-Verhalten |
|---|---|
| `perch` | Versucht, den Standardwert aus den Metadaten fortzusetzen. Erstellt keine Sitzung automatisch, wenn keine verwendbar ist oder Kompatibilitätsprüfungen fehlschlagen. |
| `perchdir=resume` | Versucht den Standardwert aus den Metadaten und kann automatisch einen neuen kompatiblen Ersatz anlegen. Dies entspricht dem aktuellen Resume-Verhalten im Boot-Menü. |
| `perchdir=new` | Legt ein Verzeichnis mit einer numerischen ID an, die um eins höher ist als die höchste vorhandene numerische ID. Ein bestehendes Verzeichnis wird nie wiederverwendet. |
| `perchdir=ask` | Bietet vorhandene Sitzungen an, nachdem ein fortsetzbarer Speicher und ein Standard gefunden wurden. Eine inkompatible vorhandene Sitzung erfordert eine Bestätigung. Bei leerem Speicher verwenden Sie `perchdir=new` zur Erstellung der ersten Sitzung. |
| `perchdir=NUMBER` | Verwendet dieses Verzeichnis, wenn es existiert. Falls nicht, kann die Auswahl auf den in den Metadaten hinterlegten Standard zurückfallen; die gewünschte Nummer wird nicht reserviert. |

Andere anerkannte Persistenz-Parameter ohne Selektor führen denselben Legacy-Resume-Pfad wie ein nackter `perch`: Sie fordern Persistenz an, ermöglichen aber keine automatische Erstellung. Falls Auswahl oder Aktivierung kein verwendbares Upper erzeugen kann, startet das System wie gewohnt mit dem RAM Upper und gibt eine Fehlermeldung aus.

## Session-Speicher und Speicherort

Der Standardspeicher ist das`changes` Verzeichnis neben den MiniOS-Daten, mit nummerierten Sitzungsverzeichnissen und`session.conf` oder `session.json` Metadaten:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Alternativ kann der Speicher als Gerät mit optionalem Pfad ausgewählt werden. Akzeptierte Formen sind ein direkter`/dev/...` Pfad,`/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, und `askdisk:custom:path`. Das durch Doppelpunkte getrennte Suffix wird als Pfad unterhalb des gewählten Geräts verwendet; eine Slash-Syntax nach`askdisk` ignoriert diesen benutzerdefinierten Pfad stillschweigend. Ein ausgewähltes Unterverzeichnis wird als Session-Speicher per Bind-Mount eingebunden. MiniOS kann außerdem eine Persistenz-Partition auf demselben Laufwerk sowie unterstützte Ventoy-Persistenzspeicher erkennen.

Vor der Sitzungswahl muss das initrd den Speicherort mit Schreibrechten einbinden und nachweisen, dass es eine Markierungsdatei im Speicher anlegen und entfernen kann. Ein Blockgerät, das nicht zum Schreiben geöffnet werden kann, ein schreibgeschütztes Dateisystem, ein nicht erreichbarer Pfad oder ein fehlgeschlagener Schreibtest führen dazu, dass Persistenz für diesen Start abgelehnt wird. Bereits vorhandene Sitzungen werden nicht allein dadurch akzeptiert, dass ihre Dateien lesbar sind.

## Auswahl und Kompatibilität

Sitzungsmetadaten zeichnen den Speichermodus auf und können die MiniOS-Version, Edition, Union-Dateisystem und Containergröße speichern. Beim Resume werden der aufgezeichnete Modus, die Version, Edition und Union mit dem gewünschten Modus und dem aktuellen System verglichen.
Fehlende Legacy-Kompatibilitätsfelder werden nicht als Inkompatibilität gewertet.

Das explizite `perchdir=resume` erstellt eine neue nummerierte Sitzung, wenn das Standard nicht vorhanden ist oder wenn ein aufgezeichneter Modus, eine Version, Edition oder Union nicht passt. Ein nacktes `perch`, eine direkte numerische Auswahl und andere Legacy-Resume-Anfragen lehnen den automatischen Ersatz ab und setzen nach Auswahlfehler in RAM fort. `perchdir=ask` zeigt Kompatibilitätsinformationen an und erlaubt eine explizite Überschreibung. Eine neue Sitzung verwendet standardmäßig `native`, sofern kein anderer Modus angefordert wurde.

Der Speichermodus ist Teil der Kompatibilität. Wenn die Auswahl die Backend-Dispatch erreicht, fällt ein unbekannter angeforderter Modus auf `native` zurück, dessen Probe dann ggf. DynFileFS auf ungeeignetem Speicher auswählt. Eine bestehende Sitzung mit anderem aufgezeichnetem Modus kann stattdessen an der früheren Kompatibilitätsprüfung scheitern; eine Legacy-Resume-Anfrage setzt dann in RAM fort, anstatt auf dieses Fallback zu gelangen.

## Reserven und Größen für Speicherplatz

MiniOS verwendet standardmäßig 256 MiB als Allokationspuffer und Schwellenwert für die Speicherplatzwarnung. Die Berechnung basiert auf 1024-Byte-Dateisystemblöcken. `perchreserve` akzeptiert eine positive ganze Zahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn kein Wert oder ein ungültiger Wert angegeben wird. Die Reserve verringert den Speicherplatz, der einem neuen oder wachsenden Container angeboten wird. Es handelt sich nicht um ein Quota: Eine native Sitzung oder spätere Schreibvorgänge können den verbleibenden Speicherplatz weiterhin nutzen. Beim Systemstart erfolgt eine Warnung, wenn der aktuelle freie Speicherplatz den Schwellenwert erreicht oder unterschreitet.

Containergrößen werden als ganze Zahlen in MiB zugewiesen:

- Eine reine Zahl, `M`, oder `MB` steht für MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Raw-Container sind auf 1.000.000 MiB sowie auf den nach der Reserve verfügbaren Speicherplatz begrenzt. DynFileFS besitzt eine eigene, RAM-abhängige Begrenzung und ein festes Limit von 2.000.000 MiB. DynBlk hat eine eigene Obergrenze von 512 GiB für das Format/ABI.
- Raw ist eine einzelne Backing-Datei, daher begrenzt FAT32 sie in MiniOS auf 4000 MiB. Das gleiche Limit gilt, wenn Raw in LUKS2 eingebettet ist.
- Eine neue Raw-Sitzung verwendet standardmäßig 4000 MiB. Die Verschlüsselung legt keine eigene LUKS-Größenrichtlinie fest: Ein verschlüsselter Raw-, DynFileFS- oder DynBlk-Container übernimmt die Größenregeln seines zugrunde liegenden Backends.
- Eine neue, durch initrd erstellte DynFileFS-Sitzung ohne `perchsize` nutzt bis zu 16 GiB logische Kapazität. Falls der zugrundeliegende Speicher nach `perchreserve` und DynFileFS-Index-Overhead letztlich nicht so viel aufnehmen kann, wird der Standardwert auf die verfügbare Kapazität reduziert. Der Format-400-Index benötigt etwa 2 MiB RAM sowie etwa 2 MiB Backing-Speicher pro GiB deklarierter logischer Kapazität, auch wenn die Nutzdaten noch leer sind. MiniOS begrenzt daher auch die DynFileFS-Kapazität durch physischen RAM und ein getestetes festes Limit von 2.000.000 MiB.
- Eine neue DynBlk-Sitzung ohne `perchsize` folgt ebenfalls der automatischen Obergrenze von 16 GiB und wird reduziert, wenn nach `perchreserve`. Eine explizite DynBlk-Virtuellgröße ist weiterhin eine Thin-Capacity-Anforderung und nur durch die 512 GiB Format/ABI-Obergrenze begrenzt; physische Backing-Dateien werden bei Bedarf erstellt. DynBlk verwaltet seine eigene Sparse-Mapping-Speicherpolitik und benötigt keine MiniOS-Größenangabe für dieses Budget.

Das Vergrößern von Containern erfolgt nach dem Best-Effort-Prinzip, das Verkleinern wird nicht unterstützt. `perchsize` bestimmt nicht die Größe von nativen oder SquashFS-Sitzungen. Der MiniOS-Sitzungsmanager setzt manuell erstellte Raw- und DynFileFS-Container standardmäßig auf 4000 MiB und DynBlk auf 16 GiB; verschlüsselte Varianten nutzen die gleichen Backend-Standards. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Speicheraktivierung

Alle erfolgreichen Backends müssen das beschreibbare Upper bereitstellen, das vom gewählten Union-Dateisystem erwartet wird. Das Einbinden eines Backends allein beweist nicht, dass Persistenz aktiv ist. Native, DynFileFS, DynBlk und Raw können persistente Sitzungsmetadaten vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Raw, DynFileFS und DynBlk können zusätzlich LUKS2-Verschlüsselung verwenden. Der geschützte aktuelle Boot-Status wird erst veröffentlicht, nachdem die finale Root-Union bestätigt wurde und das erwartete Upper verwendet.

| Backend | Persistente Darstellung | Kapazitätsmodell | Anforderungen an das Backing-Storage | MiniOS LUKS2-Schicht |
|---|---|---|---|---|
| `native` | Dateien und Verzeichnisse direkt im nummerierten Sitzungsverzeichnis | Verwendet direkt den Speicherplatz des zugrunde liegenden Dateisystems; `perchsize` nicht zutreffend | Beschreibbares Dateisystem, das die POSIX-Verhaltensprüfung besteht | Nein |
| `dynfilefs` | Format-400 `changes.dat` plus Segmentdateien mit ext4- `virtual.dat` | Schlanke Nutzlast mit einem dichten, kapazitätsgroßen Index | Beschreibbarer POSIX-, FAT32-, NTFS- oder exFAT-Speicher | Ja |
| `dynblk` | Format-1 `volumeNNN.db` Dateien mit `/dev/dynblkN`, darüber ext4 | Schlankes virtuelles Blockgerät mit sparsamen Laufzeitzuweisungen | Dateisystem, das vom DynBlk-Kernel-Backend akzeptiert wird, sowie ausreichende Backend-Ressourcen | Ja |
| `raw` | Einzelne Datei fester Größe `changes.img` mit ext4-Inhalt | Datei wird mit der gewünschten logischen Größe erstellt; nur Wachstum möglich | Beschreibbares Dateisystem, das das Image aufnehmen kann; FAT32 ist auf 4000 MiB begrenzt | Ja |
| `squashfs` | Komprimiertes `changes.sb` Snapshot; das beschreibbare Laufzeit-Upper wird in RAM rekonstruiert | Snapshot-Größe entspricht den erfassten Änderungen; `perchsize` nicht zutreffend | Vorhandene Snapshots können von unterstützten beschreibbaren Medien gelesen werden, aber exaktes Speichern erfordert ein POSIX-fähiges Staging-Dateisystem | Nein |

### Nativ

Im nativen Modus werden die beschreibbaren Union-Inhalte direkt im nummerierten Sitzungsverzeichnis gespeichert. Es gibt kein internes Abbild, kein Loop-Device, keinen FUSE-Container und kein separates Block-Dateisystem, daher richtet sich die Kapazität einfach nach dem freien Speicherplatz auf dem zugrunde liegenden Dateisystem und `perchsize` ist nicht relevant. Dies verursacht den geringsten Overhead und erhält die normale Dateisichtbarkeit für Wiederherstellung und Backup.

MiniOS schließt zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS aus. Anschließend prüft es das tatsächliche Verhalten des Dateisystems, indem eine Datei und ein Symlink erstellt und Änderungen an den Ausführungsrechten getestet werden. Ist die Prüfung erfolgreich, wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich eingebunden. Ist das Dateisystem als ungeeignet bekannt oder schlägt die POSIX-Prüfung fehl, wechselt der native Modus auf DynFileFS zurück. Ein Fehler nach der Aktivierung des nativen Modus wird rückgängig gemacht; ein neuer, leerer Kandidat wird entfernt, sobald dies sicher möglich ist.

Die MiniOS LUKS2-Persistenzschicht umschließt den nativen Modus nicht, da es im nativen Modus keine Container- oder Block-Device-Grenze zum Verschlüsseln gibt. Native Persistenz kann sich dennoch auf einem außerhalb dieser Persistenzschicht verschlüsselten Speicher befinden.

### DynFileFS

DynFileFS ist das FUSE-basierte format-400-Container-Backend. Es stellt ein logisches`virtual.dat` Image bereit und speichert die Daten in`changes.dat` plus nummerierten Segmentdateien. Der Helper muss erfolgreich einbinden und`virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, anstatt versehentlich eine Datei nur für RAM mit einem persistent wirkenden Namen zu erzeugen.

Der Mapping-Index ist in Bezug auf die deklarierte logische Kapazität dicht: Jeder logische 4-KiB-Block hat einen 8-Byte-Offset. Das entspricht etwa 2 MiB Index-RAM pro GiB virtueller Kapazität, und ungefähr die gleiche Menge wird in den zugehörigen Segmentindizes gespeichert, noch bevor Nutzdaten geschrieben werden. Die Zuweisung der Nutzdaten bleibt dabei dynamisch. Da das statische initrd-Binary i686 ist, setzt MiniOS außerdem ein RAM-bewusstes logisches Größenlimit sowie eine harte Obergrenze von 2.000.000 MiB unterhalb des getesteten Adressraum-Fehlerpunkts.

Das logische Image enthält ext4. Vor dem beschreibbaren Einbinden werden bestehende Images überprüft; Ergebnisse der Dateisystemprüfung, die über den Status "korrigierte Fehler" hinausgehen, führen dazu, dass die Sitzung abgelehnt und nicht beschreibbar eingebunden wird. Eine Größenänderung ist nur als Vergrößerung möglich, und das interne ext4-Dateisystem wird, wenn möglich, erweitert. Für eine Diagnose aus Anwendersicht siehe[Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Der `dynblk`-Modus ist ein Kernel-Block-Device-Backend, getrennt von DynFileFS. Jede nummerierte Sitzung besitzt einen `volume000.db`Namensraum mit bei Bedarf erzeugten `volume001.db` bis `volume063.db`-Geschwistern. Das Anhängen eines Volumes über `/dev/dynblk-control`liefert ein dynamisch zugewiesenes Whole-Disk-Device wie `/dev/dynblk0` oder `/dev/dynblk3`; MiniOS muss das zurückgegebene Device verwenden und darf nicht davon ausgehen, dass `dynblk0`frei ist. Es können gleichzeitig mehrere DynBlk-Volumes angehängt werden.

MiniOS erstellt ext4 direkt auf dem DynBlk Whole-Disk-Device, prüft vorhandenes ext4 vor schreibbarem Zugriff und unterstützt Wachstum bis zum Format-1-Limit von 512 GiB. Verkleinerung wird nicht unterstützt. Der geschützte Boot-Status zeichnet das genaue `/dev/dynblkN`auf, das von der laufenden persistenten Sitzung verwendet wird, sodass beim Herunterfahren genau dieses Device getrennt wird, nachdem das Dateisystem ausgehängt wurde. Dies bleibt auch dann korrekt, wenn der Session Manager vorübergehend eine andere DynBlk-Sitzung parallel anhängt.

Die virtuelle Kapazität ist thin: Es handelt sich nicht um vorab zugewiesenen Host-Speicher oder Mapping-RAM. DynBlk hält 128 logische 4-KiB-Mappings in jedem 4-KiB-Laufzeit-Chunk, sodass der dichte Mapping-Speicher etwa 8 MiB/GiB beträgt. Level-0-Baumzeiger befinden sich zusammen mit diesen sparsamen Chunks; der feste Internal-Node-Index belegt 396.312 Byte pro angehängtem Gerät, und Referenzzähler für physische Seiten werden bei Bedarf in 4-KiB-Chunks zugeteilt, die jeweils 8 MiB Backing-Space abdecken. Wenn kein explizites Mapping-Budget angegeben ist, wählt der DynBlk-Treiber selbst etwa 25 % des vom Kernel gemeldeten nutzbaren RAM nach 64-MiB-Normalisierung, begrenzt auf 4096 MiB. MiniOS überlässt diese Richtlinie dem Treiber.

Ein neues DynBlk-Volume kann Backend-Komprimierung verwenden, die mit `perchcomp`ausgewählt wird. Komprimierung ist eine Eigenschaft des DynBlk-Speicherformats und nach der Erstellung für dieses Volume festgelegt. Wenn LUKS2 DynBlk kapselt, erzwingt MiniOS DynBlk-Komprimierung auf `none`, da die Verschlüsselungsschicht oberhalb des DynBlk-Geräts liegt. Tatsächliche Schreibvorgänge können dennoch fehlschlagen, etwa durch zu wenig freien Speicher im darunterliegenden Dateisystem, den 64-teiligen Backing-Namensraum oder die DynBlk-Mapping-Zulassung. Ein fehlgeschlagenes oder gesperrtes Gerät wird erst getrennt, nachdem das darüberliegende Dateisystem nicht mehr eingehängt ist; die Wiederherstellung prüft das gespeicherte Format beim nächsten Anhängen.

### Raw

Im Raw-Modus wird eine `changes.img`-Datei mit ext4 verwendet. Die Dateigröße wird bei der Erstellung auf die gewünschte logische Kapazität festgelegt. Im Gegensatz zu den dynamischen Backends bleibt die Kapazität daher unverändert, bis sie explizit vergrößert wird. Das darunterliegende Dateisystem kann nicht beschriebene Bereiche zwar spärlich anlegen, aber MiniOS behandelt Raw trotzdem als Speicher mit fester Kapazität und prüft vor dem Erstellen oder Vergrößern, ob ausreichend Speicherplatz vorhanden ist. Da sich alles in einer Host-Datei befindet, ist FAT32 auf 4000 MiB begrenzt.

Vor dem schreibbaren Einbinden werden bestehende Raw-Images mit `e2fsck` überprüft. Beim Vergrößern wird zunächst `changes.img` erweitert und anschließend ext4 mit `resize2fs` vergrößert; Verkleinern wird nicht unterstützt. Bei einer fehlgeschlagenen Prüfung oder Einbindung bleibt das Image zur Wiederherstellung erhalten, und der Bootvorgang wird in RAM fortgesetzt. Raw benötigt keinen FUSE-Daemon und keine eigenen Blockspeicher-Metadaten, was das Wiederherstellungsmodell einfach macht, aber die Thin-Capacity-Funktionalität von DynFileFS und DynBlk fehlt.

### LUKS-Verschlüsselungsschicht

LUKS2 ist eine optionale Verschlüsselungsschicht, die beim Anlegen einer `perchencrypt=luks` Raw-, DynFileFS- oder DynBlk-Sitzung ausgewählt werden kann. Bestehende Sitzungen übernehmen ihren Verschlüsselungsstatus aus den Sitzungsmetadaten; eine spätere Angabe von `perchencrypt` ändert oder konvertiert eine bestehende Klartext-Sitzung nicht.

Die Verschlüsselungsgrenze hängt vom Backend ab: Raw bindet `changes.img` über ein Loop-Device ein und legt LUKS2 in diese Datei; DynFileFS bindet das bereitgestellte `virtual.dat` ebenfalls über ein Loop-Device ein und verschlüsselt dieses logische Abbild; DynBlk verwendet das `/dev/dynblkN` Blockgerät direkt als LUKS2-Quelle. In allen drei Fällen erzeugt MiniOS ein ext4-Dateisystem innerhalb von `/dev/mapper/...`, sodass die Dateisysteminhalte und Metadaten innerhalb des Mappers im Ruhezustand verschlüsselt sind. Backend-Metadaten außerhalb der LUKS-Grenze, Bootdateien, Sitzungsmetadaten und andere Dateien auf dem Speichermedium bleiben unverschlüsselt.

Größenvorgaben, Wachstumslimits, FAT32-Einschränkungen sowie das Verhalten bei Thin/Fixed Allocation gehören weiterhin zum jeweiligen Backend. Das initrd authentifiziert sich, bevor ein bestehendes verschlüsseltes Backend vergrößert wird, schließt den Mapper vor dem Backend-Wachstum, öffnet ihn anschließend wieder, prüft ext4 und erweitert das Dateisystem vor dem Einhängen. Bei verschlüsseltem DynBlk wird die Backend-Komprimierung auf `none` erzwungen.

Bei der Erstellung wird das Passwort zweimal abgefragt. Bestehende verschlüsselte Sitzungen erlauben drei Entsperrversuche an der Boot-Konsole. Drei abgelehnte Passphrasen führen zu einem fatalen Bootpfad: MiniOS fährt in RAM nicht fort, interpretiert die Sitzung nicht als Klartext, wählt kein anderes Backend und erstellt keinen Ersatz. Andere Fehler beim Erstellen, Prüfen, Vergrößern oder Einhängen behalten ihr backend-spezifisches Wiederherstellungsverhalten ohne Klartext-Fallback bei. Passphrasen werden weder in den Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben. Logische Exporte enthalten entschlüsselte Sitzungsdateien statt eines verschlüsselten Backend-Abbilds.

Siehe [Sicherheit](/maintenance-and-recovery/Security) für Informationen zur Schutzgrenze und zu Backup-Überlegungen.

### SquashFS

Das initrd aktiviert normalerweise eine bestehende SquashFS-Sitzung. Die interaktive Einrichtung erstellt Metadaten der Generation Null mit aktiviertem Speichern beim Herunterfahren, erzeugt jedoch kein `changes.sb`; die beschreibbare obere Schicht existiert nur in RAM, bis das laufende System das erste Mal auf Anforderung oder beim Herunterfahren speichert. Eine Sitzung der Generation Null ist nur dann gültig, wenn Snapshot-Artefaktfelder und `changes.sb` fehlen. Für spätere Generationen validiert die Aktivierung strikte, eindeutig zugewiesene Metadaten für den Snapshot, einschließlich dessen Digest, komprimierter und unkomprimierter Größe, Eintragsanzahl, Union-Typ und Speicherstrategie. Außerdem werden Dateityp und exakte Größe, verfügbarer RAM und Swap, der SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität geprüft.

Der Snapshot wird mit strikter Fehler- und xattr-Behandlung in ein begrenztes, temporäres ext4-Image in RAM extrahiert. Für OverlayFS enthält dieses Image getrennte `changes` und `workdir` Verzeichnisse; bei AUFS ist dessen Root der beschreibbare Zweig.
Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Richtlinie führen dazu, dass die Aktivierung fehlschlägt und der Bootvorgang auf dem normalen RAM-Upper verbleibt.

Eine Sitzung mit dem Status `dirty` bedeutet, dass der vorherige Bootvorgang den sauberen Shutdown-Übergang nicht abgeschlossen hat. SquashFS warnt dann und stellt den zuletzt erfolgreich gespeicherten `changes.sb` wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Bootvorgang gelten nicht als zweite Rollback-Generation.

Der MiniOS-Sitzungsmanager und das System-Backend für das Speichern erstellen und ersetzen SquashFS-Snapshots atomar durch exakte Erfassung. Beim Booten kann ein vorhandener Snapshot von beschreibbarem FAT-, exFAT- oder NTFS-Speicher gelesen werden, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben vom Dateisystem abhängig: Der private Staging-Bereich muss Links, Eigentümer, Modi, xattrs, ACLs, Fähigkeiten und Union-Whiteouts erhalten, daher erfordert das aktuelle Speichern ein geeignetes POSIX-Dateisystem.

SquashFS besitzt keine `perchsize`: Die gespeicherte Größe richtet sich nach den komprimierten, erfassten Änderungen, während der Speicherbedarf zur Laufzeit von der extrahierten beschreibbaren oberen Schicht abhängt. Die MiniOS-LUKS-Persistenzschicht kapselt `changes.sb` nicht; falls Vertraulichkeit für Snapshots erforderlich ist, muss das zugrundeliegende Speichermedium außerhalb dieser Schicht verschlüsselt werden. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Union-Aktivierung und Wiederherstellungsgrenze

Für AUFS wird das aktivierte Änderungs-Root zum beschreibbaren Branch Null. Für OverlayFS erstellt das initrd `upperdir` und `workdir` unterhalb des aktivierten Änderungs-Roots und bindet die schreibgeschützten Module als untere Verzeichnisse ein. Anschließend prüft das initrd den Live-AUFS-Branch oder OverlayFS `upperdir`, bevor Persistenz als aktiv veröffentlicht wird.

Falls ein Persistenz-Backend, ein Metadaten-Update oder diese Prüfung fehlschlägt, werden die Mounts soweit möglich rückgängig gemacht, kein erfolgreicher Persistenzstatus veröffentlicht und der beschreibbare Boot läuft in RAM weiter. Das Scheitern beim Aufbau der Root-Union führt zur fatalen Initramfs-Shell. Das Verlassen dieser Shell kann die Einrichtung mit einem ungültigen Root fortsetzen; dies ist keine Reparatur und kein sicherer Fallback. AUFS behält bestmögliche Modul-Branch-Anhänge bei, aber eine unvollständige Union überschreitet die Wiederherstellungsgrenze: MiniOS markiert Persistenz nicht als aktiv.

Fehler bei Containerprüfungen vermeiden absichtlich das beschreibbare Einbinden einer verdächtigen Sitzung.
Ersetzen oder rekonstruieren Sie Sitzungsdateien während des Bootvorgangs nicht. Sichern Sie zuerst den betroffenen Speicher; siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Aktiver, laufender und aktueller Boot-Status

In den dauerhaften Sitzungs-Metadaten ist `default=` die **aktive** Sitzung, die für den nächsten Resume ausgewählt ist, während `running=` die Sitzung ist, die als Quelle für den aktuellen Boot-Vorgang aufgezeichnet wurde. Die Aktivierung schreibt beide Felder und markiert diese Sitzung als `dirty`.
Nachdem Persistenz-Mounts bei einem sauberen Shutdown entfernt wurden, entfernt MiniOS `running=` und markiert die Sitzung als `clean`.

Diese Metadaten-Felder können nach einem Absturz, einem fehlgeschlagenen Metadaten-Schreibvorgang, einer fehlgeschlagenen Union-Erstellung, einem kopierten Store oder einem unterbrochenen Shutdown veraltet sein. Laufzeitkomponenten, die das Speichern erlauben, vertrauen nicht nur auf `running=` allein. Sie nutzen den geschützten aktuellen Boot-Status des initrd, der an die Boot-ID, die numerische Sitzung, den Modus, die tatsächliche Store-Identität, den Schreibstatus, die Dauerhaftigkeit, die verifizierte aktive Generation und – bei DynBlk – das exakt angeschlossene `/dev/dynblkN` Gerät gebunden ist. Ein fehlgeschriebener oder nicht vorhandener aktueller Boot-Eintrag bedeutet, dass Persistenz nicht als zugelassenes Speicherziel behandelt werden darf.

Mit `toram` und einer erkannten Persistenz-Anforderung wird der Sitzungs-Store vor der Aktivierung in RAM kopiert. Die kopierte Sitzung kann schreibbar sein und das laufende Upper bereitstellen, aber ihr aktueller Boot-Status ist als nicht dauerhaft markiert. Änderungen an dieser RAM-Kopie werden nicht auf das Originalgerät zurückgeschrieben und gehen beim Herunterfahren verloren.

Weitere Hinweise zum Betrieb finden Sie unter [Boot-Modi](/using-minios/Boot-Modes), [Boot-Parameter](/reference/Boot-Parameters), [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence), [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicherheit](/maintenance-and-recovery/Security), und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).
