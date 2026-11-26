---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# Build von MiniOS

MiniOS wird aus einem Basis-SquashFS-Image, geordneten Erweiterungsmodulen, Kernel- und Boot-Dateien sowie generierter Konfiguration zusammengesetzt. Diese Seite beschreibt die aktuellen Build-Schnittstellen des Quellbaums und die Abhängigkeiten zwischen deren Ausgaben.

Führen Sie `./minios-cmd --help`, `./minios-live --help` aus und prüfen Sie die ausgewählte `build.conf`, bevor Sie den Build starten. Diese Dateien sind maßgeblich für die ausgecheckte Version.

## Voraussetzungen

Builds unter Debian oder Ubuntu benötigen mindestens `BUILD_DIR` freien Speicherplatz und `/tmp`.
Für ein typisches Desktop-Ziel sind mindestens 20 GiB erforderlich. Für Build-Vorgänge sind Root-Rechte nötig, etwa für debootstrap, Chroots, Mounts, Loop-Geräte und das Erstellen von Images. Zum Anzeigen der Hilfe sind keine Root-Rechte erforderlich.

Die maßgebliche Paketliste für den Host finden Sie unter `linux-live/prerequisites.list`. Für den aktuellen Checkout können Sie die Pakete wie folgt installieren:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl jq openssl sbsigntool
```

In einem Source-Checkout `minios-live` prüft diese Liste vor dem Build, sofern nicht `SKIP_SETUP_HOST=true`. Auf einem normalen Host meldet das Programm fehlende Pakete und bricht ab. Die automatische Installation wird nur beim Container-Build verwendet.

Installieren Sie auf dem Build-Host `minios-dpkg-state` aus der Generic-Suite des APT-Repositorys von MiniOS. Die Schritte `build-live`, `build-modules` und `build-boot` prüfen vor dem Fortfahren, ob der Repository-Index für die Host-Architektur verfügbar ist. Das installierte Paket muss sowohl die Mindestversion des Builders als auch die für diese Architektur veröffentlichte Version erfüllen. Der Builder installiert oder aktualisiert das Paket nicht automatisch. Schlägt die Prüfung fehl, folgen Sie den ausgegebenen Installationsanweisungen.

Die Standardkonfiguration prüft die Internetverbindung. Diese Prüfung lässt sich mit `CHECK_INTERNET_CONNECTION=false` deaktivieren und wird bei einem vorbereiteten APT-Cache-Repository übersprungen. Alle benötigten Pakete und Boot-Dateien müssen jedoch weiterhin über konfigurierte Repositorys oder Caches verfügbar sein.

Wenn `USE_APT_CACHER=true`, muss unter `APT_CACHER_ADDRESS` bereits ein erreichbarer apt-cacher-ng-Dienst konfiguriert sein. Andernfalls setzen Sie die Option vor dem Build auf `false`.

::: danger Bootstrap-Vertrauen
Der aktuelle Bootstrap-Pfad ruft debootstrap mit `--no-check-gpg` auf und lädt den Archivschlüssel MiniOS über nicht authentifiziertes HTTP herunter. Verwenden Sie das resultierende Image nicht als vertrauenswürdiges Release-Artefakt, solange diese Quellpfade keine authentifizierte Schlüssel- und Bootstrap-Verifizierung erzwingen.
:::

## Schnellstart-Build

Klonen Sie das Repository und führen Sie das Frontend aus dem Wurzelverzeichnis aus:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Die vier Zieloptionen sind erforderlich, wenn keine Konfigurationsdatei ausgewählt ist:

| Option | Einstellung |
| --- | --- |
| `-d`, `--distribution` | Ziel-Distribution-Suite |
| `-a`, `--architecture` | Zielarchitektur |
| `-de`, `--desktop-environment` | Modul-Umgebung |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox` oder `ultra` |

Die aktuell unterstützten Werte für Distribution, Architektur, Desktop, Kompression und Variante sind in `linux-live/build.conf` aufgeführt. Leiten Sie keine Unterstützung aus alten Befehlsbeispielen ab.

## Build-Schnittstellen

### `minios-cmd`

