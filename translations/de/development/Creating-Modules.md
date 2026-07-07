# Module erstellen

Module in MiniOS sind eigenständige Pakete aus Dateien und Konfigurationen, die die Funktionalität des Basissystems erweitern. Sie ähneln Paketen in anderen Linux-Distributionen, sind jedoch so konzipiert, dass sie übereinander geschichtet werden können, was ein flexibles und anpassbares System ermöglicht. Dieser Layer-Ansatz erlaubt eine einfache Anpassung, das Zurücksetzen von Änderungen und das Teilen von Konfigurationen.

Den vollständigen Kontext zum MiniOS-Bauprozess und zur Systemarchitektur finden Sie im [Building MiniOS Guide](/development/Building-MiniOS.md). Informationen zum in Modulen verwendeten CondinAPT-Paketmanagementsystem finden Sie in der [CondinAPT Dokumentation](/development/CondinAPT.md).

Für das Erstellen von Modulen in MiniOS stehen zahlreiche Werkzeuge zur Verfügung. Alle sind für die Nutzung im Terminal ausgelegt und erfordern Root-Rechte.

**Werkzeuge zur Modulerstellung:**

**apt2sb** – Installiert Pakete aus Repositories und packt sie in ein Modul.<br>
**script2sb** – Führt die im Skript beschriebenen Aktionen aus und packt das Ergebnis in ein Modul.<br>
**chroot2sb** – Öffnet eine chroot-Umgebung, in der beliebige Aktionen durchgeführt werden können; nach dem Verlassen werden die Änderungen im Modul gespeichert.<br>

**Weitere Werkzeuge zur Modulverwaltung:**

**dir2sb** – Wandelt ein bestehendes Verzeichnis in ein komprimiertes Modul um.<br>
**sb2dir** – Wandelt ein komprimiertes Modul in ein Verzeichnis zur Prüfung um.<br>
**rmsbdir** – Entfernt ein von sb2dir erstelltes Modulverzeichnis.<br>
**savechanges** – Speichert alle geänderten Dateien im System als komprimiertes Dateisystem-Bundle.<br>
**sb2iso** – Erstellt ein MiniOS-ISO-Image und kann dabei Module hinzufügen oder ausschließen.<br>
**sb** – Umfassende Oberfläche zur Verwaltung von MiniOS-Bundles (aktivieren, deaktivieren, auflisten, konvertieren).<br>

**Gemeinsame Merkmale der Modulerstellungswerkzeuge:**
- Unterstützung verschiedener Komprimierungsarten: zstd (Standard), gzip, lzo, xz
- Anpassbare Dateiendung für Module (Standard: sb)
- Ebenenbasierte Filterung zur Steuerung, welche bestehenden Module als Abhängigkeiten einbezogen werden
- Individuelle Namensvergabe für Ausgabemodule
- Alle Werkzeuge müssen als root ausgeführt werden

## apt2sb

Um ein Modul mit apt2sb zu erstellen, listen Sie einfach die Pakete auf, die Sie im Modul bündeln möchten, z. B. `apt2sb install chromium chromium-sandbox`. Wenn Sie diesen Befehl im entsprechenden Ordner ausführen, entsteht ein chromium.sb-Modul, das den Chromium-Browser enthält. Dieses Modul wird relativ zu allen Modulen gebaut, die im System geladen sind. Das bedeutet, dass es diese Module zum Ausführen benötigt, da die für das Programm erforderlichen Bibliotheken möglicherweise bereits im System installiert und in unteren Modulen enthalten sind.

Mit der Option `-l`/`--level` können Sie angeben, auf welchem Top-Modul Ihr Modul aufgebaut werden soll. Zum Beispiel filtert der Befehl `apt2sb install -l 4 chromium chromium-sandbox` alle Module mit der Nummer 04 und höher beim Bauen heraus, d. h. das Modul wird auf Basis der Module 00-03 erstellt. Nach Ausführung dieses Befehls erhalten Sie das Modul 04-chromium.sb im aktuellen Ordner. Dieses Modul ist größer als das im vorherigen Beispiel, da es alle zum Ausführen notwendigen Bibliotheken enthält, die sich sonst in Modulen ab 04 befinden könnten. Es kann also sowohl mit als auch ohne die Module 04-xx laufen.

