# Frequently asked questions

## Which edition should I choose, and why is an application missing?

The Flux edition uses the Fluxbox-based Flux environment and a reduced package
set. Standard, Toolbox, and Ultra add
progressively different software, but availability varies by release. Check
[About MiniOS](/about/About-MiniOS.md),
[MiniOS applications](/about/MiniOS-Applications.md), and the
[package list](/administration/Packages.md).

## Is writing the ISO the same as installing MiniOS?

No. Writing the ISO creates bootable live media. MiniOS Installer can deploy
either a modular live system with optional persistence or a conventional native
system. Choose a layout with [Installing MiniOS](/installation/Installing-MiniOS.md)
and [MiniOS Installer](/installation/MiniOS-Installer.md).

## What are the default credentials?

An uncustomized live image uses `live` / `evil` and `root` / `toor`, and may
allow automatic login and passwordless administration. Change these before
using an untrusted network; follow
[Security hardening](/administration/Security-Hardening.md).

## Does writing MiniOS to a USB drive enable persistence?

Not necessarily. Raw ISO writes and normal Ventoy ISO boots do not configure a
persistent session automatically. Follow [Quick start](/installation/Quick-Start.md)
and [Session management](/configuration/Session-Management.md) for the selected
write and boot method.

## What is the difference between the active and running session?

The active session is selected for the next boot; the running session supplies
persistence now. Activating a session does not switch the current system. See
[Session management](/configuration/Session-Management.md).

## Why did my changes disappear after reboot?

You may have booted a fresh session, used media without persistence, selected a
different session, or shut down before changes were saved. Check the running and
active session as described in
[Session management](/configuration/Session-Management.md) and
[Troubleshooting](/administration/Troubleshooting.md).

## Are LUKS and SquashFS the same kind of persistence?

No. LUKS stores an encrypted writable ext4 session in a container. SquashFS is a
compressed snapshot that runs from a RAM-backed writable layer and must be
saved according to its policy. See
[Session management](/configuration/Session-Management.md) and [Security
hardening](/administration/Security-Hardening.md).

## Why does a Store application or module appear only after reboot?

Module mode creates a read-only `.sb` module for the next boot; it does not add
the application to the current module stack. Confirm its location and reboot as
described in [MiniOS Store](/administration/MiniOS-Store.md).

## Should I install software with APT or as a module?

Use APT to modify one running system or persistent session. Use modules for
read-only software layers loaded at boot. Compare the effects and storage
requirements in [Software updates](/administration/Software-Updates.md) and
[Creating modules](/development/Creating-Modules.md).

## Can I upgrade MiniOS to a new release in place?

No supported in-place release upgrade exists. Do not treat a Debian release
upgrade as a MiniOS image upgrade. Back up your data and use an image built for
the target release; see [Software updates](/administration/Software-Updates.md).

## Should I use `ip=` to configure normal networking?

No. Supplying an address configuration as `ip=<configuration>` selects early
network boot and skips local media. Configure the running system with
NetworkManager or the documented network tools. See
[Network boot](/installation/Network-Boot.md) and
[Network configuration](/configuration/Network-Configuration.md).

## How do I keep Wi-Fi settings after reboot?

Store the NetworkManager profile in a persistent live session or a native
installation, then test a reboot. The installer does not create or modify Wi-Fi
profiles. See [Network configuration](/configuration/Network-Configuration.md)
and [Session management](/configuration/Session-Management.md).

## Does MiniOS support BIOS and UEFI?

MiniOS supports legacy BIOS and x86-64 UEFI, but the available firmware entry
and installer partition layout still matter. See
[Installing MiniOS](/installation/Installing-MiniOS.md) and use
[Boot recovery](/administration/Boot-Recovery.md) when an installed system does
not start.

## How do I verify an ISO?

Download the ISO and matching `.iso.sha256` file from the same official release,
then compare the SHA-256 checksum before writing or booting it. Follow
[Verifying downloads](/installation/Verifying-Downloads.md).

## Should I repair a broken session or filesystem first?

Back up important data and identify the exact device, filesystem, and mount
point before changing anything. Never repair the only copy or an active session.
Start with [Backup and recovery](/administration/Backup-Recovery.md),
[Troubleshooting](/administration/Troubleshooting.md), and
[Boot recovery](/administration/Boot-Recovery.md).

## What should I include when asking for help or reporting an issue?

Record the edition and version, boot and persistence methods, hardware, exact
steps, first error, and relevant logs. Remove credentials and other sensitive
data, then follow [Collect logs](/administration/Troubleshooting.md)
and report reproducible defects in the
[MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

## Should I build from source or use Image Builder?

Build from source when you need to create the complete MiniOS system and module
set. Use [MiniOS Image Builder](/development/Image-Builder.md) for a guided
remaster, or [`minios-image-compose`](/development/Rebuilding-ISO.md) to compose
an existing MiniOS content tree from the command line. See
[Building MiniOS](/development/Building-MiniOS.md) for source builds.
