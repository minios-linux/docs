# Backup and recovery

No single backup protects every part of a MiniOS system. Personal files,
configuration, persistent sessions, modules, and the storage device have
different restore procedures. Keep more than one copy, keep at least one copy
on another device, and test restoration before the original is needed.

## Use a layered backup strategy

A practical backup set has these layers:

1. Back up irreplaceable personal files frequently and independently of the
   MiniOS session.
2. Record configuration and module choices whenever they change.
3. Export each healthy, non-running session in a supported mode.
4. Keep an offline copy of data that Session Manager cannot export.
5. Create an occasional whole-media image after the source is shut down and no
   longer receiving writes.

Use versioned destinations rather than replacing the previous known-good
backup. Keep a record of the MiniOS release, edition, architecture, backup date,
session mode, and encryption status with each backup. A whole-media image is a
useful final safety net, but it should not be the only copy of personal files.

## Back up personal data first

Back up the complete home directory when possible, including hidden
application settings. At minimum, include work stored in Desktop, Documents,
Downloads, Music, Pictures, Public, Templates, and Videos, plus any project or
data directories created outside those standard locations.

MiniOS user-media support can link or bind the standard user directories to a
separate location on the writable MiniOS medium. The default configured path is
`/minios/userdata`, but `LIVE_USER_DIRS_PATH` can select another safe path. Data
there is outside the normal session layer and must be backed up separately.
Check the actual link or mount targets instead of assuming that exporting a
session includes them. Also back up files intentionally stored on other mounted
volumes.

Close applications that write databases, mail stores, browser profiles, or
virtual machine images before copying their data. For important data, prefer a
backup method that preserves ownership, permissions, links, extended
attributes, and timestamps when the destination supports them.

## Back up configuration

Preserve the configuration that controls future boots, not only the files seen
in the current root filesystem. Relevant locations can include:

- `minios/config.conf` and `minios/config.conf.d/` on writable MiniOS media.
- `/etc/live/config.conf` and `/etc/live/config.conf.d/` in a persistent or
  native system.
- Reviewed hooks, preseeds, boot-menu changes, and a note of custom boot
  parameters.
- User configuration under the home directory and selected system
  configuration under `/etc` for a native installation.

Configuration may contain password hashes, network credentials, keys, and
service settings. Protect its backup accordingly. Do not store plaintext
passphrases beside an encrypted session backup. See [Security
hardening](/administration/Security-Hardening.md) for encryption and media
handling guidance.

## Back up modules

Back up custom `.sb` files from durable module storage and record their order,
source, MiniOS release, and purpose. Do not infer the next boot from what is
visible in the current root filesystem:

- **Running Now** is the module set composing the current live system.
- **Next Boot** is the module set selected by current boot rules.

A module activated only for the current session may not be present in durable
storage. A module added for the next boot may not be active now. Review and
record both views before backup. Boot filters such as `load`, `noload`, and
`bext` can also change the effective next-boot set. See [Module
Manager](/administration/Module-Manager.md).

## Export persistent sessions

Use [Session management](/configuration/Session-Management.md) to identify the
Running Now session and the session selected for the next boot. Activating a
different session changes only the next boot; it does not make the current
session safe to export. Reboot into another session, or boot without
persistence, before backing up the former running session.

Session Manager can export a non-running `native`, `dynfilefs`, `raw`, or `luks`
session as a `.tar.zst` archive. Export is a logical backup of the files in the
session, not necessarily a byte-for-byte copy of its storage container. Keep
the archive on another device. Import creates a new numbered session; inspect
it and activate it explicitly only after validation.

A LUKS export contains decrypted logical session data, not the encrypted
`changes.luks` container. Encrypt the backup destination or archive by a
separate, reviewed method if the exported data must remain confidential.
Importing into LUKS creates a new encrypted container and requires a new target
passphrase.

Do not manually copy a mounted session directory. The session may be changing,
and a container-backed filesystem may not be represented by a consistent set
of files while it is active.

