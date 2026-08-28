---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

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

Ein normaler `minios-cmd`-Aufruf erfordert alle vier Zielauswahl-Optionen:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Beispiel:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Häufig genutzte optionale Einstellungen umfassen Komprimierung, Kernel-Verhalten, Locale, Zeitzone, Initramfs-Builder, Sprache des Boot-Menüs und Build-Verzeichnis. Prüfen Sie `./minios-cmd --help`, anstatt davon auszugehen, dass eine Option existiert.

### Kernel-Auswahl

Das Frontend stellt die aktuellen Kernel-Einstellungen direkt bereit:

| Option | Wirkung |
| --- | --- |
| `-kp`, `--kernel-provider` | Wählt `distribution` oder `minios` aus |
| `-mk`, `--minios-kernel` | Wählt den AUFS-fähigen MiniOS-Kernel mit automatischer Serienauswahl |
| `-mks`, `--minios-kernel-series` | Wählt `auto`, `6.1` oder `6.12` und impliziert den MiniOS-Provider |
| `-kpm`, `--kernel-payload-mode` | Wählt das `runtime`- oder `full`-Kernelmodul-Payload |
| `-dkms`, `--kernel-build-dkms` | Baut die optionalen DKMS-Treiber für den tatsächlich gewählten Kernel |

Beispiel:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv standard \
  -mks 6.1 -kpm runtime -dkms
```

Der `distribution`-Provider löst einen signierten Kernel-Package-Closure in einem isolierten APT-Zustand auf. Wenn DKMS aktiviert ist, liefert dieser Closure auch die zugehörigen Header für den gewählten Kernel; die spätere DKMS-Phase ersetzt diese nicht durch das generische Header-Metapaket der Userspace-Distribution. Normale Kernel-Archiv-Endpunkte nutzen HTTP, sodass apt-cacher-ng Paket-Inhalte cachen kann. APT validiert weiterhin signierte `InRelease`-Metadaten und Paket-Hashes.

Der `minios`-Provider installiert `linux-image-SERIES-mos-ARCH`, prüft, ob der Kernel AUFS-Unterstützung hat, und verwendet `linux-headers-SERIES-mos-ARCH` für DKMS. `KERNEL_FLAVOUR` muss `none` sein, die Architekturen von Userspace und Kernel-Paket müssen übereinstimmen, und die Update-Policy ist eingefroren. Die automatische Serienauswahl nutzt 6.1 für i386, Buster, Bullseye, Bookworm und Jammy; andere unterstützte Ziele verwenden 6.12. MiniOS-i386-Kernel unterstützen nur die 6.1-Serie.

`KERNEL_PAYLOAD_MODE=runtime` veröffentlicht den Kernelmodul-Baum, Kernel-Konfiguration, System.map, Bereitstellungs-Metadaten und Laufzeit-Integrationsdateien unter `modprobe.d`, `modules-load.d` und `udev/rules.d`. Die Arbeits-dpkg-Datenbank, Header, Build-Links, DKMS-Quellen, Compiler-Toolchain, Initramfs-Pakete und Firmware werden ausgeschlossen. Firmware gehört zu `02-firmware`. Der `full`-Modus behält ein breiteres Diagnose-Paket-Payload.

Das Frontend kopiert die Konfigurationsvorlage, schreibt die übergebenen Frontend-Werte in die Kopie und ruft `minios-live -` auf. Standardmäßig ist die Arbeitskopie für dieses Beispiel:

```text
build/trixie-standard-amd64/build.conf
```

Eine Konfiguration generieren, ohne den Build zu starten:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Ohne ein anderes Ziel wird `build/build.conf` geschrieben.

`--config-file FILE` wählt eine Konfigurationsdatei aus. Die aktuelle Befehls-Hilfe besagt, dass alle anderen Optionen in diesem Modus ignoriert werden. Kombinieren Sie diesen Modus daher nicht mit Ziel- oder Tuning-Optionen:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Im Frontend-Optionsmodus werden explizite Kommandozeilenwerte über die entsprechenden Vorlagenwerte geschrieben. Im Config-File-Modus wird die gewählte Datei als Konfigurationseingabe behandelt, anstatt sie mit anderen Frontend-Flags zu überschreiben.

## Backend-Konfiguration

In einem Quell-Checkout liest `minios-live` standardmäßig `linux-live/build.conf`. Eine installierte Kopie verwendet `/etc/minios-live/build.conf`. Das Backend lädt die gewählte Datei vor der Berechnung der Zielpfade und bietet keine Kommandozeilen-Flags zum Überschreiben einzelner Konfigurationseinstellungen.

Wählen Sie eine andere Datei mit `BUILD_CONF`. Verwenden Sie einen absoluten Pfad, wenn Sie die `sudo`-Grenze überschreiten:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` wählt ein anderes Build-Output-Root:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Bearbeiten Sie keine generierten Dateien im Zielarbeitsverzeichnis als Ersatz für die Pflege der gewählten Konfiguration. Siehe `linux-live/build.conf` für erweiterte Kernel-, Bootloader-, Locale-, Cache-, Snapshot-, Modul-, Bereinigungs- und Veröffentlichungsoptionen.

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

