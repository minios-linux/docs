---
updated: 2026-08-31
---

# config.conf

`config.conf` ist die zentrale MiniOS Vorkonfigurationsdatei. Auf einem normalen MiniOS Medium wird sie als `minios/config.conf` gespeichert. Beim Systemstart synchronisiert das initramfs diese Datei mit `/etc/live/config.conf` im zusammengebauten System.

Verwenden Sie diese Datei, um festzulegen, wie MiniOS startet und wie eine neue persistente Sitzung initialisiert wird. Sie dient in erster Linie als Vorkonfigurationsmechanismus für Administratoren und ersetzt nicht die normalen Konfigurationstools der laufenden Desktop-Umgebung.

## Neukonfiguration

Die Spalte **Rekonfigurierbar** unten hat folgende Bedeutungen:

- **Ja** — Die Einstellung kann geändert und bei einem späteren Start erneut angewendet werden.
- **Nur beim ersten Start** — Die Einstellung wird verwendet, wenn der entsprechende persistente Zustand erstmals erstellt wird, und wird normalerweise bei späteren Starts nicht erneut angewendet.

Diese Unterscheidung ist Teil des Verhaltens, das Nutzer kennen sollten. Interne `live-config` Zustandsdateien sind Implementierungsdetails und ersetzen dies nicht.

## Generierte Konfiguration

Ein aktuelles MiniOS Abbild erzeugt eine `config.conf` mit folgender Grundstruktur:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Die genauen Werte hängen vom Abbild und der Build-Konfiguration ab.

::: warning `LIVE_CONFIG_CMDLINE` ist nicht die initramfs-Kommandozeile
`LIVE_CONFIG_CMDLINE` übergibt Optionen an **live-config**, nachdem das MiniOS Root-Dateisystem eingebunden wurde. Parameter wie `from=`, `load=`, `toram` und `perchdir=` müssen echte Kernel-Boot-Parameter sein; wenn sie nur in `LIVE_CONFIG_CMDLINE` stehen, ist es zu spät, um das initramfs zu beeinflussen.
:::

## Standardparameter

| Parameter | Rekonfigurierbar | Bedeutung |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Ja | Zusätzliche live-config-Optionen. Die tatsächliche Kernel-Kommandozeile wird später angehängt und überschreibt doppelte Optionen. |
| `LIVE_HOSTNAME` | Ja | System-Hostname. |
| `LIVE_USERNAME` | Nur beim ersten Start | Name des Live-Benutzers, der während der Ersteinrichtung erstellt wird. |
| `LIVE_USER_FULLNAME` | Nur beim ersten Start | Vollständiger Name des Live-Benutzers. |
| `LIVE_USER_DEFAULT_GROUPS` | Nur beim ersten Start | Zusätzliche Gruppen, die beim Erstellen des Live-Benutzers zugewiesen werden. |
| `LIVE_USER_PASSWORD_CRYPTED` | Nur beim ersten Start | Kryptografischer Hash für das Live-Benutzer-Passwort. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Nur beim ersten Start | Kryptografischer Hash für das Root-Passwort. |
| `LIVE_CONFIG_NOROOT` | Nur beim ersten Start | Wenn aktiviert, unterdrückt die Einrichtung von MiniOS Root-Passwort, sudo und PolicyKit-Berechtigungen. |
| `LIVE_LOCALES` | Ja | Eine oder mehrere System-Sprachumgebungen (Locales). |
| `LIVE_TIMEZONE` | Ja | Systemzeitzone, zum Beispiel `Europe/Berlin` oder `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Ja | XKB-Tastaturmodell. |
| `LIVE_KEYBOARD_LAYOUTS` | Ja | Kommagetrennte Tastatur-Layouts. |
| `LIVE_KEYBOARD_OPTIONS` | Ja | XKB-Tastaturoptionen. |
| `LIVE_KEYBOARD_VARIANTS` | Ja | Kommagetrennte Varianten, passend zu den konfigurierten Layouts. |
| `LIVE_CONFIG_DEBUG` | Ja | Aktiviert die live-config-Debug-Ausgabe, wenn auf `true` gesetzt. |
| `LIVE_LINK_USER_DIRS` | Ja | Verlinkt verwaltete Benutzerverzeichnisse mit dem konfigurierten Speicherort auf beschreibbaren MiniOS Medien. |
| `LIVE_BIND_USER_DIRS` | Ja | Bindet verwaltete Benutzerverzeichnisse vom konfigurierten Speicherort auf beschreibbaren MiniOS Medien ein. |
| `LIVE_USER_DIRS_PATH` | Ja | Speicherort, der vom Link-/Bind-Benutzerverzeichnis-Modus verwendet wird. |
| `LIVE_MODULE_MODE` | Ja | Wählt die Integration des `simple` oder `merged` live-config-Moduls. |
| `DEFAULT_TARGET` | Ja | Boot-Ziel: `graphical.target`, `multi-user.target` oder `rescue.target`. |
| `ENABLE_SERVICES` | Ja | Kommagetrennte Dienste, die beim Booten über `minios-svc` aktiviert werden. |
| `DISABLE_SERVICES` | Ja | Kommagetrennte Dienste, die beim Booten über `minios-svc` deaktiviert werden. |
| `EXPORT_LOGS` | Ja | Wenn `true`, werden MiniOS und die live-config-Startprotokolle auf beschreibbare MiniOS Medien exportiert. |

Die generierte Datei ist keine vollständige Liste aller von `minios-live-config` unterstützten Optionen. Zusätzliche Variablen für die Vorkonfiguration von kabelgebundenem Netzwerk, Sicherheitsrichtlinien, Hooks, Preseeding, Xorg und anderen Komponenten können manuell ergänzt werden. Siehe [live-config](/reference/configuration/live-config) für die vollständige Referenz.

## Vorkonfiguration für kabelgebundene Netzwerke

MiniOS kann eine **IPv4-Richtlinie für Kabelnetzwerke** über die live-config-Komponente `network` vorkonfigurieren. Dies ist für die administrative Vorkonfiguration eines Systems vor dem Start auf der Zielhardware gedacht.
Zum Beispiel:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Diese Einstellungen gelten **nur beim ersten Start** für die persistente Netzwerkrichtlinie. Nach erfolgreicher Anwendung zeichnet die Komponente `/var/lib/live/config/network` auf.
Eine Änderung der Werte überschreibt eine bereits konfigurierte persistente Sitzung nicht, es sei denn, dieser Zustand wird gezielt zurückgesetzt.

`LIVE_NETWORK_METHOD=static` schreibt eine statische Richtlinie. `off` deaktiviert automatisches IPv4 für das gewählte Interface. Ein nicht gesetzter Wert oder `dhcp` belässt die bestehende Netzwerkkonfiguration des Abbilds unverändert. `LIVE_NETWORK_BACKEND=auto` bevorzugt NetworkManager und verwendet ifupdown als Fallback.

Mit dieser Funktion wird kein WLAN konfiguriert. Nach dem Booten werden kabelgebundene und drahtlose Netzwerke wie gewohnt vom NetworkManager verwaltet. Siehe [Networking](/using-minios/Networking) für die Netzwerknutzung zur Laufzeit und [live-config](/reference/configuration/live-config) für alle Netzwerkvariablen.

## MiniOS Early-Userspace-Einstellungen

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES` und `EXPORT_LOGS` sind MiniOS Einstellungen und keine live-config-Variablen. Sie werden von `minios-boot` gelesen, bevor das normale Init-System übernimmt, und sind alle **Rekonfigurierbar: Ja**.

