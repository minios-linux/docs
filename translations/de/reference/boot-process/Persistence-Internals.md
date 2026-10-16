---
updated: 2026-10-15
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

Das initrd aktiviert die Persistenzverwaltung nur, wenn auf der Kernel-Befehlszeile einer der folgenden anerkannten Tokens vorhanden ist:

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
| `perch` | Versucht, den Standardwert aus den Metadaten wiederherzustellen. Erstellt keine Sitzung automatisch, wenn keine nutzbar ist oder Kompatibilitätsprüfungen fehlschlagen. |
| `perchdir=resume` | Versucht den Standardwert aus den Metadaten und kann bei Bedarf automatisch einen neuen kompatiblen Ersatz anlegen. Dies entspricht dem aktuellen Resume-Verhalten im Boot-Menü. |
| `perchdir=setup` | Öffnet zuerst den Backend-Auswahldialog, speichert die gewählte Backend-/Verschlüsselungs-/Komprimierungsoption und folgt dann dem Pfad zur Neuanlage einer Sitzung. |
| `perchdir=new` | Legt ein Verzeichnis mit einer numerischen ID an, die um eins höher ist als die höchste vorhandene numerische ID. Es wird nie ein bestehendes Verzeichnis wiederverwendet und der Backend-Auswahldialog wird nicht geöffnet. |
| `perchdir=ask` | Bietet vorhandene Sitzungen an, sofern vorhanden; eine inkompatible Sitzung erfordert eine Bestätigung. Gibt es keinen Standard oder keine Sitzung im Speicher, wird zu `setup` gewechselt, sodass die erste Sitzung interaktiv erstellt werden kann. |
| `perchdir=NUMBER` | Verwendet dieses Verzeichnis, wenn es existiert. Ist es nicht vorhanden, kann auf den in den Metadaten gespeicherten Standard zurückgegriffen werden; die gewünschte Nummer wird nicht reserviert. |

Andere anerkannte Persistenzparameter ohne Selektor führen denselben Legacy-Resume-Pfad wie ein reines `perch`: Sie fordern Persistenz an, ermöglichen aber keine automatische Erstellung. `perchtoram` allein ist keine Persistenzanforderung. Wenn Auswahl oder Aktivierung kein verwendbares Upper erzeugen kann, wird der Bootvorgang mit dem RAM Upper wie gewohnt fortgesetzt und eine Fehlermeldung ausgegeben.

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

Die Sitzungsmetadaten erfassen den Speicher-Modus und können die MiniOS-Version, Edition, das Union-Dateisystem und die Containergröße speichern. Beim Wiederherstellen werden der gespeicherte Modus, die Version, Edition und das Union-Dateisystem mit dem angeforderten Modus und dem aktuellen System verglichen.
Fehlende Kompatibilitätsfelder aus älteren Versionen werden nicht als Abweichungen behandelt.

Wird "`perchdir=resume`" verwendet, wird eine neue nummerierte Sitzung erstellt, wenn der Standard fehlt oder wenn ein gespeicherter Modus, eine Version, Edition oder ein Union-Dateisystem nicht mit den Anforderungen übereinstimmt und der Standard dadurch ungeeignet ist. Einfache "`perch`", eine direkte numerische Auswahl und andere ältere Wiederherstellungsanfragen lehnen einen automatischen Ersatz ab und verbleiben nach einem Auswahlfehler in RAM.`perchdir=ask`" zeigt Kompatibilitätsinformationen an und ermöglicht eine explizite Überschreibung. Eine neue Sitzung verwendet standardmäßig "`native`", sofern kein anderer Modus angefordert wurde.

Der Speicher-Modus ist Teil der Kompatibilität. Wenn die Auswahl bis zur Backend-Weiterleitung reicht, wird bei einem unbekannten angeforderten Modus auf "`native`" zurückgegriffen, dessen Erkennung bei ungeeignetem Speicher DynBlk oder DynFileFS wählen kann. Eine bestehende Sitzung mit einem anderen gespeicherten Modus kann bereits bei der vorherigen Kompatibilitätsprüfung fehlschlagen; eine ältere Wiederherstellungsanfrage läuft dann in RAM weiter, anstatt auf dieses Fallback zuzugreifen.

### Zurücksetzen einer inkompatiblen Sitzung

Die interaktive Auswahl bietet **Zurücksetzen, Einstellungen behalten** und **Zurücksetzen, Daten behalten** zusätzlich zur Rückkehr zur Liste oder dem expliziten Fortfahren ohne Zurücksetzen. Das Zurücksetzen erfolgt vor der Aktivierung der Union. Dabei werden System-Programm-/Bibliotheksverzeichnisse, der Systemzustand des Paketmanagers, systemweite Flatpak/Snap-Software und Caches entfernt. Paketdateilisten helfen, installierte Software an anderen Orten zu erkennen; nicht gelistete Dateien werden vorsichtshalber beibehalten.

