# Configuration file

MiniOS boot media store the main configuration at `minios/config.conf`. During boot, the initramfs synchronizes it to `/etc/live/config.conf` in the assembled live root. Scripts in the running system should therefore read `/etc/live/config.conf`; `/etc/minios/config.conf` and `config/config.conf` are not configuration paths used by the current boot code.

Boot parameters can override corresponding file settings. The following is an example of a standard `config.conf`:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
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
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```


## Description of Parameters

**Legend:**
- 🔒 **One-time only** - Applied only on first boot, cannot be changed on subsequent boots
- 🔄 **Reconfigurable** - Can be changed on every boot and reapplied

| Parameter | Reconfigurable | Meaning | Example |
| --------- | -------------- | ------- | ------- |
| LIVE_CONFIG_CMDLINE | 🔄 | Additional live-config options. `nottyautologin` is stored here instead of being hard-coded into every boot entry. See `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | 🔄 | The name of the node associated with the system. See `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | The name of the user whose profile will be created on first boot. If you specify the username <strong>root</strong>, then no user profile will be created, and login will be performed using the <strong>root</strong> profile. See `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Full name for the main user. See `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Comma-separated list of groups for the main user. See `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | The password of a main user in encrypted form (hash). Use `mkpasswd -m yescrypt` to generate. See `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Password of the privileged user **root** in encrypted form (hash). Use `mkpasswd -m yescrypt` to generate. See `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | If set, disables root account login and disables sudo/policykit for the user. See `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Sets the locale. Multiple values can be comma-separated. See `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Sets the timezone (e.g. "Europe/Berlin", "Etc/UTC"). See `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Sets the keyboard model (e.g. "pc105"). See `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Sets the keyboard layouts (comma-separated, e.g. "us,de"). See `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Sets keyboard options (e.g. "grp:alt_shift_toggle,grp_led:scroll"). See `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Sets the keyboard variants (comma-separated, can be empty or match layouts). See `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Enables debug output for live-config. See `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | If true, user directories will be linked from the specified path. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | If true, user directories will be bind-mounted from the specified path. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Path to user data directories on the flash drive. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Select the operating mode of the system. If you plan to install software exclusively by modules, use "merged". If you want to install software using apt, use "simple". The default is "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | The systemd target to boot into. See `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Enable services on boot (comma-separated). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Turn off services on boot (comma-separated). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | If true and the selected MiniOS data directory is writable, boot logs are copied to `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**For more details on most parameters, see:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- For systemd targets: `man systemd.special`

## Important!

* The SSH server is enabled by default for compatibility with 3rd party initrds, to disable it, you must not only remove it from `ENABLE_SERVICES`.

## Source, runtime copy, and precedence

The selected MiniOS data directory is normally the `minios/` directory on the boot medium. Its configuration paths and their runtime copies are:

| Selected data directory | Running system |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

For a normally mounted medium these source files are visible as `minios/config.conf` and `minios/config.conf.d/*.conf`, often below `/run/initramfs/memory/data/`. They are not loaded directly by `live-config`. The initramfs synchronizes them with the runtime paths before running `minios-boot`; see [Boot modes](/configuration/Boot-Modes.md) for where this occurs in the boot sequence.

Synchronization is performed at boot, not by a file monitor:

- The newer copy of `config.conf` wins by modification time. A newer source copy is copied into the live root. A newer runtime copy is copied back only when the selected data directory is writable.
- Each `config.conf.d/*.conf` file is synchronized independently by basename using the same modification-time and writability rules. Files are not deleted from either side.
- If the clock is earlier than the recorded last synchronization time, timestamp comparison is skipped and only missing destination files are filled.
- `toram=trim` copies `config.conf` but omits `config.conf.d/`; see [Initrd module loading](/configuration/Initrd-Module-Loading.md). Full `toram` copies the data tree, but synchronization then targets the RAM copy rather than the detached medium.

After synchronization, `live-config` reads `/etc/live/config.conf` first and then `/etc/live/config.conf.d/*.conf` in shell glob order, so a later fragment can replace an earlier value. It appends the actual kernel command line to `LIVE_CONFIG_CMDLINE`; for options repeated there, the later kernel command-line occurrence wins. `minios-boot` likewise reads `/etc/live/config.conf` for its supported early settings and gives its recognized kernel parameters precedence.

You can add project-specific shell variables to these files and read them from `/etc/live/config.conf` or the fragments at runtime. Quote values as shell strings and do not put spaces around `=`.

The early MiniOS log is `/var/log/minios/minios-boot.log`, while late `live-config` output is `/var/log/live/config.log`. With `EXPORT_LOGS="true"`, both trees are copied to `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` when the selected data directory is writable.
