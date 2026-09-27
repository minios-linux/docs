---
updated: 2026-09-26
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

- **`native`:** Speichert die beschreibbare Ebene direkt als normale Dateien. Dies verursacht den geringsten Overhead und hat keine feste Containergröße, erfordert jedoch ein unterstützendes Dateisystem, das die Linux-Metadaten und Operationen, die MiniOS benötigt, erhält.
- **`raw`:** Nutzt ein ext4-Image mit fester Kapazität. Die Dateigröße wird auf die gewünschte Kapazität gesetzt und wächst nur explizit, wodurch das Verhalten einfach und vorhersehbar ist, aber die dynamische Kapazitätsanpassung der Thin-Backends fehlt. FAT32 begrenzt ein einzelnes Image auf 4000 MiB.
- **`dynfilefs`:** Das FUSE/format-400-Backend erweitert den Speicherplatz bei Bedarf und unterstützt auch sonst ungeeignete Medien. Der Index ist nicht dünn: Jeder deklarierte 4-KiB-Block benötigt einen 8-Byte-Offset, sodass pro GiB logischer Kapazität etwa 2 MiB RAM und 2 MiB Indexspeicher benötigt werden, selbst wenn die Nutzdaten leer sind. Das macht mittlere Kapazitäten effizient, große Thin-Kapazitäten jedoch von Anfang an teuer.
- **`dynblk`:** Das format-1 `DBSPRS01` Kernel-Backend speichert die Zuordnungstabellen auf dem Datenträger und hält einen begrenzten Metadaten-Cache im RAM (Standard: 1 MiB). Das Füllen eines bestehenden Geräts allokiert keine vollständige residente Map. Bereichsbeschreibungen und Verzeichnisse skalieren mit den deklarierten Teilen; Dateicache und Codec-Speicher kommen hinzu. `dynblk limits --format dynblk` meldet die Geometrie-Obergrenze; `dynblk status /dev/dynblkN --json` meldet belegte Puffer und Caching-Statistiken. Normale Rohüberschreibungen bleiben erhalten; teilweise komprimierte Updates werden derzeit als 64-KiB-Grain neu komprimiert. Wählen Sie die Attachment-Cache-Policy bewusst: `unsafe` verzichtet auf Haltbarkeitsgarantien.
- **`squashfs`:** Speichert einen komprimierten Snapshot und stellt die beschreibbare obere Ebene bei jedem Start in RAM wieder her. Dies minimiert den permanenten Speicherbedarf für überwiegend stabile Sitzungen, verursacht aber CPU- und RAM-Last beim Wiederherstellen und überschreibt den Snapshot beim Speichern. Wenn ausreichend Arbeitsspeicher vorhanden ist, wird beim Speichern eine stabile Kopie der Änderungen in RAM zwischengespeichert und direkt in einen privaten Kandidaten im Sitzungsverzeichnis komprimiert. Nach Überprüfung und Synchronisierung ersetzt MiniOS atomar `changes.sb`; es wird keine zweite komprimierte Kopie geschrieben. Falls RAM den Zwischenspeicherbaum nicht aufnehmen kann, wird der vorhandene Festplattenarbeitsbereich dafür genutzt.

LUKS2 kann Raw, DynFileFS oder DynBlk kapseln. Die Verschlüsselung bringt zusätzlichen Aufwand beim Entsperren und bei der Kryptografie, behält aber die Kapazität und das Speicherverhalten des zugrundeliegenden Backends bei.

Testen Sie repräsentative Workloads auf dem tatsächlichen Gerät. Unterschiede bei Flash-Controller, Dateisystem, USB-Bridge, Verschlüsselung, Kompression und Arbeitslast sind aussagekräftiger als ein allgemeines Ranking der Persistenzmodi.

### Reduzieren Sie Cache- und Protokollschreibvorgänge mit `perch`

MiniOS-Konfigurators **Erweitert**-Tab, der unabhängige Speichereinstellungen für normale Systemprotokolle, APT-Downloads und Standard-Caches nativer Browser bietet. Diese funktionieren auch im `minios/config.conf` oder dessen `config.conf.d/*.conf` Fragmenten:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Jede Einstellung akzeptiert `persistent` (Standard) oder `volatile`. Starten Sie nach einer Änderung neu. `minios-boot` wendet die Richtlinie nur an, wenn die laufende `perch`-Sitzung als beschreibbar und dauerhaft bestätigt ist; das Anfordern von Persistenz allein reicht nicht aus. Für einen einmaligen Start verwenden Sie `log-storage=volatile`, `apt-cache=volatile` oder `browser-cache=volatile` auf der Kernel-Befehlszeile. Die `live-config.`mit -Präfix versehenen Varianten funktionieren ebenfalls und haben Vorrang vor Konfigurationsdateien. Diese Einstellungen **nicht** eigenständig `perch` aktiviert. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) für die Reihenfolge der Quelldateien und [Startparameter](/reference/Boot-Parameters) für die vollständige Syntax.

