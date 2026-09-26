---
updated: 2026-09-26
program_commits:
  minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
  minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---
# Sessions and persistence


MiniOS sessions keep changes made to the live system across reboots. Each session is a numbered directory under `minios/changes/`; the read-only MiniOS modules remain unchanged and the selected session supplies the writable union filesystem layer.

Use MiniOS Session Manager from a running MiniOS system:

```bash
minios-session-manager
```

The equivalent command-line tool is `minios-session`. Its modifying commands require administrative privileges, so the examples below use `sudo`.

## Session modes

| Mode | Storage | Main constraints | MiniOS LUKS2 layer |
|------|---------|------------------|--------------------|
| `native` | Changes stored directly in the session directory | Requires a writable filesystem that preserves the Linux metadata and operations MiniOS probes for. Capacity follows free backing space; `perchsize` does not apply. | No |
| `dynfilefs` | Expandable ext4 `virtual.dat` backed by format-400 segment files | Works on writable POSIX, FAT32, NTFS, and exFAT filesystems. Payload is thin, but the mapping index scales with declared logical capacity. | Yes |
| `dynblk` | Thin ext4 filesystem on a kernel block device backed by `volumeNNN.db` files | Requires the DynBlk CLI, kernel module, and initrd capability. Boot-created size is up to 16 GiB by default; the maximum is reported by `dynblk limits`. Disk-resident mappings use a bounded metadata cache. | Yes |
| `vmdk` | Thin ext4 filesystem on a standard split sparse VMDK, exposed by the DynBlk driver | Uses `volume.vmdk` and `volume-sNNN.vmdk`. No compression. Requires `vmdk-session-v1` in the running initrd capability marker. Same 16-GiB manual default as DynBlk; query `dynblk limits --format vmdk` for limits. | Yes |
| `raw` | Single `changes.img` file containing ext4 | Fixed logical capacity with explicit growth only. Works on writable POSIX, FAT32, NTFS, and exFAT filesystems; FAT32 is limited to 4000 MiB. | Yes |
| `squashfs` | Compressed snapshot in `changes.sb`; runtime writable upper is reconstructed in RAM | `perchsize` does not apply. Existing snapshots can be restored from supported writable media; exact saving requires a suitable POSIX-capable persistence store. | No |

Raw, DynFileFS, DynBlk, and VMDK can optionally carry a LUKS2 encryption layer. The storage backend remains the session mode, and session metadata records encryption separately. DynFileFS and raw created with `minios-session` default to 4000 MiB; DynBlk and VMDK default to 16 GiB. Size values are allocated in MiB; `GB` and `TB` suffixes convert to 1000 and 1,000,000 MiB. Raw is limited to 4000 MiB on FAT32 whether encrypted or not. DynFileFS payload data grows on demand, but its format-400 index is sized for the full logical capacity and costs about 2 MiB of RAM plus about 2 MiB of backing storage per GiB. DynBlk keeps mapping tables on disk and a bounded metadata cache in RAM, defaulting to 1 MiB rather than a percentage of RAM. Its extent/file vectors and directories grow with declared parts, while payload fill does not require a full resident map. Query the installed capacity limit with `dynblk limits --format dynblk`. Actual writes remain limited by lower-filesystem free space and backend resource admission. Container resize operations can only grow a session; shrinking is not supported.

Native mode is the simplest and fastest choice on a compatible filesystem.
Use DynFileFS when the persistence filesystem cannot represent Linux metadata.
Use DynBlk when you want a real kernel block device with thin backing files; the driver can keep several independent DynBlk volumes attached at once, and Session Manager uses the device path returned by the driver rather than assuming `/dev/dynblk0` is free. DynBlk and VMDK are unavailable while UEFI Secure Boot is enabled because MiniOS does not sign the external DynBlk kernel module. Installer and Session Manager therefore hide these modes and reject explicit creation requests before attempting to load the module.
Use raw when fixed allocation is required, add LUKS2 when the session must be encrypted, and use SquashFS for an exact compressed snapshot.

