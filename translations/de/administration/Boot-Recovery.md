# Boot-Wiederherstellung

Die Reparatur des Bootvorgangs hängt davon ab, wie MiniOS auf das Gerät gebracht wurde und ob die Firmware es im BIOS- oder UEFI-Modus startet. Ein Verfahren, das für eine Konfiguration geeignet ist, kann eine andere beschädigen. Sichern Sie wichtige Dateien, bevor Sie einen Bootsektor überschreiben, ein Partitions-Flag ändern, einen EFI-Baum ersetzen oder GRUB neu installieren. Siehe [Backup und Wiederherstellung](/administration/Backup-Recovery.md). Wenn der Installationstyp unklar ist, vergleichen Sie ihn mit den [Boot-Modi](/configuration/Boot-Modes.md), bevor Sie einen Reparaturablauf wählen.

## Layout identifizieren

- **Raw-geschriebenes ISO:** `dd`, Etcher, Rufus im DD-Modus oder ein ähnliches Image-Tool haben das ISO-Blocklayout auf das gesamte Gerät geschrieben. Behandle dies als Abbild-Medium, nicht als normale dateibasierte Installation.
- **Dateibasierte Live-Installation:** Das Gerät hat ein normales Dateisystem mit einem `minios/`-Verzeichnis, das SquashFS-Module und `minios/boot/` enthält. Dazu gehört die klassische Methode des Kopierens von Dateien sowie Live-Deployments, die vom MiniOS Installer erstellt wurden.
- **Native Installation:** Der MiniOS Installer hat die Module in ein konventionelles Linux-Root-Dateisystem entpackt. Es verwendet das installierte System-GRUB und initramfs anstelle des modularen Live-Boot-Layouts.

`Ventoy` behält das ISO normalerweise als Datei unter seinem eigenen Bootloader. Repariere es mit dem Verfahren in der `Ventoy`-Dokumentation; installiere nicht den MiniOS Syslinux-Bootsektor darüber.

## Diagnose ohne Änderungen am Datenträger

Bestätigen Sie zunächst, ob der Fehler vor dem MiniOS-Menü, nach dem Menü oder nach dem Start des Kernels auftritt. Prüfen Sie das einmalige Boot-Menü der Firmware und notieren Sie, ob der gewählte Eintrag UEFI oder Legacy BIOS ist. Testen Sie einen anderen Anschluss und starten Sie das gleiche Gerät, wenn möglich, auf einem anderen Computer.

Von einem funktionierenden Linux-Rescue-Medium aus sollten Sie inspizieren, nicht reparieren:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

Auf einem im UEFI-Modus gestarteten System kann `sudo efibootmgr -v` Firmware-Einträge auflisten. Dessen Fehlen oder ein Fehler beweist nicht, dass die EFI-Dateien fehlen. Formatieren, partitionieren, führen Sie keine Dateisystemreparatur durch und ändern Sie keine Flags nur zum Testen. Überprüfen Sie jedes Gerät anhand von Modell und Kapazität und mounten Sie Dateisysteme beim Inspizieren nur lesend.

