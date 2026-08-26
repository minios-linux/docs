# Häufig gestellte Fragen

## Welche Edition soll ich wählen und warum fehlt eine Anwendung?

Die Flux-Edition verwendet die auf Fluxbox basierende Flux-Umgebung und ein reduziertes Paketset. Standard, Toolbox und Ultra fügen jeweils unterschiedliche Software hinzu, deren Verfügbarkeit je nach Release variiert. Weitere Informationen finden Sie unter [Über MiniOS](/about/About-MiniOS.md), [MiniOS-Anwendungen](/about/MiniOS-Applications.md) und in der [Paketliste](/administration/Packages.md).

## Ist das Schreiben der ISO das Gleiche wie die Installation von MiniOS?

Nein. Das Schreiben der ISO erstellt ein bootfähiges Live-Medium. Mit dem MiniOS Installer können Sie entweder ein modulares Live-System mit optionaler Persistenz oder ein konventionelles natives System installieren. Wählen Sie ein Layout mit [MiniOS installieren](/installation/Installing-MiniOS.md) und [MiniOS Installer](/installation/MiniOS-Installer.md).

## Wie lauten die Standard-Zugangsdaten?

Ein nicht angepasstes Live-Image verwendet `live` / `evil` und `root` / `toor`, und erlaubt möglicherweise automatisches Anmelden und Administration ohne Passwort. Ändern Sie diese Daten, bevor Sie ein unsicheres Netzwerk nutzen; folgen Sie der Anleitung zur [Sicherheitsoptimierung](/administration/Security-Hardening.md).

## Aktiviert das Schreiben von MiniOS auf einen USB-Stick die Persistenz?

Nicht unbedingt. Das direkte Schreiben der ISO und das normale Booten mit Ventoy konfigurieren nicht automatisch eine persistente Sitzung. Folgen Sie der Anleitung unter [Schnellstart](/installation/Quick-Start.md) und [Sitzungsverwaltung](/configuration/Session-Management.md) für die gewählte Schreib- und Boot-Methode.

## Was ist der Unterschied zwischen der aktiven und der laufenden Sitzung?

Die aktive Sitzung ist für den nächsten Systemstart ausgewählt; konzeptionell sorgt die laufende Sitzung aktuell für Persistenz. Der persistente `running=`-Eintrag kann nach einem Absturz veraltet sein, daher sind der geschützte Status des aktuellen Systemstarts und das eingehängte beschreibbare Layer maßgeblich für Laufzeitoperationen. Das Aktivieren einer Sitzung wechselt das aktuelle System nicht. Siehe [Sitzungsverwaltung](/configuration/Session-Management.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md).

## Warum sind meine Änderungen nach dem Neustart verschwunden?

Möglicherweise haben Sie eine neue Sitzung gestartet, ein Medium ohne Persistenz verwendet oder eine andere Sitzung ausgewählt. Native, DynFileFS-, Raw- und LUKS-Sitzungen nehmen während des laufenden Systems Schreibvorgänge entgegen; sie warten nicht auf einen Snapshot beim Herunterfahren. Nur bei SquashFS-Persistenz müssen die im RAM gespeicherten Änderungen in `changes.sb` neu eingebaut werden, sodass ein unterbrochener Shutdown oder eine deaktivierte Speicherpolitik dazu führen kann, dass die letzten Änderungen nicht gespeichert werden. Überprüfen Sie die laufende und aktive Sitzung wie in der [Sitzungsverwaltung](/configuration/Session-Management.md) und der [Fehlerbehebung](/administration/Troubleshooting.md) beschrieben.

## Sind LUKS und SquashFS die gleiche Art von Persistenz?

Nein. LUKS speichert eine verschlüsselte, beschreibbare ext4-Sitzung in einem Container. SquashFS ist ein komprimierter Snapshot, der von einer RAM-gestützten, beschreibbaren Ebene ausgeführt wird und gemäß seiner Richtlinie gespeichert werden muss. Weitere Informationen finden Sie unter
[Sitzungsverwaltung](/configuration/Session-Management.md) und [Security Hardening](/administration/Security-Hardening.md).

## Warum erscheint eine Store-Anwendung oder ein Modul erst nach dem Neustart?

Der Modulmodus erstellt ein schreibgeschütztes `.sb`-Modul für den nächsten Start; die Anwendung wird nicht zum aktuellen Modul-Stack hinzugefügt. Überprüfen Sie den Speicherort und starten Sie wie in [MiniOS Store](/administration/MiniOS-Store.md) beschrieben neu.

