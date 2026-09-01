---
updated: 2026-08-26
---

# Performance

Das Performance-Tuning in MiniOS ist im Wesentlichen ein Ausbalancieren zwischen Bootzeit, RAM-Verbrauch, Lesezugriffen zur Laufzeit, Persistenz-Overhead und Speicherdauerhaftigkeit. Für genaue Bedeutungen der Optionen und Sicherheitsgrenzen nutzen Sie [Boot-Modi](/using-minios/Boot-Modes), [Initrd-Modulladen](/reference/boot-process/Module-Loading) und [Initrd-Persistenz](/reference/boot-process/Persistence-Internals).

## Boot-Parameter für Performance

Boot-Parameter können Startvorgänge und Lesezugriffe im laufenden System zwischen RAM und dem Quellgerät verschieben. Eine vollständige Referenz finden Sie unter [Boot-Parameter](/reference/Boot-Parameters).

### Laden des Systems in RAM (`toram`)

`toram` kann die Latenzzeit zur Laufzeit bei langsamen USB-Geräten oder netzwerkbasierten ISOs verringern, allerdings auf Kosten einer längeren Bootzeit und deutlich mehr belegtem RAM. Reines `toram` nutzt den vollständigen Kopiervorgang. `toram=trim` benötigt in der Regel weniger RAM, kann aber durch die eingeschränkte Kopie Daten oder Module auslassen, die später benötigt werden.

Lassen Sie ausreichend Platz für die beschreibbare Schicht, Anwendungen, Caches und zram, anstatt nur für Moduldateien zu dimensionieren. Mehr zugewiesene RAM für die Live-Kopie bedeutet weniger verfügbare Ressourcen für die eigentliche Arbeitslast. Beachten Sie [Boot-Modi](/using-minios/Boot-Modes) für Hinweise zur Kopierdauerhaftigkeit und Einschränkungen beim Entfernen von Medien.

### Module filtern (`load` und `noload`)

Das Filtern kann die zu kopierende Datenmenge und die Anzahl der eingebundenen Layer reduzieren, insbesondere mit `toram=trim`. Der Nachteil ist ein weniger leistungsfähiges System und ein erhöhtes Risiko für Boot- oder Laufzeitfehler, falls eine Abhängigkeit ausgelassen wird. Überprüfen Sie das resultierende Modul-Set; Syntax zum Filtern und Einschränkungen für geschützte Module sind in [Initrd-Modulladen](/reference/boot-process/Module-Loading) definiert.

## Persistenz-Optimierung

Persistenz verschiebt Schreibzugriffe der beschreibbaren Schicht von temporärem RAM auf einen Speicher oder in einen Container. Die Wahl des Backends beeinflusst Latenz, Kompatibilität, Kapazitätsverwaltung und Komplexität der Wiederherstellung.

### Persistenzmodi (`perchmode`)

- **`native`:** Vermeidet eine Dateisystem-in-einer-Datei-Schicht und ist die einfachste Wahl auf einem geeigneten POSIX-Dateisystem, steht jedoch auf Dateisystemen, die die erforderlichen Linux-Metadaten nicht erhalten können, nicht zur Verfügung.
- **`raw`:** Bietet eine vorhersehbare, feste Kapazität und das übliche ext4-Verhalten, reserviert jedoch die Dateigröße und kann nicht über den verfügbaren Speicherplatz hinaus wachsen.
- **`dynfilefs`:** Erweitert sich bei Bedarf und unterstützt ansonsten ungeeignete Medien, bringt jedoch zusätzliche Zuordnungs- und Wiederherstellungskomplexität mit sich.
- **`luks`:** Fügt Vertraulichkeit hinzu, allerdings auf Kosten von zusätzlicher Entsperrarbeit und Verschlüsselungs-Overhead.
- **`squashfs`:** Tauscht Komprimierung beim Speichern und RAM-Entpacken gegen einen kompakten Snapshot; dies ist kein allgemeines, latenzarmes, beschreibbares Backend.

Testen Sie repräsentative Arbeitslasten auf dem tatsächlichen Gerät. Unterschiede beim Flash-Controller, Dateisystem, USB-Bridge und der Arbeitslast sind verlässlicher als eine allgemeine Rangfolge der Persistenzmodi.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierte Speicherkapazität und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres zram-Gerät kann mehr inaktive Seiten aufnehmen, erzeugt jedoch keinen physischen RAM; nicht komprimierbare Arbeitslasten belegen weiterhin Speicher.
Komprimierungsalgorithmen balancieren Durchsatz und CPU-Auslastung gegen die Kompressionsrate, und ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit der Standardeinstellung und ändern Sie `zramsize`, `zramcomp` oder `nozram` nur für eine gemessene Arbeitslast; akzeptierte Werte finden Sie unter [Boot-Parameter](/reference/Boot-Parameters).

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höherer sequentieller Durchsatz verkürzt große Modulkopien, während niedrige Latenz bei zufälligen I/O-Vorgängen für persistente Desktop-Workloads wichtiger ist.
  Messen Sie das Gerät und das Gehäuse gemeinsam; die USB-Generation allein sagt nichts über die Leistung von Flash oder SSD aus.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme verbessern die Portabilität, benötigen aber ein kompatibles Container-Backend für Linux-Metadaten und fügen zusätzliche Mapping- und Dateisystem-Layer hinzu. Wählen Sie basierend auf Portabilitäts- und Wiederherstellungsanforderungen sowie Benchmark-Ergebnissen.
