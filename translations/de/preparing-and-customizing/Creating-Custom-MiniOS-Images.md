---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Eigene MiniOS-Abbilder erstellen

Der MiniOS-Abbildersteller ist eine GTK-Anwendung zur Anpassung eines bestehenden MiniOS-Abbilds. Sie wählt Inhalte aus einer aktuellen MiniOS-Sitzung, ISO-Datei oder optischen Disc aus, wendet deklarative Anpassungen an und nutzt `minios-image-compose` zur Erstellung eines geprüften, bootfähigen ISOs.

Der Abbildersteller läuft innerhalb von MiniOS. Das gewählte Quellmedium wird dabei nicht verändert.

## Den passenden Workflow wählen

Der MiniOS-Abbildersteller passt ein bestehendes binäres MiniOS-Abbild an. Er ersetzt keinen der folgenden Workflows:

- **MiniOS aus dem Quellcode bauen:** verwenden Sie das `minios-live` Build-System, wenn Sie die Paketlisten der Distribution, die Build-Konfiguration, Kernel-Ebene, Boot-Artefakte oder eine reproduzierbare, aus Quellcode gebaute Modulkette ändern möchten. Siehe [Building MiniOS](/development/Building-MiniOS).
- **Ein wiederverwendbares Modul erstellen:** verwenden Sie `apt2sb`, `script2sb`, `chroot2sb`, oder andere Modulwerkzeuge, wenn das Ziel ein eigenständiges `.sb`-Layer ist. Siehe [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Ein Abbild anpassen:** verwenden Sie den MiniOS-Abbildersteller, um bestehende Module auszuwählen, fertiggestellte externe Module hinzuzufügen, unterstützte Abbild-Einstellungen zu ändern, optional Sitzungsänderungen zu erfassen und ein weiteres ISO zu veröffentlichen.

Die Projekt-Dateisystemebene ist für deklarative Dateien im Abbild-Root vorgesehen. Es werden keine Skripte ausgeführt, keine Pakete installiert und kein chroot geöffnet. Software, die wiederverwendet werden soll, sollte vor dem Hinzufügen zu einem MiniOS-Abbildersteller-Projekt als Modul vorbereitet werden.

## Quellenoptionen

Auf der Seite „Quellen“ werden folgende Optionen akzeptiert:

- Die aktuelle LiveKit- oder dracut-MiniOS-Sitzung.
- Eine MiniOS-ISO-Datei.
- Eine MiniOS-optische Disc.

ISO- und optische Quellen werden schreibgeschützt eingehängt mit `udisksctl`. Im Quellinventar werden Release, Version, Architektur, Bootloader-Unterstützung, Größe, Modulübersicht und ein Quell-Fingerabdruck erfasst. Wenn sich eine Quelle nach der Planung ändert, wird der Build gestoppt, anstatt mit anderen Eingaben fortzufahren.

Im grafischen Builder ist die Sitzungsaufnahme nur mit der **laufenden MiniOS-Sitzung** als Quelle verfügbar, wobei jedes Quellmodul und jedes aktive externe Modul einbezogen wird. Für eine separat ausgewählte ISO oder optische Disc, selbst wenn sie das gleiche Release enthält, ist diese Funktion nicht verfügbar. Deaktivieren Sie beim Aufzeichnen der beschreibbaren Sitzung keine Quell-Layer, da deren Änderungen auf dieser vollständigen laufenden Basis aufbauen.

## Voraussetzungen

Der MiniOS-Abbildersteller benötigt das passende `minios-image-compose`-Backend. ISO-Dateien und optische Quellen erfordern `udisks2`. Das Lesen eines nur-root-`/etc/live/config.conf` und das Erfassen einer beschreibbaren Sitzung kann `pkexec` und einen Desktop-PolicyKit-Agenten erfordern. Die Sitzungsaufnahme benötigt ein kompatibles `savechanges` von `minios-tools` 1.5.0 oder neuer.

Die Anwendung und das Kompositions-Backend bleiben ohne erhöhte Rechte. Die Autorisierung ist auf den festen Live-Konfigurationsleser und – falls ausgewählt – vertrauenswürdige `/usr/bin/savechanges` beschränkt.

## Projekt-Workflow

### Quelle auswählen

Wählen Sie eine Quelle aus und warten Sie, bis das Inventar abgeschlossen ist. Prüfen Sie Identität, Architektur, Boot-Unterstützung, Diagnose und Modulanzahl. Beheben Sie etwaige Quellfehler, bevor Sie fortfahren.

### Inhalte auswählen

Wählen Sie die Quellmodule aus, die enthalten sein sollen, und fügen Sie ggf. externe `.sb`-Module hinzu. Erforderliche Core- und Kernel-Module sind gesperrt. Externe, in der aktuellen Sitzung aktive, aber in der gewählten Quelle nicht vorhandene Standardmodule werden separat angezeigt und bleiben optional.

Ein externes Modul, das ein Quellmodul an dessen ursprünglichem Systempfad aktiv ersetzt, wird anders behandelt: Der aktuelle Image Builder ermittelt die zugrundeliegende Datei anhand von Gerät und Inode, behält die ursprüngliche Systemrolle bei und nimmt diesen Ersatz als effektives Quellmodul auf, statt ihn als unabhängiges optionales Duplikat darzustellen. Dies gilt auch für verschobene initramfs-Backuppfade. Andere externe Module müssen weiterhin explizit ausgewählt werden.

Zusätzliche Module müssen lesbare reguläre Dateien mit gültigen SquashFS-Daten sein. Doppelte oder groß-/kleinschreibungsunabhängige Basenamen sowie Zielkonflikte werden abgelehnt, da zur Laufzeit die Layer nach Basename aufgelöst werden.

### Einstellungen konfigurieren

Wählen Sie den Ausgabepfad und die erforderliche aktuelle MiniOS-Konfiguration. Leere Anpassungsfelder oder `Keep current` erhalten das Quellverhalten. Konfigurieren Sie nur die notwendigen Überschreibungen für das neue Abbild und entscheiden Sie, ob die beschreibbare Sitzungsebene übernommen werden soll.

Die Bytes von `/etc/live/config.conf` werden mit Modus 0600 in privaten Build-Speicher kopiert. Sie werden weder interpretiert, angezeigt noch protokolliert. Aktuelle Projekte müssen diese Konfiguration enthalten; ein älteres Projekt, das sie explizit deaktiviert, kann erst nach Korrektur zur Überprüfung weitergehen.

### Plan überprüfen

Die Überprüfung erstellt einen neuen Plan aus den aktuellen Eingabe-Identitäten. Prüfen Sie ausgewählte, ausgeschlossene und zusätzliche Module, Ausgabepfad, geschätzten Speicherbedarf, Anpassungsübersicht, Aufnahmeprofil, Warnungen und Privilegiengrenze.

Die Überprüfung blendet Konfigurationswerte, rohe Kernel-Parameter, private Anpassungspfade und ausgewählte Aufnahmepfade absichtlich aus. Es werden Zähler, Basenamen, Fingerabdrücke und Digests angezeigt, sofern diese zur Bindung des Plans ausreichen.

Existiert die Ausgabe bereits, ist ein Ersatz nur nach Bestätigung möglich. Die Bestätigung ist an das erkannte Gerät, Inode, Größe, Zeitstempel und SHA-256 dieser Datei gebunden. Ein geändertes Ziel, Abbruch oder fehlgeschlagener Versuch hebt die Freigabe auf und erfordert eine erneute Überprüfung.

### Bauen und verifizieren

Beim Bauen werden alle effektiven Eingaben erneut validiert und `minios-image-compose` mit einer Argumentliste in einem privaten Arbeitsverzeichnis ausgeführt. Das ISO bleibt privat, bis die Strukturverifikation erfolgreich ist. Die Veröffentlichung am gewählten Ziel erfolgt atomar.

Speichern Sie das Projekt, wenn Quelle, Modulauswahl, Ausgabe und Anpassungsabsicht wiederverwendet werden sollen. Projektdateien sind im JSON-Format. Ungespeicherte Änderungen müssen bestätigt werden, bevor ein anderes Projekt geöffnet oder die Anwendung geschlossen wird.

## Sitzungsaufnahme und Datenschutz

Quellmodule, `/etc/live/config.conf`, und Sitzungsaufnahme sind unabhängige Eingaben. Wenn Modulauswahl und deklarative Anpassung ausreichen, erfassen Sie die beschreibbare Sitzung nicht.

### Sitzungsänderungen nicht übernehmen

Dies ist die empfohlene Standardeinstellung. Der Abbildersteller verwendet die gewählten Module, die aktuelle Konfiguration, Boot-Einstellungen und weitere Anpassungen des Abbilds, ohne die beschreibbare Sitzungsebene zu kopieren.

### Alle Sitzungsänderungen übernehmen

Dieses Profil übernimmt jede unterstützte beschreibbare Änderung vom erkannten OverlayFS- oder AUFS-Provider. Es können Passwörter, Schlüssel, Tokens, Browserdaten, Maschinenidentität, persönliche Dateien, Protokolle und gelöschte Dateizustände enthalten sein. Es erfordert eine ausdrückliche Bestätigung und sollte nicht für Abbilder verwendet werden, die für andere bestimmt sind, ohne eine separate Prüfung.

### Nur wiederverwendbare Änderungen übernehmen

Dieses Profil verwendet eine strikte Pfad-Positivliste für Software und sichere Voreinstellungen, während persönliche, Identitäts-, Cache- und Protokolldaten weitgehend ausgelassen werden. Das reduziert das Risiko, beweist aber nicht, dass die erlaubten Dateien keine Geheimnisse enthalten. Prüfen Sie das fertige Abbild vor dem Teilen.

### Sitzungsänderungen manuell auswählen

Führen Sie `Analyze session changes` aus und wählen Sie mindestens einen normalisierten Pfad aus dem Inventar im Arbeitsspeicher. Ein ausgewähltes Verzeichnis umfasst alle seine Unterverzeichnisse. Genaue oder übergeordnete Ausschlüsse überschreiben passende Auswahlen.

Das Inventar enthält Metadaten, einschließlich Dateinamen, und ist daher sensibel, auch wenn keine Dateiinhalte enthalten sind. Es bleibt im Speicher und wird weder im Projekt gespeichert noch in die Überprüfung oder Protokolle kopiert. Explizite Ein- und Ausschlussregeln sind Projektabsicht und werden gespeichert; die Überprüfung zeigt nur deren Anzahl und Digest.

Ein neuer Analysevorgang, das Aktualisieren oder Wechseln der Quelle, Abbruch oder Fehler sowie das Öffnen oder Erstellen eines Projekts löschen das Laufzeit-Inventar. Analyse und Aufnahme können Administratorrechte anfordern, aber der MiniOS-Abbildersteller-Prozess und die ISO-Erstellung laufen ohne erhöhte Rechte.

## Bildanpassung

Unterstützte Einstellungen werden durch das Backend eingeschränkt und validiert:

- **Systemvorgaben:** Hostname, Zeitzone, Standard-systemd-Target sowie aktivierte oder deaktivierte Dienste.
- **Sicherheit und Zugriff:** erlaubte sudo-, PolicyKit-, SSH-, XRDP-, X11-, Sperrbildschirm- und Hinweis-Modi.
- **Benutzerdaten:** validierte benutzerbezogene Verzeichnisse relativ zum Root mit entweder Link- oder Bind-Verhalten, jedoch nicht beides.
- **Boot-Verhalten:** ein Timeout von 0 bis 300 Sekunden, das Quellmenü oder ein konstruiertes Menü sowie ein ausgewählter Standard-Eintrag.
- **Boot-Einträge:** Resume-, New-, Choose-, Fresh- und Copy-to-RAM-Vorlagen können ausgeblendet, umsortiert, dupliziert und über typisierte Persistenz-, Modul-, Start-, Lokalisierungs-, zRAM- und Diagnoseoptionen konfiguriert werden. Aktuelle New-Session-Vorlagen verwenden `perchdir=setup` sodass das Persistenz-Backend beim Start ausgewählt werden kann; wenn bereits eine ältere Quelle `perchdir=new` nutzt, bleibt dieser Legacy-Selektor erhalten und wird nicht stillschweigend überschrieben.
- **RAM-Verhalten:** Systemkopie (`toram`) und Persistenz-Session-Kopie (`perchtoram`) sind unabhängige Optionen. `perchtoram=off` behält Persistenz auf dem Speicher, `trim` kopiert die ausgewählte unterstützte Sitzung und `full` fordert eine vollständige Kopie der unterstützten Sitzung an. Bei einer Persistenz-Anforderung startet ein RAM-System standardmäßig mit `trim` sofern kein anderer Wert gewählt wird. Native Verzeichnisdaten werden nicht kopiert: Das initrd startet in diesem Fall normalerweise einen neuen, leeren Container für die Anforderung. Verwenden Sie `perchtoram=off` um native Daten auf dem Speicher zu behalten.
- **Experten-Boot-Einstellungen:** validierte globale und eintragsbezogene Kernel-Parameter für Optionen, die nicht durch typisierte Steuerelemente abgebildet werden.
- **Erscheinungsbild:** ein validierter PNG-Boot-Hintergrund.
- **Projekt-Dateisystemebene:** ein reales Verzeichnis relativ zum Image-Root, das als root-eigenes SquashFS-Overlay-Modul gepackt wird.

Die Dateisystemebene unterstützt reguläre Dateien, sichere relative symbolische Links, leere Verzeichnisse, Ausführbarkeitsrechte und Zeitstempel. Gerätedateien, Sockets, FIFOs, Dateisystemgrenzen, absolute oder ausbrechende Links sowie unsichere Namen werden abgelehnt. Privilegienbits werden entfernt und die Eigentümer im generierten Modul normalisiert.

Die Boot-Anpassung unterstützt erkannte MiniOS-GRUB, natives SYSLINUX und die Standardkette von SYSLINUX zu GRUB. Nicht unterstützte oder mehrdeutige Boot-Konfigurationen werden abgelehnt, statt geraten. Ein Build ohne Boot-Anpassung kann ein Quell-Layout beibehalten, das vom Parser der Anpassung nicht erkannt wird.

## Ausgabeverifikation

Vor der Veröffentlichung `minios-image-compose` wird das erzeugte ISO verifiziert, statt sich nur auf einen erfolgreichen `xorriso`-Exit zu verlassen. Überprüft werden:

- Der ISO-Dateisystembaum und das Volume-Label.
- BIOS- und UEFI-Boot-Records sowie der Systembereich.
- Erforderliche Boot-, Kernel-, Initramfs-, Konfigurations- und Modul-Inhalte.
- Eingebettete Anpassungen und Sitzungsaufnahme-Bestätigungen, sofern vorhanden.
- Digests und Struktur der erzeugten Overlay- und Sitzungsaufnahme-Module.
- Boot-Hintergrundziele und transformierte Boot-Konfiguration bei Anpassung.

Die Identität, der Modus, die Änderungszeit und der SHA-256 des Eingabepfads werden vor dem Build erfasst. Veränderliche Eingaben werden privat per Reflink gesichert, sofern unterstützt; andernfalls wird vor und nach dem Schreiben des ISOs auf Änderungen geprüft. Eine Abweichung oder ein Verifikationsfehler verhindert die Veröffentlichung.

Nach einem erfolgreichen Build erfassen Sie die Prüfsumme separat:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Die Strukturverifikation ersetzt keinen Boot-Test. Starten Sie das ISO in einer temporären virtuellen Maschine und testen Sie sowohl BIOS als auch UEFI, wenn beides unterstützt werden soll. Der MiniOS-Abbildersteller kann melden, ob QEMU oder VirtualBox installiert ist, startet oder konfiguriert aber keinen Hypervisor.

## Sicherheit und Abbruch

- Halten Sie Quellmedien schreibgeschützt und speichern Sie die Ausgabe auf ein Dateisystem mit ausreichend freiem Speicherplatz für die Schätzung und temporären Puffer.
- Bauen Sie nicht direkt über das einzige bekannte, funktionierende ISO. Verwenden Sie einen neuen Ausgabename, außer ein Ersatz ist beabsichtigt und bestätigt.
- Überprüfen Sie externe Module vor dem Hinzufügen. Der MiniOS-Abbildersteller validiert deren SquashFS-Struktur, stellt aber nicht fest, wer deren Inhalt erstellt hat.
- Verzichten Sie möglichst auf Sitzungsaufnahme bei verteilbaren Abbildern. Falls eine Aufnahme nötig ist, prüfen Sie das resultierende Dateisystem, nicht nur den Profilnamen.
- Behandeln Sie Projektdateien als sensibel, wenn sie explizite Quell-, Modul-, Ausgabe- oder Aufnahmepfade enthalten.

Inventar-, Build- und Verifikationsprozesse laufen in eigenen Prozessgruppen. Ein Abbruch fordert die Beendigung an und eskaliert nach einer Schonfrist. Ein Hashing-Durchlauf kann vor dem sicheren Abbruchpunkt enden, aber veraltete Ergebnisse werden verworfen. Sobald die atomare Veröffentlichung startet, wird diese abgeschlossen, damit das Ziel nicht absichtlich unvollständig bleibt.

Ein abgebrochener oder fehlgeschlagener Build veröffentlicht sein privates ISO nicht. Ein vorheriges Ziel bleibt erhalten, außer ein verifizierter Ersatz wurde atomar veröffentlicht.

## Zugehörige Dokumentation

- [Erstellen von MiniOS](/development/Building-MiniOS)
- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [ISO-Abbilder über die Befehlszeile erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## MiniOS-ISO-Abbilder über die Kommandozeile zusammenstellen

`minios-image-compose` ist das Kommandozeilen-Backend, das mit dem MiniOS-Abbildersteller ausgeliefert wird. Es ersetzt das eingestellte `sb2iso`-Werkzeug. Der Befehl passt einen bestehenden MiniOS-Inhaltsbaum an, ändert optional die Modulauswahl und unterstützte Konfiguration, prüft das Ergebnis und veröffentlicht ein bootfähiges ISO.

Nutzen Sie die grafische [MiniOS-Abbildersteller](/preparing-and-customizing/Creating-Custom-MiniOS-Images) für einen geführten Projekt-Workflow. Verwenden Sie diesen Befehl direkt für Skripte, Automatisierung oder reproduzierbare Kommandozeilen-Builds. Für einen vollständigen Quell-Build nutzen Sie [Building MiniOS](/development/Building-MiniOS) stattdessen.

### Grundlegende Nutzung

Erstellen Sie aus einer laufenden MiniOS-Live-Sitzung ein ISO mit der erkannten MiniOS-Quelle und `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Präfixieren Sie den vollständigen Befehl nicht mit `sudo` oder `pkexec`. Komposition, Verifikation und Veröffentlichung laufen als aktueller Benutzer. Nur die optionale Sitzungsaufnahme kann das vertrauenswürdige `/usr/bin/savechanges`-Backend über PolicyKit aufrufen.

Der Standard-Ausgabename ist `minios-YYYYMMDD_HHMM.iso`. Ein vorhandenes Ziel wird abgelehnt, außer `--overwrite` wird explizit angegeben.

### Quelle auswählen

Ohne `--source`, erkennt der Befehl den MiniOS-Inhalt der aktuellen LiveKit- oder dracut-Sitzung. Um einen anderen eingebundenen MiniOS-Baum anzupassen, geben Sie das Verzeichnis mit `boot/` und den MiniOS-Modulen an:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Die Quelle ist schreibgeschützter Input und wird nie verändert. ISO-Dateien und optische Medien müssen eingebunden sein, bevor deren MiniOS-Inhaltsbaum mit der CLI verwendet wird. Der grafische MiniOS-Abbildersteller kann diese Quellen über `udisksctl`. einbinden.

### Module auswählen

Zusätzliche `.sb`-Module sind Positionsargumente:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Der Befehl prüft jedes Modul als lesbare, nicht-symlink SquashFS-Datei.
Module, deren Namen mit zwei Ziffern und Bindestrich beginnen, werden auf der MiniOS-Top-Ebene platziert. Andere hinzugefügte Module kommen in `minios/modules/`. Doppelte oder groß-/kleinschreibungsunabhängige Basenamen-Kollisionen werden abgelehnt.

Schließen Sie Quellpfade mit einem POSIX Extended Regular Expression aus:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Erforderliche Boot-Dateien, Kernel- und Initramfs-Dateien, Kernmodule, das gewählte Boot-Menü und die gewählte Konfiguration können nicht ausgeschlossen werden.

Erstellen Sie wiederverwendbare Module, bevor Sie das ISO zusammenstellen. Siehe [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules) und [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules).

### Konfiguration und Manifest

`--config FILE` installiert die gewählte reguläre Datei als `minios/config.conf`. Standard ist `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Das optionale Manifest muss ein JSON-Objekt sein. Volume-Labels enthalten 1 bis 32 druckbare ASCII-Zeichen; Labels außerhalb des strikten ISO-9660-Zeichensatzes (Großbuchstaben, Ziffern, Unterstrich) erzeugen eine Warnung.

### Sitzungsänderungen erfassen

Die Sitzungsaufnahme ist optional und bezieht sich auf die beschreibbare Ebene der aktuell laufenden MiniOS-Sitzung. Sie wird nur für eine explizite Quelle akzeptiert, wenn diese denselben Basis-Modul-Fingerabdruck wie das laufende System hat.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Verfügbare Profile sind:

- `exact` erfasst jede darstellbare Änderung und kann Anmeldedaten, persönliche Daten, Protokolle, Browserstatus und Maschinenidentität enthalten.
- `clean` nutzt eine enge, softwareorientierte Positivliste. Das reduziert das Risiko, beweist aber nicht, dass das Ergebnis keine Geheimnisse enthält.
- `selected` verwendet eine Inventarauswahl, die von einer kompatiblen Oberfläche oder `savechanges`-Workflow erzeugt wurde.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Bevorzugen Sie Module und deklarative Konfiguration gegenüber Sitzungsaufnahme, wenn das ISO geteilt werden soll. Siehe [MiniOS-Abbildersteller](/preparing-and-customizing/Creating-Custom-MiniOS-Images) für das Datenschutzmodell und den Überprüfungs-Workflow.

### Boot-Verhalten anpassen

Die CLI kann unterstützte GRUB- und SYSLINUX-Layouts ändern:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` akzeptiert `resume`, `new`, `choose`, `fresh`, oder `toram`. Die semantische `new`-Vorlage wird in `perchdir=setup` in aktuellen MiniOS-Menüs abgebildet, während Legacy-`perchdir=new`-Quell-Einträge weiterhin erkennbar bleiben. Der grafische Bootmenü-Editor erhält auch `perchtoram=off|trim|full` unabhängig von der System-`toram`-Einstellung.
`--menu` akzeptiert `multilang` oder eine unterstützte Sprache wie `en_US`, `ru_RU`, oder `de_DE`. Kernel-Parameter werden validiert und ohne Shell-Auswertung angehängt. Nicht unterstützte oder mehrdeutige Bootmenü-Layouts werden abgelehnt, statt geraten zu werden.

### Grafiken oder ein Dateisystem-Overlay hinzufügen

Ersetzen Sie den Boot-Hintergrund durch ein validiertes PNG:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Packen Sie einen vorbereiteten Verzeichnisbaum als root-eigenes Overlay-Modul für das Abbild:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Das Overlay wird relativ zum Abbild-Root interpretiert. Es werden keine Skripte ausgeführt, keine Pakete installiert und kein chroot geöffnet. Unsichere Links, Spezialdateien, Dateisystemgrenzen und Zielkonflikte werden abgelehnt.

### Verifikation und Veröffentlichung

Vor der Veröffentlichung `minios-image-compose` wird der ISO-Dateisystembaum, das Volume-Label, BIOS- und UEFI-Boot-Records, Systembereich, Boot-Dateien, Module und angeforderte Anpassungen geprüft. Erzeugte Overlay- und Sitzungsaufnahme-Module werden extrahiert und mit ihren gespeicherten Metadaten und Digests abgeglichen.

Das ISO wird in einem privaten Verzeichnis auf dem Ziel-Dateisystem gebaut und erst nach erfolgreicher Verifikation atomar veröffentlicht. Eingabemutationen, Verifikationsfehler, Abbruch oder unzureichender Speicherplatz verhindern die Veröffentlichung. Ein vorheriges Ziel bleibt unverändert, außer ein explizit genehmigter `--overwrite`-Build erreicht die atomare Veröffentlichung.

Erstellen Sie nach einem erfolgreichen Build eine Prüfsumme und führen Sie einen separaten Boot-Test durch:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Die Strukturverifikation ersetzt nicht das Testen der vorgesehenen BIOS- und UEFI-Pfade in einer temporären VM oder auf geeigneter Hardware.

### Befehlsreferenz

Nutzen Sie das installierte Handbuch und die Hilfeausgabe für die exakte Backend-Version:

```bash
minios-image-compose --help
man minios-image-compose
```

Gängige Optionen sind:

| Option | Zweck |
|---|---|
| `-n`, `--name FILE` | Setzt den Ausgabepfad. |
| `-e`, `--exclude REGEX` | Schließt passende Quellpfade aus. |
| `--source DIR` | Wählt einen expliziten MiniOS-Inhaltsbaum. |
| `--config FILE` | Wählt die im ISO eingebettete Live-Konfiguration. |
| `--manifest FILE` | Fügt ein validiertes JSON-Build-Manifest hinzu. |
| `--capture-changes MODE` | Erfasst `exact`, `clean`, oder `selected`-Sitzungsänderungen. |
| `--boot-timeout SECONDS` | Setzt ein Bootmenü-Timeout von 0 bis 300 Sekunden. |
| `--default-boot MODE` | Wählt die Standard-MiniOS-Sitzungsaktion. |
| `--kernel-args TEXT` | Fügt validierte globale Kernel-Parameter an. |
| `--boot-background PNG` | Ersetzt unterstützte Boot-Grafiken. |
| `--overlay-directory DIR` | Fügt eine deklarative Dateisystemebene hinzu. |
| `--menu TYPE` | Wählt ein mehrsprachiges oder lokalisiertes Menü. |
| `--overwrite` | Erlaubt explizit das Ersetzen einer bestehenden Ausgabe. |

Der Befehl beendet sich mit einem Fehlercode, wenn Quell-, Modul-, Anpassungs-, Speicher-, Verifikations- oder Veröffentlichungsprüfungen fehlschlagen. Verteilen Sie eine Ausgabe nur, wenn der Befehl erfolgreich abgeschlossen wurde und die resultierende Prüfsumme sowie die Bootpfade getestet wurden.
