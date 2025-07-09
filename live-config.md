---
date: 2025-06-08
section: 7
title: LIVE-CONFIG
---

# NAME

**live-config** - System Configuration Components

# DESCRIPTION

**live-config** contains the components that configure a live system during the boot process (late userspace).

# CONFIGURATION

**live-config** can be configured through boot parameters or configuration files. If both mechanisms are used for a certain option, the boot parameters take precedence over the configuration files. When using persistency, **live-config** components are only run once.

If *live-build*(7) is used to build the live system, the live-config parameters used by default can be set through the `--bootappend-live` option, see *lb_config*(1) manual page.

## Boot Parameters (components)

**live-config** is only activated if `boot=live` is used as a boot parameter. Additionally, **live-config** needs to be told which components to run through the `live-config.components` parameter or which components to not run through the `live-config.nocomponents` parameter. If both `live-config.components` and `live-config.nocomponents` are used, or, if either one is specified multiple times, always the later one takes precedence over the previous one(s).

- **live-config.components | components**: All components are run. This is what live images use by default.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Only the specified components are run. Note that the order matters, e.g., `live-config.components=sudo,user-setup` would not work since the user needs to be added before it can be configured for sudo. Look at the filenames of the components in `/usr/lib/live/config` for their ordering number.
- **live-config.nocomponents | nocomponents**: No component is run. This is the same as not using any of `live-config.components` or `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: All components are run, except the specified ones.

## Boot Parameters (options)

Some individual components can change their behaviour upon a boot parameter.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Allows one to fetch and apply one or more debconf preseed files to be applied to the debconf database. Note that the URLs must be fetchable by wget (http, ftp, or file://). If the file is placed on the live medium, it can be fetched with `file:///run/initramfs/memory/data/FILE`, or with `file:///FILE` if it is in the root filesystem of the live system itself. All preseed files in `/usr/lib/live/config-preseed/` in the root filesystem of the live system can be automatically enabled with the keyword `filesystem`. All preseed files in `/minios/config-preseed/` of the live medium can be automatically enabled with the keyword `medium`. If several mechanisms are combined, then filesystem preseed files are applied first, then medium preseed files, and last the network preseed files.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Allows one to set the hostname of the system. The default is `debian`.
- **live-config.username=USERNAME | username=USERNAME**: Allows one to set the username that gets created for autologin. The default is `user`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Allows one to set the default groups of the users that gets created for autologin. The default is `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Allows one to set the fullname of the users that gets created for autologin. On Debian, the default is `Debian Live user`.
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
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Allows one to set the x-session-manager through update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Allows one to set xorg driver instead of autodetecting it. If a PCI ID is specified in `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` within the live system, the *DRIVER* is enforced for these devices. If both a boot parameter and an override are found, the boot parameter takes precedence.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Allows one to set xorg resolution instead of autodetecting it, e.g. 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Allows one to set WLAN driver instead of autodetecting it. If a PCI ID is specified in `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` within the live system, the *DRIVER* is enforced for these devices. If both a boot parameter and an override are found, the boot parameter takes precedence.
- **live-config.module-mode=MODE | module-mode=MODE**: Allows you to specify the module mode for live configuration. When set to "merged", the system will update user accounts, rebuild caches, and refresh package settings so that configuration changes are dynamically integrated into the running system.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Allows one to fetch and execute one or more arbitrary files. Note that the URLs must be fetchable by wget (http, ftp, or file://), the files are executed in /tmp of the running live system, and that the files needs their dependencies, if any, already installed, e.g. if a python script should be executed the system needs python installed. Some hooks for some common use-cases are available at `/usr/share/doc/live-config/examples/hooks/`. If the file is placed on the live medium, it can be fetched with `file:///run/initramfs/memory/data/FILE`, or with `file:///FILE` if it is in the root filesystem of the live system itself. All hooks in `/usr/lib/live/config-hooks/` in the root filesystem of the live system can be automatically enabled with the keyword `filesystem`. All hooks in `/minios/config-hooks/` of the live medium can be automatically enabled with the keyword `medium`. If several mechanisms are combined, then filesystem hooks are executed first, then medium hooks, and last the network hooks.

