---
updated: 2026-08-31
---

# Hardware-Kompatibilität

MiniOS ist dafür konzipiert, auf verschiedenen x86-Computern zu laufen, statt an eine bestimmte Maschine gebunden zu sein. Der zuverlässigste Kompatibilitätstest besteht daher darin, das tatsächliche MiniOS-Abbild auf der Zielhardware zu starten und die Geräte zu prüfen, die Sie verwenden möchten.

Die Hardware-Unterstützung hängt vom gewählten Abbild ab: Architektur, Basis-Distribution, Kernel, Firmware, Treiber, Desktop und Edition spielen alle eine Rolle. Ein neueres oder anderes MiniOS-Abbild kann Hardware unterstützen, die von einer älteren Version nicht abgedeckt wird.

## Architektur

MiniOS unterstützt sowohl 64-Bit- als auch 32-Bit-x86-Systeme:

| Abbild-Architektur | Verwendung |
|---|---|
| **amd64** | 64-Bit-x86-Computer |
| **i386** | Unterstützte 32-Bit-x86-Computer |

Verwenden Sie die Architektur, die im Abbildnamen und in der Release-Beschreibung angegeben ist. Die Verfügbarkeit von 32-Bit-Abbildern hängt von der MiniOS-Version und der Basis-Distribution ab.

## Firmware und Boot

MiniOS PC-Abbilder können sowohl über Legacy-BIOS als auch UEFI booten, sofern die erforderlichen Boot-Dateien im gewählten Abbild enthalten sind. Firmware-Implementierungen unterscheiden sich stark, daher kann dasselbe USB-Gerät im Boot-Menü auf verschiedenen Rechnern unterschiedlich erscheinen.

Aktuelle 64-Bit-MiniOS-Abbilder verwenden den Debian-Kernel und Debian-EFI-Komponenten.
Daher wird **Secure Boot** auf amd64-Systemen unterstützt.

Die 32-Bit-i386-Abbilder nutzen einen von MiniOS gebauten Kernel, da Debian keine 32-Bit-Kernelpakete mehr veröffentlicht. Dieser Kernel ist identisch mit dem entsprechenden Debian-Kernel, wird aber von MiniOS gebaut und ist nicht Teil der signierten Debian-Bootkette. Daher **wird Secure Boot von i386-MiniOS-Abbildern nicht unterstützt**.

## Arbeitsspeicher

Der empfohlene Mindestwert für den Arbeitsspeicher hängt von der Edition ab:

| Edition | Empfohlener Mindestwert an RAM |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

Diese Werte gelten für den normalen Betrieb vom Boot-Medium aus. Tatsächliche Anwendungen können mehr Speicher benötigen.

**Run from RAM** benötigt zusätzlichen Speicher, da die MiniOS-Daten zusammen mit dem laufenden System und den Anwendungen in den RAM kopiert werden. Größere Abbilder benötigen in diesem Modus daher deutlich mehr Speicher.

Siehe [Boot-Modi](/using-minios/Boot-Modes), bevor Sie **Run from RAM** auf einem speicherbeschränkten Rechner verwenden.

## Grafik

Aktuelle amd64-MiniOS-Abbilder verwenden den Debian-Grafikstack mit Xorg und Mesa.
Der Kernel enthält Intel `i915` und `xe`, AMD `amdgpu` und `radeon` sowie den Open-Source-NVIDIA-Treiber `nouveau`.

Xorg enthält seinen generischen `modesetting`-Treiber zusammen mit Intel-, AMD/ATI-, Radeon-, Nouveau-, VESA- und Framebuffer-Treibern. Mesa stellt den üblichen 3D-Beschleunigungsstack für Intel, AMD und unterstützte Open-Source-Treiber bereit.

Debian-basierte MiniOS-Abbilder installieren die Debian-Firmware-Sammlungen zusammen mit herstellerspezifischen Firmware-Paketen. Das aktuelle Trixie Standard-Abbild enthält `firmware-amd-graphics` und `firmware-misc-nonfree`; Ubuntu-basierte Abbilder verwenden stattdessen `linux-firmware`.

Die gepflegten MiniOS-Paketlisten enthalten den proprietären NVIDIA-Kernel-Treiber nicht. NVIDIA-Hardware verwendet daher standardmäßig den enthaltenen `nouveau`-Treiber. Hardware oder Funktionen, die explizit den proprietären NVIDIA-Treiber benötigen, müssen diesen separat hinzufügen.

Virtuelle Grafik wird ebenfalls durch Kernel- und Xorg-Treiber für gängige VMware-, QXL-, Bochs- und Hyper-V-Geräte abgedeckt.

## Netzwerktechnik

Aktuelle amd64-MiniOS-Abbilder verwenden den Debian-Kernel mit seinem üblichen Satz an Netzwerktreibern. Der in aktuellen Trixie-Abbildern verwendete 6.12-Kernel enthält Treiber für gängige Intel-, Realtek-, Broadcom-, Atheros-, MediaTek-, Ralink-, Marvell- und weitere Ethernet- und WLAN-Hardware.

Zu den gängigen Ethernet-Treibern zählen Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice` und `ixgbe`; Realtek `8139` und `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x` und `bnxt`; Atheros `atl*` und `alx`; Marvell `sky2`; sowie gängige USB-Ethernet-Treiber wie ASIX, `r8152`, CDC Ethernet/NCM und RNDIS.

Die WLAN-Unterstützung umfasst Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k` und `ath12k`; Broadcom `brcmfmac`, `brcmsmac` und `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88` und `rtw89`; sowie mehrere ältere Marvell-, Intersil-, ZyDAS- und weitere Treiber.