Der Modulname wird automatisch aus dem Namen des zuerst angegebenen Pakets (hier chromium) und, falls die --level-Option gesetzt ist, der Ebenennummer gebildet. Möchten Sie den Modulnamen selbst festlegen, nutzen Sie die Option `-n`/`--name`, z. B. `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Weitere Optionen von apt2sb:**

- `-c`/`--comp` – Komprimierungsart (zstd, gzip, lzo, xz). Standard: zstd
- `-b`/`--bext` – Bundle-Endung. Standard: sb
- `-y`/`--yes` – Automatische Bestätigung aller Abfragen
- `--allow-downgrades` – Paket-Downgrades erlauben
- `--install-recommends` – Empfohlene Pakete als Abhängigkeit berücksichtigen
- `--install-suggests` – Vorgeschlagene Pakete als Abhängigkeit berücksichtigen
- `--no-install-recommends` – Empfohlene Pakete nicht als Abhängigkeit berücksichtigen
- `--no-install-suggests` – Vorgeschlagene Pakete nicht als Abhängigkeit berücksichtigen
- `-t`/`--target-release` – Standard-Release, aus dem Pakete installiert werden

apt2sb bietet auch den Befehl `upgrade`, mit dem bereits installierte Pakete aktualisiert werden können. Die Optionen sind identisch mit denen von install.

## script2sb

Um ein Modul mit script2sb zu erstellen, schreiben Sie ein Bash-Skript, das die nötigen Schritte zur Erstellung Ihres Moduls beschreibt. Das ist besonders nützlich, wenn Sie vor oder nach der Installation Aktionen im Dateisystem ausführen, Schlüssel importieren, ein Repository hinzufügen usw. müssen. Hier ein Beispiel für ein solches Skript:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Um den Build mit diesem Skript (nennen wir es caddy.sh) zu starten, führen Sie den Befehl `script2sb -s ./caddy.sh` aus.

**Verfügbare Optionen für script2sb:**

- `-s`/`--script` – Verwendet DATEI als Installationsskript (erforderlich)
- `-l`/`--level` – Verwendet LEVEL als Filterebene
- `-n`/`--name` – Verwendet NAME als Dateinamen für das Modul
- `-c`/`--comp` – Komprimierungsart (zstd, gzip, lzo, xz). Standard: zstd
- `-b`/`--bext` – Bundle-Endung. Standard: sb
- `-d`/`--directory` – Kopiert den Inhalt von VERZEICHNIS in das Root des Moduls

Wird kein Modulname angegeben, wird der Name aus der Ebenennummer (falls angegeben) und dem Skriptnamen gebildet. Ein Beispiel für die Ausführung mit diesen Optionen: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

Zusätzlich können Sie die Option `-d`/`--directory` nutzen. Ist diese Option gesetzt, wird der Inhalt des angegebenen Ordners vor Ausführung des Skripts ins Root des Moduls kopiert. Die Dateien in diesem Ordner sollten so angeordnet sein, wie sie im System-Root liegen würden. Möchten Sie z. B. eine Verknüpfung für ein Programm im Menü platzieren, erstellen Sie einen mymodule-Ordner und darin die entsprechende Struktur relativ zum System-Root:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
In den Ordner mymodule/usr/share/applications legen Sie die Desktop-Datei, die nach dem Build ins Modul gepackt wird, und führen dann den Build-Befehl aus:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

Das Tool `chroot2sb` dient dazu, eine interaktive chroot-Umgebung zu erstellen. So können Sie *beliebige* Aktionen zur Erstellung Ihres Moduls manuell durchführen (Pakete installieren, Dateien bearbeiten, Befehle ausführen usw.). Nach dem Verlassen der chroot-Umgebung werden Ihre Änderungen in ein Modul gepackt.

**Verfügbare Optionen für chroot2sb:**

- `-l`/`--level` – Verwendet LEVEL als Filterebene  
- `-n`/`--name` – Verwendet NAME als Dateinamen für das Modul
- `-c`/`--comp` – Komprimierungsart (zstd, gzip, lzo, xz). Standard: zstd
- `-b`/`--bext` – Bundle-Endung. Standard: sb
- `-d`/`--directory` – Kopiert den Inhalt von VERZEICHNIS in das Root des Moduls

Wird kein Modulname angegeben, wird der Name aus der Ebenennummer (falls angegeben) und dem aktuellen Datum und der Uhrzeit im Format JJJJMMTT-HHMM gebildet.

Sie können auch die Option `-d`/`--directory` wie bei `script2sb` nutzen. Ist diese Option gesetzt, wird der Inhalt des angegebenen Ordners *vor* dem Betreten der chroot-Umgebung ins Root des Moduls kopiert. So haben Sie eine Ausgangsbasis für Ihre Anpassungen.

**Beispiele:**

- Basis-chroot, automatischer Modulname: `chroot2sb`
- Ebene und Komprimierung angeben: `chroot2sb -l 3 -c gzip`
- Ebene, Name und Komprimierung angeben: `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Dateien aus einem Verzeichnis vor dem chroot kopieren: `chroot2sb -d /path/to/my/files`

