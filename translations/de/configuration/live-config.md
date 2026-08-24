# LIVE-CONFIG

**live-config** – Systemkonfigurations-Komponenten

**live-config** enthält die Komponenten, die ein Live-System während des Bootvorgangs (spätes Userspace) konfigurieren.

**live-config** kann über Boot-Parameter oder Konfigurationsdateien gesteuert werden. Falls beide Mechanismen für eine bestimmte Option verwendet werden, haben die Boot-Parameter Vorrang vor den Konfigurationsdateien. Bei Verwendung von Persistenz werden **live-config**-Komponenten nur einmal ausgeführt.

Wenn *live-build*(7) zum Erstellen des Live-Systems verwendet wird, können die standardmäßig genutzten live-config-Parameter über die Option `--bootappend-live` gesetzt werden, siehe Handbuchseite *lb_config*(1).

## Boot-Parameter (Komponenten)

**live-config** wird nur aktiviert, wenn `boot=live` als Boot-Parameter verwendet wird. Zusätzlich muss **live-config** mitgeteilt werden, welche Komponenten ausgeführt werden sollen, über den Parameter `live-config.components`, oder welche Komponenten nicht ausgeführt werden sollen, über den Parameter `live-config.nocomponents`. Wenn sowohl `live-config.components` als auch `live-config.nocomponents` verwendet werden, oder einer der beiden mehrfach angegeben wird, hat immer der zuletzt angegebene Vorrang vor den vorherigen.

- **live-config.components | components**: Alle Komponenten werden ausgeführt. Dies ist die Standard-Einstellung für Live-Images.
- **live-config.components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | components=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Es werden nur die angegebenen Komponenten ausgeführt. Beachten Sie, dass die Reihenfolge wichtig ist, z. B. würde `live-config.components=sudo,user-setup` nicht funktionieren, da der Benutzer zuerst angelegt werden muss, bevor sudo konfiguriert werden kann. Die Reihenfolge kann anhand der Dateinamen der Komponenten in `/usr/lib/live/config` nachvollzogen werden.
- **live-config.nocomponents | nocomponents**: Es wird keine Komponente ausgeführt. Dies entspricht dem Nichtverwenden von `live-config.components` oder `live-config.nocomponents`.
- **live-config.nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn | nocomponents=KOMPONENTE1,KOMPONENTE2,...KOMPONENTEn**: Alle Komponenten werden ausgeführt, außer den angegebenen.

## Boot-Parameter (Optionen)

