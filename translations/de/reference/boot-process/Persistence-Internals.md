---
updated: 2026-10-06
---

# Persistenz-Interna

Diese Seite erläutert die `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, und `perchtoram` Boot-Parameter. Diese Parameter steuern, wo Änderungen aus einer Live-Sitzung gespeichert werden, wie eine neue Sitzung erstellt wird und ob unterstützter Sitzungsspeicher in RAM kopiert wird. Für den Normalbetrieb wählen Sie einen persistenten Eintrag im Boot-Menü oder nutzen Sie stattdessen den MiniOS-Sitzungsmanager, anstatt die Parameter manuell zu bearbeiten.

MiniOS baut das Live-Root aus schreibgeschützten Modulen und einer beschreibbaren oberen Ebene auf.
Das initrd entscheidet, ob diese obere Ebene eine nummerierte persistente Sitzung oder ein temporäres Verzeichnis in RAM ist. Diese Seite beschreibt die Entscheidung und den Aktivierungspfad beim Booten. Die benutzerseitigen Steuerungen finden Sie unter [Boot-Modi](/using-minios/Boot-Modes) und [Boot-Parameter](/reference/Boot-Parameters).

## Einfach erklärt

Ohne einen Persistenz-Parameter speichert MiniOS Änderungen in RAM und verwirft sie beim Herunterfahren. Ein Persistenz-Parameter veranlasst MiniOS, beschreibbaren Speicher zu finden, eine nummerierte Sitzung auszuwählen oder zu erstellen, die Kompatibilität zu prüfen und diese Sitzung als beschreibbare Ebene zu verwenden.

Das Anfordern von Persistenz garantiert nicht, dass sie aktiviert wurde. Ist das Ziel schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS mit einer temporären RAM-Ebene fortfahren. Lesen Sie die Startwarnung, bevor Sie sich auf gespeicherte Änderungen verlassen.

## Parameter erklärt

| Parameter | Wofür MiniOS steht | Typische Auswahl |
|---|---|---|
| `perchdir=resume` | Öffnet die standardmäßig kompatible Sitzung und erstellt unter unterstützten Bedingungen einen Ersatz, falls diese nicht verwendet werden kann. | Normale tägliche Arbeit. |
| `perchdir=setup` | Interaktive Auswahl des Persistenz-Backends sowie der unterstützten Verschlüsselungs- und Komprimierungsoptionen, anschließend wird eine neue nummerierte Sitzung erstellt. | Aktueller **Neue Sitzung beginnen** Boot-Menü-Eintrag. |
| `perchdir=new` | Erstellt direkt eine neue nummerierte Sitzung mit dem gewünschten/Standard-`perchmode`, Verschlüsselung, Komprimierung und Größe, ohne den Backend-Auswahldialog anzuzeigen. | Skripterstellte oder Experten-Boot-Einträge mit bereits festgelegten Speicheroptionen. |
| `perchdir=ask` | Zeigt gespeicherte Sitzungen an und ermöglicht die Auswahl. Wenn kein gespeicherter Sitzungsstand vorhanden ist, startet der Auswahldialog denselben Einrichtungsprozess wie bei `perchdir=setup`. | Mehrere Arbeitsbereiche auf einem Gerät, einschließlich der ersten interaktiven Einrichtung auf leerem Speicher. |
| `perchdir=NUMBER` | Fordert eine bestimmte nummerierte Sitzung an. | Stabiler, benutzerdefinierter Boot-Eintrag nach Überprüfung der Sitzungs-ID. |
| `perchmode=MODE` | Auswahl von `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, oder `squashfs`. | Das zugrundeliegende Dateisystem und das gewünschte Persistenzmodell auswählen. |
| `perchencrypt=luks` | Fügt beim Erstellen einer Raw-, DynFileFS, DynBlk- oder VMDK-Sitzung eine LUKS2-Schicht hinzu. | Verschlüsselt ein unterstütztes Container-Backend. |
| `perchsize=SIZE` | Größe einer neuen oder wachsenden Container-Sitzung anfordern. | DynFileFS, DynBlk, VMDK oder Raw; Verschlüsselung ändert nichts an der Größenlogik des Backends. |
| `perchcomp=CODEC` | Wählen Sie DynBlk Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`; die Verfügbarkeit hängt weiterhin vom laufenden Kernel ab. Komprimierung ist deaktiviert, wenn LUKS DynBlk umschließt. |
| `perchreserve=MB` | Beim Festlegen der Größe eines neuen oder wachsenden Containers wird eine Reserve abgezogen und die Warnschwelle für wenig Speicherplatz gesetzt. | Beim Zuweisen eines Containers wird Arbeitsbereich freigelassen; dies ist kein Laufzeit-Kontingent. |
| `perch` | Verwendet das ältere Wiederaufnahmeverhalten ohne automatische Ersatz-Erstellung. | Kompatibilität mit einem bestehenden benutzerdefinierten Eintrag; bevorzugen Sie `perchdir=resume` für aktuelle Menüs. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Steuert das Kopieren der Persistenz unabhängig vom System-`toram`. | `off` behält den ursprünglichen Speicher aktiv; `trim` kopiert nur die ausgewählte unterstützte Sitzung; `full` kopiert alle unterstützten Container-/SquashFS-Sitzungen. |

Wenn Persistenz angefordert wird, setzt das System-`toram` standardmäßig auf `perchtoram=trim`, sofern kein expliziter Persistenz-RAM-Modus angegeben ist. Ohne System-`toram`, bleibt Persistenz standardmäßig auf dem Speicher erhalten. Eine kopierte Sitzung ist während der Ausführung nicht dauerhaft, aber der aktuelle Sitzungsmanager kann unterstützten RAM-basierten Zustand explizit im ursprünglichen Speicher sichern oder als neue Sitzung veröffentlichen, wenn der ursprüngliche Speicher verfügbar ist und mit seiner Boot-Identität übereinstimmt.

## Persistenz ist explizit

Das initrd aktiviert die Persistenz-Verwaltung nur, wenn die Kernel-Befehlszeile einen dieser anerkannten Tokens enthält:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Fehlt einer dieser Tokens, auch wenn nur ein nicht erkannter `perch...` Name vorhanden ist, erstellt MiniOS ein neues beschreibbares Upper in RAM. Änderungen während dieses Starts werden beim Herunterfahren verworfen.

Die Selektoren sind nicht alle gleichwertig:

| Selektor | Initrd-Verhalten |
|---|---|
| `perch` | Versucht, den Standard aus den Metadaten wiederherzustellen. Erstellt keine Sitzung automatisch, wenn keine verwendbar ist oder Kompatibilitätsprüfungen fehlschlagen. |
| `perchdir=resume` | Versucht den Metadaten-Standard und kann automatisch einen neuen kompatiblen Ersatz erstellen. Dies ist das aktuelle Resume-Verhalten im Boot-Menü. |
| `perchdir=setup` | Öffnet zuerst den Backend-Auswahldialog, speichert die gewählten Backend-/Verschlüsselungs-/Komprimierungsoptionen und folgt dann dem Zuweisungspfad für neue Sitzungen. |
| `perchdir=new` | Legt ein Verzeichnis mit einer numerischen ID an, die um eins höher ist als die höchste vorhandene ID. Es wird niemals ein bestehendes Verzeichnis wiederverwendet und der Backend-Auswahldialog wird nicht geöffnet. |
| `perchdir=ask` | Bietet vorhandene Sitzungen an, falls vorhanden; eine inkompatible Sitzung erfordert eine Bestätigung. Gibt es keinen Standard/Sitzung im Speicher, wird auf `setup` umgeschaltet, sodass die erste Sitzung interaktiv erstellt werden kann. |
| `perchdir=NUMBER` | Verwendet dieses Verzeichnis, wenn es existiert. Falls nicht, kann die Auswahl auf den in den Metadaten gespeicherten Standard zurückfallen; die angeforderte Nummer wird nicht reserviert. |

Andere anerkannte Persistenz-Parameter ohne Selektor führen denselben Legacy-Resume-Pfad wie ein reines `perch`: Sie fordern Persistenz an, erlauben aber keine automatische Erstellung. Kann durch Auswahl oder Aktivierung keine verwendbare obere Ebene bereitgestellt werden, läuft der Bootvorgang normal mit dem RAM Upper weiter und gibt eine Fehlerwarnung aus.

## Sitzungsspeicher und Speicherort

Der normale Speicher ist das `changes`-Verzeichnis neben den MiniOS-Daten, mit nummerierten Sitzungsverzeichnissen und `session.conf` oder `session.json` Metadaten:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Der Speicher kann stattdessen als Gerät plus optionalem Pfad ausgewählt werden. Akzeptierte Formen sind ein direkter `/dev/...`-Pfad, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` und `askdisk:custom:path`. Der durch Doppelpunkte getrennte Suffix wird zu einem Pfad unterhalb des gewählten Geräts; Slash-Syntax nach `askdisk` ignoriert diesen benutzerdefinierten Pfad stillschweigend. Ein ausgewähltes Unterverzeichnis wird als Sitzungsspeicher bind-gemountet. MiniOS kann auch eine Persistenz-Partition auf derselben Festplatte und unterstützten Ventoy-Persistenzspeicher erkennen.

