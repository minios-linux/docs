# Schnellstart

Diese Anleitung beschreibt das Herunterladen, Schreiben, Booten und die Ersteinrichtung von MiniOS.

## 1. Wählen Sie eine Edition

- **Minimum** bietet eine reduzierte Paketauswahl und die Flux-Umgebung.
- **Standard** ist die allgemeine Xfce-Edition.
- **Toolbox** ergänzt Verwaltungs-, Diagnose-, Speicher- und Wiederherstellungswerkzeuge.
- **Ultra** enthält das umfangreichste Anwendungspaket.

Verfügbarkeit von Editionen und Desktops variiert je nach Release. Siehe
[Über MiniOS](/about/About-MiniOS.md) und die
[Paketliste](/administration/Packages.md) vor dem Herunterladen.

Laden Sie ein ISO von [minios.dev](https://minios.dev) oder der
[GitHub-Releases-Seite](https://github.com/minios-linux/minios-live/releases) herunter.
Überprüfen Sie die Prüfsumme vor der Verwendung; siehe
[Download verifizieren](/installation/Verifying-Downloads.md).

## 2. Zielgerät vorbereiten

Verwenden Sie ein Gerät, das groß genug für das gewählte ISO sowie für Daten oder eine persistente Sitzung ist, die Sie behalten möchten. Die ISO-Größe variiert je nach Release, daher sollten Sie die tatsächliche Downloadgröße und das Schreibwerkzeug prüfen, statt sich auf eine feste Angabe zu verlassen. Sichern Sie das Zielgerät vorher: Die meisten Installationsmethoden überschreiben es ganz oder teilweise.

Wählen Sie eine Methode und lesen Sie die jeweilige Anleitung, bevor Sie das Gerät auswählen:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) oder
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) oder
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) oder
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Aus MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Weitere dokumentierte Methoden sind [UNetbootin](/installation/tools/UNetbootin.md)
und die [Originalmethode](/installation/tools/Original-Method.md). Einen Vergleich finden Sie unter
[USB-Erstellungstools](/installation/tools/USB-Creation-Tools.md) und einen Überblick zur Installation unter
[MiniOS installieren](/installation/Installing-MiniOS.md).

## 3. Persistenz vor dem Schreiben verstehen

Persistenz wird nicht von jeder Schreib- oder Bootmethode erstellt.

- Ein Rohdaten-Schreibvorgang mit `dd`, Etcher oder einem ähnlichen Tool reproduziert das ISO. Dadurch wird jedoch keine persistente Sitzung eingerichtet.
- Ventoy startet das ISO normalerweise als Datei. MiniOS-Persistenz muss separat eingerichtet werden.
- Der MiniOS Installer kann eine Live-Installation erstellen und nativen, DynFileFS-, Raw- oder verschlüsselten LUKS-Sitzungsspeicher konfigurieren.
- Ein frischer Start läuft absichtlich ohne Persistenz. Andere MiniOS-Bootmenüeinträge können Sitzungen fortsetzen, erstellen oder auswählen, wenn beschreibbarer Speicher verfügbar ist.
- Eine native Installation ist ein klassisch installiertes System und verwendet keine Live-Sitzungspersistenz auf dieselbe Weise.

Siehe [Sitzungsverwaltung](/configuration/Session-Management.md) und
[Boot-Parameter](/configuration/Boot-Parameters.md), bevor Sie den Sitzungsspeicher ändern. Sichern Sie wichtige Dateien unabhängig vom Persistenzmodus.

## 4. MiniOS booten

1. Fahren Sie den Computer herunter und schließen Sie das vorbereitete Gerät an.
2. Öffnen Sie das Firmware-Bootmenü und wählen Sie den UEFI- oder Legacy-Eintrag des Geräts aus.
3. Wählen Sie für den ersten Hardwaretest eine frische Sitzung oder eine persistente Sitzung, falls diese bereits konfiguriert wurde.
4. Überprüfen Sie, ob Grafik, Tastatur, Speicher und Netzwerk funktionieren, bevor Sie Änderungen vornehmen, die das System verändern.

Wird das Gerät nicht angezeigt oder startet die Desktop-Umgebung nicht, siehe
[Hardware-Kompatibilität](/installation/Hardware-Compatibility.md) und
[Fehlerbehebung](/administration/Troubleshooting.md).

## 5. System konfigurieren

Öffnen Sie **Anwendungen > System > MiniOS konfigurieren** oder führen Sie aus:

```bash
minios-configurator
```

Der Konfigurator bearbeitet `/etc/live/config.conf`. Er kann Benutzeridentität, Passwörter, Sprache, Zeitzone, Tastatur, Hostname, Dienste, Benutzerspeicher und Sicherheitskontrollen festlegen. Die laufende Sitzung wird dabei nicht direkt geändert; gespeicherte Einstellungen werden je nach Anwendbarkeit übernommen, in der Regel nach einem Neustart oder beim Erstellen einer neuen Sitzung.

Sicherheitsprofile füllen konkrete Einstellungen für sudo, PolicyKit, SSH, XRDP, X11, Passwort-Hinweise, Bildschirmsperre und Autologin aus. Überprüfen Sie die resultierenden Kontrollen, statt sich nur auf den Profilnamen als Laufzeiteinstellung zu verlassen. Siehe
[Sicherheitshärtung](/administration/Security-Hardening.md) und die
[MiniOS-Konfigurator-Anleitung](/configuration/MiniOS-Configurator.md). Die
[Konfigurationsdatei-Referenz](/configuration/Configuration-File.md) dokumentiert die zugrunde liegenden Schlüssel.

## 6. Software installieren und Arbeit speichern

Mit APT vorgenommene Änderungen in einer Live-Sitzung bleiben nur bei persistenter Sitzung nach einem Neustart erhalten. SquashFS-Module bleiben getrennt von der beschreibbaren Sitzung und können als Teil des modularen Systems geladen werden; siehe
[Module erstellen](/development/Creating-Modules.md).

Speichern Sie wichtige Dateien auf bekannt beschreibbarem Speicher und testen Sie einen sauberen Shutdown und Neustart, bevor Sie sich auf eine persistente Sitzung verlassen.

## Hilfe erhalten

- [Leistungsoptimierung](/administration/Performance-Optimization.md)
- [Kernel-Management](/administration/Kernel-Management.md)
- [MiniOS bauen](/development/Building-MiniOS.md)
- [ISO neu erstellen](/development/Rebuilding-ISO.md)
- [GitHub-Issues](https://github.com/minios-linux/minios-live/issues)
- [MiniOS-Quellcode](https://github.com/minios-linux/minios-live)
- [Debian-Dokumentation](https://www.debian.org/doc/)
