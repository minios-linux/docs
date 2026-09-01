---
updated: 2026-08-31
program_commits:
  minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---
# Building MiniOS

MiniOS is assembled from a core SquashFS image, ordered extension modules, kernel and boot files, and generated configuration. This page describes the current source-tree build interfaces and the dependencies between their outputs.

Run `./minios-cmd --help`, `./minios-live --help`, and inspect the selected `build.conf` before building. Those files are authoritative for the checked-out version.

## Requirements

Build on Debian or Ubuntu with enough free space below `BUILD_DIR` and `/tmp`.
A typical desktop target needs at least 20 GiB. Build operations require root for debootstrap, chroots, mounts, loop devices, and image creation; displaying help does not.

The authoritative host package list is `linux-live/prerequisites.list`. For the current checkout it can be installed with:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

In a source checkout, `minios-live` checks this list before building unless `SKIP_SETUP_HOST=true`. On a normal host it reports missing packages and stops; automatic installation is used only by the container build path.

The default configuration checks Internet connectivity. The check can be disabled with `CHECK_INTERNET_CONNECTION=false` and is skipped for a prepared APT cache repository, but all required package and boot-file inputs must still be available from configured repositories or caches.

If `USE_APT_CACHER=true`, a reachable apt-cacher-ng service must already be configured at `APT_CACHER_ADDRESS`; otherwise set the option to `false` before building.

::: danger Bootstrap trust
The current bootstrap path calls debootstrap with `--no-check-gpg` and fetches the MiniOS archive key over unauthenticated HTTP. Do not use the resulting image as a trusted release artifact until these source paths enforce authenticated key and bootstrap verification.
:::

## Quick build

Clone the repository and run the frontend from its root:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

The four target options are required when no configuration file is selected:

