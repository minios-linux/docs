# Über MiniOS

MiniOS ist eine auf Debian basierende Linux-Distribution, die für den Betrieb von Wechseldatenträgern oder einer lokalen Festplatte konzipiert wurde. Das schreibgeschützte System wird aus SquashFS-Modulen zusammengesetzt, mit optionalen, beschreibbaren Sitzungen für Dateien, Einstellungen und installierte Pakete. MiniOS unterstützt 64-Bit-x86-Systeme und kann sowohl über UEFI als auch über das klassische BIOS gestartet werden.

## Systemmodell

- Das Basissystem und optionale Software bestehen aus separaten Modulen. Module können beim Start ausgewählt oder nachträglich hinzugefügt werden, ohne das gesamte System neu zu erstellen.
- Eine neue Live-Sitzung lässt die Basismodule unverändert.
- Persistenz kann Änderungen je nach Installation und Ziel-Dateisystem in einem nativen Verzeichnis, einem erweiterbaren DynFileFS-Container, einem Raw-Image mit fester Größe oder einem verschlüsselten LUKS-Container speichern.
- Der MiniOS Installer kann eine modulare Live-Installation erstellen oder, sofern das Abbild es unterstützt, eine herkömmliche native Linux-Installation bereitstellen.

Siehe [Systemarchitektur](/about/System-Architecture.md) für den Boot- und Modulaufbau sowie [Sitzungsverwaltung](/configuration/Session-Management.md) für persistente Sitzungen.

## Editionen

Die verfügbaren Editionen hängen von der jeweiligen Veröffentlichung und der zugrunde liegenden Distribution ab:

- **Flux** verwendet die Flux-Umgebung und ein reduziertes Paketangebot. Diese Edition eignet sich für Systeme, bei denen eine kleinere Softwareauswahl bevorzugt wird.
- **Standard** ist die Allzweck-Edition. Aktuelle Standard-Builds von Debian und Ubuntu nutzen Xfce.
- **Toolbox** ergänzt Systemverwaltungs-, Speicher-, Diagnose- und Wiederherstellungswerkzeuge.
- **Ultra** erweitert die anderen Editionen um ein noch größeres Anwendungsspektrum.

Xfce ist die übliche Desktop-Umgebung in den Images Standard, Toolbox und Ultra, aber nicht die einzige Umgebung von MiniOS. Die Flux-Edition verwendet Fluxbox, und unterstützte Build-Konfigurationen können weitere Umgebungen anbieten. Prüfen Sie die Release-Beschreibung vor dem Download, falls die Desktop-Umgebung für Sie relevant ist.

Welche Software in den jeweiligen Editionen enthalten ist, finden Sie in der [Paketliste](/administration/Packages.md) sowie unter [MiniOS-Anwendungen und Tools](/about/MiniOS-Applications.md).

## Installation und Persistenz

Ein ISO kann als bootfähiges Abbild geschrieben, auf ein Multiboot-Gerät kopiert oder mit dem MiniOS Installer installiert werden. Diese Methoden unterscheiden sich im Speicherverhalten. Image-Schreibprogramme wie `dd` und Etcher übernehmen das ISO-Layout; Ventoy startet die ISO-Datei; der MiniOS Installer kann beschreibbaren Sitzungspeicher anlegen und konfigurieren. Gehen Sie nicht davon aus, dass eine Schreibmethode automatisch Persistenz einrichtet.

Beginnen Sie mit dem [Schnellstart](/installation/Quick-Start.md) und nutzen Sie die verlinkte Anleitung für die gewählte Installationsmethode. Persistenz kann auch über ein entsprechendes Bootmenü ausgewählt oder mit den dokumentierten Boot-Parametern konfiguriert werden, wenn beschreibbarer Speicher verfügbar ist.

## Projektressourcen

- [MiniOS-Website](https://minios.dev)
- [Quellcode](https://github.com/minios-linux/minios-live)
- [Issue-Tracker](https://github.com/minios-linux/minios-live/issues)
- [Häufig gestellte Fragen](/about/FAQ.md)
