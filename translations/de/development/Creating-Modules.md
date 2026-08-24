# Module erstellen

MiniOS-Module sind schreibgeschützte SquashFS-Dateisystem-Images, die üblicherweise die Dateiendung `.sb` tragen. Beim Systemstart ordnet MiniOS die ausgewählten Module zu einem geschichteten Root-Dateisystem an. Dateien in einer höher priorisierten Schicht können Dateien aus niedrigeren Schichten ergänzen oder ausblenden.

Diese Anleitung dokumentiert die aktuellen Kommandozeilen-Workflows der MiniOS Tools. Für die grafische Anwendung siehe [MiniOS Module Manager](/administration/Module-Manager.md). Den vollständigen Image-Bauprozess und die Systemarchitektur finden Sie unter [Building MiniOS](/development/Building-MiniOS.md). Die beim Bau von MiniOS verwendeten Paketlisten sind in der [CondinAPT-Dokumentation](/development/CondinAPT.md) beschrieben.

## Sicherheits- und Privilegiengrenzen

Nicht jede Moduloperation erfordert Root-Rechte:

| Operation | Privileg |
|---|---|
| Aktuell laufende oder für den nächsten Start ausgewählte Module mit `sb` auflisten | Ohne Root |
| Ein Modul mit `sb inspect` inspizieren | Ohne Root |
| Normale `dir2sb`- und `sb2dir`-Konvertierung | Ohne Root |
| Besitzrechte erhalten oder spezielle Dateien bei der Konvertierung zulassen | Root |
| Bauen mit `apt2sb`, `script2sb` oder `chroot2sb` | Root |
| Sitzung mit `savechanges` erfassen | Root |
| Aktivieren, deaktivieren, zum nächsten Start hinzufügen oder vom nächsten Start entfernen | Root |

Die Builder verwenden ein isoliertes Union-Dateisystem und installieren keine Pakete oder Skriptänderungen im laufenden Root. Die Erstellung aktiviert das Ergebnis auch nicht und wählt es nicht für den nächsten Start aus.

Aktuelle Konverter und Builder verwenden eine No-Replace-Publikation. Ein bereits existierendes Ziel, einschließlich symbolischer Links, wird nicht überschrieben. Wählen Sie einen neuen Ausgabepfad oder entfernen Sie das alte Ziel explizit selbst.

Verwenden Sie die `--help`-Ausgabe jedes Befehls als Referenz für die installierte Version. Die Standard-Komprimierungsoptionen des Builders sind `zstd` (Standard), `gzip`, `lzo` und `xz`; `dir2sb` unterstützt außerdem `lz4`.

## Modulnamen und Filterstufen

Namen beginnen häufig mit einer Zahl wie `06-browser.sb`, da die Schichtreihenfolge die Konfliktlösung beeinflusst. Ein Modul sollte Pfade relativ zum System-Root enthalten, z. B. `usr/bin/example`, und nicht ein zusätzliches Verzeichnis, das diesen Baum enthält.

Die Option `--level LEVEL` bei `apt2sb`, `script2sb` und `chroot2sb` begrenzt die Basisschichten, die zum Erstellen des Build-Unions verwendet werden. Mit `--level 3` werden nummerierte Schichten bis `03` verwendet, und höher nummerierte Schichten werden herausgefiltert. Das kann ein Modul weniger abhängig von optionalen höheren Schichten machen, allerdings auf Kosten zusätzlicher Abhängigkeiten im Ergebnis.

## Modul aus Paketen erstellen

`apt2sb` installiert Repository-Pakete oder lesbare lokale `.deb`-Dateien in ein privates Build-Union und erfasst das Ergebnis. Dafür ist eine unterstützte MiniOS-Live-Sitzung und Root erforderlich.

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

## Modul aus einem Skript erstellen

