# MiniOS-Startmodi

Startmodi beschreiben, woher das Live-System stammt, ob seine beschreibbare Schicht temporär oder persistent ist und ob MiniOS seine Quelle in den RAM kopiert. Sie beschreiben jedoch kein anderes Firmware- oder Bootloader-Protokoll. GRUB, Syslinux, Ventoy oder ein PXE-Loader starten die gleiche grundlegende MiniOS-Early-Userspace-Pipeline, indem sie einen Kernel und ein Initramfs mit einer Kernel-Befehlszeile laden.

Nutzen Sie diese Seite, um einen Modus auszuwählen und die daraus resultierenden Abhängigkeiten zu verstehen. Für die einzelnen Befehlszeilenoptionen siehe [Boot-Parameter](/configuration/Boot-Parameters.md). Für die von einem Abbild bereitgestellten Einträge siehe [Boot-Menüs](/configuration/Boot-Menus.md).

## Firmware, Bootloader und Early Userspace

Firmware und Bootloader laufen, bevor MiniOS Live-Module oder Sitzungen erkennen kann. BIOS oder UEFI startet einen lokalen Bootloader oder Netzwerk-Firmware startet einen PXE-Loader. Dieser wählt und lädt den MiniOS-Kernel und das Initramfs und übergibt deren Befehlszeile. Auch Ventoy gehört zu dieser Schicht: Es präsentiert ein ISO über seine eigene Bootumgebung, bevor MiniOS-Early-Userspace dieses erkennt.

Der Kernel startet dann das MiniOS-Initramfs. Dieser Early Userspace erkennt die Live-Quelle, bereitet optionale RAM-Kopien und Persistenz vor, mountet die Module und erstellt das Root-Dateisystem. Ein Menüeintrag wie Fresh Start oder Resume Previous Session ist daher hauptsächlich eine bequeme Auswahl von Initramfs-Parametern und keine eigene Bootloader-Implementierung.

Native Installationen sind anders. Sie booten ein entpacktes, konventionelles Linux-Root mit dem installierten GRUB und Initramfs des Systems. Sie nutzen nicht die unten beschriebene modulare Live-Pipeline.

## Live-Boot-Sequenz

Die Live-Pipeline läuft in folgender Reihenfolge ab:

