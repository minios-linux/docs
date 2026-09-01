---
updated: 2026-08-31
---
# MiniOS applications


MiniOS provides graphical and command-line tools for configuration, installation, sessions, modules, kernels, software, and image remastering. These tools are designed around the modular live architecture described in [About MiniOS](/getting-started/About-MiniOS).

## Availability

The available tools depend on the packages included in the MiniOS image. Check a running live system with `dpkg-query`, or inspect the image modules and [package manifests](/reference/Package-and-Edition-Contents).

A native installation keeps the familiar MiniOS desktop experience — its visual identity, selected desktop environment, and ordinary applications — but it does not keep the MiniOS-specific management software designed for the live architecture. Sessions, `.sb` modules, modular kernel management, and similar workflows no longer apply, so the installed system uses normal Debian package, kernel, configuration, and bootloader tools instead.

## Graphical tools

| Task | Tool | Scope | Documentation |
|---|---|---|---|
| Edit MiniOS boot-time and new-session settings | **MiniOS Configurator** | For the MiniOS live configuration model. It writes settings for a later live boot and does not reconfigure the running system immediately. | [MiniOS Configurator](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Deploy MiniOS to another disk | **MiniOS Installer** | Runs from a MiniOS live session. Live mode keeps the complete MiniOS live environment; native mode creates a conventional Debian desktop and removes the MiniOS-specific software intended for live operation. | [MiniOS Installer](/installing-minios/MiniOS-Installer) |
| Create, select, resize, save, or remove persistent sessions | **MiniOS Session Manager** | MiniOS live systems only. | [Session management](/using-minios/Sessions-and-Persistence) |
| Package, activate, inspect, or remove MiniOS kernels | **MiniOS Kernel Manager** | MiniOS modular live systems only. | [Kernel management](/preparing-and-customizing/Managing-Kernels) |
| Install applications or build application modules from catalog recipes | **MiniOS Store** | MiniOS live systems. Choose module or direct system installation; persistence determines whether direct changes survive reboot. | [MiniOS Store](/using-minios/Installing-Software) |
| Remaster an existing MiniOS image through a guided project | **MiniOS Image Builder** | Works with MiniOS live image content from the running live session, an ISO, or optical media. It creates another live ISO. | [MiniOS Image Builder](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspect, create, activate, and select `.sb` modules | **MiniOS Module Manager** | MiniOS live systems only; module composition and runtime activation depend on the layered `.sb` root model. | [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules) |
| Write a MiniOS ISO to a USB drive | **Drive Utility** | Generic disk-image utility included with MiniOS. It writes bootable media; it does not perform managed deployment like MiniOS Installer. | [Drive Utility](/installing-minios/installation-tools/Drive-Utility) |
| Browse the installed documentation offline | **MiniOS Help** | Reads the packaged documentation without requiring a network connection. | [MiniOS documentation](/) |

## Command-line tools

Most graphical tools have a public command-line counterpart or backend. These commands are shipped either in the same package as the graphical application or in a required companion package. The shared core manifest includes `minios-tools` and `minios-image-compose`. The other commands follow the availability of their corresponding graphical packages. Their presence in any particular installed system or image must still be checked directly.

### Deployment and sessions

| Task | Tool | Scope | Documentation |
|---|---|---|---|
| List target disks, preview a deployment plan, or install MiniOS non-interactively | **`minios-deploy`** | Runs from a MiniOS live session. Installation requires root and explicit confirmation; native mode, when supported, creates a conventional Debian desktop from the selected image. | [MiniOS Installer](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Create, activate, save, resize, export, import, or remove persistent sessions | **`minios-session`** | Requires root and a MiniOS live system with a compatible persistence store. | [Session management](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels and images

| Task | Tool | Scope | Documentation |
|---|---|---|---|
| List, package, activate, inspect, or remove kernels | **`minios-kernel`** | Requires root and a modular MiniOS live installation with a writable MiniOS root. | [Kernel management](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Remaster an existing MiniOS content tree from scripts or automation | **`minios-image-compose`** | Operates on MiniOS live image content and publishes a bootable ISO. | [Composing ISO images from the command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images); `man minios-image-compose` |

### Module workflows

| Task | Tool | Scope | Documentation |
|---|---|---|---|
| Inspect modules and manage the running or next-boot module sets | **`sb`** | Module inspection also works outside a running MiniOS session. Running and next-boot operations require a MiniOS live module layout; changes require root. | [Creating modules](/preparing-and-customizing/Managing-Modules); `man sb` |
| Build a module from repository packages or local `.deb` files | **`apt2sb`** | Requires root and a supported MiniOS live session. Packages are installed into an isolated build environment, not the running root. | [Creating modules](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Build a module by running an installation script | **`script2sb`** | Requires root and a supported MiniOS live session. The script runs non-interactively in an isolated build environment. | [Creating modules](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Build a module interactively in a prepared environment | **`chroot2sb`** | Requires root and a supported MiniOS live session. Use it when installation needs prompts or manual changes. | [Creating modules](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Convert between a directory tree and an `.sb` module | **`dir2sb`**, **`sb2dir`** | Ordinary conversion is rootless and can be used outside a running live session when the required tools and input files are available. | [Create](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) or [extract](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) a module; `man dir2sb`, `man sb2dir` |
| Capture eligible changes from the writable session layer into a module | **`savechanges`** | Requires root and a running MiniOS live session with a supported writable-layer backend. | [Creating modules](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Storage workflows

| Task | Tool | Scope | Documentation |
|---|---|---|---|
| Read or write disk images, format a device, or overwrite a device | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Generic disk operations. Writing, formatting, and wiping are destructive and normally require root. | [Drive Utility](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

For changes to source package lists, kernels, boot artifacts, or the complete module chain, use the source build system instead of either image-remastering tool. See [Building MiniOS](/development/Building-MiniOS).
