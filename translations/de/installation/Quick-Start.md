# Erste Schritte mit MiniOS 🌟

Willkommen bei MiniOS – hier treffen die Flexibilität und Portabilität von Linux auf Komfort und Benutzerfreundlichkeit. Wenn Sie neu bei MiniOS sind, hilft Ihnen dieser umfassende Leitfaden beim Einstieg und dabei, das Beste aus Ihrem Betriebssystem herauszuholen.

## Schritt 1: Die richtige MiniOS Edition wählen 📦

MiniOS bietet drei Haupteditionen, die jeweils für bestimmte Anwendungsfälle optimiert sind:

- **🚀 Standard** – Das zuverlässige Arbeitstier für alltägliche Aufgaben
- **🧰 Toolbox** – Das Power-User-Werkzeugset mit erweiterten System-Tools
- **⚡ Ultra** – All-in-One-Paket mit vollständigem Funktionsumfang

Detaillierte Beschreibungen der Funktionen und enthaltenen Software jeder Edition finden Sie unter [Über MiniOS](/about/About-MiniOS.md).

**Download-Optionen:**
- **Offizielle Webseite**: [minios.dev](https://minios.dev) – Übersicht aller Editionen und Direktdownloads
- **GitHub Releases**: [Neueste Releases](https://github.com/minios-linux/minios-live/releases) – Alle Versionen und Release Notes

Eine detaillierte Übersicht der in jeder Edition enthaltenen Pakete finden Sie in der [Paketliste](/administration/Packages.md).

## Schritt 2: Einen bootfähigen USB-Stick erstellen 🔌

**Empfohlene Installationsmethoden:**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ – Einfach und zuverlässig
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Plattformübergreifende GUI
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ – Multi-Boot-Unterstützung

### 🐧 **Linux**

- **[dd-Befehl](/installation/tools/dd.md)** ⭐ – Schnelles Kommandozeilen-Tool
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Benutzerfreundliche GUI

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ – Einfache GUI
- **[dd-Befehl](/installation/tools/dd.md)** ⭐ – Integriertes Terminal-Tool

### 🏠 **Von MiniOS aus**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** – Integriertes grafisches Tool

**Weitere Methoden:** [UNetbootin](/installation/tools/UNetbootin.md), [Laufwerks-Utility](/installation/tools/Drive-Utility.md), [Originalmethode](/installation/tools/Original-Method.md)

### Anforderungen an die Laufwerksgröße

- **Standard (787 MB)**: mindestens 2 GB
- **Toolbox (1,2 GB)**: mindestens 4 GB
- **Ultra (1,7 GB)**: mindestens 4 GB
- **Empfohlene Größe**: 8 GB oder mehr für komfortables Arbeiten mit Persistenz

**Wichtige Hinweise:**
- Jeder obenstehende Link enthält eine detaillierte Schritt-für-Schritt-Anleitung
- Empfohlene Methoden (⭐) sind auf Zuverlässigkeit und Benutzerfreundlichkeit getestet
- Wählen Sie die Methode, die am besten zu Ihrem Betriebssystem und Erfahrungsstand passt

## Schritt 3: Starten und Entdecken 🖥️

Nach dem Booten vom USB-Stick entdecken Sie die MiniOS-Desktopumgebung:

**Wichtige Funktionen zum Kennenlernen:**
- Anwendungsmenü (untere linke Leiste)
- Systemeinstellungen und Präferenzen
- Dateimanager (Thunar)
- Vorgebundene Anwendungen (Browser, Office-Paket, Tools)
- Desktop-Anpassungsoptionen

Die Standard-Desktopumgebung ist XFCE und bietet eine ausgewogene Kombination aus Funktionen und Performance.

## Schritt 4: Systemkonfiguration 🌐

**Konfigurieren Sie Sprache, Tastatur, Zeitzone und weitere Einstellungen:**

### 🔧 **Mit dem MiniOS Konfigurator** (Empfohlen)

**Zugriff:** Anwendungsmenü → System → MiniOS konfigurieren

**Wichtige Einstellungen, die Sie vornehmen können:**
- **🌍 Sprache & Gebietsschema**: System-Sprache festlegen (z. B. `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Zeitzone**: Ihre Zeitzone einstellen (z. B. `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Tastatur**: Layouts und Umschaltoptionen festlegen (z. B. `us,ru` mit `Alt+Shift`-Wechsel)
- **👤 Benutzer-Einstellungen**: Benutzername, vollständigen Namen und Gruppen ändern
- **🔐 Passwörter**: Sichere Passwörter für Benutzer- und Root-Konto setzen
- **🖥️ System**: Hostname konfigurieren, Dienste aktivieren/deaktivieren
- **🔧 Erweitert**: Bootoptionen und Systemverhalten

**So funktioniert's:**
1. Öffnen Sie den MiniOS Konfigurator über das Systemmenü
2. Navigieren Sie durch die Tabs, um verschiedene Bereiche zu konfigurieren
3. Änderungen vornehmen und speichern
4. **Neustart, um Änderungen zu übernehmen** – Einstellungen werden nach dem Neustart aktiv und bleiben erhalten

**Technischer Hinweis:** Der MiniOS Konfigurator bearbeitet die Datei `/etc/live/config.conf`, die die Hauptkonfigurationsdatei von MiniOS ist und das Systemverhalten beim Boot steuert. Ausführliche Informationen zu den Konfigurationsparametern finden Sie im [Konfigurationsdatei](/configuration/Configuration-File.md)-Leitfaden.

### 💻 **Alternative: Konfiguration per Kommandozeile**

**Sofort wirksame Änderungen:**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Für dauerhafte Änderungen über Neustarts hinweg:** Verwenden Sie den MiniOS Konfigurator oder bearbeiten Sie `/etc/live/config.conf` direkt.

### 📋 **Weitere Konfigurationsmöglichkeiten**

- **Direktes Bearbeiten der Datei**: `/etc/live/config.conf` manuell editieren (für fortgeschrittene Nutzer)
- **Setup beim Booten**: [Boot-Parameter](/configuration/Boot-Parameters.md) nutzen, um das System vor dem Start zu konfigurieren
- **Konfigurationsdatei-Leitfaden**: Siehe [Konfigurationsdatei](/configuration/Configuration-File.md) für eine ausführliche Referenz zu config.conf
- **Vorinstallation**: Vor der Installation mit dem [MiniOS Installer](/installation/MiniOS-Installer.md) konfigurieren

**Wichtig:** Änderungen an `/etc/live/config.conf` (über den MiniOS Konfigurator oder manuell) erfordern einen Neustart, um wirksam zu werden. Kommandozeilentools wie `localectl` und `timedatectl` setzen Änderungen sofort um, diese bleiben aber ohne korrekte Konfiguration nach einem Neustart nicht erhalten.

## Schritt 5: Softwareinstallation 🔄

MiniOS bietet verschiedene Möglichkeiten, Software zu installieren:

### 📦 **APT Paketmanager**

Klassische Debian-Paketverwaltung – nutzen Sie `man apt` für eine ausführliche Befehlsreferenz.

### 🔄 **Modulsystem**

Erweiterte SquashFS-Module für persistente Software – siehe [Module erstellen](/development/Creating-Modules.md)-Leitfaden.

**Wichtiger Unterschied:** APT-Installationen benötigen Persistenz, um Neustarts zu überstehen, während Module automatisch persistent sind.

## Schritt 6: Datenpersistenz 💾

**Gute Nachricht:** MiniOS richtet die Datenpersistenz während der Installation automatisch ein! Ihre Dateien, Einstellungen und Softwareinstallationen werden automatisch gespeichert.

### So funktioniert es

- **Automatische Einrichtung**: Alle Installationsmethoden erstellen automatisch Persistenz
- **Intelligente Erkennung**: Das System wählt den optimalen Persistenzmodus für Ihr Laufwerks-Dateisystem
- **Portabel**: Ihre Daten reisen mit dem USB-Stick mit

### Erweiterte Konfiguration

Für eine individuelle Persistenz-Einrichtung siehe den ausführlichen [Konfigurationsdatei](/configuration/Configuration-File.md)-Leitfaden und die [Boot-Parameter](/configuration/Boot-Parameters.md)-Referenz.

## Schritt 7: Sicherheitseinrichtung 🔐

### 👤 **Standardkonten**

- **Benutzer**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Wichtige Sicherheitsschritte**

1. **Passwörter sofort ändern** – Standard-Zugangsdaten sind öffentlich bekannt
2. **Starke, eindeutige Passwörter** für alle Konten verwenden

### Methoden zur Passwortkonfiguration

- **🔧 Empfohlen**: Nutzen Sie den **MiniOS Konfigurator** (Anwendungsmenü → System → MiniOS konfigurieren → Benutzer-Tab)
- **💻 Kommandozeile**: `passwd live` und `sudo passwd root`
- **📋 Erweitert**: Siehe [Security Hardening](/administration/Security-Hardening.md) für eine detaillierte Sicherheitskonfiguration

⚠️ **Verwenden Sie niemals Standard-Zugangsdaten auf vernetzten Systemen!**

## Schritt 8: Anpassung & Fortgeschrittene Themen 🛠️

### 🎨 **Grundlegende Anpassung**

- Desktop-Themes und Hintergründe über die Einstellungen
- Panel-Layout und Anwendungsvorlieben
- Tastenkombinationen und Systemeinstellungen

### 🚀 **Erweiterte Konfiguration**

- **Boot-Parameter**: [Vollständige Referenz](/configuration/Boot-Parameters.md) zur Systemoptimierung
- **Performance**: [Optimierungsleitfaden](/administration/Performance-Optimization.md) für mehr Geschwindigkeit
- **Hardware**: [Kompatibilitätsleitfaden](/installation/Hardware-Compatibility.md) für Gerätesupport

### 🔧 **Power-User-Funktionen**

- **Eigene Builds**: [MiniOS erstellen](/development/Building-MiniOS.md) aus dem Quellcode
- **Modulerstellung**: [Erweiterte Module](/development/Creating-Modules.md) entwickeln
- **ISO-Neubau**: [Live-System neu verpacken](/development/Rebuilding-ISO.md) als bootfähige ISO
- **Kernel-Updates**: [Kernel-Management](/administration/Kernel-Management.md)-Leitfaden

## Hilfe & Community-Ressourcen 💬

### 📚 **Dokumentation**

- **Offizielle Webseite**: [minios.dev](https://minios.dev) – Neueste Nachrichten und Downloads
- **Alle Anleitungen**: In dieser Dokumentationssammlung verfügbar

### 🐛 **Support & Probleme**

- **Fehlermeldungen**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Quellcode**: [GitHub Repository](https://github.com/minios-linux/minios-live)

### 📖 **Mehr erfahren**

- **Debian-Dokumentation**: [www.debian.org/doc](https://www.debian.org/doc/) – Da MiniOS auf Debian basiert
- **Linux-Grundlagen**: Allgemeine Linux-Tutorials gelten auch für MiniOS

## Willkommen bei MiniOS! 🎉

Sie haben nun alles, was Sie für den Einstieg mit MiniOS benötigen. Das System vereint die Leistung von Linux mit portabler Flexibilität – ideal für Systemrettung, mobiles Arbeiten oder den täglichen Einsatz.

**Nächste Schritte:** Edition auswählen, USB-Stick erstellen und loslegen! 🚀
