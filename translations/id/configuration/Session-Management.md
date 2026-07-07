# Manajemen Sesi di MiniOS 🔄

## 🤔 Apa itu Sesi?

Sesi MiniOS menyediakan penyimpanan yang persisten untuk perubahan Anda, memungkinkan Anda untuk:

- **Menyimpan perubahan** yang dilakukan selama sesi live
- **Melanjutkan pekerjaan** dari posisi terakhir setelah reboot
- **Mengelola beberapa** lingkungan kerja terpisah
- **Beralih antar** konfigurasi yang berbeda

Sesi menggunakan teknologi **Union Filesystem** (AUFS atau OverlayFS) untuk melapiskan perubahan di atas sistem dasar yang hanya-baca.

---

## 📋 Jenis dan Mode Sesi

### **Aksi Sesi**

- **`resume`** - Melanjutkan dari sesi terakhir yang digunakan (default)
- **`new`** - Membuat sesi baru
- **`ask`** - Pilih sesi secara interaktif saat boot
- **`fresh`** - Tanpa persistensi (sesi sementara)

### **Mode Penyimpanan**

- **`native`** - Penyimpanan langsung pada filesystem (memerlukan filesystem POSIX: ext4, btrfs, xfs)
- **`dynfilefs`** - File container yang dapat diperluas (berjalan di semua filesystem, direkomendasikan untuk FAT32/NTFS/exFAT)
- **`raw`** - File image ukuran tetap (berjalan di semua filesystem)

---

## 🚀 Parameter Boot untuk Kontrol Sesi

### **Parameter Inti Sesi**

| Parameter | Nilai | Deskripsi |
|-----------|--------|-------------|
| `perch` | - | Aktifkan perubahan persisten |
| `perchdir` | `resume` \| `new` \| `ask` \| `/path` | Aksi sesi atau direktori |
| `perchmode` | `native` \| `dynfilefs` \| `raw` | Mode penyimpanan |
| `perchsize` | `<size_in_MB>` | Ukuran awal untuk mode container/image |

### **Struktur Direktori Sesi**

```
/minios/changes/
├── session.conf          # Session configuration (default format)
├── session.json          # JSON metadata (when jq is available)
├── 1/                     # Session #1 directory
├── 2/                     # Session #2 directory
└── N/                     # Session #N directory
```

---

## 🎛️ Integrasi Bootloader

### **Konfigurasi GRUB**

MiniOS menyediakan entri menu GRUB yang sudah dikonfigurasi untuk berbagai mode sesi:

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

### **Konfigurasi SYSLINUX**

Entri SYSLINUX yang sesuai:

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

## 🔧 Perintah Manajemen Sesi

### **Menggunakan MiniOS Session Manager (GUI)**

```bash
# Launch graphical session manager
minios-session-manager
```

**Fitur:**
- Melihat semua sesi yang tersedia beserta metadata
- Membuat sesi baru dengan berbagai mode
- Mengaktifkan/berpindah sesi
- Menghapus sesi lama
- Membersihkan sesi yang lebih tua dari jumlah hari tertentu

### **Menggunakan minios-session (CLI)**

⚠️ **Hak Akses Administrator Diperlukan:**

Alat CLI memerlukan hak akses root dan akan memeriksanya secara otomatis. Jalankan perintah dengan `sudo` atau melalui `pkexec`:

```bash
sudo minios-session list
# or
pkexec minios-session activate 3
```

#### **Perintah Dasar:**

```bash
# List all sessions
sudo minios-session list

# Show currently active session (will boot next)
sudo minios-session active

# Show currently running session (current boot)
sudo minios-session running

# Check filesystem compatibility and session directory status
sudo minios-session info
sudo minios-session status

# Create new sessions (using positional arguments)
sudo minios-session create native
sudo minios-session create dynfilefs 2000
sudo minios-session create raw 2000

# Activate specific session
sudo minios-session activate 3

# Delete session
sudo minios-session delete 2

# Resize session (dynfilefs/raw modes only)
sudo minios-session resize 1 8000

# Export session to archive
sudo minios-session export 1 /path/to/backup.tar.zst

# Import session from archive
sudo minios-session import /path/to/backup.tar.zst
sudo minios-session import /path/to/backup.tar.zst dynfilefs  # with mode conversion

# Copy session with optional mode conversion
sudo minios-session copy 1 2              # copy keeping same mode
sudo minios-session copy 1 3 raw          # copy and convert to raw mode
sudo minios-session copy 1 4 native 3000  # copy, convert to native, set size

# Cleanup old sessions (older than 30 days)
sudo minios-session cleanup --days 30
```

#### **Opsi Lanjutan:**