Beide Modi behalten `/home` und `/root`, einschließlich versteckter Konfigurationen, Caches, Browser-Profile und im Home-Verzeichnis installierter Programme. Auch Konten, UID/GID-Zuordnungen, Passwörter, SSH-Hostschlüssel, private TLS-Schlüssel und außerhalb der Home-Verzeichnisse gespeicherte Daten bleiben erhalten. Der Modus zum Beibehalten der Einstellungen bewahrt die üblichen `/etc` und Paketkonfigurationen; der Nur-Daten-Modus setzt diese Systemeinstellungen zurück, behält jedoch persönliche Konfigurationen im Home-Verzeichnis. Dies erkennt nicht jedes manuell an beliebigen Orten installierte Programm.

Ein Ersatz-Upper wird neben dem Original vorbereitet, wofür ausreichend freier Speicherplatz für eine zweite Kopie der beibehaltenen Daten erforderlich ist. Bei fehlgeschlagenem Kopieren oder Ersetzen erfolgt ein Rollback; unterbrochene Transaktionen werden beim nächsten Mount-Vorgang wiederhergestellt. SquashFS-Zurücksetzen verändert nur das rekonstruierte RAM-Upper: Der alte Snapshot und die Kompatibilitätsmetadaten bleiben maßgeblich, bis das Zurücksetzen des Uppers erfolgreich gespeichert wurde. Ein nativer Sitzungs-Reset deaktiviert `perchtoram` für diesen Bootvorgang, um zu vermeiden, dass beibehaltene Daten durch einen leeren RAM-Container ersetzt werden. Ein automatisches Fortsetzen setzt eine Sitzung niemals stillschweigend zurück.

## Reserven und Größen für Speicherbereiche

MiniOS verwendet standardmäßig 256 MiB als Allokationspuffer und Warnschwelle für geringen Speicherplatz. Die Berechnung basiert auf 1024-Byte-Dateisystemblöcken. `perchreserve` akzeptiert eine positive ganze Zahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn kein Wert oder ein ungültiger Wert angegeben wird. Der Puffer verringert den Speicherplatz, der einem neuen oder wachsenden Container angeboten wird. Es handelt sich nicht um ein Quota: Eine native Sitzung oder spätere Schreibvorgänge können den verbleibenden Speicherplatz weiterhin nutzen. Beim Start erfolgt eine Warnung, wenn der aktuelle freie Speicherplatz die Schwelle erreicht oder unterschreitet.

Containergrößen werden als ganze Zahlen in MiB zugewiesen:

- Eine reine Zahl, `M`, oder `MB` steht für MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Roh-Container sind auf 1.000.000 MiB und durch den verfügbaren Speicher nach Abzug der Reserve begrenzt. DynFileFS hat ein separates, RAM-abhängiges Limit und eine feste Obergrenze von 2.000.000 MiB. DynBlk erhält sein Geometrie-Limit im nativen Format von `dynblk limits --format dynblk`; MiniOS setzt keine separate 512-GiB-Obergrenze.
- Raw ist eine einzelne Backing-Datei, daher begrenzt FAT32 sie in MiniOS auf 4000 MiB. Das gleiche Limit gilt, wenn Raw in LUKS2 eingebettet ist.
- Eine neue Raw-Sitzung verwendet standardmäßig 4000 MiB. Die Verschlüsselung legt keine eigene LUKS-Größenrichtlinie fest: Ein verschlüsselter Raw-, DynFileFS-, DynBlk- oder VMDK-Container behält die Größenregeln seines zugrundeliegenden Backends bei.
- Eine neue, durch initrd erstellte DynFileFS-Sitzung ohne `perchsize` nutzt bis zu 16 GiB logische Kapazität. Falls das Backing-Storage nach `perchreserve` und DynFileFS-Index-Overhead letztlich nicht so viel aufnehmen kann, wird der Standardwert auf die verfügbare Kapazität reduziert. Der Format-400-Index benötigt etwa 2 MiB RAM und etwa 2 MiB Backing-Speicher pro GiB deklarierter logischer Kapazität, selbst wenn die Nutzdaten noch leer sind. MiniOS begrenzt daher die DynFileFS-Kapazität zusätzlich durch den physischen RAM und eine getestete Obergrenze von 2.000.000 MiB.
- Eine neue DynBlk-Sitzung ohne `perchsize` folgt ebenfalls der automatischen Obergrenze von 16 GiB, die reduziert wird, wenn nach `perchreserve`. Eine explizite DynBlk-Größe ist eine Thin-Capacity-Anforderung, die gegen das installierte Backend-Limit geprüft wird. Metadaten für deklarierte Teile werden initial angelegt, aber der Nutzdatenspeicher wächst nach Bedarf. DynBlk verwaltet einen begrenzten Metadatencache, unabhängig vom Nutzdatenfüllstand.

Das Vergrößern von Containern erfolgt nach dem Best-Effort-Prinzip; Verkleinerungen werden nicht unterstützt. `perchsize` legt keine Größe für native oder SquashFS-Sitzungen fest. Der MiniOS-Sitzungsmanager setzt manuell erstellte Raw- und DynFileFS-Container standardmäßig auf 4000 MiB und DynBlk/VMDK-Container auf 16 GiB; verschlüsselte Varianten übernehmen die gleichen Backend-Standards. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Speicheraktivierung

