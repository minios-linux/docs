---
updated: 2026-08-26
program_commits:
  minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
  minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Composing MiniOS ISO images from the command line


`minios-image-compose` is the command-line backend supplied with MiniOS Image
Builder. It replaces the retired `sb2iso` utility. The command remasters an
existing MiniOS content tree, optionally changes its module set and supported
configuration, verifies the result, and publishes a bootable ISO.

Use the graphical [MiniOS Image Builder](/development/Image-Builder.md) for a
guided project workflow. Use this command directly for scripts, automation, or
reproducible command-line builds. For a complete source build, use
[Building MiniOS](/development/Building-MiniOS.md) instead.

## Basic usage

From a running MiniOS live session, create an ISO with the discovered MiniOS
source and `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Do not prefix the complete command with `sudo` or `pkexec`. Composition,
verification, and publication run as the current user. Only optional session
capture may invoke the trusted `/usr/bin/savechanges` backend through PolicyKit.

The default output name is `minios-YYYYMMDD_HHMM.iso`. An existing destination
is refused unless `--overwrite` is given explicitly.

## Select a source

Without `--source`, the command discovers the MiniOS content used by the current
LiveKit or dracut session. To remaster another mounted MiniOS tree, specify the
directory containing `boot/` and the MiniOS modules:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

The source is read-only input and is never modified. ISO files and optical media
must be mounted before using their MiniOS content tree with the CLI. The
graphical Image Builder can mount these sources through `udisksctl`.

## Select modules

Additional `.sb` modules are positional arguments:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

The command validates every module as a readable, non-symlink SquashFS file.
Modules whose names begin with two digits and a hyphen are placed at the MiniOS
top level. Other added modules are placed in `minios/modules/`. Duplicate or
case-insensitive basename collisions are rejected.

Exclude source paths with a POSIX extended regular expression:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Required boot files, kernel and initramfs files, core modules, the selected boot
menu, and the selected configuration cannot be excluded.

Create reusable modules before composing the ISO. See
[Creating modules](/development/Creating-Modules.md) and
[MiniOS Module Manager](/administration/Module-Manager.md).

## Configuration and manifest

`--config FILE` installs the selected regular file as
`minios/config.conf`. The default is `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

The optional manifest must be a JSON object. Volume labels contain 1 to 32
printable ASCII characters; labels outside the strict ISO 9660 uppercase,
digit, and underscore set produce a warning.

## Capture session changes

Session capture is optional and applies to the writable layer of the currently
running MiniOS session. It is accepted for an explicit source only when that
source has the same base-module fingerprint as the running system.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Available profiles are:

- `exact` captures every representable change and can include credentials,
  personal data, logs, browser state, and machine identity.
- `clean` uses a narrow software-oriented allowlist. It reduces exposure but
  does not prove that the result contains no secret.
- `selected` uses an inventory selection produced by a compatible frontend or
  `savechanges` workflow.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefer modules and declarative configuration over session capture when the ISO
will be shared. See [MiniOS Image Builder](/development/Image-Builder.md) for the
privacy model and review workflow.

## Customize boot behavior

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
`--menu` accepts `multilang` or a supported locale such as `en_US`, `ru_RU`,
or `de_DE`. Kernel arguments are validated and appended without shell
evaluation. Unsupported or ambiguous boot-menu layouts are rejected rather than
modified by guesswork.

## Add artwork or a filesystem overlay

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

The overlay is interpreted relative to the image root. It does not run scripts,
install packages, or open a chroot. Unsafe links, special files, filesystem
crossings, and destination collisions are rejected.

## Verification and publication

Before publication, `minios-image-compose` verifies the ISO filesystem tree,
volume label, BIOS and UEFI boot records, system area, boot files, modules, and
requested customization. Generated overlay and captured-session modules are
extracted and checked against their recorded metadata and digests.

The ISO is built in a private directory on the destination filesystem and is
published atomically only after verification succeeds. Input mutation,
verification failure, cancellation, or insufficient destination space prevents
publication. A previous destination remains unchanged unless an explicitly
approved `--overwrite` build reaches atomic publication.

Create a checksum and perform a separate boot test after a successful build:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Structural verification does not replace testing the intended BIOS and UEFI
paths in a disposable virtual machine or on suitable hardware.

## Command reference

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

The command exits nonzero when source, module, customization, storage,
verification, or publication checks fail. Do not distribute an output unless
the command completed successfully and the resulting checksum and boot paths
were tested.
