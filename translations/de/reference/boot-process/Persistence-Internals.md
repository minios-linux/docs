---
updated: 2026-09-26
---

# Persistenz-Interna

Diese Seite erklärt die Boot-Parameter `perch`, `perchdir`, `perchmode`, `perchsize` und `perchreserve`. Diese Parameter steuern, wo Änderungen aus einer Live-Sitzung gespeichert werden. Für den normalen Gebrauch wählen Sie einen persistenten Eintrag im Boot-Menü oder verwenden Sie den MiniOS-Sitzungsmanager, anstatt die Parameter manuell zu bearbeiten.

MiniOS baut das Live-Root aus schreibgeschützten Modulen und einer beschreibbaren oberen Ebene auf.
Das initrd entscheidet, ob diese obere Ebene eine nummerierte persistente Sitzung oder ein temporäres Verzeichnis in RAM ist. Diese Seite beschreibt diese Entscheidung und den Aktivierungspfad beim Booten. Für die benutzerseitigen Einstellungen siehe [Boot-Modi](/using-minios/Boot-Modes) und [Boot-Parameter](/reference/Boot-Parameters).

## Einfach erklärt

Ohne einen Persistenz-Parameter speichert MiniOS Änderungen in RAM und verwirft sie beim Herunterfahren. Ein Persistenz-Parameter weist MiniOS an, beschreibbaren Speicher zu finden, eine nummerierte Sitzung auszuwählen oder zu erstellen, die Kompatibilität zu prüfen und diese Sitzung als beschreibbare Ebene zu verwenden.

Das Anfordern von Persistenz garantiert nicht, dass sie tatsächlich aktiv ist. Ist das Ziel schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS mit einer temporären RAM-Ebene fortfahren. Lesen Sie die Startwarnung, bevor Sie sich auf gespeicherte Änderungen verlassen.

## Parametererklärung

| Parameter | Was es über MiniOS aussagt | Typische Auswahl |
|---|---|---|
| `perchdir=resume` | Öffnet die standardmäßig kompatible Sitzung und erstellt unter unterstützten Bedingungen einen Ersatz, wenn diese nicht verwendet werden kann. | Normale tägliche Arbeit. |
| `perchdir=new` | Erstellt eine neue, nummerierte Sitzung. | Belässt einen bestehenden Arbeitsbereich unverändert. |
| `perchdir=ask` | Zeigt gespeicherte Sitzungen an, nachdem ein fortsetzbarer Speicher gefunden wurde, und ermöglicht die Auswahl. Die erste Sitzung auf einem leeren Speicher kann damit nicht erstellt werden. | Mehrere vorhandene Arbeitsbereiche auf einem Gerät; verwenden Sie `perchdir=new` für die erste Sitzung. |
| `perchdir=NUMBER` | Fordert eine bestimmte nummerierte Sitzung an. | Stabiler benutzerdefinierter Boot-Eintrag nach Überprüfung der Sitzungs-ID. |
| `perchmode=MODE` | Wählen Sie `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, oder `squashfs`. | Abgleich des zugrunde liegenden Dateisystems und des gewünschten Persistenzmodells. |
| `perchencrypt=luks` | Fügt beim Erstellen einer Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung eine LUKS2-Schicht hinzu. | Verschlüsselt ein unterstütztes Container-Backend. |
| `perchsize=SIZE` | Fordert die Größe einer neuen oder wachsenden Container-Sitzung an. | DynFileFS, DynBlk, VMDK oder Raw; Verschlüsselung ändert die Backend-Größenlogik nicht. |
| `perchcomp=CODEC` | Wählen Sie DynBlk-Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`; die Verfügbarkeit hängt weiterhin vom laufenden Kernel ab. Komprimierung ist deaktiviert, wenn LUKS DynBlk umschließt. |
| `perchreserve=MB` | Zieht beim Festlegen der Größe eines neuen oder wachsenden Containers eine Reserve ab und setzt die Warnschwelle für wenig Speicherplatz. | Lässt Arbeitsbereich beim Zuweisen eines Containers frei; dies ist kein Laufzeit-Kontingent. |
| `perch` | Verwendet das ältere Resume-Verhalten ohne automatische Ersatz-Erstellung. | Kompatibilität mit einem bestehenden benutzerdefinierten Eintrag; bevorzugen Sie `perchdir=resume` für aktuelle Menüs. |

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

