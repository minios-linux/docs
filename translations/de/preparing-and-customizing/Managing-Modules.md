---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Module verwalten

Der MiniOS-Modulmanager ist die grafische Anwendung zum Anzeigen, Erstellen und Verwalten von MiniOS-Modulen im Format `.sb`. Es gibt zwei Arbeitsbereiche: **Module** zur Systemzusammenstellung und **Erstellen** zum Anlegen neuer Module.

Sie können ihn über das Anwendungsmenü starten oder mit:

```bash
minios-module-manager
```

Die Anwendung selbst läuft unter Ihrem Desktop-Benutzer. Administratorrechte werden nur abgefragt, wenn eine angeforderte Aktion diese benötigt.

## Aktuell laufend und beim nächsten Start

Der Arbeitsbereich Module bietet zwei getrennte Ansichten:

- **Aktuell laufend** ist die geordnete Menge von Modulen, die derzeit das Live-System bilden.
- **Nächster Start** ist die geordnete Menge, die von den aktuellen MiniOS-Startregeln ausgewählt wird.

Eine Änderung in einer Ansicht ändert die andere nicht stillschweigend. Zum Beispiel betrifft **Für diese Sitzung aktivieren** nur das laufende System, während **Zum nächsten Start hinzufügen** ein Modul in den dauerhaften Modulspeicher kopiert, ohne es jetzt zu aktivieren.

Die maßgeblichen Startzeit-Regeln, einschließlich Kandidatenquellen-Tiers, exakter Basename-Ersetzung, numerischer Reihenfolge sowie Filterung durch `load=`, `noload=` und `bext=`, finden Sie unter [Initrd-Modulladen](/reference/boot-process/Module-Loading). Dort wird auch erklärt, warum "Aktuell laufend" und "Nächster Start" voneinander abweichen können.

Laufzeit-Aktivierung und -Deaktivierung sind nur verfügbar, wenn das Root-Dateisystem aktuell AUFS verwendet. Sie stehen auf einem OverlayFS-Root nicht zur Verfügung, selbst wenn der Kernel AUFS unterstützt. Basismodule können über die Anwendung nicht deaktiviert werden.

Änderungen für den nächsten Start sind nur möglich, wenn MiniOS geeigneten dauerhaften, beschreibbaren Modulspeicher findet. Basismodule sowie Module auf schreibgeschützten oder flüchtigen Speichern können nicht entfernt werden. Startfilter wie `load`, `noload` und `bext` bestimmen weiterhin, welche Module ausgewählt werden.

## Modul inspizieren

Wählen Sie ein Modul aus, um dessen Quelle, komprimierte Größe und Dateisystem-Inhalt anzuzeigen. Ist die zugrunde liegende Datei verfügbar, erstellt **In Ordner extrahieren** ein neues Verzeichnis mit den Moduldaten.

Für die Inspektion und das normale Extrahieren sind keine Administratorrechte erforderlich. Beim Extrahieren werden niemals vorhandene Ziele überschrieben.

Sie können auch eine lokale `.sb`-Datei aus dem Dateimanager öffnen. Das Öffnen einer Datei dient nur der Inspektion; sie wird dabei weder aktiviert noch zum nächsten Start hinzugefügt.

## Ein Modul erstellen

Der Arbeitsbereich „Erstellen“ verwendet einen **Konfigurieren**, **Überprüfen**, **Ausführen**, und **Ergebnis**-Ablauf. Ein erfolgreich erstelltes Modul bleibt als Datei am Ausgabepfad erhalten. Es wird nicht aktiviert und nicht automatisch zu Next Boot hinzugefügt.

Verfügbare Methoden:

