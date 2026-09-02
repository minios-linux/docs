---
updated: 2026-08-28
---

# Persistenz-Interna

Diese Seite erklärt die Boot-Parameter `perch`, `perchdir`, `perchmode`, `perchsize` und `perchreserve`. Diese Parameter steuern, wo Änderungen aus einer Live-Sitzung gespeichert werden. Für den normalen Gebrauch wählen Sie einen persistenten Eintrag im Boot-Menü oder verwenden Sie den MiniOS-Sitzungsmanager, anstatt die Parameter manuell zu bearbeiten.

MiniOS baut das Live-Root aus schreibgeschützten Modulen und einer beschreibbaren oberen Ebene auf.
Das initrd entscheidet, ob diese obere Ebene eine nummerierte persistente Sitzung oder ein temporäres Verzeichnis in RAM ist. Diese Seite beschreibt diese Entscheidung und den Aktivierungspfad beim Booten. Für die benutzerseitigen Einstellungen siehe [Boot-Modi](/using-minios/Boot-Modes) und [Boot-Parameter](/reference/Boot-Parameters).

## Einfach erklärt

Ohne einen Persistenz-Parameter speichert MiniOS Änderungen in RAM und verwirft sie beim Herunterfahren. Ein Persistenz-Parameter weist MiniOS an, beschreibbaren Speicher zu finden, eine nummerierte Sitzung auszuwählen oder zu erstellen, die Kompatibilität zu prüfen und diese Sitzung als beschreibbare Ebene zu verwenden.

Das Anfordern von Persistenz garantiert nicht, dass sie tatsächlich aktiv ist. Ist das Ziel schreibgeschützt, voll, beschädigt oder inkompatibel, kann MiniOS mit einer temporären RAM-Ebene fortfahren. Lesen Sie die Startwarnung, bevor Sie sich auf gespeicherte Änderungen verlassen.

## Parameter erklärt

| Parameter | Was es MiniOS mitteilt | Typische Wahl |
|---|---|---|
| `perchdir=resume` | Öffnet die standardmäßig kompatible Sitzung und erstellt unter unterstützten Bedingungen einen Ersatz, wenn diese nicht verwendet werden kann. | Normale tägliche Nutzung. |
| `perchdir=new` | Erstellt eine neue nummerierte Sitzung. | Bestehenden Arbeitsbereich unverändert lassen. |
| `perchdir=ask` | Zeigt gespeicherte Sitzungen an, nachdem ein fortsetzbarer Speicher gefunden wurde, und lässt Sie eine auswählen. Kann die erste Sitzung auf leerem Speicher nicht erstellen. | Mehrere Arbeitsbereiche auf einem Gerät; für die erste Sitzung `perchdir=new` verwenden. |
| `perchdir=NUMBER` | Fordert eine bestimmte nummerierte Sitzung an. | Stabiles, benutzerdefiniertes Boot-Menü nach Überprüfung der Sitzungs-ID. |
| `perchmode=MODE` | Wählt `native`, `dynfilefs`, `raw`, `luks` oder eine bestehende `squashfs`-Sitzung. | Passend zum Dateisystem und Verschlüsselungsbedarf. |
| `perchsize=SIZE` | Fordert die Größe einer neuen oder wachsenden Containersitzung an. | DynFileFS-, raw- oder LUKS-Speicher. |
| `perchreserve=MB` | Zieht beim Dimensionieren eines neuen oder wachsenden Containers eine Reserve ab und setzt die Warnschwelle für wenig Speicherplatz. | Arbeitsbereich beim Anlegen eines Containers freilassen; ist kein Laufzeit-Kontingent. |
| `perch` | Verwendet das ältere Resume-Verhalten ohne automatisches Erstellen eines Ersatzes. | Kompatibilität mit einem bestehenden benutzerdefinierten Eintrag; für aktuelle Menüs `perchdir=resume` bevorzugen. |

Kombinieren Sie Persistenz nicht mit `toram`, wenn Sie erwarten, dass Änderungen auf das Ursprungsgerät zurückgeschrieben werden. MiniOS aktiviert die kopierte Sitzung in RAM, und Änderungen an dieser Kopie gehen beim Herunterfahren verloren.

## Persistenz ist explizit

Das initrd aktiviert die Persistenzverwaltung nur, wenn die Kernel-Befehlszeile einen dieser anerkannten Tokens enthält:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Fehlt einer dieser Tokens, auch wenn nur ein nicht erkannter `perch...`-Name vorhanden ist, erstellt MiniOS eine neue beschreibbare obere Ebene in RAM. Änderungen während dieses Starts werden beim Herunterfahren verworfen.