`minios-cmd` kopiert die Konfigurationsvorlage in das Zielarbeitsverzeichnis, schreibt Frontend-Einstellungen in diese Kopie und startet die vollständige `minios-live -`-Pipeline. Häufige Optionen sind:

| Option | Wirkung |
| --- | --- |
| `-b`, `--build-dir` | Wurzelverzeichnis für Build-Ausgaben auswählen |
| `-c`, `--compression-type` | SquashFS-Kompression auswählen |
| `-kp`, `--kernel-provider` | `distribution` oder `minios` auswählen |
| `-kf`, `--kernel-flavour` | Distribution-Kernel-Flavor auswählen |
| `-mk`, `--minios-kernel` | MiniOS-Kernel-Provider auswählen |
| `-mks`, `--minios-kernel-series` | `auto`, `6.1` oder `6.12` auswählen und den MiniOS-Provider implizieren |
| `-kpm`, `--kernel-payload-mode` | `runtime` oder `full` auswählen |
| `-dkms`, `--kernel-build-dkms` | Optionale Treiber für den ausgewählten Kernel bauen |
| `-l`, `--locale` | System-Locale festlegen |
| `-ml`, `--multilingual` | Mehrere Locales generieren |
| `-kl`, `--keep-locales` | Verfügbare Locales beibehalten |
| `-tz`, `--timezone` | Zeitzone des Live-Systems festlegen |
| `-ib`, `--initramfs-builder` | `livekit` oder `dracut` auswählen |
| `-mln`, `--menu-language` | Sprache des Boot-Menüs auswählen |

Beispiel:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Eine Konfiguration generieren, ohne den Build zu starten:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Ohne ein anderes Ziel wird `build/build.conf` geschrieben. Das Frontend benötigt auch in diesem Modus Root-Rechte.

`--config-file FILE` wählt eine zu kopierende Konfiguration aus. Die aktuelle Implementierung schreibt dann geparste Kommandozeilenwerte und nicht-leere Frontend-Standardwerte in die Arbeitskopie, trotz der kürzeren Formulierung in `--help`. Für eine exakte, manuell gepflegte Konfiguration rufen Sie `minios-live` direkt auf und prüfen Sie die aktive Datei, anstatt sich auf das Frontend-Merging zu verlassen.

Kombinieren Sie `--config-only` nicht mit `--config-file`, das auf eine bestehende Konfiguration zeigt: Der nur-Konfigurationsmodus überschreibt diesen Pfad mit der Standardvorlage.
Verwenden Sie `-b DIR --config-only`, um ein separates generiertes Ziel auszuwählen.

### `minios-live`

`minios-live` ist das gestufte Backend. In einem Quellcode-Checkout liest es standardmäßig `linux-live/build.conf`; eine installierte Kopie liest `/etc/minios-live/build.conf`. Wählen Sie eine andere Datei und ein anderes Ausgabeverzeichnis über Umgebungsvariablen:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Verwenden Sie einen absoluten `BUILD_CONF`-Pfad über `sudo`. Konfigurationsdateien werden als Bash-Quellen geladen, daher sollten Sie nur vertrauenswürdige Dateien verwenden. Das Backend bietet keine Schalter zum Überschreiben einzelner Konfigurationsvariablen.

## Build-Stufen

Die Pipeline läuft in folgender Reihenfolge:

1. `build-bootstrap` erstellt das minimale Ziel-Root mit debootstrap.
2. `build-chroot` installiert und konfiguriert das Basissystem.
3. `build-live` erstellt das `00-core` SquashFS-Modul.
4. `build-modules` baut die geordneten Module der gewählten Umgebung.
5. `build-boot` generiert Initramfs, Kernel, EFI und Bootloader-Dateien.
6. `build-config` erzeugt MiniOS und Boot-Konfiguration.
7. `build-iso` veröffentlicht das bootfähige ISO und die Prüfsumme.
8. `remove-sources` löscht das gewählte Arbeitsverzeichnis, sofern konfiguriert.