## Speicherreserve und Größen

MiniOS verwendet 256 MiB als Standard-Reserverand und Warnschwelle für wenig Speicherplatz. Die Berechnung erfolgt mit 1024-Byte-Dateisystemblöcken. `perchreserve` akzeptiert eine vorzeichenlose Ganzzahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn der Wert fehlt oder ungültig ist. Die Reserve verringert den für einen neuen oder wachsenden Container angebotenen Speicherplatz. Es handelt sich nicht um ein Kontingent: Eine native Sitzung oder spätere Schreibvorgänge können den verbleibenden Dateisystemplatz weiterhin nutzen. Beim Booten wird gewarnt, wenn der aktuelle freie Speicherplatz auf oder unter der Schwelle liegt.

Container-Größen werden als ganze Werte in MiB zugewiesen:

- Eine reine Zahl, `M`, oder `MB` bedeutet MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Raw-Container sind auf 1.000.000 MiB sowie den verfügbaren Speicher nach der Reserve begrenzt. DynFileFS hat ein eigenes, RAM-abhängiges Limit und eine harte Obergrenze von 2.000.000 MiB. DynBlk erhält sein Geometrie-Limit im nativen Format von `dynblk limits --format dynblk`; MiniOS erzwingt keine separate 512-GiB-Obergrenze.
- Raw ist eine einzelne Backing-Datei, daher begrenzt FAT32 sie in MiniOS auf 4000 MiB. Das gleiche Limit gilt, wenn Raw in LUKS2 eingebettet ist.
- Eine neue Raw-Sitzung verwendet standardmäßig 4000 MiB. Die Verschlüsselung erstellt keine eigene LUKS-Größenrichtlinie: Ein verschlüsselter Raw-, DynFileFS-, DynBlk- oder VMDK-Container behält die Größenregeln seines zugrunde liegenden Backends bei.
- Eine neue, durch initrd erstellte DynFileFS-Sitzung ohne `perchsize` verwendet bis zu 16 GiB logische Kapazität. Kann der zugrunde liegende Speicher nach `perchreserve` und DynFileFS-Index-Overhead letztlich nicht so viel aufnehmen, wird der Standard auf die verfügbare Kapazität reduziert. Der Format-400-Index benötigt etwa 2 MiB RAM und etwa 2 MiB Backing-Speicher pro GiB deklarierter logischer Kapazität, selbst wenn der Payload leer ist. MiniOS begrenzt daher auch die DynFileFS-Kapazität durch physischen RAM und eine getestete harte Obergrenze von 2.000.000 MiB.
- Eine neue DynBlk-Sitzung ohne `perchsize` folgt derselben automatischen 16-GiB-Obergrenze und wird reduziert, wenn nach `perchreserve`. Die explizite DynBlk-Größe ist eine Thin-Capacity-Anforderung, die gegen das installierte Backend-Limit geprüft wird. Die Metadaten für deklarierte Teile werden initial angelegt, aber der Payload-Speicher wächst bei Bedarf. DynBlk besitzt einen begrenzten Metadaten-Cache, unabhängig von der Payload-Belegung.

Container-Wachstum ist best effort, Verkleinerung wird nicht unterstützt. `perchsize` legt keine Größe für native oder SquashFS-Sitzungen fest. Der MiniOS-Sitzungsmanager verwendet für manuell erstellte Raw- und DynFileFS-Container standardmäßig 4000 MiB und für DynBlk 16 GiB; verschlüsselte Varianten nutzen die gleichen Backend-Standards. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Speicheraktivierung

