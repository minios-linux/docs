---
updated: 2026-08-31
program_commits:
  minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---
# live-config


**live-config** - System Configuration Components

**live-config** contains the components that configure a live system during the boot process (late userspace).

Network boot in the initramfs (`ip=`, PXE, `from=http://…`) is a separate LiveKit layer and is **not** managed by live-config. See [Network boot](/reference/boot-process/Network-Boot).

**live-config** can be configured through boot parameters or the runtime configuration files prepared by the initramfs. The actual kernel command line is appended after file-provided `LIVE_CONFIG_CMDLINE` values, so later matching boot parameters take precedence. Components that record state under `/var/lib/live/config` normally run only once; synchronization and stateless components may run on each invocation.

If *live-build*(7) is used to build the live system, the live-config parameters used by default can be set through the `--bootappend-live` option, see *lb_config*(1) manual page.

## Boot Parameters (components)

**live-config** is only activated if `boot=live` is used as a boot parameter. By default, all components are run. The `live-config.components` parameter can restrict which components run, and `live-config.nocomponents` can exclude components. If both parameters are used, or either one is specified multiple times, the last occurrence takes precedence.

- **live-config.components | components**: All components are run. This is what live images use by default.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Only the specified components are run. Components are executed in the order encoded in their filenames under `/usr/lib/live/config`, regardless of their order in this list.
- **live-config.nocomponents | nocomponents**: No component is run.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: All components are run, except the specified ones.

## Boot Parameters (options)

Some individual components can change their behaviour upon a boot parameter.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Fetches and applies one or more debconf preseed files. URLs are handled by `wget` and may use HTTP, FTP, or `file://`. The keyword `filesystem` expands files in `/usr/lib/live/config-preseed/`; `medium` expands files in `minios/config-preseed/` on the detected live medium. Explicit local files can use paths such as `file:///run/initramfs/memory/data/minios/config-preseed/FILE` or `file:///PATH` in the live root. Pipe-separated entries are processed in the order specified; files expanded by a keyword use shell glob order.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Allows one to set the hostname of the system. The default is `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Selects wired network policy. Unset and `dhcp` leave the image default unchanged. `static` writes configuration for the selected backend; `off` disables automatic IPv4 configuration for the selected interface.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Selects the wired interface. If omitted for `static` or `off`, the only wired non-loopback interface is selected automatically; zero or multiple candidates require an explicit value.
- **live-config.network-address=IPV4 | network-address=IPV4**: Sets the static IPv4 address.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Sets the IPv4 prefix length from 0 to 32. The static default is `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Sets the optional IPv4 gateway.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Sets optional comma-separated DNS server addresses.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Selects the network backend. `auto` prefers NetworkManager and falls back to ifupdown. Forced `ifupdown` marks the interface unmanaged by NetworkManager when both stacks are installed.
- **live-config.username=USERNAME | username=USERNAME**: Allows one to set the username that gets created for autologin. The default is `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Sets the supplementary groups for the user created for autologin. Group names may be separated by commas or spaces. The MiniOS default is `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Allows one to set the fullname of the user created for autologin. The MiniOS default is `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Allows setting the root password in plain text.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Allows setting the root password in crypted form.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Allows setting the user password in plain text.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Allows setting the user password in crypted form.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Allows one to set the locale of the system, e.g. `de_CH.UTF-8`. The default is `en_US.UTF-8`. In case the selected locale is not already available on the system, it is automatically generated on the fly.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Allows one to set the timezone of the system, e.g. `Europe/Zurich`. The default is `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Allows one to change the keyboard model. There is no default value set.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Allows one to change the keyboard layouts. If more than one is specified, the tools of the desktop environment will allow one to switch it under X11. There is no default value set.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Allows one to change the keyboard variants. If more than one is specified, the same number of values as keyboard-layouts values should be specified as they will be matched one-to-one in the order specified. Blank values are allowed. The tools of the desktop environment will allow one to switch between each layout and variant pair under X11. There is no default value set.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Allows one to change the keyboard options. There is no default value set.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Allows one to disable sysv services through update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Allows one to change if the system is assuming that the hardware clock is set to UTC or not. The default is `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Allows one to set the x-session-manager through update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Allows one to set xorg driver instead of autodetecting it. If a PCI ID is specified in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` within the live system, the *DRIVER* is enforced for these devices. If both a boot parameter and an override are found, the boot parameter takes precedence.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Allows one to set xorg resolution instead of autodetecting it, e.g. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Allows one to set WLAN driver instead of autodetecting it. If a PCI ID is specified in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` within the live system, the *DRIVER* is enforced for these devices. If both a boot parameter and an override are found, the boot parameter takes precedence.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Allows you to specify the module mode for live configuration. When set to `merged`, the system will update user accounts, rebuild caches, and refresh package settings so that configuration changes are dynamically integrated into the running system.
- **live-config.link-user-dirs | link-user-dirs**: Links the managed user directories to the configured path on the MiniOS data medium.
- **live-config.bind-user-dirs | bind-user-dirs**: Bind-mounts the managed user directories from the configured path on the MiniOS data medium. This option is mutually exclusive with `link-user-dirs`.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Sets the media-relative path used by `link-user-dirs` or `bind-user-dirs`. The default is `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Fetches and executes arbitrary files from a temporary file in the running live system. URLs are handled by `wget` and may use HTTP, FTP, or `file://`; required interpreters and other dependencies must already be installed. The keyword `filesystem` expands files in `/usr/lib/live/config-hooks/`; `medium` expands files in `minios/config-hooks/` on the detected live medium (with an ISO-path fallback in the hook component). Explicit local files can use `file:///run/initramfs/memory/data/minios/config-hooks/FILE` or `file:///PATH` in the live root. Pipe-separated entries execute in the order specified; files expanded by a keyword use shell glob order. Examples are installed under `/usr/share/doc/live-config/examples/hooks/`.

