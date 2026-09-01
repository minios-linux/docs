---
updated: 2026-08-31
---
# Backing up MiniOS

A backup is the reliable recovery path for MiniOS. The documentation does not promise a generic repair procedure for a damaged bootloader, filesystem, or persistence container. Keep recoverable copies before changing a release, kernel, storage layout, or important session.

## What to back up

Keep the parts that cannot simply be recreated from a MiniOS image:

- personal files, including hidden application data that matters to you;
- `config.conf`, reviewed `config.conf.d` files, and intentional boot-menu or boot-parameter changes;
- user-created `.sb` modules and a note of the MiniOS release they were built for;
- persistent sessions that contain system or application state you need;
- encryption keys, recovery credentials, and other secrets stored separately from the backup they protect.

Files stored outside the session layer, for example in a separate user-data location, must be backed up separately. Do not assume that a session archive contains data mounted from another filesystem.

## Export persistent sessions

MiniOS Session Manager can export a **non-running** `native`, `dynfilefs`, `raw`, or `luks` session to a verified `.tar.zst` archive. First identify the session:

```bash
minios-session list
minios-session running
```

Then boot another session or **Start without saving** and export the inactive session:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

The export is a logical copy of the session contents, not a byte-for-byte copy of its storage container. Store it on another device.

For a LUKS session, the archive contains the decrypted logical files. Protect the archive separately if the data must remain encrypted.

### SquashFS sessions

Current Session Manager does not export or copy SquashFS sessions. Use **Save Now** before shutdown so the current snapshot is complete, then protect the important files separately. If you need a complete restorable copy of the whole MiniOS device, create an offline device image instead.

Do not rely on manually copying a mounted session directory or on reconstructing `session.conf`, DynFileFS segments, or container metadata as a backup method.

## Back up configuration and modules

On writable MiniOS media, preserve `minios/config.conf`, `minios/config.conf.d/`, and user-created modules stored under `minios/modules/`.
Also record custom boot parameters or boot-menu changes that are not obvious from those files.

A module built for one MiniOS release is not automatically suitable for another.
Keep the source or recipe needed to rebuild important custom modules.

## Create a whole-device image

A whole-device image is useful when you want to preserve the partition table, boot files, modules, configuration, sessions, and other data together. Create it offline: shut MiniOS down and image the device from another running system.

[Drive Utility](/installing-minios/installation-tools/Drive-Utility) provides **Create Image** and **Write Image** operations. Save the image to a different physical device. Restoring a whole-device image overwrites the selected target, so verify the target model and capacity before writing it.

A device image is a supplement to, not a replacement for, a separate backup of important personal files.

## Restore a session archive

Importing a Session Manager archive creates a new numbered session; it does not overwrite the existing one:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Compatibility checks run during import. Inspect the imported session before activating it and keep the known-working session until the restored copy has been tested.

When moving to another MiniOS release, prefer migrating selected personal data and configuration. Do not assume that an old complete session or custom module is compatible with the new release merely because it can be copied there.

See [Sessions and persistence](/using-minios/Sessions-and-Persistence) for session management and [Updating MiniOS](/maintenance-and-recovery/Updating-MiniOS) for moving between MiniOS releases.
