---
updated: 2026-10-06
program_commits:
  minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---
# Managing kernels

MiniOS Kernel Manager packages, inspects, activates, and removes kernel bundles for the modular MiniOS live system. A MiniOS kernel is a coordinated set: the kernel image, its initramfs, and the matching `01-kernel-<version>.sb` module must stay together.

This workflow applies only to the live architecture. A native installation uses ordinary Debian or Ubuntu kernel packages, the normal initramfs tooling, and its installed bootloader instead.

## What Kernel Manager does

The graphical **MiniOS Kernel Manager** and the `minios-kernel` CLI use the same backend. They can:

- list the packaged kernels and distinguish the running, active, and inactive versions;
- package a real versioned kernel from configured APT repositories;
- package a coherent set of local kernel `.deb` files;
- optionally add selected drivers from the curated MiniOS DKMS catalog when packaging a repository kernel;
- build the matching MiniOS initramfs and SquashFS kernel module;
- stage completed bundles in the MiniOS kernel repository;
- activate a complete bundle for the next boot and update the supported bootloader configuration;
- remove an inactive packaged kernel.

Kernel Manager does not compile an arbitrary kernel source tree. If you need to change MiniOS kernel build inputs themselves, use the MiniOS source build workflow instead.
## Start the graphical manager

Launch it from the MiniOS application menu or run:

```bash
minios-kernel-manager
```

The application separates installed-kernel management from packaging. Repository kernels can be searched by package name or displayed kernel version. The package controls are unavailable when the detected MiniOS root is not writable.

Privileged backend operations use PolicyKit. The standalone `minios-kernel` CLI requires root for every command except help.

## Package a repository kernel

Choose **Repository** in the packaging view and select a real versioned kernel package, for example:

```text
linux-image-6.12.107+deb13-amd64
```

Tracking metapackages such as `linux-image-amd64` are not accepted as the package source. Repository mode uses the running system's configured APT sources, trust configuration, and package lists. Matching versioned split-kernel dependencies are resolved automatically when the distribution uses them.

The GUI does not run `apt update` just because package lists are old. Refresh them explicitly when needed, or use `--force-update` with the CLI.
### Add curated DKMS drivers

Repository packaging can add selected drivers from the MiniOS `01-kernel` DKMS catalog. The GUI shows compatible choices for the selected kernel; the CLI accepts a repeatable `--dkms-driver` option:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Selected drivers are built in an isolated overlay/chroot with matching headers. The backend verifies that the produced modules match the target kernel before including them and records driver provenance inside the bundle under `/usr/share/minios/kernel-dkms/`.

This is a curated compatibility feature, not a generic DKMS frontend. Manual local kernel packages do not expose driver selection because matching repository headers cannot be inferred reliably.

## Package local kernel packages

For a local kernel, supply all required `.deb` files from the same kernel build:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian and Ubuntu can split one kernel across several packages. The backend checks that the supplied image, modules, base, and optional modules-extra packages form a coherent version instead of silently combining unrelated revisions.
## Packaging output and compression

Packaging produces the kernel image, initramfs, and SquashFS kernel module. Selected package metadata is retained inside the module under `/usr/share/minios/kernel-dpkg/`.

The default SquashFS compression is `zstd`. Other methods are offered only when the required tools are available; current support includes `lz4`, `lzo`, `gzip`, `lzma`, `xz`, and `bzip2`.

When a writable MiniOS root is detected and the requested output is elsewhere, the completed bundle is staged atomically into:

```text
<MiniOS-root>/kernels/<version>/
```

Repository downloads are temporary build inputs and are removed after a completed or handled failed packaging operation. Local `.deb` inputs remain caller-owned.

## Encrypted persistence compatibility

If the running MiniOS initramfs advertises layered LUKS persistence, a replacement kernel must preserve the dm-crypt boot path. The generated initramfs is checked for the required cryptsetup support, dm-crypt module, and MiniOS crypto capability marker.

Packaging fails instead of producing a kernel bundle that would make an encrypted persistence session unbootable.
## Activate and remove kernels

The management view distinguishes:

- **RUNNING** — the kernel executing in the current boot;
- **ACTIVE** — the complete bundle selected for the next boot;
- **AVAILABLE** — another packaged bundle in the MiniOS repository.

Activation requires a complete repository entry. It stages the kernel image, initramfs, active SquashFS module, active-version marker, and bootloader changes as one coordinated operation. GRUB configuration is required; native SYSLINUX configuration is updated when present. If activation fails, staged boot files are rolled back.

Activation changes the next boot only; it does not reboot the current system. Keep at least one known-good complete bundle until the replacement has booted successfully.

Delete only an inactive packaged kernel that you no longer need. Do not manually mix a kernel image, initramfs, or `01-kernel-*.sb` from different bundles.

## Command-line reference

Typical commands are:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Package from a repository or local files:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Add `--json` for structured output. Use the installed help and manual for the exact options provided by the running version:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Storage layout

Kernel Manager discovers the MiniOS content root instead of assuming a particular block-device name. Managed paths are relative to that root:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
The canonical runtime module path is `/lib/modules/<version>`. On usrmerged systems that resolves to `/usr/lib/modules/<version>`; older layouts can store it physically under `/lib`. Packaging refuses an already-present same-version module tree rather than mixing it with a different package revision.

## Recovery after a bad kernel

If a newly activated kernel fails, boot a known-good complete MiniOS kernel set if one is still available. Do not repair the installation by copying individual kernel, initramfs, or SquashFS files from another image: those files form one coordinated bundle.

If no known-good complete bundle remains, boot trusted rescue media, preserve important data, and reinstall or restore the affected MiniOS installation. See [Troubleshooting](/maintenance-and-recovery/Troubleshooting) and [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Related documentation

- [MiniOS system architecture](/reference/System-Architecture)
- [Initrd module loading](/reference/boot-process/Module-Loading)
- [Building MiniOS](/development/Building-MiniOS)
- [Troubleshooting](/maintenance-and-recovery/Troubleshooting)
