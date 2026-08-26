# Verwendung von Balena Etcher

Balena Etcher ist ein praktisches plattformübergreifendes Programm zum Schreiben von ISO-Images auf USB-Sticks. Geeignet für Windows, macOS und Linux.

## Wichtig

⚠️ **Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Vorbereitung

1. Laden Sie Balena Etcher von der [offiziellen Website](https://www.balena.io/etcher/) herunter
2. Installieren Sie das Programm auf Ihrem Betriebssystem
3. Schließen Sie das USB-Laufwerk an

## Bootfähigen USB-Stick erstellen

1. Starten Sie Balena Etcher
2. Wählen Sie das MiniOS-ISO-Image aus:
   - Klicken Sie auf "Flash from file"
   - Geben Sie den Pfad zur ISO-Datei an
3. Wählen Sie das Ziel-USB-Laufwerk aus:
   - Klicken Sie auf "Select target"
   - Prüfen Sie das Gerätemodell und die Größe
4. Schreibvorgang starten:
   - Klicken Sie auf "Flash!"
   - Warten Sie, bis der Vorgang abgeschlossen ist (5–15 Minuten)

## Ergebnis und Persistenz

Etcher führt ein Raw-Image-Write durch: Das ISO-Layout wird auf das gesamte Zielgerät kopiert. Es wird keine ext4-Partition im ungenutzten Speicherbereich erstellt, keine Persistenz-Session angelegt und keine MiniOS Installer-Installation durchgeführt.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
