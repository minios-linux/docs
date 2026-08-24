# Session management in MiniOS

MiniOS sessions keep changes made to the live system across reboots. Each
session is a numbered directory under `minios/changes/`; the read-only MiniOS
modules remain unchanged and the selected session supplies the writable union
filesystem layer.

Use Session Manager from a running MiniOS system:

```bash
minios-session-manager
```

The equivalent command-line tool is `minios-session`. Its modifying commands
require administrative privileges, so the examples below use `sudo`.

## Session modes

| Mode | Storage | Main constraints |
|------|---------|------------------|
| `native` | Changes stored directly in the session directory | Requires a writable POSIX filesystem such as ext2/3/4, Btrfs, XFS, F2FS, or ReiserFS. |
| `dynfilefs` | Expandable ext4 container split into backing files | Works on writable POSIX, FAT32, NTFS, and exFAT filesystems. Requires the DynFileFS backend. |
| `raw` | Fixed-size `changes.img` containing ext4 | Works on writable POSIX, FAT32, NTFS, and exFAT filesystems. |
| `luks` | LUKS2-encrypted `changes.luks` containing ext4 | Requires `cryptsetup`, loop support, and the MiniOS initrd LUKS hook. |
| `squashfs` | Compressed snapshot in `changes.sb` | Saving requires a POSIX persistence filesystem that can preserve links, ownership, modes, xattrs, ACLs, capabilities, and whiteouts. |

`dynfilefs`, `raw`, and `luks` created with `minios-session` default to 4000
MB. Sizes use decimal `MB`, `GB`, or `TB` units and are limited to 1 TB. Raw
and LUKS files are limited to 4000 MB on FAT32. Container resize operations can
only grow a session; shrinking is not supported.

Native mode is the simplest and fastest choice on a compatible filesystem.
Use DynFileFS when the persistence filesystem cannot represent Linux metadata.
Use raw when fixed allocation is required, LUKS when the session must be
encrypted, and SquashFS for an exact compressed snapshot.

Run the following commands to inspect the actual persistence filesystem and
the modes available on it:

```bash
sudo minios-session info
sudo minios-session status
```

No session can be created on read-only media. SquashFS activation on
FAT32/NTFS/exFAT remains disabled until a metadata-preserving staging workspace
is available.

## Boot selection

Any recognized persistence parameter enables persistence handling. MiniOS boot
menus normally provide resume, new, selection, and non-persistent entries.

| Parameter | Meaning |
|-----------|---------|
| `perch` | Request persistence. |
| `perchdir=resume` | Resume the default session. This is best-effort and continues in memory if no writable, compatible session is available. |
| `perchdir=new` | Allocate a new numbered session. |
| `perchdir=ask` | Select an existing session or create one during boot. |
| `perchdir=<id>` | Select that numbered session directly. |
| `perchdir=<device/path>` | Use a persistence location on a device, including `/dev/...` and `label:...` forms handled by the initrd. |
| `perchmode=<mode>` | Set `native`, `dynfilefs`, `raw`, `luks`, or `squashfs`. |
| `perchsize=<size>` | Set a new or larger container size; plain values are MB and `MB`, `GB`, and `TB` suffixes are accepted. |

If no mode is specified for a new session, boot uses native mode. On
FAT32/NTFS/exFAT, native boot creation falls back to DynFileFS. A new raw or
LUKS boot container defaults to 4000 MB; a new DynFileFS boot session without
`perchsize` is sized from available space while retaining a safety reserve.
SquashFS sessions are captured from the running system with Session Manager or
`minios-session create squashfs`; `perchdir=new perchmode=squashfs` does not
create a snapshot in the initrd.

When resuming, MiniOS checks the recorded version, edition, union filesystem,
and mode. The normal `resume` path creates a new session instead of replacing
an incompatible one. Interactive selection displays a warning before allowing
an incompatible session.

