# Configuration file

MiniOS differs from most classic flash distributions in that some parameters can be set before boot in a fairly simple configuration file `config/config.conf`, which minimizes the amount of work required when creating your own modules to create embedded systems. Optionally, some of the parameters can be set in the boot parameters. Boot options take precedence over the configuration file. Some parameters in this file are service ones and it is better not to change them. Below is an example of a standard configuration file:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
| LIVE_CONFIG_CMDLINE | 🔄 | Additional live-config boot parameters. See `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
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
| EXPORT_LOGS | 🔄 | If true, when booting from a writable media, MiniOS logs are copied to the minios/logs folder during boot. | EXPORT_LOGS="false" |


**For more details on most parameters, see:**  
- `man 7 live-config` ([live-config](live-config.md))
- For systemd targets: `man systemd.special`

## Important!

* The SSH server is enabled by default for compatibility with 3rd party initrds, to disable it, you must not only remove it from `ENABLE_SERVICES`.

What else can the `config.conf` file be useful for? You can use it to set your own parameters in your scripts when creating modules. On first boot, it is copied to the /etc/minios folder, then the `/etc/live/config.conf` file is automatically monitored and, when changes are made, overwrites the configuration file on the flash drive, if it is writable. Thus, you can put your variables in config.conf and get them from `/etc/live/config.conf` in your scripts regardless of the type of initrd used.