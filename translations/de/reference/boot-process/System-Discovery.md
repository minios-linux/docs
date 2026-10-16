---
updated: 2026-10-15
---

# Systemerkennung

Diese Seite erklärt, welche Auswirkungen die Boot-Parameter `from`, `ip`, `cache`, `bext`, `toram` und `toram=full` haben. Sie richtet sich an Nutzer, die eigene Boot-Einträge, Netzwerk-Boot oder Fehlerbehebung benötigen. Die meisten Anwender können im Boot-Menü einen normalen Eintrag auswählen, ohne diese Parameter manuell zu setzen.

Nachdem der Bootloader den Kernel und das Initramfs geladen hat, muss das Initramfs den MiniOS Datenbaum finden, der die `.sb` Systemmodule bereitstellt. Dies geschieht, bevor der normale Userspace-Netzwerkstack, die Desktop-Umgebung und die persistente Sitzung aktiv sind.

## Einfach erklärt

MiniOS muss das Verzeichnis finden, das die Systemmodule enthält. Standardmäßig durchsucht es angeschlossene Laufwerke nach einem `minios/`-Verzeichnis. Der Parameter `from=` verweist auf ein anderes Verzeichnis oder eine ISO-Datei. Netzwerk-Parameter ersetzen diese lokale Suche durch einen HTTP-ISO- oder PXE-Download.

Das Finden eines Laufwerks beweist nicht, dass das Modul-Set vollständig ist, und das Auffinden der Systemdateien aktiviert keine Persistenz. Diese Schritte erfolgen separat beim Start.

## Parameter erklärt

| Parameter | Was MiniOS angibt | Typische Verwendung |
|---|---|---|
| `from=PATH` | Sucht nach MiniOS in einem bestimmten Verzeichnis oder einer ISO, anstatt die erste passende lokale Quelle zu akzeptieren. | Eine ISO, die auf einer Festplatte gespeichert ist, starten oder ein nicht standardmäßiges Verzeichnis verwenden. |
| `from=askdisk` | Einen interaktiven Auswahldialog für die Partition öffnen, die MiniOS enthält. | Mehrere angeschlossene Laufwerke enthalten mögliche Quellen. |
| `from=http://...` | Eine ISO von einem einfachen HTTP-Server einbinden. | Kontrollierter Netzwerk-Boot, wobei das laufende System weiterhin vom Server abhängig sein kann. |
| `ip=...` | Frühes statisches Netzwerk verwenden. Ohne HTTP`from=` wird PXE-Datenübertragung gewählt und lokale Laufwerke werden übersprungen. | PXE-Bereitstellung oder statische Adressierung für eine HTTP-ISO. |
| `cache=MB` | Einen httpfs-Cache für eine HTTP-ISO reservieren. Es wird nicht garantiert, dass die komplette ISO heruntergeladen wird. | Wiederholte Lesezugriffe von einer HTTP-Quelle reduzieren. |
| `bext=EXTENSION` | Nach Modul-Dateinamen mit einer anderen Erweiterung suchen anstelle von`.sb`. | Nur für spezialisierte Images; Module werden dabei nicht konvertiert. |
| `toram` oder `toram=full` | Kopiert die gefundenen MiniOS Systemdaten, einschließlich versteckter Einträge auf oberster Ebene, aber ohne`changes/`, nach RAM und versucht, die Quelle zu trennen. Für das Kopieren von Sitzungen wird`perchtoram` separat verwendet. Die Kurzform bedeutet`full`. | RAM-Vorgang auf einem Rechner mit ausreichend Arbeitsspeicher. |

Wenn ein lokaler USB-Boot vor dem Erscheinen des Desktops stoppt, entfernen Sie zunächst benutzerdefinierte`from=` und`ip=` Werte. Ein versehentlich nicht leerer`ip=` verhindert die Erkennung lokaler Laufwerke, während ein falscher`from=` dazu führen kann, dass MiniOS nach einem nicht vorhandenen Pfad sucht.

