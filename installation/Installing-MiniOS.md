# Installing MiniOS

There are two separate tasks that are often called installation:

- Writing the ISO to removable media creates the bootable media used to start a MiniOS live session. Image-writing tools overwrite the selected device with the ISO layout.
- Running [MiniOS Installer](/installation/MiniOS-Installer.md) from a live session deploys MiniOS to another disk. It can create either a modular live installation or a conventional native Linux installation.

## Download and verify the ISO

Download an ISO from the [official website](https://minios.dev) or the official [GitHub Releases page](https://github.com/minios-linux/minios-live/releases). Verify it before writing it to a device; see [Verifying downloads](/installation/Verifying-Downloads.md).

## Write bootable media

Choose a method for your operating system:

- [Rufus](/installation/tools/Rufus.md) on Windows
- [Ventoy](/installation/tools/Ventoy.md) on Windows or Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) on Windows, Linux, or macOS
- [`dd`](/installation/tools/dd.md) on Linux or macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) on Linux
- [UNetbootin](/installation/tools/UNetbootin.md) on Windows, Linux, or macOS
- [Original method](/installation/tools/Original-Method.md) for a file-based MiniOS layout

Writing an image with Rufus, Etcher, `dd`, or Drive Utility is destructive. Confirm the device path, model, and capacity before starting. These tools create bootable media; they do not perform a live or native deployment with MiniOS Installer.

Ventoy is different: install Ventoy on the device, then copy the ISO to its data partition. This keeps Ventoy's multiboot layout.

## Boot the live session

1. Restart the computer and open its firmware boot menu.
2. Select the USB device or other bootable media.
3. Start MiniOS and check that storage, networking, and input devices work as expected.

Firmware settings vary by computer. A MiniOS image may boot through BIOS or UEFI; the target of a later MiniOS Installer deployment is not restricted to MBR.

## Choose an installed layout

From the live session, start [MiniOS Installer](/installation/MiniOS-Installer.md) when you want MiniOS on another USB drive, SSD, or hard disk.

- Live mode preserves the compressed module stack and live boot layout. It supports optional session persistence and is suited to portable installations.
- Native mode expands the selected modules into a conventional Linux root filesystem, generates initramfs, and installs a supported bootloader. Native mode is available only when the booted image provides the required installer metadata.

The installer supports automatic BIOS/MBR, UEFI/MBR, and UEFI/GPT layouts. BIOS on GPT is not supported by the current installer. See [Using MiniOS Installer](/installation/MiniOS-Installer.md) for placement, filesystem, persistence, and partitioning limits.
