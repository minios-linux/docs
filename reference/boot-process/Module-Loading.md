---
updated: 2026-10-15
---
# Module loading

This page explains what the `load`, `noload`, `bext`, `union`, and `toram=trim` boot parameters change. These are advanced controls. A normal boot automatically loads the module set provided by the selected MiniOS image.

MiniOS selects and mounts its module set in the initrd, before the union root is handed to the installed init system. Use this page when a module on the boot medium does not appear in the running system or when a filter changes startup unexpectedly.

## In plain language

MiniOS is assembled from numbered read-only `.sb` modules. Lower numbers load first; higher numbers can replace files from lower-numbered modules. A writable session, when active, sits above all read-only modules.

The `load=` and `noload=` parameters filter module paths before assembly. They use regular-expression matching rather than a safe exact-name list, so a broad filter can leave required core or kernel modules out of the boot set.

## Parameters explained

| Parameter | What it tells MiniOS | Main risk |
|---|---|---|
| `load=PATTERN` | Keep only module candidates whose paths match the pattern. | An incomplete pattern can omit required modules. |
| `noload=PATTERN` | Leave matching candidates out after `load=` has been applied. | Required core, kernel, firmware, or desktop modules may be left out of startup. |
| `bext=EXTENSION` | Treat another filename extension as a module candidate suffix. | It does not convert files or fully coordinate kernel modules. |
| `union=aufs` or `union=overlayfs` | Request the filesystem used to combine modules with the writable layer. | Runtime module activation differs between AUFS and OverlayFS. |
| `toram=trim` | Copy only selected modules and limited required data to RAM. | Omitted modules and directories are unavailable after source detachment. |

Before changing filters, record the current command line and module set. Test one change at a time and keep a known-working boot entry available.

<a id="candidate-tiers"></a>

## Candidate tiers

After locating the MiniOS data directory, normally `minios/`, the initrd discovers an optional external MiniOS tree before RAM copying or session activation. A same-drive persistence partition or writable Ventoy data layout can supply that tree even on a boot without a saved session. The selected Ventoy Persistence Plugin backend is a separate model and does not provide this external-module tree.

Candidates form two groups:

1. Top-level module names from the selected data tree and the external `minios/` tree, sorted and deduplicated by relative name.
2. Files and symbolic links recursively below `modules/` in both trees, sorted and deduplicated by relative path.

For the same relative path, an external regular file takes precedence over the ISO or other selected source. This applies to replacement system modules as well as additional modules. Filters apply to the merged relative paths before mounting or trimmed RAM copying. The persistence partition root remains separate from its numbered-session store.

Mountpoints are still flattened to exact basenames. For example, `modules/work/50-extra.sb` and `modules/test/50-extra.sb` both address `50-extra.sb`; they are not independent union layers. Use distinct basenames unless an exact-path replacement is intended. Do not rely on duplicate basenames in different directories as a replacement mechanism.

