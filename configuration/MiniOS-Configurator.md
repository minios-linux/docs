# MiniOS Configurator

MiniOS Configurator is a graphical editor for MiniOS `live-config` settings. It
validates changes and writes configuration for a later boot. It does not change
the running system directly.

## Start the configurator

Open MiniOS Configurator from the application menu or run:

```bash
minios-configurator
```

The default target is `/etc/live/config.conf`. To edit another regular file,
pass its path:

```bash
minios-configurator /path/to/config.conf
```

Saving requires PolicyKit authentication. Symlinks and non-regular target files
are rejected.

## Media and runtime configuration

MiniOS can read configuration from two locations:

- `minios/config.conf` and `minios/config.conf.d/*.conf` on the live medium
- `/etc/live/config.conf` and `/etc/live/config.conf.d/*.conf` in the running
  root filesystem

The Configurator edits the selected file only. With no path argument, it edits
the runtime file `/etc/live/config.conf`; it does not directly open the medium
file. MiniOS synchronizes newer configuration between the runtime filesystem
and writable MiniOS media during boot. Read-only media cannot receive runtime
changes, and persistent runtime configuration can remain independent of the
media copy.

For a given option, kernel parameters take precedence over configuration files,
and media configuration takes precedence over root-filesystem configuration.
Use `-i` to overlay recognized settings from the current kernel command line in
the editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

The selected file remains the save target. Unknown kernel parameters are
ignored.

## When settings apply

Every control states when it is used. Saving never applies a setting to the
current session.

### Applied after reboot

Hostname, locale, timezone, keyboard, boot target, service selection, module
mode, user-directory media handling, debug settings, and log export are read on
a later boot. Reboot after saving to apply them.

### Used only for a new session

Account creation, user and root passwords, `noroot`, sudo and PolicyKit policy,
SSH and XRDP policy, X11 access, password hints, and screen locking are one-shot
settings. A persistent session normally records completed `live-config`
components under `/var/lib/live/config/`, so changing these values and rebooting
the same session does not recreate the account or security state. Start a new
session to apply them as initial settings.

Security profiles are editor presets. The profile name is not saved; the
individual security settings are saved and remain editable.

## User directories and persistence

Linking and bind mounting user directories are mutually exclusive. Both use an
existing writable local MiniOS data medium and a safe media-relative path. They
are unavailable with `toram`, `toram=full`, or `toram=trim`, and MiniOS does not
merge two populated directory trees automatically.

`perchmode` and `perchsize` are initramfs boot parameters, not Configurator
settings. The Configurator does not create, unlock, resize, or repair a
persistence container. For encrypted persistence it only reports whether the
initramfs encryption marker is present.

## Save behavior

Review lists only changed values and redacts passwords. Saving updates only
changed keys while preserving comments, ordering, unknown keys, ownership,
permissions, and extended attributes. The write is atomic.

For the full variable and boot-parameter reference, see
[Configuration file](/configuration/Configuration-File.md),
[Boot parameters](/configuration/Boot-Parameters.md), and
[live-config](/configuration/live-config.md).
