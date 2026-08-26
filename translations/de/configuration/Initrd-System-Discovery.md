# Initrd-Systemerkennung

Nachdem der Bootloader den Kernel und das initramfs geladen hat, muss das initramfs den MiniOS-Datenbaum finden, der die `.sb` Systemmodule bereitstellt. Dies geschieht, bevor der normale Userspace-Netzwerkstack, der Desktop und die persistente Sitzung aktiv sind.

## Quell-Priorität

Die Quellauswahl folgt einer festen Reihenfolge:

1. Ein expliziter `from=http://...` Wert wählt ein HTTP-ISO.
2. Andernfalls wählt jeder nicht-leere `ip=` Wert den PXE-Download.
3. Andernfalls öffnen `from=askdisk` oder `from=askdisk:...` den Plattenauswahldialog.
4. Andernfalls durchsucht das initramfs lokale Blockgeräte.

Die beiden Netzwerkpfade fallen nicht auf lokale Medien zurück. Nach einem HTTP-ISO- oder PXE-Versuch gibt die Erkennung dieses Netzwerkergebnis zurück, anstatt Festplatten zu testen; ein unbrauchbares oder unvollständiges Ergebnis schlägt bei der Validierung oder späteren Einrichtung fehl.

Diese Reihenfolge hat zwei wichtige Konsequenzen:

- `from=http://...` hat Vorrang vor `ip=`. Die optionale `ip=` liefert dann die statische Adressierung für die HTTP-ISO-Verbindung.
- Ein nicht-leerer `ip=` hat Vorrang vor jedem lokalen `from=` Wert, einschließlich eines Geräts, Verzeichnisses, ISO-Pfads oder `askdisk`. Verwenden Sie `ip=` nicht nur, um das Netzwerk eines lokal gebooteten Systems zu konfigurieren.

## Lokale Erkennung

Ohne eine HTTP-Quelle oder einen nicht-leeren `ip=` führt MiniOS 45 Erkennungsläufe durch, etwa einen pro Sekunde. Jeder Durchlauf aktualisiert die Gerätenodes, ermittelt Blockgeräte-Kandidaten aus `blkid`, sortiert deren Gerätenamen und testet sie in dieser Reihenfolge. Der erste Kandidat mit einer passenden MiniOS-Quelle wird beibehalten; spätere Geräte werden nicht mehr berücksichtigt.

Ist `from=` leer, wird auf jedem Dateisystem der Pfad `minios` getestet. Eine Quelle gilt als passend, wenn entweder dieses Verzeichnis oder dessen direktes `modules/` Unterverzeichnis mindestens eine Datei mit der Standard-Endung `.sb` enthält. Der Parameter `bext=` ändert die für diesen Test verwendete Endung. Die Erkennung prüft nicht, ob das gefundene Modulset vollständig oder bootfähig ist.

Jeder Kandidat wird zunächst schreibgeschützt eingehängt. Nachdem er als passend erkannt wurde, versucht MiniOS, das ausgewählte Daten-Mount schreibbar zu machen; kann dies nicht erfolgen, wird eine ansonsten gültige Quelle dennoch akzeptiert.

### Lokale `from=`-Formen

Ein gewöhnlicher relativer oder absolut wirkender Pfad wird innerhalb jedes Kandidaten-Dateisystems interpretiert. Führende Schrägstriche werden bei der Pfadkonstruktion normalisiert, sodass beide nach demselben Verzeichnis suchen:

```text
from=minios
from=/minios
```

Ist der angeforderte Pfad eine reguläre Datei auf einem Kandidaten-Dateisystem, behandelt MiniOS diese als ISO, bindet sie schreibgeschützt als Loop ein und prüft das `minios`-Verzeichnis innerhalb des ISOs:

```text
from=/images/minios.iso
```

Gerätequalifizierte Pfade unterstützen nur diese Formen:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` unterstützt einen einfachen Gerätenamen gefolgt von einem Pfad. Die Label-Form muss exakt `/dev/disk/by-label/LABEL/path` sein; das Label wird mit `blkid` aufgelöst, danach wird der verbleibende Pfad auf diesem Dateisystem geprüft.

Es gibt keinen entsprechenden Parser für UUID-, PARTUUID- oder by-id-Pfade. Formen wie die folgenden werden nicht unterstützt:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Interaktive Auswahl

Verwenden Sie `askdisk`, um eine Partition auszuwählen und dann einen Pfad darauf zu testen:

```text
from=askdisk
from=askdisk:custom:dir
```

Die erste Form prüft `minios` auf der gewählten Partition. In der zweiten Form werden Doppelpunkte zu Pfadtrennern, sodass `askdisk:custom:dir` `custom/dir` prüft.
Schrägstrich-Syntax wie `from=askdisk/custom/dir` öffnet zwar ebenfalls den Selektor, verliert aber stillschweigend den benutzerdefinierten Pfad und prüft `minios`; verwenden Sie diese daher nicht.

Die angezeigte Geräteliste wird während der Selektor geöffnet ist aktualisiert und schließt Swap-Dateisysteme aus. Die Auswahl führt weiterhin den normalen Modul-Prüftest durch; eine gewählte Partition allein ist nicht ausreichend.

## HTTP-ISO

Eine HTTP-ISO-Quelle hat folgendes Format:

```text
from=http://server.example/path/minios.iso
```

Es wird nur einfaches HTTP erkannt. HTTPS und andere URL-Schemata werden nicht unterstützt.
Das initramfs sucht die erste erkannte Nicht-Loopback-Netzwerkschnittstelle, aktiviert das Netzwerk und bindet das entfernte ISO über `httpfs2` ein. Die Schnittstellenauswahl prüft weder Link, Erreichbarkeit noch ob diese Schnittstelle auf einem Multi-NIC-System die tatsächlich nutzbare ist.

Wenn `ip=` fehlt, fordert der HTTP-ISO-Boot DHCP mit `udhcpc` an. Ist `ip=` vorhanden, werden die statischen Felder verwendet, wie sie vom PXE-Parser erwartet werden:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Für den HTTP-ISO-Boot bestimmt weiterhin die URL den HTTP-Server. Die statischen Felder konfigurieren die Client-Adresse, Netzmaske, das Standard-Gateway und frühe DNS-Einträge; das optionale Port-Feld gehört zum PXE-Dateidownload und ersetzt nicht den Port in der ISO-URL.

`cache=<MB>` aktiviert einen httpfs-Cache der gewünschten Größe in `/tmp`. Es handelt sich um einen Cache, nicht um einen garantiert vollständigen Download. Das laufende System bleibt weiterhin vom entfernten ISO und Netzwerk abhängig, es sei denn, eine erfolgreiche RAM-Kopie trennt die Quelle.

## PXE-Datendownload

Jeder nicht-leere `ip=` wählt den PXE-Datendownload, sofern nicht zuvor `from=http://...` ausgewählt wurde. Die unterstützte Syntax ist:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Die Netzmaske ist in punktierter IPv4-Notation anzugeben. Der optionale HTTP-Port ist standardmäßig `7529`.
Generische Kernel- oder dracut-Formen wie `ip=dhcp` und `ip=:::::eth0:dhcp` werden nicht unterstützt. PXE-Datendownload selbst bietet in diesem Parser keine DHCP-Form.