> **Security warning:** `live-config` runs as root. Hooks are made executable and run as root, and preseeds alter the system debconf database with root privileges. Plain HTTP and FTP do not authenticate the downloaded content and provide no integrity protection. Prefer reviewed local files or trusted authenticated transport with independent integrity verification; do not use remote hooks or preseeds from untrusted networks.

## Boot Parameters (shortcuts)

For some common use cases where it would require to combine several individual parameters, **live-config** provides shortcuts. This allows both to have full granularity over all the options, as well keep things simple.

- **live-config.noroot | noroot**: Disables root password setup and the MiniOS sudo and PolicyKit privilege grants.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Controls sudo setup for the live user. The default, and historical MiniOS behavior when unset, is `passwordless`. The `password` mode keeps sudo access but requires the live user's password. The `disabled` mode removes the MiniOS sudo grant and keeps the live user out of the sudo group when the user is created. The older `noroot` shortcut overrides this and disables root privilege setup more broadly.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Controls MiniOS PolicyKit convenience rules. The default, and historical MiniOS behavior when unset, is `passwordless`. The `password` and `disabled` modes remove that rule, so normal distribution PolicyKit authentication applies. `disabled` is not a hard deny-all policy; use `noroot` when the live user must not gain administrative privileges.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Writes an OpenSSH `PermitRootLogin` policy when explicitly set and openssh-server is installed.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Writes an OpenSSH `PasswordAuthentication` policy when explicitly set and openssh-server is installed.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Controls XRDP posture when xrdp is installed. `relaxed` preserves historical MiniOS defaults. `hardened` binds XRDP to localhost, restores negotiated/high security settings, and disables XRDP root login. `disabled` disables and stops XRDP through `minios-svc` when available.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Controls MiniOS X11 convenience posture. `relaxed` preserves historical compatibility. `hardened` removes the permissive `-ac` X server option and tightens `Xwrapper.config` when present.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Controls whether `/etc/issue` shows the default MiniOS root/live password hints.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Controls whether live-config relaxes screen locking. `relaxed` preserves historical live-session convenience. `hardened` avoids disabling GNOME locking and enables xscreensaver locking where that file is present.
- **live-config.noautologin | noautologin**: Prevents live-config from setting up console and graphical autologin. It does not remove autologin already configured in a persistent session.
- **live-config.nottyautologin | nottyautologin**: Prevents live-config from setting up console autologin, without affecting graphical setup. Existing persistent configuration is not removed.
- **live-config.nox11autologin | nox11autologin**: Prevents live-config from setting up display-manager autologin, without affecting TTY setup. Existing persistent configuration is not removed.