Vor der Sitzungswahl muss das initrd den Speicherort beschreibbar einhängen und nachweisen, dass es im Speicher einen Marker anlegen und entfernen kann. Ein Blockgerät, das nicht zum Schreiben geöffnet werden kann, ein schreibgeschütztes Mount, ein nicht erreichbarer Pfad oder ein fehlgeschlagener Schreibtest lehnt die Persistenz für diesen Boot ab. Vorhandene Sitzungen werden nicht allein dadurch vertraut, dass ihre Dateien lesbar sind.

## Auswahl und Kompatibilität

Sitzungsmetadaten erfassen den Speichermodus und können die MiniOS-Version, Edition, Union-Dateisystem und Containergröße speichern. Resume vergleicht den gespeicherten Modus, die Version, Edition und Union mit dem gewünschten Modus und dem aktuellen System.
Fehlende Legacy-Kompatibilitätsfelder werden nicht als Inkompatibilität gewertet.

Das Schlüsselwort `perchdir=resume` erstellt eine neue nummerierte Sitzung, wenn der Standard fehlt oder wenn eine Abweichung bei Modus, Version, Edition oder Union den Standard ungeeignet macht. Ein reines `perch`, eine direkte numerische Auswahl und andere Legacy-Resume-Anfragen lehnen einen automatischen Ersatz ab und setzen den Bootvorgang nach einem Auswahlfehler in RAM fort. `perchdir=ask` zeigt Kompatibilitätsinformationen an und erlaubt eine explizite Überschreibung. Eine neue Sitzung verwendet standardmäßig `native`, sofern kein anderer Modus angefordert wurde.

