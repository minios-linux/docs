# ISO neu erstellen

In dieser Anleitung erfahren Sie, wie Sie MiniOS-ISO-Abbilder mit den integrierten Tools neu erstellen und anpassen können. Egal, ob Sie schlanke Versionen erstellen, eigene Software hinzufügen oder angepasste Systeme verteilen möchten – mit diesen Tools können Sie Ihr Live-System ganz einfach in ein neues bootfähiges ISO umwandeln.

## Übersicht

MiniOS stellt leistungsstarke Werkzeuge bereit, um ISO-Abbilder direkt aus einem laufenden Live-System zu erstellen. Damit können Sie:

- **Unerwünschte Software entfernen**, um schlankere Distributionen zu bauen
- **Eigene Module hinzufügen** mit zusätzlicher Software
- **Spezialisierte Versionen erstellen** für bestimmte Anwendungsfälle
- **Angepasste Systeme verteilen** an andere Nutzer
- **Installationsmedien erstellen** mit Ihrer aktuellen Konfiguration

## Schnellstart

Der einfachste Weg, ein ISO aus Ihrem aktuellen System zu erstellen:

```bash
sudo sb2iso
```

Dies erzeugt `minios-YYYYMMDD_HHMM.iso` im aktuellen Verzeichnis mit allen geladenen Modulen.

## Hauptwerkzeug: sb2iso

**sb2iso** ist das zentrale Tool zum Neuaufbau von ISO-Abbildern. Es liest Ihr aktuelles Live-System und verpackt es in eine bootfähige ISO-Datei.

### Grundlegende Nutzung

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Befehlsoptionen

| Option | Beschreibung | Beispiel |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Schließt Dateien/Module aus, die dem Muster entsprechen | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Gibt den Ausgabedateinamen an | `--name minios_custom.iso` |
| `--menu TYPE` | Legt Menü-Sprache oder Typ fest | `--menu ru_RU` oder `--menu multilang` |
| `--help` | Zeigt Hilfeinformationen an | `--help` |
| `--version` | Zeigt die Version an | `--version` |

### Unterstützte Menütypen

- **multilang** (Standard) – Mehrsprachiges Menü mit Sprachauswahl
- **Sprachcodes** – Einsprachige Menüs: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Praxisbeispiele

### Erstellung schlanker Versionen

**Schwere Anwendungen entfernen:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Nur Textmodus-System erstellen:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Multimedia-Anwendungen entfernen:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Eigene Software hinzufügen

**Entwicklertools hinzufügen:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Spiele-Anwendungen hinzufügen:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### Sprachspezifische ISOs

**Russisches ISO erstellen:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Deutsches ISO erstellen:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Professionelle/Bildungs-Distributionen

**Bildungs-ISO mit Lernsoftware:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**Business-ISO:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Erweiterter Anpassungs-Workflow

### 1. System vorbereiten

Starten Sie mit einem sauberen MiniOS-System und passen Sie es an:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Eigene Module erstellen

Speichern Sie Ihre Änderungen als Module:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Module testen

Testen Sie Ihre Module, bevor Sie das finale ISO erstellen:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Finale ISO erstellen

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Arbeiten mit Modulen

### Modulnummern verstehen

Module werden in numerischer Reihenfolge geladen:
- **00-core** – Basissystem (immer enthalten)
- **01-kernel** – Kernel und Treiber
- **02-firmware** – Hardware-Firmware
- **03-gui-base** – Grundlegende GUI-Komponenten
- **04-desktop** – Desktop-Umgebung
- **05-apps** – Anwendungen
- **06+** – Zusätzliche Module

### Modulverwaltungsbefehle

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Ausschluss von Inhalten

Die Option `--exclude` verwendet reguläre Ausdrücke, um Dateipfade zu filtern. Häufige Muster:

### Anwendungsausschlüsse

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Systemkomponenten ausschließen

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Kombinierte Ausschlüsse

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Systemanforderungen

### sb2iso ausführen

- **System**: Muss von einem MiniOS-Live-System ausgeführt werden
- **Berechtigungen**: Root-Rechte erforderlich (`sudo`)
- **Arbeitsspeicher**: Ausreichend RAM für temporäre Dateien
- **Speicherplatz**: Freier Speicher für das Ausgabe-ISO (typischerweise 1–4 GB)

