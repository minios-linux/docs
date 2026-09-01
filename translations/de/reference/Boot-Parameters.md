---
updated: 2026-08-26
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

Die Spalte „Anwendung“ unterscheidet Parameter, die normalerweise bei jedem Start akzeptiert werden, von Kontoeinstellungen, die für die Ersteinrichtung gedacht sind. Bei Persistenz werden live-config-Komponenten normalerweise nur einmal ausgeführt; siehe [live-config](/reference/configuration/live-config).

Diese Tabelle dient als schnelle Referenz. Die Priorität der Quellen und akzeptierte `from=`-Formen sind in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery) definiert, die Modulauswahl in [Initrd-Modulladen](/reference/boot-process/Module-Loading), die Persistenz-Auswahl in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) und unterstützte Kombinationen in [Boot-Modi](/using-minios/Boot-Modes).

| Parameter | Anwendung | Beschreibung | Beispiel |
|---|---|---|---|
| `from` | Jeder Start | Lädt MiniOS-Daten aus einem Verzeichnis, einem unterstützten Gerätepfad oder einer ISO. UUID-, PARTUUID- und by-id-Geräteformen werden nicht ausgewertet. Eine wörtliche **`http://` only**-URL hat Vorrang vor `ip=` und startet den [Netzwerk-Boot](/reference/boot-process/Network-Boot) über httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Jeder Start | Begrenzt `.sb`-Kandidaten auf solche, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht; Kommata werden zu Alternativen, und ein vollständiger aufsteigender Zahlenbereich wird speziell erweitert. Filtert auch `toram=trim`. Dies kann Kern- oder Kernel-Module ausschließen und das System unbootbar machen. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Jeder Start | Schließt Kandidaten aus, deren Pfad einem nicht verankerten erweiterten regulären Ausdruck entspricht, auch aus `toram=trim`; wird nach `load` angewendet und kann Kern- oder Kernel-Module ausschließen. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Jeder Start | Legt die Bundle-Erweiterung fest. Standard: `sb`. Die Kernel-Koordination verwendet weiterhin wörtliche `.sb`-Namen, daher kann eine benutzerdefinierte Erweiterung das `01-kernel`-Modul nicht koordinieren. | `bext=mymod` |
| `timing` | Jeder Start | Aktiviert die Ausgabe der Startzeitmessung. | `timing` |
| `union` | Jeder Start | Wählt das Union-Dateisystem aus. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Jeder Start | Statische Adresse für den frühen Netzwerkabruf. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (Standard-PXE-HTTP-Port **7529**). Eine wörtliche `from=http://...` hat Vorrang vor `ip=` und verwendet deren Adressfelder; andernfalls erzwingt jeder nicht-leere `ip=` den PXE-Daten-Download und überspringt lokale Medien. Dies ist keine NetworkManager-Konfiguration für die Sitzung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Jeder Start | httpfs-Cachegröße in MiB für HTTP-ISO-Netzwerk-Boot (`from=http://…`). Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Jeder Start | Öffnet eine Debug-Shell am Ende der Initramfs-Phase. | `rd.break` |
| `perchdir` | Jeder Start | Wählt eine nummerierte Persistenz-Sitzung oder eine Aktion: `resume`, `new` oder `ask`. Ein nicht vorhandener numerischer Selektor kann auf den Metadaten-Standard zurückfallen; er reserviert oder erstellt diese Nummer nicht. Ein Geräte-/Pfad- oder `askdisk`-Form wählt einen anderen Persistenzspeicherort. Für einen benutzerdefinierten Pfad einen Doppelpunkt als Suffix verwenden. Ohne Persistenz-Parameter startet MiniOS sauber. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Jeder Start | Containergröße für `dynfilefs`, `raw` und `luks`; gilt nicht für `native` oder `squashfs`. Eine reine Zahl oder `M`/`MB`-Wert wird in MiB zugewiesen; `G`/`GB` und `T`/`TB` werden in 1000 bzw. 1.000.000 MiB umgerechnet. Das Limit beträgt 1.000.000 MiB, zusätzlich begrenzt durch den verfügbaren Speicherplatz nach `perchreserve`. Der MiniOS-Sitzungsmanager begrenzt Raw- und LUKS-Dateien auf 4000 MiB auf FAT32; initrd-LUKS setzt dieses Limit ebenfalls, aber eine zu große initrd-Raw-Anfrage kann fehlschlagen, statt reduziert zu werden. Neue Raw- und LUKS-Container haben standardmäßig 4000 MiB. Vom Initramfs erstellte DynFileFS-Container verwenden standardmäßig die verfügbare Kapazität, abgerundet auf 1000 MiB; der MiniOS-Sitzungsmanager setzt standardmäßig 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Jeder Start | Reservemarge und Warnschwelle für wenig Speicherplatz in MiB. Sie wird beim Anlegen oder Vergrößern neuer Container abgezogen, ist aber kein Laufzeit-Kontingent und verhindert spätere Schreibvorgänge, die das Gerät füllen. Standard: 256; Maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Jeder Start | Persistenz-Speichermodus.<br>`native` (Standard): ein Verzeichnis auf einem beschreibbaren POSIX-Dateisystem.<br>`dynfilefs`: ein erweiterbarer Container, auch auf FAT32, NTFS oder exFAT.<br>`raw`: ein ext4-Image mit fester Größe.<br>`luks`: ein LUKS2-verschlüsselter ext4-Container; Erstellung und Entsperrung erfolgen an der Konsole und erfordern Crypt-Unterstützung im Initramfs.<br>`squashfs`: ein vorhandener komprimierter Snapshot, der für die Sitzung entpackt wird. Der MiniOS-Sitzungsmanager kann SquashFS-Snapshots aus dem laufenden System erstellen und speichern; das Initramfs kann sie wiederherstellen, aber nicht erstellen. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Jeder Start | Aktiviert den Legacy-Persistenz-Wiederherstellungspfad. Im Gegensatz zu `perchdir=resume` wird kein kompatibler Ersatz automatisch erstellt, wenn keine verwendbare Standardsitzung existiert. | `perch` |
| `toram` | Jeder Start | Reines `toram` ist `full`. Bei Persistenz lässt die vollständige Kopie auf oberster Ebene `*` Dotfiles aus; ohne Persistenz werden `changes` ausgelassen, aber andere Einträge auf oberster Ebene, einschließlich Dotfiles, kopiert. Trim kopiert erforderliche `config.conf`, reguläre `authorized_keys`, ausgewählte Top-Level- und rekursive Module sowie den vollständigen `changes/`-Baum, wenn Persistenz angefordert wird; es lässt `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Logs, andere Nicht-Modul-Daten und die separate Persistenzmodul-Ebene aus. Keiner der Modi prüft zuerst die Kapazität von RAM. Ein auf RAM kopierter Persistenzspeicher ist nicht dauerhaft, Änderungen werden nicht zurückkopiert. Entfernen Sie das Medium erst, nachdem Sie bestätigt haben, dass Quelle, Loops und Zuordnungen erfolgreich getrennt wurden. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Jeder Start | Startet im Textkonsolenmodus. | `text` |
| `automount` | Jeder Start | Aktiviert das automatische Einbinden von Speichermedien. | `automount` |
| `debug` | Jeder Start | Aktiviert zusätzliche Startdiagnosen. | `debug` |
| `nozram` | Jeder Start | Deaktiviert zram-Swap. | `nozram` |
| `zramsize` | Jeder Start | Legt die zram-Swap-Größe in MiB fest. Wenn nicht angegeben, berechnet MiniOS sie aus dem gesamten RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Jeder Start | Wählt `lzo`, `lzo-rle`, `lz4`, `lz4hc` oder `zstd`; Verfügbarkeit abhängig vom laufenden Kernel. Wenn nicht angegeben, bleibt der Kernel-Standard erhalten. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Jeder Start | Legt das Standard-Systemd-Target fest. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Jeder Start | Aktiviert angegebene systemd-Dienste beim Booten. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Jeder Start | Deaktiviert angegebene systemd-Dienste beim Booten. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Jeder Start | Deaktiviert automatische Bildschirmauflösungsänderungen in virtuellen Maschinen. Die XFCE-Standardeinstellung ist 1280x800. | `novirtres` |
| `virtres` | Jeder Start | Legt die XFCE-Bildschirmauflösung in virtuellen Maschinen fest. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Jeder Start | Führt nur die aufgeführten live-config-Komponenten in Komponentenreihenfolge aus. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Jeder Start | Führt alle live-config-Komponenten außer den aufgeführten aus. | `nocomponents=anacron,apport` |
| `hostname` | Jeder Start | Legt den System-Hostname fest. | `hostname=minios` |
| `username` | Ersteinrichtung | Legt den für Autologin erstellten Benutzernamen fest. | `username=live` |
| `user-default-groups` | Ersteinrichtung | Legt die Standardgruppen des erstellten Benutzers fest. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Ersteinrichtung | Legt den vollständigen Namen des erstellten Benutzers fest. | `user-fullname="MiniOS Live User"` |
| `root-password` | Ersteinrichtung | Legt das Root-Passwort im Klartext fest. | `root-password=toor` |
| `root-password-crypted` | Ersteinrichtung | Legt das Root-Passwort als Crypt-Hash fest. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Ersteinrichtung | Legt das Benutzerpasswort im Klartext fest. | `user-password=live` |
| `user-password-crypted` | Ersteinrichtung | Legt das Benutzerpasswort als Crypt-Hash fest. | `user-password-crypted=$y$j9T$...` |
| `locales` | Jeder Start | Legt eine oder mehrere System-Locales fest. | `locales=en_US.UTF-8` |
| `timezone` | Jeder Start | Legt die Systemzeitzone fest. | `timezone=Europe/Berlin` |
| `keyboard-model` | Jeder Start | Legt das Tastaturmodell fest. | `keyboard-model=pc105` |
| `keyboard-layouts` | Jeder Start | Legt kommaseparierte Tastaturlayouts fest. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Jeder Start | Legt kommaseparierte Tastaturvarianten entsprechend den Layouts fest. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Jeder Start | Legt Tastaturoptionen fest. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Ersteinrichtung | Verhindert, dass live-config sudo- und policykit-Rechte vergibt. | `noroot` |
| `noautologin` | Jeder Start | Verhindert, dass live-config Console- und grafisches Autologin einrichtet; bestehende persistente Konfiguration wird nicht entfernt. | `noautologin` |
| `nottyautologin` | Jeder Start | Verhindert nur die Einrichtung von Console-Autologin; bestehende persistente Konfiguration wird nicht entfernt. | `nottyautologin` |
| `nox11autologin` | Jeder Start | Verhindert nur die Einrichtung von grafischem Autologin; bestehende persistente Konfiguration wird nicht entfernt. | `nox11autologin` |
| `xorg-driver` | Jeder Start | Wählt einen Xorg-Treiber anstelle der automatischen Erkennung. | `xorg-driver=nouveau` |
| `xorg-resolution` | Jeder Start | Legt die Xorg-Auflösung anstelle der automatischen Erkennung fest. | `xorg-resolution=1920x1080` |
| `module-mode` | Jeder Start | In Verbindung mit `merged` werden Konfigurationsänderungen in das laufende Live-System übernommen. | `module-mode=merged` |
| `hooks` | Jeder Start | Ruft Hooks vom Dateisystem, Live-Medium oder von wget-unterstützten URLs ab und führt sie aus. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Sicherheitshinweise

Die Kernel-Befehlszeile ist Klartext und normalerweise in der Bootloader-Konfiguration, `/proc/cmdline` und Diagnosen sichtbar. Legen Sie keine wiederverwendbaren Geheimnisse in `root-password=` oder `user-password=` ab. Verwenden Sie vorzugsweise die entsprechenden `*-crypted`-Parameter, behandeln Sie aber auch veröffentlichte Passwort-Hashes als sensibel.

Hooks werden als privilegierter Boot-Code ausgeführt. Ein `http://`-Hook bietet weder Transportverschlüsselung noch Serverauthentifizierung, sodass jeder, der den Netzwerkpfad manipulieren kann, ihn ersetzen könnte. Verwenden Sie nur Inhalte und Übertragungswege, denen Sie vertrauen; verwenden Sie keinen nicht authentifizierten HTTP-Hook für sicherheitskritische Starts.

Befehle werden durch Leerzeichen getrennt. Siehe die Referenzseiten zu `man bootparam` für weitere Kernel-Parameter, die für alle Linux-Distributionen gelten.

Detaillierte Informationen zu live-config-Parametern finden Sie unter [live-config](/reference/configuration/live-config).

Informationen zum Laden von MiniOS über das Netzwerk (PXE und HTTP ISO) finden Sie unter [Netzwerk-Boot](/reference/boot-process/Network-Boot).