Run the following commands to inspect the actual persistence filesystem and the modes available on it:

```bash
sudo minios-session info
sudo minios-session status
```

No session can be created on read-only media. The initrd can read and activate an existing SquashFS snapshot stored on writable FAT, exFAT, or NTFS because it extracts the snapshot into a temporary ext4 upper. Creating or exactly saving a snapshot is different: the persistence store must support the required POSIX metadata and private, durable publication. The exact-capture working tree uses trusted RAM when available, with a disk-workspace fallback if RAM is insufficient.

## Boot selection

Any recognized persistence parameter enables persistence handling. MiniOS boot menus normally provide resume, new, selection, and non-persistent entries. The canonical description of selector, compatibility, fallback, and activation semantics is [Initrd persistence](/reference/boot-process/Persistence-Internals).

| Parameter | Meaning |
|-----------|---------|
| `perch` | Use the legacy best-effort resume path. It tries the metadata default but does not create a replacement when none is usable. |
| `perchdir=resume` | Resume the metadata default and, when it is absent or incompatible, allow the initrd to create a new compatible replacement. This is the current boot-menu resume behavior. |
| `perchdir=new` | Allocate a new numbered session. |
| `perchdir=ask` | Select an existing session or create one during boot. |
| `perchdir=<id>` | Select that numbered session directly. |
| `perchdir=<device/path>` | Use a persistence location on a device, including `/dev/...` and `label:...` forms handled by the initrd. |
| `perchmode=<mode>` | Set `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, or `squashfs`. |
| `perchencrypt=luks` | Encrypt a newly created Raw, DynFileFS, DynBlk, or VMDK session with LUKS2. Existing sessions derive encryption only from metadata. |
| `perchcomp=<codec>` | Select DynBlk backend compression for a new DynBlk session. Compression is forced to `none` when DynBlk is wrapped in LUKS2. |
| `perchsize=<size>` | Set a new or larger container size; plain values are allocated in MiB and `MB`, `GB`, and `TB` suffixes are accepted. |

If no mode is specified for a new session, boot uses native mode. On FAT32/NTFS/exFAT, native boot creation falls back to DynFileFS. A new raw container defaults to 4000 MiB. New DynFileFS, DynBlk, and VMDK boot sessions without `perchsize` use up to 16 GiB; when less backing space remains after the safety reserve, the automatic size is reduced. DynFileFS also accounts for its index overhead and RAM limit. Explicit DynBlk growth follows the installed backend limit, queried with `dynblk limits --format dynblk`. Under Secure Boot, initrd does not offer DynBlk/VMDK and treats an explicit or resumed DynBlk/VMDK session as unavailable rather than attempting to load the unsigned module.
SquashFS sessions can be captured from the running system with MiniOS Session Manager or `minios-session create squashfs`. Initrd setup creates only generation-zero session metadata and keeps the writable upper layer in RAM. The running system creates the first `changes.sb` snapshot on demand or at shutdown.

When resuming, MiniOS checks the recorded version, edition, union filesystem, and mode. Literal `perchdir=resume` can create a new session instead of using an absent or incompatible default. Bare `perch`, direct numeric selection, and other legacy resume requests do not automatically create that replacement.
Interactive selection displays a warning before allowing an incompatible session. If selection or activation still fails, boot normally continues with a RAM upper and a persistence warning.

The session store has this form:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` records the default and running IDs and per-session mode, version, edition, union filesystem, size, state, and mode-specific settings.
It is persistent metadata committed by the boot implementation, not by itself proof of current runtime state. Do not edit it or move numbered session data while a session is mounted; use MiniOS Session Manager or `minios-session`.

## Active and running sessions

These terms describe different state:

- The **active** session is the default selected for the next boot.
- Conceptually, the **running** session is the session whose writable layer actually supplies persistence to the current boot.