```bash
# JSON output for automation (available for all commands)
sudo minios-session --json list
sudo minios-session --json info
sudo minios-session --json active
sudo minios-session --json running
sudo minios-session --json status
sudo minios-session --json create native
sudo minios-session --json activate 2
sudo minios-session --json delete 3
sudo minios-session --json cleanup --days 30
sudo minios-session --json resize 1 8000
sudo minios-session --json export 1 backup.tar.zst
sudo minios-session --json import backup.tar.zst
sudo minios-session --json copy 1 2 native

# Custom sessions directory
sudo minios-session --sessions-dir /custom/path list
sudo minios-session --sessions-dir /mnt/usb/sessions create native
```

#### **Perbedaan Perintah Utama:**

- `active` - Menampilkan sesi yang akan digunakan pada boot berikutnya
- `running` - Menampilkan sesi yang sedang digunakan (jika ada)
- `resize` - Mengubah ukuran sesi (hanya untuk mode dynfilefs/raw)
- `export` - Ekspor sesi ke arsip .tar.zst untuk backup
- `import` - Impor sesi dari arsip dengan konversi mode opsional
- `copy` - Menyalin sesi dengan konversi mode opsional
- `info` - Memeriksa kompatibilitas filesystem dan rekomendasi

---

## 📦 Backup dan Migrasi Sesi

### **Ekspor Sesi**

Ekspor sesi ke arsip terkompresi untuk backup atau transfer:

```bash
# Export session to archive
sudo minios-session export 1 /backup/session1.tar.zst

# Export with JSON output
sudo minios-session --json export 2 /backup/session2.tar.zst
```

**Fitur:**
- Membuat arsip .tar.zst terkompresi
- Menyimpan semua data dan metadata sesi
- Dapat diimpor pada sistem MiniOS manapun
- Kompresi otomatis untuk efisiensi ruang

### **Impor Sesi**

Impor sesi dari arsip dengan konversi mode opsional:

```bash
# Import session keeping original mode
sudo minios-session import /backup/session1.tar.zst

# Import and convert to different mode
sudo minios-session import /backup/session1.tar.zst dynfilefs
sudo minios-session import /backup/session2.tar.zst raw
sudo minios-session import /backup/session3.tar.zst native

# Import with JSON output
sudo minios-session --json import /backup/session.tar.zst
```

**Fitur:**
- Mengembalikan data sesi dari arsip
- Secara otomatis mengonversi antar mode penyimpanan jika ditentukan
- Melewati file yang sudah ada untuk mencegah kehilangan data
- Membuat nomor sesi baru secara otomatis

### **Salin dan Konversi Sesi**

Salin sesi antar mode penyimpanan yang berbeda:

```bash
# Copy session keeping same mode
sudo minios-session copy 1 2

# Copy and convert to different mode
sudo minios-session copy 1 3 raw           # convert to raw mode
sudo minios-session copy 1 4 dynfilefs     # convert to dynfilefs
sudo minios-session copy 1 5 native        # convert to native

# Copy with custom size (for raw/dynfilefs)
sudo minios-session copy 1 6 raw 4000      # 4GB raw image
sudo minios-session copy 2 7 dynfilefs 2000 # 2GB dynfilefs
```

**Konversi yang Didukung:**
- native ⇄ dynfilefs ⇄ raw
- Semua kombinasi mode didukung
- Penanganan ukuran otomatis
- Data sesi tetap terjaga selama konversi

**Contoh Penggunaan:**
- Migrasi dari filesystem FAT32 ke ext4 (dynfilefs → native)
- Membuat sesi portabel (native → dynfilefs/raw)
- Optimasi untuk filesystem berbeda
- Membuat backup sesi dengan mode berbeda

---

## 🏗️ Mode Penyimpanan Sesi Secara Detail

### **Mode Native**

**Terbaik untuk:** Sistem dengan filesystem POSIX (ext4, btrfs, xfs)

```bash
# Enable native mode
perchmode=native
```

**Karakteristik:**
- Akses langsung ke filesystem tanpa container
- Kompatibilitas penuh POSIX (hard link, permission, extended attribute)
- Performa terbaik di antara semua mode
- **Syarat:** Filesystem yang kompatibel POSIX (ext4, btrfs, xfs)
- **Tidak kompatibel:** FAT32, NTFS, exFAT

### **Mode DynFileFS**

**Terbaik untuk:** Filesystem non-POSIX (FAT32, NTFS, exFAT)

```bash
# Enable dynfilefs mode with initial size
perchmode=dynfilefs perchsize=2000
```

**Karakteristik:**
- Container yang dapat diperluas dengan filesystem ext4 di dalamnya
- Secara otomatis bertambah sesuai kebutuhan hingga ruang tersedia
- Berjalan di semua jenis filesystem
- Sedikit overhead performa dibanding native
- **Ukuran default:** 1000MB, bertambah dinamis
- **Direkomendasikan untuk:** filesystem FAT32, NTFS, exFAT

### **Mode Raw**

**Terbaik untuk:** Kebutuhan ukuran tetap di semua filesystem

```bash
# Enable raw mode with fixed size
perchmode=raw perchsize=2000
```

