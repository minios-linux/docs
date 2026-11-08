---
updated: 2026-10-15
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

- **`native`:** Speichert die beschreibbare Ebene direkt als normale Dateien. Dies verursacht den geringsten Overhead und hat keine feste Containergröße, erfordert jedoch ein unterstützendes Dateisystem, das die Linux-Metadaten und Operationen unterstützt, die MiniOS benötigt.
- **`raw`:** Nutzt ein ext4-Image mit fester Kapazität. Die Dateigröße entspricht der gewünschten Kapazität und wächst nur explizit, wodurch das Verhalten einfach und vorhersehbar bleibt, aber die dynamische Kapazitätsanpassung der anderen Backends fehlt. Bei FAT32 ist die Einzeldatei auf 4000 MiB begrenzt.
- **`dynfilefs`:** Das FUSE/format-400-Backend erweitert den Speicherplatz bei Bedarf und unterstützt auch sonst ungeeignete Medien. Der Index ist nicht dünn besetzt: Jeder deklarierte 4-KiB-Block benötigt einen 8-Byte-Offset, sodass die logische Kapazität etwa 2 MiB RAM und ca. 2 MiB Indexspeicher pro GiB kostet, selbst wenn die Nutzdaten leer sind. Für mittlere Kapazitäten ist das effizient, große dünn provisionierte Kapazitäten sind jedoch im Vorfeld teuer.
- **`dynblk`:** Das format-1 `DBSPRS01` Kernel-Backend speichert Zuordnungstabellen auf der Festplatte und hält einen begrenzten Metadaten-Cache im RAM (Standard: 1 MiB). Beim Befüllen eines vorhandenen Geräts wird keine vollständige Residenzkarte angelegt. Bereichsbeschreibungen und Verzeichnisse skalieren mit den deklarierten Teilen; Dateicache und Codec-Speicher kommen hinzu. `dynblk limits --format dynblk` meldet die Geometrie-Obergrenze; `dynblk status /dev/dynblkN --json` gibt gepufferte Speicher und Cache-Statistiken aus. Normale Rohüberschreibungen bleiben bestehen; teilweise komprimierte Aktualisierungen werden derzeit als 64-KiB-Blöcke neu komprimiert. Wählen Sie die Attachment-Cache-Policy bewusst: `unsafe` verzichtet auf Haltbarkeitsgarantien.
- **`vmdk`:** Verwendet den DynBlk Kernel-Treiber mit Standard-VMDK-Speicher (Split Sparse). Die Datei wächst bei Bedarf, bietet aber keine Backend-Kompression. Wie native DynBlk-Container kann sie unabhängig von den Systemmodulen in RAM kopiert und explizit zurück auf den Speicher geschrieben werden.
- **`squashfs`:** Speichert einen komprimierten Snapshot und stellt die beschreibbare obere Ebene bei jedem Start in RAM wieder her. Dies minimiert den dauerhaften Speicherbedarf für überwiegend stabile Sitzungen, verursacht jedoch CPU- und RAM-Kosten beim Wiederherstellen und überschreibt den Snapshot beim Speichern. Wenn genügend Speicher vorhanden ist, wird beim Speichern eine stabile Kopie der Änderungen in RAM zwischengespeichert und direkt in einen privaten Kandidaten im Sitzungsverzeichnis komprimiert. Nach Überprüfung und Synchronisierung ersetzt MiniOS atomar `changes.sb`; es wird keine zweite komprimierte Kopie geschrieben. Falls RAM den Zwischenspeicherbaum nicht aufnehmen kann, wird das bestehende Festplatten-Workspace für diesen Baum verwendet.

LUKS2 kann Raw, DynFileFS, DynBlk oder VMDK kapseln. Die Verschlüsselung bringt Entsperr- und Krypto-Overhead mit sich, während die Kapazität und das Speicherverhalten des zugrunde liegenden Backends erhalten bleiben. DynBlk-Kompression ist deaktiviert, wenn LUKS2 verwendet wird; VMDK bietet grundsätzlich keine Backend-Kompression.