Bindestrich-getrennte Stufennamen, wie sie in der Hilfe angezeigt werden, werden vom Skript akzeptiert.

Die gesamte Pipeline ausführen:

```bash
sudo ./minios-live -
```

Nur eine Stufe ausführen:

```bash
sudo ./minios-live build-iso
```

Einen Bereich inklusiv ausführen:

```bash
sudo ./minios-live build-chroot - build-live
```

Von der ersten Stufe bis zu einer gewählten Stufe ausführen:

```bash
sudo ./minios-live - build-live
```

Von einer gewählten Stufe bis zur letzten Stufe ausführen:

```bash
sudo ./minios-live build-modules -
```

Diese Backend-Beispiele verwenden das Ziel, das in der aktiven Konfiguration ausgewählt wurde. Für die Beispiele auf dieser Seite setzen Sie zuerst `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` und `PACKAGE_VARIANT="standard"`.

## Stufenabhängigkeiten

Ein unvollständiger Befehl erstellt keine Ausgaben aus ausgelassenen früheren Stufen neu. Spätere Stufen verwenden das Root-Dateisystem, SquashFS-Module, Boot-Dateien und Konfigurationen, die von früheren Stufen erzeugt wurden.

Das erneute Erstellen einer früheren Stufe kann daher jede abhängige spätere Ausgabe veralten lassen. Bauen Sie bis zur letzten betroffenen Stufe neu und behalten Sie keine höher nummerierten Module, nachdem Sie ein darunterliegendes Modul geändert haben, auf dem sie basieren. Insbesondere `build-iso` paketiert zuvor vorbereitete Image-Daten; es baut diese Daten nicht neu.

Führen Sie einen vollständigen Build für ein neues Ziel oder wenn die benötigten früheren Ausgaben nicht existieren, durch:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Ausgaben und Logs

Mit der Standard-Checkout-Konfiguration und dem Build-Root verwendet das Trixie-Beispiel diese verifizierten Speicherorte:

- `build/trixie-standard-amd64/core/` für das veränderbare Core-Dateisystem
- `build/trixie-standard-amd64/image/` für den vorbereiteten ISO-Baum
- `build/trixie-standard-amd64/image/minios/` für generierte MiniOS-Module und Payload
- `build/iso/` für ISO-Dateien und deren `.iso.sha256`-Sidecars
- `build/log/build-YYYYMMDD-HHMMSS.log` für das aufgezeichnete Build-Log

Alle Pfade sind relativ zu `BUILD_DIR`. ISO-Basename enthalten Build-Einstellungen und, bei Nicht-Release-Builds, einen Zeitstempel; verwenden Sie den vom erfolgreichen Build ausgegebenen Pfad, anstatt den vollständigen Dateinamen vorherzusagen.

## Ubuntu Pro Tokens

`--ubuntu-pro-token` aktiviert die Nutzung von Ubuntu Pro während eines Frontend-Builds. Der Build-Code bindet im Chroot ein, trennt dann wieder und entfernt Pro-Status, Repository-Authentifizierung, Präferenzen und Keyring-Spuren, bevor das Image erstellt wird. Diese Bereinigung macht das Token nicht sicher für die Weitergabe auf dem Host.

Legen Sie kein echtes Token in Dokumentation, Versionskontrolle, Shell-Historie, CI-Ausgaben oder eine gemeinsam genutzte Kommandozeile ab. Bevorzugen Sie eine private Konfigurationsdatei außerhalb des Repositories, beschränken Sie sie auf den Besitzer und übergeben Sie nur deren Pfad:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Setzen Sie `USE_UBUNTU_PRO="true"` und `UBUNTU_PRO_TOKEN="..."` in dieser privaten Datei. Schützen und entfernen Sie jede hostseitige Arbeitskonfiguration mit Token, sobald sie nicht mehr benötigt wird, und prüfen Sie, dass kein Token oder Pro-Authentifizierungsdaten in veröffentlichten Artefakten enthalten sind.
