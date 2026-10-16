---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
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

- **Aktuell laufend** ist die geordnete Menge der Module, die das aktuell aktive System bilden.
- **Nächster Start** ist die geordnete Auswahl, die durch die aktuellen MiniOS-Startregeln bestimmt wird.

Eine Änderung in einer Ansicht wirkt sich nicht automatisch auf die andere aus. Zum Beispiel: **Für diese Sitzung aktivieren** betrifft nur das laufende System, während **Zum nächsten Start hinzufügen** ein Modul in den dauerhaften Modulspeicher kopiert, ohne es sofort zu aktivieren.

Für die maßgeblichen Startzeit-Regeln, einschließlich Kandidatenquellen, exakter Basename-Ersetzung, numerischer Reihenfolge und `load=`, `noload=`, sowie `bext=`-Filterung finden Sie weitere Informationen unter [Initrd-Modulladen](/reference/boot-process/Module-Loading). In dieser Anleitung wird auch erklärt, warum sich Aktuell laufend und Nächster Start unterscheiden können.

Aktivierung und Deaktivierung zur Laufzeit sind nur möglich, wenn das Root-Dateisystem aktuell AUFS verwendet. Sie stehen auf einem OverlayFS-Root nicht zur Verfügung, selbst wenn der Kernel AUFS unterstützt. Basismodule können über die Anwendung nicht deaktiviert werden.

Änderungen für den nächsten Start sind nur mit geeignetem, dauerhaftem und beschreibbarem Modulspeicher möglich. Das Deaktivieren eines Benutzermoduls verschiebt es in einen parallelen `modules-disabled/` Speicher, anstatt es zu löschen; es kann später wiederhergestellt werden. Das endgültige Löschen ist eine separate Aktion für deaktivierte Module. Basismodule sowie Module auf schreibgeschützten oder flüchtigen Speichern können nicht deaktiviert werden. Startfilter wie `load`, `noload`, sowie `bext` bestimmen weiterhin, welche Module ausgewählt werden.

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

## Zugehörige Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Images über die Kommandozeile erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Boot-Parameter](/reference/Boot-Parameters)

<a id="creating-modules"></a>

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

Namen beginnen häufig mit einer Zahl, wie z. B. `06-browser.sb`, da die Reihenfolge der Ebenen die Konfliktlösung beeinflusst. Ein Modul sollte Pfade relativ zum System-Root enthalten, zum Beispiel `usr/bin/example`, und nicht ein zusätzliches Verzeichnis, das diesen Baum enthält.

Für die genauen Quell-Tiers, das Verhalten bei Basename-Kollisionen, die numerische Reihenfolge sowie `bext=`, `load=` und `noload=`-Semantik siehe [Initrd-Modulladen](/reference/boot-process/Module-Loading). Verwenden Sie insbesondere einen eindeutigen Basename, es sei denn, das Modul soll den gleichnamigen Slot aus einer früheren Quell-Tier ersetzen.

Die Option `--level LEVEL` bei `apt2sb`, `script2sb` und `chroot2sb` beschränkt die Basisebenen, die zum Erstellen der Build-Union verwendet werden. Mit `--level 3`, werden Ebenen mit Nummern bis `03` genutzt und höher nummerierte Ebenen herausgefiltert. Dadurch kann ein Modul weniger von optionalen höheren Ebenen abhängen, allerdings werden dadurch mehr Abhängigkeiten in das Ergebnis aufgenommen.

<a id="create-a-module-from-packages"></a>

### Ein Modul aus Paketen erstellen

`apt2sb` installiert Repository-Pakete oder lesbare lokale `.deb` Dateien in eine private Build-Union und erfasst das Ergebnis. Erfordert eine unterstützte MiniOS Live-Session und Root-Rechte.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Ohne `--name` wird der Ausgabename vom ersten Paket abgeleitet. Nützliche APT-Optionen sind unter anderem `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` und `--target-release RELEASE`. Die Option target-release gilt nur für `install`.

Um Upgrades bereits installierter Pakete zu erfassen:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Ein Modul aus einem Skript erstellen

`script2sb` kopiert ein Installationsskript in ein privates Chroot, macht es ausführbar, führt es als root ohne interaktives Terminal aus, entfernt es anschließend und protokolliert die daraus resultierenden Änderungen am Dateisystem. Ein fehlgeschlagenes Skript erzeugt kein Modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Optional: `--directory DIR` kopiert alle Quelldateien, einschließlich versteckter Dateien, vor dem Ausführen des Skripts in das Modul-Root. Strukturieren Sie das Seed-Verzeichnis als Dateisystembaum:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Überprüfen Sie das Skript, bevor Sie es ausführen. Es läuft mit Administratorrechten und kann beliebige Befehle ausführen. Verwenden Sie `chroot2sb` stattdessen, wenn für die Installation Eingaben oder manuelle Schritte erforderlich sind.

<a id="create-a-module-interactively"></a>

### Modul interaktiv erstellen

