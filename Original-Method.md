# Original Installation Method (Windows/Linux)

The original MiniOS installation method involves copying system files directly to the drive and installing the bootloader. This method provides maximum configuration flexibility and compatibility with various media types.

⚠️ **Note**: This method only works on Windows and Linux due to the use of the SYSLINUX bootloader.


## Important

⚠️ **Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](Hardware-Compatibility.md#system-requirements) for detailed system requirements and drive sizes.

### Technical Requirements
- **File systems**: FAT32, NTFS, ext2/3/4, Btrfs
- **Partition scheme**: MBR
- ⚠️ **EFI booting**: When using NTFS, exFAT, or ext2/3/4 file systems, EFI mode booting may be unavailable. For EFI support, FAT32 is recommended.

## Creating Bootable USB Drive

### Step 1: Prepare the Drive

**Windows:**
1. Open "Disk Management" (`Win+R` → `diskmgmt.msc`)
2. Find the USB drive → right-click → "Delete Volume"
3. Right-click on unallocated space → "New Simple Volume"
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

### Step 2: Extract and Copy Files

**Mounting ISO:**

*Windows:*
- Right-click the ISO file → "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Copying Files:**
1. **Find the `/minios/` folder** in the mounted ISO
2. **Copy the entire `/minios/` folder** to the root of the USB drive

### Step 3: Install Bootloader

Navigate to the `/minios/boot/` folder on the drive and run the installer:

**Windows:**
- Run `bootinst.bat` **as administrator**

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Automatic Change Persistence

On first boot, MiniOS will check the drive's file system type and attempt to use the optimal change persistence mode:

- **ext2/3/4, Btrfs**: attempts to use `native` mode (direct saving)
- **FAT32/NTFS**: uses `dynfilefs` mode (dynamic file)
- When native mode is unavailable, automatically switches to dynfilefs

### Parameter Configuration (for Advanced Users)

When precise persistence configuration is needed, boot parameters can be used:

- `perchmode=native` - Direct saving to partition (for ext4)
- `perchmode=dynfilefs` - Dynamically expandable file
- `perchmode=raw` - Fixed-size file  
- `perchsize=8000` - Data storage space size in MB

Details in [boot parameters](Boot-Parameters.md).