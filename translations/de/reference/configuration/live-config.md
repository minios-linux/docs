---
updated: 2026-08-31
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** – Systemkonfigurations-Komponenten

**live-config** enthält die Komponenten, die ein Live-System während des Bootvorgangs (später Userspace) konfigurieren.

Netzwerk-Boot im initramfs (`ip=`, PXE, `from=http://…`) ist eine separate LiveKit-Schicht und wird **nicht** von live-config verwaltet. Siehe [Network boot](/reference/boot-process/Network-Boot).

**live-config** kann über Boot-Parameter oder zur Laufzeit vorbereitete Konfigurationsdateien des initramfs konfiguriert werden. Die tatsächliche Kernel-Befehlszeile wird nach den durch Dateien bereitgestellten `LIVE_CONFIG_CMDLINE`-Werten angehängt, sodass spätere übereinstimmende Boot-Parameter Vorrang haben. Komponenten, die ihren Status unter `/var/lib/live/config` speichern, werden normalerweise nur einmal ausgeführt; synchronisierende und zustandslose Komponenten können bei jedem Aufruf laufen.

Wenn *live-build*(7) zum Erstellen des Live-Systems verwendet wird, können die standardmäßig genutzten live-config-Parameter über die Option `--bootappend-live` gesetzt werden, siehe Handbuchseite *lb_config*(1).

## Boot-Parameter (Komponenten)

**live-config** wird nur aktiviert, wenn `boot=live` als Boot-Parameter verwendet wird. Standardmäßig werden alle Komponenten ausgeführt. Mit dem Parameter `live-config.components` kann eingeschränkt werden, welche Komponenten ausgeführt werden, und `live-config.nocomponents` kann Komponenten ausschließen. Werden beide Parameter verwendet oder einer mehrfach angegeben, hat das letzte Vorkommen Vorrang.

- **live-config.components | components**: Alle Komponenten werden ausgeführt. Dies ist die Standardeinstellung für Live-Abbilder.
- **live-config.components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Es werden nur die angegebenen Komponenten ausgeführt. Die Ausführung erfolgt in der Reihenfolge, wie sie durch die Dateinamen unter `/usr/lib/live/config` vorgegeben ist, unabhängig von der Reihenfolge in dieser Liste.
- **live-config.nocomponents | nocomponents**: Es wird keine Komponente ausgeführt.
- **live-config.nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Alle Komponenten werden ausgeführt, außer den angegebenen.

## Boot-Parameter (Optionen)