## Quell-Priorität

Die Quellenauswahl folgt einer festen Reihenfolge:

1. Ein expliziter `from=http://...`-Wert wählt eine HTTP-ISO aus.
2. Andernfalls wählt jeder nicht-leere `ip=`-Wert den PXE-Download.
3. Andernfalls öffnet `from=askdisk` oder `from=askdisk:...` den Festplattenauswahldialog.
4. Andernfalls durchsucht das Initramfs lokale Blockgeräte.

Die beiden Netzwerkpfade fallen nicht auf lokale Medien zurück. Nach einem HTTP-ISO- oder PXE-Versuch liefert die Erkennung dieses Netzwerkergebnis zurück, anstatt Festplatten zu testen; ein unbrauchbares oder unvollständiges Ergebnis schlägt bei der Validierung oder späteren Einrichtung fehl.

Diese Reihenfolge hat zwei wichtige Konsequenzen:

- `from=http://...` hat Vorrang vor `ip=`. Der optionale `ip=` liefert dann statische Adressdaten für die HTTP-ISO-Verbindung.
- Ein nicht-leerer `ip=` hat Vorrang vor jedem lokalen `from=`-Wert, einschließlich Gerät, Verzeichnis, ISO-Pfad oder `askdisk`. Verwenden Sie `ip=` nicht nur, um das Netzwerk eines lokal gebooteten Systems zu konfigurieren.

## Lokale Erkennung

Ohne eine HTTP-Quelle oder ein nicht-leeres `ip=`, führt MiniOS 45 Erkennungsdurchläufe durch, etwa einen pro Sekunde. Bei jedem Durchlauf werden die Gerätenodes aktualisiert und Blockgeräte-Kandidaten von `blkid`abgerufen. Falls `/dev/mapper/ventoy`vorhanden ist, wird diese ISO-Zuordnung zuerst versucht; die übrigen Kandidaten werden nach Gerätename sortiert und Duplikate entfernt. Die erste passende MiniOS-Quelle wird beibehalten. Dadurch wird verhindert, dass Ersatzmodule auf der Ventoy-Datenpartition mit der Haupt-ISO-Quelle verwechselt werden.

Wenn `from=`leer ist, wird auf jedem Dateisystem der Pfad `minios`überprüft. Eine Quelle gilt als geeignet, wenn entweder dieses Verzeichnis oder das unmittelbare `modules/`Unterverzeichnis mindestens eine Datei mit der Erweiterung `.sb`(Standard) enthält. Der `bext=`Parameter ändert die für diesen Test verwendete Erweiterung. Die Erkennung prüft nicht, ob das gefundene Modul-Set vollständig oder bootfähig ist.

Jeder Kandidat wird zunächst im Nur-Lese-Modus eingebunden. Nachdem er als geeignet erkannt wurde, versucht MiniOS, das ausgewählte Datenlaufwerk beschreibbar zu machen; kann dies jedoch nicht erfolgen, wird eine ansonsten gültige Quelle trotzdem akzeptiert.

### Lokale `from=`-Formen

Ein gewöhnlicher relativer oder absolut aussehender Pfad wird innerhalb jedes Kandidaten-Dateisystems interpretiert. Führende Schrägstriche werden bei der Pfaderstellung normalisiert, sodass beide Varianten dasselbe Verzeichnis suchen:

```text
from=minios
from=/minios
```

Handelt es sich beim angeforderten Pfad um eine reguläre Datei auf einem Kandidaten-Dateisystem, behandelt MiniOS diese als ISO, mountet sie im Read-Only-Modus per Loopback und prüft das `minios`-Verzeichnis innerhalb der ISO:

```text
from=/images/minios.iso
```