The session store has this form:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` records the default and running IDs and per-session mode,
version, edition, union filesystem, size, state, and mode-specific settings.
It is the configuration committed by the boot implementation. Do not edit it
or move numbered session data while a session is mounted; use Session Manager
or `minios-session`.

## Active and running sessions

These terms describe different state:

- The **active** session is the default selected for the next boot.
- The **running** session supplies persistence to the current boot.

Activating a session changes the next boot and does not switch the current
union filesystem:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

The active session cannot be deleted or converted in place. A running session
cannot normally be deleted, exported, copied, resized, or converted. Cleanup
also protects both IDs.

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` without a mode selects native. SquashFS creation captures the current
live changes and has no fixed size. Its shutdown policy defaults to `shutdown`;
periodic saving defaults to off.

Save and configure a SquashFS session:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Valid periodic intervals are `30`, `60`, `120`, `240`, and `480` minutes;
`0` disables periodic saving. The shutdown and periodic settings are
independent.

Export and import `.tar.zst` archives:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Only `.tar.zst` imports are accepted. Paths and archive members are validated,
and extraction is bounded. `--auto-convert` chooses a compatible mode for the
current filesystem. `--force-mode <mode>` explicitly selects an available
mode.

Copy or convert a session:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` always assigns a new session ID. `convert` replaces the source by
default; use `--new-session` to preserve the source. A size is relevant only
for a container target.

Grow, delete, or clean up sessions:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize supports DynFileFS, raw, and LUKS sessions and requires a size larger
than the current size. Cleanup defaults to sessions older than 30 days.

All commands accept `--json`, and a different session store can be selected
with `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## SquashFS save behavior

A SquashFS session is unpacked into RAM for the running writable layer. Saving
rebuilds and validates an exact snapshot, then atomically replaces `changes.sb`.
No rollback generation is retained. Save Now is available from the tray icon,
Session Manager, or `minios-session save` regardless of the automatic policy.

Shutdown saving is implemented by the core MiniOS shutdown trigger and the
`minios-squashfs-save` backend, so it does not depend on Session Manager being
open or installed. Periodic saving is checked every 30 minutes by a systemd
timer or a SysV worker, both of which call the same autosave backend. Rebuilding
the snapshot consumes CPU and writes the complete snapshot; intervals of one
hour or longer are recommended.

During RAM-backed SquashFS operation, a newly captured and activated SquashFS
snapshot can take ownership of the running save target. After that handoff, the
old running snapshot can be removed without rebooting:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

This exception applies only to a valid current-boot SquashFS handoff. Other
running persistence modes remain protected from deletion.

## Encryption

LUKS mode stores an ext4 filesystem directly in a LUKS2 `changes.luks` file;
there is no partition table or nested DynFileFS container. LUKS choices are
available only when `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`,
and `losetup` are present.

Interactive LUKS creation asks for the passphrase twice. Operations that read
or create LUKS data can read it from standard input with `--password-stdin`.
Passphrases are not placed in command arguments or session metadata. At boot,
the initrd asks for the passphrase on the console and does not fall back to
unencrypted persistence if activation fails.

LUKS exports contain decrypted logical session files, not `changes.luks`.
Importing or converting into LUKS creates a new encrypted container.

## Backups and recovery

Use `export` for backups rather than copying a mounted session directory. Keep
the resulting archive on another device and verify that it can be listed or
imported before relying on it. Import always creates a new numbered session;
activate it explicitly when it is ready to use.

For recovery after a full storage device, an interrupted write, or repeated
creation of empty sessions, follow the dedicated
[DynFileFS and dynblk recovery guide](./DynFileFS-Recovery.md).

Start diagnosis without modifying session data:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

At boot, container filesystems are checked before writable activation. Serious
filesystem-check failures preserve the container for recovery instead of
mounting it writable. SquashFS detects an unclean previous state and restores
the last successfully saved snapshot. Delete sessions only through Session
Manager or `minios-session delete`; do not remove session directories manually.
