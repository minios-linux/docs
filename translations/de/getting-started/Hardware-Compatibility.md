---
updated: 2026-10-15
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

MiniOS PC-Images können sowohl über das Legacy-BIOS als auch über UEFI booten, sofern die erforderlichen Boot-Dateien im ausgewählten Image vorhanden sind. Firmware-Implementierungen unterscheiden sich jedoch stark, daher kann dasselbe USB-Gerät im Boot-Menü verschiedener Computer unterschiedlich angezeigt werden.

Secure Boot hängt von der vollständigen Kernel- und EFI-Kette des Images ab, nicht nur von dessen Architektur. Debian/Ubuntu amd64-Images, die den passenden signierten Distributions-Kernel und die entsprechenden EFI-Komponenten verwenden, können Secure Boot unterstützen. Ein benutzerdefinierter oder von MiniOS bereitgestellter unsignierter Kernel wird nicht allein dadurch vertrauenswürdig, dass signierte EFI-Dateien vorhanden sind. DynBlk und der externe AUFS-NG-Treiber sind unsigniert: Secure Boot deaktiviert DynBlk/VMDK-Sitzungen und lässt in der Regel OverlayFS für die Modulerstellung zu.

Aktuelle i386-Images verwenden einen von MiniOS gebauten Kernel, da die gewählte Basis keinen geeigneten 32-Bit-Kernel mehr bereitstellt. MiniOS-Kernel sind separate Builds mit MiniOS-Integration, stellen jedoch keine Garantie für byte-identische Debian-Binärdateien dar und sind nicht Teil der signierten Debian-Kette.**Secure Boot wird von diesen i386-Images nicht unterstützt.** Die Bitness der Firmware ist ein separates Kriterium für die Boot-Kompatibilität.

## Arbeitsspeicher

Die Anforderungen an den Arbeitsspeicher hängen von der jeweiligen Version, dem Desktop, den Anwendungen und dem Sitzungstyp ab. Flux benötigt in der Regel weniger Speicher als die vollständigen XFCE-Editionen; ein Browser, ein Office-Paket, eine virtuelle Maschine oder ein großes Persistenz-Image können jedoch deutlich mehr Speicher als nur der Desktop allein benötigen. Orientieren Sie sich an den angegebenen Anforderungen der jeweiligen Version und testen Sie die geplante Nutzung, anstatt eine veraltete, editionsweite RAM-Angabe als ausreichend für jedes aktuelle Abbild zu betrachten.

**Aus dem RAM ausführen** benötigt zusätzlichen Arbeitsspeicher, da MiniOS-Daten zusammen mit dem laufenden System und den Anwendungen in RAM kopiert werden. Größere Abbilder erfordern in diesem Modus daher wesentlich mehr Arbeitsspeicher.

Siehe [Startmodi](/using-minios/Boot-Modes) bevor Sie **Aus dem RAM ausführen** auf einem speicherbegrenzten Computer verwenden.

## Grafik

Aktuelle amd64 MiniOS Images verwenden den Debian-Grafik-Stack mit Xorg und Mesa.
Je nach ausgewähltem Kernel decken dessen Module Intel `i915` und `xe`, AMD `amdgpu` sowie `radeon` und quelloffene NVIDIA `nouveau` Hardware ab.

Xorg enthält seinen generischen `modesetting` Treiber sowie Intel-, AMD/ATI-, Radeon-, Nouveau-, VESA- und Framebuffer-Treiber. Mesa stellt den üblichen 3D-Beschleunigungs-Stack für Intel, AMD und unterstützte Open-Source-Treiber bereit.

Debian-basierte MiniOS Images fordern Debian-Firmware-Sammlungen zusammen mit herstellerspezifischen Paketen an, einschließlich `firmware-intel-graphics` unter Trixie und Excalibur. Die tatsächlich installierte Firmware hängt von der Verfügbarkeit im Repository und dem fertigen Image ab. Ubuntu-basierte Images verwenden stattdessen `linux-firmware`.

Die gepflegten MiniOS Paketlisten enthalten keinen proprietären NVIDIA-Kernel-Treiber. NVIDIA-Hardware nutzt daher standardmäßig den enthaltenen `nouveau` Treiber. Hardware oder Funktionen, die explizit den proprietären NVIDIA-Treiber benötigen, müssen diesen separat hinzufügen.

