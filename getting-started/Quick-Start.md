---
updated: 2026-08-31
---
# Quick start

This guide takes you from a downloaded MiniOS image to a working system. It covers only the decisions needed for a first start; the linked guides explain each topic in detail.

## 1. Download MiniOS

Choose the edition that best matches what you want to do:

| Edition | Best suited for |
|---|---|
| **Standard** | **Recommended for most users and for a first MiniOS experience.** A minimal system with basic functionality and a compact, efficient Xfce desktop for everyday computing. |
| **Toolbox** | A system administration and diagnostics edition for professional IT work and system recovery. It includes Standard plus the corresponding administration, recovery, network, hardware-testing, backup, and remote-access tools. |
| **Ultra** | A full-featured desktop with a wide range of applications and professional tools for creativity and development. It includes Toolbox plus office, graphics, video, audio, 3D, development, and container software. |
| **Flux** | An ultra-lightweight Fluxbox edition for minimal resource use and older hardware. It has a reduced application set and fewer desktop conveniences than Standard. **Not recommended for beginners.** |

Exact package and desktop availability depends on the release. See [About MiniOS](/getting-started/About-MiniOS) for the edition model and [Packages and editions](/reference/Package-and-Edition-Contents) for the maintained package selection.

Download the ISO from the [MiniOS website](https://minios.dev), the official [GitHub Releases page](https://github.com/minios-linux/minios-live/releases), or [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verify the download

Verify the ISO before installing it. MiniOS releases provide a matching `.iso.sha256` file; see [Verifying downloads](/installing-minios/Verifying-Downloads) for Linux, macOS, and Windows commands.

## 3. Install MiniOS

For MiniOS, writing the system to removable media is already an installation method: the resulting device is a bootable MiniOS system.

Choose the method by the result you want from the device:

| What you want | Method | Result |
|---|---|---|
| A normal USB drive that also boots MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) in its normal ISO mode or [File-based installation](/installing-minios/Manual-File-Based-Installation) | MiniOS files and bootloader live on a normal filesystem, so the drive can still be used for ordinary files |
| MiniOS together with other ISO images | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy keeps its normal data partition, supports multiboot, and MiniOS supports persistent sessions on this layout |
| A managed portable MiniOS installation | [MiniOS Installer](/installing-minios/MiniOS-Installer) in **Live** mode | Creates a modular MiniOS installation and can configure persistent storage |
| An exact block-for-block copy of the ISO | [Rufus](/installing-minios/installation-tools/Rufus) in DD mode, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Drive Utility](/installing-minios/installation-tools/Drive-Utility), or [`dd`](/installing-minios/installation-tools/dd) | Reproduces the ISO block layout; simple and predictable, but the device no longer behaves like an ordinary general-purpose flash drive |

For a portable drive that you also want to use for normal file storage, prefer Rufus in ISO mode, a file-based installation, Ventoy, or a suitable Live installation made by MiniOS Installer. Raw image writing is useful when an exact copy of the published image matters more than reusing the device as general storage.

::: danger Check the target device
Most installation methods overwrite some or all data on the selected device.
Back up anything important and verify the device model and capacity before starting.
:::

See [Installing MiniOS](/installing-minios/Installation-Methods) for the differences between raw image writing, Ventoy, file-based layouts, and MiniOS Installer.

## 4. Start MiniOS for the first time

1. Restart the computer with the MiniOS device attached.
2. Open the computer's firmware boot menu and select that device.
3. Leave the default **Start MiniOS** entry selected and start the system.
4. Check that graphics, keyboard, networking, and the storage devices you need work correctly.

**Start MiniOS** is the normal default boot mode. It uses automatic persistence selection: MiniOS tries to resume a compatible default session and, when no usable session exists, can create a compatible one if suitable writable storage is available. If persistence cannot be activated, MiniOS continues with a temporary writable layer and reports that changes will not be saved.

This means that a normal first boot does not require you to create a session in advance. Choose **Start without saving** only when you deliberately want a clean temporary boot that will not open or create a persistent session.

See [Boot modes](/using-minios/Boot-Modes) for the other startup choices. If the device does not boot or important hardware does not work, see [Hardware compatibility](/getting-started/Hardware-Compatibility) and [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

## 5. Choose another session behavior when needed

For normal portable use, keep using the default **Start MiniOS** entry. Choose a different mode only when you need a different result:

| Boot choice | Use it when | Result |
|---|---|---|
| **Start MiniOS** (default) | Normal portable use | Automatically resumes a compatible default session or creates one when supported |
| **Start a new session** | You want a separate additional workspace | Creates an additional numbered persistent session and keeps existing sessions unchanged |
| **Choose a saved session** | You want to select one of several existing workspaces | Lets you choose an existing session interactively |
| **Start without saving** | You want a clean temporary boot without persistence | Uses a temporary writable layer in RAM |
| **Run from RAM** | You want to copy MiniOS into RAM for this boot | Runs from a RAM copy; treat changes as temporary |

Automatic persistence still requires suitable writable storage. A raw ISO write does not by itself prepare persistent storage. File-based installations, Ventoy layouts, and Live installations made by [MiniOS Installer](/installing-minios/MiniOS-Installer) can provide writable layouts for persistent MiniOS use. Existing sessions can be inspected and managed with [Session management](/using-minios/Sessions-and-Persistence).

Before relying on persistence, reboot once and confirm that MiniOS reports the expected session as active and that a test change survives the reboot.

## 6. Preconfigure MiniOS

Most MiniOS-specific configuration tools prepare settings for a later boot or a new session rather than changing the running desktop immediately.

Use **MiniOS Configurator** for this preconfiguration: locale, timezone, keyboard, hostname, services, account defaults, security policy, and other MiniOS startup settings. Open it from the application menu or run:

```bash
minios-configurator
```

Use the standard desktop and Linux tools for ordinary runtime settings such as network connections, audio, display configuration, and application preferences.
Some MiniOS Configurator settings apply on the next boot, while account and security settings may be used only when a new session is created. See [MiniOS Configurator](/preparing-and-customizing/Preconfiguring-MiniOS) for the exact behavior.

## Next steps

Once MiniOS is booting and retaining the state you need:

- [MiniOS applications and tools](/using-minios/MiniOS-Applications) — see the MiniOS-specific utilities available in the system.
- [Network configuration](/using-minios/Networking) — use NetworkManager normally or prepare MiniOS wired preconfiguration.
- [MiniOS Store](/using-minios/Installing-Software) — install applications from the MiniOS catalog.
- [Module Manager](/preparing-and-customizing/Managing-Modules) — inspect and manage MiniOS modules.
- [Backup and recovery](/maintenance-and-recovery/Backing-Up-MiniOS) — protect a system you plan to keep using.
