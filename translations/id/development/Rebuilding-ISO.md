# Membangun Ulang ISO

Panduan ini menjelaskan cara membangun ulang dan menyesuaikan citra ISO MiniOS menggunakan alat bawaan. Baik Anda ingin membuat versi ringan, menambahkan perangkat lunak khusus, atau mendistribusikan sistem yang telah dikustomisasi, alat ini memudahkan Anda untuk mengemas ulang sistem live Anda menjadi ISO bootable baru.

## Ikhtisar

MiniOS menyediakan alat yang kuat untuk membangun ulang citra ISO langsung dari sistem live yang sedang berjalan. Ini memungkinkan Anda untuk:

- **Menghapus perangkat lunak yang tidak diinginkan** untuk membuat distribusi yang lebih ringan
- **Menambahkan modul khusus** dengan perangkat lunak tambahan
- **Membuat versi khusus** untuk kebutuhan spesifik
- **Mendistribusikan sistem yang telah dikustomisasi** ke pengguna lain
- **Membuat media instalasi** dengan konfigurasi Anda saat ini

## Mulai Cepat

Cara termudah untuk membuat ISO dari sistem Anda saat ini:

```bash
sudo sb2iso
```

Ini akan membuat `minios-YYYYMMDD_HHMM.iso` di direktori Anda saat ini dengan semua modul yang sedang dimuat.

## Alat Utama: sb2iso

**sb2iso** adalah alat utama untuk membangun ulang citra ISO. Alat ini membaca sistem live Anda saat ini dan mengemasnya menjadi file ISO bootable.

### Penggunaan Dasar

```bash
# Create ISO with default name
sudo sb2iso

# Create ISO with custom name
sudo sb2iso --name my_custom_minios.iso

# Create ISO excluding specific modules
sudo sb2iso --exclude 'firefox|libreoffice' --name minios_lite.iso

# Add extra modules to the ISO
sudo sb2iso extra_module.sb development_tools.sb --name minios_extended.iso
```

### Opsi Perintah

| Opsi | Deskripsi | Contoh |
|--------|-------------|---------|
| `-e, --exclude REGEX` | Mengecualikan file/modul yang sesuai pola | `--exclude 'firefox\|games'` |
| `-n, --name NAME` | Menentukan nama file keluaran | `--name minios_custom.iso` |
| `--menu TYPE` | Mengatur bahasa atau tipe menu | `--menu ru_RU` atau `--menu multilang` |
| `--help` | Menampilkan informasi bantuan | `--help` |
| `--version` | Menampilkan versi | `--version` |

### Tipe Menu yang Didukung

- **multilang** (default) - Menu multi-bahasa dengan pilihan bahasa
- **Kode bahasa** - Menu satu bahasa: `en_US`, `ru_RU`, `de_DE`, `es_ES`, `it_IT`, `id_ID`, `pt_BR`, `pt_PT`, `fr_FR`

## Contoh Praktis

### Membuat Versi Ringan

**Hapus aplikasi berat:**
```bash
sudo sb2iso --exclude 'firefox|libreoffice|gimp|thunderbird' --name minios_light.iso
```

**Buat sistem hanya mode teks:**
```bash
sudo sb2iso --exclude 'desktop|xorg|apps|firefox' --name minios_minimal.iso
```

**Hapus aplikasi multimedia:**
```bash
sudo sb2iso --exclude 'vlc|audacity|multimedia' --name minios_office.iso
```

### Menambahkan Perangkat Lunak Khusus

**Tambahkan alat pengembangan:**
```bash
# First create a development module (see Creating Modules guide)
apt2sb install -l 5 gcc g++ make git python3-dev -n 06-development.sb

# Then include it in the ISO
sudo sb2iso 06-development.sb --name minios_dev.iso
```

**Tambahkan aplikasi game:**
```bash
# Create and add a games module
sudo sb2iso games.sb entertainment.sb --name minios_gaming.iso
```

### ISO Khusus Bahasa

**Buat ISO lokal Rusia:**
```bash
sudo sb2iso --menu ru_RU --name minios_ru.iso
```

**Buat ISO Jerman:**
```bash
sudo sb2iso --menu de_DE --name minios_de.iso
```

### Distribusi Profesional/Pendidikan

**ISO edukasi dengan alat pembelajaran:**
```bash
sudo sb2iso educational_software.sb science_tools.sb --exclude 'games|entertainment' --name minios_education.iso
```

**ISO bisnis:**
```bash
sudo sb2iso office_suite.sb accounting_tools.sb --exclude 'games|multimedia' --name minios_business.iso
```

## Alur Kustomisasi Lanjutan

### 1. Siapkan Sistem Anda

Mulai dengan sistem MiniOS yang bersih dan sesuaikan:

```bash
# Install additional software
sudo apt update
sudo apt install your-packages

# Configure settings
# Edit configuration files
# Set up user preferences
```

### 2. Buat Modul Khusus

Simpan perubahan Anda sebagai modul:

```bash
# Save all system changes
sudo savechanges my_customizations.sb

# Or create specific modules
sudo apt2sb install package1 package2 -n 05-extra-tools.sb
```

### 3. Uji Modul Anda

Sebelum membuat ISO final, uji modul Anda:

```bash
# Activate module to test
sudo sb activate my_customizations.sb

# Test functionality
# If issues found, deactivate and fix
sudo sb deactivate my_customizations.sb
```

### 4. Buat ISO Final

```bash
# Create ISO with your customizations
sudo sb2iso my_customizations.sb 05-extra-tools.sb --name my_distribution.iso
```

## Bekerja dengan Modul

### Memahami Nomor Modul

