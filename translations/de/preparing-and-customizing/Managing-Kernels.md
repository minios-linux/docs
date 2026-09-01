---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Kernel verwalten

## Warum den Kernel austauschen?

MiniOS wird mit einem Standard-Kernel ausgeliefert, aber es gibt verschiedene Gründe, warum Sie diesen ersetzen möchten:

### **Verschiedene Debian-Kernel-Varianten**

Debian stellt mehrere Kernel-Varianten bereit, die für unterschiedliche Einsatzzwecke optimiert sind:

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
- **Gaming und geringe Latenz** – Angepasste Kernel mit Gaming-Optimierungen
- **Erhöhte Sicherheit** – Kernel mit zusätzlichen Sicherheitspatches (z. B. grsecurity)
- **Hardware-Kompatibilität** – Neuere Kernel für aktuelle Hardware-Unterstützung
- **Performance-Tuning** – Selbst kompilierte Kernel mit spezifischen Optimierungen

### **Individuelle Kernel-Funktionen**

- **Eigene Patches** – Spezielle Patches für Ihre Hardware oder Ihren Anwendungsfall anwenden
- **Kernel-Module** – Unterstützung für spezielle Hardware oder Dateisysteme hinzufügen
- **Compiler-Optimierungen** – Mit unterschiedlichen Optimierungs-Flags bauen
- **Größenoptimierung** – Nicht benötigte Treiber entfernen, um die Kernel-Größe zu reduzieren

### **Typische Szenarien**

- **Audio-Produktions-Workstations** – RT-Kernel für minimale Audio-Latenz verwenden
- **Gaming-Systeme** – Gaming-spezifische Patches und Optimierungen anwenden
- **Server-Umgebungen** – Cloud-optimierte Kernel für bessere Virtualisierung nutzen
- **Alte Hardware** – Ältere Kernel für Kompatibilität mit älteren Systemen verwenden
- **Entwicklungssysteme** – Anwendungen mit verschiedenen Kernel-Versionen testen

---

## MiniOS Kernelmanager Übersicht

MiniOS bietet zwei Werkzeuge für das Kernel-Management:

1. **MiniOS Kernelmanager (GUI):** Eine benutzerfreundliche grafische Anwendung zum Paketieren, Installieren und Verwalten von Kerneln
2. **minios-kernel (CLI):** Ein Kommandozeilen-Tool für fortgeschrittene Nutzer und Automatisierung

Beide Werkzeuge übernehmen automatisch:
- **Kernel-Paketierung** im SquashFS-Format
- **Initramfs-Erstellung** mit passenden Treibern und Boot-Skripten
- **Installation** ins MiniOS Kernel-Repository
- **Bootloader-Konfigurations**-Updates
- **Kernel-Aktivierung** und Wechsel

Diese Seite behandelt das modulare MiniOS Live-System. MiniOS Kernelmanager und `minios-kernel` sind für diese Live-Architektur und ihr koordiniertes Kernelmodul, `vmlinuz`, sowie das zugehörige Initramfs-Set verfügbar. Nach der nativen Umstellung verwendet das System den herkömmlichen Debian-Kernel-Workflow; die MiniOS Live-Kernel-Tools werden entfernt, da das modulare Kernelmodell nicht mehr gilt. Verwenden Sie stattdessen die Debian-Kernelpakete, Initramfs-Tools und den installierten Bootloader. Siehe [Über MiniOS](/getting-started/About-MiniOS) und [Boot-Modi](/using-minios/Boot-Modes). Für das genaue koordinierte Kernelverhalten des Live-initrd siehe [Initrd-Modul-Laden](/reference/boot-process/Module-Loading).

### **Wichtige Hinweise:**

- **Administratorrechte:** Beide Werkzeuge benötigen Administratorrechte und fordern ggf. eine Authentifizierung über PolicyKit an
- **Kernel-Kompatibilität:** Stellen Sie sicher, dass die Kernel mit MiniOS kompatibel sind. Repository-Kernel werden empfohlen
- **MiniOS-Verzeichnis:** Die Tools erkennen das MiniOS-Verzeichnis (`/minios/`) automatisch und prüfen die Schreibrechte
- **Automatische Updates:** Bootloader-Konfigurationen werden bei Kernel-Aktivierung automatisch aktualisiert

