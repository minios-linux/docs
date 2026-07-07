# Sitzungsverwaltung in MiniOS 🔄

## 🤔 Was sind Sitzungen?

MiniOS-Sitzungen bieten persistenten Speicher für Ihre Änderungen und ermöglichen Ihnen:

- **Änderungen speichern**, die während einer Live-Sitzung vorgenommen wurden
- **Arbeiten fortsetzen** an der Stelle, an der Sie nach dem Neustart aufgehört haben
- **Mehrere** separate Arbeitsumgebungen verwalten
- **Zwischen** verschiedenen Konfigurationen wechseln

Sitzungen nutzen die **Union-Filesystem**-Technologie (AUFS oder OverlayFS), um Änderungen über das schreibgeschützte Basissystem zu legen.

---

## 📋 Sitzungstypen und -modi

### **Sitzungsaktionen**

- **`resume`** – Fortfahren mit der zuletzt verwendeten Sitzung (Standard)
- **`new`** – Neue Sitzung erstellen
- **`ask`** – Interaktive Sitzungswahl beim Booten
- **`fresh`** – Keine Persistenz (temporäre Sitzung)

### **Speichermodi**

- **`native`** – Direktes Dateisystem-Storage (benötigt POSIX-Dateisystem: ext4, btrfs, xfs)
- **`dynfilefs`** – Erweiterbare Containerdateien (funktioniert auf jedem Dateisystem, empfohlen für FAT32/NTFS/exFAT)
- **`raw`** – Feste Image-Dateien (funktioniert auf jedem Dateisystem)

---

## 🚀 Boot-Parameter zur Sitzungssteuerung

### **Kernparameter für Sitzungen**

| Parameter | Werte | Beschreibung |
|-----------|--------|-------------|
| `perch` | - | Persistente Änderungen aktivieren |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Sitzungsaktion oder Verzeichnis |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Speichermodus |
| `perchsize` | `<size_in_MB>` | Initiale Größe für Container-/Imagemodi |

### **Sitzungsverzeichnisstruktur**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Bootloader-Integration

### **GRUB-Konfiguration**

MiniOS stellt vorkonfigurierte GRUB-Menüeinträge für verschiedene Sitzungsmodi bereit:

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **SYSLINUX-Konfiguration**

Entsprechende SYSLINUX-Einträge:

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Sitzungsmanagement-Befehle

### **Verwendung des MiniOS Session Managers (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Funktionen:**
- Anzeige aller verfügbaren Sitzungen mit Metadaten
- Neue Sitzungen mit verschiedenen Modi erstellen
- Sitzungen aktivieren/wechseln
- Alte Sitzungen löschen
- Sitzungen bereinigen, die älter als eine angegebene Anzahl von Tagen sind

### **Verwendung von minios-session (CLI)**

⚠️ **Administratorrechte erforderlich:**

Das CLI-Tool benötigt Root-Rechte und prüft diese automatisch. Führen Sie Befehle mit `sudo` oder über `pkexec` aus:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Grundlegende Befehle:**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Erweiterte Optionen:**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Wichtige Befehlsunterschiede:**

- `active` – Zeigt die Sitzung, die beim nächsten Start verwendet wird
- `running` – Zeigt die aktuell genutzte Sitzung (falls vorhanden)
- `resize` – Sitzungsgröße ändern (nur für dynfilefs/raw-Modi)
- `export` – Sitzung als .tar.zst-Archiv für Backup exportieren
- `import` – Sitzung aus Archiv mit optionaler Modus-Konvertierung importieren
- `copy` – Sitzung mit optionaler Modus-Konvertierung kopieren
- `info` – Dateisystemkompatibilität prüfen und Empfehlungen anzeigen

---

## 📦 Sitzungs-Backup und Migration

### **Sitzungen exportieren**

Sitzungen als komprimierte Archive für Backup oder Transfer exportieren:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Funktionen:**
- Erstellt ein komprimiertes .tar.zst-Archiv
- Erhält alle Sitzungsdaten und Metadaten
- Kann auf jedem MiniOS-System importiert werden
- Automatische Komprimierung für platzsparende Speicherung

### **Sitzungen importieren**

Sitzungen aus Archiven mit optionaler Modus-Konvertierung importieren:

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Funktionen:**
- Stellt Sitzungsdaten aus Archiv wieder her
- Konvertiert bei Bedarf automatisch zwischen Speichermodi
- Überspringt vorhandene Dateien, um Datenverlust zu vermeiden
- Erstellt automatisch eine neue Sitzungsnummer

### **Sitzungen kopieren und konvertieren**

Sitzungen zwischen verschiedenen Speichermodi kopieren:

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Unterstützte Konvertierungen:**
- native ⇄ dynfilefs ⇄ raw
- Alle Moduskombinationen werden unterstützt
- Automatische Größenanpassung
- Sitzungsdaten bleiben beim Konvertieren erhalten

**Anwendungsfälle:**
- Migration von FAT32 auf ext4-Dateisystem (dynfilefs → native)
- Portable Sitzungen erstellen (native → dynfilefs/raw)
- Optimierung für verschiedene Dateisysteme
- Sitzungs-Backups mit unterschiedlichen Modi erstellen

