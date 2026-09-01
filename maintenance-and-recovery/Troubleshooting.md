---
updated: 2026-08-31
---
# Troubleshooting

Start with observation and reversible tests. Do not repartition, format, repair a filesystem, delete a session, or replace boot files merely to see whether it helps. Preserve important data first.

## First checks

1. [Verify the downloaded image](/installing-minios/Verifying-Downloads).
2. Boot **Start without saving**. If the problem disappears, investigate the persistent session or its configuration rather than the base image.
3. Remove custom boot parameters and module filters unless they are required to reproduce the problem.
4. Try another USB port and, when possible, another known-good device or computer.
5. Record the first error and the exact boot-menu entry instead of only the last message shown on screen.
6. Check [Hardware compatibility](/getting-started/Hardware-Compatibility) when the same verified image fails on one machine but works on another.

## The device does not reach the MiniOS boot menu

First determine how the MiniOS device was created.

- For a raw-written image (`dd`, Etcher, Rufus DD mode, or Drive Utility image writing), do not repair individual boot files. If the copy is damaged, rewrite the complete device from a verified image.
- For a file-based MiniOS installation, recreate the bootable layout using the same documented installation method rather than copying GRUB, Syslinux, or EFI files from another release.
- Ventoy has its own bootloader and layout. Do not install the MiniOS bootloader over a Ventoy device; use the [Ventoy](/installing-minios/installation-tools/Ventoy) procedure instead.
- After native conversion, the target uses a conventional Debian bootloader and filesystem layout. It can retain the MiniOS desktop appearance, but the MiniOS live infrastructure and live-specific tools are no longer present. Back up recoverable data before using the Debian bootloader repair or reinstallation procedure appropriate to its BIOS/UEFI and partition layout.

If a newly recreated device still does not appear in the firmware boot menu, check the firmware mode, Secure Boot support of the selected architecture, USB port/device, and [hardware compatibility](/getting-started/Hardware-Compatibility).

## The MiniOS boot menu appears but startup fails

Remove optional parameters first. Use `debug` and `timing` when more early-boot output is needed. `rd.break` is for advanced initramfs inspection, not repair.

If MiniOS cannot find its source, see [System discovery](/reference/boot-process/System-Discovery). At an initramfs shell, useful read-only information includes:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

A temporary `from=askdisk` can help identify the device that actually contains MiniOS data. After that, use the documented `from=` syntax rather than guessing device names.

For PXE or HTTP ISO startup, see [Network boot](/reference/boot-process/Network-Boot). Early-boot networking is separate from NetworkManager in the running session.

### Module or root-union failures

See [Module loading](/reference/boot-process/Module-Loading) for the actual module selection and ordering rules. In particular:

- `load=` and `noload=` can exclude essential base or kernel modules; `noload=` wins when both match;
- candidates with the same basename occupy the same replacement slot;
- a `.sb` filename does not prove that the file is a valid SquashFS image;
- the running kernel must match the coordinated MiniOS kernel module and boot files.

After a successful boot, inspect the actual state without changing it:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Display problems

For a black screen, unusable resolution, or a display-manager loop:

1. Try the `text` boot parameter. A working console separates a graphics/desktop problem from an earlier boot failure.
2. Remove manually specified `xorg-driver` or `xorg-resolution` parameters.
3. Test **Start without saving** to exclude persistent display configuration.
4. Record the GPU and driver with `lspci -nnk`.
5. Inspect `journalctl -b -p warning` and `dmesg --level=err,warn`.

For virtual machines, see [Virtualization](/maintenance-and-recovery/Virtualization).

## Network problems

Normal wired and Wi-Fi connections are managed through NetworkManager; see [Networking](/using-minios/Networking).

First determine whether the interface exists:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- If no interface exists, record `lspci -nnk` or `lsusb` and look for firmware or driver errors in `dmesg`.
- If the interface exists but has no address, distinguish connection/DHCP issues from missing hardware support.
- If an address exists, test the gateway, then an IP address, then a DNS name to separate link, routing, and DNS failures.
- The boot parameter `ip=` belongs to early network boot and does not configure a persistent NetworkManager connection. See [Network boot](/reference/boot-process/Network-Boot).

## Persistence problems

Boot **Start without saving** before changing a suspect persistence store. Do not repair or delete the only copy of a session while it is active.

Inspect what MiniOS currently sees:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Check the selected boot mode, available writable space, filesystem compatibility, and session compatibility. The detailed selection rules are in [Sessions and persistence](/using-minios/Sessions-and-Persistence) and [Persistence internals](/reference/boot-process/Persistence-Internals).

If an important non-running `native`, `dynfilefs`, `raw`, or `luks` session is still readable, export it **before** experimenting with the storage:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

If Session Manager cannot read or export the session, stop writing to the source and preserve an offline copy of the affected storage before further work. MiniOS does not define a universal manual procedure for rebuilding DynFileFS segments, repairing an inner filesystem, or reconstructing session metadata. Such recovery is filesystem/container-specific and should be attempted only on a copy when the value of the data justifies it.

See [Backing up MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) for supported backup and session-import workflows.

## Storage and free-space problems

Inspect devices and mounts without changing them:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

A full filesystem can cause failed package operations, incomplete session saves, and other secondary errors. Free space by moving or deleting known data only after confirming the correct filesystem. Use MiniOS Session Manager for session deletions instead of removing numbered session directories by hand.

Filesystem repair is not a generic MiniOS operation. If the filesystem itself is damaged, unmount it, preserve important data or an image first, and use a repair procedure appropriate to that filesystem and storage device.

## Package changes and system updates

If problems started after APT package changes, remember that a live persistent session can override files from the read-only MiniOS modules. Test **Start without saving** to compare against the original module set. See [Updating MiniOS](/maintenance-and-recovery/Updating-MiniOS) for the distinction between APT maintenance and changing MiniOS releases.

## Collecting logs

Useful information includes:

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

For repeat boot failures on writable MiniOS media, `EXPORT_LOGS=true` in `config.conf` exports boot logs under `minios/log/`. See [config.conf](/reference/configuration/config.conf).

Remove credentials, private keys, Wi-Fi secrets, and other private information before sharing logs. For a reproducible defect, include the relevant excerpts and open an issue in the [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