---

## Methode 1: MiniOS Kernel Manager (GUI) verwenden

Der grafische Kernel-Manager bietet eine intuitive Oberfläche für alle Kernel-Operationen.

### **Schritte:**

#### 1. **Anwendung starten**

```bash
minios-kernel-manager
```

Oder suchen Sie im Anwendungsmenü nach "MiniOS Kernel Manager".

#### 2. **Neuen Kernel verpacken**

**Im Tab "Kernel verpacken":**

1. **Kernel-Quelle auswählen:**
   - **Manuelles Paket:** Lokales `.deb` Kernel-Paket auswählen
   - **Repository:** Aus verfügbaren Kernels in den Debian/Ubuntu-Repositories wählen

2. **Kompression konfigurieren:**
   - SquashFS-Kompression auswählen: `zstd` (empfohlen), `lz4`, `lzo`, `xz` oder `gzip`

3. **Kernel verpacken:**
   - Auf die Schaltfläche "Kernel verpacken" klicken
   - Fortschritt im Verpackungsprotokoll verfolgen
   - Dateien werden automatisch ins MiniOS-Repository installiert

#### 3. **Installierte Kernel verwalten**

**Im Tab "Kernel verwalten":**

1. **Verfügbare Kernel anzeigen:**
   - Alle verpackten Kernel mit Status-Badges sehen:
     - **AKTIV:** Aktuell konfigurierter Kernel
     - **LAUFEND:** Aktuell gebooteter Kernel
     - **VERFÜGBAR:** Für die Aktivierung verfügbar

2. **Kernel aktivieren:**
   - Mit Rechtsklick auf einen Kernel "Kernel aktivieren" auswählen
   - Aktivierungsdialog bestätigen
   - Bootloader-Konfiguration wird automatisch aktualisiert

3. **Kernel löschen:**
   - Mit Rechtsklick auf einen inaktiven Kernel "Kernel löschen" auswählen
   - Löschung bestätigen (kann nicht rückgängig gemacht werden)

---

## Methode 2: minios-kernel (CLI) verwenden

Das Kommandozeilen-Tool bietet skriptfähige Kernel-Verwaltung.

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

Zeigt alle verpackten Kernel mit ihrem Status an.

#### 2. **Kernel verpacken**

**Aus Repository:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Aus lokaler .deb-Datei:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Mit individueller Kompression:**
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

#### **Erweiterte Paketoptionen:**

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

- **Ursache:** Die Tools können das MiniOS-Verzeichnis nicht finden
- **Lösung:** Stellen Sie sicher, dass Sie auf einem MiniOS-System arbeiten oder das USB-Laufwerk korrekt eingehängt ist
- **Prüfen:** Führen Sie `sudo minios-kernel status` aus, um die Verzeichniserkennung zu prüfen

#### **Zugriff verweigert**

- **Ursache:** MiniOS-Verzeichnis ist schreibgeschützt oder unzureichende Berechtigungen
- **Lösung:** Stellen Sie sicher, dass Sie Administratorrechte besitzen und das Dateisystem beschreibbar ist
- **Prüfen:** Überprüfen Sie den Status des MiniOS-Verzeichnisses in der GUI oder CLI

#### **Paketinstallation fehlgeschlagen**

- **Ursache:** Beschädigtes Paket, Netzwerkprobleme oder Abhängigkeitsfehler
- **Lösung:**
  - Integrität der Paketdatei prüfen
  - Netzwerkverbindung für Repository-Pakete prüfen
  - Paketlisten aktualisieren: `sudo apt update`

#### **Kernel-Panik nach der Aktivierung**

- **Ursache:** Inkompatibler Kernel oder fehlende Treiber
- **Was tun:** Booten Sie ein bekannt funktionierendes MiniOS-System, sichern Sie wichtige Daten und stellen Sie nur dann ein vollständiges, funktionierendes Kernel-Set wieder her, wenn eines verfügbar ist. Andernfalls installieren Sie die betroffene MiniOS-Installation neu. Versuchen Sie nicht, das System zu reparieren, indem Sie einzelne Kernel-, Initramfs- oder `01-kernel-*.sb`-Dateien mischen. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

