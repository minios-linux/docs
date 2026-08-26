# Recovering DynFileFS and dynblk Storage

DynFileFS and `dynblk` expose a dynamically allocated `virtual.dat` block image
whose data is stored in a set of `changes.dat` files. MiniOS formats
`virtual.dat` as ext4 and uses it for persistent changes. `dynblk` is the
maintained implementation of the same storage format; MiniOS keeps the
`dynfilefs` persistence mode name and the `@mount.dynfilefs` compatibility
command where required.

This guide covers inspection, migration, filesystem repair, session recovery,
and file extraction. It applies after an unclean shutdown, a full storage
device, an interrupted copy, or a session metadata failure.

Typical symptoms are:

- MiniOS creates another numbered session on every boot.
- `resume` does not load the previous desktop and files.
- Selecting an old session from the boot menu has no effect.
- Session directories still contain `changes.dat` files but are not activated.

The cause may be an incomplete storage segment, damaged container metadata, a
dirty ext4 filesystem inside `virtual.dat`, or an incorrect `session.conf`.

## Safety Rules

1. Do not repair the only copy of a storage container.
2. Do not copy source sessions over a running or mounted `minios/changes` store.
3. Copy the complete `changes` directory before attempting recovery.
4. Run `e2fsck -y` only on an additional copy of a session.
5. Do not create a missing `changes.dat.N` file manually.

Do not make the initial copy while the source session is running or its
DynFileFS container is mounted. Its metadata and segment files can change
independently and produce an inconsistent copy. Boot without persistence or use
another Linux system. Keep the DynFileFS/FUSE view, `virtual.dat` loop device,
and inner ext4 filesystem inactive. Mount only the outer storage filesystem,
preferably read-only, so its backing segment files can be copied consistently.

## 1. Locate the Source and Destination

Display filesystems and mount points:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Set paths for the source `changes` directory and a separate recovery directory
on a device with enough free space:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Verify that the destination has enough free space:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Copy All Session Files

Use `rsync` when available:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Alternatively:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Do not copy only the main `changes.dat` file. A DynFileFS session normally
contains a complete sequence:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

All segments are part of one container.

## 3. Identify a Storage Session

Compare session sizes and modification dates:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Empty or failed sessions are usually small. A session that contains actual
persistent data normally occupies considerably more space.

Check the saved session metadata:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS uses `session.conf` to select and describe persistence sessions.

## 4. Mount the DynFileFS or dynblk Container

Locate the installed helper. Depending on the MiniOS image, the canonical name
may be `dynblk` or the compatibility name `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Select a candidate session, for example session 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Do not specify `-s` or `perchsize` during this manual recovery mount. The normal
boot path may pass `-s` for a requested or recorded logical size, but recovery
intentionally avoids a resize request and reads the existing size from the
DynFileFS/dynblk metadata.

A successful mount exposes `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Check its ext4 filesystem without making changes:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Then mount it read-only:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

If the expected files are visible, the session can be recovered.

Unmount in reverse order:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Repair the Inner Filesystem

If the container mounts but `e2fsck -n` reports ext4 errors, make another copy
of that session first:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Mount and repair only this copy:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Repeat the read-only check from the previous section after repairing it.

## 6. Recover Into a New Compatible Session

Prefer recovery into a newly created session over reconstructing metadata for
the damaged one. If a valid `.tar.zst` export exists, boot normally and import
it with automatic conversion for the destination filesystem:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Import creates a new numbered session. Inspect it, then activate it explicitly.

If only the mounted container is usable, create and boot a new session in a
mode compatible with the destination filesystem. Mount the recovered copy
read-only as in section 4, then copy the required files into that running
session. For example, to recover home directories:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Copy only the data and configuration that you need. This avoids treating
unknown or incomplete compatibility metadata as a bootable session definition.

## 7. Do not reconstruct session metadata in place

Do not replace `session.conf` with a minimal file or add a recovered directory
to an existing store by hand. The metadata describes every session in that
store; replacing it can orphan healthy sessions, discard compatibility and save
policy fields, and change the next-boot selection.

If the container can be mounted read-only, recover its files into a newly
created compatible session as described above. If it cannot be mounted, retain
the complete offline copy for further filesystem or forensic recovery. A
container without trustworthy store metadata is recoverable input, not a
bootable session definition.

## Error Reference

- `cannot open ... changes.dat.N`: a committed segment is missing. Recopy it
  from the source device or try another session. Do not create an empty segment.
- `cannot read header`: the DynFileFS/dynblk header is damaged.
- `incompatible data format`: the helper and container format do not match.
- `virtual.dat` exists but ext4 does not mount: check a copy with `e2fsck`.

## Preventing Recurrence

Most incidents start when the persistence device fills up during use. Reduce the
risk with these measures:

- Keep a free-space reserve with the `perchreserve` boot parameter (default
  256 MiB). New and growing containers never consume it, and MiniOS warns at boot
  when free space drops to the reserve. Increase it on small or heavily used
  devices, for example `perchreserve=1024`.
- Delete old or unused sessions before the device becomes full.
- Prefer a fixed-size `raw` session when you need predictable disk usage, so
  growth cannot exhaust the device unexpectedly.
- Shut down cleanly. An abrupt power-off while the device is full is the most
  common cause of a container that later cannot be mounted.