Alle erfolgreichen Backends müssen das beschreibbare Upper bereitstellen, das vom gewählten Union-Dateisystem erwartet wird. Das Einbinden eines Backends allein beweist nicht, dass Persistenz aktiv ist. Native, DynFileFS, DynBlk, VMDK und Raw können persistente Sitzungsmetadaten vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Raw, DynFileFS, DynBlk und VMDK können zusätzlich LUKS2-Verschlüsselung verwenden. Der geschützte aktuelle Boot-Status wird erst veröffentlicht, nachdem die finale Root-Union bestätigt wurde und das erwartete Upper verwendet.

| Backend | Persistente Darstellung | Kapazitätsmodell | Anforderungen an den Backing-Speicher | MiniOS LUKS2-Schicht |
|---|---|---|---|---|
| `native` | Dateien und Verzeichnisse direkt im nummerierten Sitzungsverzeichnis | Verwendet direkt den Speicherplatz des Backing-Dateisystems; `perchsize`nicht anwendbar | Beschreibbares Dateisystem, das den POSIX-Verhaltenstest besteht | Nein |
| `dynfilefs` | Format-400 `changes.dat` plus Segmentdateien, die ein ext4 bereitstellen `virtual.dat` | Schlankes Payload mit einem dichten, kapazitätsgroßen Index | Beschreibbarer POSIX-, FAT32-, NTFS- oder exFAT-Speicher | Ja |
| `dynblk` | Format-1 `volumeNNN.db` Dateien, die `/dev/dynblkN` bereitstellen, mit ext4 darüber | Schlankes virtuelles Blockgerät mit festplattenbasierten Zuordnungen und begrenztem Cache | Dateisystem, das vom DynBlk-Kernel-Backend akzeptiert wird, sowie ausreichende Backend-Ressourcen | Ja |
| `raw` | Einzelne Datei fester Größe `changes.img` mit ext4-Inhalt | Datei wird mit der gewünschten logischen Größe erstellt; nur Wachstum möglich | Beschreibbares Dateisystem, das das Abbild aufnehmen kann; FAT32 ist auf 4000 MiB begrenzt | Ja |
| `squashfs` | Komprimiertes `changes.sb`-Snapshot; beschreibbares Laufzeit-Upper wird in RAM rekonstruiert | Snapshot-Größe entspricht den erfassten Änderungen; `perchsize`nicht anwendbar | Vorhandene Snapshots können von unterstützten beschreibbaren Medien gelesen werden; exaktes Speichern erfordert einen passenden POSIX-fähigen Persistenzspeicher | Nein |

### Nativ

Im nativen Modus werden die beschreibbaren Union-Inhalte direkt im nummerierten Sitzungsverzeichnis gespeichert. Es gibt kein internes Abbild, kein Loop-Device, keinen FUSE-Container und kein separates Block-Dateisystem, daher richtet sich die Kapazität einfach nach dem freien Speicherplatz auf dem zugrunde liegenden Dateisystem und `perchsize` ist nicht relevant. Dies verursacht den geringsten Overhead und erhält die normale Dateisichtbarkeit für Wiederherstellung und Backup.

MiniOS schließt zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS aus. Anschließend prüft es das tatsächliche Verhalten des Dateisystems, indem eine Datei und ein Symlink erstellt und Änderungen an den Ausführungsrechten getestet werden. Ist die Prüfung erfolgreich, wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich eingebunden. Ist das Dateisystem als ungeeignet bekannt oder schlägt die POSIX-Prüfung fehl, wechselt der native Modus auf DynFileFS zurück. Ein Fehler nach der Aktivierung des nativen Modus wird rückgängig gemacht; ein neuer, leerer Kandidat wird entfernt, sobald dies sicher möglich ist.

Die MiniOS LUKS2-Persistenzschicht umschließt den nativen Modus nicht, da es im nativen Modus keine Container- oder Block-Device-Grenze zum Verschlüsseln gibt. Native Persistenz kann sich dennoch auf einem außerhalb dieser Persistenzschicht verschlüsselten Speicher befinden.

### DynFileFS

