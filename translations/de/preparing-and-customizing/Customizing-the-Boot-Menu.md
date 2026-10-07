---
updated: 2026-10-06
---

# Anpassen des Boot-Menüs

MiniOS Boot-Menüs bieten praktische Einträge für gängige Live-Boot-Modi. In dieser Anleitung erfahren Sie, wie Sie diese Einträge auswählen und bearbeiten können.

## Überblick

MiniOS Images können je nach Firmware, Image-Layout und Build entweder GRUB oder Syslinux verwenden. Die Menüstruktur, Bearbeitungstasten, Sprachunterstützung und verfügbaren Einträge unterscheiden sich möglicherweise. Der Bootloader übergibt letztlich eine Kernel-Befehlszeile an das gleiche initrd; siehe [Boot-Modi](/using-minios/Boot-Modes) für die resultierende Quelle, Persistenz, RAM-Kopie und das Verhalten bei Medienabhängigkeit.

## Boot-Menü-Optionen

Das bereitgestellte Image bietet in der Regel folgende Auswahlmöglichkeiten, wobei Titel, Verfügbarkeit, Reihenfolge und Standardauswahl je nach Image variieren können:

| Menüauswahl | Typischer initrd-Selektor | Zweck |
|---|---|---|
| MiniOS starten | `perchdir=resume` | Starten Sie die standardmäßig kompatible Sitzung und erlauben Sie unter den dokumentierten Bedingungen das Erstellen einer neuen Sitzung. |
| Neue Sitzung beginnen | `perchdir=setup` | Öffnet die Auswahl für das Persistenz-Backend und erstellt eine zusätzliche nummerierte Sitzung, während bestehende Sitzungen erhalten bleiben. |
| Gespeicherte Sitzung auswählen | `perchdir=ask` | Wählen Sie interaktiv eine vorhandene gespeicherte Sitzung aus; bei leerem Speicher startet MiniOS denselben Einrichtungsprozess, sodass die erste Sitzung erstellt werden kann. |
| Ohne Speichern starten | kein Persistenz-Selektor | Verwenden Sie eine temporäre beschreibbare Schicht in RAM. |
| Aus dem RAM ausführen | `toram` | Kopieren Sie MiniOS Systemdaten nach RAM; mit Persistenz kopiert der Standard `perchtoram=trim` die ausgewählte unterstützte Sitzung separat. |

Dies sind Selektoren und keine Garantie dafür, dass der Speicher beschreibbar ist, eine Sitzung kompatibel ist, RAM ausreicht oder das Quellmedium entfernt wurde. Siehe [Boot-Modi](/using-minios/Boot-Modes) für Verhalten und Kombinationen, [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für Sonderfälle der Selektoren und [Performance-Optimierung](/maintenance-and-recovery/Performance) für RAM und I/O-Abwägungen.

## Verwendung des Boot-Menüs

### Navigation im Menü

- Verwenden Sie die **Pfeiltasten** , um zwischen den Optionen zu wechseln
- Drücken Sie **Enter** , um eine Option auszuwählen
- Drücken Sie **Esc** , um zum vorherigen Menü zurückzukehren (in GRUB)
- Die automatische Auswahl und die Timeout-Dauer hängen von der aktiven Menü-Konfiguration ab; manche Menüs warten unbegrenzt

### Sprachauswahl (GRUB)

Wenn Ihr MiniOS USB-Stick mehrere Sprachen unterstützt:
1. Auf dem ersten Bildschirm werden Sprachoptionen angezeigt
2. Wählen Sie Ihre bevorzugte Sprache aus
3. Das Boot-Menü erscheint in der gewählten Sprache
4. Die Auswahl kann auch Locale-Einstellungen an den weiteren Startvorgang übergeben, garantiert aber nicht, dass jede Boot- oder Anwendungsnachricht übersetzt wird

**Wichtig:** Das mehrsprachige Menü überschreibt alle Locale-Einstellungen, die in `config.conf` angegeben sind. Die im Boot-Menü gewählte Sprache hat Vorrang vor vorkonfigurierten Locale-Einstellungen. Siehe **[Konfigurationsdatei](/reference/configuration/config.conf)** und **[live-config](/reference/configuration/live-config)** für Details zu den Systemkonfigurationsdateien.

## Boot-Optionen anpassen

### Boot-Parameter temporär bearbeiten

Sie können Boot-Optionen für eine einzelne Sitzung ändern:

**In GRUB:**
1. Wählen Sie die Menüoption aus, die Sie bearbeiten möchten
2. Drücken Sie **'e'** zum Bearbeiten
3. Gehen Sie zur Zeile, die mit `linux`
4. Fügen Sie am Ende der Zeile Parameter hinzu oder ändern Sie diese
5. Drücken Sie **Strg+X** oder **F10** , um mit Ihren Änderungen zu booten

**In SYSLINUX:**
1. Wählen Sie die gewünschte Menüoption aus
2. Drücken Sie **Tab** , bevor Sie Enter drücken
3. Fügen Sie Parameter zur angezeigten Befehlszeile hinzu
4. Drücken Sie **Enter** , um zu booten

### Häufige Änderungen an Boot-Parametern

- `debug` - Ausführliche Boot-Meldungen anzeigen (hilfreich zur Fehlerbehebung)
- `toram=trim` - Das gefilterte Modulpaket und die erforderlichen Daten nach RAM kopieren
- `perchsize=2000` - Sitzungspeichergröße auf 2GB festlegen (nach Bedarf anpassen)
- `locales=ru_RU.UTF-8` - Eine bestimmte Sprache/Locale anfordern

Eine vollständige Liste aller verfügbaren Boot-Parameter finden Sie unter **[Boot-Parameter](/reference/Boot-Parameters)**.

## Speicherorte der Konfigurationsdateien

### Auf Ihrem MiniOS USB-Stick

- **GRUB-Konfiguration:** `/minios/boot/grub/grub.cfg`
- **SYSLINUX-Konfiguration:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot-Images:** `/minios/boot/bootlogo.png`
- **Sprachdateien:** `/minios/boot/grub/locale/`

### Im laufenden System

- **Aktuelle Boot-Parameter:** `/proc/cmdline`
- **MiniOS Datenverzeichnis:** `/run/initramfs/memory/data/minios/`

### Konfigurationsdateien bearbeiten

**Warnung:** Bearbeiten Sie Boot-Konfigurationsdateien nur, wenn Sie wissen, was Sie tun. Falsche Änderungen können dazu führen, dass Ihr USB-Stick nicht mehr bootet.

**So bearbeiten Sie die GRUB-Konfiguration:**
1. Mounten Sie Ihren MiniOS USB-Stick
2. Navigieren Sie zu `/minios/boot/grub/`
3. Bearbeiten Sie `grub.cfg` mit einem Texteditor
4. Speichern Sie und werfen Sie den USB-Stick sicher aus

**Häufige Änderungen:**
- Timeout-Direktive im aktiven GRUB- oder Syslinux-Menü anpassen
- Ändern Sie `set default=0` , um die Standardmenüoption zu ändern
- Eigene Menüeinträge hinzufügen
