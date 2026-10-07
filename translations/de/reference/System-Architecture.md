---
updated: 2026-10-06
---

# Systemarchitektur

MiniOS startet ein schreibgeschütztes Betriebssystem, das aus SquashFS-Modulen zusammengesetzt ist, und fügt für die aktuelle Sitzung eine beschreibbare Ebene hinzu. Das initramfs ist dafür verantwortlich, das Medium zu finden, Module und Persistenz auszuwählen, das Root-Dateisystem zu erstellen, frühe Konfigurationen anzuwenden und die Kontrolle an das installierte Init-System zu übergeben.

## Boot-Erkennung

Der BIOS- oder UEFI-Bootloader lädt einen Linux-Kernel und MiniOS initramfs von `minios/boot/`. Das initramfs erkennt dann den MiniOS-Datenbaum, der die Live-Module enthält. Eine Quelle kann lokal, interaktiv ausgewählt oder über einen unterstützten Netzwerkpfad bereitgestellt werden; ein lokales ISO wird per Loop eingebunden, bevor dessen Datenbaum verwendet wird. Die genaue Reihenfolge und akzeptierte `from=` Formate sind dokumentiert in [Initrd-Systemerkennung](/reference/boot-process/System-Discovery).

Die gleiche Erkennungsphase unterstützt HTTP-ISO- und PXE-Quellen. Optionales Netzwerk im Frühstart dient ausschließlich zum **Laden von MiniOS über das Netzwerk** (PXE / HTTP ISO). Es handelt sich nicht um eine dauerhafte Netzwerkkonfiguration für die Sitzung. Siehe [Netzwerk-Boot](/reference/boot-process/Network-Boot).

Nach der Erkennung kann MiniOS optional eine RAM-Kopie vorbereiten. Ob die Originalquelle weiterhin benötigt wird, hängt vom Kopiermodus, der Persistenz und erfolgreicher Trennung ab. Siehe [Boot-Modi](/using-minios/Boot-Modes) für das Betriebsmodell.

## Modulzusammensetzung

Jede `.sb`-Datei ist ein schreibgeschütztes SquashFS-Dateisystem. Eingebaute Module werden direkt unter `minios/` gespeichert; zusätzliche Modulpfade können zur geordneten Zusammenstellung beitragen. Das initramfs wählt, ordnet und mountet die resultierenden schreibgeschützten Ebenen. Kandidatenebenen, Basename-Ersatz, Filter, benutzerdefinierte Bundle-Erweiterungen und Koordination mit dem laufenden Kernel werden in [Initrd-Modulladen](/reference/boot-process/Module-Loading).

Ein typisches Xfce-Image enthält die folgenden geordneten Rollen, wobei genaue Namen und Anzahl vom Build und ausgelassenen Modulen für das jeweilige Ziel abhängen:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Später geladene Module haben eine höhere Priorität und können Pfade ersetzen, die von früheren Modulen bereitgestellt wurden. Ein Modul kann auf Dateien aller niedriger nummerierten Module zugreifen, daher ist eine Modulsammlung eine geordnete Komposition und keine Ansammlung unabhängiger Pakete.

## AUFS und OverlayFS

MiniOS verwendet ein Union-Dateisystem, um die Module und die beschreibbare Ebene als ein Root-Dateisystem darzustellen. Es wählt AUFS, wenn der laufende Kernel dies unterstützt, und weicht andernfalls auf OverlayFS aus. `union=aufs` fordert AUFS an, fällt aber auf OverlayFS zurück, wenn AUFS nicht verfügbar ist; `union=overlayfs` wählt OverlayFS. Unter UEFI Secure Boot lädt das initrd das unsignierte `aufs-ng`-Modul nicht und verwendet OverlayFS, sofern nicht bereits eine andere nutzbare AUFS-Implementierung vorhanden ist.

Die beiden Implementierungen unterscheiden sich in einem wichtigen Betriebsaspekt:

- AUFS startet mit dem beschreibbaren Zweig und fügt gemountete Module als schreibgeschützte Zweige hinzu. MiniOS kann ein Modul im laufenden Root aktivieren oder deaktivieren, sofern das AUFS-Mount diese Operation unterstützt.
- OverlayFS erhält beim Mounten des Root sein vollständiges, geordnetes `lowerdir`-Verzeichnis sowie ein `upperdir` und `workdir`. Das Set der unteren Module kann von **MiniOS-Modulmanager** nicht im laufenden Betrieb verändert werden.

**MiniOS-Modulmanager** trennt daher **Aktuell aktiv**, das gemountete Modul-Set, von **Nächster Start**, den Modulen, die durch aktuelles Medium und Boot-Regeln ausgewählt wurden. Das Hinzufügen oder Entfernen eines dauerhaften Moduls wirkt sich normalerweise nur auf den nächsten Start aus. Das Erstellen oder Öffnen eines Moduls aktiviert es nicht. Die Laufzeitaktivierung und -deaktivierung ist nur mit AUFS möglich.

Nachdem das Root-Dateisystem zusammengesetzt und die frühe Einrichtung abgeschlossen ist, verwendet das LiveKit-initrd `pivot_root`, behält das alte initrd für den Shutdown bei und startet das Init des neuen Root. Der dracut-Pfad bereitet das gleiche zusammengesetzte Root vor, überlässt aber das finale `switch_root` an dracut. Siehe [Initrd-Modulladen](/reference/boot-process/Module-Loading) für die genaue Übergabegrenze.

## Beschreibbare Ebene und Sitzungen

