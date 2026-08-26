# Konfigurationsdatei

MiniOS-Bootmedien speichern die Hauptkonfiguration unter `minios/config.conf`. Beim Start synchronisiert das initramfs diese nach `/etc/live/config.conf` im zusammengefügten Live-Root. Skripte im laufenden System sollten daher `/etc/live/config.conf` auslesen; `/etc/minios/config.conf` und `config/config.conf` sind keine Konfigurationspfade, die vom aktuellen Boot-Code verwendet werden.

Boot-Parameter können die entsprechenden Dateieinstellungen überschreiben. Nachfolgend ein Beispiel für eine Standard-`config.conf`:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Beschreibung der Parameter

**Legende:**
- 🔒 **Nur einmalig** – Wird nur beim ersten Start angewendet, kann bei weiteren Starts nicht mehr geändert werden
- 🔄 **Rekonfigurierbar** – Kann bei jedem Start geändert und erneut angewendet werden

| Parameter | Rekonfigurierbar | Bedeutung | Beispiel |
| --------- | ---------------- | --------- | -------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Zusätzliche live-config-Optionen. `nottyautologin` wird hier gespeichert, anstatt in jedem Boot-Eintrag fest hinterlegt zu sein. Siehe `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | 🔄 | Der Name des Knotens, der mit dem System verbunden ist. Siehe `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Der Name des Benutzers, dessen Profil beim ersten Start erstellt wird. Wenn Sie den Benutzernamen <strong>root</strong> angeben, wird kein Benutzerprofil erstellt und die Anmeldung erfolgt mit dem <strong>root</strong>-Profil. Siehe `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Vollständiger Name des Hauptbenutzers. Siehe `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Kommagetrennte Liste der Gruppen für den Hauptbenutzer. Siehe `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Das Passwort des Hauptbenutzers in verschlüsselter Form (Hash). Verwenden Sie `mkpasswd -m yescrypt` zur Generierung. Siehe `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Passwort des privilegierten Benutzers **root** in verschlüsselter Form (Hash). Verwenden Sie `mkpasswd -m yescrypt` zur Generierung. Siehe `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Wenn gesetzt, wird die Anmeldung als root deaktiviert und sudo/policykit für den Benutzer abgeschaltet. Siehe `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Setzt die Locale. Mehrere Werte können durch Kommas getrennt werden. Siehe `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Setzt die Zeitzone (z.B. "Europe/Berlin", "Etc/UTC"). Siehe `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Setzt das Tastaturmodell (z.B. "pc105"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Setzt die Tastaturlayouts (kommagetrennt, z.B. "us,de"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Setzt Tastaturoptionen (z.B. "grp:alt_shift_toggle,grp_led:scroll"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Setzt die Tastaturvarianten (kommagetrennt, kann leer sein oder zu den Layouts passen). Siehe `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Aktiviert Debug-Ausgabe für live-config. Siehe `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Wenn aktiviert, werden Benutzerverzeichnisse aus dem angegebenen Pfad verlinkt. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Wenn aktiviert, werden Benutzerverzeichnisse aus dem angegebenen Pfad eingebunden (bind-mount). | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Pfad zu den Benutzerdatenverzeichnissen auf dem USB-Stick. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Betriebsmodus des Systems auswählen. Wenn Sie Software ausschließlich per Modulen installieren möchten, verwenden Sie "merged". Wenn Sie Software per apt installieren möchten, verwenden Sie "simple". Standard ist "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Das systemd-Target, in das gebootet wird. Siehe `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Dienste beim Start aktivieren (kommagetrennt). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Dienste beim Start deaktivieren (kommagetrennt). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Wenn aktiviert und das gewählte MiniOS-Datenverzeichnis beschreibbar ist, werden Boot-Logs nach `minios/log/YYYYMMDD_HHMMSS/` kopiert. | EXPORT_LOGS="false" |


**Weitere Details zu den meisten Parametern finden Sie unter:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Für systemd-Targets: `man systemd.special`

## Wichtig!

* Der SSH-Server ist standardmäßig aktiviert, um die Kompatibilität mit Drittanbieter-initrds zu gewährleisten. Um ihn zu deaktivieren, müssen Sie ihn nicht nur aus `ENABLE_SERVICES` entfernen.

## Quelle, Laufzeitkopie und Priorität

Das gewählte MiniOS-Datenverzeichnis ist normalerweise das `minios/`-Verzeichnis auf dem Bootmedium. Seine Konfigurationspfade und deren Laufzeitkopien sind:

| Gewähltes Datenverzeichnis | Laufendes System |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Bei einem normal eingehängten Medium sind diese Quelldateien als `minios/config.conf` und `minios/config.conf.d/*.conf` sichtbar, oft unterhalb von `/run/initramfs/memory/data/`. Sie werden nicht direkt von `live-config` geladen. Das Initramfs synchronisiert sie mit den Laufzeitpfaden, bevor `minios-boot` ausgeführt wird; siehe [Boot-Modi](/configuration/Boot-Modes.md) für den genauen Ablauf im Bootprozess.

Die Synchronisation erfolgt beim Booten, nicht durch einen Dateimonitor:

- Die neuere Kopie von `config.conf` gewinnt anhand der Änderungszeit. Eine neuere Quellkopie wird ins Live-Root kopiert. Eine neuere Laufzeitkopie wird nur zurückkopiert, wenn das gewählte Datenverzeichnis beschreibbar ist.
- Jede `config.conf.d/*.conf`-Datei wird unabhängig nach Dateinamen synchronisiert, unter Anwendung derselben Regeln für Änderungszeit und Schreibbarkeit. Dateien werden auf keiner Seite gelöscht.
- Wenn die Systemuhr vor der letzten aufgezeichneten Synchronisationszeit liegt, wird der Zeitstempelvergleich übersprungen und nur fehlende Zieldateien werden ergänzt.
- `toram=trim` kopiert `config.conf`, lässt aber `config.conf.d/` aus; siehe [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md). Ein vollständiges `toram` kopiert den gesamten Datenbaum, aber die Synchronisation zielt dann auf die RAM-Kopie statt auf das getrennte Medium.

Nach der Synchronisation liest `live-config` zuerst `/etc/live/config.conf` und dann `/etc/live/config.conf.d/*.conf` in Shell-Glob-Reihenfolge, sodass ein späteres Fragment einen früheren Wert ersetzen kann. Die tatsächliche Kernel-Befehlszeile wird an `LIVE_CONFIG_CMDLINE` angehängt; bei dort wiederholten Optionen gilt der spätere Eintrag auf der Kernel-Befehlszeile. `minios-boot` liest ebenfalls `/etc/live/config.conf` für seine unterstützten frühen Einstellungen und gibt seinen erkannten Kernel-Parametern Vorrang.

Sie können projektspezifische Shell-Variablen zu diesen Dateien hinzufügen und sie aus `/etc/live/config.conf` oder den Fragmenten zur Laufzeit auslesen. Werte bitte als Shell-Strings in Anführungszeichen setzen und keine Leerzeichen um `=` verwenden.

Das frühe MiniOS-Log ist `/var/log/minios/minios-boot.log`, während die späte `live-config`-Ausgabe `/var/log/live/config.log` ist. Mit `EXPORT_LOGS="true"` werden beide Bäume nach `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` kopiert, wenn das gewählte Datenverzeichnis beschreibbar ist.