## Boot Parameters (shortcuts)

For some common use cases where it would require to combine several individual parameters, **live-config** provides shortcuts. This allows both to have full granularity over all the options, as well keep things simple.

- **live-config.noroot | noroot**: Disables sudo and policykit, the user cannot gain root privileges on the system.
- **live-config.noautologin | noautologin**: Disables both the automatic console login and the graphical autologin.
- **live-config.nottyautologin | nottyautologin**: Disables the automatic login on the console, not affecting the graphical autologin.
- **live-config.nox11autologin | nox11autologin**: Disables the automatic login with any display manager, not affecting tty autologin.

## Boot Parameters (special options)

For special use cases there are some special boot parameters.

- **live-config.debug | debug**: Enables debug output in live-config.

## Configuration Files

**live-config** can be configured (but not activated) through configuration files. Everything but the shortcuts that can be configured with a boot parameter can also alternatively be configured through one or more files. If configuration files are used, the `boot=live` parameter is still required to activate **live-config**.

**Note:** If configuration files are used, either (preferably) all boot parameters should be put into the **LIVE_CONFIG_CMDLINE** variable, or individual variables can be set. If individual variables are used, the user is required to ensure that all the necessary variables are set to create a valid configuration.

Configuration files can be placed either in the root filesystem itself (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), or on the live media (`minios/config.conf`, `minios/config.conf.d/*.conf`). If both places are used for a certain option, the ones from the live media take precedence over the ones from the root filesystem.

Although the configuration files placed in the configuration directories do not require a particular name, it is suggested for consistency reasons to either use `vendor.conf` or `project.conf` as a naming scheme (whereas `vendor` or `project` is replaced with the actual name, resulting in a filename like `progress-linux.conf`).

