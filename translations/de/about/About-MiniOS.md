---
updated: 2026-08-26
---

# Über MiniOS

MiniOS ist eine auf Debian basierende Linux-Distribution, die für den Betrieb von Wechseldatenträgern oder einer lokalen Festplatte konzipiert wurde. Das schreibgeschützte System wird aus SquashFS-Modulen zusammengesetzt, mit optionalen, beschreibbaren Sitzungen für Dateien, Einstellungen und installierte Pakete. MiniOS unterstützt 64-Bit-x86-Systeme und kann sowohl über UEFI als auch über das klassische BIOS gestartet werden.

## Systemmodell

- Das Basissystem und optionale Software sind separate Module. Module können beim Booten ausgewählt oder ohne eine vollständige System-Neuerstellung hinzugefügt werden.
- Eine frische Live-Session lässt die Basismodule unverändert.
- Persistenz kann Änderungen in einem nativen Verzeichnis, einem erweiterbaren DynFileFS-Container, einem Raw-Image mit fester Größe oder einem verschlüsselten LUKS-Container speichern – abhängig von der Installation und dem Ziel-Dateisystem.
- Der MiniOS Installer kann eine modulare Live-Installation erstellen oder, sofern das Abbild dies unterstützt, eine herkömmliche native Linux-Installation bereitstellen.

Siehe [Boot-Modi](/configuration/Boot-Modes.md) für den maßgeblichen Leitfaden zum Verhalten beim Live-Boot und [Systemarchitektur](/about/System-Architecture.md) für das Boot- und Modul-Layout. Die detaillierten Early-Boot-Verträge sind dokumentiert in [initrd System-Erkennung](/configuration/Initrd-System-Discovery.md), [initrd Modul-Laden](/configuration/Initrd-Module-Loading.md) und [initrd Persistenz](/configuration/Initrd-Persistence.md).

## Editionen

Die verfügbaren Editionen hängen von der jeweiligen Veröffentlichung und der zugrunde liegenden Distribution ab:

- **Flux** verwendet die Flux-Umgebung und ein reduziertes Paketangebot. Diese Edition eignet sich für Systeme, bei denen eine kleinere Softwareauswahl bevorzugt wird.
- **Standard** ist die Allzweck-Edition. Aktuelle Standard-Builds von Debian und Ubuntu nutzen Xfce.
- **Toolbox** ergänzt Systemverwaltungs-, Speicher-, Diagnose- und Wiederherstellungswerkzeuge.
- **Ultra** erweitert die anderen Editionen um ein noch größeres Anwendungsspektrum.

Xfce ist die übliche Desktop-Umgebung in den Images Standard, Toolbox und Ultra, aber nicht die einzige Umgebung von MiniOS. Die Flux-Edition verwendet Fluxbox, und unterstützte Build-Konfigurationen können weitere Umgebungen anbieten. Prüfen Sie die Release-Beschreibung vor dem Download, falls die Desktop-Umgebung für Sie relevant ist.

Welche Software in den jeweiligen Editionen enthalten ist, finden Sie in der [Paketliste](/administration/Packages.md) sowie unter [MiniOS-Anwendungen und Tools](/about/MiniOS-Applications.md).

## Installation und Persistenz

Ein ISO kann als bootfähiges Abbild geschrieben, auf ein Multiboot-Gerät kopiert oder mit dem MiniOS Installer installiert werden. Diese Methoden unterscheiden sich im Speicherverhalten. Abbild-Schreibprogramme wie `dd` und Etcher reproduzieren das ISO-Layout; Ventoy startet die ISO-Datei; der MiniOS Installer kann beschreibbaren Session-Speicher zuweisen und konfigurieren. Gehen Sie nicht davon aus, dass eine Schreibmethode automatisch Persistenz einrichtet.

Beginnen Sie mit dem [Schnellstart](/installation/Quick-Start.md) und verwenden Sie die verlinkte Anleitung für die gewählte Installationsmethode. Persistenz kann auch über ein entsprechendes Boot-Menü ausgewählt oder mit den dokumentierten Boot-Parametern konfiguriert werden, wenn beschreibbarer Speicher verfügbar ist. Siehe [Boot-Modi](/configuration/Boot-Modes.md) für das resultierende Live-Session-Verhalten und [Sitzungsverwaltung](/configuration/Session-Management.md) für Speicheroptionen.

## Projektressourcen

- [MiniOS-Website](https://minios.dev)
- [Quellcode](https://github.com/minios-linux/minios-live)
- [Issue-Tracker](https://github.com/minios-linux/minios-live/issues)
- [Häufig gestellte Fragen](/about/FAQ.md)