---

## 🏗️ Sitzungs-Speichermodi im Detail

### **Native-Modus**

**Optimal für:** Systeme auf POSIX-Dateisystemen (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Merkmale:**
- Direkter Zugriff auf das Dateisystem ohne Container
- Volle POSIX-Kompatibilität (Hardlinks, Berechtigungen, erweiterte Attribute)
- Beste Performance aller Modi
- **Voraussetzungen:** POSIX-kompatibles Dateisystem (ext4, btrfs, xfs)
- **Nicht kompatibel:** FAT32, NTFS, exFAT

### **DynFileFS-Modus**

**Optimal für:** Nicht-POSIX-Dateisysteme (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Merkmale:**
- Erweiterbarer Container mit ext4-Dateisystem im Inneren
- Wächst bei Bedarf automatisch bis zum verfügbaren Speicherplatz
- Funktioniert auf jedem Dateisystemtyp
- Geringer Performance-Overhead im Vergleich zu native
- **Standardgröße:** 1000MB, wächst dynamisch
- **Empfohlen für:** FAT32, NTFS, exFAT-Dateisysteme

### **Raw-Modus**

**Optimal für:** Feste Größenanforderungen auf jedem Dateisystem

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Merkmale:**
- Image mit fester Größe und ext4-Dateisystem im Inneren
- Vorhersehbarer und konstanter Speicherplatzverbrauch
- Funktioniert auf jedem Dateisystemtyp
- Größe muss bei der Erstellung angegeben werden
- **Standardgröße:** 1000MB, falls nicht angegeben
- **Anwendungsfälle:** Portable Sitzungen, Speicherquoten, planbare Speicherzuteilung

---

## 🗂️ Sitzungs-Metadaten und Kompatibilität

### **Sitzungs-Metadatenformate**

**Standardformat (session.conf):**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**JSON-Format (wenn jq verfügbar ist):**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Hinweis:** MiniOS erkennt automatisch, ob `jq` verfügbar ist und verwendet das JSON-Format, wenn möglich. Andernfalls wird auf das traditionelle conf-Format zurückgegriffen.

### **Kompatibilitätsprüfung**

MiniOS prüft die Sitzungs-Kompatibilität automatisch:

- **Versionsunterschied** – Erstellt eine neue Sitzung, wenn sich die MiniOS-Version unterscheidet
- **Editionsunterschied** – Erstellt eine neue Sitzung, wenn sich die Edition unterscheidet (standard/toolbox/ultra)
- **Union-FS-Unterschied** – Erstellt eine neue Sitzung, wenn sich das Union-Filesystem unterscheidet (aufs/overlayfs)
- **Moduswechsel** – Erstellt eine neue Sitzung, wenn sich der Speichermodus ändert

### **Warnsystem**

Bei Auswahl inkompatibler Sitzungen zeigt MiniOS Warnungen an:
- Warnungen bei Versionsinkompatibilität
- Hinweise bei Editionsunterschieden
- Kompatibilitätsprobleme mit dem Union-Filesystem
- Möglichkeit, auf eigenes Risiko fortzufahren

---

## 🎯 Erweiterte Sitzungs-Konfiguration

### **Benutzerdefinierte Sitzungsorte**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Sitzungsgrößenverwaltung**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Automatisches Sitzungsmanagement**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Fehlerbehebung bei Sitzungen

### **Häufige Probleme**

#### **Sitzung nicht gefunden**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Berechtigungsprobleme**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Fehler im Speichermodus**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Sitzungswiederherstellung**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Sitzungen bereinigen**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Best Practices für Sitzungen

### **Speichermodus auswählen**

- **Native-Modus:** Verwenden, wenn MiniOS auf einem POSIX-Dateisystem (ext4, btrfs, xfs) liegt – beste Performance
- **DynFileFS-Modus:** Für FAT32, NTFS, exFAT-Dateisysteme – automatisches Platzmanagement
- **Raw-Modus:** Nutzen, wenn eine feste Größe auf jedem Dateisystem benötigt wird – vorhersehbarer Speicherverbrauch

### **Größenplanung**

- **Kleine Sitzungen:** 1–2 GB für grundlegende Konfigurationsänderungen
- **Entwicklung:** 4–8 GB für Entwicklungsumgebungen
- **Hohe Last:** 8 GB+ für umfangreiche Softwareinstallationen

### **Sitzungsverwaltung**

- Alte Sitzungen regelmäßig bereinigen
- Aussagekräftige Sitzungsnamen bei manueller Verwaltung verwenden
- Speicherplatz überwachen
- Mindestens eine bekannte, funktionierende Sitzung zur Wiederherstellung aufbewahren

### **Performance-Optimierung**

- Nach Möglichkeit Native-Modus für beste Performance nutzen
- Sitzungsdaten auf schnellen Speichermedien ablegen
- SSD-Speicher für häufig genutzte Sitzungen in Betracht ziehen

---
