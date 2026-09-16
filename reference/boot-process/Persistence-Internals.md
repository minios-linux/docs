---
updated: 2026-09-16
---
# Persistence internals

This page explains the `perch`, `perchdir`, `perchmode`, `perchsize`, and `perchreserve` boot parameters. These parameters control where changes from a live session are stored. For normal use, select a persistent entry in the boot menu or use MiniOS Session Manager instead of editing them manually.

MiniOS builds the live root from read-only modules and one writable upper layer.
The initrd decides whether that upper layer is a numbered persistent session or a temporary directory in RAM. This page describes that boot-time decision and activation path. For the user-facing controls, see [Boot modes](/using-minios/Boot-Modes) and [Boot parameters](/reference/Boot-Parameters).

## In plain language

Without a persistence parameter, MiniOS puts changes in RAM and discards them at shutdown. A persistence parameter asks MiniOS to locate writable storage, select or create a numbered session, check compatibility, and use that session as the writable layer.

Requesting persistence does not guarantee that it became active. If the target is read-only, full, damaged, or incompatible, MiniOS can continue with a temporary RAM layer. Read the startup warning before relying on saved changes.

## Parameters explained

| Parameter | What it tells MiniOS | Typical choice |
|---|---|---|
| `perchdir=resume` | Open the default compatible session and, under supported conditions, create a replacement when it cannot be used. | Normal daily work. |
| `perchdir=new` | Create a new numbered session. | Keep an existing workspace unchanged. |
| `perchdir=ask` | Display saved sessions after a resumable store has been found and let you choose one. It cannot create the first session on empty storage. | Several existing workspaces on one device; use `perchdir=new` for the first session. |
| `perchdir=NUMBER` | Request a particular numbered session. | Stable custom boot entry after checking the session ID. |
| `perchmode=MODE` | Select `native`, `dynfilefs`, `dynblk`, `raw`, or `squashfs`. | Match the backing filesystem and desired persistence model. |
| `perchencrypt=luks` | Add a LUKS2 layer when creating a Raw, DynFileFS, or DynBlk session. | Encrypt a supported container backend. |
| `perchsize=SIZE` | Request the size of a new or growing container session. | DynFileFS, DynBlk, or raw; encryption does not change the backend size semantics. |
| `perchcomp=CODEC` | Select DynBlk backend compression for a newly created DynBlk session. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, or `842`; availability still depends on the running kernel. Compression is disabled when LUKS wraps DynBlk. |
| `perchreserve=MB` | Subtract a margin when sizing a new or growing container and set the low-space warning threshold. | Leave working space when allocating a container; it is not a runtime quota. |
| `perch` | Use the older resume behavior without automatic replacement creation. | Compatibility with an existing custom entry; prefer `perchdir=resume` for current menus. |

Do not combine persistence with `toram` when you expect changes to be written back to the original device. MiniOS activates the copied session in RAM, and changes to that copy are lost at shutdown.

## Persistence is explicit

The initrd enables persistence handling only when the kernel command line contains one of these recognized tokens:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

With none of those tokens, including when only an unrecognized `perch...` name is present, MiniOS makes a fresh writable upper in RAM. Changes made during that boot are discarded at shutdown.

The selectors are not all equivalent:

| Selector | Initrd behavior |
|---|---|
| `perch` | Tries to resume the metadata default. It does not automatically create a session when none is usable or when compatibility checks fail. |
| `perchdir=resume` | Tries the metadata default and may automatically create a new compatible replacement. This is the current boot-menu resume behavior. |
| `perchdir=new` | Allocates a directory whose numeric ID is one greater than the highest existing numeric ID. It never reuses an existing directory. |
| `perchdir=ask` | Offers existing sessions after a resumable store and default have been found. An incompatible existing session requires confirmation. On empty storage, use `perchdir=new` to create the first session. |
| `perchdir=NUMBER` | Uses that directory when it exists. If it does not exist, selection can fall back to the default recorded in metadata; it does not reserve the requested number. |

