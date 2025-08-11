# Session Management in MiniOS 🔄

## 🤔 What are Sessions?

MiniOS sessions provide persistent storage for your changes, allowing you to:

- **Save changes** made during a live session
- **Resume work** from where you left off after reboot
- **Manage multiple** separate working environments
- **Switch between** different configurations

Sessions use **Union Filesystem** technology (AUFS or OverlayFS) to layer changes on top of the read-only base system.

---

## 📋 Session Types and Modes

### **Session Actions**

- **`resume`** - Continue from the last used session (default)
- **`new`** - Create a new session 
- **`ask`** - Interactive session selection during boot
- **`fresh`** - No persistence (temporary session)

### **Storage Modes**

- **`native`** - Direct filesystem storage (POSIX filesystems)
- **`dynfilefs`** - Expandable container files (FAT32/NTFS)
- **`raw`** - Fixed-size image files (any filesystem)

---

## 🚀 Boot Parameters for Session Control

### **Core Session Parameters**

| Parameter | Values | Description |
|-----------|--------|-------------|
| `perch` | - | Enable persistent changes |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Session action or directory |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Storage mode |
| `perchsize` | `<size_in_MB>` | Initial size for container/image modes |

### **Session Directory Structure**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Bootloader Integration

### **GRUB Configuration**

MiniOS provides preconfigured GRUB menu entries for different session modes:

```bash
# Resume previous session
linux /minios/boot/vmlinuz... perchdir=resume

# Start new session  
linux /minios/boot/vmlinuz... perchdir=new

# Interactive session selection
linux /minios/boot/vmlinuz... perchdir=ask

# Fresh start (no persistence)
linux /minios/boot/vmlinuz... 
```

### **SYSLINUX Configuration**

Corresponding SYSLINUX entries:

```bash
LABEL default
MENU LABEL Run MiniOS (Resume previous session)
APPEND ... perchdir=resume

LABEL perch
MENU LABEL Run MiniOS (Start a new session)  
APPEND ... perchdir=new

LABEL asksession
MENU LABEL Run MiniOS (Choose session during startup)
APPEND ... perchdir=ask

LABEL live
MENU LABEL Run MiniOS (Fresh start)
APPEND ...
```

---

## 🔧 Session Management Commands

### **Using MiniOS Session Manager (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Features:**
- View all available sessions with metadata
- Create new sessions with different modes
- Activate/switch sessions
- Delete old sessions
- Clean up sessions older than specified days

### **Using minios-session (CLI)**

```bash
# List all sessions
minios-session list

# Create new session
minios-session create --mode native
minios-session create --mode dynfilefs --size 4000
minios-session create --mode raw --size 2000

# Activate specific session
minios-session activate 3

# Check session status
minios-session status

# Cleanup old sessions (older than 30 days)
minios-session cleanup --days 30
```

---

## 🏗️ Session Storage Modes in Detail

### **Native Mode**

