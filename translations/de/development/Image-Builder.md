# MiniOS Image Builder

MiniOS Image Builder ist eine GTK-Anwendung zum Remastern eines bestehenden MiniOS-Images. Sie wählt Inhalte aus einer aktuellen MiniOS-Sitzung, einer ISO-Datei oder einer optischen Disc aus, wendet deklarative Anpassungen an und verwendet `minios-image-compose`, um ein verifiziertes, bootfähiges ISO zu erzeugen.

Der Builder läuft innerhalb von MiniOS. Das ausgewählte Quellmedium wird nicht verändert.

## Wählen Sie den passenden Workflow

Image Builder remastert ein bestehendes, binäres MiniOS-Image. Er ersetzt nicht die folgenden Workflows:

- **MiniOS aus dem Quellcode bauen:** Verwenden Sie das `minios-live`-Buildsystem, wenn Sie die Paketlisten der Distribution, die Build-Konfiguration, die Kernel-Schicht, Boot-Artefakte oder die reproduzierbare, quellbasierte Modulkette ändern möchten. Siehe [Building MiniOS](/development/Building-MiniOS.md).
- **Ein wiederverwendbares Modul erstellen:** Verwenden Sie `apt2sb`, `script2sb`, `chroot2sb` oder andere Modultools, wenn das gewünschte Ergebnis eine eigenständige `.sb`-Schicht ist. Siehe [Creating modules](/development/Creating-Modules.md).
- **Ein Image remastern:** Verwenden Sie Image Builder, wenn Sie vorhandene Module auswählen, abgeschlossene externe Module hinzufügen, unterstützte Image-Einstellungen ändern, optional Sitzungsänderungen erfassen und ein weiteres ISO veröffentlichen möchten.

Die Projekt-Dateisystemschicht ist für deklarative Dateien im Image-Root vorgesehen. Sie führt keine Skripte aus, installiert keine Pakete und öffnet kein chroot. Software, die wiederverwendet werden soll, sollte als Modul vorbereitet werden, bevor sie einem Image-Builder-Projekt hinzugefügt wird.

## Quelloptionen

Die Quellseite akzeptiert:

- Die aktuelle LiveKit- oder dracut-MiniOS-Sitzung.
- Eine MiniOS-ISO-Datei.
- Eine MiniOS-Optische Disc.

ISO- und optische Quellen werden mit `udisksctl` schreibgeschützt eingehängt. Das Quell-Inventar erfasst Release, Version, Architektur, Bootloader-Unterstützung, Größe, Modul-Inventar und einen Quell-Fingerabdruck. Wenn sich eine Quelle nach der Planung ändert, wird der Build blockiert, anstatt mit anderen Eingaben fortzufahren.

Die Sitzungsaufzeichnung beschreibt immer Änderungen in der aktuell laufenden MiniOS-Sitzung. Wenn eine ISO oder optische Disc ausgewählt wird, ist die Aufzeichnung nur verfügbar, wenn der Basis-Modul-Fingerabdruck dieser Quelle mit dem eingehängten Basis-Modul der laufenden Sitzung übereinstimmt. Die Auswahl externer Medien erfasst keine Änderungen, die auf einem anderen System vorgenommen wurden.

## Anforderungen

Image Builder benötigt das passende `minios-image-compose`-Backend. ISO-Dateien und optische Quellen erfordern `udisks2`. Das Lesen eines root-exklusiven `/etc/live/config.conf` und das Erfassen einer beschreibbaren Sitzung kann `pkexec` und einen Desktop-PolicyKit-Agenten erfordern. Die Sitzungsaufzeichnung benötigt ein kompatibles `savechanges`, bereitgestellt von `minios-tools` ab Version 1.5.0.

Die Anwendung und das Kompositions-Backend bleiben ohne erhöhte Rechte. Die Autorisierung ist auf den festen Live-Konfigurationsleser und, falls ausgewählt, vertrauenswürdige `/usr/bin/savechanges` beschränkt.

## Projekt-Workflow

### Quelle auswählen

