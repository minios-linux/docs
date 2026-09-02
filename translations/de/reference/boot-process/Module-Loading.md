---
updated: 2026-08-28
---

# Modul-Ladevorgang

Diese Seite erklärt, was die Boot-Parameter `load`, `noload`, `bext`, `union` und `toram=trim` bewirken. Dies sind erweiterte Steuerungsmöglichkeiten. Ein normaler Systemstart lädt automatisch das von dem gewählten MiniOS-Abbild bereitgestellte Modulpaket.

MiniOS wählt und mountet sein Modulpaket im initrd, bevor das Union-Root an das installierte Init-System übergeben wird. Verwenden Sie diese Seite, wenn ein Modul vom Boot-Medium im laufenden System nicht erscheint oder wenn ein Filter den Startvorgang unerwartet beeinflusst.

## Einfach erklärt

MiniOS wird aus nummerierten, schreibgeschützten `.sb`-Modulen zusammengesetzt. Niedrigere Nummern werden zuerst geladen; höhere Nummern können Dateien aus Modulen mit niedrigeren Nummern ersetzen. Eine schreibbare Sitzung, sofern aktiv, liegt über allen schreibgeschützten Modulen.

Die Parameter `load=` und `noload=` filtern Modulpfade vor der Zusammenstellung. Sie verwenden reguläre Ausdrücke anstelle einer sicheren Liste mit exakten Namen, sodass ein zu breit gefasster Filter wichtige Kern- oder Kernelmodule aus dem Boot-Set ausschließen kann.

## Parameter erklärt

| Parameter | Was es MiniOS mitteilt | Hauptrisiko |
|---|---|---|
| `load=PATTERN` | Nur Modulkandidaten behalten, deren Pfade dem Muster entsprechen. | Ein unvollständiges Muster kann benötigte Module ausschließen. |
| `noload=PATTERN` | Passende Kandidaten nach Anwendung von `load=` ausschließen. | Benötigte Kern-, Kernel-, Firmware- oder Desktop-Module können beim Start fehlen. |
| `bext=EXTENSION` | Eine weitere Dateiendung als Modulkandidatensuffix behandeln. | Wandelt keine Dateien um und koordiniert Kernel-Module nicht vollständig. |
| `union=aufs` oder `union=overlayfs` | Das Dateisystem anfordern, das zur Kombination der Module mit der schreibbaren Ebene verwendet wird. | Die Laufzeitaktivierung von Modulen unterscheidet sich zwischen AUFS und OverlayFS. |
| `toram=trim` | Nur ausgewählte Module und begrenzte erforderliche Daten nach RAM kopieren. | Ausgelassene Module und Verzeichnisse stehen nach der Trennung der Quelle nicht mehr zur Verfügung. |

Bevor Sie Filter ändern, notieren Sie die aktuelle Befehlszeile und das Modulpaket. Testen Sie immer nur eine Änderung und halten Sie einen bekannten, funktionierenden Boot-Eintrag bereit.

## Kandidaten-Tiers

Nachdem das MiniOS-Datenverzeichnis gefunden wurde, wird normalerweise `minios/` die Initrd-Umgebung die Modulkandidaten in folgender Reihenfolge durchsuchen:

1. Einträge direkt im Verzeichnis `minios/`. Dieser Scan ist nicht rekursiv.
2. Einträge rekursiv unterhalb von `minios/modules/`.
3. Einträge rekursiv unterhalb von `minios/modules/` auf der von Initrd erkannten beschreibbaren Persistenzquelle.

Die dritte Stufe ist getrennt vom Verzeichnis `minios/modules/` im ausgewählten schreibgeschützten Datenbaum. Sie ermöglicht es, dauerhafte Benutzermodule zu verwenden, um Dateien von einem ISO-Image oder einer anderen schreibgeschützten Quelle zu überschreiben. Diese Option steht nur zur Verfügung, wenn die Persistenz-Erkennung ein beschreibbares Root mit diesem Verzeichnis bereitgestellt hat.

Kandidatenpfade werden beim Einbinden auf ihren exakten Basenamen reduziert. Zum Beispiel verwenden `modules/work/50-extra.sb` und `modules/test/50-extra.sb` beide den Mountpoint mit dem Namen `50-extra.sb`. Sie werden nicht zu zwei unabhängig adressierbaren Layern. Ein Kandidat in einer späteren Stufe mit demselben Basenamen wird auf demselben Mountpoint eingebunden und ersetzt den vorherigen Kandidaten, der für die Union-Assembly sichtbar war.
Der gleiche Basename sollte daher als ein Ersetzungs-Slot betrachtet werden und nicht als Möglichkeit, mehrere Module aus verschiedenen Verzeichnissen zu laden.