**Best for:** POSIX filesystems (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Characteristics:**
- Direct filesystem access
- Full POSIX compliance
- Supports hard links, permissions, extended attributes
- Best performance
- **Requirements:** POSIX-compatible filesystem

### **DynFileFS Mode**

**Best for:** FAT32, NTFS, exFAT filesystems

```bash
# Enable dynfilefs mode with 4GB initial size
perchmode=dynfilefs perchsize=4000
```

**Characteristics:**
- Expandable container files
- Automatically grows as needed
- Works on any filesystem
- Slight performance overhead
- **Default size:** 4000MB, expands to available space

### **Raw Mode**

**Best for:** Fixed-size requirements or any filesystem

```bash
# Enable raw mode with 2GB fixed size  
perchmode=raw perchsize=2000
```

**Characteristics:**
- Fixed-size image files
- Predictable disk usage
- Works on any filesystem
- Must specify size upfront
- **Default size:** 4000MB if not specified

---

## 🗂️ Session Metadata and Compatibility

### **Session Metadata Formats**

**Default Format (session.conf):**
```bash
default=2
session_mode[1]=native
session_version[1]=5.0.0
session_edition[1]=standard
session_union[1]=overlayfs
session_mode[2]=dynfilefs
session_version[2]=5.0.0
session_edition[2]=standard
session_union[2]=overlayfs
```

**JSON Format (when jq is available):**
```json
{
  "default": "2",
  "sessions": {
    "1": {
      "mode": "native",
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    },
    "2": {
      "mode": "dynfilefs", 
      "version": "5.0.0",
      "edition": "standard",
      "union": "overlayfs"
    }
  }
}
```

> **Note:** MiniOS automatically detects if `jq` is available and uses JSON format when possible, otherwise falls back to the traditional conf format.

### **Compatibility Checking**

MiniOS automatically checks session compatibility:

- **Version mismatch** - Creates new session if MiniOS version differs
- **Edition mismatch** - Creates new session if edition differs (standard/toolbox/ultra)
- **Union FS mismatch** - Creates new session if union filesystem differs (aufs/overlayfs)
- **Mode change** - Creates new session if storage mode changes

### **Warning System**

When selecting incompatible sessions, MiniOS displays warnings:
- Version incompatibility warnings
- Edition mismatch notifications
- Union filesystem compatibility issues
- Option to proceed at user's risk

---

## 🎯 Advanced Session Configuration

### **Custom Session Locations**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Session Size Management**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4000MB (4GB limit)
# - Others: Limited by available space
```

### **Automatic Session Management**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Troubleshooting Sessions

### **Common Issues**

#### **Session Not Found**
```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Permission Issues**
```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Storage Mode Failures**
```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
minios-session status
```

### **Session Recovery**

```bash
# List all sessions and their status
minios-session list

# Check session integrity
minios-session status

# Create new session if corrupted
minios-session create --mode native
```

### **Cleaning Up Sessions**

```bash
# Remove sessions older than 30 days
minios-session cleanup --days 30

# Manual session removal
rm -rf /minios/changes/session_number/
```

---

## 📊 Session Best Practices

### **Choosing Storage Modes**

- **Native mode:** Use for ext4, btrfs, xfs filesystems
- **DynFileFS mode:** Use for FAT32, NTFS, exFAT filesystems  
- **Raw mode:** Use when you need predictable disk usage

### **Size Planning**

- **Small sessions:** 1-2GB for basic configuration changes
- **Development:** 4-8GB for development environments
- **Heavy workloads:** 8GB+ for extensive software installation

### **Session Management**

- Regularly clean up old sessions
- Use descriptive session names in manual management
- Monitor disk space usage
- Keep at least one known-good session for recovery

### **Performance Optimization**

- Use native mode when possible for best performance
- Place session storage on fast storage devices
- Consider SSD storage for frequently used sessions

---

## 🔍 Session Directory Locations

### **Standard Locations**

```bash
# Primary session storage (when booted from MiniOS)
/run/initramfs/memory/data/minios/changes/
```

### **Auto-detection Priority**

1. `/run/initramfs/memory/data/minios/changes` - Live system (primary)

### **Custom Locations**

Sessions can be stored on any writable partition:
- USB drives with persistence partitions
- External hard drives
- Network storage (if mounted)
- Cloud storage mounts

---

## 🎪 Integration with MiniOS Tools

### **Live System Integration**

Sessions integrate seamlessly with:
- **MiniOS Session Manager** - GUI management
- **Boot parameter processing** - Automatic session handling
- **Union filesystem** - Transparent file layering
- **Compatibility checking** - Version/edition validation

### **Development Integration**

For developers and system integrators:
- Session APIs available through CLI tools
- JSON metadata for automation
- Hook system for custom session handling
- Integration with package management systems

This comprehensive session management system enables MiniOS to provide persistent, reliable storage while maintaining the flexibility and safety of a live system.