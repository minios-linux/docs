---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Systemkonfigurations-Komponenten

**live-config** enthält die Komponenten, die ein Live-System während des Bootvorgangs (spätes Userspace) konfigurieren.

Die Richtlinie für persistenten Sitzungs-Cache und Protokollierung wird bereits zuvor durch `minios-boot` festgelegt, nachdem das Live-Root und dessen Konfiguration vorbereitet wurden, aber bevor die regulären Dienste starten. Die `browser-cache` live-config-Komponente bindet die benutzerspezifischen Mounts nach der Benutzererstellung ein. Diese Richtlinien setzen eine funktionierende, dauerhafte `perch` Sitzung und ein aktuelles initrd voraus, das `perch-storage-v1` bekannt macht; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Auswirkungen und Grenzen.

Netzwerk-Boot im initramfs (`ip=`, PXE, `from=http://…`) ist eine separate LiveKit-Schicht und wird **nicht** von live-config verwaltet. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

**live-config** kann über Boot-Parameter oder die zur Laufzeit vom initramfs bereitgestellten Konfigurationsdateien angepasst werden. Die tatsächliche Kernel-Befehlszeile wird nach den dateibasierten `LIVE_CONFIG_CMDLINE` Werten angehängt, sodass spätere übereinstimmende Boot-Parameter Vorrang haben. Komponenten, die ihren Status unter `/var/lib/live/config` speichern, werden normalerweise nur einmal ausgeführt; Synchronisations- und zustandslose Komponenten können bei jedem Aufruf ausgeführt werden.

Falls *live-build*(7) zum Erstellen des Live-Systems verwendet wird, können die standardmäßig genutzten live-config-Parameter über die `--bootappend-live` Option gesetzt werden, siehe *lb_config*(1) Handbuchseite.

## Boot-Parameter (Komponenten)

**live-config** wird nur aktiviert, wenn `boot=live` als Boot-Parameter verwendet wird. Standardmäßig werden alle Komponenten ausgeführt. Mit dem Parameter `live-config.components` kann eingeschränkt werden, welche Komponenten ausgeführt werden, und `live-config.nocomponents` kann Komponenten ausschließen. Werden beide Parameter verwendet oder einer mehrfach angegeben, hat das letzte Vorkommen Vorrang.

- **live-config.components | components**: Alle Komponenten werden ausgeführt. Dies ist die Standardeinstellung für Live-Abbilder.
- **live-config.components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Es werden nur die angegebenen Komponenten ausgeführt. Die Ausführung erfolgt in der Reihenfolge, wie sie durch die Dateinamen unter `/usr/lib/live/config` vorgegeben ist, unabhängig von der Reihenfolge in dieser Liste.
- **live-config.nocomponents | nocomponents**: Es wird keine Komponente ausgeführt.
- **live-config.nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Alle Komponenten werden ausgeführt, außer den angegebenen.

## Boot-Parameter (Optionen)

