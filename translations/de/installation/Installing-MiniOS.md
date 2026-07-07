# Installation von MiniOS

In diesem Leitfaden werden verschiedene Methoden zur Installation von MiniOS auf Speichermedien beschrieben.

## 1. MiniOS-ISO-Datei herunterladen

- Laden Sie die MiniOS-ISO-Datei von der offiziellen Website herunter.

## 2. Erstellen eines bootfähigen Laufwerks

Wählen Sie eine der folgenden Methoden:

- [Originalmethode](/installation/tools/Original-Method.md)
- [Mit Rufus](/installation/tools/Rufus.md) (Windows) (Empfohlen)
- [Mit UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Mit Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Empfohlen)
- [Mit Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Empfohlen)
- [Mit `dd`](/installation/tools/dd.md) (Linux/MacOS) (Empfohlen)
- [Mit Laufwerksdienstprogramm](/installation/tools/Drive-Utility.md) (Linux) (Empfohlen)
- [Mit MiniOS Installer](/installation/MiniOS-Installer.md) (Empfohlen, nur MiniOS)

## 3. Vom Laufwerk booten

1.  Starten Sie Ihren Computer neu.
2.  Wählen Sie das bootfähige Laufwerk im Boot-Menü Ihres Computers aus, um davon zu starten.

## 4. Hinweise

- Der Boot-Installer unterstützt kein Multiboot; nur MiniOS ist vom Laufwerk startbar.
- Ihre Festplatte muss das `msdos`-Partitionsschema verwenden (MBR statt GPT).
- Das Laufwerk muss mit einem der unterstützten Dateisysteme formatiert sein: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Hinweis:** Die ursprüngliche Installationsmethode wird nicht mehr als Hauptempfehlung geführt, da sie für Einsteiger schwierig sein kann. Bei Verwendung von Balena Etcher, `dd` oder dem Laufwerksdienstprogramm wird die Partition zum Speichern von Änderungen automatisch erstellt.
