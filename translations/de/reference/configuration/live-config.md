---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Systemkonfigurations-Komponenten

**live-config** enthält die Komponenten, die ein Live-System während des Bootvorgangs (später Userspace) konfigurieren.

Die Richtlinie für persistenten Sitzungs-Cache und Protokollierung wird bereits früher durch `minios-boot` festgelegt, nachdem das Live-Root und dessen Konfiguration vorbereitet wurden, aber bevor die regulären Dienste starten. Die `browser-cache` live-config-Komponente bindet die benutzerspezifischen Mounts nach der Benutzererstellung ein. Diese Richtlinien setzen eine funktionierende, dauerhafte `perch` Sitzung und ein aktuelles initrd voraus, das `perch-storage-v1` bereitstellt; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Auswirkungen und Grenzen.

Netzwerk-Boot im initramfs (`ip=`, PXE, `from=http://…`) ist eine separate LiveKit-Schicht und wird **nicht** von live-config verwaltet. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

**live-config** kann über Boot-Parameter oder die vom initramfs vorbereiteten Laufzeit-Konfigurationsdateien angepasst werden. Die tatsächliche Kernel-Befehlszeile wird nach den dateibasierten `LIVE_CONFIG_CMDLINE` Werten angehängt, sodass später angegebene Boot-Parameter Vorrang haben. Komponenten, die ihren Status unter `/var/lib/live/config` speichern, werden normalerweise nur einmal ausgeführt; Synchronisations- und zustandslose Komponenten können bei jedem Aufruf laufen.

Wenn *live-build*(7) zum Erstellen des Live-Systems verwendet wird, können die standardmäßig genutzten live-config-Parameter über die `--bootappend-live` Option gesetzt werden, siehe *lb_config*(1) Handbuchseite.

## Boot-Parameter (Komponenten)

**live-config** wird nur aktiviert, wenn `boot=live` als Boot-Parameter verwendet wird. Standardmäßig werden alle Komponenten ausgeführt. Mit dem Parameter `live-config.components` kann eingeschränkt werden, welche Komponenten ausgeführt werden, und `live-config.nocomponents` kann Komponenten ausschließen. Werden beide Parameter verwendet oder einer mehrfach angegeben, hat das letzte Vorkommen Vorrang.

- **live-config.components | components**: Alle Komponenten werden ausgeführt. Dies ist die Standardeinstellung für Live-Abbilder.
- **live-config.components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Es werden nur die angegebenen Komponenten ausgeführt. Die Ausführung erfolgt in der Reihenfolge, wie sie durch die Dateinamen unter `/usr/lib/live/config` vorgegeben ist, unabhängig von der Reihenfolge in dieser Liste.
- **live-config.nocomponents | nocomponents**: Es wird keine Komponente ausgeführt.
- **live-config.nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Alle Komponenten werden ausgeführt, außer den angegebenen.

## Boot-Parameter (Optionen)

