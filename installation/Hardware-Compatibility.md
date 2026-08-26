# Hardware compatibility guide

Hardware support depends on the MiniOS release and image: its base distribution,
kernel, firmware, included modules, and edition all matter. Check the release
description for the image you downloaded, then test a fresh live session before
changing disks or relying on the machine for persistent work.

## System requirements

Published MiniOS PC images target the **amd64** (64-bit x86) architecture unless
their release description says otherwise. Resource needs vary with the image,
edition, desktop, applications, and boot mode:

- The CPU must support the image architecture and the selected firmware mode.
- RAM must accommodate the selected edition and workload. `toram` modes need
  additional memory for copied image data.
- Boot media needs enough space for the downloaded image. Persistence, user
  data, and a native installation require additional writable storage.
- Graphics requirements depend on the desktop and applications in the selected
  edition.

Writing an image to a larger device does not by itself create persistent
storage. See [Boot modes](/configuration/Boot-Modes.md) for the canonical guide
to live boot behavior and [Quick start](/installation/Quick-Start.md) for media
preparation.

## Component compatibility

### Processors

Compatibility depends on the architecture and kernel shipped in the selected
image. Check the release notes when using a recent processor or CPU features
that require newer kernel support.

### Graphics

Graphics support depends on the kernel driver, firmware, and userspace graphics
stack in the image. A card may provide basic display output without supporting
hardware acceleration or every connector. Some NVIDIA hardware may require a
proprietary driver that is not included in a particular image.

### Network

Ethernet and Wi-Fi support depends on the controller, kernel driver, and
firmware included in the image. Test networking from a fresh session. For Wi-Fi,
also check whether the device needs firmware or an out-of-tree driver absent
from that release.

### Storage

USB, SATA, NVMe, IDE, and SD/MMC devices work only when the selected image has a
driver for the controller and the kernel can recognize the device. Initrd
scanning does not make an unsupported controller compatible. See
[Initrd system discovery](/configuration/Initrd-System-Discovery.md) for the
exact live-source search behavior.

Live mode and native mode have different boot paths. Live mode discovers the
MiniOS data tree and assembles read-only modules in early userspace; native mode
boots a conventional installed root. See
[Initrd module loading](/configuration/Initrd-Module-Loading.md) for live module
handling and [Installing MiniOS](/installation/Installing-MiniOS.md) for the
layout distinction.

### Virtualization

MiniOS can run as a guest when the selected image includes drivers for the VM's
configured CPU, storage, network, and display devices. Support is not guaranteed
for every hypervisor or controller model. VirtIO, VMware, Hyper-V, and emulated
IDE or SATA support must be checked against the release and tested with the
specific VM configuration.

Guest agents and desktop integration tools also vary by edition and image. See
the [package list](/administration/Packages.md) and
[Virtualization guide](/administration/Virtualization.md) before assuming that
clipboard sharing, dynamic resolution, clean shutdown, or host communication is
available.
