# MiniOS-Systemarchitektur

MiniOS startet ein schreibgeschütztes Betriebssystem, das aus SquashFS-Modulen zusammengesetzt ist, und fügt für die aktuelle Sitzung eine beschreibbare Ebene hinzu. Das initramfs ist dafür verantwortlich, das Medium zu finden, Module und Persistenz auszuwählen, das Root-Dateisystem zu erstellen, frühe Konfigurationen anzuwenden und die Kontrolle an das installierte Init-System zu übergeben.

## Boot-Erkennung

Der BIOS- oder UEFI-Bootloader lädt einen Linux-Kernel und das MiniOS-initramfs von `minios/boot/`. Das initramfs durchsucht anschließend Blockgeräte nach einem `minios`-Verzeichnis, das `.sb`-Module enthält. Der Boot-Parameter `from=` kann stattdessen ein Verzeichnis, Blockgerät und Pfad, eine lokale ISO-Datei oder eine interaktive `askdisk`-Auswahl angeben. Eine lokale ISO wird per Loop eingebunden, bevor ihr `minios`-Verzeichnis verwendet wird.

Die gleiche Erkennungsphase unterstützt HTTP-ISO- und PXE-Quellen. Optionales Netzwerk im Frühstart dient ausschließlich dem **Laden von MiniOS über das Netzwerk** (PXE / HTTP-ISO). Es handelt sich nicht um eine dauerhafte Netzwerkkonfiguration für die Sitzung. Siehe [Netzwerk-Boot](/installation/Network-Boot.md).

Nach der Erkennung kann `toram=trim` die ausgewählten Module und benötigten Daten in den RAM kopieren, während `toram=full` den Mediadatenbaum kopiert. Weitere Informationen zu Quelle, Filterung und RAM-Kopieroptionen finden Sie unter [Boot-Parameter](/configuration/Boot-Parameters.md).

## Modulkombination

Jede `.sb`-Datei ist ein schreibgeschütztes SquashFS-Dateisystem. Eingebaute Module werden direkt unter `minios/` gespeichert; zusätzliche Module können unter `minios/modules/` abgelegt werden, einschließlich dauerhafter Modulablage auf einem beschreibbaren Persistenzgerät. Das initramfs erkennt beide Speicherorte, wendet `load=`- und `noload=`-Filter an, sortiert die ausgewählten Dateien nach ihrem numerischen Dateinamen-Präfix und bindet sie schreibgeschützt ein.

Ein typisches Xfce-Image enthält die folgenden geordneten Rollen, wobei genaue Namen und Nummern vom Build und den für das Ziel übersprungenen Modulen abhängen:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Später eingebundene Module haben eine höhere Priorität und können Pfade ersetzen, die von früheren Modulen bereitgestellt werden. Ein Modul kann von Dateien in jedem niedriger nummerierten Modul abhängen, sodass eine Menge von Moduldateien eine geordnete Komposition und keine Sammlung unabhängiger Pakete ist.

## AUFS und OverlayFS

MiniOS verwendet ein Union-Dateisystem, um die Module und die beschreibbare Ebene als ein gemeinsames Root-Dateisystem darzustellen. Es wählt AUFS, wenn der laufende Kernel dies unterstützt, und greift andernfalls auf OverlayFS zurück. `union=aufs` fordert AUFS an, fällt aber dennoch auf OverlayFS zurück, wenn AUFS nicht verfügbar ist; `union=overlayfs` wählt OverlayFS.

Die beiden Implementierungen unterscheiden sich im Betrieb wesentlich:

- AUFS beginnt mit dem beschreibbaren Zweig und fügt eingebundene Module als schreibgeschützte Zweige hinzu. MiniOS kann ein Modul im laufenden Root aktivieren oder deaktivieren, sofern das AUFS-Mount dies unterstützt.
- OverlayFS erhält beim Mounten des Root sein vollständiges, geordnetes `lowerdir`-Verzeichnis, sowie ein `upperdir` und `workdir`. Das Set der unteren Module kann vom Module Manager nicht im laufenden Betrieb verändert werden.

Der Module Manager unterscheidet daher zwischen **Jetzt aktiv**, dem aktuell eingebundenen Modulsatz, und **Nächster Start**, den durch aktuelles Medium und Bootregeln ausgewählten Modulen. Das Hinzufügen oder Entfernen eines dauerhaften Moduls wirkt sich normalerweise nur auf den nächsten Start aus. Das Erstellen oder Öffnen eines Moduls aktiviert dieses nicht. Laufzeit-Aktivierung und -Deaktivierung sind nur mit AUFS möglich.

## Schreibbare Ebene und Sitzungen

Ohne Persistenz ist die beschreibbare Ebene speicherbasiert (RAM) und verschwindet beim Herunterfahren. Persistenz legt diese Ebene in einer nummerierten Sitzung unter `minios/changes/` ab. `session.conf` speichert die Standardsitzung für den nächsten Start, die im aktuellen Boot verwendete Sitzung, Kompatibilitätsmetadaten, Status und modusspezifische Einstellungen.