Die entsprechenden Boot-Parameter `default-target=`, `enable-services=` und `disable-services=` haben für den aktuellen Start Vorrang. Der Parameter `text` erzwingt `multi-user.target`.

Aktuelle Toolbox- und Ultra-Builds fügen `ssh` zu `ENABLE_SERVICES` hinzu. Um SSH explizit zu deaktivieren, tragen Sie es in `DISABLE_SERVICES` ein; das bloße Entfernen aus `ENABLE_SERVICES` fordert keine Deaktivierung an.

Mit `EXPORT_LOGS="true"` werden die Startprotokolle auf beschreibbare MiniOS Medien geschrieben:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Die entsprechenden Laufzeitprotokolle sind `/var/log/minios/minios-boot.log` und `/var/log/live/config.log`.

## Quelle, Laufzeitkopie und Priorität

Das ausgewählte MiniOS Datenverzeichnis enthält normalerweise diese Quelldateien:

| Ausgewähltes Datenverzeichnis | Laufendes System |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Auf normal eingebundenen Medien sind sie als `minios/config.conf` und `minios/config.conf.d/*.conf` sichtbar, häufig unterhalb von `/run/initramfs/memory/data/`, solange das System läuft.

Die Synchronisierung erfolgt beim Booten; es handelt sich nicht um eine Dateibeobachtung:

- Die neuere Kopie von `config.conf` gewinnt anhand des Änderungsdatums. Eine neuere Kopie auf dem Medium wird ins Live-Root kopiert. Eine neuere Laufzeitkopie wird nur zurückkopiert, wenn das ausgewählte MiniOS Datenverzeichnis beschreibbar ist.
- Jede `config.conf.d/*.conf` Datei wird unabhängig anhand des Dateinamens und derselben Zeitstempel-/Schreibbarkeitsregeln synchronisiert. Dateien werden auf keiner Seite gelöscht.
- Wenn die Uhrzeit früher ist als die aufgezeichnete letzte Synchronisationszeit, wird der Zeitstempelvergleich übersprungen und nur fehlende Zieldateien werden ergänzt.
- `toram=trim` kopiert `config.conf`, lässt aber `config.conf.d/` aus. Ein vollständiges `toram` kopiert den gesamten Datenbaum, aber die Synchronisierung zielt dann auf die RAM Kopie statt auf das abgetrennte Quellmedium.
Nach der Synchronisierung liest `live-config` zuerst `/etc/live/config.conf` und dann `/etc/live/config.conf.d/*.conf` in Shell-Glob-Reihenfolge. Ein späteres Fragment kann daher einen Wert aus der Hauptdatei oder einem früheren Fragment überschreiben.

Die tatsächliche Kernel-Kommandozeile wird an `LIVE_CONFIG_CMDLINE` angehängt. Bei einer Option, die mehrfach vorkommt, gewinnt das spätere Vorkommen auf der Kernel-Kommandozeile. `minios-boot` gibt seinen erkannten Kernel-Parametern ebenfalls Vorrang vor den entsprechenden Einstellungen aus `/etc/live/config.conf`.

Sie können projektspezifische Shell-Variablen zu `config.conf` oder dessen Fragmenten hinzufügen und sie aus den Laufzeitkopien auslesen. Werte als Shell-Strings quotieren und keine Leerzeichen um `=` setzen.

## Verwandte Referenzen

- [Boot-Parameter](/reference/Boot-Parameters) — Parameter, die auf die tatsächliche Kernel-Kommandozeile und live-config-Überschreibungen gesetzt werden müssen.
- [live-config](/reference/configuration/live-config) — vollständige Referenz zu Parametern, Variablen, Komponenten und Zuständen im Late-Userspace.
- [Boot-Modi](/using-minios/Boot-Modes) — wie Persistenz und `toram` die Konfigurationsspeicherung beeinflussen.
