# Verwendung von Drive Utility

Drive Utility ist ein grafisches Tool zum Schreiben von MiniOS-ISO-Abbildern auf USB-Laufwerke.

**Installation:** In MiniOS standardmäßig enthalten, für andere Distributionen siehe https://github.com/minios-linux/driveutility

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße (für das Schreiben von MiniOS)

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und empfohlene Laufwerksgrößen.

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

## Automatische Änderungspersistenz

Beim Schreiben von MiniOS mit Drive Utility wird eine exakte Kopie des ISO-Abbilds erstellt. MiniOS erkennt die verwendete Methode automatisch und konfiguriert die Änderungspersistenz beim ersten Start.

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Für eine präzise Persistenzkonfiguration können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf Partition (wenn freier Speicher vorhanden)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatzgröße für Daten in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
