---
title: Configuration file
type: docs
weight: 1
---
# Configuration file

MiniOS differs from most classic flash distributions in that some parameters can be set before boot in a fairly simple configuration file `minios/minios.conf`, which minimizes the amount of work required when creating your own modules to create embedded systems. Optionally, some of the parameters can be set in the boot parameters.

<!--more-->
## MiniOS configuration file

Boot options take precedence over the configuration file. Some parameters in this file are service ones and it is better not to change them. Below is an example of a standard configuration file:

```
USER_NAME="live"
USER_PASSWORD="evil"
ROOT_PASSWORD="toor"
HOST_NAME="minios"
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
SSH_KEY="authorized_keys"
CLOUD="false"
SCRIPTS="true"
HIDE_CREDENTIALS="false"
AUTOLOGIN="true"
SYSTEM_TYPE="puzzle"
CORE_BUNDLE_PREFIX="00-core"
BEXT="sb"
```

Some of these options can only be set once, before the first load, if you are using persistent mode. In persistent mode, only the following parameters can always be changed:

```
USER_PASSWORD
ROOT_PASSWORD
ENABLE_SERVICES
DISABLE_SERVICES
SSH_KEY
HIDE_CREDENTIALS
AUTOLOGIN
```

## Description of parameters

| Parameter | Meaning | Example | Which initrd works with |
| --------- | ------- | ------- | ----------------------- |
| USER\_NAME | The name of the user whose profile will be created on first boot. If you specify the username <strong>root</strong>, then no user profile will be created, the **USER\_PASSWORD** parameter will be ignored, and login will be performed using the <strong>root</strong> profile. | USER\_NAME=live<br>USER\_NAME=user<br>USER\_NAME=root | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| USER\_PASSWORD | The password of a main user in clear text. The password must not include `'` , `\` , and other characters that might be misinterpreted by bash. | USER\_PASSWORD=evil<br>USER\_PASSWORD=PxKYJnLK8cv0E3Hd | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| ROOT\_PASSWORD | Password of the privileged user **root** in clear text. The password must not include `'` , `\` , and other characters that might be misinterpreted by bash. | ROOT\_PASSWORD=toor<br>ROOT\_PASSWORD=9gVIlgGsZtpKPsE8 | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HOST\_NAME | The name of the node associated with the system. | HOST\_NAME=minios | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| DEFAULT\_TARGET | The purpose of systemd. You can read more about systemd targets [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/working-with-systemd-targets_configuring-basic-system-settings). | DEFAULT\_TARGET=graphical<br>DEFAULT\_TARGET=multi-user | <ul><li>MiniOS Live Kit</li></ul> |
| ENABLE\_SERVICES | Enable services on boot. | ENABLE\_SERVICES=ssh<br>ENABLE\_SERVICES=ssh,firewalld | <ul><li>MiniOS Live Kit</li></ul> |
| DISABLE\_SERVICES | Turn off services on boot. | DISABLE\_SERVICES=docker<br>DISABLE\_SERVICES=docker,firewalld,ssh | <ul><li>MiniOS Live Kit</li></ul> |
| SSH\_KEY | The name of the SSH public key file, which must be located in the system folder on the media (along with the main .sb modules). By default, the system looks for a file named <strong>authorized\_keys</strong>.<br>This file will be copied to `~/.ssh/authorized_keys` of the main user and root user when the system boots, and can be used to authorize with using SSH keys. | SSH\_KEY=authorized\_keys<br>SSH\_KEY=my\_public\_key.pub | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CLOUD | Service parameter, required for use with cloud-init, does not apply to public versions of MiniOS. | CLOUD=false | <ul><li>MiniOS Live Kit</li></ul> |
| SCRIPTS | Running shell scripts from the minios/scripts folder, enabled by default. Scripts run automatically on tty2 after reaching multi-user.target (init 3). | SCRIPTS=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| HIDE\_CREDENTIALS | Hide credentials displayed as tooltip in tty. Disabled by default. | HIDE\_CREDENTIALS=false | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| AUTOLOGIN | Enable/disable automatic login. Enabled by default. | AUTOLOGIN=true | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| SYSTEM\_TYPE | Select the operating mode of the system. If you plan to install software exclusively by modules, you must use "puzzle", if you want to install software using apt, then "classic". The default setting is "puzzle". | SYSTEM\_TYPE=puzzle<br>SYSTEM\_TYPE=classic | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| CORE\_BUNDLE\_PREFIX | A service parameter that tells utilities in the system the name of the module with the base system. | CORE\_BUNDLE\_PREFIX=00-core | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |
| BEXT | A service parameter that indicates to utilities in the system the extension in the module file name. | BEXT=sb | <ul><li>MiniOS Live Kit</li></ul><ul><li>Slax Live Kit</li></ul><ul><li>UIRD</li></ul> |

***

## Important!

* The SSH server is enabled by default for compatibility with 3rd party initrds, to disable it, you must not only remove it from `ENABLE_SERVICES`, but also add it to `DISABLE_SERVICES`.
* **When first booting** in persistent mode, or if you are using clean boot or RAM boot mode, you can optionally change the `HOST_NAME` and `DEFAULT_TARGET` parameters.
* The `CLOUD`, `CORE_BUNDLE_PREFIX` and `BEXT` parameters cannot be changed, they are service ones and are used in non-standard non-public versions of MiniOS (cloud virtualization, non-standard module layout, etc.).
* When using an initrd other than the MiniOS Live Kit, some of the options will not be available, pay attention to the right column.

What else can the `minios.conf` file be useful for? You can use it to set your own parameters in your scripts when creating modules. On first boot, it is copied to the /etc/minios folder, then the `/etc/minios/minios.conf` file is automatically monitored and, when changes are made, overwrites the configuration file on the flash drive, if it is writable. Thus, you can put your variables in minios.conf and get them from `/etc/minios/minios.conf` in your scripts regardless of the type of initrd used.