Ohne Persistenz ist die beschreibbare Ebene speicherbasiert und verschwindet beim Herunterfahren. Mit Persistenz kann stattdessen eine nummerierte Sitzung mit einem unterstützten Speicher-Backend aktiviert werden. Auswahl, Kompatibilität, Aktivierungsfehler, Autorität des aktuellen Starts und Dauerhaftigkeit sind definiert in [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

| Modus | Beschreibbarer Speicher | Hinweise |
|------|------------------|-------|
| `native` | Dateien werden direkt im Sitzungsverzeichnis gespeichert | Erfordert ein beschreibbares POSIX-Dateisystem, das Linux-Metadaten erhält. |
| `dynfilefs` | Erweiterbares ext4-Dateisystem, verteilt auf Backing-Dateien | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `dynblk` | Schlankes ext4-Dateisystem auf einem Kernel-Blockgerät, das durch `volumeNNN.db`-Dateien | Erfordert die DynBlk-Userspace-, Kernel- und initrd-Funktionalität. |
| `vmdk` | Geteilte Sparse-`volume.vmdk` / `volume-sNNN.vmdk`-Speicher als Blockgerät durch den DynBlk-Treiber bereitgestellt | Erfordert die `vmdk-session-v1` DynBlk/initrd-Funktion; keine Backend-Komprimierung. |
| `raw` | Feste Größe `changes.img` mit ext4 | Unterstützt POSIX-Dateisysteme sowie FAT32-, NTFS- oder exFAT-Medien. |
| `squashfs` | Komprimierter `changes.sb`-Snapshot | Wird für die Nutzung in RAM entpackt; das Speichern erstellt einen neuen Snapshot und ersetzt diesen atomar. Das Persistenz-Dateisystem muss beim Speichern Linux-Metadaten erhalten. |

Raw-, DynFileFS-, DynBlk- und VMDK-Images können optional eine LUKS2-Schicht enthalten. Die Metadaten erfassen das Speicher-Backend und die Verschlüsselung getrennt. Beim Herunterfahren werden ext4, der Mapper, ggf. verwendete Loop-Devices und das Backend in Abhängigkeitsreihenfolge freigegeben.

Die für ein zukünftiges Resume ausgewählte aktive Sitzung und die tatsächlich für den aktuellen Start autorisierte beschreibbare Ebene sind verwandte, aber unterschiedliche Zustände. Eine Änderung der zukünftigen Auswahl ersetzt nicht die laufende beschreibbare Ebene.

Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence) für Befehle zu Erstellung, Auswahl, Größenanpassung, Verschlüsselung, Konvertierung, Export und Wiederherstellung.

## Konfigurations-Priorität

Die Medienkonfiguration ist `minios/config.conf`, mit optionalen Fragmenten in `minios/config.conf.d/`. Die Laufzeitkopien befinden sich in `/etc/live/config.conf` und `/etc/live/config.conf.d/` im zusammengesetzten Root.

Beim Booten vergleicht MiniOS die Änderungszeiten und kopiert eine neuere Mediendatei ins Laufzeit-Root. Ist das Medium beschreibbar und die Laufzeitkopie neuer, wird diese zurück auf das Medium kopiert. Fragmentdateien werden in beide Richtungen nach Dateinamen synchronisiert. Wenn die Uhr seit der letzten Synchronisierung zurückgestellt wurde, vermeidet MiniOS das Ersetzen von Zeitstempeln und füllt nur fehlende Ziele auf.

Kernel-Befehlszeilenoptionen überschreiben für diesen Start die entsprechenden Werte aus der Laufzeitkonfiguration. Das bedeutet, dass die wirksame Reihenfolge für eine explizit unterstützte Einstellung wie folgt ist: Boot-Parameter, dann die synchronisierte Laufzeit-/Medienkonfiguration, dann der eingebaute Standardwert. Persistente Änderungen an der Laufzeitkonfiguration können zur Medienkonfiguration werden, wenn die Quelle beschreibbar ist; schreibgeschützte ISO-Medien können dieses Update nicht erhalten.

Siehe [Konfigurationsdatei](/reference/configuration/config.conf) und [live-config](/reference/configuration/live-config) für die unterstützten Einstellungen.

## Herunterfahren und Speichern – Lebenszyklus

Beim regulären Herunterfahren erhält das laufende System zunächst die Gelegenheit, Dienste und Sitzungsdaten zu schreiben. Eine SquashFS-Sitzung mit aktiviertem Speichern beim Herunterfahren wird vor dem Abbau des Dateisystems neu aufgebaut und validiert. Das Speicher-Backend schreibt eine Abschlussmarkierung für genau die laufende Sitzung; das Shutdown-initramfs prüft diese Markierung und lässt die Sitzung als „dirty“ zurück, falls das erforderliche Speichern fehlgeschlagen ist.

Das Shutdown-initramfs trennt anschließend ungenutzte Loop-Devices, hängt das alte Root und die beschreibbare Ebene aus, markiert eine erfolgreiche Sitzung als „clean“, hängt das Medium aus und schließt ein MiniOS-eigenes LUKS-Mapping. Optische Medien können dann vor dem Ausschalten oder Neustart ausgeworfen werden. Manuelle und periodische SquashFS-Sicherungen nutzen das gleiche Snapshot-Backend, aber nur die konfigurierte Shutdown-Policy verhindert einen sauberen Abschluss, wenn das Speichern beim Herunterfahren fehlt.

## Medienbaum

Ein aktuelles Image ist wie folgt organisiert. Optionale Verzeichnisse erscheinen nur, wenn die jeweilige Funktion Inhalte erstellt hat.

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

## Verwandte Dokumentation

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
