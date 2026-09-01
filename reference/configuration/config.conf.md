---
updated: 2026-08-31
---

# config.conf

`config.conf` is the main MiniOS preconfiguration file. On a normal MiniOS medium it is stored as `minios/config.conf`. During boot, the initramfs synchronizes it with `/etc/live/config.conf` in the assembled system.

Use this file to prepare how MiniOS starts and how a new persistent session is initialized. It is primarily an administrator-facing preconfiguration mechanism, not a replacement for the normal configuration tools of the running desktop.

## Reconfiguration

The **Reconfigurable** column below uses these meanings:

- **Yes** — the setting can be changed and applied again on a later boot.
- **First boot only** — the setting is used when the corresponding persistent state is first created and is not normally reapplied on subsequent boots.

This distinction is part of the behavior users need to know. Internal `live-config` state files are implementation details and do not replace it.

## Generated configuration

A current MiniOS image generates a `config.conf` with this general structure:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
The exact values depend on the image and build configuration.

::: warning `LIVE_CONFIG_CMDLINE` is not the initramfs command line
`LIVE_CONFIG_CMDLINE` supplies options to **live-config** after the MiniOS root has been assembled. Parameters such as `from=`, `load=`, `toram`, and `perchdir=` must be real kernel boot parameters; putting them only in `LIVE_CONFIG_CMDLINE` is too late to affect the initramfs.
:::

## Standard parameters

| Parameter | Reconfigurable | Meaning |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Yes | Additional live-config options. The actual kernel command line is appended later and wins for repeated options. |
| `LIVE_HOSTNAME` | Yes | System hostname. |
| `LIVE_USERNAME` | First boot only | Name of the live user created during initial setup. |
| `LIVE_USER_FULLNAME` | First boot only | Full name of the live user. |
| `LIVE_USER_DEFAULT_GROUPS` | First boot only | Supplementary groups assigned when the live user is created. |
| `LIVE_USER_PASSWORD_CRYPTED` | First boot only | Crypt hash for the live-user password. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | First boot only | Crypt hash for the root password. |
| `LIVE_CONFIG_NOROOT` | First boot only | When enabled, suppresses the MiniOS root-password, sudo, and PolicyKit privilege setup. |
| `LIVE_LOCALES` | Yes | One or more system locales. |
| `LIVE_TIMEZONE` | Yes | System time zone, for example `Europe/Berlin` or `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Yes | XKB keyboard model. |
| `LIVE_KEYBOARD_LAYOUTS` | Yes | Comma-separated keyboard layouts. |
| `LIVE_KEYBOARD_OPTIONS` | Yes | XKB keyboard options. |
| `LIVE_KEYBOARD_VARIANTS` | Yes | Comma-separated variants matched to the configured layouts. |
| `LIVE_CONFIG_DEBUG` | Yes | Enables live-config debug output when set to `true`. |
| `LIVE_LINK_USER_DIRS` | Yes | Links managed user directories to the configured location on writable MiniOS media. |
| `LIVE_BIND_USER_DIRS` | Yes | Bind-mounts managed user directories from the configured location on writable MiniOS media. |
| `LIVE_USER_DIRS_PATH` | Yes | Location used by link/bind user-directory mode. |
| `LIVE_MODULE_MODE` | Yes | Selects `simple` or `merged` live-config module integration. |
| `DEFAULT_TARGET` | Yes | Boot target: `graphical.target`, `multi-user.target`, or `rescue.target`. |
| `ENABLE_SERVICES` | Yes | Comma-separated services enabled at boot through `minios-svc`. |
| `DISABLE_SERVICES` | Yes | Comma-separated services disabled at boot through `minios-svc`. |
| `EXPORT_LOGS` | Yes | When `true`, exports MiniOS and live-config startup logs to writable MiniOS media. |

The generated file is not an exhaustive list of everything supported by `minios-live-config`. Additional variables for wired network preconfiguration, security posture, hooks, preseeding, Xorg, and other components can be added manually. See [live-config](/reference/configuration/live-config) for the complete reference.

## Wired network preconfiguration

MiniOS can preconfigure a **wired IPv4** policy through the live-config `network` component. This is intended for administrative preconfiguration of a system before it starts on the target hardware.
For example:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

These settings are **First boot only** for the persistent network policy. After successful application, the component records `/var/lib/live/config/network`.
Changing the values does not overwrite an already configured persistent session unless that state is deliberately reset.

`LIVE_NETWORK_METHOD=static` writes a static policy. `off` disables automatic IPv4 for the selected interface. An unset value or `dhcp` leaves the image's existing network setup unchanged. `LIVE_NETWORK_BACKEND=auto` prefers NetworkManager and falls back to ifupdown.

This facility does not configure Wi-Fi. After boot, ordinary wired and wireless networking is managed by NetworkManager. See [Networking](/using-minios/Networking) for runtime network use and [live-config](/reference/configuration/live-config) for all network variables.
## MiniOS early-userspace settings

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, and `EXPORT_LOGS` are MiniOS settings rather than live-config variables. They are read by `minios-boot` before the normal init system takes over and are all **Reconfigurable: Yes**.

The corresponding boot parameters `default-target=`, `enable-services=`, and `disable-services=` take precedence for the current boot. The `text` parameter forces `multi-user.target`.

Current Toolbox and Ultra builds add `ssh` to `ENABLE_SERVICES`. To explicitly turn SSH off, put it in `DISABLE_SERVICES`; merely removing it from `ENABLE_SERVICES` does not request a disable operation.

With `EXPORT_LOGS="true"`, writable MiniOS media receives startup logs below:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

The corresponding runtime logs are `/var/log/minios/minios-boot.log` and `/var/log/live/config.log`.

## Source, runtime copy, and precedence
The selected MiniOS data directory normally contains these source files:

| Selected data directory | Running system |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

On normally mounted media they are visible as `minios/config.conf` and `minios/config.conf.d/*.conf`, often below `/run/initramfs/memory/data/` while the system is running.

Synchronization happens at boot; it is not a file monitor:

- The newer copy of `config.conf` wins by modification time. A newer media copy is copied into the live root. A newer runtime copy is copied back only when the selected MiniOS data directory is writable.
- Each `config.conf.d/*.conf` file is synchronized independently by basename using the same timestamp and writability rules. Files are not deleted from either side.
- If the clock is earlier than the recorded last synchronization time, timestamp comparison is skipped and only missing destination files are filled.
- `toram=trim` copies `config.conf` but omits `config.conf.d/`. Full `toram` copies the data tree, but synchronization then targets the RAM copy rather than the detached source medium.
After synchronization, `live-config` reads `/etc/live/config.conf` first and then `/etc/live/config.conf.d/*.conf` in shell glob order. A later fragment can therefore replace a value from the main file or an earlier fragment.

The actual kernel command line is appended to `LIVE_CONFIG_CMDLINE`. For an option that occurs more than once, the later kernel-command-line occurrence wins. `minios-boot` similarly gives its recognized kernel parameters precedence over the corresponding settings from `/etc/live/config.conf`.

You can add project-specific shell variables to `config.conf` or its fragments and read them from the runtime copies. Quote values as shell strings and do not put spaces around `=`.

## Related reference

- [Boot parameters](/reference/Boot-Parameters) — parameters that must be placed on the actual kernel command line and live-config overrides.
- [live-config](/reference/configuration/live-config) — complete late-userspace parameter, variable, component, and state reference.
- [Boot modes](/using-minios/Boot-Modes) — how persistence and `toram` affect configuration storage.