The persistent `running=` field records that intended relationship. A crash, failed union construction, copied store, or interrupted shutdown can leave it stale even when the current boot is using RAM or another session. Operations such as SquashFS saving therefore require the initrd's protected, boot-ID-bound current-boot state and verified mounted upper; they do not trust `running=` alone. See [Active, running, and current-boot state](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Activating a session changes the next boot and does not switch the current union filesystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

The active session cannot be deleted or converted in place. A running session cannot normally be deleted, exported, copied, resized, or converted. Cleanup also protects both IDs.

## Command reference

List sessions and inspect the store:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Create sessions:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` without a mode selects native. SquashFS creation captures the current live changes and has no fixed size. Its shutdown policy defaults to `shutdown`; periodic saving defaults to off.

Save and configure a SquashFS session:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Valid periodic intervals are `30`, `60`, `120`, `240`, and `480` minutes; `0` disables periodic saving. The shutdown and periodic settings are independent.

Export and import `.tar.zst` archives:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Only `.tar.zst` imports are accepted. Paths and archive members are validated, and extraction is bounded. `--auto-convert` chooses a compatible mode for the current filesystem. `--force-mode <mode>` explicitly selects an available mode. Export, copy, and conversion are not supported for SquashFS sessions; save the snapshot and copy the complete inactive session directory instead.

Copy or convert a session:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` is a logical filesystem copy and always assigns a new session ID. It can change backend, capacity, or encryption and creates fresh ext4 and LUKS identities. `clone` physically copies a detached backend and preserves its LUKS header, keyslots, LUKS UUID, and ext4 UUID. `convert` replaces the source by default; use `--new-session` to preserve the source. A size is relevant only for a container target.

Grow, delete, or clean up sessions:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize supports DynFileFS, DynBlk, VMDK, and raw sessions, including encrypted forms, and requires a size larger than the current size. DynBlk resize grows the virtual block device first and then expands its ext4 filesystem; it does not preallocate the new virtual capacity. Cleanup defaults to sessions older than 30 days.

