# Original installation method (Windows/Linux, legacy)

This legacy MiniOS installation method involves copying system files directly to the drive and installing the bootloader. Prefer a current method from [Installing MiniOS](/installation/Installing-MiniOS.md) unless a file-based layout is specifically required.

**Note:** This method only works on Windows and Linux due to the use of the SYSLINUX bootloader.


## Important

**Warning:** This procedure repartitions and formats the selected device. It is destructive to the whole device, not just the files currently visible on it. Back up important data and verify the exact device path, model, capacity, partition, and mount point before running `fdisk`, `mkfs`, or `bootinst`. Disconnect other removable drives when possible.


## Drive requirements

### Drive size
See [Hardware compatibility guide](/installation/Hardware-Compatibility.md) for detailed system requirements and drive sizes.

### Technical requirements
- **File systems**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partition scheme**: MBR
- **EFI booting**: When using NTFS, exFAT, or ext2/3/4 file systems, EFI mode booting may be unavailable. For EFI support, FAT32 is recommended.

## Creating a bootable USB drive

### Step 1: Prepare the drive

**Windows:**
1. Open "Disk Management" (`Win+R`, then `diskmgmt.msc`)
2. Verify the USB device by its disk number, model, and capacity. Do not continue if any detail is uncertain.
3. Right-click its volume and select "Delete Volume"
4. Right-click on unallocated space and select "New Simple Volume"
5. Choose file system: FAT32 (recommended) or NTFS

**Linux:**

Set `TARGET_DISK` and `TARGET_PARTITION` to exact paths only after matching the device model and capacity in `lsblk`. The `fdisk` write replaces the partition table on the entire target disk. Run only one `mkfs` command for the filesystem you want.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Step 2: Extract and copy files

**Mounting ISO:**

*Windows:*
- Right-click the ISO file and select "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Copying Files:**
1. **Find the `/minios/` folder** in the mounted ISO
2. **Copy the entire `/minios/` folder** to the root of the USB drive

On Linux, the target root in the example above is `/mnt/minios-target`. Confirm that `findmnt --mountpoint /mnt/minios-target` reports the exact partition selected in Step 1 before copying files.

### Step 3: Install the bootloader

Navigate to the `/minios/boot/syslinux/` folder on the drive and run the installer:

`bootinst` writes boot code to the disk derived from the installer's location. Read [Boot recovery](/administration/Boot-Recovery.md) before changing boot code, and do not run the installer until its device and mount point have been verified.

**Windows:**
- Open the verified USB drive by its exact drive letter, navigate to `minios\boot\syslinux`, and run `bootinst.bat` **as administrator**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Do not substitute a wildcard for the mount point. The script derives the target disk from its own location and writes boot code to that disk.

## Result and persistence

This procedure creates a file-based live installation by placing the `minios/` tree and bootloader on a normal filesystem. It is not a raw ISO write, an ISO-file multiboot setup, or a MiniOS Installer deployment.

The chosen filesystem affects which persistence backends can work, but it does not enable persistence or guarantee that a session will be created. Persistence is enabled only when a boot entry or kernel command line requests it, and activation still requires suitable writable storage. See [Boot modes](/configuration/Boot-Modes.md) and [Initrd persistence](/configuration/Initrd-Persistence.md) before relying on saved changes.