Der Speichermodus ist Teil der Kompatibilität. Erreicht die Auswahl das Backend-Dispatch, fällt ein unbekannter angeforderter Modus zurück auf `native`, dessen Probe dann ggf. DynFileFS auf ungeeignetem Speicher auswählt. Eine vorhandene Sitzung mit anderem gespeichertem Modus kann stattdessen bereits an der Kompatibilitätsprüfung scheitern; eine Legacy-Resume-Anfrage läuft dann in RAM weiter, anstatt diesen Fallback zu erreichen.

## Speicherreserve und Größen

MiniOS verwendet 256 MiB als Standard-Reserve und Warnschwelle für wenig Speicher. Die Berechnung basiert auf 1024-Byte-Dateisystemblöcken. `perchreserve` akzeptiert eine positive ganze Zahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn sie fehlt oder ungültig ist. Die Reserve reduziert den Speicherplatz, der einem neuen oder wachsenden Container angeboten wird. Es handelt sich nicht um ein Kontingent: Eine native Sitzung oder spätere Schreibvorgänge können den verbleibenden Dateisystemplatz weiterhin nutzen. Beim Booten wird gewarnt, wenn der aktuelle freie Speicher den Schwellenwert erreicht oder unterschreitet.

Containergrößen verwenden ganze Werte, die in MiB zugewiesen werden:

- Eine reine Zahl, `M`, oder `MB` bedeutet MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Raw-Container sind auf 1.000.000 MiB und durch den verfügbaren Speicher nach Reserve begrenzt. DynFileFS hat ein eigenes RAM-abhängiges Limit und eine harte Obergrenze von 2.000.000 MiB. DynBlk erhält sein natives Geometrie-Limit von `dynblk limits --format dynblk`; MiniOS erzwingt keine separate 512-GiB-Grenze.
- Raw ist eine einzelne Backing-Datei, daher begrenzt FAT32 sie auf 4000 MiB in MiniOS. Das gleiche Limit gilt, wenn Raw in LUKS2 eingebettet ist.
- Eine neue Raw-Sitzung verwendet standardmäßig 4000 MiB. Verschlüsselung erzeugt keine eigene LUKS-Größenrichtlinie: Ein verschlüsselter Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung behält die Größenregeln des zugrunde liegenden Backends bei.
- Eine neue, vom initrd erstellte DynFileFS-Sitzung ohne `perchsize` nutzt bis zu 16 GiB logische Kapazität. Falls der zugrunde liegende Speicher nach `perchreserve` und DynFileFS-Index-Overhead nicht so viel aufnehmen kann, wird der Standard auf die verfügbare Kapazität reduziert. Das Format-400-Index benötigt etwa 2 MiB RAM und etwa 2 MiB Backing-Speicher pro GiB deklarierter Kapazität, auch wenn die Nutzdaten noch leer sind. MiniOS begrenzt daher auch die DynFileFS-Kapazität durch physischen RAM und eine getestete harte Obergrenze von 2.000.000 MiB.
- Eine neue DynBlk-Sitzung ohne `perchsize` folgt derselben automatischen 16-GiB-Grenze und wird reduziert, wenn nach `perchreserve`. Eine explizite DynBlk-Größe ist eine Thin-Capacity-Anforderung, die gegen das installierte Backend-Limit geprüft wird. Metadaten für deklarierte Teile werden initial erstellt, aber der Nutzdatenspeicher wächst bei Bedarf. DynBlk verwaltet einen begrenzten Metadatencache, unabhängig vom Nutzdatenfüllstand.

Containerwachstum ist best-effort, Verkleinerung wird nicht unterstützt. `perchsize` bestimmt nicht die Größe nativer oder SquashFS-Sitzungen. Der MiniOS-Sitzungsmanager setzt manuell erstellte Raw- und DynFileFS-Container standardmäßig auf 4000 MiB und DynBlk/VMDK-Container auf 16 GiB; verschlüsselte Varianten nutzen die gleichen Backend-Standards. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Speicheraktivierung

Alle erfolgreichen Backends müssen die beschreibbare obere Ebene bereitstellen, die vom gewählten Union-Dateisystem erwartet wird. Das Einhängen eines Backends beweist für sich genommen nicht, dass Persistenz aktiv ist. Native, DynFileFS, DynBlk, VMDK und Raw können die persistenten Sitzungsmetadaten vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Raw, DynFileFS, DynBlk und VMDK können zusätzlich LUKS2-Verschlüsselung verwenden. Der geschützte Status des aktuellen Boots wird erst veröffentlicht, nachdem die finale Root-Union bestätigt, dass die erwartete obere Ebene verwendet wird.