MiniOS ergänzt zudem DKMS-Module für Hardware, die vom Standard-Kernel nicht ausreichend unterstützt wird. Das aktuelle amd64-Modulset enthält zusätzliche Realtek-USB-WLAN-Treiber für RTL8188EU, RTL8814AU, RTL8811/RTL8821AU und verwandte RTL88xxAU-Adapter sowie den Broadcom STA `wl`-Treiber.

Das Firmware-Set umfasst Debian-Firmwarepakete für Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium und weitere gängige Netzwerktechnik.
Die genaue Verfügbarkeit hängt weiterhin von der MiniOS-Version, der Architektur und dem gewählten Kernel ab.

Für den normalen Netzwerkbetrieb nach dem Booten verwendet MiniOS NetworkManager. Wird ein Adapter überhaupt nicht erkannt, kann eine Änderung der NetworkManager-Einstellungen keinen fehlenden Kernel-Treiber oder Firmware ersetzen. Siehe [Netzwerkkonfiguration](/using-minios/Networking) für den normalen Netzbetrieb.

## Speicher

Für einen Live-MiniOS-Boot ist der Speichercontroller in zweierlei Hinsicht entscheidend: Die Firmware muss den Bootloader starten können und das MiniOS-initramfs muss anschließend das Gerät erkennen, das den `minios/`-Datenbaum enthält.

MiniOS enthält absichtlich nur ausgewählte Speichertreiber im initramfs.
Die aktuellen Builder fügen immer IDE/PATA/SATA, NVMe, SD/MMC, USB-Massenspeicher/UAS und Hyper-V-Speicherunterstützung hinzu. Standard, Toolbox und Ultra ergänzen außerdem VirtIO-Block/SCSI und VMware PVSCSI im initramfs; Flux nicht.

Der vollständige Kernel-Modulbaum enthält zusätzliche Speichertreiber, die während der frühen MiniOS-Quellenerkennung nicht verfügbar sind. Wenn das Boot-Menü erscheint, aber MiniOS seine Module nicht findet, siehe [Initrd-Systemerkennung](/reference/boot-process/System-Discovery).

## Virtuelle Maschinen

MiniOS unterstützt die gängige virtuelle Hardware von VirtualBox, VMware, QEMU/KVM und Hyper-V. Für Boot-Medien und Installationszielplatten empfiehlt sich ein **IDE- oder SATA-Controller**, sofern der Hypervisor dies anbietet. Diese Controller sorgen für das vorhersehbarste Verhalten beim frühen Booten und während der Installation.

Der aktuelle Debian-6.12-Kernel enthält bereits die wichtigsten Gast-Hardwaretreiber:

| Hypervisor | Im Kernel enthaltene Treiber |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO-Block, Netzwerk, Grafik, Eingabe, Balloon, SCSI, Sound und verwandte Treiber |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm` sowie Hyper-V-Eingabeunterstützung |

Diese Kernel-Treiber reichen für den grundlegenden Gastbetrieb aus. Zusätzliche Gastdienste sorgen für Host-Integration wie automatische Display-Anpassung, sauberes Herunterfahren, Dateisystemfreigabe und Kommunikation zwischen Host und Gast.

Toolbox und Ultra enthalten `open-vm-tools` und `open-vm-tools-desktop` für VMware, `qemu-guest-agent` für QEMU/KVM und `hyperv-daemons` für Hyper-V. In unterstützten Suiten, einschließlich aktueller Trixie-Abbilder, sind außerdem `virtualbox-guest-utils` und `virtualbox-guest-x11` enthalten. Flux und Standard enthalten diese Gastdienst-Pakete standardmäßig nicht.

Siehe [Virtualisierung](/maintenance-and-recovery/Virtualization) und [Pakete und Editionen](/reference/Package-and-Edition-Contents) für editionsspezifische Software.

## Einen Computer vor dem produktiven Einsatz testen

1. Starten Sie genau das MiniOS-Abbild, das Sie verwenden möchten.
2. Nutzen Sie den Standardmodus **Start MiniOS** für normale Tests oder **Start ohne Speichern**, wenn Sie ausdrücklich keine persistente Sitzung öffnen oder erstellen möchten.
3. Prüfen Sie Grafik, Tastatur und Zeigegeräte, Sound, kabelgebundene und drahtlose Netzwerke, die benötigten Speichergeräte sowie Standby/Wiederaufnahme, falls Sie diese Funktion nutzen möchten.
4. Wenn Sie Persistenz verwenden wollen, nehmen Sie eine kleine Teständerung vor, starten Sie neu und bestätigen Sie, dass die erwartete Sitzung aktiviert wurde und die Änderung erhalten blieb.
5. Erst danach sollten Sie sich für wichtige Arbeiten auf das Gerät verlassen oder destruktive Festplattenoperationen durchführen.

Falls etwas fehlschlägt, klären Sie zunächst, ob das Problem vor dem Boot-Menü, während der MiniOS-Quellenerkennung oder nach dem Start des Betriebssystems auftritt.
Diese Unterscheidung zeigt meist, ob Sie Firmware, Initramfs oder die normale Linux-Hardwareunterstützung prüfen sollten.