| Option | Setting |
| --- | --- |
| `-d`, `--distribution` | Target distribution suite |
| `-a`, `--architecture` | Target architecture |
| `-de`, `--desktop-environment` | Module environment |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox`, or `ultra` |

The currently supported distribution, architecture, desktop, compression, and variant values are listed in `linux-live/build.conf`. Do not infer support from an old command example.

## Build interfaces

### `minios-cmd`

`minios-cmd` copies the configuration template into the target work directory, writes frontend settings into that copy, and starts the complete `minios-live -` pipeline. Common options include:

| Option | Effect |
| --- | --- |
| `-b`, `--build-dir` | Select the build-output root |
| `-c`, `--compression-type` | Select SquashFS compression |
| `-kp`, `--kernel-provider` | Select `distribution` or `minios` |
| `-kf`, `--kernel-flavour` | Select a distribution-kernel flavour |
| `-mk`, `--minios-kernel` | Select the MiniOS kernel provider |
| `-mks`, `--minios-kernel-series` | Select `auto`, `6.1`, or `6.12` and imply the MiniOS provider |
| `-kpm`, `--kernel-payload-mode` | Select `runtime` or `full` |
| `-dkms`, `--kernel-build-dkms` | Build optional drivers for the selected kernel |
| `-l`, `--locale` | Set the system locale |
| `-ml`, `--multilingual` | Generate multiple locales |
| `-kl`, `--keep-locales` | Retain available locales |
| `-tz`, `--timezone` | Set the live-system timezone |
| `-ib`, `--initramfs-builder` | Select `livekit` or `dracut` |
| `-mln`, `--menu-language` | Select the boot-menu language |

For example:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Generate a configuration without starting the build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Without another destination, this writes `build/build.conf`. The frontend still requires root in this mode.

`--config-file FILE` selects a configuration to copy. The current implementation then writes parsed command-line values and non-empty frontend defaults into the working copy, despite the shorter wording in `--help`. For an exact, manually maintained configuration, invoke `minios-live` directly and inspect the active file rather than relying on frontend merging.

Do not combine `--config-only` with `--config-file` pointing to an existing configuration: config-only mode copies the default template over that path.
Use `-b DIR --config-only` to choose a separate generated destination.

### `minios-live`

`minios-live` is the staged backend. In a source checkout it reads `linux-live/build.conf` by default; an installed copy reads `/etc/minios-live/build.conf`. Select a different file and output root through environment variables:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Use an absolute `BUILD_CONF` path across `sudo`. Configuration files are sourced as Bash, so use only trusted files. The backend has no flags for overriding individual configuration variables.

## Build stages

The pipeline runs in this order:

1. `build-bootstrap` creates the minimal target root with debootstrap.
2. `build-chroot` installs and configures the core system.
3. `build-live` creates the `00-core` SquashFS module.
4. `build-modules` builds the selected environment's ordered modules.
5. `build-boot` generates initramfs, kernel, EFI, and bootloader files.
6. `build-config` generates MiniOS and boot configuration.
7. `build-iso` publishes the bootable ISO and checksum.
8. `remove-sources` deletes the selected work directory when configured.

Hyphenated names shown above and underscore forms are both accepted.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

A partial command does not recreate omitted inputs. `build-iso` only packages the prepared image tree, and `build-modules` cannot recreate `00-core`. Rebuild through the last dependent stage after changing an earlier producer.

A complete pipeline starts with `build-bootstrap`, which removes the selected target's existing `core/` and `image/` directories. Preserve any non-regenerable content before starting; generated target trees are build outputs, not durable source storage.

If `REMOVE_SOURCES=true`, the final `remove-sources` stage deletes and recreates the complete `build/<distribution>-<variant>-<architecture>/` work directory, not only downloaded source archives. Published ISOs, shared caches, and logs outside that directory remain.

## Configuration

`linux-live/build.conf` controls the target identity, kernel, locale, bootloader, live user, services, caches, snapshots, cleanup, and publication. Important groups include:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, and `PACKAGE_VARIANT` select the target and module chain.
- `COMP_TYPE` controls SquashFS compression.
- `KERNEL_*` and `MINIOS_KERNEL_SERIES` control kernel acquisition and payload.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, and `SERIAL_CONSOLE` control boot artifacts.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, and `USE_APT_CACHER` control reusable inputs.
- `VERBOSITY_LEVEL` accepts `0`, `1`, or `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, and `BUILD_TEST_ISO` control publication and cleanup.

Do not edit a generated `build/<target>/build.conf` as a substitute for maintaining the selected source configuration.

### Kernel selection

The `distribution` provider resolves the selected Debian or Ubuntu kernel and, when DKMS is enabled, matching headers in an isolated signed APT state.
`KERNEL_AUTO_SELECT=true` derives its source suite and architecture from the userspace target. Set it to `false` to use the manual distribution, architecture, version, snapshot, and update-policy fields in `build.conf`.

The `minios` provider installs `linux-image-SERIES-mos-ARCH`, verifies AUFS support, and uses the matching MiniOS headers for DKMS. It requires `KERNEL_FLAVOUR=none` and matching userspace and kernel package architectures.
In the current code, `MINIOS_KERNEL_SERIES=auto` resolves to `6.12`; use `6.1` explicitly when that series is required.

`KERNEL_PAYLOAD_MODE=runtime` retains the kernel module tree, kernel config, `System.map`, deployment metadata, and runtime integration under `modprobe.d`, `modules-load.d`, and `udev/rules.d`. It removes build-only package state, headers, DKMS sources, compiler tools, and initramfs packages. Firmware remains owned by `02-firmware`. `full` retains a broader diagnostic payload.

## Module system