| Backend | Persistente Repräsentation | Kapazitätsmodell | Anforderungen an den Speicherspeicher | MiniOS LUKS2-Schicht |
|---|---|---|---|---|
| `native` | Dateien und Verzeichnisse direkt im nummerierten Sitzungsverzeichnis | Verwendet direkt den Speicherplatz des Backing-Dateisystems; `perchsize` ist nicht relevant | Beschreibbares Dateisystem, das die POSIX-Verhaltensprüfung besteht | Nein |
| `dynfilefs` | Format-400 `changes.dat` plus Segmentdateien, die ein ext4-`virtual.dat` | Dünne Nutzdaten mit dichtem, kapazitätsgroßem Index | Beschreibbarer POSIX-, FAT32-, NTFS- oder exFAT-Speicher | Ja |
| `dynblk` | Format-1 `volumeNNN.db`-Dateien, die `/dev/dynblkN`, mit ext4 darüber, bereitstellen | Dünnes virtuelles Blockgerät mit plattengespeicherten Zuordnungen und begrenztem Cache | Dateisystem, das vom DynBlk-Kernel-Backend akzeptiert wird, und genügend Backend-Ressourcen | Ja |
| `vmdk` | `volume.vmdk` plus gesplittete Sparse-`volume-sNNN.vmdk`-Extents, bereitgestellt durch den DynBlk-Treiber, mit ext4 darüber | Dünnes gesplittetes Sparse-Blockgerät | Dateisystem, das vom DynBlk-VMDK-Backend akzeptiert wird, und die `vmdk-session-v1`-Fähigkeit | Ja |
| `raw` | Einzelne Datei fester Größe`changes.img`-Datei mit ext4-Inhalt | Datei wird mit der gewünschten logischen Größe erstellt; nur Wachstum möglich | Beschreibbares Dateisystem, das das Image aufnehmen kann; FAT32 ist auf 4000 MiB begrenzt | Ja |
| `squashfs` | Komprimiertes `changes.sb`-Snapshot; beschreibbares Laufzeit-Upper wird in RAM rekonstruiert | Snapshot-Größe folgt den erfassten Änderungen; `perchsize` ist nicht relevant | Vorhandene Snapshots können von unterstützten beschreibbaren Medien gelesen werden; exaktes Speichern erfordert einen geeigneten POSIX-fähigen Persistenzspeicher | Nein |

### Native

Im Native-Modus werden die beschreibbaren Union-Inhalte direkt im nummerierten Sitzungsverzeichnis gespeichert. Es gibt kein inneres Image, kein Loop-Device, keinen FUSE-Container und kein separates Blockdateisystem, daher richtet sich die Kapazität einfach nach dem freien Speicherplatz des Backing-Dateisystems und `perchsize` ist nicht relevant. Dies verursacht den geringsten Container-Overhead und erhält die normale Dateisichtbarkeit für Wiederherstellung und Backup.

MiniOS schließt zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS aus. Anschließend prüft es das tatsächliche Dateisystemverhalten, indem es eine Datei und einen Symlink erstellt und Änderungen am Ausführungsmodus testet. Bei erfolgreicher Prüfung wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich bind-gemountet. Ist das Dateisystem ungeeignet oder schlägt die POSIX-Prüfung fehl, fällt der Native-Modus auf DynFileFS zurück. Ein Fehler nach der Native-Aktivierung wird rückgängig gemacht; ein neuer leerer Kandidat wird entfernt, sofern dies sicher möglich ist.

Die MiniOS-LUKS2-Persistenzschicht umschließt den Native-Modus nicht, da Native keinen Container oder Blockgeräte-Grenze zur Verschlüsselung hat. Native-Persistenz kann jedoch auf extern verschlüsseltem Speicher liegen.

### DynFileFS