## Boot Parameters (special options)

For special use cases there are some special boot parameters.

- **live-config.debug | debug**: Enables debug output in live-config.

## Configuration Files

**live-config** can be configured (but not activated) through configuration files. Any supported boot parameter can be placed in `LIVE_CONFIG_CMDLINE`, and most options can alternatively be set through individual variables. The `boot=live` parameter is still required to activate **live-config**.

**Note:** If configuration files are used, either (preferably) all boot parameters should be put into the **LIVE_CONFIG_CMDLINE** variable, or individual variables can be set. If individual variables are used, the user is required to ensure that all the necessary variables are set to create a valid configuration.

`live-config` itself sources `/etc/live/config.conf` and then `/etc/live/config.conf.d/*.conf` in shell glob order. Later fragments can therefore replace values from the main file or earlier fragments. It does not separately source a second media configuration layer.

On MiniOS media, the source files are `minios/config.conf` and `minios/config.conf.d/*.conf`. Before `live-config` starts, the MiniOS initramfs synchronizes these with the `/etc/live/` runtime files by modification time. A newer source file replaces its runtime counterpart; a newer runtime file is copied back only if the selected MiniOS data directory is writable. Equal timestamps cause no copy, missing files are filled, and files are not deleted. This is boot-time synchronization, not continuous monitoring. See [Configuration file](/reference/configuration/config.conf) for the complete synchronization and command-line precedence rules.

As a fallback for initramfs implementations that did not prepare the runtime file, the systemd and SysV startup wrappers copy `minios/config.conf` from the detected medium only when `/etc/live/config.conf` is absent. That fallback does not copy `config.conf.d` fragments. The standard current MiniOS LiveKit initramfs performs the earlier synchronization instead.

Fragment files must match `*.conf`. Names such as `vendor.conf` or `project.conf` are recommended; choose lexical names deliberately because later fragments override earlier ones.