Wählen Sie eine Quelle aus und warten Sie, bis das Inventar abgeschlossen ist. Überprüfen Sie deren Identität, Architektur, Boot-Unterstützung, Diagnose und Modulanzahl. Beheben Sie etwaige Quellfehler, bevor Sie fortfahren.

### Inhalte auswählen

Wählen Sie die Quellmodule aus, die einbezogen werden sollen, und fügen Sie externe `.sb`-Module hinzu. Erforderliche Core- und Kernel-Module sind gesperrt. Module, die in der aktuellen Sitzung aktiv, aber in der gewählten Quelle nicht vorhanden sind, werden separat angezeigt und nicht automatisch übernommen.

Zusätzliche Module müssen lesbare reguläre Dateien mit gültigen SquashFS-Daten sein. Doppelte oder nur durch Groß-/Kleinschreibung unterscheidbare Dateinamen sowie Zielkonflikte werden abgelehnt, da zur Laufzeit die Schichten anhand des Dateinamens aufgelöst werden.

### Einstellungen konfigurieren

Wählen Sie den Ausgabepfad und die erforderliche aktuelle MiniOS-Konfiguration. Leere Anpassungsfelder oder `Keep current` erhalten das Quellverhalten. Konfigurieren Sie nur die notwendigen Überschreibungen für das neue Image und entscheiden Sie dann, ob die beschreibbare Sitzungsschicht erfasst werden soll.

Die Bytes von `/etc/live/config.conf` werden mit Modus 0600 in den privaten Build-Speicher kopiert. Sie werden weder interpretiert, angezeigt noch protokolliert. Aktuelle Projekte müssen diese Konfiguration enthalten; ein älteres Projekt, das sie explizit deaktiviert, kann erst nach Korrektur zur Überprüfung fortfahren.

### Plan überprüfen

Die Überprüfung erstellt einen neuen Plan aus den aktuellen Eingabe-Identitäten. Prüfen Sie ausgewählte, ausgeschlossene und zusätzliche Module, Ausgabepfad, geschätzten Speicherbedarf, Anpassungsübersicht, Aufzeichnungsprofil, Warnungen und Privilegiengrenze.

Die Überprüfung zeigt absichtlich keine Konfigurationswerte, rohen Kernel-Parameter, private Anpassungspfade oder ausgewählte Aufzeichnungspfade an. Sie zeigt Zähler, Dateinamen, Fingerabdrücke und Prüfsummen, sofern diese ausreichen, um den Plan zu binden.

Wenn die Ausgabe bereits existiert, ist eine Ersetzung nur nach Bestätigung möglich. Die Bestätigung bezieht sich auf das erkannte Gerät, Inode, Größe, Zeitstempel und SHA-256 dieser Datei. Ein geändertes Ziel, Abbruch oder fehlgeschlagener Versuch hebt die Freigabe auf und erfordert eine erneute Überprüfung.

### Bauen und verifizieren

Beim Bauen werden alle effektiven Eingaben erneut validiert und `minios-image-compose` mit einer Argumentliste in einem privaten Arbeitsverzeichnis ausgeführt. Das ISO bleibt privat, bis die strukturelle Überprüfung erfolgreich ist. Die Veröffentlichung am gewählten Ziel erfolgt atomar.

Speichern Sie das Projekt, wenn Quelle, Modulauswahl, Ausgabe und Anpassungsabsicht wiederverwendet werden sollen. Projektdateien sind im JSON-Format. Nicht gespeicherte Änderungen erfordern eine Bestätigung, bevor ein anderes Projekt geöffnet oder die Anwendung geschlossen wird.

## Sitzungsaufzeichnung und Datenschutz

Quellmodule, `/etc/live/config.conf` und die Sitzungsaufzeichnung sind unabhängige Eingaben. Wenn die Modulauswahl und deklarative Anpassungen ausreichen, erfassen Sie die beschreibbare Sitzung nicht.

### Sitzungänderungen nicht einbeziehen

Dies ist die empfohlene Standardeinstellung. Der Builder verwendet die ausgewählten Module, die aktuelle Konfiguration, Boot-Einstellungen und weitere Image-Anpassungen, ohne die beschreibbare Sitzungsschicht zu kopieren.

### Alle Sitzungsänderungen einbeziehen