The normal module format is a SquashFS filesystem image. A matching filename does not validate its contents. Recursive scans consider files and symbolic links, while the top-level scan remains filename-driven. Failure to bind an external replacement or mount a selected module now enters the fatal initramfs path rather than silently omitting that layer. Validate questionable files with [Inspect and extract modules](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Ordering and precedence

Within discovery, paths are sorted numerically by basename. The leading number in names such as `00-core.sb`, `01-kernel-VERSION.sb`, and `50-extra.sb` is the module order. A basename without a leading number sorts numerically as zero.
Use explicit, distinct numeric prefixes rather than relying on tie ordering.

The final union gives later, higher-numbered modules precedence over earlier, lower-numbered modules. If two selected modules contain the same root-relative path, the file from the higher-priority module is visible. The writable changes layer has precedence over all read-only modules.

External replacement by relative path happens before this effective module ordering. A replacement `modules/50-extra.sb` occupies the same selected slot as the source file, and its `50` prefix determines its union priority.

## Bundle extension

The `bext=` boot parameter selects the filename extension used for data discovery, candidate filtering, and module mounting. Its default is `sb`, so the usual candidate suffix is `.sb`:

```text
bext=sb
```

Changing `bext` changes the selected filename suffix; it does not convert a file or verify its filesystem format. Kernel coordination is an exception: it always looks for `01-kernel-VERSION.sb`. With a custom extension, the normal candidate scan does not select these `.sb` kernel modules.

## Load and noload filters

`load=` and `noload=` are unanchored extended regular expressions applied to the candidate path strings produced by each tier. They are not exact-name lists. A simple value such as `kernel` matches that text anywhere in a path, while anchors must be supplied explicitly when an exact position is required.
Top-level candidates are basenames and recursive candidates include `modules/`. External candidates use the same relative-path form, not absolute persistence mount paths.

Commas are converted to regular-expression alternation. For example:

```text
load=core,kernel,firmware
```

is evaluated as `core|kernel|firmware`. Other regular-expression characters are not escaped.

A numeric range is expanded only when the whole filter is one ascending range matching `^[0-9]+-[0-9]+$`. For example, `load=04-06` becomes the alternatives `04|05|06`, with each generated value padded to at least two digits. A range embedded in a comma list or another expression is not expanded and retains its ordinary ERE meaning.

When both parameters are present, the initrd applies `load=` first and then removes matches with `noload=`. Thus `noload=` wins. There is no protected core or kernel module set: filters can exclude `00-core`, the coordinated `01-kernel`, or any other candidate. Such a selection may construct an incomplete root or prevent boot.

## Running kernel coordination

The running kernel version is taken from a `vmlinuz-VERSION` token on the kernel command line when available, with `uname -r` as the fallback. Before mounting modules, the initrd coordinates this top-level triplet:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

If any member is missing, the initrd looks for all three files in:

```text
minios/kernels/VERSION/
```

When the repository triplet is complete, it copies the module to `minios/` and the boot files to `minios/boot/`. A partial copy is cleaned up. If the triplet is not complete, kernel setup returns a failure, but the caller continues to the normal module-mount stage. The resulting system can still fail later because the root filesystem lacks the support files for the running kernel.

Other top-level files matching `01-kernel-*.sb` are treated as inactive. The initrd attempts to move each inactive module and its matching `vmlinuz` and `initrfs` files into `minios/kernels/VERSION/`. These repository fallback and relocation operations require a writable data tree; individual relocation failures are not fatal. They always use `.sb`, regardless of `bext=`. The merged candidate scan additionally excludes `01-kernel-*` modules that do not match the running kernel, including external candidates. See [Kernel management](/preparing-and-customizing/Managing-Kernels) for supported kernel installation and activation workflows.

<a id="union-construction"></a>

## Union construction

MiniOS selects `AUFS` when the running kernel supports it and otherwise uses OverlayFS. `union=overlayfs` selects OverlayFS. `union=aufs` requests `AUFS` but falls back to OverlayFS if `AUFS` is unavailable. When UEFI Secure Boot is enabled, initrd does not load the unsigned `aufs-ng` module; if no other usable AUFS implementation is already available, OverlayFS is used even when `union=aufs` was requested.

With `AUFS`, the initrd first mounts an empty union with the writable changes branch, then inserts each mounted module as a read-only branch. A failure to create the union is fatal. A failure while appending an individual `AUFS` branch is best effort: boot continues with the branches that were added, while MiniOS does not mark persistence as active for an incomplete union.

With OverlayFS, the complete module set is supplied as one reversed `lowerdir` list when the union is mounted. The writable layer supplies its `upperdir` and `workdir`. Failure to mount that union is fatal. The left-to-right lower ordering and `AUFS` insertion order both implement the same rule: later, higher-numbered modules hide conflicting paths from earlier modules.

This boot-time composition is distinct from runtime activation. After startup, `sb activate` and `sb deactivate` can alter only a root that is currently mounted as `AUFS`. OverlayFS lower layers cannot be changed in place. Runtime activation does not alter the Next Boot selection, and adding a Next Boot module does not activate it in the current root. See [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` creates a RAM system-data tree after external-module discovery and before session activation and kernel coordination. It copies:

- `config.conf`, which is required by this copy path.
- `authorized_keys` when it exists as a regular file.
- Top-level extension-matching candidates selected by `load=`, `noload=`, and the running-kernel filter.
- Selected extension-matching candidates recursively below `modules/`, with their relative directories preserved.
- External replacements and additions selected by the same rules, copied into their corresponding relative paths.

It creates an empty `changes/` directory; session copying is handled separately by `perchtoram`. It does not copy `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, other nonmodule data, or unselected modules. In particular, repository fallback cannot use a `kernels/` directory omitted from the trimmed RAM tree. External modules are already included, so RAM boot does not reopen their original files after copying.

System copying has no RAM-capacity preflight. A failure to copy `config.conf` or a selected module propagates to the init entry and enters its fatal path. A failure to copy optional `authorized_keys` is reported without aborting. There is no transactional rollback of a partly populated system-data tree. Session copying has its own memory preflight and falls back to the original on-storage session if the copy cannot be prepared; see [Persistence internals](/reference/boot-process/Persistence-Internals).

After copying, the initrd tries to unmount the source mount, remove its old data path, and move the RAM tree into that path. Only success of that complete chain marks the source detached. If the chain fails, boot continues using the RAM staging path instead. Related ISO and Ventoy detach operations are best effort.
Consequently, `toram=trim` is not proof that the boot device is removable. Do not unplug it unless diagnostics confirm that its filesystem, loop device, and device-mapper mappings are no longer mounted or in use.

## Rootcopy and the root handoff

After module mounts and union construction, the initrd copies the visible contents of `minios/rootcopy/` directly into the assembled union. The shell `*` glob omits dot-prefixed entries directly inside `rootcopy/`, although hidden files inside a copied directory remain part of that directory copy. This is a file copy into the writable view, not another read-only module layer, so it can override paths supplied by modules. Copy errors are not made fatal by this function.

MiniOS then performs its early setup, writes the new root's `fstab`, and sources `rootcopy/run/preinit.sh` when present, passing the union path as its first argument. This script runs in the initrd environment before the root handoff and must be treated as privileged boot code.

At the final boundary, the LiveKit initrd pivots the assembled union to `/`, keeps the old initrd under `/run/initramfs` for shutdown duties, and executes the new root's `init`. The Dracut path prepares the same union and lets Dracut perform the final `switch_root`. Once this boundary is crossed, ordinary startup runs inside the composed root; changing files on the boot medium no longer rebuilds the selected lower-layer set for that boot.

## Safe diagnostics

Prefer read-only inspection and record the original command line before changing filters:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` shows the current rule-based selection, while `sb list` shows the layers actually composing the running root. A difference can indicate a mount failure, basename replacement, a runtime `AUFS` change, or a selection source that changed after boot.

For an early failure, add `debug` to show shell tracing, `timing` for stage timings, or `rd.break` to open a shell after initrd setup and before the final root handoff. At that shell, inspect `/memory/data`, `/memory/bundles`, mounts, and `/proc/cmdline`; do not repair filesystems or remove media while they are mounted. Capture the first mount or copy error, not only the later symptom. See [Troubleshooting](/maintenance-and-recovery/Troubleshooting) for a broader safe diagnostic workflow.

## Related documentation

- [Boot modes](/using-minios/Boot-Modes)
- [System discovery](/reference/boot-process/System-Discovery)
- [Persistence](/reference/boot-process/Persistence-Internals)
- [MiniOS Module Manager](/preparing-and-customizing/Managing-Modules)
- [Creating modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Kernel management](/preparing-and-customizing/Managing-Kernels)
- [Troubleshooting](/maintenance-and-recovery/Troubleshooting)