Einige einzelne Komponenten können ihr Verhalten durch einen Boot-Parameter ändern.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Ruft ein oder mehrere debconf-Preseed-Dateien ab und wendet sie an. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden. Das Schlüsselwort `filesystem` erweitert Dateien in `/usr/lib/live/config-preseed/`; `medium` erweitert Dateien in `minios/config-preseed/` auf dem erkannten Live-Medium. Lokale Dateien können explizit mit Pfaden wie `file:///run/initramfs/memory/data/minios/config-preseed/FILE` oder `file:///PATH` im Live-Root angegeben werden. Durch Pipes getrennte Einträge werden in der angegebenen Reihenfolge verarbeitet; durch ein Schlüsselwort erweiterte Dateien werden in Shell-Glob-Reihenfolge verarbeitet.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Ermöglicht das Setzen des System-Hostnamens. Standard ist `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Wählt die Richtlinie für kabelgebundene Netzwerke. Nicht gesetzt und `dhcp` lassen die Standardeinstellung des Abbilds unverändert. `static` schreibt die Konfiguration für das gewählte Backend; `off` deaktiviert die automatische IPv4-Konfiguration für das gewählte Interface.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Wählt das kabelgebundene Interface. Wird für `static` oder `off` nicht angegeben, wird automatisch das einzige kabelgebundene Nicht-Loopback-Interface ausgewählt; bei keiner oder mehreren Kandidaten ist ein expliziter Wert erforderlich.
- **live-config.network-address=IPV4 | network-address=IPV4**: Setzt die statische IPv4-Adresse.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Setzt die IPv4-Präfixlänge von 0 bis 32. Standard für statische Konfiguration ist `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Setzt das optionale IPv4-Gateway.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Setzt optionale, kommaseparierte DNS-Server-Adressen.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Wählt das Netzwerk-Backend. `auto` bevorzugt NetworkManager und fällt auf ifupdown zurück. Erzwungenes `ifupdown` markiert das Interface als unmanaged für NetworkManager, wenn beide Stacks installiert sind.
- **live-config.username=USERNAME | username=USERNAME**: Ermöglicht das Setzen des Benutzernamens, der für den Autologin erstellt wird. Standard ist `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Legt die zusätzlichen Gruppen für den Autologin-Benutzer fest. Gruppennamen können durch Kommas oder Leerzeichen getrennt werden. Standard in MiniOS ist `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Ermöglicht das Setzen des vollständigen Namens des Autologin-Benutzers. Standard in MiniOS ist `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Setzt das Root-Passwort im Klartext.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Setzt das Root-Passwort in verschlüsselter Form.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Setzt das Benutzerpasswort im Klartext.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Setzt das Benutzerpasswort in verschlüsselter Form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Ermöglicht das Setzen der System-Locale, z. B. `de_CH.UTF-8`. Standard ist `en_US.UTF-8`. Ist die gewählte Locale noch nicht auf dem System verfügbar, wird sie automatisch generiert.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Ermöglicht das Setzen der System-Zeitzone, z. B. `Europe/Zurich`. Standard ist `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Ermöglicht das Ändern des Tastaturmodells. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Ermöglicht das Ändern der Tastaturbelegungen. Bei mehreren Angaben kann in der Desktopumgebung unter X11 gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Ermöglicht das Ändern der Tastaturvarianten. Bei mehreren Angaben sollte die gleiche Anzahl wie bei keyboard-layouts angegeben werden, da sie eins zu eins zugeordnet werden. Leere Werte sind erlaubt. In der Desktopumgebung kann zwischen jedem Layout- und Variantenpaar unter X11 gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Ermöglicht das Ändern der Tastaturoptionen. Es ist kein Standardwert gesetzt.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Ermöglicht das Deaktivieren von sysv-Diensten über update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Ermöglicht die Einstellung, ob die Hardware-Uhr auf UTC gestellt ist. Standard ist `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Ermöglicht das Setzen des x-session-managers über update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Ermöglicht das Setzen des xorg-Treibers anstelle der automatischen Erkennung. Wird eine PCI-ID in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` im Live-System angegeben, wird *DRIVER* für diese Geräte erzwungen. Gibt es sowohl einen Boot-Parameter als auch ein Override, hat der Boot-Parameter Vorrang.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Ermöglicht das Setzen der xorg-Auflösung anstelle der automatischen Erkennung, z. B. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Ermöglicht das Setzen des WLAN-Treibers anstelle der automatischen Erkennung. Wird eine PCI-ID in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` im Live-System angegeben, wird *DRIVER* für diese Geräte erzwungen. Gibt es sowohl einen Boot-Parameter als auch ein Override, hat der Boot-Parameter Vorrang.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Ermöglicht die Angabe des Modulmodus für die Live-Konfiguration. Bei Einstellung auf `merged` werden Benutzerkonten aktualisiert, Caches neu aufgebaut und Paketkonfigurationen aktualisiert, sodass Änderungen dynamisch ins laufende System integriert werden.
- **live-config.link-user-dirs | link-user-dirs**: Verlinkt die verwalteten Benutzerverzeichnisse mit dem konfigurierten Pfad auf dem MiniOS-Datenträger.
- **live-config.bind-user-dirs | bind-user-dirs**: Bind-mountet die verwalteten Benutzerverzeichnisse vom konfigurierten Pfad auf dem MiniOS-Datenträger. Diese Option schließt sich mit `link-user-dirs` gegenseitig aus.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Legt den medienrelativen Pfad fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard ist `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Ruft beliebige Dateien ab und führt sie aus einer temporären Datei im laufenden Live-System aus. URLs werden von `wget` verarbeitet und können HTTP, FTP oder `file://` verwenden; erforderliche Interpreter und Abhängigkeiten müssen bereits installiert sein. Das Schlüsselwort `filesystem` erweitert Dateien in `/usr/lib/live/config-hooks/`; `medium` erweitert Dateien in `minios/config-hooks/` auf dem erkannten Live-Medium (mit ISO-Pfad-Fallback im Hook-Komponenten). Lokale Dateien können explizit mit `file:///run/initramfs/memory/data/minios/config-hooks/FILE` oder `file:///PATH` im Live-Root angegeben werden. Durch Pipes getrennte Einträge werden in der angegebenen Reihenfolge ausgeführt; durch ein Schlüsselwort erweiterte Dateien werden in Shell-Glob-Reihenfolge ausgeführt. Beispiele sind unter `/usr/share/doc/live-config/examples/hooks/` installiert.

