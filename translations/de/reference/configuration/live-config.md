---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**live-config** – Systemkonfigurations-Komponenten

**live-config** enthält die Komponenten, die ein Live-System während des Bootvorgangs (spätes Userspace) konfigurieren.

Die Richtlinie für persistenten Sitzungs-Cache und Protokollierung wird bereits zuvor durch `minios-boot` festgelegt, nachdem das Live-Root und dessen Konfiguration vorbereitet wurden, aber bevor die regulären Dienste starten. Die `browser-cache` live-config-Komponente richtet die benutzerspezifischen Mounts nach der Benutzererstellung ein. Diese Richtlinien erfordern eine funktionierende, dauerhafte `perch` Sitzung und ein aktuelles initrd mit `perch-storage-v1`; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Auswirkungen und Grenzen.

Netzwerk-Boot im initramfs (`ip=`, PXE, `from=http://…`) ist eine separate LiveKit-Schicht und wird **nicht** von live-config verwaltet. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

**live-config** kann über Boot-Parameter oder Laufzeit-Konfigurationsdateien, die vom initramfs vorbereitet werden, konfiguriert werden. Die tatsächliche Kernel-Befehlszeile wird nach den dateibasierten `LIVE_CONFIG_CMDLINE` Werten angehängt, sodass spätere übereinstimmende Boot-Parameter Vorrang haben. Komponenten, die ihren Status unter `/var/lib/live/config` speichern, werden normalerweise nur einmal ausgeführt; synchronisierende und zustandslose Komponenten können bei jedem Aufruf laufen.

Wenn *live-build*(7) zum Erstellen des Live-Systems verwendet wird, können die standardmäßig genutzten live-config-Parameter über die `--bootappend-live` Option gesetzt werden, siehe *lb_config*(1) Handbuchseite.

## Boot-Parameter (Komponenten)

**live-config** wird nur aktiviert, wenn `boot=live` als Boot-Parameter verwendet wird. Standardmäßig werden alle Komponenten ausgeführt. Der `live-config.components` Parameter kann einschränken, welche Komponenten ausgeführt werden, und `live-config.nocomponents` kann Komponenten ausschließen. Wenn beide Parameter verwendet werden oder einer von beiden mehrfach angegeben ist, hat das letzte Vorkommen Vorrang.

- **live-config.components | components**: Alle Komponenten werden ausgeführt. Dies ist die Standardeinstellung für Live-Images.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Es werden nur die angegebenen Komponenten ausgeführt. Die Ausführung erfolgt in der Reihenfolge, die durch die Dateinamen unter `/usr/lib/live/config`, unabhängig von der Reihenfolge in dieser Liste, festgelegt ist.
- **live-config.nocomponents | nocomponents**: Es wird keine Komponente ausgeführt.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Alle Komponenten werden ausgeführt, außer den angegebenen.

## Boot-Parameter (Optionen)

