---
updated: 2026-10-15
program_commits:
  minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
---
# Preconfiguring MiniOS


MiniOS Configurator is a graphical editor for MiniOS live configuration. It validates changes and writes configuration for a later boot. Early cache/log storage choices are applied by `minios-boot`; the remaining live-config components run later. Saving does not change the running system directly.

## Start the configurator

Open MiniOS Configurator from the application menu or run:

```bash
minios-configurator
```

The default target is `/etc/live/config.conf`. To edit another regular file, pass its path:

```bash
minios-configurator /path/to/config.conf
```

Saving requires PolicyKit authentication. Symlinks and non-regular target files are rejected.

## Media and runtime configuration

MiniOS can read configuration from two locations:

- `minios/config.conf` and `minios/config.conf.d/*.conf` on the live medium
- `/etc/live/config.conf` and `/etc/live/config.conf.d/*.conf` in the running root filesystem

MiniOS Configurator edits the selected file only. With no path argument, it edits the runtime file `/etc/live/config.conf`; it does not directly open the medium file. MiniOS synchronizes newer configuration between the runtime filesystem and writable MiniOS media during boot. Read-only media cannot receive runtime changes, and persistent runtime configuration can remain independent of the media copy.

At boot, MiniOS synchronizes the medium and runtime files by modification time. For the new storage policies, later `config.conf.d` fragments override the main file, `LIVE_CONFIG_CMDLINE` comes next, and the actual kernel command line wins last.
Use `-i` to overlay recognized settings from the current kernel command line in the editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

The selected file remains the save target. Unknown kernel parameters are ignored.

## When settings apply

Every control states when it is used. Saving never applies a setting to the current session.

### Applied after reboot

Hostname, locale, timezone, keyboard, boot target, service selection, module mode, user-directory media handling, debug settings, log export, and the three Advanced storage settings are read on a later boot. Reboot after saving to apply them.

In **Advanced**, **Module mode** accepts `simple` or `merged`. When `LIVE_MODULE_MODE` is absent from the selected configuration, current MiniOS Configurator presents `merged` as the effective default. In merged mode, live-config refreshes users, caches, and package state so configuration from the module stack is integrated into the running live system.

In **Advanced**, **System log storage**, **APT download cache**, and **Browser cache** each offer `persistent` (default) or `volatile`. They apply after successful persistence activation, including a writable RAM-copied session with protected origin information. With durable persistence, MiniOS boot diagnostics, APT package state, and browser profiles stay on storage; only selected logs and caches move to bounded RAM. With a RAM-copied session, retained state still needs a successful save to storage. APT and browser RAM caches require at least 1 GiB available and no non-zRAM swap. Browser setup runs after user creation. Configurator warns if the initrd lacks the required `perch-storage-v1` marker. See [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) for the fixed RAM limits.

### Used only for a new session

Account creation, user and root passwords, `noroot`, sudo and PolicyKit policy, SSH and XRDP policy, X11 access, password hints, and screen locking are one-shot settings. A persistent session normally records completed `live-config` components under `/var/lib/live/config/`, so changing these values and rebooting the same session does not recreate the account or security state. Start a new session to apply them as initial settings.

Security profiles are editor presets. The profile name is not saved; the individual security settings are saved and remain editable.

## User directories and persistence

Linking and bind mounting user directories are mutually exclusive. Both use an existing writable local MiniOS data medium and a safe media-relative path. They are unavailable with `toram`, `toram=full`, or `toram=trim`, or while the active persistence session is LUKS-encrypted. Copy-back is also blocked for an encrypted session. MiniOS does not merge two populated directory trees automatically.

`perchmode` and `perchsize` are initramfs boot parameters, not MiniOS Configurator settings. The new cache/log storage controls do not select or create a `perch` session. MiniOS Configurator does not create, unlock, resize, or repair a persistence container. For encrypted persistence it reports whether the initramfs encryption marker is present.

## Save behavior

Review lists only changed values and redacts passwords. Saving updates only changed keys while preserving comments, ordering, unknown keys, ownership, permissions, and extended attributes. The write is atomic.

For the full variable and boot-parameter reference, see [Configuration file](/reference/configuration/config.conf), [Boot parameters](/reference/Boot-Parameters), and [live-config](/reference/configuration/live-config).
