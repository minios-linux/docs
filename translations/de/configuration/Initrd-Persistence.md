---
updated: 2026-08-26
---

# Initrd-Persistenz

MiniOS erstellt das Live-Root-Dateisystem aus schreibgeschützten Modulen und einer beschreibbaren oberen Schicht.
Das Initrd entscheidet, ob diese obere Schicht eine nummerierte persistente Sitzung oder ein temporäres Verzeichnis im RAM ist. Diese Seite beschreibt die Entscheidung und den Aktivierungspfad beim Booten.
Die benutzerseitigen Einstellungen finden Sie unter [Boot-Modi](./Boot-Modes.md) und [Boot-Parameter](./Boot-Parameters.md).

## Persistenz ist explizit

Das Initrd aktiviert die Persistenzverwaltung nur, wenn die Kernel-Befehlszeile einen der folgenden anerkannten Tokens enthält:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Fehlt einer dieser Tokens, auch wenn nur ein nicht erkannter `perch...`-Name vorhanden ist, erstellt MiniOS eine neue beschreibbare obere Schicht im RAM. Änderungen während dieses Starts werden beim Herunterfahren verworfen.

Die Selektoren sind nicht gleichwertig:

| Selektor | Initrd-Verhalten |
|---|---|
| `perch` | Versucht, den in den Metadaten hinterlegten Standard wiederherzustellen. Erstellt keine Sitzung automatisch, wenn keine nutzbar ist oder Kompatibilitätsprüfungen fehlschlagen. |
| `perchdir=resume` | Versucht den Metadaten-Standard und kann automatisch eine neue, kompatible Sitzung anlegen. Dies ist das aktuelle Resume-Verhalten im Boot-Menü. |
| `perchdir=new` | Legt ein Verzeichnis mit einer numerischen ID an, die um eins höher ist als die höchste existierende ID. Bereits vorhandene Verzeichnisse werden nie wiederverwendet. |
| `perchdir=ask` | Bietet existierende Sitzungen und die Option für eine neue Sitzung an. Eine inkompatible bestehende Sitzung erfordert eine Bestätigung. |
| `perchdir=NUMBER` | Verwendet dieses Verzeichnis, wenn es existiert. Falls nicht, kann die Auswahl auf den in den Metadaten hinterlegten Standard zurückfallen; die angeforderte Nummer wird nicht reserviert. |

Andere anerkannte Persistenzparameter ohne Selektor führen denselben Legacy-Resume-Pfad wie ein reines `perch` aus: Sie fordern Persistenz an, erlauben aber keine automatische Erstellung. Wenn Auswahl oder Aktivierung keine nutzbare obere Schicht erzeugen können, wird der Bootvorgang mit RAM als oberer Schicht fortgesetzt und eine Fehlermeldung ausgegeben.

## Sitzungs-Speicher und Speicherort