Einige einzelne Komponenten können ihr Verhalten durch einen Boot-Parameter ändern.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Ruft ein oder mehrere debconf-Preseed-Dateien ab und wendet sie an. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden. Das Schlüsselwort `filesystem` erweitert Dateien in `/usr/lib/live/config-preseed/`; `medium` erweitert Dateien in `minios/config-preseed/` auf dem erkannten Live-Medium. Explizite lokale Dateien können Pfade wie `file:///run/initramfs/memory/data/minios/config-preseed/FILE` oder `file:///PATH` im Live-Root nutzen. Durch Pipe getrennte Einträge werden in der angegebenen Reihenfolge verarbeitet; durch ein Schlüsselwort erweiterte Dateien folgen der Shell-Glob-Reihenfolge.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Ermöglicht das Setzen des System-Hostnamens. Standard ist `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Wählt die Richtlinie für kabelgebundene Netzwerke. Nicht gesetzt und `dhcp` belassen das Image-Standardverhalten. `static` schreibt die Konfiguration für das gewählte Backend; `off` deaktiviert die automatische IPv4-Konfiguration für das gewählte Interface.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Wählt das kabelgebundene Interface. Wird es für `static` oder `off`, nicht angegeben, wird automatisch das einzige kabelgebundene Nicht-Loopback-Interface ausgewählt; bei keinem oder mehreren Kandidaten ist ein expliziter Wert erforderlich.
- **live-config.network-address=IPV4 | network-address=IPV4**: Setzt die statische IPv4-Adresse.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Setzt die IPv4-Präfixlänge von 0 bis 32. Standard für statisch ist `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Setzt das optionale IPv4-Gateway.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Setzt optionale, durch Kommas getrennte DNS-Server-Adressen.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Wählt das Netzwerk-Backend. `auto` bevorzugt NetworkManager und fällt auf ifupdown zurück. Erzwungenes `ifupdown` markiert das Interface als nicht verwaltet durch NetworkManager, wenn beide Stacks installiert sind.
- **live-config.username=USERNAME | username=USERNAME**: Ermöglicht das Setzen des Benutzernamens, der für den Autologin erstellt wird. Standard ist `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Legt die zusätzlichen Gruppen für den Benutzer fest, der für den Autologin erstellt wird. Gruppennamen können durch Kommas oder Leerzeichen getrennt werden. Die MiniOS-Voreinstellung ist `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Ermöglicht das Setzen des vollständigen Namens des Benutzers, der für den Autologin erstellt wird. Die MiniOS-Voreinstellung ist `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Ermöglicht das Setzen des Root-Passworts im Klartext.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Ermöglicht das Setzen des Root-Passworts in verschlüsselter Form.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Ermöglicht das Setzen des Benutzerpassworts im Klartext.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Ermöglicht das Setzen des Benutzerpassworts in verschlüsselter Form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Ermöglicht das Setzen der System-Locale, z. B. `de_CH.UTF-8`. Standard ist `en_US.UTF-8`. Falls die gewählte Locale noch nicht auf dem System verfügbar ist, wird sie automatisch generiert.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Ermöglicht das Setzen der System-Zeitzone, z. B. `Europe/Zurich`. Standard ist `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Ermöglicht das Ändern des Tastaturmodells. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Ermöglicht das Ändern der Tastaturbelegungen. Bei Angabe mehrerer Layouts kann im Desktop-Umfeld unter X11 zwischen ihnen gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Ermöglicht das Ändern der Tastatur-Varianten. Bei mehreren Varianten sollte die gleiche Anzahl wie bei den Layouts angegeben werden, da sie eins zu eins zugeordnet werden. Leere Werte sind erlaubt. Die Desktop-Tools erlauben den Wechsel zwischen den Layout-/Variant-Paaren unter X11. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Ermöglicht das Ändern der Tastaturoptionen. Es ist kein Standardwert gesetzt.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Ermöglicht das Deaktivieren von sysv-Diensten über update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Ermöglicht das Festlegen, ob das System davon ausgeht, dass die Hardware-Uhr auf UTC steht. Standard ist `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Ermöglicht das Setzen des x-session-managers über update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Ermöglicht das Setzen des xorg-Treibers anstelle der automatischen Erkennung. Wird eine PCI-ID in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` innerhalb des Live-Systems angegeben, wird für diese Geräte der *TREIBER* erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Ermöglicht das Setzen der xorg-Auflösung anstelle der automatischen Erkennung, z. B. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Ermöglicht das Setzen des WLAN-Treibers anstelle der automatischen Erkennung. Wird eine PCI-ID in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` innerhalb des Live-Systems angegeben, wird für diese Geräte der *TREIBER* erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Ermöglicht die Angabe des Modus für die Live-Konfiguration. Bei Einstellung auf `merged`, werden Benutzerkonten aktualisiert, Caches neu aufgebaut und Paketkonfigurationen so aktualisiert, dass Änderungen dynamisch ins laufende System übernommen werden.
- **live-config.link-user-dirs | link-user-dirs**: Verlinkt die verwalteten Benutzerverzeichnisse mit dem konfigurierten Pfad auf dem MiniOS-Datenträger. Dies ist nicht mit Bind-Modus kombinierbar und nicht verfügbar bei `toram`-Modus oder wenn die aktive Persistenz-Sitzung LUKS-verschlüsselt ist.
- **live-config.bind-user-dirs | bind-user-dirs**: Bindet die verwalteten Benutzerverzeichnisse vom konfigurierten Pfad auf dem MiniOS-Datenträger ein. Dies ist nicht mit Link-Modus kombinierbar und unterliegt denselben `toram`- und Verschlüsselungsbeschränkungen.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Legt den medienrelativen Pfad fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard ist `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Ruft beliebige Dateien ab und führt sie von einer temporären Datei im laufenden Live-System aus. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden; erforderliche Interpreter und andere Abhängigkeiten müssen bereits installiert sein. Das Schlüsselwort `filesystem` erweitert Dateien in `/usr/lib/live/config-hooks/`; `medium` erweitert Dateien in `minios/config-hooks/` auf dem erkannten Live-Medium (mit ISO-Pfad-Fallback in der Hook-Komponente). Explizite lokale Dateien können `file:///run/initramfs/memory/data/minios/config-hooks/FILE` oder `file:///PATH` im Live-Root nutzen. Pipe-getrennte Einträge werden in der angegebenen Reihenfolge ausgeführt; durch ein Schlüsselwort erweiterte Dateien folgen der Shell-Glob-Reihenfolge. Beispiele sind installiert unter `/usr/share/doc/live-config/examples/hooks/`.

