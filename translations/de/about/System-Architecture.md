---
updated: 2026-08-26
---

# MiniOS-Systemarchitektur

MiniOS startet ein schreibgeschütztes Betriebssystem, das aus SquashFS-Modulen zusammengesetzt ist, und fügt für die aktuelle Sitzung eine beschreibbare Ebene hinzu. Das initramfs ist dafür verantwortlich, das Medium zu finden, Module und Persistenz auszuwählen, das Root-Dateisystem zu erstellen, frühe Konfigurationen anzuwenden und die Kontrolle an das installierte Init-System zu übergeben.

## Boot-Erkennung

Der BIOS- oder UEFI-Bootloader lädt einen Linux-Kernel und das MiniOS-initramfs von
`minios/boot/`. Das initramfs erkennt anschließend den MiniOS-Datenbaum, der die Live-Module enthält. Eine Quelle kann lokal sein, interaktiv ausgewählt oder über einen unterstützten Netzwerkpfad bereitgestellt werden; ein lokales ISO wird per Loop-Mount eingebunden, bevor dessen Datenbaum verwendet wird. Die genaue Reihenfolge und akzeptierte `from=`-Formate sind in der Dokumentation zu [Initrd-System-Erkennung](/configuration/Initrd-System-Discovery.md) beschrieben.

Die gleiche Erkennungsphase unterstützt HTTP-ISO- und PXE-Quellen. Optionales Netzwerk im Frühstart dient ausschließlich dem **Laden von MiniOS über das Netzwerk** (PXE / HTTP ISO). Es handelt sich dabei nicht um eine dauerhafte Netzwerkkonfiguration für die Sitzung. Siehe [Netzwerk-Boot](/installation/Network-Boot.md).

Nach der Erkennung kann MiniOS optional eine Kopie im RAM vorbereiten. Ob die Originalquelle weiterhin benötigt wird, hängt vom Kopiermodus, der Persistenz und einer erfolgreichen Trennung ab. Das Betriebsmodell finden Sie unter [Boot-Modi](/configuration/Boot-Modes.md).

## Modulkombination

Jede `.sb`-Datei ist ein schreibgeschütztes SquashFS-Dateisystem. Eingebaute Module werden direkt unter `minios/` gespeichert; zusätzliche Modulpfade können zur geordneten Zusammenstellung beitragen. Das initramfs wählt, ordnet und mountet die resultierenden schreibgeschützten Layer. Kandidatenebenen, Basename-Ersetzung, Filter, benutzerdefinierte Bundle-Erweiterungen und Koordination mit dem laufenden Kernel sind in [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md) beschrieben.

Ein typisches Xfce-Image enthält die folgenden geordneten Rollen, wobei genaue Namen und Anzahl vom Build und von für das Ziel übersprungenen Modulen abhängen:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Spätere Module haben eine höhere Priorität und können Pfade ersetzen, die von früheren Modulen bereitgestellt werden. Ein Modul kann auf Dateien in jedem niedriger nummerierten Modul angewiesen sein, sodass eine Menge von Moduldateien eine geordnete Komposition und keine Sammlung unabhängiger Pakete ist.

## AUFS und OverlayFS

MiniOS verwendet ein Union-Dateisystem, um die Module und die beschreibbare Schicht als ein Root-Dateisystem darzustellen. Es wählt AUFS, wenn der laufende Kernel es unterstützt, und greift andernfalls auf OverlayFS zurück. `union=aufs` fordert AUFS an, fällt aber dennoch auf OverlayFS zurück, wenn AUFS nicht verfügbar ist; `union=overlayfs` wählt OverlayFS.

Die beiden Implementierungen unterscheiden sich betrieblich wesentlich:

- AUFS beginnt mit dem beschreibbaren Zweig und fügt gemountete Module als schreibgeschützte Zweige hinzu. MiniOS kann ein Modul im laufenden Root aktivieren oder deaktivieren, sofern das AUFS-Mount dies unterstützt.
- OverlayFS erhält beim Mounten des Root seine vollständige, geordnete `lowerdir`-Liste sowie ein `upperdir` und `workdir`. Das Set der unteren Module kann vom Module Manager nicht im laufenden Betrieb geändert werden.

Der Module Manager trennt daher **Jetzt aktiv**, das aktuell gemountete Modul-Set, von **Nächster Start**, die durch aktuelle Medien und Boot-Regeln ausgewählten Module. Das Hinzufügen oder Entfernen eines dauerhaften Moduls wirkt sich normalerweise nur auf den nächsten Start aus. Das Erstellen oder Öffnen eines Moduls aktiviert es nicht. Die Aktivierung und Deaktivierung zur Laufzeit ist nur mit AUFS möglich.

Nachdem das Root-Dateisystem zusammengesetzt und das frühe Setup abgeschlossen ist, verwendet das LiveKit-initrd `pivot_root`, behält das alte initrd für Shutdown-Aufgaben und startet das init des neuen Root. Der dracut-Pfad bereitet das gleiche zusammengesetzte Root vor, überlässt aber den finalen `switch_root` dracut. Details zur Übergabe finden Sie unter [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md).

## Schreibbare Schicht und Sitzungen

Ohne Persistenz ist die beschreibbare Schicht speicherbasiert und verschwindet beim Herunterfahren. Persistenz kann stattdessen eine nummerierte Sitzung mit einem unterstützten Speicher-Backend aktivieren. Auswahl, Kompatibilität, Aktivierungsfehler, Autorität für den aktuellen Boot und Dauerhaftigkeit sind in [Initrd-Persistenz](/configuration/Initrd-Persistence.md) definiert.

| Modus | Beschreibbarer Speicher | Hinweise |
|------|------------------------|----------|
| `native` | Dateien werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem, das Linux-Metadaten erhält. |
| `dynfilefs` | Erweiterbares ext4-Dateisystem, aufgeteilt auf Backing-Dateien | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `raw` | Feste Größe `changes.img` mit ext4 | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `luks` | LUKS2-`changes.luks` mit ext4 | Erfordert cryptsetup und ein initramfs mit MiniOS-Verschlüsselungsunterstützung. Das Passwort wird beim Booten abgefragt. |
| `squashfs` | Komprimierter `changes.sb`-Snapshot | Wird für die Nutzung ins RAM entpackt; beim Speichern wird der Snapshot neu erstellt und atomar ersetzt. Das Persistenz-Dateisystem muss beim Speichern die Linux-Metadaten erhalten. |

Die für einen zukünftigen Resume ausgewählte aktive Sitzung und die tatsächlich für den aktuellen Boot autorisierte beschreibbare Schicht sind verwandte, aber unterschiedliche Zustände. Eine Änderung der zukünftigen Auswahl ersetzt nicht die laufende beschreibbare Schicht.

Siehe [Sitzungsverwaltung](/configuration/Session-Management.md) für Befehle zur Erstellung, Auswahl, Größenanpassung, Verschlüsselung, Konvertierung, zum Export und zur Wiederherstellung.

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

- [Boot-Modi](/configuration/Boot-Modes.md)
- [Initrd-System-Erkennung](/configuration/Initrd-System-Discovery.md)
- [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md)
- [Initrd-Persistenz](/configuration/Initrd-Persistence.md)
- [Boot-Parameter](/configuration/Boot-Parameters.md)
- [Boot-Menüs](/configuration/Boot-Menus.md)
- [Konfigurationsdatei](/configuration/Configuration-File.md)
- [Sitzungsverwaltung](/configuration/Session-Management.md)
- [Netzwerk-Boot](/installation/Network-Boot.md)
- [Module erstellen](/development/Creating-Modules.md)
