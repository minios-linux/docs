---
updated: 2026-09-17
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

- **`native`:** Speichert die beschreibbare Ebene direkt als normale Dateien. Dies verursacht den geringsten Container-Overhead und hat keine feste Containergröße, erfordert jedoch ein zugrunde liegendes Dateisystem, das die von MiniOS benötigten Linux-Metadaten und -Operationen erhält.
- **`raw`:** Verwendet ein ext4-Image mit fester Kapazität. Die Dateigröße entspricht der gewünschten Kapazität und eine Erweiterung erfolgt explizit, wodurch das Verhalten einfach und vorhersehbar ist. Die dynamischen Backends mit Thin-Provisioning werden jedoch nicht unterstützt. Bei FAT32 ist ein einzelnes Image auf 4000 MiB begrenzt.
- **`dynfilefs`:** Das FUSE/format-400-Backend erweitert den Nutzdatenspeicher bei Bedarf und unterstützt auch sonst ungeeignete Medien. Der Index ist nicht dünn belegt: Jeder deklarierte 4-KiB-Block benötigt einen 8-Byte-Offset, sodass die logische Kapazität etwa 2 MiB RAM und etwa 2 MiB Index-Speicher pro GiB kostet, selbst wenn die Nutzdaten leer sind. Dadurch sind mittlere Kapazitäten effizient, große Thin-Kapazitäten jedoch von Anfang an speicherintensiv.
- **`dynblk`:** Das format-1-`DBSPRS01` Kernel-Backend speichert die Zuordnungstabellen auf der Festplatte und hält einen begrenzten Metadaten-Cache im RAM (standardmäßig 1 MiB). Beim Befüllen eines vorhandenen Geräts wird keine vollständige Resident-Map angelegt. Bereichsbeschreibungen und Verzeichnisse skalieren mit den deklarierten Teilen; Dateicache und Codec-Speicher kommen hinzu. `dynblk limits --format dynblk` meldet die Geometrie-Obergrenze; `dynblk status /dev/dynblkN --json` gibt gepufferte Speicherbereiche und Cache-Statistiken aus. Gewöhnliche Rohüberschreibungen bleiben erhalten; teilweise komprimierte Aktualisierungen werden derzeit in 64-KiB-Blöcken neu komprimiert. Wählen Sie die Attachment-Cache-Richtlinie bewusst: `unsafe` verzichtet auf Haltbarkeitsgarantien.
- **`squashfs`:** Speichert einen komprimierten Snapshot und stellt die beschreibbare obere Ebene bei jedem Start in RAM wieder her. Dies minimiert den dauerhaften Speicherbedarf für weitgehend stabile Sitzungen, verursacht jedoch CPU- und RAM-Aufwand beim Wiederherstellen und überschreibt den Snapshot beim Speichern.

LUKS2 kann Raw, DynFileFS oder DynBlk kapseln. Die Verschlüsselung erhöht den Aufwand für Entsperren und Kryptografie, während Kapazität und Speicherverhalten des zugrunde liegenden Backends erhalten bleiben.

Testen Sie typische Workloads direkt auf dem jeweiligen Gerät. Unterschiede bei Flash-Controller, Dateisystem, USB-Bridge, Verschlüsselung, Komprimierung und Workload sind aussagekräftiger als ein allgemeines Ranking der Persistenzmodi.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierten Speicherplatz und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres zram-Gerät kann mehr inaktive Seiten aufnehmen, schafft aber keinen physischen RAM; nicht komprimierbare Workloads belegen weiterhin Speicher.
Kompressionsalgorithmen balancieren Durchsatz und CPU-Bedarf gegen die Kompressionsrate, und ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit dem Standardwert und ändern Sie `zramsize`, `zramcomp`, oder `nozram` nur für eine gemessene Arbeitslast; akzeptierte Werte finden Sie unter [Startparameter](/reference/Boot-Parameters).

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höherer sequentieller Durchsatz verkürzt große Modulkopien, während niedrige Latenz bei zufälligen I/O-Vorgängen für persistente Desktop-Workloads wichtiger ist.
  Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein ist kein verlässlicher Indikator für Flash- oder SSD-Leistung.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme erhöhen die Portabilität, benötigen aber für Linux-Metadaten ein kompatibles Container-Backend und damit zusätzliche Mapping- und Dateisystemebenen. Die Auswahl sollte neben Benchmark-Ergebnissen auch auf Portabilitäts- und Wiederherstellungsanforderungen basieren.
