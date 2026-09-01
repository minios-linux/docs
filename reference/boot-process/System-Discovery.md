---
updated: 2026-08-28
---
# System discovery

This page explains what the `from`, `ip`, `cache`, `bext`, `toram`, and `toram=full` boot parameters change. It is intended for custom boot entries, network boot, and troubleshooting. Most users can select a normal entry in the boot menu without setting these parameters manually.

After the bootloader loads the kernel and initramfs, the initramfs must locate the MiniOS data tree that supplies the `.sb` system modules. This happens before the normal userspace network stack, desktop, and persistent session are active.

## In plain language

MiniOS needs to find the directory that contains its system modules. Normally it searches attached drives for a `minios/` directory. The `from=` parameter points it to a different directory or ISO. Network parameters replace this local search with an HTTP ISO or PXE download.

Finding a drive does not prove that the module set is complete, and finding the system files does not enable persistence. Those are separate startup steps.

## Parameters explained

| Parameter | What it tells MiniOS | Typical use |
|---|---|---|
| `from=PATH` | Look for MiniOS in a particular directory or ISO instead of accepting the first matching local source. | Boot an ISO stored on a disk or use a nonstandard directory. |
| `from=askdisk` | Open an interactive selector for the partition that contains MiniOS. | Several connected drives contain possible sources. |
| `from=http://...` | Mount an ISO from a plain HTTP server. | Controlled network boot where the running system may continue to depend on the server. |
| `ip=...` | Use early static networking. Without an HTTP `from=`, it selects PXE data download and skips local drives. | PXE deployment or static addressing for an HTTP ISO. |
| `cache=MB` | Allocate an httpfs cache for an HTTP ISO. It does not guarantee that the complete ISO is downloaded. | Reduce repeated reads from an HTTP source. |
| `bext=EXTENSION` | Search for module filenames with another extension instead of `.sb`. | Specialized images only; it does not convert modules. |
| `toram` or `toram=full` | Copy the complete discovered MiniOS data tree into RAM and try to detach the source. The bare form means `full`. | Temporary RAM operation on a machine with enough memory. |

If a local USB boot stops before the desktop appears, first remove custom `from=` and `ip=` values. An accidental nonempty `ip=` prevents local-drive discovery, while an incorrect `from=` can make MiniOS search for a path that is not present.

## Source precedence

Source selection has a fixed precedence:

1. A literal `from=http://...` value selects an HTTP ISO.
2. Otherwise, any nonempty `ip=` value selects PXE download.
3. Otherwise, `from=askdisk` or `from=askdisk:...` opens the disk selector.
4. Otherwise, the initramfs scans local block devices.

The two network paths do not fall back to local media. After an HTTP ISO or PXE attempt, discovery returns that network result rather than trying disks; an unusable or incomplete result fails validation or later setup.

This order has two important consequences:

- `from=http://...` wins over `ip=`. The optional `ip=` then supplies static addressing for the HTTP ISO connection.
- A nonempty `ip=` wins over every local `from=` value, including a device, directory, ISO path, or `askdisk`. Do not use `ip=` merely to configure the network of a locally booted system.

## Local discovery

Without an HTTP source or nonempty `ip=`, MiniOS makes 45 discovery passes, approximately one per second. Each pass refreshes device nodes, obtains block device candidates from `blkid`, sorts their device names, and tests them in that order. The first candidate containing a qualifying MiniOS source is retained; later devices are not considered.

If `from=` is empty, the path tested on each filesystem is `minios`. A source qualifies when either that directory or its immediate `modules/` subdirectory contains at least one file whose extension is `.sb` by default. The `bext=` parameter changes the extension used by this test. Discovery does not validate that the found module set is complete or bootable.

Each candidate is initially mounted read-only. After it qualifies, MiniOS tries to make that selected data mount writable, but inability to do so does not reject an otherwise valid source.

### Local `from=` forms

An ordinary relative or absolute-looking path is interpreted inside every candidate filesystem. Leading slashes are normalized by path construction, so these both look for the same directory:

```text
from=minios
from=/minios
```

If the requested path is a regular file on a candidate filesystem, MiniOS treats it as an ISO, loop-mounts it read-only, and tests the `minios` directory inside the ISO:

```text
from=/images/minios.iso
```