Einige einzelne Komponenten können ihr Verhalten durch einen Boot-Parameter ändern.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Ruft eine oder mehrere debconf-Preseed-Dateien ab und wendet sie an. URLs werden verarbeitet von `wget` und können HTTP, FTP oder `file://` verwenden. Das Schlüsselwort `filesystem` entpackt Dateien in `/usr/lib/live/config-preseed/`; `medium` entpackt Dateien in `minios/config-preseed/` auf dem erkannten Live-Medium. Explizite lokale Dateien können Pfade wie `file:///run/initramfs/memory/data/minios/config-preseed/FILE` oder `file:///PATH` im Live-Root verwenden. Durch Pipe getrennte Einträge werden in der angegebenen Reihenfolge verarbeitet; Dateien, die durch ein Schlüsselwort entpackt werden, folgen der Shell-Glob-Reihenfolge.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Ermöglicht das Setzen des Hostnamens des Systems. Standardmäßig ist `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Legt die Richtlinie für das kabelgebundene Netzwerk fest. Nicht gesetzt und `dhcp` belassen das Image-Standardverhalten unverändert. `static` schreibt die Konfiguration für das gewählte Backend; `off` deaktiviert die automatische IPv4-Konfiguration für das gewählte Interface.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Wählt das kabelgebundene Interface aus. Wird es bei `static` oder `off` weggelassen, wird das einzige kabelgebundene Nicht-Loopback-Interface automatisch ausgewählt; bei null oder mehreren Kandidaten ist ein expliziter Wert erforderlich.
- **live-config.network-address=IPV4 | network-address=IPV4**: Legt die statische IPv4-Adresse fest.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Legt die IPv4-Präfixlänge von 0 bis 32 fest. Der statische Standardwert ist `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Legt das optionale IPv4-Gateway fest.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Legt optionale, durch Kommas getrennte DNS-Server-Adressen fest.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Wählt das Netzwerk-Backend aus. `auto` bevorzugt NetworkManager und verwendet bei Bedarf ifupdown als Fallback. Erzwungenes `ifupdown` markiert das Interface als unmanaged für NetworkManager, wenn beide Stacks installiert sind.
- **live-config.username=USERNAME | username=USERNAME**: Ermöglicht das Setzen des Benutzernamens, der für den Autologin erstellt wird. Standardmäßig ist `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Legt die zusätzlichen Gruppen für den Benutzer fest, der für den Autologin erstellt wird. Gruppennamen können durch Kommas oder Leerzeichen getrennt werden. Der MiniOS Standard ist `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Ermöglicht das Festlegen des vollständigen Namens des Benutzers, der für den Autologin erstellt wird. Der MiniOS Standard ist `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Ermöglicht das Festlegen des Root-Passworts im Klartext.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Ermöglicht das Festlegen des Root-Passworts in verschlüsselter Form.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Ermöglicht das Festlegen des Benutzerpassworts im Klartext.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Ermöglicht das Festlegen des Benutzerpassworts in verschlüsselter Form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Ermöglicht das Festlegen der Systemsprache, z. B. `de_CH.UTF-8`. Der Standard ist `en_US.UTF-8`. Falls die gewählte Locale noch nicht auf dem System verfügbar ist, wird sie automatisch erstellt.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Ermöglicht das Festlegen der Systemzeitzone, z. B. `Europe/Zurich`. Der Standard ist `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Ermöglicht das Ändern des Tastaturmodells. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Ermöglicht das Ändern der Tastaturbelegungen. Wenn mehr als eine angegeben ist, kann in der Desktop-Umgebung unter X11 zwischen ihnen gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Ermöglicht das Ändern der Tastaturvarianten. Wenn mehrere Varianten angegeben werden, sollte die gleiche Anzahl wie bei den Tastaturbelegungen angegeben werden, da sie eins zu eins in der angegebenen Reihenfolge zugeordnet werden. Leere Werte sind erlaubt. Die Tools der Desktop-Umgebung ermöglichen das Umschalten zwischen den jeweiligen Layout- und Variantenpaaren unter X11. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Ermöglicht das Ändern der Tastaturoptionen. Es ist kein Standardwert gesetzt.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Ermöglicht das Deaktivieren von sysv-Diensten über update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Ermöglicht das Festlegen, ob das System davon ausgeht, dass die Hardware-Uhr auf UTC eingestellt ist oder nicht. Der Standard ist `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Ermöglicht das Festlegen des x-session-manager über update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Ermöglicht das Festlegen des xorg-Treibers anstelle der automatischen Erkennung. Wenn eine PCI-ID in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` im Live-System angegeben ist, wird der *TREIBER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Ermöglicht das Setzen der Xorg-Auflösung anstelle der automatischen Erkennung, z. B. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Ermöglicht das Festlegen des WLAN-Treibers anstelle der automatischen Erkennung. Wenn eine PCI-ID angegeben ist in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` im Live-System, wird der *DRIVER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Damit kann der Modus für die Live-Konfiguration festgelegt werden. Ist `merged` ausgewählt, werden Benutzerkonten aktualisiert, Caches neu aufgebaut und Paket-Einstellungen aktualisiert, sodass Konfigurationsänderungen dynamisch ins laufende System integriert werden.
- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: Frühe `minios-boot`-Richtlinie für das Journal und normale `/var/log`-Dateien. Boot-Diagnosen verbleiben auf dauerhaftem Speicher. Standard ist `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: Frühe Richtlinie für heruntergeladene APT-Archive. Ein begrenztes tmpfs wird nur verwendet, wenn RAM und Swap-Bedingungen dies erlauben; Paketdatenbanken und Repository-Listen werden nicht verschoben. Standard ist `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: Frühe Richtlinie für native Browser-Caches. Mit `volatile`, mountet die `browser-cache`-Komponente ausgewählte Live-User-Cache-Verzeichnisse in RAM, nachdem das Benutzerkonto angelegt wurde. Standard ist `persistent`.
- **live-config.link-user-dirs | link-user-dirs**: Verlinkt die verwalteten Benutzerverzeichnisse mit dem konfigurierten Pfad auf dem MiniOS-Datenträger. Ist nicht mit Bind-Modus kombinierbar und nicht verfügbar bei jedem `toram`-Modus oder wenn die aktive Persistenz-Sitzung LUKS-verschlüsselt ist.
- **live-config.bind-user-dirs | bind-user-dirs**: Bindet die verwalteten Benutzerverzeichnisse vom konfigurierten Pfad auf dem MiniOS-Datenträger ein. Ist nicht mit Link-Modus kombinierbar und hat dieselben `toram` und Einschränkungen bei aktiver Sitzungsverschlüsselung.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Legt den medienrelativen Pfad fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard ist `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Lädt und führt beliebige Dateien aus einer temporären Datei im laufenden Live-System aus. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden; benötigte Interpreter und weitere Abhängigkeiten müssen bereits installiert sein. Das Schlüsselwort `filesystem` entpackt Dateien im `/usr/lib/live/config-hooks/`; `medium` entpackt Dateien im `minios/config-hooks/` auf dem erkannten Live-Medium (mit ISO-Pfad-Fallback in der Hook-Komponente). Lokale Dateien können explizit `file:///run/initramfs/memory/data/minios/config-hooks/FILE` oder `file:///PATH` im Live-Root verwenden. Durch Pipe getrennte Einträge werden in der angegebenen Reihenfolge ausgeführt; Dateien, die durch ein Schlüsselwort entpackt werden, folgen der Shell-Glob-Reihenfolge. Beispiele sind unter `/usr/share/doc/live-config/examples/hooks/` installiert.

