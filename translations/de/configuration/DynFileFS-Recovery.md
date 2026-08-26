# Wiederherstellung von DynFileFS- und dynblk-Speicher

DynFileFS und `dynblk` stellen ein dynamisch zugewiesenes `virtual.dat`-Block-Image bereit, dessen Daten in einer Reihe von `changes.dat`-Dateien gespeichert werden. MiniOS formatiert `virtual.dat` mit ext4 und nutzt es für persistente Änderungen. `dynblk` ist die gepflegte Implementierung desselben Speicherformats; MiniOS behält den Namen des Persistenzmodus `dynfilefs` und den Kompatibilitätsbefehl `@mount.dynfilefs` dort bei, wo es erforderlich ist.

Dieser Leitfaden behandelt Inspektion, Migration, Dateisystemreparatur, Sitzungswiederherstellung und Dateiextraktion. Er gilt nach einem unsauberen Shutdown, einem vollen Speichermedium, einer unterbrochenen Kopie oder einem Fehler in den Sitzungsmetadaten.

Typische Symptome sind:

- MiniOS erstellt bei jedem Start eine weitere nummerierte Sitzung.
- `resume` lädt den vorherigen Desktop und die Dateien nicht.
- Die Auswahl einer alten Sitzung im Boot-Menü hat keine Wirkung.
- Sitzungsverzeichnisse enthalten weiterhin `changes.dat`-Dateien, werden aber nicht aktiviert.

Ursachen können ein unvollständiges Speichersegment, beschädigte Container-Metadaten, ein fehlerhaftes ext4-Dateisystem innerhalb von `virtual.dat` oder eine fehlerhafte `session.conf` sein.

## Sicherheitsregeln

1. Reparieren Sie niemals die einzige Kopie eines Speicher-Containers.
2. Überschreiben Sie keine Quell-Sitzungen auf einen laufenden oder eingehängten `minios/changes`-Store.
3. Kopieren Sie das vollständige `changes`-Verzeichnis, bevor Sie eine Wiederherstellung versuchen.
4. Führen Sie `e2fsck -y` nur auf einer zusätzlichen Kopie einer Sitzung aus.
5. Erstellen Sie fehlende `changes.dat.N`-Dateien nicht manuell.

Erstellen Sie die erste Kopie nicht, während die Quell-Sitzung läuft oder ihr
DynFileFS-Container eingehängt ist. Dessen Metadaten und Segmentdateien können sich
unabhängig ändern und so eine inkonsistente Kopie erzeugen. Starten Sie ohne Persistenz oder verwenden Sie
ein anderes Linux-System. Halten Sie die DynFileFS/FUSE-Ansicht, das `virtual.dat`-Loop-Device
und das innere ext4-Dateisystem inaktiv. Hängen Sie nur das äußere Speicherdateisystem ein,
vorzugsweise im Nur-Lese-Modus, damit die zugehörigen Segmentdateien konsistent kopiert werden können.

## 1. Quelle und Ziel ermitteln

Dateisysteme und Mountpunkte anzeigen:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Legen Sie Pfade für das Quell-`changes`-Verzeichnis und ein separates Wiederherstellungsverzeichnis auf einem Datenträger mit ausreichend freiem Speicherplatz fest:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Überprüfen Sie, ob das Ziel genügend freien Speicherplatz bietet:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Alle Sitzungsdateien kopieren

Verwenden Sie `rsync`, sofern verfügbar:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Alternativ:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Kopieren Sie nicht nur die Hauptdatei `changes.dat`. Eine DynFileFS-Sitzung besteht normalerweise aus einer vollständigen Sequenz:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Alle Segmente gehören zu einem Container.

## 3. Eine Speichersitzung identifizieren

Vergleichen Sie Sitzungsgrößen und Änderungsdaten:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Leere oder fehlgeschlagene Sitzungen sind meist klein. Eine Sitzung mit tatsächlichen persistenten Daten belegt in der Regel deutlich mehr Speicherplatz.

Überprüfen Sie die gespeicherten Sitzungsmetadaten:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS verwendet `session.conf`, um Persistenzsitzungen auszuwählen und zu beschreiben.

## 4. DynFileFS- oder dynblk-Container einhängen

Suchen Sie das installierte Hilfsprogramm. Je nach MiniOS-Image kann der offizielle Name
`dynblk` oder der Kompatibilitätsname `@mount.dynfilefs` lauten:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Wählen Sie eine geeignete Sitzung, zum Beispiel Sitzung 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Geben Sie während dieses manuellen Recovery-Mounts weder `-s` noch `perchsize` an. Der normale
Boot-Prozess kann `-s` für eine gewünschte oder gespeicherte logische Größe übergeben, aber die Wiederherstellung
verzichtet absichtlich auf eine Größenanpassung und liest die vorhandene Größe aus den
DynFileFS/dynblk-Metadaten.

