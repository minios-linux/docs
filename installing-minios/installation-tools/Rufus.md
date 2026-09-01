---
updated: 2026-08-31
---
# Rufus


Rufus is a popular utility for Windows that helps format and create bootable USB drives.


## Important

**Warning:** Incorrect device selection will result in data loss! Always double-check the selected drive and backup important data.


## Drive Requirements

### Drive Size
See [Hardware Compatibility Guide](/getting-started/Hardware-Compatibility) for detailed system requirements and drive sizes.

## Installing Rufus

1. **Download Rufus** from the [official website](https://rufus.ie/)
2. **Run the program** - Rufus doesn't require installation, it's a portable application

## Creating Bootable USB Drive

Rufus can create MiniOS media in two different ways. Its normal ISO mode is the better choice when you want the USB drive to remain an ordinary writable filesystem as well as a boot device.

### Method 1: ISO mode

1. **Launch Rufus** as administrator.
2. **Select the USB drive** in the **Device** field.
3. **Select the MiniOS ISO file** with **SELECT**.
4. When Rufus asks how to write the hybrid image, keep **ISO Image mode**.
5. Choose a suitable filesystem. FAT32 provides the broadest firmware compatibility; NTFS may limit direct UEFI boot on some systems.
6. Click **START** and confirm formatting of the selected device.

ISO mode extracts the MiniOS files onto a normal filesystem. After installation, the remaining free space can still be used for ordinary files. This is usually the more convenient Rufus layout for a portable MiniOS drive.

### Method 2: DD mode

Choose **DD Image mode** only when you specifically want an exact block-for-block copy of the published ISO. Rufus then reproduces the ISO layout on the whole device, similarly to `dd`, Etcher, or Drive Utility write mode.

DD mode is simple and predictable, but the device no longer has the normal single writable filesystem layout expected from a general-purpose flash drive.

## Result and persistence

ISO mode creates file-based MiniOS media on a normal writable filesystem. DD mode creates raw image media. Neither mode is a MiniOS Installer deployment, and neither automatically creates a persistent session.

MiniOS persistence can use suitable writable storage on a file-based Rufus installation when a persistent boot mode is selected. See [Boot modes](/using-minios/Boot-Modes) and [Session management](/using-minios/Sessions-and-Persistence).
