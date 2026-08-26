---
updated: 2026-08-26
---

# MiniOS applications and tools


MiniOS includes tools for configuring, installing, maintaining, and remastering
MiniOS systems. Use this page to choose a tool, then follow the linked guide for
requirements, safety limits, and command details.

## Check what is installed

The current Xfce package manifests include the graphical set in the Standard,
Toolbox, and Ultra editions: Configurator, Installer, Session Manager, Kernel
Manager, Store, Image Builder, Module Manager, MiniOS Help, and Drive Utility.
The Flux edition does not include this GUI set, and builds using other desktop
or console environments may not include it. Conditional package selection also
varies by distribution suite and build options.

The installed package set or completed image is authoritative. Check a running
system with `dpkg-query`, or inspect the image modules and manifests as described
in [Packages and editions](/administration/Packages.md).

## Choose a graphical tool

| Task | Tool | Live and native applicability | Documentation |
|---|---|---|---|
| Edit MiniOS boot-time and new-session settings | **MiniOS Configurator** | For the MiniOS live configuration model. It writes settings for a later live boot and does not reconfigure the running system immediately. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Deploy MiniOS to another disk | **MiniOS Installer** | Run from a MiniOS live session. It can create either a modular live installation or a conventional native installation when the image supports native deployment. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Create, select, resize, save, or remove persistent sessions | **MiniOS Session Manager** | Live systems only. Native installations write directly to their root filesystem and do not use MiniOS live sessions. | [Session management](/configuration/Session-Management.md) |
| Package, activate, inspect, or remove MiniOS kernels | **MiniOS Kernel Manager** | Intended for modular live installations and their MiniOS kernel repository. Use the distribution's normal kernel package workflow on a native installation. | [Kernel management](/administration/Kernel-Management.md) |
| Install applications or build application modules from catalog recipes | **MiniOS Store** | On live systems, choose module or direct system installation; persistence determines whether direct changes survive reboot. Native installations use direct system mode. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Remaster an existing MiniOS image through a guided project | **MiniOS Image Builder** | Works with MiniOS live image content from the running live session, an ISO, or optical media. It creates another live ISO; it does not maintain a native installation or replace a source build. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Inspect, create, activate, and select `.sb` modules | **MiniOS Module Manager** | Module composition and runtime activation are live-system features. Native installations do not use the layered `.sb` root model. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Read the installed MiniOS documentation | **MiniOS Help** | A local documentation viewer. It can be used wherever the `minios-help` package and its documentation set are installed. | [MiniOS documentation](/) |
| Write a MiniOS ISO to a USB drive | **Drive Utility** | Can run in a live or native graphical system when installed. It writes bootable media; it does not perform a live or native deployment like MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Choose a command-line tool

The shared core manifest currently includes `minios-tools` and
`minios-image-compose`, including in the Flux edition. Their presence in any
particular installed system or image must still be checked directly.

### Work with modules and session changes

Use the core MiniOS CLI tools when you need a scriptable module workflow:

- `sb` inspects modules and manages the running and next-boot module sets.
- `apt2sb`, `script2sb`, and `chroot2sb` build modules in an isolated environment.
- `dir2sb` and `sb2dir` convert between directory trees and `.sb` modules.
- `savechanges` captures eligible changes from a live writable session into a module.
- `rmsbdir` removes a module extraction directory with the required safety checks.

Most build, capture, activation, and next-boot operations depend on a MiniOS live
module layout. Basic file conversion and inspection can be useful outside a
running live session when their required tools and input files are available.
See [Creating modules](/development/Creating-Modules.md) for privileges, output
rules, and current command workflows.

### Compose a MiniOS ISO

Use `minios-image-compose` for scripts, automation, or a reproducible
command-line remaster of an existing MiniOS content tree. It can select modules,
apply supported image configuration, optionally capture compatible live-session
changes, verify the result, and publish a bootable ISO. It operates on MiniOS
live image content and does not convert or update a native installation. See
[Composing MiniOS ISO images from the command line](/development/Rebuilding-ISO.md).

For changes to source package lists, kernels, boot artifacts, or the complete
module chain, use the source build system instead of either image-remastering
tool. See [Building MiniOS](/development/Building-MiniOS.md).