Module sources live under `linux-live/scripts/`. An environment under `linux-live/environments/<desktop>/` contains ordered symlinks to the sources it uses. The environment-local name controls build order and can renumber a shared source, for example:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` is produced by `build-live` and is not an ordinary environment link.
Modules `01` and above are cumulative: each is built over the applicable lower modules. `skip_conditions.conf` can omit entries for a target, so inspect the selected environment rather than assuming one universal chain.

Use `linux-live/scripts/10-example/` as the current authoring template. A module can contain:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Only the files needed by the module are required. `build`, `postinstall`, skip conditions, patches, and rootcopy trees are optional. `build` and `patches/` are not available to `00-core`.

Host ownership in rootcopy trees is not preserved; copied files normally become `root:root`. A `.minios-ownership` manifest inside a rootcopy tree uses:

```text
owner:group relative/path
```

Paths must stay inside the tree. The host applies the manifest immediately and resolves names using the host account database. Use numeric `UID:GID` values for target-only accounts, or set ownership from `install` or `postinstall` inside the chroot. Moving the manifest to `rootcopy-postinstall/` does not change name resolution.

Because the current containment check does not canonicalize the target path, never use `..` components or symlink components in manifest paths. Inspect rootcopy trees before a privileged build; a crafted path can make host-side `chown` escape the copied tree.

For packages, ordinary module install scripts use the files copied into the chroot by `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

See [CondinAPT](/development/CondinAPT) for package-list syntax and the current MiniOS filter map.

### Adding a module

Copy the template, then link it into every intended environment with the desired environment-local position:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adapt `packages.list`, scripts, metadata, and rootcopy content before building.
Validate every claimed desktop, variant, distribution, and architecture.

## Rebuilding safely

Existing module artifacts are skipped. When a lower cumulative module changes, remove its artifact and the complete higher module tail before running `build-modules`; retaining higher modules would preserve content built against the old lower layer. Identify artifacts by the selected environment order and module name because skip conditions can close numbering gaps.

The kernel layer is a special case. To rebuild only `01-kernel`, remove its artifact for the selected target and rebuild from modules through publication:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Confirm the target path before removal. Do not apply this shortcut to `00-core` or assume it is safe for modules `02` and above.

For an ordinary module such as `03-gui-base`, remove its artifact and all later applicable module artifacts, then run the same `build-modules -` range. For initramfs-, EFI-, or boot-only changes, leave SquashFS modules in place and run:

```bash
sudo ./minios-live build-boot -
```

Use a complete build after changes to `00-core`, bootstrap/chroot setup, target identity, repository policy, or another input that cannot be isolated to a later stage.

## Outputs and logs

With the default `BUILD_DIR`, important paths are:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` and `build/iso/*.iso.sha256`
- `build/log/build-*.log`

ISO names depend on build settings, release mode, and timestamps. Use the path printed by the successful build instead of predicting the full basename.

## Secrets and debug artifacts

Do not place an Ubuntu Pro token in version control, documentation, shell history, or shared logs. Prefer a private configuration outside the repository:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Set `USE_UBUNTU_PRO=true` and `UBUNTU_PRO_TOKEN=...` only in that file. The build removes Pro state from the image, but the host-side file still contains the secret.

`DEBUG_SSH_KEYS=true` generates private key material for debugging. Treat the resulting image as disposable and never publish it without verifying that the key is absent.

Changing the option back to `false` does not remove keys already generated in `build/<target>/image/minios/debug_ssh_key`, adjacent `authorized_keys.*` files, or `build/<target>/debug_ssh_key`. Use a clean target or remove those files explicitly, then inspect the ISO tree before publication.

## Troubleshooting

- Bootstrap failures usually involve repository reachability, debootstrap support, architecture, snapshots, or missing host prerequisites.
- Core and module failures usually involve package availability, CondinAPT filters, maintainer scripts, rootcopy content, or a stale lower module.
- Boot failures usually involve the selected kernel, initramfs builder, EFI acquisition, GRUB/SYSLINUX generation, or missing boot inputs.
- ISO failures usually involve the prepared image tree, xorriso, output space, or cleanup settings.

After an interrupted privileged build, inspect mounts below the target work directory before retrying. Read the corresponding `build/log/build-*.log`; do not repair generated overlays or `.sb` files in place.

## Related documentation

- [Managing modules](/preparing-and-customizing/Managing-Modules)
- [Composing custom images](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