Modul dimuat berdasarkan urutan angka:
- **00-core** - Sistem dasar (selalu disertakan)
- **01-kernel** - Kernel dan driver
- **02-firmware** - Firmware perangkat keras
- **03-gui-base** - Komponen GUI dasar
- **04-desktop** - Lingkungan desktop
- **05-apps** - Aplikasi
- **06+** - Modul tambahan

### Perintah Manajemen Modul

```bash
# List active modules
sudo sb list

# Examine module contents
sudo sb2dir module.sb
ls module.sb/
sudo rmsbdir module.sb

# Convert directory to module
sudo dir2sb my_directory/ my_module.sb

# Save current system changes
sudo savechanges my_changes.sb
```

## Pengecualian Pola Konten

Opsi `--exclude` menggunakan regular expression untuk mencocokkan path file. Pola umum:

### Pengecualian Aplikasi

```bash
# Web browsers
--exclude 'firefox|chromium|browser'

# Office suites
--exclude 'libreoffice|office'

# Multimedia
--exclude 'vlc|media|audio|video'

# Games
--exclude 'games|play'

# Development tools
--exclude 'gcc|development|ide'
```

### Pengecualian Komponen Sistem

```bash
# GUI components
--exclude 'desktop|xorg|gui'

# Firmware
--exclude 'firmware'

# Documentation
--exclude 'doc|man|help'

# Language packs
--exclude 'locale|lang'
```

### Pengecualian Gabungan

```bash
# Create minimal system
--exclude 'desktop|xorg|apps|firefox|firmware'

# Remove multimedia and games
--exclude 'multimedia|games|vlc|audio|video'

# Keep only core and basic tools
--exclude 'firefox|libreoffice|games|multimedia|development'
```

## Persyaratan Sistem

### Menjalankan sb2iso

- **Sistem**: Harus dijalankan dari sistem live MiniOS
- **Hak Akses**: Membutuhkan akses root (`sudo`)
- **Memori**: RAM cukup untuk file sementara
- **Penyimpanan**: Ruang kosong untuk output ISO (biasanya 1-4 GB)

### Persyaratan File Boot

**sb2iso** membutuhkan file boot tersedia. Jika Anda memuat sistem ke RAM, gunakan:

```bash
# Boot with full RAM copy
toram=full
```

Atau pastikan file boot dapat diakses di media asli.

## Pemecahan Masalah

### Masalah Umum

**"Tidak dapat menemukan direktori sumber MiniOS"**
- Pastikan Anda menjalankan di sistem live MiniOS
- Periksa apakah file boot tersedia
- Coba gunakan parameter boot `toram=full`

**"File yang dibutuhkan tidak ditemukan"**
- File boot mungkin hilang
- Pastikan Anda menggunakan sistem MiniOS yang lengkap

**Pembuatan ISO gagal**
- Periksa ruang disk yang tersedia
- Pastikan Anda memiliki izin menulis
- Pastikan tidak ada file yang digunakan selama pembuatan

**Modul tidak disertakan**
- Periksa file modul ada dan dapat dibaca
- Pastikan format modul (.sb files)
- Pastikan ruang cukup untuk semua modul

### Informasi Debug

Aktifkan output verbose untuk pemecahan masalah:

```bash
# Check system status
sudo sb list
df -h
ls -la /run/initramfs/memory/

# Test module loading
sudo sb activate test_module.sb
sudo sb deactivate test_module.sb
```

## Praktik Terbaik

### Merencanakan ISO Anda

1. **Mulai Bersih**: Mulai dengan sistem MiniOS yang baru
2. **Uji Secara Menyeluruh**: Validasi semua kustomisasi sebelum membuat ISO
3. **Dokumentasikan Perubahan**: Catat semua modifikasi yang dilakukan
4. **Pertimbangan Ukuran**: Pantau ukuran ISO untuk kebutuhan distribusi

### Organisasi Modul

1. **Pengelompokan Logis**: Kelompokkan perangkat lunak terkait dalam modul
2. **Penomoran yang Tepat**: Gunakan nomor modul yang sesuai
3. **Pengujian**: Uji setiap modul secara terpisah
4. **Dependensi**: Pahami dependensi antar modul

### Persiapan Distribusi

1. **Konvensi Penamaan**: Gunakan nama ISO yang deskriptif
2. **Dokumentasi**: Sertakan petunjuk penggunaan
3. **Dukungan Bahasa**: Pertimbangkan pengguna internasional
4. **Optimasi Ukuran**: Hapus komponen yang tidak diperlukan

## Integrasi dengan Alat Lain

### Membuat Modul Khusus

Sebelum membangun ulang ISO, Anda dapat membuat modul khusus:

- **apt2sb** - Membuat modul dari instalasi paket
- **script2sb** - Membuat modul menggunakan skrip khusus
- **chroot2sb** - Membuat modul secara interaktif
- **savechanges** - Menyimpan modifikasi sistem saat ini

Lihat panduan [Membuat Modul](/development/Creating-Modules.md) untuk instruksi detail.

### Membangun dari Sumber

Untuk kustomisasi penuh, pertimbangkan membangun dari source:

- **minios-live** - Membangun sistem lengkap dari awal
- **minios-cmd** - Antarmuka build yang disederhanakan

Lihat panduan [Membangun MiniOS](/development/Building-MiniOS.md) untuk build dari source.

## Kesimpulan

Alat membangun ulang ISO di MiniOS menyediakan cara yang kuat untuk menyesuaikan dan mendistribusikan ulang sistem Linux. Baik Anda membuat distribusi khusus, menghapus perangkat lunak yang tidak diinginkan, atau menambahkan fungsionalitas khusus, alat ini memudahkan Anda mengemas sistem live menjadi citra ISO profesional.

Mulailah dengan kustomisasi sederhana dan secara bertahap beralih ke distribusi yang lebih kompleks seiring Anda semakin memahami sistem modul dan opsi yang tersedia.
