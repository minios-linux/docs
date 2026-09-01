---
updated: 2026-08-31
---

# MiniOS Anwendungen

MiniOS bietet grafische und Kommandozeilen-Tools für Konfiguration, Installation, Sitzungen, Module, Kernel, Software und Image-Remastering. Diese Tools sind auf der modularen Live-Architektur aufgebaut, wie in [Über MiniOS](/getting-started/About-MiniOS) beschrieben.

## Verfügbarkeit

Die verfügbaren Tools hängen von den in das MiniOS Image eingebundenen Paketen ab. Überprüfen Sie ein laufendes Live-System mit `dpkg-query` oder inspizieren Sie die Imagemodule und die [Paketlisten](/reference/Package-and-Edition-Contents).

Eine native Installation bewahrt das gewohnte MiniOS Desktop-Erlebnis – das visuelle Erscheinungsbild, die gewählte Desktop-Umgebung und die üblichen Anwendungen – übernimmt jedoch nicht die MiniOS-spezifische Verwaltungssoftware, die für die Live-Architektur entwickelt wurde. Sitzungen, `.sb` Module, modulare Kernelverwaltung und ähnliche Workflows entfallen, sodass das installierte System stattdessen die normalen Debian-Tools für Pakete, Kernel, Konfiguration und Bootloader verwendet.

## Grafische Tools

