---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Eigene MiniOS-Abbilder erstellen

Der MiniOS-Abbildersteller ist eine GTK-Anwendung zum Remastern eines bestehenden MiniOS-Abbilds. Er wählt Inhalte aus einer aktuellen MiniOS-Sitzung, einer ISO-Datei oder einer optischen Disc aus, wendet deklarative Anpassungen an und verwendet `minios-image-compose`, um ein verifiziertes, bootfähiges ISO zu erzeugen.

Der Abbildersteller läuft innerhalb von MiniOS. Das ausgewählte Quellmedium wird dabei nicht verändert.

## Wählen Sie den passenden Workflow aus

MiniOS-Abbildersteller erstellt ein Remaster eines bestehenden MiniOS-Abbilds. Es ersetzt keinen der folgenden Workflows:

- **MiniOS aus dem Quellcode bauen:** verwenden Sie das `minios-live` Build-System, wenn Sie die Paketlisten der Distribution, die Build-Konfiguration, die Kernel-Ebene, Boot-Artefakte oder die reproduzierbare, aus dem Quellcode gebaute Modulkette ändern. Siehe [Bauen von MiniOS](/development/Building-MiniOS).
- **Wiederverwendbares Modul erstellen:** verwenden Sie `apt2sb`, `script2sb`, `chroot2sb`, oder die anderen Modulwerkzeuge, wenn das Ergebnis ein eigenständiger `.sb` Layer sein soll. Siehe [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Abbild remastern:** verwenden Sie MiniOS-Abbildersteller, wenn Sie bestehende Module auswählen, abgeschlossene externe Module hinzufügen, unterstützte Abbild-Einstellungen ändern, optional Sitzungsänderungen erfassen und ein weiteres ISO veröffentlichen möchten.

Die Projekt-Dateisystemebene ist für deklarative Dateien im Abbild-Root vorgesehen. Sie führt keine Skripte aus, installiert keine Pakete und öffnet kein chroot. Software, die wiederverwendet werden soll, sollte als Modul vorbereitet werden, bevor sie zu einem MiniOS-Abbildersteller-Projekt hinzugefügt wird.

## Quelloptionen

Die Quellseite akzeptiert:

- Die aktuelle MiniOS-Sitzung mit LiveKit oder dracut.
- Eine MiniOS-ISO-Datei.
- Eine MiniOS-Disc.

ISO- und Disc-Quellen werden mit `udisksctl` schreibgeschützt eingehängt. Das Quellinventar erfasst Release, Version, Architektur, Bootloader-Unterstützung, Größe, Modulübersicht und einen Quell-Fingerabdruck. Wenn sich eine Quelle nach der Planung ändert, wird der Build blockiert, um zu verhindern, dass mit anderen Eingaben fortgefahren wird.

Die Sitzungsaufnahme beschreibt immer Änderungen in der aktuell laufenden MiniOS-Sitzung. Wird eine ISO oder Disc ausgewählt, ist die Aufnahme nur möglich, wenn der Basis-Modul-Fingerabdruck dieser Quelle mit dem eingehängten Basis-Modul der laufenden Sitzung übereinstimmt. Das Auswählen externer Medien erfasst keine Änderungen, die auf einem anderen System vorgenommen wurden.

## Voraussetzungen

Der MiniOS-Abbildersteller benötigt das passende `minios-image-compose`-Backend. ISO-Dateien und optische Datenträger als Quellen erfordern `udisks2`. Das Lesen eines root-only `/etc/live/config.conf` und das Erfassen einer beschreibbaren Sitzung können `pkexec` und einen Desktop-PolicyKit-Agenten erfordern. Die Sitzungsaufnahme benötigt ein kompatibles `savechanges`, bereitgestellt von `minios-tools` ab Version 1.5.0.

Die Anwendung und das Kompositions-Backend bleiben ohne erhöhte Rechte. Die Autorisierung ist auf den festen Live-Konfigurationsleser und, falls ausgewählt, vertrauenswürdige `/usr/bin/savechanges` beschränkt.

## Projekt-Workflow

### Quelle auswählen

Wählen Sie eine Quelle und warten Sie, bis das Inventar abgeschlossen ist. Prüfen Sie Identität, Architektur, Boot-Unterstützung, Diagnose und Modulanzahl. Beheben Sie etwaige Quellfehler, bevor Sie fortfahren.

### Inhalte auswählen

Wählen Sie die Quellmodule aus, die enthalten sein sollen, und fügen Sie ggf. externe `.sb`-Module hinzu. Erforderliche Core- und Kernel-Module sind gesperrt. Module, die in der aktuellen Sitzung aktiv sind, aber in der gewählten Quelle fehlen, werden separat angezeigt und nicht automatisch übernommen.

Zusätzliche Module müssen reguläre, lesbare Dateien mit gültigen SquashFS-Daten sein. Doppelte oder nur durch Groß-/Kleinschreibung unterscheidbare Dateinamen sowie Zielkollisionen werden abgelehnt, da zur Laufzeit die Layer anhand des Basenamens aufgelöst werden.

### Einstellungen konfigurieren

Wählen Sie den Ausgabepfad und die erforderliche aktuelle MiniOS-Konfiguration. Leere Anpassungsfelder oder `Keep current` bewahren das Verhalten der Quelle. Konfigurieren Sie nur die notwendigen Überschreibungen für das neue Abbild und entscheiden Sie dann, ob die beschreibbare Sitzungsschicht erfasst werden soll.

Die Bytes von `/etc/live/config.conf` werden mit Modus 0600 in einen privaten Build-Speicher kopiert. Sie werden weder interpretiert, angezeigt noch protokolliert. Aktuelle Projekte müssen diese Konfiguration enthalten; ein älteres Projekt, das sie explizit deaktiviert, kann erst nach Korrektur zur Überprüfung fortschreiten.

### Plan überprüfen

Die Überprüfung erstellt einen neuen Plan aus den aktuellen Eingabe-Identitäten. Prüfen Sie ausgewählte, ausgeschlossene und zusätzliche Module, Ausgabepfad, geschätzten Speicherbedarf, Anpassungsübersicht, Erfassungsprofil, Warnungen und Privilegiengrenzen.

Die Überprüfung blendet Konfigurationswerte, rohe Kernel-Parameter, private Anpassungspfade und ausgewählte Erfassungspfade absichtlich aus. Es werden Zähler, Basenamen, Fingerabdrücke und Prüfsummen angezeigt, sofern diese ausreichen, um den Plan zu binden.

Existiert die Ausgabe bereits, ist eine Bestätigung für die Ersetzung erforderlich. Die Bestätigung ist an das erkannte Gerät, Inode, Größe, Zeitstempel und den SHA-256-Wert dieser Datei gebunden. Eine geänderte Zielauswahl, Abbruch oder fehlgeschlagener Versuch hebt die Freigabe auf und erfordert eine erneute Überprüfung.

### Bauen und verifizieren

Beim Bauen werden alle effektiven Eingaben erneut validiert und `minios-image-compose` mit einer Argumentliste in einem privaten Arbeitsverzeichnis ausgeführt. Das ISO bleibt privat, bis die Strukturverifikation erfolgreich ist. Die Veröffentlichung am gewählten Ziel erfolgt atomar.

Speichern Sie das Projekt, wenn Quelle, Modulauswahl, Ausgabe und Anpassungsabsicht wiederverwendet werden sollen. Projektdateien sind im JSON-Format. Nicht gespeicherte Änderungen müssen bestätigt werden, bevor ein anderes Projekt geöffnet oder die Anwendung geschlossen wird.

## Sitzungsaufnahme und Datenschutz

Quellmodule, `/etc/live/config.conf` und Sitzungsaufnahme sind unabhängige Eingaben. Wenn Modulauswahl und deklarative Anpassung ausreichen, erfassen Sie die beschreibbare Sitzung nicht.

### Sitzungsänderungen nicht einbeziehen

Dies ist die empfohlene Standardeinstellung. Der Builder verwendet die ausgewählten Module, die aktuelle Konfiguration, Boot-Einstellungen und andere Bildanpassungen, ohne die beschreibbare Sitzungsschicht zu kopieren.

### Alle Sitzungsänderungen einbeziehen

Dieses Profil bewahrt jede unterstützte beschreibbare Änderung vom erkannten OverlayFS- oder AUFS-Anbieter. Es kann Passwörter, Schlüssel, Tokens, Browserdaten, Maschinenidentität, persönliche Dateien, Protokolle und den Zustand gelöschter Dateien enthalten. Es erfordert eine explizite Bestätigung und sollte nicht für Abbilder verwendet werden, die für andere Personen bestimmt sind, ohne eine separate Prüfung.

### Nur wiederverwendbare Änderungen einbeziehen

Dieses Profil verwendet eine strikte Pfad-Positivliste für Software und sichere Voreinstellungen, wobei breite persönliche, Identitäts-, Cache- und Protokollzustände ausgelassen werden. Es reduziert das Risiko, beweist aber nicht, dass die erlaubten Dateien keine Geheimnisse enthalten. Überprüfen Sie das fertige Abbild vor der Weitergabe.

### Sitzungsänderungen manuell auswählen

Führen Sie `Analyze session changes` aus und wählen Sie dann mindestens einen normalisierten Pfad aus dem Inventar im Arbeitsspeicher aus. Ein ausgewähltes Verzeichnis steht für alle seine Nachfolger. Genaue oder übergeordnete Ausschlüsse überschreiben entsprechende Auswahlen.

Das Inventar enthält Metadaten, einschließlich Dateinamen, und ist daher sensibel, auch wenn es keine Dateiinhalte enthält. Es verbleibt im Speicher und wird weder im Projekt gespeichert noch in Review oder Protokollen kopiert. Explizite Einschluss- und Ausschlussregeln spiegeln die Projektabsicht wider und werden gespeichert; Review zeigt nur deren Anzahl und Prüfsumme an.

Das Starten einer weiteren Analyse, das Aktualisieren oder Ändern der Quelle, Abbruch oder Fehler sowie das Öffnen oder Erstellen eines Projekts löschen das Laufzeit-Inventar. Analyse und Erfassung können Administratorrechte anfordern, aber der MiniOS-Abbildersteller-Prozess und die ISO-Komposition werden nicht mit erhöhten Rechten ausgeführt.

## Abbild-Anpassung

Unterstützte Einstellungen werden vom Backend eingeschränkt und validiert:

- **Systemvorgaben:** Hostname, Zeitzone, Standard-Systemd-Ziel und aktivierte oder deaktivierte Dienste.
- **Sicherheit und Zugriff:** Positivlisten für sudo, PolicyKit, SSH, XRDP, X11, Sperrbildschirm- und Hinweis-Modi.
- **Benutzerdaten:** Validierte, root-relative Benutzerverzeichnisse mit entweder Link- oder Bind-Verhalten, aber nicht beidem.
- **Boot-Verhalten:** Timeout von 0 bis 300 Sekunden, das Quellmenü oder ein konstruiertes Menü und einen ausgewählten Standard-Eintrag.
- **Boot-Einträge:** Resume-, Neu-, Auswahl-, Frisch- und Copy-to-RAM-Vorlagen können ausgeblendet, umsortiert, dupliziert und über typisierte Persistenz-, Modul-, Start-, Lokalisierungs-, zRAM- und Diagnose-Steuerungen konfiguriert werden.
- **Experten-Boot-Einstellungen:** Validierte globale und eintragsbezogene Kernel-Parameter für Optionen, die nicht durch typisierte Steuerungen abgedeckt sind.
- **Erscheinungsbild:** Validierter PNG-Boot-Hintergrund.
- **Projektdateisystem-Ebene:** Ein echtes Verzeichnis, das relativ zum Abbild-Root interpretiert und als root-eigenes SquashFS-Overlay-Modul gepackt wird.

Die Dateisystem-Ebene unterstützt reguläre Dateien, sichere relative symbolische Links, leere Verzeichnisse, Ausführungsrechte und Zeitstempel. Gerätedateien, Sockets, FIFOs, Dateisystem-Überschreitungen, absolute oder ausbrechende Links und unsichere Namen werden abgelehnt. Privilegienbits werden entfernt und Eigentümer im generierten Modul normalisiert.

Boot-Anpassungen unterstützen erkannte MiniOS-GRUB-, native SYSLINUX- und die Standard-SYSLINUX-zu-GRUB-Kette. Nicht unterstützte oder mehrdeutige Boot-Konfigurationen werden abgelehnt statt geraten. Ein Build ohne Boot-Anpassung kann ein Quelllayout bewahren, das der Anpassungsparser nicht versteht.

## Ausgabeüberprüfung

Vor der Veröffentlichung prüft `minios-image-compose` das erzeugte ISO, anstatt sich nur auf einen erfolgreichen `xorriso`-Exit zu verlassen. Die Prüfungen umfassen:

- Die ISO-Dateisystemstruktur und das Volume-Label.
- BIOS- und UEFI-Boot-Records sowie den Systembereich.
- Erforderliche Boot-, Kernel-, Initramfs-, Konfigurations- und Modul-Inhalte.
- Eingebettete Anpassungen und Sitzungsaufnahme-Attestierungen, sofern vorhanden.
- Prüfsummen und Struktur der erzeugten Overlay- und Sitzungsaufnahme-Module.
- Boot-Hintergrundziele und transformierte Boot-Konfiguration bei Anpassungen.

Identität, Modus, Änderungszeitpunkt und SHA-256 des Eingabepfads werden vor dem Build protokolliert. Veränderliche Eingaben werden, sofern unterstützt, privat mit Reflinks gesnapshottet; andernfalls wird vor und nach dem ISO-Schreibvorgang auf Änderungen geprüft. Eine Abweichung oder ein Verifizierungsfehler verhindert die Veröffentlichung.

Nach einem erfolgreichen Build sollte eine Prüfsumme separat aufgezeichnet werden:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Die Strukturüberprüfung ersetzt keinen Boot-Test. Starten Sie das ISO in einer temporären virtuellen Maschine und testen Sie sowohl BIOS als auch UEFI, wenn beides unterstützt werden soll. Der MiniOS-Abbildersteller kann erkennen, ob QEMU oder VirtualBox installiert ist, startet oder konfiguriert jedoch keinen Hypervisor.

## Sicherheit und Abbruch

- Halten Sie Quellmedien schreibgeschützt und speichern Sie Ausgaben auf einem Dateisystem mit ausreichend freiem Speicherplatz für die Schätzung und temporären Puffer.
- Bauen Sie nicht direkt über das einzige bekannte, funktionierende ISO. Verwenden Sie einen neuen Ausgabename, es sei denn, eine Ersetzung ist beabsichtigt und bestätigt.
- Überprüfen Sie externe Module, bevor Sie sie hinzufügen. Der MiniOS-Abbildersteller validiert deren SquashFS-Struktur, stellt jedoch nicht fest, wer deren Inhalte erstellt hat.
- Verzichten Sie nach Möglichkeit auf Sitzungsaufnahmen für verteilbare Abbilder. Falls eine Aufnahme erforderlich ist, prüfen Sie das resultierende Dateisystem und nicht nur den Profilnamen.
- Behandeln Sie Projektdateien als sensibel, wenn sie explizite Quellpfade, Modulpfade, Ausgabepfade oder ausgewählte Aufnahme-Regeln enthalten.

Inventar-, Build- und Verifizierungsprozesse laufen in eigenen Prozessgruppen. Ein Abbruch fordert die Beendigung an und eskaliert nach einer Schonfrist. Ein Hashing-Durchlauf kann vor dem sicheren Abbruchpunkt abgeschlossen werden, aber veraltete Ergebnisse werden verworfen. Sobald die atomare Veröffentlichung beginnt, wird sie abgeschlossen, damit das Ziel nicht absichtlich halb geschrieben bleibt.

Ein abgebrochener oder fehlgeschlagener Build veröffentlicht sein privates ISO nicht. Ein vorheriges Ziel bleibt erhalten, sofern ein verifiziertes Ersatz-ISO nicht die atomare Veröffentlichung erreicht hat.

## Zugehörige Dokumentation

- [Bauen von MiniOS](/development/Building-MiniOS)
- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [ISO-Abbilder über die Kommandozeile zusammenstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## MiniOS-ISO-Abbilder über die Kommandozeile zusammensetzen

`minios-image-compose` ist das Kommandozeilen-Backend, das mit dem MiniOS-Abbildersteller geliefert wird. Es ersetzt das eingestellte `sb2iso`-Tool. Der Befehl remastert einen bestehenden MiniOS-Inhaltsbaum, ändert optional dessen Modulsatz und unterstützte Konfiguration, prüft das Ergebnis und veröffentlicht ein bootfähiges ISO.

Verwenden Sie die grafische Oberfläche des [MiniOS-Abbilderstellers](/preparing-and-customizing/Creating-Custom-MiniOS-Images) für einen geführten Projekt-Workflow. Nutzen Sie diesen Befehl direkt für Skripte, Automatisierung oder reproduzierbare Kommandozeilen-Builds. Für einen vollständigen Quell-Build siehe [MiniOS bauen](/development/Building-MiniOS).

### Grundlegende Nutzung

Aus einer laufenden MiniOS Live-Session erstellen Sie ein ISO mit der erkannten MiniOS-Quelle und `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Setzen Sie keinen Präfix wie `sudo` oder `pkexec` vor den vollständigen Befehl. Komposition, Verifikation und Veröffentlichung werden als aktueller Benutzer ausgeführt. Nur die optionale Sitzungsaufnahme kann das vertrauenswürdige `/usr/bin/savechanges`-Backend über PolicyKit aufrufen.

Der Standard-Ausgabename ist `minios-YYYYMMDD_HHMM.iso`. Ein vorhandenes Ziel wird abgelehnt, sofern nicht `--overwrite` explizit angegeben wird.

### Eine Quelle auswählen

Ohne `--source` erkennt der Befehl den von der aktuellen LiveKit- oder dracut-Sitzung verwendeten MiniOS-Inhalt. Um einen anderen eingebundenen MiniOS-Baum zu remastern, geben Sie das Verzeichnis an, das `boot/` und die MiniOS-Module enthält:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Die Quelle ist schreibgeschützt und wird nie verändert. ISO-Dateien und optische Medien müssen eingebunden werden, bevor ihr MiniOS-Inhaltsbaum mit der CLI verwendet werden kann. Der grafische MiniOS-Abbildersteller kann diese Quellen über `udisksctl` einbinden.

### Module auswählen

Zusätzliche `.sb` Module sind Positionsargumente:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Der Befehl prüft jedes Modul als lesbare, nicht-symlink SquashFS-Datei.
Module, deren Namen mit zwei Ziffern und einem Bindestrich beginnen, werden auf der MiniOS-Top-Ebene platziert. Andere hinzugefügte Module werden in `minios/modules/` abgelegt. Doppelte oder groß-/kleinschreibungsunabhängige Basename-Kollisionen werden abgelehnt.

Quellpfade mit einem POSIX Extended Regular Expression ausschließen:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Erforderliche Boot-Dateien, Kernel- und Initramfs-Dateien, Kernmodule, das ausgewählte Boot-Menü und die gewählte Konfiguration können nicht ausgeschlossen werden.

Erstellen Sie wiederverwendbare Module, bevor Sie das ISO zusammenstellen. Siehe [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules) und [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules).

### Konfiguration und Manifest

`--config FILE` installiert die ausgewählte reguläre Datei als `minios/config.conf`. Standard ist `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Das optionale Manifest muss ein JSON-Objekt sein. Volumenbezeichnungen enthalten 1 bis 32 druckbare ASCII-Zeichen; Bezeichnungen außerhalb des strikten ISO 9660-Zeichensatzes (Großbuchstaben, Ziffern und Unterstrich) erzeugen eine Warnung.

### Sitzungsänderungen erfassen

Die Sitzungsaufnahme ist optional und bezieht sich auf die beschreibbare Ebene der aktuell laufenden MiniOS-Sitzung. Sie wird nur für eine explizite Quelle akzeptiert, wenn diese denselben Basis-Modul-Fingerprint wie das laufende System aufweist.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Verfügbare Profile sind:

- `exact` erfasst jede darstellbare Änderung und kann Anmeldedaten, persönliche Daten, Protokolle, Browserstatus und Maschinenidentität enthalten.
- `clean` verwendet eine enge, softwareorientierte Positivliste. Sie reduziert die Exposition, beweist aber nicht, dass das Ergebnis keine Geheimnisse enthält.
- `selected` nutzt eine Inventarauswahl, die von einer kompatiblen Oberfläche oder einem `savechanges`-Workflow erzeugt wurde.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Bevorzugen Sie Module und deklarative Konfiguration gegenüber Sitzungsaufnahmen, wenn das ISO geteilt werden soll. Siehe [MiniOS-Abbildersteller](/preparing-and-customizing/Creating-Custom-MiniOS-Images) für das Datenschutzmodell und den Review-Workflow.

### Bootverhalten anpassen

Die CLI kann unterstützte GRUB- und SYSLINUX-Layouts ändern:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` akzeptiert `resume`, `new`, `choose`, `fresh` oder `toram`.
`--menu` akzeptiert `multilang` oder eine unterstützte Locale wie `en_US`, `ru_RU` oder `de_DE`. Kernel-Parameter werden validiert und ohne Shell-Auswertung angehängt. Nicht unterstützte oder mehrdeutige Bootmenü-Layouts werden abgelehnt, anstatt sie durch Raten zu verändern.

### Artwork oder Dateisystem-Overlay hinzufügen

Ersetzen Sie den Boot-Hintergrund durch eine validierte PNG-Datei:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Packen Sie einen vorbereiteten Verzeichnisbaum als root-eigenes Image-Overlay-Modul:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Das Overlay wird relativ zum Image-Root interpretiert. Es werden keine Skripte ausgeführt, keine Pakete installiert und kein chroot geöffnet. Unsichere Links, Spezialdateien, Dateisystem-Grenzüberschreitungen und Zielkollisionen werden abgelehnt.

### Verifikation und Veröffentlichung

Vor der Veröffentlichung prüft `minios-image-compose` das ISO-Dateisystem, das Volumenlabel, BIOS- und UEFI-Bootsektoren, Systembereich, Bootdateien, Module und angeforderte Anpassungen. Generierte Overlay- und aufgezeichnete Sitzungs-Module werden extrahiert und mit ihren gespeicherten Metadaten und Prüfsummen abgeglichen.

Das ISO wird in einem privaten Verzeichnis auf dem Ziel-Dateisystem gebaut und erst nach erfolgreicher Verifikation atomar veröffentlicht. Änderungen an Eingaben, Verifikationsfehler, Abbruch oder unzureichender Speicherplatz verhindern die Veröffentlichung. Ein vorheriges Ziel bleibt unverändert, sofern nicht ein explizit genehmigter `--overwrite`-Build die atomare Veröffentlichung erreicht.

Erstellen Sie nach einem erfolgreichen Build eine Prüfsumme und führen Sie einen separaten Boot-Test durch:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Die strukturelle Verifikation ersetzt nicht das Testen der vorgesehenen BIOS- und UEFI-Pfade in einer temporären virtuellen Maschine oder auf geeigneter Hardware.

### Befehlsreferenz

Verwenden Sie das installierte Handbuch und die Hilfsausgabe für die genaue Backend-Version:

```bash
minios-image-compose --help
man minios-image-compose
```

Gängige Optionen sind:

| Option | Zweck |
|---|---|
| `-n`, `--name FILE` | Legt den Ausgabepfad fest. |
| `-e`, `--exclude REGEX` | Schließt passende Quellpfade aus. |
| `--source DIR` | Wählt einen expliziten MiniOS-Inhaltsbaum. |
| `--config FILE` | Wählt die im ISO eingebettete Live-Konfiguration. |
| `--manifest FILE` | Fügt ein validiertes JSON-Build-Manifest hinzu. |
| `--capture-changes MODE` | Erfasst `exact`, `clean` oder `selected`-Sitzungsänderungen. |
| `--boot-timeout SECONDS` | Setzt ein Bootmenü-Timeout von 0 bis 300 Sekunden. |
| `--default-boot MODE` | Wählt die Standardaktion für die MiniOS-Sitzung. |
| `--kernel-args TEXT` | Hängt validierte globale Kernel-Parameter an. |
| `--boot-background PNG` | Ersetzt unterstütztes Boot-Artwork. |
| `--overlay-directory DIR` | Fügt eine deklarative Dateisystemschicht hinzu. |
| `--menu TYPE` | Wählt ein mehrsprachiges oder lokalisiertes Menü. |
| `--overwrite` | Erlaubt explizit das Ersetzen einer bestehenden Ausgabe. |

Der Befehl beendet sich mit einem Fehlercode, wenn Quell-, Modul-, Anpassungs-, Speicher-, Verifikations- oder Veröffentlichungsprüfungen fehlschlagen. Verteilen Sie eine Ausgabe nur, wenn der Befehl erfolgreich abgeschlossen wurde und die resultierende Prüfsumme sowie die Bootpfade getestet wurden.
