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
2. Überschreiben Sie keine aktiven `minios/changes` mit Quell-Sitzungen.
3. Kopieren Sie das gesamte `changes`-Verzeichnis, bevor Sie eine Wiederherstellung versuchen.
4. Führen Sie `e2fsck -y` nur auf einer zusätzlichen Kopie einer Sitzung aus.
5. Legen Sie fehlende `changes.dat.N`-Dateien nicht manuell an.

Wenn MiniOS aktuell mit Persistenz läuft und das Quellgerät eingehängt ist, kann die erste Kopie gefahrlos erstellt werden. Ersetzen Sie `session.conf` erst, nachdem MiniOS ohne Persistenz gebootet wurde.

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

Suchen Sie das installierte Hilfsprogramm. Je nach MiniOS-Image kann der offizielle Name `dynblk` oder der Kompatibilitätsname `@mount.dynfilefs` lauten:

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

Wählen Sie eine passende Sitzung, zum Beispiel Sitzung 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Geben Sie beim Wiederherstellen eines bestehenden Containers kein `-s` oder `perchsize` an. Die virtuelle Größe ist in den DynFileFS/dynblk-Metadaten gespeichert.

Ein erfolgreicher Mount stellt `virtual.dat` bereit:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Prüfen Sie das ext4-Dateisystem, ohne Änderungen vorzunehmen:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Hängen Sie es anschließend schreibgeschützt ein:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Sind die erwarteten Dateien sichtbar, kann die Sitzung wiederhergestellt werden.

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

## 6. Die Sitzung für den Bootvorgang wiederherstellen

Führen Sie diesen Schritt durch, nachdem Sie die persistente Sitzung heruntergefahren und MiniOS ohne `perch`, `perchdir` oder `perchmode` gebootet haben. Alternativ kann dies auch von einem anderen Linux-System aus erfolgen.

Kopieren Sie den wiederhergestellten Container in ein ungenutztes, numerisches Sitzungsverzeichnis. Durch die Verwendung einer neuen Nummer vermeiden Sie das Überschreiben einer aktuellen Sitzung:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Falls keine Dateisystemreparatur nötig war, kopieren Sie aus `$RECOVERY/$SESSION` statt aus `$REPAIR`.

Sichern und ersetzen Sie die Sitzungsmetadaten:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Die minimalen Metadaten lassen absichtlich Version, Edition und Union-Felder weg, damit veraltete Kompatibilitätsdaten MiniOS nicht dazu zwingen, eine weitere Sitzung zu erstellen.

Starten Sie MiniOS mit:

```text
perchdir=resume perchmode=dynfilefs
```

Fügen Sie beim ersten Wiederherstellungs-Boot kein `perchdir=new` oder `perchsize` hinzu.

## 7. Dateien wiederherstellen, ohne die Sitzung zu booten

Wenn sich der Container manuell mounten lässt, aber nicht als Boot-Sitzung genutzt werden kann, kopieren Sie die wichtigen Dateien vom schreibgeschützten Mount in eine neue Arbeitssitzung:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Fehlerreferenz

- `cannot open ... changes.dat.N`: Ein festgeschriebenes Segment fehlt. Kopieren Sie es erneut vom Quellgerät oder versuchen Sie eine andere Sitzung. Legen Sie kein leeres Segment an.
- `cannot read header`: Der DynFileFS/dynblk-Header ist beschädigt.
- `incompatible data format`: Das Hilfsprogramm und das Containerformat passen nicht zusammen.
- `virtual.dat` existiert, aber ext4 lässt sich nicht mounten: Überprüfen Sie eine Kopie mit `e2fsck`.
- Der Container lässt sich mounten, aber MiniOS erstellt eine neue Sitzung: Prüfen Sie, ob `session.conf` auf die wiederhergestellte Nummer verweist und `session_mode[N]=dynfilefs` enthält.

## Wiederholungen vermeiden

Die meisten Vorfälle beginnen, wenn das Persistenzgerät während der Nutzung voll läuft. Verringern Sie das Risiko mit folgenden Maßnahmen:

- Halten Sie mit dem Boot-Parameter `perchreserve` (Standard 256 MB) eine Reserve an freiem Speicherplatz vor. Neue und wachsende Container nutzen diesen Bereich nie, und MiniOS warnt beim Booten, wenn der freie Speicherplatz auf die Reserve sinkt. Erhöhen Sie den Wert auf kleinen oder stark genutzten Geräten, z. B. `perchreserve=1024`.
- Löschen Sie alte oder ungenutzte Sitzungen, bevor das Gerät voll ist.
- Bevorzugen Sie eine feste Größe (`raw`-Sitzung), wenn Sie einen vorhersehbaren Speicherbedarf benötigen, damit das Wachstum das Gerät nicht unerwartet erschöpft.
- Fahren Sie das System sauber herunter. Ein abruptes Ausschalten bei vollem Gerät ist die häufigste Ursache für einen Container, der später nicht mehr gemountet werden kann.