Erscheint das Boot-Menü, aber MiniOS findet seine Module nicht, bearbeiten Sie den Boot-Eintrag vorübergehend und versuchen Sie `from=askdisk`. Sobald das richtige Dateisystem bekannt ist, ist ein Dateisystem-Label stabiler als ein Name wie `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

Das Label muss existieren und das gewünschte Dateisystem eindeutig identifizieren; Labels sollten eindeutig sein. Fügen Sie `debug timing` für mehr Ausgaben beim frühen Booten hinzu. `rd.break` sollte nur hinzugefügt werden, wenn für eine erweiterte Analyse eine Initramfs-Shell benötigt wird. Diese Optionen dienen der Diagnose der Modulerkennung; sie reparieren den Bootloader nicht. Siehe [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md) für die unterstützten `from=`-Formen, das Verhalten von `askdisk` und die Quell-Prioritäten. Siehe außerdem [Boot-Parameter](/configuration/Boot-Parameters.md) und [Fehlerbehebung](/administration/Troubleshooting.md).

## Raw-geschriebene ISO-Medien

Führen Sie `bootinst.sh` nicht aus, installieren Sie kein GRUB und kopieren Sie keine einzelnen Boot-Dateien auf ein raw-geschriebenes ISO-Gerät. Dessen Partitionsstruktur, Bootsektoren, ISO-Dateien und EFI-Dateien bilden ein einziges Abbild. Wenn das geprüfte ISO woanders bootet, aber diese Kopie nicht, sichern Sie alle Daten, die außerhalb des Abbildlayouts gespeichert sind, und schreiben Sie das gesamte Gerät mit einem geprüften ISO neu. Siehe [Downloads verifizieren](/installation/Verifying-Downloads.md) und [MiniOS installieren](/installation/Installing-MiniOS.md).

Falls das erneute Schreiben des gleichen geprüften Abbilds weiterhin fehlschlägt, testen Sie ein anderes Gerät und prüfen Sie Firmware- und Hardware-Kompatibilität, anstatt das Abbild wiederholt zu verändern.

## Dateibasierte Live-Installationen

### Gebündelter Installer auf MBR-Medien

Der gebündelte Installer ist nur geeignet, wenn alle folgenden Bedingungen erfüllt sind:

- Das Gerät ist eine dateibasierte Live-Installation auf einer MBR-partitionierten Festplatte.
- Das vollständige `minios/boot/syslinux/`-Verzeichnis ist intakt und gehört zum selben MiniOS-Baum und Release wie die anderen Boot-Komponenten.
- Das eingehängte Dateisystem und dessen übergeordnetes Ganzplatten-Gerät wurden eindeutig identifiziert, ohne zu raten.

Führen Sie das Skript aus diesem Verzeichnis auf dem Ziel-Dateisystem aus:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

Das Skript leitet sein Ziel aus dem Dateisystem ab, das das Skript enthält. Es installiert dort Syslinux, schreibt 440 Bytes MBR-Bootcode auf die übergeordnete Festplatte, kann das aktive Partitions-Flag ändern und kopiert den gebündelten UEFI-Loader-Baum auf das Ziel-Dateisystem. Ein falscher Mount oder ein falsches Gerät kann ein anderes System unbootbar machen. Verwenden Sie es nicht auf einer GPT-Festplatte oder einer gemeinsam genutzten EFI-Systempartition, kopieren Sie nicht nur `bootinst.sh` in einen beschädigten Baum und führen Sie es aus, und verwenden Sie keine Komponenten aus einem anderen MiniOS-Release.

Unter Windows lautet der entsprechende Pfad:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Führen Sie es als Administrator nur vom vorgesehenen Wechseldatenträger aus. Das Skript verweigert die Ausführung auf der erkannten Windows-Systemfestplatte, aber diese Prüfung ersetzt nicht die Überprüfung des Laufwerksbuchstabens und des physischen Geräts.

### UEFI

UEFI-Boot verwendet keinen BIOS-MBR-Code. Die Firmware benötigt eine lesbare EFI-Systempartition oder ein FAT-Dateisystem und einen gültigen Loader-Baum. Stellen Sie ausschließlich einen vollständigen, passenden `EFI/boot`-Baum und die zugehörigen MiniOS-EFI-Dateien aus dem exakt für diese Installation verwendeten Image oder Backup wieder her. Kombinieren Sie nicht die EFI-Executables eines Releases mit der GRUB-Konfiguration oder den `minios/boot`-Dateien eines anderen Releases.

Das gebündelte `bootinst.sh` kopiert ebenfalls seinen passenden UEFI-Loader-Baum, führt aber dennoch die oben beschriebenen MBR- und Syslinux-Schreibvorgänge durch. Verwenden Sie es nur für das dateibasierte MBR-Layout aus dem vorherigen Abschnitt, nicht als generisches UEFI-Reparaturwerkzeug.

Das Kopieren einer einzelnen `.efi`-Datei kann eine unvollständige Loader-Kette hinterlassen. Wenn der vollständige, exakte EFI-Baum nicht verfügbar ist, installieren Sie das dateibasierte Live-Layout neu, anstatt eine Teilrekonstruktion zu versuchen. Erhalten Sie nicht verwandte Hersteller- und Betriebssystem-Verzeichnisse auf einer gemeinsam genutzten EFI-Systempartition.

`minios-deploy` bietet `plan`- und `install`-Operationen, aber keine Boot-Reparatur. Richten Sie einen Installationsbefehl nicht als Reparaturversuch auf eine bestehende Festplatte. Siehe [MiniOS Installer](/installation/MiniOS-Installer.md) für unterstützte Installationslayouts.

## Native Installationen

### BIOS-GRUB aus einem chroot

Verwenden Sie dieses Verfahren nur für eine native Installation, die für Legacy-BIOS auf einer MBR-Festplatte installiert wurde. Es schreibt GRUB auf eine gesamte Festplatte und kann Bootcode anderer Betriebssysteme ersetzen. Nicht für UEFI, GPT, ein dateibasiertes Live-Layout oder ein raw-geschriebenes ISO verwenden.

Booten Sie vertrauenswürdige Linux-Rettungsmedien, identifizieren Sie die native Root-Partition und deren übergeordnete Festplatte und ersetzen Sie die Platzhalter unten durch die realen Pfade. In diesem Beispiel ist `/dev/sdXN` die Root-Partition und `/dev/sdX` das zugehörige Gesamtlaufwerk. Übergeben Sie niemals eine Partition wie `/dev/sdX1` an den finalen `grub-install`-Befehl.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Mounten Sie eine separate native `/boot`-Partition auf `/mnt/boot` vor den Bind-Mounts und unmounten Sie sie vor dem finalen `sudo umount /mnt`. Mounten Sie keine EFI-Systempartition für dieses reine BIOS-Verfahren. Wenn das Root-Dateisystem LUKS, LVM, RAID oder ein nicht vollständig verstandenes Layout verwendet, stoppen Sie und nutzen Sie ein spezifisches Wiederherstellungsverfahren für diesen Storage-Stack. Falls `update-grub`, `grub-script-check` oder `grub-install` fehlschlägt, fahren Sie nicht fort, indem Sie die Partitionstabelle ändern oder andere Festplatten ausprobieren.

### Native UEFI

Manuelle native UEFI-Rekonstruktion ist nicht pauschal sicher. Sie hängt von der genauen EFI-Architektur, Loader-Kette, Paketstatus, Mount-Layout, Secure-Boot-Status, Firmware-Verhalten und davon ab, ob die EFI-Systempartition gemeinsam genutzt wird. Ein generischer Datei-Kopier- oder `grub-install`-Befehl kann den Fallback-Loader eines anderen Betriebssystems überschreiben.

Bevorzugen Sie die Wiederherstellung eines exakten, getesteten Backups des nativen Root-Dateisystems, des Inhalts der EFI-Systempartition und der Boot-Konfiguration. Andernfalls sichern Sie Benutzerdaten und installieren das native System mit dem MiniOS Installer neu. Übernehmen Sie nicht das dateibasierte Live-`EFI/boot`-Kopierverfahren für eine native Installation.

## Modularer Kernel-Rollback

Für eine dateibasierte Live-Installation, die nach einer Kernel-Änderung nicht mehr startet,
verwenden Sie ein Rettungsmedium derselben MiniOS-Version und Architektur. Wählen Sie im Bootmenü
`from=askdisk` oder einen stabilen Label-Pfad, um den installierten
`minios/`-Baum auszuwählen. Der gewählte Baum muss ein vollständiges Triplet enthalten, das zum bereits vom Rettungsmedium geladenen Kernel passt; das initrd kann den
laufenden Kernel nicht wechseln. Siehe
[running kernel coordination](/configuration/Initrd-Module-Loading.md)
für die genauen Pfade und das Verhalten von Modul, Kernel-Image und initramfs.

Wenn diese Kombination ein funktionierendes System erreicht und der installierte Baum beschreibbar ist,
überprüfen Sie die koordinierten Kernel-Sets und aktivieren Sie ein bekannt funktionierendes:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

Die Aktivierung muss ein koordiniertes Kernel-Modul, Kernel-Image, initramfs und die Bootloader-Konfiguration wiederherstellen. Ersetzen Sie nicht nur `vmlinuz`, nur das initramfs
oder nur `01-kernel*.sb`. Behalten Sie den vorherigen Paket-Kernel, bis der Ersatz erfolgreich gebootet wurde. Siehe
[Kernel management](/administration/Kernel-Management.md).

Dieser Rollback ist für modulare Live-Installationen gedacht. Native Installationen verwenden ihre
eigenen installierten Kernel-Pakete und GRUB und benötigen eine native Wiederherstellung oder Neuinstallation.

## Wann neu installieren?

Sichern Sie wiederherstellbare Daten und installieren Sie neu, anstatt zu reparieren, wenn eine der folgenden Bedingungen zutrifft:

- Ein raw-geschriebenes ISO ist beschädigt oder wurde stückweise verändert.
- Passende Syslinux-, GRUB-, Kernel-, initramfs- oder vollständige EFI-Komponenten sind nicht verfügbar.
- Die Partitionstabelle, das Dateisystem oder die EFI-Systempartition sind zusätzlich zum Bootloader beschädigt.
- Die Zieldisk oder das übergeordnete Gerät kann nicht eindeutig identifiziert werden.
- Eine native UEFI-Loader-Kette müsste ohne ein exaktes Backup rekonstruiert werden.
- Wiederholte Lesefehler, Verbindungsabbrüche oder SMART-Fehler deuten auf ein defektes Medium hin.
- Ein Reparaturbefehl schlägt fehl und der nächste Schritt würde Raten oder das Überschreiben nicht verwandter Bootdaten erfordern.

Neuinstallation stellt ein bekanntes, koordiniertes Boot-Layout wieder her; sie rettet keine nicht gesicherten Benutzerdaten oder Persistenz. Kopieren Sie wichtige Daten zuerst, solange das Dateisystem noch lesbar ist.