DynFileFS ist das FUSE-basierte format-400-Container-Backend. Es stellt ein logisches`virtual.dat` Image bereit und speichert die Daten in`changes.dat` plus nummerierten Segmentdateien. Der Helper muss erfolgreich einbinden und`virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, anstatt versehentlich eine Datei nur für RAM mit einem persistent wirkenden Namen zu erzeugen.

Der Mapping-Index ist in Bezug auf die deklarierte logische Kapazität dicht: Jeder logische 4-KiB-Block hat einen 8-Byte-Offset. Das entspricht etwa 2 MiB Index-RAM pro GiB virtueller Kapazität, und ungefähr die gleiche Menge wird in den zugehörigen Segmentindizes gespeichert, noch bevor Nutzdaten geschrieben werden. Die Zuweisung der Nutzdaten bleibt dabei dynamisch. Da das statische initrd-Binary i686 ist, setzt MiniOS außerdem ein RAM-bewusstes logisches Größenlimit sowie eine harte Obergrenze von 2.000.000 MiB unterhalb des getesteten Adressraum-Fehlerpunkts.

Das logische Image enthält ext4. Vor dem beschreibbaren Einbinden werden bestehende Images überprüft; Ergebnisse der Dateisystemprüfung, die über den Status "korrigierte Fehler" hinausgehen, führen dazu, dass die Sitzung abgelehnt und nicht beschreibbar eingebunden wird. Eine Größenänderung ist nur als Vergrößerung möglich, und das interne ext4-Dateisystem wird, wenn möglich, erweitert. Für eine Diagnose aus Anwendersicht siehe[Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Der `dynblk`-Modus verwendet ein Kernel-Blockgerät, getrennt von DynFileFS. Jede nummerierte Sitzung besitzt `volume000.db` und alle ihre nummerierten Geschwister (`volume001.db`, ..., `volume1000.db`, und darüber hinaus). Das native Layout ist `DBSPRS01`, Plattenformat **1**. Nicht unterstützte Layouts werden abgelehnt, statt stillschweigend konvertiert zu werden. Halten Sie die installierte CLI- und Modulversion übereinstimmend.

MiniOS erstellt ext4 auf der gesamten Platte, die von `/dev/dynblk-control` zurückgegeben wird, z. B. `/dev/dynblk3`; es wird nicht angenommen, dass `dynblk0` frei ist. Bestehendes ext4 wird vor beschreibbarer Nutzung geprüft. Der geschützte Boot-Status protokolliert genau dieses Gerät, sodass es beim Herunterfahren erst getrennt wird, nachdem alle Nutzer und das Upper-Dateisystem geschlossen wurden. Mehrere unabhängige Geräte können parallel existieren.

Sitzungsmanager, Installer und initramfs fragen `dynblk limits --format dynblk` nach dem Geometrie-Limit des installierten Backends ab. Der aktuelle Ressourcenwächter erlaubt 65536 Teile: Standard-1-GiB-Logikbereiche ermöglichen bis zu 64 TiB. Kleinere physische Teilgrenzen reduzieren das virtuelle Limit. Dies ist eine Geometrie-Obergrenze, kein Versprechen, dass der Host so viele Dateien öffnen kann oder genug RAM/Speicherplatz hat. Wachstum wird unterstützt; Verkleinerung nicht.

Die Mapping-Tabellen liegen auf der Platte. `--map-memory-mb` steuert einen pro Gerät vorhandenen Metadaten-Cache (Standard 1 MiB, Bereich 1..64 MiB), nicht mehr als Prozentsatz von RAM oder als Limit für gemappte Daten. Bereichsbeschreibungen, Open-File-Vektoren und kleine Verzeichnisse wachsen mit deklarierter Geometrie, nicht mit Payload-Belegung. Beim Anhängen werden Mapping-Metadaten gescannt und der Allokationsstatus temporär Teil für Teil neu aufgebaut; es werden nicht alle Payloads gelesen. Ein vollständiges `dynblk check` liest die Payloads. `engine_memory_bytes` schließt den Dateisystem-Page-Cache, Codec-Interna und andere Kernel-Allokationen aus.

Metadaten-Dateien für alle deklarierten Teile werden beim Erstellen/Wachsen initialisiert; tatsächliche Daten bleiben dünn. Teile sind auf 4000 MiB begrenzt. Sichern Sie den kompletten abgetrennten Namensraum, ohne von dreistelligen Zahlen oder einem festen Endteil auszugehen. Ein neues Volume kann Komprimierung mit `perchcomp` wählen; spätere Ladevorgänge nutzen den gespeicherten Codec. LUKS2 über DynBlk erzwingt Komprimierung auf `none`. Teilweise Schreibvorgänge auf komprimierte Daten recomprimieren derzeit das entsprechende 64-KiB-Fragment. Speicher- oder Ressourcenerschöpfung kann weiterhin zu Schreibfehlern führen; das Upper-Dateisystem muss vor dem Trennen ausgehängt werden.

### VMDK-Sitzungen

Der `vmdk`-Sitzungsmodus verwendet denselben Treiber mit echten `twoGbMaxExtentSparse`
Images. Das Primäre ist `volume.vmdk`, mit `volume-s001.vmdk` und nachfolgenden
Teilen; jeder Teil umfasst bis zu 2 GiB logischen Speicherplatz. Der Deskriptor ist auf weniger als 1 MiB begrenzt, daher schränken Dateinamenlänge und Extent-Anzahl die Kapazität ein.
Session Manager, Installer und initramfs fragen 
 ab.`dynblk limits --format vmdk`.
Der Native-Modus verwendet weiterhin `volume000.db`; keiner der Modi interpretiert die Dateien des anderen neu.
Verwaltete Sitzungen importieren keine beliebig extern partitionierte VMDK
als Sitzungsmetadaten.

VMDK-Sitzungsunterstützung wird von `vmdk-session-v1` in
`/etc/minios-initramfs-dynblk` im initrd angezeigt. Die aktuelle Laufzeit und jedes
vom Installer kopierte Quell-initrd müssen dies unterstützen. VMDK bietet keine native Komprimierung;
`perchcomp` wird beim Booten mit einer Warnung ignoriert und der Session Manager lehnt einen
nicht-`none`-VMDK-Codec ab. LUKS bleibt eine optionale, separate Schicht. Beide Modi veröffentlichen
ihren tatsächlichen Sitzungsmodus und das zugehörige `dynblk_device` im geschützten Boot-Status,
und beide Shutdown-Implementierungen schließen dieses Gerät, nachdem alle Nutzer beendet sind.

Beide Treiberformate unterstützen `writeback`, `writethrough`, `none`, `directsync` und explizite `unsafe`Anbindungsrichtlinien. Direkte Modi erfordern derzeit ext2/ext4 als Basis. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` bindet ein bestehendes Dateisystem ein; `umount` gibt das vom Helper verwaltete Gerät nach dem letzten Nutzer frei. Manuelles `dynblk load` hat eine explizite Lebensdauer. Dies erstellt kein Dateisystem und entsperrt auch kein LUKS.