1. **Kernel und Initramfs laden.** Der durch die Firmware gewählte Bootloader lädt beide Dateien und übergibt die Kernel-Befehlszeile. Zu diesem Zeitpunkt wurde noch kein MiniOS-SquashFS-Root zusammengesetzt.
2. **Quelle erkennen.** Das Initramfs durchsucht lokale Blockgeräte, folgt einem expliziten `from=`-Pfad, loop-mountet ein lokales ISO, mountet ein HTTP-ISO oder lädt das PXE-Datenset herunter. Quellenerkennung und Persistenz-Erkennung sind verwandte, aber unterschiedliche Vorgänge.
3. **Bei Bedarf in den RAM kopieren.** Die Optionen `toram` und `toram=full` kopieren den vollständigen MiniOS-Datenbaum, abhängig von der Persistenz-Verarbeitung. `toram=trim` kopiert stattdessen die ausgewählten Module und die erforderliche Konfiguration. Das Initramfs versucht anschließend, die Originalquelle zu trennen. Ein abgeschlossener Kopiervorgang allein beweist jedoch nicht, dass das Trennen erfolgreich war.
4. **Persistenz auswählen.** Wenn Persistenz angefordert wurde, ermittelt das Initramfs den Speicherort und die Sitzung, prüft diese und bereitet die beschreibbare Schicht vor. Resume, neu und interaktive Auswahl unterscheiden sich nur darin, wie die Sitzung gewählt oder erstellt wird. Ohne Persistenz-Anfrage ist die beschreibbare Schicht RAM-basiert.
5. **Aktiven Kernel-Satz abgleichen.** Der Kernel läuft bereits und kann in diesem Stadium nicht mehr gewechselt werden. MiniOS prüft, ob der aktive Datenbaum das `01-kernel`-Modul, das Kernel-Image und das Initramfs enthält, die zu diesem Kernel passen. Wenn das vollständige passende Set im inaktiven Kernel-Repository existiert, versucht MiniOS, es zu aktivieren und verschiebt andere aktive Kernel-Sets ins Repository. Dies ist ein Abgleich von Dateien, kein Kernel-Fallback oder ein Kernel-Wechsel im laufenden Betrieb.
6. **Module mounten.** Ausgewählte `.sb`-Dateien aus dem MiniOS-Datenbaum und ggf. aus dem beschreibbaren Modul-Store werden sortiert, mit `load=` und `noload=` gefiltert und schreibgeschützt loop-gemountet.
7. **AUFS oder OverlayFS konstruieren.** MiniOS kombiniert die gemounteten Module mit einer beschreibbaren Schicht. AUFS fügt die geordneten Modul-Mounts als schreibgeschützte Branches hinzu. OverlayFS erhält beim Mounten des Root die vollständige geordnete Lower-Directory-Liste sowie Upper- und Work-Verzeichnisse. Das entstehende Union ist das Live-Root-Dateisystem.
8. **`rootcopy` anwenden und `minios-boot` ausführen.** Dateien im Quellverzeichnis `rootcopy/` werden ins zusammengesetzte Root kopiert. Das Initramfs führt dann `minios-boot` in einem Chroot aus, um die MiniOS-Konfiguration zu synchronisieren und frühe Userspace-Einstellungen anzuwenden. Es bereitet außerdem `fstab` vor und führt optional einen `rootcopy/run/preinit.sh`-Hook vor der Übergabe aus.
9. **Übergabe an normalen Userspace.** LiveKit verwendet `pivot_root` für die finale Übergabe, während dracut das gleiche zusammengesetzte Root vorbereitet und den abschließenden `switch_root` durchführt. Das installierte Init-System startet dann die normalen Dienste und die Desktop- oder Konsolensitzung. Frühe Netzwerk-Fetch-Einstellungen sind keine dauerhafte Userspace-Netzwerkkonfiguration.

Die detaillierten Verträge zu Erkennung, Modulen und Persistenz sind dokumentiert in [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md), [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md).

## Modus-Matrix

| Modus | Live-Quelle | Beschreibbare Schicht | Abhängigkeit der Quelle nach dem Booten |
|------|-------------|-----------------------|------------------------------|
| Fresh local | Lokaler `minios/`-Baum oder lokales ISO | Temporärer RAM | Bleibt bestehen, sofern eine angeforderte nicht-persistente `toram`-Kopie nicht erfolgreich getrennt wurde. |
| Persistent resume | Lokaler oder explizit gewählter Persistenzspeicher | Bestehende kompatible Sitzung, wenn verfügbar | Quelle und Persistenzspeicher bleiben normalerweise in Benutzung. Resume garantiert nicht, dass jede fehlende oder beschädigte Sitzung wiederhergestellt wird. |
| Persistent new | Beschreibbarer Persistenzspeicher | Neu zugewiesene, nummerierte Sitzung | Quelle und Persistenzspeicher bleiben in Benutzung. Die Erstellung erfordert kompatiblen beschreibbaren Speicher und ausreichend Platz. |
| Persistent choose | Interaktive Auswahl von Persistenzort und Sitzung | Gewählte oder neu erstellte Sitzung | Abhängig von gewählter Quelle und Persistenzspeicher. Die Auswahl macht eine inkompatible Sitzung nicht automatisch sicher. |
| Bare oder full `toram` | Jede auffindbare Live-Quelle | Temporärer RAM, sofern nicht auch Persistenz angefordert wird | Bare `toram` bedeutet `toram=full`. Das Medium ist nur nach erfolgreicher nicht-persistenter Quellentrennung entfernbar. |
| Trim `toram` | Jede auffindbare Live-Quelle | Temporärer RAM, sofern nicht auch Persistenz angefordert wird | Kopiert nur das gefilterte Modul-Set und erforderliche Daten. Die gleiche Trennungsbedingung gilt. |
| Lokales ISO oder Ventoy | Loop-gemountetes ISO oder von Ventoy präsentiertes ISO | Temporärer RAM oder separat gewählte Sitzung | ISO und zugrundeliegende Zuordnungen bleiben erforderlich, sofern nicht eine nicht-persistente `toram` sie erfolgreich trennt. |
| HTTP ISO | ISO gemountet über `httpfs2` via HTTP | Temporärer RAM oder separat gewählte Sitzung | Der Abrufpfad und das Netzwerk bleiben relevant, solange das Root über httpfs bereitgestellt wird; `toram` kann diese Abhängigkeit nur entfernen, wenn die Trennung gelingt. |
| PXE | Kernel und Initramfs vom Loader, MiniOS-Daten werden durch das Initramfs heruntergeladen | Temporärer RAM oder separat gewählte Sitzung | Frühes Netzwerk dient zum Laden der Daten, nicht für die Netzwerk-Policy der Sitzung. Die genauen Abhängigkeiten hängen davon ab, was heruntergeladen und gemountet wurde. |
| Native installation | Entpacktes installiertes Root, keine `.sb`-Live-Module | Normale installierte Dateisysteme | Nutzt keine Live-Erkennung, Live-Sitzungen, `toram`, Modul-Union oder diese Live-Handover-Pipeline. |

