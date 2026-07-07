# Verwendung von Balena Etcher

Balena Etcher ist ein praktisches plattformübergreifendes Programm zum Schreiben von ISO-Images auf USB-Sticks. Geeignet für Windows, macOS und Linux.

## Wichtig

⚠️ **Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und Laufwerksgrößen.

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

## Automatische Änderungspersistenz

Beim ersten Start prüft MiniOS den Dateisystemtyp des Laufwerks und wählt den optimalen Persistenzmodus für Änderungen. Ist freier Speicherplatz vorhanden, erstellt das System automatisch eine ext4-Partition für maximale Performance.

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Wenn eine genaue Persistenzkonfiguration erforderlich ist, können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf der Partition (Standard, am schnellsten)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatz für Image-Dateien in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
