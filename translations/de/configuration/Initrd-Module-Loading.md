---
updated: 2026-08-26
---

# Initrd-Modulladen

MiniOS wählt und mountet seinen Modulsatz im Initrd, bevor das Union-Root an das installierte Init-System übergeben wird. Diese Seite beschreibt das aktuelle Verhalten des Initrd. Dies ist hilfreich, wenn ein auf dem Boot-Medium angezeigtes Modul nicht in `noload=`, `bext=` oder `toram=trim` erscheint oder ein Bootvorgang unerwartet verändert wird.

## Kandidaten-Tiers

Nachdem das MiniOS-Datenverzeichnis gefunden wurde, normalerweise `minios/`, durchsucht das Initrd die Modulkandidaten in folgender Reihenfolge:

1. Einträge direkt innerhalb von `minios/`. Diese Suche ist nicht rekursiv.
2. Einträge rekursiv unterhalb von `minios/modules/`.
3. Einträge rekursiv unterhalb von `minios/modules/` auf der beschreibbaren Persistenzquelle, die vom Initrd erfasst wurde.

Die dritte Ebene ist getrennt vom `minios/modules/`-Verzeichnis im ausgewählten, schreibgeschützten Datenbaum. Sie ermöglicht es, dauerhafte Benutzermodule zu verwenden, um Dateien von einem ISO oder einer anderen schreibgeschützten Quelle zu überschreiben. Sie ist nur verfügbar, wenn die Persistenz-Erkennung eine beschreibbare Root mit diesem Verzeichnis veröffentlicht hat.

Kandidatenpfade werden beim Mounten auf ihren exakten Basenamen reduziert. Zum Beispiel verwenden `modules/work/50-extra.sb` und `modules/test/50-extra.sb` beide den Mountpoint namens `50-extra.sb`. Sie werden nicht zu zwei unabhängig adressierbaren Layern. Ein Kandidat in einer späteren Ebene mit demselben Basenamen wird auf demselben Mountpoint gemountet und ersetzt den früheren Kandidaten, der für die Union-Assembly sichtbar war. Derselbe Basename sollte daher als ein Ersatz-Slot behandelt werden und nicht als Möglichkeit, mehrere Module aus verschiedenen Verzeichnissen zu laden.

Das normale Modulformat ist ein reguläres SquashFS-Dateisystem-Image. Der Initrd-Scan selbst ist dateinamengesteuert: Er wählt Pfade aus, die mit der konfigurierten Erweiterung enden, und prüft nicht zuerst, ob jeder Pfad eine reguläre Datei oder ein gültiges SquashFS ist. Rekursive Scans können daher auf andere Arten von Dateisystemobjekten mit passendem Namen stoßen. Ein fehlgeschlagener Loop- oder SquashFS-Mount wird von `mount` gemeldet, aber der Kandidaten-Loop macht diesen Fehler nicht von sich aus fatal und der Bootvorgang kann mit einer fehlenden Ebene fortgesetzt werden. Überprüfen Sie fragwürdige Dateien mit dem Inspektions-Workflow unter [Creating modules](/development/Creating-Modules.md).

## Reihenfolge und Priorität

Innerhalb der Erkennung werden Pfade numerisch nach Basename sortiert. Die führende Zahl in Namen wie `00-core.sb`, `01-kernel-VERSION.sb` und `50-extra.sb` bestimmt die Modulreihenfolge. Ein Basename ohne führende Zahl wird numerisch als Null sortiert. Verwenden Sie explizite, unterschiedliche numerische Präfixe, anstatt sich auf die Reihenfolge bei Gleichstand zu verlassen.

Die finale Union gibt späteren, höher nummerierten Modulen Vorrang vor früheren, niedriger nummerierten Modulen. Wenn zwei ausgewählte Module denselben root-relativen Pfad enthalten, ist die Datei aus dem höher priorisierten Modul sichtbar. Die beschreibbare Changes-Layer hat Vorrang vor allen schreibgeschützten Modulen.

Der Tier-Ersatz erfolgt vor dieser effektiven Modulreihenfolge. Ein späterer `50-extra.sb` ersetzt eine frühere Datei mit genau diesem Basenamen, dann bestimmt das `50`-Präfix, wo dieser verbleibende Mount in die Union gehört.

