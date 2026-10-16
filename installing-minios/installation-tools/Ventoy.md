---
updated: 2026-10-15
---
# Ventoy


Ventoy is a popular tool for creating bootable USB drives that allows you to store multiple ISO files on one device and boot from any of them.


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.

Current MiniOS integration supports Ventoy's **normal mode**, including direct persistence images in BIOS and UEFI. Older MiniOS images may require **GRUB2 mode**; use that mode if the older image cannot discover its source in normal mode. The `VTGRUB2` filename suffix can force GRUB2 mode for such an image. It is not a universal requirement for current images.


## Drive Requirements

### Drive Size
Allow space for the ISO files, other data, and the intended persistence storage. Ventoy's reserved space and persistence-image capacity are separate choices. See [Hardware compatibility](/getting-started/Hardware-Compatibility) for system requirements.

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
3. **Enable the "Reserve Space" option** during installation to leave unallocated space at the end of the drive
4. **Install Ventoy** on the drive
5. **Copy the MiniOS ISO file** to the root folder of the USB drive
6. **Create an ext4 partition** in the reserved space with the label `persistence` using a partition editor

This supplies a possible persistence location, but creating the partition alone does not enable persistence or create a session.


## Integration with MiniOS

MiniOS discovers the ISO presented by Ventoy separately from writable storage. There are two persistence models; choose one deliberately.

### Normal MiniOS sessions

Without a selected Ventoy Persistence Plugin backend, the usual **Start MiniOS** entry requests `perchdir=resume`. MiniOS can use a same-drive `persistence` partition or its `minios/changes/` store on the Ventoy data partition. For the data-partition layout, enable Ventoy's Linux remount support in `/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Merge this into an existing configuration rather than discarding other plugins. Suitable writable storage is still required. On FAT32/NTFS/exFAT, startup prefers DynBlk when available and otherwise uses DynFileFS. Session Manager, numbered sessions, encryption, and supported RAM-session saving follow the normal MiniOS rules. A boot without a persistence request stays temporary.

### Ventoy Persistence Plugin

Alternatively, associate the ISO with an **ext4 persistence image** using Ventoy's Persistence Plugin. For example, an already-created image at `/ventoy/minios.dat` can be selected for `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Paths are relative to the Ventoy data-partition root. Create the ext4 image with Ventoy's persistence-image tools and select it at boot; merely placing a `.dat` file on the drive does not activate it. MiniOS uses the backend selected by Ventoy, not an arbitrary device with a matching label.

This image contains one persistent environment, with `changes/` and, for OverlayFS, `workdir/`. It does not contain numbered MiniOS sessions. Choose another backend in Ventoy to use another environment. Session Manager and `minios-session` are unavailable, `perchdir` session selection is ignored, and `perchtoram` cannot copy this upper into RAM. System `toram` remains possible but does not release the persistence-image dependency.

The first use records the union format. Reusing the image with another union backend, an unavailable image, a non-ext4 image, or failed writable activation causes a warning and a fresh RAM upper. **Start without saving** does not open the image. See [Boot modes](/using-minios/Boot-Modes) and [Persistence internals](/reference/boot-process/Persistence-Internals).


## Using MiniOS with Ventoy

### Booting

After installing Ventoy and copying the MiniOS ISO file to the drive:

1. **Boot from the USB drive** - select it in BIOS/UEFI
2. **Select MiniOS** from the list of available ISO files in the Ventoy menu
3. Select normal mode for a current MiniOS image; for an older image, use its documented mode
4. **Wait for MiniOS to load**

After startup, verify the persistence status before relying on saved changes. With ordinary sessions, use `sudo minios-session status`. With the Persistence Plugin, inspect `/run/initramfs/minios-persistence/boot-state` as root: a successfully activated backend records `mode=ventoy` and `boot_level=ok`. Keep the drive connected while its ISO or persistence image is in use.