Bindestrich- und Unterstrich-Formen der oben genannten Namen werden beide akzeptiert.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Ein teilweiser Befehl erstellt ausgelassene Eingaben nicht neu. `build-iso` verpackt nur den vorbereiteten Image-Baum, und `build-modules` kann `00-core` nicht neu erstellen. Führen Sie einen Build bis zur letzten abhängigen Stufe durch, nachdem Sie einen früheren Erzeuger geändert haben.

Eine vollständige Pipeline beginnt mit `build-bootstrap`, das die bestehenden `core/`- und `image/`-Verzeichnisse des gewählten Ziels entfernt. Sichern Sie nicht regenerierbare Inhalte vor dem Start; generierte Zielbäume sind Build-Ausgaben und kein dauerhafter Quellenspeicher.

Falls `REMOVE_SOURCES=true`, löscht und erstellt die abschließende `remove-sources`-Stufe das komplette `build/<distribution>-<variant>-<architecture>/`-Arbeitsverzeichnis neu, nicht nur heruntergeladene Quellarchive. Veröffentliche ISOs, gemeinsame Caches und Logs außerhalb dieses Verzeichnisses bleiben erhalten.

## Konfiguration

`linux-live/build.conf` steuert Zielidentität, Kernel, Spracheinstellungen, Bootloader, Live-Benutzer, Dienste, Caches, Snapshots, Bereinigung und Veröffentlichung. Wichtige Gruppen sind:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, und `PACKAGE_VARIANT` wählen das Ziel und die Modulkette aus.
- `COMP_TYPE` steuert SquashFS-Komprimierung.
- `LIVE_MODULE_MODE` wählt `merged` (der aktuelle Standard für jede Variante) oder `simple` Live-Config-Integration; dies wird nicht mehr nur anhand der Editionsgröße bestimmt.
- `KERNEL_*` und `MINIOS_KERNEL_SERIES` steuern Kernel-Beschaffung und Nutzlast.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, und `SERIAL_CONSOLE` steuern Boot-Artefakte.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, und `USE_APT_CACHER` steuern wiederverwendbare Eingaben.
- `VERBOSITY_LEVEL` akzeptiert `0`, `1`, oder `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, und `BUILD_TEST_ISO` steuern Veröffentlichung und Bereinigung.

Bearbeiten Sie keine generierte `build/<target>/build.conf` anstelle der Pflege der gewählten Quellkonfiguration.

### Kernel-Auswahl

Der `distribution`-Provider ermittelt den ausgewählten Debian- oder Ubuntu-Kernel und bei aktiviertem DKMS die passenden Header in einem isolierten, signierten APT-Status.
`KERNEL_AUTO_SELECT=true` leitet Quell-Suite und Architektur vom Userspace-Ziel ab. Setzen Sie den Wert auf `false`, um die manuellen Felder für Distribution, Architektur, Version, Snapshot und Update-Richtlinie in `build.conf` zu verwenden.

Bei 32-Bit-x86-Builds (i386) von Debian Trixie oder Devuan Excalibur wird bei der automatischen Auswahl der Kernel-Provider MiniOS verwendet. Dies gilt auch, wenn in der Konfiguration `KERNEL_PROVIDER=distribution` als Provider angegeben ist. Trixie enthält keinen i386-Distributionskernel mehr.

Der `minios`-Provider installiert `linux-image-SERIES-mos-ARCH`, prüft die Unterstützung von AUFS und verwendet für DKMS die passenden MiniOS-Header. Er benötigt `KERNEL_FLAVOUR=none` sowie übereinstimmende Architekturen für Userspace- und Kernel-Pakete.
Im aktuellen Code wird `MINIOS_KERNEL_SERIES=auto` zu `6.12` aufgelöst. Verwenden Sie ausdrücklich `6.1`, wenn diese Reihe benötigt wird.

`KERNEL_PAYLOAD_MODE=runtime` behält den Kernel-Modulbaum, die Kernel-Konfiguration, `System.map`, Bereitstellungsmetadaten und die Laufzeitintegration unter `modprobe.d`, `modules-load.d` und `udev/rules.d`. Build-spezifische Paketstatusdaten, Header, DKMS-Quellen, Compiler-Werkzeuge und Initramfs-Pakete werden entfernt. Die Firmware bleibt im Zuständigkeitsbereich von `02-firmware`. `full` behält umfangreichere Diagnosekomponenten bei.

## Modulsystem

Modulquellen befinden sich unter `linux-live/scripts/`. Eine Umgebung unter `linux-live/environments/<desktop>/` enthält geordnete Symlinks zu den verwendeten Quellen. Der umgebungsspezifische Name steuert die Build-Reihenfolge und kann eine gemeinsame Quelle neu nummerieren, zum Beispiel:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` wird erzeugt von `build-live` und ist kein gewöhnlicher Umgebungslink.
Module `01` und höher sind kumulativ: Jedes baut auf den jeweils darunterliegenden Modulen auf. `skip_conditions.conf` kann Einträge für ein Ziel auslassen. Prüfen Sie daher die gewählte Umgebung, anstatt von einer universellen Kette auszugehen.