MiniOS konfiguriert die erste erkannte Nicht-Loopback-Schnittstelle, ohne zu prüfen, ob eine funktionierende Verbindung besteht. Zuerst wird `PXEFILELIST` und die aufgelisteten MiniOS-Dateien per HTTP vom Server-Feld angefordert. TFTP ist ein begrenztes Fallback: Es wird nur ausgewählt, wenn die initiale HTTP-Anfrage für `PXEFILELIST` fehlschlägt. Es handelt sich nicht um ein generelles Interface-Failover, keinen lokalen Medien-Fallback und keine Wiederherstellung bei jedem teilweisen HTTP-Download-Fehler.

## Kopieren und Trennen mit `toram=full`

`toram=full` ist für die Erkennung relevant, da dadurch die fortlaufende Abhängigkeit von der gewählten Quelle entfallen kann. Nach der Erkennung kopiert MiniOS den Datenbaum in den RAM und versucht anschließend, die Quelle auszuhängen und die RAM-Kopie an deren Stelle zu verschieben. Nur ein erfolgreiches Aushängen und Verschieben trennt lokale Medien, ein Loop-gemountetes ISO oder ein HTTP-ISO.

Wichtige Einschränkungen:

- Es gibt keine Vorabprüfung, ob der verfügbare RAM für die Kopie ausreicht.
- Wird Persistenz angefordert, lässt die Top-Level-`*`-Kopie Punktdateien aus.
- Wird keine Persistenz angefordert, wird der Eintrag `changes` bewusst ausgelassen. Dieser Zweig kopiert andere Top-Level-Einträge, einschließlich Punktdateien.
- Ein Fehler beim Kopieren, Aushängen oder Verschieben kann dazu führen, dass die Originalquelle weiterhin eingehängt bleibt. Gehen Sie nicht davon aus, dass die Angabe von `toram=full` das Entfernen von Medien oder den Netzwerkverlust sicher macht; prüfen Sie, ob die Trennung erfolgreich war.

Lesen Sie [Initrd-Persistenz](/configuration/Initrd-Persistence.md), bevor Sie `toram` mit `perch` oder `perchdir` kombinieren.

## Fehler und Diagnose

Wenn alle 45 lokalen Durchläufe fehlschlagen, geht MiniOS in den Fatal-Error-Pfad und öffnet eine initramfs-Shell, anstatt das Live-System zu starten. Netzwerkpfade führen keine 45 lokalen Suchdurchläufe durch und greifen nicht auf lokale Medien zurück; je nach Teilergebnis können sie an der Datenprüfung oder späteren Einrichtung scheitern. Das Verlassen einer Fatal-Shell behebt die fehlende Quelle nicht und kann lediglich dazu führen, dass die spätere Einrichtung weniger eindeutig fehlschlägt.

Nützliche Diagnoseparameter sind:

- `debug` aktiviert Shell-Tracing, zusätzliche Diagnosen und interaktive Shells an mehreren initramfs-Checkpoints. Verlassen Sie eine Checkpoint-Shell, um fortzufahren.
- `timing` zeigt die verstrichene Zeit zwischen den initramfs-Phasen und eine Gesamtsumme an.
- `rd.break` fordert eine initramfs-Shell kurz vor der Übergabe an das echte Root-Dateisystem an; verlassen Sie diese, um den Bootvorgang fortzusetzen.

In einer Shell können Sie `/proc/cmdline`, `/proc/net/dev`, `blkid`, eingehängte Dateisysteme und `/var/log/livedbg` inspizieren. Beginnen Sie mit den exakten `from=`, `ip=` und `bext=` Werten, wie sie in `/proc/cmdline` angezeigt werden.

## Verwandte Dokumentation

- [Boot-Modi](/configuration/Boot-Modes.md)
- [Modulladen](/configuration/Initrd-Module-Loading.md)
- [Persistenz](/configuration/Initrd-Persistence.md)
- [Netzwerk-Boot](/installation/Network-Boot.md)
- [Boot-Parameter](/configuration/Boot-Parameters.md)
- [Fehlerbehebung](/administration/Troubleshooting.md)
