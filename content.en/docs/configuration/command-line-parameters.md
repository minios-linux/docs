---
title: Command line parameters
type: docs
weight: 2
---

# Command line parameters

Boot parameters (also known as cheatcodes) are used to affect the boot process of MiniOS. Some of them are common for all Linuxes, others are specific for MiniOS only. You can use them to disable desired kind of hardware detection, to start MiniOS from hard drive, etc.

<!--more-->
 To use cheatcodes with syslinux, press `Esc` key to activate boot menu during MiniOS startup as usual, and when you see the boot menu, press `Tab`, edit the boot parameters, then press Enter. For grub, press `E` to edit, then `F10` to boot. A command line will appear at the bottom of the screen, which you can edit or add new boot parameters at the end. Some grub options cannot be changed interactively. To change them, edit `boot/grub/grub.cfg`.

| Cheatcode | Meaning | Example |
| --------- | ------- | ------- |
| from= | Load MiniOS data from specified directory or even from an ISO file. | from=/minios/ |
|  |  | from=/Downloads/minios.iso |
|  |  | from=http://domain.com/minios.iso |
| noload= | Disable loading of particular .sb modules specify as regular expression. | noload=04-xfce-apps |
|  |  | noload=xfce-apps,browser |
|  |  | noload=04,05 |
| nosound | Mute sound on startup. | nosound |
| toram | Activate Copy to RAM feature. | minios.flags=toram |
| perch | Activate Persistent Changes feature. | minios.flags=toram,perch |
| text | Disable starting of X and stay in textmode console only. | text |
| debug | Enable MiniOS startup debugging. | debug |
| root\_password= | Root password. | root\_password=toor |
| user\_name= | User name. If you specify the username <strong>root</strong>, then the user profile will not be created, the **user\_password** parameter will be ignored. | user\_name=live |
| user\_password= | User password. | user\_password=evil |
| host\_name= | Hostname of the system. | host\_name=minios |
| default\_target= | Target of systemd. You can read more about the systemd targets [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/working-with-systemd-targets_configuring-basic-system-settings). | default\_target=graphical |
|  |  | default\_target=multi-user |
|  |  | default\_target=emergency |
| enable\_services= | Enable services on boot. | enable\_services=ssh,firewalld |
| disable\_services= | Disable services on boot. | disable\_services=docker |
| ssh\_key= | The name of the ssh public key file, which should be located in the system folder on the media (along with the main .sb modules). By default, the system looks for a file named <strong>authorized\_keys</strong>. | ssh\_key=my\_public\_keys |
| scripts= | Scripts are run when the multi-user target (init 3) is reached. To run scripts, they must be located in the minios/scripts folder. The scripts variable can be set to interactive, background, or false. By default, when scripts are found in the specified folder, the system only boots up to the multi-user target, after which it interactively runs the scripts in alphabetical order. With scripts=background, the system boots as usual, scripts are executed in the background. When scripts=false, scripts are not loaded, even if they are located in the scripts folder. | scripts=interactive |
|  |  | scripts=background |
|  |  | scripts=false |
| cloud | Special mode to run as a cloud-init host. | cloud |
| hide\_credentials | Hide credentials displayed as a prompt in the console at system startup. | hide\_credentials |
| autologin= | Enable/disable automatic login. Enabled by default. | autologin=true<br>autologin=false |
| changes\_size= | The maximum size of the dynamic save file. Default is 4000 MB for FAT32 compatibility | changes\_size=2000 |
| changes= | The name of the file to save the changes. Changes.dat by default. | changes=mychangesfile.img |

Separate commands by space. See manual pages man bootparam for more cheatcodes common for all Linuxes.