## Bundle-Erweiterung

Der Boot-Parameter `bext=` wählt die Dateierweiterung, die für die Datenerkennung, Kandidatenfilterung und das Mounten von Modulen verwendet wird. Standardmäßig ist dies `sb`, daher ist das übliche Kandidaten-Suffix `.sb`:

```text
bext=sb
```

Eine Änderung von `bext` ändert das ausgewählte Dateisuffix; sie konvertiert keine Datei und prüft auch nicht deren Dateisystemformat. Die Koordination mit dem Kernel ist eine bewusste aktuelle Einschränkung: Es werden weiterhin wörtliche `.sb`-Namen für `01-kernel-VERSION.sb` verwendet. Ein benutzerdefiniertes `bext` benennt daher keine Dateien um und koordiniert auch nicht, dass ein Scan nach Kandidaten ohne `sb` diese nicht auswählt.

## Load- und Noload-Filter

`load=` und `noload=` sind nicht verankerte, erweiterte reguläre Ausdrücke, die auf die von jeder Ebene erzeugten Kandidatenpfad-Strings angewendet werden. Es handelt sich nicht um exakte Namenslisten. Ein einfacher Wert wie `kernel` trifft diesen Text überall im Pfad, während Anker explizit angegeben werden müssen, wenn eine genaue Position erforderlich ist. Pfade unterscheiden sich je nach Ebene: Top-Level-Kandidaten sind Basenames, rekursive Datenkandidaten enthalten `modules/`, und Persistenzkandidaten sind absolute Pfade.

Kommas werden in reguläre Ausdrucks-Alternativen umgewandelt. Zum Beispiel:

```text
load=core,kernel,firmware
```

wird als `core|kernel|firmware` ausgewertet. Andere reguläre Ausdruckszeichen werden nicht escaped.

Ein numerischer Bereich wird nur dann erweitert, wenn der gesamte Filter ein aufsteigender Bereich ist, der `^[0-9]+-[0-9]+$` entspricht. Zum Beispiel wird aus `load=04-06` die Alternativen `04|05|06`, wobei jeder generierte Wert auf mindestens zwei Stellen aufgefüllt wird. Ein Bereich, der in einer Kommaliste oder einem anderen Ausdruck eingebettet ist, wird nicht erweitert und behält seine normale ERE-Bedeutung.

Wenn beide Parameter vorhanden sind, wendet das Initrd zuerst `load=` an und entfernt dann Übereinstimmungen mit `noload=`. Somit gewinnt `noload=`. Es gibt keinen geschützten Kern- oder Kernelmodulsatz: Filter können `00-core`, das koordinierte `01-kernel` oder jeden anderen Kandidaten ausschließen. Eine solche Auswahl kann ein unvollständiges Root erzeugen oder den Bootvorgang verhindern.

## Laufende Kernel-Koordination

Die laufende Kernel-Version wird aus einem `vmlinuz-VERSION`-Token auf der Kernel-Befehlszeile entnommen, sofern verfügbar, mit `uname -r` als Fallback. Vor dem Mounten der Module koordiniert das Initrd dieses Top-Level-Triplet:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Fehlt ein Mitglied, sucht das Initrd nach allen drei Dateien in:

```text
minios/kernels/VERSION/
```

Wenn das Repository-Triplet vollständig ist, kopiert es das Modul nach `minios/` und die Boot-Dateien nach `minios/boot/`. Ein unvollständiger Kopiervorgang wird bereinigt. Ist das Triplet nicht vollständig, gibt das Kernel-Setup einen Fehler zurück, aber der Aufrufer fährt mit der normalen Modul-Mount-Phase fort; das resultierende System kann später dennoch fehlschlagen, weil die Userspace-Module des laufenden Kernels fehlen.

Andere Top-Level-Dateien, die `01-kernel-*.sb` entsprechen, werden als inaktiv behandelt. Das Initrd versucht, jedes inaktive Modul und die passenden `vmlinuz`- und `initrfs`-Dateien nach `minios/kernels/VERSION/` zu verschieben. Diese Repository-Fallback- und Verschiebeoperationen erfordern einen beschreibbaren Datenbaum; einzelne Verschiebefehler sind nicht fatal. Sie verwenden immer `.sb`, unabhängig von `bext=`. Siehe [Kernel management](/administration/Kernel-Management.md) für unterstützte Kernel-Installations- und Aktivierungs-Workflows.

