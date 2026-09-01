---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Build von MiniOS

MiniOS wird aus einem Basis-SquashFS-Image, geordneten Erweiterungsmodulen, Kernel- und Boot-Dateien sowie generierter Konfiguration zusammengesetzt. Diese Seite beschreibt die aktuellen Build-Schnittstellen des Quellbaums und die Abhängigkeiten zwischen deren Ausgaben.

Führen Sie `./minios-cmd --help`, `./minios-live --help` aus und prüfen Sie die ausgewählte `build.conf`, bevor Sie den Build starten. Diese Dateien sind maßgeblich für die ausgecheckte Version.

## Anforderungen

Bauen Sie auf Debian oder Ubuntu mit ausreichend freiem Speicherplatz unterhalb von `BUILD_DIR` und `/tmp`.
Ein typisches Desktop-Ziel benötigt mindestens 20 GiB. Für Build-Operationen werden Root-Rechte für debootstrap, Chroots, Mounts, Loop-Devices und Image-Erstellung benötigt; das Anzeigen der Hilfe nicht.

Die maßgebliche Paketliste für das Host-System ist `linux-live/prerequisites.list`. Für das aktuelle Checkout kann sie installiert werden mit:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

In einem Quellcode-Checkout prüft `minios-live` diese Liste vor dem Bauen, sofern nicht `SKIP_SETUP_HOST=true`. Auf einem normalen Host werden fehlende Pakete gemeldet und der Vorgang abgebrochen; eine automatische Installation erfolgt nur im Container-Build-Pfad.

Die Standardkonfiguration prüft die Internetverbindung. Diese Prüfung kann mit `CHECK_INTERNET_CONNECTION=false` deaktiviert werden und wird bei einem vorbereiteten APT-Cache-Repository übersprungen, aber alle benötigten Paket- und Boot-Dateien müssen weiterhin aus konfigurierten Repositories oder Caches verfügbar sein.

Falls `USE_APT_CACHER=true`, muss ein erreichbarer apt-cacher-ng-Dienst bereits unter `APT_CACHER_ADDRESS` konfiguriert sein; andernfalls setzen Sie die Option auf `false` vor dem Bauen.

::: danger Bootstrap-Vertrauen
Der aktuelle Bootstrap-Pfad ruft debootstrap mit `--no-check-gpg` auf und lädt den MiniOS-Archivschlüssel über nicht authentifiziertes HTTP herunter. Verwenden Sie das resultierende Image nicht als vertrauenswürdiges Release-Artefakt, bis diese Quellpfade eine authentifizierte Schlüssel- und Bootstrap-Überprüfung erzwingen.
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

`linux-live/build.conf` steuert die Zielidentität, Kernel, Locale, Bootloader, Live-Benutzer, Dienste, Caches, Snapshots, Bereinigung und Veröffentlichung. Wichtige Gruppen sind:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` und `PACKAGE_VARIANT` wählen das Ziel und die Modulkette.
- `COMP_TYPE` steuert SquashFS-Kompression.
- `KERNEL_*` und `MINIOS_KERNEL_SERIES` steuern Kernel-Beschaffung und -Payload.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` und `SERIAL_CONSOLE` steuern Boot-Artefakte.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` und `USE_APT_CACHER` steuern wiederverwendbare Eingaben.
- `VERBOSITY_LEVEL` akzeptiert `0`, `1` oder `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` und `BUILD_TEST_ISO` steuern Veröffentlichung und Bereinigung.

Bearbeiten Sie keine generierte `build/<target>/build.conf` als Ersatz für die Pflege der gewählten Quellkonfiguration.

### Kernel-Auswahl

Der `distribution`-Provider löst den gewählten Debian- oder Ubuntu-Kernel auf und, wenn DKMS aktiviert ist, die passenden Header in einem isolierten, signierten APT-Zustand.
`KERNEL_AUTO_SELECT=true` leitet Suite und Architektur aus dem Userspace-Ziel ab. Setzen Sie ihn auf `false`, um die manuellen Felder für Distribution, Architektur, Version, Snapshot und Update-Policy in `build.conf` zu verwenden.

Der `minios`-Provider installiert `linux-image-SERIES-mos-ARCH`, prüft AUFS-Unterstützung und verwendet die passenden MiniOS-Header für DKMS. Er erfordert `KERNEL_FLAVOUR=none` und übereinstimmende Paketarchitekturen für Userspace und Kernel.
Im aktuellen Code wird `MINIOS_KERNEL_SERIES=auto` zu `6.12` aufgelöst; verwenden Sie `6.1` explizit, wenn diese Serie benötigt wird.

`KERNEL_PAYLOAD_MODE=runtime` behält den Kernel-Modulbaum, die Kernel-Konfiguration, `System.map`, Deployment-Metadaten und Laufzeit-Integration unter `modprobe.d`, `modules-load.d` und `udev/rules.d`. Build-only-Paketstatus, Header, DKMS-Quellen, Compiler-Tools und Initramfs-Pakete werden entfernt. Firmware bleibt im Besitz von `02-firmware`. `full` behält eine erweiterte Diagnosenutzlast.

## Modulsystem

Modulquellen befinden sich unter `linux-live/scripts/`. Eine Umgebung unter `linux-live/environments/<desktop>/` enthält geordnete Symlinks zu den verwendeten Quellen. Der umgebungslokale Name steuert die Build-Reihenfolge und kann eine gemeinsame Quelle umnummerieren, zum Beispiel:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` wird von `build-live` erzeugt und ist kein gewöhnlicher Umgebungslink.
Module ab `01` sind kumulativ: Jedes wird über den zutreffenden niedrigeren Modulen gebaut. `skip_conditions.conf` kann Einträge für ein Ziel auslassen, daher prüfen Sie die gewählte Umgebung, statt eine universelle Kette anzunehmen.