- **Pakete** installiert Repository-Pakete und ausgewählte lokale `.deb`-Dateien einschließlich ihrer Abhängigkeiten in einer isolierten MiniOS-Build-Umgebung. Für die Paketinstallation ist eine Administrator-Authentifizierung erforderlich.
- **Installationsskript** führt ein geprüftes Skript ohne interaktives Terminal aus. Ein optionaler Seed-Ordner kann Anfangsdateien bereitstellen. Das Skript läuft mit Administratorrechten, wird aber nicht im resultierenden Modul gespeichert.
- **Interaktives Chroot** öffnet eine temporäre Root-Shell im eingebetteten Terminal. Geben Sie `exit` ein, wenn Sie fertig sind. Anschließend können Sie das Modul erstellen, die Shell erneut öffnen oder die Änderungen verwerfen. Das Schließen oder Verwerfen der Sitzung verändert das laufende System nicht.
- **Ordner** verpackt den Inhalt eines bestehenden Verzeichnisses. Das Quellverzeichnis selbst wird nicht im Modul verschachtelt. Die normale Ordner-Konvertierung erfolgt ohne Root-Rechte, lässt die Quelle unverändert und setzt den Besitz im Modul auf root.
- **Aktuelle Sitzungsänderungen** erfasst geeignete Dateien und Löschungen aus der aktuellen beschreibbaren Sitzungsschicht. Es verwendet die Standard-MiniOS `savechanges`-Richtlinie, die Protokolle, Caches, Bootdaten und temporäre Laufzeitpfade ausschließt. Das Auslesen der vollständigen beschreibbaren Schicht erfordert Administrator-Authentifizierung.

Wählen Sie für jeden Workflow einen neuen Ausgabepfad. Vorhandene Dateien werden nie überschrieben. Während einer laufenden Operation bleiben Fortschritt und Backend-Diagnosen sichtbar, und die Erfassung der aktuellen Sitzung kann abgebrochen werden.

