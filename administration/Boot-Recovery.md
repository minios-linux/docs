# Boot recovery

Boot repair depends on how MiniOS was placed on the device and whether the
firmware starts it in BIOS or UEFI mode. A procedure for one layout can damage
another. Back up important files before writing a boot sector, changing a
partition flag, replacing an EFI tree, or reinstalling GRUB. See
[Backup and recovery](/administration/Backup-Recovery.md).

## Identify the layout

- **Raw-written ISO:** `dd`, Etcher, Rufus in DD mode, or a similar image writer
  copied the ISO block layout to the whole device. Treat this as image media,
  not as a normal file-based installation.
- **File-based live installation:** the device has a normal filesystem with a
  `minios/` directory containing SquashFS modules and `minios/boot/`. This
  includes the legacy copied-file method and live deployments made by MiniOS
  Installer.
- **Native installation:** MiniOS Installer expanded the modules into a
  conventional Linux root filesystem. It uses the installed system's GRUB and
  initramfs rather than the modular live boot layout.

`Ventoy` normally keeps the ISO as a file under its own bootloader. Repair it
with the procedure in the `Ventoy` documentation; do not install the MiniOS
Syslinux boot sector over it.

## Diagnose without changing the disk

First confirm whether the failure occurs before the MiniOS menu, after the menu,
or after the kernel starts. Check the firmware's one-time boot menu and record
whether the selected entry is UEFI or legacy BIOS. Test another port and, when
possible, boot the same device on another computer.

From working Linux rescue media, inspect rather than repair:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

On a system booted in UEFI mode, `sudo efibootmgr -v` can list firmware entries.
Its absence or an error does not prove that the EFI files are missing. Do not
format, repartition, run a filesystem repair, or change flags merely as a test.
Confirm every device by model and capacity and mount filesystems read-only when
only inspecting them.

