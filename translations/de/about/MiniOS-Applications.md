---
updated: 2026-08-26
---

# MiniOS-Anwendungen und -Werkzeuge

MiniOS enthält Werkzeuge zur Konfiguration, Installation, Wartung und Remastering von MiniOS-Systemen. Verwenden Sie diese Seite, um ein Werkzeug auszuwählen, und folgen Sie dann dem verlinkten Leitfaden für Anforderungen, Sicherheitshinweise und Befehlsdetails.

## Prüfen, was installiert ist

Die aktuellen Xfce-Pakete beinhalten das grafische Set in den Editionen Standard, Toolbox und Ultra: Configurator, Installer, Session Manager, Kernel Manager, Store, Image Builder, Module Manager, MiniOS Help und Drive Utility.
Die Flux-Edition enthält dieses GUI-Set nicht, und Builds mit anderen Desktop- oder Konsolenumgebungen können es ebenfalls nicht enthalten. Die Auswahl der Pakete hängt außerdem von der jeweiligen Distribution und den Build-Optionen ab.

Das installierte Paketset oder das fertiggestellte Abbild ist maßgeblich. Überprüfen Sie ein laufendes System mit `dpkg-query` oder inspizieren Sie die Image-Module und Manifeste wie in [Pakete und Editionen](/administration/Packages.md) beschrieben.

## Wählen Sie ein grafisches Werkzeug

| Aufgabe | Werkzeug | Live- und native Anwendbarkeit | Dokumentation |
|---|---|---|---|
| MiniOS-Startzeit- und neue Sitzungs-Einstellungen bearbeiten | **MiniOS Configurator** | Für das MiniOS-Live-Konfigurationsmodell. Schreibt Einstellungen für einen späteren Live-Start und konfiguriert das laufende System nicht sofort um. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| MiniOS auf eine andere Festplatte installieren | **MiniOS Installer** | Aus einer MiniOS-Live-Sitzung heraus ausführen. Erstellt entweder eine modulare Live-Installation oder eine konventionelle native Installation, wenn das Abbild native Bereitstellung unterstützt. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Persistente Sitzungen erstellen, auswählen, vergrößern, speichern oder entfernen | **MiniOS Session Manager** | Nur für Live-Systeme. Native Installationen schreiben direkt ins Root-Dateisystem und nutzen keine MiniOS-Live-Sitzungen. | [Sitzungsverwaltung](/configuration/Session-Management.md) |
| MiniOS-Kernel paketieren, aktivieren, prüfen oder entfernen | **MiniOS Kernel Manager** | Für modulare Live-Installationen und deren MiniOS-Kernel-Repository gedacht. Bei nativer Installation wird der übliche Kernel-Workflow der Distribution verwendet. | [Kernelverwaltung](/administration/Kernel-Management.md) |
| Anwendungen installieren oder Anwendungs-Module aus Katalog-Rezepten bauen | **MiniOS Store** | Auf Live-Systemen Modul- oder Direktinstallation wählen; Persistenz bestimmt, ob direkte Änderungen einen Neustart überstehen. Native Installationen verwenden den Direktmodus. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Ein bestehendes MiniOS-Abbild über ein geführtes Projekt remastern | **MiniOS Image Builder** | Arbeitet mit MiniOS-Live-Abbildinhalten aus der laufenden Live-Sitzung, einer ISO oder optischen Medien. Erstellt eine weitere Live-ISO; pflegt keine native Installation und ersetzt keinen Quell-Build. | [MiniOS Image Builder](/development/Image-Builder.md) |
| `.sb`-Module prüfen, erstellen, aktivieren und auswählen | **MiniOS Module Manager** | Modulerstellung und Laufzeitaktivierung sind Live-System-Funktionen. Native Installationen nutzen nicht das geschichtete `.sb`-Root-Modell. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Installierte MiniOS-Dokumentation lesen | **MiniOS Help** | Ein lokaler Dokumentationsbetrachter. Kann überall genutzt werden, wo das `minios-help`-Paket und sein Dokumentationssatz installiert sind. | [MiniOS-Dokumentation](/) |
| MiniOS-ISO auf einen USB-Stick schreiben | **Drive Utility** | Kann in einem Live- oder nativen grafischen System ausgeführt werden, wenn installiert. Schreibt bootfähige Medien; führt keine Live- oder native Bereitstellung wie der MiniOS Installer durch. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Wählen Sie ein Kommandozeilen-Werkzeug

Das gemeinsame Core-Manifest enthält derzeit `minios-tools` und `minios-image-compose`, auch in der Flux-Edition. Ihre tatsächliche Verfügbarkeit in einem bestimmten installierten System oder Abbild muss dennoch direkt geprüft werden.

### Mit Modulen und Sitzungsänderungen arbeiten

Verwenden Sie die MiniOS-CLI-Werkzeuge, wenn Sie einen skriptfähigen Modul-Workflow benötigen:

- `sb` prüft Module und verwaltet die laufenden sowie die für den nächsten Start vorgesehenen Modulsets.
- `apt2sb`, `script2sb` und `chroot2sb` bauen Module in einer isolierten Umgebung.
- `dir2sb` und `sb2dir` konvertieren zwischen Verzeichnisbäumen und `.sb`-Modulen.
- `savechanges` erfasst berechtigte Änderungen aus einer beschreibbaren Live-Sitzung in einem Modul.
- `rmsbdir` entfernt ein Modul-Extraktionsverzeichnis mit den erforderlichen Sicherheitsprüfungen.

Die meisten Build-, Capture-, Aktivierungs- und Next-Boot-Operationen erfordern ein MiniOS-Live-Modul-Layout. Grundlegende Dateikonvertierung und -prüfung sind auch außerhalb einer laufenden Live-Sitzung nützlich, wenn die benötigten Werkzeuge und Eingabedateien verfügbar sind.
Siehe [Module erstellen](/development/Creating-Modules.md) für Berechtigungen, Ausgaberegeln und aktuelle Befehls-Workflows.

### Eine MiniOS-ISO zusammenstellen

Verwenden Sie `minios-image-compose` für Skripte, Automatisierung oder ein reproduzierbares, kommandozeilengesteuertes Remastering eines bestehenden MiniOS-Inhaltsbaums. Es kann Module auswählen, unterstützte Image-Konfiguration anwenden, optional kompatible Änderungen aus einer Live-Sitzung übernehmen, das Ergebnis prüfen und eine bootfähige ISO veröffentlichen. Es arbeitet mit MiniOS-Live-Abbildinhalten und konvertiert oder aktualisiert keine native Installation. Siehe [MiniOS-ISO-Abbilder von der Kommandozeile aus erstellen](/development/Rebuilding-ISO.md).

Für Änderungen an Quellpaketlisten, Kernels, Boot-Artefakten oder der gesamten Modulkette verwenden Sie stattdessen das Quell-Build-System und nicht eines der Image-Remastering-Werkzeuge. Siehe [MiniOS bauen](/development/Building-MiniOS.md).
