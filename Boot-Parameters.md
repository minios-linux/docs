# Boot parameters

## How to Use Boot Parameters
Boot parameters, also known as kernel parameters, are commands that you can enter to customize the boot process of MiniOS. They can be used to disable hardware detection, start MiniOS from a specific device, and more.

### For Syslinux:
- Press <kbd>Esc</kbd> during the MiniOS boot sequence to access the boot menu.
- Press <kbd>Tab</kbd> to edit the boot options.
- Enter your desired parameters and press Enter to boot.

### For Grub:
- Press <kbd>E</kbd> when you see the grub menu.
- Edit the boot parameters at the end of the command line.
- Press <kbd>F10</kbd> to boot with the new settings.

## Boot Parameters Table
The table below lists the boot parameters available in MiniOS, their functions, and examples of how to use them.

| Parameter | Description | Example Usage | Available in Version |
|---|---|---|---|
| `from` | Loads MiniOS data from a specified directory, device, or ISO file. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` | 4.1, 5.0 |
| `load` | Enables loading of specified `.sb` modules using a regular expression. Works in conjunction with the `toram=trim` command, allowing only selected modules to be loaded into RAM.| `load=00-core`<br>`load=core,minios,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` | 4.1, 5.0 |
| `noload` | Disables loading of specified `.sb` modules using a regular expression. Works together with `toram=trim` command allowing to exclude selected modules from loading into RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` | 4.1, 5.0 |
| `nosound` | Disables sound at startup. (Only applicable in the Fluxbox environment.) | `nosound` | 4.1 (Fluxbox only) |
| `perchdir` | Selects a profile or performs an action with a profile. Accepts the profile number or the keywords `resume` (resume previous session), `new` (start a new session), or `ask` (select session at startup). If omitted, MiniOS starts in "clean" mode. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` | 4.1, 5.0 |
| `perchsize` | Sets the size of the DynFileFS virtual file system (in MB), used for storing data on non-Linux file systems (e.g., FAT32, NTFS). Defaults to 16GB. Use this option if your target disk is smaller. | `perchsize=4000`<br>`perchsize=32000` | 4.1, 5.0 |
| `perchmode` | Save mode for persistent changes.<br>`native` (default) - storing data as is on POSIX-compatible file systems;<br>`dynfilefs` - storing data in dynamically expandable image files;<br>`raw` - storing data in a fixed-size image file.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` | 4.1, 5.0 |
| `toram` | Copies the system to RAM. Can take `trim` and `full` values. If specified without parameters, it defaults to `trim` in 4.1 and `full` from 5.0.<br>`trim` - only necessary data is copied, considering `load` and `noload` filters. If `perch` parameters are specified, changes are also loaded.<br>`full` - the entire minios folder is loaded, excluding changes unless `perch` is specified. | `toram`<br>`toram=trim`<br>`toram=full` | 4.1, 5.0 |
| `text` | Disables the X server and starts in text console mode. | `text` | 4.1, 5.0 |
| `debug` | Enables debugging output during startup. | `debug` | 4.1, 5.0 |
| `nozram` | Disables zram swap. | `nozram` | 4.1, 5.0 |
| `zramsize` | Sets the zram swap size (in MB). | `zramsize=512`<br>`zramsize=2048` | 4.1, 5.0 |
| `zramcomp` | Specifies the zram compression algorithm. Available options for Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Defaults to `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` | 4.1, 5.0 |
| `default_target`/`default-target` | Sets the default systemd target. In 4.1 uses `default_target`, in 5.0 supports both `default_target` and `default-target`. | `default_target=graphical` (4.1)<br>`default-target=multi-user` (5.0)<br>`default_target=rescue` (both) | 4.1, 5.0 |
| `enable_services`/`enable-services` | Enables specified systemd services at boot. In 4.1 uses `enable_services`, in 5.0 supports both `enable_services` and `enable-services`. | `enable_services=ssh,firewalld` (4.1)<br>`enable-services=ssh,docker` (5.0)<br>`enable_services=ssh` (both) | 4.1, 5.0 |
| `disable_services`/`disable-services` | Disables specified systemd services at boot. In 4.1 uses `disable_services`, in 5.0 supports both `disable_services` and `disable-services`. | `disable_services=docker` (4.1)<br>`disable-services=apache2` (5.0)<br>`disable_services=nginx` (both) | 4.1, 5.0 |
| `ssh_key` | Specifies the name of the SSH public key file located in the system folder on the boot media (alongside the `.sb` modules). Defaults to `authorized_keys`. In 5.0 it's always `authorized_keys` | `ssh_key=my_public_keys` | 4.1 |
| `scripts` | Controls execution of scripts in the `minios/scripts` folder. If scripts are present and this option is true (or omitted), they are executed alphabetically in interactive mode on tty2 after reaching the multi-user target (init 3). If the default target is graphical, switch to tty2 manually using <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>. Setting this to `false` prevents script execution. | `scripts=true`<br>`scripts=false` | 4.1 |
| `cloud` | Enables cloud-init mode. | `cloud` | 4.1 |
| `hide_credentials` | Hides login credentials displayed as a hint in the console during startup. | `hide_credentials` | 4.1 |
| `autologin` | Enables or disables automatic login. Enabled by default. | `autologin=true`<br>`autologin=false` | 4.1 |
| `novirtres` | Disables automatic screen resolution changes in virtual machines. The default resolution in virtual machines is 1280x800. (Only applicable in the XFCE environment.) | `novirtres` | 4.1, 5.0 (XFCE only) |
| `virtres` | Sets the screen resolution in virtual machines (width x height). (Only applicable in the XFCE environment.) | `virtres=1920x1080`<br>`virtres=1024x768` | 4.1, 5.0 (XFCE only) |
| `root_password` | Sets the root user password. | `root_password=toor` | 4.1 |
| `user_name` | Sets the user name. Currently, only `root` or `live` are supported. If set to `root`, no user profile is created and `user_password` is ignored. | `user_name=live` | 4.1 |
| `user_password` | Sets the user password. | `user_password=evil` | 4.1 |
| `host_name` | Sets the system hostname. | `host_name=minios` | 4.1 |
| `components` | Specifies which live-config components to run. | `components=hostname,user-setup,sudo` | 5.0 |
| `nocomponents` | Specifies which live-config components NOT to run. | `nocomponents=anacron,apport` | 5.0 |
| `hostname` | Sets the system hostname. | `hostname=minios` | 5.0 |
| `username` | Sets the username for autologin. | `username=live` | 5.0 |
| `user-default-groups` | Sets default groups for the user. | `user-default-groups=audio,cdrom,video` | 5.0 |
| `user-fullname` | Sets the full name of the user. | `user-fullname="MiniOS Live User"` | 5.0 |
| `root-password` | Sets the root password in plain text. | `root-password=toor` | 5.0 |
| `root-password-crypted` | Sets the root password in crypted form. | `root-password-crypted=$y$j9T$...` | 5.0 |
| `user-password` | Sets the user password in plain text. | `user-password=live` | 5.0 |
| `user-password-crypted` | Sets the user password in crypted form. | `user-password-crypted=$y$j9T$...` | 5.0 |
| `locales` | Sets the system locale. | `locales=en_US.UTF-8` | 4.1, 5.0 |
| `timezone` | Sets the system timezone. | `timezone=Europe/Berlin` | 4.1, 5.0 |
| `keyboard-model` | Sets the keyboard model. | `keyboard-model=pc105` | 4.1, 5.0 |
| `keyboard-layouts` | Sets the keyboard layouts (comma-separated). | `keyboard-layouts=us,de` | 4.1, 5.0 |
| `keyboard-variants` | Sets the keyboard variants (comma-separated). | `keyboard-variants=,dvorak` | 4.1, 5.0 |
| `keyboard-options` | Sets keyboard options. | `keyboard-options=grp:alt_shift_toggle` | 4.1, 5.0 |
| `noroot` | Disables sudo and policykit privileges. | `noroot` | 5.0 |
| `noautologin` | Disables both console and graphical autologin. | `noautologin` | 5.0 |
| `nottyautologin` | Disables console autologin only. | `nottyautologin` | 5.0 |
| `nox11autologin` | Disables graphical autologin only. | `nox11autologin` | 5.0 |
| `xorg-driver` | Sets the xorg driver instead of autodetecting. | `xorg-driver=nouveau` | 5.0 |
| `xorg-resolution` | Sets the xorg resolution instead of autodetecting. | `xorg-resolution=1920x1080` | 5.0 |
| `module-mode` | Sets the live configuration module mode. When set to "merged", dynamically integrates configuration changes. | `module-mode=merged` | 5.0 |
| `hooks` | Executes arbitrary files from filesystem, medium, or URLs. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` | 5.0 |

Separate commands with spaces. See the `man bootparam` reference pages for additional kernel parameters common to all Linux distributions.

For detailed information about live-config parameters, see [live-config](./live-config.md).