Alle erfolgreichen Backends müssen das beschreibbare Upper bereitstellen, das vom ausgewählten Union-Dateisystem erwartet wird. Das Einbinden eines Backends allein beweist nicht, dass Persistenz aktiv ist. Native, DynFileFS, DynBlk, VMDK und Raw können persistente Sitzungsmetadaten vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Raw, DynFileFS, DynBlk und VMDK können zusätzlich LUKS2-Verschlüsselung nutzen. Der geschützte Current-Boot-Status wird erst veröffentlicht, nachdem bestätigt wurde, dass das finale Root-Union das erwartete Upper verwendet.

| Backend | Persistente Darstellung | Kapazitätsmodell | Anforderungen an das Backing-Storage | MiniOS LUKS2-Schicht |
|---|---|---|---|---|
| `native` | Dateien und Verzeichnisse direkt im nummerierten Sitzungsverzeichnis | Verwendet direkt den Speicherplatz des Backing-Dateisystems; `perchsize`nicht zutreffend | Beschreibbares Dateisystem, das den POSIX-Kompatibilitätstest besteht | Nein |
| `dynfilefs` | Format-400 `changes.dat`plus Segmentdateien, die ein ext4 bereitstellen `virtual.dat` | Schlankes Nutzlastformat mit einem dichten, kapazitätsgroßen Index | Beschreibbarer POSIX-, FAT32-, NTFS- oder exFAT-Speicher | Ja |
| `dynblk` | Format-1 `volumeNNN.db`Dateien, die `/dev/dynblkN`bereitstellen, mit ext4 darüber | Schlankes virtuelles Blockgerät mit festplattenbasierten Zuordnungen und begrenztem Cache | Dateisystem, das vom DynBlk Kernel-Backend akzeptiert wird, sowie ausreichende Backend-Ressourcen | Ja |
| `vmdk` | `volume.vmdk`plus gesplittete Sparse-`volume-sNNN.vmdk`-Extents, bereitgestellt durch den DynBlk-Treiber, mit ext4 darüber | Schlankes, gesplittetes Sparse-Blockgerät | Dateisystem, das vom DynBlk VMDK-Backend akzeptiert wird, und die `vmdk-session-v1`Fähigkeit | Ja |
| `raw` | Einzelne Datei fester Größe `changes.img`mit ext4-Inhalt | Datei wird mit der gewünschten logischen Größe erstellt; nur Wachstum möglich | Beschreibbares Dateisystem, das das Abbild aufnehmen kann; FAT32 ist auf 4000 MiB begrenzt | Ja |
| `squashfs` | Komprimierter `changes.sb`Snapshot; beschreibbares Runtime-Upper wird in RAM rekonstruiert | Snapshot-Größe folgt den erfassten Änderungen; `perchsize`nicht zutreffend | Vorhandene Snapshots können von unterstützten beschreibbaren Medien gelesen werden; exaktes Speichern erfordert einen geeigneten, POSIX-fähigen Persistenzspeicher | Nein |

### Nativ

Im nativen Modus werden die beschreibbaren Union-Inhalte direkt im nummerierten Sitzungsverzeichnis gespeichert. Es gibt kein internes Abbild, kein Loop-Device, keinen FUSE-Container und kein separates Block-Dateisystem, sodass die Kapazität einfach dem freien Speicherplatz des zugrunde liegenden Dateisystems folgt und `perchsize` nicht zutrifft. Dies verursacht den geringsten Overhead und erhält die normale Dateisichtbarkeit für Wiederherstellung und Backup.

MiniOS schließt zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS aus. Anschließend wird das tatsächliche Verhalten des Dateisystems geprüft, indem eine Datei und ein Symlink erstellt und Änderungen des Ausführungsmodus getestet werden. Bei erfolgreicher Prüfung wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich eingebunden. Bei ungeeignetem Speicher oder fehlgeschlagener Prüfung bevorzugt die native Erstellung DynBlk, sofern dessen CLI vorhanden ist und Secure Boot dies zulässt, andernfalls DynFileFS. Dieser erste Fallback garantiert nicht, dass der ausgewählte Treiber angebunden werden kann oder dass jedes zugrunde liegende Dateisystem unterstützt wird. Ein Fehler nach der nativen Aktivierung wird rückgängig gemacht; ein neuer, leerer Kandidat wird entfernt, wenn dies sicher möglich ist.

Die MiniOS LUKS2-Persistenzschicht umschließt den nativen Modus nicht, da es im nativen Modus keine Container- oder Blockgerätgrenze zum Verschlüsseln gibt. Native Persistenz kann jedoch weiterhin auf extern verschlüsseltem Speicher liegen, der außerhalb dieser Persistenzschicht verschlüsselt ist.

### DynFileFS