Der Standardspeicher ist das `changes`-Verzeichnis neben den MiniOS-Daten, mit nummerierten Sitzungsverzeichnissen und `session.conf`- oder `session.json`-Metadaten:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Der Speicher kann stattdessen als Gerät plus optionalem Pfad ausgewählt werden. Akzeptierte Formen umfassen einen direkten `/dev/...`-Pfad, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` und `askdisk:custom:path`. Der durch Doppelpunkte getrennte Suffix wird zu einem Pfad unterhalb des gewählten Geräts; eine Slash-Syntax nach `askdisk` ignoriert diesen benutzerdefinierten Pfad stillschweigend. Ein ausgewähltes Unterverzeichnis wird als Sitzungs-Speicher bind-gemountet. MiniOS kann auch eine Persistenz-Partition auf demselben Laufwerk sowie unterstützten Ventoy-Persistenzspeicher erkennen.

Vor der Sitzungswahl muss das Initrd den Speicherort beschreibbar einhängen und nachweisen, dass es im Speicher einen Marker anlegen und entfernen kann. Ein Blockgerät, das nicht zum Schreiben geöffnet werden kann, ein schreibgeschütztes Dateisystem, ein nicht erreichbarer Pfad oder ein fehlgeschlagener Schreibtest führen dazu, dass die Persistenz für diesen Bootvorgang abgelehnt wird. Bestehende Sitzungen werden nicht allein dadurch als vertrauenswürdig betrachtet, dass ihre Dateien lesbar sind.

## Auswahl und Kompatibilität

Sitzungs-Metadaten speichern den Speichermodus und können die MiniOS-Version, Edition, das Union-Dateisystem und die Containergröße enthalten. Beim Resume werden der gespeicherte Modus, die Version, Edition und das Union-Dateisystem mit dem angeforderten Modus und dem aktuellen System verglichen. Fehlende Kompatibilitätsfelder aus älteren Versionen gelten nicht als Inkompatibilität.

Ein wörtliches `perchdir=resume` erstellt eine neue nummerierte Sitzung, wenn der Standard fehlt oder wenn ein gespeicherter Modus, eine Version, Edition oder ein Union-Mismatch diesen Standard untauglich macht. Ein reines `perch`, eine direkte numerische Auswahl und andere Legacy-Resume-Anfragen lehnen einen automatischen Ersatz ab und setzen den Start nach Auswahlfehler im RAM fort. `perchdir=ask` zeigt Kompatibilitätsinformationen an und erlaubt eine explizite Überschreibung. Eine neue Sitzung verwendet standardmäßig `native`, sofern kein anderer Modus angefordert wurde.

Der Speichermodus ist Teil der Kompatibilität. Wenn die Auswahl die Backend-Dispatch erreicht, fällt ein unbekannter angeforderter Modus auf `native` zurück, dessen Probe dann ggf. DynFileFS auf untauglichem Speicher auswählt. Eine bestehende Sitzung mit anderem gespeichertem Modus kann bereits bei der Kompatibilitätsprüfung fehlschlagen; eine Legacy-Resume-Anfrage läuft dann im RAM weiter, statt auf diesen Fallback zuzugreifen.

## Speicherreserve und Größen

MiniOS hält standardmäßig 256 MiB auf dem Persistenz-Dateisystem frei. Die Reserve und die Freispeicherprüfungen verwenden 1024-Byte-Dateisystemblöcke. `perchreserve` akzeptiert eine ganze, positive Zahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn der Wert fehlt oder ungültig ist. Neue Allokationen und angeforderte Vergrößerungen werden so begrenzt, dass diese Reserve frei bleibt. Beim Booten wird ebenfalls gewarnt, wenn der aktuelle freie Speicher auf oder unter der Reserve liegt.

Containergrößen werden als ganze Werte in MiB vergeben:

- Eine reine Zahl, `M` oder `MB` bedeutet MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Die maximale logische Anforderung beträgt 1.000.000 MiB, zusätzlich begrenzt durch den verfügbaren Speicher nach Reserve.
- Der Session Manager begrenzt Raw- und LUKS-Dateien auf 4000 MiB bei FAT32. Während der Initrd-Aktivierung wird das Limit bei LUKS zuverlässig angewendet, während eine zu große Raw-Anforderung bei der Allokation scheitern kann, statt reduziert zu werden.
- Neue Raw- und LUKS-Sitzungen verwenden standardmäßig 4000 MiB.
- Eine neue, vom Initrd erstellte DynFileFS-Sitzung verwendet standardmäßig die verfügbare Kapazität nach Reserve, abgerundet auf ein 1000-MiB-Intervall, wenn möglich.

Containerwachstum ist best-effort, Verkleinerung wird nicht unterstützt. `perchsize` legt keine Größe für native oder SquashFS-Sitzungen fest. Der Session Manager verwendet für neu angelegte Container-Sitzungen standardmäßig 4000 MiB; siehe [Sitzungsverwaltung](./Session-Management.md).

## Speicher-Aktivierung

Alle erfolgreichen Modi müssen die beschreibbare obere Schicht bereitstellen, die vom gewählten Union-Dateisystem erwartet wird. Ein Backend-Mount allein ist keine endgültige Laufzeit-Autorität. Native, DynFileFS, Raw und LUKS können persistente Sitzungs-Metadaten vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Der geschützte Status des aktuellen Boots wird erst veröffentlicht, nachdem die finale Root-Union die erwartete obere Schicht verwendet.

### Native

Im Native-Modus werden zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS ausgeschlossen. Anschließend wird das tatsächliche Verhalten des Dateisystems geprüft, indem eine Datei und ein Symlink erstellt und Änderungen am Ausführungsmodus überprüft werden. Ist der Test erfolgreich, wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich bind-gemountet.

Ist das Dateisystem als ungeeignet bekannt oder schlägt der POSIX-Test fehl, fällt der Native-Modus auf DynFileFS zurück. Ein Fehler nach der Native-Aktivierung wird rückgängig gemacht; ein neuer, leerer Kandidat wird entfernt, sofern dies gefahrlos möglich ist.

### DynFileFS

DynFileFS, implementiert durch den `dynblk`-kompatiblen Helfer, speichert ein logisches Block-Image in `changes.dat` sowie dessen nummerierte Segmentdateien. Der Helfer muss erfolgreich mounten und `virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, statt versehentlich eine nur im RAM befindliche Datei mit persistent wirkendem Namen zu erzeugen.

