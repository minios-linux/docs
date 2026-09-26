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

- **`native`:** Speichert die beschreibbare Ebene direkt als normale Dateien. Dies verursacht den geringsten Container-Overhead und hat keine feste Containergröße, benötigt jedoch ein unterstützendes Dateisystem, das die Linux-Metadaten und Operationen, die MiniOS benötigt, erhält.
- **`raw`:** Nutzt ein ext4-Abbild mit fester Kapazität. Die Dateigröße entspricht der gewünschten Kapazität und Wachstum erfolgt explizit, daher ist dieses Verfahren einfach und vorhersehbar, bietet aber nicht das Thin-Capacity-Verhalten der dynamischen Backends. FAT32 begrenzt ein einzelnes Abbild auf 4000 MiB.
- **`dynfilefs`:** Das FUSE/format-400-Backend erweitert den Speicherplatz für Nutzdaten nach Bedarf und unterstützt auch sonst ungeeignete Medien. Der Index ist nicht dünn: Jeder deklarierte 4-KiB-Block benötigt einen 8-Byte-Offset, sodass pro GiB logischer Kapazität etwa 2 MiB RAM und etwa 2 MiB Indexspeicher im Backend anfallen, selbst wenn die Nutzdaten leer sind. Dadurch sind mittlere Kapazitäten effizient, aber große Thin-Kapazitäten von Anfang an teuer.
- **`dynblk`:** Das format-1 `DBSPRS01` Kernel-Backend speichert Zuordnungstabellen auf der Festplatte und hält einen begrenzten Metadaten-Cache im RAM (Standard: 1 MiB). Das Füllen eines bestehenden Geräts allokiert keine vollständige residente Map. Bereichsbeschreibungen und Verzeichnisse skalieren mit den deklarierten Teilen; Dateicache und Codec-Speicher kommen hinzu. `dynblk limits --format dynblk` meldet die Geometrie-Obergrenze; `dynblk status /dev/dynblkN --json` gibt belegte Puffer und Cache-Statistiken aus. Normale Rohüberschreibungen bleiben erhalten; teilweise komprimierte Updates werden derzeit in 64-KiB-Blöcken neu komprimiert. Wählen Sie die Attachment-Cache-Policy bewusst: `unsafe` verzichtet auf Haltbarkeitsgarantien.
- **`squashfs`:** Speichert einen komprimierten Snapshot und stellt die beschreibbare obere Ebene bei jedem Booten in RAM wieder her. Dies minimiert den dauerhaften Speicherbedarf für überwiegend stabile Sitzungen, verursacht aber CPU- und RAM-Last beim Wiederherstellen und überschreibt den Snapshot beim Speichern. Wenn genügend Arbeitsspeicher vorhanden ist, wird beim Speichern eine stabile Kopie der Änderungen in RAM zwischengespeichert und direkt in eine private Kandidatendatei im Sitzungsverzeichnis komprimiert. Nach Überprüfung und Synchronisierung ersetzt MiniOS atomar `changes.sb`; es wird keine zweite komprimierte Kopie geschrieben. Falls RAM den Zwischenspeicherbaum nicht aufnehmen kann, wird das vorhandene Festplatten-Workspace für diesen Baum genutzt.

LUKS2 kann Raw, DynFileFS oder DynBlk umschließen. Die Verschlüsselung bringt zusätzlichen Aufwand beim Entsperren und bei der Kryptografie, während Kapazität und Speicherverhalten des zugrundeliegenden Backends erhalten bleiben.

Testen Sie repräsentative Workloads direkt auf dem tatsächlichen Gerät. Unterschiede bei Flash-Controller, Dateisystem, USB-Bridge, Verschlüsselung, Kompression und Arbeitslast sind aussagekräftiger als ein allgemeines Ranking der Persistenzmodi.

### Cache- und Protokollschreibvorgänge reduzieren mit `perch`

dem MiniOS-Konfigurator**Erweitert**-Reiter bietet unabhängige Speichereinstellungen für Systemprotokolle, APT-Downloads und Standard-Caches nativer Browser. Diese funktionieren ebenfalls im `minios/config.conf` oder dessen `config.conf.d/*.conf` Fragmenten:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Jede Einstellung akzeptiert `persistent` (Standard) oder `volatile`. Starten Sie nach einer Änderung neu. `minios-boot` gilt nur, wenn die laufende `perch` Sitzung als beschreibbar und dauerhaft bestätigt ist; das Anfordern von Persistenz allein reicht nicht aus. Für einen einmaligen Start verwenden Sie `log-storage=volatile`, `apt-cache=volatile` oder `browser-cache=volatile` auf der Kernel-Befehlszeile. Die `live-config.`-Präfix-Varianten funktionieren ebenfalls und haben Vorrang vor Konfigurationsdateien. Diese Einstellungen **aktivieren** nicht `perch` von selbst. Siehe [Konfigurationsdatei](/reference/configuration/config.conf) zur Reihenfolge der Quelldateien und [Boot-Parameter](/reference/Boot-Parameters) für die vollständige Syntax.

