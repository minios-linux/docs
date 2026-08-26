# Hardware-Kompatibilitätsleitfaden

Die Hardware-Unterstützung hängt von der MiniOS-Version und dem jeweiligen Image ab: Die zugrunde liegende Distribution, der Kernel, die Firmware, enthaltene Module und die Edition spielen alle eine Rolle. Prüfen Sie die Release-Beschreibung des heruntergeladenen Images und testen Sie eine frische Live-Session, bevor Sie Festplatten wechseln oder das Gerät für dauerhafte Arbeit nutzen.

## Systemanforderungen

Veröffentlichte MiniOS-PC-Images richten sich an die **amd64**-Architektur (64-Bit x86), sofern in der Release-Beschreibung nichts anderes angegeben ist. Der Ressourcenbedarf variiert je nach Image, Edition, Desktop, Anwendungen und Boot-Modus:

- Die CPU muss die Architektur des Images und den gewählten Firmware-Modus unterstützen.
- RAM muss für die gewählte Edition und Arbeitslast ausreichen. `toram`-Modi benötigen zusätzlich Speicher für kopierte Image-Daten.
- Das Boot-Medium muss genügend Speicherplatz für das heruntergeladene Image bieten. Für Persistenz, Benutzerdaten und eine native Installation ist zusätzlicher, beschreibbarer Speicher erforderlich.
- Die Grafik-Anforderungen hängen vom Desktop und den Anwendungen der gewählten Edition ab.

Das Schreiben eines Images auf ein größeres Gerät erzeugt nicht automatisch persistenten Speicher. Siehe [Boot-Modi](/configuration/Boot-Modes.md) für den maßgeblichen Leitfaden zum Live-Boot-Verhalten und [Schnellstart](/installation/Quick-Start.md) zur Vorbereitung des Mediums.

## Komponentenkompatibilität

### Prozessoren

Die Kompatibilität hängt von der Architektur und dem Kernel ab, die im gewählten Image enthalten sind. Prüfen Sie die Release Notes, wenn Sie einen aktuellen Prozessor oder CPU-Funktionen verwenden, die neuere Kernel-Unterstützung erfordern.

### Grafik

Die Grafikunterstützung hängt vom Kernel-Treiber, der Firmware und dem Userspace-Grafik-Stack im Image ab. Eine Karte kann grundlegende Bildausgabe bieten, ohne Hardware-Beschleunigung oder alle Anschlüsse zu unterstützen. Für manche NVIDIA-Hardware wird möglicherweise ein proprietärer Treiber benötigt, der in einem bestimmten Image nicht enthalten ist.

### Netzwerk

Ethernet- und WLAN-Unterstützung hängt vom Controller, Kernel-Treiber und der im Image enthaltenen Firmware ab. Testen Sie die Netzwerkfunktionalität in einer frischen Sitzung. Prüfen Sie bei WLAN zusätzlich, ob das Gerät Firmware oder einen externen Treiber benötigt, der in dieser Version nicht enthalten ist.

### Speicher

USB-, SATA-, NVMe-, IDE- und SD/MMC-Geräte funktionieren nur, wenn das gewählte Image einen Treiber für den Controller enthält und der Kernel das Gerät erkennt. Das Scannen im Initrd macht einen nicht unterstützten Controller nicht kompatibel. Siehe [Initrd-Systemerkennung](/configuration/Initrd-System-Discovery.md) für das genaue Suchverhalten im Live-Betrieb.

Live-Modus und nativer Modus haben unterschiedliche Boot-Pfade. Im Live-Modus wird der MiniOS-Datenbaum erkannt und schreibgeschützte Module im frühen Userspace zusammengefügt; der native Modus startet ein herkömmlich installiertes Root-System. Siehe [Initrd-Modulladung](/configuration/Initrd-Module-Loading.md) für das Modulhandling im Live-Betrieb und [MiniOS installieren](/installation/Installing-MiniOS.md) für die Unterschiede im Layout.

### Virtualisierung

MiniOS kann als Gast betrieben werden, wenn das gewählte Image Treiber für die im VM-Gast konfigurierten CPU-, Speicher-, Netzwerk- und Grafikgeräte enthält. Es gibt keine Garantie für die Unterstützung jedes Hypervisors oder Controller-Modells. VirtIO-, VMware-, Hyper-V- sowie emulierte IDE- oder SATA-Unterstützung müssen mit der jeweiligen Version abgeglichen und mit der spezifischen VM-Konfiguration getestet werden.

Gäste-Agenten und Desktop-Integrationswerkzeuge variieren ebenfalls je nach Edition und Image. Siehe die [Paketliste](/administration/Packages.md) und den [Virtualisierungsleitfaden](/administration/Virtualization.md), bevor Sie davon ausgehen, dass Zwischenablage-Freigabe, dynamische Auflösung, sauberes Herunterfahren oder Host-Kommunikation verfügbar sind.
