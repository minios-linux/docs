---
updated: 2026-09-26
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

Ein aktuelles MiniOS-Abbild erzeugt eine `config.conf` mit folgender allgemeinen Struktur:
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

::: warning `LIVE_CONFIG_CMDLINE` ist nicht die Initramfs-Kommandozeile
`LIVE_CONFIG_CMDLINE` gibt Optionen an, nachdem das MiniOS-Root eingebunden wurde. Parameter wie `from=`, `load=`, `toram`, und `perchdir=` müssen echte Kernel-Boot-Parameter sein; wenn sie nur in `LIVE_CONFIG_CMDLINE` angegeben werden, ist es zu spät, um das Initramfs zu beeinflussen. Die Speicher-Policy-Optionen `log-storage=`, `apt-cache=`, und `browser-cache=` bilden eine spezielle Ausnahme: `minios-boot` liest sie aus `LIVE_CONFIG_CMDLINE` bevor die normalen Dienste starten.
:::

## Standardparameter

| Parameter | Konfigurierbar | Bedeutung |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Ja | Zusätzliche live-config Optionen. Die tatsächliche Kernel-Befehlszeile wird später angehängt und überschreibt doppelte Optionen. |
| `LIVE_HOSTNAME` | Ja | System-Hostname. |
| `LIVE_USERNAME` | Nur beim ersten Start | Name des Live-Benutzers, der während der Ersteinrichtung erstellt wird. |
| `LIVE_USER_FULLNAME` | Nur beim ersten Start | Vollständiger Name des Live-Benutzers. |
| `LIVE_USER_DEFAULT_GROUPS` | Nur beim ersten Start | Zusätzliche Gruppen, die dem Live-Benutzer bei der Erstellung zugewiesen werden. |
| `LIVE_USER_PASSWORD_CRYPTED` | Nur beim ersten Start | Crypt-Hash für das Passwort des Live-Benutzers. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Nur beim ersten Start | Crypt-Hash für das Root-Passwort. |
| `LIVE_CONFIG_NOROOT` | Nur beim ersten Start | Wenn aktiviert, wird die Einrichtung von MiniOS Root-Passwort, sudo und PolicyKit-Berechtigungen unterdrückt. |
| `LIVE_LOCALES` | Ja | Eine oder mehrere System-Sprachumgebungen (Locales). |
| `LIVE_TIMEZONE` | Ja | System-Zeitzone, zum Beispiel `Europe/Berlin` oder `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Ja | XKB-Tastaturmodell. |
| `LIVE_KEYBOARD_LAYOUTS` | Ja | Kommagetrennte Tastaturlayouts. |
| `LIVE_KEYBOARD_OPTIONS` | Ja | XKB-Tastaturoptionen. |
| `LIVE_KEYBOARD_VARIANTS` | Ja | Kommagetrennte Varianten, die den konfigurierten Layouts zugeordnet sind. |
| `LIVE_CONFIG_DEBUG` | Ja | Aktiviert die Debug-Ausgabe von live-config, wenn auf `true` gesetzt. |
| `LIVE_LINK_USER_DIRS` | Ja | Verknüpft verwaltete Benutzerverzeichnisse mit dem konfigurierten Speicherort auf beschreibbaren MiniOS-Medien. Nicht verfügbar im Bind-Modus, jedem `toram` Modus oder bei einer aktiven LUKS-verschlüsselten Persistenzsitzung. |
| `LIVE_BIND_USER_DIRS` | Ja | Bind-mountet verwaltete Benutzerverzeichnisse vom konfigurierten Speicherort auf beschreibbaren MiniOS-Medien. Nicht verfügbar im Link-Modus, jedem `toram` Modus oder bei aktiver LUKS-verschlüsselter Persistenzsitzung. |
| `LIVE_USER_DIRS_PATH` | Ja | Speicherort, der im Link-/Bind-Benutzerverzeichnis-Modus verwendet wird. |
| `LIVE_MODULE_MODE` | Ja | Wählt `simple` oder `merged` Integration des live-config-Moduls. |
| `LIVE_LOG_STORAGE` | Ja | `persistent` (Standard) oder `volatile` für normale Systemprotokolle. Boot-Diagnosen bleiben persistent; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Ja | `persistent` (Standard) oder `volatile` für heruntergeladene APT-Archive; Paketstatus und Repository-Listen bleiben persistent. |
| `LIVE_BROWSER_CACHE` | Ja | `persistent` (Standard) oder `volatile` für Standardpfade des nativen Browser-Caches. Browser-Profile bleiben persistent. |
| `DEFAULT_TARGET` | Ja | Boot-Ziel: `graphical.target`, `multi-user.target`, oder `rescue.target`. |
| `ENABLE_SERVICES` | Ja | Durch Kommas getrennte Dienste, die beim Booten über `minios-svc`. |
| `DISABLE_SERVICES` | Ja | Durch Kommas getrennte Dienste, die beim Booten über `minios-svc`. |
| `EXPORT_LOGS` | Ja | Wenn `true`, exportiert MiniOS und live-config-Startprotokolle auf beschreibbare MiniOS-Medien. |

Die erzeugte Datei ist keine vollständige Liste aller von `minios-live-config` unterstützten Funktionen. Zusätzliche Variablen für die vorkonfigurierte kabelgebundene Netzwerkeinrichtung, Sicherheitsrichtlinien, Hooks, Preseeding, Xorg und weitere Komponenten können manuell hinzugefügt werden. Siehe [live-config](/reference/configuration/live-config) für die vollständige Referenz.

Die `user-media` Komponente verweigert sowohl die Aktivierung als auch das Zurückkopieren, solange die aktive Persistenzsitzung LUKS-verschlüsselt ist. Es wird der tatsächliche Laufzeit-Verschlüsselungsstatus verwendet: Der `perchencrypt=luks` Kernel-Parameter fordert die Verschlüsselung nur bei der Erstellung einer neuen Sitzung an und beschreibt keine bestehende Sitzung.

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

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, und die drei `LIVE_*` Speicher-Richtlinien oben sind MiniOS Boot-Einstellungen und keine late live-config-Komponentenvariablen. MiniOS wendet sie an, bevor das normale Init-System übernimmt; `minios-boot` verwaltet die drei Speicher-Richtlinien. Sie sind alle **Rekonfigurierbar: Ja**.

Die entsprechenden Boot-Parameter `default-target=`, `enable-services=`, und `disable-services=` haben für den aktuellen Bootvorgang Vorrang. Der `text` Parameter erzwingt `multi-user.target`.

Aktuelle Toolbox- und Ultra-Builds fügen `ssh` zu `ENABLE_SERVICES`. Um SSH explizit zu deaktivieren, tragen Sie es in `DISABLE_SERVICES` ein; das bloße Entfernen aus `ENABLE_SERVICES` bewirkt keine Deaktivierung.

Mit `EXPORT_LOGS="true"`, erhält beschreibbares MiniOS Medium die Startprotokolle unten:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Die entsprechenden Laufzeitprotokolle sind `/var/log/minios/minios-boot.log` und `/var/log/live/config.log`.

## Cache- und Protokollrichtlinie für eine persistente Sitzung

Um Schreibzugriffe während einer `perch` Sitzung zu reduzieren, fügen Sie die Einstellungen unabhängig hinzu:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Sie akzeptieren auch `persistent`, die Voreinstellung. `minios-boot` akzeptiert die gleichen Einstellungen von `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), oder Kernel-Parameter. Spätere Fragmente ersetzen frühere, der Parameter-Blob hat Vorrang vor Dateischlüsseln, und tatsächliche Kernel-Parameter haben letztendlich Priorität. Die drei Optionen sind unabhängig und fordern für sich genommen keine Persistenz an. Ein kompatibles initrd kündigt `perch-storage-v1` bei `/run/initramfs/etc/minios-initramfs-storage` an; MiniOS-Konfigurator warnt, wenn das aktuelle initrd dies nicht meldet.

