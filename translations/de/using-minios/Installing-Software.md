---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Software installieren

MiniOS-App-Store bietet einen Katalog von Anwendungsrezepten unter [store.minios.dev](https://store.minios.dev) an. In der MiniOS Live-Umgebung können diese Rezepte direkt in das laufende System installiert oder verwendet werden, um ein oder mehrere SquashFS (`.sb`) Module zu bauen.

Diese Seite beschreibt den MiniOS Live-Software-Workflow. Eine native Installation behält die ausgewählte Desktop- und Standardanwendungssoftware bei, entfernt jedoch die für den Live-Betrieb vorgesehene MiniOS-spezifische Software. Auf dem installierten System wird stattdessen der normale Debian-Paketmanagement-Workflow verwendet.

Das Durchsuchen des Katalogs erfordert keinen lokalen Server. Für die Installation ist jedoch einer notwendig: Die Weboberfläche verbindet sich entweder mit dem lokalen MiniOS-App-Store-Daemon oder öffnet den installierten `minios-store://` URI-Handler.

## Vor der Installation

Öffnen Sie die Detailansicht einer Anwendung und prüfen Sie vor dem Hinzufügen zum Warenkorb folgende Informationen:

- Die Paketnamen und die Installationsmethode.
- Das Installationsskript, sofern eines angezeigt wird.
- Die Homepage der Anwendung und Informationen zum Entwickler.
- Ob das Rezept ein separates Debian-Paket herunterlädt.

Rezepte können APT-Pakete installieren, Debian-Pakete herunterladen oder Shell-Skripte ausführen. Installationsvorgänge laufen mit Root-Rechten. Behandeln Sie ein Rezept und jeden Download oder jedes Repository, das es verwendet, als privilegierten Code.

## Anwendung installieren

1. Öffnen Sie den MiniOS-App-Store über das Anwendungsmenü. Der Starter prüft `https://store.minios.dev` und öffnet ihn im Standardbrowser.
2. Suchen Sie nach Anwendungen oder stöbern Sie nach Kategorie, öffnen Sie die Anwendungsdetails und prüfen Sie die Pakete oder das Skript.
3. Fügen Sie eine oder mehrere Anwendungen dem Warenkorb hinzu.
4. Wählen Sie in einer Live-MiniOS-Sitzung `Module` oder `System` aus.
5. Für mehrere Anwendungen im Modulmodus wählen Sie ein kombiniertes Modul oder einzelne Module. Ein kombiniertes Modul kann auch einen eigenen Namen erhalten.
6. Wählen Sie `Install` und verfolgen Sie den Fortschritt sowie die Befehlsausgabe. Die Seite nutzt den lokalen Daemon, wenn dessen Status `Connected` ist; andernfalls wird der URI-Handler versucht und es kann eine PolicyKit-Authentifizierungsabfrage erscheinen.

Es kann immer nur ein Daemon-Installationsvorgang gleichzeitig laufen. Das Schließen des Fortschrittsdialogs stoppt eine laufende Installation nicht unbedingt; öffnen Sie den Installationsindikator erneut, um sie anzuzeigen oder explizit abzubrechen.

## Modul- und Systemmodi

### Modulmodus

Im Modulmodus wird `apt2sb` oder `script2sb` in einer isolierten Modul-Bauumgebung ausgeführt. Die daraus resultierenden `.sb`-Dateien werden an den ersten beschreibbaren Speicherort unten geschrieben:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Der erste Pfad ist das Modulverzeichnis auf dem aktuellen MiniOS-Bootmedium. Ein dort erstelltes Modul wird in der aktuellen Sitzung nicht durch den MiniOS-App-Store aktiviert. Lassen Sie das Modul in diesem Verzeichnis und starten Sie das System neu, um es beim nächsten Booten zu laden. Das Ergebnis bleibt nur verfügbar, wenn das zugrundeliegende Bootmedium beschreibbar ist und die Datei erhalten bleibt.

Der zweite Pfad ist ein Fallback, der verwendet wird, wenn das normale Modulverzeichnis nicht beschreibbar ist. Ein Modul im Fallback-Verzeichnis ist nicht automatisch Teil des nächsten Live-Starts. Verwenden Sie `Open folder` und kopieren Sie dann das fertige Modul vor dem Neustart in das `minios/modules`-Verzeichnis auf einem beschreibbaren MiniOS-Bootmedium.

Ein kombiniertes Modul enthält alle ausgewählten Rezepte. Bei getrennter Paketierung kann ein Fehler ein Rezept betreffen, während zuvor fertiggestellte Module im Zielverzeichnis verbleiben.

### Systemmodus

Im Systemmodus werden APT oder ein Rezeptskript direkt auf das laufende Root-Dateisystem angewendet. Änderungen wirken sich sofort auf das aktuelle Live-System aus, anstatt ein Modul zu erzeugen. Ob diese Änderungen einen Neustart überstehen, hängt von der Persistenzkonfiguration der Sitzung ab.

Der Systemmodus ist nicht transaktional. Ein fehlgeschlagener oder abgebrochener Vorgang kann dazu führen, dass Pakete, der Repository-Zustand oder durch frühere Befehle geänderte Dateien in einem inkonsistenten Zustand verbleiben.

## Lokaler Dienst und Vertrauensgrenze

Der `minios-store`-Dienst läuft als root, da für den Modulbau und die direkte Paketinstallation Mount-, Overlay-, Chroot-, APT- und dpkg-Operationen erforderlich sind. Standardmäßig lauscht er nur auf `ws://127.0.0.1:8765`. Die gehostete Weboberfläche sendet vollständige Rezeptdaten, einschließlich Skripten und Download-URLs, an diesen lokalen Dienst.

Der Daemon prüft die Struktur der Anfrage und die unterstützte Installationsmethode, authentifiziert oder signiert die Rezeptdaten jedoch nicht unabhängig. Eine Seite, die den lokalen WebSocket-Endpunkt erreicht, kann privilegierte Installationsaufträge anfordern. Daher gilt:

- Lassen Sie den Daemon auf `127.0.0.1` gebunden. Öffnen Sie Port `8765` nicht im LAN oder Internet.
- Setzen Sie `MINIOS_STORE_HOST` nicht auf eine Nicht-Loopback-Adresse, es sei denn, eine zusätzliche, geprüfte Sicherheitsgrenze ist vorhanden.
- Greifen Sie auf den MiniOS-App-Store nur über die offizielle HTTPS-Website zu und prüfen Sie Rezepte vor der Installation.
- Stoppen oder deaktivieren Sie den Dienst, wenn keine browserbasierte Installation benötigt wird.

Verwalten Sie den systemd-Dienst mit:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Der URI-Handler ist ein separater Pfad. Er startet den GTK-Installer über PolicyKit und benötigt den WebSocket-Daemon nicht. Aktuelle URI-Einträge werden als APT-Paketnamen mit gewünschtem Modul-Level und Komprimierung interpretiert. Die Installation startet nach der Autorisierung, daher prüfen Sie die Browser-Anfrage, bevor Sie die Authentifizierungsabfrage akzeptieren.

## Abbruch

Wählen Sie `Cancel` im Web-Fortschrittsdialog oder `Cancel installation` im GTK-Installer. Der Abbruch markiert den Batch als abgebrochen und beendet den aktuell verfolgten Kindprozess. Weitere Rezepte werden nicht gestartet.

Ein Abbruch ist kein Rollback. Bereits abgeschlossene Pakete oder Module bleiben erhalten, und ein während APT, dpkg, Skript, Download oder Modulbau unterbrochener Befehl kann einen unvollständigen Zustand oder eine unvollständige Ausgabedatei hinterlassen. Nach dem Abbruch:

1. Lesen Sie das abschließende Installationsprotokoll.
2. Prüfen Sie das Zielmodulverzeichnis auf unerwartete oder leere Dateien.
3. Führen Sie im Systemmodus `sudo dpkg --audit` aus und reparieren Sie ggf. die Paketkonfiguration.
4. Entfernen Sie nur Artefakte, die Sie eindeutig der abgebrochenen Aktion zuordnen können.

## Fehlerbehebung

### MiniOS-App-Store ist offline

Überprüfen Sie den Netzwerkzugriff auf `https://store.minios.dev`. Ein `Offline`-Status bedeutet ebenfalls, dass der Browser nicht mit dem lokalen WebSocket-Daemon verbunden ist; die Installation kann dennoch über den URI-Handler erfolgen, wenn `minios-store-gui` installiert ist.

### Der Browser kann keine Verbindung zum Daemon herstellen

Überprüfen Sie den Dienst und dessen Protokolle:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Der normale Endpunkt ist `ws://127.0.0.1:8765`. Ein Portkonflikt, gestoppter Dienst, fehlendes `python3-websockets` oder Browsereinschränkungen können die Verbindung verhindern. Ein Neustart des Browsers behebt keinen gestoppten Daemon.

### Authentifizierung schlägt fehl oder keine Abfrage erscheint

Der URI-Installer benötigt PolicyKit, `pkexec` und einen aktiven Desktop-Authentifizierungsagenten. Starten Sie den Installer aus einer aktiven grafischen Sitzung und prüfen Sie, ob `minios-store-gui` installiert ist. Umgehen Sie die Abfrage nicht, indem Sie den Root-Daemon im Netzwerk freigeben.

### Modulbau schlägt fehl

Erweitern Sie das Installationsprotokoll und verwenden Sie die letzte Befehlsfehlermeldung, nicht nur die Zusammenfassung. Häufige Ursachen sind nicht verfügbare Pakete, Repository- oder DNS-Fehler, zu wenig freier Speicherplatz, ein nicht unterstütztes Komprimierungswerkzeug und ein schreibgeschütztes Modulverzeichnis. Der Daemon meldet, wenn er auf `/var/lib/minios-store/modules` umgeschaltet hat.

### Die Anwendung fehlt nach der Installation

Für den Modulmodus starten Sie neu, nachdem Sie bestätigt haben, dass sich die Datei `.sb` im `minios/modules`-Verzeichnis des Bootmediums befindet. Eine Datei im Fallback-Verzeichnis wird nicht automatisch geladen. Im Systemmodus bei einer Live-Sitzung prüfen Sie, ob die Sitzung persistent ist, falls die Anwendung nach dem Neustart verschwunden ist.

### Ein abgebrochener System-Installationsvorgang hat dpkg nicht abgeschlossen

Überprüfen Sie den Paketstatus, bevor Sie es erneut versuchen:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Prüfen Sie die vorgeschlagenen APT-Änderungen, bevor Sie eine weitere Reparaturoperation bestätigen.

## Zugehörige Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [ISO neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