DynFileFS ist das FUSE-basierte Format-400-Container-Backend. Es stellt ein logisches `virtual.dat`-Image bereit und speichert Daten in `changes.dat` sowie nummerierten Segmentdateien. Der Helfer muss erfolgreich einhängen und `virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, anstatt versehentlich eine reine RAM-Datei mit persistent wirkendem Namen zu erzeugen.

Der Mapping-Index ist bezüglich der deklarierten logischen Kapazität dicht: Jeder 4-KiB-Block hat einen 8-Byte-Offset. Das entspricht etwa 2 MiB Index-RAM pro GiB virtueller Kapazität, und etwa genauso viel wird in den Segmentindexen gespeichert, noch bevor Nutzdaten geschrieben werden. Die Nutzdatenbelegung bleibt dynamisch. Da das statische initrd-Binary i686 ist, setzt MiniOS auch ein RAM-abhängiges Logikgrößenlimit und eine harte Obergrenze von 2.000.000 MiB unterhalb der getesteten Adressraumgrenze.

Das logische Image enthält ext4. Vorhandene Images werden vor dem beschreibbaren Einhängen geprüft; Dateisystem-Checks mit Status "Fehler korrigiert" oder schlechter lehnen die Sitzung ab, anstatt sie beschreibbar einzuhängen. Resize ist nur wachstumsorientiert, und das innere ext4-Dateisystem wird nach Möglichkeit erweitert. Für benutzerseitige Diagnose siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Der `dynblk`-Modus verwendet ein Kernel-Blockgerät, getrennt von DynFileFS. Jede nummerierte Sitzung besitzt `volume000.db` und alle ihre nummerierten Geschwister (`volume001.db`, ..., `volume1000.db`, und darüber hinaus). Das native Layout ist `DBSPRS01`, Disk-Format **1**. Nicht unterstützte Layouts werden abgelehnt, anstatt sie stillschweigend zu konvertieren. Halten Sie die installierte CLI- und Modulversion synchron.

MiniOS erstellt ext4 auf dem gesamten von `/dev/dynblk-control` zurückgegebenen Datenträger, z. B. `/dev/dynblk3`; es wird nicht angenommen, dass `dynblk0` frei ist. Vorhandenes ext4 wird vor der beschreibbaren Nutzung geprüft. Der geschützte Boot-Status zeichnet genau dieses Gerät auf, sodass beim Herunterfahren die Trennung erst nach dem Schließen aller Nutzer und des oberen Dateisystems erfolgt. Mehrere unabhängige Geräte können koexistieren.

Sitzungsmanager, Installer und initramfs fragen `dynblk limits --format dynblk` nach dem Geometrie-Limit des installierten Backends ab. Der aktuelle Ressourcenwächter erlaubt 65536 Teile: Standard-1-GiB-Logikspannen ermöglichen bis zu 64 TiB. Kleinere physische Teilgrenzen reduzieren das virtuelle Limit. Dies ist eine Geometrie-Obergrenze, kein Versprechen, dass der Host so viele Dateien offen halten oder genug RAM/Speicher hat. Wachstum wird unterstützt, Verkleinerung nicht.

Die Mapping-Tabellen liegen auf der Festplatte. `--map-memory-mb` steuert einen pro Gerät zugewiesenen Metadatencache (Standard 1 MiB, Bereich 1..64 MiB), nicht mehr als Prozentsatz von RAM oder als Limit für gemappte Daten. Extent-Beschreibungen, Open-File-Tabellen und kleine Verzeichnisse wachsen mit deklarierter Geometrie, nicht mit Nutzdatenfüllstand. Attach scannt Mapping-Metadaten und baut den Allokationsstatus temporär Teil für Teil wieder auf; es liest nicht jede Nutzlast. Ein vollständiges `dynblk check` liest die Nutzdaten. `engine_memory_bytes` schließt den Dateisystem-Page-Cache, Codec-Interna und andere Kernel-Reservierungen aus.

Metadaten-Dateien für alle deklarierten Teile werden beim Erstellen/Wachsen initialisiert; tatsächliche Daten bleiben thin. Teile sind auf 4000 MiB begrenzt. Sichern Sie den vollständigen, abgetrennten Namensraum, ohne von dreistelligen Nummern oder einem festen letzten Teil auszugehen. Ein neues Volume kann Komprimierung mit `perchcomp` wählen; spätere Ladevorgänge verwenden den gespeicherten Codec. LUKS2 über DynBlk erzwingt Komprimierung auf `none`. Teilweise Schreibvorgänge auf komprimierte Daten komprimieren aktuell den entsprechenden 64-KiB-Grain neu. Speicher- oder Ressourcenerschöpfung kann weiterhin Schreibvorgänge fehlschlagen lassen; das obere Dateisystem muss vor dem Trennen ausgehängt werden.

### VMDK-Sitzungen

Der `vmdk`-Sitzungsmodus verwendet denselben Treiber mit echten `twoGbMaxExtentSparse`
\-Images. Das Primärimage ist `volume.vmdk`, mit `volume-s001.vmdk` und weiteren
Teilen; jeder Teil umfasst bis zu 2 GiB logischen Speicherplatz. Der Deskriptor ist auf weniger als 1 MiB begrenzt, daher beschränken Dateinamenlänge und Extent-Anzahl die Kapazität.
Session Manager, Installer und initramfs fragen
 ab.`dynblk limits --format vmdk`.
Der Native-Modus verwendet weiterhin `volume000.db`; keiner der Modi interpretiert die Dateien des jeweils anderen neu.
Verwaltete Sitzungen importieren keine beliebig extern partitionierte VMDK-
als Sitzungsmetadaten.

VMDK-Sitzungsunterstützung wird von `vmdk-session-v1` in
`/etc/minios-initramfs-dynblk` im initrd angekündigt. Die aktuelle Laufzeit und jedes
Quell-initrd, das vom Installer kopiert wird, müssen sie unterstützen. VMDK hat keine native Komprimierung;
`perchcomp` wird beim Booten mit Warnung ignoriert und der Sitzungsmanager lehnt einen
nicht-`none`-VMDK-Codec ab. LUKS2 bleibt eine optionale, separate Verschlüsselungsschicht. Beide Modi veröffentlichen
ihren tatsächlichen Sitzungsmodus und den zugehörigen `dynblk_device` im geschützten Boot-Status,
und beide Shutdown-Implementierungen schließen dieses Gerät, nachdem alle Nutzer beendet sind.

Beide Treiberformate unterstützen `writeback`, `writethrough`, `none`, `directsync` und explizite `unsafe`Anbindungsrichtlinien. Direkte Modi erfordern derzeit ext2/ext4 als Unterbau. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` bindet ein bestehendes Dateisystem ein; `umount` gibt das vom Helfer verwaltete Gerät nach dem letzten Nutzer frei. Manuelles `dynblk load` hat eine explizite Lebensdauer. Dadurch wird kein Dateisystem erstellt oder LUKS entsperrt.