The actual content of the configuration files consists of one or more of the following variables.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: This variable corresponds to the bootloader command line.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: This variable corresponds to the `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` parameter.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: This variable corresponds to the `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` parameter.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: This variable corresponds to the `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parameter.
- **LIVE_HOSTNAME=HOSTNAME**: This variable corresponds to the `**live-config.hostname**=*HOSTNAME*` parameter. Default is `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Selects wired network policy. `dhcp` and an unset value are no-ops and do not remove a previously created MiniOS static profile.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Selects the wired interface for `static` or `off` policy.
- **LIVE_NETWORK_ADDRESS=IPV4**: Sets the static IPv4 address.
- **LIVE_NETWORK_PREFIX=PREFIX**: Sets the static prefix length; defaults to `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Sets the optional static gateway.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Sets optional comma-separated DNS servers.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Selects the implemented backend.

The network component records `/var/lib/live/config/network` after successfully writing policy. Remove that stamp to apply changed policy on a persistent system. To retire a previous static profile, use `network-method=off` or remove the MiniOS-managed profile and stamp manually.

- **LIVE_USERNAME=USERNAME**: This variable corresponds to the `**live-config.username**=*USERNAME*` parameter. Default is `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: This variable corresponds to the `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` parameter.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: This variable corresponds to the `**live-config.user-fullname**="*USER FULLNAME*"` parameter.
- **LIVE_ROOT_PASSWORD=PASSWORD**: This variable corresponds to the `**live-config.root-password**=*PASSWORD*` parameter. It specifies the root password in plain text.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: This variable corresponds to the `**live-config.root-password-crypted**=*PASSWORD*` parameter. It specifies the root password in crypted form.
- **LIVE_USER_PASSWORD=PASSWORD**: This variable corresponds to the `**live-config.user-password**=*PASSWORD*` parameter. It specifies the user password in plain text.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: This variable corresponds to the `**live-config.user-password-crypted**=*PASSWORD*` parameter. It specifies the user password in crypted form.
- **LIVE_CONFIG_NOROOT=true|false**: This variable corresponds to the `**live-config.noroot**` parameter and disables root, sudo, and PolicyKit privilege setup when set to `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: This variable corresponds to the `**live-config.sudo-mode**=...` parameter. If unset, MiniOS keeps the historical passwordless sudo behavior.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: This variable corresponds to the `**live-config.polkit-mode**=...` parameter. `password` and `disabled` remove the MiniOS passwordless rule and restore normal distribution PolicyKit authentication.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: This variable corresponds to the `**live-config.ssh-permit-root-login**=...` parameter.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: This variable corresponds to the `**live-config.ssh-password-authentication**=...` parameter.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: This variable corresponds to the `**live-config.xrdp-mode**=...` parameter.
- **LIVE_X11_MODE=relaxed|hardened**: This variable corresponds to the `**live-config.x11-mode**=...` parameter.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: This variable corresponds to the `**live-config.issue-password-hints**=...` parameter.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: This variable corresponds to the `**live-config.lockscreen-mode**=...` parameter.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: This variable corresponds to the `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` parameter.
- **LIVE_TIMEZONE=TIMEZONE**: This variable corresponds to the `**live-config.timezone**=*TIMEZONE*` parameter.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: This variable corresponds to the `**live-config.keyboard-model**=*KEYBOARD_MODEL*` parameter.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: This variable corresponds to the `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` parameter.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: This variable corresponds to the `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` parameter.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: This variable corresponds to the `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` parameter.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: This variable corresponds to the `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` parameter.
- **LIVE_UTC=yes|no**: This variable corresponds to the `**live-config.utc**=**yes**|no` parameter.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: This variable corresponds to the `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*` parameter.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: This variable corresponds to the `**live-config.xorg-driver**=*XORG_DRIVER*` parameter.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: This variable corresponds to the `**live-config.xorg-resolution**=*XORG_RESOLUTION*` parameter.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: This variable corresponds to the `**live-config.wlan-driver**=*WLAN_DRIVER*` parameter.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: This variable corresponds to the `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parameter.
- **LIVE_LINK_USER_DIRS=true|false**: Enables or disables links from the user's standard data directories to the writable MiniOS drive. The corresponding boot parameter is the bare `live-config.link-user-dirs` flag. Link mode cannot be combined with bind mode or any `toram` mode.
- **LIVE_BIND_USER_DIRS=true|false**: Enables or disables bind mounts of the user's standard data directories from the writable MiniOS drive. The corresponding boot parameter is the bare `live-config.bind-user-dirs` flag. Bind mode cannot be combined with link mode or any `toram` mode.
- **LIVE_USER_DIRS_PATH=PATH**: This variable corresponds to the `**live-config.user-dirs-path**=*PATH*` parameter. It specifies a safe path inside the FAT32, exFAT, or NTFS MiniOS drive. The default is `/minios/userdata`; dot and parent-directory segments are rejected.