Other recognized persistence parameters without a selector enter the same legacy resume path as bare `perch`: they request persistence, but do not enable automatic creation. If selection or activation cannot produce a usable upper, boot normally continues with the RAM upper and publishes a failure warning.

## Session store and location

The normal store is the `changes` directory beside the MiniOS data, with numbered session directories and `session.conf` or `session.json` metadata:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

The store may instead be selected as a device plus an optional path. Accepted forms include a direct `/dev/...` path, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, and `askdisk:custom:path`. The colon-delimited suffix becomes a path below the selected device; slash syntax after `askdisk` silently loses that custom path. A selected subdirectory is bind-mounted as the session store. MiniOS can also discover a same-drive persistence partition and supported Ventoy persistence storage.

Before session selection, the initrd must mount the location writable and prove that it can create and remove a marker in the store. A block device that cannot be opened for writing, a read-only mount, an unavailable path, or a failed write test rejects persistence for that boot. Existing sessions are not trusted merely because their files can be read.

## Selection and compatibility

Session metadata records the storage mode and may record the MiniOS version, edition, union filesystem, and container size. Resume compares the recorded mode, version, edition, and union with the requested mode and current system.
Missing legacy compatibility fields are not treated as mismatches.

Literal `perchdir=resume` creates a new numbered session when its default is absent or when a recorded mode, version, edition, or union mismatch makes that default unsuitable. Bare `perch`, a direct numeric selection, and other legacy resume requests refuse automatic replacement and continue in RAM after a selection failure. `perchdir=ask` shows compatibility information and permits an explicit override. A new session defaults to `native` unless another mode was requested.

The storage mode is part of compatibility. If selection reaches backend dispatch, an unknown requested mode falls back to `native`, whose probe may then select DynFileFS on unsuitable storage. An existing session with a different recorded mode can fail the earlier compatibility check instead; a legacy resume request then continues in RAM rather than reaching that fallback.

## Space reserve and sizes

MiniOS uses 256 MiB as the default allocation margin and low-space warning threshold. The calculation uses 1024-byte filesystem blocks. `perchreserve` accepts an unsigned whole number without a unit, is capped at 4096, and falls back to 256 when it is missing or invalid. The margin reduces the space offered to a new or growing container. It is not a quota: a native session or later writes can still consume the remaining filesystem space. Boot warns when current free space is at or below the threshold.

Container sizes use whole counts that are allocated in MiB:

- A bare number, `M`, or `MB` means MiB.
- `G` or `GB` multiplies the number by 1000 MiB.
- `T` or `TB` multiplies the number by 1,000,000 MiB.
- Raw containers are capped at 1,000,000 MiB and by available space after the reserve. DynFileFS has a separate RAM-aware limit and a 2,000,000 MiB hard ceiling. DynBlk has its own 512 GiB format/ABI ceiling.
- Raw is a single backing file, so FAT32 limits it to 4000 MiB in MiniOS. The same limit applies when Raw is wrapped in LUKS2.
- A new raw session defaults to 4000 MiB. Encryption does not create a separate LUKS size policy: an encrypted Raw, DynFileFS, or DynBlk session keeps the size rules of its underlying backend.
- A new initrd-created DynFileFS session without `perchsize` uses up to 16 GiB of logical capacity. If the backing store cannot ultimately hold that much after `perchreserve` and DynFileFS index overhead, the default is reduced to the available capacity. Its format-400 index costs about 2 MiB of RAM and about 2 MiB of backing storage per GiB of declared logical capacity, even while the payload is empty. MiniOS therefore also limits DynFileFS capacity from physical RAM and by a tested 2,000,000 MiB hard ceiling.
- A new DynBlk session without `perchsize` follows the same 16 GiB automatic ceiling and is reduced when less backing space remains after `perchreserve`. Explicit DynBlk virtual size is still a thin-capacity request and is capped only by the 512 GiB format/ABI ceiling; physical backing files are created lazily. DynBlk owns its own sparse mapping-memory policy and does not require MiniOS to size that budget.

Container growth is best-effort and shrinking is not supported. `perchsize` does not size native or SquashFS sessions. MiniOS Session Manager defaults manually created raw and DynFileFS containers to 4000 MiB and DynBlk to 16 GiB; encrypted variants use the same backend defaults. See [Session management](/using-minios/Sessions-and-Persistence).