> **Sicherheitswarnung:** `live-config` wird als root ausgeführt. Hooks werden ausführbar gemacht und als root gestartet; Preseeds verändern die debconf-Datenbank des Systems mit Root-Rechten. Plain HTTP und FTP authentifizieren die heruntergeladenen Inhalte nicht und bieten keinen Integritätsschutz. Verwenden Sie bevorzugt geprüfte lokale Dateien oder vertrauenswürdige, authentifizierte Übertragungen mit unabhängiger Integritätsprüfung. Nutzen Sie keine Remote-Hooks oder Preseeds aus nicht vertrauenswürdigen Netzwerken.

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

**live-config** kann über Konfigurationsdateien konfiguriert (aber nicht aktiviert) werden. Jeder unterstützte Boot-Parameter kann in `LIVE_CONFIG_CMDLINE` eingetragen werden, und die meisten Optionen können alternativ über einzelne Variablen gesetzt werden. Das `boot=live`-Parameter ist weiterhin erforderlich, um **live-config** zu aktivieren.

**Hinweis:** Wenn Konfigurationsdateien verwendet werden, sollten idealerweise alle Boot-Parameter in die **LIVE_CONFIG_CMDLINE**-Variable geschrieben werden, alternativ können einzelne Variablen gesetzt werden. Werden einzelne Variablen verwendet, muss der Nutzer sicherstellen, dass alle notwendigen Variablen gesetzt sind, um eine gültige Konfiguration zu erstellen.

`live-config` selbst lädt `/etc/live/config.conf` und dann `/etc/live/config.conf.d/*.conf` in der Shell-Glob-Reihenfolge. Spätere Fragmente können daher Werte aus der Hauptdatei oder früheren Fragmenten überschreiben. Es wird keine zweite Medien-Konfigurationsschicht separat geladen.

