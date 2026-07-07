# Verwendung des Befehls `dd`

`dd` ist ein vielseitiges Kommandozeilen-Tool zum bitgenauen Kopieren von Daten zwischen Dateien und Geräten. Am häufigsten wird es zum Schreiben von ISO-Abbildern auf USB-Sticks, zur Erstellung von Backups und zur Datenwiederherstellung eingesetzt.

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Vorbereitung

1. Identifizieren Sie Ihren USB-Stick:
   - **Linux:** `lsblk` oder `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Hängen Sie das Laufwerk aus:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Bootfähigen USB-Stick erstellen

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Ersetzen Sie:**
- `MiniOS.iso` – Pfad zu Ihrer ISO-Datei
- `/dev/sdX` – Ihr USB-Stick (z. B. `/dev/sdb`)

## Automatische Änderungspersistenz

Beim ersten Start prüft MiniOS den Dateisystemtyp des Laufwerks und wählt den optimalen Persistenzmodus für Änderungen. Wenn freier Speicherplatz vorhanden ist, erstellt das System automatisch eine ext4-Partition für maximale Performance.

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Für eine präzise Persistenzkonfiguration können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf Partition (Standard, am schnellsten)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatzgröße für Daten in MB bei Image-Dateien

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
