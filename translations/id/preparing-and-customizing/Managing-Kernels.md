---
updated: 2026-08-31
program_commits:
    minios-kernel-manager: a5bd09e2d1b2cbb6e44a690bf12047c93bf1a87b
---

# Mengelola kernel

## Mengapa Mengganti Kernel?

MiniOS dilengkapi kernel bawaan, namun ada beberapa alasan mengapa Anda mungkin ingin menggantinya:

### **Beragam Varian Kernel Debian**

Debian menyediakan beberapa varian kernel yang dioptimalkan untuk berbagai kebutuhan:

- **`linux-image-6.12.38+deb13-amd64`** - Kernel standar untuk sistem 64-bit (bawaan di MiniOS)
- **`linux-image-6.12.38+deb13-rt-amd64`** - Kernel real-time untuk aplikasi yang membutuhkan waktu respons sangat cepat
- **`linux-image-6.12.38+deb13-cloud-amd64`** - Dioptimalkan untuk lingkungan cloud dan virtualisasi

> **Catatan:** Nomor versi (seperti `6.12.38+deb13`) dapat berubah sesuai pembaruan. Untuk melihat kernel yang tersedia saat ini:
> ```bash
> apt search linux-image-.*-amd64
> apt search linux-image-.*-rt-amd64
> apt search linux-image-.*-cloud-amd64
> ```

### **Kasus Penggunaan Khusus**

- **Komputasi real-time** - Kernel RT untuk produksi audio, kontrol industri
- **Gaming dan latensi rendah** - Kernel khusus dengan optimasi untuk gaming
- **Penguatan keamanan** - Kernel dengan patch keamanan tambahan (grsecurity, dll.)
- **Kompatibilitas perangkat keras** - Kernel terbaru untuk dukungan perangkat keras terkini
- **Tuning performa** - Kernel hasil kompilasi khusus dengan optimasi tertentu

### **Fitur Kernel Kustom**

- **Patch khusus** - Terapkan patch tertentu untuk perangkat keras atau kebutuhan Anda
- **Modul kernel** - Tambahkan dukungan untuk perangkat keras atau filesystem khusus
- **Optimasi kompilasi** - Bangun kernel dengan flag optimasi berbeda
- **Optimasi ukuran** - Hapus driver yang tidak diperlukan untuk memperkecil ukuran kernel

### **Skenario Umum**

- **Workstation produksi audio** - Gunakan kernel RT untuk latensi audio minimal
- **Sistem gaming** - Terapkan patch dan optimasi khusus gaming
- **Lingkungan server** - Gunakan kernel yang dioptimalkan untuk cloud demi virtualisasi lebih baik
- **Perangkat keras lawas** - Gunakan kernel lama untuk kompatibilitas dengan sistem vintage
- **Sistem pengembangan** - Uji aplikasi pada berbagai versi kernel

---

## Ikhtisar Manajer Kernel MiniOS

MiniOS menyediakan dua alat untuk manajemen kernel:

1. **Manajer Kernel MiniOS (GUI):** Aplikasi grafis yang ramah pengguna untuk melakukan pengemasan, instalasi, dan pengelolaan kernel
2. **minios-kernel (CLI):** Alat baris perintah untuk pengguna tingkat lanjut dan otomasi

Kedua alat ini secara otomatis menangani:
- **Pengemasan kernel** ke dalam format SquashFS
- **Pembuatan initramfs** dengan driver dan skrip boot yang sesuai
- **Instalasi** ke repositori kernel MiniOS
- **Pembaruan konfigurasi bootloader**
- **Aktivasi kernel** dan pergantian kernel

Halaman ini membahas sistem live modular MiniOS. Manajer Kernel MiniOS dan `minios-kernel` tersedia untuk arsitektur live tersebut beserta modul kernel terkoordinasi, `vmlinuz`, dan set initramfs-nya. Setelah konversi native, sistem akan menggunakan alur kerja kernel Debian konvensional; alat kernel live MiniOS akan dihapus karena model kernel modular tidak lagi berlaku, sehingga gunakan paket kernel Debian, alat initramfs, dan bootloader yang telah terpasang. Lihat [Tentang MiniOS](/getting-started/About-MiniOS) dan [Mode Boot](/using-minios/Boot-Modes). Untuk perilaku kernel terkoordinasi pada initrd live secara detail, lihat [Pemrosesan modul initrd](/reference/boot-process/Module-Loading).

### **Hal-hal Penting yang Perlu Diperhatikan:**

