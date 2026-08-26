# Initrd persistence

MiniOS builds the live root from read-only modules and one writable upper layer.
The initrd decides whether that upper layer is a numbered persistent session or
a temporary directory in RAM. This page describes that boot-time decision and
activation path. For the user-facing controls, see [Boot modes](./Boot-Modes.md)
and [Boot parameters](./Boot-Parameters.md).

## Persistence is explicit

The initrd enables persistence handling only when the kernel command line
contains one of these recognized tokens:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

With none of those tokens, including when only an unrecognized `perch...` name
is present, MiniOS makes a fresh writable upper in RAM. Changes made during that
boot are discarded at shutdown.

The selectors are not all equivalent:

| Selector | Initrd behavior |
|---|---|
| `perch` | Tries to resume the metadata default. It does not automatically create a session when none is usable or when compatibility checks fail. |
| `perchdir=resume` | Tries the metadata default and may automatically create a new compatible replacement. This is the current boot-menu resume behavior. |
| `perchdir=new` | Allocates a directory whose numeric ID is one greater than the highest existing numeric ID. It never reuses an existing directory. |
| `perchdir=ask` | Offers existing sessions and a new-session choice. An incompatible existing session requires confirmation. |
| `perchdir=NUMBER` | Uses that directory when it exists. If it does not exist, selection can fall back to the default recorded in metadata; it does not reserve the requested number. |

Other recognized persistence parameters without a selector enter the same
legacy resume path as bare `perch`: they request persistence, but do not enable
automatic creation. If selection or activation cannot produce a usable upper,
boot normally continues with the RAM upper and publishes a failure warning.

## Session store and location

The normal store is the `changes` directory beside the MiniOS data, with
numbered session directories and `session.conf` or `session.json` metadata:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

The store may instead be selected as a device plus an optional path. Accepted
forms include a direct `/dev/...` path, `/dev/disk/by-label/LABEL/...`,
`/dev/mapper/...`, `label:LABEL/...`, `askdisk`, and `askdisk:custom:path`. The
colon-delimited suffix becomes a path below the selected device; slash syntax
after `askdisk` silently loses that custom path. A selected subdirectory is
bind-mounted as the session store. MiniOS can also discover a same-drive
persistence partition and supported Ventoy persistence storage.

Before session selection, the initrd must mount the location writable and prove
that it can create and remove a marker in the store. A block device that cannot
be opened for writing, a read-only mount, an unavailable path, or a failed
write test rejects persistence for that boot. Existing sessions are not trusted
merely because their files can be read.

## Selection and compatibility

Session metadata records the storage mode and may record the MiniOS version,
edition, union filesystem, and container size. Resume compares the recorded
mode, version, edition, and union with the requested mode and current system.
Missing legacy compatibility fields are not treated as mismatches.

Literal `perchdir=resume` creates a new numbered session when its default is
absent or when a recorded mode, version, edition, or union mismatch makes that
default unsuitable. Bare `perch`, a direct numeric selection, and other legacy
resume requests refuse automatic replacement and continue in RAM after a
selection failure. `perchdir=ask` shows compatibility information and permits
an explicit override. A new session defaults to `native` unless another mode
was requested.

The storage mode is part of compatibility. If selection reaches backend
dispatch, an unknown requested mode falls back to `native`, whose probe may then
select DynFileFS on unsuitable storage. An existing session with a different
recorded mode can fail the earlier compatibility check instead; a legacy resume
request then continues in RAM rather than reaching that fallback.

## Space reserve and sizes

MiniOS keeps 256 MiB free on the persistence filesystem by default. The reserve
and free-space checks use 1024-byte filesystem blocks. `perchreserve` accepts an
unsigned whole number without a unit, is capped at 4096, and falls back to 256
when it is missing or invalid. New allocation and requested growth are capped so
this reserve remains free. Boot also warns when current free space is at or
below the reserve.

Container sizes use whole counts that are allocated in MiB:

- A bare number, `M`, or `MB` means MiB.
- `G` or `GB` multiplies the number by 1000 MiB.
- `T` or `TB` multiplies the number by 1,000,000 MiB.
- The maximum logical request is 1,000,000 MiB, further limited by available
  space after the reserve.
- Session Manager caps raw and LUKS files at 4000 MiB on FAT32. During initrd
  activation the cap is applied reliably to LUKS, while an oversized raw request
  can reach allocation and fail instead of being reduced.
- New raw and LUKS sessions default to 4000 MiB.
- A new initrd-created DynFileFS session defaults to available capacity after
  the reserve, rounded down to a 1000 MiB boundary when possible.

Container growth is best-effort and shrinking is not supported. `perchsize`
does not size native or SquashFS sessions. Session Manager uses its own 4000 MiB
default for newly created container sessions; see
[Session management](./Session-Management.md).

## Storage activation

All successful modes must supply the writable upper expected by the selected
union filesystem. A backend mount alone is not final runtime authority. Native,
DynFileFS, raw, and LUKS can update persistent session metadata before union
validation; SquashFS defers that metadata commit. The protected current-boot
state is published only after the final root union is confirmed to use the
expected upper.

### Native

Native mode first excludes known non-POSIX filesystems such as FAT, exFAT, and
NTFS. It then probes real filesystem behavior by creating a file and symlink and
checking executable-mode changes. If the probe succeeds, the numbered session
directory is bind-mounted directly as the writable area.