Das übliche Modulformat ist ein reguläres SquashFS-Dateisystem-Image. Der Initrd-Scan selbst ist dateinamenbasiert: Es werden Pfade mit der konfigurierten Dateiendung ausgewählt, ohne vorher zu prüfen, ob es sich um eine reguläre Datei oder ein gültiges SquashFS handelt. Bei rekursiven Scans kann daher auch ein anderes Dateisystemobjekt mit passendem Namen gefunden werden. Ein fehlgeschlagener Loop- oder SquashFS-Mount wird von `mount` gemeldet, aber der betreffende Kandidat führt nicht automatisch zu einem kritischen Fehler, sodass der Bootvorgang mit einer fehlenden Schicht fortgesetzt werden kann. Überprüfen Sie fragwürdige Dateien mit dem Ablauf in [Module inspizieren und extrahieren](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Reihenfolge und Priorität

Innerhalb der Erkennung werden Pfade numerisch nach Basename sortiert. Die führende Zahl in Namen wie `00-core.sb`, `01-kernel-VERSION.sb` und `50-extra.sb` bestimmt die Modulreihenfolge. Ein Basename ohne führende Zahl wird numerisch als Null eingeordnet.
Verwenden Sie explizite, unterschiedliche numerische Präfixe anstatt sich auf die Sortierung bei Gleichstand zu verlassen.

Die finale Union gibt späteren, höher nummerierten Modulen Vorrang vor früheren, niedriger nummerierten Modulen. Wenn zwei ausgewählte Module denselben root-relativen Pfad enthalten, ist die Datei aus dem Modul mit der höheren Priorität sichtbar. Die schreibbare Änderungsebene hat Vorrang vor allen schreibgeschützten Modulen.

Der Ebenenersatz erfolgt vor dieser effektiven Modulreihenfolge. Ein `50-extra.sb` aus einer späteren Ebene ersetzt eine Datei aus einer früheren Ebene mit genau diesem Basenamen, dann bestimmt sein `50`-Präfix, wo dieser verbleibende Mount in die Union gehört.

## Bundle-Erweiterung

Der Boot-Parameter `bext=` wählt die Dateiendung, die für die Datenerkennung, Kandidatenfilterung und das Mounten von Modulen verwendet wird. Standardmäßig ist dies `sb`, daher ist das übliche Kandidatensuffix `.sb`:

```text
bext=sb
```

Das Ändern von `bext` ändert nur das gewählte Dateisuffix; es konvertiert keine Datei und prüft nicht das Dateisystemformat. Die Kernel-Koordination ist eine Ausnahme: Sie sucht immer nach `01-kernel-VERSION.sb`. Mit einer benutzerdefinierten Erweiterung werden diese `.sb`-Kernelmodule vom normalen Kandidatenscan nicht ausgewählt.

## Load- und Noload-Filter

`load=` und `noload=` sind nicht verankerte, erweiterte reguläre Ausdrücke, die auf die von jeder Ebene erzeugten Kandidatenpfad-Strings angewendet werden. Es handelt sich nicht um exakte Namenslisten. Ein einfacher Wert wie `kernel` passt an jeder Stelle im Pfad, während Anker explizit angegeben werden müssen, wenn eine genaue Position erforderlich ist.
Pfade unterscheiden sich je nach Ebene: Top-Level-Kandidaten sind Basenames, rekursive Datenkandidaten enthalten `modules/`, und Persistenzkandidaten sind absolute Pfade.

Kommas werden in reguläre Ausdrucks-Alternativen umgewandelt. Zum Beispiel:

```text
load=core,kernel,firmware
```

wird als `core|kernel|firmware` ausgewertet. Andere reguläre Ausdruckszeichen werden nicht maskiert.

Ein numerischer Bereich wird nur dann erweitert, wenn der gesamte Filter ein aufsteigender Bereich ist, der `^[0-9]+-[0-9]+$` entspricht. Zum Beispiel wird aus `load=04-06` die Alternative `04|05|06`, wobei jeder erzeugte Wert auf mindestens zwei Ziffern aufgefüllt wird. Ein Bereich, der in einer Kommaliste oder einem anderen Ausdruck eingebettet ist, wird nicht erweitert und behält seine normale ERE-Bedeutung.

Wenn beide Parameter vorhanden sind, wendet das initrd zuerst `load=` an und entfernt dann Übereinstimmungen mit `noload=`. Somit gewinnt `noload=`. Es gibt kein geschütztes Kern- oder Kernelmodul-Set: Filter können `00-core`, das koordinierte `01-kernel` oder jeden anderen Kandidaten ausschließen. Eine solche Auswahl kann ein unvollständiges Root erzeugen oder den Bootvorgang verhindern.

## Laufende Kernel-Koordination

Die laufende Kernel-Version wird von einem `vmlinuz-VERSION`-Token auf der Kernel-Befehlszeile übernommen, sofern verfügbar, mit `uname -r` als Fallback. Vor dem Mounten der Module koordiniert das initrd dieses Top-Level-Triplet:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Fehlt ein Mitglied, sucht das initrd nach allen drei Dateien in:

```text
minios/kernels/VERSION/
```

Wenn das Repository-Triplet vollständig ist, kopiert es das Modul nach `minios/` und die Bootdateien nach `minios/boot/`. Ein teilweiser Kopiervorgang wird bereinigt. Ist das Triplet nicht vollständig, gibt die Kernel-Einrichtung einen Fehler zurück, aber der Aufrufer fährt mit der normalen Modul-Mount-Phase fort. Das resultierende System kann später dennoch fehlschlagen, weil dem Root-Dateisystem die Support-Dateien für den laufenden Kernel fehlen.

Andere Top-Level-Dateien, die `01-kernel-*.sb` entsprechen, werden als inaktiv behandelt. Das initrd versucht, jedes inaktive Modul und die zugehörigen `vmlinuz`- und `initrfs`-Dateien nach `minios/kernels/VERSION/` zu verschieben. Diese Fallback- und Verschiebeoperationen im Repository erfordern einen schreibbaren Datenbaum; einzelne Verschiebefehler sind nicht fatal. Sie verwenden immer `.sb`, unabhängig von `bext=`. Siehe [Kernel-Verwaltung](/preparing-and-customizing/Managing-Kernels) für unterstützte Kernel-Installations- und Aktivierungs-Workflows.

## Union-Konstruktion

MiniOS wählt `AUFS`, wenn der laufende Kernel dies unterstützt, und verwendet andernfalls OverlayFS. `union=overlayfs` wählt OverlayFS. `union=aufs` fordert `AUFS` an, fällt aber auf OverlayFS zurück, falls `AUFS` nicht verfügbar ist.

Mit `AUFS` mountet das initrd zunächst eine leere Union mit dem beschreibbaren Changes-Branch und fügt dann jedes eingehängte Modul als schreibgeschützten Branch hinzu. Ein Fehler beim Erstellen der Union ist fatal. Ein Fehler beim Hinzufügen eines einzelnen `AUFS`-Branches wird nach bestem Bemühen behandelt: Der Bootvorgang wird mit den bereits hinzugefügten Branches fortgesetzt, während MiniOS die Persistenz für eine unvollständige Union nicht als aktiv markiert.

Mit OverlayFS wird die vollständige Modulliste beim Mounten der Union als eine umgekehrte `lowerdir`-Liste übergeben. Die beschreibbare Ebene stellt ihr `upperdir` und `workdir` bereit. Ein Fehler beim Mounten dieser Union ist fatal. Die Reihenfolge von links nach rechts der unteren Ebenen und die `AUFS`-Einfüge-Reihenfolge setzen beide dieselbe Regel um: Spätere, höher nummerierte Module überdecken widersprüchliche Pfade früherer Module.

Diese Komposition zur Bootzeit unterscheidet sich von der Aktivierung zur Laufzeit. Nach dem Start können `sb activate` und `sb deactivate` nur ein Root verändern, das aktuell als `AUFS` eingehängt ist. OverlayFS-Untere Ebenen können nicht im laufenden Betrieb geändert werden. Die Aktivierung zur Laufzeit beeinflusst die Auswahl für den nächsten Bootvorgang nicht, und das Hinzufügen eines Next Boot-Moduls aktiviert dieses nicht im aktuellen Root. Siehe [MiniOS Modulmanager](/preparing-and-customizing/Managing-Modules).

## Toram-Trim

`toram=trim` erstellt einen RAM-Datenbaum vor Persistenz und Kernel-Koordination.
Es kopiert genau diese Elemente aus dem gewählten MiniOS-Datenbaum:

- `config.conf`, der für diesen Kopierpfad erforderlich ist.
- `authorized_keys`, sofern als reguläre Datei vorhanden.
- Top-Level-Kandidaten mit passender Erweiterung, ausgewählt durch `load=` und `noload=`.
- Ausgewählte Kandidaten mit passender Erweiterung rekursiv unterhalb von `modules/`, wobei ihre relativen Verzeichnisse erhalten bleiben.
- Den vollständigen `changes/`-Baum, wenn die Befehlszeile Persistenz anfordert.

Es werden keine `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Logs, andere Nichtmoduldaten, nicht ausgewählte Module oder die separate schreibbare Persistenzmodul-Ebene kopiert. Insbesondere kann das Repository-Fallback kein `kernels/`-Verzeichnis verwenden, das im getrimmten RAM-Baum fehlt. Das kopierte Modulpaket wird gefiltert, bevor die Persistenzmodul-Ebene erkannt wird.

Es gibt keinen RAM-Kapazitäts-Preflight. Ein Fehler beim Kopieren von `config.conf` oder angeforderten `changes/` beendet den Ausführungskontext der Kopierfunktion, aber deren Aufrufer wandeln diesen Status nicht zuverlässig in einen sauberen Boot-Abbruch um. Ein Fehler beim Kopieren von `authorized_keys` wird gemeldet, führt aber nicht zum Abbruch des Kopiervorgangs. Ausgewählte Module werden per Pipeline kopiert; ein Fehler beim Kopieren eines einzelnen Moduls wird gemeldet, aber sein Status wird nicht zuverlässig nach außen weitergegeben, um den Bootpfad zu stoppen. Es gibt kein transaktionales Rollback eines teilweise befüllten RAM-Baums.

Nach dem Kopieren versucht das initrd, das Quell-Mount zu unmounten, dessen alten Datenpfad zu entfernen und den RAM-Baum an diesen Pfad zu verschieben. Nur der Erfolg dieser gesamten Kette markiert die Quelle als getrennt. Scheitert die Kette, wird der Bootvorgang mit dem RAM-Staging-Pfad fortgesetzt. Verwandte ISO- und Ventoy-Trennoperationen werden bestmöglich durchgeführt.
Daher ist `toram=trim` kein Beweis dafür, dass das Boot-Gerät entfernt werden kann. Ziehen Sie es nur ab, wenn Diagnosen bestätigen, dass sein Dateisystem, Loop-Device und Device-Mapper-Zuordnungen nicht mehr gemountet oder in Benutzung sind.

## Rootcopy und Root-Übergabe

Nach dem Mounten der Module und dem Aufbau der Union kopiert das initrd den sichtbaren Inhalt von `minios/rootcopy/` direkt in die zusammengesetzte Union. Das Shell-Glob `*` schließt Einträge mit Punkt-Präfix direkt in `rootcopy/` aus, wobei versteckte Dateien in einem kopierten Verzeichnis weiterhin Teil dieses Verzeichnisses bleiben. Dies ist ein Kopiervorgang in die schreibbare Ansicht, keine weitere schreibgeschützte Modulebene, sodass damit Pfade überschrieben werden können, die durch Module bereitgestellt werden. Kopierfehler werden durch diese Funktion nicht als fatal behandelt.

MiniOS führt dann seine frühe Einrichtung durch, schreibt das neue Root-`fstab` und sourced `rootcopy/run/preinit.sh`, sofern vorhanden, wobei der Union-Pfad als erstes Argument übergeben wird. Dieses Skript läuft in der initrd-Umgebung vor der Root-Übergabe und muss als privilegierter Boot-Code behandelt werden.

Am finalen Übergabepunkt schwenkt das LiveKit-initrd die zusammengesetzte Union nach `/`, behält das alte initrd unter `/run/initramfs` für Shutdown-Aufgaben und führt das neue Root-`init` aus. Der Dracut-Pfad bereitet die gleiche Union vor und überlässt Dracut die finale `switch_root`. Nach Überschreiten dieser Grenze läuft der normale Systemstart im zusammengesetzten Root; Änderungen an Dateien auf dem Boot-Medium bauen das gewählte untere Ebenenset für diesen Boot nicht mehr neu auf.

## Sichere Diagnose

Bevorzugen Sie eine schreibgeschützte Inspektion und notieren Sie die ursprüngliche Befehlszeile, bevor Sie Filter ändern:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` zeigt die aktuelle regelbasierte Auswahl, während `sb list` die tatsächlich das laufende Root zusammensetzenden Ebenen anzeigt. Ein Unterschied kann auf einen Mount-Fehler, Basename-Ersatz, eine `AUFS`-Änderung zur Laufzeit oder eine Auswahlquelle hinweisen, die sich nach dem Booten geändert hat.

Für einen frühen Fehler fügen Sie `debug` hinzu, um Shell-Tracing zu aktivieren, `timing` für Phasen-Timings oder `rd.break`, um nach dem initrd-Setup und vor der finalen Root-Übergabe eine Shell zu öffnen. Untersuchen Sie in dieser Shell `/memory/data`, `/memory/bundles`, Mounts und `/proc/cmdline`; reparieren Sie keine Dateisysteme und entfernen Sie keine Medien, solange sie gemountet sind. Erfassen Sie den ersten Mount- oder Kopierfehler, nicht nur das spätere Symptom. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting) für einen umfassenderen sicheren Diagnose-Workflow.

## Verwandte Dokumentation

- [Boot-Modi](/using-minios/Boot-Modes)
- [Systemerkennung](/reference/boot-process/System-Discovery)
- [Persistenz](/reference/boot-process/Persistence-Internals)
- [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules)
- [Module erstellen](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Kernel-Verwaltung](/preparing-and-customizing/Managing-Kernels)
- [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting)