### Raw

Im Raw-Modus wird eine `changes.img`-Datei mit ext4 verwendet. Die Dateigröße wird bei der Erstellung auf die gewünschte logische Kapazität festgelegt. Im Gegensatz zu den dynamischen Backends bleibt die Kapazität daher unverändert, bis sie explizit vergrößert wird. Das darunterliegende Dateisystem kann nicht beschriebene Bereiche zwar spärlich anlegen, aber MiniOS behandelt Raw trotzdem als Speicher mit fester Kapazität und prüft vor dem Erstellen oder Vergrößern, ob ausreichend Speicherplatz vorhanden ist. Da sich alles in einer Host-Datei befindet, ist FAT32 auf 4000 MiB begrenzt.

Vor dem schreibbaren Einbinden werden bestehende Raw-Images mit `e2fsck` überprüft. Beim Vergrößern wird zunächst `changes.img` erweitert und anschließend ext4 mit `resize2fs` vergrößert; Verkleinern wird nicht unterstützt. Bei einer fehlgeschlagenen Prüfung oder Einbindung bleibt das Image zur Wiederherstellung erhalten, und der Bootvorgang wird in RAM fortgesetzt. Raw benötigt keinen FUSE-Daemon und keine eigenen Blockspeicher-Metadaten, was das Wiederherstellungsmodell einfach macht, aber die Thin-Capacity-Funktionalität von DynFileFS und DynBlk fehlt.

