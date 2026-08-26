---
updated: 2026-08-26
---

# Verwendung von Rufus (Windows)

Rufus ist ein beliebtes Tool für Windows, das beim Formatieren und Erstellen von bootfähigen USB-Laufwerken hilft.

## Wichtig

**Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

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

1. **Rufus** als Administrator starten
2. **USB-Laufwerk** im Feld „Gerät“ auswählen
3. **MiniOS ISO-Datei auswählen**:
   - Klicken Sie auf die Schaltfläche „AUSWÄHLEN“
   - Suchen und wählen Sie die heruntergeladene MiniOS ISO-Datei aus
4. **Schreibmodus wählen**:
   - Im Dialog „Hybrides ISO-Image erkannt“ **„Im ISO-Abbild-Modus schreiben“** auswählen
5. **Einstellungen konfigurieren**:
   - **Dateisystem**: FAT32 (empfohlen) oder NTFS
   - **Bei Auswahl von NTFS**: EFI-Modus-Boot kann nicht verfügbar sein
6. **Vorgang starten**: Auf die Schaltfläche „START“ klicken
7. **Formatierung bestätigen** – alle Daten auf dem Laufwerk werden gelöscht

## Ergebnis und Persistenz

Der DD-Modus führt ein Raw-Image-Write durch und kopiert das ISO-Layout auf das gesamte Zielgerät. Im ISO-Modus wird ein Dateisystem formatiert und der ISO-Inhalt extrahiert, um ein dateibasiertes Live-Medium zu erstellen. Keiner der Modi ist eine MiniOS Installer-Installation, und Rufus erstellt weder automatisch eine ext4-Partition noch eine Persistenzsitzung.

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert, und es wird weiterhin geeigneter beschreibbarer Speicher benötigt. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.
