# Verwendung von UNetbootin

UNetbootin ist ein plattformübergreifendes Open-Source-Tool, mit dem Sie bootfähige USB-Laufwerke für verschiedene Linux-Distributionen erstellen können, einschließlich MiniOS.

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und empfohlene Laufwerksgrößen.

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

## Automatische Änderungsspeicherung

UNetbootin formatiert das Laufwerk automatisch auf FAT32, sodass MiniOS den dynfilefs-Modus zum Speichern von Änderungen verwendet. Dies gewährleistet maximale Kompatibilität mit verschiedenen Systemen, einschließlich EFI-Boot-Unterstützung.

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Wenn eine präzise Konfiguration erforderlich ist, können Boot-Parameter verwendet werden:

- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei (Standard)
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatz für Daten in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