`chroot2sb` erstellt ein privates Build-Union und öffnet darin eine Root-Shell. Installieren Sie Pakete oder bearbeiten Sie Dateien; beim Verlassen der Shell werden die Änderungen übernommen:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Befehle, die in der Shell eingegeben werden, werden beim Laden des Moduls nicht erneut ausgeführt; das Modul ist ein Schnappschuss des resultierenden Dateisystemzustands. Die Shell-Historie wird entfernt. Wenn kein Name angegeben wird, wird ein Name mit aktuellem Datum und Uhrzeit generiert.

Die getrennte `prepare`, `shell`, `finish` und `cancel`-Lebenszyklus ist für geschützte grafische Oberflächen vorgesehen. Für die normale Terminal-Nutzung verwenden Sie den oben gezeigten interaktiven Einzelbefehl.

<a id="create-a-module-from-a-directory"></a>

### Ein Modul aus einem Verzeichnis erstellen

`dir2sb`packt den Inhalt eines vorbereiteten Verzeichnisses in ein neues Modul. Beide Operanden sind erforderlich:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Die Standardkonvertierung erfolgt ohne Root-Rechte. Die Quelle bleibt unverändert, normale Benutzer- und Gruppen-IDs (1000–60000) werden außerhalb von`/home` und `/opt`zu root geändert, System-IDs bleiben erhalten und Standardverzeichnisse auf oberster Ebene werden root-zugeordnet. Gerätedateien, Sockets und FIFOs werden abgelehnt, und das Ziel wird niemals überschrieben.`--keep-ownership`behält alle Eigentümer der Quelle bei und`--allow-special`erlaubt spezielle Dateien; beide Optionen erfordern Root-Rechte.

`sb2dir`schreibt`.minios-module-origin.json`im extrahierten Verzeichnis. Wenn beim Extrahieren die Eigentümer erhalten bleiben,`dir2sb`erkennt dieses Protokoll und bewahrt beim erneuten Verpacken automatisch Eigentümer und spezielle Dateien; das Protokoll selbst wird nicht in das neue Modul übernommen. Ein Verzeichnis, das ohne Eigentümerübernahme extrahiert wurde, kann nicht erneut verpackt werden, da die ursprünglichen Eigentümer nicht mehr bekannt sind. Extrahieren Sie das ursprüngliche Modul erneut mit den privilegierten Optionen.

<a id="capture-current-session-changes"></a>

### Aktuelle Sitzungsänderungen erfassen

`savechanges`liest die maßgebliche beschreibbare Schicht einer laufenden MiniOS-Sitzung aus. Dafür sind Root-Rechte erforderlich, da diese Schicht Dateien enthalten kann, auf die nur Root zugreifen darf. Der Standardpfad für Änderungen wird automatisch erkannt:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Ohne `--profile`, lässt die historische MiniOS-Richtlinie leere Verzeichnisse, Caches, Protokolle, Boot-Daten, Laufzeitpfade, Pseudo-Dateisysteme sowie ausgewählte Sitzungs- und Systemdateien aus. Das ist praktisch für die klassische Modulerstellung, stellt jedoch keine ausdrückliche Datenschutzgarantie dar.

Die expliziten Profile sind:

- `exact`bewahrt alle darstellbaren Änderungen auf, einschließlich Benutzerdaten, Protokollen, Caches, Identitätsdateien, Zugangsdaten und unterstützten Löschungsmetadaten. Nicht unterstützte Dateisystemobjekte werden abgelehnt, anstatt sie stillschweigend zu verlieren.
- `clean`verwendet eine enge, softwareorientierte Positivliste von Pfaden. Es werden Home- und Root-Daten, Protokolle, Caches, Identitäten, Netzwerkkonfiguration, Zugangsdaten, beliebige Systemkonfigurationen sowie `/usr/local`ausgeschlossen. Dadurch wird das Risiko für Datenschutz reduziert, jedoch kann nicht garantiert werden, dass eine zugelassene Softwaredatei keine vertraulichen Informationen enthält.
- `selected`enthält nur geprüfte relative Pfade aus einer Inventar- und Auswahldatei. Explizite Ausschlüsse haben Vorrang. Dieses Profil ist geeignet, wenn das Modul eine kontrollierte Teilmenge der Sitzungsänderungen enthalten soll.

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

Pfade sind normalisiert, nicht leer und relativ zum Änderungsverzeichnis. Erstellen und prüfen Sie zunächst das Inventar; jeder Einschluss muss mit den Inventardaten übereinstimmen. Das Inventar erfasst Metadaten wie Pfad, Typ, Kategorie, Sensitivität und Größe, liest oder speichert jedoch keine Dateiinhalte, symbolische Link-Ziele oder geheime Werte. Ausgaben und Inventare mit explizitem Profil sind im Modus `0600`; Module mit Legacy-Richtlinie sind im Modus `0644`.

Die Sitzungsaufnahme kann unterstützte Dateilöschungen und Verzeichnis-Opazität für das aktive AUFS- oder OverlayFS-Backend beibehalten. Laufzeit-Mounts, verschachtelte Dateisysteme, Union-Verwaltung und die Ausgabedatei selbst werden ausgeschlossen. Ein vorhandenes Ziel wird niemals überschrieben.