DynFileFS ist das FUSE-basierte format-400 Container-Backend. Es stellt ein logisches`virtual.dat` Image bereit, während die Daten in`changes.dat` plus nummerierten Segmentdateien gespeichert werden. Der Helper muss erfolgreich eingehängt werden und`virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, anstatt versehentlich eine reine RAM-Datei mit einem persistent wirkenden Namen zu erzeugen.

Der Mapping-Index ist in Bezug auf die deklarierte logische Kapazität dicht: Jeder 4-KiB-Logikblock besitzt einen 8-Byte-Offset. Das entspricht etwa 2 MiB Index-RAM pro GiB virtueller Kapazität, und ungefähr die gleiche Menge wird in den zugrunde liegenden Segmentindizes gespeichert, noch bevor Nutzdaten geschrieben werden. Die Zuweisung der Nutzdaten bleibt dabei dynamisch. Da das statische initrd-Binary i686 ist, setzt MiniOS außerdem ein RAM-bewusstes Logikgrößen-Limit sowie eine feste Obergrenze von 2.000.000 MiB unterhalb des getesteten Adressraum-Fehlerpunkts.

Das logische Image enthält ext4. Vor dem schreibbaren Einhängen werden vorhandene Images überprüft; Dateisystem-Checks mit einem Status über "korrigierte Fehler" lehnen die Sitzung ab, anstatt sie schreibbar einzuhängen. Die Größenänderung ist nur wachstumsorientiert, und das interne ext4-Dateisystem wird, wenn möglich, erweitert. Für benutzerorientierte Diagnosen siehe[Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Der `dynblk`-Modus verwendet ein Kernel-Blockgerät, das von DynFileFS getrennt ist. Jede nummerierte Sitzung besitzt `volume000.db` und alle ihre nummerierten Geschwister (`volume001.db`, ..., `volume1000.db`, usw.). Das native Layout ist `DBSPRS01`, Festplattenformat **1**. Nicht unterstützte Layouts werden abgelehnt und nicht stillschweigend konvertiert. Stellen Sie sicher, dass die installierten CLI- und Modulversionen übereinstimmen.

MiniOS erstellt ext4 auf der gesamten Festplatte, die von `/dev/dynblk-control` zurückgegeben wird, zum Beispiel `/dev/dynblk3`; es wird nicht davon ausgegangen, dass `dynblk0` frei ist. Vor dem beschreibbaren Zugriff wird ein vorhandenes ext4 geprüft. Ein geschützter Boot-Status protokolliert genau dieses Gerät, sodass es beim Herunterfahren erst getrennt wird, nachdem alle Nutzer und das übergeordnete Dateisystem geschlossen wurden. Mehrere unabhängige Geräte können gleichzeitig existieren.

Session Manager, Installer und Initramfs fragen `dynblk limits --format dynblk` nach dem Geometrie-Limit des installierten Backends ab. Der aktuelle Ressourcenwächter erlaubt 65536 Teile: Standard-1-GiB-Logikbereiche ermöglichen bis zu 64 TiB. Kleinere physische Teile begrenzen das virtuelle Maximum entsprechend. Dies ist eine Geometrie-Obergrenze, kein Versprechen, dass der Host so viele Dateien gleichzeitig öffnen kann oder über genügend RAM/Speicherplatz verfügt. Wachstum wird unterstützt; Verkleinerung nicht.

Die Zuordnungstabellen werden auf der Festplatte gespeichert. `--map-memory-mb` steuert einen gerätespezifischen Metadaten-Cache (Standard 1 MiB, Bereich 1..64 MiB), nicht mehr als Prozentsatz von RAM oder als Grenze für gemappte Daten. Bereichsbeschreibungen, offene Dateivektoren und kleine Verzeichnisse wachsen mit der deklarierten Geometrie, nicht mit der Nutzdatenmenge. Beim Anhängen werden die Mapping-Metadaten gescannt und der Allokationsstatus temporär Teil für Teil wiederhergestellt; es werden nicht alle Nutzdaten gelesen. Ein vollständiges `dynblk check` liest die Nutzdaten. `engine_memory_bytes` schließt den Page-Cache des Dateisystems, Codec-Interna und andere Kernel-Allokationen aus.

Metadaten-Dateien für alle deklarierten Teile werden beim Erstellen/Erweitern initialisiert; die eigentlichen Daten bleiben dünn belegt. Teile sind auf 4000 MiB begrenzt. Sichern Sie den kompletten abgetrennten Namensraum, ohne von dreistelligen Nummern oder einem festen letzten Teil auszugehen. Ein neues Volume kann bei der Erstellung Komprimierung mit `perchcomp` auswählen; spätere Ladevorgänge verwenden den gespeicherten Codec. LUKS2 oberhalb von DynBlk erzwingt Komprimierung auf `none`. Teilweise Schreibvorgänge auf komprimierte Daten führen derzeit zur Neukomprimierung des jeweiligen 64-KiB-Blocks. Speicher- oder Ressourcenerschöpfung kann weiterhin Schreibvorgänge fehlschlagen lassen; das übergeordnete Dateisystem muss vor dem Trennen ausgehängt werden.

### VMDK-Sitzungen

Der `vmdk`-Sitzungsmodus verwendet denselben Treiber wie bei echten `twoGbMaxExtentSparse`
Images. Das Hauptmerkmal ist `volume.vmdk`, mit `volume-s001.vmdk` und nachfolgenden
Teilen; jeder Teil umfasst bis zu 2 GiB logischen Speicherplatz. Der Deskriptor ist auf weniger als 1 MiB begrenzt, daher beschränken Dateinamenlänge und Anzahl der Extents die Kapazität.
auf weniger als 1 MiB, sodass die Länge des Dateinamens und die Anzahl der Extents die Kapazität einschränken.
Session Manager, Installer und initramfs fragen `dynblk limits --format vmdk`ab.
Das native DynBlk-Format verwendet weiterhin `volume000.db`; keines der beiden Formate interpretiert die Dateien des anderen neu.
Dateien. Verwaltete Sitzungen importieren keine beliebig extern partitionierte VMDK
als Sitzungsmetadaten.

Die Unterstützung für VMDK-Sitzungen wird durch `vmdk-session-v1` im
`/etc/minios-initramfs-dynblk`innerhalb des initrd angezeigt. Die aktuelle Laufzeitumgebung und jedes
Quell-initrd, das vom Installer kopiert wird, müssen dies unterstützen. VMDK bietet keine native Komprimierung;
`perchcomp`wird beim Booten mit einer Warnung ignoriert und der Session Manager lehnt einen
nicht-`none`VMDK-Codec ab. LUKS2 bleibt eine optionale, separate Verschlüsselungsschicht. Beide Modi veröffentlichen
ihren tatsächlichen Sitzungsmodus und das zugehörige `dynblk_device`im geschützten Boot-Status,
und beide Shutdown-Implementierungen schließen dieses Gerät, nachdem alle Nutzer beendet wurden.

Beide Treiberformate unterstützen `writeback`, `writethrough`, `none`, `directsync` und explizite `unsafe`Anbindungsrichtlinien. Direkte Modi erfordern derzeit ext2/ext4 als Basis. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback`bindet ein bestehendes Dateisystem ein; `umount`gibt das vom Helfer verwaltete Gerät frei, nachdem der letzte Nutzer geschlossen hat. Manuelle `dynblk load`haben eine explizite Lebensdauer. Dadurch wird kein Dateisystem erstellt oder LUKS entsperrt.

