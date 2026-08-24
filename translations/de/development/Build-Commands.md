# Build-Befehle

MiniOS bietet zwei Kommandozeilen-Build-Schnittstellen. Führen Sie die Befehle im `minios-live` Quellverzeichnis aus, sofern Sie keine installierte Kopie verwenden.

- `minios-cmd` ist das Frontend. Es akzeptiert gängige Zieloptionen, erzeugt eine funktionierende Konfiguration und startet einen vollständigen Build.
- `minios-live` ist das gestufte Backend. Es liest eine Build-Konfiguration und führt entweder einen einzelnen Schritt, einen zusammenhängenden Bereich von Schritten oder die gesamte Pipeline aus.

Für die installierte Version verwenden Sie `./minios-cmd --help`, `./minios-live --help` und das aktive `build.conf`. Diese sind maßgeblich, wenn Beispiele oder ältere Dokumentationen abweichen. Unterstützte Zielwerte können sich ändern, daher definiert diese Seite keine Support-Matrix.

## Root-Anforderungen

Die Anzeige der Hilfe erfordert keine Root-Rechte:

```bash
./minios-cmd --help
./minios-live --help
```

Build-Operationen benötigen Root-Rechte, da sie debootstrap, Chroots, Mounts und Image-Bauwerkzeuge verwenden. Das aktuelle Frontend prüft außerdem vor dem Schreiben einer Konfiguration mit `--config-only`, ob Root-Rechte vorliegen.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Das Backend prüft und installiert die in `linux-live/prerequisites.list` aufgeführten Host-Voraussetzungen, sofern `SKIP_SETUP_HOST=true` nicht in der Konfiguration gesetzt ist.

## Frontend-Builds

Ein normaler Aufruf von `minios-cmd` erfordert alle vier Zielauswahl-Optionen:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Beispiel:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Häufig genutzte optionale Einstellungen sind Kompression, Kernel-Verhalten, Locale, Zeitzone, Initramfs-Builder, Sprache des Boot-Menüs und Build-Verzeichnis. Prüfen Sie `./minios-cmd --help`, anstatt davon auszugehen, dass eine Option existiert.

Das Frontend kopiert die Konfigurationsvorlage, schreibt die angegebenen Frontend-Werte in die Kopie und ruft `minios-live -` auf. Standardmäßig ist die Arbeitskopie für dieses Beispiel:

```text
build/trixie-standard-amd64/build.conf
```

Eine Konfiguration generieren, ohne den Build zu starten:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Ohne ein anderes Zielverzeichnis wird `build/build.conf` geschrieben.

`--config-file FILE` wählt eine Konfigurationsdatei aus. Die aktuelle Befehls-Hilfe besagt, dass in diesem Modus alle anderen Optionen ignoriert werden. Kombinieren Sie ihn daher nicht mit Ziel- oder Tuning-Optionen:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Im Frontend-Optionsmodus werden explizite Befehlszeilenwerte über die entsprechenden Vorlagenwerte geschrieben. Im Konfigurationsdatei-Modus behandeln Sie die ausgewählte Datei als Konfigurationseingabe, anstatt zu versuchen, sie mit anderen Frontend-Flags zu überschreiben.

## Backend-Konfiguration

In einem Quell-Checkout liest `minios-live` standardmäßig `linux-live/build.conf`. Eine installierte Kopie verwendet `/etc/minios-live/build.conf`. Das Backend lädt die ausgewählte Datei, bevor es Zielpfade berechnet, und bietet keine Kommandozeilen-Flags zum Überschreiben einzelner Konfigurationseinstellungen.