> **Sicherheitswarnung:** `live-config` wird als root ausgeführt. Hooks werden ausführbar gemacht und als root ausgeführt, und Preseeds verändern die System-debconf-Datenbank mit Root-Rechten. Einfaches HTTP und FTP authentifizieren die heruntergeladenen Inhalte nicht und bieten keinen Integritätsschutz. Verwenden Sie bevorzugt geprüfte lokale Dateien oder vertrauenswürdigen, authentifizierten Transport mit unabhängiger Integritätsprüfung; verwenden Sie keine Remote-Hooks oder Preseeds aus unsicheren Netzwerken.

### MiniOS frühe Speicheroptionen

Diese Optionen werden von `minios-boot` gelesen, bevor die regulären Dienste starten. Sie erfordern eine funktionierende, dauerhafte `perch` Sitzung und aktivieren diese nicht eigenständig.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` legt das systemd-Journal und die regulären `/var/log`-Dateien in einer begrenzten RAM ab; Boot-Diagnosen verbleiben auf dauerhaftem Speicher. Standard: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` speichert heruntergeladene APT-Archive in einem begrenzten tmpfs, wenn RAM und Swap-Bedingungen dies erlauben. Paketdatenbanken und Repository-Listen bleiben persistent. Standard: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` fordert native Browser-Caches in RAM an. Die `browser-cache`-Komponente mountet die ausgewählten Cache-Verzeichnisse des Live-Benutzers nach dessen Erstellung. Standard: `persistent`.

## Boot-Parameter (Kurzbefehle)

Für einige häufige Anwendungsfälle, bei denen mehrere Einzelparameter kombiniert werden müssten, bietet **live-config** Kurzbefehle. Damit bleibt die volle Kontrolle über alle Optionen erhalten und die Bedienung wird dennoch vereinfacht.

- **live-config.noroot | noroot**: Deaktiviert die Root-Passwort-Einrichtung sowie die MiniOS Sudo- und PolicyKit-Privilegien.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Steuert die Sudo-Konfiguration für den Live-Benutzer. Die Voreinstellung und das bisherige MiniOS Verhalten, wenn nicht gesetzt, ist `passwordless`. Der `password` Modus behält Sudo-Zugriff, verlangt aber das Passwort des Live-Benutzers. Der `disabled` Modus entfernt die MiniOS Sudo-Berechtigung und nimmt den Live-Benutzer bei der Erstellung nicht in die Sudo-Gruppe auf. Der ältere `noroot` Kurzbefehl überschreibt dies und deaktiviert die Root-Privilegien umfassender.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Steuert die MiniOS PolicyKit-Komfortregeln. Die Voreinstellung und das bisherige MiniOS Verhalten, wenn nicht gesetzt, ist `passwordless`. Die `password` und `disabled` Modi entfernen diese Regel, sodass die normale PolicyKit-Authentifizierung der Distribution greift. `disabled` ist keine strikte Ablehnung aller Rechte; verwenden Sie `noroot` wenn der Live-Benutzer keine administrativen Rechte erhalten darf.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Schreibt eine OpenSSH-`PermitRootLogin`-Richtlinie, falls explizit gesetzt und openssh-server installiert ist.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Schreibt eine OpenSSH-`PasswordAuthentication`-Richtlinie, falls explizit gesetzt und openssh-server installiert ist.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Steuert das XRDP-Verhalten, wenn xrdp installiert ist. `relaxed` bewahrt die bisherigen MiniOS-Standards. `hardened` bindet XRDP an localhost, stellt hohe Sicherheitsoptionen wieder her und deaktiviert den XRDP-Root-Login. `disabled` deaktiviert und stoppt XRDP über `minios-svc` sofern verfügbar.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Steuert die MiniOS X11-Komforteinstellungen. `relaxed` bewahrt die bisherige Kompatibilität. `hardened` entfernt die großzügige `-ac` X-Server-Option und verschärft `Xwrapper.config` falls vorhanden.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Steuert, ob `/etc/issue` die Standard-MiniOS Root/Live-Passworthinweise anzeigt.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Steuert, ob live-config die Bildschirmsperre lockert. `relaxed` bewahrt die bisherige Live-Session-Bequemlichkeit. `hardened` verhindert das Deaktivieren der GNOME-Sperre und aktiviert xscreensaver-Sperre, falls vorhanden.
- **live-config.noautologin | noautologin**: Verhindert, dass live-config Konsolen- und grafischen Autologin einrichtet. Bereits in einer persistenten Sitzung konfigurierter Autologin wird nicht entfernt.
- **live-config.nottyautologin | nottyautologin**: Verhindert, dass live-config Konsolen-Autologin einrichtet, ohne die grafische Einrichtung zu beeinflussen. Bestehende persistente Konfiguration wird nicht entfernt.
- **live-config.nox11autologin | nox11autologin**: Verhindert, dass live-config Display-Manager-Autologin einrichtet, ohne die TTY-Einrichtung zu beeinflussen. Bestehende persistente Konfiguration wird nicht entfernt.

## Boot-Parameter (Sonderoptionen)

Für spezielle Anwendungsfälle gibt es einige besondere Boot-Parameter.

- **live-config.debug | debug**: Aktiviert die Debug-Ausgabe in live-config.

## Konfigurationsdateien

**live-config** kann über Konfigurationsdateien konfiguriert (aber nicht aktiviert) werden. Jeder unterstützte Boot-Parameter kann in `LIVE_CONFIG_CMDLINE` eingetragen werden, und die meisten Optionen können alternativ über einzelne Variablen gesetzt werden. Der `boot=live` Parameter ist weiterhin erforderlich, um **live-config** zu aktivieren.

**Hinweis:** Wenn Konfigurationsdateien verwendet werden, sollten vorzugsweise alle Boot-Parameter in die **LIVE_CONFIG_CMDLINE** Variable eingetragen werden, oder einzelne Variablen können gesetzt werden. Bei Nutzung einzelner Variablen muss der Benutzer sicherstellen, dass alle erforderlichen Variablen gesetzt sind, um eine gültige Konfiguration zu erzeugen.

`live-config` selbst liest `/etc/live/config.conf` und dann `/etc/live/config.conf.d/*.conf` in Shell-Glob-Reihenfolge ein. Spätere Fragmente können daher Werte aus der Hauptdatei oder früheren Fragmenten überschreiben. Es wird keine zweite Medien-Konfigurationsschicht separat eingelesen.

Auf MiniOS-Medien sind die Quelldateien `minios/config.conf` und `minios/config.conf.d/*.conf`. Bevor `live-config` startet, synchronisiert das MiniOS-initramfs diese mit den `/etc/live/` Laufzeitdateien anhand des Änderungsdatums. Eine neuere Quelldatei ersetzt ihr Laufzeit-Gegenstück; eine neuere Laufzeitdatei wird nur zurückkopiert, wenn das gewählte MiniOS-Datenverzeichnis beschreibbar ist. Bei gleichen Zeitstempeln erfolgt keine Kopie, fehlende Dateien werden ergänzt, und Dateien werden nicht gelöscht. Dies ist eine Synchronisation beim Booten, keine kontinuierliche Überwachung. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die vollständigen Synchronisations- und Prioritätsregeln zwischen Konfigurationsdatei und Kommandozeile.

Als Fallback für initramfs-Implementierungen, die die Laufzeitdatei nicht vorbereitet haben, kopieren die systemd- und SysV-Startskripte `minios/config.conf` nur vom erkannten Medium, wenn `/etc/live/config.conf` fehlt. Dieser Fallback kopiert keine `config.conf.d` Fragmente. Das aktuelle Standard-MiniOS-LiveKit-initramfs führt stattdessen die frühere Synchronisation durch.

Fragmentdateien müssen auf `*.conf` enden. Namen wie `vendor.conf` oder `project.conf` werden empfohlen; wählen Sie die Namen bewusst, da spätere Fragmente frühere überschreiben.

Der eigentliche Inhalt der Konfigurationsdateien besteht aus einer oder mehreren der folgenden Variablen.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Diese Variable entspricht der Bootloader-Kommandozeile.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` Parameter.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` Parameter.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` Parameter.
- **LIVE_HOSTNAME=HOSTNAME**: Diese Variable entspricht dem `**live-config.hostname**=*HOSTNAME*` Parameter. Standard ist `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Wählt die Richtlinie für kabelgebundene Netzwerke. `dhcp` und ein nicht gesetzter Wert bewirken nichts und entfernen kein zuvor erstelltes MiniOS-statisches Profil.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Wählt das kabelgebundene Interface für `static` oder `off`-Richtlinie.
- **LIVE_NETWORK_ADDRESS=IPV4**: Setzt die statische IPv4-Adresse.
- **LIVE_NETWORK_PREFIX=PREFIX**: Setzt die statische Präfixlänge; Standard ist `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Setzt das optionale statische Gateway.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Setzt optionale, durch Kommas getrennte DNS-Server.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Wählt das implementierte Backend.

Die Netzwerk-Komponente schreibt `/var/lib/live/config/network` nach erfolgreicher Richtlinienerstellung. Entfernen Sie diesen Stempel, um geänderte Richtlinien auf einem persistenten System anzuwenden. Um ein vorheriges statisches Profil zu entfernen, verwenden Sie `network-method=off` oder entfernen Sie das von MiniOS verwaltete Profil und den Stempel manuell.

- **LIVE_USERNAME=USERNAME**: Diese Variable entspricht dem `**live-config.username**=*USERNAME*` Parameter. Standard ist `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Diese Variable entspricht dem `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` Parameter.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Diese Variable entspricht dem `**live-config.user-fullname**="*USER FULLNAME*"` Parameter.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password**=*PASSWORD*` Parameter. Sie gibt das Root-Passwort im Klartext an.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password-crypted**=*PASSWORD*` Parameter. Sie gibt das Root-Passwort in verschlüsselter Form an.
- **LIVE_USER_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password**=*PASSWORD*` Parameter. Sie gibt das Benutzerpasswort im Klartext an.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password-crypted**=*PASSWORD*` Parameter. Sie gibt das Benutzerpasswort in verschlüsselter Form an.
- **LIVE_CONFIG_NOROOT=true|false**: Diese Variable entspricht dem `**live-config.noroot**` Parameter und deaktiviert Root-, Sudo- und PolicyKit-Privilegien, wenn auf `true` gesetzt.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Diese Variable entspricht dem `**live-config.sudo-mode**=...` Parameter. Wenn nicht gesetzt, behält MiniOS das bisherige passwortlose Sudo-Verhalten.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Diese Variable entspricht dem `**live-config.polkit-mode**=...` Parameter. `password` und `disabled` entfernen die MiniOS-Regel für passwortlos und stellen die normale PolicyKit-Authentifizierung der Distribution wieder her.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Diese Variable entspricht dem `**live-config.ssh-permit-root-login**=...` Parameter.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Diese Variable entspricht dem `**live-config.ssh-password-authentication**=...` Parameter.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Diese Variable entspricht dem `**live-config.xrdp-mode**=...` Parameter.
- **LIVE_X11_MODE=relaxed|hardened**: Diese Variable entspricht dem `**live-config.x11-mode**=...` Parameter.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Diese Variable entspricht dem `**live-config.issue-password-hints**=...` Parameter.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Diese Variable entspricht dem `**live-config.lockscreen-mode**=...` Parameter.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Diese Variable entspricht dem `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` Parameter.
- **LIVE_TIMEZONE=TIMEZONE**: Diese Variable entspricht dem `**live-config.timezone**=*TIMEZONE*` Parameter.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Diese Variable entspricht dem `**live-config.keyboard-model**=*KEYBOARD_MODEL*` Parameter.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Diese Variable entspricht dem `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` Parameter.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Diese Variable entspricht dem `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` Parameter.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Diese Variable entspricht dem `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` Parameter.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Diese Variable entspricht dem `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` Parameter.
- **LIVE_UTC=yes|no**: Diese Variable entspricht dem `**live-config.utc**=**yes**|no` Parameter.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Diese Variable entspricht dem `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*` Parameter.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Diese Variable entspricht dem `**live-config.xorg-driver**=*XORG_DRIVER*` Parameter.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Diese Variable entspricht dem `**live-config.xorg-resolution**=*XORG_RESOLUTION*` Parameter.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Diese Variable entspricht dem `**live-config.wlan-driver**=*WLAN_DRIVER*` Parameter.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` Parameter.
- **LIVE_LINK_USER_DIRS=true|false**: Aktiviert oder deaktiviert Links von den Standarddatenverzeichnissen des Benutzers zum beschreibbaren MiniOS-Laufwerk. Der zugehörige Boot-Parameter ist das einfache `live-config.link-user-dirs`-Flag. Link-Modus kann nicht mit Bind-Modus oder einem `toram`-Modus kombiniert werden.
- **LIVE_BIND_USER_DIRS=true|false**: Aktiviert oder deaktiviert Bind-Mounts der Standarddatenverzeichnisse des Benutzers vom beschreibbaren MiniOS-Laufwerk. Der zugehörige Boot-Parameter ist das einfache `live-config.bind-user-dirs`-Flag. Bind-Modus kann nicht mit Link-Modus oder einem `toram`-Modus kombiniert werden.
- **LIVE_USER_DIRS_PATH=PATH**: Diese Variable entspricht dem `**live-config.user-dirs-path**=*PATH*` Parameter. Sie gibt einen sicheren Pfad innerhalb des FAT32-, exFAT- oder NTFS-MiniOS-Laufwerks an. Standard ist `/minios/userdata`; Punkt- und Parent-Verzeichnisse werden abgelehnt.

Die Benutzer-Medien-Einrichtung führt niemals automatisch zwei nicht-leere Verzeichnisse zusammen. Ein lokales, nicht-leeres Verzeichnis wird nur migriert, wenn das Medienziel leer ist. Wird die Funktion deaktiviert, werden verwaltete Mediendaten vor dem Entfernen der Links zurückkopiert. Die Benutzer-Medien-Aktivierung und das Zurückkopieren sind blockiert, solange die aktive Persistenz-Sitzung LUKS-verschlüsselt ist, um zu verhindern, dass Sitzungsdaten auf unverschlüsselte MiniOS-Medien verschoben werden. Die Entscheidung basiert auf dem tatsächlichen aktiven Verschlüsselungsstatus: `perchencrypt=luks` fordert die Verschlüsselung nur bei der Erstellung einer neuen Sitzung an und beschreibt keine bestehende Sitzung. Ein fehlgeschlagener Abgleich oder Kopiervorgang belässt die bestehenden Benutzerverzeichnisse und protokolliert den Grund in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Diese Variable hält den Zustand, der durch den `live-config.module-mode` (oder `module-mode`)-Parameter festgelegt wurde. Wenn sie auf `merged` gesetzt ist, übernimmt das Live-System Aktualisierungen (über minios-update-users, minios-update-cache und minios-update-dpkg), um benutzerdefinierte Konfigurationen mit der Basisumgebung zu verschmelzen.
- **LIVE_CONFIG_DEBUG=true|false**: Diese Variable entspricht dem `**live-config.debug**` Parameter.

## MiniOS Cache- und Log-Variablen

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, und **LIVE_BROWSER_CACHE=persistent|volatile**: Unabhängige MiniOS Boot-Zeit-Richtlinien. Sie funktionieren auch in `config.conf.d` und `LIVE_CONFIG_CMDLINE`. Sie aktivieren die Persistenz nicht eigenständig. Siehe [Konfigurationsdatei](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Die `browser-cache`-Komponente liest die dauerhafte `minios-boot`-Richtlinie, nachdem der Live-Benutzer existiert, und bindet Standardverzeichnisse für native Browser-Caches in ein gemeinsames, begrenztes RAM-Dateisystem ein. Eine separat eingerichtete Firefox-Richtlinie deaktiviert dessen Festplatten-Cache, ohne Browser-Profile zu verschieben. Wird diese Komponente durch `components=` oder `nocomponents=` ausgeschlossen, richtet die frühe browser-cache-Anforderung allein die benutzerspezifischen Mounts nicht ein.

Helfer im Merged-Modus behalten normale Fehler bei, erzeugen aber detaillierte Befehlsprotokolle und Debug-Kopien nur, wenn `LIVE_CONFIG_DEBUG=true` gesetzt ist.

# ANPASSUNG

**live-config** kann einfach für nachgelagerte Projekte oder lokale Nutzung angepasst werden.

## Hinzufügen neuer Konfigurationskomponenten

Nachgelagerte Projekte können ihre Komponenten in /usr/lib/live/config ablegen und müssen sonst nichts weiter tun; die Komponenten werden beim Booten automatisch ausgeführt.

Die Komponenten werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkomponente befindet sich unter /usr/share/doc/live-config/examples.

## Entfernen vorhandener Konfigurationskomponenten

Es ist derzeit nicht wirklich möglich, Komponenten selbst sinnvoll zu entfernen, ohne entweder ein lokal angepasstes **live-config**-Paket zu liefern oder dpkg-divert zu verwenden. Das gleiche Ziel kann jedoch erreicht werden, indem die jeweiligen Komponenten über den Mechanismus live-config.nocomponents deaktiviert werden (siehe oben). Um zu vermeiden, dass deaktivierte Komponenten immer über den Boot-Parameter angegeben werden müssen, sollte eine Konfigurationsdatei verwendet werden (siehe oben).

Die Konfigurationsdateien für das Live-System selbst werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkonfiguration befindet sich unter /usr/share/doc/live-config/examples.

# KOMPONENTEN

**live-config** bietet derzeit die folgenden Komponenten in /usr/lib/live/config an.

- **nss-systemd**: entfernt oder stellt das systemd-NSS-Modul in /etc/nsswitch.conf wieder her, um ein bekanntes systemd-Problem zu umgehen.
- **debconf**: ermöglicht das Anwenden beliebiger Preseed-Dateien, die auf dem Live-Medium oder einem http/ftp-Server abgelegt sind.
- **hostname**: konfiguriert /etc/hostname und /etc/hosts.
- **issue-setup**: richtet die Datei /etc/issue mit einem Willkommensbanner und Distributionsinformationen ein.
- **live-debconfig_passwd**: konfiguriert Benutzer- und Root-Passwörter über live-debconfig.
- **user-setup**: legt ein Live-Benutzerkonto an.
- **user-groups**: fügt den Live-Benutzer zu zusätzlichen Gruppen hinzu, die von installierten Modulen deklariert werden. Bereits vorhandene Gruppen, die in `/usr/share/live/config/user-default-groups.d/*.groups` aufgeführt sind, werden nach der Benutzererstellung und bei späteren live-config-Läufen angewendet.
- **root-setup**: setzt oder aktualisiert das Root-Passwort und konfiguriert die Root-Umgebung.
- **sudo**: gewährt dem Live-Benutzer Sudo-Rechte.
- **user-ssh-keys**: synchronisiert benutzerspezifische `authorized_keys.<username>`-Dateien zwischen dem Live-Medium und den einzelnen Benutzer-Homeverzeichnissen. Unterstützt mehrere Benutzer gleichzeitig (z. B. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) und erkennt einfache `toram`, `toram=trim` und `toram=full` als RAM-Boot-Formen, um zu entscheiden, ob das Live-Medium sicher aktualisiert werden kann.
- **user-media**: verlinkt oder bindet validierte Benutzerverzeichnisse auf dem vorhandenen, beschreibbaren MiniOS-Datenträger ein, mit sicherer Migration und Rückkopieren bei Deaktivierung.
- **locales**: konfiguriert Locales.
- **tzdata**: konfiguriert /etc/timezone.
- **xorg-service**: konfiguriert den Benutzernamen in xorg.service und setzt X11-Optionen, wenn unterstützt.
- **gdm3**: konfiguriert Autologin in gdm3.
- **sddm**: konfiguriert Autologin in sddm.
- **kdm**: konfiguriert Autologin in kdm.
- **lightdm**: konfiguriert Autologin in lightdm.
- **lxdm**: konfiguriert Autologin in lxdm.
- **nodm**: konfiguriert Autologin in nodm.
- **slim**: konfiguriert Autologin in slim.
- **xinit**: konfiguriert Autologin mit xinit.
- **keyboard-configuration**: konfiguriert die Tastatur.
- **sysvinit**: konfiguriert Konsolen-Autologin über `/etc/inittab` wenn sysvinit installiert ist. Die `noautologin` und `nottyautologin` Kurzbefehle unterdrücken diese Einrichtung.
- **sysv-rc**: konfiguriert sysv-rc durch Deaktivieren der aufgeführten Dienste.
- **apport**: deaktiviert apport.
- **gnome-panel-data**: deaktiviert die Sperrtaste für den Bildschirm.
- **gnome-power-manager**: deaktiviert den Ruhezustand.
- **gnome-screensaver**: steuert die GNOME-Bildschirmsperre gemäß `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: deaktiviert den KDE-Migrationsassistenten (ab Squeeze).
- **kde-services**: deaktiviert einige unerwünschte KDE-Dienste (ab Squeeze).
- **policykit**: gewährt Benutzerrechte über PolicyKit.
- **ssl-cert**: erstellt SSL snake-oil-Zertifikate neu.
- **xrdp**: konfiguriert entspanntes, gehärtetes oder deaktiviertes XRDP-Verhalten, wenn XRDP installiert ist.
- **anacron**: deaktiviert anacron.
- **util-linux**: deaktiviert den util-linux-hwclock-Dienst.
- **login**: deaktiviert lastlog.
- **xserver-xorg**: konfiguriert xserver-xorg.
- **network**: konfiguriert dauerhafte kabelgebundene IPv4-Richtlinien über eine sichere NetworkManager-Keyfile- oder ifupdown-Stanza. Läuft vor den Netzwerkdiensten, prüft alle Werte und stempelt nur nach erfolgreichem Schreiben.
- **openssh-server**: erstellt OpenSSH-Hostschlüssel neu und schreibt explizit angeforderte Root-Login- oder Passwort-Authentifizierungsrichtlinien.
- **xfce4-panel**: konfiguriert xfce4-panel auf Standardeinstellungen.
- **xscreensaver**: steuert die xscreensaver-Sperre gemäß `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: konfiguriert broadcom-sta-WLAN-Treiber.
- **hyperv**: konfiguriert X11-Einstellungen zur Verbesserung der Kompatibilität auf Microsoft Hyper-V-Plattformen.
- **ntfs3**: verwaltet udev-Regeln für NTFS3-Unterstützung.
- **config-module-mode**: konfiguriert den Systemmodulmodus und aktualisiert Caches, Benutzereinstellungen und dpkg.
- **hooks**: ermöglicht das Ausführen beliebiger Befehle aus einer Datei auf dem Live-Medium oder einem http/ftp-Server.

# DATEIEN

- `minios/config.conf` auf dem ausgewählten MiniOS-Datenträger (Quellkopie)
- `minios/config.conf.d/*.conf` auf dem ausgewählten MiniOS-Datenträger (Quellfragmente)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` auf beschreibbaren ausgewählten Datenträgern, wenn der Log-Export aktiviert ist
- `/usr/lib/live/config-hooks/*` (`filesystem` Hooks)
- `minios/config-hooks/*` auf dem erkannten Live-Medium (`medium` Hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` Preseeds)
- `minios/config-preseed/*` auf dem erkannten Live-Medium (`medium` Preseeds)

# SIEHE AUCH

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PROJEKTSEITE

Weitere Informationen zu **minios-live-config** finden Sie im [GitHub-Repository](https://github.com/minios-linux/minios-live-config). Allgemeine MiniOS Informationen gibt es auf [minios.dev](https://minios.dev).

# FEHLER

Fehler können im [minios-live-config Issue Tracker](https://github.com/minios-linux/minios-live-config/issues) gemeldet werden.

# AUTOR

**live-config** wurde ursprünglich von Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)) geschrieben. Seit 2016 wird die Entwicklung vom Debian Live-Team fortgeführt. Seit 2025 wird die Entwicklung der angepassten **minios-live-config**-Version vom MiniOS Live-Team weitergeführt.
