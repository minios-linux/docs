# Guide to Replacing the Kernel in MiniOS 🔧

## 🤔 Why Replace the Kernel?

MiniOS comes with a default kernel, but there are several reasons why you might want to replace it:

### 🔧 **Different Debian Kernel Flavours**
Debian provides several kernel variants optimized for different use cases:

- **`linux-image-amd64`** - Standard kernel for 64-bit systems (default in MiniOS)
- **`linux-image-rt-amd64`** - Real-time kernel for time-critical applications
- **`linux-image-cloud-amd64`** - Optimized for cloud and virtualized environments

### 🎯 **Specialized Use Cases**
- **Real-time computing** - RT kernels for audio production, industrial control
- **Gaming and low-latency** - Custom kernels with gaming optimizations
- **Security hardening** - Kernels with additional security patches (grsecurity, etc.)
- **Hardware compatibility** - Newer kernels for recent hardware support
- **Performance tuning** - Custom-compiled kernels with specific optimizations

### 🛠️ **Custom Kernel Features**
- **Custom patches** - Apply specific patches for your hardware or use case
- **Kernel modules** - Add support for specialized hardware or filesystems
- **Compiler optimizations** - Build with different optimization flags
- **Size optimization** - Remove unnecessary drivers to reduce kernel size

### 📈 **Common Scenarios**
- **Audio production workstations** - Use RT kernel for minimal audio latency
- **Gaming systems** - Apply gaming-specific patches and optimizations
- **Server environments** - Use cloud-optimized kernels for better virtualization
- **Legacy hardware** - Use older kernels for compatibility with vintage systems
- **Development systems** - Test applications against different kernel versions

---

## ⚙️ Process Overview

This guide explains how to replace the kernel in MiniOS. The process consists of two main parts:

1. **🔨 Generating Kernel Files:** The built-in `minios-kernelpack` script is used to create the necessary `vmlinuz`, `initrfs`, and SquashFS (`.sb`) files. The script can use a locally installed kernel or download one from a repository.

2. **🚀 Deploying Kernel Files:** Copying the generated files to the correct locations on the MiniOS USB drive and updating the bootloader configuration. **Important:** The file locations on the USB drive depend on how the MiniOS system is booted.

### ⚠️ **Important Considerations Before Starting:**

- **🔑 Root Privileges:** You *must* run the script as the root user (or using `sudo`). The deployment steps also require root access to the MiniOS USB drive.
- **🔗 Kernel Compatibility:** Ensure that the kernel you choose is compatible with MiniOS. Using a kernel significantly different from the original may lead to instability or failure. It is recommended to use kernels from the MiniOS repository if available.
- **🥾 Bootloader:** MiniOS uses Syslinux and GRUB as bootloaders. You *must* update both configurations to point to the new kernel and initramfs files.
- **📋 Dependencies:** When manually copying `vmlinuz`, the corresponding `initrfs` must be copied at the same time.

---

## 🔨 Part 1: Generating Kernel Files (Using `minios-kernelpack`)

The `minios-kernelpack` script automates the creation of:

- **`vmlinuz-<kernel-version>`:** The kernel itself.
- **`initrfs-<kernel-version>.img`:** The initial RAM file system (initramfs) with drivers and scripts for early boot.
- **`01-kernel-<kernel-version>.sb`:** The SquashFS image containing the kernel modules (drivers).

### 📝 **Steps:**

#### 1. 🏃 **Running the Script**
Execute `minios-kernelpack` as root. Beginners are advised to run the script without parameters (default compression methods are used – zstd).

```bash
sudo minios-kernelpack
```

The script will guide you through interactive prompts:
- **Kernel Source:** "local" (installed kernel) or "repository" (download from repository).
- **Installed Kernel (if local):** Select a kernel from the list in `/lib/modules`.
- **Kernel from Repository (if repository):** Select a kernel package. The script will update the package list.

By default, `zstd` compression is used for SquashFS and initramfs.

#### 2. ⚙️ **Advanced Options (Optional):**

**Fully Interactive Mode:**
```bash
sudo minios-kernelpack -c
```
Will prompt for selection of compression methods for SquashFS and initramfs.

**Specifying Compression Methods:**
```bash
sudo minios-kernelpack -s lz4 -i gzip
```
Uses `lz4` for SquashFS and `gzip` for initramfs. Available options: `lz4`, `lzo`, `gzip`, `zstd`, `lzma`, `xz`, `bzip2`.

#### 3. 📁 **Output Files**
After the script completes, the files (`vmlinuz-<kernel-version>`, `initrfs-<kernel-version>.img`, `01-kernel-<kernel-version>.sb`) will be in the same directory. An `initramfs-<kernel-version>.log` file might be created.

---

## 🚀 Part 2: Deploying Kernel Files (Manual Steps)

Install the new kernel files onto the MiniOS USB drive. **⚠️ Attention!** The file locations depend on how MiniOS is booted:

