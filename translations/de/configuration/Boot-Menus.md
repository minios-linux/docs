# MiniOS Boot-Menü-Anleitung

Die MiniOS-Boot-Menüs bieten praktische Einträge für gängige Live-Boot-Modi. Diese Anleitung erklärt, wie Sie diese Einträge auswählen und bearbeiten können.

## Übersicht

MiniOS-Images können je nach Firmware, Image-Layout und Build entweder GRUB oder Syslinux verwenden. Ihre Menüstrukturen, Bearbeitungstasten, Sprachunterstützung und verfügbaren Einträge sind nicht zwangsläufig identisch. Der Bootloader übergibt letztlich eine Kernel-Befehlszeile an das gleiche initrd; siehe [Boot-Modi](/configuration/Boot-Modes.md) für das resultierende Verhalten bezüglich Quelle, Persistenz, RAM-Kopie und Medienabhängigkeit.

## Boot-Menü-Optionen

Das bereitgestellte Image bietet üblicherweise folgende Auswahlmöglichkeiten, wobei Titel, Verfügbarkeit, Reihenfolge und Vorauswahl je nach Image variieren können:

| Menüauswahl | Typischer initrd-Selektor | Zweck |
|---|---|---|
| Vorherige Sitzung fortsetzen | `perchdir=resume` | Versucht die standardmäßig kompatible Sitzung zu starten und erlaubt unter den dokumentierten Bedingungen das Erstellen einer neuen Sitzung. |
| Neue Sitzung starten | `perchdir=new` | Erstellt eine neue, nummerierte persistente Sitzung. |
| Sitzung beim Start auswählen | `perchdir=ask` | Wählen Sie interaktiv eine vorhandene Sitzung aus oder fordern Sie eine neue an. |
| Frischer Start | kein Persistenz-Selektor | Verwendet eine temporäre beschreibbare Ebene. |
| In RAM kopieren | `toram` | Fordert den vollständigen RAM-Kopie-Pfad an. |

Dies sind Selektoren, keine Garantien dafür, dass der Speicher beschreibbar ist, eine Sitzung kompatibel ist, genügend RAM vorhanden ist oder das Quellmedium entfernt wurde. Siehe [Boot-Modi](/configuration/Boot-Modes.md) für Verhalten und Kombinationen, [Initrd-Persistenz](/configuration/Initrd-Persistence.md) für Spezialfälle bei Selektoren und [Performance-Optimierung](/administration/Performance-Optimization.md) für RAM- und I/O-Abwägungen.

## Verwendung des Boot-Menüs

### Navigation im Menü

- Verwenden Sie die **Pfeiltasten**, um zwischen den Optionen zu wechseln
- Drücken Sie **Enter**, um eine Option auszuwählen
- Drücken Sie **Esc**, um zum vorherigen Menü zurückzukehren (in GRUB)
- Die automatische Auswahl und die Dauer des Timeouts hängen von der aktiven Menükonfiguration ab; einige Menüs warten unbegrenzt

### Sprachauswahl (GRUB)

Wenn Ihr MiniOS-USB-Stick mehrere Sprachen unterstützt:
1. Der erste Bildschirm zeigt die verfügbaren Sprachen an
2. Wählen Sie Ihre bevorzugte Sprache aus
3. Das Boot-Menü erscheint in der gewählten Sprache
4. Die Auswahl kann auch Locale-Einstellungen an den weiteren Systemstart übergeben, garantiert jedoch nicht, dass jede Boot- oder Anwendungsnachricht übersetzt ist

⚠️ **Wichtig:** Das mehrsprachige Menü überschreibt alle Locale-Einstellungen, die in `config.conf` angegeben sind. Die im Boot-Menü gewählte Sprache hat Vorrang vor vorkonfigurierten Locale-Einstellungen. Weitere Informationen zu Systemkonfigurationsdateien finden Sie unter **[Konfigurationsdatei](/configuration/Configuration-File.md)** und **[live-config](/configuration/live-config.md)**.

## Boot-Optionen anpassen

### Boot-Parameter temporär bearbeiten

Sie können Boot-Optionen für eine einzelne Sitzung anpassen:

**In GRUB:**
1. Wählen Sie die Menüoption, die Sie bearbeiten möchten
2. Drücken Sie **'e'** zum Bearbeiten
3. Navigieren Sie zur Zeile, die mit `linux` beginnt
4. Fügen Sie am Ende der Zeile Parameter hinzu oder ändern Sie diese
5. Drücken Sie **Strg+X** oder **F10**, um mit den Änderungen zu booten

**In SYSLINUX:**
1. Wählen Sie die gewünschte Menüoption aus
2. Drücken Sie **Tab**, bevor Sie Enter drücken
3. Fügen Sie Parameter zur angezeigten Befehlszeile hinzu
4. Drücken Sie **Enter** zum Booten

### Häufige Änderungen an Boot-Parametern

- `debug` – Zeigt detaillierte Boot-Meldungen an (nützlich zur Fehlerbehebung)
- `toram=trim` – Kopiert das gefilterte Modulpaket und die erforderlichen Daten in den RAM
- `perchsize=2000` – Setzt die Sitzungsgröße auf 2GB (anpassbar)
- `locales=ru_RU.UTF-8` – Fordert eine bestimmte Sprache/Locale an

Eine vollständige Liste aller verfügbaren Boot-Parameter finden Sie unter **[Boot-Parameter](/configuration/Boot-Parameters.md)**.

## Speicherorte der Konfigurationsdateien

### Auf Ihrem MiniOS-USB-Stick

- **GRUB-Konfiguration:** `/minios/boot/grub/grub.cfg`
- **SYSLINUX-Konfiguration:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot-Images:** `/minios/boot/bootlogo.png`
- **Sprachdateien:** `/minios/boot/grub/locale/`

### Im laufenden System

- **Aktuelle Boot-Parameter:** `/proc/cmdline`
- **MiniOS-Datenverzeichnis:** `/run/initramfs/memory/data/minios/`

### Konfigurationsdateien bearbeiten

⚠️ **Warnung:** Bearbeiten Sie Boot-Konfigurationsdateien nur, wenn Sie wissen, was Sie tun. Falsche Änderungen können dazu führen, dass Ihr USB-Stick nicht mehr bootet.

**So bearbeiten Sie die GRUB-Konfiguration:**
1. Mounten Sie Ihren MiniOS-USB-Stick
2. Navigieren Sie zu `/minios/boot/grub/`
3. Bearbeiten Sie `grub.cfg` mit einem Texteditor
4. Speichern Sie die Datei und werfen Sie den USB-Stick sicher aus

**Häufige Änderungen:**
- Ändern Sie die Timeout-Direktive des aktiven GRUB- oder Syslinux-Menüs
- Ändern Sie `set default=0`, um die Standardmenüoption zu wechseln
- Fügen Sie eigene Menüeinträge hinzu
