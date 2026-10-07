---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Module verwalten

Der MiniOS-Modulmanager ist die grafische Anwendung zum Anzeigen, Erstellen und Verwalten von MiniOS `.sb`-Modulen. Es gibt zwei Arbeitsbereiche: **Module** zur Systemzusammenstellung und **Erstellen** zum Anlegen neuer Module.

Starten Sie die Anwendung über das Anwendungsmenü oder mit folgendem Befehl:

```bash
minios-module-manager
```

Die Anwendung läuft unter Ihrem Desktop-Benutzer. Administratorrechte werden nur abgefragt, wenn eine angeforderte Aktion dies erfordert.

## Aktuell laufend und beim nächsten Start

Der Arbeitsbereich Module bietet zwei getrennte Ansichten:

- **Aktuell laufend** ist die sortierte Liste der Module, die das aktuelle Live-System bilden.
- **Nächster Start** ist die vom aktuellen MiniOS-Boot-Regeln ausgewählte Reihenfolge.

Eine Änderung in einer Ansicht wirkt sich nicht stillschweigend auf die andere aus. Zum Beispiel: **Für diese Sitzung aktivieren** betrifft nur das laufende System, während **Zum nächsten Start hinzufügen** ein Modul in den dauerhaften Modulspeicher kopiert, ohne es sofort zu aktivieren.

Die maßgeblichen Boot-Regeln, einschließlich Kandidatenquellen, exakter Basename-Ersetzung, numerischer Reihenfolge und `load=`, `noload=`, und `bext=`-Filterung, finden Sie unter [Initrd-Modulladen](/reference/boot-process/Module-Loading). Dort wird auch erklärt, warum sich Aktuell laufend und Nächster Start unterscheiden können.

Aktivierung und Deaktivierung zur Laufzeit sind nur möglich, wenn das Root-Dateisystem aktuell AUFS verwendet. Auf einem OverlayFS-Root stehen sie nicht zur Verfügung, auch wenn der Kernel AUFS unterstützt. Basismodule können über die Anwendung nicht deaktiviert werden.

Änderungen für den nächsten Start sind nur möglich, wenn MiniOS einen geeigneten dauerhaften und beschreibbaren Modulspeicher findet. Basismodule sowie Module auf schreibgeschützten oder flüchtigen Speichern können nicht entfernt werden. Boot-Filter wie `load`, `noload`, und `bext` bestimmen weiterhin, welche Module ausgewählt werden.

## Modul inspizieren

Wählen Sie ein Modul aus, um dessen Speicherort, komprimierte Größe und Dateisystem-Inhalt anzuzeigen. Ist die Moduldatei verfügbar, können Sie über **In Ordner extrahieren** ein neues Verzeichnis mit den Moduldaten erstellen.

Für die Inspektion sind keine Administratorrechte erforderlich. **In Ordner extrahieren** fordert Administratorrechte an, um Besitzer, Berechtigungen und Spezialdateien zu erhalten. Beim Extrahieren werden nie bestehende Ziele überschrieben oder das Quellmodul verändert.

Sie können auch eine lokale `.sb`-Datei aus dem Dateimanager öffnen. Das Öffnen dient nur zur Inspektion; es aktiviert das Modul nicht und fügt es nicht zum nächsten Start hinzu. Auf Xfce-Systemen mit installierter MiniOS-Thunar-Integration nutzen die Dateimanager-Aktionen denselben Modul-Backend für explizite Aktivierung und Deaktivierung; sie umgehen nicht die Unterscheidung zwischen Aktuell laufend und Nächster Start.

## Modul erstellen

Der Arbeitsbereich Erstellen verwendet einen **Konfigurieren**, **Überprüfen**, **Ausführen**, und **Ergebnis**-Ablauf. Ein erfolgreich erstelltes Modul bleibt als Datei am Ausgabepfad erhalten. Es wird nicht aktiviert und nicht automatisch zum nächsten Start hinzugefügt.

Verfügbare Methoden sind:

- **Pakete** installiert Repository-Pakete und ausgewählte lokale `.deb`-Dateien einschließlich Abhängigkeiten in einer isolierten MiniOS-Build-Umgebung. Für die Paketinstallation werden Administratorrechte benötigt.
- **Installationsskript** führt ein überprüftes Skript ohne interaktives Terminal aus. Ein optionaler Seed-Ordner kann Anfangsdateien bereitstellen. Das Skript läuft mit Administratorrechten, wird aber nicht im Modul gespeichert.
- **Interaktives Chroot** öffnet eine temporäre Root-Shell im eingebetteten Terminal. Geben Sie `exit` ein, wenn Sie fertig sind, um das Modul zu erstellen, die Shell erneut zu öffnen oder die Änderungen zu verwerfen. Das Schließen oder Verwerfen der Sitzung hat keinen Einfluss auf das laufende System.
- **Ordner** verpackt den Inhalt eines bestehenden Verzeichnisses. Das Quellverzeichnis selbst wird nicht im Modul verschachtelt. Der grafische Ablauf fordert Administratorrechte an, um geschützte Dateien zu lesen und Dateisystemattribute zu erhalten; das Quellverzeichnis bleibt unverändert. Extrahierte Ordner mit Eigentumserhalt werden automatisch erkannt und behalten ihre Besitzer. Für einen älteren extrahierten Ordner ohne Ursprungsnachweis wählen Sie **Quellbesitz erhalten** falls die Besitzer erhalten bleiben müssen.
- **Aktuelle Sitzungsänderungen** erfasst geeignete Dateien und Löschungen aus der aktuellen beschreibbaren Sitzungsschicht. Es verwendet die Standard-MiniOS-`savechanges`Richtlinie, die Protokolle, Caches, Bootdaten und temporäre Laufzeitpfade ausschließt. Für das Lesen der vollständigen beschreibbaren Schicht sind Administratorrechte erforderlich.

Wählen Sie für jeden Ablauf einen neuen Ausgabepfad. Bestehende Dateien werden nie überschrieben. Fortschritt und Backend-Diagnosen bleiben während der Ausführung sichtbar, und die Erfassung der aktuellen Sitzung kann abgebrochen werden.

Für andere Ordner ändert der Standard-Ordnerablauf gewöhnliche Benutzer- und Gruppen-IDs (1000–60000) außerhalb von `/home` und `/opt`, behält System-IDs bei und macht Standard-Top-Level-Verzeichnisse root-eigen. Eigentum, das bei einer früheren nicht privilegierten Extraktion verloren ging, kann mit dieser Option nicht wiederhergestellt werden.

