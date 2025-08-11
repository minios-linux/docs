# Kernel Management in MiniOS 🔧

## 🤔 Why Replace the Kernel?

MiniOS comes with a default kernel, but there are several reasons why you might want to replace it:

### 🔧 **Different Debian Kernel Flavours**
Debian provides several kernel variants optimized for different use cases:

- **`linux-image-6.12.38+deb13-amd64`** - Standard kernel for 64-bit systems (default in MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Real-time kernel for time-critical applications
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Optimized for cloud and virtualized environments

> **📝 Note:** Version numbers (like `6.12.38+deb13`) change with updates. To find current available kernels:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

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

## ⚙️ MiniOS Kernel Manager Overview

MiniOS provides two tools for kernel management:

1. **🖥️ MiniOS Kernel Manager (GUI):** A user-friendly graphical application for packaging, installing, and managing kernels
2. **⌨️ minios-kernel (CLI):** A command-line tool for advanced users and automation

Both tools automatically handle:
- **Kernel packaging** into SquashFS format
- **Initramfs generation** with proper drivers and boot scripts
- **Installation** to the MiniOS kernel repository
- **Bootloader configuration** updates
- **Kernel activation** and switching

### ⚠️ **Important Considerations:**

- **🔑 Administrative Privileges:** Both tools require administrative privileges and will prompt for authentication via PolicyKit
- **🔗 Kernel Compatibility:** Ensure kernels are compatible with MiniOS. Repository kernels are recommended
- **💾 MiniOS Directory:** Tools automatically detect the MiniOS directory (`/minios/`) and verify write permissions
- **🔄 Automatic Updates:** Bootloader configurations are updated automatically when kernels are activated

---

## 🖥️ Method 1: Using MiniOS Kernel Manager (GUI)

The graphical kernel manager provides an intuitive interface for all kernel operations.

### 📝 **Steps:**

#### 1. 🚀 **Launch the Application**
```bash
minios-kernel-manager
```

Or search for "MiniOS Kernel Manager" in your application menu.

#### 2. 📦 **Package a New Kernel**

**Using the Package Kernel Tab:**

1. **Select Kernel Source:**
   - **Manual Package:** Browse and select a local `.deb` kernel package
   - **Repository:** Choose from available kernels in the Debian/Ubuntu repositories

2. **Configure Compression:**
   - Select SquashFS compression: `zstd` (recommended), `lz4`, `lzo`, `xz`, or `gzip`

3. **Package the Kernel:**
   - Click "Package Kernel" button
   - Monitor progress in the packaging log
   - Files are automatically installed to the MiniOS repository

#### 3. 🔄 **Manage Installed Kernels**

**Using the Manage Kernels Tab:**

1. **View Available Kernels:**
   - See all packaged kernels with status badges:
     - **ACTIVE:** Currently configured kernel
     - **RUNNING:** Currently booted kernel
     - **AVAILABLE:** Available for activation

2. **Activate a Kernel:**
   - Right-click on a kernel and select "Activate Kernel"
   - Confirm the activation dialog
   - Bootloader configuration is updated automatically

3. **Delete a Kernel:**
   - Right-click on an inactive kernel and select "Delete Kernel"
   - Confirm deletion (cannot be undone)

---

## ⌨️ Method 2: Using minios-kernel (CLI)

The command-line tool provides scriptable kernel management capabilities.

### 📝 **Basic Commands:**

#### 1. 📋 **List Available Kernels**
```bash
minios-kernel list
```

Shows all packaged kernels with their status.

#### 2. 📦 **Package a Kernel**

**From Repository:**
```bash
minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**From Local .deb File:**
```bash
minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**With Custom Compression:**
```bash
minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Activate a Kernel**
```bash
minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Delete a Kernel**
```bash
minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Check Status**
```bash
minios-kernel status
```

Shows MiniOS directory status and current kernel information.

### 🔧 **Advanced CLI Options:**

#### **JSON Output (for scripting):**
```bash
minios-kernel --json list
minios-kernel --json status
minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
```

#### **Help and Usage:**
```bash
minios-kernel --help
minios-kernel package --help
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### **🚫 MiniOS Directory Not Found**
- **Cause:** Tools cannot locate the MiniOS directory
- **Solution:** Ensure you're running from a MiniOS system or the USB drive is properly mounted
- **Check:** Run `minios-kernel status` to verify directory detection

#### **🔒 Permission Denied**
- **Cause:** MiniOS directory is read-only or insufficient permissions
- **Solution:** Ensure you have administrative privileges and the filesystem is writable
- **Check:** Verify the MiniOS directory status in the GUI or CLI

#### **📦 Package Installation Failed**
- **Cause:** Corrupted package, network issues, or dependency problems
- **Solution:** 
  - Verify the package file integrity
  - Check network connectivity for repository packages
  - Update package lists: `sudo apt update`

#### **💥 Kernel Panic After Activation**
- **Cause:** Incompatible kernel or missing drivers
- **Solution:** 
  - Boot from rescue mode or older kernel
  - Use minios-kernel to activate a known working kernel
  - Check kernel compatibility with your hardware

#### **🔄 System Boots Old Kernel**
- **Cause:** Bootloader configuration not updated properly
- **Solution:** 
  - Re-run kernel activation: `minios-kernel activate <version>`
  - Check that the kernel was properly packaged and installed

#### **⚠️ Hardware Not Working After Kernel Change**
- **Cause:** Missing drivers in the new kernel
- **Solution:**
  - Verify the SquashFS kernel module file was installed
  - Check if the new kernel supports your hardware
  - Consider using a different kernel variant

### 🔍 **Diagnostic Commands:**

**Check Current System Status:**
```bash
minios-kernel status
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verify Kernel Files:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Check Bootloader Configuration:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 File Structure Overview

The MiniOS Kernel Manager automatically manages these files:

### **Kernel Repository Structure:**
```
/minios/
├── kernels/
│   └── 01-kernel-<version>.sb     # SquashFS kernel modules
├── boot/
│   ├── vmlinuz-<version>          # Kernel binary
│   ├── initrfs-<version>.img      # Initial RAM filesystem
│   ├── syslinux.cfg               # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
└── active                         # Symlink to active kernel
```

### **Status Indicators:**
- **ACTIVE:** Kernel configured in bootloader (will boot on next restart)
- **RUNNING:** Currently executing kernel
- **AVAILABLE:** Packaged and ready for activation

### **Automatic Operations:**
- ✅ Kernel packaging and compression
- ✅ Initramfs generation with proper drivers
- ✅ Installation to MiniOS repository
- ✅ Bootloader configuration updates
- ✅ Symlink management for active kernels
- ✅ Cleanup of temporary files

---

## 🎯 Best Practices

### **Kernel Selection:**
- Use kernels from official Debian/Ubuntu repositories when possible
- Test new kernels in non-production environments first
- Keep at least one known working kernel for recovery

### **Before Installing:**
- Verify MiniOS directory is writable
- Ensure sufficient disk space (kernels can be 100-500MB)
- Update package lists for repository kernels

### **After Installation:**
- Test the new kernel thoroughly
- Verify all hardware functions correctly
- Keep previous kernel as backup until new one is proven stable

### **Recovery Planning:**
- Always maintain a working kernel backup
- Know how to boot from rescue media if needed
- Document which kernels work with your hardware configuration

### **Kernel Recovery from Original MiniOS Image:**
If you need to recover from a corrupted or incompatible kernel, you can boot from the original MiniOS ISO/USB and automatically restore the working kernel:

```bash
# Boot from original MiniOS image with from= parameter
# At boot prompt, specify your installed MiniOS device
from=/dev/sda1  # Replace with your actual MiniOS device
```

**Kernel Recovery Process:**
When you boot from the original MiniOS ISO/USB image and specify in the `from=` parameter the device where MiniOS is installed, the init system detects this and allows you to access your installed MiniOS system. The recovery method depends on whether the original kernel files are still present:

1. **If the original kernel still exists:** 
   - Boot happens seamlessly with the original kernel from the ISO/USB
   - Manually activate the original kernel: `minios-kernel activate <original-kernel-version>`

2. **If the original kernel was deleted:** 
   - Manually copy kernel files from the original MiniOS image and restore them to the appropriate locations on your MiniOS installation
   - Manually activate the restored kernel: `minios-kernel activate <original-kernel-version>`

In both cases, kernel activation requires manual intervention after the recovery process.
