---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
---

# MiniOS-Installationsprogramm

Das MiniOS-Installationsprogramm ist ein GTK-Assistent und eine Kommandozeilen-Backend-Lösung zur Bereitstellung eines Systems aus einer laufenden MiniOS-Live-Sitzung heraus. Das Schreiben oder Kopieren von MiniOS auf ein Wechseldatenträger ist bereits eine Installationsmethode; das MiniOS-Installationsprogramm ist das verwaltete Bereitstellungstool, wenn Sie ein kontrolliertes Ziel-Layout, eine Persistenz-Einrichtung oder eine optionale native Umwandlung wünschen.

## Vor dem Start

Eine falsche Ziel- oder Partitionierungswahl kann Daten zerstören. Sichern Sie wichtige Dateien, trennen Sie nicht benötigte Festplatten und identifizieren Sie das Ziel anhand von Gerätepfad, Modell und Kapazität. Die abschließende Bestätigung ist der letzte Punkt, an dem eine Installation sicher abgebrochen werden kann.

Die Festplatte mit dem laufenden MiniOS-Live-System ist von der Zielauswahl ausgeschlossen. Allgemeine Hinweise zur benötigten Kapazität finden Sie im [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility).

## Installationsmodi

**Live-Modus** kopiert die ausgewählten komprimierten MiniOS-Module und Boot-Komponenten. Das Ergebnis bleibt MiniOS: Das modulare Live-System-Layout, die MiniOS-Boot-Konfiguration, MiniOS-Verwaltungsabläufe und optionale Sitzungs-Persistenz bleiben erhalten.

**Native Modus** erstellt aus dem ausgewählten MiniOS-Abbild ein konventionelles Debian-Desktop-System. Die gewählten Module werden in ein beschreibbares Root-Dateisystem entpackt, die gewählte Desktop-Umgebung und Standardanwendungen bleiben erhalten, die MiniOS-Live-Laufzeit und live-spezifische Werkzeuge werden entfernt, notwendige Debian-Pakete installiert, ein konventionelles initramfs erzeugt und der Bootloader installiert. Das Installationsprogramm erkennt native Unterstützung anhand des gestarteten Abbilds. Fehlen erforderliche Kernel-Metadaten oder die EFI-Architektur, ist im Kompatibilitätsmodus nur eine Live-Installation möglich.

::: warning Im Native-Modus ändert sich die Systemverwaltung
Das installierte System behält das gewohnte MiniOS-Desktop-Erlebnis – Aussehen, gewählte Desktop-Umgebung und Standardanwendungen – verwendet jedoch nicht mehr die MiniOS-Live-Architektur. Während der Umwandlung entfernt das Installationsprogramm die `minios-*` Pakete und weitere live-spezifische Werkzeuge, da Sitzungen, `.sb` Module, modulares Kernel-Management und Live-Boot-Konfiguration nicht mehr relevant sind. Nach dem Neustart pflegen Sie das System wie einen klassischen Debian-Desktop mit APT, Debian-Kernelpaketen, dem regulären initramfs und dem installierten Bootloader. Siehe [Über MiniOS](/getting-started/About-MiniOS).
:::

Diese Bereitstellung unterscheidet sich von einem einfachen ISO-Schreibvorgang, einer Ventoy-ISO-Multiboot-Konfiguration oder einer dateibasierten Live-Installation. Siehe [Installationsmethoden](/installing-minios/Installation-Methods) für die Unterscheidung.

## Grafisches Installationsprogramm starten

Öffnen Sie das Anwendungsmenü, wählen Sie System und dann das MiniOS-Installationsprogramm. Es kann auch über das Terminal gestartet werden:

```bash
sudo minios-installer
```

Der Assistent erfasst Installationsmodus, Sicherheit, Standort, kabelgebundenes Netzwerk, Tastatur, Benutzerkonto, Module, Speicher- und Boot-Einstellungen. Überprüfen Sie die genaue Partitionsgeometrie und die Zusammenfassung der Vorgänge, bevor Sie die endgültige, zerstörerische Bestätigung akzeptieren.

## Platzierung und Boot-Layouts

Das grafische Installationsprogramm bietet folgende Platzierungsoptionen, wenn das Ziel geeignet ist:

- Alles löschen erstellt eine neue Partitionstabelle und löscht alle Daten auf der Zielfestplatte.
- Freier Speicher nutzt geeigneten, nicht zugeordneten Speicherplatz, ohne ein bestehendes Dateisystem zu verkleinern.
- Neben bestehend verkleinert eine geeignete, nicht eingehängte ext2-, ext3-, ext4- oder NTFS-Partition. Unsichere Layouts wie verschmutzte, eingehängte, verschachtelte oder mehrdeutige Partitionen werden abgelehnt. Das Installationsprogramm kann vor dem Herunterladen fehlender Dateisystem-Tools nachfragen.
- Manuelle Partitionierung ist nur für native Umwandlungen in der grafischen Oberfläche auf geeigneten Direktfestplatten verfügbar. Änderungen werden bis zur endgültigen Bestätigung zwischengespeichert.

