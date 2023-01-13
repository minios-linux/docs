---
title: minios-modules
type: docs
weight: 1
---

# minios-modules

The minios-modules application is intended for batch creation of modules. The principle of operation is similar to the assembly of modules when installing the system in minios-live.
<!--more-->
## Create a simple module
To create a simple module, you need to create a modules folder, in it create a folder with the name of the module, for example:
`mkdir -p modules/10-gparted`
Next, you need to create the `install` file, inside which describe the commands necessary to install the program:
```
#!/bin/bash

apt update
apt install -y gparted

```
Next, return to the folder where the `modules` folder is located and run the build command:
```
minios-modules build_modules
```
This command will give you a module named **10-gparted-amd64-zstd.sb**. Similarly, you can create folders and scripts to build other modules. The specified command will build them sequentially in alphabetical order of folders in the <strong>modules</strong> folder.

## Create complex modules
**minios-modules** allows you to create even more complex modules. In addition to the **install** file, the module's scripts folder can contain **build**, **preinstall**, **postinstall**, **is\_dkms\_build** files, as well as **rootcopy- install**, **rootcopy-postinstall** and **patches**. The order of execution of scripts when assembling modules is as follows:
1. preinstall - *perform operations before installation, optional*
2. rootcopy-install - *files are copied from this folder to the root of the system of the future module before installation*
3. install - *main module assembly script*
* *After the installation script is executed, the process of automatic cleaning of the future module from garbage is started*
4. patches - <em>folder for copying files to the **patches** folder in the root of the module. It is copied only if the <strong>build</strong> script is present. You can put patches in it, which is clear from the name, to apply to the source codes in the script.</em>
5. build - <em>If you plan to compile programs, you must place all actions in this script. Before executing **build**, the files obtained during installation are automatically saved in the squashfs archive and unpacked into the squashfs-root folder so that the packages needed for the build do not get into the module. At the end of the **build** script, you need to add operations to copy the compiled files to the squashfs-root folder, and at the very end pack them into squashfs, since this step does not provide for automatic assembly of the module.</em>
6. rootcopy-postinstall - if cleaning removed something superfluous, you can return it back using this folder, or copy some files that could not be added to the system before installation
7. postinstall - *perform actions after installing the system. As a rule, this is an additional cleaning of debris.*

The <strong>is\_dkms\_build</strong>. An empty file with this name must be created if you use the **build** script to compile kernel modules (*yes, I know they may not be related to dkms, but historically this name has been used*), then only contents of /usr/lib/modules.

Sample scripts for building a module using **build** with <strong>patches</strong> folder: https://github.com/minios-linux/minios-live/tree/master/linux-live/scripts/04 -slax-desktop

Example scripts for building a module using **build** and <strong>is\_dkms\_build</strong>: https://github.com/minios-linux/minios-live/tree/master/linux-live/ scripts/10-virtualbox-6.1

Due to the fact that the name of the main user in MiniOS is dynamic and can be anything (see ...), when building a module that adds a group to the system, which will then need to be assigned to the main user (for example,
vboxusers for the virtualbox module) in order for it to run the program without root rights, you need to create a systemd service. This service will add the main user to the required group, if it was not added earlier, at system startup. For example:
```
APP="virtual box"
APP_NAME="VirtualBox"
APP_GROUP="vboxusers"

cat <<EOF >/usr/bin/$APP-allowuser.sh
#!/bin/bash
if ! grep $APP_GROUP /etc/group | grep \$(id -nu 1000) >/dev/null; then
     usermod -a -G $APP_GROUP \$(id -nu 1000)
fi
EOF
chmod +x /usr/bin/$APP-allowuser.sh
cat <<EOF >/usr/lib/systemd/system/$APP-allowuser.service
[unit]
Description=Allow user to use $APP_NAME
#After=network.target
[Service]
Type=oneshot
ExecStart=/usr/bin/$APP-allowuser.sh
RemainAfterExit=true
ExecStop=
StandardOutput=journal
[Install]
WantedBy=multi-user.target
EOF
systemctl enable $APP-allowuser.service
```
Full script: https://github.com/minios-linux/minios-live/blob/master/linux-live/scripts/10-virtualbox-6.1/install