Nach Ausführung des Befehls `chroot2sb` befinden Sie sich in einer chroot-Umgebung. Dort können Sie alle gewünschten Aktionen durchführen. Wenn Sie fertig sind, geben Sie `exit` ein, um die Umgebung zu verlassen. `chroot2sb` packt dann die Änderungen in ein Modul. Die in der chroot eingegebenen Befehle werden *nicht* als Teil des Installationsprozesses im Modul gespeichert. Es handelt sich um einen Snapshot des finalen Dateisystemzustands. Die Bash-History wird automatisch aus dem Modul entfernt.

## Weitere Werkzeuge zur Modulverwaltung

Zusätzlich zu den Modulerstellungswerkzeugen stellt MiniOS mehrere Tools zur Verwaltung und Bearbeitung bestehender Module bereit:

### dir2sb

Das Tool `dir2sb` wird verwendet, um ein bestehendes Verzeichnis in ein komprimiertes Modul umzuwandeln. Das ist nützlich, wenn Sie bereits eine Verzeichnisstruktur mit allen benötigten Dateien vorbereitet haben und diese ohne Installationsprozesse in ein Modul packen möchten.

**Verfügbare Optionen für dir2sb:**

- `-c`/`--comp` – Komprimierungsart (zstd, gzip, lzo, xz). Standard: zstd
- `-b`/`--bext` – Bundle-Endung. Standard: sb

**Verwendung:**

`dir2sb [OPTIONEN] QUELLVERZEICHNIS [ZIELDATEI]`

**Verhalten:**

- Hat das `QUELLVERZEICHNIS` keine .sb-Endung und heißt nicht 'squashfs-root', wird das Verzeichnis selbst ins Modul aufgenommen und `ZIELDATEI` ist erforderlich.
- Wird `ZIELDATEI` nicht angegeben, wird das `QUELLVERZEICHNIS` durch die neue Moduldatei ersetzt.

**Beispiele:**

- Vorbereitetes Verzeichnis in Modul umwandeln: `dir2sb /path/to/my/prepared/files my-module.sb`
- squashfs-root-Verzeichnis umwandeln (ersetzt Original): `dir2sb squashfs-root`
- Andere Komprimierung verwenden: `dir2sb -c xz /path/to/files custom-module.sb`

Dieses Tool ist besonders nützlich, wenn Sie:
- Vorgefertigte Dateien und Verzeichnisse bündeln möchten
- Entpackte Modul-Inhalte wieder in ein Modul umwandeln wollen
- Module aus manuell vorbereiteten Verzeichnisstrukturen erstellen möchten

### sb2dir

Das Tool `sb2dir` wandelt ein komprimiertes Modul (.sb-Datei) in ein gleichnamiges Verzeichnis um. Das ist hilfreich, um den Inhalt eines Moduls zu extrahieren und zu untersuchen.

**Verwendung:**

`sb2dir [quelldatei.sb] [optional_ausgabeverzeichnis]`

**Verhalten:**

- Wird ein Ausgabeverzeichnis angegeben, muss es existieren
- Wird kein Ausgabeverzeichnis angegeben, wird der Name der quelldatei.sb verwendet und das Verzeichnis mit tmpfs überlagert