Die Selektoren sind nicht alle gleichwertig:

| Selektor | Initrd-Verhalten |
|---|---|
| `perch` | Versucht, das Standard-Metadatum fortzusetzen. Erstellt keine Sitzung automatisch, wenn keine nutzbar ist oder Kompatibilitätsprüfungen fehlschlagen. |
| `perchdir=resume` | Versucht das Standard-Metadatum und kann automatisch einen neuen kompatiblen Ersatz erstellen. Dies ist das aktuelle Resume-Verhalten des Boot-Menüs. |
| `perchdir=new` | Legt ein Verzeichnis mit einer numerischen ID an, die eins höher ist als die höchste vorhandene ID. Es wird nie ein bestehendes Verzeichnis wiederverwendet. |
| `perchdir=ask` | Bietet bestehende Sitzungen nach Auffinden eines fortsetzbaren Speichers und Defaults an. Eine inkompatible Sitzung erfordert eine Bestätigung. Bei leerem Speicher `perchdir=new` für die erste Sitzung verwenden. |
| `perchdir=NUMBER` | Verwendet dieses Verzeichnis, wenn es existiert. Falls nicht, kann auf das in den Metadaten gespeicherte Default zurückgegriffen werden; die gewünschte Nummer wird nicht reserviert. |

Andere anerkannte Persistenz-Parameter ohne Selektor führen denselben Legacy-Resume-Pfad wie ein nacktes `perch` aus: Sie fordern Persistenz an, ermöglichen aber keine automatische Erstellung. Falls Auswahl oder Aktivierung keine nutzbare obere Ebene liefern, läuft der Bootvorgang normal mit der RAM-Ebene weiter und gibt eine Fehlerwarnung aus.

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

## Reservierter Speicherplatz und Größen

MiniOS verwendet standardmäßig 256 MiB als Allokationspuffer und Warnschwelle bei wenig Speicherplatz. Die Berechnung erfolgt mit 1024-Byte-Dateisystemblöcken. `perchreserve` akzeptiert eine vorzeichenlose Ganzzahl ohne Einheit, ist auf 4096 begrenzt und fällt auf 256 zurück, wenn sie fehlt oder ungültig ist. Der Puffer reduziert den für einen neuen oder wachsenden Container angebotenen Speicherplatz. Es handelt sich nicht um ein Quota: Eine native Sitzung oder spätere Schreibvorgänge können weiterhin den verbleibenden Dateisystemplatz nutzen. Beim Booten wird gewarnt, wenn der aktuelle freie Speicherplatz auf oder unter dem Schwellenwert liegt.

Container-Größen werden als ganze Werte in MiB zugewiesen:

- Eine reine Zahl, `M` oder `MB` bedeutet MiB.
- `G` oder `GB` multipliziert die Zahl mit 1000 MiB.
- `T` oder `TB` multipliziert die Zahl mit 1.000.000 MiB.
- Die maximale logische Anforderung beträgt 1.000.000 MiB, weiter begrenzt durch den verfügbaren Speicherplatz nach Abzug des Puffers.
- Der MiniOS-Sitzungsmanager begrenzt Raw- und LUKS-Dateien auf 4000 MiB bei FAT32. Während der initrd-Aktivierung wird das Limit bei LUKS zuverlässig angewendet, während eine zu große Raw-Anforderung zur Allokation gelangen und fehlschlagen kann, anstatt reduziert zu werden.
- Neue Raw- und LUKS-Sitzungen haben standardmäßig 4000 MiB.
- Eine neue, vom initrd erstellte DynFileFS-Sitzung verwendet standardmäßig die nach dem Puffer verfügbare Kapazität, möglichst auf ein 1000 MiB-Intervall abgerundet.

Das Vergrößern von Containern erfolgt nach dem Best-Effort-Prinzip, eine Verkleinerung wird nicht unterstützt. `perchsize` legt keine Größe für native oder SquashFS-Sitzungen fest. Der MiniOS-Sitzungsmanager verwendet für neu erstellte Containersitzungen standardmäßig 4000 MiB; siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Speicheraktivierung

Alle erfolgreichen Modi müssen die beschreibbare obere Ebene bereitstellen, die vom gewählten Union-Dateisystem erwartet wird. Das Einbinden eines Backends allein beweist nicht, dass Persistenz aktiv ist. Native, DynFileFS, raw und LUKS können die Metadaten der persistenten Sitzung vor der Union-Validierung aktualisieren; SquashFS verzögert dieses Metadaten-Commit. Der geschützte Zustand des aktuellen Boots wird erst veröffentlicht, nachdem die finale Root-Union bestätigt hat, dass die erwartete obere Ebene verwendet wird.