- **🔌 Booting from USB** (filesystem with read-write support, *not* in RAM): Files are located in `/run/initramfs/memory/data/minios`.
- **💻 USB drive connected to another system**: Files are located in `/minios` on the root partition of the USB drive.

### 📝 **Steps:**

#### 1. 💿 **Mount the USB Drive**
If MiniOS is *not* booted from this USB drive, mount it:

```bash
sudo mkdir -p <mount_point>
sudo mount /dev/sdX1 <mount_point>  # Replace /dev/sdX1 with the correct partition
```

If MiniOS IS booted from the flash drive, remount the root filesystem in write mode:
```bash
sudo mount -o remount,rw /
```

#### 2. 📂 **Copy the Files**

**If MiniOS is booted from this USB drive:**
```bash
sudo cp 01-kernel-<kernel-version>.sb /run/initramfs/memory/data/minios/
sudo cp vmlinuz-<kernel-version> /run/initramfs/memory/data/minios/boot/
sudo cp initrfs-<kernel-version>.img /run/initramfs/memory/data/minios/boot/
```

**If MiniOS is not booted from this USB drive (USB drive connected to another system):**
```bash
sudo cp 01-kernel-<kernel-version>.sb <mount_point>/minios/
sudo cp vmlinuz-<kernel-version> <mount_point>/minios/boot/
sudo cp initrfs-<kernel-version>.img <mount_point>/minios/boot/
```

#### 3. ⚙️ **Update the Bootloader Configuration**
Modify `syslinux.cfg` and `grub.cfg`, pointing to the new kernel and initramfs files.

**📍 Where to find the configuration files:**
- **Booting from USB:** `/run/initramfs/memory/data/minios/boot/syslinux.cfg` and `/run/initramfs/memory/data/minios/boot/grub/grub.cfg`
- **USB drive connected to another system:** `<mount_point>/minios/boot/syslinux.cfg` and `<mount_point>/minios/boot/grub/grub.cfg`

**📝 Edit `syslinux.cfg`:**

```bash
sudo nano <path_to_syslinux.cfg>  # Use the correct path!
```

Find the `LABEL` entries. Modify the `kernel` and `append initrd=` lines:

```
# Before:
# LABEL minios
#   KERNEL /minios/boot/vmlinuz-old-version
#   APPEND initrd=/minios/boot/initrfs-old-version.img ...

# After:
LABEL minios
  KERNEL /minios/boot/vmlinuz-<kernel-version>
  APPEND initrd=/minios/boot/initrfs-<kernel-version>.img ...
```

Repeat for all `LABEL` entries. *Do not remove other parameters* in the `APPEND` line.

**📝 Edit `grub.cfg`:**

```bash
sudo nano <path_to_grub.cfg> # Use the correct path!
```

Find the `menuentry` blocks and modify `linux` and `initrd`:

```
# Before:
# menuentry "MiniOS" {
#   linux /minios/boot/vmlinuz-old-version ...
#   initrd /minios/boot/initrfs-old-version.img
# }

# After:
menuentry "MiniOS" {
  linux /minios/boot/vmlinuz-<kernel-version> ...
  initrd /minios/boot/initrfs-<kernel-version>.img
}
```

*Do not remove other parameters* in the `linux` line.

#### 4. 💿 **Unmount the USB Drive (if mounted)**

```bash
sudo umount <mount_point>
```

#### 5. 🚀 **Boot from the USB Drive**
Restart your computer and boot from the MiniOS USB drive.

---

## 🔧 Troubleshooting

- **💥 Kernel Panic:** Kernel error. Possible causes: incompatible kernel, missing driver, or problem with initramfs. Try the old kernel and re-check the steps.
- **❌ No Bootable Device:** Check the bootloader configuration (`syslinux.cfg` and `grub.cfg`) and file locations.
- **🔄 Boots into Old Kernel:** Check `syslinux.cfg` and `grub.cfg`.
- **⚠️ Module Loading Errors:** If MiniOS boots, but hardware doesn't work, a module might be missing. Ensure `01-kernel-<kernel-version>.sb` is in place.

---

## 📋 Summary of Files and Locations

| File                         | Source Location (after script) | Destination Location (booting from USB)              | Destination Location (USB connected to another system) |
| ---------------------------- | ------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `01-kernel-<kernel-version>.sb` | Current working directory        | `/run/initramfs/memory/data/minios/`                   | `<mount_point>/minios/`                                      |
| `vmlinuz-<kernel-version>`      | Current working directory        | `/run/initramfs/memory/data/minios/boot/`              | `<mount_point>/minios/boot/`                                 |
| `initrfs-<kernel-version>.img`  | Current working directory        | `/run/initramfs/memory/data/minios/boot/`              | `<mount_point>/minios/boot/`                                 |
| `syslinux.cfg`               |                                  | `/run/initramfs/memory/data/minios/boot/syslinux.cfg`  | `<mount_point>/minios/boot/syslinux.cfg`                     |
| `grub.cfg`                   |                                  | `/run/initramfs/memory/data/minios/boot/grub/grub.cfg` | `<mount_point>/minios/boot/grub/grub.cfg`                    |
