---
updated: 2026-08-28
---

# Systemerkennung

Diese Seite erklärt, welche Auswirkungen die Boot-Parameter `from`, `ip`, `cache`, `bext`, `toram` und `toram=full` haben. Sie richtet sich an Nutzer, die eigene Boot-Einträge, Netzwerk-Boot oder Fehlerbehebung benötigen. Die meisten Anwender können im Boot-Menü einen normalen Eintrag auswählen, ohne diese Parameter manuell zu setzen.

Nachdem der Bootloader den Kernel und das Initramfs geladen hat, muss das Initramfs den MiniOS Datenbaum finden, der die `.sb` Systemmodule bereitstellt. Dies geschieht, bevor der normale Userspace-Netzwerkstack, die Desktop-Umgebung und die persistente Sitzung aktiv sind.

## Einfach erklärt

MiniOS muss das Verzeichnis finden, das die Systemmodule enthält. Standardmäßig durchsucht es angeschlossene Laufwerke nach einem `minios/`-Verzeichnis. Der Parameter `from=` verweist auf ein anderes Verzeichnis oder eine ISO-Datei. Netzwerk-Parameter ersetzen diese lokale Suche durch einen HTTP-ISO- oder PXE-Download.

Das Finden eines Laufwerks beweist nicht, dass das Modul-Set vollständig ist, und das Auffinden der Systemdateien aktiviert keine Persistenz. Diese Schritte erfolgen separat beim Start.

## Parameter erklärt

| Parameter | Was es MiniOS mitteilt | Typische Verwendung |
|---|---|---|
| `from=PATH` | Sucht nach MiniOS in einem bestimmten Verzeichnis oder einer ISO, anstatt die erste passende lokale Quelle zu akzeptieren. | Starten einer ISO, die auf einem Laufwerk gespeichert ist, oder Verwendung eines nicht standardmäßigen Verzeichnisses. |
| `from=askdisk` | Öffnet einen interaktiven Auswahldialog für die Partition, die MiniOS enthält. | Mehrere angeschlossene Laufwerke enthalten mögliche Quellen. |
| `from=http://...` | Bindet eine ISO von einem einfachen HTTP-Server ein. | Kontrollierter Netzwerk-Boot, bei dem das laufende System weiterhin auf den Server angewiesen sein kann. |
| `ip=...` | Verwendet frühes statisches Netzwerk. Ohne einen HTTP-`from=` wird der PXE-Datendownload gewählt und lokale Laufwerke werden übersprungen. | PXE-Bereitstellung oder statische Adressierung für eine HTTP-ISO. |
| `cache=MB` | Reserviert einen httpfs-Cache für eine HTTP-ISO. Es wird nicht garantiert, dass die komplette ISO heruntergeladen wird. | Wiederholte Lesezugriffe von einer HTTP-Quelle reduzieren. |
| `bext=EXTENSION` | Sucht nach Moduldateinamen mit einer anderen Erweiterung anstelle von `.sb`. | Nur für spezielle Images; wandelt keine Module um. |
| `toram` oder `toram=full` | Kopiert den gesamten gefundenen MiniOS-Datenbaum in RAM und versucht, die Quelle zu trennen. Die Kurzform bedeutet `full`. | Temporäre RAM-Operation auf einem Rechner mit genügend Speicher. |

Wenn ein lokaler USB-Boot abbricht, bevor der Desktop erscheint, entfernen Sie zuerst benutzerdefinierte `from=`- und `ip=`-Werte. Ein versehentlich nicht-leerer `ip=` verhindert die Erkennung von lokalen Laufwerken, während ein falscher `from=` dazu führen kann, dass MiniOS nach einem Pfad sucht, der nicht vorhanden ist.

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

Ohne HTTP-Quelle oder nicht-leeren `ip=` führt MiniOS 45 Erkennungspässe durch, etwa einen pro Sekunde. Jeder Durchlauf aktualisiert die Gerätenodes, ermittelt Blockgeräte-Kandidaten aus `blkid`, sortiert deren Gerätenamen und prüft sie in dieser Reihenfolge. Der erste Kandidat mit einer passenden MiniOS-Quelle wird übernommen; weitere Geräte werden nicht berücksichtigt.

Ist `from=` leer, wird auf jedem Dateisystem der Pfad `minios` geprüft. Eine Quelle gilt als qualifiziert, wenn entweder dieses Verzeichnis oder dessen direktes `modules/`-Unterverzeichnis mindestens eine Datei mit der Standard-Endung `.sb` enthält. Der Parameter `bext=` ändert die für diesen Test verwendete Endung. Die Erkennung prüft nicht, ob das gefundene Modul-Set vollständig oder bootfähig ist.

Jeder Kandidat wird zunächst im Read-Only-Modus eingehängt. Nach der Qualifizierung versucht MiniOS, das ausgewählte Datenlaufwerk beschreibbar zu mounten; das Scheitern daran führt jedoch nicht zum Ausschluss einer ansonsten gültigen Quelle.

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

`toram=full` ist für die Erkennung relevant, da dadurch die fortlaufende Abhängigkeit von der gewählten Quelle aufgehoben werden kann. Nach der Erkennung kopiert MiniOS den Datenbaum nach RAM und versucht dann, die Quelle auszuhängen und die RAM-Kopie an deren Stelle zu verschieben. Nur ein erfolgreiches Aushängen und Verschieben trennt lokale Medien, eine loop-gemountete ISO oder eine HTTP-ISO.

Wichtige Einschränkungen:

- Es gibt keine Vorabprüfung, ob der verfügbare RAM für die Kopie ausreicht.
- Bei angeforderter Persistenz werden beim Kopieren auf oberster Ebene `*` keine Dotfiles übernommen.
- Ohne Persistenz wird der `changes`-Eintrag absichtlich ausgelassen. Dieser Zweig kopiert andere Top-Level-Einträge, einschließlich Dotfiles.
- Ein Fehler beim Kopieren, Aushängen oder Verschieben kann dazu führen, dass die Originalquelle eingehängt bleibt. Gehen Sie nicht davon aus, dass die Angabe von `toram=full` das Entfernen von Medien oder einen Netzwerkausfall sicher macht; prüfen Sie, ob das Trennen erfolgreich war.

Siehe [Initrd-Persistenz](/reference/boot-process/Persistence-Internals), bevor Sie `toram` mit `perch` oder `perchdir` kombinieren.

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
