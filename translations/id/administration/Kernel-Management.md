# Manajemen Kernel di MiniOS 🔧

## 🤔 Mengapa Mengganti Kernel?

MiniOS sudah dilengkapi dengan kernel bawaan, namun ada beberapa alasan mengapa Anda mungkin ingin menggantinya:

### 🔧 **Varian Kernel Debian yang Berbeda**

Debian menyediakan beberapa varian kernel yang dioptimalkan untuk berbagai kebutuhan:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel standar untuk sistem 64-bit (default di MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel real-time untuk aplikasi yang membutuhkan waktu respons sangat cepat
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Dioptimalkan untuk lingkungan cloud dan virtualisasi

> **📝 Catatan:** Nomor versi (seperti `6.12.38+deb13`) dapat berubah sesuai pembaruan. Untuk melihat kernel yang tersedia saat ini:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### 🎯 **Kasus Penggunaan Khusus**

- **Komputasi real-time** - Kernel RT untuk produksi audio, kontrol industri
- **Gaming dan latensi rendah** - Kernel kustom dengan optimasi untuk gaming
- **Penguatan keamanan** - Kernel dengan patch keamanan tambahan (seperti grsecurity, dll.)
- **Kompatibilitas perangkat keras** - Kernel terbaru untuk dukungan perangkat keras terkini
- **Tuning performa** - Kernel yang dikompilasi khusus dengan optimasi tertentu

### 🛠️ **Fitur Kernel Kustom**

- **Patch kustom** - Terapkan patch spesifik untuk perangkat keras atau kebutuhan Anda
- **Modul kernel** - Tambahkan dukungan untuk perangkat keras atau filesystem khusus
- **Optimasi kompilasi** - Build dengan flag optimasi yang berbeda
- **Optimasi ukuran** - Hapus driver yang tidak diperlukan untuk memperkecil ukuran kernel

### 📈 **Skenario Umum**

- **Workstation produksi audio** - Gunakan kernel RT untuk latensi audio minimal
- **Sistem gaming** - Terapkan patch dan optimasi khusus gaming
- **Lingkungan server** - Gunakan kernel yang dioptimalkan untuk cloud demi virtualisasi yang lebih baik
- **Perangkat keras lawas** - Gunakan kernel lama untuk kompatibilitas dengan sistem lama
- **Sistem pengembangan** - Uji aplikasi dengan berbagai versi kernel

---

## ⚙️ Ikhtisar MiniOS Kernel Manager

MiniOS menyediakan dua alat untuk manajemen kernel:

1. **🖥️ MiniOS Kernel Manager (GUI):** Aplikasi grafis yang ramah pengguna untuk melakukan packaging, instalasi, dan manajemen kernel
2. **⌨️ minios-kernel (CLI):** Alat baris perintah untuk pengguna tingkat lanjut dan otomatisasi

Kedua alat ini secara otomatis menangani:
- **Packaging kernel** ke dalam format SquashFS
- **Pembuatan initramfs** dengan driver dan skrip boot yang sesuai
- **Instalasi** ke repositori kernel MiniOS
- **Pembaruan konfigurasi bootloader**
- **Aktivasi kernel** dan pengalihan

Halaman ini membahas instalasi live modular. Instalasi native menggunakan paket kernel yang sudah terpasang, GRUB, dan initramfs mereka sendiri; lihat
[Boot modes](/configuration/Boot-Modes.md). Untuk perilaku kernel terkoordinasi secara tepat pada initrd, lihat
[Initrd module loading](/configuration/Initrd-Module-Loading.md).

### ⚠️ **Hal Penting yang Perlu Diperhatikan:**

- **🔑 Hak Akses Administrator:** Kedua alat memerlukan hak administrator dan akan meminta autentikasi melalui PolicyKit
- **🔗 Kompatibilitas Kernel:** Pastikan kernel kompatibel dengan MiniOS. Disarankan menggunakan kernel dari repositori
- **💾 Direktori MiniOS:** Alat akan otomatis mendeteksi direktori MiniOS (`/minios/`) dan memverifikasi izin menulis
- **🔄 Pembaruan Otomatis:** Konfigurasi bootloader akan diperbarui otomatis saat kernel diaktifkan

---

## 🖥️ Metode 1: Menggunakan MiniOS Kernel Manager (GUI)

Manajer kernel grafis menyediakan antarmuka intuitif untuk semua operasi kernel.

### 📝 **Langkah-langkah:**

#### 1. 🚀 **Jalankan Aplikasi**

```bash
minios-kernel-manager
```

Atau cari "MiniOS Kernel Manager" di menu aplikasi Anda.

#### 2. 📦 **Paket Kernel Baru**

**Menggunakan Tab Package Kernel:**

1. **Pilih Sumber Kernel:**
   - **Paket Manual:** Telusuri dan pilih paket kernel `.deb` lokal
   - **Repositori:** Pilih dari kernel yang tersedia di repositori Debian/Ubuntu

2. **Konfigurasi Kompresi:**
   - Pilih kompresi SquashFS: `zstd` (disarankan), `lz4`, `lzo`, `xz`, atau `gzip`

3. **Paket Kernel:**
   - Klik tombol "Package Kernel"
   - Pantau progres di log pemaketan
   - File akan otomatis diinstal ke repositori MiniOS

#### 3. 🔄 **Kelola Kernel Terinstal**

**Menggunakan Tab Manage Kernels:**

1. **Lihat Kernel yang Tersedia:**
   - Lihat semua kernel yang sudah dipaketkan beserta statusnya:
     - **ACTIVE:** Kernel yang sedang dikonfigurasi
     - **RUNNING:** Kernel yang sedang dijalankan
     - **AVAILABLE:** Tersedia untuk diaktifkan

2. **Aktifkan Kernel:**
   - Klik kanan pada kernel lalu pilih "Activate Kernel"
   - Konfirmasi dialog aktivasi
   - Konfigurasi bootloader akan diperbarui otomatis

3. **Hapus Kernel:**
   - Klik kanan pada kernel yang tidak aktif lalu pilih "Delete Kernel"
   - Konfirmasi penghapusan (tidak dapat dibatalkan)

---

## ⌨️ Metode 2: Menggunakan minios-kernel (CLI)

Alat baris perintah menyediakan kemampuan manajemen kernel yang dapat diotomasi melalui skrip.

### ⚠️ **Hak Akses Administrator Diperlukan:**

Alat CLI memerlukan hak akses root dan akan memeriksa secara otomatis. Jalankan perintah dengan `sudo` atau melalui `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### 📝 **Perintah Dasar:**

#### 1. 📋 **Daftar Kernel yang Tersedia**

```bash
sudo minios-kernel list
```

Menampilkan semua kernel yang sudah dipaketkan beserta statusnya.

#### 2. 📦 **Paket Kernel**

**Dari Repositori:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/kernel-output
```

**Dari File .deb Lokal:**
```bash
sudo minios-kernel package --deb /path/to/kernel.deb -o /tmp/kernel-output
```

**Dengan Kompresi Kustom:**
```bash
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 --sqfs-comp lz4 -o /tmp/kernel-output
```

#### 3. 🔄 **Aktifkan Kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. 🗑️ **Hapus Kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. 📊 **Cek Status**

```bash
sudo minios-kernel status
```

Menampilkan status direktori MiniOS dan informasi kernel saat ini.

#### 6. ℹ️ **Tampilkan Informasi Kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Menampilkan informasi detail tentang kernel tertentu termasuk status dan ketersediaannya.

### 🔧 **Opsi Lanjutan CLI:**

#### **Output JSON (untuk scripting):**

```bash
sudo minios-kernel --json list
sudo minios-kernel --json status
sudo minios-kernel --json info
sudo minios-kernel --json package --repo linux-image-6.12.38+deb13-amd64 -o /tmp/output
sudo minios-kernel --json activate 6.12.38+deb13-amd64
sudo minios-kernel --json delete 6.12.38+deb13-amd64
```

#### **Opsi Paket Lanjutan:**

```bash
# Use custom temporary directory (requires at least 1024MB free space)
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --temp-dir /custom/temp

# Force package lists update if outdated
sudo minios-kernel package --repo linux-image-6.12.38+deb13-rt-amd64 -o /tmp/output --force-update
```

#### **Bantuan dan Penggunaan:**

```bash
minios-kernel --help                    # General help (doesn't require root)
sudo minios-kernel package --help       # Package command help
sudo minios-kernel list --help          # List command help
sudo minios-kernel activate --help      # Activate command help
sudo minios-kernel info --help          # Info command help
sudo minios-kernel status --help        # Status command help
sudo minios-kernel delete --help        # Delete command help
```

---

## 🔧 Pemecahan Masalah

### Masalah Umum dan Solusinya:

#### **🚫 Direktori MiniOS Tidak Ditemukan**

- **Penyebab:** Alat tidak dapat menemukan direktori MiniOS
- **Solusi:** Pastikan Anda menjalankan dari sistem MiniOS atau USB drive sudah ter-mount dengan benar
- **Cek:** Jalankan `sudo minios-kernel status` untuk memverifikasi deteksi direktori

#### **🔒 Izin Ditolak**

- **Penyebab:** Direktori MiniOS hanya-baca atau izin tidak cukup
- **Solusi:** Pastikan Anda memiliki hak administrator dan filesystem dapat ditulis
- **Cek:** Verifikasi status direktori MiniOS di GUI atau CLI

#### **📦 Instalasi Paket Gagal**

- **Penyebab:** Paket rusak, masalah jaringan, atau masalah dependensi
- **Solusi:**
  - Verifikasi integritas file paket
  - Periksa koneksi jaringan untuk paket dari repositori
  - Perbarui daftar paket: `sudo apt update`

#### **💥 Kernel Panic Setelah Aktivasi**

- **Penyebab:** Kernel tidak kompatibel atau driver tidak lengkap
- **Solusi:**
  - Ikuti [Boot recovery](/administration/Boot-Recovery.md) untuk memulai media rescue yang kompatibel dan aktifkan set kernel yang sudah terbukti berfungsi
  - Periksa kompatibilitas kernel dengan perangkat keras Anda

#### **🔄 Sistem Boot ke Kernel Lama**

- **Penyebab:** Konfigurasi bootloader belum diperbarui dengan benar
- **Solusi:**
  - Jalankan kembali aktivasi kernel: `sudo minios-kernel activate <version>`
  - Pastikan kernel sudah dipackaging dan diinstal dengan benar

#### **⚠️ Perangkat Keras Tidak Berfungsi Setelah Ganti Kernel**

- **Penyebab:** Driver tidak ada di kernel baru
- **Solusi:**
  - Pastikan file modul kernel SquashFS sudah diinstal
  - Cek apakah kernel baru mendukung perangkat keras Anda
  - Pertimbangkan menggunakan varian kernel lain

#### **🚨 Pemulihan Kernel dari Citra MiniOS Asli**

Jangan melakukan pemulihan dengan menyalin satu gambar kernel, initramfs, atau modul `01-kernel-*.sb` secara individual. Versi yang dapat di-boot memerlukan triplet yang terkoordinasi, dan aktivasi harus memperbarui konfigurasi bootloader sebagai satu operasi yang didukung. Ikuti
[Modular kernel rollback](/administration/Boot-Recovery.md)
untuk menggunakan media rescue yang kompatibel dan mengaktifkan satu set lengkap yang sudah terbukti berfungsi. Jika satu set yang cocok tidak tersedia, lakukan instalasi ulang daripada merangkai aset boot parsial.

### 🔍 **Perintah Diagnostik:**

**Cek Status Sistem Saat Ini:**
```bash
sudo minios-kernel status
sudo minios-kernel info     # Current active kernel info
uname -r                    # Current running kernel
cat /proc/version           # Kernel version details
lsmod                       # Loaded kernel modules
```

**Verifikasi File Kernel:**
```bash
ls -la /minios/kernels/     # List packaged kernels
ls -la /minios/boot/        # List boot files
```

**Cek Konfigurasi Bootloader:**
```bash
grep -r "vmlinuz" /minios/boot/  # Find kernel references in boot configs
```

---

## 📋 Ikhtisar Struktur File

MiniOS Kernel Manager secara otomatis mengelola file-file berikut:

### **Struktur Repositori Kernel:**

```
/minios/
├── 01-kernel-<version>.sb         # Active kernel module
├── kernels/                       # Repository of inactive/alternative kernels
│   └── <version>/
│       ├── 01-kernel-<version>.sb # SquashFS kernel module
│       ├── vmlinuz-<version>      # Kernel image
│       └── initrfs-<version>.img  # Initial RAM filesystem
├── boot/
│   ├── vmlinuz-<version>          # Active kernel binary
│   ├── initrfs-<version>.img      # Active initial RAM filesystem
│   ├── syslinux/
│   │   └── syslinux.cfg           # SYSLINUX bootloader config
│   └── grub/
│       └── grub.cfg               # GRUB bootloader config
```

**Catatan:** Modul standar `01-kernel-<version>.sb` yang disertakan dengan MiniOS berisi driver tambahan di luar yang tersedia pada paket kernel repositori asli. Driver tambahan ini memberikan kompatibilitas perangkat keras yang lebih baik untuk adapter nirkabel dan perangkat penyimpanan.

### **Indikator Status:**

- **AKTIF:** Kernel yang dikonfigurasi di bootloader (akan digunakan saat restart berikutnya)
- **BERJALAN:** Kernel yang sedang dijalankan
- **TERSEDIA:** Sudah dikemas dan siap diaktifkan

### **Operasi Otomatis:**

- ✅ Pengemasan dan kompresi kernel
- ✅ Pembuatan initramfs dengan driver yang sesuai
- ✅ Instalasi ke repository MiniOS
- ✅ Pembaruan konfigurasi bootloader
- ✅ Manajemen symlink untuk kernel aktif
- ✅ Pembersihan file sementara

---

## 🎯 Praktik Terbaik

### **Pemilihan Kernel:**

- Gunakan kernel dari repository resmi Debian/Ubuntu jika memungkinkan
- Uji kernel baru di lingkungan non-produksi terlebih dahulu
- Simpan minimal satu kernel yang sudah terbukti berfungsi untuk pemulihan

### **Sebelum Instalasi:**

- Pastikan direktori MiniOS dapat ditulis
- Pastikan ruang disk cukup (ukuran kernel bisa 100-500MB)
- Perbarui daftar paket untuk kernel repository

### **Setelah Instalasi:**

- Uji kernel baru secara menyeluruh
- Pastikan semua perangkat keras berfungsi dengan baik
- Simpan kernel sebelumnya sebagai cadangan sampai kernel baru terbukti stabil

### **Perencanaan Pemulihan:**

- Selalu simpan satu set triplet kernel yang lengkap dan sudah terbukti berfungsi
- Ketahui cara boot dari media rescue jika diperlukan
- Dokumentasikan kernel mana yang cocok dengan konfigurasi perangkat keras Anda
