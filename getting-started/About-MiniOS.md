---
updated: 2026-08-31
---
# About MiniOS

MiniOS is a Debian-based Linux distribution designed primarily as a portable operating system. It can run from removable media or a local disk while keeping the operating system, applications, and user environment independent of any particular computer.

A conventional desktop installation gradually becomes tied to the machine on which it was installed. MiniOS takes a different approach: the working environment can stay with the user and move between compatible computers.
Settings, files, installed software, and persistent sessions can travel with the system instead of remaining on one internal disk.

MiniOS is therefore intended to be more than a temporary live environment. Its goal is to provide a complete portable Linux system that remains practical for daily work, maintenance, recovery, experimentation, and specialized tasks.

## What makes MiniOS different

### Portable by design

MiniOS is built around a simple idea: **the operating system should belong to the user, not to the device on which it runs**.

The computer provides the processor, memory, display, storage interfaces, and peripherals. The MiniOS environment can remain on the user's own media and be started on different hardware. This makes the computer the place where the system runs today rather than the place to which the system permanently belongs.

### Modular by design

MiniOS is assembled from separate read-only SquashFS modules rather than one large writable system image. The base system, kernel, firmware, desktop, applications, and additional software can remain separate layers.

User changes can be stored independently from those base modules. This makes it possible to add, replace, disable, or test parts of the system without rewriting the entire operating system, and makes returning to a known base state easier when an experiment does not work as intended.

Modularity also lets different MiniOS editions and custom systems share the same architecture instead of becoming unrelated products.

### Small without sacrificing convenience

The name **MiniOS** reflects an important project goal: keeping the system as small as reasonably possible. But size is not pursued at the expense of making the system inconvenient, fragile, or narrowly useful.

A very small live image is easy to produce when firmware, localization, filesystem support, persistence, desktop integration, recovery tools, and applications are removed. A portable operating system has a different problem: it should remain useful when it is started on hardware that was not known when the image was built.

MiniOS therefore aims for the **smallest practical size while preserving the maximum reasonable convenience, hardware support, and functionality**. A component is not removed merely because it makes the ISO larger; the important question is whether the space it uses provides enough practical value.

This is why some MiniOS editions are larger than the name may initially suggest.
The additional size is deliberate when it improves everyday usability or makes the same portable system useful on a wider range of computers. Users who need a smaller system can choose a lighter edition or a reduced module set, while users who need a complete workstation can keep more functionality.

### Debian, not a separate ecosystem

MiniOS is based on Debian and deliberately remains part of the Debian ecosystem.
It uses normal Debian packages, APT, standard services, and familiar Linux conventions. MiniOS-specific infrastructure is added where a portable modular system needs behavior that a conventional installation does not provide.

The project prefers established Linux mechanisms when they already solve the problem instead of replacing them with MiniOS-specific equivalents.

### Transparent and adaptable

MiniOS tries to automate routine work without hiding the structure of the system. A user can stay within the graphical tools and ready-made images, but the same system can also be inspected, reconfigured, extended with modules, or rebuilt for a specialized purpose.

This allows MiniOS to serve different tasks without splitting into unrelated products. A lightweight portable desktop, a recovery toolkit, and a broader workstation can use the same underlying model and differ mainly in the modules and applications they include.

## How MiniOS works

At boot, MiniOS combines read-only SquashFS modules into one running root filesystem and adds a writable layer for the current session. Without persistence that writable state is temporary. With persistence, selected changes can survive a reboot while the base modules remain separate.

The modular live system is not merely one installation option: **it is the defining MiniOS model**. MiniOS modules, persistent sessions, boot-time configuration, modular kernel management, image composition, and the MiniOS management applications are designed around this live architecture.

MiniOS Installer also provides a **native** installation path for users who prefer a conventional desktop system on a writable root filesystem. Native installation keeps the familiar MiniOS desktop experience — its selected desktop environment, visual identity, and ordinary applications — but it leaves the modular live model: MiniOS sessions, `.sb` module workflows, modular kernel management, and the MiniOS-specific utilities designed for live operation are removed. The installed system is then maintained as a conventional Debian desktop with APT, Debian kernel packages, a normal initramfs, and the installed bootloader.

For technical details, see [MiniOS system architecture](/reference/System-Architecture).
For user-visible session behavior and storage choices, see [Boot modes](/using-minios/Boot-Modes) and [Session management](/using-minios/Sessions-and-Persistence).

## Editions

MiniOS editions are different configurations of the same architecture rather than separate operating systems.

| Edition | Purpose |
|---|---|
| **Standard** | Minimal Xfce system with basic functionality for everyday computing; recommended for most users |
| **Toolbox** | System administration and diagnostics for professional IT work and system recovery |
| **Ultra** | Full-featured desktop with a wide range of applications and professional tools for creativity and development |
| **Flux** | Ultra-lightweight Fluxbox edition for minimal resource use and older hardware; not recommended for beginners |

Exact desktop and package availability depends on the release and target platform. For the maintained package selection and edition relationships, see [Packages and editions](/reference/Package-and-Edition-Contents). For the MiniOS-specific tools available in the system, see [MiniOS applications and tools](/using-minios/MiniOS-Applications).

## Next steps

- [Quick start](/getting-started/Quick-Start) — start using MiniOS.
- [MiniOS applications and tools](/using-minios/MiniOS-Applications) — discover the included MiniOS utilities.
- [MiniOS system architecture](/reference/System-Architecture) — understand the module, session, and boot model in more detail.
- [Packages and editions](/reference/Package-and-Edition-Contents) — compare maintained edition contents.

Project resources:

- [MiniOS website](https://minios.dev)
- [Source code](https://github.com/minios-linux/minios-live)
- [Issue tracker](https://github.com/minios-linux/minios-live/issues)
