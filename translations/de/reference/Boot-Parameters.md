---
updated: 2026-10-15
---

# Boot-Parameter

## Verwendung von Boot-Parametern

Boot-Parameter passen an, wie MiniOS startet. Trennen Sie die Parameter mit Leerzeichen auf der Kernel-Befehlszeile.

### Syslinux

- Drücken Sie <kbd>Esc</kbd> während der MiniOS-Startsequenz, um das Boot-Menü aufzurufen.
- Drücken Sie <kbd>Tab</kbd> um die Boot-Optionen zu bearbeiten.
- Geben Sie die Parameter ein und drücken Sie <kbd>Enter</kbd> um zu starten.

### GRUB

- Drücken Sie <kbd>E</kbd> im GRUB-Menü.
- Bearbeiten Sie die Boot-Parameter am Ende der Befehlszeile.
- Drücken Sie <kbd>F10</kbd> um mit den neuen Einstellungen zu starten.

## Boot-Parameter

Die Spalte „Anwendung“ unterscheidet Parameter, die bei jedem Systemstart akzeptiert werden, von Kontoeinstellungen, die nur bei der Ersteinrichtung verwendet werden. Bei aktivierter Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als Schnellreferenz. Die Priorität der Quellen und akzeptierte `from=` Formate sind definiert in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), die Modulfilterung in [Initrd-Modulladen](/reference/boot-process/Module-Loading), die Persistenz-Auswahl in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und unterstützte Kombinationen in [Boot-Modi](/using-minios/Boot-Modes).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht ausgewertet. Ein wörtliches **`http://` nur** URL hat Vorrang vor `ip=` und startet den [Netzwerk-Boot](/reference/boot-process/Network-Boot) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Behält `.sb`-Kandidaten bei, deren Pfad mit einem nicht verankerten erweiterten regulären Ausdruck übereinstimmt; Kommas werden als Alternativen interpretiert und ein vollständiger aufsteigender Zahlenbereich wird speziell erweitert. Filtert außerdem `toram=trim`. Es können dadurch Kern- oder Kernelmodule ausgeschlossen werden, was das System unbootbar machen kann. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad mit einem nicht verankerten erweiterten regulären Ausdruck übereinstimmt, auch aus `toram=trim`; dies wird nach `load` angewendet und kann Kern- oder Kernelmodule ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Setzt die Bundle-Erweiterung. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin den wörtlichen `.sb`-Namen, daher kann eine benutzerdefinierte Erweiterung die `01-kernel`-Modul-Koordination nicht übernehmen. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | Statische Adresse für den frühen Netzwerkabruf. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-PXE-HTTP-Port **7529**). Ein wörtliches `from=http://...` hat Vorrang vor `ip=` und verwendet dessen Adressfelder; andernfalls erzwingt jeder nicht-leere `ip=` den PXE-Datenabruf und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerk-Boot (`from=http://…`). Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenz-Sitzung oder eine Aktion aus. `resume` öffnet die standardmäßig kompatible Sitzung; `setup` wählt interaktiv das Speicher-Backend und erstellt dann eine neue nummerierte Sitzung; `new` erstellt direkt eine neue Sitzung anhand des gewünschten/Standard-`perchmode`-, Verschlüsselungs-, Komprimierungs- und Größeneinstellungen; `ask` bietet gespeicherte Sitzungen an und startet automatisch die Einrichtung, wenn keine vorhanden sind. Ein nicht vorhandener numerischer Selektor kann auf den Standardwert der Metadaten zurückfallen; er reserviert oder erstellt diese Nummer nicht. Ein Geräte-/Pfadname oder `askdisk`-Form wählt einen anderen Persistenzspeicher aus. Für einen benutzerdefinierten Pfad kann ein Doppelpunkt-Suffix verwendet werden. Ohne Persistenz-Parameter startet MiniOS ohne gespeicherte Daten. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Jeder Start | Logische Containergröße für `dynfilefs`, `dynblk`, `vmdk`, und `raw`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden zu 1000 bzw. 1.000.000 MiB umgerechnet. Ohne explizite Größe nutzen initrd-erstellte DynFileFS, DynBlk und VMDK-Sitzungen bis zu 16 GiB und reduzieren diesen Standardwert, wenn nach `perchreserve` weniger Speicherplatz verfügbar ist; DynFileFS berücksichtigt zusätzlich den Index-Overhead und das RAM-Limit. DynBlk fragt das installierte Backend-Limit mit `dynblk limits --format dynblk` ab (bzw. mit `--format vmdk` für VMDK); es gibt keine separate 512-GiB-Grenze. DynFileFS-Nutzdaten und DynBlk-Backingspeicher wachsen bei Bedarf, während DynFileFS auch Indizes für die deklarierte logische Kapazität reserviert. Roh-Anforderungen sind auf 1.000.000 MiB und den verfügbaren Speicher nach `perchreserve` begrenzt; Raw ist auf FAT32 – unabhängig von Verschlüsselung – auf 4000 MiB limitiert. Neue Raw-Container haben standardmäßig 4000 MiB. Der MiniOS-Sitzungsmanager verwendet für manuell erstellte DynFileFS-Container weiterhin 4000 MiB und DynBlk/VMDK 16 GiB als Standard. Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für Backend-Speicher- und Speicherverhalten. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Jeder Start | Zuweisungsmarge und Warnschwelle für wenig Speicherplatz in MiB. Sie wird beim Anlegen oder Vergrößern neuer Container abgezogen, ist aber kein Laufzeit-Kontingent und verhindert nicht, dass spätere Schreibvorgänge das Gerät füllen. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): Ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: Das FUSE-basierte, erweiterbare Format-400-Containerformat, auch auf FAT32, NTFS oder exFAT.<br>`dynblk`: Ein separates Format-1-Kernel-Blockgerät, das durch Thin-`volumeNNN.db`-Dateien unterstützt wird; die tatsächliche `/dev/dynblkN`-Nummer wird dynamisch zugewiesen und mehrere Volumes können koexistieren.<br>`vmdk`: Standardmäßig geteilte, sparse `volume.vmdk` / `volume-sNNN.vmdk`-Dateien, bereitgestellt durch den DynBlk-Treiber; keine Komprimierung. Erfordert die versionierte `vmdk-session-v1`-initrd-Funktion.<br>`raw`: Ein ext4-Image mit fester Größe.<br>`squashfs`: Ein komprimierter Schnappschuss, der in eine RAM-gestützte obere Schicht entpackt wird. Die Initrd-Einrichtung erstellt nur Metadaten der Generation Null; das laufende System erzeugt den ersten Schnappschuss bei Bedarf oder beim Herunterfahren. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Nur bei Erstellung | Optionale Verschlüsselungsschicht für eine neu erstellte `raw`, `dynfilefs`, `dynblk`, oder `vmdk`-Sitzung. `perchencrypt=luks` erfordert die versionierte `luks-layer-v1`-initramfs-Funktion. Bestehende Sitzungen leiten die Verschlüsselung nur von `session_encryption[N]` ab, daher interpretiert oder konvertiert dieser Parameter diese nicht. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Nur bei Erstellung | Wählt die DynBlk-Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`. Der gewählte Kernel-Codec muss verfügbar sein. Wenn `perchencrypt=luks` DynBlk umschließt, erzwingt MiniOS die Komprimierung von DynBlk auf `none`. VMDK unterstützt keine Komprimierung: Beim Booten wird ein nicht-`none`-Codec mit einer Warnung ignoriert. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Jeder Start | Aktiviert den Legacy-Persistenz-Wiederaufnahmeweg. Im Gegensatz zu `perchdir=resume` wird kein kompatibler Ersatz automatisch erstellt, wenn keine nutzbare Standardsitzung vorhanden ist. | `perch` |
| `toram` | Jeder Start | Steuert das Kopieren der MiniOS **Systemdaten** nach RAM. Nur `toram` ist `full`; `trim` kopiert die erforderliche Konfiguration und die ausgewählte Modulauswahl, lässt jedoch nicht benötigte Quelldaten weg. Das Kopieren der Persistenz wird separat über `perchtoram` gesteuert. Wenn Persistenz angefordert wird und `perchtoram` nicht angegeben ist, setzt jeder aktive `toram`-Modus das Kopieren der Persistenz standardmäßig auf `trim`. Entfernen Sie das Medium erst, nachdem Sie bestätigt haben, dass die ursprüngliche Quelle, Loops, Zuordnungen und ggf. benötigter Persistenzspeicher erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Jeder Start mit Persistenz | `off` behält den ursprünglichen Speicher; `trim` kopiert die ausgewählte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung; `full` kopiert alle unterstützten Container/Snapshots und passende Metadaten. Standard: `trim` mit System-`toram`, sonst `off`. Dies fordert nicht automatisch Persistenz an. Native Daten werden nicht kopiert: Eine erfolgreiche native RAM-Anforderung startet einen neuen leeren Container, außer beim Zurücksetzen, das das Kopieren deaktiviert. Bei fehlgeschlagenem Kopieren bleibt der Betrieb auf dem Speicher erhalten. RAM-Änderungen müssen im ursprünglichen beschreibbaren Speicher oder als neue Sitzung gespeichert werden. Wird beim gewählten Ventoy-Persistence-Plugin-Backend ignoriert. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Legt die zram-Swap-Größe in MiB fest. Wenn nicht angegeben, berechnet MiniOS diese aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oder `zstd`; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt der Kernel-Standard erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Legt das Standard-systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Booten. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Booten. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgelisteten live-config-Komponenten in der angegebenen Reihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten außer den aufgelisteten aus. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Legt den System-Hostnamen fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den Benutzernamen für die automatische Anmeldung fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Legt das Root-Passwort im Klartext fest. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Legt das Root-Passwort als Crypt-Hash fest. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Legt das Benutzerpasswort im Klartext fest. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Legt das Benutzerpasswort als Crypt-Hash fest. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Legt eine oder mehrere System-Sprachumgebungen fest. | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Legt durch Komma getrennte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Legt durch Komma getrennte Tastaturvarianten entsprechend den Layouts fest. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Rechte vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config die automatische Anmeldung an Konsole und Grafik einrichtet; bestehende persistente Konfigurationen werden nicht entfernt. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung der automatischen Anmeldung an der Konsole; bestehende persistente Konfigurationen werden nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung der grafischen automatischen Anmeldung; bestehende persistente Konfigurationen werden nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung aus. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Legt die Xorg-Auflösung anstelle der automatischen Erkennung fest. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | Mit `merged` werden Konfigurationsänderungen ins laufende Live-System übernommen. | `module-mode=merged` |
| `link-user-dirs` | Jeder Start | Verknüpft die verwalteten Benutzerverzeichnisse mit beschreibbaren MiniOS-Medien. Dies ist nicht kombinierbar mit `bind-user-dirs` und nicht verfügbar mit einem beliebigen `toram`-Modus oder wenn die aktive Persistenzsitzung LUKS-verschlüsselt ist. Die aktive Verschlüsselung wird aus der laufenden Sitzung ermittelt, nicht aus der `perchencrypt`-Erstellungsanfrage. | `link-user-dirs` |
| `bind-user-dirs` | Jeder Start | Bindet die verwalteten Benutzerverzeichnisse von beschreibbaren MiniOS-Medien ein. Es gelten die gleichen `toram`- und Verschlüsselungsbeschränkungen wie bei `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Jeder Start | Legt den medienrelativen Speicherort fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Jeder Start | Lädt und führt Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Für die native Erstellung auf FAT32/NTFS/exFAT oder bei fehlgeschlagenem POSIX-Test bevorzugt die initrd DynBlk, sofern verfügbar und von Secure Boot zugelassen, andernfalls DynFileFS. Dies konvertiert keine bestehende Sitzung. Bei ausgewähltem Ventoy-Persistence-Plugin-Backend verwendet eine Persistenzanforderung dieses eine ext4-Image anstelle nummerierter Sitzungen; `perchdir`-Sitzungsauswahlen werden ignoriert. Siehe [Persistenz-Interna](/reference/boot-process/Persistence-Internals).

