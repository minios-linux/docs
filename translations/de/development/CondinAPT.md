---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT wählt APT-Pakete aus und installiert sie anhand einer Liste, deren Einträge von Bash-Konfigurationsvariablen abhängen können. MiniOS verwendet dies für Host-Voraussetzungsprüfungen, das Kernpaket-Set und gewöhnliche SquashFS-Module.

Diese Seite dokumentiert die Implementierung in `linux-live/condinapt`. CondinAPT ist kein allgemeiner Abhängigkeitslöser: Zuerst werden Filter und Repository-Verfügbarkeit ausgewertet, dann APT-Queues erstellt und schließlich jede ausgewählte Queue in einem `apt-get`-Aufruf installiert.

## Übersicht

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

Die Paketliste und die Konfiguration müssen reguläre, lesbare Dateien sein. Die Mapping- und Prioritätsdateien sind optional.

| Option | Bedeutung |
| --- | --- |
| `-l`, `--package-list PATH` | Paketlisten-Datei |
| `-c`, `--config PATH` | Vertrauenswürdige Bash-Konfiguration |
| `-m`, `--filter-mapping PATH` | Präfix-zu-Variable-Mapping |
| `-P`, `--priority-list PATH` | Bash-Reguläre Ausdrücke zur Prioritätsermittlung |
| `-s`, `--simulation` | Pakete auswählen und anzeigen, ohne sie zu installieren |
| `-C`, `--check-only` | Installierte Paketnamen prüfen, ohne Installation |
| `-v`, `--verbose` | Filter- und Queue-Diagnose |
| `-vv`, `--very-verbose` | Zusätzliche Prioritäts-Queue-Diagnose |
| `-x`, `--xtrace` | Shell-Tracing aktivieren |
| `-f`, `--force` | `apt-get update` auch ausführen, wenn `pkgcache.bin` existiert |
| `-h`, `--help` | Hilfe anzeigen |

CondinAPT führt `apt-get update` aus, wenn nicht im Check-only-Modus und entweder `-f` verwendet wurde oder `/var/cache/apt/pkgcache.bin` nicht existiert. Dies schließt die Simulation ein, daher ist `-s` kein nebenwirkungsfreier Probelauf.

Für eine normale Installation werden Root-Rechte benötigt. Check-only kann ohne erhöhte Rechte ausgeführt werden; Simulation benötigt ebenfalls Root, wenn ein APT-Update ausgelöst wird. Die aktuelle Implementierung gibt einen `apt-get update`-Fehler nicht zuverlässig weiter, daher sollte ein Update-Fehler als fehlgeschlagener Lauf behandelt werden, auch wenn CondinAPT später `0` zurückgibt.

## Eingabedateien

### Konfiguration

Die Datei `-c` wird mit Bash gesourced. Sie enthält ausführbaren Code und ist kein passives Datenformat. Verwenden Sie daher ausschließlich vertrauenswürdige Dateien.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Indizierte Arrays ermöglichen Filter nach Mitgliedschaft. Ein Skalar mit Kommas bleibt ein exakter String: `FEATURES="web,database"` entspricht nicht `+feat=web`.

Die aktuelle Implementierung parst CLI-Optionen, bevor diese Datei geladen wird.
Konfigurationsvariablen, die interne Namen von CondinAPT wiederverwenden, wie `VERBOSITY_LEVEL`, können daher den CLI-Zustand überschreiben. Vermeiden Sie solche Namen in generischen Konfigurationen.

### Filter-Mapping

Die optionale Datei `-m` ordnet kurze Präfixe Bash-Variablennamen zu:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Das Format ist exakt `prefix=VariableName`; umgebende Leerzeichen werden nicht entfernt. Leere Zeilen und Zeilen, deren erstes Feld mit `#` beginnt, werden ignoriert.
Doppelte Präfixe verwenden den letzten Wert.

Ohne Mapping-Eintrag wird das Präfix selbst als Variablenname verwendet. Ein nicht gesetzter Skalar verhält sich wie ein leerer String. Ein falsch geschriebenes Negativ-Filter kann daher stillschweigend ein Paket einschließen. Verwenden Sie daher bevorzugt ein Mapping und führen Sie beim Hinzufügen von Filtern eine ausführliche Simulation durch.

### Paketliste

Die sichere Zeilengrammatik lautet:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Beispiele:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Alles ab dem ersten `#` bis zum Zeilenende wird entfernt. Verbleibende Leerzeichen werden normalisiert. Es werden keine Anführungszeichen, Escaping, Klammern, verschachtelte Gruppen oder Leerzeichen innerhalb eines Filter-Tokens unterstützt. Unbekannte nachfolgende Tokens werden nicht abgelehnt, daher ist die obige Grammatik als Einschränkung zu verstehen und nicht als Einladung, sich auf permissives Parsen zu verlassen.