Auf MiniOS-Medien sind die Quelldateien `minios/config.conf` und `minios/config.conf.d/*.conf` vorhanden. Bevor `live-config` startet, synchronisiert das MiniOS initramfs diese mit den `/etc/live/` Laufzeitdateien anhand des Änderungsdatums. Eine neuere Quelldatei ersetzt ihr Laufzeit-Pendant; eine neuere Laufzeitdatei wird nur zurückkopiert, wenn das gewählte MiniOS-Datenverzeichnis beschreibbar ist. Gleiche Zeitstempel führen zu keiner Kopie, fehlende Dateien werden ergänzt, und Dateien werden nicht gelöscht. Dies ist eine Synchronisation beim Booten, keine kontinuierliche Überwachung. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die vollständigen Regeln zur Synchronisation und Vorrang der Kommandozeile.

Als Fallback für initramfs-Implementierungen, die die Laufzeitdatei nicht vorbereitet haben, kopieren die systemd- und SysV-Startskripte `minios/config.conf` nur vom erkannten Medium, wenn `/etc/live/config.conf` fehlt. Dieser Fallback kopiert keine `config.conf.d`-Fragmente. Das aktuelle Standard-MiniOS LiveKit-initramfs führt stattdessen die oben beschriebene Synchronisation durch.

Fragmentdateien müssen mit `*.conf` übereinstimmen. Namen wie `vendor.conf` oder `project.conf` werden empfohlen; wählen Sie die Namen bewusst, da spätere Fragmente frühere überschreiben.