DynFileFS 4.6.0 und der experimentelle 5.01 MiniOS-Zweig fügen dem ursprünglichen Backend Discard und Wiederverwendung von Allokationen hinzu. Für eine reproduzierbare Demonstration siehe `tests/benefit-minios.py` im DynFileFS-Repository. In einem synthetischen Test auf ext4-Speicher von lego2 (kein USB-Flash-Gerät) reduzierte das Verwerfen von 32 MiB die MiniOS-Speicherbelegung von ca. 49 MiB auf 17 MiB; nach weiteren 16 MiB an Schreibvorgängen belegte MiniOS etwa 25 MiB, verglichen mit ca. 57 MiB beim ursprünglichen Tomas-M 5.01-Backend. Nicht verschiebende Freigabe und optionale Kompaktierung gaben in diesem Layout keinen weiteren Speicher frei. Diese Werte sind workload-spezifisch, und dem ursprünglichen Backend wurden statt Discard null Schreibvorgänge zugewiesen, da diese Schnittstelle nicht implementiert ist. Das Ergebnis ist daher kein allgemeiner Geschwindigkeits- oder Haltbarkeitsvorteil.

Testen Sie repräsentative Workloads auf dem tatsächlichen Gerät. Unterschiede beim Flash-Controller, Dateisystem, USB-Bridge, Verschlüsselung, Kompression und der Workload selbst sind aussagekräftiger als eine allgemeine Rangfolge der Persistenzmodi.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Reduzieren Sie Cache- und Log-Schreibvorgänge mit `perch`

dem MiniOS-Konfigurator **Erweitert**-Tab, der unabhängige Speicheroptionen für normale Systemprotokolle, APT-Downloads und Standard-Caches nativer Browser bietet. Diese Einstellungen funktionieren auch in `minios/config.conf` oder dessen `config.conf.d/*.conf` Fragmenten:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Jede Einstellung akzeptiert `persistent` (Standard) oder `volatile`. Starten Sie nach einer Änderung neu. `minios-boot`wird nach erfolgreicher Aktivierung der Persistenz auf einem dauerhaften Speicher oder in einer beschreibbaren RAM-Sitzung mit einem geschützten `ram-origin`Datensatz angewendet; das Anfordern von Persistenz allein reicht nicht aus. Für einen einmaligen Start verwenden Sie `log-storage=volatile`, `apt-cache=volatile` oder `browser-cache=volatile` auf der Kernel-Befehlszeile. Die `live-config.`mit -Präfix versehenen Varianten funktionieren ebenfalls und haben Vorrang vor Konfigurationsdateien. Diese Einstellungen **aktivieren nicht** von selbst `perch`. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die Reihenfolge der Quelldateien und [Boot-Parameter](/reference/Boot-Parameters) für die vollständige Syntax.

| Einstellung | Was mit RAM verbleibt bei `volatile` | Was auf persistentem Speicher bleibt |
|---|---|---|
| `LIVE_LOG_STORAGE` | Das systemd-Journal (maximal 32 MiB) und normale `/var/log`-Dateien (32 MiB tmpfs). | Boot-Diagnose in `/var/log/minios/` und `/var/log/live/`, einschließlich drei vorheriger Log-Versionen. |
| `LIVE_APT_CACHE` | Heruntergeladene Pakete in `/var/cache/apt/archives` (256 oder 512 MiB tmpfs, abhängig vom verfügbaren Arbeitsspeicher). | Paketstatus in `/var/lib/dpkg`, Repository-Listen in `/var/lib/apt/lists` und installierte Dateien. |
| `LIVE_BROWSER_CACHE` | Ein gemeinsames 512 MiB tmpfs für Standard-Cache-Verzeichnisse von Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera und Yandex Browser im Home-Verzeichnis des Live-Nutzers `~/.cache`. Eine Systemrichtlinie deaktiviert den Festplatten-Cache von Firefox. | Profile, Cookies, Passwörter, Website-Daten und Caches anderer Anwendungen. |

