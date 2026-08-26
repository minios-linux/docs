---
updated: 2026-08-26
---

# Verwendung von Ventoy

Ventoy ist ein beliebtes Tool zum Erstellen bootfähiger USB-Sticks, mit dem Sie mehrere ISO-Dateien auf einem Gerät speichern und von jeder beliebigen starten können.

## Wichtig

**Warnung:** Eine falsche Geräteauswahl führt zu Datenverlust! Überprüfen Sie immer das ausgewählte Laufwerk und sichern Sie wichtige Daten.

**Anforderung an den Boot-Modus:** Damit MiniOS mit Ventoy korrekt funktioniert, MÜSSEN Sie beim Start **GRUB2-Modus** auswählen oder Ihre ISO-Datei mit dem Suffix `VTGRUB2` umbenennen (z. B. `minios-standard-amd64_VTGRUB2.iso`), um den GRUB2-Modus automatisch zu erzwingen.

## Laufwerksanforderungen

### Laufwerksgröße

Siehe [Hardware-Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für detaillierte Systemanforderungen und Laufwerksgrößen.

## Ventoy installieren

### Methode 1: Standardinstallation

1. **Ventoy herunterladen** von der [offiziellen Website](https://www.ventoy.net/)
2. **Ventoy-Installer ausführen** und das USB-Laufwerk auswählen
3. **Ventoy auf dem Laufwerk installieren** (alle Daten werden gelöscht)
4. **Die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Laufwerks kopieren

Dadurch entsteht ein Multiboot-Medium für ISO-Dateien: Ventoy speichert die ISO als Datei auf seiner Datenpartition und stellt sie beim Booten bereit. Es handelt sich nicht um ein direktes Schreiben eines MiniOS-Abbilds oder eine Installation mit dem MiniOS-Installer.

### Methode 2: Installation mit separater Datenpartition (Empfohlen)

1. **Laden Sie Ventoy** von der [offiziellen Website](https://www.ventoy.net/) herunter
2. **Starten Sie das Ventoy-Installationsprogramm** und wählen Sie Ihr USB-Laufwerk aus
3. **Aktivieren Sie während der Installation die Option "Reserve Space"**, um eine zusätzliche Partition zu erstellen
4. **Installieren Sie Ventoy** auf dem Laufwerk
5. **Kopieren Sie die MiniOS-ISO-Datei** in das Stammverzeichnis des USB-Laufwerks
6. **Erstellen Sie eine ext4-Partition** im reservierten Bereich mit dem Label `persistence`

Dies stellt einen möglichen Speicherort für Persistenz bereit, aber das bloße Erstellen der Partition aktiviert die Persistenz oder eine Sitzung noch nicht.

## Integration mit MiniOS

MiniOS unterstützt das Erkennen einer von Ventoy bereitgestellten ISO. Quellenerkennung und Persistenz-Auswahl sind getrennt; Ventoy selbst aktiviert keine MiniOS-Persistenz.

### Persistenz

Persistenz wird nur aktiviert, wenn ein Boot-Eintrag oder eine Kernel-Befehlszeile dies anfordert. Die Aktivierung hängt dann von einem kompatiblen, beschreibbaren Speicherort und einer nutzbaren Sitzung ab; eine Standardinstallation von Ventoy garantiert nicht, dass beides automatisch erstellt wird. Siehe [Boot-Modi](/configuration/Boot-Modes.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie sich auf gespeicherte Änderungen verlassen.

## MiniOS mit Ventoy verwenden

### Startvorgang

Nachdem Sie Ventoy installiert und die MiniOS-ISO-Datei auf das Laufwerk kopiert haben:

1. **Vom USB-Laufwerk booten** – wählen Sie es im BIOS/UEFI aus
2. **MiniOS** aus der Liste der verfügbaren ISO-Dateien im Ventoy-Menü auswählen
3. **WICHTIG: GRUB2-Modus auswählen**, wenn Ventoy dazu auffordert
4. **Warten Sie, bis MiniOS geladen ist**

### **Anforderungen an den Ventoy-Bootmodus**

**Damit MiniOS korrekt funktioniert:**
- **GRUB2-Modus** – erforderlich für den ordnungsgemäßen Betrieb von MiniOS

**Alternative Lösung:**
- Suffix `VTGRUB2` zum ISO-Dateinamen hinzufügen (z. B. `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Dadurch verwendet Ventoy automatisch den GRUB2-Modus, ohne nachzufragen
