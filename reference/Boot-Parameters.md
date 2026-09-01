---
updated: 2026-08-26
---
# Boot parameters


## How to use boot parameters
Boot parameters customize how MiniOS starts. Separate parameters with spaces on the kernel command line.

### Syslinux
- Press <kbd>Esc</kbd> during the MiniOS boot sequence to access the boot menu.
- Press <kbd>Tab</kbd> to edit the boot options.
- Enter the parameters and press <kbd>Enter</kbd> to boot.

### GRUB
- Press <kbd>E</kbd> at the GRUB menu.
- Edit the boot parameters at the end of the command line.
- Press <kbd>F10</kbd> to boot with the new settings.

## Boot parameters
The application column distinguishes parameters normally accepted on every boot from account settings intended for initial setup. With persistence, live-config components normally run only once; see [live-config](/reference/configuration/live-config).

This table is a quick reference. Source precedence and accepted `from=` forms are defined in [Initrd system discovery](/reference/boot-process/System-Discovery), module filtering in [Initrd module loading](/reference/boot-process/Module-Loading), persistence selection in [Initrd persistence](/reference/boot-process/Persistence-Internals), and supported combinations in [Boot modes](/using-minios/Boot-Modes).

| Parameter | Application | Description | Example |
|---|---|---|---|
| `from` | Every boot | Loads MiniOS data from a directory, supported device path, or ISO. UUID, PARTUUID, and by-id device forms are not parsed. A literal **`http://` only** URL takes precedence over `ip=` and starts [network boot](/reference/boot-process/Network-Boot) through httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Every boot | Keeps `.sb` candidates whose path matches an unanchored extended regular expression; commas become alternation, and a whole ascending numeric range has special expansion. Also filters `toram=trim`. It can exclude core or kernel modules and make the system unbootable. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Every boot | Excludes candidates whose path matches an unanchored extended regular expression, including from `toram=trim`; it is applied after `load` and can exclude core or kernel modules. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Every boot | Sets the bundle extension. Default: `sb`. Kernel coordination still uses literal `.sb` names, so a custom extension cannot coordinate the `01-kernel` module. | `bext=mymod` |
| `timing` | Every boot | Enables startup timing output. | `timing` |
| `union` | Every boot | Selects the union filesystem. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Every boot | Static address for early network fetch. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (default PXE HTTP port **7529**). A literal `from=http://...` wins over `ip=` and uses its addressing fields; otherwise any non-empty `ip=` forces PXE data download and skips local media. This is not session NetworkManager configuration. See [Network boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Every boot | httpfs cache size in MiB for HTTP ISO network boot (`from=http://…`). See [Network boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Every boot | Opens a debug shell at the end of the initramfs stage. | `rd.break` |
| `perchdir` | Every boot | Selects a numbered persistence session or an action: `resume`, `new`, or `ask`. A nonexistent numeric selector can fall back to the metadata default; it does not reserve or create that number. A device/path or `askdisk` form selects another persistence location. Use a colon-delimited suffix for a custom path. Without a persistence parameter, MiniOS starts cleanly. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Every boot | Container size for `dynfilefs`, `raw`, and `luks`; it does not apply to `native` or `squashfs`. A bare number or `M`/`MB` value is allocated in MiB; `G`/`GB` and `T`/`TB` are converted to 1000 and 1,000,000 MiB. The limit is 1,000,000 MiB, further capped by available space after `perchreserve`. MiniOS Session Manager caps raw and LUKS files at 4000 MiB on FAT32; initrd LUKS applies that cap, but an oversized initrd raw request can fail instead of being reduced. New raw and LUKS containers default to 4000 MiB. Initramfs-created DynFileFS defaults to available capacity rounded down to 1000 MiB; MiniOS Session Manager defaults it to 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Every boot | Allocation margin and low-space warning threshold in MiB. It is subtracted when sizing new or growing containers, but it is not a runtime quota and does not prevent later writes from filling the device. Default: 256; maximum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Every boot | Persistence storage mode.<br>`native` (default): a directory on a writable POSIX filesystem.<br>`dynfilefs`: an expandable container, including on FAT32, NTFS, or exFAT.<br>`raw`: a fixed-size ext4 image.<br>`luks`: a LUKS2-encrypted ext4 container; creation and unlock prompt on the console and require crypt support in the initramfs.<br>`squashfs`: an existing compressed snapshot unpacked for the session. MiniOS Session Manager can create and save SquashFS snapshots from the running system; the initramfs can resume but cannot create them. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Every boot | Enables the legacy persistence resume path. Unlike `perchdir=resume`, it does not automatically create a compatible replacement when no usable default session exists. | `perch` |
| `toram` | Every boot | Bare `toram` is `full`. With persistence, full's top-level `*` copy omits dotfiles; without persistence it omits `changes` but copies other top-level entries, including dotfiles. Trim copies required `config.conf`, regular-file `authorized_keys`, selected top-level and recursive modules, and the complete `changes/` tree when persistence is requested; it omits `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, other nonmodule data, and the separate persistence-module tier. Neither mode checks RAM capacity first. A persistence store copied to RAM is non-durable, and changes are not copied back. Remove media only after confirming that the source, loops, and mappings detached successfully. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Every boot | Starts in text console mode. | `text` |
| `automount` | Every boot | Enables automatic mounting of storage devices. | `automount` |
| `debug` | Every boot | Enables additional startup diagnostics. | `debug` |
| `nozram` | Every boot | Disables zram swap. | `nozram` |
| `zramsize` | Every boot | Sets the zram swap size in MiB. If omitted, MiniOS calculates it from total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Every boot | Selects `lzo`, `lzo-rle`, `lz4`, `lz4hc`, or `zstd`; availability depends on the running kernel. If omitted, the kernel default is retained. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Every boot | Sets the default systemd target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Every boot | Enables specified systemd services at boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Every boot | Disables specified systemd services at boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Every boot | Disables automatic screen resolution changes in virtual machines. The XFCE default is 1280x800. | `novirtres` |
| `virtres` | Every boot | Sets the XFCE screen resolution in virtual machines. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Every boot | Runs only the listed live-config components, in component order. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Every boot | Runs all live-config components except those listed. | `nocomponents=anacron,apport` |
| `hostname` | Every boot | Sets the system hostname. | `hostname=minios` |
| `username` | Initial setup | Sets the username created for autologin. | `username=live` |
| `user-default-groups` | Initial setup | Sets the created user's default groups. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Initial setup | Sets the created user's full name. | `user-fullname="MiniOS Live User"` |
| `root-password` | Initial setup | Sets the root password in plain text. | `root-password=toor` |
| `root-password-crypted` | Initial setup | Sets the root password as a crypt hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Initial setup | Sets the user password in plain text. | `user-password=live` |
| `user-password-crypted` | Initial setup | Sets the user password as a crypt hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Every boot | Sets one or more system locales. | `locales=en_US.UTF-8` |
| `timezone` | Every boot | Sets the system timezone. | `timezone=Europe/Berlin` |
| `keyboard-model` | Every boot | Sets the keyboard model. | `keyboard-model=pc105` |
| `keyboard-layouts` | Every boot | Sets comma-separated keyboard layouts. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Every boot | Sets comma-separated keyboard variants corresponding to the layouts. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Every boot | Sets keyboard options. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Initial setup | Prevents live-config from granting sudo and policykit privileges. | `noroot` |
| `noautologin` | Every boot | Prevents live-config from setting up console and graphical autologin; existing persistent configuration is not removed. | `noautologin` |
| `nottyautologin` | Every boot | Prevents setup of console autologin only; existing persistent configuration is not removed. | `nottyautologin` |
| `nox11autologin` | Every boot | Prevents setup of graphical autologin only; existing persistent configuration is not removed. | `nox11autologin` |
| `xorg-driver` | Every boot | Selects an Xorg driver instead of autodetection. | `xorg-driver=nouveau` |
| `xorg-resolution` | Every boot | Sets the Xorg resolution instead of autodetection. | `xorg-resolution=1920x1080` |
| `module-mode` | Every boot | With `merged`, integrates configuration changes into the running live system. | `module-mode=merged` |
| `hooks` | Every boot | Fetches and executes hooks from the filesystem, live medium, or wget-supported URLs. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Security considerations

The kernel command line is plaintext and is normally visible in bootloader configuration, `/proc/cmdline`, and diagnostics. Do not put reusable secrets in `root-password=` or `user-password=`. Prefer the corresponding `*-crypted` parameters, while still treating exposed password hashes as sensitive.

Hooks execute as privileged boot code. An `http://` hook has neither transport encryption nor server authentication, so anyone able to alter the network path can replace it. Use only content and delivery mechanisms you trust; do not use an unauthenticated HTTP hook for security-sensitive startup.

Separate commands with spaces. See the `man bootparam` reference pages for additional kernel parameters common to all Linux distributions.

For detailed information about live-config parameters, see [live-config](/reference/configuration/live-config).

For loading MiniOS over the network (PXE and HTTP ISO), see [Network boot](/reference/boot-process/Network-Boot).