If the boot menu appears but MiniOS cannot find its modules, edit the boot entry
temporarily and try `from=askdisk`. Once the correct filesystem is known, a
filesystem label is more stable than a name such as `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

The label must exist and identify the intended filesystem; labels should be
unique. Add `debug timing` for more early-boot output. Add `rd.break` only when
an initramfs shell is needed for advanced inspection. These options diagnose
module discovery; they do not repair the bootloader. See
[Boot parameters](/configuration/Boot-Parameters.md) and
[Troubleshooting](/administration/Troubleshooting.md).

## Raw-written ISO media

Do not run `bootinst.sh`, install GRUB, or copy individual boot files onto a
raw-written ISO device. Its partition map, boot records, ISO files, and EFI
files form one image. If the verified ISO boots elsewhere but this copy does
not, preserve any data that is stored outside the image layout and rewrite the
whole device from a verified ISO. See
[Verifying downloads](/installation/Verifying-Downloads.md) and
[Installing MiniOS](/installation/Installing-MiniOS.md).

If rewriting the same verified image still fails, test another device and check
firmware and hardware compatibility rather than repeatedly modifying the image.

## File-based live installations

### Bundled installer on MBR media

The bundled installer is only suitable when all of these conditions are true:

- The device is a file-based live installation on an MBR-partitioned disk.
- The complete `minios/boot/syslinux/` directory is intact and belongs to the
  same MiniOS tree and release as the other boot assets.
- The mounted filesystem and its parent whole-disk device have been identified
  without guessing.

Run the script from that directory on the target filesystem:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

The script derives its target from the filesystem containing the script. It
installs Syslinux there, writes 440 bytes of MBR boot code to the parent disk,
may change the active partition flag, and copies the bundled UEFI loader tree to
the target filesystem. A wrong mount or device can make another system
unbootable. Do not use it on a GPT disk or shared EFI System Partition, do not
copy only `bootinst.sh` to a damaged tree and run it, and do not use assets from
a different MiniOS release.

On Windows, the matching path is:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Run it as administrator only from the intended removable device. The script
refuses the detected Windows system disk, but that check is not a substitute
for verifying the drive letter and physical device.

### UEFI

UEFI boot does not use the BIOS MBR code. The firmware needs a readable EFI
System Partition or FAT filesystem and a valid loader tree. Restore only a
complete, matching `EFI/boot` tree and its related MiniOS EFI files from the
exact image or backup used for that installation. Do not combine one release's
EFI executables with another release's GRUB configuration or `minios/boot`
files.

The bundled `bootinst.sh` also copies its matching UEFI loader tree, but it
still performs the MBR and Syslinux writes described above. Use it only for the
file-based MBR layout covered by the preceding section, not as a generic UEFI
repair tool.

Copying one `.efi` file may leave an incomplete loader chain. If the exact,
complete EFI tree is unavailable, reinstall the file-based live layout instead
of attempting a partial reconstruction. Preserve unrelated vendor and operating
system directories on a shared EFI System Partition.

`minios-deploy` provides `plan` and `install` operations, not a boot-repair
operation. Do not point an install command at an existing disk as a repair
attempt. See [MiniOS Installer](/installation/MiniOS-Installer.md) for supported
installation layouts.

## Native installations

### BIOS GRUB from a chroot

Use this procedure only for a native installation that was installed for legacy
BIOS on an MBR disk. It writes GRUB to a whole disk and can replace boot code
used by other operating systems. Do not use it for UEFI, GPT, a file-based live
layout, or a raw-written ISO.

Boot trusted Linux rescue media, identify the native root partition and its
parent disk, then substitute their real paths below. In this example only,
`/dev/sdXN` is the root partition and `/dev/sdX` is its parent whole disk. Never
pass a partition such as `/dev/sdX1` to the final `grub-install` command.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Mount a separate native `/boot` partition at `/mnt/boot` before the bind mounts,
then unmount it before the final `sudo umount /mnt`. Do not mount an EFI System
Partition for this BIOS-only procedure. If the root uses LUKS, LVM, RAID, or a
layout that is not fully understood, stop and use a recovery method specific to
that storage stack. If `update-grub`,
`grub-script-check`, or `grub-install` fails, do not continue by changing the
partition table or trying other disks.

### Native UEFI

Manual native UEFI reconstruction is unsafe to generalize. It depends on the
exact EFI architecture, loader chain, package state, mount layout, Secure Boot
state, firmware behavior, and whether the EFI System Partition is shared. A
generic file copy or `grub-install` command can overwrite another operating
system's fallback loader.

Prefer restoring an exact, tested backup of the native root, EFI System
Partition content, and boot configuration. Otherwise back up user data and
reinstall the native system with MiniOS Installer. Do not adapt the file-based
live `EFI/boot` copy procedure to a native installation.

## Modular kernel rollback

For a file-based live installation that stopped booting after a kernel change,
use rescue media from the same MiniOS release and architecture. At its boot
menu, use `from=askdisk` or a stable label path to select the installed
`minios/` tree. If that combination reaches a working system and the installed
tree is writable, inspect the coordinated kernel sets and activate a known
working one:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

Activation must restore a coordinated kernel module, kernel image, initramfs,
and bootloader configuration. Do not replace only `vmlinuz`, only the initramfs,
or only `01-kernel*.sb`. Keep the previous packaged kernel until the replacement
has booted successfully. See
[Kernel management](/administration/Kernel-Management.md).

This rollback is for modular live installations. Native installations use their
installed kernel packages and GRUB and need native recovery or reinstallation.

## When to reinstall

Back up recoverable data and reinstall instead of repairing when any of these
conditions applies:

- A raw-written ISO is corrupt or has been modified piecemeal.
- Matching Syslinux, GRUB, kernel, initramfs, or complete EFI assets are not
  available.
- The partition table, filesystem, or EFI System Partition is damaged in
  addition to the bootloader.
- The target disk or parent device cannot be identified with certainty.
- A native UEFI loader chain would have to be reconstructed without an exact
  backup.
- Repeated read errors, disconnects, or SMART errors indicate failing media.
- A repair command fails and the next step would require guessing or overwriting
  unrelated boot data.

Reinstallation restores a known coordinated boot layout; it does not recover
unbacked-up user data or persistence. Copy important data first whenever the
filesystem remains readable.