| Modus | Beschreibbarer Speicher | Hinweise |
|------|-------------------------|----------|
| `native` | Dateien werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem, das Linux-Metadaten erhält. |
| `dynfilefs` | Erweiterbares ext4-Dateisystem, verteilt auf Backing-Dateien | Unterstützt POSIX-Dateisysteme sowie FAT32, NTFS oder exFAT-Medien. |
| `raw` | Feste `changes.img` mit ext4 | Unterstützt POSIX-Dateisysteme sowie FAT32, NTFS oder exFAT-Medien. |
| `luks` | LUKS2-`changes.luks` mit ext4 | Erfordert cryptsetup und ein mit MiniOS-Verschlüsselungsunterstützung gebautes initramfs. Das Passwort wird beim Booten abgefragt. |
| `squashfs` | Komprimierter `changes.sb`-Snapshot | Wird zum Gebrauch in den RAM entpackt; das Speichern erstellt und ersetzt den Snapshot atomar. Das Persistenz-Dateisystem muss beim Speichern Linux-Metadaten erhalten. |

Die aktive Sitzung ist die Standardauswahl für den nächsten Start. Die laufende Sitzung ist diejenige, die bereits ins aktuelle Root eingebunden ist. Das Aktivieren einer anderen Sitzung ersetzt nicht die aktuelle beschreibbare Ebene. Kompatibilitätsprüfungen für Sitzungen umfassen die MiniOS-Version, Edition, das Union-Dateisystem und den Persistenzmodus.

Siehe [Sitzungsverwaltung](/configuration/Session-Management.md) für Befehle zur Erstellung, Auswahl, Größenanpassung, Verschlüsselung, Konvertierung, Export und Wiederherstellung.

## Konfigurationsreihenfolge

Die Medienkonfiguration ist `minios/config.conf`, mit optionalen Fragmenten in `minios/config.conf.d/`. Die Laufzeitkopien sind `/etc/live/config.conf` und `/etc/live/config.conf.d/` im zusammengesetzten Root.

Beim Start vergleicht MiniOS die Änderungszeiten und kopiert eine neuere Mediendatei ins Laufzeit-Root. Ist das Medium beschreibbar und die Laufzeitkopie neuer, wird sie zurück auf das Medium kopiert. Fragmentdateien werden anhand des Dateinamens in beide Richtungen synchronisiert. Wenn die Uhr seit der letzten Synchronisation zurückgestellt wurde, vermeidet MiniOS das Ersetzen von Zeitstempeln und füllt nur fehlende Ziele auf.

Kernel-Befehlszeilenoptionen überschreiben die entsprechenden Werte aus der Laufzeitkonfiguration für diesen Start. Das bedeutet, dass die effektive Reihenfolge für eine explizit unterstützte Einstellung folgendermaßen ist: Boot-Parameter, dann die synchronisierte Laufzeit-/Medienkonfiguration, dann der eingebaute Standard. Persistente Laufzeitänderungen können zur Medienkonfiguration werden, wenn die Quelle beschreibbar ist; schreibgeschützte ISO-Medien können dieses Update nicht erhalten.

Siehe [Konfigurationsdatei](/configuration/Configuration-File.md) und [live-config](/configuration/live-config.md) für die unterstützten Einstellungen.

## Herunterfahren und Speicher-Lebenszyklus

Beim normalen Herunterfahren erhält das laufende System zunächst die Möglichkeit, Dienste und Sitzungsdaten zu schreiben. Eine SquashFS-Sitzung mit aktiviertem Speichern beim Herunterfahren wird vor dem Aushängen des Dateisystems neu erstellt und validiert. Das Speicher-Backend schreibt eine Abschlussmarkierung für genau die laufende Sitzung; das Shutdown-initramfs prüft diese Markierung und lässt die Sitzung als "dirty" zurück, falls das erforderliche Speichern fehlschlug.

Das Shutdown-initramfs trennt anschließend ungenutzte Loop-Devices, hängt das alte Root und die beschreibbare Ebene aus, markiert eine erfolgreiche Sitzung als sauber, hängt das Medium aus und schließt ein von MiniOS verwaltetes LUKS-Mapping. Optische Medien können dann vor dem Ausschalten oder Neustart ausgeworfen werden. Manuelle und periodische SquashFS-Speicherungen nutzen dasselbe Snapshot-Backend, aber nur die konfigurierte Speicherpolitik beim Herunterfahren verhindert eine saubere Finalisierung bei fehlendem Shutdown-Save.

## Medienbaum

Ein aktuelles Image ist wie folgt organisiert. Optionale Verzeichnisse erscheinen nur, wenn die jeweilige Funktion Inhalte erzeugt hat.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

Die gebooteten Pfade unter `/run/initramfs/memory/` sind Implementierungs-Mounts, keine zweite persistente Kopie dieses Baums.

## Verwandte Dokumentation

- [Boot-Parameter](/configuration/Boot-Parameters.md)
- [Boot-Menüs](/configuration/Boot-Menus.md)
- [Konfigurationsdatei](/configuration/Configuration-File.md)
- [Sitzungsverwaltung](/configuration/Session-Management.md)
- [Netzwerk-Boot](/installation/Network-Boot.md)
- [Module erstellen](/development/Creating-Modules.md)
