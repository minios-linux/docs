# Verwendung von UNetbootin

UNetbootin ist ein plattformübergreifendes Open-Source-Tool, mit dem Sie bootfähige USB-Laufwerke für verschiedene Linux-Distributionen erstellen können, einschließlich MiniOS.

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Installation von UNetbootin

1. **Laden Sie UNetbootin herunter** von der [offiziellen Website](https://unetbootin.github.io/)
2. **Installieren Sie das Programm** auf Ihrem System:
   - **Windows**: Führen Sie das Installationsprogramm als Administrator aus
   - **Linux**: Aus dem Repository installieren oder AppImage verwenden
   - **macOS**: Die Anwendung in den Programme-Ordner ziehen

## Bootfähigen USB-Stick erstellen

1. **Starten Sie UNetbootin** als Administrator/root
2. **Wählen Sie die Image-Quelle:**
   - Schalten Sie auf "Datenträger-Abbild"
   - Klicken Sie auf die "..."-Schaltfläche und wählen Sie die MiniOS-ISO-Datei aus
3. **Zielgerät auswählen:**
   - Wählen Sie Ihr USB-Laufwerk in der Liste "Laufwerk"
   - Stellen Sie sicher, dass das richtige Gerät ausgewählt ist
4. **Prozess starten:** Klicken Sie auf "OK"
5. **Warten Sie auf den Abschluss** – der Vorgang kann 10–20 Minuten dauern

## Ergebnis und Persistenz

UNetbootin extrahiert Dateien und installiert Boot-Dateien auf dem ausgewählten Dateisystem. Dadurch wird ein dateibasiertes Live-Medium erstellt, anstatt ein Rohabbild zu schreiben oder eine MiniOS Installer-Installation durchzuführen. Die Verwendung garantiert weder eine FAT32-Formatierung, EFI-Unterstützung noch Persistenz.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