| Aufgabe | Tool | Geltungsbereich | Dokumentation |
|---|---|---|---|
| MiniOS Boot- und Sitzungseinstellungen bearbeiten | **MiniOS-Konfigurator** | Für das MiniOS Live-Konfigurationsmodell. Schreibt Einstellungen für einen späteren Live-Start und konfiguriert das laufende System nicht sofort um. | [MiniOS-Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS) |
| MiniOS auf eine andere Festplatte übertragen | **MiniOS-Installationsprogramm** | Läuft aus einer MiniOS Live-Sitzung. Im Live-Modus bleibt die vollständige MiniOS Live-Umgebung erhalten; im nativen Modus wird ein konventioneller Debian-Desktop erstellt und die für den Live-Betrieb gedachte MiniOS-spezifische Software entfernt. | [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) |
| Persistente Sitzungen erstellen, auswählen, vergrößern, speichern oder entfernen | **MiniOS-Sitzungsmanager** | Nur für MiniOS Live-Systeme. | [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) |
| MiniOS Kernel paketieren, aktivieren, inspizieren oder entfernen | **MiniOS-Kernelmanager** | Nur für MiniOS modulare Live-Systeme. | [Kernelverwaltung](/preparing-and-customizing/Managing-Kernels) |
| Anwendungen installieren oder Anwendungs-Module aus Katalog-Rezepten bauen | **MiniOS-App-Store** | MiniOS Live-Systeme. Wählen Sie Modul- oder direkte Systeminstallation; die Persistenz bestimmt, ob direkte Änderungen einen Neustart überstehen. | [MiniOS-App-Store](/using-minios/Installing-Software) |
| Ein bestehendes MiniOS Image über ein geführtes Projekt remastern | **MiniOS-Abbildersteller** | Arbeitet mit MiniOS Live-Image-Inhalten aus der laufenden Live-Sitzung, einer ISO oder optischen Medien. Erstellt ein weiteres Live-ISO. | [MiniOS-Abbildersteller](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| `.sb` Module inspizieren, erstellen, aktivieren und auswählen | **MiniOS-Modulmanager** | Nur für MiniOS Live-Systeme; Modulkombination und Aktivierung zur Laufzeit hängen vom geschichteten `.sb` Root-Modell ab. | [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules) |
| Eine MiniOS ISO auf ein USB-Laufwerk schreiben | **Laufwerksprogramm** | Generisches Festplatten-Image-Tool, das mit MiniOS enthalten ist. Erstellt bootfähige Medien; führt jedoch keine verwaltete Bereitstellung wie das MiniOS-Installationsprogramm durch. | [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) |
| Installierte Dokumentation offline durchsuchen | **MiniOS-Hilfe** | Liest die mitgelieferte Dokumentation ohne Netzwerkverbindung. | [MiniOS Dokumentation](/) |

## Kommandozeilen-Tools

Die meisten grafischen Tools verfügen über ein öffentliches Kommandozeilen-Pendant oder Backend. Diese Befehle werden entweder im selben Paket wie die grafische Anwendung oder in einem erforderlichen Begleitpaket ausgeliefert. Das gemeinsame Core-Manifest enthält `minios-tools` und `minios-image-compose`. Die anderen Befehle richten sich nach der Verfügbarkeit der jeweiligen grafischen Pakete. Ihre tatsächliche Präsenz in einem bestimmten installierten System oder Image muss jeweils direkt überprüft werden.

### Bereitstellung und Sitzungen

| Aufgabe | Tool | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Zieldatenträger auflisten, Bereitstellungsplan anzeigen oder MiniOS unbeaufsichtigt installieren | **`minios-deploy`** | Läuft aus einer MiniOS Live-Sitzung. Die Installation erfordert Root-Rechte und eine explizite Bestätigung; im nativen Modus, sofern unterstützt, wird aus dem gewählten Image ein konventioneller Debian-Desktop erstellt. | [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Persistente Sitzungen erstellen, aktivieren, speichern, vergrößern, exportieren, importieren oder entfernen | **`minios-session`** | Erfordert Root-Rechte und ein MiniOS Live-System mit einem kompatiblen Persistenzspeicher. | [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel und Abbilder

| Aufgabe | Tool | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Kernel auflisten, paketieren, aktivieren, inspizieren oder entfernen | **`minios-kernel`** | Erfordert Root-Rechte und eine modulare MiniOS Live-Installation mit einem beschreibbaren MiniOS Root. | [Kernelverwaltung](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Einen bestehenden MiniOS Inhaltbaum per Skript oder Automatisierung remastern | **`minios-image-compose`** | Arbeitet mit MiniOS Live-Image-Inhalten und erstellt ein bootfähiges ISO. | [ISO-Abbilder per Kommandozeile erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images); `man minios-image-compose` |

### Modul-Workflows

| Aufgabe | Tool | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Module inspizieren und laufende oder nächste Modulsets verwalten | **`sb`** | Modulinformationen können auch außerhalb einer laufenden MiniOS Sitzung angezeigt werden. Laufende und nächste Boot-Operationen erfordern ein MiniOS Live-Modullayout; Änderungen erfordern Root-Rechte. | [Module erstellen](/preparing-and-customizing/Managing-Modules); `man sb` |
| Ein Modul aus Repository-Paketen oder lokalen `.deb` Dateien bauen | **`apt2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Sitzung. Pakete werden in eine isolierte Build-Umgebung installiert, nicht ins laufende Root. | [Module erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Ein Modul durch Ausführen eines Installationsskripts bauen | **`script2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Sitzung. Das Skript läuft nicht-interaktiv in einer isolierten Build-Umgebung. | [Module erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Ein Modul interaktiv in einer vorbereiteten Umgebung bauen | **`chroot2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Sitzung. Verwenden Sie dies, wenn Installationen Eingaben oder manuelle Änderungen benötigen. | [Module erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Zwischen einem Verzeichnisbaum und einem `.sb` Modul konvertieren | **`dir2sb`**, **`sb2dir`** | Die normale Konvertierung ist ohne Root möglich und kann auch außerhalb einer laufenden Live-Sitzung genutzt werden, wenn die nötigen Tools und Eingabedateien vorhanden sind. | [Modul erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) oder [extrahieren](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); `man dir2sb`, `man sb2dir` |
| Geeignete Änderungen aus der beschreibbaren Sitzungsschicht in ein Modul übernehmen | **`savechanges`** | Erfordert Root-Rechte und eine laufende MiniOS Live-Sitzung mit einem unterstützten Backend für beschreibbare Schichten. | [Module erstellen](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Speicher-Workflows

| Aufgabe | Tool | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Festplatten-Images lesen oder schreiben, ein Gerät formatieren oder ein Gerät überschreiben | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Generische Festplattenoperationen. Schreiben, Formatieren und Löschen sind destruktiv und erfordern normalerweise Root-Rechte. | [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Für Änderungen an Quellpaketlisten, Kernel, Boot-Artefakten oder der gesamten Modulkette nutzen Sie stattdessen das Quell-Buildsystem und nicht eines der Image-Remastering-Tools. Siehe [MiniOS bauen](/development/Building-MiniOS).