Device-qualified paths support only these forms:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` supports a simple device name followed by a path. The label form must be exactly `/dev/disk/by-label/LABEL/path`; the label is resolved with `blkid`, then the remaining path is tested on that filesystem.

There is no corresponding parser for UUID, PARTUUID, or by-id paths. Forms such as the following are not supported:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Interactive selection

Use `askdisk` to select a partition and then test a path on it:

```text
from=askdisk
from=askdisk:custom:dir
```

The first form tests `minios` on the selected partition. In the second form, colons become path separators, so `askdisk:custom:dir` tests `custom/dir`.
Slash syntax such as `from=askdisk/custom/dir` still opens the selector but silently loses the custom path and tests `minios`; do not use it.

The displayed device list is refreshed while the selector is open and excludes swap filesystems. Selection still performs the normal module-presence test; a chosen partition alone is not sufficient.

## HTTP ISO

An HTTP ISO source has this form:

```text
from=http://server.example/path/minios.iso
```

Only plain HTTP is recognized. HTTPS and other URL schemes are not supported.
The initramfs finds the first detected non-loopback network interface, brings up the network, and mounts the remote ISO through `httpfs2`. Interface selection does not verify link, reachability, or whether that interface is the usable one on a multi-NIC system.

When `ip=` is absent, HTTP ISO boot requests DHCP with `udhcpc`. When `ip=` is present, it uses the static fields expected by the PXE parser:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

For HTTP ISO boot, the URL still determines the HTTP server. The static fields configure the client address, netmask, default gateway, and early DNS entries; the optional port field belongs to PXE file download and does not replace the port in the ISO URL.

`cache=<MB>` enables an httpfs cache of the requested size in `/tmp`. It is a cache, not a guaranteed complete download. The running system continues to depend on the remote ISO and network unless a successful RAM copy detaches the source.

## PXE data download

Any nonempty `ip=` selects PXE data download unless `from=http://...` was selected first. The supported syntax is:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

The netmask is dotted IPv4 notation. The optional HTTP port defaults to `7529`.
Generic kernel or dracut forms such as `ip=dhcp` and `ip=:::::eth0:dhcp` are not supported. PXE data download itself has no DHCP form in this parser.

MiniOS configures the first detected non-loopback interface without proving it has a working link. It first requests `PXEFILELIST` and the listed MiniOS files over HTTP from the server field. TFTP is a limited fallback: it is selected only when the initial HTTP request for `PXEFILELIST` fails. It is not general interface failover, local-media fallback, or recovery from every partial HTTP download failure.

## Copying and detaching with `toram=full`

`toram=full` matters to discovery because it may remove the continuing dependency on the selected source. After discovery, MiniOS copies the data tree to RAM and then tries to unmount the source and move the RAM copy into its place. Only a successful unmount and move detach local media, a loop-mounted ISO, or an HTTP ISO.

Sharp limitations:

- There is no preflight check that available RAM can hold the copy.
- When persistence is requested, the top-level `*` copy omits dotfiles.
- When persistence is not requested, the `changes` entry is deliberately omitted. That branch copies other top-level entries, including dotfiles.
- A copy, unmount, or move failure can leave the original source mounted. Do not assume that specifying `toram=full` makes media removal or network loss safe; verify that detachment succeeded.

See [Initrd persistence](/reference/boot-process/Persistence-Internals) before combining `toram` with `perch` or `perchdir`.

## Failure and diagnostics

If all 45 local passes fail, MiniOS enters its fatal error path and opens an initramfs shell instead of starting the live system. Network paths do not perform the 45-pass local search or fall back to local media; depending on the partial result, they can fail the data check or later setup. Exiting a fatal shell does not repair the missing source and may only allow later setup to fail less clearly.

Useful diagnostic parameters are:

- `debug` enables shell tracing, additional diagnostics, and interactive shells at multiple initramfs checkpoints. Exit a checkpoint shell to continue.
- `timing` prints elapsed timing between initramfs stages and a final total.
- `rd.break` requests an initramfs shell near the handoff to the real root; exit it to continue booting.

At a shell, inspect `/proc/cmdline`, `/proc/net/dev`, `blkid`, mounted filesystems, and `/var/log/livedbg`. Start with the exact `from=`, `ip=`, and `bext=` values shown in `/proc/cmdline`.

## Related documentation

- [Boot modes](/using-minios/Boot-Modes)
- [Module loading](/reference/boot-process/Module-Loading)
- [Persistence](/reference/boot-process/Persistence-Internals)
- [Network boot](/reference/boot-process/Network-Boot)
- [Boot parameters](/reference/Boot-Parameters)
- [Troubleshooting](/maintenance-and-recovery/Troubleshooting)
