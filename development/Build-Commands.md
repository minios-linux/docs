# Build commands

MiniOS has two command-line build interfaces. Run commands from the `minios-live` source directory unless using an installed copy.

- `minios-cmd` is the frontend. It accepts common target options, generates a working configuration, and starts a complete build.
- `minios-live` is the staged backend. It reads a build configuration and runs one stage, an inclusive range of stages, or the complete pipeline.

Use `./minios-cmd --help`, `./minios-live --help`, and the active `build.conf` for the installed version. They are authoritative when examples or older documentation disagree. Supported target values can change, so this page does not define a support matrix.

## Root requirements

Displaying help does not require root:

```bash
./minios-cmd --help
./minios-live --help
```

Build operations require root because they use debootstrap, chroots, mounts, and image-building tools. The current frontend also checks for root before writing a configuration with `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

The backend checks and installs the host prerequisites listed in `linux-live/prerequisites.list` unless `SKIP_SETUP_HOST=true` is set in the configuration.

## Frontend builds

A normal `minios-cmd` invocation requires all four target-selection options:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

For example:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Common optional settings include compression, kernel behavior, locale, timezone, initramfs builder, boot-menu language, and build directory. Check `./minios-cmd --help` rather than assuming an option exists.

The frontend copies the configuration template, writes the supplied frontend values into the copy, and invokes `minios-live -`. By default the working copy for this example is:

```text
build/trixie-standard-amd64/build.conf
```

Generate a configuration without starting the build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Without another destination, this writes `build/build.conf`.

`--config-file FILE` selects a configuration file. The current command help states that all other options are ignored in this mode, so do not combine it with target or tuning options:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

For frontend option mode, explicit command-line values are written over the corresponding template values. For config-file mode, treat the selected file as the configuration input rather than trying to override it with other frontend flags.

## Backend configuration

In a source checkout, `minios-live` reads `linux-live/build.conf` by default. An installed copy uses `/etc/minios-live/build.conf`. The backend sources the selected file before calculating target paths and has no command-line flags for overriding individual configuration settings.

Select a different file through `BUILD_CONF`. Use an absolute path when crossing the `sudo` boundary:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` selects another build-output root:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Do not edit generated files under a target work directory as a substitute for maintaining the selected configuration. See `linux-live/build.conf` for advanced kernel, bootloader, locale, cache, snapshot, module, cleanup, and publication options.

## Backend stages

The stages run in this order:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Hyphenated stage names shown by help are accepted by the script.

Run the complete pipeline:

```bash
sudo ./minios-live -
```

Run one stage only:

```bash
sudo ./minios-live build-iso
```

Run an inclusive range:

```bash
sudo ./minios-live build-chroot - build-live
```

Run from the first stage through a selected stage:

```bash
sudo ./minios-live - build-live
```

Run from a selected stage through the final stage:

```bash
sudo ./minios-live build-modules -
```

These backend examples use the target selected in the active configuration. For the examples on this page, set `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"`, and `PACKAGE_VARIANT="standard"` first.

## Stage dependencies

A partial command does not recreate outputs from omitted earlier stages. Later stages consume the root filesystem, SquashFS modules, boot files, and configuration produced by earlier stages.

Rebuilding an earlier stage can therefore make every dependent later output stale. Rebuild through the last affected stage, and do not retain higher-numbered modules after changing a lower module on which they were built. In particular, `build-iso` packages previously prepared image data; it does not rebuild that data.

Use a complete build for a new target or when the required earlier outputs do not exist:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Outputs and logs

With the default checkout configuration and build root, the trixie example uses these verified locations:

- `build/trixie-standard-amd64/core/` for the mutable core filesystem
- `build/trixie-standard-amd64/image/` for the prepared ISO tree
- `build/trixie-standard-amd64/image/minios/` for generated MiniOS modules and payload
- `build/iso/` for ISO files and their `.iso.sha256` sidecars
- `build/log/build-YYYYMMDD-HHMMSS.log` for the captured build log

All paths are relative to `BUILD_DIR`. ISO basenames include build settings and, for non-release builds, a timestamp; use the path printed by the successful build instead of predicting the complete filename.

## Ubuntu Pro tokens

`--ubuntu-pro-token` enables Ubuntu Pro use during a frontend build. The build code attaches inside the chroot, then detaches and removes Pro state, repository authentication, preferences, and keyring traces before creating the image. This cleanup does not make the token safe to expose on the host.

Do not put a real token in documentation, version control, shell history, CI output, or a shared command line. Prefer a private configuration file outside the repository, restrict it to its owner, and pass only its path:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Set `USE_UBUNTU_PRO="true"` and `UBUNTU_PRO_TOKEN="..."` in that private file. Protect and remove any host-side working configuration containing the token when it is no longer needed, and verify that no token or Pro authentication data is present in published artifacts.