Virtuelle Grafik wird ebenfalls durch Kernel- und Xorg-Treiber für gängige VMware-, QXL-, Bochs- und Hyper-V-Geräte unterstützt.

### XFCE-Skalierung und Fensterverwaltung

Die XFCE-Images von Debian 13 und Devuan Excalibur verwenden MiniOS-angepasste Einstellungen und Desktop-Pakete, die MiniOS-Taskleiste und die Plugins „Desktop anzeigen“, sowie `xfwm4-gl` anstelle von `xfwm4`. Die Anzeigeeinstellungen bieten automatische Oberflächenskalierung oder manuelle Auswahl zwischen 100–200 % in 25-%-Schritten, mit zeitgesteuerter Vorschau und Rücknahme. Text, Bedienelemente, Fensterdekorationen und thematische Mauszeiger folgen der Oberflächenskalierung; die Pixelskala der Ausgabe und die Monitorauflösung bleiben separate Einstellungen. Gespeicherte manuelle Werte überschreiben die automatische Auswahl.

`xfwm4-gl` verwendet standardmäßig OpenGL mit XRender als Fallback. Mit den Fensterverwaltungseinstellungen lassen sich Unschärfe, Animationen, Umgehung der Vollbild-Komposition und das Erscheinungsbild von Alt+Tab konfigurieren. Alt+Tab und Taskleisten-Thumbnails können andere Fenster für Peek abdunkeln oder ausblenden, ohne das Vorschaufenster zu aktivieren; zwischengespeicherte Bilder minimierter Fenster werden genutzt, wenn verfügbar. Überblendung/Skalierung und Peek funktionieren mit beiden Renderern, während Unschärfe und Magic Lamp OpenGL erfordern. Andere Editionen behalten ihre jeweiligen XFCE-Komponenten der Distribution bei.

### Optionale MateBook E-Pakete

Die Unterstützung für das Huawei MateBook E 2023 ist über separat installierbare Linux 6.12-Pakete verfügbar; diese sind nicht standardmäßig im Release-Image enthalten.`matebook-e-dsi-dkms` bietet ein experimentelles Backport für das interne Display: Verbleibende farbige Streifen und nicht validierte Suspend-/Resume-Funktionen sind weiterhin Einschränkungen. Die Kameraintegration verwendet `matebook-e-cameras-dkms` und das amd64/systemd-`matebook-e-cameras` Userspace-Paket. Die Kamerapakete installieren den experimentellen Pen-Treiber nicht.

## Netzwerkhardware

Die aktuellen amd64 MiniOS Abbilder verwenden den Debian-Kernel mit dem üblichen Satz an Netzwerktreibern. Der in den aktuellen Trixie-Abbildern eingesetzte Kernel 6.12 enthält Treiber für gängige Ethernet- und WLAN-Hardware von Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell und weiteren Herstellern.

Zu den verbreiteten Ethernet-Treibern gehören Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, und `ixgbe`; Realtek `8139` und `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x`, und `bnxt`; Atheros `atl*` und `alx`; Marvell `sky2`; sowie gängige USB-Ethernet-Treiber wie ASIX, `r8152`, CDC Ethernet/NCM und RNDIS.