Verwenden Sie `linux-live/scripts/10-example/` als aktuelles Authoring-Template. Ein Modul kann enthalten:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Nur die für das Modul benötigten Dateien sind erforderlich. `build`, `postinstall`, Skip-Bedingungen, Patches und Rootcopy-Bäume sind optional. `build` und `patches/` stehen für `00-core` nicht zur Verfügung.

Die Besitzrechte des Hosts in Rootcopy-Bäumen bleiben nicht erhalten; kopierte Dateien werden normalerweise zu `root:root`. Eine `.minios-ownership`-Manifestdatei innerhalb eines Rootcopy-Baums verwendet:

```text
owner:group relative/path
```

Pfade müssen im Baum bleiben. Der Host wendet das Manifest sofort an und löst Namen über die Host-Account-Datenbank auf. Verwenden Sie numerische `UID:GID`-Werte für reine Zielkonten oder setzen Sie Besitzrechte aus `install` oder `postinstall` innerhalb des Chroots. Das Verschieben des Manifests nach `rootcopy-postinstall/` ändert nichts an der Namensauflösung.

Da die aktuelle Containment-Prüfung den Zielpfad nicht kanonisiert, verwenden Sie niemals `..`-Komponenten oder Symlink-Komponenten in Manifestpfaden. Überprüfen Sie Rootcopy-Bäume vor einem privilegierten Build; ein manipulierte Pfad kann dazu führen, dass hostseitige `chown` aus dem kopierten Baum entkommen.

Für Pakete verwenden gewöhnliche Modul-Installationsskripte die durch `build-modules` ins Chroot kopierten Dateien:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Siehe [CondinAPT](/development/CondinAPT) für die Paketlisten-Syntax und die aktuelle MiniOS-Filterzuordnung.

### Modul hinzufügen

Kopieren Sie die Vorlage und verlinken Sie sie dann in jede gewünschte Umgebung an der gewünschten umgebungslokalen Position:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Passen Sie `packages.list`, Skripte, Metadaten und Rootcopy-Inhalte vor dem Bauen an.
Validieren Sie jede angegebene Desktop-, Varianten-, Distributions- und Architekturangabe.

## Sicheres Neubauen

Vorhandene Modul-Artefakte werden übersprungen. Wenn sich ein niedrigeres kumulatives Modul ändert, entfernen Sie dessen Artefakt sowie den kompletten höheren Modultail, bevor Sie `build-modules` ausführen; das Beibehalten höherer Module würde Inhalte erhalten, die gegen die alte untere Schicht gebaut wurden. Identifizieren Sie Artefakte anhand der gewählten Umgebungsreihenfolge und des Modulnamens, da Skip-Bedingungen Nummernlücken schließen können.

Die Kernel-Schicht ist ein Sonderfall. Um nur `01-kernel` neu zu bauen, entfernen Sie dessen Artefakt für das gewählte Ziel und bauen Sie von den Modulen bis zur Veröffentlichung neu:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Prüfen Sie den Zielpfad vor dem Entfernen. Wenden Sie diese Abkürzung nicht auf `00-core` an und gehen Sie nicht davon aus, dass sie für Module ab `02` sicher ist.