## Kombinationen und Grenzen

Quellen-, Persistenz- und RAM-Kopie-Optionen sind unabhängige Achsen. Ein lokales Verzeichnis, lokales ISO, HTTP-ISO oder PXE-Datenquelle kann Live-Module bereitstellen. Persistenz kann dann weggelassen, fortgesetzt, erstellt oder – sofern unterstützt – ausgewählt werden. `toram=full` oder `toram=trim` können mit einer unterstützten Live-Quelle angefordert werden.

Persistenz und `toram` können gemeinsam genutzt werden, dies ist jedoch nicht der gleiche Vertrag wie beim normalen Persistenzbetrieb. MiniOS kopiert die angeforderten Sitzungsdaten vor der Persistenz-Einrichtung in den RAM-Datenbaum. Es darf nicht davon ausgegangen werden, dass spätere Änderungen zurück auf den ursprünglichen Speicher geschrieben werden, und das Medium sollte nicht allein aufgrund der `toram`-Option entfernt werden. Die Grenze für entnehmbare Medien ist enger: Eine Entfernung ist nur dann sicher, wenn MiniOS eine **nicht-persistente** RAM-Kopie erfolgreich von der Originalquelle getrennt hat. Schlägt die Trennung fehl, bleibt die Quelle gemountet. Bei Ventoy gibt MiniOS seine Zuordnungen erst nach erfolgreicher nicht-persistenter Trennung frei; die Bereinigung der Zuordnungen erfolgt nach bestem Bemühen.

`toram=trim` beachtet die Modulauswahl-Filter, sodass ein ausgeschlossenes Modul nicht verfügbar ist, nur weil das ursprüngliche Medium noch existiert. Für eine vollständige `toram`-Kopie wird ausreichend RAM für die Daten benötigt, während trim genug RAM für das ausgewählte Set und die beschreibbare Arbeitslast erfordert. Keiner der Modi garantiert, dass ein zu schwach ausgestatteter Rechner sicher bootet.

HTTP-ISO und PXE-Netzwerk gehören zum Initramfs. Ein explizites `from=http://...` hat Vorrang und kann `ip=` für statische frühe Adressierung nutzen. Ohne diese HTTP-ISO-Quelle wählt ein nicht-leeres `ip=` den PXE-Datenpfad und überspringt die lokale Medienerkennung. Es ist keine statische Adresse für den laufenden Desktop. HTTP-ISO unterstützt `http://`, aber nicht `https://`. Wurde kein HTTP-Root in den RAM getrennt, kann eine spätere Neukonfiguration des Netzwerks die zugrundeliegende Quelle unterbrechen. Siehe [Netzwerk-Boot](/installation/Network-Boot.md), bevor Sie das Laden über das Netzwerk mit Änderungen an der Userspace-Netzwerkkonfiguration kombinieren.

