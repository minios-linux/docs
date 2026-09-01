---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# MiniOS-Installationsprogramm

Das MiniOS-Installationsprogramm ist ein GTK-Assistent und eine Kommandozeilen-Backend-Lösung zur Bereitstellung eines Systems aus einer laufenden MiniOS Live-Sitzung. Das Schreiben oder Kopieren von MiniOS auf ein Wechseldatenträger ist bereits eine Installationsmethode; das MiniOS-Installationsprogramm ist das verwaltete Bereitstellungstool, das verwendet wird, wenn Sie ein kontrolliertes Ziel-Layout, eine Persistenz-Einrichtung oder eine optionale native Konvertierung wünschen.

## Vor dem Start

Eine falsche Auswahl des Ziels oder der Partitionierung kann Daten unwiderruflich zerstören. Sichern Sie wichtige Dateien, trennen Sie nicht benötigte Festplatten und identifizieren Sie das Ziel anhand von Gerätepfad, Modell und Kapazität. Die endgültige Bestätigung ist der letzte Punkt, an dem eine Installation noch sicher abgebrochen werden kann.

Das Laufwerk, auf dem das aktuelle MiniOS-Live-System läuft, ist von der Zielauswahl ausgeschlossen. Allgemeine Hinweise zur Kapazität finden Sie im [Hardware-Kompatibilitätsleitfaden](/getting-started/Hardware-Compatibility).

## Installationsmodi

**Live-Modus** kopiert die ausgewählten komprimierten MiniOS-Module und Boot-Komponenten. Das Ergebnis bleibt MiniOS: Es behält das modulare Live-System-Layout, die MiniOS-Bootkonfiguration, die MiniOS-Verwaltungsabläufe und optional die Sitzungs-Persistenz bei.

**Native Modus** erstellt aus dem ausgewählten MiniOS-Abbild ein konventionelles Debian-Desktop-System. Die ausgewählten Module werden in ein beschreibbares Root-Dateisystem entpackt, die gewählte Desktop-Umgebung und Standardanwendungen bleiben erhalten, die MiniOS-Live-Laufzeit und live-spezifische Werkzeuge werden entfernt, notwendige Debian-Pakete installiert, ein konventionelles initramfs erzeugt und der Bootloader installiert. Der Installer erkennt native Unterstützung anhand des gestarteten Abbilds. Fehlen die erforderlichen Kernel-Metadaten und der EFI-Architekturvertrag, ist im Kompatibilitätsmodus nur eine Live-Installation möglich.

::: warning Native Modus ändert die Systemverwaltung
Das installierte System behält das vertraute MiniOS-Desktop-Erlebnis – Aussehen, gewählte Desktop-Umgebung und Standardanwendungen – nutzt jedoch nicht mehr die MiniOS-Live-Architektur. Während der Konvertierung entfernt der Installer die `minios-*`-Pakete und andere live-spezifische Werkzeuge, da Sitzungen, `.sb`-Module, modulares Kernel-Management und Live-Boot-Konfiguration nicht mehr gelten. Nach dem Neustart verwalten Sie das System wie einen klassischen Debian-Desktop mit APT, Debian-Kernel-Paketen, normalem initramfs und installiertem Bootloader. Siehe [Über MiniOS](/getting-started/About-MiniOS).
:::

Diese Bereitstellung unterscheidet sich von einem einfachen ISO-Schreibvorgang, einer Ventoy ISO-Datei-Multiboot-Konfiguration oder einer dateibasierten Live-Installation. Siehe [Installationsmethoden](/installing-minios/Installation-Methods) für die Unterschiede.

## Das grafische Installationsprogramm starten

Öffnen Sie das Anwendungsmenü, wählen Sie System und dann das MiniOS-Installationsprogramm. Es kann auch über ein Terminal gestartet werden:

```bash
sudo minios-installer
```