Wählen Sie eine andere Datei über `BUILD_CONF`. Verwenden Sie einen absoluten Pfad, wenn Sie die `sudo`-Grenze überschreiten:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` wählt ein anderes Build-Output-Root aus:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Bearbeiten Sie keine generierten Dateien im Zielarbeitsverzeichnis als Ersatz für die Pflege der ausgewählten Konfiguration. Siehe `linux-live/build.conf` für erweiterte Kernel-, Bootloader-, Locale-, Cache-, Snapshot-, Modul-, Bereinigungs- und Veröffentlichungsoptionen.

## Backend-Stufen

Die Stufen werden in folgender Reihenfolge ausgeführt:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Bindestrich-getrennte Stufennamen, die in der Hilfe angezeigt werden, werden vom Skript akzeptiert.

Die gesamte Pipeline ausführen:

```bash
sudo ./minios-live -
```

Nur eine Stufe ausführen:

```bash
sudo ./minios-live build-iso
```

Einen zusammenhängenden Bereich ausführen:

```bash
sudo ./minios-live build-chroot - build-live
```

Von der ersten Stufe bis zu einer ausgewählten Stufe ausführen:

```bash
sudo ./minios-live - build-live
```

Von einer ausgewählten Stufe bis zur letzten Stufe ausführen:

```bash
sudo ./minios-live build-modules -
```

Diese Backend-Beispiele verwenden das in der aktiven Konfiguration ausgewählte Ziel. Für die Beispiele auf dieser Seite setzen Sie zuerst `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` und `PACKAGE_VARIANT="standard"`.

## Stufenabhängigkeiten

Ein teilweiser Befehl erstellt keine Ausgaben aus ausgelassenen vorherigen Stufen neu. Spätere Stufen verwenden das Root-Dateisystem, SquashFS-Module, Boot-Dateien und die von vorherigen Stufen erzeugte Konfiguration.

Das erneute Erstellen einer früheren Stufe kann daher jede davon abhängige spätere Ausgabe veralten lassen. Bauen Sie bis zur letzten betroffenen Stufe neu und behalten Sie keine höher nummerierten Module, nachdem Sie ein niedrigeres Modul geändert haben, auf dem sie basieren. Insbesondere `build-iso` paketiert zuvor vorbereitete Image-Daten; es baut diese Daten nicht neu.

Führen Sie einen vollständigen Build für ein neues Ziel oder wenn die benötigten vorherigen Ausgaben nicht existieren, durch:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Ausgaben und Protokolle

Mit der Standard-Checkout-Konfiguration und dem Build-Root verwendet das Trixie-Beispiel diese geprüften Speicherorte:

- `build/trixie-standard-amd64/core/` für das veränderbare Core-Dateisystem
- `build/trixie-standard-amd64/image/` für den vorbereiteten ISO-Baum
- `build/trixie-standard-amd64/image/minios/` für generierte MiniOS-Module und Nutzlast
- `build/iso/` für ISO-Dateien und deren `.iso.sha256`-Sidecars
- `build/log/build-YYYYMMDD-HHMMSS.log` für das aufgezeichnete Build-Protokoll

Alle Pfade sind relativ zu `BUILD_DIR`. ISO-Basisnamen enthalten Build-Einstellungen und, bei Nicht-Release-Builds, einen Zeitstempel; verwenden Sie den vom erfolgreichen Build ausgegebenen Pfad, anstatt den vollständigen Dateinamen vorherzusagen.

## Ubuntu Pro Tokens

`--ubuntu-pro-token` aktiviert die Nutzung von Ubuntu Pro während eines Frontend-Builds. Der Build-Code bindet das Token im Chroot ein, entfernt dann Pro-Status, Repository-Authentifizierung, Präferenzen und Keyring-Spuren, bevor das Image erstellt wird. Diese Bereinigung macht das Token nicht sicher für die Verwendung auf dem Host.

Platzieren Sie kein echtes Token in Dokumentation, Versionskontrolle, Shell-Historie, CI-Ausgaben oder einer geteilten Kommandozeile. Verwenden Sie vorzugsweise eine private Konfigurationsdatei außerhalb des Repositorys, beschränken Sie den Zugriff auf den Eigentümer und übergeben Sie nur deren Pfad:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Setzen Sie `USE_UBUNTU_PRO="true"` und `UBUNTU_PRO_TOKEN="..."` in dieser privaten Datei. Schützen und entfernen Sie jede hostseitige Arbeitskonfiguration, die das Token enthält, sobald es nicht mehr benötigt wird, und stellen Sie sicher, dass kein Token oder Pro-Authentifizierungsdaten in veröffentlichten Artefakten enthalten sind.
