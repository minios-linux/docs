---
updated: 2026-08-28
---

# Anpassen des Boot-Menüs

MiniOS Boot-Menüs bieten praktische Einträge für gängige Live-Boot-Modi. In dieser Anleitung erfahren Sie, wie Sie diese Einträge auswählen und bearbeiten können.

## Übersicht

MiniOS-Abbilder können je nach Firmware, Image-Layout und Build entweder GRUB oder Syslinux verwenden. Ihre Menüstrukturen, Bearbeitungstasten, Sprachunterstützung und verfügbaren Einträge sind nicht zwangsläufig identisch. Der Bootloader übergibt letztlich eine Kernel-Befehlszeile an das gleiche initrd; siehe [Boot-Modi](/using-minios/Boot-Modes) für das resultierende Quellverhalten, Persistenz, RAM-Kopie und medienabhängiges Verhalten.

## Boot-Menüoptionen

Das bereitgestellte Abbild zeigt üblicherweise diese Auswahlmöglichkeiten, wobei Titel, Verfügbarkeit, Reihenfolge und Standardauswahl je nach Abbild variieren können:

| Menüauswahl | Typischer initrd-Selektor | Zweck |
|---|---|---|
| MiniOS starten | `perchdir=resume` | Die standardmäßige kompatible Sitzung ausprobieren und unter den dokumentierten Bedingungen das Erstellen eines Ersatzes erlauben. |
| Neue Sitzung starten | `perchdir=new` | Eine zusätzliche, nummerierte persistente Sitzung erstellen, während bestehende Sitzungen unverändert bleiben. |
| Gespeicherte Sitzung auswählen | `perchdir=ask` | Interaktiv eine vorhandene gespeicherte Sitzung auswählen. Verwenden Sie **Neue Sitzung starten** bei leerem Speicher. |
| Ohne Speicherung starten | Kein Persistenz-Selektor | Eine temporäre beschreibbare Ebene in RAM verwenden. |
| Aus RAM ausführen | `toram` | Den kompletten MiniOS-Datenbaum auf RAM kopieren und versuchen, das Quellmedium zu trennen. |

Dies sind Selektoren, keine Garantien dafür, dass der Speicher beschreibbar ist, eine Sitzung kompatibel ist, RAM ausreicht oder das Quellmedium getrennt wurde. Siehe [Boot-Modi](/using-minios/Boot-Modes) für Verhalten und Kombinationen, [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für Spezialfälle bei Selektoren und [Performance-Optimierung](/maintenance-and-recovery/Performance) für RAM und I/O-Abwägungen.

## Verwendung des Boot-Menüs

### Navigation im Menü

- Mit den **Pfeiltasten** zwischen den Optionen wechseln
- Mit **Enter** eine Option auswählen
- Mit **Esc** zum vorherigen Menü zurückkehren (bei GRUB)
- Automatische Auswahl und Timeout-Dauer hängen von der aktiven Menükonfiguration ab; manche Menüs warten unbegrenzt

### Sprachauswahl (GRUB)

Wenn Ihr MiniOS-USB-Stick mehrere Sprachen unterstützt:
1. Das erste Bildschirm zeigt die Sprachoptionen
2. Wählen Sie Ihre bevorzugte Sprache aus
3. Das Boot-Menü erscheint in der gewählten Sprache
4. Die Auswahl kann auch Locale-Einstellungen an den weiteren Systemstart übergeben, garantiert aber nicht, dass jede Boot- oder Anwendungsnachricht übersetzt ist

**Wichtig:** Das mehrsprachige Menü überschreibt alle Locale-Einstellungen, die in `config.conf` angegeben sind. Die im Boot-Menü gewählte Sprache hat Vorrang vor vorkonfigurierten Locale-Einstellungen. Details zu Systemkonfigurationsdateien finden Sie unter **[Konfigurationsdatei](/reference/configuration/config.conf)** und **[live-config](/reference/configuration/live-config)**.

## Boot-Optionen anpassen

### Boot-Parameter temporär bearbeiten

Sie können Boot-Optionen für eine einzelne Sitzung ändern:

**In GRUB:**
1. Wählen Sie die Menüoption, die Sie anpassen möchten
2. Drücken Sie **'e'** zum Bearbeiten
3. Navigieren Sie zur Zeile, die mit `linux` beginnt
4. Fügen Sie am Ende der Zeile Parameter hinzu oder ändern Sie diese
5. Drücken Sie **Strg+X** oder **F10**, um mit den Änderungen zu starten

**In SYSLINUX:**
1. Wählen Sie die gewünschte Menüoption
2. Drücken Sie **Tab**, bevor Sie Enter drücken
3. Fügen Sie Parameter in die erscheinende Befehlszeile ein
4. Drücken Sie **Enter** zum Starten

### Häufige Änderungen von Boot-Parametern

- `debug` – Zeigt detaillierte Boot-Meldungen an (nützlich zur Fehlerbehebung)
- `toram=trim` – Kopiert die gefilterte Modulauswahl und begrenzte erforderliche Daten in den RAM
- `perchsize=2000` – Legt die Sitzungsgröße auf 2GB fest (nach Bedarf anpassen)
- `locales=ru_RU.UTF-8` – Fordert eine bestimmte Sprache/Locale an

Eine vollständige Liste aller verfügbaren Boot-Parameter finden Sie unter **[Boot-Parameter](/reference/Boot-Parameters)**.

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

**Warnung:** Bearbeiten Sie Boot-Konfigurationsdateien nur, wenn Sie wissen, was Sie tun. Falsche Änderungen können dazu führen, dass Ihr USB-Stick nicht mehr bootet.

**So bearbeiten Sie die GRUB-Konfiguration:**
1. Mounten Sie Ihren MiniOS-USB-Stick
2. Navigieren Sie zu `/minios/boot/grub/`
3. Bearbeiten Sie `grub.cfg` mit einem Texteditor
4. Speichern Sie und entfernen Sie den USB-Stick sicher

**Häufige Änderungen:**
- Timeout-Direktive für das aktive GRUB- oder Syslinux-Menü anpassen
- `set default=0` ändern, um die Standardmenüoption zu setzen
- Eigene Menüeinträge hinzufügen