Der Assistent sammelt Einstellungen zum Installationsmodus, zur Sicherheit, zum Standort, zum kabelgebundenen Netzwerk, zur Tastatur, zum Benutzerkonto, zu Modulen, zum Speicher und zum Booten. Überprüfen Sie die genaue Partitionsgeometrie und die Zusammenfassung der Vorgänge, bevor Sie die endgültige, zerstörerische Bestätigung akzeptieren.

## Platzierung und Boot-Layouts

Der grafische Installer bietet folgende Platzierungsoptionen, wenn das Ziel geeignet ist:

- Alles löschen erstellt eine neue Partitionstabelle und löscht alle Daten auf dem Ziellaufwerk.
- Freier Speicher nutzt geeigneten, nicht zugeordneten Speicherplatz, ohne ein bestehendes Dateisystem zu verkleinern.
- Nebeneinander verkleinert eine geeignete, nicht eingehängte letzte ext2-, ext3-, ext4- oder NTFS-Partition. Verschmutzte, eingehängte, verschachtelte, mehrdeutige und anderweitig unsichere Layouts werden abgelehnt. Der Installer kann nachfragen, bevor fehlende Dateisystem-Tools heruntergeladen werden.
- Manuelle Partitionierung ist nur für native Konvertierungen in der GUI auf geeigneten Direktlaufwerken verfügbar. Änderungen werden bis zur endgültigen Bestätigung zwischengespeichert.

Automatische Boot-Layouts sind BIOS/MBR, UEFI/MBR und UEFI/GPT. UEFI funktioniert mit GPT- oder primären MBR-Layouts. BIOS wird auf primärem MBR, nicht auf GPT unterstützt. Erweiterte oder logische MBR-Preserve-Layouts werden nicht unterstützt.

Im manuellen Modus können Partitionen erstellt, gelöscht, formatiert und wiederverwendet werden; ein unterstütztes Dateisystem kann am Ende verkleinert werden; Mountpunkte, eine EFI-Systempartition und Swap können zugewiesen sowie geplante Änderungen rückgängig gemacht oder zurückgesetzt werden. LVM, RAID, native LUKS-Root-Partitionen, gemappte oder verschachtelte Speicher, bcache, ZFS oder Btrfs-Subvolume-Bearbeitung werden nicht unterstützt. LUKS-Sitzungspersistenz verschlüsselt kein natives Root-Dateisystem.

## Dateisysteme

- Live-Layouts können ext2, ext4, Btrfs, FAT32 oder NTFS verwenden, wenn die erforderlichen Tools installiert sind.
- Das Root-Dateisystem, das durch native Konvertierung erstellt wird, kann ext2, ext4 oder Btrfs verwenden. Ext4 ist die allgemeine Standardoption.
- Vorhandene ext3-Dateisysteme können, sofern unterstützt, wiederverwendet oder verkleinert werden, aber ext3 wird für neue Formatierungen nicht angeboten.
- FAT32 ist auf Dateien kleiner als 4 GiB beschränkt und nur für Live-Layouts verfügbar.
- NTFS ist nur für Live-Layouts verfügbar, obwohl eine geeignete NTFS-Partition für die Nebeneinander-Platzierung verkleinert werden kann.

Der benötigte Speicherplatz umfasst die ausgewählten Modul-Daten, Boot-Komponenten, angeforderte Persistenz und eine 25-prozentige Dateisystemreserve. EFI- und nativer Swap-Speicher werden separat berechnet.

## Konfiguration und Sicherheit

Der Installer kann Gebietsschema, Zeitzone, Tastatur, Benutzername, Passwörter, Benutzergruppen, Hostname, Dienste, Bootmenü und Modulauswahl festlegen. Die Auswahl eines höheren MiniOS-Moduls schließt die erforderlichen unteren Schichten ein.

