---
updated: 2026-08-31
program_commits:
  minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---
# Managing modules


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

For the authoritative boot-time rules, including candidate source tiers, exact-basename replacement, numeric ordering, and `load=`, `noload=`, and `bext=` filtering, see [Initrd module loading](/reference/boot-process/Module-Loading). That guide also explains why Running Now and Next Boot can differ.

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

Current Session Changes is intended for convenient standard capture, not for reviewing every included path. A live writable layer can contain personal or confidential data. For explicit `exact`, `clean`, or path-selected privacy policies, use the command-line `savechanges` workflow described in [Creating modules](/preparing-and-customizing/Managing-Modules).

## Drag and drop

Drag and drop only fills an input or opens inspection:

- A module opens its details.
- `.deb` files are added to Packages.
- A directory is selected for Folder.
- Another regular file is selected as an Installation Script.

Dropping an item does not execute code or change Running Now or Next Boot.

## Related documentation

- [Creating modules](/preparing-and-customizing/Managing-Modules)
- [Initrd module loading](/reference/boot-process/Module-Loading)
- [Boot modes](/using-minios/Boot-Modes)
- [Composing ISO images from the command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Boot parameters](/reference/Boot-Parameters)

## Creating modules


MiniOS modules are read-only SquashFS filesystem images, conventionally named with the `.sb` extension. At boot, MiniOS orders selected modules into a layered root filesystem. Files in a higher-priority layer can supplement or hide files from lower layers. This modular live pipeline is part of the defining MiniOS architecture described in [About MiniOS](/getting-started/About-MiniOS) and [Boot modes](/using-minios/Boot-Modes). After native conversion, the layered `.sb` root is replaced by a conventional writable Debian filesystem. The MiniOS module-management software is removed because module workflows no longer apply, while the selected desktop environment and ordinary applications remain installed as normal packages.

This guide documents the current MiniOS Tools command-line workflows. For the graphical application, see [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules). For the complete image build process and system architecture, see [Building MiniOS](/development/Building-MiniOS). Package lists used while building MiniOS are described in the [CondinAPT documentation](/development/CondinAPT).

### Safety and privilege boundaries

Not every module operation requires root:

| Operation | Privilege |
|---|---|
| List Running Now or Next Boot with `sb` | Rootless |
| Inspect a module with `sb inspect` | Rootless |
| Ordinary `dir2sb` and `sb2dir` conversion | Rootless |
| Preserve ownership or allow special files during conversion | Root |
| Build with `apt2sb`, `script2sb`, or `chroot2sb` | Root |
| Capture the session with `savechanges` | Root |
| Activate, deactivate, add to Next Boot, or remove from Next Boot | Root |

The builders use an isolated union and do not install packages or script changes into the running root. Creation also does not activate the result or select it for the next boot.

Current converters and builders use no-replace publication. A target that already exists, including a symbolic link, is not overwritten. Choose a new output path or explicitly review and remove the old output yourself.

Use each command's `--help` output as the installed-version reference. The standard builder compression choices are `zstd` (the default), `gzip`, `lzo`, and `xz`; `dir2sb` also supports `lz4`.

### Module names and filter levels

Names commonly start with a number such as `06-browser.sb` because layer order affects conflict resolution. A module should contain paths relative to the system root, such as `usr/bin/example`, not an extra directory containing that tree.

For the exact candidate source tiers, basename-collision behavior, numeric ordering, and `bext=`, `load=`, and `noload=` semantics, see [Initrd module loading](/reference/boot-process/Module-Loading). In particular, use a unique basename unless the module is intended to replace the same-named slot from an earlier source tier.

The `--level LEVEL` option on `apt2sb`, `script2sb`, and `chroot2sb` limits the base layers used to construct the build union. With `--level 3`, numbered layers through `03` are used and higher-numbered layers are filtered out. This can make a module less dependent on optional higher layers, at the cost of including more dependencies in the result.

### Create a module from packages