#### **System startet alten Kernel**

- **Ursache:** Bootloader-Konfiguration wurde nicht korrekt aktualisiert
- **Lösung:**
  - Kernel-Aktivierung erneut durchführen: `sudo minios-kernel activate <version>`
  - Prüfen, ob der Kernel korrekt verpackt und installiert wurde

#### **Hardware funktioniert nach Kernel-Wechsel nicht**

- **Ursache:** Fehlende Treiber im neuen Kernel
- **Lösung:**
  - Prüfen, ob die SquashFS-Kernelmodul-Datei installiert wurde
  - Überprüfen, ob der neue Kernel Ihre Hardware unterstützt
  - Gegebenenfalls eine andere Kernel-Variante verwenden

#### **Wiederherstellung nach fehlgeschlagenem Kernel-Wechsel**

Kopieren Sie kein einzelnes Kernel-Image, Initramfs oder `01-kernel-*.sb`-Modul aus einem anderen Image. Ein bootfähiger MiniOS-Kernel erfordert das koordinierte Set. Wenn kein vollständiges, funktionierendes Set bereits über den Kernel-Management-Workflow verfügbar ist, installieren Sie die betroffene MiniOS-Installation neu, anstatt Boot-Komponenten manuell zusammenzustellen. Sichern Sie wichtige Daten zuerst; siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting).

### **Diagnosebefehle:**

**Aktuellen Systemstatus prüfen:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Kernel-Dateien prüfen:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Bootloader-Konfiguration prüfen:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## Übersicht der Dateistruktur

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

**Hinweis:** Das Standardmodul `01-kernel-<version>.sb`, das mit MiniOS ausgeliefert wird, enthält zusätzliche Treiber, die über die im ursprünglichen Repository-Kernelpaket enthaltenen hinausgehen. Diese zusätzlichen Treiber sorgen für eine verbesserte Hardware-Kompatibilität bei WLAN-Adaptern und Speichergeräten.

### **Statusanzeigen:**

- **AKTIV:** Kernel im Bootloader konfiguriert (wird beim nächsten Neustart gebootet)
- **LÄUFT:** Aktuell ausgeführter Kernel
- **VERFÜGBAR:** Paketiert und bereit zur Aktivierung

### **Automatische Abläufe:**

- Kernel-Paketierung und -Komprimierung
- Initramfs-Erstellung mit passenden Treibern
- Installation ins MiniOS-Repository
- Aktualisierung der Bootloader-Konfiguration
- Symlink-Verwaltung für aktive Kernel
- Aufräumen temporärer Dateien

---

## Best Practices

### **Kernel-Auswahl:**

- Verwenden Sie nach Möglichkeit Kernel aus den offiziellen Debian/Ubuntu-Repositories
- Testen Sie neue Kernel zunächst in Nicht-Produktivumgebungen
- Halten Sie mindestens einen bekannten, funktionierenden Kernel für die Wiederherstellung bereit

### **Vor der Installation:**

- Prüfen Sie, ob das MiniOS-Verzeichnis beschreibbar ist
- Stellen Sie sicher, dass ausreichend Speicherplatz vorhanden ist (Kernel können 100–500 MB groß sein)
- Aktualisieren Sie die Paketlisten für Repository-Kernel

### **Nach der Installation:**

- Testen Sie den neuen Kernel gründlich
- Überprüfen Sie, ob alle Hardware-Komponenten korrekt funktionieren
- Behalten Sie den vorherigen Kernel als Backup, bis der neue als stabil gilt

### **Wiederherstellungsplanung:**

- Behalten Sie immer ein vollständiges, bekannt funktionierendes Kernel-Triplet
- Wissen Sie, wie Sie bei Bedarf von einem Rettungsmedium booten
- Dokumentieren Sie, welche Kernel mit Ihrer Hardware-Konfiguration funktionieren