### Native

Im Native-Modus werden zunächst bekannte nicht-POSIX-Dateisysteme wie FAT, exFAT und NTFS ausgeschlossen. Anschließend wird das tatsächliche Verhalten des Dateisystems geprüft, indem eine Datei und ein Symlink angelegt und Änderungen an den Ausführungsrechten getestet werden. Ist die Prüfung erfolgreich, wird das nummerierte Sitzungsverzeichnis direkt als beschreibbarer Bereich bind-gemountet.

Ist das Dateisystem als ungeeignet bekannt oder schlägt die POSIX-Prüfung fehl, fällt der Native-Modus auf DynFileFS zurück. Ein Fehler nach der Native-Aktivierung wird zurückgerollt; ein neuer leerer Kandidat wird entfernt, wenn dies sicher möglich ist.

### DynFileFS

DynFileFS, implementiert vom `dynblk`-kompatiblen Helfer, speichert ein logisches Block-Image in `changes.dat` sowie dessen nummerierte Segmentdateien. Der Helfer muss erfolgreich einbinden und `virtual.dat` bereitstellen; andernfalls schlägt die Aktivierung fehl, anstatt versehentlich eine RAM-only-Datei mit persistent wirkendem Namen zu erzeugen.

Das logische Image enthält ext4. Bestehende Images werden vor dem beschreibbaren Einbinden geprüft; Dateisystemprüfungen mit Status oberhalb "korrigierte Fehler" lehnen die Sitzung ab, anstatt sie einzubinden. Resize ist nur wachsend möglich, und das interne ext4-Dateisystem wird nach Möglichkeit erweitert. Für benutzerorientierte Diagnose siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### Raw

Der Raw-Modus verwendet ein festes `changes.img`-ext4-Image. Neue Images werden vor der Nutzung angelegt und formatiert. Bestehende Images werden vor dem Einbinden geprüft, können auf eine größere gewünschte Größe erweitert werden, und ext4 wird entsprechend vergrößert. Ein fehlgeschlagener Check oder Mount lässt den Container für die Wiederherstellung verfügbar und setzt den Bootvorgang in RAM fort.

### LUKS

Der LUKS-Modus verwendet einen LUKS2-`changes.luks`-Container mit ext4 direkt darin.
Er ist nur verfügbar, wenn das initrd die crypt-Unterstützungsmarkierung und die erforderlichen Tools enthält. Bei der Erstellung wird eine passende Bestätigungseingabe abgefragt. Ein bestehender Container erlaubt drei Entsperrversuche auf der Boot-Konsole.

Das initrd authentifiziert vor dem Vergrößern einer bestehenden verschlüsselten Datei, prüft und erweitert ext4 vor dem Einbinden. Falls Erstellung, Entsperren, Prüfung, Vergrößerung oder Einbindung fehlschlagen, bereinigt MiniOS das Mapping und setzt in RAM fort. Es erfolgt niemals ein Fallback auf native, DynFileFS, raw oder andere unverschlüsselte Persistenz.
Passphrasen werden weder in den Sitzungsmetadaten gespeichert noch als Befehlsargumente übergeben.
Siehe [Sicherheit](/maintenance-and-recovery/Security).

### SquashFS

Das initrd kann nur eine bestehende SquashFS-Sitzung aktivieren; es kann keine neue `changes.sb` erstellen. Die Aktivierung prüft strikte, eindeutig gesetzte Metadaten für den Snapshot, einschließlich dessen Digest, komprimierter und unkomprimierter Größe, Eintragsanzahl, Union-Typ und Speicherstrategie. Es werden außerdem Dateityp und exakte Größe, verfügbarer RAM und Swap, der SHA-256-Digest vor und nach der Extraktion sowie die aktuelle Union-Kompatibilität kontrolliert.

Der Snapshot wird mit striktem Fehler- und xattr-Handling in ein begrenztes, temporäres ext4-Abbild in RAM extrahiert. Für OverlayFS enthält dieses Abbild separate `changes`- und `workdir`-Verzeichnisse; für AUFS ist das Root-Verzeichnis der beschreibbare Zweig.
Fehlerhafte Metadaten, unzureichender Speicher, Digest-Änderungen, Extraktionsfehler oder eine ungültige Strategie führen dazu, dass die Aktivierung fehlschlägt und der Bootvorgang auf dem normalen RAM-Upper fortgesetzt wird.

