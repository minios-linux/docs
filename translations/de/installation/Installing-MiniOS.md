# Installation von MiniOS

Es gibt zwei verschiedene Aufgaben, die oft als Installation bezeichnet werden:

- Das Schreiben der ISO auf ein Wechseldatenträger erstellt das bootfähige Medium, mit dem eine MiniOS-Live-Session gestartet wird. Image-Schreibprogramme überschreiben das ausgewählte Gerät mit dem ISO-Layout.
- Das Ausführen des [MiniOS Installer](/installation/MiniOS-Installer.md) aus einer Live-Session installiert MiniOS auf einem anderen Laufwerk. Dabei kann entweder eine modulare Live-Installation oder eine herkömmliche native Linux-Installation erstellt werden.

## ISO herunterladen und verifizieren

Laden Sie eine ISO von der [offiziellen Website](https://minios.dev) oder der offiziellen [GitHub Releases-Seite](https://github.com/minios-linux/minios-live/releases) herunter. Überprüfen Sie die Datei, bevor Sie sie auf ein Gerät schreiben; siehe [Downloads verifizieren](/installation/Verifying-Downloads.md).

## Bootfähiges Medium erstellen

Wählen Sie eine Methode für Ihr Betriebssystem:

- [Rufus](/installation/tools/Rufus.md) unter Windows
- [Ventoy](/installation/tools/Ventoy.md) unter Windows oder Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) unter Windows, Linux oder macOS
- [`dd`](/installation/tools/dd.md) unter Linux oder macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) unter Linux
- [UNetbootin](/installation/tools/UNetbootin.md) unter Windows, Linux oder macOS
- [Originalmethode](/installation/tools/Original-Method.md) für ein dateibasiertes MiniOS-Layout

Das Schreiben eines Images mit Rufus, Etcher, `dd` oder Drive Utility ist destruktiv. Überprüfen Sie vor dem Start den Gerätepfad, das Modell und die Kapazität. Diese Tools erstellen bootfähige Medien; sie führen keine Live- oder native Installation mit dem MiniOS Installer durch.

Ventoy funktioniert anders: Installieren Sie Ventoy auf dem Gerät und kopieren Sie dann die ISO auf die Datenpartition. Dadurch bleibt das Multiboot-Layout von Ventoy erhalten.

## Die Live-Session starten

1. Starten Sie den Computer neu und öffnen Sie das Firmware-Bootmenü.
2. Wählen Sie das USB-Gerät oder ein anderes bootfähiges Medium aus.
3. Starten Sie MiniOS und prüfen Sie, ob Speicher, Netzwerk und Eingabegeräte wie erwartet funktionieren.

Firmware-Einstellungen unterscheiden sich je nach Computer. Ein MiniOS-Image kann sowohl im BIOS- als auch im UEFI-Modus booten; das Ziel einer späteren Installation mit dem MiniOS Installer ist nicht auf MBR beschränkt.

## Installationslayout auswählen

Starten Sie aus der Live-Session den [MiniOS Installer](/installation/MiniOS-Installer.md), wenn Sie MiniOS auf einem anderen USB-Stick, einer SSD oder Festplatte installieren möchten.

- Der Live-Modus bewahrt den komprimierten Modul-Stack und das Live-Boot-Layout. Er unterstützt optional Persistenz und eignet sich für portable Installationen.
- Der Native-Modus entpackt die ausgewählten Module in ein herkömmliches Linux-Root-Dateisystem, erzeugt ein initramfs und installiert einen unterstützten Bootloader. Der Native-Modus ist nur verfügbar, wenn das gestartete Image die erforderlichen Installer-Metadaten bereitstellt.

Der Installer unterstützt automatische BIOS/MBR-, UEFI/MBR- und UEFI/GPT-Layouts. BIOS auf GPT wird vom aktuellen Installer nicht unterstützt. Siehe [MiniOS Installer verwenden](/installation/MiniOS-Installer.md) für Hinweise zu Platzierung, Dateisystem, Persistenz und Partitionsgrenzen.
