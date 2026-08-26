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

Die Spalte „Anwendung“ unterscheidet Parameter, die bei jedem Start akzeptiert werden, von Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Bei Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/configuration/live-config.md).

Diese Tabelle dient als Schnellreferenz. Die Priorität der Quellen und die akzeptierten `from=`-Formen
sind in [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md) definiert,
Modulfilterung in [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md),
Persistenzauswahl in [Initrd-Persistenz](/configuration/Initrd-Persistence.md)
und unterstützte Kombinationen in [Boot-Modi](/configuration/Boot-Modes.md).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht geparst. Eine **`http://` only**-URL hat Vorrang vor `ip=` und startet den [Netzwerk-Boot](/installation/Network-Boot.md) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Behält `.sb`-Kandidaten, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht; Kommas werden zu Alternativen, und ein vollständiger aufsteigender Zahlenbereich wird speziell erweitert. Filtert auch `toram=trim`. Kann Kern- oder Kernelmodule ausschließen und das System unbootbar machen. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht, auch aus `toram=trim`; wird nach `load` angewendet und kann Kern- oder Kernelmodule ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Legt die Bundle-Erweiterung fest. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin die wörtlichen `.sb`-Namen, daher kann eine benutzerdefinierte Erweiterung das `01-kernel`-Modul nicht koordinieren. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | Statische Adresse für frühen Netzwerkzugriff. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-PXE-HTTP-Port **7529**). Eine wörtliche `from=http://...` hat Vorrang vor `ip=` und nutzt deren Adressierungsfelder; andernfalls erzwingt jeder nicht-leere `ip=` den PXE-Daten-Download und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerk-Boot](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerk-Boot (`from=http://…`). Siehe [Netzwerk-Boot](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenzsitzung oder eine Aktion: `resume`, `new` oder `ask`. Ein nicht vorhandener numerischer Selektor kann auf den Metadaten-Standard zurückfallen; er reserviert oder erstellt diese Nummer nicht. Ein Geräte-/Pfad- oder `askdisk`-Form wählt einen anderen Persistenzspeicherort. Für einen benutzerdefinierten Pfad einen durch Doppelpunkt getrennten Suffix verwenden. Ohne Persistenz-Parameter startet MiniOS ohne Persistenz. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Jeder Start | Containergröße für `dynfilefs`, `raw` und `luks`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden in 1000 bzw. 1.000.000 MiB umgerechnet. Das Limit beträgt 1.000.000 MiB, zusätzlich begrenzt durch den verfügbaren Speicher nach `perchreserve`. Der Session Manager begrenzt Raw- und LUKS-Dateien auf 4000 MiB bei FAT32; initrd-LUKS wendet diese Grenze ebenfalls an, aber eine zu große initrd-Raw-Anfrage kann fehlschlagen, statt reduziert zu werden. Neue Raw- und LUKS-Container haben standardmäßig 4000 MiB. Von initramfs erstellte DynFileFS-Container nutzen standardmäßig die verfügbare Kapazität, abgerundet auf 1000 MiB; der Session Manager setzt dafür standardmäßig 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Jeder Start | Freier Speicherplatz in MiB, der auf dem Persistenzgerät freigehalten wird. Neue oder wachsende Container verbrauchen ihn nicht, und MiniOS warnt, wenn der freie Speicher diesen Wert erreicht. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): Ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: Ein erweiterbarer Container, auch auf FAT32, NTFS oder exFAT.<br>`raw`: Ein ext4-Image mit fester Größe.<br>`luks`: Ein LUKS2-verschlüsselter ext4-Container; Erstellung und Entsperrung erfolgen an der Konsole und erfordern Crypt-Unterstützung im initramfs.<br>`squashfs`: Ein vorhandener komprimierter Snapshot, der für die Sitzung entpackt wird. Der Session Manager kann SquashFS-Snapshots vom laufenden System erstellen und speichern; das initramfs kann sie wiederherstellen, aber nicht erstellen. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Jeder Start | Aktiviert den Legacy-Persistenz-Wiederherstellungspfad. Im Gegensatz zu `perchdir=resume` wird kein kompatibler Ersatz automatisch erstellt, wenn keine nutzbare Standardsitzung existiert. | `perch` |
| `toram` | Jeder Start | Reines `toram` ist `full`. Bei Persistenz wird die oberste `*`-Kopie von full ohne Dotfiles erstellt; ohne Persistenz werden `changes` ausgelassen, aber andere oberste Einträge einschließlich Dotfiles kopiert. Trim kopiert erforderliche `config.conf`, reguläre `authorized_keys`, ausgewählte oberste und rekursive Module sowie den vollständigen `changes/`-Baum, wenn Persistenz angefordert wird; es lässt `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Logs, andere Nicht-Modul-Daten und die separate Persistenzmodul-Ebene aus. Keiner der Modi prüft vorher die RAM-Kapazität. Ein in den RAM kopierter Persistenzspeicher ist nicht dauerhaft, Änderungen werden nicht zurückkopiert. Entfernen Sie das Medium erst, nachdem bestätigt wurde, dass Quelle, Loops und Zuordnungen erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Legt die zram-Swap-Größe in MiB fest. Wenn nicht angegeben, berechnet MiniOS sie aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc` oder `zstd`; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt die Kernel-Standardeinstellung erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Legt das Standard-systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgelisteten live-config-Komponenten in der angegebenen Reihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten außer den aufgelisteten aus. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Legt den System-Hostnamen fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den für den Autologin erstellten Benutzernamen fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Setzt das Root-Passwort im Klartext. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Setzt das Root-Passwort als Crypt-Hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Setzt das Benutzerpasswort im Klartext. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Setzt das Benutzerpasswort als Crypt-Hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Legt eine oder mehrere System-Sprachumgebungen fest. | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Legt kommaseparierte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Legt kommaseparierte Tastatur-Varianten entsprechend den Layouts fest. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Berechtigungen vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config Konsolen- und grafischen Autologin einrichtet; bestehende persistente Konfigurationen werden nicht entfernt. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung von Konsolen-Autologin; bestehende persistente Konfigurationen werden nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung von grafischem Autologin; bestehende persistente Konfigurationen werden nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Legt die Xorg-Auflösung anstelle der automatischen Erkennung fest. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | In Verbindung mit `merged` werden Konfigurationsänderungen ins laufende Live-System übernommen. | `module-mode=merged` |
| `hooks` | Jeder Start | Ruft Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs ab und führt sie aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Sicherheitshinweise

Die Kernel-Befehlszeile ist im Klartext und normalerweise in der Bootloader-
Konfiguration, `/proc/cmdline` und in Diagnosen sichtbar. Legen Sie keine wiederverwendbaren Geheimnisse in
`root-password=` oder `user-password=` ab. Verwenden Sie vorzugsweise die entsprechenden `*-crypted`-
Parameter, behandeln Sie aber auch exponierte Passwort-Hashes als vertraulich.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook bietet weder Transport-
verschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad verändern kann,
ihn austauschen kann. Verwenden Sie nur Inhalte und Übertragungswege, denen Sie vertrauen; nutzen Sie
keinen nicht authentifizierten HTTP-Hook für sicherheitskritische Starts.

Trennen Sie Befehle mit Leerzeichen. Weitere Kernel-Parameter, die für alle Linux-Distributionen gelten, finden Sie in den `man bootparam`-Referenzseiten.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/configuration/live-config.md).

Informationen zum Laden von MiniOS über das Netzwerk (PXE und HTTP-ISO) finden Sie unter [Netzwerk-Boot](/installation/Network-Boot.md).
