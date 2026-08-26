# Troubleshooting

Start with observation and reversible tests. Do not repartition, reformat,
repair a filesystem, delete a session, or overwrite boot files until important
data is backed up and the failing device has been identified by model, size,
filesystem, and mount point.

Use [Backup and recovery](/administration/Backup-Recovery.md) before destructive
work and [Boot recovery](/administration/Boot-Recovery.md) when the firmware,
bootloader, kernel, or installed boot files are involved.

## Initial checks

1. Verify the downloaded ISO using
   [Verifying downloads](/installation/Verifying-Downloads.md).
2. Test a fresh boot without persistence. This separates base-system and
   hardware problems from a damaged or incompatible session.
3. Try another USB port and, when possible, another known-good device.
4. Record the exact boot-menu entry, any parameters added, and the first error
   rather than only the final failure.
5. Check [Hardware compatibility](/installation/Hardware-Compatibility.md) and
   the guide for the tool used to write the device.

## Boot problems

If the device does not appear in the firmware boot menu, check whether it was
written for UEFI, legacy BIOS, or both. Disable firmware fast boot temporarily,
try the firmware's one-time boot menu, and test another port before rewriting
the device. Do not change the internal disk's partition table to diagnose a USB
boot problem.

If the MiniOS boot menu appears but startup fails:

- Boot a fresh session without `perch`, `perchdir`, or `perchmode`.
- Remove optional parameters and module filters.
- Confirm the ISO and written media are not corrupt.
- Capture the full error. The `debug` and `timing` parameters add boot output;
  `rd.break` opens an initramfs shell for advanced diagnosis.
- If MiniOS data cannot be found, check the `from` value and device path against
  [Boot parameters](/configuration/Boot-Parameters.md).

For PXE or HTTP ISO startup, use the focused
[Network boot](/installation/Network-Boot.md) guide. Early boot networking is
separate from NetworkManager in the running session.

### MiniOS source failures

Use [Initrd system discovery](/configuration/Initrd-System-Discovery.md) for the
full source precedence and path rules. The details most useful during diagnosis
are:

- A literal `from=http://...` wins over `ip=`; `ip=` then supplies static HTTP
  ISO addressing. Otherwise, any nonempty `ip=` selects PXE. Neither network
  path falls back to local media.
- Local discovery makes 45 passes and tests block-device names in sorted order.
  It retains the first device containing a qualifying source, not necessarily
  the intended device or a complete module set.
- `/dev/disk/by-label/LABEL/path` is supported in `from=`. UUID, PARTUUID, and
  by-id paths are not supported by this parser.
- The exact custom-path syntax for the selector uses colons, for example
  `from=askdisk:custom:dir`. Slash syntax silently tests the default `minios`
  path instead.
- If discovery enters the fatal initramfs shell, exiting does not repair the
  source or provide a fallback. It can only let boot continue into a later,
  less clear failure.

At an initramfs shell, start with read-only inspection:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Record the first source, mount, or download error. Do not run filesystem repair
or remove media while it is mounted.

### Module and root failures

Use [Initrd module loading](/configuration/Initrd-Module-Loading.md) for the
selection, ordering, and union rules. Check these common causes first:

- `load=` and `noload=` are regular-expression filters. There is no protected
  core or kernel set, so a filter can exclude `00-core` or the running kernel's
  `01-kernel` module; `noload=` wins when both filters match.
- Module paths are flattened to their basename. Two candidates with the same
  basename occupy one replacement slot, so a later source tier can replace the
  earlier candidate rather than add another layer.
- A `.sb` suffix does not prove that a candidate is a valid SquashFS image.
  Individual loop or module mount failures may allow boot to continue with a
  missing layer. Capture the first mount error.
- `toram=full` and `toram=trim` do not preflight available RAM. Copy or detach
  failures can leave the original source mounted, so do not unplug media or
  drop an HTTP connection merely because `toram` was specified.

After a successful handoff, these commands inspect state without changing it:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

For writable-layer selection and failures, see
[Initrd persistence](/configuration/Initrd-Persistence.md). Persistence can
fall back to a temporary RAM upper after some activation failures, while failure
to construct the root union enters the fatal initramfs shell.

## Display problems

For a black screen, unreadable resolution, or a display-manager loop:

1. Try the `text` boot parameter. If a console starts, the base system booted
   and the fault is likely in graphics, X11, or the display manager.
2. Remove a manually specified `xorg-driver` or `xorg-resolution` parameter.
3. Test a fresh session to exclude persistent display configuration.
4. Record the GPU and loaded driver with `lspci -nnk`.
5. Inspect current-boot errors with `journalctl -b -p warning` and
   `dmesg --level=err,warn`.

Virtual-machine resolution controls documented as `virtres` and `novirtres`
apply only to the Xfce environment. See
[Virtualization](/administration/Virtualization.md) for guest-specific setup.

## Network problems

For normal wired and Wi-Fi setup, persistence, and NetworkManager commands, see
[Network configuration](/configuration/Network-Configuration.md).

Determine whether the interface exists before changing configuration:

```bash
ip link
ip address
ip route
```

For the normal running session, inspect NetworkManager when it is present:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- If no interface appears, record `lspci -nnk` or `lsusb` output and check for
  missing firmware in `dmesg`.
- If the interface exists but has no address, test DHCP before entering static
  values.
- If an address exists, test the gateway, then an IP address, then a DNS name to
  distinguish link, routing, and DNS failures.
- The installer configures wired DHCP or static IPv4. It leaves existing Wi-Fi
  profiles unchanged.
- The `ip=` boot parameter configures early PXE download, not persistent session
  networking. See [Network boot](/installation/Network-Boot.md).

## Persistence problems

First boot without persistence and make a complete copy of the `minios/changes`
directory. Do not run repair tools against the only copy or against an active
session.

Check the session state with:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Common causes include booting the fresh entry, using an ISO-writing method that
never configured persistence, insufficient free space, selecting a session from
a different edition or version, filesystem incompatibility, and an unclean
shutdown. See [Session management](/configuration/Session-Management.md).

If MiniOS creates empty sessions repeatedly, cannot resume DynFileFS, or reports
container errors, follow [DynFileFS and dynblk recovery](/configuration/DynFileFS-Recovery.md).
That guide begins with a full copy and read-only checks. LUKS sessions also
require the correct passphrase and an initrd with LUKS persistence support.

## Storage and space problems

Identify devices and mounts without changing them:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Confirm device model and size before any operation. A full filesystem can cause
failed updates, incomplete session writes, and boot-time recovery. Free space by
moving or deleting known user data only after making a backup; do not manually
delete numbered persistence directories while one is active. Use Session
Manager or `minios-session` for session operations.

Filesystem repair is a later step. Unmount the filesystem first, work on a copy
where practical, and use the filesystem-specific check tool. Never format a
device as a diagnostic test.

## Collect logs

Record the MiniOS edition and version, boot method, persistence mode, hardware,
and steps needed to reproduce the problem. Useful commands include:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Remove passwords, private keys, wireless credentials, public IP addresses, and
other sensitive data before sharing logs. `journalctl -b -1` can show the
previous boot when the journal is persistent.

For repeat boot failures on writable MiniOS media, set `EXPORT_LOGS=true` in
the configuration file. MiniOS copies its boot logs to a timestamped directory
under `minios/log/` when the
media is writable. See [Configuration file](/configuration/Configuration-File.md).

When reporting a reproducible defect, attach the relevant excerpts and open an
issue in the [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
