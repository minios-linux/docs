---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
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

Öffnen Sie das MiniOS-Installationsprogramm aus dem **MiniOS** Anwendungsmenü. Alternativ kann es auch über ein Terminal gestartet werden und fordert bei Bedarf Administratorrechte an:

```bash
minios-installer
```

Der Assistent erfasst Einstellungen für Installationsmodus, Sicherheit, Standort, kabelgebundenes Netzwerk, Tastatur, Benutzerkonto, Module, Speicher und Boot-Optionen. Überprüfen Sie vor der endgültigen, nicht rückgängig zu machenden Bestätigung die genaue Partitionsgeometrie und die Zusammenfassung der geplanten Aktionen.

## Platzierungs- und Boot-Layouts

Der grafische Installer bietet diese Platzierungsoptionen an, wenn das Ziel geeignet ist:

- „Alles löschen“ erstellt eine neue Partitionstabelle und entfernt alle Daten auf der Zieldisk.
- „Freier Speicherplatz“ nutzt geeigneten, nicht zugeordneten Speicher, ohne ein bestehendes Dateisystem zu verkleinern.
- „Nebeneinander“ verkleinert eine geeignete, nicht eingehängte letzte ext2-, ext3-, ext4- oder NTFS-Partition. Verschmutzte, eingehängte, verschachtelte, mehrdeutige oder anderweitig unsichere Layouts werden abgelehnt. Der Installer kann nach fehlenden Dateisystem-Tools fragen, bevor er sie herunterlädt.
- Manuelle Partitionierung ist nur für native Konvertierungen in der grafischen Oberfläche auf geeigneten Direkt-Datenträgern verfügbar. Änderungen werden erst nach endgültiger Bestätigung übernommen.

Automatische Boot-Layouts sind BIOS/MBR, UEFI/MBR und UEFI/GPT. UEFI funktioniert mit GPT- oder primären MBR-Layouts. BIOS wird auf primären MBR-Layouts unterstützt, nicht auf GPT. Erweiterte oder logische MBR-Preserve-Layouts werden nicht unterstützt.

Für **Alles löschen** im Live-Modus wählt **Automatisch** immer MBR, auch wenn der Installer unter UEFI läuft. MBR-Live-Ziele behalten EFI-Dateien und erhalten einen BIOS-Bootloader, sodass beide Firmware-Modi unterstützt werden. Festplatten ab 2 TiB benötigen explizit die Auswahl von **UEFI/GPT**; GPT-Live-Ziele sind ausschließlich für UEFI geeignet. Das native „Alles löschen“ folgt einer eigenen, firmwareabhängigen Richtlinie. Installationen im freien Speicherplatz und nebeneinander behalten die bestehende Partitionstabelle.

Im manuellen Modus können Partitionen erstellt, gelöscht, formatiert und wiederverwendet werden; ein unterstütztes Dateisystem kann am Ende verkleinert werden; Mountpunkte, eine EFI-Systempartition und Swap können zugewiesen werden; Änderungen können rückgängig gemacht oder zurückgesetzt werden. Nicht unterstützt werden LVM, RAID, native LUKS-Root-Partitionen, gemappte oder verschachtelte Speicher, bcache, ZFS oder die Bearbeitung von Btrfs-Subvolumes. LUKS2-Verschlüsselung für eine Live-Persistenz-Sitzung verschlüsselt nicht das native Root-Dateisystem.

## Dateisysteme

- Live-Layouts können ext2, ext4, Btrfs, FAT32 oder NTFS verwenden, sofern die benötigten Tools installiert sind.
- Das Root-Dateisystem, das durch native Umwandlung erstellt wird, kann ext2, ext4 oder Btrfs nutzen. Ext4 ist die allgemeine Standardoption.
- Vorhandene ext3-Dateisysteme können, wo unterstützt, wiederverwendet oder verkleinert werden, aber ext3 wird nicht für neue Formatierungen angeboten.
- FAT32 ist auf Dateien unter 4 GiB beschränkt und nur für Live-Layouts verfügbar.
- NTFS ist nur für Live-Layouts verfügbar, allerdings kann eine geeignete NTFS-Partition für die Nebenplatzierung verkleinert werden.

Benötigter Speicherplatz umfasst die gewählten Moduldaten, Boot-Komponenten, angeforderte Persistenz und eine 25-prozentige Dateisystemreserve. EFI- und nativer Swap-Speicher werden separat berechnet.

## Konfiguration und Sicherheit

Der Installer kann Sprache, Zeitzone, Tastaturlayout, Benutzername, Passwörter, Benutzergruppen, Hostname, Dienste, Boot-Menü und Modulauswahl festlegen. Wird eine höhere Systemebene ausgewählt, werden die dafür benötigten unteren Ebenen automatisch mit einbezogen. Eigene Module von `minios/modules/` werden unabhängig ausgewählt, auch wenn ihre Dateinamen System- oder Kernelmodulen ähneln.