`script2sb` kopiert ein Installationsskript in ein privates Chroot, macht es ausführbar, führt es als Root ohne interaktives Terminal aus, entfernt es anschließend und erfasst die resultierenden Änderungen am Dateisystem. Ein fehlgeschlagenes Skript erzeugt kein Modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Die optionale `--directory DIR` kopiert vor der Skriptausführung alle Quellinhalte, einschließlich versteckter Dateien, in das Modul-Root. Ordnen Sie das Seed-Verzeichnis als Dateisystembaum an:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Überprüfen Sie das Skript vor der Ausführung. Es läuft mit Administratorrechten und kann beliebige Befehle ausführen. Verwenden Sie stattdessen `chroot2sb`, wenn die Installation Eingabeaufforderungen oder manuelle Arbeit erfordert.

## Modul interaktiv erstellen

`chroot2sb` erstellt ein privates Build-Union und öffnet darin eine Root-Shell. Installieren Sie Pakete oder bearbeiten Sie Dateien und verlassen Sie dann die Shell, um die Änderungen zu erfassen:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Die in der Shell eingegebenen Befehle werden beim Laden des Moduls nicht erneut ausgeführt; das Modul ist ein Schnappschuss des resultierenden Dateisystemzustands. Die Shell-Historie wird aus dem Ergebnis entfernt. Wird kein Name angegeben, verwendet der generierte Name das aktuelle Datum und die Uhrzeit.

Der geteilte `prepare`, `shell`, `finish` und `cancel`-Lebenszyklus existiert für geschützte grafische Frontends. Für die normale Terminalnutzung verwenden Sie den oben gezeigten Einzelbefehl.

## Modul aus einem Verzeichnis erstellen

`dir2sb` verpackt den Inhalt eines vorbereiteten Verzeichnisses in ein neues Modul. Beide Operanden sind erforderlich:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Die normale Konvertierung ist ohne Root möglich. Die Quelle bleibt unverändert, die Besitzrechte im Modul werden auf Root normalisiert, Geräteknoten, Sockets und FIFOs werden abgelehnt, und das Ziel wird niemals überschrieben. Verwenden Sie `--keep-ownership` oder `--allow-special` nur, wenn diese privilegierten Semantiken benötigt werden.

## Änderungen der aktuellen Sitzung erfassen

`savechanges` liest die maßgebliche beschreibbare Schicht einer laufenden MiniOS-Sitzung aus. Dafür sind Root-Rechte erforderlich, da diese Schicht Root-exklusive Dateien enthalten kann. Der Standard-Speicherort für Änderungen wird automatisch erkannt:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Ohne `--profile` lässt die historische MiniOS-Policy leere Verzeichnisse, Caches, Logs, Bootdaten, Laufzeitpfade, Pseudodateisysteme sowie ausgewählte Sitzungs- und Systemdateien aus. Das ist praktisch für die klassische Modulerstellung, stellt jedoch keine explizite Datenschutzgarantie dar.

Die expliziten Profile sind:

- `exact` erhält alle darstellbaren Änderungen, einschließlich Benutzerdaten, Logs, Caches, Identitätsdateien, Zugangsdaten und unterstützter Löschmetadaten. Nicht unterstützte Dateisystemobjekte werden abgelehnt, anstatt sie stillschweigend zu verlieren.
- `clean` verwendet eine enge, softwareorientierte Pfad-Positivliste. Home- und Root-Daten, Logs, Caches, Identitäten, Netzwerkkonfiguration, Zugangsdaten, beliebige Systemkonfigurationen und `/usr/local` werden ausgeschlossen. Das reduziert die Datenschutzexposition, kann aber nicht garantieren, dass eine zugelassene Softwaredatei keine Geheimnisse enthält.
- `selected` enthält nur geprüfte relative Pfade aus einer Inventar- und Auswahldatei. Explizite Ausschlüsse haben Vorrang. Dieses Profil ist geeignet, wenn das Modul einen kontrollierten Teil der Sitzungsänderungen enthalten muss.

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

Pfade sind normalisierte, nicht-leere Pfade relativ zum Änderungen-Root. Erstellen und prüfen Sie zuerst das Inventar; jede Aufnahme muss mit den Inventardaten übereinstimmen. Das Inventar erfasst Metadaten wie Pfad, Typ, Kategorie, Sensitivität und Größe, liest oder speichert jedoch keine Dateiinhalte, Symlink-Ziele oder Geheimwerte. Ausgaben und Inventare expliziter Profile sind im Modus `0600`; Legacy-Policy-Module sind im Modus `0644`.