Einige einzelne Komponenten können ihr Verhalten durch einen Boot-Parameter ändern.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Ruft eine oder mehrere debconf-Preseed-Dateien ab und wendet sie an. URLs werden verarbeitet von `wget` und können HTTP, FTP oder `file://` verwenden. Das Schlüsselwort `filesystem` entpackt Dateien in `/usr/lib/live/config-preseed/`; `medium` entpackt Dateien in `minios/config-preseed/` auf dem erkannten Live-Medium. Explizite lokale Dateien können Pfade wie `file:///run/initramfs/memory/data/minios/config-preseed/FILE` oder `file:///PATH` im Live-Root verwenden. Durch Pipe getrennte Einträge werden in der angegebenen Reihenfolge verarbeitet; durch ein Schlüsselwort entpackte Dateien folgen der Shell-Glob-Reihenfolge.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Ermöglicht das Setzen des System-Hostnamens. Standardmäßig ist `minios` voreingestellt.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Legt die Richtlinie für kabelgebundene Netzwerke fest. Nicht gesetzt und `dhcp` belassen das Standard-Image unverändert. `static` schreibt die Konfiguration für das gewählte Backend; `off` deaktiviert die automatische IPv4-Konfiguration für das gewählte Interface.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Wählt das kabelgebundene Interface aus. Wenn für `static` oder `off` nicht angegeben, wird automatisch das einzige kabelgebundene Nicht-Loopback-Interface gewählt; bei keiner oder mehreren Optionen ist ein expliziter Wert erforderlich.
- **live-config.network-address=IPV4 | network-address=IPV4**: Setzt die statische IPv4-Adresse.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Legt die IPv4-Präfixlänge von 0 bis 32 fest. Der statische Standardwert ist `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Setzt das optionale IPv4-Gateway.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Setzt optionale, komma-getrennte DNS-Server-Adressen.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Wählt das Netzwerk-Backend aus. `auto` bevorzugt NetworkManager und greift andernfalls auf ifupdown zurück. Erzwungenes `ifupdown` markiert das Interface als nicht verwaltet durch NetworkManager, wenn beide Stacks installiert sind.
- **live-config.username=USERNAME | username=USERNAME**: Ermöglicht das Setzen des Benutzernamens, der für die automatische Anmeldung erstellt wird. Standardmäßig ist `live` voreingestellt.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Legt die zusätzlichen Gruppen für den Benutzer fest, der für den Autologin erstellt wird. Gruppennamen können durch Kommas oder Leerzeichen getrennt werden. Der Standardwert ist MiniOS`dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Ermöglicht das Festlegen des vollständigen Namens des Benutzers, der für den Autologin erstellt wird. Der Standardwert ist MiniOS`MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Ermöglicht das Festlegen des Root-Passworts im Klartext.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Ermöglicht das Festlegen des Root-Passworts in verschlüsselter Form.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Ermöglicht das Festlegen des Benutzerpassworts im Klartext.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Ermöglicht das Festlegen des Benutzerpassworts in verschlüsselter Form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Ermöglicht das Festlegen der System-Locale, z. B. `de_CH.UTF-8`. Der Standardwert ist `en_US.UTF-8`. Falls die gewählte Locale noch nicht auf dem System verfügbar ist, wird sie automatisch erstellt.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Ermöglicht das Festlegen der System-Zeitzone, z. B. `Europe/Zurich`. Der Standardwert ist `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Ermöglicht das Ändern des Tastaturmodells. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Ermöglicht das Ändern der Tastaturbelegungen. Wenn mehr als eine angegeben ist, kann in der Desktop-Umgebung unter X11 zwischen ihnen gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Ermöglicht das Ändern der Tastaturvarianten. Wenn mehrere Varianten angegeben werden, sollte die Anzahl der Werte der Anzahl der Tastaturbelegungen entsprechen, da sie jeweils eins zu eins zugeordnet werden. Leere Werte sind erlaubt. In der Desktop-Umgebung kann unter X11 zwischen den jeweiligen Layout- und Variantenpaaren gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Ermöglicht das Ändern der Tastaturoptionen. Es ist kein Standardwert gesetzt.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Ermöglicht das Deaktivieren von sysv-Diensten über update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Ermöglicht die Einstellung, ob das System davon ausgeht, dass die Hardware-Uhr auf UTC gestellt ist oder nicht. Der Standardwert ist `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Ermöglicht das Festlegen des x-session-managers über update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Ermöglicht das Festlegen des Xorg-Treibers anstelle der automatischen Erkennung. Wird eine PCI-ID in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` im Live-System angegeben, wird *DRIVER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override vorhanden sind, hat der Boot-Parameter Vorrang.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Ermöglicht das Festlegen der Xorg-Auflösung anstelle der automatischen Erkennung, z. B. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Ermöglicht das Festlegen des WLAN-Treibers anstelle der automatischen Erkennung. Wenn eine PCI-ID im `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` im Live-System angegeben ist, wird der *DRIVER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override vorhanden sind, hat der Boot-Parameter Vorrang.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Ermöglicht die Angabe des Modus für die Live-Konfiguration. Bei Einstellung auf `merged`, werden Benutzerkonten aktualisiert, Caches neu aufgebaut und Paketkonfigurationen aktualisiert, sodass Änderungen dynamisch ins laufende System integriert werden.
- **live-config.link-user-dirs | link-user-dirs**: Verlinkt die verwalteten Benutzerverzeichnisse mit dem konfigurierten Pfad auf dem MiniOS-Datenträger. Ist nicht mit Bind-Modus kombinierbar und nicht verfügbar bei `toram`-Modus oder wenn die aktive Persistenzsitzung LUKS-verschlüsselt ist.
- **live-config.bind-user-dirs | bind-user-dirs**: Bindet die verwalteten Benutzerverzeichnisse vom konfigurierten Pfad auf dem MiniOS-Datenträger ein. Ist nicht mit Link-Modus kombinierbar und unterliegt denselben `toram` und Einschränkungen bei aktiver Sitzungsverschlüsselung.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Legt den medienrelativen Pfad fest, der von `link-user-dirs` oder `bind-user-dirs`verwendet wird. Standard ist `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Ruft beliebige Dateien ab und führt sie aus einer temporären Datei im laufenden Live-System aus. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden; erforderliche Interpreter und weitere Abhängigkeiten müssen bereits installiert sein. Das Schlüsselwort `filesystem` entpackt Dateien in `/usr/lib/live/config-hooks/`; `medium` entpackt Dateien in `minios/config-hooks/` auf dem erkannten Live-Medium (mit ISO-Pfad-Fallback in der Hook-Komponente). Lokale Dateien können explizit `file:///run/initramfs/memory/data/minios/config-hooks/FILE` oder `file:///PATH` im Live-Root nutzen. Durch Pipes getrennte Einträge werden in der angegebenen Reihenfolge ausgeführt; durch Schlüsselwörter entpackte Dateien folgen der Shell-Glob-Reihenfolge. Beispiele sind installiert unter `/usr/share/doc/live-config/examples/hooks/`.

