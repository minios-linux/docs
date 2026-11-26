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

## Bootparameter

Die Spalte „Anwendung“ unterscheidet zwischen Parametern, die normalerweise bei jedem Start akzeptiert werden, und Kontoeinstellungen für die Ersteinrichtung. Bei aktiviertem Persistenzspeicher werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als Kurzübersicht. Die Rangfolge der Quellen und zulässige`from=` Formen sind unter [Systemerkennung im Initrd](/reference/boot-process/System-Discovery), die Filterung von Modulen unter [Laden von Initrd-Modulen](/reference/boot-process/Module-Loading), die Auswahl des Persistenzspeichers unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) und unterstützte Kombinationen unter [Startmodi](/using-minios/Boot-Modes) definiert.

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Bei jedem Start | Lädt Daten von MiniOS aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO-Datei. UUID-, PARTUUID- und By-ID-Gerätepfade werden nicht ausgewertet. Eine URL mit ausschließlich **`http://` hat Vorrang vor** und startet einen `ip=` über [Netzwerkstart](/reference/boot-process/Network-Boot) mit httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Bei jedem Start | Behält `.sb`Kandidaten bei, deren Pfad auf einen nicht verankerten erweiterten regulären Ausdruck passt; Kommas werden als Alternativen behandelt, und ein vollständig aufsteigender Zahlenbereich wird speziell erweitert. Filtert außerdem `toram=trim` heraus. Kann Kern- oder Kernelmodule ausschließen und das System dadurch unstartbar machen. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Bei jedem Start | Schließt Kandidaten aus, deren Pfad auf einen nicht verankerten erweiterten regulären Ausdruck passt, auch aus `toram=trim`; wird nach `load` angewendet und kann Kern- oder Kernelmodule ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Bei jedem Start | Legt die Bundle-Erweiterung fest. Standard: `sb`. Für die Kernelkoordination werden weiterhin die wörtlichen Namen `.sb` verwendet. Daher kann eine benutzerdefinierte Erweiterung das `01-kernel`-Modul nicht koordinieren. | `bext=mymod` |
| `timing` | Bei jedem Start | Gibt die Startzeitmessung aus. | `timing` |
| `union` | Bei jedem Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Bei jedem Start | Statische Adresse für den frühen Netzwerkabruf. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (standardmäßiger PXE-HTTP-Port **7529**). Ein wörtliches `from=http://...` hat Vorrang vor `ip=` und verwendet dessen Adressierungsfelder. Andernfalls erzwingt jeder nicht leere Wert von `ip=` den PXE-Datendownload und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration der Sitzung. Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Bei jedem Start | Größe des httpfs-Caches in MiB für den Netzwerkstart mit HTTP-ISO-Datei (`from=http://…`). Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Bei jedem Start | Öffnet am Ende der Initramfs-Phase eine Debug-Shell. | `rd.break` |
| `perchdir` | Bei jedem Start | Wählt eine nummerierte Persistenzsitzung oder eine Aktion aus. `resume` öffnet die standardmäßige kompatible Sitzung; `setup` ermöglicht die interaktive Auswahl des Speicher-Backends und erstellt anschließend eine neue nummerierte Sitzung; `new` erstellt direkt eine neue Sitzung mit den angeforderten bzw. standardmäßigen Einstellungen für `perchmode`, Verschlüsselung, Komprimierung und Größe; `ask` zeigt gespeicherte Sitzungen an und startet automatisch die Einrichtung, wenn keine vorhanden sind. Ist die ausgewählte Sitzungsnummer nicht vorhanden, kann stattdessen der Standardwert aus den Metadaten verwendet werden; die Nummer wird dadurch weder reserviert noch erstellt. Ein Gerätepfad oder eine `askdisk`-Angabe wählt einen anderen Persistenzspeicherort aus. Einen benutzerdefinierten Pfad gibst du als durch Doppelpunkte getrennten Suffix an. Ohne Persistenzparameter startet MiniOS in einem sauberen Zustand. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Bei jedem Start | Logische Containergröße für `dynfilefs`, `dynblk`, `vmdk` und `raw`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder ein Wert mit `M`/`MB` wird in MiB zugewiesen; Werte mit `G`/`GB` und `T`/`TB` werden in 1000 bzw. 1.000.000 MiB umgerechnet. Ohne explizite Größenangabe verwenden im Initrd erstellte DynFileFS, DynBlk- und VMDK-Sitzungen bis zu 16 GiB; ist nach `perchreserve` weniger Speicherplatz verfügbar, wird dieser Standardwert entsprechend reduziert. Es gelten weiterhin die Kapazitätsprüfungen des Backends. DynBlk fragt die installierte Backend-Grenze mit `dynblk limits --format dynblk` (bei VMDK mit `--format vmdk`) ab; eine separate Obergrenze von 512 GiB gibt es nicht. DynFileFS und DynBlk weisen Speicherplatz bei Bedarf zu. Anforderungen für Raw sind auf 1.000.000 MiB und auf den verfügbaren Speicherplatz nach `perchreserve` begrenzt; bei FAT32 ist Raw unabhängig von der Verschlüsselung auf 4000 MiB beschränkt. Neue Raw-Container haben standardmäßig eine Größe von 4000 MiB. Der MiniOS-Sitzungsmanager legt manuell erstellte DynFileFS-Container standardmäßig auf 4000 MiB und DynBlk/VMDK auf 16 GiB fest. Weitere Informationen zu Backend-Speicher und -Verhalten findest du unter [Initrd-Persistenz](/reference/boot-process/Persistence-Internals). | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Bei jedem Start | Reserve für die Speicherplatzzuweisung und Schwellenwert für die Warnung bei wenig Speicherplatz, in MiB. Der Wert wird beim Festlegen der Größe neuer oder beim Vergrößern vorhandener Container abgezogen. Er ist jedoch kein Laufzeitkontingent und verhindert nicht, dass spätere Schreibvorgänge das Gerät füllen. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Bei jedem Start | Speichermodus für die Persistenz.<br>`native` (Standard): ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: ein erweiterbarer FUSE-Container im Format 600, auch auf FAT32, NTFS oder exFAT.<br>`dynblk`: ein separates Kernel-Blockgerät im Format 1, das von dünn bereitgestellten `volumeNNN.db`-Dateien unterstützt wird; die tatsächliche `/dev/dynblkN`-Nummer wird dynamisch zugewiesen, und mehrere Volumes können gleichzeitig verwendet werden.<br>`vmdk`: standardmäßige, aufgeteilte Sparse-`volume.vmdk`- / `volume-sNNN.vmdk`-Dateien, die vom Treiber DynBlk bereitgestellt werden; keine Komprimierung. Erfordert die versionierte Initrd-Funktion `vmdk-session-v1`.<br>`raw`: ein ext4-Image fester Größe.<br>`squashfs`: ein komprimierter Snapshot, der in eine von RAM unterstützte obere Ebene entpackt wird. Die Initrd-Einrichtung erstellt nur Metadaten der Generation null; das laufende System erstellt den ersten Snapshot bei Bedarf oder beim Herunterfahren. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Nur beim Erstellen | Optionale Verschlüsselungsebene für eine neu erstellte `raw`, `dynfilefs`, `dynblk` oder `vmdk`-Sitzung. `perchencrypt=luks` erfordert die versionierte Initramfs-Funktion `luks-layer-v1`. Bei vorhandenen Sitzungen wird die Verschlüsselung ausschließlich aus `session_encryption[N]` abgeleitet. Dieser Parameter ändert oder konvertiert sie daher nicht. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Nur beim Erstellen | Legt die Komprimierung des DynBlk-Backends für eine neu erstellte DynBlk-Sitzung fest: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate` oder `842`. Der ausgewählte Codec muss im Kernel verfügbar sein. Wenn `perchencrypt=luks` DynBlk umschließt, erzwingt MiniOS die Komprimierung von DynBlk auf `none`. VMDK unterstützt keine Komprimierung: Beim Start wird ein Codec, der nicht`none` ist, mit einer Warnung ignoriert. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Bei jedem Start | Aktiviert den veralteten Wiederaufnahmepfad für die Persistenz. Anders als `perchdir=resume` erstellt dieser Parameter nicht automatisch eine kompatible Ersatzsitzung, wenn keine verwendbare Standardsitzung vorhanden ist. | `perch` |
| `toram` | Bei jedem Start | Steuert das Kopieren der MiniOS-**Systemdaten** nach RAM. Ein alleinstehendes `toram` bedeutet `full`; `trim` kopiert die erforderliche Konfiguration und die ausgewählten Module, lässt aber nicht benötigte Quelldaten aus. Das Kopieren der Persistenzdaten wird separat über `perchtoram` gesteuert. Wird Persistenz angefordert, aber `perchtoram` nicht angegeben, legt jeder aktive `toram`-Modus standardmäßig fest, dass Persistenzdaten kopiert werden: `trim`. Entferne das Medium erst, nachdem du sichergestellt hast, dass die ursprüngliche Quelle, Loop-Geräte, Zuordnungen und gegebenenfalls benötigte Persistenzspeicher erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Bei jedem Start mit Persistenz | `off` behält den ursprünglichen Speicher bei; `trim` kopiert die ausgewählte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung; `full` kopiert alle unterstützten Container/Snapshots und die zugehörigen Metadaten. Standard: `trim` bei System-`toram`, andernfalls `off`. Der Parameter fordert nicht selbst Persistenz an. Native Daten werden nicht kopiert: Bei erfolgreicher nativer Anforderung von RAM wird ein neuer leerer Container erstellt. Beim Zurücksetzen wird das Kopieren deaktiviert. Schlägt das Kopieren fehl, wird der Betrieb auf dem Speichermedium fortgesetzt. Änderungen an RAM müssen im ursprünglichen beschreibbaren Speicher oder als neue Sitzung gespeichert werden. Wird ignoriert, wenn das ausgewählte Persistence-Plugin-Backend Ventoy verwendet wird. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Bei jedem Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Bei jedem Start | Aktiviert das automatische Einbinden von Speichergeräten. | `automount` |
| `debug` | Bei jedem Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Bei jedem Start | Deaktiviert den zram-Auslagerungsspeicher. | `nozram` |
| `zramsize` | Bei jedem Start | Legt die Größe des zram-Auslagerungsspeichers in MiB fest. Wenn nicht angegeben, berechnet MiniOS die Größe anhand des gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Bei jedem Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc` oder `zstd` aus; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt die Kernel-Standardeinstellung erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Bei jedem Start | Legt das standardmäßige systemd-Ziel fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Bei jedem Start | Aktiviert beim Systemstart die angegebenen systemd-Dienste. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Bei jedem Start | Deaktiviert beim Systemstart die angegebenen systemd-Dienste. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Bei jedem Start | Deaktiviert automatische Änderungen der Bildschirmauflösung in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Bei jedem Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Bei jedem Start | Führt nur die aufgelisteten live-config-Komponenten in der Reihenfolge der Komponenten aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Bei jedem Start | Führt alle live-config-Komponenten außer den aufgelisteten aus. | `nocomponents=anacron,apport` |
| `hostname` | Bei jedem Start | Legt den Hostnamen des Systems fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den Benutzernamen für die automatische Anmeldung fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Legt das root-Passwort im Klartext fest. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Legt das root-Passwort als crypt-Hash fest. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Legt das Benutzerpasswort im Klartext fest. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Legt das Benutzerpasswort als crypt-Hash fest. | `user-password-crypted=$y$j9T$...` |
| `locales` | Bei jedem Start | Legt ein oder mehrere Systemgebietsschemas fest. | `locales=en_US.UTF-8` |
| `timezone` | Bei jedem Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Bei jedem Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Bei jedem Start | Legt durch Kommas getrennte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Bei jedem Start | Legt durch Kommas getrennte Tastaturvarianten fest, die den Layouts entsprechen. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Bei jedem Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und PolicyKit-Berechtigungen vergibt. | `noroot` |
| `noautologin` | Bei jedem Start | Verhindert, dass live-config eine automatische Anmeldung in der Konsole und der grafischen Oberfläche einrichtet; eine vorhandene persistente Konfiguration wird nicht entfernt. | `noautologin` |
| `nottyautologin` | Bei jedem Start | Verhindert nur die Einrichtung der automatischen Anmeldung in der Konsole; eine vorhandene persistente Konfiguration wird nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Bei jedem Start | Verhindert nur die Einrichtung der automatischen Anmeldung in der grafischen Oberfläche; eine vorhandene persistente Konfiguration wird nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Bei jedem Start | Wählt einen Xorg-Treiber aus, anstatt ihn automatisch zu erkennen. | `xorg-driver=nouveau` |
| `xorg-resolution` | Bei jedem Start | Legt die Xorg-Auflösung fest, anstatt sie automatisch zu erkennen. | `xorg-resolution=1920x1080` |
| `module-mode` | Bei jedem Start | Mit `merged` werden Konfigurationsänderungen in das laufende Live-System integriert. | `module-mode=merged` |
| `link-user-dirs` | Bei jedem Start | Verknüpft die verwalteten Benutzerverzeichnisse mit beschreibbaren MiniOS-Medien. Der Parameter ist nicht mit `bind-user-dirs` kombinierbar und bei jedem `toram`-Modus sowie bei aktiver LUKS-Verschlüsselung der Persistenzsitzung nicht verfügbar. Ob eine Verschlüsselung aktiv ist, wird anhand der laufenden Sitzung bestimmt, nicht anhand der Anforderung zum Erstellen von `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | Bei jedem Start | Bindet die verwalteten Benutzerverzeichnisse von beschreibbaren MiniOS-Medien ein. Es gelten dieselben Einschränkungen für `toram` und die aktive Sitzungsverschlüsselung wie bei `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Bei jedem Start | Legt den relativen Speicherort auf dem Medium fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Bei jedem Start | Ruft Hooks aus dem Dateisystem, dem Live-Medium oder von wget-unterstützten URLs ab und führt sie aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Bei nativer Erstellung auf FAT32/NTFS/exFAT oder wenn eine POSIX-Prüfung fehlschlägt, bevorzugt die Initrd DynBlk, sofern verfügbar und mit Secure Boot zulässig, andernfalls DynFileFS. Dieser Rückfall ändert den Speichermodus einer vorhandenen Sitzung nicht. Ist das Persistence-Plugin-Backend Ventoy ausgewählt, verwendet eine Persistenzanforderung dieses eine ext4-Image anstelle nummerierter Sitzungen; `perchdir`-Sitzungsoptionen werden ignoriert. Siehe [Interna der Persistenz](/reference/boot-process/Persistence-Internals).

Beim normalen Einbinden konvertiert der aktuelle DynFileFS-Helfer das Format 400 oder 500 automatisch direkt in Format 600, wenn die Größe des alten Split-Formats eine gerade Anzahl MiB beträgt. Bei einer ungeraden Größe in MiB wird die Konvertierung ohne Änderungen abgebrochen. Kein Bootparameter wählt die alten Formate aus oder aktiviert die Konvertierung.

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