Einige einzelne Komponenten können ihr Verhalten durch einen Boot-Parameter ändern.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Ermöglicht das Abrufen und Anwenden einer oder mehrerer debconf-Preseed-Dateien, die auf die debconf-Datenbank angewendet werden. Die URLs müssen dabei von wget abrufbar sein (http, ftp oder file://). Liegt die Datei auf dem Live-Medium, kann sie mit `file:///run/initramfs/memory/data/DATEI` oder mit `file:///DATEI` abgerufen werden, falls sie sich im Root-Dateisystem des Live-Systems befindet. Alle Preseed-Dateien in `/usr/lib/live/config-preseed/` im Root-Dateisystem des Live-Systems können automatisch mit dem Schlüsselwort `filesystem` aktiviert werden. Alle Preseed-Dateien in `/minios/config-preseed/` auf dem Live-Medium können automatisch mit dem Schlüsselwort `medium` aktiviert werden. Werden mehrere Mechanismen kombiniert, werden zuerst die Preseed-Dateien aus dem Dateisystem angewendet, dann die vom Medium und zuletzt die aus dem Netzwerk.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Legt den Hostnamen des Systems fest. Standard ist `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Legt den Benutzernamen fest, der für den Autologin erstellt wird. Standard ist `live`.
- **live-config.user-default-groups=GRUPPE1,GRUPPE2,...GRUPPEn | user-default-groups=GRUPPE1,GRUPPE2,...GRUPPEn**: Legt die Standardgruppen für Benutzer fest, die für den Autologin erstellt werden. Standard ist `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="BENUTZERVOLLNAME" | user-fullname="BENUTZERVOLLNAME"**: Legt den vollständigen Namen des Benutzers fest, der für den Autologin erstellt wird. In MiniOS ist der Standard `MiniOS Live user`.
- **live-config.root-password=PASSWORT | root-password=PASSWORT**: Setzt das Root-Passwort im Klartext.
- **live-config.root-password-crypted=PASSWORT | root-password-crypted=PASSWORT**: Setzt das Root-Passwort in verschlüsselter Form.
- **live-config.user-password=PASSWORT | user-password=PASSWORT**: Setzt das Benutzerpasswort im Klartext.
- **live-config.user-password-crypted=PASSWORT | user-password-crypted=PASSWORT**: Setzt das Benutzerpasswort in verschlüsselter Form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Legt die Locale des Systems fest, z. B. `de_CH.UTF-8`. Standard ist `en_US.UTF-8`. Falls die gewählte Locale noch nicht verfügbar ist, wird sie automatisch generiert.
- **live-config.timezone=ZEITZONE | timezone=ZEITZONE**: Legt die Zeitzone des Systems fest, z. B. `Europe/Zurich`. Standard ist `UTC`.
- **live-config.keyboard-model=TASTATUR_MODELL | keyboard-model=TASTATUR_MODELL**: Ändert das Tastaturmodell. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-layouts=TASTATUR_LAYOUT1,TASTATUR_LAYOUT2,...TASTATUR_LAYOUTn | keyboard-layouts=TASTATUR_LAYOUT1,TASTATUR_LAYOUT2,...TASTATUR_LAYOUTn**: Ändert die Tastaturlayouts. Wenn mehrere angegeben werden, können diese unter X11 über die Werkzeuge der Desktop-Umgebung gewechselt werden. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-variants=TASTATUR_VARIANTE1,TASTATUR_VARIANTE2,...TASTATUR_VARIANTEn | keyboard-variants=TASTATUR_VARIANTE1,TASTATUR_VARIANTE2,...TASTATUR_VARIANTEn**: Ändert die Tastaturvarianten. Wenn mehrere angegeben werden, sollte die Anzahl der Werte der der Tastaturlayouts entsprechen, da sie eins zu eins in der angegebenen Reihenfolge zugeordnet werden. Leere Werte sind erlaubt. Die Werkzeuge der Desktop-Umgebung erlauben das Umschalten zwischen den jeweiligen Layout- und Variantenpaaren unter X11. Es ist kein Standardwert gesetzt.
- **live-config.keyboard-options=TASTATUR_OPTIONEN | keyboard-options=TASTATUR_OPTIONEN**: Ändert die Tastaturoptionen. Es ist kein Standardwert gesetzt.
- **live-config.sysv-rc=DIENST1,DIENST2,...DIENSTn | sysv-rc=DIENST1,DIENST2,...DIENSTn**: Deaktiviert sysv-Dienste über update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Legt fest, ob das System davon ausgeht, dass die Hardware-Uhr auf UTC gestellt ist. Standard ist `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Legt den x-session-manager über update-alternatives fest.
- **live-config.xorg-driver=XORG_TREIBER | xorg-driver=XORG_TREIBER**: Legt den xorg-Treiber fest, anstatt ihn automatisch zu erkennen. Falls eine PCI-ID in `/usr/share/live/config/xserver-xorg/*TREIBER*.ids` im Live-System angegeben ist, wird *TREIBER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.xorg-resolution=XORG_AUFLÖSUNG | xorg-resolution=XORG_AUFLÖSUNG**: Legt die xorg-Auflösung fest, z. B. 1024x768, anstatt sie automatisch zu erkennen.
- **live-config.wlan-driver=WLAN_TREIBER | wlan-driver=WLAN_TREIBER**: Legt den WLAN-Treiber fest, anstatt ihn automatisch zu erkennen. Falls eine PCI-ID in `/usr/share/live/config/broadcom-sta/*TREIBER*.ids` im Live-System angegeben ist, wird *TREIBER* für diese Geräte erzwungen. Wenn sowohl ein Boot-Parameter als auch ein Override gefunden werden, hat der Boot-Parameter Vorrang.
- **live-config.module-mode=MODUS | module-mode=MODUS**: Erlaubt die Angabe des Modulmodus für die Live-Konfiguration. Wenn auf "merged" gesetzt, aktualisiert das System Benutzerkonten, baut Caches neu auf und aktualisiert Paket-Einstellungen, sodass Konfigurationsänderungen dynamisch in das laufende System integriert werden.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Ermöglicht das Abrufen und Ausführen einer oder mehrerer beliebiger Dateien. Die URLs müssen von wget abrufbar sein (http, ftp oder file://), die Dateien werden im /tmp des laufenden Live-Systems ausgeführt und benötigen alle Abhängigkeiten bereits installiert, z. B. muss Python installiert sein, wenn ein Python-Skript ausgeführt werden soll. Einige Hooks für typische Anwendungsfälle sind unter `/usr/share/doc/live-config/examples/hooks/` verfügbar. Liegt die Datei auf dem Live-Medium, kann sie mit `file:///run/initramfs/memory/data/DATEI` oder mit `file:///DATEI` abgerufen werden, falls sie sich im Root-Dateisystem des Live-Systems befindet. Alle Hooks in `/usr/lib/live/config-hooks/` im Root-Dateisystem des Live-Systems können automatisch mit dem Schlüsselwort `filesystem` aktiviert werden. Alle Hooks in `/minios/config-hooks/` auf dem Live-Medium können automatisch mit dem Schlüsselwort `medium` aktiviert werden. Werden mehrere Mechanismen kombiniert, werden zuerst die Hooks aus dem Dateisystem ausgeführt, dann die vom Medium und zuletzt die aus dem Netzwerk.

## Boot-Parameter (Kurzbefehle)

Für einige häufige Anwendungsfälle, bei denen mehrere Einzelparameter kombiniert werden müssten, stellt **live-config** Kurzbefehle bereit. So bleibt die volle Kontrolle über alle Optionen erhalten und die Bedienung wird dennoch vereinfacht.

- **live-config.noroot | noroot**: Deaktiviert sudo und policykit, der Benutzer kann keine Root-Rechte auf dem System erlangen.
- **live-config.noautologin | noautologin**: Deaktiviert sowohl den automatischen Konsolen-Login als auch den grafischen Autologin.
- **live-config.nottyautologin | nottyautologin**: Deaktiviert den automatischen Login auf der Konsole, ohne den grafischen Autologin zu beeinflussen.
- **live-config.nox11autologin | nox11autologin**: Deaktiviert den automatischen Login mit einem Display-Manager, ohne den tty-Autologin zu beeinflussen.

## Boot-Parameter (Spezialoptionen)

Für spezielle Anwendungsfälle gibt es einige besondere Boot-Parameter.

- **live-config.debug | debug**: Aktiviert die Debug-Ausgabe in live-config.

## Konfigurationsdateien

**live-config** kann über Konfigurationsdateien konfiguriert (aber nicht aktiviert) werden. Alles außer den Shortcuts, die über einen Boot-Parameter konfiguriert werden können, lässt sich alternativ auch über eine oder mehrere Dateien einstellen. Wird die Konfiguration über Dateien vorgenommen, ist der Parameter `boot=live` dennoch erforderlich, um **live-config** zu aktivieren.

**Hinweis:** Wenn Konfigurationsdateien verwendet werden, sollten vorzugsweise alle Boot-Parameter in die Variable **LIVE_CONFIG_CMDLINE** geschrieben werden, alternativ können auch einzelne Variablen gesetzt werden. Bei Verwendung einzelner Variablen muss der Nutzer sicherstellen, dass alle notwendigen Variablen gesetzt sind, um eine gültige Konfiguration zu erzeugen.

Konfigurationsdateien können entweder im Root-Dateisystem selbst (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`) oder auf dem Live-Medium (`minios/config.conf`, `minios/config.conf.d/*.conf`) abgelegt werden. Falls für eine bestimmte Option beide Orte verwendet werden, haben die Dateien vom Live-Medium Vorrang vor denen aus dem Root-Dateisystem.

Obwohl die Konfigurationsdateien in den Konfigurationsverzeichnissen keinen bestimmten Namen haben müssen, wird aus Gründen der Konsistenz empfohlen, entweder das Schema `vendor.conf` oder `project.conf` zu verwenden (wobei `vendor` oder `project` durch den tatsächlichen Namen ersetzt wird, z. B. `progress-linux.conf`).

Der eigentliche Inhalt der Konfigurationsdateien besteht aus einer oder mehreren der folgenden Variablen:

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Diese Variable entspricht der Bootloader-Kommandozeile.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem Parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Diese Variable entspricht dem Parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem Parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Diese Variable entspricht dem Parameter `**live-config.hostname**=*HOSTNAME*`. Standard ist `minios`.
- **LIVE_USERNAME=USERNAME**: Diese Variable entspricht dem Parameter `**live-config.username**=*USERNAME*`. Standard ist `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Diese Variable entspricht dem Parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Diese Variable entspricht dem Parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.root-password**=*PASSWORD*`. Sie legt das Root-Passwort im Klartext fest.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.root-password-crypted**=*PASSWORD*`. Sie legt das Root-Passwort in verschlüsselter Form fest.
- **LIVE_USER_PASSWORD=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.user-password**=*PASSWORD*`. Sie legt das Benutzerpasswort im Klartext fest.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Diese Variable entspricht dem Parameter `**live-config.user-password-crypted**=*PASSWORD*`. Sie legt das Benutzerpasswort in verschlüsselter Form fest.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Diese Variable entspricht dem Parameter `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Diese Variable entspricht dem Parameter `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Diese Variable entspricht dem Parameter `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Diese Variable entspricht dem Parameter `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Diese Variable entspricht dem Parameter `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Diese Variable entspricht dem Parameter `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Diese Variable entspricht dem Parameter `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Diese Variable entspricht dem Parameter `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Diese Variable entspricht dem Parameter `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Diese Variable entspricht dem Parameter `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Diese Variable entspricht dem Parameter `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Diese Variable entspricht dem Parameter `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Diese Variable entspricht dem Parameter `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Diese Variable entspricht dem Parameter `**live-config.link-user-dirs**=true|false`. Sie verlinkt die Standard-Datenverzeichnisse des Benutzers mit dem beschreibbaren MiniOS-Laufwerk. Sie kann nicht mit Bind-Modus oder einem beliebigen `toram`-Modus kombiniert werden.
- **LIVE_BIND_USER_DIRS=true|false**: Diese Variable entspricht dem Parameter `**live-config.bind-user-dirs**=true|false`. Sie bindet die Standard-Datenverzeichnisse des Benutzers vom beschreibbaren MiniOS-Laufwerk ein. Sie kann nicht mit Link-Modus oder einem beliebigen `toram`-Modus kombiniert werden.
- **LIVE_USER_DIRS_PATH=PATH**: Diese Variable entspricht dem Parameter `**live-config.user-dirs-path**=*PATH*`. Sie gibt einen sicheren Pfad innerhalb des FAT32-, exFAT- oder NTFS-MiniOS-Laufwerks an. Standard ist `/minios/userdata`; Segmente mit Punkt oder Elternverzeichnis werden abgelehnt.

Beim Einrichten von Benutzermedien werden niemals automatisch zwei nicht-leere Verzeichnisse zusammengeführt. Ein lokales, nicht-leeres Verzeichnis wird nur migriert, wenn das Zielmedium leer ist. Ist die Funktion deaktiviert, werden verwaltete Mediendaten vor dem Entfernen der Links zurückkopiert. Ein fehlgeschlagener Validierungs- oder Kopiervorgang belässt die bestehenden Benutzerverzeichnisse unverändert und protokolliert den Grund in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Diese Variable enthält den Zustand, der durch den Parameter `live-config.module-mode` (oder `module-mode`) festgelegt wird. Ist sie auf "merged" gesetzt, übernimmt das Live-System Aktualisierungen (über minios-update-users, minios-update-cache und minios-update-dpkg), um benutzerdefinierte Konfigurationen mit der Basisumgebung zu verschmelzen.
- **LIVE_CONFIG_DEBUG=true|false**: Diese Variable entspricht dem Parameter `**live-config.debug**`.

# ANPASSUNG

**live-config** lässt sich einfach für Downstream-Projekte oder den lokalen Einsatz anpassen.

## Hinzufügen neuer Konfigurationskomponenten

Downstream-Projekte können ihre Komponenten in /usr/lib/live/config ablegen und müssen nichts weiter tun, die Komponenten werden beim Booten automatisch ausgeführt.

Die Komponenten werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkomponente befindet sich in /usr/share/doc/live-config/examples.

## Entfernen vorhandener Konfigurationskomponenten

Es ist derzeit nicht wirklich möglich, Komponenten auf sinnvolle Weise zu entfernen, ohne entweder ein lokal angepasstes **live-config**-Paket zu liefern oder dpkg-divert zu verwenden. Das gleiche Ziel kann jedoch erreicht werden, indem die jeweiligen Komponenten über den Mechanismus live-config.nocomponents deaktiviert werden (siehe oben). Um zu vermeiden, dass deaktivierte Komponenten immer über den Boot-Parameter angegeben werden müssen, sollte eine Konfigurationsdatei verwendet werden (siehe oben).

Die Konfigurationsdateien für das Live-System selbst werden am besten in ein eigenes Debian-Paket gepackt. Ein Beispielpaket mit einer Beispielkonfiguration befindet sich in /usr/share/doc/live-config/examples.

# KOMPONENTEN

**live-config** bietet aktuell folgende Komponenten in /usr/lib/live/config:

- **nss-systemd**: Entfernt oder stellt das systemd-NSS-Modul in /etc/nsswitch.conf wieder her, um einen bekannten systemd-Fehler zu umgehen.
- **debconf**: Ermöglicht das Anwenden beliebiger Preseed-Dateien, die auf dem Live-Medium oder einem http/ftp-Server abgelegt sind.
- **hostname**: Konfiguriert /etc/hostname und /etc/hosts.
- **issue-setup**: Erstellt die Datei /etc/issue mit einem Willkommens-Banner und Distributionsinformationen.
- **live-debconfig (passwd)**: Konfiguriert Benutzer- und Root-Passwörter über live-debconfig.
- **user-setup**: Legt ein Live-Benutzerkonto an.
- **root-setup**: Setzt oder aktualisiert das Root-Passwort und konfiguriert die Root-Umgebung.
- **sudo**: Gewährt dem Live-Benutzer sudo-Rechte.
- **user-media**: Konfiguriert das Einbinden von Medien und das Verlinken oder Binden von Benutzerverzeichnissen für persistente Daten.
- **user-ssh-keys**: Synchronisiert SSH-Schlüssel aus benutzerspezifischen `authorized_keys.<username>`-Dateien auf dem Live-Medium in die jeweiligen Home-Verzeichnisse der Benutzer. Unterstützt mehrere Benutzer gleichzeitig (z. B. `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: Konfiguriert Locales.
- **tzdata**: Konfiguriert /etc/timezone.
- **xorg-service**: Konfiguriert den Benutzernamen in xorg.service.
- **gdm3**: Konfiguriert Autologin in gdm3.
- **kdm**: Konfiguriert Autologin in kdm.
- **lightdm**: Konfiguriert Autologin in lightdm.
- **lxdm**: Konfiguriert Autologin in lxdm.
- **nodm**: Konfiguriert Autologin in nodm.
- **slim**: Konfiguriert Autologin in slim.
- **xinit**: Konfiguriert Autologin mit xinit.
- **keyboard-configuration**: Konfiguriert die Tastatur.
- **sysvinit**: Konfiguriert sysvinit.
- **sysv-rc**: Konfiguriert sysv-rc durch Deaktivieren aufgelisteter Dienste.
- **login**: Deaktiviert lastlog.
- **anacron**: Deaktiviert anacron.
- **util-linux**: Deaktiviert hwclock von util-linux.
- **apport**: Deaktiviert apport.
- **gnome-panel-data**: Deaktiviert die Sperrtaste für den Bildschirm.
- **gnome-power-manager**: Deaktiviert den Ruhezustand.
- **gnome-screensaver**: Deaktiviert den Bildschirmschoner mit Sperrfunktion.
- **kaboom**: Deaktiviert den KDE-Migrationsassistenten (squeeze und neuer).
- **kde-services**: Deaktiviert einige unerwünschte KDE-Dienste (squeeze und neuer).
- **policykit**: Gewährt Benutzerrechte über policykit.
- **ssl-cert**: Regeneriert SSL snake-oil-Zertifikate.
- **xrdp**: Konfiguriert xrdp für Remote-Desktop-Verbindungen.
- **xfce4-panel**: Setzt xfce4-panel auf die Standard-Einstellungen.
- **xscreensaver**: Deaktiviert den Bildschirmschoner mit Sperrfunktion.
- **broadcom-sta**: Konfiguriert broadcom-sta WLAN-Treiber.
- **xserver-xorg**: Konfiguriert xserver-xorg.
- **openssh-server**: Erstellt die Host-Keys für openssh-server neu.
- **hyperv**: Konfiguriert X11-Einstellungen zur Verbesserung der Kompatibilität auf Microsoft Hyper-V-Plattformen.
- **ntfs3**: Verwalten von udev-Regeln für NTFS3-Unterstützung.
- **config-module-mode**: Konfiguriert den Systemmodulmodus und aktualisiert Caches, Benutzereinstellungen und dpkg.
- **hooks**: Ermöglicht das Ausführen beliebiger Befehle aus einer Datei, die auf dem Live-Medium oder einem http/ftp-Server abgelegt ist.

# DATEIEN

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

# WEITERE INFORMATIONEN

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# PROJEKTSEITE

Weitere Informationen zu **minios-live-config** und dem MiniOS-Projekt finden Sie unter [minios.dev](https://minios.dev) und im [GitHub-Repository](https://github.com/minios-linux/minios-live).

# FEHLER

Fehler können gemeldet werden, indem ein Issue im GitHub-Repository unter [MiniOS Issues](https://github.com/minios-linux/minios-live/issues) eingereicht wird.

# AUTOR

**live-config** wurde ursprünglich von Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)) geschrieben. Seit 2016 wird die Entwicklung vom Debian Live Team fortgeführt. Seit 2025 wird die Entwicklung der angepassten **minios-live-config**-Version vom MiniOS Live Team weitergeführt.
