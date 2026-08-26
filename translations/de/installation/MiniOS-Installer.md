# Verwendung des MiniOS Installers

Der MiniOS Installer ist ein GTK-Assistent mit Kommandozeilen-Backend zur Bereitstellung von MiniOS aus einer MiniOS-Live-Sitzung. Er installiert auf eine Zieldisk; dies ist nicht dasselbe wie das Schreiben eines ISO-Abbilds auf ein bootfähiges Medium.

## Vor dem Start

Eine falsche Auswahl des Ziels oder der Partitionierung kann Daten zerstören. Sichern Sie wichtige Dateien, trennen Sie nicht benötigte Laufwerke und identifizieren Sie das Ziel anhand von Gerätepfad, Modell und Kapazität. Die abschließende Bestätigung ist der letzte Punkt, an dem eine Installation noch sicher abgebrochen werden kann.

Das Laufwerk, das das laufende MiniOS-Livesystem enthält, ist von der Zielauswahl ausgeschlossen. Allgemeine Hinweise zur Kapazität finden Sie im [Hardware-Kompatibilitätsleitfaden](Hardware-Compatibility.md).

## Installationsmodi

Im Live-Modus werden die ausgewählten komprimierten MiniOS-Module und Boot-Komponenten kopiert. Das Ergebnis behält das modulare Live-System-Layout bei und kann MiniOS-Sitzungspersistenz nutzen.

Im Native-Modus werden die ausgewählten Module in ein konventionelles Linux-Root-Dateisystem entpackt, das Ziel konfiguriert, erforderliche Pakete installiert, initramfs generiert und der Bootloader installiert. Der Installer erkennt native Unterstützung anhand des gestarteten Images. Fehlen die erforderlichen Kernel-Metadaten und der EFI-Architekturvertrag, erlaubt der Kompatibilitätsmodus nur die Live-Installation.

Diese Bereitstellung unterscheidet sich von einem direkten ISO-Write, einem Ventoy-ISO-Datei-Multiboot-Setup oder einem dateibasierten Live-Medien-Tool. Siehe [Boot-Modi](/configuration/Boot-Modes.md) für die Abgrenzung zwischen Live- und Native-Systemen.

## Start des grafischen Installers

Öffnen Sie das Anwendungsmenü, wählen Sie System und dann MiniOS installieren. Alternativ kann der Installer auch über das Terminal gestartet werden:

```bash
sudo minios-installer
```

Der Assistent sammelt Informationen zu Installationsmodus, Sicherheit, Standort, kabelgebundenem Netzwerk, Tastatur, Benutzerkonto, Modulen, Speicher und Boot-Einstellungen. Überprüfen Sie die genaue Partitionsgeometrie und die Zusammenfassung der Aktionen, bevor Sie die endgültige, destruktive Bestätigung akzeptieren.

## Platzierung und Boot-Layouts

Der grafische Installer bietet folgende Platzierungsoptionen, wenn das Ziel geeignet ist:

- Alles löschen erstellt eine neue Partitionstabelle und löscht alle Daten auf der Zieldisk.
- Freier Speicher nutzt geeigneten, nicht zugeordneten Speicherplatz, ohne ein bestehendes Dateisystem zu verkleinern.
- Daneben verkleinert eine geeignete, nicht eingehängte finale ext2-, ext3-, ext4- oder NTFS-Partition. Verschmutzte, eingehängte, verschachtelte, mehrdeutige und anderweitig unsichere Layouts werden abgelehnt. Der Installer kann vor dem Herunterladen fehlender Dateisystem-Tools nachfragen.
- Manuelle Partitionierung ist nur für native GUI-Installationen auf geeigneten Direktfestplatten verfügbar. Änderungen werden bis zur endgültigen Bestätigung zwischengespeichert.

Automatische Boot-Layouts sind BIOS/MBR, UEFI/MBR und UEFI/GPT. UEFI funktioniert mit GPT- oder primären MBR-Layouts. BIOS wird auf primärem MBR, nicht aber auf GPT unterstützt. Erweiterte oder logische MBR-Preserve-Layouts werden nicht unterstützt.

Im manuellen Modus können Partitionen erstellt, gelöscht, formatiert und wiederverwendet werden; ein unterstütztes Dateisystem vom Ende her verkleinert; Mountpoints, eine EFI-Systempartition und Swap zugewiesen sowie geplante Änderungen rückgängig gemacht oder zurückgesetzt werden. LVM, RAID, native LUKS-Roots, gemappte oder verschachtelte Speicher, bcache, ZFS oder Btrfs-Subvolume-Bearbeitung werden nicht unterstützt. LUKS-Sitzungspersistenz verschlüsselt kein natives Root-Dateisystem.

## Dateisysteme