Gerätequalifizierte Pfade unterstützen nur folgende Formen:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` unterstützt einen einfachen Gerätenamen gefolgt von einem Pfad. Die Label-Form muss exakt `/dev/disk/by-label/LABEL/path` sein; das Label wird mit `blkid` aufgelöst, dann wird der restliche Pfad auf diesem Dateisystem geprüft.

Es gibt keinen entsprechenden Parser für UUID-, PARTUUID- oder by-id-Pfade. Formen wie die folgenden werden nicht unterstützt:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Interaktive Auswahl

Verwenden Sie `askdisk`, um eine Partition auszuwählen und anschließend einen Pfad darauf zu prüfen:

```text
from=askdisk
from=askdisk:custom:dir
```

Die erste Form prüft `minios` auf der gewählten Partition. In der zweiten Form werden Doppelpunkte zu Pfadtrennern, sodass `askdisk:custom:dir` den Pfad `custom/dir` prüft.
Schrägstrich-Syntax wie `from=askdisk/custom/dir` öffnet zwar ebenfalls den Auswahldialog, verliert jedoch stillschweigend den benutzerdefinierten Pfad und prüft `minios`; verwenden Sie diese daher nicht.

Die angezeigte Geräteliste wird während des geöffneten Auswahldialogs aktualisiert und schließt Swap-Dateisysteme aus. Die Auswahl führt dennoch die normale Modul-Prüfung durch; eine gewählte Partition allein genügt nicht.

## HTTP-ISO

Eine HTTP-ISO-Quelle hat folgendes Format:

```text
from=http://server.example/path/minios.iso
```

Es wird nur einfaches HTTP erkannt. HTTPS und andere URL-Schemata werden nicht unterstützt.
Das Initramfs sucht die erste erkannte Nicht-Loopback-Netzwerkschnittstelle, aktiviert das Netzwerk und mountet die entfernte ISO über `httpfs2`. Die Schnittstellenauswahl prüft nicht, ob eine Verbindung besteht, erreichbar ist oder ob dies die tatsächlich nutzbare Schnittstelle auf einem Multi-NIC-System ist.

Wenn `ip=` fehlt, fordert der HTTP-ISO-Boot per DHCP mit `udhcpc` eine Adresse an. Ist `ip=` vorhanden, werden die statischen Felder verwendet, wie sie vom PXE-Parser erwartet werden:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Beim HTTP-ISO-Boot bestimmt weiterhin die URL den HTTP-Server. Die statischen Felder konfigurieren die Client-Adresse, Netzmaske, Standard-Gateway und frühe DNS-Einträge; das optionale Port-Feld gehört zum PXE-Dateidownload und ersetzt nicht den Port in der ISO-URL.

`cache=<MB>` aktiviert einen httpfs-Cache der gewünschten Größe im `/tmp`. Es handelt sich um einen Cache, nicht um einen garantiert vollständigen Download. Das laufende System bleibt auf die entfernte ISO und das Netzwerk angewiesen, sofern keine erfolgreiche RAM-Kopie die Quelle trennt.

## PXE-Datendownload

Jeder nicht-leere `ip=` wählt den PXE-Datendownload, sofern nicht zuvor `from=http://...` ausgewählt wurde. Die unterstützte Syntax ist:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Die Netzmaske wird in punktierter IPv4-Notation angegeben. Der optionale HTTP-Port ist standardmäßig `7529`.
Generische Kernel- oder Dracut-Formen wie `ip=dhcp` und `ip=:::::eth0:dhcp` werden nicht unterstützt. PXE-Datendownload selbst bietet in diesem Parser keine DHCP-Form.

MiniOS konfiguriert die erste erkannte Nicht-Loopback-Schnittstelle, ohne zu prüfen, ob eine funktionierende Verbindung besteht. Zuerst werden `PXEFILELIST` und die aufgelisteten MiniOS-Dateien per HTTP vom Server-Feld angefordert. TFTP ist ein begrenztes Fallback: Es wird nur gewählt, wenn die erste HTTP-Anfrage für `PXEFILELIST` fehlschlägt. Es handelt sich nicht um ein allgemeines Schnittstellen-Failover, keinen lokalen Medien-Fallback oder eine Wiederherstellung bei jedem teilweisen HTTP-Download-Fehler.

