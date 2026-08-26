---
updated: 2026-08-26
---

# Using Ventoy


Ventoy is a popular tool for creating bootable USB drives that allows you to store multiple ISO files on one device and boot from any of them.


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.

**Boot Mode Requirement:** For MiniOS to work properly with Ventoy, you MUST select **GRUB2 mode** when booting, or rename your ISO file with `VTGRUB2` suffix (e.g., `minios-standard-amd64_VTGRUB2.iso`) to force GRUB2 mode automatically.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](/installation/Hardware-Compatibility.md) for detailed system requirements and drive sizes.

## Installing Ventoy

### Method 1: Standard Installation

1. **Download Ventoy** from the [official website](https://www.ventoy.net/)
2. **Run the Ventoy installer** and select your USB drive
3. **Install Ventoy** on the drive (all data will be deleted)
4. **Copy the MiniOS ISO file** to the root folder of the USB drive

This creates ISO-file multiboot media: Ventoy keeps the ISO as a file on its data partition and presents it at boot. It is not a raw MiniOS image write or a MiniOS Installer deployment.

### Method 2: Installation with Separate Data Partition (Recommended)

1. **Download Ventoy** from the [official website](https://www.ventoy.net/)
2. **Run the Ventoy installer** and select your USB drive
3. **Enable the "Reserve Space" option** during installation to create an additional partition
4. **Install Ventoy** on the drive
5. **Copy the MiniOS ISO file** to the root folder of the USB drive
6. **Create an ext4 partition** in the reserved space with the label `persistence`

This supplies a possible persistence location, but creating the partition alone does not enable persistence or create a session.


## Integration with MiniOS

MiniOS includes support for discovering an ISO presented by Ventoy. Source discovery and persistence selection are separate; Ventoy does not itself enable MiniOS persistence.

### Persistence

Persistence is enabled only when a boot entry or kernel command line requests it. Activation then depends on a compatible writable location and a usable session; a standard Ventoy installation does not guarantee that either will be created automatically. See [Boot modes](/configuration/Boot-Modes.md) and [Initrd persistence](/configuration/Initrd-Persistence.md) before relying on saved changes.


## Using MiniOS with Ventoy

### Booting

After installing Ventoy and copying the MiniOS ISO file to the drive:

1. **Boot from the USB drive** - select it in BIOS/UEFI
2. **Select MiniOS** from the list of available ISO files in the Ventoy menu
3. **IMPORTANT: Select GRUB2 mode** when prompted by Ventoy
4. **Wait for MiniOS to load**

### **Ventoy Boot Mode Requirements**

**For MiniOS to work properly:**
- **GRUB2 mode** - Required for correct MiniOS operation

**Alternative Solution:**
- Add suffix `VTGRUB2` to the ISO filename (e.g., `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- This forces Ventoy to automatically use GRUB2 mode without prompting
