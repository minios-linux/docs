# Memulai MiniOS 🌟

Selamat datang di MiniOS, tempat fleksibilitas dan portabilitas Linux bertemu dengan kemudahan dan kenyamanan penggunaan. Jika Anda baru mengenal MiniOS, panduan lengkap ini akan membantu Anda memulai dan memaksimalkan sistem operasi Anda.

## Langkah 1: Pilih Edisi MiniOS yang Tepat 📦

MiniOS menawarkan tiga edisi utama, masing-masing disesuaikan untuk kebutuhan spesifik:

- **🚀 Standar** - Andal untuk tugas komputasi harian
- **🧰 Toolbox** - Toolkit untuk power user dengan utilitas sistem lanjutan
- **⚡ Ultra** - Paket lengkap dengan seluruh fitur

Untuk deskripsi detail fitur dan perangkat lunak yang disertakan di setiap edisi, lihat [Tentang MiniOS](/about/About-MiniOS.md).

**Opsi Unduhan:**
- **Situs Resmi**: [minios.dev](https://minios.dev) - Tinjauan lengkap edisi dan unduhan langsung
- **GitHub Releases**: [Rilis terbaru](https://github.com/minios-linux/minios-live/releases) - Semua versi dan catatan rilis

Untuk rincian paket yang termasuk di setiap edisi, lihat [Daftar Paket](/administration/Packages.md).

## Langkah 2: Buat USB Bootable 🔌

**Metode Instalasi yang Direkomendasikan:**

### 🖥️ **Windows**

- **[Rufus](/installation/tools/Rufus.md)** ⭐ - Sederhana dan andal
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - GUI lintas platform
- **[Ventoy](/installation/tools/Ventoy.md)** ⭐ - Dukungan multi-boot

### 🐧 **Linux**

- **[Perintah dd](/installation/tools/dd.md)** ⭐ - Alat command-line yang cepat
- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - GUI yang ramah pengguna

### 🍎 **macOS**

- **[Balena Etcher](/installation/tools/Balena-Etcher.md)** ⭐ - GUI mudah digunakan
- **[Perintah dd](/installation/tools/dd.md)** ⭐ - Alat terminal bawaan

### 🏠 **Dari MiniOS**

- **[MiniOS Installer](/installation/MiniOS-Installer.md)** - Alat grafis bawaan

**Metode tambahan:** [UNetbootin](/installation/tools/UNetbootin.md), [Drive Utility](/installation/tools/Drive-Utility.md), [Metode Original](/installation/tools/Original-Method.md)

### Kebutuhan Ukuran Drive

- **Standar (787 MB)**: minimum 2 GB
- **Toolbox (1,2 GB)**: minimum 4 GB
- **Ultra (1,7 GB)**: minimum 4 GB
- **Ukuran yang disarankan**: 8 GB atau lebih besar untuk penggunaan nyaman dengan persistensi perubahan

**Catatan Penting:**
- Setiap tautan di atas menyediakan instruksi langkah demi langkah yang detail
- Metode yang direkomendasikan (⭐) telah diuji untuk keandalan dan kemudahan penggunaan
- Pilih metode yang paling sesuai dengan sistem operasi dan tingkat pengalaman Anda

## Langkah 3: Boot dan Jelajahi 🖥️

Setelah boot dari USB, jelajahi lingkungan desktop MiniOS:

**Fitur utama yang bisa ditemukan**:
- Menu aplikasi (panel kiri bawah)
- Pengaturan dan preferensi sistem
- Manajer file (Thunar)
- Aplikasi pra-instal (browser, office suite, utilitas)
- Opsi kustomisasi desktop

Lingkungan desktop default adalah XFCE, menawarkan keseimbangan antara fitur dan performa.

## Langkah 4: Konfigurasi Sistem 🌐

**Atur bahasa sistem, keyboard, zona waktu, dan preferensi lainnya:**

### 🔧 **Menggunakan MiniOS Configurator** (Direkomendasikan)

**Akses:** Menu Aplikasi → Sistem → Konfigurasi MiniOS

**Pengaturan utama yang dapat Anda atur:**
- **🌍 Bahasa & Locale**: Atur bahasa sistem (misal: `en_US.UTF-8`, `ru_RU.UTF-8`, `pt_BR.UTF-8`)
- **⏰ Zona Waktu**: Atur zona waktu Anda (misal: `Europe/Berlin`, `America/New_York`, `Asia/Tokyo`)
- **⌨️ Keyboard**: Atur layout dan opsi pengalihan (misal: `us,ru` dengan toggle `Alt+Shift`)
- **👤 Pengaturan Pengguna**: Ubah username, nama lengkap, dan grup pengguna
- **🔐 Kata Sandi**: Atur kata sandi aman untuk akun user dan root
- **🖥️ Sistem**: Atur hostname, aktif/nonaktifkan layanan
- **🔧 Lanjutan**: Opsi boot dan perilaku sistem

**Cara menggunakan:**
1. Buka MiniOS Configurator dari menu sistem
2. Navigasi melalui tab untuk mengatur berbagai aspek
3. Simpan perubahan Anda
4. **Reboot untuk menerapkan perubahan** - pengaturan berlaku setelah restart dan bertahan di reboot berikutnya

**Catatan teknis:** MiniOS Configurator akan memodifikasi `/etc/live/config.conf`, yaitu file konfigurasi utama MiniOS yang mengatur perilaku sistem saat boot. Untuk informasi detail tentang parameter konfigurasi dan perilakunya, lihat panduan [Configuration File](/configuration/Configuration-File.md).

### 💻 **Alternatif: Konfigurasi Command Line**

**Perubahan langsung (diterapkan saat itu juga):**
```bash
# Set system locale for current session
sudo localectl set-locale LANG=en_US.UTF-8

# Set keyboard layout with switching
sudo localectl set-x11-keymap us,ru pc105 ,dvorak grp:alt_shift_toggle

# Set timezone
sudo timedatectl set-timezone Europe/Berlin

# Change user password
passwd live
```

**Agar perubahan bertahan setelah reboot:** Gunakan MiniOS Configurator atau edit langsung `/etc/live/config.conf`.

### 📋 **Opsi Konfigurasi Lainnya**

- **Edit file langsung**: Edit `/etc/live/config.conf` secara manual untuk pengguna tingkat lanjut
- **Setup saat boot**: Gunakan [Boot Parameters](/configuration/Boot-Parameters.md) untuk mengatur sistem sebelum mulai
- **Panduan file konfigurasi**: Lihat [Configuration File](/configuration/Configuration-File.md) untuk referensi config.conf secara detail
- **Pra-instalasi**: Konfigurasi sebelum instalasi dengan [MiniOS Installer](/installation/MiniOS-Installer.md)

**Penting:** Perubahan pada `/etc/live/config.conf` (melalui MiniOS Configurator atau edit manual) memerlukan reboot agar berlaku. Alat command line seperti `localectl` dan `timedatectl` akan langsung menerapkan perubahan, namun bisa jadi tidak bertahan setelah reboot tanpa konfigurasi yang tepat.

## Langkah 5: Instalasi Perangkat Lunak 🔄

MiniOS menyediakan beberapa cara untuk menginstal perangkat lunak:

### 📦 **APT Package Manager**

Manajemen paket Debian dasar - gunakan `man apt` untuk referensi perintah secara detail.

### 🔄 **Sistem Modul**

Modul SquashFS lanjutan untuk perangkat lunak yang persisten - lihat panduan [Membuat Modul](/development/Creating-Modules.md).

**Perbedaan utama:** Instalasi APT membutuhkan persistensi agar bertahan setelah reboot, sedangkan modul otomatis persisten.

## Langkah 6: Persistensi Data 💾

**Kabar baik:** MiniOS secara otomatis mengatur persistensi data saat instalasi! File, pengaturan, dan instalasi perangkat lunak Anda akan otomatis tersimpan.

### Cara Kerjanya

- **Setup Otomatis**: Semua metode instalasi secara otomatis membuat persistensi
- **Deteksi Cerdas**: Sistem memilih mode persistensi optimal sesuai filesystem drive Anda
- **Portabel**: Data Anda ikut berpindah bersama USB drive

### Konfigurasi Lanjutan

Untuk pengaturan persistensi kustom, lihat panduan [Configuration File](/configuration/Configuration-File.md) dan referensi [Boot Parameters](/configuration/Boot-Parameters.md) secara detail.

## Langkah 7: Pengaturan Keamanan 🔐

### 👤 **Akun Default**

- **User**: `live` / `evil`
- **Root**: `root` / `toor`

### 🔒 **Langkah Keamanan Penting**

1. **Segera ganti kata sandi** - Kredensial default sudah diketahui publik
2. **Gunakan kata sandi yang kuat dan unik** untuk semua akun

### Metode Konfigurasi Kata Sandi

- **🔧 Direkomendasikan**: Gunakan **MiniOS Configurator** (Menu Aplikasi → Sistem → Konfigurasi MiniOS → tab User)
- **💻 Command Line**: `passwd live` dan `sudo passwd root`
- **📋 Lanjutan**: Lihat panduan [Security Hardening](/administration/Security-Hardening.md) untuk pengaturan keamanan detail

⚠️ **Jangan pernah gunakan kredensial default pada sistem yang terhubung jaringan!**

## Langkah 8: Kustomisasi & Topik Lanjutan 🛠️

### 🎨 **Kustomisasi Dasar**

- Tema desktop dan wallpaper melalui Pengaturan
- Tata letak panel dan preferensi aplikasi
- Pintasan keyboard dan pengaturan sistem

### 🚀 **Konfigurasi Lanjutan**

- **Boot Parameters**: [Referensi lengkap](/configuration/Boot-Parameters.md) untuk tuning sistem
- **Performa**: [Panduan optimasi](/administration/Performance-Optimization.md) untuk kecepatan lebih baik
- **Hardware**: [Panduan kompatibilitas](/installation/Hardware-Compatibility.md) untuk dukungan perangkat

### 🔧 **Fitur Power User**

- **Custom Builds**: [Membangun MiniOS](/development/Building-MiniOS.md) dari source
- **Pembuatan Modul**: Pengembangan [modul lanjutan](/development/Creating-Modules.md)
- **Rebuild ISO**: [Merepak sistem live](/development/Rebuilding-ISO.md) menjadi ISO bootable
- **Update Kernel**: Panduan [manajemen kernel](/administration/Kernel-Management.md)

## Bantuan & Sumber Daya Komunitas 💬

### 📚 **Dokumentasi**

- **Situs Resmi**: [minios.dev](https://minios.dev) - Berita terbaru dan unduhan
- **Semua Panduan**: Tersedia di koleksi dokumentasi ini

### 🐛 **Dukungan & Masalah**

- **Laporan Bug**: [GitHub Issues](https://github.com/minios-linux/minios-live/issues)
- **Source Code**: [GitHub Repository](https://github.com/minios-linux/minios-live)

### 📖 **Belajar Lebih Lanjut**

- **Dokumentasi Debian**: [www.debian.org/doc](https://www.debian.org/doc/) - Karena MiniOS berbasis Debian
- **Dasar Linux**: Tutorial Linux umum berlaku untuk MiniOS

## Selamat Datang di MiniOS! 🎉

Sekarang Anda sudah memiliki semua yang dibutuhkan untuk mulai menggunakan MiniOS. Sistem ini menggabungkan kekuatan Linux dengan portabilitas yang praktis - sempurna untuk pemulihan sistem, komputasi portabel, atau penggunaan harian.

**Langkah selanjutnya:** Pilih edisi Anda, buat USB drive, dan mulai eksplorasi! 🚀