## Kopieren und Trennen mit `toram=full`

`toram=full` ist für die Erkennung relevant, da dadurch die fortlaufende Abhängigkeit von der gewählten Quelle aufgehoben werden kann. Nach der Erkennung der Quelle und eines externen MiniOS-Baums werden Systemdaten in RAM kopiert und anschließend versucht, die Quelle auszuhängen und die RAM-Kopie an deren Stelle zu verschieben. Nur ein erfolgreiches Aushängen und Verschieben trennt diese Quelle vollständig; ISO-Host-Dateisysteme und Ventoy-Zuordnungen müssen ebenfalls freigegeben werden.

Strikte Einschränkungen:

- Es gibt keine Vorabprüfung, ob der verfügbare RAM ausreichend Platz für die Kopie bietet.
- Das vollständige Systemkopieren umfasst versteckte Einträge auf oberster Ebene und lässt `changes/` unabhängig davon aus, ob Persistenz angefordert wurde, aus. Ein erkannter externer MiniOS-Baum wird über den Quellbaum kopiert, einschließlich Ersatzmodulen.
- Unterstützte Sitzungscontainer werden separat mit `perchtoram=trim|full` kopiert; `perchtoram=off` behält die Speicherabhängigkeit bei. Native Sitzungen haben eine separate Einschränkung, die unter [Boot-Modi](/using-minios/Boot-Modes).
- Fehler beim Systemkopieren führen zum fatalen initramfs-Pfad. Ein Fehlschlag beim Aushängen oder Verschieben kann dazu führen, dass die ursprüngliche Quelle weiterhin eingehängt bleibt, während der Bootvorgang den RAM-Staging-Pfad verwendet. Gehen Sie nicht davon aus, dass `toram=full` das Entfernen oder den Netzwerkverlust sicher macht; prüfen Sie die Trennung.

Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals) bevor Sie `toram` mit `perch` oder `perchdir` kombinieren.

## Fehler und Diagnose

Wenn alle 45 lokalen Durchläufe fehlschlagen, geht MiniOS in den fatalen Fehlerpfad und öffnet eine Initramfs-Shell, anstatt das Live-System zu starten. Netzwerkpfade führen keine 45 lokalen Suchdurchläufe durch und fallen nicht auf lokale Medien zurück; je nach Teilergebnis können sie an der Datenprüfung oder späteren Einrichtung scheitern. Das Verlassen einer fatalen Shell behebt die fehlende Quelle nicht und kann lediglich dazu führen, dass spätere Fehler weniger eindeutig auftreten.

Nützliche Diagnose-Parameter sind:

- `debug` aktiviert Shell-Tracing, zusätzliche Diagnosen und interaktive Shells an mehreren Initramfs-Prüfpunkten. Verlassen Sie eine Prüfpunktshell, um fortzufahren.
- `timing` zeigt die verstrichene Zeit zwischen den Initramfs-Phasen und eine Gesamtsumme an.
- `rd.break` fordert eine Initramfs-Shell kurz vor der Übergabe an das echte Root-Dateisystem an; verlassen Sie sie, um den Bootvorgang fortzusetzen.

In einer Shell können Sie `/proc/cmdline`, `/proc/net/dev`, `blkid`, eingehängte Dateisysteme und `/var/log/livedbg` inspizieren. Beginnen Sie mit den exakten `from=`, `ip=` und `bext=`-Werten, die in `/proc/cmdline` angezeigt werden.

## Verwandte Dokumentation

- [Boot-Modi](/using-minios/Boot-Modes)
- [Modulladen](/reference/boot-process/Module-Loading)
- [Persistenz](/reference/boot-process/Persistence-Internals)
- [Netzwerk-Boot](/reference/boot-process/Network-Boot)
- [Boot-Parameter](/reference/Boot-Parameters)
- [Fehlerbehebung](/maintenance-and-recovery/Troubleshooting)
