---
updated: 2026-08-31
---

# Manuelle dateibasierte Installation

Bei dieser MiniOS-Installationsmethode werden die Systemdateien auf ein normales Dateisystem kopiert und der Bootloader dort installiert, anstatt das ISO blockweise zu schreiben.
Der verbleibende Speicherplatz auf dem Dateisystem bleibt für normale Dateien verfügbar, sodass das Gerät weiterhin sowohl als normales USB-Laufwerk als auch als MiniOS-Bootmedium genutzt werden kann.

Diese Methode ist besonders nützlich, wenn Sie direkten Zugriff auf die MiniOS-Dateien, normale Datenspeicherung auf derselben Partition oder ein beschreibbares Layout für persistente Sitzungen wünschen. Sie verwendet den SYSLINUX-Bootloader und ist für Windows und Linux vorgesehen.

## Wichtig

**Achtung:** Dieses Verfahren partitioniert und formatiert das ausgewählte Gerät neu. Es wirkt sich auf das gesamte Gerät aus und nicht nur auf die aktuell sichtbaren Dateien. Sichern Sie wichtige Daten und überprüfen Sie den genauen Gerätepfad, das Modell, die Kapazität, die Partition und den Einhängepunkt, bevor Sie `fdisk`, `mkfs` oder `bootinst` ausführen. Trennen Sie nach Möglichkeit andere Wechseldatenträger.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und Laufwerksgrößen.

### Technische Anforderungen

- **Dateisysteme**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partitionsschema**: MBR
- **EFI-Boot**: Bei Verwendung von NTFS-, exFAT- oder ext2/3/4-Dateisystemen ist das Booten im EFI-Modus möglicherweise nicht möglich. Für EFI-Unterstützung wird FAT32 empfohlen.

## Erstellen eines bootfähigen USB-Sticks

### Schritt 1: Laufwerk vorbereiten

**Windows:**
1. "Datenträgerverwaltung" öffnen (`Win+R`, dann `diskmgmt.msc`)
2. USB-Gerät anhand der Datenträgernummer, des Modells und der Kapazität überprüfen. Fahren Sie nicht fort, wenn Sie sich bei einem Detail unsicher sind.
3. Mit der rechten Maustaste auf das Volume klicken und "Volume löschen" wählen
4. Mit der rechten Maustaste auf den nicht zugeordneten Bereich klicken und "Neues einfaches Volume" wählen
5. Dateisystem auswählen: FAT32 (empfohlen) oder NTFS

**Linux:**

Setzen Sie `TARGET_DISK` und `TARGET_PARTITION` erst auf die exakten Pfade, nachdem Sie Modell und Kapazität des Geräts in `lsblk` abgeglichen haben. Das Schreiben mit `fdisk` ersetzt die Partitionstabelle auf dem gesamten Zieldatenträger. Führen Sie nur einen `mkfs`-Befehl für das gewünschte Dateisystem aus.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Schritt 2: Dateien extrahieren und kopieren

**ISO einbinden:**

*Windows:*
- Mit der rechten Maustaste auf die ISO-Datei klicken und "Bereitstellen" wählen

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Dateien kopieren:**
1. **Suchen Sie den Ordner `/minios/`** im eingebundenen ISO
2. **Kopieren Sie den gesamten Ordner `/minios/`** in das Stammverzeichnis des USB-Sticks

Unter Linux ist das Ziel-Stammverzeichnis im obigen Beispiel `/mnt/minios-target`. Stellen Sie sicher, dass `findmnt --mountpoint /mnt/minios-target` genau die in Schritt 1 gewählte Partition anzeigt, bevor Sie Dateien kopieren.

### Schritt 3: Bootloader installieren

Wechseln Sie in den Ordner `/minios/boot/syslinux/` auf dem Laufwerk und führen Sie das Installationsprogramm aus:

`bootinst` schreibt Boot-Code auf die Festplatte, die aus dem Speicherort des Installers abgeleitet wird. Lesen Sie [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting), bevor Sie Boot-Code ändern, und führen Sie das Installationsprogramm erst aus, wenn das Gerät und der Einhängepunkt überprüft wurden.

**Windows:**
- Öffnen Sie den überprüften USB-Stick über den exakten Laufwerksbuchstaben, wechseln Sie zu `minios\boot\syslinux` und führen Sie `bootinst.bat` **als Administrator** aus.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Verwenden Sie kein Platzhalterzeichen für den Einhängepunkt. Das Skript ermittelt das Ziellaufwerk aus seinem eigenen Speicherort und schreibt den Boot-Code auf dieses Laufwerk.

## Ergebnis und Persistenz

Dieses Verfahren erstellt eine dateibasierte Live-Installation, indem der `minios/`-Baum und der Bootloader auf einem normalen Dateisystem abgelegt werden. Es handelt sich dabei weder um ein direktes Schreiben einer ISO-Datei, noch um ein Multiboot-Setup mit ISO-Dateien oder eine Bereitstellung über das MiniOS-Installationsprogramm.

Das gewählte Dateisystem beeinflusst, welche Persistenz-Backends funktionieren können, aber es aktiviert keine Persistenz und garantiert auch nicht, dass eine Sitzung erstellt wird. Persistenz wird nur aktiviert, wenn ein Booteintrag oder eine Kernel-Befehlszeile dies anfordert, und die Aktivierung erfordert weiterhin einen geeigneten beschreibbaren Speicher. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie sich auf gespeicherte Änderungen verlassen.