All commands accept `--json`, and a different session store can be selected with `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## SquashFS save behavior

A SquashFS session is unpacked into RAM for the running writable layer. Saving rebuilds and validates an exact snapshot, then atomically replaces `changes.sb`.
No rollback generation is retained. Save Now is available from the tray icon, MiniOS Session Manager, or `minios-session save` regardless of the automatic policy.

For each save, MiniOS copies a stable view of the modified tree into private RAM storage when memory permits. Compression writes **one** image to a private directory within the numbered session. Only after checking its filesystem contents, digest, identity, and durable sync does the saver replace `changes.sb`. There is no full second compressed image in RAM or second write of that image to the persistence device. With too little RAM for the tree, only that working tree falls back to disk; the compressed candidate still needs one write. See [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) for cache and log write policies.

Boot diagnostics for a durable SquashFS session are stored under its `boot-logs/minios/` and `boot-logs/live/` directories. They do not depend on a successful shutdown snapshot and remain available even when the last changes to the RAM upper could not be saved. The backing store must still be writable; ordinary journal files may instead be temporary if `LIVE_LOG_STORAGE=volatile` is selected.

Shutdown saving is implemented by the core MiniOS shutdown trigger and the `minios-squashfs-save` backend, so it does not depend on MiniOS Session Manager being open or installed. Periodic saving is checked every 30 minutes by a systemd timer or a SysV worker, both of which call the same autosave backend. Rebuilding the snapshot consumes CPU and writes the complete snapshot; intervals of one hour or longer are recommended.

During RAM-backed SquashFS operation, a newly captured and activated SquashFS snapshot can take ownership of the running save target. After that handoff, the old running snapshot can be removed without rebooting:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

This exception applies only to a valid current-boot SquashFS handoff. Other running persistence modes remain protected from deletion.

## Encryption

LUKS2 is an optional layer over Raw `changes.img`, DynFileFS `virtual.dat`, or the direct DynBlk device. It is available only when `/run/initramfs/etc/minios-initramfs-crypt` contains `luks-layer-v1` and the selected backend's tools and capabilities are available.

Interactive LUKS creation asks for the passphrase twice. Operations that read or create LUKS data can read it from standard input with `--password-stdin`.
Passphrases are not placed in command arguments or session metadata. At boot, the initrd asks for the passphrase on the console. Three rejected attempts stop boot fatally; MiniOS does not continue with plaintext, RAM, another backend, or a replacement session under the same request.

Encrypted exports contain decrypted logical session files, not the encrypted backend. Importing, copying, or converting into LUKS creates a new encrypted backend with new identities.

## Backups and failed sessions

For native, DynFileFS, DynBlk, VMDK, and raw sessions, including encrypted forms, use `export` for logical backups rather than copying a mounted session directory. Keep the resulting archive on another device and verify that it can be imported before relying on it. Import always creates a new numbered session; activate it explicitly when it is ready to use.
For SquashFS and whole-device backup procedures, see [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

If a session fails after the storage fills, a write is interrupted, or empty sessions are created repeatedly, stop modifying the affected storage. Export a readable non-running session first when possible, then follow [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

Start diagnosis without modifying session data:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

At boot, container filesystems are checked before writable activation. Serious filesystem-check failures preserve the container for recovery instead of mounting it writable. SquashFS detects an unclean previous state and restores the last successfully saved snapshot. Delete sessions only through MiniOS Session Manager or `minios-session delete`; do not remove session directories manually.

## Returning unused DynBlk and VMDK storage

In Session Manager, right-click a DynBlk or VMDK session and choose **Free Space...**.
The dialog works for both the running session and an inactive session. For a
plaintext session it trims the internal ext4 before asking the driver to reclaim
space. An inactive session is attached temporarily and then disconnected; the
running session's device remains connected.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

The compaction checkbox is **off by default**, including on exFAT. There is no
automatic compaction fallback. Encrypted sessions reclaim only space already
known to the driver; this operation does not enable discard through LUKS or
reveal its allocation pattern. Device errors and failed trim stop the operation.

### Low-level driver commands

With the current DynBlk native or split VMDK backend, discard of complete grains
makes their placement reusable. On an ext4 backing filesystem, retired ranges
can also be hole-punched automatically. On exFAT, automatic cleanup only truncates
completely free file tails. **Automatic cleanup never moves live data.**

Use `fstrim` on the mounted inner changes filesystem (not the combined AUFS/OverlayFS
root) to report deleted blocks, then `dynblk reclaim /dev/dynblkN --execute` for
non-moving cleanup. Select the actual session device, not an assumed index.
To request write-intensive in-place compaction manually, add `--compact`.
It works without converting the image or changing virtual filesystem size;
other reads/writes may run between reclaim steps. It is not an automatic fallback.
The optional `--scan-zeroes` reads mapped grains, and is not enabled by default.

These commands are also available in the rebuilt initrd DynBlk CLI. No automatic
startup compaction is enabled. Encrypted sessions retain their existing discard
policy; the tools do not silently enable dm-crypt discard passthrough.
Read-only or `cache=unsafe` attachments cannot be reclaimed. Reported punched
ranges and truncated lengths are not the same as measured filesystem free space.

## VMDK session workflows

VMDK is a separate session mode, not a new compression codec. Create, activate,
resize, export/import, copy, clone and conversion use the same Session Manager
commands as other container modes:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Session archives contain logical files and metadata, not an arbitrary external
VMDK attachment. Managed VMDK sessions use the canonical `volume.vmdk` descriptor
and all its `volume-sNNN.vmdk` siblings. Do not rename parts or copy a live image
behind the driver. Switching between native DynBlk and VMDK requires an explicit
copy/conversion; changing `session_mode` by hand is not conversion.

The installer offers VMDK only when supported by the runtime and rejects source
images whose copied initrds lack the `vmdk-session-v1` capability. Update the CLI,
driver, session tools and boot scripts together before creating VMDK sessions.
