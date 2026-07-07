# Verwendung des MiniOS Installers

Der MiniOS Installer ist ein grafisches Tool zur Installation von MiniOS auf Festplatten oder USB-Laufwerken mit UEFI/BIOS-Unterstützung und Kompatibilität zu mehreren Dateisystemen.

## Wichtig

⚠️ **Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Gerät und sichern Sie wichtige Daten.

## Anforderungen an das Laufwerk

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und empfohlene Laufwerksgrößen.

### Unterstützte Dateisysteme

- **ext4** (empfohlen für Linux)
- **Btrfs** (modernes Dateisystem mit Snapshots)
- **FAT32** (maximale Kompatibilität)
- **NTFS** (Windows-Kompatibilität)

## Installation erstellen

### MiniOS Installer starten

**Über das Anwendungsmenü:**
1. Menü öffnen → System → "MiniOS installieren"

**Über das Terminal:**
```bash
sudo minios-installer
```

### Installationsvorgang

1. **Systemeinstellungen konfigurieren (optional, aber empfohlen):**
   - Klicken Sie auf die Schaltfläche **"MiniOS vor der Installation konfigurieren"**
   - Legen Sie Ihre Einstellungen fest:
     - Systemsprache und Region
     - Zeitzone und Tastaturlayout  
     - Benutzerkonten und Passwörter
     - Hostname und Systemdienste
   - Speichern und Konfigurator schließen
   
2. **Zielgerät auswählen:**
   - Wählen Sie eine Festplatte oder ein USB-Laufwerk aus der Liste
   - Überprüfen Sie Größe und Modell des Geräts
   
3. **Dateisystem auswählen:**
   - **ext4**: empfohlen für die meisten Anwendungsfälle
   - **Btrfs**: für fortgeschrittene Nutzer
   - **FAT32**: für maximale Kompatibilität
   
4. **Löschen des Datenträgers bestätigen:**
   - Alle Daten auf dem ausgewählten Gerät werden gelöscht
   - Überprüfen Sie die Geräteauswahl sorgfältig
   
5. **Installation starten:**
   - Klicken Sie auf "Installieren"
   - Warten Sie, bis der Vorgang abgeschlossen ist
   
6. **Abschluss:**
   - System neu starten
   - LiveUSB/LiveCD entfernen
   - **Ergebnis:** Das System startet mit Ihren vorkonfigurierten Einstellungen

## Vorkonfiguration vor der Installation

### Vorteile der Nutzung des MiniOS Konfigurators vor der Installation

**Empfohlener Ablauf für neue Nutzer:**

1. **Einmalige Einrichtung**: Alle Systemeinstellungen vor der Installation konfigurieren
2. **Sofort einsatzbereit**: Das installierte System startet mit korrekter Sprache, Tastatur und Benutzereinstellungen
3. **Kein Nacharbeiten**: Manuelle Konfiguration nach dem ersten Start entfällt
4. **Konsistentes Erlebnis**: Gleiche Einstellungen über alle Installationen hinweg

**Verfügbare Konfigurationsoptionen:**
- **🌍 Lokalisierung**: Systemsprache, Region und Zeitzone
- **⌨️ Eingabe**: Tastaturlayouts und Umschaltoptionen  
- **👤 Konten**: Benutzername, vollständiger Name, Passwörter und Benutzergruppen
- **🖥️ System**: Hostname, aktivierte/deaktivierte Dienste
- **🔒 Sicherheit**: Sicheres Passwort vor dem Onlinegehen einrichten

**Einfacher Ablauf:**
- Einmalig Einstellungen vor der Installation festlegen
- MiniOS mit Ihren individuellen Einstellungen installieren
- In ein vollständig konfiguriertes System starten

## Automatische Änderungsspeicherung

Nach der Installation erstellt der MiniOS Installer ein System auf dem ausgewählten Gerät:

- **UEFI/BIOS-Kompatibilität**: Automatische Erstellung der erforderlichen Boot-Partitionen
- **Änderungsspeicherung**: Volle Unterstützung für MiniOS-Persistenzmodi
- **Dateisysteme**: Unterstützung für ext4, Btrfs, FAT32, NTFS

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Für eine präzise Persistenz-Konfiguration können Boot-Parameter verwendet werden:

- `perchmode=native` – Direktes Speichern auf Partition (wenn freier Speicherplatz vorhanden)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe
- `perchsize=8000` – Speicherplatzgröße für Daten in MB

Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).