Automatische Boot-Layouts sind BIOS/MBR, UEFI/MBR und UEFI/GPT. UEFI funktioniert mit GPT- oder primären MBR-Layouts. BIOS wird auf primären MBR, aber nicht auf GPT unterstützt. Erweiterte oder logische MBR-Preserve-Layouts werden nicht unterstützt.

Im manuellen Modus können Partitionen erstellt, gelöscht, formatiert und wiederverwendet werden; ein unterstütztes Dateisystem vom Ende her verkleinert; Mountpunkte, eine EFI-Systempartition und Swap zugewiesen sowie geplante Änderungen rückgängig gemacht oder zurückgesetzt werden. LVM, RAID, native LUKS-Root-Partitionen, gemappter oder verschachtelter Speicher, bcache, ZFS oder Btrfs-Subvolume-Bearbeitung werden nicht unterstützt. LUKS2-Verschlüsselung für eine Live-Persistenz-Sitzung verschlüsselt kein natives Root-Dateisystem.

## Dateisysteme

- Live-Layouts können ext2, ext4, Btrfs, FAT32 oder NTFS verwenden, sofern die benötigten Tools installiert sind.
- Das Root-Dateisystem, das durch native Umwandlung erstellt wird, kann ext2, ext4 oder Btrfs nutzen. Ext4 ist die allgemeine Standardoption.
- Vorhandene ext3-Dateisysteme können, wo unterstützt, wiederverwendet oder verkleinert werden, aber ext3 wird nicht für neue Formatierungen angeboten.
- FAT32 ist auf Dateien unter 4 GiB beschränkt und nur für Live-Layouts verfügbar.
- NTFS ist nur für Live-Layouts verfügbar, allerdings kann eine geeignete NTFS-Partition für die Nebenplatzierung verkleinert werden.

Benötigter Speicherplatz umfasst die gewählten Moduldaten, Boot-Komponenten, angeforderte Persistenz und eine 25-prozentige Dateisystemreserve. EFI- und nativer Swap-Speicher werden separat berechnet.

## Konfiguration und Sicherheit

Das Installationsprogramm kann Gebietsschema, Zeitzone, Tastatur, Benutzername, Passwörter, Benutzergruppen, Hostname, Dienste, Bootmenü und Modulauswahl festlegen. Die Auswahl eines höheren MiniOS-Moduls umfasst automatisch die erforderlichen unteren Ebenen.

Sicherheitsprofile sind `convenient`, `balanced` und `strict`. Im Live-Modus ist standardmäßig `convenient` aktiv; native Umwandlung startet mit `balanced`. SSH- und XRDP-Einstellungen sind unabhängig vom gewählten Profil. Überprüfen Sie die Fernzugriffs-Dienste vor der ersten Netzwerkverbindung. Nach der nativen Umwandlung erfolgt die weitere Sicherheitskonfiguration wie gewohnt über die Debian-Systemadministration.

Die Netzwerkkonfiguration umfasst Hostname und kabelgebundenes DHCP oder statisches IPv4. Das Installationsprogramm erstellt oder ändert keine WLAN-Profile. Native Umwandlung und einige Nebenplatzierungen benötigen ggf. Netzwerkzugang (mit Ihrer Zustimmung), um GRUB, EFI, initramfs, `os-prober` oder Pakete zur Dateisystemverkleinerung vor Festplattenänderungen zu beziehen.

## Live-Sitzungspersistenz

Persistenz gilt nur für Live-Installationen. Wenn `minios-session` verfügbar ist, kann das MiniOS-Installationsprogramm direkt auf dem Ziel eine echte nummerierte Sitzung erstellen und aktivieren, bevor die Installation abgeschlossen ist. **Automatisch beim ersten Start einrichten** überspringt diesen Schritt; MiniOS kann dann später beim Booten den Sitzungspeicher wie gewohnt anlegen.

Das Installationsprogramm bietet diese Speicher-Backends an, wenn das laufende System und das Ziel sie unterstützen:

- `native` speichert Änderungen der Live-Sitzung direkt im Sitzungsverzeichnis auf einem POSIX-kompatiblen Ziel-Dateisystem. Trotz des Namens handelt es sich um ein **Live-Persistenz-Backend** und ist unabhängig von der nativen Installation. Es wird nicht auf FAT32 oder NTFS angeboten.
- DynFileFS erstellt erweiterbaren, dateibasierten ext4-Speicher. Die gewählte Größe ist das logische Maximum, nicht vorab reservierter Speicherplatz. Die Standardgröße beträgt 4000 MiB.
- DynBlk erstellt ein ext4-Dateisystem auf einem Thin-Block-Device, das vom DynBlk-Kernelmodul bereitgestellt wird. Sitzungsdaten werden durch segmentierte `volumeNNN.db` Dateien gesichert, die bei Bedarf angelegt werden. Die gewählte Größe ist ein logisches Maximum, nicht vorab belegter Speicher. Neue DynBlk-Sitzungen werden standardmäßig auf 16384 MiB gesetzt. Bei unverschlüsselten DynBlk-Sitzungen kann das Installationsprogramm einen Kompressions-Codec wählen, der sowohl vom laufenden System als auch vom auf das Ziel kopierten initrd unterstützt wird.
- VMDK verwendet den DynBlk-Treiber, um standardmäßigen, geteilten, dünn-provisionierten VMDK-Speicher zu erstellen (`volume.vmdk` und `volume-sNNN.vmdk`). Es gilt das gleiche Thin-Allocation-Modell und der Standardwert von 16384 MiB wie bei DynBlk, Backend-Kompression ist jedoch nicht verfügbar.
- Raw erstellt ein ext4-Abbild mit fester Größe und reserviert die gewählte Kapazität sofort. Die Standardgröße beträgt 4000 MiB.

LUKS2 ist eine separate Verschlüsselungsschicht, die Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzungsspeicher umschließen kann. Das Installationsprogramm fordert die bestätigte Passphrase nur zur Erstellung der Sitzung ab, übergibt sie an `minios-session` über die Standardeingabe und speichert sie nicht in Befehlszeilenargumenten, Protokollen oder dauerhaften Konfigurationen. Die Passphrase wird beim Entsperren der verschlüsselten Sitzung beim Booten benötigt. LUKS2 wird nur angeboten, wenn die laufende Umgebung und das kopierte Ziel-initrd kompatible Unterstützung anzeigen. DynBlk-Kompression ist deaktiviert, wenn LUKS2 gewählt wird.

DynBlk- und VMDK-Sitzungsspeicher sind nicht verfügbar, wenn UEFI Secure Boot aktiviert ist, da das externe DynBlk-Kernelmodul dieser Backends nicht von MiniOS signiert ist. Raw-Container sind auf FAT32 auf 4000 MiB begrenzt; DynFileFS, DynBlk und geteilte VMDK-Speicher sind nicht auf eine Datei über FAT32s 4-GiB-Grenze angewiesen, unterliegen aber dennoch ihren eigenen Backend- und Freispeichergrenzen.

Da das Installationsprogramm die gewählte Sitzung direkt auf dem Ziel erstellt und aktiviert, ist es nicht auf `perchmode` und `perchsize` angewiesen, um diesen Speicher beim ersten Start zu erzeugen. Diese Boot-Parameter beschreiben weiterhin die initrd-gesteuerte Persistenz-Erstellung und -Auswahl außerhalb des vom Installationsprogramm vorab angelegten Sitzungswegs. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence), [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und [Boot-Parameter](/reference/Boot-Parameters).

## Kommandozeilen-Installation

`minios-deploy` ist für Automatisierung, Tests und Wiederherstellung gedacht. Manuelle Partitionierung und interaktive Einrichtung von kabelgebundenen Netzwerken sind weiterhin nur über die grafische Oberfläche möglich.

Auflistung der als installierbar erkannten Festplatten:

```bash
minios-deploy list-disks
```

Ersetzen Sie `/dev/sdb` in jedem Beispiel durch die verifizierte Zielfestplatte. Drucken Sie zunächst einen nicht-destruktiven Plan:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Zeigen Sie die passenden Bereitstellungsbefehle an, ohne auf die Festplatte zu schreiben:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Führen Sie die echte Installation erst nach Überprüfung des Plans, der Zielidentität und der Testausgabe (Dry-Run) durch. `--yes` autorisiert destruktive Änderungen:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Wenn Sie gezielt eine native Umwandlung in vorhandenem freien Speicher wünschen, nutzen Sie für Planung und Installation die gleichen Speicheroptionen:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Native Umwandlung wird in der CLI-Hilfe möglicherweise nicht angezeigt, wenn das Abbild keine native-Install-Unterstützung bietet. Die CLI akzeptiert außerdem Konfigurationsoptionen für Konten, Gebietsschema, Zeitzone, Tastatur, Hostname, Dienste und ein Basis-`config.conf`. Prüfen Sie die genauen Optionen des laufenden Abbilds:

```bash
minios-deploy install --help
man minios-deploy
```

Vermeiden Sie `--password` und `--root-password` in gemeinsam genutzten Umgebungen, da Klartext-Befehlszeilenargumente in der Shell-Historie und im Prozess-Listing sichtbar sein können. Verwenden Sie stattdessen das grafische Installationsprogramm oder einen geschützten Konfigurations-Workflow.