Die WLAN-Unterstützung umfasst Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, und `ath12k`; Broadcom `brcmfmac`, `brcmsmac`, und `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, und `rtw89`; sowie verschiedene ältere Treiber für Marvell, Intersil, ZyDAS und andere.

MiniOS ergänzt DKMS-Module für Hardware, die vom Standard-Kernel nicht ausreichend unterstützt wird. Das aktuelle amd64-Modulpaket enthält zusätzliche Realtek USB-WLAN-Treiber für RTL8188EU, RTL8814AU, RTL8811/RTL8821AU und verwandte RTL88xxAU-Adapter sowie den Broadcom STA `wl`-Treiber.

Das Firmware-Paket enthält Debian-Firmware für Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium und weitere gängige Netzwerktechnik.
Die genaue Verfügbarkeit hängt weiterhin von der MiniOS-Version, der Architektur und dem gewählten Kernel ab.

Für die normale Netzwerknutzung nach dem Start verwendet MiniOS NetworkManager. Wird ein Adapter gar nicht erkannt, kann das Anpassen der NetworkManager-Einstellungen fehlende Kernel-Treiber oder Firmware nicht ersetzen. Siehe [Netzwerkkonfiguration](/using-minios/Networking) für die übliche Netzwerknutzung.

## Speicher

Bei einem Live-MiniOS-Boot ist der Speichercontroller in zweifacher Hinsicht entscheidend: Die Firmware muss in der Lage sein, den Bootloader zu starten, und das MiniOS-initramfs muss anschließend das Gerät erkennen, das das`minios/` Datenverzeichnis enthält.

MiniOS enthält im initramfs bewusst nur ausgewählte Speicher-Treiber.
Die aktuellen Builder beinhalten immer Unterstützung für IDE/PATA/SATA, NVMe, SD/MMC, USB-Massenspeicher/UAS und Hyper-V-Speicher. Standard, Toolbox und Ultra fügen dem initramfs zusätzlich VirtIO-Block/SCSI sowie VMware PVSCSI hinzu; Flux nicht.

Der vollständige Kernel-Modulbaum enthält weitere Speicher-Treiber, die während der frühen MiniOS-Quellenerkennung nicht verfügbar sind. Falls das Boot-Menü erscheint, aber MiniOS seine Module nicht findet, siehe[Initrd-Systemerkennung](/reference/boot-process/System-Discovery).

## Virtuelle Maschinen

MiniOS unterstützt die gängige virtuelle Hardware, wie sie von VirtualBox, VMware, QEMU/KVM und Hyper-V verwendet wird. Für Boot-Medien und Installationszielplatten empfiehlt es sich, einen **IDE- oder SATA-Controller** zu verwenden, sofern der Hypervisor dies anbietet. Diese Controller sorgen während des Systemstarts und der Installation für das vorhersehbarste Verhalten.

Der aktuelle Debian 6.12-Kernel enthält bereits die wichtigsten Treiber für virtuelle Gast-Hardware:

| Hypervisor | Im Kernel enthaltene Treiber |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO-Block-, Netzwerk-, Grafik-, Eingabe-, Balloon-, SCSI-, Sound- und zugehörige Treiber |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`, sowie Hyper-V-Eingabeunterstützung |

Diese Kernel-Treiber reichen für den grundlegenden Betrieb als Gast aus. Zusätzliche Gastdienste ermöglichen eine bessere Integration mit dem Host, wie automatische Anzeigeanpassung, sauberes Herunterfahren, Dateisystemfreigabe und Kommunikation zwischen Host und Gast.

Toolbox und Ultra enthalten `open-vm-tools` und `open-vm-tools-desktop` für VMware, `qemu-guest-agent` für QEMU/KVM und `hyperv-daemons` für Hyper-V. In unterstützten Suiten, einschließlich aktueller Trixie-Images, sind außerdem `virtualbox-guest-utils` und `virtualbox-guest-x11` enthalten. Flux und Standard beinhalten diese Gastdienst-Pakete standardmäßig nicht.

Siehe [Virtualisierung](/maintenance-and-recovery/Virtualization) und [Pakete und Editionen](/reference/Package-and-Edition-Contents) für editionsspezifische Software.

## Testen Sie einen Computer, bevor Sie sich darauf verlassen

1. Starten Sie genau das MiniOS-Abbild, das Sie verwenden möchten.
2. Verwenden Sie den Standard-**MiniOS starten**-Modus für normale Tests oder **Ohne Speichern starten**, wenn Sie ausdrücklich keine persistente Sitzung öffnen oder erstellen möchten.
3. Überprüfen Sie Grafik, Tastatur und Zeigegeräte, Sound, kabelgebundene und drahtlose Netzwerke, die benötigten Speichermedien sowie Suspend/Resume, falls Sie diese Funktion nutzen möchten.
4. Wenn Sie Persistenz verwenden möchten, nehmen Sie eine kleine Teständerung vor, starten Sie neu und stellen Sie sicher, dass die erwartete Sitzung aktiviert wurde und die Änderung erhalten geblieben ist.
5. Verlassen Sie sich erst dann für wichtige Aufgaben auf das Gerät oder führen Sie zerstörerische Festplattenoperationen durch.

Falls etwas fehlschlägt, prüfen Sie zunächst, ob das Problem vor dem Boot-Menü, während der MiniOS-Quellenerkennung oder nach dem Start des Betriebssystems auftritt.
Diese Unterscheidung zeigt meist, ob Sie Firmware, initramfs oder die reguläre Linux-Hardwareunterstützung untersuchen sollten.