Tmpfs-Backing wird für beide Formate mit `writeback`, `writethrough`, und `unsafe`unterstützt; Direct-I/O-Modi werden abgelehnt, statt stillschweigend geändert zu werden. Die Flush-Reihenfolge macht eine tmpfs-gestützte Sitzung nicht über einen Shutdown hinaus dauerhaft. Diese Unterstützung bildet die Grundlage für DynBlk/VMDK RAM-Sitzungen, deren Änderungen explizit im Ursprungs-Store gespeichert werden müssen.

### Raw

Im Raw-Modus wird eine einzelne `changes.img`-Datei mit ext4 verwendet. Die Dateigröße wird bei der Erstellung auf die gewünschte logische Kapazität festgelegt, sodass – im Gegensatz zu den dynamischen Backends – die Kapazität bis zu einer expliziten Erweiterung fest bleibt. Das darunterliegende Dateisystem kann nicht beschriebene Bereiche zwar spärlich speichern, aber MiniOS behandelt Raw dennoch als Speicher mit fester Kapazität und prüft vor dem Erstellen oder Erweitern auf ausreichend verfügbaren Speicherplatz. Da alles in einer Host-Datei liegt, ist FAT32 auf 4000 MiB begrenzt.

Vor dem schreibbaren Einbinden werden vorhandene Raw-Images mit `e2fsck` überprüft. Beim Vergrößern wird zuerst `changes.img` erweitert und anschließend ext4 mit `resize2fs` vergrößert; Verkleinerungen werden nicht unterstützt. Bei einem fehlgeschlagenen Check oder Mount bleibt das Image zur Wiederherstellung erhalten und der Bootvorgang wird in RAM fortgesetzt. Raw benötigt weder einen FUSE-Daemon noch eigene Block-Storage-Metadaten, was das Wiederherstellungsmodell einfach macht, aber das Thin-Capacity-Verhalten von DynFileFS und DynBlk fehlt.

### LUKS-Verschlüsselungsschicht

LUKS2 ist eine optionale Verschlüsselungsschicht, die beim Anlegen einer `perchencrypt=luks` Raw-, DynFileFS-, DynBlk- oder VMDK-Session ausgewählt werden kann. Bestehende Sessions übernehmen ihren Verschlüsselungsstatus aus den Sitzungsmetadaten; eine spätere Angabe von `perchencrypt` ändert oder konvertiert eine bestehende unverschlüsselte Session nicht.

