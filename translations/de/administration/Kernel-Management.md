---
updated: 2026-08-26
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Kernel-Management in MiniOS

## Warum den Kernel austauschen?

MiniOS wird mit einem Standard-Kernel ausgeliefert, aber es gibt verschiedene Gründe, warum Sie diesen ersetzen möchten:

### **Verschiedene Debian-Kernel-Varianten**

Debian stellt mehrere Kernel-Varianten bereit, die für unterschiedliche Anwendungsfälle optimiert sind:

- **`linux-image-6.12.38+deb13-amd64`** – Standard-Kernel für 64-Bit-Systeme (Standard in MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** – Echtzeit-Kernel für zeitkritische Anwendungen
- **`linux-image-6.12.38+deb13-cloud-amd64`** – Optimiert für Cloud- und Virtualisierungsumgebungen

> **Hinweis:** Versionsnummern (wie `6.12.38+deb13`) ändern sich mit Updates. Um die aktuell verfügbaren Kernel zu finden:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Spezialisierte Anwendungsfälle**

- **Echtzeit-Computing** – RT-Kernel für Audioproduktion, industrielle Steuerung
- **Gaming und niedrige Latenz** – Angepasste Kernel mit Gaming-Optimierungen
- **Sicherheits-Hardening** – Kernel mit zusätzlichen Sicherheitspatches (z. B. grsecurity)
- **Hardware-Kompatibilität** – Neuere Kernel für aktuelle Hardware-Unterstützung
- **Performance-Tuning** – Selbstkompilierte Kernel mit spezifischen Optimierungen

### **Eigene Kernel-Funktionen**

- **Eigene Patches** – Spezielle Patches für Ihre Hardware oder Ihren Anwendungsfall anwenden
- **Kernel-Module** – Unterstützung für spezielle Hardware oder Dateisysteme hinzufügen
- **Compiler-Optimierungen** – Mit verschiedenen Optimierungs-Flags bauen
- **Größenoptimierung** – Nicht benötigte Treiber entfernen, um die Kernel-Größe zu reduzieren

### **Typische Szenarien**

- **Audio-Produktions-Workstations** – RT-Kernel für minimale Audio-Latenz verwenden
- **Gaming-Systeme** – Gaming-spezifische Patches und Optimierungen anwenden
- **Serverumgebungen** – Cloud-optimierte Kernel für bessere Virtualisierung nutzen
- **Alte Hardware** – Ältere Kernel für Kompatibilität mit älteren Systemen verwenden
- **Entwicklungssysteme** – Anwendungen mit verschiedenen Kernel-Versionen testen

---

## Überblick: MiniOS Kernel Manager

MiniOS bietet zwei Werkzeuge für das Kernel-Management:

1. **MiniOS Kernel Manager (GUI):** Eine benutzerfreundliche grafische Anwendung zum Paketieren, Installieren und Verwalten von Kernels
2. **minios-kernel (CLI):** Ein Kommandozeilenwerkzeug für fortgeschrittene Nutzer und Automatisierung

Beide Werkzeuge übernehmen automatisch:
- **Kernel-Paketierung** im SquashFS-Format
- **Initramfs-Erstellung** mit passenden Treibern und Boot-Skripten
- **Installation** ins MiniOS-Kernel-Repository
- **Bootloader-Konfigurations**-Updates
- **Kernel-Aktivierung** und Umschaltung

Diese Seite behandelt modulare Live-Installationen. Native Installationen verwenden ihre
installierten Kernel-Pakete, GRUB und initramfs; siehe
[Boot-Modi](/configuration/Boot-Modes.md). Für das genaue koordinierte
Kernel-Verhalten des initrd siehe
[Initrd-Modul-Laden](/configuration/Initrd-Module-Loading.md).

### **Wichtige Hinweise:**

- **Administratorrechte:** Beide Werkzeuge benötigen Administratorrechte und fordern ggf. Authentifizierung über PolicyKit an
- **Kernel-Kompatibilität:** Stellen Sie sicher, dass die Kernel mit MiniOS kompatibel sind. Repository-Kernel werden empfohlen
- **MiniOS-Verzeichnis:** Die Werkzeuge erkennen das MiniOS-Verzeichnis (`/minios/`) automatisch und prüfen die Schreibrechte
- **Automatische Updates:** Bootloader-Konfigurationen werden beim Aktivieren eines Kernels automatisch aktualisiert

---

## Methode 1: Verwendung des MiniOS Kernel Manager (GUI)

Der grafische Kernel-Manager bietet eine intuitive Oberfläche für alle Kernel-Operationen.

### **Schritte:**

#### 1. **Anwendung starten**

```bash
minios-kernel-manager
```

Oder suchen Sie im Anwendungsmenü nach "MiniOS Kernel Manager".

#### 2. **Neuen Kernel paketieren**

**Im Tab Kernel paketieren:**

1. **Kernel-Quelle auswählen:**
   - **Manuelles Paket:** Lokales `.deb` Kernel-Paket auswählen
   - **Repository:** Aus verfügbaren Kernels in den Debian/Ubuntu-Repositories wählen

2. **Kompression konfigurieren:**
   - SquashFS-Kompression wählen: `zstd` (empfohlen), `lz4`, `lzo`, `xz` oder `gzip`

3. **Kernel paketieren:**
   - Auf "Kernel paketieren" klicken
   - Fortschritt im Paketierungs-Log verfolgen
   - Dateien werden automatisch ins MiniOS-Repository installiert

#### 3. **Installierte Kernel verwalten**

**Im Tab Kernel verwalten:**

1. **Verfügbare Kernel anzeigen:**
   - Alle paketierten Kernel mit Status-Badges anzeigen:
     - **ACTIVE:** Aktuell konfigurierter Kernel
     - **RUNNING:** Aktuell gebooteter Kernel
     - **AVAILABLE:** Zur Aktivierung verfügbar

2. **Kernel aktivieren:**
   - Rechtsklick auf einen Kernel und "Kernel aktivieren" wählen
   - Aktivierungsdialog bestätigen
   - Bootloader-Konfiguration wird automatisch aktualisiert

3. **Kernel löschen:**
   - Rechtsklick auf einen inaktiven Kernel und "Kernel löschen" wählen
   - Löschung bestätigen (kann nicht rückgängig gemacht werden)

---

## Methode 2: Verwendung von minios-kernel (CLI)

Das Kommandozeilenwerkzeug bietet skriptfähige Möglichkeiten zur Kernel-Verwaltung.

### **Administratorrechte erforderlich:**

Das CLI-Tool benötigt Root-Rechte und prüft diese automatisch. Führen Sie Befehle mit `sudo` oder über `pkexec` aus:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Grundlegende Befehle:**

#### 1. **Verfügbare Kernel auflisten**

```bash
sudo minios-kernel list
```

Zeigt alle paketierten Kernel mit ihrem Status an.

#### 2. **Kernel paketieren**

**Aus Repository:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Aus lokaler .deb-Datei:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Mit eigener Kompression:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. **Kernel aktivieren**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Kernel löschen**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Status prüfen**

```bash
sudo minios-kernel status
```

Zeigt den Status des MiniOS-Verzeichnisses und aktuelle Kernel-Informationen an.

#### 6. **Kernel-Informationen anzeigen**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Zeigt detaillierte Informationen zu einem bestimmten Kernel, einschließlich Status und Verfügbarkeit.

### **Erweiterte CLI-Optionen:**

#### **JSON-Ausgabe (für Scripting):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Erweiterte Paketierungsoptionen:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Hilfe und Nutzung:**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## Fehlerbehebung

### Häufige Probleme und Lösungen:

#### **MiniOS-Verzeichnis nicht gefunden**

- **Ursache:** Die Werkzeuge können das MiniOS-Verzeichnis nicht finden
- **Lösung:** Stellen Sie sicher, dass Sie auf einem MiniOS-System arbeiten oder das USB-Laufwerk korrekt eingebunden ist
- **Prüfen:** Führen Sie `sudo minios-kernel status` aus, um die Verzeichniserkennung zu überprüfen

#### **Zugriff verweigert**

- **Ursache:** MiniOS-Verzeichnis ist schreibgeschützt oder unzureichende Berechtigungen
- **Lösung:** Stellen Sie sicher, dass Sie Administratorrechte besitzen und das Dateisystem beschreibbar ist
- **Prüfen:** Überprüfen Sie den Status des MiniOS-Verzeichnisses in der GUI oder CLI

#### **Paketinstallation fehlgeschlagen**

- **Ursache:** Beschädigtes Paket, Netzwerkprobleme oder Abhängigkeitsfehler
- **Lösung:**
  - Integrität der Paketdatei überprüfen
  - Netzwerkverbindung für Repository-Pakete prüfen
  - Paketlisten aktualisieren: `sudo apt update`

#### **Kernel-Panik nach Aktivierung**

- **Ursache:** Inkompatibler Kernel oder fehlende Treiber
- **Lösung:**
  - Folgen Sie [Boot-Wiederherstellung](/administration/Boot-Recovery.md), um kompatible Rettungsmedien zu starten und ein bekannt funktionierendes Kernel-Set zu aktivieren
  - Überprüfen Sie die Kernel-Kompatibilität mit Ihrer Hardware

#### **System startet alten Kernel**

- **Ursache:** Bootloader-Konfiguration wurde nicht korrekt aktualisiert
- **Lösung:**
  - Kernel-Aktivierung erneut durchführen: `sudo minios-kernel activate <version>`
  - Prüfen, ob der Kernel korrekt paketiert und installiert wurde

#### **Hardware funktioniert nach Kernel-Wechsel nicht**

- **Ursache:** Fehlende Treiber im neuen Kernel
- **Lösung:**
  - Prüfen Sie, ob die SquashFS-Kernelmodul-Datei installiert wurde
  - Überprüfen Sie, ob der neue Kernel Ihre Hardware unterstützt
  - Ziehen Sie eine andere Kernel-Variante in Betracht

#### **Kernel-Wiederherstellung aus dem Original-MiniOS-Image**

Führen Sie keine Wiederherstellung durch, indem Sie ein einzelnes Kernel-Image, ein Initramfs oder das `01-kernel-*.sb`-Modul kopieren. Eine bootfähige Version erfordert das koordinierte Triplet, und die Aktivierung muss als unterstützte Operation die Bootloader-Konfiguration aktualisieren. Befolgen Sie die Anleitung unter [Modularer Kernel-Rollback](/administration/Boot-Recovery.md), um kompatible Rettungsmedien zu verwenden und ein vollständiges, funktionsfähiges Set zu aktivieren. Wenn kein vollständiges Set mit passenden Versionen verfügbar ist, installieren Sie das System neu; stellen Sie keine einzelnen Boot-Komponenten zusammen.

### **Diagnosebefehle:**

**Aktuellen Systemstatus prüfen:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Kernel-Dateien überprüfen:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Bootloader-Konfiguration prüfen:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Überblick über die Dateistruktur

Der MiniOS Kernel Manager verwaltet diese Dateien automatisch:

### **Kernel-Repository-Struktur:**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Hinweis:** Das Standard-`01-kernel-<version>.sb`-Modul, das mit MiniOS ausgeliefert wird, enthält zusätzliche Treiber, die über die im ursprünglichen Repository-Kernelpaket enthaltenen hinausgehen. Diese zusätzlichen Treiber sorgen für eine erweiterte Hardware-Kompatibilität bei WLAN-Adaptern und Speichermedien.

### **Statusanzeigen:**

- **AKTIV:** Kernel im Bootloader konfiguriert (wird beim nächsten Neustart gebootet)
- **LÄUFT:** Aktuell ausgeführter Kernel
- **VERFÜGBAR:** Paketiert und bereit zur Aktivierung

### **Automatische Vorgänge:**

- Kernel-Paketierung und Kompression
- Initramfs-Erstellung mit passenden Treibern
- Installation ins MiniOS-Repository
- Bootloader-Konfigurations-Updates
- Symlink-Verwaltung für aktive Kernel
- Aufräumen temporärer Dateien

---

## Best Practices

### **Kernel-Auswahl:**

- Verwenden Sie nach Möglichkeit Kernel aus den offiziellen Debian/Ubuntu-Repositories
- Testen Sie neue Kernel zuerst in Nicht-Produktivumgebungen
- Halten Sie mindestens einen bekannten, funktionierenden Kernel für die Wiederherstellung bereit

### **Vor der Installation:**

- Überprüfen Sie, ob das MiniOS-Verzeichnis beschreibbar ist
- Stellen Sie ausreichend Speicherplatz sicher (Kernel können 100–500 MB groß sein)
- Aktualisieren Sie die Paketlisten für Repository-Kernel

### **Nach der Installation:**

- Testen Sie den neuen Kernel gründlich
- Überprüfen Sie, ob alle Hardware-Komponenten korrekt funktionieren
- Behalten Sie den vorherigen Kernel als Backup, bis der neue als stabil gilt

### **Wiederherstellungsplanung:**

- Bewahren Sie immer ein vollständiges, bekannt funktionierendes Kernel-Triplet auf
- Wissen Sie, wie Sie bei Bedarf von Rettungsmedien booten
- Dokumentieren Sie, welche Kernel mit Ihrer Hardware-Konfiguration funktionieren