Die Sitzungsaufnahme kann unterstützte Dateilöschungen und Verzeichnis-Opazität für das aktive AUFS- oder OverlayFS-Backend erhalten. Laufzeit-Mounts, eingebettete Dateisysteme, Union-Buchhaltung und die Ausgabe selbst werden ausgeschlossen. Ein bestehendes Ziel wird niemals ersetzt.

## Module inspizieren und extrahieren

Ein Modul inspizieren, ohne es einzuhängen oder zu extrahieren:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Die Inspektion ist ohne Root möglich und funktioniert auch außerhalb einer laufenden MiniOS-Sitzung.

Ein Modul in ein neues Verzeichnis extrahieren:

```bash
sb2dir 06-example.sb example-root
```

Die normale Extraktion ist ohne Root möglich und verändert die Quelle nicht. Das Zielverzeichnis darf nicht existieren. Spezielle Dateien werden abgelehnt, es sei denn, `--allow-special` wird mit ausreichenden Rechten angefordert.

Von aktuellen `sb2dir` erzeugte Verzeichnisse sind normale Verzeichnisse. `rmsbdir`, `sb rm` und `sb rmdir` sind veraltete Kompatibilitätsbefehle, die immer das Entfernen verweigern; sie führen kein Unmount oder rekursives Löschen durch. Überprüfen Sie einen extrahierten Pfad und dessen Inhalte, bevor Sie ihn mit Standard-Dateisystemwerkzeugen entfernen.

## Laufende und Next-Boot-Module verwalten

"Running Now" und "Next Boot" sind unabhängige Zusammenstellungen.

Listen Sie die Module auf, die das aktuelle AUFS- oder OverlayFS-Root zusammensetzen, von niedrigster zu höchster Priorität:

```bash
sb list
sb list --json
```

Listen Sie die Module auf, die durch die aktuellen Boot-Regeln ausgewählt wurden, einschließlich `bext`, `load` und `noload`:

```bash
sb next-boot
sb next-boot --json
```

Diese Abfragen sind ohne Root möglich. Ein Next-Boot-Modul kann aus dem Basisdatenbaum, seinem `modules/`-Verzeichnis oder einem separaten Persistenzmodulspeicher stammen. Eine spätere Quelle mit demselben Basisnamen ersetzt die frühere Auswahl.

Um ein Benutzermodul für den nächsten Boot verfügbar zu machen:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS verwendet geeigneten, dauerhaften, beschreibbaren Speicher, bereitet die Kopie vor, prüft sie und veröffentlicht sie atomar, ohne ein bestehendes Modul zu ersetzen. Der Dateiname muss die aktuellen Boot-Filter erfüllen. Entfernen Sie ein ausgewähltes Benutzermodul anhand seines exakten Basisnamens:

```bash
sudo sb next-boot remove 50-extra.sb
```

Das Entfernen wird für Basismodule und Module auf schreibgeschützten oder flüchtigen Quellen verweigert.

Die Laufzeitaktivierung ist eine separate, nur für die Sitzung gültige Operation:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivierung und Deaktivierung funktionieren nur, wenn `/` aktuell ein AUFS-Union ist. Sie sind auf OverlayFS nicht verfügbar, und Kernel-AUFS-Unterstützung allein reicht nicht aus. Keine dieser Aktionen ändert den Next Boot.

Der Kompatibilitäts-Konverter-Dispatcher benötigt beide Operanden:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direkte Verwendung von `dir2sb` und `sb2dir` ist vorzuziehen, da die normale Konvertierung rootlos erfolgen kann.

## Verwandte Dokumentation

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [ISO-Abbilder neu erstellen](/development/Rebuilding-ISO.md)
- [MiniOS erstellen](/development/Building-MiniOS.md)
- [Boot-Parameter](/configuration/Boot-Parameters.md)