**Beispiele:**

- Modul extrahieren, um den Inhalt zu prüfen: `sb2dir mymodule.sb`
- In ein bestimmtes Verzeichnis extrahieren: `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

Das Tool `rmsbdir` entfernt ein von `sb2dir` erstelltes Modulverzeichnis. Dadurch wird ein ggf. verwendetes tmpfs sauber entfernt.

**Verwendung:**

`rmsbdir [quelldatei.sb]`

**Beispiel:**

- Extrahiertes Modulverzeichnis entfernen: `rmsbdir mymodule.sb`

### savechanges

Das Tool `savechanges` speichert alle geänderten Dateien im System als komprimiertes Dateisystem-Bundle. Das ist nützlich, um Module aus Laufzeitänderungen zu erstellen.

**Verfügbare Optionen:**

- `-c`/`--comp` – Komprimierungsart (zstd, gzip, lzo, xz). Standard: zstd
- `-b`/`--bext` – Bundle-Endung. Standard: sb

**Verwendung:**

`savechanges [OPTIONEN] zieldatei.sb [changes_verzeichnis]`

Wird kein changes_verzeichnis angegeben, wird `/run/initramfs/memory/changes` verwendet.

**Beispiele:**

- Alle aktuellen Änderungen speichern: `savechanges my-changes.sb`
- Mit anderer Komprimierung speichern: `savechanges -c xz my-changes.sb`

### sb2iso

Das Tool `sb2iso` erstellt ein MiniOS-ISO-Image und kann dabei bestimmte Module hinzufügen oder bestehende ausschließen.

**Verfügbare Optionen:**

- `-e`/`--exclude` – Schließt jeden Pfad oder jede Datei aus, die auf REGEX passt
- `-n`/`--name` – Gibt den Namen der Ausgabedatei für das ISO an (Standard: minios-YYYYMMDD_HHMM.iso)

**Verwendung:**

`sb2iso [OPTIONEN]... [MODULE.SB]...`

**Beispiele:**

- MiniOS-ISO ohne firefox.sb-Modul erstellen: `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Nur MiniOS-Textmodus-Kern erstellen: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

Das Tool `sb` bietet eine umfassende Oberfläche zur Verwaltung von MiniOS-Bundles, einschließlich Aktivierung, Deaktivierung und Konvertierung.

**Wichtig:** Das Tool `sb` benötigt AUFS (Advanced multi layered UniFication FileSystem) Kernel-Support für die meisten Operationen. Ist AUFS im Kernel nicht verfügbar, funktionieren viele Befehle nicht.

**Verfügbare Befehle:**

- `activate BUNDLE` – Aktiviert ein MiniOS-Bundle
- `deactivate BUNDLE` – Deaktiviert ein aktives MiniOS-Bundle  
- `list` – Listet aktive MiniOS-Bundles auf
- `savechanges` – Speichert zur Laufzeit vorgenommene Änderungen im Bundle
- `rm DIR` / `rmdir DIR` – Entfernt ein entpacktes Bundle-Verzeichnis
- `conv PFAD` – Konvertiert ein .sb-Bundle in ein Verzeichnis oder umgekehrt

**Beispiele:**

- Modul aktivieren: `sb activate mymodule.sb`
- Modul deaktivieren: `sb deactivate mymodule.sb`
- Aktive Module auflisten: `sb list`
- Modul in Verzeichnis umwandeln: `sb conv mymodule.sb`
- Verzeichnis in Modul umwandeln: `sb conv mymodule/`

**Hinweis:** Die Befehle `activate`, `deactivate` und `list` erfordern AUFS-Kernel-Support und Root-Rechte. Die Befehle `conv`, `rm` und `rmdir` funktionieren ohne AUFS, benötigen aber ebenfalls Root-Rechte.

## Weiterführende Dokumentation

- **[ISO neu bauen](/development/Rebuilding-ISO.md)** – Erfahren Sie, wie Sie Ihre eigenen Module mit `sb2iso` in bootfähige ISO-Images integrieren
- **[Building MiniOS](/development/Building-MiniOS.md)** – Komplette Anleitung zum Bau von MiniOS aus dem Quellcode mit individuellen Konfigurationen