APT- und Browser-RAM-Caches werden übersprungen, wenn weniger als 1 GiB verfügbar ist oder ein nicht-zRAM-Swap aktiv ist. Das APT-Archiv-tmpfs wird nicht auf das Gerät ausgelagert: Ein Download, der größer als die verbleibende Kapazität ist, kann fehlschlagen. Ein vorhandener Firefox-`policies.json` wird nicht ersetzt; überprüfen Sie dessen Festplatten-Cache-Einstellung separat. Standardpfade nativer Browser werden nach der Erstellung des Live-Nutzers vorbereitet, auch wenn ein Browser später installiert wird. Benutzerdefinierte Pfade, Flatpak/Snap-Installationen und Nutzer, die danach angelegt werden, werden nicht automatisch umgeleitet. Bereits gespeicherte Browser-Caches werden durch die RAM-Mounts für diesen Start ausgeblendet und erscheinen wieder, wenn Sie zu `persistent` zurückwechseln.

Mit dauerhafter Persistenz bleiben Boot-Logs im beschreibbaren Sitzungs-Store erhalten, unabhängig von der normalen Log-Einstellung; eine dauerhafte SquashFS-Sitzung bewahrt sie außerhalb `changes.sb`, sodass sie nicht vom Speichern eines Snapshots beim Herunterfahren abhängen. Eine kopierte Sitzung mit `perchtoram` unterscheidet sich: Ihre Logs bleiben speicherbasiert, bis sie auf einen Speicher geschrieben werden. Mit `volatile`, verschwinden andere Dateien unter `/var/log` (einschließlich APT/dpkg-Textverlauf) beim Neustart.`EXPORT_LOGS=true` ist ein separater, expliziter Export auf das MiniOS-Medium. Ein volles 32 MiB Log-tmpfs nimmt keine neuen Log-Schreibvorgänge mehr an, anstatt auf Flash auszulagern. Wenn später ein weiterer swap-basierter Datenträger aktiviert wird, können speicherbasierte Dateien dennoch auf diesen Swap ausgelagert werden. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting#collecting-logs) für Hinweise zum Auffinden der Boot-Diagnose.

MiniOS verwendet außerdem `noatime` beim Einbinden eigener Daten- und Container-Dateisysteme, um Metadaten-Updates für Zugriffszeiten zu vermeiden; dies betrifft keine anderen Benutzerlaufwerke. Standardmäßig begrenzt `relatime` solche Updates bereits, daher sollte der Unterschied gemessen werden, bevor dies als wesentliche Einsparung betrachtet wird. Halten Sie das Dateisystem-Journal, Barrieren und `fsync` für einen entfernbaren persistenten Speicher aktiviert.

Für einen kontrollierten 16 MiB Logfile-Schreibvorgang, gefolgt von `sync`, wurden bei einer Testo-VM im persistenten Modus 33.304 geschriebene Sektoren auf der unteren virtuellen Festplatte und 8 im volatilen Modus aufgezeichnet. Dies zeigt die Änderung des Schreibpfads für diese Arbeitslast. Es misst keine Schreibvorgänge innerhalb eines USB-Flash-Controllers und prognostiziert nicht die Lebensdauer von NAND. Vergleichen Sie identische Anwendungs-Workloads auf dem tatsächlichen Gerät, bevor Sie Rückschlüsse auf die Lebensdauer ziehen.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierten Arbeitsspeicher und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres Zram-Gerät kann mehr inaktive Seiten aufnehmen, erzeugt aber keinen physischen RAM; nicht komprimierbare Workloads verbrauchen dennoch Speicher.
Komprimierungsalgorithmen bieten unterschiedliche Durchsatzraten und CPU-Belastung im Verhältnis zur Kompressionsrate; ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit dem Standard und ändern Sie `zramsize`, `zramcomp` oder `nozram` nur für eine gemessene Arbeitslast; siehe [Boot-Parameter](/reference/Boot-Parameters) für akzeptierte Werte.

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höhere sequentielle Transferraten verkürzen große Modul-Kopien, während niedrige Random-I/O-Latenzen für persistente Desktop-Arbeitslasten wichtiger sind.
  Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein sagt nichts über Flash- oder SSD-Leistung aus.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme erhöhen die Portabilität, benötigen aber ein kompatibles Container-Backend für Linux-Metadaten, was zusätzliche Mapping- und Dateisystemebenen bedeutet. Wählen Sie nach Portabilitäts- und Wiederherstellungsbedarf sowie nach Benchmark-Ergebnissen.
