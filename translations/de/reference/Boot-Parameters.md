---
updated: 2026-09-26
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

Die Spalte „Anwendung“ unterscheidet Parameter, die bei jedem Start akzeptiert werden, von Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Bei Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als Schnellreferenz. Die Reihenfolge der Quellen und akzeptierte `from=` Formate sind definiert in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery), die Modul-Filterung in [Initrd-Modulladen](/reference/boot-process/Module-Loading), die Auswahl der Persistenz in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und unterstützte Kombinationen in [Boot-Modi](/using-minios/Boot-Modes).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht ausgewertet. Ein wörtlicher **`http://` nur** URL hat Vorrang vor `ip=` und startet den [Netzwerkstart](/reference/boot-process/Network-Boot) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Behält `.sb`-Kandidaten bei, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht; Kommas werden zu Alternativen, und ein vollständig aufsteigender Zahlenbereich wird speziell erweitert. Filtert außerdem `toram=trim`. Damit können Kern- oder Kernel-Module ausgeschlossen werden, was das System unstartbar machen kann. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht, auch aus `toram=trim`; dies wird nach `load` angewendet und kann Kern- oder Kernel-Module ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Setzt die Bundle-Erweiterung. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin den wörtlichen `.sb`-Namen, daher kann eine eigene Erweiterung die `01-kernel`-Modul-Koordination nicht übernehmen. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Bei jedem Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Bei jedem Start | Statische Adresse für das frühe Laden aus dem Netzwerk. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-PXE-HTTP-Port **7529**). Ein expliziter `from=http://...` hat Vorrang vor `ip=` und verwendet dessen Adressfelder; andernfalls erzwingt jeder nicht-leere `ip=` das Herunterladen der PXE-Daten und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Bei jedem Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerkstart (`from=http://…`). Siehe [Netzwerkstart](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Bei jedem Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Bei jedem Start | Wählt eine nummerierte Persistenzsitzung oder eine Aktion aus: `resume`, `new`, oder `ask`. Ein nicht vorhandener numerischer Selektor kann auf den Metadaten-Standard zurückfallen; er reserviert oder erstellt diese Nummer jedoch nicht. Ein Gerät/Pfad oder `askdisk`-Form wählt einen anderen Persistenzspeicherort. Für einen benutzerdefinierten Pfad kann ein Doppelpunkt-Suffix verwendet werden. Ohne Persistenzparameter startet MiniOS sauber. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Bei jedem Start | Logische Containergröße für `dynfilefs`, `dynblk`, `vmdk`, und `raw`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden zu 1000 bzw. 1.000.000 MiB umgerechnet. Ohne explizite Größe verwenden initrd-erstellte DynFileFS, DynBlk und VMDK-Sitzungen bis zu 16 GiB und reduzieren diesen Standardwert, wenn nach `perchreserve` weniger Speicherplatz verbleibt; DynFileFS berücksichtigt zusätzlich seinen Index-Overhead und das RAM-Limit. DynBlk fragt das installierte Backend-Limit ab mit `dynblk limits --format dynblk` (oder `--format vmdk` für VMDK); es gibt keine separate 512-GiB-Grenze. DynFileFS-Nutzdaten und DynBlk-Backingspeicher wachsen bei Bedarf, während DynFileFS zusätzlich Indizes für die deklarierte logische Kapazität reserviert. Roh-Anfragen sind auf 1.000.000 MiB und den verfügbaren Speicher nach `perchreserve` begrenzt; Raw ist auf FAT32 – unabhängig von Verschlüsselung – auf 4000 MiB beschränkt. Neue Raw-Container haben standardmäßig 4000 MiB. Der MiniOS-Sitzungsmanager setzt manuell erstellte DynFileFS-Container weiterhin standardmäßig auf 4000 MiB und DynBlk/VMDK auf 16 GiB. Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) für das Verhalten von Backend-Speicher und -Speicherung. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Bei jedem Start | Reserven für die Allokation und Warnschwelle für wenig Speicherplatz in MiB. Dieser Wert wird beim Anlegen oder Vergrößern von Containern abgezogen, ist jedoch kein Laufzeit-Quota und verhindert nicht, dass spätere Schreibvorgänge das Gerät vollständig belegen. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Bei jedem Start | Modus für persistente Speicherung.<br>`native` (Standard): Ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: Das auf FUSE basierende, erweiterbare format-400-Containerformat, auch auf FAT32, NTFS oder exFAT.<br>`dynblk`: Ein separates format-1 Kernel-Blockgerät, das durch Thin `volumeNNN.db`-Dateien unterstützt wird; die tatsächliche `/dev/dynblkN`Anzahl wird dynamisch zugewiesen und mehrere Volumes können gleichzeitig existieren.<br>`vmdk`: Standardmäßig geteilte Sparse-`volume.vmdk` / `volume-sNNN.vmdk`-Dateien, bereitgestellt durch den DynBlk-Treiber; keine Komprimierung. Erfordert die versionierte `vmdk-session-v1`initrd-Funktionalität.<br>`raw`: Ein ext4-Image mit fester Größe.<br>`squashfs`: Ein komprimierter Snapshot, der in eine von RAM unterstützte obere Schicht entpackt wird. Die Initrd-Einrichtung erstellt nur Metadaten der Generation Null; das laufende System erzeugt den ersten Snapshot bei Bedarf oder beim Herunterfahren. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Nur bei Erstellung | Optionale Verschlüsselungsschicht für eine neu erstellte `raw`, `dynfilefs`, `dynblk`, oder `vmdk`Sitzung. `perchencrypt=luks`erfordert die versionierte `luks-layer-v1`initramfs-Funktionalität. Bestehende Sitzungen leiten die Verschlüsselung nur von `session_encryption[N]`ab, daher interpretiert oder konvertiert dieser Parameter sie nicht. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Nur bei Erstellung | Wählt die DynBlk-Backend-Komprimierung für eine neu erstellte DynBlk-Sitzung aus: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, oder `842`. Der gewählte Kernel-Codec muss verfügbar sein. Wenn `perchencrypt=luks` umschließt DynBlk, MiniOS erzwingt DynBlk-Komprimierung auf `none`. VMDK unterstützt keine Komprimierung: Beim Start wird ein nicht-`none`Codec mit einer Warnung ignoriert. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Bei jedem Start | Aktiviert den Legacy-Persistenz-Wiederaufnahmeweg. Im Gegensatz zu `perchdir=resume`wird kein kompatibler Ersatz automatisch erstellt, wenn keine verwendbare Standardsitzung existiert. | `perch` |
| `toram` | Bei jedem Start | Minimal `toram` ist `full`. Mit Persistenz wird beim vollständigen Modus das oberste Verzeichnis `*` kopiert, aber Dotfiles werden ausgelassen; ohne Persistenz werden `changes` ausgelassen, aber andere oberste Einträge einschließlich Dotfiles kopiert. Trim kopiert erforderliche `config.conf`, reguläre Dateien `authorized_keys`, ausgewählte oberste und rekursive Module sowie das vollständige `changes/`-Verzeichnis, wenn Persistenz angefordert ist; es lässt `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Protokolle, sonstige Nicht-Modul-Daten und die separate Persistenzmodul-Ebene aus. Keiner der Modi prüft zuerst die Kapazität von RAM. Ein Persistenzspeicher, der auf RAM kopiert wurde, ist nicht dauerhaft, und Änderungen werden nicht zurückkopiert. Entfernen Sie das Medium erst, nachdem bestätigt wurde, dass die Quelle, Loops und Zuordnungen erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Bei jedem Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Bei jedem Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Bei jedem Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Bei jedem Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Bei jedem Start | Legt die zram-Swap-Größe in MiB fest. Wenn nicht angegeben, berechnet MiniOS diese anhand des gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Bei jedem Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc`, oder `zstd` aus; die Verfügbarkeit hängt vom laufenden Kernel ab. Wenn nicht angegeben, bleibt die Kernel-Standardoption erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Bei jedem Start | Legt das Standard-Systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Bei jedem Start | Aktiviert die angegebenen systemd-Dienste beim Start. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Bei jedem Start | Deaktiviert die angegebenen systemd-Dienste beim Start. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Bei jedem Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardauflösung ist 1280x800. | `novirtres` |
| `virtres` | Bei jedem Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Bei jedem Start | Führt nur die aufgeführten live-config-Komponenten in der angegebenen Reihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Bei jedem Start | Führt alle live-config-Komponenten aus, außer den aufgeführten. | `nocomponents=anacron,apport` |
| `hostname` | Bei jedem Start | Legt den System-Hostnamen fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den Benutzernamen für die automatische Anmeldung fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Setzt das Root-Passwort im Klartext. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Setzt das Root-Passwort als Crypt-Hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Setzt das Benutzerpasswort im Klartext. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Setzt das Benutzerpasswort als Crypt-Hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Bei jedem Start | Legt ein oder mehrere System-Locales fest. | `locales=en_US.UTF-8` |
| `timezone` | Bei jedem Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Bei jedem Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Bei jedem Start | Legt kommaseparierte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Bei jedem Start | Legt kommaseparierte Tastatur-Varianten entsprechend den Layouts fest. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Bei jedem Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config Sudo- und PolicyKit-Rechte vergibt. | `noroot` |
| `noautologin` | Bei jedem Start | Verhindert, dass live-config die automatische Anmeldung an Konsole und grafischer Oberfläche einrichtet; bestehende persistente Konfiguration wird nicht entfernt. | `noautologin` |
| `nottyautologin` | Bei jedem Start | Verhindert nur die Einrichtung der automatischen Anmeldung an der Konsole; bestehende persistente Konfiguration wird nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Bei jedem Start | Verhindert nur die Einrichtung der automatischen Anmeldung an der grafischen Oberfläche; bestehende persistente Konfiguration wird nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Bei jedem Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung aus. | `xorg-driver=nouveau` |
| `xorg-resolution` | Bei jedem Start | Legt die Xorg-Auflösung fest, anstatt sie automatisch zu erkennen. | `xorg-resolution=1920x1080` |
| `module-mode` | Bei jedem Start | Mit `merged`, übernimmt Konfigurationsänderungen in das laufende Live-System. | `module-mode=merged` |
| `link-user-dirs` | Bei jedem Start | Verknüpft die verwalteten Benutzerverzeichnisse mit beschreibbaren MiniOS-Medien. Dies ist nicht kombinierbar mit `bind-user-dirs` und nicht verfügbar bei jedem `toram`-Modus oder wenn die aktive Persistenzsitzung LUKS-verschlüsselt ist. Die aktive Verschlüsselung wird aus der laufenden Sitzung ermittelt, nicht aus der `perchencrypt`-Erstellungsanfrage. | `link-user-dirs` |
| `bind-user-dirs` | Bei jedem Start | Bindet die verwalteten Benutzerverzeichnisse von beschreibbaren MiniOS-Medien ein. Es gelten die gleichen `toram` und Einschränkungen bezüglich aktiver Sitzungsverschlüsselung wie bei `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Bei jedem Start | Legt den medienrelativen Speicherort fest, der von `link-user-dirs` oder `bind-user-dirs` verwendet wird. Standard: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Bei jedem Start | Lädt und führt Hooks vom Dateisystem, vom Live-Medium oder von wget-kompatiblen URLs aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Sicherheitshinweise

Die Kernel-Befehlszeile ist Klartext und normalerweise in der Bootloader-Konfiguration, `/proc/cmdline` und Diagnosen sichtbar. Legen Sie keine wiederverwendbaren Geheimnisse in `root-password=` oder `user-password=` ab. Verwenden Sie vorzugsweise die entsprechenden `*-crypted`-Parameter, behandeln Sie aber auch veröffentlichte Passwort-Hashes als sensibel.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook bietet weder Transportverschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad manipulieren kann, ihn ersetzen könnte. Verwenden Sie nur Inhalte und Übertragungswege, denen Sie vertrauen; verwenden Sie keinen nicht authentifizierten HTTP-Hook für sicherheitskritische Starts.

Befehle werden durch Leerzeichen getrennt. Siehe die Referenzseiten zu `man bootparam` für weitere Kernel-Parameter, die für alle Linux-Distributionen gelten.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/reference/configuration/live-config).

Informationen zum Laden von MiniOS über das Netzwerk (PXE und HTTP ISO) finden Sie unter [Netzwerk-Boot](/reference/boot-process/Network-Boot).
