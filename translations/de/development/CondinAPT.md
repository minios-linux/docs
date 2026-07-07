# CondinAPT: Ein umfassender Leitfaden zur bedingten Paketinstallation

**CondinAPT** ist ein vielseitiges Tool zur Automatisierung der Paketinstallation auf jedem Debian-ähnlichen System (Debian, Ubuntu und deren Derivate). Das Hauptmerkmal ist die Möglichkeit, komplexe Bedingungen und Regeln für die Installation einzelner Pakete basierend auf beliebigen Systemkonfigurationen zu definieren.

**Anwendungsbereiche:**
- Build-Systeme für Linux-Distributionen
- Automatisierung der Server- und Workstation-Einrichtung
- Bereitstellung verschiedener Systemkonfigurationen
- Paketverwaltung in Docker-Containern
- CI/CD-Pipelines zur Umgebungseinrichtung
- Erstellung individueller Installationsabbilder

## Inhaltsverzeichnis

### Grundlagen

- [Funktionsweise und Kernkomponenten](#how-it-works-and-core-components)
- [Schnellstart](#quick-start)
- [Verwendung](#usage)

### Syntax und Funktionen

- [Syntax der Paketlisten-Datei](#package-list-file-syntax)
- [Filter und Bedingungen](#filters-and-conditions)
- [Installationswarteschlangen](#installation-queues)
- [Prioritätswarteschlange](#priority-queue)

### Betriebsmodi

- [Betriebsmodi und Debugging](#operating-modes-and-debugging)
- [Fehlerbehandlung und Wiederherstellung](#error-handling-and-recovery)

### Erweiterte Nutzung

- [Erweiterte Funktionen](#advanced-features)
- [Integration mit Build-Systemen](#integration-with-build-systems)

### Praktische Beispiele

- [Beispiele aus der Praxis](#examples-of-real-world-scenarios)
- [Optimierungstipps](#optimization-tips)
- [Fehlerbehebung](#troubleshooting)

**Hauptfunktionen:**

*   **Bedingte Installation:** Installiere Pakete basierend auf flexiblen Filtern (+, -).
*   **Externe Konfiguration:** Vollständige Trennung von Logik (Paketliste) und Daten (Systemparameter).
*   **Installationswarteschlangen:** Unterteile den Prozess in aufeinanderfolgende Phasen zur Auflösung von Abhängigkeiten.
*   **Prioritätswarteschlange:** Gewährleistet die Installation kritischer Pakete zuerst.
*   **Komplexe Logik:** Unterstützung für "UND" (`&&`), "ODER" (`||`) Operatoren sowie Gruppenfilter (`+{a|b}`, `-{a&b}`).
*   **Lesbarkeit:** Unterstützung für Kommentare und Leerzeilen zur Strukturierung von Listen.
*   **Abwärtskompatibilität:** Unterstützt einfache Paketlisten ohne Bedingungen.

## Funktionsweise und Hauptkomponenten

CondinAPT arbeitet mit vier zentralen Dateien:

1.  **`condinapt`-Skript:** Das Kernstück, enthält die gesamte Verarbeitungslogik.

2.  **Hauptkonfigurationsdatei (`-c`):** Eine Datei mit Bash-Variablen, die die aktuelle Umgebung beschreiben.

    Beispiel (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Filter-Mapping-Datei (`-m`):** Verknüpft Kurzpräfixe (wie sie in der Paketliste verwendet werden) mit Variablennamen aus der Hauptkonfigurationsdatei. Diese Datei ist **optional**. Ist ein Filter nicht in der Filter-Mapping-Datei vorhanden, wird er als Variablenname aus der Hauptkonfigurationsdatei verwendet. Falls die Variable nicht gefunden wird, setzt CondinAPT sie auf leer.

    Beispiel (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Paketliste (`-l`):** Die Hauptdatei, die beschreibt, was installiert werden soll und unter welchen Bedingungen.

## Schnellstart

Um CondinAPT schnell kennenzulernen, erstelle ein einfaches Beispiel:

**1. Konfigurationsdatei `config.conf` erstellen:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Paketliste `packages.list` erstellen:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Installation ausführen:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Oder im Simulationsmodus testen:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Verwendung

### Kommandozeile

```bash
./condinapt [OPTIONS]
```

| Schalter      | Langer Schalter                | Argument | Beschreibung                                         |
| :------------ | :----------------------------- | :------- | :--------------------------------------------------- |
| `-l`          | `--package-list`               | `PFAD`   | **(Erforderlich)** Pfad zur Paketliste.              |
| `-c`          | `--config`                     | `PFAD`   | **(Erforderlich)** Pfad zur Hauptkonfigurationsdatei.|
| `-m`          | `--filter-mapping`             | `PFAD`   | (Optional) Pfad zur Filter-Mapping-Datei.            |
| `-P`          | `--priority-list`              | `PFAD`   | (Optional) Pfad zu einer Prioritätenfilterdatei. Enthält Regex-Muster zur Paketübereinstimmung. Gefundene Pakete werden in die Prioritätenwarteschlange verschoben (Filter bleiben erhalten). |
| `-s`          | `--simulation`                 |          | Simulationsmodus. Pakete werden nicht installiert.    |
| `-C`          | `--check-only`                 |          | Prüft nur, ob Pakete bereits installiert sind. Gibt Exit-Code 1 zurück, falls Pakete fehlen. Am Ende wird ein Befehl zum Nachinstallieren ausgegeben. |
| `-v` / `-vv`  | `--verbose` / `--very-verbose` |          | Ausführliche / sehr ausführliche Ausgabe.             |
| `-x`          | `--xtrace`                     |          | Aktiviert `set -x` für Kommandoverfolgung.            |
| `-f`          | `--force`                      |          | Erzwingt ein Update der Paketlisten vor der Installation. Standardmäßig wird das Update übersprungen, wenn `/var/cache/apt/pkgcache.bin` existiert. |
| `-h`          | `--help`                       |          | Zeigt die Hilfe an.                                   |

## Syntax der Paketliste

### Grundstruktur

Dies ist das Herzstück von CondinAPT. Die gesamte Logik wird hier beschrieben.

Jede Zeile in der Paketliste besteht aus zwei Hauptbestandteilen:

1. **Paketname mit optionaler Versions- und Release-Angabe**
2. **Bedingungsfilter** – definieren, unter welchen Bedingungen das Paket installiert wird

> **Grundlage für alle folgenden Beispiele:**
> Für alle nachfolgenden Beispiele wird angenommen, dass die Dateien `system.conf` und `filters.map` aus dem Abschnitt [Funktionsweise und Hauptkomponenten](#how-it-works-and-core-components) verwendet werden.
>
> *   `DISTRIBUTION` = "bookworm"
> *   `SYSTEM_TYPE` = "server"
> *   `ENVIRONMENT` = "production"

### Paketnamensstruktur

**Einfacher Name:**
```
vim
```

**Paketversion:**
- `package=version` — lockere Versionsangabe. Falls die gewünschte Version nicht verfügbar ist, wird eine verfügbare Version installiert.
  ```
  git=2.25.1
  ```
- `package==version` — strikte Vorgabe. Ist die Version nicht auffindbar, wird die Installation mit Fehler abgebrochen.
  ```
  curl==7.68.0
  ```

**Release-Angabe:**
Das Release wird mit dem `@`-Symbol angegeben und ermöglicht die Bindung der Installation an einen bestimmten Repository-Zweig.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Dateistruktur

*   **Pakete:** Jedes Paket oder jede Bedingung steht in einer neuen Zeile.
*   **Kommentare:** Zeilen, die mit `#` beginnen, oder Text nach `#` in einer Zeile, werden komplett ignoriert.
*   **Leere Zeilen:** Werden ignoriert und dienen der Übersichtlichkeit.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filter und Bedingungen

Filter ermöglichen es, zusätzliche Bedingungen für die Paketauswahl zu definieren. Sie vergleichen die Werte von Systemvariablen (Architektur, Distribution, Arbeitsumgebung) mit denen aus der Konfigurationsdatei.

#### Einzelfilter

*   **`+` (Positiv):** Die Bedingung ist erfüllt, wenn der Variablenwert **übereinstimmt**.
    **Format:** `+<präfix>=<wert>`
    
    *   **Zeile:** `nginx +st=server`
    *   **Analyse:** `SYSTEM_TYPE` ist gleich "server". Die Bedingung ist erfüllt.
    *   **Ergebnis:** `nginx` wird installiert.

*   **Mehrere positive Filter mit gleichem Präfix:**
    Wirken als ODER-Bedingungen.
    **Format:** `+<präfix>=<wert1> +<präfix>=<wert2>`
    
    *   **Zeile:** `debug-tools +env=development +env=testing`
    *   **Analyse:** `ENVIRONMENT` ist "production", entspricht also weder "development" noch "testing". Die Bedingung ist nicht erfüllt.
    *   **Ergebnis:** `debug-tools` wird nicht installiert.

*   **`-` (Negativ):** Die Bedingung ist erfüllt, wenn der Variablenwert **nicht übereinstimmt**.
    **Format:** `-<präfix>=<wert>`

    *   **Zeile:** `monitoring-tools -st=desktop`
    *   **Analyse:** `SYSTEM_TYPE` ist "server", also nicht "desktop". Die Bedingung ist erfüllt.
    *   **Ergebnis:** `monitoring-tools` wird installiert.

*   **Mehrere negative Filter:**
    Das Paket wird ausgeschlossen, wenn EINE der Bedingungen zutrifft.
    **Format:** `-<präfix>=<wert1> -<präfix>=<wert2>`
    
    *   **Zeile:** `realtek-driver -d=trixie -d=sid`
    *   **Analyse:** `DISTRIBUTION` ist "bookworm", also weder "trixie" noch "sid". Die Ausschlussbedingungen greifen nicht.
    *   **Ergebnis:** `realtek-driver` wird installiert.

#### Gruppenfilter

*   **`+{a|b}` (ODER für Einschluss):** Wahr, wenn **mindestens eine** Bedingung in der Gruppe zutrifft.

    *   **Zeile:** `web-server +{st=server|st=web-server}`
    *   **Analyse:** `SYSTEM_TYPE` ist "server". Die erste Bedingung ist erfüllt, das reicht aus.
    *   **Ergebnis:** Das Paket wird installiert.

*   **`+{a&b}` (UND für Einschluss):** Wahr nur, wenn **alle** Bedingungen in der Gruppe erfüllt sind.

    *   **Zeile:** `database-tools +{d=bookworm&st=server}`
    *   **Analyse:** `DISTRIBUTION` ist "bookworm" (wahr) UND `SYSTEM_TYPE` ist "server" (wahr).
    *   **Ergebnis:** Das Paket wird installiert.

*   **`-{a|b}` (ODER für Ausschluss):** Das Paket wird ausgeschlossen, wenn **mindestens eine** Bedingung zutrifft.

    *   **Zeile:** `debug-tools -{env=production|st=minimal}`
    *   **Analyse:** `ENVIRONMENT` ist "production". Die erste Bedingung ist erfüllt, daher wird das Paket ausgeschlossen.
    *   **Ergebnis:** Das Paket wird nicht installiert.

*   **`-{a&b}` (UND für Ausschluss):** Das Paket wird nur ausgeschlossen, wenn **alle** Bedingungen zutreffen.

    *   **Zeile:** `development-tools -{env=production&st=minimal}`
    *   **Analyse:** `ENVIRONMENT` ist "production" (wahr), aber `SYSTEM_TYPE` ist nicht "minimal". Die zweite Bedingung ist falsch. Die Gruppe greift nicht für den Ausschluss.
    *   **Ergebnis:** Das Paket wird installiert (sofern keine weiteren Filter).

### Alternativen

Für dieselbe Funktionalität können je nach Bedingung verschiedene Pakete angeboten und installiert werden. Alternative Optionen werden durch den Operator `||` getrennt.

**Wichtig:** Jede Alternative muss eine vollständige Beschreibung enthalten – Paketname (mit optionaler Version und Release) und einen Filtersatz.

**Beispiel:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Wenn `SYSTEM_TYPE` `database-server` ist, wird **postgresql** ausgewählt.
- Wenn `SYSTEM_TYPE` `web-server` ist, wird **mysql-server** installiert.

### Logische Operatoren für Pakete

*   **`||` (ODER / Fallback):** Versucht, den linken Teil zu installieren. Falls dies fehlschlägt (Paket nicht gefunden oder gefiltert), wird der rechte Teil versucht.

    *   **Zeile:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Analyse:** `DISTRIBUTION` ist nicht "bookworm", der linke Teil wird gefiltert. CondinAPT geht zum rechten Teil über. `exfat-utils` hat keine Filter und wird installiert.
    *   **Ergebnis:** `exfat-utils` wird installiert.

*   **`&&` (UND / Verknüpfung):** Alle Teile müssen die Filterprüfung bestehen, um in die Warteschlange aufgenommen zu werden.

    *   **Zeile:** `nginx +st=web-server && php-fpm`
    *   **Analyse:** `SYSTEM_TYPE` ist "server", aber die Bedingung erfordert "web-server". Der linke Teil schlägt fehl.
    *   **Ergebnis:** Es werden keine Pakete installiert.

    *   **Komplexes Beispiel:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Ergebnis:** Alle drei Pakete werden nur installiert, wenn `ENVIRONMENT` `production` ist.

### Spezielle Modifikatoren

*   **`!` (Obligatorisches Paket):** Ist ein Paket mit `!` markiert, aber nicht in den Repositories auffindbar, bricht CondinAPT mit einem Fehler ab.

    *   **Zeile:** `!essential-package`

*   **`@` (Release-Angabe):** Installiert ein Paket aus einem bestimmten Debian/Ubuntu-Release (z. B. `bookworm-backports`).

    *   **Zeile:** `kernel-image-6.5.0 @trixie-backports`

### Paketspezifikation nach Version

Mit CondinAPT lässt sich die Version der zu installierenden Pakete präzise steuern.

*   **Syntax:**
    *   `package=VERSION`: Versucht, die angegebene Version (`VERSION`) zu installieren. Ist sie nicht in den Repositories verfügbar, wird eine beliebige verfügbare Version installiert.
        *   Beispiel: `my-app=1.2.3` (versucht 1.2.3 zu installieren, andernfalls z. B. 1.2.4)
    *   `package==VERSION`: **Strikte** Installation einer bestimmten Version. Ist diese Version nicht verfügbar, wird das Paket **nicht installiert**. Ist das Paket zusätzlich als obligatorisch (`!`) markiert, beendet das Skript mit Fehler.
        *   Beispiel: `another-app==2.0.0` (installiert nur 2.0.0, andernfalls wird das Paket übersprungen oder es gibt einen Fehler, falls obligatorisch)

*   **Verhalten:**
    1.  CondinAPT prüft zuerst, ob die geforderte Paketversion bereits installiert ist. Falls ja, gilt das Paket als installiert und wird übersprungen.
    2.  Danach wird geprüft, ob die Version in den Repositories verfügbar ist (`apt-cache madison`).
    3.  **Bei Verwendung von `=` (lockere Version):**
        *   Ist die Version nicht verfügbar, gibt CondinAPT eine Warnung aus, dass die exakte Version nicht gefunden wurde.
        *   Trotzdem wird versucht, eine beliebige verfügbare Version aus den Repositories zu installieren.
    4.  **Bei Verwendung von `==` (strikte Version):**
        *   Ist die Version nicht verfügbar, wird das Paket **nicht** installiert.
        *   Ist das Paket als obligatorisch (`!`) markiert, bricht das Skript mit Fehler ab.
    5.  **Version halten (`apt-mark hold`):**
        *   Wurde ein Paket mit der **exakten, angegebenen Version** erfolgreich installiert (also wenn `package==VERSION` erfolgreich war oder `package=VERSION` genau diese Version fand und installierte), setzt CondinAPT automatisch `apt-mark hold` für dieses Paket.
        *   Dadurch werden automatische Updates dieses Pakets bei späteren `apt upgrade`-Vorgängen verhindert.

### Komplexe Filterbeispiele

#### Beispiel 1: Komplexe Filter für ein einzelnes Paket

**Aufgabe:** Installiere `database-tools` für die Distribution `bookworm`, aber nur, wenn der Systemtyp `server` oder `database-server` ist und nicht für die Umgebung `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Analyse (mit unserer Konfiguration):**

1.  `+d=bookworm`: Wahr.
2.  `+{st=server|st=database-server}`: Wahr, da `SYSTEM_TYPE` "server" ist.
3.  `-env=minimal`: Wahr, da `ENVIRONMENT` "production" ist.
    **Ergebnis:** Alle Bedingungen sind erfüllt. Das Paket wird installiert.

#### Beispiel 2: Fallback-Kette mit unterschiedlichen Bedingungen

**Aufgabe:** Für Debian `trixie` soll `firefox-esr` installiert werden. Für `bookworm` wird `firefox` installiert. In allen anderen Fällen wird `w3m` installiert.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Analyse:**

1.  `firefox-esr +d=trixie`: Linker Teil. `DISTRIBUTION` ist "bookworm", Bedingung ist falsch.
2.  `firefox +d=bookworm`: Mittlerer Teil. `DISTRIBUTION` ist "bookworm", Bedingung ist erfüllt.
3.  Da der zweite Teil der `||`-Kette funktioniert, wird der dritte (`w3m`) ignoriert.
    **Ergebnis:** `firefox` wird installiert.

#### Beispiel 3: Zusammenspiel von Prioritätswarteschlange und obligatorischem Paket

**Aufgabe:** `dkms` ist kritisch für den Modulbau und muss zuerst installiert werden. In der Hauptliste ist es als obligatorisch markiert, aber mit Bedingung.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Analyse:**

1.  CondinAPT liest die Prioritätsmuster `^dkms$` und `^build-essential$`.
2.  Die Zeile `!dkms +pv=standard` passt auf das Muster `^dkms$` und wird mit allen Eigenschaften in die Prioritätswarteschlange verschoben: das Pflicht-Flag (`!`) und der Filter (`+pv=standard`).
3.  **Ablaufplan:**

    *   **Prioritätswarteschlange:** Installiere `!dkms +pv=standard` (Pflicht-Flag und Filter bleiben erhalten).
    *   **Normale Warteschlange:** `vim`.

**Ergebnis:** `dkms` wird zuerst installiert, aber der Filter `+pv=standard` wird weiterhin geprüft. Wird die Bedingung nicht erfüllt, schlägt die Installation wegen des `!`-Flags fehl.

## Installationswarteschlangen

Der `---`-Separator in einer eigenen Zeile teilt die Liste in Gruppen (Warteschlangen). Pakete aus einer Warteschlange werden gemeinsam in einem `apt`-Aufruf installiert. Die Warteschlangen werden strikt nacheinander abgearbeitet.

### Normale Warteschlangen

**Beispiel:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Zielwarteschlangen (mit Release-Angabe)

Pakete mit `@release` werden automatisch in separate Warteschlangen pro Release gruppiert:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Prioritätswarteschlange

Dieses Mechanismus dient der priorisierten Installation kritischer Pakete unter Beibehaltung ihrer Filter und Bedingungen.

*   **Prinzip:** Die mit dem `-P`-Schalter angegebene Datei enthält Regex-Muster (ein Muster pro Zeile, keine Filter). CondinAPT durchsucht alle Warteschlangen, findet Pakete, die auf diese Muster passen, und verschiebt sie (mit allen Filtern und Bedingungen) in eine spezielle "Prioritätswarteschlange", die zuerst abgearbeitet wird.
*   **Musterabgleich:** Verwendet Bash-Regex-Abgleich (`=~`-Operator). Muster können einfache Paketnamen oder komplexe Regex-Ausdrücke sein.
*   **Kontext erhalten:** Im Gegensatz zu einfachen Prioritätslisten bleiben bei diesem Mechanismus alle Paketbedingungen, Filter und Release-Angaben aus der ursprünglichen Paketliste erhalten.
*   **Überschreiben:** Gefundene Pakete werden automatisch aus ihren ursprünglichen Warteschlangen (sowohl regulär als auch Zielwarteschlangen mit `@release`) entfernt und in Prioritätswarteschlangen verschoben. Zielreleases werden in separaten Prioritäts-Zielwarteschlangen erhalten.

**Beispiel 1: Einfacher Paketnamenabgleich**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Analyse:**

    1.  CondinAPT liest `priority.list` und erkennt, dass Pakete, die auf die Muster `^gpg$` und `^git$` passen, zuerst installiert werden müssen.
    2.  Es durchsucht `packages.list` und findet die Zeile `git +st=full-server`. Da `git` passt, wird diese gesamte Zeile (mit Filter `+st=full-server`) in die Prioritätswarteschlange verschoben.
    3.  Ebenso wird `gpg -st=minimal` mit seinem Filter in die Prioritätswarteschlange übernommen.
    4.  **Endgültiger Plan:**

        *   **Prioritätswarteschlange:** Installiere `git +st=full-server` und `gpg -st=minimal` (Filter werden erhalten und geprüft).
        *   **Normale Warteschlange:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Beispiel 2: Regex-Musterabgleich**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Analyse:**

    1.  Muster `^linux-.*` passt auf `linux-image-6.1.0-amd64` und `linux-headers-6.1.0-amd64`.
    2.  Muster `^firmware-.*` passt auf `firmware-linux`.
    3.  **Endgültiger Plan:**

        *   **Prioritätswarteschlange:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Normale Warteschlange:** `build-essential`, `nginx +st=server`.

## Betriebsmodi und Debugging

#### Simulationsmodus (`-s`)

Ermöglicht, zu sehen, welche Pakete installiert würden, ohne sie tatsächlich zu installieren:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Beispielausgabe:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Hinweis:** Im Simulationsmodus beendet das Skript mit Exit-Code 1.

#### Prüfmodus (`-C`)

Überprüft, welche Pakete aus der Liste bereits auf dem System installiert sind:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Verhalten:**
- Zeigt Fehler für nicht installierte Pakete
- Gibt Exit-Code 1 zurück, wenn Pakete fehlen
- Gibt am Ende einen Befehl zum Nachinstallieren aus

#### Debugging-Modi

**Ausführliche Ausgabe (`-v`):**
- Zeigt detaillierte Informationen zu Filterprüfungen
- Zeigt Ergebnisse für jedes Paket

**Sehr ausführliche Ausgabe (`-vv`):**
- Maximale Prozessdetails
- Zeigt alle Zwischenschritte

**Kommandoverfolgung (`-x`):**
- Aktiviert `set -x` für Skript-Debugging
- Zeigt jeden ausgeführten Befehl

**Beispiel mit Debugging:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Erzwinge Cache-Update (`-f`)

Erzwingt, dass CondinAPT vor der Installation `apt update` ausführt:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Erweiterte Funktionen

### Array-Unterstützung in der Konfiguration

CondinAPT kann mit Array-Variablen in der Konfigurationsdatei arbeiten:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Spezialpakete

CondinAPT bietet integrierte Unterstützung für spezielle Pakete, die eine besondere Behandlung erfordern:

**Virtuelle Pakete:**
- `qemu-kvm` – wird als virtuelles Paket behandelt

**Behandlungsmechanismus:**
1. CondinAPT prüft mit `apt-cache show`, ob das Paket virtuell ist
2. Ist das Paket als "rein virtuell" markiert, gilt es als installierbar
3. Die Liste der Spezialpakete ist im Array `SPECIAL_PACKAGES` im Skript definiert:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Erweiterung der Liste:** Um neue Spezialpakete hinzuzufügen, muss das Array `SPECIAL_PACKAGES` im CondinAPT-Code angepasst werden.

## Fehlerbehandlung und Wiederherstellung

### Obligatorische Pakete (`!`)

Ist ein Paket als obligatorisch markiert, aber nicht in den Repositories auffindbar, führt CondinAPT folgende Schritte aus:
1. Gibt eine Fehlermeldung aus
2. Bricht die Ausführung ab (außer im Simulationsmodus)
3. Gibt Exit-Code 1 zurück

**Beispiel:**
```text
!essential-package +pv=standard
```

Wird `essential-package` nicht gefunden, wird die Ausführung abgebrochen.

### Umgang mit nicht verfügbaren Versionen

**Lockere Versionen (`=`):**
- Ist die exakte Version nicht verfügbar, wird eine beliebige verfügbare Version installiert
- Es wird eine Warnung zur Nichtverfügbarkeit der gewünschten Version ausgegeben

**Strikte Versionen (`==`):**
- Ist die exakte Version nicht verfügbar, wird das Paket übersprungen
- Ist das Paket obligatorisch (`!`), wird die Ausführung abgebrochen

### Version halten (`apt-mark hold`)

CondinAPT hält Paketversionen automatisch in folgenden Fällen fest:
- Wenn exakt die gewünschte Version installiert wurde
- Für Pakete mit `==VERSION`, falls die Version gefunden und installiert wurde
- Für Pakete mit `=VERSION`, falls genau diese Version gefunden und installiert wurde

## Integration mit Build-Systemen

### Verwendung in Automationsskripten

CondinAPT lässt sich einfach in Build-Systeme und Automationsskripte integrieren. Details zur Syntax der Paketdatei finden Sie im Abschnitt [Syntax der Paketliste](#package-list-file-syntax).

### Allgemeines Integrationsbeispiel:

**In einem Automationsskript (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Universelle Konfigurationsbeispiele

**Beispiel Filter-Mapping-Datei (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Beispielkonfiguration (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Beispiele aus der Praxis

### Beispiel 1: Multimedia-Server

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Beispiel 2: Webserver mit verschiedenen Konfigurationen

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Beispiel 3: Container-Plattform

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Beispiel 4: Erweiterte Filteranwendung

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Optimierungstipps

### Organisation von Paketlisten

1. **Gruppierung nach Funktionalität:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Verwendung von Warteschlangen für Abhängigkeiten:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Optimierung von Bedingungen:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Performance

- Verwenden Sie Prioritätswarteschlangen für kritische Pakete
- Minimieren Sie die Anzahl der Warteschlangen
- Fassen Sie zusammengehörige Pakete in einer Warteschlange zusammen
- Nutzen Sie APT-Caching für große Builds

## Fehlerbehebung

### Häufige Probleme

**Problem:** Paket wird trotz korrekter Bedingungen nicht installiert
**Lösung:** Mit dem `-vv`-Flag detaillierte Filterinformationen prüfen

**Problem:** CondinAPT bricht bei einem Pflichtpaket ab
**Lösung:** Paketverfügbarkeit in den Repositories prüfen oder Fallback nutzen. Siehe Abschnitt [Fehlerbehandlung und Wiederherstellung](#error-handling-and-recovery)

**Problem:** Unerwartetes Verhalten bei Paketversionen
**Lösung:** [Simulationsmodus](#operating-modes-and-debugging) (`-s`) zur Überprüfung verwenden

### Filter-Debugging

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Überprüfung der Paketverfügbarkeit

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