### Raw

Im Raw-Modus wird eine `changes.img`-Datei mit ext4 verwendet. Die Dateigröße wird bei der Erstellung auf die gewünschte logische Kapazität gesetzt, sodass – anders als bei dynamischen Backends – die Kapazität bis zu einer expliziten Erweiterung fest bleibt. Das untere Dateisystem kann unbeschriebene Bereiche zwar spärlich abbilden, aber MiniOS behandelt Raw dennoch als Speicher mit fester Kapazität und prüft den verfügbaren Speicherplatz vor dem Erstellen oder Erweitern. Da alles in einer Host-Datei liegt, ist FAT32 auf 4000 MiB begrenzt.

Vorhandene Raw-Images werden mit `e2fsck` vor dem beschreibbaren Einhängen geprüft. Beim Wachstum wird `changes.img` erweitert und ext4 mit `resize2fs` vergrößert; Verkleinerung wird nicht unterstützt. Ein fehlgeschlagener Check oder Mount erhält das Image zur Wiederherstellung und setzt den Boot in RAM fort. Raw benötigt keinen FUSE-Daemon oder spezielle Blockspeicher-Metadaten, was die Wiederherstellung einfach macht, aber es fehlt das Thin-Capacity-Verhalten von DynFileFS und DynBlk.

### LUKS-Verschlüsselungsschicht

LUKS2 ist eine optionale Verschlüsselungsschicht, die beim Anlegen mit `perchencrypt=luks` ausgewählt werden kann, wenn eine Raw-, DynFileFS-, DynBlk- oder VMDK-Session erstellt wird. Bestehende Sessions übernehmen ihren Verschlüsselungsstatus aus den Sitzungsmetadaten; die Angabe von `perchencrypt` zu einem späteren Zeitpunkt ändert oder konvertiert eine bestehende unverschlüsselte Session nicht.

Die Verschlüsselungsgrenze hängt vom Backend ab: Bei Raw wird `changes.img` über ein Loop-Device eingebunden und LUKS2 innerhalb dieser Datei platziert; DynFileFS bindet das bereitgestellte `virtual.dat` ebenfalls über ein Loop-Device ein und verschlüsselt dieses logische Abbild; DynBlk nutzt das zugewiesene `/dev/dynblkN` Blockgerät direkt; VMDK verwendet das vom gleichen DynBlk-Treiber bereitgestellte Blockgerät für sein geteiltes Sparse-Image. In allen vier Fällen erstellt MiniOS ein ext4-Dateisystem innerhalb von `/dev/mapper/...`, sodass die Dateisysteminhalte und Metadaten innerhalb des Mappers im Ruhezustand verschlüsselt sind. Backend-Metadaten außerhalb der LUKS-Grenze, VMDK-Deskriptoren, Boot-Dateien, Sitzungsmetadaten und andere Dateien auf dem Speichermedium bleiben unverschlüsselt.

Größenvorgaben, Wachstumsgrenzen, FAT32-Einschränkungen und das Verhalten bei Thin/Fixed Allocation gehören weiterhin zum jeweiligen Backend. Das initrd authentifiziert vor dem Vergrößern eines bestehenden verschlüsselten Backends, schließt den Mapper vor dem Backend-Wachstum, öffnet ihn dann erneut, prüft ext4 und erweitert das Dateisystem vor dem Mounten. Für verschlüsselte DynBlk wird die Backend-Komprimierung auf `none` erzwungen.

Bei der Erstellung wird das Passwort zweimal abgefragt. Bestehende verschlüsselte Sessions erlauben drei Entsperrversuche an der Boot-Konsole. Nach drei abgelehnten Passwörtern wird ein fataler Boot-Pfad ausgelöst: MiniOS fährt in RAM nicht fort, interpretiert die gleiche Session nicht als unverschlüsselt, wählt kein anderes Backend und erstellt keinen Ersatz. Andere Fehler beim Erstellen, Prüfen, Vergrößern oder Einbinden behalten ihr backend-spezifisches Wiederherstellungsverhalten ohne Fallback auf unverschlüsselte Daten bei. Passwörter werden weder in den Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben. Logische Exporte enthalten entschlüsselte Sitzungsdateien statt eines verschlüsselten Backend-Abbilds.

Siehe [Sicherheit](/maintenance-and-recovery/Security) für Informationen zur Schutzgrenze und zu Backup-Überlegungen.

### SquashFS

