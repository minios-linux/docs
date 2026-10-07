---
updated: 2026-10-06
---

# MiniOS Anwendungen

MiniOS bietet grafische und Kommandozeilen-Tools für Konfiguration, Installation, Sitzungen, Module, Kernel, Software und Image-Remastering. Diese Werkzeuge sind auf die modulare Live-Architektur ausgerichtet, wie sie in [Über MiniOS](/getting-started/About-MiniOS).

## Verfügbarkeit

Die verfügbaren Tools hängen von den im MiniOS-Image enthaltenen Paketen ab. Prüfen Sie ein laufendes Live-System mit `dpkg-query`, oder untersuchen Sie die Imagemodule und [Paketlisten](/reference/Package-and-Edition-Contents).

Eine native Installation behält das gewohnte MiniOS Desktop-Erlebnis – mit identischer visueller Gestaltung, ausgewählter Desktop-Umgebung und Standardanwendungen – übernimmt jedoch nicht die MiniOS-spezifische Verwaltungssoftware für die Live-Architektur. Sitzungen, `.sb` Module, modulare Kernelverwaltung und ähnliche Workflows entfallen, sodass das installierte System stattdessen die üblichen Debian-Tools für Pakete, Kernel, Konfiguration und Bootloader verwendet.

## Grafische Tools

