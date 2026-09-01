---
updated: 2026-08-26
---

# Ventoy

Ventoy ist ein beliebtes Tool zum Erstellen bootfähiger USB-Sticks, mit dem Sie mehrere ISO-Dateien auf einem Gerät speichern und von jeder einzelnen booten können.

## Wichtig

**Warnung:** Eine falsche Laufwerksauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

**Bootmodus-Anforderung:** Damit MiniOS mit Ventoy korrekt funktioniert, MÜSSEN Sie beim Booten den **GRUB2-Modus** auswählen oder Ihre ISO-Datei mit dem Suffix `VTGRUB2` umbenennen (z. B. `minios-standard-amd64_VTGRUB2.iso`), um den GRUB2-Modus automatisch zu erzwingen.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Ventoy installieren

### Methode 1: Standardinstallation

1. **Ventoy von der [offiziellen Website](https://www.ventoy.net/) herunterladen**
2. **Den Ventoy-Installer ausführen** und das USB-Laufwerk auswählen
3. **Ventoy auf dem Laufwerk installieren** (alle Daten werden gelöscht)
4. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Laufwerks kopieren

Dadurch wird ein Multiboot-Medium für ISO-Dateien erstellt: Ventoy behält die ISO als Datei auf seiner Datenpartition und präsentiert sie beim Booten. Es handelt sich nicht um ein direktes Schreiben eines MiniOS-Abbilds oder eine Bereitstellung über das MiniOS-Installationsprogramm.

### Methode 2: Installation mit separater Datenpartition (Empfohlen)

1. **Ventoy herunterladen** von der [offiziellen Website](https://www.ventoy.net/)
2. **Ventoy-Installer ausführen** und das gewünschte USB-Laufwerk auswählen
3. **Die Option "Reserve Space" aktivieren** während der Installation, um eine zusätzliche Partition zu erstellen
4. **Ventoy auf dem Laufwerk installieren**
5. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Laufwerks kopieren
6. **Eine ext4-Partition** im reservierten Bereich mit dem Label `persistence` anlegen

Dies bietet einen möglichen Speicherort für Persistenz, aber das Anlegen der Partition allein aktiviert keine Persistenz und erstellt keine Sitzung.

## Integration mit MiniOS

MiniOS unterstützt das Erkennen einer von Ventoy bereitgestellten ISO. Quellenerkennung und Persistenz-Auswahl sind getrennt; Ventoy selbst aktiviert die MiniOS-Persistenz nicht.

### Persistenz

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert. Die Aktivierung hängt dann von einem kompatiblen, beschreibbaren Speicherort und einer nutzbaren Sitzung ab; eine Standardinstallation von Ventoy garantiert nicht, dass beides automatisch erstellt wird. Siehe [Bootmodi](/using-minios/Boot-Modes) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie sich auf gespeicherte Änderungen verlassen.

## MiniOS mit Ventoy verwenden

### Booten

Nachdem Ventoy installiert und die MiniOS-ISO-Datei auf das Laufwerk kopiert wurde:

1. **Vom USB-Laufwerk booten** – im BIOS/UEFI das Laufwerk auswählen
2. **MiniOS auswählen** aus der Liste der verfügbaren ISO-Dateien im Ventoy-Menü
3. **WICHTIG: GRUB2-Modus auswählen**, wenn Ventoy dazu auffordert
4. **Warten, bis MiniOS geladen ist**

### **Ventoy Bootmodus-Anforderungen**

**Damit MiniOS korrekt funktioniert:**
- **GRUB2-Modus** – Erforderlich für den ordnungsgemäßen Betrieb von MiniOS

**Alternative Lösung:**
- Suffix `VTGRUB2` zum ISO-Dateinamen hinzufügen (z. B. `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Dadurch verwendet Ventoy automatisch den GRUB2-Modus, ohne nachzufragen
