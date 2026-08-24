# MiniOS Modul-Manager

Der MiniOS Modul-Manager ist die grafische Anwendung zum Anzeigen, Erstellen und Verwalten von MiniOS `.sb` Modulen. Es gibt zwei Arbeitsbereiche: **Module** für die Systemzusammenstellung und **Erstellen** zum Anlegen neuer Module.

Sie können ihn über das Anwendungsmenü starten oder folgenden Befehl ausführen:

```bash
minios-module-manager
```

Die Anwendung läuft unter Ihrem Desktop-Benutzer. Administratorrechte werden nur abgefragt, wenn eine angeforderte Aktion diese benötigt.

## Aktuell ausgeführt und beim nächsten Start

Der Arbeitsbereich Module bietet zwei getrennte Ansichten:

- **Aktuell ausgeführt** ist die geordnete Liste der Module, die das laufende System aktuell zusammensetzen.
- **Nächster Start** ist die geordnete Auswahl, die durch die aktuellen MiniOS-Startregeln bestimmt wird.

Eine Änderung in einer Ansicht wirkt sich nicht automatisch auf die andere aus. Zum Beispiel betrifft **Für diese Sitzung aktivieren** nur das laufende System, während **Zum nächsten Start hinzufügen** ein Modul in den dauerhaften Modulspeicher kopiert, es aber jetzt nicht aktiviert.

Die Aktivierung und Deaktivierung zur Laufzeit ist nur möglich, wenn das Root-Dateisystem aktuell AUFS verwendet. Sie stehen auf einem OverlayFS-Root nicht zur Verfügung, selbst wenn der Kernel AUFS unterstützt. Basismodule können über die Anwendung nicht deaktiviert werden.

Änderungen für den nächsten Start sind nur möglich, wenn MiniOS einen geeigneten, dauerhaften und beschreibbaren Modulspeicher findet. Basismodule sowie Module auf schreibgeschützten oder flüchtigen Speichern können nicht entfernt werden. Boot-Filter wie `load`, `noload` und `bext` bestimmen weiterhin, welche Module ausgewählt werden.

## Modul inspizieren

Wählen Sie ein Modul aus, um dessen Quelle, komprimierte Größe und Dateisysteminhalte anzuzeigen. Ist die zugehörige Datei verfügbar, erstellt **In Ordner extrahieren** ein neues Verzeichnis mit den Modulinhalten.

Für die Inspektion und das normale Extrahieren sind keine Administratorrechte erforderlich. Beim Extrahieren werden bestehende Ziele niemals überschrieben.

Sie können auch eine lokale `.sb`-Datei aus dem Dateimanager öffnen. Das Öffnen einer Datei dient nur der Inspektion; sie wird dadurch weder aktiviert noch zum nächsten Start hinzugefügt.

## Modul erstellen

Der Arbeitsbereich Erstellen folgt einem Ablauf aus **Konfigurieren**, **Überprüfen**, **Ausführen** und **Ergebnis**. Ein erfolgreich erstelltes Modul bleibt als Datei am angegebenen Speicherort erhalten. Es wird nicht aktiviert und nicht automatisch zum nächsten Start hinzugefügt.

Verfügbare Methoden sind:

- **Pakete** installiert Repository-Pakete und ausgewählte lokale `.deb`-Dateien inklusive Abhängigkeiten in einer isolierten MiniOS-Build-Umgebung. Die Paketinstallation erfordert Administratorrechte.
- **Installationsskript** führt ein überprüftes Skript ohne interaktives Terminal aus. Ein optionaler Startordner kann Anfangsdateien bereitstellen. Das Skript läuft mit Administratorrechten, wird aber nicht im resultierenden Modul gespeichert.
- **Interaktives Chroot** öffnet eine temporäre Root-Shell im eingebetteten Terminal. Geben Sie `exit` ein, wenn Sie fertig sind, und erstellen Sie dann das Modul, öffnen Sie die Shell erneut oder verwerfen Sie die Änderungen. Das Schließen oder Verwerfen der Sitzung verändert das laufende System nicht.
- **Ordner** verpackt den Inhalt eines bestehenden Verzeichnisses. Das Quellverzeichnis selbst wird nicht im Modul verschachtelt. Die normale Ordner-Konvertierung ist ohne Root-Rechte möglich, lässt die Quelle unverändert und setzt die Besitzrechte im Modul auf root.
- **Aktuelle Sitzungsänderungen** erfasst berechtigte Dateien und Löschungen aus der aktuellen beschreibbaren Sitzungsschicht. Es verwendet die Standard-MiniOS-`savechanges`-Richtlinie, die Protokolle, Caches, Bootdaten und temporäre Laufzeitpfade auslässt. Das Auslesen der gesamten beschreibbaren Schicht erfordert Administratorrechte.

Wählen Sie für jeden Ablauf einen neuen Ausgabepfad. Bestehende Dateien werden niemals überschrieben. Fortschritt und Backend-Diagnosen bleiben während einer laufenden Aktion sichtbar, und die Erfassung der aktuellen Sitzung kann abgebrochen werden.

Aktuelle Sitzungsänderungen sind für eine bequeme Standarderfassung gedacht, nicht zur Überprüfung jedes enthaltenen Pfads. Eine laufende beschreibbare Schicht kann persönliche oder vertrauliche Daten enthalten. Für explizite `exact`, `clean` oder pfadbasierte Datenschutzrichtlinien nutzen Sie den Kommandozeilen-Workflow `savechanges`, wie unter [Module erstellen](/development/Creating-Modules.md) beschrieben.

## Drag & Drop

Drag & Drop dient nur zum Ausfüllen eines Eingabefelds oder zum Öffnen der Inspektion:

- Ein Modul öffnet dessen Details.
- `.deb`-Dateien werden zu Pakete hinzugefügt.
- Ein Verzeichnis wird für Ordner ausgewählt.
- Eine andere reguläre Datei wird als Installationsskript ausgewählt.

Das Ablegen eines Elements führt keinen Code aus und ändert weder Aktuell ausgeführt noch Nächster Start.

## Verwandte Dokumentation

- [Module erstellen](/development/Creating-Modules.md)
- [ISO-Abbilder neu erstellen](/development/Rebuilding-ISO.md)
- [Boot-Parameter](/configuration/Boot-Parameters.md)
