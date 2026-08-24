# Creating modules

MiniOS modules are read-only SquashFS filesystem images, conventionally named with the `.sb` extension. At boot, MiniOS orders selected modules into a layered root filesystem. Files in a higher-priority layer can supplement or hide files from lower layers.

This guide documents the current MiniOS Tools command-line workflows. For the graphical application, see [MiniOS Module Manager](/administration/Module-Manager.md). For the complete image build process and system architecture, see [Building MiniOS](/development/Building-MiniOS.md). Package lists used while building MiniOS are described in the [CondinAPT documentation](/development/CondinAPT.md).

## Safety and privilege boundaries

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

## Module names and filter levels

Names commonly start with a number such as `06-browser.sb` because layer order affects conflict resolution. A module should contain paths relative to the system root, such as `usr/bin/example`, not an extra directory containing that tree.

The `--level LEVEL` option on `apt2sb`, `script2sb`, and `chroot2sb` limits the base layers used to construct the build union. With `--level 3`, numbered layers through `03` are used and higher-numbered layers are filtered out. This can make a module less dependent on optional higher layers, at the cost of including more dependencies in the result.

## Create a module from packages

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

## Create a module from a script

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

## Create a module interactively

`chroot2sb` creates a private build union and opens a root shell inside it. Install packages or edit files, then exit the shell to capture the changes:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Commands entered in the shell are not replayed when the module loads; the module is a snapshot of the resulting filesystem state. Shell history is removed from the result. If no name is supplied, the generated name uses the current date and time.

The split `prepare`, `shell`, `finish`, and `cancel` lifecycle exists for protected graphical frontends. For normal terminal use, use the single interactive command shown above.

## Create a module from a directory

`dir2sb` packages the contents of a prepared directory into a new module. Both operands are required:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Ordinary conversion is rootless. It leaves the source unchanged, normalizes ownership inside the module to root, rejects device nodes, sockets, and FIFOs, and never overwrites the target. Use `--keep-ownership` or `--allow-special` only when those privileged semantics are required.

## Capture current-session changes

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

## Inspect and extract modules

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

## Manage running and next-boot modules

Running Now and Next Boot are independent compositions.

List the modules actually composing the current AUFS or OverlayFS root, from lowest to highest priority:

```bash
sb list
sb list --json
```

List the modules selected by current boot rules, including `bext`, `load`, and `noload`:

```bash
sb next-boot
sb next-boot --json
```

These queries are rootless. A next-boot module can come from the base data tree, its `modules/` directory, or separate persistence module storage. A later source with the same basename replaces the earlier selection.

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

## Related documentation

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [Rebuilding ISO images](/development/Rebuilding-ISO.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Boot parameters](/configuration/Boot-Parameters.md)
