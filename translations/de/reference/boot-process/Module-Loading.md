---
updated: 2026-10-15
---

# Modul-Ladevorgang

Diese Seite erklärt, was die Boot-Parameter `load`, `noload`, `bext`, `union` und `toram=trim` bewirken. Dies sind erweiterte Steuerungsmöglichkeiten. Ein normaler Systemstart lädt automatisch das von dem gewählten MiniOS-Abbild bereitgestellte Modulpaket.

MiniOS wählt und mountet sein Modulpaket im initrd, bevor das Union-Root an das installierte Init-System übergeben wird. Verwenden Sie diese Seite, wenn ein Modul vom Boot-Medium im laufenden System nicht erscheint oder wenn ein Filter den Startvorgang unerwartet beeinflusst.

## Einfach erklärt

MiniOS wird aus nummerierten, schreibgeschützten `.sb`-Modulen zusammengesetzt. Niedrigere Nummern werden zuerst geladen; höhere Nummern können Dateien aus Modulen mit niedrigeren Nummern ersetzen. Eine schreibbare Sitzung, sofern aktiv, liegt über allen schreibgeschützten Modulen.

Die Parameter `load=` und `noload=` filtern Modulpfade vor der Zusammenstellung. Sie verwenden reguläre Ausdrücke anstelle einer sicheren Liste mit exakten Namen, sodass ein zu breit gefasster Filter wichtige Kern- oder Kernelmodule aus dem Boot-Set ausschließen kann.

## Parameter erklärt

| Parameter | Was es über MiniOS aussagt | Haupt­risiko |
|---|---|---|
| `load=PATTERN` | Nur Modul-Kandidaten behalten, deren Pfade dem Muster entsprechen. | Ein unvollständiges Muster kann erforderliche Module ausschließen. |
| `noload=PATTERN` | Passende Kandidaten werden nach `load=` ausgeschlossen. | Erforderliche Core-, Kernel-, Firmware- oder Desktop-Module könnten beim Systemstart fehlen. |
| `bext=EXTENSION` | Eine weitere Dateinamenerweiterung als Modul-Kandidatensuffix behandeln. | Dateien werden nicht konvertiert und Kernel-Module nicht vollständig koordiniert. |
| `union=aufs` oder `union=overlayfs` | Das Dateisystem anfordern, das zur Kombination der Module mit der beschreibbaren Ebene verwendet wird. | Die Aktivierung von Modulen zur Laufzeit unterscheidet sich zwischen AUFS und OverlayFS. |
| `toram=trim` | Nur ausgewählte Module und begrenzte erforderliche Daten nach RAM kopieren. | Ausgelassene Module und Verzeichnisse stehen nach dem Trennen der Quelle nicht mehr zur Verfügung. |

Bevor Sie Filter ändern, speichern Sie die aktuelle Befehlszeile und die Modulliste. Testen Sie jeweils nur eine Änderung und halten Sie einen funktionierenden Boot-Eintrag bereit.

<a id="candidate-tiers"></a>

## Kandidaten-Stufen

Nachdem das MiniOS Datenverzeichnis gefunden wurde, wird normalerweise `minios/`, vom initrd ein optionaler externer MiniOS-Baum erkannt, bevor RAM kopiert oder eine Sitzung aktiviert wird. Eine Persistenz-Partition auf demselben Laufwerk oder ein beschreibbares Ventoy Datenlayout kann diesen Baum auch bei einem Start ohne gespeicherte Sitzung bereitstellen. Das gewählte Ventoy Persistence Plugin-Backend ist ein separates Modell und stellt diesen externen Modulbaum nicht bereit.

Kandidaten bilden zwei Gruppen:

1. Modulnamen auf oberster Ebene aus dem gewählten Datenbaum und dem externen `minios/`-Baum, sortiert und nach relativen Namen zusammengefasst.
2. Dateien und symbolische Links rekursiv unterhalb von `modules/` in beiden Bäumen, sortiert und nach relativem Pfad zusammengefasst.