Sicherheitsprofile sind `convenient`, `balanced` und `strict`. Im Live-Modus ist standardmäßig `convenient` aktiviert; die native Umstellung beginnt mit `balanced`. SSH- und XRDP-Steuerungen sind unabhängig vom gewählten Profil. Überprüfen Sie die Fernzugriffsdienste, bevor Sie die erste Netzwerkverbindung herstellen. Nach der nativen Umstellung erfolgt die weitere Sicherheitskonfiguration wie gewohnt über die Debian-Systemverwaltung.

Die Netzwerkkonfiguration umfasst den Hostnamen sowie kabelgebundenes DHCP oder statisches IPv4. Der Installer erstellt oder ändert keine WLAN-Profile. Für die native Umstellung und einige Parallel-Installationen kann, mit Ihrer Zustimmung, Netzwerkzugriff erforderlich sein, um GRUB-, EFI-, initramfs-, `os-prober` oder Pakete zur Größenänderung des Dateisystems vor Änderungen an der Festplatte zu beziehen.

## Live-Session-Persistenz

Persistenz gilt nur für Live-Installationen. Wenn `minios-session` verfügbar ist, kann das MiniOS-Installationsprogramm direkt auf dem Zielsystem noch vor Abschluss der Installation eine echte, nummerierte Sitzung anlegen und aktivieren. **Automatische Einrichtung beim ersten Start** überspringt diesen Schritt; MiniOS kann dann später beim Booten über die normale Persistenz-Logik den Sitzungspeicher anlegen.

Das Installationsprogramm bietet diese Speicher-Backends an, sofern das laufende System und das Ziel sie unterstützen:

- `native` speichert Änderungen der Live-Session direkt im Sitzungsverzeichnis auf einem POSIX-kompatiblen Ziel-Dateisystem. Trotz des Namens handelt es sich um ein **Live-Persistenz-Backend** und ist unabhängig von einer nativen Installation. Auf FAT32 oder NTFS wird es nicht angeboten.
- DynFileFS erstellt erweiterbaren, dateibasierten ext4-Speicher. Die gewählte Größe ist das logische Maximum und wird nicht vorab reserviert. Die Standardgröße beträgt 4000 MiB.
- DynBlk erstellt ein ext4-Dateisystem auf einem Thin-Block-Gerät, das vom DynBlk-Kernel-Treiber bereitgestellt wird. Sitzungsdaten werden durch segmentierte `volumeNNN.db` Dateien gesichert, die bei Bedarf angelegt werden. Die gewählte Größe ist ein logisches Maximum und wird nicht vorab auf der Festplatte reserviert. Neue DynBlk-Sitzungen werden standardmäßig mit 16384 MiB angelegt. Für unverschlüsselte DynBlk-Sitzungen kann das Installationsprogramm einen Kompressions-Codec auswählen, der sowohl vom laufenden System als auch vom kopierten initrd auf dem Ziel unterstützt wird.
- VMDK verwendet den DynBlk-Treiber, um standardmäßigen, gesplitteten, sparsamen VMDK-Speicher zu erstellen (`volume.vmdk` und `volume-sNNN.vmdk`). Es verwendet dasselbe Thin-Allocation-Modell und hat wie DynBlk standardmäßig 16384 MiB, Backend-Kompression ist jedoch nicht verfügbar.
- Raw erstellt ein ext4-Abbild mit fester Größe und reserviert die gewählte Kapazität sofort. Die Standardgröße beträgt 4000 MiB.

LUKS2 ist eine separate Verschlüsselungsschicht, die Raw-, DynFileFS-, DynBlk- oder VMDK-Sitzungsspeicher umschließen kann. Das Installationsprogramm erfasst die bestätigte Passphrase nur zur Sitzungsanlage und übergibt sie an `minios-session` über die Standard-Eingabe, aber nicht in Befehlszeilenargumenten, Protokollen oder dauerhaften Konfigurationen. Die Passphrase wird beim Entsperren der verschlüsselten Sitzung beim Booten benötigt. LUKS2 wird nur angeboten, wenn sowohl die laufende Umgebung als auch das kopierte initrd auf dem Ziel kompatible Unterstützung anzeigen. DynBlk-Kompression ist deaktiviert, wenn LUKS2 gewählt ist.

DynBlk- und VMDK-Sitzungsspeicher sind nicht verfügbar, solange UEFI Secure Boot aktiviert ist, da das externe DynBlk-Kernelmodul, das von diesen Backends genutzt wird, nicht von MiniOS signiert ist. Raw-Container sind auf FAT32 auf 4000 MiB begrenzt; DynFileFS, DynBlk und gesplitteter VMDK-Speicher sind nicht davon abhängig, dass eine Datei das 4-GiB-Limit von FAT32 überschreitet, allerdings gelten weiterhin die jeweiligen Backend- und Freispeichergrenzen.

Da das Installationsprogramm die gewählte Sitzung direkt auf dem Ziel erstellt und aktiviert, ist es nicht auf `perchmode` und `perchsize` angewiesen, um diesen Speicher beim ersten Start anzulegen. Diese Boot-Parameter beschreiben weiterhin die von initrd gesteuerte Persistenz-Erstellung und -Auswahl außerhalb des vom Installationsprogramm vorab angelegten Sitzungswegs. Siehe [Sitzungsverwaltung](/using-minios/Sessions-and-Persistence), [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), und [Boot-Parameter](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

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