Persistenz erfordert ein geeignetes beschreibbares Ziel und einen passenden Modus. Nur-Lese-Medien können keine neue Sitzung aufnehmen, verschlüsselte Persistenz wird bei einem Aktivierungsfehler nicht stillschweigend unverschlüsselt, und interaktive Annahme beseitigt keine Kompatibilitätsrisiken. Nutzen Sie [Sitzungsverwaltung](/configuration/Session-Management.md) für Speicherarten, Kompatibilität und Wiederherstellungsregeln.

## Entscheidungshilfe

| Ziel | Starten mit | Vor der Nutzung prüfen |
|------|-------------|-----------------------|
| MiniOS testen, ohne Änderungen zu behalten | Fresh local | Bestehende Sitzungen werden nicht ausgewählt; gewöhnliche Quellmedien bleiben in Benutzung. |
| Normal weiterarbeiten | Persistent resume | Das Persistenzziel ist beschreibbar und die Sitzung kompatibel. |
| Alte Sitzung behalten und neu starten | Persistent new | Es ist genügend Speicherplatz vorhanden und das Dateisystem unterstützt den gewählten Persistenzmodus. |
| Zwischen mehreren Arbeitsbereichen wählen | Persistent choose | Sie können das gewünschte Gerät und die Sitzung identifizieren; Kompatibilitätswarnungen beachten. |
| Lokales Bootmedium nach dem Start entfernen | Nicht-persistente `toram` oder `toram=trim` | Warten Sie auf eine erfolgreiche Quellentrennung. Nicht allein vom Menüeintrag auf Erfolg schließen. |
| RAM-Verbrauch beim Kopieren in den RAM reduzieren | `toram=trim` | Das Ergebnis von `load=` und `noload=` enthält alle Module, die das System benötigt. |
| ISO von lokaler Festplatte oder Ventoy-Gerät booten | Lokale ISO-Erkennung | Host-Dateisystem und Zuordnungen verfügbar halten, sofern Trennung nicht bestätigt ist. |
| ISO von einem Webserver laden | HTTP ISO | Verkabeltes Initramfs-Netzwerk, einfache HTTP-Erreichbarkeit und fortlaufender Quellzugriff. |
| MiniOS-Daten aus Bereitstellungsinfrastruktur laden | PXE | Korrekte MiniOS-`ip=`-Syntax und unterstützte kabelgebundene Schnittstelle; nicht als Userspace-Netzwerkkonfiguration behandeln. |
| MiniOS als konventionell installiertes System betreiben | Native installation | Folgen Sie der Dokumentation für native Installation und Wiederherstellung, nicht den Live-Session- oder `toram`-Verfahren. |

Wenn ein Bootvorgang fehlschlägt, bevor das Live-Root erstellt wurde, bestimmen Sie zunächst, ob der Fehler beim Firmware-/Bootloader-Start, bei der Quellenerkennung, Persistenz, beim Mounten der Module oder beim Aufbau des Root auftritt. Vermeiden Sie Reparaturbefehle, bis das Speicherlayout bekannt ist. Siehe [Boot-Wiederherstellung](/administration/Boot-Recovery.md).

## Verwandte Dokumentation

- [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md)
- [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md)
- [Initrd-Persistenz](/configuration/Initrd-Persistence.md)
- [Boot-Parameter](/configuration/Boot-Parameters.md)
- [Boot-Menüs](/configuration/Boot-Menus.md)
- [Netzwerk-Boot](/installation/Network-Boot.md)
- [Sitzungsverwaltung](/configuration/Session-Management.md)
- [Systemarchitektur](/about/System-Architecture.md)
- [Boot-Wiederherstellung](/administration/Boot-Recovery.md)
