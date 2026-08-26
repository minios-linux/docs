# Original installation method (Windows/Linux, legacy)

This legacy MiniOS installation method involves copying system files directly to the drive and installing the bootloader. Prefer a current method from [Installing MiniOS](/installation/Installing-MiniOS.md) unless a file-based layout is specifically required.

**Note:** This method only works on Windows and Linux due to the use of the SYSLINUX bootloader.


## Important

**Warning:** Incorrect device selection will result in data loss. Always double-check the selected drive and back up important data.


## Drive requirements

### Drive size
See [Hardware compatibility guide](/installation/Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

### Technical requirements
- **File systems**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partition scheme**: MBR
- **EFI booting**: When using NTFS, exFAT, or ext2/3/4 file systems, EFI mode booting may be unavailable. For EFI support, FAT32 is recommended.

## Creating a bootable USB drive

### Step 1: Prepare the drive

**Windows:**
1. Open "Disk Management" (`Win+R`, then `diskmgmt.msc`)
2. Find the USB drive, right-click, and select "Delete Volume"
3. Right-click on unallocated space and select "New Simple Volume"
4. Choose file system: FAT32 (recommended) or NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Step 2: Extract and copy files

**Mounting ISO:**

*Windows:*
- Right-click the ISO file and select "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copying Files:**
1. **Find the `/minios/` folder** in the mounted ISO
2. **Copy the entire `/minios/` folder** to the root of the USB drive

### Step 3: Install the bootloader

Navigate to the `/minios/boot/syslinux/` folder on the drive and run the installer:

**Windows:**
- Run `bootinst.bat` **as administrator**

**Linux:**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Replace `MINIOS` with the exact mount directory verified with `lsblk`. Do not
use a wildcard: the script derives the target disk from its own location and
writes boot code to that disk.

## Automatic change persistence

On first boot, MiniOS will check the drive's file system type and attempt to use the optimal change persistence mode:

- **ext2/3/4, Btrfs**: attempts to use `native` mode (direct saving)
- **FAT32/NTFS**: uses `dynfilefs` mode (dynamic file)
- When native mode is unavailable, automatically switches to dynfilefs

### Parameter configuration for advanced users

When precise persistence configuration is needed, boot parameters can be used:

- `perchmode=native` - Direct saving to partition (for ext4)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file
- `perchsize=8000` - Data storage space size in MB

Details in [boot parameters](/configuration/Boot-Parameters.md).