> **Sicherheitswarnung:** `live-config` läuft als root. Hooks werden ausführbar gemacht und als root ausgeführt, und Preseeds ändern die debconf-Datenbank des Systems mit Root-Rechten. Einfaches HTTP und FTP authentifizieren die heruntergeladenen Inhalte nicht und bieten keinen Integritätsschutz. Bevorzugen Sie geprüfte lokale Dateien oder vertrauenswürdigen, authentifizierten Transport mit unabhängiger Integritätsprüfung; verwenden Sie keine Remote-Hooks oder Preseeds aus unsicheren Netzwerken.

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

**live-config** kann über Konfigurationsdateien konfiguriert (aber nicht aktiviert) werden. Jeder unterstützte Boot-Parameter kann in `LIVE_CONFIG_CMDLINE` eingetragen werden, und die meisten Optionen können alternativ über einzelne Variablen gesetzt werden. Der Parameter `boot=live` ist weiterhin erforderlich, um **live-config** zu aktivieren.

**Hinweis:** Wenn Konfigurationsdateien verwendet werden, sollten vorzugsweise alle Boot-Parameter in die Variable **LIVE_CONFIG_CMDLINE** geschrieben werden, oder es können einzelne Variablen gesetzt werden. Bei Verwendung einzelner Variablen ist der Benutzer dafür verantwortlich, dass alle notwendigen Variablen gesetzt sind, um eine gültige Konfiguration zu erstellen.

`live-config` lädt zunächst `/etc/live/config.conf` und dann `/etc/live/config.conf.d/*.conf` in Shell-Glob-Reihenfolge. Spätere Fragmente können daher Werte aus der Hauptdatei oder früheren Fragmenten überschreiben. Es wird keine separate zweite Medien-Konfigurationsebene geladen.

Auf MiniOS-Medien sind die Quelldateien `minios/config.conf` und `minios/config.conf.d/*.conf`. Bevor `live-config` startet, synchronisiert das MiniOS-initramfs diese mit den Laufzeitdateien `/etc/live/` anhand der Änderungszeit. Eine neuere Quelldatei ersetzt ihr Laufzeitgegenstück; eine neuere Laufzeitdatei wird nur zurückkopiert, wenn das gewählte MiniOS-Datenverzeichnis beschreibbar ist. Bei gleichen Zeitstempeln erfolgt keine Kopie, fehlende Dateien werden ergänzt, und Dateien werden nicht gelöscht. Dies ist eine Synchronisation beim Booten, keine kontinuierliche Überwachung. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die vollständigen Regeln zur Synchronisation und Priorität der Kommandozeile.

Als Fallback für initramfs-Implementierungen, die die Laufzeitdatei nicht vorbereitet haben, kopieren die systemd- und SysV-Startskripte `minios/config.conf` nur dann vom erkannten Medium, wenn `/etc/live/config.conf` fehlt. Dieser Fallback kopiert keine `config.conf.d`-Fragmente. Das aktuelle Standard-MiniOS-LiveKit-initramfs führt stattdessen die oben beschriebene Synchronisation durch.

Fragmentdateien müssen `*.conf` entsprechen. Namen wie `vendor.conf` oder `project.conf` werden empfohlen; wählen Sie die Namen bewusst, da spätere Fragmente frühere überschreiben.