Die Richtlinien gelten bei einem späteren Start nur, wenn die Persistenz tatsächlich auf einem dauerhaften, beschreibbaren Speicher aktiviert wurde. Mit `toram`, fehlgeschlagener Persistenz oder **Ohne Speichern starten**, wird die angeforderte volatile Richtlinie nicht als Nachweis dafür behandelt, dass etwas gespeichert wird. Die Browser-Cache-Komponente läuft später als `minios-boot`, nachdem der Live-Benutzer erstellt wurde. Siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für die genauen RAM-Grenzwerte, unterstützte Browser-Pfade, Fallback-Bedingungen und Protokolle, die auf dem Medium verbleiben.

## Quelle, Laufzeitkopie und Priorität

Das ausgewählte MiniOS Datenverzeichnis enthält normalerweise diese Quelldateien:

| Ausgewähltes Datenverzeichnis | Laufendes System |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Auf normal eingebundenen Medien sind sie sichtbar als `minios/config.conf` und `minios/config.conf.d/*.conf`, oft unter `/run/initramfs/memory/data/` während das System läuft.

Die Synchronisierung erfolgt beim Systemstart; es handelt sich nicht um eine Dateiüberwachung:

- Die neuere Kopie von `config.conf` gewinnt anhand des Änderungsdatums. Eine neuere Medienkopie wird ins Live-System kopiert. Eine neuere Laufzeitkopie wird nur dann zurückkopiert, wenn das ausgewählte MiniOS Datenverzeichnis beschreibbar ist.
- Jede `config.conf.d/*.conf` Datei wird unabhängig anhand des Dateinamens nach denselben Zeitstempel- und Schreibbarkeitsregeln synchronisiert. Dateien werden auf keiner Seite gelöscht.
- Wenn die Uhrzeit früher ist als die zuletzt aufgezeichnete Synchronisierungszeit, wird der Zeitstempel-Vergleich übersprungen und nur fehlende Zieldateien werden ergänzt.
- `toram=trim` kopiert `config.conf` aber lässt `config.conf.d/` aus. Vollständiges `toram` kopiert den gesamten Datenbaum, aber die Synchronisierung zielt danach auf die RAM Kopie statt auf das getrennte Quellmedium.
Nach der Synchronisierung `live-config` liest `/etc/live/config.conf` zuerst und dann `/etc/live/config.conf.d/*.conf` in der Shell-Glob-Reihenfolge. Ein späteres Fragment kann somit einen Wert aus der Hauptdatei oder einem früheren Fragment überschreiben.

Die tatsächliche Kernel-Befehlszeile wird an `LIVE_CONFIG_CMDLINE` angehängt. Bei einer Option, die mehrfach vorkommt, hat das spätere Vorkommen in der Kernel-Befehlszeile Vorrang. Für die drei Speicherstrategien `minios-boot` liest die synchronisierte Hauptdatei, dann ihre Fragmente, dann den Options-Blob und schließlich die tatsächliche Kernel-Befehlszeile; die letzte Einstellung gewinnt.

Sie können projektspezifische Shell-Variablen zu `config.conf` oder deren Fragmenten hinzufügen und sie aus den Laufzeitkopien auslesen. Werte als Shell-Strings quotieren und keine Leerzeichen um `=` setzen.

## Verwandte Referenz

- [Boot-Parameter](/reference/Boot-Parameters) — Parameter, die direkt auf der Kernel-Befehlszeile und in live-config-Overrides angegeben werden müssen.
- [live-config](/reference/configuration/live-config) — vollständige Referenz zu Parametern, Variablen, Komponenten und Zuständen im späten Userspace.
- [Boot-Modi](/using-minios/Boot-Modes) — wie Persistenz und `toram` die Konfigurationsspeicherung beeinflussen.