Aktuelle Sitzungsänderungen sind für die bequeme Standarderfassung gedacht, nicht für die Überprüfung jedes enthaltenen Pfads. Eine aktive beschreibbare Schicht kann persönliche oder vertrauliche Daten enthalten. Für gezielte `exact`, `clean`, oder pfadbasierte Datenschutzrichtlinien verwenden Sie das Kommandozeilen-`savechanges`-Workflow, wie beschrieben in [Aktuelle Sitzungsänderungen erfassen](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Drag & Drop

Drag & Drop dient nur zum Ausfüllen eines Eingabefelds oder zum Öffnen der Inspektion:

- Ein Modul öffnet dessen Details.
- `.deb`-Dateien werden zu Pakete hinzugefügt.
- Ein Verzeichnis wird für Ordner ausgewählt.
- Eine andere reguläre Datei wird als Installationsskript ausgewählt.

Das Ablegen eines Elements führt keinen Code aus und ändert weder Aktuell laufend noch Nächster Start.

## Zugehörige Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Images über die Kommandozeile erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Boot-Parameter](/reference/Boot-Parameters)

## Module erstellen

MiniOS-Module sind schreibgeschützte SquashFS-Dateisystem-Images, die üblicherweise mit der Endung `.sb` benannt werden. Beim Systemstart ordnet MiniOS die ausgewählten Module zu einem geschichteten Root-Dateisystem an. Dateien in einer höher priorisierten Ebene können Dateien aus niedrigeren Ebenen ergänzen oder überdecken. Diese modulare Live-Pipeline ist Teil der charakteristischen MiniOS-Architektur, wie in [Über MiniOS](/getting-started/About-MiniOS) und [Boot-Modi](/using-minios/Boot-Modes) beschrieben. Nach der nativen Umwandlung wird das geschichtete `.sb`-Root durch ein herkömmliches, beschreibbares Debian-Dateisystem ersetzt. Die MiniOS-Modulverwaltungssoftware wird entfernt, da die Modul-Workflows nicht mehr gelten, während die gewählte Desktop-Umgebung und normale Anwendungen als gewöhnliche Pakete installiert bleiben.

Diese Anleitung dokumentiert die aktuellen MiniOS Tools-Kommandozeilen-Workflows. Für die grafische Anwendung siehe [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules). Für den vollständigen Image-Bauprozess und die Systemarchitektur siehe [Bau von MiniOS](/development/Building-MiniOS). Die beim Bau von MiniOS verwendeten Paketlisten sind in der [CondinAPT-Dokumentation](/development/CondinAPT) beschrieben.

### Sicherheit und Privilegien

Nicht jede Moduloperation erfordert Root-Rechte:

| Vorgang | Privileg |
|---|---|
| Aktuell laufend oder Nächster Start mit `sb` auflisten | Ohne Root |
| Modul mit `sb inspect` inspizieren | Ohne Root |
| Normale `dir2sb`- und `sb2dir`-Konvertierung | Ohne Root |
| Eigentümer erhalten oder Spezialdateien bei der Konvertierung zulassen | Root |
| Bauen mit `apt2sb`, `script2sb` oder `chroot2sb` | Root |
| Sitzung mit `savechanges` erfassen | Root |
| Aktivieren, deaktivieren, zum nächsten Start hinzufügen oder daraus entfernen | Root |

Die Builder verwenden ein isoliertes Union-Dateisystem und installieren keine Pakete oder Skriptänderungen ins laufende Root. Auch die Erstellung aktiviert das Ergebnis nicht und wählt es nicht für den nächsten Start aus.

Aktuelle Konverter und Builder nutzen No-Replace-Publikation. Ein bereits existierendes Ziel, auch symbolische Links, wird nicht überschrieben. Wählen Sie einen neuen Ausgabepfad oder prüfen und entfernen Sie das alte Ziel explizit selbst.

Verwenden Sie die `--help`-Ausgabe jedes Befehls als Referenz für die installierte Version. Die Standard-Komprimierungsoptionen des Builders sind `zstd` (Standard), `gzip`, `lzo` und `xz`; `dir2sb` unterstützt außerdem `lz4`.

### Modulnamen und Filterebenen

Namen beginnen häufig mit einer Zahl wie `06-browser.sb`, da die Schichtreihenfolge die Konfliktlösung beeinflusst. Ein Modul sollte Pfade relativ zum System-Root enthalten, wie `usr/bin/example`, und nicht ein zusätzliches Verzeichnis, das diesen Baum enthält.

Für die genauen Kandidatenquellen-Tiers, das Verhalten bei Basename-Kollisionen, die numerische Reihenfolge und die Semantik von `bext=`, `load=` und `noload=` siehe [Initrd-Modulladen](/reference/boot-process/Module-Loading). Verwenden Sie insbesondere einen eindeutigen Basename, es sei denn, das Modul soll gezielt den gleichnamigen Slot aus einer früheren Quell-Tier ersetzen.

Die Option `--level LEVEL` auf `apt2sb`, `script2sb` und `chroot2sb` begrenzt die Basisschichten, die zum Aufbau der Build-Union verwendet werden. Mit `--level 3` werden nummerierte Schichten bis `03` verwendet und höher nummerierte Schichten herausgefiltert. Das kann ein Modul weniger abhängig von optionalen höheren Schichten machen, führt aber dazu, dass mehr Abhängigkeiten im Ergebnis enthalten sind.

### Modul aus Paketen erstellen

`apt2sb` installiert Repository-Pakete oder lesbare lokale `.deb`-Dateien in ein privates Build-Union und erfasst das Ergebnis. Erfordert eine unterstützte MiniOS-Live-Sitzung und Root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Ohne `--name` wird der Ausgabename vom ersten Paket abgeleitet. Nützliche APT-Optionen sind `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` und `--target-release RELEASE`. Die Target-Release-Option gilt nur für `install`.

Um Upgrades bereits installierter Pakete zu erfassen:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Ein Modul aus einem Skript erstellen

`script2sb` kopiert ein Installationsskript in ein privates Chroot, macht es ausführbar, führt es als root ohne interaktives Terminal aus, entfernt es anschließend und erfasst die resultierenden Änderungen am Dateisystem. Bei einem Fehler wird kein Modul erstellt.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Optional `--directory DIR` kopiert vor dem Ausführen des Skripts alle Quellinhalte, einschließlich versteckter Dateien, in das Modul-Root. Strukturieren Sie das Seed-Verzeichnis als Dateisystembaum:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Überprüfen Sie das Skript, bevor Sie es ausführen. Es läuft mit Administratorrechten und kann beliebige Befehle ausführen. Verwenden Sie `chroot2sb` stattdessen, wenn bei der Installation Eingaben oder manuelle Arbeit erforderlich sind.

### Ein Modul interaktiv erstellen

`chroot2sb` erstellt ein privates Build-Union und öffnet darin eine Root-Shell. Installieren Sie Pakete oder bearbeiten Sie Dateien; beenden Sie die Shell, um die Änderungen zu übernehmen:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Befehle, die in der Shell eingegeben werden, werden beim Laden des Moduls nicht erneut ausgeführt; das Modul ist ein Schnappschuss des resultierenden Dateisystemzustands. Die Shell-Historie wird entfernt. Wird kein Name angegeben, wird ein Name mit aktuellem Datum und Uhrzeit generiert.

Das aufgeteilte `prepare`, `shell`, `finish` und `cancel` Lebenszyklusmodell existiert für geschützte grafische Frontends. Für die normale Terminalnutzung verwenden Sie den oben gezeigten interaktiven Einzelbefehl.

### Ein Modul aus einem Verzeichnis erstellen

`dir2sb` verpackt den Inhalt eines vorbereiteten Verzeichnisses in ein neues Modul. Beide Operanden sind erforderlich:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Die Standard-Konvertierung benötigt keine Root-Rechte. Die Quelle bleibt unverändert, Eigentümer im Modul werden auf root normalisiert, Gerätedateien, Sockets und FIFOs werden abgelehnt und das Ziel wird nie überschrieben. Verwenden Sie `--keep-ownership` oder `--allow-special` nur, wenn diese privilegierten Semantiken benötigt werden.

### Änderungen der aktuellen Sitzung erfassen

`savechanges` liest die maßgebliche beschreibbare Schicht einer laufenden MiniOS-Sitzung aus. Root-Rechte sind erforderlich, da diese Schicht root-exklusive Dateien enthalten kann. Der Standardpfad für Änderungen wird automatisch erkannt:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Ohne `--profile`, lässt die historische MiniOS-Richtlinie leere Verzeichnisse, Caches, Protokolle, Bootdaten, Laufzeitpfade, Pseudodateisysteme sowie ausgewählte Sitzungs- und Systemdateien aus. Das ist praktisch für die herkömmliche Modulerstellung, stellt aber kein ausdrückliches Datenschutzversprechen dar.

Die expliziten Profile sind:

- `exact` bewahrt alle darstellbaren Änderungen, einschließlich Benutzerdaten, Protokolle, Caches, Identitätsdateien, Zugangsdaten und unterstützte Löschmetadaten. Nicht unterstützte Dateisystemobjekte werden abgelehnt, statt sie stillschweigend zu verlieren.
- `clean` verwendet eine enge, softwareorientierte Pfad-Positivliste. Es schließt Home- und Root-Daten, Protokolle, Caches, Identitäten, Netzwerkkonfiguration, Zugangsdaten, beliebige Systemkonfigurationen und `/usr/local` aus. Das reduziert das Datenschutzrisiko, kann aber nicht garantieren, dass eine zugelassene Softwaredatei keine Geheimnisse enthält.
- `selected` enthält nur geprüfte relative Pfade aus einer Inventar- und Auswahldatei. Explizite Ausschlüsse haben Vorrang. Dieses Profil ist geeignet, wenn das Modul nur einen kontrollierten Teil der Sitzungsänderungen enthalten soll.

Beispiele:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Eine Auswahldatei hat diese strikte JSON-Struktur:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Pfade sind normalisiert, nicht leer und relativ zum Änderungs-Root. Erstellen und prüfen Sie zuerst das Inventar; jede Aufnahme muss mit den Inventardaten übereinstimmen. Das Inventar enthält Metadaten wie Pfad, Typ, Kategorie, Sensitivität und Größe, liest oder speichert aber keine Dateiinhalte, Symlink-Ziele oder Geheimwerte. Ausgaben und Inventare im expliziten Profil sind Modus `0600`; Module mit Legacy-Policy sind Modus `0644`.

Die Sitzungsaufnahme kann unterstützte Dateilöschungen und Verzeichnis-Opazität für das aktive AUFS- oder OverlayFS-Backend beibehalten. Laufzeit-Mounts, verschachtelte Dateisysteme, Union-Verwaltung und die Ausgabe selbst werden ausgeschlossen. Ein vorhandenes Ziel wird nie ersetzt.

### Module inspizieren und extrahieren

Ein Modul inspizieren, ohne es einzuhängen oder zu extrahieren:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Die Inspektion ist ohne Root-Rechte möglich und funktioniert auch außerhalb einer laufenden MiniOS-Sitzung.

Ein Modul in ein neues Verzeichnis extrahieren:

```bash
sb2dir 06-example.sb example-root
```

Die Standardextraktion benötigt keine Root-Rechte und verändert die Quelle nicht. Das Zielverzeichnis darf nicht existieren. Spezielle Dateien werden abgelehnt, außer wenn `--allow-special` mit ausreichenden Rechten angefordert wird.

Von aktuellen `sb2dir` erzeugte Verzeichnisse sind normale Verzeichnisse. `rmsbdir`, `sb rm` und `sb rmdir` sind veraltete Kompatibilitätsbefehle, die das Entfernen grundsätzlich verweigern; sie hängen nichts aus und löschen nichts rekursiv. Prüfen Sie einen extrahierten Pfad und dessen Inhalt, bevor Sie ihn mit Standard-Dateisystemwerkzeugen entfernen.

### Laufende und Next-Boot-Module verwalten

„Jetzt laufend“ und „Next Boot“ sind unabhängige Zusammenstellungen. Siehe [Union-Erstellung und Laufzeitaktivierung](/reference/boot-process/Module-Loading#union-construction) für die Grenze zwischen Boot und Laufzeit und warum sich die beiden Listen unterscheiden können.

Listen Sie die Module auf, die das aktuelle AUFS- oder OverlayFS-Root tatsächlich zusammensetzen, von der niedrigsten bis zur höchsten Priorität:

```bash
sb list
sb list --json
```

Listen Sie die Module auf, die durch die aktuellen Boot-Regeln ausgewählt wurden:

```bash
sb next-boot
sb next-boot --json
```

Diese Abfragen funktionieren ohne Root-Rechte. Die kanonischen [Kandidatentier- und Ersetzungsregeln](/reference/boot-process/Module-Loading#candidate-tiers) bestimmen, welche Quelle für jeden Next-Boot-Basisnamen verwendet wird.

So machen Sie ein Benutzermodul beim nächsten Boot verfügbar:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS verwendet geeigneten dauerhaften beschreibbaren Speicher, bereitet die Kopie vor, prüft sie und veröffentlicht sie atomar, ohne ein bestehendes Modul zu ersetzen. Der Dateiname muss die aktuellen Boot-Filter erfüllen. Entfernen Sie ein ausgewähltes Benutzermodul anhand seines exakten Basisnamens:

```bash
sudo sb next-boot remove 50-extra.sb
```

Das Entfernen von Basismodulen sowie Modulen auf schreibgeschützten oder flüchtigen Quellen ist nicht möglich.

Die Aktivierung zur Laufzeit ist ein separater, nur für die Sitzung gültiger Vorgang:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivierung und Deaktivierung funktionieren nur, wenn `/` aktuell eine AUFS-Union ist. Sie stehen auf OverlayFS nicht zur Verfügung, und Kernel-AUFS-Unterstützung allein reicht nicht aus. Keine der beiden Befehle ändert Next Boot.

Der Dispatcher für Kompatibilitätskonvertierungen benötigt beide Operanden:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direkte `dir2sb` und `sb2dir`-Verwendung ist vorzuziehen, da die normale Konvertierung ohne Root-Rechte ausgeführt werden kann.

### Verwandte Dokumentation

- [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Images neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Bau von MiniOS](/development/Building-MiniOS)
- [Boot-Parameter](/reference/Boot-Parameters)