### Bootdateien erforderlich

**sb2iso** benötigt verfügbare Bootdateien. Wenn Sie das System in den RAM geladen haben, verwenden Sie:

```bash
# Boot with full RAM copy
toram=full
```

Oder stellen Sie sicher, dass die Bootdateien auf dem Originalmedium zugänglich sind.

## Fehlerbehebung

### Häufige Probleme

**"MiniOS-Quellverzeichnis nicht gefunden"**
- Stellen Sie sicher, dass Sie auf einem Live-MiniOS-System arbeiten
- Prüfen Sie, ob die Bootdateien verfügbar sind
- Versuchen Sie den Boot-Parameter `toram=full`

**"Erforderliche Datei nicht gefunden"**
- Bootdateien könnten fehlen
- Stellen Sie sicher, dass Sie ein vollständiges MiniOS-System verwenden

**ISO-Erstellung schlägt fehl**
- Prüfen Sie den verfügbaren Speicherplatz
- Stellen Sie sicher, dass Sie Schreibrechte besitzen
- Achten Sie darauf, dass keine Dateien während der Erstellung verwendet werden

**Modul nicht enthalten**
- Prüfen Sie, ob die Moduldatei existiert und lesbar ist
- Überprüfen Sie das Modulformat (.sb-Dateien)
- Stellen Sie sicher, dass genügend Speicherplatz für alle Module vorhanden ist

### Debug-Informationen

Für die Fehleranalyse den ausführlichen Modus aktivieren:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Best Practices

### ISO-Planung

1. **Sauber starten**: Beginnen Sie mit einem frischen MiniOS-System
2. **Gründlich testen**: Überprüfen Sie alle Anpassungen vor der ISO-Erstellung
3. **Änderungen dokumentieren**: Halten Sie alle Modifikationen fest
4. **Größe beachten**: Behalten Sie die ISO-Größe für den Verteilungszweck im Auge

### Modulorganisation

1. **Logische Gruppierung**: Verwandte Software in Modulen zusammenfassen
2. **Korrekte Nummerierung**: Geeignete Modulnummern verwenden
3. **Testen**: Jedes Modul einzeln testen
4. **Abhängigkeiten**: Modulabhängigkeiten verstehen

### Vorbereitung für die Verteilung

1. **Namenskonvention**: Aussagekräftige ISO-Namen verwenden
2. **Dokumentation**: Gebrauchsanleitung beilegen
3. **Sprachunterstützung**: Internationale Nutzer berücksichtigen
4. **Größenoptimierung**: Nicht benötigte Komponenten entfernen

## Integration mit anderen Tools

### Eigene Module erstellen

Bevor Sie ein ISO neu bauen, können Sie eigene Module erstellen:

- **apt2sb** – Module aus Paketinstallationen erstellen
- **script2sb** – Module mit eigenen Skripten erstellen
- **chroot2sb** – Module interaktiv erstellen
- **savechanges** – Aktuelle Systemänderungen speichern

Weitere Details finden Sie im Leitfaden [Module erstellen](/development/Creating-Modules.md).

### Aus dem Quellcode bauen

Für vollständige Anpassungen empfiehlt sich der Bau aus dem Quellcode:

- **minios-live** – Komplette Systeme von Grund auf bauen
- **minios-cmd** – Vereinfachte Build-Oberfläche

Siehe den Leitfaden [MiniOS bauen](/development/Building-MiniOS.md) für Quellcode-Builds.

## Fazit

Die ISO-Tools von MiniOS bieten eine leistungsstarke Möglichkeit, Linux-Systeme individuell anzupassen und weiterzugeben. Egal, ob Sie spezialisierte Distributionen erstellen, unerwünschte Software entfernen oder eigene Funktionen hinzufügen – mit diesen Tools können Sie Ihr Live-System einfach in ein professionelles ISO-Abbild verpacken.

Beginnen Sie mit einfachen Anpassungen und arbeiten Sie sich zu komplexeren Distributionen vor, sobald Sie mit dem Modulsystem und den verfügbaren Optionen vertraut sind.
