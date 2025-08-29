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

**Legend:**
- 🔒 **One-time only** - Applied only on first boot, cannot be changed on subsequent boots
- 🔄 **Reconfigurable** - Can be changed on every boot and reapplied


| Parameter | Reconfigurable | Description | Example Usage |
|---|---|---|---|
| `from` | 🔄 | Loads MiniOS data from a specified directory, device, or ISO file. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Enables loading of specified `.sb` modules using a regular expression. Works in conjunction with the `toram=trim` command, allowing only selected modules to be loaded into RAM.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Disables loading of specified `.sb` modules using a regular expression. Works together with `toram=trim` command allowing to exclude selected modules from loading into RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `perchdir` | 🔄 | Selects a profile or performs an action with a profile. Accepts the profile number or the keywords `resume` (resume previous session), `new` (start a new session), or `ask` (select session at startup). If omitted, MiniOS starts in "clean" mode. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Sets the size of the DynFileFS virtual file system (in MB), used for storing data on non-Linux file systems (e.g., FAT32, NTFS). Defaults to 16GB. Use this option if your target disk is smaller. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Save mode for persistent changes.<br>`native` (default) - storing data as is on POSIX-compatible file systems;<br>`dynfilefs` - storing data in dynamically expandable image files;<br>`raw` - storing data in a fixed-size image file.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `toram` | 🔄 | Copies the system to RAM. Can take `trim` and `full` values. If specified without parameters, it defaults to `full`.<br>`trim` - only necessary data is copied, considering `load` and `noload` filters. If `perch` parameters are specified, changes are also loaded.<br>`full` - the entire minios folder is loaded, excluding changes unless `perch` is specified. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Disables the X server and starts in text console mode. | `text` |
| `automount` | 🔄 | Enables automatic mounting of storage devices. | `automount` |
| `debug` | 🔄 | Enables debugging output during startup. | `debug` |
| `nozram` | 🔄 | Disables zram swap. | `nozram` |
| `zramsize` | 🔄 | Sets the zram swap size (in MB). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Specifies the zram compression algorithm. Available options for Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Defaults to `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Sets the default systemd target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Enables specified systemd services at boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Disables specified systemd services at boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Disables automatic screen resolution changes in virtual machines. The default resolution in virtual machines is 1280x800. (Only applicable in the XFCE environment.) | `novirtres` |
| `virtres` | 🔄 | Sets the screen resolution in virtual machines (width x height). (Only applicable in the XFCE environment.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Specifies which live-config components to run. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Specifies which live-config components NOT to run. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Sets the system hostname. | `hostname=minios` |
| `username` | 🔒 | Sets the username for autologin. | `username=live` |
| `user-default-groups` | 🔒 | Sets default groups for the user. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Sets the full name of the user. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Sets the root password in plain text. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Sets the root password in crypted form. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Sets the user password in plain text. | `user-password=live` |
| `user-password-crypted` | 🔒 | Sets the user password in crypted form. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Sets the system locale. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Sets the system timezone. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Sets the keyboard model. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Sets the keyboard layouts (comma-separated). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Sets the keyboard variants (comma-separated). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Sets keyboard options. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Disables sudo and policykit privileges. | `noroot` |
| `noautologin` | 🔄 | Disables both console and graphical autologin. | `noautologin` |
| `nottyautologin` | 🔄 | Disables console autologin only. | `nottyautologin` |
| `nox11autologin` | 🔄 | Disables graphical autologin only. | `nox11autologin` |
| `xorg-driver` | 🔄 | Sets the xorg driver instead of autodetecting. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Sets the xorg resolution instead of autodetecting. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Sets the live configuration module mode. When set to "merged", dynamically integrates configuration changes. | `module-mode=merged` |
| `hooks` | 🔄 | Executes arbitrary files from filesystem, medium, or URLs. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Separate commands with spaces. See the `man bootparam` reference pages for additional kernel parameters common to all Linux distributions.

For detailed information about live-config parameters, see [live-config](live-config.md).