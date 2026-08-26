---
updated: 2026-08-26
---

# Performance-Optimierung

Die Performance-Optimierung in MiniOS ist im Wesentlichen ein Ausgleich zwischen Bootzeit, RAM-Nutzung, Lesezugriffen zur Laufzeit, Persistenz-Overhead und Speicherdauerhaftigkeit. Für genaue Bedeutungen der Optionen und Sicherheitsgrenzen nutzen Sie bitte [Boot-Modi](/configuration/Boot-Modes.md), [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md) und [Initrd-Persistenz](/configuration/Initrd-Persistence.md).

## Boot-Parameter für Performance

Boot-Parameter können Startvorgänge und Lesezugriffe des Live-Systems zwischen RAM und Quellgerät verschieben. Die vollständige Referenz finden Sie unter [Boot-Parameter](/configuration/Boot-Parameters.md).

### Laden des Systems in den RAM (`toram`)

`toram` kann die Latenzzeit zur Laufzeit bei langsamen USB-Geräten oder netzwerkbasierten ISOs verringern, allerdings auf Kosten einer längeren Bootzeit und deutlich höherem RAM-Bedarf. Reines `toram` verwendet den vollständigen Kopiervorgang. `toram=trim` benötigt in der Regel weniger RAM, kann aber durch die selektive Kopie Daten oder Module auslassen, die später benötigt werden.

Berücksichtigen Sie neben den Moduldateien auch Platz für die beschreibbare Schicht, Anwendungen, Caches und zram. Mehr RAM für die Live-Kopie bedeutet weniger RAM für die eigentliche Arbeitslast. Beachten Sie [Boot-Modi](/configuration/Boot-Modes.md) hinsichtlich Kopierbeständigkeit und Anforderungen bei Medienentfernung.

### Filtern von Modulen (`load` und `noload`)

Durch Filtern kann die Menge der kopierten Daten und gemounteten Schichten reduziert werden, insbesondere mit `toram=trim`. Dies geht jedoch auf Kosten der Systemfunktionalität und erhöht das Risiko von Boot- oder Laufzeitfehlern, falls eine Abhängigkeit fehlt. Überprüfen Sie die resultierende Modulliste; Syntax und Einschränkungen für geschützte Module sind in [Initrd-Modulladen](/configuration/Initrd-Module-Loading.md) definiert.

## Persistenz-Optimierung

Persistenz verschiebt schreibbare Layer-I/O von temporärem RAM auf einen Speicher oder in einen Container. Die Wahl des Backends beeinflusst Latenz, Kompatibilität, Kapazitätsmanagement und die Komplexität der Wiederherstellung.

### Persistenzmodi (`perchmode`)

- **`native`:** Verzichtet auf eine Dateisystem-in-einer-Datei-Schicht und ist die einfachste Wahl auf einem geeigneten POSIX-Dateisystem, steht jedoch auf Dateisystemen, die die erforderlichen Linux-Metadaten nicht erhalten können, nicht zur Verfügung.
- **`raw`:** Bietet eine vorhersehbare, feste Kapazität und das übliche ext4-Verhalten, reserviert aber die Dateigröße und kann nicht über den verfügbaren Speicherplatz hinaus wachsen.
- **`dynfilefs`:** Erweitert sich bei Bedarf und unterstützt ansonsten ungeeignete Medien, bringt jedoch zusätzliche Komplexität bei Zuordnung und Wiederherstellung mit sich.
- **`luks`:** Fügt Vertraulichkeit hinzu, was jedoch mit zusätzlichem Aufwand zum Entsperren und Verschlüsselungs-Overhead verbunden ist.
- **`squashfs`:** Tauscht Komprimierung beim Speichern und RAM-Extraktion gegen einen kompakten Snapshot; ist jedoch kein allgemeiner, latenzarmer, schreibbarer Backend.

Testen Sie repräsentative Arbeitslasten auf dem tatsächlichen Gerät. Unterschiede bei Flash-Controllern, Dateisystemen, USB-Bridges und Workloads sind aussagekräftiger als eine allgemeine Rangfolge der Persistenzmodi.

## ZRAM-Konfiguration

Zram tauscht CPU-Leistung gegen komprimierte Speicherkapazität und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres zram-Device kann mehr inaktive Seiten aufnehmen, erzeugt aber keinen physischen RAM; nicht komprimierbare Workloads verbrauchen weiterhin Speicher. Kompressionsalgorithmen bieten unterschiedliche Durchsatzraten und CPU-Belastung im Verhältnis zur Kompressionsrate; die Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit der Standardeinstellung und ändern Sie `zramsize`, `zramcomp` oder `nozram` nur für gemessene Arbeitslasten; akzeptierte Werte finden Sie unter [Boot-Parameter](/configuration/Boot-Parameters.md).

## Dateisystem und Speicherhardware

- **Geräteauswahl:** Höherer sequentieller Datendurchsatz verkürzt große Modulkopien, während niedrige Latenz bei zufälligen I/O-Vorgängen für persistente Desktop-Workloads wichtiger ist. Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein sagt nichts über die Leistung von Flash oder SSD aus.
- **Dateisystemauswahl:** Ein natives Linux-Dateisystem ermöglicht native Persistenz ohne Container-Overhead. Plattformübergreifende Dateisysteme erhöhen die Portabilität, erfordern aber für Linux-Metadaten ein kompatibles Container-Backend, was zusätzliche Zuordnungs- und Dateisystemschichten mit sich bringt. Wählen Sie je nach Portabilitäts- und Wiederherstellungsbedarf sowie nach Benchmark-Ergebnissen.