## Sicherheitsaspekte

Die Kernel-Befehlszeile ist im Klartext und normalerweise in der Bootloader-Konfiguration, `/proc/cmdline`, und in Diagnosen sichtbar. Geben Sie keine wiederverwendbaren Geheimnisse in `root-password=` oder `user-password=` ein. Verwenden Sie bevorzugt die entsprechenden `*-crypted`-Parameter, wobei auch veröffentlichte Passwort-Hashes als sensibel behandelt werden sollten.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook hat weder Transportverschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad manipulieren kann, ihn ersetzen könnte. Verwenden Sie nur vertrauenswürdige Inhalte und Übertragungswege; nutzen Sie keinen nicht authentifizierten HTTP-Hook für sicherheitsrelevante Starts.

Befehle mit Leerzeichen trennen. Siehe die `man bootparam` Referenzseiten für weitere Kernel-Parameter, die für alle Linux-Distributionen gelten.

Ausführliche Informationen zu live-config-Parametern finden Sie unter [live-config](/reference/configuration/live-config).

Für das Laden von MiniOS über das Netzwerk (PXE und HTTP-ISO) siehe [Netzwerkstart](/reference/boot-process/Network-Boot).

## Parameter für persistenten Sitzungs-Cache und Logdateien

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `log-storage` oder `live-config.log-storage` | Jeder Systemstart mit validierter Persistenz | `persistent` (Standard) oder `volatile`. Im flüchtigen Modus nutzt journald bis zu 32 MiB und gewöhnliche `/var/log` verwendet ein 32 MiB großes tmpfs. Boot-Diagnosen werden separat gespeichert; bei dauerhafter Persistenz bleiben sie auf dem Datenträger erhalten. Ein volles RAM-Logdateisystem wird nicht auf das USB-Gerät ausgelagert. | `log-storage=volatile` |
| `apt-cache` oder `live-config.apt-cache` | Jeder Systemstart mit validierter Persistenz | `persistent` (Standard) oder `volatile` für `/var/cache/apt/archives`. Das tmpfs ist 256 MiB groß, wenn mindestens 1 GiB verfügbar ist, oder 512 MiB bei mindestens 2 GiB. Swap ohne zRAM deaktiviert es; große Downloads können es erschöpfen. Repository-Listen und dpkg-Status bleiben in der Sitzungsschicht erhalten. | `apt-cache=volatile` |
| `browser-cache` oder `live-config.browser-cache` | Jeder Systemstart mit validierter Persistenz | `persistent` (Standard) oder `volatile`. Mit mindestens 1 GiB freiem Speicher und ohne Swap außerhalb von zRAM nutzen Standard-Browsercache-Verzeichnisse des Live-Users ein gemeinsames 512 MiB tmpfs. Eine verwaltete Firefox-Policy deaktiviert das Zwischenspeichern auf der Festplatte, wenn keine andere Policy-Datei vorhanden ist. Profile und nicht zugehörige Caches verbleiben in der Sitzungsschicht. | `browser-cache=volatile` |

Die drei Storage-Policy-Parameter werden von `minios-boot` vor dem normalen Init-System ausgewertet, **nicht** vom frühen Persistenz-Selektor. Sie aktivieren `perch`. Sie erfordern eine erfolgreiche Aktivierung auf dauerhaftem Speicher oder einer beschreibbaren RAM-Sitzung mit geschützten `ram-origin` Informationen; sie machen RAM-Änderungen ohne Speichern nicht dauerhaft. Ein kompatibles initrd meldet `perch-storage-v1` unter `/run/initramfs/etc/minios-initramfs-storage`. Konfigurator und `config.conf` bieten die gleichen Auswahlmöglichkeiten; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Grenzwerte, Prioritäten und Hinweise zur Browserinstallation.
