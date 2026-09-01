---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher ist ein praktisches plattformübergreifendes Programm zum Schreiben von ISO-Abbildern auf USB-Sticks. Geeignet für Windows, macOS und Linux.

## Wichtig

**Achtung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Vorbereitung

1. Laden Sie Balena Etcher von der [offiziellen Website](https://www.balena.io/etcher/) herunter
2. Installieren Sie das Programm auf Ihrem Betriebssystem
3. Schließen Sie das USB-Laufwerk an

## Bootfähigen USB-Stick erstellen

1. Starten Sie Balena Etcher
2. Wählen Sie das MiniOS ISO-Abbild aus:
   - Klicken Sie auf "Flash from file"
   - Geben Sie den Pfad zur ISO-Datei an
3. Wählen Sie das Ziel-USB-Laufwerk:
   - Klicken Sie auf "Select target"
   - Überprüfen Sie Modell und Größe des Geräts
4. Schreibvorgang starten:
   - Klicken Sie auf "Flash!"
   - Warten Sie, bis der Vorgang abgeschlossen ist (5–15 Minuten)

## Ergebnis und Persistenz

Etcher führt ein Raw-Image-Write durch: Das ISO-Layout wird auf das gesamte Zielgerät kopiert. Es wird keine ext4-Partition im ungenutzten Speicherbereich erstellt, keine Persistenz-Sitzung angelegt und auch keine MiniOS-Installationsprogramm-Installation durchgeführt.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin ein geeignetes beschreibbares Speichermedium benötigt. Siehe [Boot-Modi](/using-minios/Boot-Modes) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie sich auf gespeicherte Änderungen verlassen.