If the filesystem is known to be unsuitable, or the POSIX probe fails, native
mode falls back to DynFileFS. A failure after native activation is unwound; a
new empty candidate is removed when it can be removed safely.

### DynFileFS

DynFileFS, implemented by the `dynblk`-compatible helper, stores one logical
block image in `changes.dat` plus its numbered segment files. The helper must
mount successfully and expose `virtual.dat`; otherwise activation fails rather
than accidentally creating a RAM-only file with a persistent-looking name.

The logical image contains ext4. Existing images are checked before writable
mounting; filesystem-check results above the corrected-errors status reject the
session and preserve it for recovery. Resize is growth-only, and the inner ext4
filesystem is expanded when possible. See
[DynFileFS recovery](./DynFileFS-Recovery.md) for segment and repair details.

### Raw

Raw mode uses a fixed `changes.img` ext4 image. New images are allocated and
formatted before use. Existing images are checked before mounting, may be grown
to a larger requested size, and have ext4 expanded to use the image. A failed
check or mount leaves the container available for recovery and continues the
boot in RAM.

### LUKS

LUKS mode uses a LUKS2 `changes.luks` container with ext4 directly inside it.
It is available only when the initrd includes the crypt support marker and the
required tools. Creation asks for matching confirmation input. An existing
container allows three unlock attempts on the boot console.

The initrd authenticates before growing an existing encrypted file, then checks
and expands ext4 before mounting it. If creation, unlock, checking, resizing, or
mounting fails, MiniOS cleans up the mapping and continues in RAM. It never
falls back to native, DynFileFS, raw, or any other unencrypted persistence.
Passphrases are not stored in session metadata or passed as command arguments.
See [Security](../administration/Security-Hardening.md).

### SquashFS

The initrd can activate only an existing SquashFS session; it cannot create a
new `changes.sb`. Activation validates strict, single-valued metadata for the
snapshot, including its digest, compressed and uncompressed sizes, entry count,
union type, and save policy. It also checks the file type and exact size,
available RAM and swap, the SHA-256 digest before and after extraction, and the
current union compatibility.

The snapshot is extracted with strict error and xattr handling into a bounded,
temporary ext4 image in RAM. For OverlayFS, that image contains separate
`changes` and `workdir` directories; for AUFS, its root is the writable branch.
Malformed metadata, insufficient memory, digest changes, extraction errors, or
an invalid policy fail activation and leave the boot on its ordinary RAM upper.

A session marked `dirty` means the previous boot did not complete the clean
shutdown transition. SquashFS then warns and restores the last successfully
saved `changes.sb`; unsaved changes from the interrupted boot are not a second
rollback generation.

Session Manager and the system save backend create and atomically replace
SquashFS snapshots using exact capture. Boot activation may read an existing
snapshot from writable FAT, exFAT, or NTFS storage because extraction occurs in
the temporary ext4 upper. Creation and exact saving remain filesystem-gated:
their private staging area must preserve links, ownership, modes, xattrs, ACLs,
capabilities, and union whiteouts, so current saving requires a suitable POSIX
filesystem. See [Session management](./Session-Management.md).

## Union activation and recovery boundary

For AUFS, the activated changes root becomes writable branch zero. For
OverlayFS, the initrd constructs `upperdir` and `workdir` beneath the activated
changes root and mounts the read-only modules as lower directories. The initrd
then verifies the live AUFS branch or OverlayFS `upperdir` before publishing
persistence as active.

If a persistence backend, metadata update, or this verification fails, its
mounts are unwound where possible, no successful runtime authority is
published, and the writable boot continues in RAM. Failure to construct the
root union enters the fatal initramfs shell. Exiting that shell can let setup
continue with an invalid root; it is not a repair or a safe fallback. AUFS
retains best-effort module branch appends, but an incomplete union crosses the
recovery boundary: MiniOS does not publish successful persistence authority.

Container check failures deliberately avoid writable recovery. Preserve the
session and follow [Backup recovery](../administration/Backup-Recovery.md),
[DynFileFS recovery](./DynFileFS-Recovery.md), or
[Troubleshooting](../administration/Troubleshooting.md) rather than replacing
session files during boot.

## Active, running, and current-boot state

In durable session metadata, `default=` is the **active** session selected for
the next resume, while `running=` is the session recorded as supplying the
current boot. Activation writes both fields and marks that session `dirty`.
After persistence mounts have disappeared during a clean shutdown, MiniOS
removes `running=` and marks the session `clean`.

Those metadata fields can be stale after a crash, failed metadata write, failed
union construction, copied store, or interrupted shutdown. Runtime consumers
that need to authorize saving do not trust `running=` alone. They use the
initrd's protected current-boot state, bound to the boot ID, numeric session,
mode, actual store identity, writable status, durability, and verified active
generation. A failed or missing current-boot record means persistence must not
be treated as an authorized save target.

With `toram` and a recognized persistence request, the session store is copied
into RAM before activation. The copied session can be writable and can supply
the running upper, but its current-boot state is marked non-durable. Changes to
that RAM copy do not return to the original device and are lost at shutdown.

For related operational guidance, see [Boot modes](./Boot-Modes.md),
[Boot parameters](./Boot-Parameters.md),
[Session management](./Session-Management.md),
[DynFileFS recovery](./DynFileFS-Recovery.md),
[Backup recovery](../administration/Backup-Recovery.md),
[Security](../administration/Security-Hardening.md), and
[Troubleshooting](../administration/Troubleshooting.md).
