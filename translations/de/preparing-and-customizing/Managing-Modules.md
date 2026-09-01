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

## Modul erstellen

Der Arbeitsbereich Erstellen folgt einem Ablauf aus **Konfigurieren**, **Überprüfen**, **Ausführen** und **Ergebnis**. Ein erfolgreich erstelltes Modul bleibt als Datei am Ausgabepfad bestehen. Es wird nicht aktiviert und nicht automatisch zum nächsten Start hinzugefügt.

Verfügbare Methoden sind:

- **Pakete** installiert Repository-Pakete und ausgewählte lokale `.deb`-Dateien samt Abhängigkeiten in einer isolierten MiniOS-Build-Umgebung. Die Paketinstallation erfordert Administratorrechte.
- **Installationsskript** führt ein geprüftes Skript ohne interaktives Terminal aus. Ein optionaler Seed-Ordner kann Anfangsdaten bereitstellen. Das Skript läuft mit Administratorrechten, wird aber nicht im Modul gespeichert.
- **Interaktives Chroot** öffnet eine temporäre Root-Shell im eingebetteten Terminal. Geben Sie `exit` ein, wenn Sie fertig sind, und erstellen Sie dann das Modul, öffnen Sie die Shell erneut oder verwerfen Sie die Änderungen. Das Schließen oder Verwerfen der Sitzung verändert das laufende System nicht.
- **Ordner** verpackt den Inhalt eines bestehenden Verzeichnisses. Das Quellverzeichnis selbst wird nicht im Modul verschachtelt. Die normale Ordnerkonvertierung ist ohne Root-Rechte möglich, lässt die Quelle unverändert und setzt den Eigentümer im Modul auf root.
- **Änderungen der aktuellen Sitzung** erfasst zulässige Dateien und Löschungen aus der aktuellen beschreibbaren Sitzungsschicht. Es gilt die Standard-MiniOS-`savechanges`-Richtlinie, die Protokolle, Caches, Bootdaten und temporäre Laufzeitpfade auslässt. Das vollständige Auslesen der beschreibbaren Schicht erfordert Administratorrechte.

Wählen Sie für jeden Workflow einen neuen Ausgabepfad. Vorhandene Dateien werden nie überschrieben. Fortschritt und Backend-Diagnosen bleiben während des Vorgangs sichtbar, und die Erfassung der aktuellen Sitzung kann abgebrochen werden.

Die Methode "Änderungen der aktuellen Sitzung" ist für den bequemen Standard-Export gedacht, nicht zur Überprüfung jedes enthaltenen Pfads. Eine Live-Sitzungsschicht kann persönliche oder vertrauliche Daten enthalten. Für explizite `exact`, `clean` oder pfadbasierte Datenschutzrichtlinien nutzen Sie den Kommandozeilen-Workflow `savechanges`, wie unter [Module erstellen](/preparing-and-customizing/Managing-Modules) beschrieben.

## Drag & Drop

Drag & Drop dient nur zum Ausfüllen eines Eingabefelds oder zum Öffnen der Inspektion:

- Ein Modul öffnet dessen Details.
- `.deb`-Dateien werden zu Pakete hinzugefügt.
- Ein Verzeichnis wird für Ordner ausgewählt.
- Eine andere reguläre Datei wird als Installationsskript ausgewählt.

Das Ablegen eines Elements führt keinen Code aus und ändert weder Aktuell laufend noch Nächster Start.

## Verwandte Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Images per Kommandozeile zusammenstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
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

### Modul aus Skript erstellen

`script2sb` kopiert ein Installationsskript in ein privates Chroot, macht es ausführbar, führt es als Root ohne interaktives Terminal aus, entfernt es anschließend und erfasst die resultierenden Dateisystemänderungen. Ein fehlgeschlagenes Skript erzeugt kein Modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Das optionale `--directory DIR` kopiert alle Quellinhalte, einschließlich versteckter Dateien, vor dem Skriptlauf ins Modul-Root. Ordnen Sie das Seed-Verzeichnis als Dateisystembaum an:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Überprüfen Sie das Skript vor dem Ausführen. Es wird mit Administratorrechten ausgeführt und kann beliebige Befehle ausführen. Nutzen Sie stattdessen `chroot2sb`, wenn die Installation Eingaben oder manuelle Arbeit erfordert.