## Handle SquashFS sessions offline

Before backing up a running SquashFS session, use **Save Now** and wait for the
save and validation to finish. Saving rebuilds `changes.sb` and atomically
replaces the previous snapshot; it does not retain a rollback generation.
Then shut down cleanly.

The current Session Manager implementation rejects SquashFS export and copy.
After saving, boot without persistence or use another Linux system and copy the
SquashFS session from the inactive session store. Preserve the complete
numbered session directory and the session-store metadata together. Do not
replace or renumber entries in an active `minios/changes` store. See
[Boot recovery](/administration/Boot-Recovery.md) before changing boot or disk
structures during a restore.

## Preserve every DynFileFS segment

A DynFileFS session is one logical container split across a complete set of
backing files. An offline copy must include `changes.dat` and every numbered
segment such as `changes.dat.0`, `changes.dat.1`, and later segments. Copying
only the first file does not produce a usable backup. Do not create a missing
segment or repair the only copy.

Normal Session Manager export avoids this container-level concern by exporting
the logical session files. For interrupted copies, missing segments, full
media, and filesystem repair, follow [DynFileFS and dynblk
recovery](/configuration/DynFileFS-Recovery.md).

## Create a whole-media image

[Drive Utility](/installation/tools/Drive-Utility.md) can use **Create Image**
to read an entire device into a raw image, optionally with compression. This
captures the partition table, boot files, modules, configuration, session
store, user-media data, and unused blocks as they exist on the source device.
The image file therefore needs suitable destination space and may contain
recoverable deleted data and secrets.

Create the image offline. Shut MiniOS down and attach the source medium to a
different running system, or boot from another device. Make sure no source
partition is mounted and no persistence, swap, database, or background service
is writing to it. Drive Utility normally hides mounted devices, but showing a
device in the interface does not make a live raw image consistent.

Verify the source by device model, size, and device name. Save the image to a
different physical device, never to a filesystem on the source being imaged.
For restoration, **Write Image** performs a raw overwrite of the selected target
device. Confirm the target with the same care; all existing target data will be
lost. Use a target at least as large as the original source unless the image has
been prepared explicitly for a smaller device.

## Back up native installations

A native installation does not use a live persistent session as its root
filesystem, so Session Manager export is not a complete native-system backup.
Back up user home directories, selected system configuration, application data,
locally maintained files, and recovery credentials with a filesystem-aware
backup method. Record the MiniOS release, partition layout, installed package
selection, boot mode, and any custom modules or kernels.

For bare-metal recovery, make an offline whole-disk image or use a tested backup
product that supports the native filesystems and partition layout. Keep a
separate file-level backup so that individual files can be restored without
overwriting a disk. See [Boot recovery](/administration/Boot-Recovery.md) for
boot-file and bootloader diagnosis.

## Validate backups and test restores

A completed copy is not yet a proven backup. For each backup cycle:

1. Confirm that the backup is on a different device and has the expected date
   and size.
2. Record and later compare a cryptographic checksum for archives and disk
   images.
3. Open a sample of personal files, including at least one large file and one
   file from each important application data set.
4. Import a session archive as a new, inactive session and inspect its files.
   Test boot it only after preserving the current known-good session selection.
5. Verify that a DynFileFS offline copy contains the complete segment sequence.
6. Restore a whole-media image only to a disposable or spare device of adequate
   size, then test both boot and access to important data.
7. Test native file restoration to a separate location and verify permissions,
   ownership, links, and application readability.

Perform restore tests after changing persistence mode, encryption, partition
layout, MiniOS release, or backup software. Keep the last known-good backup
until the replacement has passed its restore test. For broader diagnosis, see
[Boot recovery](/administration/Boot-Recovery.md), [DynFileFS and dynblk
recovery](/configuration/DynFileFS-Recovery.md), and [Security
hardening](/administration/Security-Hardening.md).