## Union-Konstruktion

MiniOS wählt `AUFS`, wenn der laufende Kernel dies unterstützt, und verwendet andernfalls OverlayFS. `union=overlayfs` wählt OverlayFS. `union=aufs` fordert `AUFS` an, fällt jedoch auf OverlayFS zurück, falls `AUFS` nicht verfügbar ist.

Mit `AUFS` mountet das initrd zunächst eine leere Union mit dem beschreibbaren Changes-Branch und fügt dann jedes gemountete Modul als Read-only-Branch hinzu. Ein Fehler beim Erstellen der Union ist fatal. Ein Fehler beim Hinzufügen eines einzelnen `AUFS`-Branches wird nach dem Best-Effort-Prinzip behandelt: Der Bootvorgang wird mit den bereits hinzugefügten Branches fortgesetzt, während die Persistenz-Autorität für eine unvollständige Union nicht veröffentlicht wird.

Bei OverlayFS wird das vollständige Modul-Set als eine umgekehrte `lowerdir`-Liste beim Mounten der Union übergeben. Die beschreibbare Ebene liefert ihr `upperdir` und `workdir`. Ein Fehler beim Mounten dieser Union ist fatal. Die links-nach-rechts Reihenfolge der unteren Ebenen und die `AUFS`-Einfüge-Reihenfolge setzen beide die gleiche Regel um: Spätere, höher nummerierte Module überdecken bei Konflikten die Pfade früherer Module.

Diese Komposition zur Bootzeit unterscheidet sich von der Aktivierung zur Laufzeit. Nach dem Start können `sb activate` und `sb deactivate` nur ein aktuell als `AUFS` gemountetes Root verändern. OverlayFS-Lower-Layer können nicht im laufenden Betrieb geändert werden. Die Aktivierung zur Laufzeit verändert nicht die Auswahl für den nächsten Boot, und das Hinzufügen eines Next Boot-Moduls aktiviert dieses nicht im aktuellen Root. Siehe [Module Manager](/administration/Module-Manager.md).

## Toram-Trim

`toram=trim` erstellt einen RAM-Datenbaum vor Persistenz und Kernel-Koordination. Es werden genau diese Elemente aus dem ausgewählten MiniOS-Datenbaum kopiert:

- `config.conf`, der für diesen Kopiervorgang erforderlich ist.
- `authorized_keys`, sofern er als reguläre Datei existiert.
- Top-Level-Kandidaten mit passender Erweiterung, ausgewählt durch `load=` und `noload=`.
- Ausgewählte Kandidaten mit passender Erweiterung rekursiv unterhalb von `modules/`, wobei ihre relativen Verzeichnisse erhalten bleiben.
- Der komplette `changes/`-Baum, wenn die Befehlszeile Persistenz anfordert.

