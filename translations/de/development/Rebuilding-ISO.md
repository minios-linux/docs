---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# MiniOS ISO-Abbilder über die Kommandozeile erstellen

`minios-image-compose` ist das Kommandozeilen-Backend, das mit dem MiniOS Image Builder ausgeliefert wird. Es ersetzt das eingestellte Dienstprogramm `sb2iso`. Der Befehl remastert einen bestehenden MiniOS-Inhaltsbaum, ändert optional das Modulsatz und die unterstützte Konfiguration, prüft das Ergebnis und veröffentlicht ein bootfähiges ISO.

Für einen geführten Projektablauf nutzen Sie den grafischen [MiniOS Image Builder](/development/Image-Builder.md). Verwenden Sie diesen Befehl direkt für Skripte, Automatisierung oder reproduzierbare Kommandozeilen-Builds. Für einen vollständigen Quellcode-Build nutzen Sie stattdessen [Building MiniOS](/development/Building-MiniOS.md).

## Grundlegende Verwendung

Erstellen Sie aus einer laufenden MiniOS-Live-Sitzung ein ISO mit der erkannten MiniOS-Quelle und `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Präfixieren Sie den vollständigen Befehl nicht mit `sudo` oder `pkexec`. Zusammenstellung, Überprüfung und Veröffentlichung laufen als aktueller Benutzer. Nur die optionale Sitzungsaufzeichnung kann das vertrauenswürdige `/usr/bin/savechanges`-Backend über PolicyKit aufrufen.

Der Standard-Ausgabename ist `minios-YYYYMMDD_HHMM.iso`. Ein vorhandenes Ziel wird abgelehnt, es sei denn, `--overwrite` wird explizit angegeben.

## Quelle auswählen

Ohne `--source` erkennt der Befehl den MiniOS-Inhalt, der von der aktuellen LiveKit- oder dracut-Sitzung verwendet wird. Um einen anderen eingehängten MiniOS-Baum zu remastern, geben Sie das Verzeichnis an, das `boot/` und die MiniOS-Module enthält:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Die Quelle ist eine schreibgeschützte Eingabe und wird niemals verändert. ISO-Dateien und optische Medien müssen eingehängt werden, bevor deren MiniOS-Inhaltsbaum mit der CLI verwendet werden kann. Der grafische Image Builder kann diese Quellen über `udisksctl` einhängen.

## Module auswählen

Zusätzliche `.sb`-Module sind Positionsargumente:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Der Befehl prüft jedes Modul als lesbare, nicht-symlink SquashFS-Datei. Module, deren Namen mit zwei Ziffern und einem Bindestrich beginnen, werden auf der obersten Ebene von MiniOS platziert. Andere hinzugefügte Module werden in `minios/modules/` abgelegt. Doppelte oder kollidierende Basenamen (Groß-/Kleinschreibung ignoriert) werden abgelehnt.

Schließen Sie Quellpfade mit einem POSIX Extended Regular Expression aus:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Erforderliche Bootdateien, Kernel- und Initramfs-Dateien, Kernmodule, das ausgewählte Bootmenü und die gewählte Konfiguration können nicht ausgeschlossen werden.

Erstellen Sie wiederverwendbare Module, bevor Sie das ISO zusammenstellen. Siehe [Module erstellen](/development/Creating-Modules.md) und [MiniOS Module Manager](/administration/Module-Manager.md).

## Konfiguration und Manifest

`--config FILE` installiert die ausgewählte reguläre Datei als `minios/config.conf`. Standard ist `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Das optionale Manifest muss ein JSON-Objekt sein. Volumenbezeichnungen enthalten 1 bis 32 druckbare ASCII-Zeichen; Bezeichnungen außerhalb des strikten ISO-9660-Zeichensatzes (Großbuchstaben, Ziffern und Unterstrich) führen zu einer Warnung.

## Sitzungsänderungen aufzeichnen

Die Sitzungsaufzeichnung ist optional und bezieht sich auf die beschreibbare Ebene der aktuell laufenden MiniOS-Sitzung. Sie wird nur für eine explizite Quelle akzeptiert, wenn diese Quelle denselben Basismodul-Fingerprint wie das laufende System hat.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Verfügbare Profile sind:

