---
updated: 2026-10-06
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

Die Spalte „Anwendung“ unterscheidet Parameter, die bei jedem Start akzeptiert werden, von Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Bei Verwendung von Persistenz werden live-config-Komponenten in der Regel nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als Schnellreferenz. Die Priorität der Quellen und akzeptierte `from=` Formate sind definiert in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), Modulfilterung in [Initrd-Modulladen](/reference/boot-process/Module-Loading), Persistenzauswahl in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und unterstützte Kombinationen in [Boot-Modi](/using-minios/Boot-Modes).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht ausgewertet. Ein wörtlicher **`http://` nur** URL hat Vorrang vor `ip=` und startet den [Netzwerkstart](/reference/boot-process/Network-Boot) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Behält `.sb` Kandidaten, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht; Kommas werden zu Alternativen, und ein vollständiger aufsteigender Zahlenbereich wird speziell erweitert. Filtert außerdem `toram=trim`. Es können Kern- oder Kernel-Module ausgeschlossen werden, was das System unbootbar machen kann. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht, auch aus `toram=trim`; dies wird nach `load` angewendet und kann Kern- oder Kernel-Module ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Setzt die Bundle-Erweiterung. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin den wörtlichen `.sb` Namen, daher kann eine benutzerdefinierte Erweiterung das `01-kernel` Modul nicht koordinieren. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | Statische Adresse für frühen Netzwerkabruf. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard PXE HTTP-Port **7529**). Ein wörtlicher `from=http://...` hat Vorrang vor `ip=` und nutzt dessen Adressfelder; andernfalls erzwingt ein nicht-leeres `ip=` einen PXE-Daten-Download und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerkstart (`from=http://…`). Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenzsitzung oder eine Aktion aus. `resume` öffnet die standardmäßig kompatible Sitzung; `setup` wählt interaktiv das Speicher-Backend aus und erstellt dann eine neue nummerierte Sitzung; `new` erstellt direkt eine neue Sitzung mit den gewünschten/Standard-`perchmode`-, Verschlüsselungs-, Komprimierungs- und Größeneinstellungen; `ask` bietet gespeicherte Sitzungen an und startet automatisch die Einrichtung, wenn keine vorhanden ist. Ein nicht vorhandener numerischer Selektor kann auf den Standardwert in den Metadaten zurückfallen; er reserviert oder erstellt diese Nummer nicht. Ein Geräte-/Pfad- oder `askdisk`-Form wählt einen anderen Persistenzspeicherort. Verwenden Sie ein Doppelpunkt-Suffix für einen benutzerdefinierten Pfad. Ohne Persistenzparameter startet MiniOS ohne gespeicherte Daten. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Jeder Start | Logische Containergröße für `dynfilefs`, `dynblk`, `vmdk` und `raw`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden zu 1000 bzw. 1.000.000 MiB umgerechnet. Ohne explizite Größe verwenden durch initrd erstellte DynFileFS, DynBlk und VMDK-Sitzungen bis zu 16 GiB und reduzieren diesen Standardwert, wenn nach `perchreserve` weniger Speicherplatz übrig bleibt; DynFileFS berücksichtigt zusätzlich seinen Index-Overhead und das RAM-Limit. DynBlk fragt das installierte Backend-Limit mit `dynblk limits --format dynblk` ab (bzw. `--format vmdk` für VMDK); es gibt keine separate 512-GiB-Grenze. DynFileFS-Payload und DynBlk-Backingspeicher wachsen bei Bedarf, während DynFileFS auch Indizes für die deklarierte logische Kapazität reserviert. Roh-Anforderungen sind auf 1.000.000 MiB und den verfügbaren Speicher nach `perchreserve` begrenzt; Raw ist auf FAT32 unabhängig von Verschlüsselung auf 4000 MiB beschränkt. Neue Raw-Container haben standardmäßig 4000 MiB. Der MiniOS-Sitzungsmanager setzt manuell erstellte DynFileFS-Container weiterhin auf 4000 MiB und DynBlk/VMDK auf 16 GiB. Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für das Verhalten von Backend-Speicher und -Arbeitsspeicher. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Jeder Start | Sicherheitsabstand und Warnschwelle für wenig Speicherplatz in MiB. Dieser Wert wird beim Anlegen oder Vergrößern neuer Container abgezogen, ist aber kein Laufzeit-Kontingent und verhindert nicht, dass spätere Schreibvorgänge das Gerät füllen. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): Ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: Das FUSE-basierte erweiterbare Format-400-Containerformat, auch auf FAT32, NTFS oder exFAT.<br>`dynblk`: Ein separates Format-1-Kernel-Blockgerät, das von Thin-`volumeNNN.db`-Dateien unterstützt wird; die tatsächliche `/dev/dynblkN`-Nummer wird dynamisch zugewiesen und mehrere Volumes können koexistieren.<br>`vmdk`: Standardmäßig geteilte Sparse-`volume.vmdk` / `volume-sNNN.vmdk`-Dateien, bereitgestellt durch den DynBlk-Treiber; keine Komprimierung. Erfordert die versionierte `vmdk-session-v1`-Initrd-Funktion.<br>`raw`: Ein ext4-Abbild mit fester Größe.<br>`squashfs`: Ein komprimierter Snapshot, der in eine RAM-gestützte obere Schicht entpackt wird. Die Initrd-Einrichtung erstellt nur Generation-0-Metadaten; das laufende System erstellt den ersten Snapshot bei Bedarf oder beim Herunterfahren. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Nur Erstellung | Optionale Verschlüsselungsschicht für eine neu erstellte `raw`, `dynfilefs`, `dynblk`- oder `vmdk`-Sitzung. `perchencrypt=luks` erfordert die versionierte `luks-layer-v1`-initramfs-Funktion. Bestehende Sitzungen leiten die Verschlüsselung nur von `session_encryption[N]` ab, daher interpretiert oder konvertiert dieser Parameter sie nicht. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Nur Erstellung | Wählt die DynBlk-Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`. Der gewählte Kernel-Codec muss verfügbar sein. Wenn `perchencrypt=luks` DynBlk umschließt, erzwingt MiniOS DynBlk-Komprimierung auf `none`. VMDK unterstützt keine Komprimierung: Beim Booten wird ein nicht-`none`-Codec mit einer Warnung ignoriert. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Jeder Start | Aktiviert den Legacy-Persistenz-Wiederherstellungspfad. Im Gegensatz zu `perchdir=resume` wird kein kompatibler Ersatz automatisch erstellt, wenn keine verwendbare Standardsitzung existiert. | `perch` |
| `toram` | Jeder Start | Steuert das Kopieren der MiniOS-**Systemdaten** nach RAM. Ein reines `toram` ist `full`; `trim` kopiert die erforderliche Konfiguration und die ausgewählte Modulliste, ohne nicht relevante Quelldaten zu übernehmen. Das Kopieren der Persistenz wird separat über `perchtoram` gesteuert. Wenn Persistenz angefordert wird und `perchtoram` nicht angegeben ist, setzt jeder aktive `toram`-Modus das Kopieren der Persistenz standardmäßig auf `trim`. Entfernen Sie das Medium erst, nachdem Sie bestätigt haben, dass die Originalquelle, Loops, Zuordnungen und ggf. benötigter Persistenzspeicher erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Jeder Start mit Persistenz | Steuert das Kopieren unterstützter Persistenzsitzungen unabhängig von System-`toram`: `off` belässt die Sitzung auf dem ursprünglichen Speicher, `trim` kopiert nur die ausgewählte Raw-, DynFileFS-, DynBlk-, VMDK- oder SquashFS-Sitzung plus passende Metadaten, und `full` kopiert alle unterstützten Container/SquashFS-Sitzungen von diesem Speicher. Native Verzeichnis-Sitzungen werden nicht kopiert. Standard ist `trim` wenn System-`toram` aktiv ist, sonst `off`; ein expliziter Wert hat Vorrang. Eine kopierte Sitzung wird als nicht dauerhaft markiert, aber der aktuelle Session Manager kann unterstützte RAM-gestützte Änderungen explizit auf dem Originalspeicher oder als neue Sitzung speichern, wenn dieser Speicher verfügbar ist und noch mit seiner gespeicherten Identität übereinstimmt. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Setzt die zram-Swap-Größe in MiB. Wenn nicht angegeben, berechnet MiniOS sie aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc` oder `zstd`; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt der Kernel-Standard erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Setzt das Standard-Systemd-Target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Setzt die XFCE-Bildschirmauflösung in virtuellen Maschinen. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgelisteten live-config-Komponenten in Komponentenreihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten aus, außer den aufgelisteten. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Setzt den System-Hostnamen. | `hostname=minios` |
| `username` | Ersteinrichtung | Setzt den für die automatische Anmeldung erstellten Benutzernamen. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Setzt die Standardgruppen des erstellten Benutzers. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Setzt den vollständigen Namen des erstellten Benutzers. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Setzt das Root-Passwort im Klartext. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Setzt das Root-Passwort als Crypt-Hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Setzt das Benutzerpasswort im Klartext. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Setzt das Benutzerpasswort als Crypt-Hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Setzt eine oder mehrere System-Locales. | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Setzt die Systemzeitzone. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Setzt das Tastaturmodell. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Setzt kommaseparierte Tastaturlayouts. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Setzt kommaseparierte Tastatur-Varianten entsprechend den Layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Setzt Tastaturoptionen. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Rechte vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config Konsole- und grafische Autologins einrichtet; bestehende persistente Konfiguration wird nicht entfernt. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung des Konsolen-Autologins; bestehende persistente Konfiguration wird nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung des grafischen Autologins; bestehende persistente Konfiguration wird nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Setzt die Xorg-Auflösung anstelle der automatischen Erkennung. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | Mit `merged`, werden Konfigurationsänderungen ins laufende Live-System übernommen. | `module-mode=merged` |
| `link-user-dirs` | Jeder Start | Verknüpft die verwalteten Benutzerverzeichnisse mit beschreibbaren MiniOS-Medien. Dies ist nicht kombinierbar mit `bind-user-dirs` und nicht verfügbar mit einem beliebigen `toram`-Modus oder wenn die aktive Persistenzsitzung LUKS-verschlüsselt ist. Aktive Verschlüsselung wird aus der laufenden Sitzung ermittelt, nicht aus dem `perchencrypt`-Erstellungsauftrag. | `link-user-dirs` |
| `bind-user-dirs` | Jeder Start | Bindet die verwalteten Benutzerverzeichnisse von beschreibbaren MiniOS-Medien ein. Es gelten die gleichen `toram`- und Verschlüsselungsbeschränkungen wie bei `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Jeder Start | Legt den medienrelativen Speicherort für `link-user-dirs` oder `bind-user-dirs` fest. Standard: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Jeder Start | Lädt und führt Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Sicherheitsaspekte

Die Kernel-Befehlszeile ist im Klartext und normalerweise in der Bootloader-Konfiguration, `/proc/cmdline`, und in Diagnosen sichtbar. Geben Sie keine wiederverwendbaren Geheimnisse in `root-password=` oder `user-password=` ein. Verwenden Sie bevorzugt die entsprechenden `*-crypted`-Parameter, wobei auch veröffentlichte Passwort-Hashes als sensibel behandelt werden sollten.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook hat weder Transportverschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad manipulieren kann, ihn ersetzen könnte. Verwenden Sie nur vertrauenswürdige Inhalte und Übertragungswege; nutzen Sie keinen nicht authentifizierten HTTP-Hook für sicherheitsrelevante Starts.

Befehle mit Leerzeichen trennen. Siehe die `man bootparam` Referenzseiten für weitere Kernel-Parameter, die für alle Linux-Distributionen gelten.

Ausführliche Informationen zu live-config-Parametern finden Sie unter [live-config](/reference/configuration/live-config).

Für das Laden von MiniOS über das Netzwerk (PXE und HTTP-ISO) siehe [Netzwerkstart](/reference/boot-process/Network-Boot).

## Parameter für Persistenzsitzungs-Cache und -Protokoll

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `log-storage` oder `live-config.log-storage` | Jeder Start, mit dauerhafter `perch` | `persistent` (Standard) oder `volatile`. Im volatilen Modus verwendet journald bis zu 32 MiB RAM und gewöhnliches `/var/log` verwendet ein 32 MiB tmpfs. `minios-boot` und `live-config` Boot-Protokolle verbleiben auf dem beschreibbaren Persistenzspeicher. Ein volles RAM-Protokoll-Dateisystem nimmt keine weiteren Schreibvorgänge an und läuft nicht auf das USB-Gerät über. | `log-storage=volatile` |
| `apt-cache` oder `live-config.apt-cache` | Jeder Start, mit dauerhafter `perch` | `persistent` (Standard) oder `volatile` für `/var/cache/apt/archives`. Das RAM-Mount ist 256 oder 512 MiB groß, wenn genügend Speicher verfügbar ist und kein nicht-zRAM-Swap aktiv ist; große Downloads können es erschöpfen. `/var/lib/apt/lists` und dpkg-Status bleiben persistent. | `apt-cache=volatile` |
| `browser-cache` oder `live-config.browser-cache` | Jeder Start, mit dauerhafter `perch` | `persistent` (Standard) oder `volatile` für Standard-Browser-Caches. Nachdem der Live-Benutzer existiert, verwenden ausgewählte `~/.cache`-Unterverzeichnisse ein gemeinsames 512 MiB tmpfs und das Firefox-Disk-Caching wird durch eine verwaltete Systemrichtlinie deaktiviert, wenn keine andere Firefox-Policy-Datei vorhanden ist. Profile und nicht zugehörige Anwendungscaches bleiben persistent. | `browser-cache=volatile` |

Die drei Speicher-Policy-Parameter werden von `minios-boot` vor dem normalen Init-System ausgewertet, **nicht** vom frühen Persistenzselektor. Sie aktivieren `perch` nicht und greifen erst nach erfolgreicher Aktivierung der dauerhaften Persistenz. Eine kompatible Initrd meldet `perch-storage-v1` unter `/run/initramfs/etc/minios-initramfs-storage`. Konfigurator und `config.conf` bieten die gleichen Optionen; siehe [Leistung](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) für Grenzen, Prioritäten und Hinweise zur Browser-Installation.