Die Verschlüsselungsgrenze hängt vom Backend ab: Raw bindet `changes.img` über ein Loop-Device ein und platziert LUKS2 innerhalb dieser Datei; DynFileFS bindet sein bereitgestelltes `virtual.dat` ebenfalls über ein Loop-Device ein und verschlüsselt dieses logische Abbild; DynBlk verwendet sein zugewiesenes `/dev/dynblkN` Blockgerät direkt; VMDK nutzt das vom selben DynBlk-Treiber bereitgestellte Blockgerät für sein gesplittetes Sparse-Image. In allen vier Fällen erstellt MiniOS ein ext4-Dateisystem innerhalb von `/dev/mapper/...`, sodass die Dateisysteminhalte und Metadaten im Mapper im Ruhezustand verschlüsselt sind. Backend-Metadaten außerhalb der LUKS-Grenze, VMDK-Deskriptoren, Bootdateien, Sitzungsmetadaten und andere Dateien auf dem Speichermedium bleiben unverschlüsselt.

Größenvorgaben, Wachstumslimits, FAT32-Beschränkungen und das Verhalten bei Thin/Fixed Allocation gehören weiterhin zum jeweiligen Backend. Das initrd authentifiziert sich, bevor ein bestehendes verschlüsseltes Backend vergrößert wird, schließt den Mapper vor dem Backend-Wachstum, öffnet ihn anschließend wieder, prüft ext4 und erweitert das Dateisystem vor dem Mounten. Bei verschlüsselten DynBlk wird die Backend-Komprimierung auf `none` erzwungen.

Bei der Erstellung wird das Passwort zweimal abgefragt. Bestehende verschlüsselte Sessions erlauben drei Entsperrversuche auf der Boot-Konsole. Nach drei abgelehnten Passwörtern wird ein kritischer Bootpfad ausgelöst: MiniOS fährt in RAM nicht fort, interpretiert die Session nicht als unverschlüsselt, wählt kein anderes Backend und erstellt keinen Ersatz. Andere Fehler beim Erstellen, Prüfen, Vergrößern oder Mounten behalten ihr backend-spezifisches Wiederherstellungsverhalten ohne Rückfall auf unverschlüsselte Daten bei. Passwörter werden weder in den Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben. Logische Exporte enthalten entschlüsselte Sitzungsdateien statt eines verschlüsselten Backend-Abbilds.

Siehe [Sicherheit](/maintenance-and-recovery/Security) für Informationen zur Schutzgrenze und zu Backup-Aspekten.

### SquashFS

Das initrd aktiviert normalerweise eine bestehende SquashFS-Sitzung. Die interaktive Einrichtung erzeugt Metadaten der Generation Null mit aktiviertem Speichern beim Herunterfahren, erstellt jedoch kein `changes.sb`; die beschreibbare obere Ebene existiert nur in RAM, bis das laufende System das erste Mal auf Anforderung oder beim Herunterfahren speichert. Eine Sitzung der Generation Null ist nur gültig, wenn Snapshot-Artefaktfelder und `changes.sb` fehlen. Bei späteren Generationen validiert die Aktivierung strikte, eindeutig zugewiesene Metadaten für den Snapshot, einschließlich seines Digests, der komprimierten und unkomprimierten Größe, der Eintragsanzahl, des Union-Typs und der Speicherpolitik. Außerdem werden Dateityp und exakte Größe, verfügbarer RAM und Swap, der SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität geprüft.

Der Snapshot wird mit strikter Fehler- und xattr-Behandlung in ein begrenztes, temporäres ext4-Abbild in RAM extrahiert. Für OverlayFS enthält dieses Abbild getrennte `changes` und `workdir` Verzeichnisse; bei AUFS ist das Root-Verzeichnis der beschreibbare Zweig.
Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Richtlinie verhindern die Aktivierung und lassen den Bootvorgang auf dem gewöhnlichen RAM-Upper.

Eine Sitzung mit dem Status `dirty` bedeutet, dass der vorherige Bootvorgang den sauberen Herunterfahrensübergang nicht abgeschlossen hat. SquashFS warnt dann und stellt den zuletzt erfolgreich gespeicherten `changes.sb` wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Bootvorgang gelten nicht als zweite Rollback-Generation.

Der MiniOS-Sitzungsmanager und das System-Speicher-Backend erstellen und ersetzen SquashFS-Snapshots atomar durch exakte Erfassung. Die Boot-Aktivierung kann einen vorhandenen Snapshot von beschreibbarem FAT-, exFAT- oder NTFS-Speicher lesen, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben dateisystemabhängig: Der Sitzungspeicher muss die Erstellung eines privaten Arbeitsbereichs, Linux-Metadaten und eine dauerhafte Veröffentlichung auf einem geeigneten POSIX-Dateisystem unterstützen.

Beim Speichern erfasst das Backend zunächst einen stabilen Dateibaum im privaten, root-eigenen Speicher, sofern das initrd ein vertrauenswürdiges tmpfs mit ausreichend Platz bereitstellt. Ist RAM unzureichend, wird stattdessen der vorherige Festplattenarbeitsbereich verwendet. Der Kompressor schreibt direkt in ein privates Verzeichnis mit Modus 0700 auf dem Sitzungsdateisystem, nicht in ein zusätzliches RAM-Abbild mit anschließendem Kopiervorgang. MiniOS prüft das komprimierte Ergebnis und dessen Identität, synchronisiert es, verschiebt es auf einen privaten Kandidatennamen und validiert den Kandidaten erneut, bevor der aktive `changes.sb` atomar ersetzt wird. Fehlgeschlagene Kopien oder Komprimierungen ersetzen den letzten erfolgreichen Snapshot nicht.

