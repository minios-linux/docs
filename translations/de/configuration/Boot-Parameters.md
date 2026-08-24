# Boot-Parameter

## Verwendung von Boot-Parametern

Boot-Parameter passen den Start von MiniOS an. Trennen Sie die Parameter auf der Kernel-Befehlszeile durch Leerzeichen.

### Syslinux

- Drücken Sie während des MiniOS-Startvorgangs <kbd>Esc</kbd>, um das Boot-Menü aufzurufen.
- Drücken Sie <kbd>Tab</kbd>, um die Boot-Optionen zu bearbeiten.
- Geben Sie die gewünschten Parameter ein und drücken Sie <kbd>Enter</kbd>, um zu starten.

### GRUB

- Drücken Sie <kbd>E</kbd> im GRUB-Menü.
- Bearbeiten Sie die Boot-Parameter am Ende der Befehlszeile.
- Drücken Sie <kbd>F10</kbd>, um mit den neuen Einstellungen zu booten.

## Boot-Parameter

Die Spalte "Anwendung" unterscheidet zwischen Parametern, die bei jedem Start akzeptiert werden, und Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Bei aktivierter Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/configuration/live-config.md).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, Gerät oder ISO. Remote-ISO über **`http://` only** startet den [Netzwerk-Boot](/installation/Network-Boot.md) (httpfs2). | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | Jeder Start | Lädt nur `.sb`-Module, die einem Namen, einer Liste, einem regulären Ausdruck oder einem unterstützten Zahlenbereich entsprechen. Filtert auch Module, die von `toram=trim` kopiert werden. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt passende `.sb`-Module aus, auch aus `toram=trim`. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Legt die Bundle-Erweiterung fest. Standard: `sb`. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | **Nur Netzwerk-Boot (PXE).** Statische Adresse für das frühe Laden. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-HTTP-Port **7529**). Ein nicht-leerer `ip=` erzwingt den PXE-Daten-Download und überspringt lokale Medien. Keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerk-Boot](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MB für HTTP-ISO-Netzwerk-Boot (`from=http://…`). Siehe [Netzwerk-Boot](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenz-Sitzung oder eine Aktion: `resume`, `new` oder `ask`. Ein Gerät/Pfad oder die Form `askdisk` wählt einen anderen Persistenz-Speicherort. Ohne Persistenz-Parameter startet MiniOS ohne gespeicherte Änderungen. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | Jeder Start | Containergröße für `dynfilefs`, `raw` und `luks`; gilt nicht für `native` oder `squashfs`. Akzeptiert eine Ganzzahl in MB oder ein `M`/`MB`, `G`/`GB` oder `T`/`TB`-Suffix; GB und TB werden als 1000 MB bzw. 1.000.000 MB umgerechnet. Das Limit beträgt 1.000.000 MB, zusätzlich begrenzt durch den verfügbaren Speicherplatz nach `perchreserve`; Raw- und LUKS-Dateien sind auf FAT32 auf 4000 MB begrenzt. Neue Raw- und LUKS-Container haben standardmäßig 4000 MB. DynFileFS, das vom Initramfs erstellt wird, nutzt standardmäßig die verfügbare Kapazität, abgerundet auf 1000 MB; der Session Manager setzt standardmäßig 4000 MB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Jeder Start | Freier Speicherplatz in MiB, der auf dem Persistenzgerät freigehalten wird. Neue oder wachsende Container nutzen diesen nicht, und MiniOS warnt, wenn der freie Speicher diesen Wert erreicht. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: ein erweiterbarer Container, auch auf FAT32, NTFS oder exFAT.<br>`raw`: ein ext4-Abbild mit fester Größe.<br>`luks`: ein LUKS2-verschlüsselter ext4-Container; Erstellung und Entsperrung erfolgen an der Konsole und erfordern Crypt-Unterstützung im Initramfs.<br>`squashfs`: ein vorhandener komprimierter Snapshot, der für die Sitzung entpackt wird. Der Session Manager kann SquashFS-Snapshots vom laufenden System erstellen und speichern; das Initramfs kann sie wiederherstellen, aber nicht erstellen. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Jeder Start | Aktiviert Persistenz und setzt die letzte Sitzung fort. Entspricht `perchdir=resume`. | `perch` |
| `toram` | Jeder Start | Kopiert MiniOS in den RAM. Ohne Wert wird `full` verwendet; `full` kopiert das gesamte MiniOS-Verzeichnis, während `trim` die von `load` und `noload` ausgewählte Modulsammlung kopiert. Persistente Änderungen werden einbezogen, wenn Persistenz aktiviert ist. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Legt die zram-Swap-Größe in MiB fest. Wenn nicht angegeben, berechnet MiniOS sie aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc` oder `zstd`; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt der Kernel-Standard erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Legt das Standard-Systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert die automatische Bildschirmauflösungsanpassung in virtuellen Maschinen. Der XFCE-Standard ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgelisteten live-config-Komponenten in der angegebenen Reihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten außer den aufgelisteten aus. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Legt den System-Hostnamen fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den für den Autologin erstellten Benutzernamen fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Legt das Root-Passwort im Klartext fest. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Legt das Root-Passwort als Crypt-Hash fest. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Legt das Benutzerpasswort im Klartext fest. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Legt das Benutzerpasswort als Crypt-Hash fest. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Legt eine oder mehrere System-Sprachumgebungen fest. | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Legt durch Kommas getrennte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Legt durch Kommas getrennte Tastaturvarianten entsprechend den Layouts fest. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Rechte vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config Konsole- und grafischen Autologin einrichtet; bestehende persistente Konfiguration bleibt erhalten. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung des Konsolen-Autologins; bestehende persistente Konfiguration bleibt erhalten. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung des grafischen Autologins; bestehende persistente Konfiguration bleibt erhalten. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Legt die Xorg-Auflösung anstelle der automatischen Erkennung fest. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | Integriert mit `merged` Konfigurationsänderungen in das laufende Live-System. | `module-mode=merged` |
| `hooks` | Jeder Start | Lädt und führt Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Trennen Sie Befehle durch Leerzeichen. Weitere Kernel-Parameter, die für alle Linux-Distributionen gelten, finden Sie in den Referenzseiten zu `man bootparam`.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/configuration/live-config.md).

Informationen zum Laden von MiniOS über das Netzwerk (PXE und HTTP-ISO) finden Sie unter [Netzwerk-Boot](/installation/Network-Boot.md).