> **Sicherheitshinweis:** `live-config` läuft als root. Hooks werden ausführbar gemacht und als root ausgeführt, und Preseeds verändern die debconf-Datenbank des Systems mit Root-Rechten. Einfaches HTTP und FTP authentifizieren die heruntergeladenen Inhalte nicht und bieten keinen Integritätsschutz. Verwenden Sie bevorzugt geprüfte lokale Dateien oder vertrauenswürdigen, authentifizierten Transport mit unabhängiger Integritätsprüfung; verwenden Sie keine Remote-Hooks oder Preseeds aus unsicheren Netzwerken.

### MiniOS frühe Speicheroptionen

Diese Optionen werden von `minios-boot` vor dem Start der regulären Dienste gelesen. Sie erfordern ein funktionsfähiges, dauerhaftes `perch`-System und aktivieren dieses nicht eigenständig.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` legt das systemd-Journal und reguläre `/var/log`-Dateien in begrenztem RAM ab; Boot-Diagnosen verbleiben auf dauerhaftem Speicher. Standard: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` speichert heruntergeladene APT-Archive in einem begrenzten tmpfs, wenn RAM und Swap-Bedingungen dies erlauben. Paketdatenbanken und Repository-Listen bleiben persistent. Standard: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` fordert native Browser-Caches in RAM an. Die `browser-cache`-Komponente bindet die vom Live-Benutzer gewählten Cache-Verzeichnisse ein, nachdem das Konto existiert. Standard: `persistent`.

## Boot-Parameter (Kurzbefehle)

Für einige häufige Anwendungsfälle, bei denen mehrere Einzelparameter kombiniert werden müssten, stellt **live-config** Kurzbefehle bereit. So bleibt die volle Kontrolle über alle Optionen erhalten und es wird dennoch einfach gehalten.

- **live-config.noroot | noroot**: Deaktiviert die Root-Passwort-Einrichtung sowie die MiniOS Sudo- und PolicyKit-Berechtigungen.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Steuert die Sudo-Konfiguration für den Live-Benutzer. Die Standardeinstellung und das historische MiniOS-Verhalten bei Nicht-Setzung ist `passwordless`. Der Modus `password` behält Sudo-Zugriff bei, verlangt jedoch das Passwort des Live-Benutzers. Der Modus `disabled` entfernt die MiniOS-Sudo-Berechtigung und schließt den Live-Benutzer bei Erstellung aus der Sudo-Gruppe aus. Die ältere Abkürzung `noroot` überschreibt dies und deaktiviert die Root-Berechtigungseinrichtung umfassender.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Steuert die MiniOS PolicyKit-Komfortregeln. Die Standardeinstellung und das historische MiniOS-Verhalten bei Nicht-Setzung ist `passwordless`. Die Modi `password` und `disabled` entfernen diese Regel, sodass die normale PolicyKit-Authentifizierung der Distribution gilt. `disabled` ist keine strikte Alles-verweigern-Politik; verwenden Sie `noroot`, wenn der Live-Benutzer keine administrativen Rechte erhalten soll.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Schreibt eine OpenSSH-`PermitRootLogin`-Richtlinie, wenn explizit gesetzt und openssh-server installiert ist.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Schreibt eine OpenSSH-`PasswordAuthentication`-Richtlinie, wenn explizit gesetzt und openssh-server installiert ist.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Steuert die XRDP-Konfiguration, wenn xrdp installiert ist. `relaxed` bewahrt die historischen MiniOS-Standards. `hardened` bindet XRDP an localhost, stellt ausgehandelte/hohe Sicherheitseinstellungen wieder her und deaktiviert XRDP-Root-Login. `disabled` deaktiviert und stoppt XRDP über `minios-svc`, sofern verfügbar.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Steuert die MiniOS X11-Komforteinstellungen. `relaxed` bewahrt die historische Kompatibilität. `hardened` entfernt die großzügige `-ac` X-Server-Option und verschärft `Xwrapper.config`, wenn vorhanden.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Steuert, ob `/etc/issue` die Standard-MiniOS-Passworthinweise für root/live anzeigt.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Steuert, ob live-config die Bildschirmsperre lockert. `relaxed` bewahrt die historische Live-Session-Komforteinstellung. `hardened` verhindert das Deaktivieren der GNOME-Sperre und aktiviert die xscreensaver-Sperre, sofern vorhanden.
- **live-config.noautologin | noautologin**: Verhindert, dass live-config Konsole- und grafischen Autologin einrichtet. Bereits in einer persistenten Sitzung konfigurierter Autologin wird nicht entfernt.
- **live-config.nottyautologin | nottyautologin**: Verhindert, dass live-config Konsolen-Autologin einrichtet, ohne die grafische Einrichtung zu beeinflussen. Bestehende persistente Konfiguration bleibt erhalten.
- **live-config.nox11autologin | nox11autologin**: Verhindert, dass live-config Display-Manager-Autologin einrichtet, ohne die TTY-Einrichtung zu beeinflussen. Bestehende persistente Konfiguration bleibt erhalten.

## Boot-Parameter (Sonderoptionen)

Für spezielle Anwendungsfälle gibt es einige besondere Boot-Parameter.

- **live-config.debug | debug**: Aktiviert die Debug-Ausgabe in live-config.

## Konfigurationsdateien

**live-config** kann über Konfigurationsdateien konfiguriert (aber nicht aktiviert) werden. Jeder unterstützte Boot-Parameter kann in `LIVE_CONFIG_CMDLINE` abgelegt werden; die meisten Optionen lassen sich alternativ auch über einzelne Variablen setzen. Der `boot=live` Parameter ist weiterhin erforderlich, um **live-config** zu aktivieren.

**Hinweis:** Wenn Konfigurationsdateien verwendet werden, sollten idealerweise alle Boot-Parameter in die **LIVE_CONFIG_CMDLINE** Variable geschrieben werden. Alternativ können einzelne Variablen gesetzt werden. In diesem Fall muss der Benutzer sicherstellen, dass alle erforderlichen Variablen gesetzt sind, um eine gültige Konfiguration zu erstellen.

`live-config` wertet selbstständig `/etc/live/config.conf` und danach `/etc/live/config.conf.d/*.conf` in Shell-Glob-Reihenfolge aus. Spätere Fragmente können daher Werte aus der Hauptdatei oder früheren Fragmenten überschreiben. Eine zweite Konfigurationsschicht auf einem weiteren Medium wird nicht separat geladen.

Auf MiniOS-Medien sind die Quelldateien `minios/config.conf` und `minios/config.conf.d/*.conf` vorhanden. Bevor `live-config` startet, synchronisiert das MiniOS-initramfs diese Dateien mit den `/etc/live/` Laufzeitdateien anhand des Änderungsdatums. Eine neuere Quelldatei ersetzt das Laufzeitpendant; eine neuere Laufzeitdatei wird nur zurückkopiert, wenn das gewählte MiniOS-Datenverzeichnis beschreibbar ist. Bei gleichen Zeitstempeln findet keine Kopie statt, fehlende Dateien werden ergänzt, und es werden keine Dateien gelöscht. Dies ist eine Synchronisation beim Booten, kein kontinuierliches Monitoring. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die vollständigen Regeln zur Synchronisation und Priorität der Befehlszeile.

Als Fallback für initramfs-Implementierungen, die die Laufzeitdatei nicht vorbereitet haben, kopieren die systemd- und SysV-Startskripte `minios/config.conf` nur dann vom erkannten Medium, wenn `/etc/live/config.conf` fehlt. Dieser Fallback kopiert keine `config.conf.d` Fragmente. Das aktuelle Standard-MiniOS LiveKit-initramfs führt stattdessen die oben beschriebene Synchronisation durch.

Fragmentdateien müssen mit `*.conf` übereinstimmen. Namen wie `vendor.conf` oder `project.conf` werden empfohlen; wählen Sie die Namen bewusst, da spätere Fragmente frühere überschreiben.

Der eigentliche Inhalt der Konfigurationsdateien besteht aus einer oder mehreren der folgenden Variablen.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Diese Variable entspricht der Bootloader-Befehlszeile.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` Parameter.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` Parameter.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` Parameter.
- **LIVE_HOSTNAME=HOSTNAME**: Diese Variable entspricht dem `**live-config.hostname**=*HOSTNAME*` Parameter. Standard ist `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Legt die Richtlinie für das kabelgebundene Netzwerk fest. `dhcp` und ein nicht gesetzter Wert bewirken nichts und entfernen kein zuvor erstelltes MiniOS-statisches Profil.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Wählt das kabelgebundene Interface für die `static` oder `off` Richtlinie aus.
- **LIVE_NETWORK_ADDRESS=IPV4**: Setzt die statische IPv4-Adresse.
- **LIVE_NETWORK_PREFIX=PREFIX**: Legt die statische Präfixlänge fest; Standard ist `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Setzt das optionale statische Gateway.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Setzt optionale, komma-separierte DNS-Server.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Wählt das verwendete Backend aus.

Die Netzwerkkomponente schreibt nach erfolgreichem Setzen der Richtlinie einen `/var/lib/live/config/network` Stempel. Entfernen Sie diesen Stempel, um eine geänderte Richtlinie auf einem persistenten System anzuwenden. Zum Entfernen eines vorherigen statischen Profils nutzen Sie `network-method=off` oder löschen Sie das von MiniOS verwaltete Profil und den Stempel manuell.

- **LIVE_USERNAME=USERNAME**: Diese Variable entspricht dem `**live-config.username**=*USERNAME*` Parameter. Standard ist `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Diese Variable entspricht dem `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` Parameter.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Diese Variable entspricht dem `**live-config.user-fullname**="*USER FULLNAME*"` Parameter.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password**=*PASSWORD*` Parameter. Sie gibt das Root-Passwort im Klartext an.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password-crypted**=*PASSWORD*` Parameter. Sie gibt das Root-Passwort in verschlüsselter Form an.
- **LIVE_USER_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password**=*PASSWORD*` Parameter. Sie gibt das Benutzerpasswort im Klartext an.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password-crypted**=*PASSWORD*` Parameter. Sie gibt das Benutzerpasswort in verschlüsselter Form an.
- **LIVE_CONFIG_NOROOT=true|false**: Diese Variable entspricht dem `**live-config.noroot**` Parameter und deaktiviert Root-, Sudo- und PolicyKit-Rechte, wenn sie auf `true` gesetzt ist.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Diese Variable entspricht dem `**live-config.sudo-mode**=...` Parameter. Ist sie nicht gesetzt, behält MiniOS das bisherige Sudo-Verhalten ohne Passwort bei.
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
- **LIVE_LINK_USER_DIRS=true|false**: Aktiviert oder deaktiviert Links von den Standarddatenverzeichnissen des Benutzers auf das beschreibbare MiniOS-Laufwerk. Der zugehörige Boot-Parameter ist das einfache `live-config.link-user-dirs` Flag. Link-Modus kann nicht mit Bind-Modus oder einem anderen `toram` Modus kombiniert werden.
- **LIVE_BIND_USER_DIRS=true|false**: Aktiviert oder deaktiviert Bind-Mounts der Standarddatenverzeichnisse des Benutzers vom beschreibbaren MiniOS-Laufwerk. Der zugehörige Boot-Parameter ist das einfache `live-config.bind-user-dirs` Flag. Bind-Modus kann nicht mit Link-Modus oder einem anderen `toram` Modus kombiniert werden.
- **LIVE_USER_DIRS_PATH=PATH**: Diese Variable entspricht dem `**live-config.user-dirs-path**=*PATH*` Parameter. Sie gibt einen sicheren Pfad innerhalb des FAT32-, exFAT- oder NTFS-MiniOS-Laufwerks an. Standard ist `/minios/userdata`; Punkt- und Elternverzeichnis-Segmente werden abgelehnt.

Beim Einrichten von Benutzermedien werden niemals zwei nicht-leere Verzeichnisse automatisch zusammengeführt. Ein lokales, nicht-leeres Verzeichnis wird nur migriert, wenn das Zielverzeichnis auf dem Medium leer ist. Ist die Funktion deaktiviert, werden verwaltete Mediendaten vor dem Entfernen der Links zurückkopiert. Die Aktivierung und Rückkopierung von Benutzermedien ist blockiert, solange die aktive Persistenz-Sitzung LUKS-verschlüsselt ist, um zu verhindern, dass Sitzungsdaten auf unverschlüsselte MiniOS-Medien verschoben werden. Die Entscheidung basiert auf dem tatsächlichen aktiven Verschlüsselungsstatus: `perchencrypt=luks` fordert Verschlüsselung nur bei Erstellung einer neuen Sitzung an und beschreibt keine bestehende Sitzung. Ein fehlgeschlagener Abgleich oder Kopiervorgang belässt die bestehenden Benutzerverzeichnisse und protokolliert den Grund in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Diese Variable hält den Zustand, der durch den `live-config.module-mode` (oder `module-mode`) Parameter festgelegt wurde. Ist sie auf `merged` gesetzt, übernimmt das Live-System Aktualisierungen (über minios-update-users, minios-update-cache und minios-update-dpkg), um benutzerdefinierte Konfigurationen mit der Basisumgebung zusammenzuführen.
- **LIVE_CONFIG_DEBUG=true|false**: Diese Variable entspricht dem `**live-config.debug**` Parameter.

## MiniOS Cache- und Log-Variablen

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, und **LIVE_BROWSER_CACHE=persistent|volatile**: Unabhängige MiniOS Bootzeit-Richtlinien. Sie funktionieren auch in `config.conf.d` und `LIVE_CONFIG_CMDLINE`. Sie aktivieren die Persistenz nicht automatisch. Siehe [Konfigurationsdatei](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Die `browser-cache` Komponente liest die dauerhafte `minios-boot` Richtlinie, nachdem der Live-Nutzer existiert, und bindet Standardverzeichnisse des nativen Browser-Caches in ein gemeinsames, begrenztes RAM Dateisystem ein. Eine separat erstellte Firefox-Richtlinie deaktiviert dessen Festplatten-Cache, ohne die Browser-Profile zu verschieben. Ist diese Komponente durch `components=` oder `nocomponents=` ausgeschlossen, richtet allein die frühe Browser-Cache-Anforderung keine benutzerspezifischen Mounts ein.

Im Merged-Modus bleiben normale Fehler erhalten, aber detaillierte Befehlsprotokolle und Debug-Kopien werden nur erstellt, wenn `LIVE_CONFIG_DEBUG=true`.

# ANPASSUNG

**live-config** lässt sich einfach für nachgelagerte Projekte oder lokale Nutzung anpassen.

## Hinzufügen neuer Konfigurationskomponenten

Nachgelagerte Projekte können ihre Komponenten in /usr/lib/live/config ablegen und müssen nichts weiter tun; die Komponenten werden beim Booten automatisch ausgeführt.

Die Komponenten werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkomponente befindet sich in /usr/share/doc/live-config/examples.

## Entfernen bestehender Konfigurationskomponenten

Es ist derzeit nicht wirklich möglich, Komponenten auf sinnvolle Weise zu entfernen, ohne entweder ein lokal angepasstes **live-config**-Paket zu liefern oder dpkg-divert zu verwenden. Das gleiche Ziel lässt sich jedoch erreichen, indem die jeweiligen Komponenten über den Mechanismus live-config.nocomponents deaktiviert werden, siehe oben. Um nicht immer die zu deaktivierenden Komponenten als Boot-Parameter angeben zu müssen, sollte eine Konfigurationsdatei verwendet werden, siehe oben.

Die Konfigurationsdateien für das Live-System selbst werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkonfiguration befindet sich in /usr/share/doc/live-config/examples.

# KOMPONENTEN

**live-config** bietet derzeit die folgenden Komponenten unter /usr/lib/live/config an.

- **nss-systemd**: entfernt oder stellt das systemd-NSS-Modul in /etc/nsswitch.conf wieder her, um ein bekanntes Problem mit systemd zu umgehen.
- **debconf**: ermöglicht das Anwenden beliebiger Preseed-Dateien, die auf dem Live-Medium oder einem http/ftp-Server abgelegt sind.
- **hostname**: konfiguriert /etc/hostname und /etc/hosts.
- **issue-setup**: richtet die Datei /etc/issue mit einem Willkommensbanner und Distributionsinformationen ein.
- **live-debconfig_passwd**: konfiguriert Benutzer- und Root-Passwörter über live-debconfig.
- **user-setup**: legt ein Live-Benutzerkonto an.
- **user-groups**: fügt den Live-Benutzer zu zusätzlichen Gruppen hinzu, die von installierten Modulen deklariert wurden. Bereits vorhandene Gruppen, die in `/usr/share/live/config/user-default-groups.d/*.groups` aufgeführt sind, werden nach der Benutzererstellung und bei späteren live-config Ausführungen angewendet.
- **root-setup**: setzt oder aktualisiert das Root-Passwort und konfiguriert die Root-Umgebung.
- **sudo**: gewährt dem Live-Benutzer sudo-Rechte.
- **user-ssh-keys**: synchronisiert benutzerspezifische `authorized_keys.<username>` Dateien zwischen dem Live-Medium und den jeweiligen Home-Verzeichnissen der Benutzer. Unterstützt mehrere Benutzer gleichzeitig (z. B. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: verlinkt oder bindet validierte Benutzerverzeichnisse auf dem vorhandenen beschreibbaren MiniOS Datenträger ein, mit sicherer Migration und Rückkopieren beim Deaktivieren.
- **locales**: konfiguriert die Sprachumgebungen (Locales).
- **tzdata**: konfiguriert /etc/timezone.
- **xorg-service**: konfiguriert den Benutzernamen in xorg.service und setzt die X11-Konfiguration, sofern unterstützt.
- **gdm3**: konfiguriert den Autologin in gdm3.
- **sddm**: konfiguriert den Autologin in sddm.
- **kdm**: richtet Autologin in kdm ein.
- **lightdm**: richtet Autologin in lightdm ein.
- **lxdm**: richtet Autologin in lxdm ein.
- **nodm**: richtet Autologin in nodm ein.
- **slim**: richtet Autologin in slim ein.
- **xinit**: richtet Autologin mit xinit ein.
- **keyboard-configuration**: konfiguriert die Tastatur.
- **sysvinit**: richtet Console-Autologin über `/etc/inittab` ein, wenn sysvinit installiert ist. Die `noautologin` und `nottyautologin` Shortcuts unterdrücken diese Einrichtung.
- **sysv-rc**: konfiguriert sysv-rc durch Deaktivieren der aufgelisteten Dienste.
- **apport**: deaktiviert apport.
- **gnome-panel-data**: deaktiviert die Sperrtaste für den Bildschirm.
- **gnome-power-manager**: deaktiviert den Ruhezustand.
- **gnome-screensaver**: steuert die GNOME-Bildschirmsperre gemäß `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: deaktiviert den KDE-Migrationsassistenten (squeeze und neuer).
- **kde-services**: deaktiviert einige unerwünschte KDE-Dienste (squeeze und neuer).
- **policykit**: gewährt Benutzerrechte über PolicyKit.
- **ssl-cert**: erstellt SSL Snake-Oil-Zertifikate neu.
- **xrdp**: konfiguriert den XRDP-Modus (entspannt, gehärtet oder deaktiviert), wenn XRDP installiert ist.
- **anacron**: deaktiviert anacron.
- **util-linux**: deaktiviert den util-linux hwclock-Dienst.
- **login**: deaktiviert lastlog.
- **xserver-xorg**: konfiguriert xserver-xorg.
- **network**: konfiguriert eine dauerhafte kabelgebundene IPv4-Richtlinie über eine sichere NetworkManager-Keyfile oder ifupdown-Stanza. Läuft vor den Netzwerkdiensten, prüft alle Werte und schreibt erst nach erfolgreicher Validierung.
- **openssh-server**: erstellt OpenSSH-Hostschlüssel neu und schreibt explizit angeforderte Richtlinien für Root-Login oder Passwort-Authentifizierung.
- **xfce4-panel**: setzt xfce4-panel auf die Standardeinstellungen zurück.
- **xscreensaver**: steuert die Sperrfunktion von xscreensaver gemäß `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: konfiguriert broadcom-sta WLAN-Treiber.
- **hyperv**: konfiguriert X11-Einstellungen zur Verbesserung der Kompatibilität auf Microsoft Hyper-V Plattformen.
- **ntfs3**: verwaltet udev-Regeln für NTFS3-Unterstützung.
- **config-module-mode**: konfiguriert den Systemmodulmodus und aktualisiert Caches, Benutzereinstellungen und dpkg.
- **hooks**: ermöglicht das Ausführen beliebiger Befehle aus einer Datei, die auf dem Live-Medium oder einem http/ftp-Server abgelegt ist.

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
- `minios/log/YYYYMMDD_HHMMSS/` auf beschreibbarem ausgewähltem Datenträger, wenn Log-Export aktiviert ist
- `/usr/lib/live/config-hooks/*` (`filesystem` Hooks)
- `minios/config-hooks/*` auf dem erkannten Live-Medium (`medium` Hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` Preseeds)
- `minios/config-preseed/*` auf dem erkannten Live-Medium (`medium` Preseeds)

# SIEHE AUCH

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Weitere Informationen zu **minios-live-config** finden Sie im [GitHub-Repository](https://github.com/minios-linux/minios-live-config). Allgemeine Informationen zu MiniOS gibt es unter [minios.dev](https://minios.dev).

# FEHLER

Fehler können im [minios-live-config Issue Tracker](https://github.com/minios-linux/minios-live-config/issues) gemeldet werden.

# AUTOR

**live-config** wurde ursprünglich von Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)) geschrieben. Seit 2016 wird die Entwicklung vom Debian Live Team fortgeführt. Seit 2025 wird die Entwicklung der modifizierten **minios-live-config**-Version vom MiniOS Live Team weitergeführt.
