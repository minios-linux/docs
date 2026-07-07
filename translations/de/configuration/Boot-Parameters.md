# Boot-Parameter

## Verwendung von Boot-Parametern

Boot-Parameter, auch als Kernel-Parameter bekannt, sind Befehle, die Sie eingeben können, um den Bootvorgang von MiniOS anzupassen. Sie können verwendet werden, um die Hardware-Erkennung zu deaktivieren, MiniOS von einem bestimmten Gerät zu starten und mehr.

### Für Syslinux:

- Drücken Sie während des MiniOS-Startvorgangs <kbd>Esc</kbd>, um das Boot-Menü aufzurufen.
- Drücken Sie <kbd>Tab</kbd>, um die Boot-Optionen zu bearbeiten.
- Geben Sie die gewünschten Parameter ein und drücken Sie Enter, um zu starten.

### Für Grub:

- Drücken Sie <kbd>E</kbd>, sobald das Grub-Menü angezeigt wird.
- Bearbeiten Sie die Boot-Parameter am Ende der Befehlszeile.
- Drücken Sie <kbd>F10</kbd>, um mit den neuen Einstellungen zu starten.

## Tabelle der Boot-Parameter

Die folgende Tabelle listet die in MiniOS verfügbaren Boot-Parameter, deren Funktionen sowie Anwendungsbeispiele auf.

**Legende:**
- 🔒 **Nur einmalig** – Wird nur beim ersten Start angewendet, kann bei späteren Starts nicht mehr geändert werden
- 🔄 **Rekonfigurierbar** – Kann bei jedem Start geändert und erneut angewendet werden


| Parameter | Rekonfigurierbar | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | 🔄 | Lädt MiniOS-Daten aus einem angegebenen Verzeichnis, Gerät oder einer ISO-Datei. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Lädt angegebene `.sb`-Module anhand eines regulären Ausdrucks. Funktioniert zusammen mit dem Befehl `toram=trim`, sodass nur ausgewählte Module in den RAM geladen werden.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Verhindert das Laden bestimmter `.sb`-Module anhand eines regulären Ausdrucks. Funktioniert zusammen mit `toram=trim`, um ausgewählte Module vom Laden in den RAM auszuschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Legt die Dateiendung für Bundles (Module) fest. Standard ist `sb`. | `bext=mymod` |
| `timing` | 🔄 | Aktiviert die Timing-Ausgabe beim Start zur Performance-Analyse. | `timing` |
| `union` | 🔄 | Erzwingt die Verwendung eines bestimmten Union-Dateisystems. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Setzt eine statische IP-Adresse für Netzwerkschnittstellen, genutzt beim PXE-Boot. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Legt die Cache-Größe in MB für über HTTP geladene Daten fest. | `cache=512` |
| `rd.break` | 🔄 | Stoppt den Bootvorgang am Ende der Initramfs-Phase und öffnet eine Debug-Shell. | `rd.break` |
| `perchdir` | 🔄 | Wählt ein Profil aus oder führt eine Aktion mit einem Profil durch. Akzeptiert die Profilnummer oder die Schlüsselwörter `resume` (letzte Sitzung fortsetzen), `new` (neue Sitzung starten) oder `ask` (Sitzung beim Start auswählen). Wenn nicht angegeben, startet MiniOS im "Clean"-Modus. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Legt die Größe des DynFileFS-virtuellen Dateisystems (in MB) fest, das zur Datenspeicherung auf nicht-Linux-Dateisystemen (z. B. FAT32, NTFS) verwendet wird. Standard ist 16 GB. Nutzen Sie diese Option, wenn Ihr Zielmedium kleiner ist. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Speichermodus für persistente Änderungen.<br>`native` (Standard) – Speicherung der Daten wie sie sind auf POSIX-kompatiblen Dateisystemen;<br>`dynfilefs` – Speicherung der Daten in dynamisch wachsenden Image-Dateien;<br>`raw` – Speicherung der Daten in einer Image-Datei mit fester Größe.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Aktiviert Persistenz und setzt die zuletzt genutzte Sitzung fort. Entspricht `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Kopiert das System in den RAM. Akzeptiert die Werte `trim` und `full`. Ohne Angabe wird standardmäßig `full` verwendet.<br>`trim` – Es werden nur die notwendigen Daten kopiert, unter Berücksichtigung der Filter `load` und `noload`. Falls `perch`-Parameter angegeben sind, werden auch Änderungen geladen.<br>`full` – Der gesamte minios-Ordner wird geladen, Änderungen ausgenommen, sofern `perch` nicht angegeben ist. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Deaktiviert den X-Server und startet im Textkonsolenmodus. | `text` |
| `automount` | 🔄 | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | 🔄 | Aktiviert Debug-Ausgaben beim Start. | `debug` |
| `nozram` | 🔄 | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | 🔄 | Legt die Größe des zram-Swaps (in MB) fest. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Gibt den zram-Komprimierungsalgorithmus an. Verfügbare Optionen für Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Standard ist `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Legt das Standard-Systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Aktiviert angegebene Systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Deaktiviert angegebene Systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die Standardauflösung in VMs ist 1280x800. (Nur in der XFCE-Umgebung relevant.) | `novirtres` |
| `virtres` | 🔄 | Legt die Bildschirmauflösung in virtuellen Maschinen fest (Breite x Höhe). (Nur in der XFCE-Umgebung relevant.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Gibt an, welche live-config-Komponenten ausgeführt werden sollen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Gibt an, welche live-config-Komponenten NICHT ausgeführt werden sollen. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Legt den System-Hostnamen fest. | `hostname=minios` |
| `username` | 🔒 | Legt den Benutzernamen für den Autologin fest. | `username=live` |
| `user-default-groups` | 🔒 | Legt Standardgruppen für den Benutzer fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Legt den vollständigen Namen des Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Legt das Root-Passwort im Klartext fest. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Legt das Root-Passwort in verschlüsselter Form fest. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Legt das Benutzerpasswort im Klartext fest. | `user-password=live` |
| `user-password-crypted` | 🔒 | Legt das Benutzerpasswort in verschlüsselter Form fest. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Legt das System-Locale fest. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Legt die System-Zeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Legt die Tastaturbelegungen fest (durch Kommas getrennt). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Legt die Tastaturvarianten fest (durch Kommas getrennt). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Deaktiviert sudo- und PolicyKit-Rechte. | `noroot` |
| `noautologin` | 🔄 | Deaktiviert sowohl den Konsolen- als auch den grafischen Autologin. | `noautologin` |
| `nottyautologin` | 🔄 | Deaktiviert nur den Konsolen-Autologin. | `nottyautologin` |
| `nox11autologin` | 🔄 | Deaktiviert nur den grafischen Autologin. | `nox11autologin` |
| `xorg-driver` | 🔄 | Legt den Xorg-Treiber fest, anstatt ihn automatisch zu erkennen. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Legt die Xorg-Auflösung fest, anstatt sie automatisch zu erkennen. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Legt den Modus für Live-Konfigurationsmodule fest. Bei "merged" werden Konfigurationsänderungen dynamisch integriert. | `module-mode=merged` |
| `hooks` | 🔄 | Führt beliebige Dateien vom Dateisystem, Medium oder von URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Kombinieren Sie Befehle mit Leerzeichen. Weitere Kernel-Parameter, die für alle Linux-Distributionen gelten, finden Sie in den Referenzseiten `man bootparam`.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/configuration/live-config.md).
