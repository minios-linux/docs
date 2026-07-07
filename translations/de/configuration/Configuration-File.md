# Konfigurationsdatei

MiniOS unterscheidet sich von den meisten klassischen Flash-Distributionen dadurch, dass einige Parameter bereits vor dem Booten in einer recht einfachen Konfigurationsdatei `config/config.conf` festgelegt werden können. Das minimiert den Aufwand beim Erstellen eigener Module für Embedded-Systeme. Optional lassen sich einige Parameter auch in den Boot-Parametern setzen. Boot-Optionen haben Vorrang vor der Konfigurationsdatei. Manche Parameter in dieser Datei sind systemrelevant und sollten besser nicht verändert werden. Nachfolgend ein Beispiel für eine Standard-Konfigurationsdatei:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
- 🔒 **Einmalig** – Wird nur beim ersten Start angewendet und kann danach nicht mehr geändert werden  
- 🔄 **Rekonfigurierbar** – Kann bei jedem Start geändert und erneut angewendet werden

| Parameter | Rekonfigurierbar | Bedeutung | Beispiel |
| --------- | ---------------- | --------- | -------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Zusätzliche live-config Boot-Parameter. Siehe `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Der Name des mit dem System verbundenen Knotens. Siehe `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Der Name des Benutzers, dessen Profil beim ersten Start erstellt wird. Wenn Sie <strong>root</strong> als Benutzernamen angeben, wird kein Benutzerprofil erstellt und die Anmeldung erfolgt mit dem <strong>root</strong>-Profil. Siehe `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Vollständiger Name für den Hauptbenutzer. Siehe `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Durch Kommas getrennte Liste der Gruppen für den Hauptbenutzer. Siehe `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Passwort des Hauptbenutzers in verschlüsselter Form (Hash). Mit `mkpasswd -m yescrypt` generieren. Siehe `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Passwort des privilegierten Benutzers **root** in verschlüsselter Form (Hash). Mit `mkpasswd -m yescrypt` generieren. Siehe `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Wenn gesetzt, wird die Anmeldung als root deaktiviert und sudo/policykit für den Benutzer ausgeschaltet. Siehe `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Setzt die Locale. Mehrere Werte können durch Kommas getrennt werden. Siehe `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Legt die Zeitzone fest (z.B. "Europe/Berlin", "Etc/UTC"). Siehe `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Legt das Tastaturmodell fest (z.B. "pc105"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Legt die Tastaturbelegungen fest (durch Kommas getrennt, z.B. "us,de"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Legt Tastaturoptionen fest (z.B. "grp:alt_shift_toggle,grp_led:scroll"). Siehe `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Legt die Tastatur-Varianten fest (durch Kommas getrennt, kann leer sein oder zu den Layouts passen). Siehe `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Aktiviert Debug-Ausgaben für live-config. Siehe `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Wenn aktiviert, werden Benutzerverzeichnisse vom angegebenen Pfad verlinkt. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Wenn aktiviert, werden Benutzerverzeichnisse vom angegebenen Pfad eingebunden (bind-mount). | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Pfad zu den Benutzerdatenverzeichnissen auf dem USB-Stick. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Betriebsmodus des Systems auswählen. Wenn Sie Software ausschließlich per Modulen installieren möchten, wählen Sie "merged". Für Software-Installation via apt wählen Sie "simple". Standard ist "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | Das systemd-Target, in das gebootet wird. Siehe `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Dienste beim Booten aktivieren (durch Kommas getrennt). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Dienste beim Booten deaktivieren (durch Kommas getrennt). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Wenn aktiviert und von einem beschreibbaren Medium gebootet wird, werden MiniOS-Logs beim Booten in den Ordner minios/logs kopiert. | EXPORT_LOGS="false" |


**Weitere Details zu den meisten Parametern finden Sie unter:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Für systemd-Targets: `man systemd.special`

## Wichtig!

* Der SSH-Server ist standardmäßig aktiviert, um die Kompatibilität mit Drittanbieter-initrds zu gewährleisten. Um ihn zu deaktivieren, reicht es nicht, ihn nur aus `ENABLE_SERVICES` zu entfernen.

Wofür kann die Datei `config.conf` noch nützlich sein? Sie können sie verwenden, um eigene Parameter in Ihren Skripten beim Erstellen von Modulen zu setzen. Beim ersten Start wird sie in den Ordner /etc/minios kopiert, danach wird die Datei `/etc/live/config.conf` automatisch überwacht und bei Änderungen die Konfigurationsdatei auf dem Flash-Laufwerk überschrieben, sofern dieses beschreibbar ist. So können Sie Ihre Variablen in config.conf ablegen und in Ihren Skripten aus `/etc/live/config.conf` auslesen – unabhängig davon, welcher Typ von initrd verwendet wird.