**Karakteristik:**
- Image ukuran tetap dengan filesystem ext4 di dalamnya
- Penggunaan disk yang tetap dan dapat diprediksi
- Berjalan di semua jenis filesystem
- Ukuran harus ditentukan saat pembuatan
- **Ukuran default:** 1000MB jika tidak ditentukan
- **Penggunaan:** Sesi portabel, kuota penyimpanan, alokasi ruang yang pasti

---

## 🗂️ Metadata Sesi dan Kompatibilitas

### **Format Metadata Sesi**

**Format Default (session.conf):**
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

**Format JSON (jika jq tersedia):**
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

> **Catatan:** MiniOS secara otomatis mendeteksi jika `jq` tersedia dan menggunakan format JSON jika memungkinkan, jika tidak akan menggunakan format conf tradisional.

### **Pemeriksaan Kompatibilitas**

MiniOS secara otomatis memeriksa kompatibilitas sesi:

- **Versi tidak cocok** - Membuat sesi baru jika versi MiniOS berbeda
- **Edisi tidak cocok** - Membuat sesi baru jika edisi berbeda (standard/toolbox/ultra)
- **Union FS tidak cocok** - Membuat sesi baru jika union filesystem berbeda (aufs/overlayfs)
- **Perubahan mode** - Membuat sesi baru jika mode penyimpanan berubah

### **Sistem Peringatan**

Saat memilih sesi yang tidak kompatibel, MiniOS akan menampilkan peringatan:
- Peringatan ketidakcocokan versi
- Notifikasi perbedaan edisi
- Masalah kompatibilitas union filesystem
- Opsi untuk melanjutkan dengan risiko pengguna

---

## 🎯 Konfigurasi Sesi Lanjutan

### **Lokasi Sesi Kustom**

```bash
# Specify custom session directory
perchdir=/dev/sda2/my-sessions

# Use labeled partition  
perchdir=label:MYSESSIONS/work

# Interactive disk selection
perchdir=askdisk
```

### **Manajemen Ukuran Sesi**

```bash
# Auto-size for dynfilefs (uses 90% of available space)
perchmode=dynfilefs perchsize=0

# Fixed size for any mode
perchsize=8000  # 8GB

# Size limits per filesystem:
# - FAT32: Maximum 4095MB (4GB limit)
# - Others: Limited by available space
```

### **Manajemen Sesi Otomatis**

```bash
# Resume last session (default behavior)
perchdir=resume

# Force new session creation
perchdir=new

# Interactive session management
perchdir=ask
```

---

## 🛠️ Pemecahan Masalah Sesi

### **Masalah Umum**

#### **Sesi Tidak Ditemukan**

```bash
# Check session directory
ls -la /minios/changes/

# Verify session metadata  
cat /minios/changes/session.conf
# or if JSON format is used:
cat /minios/changes/session.json
```

#### **Masalah Izin Akses**

```bash
# Check directory permissions
ls -ld /minios/changes/

# Verify filesystem mount options
mount | grep changes
```

#### **Kegagalan Mode Penyimpanan**

```bash
# Native mode falls back to dynfilefs automatically
# Check system logs for details
sudo minios-session status
sudo minios-session info  # Show filesystem compatibility
```

### **Pemulihan Sesi**

```bash
# List all sessions and their status
sudo minios-session list

# Check session integrity and filesystem info
sudo minios-session status
sudo minios-session info

# Show active vs running session status
sudo minios-session active
sudo minios-session running

# Create new session if corrupted
sudo minios-session create native
```

### **Membersihkan Sesi**

```bash
# Remove sessions older than 30 days
sudo minios-session cleanup --days 30

# Delete specific session (safe method)
sudo minios-session delete 3

# Manual session removal (advanced users only)
sudo rm -rf /minios/changes/session_number/
```

---

## 📊 Praktik Terbaik Sesi

### **Memilih Mode Penyimpanan**

- **Mode Native:** Gunakan saat MiniOS berada di filesystem POSIX (ext4, btrfs, xfs) - performa terbaik
- **Mode DynFileFS:** Gunakan untuk filesystem FAT32, NTFS, exFAT - manajemen ruang otomatis
- **Mode Raw:** Gunakan jika membutuhkan ukuran tetap di semua filesystem - penggunaan disk yang terprediksi

### **Perencanaan Ukuran**

- **Sesi kecil:** 1-2GB untuk perubahan konfigurasi dasar
- **Pengembangan:** 4-8GB untuk lingkungan pengembangan
- **Beban kerja berat:** 8GB+ untuk instalasi software yang ekstensif

### **Manajemen Sesi**

- Bersihkan sesi lama secara rutin
- Gunakan nama sesi yang deskriptif untuk manajemen manual
- Pantau penggunaan ruang disk
- Simpan minimal satu sesi yang sudah terbukti baik untuk pemulihan

### **Optimasi Performa**

- Gunakan mode native jika memungkinkan untuk performa terbaik
- Tempatkan penyimpanan sesi di perangkat penyimpanan yang cepat
- Pertimbangkan SSD untuk sesi yang sering digunakan

---