`apt2sb` installs repository packages or readable local `.deb` files into a private build union and captures the result. It requires a supported MiniOS live session and root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Without `--name`, the output name is derived from the first package. Useful APT options include `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, and `--target-release RELEASE`. The target-release option applies only to `install`.

To capture upgrades to already installed packages:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Create a module from a script

`script2sb` copies an installation script into a private chroot, makes it executable, runs it as root without an interactive terminal, removes it, and captures the resulting filesystem changes. A failed script creates no module.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

The optional `--directory DIR` copies all source contents, including dotfiles, into the module root before the script runs. Arrange the seed directory as a filesystem tree:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Review the script before running it. It executes with administrator privileges and can run arbitrary commands. Use `chroot2sb` instead if installation requires prompts or manual work.

### Create a module interactively

`chroot2sb` creates a private build union and opens a root shell inside it. Install packages or edit files, then exit the shell to capture the changes:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Commands entered in the shell are not replayed when the module loads; the module is a snapshot of the resulting filesystem state. Shell history is removed from the result. If no name is supplied, the generated name uses the current date and time.

The split `prepare`, `shell`, `finish`, and `cancel` lifecycle exists for protected graphical frontends. For normal terminal use, use the single interactive command shown above.

### Create a module from a directory

`dir2sb` packages the contents of a prepared directory into a new module. Both operands are required:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Ordinary conversion is rootless. It leaves the source unchanged, normalizes ownership inside the module to root, rejects device nodes, sockets, and FIFOs, and never overwrites the target. Use `--keep-ownership` or `--allow-special` only when those privileged semantics are required.

### Capture current-session changes

`savechanges` reads the authoritative writable layer of a running MiniOS session. It requires root because that layer can contain root-only files. The default changes location is detected automatically:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Without `--profile`, the historical MiniOS policy omits empty directories, caches, logs, boot data, runtime paths, pseudo-filesystems, and selected session and system files. This is convenient for traditional module creation, but it is not an explicit privacy guarantee.

The explicit profiles are:

- `exact` preserves representable changes, including user data, logs, caches, identity files, credentials, and supported deletion metadata. It rejects unsupported filesystem objects rather than silently losing them.
- `clean` uses a narrow software-oriented path allowlist. It excludes home and root data, logs, caches, identities, network configuration, credentials, arbitrary system configuration, and `/usr/local`. It reduces privacy exposure but cannot guarantee that an allowed software file contains no secret.
- `selected` includes only reviewed relative paths from an inventory and selection file. Explicit exclusions win. This is the appropriate profile when the module must contain a controlled subset of session changes.

Examples:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

A selection file has this strict JSON structure:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Paths are normalized, nonempty paths relative to the changes root. Generate and review the inventory first; each include must match inventory data. Inventory records metadata such as path, type, category, sensitivity, and size, but does not read or emit file contents, symbolic-link targets, or secret values. Explicit-profile outputs and inventories are mode `0600`; legacy-policy modules are mode `0644`.

Session capture can retain supported file deletions and directory opacity for the active AUFS or OverlayFS backend. It excludes runtime mounts, nested filesystems, union bookkeeping, and the output itself. An existing target is never replaced.

### Inspect and extract modules

Inspect a module without mounting or extracting it:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Inspection is rootless and also works outside a running MiniOS session.

Extract a module into a new directory:

```bash
sb2dir 06-example.sb example-root
```

Ordinary extraction is rootless and does not modify the source. The target directory must not exist. Special files are rejected unless `--allow-special` is requested with sufficient privilege.

Directories produced by current `sb2dir` are ordinary directories. `rmsbdir`, `sb rm`, and `sb rmdir` are retired compatibility commands that always refuse removal; they do not unmount or recursively delete anything. Review an extracted path and its contents before removing it with standard filesystem tools.

### Manage running and next-boot modules

Running Now and Next Boot are independent compositions. See [union construction and runtime activation](/reference/boot-process/Module-Loading) for the boot/runtime boundary and why the two lists can differ.

List the modules actually composing the current AUFS or OverlayFS root, from lowest to highest priority:

```bash
sb list
sb list --json
```

List the modules selected by the current boot rules:

```bash
sb next-boot
sb next-boot --json
```

These queries are rootless. The canonical [candidate-tier and replacement rules](/reference/boot-process/Module-Loading) determine which source supplies each Next Boot basename.

To make a user module available at the next boot:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS uses suitable durable writable storage, stages and validates the copy, and publishes it atomically without replacing an existing module. The filename must satisfy current boot filters. Remove a selected user module by its exact basename:

```bash
sudo sb next-boot remove 50-extra.sb
```

Removal is refused for base modules and modules on read-only or volatile sources.

Runtime activation is a separate, session-only operation:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Activation and deactivation work only when `/` is currently an AUFS union. They are unavailable on OverlayFS, and kernel AUFS support alone is not enough. Neither command changes Next Boot.

The compatibility converter dispatcher requires both operands:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Direct `dir2sb` and `sb2dir` use is preferable because ordinary conversion can run rootlessly.

### Related documentation

- [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules)
- [Initrd module loading](/reference/boot-process/Module-Loading)
- [Boot modes](/using-minios/Boot-Modes)
- [Rebuilding ISO images](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Building MiniOS](/development/Building-MiniOS)
- [Boot parameters](/reference/Boot-Parameters)
