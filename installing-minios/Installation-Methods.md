---
updated: 2026-08-31
---
# Installation methods


MiniOS is a live-first operating system. Installing MiniOS normally means placing its modular live system on removable media or another disk, so writing or copying MiniOS to a USB drive is itself an installation method rather than merely preparation for a later installation.

There are two broad installation families:

- **Live installation** keeps the MiniOS module stack, boot-time configuration, session persistence, and MiniOS management workflows. Raw image writing, file-based installation, Ventoy, and MiniOS Installer Live mode all produce ways to run the MiniOS live system.
- **Native installation** is an optional conversion performed by [MiniOS Installer](/installing-minios/MiniOS-Installer). It creates a conventional Debian desktop from the selected MiniOS image, keeping its desktop environment, visual identity, and ordinary applications while removing the MiniOS-specific software that exists for the live architecture.

## Download and verify the ISO

Download an ISO from the [official website](https://minios.dev), the official [GitHub Releases page](https://github.com/minios-linux/minios-live/releases), or [SourceForge](https://sourceforge.net/projects/minios-linux/). Verify it before writing it to a device; see [Verifying downloads](/installing-minios/Verifying-Downloads).

## Install MiniOS to removable media

Choose the method by the layout you want on the target device:

| Result | Method | What you get |
|---|---|---|
| Normal writable filesystem that also boots MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) in ISO mode or [manual file-based installation](/installing-minios/Manual-File-Based-Installation) | MiniOS files and bootloader on a normal filesystem; remaining space stays usable for ordinary files |
| Multiboot device with MiniOS persistence support | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy data partition for ISO files plus MiniOS persistent-session support |
| Managed modular MiniOS installation | [MiniOS Installer](/installing-minios/MiniOS-Installer) in **Live** mode | MiniOS module layout with optional persistent storage configured by the installer |
| Exact block-for-block copy of the published ISO | [Rufus](/installing-minios/installation-tools/Rufus) in DD mode, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Drive Utility](/installing-minios/installation-tools/Drive-Utility), or [`dd`](/installing-minios/installation-tools/dd) | The ISO block layout exactly; simple and predictable, but the target no longer behaves like a normal general-purpose flash drive |

::: danger Raw image writing overwrites the target layout
Rufus DD mode, Etcher, Drive Utility image writing, and `dd` replace the device's existing block layout. Confirm the target model and capacity and back up anything important before starting. This warning does not describe Rufus ISO mode, Ventoy, or a file-based installation.
:::

## Boot the live session

1. Restart the computer and open its firmware boot menu.
2. Select the USB device or other bootable media.
3. Start MiniOS and check that storage, networking, and input devices work as expected.

Firmware settings vary by computer. A MiniOS image may boot through BIOS or UEFI; the target of a later MiniOS Installer deployment is not restricted to MBR.

Use [Boot modes](/using-minios/Boot-Modes) as the canonical guide to live boot behavior. If early boot cannot find the image or its modules, see [Initrd system discovery](/reference/boot-process/System-Discovery).

## Choose an installed layout

From the live session, start [MiniOS Installer](/installing-minios/MiniOS-Installer) when you want the system on another USB drive, SSD, or hard disk.

- **Live mode** preserves the compressed module stack, MiniOS boot layout, MiniOS management tools, and optional session persistence. Choose this when you want MiniOS itself on the target disk.
- **Native mode** expands the selected image into a conventional writable Debian desktop. The target keeps the desktop environment, visual identity, and ordinary applications from the selected edition, while the MiniOS live runtime and live-specific management software are removed. The installed system uses a conventional Debian initramfs, bootloader, kernel packages, and package-management workflow.

::: warning Native installation uses a different system model
The defining MiniOS architecture is the modular live system described in [About MiniOS](/getting-started/About-MiniOS). Native mode keeps the familiar MiniOS desktop experience, including its visual identity, desktop environment, and ordinary applications, but converts the system to a conventional Debian installation. MiniOS-specific tools for sessions, modules, modular kernels, and other live workflows are removed because those features no longer apply. Choose a live installation if you want the complete MiniOS feature set.
:::

Live persistence is prepared during early boot; the detailed behavior is in [Initrd persistence](/reference/boot-process/Persistence-Internals). It does not apply after native conversion.

The installer supports automatic BIOS/MBR, UEFI/MBR, and UEFI/GPT layouts. BIOS on GPT is not supported by the current installer. See [Using MiniOS Installer](/installing-minios/MiniOS-Installer) for placement, filesystem, persistence, and partitioning limits.