Das initrd aktiviert normalerweise eine bestehende SquashFS-Sitzung. Die interaktive Einrichtung erstellt Generation-0-Metadaten mit aktiviertem Shutdown-Speichern, legt aber kein `changes.sb` an; die beschreibbare obere Ebene existiert nur in RAM, bis das laufende System erstmals auf Anforderung oder beim Herunterfahren speichert. Eine Generation-0-Sitzung ist nur gültig, wenn Snapshot-Artefaktfelder und `changes.sb` fehlen. Für spätere Generationen validiert die Aktivierung strikte, eindeutig gesetzte Metadaten für den Snapshot, einschließlich dessen Digest, komprimierter und unkomprimierter Größe, Eintragszahl, Union-Typ und Speicherpolitik. Außerdem werden Dateityp und exakte Größe, verfügbarer RAM und Swap, der SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität geprüft.

Der Snapshot wird mit striktem Fehler- und xattr-Handling in ein begrenztes, temporäres ext4-Image in RAM extrahiert. Für OverlayFS enthält dieses Image separate `changes` und `workdir`-Verzeichnisse; für AUFS ist dessen Root der beschreibbare Zweig.
Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Policy führen zum Aktivierungsfehler und lassen den Boot mit dem normalen RAM Upper weiterlaufen.

Eine Sitzung mit dem Status `dirty` bedeutet, dass der vorherige Boot den sauberen Shutdown-Übergang nicht abgeschlossen hat. SquashFS warnt dann und stellt den zuletzt erfolgreich gespeicherten `changes.sb` wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Boot sind keine zweite Rollback-Generation.

Der MiniOS-Sitzungsmanager und das System-Backend zum Speichern erstellen und ersetzen SquashFS-Snapshots atomar durch exakte Erfassung. Beim Booten kann ein vorhandener Snapshot von unterstützten beschreibbaren FAT-, exFAT- oder NTFS-Medien gelesen werden, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben dateisystemabhängig: Der Sitzungsspeicher muss privaten Arbeitsbereich, Linux-Metadaten und dauerhafte Veröffentlichung auf einem geeigneten POSIX-Dateisystem unterstützen.

Beim Speichern erfasst das Backend zuerst einen stabilen Dateibaum im privaten, root-eigenen Speicher, wenn das initrd ein vertrauenswürdiges tmpfs mit genügend Platz bereitstellt. Ist RAM nicht ausreichend, wird stattdessen der vorherige Festplattenarbeitsbereich genutzt. Der Kompressor schreibt direkt in ein privates Modus-0700-Verzeichnis auf dem Sitzungsdateisystem, nicht in ein zusätzliches RAM-Image mit anschließendem Festplattenkopieren. MiniOS prüft das komprimierte Ergebnis und dessen Identität, synchronisiert es, verschiebt es auf einen privaten Kandidatennamen und validiert den Kandidaten erneut, bevor der aktive `changes.sb` atomar ersetzt wird. Fehlgeschlagene Kopien oder Komprimierungen ersetzen den letzten erfolgreichen Snapshot nicht.

Bei einer gesunden, dauerhaften Sitzung werden `/var/log/minios` und `/var/log/live` aus `boot-logs/` im nummerierten Sitzungsverzeichnis bind-gemountet. Diese Startdiagnosen werden daher unabhängig vom RAM Upper und dem Shutdown-Snapshot geschrieben. Ein Boot, dessen Persistenzspeicher nicht dauerhaft aktiviert wurde, kann nicht garantieren, dass diese Logs einen Neustart überstehen. Normale Logs und Caches können separat konfiguriert werden; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS hat keine `perchsize`: Die gespeicherte Größe folgt den komprimierten erfassten Änderungen, während der Laufzeitspeicher durch das extrahierte beschreibbare Upper bestimmt wird. Die MiniOS-LUKS-Persistenzschicht umschließt `changes.sb` nicht; falls Vertraulichkeit für Snapshots erforderlich ist, muss der zugrunde liegende Speicher außerhalb dieser Schicht verschlüsselt werden. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Union-Aktivierung und Wiederherstellungsgrenze

Für AUFS wird das aktivierte Änderungs-Root zum beschreibbaren Branch 0. Bei OverlayFS erstellt das initrd `upperdir` und `workdir` unterhalb des aktivierten Änderungs-Roots und mountet die schreibgeschützten Module als untere Verzeichnisse. Das initrd prüft dann den Live-AUFS-Branch oder OverlayFS `upperdir` bevor Persistenz als aktiv veröffentlicht wird.

Schlägt ein Persistenz-Backend, ein Metadaten-Update oder diese Prüfung fehl, werden die Mounts soweit möglich rückgängig gemacht, kein erfolgreicher Persistenzstatus veröffentlicht und der beschreibbare Boot läuft in RAM weiter. Ein Fehler beim Erstellen der Root-Union führt zur fatalen initramfs-Shell. Das Verlassen dieser Shell kann die Einrichtung mit einem ungültigen Root fortsetzen; dies ist keine Reparatur oder ein sicherer Fallback. AUFS behält best-effort-Modul-Branch-Anhänge bei, aber eine unvollständige Union überschreitet die Wiederherstellungsgrenze: MiniOS markiert Persistenz dann nicht als aktiv.

