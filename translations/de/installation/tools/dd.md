---
updated: 2026-08-26
---

# Verwendung des Befehls `dd`

`dd` ist ein vielseitiges Kommandozeilen-Tool zum bitgenauen Kopieren von Daten zwischen Dateien und Geräten. Am häufigsten wird es zum Schreiben von ISO-Abbildern auf USB-Sticks, zur Erstellung von Backups und zur Datenwiederherstellung eingesetzt.

## Wichtig

**Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

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

## Ergebnis und Persistenz

`dd` führt ein Raw-Image-Write durch: Das ISO-Layout wird auf das gesamte Zielgerät kopiert. Es wird keine ext4-Partition im ungenutzten Speicherbereich erstellt, keine Persistenz-Sitzung angelegt und keine MiniOS Installer-Installation durchgeführt.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
