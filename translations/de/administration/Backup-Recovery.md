# Backup und Wiederherstellung

Kein einzelnes Backup schützt alle Bereiche eines MiniOS-Systems. Persönliche Dateien, Konfiguration, persistente Sitzungen, Module und das Speichermedium erfordern unterschiedliche Wiederherstellungsverfahren. Bewahren Sie mehr als eine Kopie auf, halten Sie mindestens eine Kopie auf einem anderen Gerät vor und testen Sie die Wiederherstellung, bevor das Original benötigt wird.

## Verwenden Sie eine mehrschichtige Backup-Strategie

Ein praxisgerechtes Backup-Set besteht aus folgenden Ebenen:

1. Sichern Sie unersetzbare persönliche Dateien regelmäßig und unabhängig von der MiniOS-Sitzung.
2. Protokollieren Sie Änderungen an Konfiguration und Modulauswahl, sobald sie auftreten.
3. Exportieren Sie jede intakte, nicht laufende Sitzung in einem unterstützten Modus.
4. Bewahren Sie eine Offline-Kopie von Daten auf, die der Session Manager nicht exportieren kann.
5. Erstellen Sie gelegentlich ein vollständiges Abbild des Mediums, nachdem die Quelle heruntergefahren und nicht mehr beschrieben wird.

Verwenden Sie versionierte Zielorte, anstatt das vorherige, als funktionsfähig bekannte Backup zu überschreiben. Dokumentieren Sie MiniOS-Version, Edition, Architektur, Backup-Datum, Sitzungsmodus und Verschlüsselungsstatus zu jedem Backup. Ein vollständiges Medienabbild ist ein nützliches letztes Sicherheitsnetz, sollte aber nicht die einzige Kopie persönlicher Dateien sein.

## Sichern Sie persönliche Daten zuerst

Sichern Sie nach Möglichkeit das gesamte Home-Verzeichnis, einschließlich versteckter Anwendungseinstellungen. Mindestens sollten Arbeiten aus Desktop, Documents, Downloads, Music, Pictures, Public, Templates und Videos sowie alle außerhalb dieser Standardorte erstellten Projekt- oder Datenverzeichnisse enthalten sein.

Die MiniOS-Benutzermedienunterstützung kann die Standardbenutzerverzeichnisse mit einem separaten Speicherort auf dem beschreibbaren MiniOS-Medium verknüpfen oder einbinden. Der standardmäßig konfigurierte Pfad ist `/minios/userdata`, aber mit `LIVE_USER_DIRS_PATH` kann ein anderer sicherer Pfad gewählt werden. Die dort gespeicherten Daten liegen außerhalb der normalen Sitzungsschicht und müssen separat gesichert werden. Überprüfen Sie die tatsächlichen Link- oder Einhängeziele, anstatt davon auszugehen, dass ein Sitzungs-Export diese einschließt. Sichern Sie auch absichtlich auf anderen eingebundenen Datenträgern gespeicherte Dateien.

Schließen Sie Anwendungen, die Datenbanken, Mail-Speicher, Browser-Profile oder virtuelle Maschinen-Images schreiben, bevor Sie deren Daten kopieren. Für wichtige Daten bevorzugen Sie eine Backup-Methode, die Besitzrechte, Berechtigungen, Links, erweiterte Attribute und Zeitstempel erhält, sofern das Ziel dies unterstützt.

## Konfiguration sichern

Sichern Sie die Konfiguration, die zukünftige Starts steuert, nicht nur die aktuell im Root-Dateisystem sichtbaren Dateien. Relevante Speicherorte können sein:

- `minios/config.conf` und `minios/config.conf.d/` auf beschreibbaren MiniOS-Medien.
- `/etc/live/config.conf` und `/etc/live/config.conf.d/` in einem persistenten oder nativen System.
- Überprüfte Hooks, Preseeds, Bootmenü-Änderungen und eine Notiz zu benutzerdefinierten Boot-Parametern.
- Benutzerkonfiguration im Home-Verzeichnis und ausgewählte Systemkonfiguration unter `/etc` bei einer nativen Installation.

Konfiguration kann Passwort-Hashes, Netzwerk-Zugangsdaten, Schlüssel und Dienst-Einstellungen enthalten. Schützen Sie deren Backup entsprechend. Speichern Sie keine Klartext-Passphrasen neben einem verschlüsselten Sitzungs-Backup. Hinweise zu Verschlüsselung und Medienhandhabung finden Sie unter [Security hardening](/administration/Security-Hardening.md).

## Module sichern

Sichern Sie benutzerdefinierte `.sb`-Dateien aus dem dauerhaften Modul-Speicher und dokumentieren Sie deren Reihenfolge, Herkunft, MiniOS-Version und Zweck. Ziehen Sie keine Rückschlüsse auf den nächsten Start basierend auf dem aktuellen Root-Dateisystem:

- **Running Now** ist die Modulkombination des aktuell laufenden Live-Systems.
- **Next Boot** ist die Modulkombination, die durch die aktuellen Boot-Regeln ausgewählt wurde.

Ein Modul, das nur für die aktuelle Sitzung aktiviert wurde, ist möglicherweise nicht im dauerhaften Speicher vorhanden. Ein Modul, das für den nächsten Start hinzugefügt wurde, ist jetzt eventuell nicht aktiv. Überprüfen und dokumentieren Sie beide Ansichten vor dem Backup. Boot-Filter wie `load`, `noload` und `bext` können ebenfalls die effektive Modulauswahl für den nächsten Start beeinflussen. Siehe [Module Manager](/administration/Module-Manager.md).

## Persistente Sitzungen exportieren

Nutzen Sie [Session management](/configuration/Session-Management.md), um die aktuelle "Running Now"-Sitzung und die für den nächsten Start ausgewählte Sitzung zu identifizieren. Das Aktivieren einer anderen Sitzung ändert nur den nächsten Start; es macht die aktuelle Sitzung nicht sicher für den Export. Starten Sie in eine andere Sitzung oder ohne Persistenz, bevor Sie die vorher laufende Sitzung sichern.

Der Session Manager kann eine nicht laufende `native`, `dynfilefs`, `raw` oder `luks`-Sitzung als `.tar.zst`-Archiv exportieren. Der Export ist ein logisches Backup der Sitzungsdateien, nicht zwingend eine Byte-für-Byte-Kopie des Speichercontainers. Bewahren Sie das Archiv auf einem anderen Gerät auf. Der Import erstellt eine neue nummerierte Sitzung; prüfen und aktivieren Sie diese explizit erst nach Validierung.

Ein LUKS-Export enthält entschlüsselte logische Sitzungsdaten, nicht den verschlüsselten `changes.luks`-Container. Verschlüsseln Sie das Backup-Ziel oder das Archiv mit einer separaten, geprüften Methode, falls die exportierten Daten vertraulich bleiben müssen. Der Import in LUKS erzeugt einen neuen verschlüsselten Container und erfordert eine neue Ziel-Passphrase.

Kopieren Sie ein eingebundenes Sitzungsverzeichnis nicht manuell. Die Sitzung kann sich ändern und ein containerbasiertes Dateisystem wird während des Betriebs möglicherweise nicht durch einen konsistenten Dateisatz repräsentiert.

## SquashFS-Sitzungen offline sichern

Bevor Sie eine laufende SquashFS-Sitzung sichern, verwenden Sie **Jetzt speichern** und warten Sie, bis Speichern und Validierung abgeschlossen sind. Das Speichern erstellt `changes.sb` neu und ersetzt den vorherigen Snapshot atomar; eine Rollback-Generation wird nicht beibehalten. Fahren Sie anschließend das System sauber herunter.

Die aktuelle Session Manager-Implementierung lehnt den Export und das Kopieren von SquashFS ab. Nach dem Speichern starten Sie ohne Persistenz oder verwenden ein anderes Linux-System und kopieren die SquashFS-Sitzung aus dem inaktiven Sitzungs-Speicher. Bewahren Sie das vollständige nummerierte Sitzungsverzeichnis und die Sitzungs-Metadaten gemeinsam auf. Ersetzen oder nummerieren Sie keine Einträge in einem aktiven `minios/changes`-Speicher um. Siehe [Boot recovery](/administration/Boot-Recovery.md), bevor Sie beim Wiederherstellen Boot- oder Datenträgerstrukturen ändern.

## Jeden DynFileFS-Segment sichern

Eine DynFileFS-Sitzung ist ein logischer Container, der auf eine vollständige Menge von Sicherungsdateien aufgeteilt ist. Eine Offline-Kopie muss `changes.dat` und alle nummerierten Segmente wie `changes.dat.0`, `changes.dat.1` und spätere Segmente enthalten. Nur die erste Datei zu kopieren, ergibt kein verwendbares Backup. Erstellen Sie kein fehlendes Segment und reparieren Sie nicht die einzige Kopie.

Der normale Session Manager-Export umgeht diese Container-Ebene, indem er die logischen Sitzungsdateien exportiert. Für unterbrochene Kopien, fehlende Segmente, volles Medium und Dateisystemreparatur beachten Sie [DynFileFS und dynblk recovery](/configuration/DynFileFS-Recovery.md).

## Ein vollständiges Medienabbild erstellen