| Einstellung | Was bleibt in RAM bei `volatile` | Was bleibt auf persistentem Speicher |
|---|---|---|
| `LIVE_LOG_STORAGE` | Das systemd-Journal (maximal 32 MiB) und normale `/var/log` Dateien (32 MiB tmpfs). | Startprotokolle in `/var/log/minios/` und `/var/log/live/`, einschließlich drei früherer Protokollversionen. |
| `LIVE_APT_CACHE` | Heruntergeladene Pakete in `/var/cache/apt/archives` (256 oder 512 MiB tmpfs, je nach verfügbarem Speicher). | Paketstatus in `/var/lib/dpkg`, Repository-Listen in `/var/lib/apt/lists`, und installierte Dateien. |
| `LIVE_BROWSER_CACHE` | Ein gemeinsames 512-MiB-tmpfs für Standard-Cacheverzeichnisse von Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera und Yandex Browser im Home-Verzeichnis des Live-Nutzers `~/.cache`. Eine Systemrichtlinie deaktiviert den Festplatten-Cache von Firefox. | Profile, Cookies, Passwörter, Seitendaten und Caches anderer Anwendungen. |

APT- und Browser-RAM-Caches werden übersprungen, wenn weniger als 1 GiB verfügbar ist oder nicht-zRAM-Swap aktiv ist. Das APT-Archiv-tmpfs läuft nicht auf das Gerät über: Ein Download, der größer als die verbleibende Kapazität ist, kann fehlschlagen. Ein vorhandener Firefox-`policies.json` wird nicht ersetzt; prüfen Sie die Festplatten-Cache-Einstellung separat. Standardpfade nativer Browser werden nach der Erstellung des Live-Nutzers vorbereitet, auch wenn ein Browser später installiert wird. Eigene Pfade, Flatpak/Snap-Installationen und Nutzer, die nach diesem Setup angelegt werden, werden nicht automatisch umgeleitet. Bereits gespeicherte Browser-Caches werden durch die RAM-Mounts für diesen Start ausgeblendet und erscheinen wieder, wenn auf `persistent` zurückgeschaltet wird.

Startprotokolle bleiben unabhängig von der Einstellung für normale Protokolle auf dem beschreibbaren Persistenzspeicher; eine SquashFS-Sitzung hält sie außerhalb von `changes.sb`, sodass sie nicht vom Speichern des Snapshots beim Herunterfahren abhängen. Mit `volatile` verschwinden andere Dateien unter `/var/log` (einschließlich APT/dpkg-Textverlauf) beim Neustart. `EXPORT_LOGS=true` ist ein separater, expliziter Export auf das MiniOS-Medium. Ein volles 32-MiB-Protokoll-tmpfs nimmt keine neuen Protokolle mehr an, statt auf Flash auszuweichen. Wird später ein weiteres swap-basiertes Laufwerk aktiviert, können speicherbasierte Dateien dennoch dorthin ausgelagert werden. Siehe [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting#collecting-logs) zum Auffinden der Startdiagnose.

MiniOS verwendet ebenfalls `noatime` beim Einbinden eigener Daten- und Container-Dateisysteme, um Metadaten-Updates für Zugriffszeiten zu vermeiden; dies wirkt sich nicht auf andere Nutzerdatenträger aus. Standard-`relatime` begrenzt solche Updates ohnehin, daher messen Sie den Unterschied, bevor Sie dies als große Einsparung betrachten. Halten Sie das Dateisystem-Journal, Barrieren und `fsync` für ein entfernbares Persistenzmedium aktiviert.

Für einen kontrollierten 16-MiB-Protokollschreibvorgang gefolgt von `sync`, zeichnete eine Testo-VM 33.304 geschriebene Sektoren auf ihrer unteren virtuellen Festplatte im Persistenzmodus und 8 im Volatilmodus auf. Dies zeigt den Unterschied im Schreibpfad für diese Arbeitslast. Es misst jedoch keine Schreibvorgänge im USB-Flash-Controller und sagt nichts über die NAND-Lebensdauer aus. Vergleichen Sie identische Anwendungs-Workloads auf dem tatsächlichen Gerät, bevor Sie Rückschlüsse auf die Lebensdauer ziehen.
