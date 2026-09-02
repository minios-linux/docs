---
updated: 2026-08-26
program_commits:
  minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
  minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---
# Creating custom MiniOS images


MiniOS Image Builder is a GTK application for remastering an existing MiniOS image. It selects content from a current MiniOS session, ISO file, or optical disc, applies declarative customization, and uses `minios-image-compose` to produce a verified bootable ISO.

The builder runs inside MiniOS. It does not modify the selected source media.

## Choose the correct workflow

MiniOS Image Builder remasters an existing binary MiniOS image. It is not a replacement for either of these workflows:

- **Build MiniOS from source:** use the `minios-live` build system when changing the distribution's package lists, build configuration, kernel layer, boot artifacts, or reproducible source-built module chain. See [Building MiniOS](/development/Building-MiniOS).
- **Create a reusable module:** use `apt2sb`, `script2sb`, `chroot2sb`, or the other module tools when the intended result is a standalone `.sb` layer. See [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remaster an image:** use MiniOS Image Builder when selecting existing modules, adding completed external modules, changing supported image settings, optionally capturing session changes, and publishing another ISO.

The project filesystem layer is for declarative files in the image root. It does not execute scripts, install packages, or open a chroot. Software intended for reuse should be prepared as a module before it is added to a MiniOS Image Builder project.

## Source options

The Source page accepts:

- The current LiveKit or dracut MiniOS session.
- A MiniOS ISO file.
- A MiniOS optical disc.

ISO and optical-disc sources are mounted read-only with `udisksctl`. Source inventory records the release, version, architecture, bootloader support, size, module inventory, and a source fingerprint. If a source changes after planning, the build is blocked rather than continuing with different input.

Session capture always describes changes in the currently running MiniOS session. When an ISO or optical disc is selected, capture is available only if that source's base-module fingerprint matches the mounted base of the running session. Selecting external media does not capture changes made in some other system.

## Requirements

MiniOS Image Builder requires the matching `minios-image-compose` backend. ISO-file and optical-disc sources require `udisks2`. Reading a root-only `/etc/live/config.conf` and capturing a writable session may require `pkexec` and a desktop PolicyKit agent. Session capture requires a compatible `savechanges` supplied by `minios-tools` 1.5.0 or newer.

The application and composition backend remain unprivileged. Authorization is limited to the fixed live-configuration reader and, when selected, trusted `/usr/bin/savechanges`.

## Project workflow

### Select the source

Choose a source and wait for inventory to finish. Review its identity, architecture, boot support, diagnostics, and module counts. Resolve source errors before proceeding.

### Select content

Choose the source modules to include and add any external `.sb` modules. Required core and kernel modules are locked. Modules active in the current session but absent from the selected source are shown separately and are not included automatically.

Additional modules must be readable regular files with valid SquashFS data. Duplicate or case-folded basenames and target collisions are rejected because the runtime resolves layers by basename.

### Configure settings

Choose the output path and the required current MiniOS configuration. Empty customization fields or `Keep current` preserve source behavior. Configure only the overrides needed for the new image, then decide whether the writable session layer should be captured.

The bytes of `/etc/live/config.conf` are copied into private build storage with mode 0600. They are not interpreted, displayed, or logged. Current projects must include this configuration; an older project that explicitly disables it cannot proceed to Review until corrected.

### Review the plan

Review creates a new plan from the current input identities. Check selected, excluded, and additional modules, output location, estimated space, customization summary, capture profile, warnings, and privilege boundary.

Review intentionally omits configuration values, raw kernel arguments, private customization paths, and selected capture paths. It shows counts, basenames, fingerprints, and digests where those are sufficient to bind the plan.

If the output already exists, replacement requires confirmation. The confirmation is tied to the observed device, inode, size, timestamp, and SHA-256 of that file. A changed destination, cancellation, or failed attempt clears approval and requires another review.

### Build and verify

Build revalidates every effective input and runs `minios-image-compose` with an argument list in a private working directory. The ISO remains private until structural verification succeeds. Publication to the selected destination is atomic.

Save the project if its source, module selection, output, and customization intent will be reused. Project files are JSON. Unsaved changes require confirmation before opening another project or closing the application.

## Session capture and privacy

Source modules, `/etc/live/config.conf`, and session capture are independent inputs. If module selection and declarative customization are sufficient, do not capture the writable session.

### Do not include session changes

This is the recommended default. The builder uses the selected modules, current configuration, boot settings, and other image customization without copying the writable session layer.

### Include all session changes

This profile preserves every supported writable change from the detected OverlayFS or AUFS provider. It can include passwords, keys, tokens, browser data, machine identity, personal files, logs, and deleted-file state. It requires explicit acknowledgement and should not be used for an image intended for other people without a separate audit.

### Include reusable changes only

This profile uses a strict path allowlist for software and safe defaults while omitting broad personal, identity, cache, and log state. It reduces exposure but does not prove that allowed files contain no secret. Inspect the finished image before sharing it.

### Choose session changes manually

Run `Analyze session changes`, then select at least one normalized path from the in-memory inventory. A selected directory represents its descendants. Exact or ancestor exclusions override matching selections.

The inventory contains metadata, including filenames, and is therefore sensitive even though it does not contain file contents. It stays in memory and is not written to the project or copied into Review or logs. Explicit include and exclude rules are project intent and are saved; Review shows only their count and digest.

Starting another analysis, refreshing or changing the source, cancellation or failure, and opening or creating a project clear the runtime inventory. Analysis and capture may request administrator authorization, but the MiniOS Image Builder process and ISO composition are not elevated.

## Image customization

Supported settings are constrained and validated by the backend:

- **System defaults:** hostname, timezone, default systemd target, and enabled or disabled services.
- **Security and access:** allowlisted sudo, PolicyKit, SSH, XRDP, X11, lock-screen, and issue-hint modes.
- **User data:** validated root-relative user directories with either link or bind behavior, not both.
- **Boot behavior:** a timeout from 0 to 300 seconds, the source menu or a constructed menu, and a selected default entry.
- **Boot entries:** resume, new, choose, fresh, and copy-to-RAM templates can be hidden, reordered, duplicated, and configured through typed persistence, module, startup, localization, zRAM, and diagnostic controls.
- **Expert boot settings:** validated global and per-entry kernel arguments for options not represented by typed controls.
- **Appearance:** a validated PNG boot background.
- **Project filesystem layer:** one real directory interpreted relative to image root and packaged as a root-owned SquashFS overlay module.

The filesystem layer supports regular files, safe relative symbolic links, empty directories, executable bits, and timestamps. Device nodes, sockets, FIFOs, filesystem crossings, absolute or escaping links, and unsafe names are rejected. Privilege bits are cleared and ownership in the generated module is normalized.

Boot customization supports recognized MiniOS GRUB, native SYSLINUX, and the standard SYSLINUX-to-GRUB chain. Unsupported or ambiguous boot configuration is rejected rather than guessed. A build without boot customization can preserve a source layout that the customization parser does not understand.

## Output verification

Before publication, `minios-image-compose` verifies the generated ISO rather than relying only on a successful `xorriso` exit. Checks include:

- The ISO filesystem tree and volume label.
- BIOS and UEFI boot records and the system area.
- Required boot, kernel, initramfs, configuration, and module content.
- Embedded customization and session-capture attestations when present.
- Digests and structure of generated overlay and captured-session modules.
- Boot background targets and transformed boot configuration when customized.

Input path identity, mode, modification time, and SHA-256 are recorded before the build. Mutable inputs are privately snapshotted with reflinks when supported; otherwise they are checked for mutation before and after ISO writing. A mismatch or verification failure prevents publication.

After a successful build, record a checksum separately:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Structural verification does not replace a boot test. Boot the ISO in a disposable virtual machine and test both BIOS and UEFI when both are intended to be supported. MiniOS Image Builder can report that QEMU or VirtualBox is installed, but it does not start or configure a hypervisor.

## Safety and cancellation

- Keep source media read-only and write output to a filesystem with enough free space for the estimate and temporary headroom.
- Do not build directly over the only known-good ISO. Use a new output name unless replacement is intentional and confirmed.
- Verify external modules before adding them. MiniOS Image Builder validates their SquashFS structure but does not establish who authored their contents.
- Prefer no session capture for distributable images. If capture is needed, audit the resulting filesystem, not only the profile name.
- Treat project files as sensitive when they contain explicit source paths, module paths, output paths, or selected capture rules.

Inventory, build, and verification subprocesses run in dedicated process groups. Cancellation requests termination and escalates after a grace period. A hashing pass may finish before cancellation reaches a safe checkpoint, but stale results are discarded. Once atomic publication starts, it is allowed to finish so the destination is not intentionally left half-written.

A cancelled or failed build does not publish its private ISO. Any previous destination remains in place unless a verified replacement reached atomic publication.

## Related documentation

- [Building MiniOS](/development/Building-MiniOS)
- [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Composing ISO images from the command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Composing MiniOS ISO images from the command line


`minios-image-compose` is the command-line backend supplied with MiniOS Image Builder. It replaces the retired `sb2iso` utility. The command remasters an existing MiniOS content tree, optionally changes its module set and supported configuration, verifies the result, and publishes a bootable ISO.

Use the graphical [MiniOS Image Builder](/preparing-and-customizing/Creating-Custom-MiniOS-Images) for a guided project workflow. Use this command directly for scripts, automation, or reproducible command-line builds. For a complete source build, use [Building MiniOS](/development/Building-MiniOS) instead.

### Basic usage

From a running MiniOS live session, create an ISO with the discovered MiniOS source and `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Do not prefix the complete command with `sudo` or `pkexec`. Composition, verification, and publication run as the current user. Only optional session capture may invoke the trusted `/usr/bin/savechanges` backend through PolicyKit.

The default output name is `minios-YYYYMMDD_HHMM.iso`. An existing destination is refused unless `--overwrite` is given explicitly.

### Select a source

Without `--source`, the command discovers the MiniOS content used by the current LiveKit or dracut session. To remaster another mounted MiniOS tree, specify the directory containing `boot/` and the MiniOS modules:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

The source is read-only input and is never modified. ISO files and optical media must be mounted before using their MiniOS content tree with the CLI. The graphical MiniOS Image Builder can mount these sources through `udisksctl`.

### Select modules

Additional `.sb` modules are positional arguments:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

The command validates every module as a readable, non-symlink SquashFS file.
Modules whose names begin with two digits and a hyphen are placed at the MiniOS top level. Other added modules are placed in `minios/modules/`. Duplicate or case-insensitive basename collisions are rejected.

Exclude source paths with a POSIX extended regular expression:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Required boot files, kernel and initramfs files, core modules, the selected boot menu, and the selected configuration cannot be excluded.

Create reusable modules before composing the ISO. See [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules) and [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules).

### Configuration and manifest

`--config FILE` installs the selected regular file as `minios/config.conf`. The default is `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

The optional manifest must be a JSON object. Volume labels contain 1 to 32 printable ASCII characters; labels outside the strict ISO 9660 uppercase, digit, and underscore set produce a warning.

### Capture session changes

Session capture is optional and applies to the writable layer of the currently running MiniOS session. It is accepted for an explicit source only when that source has the same base-module fingerprint as the running system.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Available profiles are:

- `exact` captures every representable change and can include credentials, personal data, logs, browser state, and machine identity.
- `clean` uses a narrow software-oriented allowlist. It reduces exposure but does not prove that the result contains no secret.
- `selected` uses an inventory selection produced by a compatible frontend or `savechanges` workflow.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefer modules and declarative configuration over session capture when the ISO will be shared. See [MiniOS Image Builder](/preparing-and-customizing/Creating-Custom-MiniOS-Images) for the privacy model and review workflow.

### Customize boot behavior

The CLI can change supported GRUB and SYSLINUX layouts:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` accepts `resume`, `new`, `choose`, `fresh`, or `toram`.
`--menu` accepts `multilang` or a supported locale such as `en_US`, `ru_RU`, or `de_DE`. Kernel arguments are validated and appended without shell evaluation. Unsupported or ambiguous boot-menu layouts are rejected rather than modified by guesswork.

### Add artwork or a filesystem overlay

Replace the boot background with a validated PNG:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Package one prepared directory tree as a root-owned image overlay module:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

The overlay is interpreted relative to the image root. It does not run scripts, install packages, or open a chroot. Unsafe links, special files, filesystem crossings, and destination collisions are rejected.

### Verification and publication

Before publication, `minios-image-compose` verifies the ISO filesystem tree, volume label, BIOS and UEFI boot records, system area, boot files, modules, and requested customization. Generated overlay and captured-session modules are extracted and checked against their recorded metadata and digests.

The ISO is built in a private directory on the destination filesystem and is published atomically only after verification succeeds. Input mutation, verification failure, cancellation, or insufficient destination space prevents publication. A previous destination remains unchanged unless an explicitly approved `--overwrite` build reaches atomic publication.

Create a checksum and perform a separate boot test after a successful build:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Structural verification does not replace testing the intended BIOS and UEFI paths in a disposable virtual machine or on suitable hardware.

### Command reference

Use the installed manual and help output for the exact backend version:

```bash
minios-image-compose --help
man minios-image-compose
```

Common options include:

| Option | Purpose |
|---|---|
| `-n`, `--name FILE` | Set the output path. |
| `-e`, `--exclude REGEX` | Exclude matching source paths. |
| `--source DIR` | Select an explicit MiniOS content tree. |
| `--config FILE` | Select the live configuration embedded in the ISO. |
| `--manifest FILE` | Include a validated JSON build manifest. |
| `--capture-changes MODE` | Capture `exact`, `clean`, or `selected` session changes. |
| `--boot-timeout SECONDS` | Set a boot-menu timeout from 0 to 300 seconds. |
| `--default-boot MODE` | Select the default MiniOS session action. |
| `--kernel-args TEXT` | Append validated global kernel arguments. |
| `--boot-background PNG` | Replace supported boot artwork. |
| `--overlay-directory DIR` | Add one declarative filesystem layer. |
| `--menu TYPE` | Select a multilingual or localized menu. |
| `--overwrite` | Explicitly allow replacement of an existing output. |

The command exits nonzero when source, module, customization, storage, verification, or publication checks fail. Do not distribute an output unless the command completed successfully and the resulting checksum and boot paths were tested.
