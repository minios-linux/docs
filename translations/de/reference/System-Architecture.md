---
updated: 2026-09-16
---

# Systemarchitektur

MiniOS startet ein schreibgeschütztes Betriebssystem, das aus SquashFS-Modulen zusammengesetzt ist, und fügt eine beschreibbare Schicht für die aktuelle Sitzung hinzu. Das initramfs ist dafür verantwortlich, das Medium zu finden, Module und Persistenz auszuwählen, das Root-Dateisystem zu erstellen, frühe Konfigurationen anzuwenden und die Kontrolle an das installierte Init-System zu übergeben.

## Boot-Erkennung

Der BIOS- oder UEFI-Bootloader lädt einen Linux-Kernel und MiniOS initramfs von `minios/boot/`. Das initramfs erkennt dann den MiniOS-Datenbaum, der die Live-Module enthält. Eine Quelle kann lokal sein, interaktiv ausgewählt oder über einen unterstützten Netzwerkpfad bereitgestellt werden; ein lokales ISO wird per Loop-Mount eingebunden, bevor dessen Datenbaum verwendet wird. Die genaue Reihenfolge und akzeptierte `from=`-Formate sind unter [Initrd-Systemerkennung](/reference/boot-process/System-Discovery) dokumentiert.

Die gleiche Erkennungsphase unterstützt HTTP-ISO- und PXE-Quellen. Optionales Netzwerk im Frühstart dient ausschließlich zum **Laden von MiniOS über das Netzwerk** (PXE / HTTP ISO). Es handelt sich dabei nicht um eine dauerhafte Netzwerkkonfiguration für die Sitzung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

Nach der Erkennung kann MiniOS optional eine RAM-Kopie vorbereiten. Ob die Originalquelle weiterhin benötigt wird, hängt vom Kopiermodus, der Persistenz und dem erfolgreichen Trennen ab. Das Betriebsmodell finden Sie unter [Boot-Modi](/using-minios/Boot-Modes).

## Modulkombination

Jede `.sb`-Datei ist ein schreibgeschütztes SquashFS-Dateisystem. Eingebaute Module werden direkt unter `minios/` gespeichert; zusätzliche Modulpfade können zur geordneten Zusammensetzung beitragen. Das initramfs wählt, ordnet und mountet die resultierenden schreibgeschützten Schichten. Kandidatenebenen, Basename-Ersetzung, Filter, benutzerdefinierte Bundle-Erweiterungen und Koordination mit dem laufenden Kernel sind unter [Initrd-Modulladung](/reference/boot-process/Module-Loading) beschrieben.

Ein typisches Xfce-Image enthält die folgenden geordneten Rollen, wobei genaue Namen und Anzahl vom Build und ausgelassenen Modulen für das jeweilige Ziel abhängen:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Spätere Module haben eine höhere Priorität und können Pfade ersetzen, die von früheren Modulen bereitgestellt werden. Ein Modul kann von Dateien in jedem niedriger nummerierten Modul abhängen, daher ist eine Menge von Moduldateien eine geordnete Komposition und keine Sammlung unabhängiger Pakete.

## AUFS und OverlayFS

MiniOS verwendet ein Union-Dateisystem, um die Module und die beschreibbare Ebene als ein gemeinsames Root-Dateisystem darzustellen. Wenn der laufende Kernel es unterstützt, wählt es AUFS; andernfalls wird auf OverlayFS zurückgegriffen. `union=aufs`fordert AUFS an, fällt aber dennoch auf OverlayFS zurück, wenn AUFS nicht verfügbar ist; `union=overlayfs`wählt OverlayFS. Unter UEFI Secure Boot lädt initrd das unsignierte `aufs-ng`Modul nicht und verwendet OverlayFS, sofern keine andere nutzbare AUFS-Implementierung bereits vorhanden ist.

Die beiden Implementierungen unterscheiden sich in einem wichtigen Punkt im Betrieb:

- AUFS startet mit dem beschreibbaren Zweig und fügt eingehängte Module als schreibgeschützte Zweige hinzu. MiniOS kann ein Modul im laufenden Root aktivieren oder deaktivieren, sofern der AUFS-Mount diese Operation unterstützt.
- OverlayFS erhält seine vollständige, geordnete `lowerdir`Liste beim Mounten des Root-Dateisystems sowie eine `upperdir`und `workdir`. Seine Untermodul-Menge kann von **MiniOS-Modulmanager**.

**MiniOS-Modulmanager**daher wird getrennt zwischen **Aktuell ausgeführt**, dem aktuell eingehängten Modulsatz, und **Nächster Start**, den Modulen, die durch aktuelle Medien und Bootregeln ausgewählt werden. Das Hinzufügen oder Entfernen eines dauerhaften Moduls beeinflusst normalerweise nur den nächsten Start. Ein Modul zu erstellen oder zu öffnen, aktiviert es nicht. Die Laufzeitaktivierung und -deaktivierung sind nur mit AUFS möglich.

Nachdem das Root-Dateisystem zusammengebaut und die frühe Initialisierung abgeschlossen ist, verwendet das LiveKit-initrd `pivot_root`, behält das alte initrd für Aufgaben beim Herunterfahren und startet das Init des neuen Root-Dateisystems. Der dracut-Pfad bereitet dasselbe zusammengebaute Root vor, überlässt aber die abschließende `switch_root`dracut. Siehe [Initrd-Modulladen](/reference/boot-process/Module-Loading) für die genaue Übergabegrenze.

## Beschreibbare Ebene und Sitzungen

