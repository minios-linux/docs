---
updated: 2026-09-16
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

- **`native`:** Speichert die beschreibbare Ebene direkt als normale Dateien. Dies verursacht den geringsten Container-Overhead und hat keine feste Containergröße, erfordert jedoch ein unterstützendes Dateisystem, das die Linux-Metadaten und Operationen unterstützt, die MiniOS benötigt.
- **`raw`:** Verwendet ein ext4-Image mit fester Kapazität. Die Dateigröße entspricht der gewünschten Kapazität und eine Erweiterung erfolgt explizit. Dadurch ist das Verhalten einfach und vorhersehbar, es fehlt jedoch die Thin-Capacity-Eigenschaft der dynamischen Backends. FAT32 begrenzt das einzelne Image auf 4000 MiB.
- **`dynfilefs`:** Das FUSE/format-400-Backend erweitert den Speicherplatz für Nutzdaten bei Bedarf und unterstützt auch sonst ungeeignete Medien. Der Index ist nicht dünn besetzt: Jeder deklarierte 4-KiB-Logikblock benötigt einen 8-Byte-Offset, sodass die logische Kapazität etwa 2 MiB RAM und etwa 2 MiB Indexspeicher pro GiB kostet, selbst wenn die Nutzdaten leer sind. Das macht moderate Kapazitäten effizient, große Thin-Kapazitäten jedoch von Anfang an teuer.
- **`dynblk`:** Das format-1-Kernel-Block-Backend stellt ein normales Blockgerät bereit, während der Thin-`volumeNNN.db` Speicher bei Bedarf wächst. Die Laufzeit-Zuordnungen sind dünn besetzt und ordnen jeweils einen 4-KiB-Block für 128 logische Blöcke zu. Dicht belegte Daten benötigen etwa 8 MiB Mapping-RAM pro GiB, aber nicht zugeordnete virtuelle Kapazität verbraucht keinen Mapping-Block. Der feste interne Baumindex belegt nur 396.312 Byte pro angeschlossenem Gerät, und die Seitenreferenzzähler sind dünn besetzt. Der Treiber, nicht MiniOS, legt das Standard-Mapping-Budget auf etwa 25 % des nutzbaren RAM fest, mit einer Obergrenze von 4096 MiB. Dies begünstigt große, dünn belegte Kapazitäten; ein dicht gefülltes Volume kann mehr Mapping-RAM pro GiB verbrauchen als DynFileFS.
- **`squashfs`:** Speichert einen komprimierten Snapshot und stellt das beschreibbare Overlay bei jedem Start in RAM wieder her. Dies minimiert den dauerhaften Speicherbedarf bei überwiegend stabilen Sitzungen, verursacht jedoch CPU- und RAM-Kosten beim Wiederherstellen und überschreibt den Snapshot beim Speichern.

LUKS2 kann Raw, DynFileFS oder DynBlk verschlüsseln. Die Verschlüsselung verursacht zusätzlichen Aufwand beim Entsperren und bei der Kryptografie, während die Kapazität und das Speicherverhalten des zugrunde liegenden Backends erhalten bleiben.

Testen Sie typische Workloads direkt auf dem Zielgerät. Unterschiede bei Flash-Controllern, Dateisystemen, USB-Bridges, Verschlüsselung, Kompression und Workload sind aussagekräftiger als ein allgemeines Ranking der Persistenzmodi.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierten Speicherplatz und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres zram-Gerät kann mehr inaktive Seiten aufnehmen, schafft aber keinen physischen RAM; nicht komprimierbare Workloads belegen weiterhin Speicher.
Kompressionsalgorithmen balancieren Durchsatz und CPU-Bedarf gegen die Kompressionsrate, und ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit dem Standardwert und ändern Sie `zramsize`, `zramcomp`, oder `nozram` nur für eine gemessene Arbeitslast; akzeptierte Werte finden Sie unter [Startparameter](/reference/Boot-Parameters).

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höherer sequentieller Durchsatz verkürzt große Modulkopien, während niedrige Latenz bei zufälligen I/O-Vorgängen für persistente Desktop-Workloads wichtiger ist.
  Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein ist kein verlässlicher Indikator für Flash- oder SSD-Leistung.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme erhöhen die Portabilität, benötigen aber für Linux-Metadaten ein kompatibles Container-Backend und damit zusätzliche Mapping- und Dateisystemebenen. Die Auswahl sollte neben Benchmark-Ergebnissen auch auf Portabilitäts- und Wiederherstellungsanforderungen basieren.