### Modul interaktiv erstellen

`chroot2sb` erstellt ein privates Build-Union und öffnet darin eine Root-Shell. Installieren Sie Pakete oder bearbeiten Sie Dateien und beenden Sie die Shell, um die Änderungen zu erfassen:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Die im Terminal eingegebenen Befehle werden beim Laden des Moduls nicht erneut ausgeführt; das Modul ist ein Schnappschuss des resultierenden Dateisystemzustands. Die Shell-Historie wird entfernt. Wenn kein Name angegeben wird, wird ein Name mit aktuellem Datum und Uhrzeit generiert.

Der aufgeteilte `prepare`, `shell`, `finish` und `cancel`-Lebenszyklus existiert für geschützte grafische Frontends. Für die normale Terminalnutzung verwenden Sie den oben gezeigten Einzelbefehl.

### Modul aus Verzeichnis erstellen

`dir2sb` verpackt den Inhalt eines vorbereiteten Verzeichnisses in ein neues Modul. Beide Operanden sind erforderlich:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Normale Konvertierung ist ohne Root-Rechte möglich. Die Quelle bleibt unverändert, Eigentümer im Modul werden auf root gesetzt, Geräte, Sockets und FIFOs werden abgelehnt und das Ziel wird nie überschrieben. Verwenden Sie `--keep-ownership` oder `--allow-special` nur, wenn diese privilegierten Semantiken benötigt werden.

### Änderungen der aktuellen Sitzung erfassen

`savechanges` liest die maßgebliche beschreibbare Schicht einer laufenden MiniOS-Sitzung. Dies erfordert Root-Rechte, da diese Schicht Root-Dateien enthalten kann. Der Standardpfad für Änderungen wird automatisch erkannt:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Ohne `--profile` lässt die historische MiniOS-Richtlinie leere Verzeichnisse, Caches, Protokolle, Bootdaten, Laufzeitpfade, Pseudo-Dateisysteme sowie ausgewählte Sitzungs- und Systemdateien aus. Das ist praktisch für die traditionelle Modulerstellung, aber kein expliziter Datenschutz.

Die expliziten Profile sind:

- `exact` erhält alle darstellbaren Änderungen, einschließlich Benutzerdaten, Protokollen, Caches, Identitätsdateien, Zugangsdaten und unterstützter Löschmetadaten. Nicht unterstützte Dateisystemobjekte werden abgelehnt, statt sie stillschweigend zu verlieren.
- `clean` nutzt eine enge, softwareorientierte Pfad-Whitelist. Es schließt Home- und Root-Daten, Protokolle, Caches, Identitäten, Netzwerkkonfiguration, Zugangsdaten, beliebige Systemkonfiguration und `/usr/local` aus. Dies verringert das Datenschutzrisiko, garantiert aber nicht, dass eine zugelassene Softwaredatei kein Geheimnis enthält.
- `selected` enthält nur geprüfte relative Pfade aus einer Inventar- und Auswahldatei. Explizite Ausschlüsse haben Vorrang. Dieses Profil ist geeignet, wenn das Modul einen kontrollierten Teil der Sitzungsänderungen enthalten soll.

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

Pfade sind normalisiert, nicht leer und relativ zum Änderungen-Root. Generieren und prüfen Sie das Inventar zuerst; jeder Einschluss muss zu den Inventardaten passen. Das Inventar speichert Metadaten wie Pfad, Typ, Kategorie, Sensitivität und Größe, liest aber keine Datei-Inhalte, Symlink-Ziele oder Geheimwerte. Ausgaben und Inventare expliziter Profile sind Modus `0600`; Legacy-Policy-Module sind Modus `0644`.