## Sollte ich Software mit APT oder als Modul installieren?

Verwenden Sie APT, um ein laufendes System oder eine persistente Sitzung zu verändern. Nutzen Sie Module für schreibgeschützte Software-Schichten, die beim Start geladen werden. Vergleichen Sie die Auswirkungen und Speicheranforderungen in [Software-Updates](/administration/Software-Updates.md) und [Module erstellen](/development/Creating-Modules.md).

## Kann ich MiniOS auf eine neue Version direkt aktualisieren?

Es gibt kein unterstütztes In-Place-Upgrade für neue Releases. Behandeln Sie ein Debian-Release-Upgrade nicht als MiniOS-Image-Upgrade. Sichern Sie Ihre Daten und verwenden Sie ein für das Zielrelease erstelltes Image; siehe [Software-Updates](/administration/Software-Updates.md).

## Sollte ich `ip=` für die normale Netzwerkkonfiguration verwenden?

Nein. Wenn Sie eine Adresskonfiguration als `ip=<configuration>` angeben, wird der frühe Netzwerk-Boot ausgewählt und lokale Medien werden übersprungen. Konfigurieren Sie das laufende System mit NetworkManager oder den dokumentierten Netzwerktools. Siehe [Netzwerk-Boot](/installation/Network-Boot.md) und [Netzwerkkonfiguration](/configuration/Network-Configuration.md).

## Wie behalte ich meine WLAN-Einstellungen nach dem Neustart?

Speichern Sie das NetworkManager-Profil in einer persistenten Live-Sitzung oder einer nativen Installation und testen Sie anschließend einen Neustart. Der Installer erstellt oder ändert keine WLAN-Profile. Siehe [Netzwerkkonfiguration](/configuration/Network-Configuration.md) und [Sitzungsverwaltung](/configuration/Session-Management.md).

## Unterstützt MiniOS BIOS und UEFI?

MiniOS unterstützt sowohl Legacy-BIOS als auch x86-64 UEFI, aber der verfügbare Firmware-Eintrag und das Partitionslayout des Installers sind weiterhin relevant. Siehe [MiniOS installieren](/installation/Installing-MiniOS.md) und verwenden Sie [Boot-Wiederherstellung](/administration/Boot-Recovery.md), wenn ein installiertes System nicht startet.

## Wie überprüfe ich eine ISO?

Laden Sie die ISO und die passende `.iso.sha256`-Datei aus derselben offiziellen Veröffentlichung herunter und vergleichen Sie anschließend den SHA-256-Hash, bevor Sie sie schreiben oder booten. Folgen Sie der Anleitung unter [Downloads verifizieren](/installation/Verifying-Downloads.md).

## Sollte ich zuerst eine defekte Sitzung oder ein Dateisystem reparieren?

Sichern Sie wichtige Daten und identifizieren Sie das genaue Gerät, Dateisystem und den Einhängepunkt, bevor Sie Änderungen vornehmen. Reparieren Sie niemals die einzige Kopie oder eine aktive Sitzung. Beginnen Sie mit [Backup und Wiederherstellung](/administration/Backup-Recovery.md), [Fehlerbehebung](/administration/Troubleshooting.md) und [Boot-Wiederherstellung](/administration/Boot-Recovery.md).

## Was sollte ich angeben, wenn ich um Hilfe bitte oder ein Problem melde?

Notieren Sie Edition und Version, Start- und Persistenzmethode, Hardware, genaue Schritte, den ersten Fehler und relevante Protokolle. Entfernen Sie Zugangsdaten und andere sensible Daten, folgen Sie dann [Logs sammeln](/administration/Troubleshooting.md) und melden Sie reproduzierbare Fehler im
[MiniOS Issue Tracker](https://github.com/minios-linux/minios-live/issues).

## Sollte ich aus dem Quellcode bauen oder den Image Builder verwenden?

Bauen Sie aus dem Quellcode, wenn Sie das komplette MiniOS-System und den Modulsatz selbst erstellen möchten. Verwenden Sie den [MiniOS Image Builder](/development/Image-Builder.md) für eine geführte Anpassung oder [`minios-image-compose`](/development/Rebuilding-ISO.md), um einen bestehenden MiniOS-Inhaltbaum über die Kommandozeile zusammenzustellen. Weitere Informationen zum Quellcode-Build finden Sie unter [MiniOS bauen](/development/Building-MiniOS.md).
