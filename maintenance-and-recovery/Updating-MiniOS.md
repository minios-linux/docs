---
updated: 2026-08-31
---
# Updating MiniOS

MiniOS does **not** have a supported in-place upgrade procedure from one MiniOS release to another. The modular live system is assembled from read-only SquashFS modules plus a writable session layer, so changing Debian packages in the running system does not replace the MiniOS release itself.

::: warning A newer MiniOS release is a new installation
There is no MiniOS equivalent of `dist-upgrade` that turns an installed or persistent copy of one MiniOS release into another release. Moving to a newer MiniOS release means installing that release and then migrating the data and settings you want to keep.
:::

## APT is allowed

MiniOS does not block or forbid APT. You can install and update Debian packages when that is useful:

```bash
sudo apt update
sudo apt upgrade
```

### Modular live MiniOS

In a live MiniOS session, APT writes package files and package metadata to the writable layer. With persistence, those changes can survive a reboot. The read-only `.sb` modules below that layer are not changed; updated files in the session simply override files from the modules.

This is package maintenance **inside that session**, not an update of MiniOS.
It also consumes persistence space and can make the session differ substantially from the published image. A fresh session still starts from the package set contained in the MiniOS modules.

Do not change APT sources to another Debian release and run `upgrade`, `full-upgrade`, or `dist-upgrade` expecting to obtain a newer MiniOS release.
That creates a mixed system state; it does not reproduce the module set, boot files, firmware selection, MiniOS packages, or other choices of a published MiniOS release.

### After native conversion

A native installation created by MiniOS Installer is a conventional Debian desktop rather than the modular MiniOS live system. It keeps the familiar MiniOS desktop experience, including the selected desktop environment, visual identity, and ordinary applications, while the MiniOS-specific live software is removed. The resulting system has a writable root filesystem: APT updates packages normally, the kernel is managed through Debian packages, and the installed bootloader and initramfs use the conventional Debian workflow.

The MiniOS release-upgrade model therefore does not apply to that converted system. The MiniOS visual identity and ordinary desktop software can remain, while ongoing maintenance follows the normal Debian model rather than the MiniOS module/session workflow.

## Moving to a newer MiniOS release

Treat a newer MiniOS release as a separate system:

1. Download and [verify](/installing-minios/Verifying-Downloads) the new image.
2. Back up important files, configuration, user modules, and persistent sessions as described in [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Install the new release using the appropriate [installation method](/installing-minios/Installation-Methods).
4. Boot it with a fresh session first and verify the hardware and applications you need.
5. Migrate personal files and selected configuration. Where Session Manager can export the old session, import its archive and let the compatibility checks run instead of copying a live session store by hand.
6. Rebuild or reinstall custom modules when they are not known to be compatible with the target release.

Keep the old installation or backup until the new release has been tested.
Do not combine base modules, boot files, kernel files, or initramfs files from different MiniOS releases in an attempt to manufacture an upgrade.

## Modules and kernels are separate maintenance tasks

A user-created `.sb` module can be replaced or rebuilt independently when that is intentional. That changes a customization layer; it does not change the MiniOS release. See [Managing modules](/preparing-and-customizing/Managing-Modules).

The MiniOS kernel is also managed as a coordinated kernel module, `vmlinuz`, and initramfs set. Use [Managing kernels](/preparing-and-customizing/Managing-Kernels) for that operation. Updating only a `linux-image` package with APT is not the MiniOS kernel-management workflow, and changing the kernel does not update the MiniOS release.