User-media setup never merges two non-empty directories automatically. A local non-empty directory is migrated only when its media destination is empty. When the feature is disabled, managed media data is copied back before links are removed. A failed validation or copy leaves the existing user directories in place and records the reason in `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: This variable holds the state specified by the `live-config.module-mode` (or `module-mode`) parameter. When it is set to `merged`, the live system applies updates (via minios-update-users, minios-update-cache, and minios-update-dpkg) to merge custom configurations with the base environment.
- **LIVE_CONFIG_DEBUG=true|false**: This variable corresponds to the `**live-config.debug**` parameter.

# CUSTOMIZATION

**live-config** can be easily customized for downstream projects or local usage.

## Adding new config components

Downstream projects can put their components into /usr/lib/live/config and do not need to do anything else, the components will be called automatically during boot.

The components are best put into an own debian package. A sample package containing an example component can be found in /usr/share/doc/live-config/examples.

## Removing existing config components

It is not really possible to remove components itself in a sane way yet without requiring either to ship a locally modified **live-config** package or using dpkg-divert. However, the same can be achieved by disabling the respective components through the live-config.nocomponents mechanism, see above. To avoid to always need specifying disabled components through the boot parameter, a configuration file should be used, see above.

The configuration files for the live system itself are best put into an own debian package. A sample package containing an example configuration can be found in /usr/share/doc/live-config/examples.

# COMPONENTS

**live-config** currently features the following components in /usr/lib/live/config.

- **nss-systemd**: removes or restores the systemd NSS module in /etc/nsswitch.conf to work around a known systemd issue.
- **debconf**: allows one to apply arbitrary preseed files placed on the live media or an http/ftp server.
- **hostname**: configures /etc/hostname and /etc/hosts.
- **issue-setup**: sets up the /etc/issue file with a welcome banner and distribution information.
- **live-debconfig_passwd**: configures user and root passwords via live-debconfig.
- **user-setup**: adds a live user account.
- **user-groups**: adds the live user to supplementary groups declared by installed modules. Existing groups listed in `/usr/share/live/config/user-default-groups.d/*.groups` are applied after user creation and on later live-config runs.
- **root-setup**: sets or updates the root password and configures the root user environment.
- **sudo**: grants sudo privileges to the live user.
- **user-ssh-keys**: synchronizes user-specific `authorized_keys.<username>` files between the live medium and individual user home directories. Supports multiple users simultaneously (e.g., `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: links or bind-mounts validated user directories on the existing writable MiniOS data medium, with safe migration and copy-back when disabled.
- **locales**: configures locales.
- **tzdata**: configures /etc/timezone.
- **xorg-service**: configures username in xorg.service and applies X11 posture when supported.
- **gdm3**: configures autologin in gdm3.
- **sddm**: configures autologin in sddm.
- **kdm**: configures autologin in kdm.
- **lightdm**: configures autologin in lightdm.
- **lxdm**: configures autologin in lxdm.
- **nodm**: configures autologin in nodm.
- **slim**: configures autologin in slim.
- **xinit**: configures autologin with xinit.
- **keyboard-configuration**: configures the keyboard.
- **sysvinit**: configures console autologin through `/etc/inittab` when sysvinit is installed. The `noautologin` and `nottyautologin` shortcuts suppress that setup.
- **sysv-rc**: configures sysv-rc by disabling listed services.
- **apport**: disables apport.
- **gnome-panel-data**: disables lock button for the screen.
- **gnome-power-manager**: disables hibernation.
- **gnome-screensaver**: controls GNOME screen locking according to `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: disables KDE migration wizard (squeeze and newer).
- **kde-services**: disables some unwanted KDE services (squeeze and newer).
- **policykit**: grants user privileges through PolicyKit.
- **ssl-cert**: regenerates SSL snake-oil certificates.
- **xrdp**: configures relaxed, hardened, or disabled XRDP posture when XRDP is installed.
- **anacron**: disables anacron.
- **util-linux**: disables the util-linux hwclock service.
- **login**: disables lastlog.
- **xserver-xorg**: configures xserver-xorg.
- **network**: configures durable wired IPv4 policy through a secure NetworkManager keyfile or ifupdown stanza. It runs before networking services, validates all values, and stamps only after a successful write.
- **openssh-server**: recreates OpenSSH host keys and writes explicitly requested root-login or password-authentication policy.
- **xfce4-panel**: configures xfce4-panel to default settings.
- **xscreensaver**: controls xscreensaver locking according to `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: configures broadcom-sta WLAN drivers.
- **hyperv**: configures X11 settings to improve compatibility on Microsoft Hyper-V platforms.
- **ntfs3**: manages udev rules for NTFS3 support.
- **config-module-mode**: configures system module mode and updates caches, user settings, and dpkg.
- **hooks**: allows one to run arbitrary commands from a file placed on the live media or an http/ftp server.

# FILES

- `minios/config.conf` on the selected MiniOS data medium (source copy)
- `minios/config.conf.d/*.conf` on the selected MiniOS data medium (source fragments)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` on writable selected data media when log export is enabled
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` on the detected live medium (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` on the detected live medium (`medium` preseeds)

# SEE ALSO

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

More information about **minios-live-config** can be found in its [GitHub repository](https://github.com/minios-linux/minios-live-config). General MiniOS information is available at [minios.dev](https://minios.dev).

# BUGS

Bugs can be reported in the [minios-live-config issue tracker](https://github.com/minios-linux/minios-live-config/issues).

# AUTHOR

**live-config** was originally written by Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Since 2016, development has been continued by the Debian Live team. Since 2025, development of the modified **minios-live-config** version has been continued by the MiniOS Live team.
