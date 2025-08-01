# Hardware Compatibility Guide

This guide provides essential information about hardware compatibility for MiniOS. The system is based on Debian 13 "Trixie" with a Long-Term Support (LTS) Linux kernel, ensuring broad hardware support.

## System Requirements

MiniOS is built for the **amd64** (64-bit) architecture. The requirements vary by edition:

**For Standard Variant:**
- **CPU:** 1 GHz 64-bit processor
- **RAM:** 1 GB minimum (2 GB recommended)
- **Storage:** 2 GB to run the system (4 GB+ recommended for data storage)
- **Graphics:** VGA-compatible display adapter

**For Toolbox Variant:**
- **CPU:** 1.2 GHz 64-bit processor
- **RAM:** 2 GB minimum (4 GB recommended)
- **Storage:** 2 GB to run the system (8 GB+ recommended for data storage)
- **Graphics:** Graphics card with hardware acceleration support

**For Ultra Variant:**
- **CPU:** 1.5 GHz 64-bit dual-core processor
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 2 GB to run the system (8 GB+ recommended for data storage)
- **Graphics:** Modern GPU with hardware acceleration

## Component Compatibility

### Processors
A wide range of 64-bit x86 processors from Intel (Core i3/i5/i7/i9) and AMD (Ryzen 3/5/7/9) are supported.

### Graphics
- **Intel:** Integrated graphics (UHD, Iris Xe, Arc) are well-supported.
- **NVIDIA:** The open-source Nouveau driver is included. For modern cards, installing the proprietary driver is recommended for best performance.
- **AMD:** Modern Radeon RX series graphics are fully supported by the open-source AMDGPU driver.

### Network
- **Ethernet:** Most wired controllers from Intel, Realtek, and Broadcom work out-of-the-box.
- **Wi-Fi:** A vast range of Wi-Fi adapters are supported through included firmware and automatically built DKMS drivers, especially common models from Intel, Atheros, and Realtek.

### Storage
MiniOS is designed to boot from a variety of storage devices. The system's startup scripts automatically scan all available block devices, making it compatible with:

- **USB Drives:** All generations of USB are supported.
- **SATA/IDE Drives:** All standard internal hard drives and SSDs.
- **NVMe Drives:** Full support for modern NVMe SSDs.
- **SD/MMC Cards:** Supported if the card reader is recognized by the kernel.

### Virtualization
MiniOS is fully optimized for use as a guest operating system in all major virtualization environments. The build process includes all necessary drivers in the initial ramdisk (`initrd`) to ensure maximum performance out-of-the-box.

- **High-Performance Drivers:** Support for paravirtualized storage controllers is built-in, including **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI**, and **Hyper-V Storvsc**. This allows for near-native disk I/O performance.
- **Broad Compatibility:** The system can also boot from emulated **IDE** and **SATA** controllers, ensuring compatibility with any hypervisor configuration.
- **Guest Tools:** For enhanced integration (such as seamless mouse, clipboard sharing, and dynamic resolution), the `toolbox` and `ultra` variants include `open-vm-tools` (for VMware) and `hyperv-daemons` (for Hyper-V).

For detailed setup instructions and platform-specific configurations, see the [Virtualization Guide](Virtualization.md).