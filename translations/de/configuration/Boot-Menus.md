# MiniOS Boot-Menü-Anleitung

MiniOS bietet ein leistungsstarkes Boot-Menü-System, mit dem Sie auswählen können, wie das System gestartet und betrieben wird. In dieser Anleitung werden die verfügbaren Startoptionen erklärt und wie Sie diese anpassen können.

## Übersicht

MiniOS verwendet GRUB als primären Bootloader und stellt eine grafische Oberfläche mit Mehrsprachunterstützung bereit. Auf älteren BIOS-Systemen kann alternativ SYSLINUX verwendet werden. Beide Bootloader bieten denselben Funktionsumfang mit leicht unterschiedlichen Oberflächen.

## Boot-Menü-Optionen

### 1. Vorherige Sitzung fortsetzen

**Was es macht:** Versucht, an Ihrer letzten Sitzung anzuknüpfen, passt sich jedoch automatisch an den verfügbaren Speicher an.

- **Wann verwenden:** Dies ist die Standardoption – geeignet für die meisten Nutzer in den meisten Situationen
- **Ablauf:** 
  - **Auf beschreibbaren Medien mit vorhandener Sitzung:** Stellt Ihre gespeicherten Dateien, Anwendungen und Einstellungen wieder her
  - **Auf beschreibbaren Medien ohne Sitzung:** Erstellt automatisch die erste Sitzung (Sitzung #1)
  - **Auf nur-lesbaren Medien (DVD, CD):** Startet wie „Neustart“, da kein Speicher verfügbar ist
  - **Bei inkompatibler Sitzung:** Erstellt eine neue Sitzung (z. B. bei Verwendung einer anderen MiniOS-Version)
  - Das System prüft automatisch die Kompatibilität und Speicherbegrenzungen
- **Ergebnis:** Sie erhalten immer ein funktionierendes System, das für Ihren Speichertyp optimiert ist

### 2. Neue Sitzung starten

**Was es macht:** Erstellt einen neuen Arbeitsbereich, wobei alle bestehenden Sitzungen erhalten bleiben.

- **Wann verwenden:** Wenn Sie eine saubere Umgebung für andere Arbeiten oder Tests benötigen
- **Ablauf:**
  - Erstellt eine neue nummerierte Sitzung (z. B. wenn Sie Sitzung 1 hatten, wird Sitzung 2 erstellt)
  - Startet mit einer frischen Desktop-Umgebung
  - Alle neuen Änderungen werden in der neuen Sitzung gespeichert
  - Alle bestehenden Sitzungen bleiben unverändert und können gewechselt werden
- **Hinweis:** Sie können zwischen Sitzungen über die Option „Sitzung beim Start auswählen“ wechseln

### 3. Sitzung beim Start auswählen

**Was es macht:** Zeigt ein interaktives Menü zur Auswahl einer bestehenden Sitzung oder zum Erstellen einer neuen Sitzung.

- **Wann verwenden:** Wenn Sie mehrere Sitzungen haben und auswählen möchten, welche genutzt werden soll
- **Ablauf:**
  - Zeigt beim Start einen Dialog mit einer Liste der verfügbaren Sitzungen
  - Zeigt Sitzungsinformationen (Nummer, letzter Zugriff, Speicherverbrauch)
  - Optionen, um eine bestehende Sitzung fortzusetzen oder eine neue zu starten
  - Auswahl verschiedener Speichermedien möglich, falls mehrere vorhanden sind
- **Vorteile:** Volle Kontrolle darüber, welche Sitzung genutzt wird – ideal für Nutzer mit mehreren Arbeitsbereichen

### 4. Neustart

**Was es macht:** Startet MiniOS, ohne Änderungen zu speichern.

- **Wann verwenden:** 
  - Zum Testen auf beschreibbaren Medien, ohne bestehende Sitzungen zu beeinflussen
  - Zur Fehlerdiagnose, ohne gespeicherte Daten zu verändern
  - Maximale Privatsphäre (es werden keine Daten gespeichert)
  - Wenn Sie sicherstellen möchten, dass keine dauerhaften Änderungen vorgenommen werden
- **Ablauf:**
  - Schnellste Startzeit
  - Änderungen gehen beim Herunterfahren verloren
  - Kein Zugriff auf Speichermedien zur Speicherung
- **Hinweis:** Beim Start von nur-lesbaren Medien (DVD, CD) verhält sich „Vorherige Sitzung fortsetzen“ automatisch wie „Neustart“, da kein Speicher für Sitzungen verfügbar ist

### 5. In den RAM kopieren

**Was es macht:** Lädt das gesamte System in den Arbeitsspeicher für maximale Performance.

- **Wann verwenden:**
  - Sie haben ausreichend RAM (4GB+ empfohlen)
  - Sie möchten die bestmögliche Geschwindigkeit
  - Sie müssen den USB-Stick nach dem Booten entfernen
  - Sie arbeiten mit ressourcenintensiven Anwendungen
- **Ablauf:**
  - Kopiert alle Systemdateien beim Start in den RAM
  - USB-Stick kann nach dem Laden entfernt werden
  - Das System läuft vollständig aus dem Arbeitsspeicher
  - Schnellste Reaktionszeiten bei allen Vorgängen
- **Voraussetzungen:** Ausreichend RAM, um das gesamte System aufzunehmen

Für erweiterte `toram`-Optionen und Tipps zur Speicheroptimierung siehe **[Performance-Optimierung](/administration/Performance-Optimization.md)**.

## Verwendung des Boot-Menüs

### Navigation im Menü

- Mit den **Pfeiltasten** zwischen den Optionen wechseln
- Mit **Enter** eine Option auswählen
- Mit **Esc** zum vorherigen Menü zurückkehren (in GRUB)
- Nach 10 Sekunden wird automatisch die Standardoption ausgewählt

### Sprachauswahl (GRUB)

Wenn Ihr MiniOS-USB-Stick mehrere Sprachen unterstützt:
1. Auf dem ersten Bildschirm werden die Sprachoptionen angezeigt
2. Wählen Sie Ihre bevorzugte Sprache
3. Das Boot-Menü erscheint in der gewählten Sprache
4. Alle weiteren Systemmeldungen werden in dieser Sprache angezeigt

⚠️ **Wichtig:** Das mehrsprachige Menü überschreibt alle in `config.conf` festgelegten Locale-Einstellungen. Die im Boot-Menü gewählte Sprache hat Vorrang vor vorkonfigurierten Locale-Einstellungen. Siehe **[Konfigurationsdatei](/configuration/Configuration-File.md)** und **[live-config](/configuration/live-config.md)** für Details zu Systemkonfigurationsdateien.

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
3. Fügen Sie Parameter in die angezeigte Befehlszeile ein
4. Drücken Sie **Enter** zum Starten

### Häufige Änderungen von Boot-Parametern

- `debug` – Zeigt detaillierte Startmeldungen (nützlich zur Fehlerdiagnose)
- `toram=trim` – Kopiert nur die wichtigsten Dateien in den RAM (wenn vollständiges `toram` zu viel Speicher benötigt)
- `perchsize=2000` – Legt die Sitzungsgröße auf 2GB fest (nach Bedarf anpassen)
- `locale=ru_RU.UTF-8` – Erzwingt eine bestimmte Sprache/Locale

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

⚠️ **Warnung:** Bearbeiten Sie Boot-Konfigurationsdateien nur, wenn Sie wissen, was Sie tun. Falsche Änderungen können Ihren USB-Stick unbootbar machen.

**So bearbeiten Sie die GRUB-Konfiguration:**
1. Mounten Sie Ihren MiniOS-USB-Stick
2. Navigieren Sie zu `/minios/boot/grub/`
3. Bearbeiten Sie `grub.cfg` mit einem Texteditor
4. Speichern und entfernen Sie den USB-Stick sicher

**Häufige Änderungen:**
- Ändern Sie `set timeout=10`, um das Menü-Timeout anzupassen
- Ändern Sie `set default=0`, um die Standardoption zu ändern
- Fügen Sie eigene Menüeinträge hinzu
