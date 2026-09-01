---
updated: 2026-08-31
---

# Virtualisierung

MiniOS kann als Gastsystem in VirtualBox, VMware, QEMU/KVM und Hyper-V ausgeführt werden.
Toolbox und Ultra enthalten außerdem Software, um QEMU/KVM-VMs direkt aus MiniOS heraus zu betreiben.

Diese Seite dokumentiert das MiniOS-spezifische Verhalten bei der Virtualisierung. Für allgemeine VM-Erstellung und Hypervisor-Einstellungen nutzen Sie bitte die Dokumentation des jeweiligen Hypervisors.

## MiniOS als Gastsystem ausführen

### Empfohlene VM-Konfiguration

Für maximale Kompatibilität binden Sie das MiniOS-Bootmedium und jede virtuelle Festplatte, die eine MiniOS-Live-Installation enthalten soll, über einen **IDE- oder SATA-Controller** ein. Diese Empfehlung gilt für VirtualBox, VMware, QEMU/KVM und Hyper-V, sofern ein solcher Controller verfügbar ist.

Andere virtuelle Speichercontroller funktionieren möglicherweise ebenfalls, aber MiniOS muss während der Initramfs-Phase auf seine Live-Quelle zugreifen können, bevor der vollständige Kernel-Modulbaum aus `01-kernel-*.sb` geladen ist.

### Storage-Unterstützung im Frühstart

MiniOS enthält im Initramfs absichtlich nur eine ausgewählte Auswahl an Storage-Treibern. Die aktuellen Dracut- und LiveKit-Builder verfolgen dieselbe Strategie:

| Speicher-Interface | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Ja | Ja |
| NVMe | Ja | Ja |
| USB-Massenspeicher / UAS | Ja | Ja |
| Hyper-V-Speicher (`hv_storvsc`) | Ja | Ja |
| VirtIO Block / SCSI | Nein | Ja |
| VMware PVSCSI | Nein | Ja |
| Xen Block Frontend | Nein | Nein |

Gängige SAS/RAID-Treiber wie `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas` und `aacraid` sind im vollständigen Kernel-Modulbaum enthalten, aber nicht im MiniOS-Initramfs.

Diese Unterscheidung ist nur relevant, bevor die MiniOS-Live-Quelle gefunden wurde und das vollständige System gestartet ist. Hardware, die nach dem Booten normal funktioniert, ist nicht zwangsläufig geeignet, um die Live-Quelle selbst bereitzustellen.

Daher bleibt **IDE oder SATA die empfohlene VM-Speicherwahl**, auch für Editionen, deren Initramfs zusätzlich VirtIO- oder VMware-PVSCSI-Unterstützung enthält.

### Gastintegration

Der Kernel stellt bereits die grundlegenden Treiber für virtuelle Hardware der wichtigsten Hypervisoren bereit. Toolbox und Ultra liefern zusätzliche Gast-Service-Pakete für eine engere Integration:

| Plattform | In Toolbox / Ultra enthaltene Gastintegration |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` auf unterstützten Basen |
| Hyper-V | `hyperv-daemons` |

Der aktuelle Debian-Kernel, der von amd64-MiniOS verwendet wird, enthält ebenfalls VirtualBox-Gasttreiber, VMware-Grafik-/Netzwerktreiber, VirtIO und Hyper-V-Treiber. Gast-Service-Pakete erweitern die Integration; sie sind nicht erforderlich, damit die VM grundsätzlich startet.

### Xfce-Auflösungsverwaltung

MiniOS stellt `/usr/bin/minios-virtual-resolution` bis `minios-tools` bereit und startet es über die Xfce-Autostart-Sitzung. Es erkennt gängige virtuelle Maschinen und verwendet XRandR nur, wenn keine aktiven Gasttools die Anzeige bereits steuern.

Ohne eine Anpassung ist die angeforderte Auflösung `1280x800`. Mit `virtres=WIDTHxHEIGHT` kann eine andere Auflösung angefordert werden oder mit `novirtres` diese MiniOS-Anpassung deaktiviert werden.
Nach erfolgreicher Anpassung wird von dem Dienstprogramm `~/.config/minios/virtual-resolution-configured` erstellt. In einer persistenten Sitzung wird die automatische Anpassung erst wieder angewendet, wenn dieser Marker entfernt wurde.

## MiniOS als Virtualisierungshost nutzen

Toolbox und Ultra enthalten den QEMU/KVM-Stack für lokale virtuelle Maschinen:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra enthält zusätzlich den Docker-Stack und `lazydocker` für Container-Workloads.

Diese Dokumentation beschreibt nicht die Installation von Virtualisierungsprodukten, die nicht Teil einer Edition sind.

## Siehe auch

- [Hardware-Kompatibilität](/getting-started/Hardware-Compatibility)
- [Initrd-Systemerkennung](/reference/boot-process/System-Discovery)
- [Boot-Parameter](/reference/Boot-Parameters)
- [Pakete und Editionen](/reference/Package-and-Edition-Contents)