| Aufgabe | Werkzeug | Geltungsbereich | Dokumentation |
|---|---|---|---|
| MiniOS Start- und Sitzungseinstellungen bearbeiten | **MiniOS-Konfigurator** | Für das MiniOS Live-Konfigurationsmodell. Einstellungen werden für einen späteren Live-Start geschrieben und wirken sich nicht sofort auf das laufende System aus. | [MiniOS-Konfigurator](/preparing-and-customizing/Preconfiguring-MiniOS) |
| MiniOS auf eine andere Festplatte installieren | **MiniOS-Installationsprogramm** | Wird aus einer MiniOS Live-Session gestartet. Im Live-Modus bleibt die vollständige MiniOS Live-Umgebung erhalten; im nativen Modus wird ein klassischer Debian-Desktop erstellt und die für den Live-Betrieb vorgesehene MiniOS-spezifische Software entfernt. | [MiniOS-Installationsprogramm](/installing-minios/MiniOS-Installer) |
| Persistente Sitzungen erstellen, auswählen, einbinden, vergrößern, speichern, zurückfordern, verschlüsseln oder entfernen | **MiniOS-Sitzungsmanager** | Nur für MiniOS Live-Systeme. Unterstützte RAM-basierte Sitzungen können im Ursprungspeicher gespeichert, LUKS-Passphrasen geändert und inaktive Containersitzungen für den Dateizugriff eingebunden werden. | [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) |
| MiniOS Kernel paketieren, aktivieren, prüfen oder entfernen | **MiniOS-Kernelmanager** | Nur für MiniOS modulare Live-Systeme. Die Paketierung aus dem Repository kann auch kompatible Treiber aus dem kuratierten MiniOS DKMS-Katalog hinzufügen. | [Kernelverwaltung](/preparing-and-customizing/Managing-Kernels) |
| Anwendungen installieren oder Anwendungs-Module aus Katalog-Rezepten bauen | **MiniOS-App-Store** | MiniOS Live-Systeme. Modul-Builds können auf Rezept- oder expliziter Build-Base-Ebene erfolgen; Rezepte können eine Lizenzbestätigung erfordern. | [MiniOS-App-Store](/using-minios/Installing-Software) |
| Ein vorhandenes MiniOS Image über ein geführtes Projekt remastern | **MiniOS-Abbildersteller** | Funktioniert mit MiniOS Live-Image-Inhalten aus der laufenden Live-Session, einer ISO oder optischen Medien. Module können ausgewählt, Sitzungsänderungen übernommen und unterstütztes Bootmenü-Verhalten konfiguriert werden, bevor ein weiteres geprüftes Live-ISO erzeugt wird. | [MiniOS-Abbildersteller](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Module inspizieren, erstellen, aktivieren und auswählen`.sb` Module | **MiniOS-Modulmanager** | Nur für MiniOS Live-Systeme; Modulkombination und Aktivierung zur Laufzeit hängen vom geschichteten `.sb` Root-Modell ab. | [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules) |
| Festplatten-Images schreiben/lesen, Speicher formatieren oder ein Gerät löschen | **Laufwerksprogramm** | Allgemeines Speicher-Tool, enthalten in MiniOS. Das Schreiben von Roh-Images führt keine verwaltete Bereitstellung wie das MiniOS-Installationsprogramm durch. | [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility) |
| Installierte Dokumentation offline durchsuchen | **MiniOS-Hilfe** | Nativer GTK-Viewer für ein vorab kompiliertes Dokumentationspaket; benötigt zur Laufzeit weder Website, WebKit noch Netzwerkverbindung. | [MiniOS Dokumentation](/) |
| Die lokalisierte Einführung beim ersten Start anzeigen | **MiniOS Willkommen** | Lokale, browserbasierte Willkommensseite mit Mio, Projektlinks, Hilfe, Community und Support-Hinweisen. Es handelt sich um eine Einführung und nicht um ein Systemkonfigurationstool. | [Schnellstart](/getting-started/Quick-Start) |

## Kommandozeilen-Tools

Die meisten grafischen Tools verfügen über ein öffentliches Kommandozeilen-Pendant oder Backend. Diese Befehle werden entweder im gleichen Paket wie die grafische Anwendung oder in einem erforderlichen Zusatzpaket bereitgestellt. Das gemeinsame Kernmanifest enthält `minios-tools` und `minios-image-compose`. Die Verfügbarkeit der anderen Befehle richtet sich nach den jeweiligen grafischen Paketen. Ob sie auf einem bestimmten installierten System oder Image vorhanden sind, muss jeweils direkt geprüft werden.

### Bereitstellung und Sitzungen

| Aufgabe | Werkzeug | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Zielplatten auflisten, einen Bereitstellungsplan anzeigen oder MiniOS nicht-interaktiv installieren | **`minios-deploy`** | Wird aus einer MiniOS Live-Session ausgeführt. Die Installation erfordert Root-Rechte und eine explizite Bestätigung; im nativen Modus, sofern unterstützt, wird ein klassischer Debian-Desktop aus dem gewählten Image erstellt. | [Kommandozeilen-Bereitstellung](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Persistente Sitzungen erstellen, aktivieren, speichern, einbinden, vergrößern, zurückfordern, Verschlüsselungsdaten ändern, exportieren, importieren oder entfernen | **`minios-session`** | Erfordert Root-Rechte und ein MiniOS Live-System mit kompatiblem Persistenzspeicher. RAM-gestütztes Speichern, getrennte Einbindungen und backend-spezifische Operationen sind durch Fähigkeiten begrenzt. | [Sitzungsbefehle Referenz](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel und Images

| Aufgabe | Werkzeug | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Kernel auflisten, paketieren, aktivieren, prüfen oder entfernen | **`minios-kernel`** | Erfordert Root-Rechte und eine modulare MiniOS Live-Installation mit beschreibbarem MiniOS Root. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Vorhandene MiniOS Inhaltsstruktur per Skript oder Automatisierung remastern | **`minios-image-compose`** | Arbeitet mit MiniOS Live-Image-Inhalten und erzeugt ein bootfähiges ISO. | [ISO-Images per Kommandozeile zusammensetzen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Modul-Workflows

| Aufgabe | Werkzeug | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Module inspizieren und laufende oder nächste Modulsets verwalten | **`sb`** | Die Modulanalyse funktioniert auch außerhalb einer laufenden MiniOS-Sitzung. Laufende und nächste Moduloperationen erfordern ein MiniOS Live-Modul-Layout; Änderungen benötigen Root-Rechte. | [Module inspizieren und extrahieren](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [laufende und nächste Module verwalten](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Ein Modul aus Repository-Paketen oder lokalen `.deb` Dateien erstellen | **`apt2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Session. Pakete werden in einer isolierten Build-Umgebung installiert, nicht im laufenden Root. | [Modul aus Paketen erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Ein Modul durch Ausführen eines Installationsskripts erstellen | **`script2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Session. Das Skript läuft nicht-interaktiv in einer isolierten Build-Umgebung. | [Modul aus Skript erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Ein Modul interaktiv in einer vorbereiteten Umgebung erstellen | **`chroot2sb`** | Erfordert Root-Rechte und eine unterstützte MiniOS Live-Session. Verwenden Sie diese Option, wenn die Installation Rückfragen oder manuelle Änderungen erfordert. | [Modul interaktiv erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Zwischen einem Verzeichnisbaum und einem `.sb` Modul konvertieren | **`dir2sb`**, **`sb2dir`** | Normale Konvertierung ist ohne Root-Rechte möglich und kann außerhalb einer Live-Session erfolgen. Für eine originalgetreue Extraktion und erneute Paketierung mit ursprünglichen Besitzern und Spezialdateien ist Root erforderlich; grafische Workflows fordern Administratorrechte an. | [Modul erstellen](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) oder [extrahieren](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) eines Moduls; `man dir2sb`, `man sb2dir` |
| Änderungen aus der beschreibbaren Session-Schicht in ein Modul übernehmen | **`savechanges`** | Erfordert Root-Rechte und eine laufende MiniOS Live-Session mit unterstütztem beschreibbarem Backend. | [Aktuelle Sitzungsänderungen übernehmen](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Speicher-Workflows

| Aufgabe | Werkzeug | Geltungsbereich | Dokumentation |
|---|---|---|---|
| Festplatten-Images lesen oder schreiben, ein Gerät formatieren oder Speicher löschen | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Allgemeine Festplattenoperationen. Löschen unterstützt Controller-Erase, Discard und Host-Overwrite, sofern das Gerät und die erforderlichen Tools dies unterstützen. Zerstörerische Vorgänge erfordern in der Regel Root-Rechte. | [Laufwerksprogramm](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Für Änderungen an Quellpaketlisten, Kernel, Boot-Artefakten oder der gesamten Modulkette verwenden Sie bitte stattdessen das Quell-Buildsystem und nicht eines der Image-Remastering-Tools. Siehe [Build von MiniOS](/development/Building-MiniOS).