- **Hak Administrator:** Kedua alat membutuhkan hak administrator dan akan meminta autentikasi melalui PolicyKit
- **Kompatibilitas Kernel:** Pastikan kernel kompatibel dengan MiniOS. Disarankan menggunakan kernel dari repositori
- **Direktori MiniOS:** Alat akan otomatis mendeteksi direktori MiniOS (`/minios/`) dan memeriksa izin tulis
- **Pembaruan Otomatis:** Konfigurasi bootloader akan diperbarui secara otomatis saat kernel diaktifkan

---

## Metode 1: Menggunakan Manajer Kernel MiniOS (GUI)

Manajer kernel grafis menyediakan antarmuka yang intuitif untuk semua operasi kernel.

### **Langkah-langkah:**

#### 1. **Jalankan Aplikasi**

```bash
minios-kernel-manager
```

Atau cari "Manajer Kernel MiniOS" di menu aplikasi Anda.

#### 2. **Kemasi Kernel Baru**

**Menggunakan Tab Package Kernel:**

1. **Pilih Sumber Kernel:**
   - **Paket Manual:** Telusuri dan pilih paket kernel `.deb` lokal
   - **Repositori:** Pilih dari kernel yang tersedia di repositori Debian/Ubuntu

2. **Atur Kompresi:**
   - Pilih kompresi SquashFS: `zstd` (disarankan), `lz4`, `lzo`, `xz`, atau `gzip`

3. **Kemasi Kernel:**
   - Klik tombol "Package Kernel"
   - Pantau progres pada log pengemasan
   - File akan otomatis diinstal ke repositori MiniOS

#### 3. **Kelola Kernel yang Terpasang**

**Menggunakan Tab Manage Kernels:**

1. **Lihat Kernel yang Tersedia:**
   - Lihat semua kernel yang sudah dikemas beserta statusnya:
     - **ACTIVE:** Kernel yang dikonfigurasi saat ini
     - **RUNNING:** Kernel yang sedang dijalankan
     - **AVAILABLE:** Tersedia untuk diaktifkan

2. **Aktifkan Kernel:**
   - Klik kanan pada kernel lalu pilih "Activate Kernel"
   - Konfirmasi dialog aktivasi
   - Konfigurasi bootloader akan diperbarui secara otomatis

3. **Hapus Kernel:**
   - Klik kanan pada kernel yang tidak aktif lalu pilih "Delete Kernel"
   - Konfirmasi penghapusan (tidak dapat dibatalkan)

---

## Metode 2: Menggunakan minios-kernel (CLI)

Alat baris perintah ini menyediakan kemampuan manajemen kernel yang dapat diotomasi melalui skrip.

### **Hak Administrator Diperlukan:**

Alat CLI ini membutuhkan hak akses root dan akan memeriksanya secara otomatis. Jalankan perintah dengan `sudo` atau melalui `pkexec`:

```bash
sudo minios-kernel list
# or
pkexec minios-kernel activate 6.12.38+deb13-amd64
```

### **Perintah Dasar:**

#### 1. **Daftar Kernel yang Tersedia**

```bash
sudo minios-kernel list
```

Menampilkan semua kernel yang sudah dikemas beserta statusnya.

#### 2. **Kemasi Kernel**

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

#### 3. **Aktifkan Kernel**

```bash
sudo minios-kernel activate 6.12.38+deb13-amd64
```

#### 4. **Hapus Kernel**

```bash
sudo minios-kernel delete 6.12.38+deb13-amd64
```

#### 5. **Periksa Status**

```bash
sudo minios-kernel status
```

Menampilkan status direktori MiniOS dan informasi kernel saat ini.

#### 6. **Tampilkan Informasi Kernel**

```bash
sudo minios-kernel info                           # Information about current active kernel
sudo minios-kernel info 6.12.38+deb13-amd64     # Information about specific kernel
```

Menampilkan informasi detail tentang kernel tertentu termasuk status dan ketersediaannya.

### **Opsi CLI Lanjutan:**

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

## Pemecahan Masalah

### Masalah Umum dan Solusinya:

#### **Direktori MiniOS Tidak Ditemukan**

- **Penyebab:** Alat tidak dapat menemukan direktori MiniOS
- **Solusi:** Pastikan Anda menjalankan dari sistem MiniOS atau USB drive sudah ter-mount dengan benar
- **Cek:** Jalankan `sudo minios-kernel status` untuk memverifikasi deteksi direktori

#### **Permission Denied**

