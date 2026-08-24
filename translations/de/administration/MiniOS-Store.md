# MiniOS Store

Der MiniOS Store bietet einen Katalog von Anwendungsrezepten unter [store.minios.dev](https://store.minios.dev) an. Auf MiniOS können diese Rezepte direkt in das laufende System installiert oder zum Erstellen eines oder mehrerer SquashFS (`.sb`) Module verwendet werden.

Das Durchsuchen des Katalogs erfordert keinen lokalen Server. Für die Installation ist dies jedoch notwendig: Die Weboberfläche verbindet sich entweder mit dem lokalen MiniOS Store-Daemon oder öffnet den installierten `minios-store://` URI-Handler.

## Vor der Installation

Öffnen Sie die Detailansicht einer Anwendung und prüfen Sie vor dem Hinzufügen zum Warenkorb folgende Informationen:

- Die Paketnamen und die Installationsmethode.
- Das Installationsskript, sofern eines angezeigt wird.
- Die Anwendungs-Homepage und Informationen zum Entwickler.
- Ob das Rezept ein separates Debian-Paket herunterlädt.

Rezepte können APT-Pakete installieren, Debian-Pakete herunterladen oder Shell-Skripte ausführen. Installationsvorgänge werden mit Root-Rechten ausgeführt. Behandeln Sie ein Rezept und jede von ihm verwendete Quelle oder jeden Download als privilegierten Code.

## Anwendung installieren

1. Öffnen Sie den MiniOS Store über das Anwendungsmenü. Der Launcher prüft `https://store.minios.dev` und öffnet es im Standardbrowser.
2. Suchen oder stöbern Sie nach Kategorie, öffnen Sie die Anwendungsdetails und prüfen Sie die Pakete oder das Skript.
3. Fügen Sie eine oder mehrere Anwendungen dem Warenkorb hinzu.
4. In einer Live-MiniOS-Sitzung wählen Sie `Module` oder `System`. Ein nativ installiertes MiniOS-System verwendet automatisch den `System` Modus.
5. Bei mehreren Anwendungen im Modulmodus wählen Sie ein kombiniertes Modul oder einzelne Module. Ein kombiniertes Modul kann auch einen eigenen Namen erhalten.
6. Wählen Sie `Install` und verfolgen Sie den Fortschritt sowie die Befehlsausgabe. Die Seite verwendet den lokalen Daemon, wenn dessen Status `Connected` ist; andernfalls wird der URI-Handler versucht und es kann eine PolicyKit-Authentifizierungsabfrage erscheinen.

Es kann immer nur ein Daemon-Installationsvorgang gleichzeitig laufen. Das Schließen des Fortschrittsdialogs stoppt eine laufende Daemon-Installation nicht unbedingt; öffnen Sie die Installationsanzeige erneut, um sie einzusehen oder explizit abzubrechen.

## Modul- und Systemmodi

### Modulmodus

Im Modulmodus werden `apt2sb` oder `script2sb` in einer isolierten Modulbau-Umgebung ausgeführt. Die resultierenden `.sb` Dateien werden an den ersten beschreibbaren Speicherort in der folgenden Reihenfolge geschrieben:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Der erste Pfad ist das Modulverzeichnis auf dem aktuellen MiniOS-Startmedium. Ein dort erstelltes Modul wird von MiniOS Store in der aktuellen Sitzung nicht aktiviert. Lassen Sie das Modul in diesem Verzeichnis und starten Sie das System neu, um es beim nächsten Boot zu laden. Das Ergebnis bleibt nur verfügbar, wenn das zugrunde liegende Startmedium beschreibbar ist und die Datei erhalten bleibt.

Der zweite Pfad ist ein Fallback, der verwendet wird, wenn das normale Modulverzeichnis nicht beschreibbar ist. Ein Modul im Fallback-Verzeichnis ist nicht automatisch Teil des nächsten Live-Starts. Verwenden Sie `Open folder` und kopieren Sie das fertige Modul anschließend in das `minios/modules` Verzeichnis auf einem beschreibbaren MiniOS-Startmedium, bevor Sie neu starten.

Ein kombiniertes Modul enthält alle ausgewählten Rezepte. Bei getrennter Paketierung kann ein Fehler ein Rezept betreffen, während zuvor im Stapel erfolgreich erstellte Module im Zielverzeichnis verbleiben.

### Systemmodus

Im Systemmodus werden APT oder ein Rezept-Skript direkt auf das laufende Root-Dateisystem angewendet. Änderungen wirken sich auf das aktuelle System aus, anstatt ein Modul zu erzeugen. In einer Live-Sitzung hängt das Überleben dieser Änderungen nach einem Neustart von der Persistenzkonfiguration der Sitzung ab. Auf einem nativ installierten System verwendet der MiniOS Store immer den Systemmodus.

Der Systemmodus ist nicht transaktional. Ein fehlgeschlagener oder abgebrochener Vorgang kann Pakete, den Zustand des Repositorys oder durch frühere Befehle veränderte Dateien in einem inkonsistenten Zustand hinterlassen.

## Lokaler Dienst und Vertrauensgrenze

Der `minios-store` Dienst läuft als Root, da für den Modulbau und die direkte Paketinstallation Mount-, Overlay-, Chroot-, APT- und dpkg-Operationen erforderlich sind. Standardmäßig hört er nur auf `ws://127.0.0.1:8765`. Die gehostete Weboberfläche sendet vollständige Rezeptdaten, einschließlich Skripten und Download-URLs, an diesen lokalen Dienst.

Der Daemon prüft die Form der Anfrage und die unterstützte Installationsmethode, authentifiziert oder signiert die Rezeptdaten jedoch nicht unabhängig. Eine Seite, die den lokalen WebSocket-Endpunkt erreichen kann, kann privilegierte Installationsaufträge anfordern. Daher gilt:

- Lassen Sie den Daemon auf `127.0.0.1` gebunden. Öffnen Sie Port `8765` nicht ins LAN oder Internet.
- Setzen Sie `MINIOS_STORE_HOST` nicht auf eine Nicht-Loopback-Adresse, es sei denn, eine zusätzliche, geprüfte Sicherheitsgrenze ist vorhanden.
- Verwenden Sie ausschließlich die offizielle HTTPS-Store-Seite und prüfen Sie Rezepte vor der Installation.
- Stoppen oder deaktivieren Sie den Dienst, wenn keine browserbasierte Installation benötigt wird.

Verwalten Sie den systemd-Dienst mit:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Der URI-Handler ist ein separater Pfad. Er startet das GTK-Installationsprogramm über PolicyKit und benötigt den WebSocket-Daemon nicht. Aktuelle URI-Einträge werden als APT-Paketnamen mit gewünschtem Modul-Level und Kompressionseinstellung interpretiert. Der Installer startet nach der Autorisierung, daher sollten Sie die Browser-Anfrage prüfen, bevor Sie die Authentifizierungsabfrage akzeptieren.

## Abbruch

Wählen Sie `Cancel` im Web-Fortschrittsdialog oder `Cancel installation` im GTK-Installer. Der Abbruch markiert den Stapel als abgebrochen und beendet den aktuell verfolgten Kindprozess. Weitere Rezepte werden nicht gestartet.

Ein Abbruch ist kein Rollback. Bereits abgeschlossene Pakete oder Module bleiben erhalten, und ein während APT, dpkg, Skript, Download oder Modulbau unterbrochener Befehl kann einen unvollständigen Zustand oder eine unvollständige Ausgabedatei hinterlassen. Nach dem Abbruch:

1. Lesen Sie das abschließende Installationsprotokoll.
2. Überprüfen Sie das Zielmodulverzeichnis auf unerwartete oder Null-Größe-Dateien.
3. Führen Sie im Systemmodus `sudo dpkg --audit` aus und reparieren Sie gegebenenfalls die Paketkonfiguration.
4. Entfernen Sie nur Artefakte, die eindeutig zur abgebrochenen Aktion gehören.

## Fehlerbehebung

### Der Store ist offline

Überprüfen Sie den Netzwerkzugriff auf `https://store.minios.dev`. Ein `Offline` Status bedeutet außerdem, dass der Browser nicht mit dem lokalen WebSocket-Daemon verbunden ist; die Installation kann jedoch weiterhin über den URI-Handler erfolgen, wenn `minios-store-gui` installiert ist.

### Der Browser kann keine Verbindung zum Daemon herstellen

Überprüfen Sie den Dienst und dessen Protokolle:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Der übliche Endpunkt ist `ws://127.0.0.1:8765`. Ein Portkonflikt, ein gestoppter Dienst, eine fehlende `python3-websockets` oder Browser-Einschränkungen können die Verbindung verhindern. Ein Neustart des Browsers behebt keinen gestoppten Daemon.

### Authentifizierung schlägt fehl oder es erscheint keine Eingabeaufforderung

Der URI-Installer benötigt PolicyKit, `pkexec` und einen aktiven Desktop-Authentifizierungsagenten. Starten Sie das Installationsprogramm aus einer aktiven grafischen Sitzung heraus und stellen Sie sicher, dass `minios-store-gui` installiert ist. Umgehen Sie die Eingabeaufforderung nicht, indem Sie den Root-Daemon im Netzwerk freigeben.

### Modulerstellung schlägt fehl

Erweitern Sie das Installationsprotokoll und verwenden Sie den Fehler der letzten Befehlsausführung statt nur der Zusammenfassung. Häufige Ursachen sind nicht verfügbare Pakete, Fehler bei Repository oder DNS, unzureichender freier Speicherplatz, ein nicht unterstütztes Komprimierungswerkzeug und ein schreibgeschütztes Modulverzeichnis. Der Daemon meldet, wenn er auf `/var/lib/minios-store/modules` umgeschaltet hat.

### Die Anwendung fehlt nach der Installation

Im Modus "Modul" starten Sie das System neu, nachdem Sie bestätigt haben, dass sich die Datei `.sb` im Verzeichnis `minios/modules` des Boot-Mediums befindet. Eine Datei, die im Fallback-Verzeichnis verbleibt, wird nicht automatisch geladen. Im Systemmodus bei einer Live-Sitzung prüfen Sie, ob die Sitzung persistent ist, falls die Anwendung nach dem Neustart verschwunden ist.

### Eine abgebrochene Systeminstallation hat dpkg unvollständig hinterlassen

Überprüfen Sie den Paketstatus, bevor Sie es erneut versuchen:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Prüfen Sie die vorgeschlagenen APT-Änderungen, bevor Sie eine zusätzliche Reparaturoperation bestätigen.

## Verwandte Dokumentation

- [Module erstellen](/development/Creating-Modules.md)
- [ISO neu erstellen](/development/Rebuilding-ISO.md)