Das logische Image enthält ext4. Bestehende Images werden vor dem beschreibbaren Mount geprüft; Dateisystem-Prüfergebnisse oberhalb des Status "Fehler korrigiert" lehnen die Sitzung ab und bewahren sie zur Wiederherstellung. Resize ist nur wachstumsorientiert, und das interne ext4-Dateisystem wird nach Möglichkeit erweitert. Siehe [DynFileFS-Wiederherstellung](./DynFileFS-Recovery.md) für Details zu Segmenten und Reparatur.

### Raw

Im Raw-Modus wird ein festes `changes.img`-ext4-Image verwendet. Neue Images werden vor der Nutzung allokiert und formatiert. Bestehende Images werden vor dem Mount geprüft, können auf eine größere angeforderte Größe erweitert werden und das ext4-Dateisystem wird entsprechend vergrößert. Ein fehlgeschlagener Check oder Mount lässt den Container zur Wiederherstellung verfügbar und setzt den Bootvorgang im RAM fort.

### LUKS

Der LUKS-Modus verwendet einen LUKS2-`changes.luks`-Container mit ext4 direkt darin.
Er ist nur verfügbar, wenn das initrd die Crypt-Unterstützungsmarkierung und die
erforderlichen Tools enthält. Bei der Erstellung wird eine passende Bestätigungseingabe verlangt. Ein bestehender
Container erlaubt drei Entsperrversuche an der Boot-Konsole.

Das initrd authentifiziert sich, bevor eine bestehende verschlüsselte Datei vergrößert wird, prüft
und erweitert dann ext4, bevor es eingebunden wird. Falls Erstellung, Entsperren, Prüfung, Vergrößerung oder
Einbinden fehlschlagen, räumt MiniOS die Zuordnung auf und läuft im RAM weiter. Es wird niemals auf native, DynFileFS, raw oder eine andere unverschlüsselte Persistenz zurückgegriffen.
Passphrasen werden weder in den Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben.
Siehe [Sicherheit](/administration/Security-Hardening.md).

### SquashFS

Das Initrd kann nur eine bestehende SquashFS-Sitzung aktivieren; es kann kein neues `changes.sb` erstellen. Die Aktivierung validiert strikte, eindeutig gesetzte Metadaten für den Snapshot, einschließlich dessen Digest, komprimierter und unkomprimierter Größe, Eintragsanzahl, Union-Typ und Speicherpolitik. Es prüft außerdem Dateityp und exakte Größe, verfügbaren RAM und Swap, den SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität.

Der Snapshot wird mit strikter Fehler- und xattr-Behandlung in ein begrenztes, temporäres ext4-Image im RAM extrahiert. Für OverlayFS enthält dieses Image separate `changes`- und `workdir`-Verzeichnisse; für AUFS ist dessen Root der beschreibbare Zweig. Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Policy führen zum Aktivierungsfehler und der Bootvorgang läuft mit der normalen RAM-Oberfläche weiter.

Eine Sitzung mit dem Marker `dirty` bedeutet, dass der vorherige Bootvorgang den sauberen Shutdown-Übergang nicht abgeschlossen hat. SquashFS warnt dann und stellt das zuletzt erfolgreich gespeicherte `changes.sb` wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Boot sind keine zweite Rollback-Generation.

Session Manager und das System-Backend für das Speichern erstellen und ersetzen SquashFS-Snapshots atomar mittels exakter Erfassung. Die Boot-Aktivierung kann einen bestehenden Snapshot von beschreibbarem FAT, exFAT oder NTFS einlesen, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben jedoch dateisystemabhängig: Ihr privater Staging-Bereich muss Links, Besitz, Modi, xattrs, ACLs, Fähigkeiten und Union-Whiteouts erhalten, daher erfordert das aktuelle Speichern ein geeignetes POSIX-Dateisystem. Siehe [Sitzungsverwaltung](./Session-Management.md).