Für ein gewöhnliches Modul wie `03-gui-base` entfernen Sie dessen Artefakt und alle späteren anwendbaren Modul-Artefakte, dann führen Sie denselben `build-modules -`-Bereich aus. Bei Änderungen nur an Initramfs, EFI oder Boot lassen Sie SquashFS-Module bestehen und führen Sie aus:

```bash
sudo ./minios-live build-boot -
```

Führen Sie einen vollständigen Build durch, nachdem Sie `00-core`, Bootstrap/Chroot-Setup, Zielidentität, Repository-Policy oder eine andere Eingabe geändert haben, die nicht auf eine spätere Stufe isoliert werden kann.

## Ausgaben und Protokolle

Mit dem Standardwert `BUILD_DIR` sind wichtige Pfade:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` und `build/iso/*.iso.sha256`
- `build/log/build-*.log`

ISO-Namen hängen von den Build-Einstellungen, dem Release-Modus und Zeitstempeln ab. Verwenden Sie den vom erfolgreichen Build ausgegebenen Pfad, anstatt den vollständigen Basisnamen vorherzusagen.

## Geheimnisse und Debug-Artefakte

Speichern Sie ein Ubuntu-Pro-Token nicht in der Versionsverwaltung, Dokumentation, Shell-History oder in gemeinsam genutzten Logs. Verwenden Sie stattdessen eine private Konfigurationsdatei außerhalb des Repositorys:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Legen Sie `USE_UBUNTU_PRO=true` und `UBUNTU_PRO_TOKEN=...` nur in dieser Datei fest. Beim Build werden die Pro-Daten aus dem Image entfernt, die Datei auf dem Host enthält das Geheimnis jedoch weiterhin.

Wenn Pro für eine unterstützte Ubuntu-Suite angefordert wird, prüft der Builder, ob sowohl `esm-infra` als auch `esm-apps` aktiviert sind und APT beide Sicherheitsindizes geladen hat. Schlägt die Aktivierung fehl oder wird die Indexaktualisierung nicht vollständig abgeschlossen, wird der Build abgebrochen, statt stillschweigend nur die öffentlichen Archive zu verwenden.

`DEBUG_SSH_KEYS=true` generiert zu Debugging-Zwecken private Schlüssel. Behandeln Sie das resultierende Image als Wegwerfprodukt und veröffentlichen Sie es niemals, ohne zuvor zu prüfen, ob der Schlüssel fehlt.

Wenn Sie die Option wieder auf `false` setzen, werden bereits generierte Schlüssel in `build/<target>/image/minios/debug_ssh_key`, benachbarten `authorized_keys.*`-Dateien oder `build/<target>/debug_ssh_key` nicht entfernt. Verwenden Sie ein sauberes Zielverzeichnis oder löschen Sie diese Dateien ausdrücklich. Prüfen Sie anschließend den ISO-Baum, bevor Sie ihn veröffentlichen.

## Fehlerbehebung

- Bootstrap-Fehler betreffen meist die Erreichbarkeit von Repositories, debootstrap-Unterstützung, Architektur, Snapshots oder fehlende Host-Voraussetzungen.
- Fehler im Core und in Modulen betreffen meist die Paketverfügbarkeit, CondinAPT-Filter, Maintainer-Skripte, Rootcopy-Inhalte oder ein veraltetes unteres Modul.
- Boot-Fehler betreffen meist den gewählten Kernel, den Initramfs-Builder, die EFI-Beschaffung, die GRUB/SYSLINUX-Erzeugung oder fehlende Boot-Eingaben.
- ISO-Fehler betreffen meist den vorbereiteten Image-Baum, xorriso, Ausgabespeicherplatz oder Bereinigungseinstellungen.

Nach einem unterbrochenen privilegierten Build prüfen Sie die Mounts unterhalb des Zielarbeitsverzeichnisses, bevor Sie es erneut versuchen. Lesen Sie die entsprechende `build/log/build-*.log`; reparieren Sie keine generierten Overlays oder `.sb`-Dateien direkt.

## Verwandte Dokumentation

- [Module verwalten](/preparing-and-customizing/Managing-Modules)
- [Eigene Images zusammenstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
