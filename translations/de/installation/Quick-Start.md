# Schnellstart

Diese Anleitung beschreibt das Herunterladen, Schreiben, Booten und die Ersteinrichtung von MiniOS.

## 1. Edition auswählen

- **Flux** bietet ein reduziertes Paketangebot und die Flux-Umgebung.
- **Standard** ist die allgemeine Xfce-Edition.
- **Toolbox** ergänzt Verwaltungs-, Diagnose-, Speicher- und Wiederherstellungswerkzeuge.
- **Ultra** enthält das umfangreichste Anwendungspaket.

Verfügbarkeit von Editionen und Desktops variiert je nach Release. Siehe
[Über MiniOS](/about/About-MiniOS.md) und die
[Paketliste](/administration/Packages.md) vor dem Download.

Lade ein ISO von [minios.dev](https://minios.dev) oder der
[GitHub-Releases-Seite](https://github.com/minios-linux/minios-live/releases) herunter.
Überprüfe die Prüfsumme vor der Verwendung; siehe
[Downloads verifizieren](/installation/Verifying-Downloads.md).

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

## 3. Persistenz verstehen, bevor Sie schreiben

Persistenz wird nicht durch jede Schreib- oder Startmethode erzeugt.

- Ein Rohabbild-Schreibvorgang mit `dd`, Etcher oder einem ähnlichen Tool reproduziert das ISO. Dadurch wird jedoch keine persistente Sitzung eingerichtet.
- Ventoy startet das ISO normalerweise als Datei. Die Persistenz von MiniOS muss separat eingerichtet werden.
- Der MiniOS Installer kann eine Live-Installation erstellen und nativen, DynFileFS-, Raw- oder verschlüsselten LUKS-Sitzungsspeicher konfigurieren.
- Ein frischer Start läuft absichtlich ohne Persistenz. Andere MiniOS Boot-Menüeinträge können Sitzungen fortsetzen, erstellen oder auswählen, wenn beschreibbarer Speicher verfügbar ist.
- Eine native Installation ist ein konventionell installiertes System und verwendet Live-Session-Persistenz nicht auf die gleiche Weise.

Verwenden Sie [Boot-Modi](/configuration/Boot-Modes.md) als maßgebliche Anleitung für das für Nutzer sichtbare Verhalten beim Live-Start. Siehe [Sitzungsverwaltung](/configuration/Session-Management.md) für Speicheroptionen, [Initrd-Persistenz](/configuration/Initrd-Persistence.md) für den detaillierten Bootzeit-Vertrag und [Boot-Parameter](/configuration/Boot-Parameters.md), bevor Sie Kernel-Optionen ändern. Erstellen Sie unabhängig vom Persistenzmodus ein Backup wichtiger Dateien.

## 4. MiniOS starten

1. Fahren Sie den Computer herunter und schließen Sie das vorbereitete Gerät an.
2. Öffnen Sie das Firmware-Boot-Menü und wählen Sie den UEFI- oder Legacy-Eintrag des Geräts aus.
3. Wählen Sie für einen ersten Hardware-Test eine frische Sitzung oder eine persistente Sitzung nur, wenn bereits eine konfiguriert wurde.
4. Überprüfen Sie, ob Grafik, Tastatur, Speicher und Netzwerk funktionieren, bevor Sie Änderungen an der Installation vornehmen, die nicht rückgängig gemacht werden können.

Wenn das Gerät nicht aufgeführt ist oder der Desktop nicht startet, siehe [Hardware-Kompatibilität](/installation/Hardware-Compatibility.md) und [Fehlerbehebung](/administration/Troubleshooting.md). Bei Problemen beim Auffinden der Live-Quelle siehe [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md).

## 5. System konfigurieren

Öffne **Anwendungen > System > MiniOS konfigurieren** oder führe aus:

```bash
minios-configurator
```

Der Konfigurator bearbeitet `/etc/live/config.conf`. Er kann Benutzeridentität,
Passwörter, Sprache, Zeitzone, Tastatur, Hostname, Dienste, Benutzerverzeichnis-
speicher und Sicherheitskontrollen einstellen. Das laufende System wird dabei nicht direkt geändert;
gespeicherte Einstellungen werden je nach Anwendbarkeit übernommen, in der Regel
nach einem Neustart oder beim Erstellen einer neuen Sitzung.

Sicherheitsprofile füllen konkrete Einstellungen für sudo, PolicyKit, SSH, XRDP, X11,
Passworthinweise, Bildschirmsperre und Autologin aus. Überprüfe die resultierenden Kontrollen,
statt den Profilnamen als Laufzeiteinstellung zu betrachten. Siehe
[Sicherheitshärtung](/administration/Security-Hardening.md) und den
[MiniOS Konfigurator-Leitfaden](/configuration/MiniOS-Configurator.md). Die
[Konfigurationsdatei-Referenz](/configuration/Configuration-File.md) dokumentiert
die zugrunde liegenden Schlüssel.

Normale kabelgebundene und WLAN-Verbindungen werden mit der [Netzwerkkonfiguration](/configuration/Network-Configuration.md) eingerichtet. Der Netzwerk-Boot-Parameter `ip=` ist keine dauerhafte NetworkManager-Einstellung.

## 6. Software installieren und Arbeit speichern

APT-Änderungen, die in einer Live-Sitzung vorgenommen werden, überstehen einen Neustart nur, wenn diese Sitzung persistent ist. SquashFS-Module bleiben vom beschreibbaren Sitzungsbereich getrennt und können als Teil des modularen Systems geladen werden; siehe [Module erstellen](/development/Creating-Modules.md) und [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md).

Speichern Sie wichtige Dateien auf bekannt beschreibbarem Speicher und testen Sie einen sauberen Shutdown und Neustart, bevor Sie sich auf eine persistente Sitzung verlassen.

## Hilfe erhalten

- [Leistungsoptimierung](/administration/Performance-Optimization.md)
- [MiniOS Anwendungen und Tools](/about/MiniOS-Applications.md)
- [Backup und Wiederherstellung](/administration/Backup-Recovery.md)
- [Häufig gestellte Fragen](/about/FAQ.md)
- [Kernel-Verwaltung](/administration/Kernel-Management.md)
- [MiniOS bauen](/development/Building-MiniOS.md)
- [ISO neu erstellen](/development/Rebuilding-ISO.md)
- [GitHub-Issues](https://github.com/minios-linux/minios-live/issues)
- [MiniOS Quellcode](https://github.com/minios-linux/minios-live)
- [Debian-Dokumentation](https://www.debian.org/doc/)