## Union-Aktivierung und Wiederherstellungsgrenze

Bei AUFS wird das aktivierte Changes-Root zum beschreibbaren Branch Null. Bei
OverlayFS erstellt das initrd `upperdir` und `workdir` unterhalb des aktivierten
Changes-Root und bindet die schreibgeschützten Module als untere Verzeichnisse ein. Das initrd
überprüft dann den Live-AUFS-Branch oder das OverlayFS-`upperdir`, bevor die
Persistenz als aktiv veröffentlicht wird.

Falls ein Persistenz-Backend, ein Metadaten-Update oder diese Überprüfung fehlschlägt, werden die
eingebundenen Dateisysteme soweit möglich zurückgesetzt, keine erfolgreiche Laufzeitberechtigung wird
veröffentlicht und der beschreibbare Boot läuft im RAM weiter. Wenn die Root-Union nicht erstellt werden kann, wird die fatale Initramfs-Shell gestartet. Das Verlassen dieser Shell kann dazu führen, dass das Setup mit einem ungültigen Root fortgesetzt wird; dies ist jedoch keine Reparatur oder sichere Rückfallebene. AUFS behält bestmögliche Modul-Branch-Erweiterungen bei, aber eine unvollständige Union überschreitet die Wiederherstellungsgrenze: MiniOS veröffentlicht keine erfolgreiche Persistenzberechtigung.

Fehler bei Container-Prüfungen vermeiden absichtlich eine beschreibbare Wiederherstellung. Bewahren Sie die
Sitzung auf und folgen Sie der [Backup-Wiederherstellung](/administration/Backup-Recovery.md),
der [DynFileFS-Wiederherstellung](./DynFileFS-Recovery.md) oder dem
[Troubleshooting](/administration/Troubleshooting.md), anstatt Sitzungsdateien während des Bootvorgangs zu ersetzen.

## Aktiver, laufender und aktueller Boot-Zustand

In den dauerhaften Sitzungsmetadaten ist `default=` die **aktive** Sitzung, die für
den nächsten Resume ausgewählt wurde, während `running=` die Sitzung ist, die den
aktuellen Boot bereitstellt. Die Aktivierung schreibt beide Felder und markiert diese Sitzung als `dirty`.
Nachdem die Persistenz-Einbindungen bei einem sauberen Shutdown entfernt wurden, entfernt MiniOS
`running=` und markiert die Sitzung als `clean`.

Diese Metadatenfelder können nach einem Absturz, fehlgeschriebenen Metadaten, fehlgeschlagener
Union-Erstellung, kopiertem Store oder unterbrochenem Shutdown veraltet sein. Laufzeit-Komponenten,
die das Speichern autorisieren müssen, vertrauen nicht allein auf `running=`. Sie nutzen den
geschützten aktuellen Boot-Zustand des initrd, der an die Boot-ID, die numerische Sitzung,
Modus, tatsächliche Store-Identität, Schreibstatus, Dauerhaftigkeit und die verifizierte aktive
Generation gebunden ist. Ein fehlgeschlagener oder fehlender aktueller Boot-Eintrag bedeutet, dass Persistenz nicht als autorisiertes Speicherziel behandelt werden darf.

Mit `toram` und einer erkannten Persistenzanforderung wird der Sitzungs-Store vor der Aktivierung in den RAM kopiert. Die kopierte Sitzung kann beschreibbar sein und das laufende Upper bereitstellen, aber ihr aktueller Boot-Zustand ist als nicht dauerhaft markiert. Änderungen an dieser RAM-Kopie werden nicht auf das Originalgerät zurückgeschrieben und gehen beim Shutdown verloren.

Weitere Hinweise zum Betrieb finden Sie unter [Boot-Modi](./Boot-Modes.md),
[Boot-Parameter](./Boot-Parameters.md),
[Sitzungsverwaltung](./Session-Management.md),
[DynFileFS-Wiederherstellung](./DynFileFS-Recovery.md),
[Backup-Wiederherstellung](/administration/Backup-Recovery.md),
[Sicherheit](/administration/Security-Hardening.md) und
[Troubleshooting](/administration/Troubleshooting.md).