Bei einer intakten, dauerhaft gespeicherten Sitzung werden `/var/log/minios` und `/var/log/live` aus `boot-logs/` innerhalb der nummerierten Sitzung eingebunden. Diese Startdiagnosen werden daher unabhängig vom RAM-Upper und dem Shutdown-Snapshot geschrieben. Ein Boot, dessen Persistenzspeicher nicht dauerhaft aktiviert wurde, kann nicht garantieren, dass diese Protokolle einen Neustart überstehen. Gewöhnliche Protokolle und Caches können separat konfiguriert werden; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS besitzt keine `perchsize`: Die gespeicherte Größe entspricht den komprimiert erfassten Änderungen, während der Arbeitsspeicher zur Laufzeit durch das extrahierte beschreibbare Upper bestimmt wird. Die MiniOS-LUKS-Persistenzschicht kapselt `changes.sb` nicht; falls Vertraulichkeit des Snapshots erforderlich ist, muss der zugrundeliegende Speicher außerhalb dieser Schicht verschlüsselt werden. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Grenze für Union-Aktivierung und Wiederherstellung

Für AUFS wird das aktivierte Änderungs-Root zu Zweig null mit Schreibzugriff. Bei OverlayFS erstellt das initrd `upperdir` und `workdir` unterhalb des aktivierten Änderungs-Roots und bindet die schreibgeschützten Module als untergeordnete Verzeichnisse ein. Das initrd prüft anschließend den Live-AUFS-Zweig oder OverlayFS `upperdir` bevor die Persistenz als aktiv veröffentlicht wird.

Schlägt ein Persistenz-Backend, ein Metadaten-Update oder diese Überprüfung fehl, werden die entsprechenden Einbindungen – soweit möglich – rückgängig gemacht, es wird kein erfolgreicher Persistenzstatus veröffentlicht und der beschreibbare Bootvorgang läuft in RAM weiter. Gelingt der Aufbau der Root-Union nicht, wird die fatale Initramfs-Shell gestartet. Das Verlassen dieser Shell kann die Einrichtung mit einem ungültigen Root fortsetzen; dies ist jedoch weder eine Reparatur noch eine sichere Rückfallebene. AUFS behält nach Möglichkeit das Anfügen von Modulzweigen bei, aber eine unvollständige Union überschreitet die Wiederherstellungsgrenze: MiniOS markiert die Persistenz nicht als aktiv.

