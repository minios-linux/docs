# MiniOS Module Manager

MiniOS Module Manager is the graphical application for inspecting, creating, and managing MiniOS `.sb` modules. It has two workspaces: **Modules** for system composition and **Create** for making new modules.

Start it from the application menu or run:

```bash
minios-module-manager
```

The application itself runs as your desktop user. It asks for administrator authentication only when a requested operation needs it.

## Running now and next boot

The Modules workspace keeps two separate views:

- **Running Now** is the ordered set of modules that currently composes the live system.
- **Next Boot** is the ordered set selected by the current MiniOS boot rules.

Changing one view does not silently change the other. For example, **Activate for This Session** affects only the running system, while **Add to Next Boot** copies a module to durable module storage without activating it now.

Runtime activation and deactivation are available only when the root filesystem is currently using AUFS. They are not available on an OverlayFS root, even if the kernel supports AUFS. Base modules cannot be deactivated through the application.

Next-boot changes are available only when MiniOS finds suitable durable, writable module storage. Base modules and modules on read-only or volatile storage cannot be removed. Boot filters such as `load`, `noload`, and `bext` still determine which modules are selected.

## Inspecting a module

Select a module to see its source, compressed size, and filesystem contents. If its backing file is available, **Extract to Folder** creates a new directory containing the module files.

Inspection and ordinary extraction do not require administrator privileges. Extraction never replaces an existing destination.

You can also open a local `.sb` file from the file manager. Opening a file only inspects it; it does not activate it or add it to Next Boot.

## Creating a module

The Create workspace uses a **Configure**, **Review**, **Run**, and **Result** flow. A successfully created module remains a file at the output location. It is not activated and is not added to Next Boot automatically.

Available methods are:

- **Packages** installs repository packages and selected local `.deb` files, including their dependencies, in an isolated MiniOS build environment. Package installation requires administrator authentication.
- **Installation Script** runs a reviewed script without an interactive terminal. An optional seed folder can provide initial files. The script runs with administrator privileges but is not stored in the resulting module.
- **Interactive Chroot** opens a temporary root shell in the embedded terminal. Type `exit` when finished, then create the module, reopen the shell, or discard the changes. Closing or discarding the session does not alter the running system.
- **Folder** packages the contents of an existing directory. The source directory itself is not nested inside the module. Ordinary folder conversion is rootless, leaves the source unchanged, and normalizes ownership in the module to root.
- **Current Session Changes** captures eligible files and deletions from the current writable session layer. It uses the standard MiniOS `savechanges` policy, which omits logs, caches, boot data, and temporary runtime paths. Reading the full writable layer requires administrator authentication.

Choose a new output path for every workflow. Existing files are never overwritten. Progress and backend diagnostics remain visible while an operation runs, and current-session capture can be cancelled.

Current Session Changes is intended for convenient standard capture, not for reviewing every included path. A live writable layer can contain personal or confidential data. For explicit `exact`, `clean`, or path-selected privacy policies, use the command-line `savechanges` workflow described in [Creating modules](/development/Creating-Modules.md).

## Drag and drop

Drag and drop only fills an input or opens inspection:

- A module opens its details.
- `.deb` files are added to Packages.
- A directory is selected for Folder.
- Another regular file is selected as an Installation Script.

Dropping an item does not execute code or change Running Now or Next Boot.

## Related documentation

- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO images](/development/Rebuilding-ISO.md)
- [Boot parameters](/configuration/Boot-Parameters.md)