Dieses Profil bewahrt jede unterstützte beschreibbare Änderung vom erkannten OverlayFS- oder AUFS-Provider. Es kann Passwörter, Schlüssel, Tokens, Browserdaten, Maschinenidentität, persönliche Dateien, Protokolle und den Zustand gelöschter Dateien enthalten. Es erfordert eine ausdrückliche Bestätigung und sollte nicht für ein Image verwendet werden, das für andere Personen bestimmt ist, ohne eine separate Überprüfung.

### Nur wiederverwendbare Änderungen einbeziehen

Dieses Profil verwendet eine strikte Pfad-Positivliste für Software und sichere Voreinstellungen, während umfassende persönliche, Identitäts-, Cache- und Protokolldaten ausgelassen werden. Das Risiko wird reduziert, aber es ist nicht garantiert, dass die erlaubten Dateien keine Geheimnisse enthalten. Überprüfen Sie das fertige Image vor der Weitergabe.

### Sitzungsänderungen manuell auswählen

Führen Sie `Analyze session changes` aus und wählen Sie dann mindestens einen normalisierten Pfad aus dem Inventar im Arbeitsspeicher aus. Ein ausgewähltes Verzeichnis steht für alle seine Nachfolger. Genaue oder übergeordnete Ausschlüsse überschreiben passende Auswahlen.

Das Inventar enthält Metadaten, einschließlich Dateinamen, und ist daher sensibel, auch wenn es keine Dateiinhalte enthält. Es bleibt im Speicher und wird weder im Projekt gespeichert noch in Review oder Protokollen kopiert. Explizite Ein- und Ausschlussregeln spiegeln die Projektabsicht wider und werden gespeichert; Review zeigt nur deren Anzahl und Prüfsumme an.

Ein neuer Analysevorgang, das Aktualisieren oder Ändern der Quelle, Abbruch oder Fehler sowie das Öffnen oder Erstellen eines Projekts löschen das Laufzeit-Inventar. Analyse und Erfassung können Administratorrechte anfordern, aber der Image Builder-Prozess und die ISO-Erstellung laufen nicht mit erhöhten Rechten.

## Image-Anpassung

Unterstützte Einstellungen werden vom Backend eingeschränkt und validiert:

- **Systemvorgaben:** Hostname, Zeitzone, Standard-Systemd-Target sowie aktivierte oder deaktivierte Dienste.
- **Sicherheit und Zugriff:** Positivliste für sudo, PolicyKit, SSH, XRDP, X11, Sperrbildschirm- und Hinweis-Modi.
- **Benutzerdaten:** Validierte benutzerbezogene Verzeichnisse relativ zum Root mit entweder Link- oder Bind-Verhalten, jedoch nicht beides.
- **Boot-Verhalten:** Ein Timeout von 0 bis 300 Sekunden, das Quellmenü oder ein konstruiertes Menü sowie ein ausgewählter Standard-Eintrag.
- **Boot-Einträge:** Resume-, Neu-, Auswahl-, Frisch- und Copy-to-RAM-Vorlagen können ausgeblendet, umsortiert, dupliziert und über typisierte Persistenz-, Modul-, Start-, Lokalisierungs-, zRAM- und Diagnoseoptionen konfiguriert werden.
- **Experten-Boot-Einstellungen:** Validierte globale und eintragsbezogene Kernel-Parameter für Optionen, die nicht durch typisierte Steuerelemente abgedeckt sind.
- **Erscheinungsbild:** Ein validierter PNG-Boot-Hintergrund.
- **Projekt-Dateisystemebene:** Ein reales Verzeichnis, relativ zum Image-Root interpretiert und als root-eigenes SquashFS-Overlay-Modul gepackt.

Die Dateisystemebene unterstützt reguläre Dateien, sichere relative symbolische Links, leere Verzeichnisse, Ausführungsrechte und Zeitstempel. Gerätedateien, Sockets, FIFOs, Dateisystem-Überschreitungen, absolute oder ausbrechende Links sowie unsichere Namen werden abgelehnt. Privilegienbits werden entfernt und die Besitzrechte im generierten Modul normalisiert.