Der eigentliche Inhalt der Konfigurationsdateien besteht aus einer oder mehreren der folgenden Variablen.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Diese Variable entspricht der Bootloader-Kommandozeile.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`-Parameter.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`-Parameter.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`-Parameter.
- **LIVE_HOSTNAME=HOSTNAME**: Diese Variable entspricht dem `**live-config.hostname**=*HOSTNAME*`-Parameter. Standardwert ist `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Legt die Richtlinie für das kabelgebundene Netzwerk fest. `dhcp` und ein nicht gesetzter Wert haben keine Auswirkung und entfernen kein zuvor erstelltes MiniOS-Profil.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Wählt das kabelgebundene Interface für die `static`- oder `off`-Richtlinie aus.
- **LIVE_NETWORK_ADDRESS=IPV4**: Setzt die statische IPv4-Adresse.
- **LIVE_NETWORK_PREFIX=PREFIX**: Legt die statische Präfixlänge fest; Standard ist `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Setzt das optionale statische Gateway.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Setzt optionale, durch Kommas getrennte DNS-Server.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Wählt das verwendete Backend aus.

Die Netzwerkkomponente zeichnet `/var/lib/live/config/network` nach erfolgreichem Schreiben der Richtlinie auf. Entfernen Sie diesen Stempel, um eine geänderte Richtlinie auf einem persistenten System anzuwenden. Um ein vorheriges statisches Profil zu entfernen, verwenden Sie `network-method=off` oder entfernen Sie das von MiniOS verwaltete Profil und den Stempel manuell.

- **LIVE_USERNAME=USERNAME**: Diese Variable entspricht dem `**live-config.username**=*USERNAME*`-Parameter. Standardwert ist `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Diese Variable entspricht dem `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`-Parameter.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Diese Variable entspricht dem `**live-config.user-fullname**="*USER FULLNAME*"`-Parameter.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password**=*PASSWORD*`-Parameter. Sie legt das Root-Passwort im Klartext fest.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.root-password-crypted**=*PASSWORD*`-Parameter. Sie legt das Root-Passwort in verschlüsselter Form fest.
- **LIVE_USER_PASSWORD=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password**=*PASSWORD*` Parameter und legt das Benutzerpasswort im Klartext fest.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem `**live-config.user-password-crypted**=*PASSWORD*` Parameter und legt das Benutzerpasswort in verschlüsselter Form fest.
- **LIVE_CONFIG_NOROOT=true|false**: Diese Variable entspricht dem `**live-config.noroot**` Parameter und deaktiviert Root-, sudo- und PolicyKit-Berechtigungen, wenn auf `true` gesetzt.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Diese Variable entspricht dem `**live-config.sudo-mode**=...` Parameter. Wenn nicht gesetzt, behält MiniOS das bisherige sudo-Verhalten ohne Passwort bei.
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
- **LIVE_LINK_USER_DIRS=true|false**: Aktiviert oder deaktiviert Links von den Standarddatenverzeichnissen des Benutzers auf das beschreibbare MiniOS Laufwerk. Der entsprechende Boot-Parameter ist das einfache `live-config.link-user-dirs` Flag. Der Link-Modus kann nicht mit dem Bind-Modus oder einem anderen `toram` Modus kombiniert werden.
- **LIVE_BIND_USER_DIRS=true|false**: Aktiviert oder deaktiviert Bind-Mounts der Standarddatenverzeichnisse des Benutzers vom beschreibbaren MiniOS Laufwerk. Der entsprechende Boot-Parameter ist das einfache `live-config.bind-user-dirs` Flag. Der Bind-Modus kann nicht mit dem Link-Modus oder einem anderen `toram` Modus kombiniert werden.
- **LIVE\_USER\_DIRS\_PATH=PFAD**: Diese Variable entspricht dem `**live-config.user-dirs-path**=*PATH*`-Parameter. Sie legt einen sicheren Pfad innerhalb des FAT32-, exFAT- oder NTFS-MiniOS-Laufwerks fest. Standardmäßig ist der Wert `/minios/userdata`; Punkt- und Überordner-Segmente werden abgelehnt.

Die Benutzer-Medien-Einrichtung führt niemals automatisch zwei nicht-leere Verzeichnisse zusammen. Ein lokales, nicht-leeres Verzeichnis wird nur migriert, wenn das Medienziel leer ist. Ist die Funktion deaktiviert, werden verwaltete Mediendaten vor dem Entfernen von Links zurückkopiert. Die Aktivierung und Rückkopierung von Benutzer-Medien sind blockiert, solange die aktive Persistenzsitzung LUKS-verschlüsselt ist, um zu verhindern, dass Sitzungsdaten auf unverschlüsselte MiniOS-Medien verschoben werden. Diese Entscheidung basiert auf dem tatsächlich aktiven Verschlüsselungsstatus: `perchencrypt=luks` fordert die Verschlüsselung nur beim Erstellen einer neuen Sitzung an und beschreibt keine bestehende Sitzung. Ein fehlgeschlagener Validierungs- oder Kopiervorgang belässt die bestehenden Benutzerverzeichnisse unverändert und protokolliert den Grund in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Diese Variable enthält den Zustand, der durch den `live-config.module-mode`- (oder `module-mode`) Parameter festgelegt wird. Ist sie auf `merged` gesetzt, übernimmt das Live-System Updates (über minios-update-users, minios-update-cache und minios-update-dpkg), um benutzerdefinierte Konfigurationen mit der Basisumgebung zu verschmelzen.
- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, und **LIVE_BROWSER_CACHE=persistent|volatile**: Unabhängige MiniOS-Bootzeit-Richtlinien. Sie funktionieren auch im `config.conf.d` und `LIVE_CONFIG_CMDLINE`. Sie aktivieren die Persistenz nicht eigenständig. Siehe [Konfigurationsdatei](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).
- **LIVE_CONFIG_DEBUG=true|false**: Diese Variable entspricht dem `**live-config.debug**`-Parameter. Helferbefehle im Merged-Modus protokollieren normale Fehler, erstellen aber nur dann detaillierte Befehlsabläufe und Debug-Kopien, wenn Debug aktiviert ist.

# ANPASSUNG

**live-config** lässt sich einfach für nachgelagerte Projekte oder lokale Nutzung anpassen.

## Hinzufügen neuer Konfigurationskomponenten

Nachgelagerte Projekte können ihre Komponenten in /usr/lib/live/config ablegen und müssen nichts weiter tun; die Komponenten werden beim Booten automatisch ausgeführt.

Die Komponenten werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkomponente befindet sich in /usr/share/doc/live-config/examples.

## Entfernen bestehender Konfigurationskomponenten

Es ist derzeit nicht wirklich möglich, Komponenten auf sinnvolle Weise zu entfernen, ohne entweder ein lokal angepasstes **live-config**-Paket zu liefern oder dpkg-divert zu verwenden. Das gleiche Ziel lässt sich jedoch erreichen, indem die jeweiligen Komponenten über den Mechanismus live-config.nocomponents deaktiviert werden, siehe oben. Um nicht immer die zu deaktivierenden Komponenten als Boot-Parameter angeben zu müssen, sollte eine Konfigurationsdatei verwendet werden, siehe oben.

Die Konfigurationsdateien für das Live-System selbst werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkonfiguration befindet sich in /usr/share/doc/live-config/examples.

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