Für denselben relativen Pfad hat eine externe reguläre Datei Vorrang vor der ISO oder einer anderen gewählten Quelle. Dies gilt sowohl für ersetzende Systemmodule als auch für zusätzliche Module. Filter werden auf die zusammengeführten relativen Pfade angewendet, bevor gemountet oder ein gekürztes RAM kopiert wird. Das Wurzelverzeichnis der Persistenzpartition bleibt vom nummerierten Sitzungs-Store getrennt.

Mountpunkte werden weiterhin auf exakte Basisnamen reduziert. Zum Beispiel `modules/work/50-extra.sb` und `modules/test/50-extra.sb` verweisen beide auf `50-extra.sb`; sie sind keine unabhängigen Union-Layer. Verwenden Sie unterschiedliche Basisnamen, sofern kein exakter Pfadersatz beabsichtigt ist. Verlassen Sie sich nicht auf doppelte Basisnamen in verschiedenen Verzeichnissen als Ersatzmechanismus.

Das übliche Modulformat ist ein SquashFS-Dateisystem-Image. Ein passender Dateiname bestätigt nicht den Inhalt. Rekursive Scans berücksichtigen Dateien und symbolische Links, während der Scan auf oberster Ebene weiterhin dateinamenbasiert bleibt. Das Nicht-Binden eines externen Ersatzes oder das Nicht-Mounten eines gewählten Moduls führt nun zum fatalen initramfs-Pfad, anstatt diese Ebene stillschweigend zu überspringen. Überprüfen Sie fragliche Dateien mit [Module inspizieren und extrahieren](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Reihenfolge und Priorität

Beim Discovery-Prozess werden Pfade numerisch nach ihrem Basename sortiert. Die führende Zahl in Namen wie `00-core.sb`, `01-kernel-VERSION.sb` und `50-extra.sb` gibt die Modulreihenfolge an. Ein Basename ohne führende Zahl wird numerisch wie Null einsortiert.
Verwenden Sie eindeutige, explizite Zahlenpräfixe, anstatt sich auf die Reihenfolge bei Gleichstand zu verlassen.

Im finalen Union haben später geladene, höher nummerierte Module Vorrang vor früheren, niedriger nummerierten Modulen. Wenn zwei ausgewählte Module denselben pfadrelativen Ursprung enthalten, ist die Datei aus dem Modul mit höherer Priorität sichtbar. Die beschreibbare Änderungsschicht hat Vorrang vor allen schreibgeschützten Modulen.

Ein externer Ersatz nach relativem Pfad erfolgt vor dieser effektiven Modulreihenfolge. Ein Ersatz `modules/50-extra.sb` belegt denselben ausgewählten Slot wie die Quelldatei, und sein `50` Präfix bestimmt seine Priorität im Union.

## Bundle-Erweiterung

Der Boot-Parameter `bext=` wählt die Dateiendung, die für die Datenerkennung, Kandidatenfilterung und das Mounten von Modulen verwendet wird. Standardmäßig ist dies `sb`, daher ist das übliche Kandidatensuffix `.sb`:

```text
bext=sb
```

Das Ändern von `bext` ändert nur das gewählte Dateisuffix; es konvertiert keine Datei und prüft nicht das Dateisystemformat. Die Kernel-Koordination ist eine Ausnahme: Sie sucht immer nach `01-kernel-VERSION.sb`. Mit einer benutzerdefinierten Erweiterung werden diese `.sb`-Kernelmodule vom normalen Kandidatenscan nicht ausgewählt.

## Load- und Noload-Filter

`load=` und `noload=` sind nicht verankerte, erweiterte reguläre Ausdrücke, die auf die von jeder Stufe erzeugten Kandidaten-Pfadzeichenfolgen angewendet werden. Es handelt sich nicht um exakte Namenslisten. Ein einfacher Wert wie `kernel` trifft diesen Text an beliebiger Stelle in einem Pfad; Soll eine genaue Position gefordert werden, müssen Anker explizit angegeben werden.
Bei Top-Level-Kandidaten handelt es sich um Dateinamen, rekursive Kandidaten umfassen `modules/`. Externe Kandidaten verwenden ebenfalls die relative Pfadangabe, nicht absolute Persistenz-Mount-Pfade.

Kommas werden in reguläre Ausdrucks-Alternativen umgewandelt. Zum Beispiel:

```text
load=core,kernel,firmware
```

wird ausgewertet als `core|kernel|firmware`. Andere Zeichen regulärer Ausdrücke werden nicht maskiert.

Ein numerischer Bereich wird nur dann erweitert, wenn der gesamte Filter ein aufsteigender Bereich ist, der `^[0-9]+-[0-9]+$` entspricht. Zum Beispiel wird `load=04-06` zu den Alternativen `04|05|06`, wobei jeder generierte Wert mindestens zweistellig aufgefüllt wird. Ein Bereich, der in einer Kommaliste oder einem anderen Ausdruck eingebettet ist, wird nicht erweitert und behält seine normale ERE-Bedeutung.

Wenn beide Parameter vorhanden sind, wendet das initrd zuerst `load=` an und entfernt anschließend Treffer mit `noload=`. Somit hat `noload=` Vorrang. Es gibt keinen geschützten Kern- oder Kernelmodul-Satz: Filter können `00-core`, das koordinierte `01-kernel` oder jeden anderen Kandidaten ausschließen. Eine solche Auswahl kann zu einer unvollständigen Root führen oder den Systemstart verhindern.

## Koordination des laufenden Kernels

Die aktuell laufende Kernel-Version wird, sofern verfügbar, über ein `vmlinuz-VERSION`-Token auf der Kernel-Befehlszeile übernommen; andernfalls wird `uname -r` als Fallback verwendet. Bevor Module eingebunden werden, koordiniert das initrd dieses Top-Level-Triplet:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Fehlt ein Element, sucht das initrd nach allen drei Dateien in:

```text
minios/kernels/VERSION/
```

Sobald das Repository-Triplet vollständig ist, kopiert es das Modul nach `minios/` und die Boot-Dateien nach `minios/boot/`. Eine unvollständige Kopie wird bereinigt. Ist das Triplet nicht vollständig, schlägt die Kernel-Einrichtung fehl, aber der Aufrufer fährt mit dem normalen Modul-Einbinden fort. Das resultierende System kann später dennoch fehlschlagen, da dem Root-Dateisystem die Support-Dateien für den laufenden Kernel fehlen.

Andere Top-Level-Dateien, die mit `01-kernel-*.sb` übereinstimmen, werden als inaktiv behandelt. Das initrd versucht, jedes inaktive Modul und die zugehörigen `vmlinuz`- und `initrfs`-Dateien nach `minios/kernels/VERSION/` zu verschieben. Diese Fallback- und Verschiebeoperationen im Repository erfordern einen beschreibbaren Datenbaum; einzelne Fehler beim Verschieben sind nicht kritisch. Es wird immer `.sb` verwendet, unabhängig von `bext=`. Der zusammengeführte Kandidaten-Scan schließt außerdem `01-kernel-*`-Module aus, die nicht zum laufenden Kernel passen, einschließlich externer Kandidaten. Siehe [Kernel-Verwaltung](/preparing-and-customizing/Managing-Kernels) für unterstützte Workflows zur Kernel-Installation und -Aktivierung.

<a id="union-construction"></a>

## Union-Konstruktion

MiniOS wählt `AUFS` aus, wenn der laufende Kernel dies unterstützt, und verwendet andernfalls OverlayFS. `union=overlayfs` wählt OverlayFS. `union=aufs` fordert `AUFS` an, fällt aber auf OverlayFS zurück, wenn `AUFS` nicht verfügbar ist. Wenn UEFI Secure Boot aktiviert ist, lädt das initrd das nicht signierte `aufs-ng` Modul nicht; ist keine andere verwendbare AUFS-Implementierung bereits verfügbar, wird OverlayFS auch dann verwendet, wenn `union=aufs` angefordert wurde.

Mit `AUFS`, mountet das initrd zunächst eine leere Union mit dem beschreibbaren Changes-Branch und fügt dann jeden eingebundenen Modul als Read-only-Branch hinzu. Ein Fehler beim Erstellen der Union ist fatal. Ein Fehler beim Hinzufügen eines einzelnen `AUFS` Branches wird nach bestem Bemühen behandelt: Der Bootvorgang läuft mit den bereits hinzugefügten Branches weiter, während MiniOS die Persistenz für eine unvollständige Union nicht als aktiv markiert.

Mit OverlayFS wird die vollständige Modulliste als eine umgekehrte `lowerdir` Liste bereitgestellt, wenn die Union gemountet wird. Die beschreibbare Ebene liefert ihre `upperdir` und `workdir`. Ein Fehler beim Mounten dieser Union ist fatal. Die Links-nach-rechts-Anordnung der unteren Ebenen und die `AUFS` Einfüge-Reihenfolge setzen dieselbe Regel um: Spätere, höher nummerierte Module überdecken bei Konflikten Pfade früherer Module.

Diese Komposition zur Bootzeit unterscheidet sich von der Aktivierung zur Laufzeit. Nach dem Start können `sb activate` und `sb deactivate` nur ein aktuell als `AUFS` gemountetes Root verändern. OverlayFS-Untere Ebenen können nicht im laufenden Betrieb geändert werden. Die Aktivierung zur Laufzeit beeinflusst die Auswahl für den nächsten Bootvorgang nicht, und das Hinzufügen eines Next Boot-Moduls aktiviert dieses nicht im aktuellen Root. Siehe [MiniOS-Modulmanager](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` erstellt einen RAM Systemdaten-Baum nach der Erkennung von externen Modulen und vor der Sitzungsaktivierung sowie Kernel-Koordination. Es kopiert:

- `config.conf`, was für diesen Kopierpfad erforderlich ist.
- `authorized_keys` sofern es als reguläre Datei existiert.
- Top-Level-Kandidaten für Erweiterungsabgleich, ausgewählt durch `load=`, `noload=` und den Running-Kernel-Filter.
- Ausgewählte Erweiterungs-Kandidaten werden rekursiv unterhalb von `modules/` kopiert, wobei ihre relativen Verzeichnisse erhalten bleiben.
- Externe Ersetzungen und Ergänzungen werden nach denselben Regeln ausgewählt und in ihre entsprechenden relativen Pfade kopiert.

Es wird ein leeres `changes/` Verzeichnis erstellt; das Kopieren der Sitzung erfolgt separat durch `perchtoram`. Es kopiert nicht `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, Logs, andere Nicht-Modul-Daten oder nicht ausgewählte Module. Insbesondere kann ein Repository-Fallback kein `kernels/` Verzeichnis verwenden, das im getrimmten RAM Baum fehlt. Externe Module sind bereits enthalten, daher öffnet der RAM Boot ihre Originaldateien nach dem Kopieren nicht erneut.

Beim Systemkopieren gibt es kein RAM-Kapazitäts-Preflight. Ein Fehler beim Kopieren von `config.conf` oder eines ausgewählten Moduls wird an den Init-Eintrag weitergegeben und führt zum fatalen Pfad. Ein Fehler beim Kopieren optionaler `authorized_keys` wird gemeldet, ohne abzubrechen. Es gibt kein transaktionales Rollback eines teilweise befüllten Systemdaten-Baums. Das Sitzungs-Kopieren hat sein eigenes Speicher-Preflight und fällt auf die ursprüngliche gespeicherte Sitzung zurück, falls die Kopie nicht vorbereitet werden kann; siehe [Persistence internals](/reference/boot-process/Persistence-Internals).

Nach dem Kopieren versucht das Initrd, das Quell-Mount auszuhängen, dessen alten Datenpfad zu entfernen und den RAM Baum an diesen Pfad zu verschieben. Nur wenn diese gesamte Kette erfolgreich ist, gilt die Quelle als getrennt. Scheitert die Kette, läuft der Bootvorgang mit dem RAM Staging-Pfad weiter. Zugehörige ISO- und Ventoy-Detach-Operationen erfolgen nach dem Best-Effort-Prinzip.
Daher ist `toram=trim` kein Beweis dafür, dass das Boot-Gerät entfernbar ist. Ziehen Sie es nicht ab, es sei denn, Diagnosen bestätigen, dass dessen Dateisystem, Loop-Device und Device-Mapper-Zuordnungen nicht mehr gemountet oder in Benutzung sind.

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
