---
updated: 2026-08-26
---

# dd

`dd` ist ein vielseitiges Kommandozeilen-Tool zum bitgenauen Kopieren von Daten zwischen Dateien und Geräten. Am häufigsten wird es verwendet, um ISO-Abbilder auf USB-Sticks zu schreiben, Backups zu erstellen und zur Datenwiederherstellung.

## Wichtig

**Warnung:** Eine falsche Auswahl des Geräts führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und Laufwerksgrößen.

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

**Ersetzen:**
- `MiniOS.iso` – Pfad zu Ihrer ISO-Datei
- `/dev/sdX` – Ihr USB-Laufwerk (z. B. `/dev/sdb`)

## Ergebnis und Persistenz

`dd` führt ein Raw-Image-Write durch: Es kopiert das ISO-Layout auf das gesamte Zielgerät. Es erstellt keine ext4-Partition im ungenutzten Speicherplatz, richtet keine Persistenz-Sitzung ein und führt keine MiniOS-Installationsprogramm-Bereitstellung durch.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie sich auf gespeicherte Änderungen verlassen.