Eine Sitzung mit dem Status `dirty` bedeutet, dass der vorherige Bootvorgang den sauberen Shutdown-Übergang nicht abgeschlossen hat. SquashFS warnt dann und stellt den zuletzt erfolgreich gespeicherten `changes.sb` wieder her; nicht gespeicherte Änderungen aus dem unterbrochenen Boot zählen nicht als weitere Rollback-Generation.

MiniOS-Sitzungsmanager und das System-Backend für das Speichern erstellen und ersetzen SquashFS-Snapshots atomar mittels exakter Erfassung. Die Boot-Aktivierung kann einen vorhandenen Snapshot von beschreibbarem FAT-, exFAT- oder NTFS-Speicher lesen, da die Extraktion im temporären ext4-Upper erfolgt. Erstellung und exaktes Speichern bleiben jedoch dateisystemgebunden: Ihr privater Staging-Bereich muss Links, Besitzrechte, Modi, xattrs, ACLs, Capabilities und Union-Whiteouts erhalten, daher erfordert das aktuelle Speichern ein geeignetes POSIX-Dateisystem. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence).

## Union-Aktivierung und Wiederherstellungsgrenze

Für AUFS wird das aktivierte Änderungs-Root zum beschreibbaren Branch Null. Für OverlayFS erstellt das initrd `upperdir` und `workdir` unterhalb des aktivierten Änderungs-Roots und bindet die schreibgeschützten Module als untere Verzeichnisse ein. Anschließend prüft das initrd den Live-AUFS-Branch oder OverlayFS `upperdir`, bevor Persistenz als aktiv veröffentlicht wird.

Falls ein Persistenz-Backend, ein Metadaten-Update oder diese Prüfung fehlschlägt, werden die Mounts soweit möglich rückgängig gemacht, kein erfolgreicher Persistenzstatus veröffentlicht und der beschreibbare Boot läuft in RAM weiter. Das Scheitern beim Aufbau der Root-Union führt zur fatalen Initramfs-Shell. Das Verlassen dieser Shell kann die Einrichtung mit einem ungültigen Root fortsetzen; dies ist keine Reparatur und kein sicherer Fallback. AUFS behält bestmögliche Modul-Branch-Anhänge bei, aber eine unvollständige Union überschreitet die Wiederherstellungsgrenze: MiniOS markiert Persistenz nicht als aktiv.

Fehler bei Containerprüfungen vermeiden absichtlich das beschreibbare Einbinden einer verdächtigen Sitzung.
Ersetzen oder rekonstruieren Sie Sitzungsdateien während des Bootvorgangs nicht. Sichern Sie zuerst den betroffenen Speicher; siehe [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

## Aktiver, laufender und aktueller Boot-Zustand

In den dauerhaften Sitzungsmetadaten ist `default=` die **aktive** Sitzung, die für den nächsten Resume ausgewählt wird, während `running=` die Sitzung ist, die für den aktuellen Boot aufgezeichnet wurde. Die Aktivierung schreibt beide Felder und markiert diese Sitzung als `dirty`.
Nachdem die Persistenz-Mounts bei einem sauberen Herunterfahren entfernt wurden, löscht MiniOS `running=` und markiert die Sitzung als `clean`.

Diese Metadatenfelder können nach einem Absturz, fehlgeschriebenen Metadaten, fehlgeschlagener Union-Erstellung, kopiertem Speicher oder unterbrochenem Shutdown veraltet sein. Laufzeitkomponenten, die das Speichern erlauben, vertrauen `running=` allein nicht. Sie verwenden den vom initrd geschützten aktuellen Boot-Zustand, der an die Boot-ID, die numerische Sitzung, den Modus, die tatsächliche Speicheridentität, den Schreibstatus, die Haltbarkeit und die verifizierte aktive Generation gebunden ist. Ein fehlgeschlagener oder fehlender Current-Boot-Eintrag bedeutet, dass Persistenz nicht als genehmigtes Speicherziel behandelt werden darf.

Mit `toram` und einer erkannten Persistenzanforderung wird der Sitzungspeicher vor der Aktivierung in RAM kopiert. Die kopierte Sitzung kann beschreibbar sein und die laufende obere Ebene bereitstellen, aber ihr aktueller Boot-Zustand ist als nicht dauerhaft markiert. Änderungen an dieser RAM-Kopie kehren nicht auf das Ursprungsgerät zurück und gehen beim Herunterfahren verloren.

Weitere Hinweise zum Betrieb finden Sie unter [Boot-Modi](/using-minios/Boot-Modes), [Boot-Parameter](/reference/Boot-Parameters), [Sitzungen und Persistenz](/using-minios/Sessions-and-Persistence), [Backup von MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Sicherheit](/maintenance-and-recovery/Security) und [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).
