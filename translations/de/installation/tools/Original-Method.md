# Ursprüngliche Installationsmethode (Windows/Linux, Legacy)

Diese veraltete MiniOS-Installationsmethode beinhaltet das direkte Kopieren der Systemdateien auf das Laufwerk und die Installation des Bootloaders. Bevorzugen Sie eine aktuelle Methode aus [MiniOS installieren](/installation/Installing-MiniOS.md), es sei denn, ein dateibasiertes Layout ist ausdrücklich erforderlich.

**Hinweis:** Diese Methode funktioniert nur unter Windows und Linux, da der SYSLINUX-Bootloader verwendet wird.

## Wichtig

**Warnung:** Dieses Verfahren partitioniert und formatiert das ausgewählte Gerät neu. Es wirkt sich auf das gesamte Gerät aus und ist nicht nur auf die aktuell sichtbaren Dateien beschränkt. Sichern Sie wichtige Daten und überprüfen Sie den exakten Gerätepfad, das Modell, die Kapazität, die Partition und den Einhängepunkt, bevor Sie `fdisk`, `mkfs` oder `bootinst` ausführen. Trennen Sie nach Möglichkeit andere Wechseldatenträger.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

### Technische Anforderungen

- **Dateisysteme**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partitionsschema**: MBR
- **EFI-Boot**: Bei Verwendung von NTFS, exFAT oder ext2/3/4-Dateisystemen ist das Booten im EFI-Modus möglicherweise nicht verfügbar. Für EFI-Unterstützung wird FAT32 empfohlen.

## Erstellen eines bootfähigen USB-Laufwerks

### Schritt 1: Laufwerk vorbereiten

**Windows:**
1. Öffnen Sie die "Datenträgerverwaltung" (`Win+R`, dann `diskmgmt.msc`)
2. Überprüfen Sie das USB-Gerät anhand der Datenträgernummer, des Modells und der Kapazität. Fahren Sie nicht fort, wenn Sie sich bei einem Detail unsicher sind.
3. Klicken Sie mit der rechten Maustaste auf das Volume und wählen Sie "Volume löschen"
4. Klicken Sie mit der rechten Maustaste auf den nicht zugeordneten Speicherplatz und wählen Sie "Neues einfaches Volume"
5. Wählen Sie das Dateisystem: FAT32 (empfohlen) oder NTFS

**Linux:**

Setzen Sie `TARGET_DISK` und `TARGET_PARTITION` auf die exakten Pfade, nachdem Sie das Gerätemodell und die Kapazität in `lsblk` abgeglichen haben. Der Befehl `fdisk` überschreibt die Partitionstabelle auf dem gesamten Zieldatenträger. Führen Sie nur einen `mkfs`-Befehl für das gewünschte Dateisystem aus.

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
- Klicken Sie mit der rechten Maustaste auf die ISO-Datei und wählen Sie "Bereitstellen"

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
1. **Suchen Sie den Ordner `/minios/`** im eingebundenen ISO-Image
2. **Kopieren Sie den gesamten Ordner `/minios/`** in das Stammverzeichnis des USB-Laufwerks

Unter Linux ist das Ziel-Stammverzeichnis im obigen Beispiel `/mnt/minios-target`. Vergewissern Sie sich, dass `findmnt --mountpoint /mnt/minios-target` genau die in Schritt 1 gewählte Partition anzeigt, bevor Sie Dateien kopieren.

### Schritt 3: Bootloader installieren

Navigieren Sie zum Ordner `/minios/boot/syslinux/` auf dem Laufwerk und führen Sie das Installationsprogramm aus:

`bootinst` schreibt Boot-Code auf das Laufwerk, das vom Speicherort des Installers abgeleitet wird. Lesen Sie [Boot-Wiederherstellung](/administration/Boot-Recovery.md), bevor Sie den Boot-Code ändern, und führen Sie das Installationsprogramm erst aus, nachdem das Gerät und der Einhängepunkt überprüft wurden.

**Windows:**
- Öffnen Sie das verifizierte USB-Laufwerk anhand des exakten Laufwerksbuchstabens, navigieren Sie zu `minios\boot\syslinux` und führen Sie `bootinst.bat` **als Administrator** aus.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Verwenden Sie keinen Platzhalter für den Einhängepunkt. Das Skript leitet das Zieldatenträgerlaufwerk von seinem eigenen Speicherort ab und schreibt den Boot-Code auf dieses Laufwerk.

## Ergebnis und Persistenz

Dieses Verfahren erstellt eine dateibasierte Live-Installation, indem der `minios/`-Baum und der Bootloader auf einem normalen Dateisystem abgelegt werden. Es handelt sich weder um ein direktes ISO-Abbild, noch um eine Multiboot-ISO-Installation oder eine MiniOS Installer-Installation.

Das gewählte Dateisystem beeinflusst, welche Persistenz-Backends funktionieren können, aktiviert jedoch keine Persistenz und garantiert auch nicht, dass eine Sitzung erstellt wird. Persistenz wird nur aktiviert, wenn ein Booteintrag oder eine Kernel-Befehlszeile dies anfordert, und erfordert weiterhin geeigneten beschreibbaren Speicher. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