## Storage activation

All successful backends must supply the writable upper expected by the selected union filesystem. Mounting a backend does not by itself prove that persistence is active. Native, DynFileFS, DynBlk, and raw can update persistent session metadata before union validation; SquashFS defers that metadata commit. Raw, DynFileFS, and DynBlk can additionally use LUKS2 encryption. The protected current-boot state is published only after the final root union is confirmed to use the expected upper.

| Backend | Persistent representation | Capacity model | Backing-storage requirements | MiniOS LUKS2 layer |
|---|---|---|---|---|
| `native` | Files and directories directly in the numbered session directory | Uses backing filesystem space directly; `perchsize` does not apply | Writable filesystem that passes the POSIX behavior probe | No |
| `dynfilefs` | Format-400 `changes.dat` plus segment files exposing an ext4 `virtual.dat` | Thin payload with a dense capacity-sized index | Writable POSIX, FAT32, NTFS, or exFAT storage | Yes |
| `dynblk` | Format-1 `volumeNNN.db` files exposing `/dev/dynblkN`, with ext4 on top | Thin virtual block device with sparse runtime mappings | Filesystem accepted by the DynBlk kernel backend and enough backend resources | Yes |
| `raw` | Single fixed-size `changes.img` file containing ext4 | File is created at the requested logical size; growth only | Writable filesystem able to hold the image; FAT32 is limited to 4000 MiB | Yes |
| `squashfs` | Compressed `changes.sb` snapshot; writable runtime upper is reconstructed in RAM | Snapshot size follows captured changes; `perchsize` does not apply | Existing snapshots can be read from supported writable media, but exact saving requires a POSIX-capable staging filesystem | No |

### Native

Native mode stores the writable union contents directly in the numbered session directory. There is no inner image, loop device, FUSE container, or separate block filesystem, so capacity simply follows free space on the backing filesystem and `perchsize` does not apply. This has the least container overhead and preserves ordinary file visibility for recovery and backup.

MiniOS first excludes known non-POSIX filesystems such as FAT, exFAT, and NTFS. It then probes real filesystem behavior by creating a file and symlink and checking executable-mode changes. If the probe succeeds, the numbered session directory is bind-mounted directly as the writable area. If the filesystem is known to be unsuitable, or the POSIX probe fails, native mode falls back to DynFileFS. A failure after native activation is unwound; a new empty candidate is removed when it can be removed safely.

The MiniOS LUKS2 persistence layer does not wrap native mode because native has no container or block-device boundary to encrypt. Native persistence can still reside on storage that is encrypted outside this persistence layer.

### DynFileFS

DynFileFS is the FUSE-based format-400 container backend. It exposes one logical `virtual.dat` image while storing data in `changes.dat` plus numbered segment files. The helper must mount successfully and expose `virtual.dat`; otherwise activation fails rather than accidentally creating a RAM-only file with a persistent-looking name.

Its mapping index is dense with respect to declared logical capacity: each 4 KiB logical block has one 8-byte offset. That is about 2 MiB of index RAM per GiB of virtual capacity, and approximately the same amount is stored in the backing segment indexes even before payload data is written. Payload allocation itself remains dynamic. Because the static initrd binary is i686, MiniOS also applies a RAM-aware logical-size limit and a 2,000,000 MiB hard ceiling below the tested address-space failure point.

