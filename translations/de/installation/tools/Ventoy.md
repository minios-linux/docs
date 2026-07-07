# Verwendung von Ventoy

Ventoy ist ein beliebtes Tool zum Erstellen bootfähiger USB-Sticks, mit dem Sie mehrere ISO-Dateien auf einem Gerät speichern und von jeder beliebigen starten können.

## Wichtig

⚠️ **Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

⚠️ **Anforderung an den Boot-Modus:** Damit MiniOS mit Ventoy korrekt funktioniert, MÜSSEN Sie beim Booten den **GRUB2-Modus** auswählen oder Ihre ISO-Datei mit dem Suffix `VTGRUB2` umbenennen (z. B. `minios-standard-amd64_VTGRUB2.iso`), um den GRUB2-Modus automatisch zu erzwingen.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md#system-requirements) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Ventoy installieren

### Methode 1: Standardinstallation

1. **Ventoy herunterladen** von der [offiziellen Website](https://www.ventoy.net/)
2. **Ventoy-Installer ausführen** und Ihren USB-Stick auswählen
3. **Ventoy auf dem Laufwerk installieren** (alle Daten werden gelöscht)
4. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Sticks kopieren

Nach der Installation ist das Laufwerk einsatzbereit. MiniOS erstellt automatisch Speicherplatz zum Speichern von Änderungen.

### Methode 2: Installation mit separater Datenpartition (empfohlen)

1. **Ventoy herunterladen** von der [offiziellen Website](https://www.ventoy.net/)
2. **Ventoy-Installer ausführen** und Ihren USB-Stick auswählen  
3. **Die Option „Reserve Space“ aktivieren** während der Installation, um eine zusätzliche Partition zu erstellen
4. **Ventoy auf dem Laufwerk installieren**
5. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Sticks kopieren
6. **Eine ext4-Partition** im reservierten Bereich mit dem Label `persistence` erstellen

Diese Methode bietet schnellere Datenzugriffe und mehr Kontrolle über den Speicher.

## Integration mit MiniOS

MiniOS bietet integrierte Ventoy-Unterstützung und erkennt automatisch, wenn es in einer Ventoy-Umgebung ausgeführt wird. Das System konfiguriert die Änderungsübernahme automatisch, ohne dass eine zusätzliche Benutzereinstellung erforderlich ist.

### Automatische Änderungsübernahme

MiniOS erkennt automatisch, wenn es in einer Ventoy-Umgebung läuft, und konfiguriert die Änderungsübernahme:

- **Mit separater `persistence`-Partition**: Wird für direkte Datenspeicherung verwendet (Native-Modus, maximale Geschwindigkeit)
- **Bei Standardinstallation**: Erstellt eine dynamische Datei auf der Haupt-Ventoy-Partition (dynfilefs-Modus)

### Parameterkonfiguration (für fortgeschrittene Nutzer)

Wenn eine präzise Konfiguration erforderlich ist, können Boot-Parameter verwendet werden:

**Für separate `persistence`-Partition (alle Modi verfügbar):**
- `perchmode=native` – Direktes Speichern auf der Partition (am schnellsten)
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei
- `perchmode=raw` – Datei mit fester Größe

**Für Standard-Ventoy-Installation (zwei Modi verfügbar):**
- `perchmode=dynfilefs` – Dynamisch erweiterbare Datei (Standard, spart Speicherplatz)
- `perchmode=raw` – Datei mit fester Größe

**Allgemeine Parameter für Dateien:**
- `perchsize=8000` – Größe des Datenspeichers in MB

Weitere Details unter [Boot-Parameter](/configuration/Boot-Parameters.md).

## MiniOS mit Ventoy verwenden

### Bootvorgang

Nach der Installation von Ventoy und dem Kopieren der MiniOS-ISO-Datei auf das Laufwerk:

1. **Vom USB-Stick booten** – im BIOS/UEFI auswählen
2. **MiniOS auswählen** aus der Liste der verfügbaren ISO-Dateien im Ventoy-Menü
3. **⚠️ WICHTIG: GRUB2-Modus auswählen** wenn Ventoy dazu auffordert
4. **Warten bis zum Laden** – das System wird automatisch für den Betrieb konfiguriert

### **Ventoy Boot-Modus Anforderungen**

**Damit MiniOS korrekt funktioniert:**
- **GRUB2-Modus** – Für den fehlerfreien Betrieb von MiniOS erforderlich

**Alternative Lösung:**
- Suffix `VTGRUB2` zum ISO-Dateinamen hinzufügen (z. B. `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Dadurch verwendet Ventoy automatisch den GRUB2-Modus, ohne nachzufragen