The actual content of the configuration files consists of one or more of the following variables.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: This variable corresponds to the bootloader command line.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: This variable corresponds to the `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` parameter.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: This variable corresponds to the `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*` parameter.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: This variable corresponds to the `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parameter.
- **LIVE_HOSTNAME=HOSTNAME**: This variable corresponds to the `**live-config.hostname**=*HOSTNAME*` parameter.
- **LIVE_USERNAME=USERNAME**: This variable corresponds to the `**live-config.username**=*USERNAME*` parameter.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: This variable corresponds to the `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"` parameter.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: This variable corresponds to the `**live-config.user-fullname**="*USER FULLNAME*"` parameter.
- **LIVE_ROOT_PASSWORD=PASSWORD**: This variable corresponds to the `**live-config.root-password**=*PASSWORD*` parameter. It specifies the root password in plain text.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: This variable corresponds to the `**live-config.root-password-crypted**=*PASSWORD*` parameter. It specifies the root password in crypted form.
- **LIVE_USER_PASSWORD=PASSWORD**: This variable corresponds to the `**live-config.user-password**=*PASSWORD*` parameter. It specifies the user password in plain text.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: This variable corresponds to the `**live-config.user-password-crypted**=*PASSWORD*` parameter. It specifies the user password in crypted form.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: This variable corresponds to the `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*` parameter.
- **LIVE_TIMEZONE=TIMEZONE**: This variable corresponds to the `**live-config.timezone**=*TIMEZONE*` parameter.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: This variable corresponds to the `**live-config.keyboard-model**=*KEYBOARD_MODEL*` parameter.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: This variable corresponds to the `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*` parameter.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: This variable corresponds to the `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*` parameter.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: This variable corresponds to the `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*` parameter.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: This variable corresponds to the `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*` parameter.
- **LIVE_UTC=yes|no**: This variable corresponds to the `**live-config.utc**=**yes**|no` parameter.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: This variable corresponds to the `**live-config.x-session-manager**=*X_SESSION_MANAGER*` parameter.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: This variable corresponds to the `**live-config.xorg-driver**=*XORG_DRIVER*` parameter.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: This variable corresponds to the `**live-config.xorg-resolution**=*XORG_RESOLUTION*` parameter.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: This variable corresponds to the `**live-config.wlan-driver**=*WLAN_DRIVER*` parameter.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: This variable corresponds to the `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*` parameter.
- **LIVE_LINK_USER_DIRS=true|false**: This variable corresponds to the `**live-config.link-user-dirs**=true|false` parameter. It enables or disables creation of symbolic links for user directories.
- **LIVE_BIND_USER_DIRS=true|false**: This variable corresponds to the `**live-config.bind-user-dirs**=true|false` parameter. It enables or disables bind-mounting for user directories.
- **LIVE_USER_DIRS_PATH=PATH**: This variable corresponds to the `**live-config.user-dirs-path**=*PATH*` parameter. It specifies the path for user directories on the media.
- **LIVE_MODULE_MODE**: This variable holds the state specified by the `live-config.module-mode` (or `module-mode`) parameter. When it is set to "merged", the live system applies updates (via minios-update-users, minios-update-cache, and minios-update-dpkg) to merge custom configurations with the base environment.
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
- **live-debconfig (passwd)**: configures user and root passwords via live-debconfig.
- **user-setup**: adds a live user account.
- **root-setup**: sets or updates the root password and configures the root user environment.
- **sudo**: grants sudo privileges to the live user.
- **user-media**: configures mounting of media and linking or binding of user directories for persistent data.
- **user-ssh**: synchronizes SSH authorized_keys between the live media and the user's home directory.
- **locales**: configures locales.
- **tzdata**: configures /etc/timezone.
- **xorg-service**: configures username in xorg.service.
- **gdm3**: configures autologin in gdm3.
- **kdm**: configures autologin in kdm.
- **lightdm**: configures autologin in lightdm.
- **lxdm**: configures autologin in lxdm.
- **nodm**: configures autologin in nodm.
- **slim**: configures autologin in slim.
- **xinit**: configures autologin with xinit.
- **keyboard-configuration**: configures the keyboard.
- **sysvinit**: configures sysvinit.
- **sysv-rc**: configures sysv-rc by disabling listed services.
- **login**: disables lastlog.
- **anacron**: disables anacron.
- **util-linux**: disables util-linux' hwclock.
- **apport**: disables apport.
- **gnome-panel-data**: disables lock button for the screen.
- **gnome-power-manager**: disables hibernation.
- **gnome-screensaver**: disables the screensaver locking the screen.
- **kaboom**: disables KDE migration wizard (squeeze and newer).
- **kde-services**: disables some unwanted KDE services (squeeze and newer).
- **policykit**: grant user privilegies through policykit.
- **ssl-cert**: regenerating ssl snake-oil certificates.
- **xrdp**: configures xrdp for remote desktop connectivity.
- **xfce4-panel**: configures xfce4-panel to default settings.
- **xscreensaver**: disables the screensaver locking the screen.
- **broadcom-sta**: configures broadcom-sta WLAN drivers.
- **xserver-xorg**: configures xserver-xorg.
- **openssh-server**: recreates openssh-server host keys.
- **xhyper-v**: configures X11 settings to improve compatibility on Microsoft Hyper-V platforms.
- **ntfs3**: manages udev rules for NTFS3 support.
- **config-module-mode**: configures system module mode and updates caches, user settings, and dpkg.
- **hooks**: allows one to run arbitrary commands from a file placed on the live media or an http/ftp server.

# FILES

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `live/config.conf`
- `live/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/live/config-hooks/*`
- `live/config-hooks/*`
- `/live/config-preseed/*`
- `live/config-preseed/*`

# SEE ALSO

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

More information about **live-config** and the Debian Live project can be found on the homepage at [Debian Live Wiki](https://wiki.debian.org/DebianLive) and in the manual at [Live Manual](https://live-team.pages.debian.net/live-manual/).

# BUGS

Bugs can be reported by submitting a bug report for the **live-config** package in the Bug Tracking System at [Debian Bugs](http://bugs.debian.org/) or by writing a mail to the Debian Live mailing list at [debian-live@lists.debian.org](mailto:debian-live@lists.debian.org).

# AUTHOR

**live-config** was originally written by Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Since 2016, development has been continued by the Debian Live team. Since 2025, development of the modified version has been continued by the MiniOS Live team.