Verwenden Sie pro physischer Zeile genau ein Release-Target und platzieren Sie es am Ende. CondinAPT extrahiert das Target, bevor Paket-Alternativen ausgewertet werden. Daher können unterschiedliche `@release`-Werte nicht Alternativen auf derselben Zeile zugewiesen werden.

## Filter

Ein Filter vergleicht einen Konfigurationswert anhand exakter, groß-/kleinschreibungsabhängiger String-Gleichheit. Ist die zugeordnete Variable ein indiziertes Array, reicht die Übereinstimmung mit einem beliebigen Array-Element. Assoziative Arrays sind keine Mitgliedschaftssets.

| Form | Wirkung |
| --- | --- |
| `+x=value` | Nur einschließen, wenn `x` übereinstimmt |
| `-x=value` | Ausschließen, wenn `x` übereinstimmt |
| `+{a|b}` | Mindestens ein Mitglied muss übereinstimmen |
| `+{a&b}` | Jedes Mitglied muss übereinstimmen |
| `-{a|b}` | Ausschließen, wenn ein beliebiges Mitglied übereinstimmt |
| `-{a&b}` | Nur ausschließen, wenn alle Mitglieder übereinstimmen |

Wiederholte einfache positive Filter mit demselben Präfix sind Alternativen:

```text
audacity +pv=toolbox +pv=ultra
```

Positive Filter mit unterschiedlichen Präfixen müssen alle bestehen. Jeder einfache negative Filter ist ein unabhängiges Veto:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Mitglieder einer Gruppe dürfen nur einen Operator-Typ verwenden. Mischen Sie nicht `|` und `&` in einer Gruppe; es gibt keine Priorität oder Verschachtelung innerhalb von Gruppen. Drücken Sie „Flux ausschließen oder mindestens Xfce“ als zwei Filter aus:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternativen und Konjunktionen

`&&` hat eine höhere Priorität als `||`. CondinAPT trennt zuerst Alternativen und wertet dann jedes Mitglied einer Konjunktion aus, sodass:

```text
A || B && C
```

bedeutet `A || (B && C)`.

CondinAPT wählt die erste Alternative, deren Filter und Paketverfügbarkeitsprüfungen alle erfolgreich sind. Scheitert ein Mitglied einer Konjunktion, werden bereits ausgewählte Pakete aus dieser Konjunktion zurückgesetzt und die nächste Alternative geprüft.

Dies ist eine Vorauswahl, kein Installations-Retry oder Transaktion. Wenn der spätere Queue-Level-`apt-get install` für die gewählte Alternative fehlschlägt, kehrt CondinAPT nicht zu einem späteren `||`-Zweig zurück.

Jede Alternative muss ihre eigenen Filter wiederholen:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Obligatorische Pakete

`!` wird nur am Anfang des vollständigen physischen Ausdrucks erkannt und gilt für alle seine Alternativen:

```text
!preferred-package || fallback-package
```

Der Ausdruck ist im Normalmodus nur dann fatal, wenn keine Alternative erfolgreich ist und ein aktives Paket oder eine strikte Version nicht verfügbar ist. Filter können eine obligatorische Zeile ohne Fehler deaktivieren. Ein normaler APT-Installationsfehler bricht die zugehörige Queue unabhängig von `!` ab.

In der Simulation wird ein Fehler bei der Verfügbarkeit eines obligatorischen Pakets gemeldet, aber die Queue-Verarbeitung wird nicht gestoppt; die Simulation endet dennoch mit dem dokumentierten Nicht-Null-Status.

## Versionen

| Syntax | Verhalten |
| --- | --- |
| `package=VERSION` | Bevorzugt die exakte Version; fällt auf einen unversionierten Kandidaten zurück |
| `package==VERSION` | Akzeptiert nur die exakte Repository-Version |

Die exakte Verfügbarkeit wird mit dem vollständigen Versionsfeld aus `apt-cache madison` abgeglichen. Ist eine nicht-obligatorische strikte Version nicht verfügbar, schlägt diese Bedingung fehl; eine spätere `||`-Alternative kann dennoch erfolgreich sein, andernfalls wird die Zeile übersprungen. Stellen Sie dem Ausdruck `!` voran, um einen Fehler bei der aktiven Verfügbarkeit fatal zu machen.

