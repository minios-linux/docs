---
updated: 2026-09-17
---

# Boot-Parameter

## Verwendung von Boot-Parametern

Boot-Parameter passen den Start von MiniOS an. Trennen Sie die Parameter auf der Kernel-Befehlszeile mit Leerzeichen.

### Syslinux

- Drücken Sie während des MiniOS-Startvorgangs <kbd>Esc</kbd>, um das Boot-Menü aufzurufen.
- Drücken Sie <kbd>Tab</kbd>, um die Boot-Optionen zu bearbeiten.
- Geben Sie die gewünschten Parameter ein und drücken Sie <kbd>Enter</kbd>, um zu starten.

### GRUB

- Drücken Sie im GRUB-Menü <kbd>E</kbd>.
- Bearbeiten Sie die Boot-Parameter am Ende der Befehlszeile.
- Drücken Sie <kbd>F10</kbd>, um mit den neuen Einstellungen zu starten.

## Boot-Parameter

Die Spalte „Anwendung“ unterscheidet zwischen Parametern, die bei jedem Start akzeptiert werden, und Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Mit Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als Schnellreferenz. Die Priorität der Quellen und akzeptierte `from=` Formate sind definiert in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), Modulauswahl in [Initrd-Modulladen](/reference/boot-process/Module-Loading), Persistenz-Auswahl in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und unterstützte Kombinationen in [Boot-Modi](/using-minios/Boot-Modes).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht ausgewertet. Ein wörtlicher **`http://` nur** URL hat Vorrang vor `ip=` und startet das [Netzwerk-Boot](/reference/boot-process/Network-Boot) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Behält `.sb`-Kandidaten, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht; Kommas werden als Alternativen interpretiert und ein vollständiger aufsteigender Zahlenbereich wird speziell erweitert. Filtert außerdem `toram=trim`. Es können Kern- oder Systemmodule ausgeschlossen werden, was das System unstartbar machen kann. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht, auch aus `toram=trim`; wird nach `load` angewendet und kann Kern- oder Systemmodule ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Setzt die Bundle-Erweiterung. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin den wörtlichen `.sb`-Namen, daher kann eine eigene Erweiterung die `01-kernel`-Modul-Koordination nicht übernehmen. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Anzeige der Startzeit. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | Statische Adresse für den frühen Netzwerkabruf. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-PXE-HTTP-Port **7529**). Ein wörtlicher `from=http://...` hat Vorrang vor `ip=` und verwendet dessen Adressfelder; andernfalls erzwingt jeder nicht-leere `ip=` einen PXE-Datenabruf und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerk-Boot (`from=http://…`). Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenz-Sitzung oder eine Aktion: `resume`, `new`, oder `ask`. Ein nicht vorhandener numerischer Selektor kann auf den Standardwert aus den Metadaten zurückfallen; er reserviert oder erstellt diese Nummer nicht. Ein Geräte-/Pfadname oder `askdisk`-Form wählt einen anderen Persistenzspeicher. Für einen eigenen Pfad kann ein Doppelpunkt-Suffix verwendet werden. Ohne Persistenz-Parameter startet MiniOS sauber. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Jeder Start | Logische Containergröße für `dynfilefs`, `dynblk`, `vmdk`, und `raw`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden zu 1000 bzw. 1.000.000 MiB umgerechnet. Ohne explizite Größe verwenden durch initrd erstellte DynFileFS, DynBlk und VMDK-Sitzungen bis zu 16 GiB und reduzieren diesen Standard, wenn nach `perchreserve` weniger Speicherplatz verbleibt; DynFileFS berücksichtigt zusätzlich seinen Index-Overhead und das RAM-Limit. DynBlk fragt das installierte Backend-Limit mit `dynblk limits --format dynblk` ab (oder `--format vmdk` für VMDK); es gibt keine separate 512-GiB-Grenze. DynFileFS-Nutzdaten und DynBlk-Backingspeicher wachsen bei Bedarf, während DynFileFS auch Indizes für die deklarierte logische Kapazität reserviert. Raw-Anfragen sind auf 1.000.000 MiB und den verfügbaren Speicher nach `perchreserve` begrenzt; Raw ist auf FAT32, egal ob verschlüsselt oder nicht, auf 4000 MiB limitiert. Neue Raw-Container haben standardmäßig 4000 MiB. Der MiniOS-Sitzungsmanager setzt manuell erstellte DynFileFS-Container weiterhin auf 4000 MiB und DynBlk/VMDK auf 16 GiB. Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für Backend-Speicher- und Speicherverhalten. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Jeder Start | Reserven und Warnschwellenwert bei wenig Speicherplatz in MiB. Dieser Wert wird beim Erstellen oder Vergrößern neuer Container abgezogen, ist aber keine Laufzeit-Quote und verhindert spätere Schreibvorgänge nicht. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): Ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: Das FUSE-basierte, erweiterbare Format-400-Containerformat, auch auf FAT32, NTFS oder exFAT.<br>`dynblk`: Ein separates Format-1-Kernel-Blockgerät, das von Thin-`volumeNNN.db`-Dateien unterstützt wird; die tatsächliche `/dev/dynblkN`-Nummer wird dynamisch zugewiesen und mehrere Volumes können gleichzeitig existieren.<br>`vmdk`: Standardmäßig geteilte, sparse `volume.vmdk` / `volume-sNNN.vmdk`-Dateien, bereitgestellt durch den DynBlk-Treiber; keine Komprimierung. Erfordert die versionierte `vmdk-session-v1`-Initrd-Funktion.<br>`raw`: Ein ext4-Abbild mit fester Größe.<br>`squashfs`: Ein komprimierter Snapshot, der in eine RAM-gestützte obere Schicht entpackt wird. Die Initrd-Einrichtung erstellt nur Generation-0-Metadaten; das laufende System erzeugt den ersten Snapshot bei Bedarf oder beim Herunterfahren. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Nur bei Erstellung | Optionale Verschlüsselungsschicht für einen neu erstellten `raw`, `dynfilefs`, `dynblk`, oder `vmdk`-Sitzung. `perchencrypt=luks` erfordert die versionierte `luks-layer-v1`-Initramfs-Funktion. Bestehende Sitzungen leiten die Verschlüsselung nur von `session_encryption[N]` ab, daher interpretiert oder konvertiert dieser Parameter sie nicht. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Nur bei Erstellung | Wählt die DynBlk-Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`. Der gewählte Kernel-Codec muss verfügbar sein. Wenn `perchencrypt=luks` DynBlk umschließt, erzwingt MiniOS die DynBlk-Komprimierung auf `none`. VMDK unterstützt keine Komprimierung: Beim Booten wird ein nicht-`none`-Codec mit einer Warnung ignoriert. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Jeder Start | Aktiviert den Legacy-Persistenz-Wiederherstellungspfad. Im Gegensatz zu `perchdir=resume` wird kein kompatibler Ersatz automatisch erstellt, wenn keine nutzbare Standardsitzung existiert. | `perch` |
| `toram` | Jeder Start | Nur `toram` ist `full`. Bei Persistenz wird beim vollständigen Kopieren auf oberster Ebene `*` ausgelassen; ohne Persistenz wird `changes` ausgelassen, aber andere Einträge auf oberster Ebene, einschließlich Dotfiles, werden kopiert. Trim kopiert erforderliche `config.conf`-, reguläre Datei-`authorized_keys`-, ausgewählte Module auf oberster Ebene und rekursiv sowie den vollständigen `changes/`-Baum, wenn Persistenz angefordert wird; es werden `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Protokolle, weitere Nicht-Modul-Daten und die separate Persistenzmodul-Ebene ausgelassen. Keine der Modi prüft zuerst die Kapazität von RAM. Ein auf RAM kopierter Persistenzspeicher ist nicht dauerhaft, Änderungen werden nicht zurückkopiert. Entfernen Sie das Medium erst, wenn bestätigt wurde, dass Quelle, Loops und Zuordnungen erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Setzt die zram-Swap-Größe in MiB. Wenn nicht angegeben, berechnet MiniOS sie aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oder `zstd` aus; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt der Kernel-Standard erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Setzt das Standard-systemd-Target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Setzt die XFCE-Bildschirmauflösung in virtuellen Maschinen. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgelisteten live-config-Komponenten in der angegebenen Reihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten aus, außer den aufgelisteten. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Setzt den System-Hostnamen. | `hostname=minios` |
| `username` | Ersteinrichtung | Setzt den für den Autologin erstellten Benutzernamen. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Setzt die Standardgruppen des erstellten Benutzers. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Setzt den vollständigen Namen des erstellten Benutzers. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Setzt das Root-Passwort im Klartext. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Setzt das Root-Passwort als Crypt-Hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Setzt das Benutzerpasswort im Klartext. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Setzt das Benutzerpasswort als Crypt-Hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Setzt eine oder mehrere System-Sprachumgebungen (Locales). | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Setzt die System-Zeitzone. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Setzt das Tastaturmodell. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Setzt durch Kommas getrennte Tastaturlayouts. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Setzt durch Kommas getrennte Tastaturvarianten, entsprechend den Layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Setzt Tastaturoptionen. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Rechte vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config Autologin für Konsole und grafische Oberfläche einrichtet; bestehende persistente Konfigurationen werden nicht entfernt. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung des Konsolen-Autologins; bestehende persistente Konfigurationen werden nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung des grafischen Autologins; bestehende persistente Konfigurationen werden nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung aus. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Setzt die Xorg-Auflösung anstelle der automatischen Erkennung. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | Mit `merged`, werden Konfigurationsänderungen in das laufende Live-System übernommen. | `module-mode=merged` |
| `hooks` | Jeder Start | Lädt und führt Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Sicherheitshinweise

Die Kernel-Befehlszeile ist Klartext und normalerweise in der Bootloader-Konfiguration, `/proc/cmdline` und Diagnosen sichtbar. Legen Sie keine wiederverwendbaren Geheimnisse in `root-password=` oder `user-password=` ab. Verwenden Sie vorzugsweise die entsprechenden `*-crypted`-Parameter, behandeln Sie aber auch veröffentlichte Passwort-Hashes als sensibel.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook bietet weder Transportverschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad manipulieren kann, ihn ersetzen könnte. Verwenden Sie nur Inhalte und Übertragungswege, denen Sie vertrauen; verwenden Sie keinen nicht authentifizierten HTTP-Hook für sicherheitskritische Starts.

Befehle werden durch Leerzeichen getrennt. Siehe die Referenzseiten zu `man bootparam` für weitere Kernel-Parameter, die für alle Linux-Distributionen gelten.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/reference/configuration/live-config).

Informationen zum Laden von MiniOS über das Netzwerk (PXE und HTTP ISO) finden Sie unter [Netzwerk-Boot](/reference/boot-process/Network-Boot).