Der eigentliche Inhalt der Konfigurationsdateien besteht aus einer oder mehreren der folgenden Variablen:

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Diese Variable entspricht der Bootloader-Kommandozeile.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem Parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem Parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem Parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Diese Variable entspricht dem Parameter `**live-config.hostname**=*HOSTNAME*`. Standard ist `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Wählt die Richtlinie für kabelgebundene Netzwerke. `dhcp` und ein nicht gesetzter Wert haben keine Auswirkung und entfernen kein zuvor erstelltes MiniOS-statisches Profil.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Wählt das kabelgebundene Interface für die `static`- oder `off`-Richtlinie.
- **LIVE_NETWORK_ADDRESS=IPV4**: Setzt die statische IPv4-Adresse.
- **LIVE_NETWORK_PREFIX=PREFIX**: Setzt die statische Präfixlänge; Standard ist `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Setzt das optionale statische Gateway.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Setzt optionale, durch Kommas getrennte DNS-Server.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Wählt das verwendete Backend.

Die Netzwerkkomponente zeichnet `/var/lib/live/config/network` nach erfolgreichem Schreiben der Richtlinie auf. Entfernen Sie diesen Stempel, um eine geänderte Richtlinie auf einem persistenten System anzuwenden. Um ein vorheriges statisches Profil zu entfernen, verwenden Sie `network-method=off` oder entfernen Sie das von MiniOS verwaltete Profil und den Stempel manuell.

- **LIVE_USERNAME=USERNAME**: Diese Variable entspricht dem Parameter `**live-config.username**=*USERNAME*`. Standard ist `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Diese Variable entspricht dem Parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Diese Variable entspricht dem Parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.root-password**=*PASSWORD*`. Sie legt das Root-Passwort im Klartext fest.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.root-password-crypted**=*PASSWORD*`. Sie legt das Root-Passwort in verschlüsselter Form fest.
- **LIVE_USER_PASSWORD=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.user-password**=*PASSWORD*`. Sie legt das Benutzerpasswort im Klartext fest.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.user-password-crypted**=*PASSWORD*`. Sie legt das Benutzerpasswort in verschlüsselter Form fest.
- **LIVE_CONFIG_NOROOT=true|false**: Diese Variable entspricht dem Parameter `**live-config.noroot**` und deaktiviert Root-, Sudo- und PolicyKit-Rechte, wenn sie auf `true` gesetzt ist.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Diese Variable entspricht dem Parameter `**live-config.sudo-mode**=...`. Wenn nicht gesetzt, behält MiniOS das bisherige passwortlose Sudo-Verhalten bei.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Diese Variable entspricht dem Parameter `**live-config.polkit-mode**=...`. `password` und `disabled` entfernen die MiniOS-Passwortlos-Regel und stellen die normale PolicyKit-Authentifizierung der Distribution wieder her.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Diese Variable entspricht dem Parameter `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Diese Variable entspricht dem Parameter `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Diese Variable entspricht dem Parameter `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Diese Variable entspricht dem Parameter `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Diese Variable entspricht dem Parameter `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Diese Variable entspricht dem Parameter `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Diese Variable entspricht dem Parameter `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Diese Variable entspricht dem Parameter `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Diese Variable entspricht dem Parameter `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Diese Variable entspricht dem Parameter `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Diese Variable entspricht dem Parameter `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Diese Variable entspricht dem Parameter `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Diese Variable entspricht dem Parameter `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Diese Variable entspricht dem Parameter `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Diese Variable entspricht dem Parameter `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Diese Variable entspricht dem Parameter `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Diese Variable entspricht dem Parameter `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Diese Variable entspricht dem Parameter `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem Parameter `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Aktiviert oder deaktiviert Links von den Standarddatenverzeichnissen des Benutzers auf das beschreibbare MiniOS-Laufwerk. Der entsprechende Boot-Parameter ist das einfache `live-config.link-user-dirs`-Flag. Link-Modus kann nicht mit Bind-Modus oder einem beliebigen `toram`-Modus kombiniert werden.
- **LIVE_BIND_USER_DIRS=true|false**: Aktiviert oder deaktiviert Bind-Mounts der Standarddatenverzeichnisse des Benutzers vom beschreibbaren MiniOS-Laufwerk. Der entsprechende Boot-Parameter ist das einfache `live-config.bind-user-dirs`-Flag. Bind-Modus kann nicht mit Link-Modus oder einem beliebigen `toram`-Modus kombiniert werden.
- **LIVE_USER_DIRS_PATH=PATH**: Diese Variable entspricht dem Parameter `**live-config.user-dirs-path**=*PATH*`. Sie gibt einen sicheren Pfad innerhalb des FAT32-, exFAT- oder NTFS-MiniOS-Laufwerks an. Standard ist `/minios/userdata`; Punkt- und Elternverzeichnis-Segmente werden abgelehnt.