- `exact` erfasst jede darstellbare Änderung und kann Anmeldedaten, persönliche Daten, Protokolle, Browserstatus und Maschinenidentität enthalten.
- `clean` verwendet eine enge, softwareorientierte Positivliste. Sie reduziert das Risiko, beweist aber nicht, dass keine Geheimnisse enthalten sind.
- `selected` nutzt eine von einer kompatiblen Oberfläche oder einem `savechanges`-Workflow erzeugte Inventarauswahl.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Bevorzugen Sie Module und deklarative Konfiguration gegenüber der Sitzungsaufzeichnung, wenn das ISO weitergegeben werden soll. Siehe [MiniOS Image Builder](/development/Image-Builder.md) für das Datenschutzmodell und den Prüfungsablauf.

## Bootverhalten anpassen

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
`--menu` akzeptiert `multilang` oder eine unterstützte Sprache wie `en_US`, `ru_RU` oder `de_DE`. Kernel-Parameter werden validiert und ohne Shell-Auswertung angehängt. Nicht unterstützte oder mehrdeutige Bootmenü-Layouts werden abgelehnt, statt sie durch Raten zu verändern.

## Artwork oder Dateisystem-Overlay hinzufügen

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

Das Overlay wird relativ zum Image-Root interpretiert. Es führt keine Skripte aus, installiert keine Pakete und öffnet kein chroot. Unsichere Links, spezielle Dateien, Dateisystem-Grenzüberschreitungen und Zielkollisionen werden abgelehnt.

## Verifikation und Veröffentlichung

Vor der Veröffentlichung prüft `minios-image-compose` das ISO-Dateisystem, das Volumenlabel, BIOS- und UEFI-Bootsektoren, Systembereich, Bootdateien, Module und angeforderte Anpassungen. Generierte Overlay- und aufgezeichnete Sitzungsmodule werden extrahiert und mit ihren gespeicherten Metadaten und Prüfsummen abgeglichen.

Das ISO wird in einem privaten Verzeichnis auf dem Ziel-Dateisystem erstellt und erst nach erfolgreicher Verifikation atomar veröffentlicht. Änderungen an der Eingabe, Verifikationsfehler, Abbruch oder unzureichender Speicherplatz verhindern die Veröffentlichung. Ein vorheriges Ziel bleibt unverändert, es sei denn, ein explizit genehmigter `--overwrite`-Build erreicht die atomare Veröffentlichung.

Erstellen Sie nach einem erfolgreichen Build eine Prüfsumme und führen Sie einen separaten Boot-Test durch:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Die Strukturprüfung ersetzt nicht das Testen der vorgesehenen BIOS- und UEFI-Pfade in einer entsorgbaren virtuellen Maschine oder auf geeigneter Hardware.

## Befehlsreferenz

Nutzen Sie das installierte Handbuch und die Hilfsausgabe für die genaue Backend-Version:

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
| `--capture-changes MODE` | Zeichnet `exact`, `clean` oder `selected` Sitzungsänderungen auf. |
| `--boot-timeout SECONDS` | Setzt ein Bootmenü-Timeout von 0 bis 300 Sekunden. |
| `--default-boot MODE` | Wählt die Standardaktion der MiniOS-Sitzung. |
| `--kernel-args TEXT` | Hängt validierte globale Kernel-Parameter an. |
| `--boot-background PNG` | Ersetzt unterstütztes Boot-Artwork. |
| `--overlay-directory DIR` | Fügt eine deklarative Dateisystemschicht hinzu. |
| `--menu TYPE` | Wählt ein mehrsprachiges oder lokalisiertes Menü. |
| `--overwrite` | Erlaubt explizit das Ersetzen einer bestehenden Ausgabe. |

Der Befehl beendet sich mit einem Fehlercode, wenn Quell-, Modul-, Anpassungs-, Speicher-, Verifikations- oder Veröffentlichungsprüfungen fehlschlagen. Verteilen Sie ein Ergebnis nur, wenn der Befehl erfolgreich abgeschlossen wurde und die resultierende Prüfsumme sowie Bootpfade getestet wurden.