Die Boot-Anpassung unterstützt erkanntes MiniOS GRUB, natives SYSLINUX und die Standard-SYSLINUX-zu-GRUB-Kette. Nicht unterstützte oder mehrdeutige Boot-Konfigurationen werden abgelehnt statt geraten. Ein Build ohne Boot-Anpassung kann ein Quell-Layout beibehalten, das der Anpassungsparser nicht versteht.

## Ausgabeüberprüfung

Vor der Veröffentlichung überprüft `minios-image-compose` das generierte ISO, anstatt sich nur auf einen erfolgreichen `xorriso`-Exit zu verlassen. Die Prüfungen umfassen:

- Die ISO-Dateisystemstruktur und das Volume-Label.
- BIOS- und UEFI-Boot-Records sowie den Systembereich.
- Erforderliche Boot-, Kernel-, Initramfs-, Konfigurations- und Modul-Inhalte.
- Eingebettete Anpassungs- und Sitzungsaufzeichnungs-Attestierungen, sofern vorhanden.
- Prüfsummen und Struktur der generierten Overlay- und Sitzungsaufzeichnungs-Module.
- Boot-Hintergrundziele und transformierte Boot-Konfiguration bei Anpassung.

Identität, Modus, Änderungszeitpunkt und SHA-256 des Eingabepfads werden vor dem Build protokolliert. Veränderliche Eingaben werden, sofern unterstützt, privat per Reflink gesichert; andernfalls wird vor und nach dem ISO-Schreiben auf Änderungen geprüft. Eine Abweichung oder ein Verifizierungsfehler verhindert die Veröffentlichung.

Nach einem erfolgreichen Build sollte eine Prüfsumme separat aufgezeichnet werden:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Die strukturelle Überprüfung ersetzt keinen Boot-Test. Starten Sie das ISO in einer temporären virtuellen Maschine und testen Sie sowohl BIOS als auch UEFI, wenn beides unterstützt werden soll. Image Builder kann erkennen, ob QEMU oder VirtualBox installiert ist, startet oder konfiguriert aber keinen Hypervisor.

## Sicherheit und Abbruch

- Halten Sie das Quellmedium schreibgeschützt und speichern Sie das Ergebnis auf einem Dateisystem mit ausreichend freiem Speicherplatz für die Schätzung und temporären Spielraum.
- Überschreiben Sie nicht direkt das einzige bekannte, funktionierende ISO. Verwenden Sie einen neuen Ausgabename, es sei denn, eine Ersetzung ist beabsichtigt und bestätigt.
- Überprüfen Sie externe Module, bevor Sie sie hinzufügen. Image Builder validiert deren SquashFS-Struktur, stellt aber nicht fest, wer deren Inhalt erstellt hat.
- Bevorzugen Sie keine Sitzungsaufzeichnung für verteilbare Images. Falls eine Aufzeichnung notwendig ist, prüfen Sie das resultierende Dateisystem, nicht nur den Profilnamen.
- Behandeln Sie Projektdateien als sensibel, wenn sie explizite Quell-, Modul-, Ausgabe-Pfade oder ausgewählte Erfassungsregeln enthalten.

Inventar-, Build- und Verifizierungsprozesse laufen in eigenen Prozessgruppen. Ein Abbruch fordert die Beendigung an und eskaliert nach einer Karenzzeit. Ein Hashing-Durchlauf kann abgeschlossen werden, bevor der Abbruch einen sicheren Kontrollpunkt erreicht, aber veraltete Ergebnisse werden verworfen. Sobald die atomare Veröffentlichung beginnt, wird sie abgeschlossen, damit das Ziel nicht absichtlich halb geschrieben bleibt.

Ein abgebrochener oder fehlgeschlagener Build veröffentlicht sein privates ISO nicht. Ein vorheriges Ziel bleibt erhalten, sofern ein verifiziertes Ersatz-ISO nicht atomar veröffentlicht wurde.

## Verwandte Dokumentation

- [MiniOS bauen](/development/Building-MiniOS.md)
- [Module erstellen](/development/Creating-Modules.md)
- [ISO neu erstellen](/development/Rebuilding-ISO.md)