Die Benutzer-Medien-Einrichtung führt niemals automatisch zwei nicht-leere Verzeichnisse zusammen. Ein lokales nicht-leeres Verzeichnis wird nur migriert, wenn das Medienziel leer ist. Wenn die Funktion deaktiviert ist, werden verwaltete Mediendaten zurückkopiert, bevor Links entfernt werden. Eine fehlgeschlagene Validierung oder Kopie belässt die bestehenden Benutzerverzeichnisse unverändert und protokolliert den Grund in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Diese Variable enthält den durch den Parameter `live-config.module-mode` (oder `module-mode`) festgelegten Zustand. Wenn sie auf `merged` gesetzt ist, übernimmt das Live-System Updates (über minios-update-users, minios-update-cache und minios-update-dpkg), um benutzerdefinierte Konfigurationen mit der Basisumgebung zu verschmelzen.
- **LIVE_CONFIG_DEBUG=true|false**: Diese Variable entspricht dem Parameter `**live-config.debug**`.

# ANPASSUNG

**live-config** lässt sich einfach für nachgelagerte Projekte oder lokale Nutzung anpassen.

## Hinzufügen neuer Konfigurationskomponenten

Nachgelagerte Projekte können ihre Komponenten in /usr/lib/live/config ablegen und müssen nichts weiter tun; die Komponenten werden beim Booten automatisch ausgeführt.

Die Komponenten werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkomponente befindet sich in /usr/share/doc/live-config/examples.

## Entfernen bestehender Konfigurationskomponenten

Es ist derzeit nicht wirklich möglich, Komponenten auf sinnvolle Weise zu entfernen, ohne entweder ein lokal angepasstes **live-config**-Paket zu liefern oder dpkg-divert zu verwenden. Das gleiche Ziel lässt sich jedoch erreichen, indem die jeweiligen Komponenten über den Mechanismus live-config.nocomponents deaktiviert werden, siehe oben. Um nicht immer die zu deaktivierenden Komponenten als Boot-Parameter angeben zu müssen, sollte eine Konfigurationsdatei verwendet werden, siehe oben.

Die Konfigurationsdateien für das Live-System selbst werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkonfiguration befindet sich in /usr/share/doc/live-config/examples.

# KOMPONENTEN

**live-config** bietet aktuell die folgenden Komponenten in /usr/lib/live/config:

- **nss-systemd**: Entfernt oder stellt das systemd-NSS-Modul in /etc/nsswitch.conf wieder her, um einen bekannten systemd-Fehler zu umgehen.
- **debconf**: Ermöglicht das Anwenden beliebiger Preseed-Dateien, die auf dem Live-Medium oder einem http/ftp-Server abgelegt sind.
- **hostname**: Konfiguriert /etc/hostname und /etc/hosts.
- **issue-setup**: Erstellt die Datei /etc/issue mit einem Willkommensbanner und Distributionsinformationen.
- **live-debconfig_passwd**: Konfiguriert Benutzer- und Root-Passwörter über live-debconfig.
- **user-setup**: Legt ein Live-Benutzerkonto an.
- **user-groups**: Fügt den Live-Benutzer zu zusätzlichen Gruppen hinzu, die von installierten Modulen deklariert werden. Bereits vorhandene Gruppen, die in `/usr/share/live/config/user-default-groups.d/*.groups` gelistet sind, werden nach der Benutzererstellung und bei späteren live-config-Läufen angewendet.
- **root-setup**: Setzt oder aktualisiert das Root-Passwort und konfiguriert die Root-Umgebung.
- **sudo**: Gewährt dem Live-Benutzer Sudo-Rechte.
- **user-ssh-keys**: Synchronisiert benutzerspezifische `authorized_keys.<username>`-Dateien zwischen dem Live-Medium und den jeweiligen Benutzer-Home-Verzeichnissen. Unterstützt mehrere Benutzer gleichzeitig (z. B. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: Verlinkt oder bind-mountet validierte Benutzerverzeichnisse auf dem vorhandenen beschreibbaren MiniOS-Datenträger, mit sicherer Migration und Rückkopieren bei Deaktivierung.
- **locales**: Konfiguriert Locales.
- **tzdata**: Konfiguriert /etc/timezone.
- **xorg-service**: Konfiguriert den Benutzernamen in xorg.service und wendet X11-Posture an, wenn unterstützt.
- **gdm3**: Konfiguriert Autologin in gdm3.
- **sddm**: Konfiguriert Autologin in sddm.
- **kdm**: Konfiguriert Autologin in kdm.
- **lightdm**: Konfiguriert Autologin in lightdm.
- **lxdm**: Konfiguriert Autologin in lxdm.
- **nodm**: Konfiguriert Autologin in nodm.
- **slim**: Konfiguriert Autologin in slim.
- **xinit**: Konfiguriert Autologin mit xinit.
- **keyboard-configuration**: Konfiguriert die Tastatur.
- **sysvinit**: Konfiguriert Konsolen-Autologin über `/etc/inittab`, wenn sysvinit installiert ist. Die Kurzbefehle `noautologin` und `nottyautologin` unterdrücken diese Einrichtung.
- **sysv-rc**: Konfiguriert sysv-rc durch Deaktivieren gelisteter Dienste.
- **apport**: Deaktiviert apport.
- **gnome-panel-data**: Deaktiviert den Sperrknopf für den Bildschirm.
- **gnome-power-manager**: Deaktiviert den Ruhezustand.
- **gnome-screensaver**: Steuert die GNOME-Bildschirmsperre gemäß `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: Deaktiviert den KDE-Migrationsassistenten (ab Squeeze).
- **kde-services**: Deaktiviert einige unerwünschte KDE-Dienste (ab Squeeze).
- **policykit**: Gewährt Benutzerrechte über PolicyKit.
- **ssl-cert**: Regeneriert SSL-Snakeoil-Zertifikate.
- **xrdp**: Konfiguriert entspannte, gehärtete oder deaktivierte XRDP-Posture, wenn XRDP installiert ist.
- **anacron**: Deaktiviert anacron.
- **util-linux**: Deaktiviert den util-linux-hwclock-Dienst.
- **login**: Deaktiviert lastlog.
- **xserver-xorg**: Konfiguriert xserver-xorg.
- **network**: Konfiguriert dauerhafte kabelgebundene IPv4-Richtlinien über eine sichere NetworkManager-Keyfile oder ifupdown-Stanza. Läuft vor Netzwerkdiensten, validiert alle Werte und stempelt nur nach erfolgreichem Schreiben.
- **openssh-server**: Erstellt OpenSSH-Hostschlüssel neu und schreibt explizit angeforderte Root-Login- oder Passwort-Authentifizierungsrichtlinien.
- **xfce4-panel**: Konfiguriert xfce4-panel auf Standardeinstellungen.
- **xscreensaver**: Steuert die xscreensaver-Sperre gemäß `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: Konfiguriert broadcom-sta-WLAN-Treiber.
- **hyperv**: Konfiguriert X11-Einstellungen zur Verbesserung der Kompatibilität auf Microsoft Hyper-V-Plattformen.
- **ntfs3**: Verwalten von udev-Regeln für NTFS3-Unterstützung.
- **config-module-mode**: Konfiguriert den Systemmodulmodus und aktualisiert Caches, Benutzereinstellungen und dpkg.
- **hooks**: Ermöglicht das Ausführen beliebiger Befehle aus einer Datei auf dem Live-Medium oder einem http/ftp-Server.

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
