---
title: Install on hard disk or USB flash drive
type: docs
weight: 1
---

In order to run MiniOS from hard drive or from an USB device, you need to copy the contents of the ISO file directly to your disk's root.

<!--more-->
There is just one folder called `/minios/`, which needs to be copied. For example Windows 10 will simply open the ISO file for you as like if it was a directory. You may need some special software for this task if your operating system can't access the contents of the ISO file. Alternatively, you can burn the ISO file to a CD/DVD disc and then copy it from there. You should end up with `/minios/` folder on your disk, for example like `E:\minios\`. It is required that your disk uses msdos partition scheme (use MBR, not GPT). Furthermore, it needs to be formatted, FAT32 or ext4 is recommended.

When done, one more step is required in order to make the drive bootable: navigate to `/minios/boot/` directory on your USB device or hard disk and locate `bootinst.bat` file there (Linux users look for `bootinst.sh`). Just run it by double clicking, it will make all the necessary changes to your device's master boot record so your computer's BIOS could actually understand how to boot MiniOS from your disk. Keep in mind that the boot installer does not support multiboot, so only MiniOS will be bootable from the given drive.

Next follow the same procedure like if you were booting from CD - reboot your computer and choose to boot from the USB drive or hard disk in your computer's boot menu. Again, you may need to consult your BIOS documentation to find out how to boot an operating system on your computer from your desired device.