Wenn CondinAPT die exakt angeforderte Version installiert, wird `apt-mark hold` nach Erfolg der gesamten APT-Queue geplant. Eine bereits installierte exakte Version gilt als erfüllt und wird nicht erneut gehalten. Fehler beim Halten werden nicht als Exit-Status von CondinAPT weitergegeben.

Bei einem unversionierten installierten Paket vergleicht CondinAPT die installierte Version mit dem Repository-Kandidaten. Weicht der Kandidat ab, wird erneut in die Queue aufgenommen; APT wird mit `--allow-downgrades` aufgerufen.

## Queues

`---` beendet die aktuelle normale Queue. Jedes ausgewählte Paket in einer Queue wird in einem nicht-interaktiven `apt-get install`-Aufruf mit `--force-confdef`, `--force-confold`, `--allow-downgrades` und `--no-install-suggests` übergeben.

```text
build-essential
pkg-config
---
application
```

Release-Target-Zeilen werden aus dem normalen Queue-Fluss entfernt und global nach Release gruppiert. Zeilen für dasselbe Release werden auch dann zusammengeführt, wenn sie durch `---` getrennt sind.
Die effektive Ausführungsreihenfolge ist:

1. Nicht-Target-Prioritätsqueue.
2. Prioritäts-Target-Release-Queues.
3. Normale Queues in Quellreihenfolge.
4. Verbleibende Target-Release-Queues in der Reihenfolge des ersten Auftretens.

Daher bildet eine Target-Zeile zwischen zwei normalen Zeilen keine Barriere, und Target-Queues laufen nach allen normalen Queues, sofern sie nicht als Prioritätsarbeit extrahiert wurden.

Repository-Verfügbarkeitsprüfungen im Voraus sind nicht Target-bewusst; nur der finale `apt-get install` erhält `-t RELEASE`. Überprüfen Sie Target-Pakete gegen die konfigurierten Repositories.

## Prioritätsliste

`-P` liest pro Zeile einen Bash-Extended-Regular-Expression. Ein Muster wird mit dem ersten Paketnamen jeder Paketlisten-Ausdruck verglichen. Bei Übereinstimmung wird der gesamte Ausdruck, inklusive Filter, Alternativen, obligatorischem Status und Release-Target, in eine Prioritätsqueue verschoben.

```text
^dkms$
^linux-.*
```

Muster sind unankert, sofern sie keine Anker enthalten. Das Matchen eines späteren `&&`- oder `||`-Pakets hat keine Auswirkung; nur das erste Paket-Token wird geprüft. Die Prioritäts-Extraktion führt auch Matches aus separaten normalen Queues zusammen, daher sollte sie nicht für Einträge verwendet werden, bei denen die ursprüngliche `---`-Grenze für das Dependency-Staging erforderlich ist.

Priorität bedeutet frühere Auswertung und Installation, aber keine garantierte Installation. Filter und Verfügbarkeitsprüfungen gelten weiterhin.

## Betriebsmodi und Exit-Status

### Simulation

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

Die Simulation wertet Filter, Versionen, Alternativen und Queues aus und gibt dann die Pakete aus, die an APT übergeben würden. Sie garantiert nicht, dass die spätere Installation erfolgreich wäre. Eine gültige Simulation beendet sich absichtlich mit Status `1`, auch wenn die Paketauswahl erfolgreich war.

### Nur-Prüfen

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

Nur-Prüfen wertet Filter und Operatoren aus, prüft aber nur, ob Paketnamen über `dpkg-query` installiert sind. Es prüft nicht die angeforderten Versionen, Repository-Kandidaten oder Release-Targets. Es gibt `0` zurück, wenn jeder aktive Ausdruck erfüllt ist, und `1` andernfalls.

Der ausgegebene `sudo apt install ...`-Befehl ist eine grobe Diagnose. Er verliert Versionen und Target-Releases, kann mehrere fehlgeschlagene Alternativen enthalten und reproduziert nicht garantiert den Originalausdruck.

### Statusübersicht

| Fall | Status |
| --- | --- |
| Hilfe | `0` |
| Erfolgreicher normaler Lauf | `0` |
| Ungültige Eingabe, Fehler bei obligatorischer Verfügbarkeit oder APT-Queue-Fehler | `1` |
| Gültige Simulation | `1` |
| Nur-Prüfen mit fehlenden aktiven Paketen | `1` |

## Spezielle Paketbehandlung

Die Implementierung kennt einen speziellen Paketnamen: `qemu-kvm`. Dieser wird akzeptiert, wenn `apt-cache show qemu-kvm` ihn als rein virtuell meldet. Andere virtuelle Pakete haben keine generische Provider-Auflösung. Verwenden Sie bei Portabilitätsanforderungen bevorzugt explizite Provider-Alternativen.

