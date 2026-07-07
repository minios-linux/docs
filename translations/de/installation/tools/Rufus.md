# Verwendung von Rufus (Windows)

Rufus ist ein beliebtes Tool für Windows, das beim Formatieren und Erstellen von bootfähigen USB-Laufwerken hilft.

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Rufus installieren

1. **Laden Sie Rufus herunter** von der [offiziellen Webseite](https://rufus.ie/)
2. **Starten Sie das Programm** – Rufus muss nicht installiert werden, es ist eine portable Anwendung

## Bootfähigen USB-Stick erstellen

Rufus bietet zwei Methoden, um MiniOS auf einen USB-Stick zu schreiben:

### Methode 1: DD-Modus (Empfohlen)

1. **Starten Sie Rufus** als Administrator
2. **Wählen Sie das USB-Laufwerk** im Feld „Gerät“ aus
3. **Wählen Sie die MiniOS-ISO-Datei**:
   - Klicken Sie auf die Schaltfläche „AUSWÄHLEN“
   - Suchen und wählen Sie die heruntergeladene MiniOS-ISO-Datei aus
4. **Schreibmodus wählen**:
   - Im Dialog „Hybrid-ISO-Image erkannt“ wählen Sie **„Im DD-Image-Modus schreiben“**
5. **Vorgang starten**: Klicken Sie auf die Schaltfläche „START“
6. **Aktion bestätigen** – alle Daten auf dem Laufwerk werden gelöscht
7. **Warten Sie auf den Abschluss** des Schreibvorgangs

### Methode 2: ISO-Modus (Alternative)

1. **Starten Sie Rufus** als Administrator
2. **Wählen Sie das USB-Laufwerk** im Feld „Gerät“ aus
3. **Wählen Sie die MiniOS-ISO-Datei**:
   - Klicken Sie auf die Schaltfläche „AUSWÄHLEN“
   - Suchen und wählen Sie die heruntergeladene MiniOS-ISO-Datei aus
4. **Schreibmodus wählen**:
   - Im Dialog „Hybrid-ISO-Image erkannt“ wählen Sie **„Im ISO-Image-Modus schreiben“**
5. **Einstellungen konfigurieren**:
   - **Dateisystem**: FAT32 (empfohlen) oder NTFS
   - ⚠️ **Bei Auswahl von NTFS**: Start im EFI-Modus ist möglicherweise nicht verfügbar
6. **Vorgang starten**: Klicken Sie auf die Schaltfläche „START“
7. **Formatierung bestätigen** – alle Daten auf dem Laufwerk werden gelöscht

## Automatische Änderungsspeicherung

MiniOS erkennt automatisch die verwendete Schreibmethode und konfiguriert die Änderungsspeicherung:

- **DD-Modus**: Wenn freier Speicherplatz vorhanden ist, wird eine ext4-Partition für maximale Performance erstellt
- **ISO-Modus**: Verwendet eine dynamische Datei zum Speichern von Änderungen

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Wenn eine präzise Konfiguration der Änderungsspeicherung erforderlich ist, können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf Partition (für DD-Modus)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatzgröße in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