Ein erfolgreicher Mount stellt `virtual.dat` bereit:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Überprüfen Sie das ext4-Dateisystem, ohne Änderungen vorzunehmen:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Hängen Sie es anschließend im Nur-Lese-Modus ein:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Wenn die erwarteten Dateien sichtbar sind, kann die Sitzung wiederhergestellt werden.

Hängen Sie in umgekehrter Reihenfolge aus:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Das interne Dateisystem reparieren

Wenn sich der Container einhängen lässt, aber `e2fsck -n` ext4-Fehler meldet, erstellen Sie zuerst eine weitere Kopie dieser Sitzung:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Reparieren und mounten Sie nur diese Kopie:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Wiederholen Sie nach der Reparatur die schreibgeschützte Überprüfung aus dem vorherigen Abschnitt.

## 6. Wiederherstellung in eine neue kompatible Sitzung

Bevorzugen Sie die Wiederherstellung in eine neu erstellte Sitzung gegenüber der Rekonstruktion von Metadaten für
die beschädigte Sitzung. Falls ein gültiger `.tar.zst`-Export vorhanden ist, starten Sie normal und importieren
Sie ihn mit automatischer Konvertierung für das Ziel-Dateisystem:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Der Import erstellt eine neue nummerierte Sitzung. Überprüfen Sie diese und aktivieren Sie sie anschließend explizit.

Wenn nur der eingehängte Container nutzbar ist, erstellen und starten Sie eine neue Sitzung in einem
Modus, der mit dem Ziel-Dateisystem kompatibel ist. Hängen Sie die wiederhergestellte Kopie
wie in Abschnitt 4 beschrieben schreibgeschützt ein und kopieren Sie die benötigten Dateien in die laufende
Sitzung. Um beispielsweise Home-Verzeichnisse wiederherzustellen:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Kopieren Sie nur die Daten und Konfigurationen, die Sie benötigen. So vermeiden Sie,
unbekannte oder unvollständige Kompatibilitäts-Metadaten als bootfähige Sitzungsdefinition zu behandeln.

## 7. Sitzungs-Metadaten nicht vor Ort rekonstruieren

Ersetzen Sie `session.conf` nicht durch eine Minimaldatei und fügen Sie kein wiederhergestelltes Verzeichnis
von Hand zu einem bestehenden Store hinzu. Die Metadaten beschreiben jede Sitzung in diesem
Store; ein Ersetzen kann gesunde Sitzungen verwaisen lassen, Kompatibilitäts- und Speicher-
Policy-Felder verwerfen und die Auswahl für den nächsten Start verändern.

Wenn der Container schreibgeschützt eingehängt werden kann, stellen Sie die Dateien wie oben beschrieben in eine neu
erstellte kompatible Sitzung wieder her. Falls er nicht eingehängt werden kann, bewahren Sie die vollständige Offline-Kopie
für weitere Dateisystem- oder forensische Wiederherstellung auf. Ein Container ohne vertrauenswürdige Store-Metadaten ist ein wiederherstellbarer Input, aber keine bootfähige Sitzungsdefinition.

## Fehlerreferenz

- `cannot open ... changes.dat.N`: Ein bestätigtes Segment fehlt. Kopieren Sie es
  erneut vom Quellgerät oder versuchen Sie eine andere Sitzung. Erstellen Sie kein leeres Segment.
- `cannot read header`: Der DynFileFS/dynblk-Header ist beschädigt.
- `incompatible data format`: Das Hilfsprogramm und das Container-Format passen nicht zusammen.
- `virtual.dat` existiert, aber ext4 lässt sich nicht einhängen: Überprüfen Sie eine Kopie mit `e2fsck`.

## Wiederholungen verhindern

Die meisten Vorfälle beginnen, wenn das Persistenzgerät während des Betriebs voll läuft. Verringern Sie das
Risiko mit folgenden Maßnahmen:

- Halten Sie eine freie Reserve mit dem `perchreserve`-Boot-Parameter vor (Standard:
  256 MiB). Neue und wachsende Container verbrauchen diese Reserve nie, und MiniOS warnt beim Booten,
  wenn der freie Speicher auf die Reserve sinkt. Erhöhen Sie diesen Wert auf kleinen oder stark genutzten
  Geräten, zum Beispiel `perchreserve=1024`.
- Löschen Sie alte oder ungenutzte Sitzungen, bevor das Gerät voll wird.
- Bevorzugen Sie eine `raw`-Sitzung mit fester Größe, wenn Sie einen vorhersehbaren Speicherbedarf benötigen, damit
das Wachstum das Gerät nicht unerwartet erschöpft.
- Fahren Sie das System sauber herunter. Ein abruptes Ausschalten bei vollem Gerät ist die häufigste
  Ursache dafür, dass ein Container später nicht mehr eingehängt werden kann.