### LUKS-Verschlüsselungsschicht

LUKS2 ist eine optionale Verschlüsselungsschicht, die mit `perchencrypt=luks` beim Erstellen einer Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzung ausgewählt wird. Bestehende Sitzungen übernehmen ihren Verschlüsselungsstatus aus den Sitzungsmetadaten; eine spätere Angabe von `perchencrypt` ändert oder konvertiert eine bestehende Klartext-Sitzung nicht.

Die Verschlüsselungsgrenze hängt vom Backend ab: Raw bindet `changes.img` über ein Loop-Gerät ein und platziert LUKS2 innerhalb dieser Datei; DynFileFS bindet das bereitgestellte `virtual.dat` über ein Loop-Gerät ein und verschlüsselt dieses logische Abbild; DynBlk verwendet das `/dev/dynblkN` Blockgerät direkt als LUKS2-Quelle. In allen drei Fällen erstellt MiniOS ext4 innerhalb von `/dev/mapper/...`, sodass die Dateisysteminhalte und Metadaten innerhalb des Mappers im Ruhezustand verschlüsselt sind. Backend-Metadaten außerhalb der LUKS-Grenze, Boot-Dateien, Sitzungsmetadaten und andere Dateien auf dem Persistenzmedium bleiben unverschlüsselt.

Größenvorgaben, Wachstumslimits, FAT32-Einschränkungen und Thin/Fixed-Allocation-Verhalten bleiben weiterhin beim zugrunde liegenden Backend. Das initrd authentifiziert vor dem Vergrößern eines bestehenden verschlüsselten Backends, schließt den Mapper vor dem Backend-Wachstum, öffnet ihn dann erneut, prüft ext4 und erweitert das Dateisystem vor dem Mounten. Für verschlüsselte DynBlk wird die Backend-Komprimierung auf `none` erzwungen.

Bei der Erstellung wird das Passwort zweimal abgefragt. Bestehende verschlüsselte Sitzungen erlauben drei Entsperrversuche an der Boot-Konsole. Drei abgelehnte Passwörter führen zu einem fatalen Boot-Pfad: MiniOS fährt in RAM nicht fort, interpretiert die Sitzung nicht als Klartext, wählt kein anderes Backend und erstellt keinen Ersatz. Andere Fehler beim Erstellen, Prüfen, Vergrößern oder Mounten behalten ihr backend-spezifisches Wiederherstellungsverhalten ohne Klartext-Fallback bei. Passwörter werden weder in Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben. Logische Exporte enthalten entschlüsselte Sitzungsdateien und kein verschlüsseltes Backend-Abbild.

Siehe [Sicherheit](/maintenance-and-recovery/Security) für die Schutzgrenze und Hinweise zur Datensicherung.

### SquashFS

Das Initrd aktiviert normalerweise eine bestehende SquashFS-Sitzung. Die interaktive Einrichtung erzeugt Generation-Null-Metadaten mit aktiviertem Speichern beim Herunterfahren, erstellt jedoch kein`changes.sb`; die beschreibbare Upper-Schicht existiert nur in RAM, bis das laufende System das erste Mal auf Anforderung oder beim Herunterfahren speichert. Eine Generation-Null-Sitzung ist nur dann gültig, wenn Snapshot-Artefaktfelder und`changes.sb`nicht vorhanden sind. Bei späteren Generationen validiert die Aktivierung strikte, eindeutig gesetzte Metadaten für den Snapshot, einschließlich dessen Digest, komprimierter und unkomprimierter Größe, Eintragsanzahl, Union-Typ und Speicherstrategie. Es werden außerdem Dateityp und exakte Größe, verfügbarer RAM und Swap, der SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität geprüft.

Der Snapshot wird mit strikter Fehler- und xattr-Behandlung in ein begrenztes, temporäres ext4-Abbild in RAM extrahiert. Für OverlayFS enthält dieses Abbild separate`changes`und`workdir`Verzeichnisse; bei AUFS ist dessen Root der beschreibbare Zweig.
Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Strategie führen dazu, dass die Aktivierung fehlschlägt und der Bootvorgang auf das gewöhnliche RAM-Upper zurückfällt.