## MiniOS-Integration

### Modulaufruf

Für ein gewöhnliches Modul kopiert `build-modules` das Installationsskript nach `/install`, CondinAPT nach `/condinapt`, die generierte Konfiguration nach `/minios_build.conf` und das Mapping nach `/condinapt.map`. Ein konventionelles Installationsskript sieht so aus:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Verwenden Sie `SCRIPT_DIR`; `$CWD` ist nicht Teil des gewöhnlichen Modulvertrags.
`00-core` ist eine spezielle frühere Build-Stufe und ruft stattdessen die Quellbaum-Kopie unter `/linux-live` auf.

Der aktuelle Builder für gewöhnliche Module kopiert automatisch nur eine Datei namens `packages.list`. Module, die zusätzliche Listendateinamen verwenden, müssen diese Eingaben explizit bereitstellen; gehen Sie nicht davon aus, dass jede Datei neben `install` im Chroot-Root liegt.

### MiniOS-Filter-Mapping

`linux-live/condinapt.map` definiert aktuell:

| Präfix | Variable | Bedeutung |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Ziel-Suite |
| `da` | `DISTRIBUTION_ARCH` | Zielarchitektur |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` oder `ubuntu` Paketfamilie |
| `is` | `INIT_SYSTEM` | Ausgewähltes Init-System |
| `de` | `DESKTOP_ENVIRONMENT` | Modul-Umgebung |
| `pv` | `PACKAGE_VARIANT` | Paketvariante |
| `ik` | `INSTALL_KERNEL` | Kernel-Installationsumschalter |
| `kf` | `KERNEL_FLAVOUR` | Kernel-Flavour |
| `kp` | `KERNEL_PROVIDER` | `distribution` oder `minios` |
| `ks` | `KERNEL_SERIES` | Tatsächliche Kernel-Serie während `01-kernel` DKMS-Auswahl |
| `kc` | `KERNEL_CAPABILITIES` | Erkannte Capability-Array während `01-kernel` DKMS-Auswahl |
| `kbd` | `KERNEL_BUILD_DKMS` | DKMS-Build-Umschalter |
| `ib` | `INITRAMFS_BUILDER` | Initramfs-Implementierung |
| `lo` | `LOCALE` | System-Locale |
| `ml` | `MULTILINGUAL` | Mehrsprachigkeitsumschalter |
| `kl` | `KEEP_LOCALES` | Locale-Beibehaltungsumschalter |

`ks` und `kc` sind spezielle `01-kernel`-Filter. Wenn DKMS-Build aktiviert ist, erkennt das Modul `KERNEL_SERIES` vom installierten Kernel und erstellt das indizierte `KERNEL_CAPABILITIES`-Array in einer temporären Konfiguration, die für die DKMS-Paketauswahl verwendet wird. Sie sind in gewöhnlichen Modulkonfigurationen nicht vorhanden; deren Verwendung dort lässt positive Filter fehlschlagen und kann negative Filter passieren lassen.
`KERNEL_SERIES` ist nicht die `MINIOS_KERNEL_SERIES`-Präferenz. Aktuell erkannte Fähigkeiten umfassen `aufs`, `ntfs3`, `btf_modules` und unterstützte In-Tree-`rtw88_*`-Treiber.

Beispiele aus der aktuellen Kernel-Paketliste:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Fehlerbehebung

Verwenden Sie eine ausführliche Simulation, um die Auswahl zu prüfen:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Verwenden Sie nicht `/dev/stdin`; `-l` erfordert eine reguläre Datei.

- Wenn ein Filter unerwartet zutrifft, prüfen Sie das exakte Präfix-Mapping, den Variablentyp, die Groß-/Kleinschreibung und den Wert. Überprüfen Sie, ob eine Variable nicht gesetzt oder falsch geschrieben ist.
- Wenn ein Fallback nicht ausgewählt wird, beachten Sie, dass das Fallback während der Vorauswahl und nicht nach einem Queue-Level-APT-Fehler erfolgt.
- Wenn ein Target-Paket fehlschlägt, prüfen Sie die konfigurierten Quellen und führen Sie `apt-cache policy PACKAGE` aus; die Vorauswahl berücksichtigt `-t RELEASE` nicht.
- Wenn eine strikte Version übersprungen wird, vergleichen Sie das exakte Versionsfeld mit `apt-cache madison PACKAGE`.
- Wenn die Queue-Reihenfolge überrascht, berücksichtigen Sie die globale Target-Gruppierung und Prioritäts-Extraktion vor den normalen Queues.

Für den weiteren Build-Workflow siehe [Building MiniOS](/development/Building-MiniOS).
