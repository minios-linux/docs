# Hardware-Kompatibilitätsleitfaden

Dieser Leitfaden bietet wichtige Informationen zur Hardware-Kompatibilität für MiniOS. Das System basiert auf Debian 13 „Trixie“ mit einem Long-Term Support (LTS) Linux-Kernel und gewährleistet dadurch eine breite Hardware-Unterstützung.

## Systemanforderungen

MiniOS ist für die **amd64** (64-Bit) Architektur entwickelt. Die Anforderungen unterscheiden sich je nach Edition:

**Für die Standard-Variante:**
- **CPU:** 1 GHz 64-Bit-Prozessor
- **RAM:** Mindestens 1 GB (2 GB empfohlen)
- **Speicher:** 2 GB zum Ausführen des Systems (4 GB+ für Datenspeicherung empfohlen)
- **Grafik:** VGA-kompatibler Grafikadapter

**Für die Toolbox-Variante:**
- **CPU:** 1,2 GHz 64-Bit-Prozessor
- **RAM:** Mindestens 2 GB (4 GB empfohlen)
- **Speicher:** 2 GB zum Ausführen des Systems (8 GB+ für Datenspeicherung empfohlen)
- **Grafik:** Grafikkarte mit Hardware-Beschleunigung

**Für die Ultra-Variante:**
- **CPU:** 1,5 GHz 64-Bit-Dual-Core-Prozessor
- **RAM:** Mindestens 4 GB (8 GB empfohlen)
- **Speicher:** 2 GB zum Ausführen des Systems (8 GB+ für Datenspeicherung empfohlen)
- **Grafik:** Moderne GPU mit Hardware-Beschleunigung

## Komponentenkompatibilität

### Prozessoren

Eine breite Auswahl an 64-Bit-x86-Prozessoren von Intel (Core i3/i5/i7/i9) und AMD (Ryzen 3/5/7/9) wird unterstützt.

### Grafik

- **Intel:** Integrierte Grafiklösungen (UHD, Iris Xe, Arc) werden sehr gut unterstützt.
- **NVIDIA:** Der Open-Source-Treiber Nouveau ist enthalten. Für moderne Karten wird für beste Leistung die Installation des proprietären Treibers empfohlen.
- **AMD:** Moderne Radeon RX Grafikkarten werden vollständig durch den Open-Source-Treiber AMDGPU unterstützt.

### Netzwerk

- **Ethernet:** Die meisten kabelgebundenen Controller von Intel, Realtek und Broadcom funktionieren direkt nach der Installation.
- **WLAN:** Eine große Auswahl an WLAN-Adaptern wird durch enthaltene Firmware und automatisch gebaute DKMS-Treiber unterstützt, insbesondere gängige Modelle von Intel, Atheros und Realtek.

### Speicher

MiniOS ist darauf ausgelegt, von verschiedenen Speichermedien zu starten. Die Startskripte des Systems durchsuchen automatisch alle verfügbaren Blockgeräte und ermöglichen so die Kompatibilität mit:

- **USB-Laufwerke:** Alle Generationen von USB werden unterstützt.
- **SATA/IDE-Laufwerke:** Alle gängigen internen Festplatten und SSDs.
- **NVMe-Laufwerke:** Volle Unterstützung für moderne NVMe-SSDs.
- **SD/MMC-Karten:** Unterstützt, sofern der Kartenleser vom Kernel erkannt wird.

### Virtualisierung

MiniOS ist vollständig für den Einsatz als Gastsystem in allen gängigen Virtualisierungsumgebungen optimiert. Der Build-Prozess integriert alle notwendigen Treiber in das initiale Ramdisk (`initrd`), um maximale Leistung direkt nach der Installation zu gewährleisten.

- **Hochleistungs-Treiber:** Unterstützung für paravirtualisierte Speichercontroller ist integriert, darunter **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI** und **Hyper-V Storvsc**. Dies ermöglicht nahezu native Festplatten-I/O-Leistung.
- **Breite Kompatibilität:** Das System kann auch von emulierten **IDE**- und **SATA**-Controllern booten und ist damit mit jeder Hypervisor-Konfiguration kompatibel.
- **Gasterweiterungen:** Für eine verbesserte Integration (wie nahtlose Mausunterstützung, Zwischenablage-Sharing und dynamische Auflösung) enthalten die Varianten `toolbox` und `ultra` `open-vm-tools` (für VMware) und `hyperv-daemons` (für Hyper-V).

Detaillierte Anleitungen zur Einrichtung und plattformspezifische Konfigurationen finden Sie im [Virtualisierungsleitfaden](/administration/Virtualization.md).