Aktuelle Sitzungsänderungen sind für die bequeme Standarderfassung gedacht, nicht zur Überprüfung aller enthaltenen Pfade. Eine Live-Schreibschicht kann persönliche oder vertrauliche Daten enthalten. Für explizite `exact`, `clean` oder pfadbasierte Datenschutzrichtlinien nutzen Sie den Kommandozeilen-`savechanges`Ablauf, wie beschrieben unter [Aktuelle Sitzungsänderungen erfassen](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Drag & Drop

Drag & Drop füllt nur ein Eingabefeld oder öffnet die Inspektion:

- Ein Modul öffnet seine Details.
- `.deb`-Dateien werden zu Pakete hinzugefügt.
- Ein Verzeichnis wird für Ordner ausgewählt.
- Eine andere reguläre Datei wird als Installationsskript ausgewählt.

Das Ablegen eines Elements führt keinen Code aus und ändert weder Aktuell laufend noch Nächster Start.

## Verwandte Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Abbilder per Kommandozeile zusammenstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Boot-Parameter](/reference/Boot-Parameters)

## Module erstellen

MiniOS-Module sind schreibgeschützte SquashFS-Dateisystem-Abbilder, die üblicherweise mit der `.sb`-Erweiterung benannt werden. Beim Booten ordnet MiniOS die ausgewählten Module zu einem geschichteten Root-Dateisystem an. Dateien in einer höher priorisierten Schicht können Dateien aus niedrigeren Schichten ergänzen oder ausblenden. Diese modulare Live-Pipeline ist Teil der grundlegenden MiniOS-Architektur, wie beschrieben in [Über MiniOS](/getting-started/About-MiniOS) und [Boot-Modi](/using-minios/Boot-Modes). Nach der nativen Umwandlung wird das geschichtete `.sb`-Root durch ein konventionelles beschreibbares Debian-Dateisystem ersetzt. Die MiniOS-Modulverwaltung wird entfernt, da Modul-Workflows nicht mehr gelten, während die gewählte Desktop-Umgebung und normale Anwendungen als Standardpakete installiert bleiben.

Diese Anleitung dokumentiert die aktuellen MiniOS Tools-Kommandozeilen-Workflows. Für die grafische Anwendung siehe [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules). Für den vollständigen Image-Bauprozess und die Systemarchitektur siehe [MiniOS erstellen](/development/Building-MiniOS). Die beim Bau von MiniOS verwendeten Paketlisten sind in der [CondinAPT-Dokumentation](/development/CondinAPT) beschrieben.

### Sicherheits- und Privilegiengrenzen

Nicht jede Modulaktion erfordert Root-Rechte:

| Aktion | Berechtigung |
|---|---|
| Aktuell laufend oder Nächster Start auflisten mit `sb` | Ohne Root |
| Modul inspizieren mit `sb inspect` | Ohne Root |
| Normale Kommandozeilen-`dir2sb` und `sb2dir`-Konvertierung | Ohne Root |
| Besitz erhalten oder Spezialdateien bei der Konvertierung zulassen | Root |
| Bauen mit `apt2sb`, `script2sb` oder `chroot2sb` | Root |
| Sitzung erfassen mit `savechanges` | Root |
| Aktivieren, deaktivieren, zum nächsten Start hinzufügen oder daraus entfernen | Root |

Die Builder verwenden eine isolierte Union und installieren keine Pakete oder Skriptänderungen im laufenden Root. Auch die Erstellung aktiviert das Ergebnis nicht und wählt es nicht für den nächsten Start aus.

Die grafischen Workflows Ordner und In Ordner extrahieren fordern Administratorrechte an, um geschützte Dateien zu verarbeiten und Dateisystemattribute zu erhalten.

Aktuelle Konverter und Builder verwenden No-Replace-Publikation. Ein bereits vorhandenes Ziel, auch symbolische Links, wird nicht überschrieben. Wählen Sie einen neuen Ausgabepfad oder entfernen Sie das alte Ziel manuell.

Verwenden Sie die `--help`-Ausgabe jedes Befehls als Referenz für die installierte Version. Aktuelle `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb` und `savechanges`-Workflows akzeptieren `zstd` (Standard), `gzip`, `lzo`, `lz4` und `xz`. Der gewählte Kompressor muss im laufenden System verfügbar sein.

### Modulnamen und Filterstufen

Namen beginnen häufig mit einer Zahl wie `06-browser.sb`, da die Schichtreihenfolge die Konfliktlösung beeinflusst. Ein Modul sollte Pfade relativ zum System-Root enthalten, etwa `usr/bin/example`, nicht ein zusätzliches Verzeichnis mit diesem Baum.

Für die genauen Kandidatenquellen, das Verhalten bei Basename-Kollisionen, die numerische Reihenfolge und `bext=`, `load=`, und `noload=`-Semantik siehe [Initrd-Modulladen](/reference/boot-process/Module-Loading). Verwenden Sie insbesondere einen eindeutigen Basename, es sei denn, das Modul soll gezielt einen gleichnamigen Slot aus einer früheren Quellstufe ersetzen.

Die `--level LEVEL`-Option bei `apt2sb`, `script2sb`, und `chroot2sb` begrenzt die Basisschichten, die für die Build-Union verwendet werden. Mit `--level 3`, werden Schichten bis einschließlich `03` verwendet und höher nummerierte Schichten herausgefiltert. Dadurch kann ein Modul weniger von optionalen höheren Schichten abhängen, enthält aber ggf. mehr Abhängigkeiten im Ergebnis.

### Modul aus Paketen erstellen

`apt2sb` installiert Repository-Pakete oder lesbare lokale `.deb`-Dateien in eine private Build-Union und erfasst das Ergebnis. Erfordert eine unterstützte MiniOS-Live-Sitzung und Root.

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

`script2sb` kopiert ein Installationsskript in ein privates Chroot, macht es ausführbar, führt es als Root ohne interaktives Terminal aus, entfernt es und erfasst die resultierenden Dateisystemänderungen. Ein fehlgeschlagenes Skript erzeugt kein Modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Der optionale `--directory DIR` kopiert alle Quellinhalte, einschließlich versteckter Dateien, vor dem Skriptstart ins Modul-Root. Ordnen Sie das Seed-Verzeichnis als Dateisystembaum an:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Überprüfen Sie das Skript vor der Ausführung. Es läuft mit Administratorrechten und kann beliebige Befehle ausführen. Verwenden Sie `chroot2sb` stattdessen, falls die Installation Eingaben oder manuelle Schritte erfordert.

### Modul interaktiv erstellen

`chroot2sb` erstellt eine private Build-Union und öffnet darin eine Root-Shell. Installieren Sie Pakete oder bearbeiten Sie Dateien, und beenden Sie dann die Shell, um die Änderungen zu erfassen:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Im Terminal eingegebene Befehle werden beim Laden des Moduls nicht erneut ausgeführt; das Modul ist ein Schnappschuss des resultierenden Dateisystemzustands. Die Shell-Historie wird entfernt. Wird kein Name angegeben, verwendet der generierte Name das aktuelle Datum und die Uhrzeit.

Der geteilte `prepare`, `shell`, `finish` und `cancel`-Lebenszyklus existiert für geschützte grafische Oberflächen. Für die normale Terminalnutzung verwenden Sie den oben gezeigten Einzelbefehl.

### Modul aus Verzeichnis erstellen

`dir2sb` verpackt den Inhalt eines vorbereiteten Verzeichnisses in ein neues Modul. Beide Operanden sind erforderlich:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Die normale Konvertierung ist ohne Root möglich. Sie lässt die Quelle unverändert, setzt gewöhnliche Benutzer- und Gruppen-IDs (1000–60000) außerhalb von `/home` und `/opt`, behält System-IDs bei und macht Standard-Top-Level-Verzeichnisse root-eigen. Geräte, Sockets und FIFOs werden abgelehnt, und das Ziel wird nie überschrieben. `--keep-ownership` erhält alle Quellbesitzer und `--allow-special` erlaubt Spezialdateien; beides erfordert Root.

`sb2dir` schreibt `.minios-module-origin.json` ins extrahierte Verzeichnis. Wurde beim Extrahieren der Besitz erhalten, `dir2sb` erkennt diesen Nachweis und erhält beim erneuten Verpacken automatisch Besitzer und Spezialdateien; der Nachweis selbst wird nicht ins neue Modul übernommen. Ein ohne Besitzübernahme extrahiertes Verzeichnis kann nicht erneut verpackt werden, da die ursprünglichen Besitzer nicht mehr bekannt sind. Extrahieren Sie das Originalmodul erneut mit den privilegierten Optionen.

### Aktuelle Sitzungsänderungen erfassen

`savechanges` liest die maßgebliche beschreibbare Schicht einer laufenden MiniOS-Sitzung. Root ist erforderlich, da diese Schicht root-exklusive Dateien enthalten kann. Der Standardpfad für Änderungen wird automatisch erkannt:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Ohne `--profile` wendet die historische MiniOS-Richtlinie an, die leere Verzeichnisse, Caches, Protokolle, Bootdaten, Laufzeitpfade, Pseudo-Dateisysteme sowie ausgewählte Sitzungs- und Systemdateien ausschließt. Das ist praktisch für die klassische Modulerstellung, stellt aber keine explizite Datenschutzgarantie dar.

Die expliziten Profile sind:

- `exact` erhält alle darstellbaren Änderungen, einschließlich Benutzerdaten, Protokolle, Caches, Identitätsdateien, Anmeldedaten und unterstützte Löschmetadaten. Nicht unterstützte Dateisystemobjekte werden abgelehnt, statt sie stillschweigend zu verlieren.
- `clean` verwendet eine enge, softwareorientierte Pfad-Positivliste. Home- und Root-Daten, Protokolle, Caches, Identitäten, Netzwerkkonfiguration, Anmeldedaten, beliebige Systemkonfigurationen und `/usr/local` werden ausgeschlossen. Das reduziert die Datenschutzexponierung, garantiert aber nicht, dass eine zugelassene Softwaredatei keine Geheimnisse enthält.
- `selected` enthält nur geprüfte relative Pfade aus einer Inventar- und Auswahldatei. Explizite Ausschlüsse haben Vorrang. Dieses Profil eignet sich, wenn das Modul einen kontrollierten Teil der Sitzungsänderungen enthalten soll.

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

Pfade sind normalisiert, nicht leer und relativ zum Changes-Root. Erstellen und prüfen Sie zuerst das Inventar; jede Aufnahme muss zu den Inventardaten passen. Das Inventar enthält Metadaten wie Pfad, Typ, Kategorie, Sensitivität und Größe, liest aber keine Dateiinhalte, Symlink-Ziele oder Geheimnisse. Ausgaben und Inventare im expliziten Profil sind Modus `0600`; Module mit Legacy-Policy sind Modus `0644`.

Die Sitzungserfassung kann unterstützte Dateilöschungen und Verzeichnis-Opazität für den aktiven AUFS- oder OverlayFS-Backend erhalten. Laufzeit-Mounts, eingebettete Dateisysteme, Union-Bookkeeping und das eigene Ergebnis werden ausgeschlossen. Ein bestehendes Ziel wird nie überschrieben.

### Module inspizieren und extrahieren

Ein Modul inspizieren, ohne es einzubinden oder zu extrahieren:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Die Inspektion ist ohne Root möglich und funktioniert auch außerhalb einer laufenden MiniOS-Sitzung.

Ein Modul in ein neues Verzeichnis extrahieren:

```bash
sb2dir 06-example.sb example-root
```

Die normale Extraktion ist ohne Root möglich und verändert die Quelle nicht. Das Zielverzeichnis darf nicht existieren. Spezialdateien werden abgelehnt, außer wenn `--allow-special` mit ausreichenden Rechten angefordert wird.

Um ein Verzeichnis zu erhalten, das sich verlustfrei erneut verpacken lässt, extrahieren Sie mit Administratorrechten und erhalten Sie Besitz und Spezialdateien:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

Die Extraktion dokumentiert die Modulherkunft in `.minios-module-origin.json` im neuen Verzeichnis. Bei rootloser Extraktion wird vermerkt, dass der Besitz nicht erhalten wurde; ein solches Verzeichnis kann nicht an `dir2sb` zurückgegeben werden. Bewahren Sie den Ursprungsnachweis bei privilegierter Extraktion bis zum Repackaging auf.

Von aktuellen `sb2dir` erzeugte Verzeichnisse sind normale Verzeichnisse. `rmsbdir`, `sb rm`, und `sb rmdir` sind veraltete Kompatibilitätsbefehle, die das Entfernen immer verweigern; sie führen kein Unmount oder rekursives Löschen durch. Prüfen Sie einen extrahierten Pfad und dessen Inhalt, bevor Sie ihn mit Standard-Dateisystemwerkzeugen entfernen.

### Laufende und nächste Module verwalten

Aktuell laufend und Nächster Start sind unabhängige Zusammenstellungen. Siehe [Union-Erstellung und Laufzeitaktivierung](/reference/boot-process/Module-Loading#union-construction) für die Boot-/Laufzeitgrenze und warum sich die beiden Listen unterscheiden können.

Listen Sie die tatsächlich das aktuelle AUFS- oder OverlayFS-Root zusammensetzenden Module von niedrigster bis höchster Priorität auf:

```bash
sb list
sb list --json
```

Listen Sie die durch die aktuellen Boot-Regeln ausgewählten Module auf:

```bash
sb next-boot
sb next-boot --json
```

Diese Abfragen sind ohne Root möglich. Die maßgeblichen [Kandidatenstufen- und Ersetzungsregeln](/reference/boot-process/Module-Loading#candidate-tiers) bestimmen, welche Quelle für jeden Next-Boot-Basename verwendet wird.

So machen Sie ein Benutzermodul beim nächsten Start verfügbar:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS verwendet geeigneten dauerhaften, beschreibbaren Speicher, bereitet die Kopie vor, prüft sie und veröffentlicht sie atomar, ohne ein bestehendes Modul zu ersetzen. Der Dateiname muss den aktuellen Boot-Filtern entsprechen. Entfernen Sie ein ausgewähltes Benutzermodul anhand des exakten Basenames:

```bash
sudo sb next-boot remove 50-extra.sb
```

Das Entfernen wird für Basismodule und Module auf schreibgeschützten oder flüchtigen Quellen verweigert.

Die Aktivierung zur Laufzeit ist ein separater, nur für die Sitzung gültiger Vorgang:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivierung und Deaktivierung funktionieren nur, wenn `/` aktuell eine AUFS-Union ist. Sie stehen auf OverlayFS nicht zur Verfügung, und allein Kernel-AUFS-Unterstützung reicht nicht aus. Keine der beiden Aktionen ändert Nächster Start.

Der Kompatibilitäts-Konverter-Dispatcher benötigt beide Operanden:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direkte Nutzung von `dir2sb` und `sb2dir` ist vorzuziehen, da die normale Konvertierung ohne Root möglich ist.

### Verwandte Dokumentation

- [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Abbilder neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [MiniOS erstellen](/development/Building-MiniOS)
- [Boot-Parameter](/reference/Boot-Parameters)