Die Sitzungsaufnahme kann unterstützte Dateilöschungen und Verzeichnis-Opazität für den aktiven AUFS- oder OverlayFS-Backend erhalten. Laufzeit-Mounts, eingebettete Dateisysteme, Union-Bookkeeping und die Ausgabe selbst werden ausgeschlossen. Ein bestehendes Ziel wird nie überschrieben.

### Module inspizieren und extrahieren

Ein Modul inspizieren, ohne es zu mounten oder zu extrahieren:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Die Inspektion ist ohne Root möglich und funktioniert auch außerhalb einer laufenden MiniOS-Sitzung.

Ein Modul in ein neues Verzeichnis extrahieren:

```bash
sb2dir 06-example.sb example-root
```

Normales Extrahieren ist ohne Root möglich und verändert die Quelle nicht. Das Zielverzeichnis darf nicht existieren. Spezialdateien werden abgelehnt, es sei denn, `--allow-special` wird mit ausreichenden Rechten angefordert.

Verzeichnisse, die durch aktuelle `sb2dir` erzeugt werden, sind normale Verzeichnisse. `rmsbdir`, `sb rm` und `sb rmdir` sind veraltete Kompatibilitätsbefehle, die das Entfernen immer verweigern; sie unmounten oder löschen nichts rekursiv. Prüfen Sie einen extrahierten Pfad und dessen Inhalt vor dem Entfernen mit Standard-Dateisystemwerkzeugen.

### Laufende und nächste Start-Module verwalten

"Aktuell laufend" und "Nächster Start" sind unabhängige Zusammenstellungen. Siehe [Union-Konstruktion und Laufzeit-Aktivierung](/reference/boot-process/Module-Loading) für die Grenze zwischen Start und Laufzeit und warum die beiden Listen unterschiedlich sein können.

Listen Sie die Module auf, die tatsächlich das aktuelle AUFS- oder OverlayFS-Root bilden, von niedrigster zu höchster Priorität:

```bash
sb list
sb list --json
```

Listen Sie die Module auf, die durch die aktuellen Startregeln ausgewählt wurden:

```bash
sb next-boot
sb next-boot --json
```

Diese Abfragen funktionieren ohne Root-Rechte. Die maßgeblichen [Kandidaten-Tier- und Ersetzungsregeln](/reference/boot-process/Module-Loading) bestimmen, welche Quelle für jeden "Nächster Start"-Basename verwendet wird.

Um ein Benutzer-Modul beim nächsten Start verfügbar zu machen:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS verwendet geeigneten dauerhaften, beschreibbaren Speicher, bereitet die Kopie vor, validiert sie und veröffentlicht sie atomar, ohne ein bestehendes Modul zu ersetzen. Der Dateiname muss den aktuellen Startfiltern entsprechen. Entfernen Sie ein ausgewähltes Benutzer-Modul anhand seines exakten Basenames:

```bash
sudo sb next-boot remove 50-extra.sb
```

Das Entfernen wird für Basismodule und Module auf schreibgeschützten oder flüchtigen Quellen verweigert.

Die Laufzeit-Aktivierung ist eine separate, nur für die Sitzung gültige Aktion:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivierung und Deaktivierung funktionieren nur, wenn `/` aktuell eine AUFS-Union ist. Sie sind auf OverlayFS nicht verfügbar, und Kernel-AUFS-Unterstützung allein reicht nicht aus. Keine der beiden Befehle ändert "Nächster Start".

Der Kompatibilitäts-Konverter-Dispatcher benötigt beide Operanden:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direkte Verwendung von `dir2sb` und `sb2dir` ist vorzuziehen, da die normale Konvertierung auch ohne Root-Rechte ausgeführt werden kann.

### Verwandte Dokumentation

- [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Images neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Bau von MiniOS](/development/Building-MiniOS)
- [Boot-Parameter](/reference/Boot-Parameters)
