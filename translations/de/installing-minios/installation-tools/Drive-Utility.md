---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Laufwerksprogramm

Laufwerksprogramm ist ein grafisches Tool zum Schreiben von MiniOS-ISO-Abbildern auf USB-Laufwerke.

**Installation:** Standardmäßig in MiniOS enthalten, für andere Distributionen siehe https://github.com/minios-linux/driveutility

## Wichtig

**Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße (für das Schreiben von MiniOS)

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und empfohlene Laufwerksgrößen.

### Unterstützte Dateisysteme

- **FAT32**: maximale Kompatibilität
- **NTFS**: Windows-Kompatibilität
- **EXT4**: empfohlen für Linux

## Laufwerksprogramm starten

**Über das Anwendungsmenü:**
1. Menü öffnen → System → "Laufwerksprogramm"

**Über das Terminal:**
```bash
driveutility
```

## Bootfähigen USB-Stick erstellen

1. **"Write"-Modus** im Hauptfenster des Programms auswählen
2. **MiniOS-ISO-Datei auswählen:**
   - Klicken Sie auf die Schaltfläche "Durchsuchen" neben dem Feld "Quelle"
   - Suchen und wählen Sie die heruntergeladene MiniOS.iso-Datei aus
3. **Ziel-Laufwerk auswählen:**
   - Wählen Sie Ihr USB-Laufwerk aus der Geräteliste
   - Überprüfen Sie die Auswahl anhand von Größe und Modell
4. **Schreibvorgang starten:**
   - Klicken Sie auf "Write"
   - Bestätigen Sie den Vorgang – alle Daten auf dem Laufwerk werden gelöscht
5. **Warten Sie auf den Abschluss** – der Vorgang dauert einige Minuten

## Ergebnis und Persistenz

Der Schreibmodus führt einen Rohdaten-Image-Schreibvorgang durch: Das ISO-Layout wird auf das gesamte Zielgerät kopiert. Es wird keine ext4-Partition im ungenutzten Speicherbereich erstellt, keine Persistenz-Sitzung angelegt und auch keine MiniOS-Installationsprogramm-Bereitstellung durchgeführt. Die oben genannten Dateisystemoptionen gelten für Laufwerksprogramm-Operationen, die ein Dateisystem formatieren, nicht für das Partitionslayout, das durch einen ISO-Schreibvorgang kopiert wird.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin geeigneter beschreibbarer Speicher benötigt. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie sich auf gespeicherte Änderungen verlassen.
