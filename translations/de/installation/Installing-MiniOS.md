---
updated: 2026-08-26
---

# Installation von MiniOS

Es gibt zwei verschiedene Aufgaben, die oft als Installation bezeichnet werden:

- Das Schreiben der ISO auf ein Wechseldatenträger erstellt das bootfähige Medium, mit dem eine MiniOS-Live-Session gestartet wird. Image-Schreibprogramme überschreiben das ausgewählte Gerät mit dem ISO-Layout.
- Das Ausführen des [MiniOS Installer](/installation/MiniOS-Installer.md) aus einer Live-Session installiert MiniOS auf einem anderen Laufwerk. Dabei kann entweder eine modulare Live-Installation oder eine herkömmliche native Linux-Installation erstellt werden.

## ISO herunterladen und verifizieren

Laden Sie eine ISO von der [offiziellen Website](https://minios.dev) oder der offiziellen [GitHub Releases-Seite](https://github.com/minios-linux/minios-live/releases) herunter. Überprüfen Sie die Datei, bevor Sie sie auf ein Gerät schreiben; siehe [Downloads verifizieren](/installation/Verifying-Downloads.md).

## Bootfähige Medien erstellen

Wählen Sie eine Methode für Ihr Betriebssystem:

- [Rufus](/installation/tools/Rufus.md) unter Windows
- [Ventoy](/installation/tools/Ventoy.md) unter Windows oder Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) unter Windows, Linux oder macOS
- [`dd`](/installation/tools/dd.md) unter Linux oder macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) unter Linux
- [UNetbootin](/installation/tools/UNetbootin.md) unter Windows, Linux oder macOS
- [Dateibasierte USB-Installation](/installation/tools/File-Based-USB-Installation.md) für ein manuell vorbereitetes MiniOS-Layout

Das Schreiben eines Abbilds mit Rufus, Etcher, `dd` oder Drive Utility ist destruktiv. Überprüfen Sie vor dem Start den Gerätepfad, das Modell und die Kapazität. Ein Raw-Image-Write reproduziert das Abbild-Layout; es konfiguriert jedoch weder Persistenz noch führt es eine Live- oder native Installation mit dem MiniOS Installer durch.

Ventoy funktioniert anders: Installieren Sie Ventoy auf dem Gerät und kopieren Sie dann die ISO auf die Datenpartition. Dadurch bleibt das Multiboot-Layout von Ventoy erhalten.

## Live-Session starten

1. Starten Sie den Computer neu und öffnen Sie das Firmware-Boot-Menü.
2. Wählen Sie das USB-Gerät oder ein anderes bootfähiges Medium aus.
3. Starten Sie MiniOS und prüfen Sie, ob Speicher, Netzwerk und Eingabegeräte wie erwartet funktionieren.

Die Firmware-Einstellungen unterscheiden sich je nach Computer. Ein MiniOS-Image kann sowohl über BIOS als auch über UEFI starten; das Ziel einer späteren MiniOS Installer-Installation ist nicht auf MBR beschränkt.

Verwenden Sie [Boot-Modi](/configuration/Boot-Modes.md) als maßgebliche Anleitung für das Verhalten beim Live-Boot. Wenn beim frühen Start das Image oder seine Module nicht gefunden werden, siehe [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md).

## Installationslayout auswählen

Starten Sie aus der Live-Session den [MiniOS Installer](/installation/MiniOS-Installer.md), wenn Sie MiniOS auf einem anderen USB-Stick, einer SSD oder Festplatte installieren möchten.

- Der Live-Modus bewahrt den komprimierten Modul-Stack und das Live-Boot-Layout. Er unterstützt optionale Sitzungs-Persistenz und eignet sich für portable Installationen.
- Der Native-Modus entpackt die gewählten Module in ein konventionelles Linux-Root-Dateisystem, erzeugt ein initramfs und installiert einen unterstützten Bootloader. Der Native-Modus ist nur verfügbar, wenn das gebootete Image die erforderlichen Installer-Metadaten bereitstellt.

Live-Persistenz wird während des frühen Bootvorgangs vorbereitet; das detaillierte Verhalten ist unter [Initrd-Persistenz](/configuration/Initrd-Persistence.md) beschrieben. Sie gilt nicht für das konventionelle Root-Dateisystem des Native-Modus.

Der Installer unterstützt automatische BIOS/MBR-, UEFI/MBR- und UEFI/GPT-Layouts. BIOS auf GPT wird vom aktuellen Installer nicht unterstützt. Weitere Informationen zu Platzierung, Dateisystem, Persistenz und Partitionsgrenzen finden Sie unter [MiniOS Installer verwenden](/installation/MiniOS-Installer.md).