Fehler bei Container-Prüfungen vermeiden absichtlich das beschreibbare Einhängen einer verdächtigen Sitzung.
Ersetzen oder rekonstruieren Sie Sitzungsdateien nicht während des Bootvorgangs. Sichern Sie zuerst den betroffenen Speicher; siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Aktiver, laufender und aktueller Boot-Status

In dauerhaften Sitzungsmetadaten ist `default=` die **aktive** Sitzung, die für das nächste Resume ausgewählt wurde, während `running=` die Sitzung ist, die als Quelle für das aktuelle Boot aufgezeichnet wurde. Die Aktivierung schreibt beide Felder und markiert diese Sitzung als `dirty`.
Nachdem die Persistenz-Mounts bei einem sauberen Shutdown entfernt wurden, löscht MiniOS `running=` und markiert die Sitzung als `clean`.

Diese Metadatenfelder können nach einem Absturz, fehlgeschriebenen Metadaten, fehlgeschlagener Union-Erstellung, kopiertem Speicher oder unterbrochenem Shutdown veraltet sein. Laufzeitkomponenten, die das Speichern erlauben, vertrauen nicht nur auf `running=`. Sie verwenden den geschützten aktuellen Boot-Status des initrd, der an Boot-ID, numerische Sitzung, Modus, tatsächliche Speicheridentität, Schreibstatus, Dauerhaftigkeit, verifizierte aktive Generation und – für DynBlk – das exakt angehängte `/dev/dynblkN`-Gerät gebunden ist. Ein fehlgeschlagener oder fehlender Current-Boot-Eintrag bedeutet, dass Persistenz nicht als genehmigtes Speicherziel verwendet werden darf.

Mit `perchtoram=trim` oder `full` werden unterstützte Sitzungscontainer vor der Aktivierung in ein dediziertes tmpfs kopiert. Die kopierte Sitzung kann beschreibbar sein und das laufende Upper bereitstellen, aber der geschützte aktuelle Boot-Status markiert sie als nicht dauerhaft und zeichnet eine separate `ram-origin`-Identität für den Originalspeicher auf. `trim` kopiert nur die ausgewählte unterstützte Sitzung und die zugehörigen Metadaten; `full` kopiert jede unterstützte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung im Speicher. Native Verzeichnis-Sitzungen sind ausgeschlossen. Der aktuelle Sitzungsmanager nutzt `ram-origin` zur Auflösung des Originalspeichers per Dateisystem-UUID und kann die RAM-basierte Sitzung explizit zurückspeichern oder als neue nummerierte Sitzung veröffentlichen. Nicht gespeicherte RAM-Änderungen gehen dennoch verloren, wenn kein erfolgreiches Zurückschreiben erfolgt.

Weitere Hinweise zum Betrieb finden Sie unter [Boot-Modi](/using-minios/Boot-Modes), [Boot-Parameter](/reference/Boot-Parameters), [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence), [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicherheit](/maintenance-and-recovery/Security), und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Sitzungsbezogene Speicherbereinigung

`minios-session reclaim ID` unterstützt DynFileFS-, DynBlk- und VMDK-Sitzungen. Bei einer unverschlüsselten Sitzung wird FITRIM auf dem tatsächlichen inneren ext4-Dateisystem ausgeführt, niemals auf dem kombinierten AUFS/OverlayFS-Root, und anschließend die Speicherbereinigung des jeweiligen Backends aufgerufen. Die DynFileFS-Bereinigung erfordert DynFileFS 4.6.0 oder neuer.

Bei einer laufenden DynFileFS-Sitzung wechselt der Sitzungsmanager in einen kurzlebigen privaten Mount-Namespace, um `virtual.dat` unterhalb des Live-ext4-Overmounts zu erreichen, ohne den aktiven Systemdienst, das Loop-Device oder Union-Mounts zu stören. Laufende DynBlk-/VMDK-Geräte werden gegen den geschützten aktuellen Boot-Status validiert. Inaktive Sitzungen werden temporär angehängt und gemountet; eine bereits vom Sitzungsmanager gemountete Sitzung nutzt diese bestehende Verbindung. Ein blockiertes Unmounten stoppt das Teardown, anstatt den Speicher unter einem laufenden Dateisystem zu trennen.

Weder Boot noch Shutdown führen automatisch eine Kompaktierung durch. `--compact` ist eine explizite Benutzerentscheidung im CLI oder als nicht geprüfte Option im Sitzungsmanager-Dialog und kann Live-Daten verschieben, was zu erhöhten Flash-Schreibvorgängen führt. Ohne diese Option geben Backends nur Speicher frei, den sie ohne Verschieben von Live-Daten zurückgeben können, z. B. lochbare Bereiche oder vollständig freie Dateiende; auf Dateisystemen wie exFAT können freigegebene Innenbereiche weiterhin im Container wiederverwendbar bleiben, auch wenn sie nicht an das Host-Dateisystem zurückgegeben werden. Verschlüsselte Sitzungen geben nur Speicher frei, der dem Backend bereits bekannt ist, und aktivieren Discard nicht stillschweigend über dm-crypt.