The logical image contains ext4. Existing images are checked before writable mounting; filesystem-check results above the corrected-errors status reject the session instead of mounting it writable. Resize is growth-only, and the inner ext4 filesystem is expanded when possible. For user-facing diagnosis, see [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

### DynBlk

The `dynblk` mode is a kernel block-device backend, separate from DynFileFS. Each numbered session owns a `volume000.db` namespace with lazily created `volume001.db` through `volume063.db` siblings. Attaching a volume through `/dev/dynblk-control` returns a dynamically allocated whole-disk device such as `/dev/dynblk0` or `/dev/dynblk3`; MiniOS must use the returned device and must not assume that `dynblk0` is free. Multiple DynBlk volumes can be attached at the same time.

MiniOS creates ext4 directly on the DynBlk whole-disk device, checks existing ext4 before writable use, and supports growth up to the format-1 limit of 512 GiB. Shrinking is not supported. The protected boot-state records the exact `/dev/dynblkN` used by the running persistent session so shutdown detaches that same device after its filesystem is unmounted. This remains correct even when Session Manager temporarily attaches another DynBlk session in parallel.

The virtual capacity is thin: it is not preallocated host space or mapping RAM. DynBlk keeps 128 logical 4 KiB mappings in each 4 KiB runtime chunk, so dense mapping memory is about 8 MiB/GiB. Level-0 tree pointers live with those sparse chunks; the fixed internal-node index is 396,312 bytes per attached device, and physical-page reference counters are allocated lazily in 4 KiB chunks that each cover 8 MiB of backing space. When no explicit mapping budget is supplied, the DynBlk driver itself selects approximately 25% of kernel-reported usable RAM after 64-MiB normalization, capped at 4096 MiB. MiniOS leaves that policy to the driver.

A new DynBlk volume may use backend compression selected with `perchcomp`. Compression is a property of the DynBlk storage format and is fixed for that volume after creation. If LUKS2 wraps DynBlk, MiniOS forces DynBlk compression to `none`, because the encryption layer sits above the DynBlk device. Actual writes can still fail because of lower-filesystem free space, the 64-part backing namespace, or DynBlk mapping admission. A failed or fenced device is detached only after its upper filesystem is no longer mounted; recovery validates the stored format on the next attach.

### Raw

Raw mode uses one `changes.img` file containing ext4. The file length is set to the requested logical capacity at creation time, so unlike the dynamic backends the capacity itself is fixed until an explicit grow operation. The lower filesystem may represent unwritten extents sparsely, but MiniOS still treats Raw as fixed-capacity storage and checks available backing space before creating or growing it. Because everything lives in one host file, FAT32 is limited to 4000 MiB.

Existing Raw images are checked with `e2fsck` before writable mounting. Growth extends `changes.img` and then expands ext4 with `resize2fs`; shrinking is not supported. A failed check or mount preserves the image for recovery and continues the boot in RAM. Raw has no FUSE daemon or custom block-storage metadata, which makes its recovery model straightforward, but it lacks the thin-capacity behavior of DynFileFS and DynBlk.

### LUKS encryption layer

LUKS2 is an optional encryption layer selected with `perchencrypt=luks` when creating a Raw, DynFileFS, or DynBlk session. Existing sessions take their encryption state from session metadata; specifying `perchencrypt` later does not reinterpret or convert an existing plaintext session.

The encryption boundary depends on the backend: Raw attaches `changes.img` through a loop device and puts LUKS2 inside that file; DynFileFS attaches its exposed `virtual.dat` through a loop device and encrypts that logical image; DynBlk uses the `/dev/dynblkN` block device directly as the LUKS2 source. In all three cases MiniOS creates ext4 inside `/dev/mapper/...`, so the filesystem contents and metadata inside the mapper are encrypted at rest. Backend metadata outside the LUKS boundary, boot files, session metadata, and other files on the persistence medium remain unencrypted.

Size defaults, growth limits, FAT32 restrictions, and thin/fixed allocation behavior still belong to the underlying backend. The initrd authenticates before growing an existing encrypted backend, closes the mapper before backend growth, then reopens it, checks ext4, and expands the filesystem before mounting it. For encrypted DynBlk, backend compression is forced to `none`.

Creation asks for the passphrase twice. Existing encrypted sessions allow three unlock attempts on the boot console. Three rejected passphrases invoke a fatal boot path: MiniOS does not continue in RAM, reinterpret the same session as plaintext, select another backend, or create a replacement. Other creation, checking, resize, or mount failures retain their backend-specific recovery behavior without plaintext fallback. Passphrases are not stored in session metadata or passed as command arguments. Logical exports contain decrypted session files rather than an encrypted backend image.

See [Security](/maintenance-and-recovery/Security) for the protection boundary and backup considerations.

### SquashFS

The initrd normally activates an existing SquashFS session. Interactive setup creates generation-zero metadata with shutdown saving enabled but does not create `changes.sb`; the writable upper layer exists only in RAM until the running system performs the first save on demand or at shutdown. A generation-zero session is valid only when snapshot artifact fields and `changes.sb` are absent. For later generations, activation validates strict, single-valued metadata for the snapshot, including its digest, compressed and uncompressed sizes, entry count, union type, and save policy. It also checks the file type and exact size, available RAM and swap, the SHA-256 digest before and after extraction, and the current union compatibility.

The snapshot is extracted with strict error and xattr handling into a bounded, temporary ext4 image in RAM. For OverlayFS, that image contains separate `changes` and `workdir` directories; for AUFS, its root is the writable branch.
Malformed metadata, insufficient memory, digest changes, extraction errors, or an invalid policy fail activation and leave the boot on its ordinary RAM upper.

A session marked `dirty` means the previous boot did not complete the clean shutdown transition. SquashFS then warns and restores the last successfully saved `changes.sb`; unsaved changes from the interrupted boot are not a second rollback generation.

MiniOS Session Manager and the system save backend create and atomically replace SquashFS snapshots using exact capture. Boot activation may read an existing snapshot from writable FAT, exFAT, or NTFS storage because extraction occurs in the temporary ext4 upper. Creation and exact saving remain filesystem-gated: their private staging area must preserve links, ownership, modes, xattrs, ACLs, capabilities, and union whiteouts, so current saving requires a suitable POSIX filesystem.

SquashFS has no `perchsize`: its stored size follows the compressed captured changes, while runtime memory is determined by the extracted writable upper. The MiniOS LUKS persistence layer does not wrap `changes.sb`; if snapshot confidentiality is required, the backing storage must be encrypted outside this layer. See [Session management](/using-minios/Sessions-and-Persistence).

## Union activation and recovery boundary

For AUFS, the activated changes root becomes writable branch zero. For OverlayFS, the initrd constructs `upperdir` and `workdir` beneath the activated changes root and mounts the read-only modules as lower directories. The initrd then verifies the live AUFS branch or OverlayFS `upperdir` before publishing persistence as active.

If a persistence backend, metadata update, or this verification fails, its mounts are unwound where possible, no successful persistence state is published, and the writable boot continues in RAM. Failure to construct the root union enters the fatal initramfs shell. Exiting that shell can let setup continue with an invalid root; it is not a repair or a safe fallback. AUFS retains best-effort module branch appends, but an incomplete union crosses the recovery boundary: MiniOS does not mark persistence as active.

Container check failures deliberately avoid mounting a suspect session writable.
Do not replace or reconstruct session files during boot. Preserve the affected storage first; see [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) and [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

## Active, running, and current-boot state

In durable session metadata, `default=` is the **active** session selected for the next resume, while `running=` is the session recorded as supplying the current boot. Activation writes both fields and marks that session `dirty`.
After persistence mounts have disappeared during a clean shutdown, MiniOS removes `running=` and marks the session `clean`.

Those metadata fields can be stale after a crash, failed metadata write, failed union construction, copied store, or interrupted shutdown. Runtime components that allow saving do not trust `running=` alone. They use the initrd's protected current-boot state, bound to the boot ID, numeric session, mode, actual store identity, writable status, durability, verified active generation, and, for DynBlk, the exact attached `/dev/dynblkN` device. A failed or missing current-boot record means persistence must not be treated as an approved save target.

With `toram` and a recognized persistence request, the session store is copied into RAM before activation. The copied session can be writable and can supply the running upper, but its current-boot state is marked non-durable. Changes to that RAM copy do not return to the original device and are lost at shutdown.

For related operational guidance, see [Boot modes](/using-minios/Boot-Modes), [Boot parameters](/reference/Boot-Parameters), [Sessions and persistence](/using-minios/Sessions-and-Persistence), [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Security](/maintenance-and-recovery/Security), and [Troubleshooting](/maintenance-and-recovery/Troubleshooting).