Eine Sitzung mit dem Status`dirty`bedeutet, dass der vorherige Bootvorgang den sauberen Herunterfahrens-Übergang nicht abgeschlossen hat. SquashFS warnt dann und stellt den zuletzt erfolgreich gespeicherten`changes.sb`wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Bootvorgang gelten nicht als weitere Rollback-Generation.

Der MiniOS-Sitzungsmanager und das System-Speicher-Backend erstellen und ersetzen SquashFS-Snapshots atomar mittels exakter Erfassung. Die Boot-Aktivierung kann einen bestehenden Snapshot von beschreibbarem FAT-, exFAT- oder NTFS-Speicher lesen, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben dateisystemabhängig: Der Sitzungspeicher muss die Erstellung eines privaten Arbeitsbereichs, Linux-Metadaten und die dauerhafte Veröffentlichung auf einem geeigneten POSIX-Dateisystem unterstützen.

Beim Speichern erfasst das Backend zuerst einen stabilen Dateibaum im privaten, root-eigenen Speicher, sofern das Initrd ein vertrauenswürdiges tmpfs mit ausreichendem Platz bereitstellt. Ist RAM nicht ausreichend, wird stattdessen der vorherige Festplattenarbeitsbereich genutzt. Der Kompressor schreibt direkt in ein privates Verzeichnis mit Modus 0700 auf dem Sitzungsdateisystem, nicht in ein zusätzliches RAM-Abbild mit anschließendem Kopiervorgang. MiniOS prüft das komprimierte Ergebnis und dessen Identität, synchronisiert es, verschiebt es auf einen privaten Kandidatennamen und validiert diesen erneut, bevor der aktive`changes.sb`atomar ersetzt wird. Fehlgeschlagene Kopien oder Komprimierungen ersetzen nicht den letzten erfolgreichen Snapshot.

Bei einer intakten, dauerhaften Sitzung werden`/var/log/minios`und`/var/log/live`per Bind-Mount aus`boot-logs/`im nummerierten Sitzungsverzeichnis bereitgestellt. Diese Startdiagnosen werden daher unabhängig vom RAM-Upper und dem Herunterfahrens-Snapshot geschrieben. Ein Boot, dessen Persistenzspeicher nicht dauerhaft aktiviert wurde, kann nicht garantieren, dass diese Protokolle einen Neustart überstehen. Gewöhnliche Logs und Caches können separat konfiguriert werden; siehe[Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS hat keine`perchsize`: Die gespeicherte Größe entspricht den komprimierten erfassten Änderungen, während der Laufzeitspeicher durch das extrahierte beschreibbare Upper bestimmt wird. Die MiniOS-LUKS-Persistenzschicht verschlüsselt nicht`changes.sb`; falls Vertraulichkeit für Snapshots erforderlich ist, muss der zugrundeliegende Speicher außerhalb dieser Schicht verschlüsselt werden. Siehe[Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

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

## Sitzungsbezogene Speicherbereinigung

`minios-session reclaim ID` arbeitet mit beiden Blockformaten. Für Klartext-
Sitzungen meldet es freie ext4-Bereiche mit FITRIM und ruft dann `dynblk reclaim`.
Bei einer aktiven Sitzung ist das Gerät an den geschützten Current-Boot-Status gebunden und
das tatsächliche ext4-Mount wird geprüft; das Union-Root wird nie direkt getrimmt.
Inaktive Sitzungen werden für diesen Vorgang temporär eingebunden und gemountet.

Weder beim Booten noch beim Herunterfahren wird die Kompaktierung automatisch ausgeführt. `--compact` ist eine
explizite Benutzerentscheidung in der CLI oder der nicht aktivierten Option im Sitzungsmanager-Dialog.
Ohne diese Option werden nur Hole Punching (wo unterstützt) und das Kürzen des freien Endes durchgeführt.
Die LUKS-Discard-Policy wird durch den Sitzungsbefehl nicht geändert.