Das [Drive Utility](/installation/tools/Drive-Utility.md) kann mit **Abbild erstellen** ein gesamtes Gerät in ein Rohabbild einlesen, optional mit Komprimierung. Dabei werden Partitionstabelle, Bootdateien, Module, Konfiguration, Sitzungs-Speicher, Benutzermedien-Daten und ungenutzte Blöcke so erfasst, wie sie auf dem Quellgerät existieren. Die Abbilddatei benötigt daher ausreichend Ziel-Speicherplatz und kann wiederherstellbare gelöschte Daten und Geheimnisse enthalten.

Erstellen Sie das Abbild offline. Fahren Sie MiniOS herunter und schließen Sie das Quellmedium an ein anderes laufendes System an oder starten Sie von einem anderen Gerät. Stellen Sie sicher, dass keine Quellpartition eingehängt ist und keine Persistenz, kein Swap, keine Datenbank oder Hintergrunddienst darauf schreibt. Das Drive Utility blendet normalerweise eingehängte Geräte aus, aber die Anzeige eines Geräts in der Oberfläche garantiert keine konsistente Live-Rohabbild-Erstellung.

Überprüfen Sie die Quelle anhand von Gerätemodell, -größe und Gerätename. Speichern Sie das Abbild auf einem anderen physischen Gerät, niemals auf einem Dateisystem der zu sichernden Quelle. Für die Wiederherstellung überschreibt **Abbild schreiben** das ausgewählte Zielgerät roh. Bestätigen Sie das Ziel mit derselben Sorgfalt; alle vorhandenen Zieldaten gehen verloren. Verwenden Sie ein Ziel, das mindestens so groß ist wie die ursprüngliche Quelle, sofern das Abbild nicht explizit für ein kleineres Gerät vorbereitet wurde.

## Native Installationen sichern

Eine native Installation verwendet keine laufende persistente Sitzung als Root-Dateisystem, daher ist ein Session Manager-Export kein vollständiges Backup des nativen Systems. Sichern Sie Benutzer-Home-Verzeichnisse, ausgewählte Systemkonfiguration, Anwendungsdaten, lokal gepflegte Dateien und Wiederherstellungs-Zugangsdaten mit einer dateisystembewussten Backup-Methode. Dokumentieren Sie MiniOS-Version, Partitionslayout, installierte Paketauswahl, Boot-Modus sowie alle benutzerdefinierten Module oder Kernel.

Für Bare-Metal-Wiederherstellung erstellen Sie ein Offline-Ganzplattenabbild oder verwenden Sie ein getestetes Backup-Produkt, das die nativen Dateisysteme und das Partitionslayout unterstützt. Halten Sie ein separates Dateiebene-Backup bereit, damit einzelne Dateien wiederhergestellt werden können, ohne eine Festplatte zu überschreiben. Hinweise zur Diagnose von Boot-Dateien und Bootloader finden Sie unter [Boot recovery](/administration/Boot-Recovery.md).

## Backups validieren und Wiederherstellung testen

Eine abgeschlossene Kopie ist noch kein bewährtes Backup. Für jeden Backup-Zyklus:

1. Stellen Sie sicher, dass das Backup auf einem anderen Gerät liegt und das erwartete Datum und die erwartete Größe hat.
2. Erfassen und vergleichen Sie später eine kryptografische Prüfsumme für Archive und Festplattenabbilder.
3. Öffnen Sie eine Stichprobe persönlicher Dateien, darunter mindestens eine große Datei und eine Datei aus jedem wichtigen Anwendungsdatensatz.
4. Importieren Sie ein Sitzungsarchiv als neue, inaktive Sitzung und prüfen Sie deren Dateien. Testen Sie den Start erst, nachdem Sie die aktuelle, als funktionsfähig bekannte Sitzungswahl gesichert haben.
5. Überprüfen Sie, dass eine DynFileFS-Offline-Kopie die vollständige Segmentsequenz enthält.
6. Stellen Sie ein vollständiges Medienabbild nur auf einem austauschbaren oder Ersatzgerät ausreichender Größe wieder her und testen Sie anschließend sowohl den Start als auch den Zugriff auf wichtige Daten.
7. Testen Sie die Wiederherstellung nativer Dateien an einem separaten Ort und prüfen Sie Berechtigungen, Besitzrechte, Links und Anwendungslesbarkeit.

Führen Sie Wiederherstellungstests nach Änderungen am Persistenzmodus, an der Verschlüsselung, am Partitionslayout, an der MiniOS-Version oder an der Backup-Software durch. Bewahren Sie das letzte als funktionsfähig bekannte Backup auf, bis das Ersatz-Backup den Wiederherstellungstest bestanden hat. Für weitergehende Diagnose siehe [Boot recovery](/administration/Boot-Recovery.md), [DynFileFS und dynblk recovery](/configuration/DynFileFS-Recovery.md) und [Security hardening](/administration/Security-Hardening.md).