Fehlschläge bei der Container-Prüfung verhindern absichtlich, dass eine verdächtige Sitzung mit Schreibrechten eingehängt wird.
Ersetzen oder rekonstruieren Sie während des Bootvorgangs keine Sitzungsdateien. Sichern Sie zuerst den betroffenen Speicher; siehe [Sicherung von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Ventoy Persistence-Plugin

Ein vom Ventoy Persistence-Plugin ausgewähltes Backend umgeht die Entdeckung von nummerierten Sitzungen. MiniOS löst die Zuordnung von Ventoy`vtoy_persistent`-Geräten auf, erfordert ein ext4-Image mit Schreibzugriff und verwendet ein`changes/`Verzeichnis als AUFS-Upper oder`changes/`plus`workdir/`für OverlayFS. Es erstellt keine`minios/changes/`,`session.conf`, oder nummerierte Sitzungen innerhalb dieses Images. Persistenz erfordert weiterhin eine anerkannte Persistenz-Anfrage;**Ohne Speichern starten**bleibt temporär.

Beim ersten Einsatz wird das Union-Format in`.minios-union`gespeichert. Ein anderes Union-Backend, fehlendes Gerät, falsches Dateisystem, nicht beschreibbares Image oder fehlgeschlagene Union-Aktivierung führt zu einer Warnung und einem neuen RAM-Upper. Ein anderes Image wird niemals nur wegen eines übereinstimmenden Dateisystem-Labels verwendet.

`perchdir`Sitzungsauswahl und`perchtoram`werden bei einem ausgewählten Plugin-Image ignoriert; Änderungen bleiben auf diesem Image, auch bei System`toram`. Sitzungsmanager und`minios-session`verweigern Vorgänge, einschließlich benutzerdefinierter Sitzungsverzeichnisse. Wählen Sie ein anderes Image in Ventoy, um die Umgebung zu wechseln. Ohne ausgewähltes Plugin-Backend verwenden normale Ventoy-Starts das übliche MiniOS-Modell für nummerierte Sitzungen. Siehe[Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## Aktiver, laufender und aktueller Boot-Status

In den dauerhaften Sitzungsmetadaten `default=` ist die **aktive** Sitzung, die für den nächsten Wiederanlauf ausgewählt wurde, während `running=` die Sitzung ist, die als Quelle für den aktuellen Boot-Vorgang aufgezeichnet wurde. Die Aktivierung schreibt beide Felder und markiert diese Sitzung als `dirty`.
Nachdem Persistenz-Mounts bei einem sauberen Shutdown entfernt wurden, entfernt MiniOS `running=` und markiert die Sitzung als `clean`.

Diese Metadatenfelder können nach einem Absturz, fehlgeschriebenen Metadaten, fehlgeschlagener Union-Erstellung, kopiertem Speicher oder unterbrochenem Shutdown veraltet sein. Laufzeitkomponenten, die das Speichern erlauben, vertrauen nicht allein auf `running=`. Sie verwenden den geschützten aktuellen Boot-Status des initrd, der an die Boot-ID, die numerische Sitzung, den Modus, die tatsächliche Speicheridentität, den Schreibstatus, die Dauerhaftigkeit, die verifizierte aktive Generation und – bei DynBlk – das exakt angeschlossene `/dev/dynblkN` Gerät gebunden ist. Ein fehlender oder fehlerhafter aktueller Boot-Eintrag bedeutet, dass Persistenz nicht als zulässiges Speicherziel behandelt werden darf.

Mit `perchtoram=trim` oder `full` werden unterstützte Sitzungscontainer vor der Aktivierung in ein eigenes tmpfs kopiert. Die Kopie wird nur zugelassen, wenn sowohl der verfügbare Arbeitsspeicher als auch der freie tmpfs-Speicherplatz die Größe der Backing-Dateien zuzüglich Reserve abdecken; bei fehlgeschlagener Kopie bleibt der Betrieb auf dem Speicher mit Warnung erhalten. Die kopierte Sitzung kann das beschreibbare Upper bereitstellen, aber der geschützte aktuelle Boot-Status markiert sie als nicht dauerhaft und speichert eine separate `ram-origin` Identität für den ursprünglichen Speicher. `trim` kopiert nur die ausgewählte unterstützte Sitzung und die zugehörigen Metadaten; `full` kopiert jede unterstützte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung im Speicher. Native Verzeichnisdaten werden nicht kopiert: Ein erfolgreicher nativer RAM-Antrag startet einen neuen, leeren DynBlk- oder DynFileFS-Container, außer bei einem Reset, der das Kopieren deaktiviert. Der aktuelle Sitzungsmanager ermittelt den ursprünglichen Speicher über die Dateisystem-UUID und kann die von RAM unterstützte Sitzung explizit zurückspeichern oder als neue nummerierte Sitzung anlegen. Nicht gespeicherte Änderungen an RAM gehen verloren, wenn kein erfolgreicher Rückschreibvorgang stattfindet.

Weitere Hinweise zum Betrieb finden Sie unter [Boot-Modi](/using-minios/Boot-Modes), [Boot-Parameter](/reference/Boot-Parameters), [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence), [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicherheit](/maintenance-and-recovery/Security), und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Sitzungsbezogene Speicherbereinigung

`minios-session reclaim ID`unterstützt DynFileFS, DynBlk und VMDK-Sitzungen. Bei einer Klartext-Sitzung wird FITRIM direkt auf das eigentliche ext4-Dateisystem im Container ausgeführt, niemals auf das kombinierte AUFS/OverlayFS-Root, und anschließend wird die Speicherbereinigung des zugehörigen Backends aufgerufen. Die Bereinigung von DynFileFS erfordert DynFileFS 4.6.0 oder neuer.

Für eine laufende DynFileFS-Sitzung wechselt der Session Manager in einen kurzlebigen privaten Mount-Namespace, um Zugriff auf `virtual.dat`unterhalb des aktiven ext4-Overmounts zu erhalten, ohne den laufenden System-Daemon, Loop-Devices oder Union-Mounts zu beeinträchtigen. Laufende DynBlk-/VMDK-Geräte werden mit dem geschützten aktuellen Boot-Status abgeglichen. Inaktive Sitzungen werden vorübergehend eingebunden und gemountet; eine bereits vom Session Manager gemountete Sitzung nutzt diese bestehende Einbindung erneut. Ein ausgelastetes Unmounten unterbricht den Abbauprozess, anstatt den Speicher unterhalb eines aktiven Dateisystems zu trennen.

Weder beim Start noch beim Herunterfahren wird die Kompaktierung automatisch ausgeführt.`--compact`ist eine explizite Benutzeraktion in der CLI oder die nicht aktivierte Option im Session Manager-Dialog und kann zu einer Verlagerung von Live-Daten führen, was die Anzahl der Schreibvorgänge auf Flash erhöht. Ohne diese Aktion geben Backends nur den Speicherplatz frei, den sie zurückgeben können, ohne Live-Daten zu verschieben, etwa lochbare Bereiche oder vollständig freie Dateiende; auf Dateisystemen wie exFAT bleiben freigegebene innere Bereiche innerhalb des Containers wiederverwendbar, auch wenn sie nicht an das Host-Dateisystem zurückgegeben werden können. Verschlüsselte Sitzungen geben nur den Speicherplatz frei, der dem Backend bereits bekannt ist, und aktivieren Discard über dm-crypt nicht stillschweigend.