Ohne Persistenz ist die beschreibbare Ebene speicherbasiert und geht beim Herunterfahren verloren. Mit Persistenz kann stattdessen eine nummerierte Sitzung mit einem unterstützten Speicher-Backend aktiviert werden. Auswahl, Kompatibilität, Aktivierungsfehler, Autorisierung beim aktuellen Start und Dauerhaftigkeit werden in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Modus | Beschreibbarer Speicher | Hinweise |
|------|------------------|-------|
| `native` | Dateien werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem, das Linux-Metadaten erhält. |
| `dynfilefs` | Erweiterbares ext4-Dateisystem, verteilt auf Backing-Dateien | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das von `volumeNNN.db`-Dateien unterstützt wird | Erfordert DynBlk-Nutzerbereich, Kernel und Initrd-Funktionalität. |
| `raw` | Feste Größe `changes.img` mit ext4-Inhalt | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `squashfs` | Komprimiertes `changes.sb`-Schnappschuss | Wird für die Nutzung in RAM entpackt; beim Speichern wird der Schnappschuss neu erstellt und atomar ersetzt. Das Persistenz-Dateisystem muss beim Speichern Linux-Metadaten erhalten. |

Raw, DynFileFS und DynBlk können optional eine LUKS2-Schicht enthalten. Die Metadaten erfassen das Speicher-Backend und die Verschlüsselung getrennt. Beim Herunterfahren werden ext4, der Mapper, eventuell zugehörige Loop-Devices und das Backend in Abhängigkeitsreihenfolge freigegeben.

Die für einen späteren Resume ausgewählte aktive Sitzung und die tatsächlich für den aktuellen Start autorisierte beschreibbare Ebene sind verwandte, aber unterschiedliche Zustände. Eine Änderung der zukünftigen Auswahl ersetzt nicht die laufende beschreibbare Ebene.

Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) für Befehle zu Erstellung, Auswahl, Größenanpassung, Verschlüsselung, Konvertierung, Export und Wiederherstellung.

## Konfigurationspriorität

Die Medienkonfiguration ist `minios/config.conf`, mit optionalen Fragmenten in `minios/config.conf.d/`. Die Laufzeitkopien sind `/etc/live/config.conf` und `/etc/live/config.conf.d/` im zusammengesetzten Root.

Beim Booten vergleicht MiniOS die Änderungszeiten und kopiert eine neuere Mediendatei in das Laufzeit-Root. Ist das Medium beschreibbar und die Laufzeitkopie neuer, wird sie zurück auf das Medium kopiert. Fragmentdateien werden in beide Richtungen nach Dateinamen synchronisiert. Wenn die Uhr seit der letzten Synchronisierung zurückgestellt wurde, vermeidet MiniOS das Ersetzen von Zeitstempeln und füllt nur fehlende Ziele auf.

Kernel-Befehlszeilenoptionen überschreiben die entsprechenden Werte aus der Laufzeitkonfiguration für diesen Boot. Daraus ergibt sich folgende Reihenfolge für eine explizit unterstützte Einstellung: Boot-Parameter, dann die synchronisierte Laufzeit-/Medienkonfiguration, dann der eingebaute Standardwert. Persistente Laufzeitänderungen können zur Medienkonfiguration werden, wenn die Quelle beschreibbar ist; schreibgeschützte ISO-Medien können dieses Update nicht erhalten.

Siehe [Konfigurationsdatei](/reference/configuration/config.conf) und [live-config](/reference/configuration/live-config) für die unterstützten Einstellungen.

## Shutdown- und Speicher-Lebenszyklus

Beim regulären Herunterfahren erhält das laufende System zunächst die Möglichkeit, Dienste und Sitzungsdaten zu schreiben. Eine SquashFS-Sitzung mit aktiviertem Speichern beim Herunterfahren wird vor dem Aushängen des Dateisystems neu aufgebaut und validiert. Das Speicher-Backend schreibt einen Abschlussmarker für genau die laufende Sitzung; das Shutdown-initramfs prüft diesen Marker und belässt die Sitzung im Fehlerfall als "dirty".

Das Shutdown-initramfs trennt dann ungenutzte Loop-Devices, hängt das alte Root und die beschreibbare Schicht aus, markiert eine erfolgreiche Sitzung als sauber, hängt das Medium aus und schließt ein von MiniOS verwaltetes LUKS-Mapping. Optische Medien können danach vor dem Ausschalten oder Neustart ausgeworfen werden. Manuelle und periodische SquashFS-Sicherungen nutzen dasselbe Snapshot-Backend, aber nur die konfigurierte Shutdown-Policy blockiert die saubere Finalisierung bei fehlendem Shutdown-Save.

## Medienbaum

Ein aktuelles Image ist wie folgt organisiert. Optionale Verzeichnisse erscheinen nur, wenn die zugehörige Funktion Inhalte erstellt hat.

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

Die gebooteten Pfade unter `/run/initramfs/memory/` sind Implementierungs-Mounts und keine zweite persistente Kopie dieses Baums.

## Zugehörige Dokumentation

- [Boot-Modi](/using-minios/Boot-Modes)
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery)
- [Initrd-Modulladen](/reference/boot-process/Module-Loading)
- [Initrd-Persistenz](/reference/boot-process/Persistence-Internals)
- [Boot-Parameter](/reference/Boot-Parameters)
- [Boot-Menüs](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Konfigurationsdatei](/reference/configuration/config.conf)
- [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence)
- [Netzwerk-Boot](/reference/boot-process/Network-Boot)
- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
