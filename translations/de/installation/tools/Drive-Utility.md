---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Verwendung von Drive Utility

Drive Utility ist ein grafisches Tool zum Schreiben von MiniOS-ISO-Abbildern auf USB-Laufwerke.

**Installation:** In MiniOS standardmäßig enthalten, für andere Distributionen siehe https://github.com/minios-linux/driveutility

## Wichtig

**Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße (für das Schreiben von MiniOS)

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

### Unterstützte Dateisysteme

- **FAT32**: maximale Kompatibilität
- **NTFS**: Windows-Kompatibilität
- **EXT4**: empfohlen für Linux

## Starten von Drive Utility

**Über das Anwendungsmenü:**
1. Menü öffnen → System → „Drive Utility“

**Über das Terminal:**
```bash
driveutility
```

## Erstellen eines bootfähigen USB-Laufwerks

1. **„Write“-Modus** im Hauptfenster auswählen
2. **MiniOS-ISO-Datei auswählen:**
   - Klicken Sie auf die Schaltfläche „Durchsuchen“ neben dem Feld „Quelle“
   - Suchen und wählen Sie die heruntergeladene MiniOS.iso-Datei aus
3. **Ziellaufwerk auswählen:**
   - Wählen Sie Ihr USB-Laufwerk aus der Geräteliste
   - Überprüfen Sie die Auswahl anhand von Größe und Modell
4. **Schreibvorgang starten:**
   - Klicken Sie auf „Write“
   - Bestätigen Sie den Vorgang – alle Daten auf dem Laufwerk werden gelöscht
5. **Warten Sie auf den Abschluss** – der Vorgang dauert einige Minuten

## Ergebnis und Persistenz

Der Schreibmodus führt ein Raw-Image-Schreiben durch: Das ISO-Layout wird auf das gesamte Zielgerät kopiert. Es wird keine ext4-Partition im ungenutzten Speicher erstellt, keine Persistenz-Session angelegt und keine MiniOS Installer-Installation durchgeführt. Die oben genannten Dateisystemoptionen gelten für Laufwerksdienstprogramme, die ein Dateisystem formatieren, nicht für das Partitionslayout, das durch ein ISO-Schreiben kopiert wird.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