<a id="inspect-and-extract-modules"></a>

### Module inspizieren und extrahieren

Ein Modul inspizieren, ohne es einzubinden oder zu extrahieren:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Die Inspektion erfolgt ohne Root-Rechte und funktioniert auch außerhalb einer laufenden MiniOS-Sitzung.

Ein Modul in ein neues Verzeichnis extrahieren:

```bash
sb2dir 06-example.sb example-root
```

Die normale Extraktion ist rootlos und verändert die Quelle nicht. Das Zielverzeichnis darf nicht existieren. Spezielle Dateien werden abgelehnt, es sei denn,`--allow-special` dies wird mit ausreichenden Berechtigungen angefordert.

Um ein Verzeichnis vollständig und originalgetreu zu extrahieren, verwenden Sie Administratorrechte und erhalten Sie Besitzrechte sowie spezielle Dateien:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

Bei der Extraktion wird der Ursprung des Moduls in`.minios-module-origin.json` im neuen Verzeichnis gespeichert. Bei rootloser Extraktion wird vermerkt, dass Besitzrechte nicht erhalten wurden; ein solches Verzeichnis kann nicht zurück an`dir2sb` übergeben werden. Bewahren Sie den Ursprungsnachweis bei privilegierter Extraktion bis zur erneuten Verpackung auf.

Von aktuellen`sb2dir` erzeugte Verzeichnisse sind normale Verzeichnisse.`rmsbdir` `sb rm` und `sb rmdir` sind veraltete Kompatibilitätsbefehle, die das Entfernen immer verweigern; sie führen kein Unmount oder rekursives Löschen durch. Prüfen Sie einen extrahierten Pfad und dessen Inhalte, bevor Sie ihn mit Standard-Dateisystemwerkzeugen entfernen.

<a id="manage-running-and-next-boot-modules"></a>

### Laufende und nächste Boot-Module verwalten

Laufend und Nächster Boot sind unabhängige Zusammenstellungen. Siehe [Union-Erstellung und Laufzeitaktivierung](/reference/boot-process/Module-Loading#union-construction) für die Abgrenzung zwischen Boot und Laufzeit sowie die Gründe, warum sich die beiden Listen unterscheiden können.

Zeigt die tatsächlich im aktuellen AUFS- oder OverlayFS-Root enthaltenen Module in aufsteigender Priorität an:

```bash
sb list
sb list --json
```

Zeigt die Module an, die durch die aktuellen Boot-Regeln ausgewählt wurden:

```bash
sb next-boot
sb next-boot --json
```

Diese Abfragen sind rootlos. Die maßgeblichen [Kandidatentier- und Ersetzungsregeln](/reference/boot-process/Module-Loading#candidate-tiers) bestimmen, welche Quelle für jeden Next Boot-Basename verwendet wird.

So machen Sie ein Benutzer-Modul beim nächsten Boot verfügbar:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS nutzt geeigneten, dauerhaften, beschreibbaren Speicher, bereitet die Kopie vor, validiert sie und veröffentlicht sie atomar, ohne ein bestehendes Modul zu ersetzen. Der Dateiname muss den aktuellen Boot-Filtern entsprechen. Ein ausgewähltes Benutzer-Modul deaktivieren Sie über dessen exakten Basename:

```bash
sudo sb next-boot disable 50-extra.sb
```

Beim Deaktivieren bleibt die Datei in `modules-disabled/` erhalten. Der ältere `next-boot remove`-Befehl ist ein Alias für Deaktivieren, nicht für das endgültige Löschen. Sie können das Modul wiederherstellen oder endgültig löschen mit:

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

Basismodule sowie Module auf schreibgeschützten oder flüchtigen Quellen können nicht deaktiviert werden. Auch eine endgültige Löschung wird bei aktiven Modulen verweigert. Prüfen Sie `sb next-boot` und die Liste der deaktivierten Module, bevor Sie die zurückbehaltene Datei löschen.

Die Aktivierung zur Laufzeit ist ein separater, nur für die aktuelle Sitzung gültiger Vorgang:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivieren und Deaktivieren funktionieren nur, wenn `/` aktuell eine AUFS-Union ist. Auf OverlayFS sind sie nicht verfügbar, und Kernel-AUFS-Unterstützung allein reicht nicht aus. Keine der beiden Befehle ändert Next Boot.

Der Kompatibilitäts-Konverter-Dispatcher benötigt beide Operanden:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direkte `dir2sb` und `sb2dir`-Verwendung ist vorzuziehen, da die normale Konvertierung auch rootlos ausgeführt werden kann.

### Verwandte Dokumentation

- [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Boot-Modi](/using-minios/Boot-Modes)
- [ISO-Abbilder neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [MiniOS erstellen](/development/Building-MiniOS)
- [Boot-Parameter](/reference/Boot-Parameters)