- Live-Layouts können ext2, ext4, Btrfs, FAT32 oder NTFS verwenden, wenn die erforderlichen Tools installiert sind.
- Native Root-Dateisysteme können ext2, ext4 oder Btrfs nutzen. Ext4 ist die allgemeine Standardoption.
- Vorhandene ext3-Dateisysteme können, sofern unterstützt, wiederverwendet oder verkleinert werden, aber ext3 wird nicht für neue Formatierungen angeboten.
- FAT32 ist auf Dateien kleiner als 4 GiB beschränkt und nur für Live-Layouts verfügbar.
- NTFS ist nur für Live-Layouts verfügbar, obwohl eine geeignete NTFS-Partition für die Daneben-Platzierung verkleinert werden kann.

Erforderlicher Speicherplatz umfasst die ausgewählten Moduldaten, Boot-Komponenten, angeforderte Persistenz und eine 25-prozentige Dateisystemreserve. EFI- und nativer Swap-Speicher werden separat berechnet.

## Konfiguration und Sicherheit

Der Installer kann Gebietsschema, Zeitzone, Tastatur, Benutzername, Passwörter, Benutzergruppen, Hostname, Dienste, Bootmenü und Modulauswahl setzen. Die Auswahl eines höheren MiniOS-Moduls schließt die erforderlichen unteren Schichten mit ein.

Sicherheitsprofile sind `convenient`, `balanced` und `strict`. Der Live-Modus verwendet standardmäßig `convenient`; der Native-Modus standardmäßig `balanced`. SSH- und XRDP-Steuerungen sind unabhängig vom gewählten Profil. Überprüfen Sie die Remote-Zugriffsdienste vor der ersten Netzwerkverbindung.

Die Netzwerkkonfiguration umfasst Hostname sowie kabelgebundenes DHCP oder statisches IPv4. Der Installer erstellt oder ändert keine WLAN-Profile. Native und Daneben-Installationen benötigen eventuell Netzwerkzugriff (mit Ihrer Zustimmung), um GRUB, EFI, initramfs, `os-prober` oder Dateisystem-Resize-Pakete vor Änderungen an der Festplatte zu beziehen.

## Persistenz der Live-Sitzung

Persistenz gilt nur für Live-Installationen:

- Native Persistenz speichert Änderungen direkt auf einem POSIX-kompatiblen Ziel-Dateisystem. Sie wird auf FAT32 oder NTFS nicht angeboten.
- DynFileFS verwendet einen erweiterbaren Container.
- Raw nutzt ein Abbild mit fester Größe.
- LUKS verwendet ein verschlüsseltes Abbild, das beim ersten Start vom initrd erstellt wird. Das Passwort wird beim Booten abgefragt und niemals vom Installer empfangen oder gespeichert.

Container-Modi verwenden standardmäßig 4000 MiB. Raw- und LUKS-Container können auf FAT32 nicht größer als 4000 MiB sein; DynFileFS unterliegt dieser Einzeldateigröße nicht. LUKS wird nur angeboten, wenn sowohl das laufende initrd als auch jedes kopierte Quell-initrd die erforderliche Kryptounterstützung anzeigen.

Die resultierenden Boot-Optionen verwenden `perchmode` und `perchsize`. Siehe [Initrd-Persistenz](/configuration/Initrd-Persistence.md) und [Boot-Parameter](/configuration/Boot-Parameters.md) für deren Bedeutung zur Laufzeit und Aktivierungsanforderungen.

## Bereitstellung über die Kommandozeile

`minios-deploy` ist für Automatisierung, Tests und Wiederherstellung gedacht. Manuelle Partitionierung und interaktive Einrichtung kabelgebundener Netzwerke sind weiterhin nur über die GUI möglich.

Liste der als installierbar erkannten Festplatten:

```bash
minios-deploy list-disks
```

Ersetzen Sie `/dev/sdb` in jedem Beispiel durch die verifizierte Zieldisk. Drucken Sie zunächst einen nicht-destruktiven Plan:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Vorschau der passenden Bereitstellungskommandos ohne Schreibzugriff auf die Festplatte:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Führen Sie die eigentliche Installation erst nach Überprüfung des Plans, der Zielidentität und der Ergebnisse des Probelaufs durch. `--yes` autorisiert destruktive Änderungen:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Für eine native Installation in vorhandenem freien Speicher verwenden Sie dieselben Speicheroptionen für Planung und Installation:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Der Native-Modus erscheint möglicherweise nicht in der CLI-Hilfe, wenn das Abbild keine native Installationsunterstützung bietet. Die CLI akzeptiert außerdem Konfigurationsoptionen für Konten, Gebietsschema, Zeitzone, Tastatur, Hostname, Dienste und ein Basis-`config.conf`. Prüfen Sie die genauen Optionen des laufenden Abbilds:

```bash
minios-deploy install --help
man minios-deploy
```

Vermeiden Sie `--password` und `--root-password` in gemeinsam genutzten Umgebungen, da Klartext-Kommandozeilenargumente in der Shell-Historie und in der Prozessliste sichtbar sein können. Verwenden Sie stattdessen den grafischen Installer oder einen geschützten Konfigurations-Workflow.
