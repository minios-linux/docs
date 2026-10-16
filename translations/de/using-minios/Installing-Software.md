---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Software installieren

Der MiniOS-App-Store bietet einen Katalog von Anwendungs-Rezepten unter [store.minios.dev](https://store.minios.dev). In der MiniOS Live-Umgebung können diese Rezepte direkt im laufenden System installiert oder verwendet werden, um ein oder mehrere SquashFS (`.sb`)-Module zu erstellen.

Diese Seite beschreibt den MiniOS Live-Software-Workflow. Eine native Installation behält die gewählte Desktop-Umgebung und die normalen Anwendungen bei, entfernt jedoch die für den Live-Betrieb bestimmte MiniOS-spezifische Software. Verwenden Sie stattdessen auf dem installierten System den üblichen Debian-Paketverwaltungs-Workflow.

Das Durchsuchen des Katalogs erfordert keinen lokalen Server. Für die Installation ist dies jedoch notwendig: Die Weboberfläche verbindet sich entweder mit dem lokalen MiniOS-App-Store-Daemon oder öffnet den installierten `minios-store://` URI-Handler.

## Vor der Installation

Öffnen Sie die Detailansicht einer Anwendung und prüfen Sie vor dem Hinzufügen zum Warenkorb folgende Informationen:

- Die Paketnamen und die Installationsmethode.
- Das Installationsskript, sofern eines angezeigt wird.
- Die Homepage der Anwendung und Informationen zum Entwickler.
- Screenshots und Anwendungs-Grafiken, sofern vorhanden. Diese dienen nur der Präsentation und sind kein Beweis für die Vertrauenswürdigkeit eines Rezepts.
- Ob das Rezept ein separates Debian-Paket herunterlädt.
- Jede zusätzliche Softwarelizenz, die das Rezept anzeigt. Rezepte, die eine Zustimmung erfordern, können erst installiert werden, nachdem Sie diese Lizenz ausdrücklich akzeptiert haben.

Rezepte können APT-Pakete installieren, Debian-Pakete herunterladen oder Shell-Skripte ausführen. Installationsvorgänge werden mit Root-Rechten ausgeführt. Behandeln Sie ein Rezept sowie jeden Download oder jedes verwendete Repository als privilegierten Code.

## Eine Anwendung installieren

1. Öffnen Sie den MiniOS-App-Store über das Anwendungsmenü. Der Launcher prüft `https://store.minios.dev` und öffnet ihn im Standardbrowser.
2. Suchen oder stöbern Sie nach Kategorie, öffnen Sie die Anwendungsdetails und prüfen Sie die Pakete oder das Skript.
3. Fügen Sie eine oder mehrere Anwendungen dem Warenkorb hinzu.
4. Wählen Sie in einer Live-MiniOS-Sitzung `Module` oder `System`.
5. Im Modulmodus wählen Sie bei Bedarf die Build-Ebene aus. **Rezept-Standard** behält die konfigurierte Ebene jedes Rezepts bei; **Auto** verwendet alle aktuell geladenen Module als Build-Basis und erzeugt einen unnummerierten Modulnamen; eine numerische Ebene von `01` bis `09` nutzt nur die bis zu dieser Ebene geladenen Module. Bevorzugen Sie Rezept-Standard, es sei denn, Sie möchten gezielt Abhängigkeiten zu höheren optionalen Schichten vermeiden.
6. Bei mehreren Anwendungen im Modulmodus wählen Sie ein gemeinsames Modul oder separate Module. Ein gemeinsames Modul kann auch einen eigenen Namen erhalten.
7. Akzeptieren Sie alle Rezeptlizenzen, die ausdrücklich eine Zustimmung erfordern.
8. Wählen Sie `Install` und verfolgen Sie den Fortschritt sowie die Befehlsausgabe. Die Seite verwendet den lokalen Daemon, wenn dessen Status `Connected` ist; andernfalls wird der URI-Handler versucht und es kann eine PolicyKit-Authentifizierungsabfrage erscheinen.

Es kann immer nur ein Daemon-Installationsvorgang gleichzeitig laufen. Das Schließen des Fortschrittsdialogs beendet eine laufende Daemon-Installation nicht zwangsläufig; öffnen Sie die Installationsanzeige erneut, um sie einzusehen oder explizit abzubrechen.

## Modul- und Systemmodus

### Modulmodus

Im Modulmodus werden `apt2sb` oder `script2sb` in einer isolierten Modul-Bauumgebung ausgeführt. Die erzeugten `.sb`-Dateien werden im ersten beschreibbaren Speicherort unten abgelegt:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Der erste Pfad ist das effektive Module-Verzeichnis des MiniOS-Datenbaums. Bei einem normalen, beschreibbaren Start befindet es sich auf dem Speicher, nach System-`toram`-Kopieren kann es jedoch RAM-gestützt sein; Store prüft die Schreibbarkeit, nicht die Dauerhaftigkeit. Ein erstelltes Modul wird in der aktuellen Sitzung nicht aktiviert. Es wird erst bei einem späteren Start geladen, wenn es auf dauerhaften `minios/modules/`-Speicher kopiert wurde und von den Boot-Filtern zugelassen ist. Nutzen Sie im Modul-Manager die Option **Zum nächsten Start hinzufügen** oder `sudo sb next-boot add /path/to/module.sb`wenn geeigneter, dauerhafter Speicher verfügbar ist.

Der zweite Pfad ist ein Fallback, der verwendet wird, wenn das normale Module-Verzeichnis nicht beschreibbar ist. Ein Modul im Fallback-Verzeichnis ist nicht automatisch Teil des nächsten Live-Starts. Verwenden Sie `Open folder`, und kopieren Sie das fertige Modul anschließend in das `minios/modules`-Verzeichnis auf einem beschreibbaren MiniOS-Bootmedium, bevor Sie neu starten.

Ein kombiniertes Modul enthält alle ausgewählten Rezepte. Bei getrennter Paketierung kann ein Fehler ein einzelnes Rezept betreffen, während zuvor erfolgreich erstellte Module weiterhin im Zielverzeichnis verbleiben.

### Systemmodus

Im Systemmodus wird APT oder ein Rezeptskript direkt auf das laufende Root-Dateisystem angewendet. Änderungen wirken sich sofort auf das aktuelle Live-System aus, anstatt ein Modul zu erzeugen. Ob diese Änderungen einen Neustart überstehen, hängt von der Persistenzkonfiguration der Sitzung ab.

Der Systemmodus ist nicht transaktional. Ein fehlgeschlagener oder abgebrochener Vorgang kann Pakete, den Repository-Zustand oder durch frühere Befehle veränderte Dateien in einem veränderten Zustand hinterlassen.

## Lokaler Dienst und Vertrauensgrenze

Der `minios-store`-Dienst läuft als root, da für den Modulbau und die direkte Paketinstallation mount-, Overlay-, chroot-, APT- und dpkg-Operationen erforderlich sind. Standardmäßig lauscht er nur auf `ws://127.0.0.1:8765`. Die gehostete Weboberfläche sendet vollständige Rezeptdaten, einschließlich Skripte und Download-URLs, an diesen lokalen Dienst.

Der Daemon prüft die Form der Anfrage und die unterstützte Installationsmethode, authentifiziert oder signiert die Rezeptdaten jedoch nicht eigenständig. Eine Seite, die den lokalen WebSocket-Endpunkt erreicht, kann privilegierte Installationsaufträge anfordern. Daher gilt:

- Belassen Sie den Daemon gebunden an `127.0.0.1`. Öffnen Sie den Port `8765` nicht ins LAN oder Internet.
- Setzen Sie `MINIOS_STORE_HOST` nicht auf eine Nicht-Loopback-Adresse, außer es besteht eine zusätzliche, geprüfte Sicherheitsgrenze.
- Greifen Sie auf den MiniOS-App-Store ausschließlich über die offizielle HTTPS-Website zu und prüfen Sie Rezepte vor der Installation.
- Stoppen oder deaktivieren Sie den Dienst, wenn keine browserbasierte Installation benötigt wird.

Verwalten Sie den systemd-Dienst mit:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Der URI-Handler ist ein separater Pfad. Er startet den GTK-Installer über PolicyKit und benötigt den WebSocket-Daemon nicht. Aktuelle Store-Links enthalten eine vollständig codierte Rezeptnutzlast, sodass APT-, Skript- und heruntergeladene DEB-Rezepte denselben Fallback-Pfad nutzen können; explizite Lizenzannahmen werden separat übermittelt und vom lokalen Installer erneut geprüft. Die ältere `recipes=id:level:compression`-Form bleibt als Kompatibilitätsfallback erhalten und wird als APT-Rezept interpretiert. Der Installer startet nach der Autorisierung, daher sollten Sie die Browser-Anfrage prüfen, bevor Sie die Authentifizierungsabfrage akzeptieren.

## Abbruch

Wählen Sie `Cancel` im Web-Fortschrittsdialog oder `Cancel installation` im GTK-Installer. Ein Abbruch markiert den Batch als abgebrochen und beendet den aktuell verfolgten Kindprozess. Weitere Rezepte werden nicht gestartet.

Ein Abbruch ist kein Rollback. Bereits abgeschlossene Pakete oder Module bleiben erhalten, und ein während APT, dpkg, Skript, Download oder Modulbau unterbrochener Befehl kann einen unvollständigen Zustand oder eine unvollständige Ausgabedatei hinterlassen. Nach dem Abbruch gilt:

1. Lesen Sie das abschließende Installationsprotokoll.
2. Überprüfen Sie das Zielmodulverzeichnis auf unerwartete oder leere Dateien.
3. Führen Sie im Systemmodus `sudo dpkg --audit` aus und reparieren Sie ggf. die Paketkonfiguration.
4. Entfernen Sie nur Artefakte, die eindeutig zur abgebrochenen Aktion gehören.

## Fehlerbehebung

### MiniOS-App-Store ist offline

Prüfen Sie den Netzwerkzugriff auf `https://store.minios.dev`. Ein `Offline`-Status bedeutet außerdem, dass der Browser nicht mit dem lokalen WebSocket-Daemon verbunden ist; die Installation kann aber weiterhin über den URI-Handler erfolgen, wenn `minios-store-gui` installiert ist.

### Der Browser kann keine Verbindung zum Daemon herstellen

Prüfen Sie den Dienst und seine Protokolle:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Der Standardendpunkt ist `ws://127.0.0.1:8765`. Ein Portkonflikt, gestoppter Dienst, fehlendes `python3-websockets` oder Browsereinschränkungen können die Verbindung verhindern. Ein Neustart des Browsers behebt keinen gestoppten Daemon.

### Authentifizierung schlägt fehl oder es erscheint keine Abfrage

Der URI-Installer benötigt PolicyKit, `pkexec`, sowie einen aktiven Desktop-Authentifizierungsagenten. Starten Sie den Installer aus einer aktiven grafischen Sitzung und prüfen Sie, ob `minios-store-gui` installiert ist. Umgehen Sie die Abfrage nicht, indem Sie den Root-Daemon im Netzwerk freigeben.

### Modulbau schlägt fehl

Erweitern Sie das Installationsprotokoll und nutzen Sie die letzte Befehlsfehlermeldung, nicht nur die Zusammenfassung. Häufige Ursachen sind nicht verfügbare Pakete, Repository- oder DNS-Fehler, zu wenig freier Speicherplatz, ein nicht unterstütztes Kompressionstool und ein schreibgeschütztes Modulverzeichnis. Der Daemon meldet, wenn er auf `/var/lib/minios-store/modules` umschaltet.

### Die Anwendung fehlt nach der Installation

Starten Sie im Modulmodus neu, nachdem Sie bestätigt haben, dass die `.sb`-Datei im `minios/modules`-Verzeichnis des Bootmediums liegt. Eine Datei im Fallback-Verzeichnis wird nicht automatisch geladen. Im Systemmodus einer Live-Sitzung prüfen Sie, ob die Sitzung persistent ist, falls die Anwendung nach dem Neustart verschwunden ist.

### Eine abgebrochene Systeminstallation hat dpkg nicht abgeschlossen

Prüfen Sie den Paketstatus, bevor Sie es erneut versuchen:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Überprüfen Sie die vorgeschlagenen APT-Änderungen, bevor Sie eine weitere Reparaturoperation bestätigen.

## Verwandte Dokumentation

- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [ISO neu erstellen](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