| Einstellung | Was in RAM mit `volatile` | Was auf persistentem Speicher verbleibt |
|---|---|---|
| `LIVE_LOG_STORAGE` | Das systemd-Journal (maximal 32 MiB) und normale `/var/log` Dateien (32 MiB tmpfs). | Startdiagnosen in `/var/log/minios/` und `/var/log/live/`, einschließlich drei vorheriger Protokollversionen. |
| `LIVE_APT_CACHE` | Heruntergeladene Pakete in `/var/cache/apt/archives` (256 oder 512 MiB tmpfs, abhängig vom verfügbaren Speicher). | Paketstatus in `/var/lib/dpkg`, Repository-Listen in `/var/lib/apt/lists` und installierte Dateien. |
| `LIVE_BROWSER_CACHE` | Ein gemeinsames 512 MiB tmpfs für Standard-Cache-Verzeichnisse von Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera und Yandex Browser im Home-Verzeichnis des Live-Nutzers `~/.cache`. Eine Systemrichtlinie deaktiviert den Festplatten-Cache von Firefox. | Profile, Cookies, Passwörter, Webseitendaten und Caches nicht verwandter Anwendungen. |

APT- und Browser-RAM-Caches werden übersprungen, wenn weniger als 1 GiB verfügbar ist oder ein nicht-zRAM-Swap aktiv ist. Das APT-Archiv-tmpfs läuft nicht auf das Gerät über: Ein Download, der größer als die verbleibende Kapazität ist, kann fehlschlagen. Ein vorhandener Firefox-`policies.json` wird nicht ersetzt; überprüfen Sie dessen Festplatten-Cache-Einstellung separat. Standardmäßige native Browserpfade werden nach dem Anlegen des Live-Nutzers vorbereitet, auch wenn ein Browser später installiert wird. Benutzerdefinierte Pfade, Flatpak/Snap-Installationen und Nutzer, die nach dieser Einrichtung erstellt werden, werden nicht automatisch umgeleitet. Bereits gespeicherte Browser-Caches werden durch die RAM-Mounts für diesen Start ausgeblendet und erscheinen wieder, wenn Sie zurückwechseln zu `persistent`.

Boot-Protokolle verbleiben unabhängig von der normalen Protokolleinstellung auf dem beschreibbaren Persistenzspeicher; eine SquashFS-Sitzung hält sie außerhalb `changes.sb`, sodass sie nicht vom Speichern eines Snapshots beim Herunterfahren abhängen. Mit `volatile`, werden andere Dateien unter `/var/log` (einschließlich APT/dpkg-Protokollhistorie) beim Neustart gelöscht. `EXPORT_LOGS=true` ist ein separater, expliziter Export auf das MiniOS-Medium. Ein volles 32 MiB Log-tmpfs nimmt keine neuen Protokolle mehr auf, anstatt sie auf den Flash-Speicher zu schreiben. Wenn später ein weiteres swap-basiertes Laufwerk aktiviert wird, können speicherbasierte Dateien dennoch in diesen Swap ausgelagert werden. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting#collecting-logs) zum Auffinden der Boot-Diagnose.

MiniOS verwendet ebenfalls `noatime` beim Einhängen seiner eigenen Daten- und Container-Dateisysteme, um Metadaten-Updates der Zugriffszeiten zu vermeiden; dies betrifft keine anderen Benutzerlaufwerke. Standardmäßig begrenzt `relatime` solche Updates bereits, daher sollte der Unterschied gemessen werden, bevor dies als große Einsparung betrachtet wird. Das Dateisystem-Journal, Barrieren und `fsync` sollten für einen entfernbaren Persistenzspeicher aktiviert bleiben.

Für einen kontrollierten 16 MiB Logdatei-Schreibvorgang gefolgt von `sync`, hat eine Testo-VM 33.304 geschriebene Sektoren auf ihrer unteren virtuellen Festplatte im Persistenzmodus und 8 im Volatilmodus aufgezeichnet. Dies zeigt die Änderung des Schreibpfads für diese Arbeitslast. Es misst keine Schreibvorgänge innerhalb eines USB-Flash-Controllers und sagt auch nichts über die NAND-Lebensdauer aus. Vergleichen Sie identische Anwendungs-Workloads auf dem tatsächlichen Gerät, bevor Sie eine Aussage zur Lebensdauer treffen.

## ZRAM-Konfiguration

Zram tauscht CPU-Zeit gegen komprimierten Arbeitsspeicher und kann deutlich langsameren, speicherbasierten Swap vermeiden. Ein größeres Zram-Gerät kann mehr inaktive Seiten aufnehmen, erzeugt aber keinen physischen RAM; nicht komprimierbare Workloads verbrauchen dennoch Speicher.
Komprimierungsalgorithmen bieten unterschiedliche Durchsatzraten und CPU-Belastung im Verhältnis zur Kompressionsrate; ihre Verfügbarkeit hängt vom Kernel ab. Beginnen Sie mit dem Standard und ändern Sie `zramsize`, `zramcomp` oder `nozram` nur für eine gemessene Arbeitslast; siehe [Boot-Parameter](/reference/Boot-Parameters) für akzeptierte Werte.

## Dateisystem und Speicherhardware

- **Gerätewahl:** Höhere sequentielle Transferraten verkürzen große Modul-Kopien, während niedrige Random-I/O-Latenzen für persistente Desktop-Arbeitslasten wichtiger sind.
  Messen Sie Gerät und Gehäuse gemeinsam; die USB-Generation allein sagt nichts über Flash- oder SSD-Leistung aus.
- **Dateisystemwahl:** Ein natives Linux-Dateisystem kann native Persistenz ohne Container-Overhead nutzen. Plattformübergreifende Dateisysteme erhöhen die Portabilität, benötigen aber ein kompatibles Container-Backend für Linux-Metadaten, was zusätzliche Mapping- und Dateisystemebenen bedeutet. Wählen Sie nach Portabilitäts- und Wiederherstellungsbedarf sowie nach Benchmark-Ergebnissen.