- **Penyebab:** Direktori MiniOS hanya-baca atau izin tidak mencukupi
- **Solusi:** Pastikan Anda memiliki hak administrator dan filesystem dapat ditulis
- **Cek:** Periksa status direktori MiniOS di GUI atau CLI

#### **Instalasi Paket Gagal**

- **Penyebab:** Paket rusak, masalah jaringan, atau masalah dependensi
- **Solusi:**
  - Verifikasi integritas file paket
  - Periksa koneksi jaringan untuk paket dari repositori
  - Perbarui daftar paket: `sudo apt update`

#### **Kernel panic setelah aktivasi**

- **Penyebab:** Kernel tidak kompatibel atau driver hilang
- **Tindakan:** Boot ke sistem MiniOS yang sudah terbukti stabil, amankan data penting, dan pulihkan satu set kernel lengkap yang sudah terbukti stabil jika tersedia. Jika tidak, lakukan instalasi ulang pada instalasi MiniOS yang terdampak. Jangan mencoba memperbaiki sistem dengan mencampur file kernel, initramfs, atau `01-kernel-*.sb` secara individual. Lihat [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

#### **Sistem Boot ke Kernel Lama**

- **Penyebab:** Konfigurasi bootloader tidak diperbarui dengan benar
- **Solusi:**
  - Jalankan ulang aktivasi kernel: `sudo minios-kernel activate <version>`
  - Pastikan kernel sudah dikemas dan diinstal dengan benar

#### **Perangkat Keras Tidak Berfungsi Setelah Ganti Kernel**

- **Penyebab:** Driver tidak tersedia di kernel baru
- **Solusi:**
  - Pastikan file modul kernel SquashFS sudah terpasang
  - Periksa apakah kernel baru mendukung perangkat keras Anda
  - Pertimbangkan menggunakan varian kernel lain

#### **Pemulihan setelah perubahan kernel gagal**

Jangan menyalin image kernel, initramfs, atau modul `01-kernel-*.sb` secara individual dari image lain. Kernel MiniOS yang dapat di-boot memerlukan satu set yang terkoordinasi. Jika satu set lengkap yang sudah terbukti stabil tidak tersedia melalui workflow manajemen kernel, lakukan instalasi ulang pada instalasi MiniOS yang terdampak daripada merakit komponen boot secara manual. Amankan data penting terlebih dahulu; lihat [Troubleshooting](/maintenance-and-recovery/Troubleshooting).

### **Perintah Diagnostik:**

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

## Ikhtisar Struktur Berkas

Manajer Kernel MiniOS secara otomatis mengelola berkas-berkas berikut:

### **Struktur Repository Kernel:**

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

**Catatan:** Modul standar `01-kernel-<version>.sb` yang disertakan dengan MiniOS berisi driver tambahan di luar yang terdapat pada paket kernel repository asli. Driver tambahan ini memberikan kompatibilitas perangkat keras yang lebih baik untuk adaptor nirkabel dan perangkat penyimpanan.

### **Indikator Status:**

- **ACTIVE:** Kernel yang dikonfigurasi di bootloader (akan dijalankan pada restart berikutnya)
- **RUNNING:** Kernel yang sedang berjalan saat ini
- **AVAILABLE:** Sudah dikemas dan siap diaktifkan

### **Operasi Otomatis:**

- Pengemasan dan kompresi kernel
- Pembuatan initramfs dengan driver yang sesuai
- Instalasi ke repository MiniOS
- Pembaruan konfigurasi bootloader
- Manajemen symlink untuk kernel aktif
- Pembersihan berkas sementara

---

## Praktik Terbaik

### **Pemilihan Kernel:**

- Gunakan kernel dari repository resmi Debian/Ubuntu jika memungkinkan
- Uji kernel baru di lingkungan non-produksi terlebih dahulu
- Simpan setidaknya satu kernel yang sudah terbukti berfungsi untuk pemulihan

### **Sebelum Instalasi:**

- Pastikan direktori MiniOS dapat ditulis
- Pastikan ruang disk mencukupi (ukuran kernel bisa 100-500MB)
- Perbarui daftar paket untuk kernel repository

### **Setelah Instalasi:**

- Uji kernel baru secara menyeluruh
- Pastikan semua perangkat keras berfungsi dengan baik
- Simpan kernel sebelumnya sebagai cadangan sampai kernel baru terbukti stabil

### **Perencanaan Pemulihan:**

- Selalu simpan satu set kernel triplet yang sudah terbukti berfungsi
- Ketahui cara boot dari media penyelamatan jika diperlukan
- Dokumentasikan kernel mana saja yang cocok dengan konfigurasi perangkat keras Anda
