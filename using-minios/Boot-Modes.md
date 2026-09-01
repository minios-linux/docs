---
updated: 2026-08-31
---
# Boot modes

The boot mode determines whether MiniOS starts cleanly, opens a saved session, or runs as a conventional installed system. You do not need to understand the internal boot process to make this choice.

Menu labels can differ slightly between releases, firmware modes, and boot tools. Choose by the result you need rather than by the exact wording.

## Quick choice

The normal default entry is **Start MiniOS**. It uses automatic persistence selection: MiniOS tries to resume a compatible default session and can create a compatible replacement when no usable session exists and suitable writable storage is available.

| Menu entry | Use it when | Are changes saved? | Keep the USB connected? |
|---|---|---|---|
| **Start MiniOS** (default) | Normal portable use | Yes, if automatic persistence activation succeeds | Yes |
| **Start a new session** | You want a separate new workspace | Only if the new session is created and activated successfully | Yes |
| **Choose a saved session** | You want to select one of several existing workspaces | Only if the selected session activates successfully | Yes |
| **Start without saving** | You want a clean temporary boot without persistence | No | Yes |
| **Run from RAM** | You want to copy MiniOS into RAM for this boot | No; treat the RAM copy as temporary | Until MiniOS has successfully detached the source |

For a normal first boot, leave **Start MiniOS** selected. Use **Start without saving** when you specifically need a clean temporary hardware test or recovery session that must not open or create persistence.

::: warning Confirm that persistence is active
Choosing a persistent menu entry requests a session; it does not guarantee that the session can be opened. If storage is read-only, full, damaged, or incompatible, MiniOS can continue without saving changes. Check the startup warning before beginning work that must be retained.
:::

## Start MiniOS

**Start MiniOS** is the first and default menu entry. It is intended for normal use, including the first boot of a newly prepared MiniOS device.

MiniOS automatically looks for a compatible persistent session. If a usable default session exists, it resumes that session. If none exists, MiniOS can create a compatible session automatically when suitable writable storage is available.

If persistence cannot be created or activated because the storage is read-only, full, damaged, or otherwise unsuitable, MiniOS continues with a temporary writable layer and reports that the session is not persistent. Check that warning before doing work that must survive a reboot.

## Start a new session

MiniOS creates an additional numbered persistent session and leaves the existing sessions unchanged. Use this to keep separate workspaces or to test a new configuration without replacing your current working session.

Creation requires writable compatible storage and enough free space. A new session is not a backup of an existing one.

## Choose a saved session

MiniOS displays available saved sessions and lets you select one. Use this when one device contains several workspaces. To create the first session on empty storage, choose **Start a new session** instead.

A session can be incompatible when it comes from another MiniOS release or edition. A different `union=` setting can also make a session incompatible.
Interactive selection does not make an incompatible session safe.

## Start without saving

This mode deliberately disables persistence for the current boot. MiniOS uses a temporary writable area in RAM, so files created in the live system, installed packages, and changed settings disappear at shutdown.

Use this mode when you specifically want to:

- test hardware without opening or creating a persistent session;
- diagnose a problem without changing saved state;
- work temporarily when nothing needs to be retained.

Starting without saving does not mean that the boot medium can be removed. The running system normally continues reading its system modules from that medium.

## Run from RAM

This mode copies MiniOS data into RAM to reduce reads from the source. It needs enough memory for the copied system and the running workload.

Treat a RAM-loaded session as temporary. Combining `toram` with persistence copies the selected session data into RAM; later changes are not copied back to the original persistence store.

Do not remove the boot device merely because **Run from RAM** was selected. It is safe only after MiniOS has successfully detached the source filesystem, ISO loop, and any Ventoy mappings. If that operation fails, the source remains in use.

## Native installation

::: warning Native installation changes the system model
A native installation keeps the familiar MiniOS desktop experience — its visual identity, selected desktop environment, and ordinary applications — but converts the live image into a conventional Debian desktop. MiniOS-specific tools for sessions, modules, modular kernels, and other live workflows are removed because those features no longer apply.
:::

After native conversion, use the normal Debian package, kernel, configuration, and bootloader tools. The result remains visually familiar and keeps the ordinary desktop applications from the selected edition, but the MiniOS-specific live feature set is no longer present. The MiniOS live architecture is described in [About MiniOS](/getting-started/About-MiniOS).

Use [MiniOS Installer](/installing-minios/MiniOS-Installer) only when you deliberately want that conversion and the selected image supports native deployment.

## When you need more detail

- [Boot menus](/preparing-and-customizing/Customizing-the-Boot-Menu) explains navigation and temporary editing of a menu entry.
- [Session management](/using-minios/Sessions-and-Persistence) explains storage modes, session creation, resizing, and removal.
- [Boot parameters](/reference/Boot-Parameters) is the complete command-line reference.
- [Initrd system discovery](/reference/boot-process/System-Discovery), [module loading](/reference/boot-process/Module-Loading), and [persistence](/reference/boot-process/Persistence-Internals) explain how the related parameter groups are processed during startup.