Es werden nicht kopiert: `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Logs, andere Nicht-Modul-Daten, nicht ausgewählte Module oder die separate beschreibbare Persistenzmodul-Ebene. Insbesondere kann das Repository-Fallback kein `kernels/`-Verzeichnis verwenden, das aus dem getrimmten RAM-Baum ausgelassen wurde. Der kopierte Modulsatz wird gefiltert, bevor die Persistenzmodul-Ebene erkannt wird.

Es gibt keinen RAM-Kapazitäts-Preflight. Ein Fehler beim Kopieren von `config.conf` oder angeforderten `changes/` beendet den Ausführungskontext der Kopierfunktion, aber deren Aufrufer wandeln diesen Status nicht zuverlässig in einen sauberen Boot-Stopp um. Ein Fehler beim Kopieren von `authorized_keys` wird gemeldet, führt aber nicht zum Abbruch des Kopiervorgangs. Ausgewählte Module werden durch eine Pipeline kopiert; ein Fehler beim Kopieren eines einzelnen Moduls wird gemeldet, aber dessen Status wird nicht zuverlässig weitergegeben, um den äußeren Bootpfad zu stoppen. Es gibt kein transaktionales Rollback eines teilweise gefüllten RAM-Baums.

Nach dem Kopieren versucht das Initrd, das Quell-Mount zu unmounten, den alten Datenpfad zu entfernen und den RAM-Baum in diesen Pfad zu verschieben. Nur der Erfolg dieser gesamten Kette markiert die Quelle als getrennt. Scheitert die Kette, läuft der Bootvorgang mit dem RAM-Staging-Pfad weiter. Verwandte ISO- und Ventoy-Detach-Operationen sind best effort. Daher ist `toram=trim` kein Beweis dafür, dass das Boot-Gerät entfernt werden kann. Entfernen Sie es nicht, solange Diagnosen nicht bestätigen, dass dessen Dateisystem, Loop-Device und Device-Mapper-Mappings nicht mehr gemountet oder in Benutzung sind.

## Rootcopy und Root-Handoff

Nach dem Mounten der Module und dem Aufbau der Union kopiert das Initrd den sichtbaren Inhalt von `minios/rootcopy/` direkt in die zusammengebaute Union. Das Shell-Glob `*` schließt Einträge mit Punkt-Präfix direkt in `rootcopy/` aus, obwohl versteckte Dateien innerhalb eines kopierten Verzeichnisses weiterhin Teil dieser Verzeichniskopie bleiben. Dies ist ein Kopiervorgang in die beschreibbare Ansicht, nicht eine weitere schreibgeschützte Modullayer, sodass damit Pfade überschrieben werden können, die von Modulen bereitgestellt werden. Kopierfehler werden durch diese Funktion nicht als fatal behandelt.

MiniOS führt dann sein frühes Setup durch, schreibt die neue Root-`fstab` und sourced `rootcopy/run/preinit.sh`, sofern vorhanden, wobei der Union-Pfad als erstes Argument übergeben wird. Dieses Skript läuft in der Initrd-Umgebung vor dem Root-Handoff und muss als privilegierter Boot-Code behandelt werden.

An der finalen Grenze schwenkt das LiveKit-Initrd die zusammengebaute Union nach `/`, behält das alte Initrd unter `/run/initramfs` für Shutdown-Aufgaben und führt die neue Root-`init` aus. Der Dracut-Pfad bereitet dieselbe Union vor und lässt Dracut das finale `switch_root` durchführen. Nach Überschreiten dieser Grenze läuft der normale Startvorgang im zusammengesetzten Root; Änderungen an Dateien auf dem Boot-Medium bauen das ausgewählte Lower-Layer-Set für diesen Bootvorgang nicht mehr neu auf.

## Sichere Diagnosen

Bevorzugen Sie eine reine Lese-Inspektion und protokollieren Sie die ursprüngliche Befehlszeile, bevor Sie Filter ändern:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` zeigt die aktuelle regelbasierte Auswahl, während `sb list` die tatsächlich das laufende Root zusammensetzenden Layer anzeigt. Ein Unterschied kann auf einen Mount-Fehler, einen Basename-Austausch, eine Laufzeitänderung durch `AUFS` oder eine Auswahlquelle hinweisen, die sich nach dem Booten geändert hat.

Bei einem frühen Fehler fügen Sie `debug` hinzu, um Shell-Tracing zu aktivieren, `timing` für die Anzeige von Stufenzeiten oder `rd.break`, um nach dem initrd-Setup und vor der finalen Root-Übergabe eine Shell zu öffnen. In dieser Shell können Sie `/memory/data`, `/memory/bundles`, Mounts und `/proc/cmdline` inspizieren; reparieren Sie keine Dateisysteme und entfernen Sie keine Medien, solange sie gemountet sind. Erfassen Sie den ersten Mount- oder Kopierfehler, nicht nur das spätere Symptom. Siehe [Troubleshooting](/administration/Troubleshooting.md) für einen umfassenderen sicheren Diagnose-Workflow.

## Verwandte Dokumentation

- [Boot-Modi](/configuration/Boot-Modes.md)
- [Systemerkennung](/configuration/Initrd-System-Discovery.md)
- [Persistenz](/configuration/Initrd-Persistence.md)
- [Modul-Manager](/administration/Module-Manager.md)
- [Module erstellen](/development/Creating-Modules.md)
- [Kernel-Management](/administration/Kernel-Management.md)
- [Fehlerbehebung](/administration/Troubleshooting.md)
