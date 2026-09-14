---
updated: 2026-09-13
---

# Leistung

Das Tuning der Leistung in MiniOS ist im Wesentlichen ein Kompromiss zwischen Startzeit, RAM-Verbrauch, Lesezugriffen zur Laufzeit, Persistenz-Overhead und Datenträgerhaltbarkeit. Für genaue Bedeutungen der Optionen und Sicherheitsgrenzen siehe [Startmodi](/using-minios/Boot-Modes), [Initrd-Modulladen](/reference/boot-process/Module-Loading), und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

## Startparameter für die Leistung

Startparameter können die Arbeit beim Systemstart und Lesezugriffe im Live-Betrieb zwischen RAM und dem Quellgerät verschieben. Siehe [Startparameter](/reference/Boot-Parameters) für die vollständige Referenz.

### System in RAM laden (`toram`)

`toram` kann die Laufzeitlatenz von einem langsamen USB-Gerät oder ISO über Netzwerk reduzieren, führt jedoch zu einer längeren Startzeit und belegt deutlich mehr RAM. Bare `toram` verwendet den vollständigen Kopierpfad. `toram=trim` benötigt in der Regel weniger RAM, aber die eingeschränkte Kopie kann später benötigte Daten oder Module auslassen.

Lassen Sie ausreichend Platz für die beschreibbare Ebene, Anwendungen, Caches und zram, anstatt nur für Moduldaten zu planen. Mehr RAM für die Live-Kopie bedeutet weniger für die eigentliche Arbeitslast. Hinweise zu Kopierhaltbarkeit und Einschränkungen beim Entfernen von Medien finden Sie unter [Startmodi](/using-minios/Boot-Modes).

### Module filtern (`load` und `noload`)

Durch Filtern können kopierte Daten und eingehängte Ebenen reduziert werden, insbesondere mit `toram=trim`. Der Nachteil ist ein weniger funktionsfähiges System und ein erhöhtes Risiko für Start- oder Laufzeitfehler, falls eine Abhängigkeit fehlt. Überprüfen Sie die resultierende Modulliste; Syntax und Einschränkungen für geschützte Module sind definiert unter [Initrd-Modulladen](/reference/boot-process/Module-Loading).

## Optimierung der Persistenz

Persistenz verschiebt Schreibzugriffe der beschreibbaren Ebene von temporärem RAM auf einen Speicher oder in einen Container. Die Wahl des Backends beeinflusst Latenz, Kompatibilität, Kapazitätsmanagement und Wiederherstellungskomplexität.

### Persistenzmodi (`perchmode`)

- **`native`:** Verzichtet auf eine Dateisystem-in-Datei-Ebene und ist die einfachste Wahl auf einem geeigneten POSIX-Dateisystem, steht jedoch auf Dateisystemen, die die erforderlichen Linux-Metadaten nicht erhalten können, nicht zur Verfügung.
- **`raw`:** Bietet eine vorhersehbare, feste Kapazität und das übliche ext4-Verhalten, reserviert jedoch die Dateigröße und kann nicht über den verfügbaren Speicherplatz hinaus wachsen.
- **`dynfilefs`:** Das FUSE/format-400-Backend wächst bei Bedarf und unterstützt sonst ungeeignete Medien, bringt aber zusätzlichen Mapping- und Wiederherstellungsaufwand mit sich.
- **`dynblk`:** Das format-1 Kernel-Block-Backend stellt ein normales Blockgerät bereit, während thin `volumeNNN.db`-Speicher bei Bedarf wächst. Es vermeidet FUSE-I/O, aber jedes angeschlossene Gerät belegt festen Metadaten-Speicher, und Schreibvorgänge bleiben durch freien Speicherplatz und dynblk-Grenzen des Backing-Dateisystems limitiert.
- **`luks`:** Bietet Vertraulichkeit auf Kosten von Entsperr-Arbeit und Verschlüsselungs-Overhead.
- **`squashfs`:** Komprimiert beim Speichern und tauscht RAM-Dekompression gegen ein kompaktes Abbild; ist kein allgemeines, latenzarmes, beschreibbares Backend.

Testen Sie repräsentative Arbeitslasten direkt auf dem jeweiligen Gerät. Unterschiede bei Flash-Controllern, Dateisystemen, USB-Adaptern und Workloads sind aussagekräftiger als eine allgemeine Rangfolge der Persistenzmodi.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierten Speicherplatz und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres zram-Gerät kann mehr inaktive Seiten aufnehmen, schafft aber keinen physischen RAM; nicht komprimierbare Workloads belegen weiterhin Speicher.
Kompressionsalgorithmen balancieren Durchsatz und CPU-Bedarf gegen die Kompressionsrate, und ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit dem Standardwert und ändern Sie `zramsize`, `zramcomp`, oder `nozram` nur für eine gemessene Arbeitslast; akzeptierte Werte finden Sie unter [Startparameter](/reference/Boot-Parameters).

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höherer sequentieller Durchsatz verkürzt große Modulkopien, während niedrige Latenz bei zufälligen I/O-Vorgängen für persistente Desktop-Workloads wichtiger ist.
  Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein ist kein verlässlicher Indikator für Flash- oder SSD-Leistung.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme erhöhen die Portabilität, benötigen aber für Linux-Metadaten ein kompatibles Container-Backend und damit zusätzliche Mapping- und Dateisystemebenen. Die Auswahl sollte neben Benchmark-Ergebnissen auch auf Portabilitäts- und Wiederherstellungsanforderungen basieren.
