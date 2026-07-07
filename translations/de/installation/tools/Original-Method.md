# Ursprüngliche Installationsmethode (Windows/Linux)

Die ursprüngliche MiniOS-Installationsmethode beinhaltet das direkte Kopieren der Systemdateien auf das Laufwerk und die Installation des Bootloaders. Diese Methode bietet maximale Flexibilität bei der Konfiguration und Kompatibilität mit verschiedenen Medientypen.

⚠️ **Hinweis**: Diese Methode funktioniert nur unter Windows und Linux, da der SYSLINUX-Bootloader verwendet wird.

## Wichtig

⚠️ **Warnung:** Falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und Laufwerksgrößen.

### Technische Anforderungen

- **Dateisysteme**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partitionsschema**: MBR
- ⚠️ **EFI-Boot**: Bei Verwendung von NTFS, exFAT oder ext2/3/4-Dateisystemen ist das Booten im EFI-Modus möglicherweise nicht verfügbar. Für EFI-Unterstützung wird FAT32 empfohlen.

## Bootfähiges USB-Laufwerk erstellen

### Schritt 1: Laufwerk vorbereiten

**Windows:**
1. Öffnen Sie die "Datenträgerverwaltung" (`Win+R` → `diskmgmt.msc`)
2. USB-Laufwerk suchen → Rechtsklick → "Volume löschen"
3. Rechtsklick auf nicht zugeordneten Speicherplatz → "Neues einfaches Volume"
4. Dateisystem wählen: FAT32 (empfohlen) oder NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Schritt 2: Dateien entpacken und kopieren

**ISO einbinden:**

*Windows:*
- Rechtsklick auf die ISO-Datei → "Bereitstellen"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Dateien kopieren:**
1. **Suchen Sie den Ordner `/minios/`** in der eingebundenen ISO
2. **Kopieren Sie den gesamten Ordner `/minios/`** in das Stammverzeichnis des USB-Laufwerks

### Schritt 3: Bootloader installieren

Navigieren Sie zum Ordner `/minios/boot/` auf dem Laufwerk und führen Sie das Installationsprogramm aus:

**Windows:**
- Führen Sie `bootinst.bat` **als Administrator** aus

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Automatische Änderungsspeicherung

Beim ersten Start prüft MiniOS den Dateisystemtyp des Laufwerks und versucht, den optimalen Modus für die Änderungsspeicherung zu verwenden:

- **ext2/3/4, Btrfs**: versucht, den `native`-Modus (direktes Speichern) zu verwenden
- **FAT32/NTFS**: verwendet den `dynfilefs`-Modus (dynamische Datei)
- Wenn der native Modus nicht verfügbar ist, wird automatisch auf dynfilefs umgeschaltet

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Wenn eine präzise Konfiguration der Änderungsspeicherung erforderlich ist, können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf der Partition (für ext4)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe  
- `perchsize=8000` – Speicherplatz für Daten in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