Sicherheitsprofile sind `convenient`, `balanced` und `strict`. Der Live-Modus verwendet standardmäßig `convenient`; die native Konvertierung startet mit `balanced`. SSH- und XRDP-Steuerungen sind unabhängig vom gewählten Profil. Überprüfen Sie Remotezugriffs-Dienste vor der ersten Netzwerkverbindung. Nach der nativen Konvertierung erfolgt die weitere Sicherheitskonfiguration nach dem üblichen Debian-Systemverwaltungs-Workflow.

Die Netzwerkkonfiguration umfasst Hostname sowie kabelgebundenes DHCP oder statisches IPv4. Der Installer erstellt oder ändert keine WLAN-Profile. Native Konvertierung und einige Nebeneinander-Operationen können mit Ihrer Zustimmung Netzwerkzugriff benötigen, um GRUB-, EFI-, initramfs-, `os-prober`- oder Dateisystem-Resize-Pakete vor Änderungen an der Festplatte zu beziehen.

## Live-Sitzungspersistenz

Persistenz gilt nur für Live-Installationen:

- Der `native`-Persistenzmodus speichert Änderungen der Live-Sitzung direkt auf einem POSIX-kompatiblen Ziel-Dateisystem. Trotz des Namens ist dies ein **Live-Persistenz-Backend** und steht in keinem Zusammenhang mit einer nativen Installation. Er wird nicht auf FAT32 oder NTFS angeboten.
- DynFileFS verwendet einen erweiterbaren Container.
- Raw nutzt ein Abbild mit fester Größe.
- LUKS verwendet ein verschlüsseltes Abbild, das vom initrd beim ersten Start erstellt wird. Die Passphrase wird beim Booten abgefragt und niemals vom Installer empfangen oder gespeichert.

Container-Modi haben standardmäßig 4000 MiB. Raw- und LUKS-Container dürfen auf FAT32 nicht größer als 4000 MiB sein; DynFileFS unterliegt dieser Einzeldateigröße nicht. LUKS wird nur angeboten, wenn sowohl das laufende initrd als auch jedes kopierte Quell-initrd die erforderliche Kryptounterstützung anzeigen.

Die resultierenden Boot-Optionen verwenden `perchmode` und `perchsize`. Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) und [Boot-Parameter](/reference/Boot-Parameters) für deren Laufzeitbedeutung und Aktivierungsanforderungen.

## Kommandozeilenbereitstellung

`minios-deploy` ist für Automatisierung, Tests und Wiederherstellung gedacht. Manuelle Partitionierung und interaktive kabelgebundene Netzwerkeinrichtung bleiben ausschließlich der grafischen Oberfläche vorbehalten.

Zeigen Sie die als installierbar erkannten Laufwerke an:

```bash
minios-deploy list-disks
```

Ersetzen Sie in jedem Beispiel `/dev/sdb` durch das geprüfte Ziellaufwerk. Drucken Sie zunächst einen nicht-destruktiven Plan:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Vorschau der passenden Bereitstellungskommandos ohne Schreibvorgang auf die Festplatte:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Führen Sie die echte Installation erst nach Überprüfung des Plans, der Zielidentität und der Testausgabe durch. `--yes` autorisiert destruktive Änderungen:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Wenn Sie gezielt eine native Konvertierung in freien Speicherplatz durchführen möchten, verwenden Sie für Planung und Installation die gleichen Speicheroptionen:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Die native Konvertierung wird möglicherweise nicht in der CLI-Hilfe angezeigt, wenn das Abbild keine native Installationsunterstützung bietet. Die CLI akzeptiert außerdem Konfigurationsoptionen für Konten, Gebietsschema, Zeitzone, Tastatur, Hostname, Dienste und ein Basis-`config.conf`. Prüfen Sie die genauen Optionen des laufenden Abbilds:

```bash
minios-deploy install --help
man minios-deploy
```

Vermeiden Sie `--password` und `--root-password` in gemeinsam genutzten Umgebungen, da Klartext-Kommandozeilenargumente in der Shell-Historie und der Prozessliste sichtbar sein können. Verwenden Sie stattdessen das grafische Installationsprogramm oder einen geschützten Konfigurations-Workflow.