Verwenden Sie `linux-live/scripts/10-example/` als aktuelle Vorlage für die Erstellung. Ein Modul kann enthalten:

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

Nur die für das Modul benötigten Dateien sind erforderlich. `build`, `postinstall`, Skip-Bedingungen, Patches und Rootcopy-Bäume sind optional. `build` und `patches/` stehen `00-core` nicht zur Verfügung.

Besitzrechte des Hosts in Rootcopy-Bäumen werden nicht beibehalten; kopierte Dateien werden normalerweise `root:root`. Ein `.minios-ownership`-Manifest innerhalb eines Rootcopy-Baums verwendet:

```text
owner:group relative/path
```

Pfade müssen innerhalb des Baums bleiben. Das Host-System wendet das Manifest sofort an und löst Namen über die Host-Account-Datenbank auf. Verwenden Sie numerische `UID:GID`-Werte für Ziel-Only-Accounts oder setzen Sie Besitzrechte aus `install` oder `postinstall` innerhalb des Chroots. Das Verschieben des Manifests nach `rootcopy-postinstall/` ändert die Namensauflösung nicht.

Da die aktuelle Containment-Prüfung den Zielpfad nicht kanonisiert, verwenden Sie niemals `..`-Komponenten oder Symlink-Komponenten in Manifestpfaden. Prüfen Sie Rootcopy-Bäume vor einem privilegierten Build; ein manipulierter Pfad kann dazu führen, dass `chown` des Hosts aus dem kopierten Baum entkommt.

Für Pakete verwenden gewöhnliche Modul-Installationsskripte die von `build-modules` in das Chroot kopierten Dateien:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
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

Legen Sie kein Ubuntu Pro-Token in die Versionskontrolle, Dokumentation, Shell-Historie oder gemeinsame Protokolle. Bevorzugen Sie eine private Konfiguration außerhalb des Repositories:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Setzen Sie `USE_UBUNTU_PRO=true` und `UBUNTU_PRO_TOKEN=...` nur in dieser Datei. Der Build entfernt Pro-Zustand aus dem Image, aber die Datei auf dem Host enthält das Geheimnis weiterhin.

`DEBUG_SSH_KEYS=true` erzeugt privaten Schlüsselmaterial für das Debugging. Behandeln Sie das resultierende Image als Wegwerfobjekt und veröffentlichen Sie es niemals, ohne zu prüfen, dass der Schlüssel entfernt wurde.

Das Zurücksetzen der Option auf `false` entfernt keine bereits in `build/<target>/image/minios/debug_ssh_key`, den angrenzenden `authorized_keys.*`-Dateien oder `build/<target>/debug_ssh_key` generierten Schlüssel. Verwenden Sie ein sauberes Ziel oder entfernen Sie diese Dateien explizit und prüfen Sie dann den ISO-Baum vor der Veröffentlichung.

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
