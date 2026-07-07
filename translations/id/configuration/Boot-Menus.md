# Panduan Menu Boot MiniOS

MiniOS menyediakan sistem menu boot yang canggih, memungkinkan Anda memilih cara sistem dijalankan dan beroperasi. Panduan ini menjelaskan opsi boot yang tersedia dan cara menyesuaikannya.

## Ringkasan

MiniOS menggunakan GRUB sebagai bootloader utama, menyediakan antarmuka grafis dengan dukungan multibahasa. Pada sistem BIOS lama, SYSLINUX dapat digunakan sebagai alternatif. Kedua bootloader menawarkan fungsionalitas yang sama dengan tampilan antarmuka yang sedikit berbeda.

## Opsi Menu Boot

### 1. Lanjutkan Sesi Sebelumnya

**Fungsinya:** Mencoba melanjutkan dari sesi terakhir Anda, namun akan menyesuaikan secara otomatis berdasarkan media penyimpanan yang tersedia.

- **Kapan digunakan:** Ini adalah opsi default - cocok untuk sebagian besar pengguna dalam berbagai situasi
- **Yang terjadi:** 
  - **Pada media yang dapat ditulis dengan sesi yang ada:** Mengembalikan file, aplikasi, dan pengaturan yang telah Anda simpan
  - **Pada media yang dapat ditulis tanpa sesi:** Secara otomatis membuat sesi pertama (sesi #1)
  - **Pada media hanya-baca (DVD, CD):** Berjalan seperti "Mulai Baru" karena tidak ada penyimpanan yang tersedia
  - **Jika sesi tidak kompatibel:** Membuat sesi baru (misal, saat menggunakan versi MiniOS yang berbeda)
  - Sistem secara otomatis menangani pemeriksaan kompatibilitas dan keterbatasan penyimpanan
- **Hasil:** Anda selalu mendapatkan sistem yang berfungsi, dioptimalkan sesuai tipe penyimpanan Anda

### 2. Mulai Sesi Baru

**Fungsinya:** Membuat ruang kerja baru tanpa menghapus sesi yang sudah ada.

- **Kapan digunakan:** Ketika Anda ingin memulai dari awal untuk pekerjaan atau pengujian yang berbeda
- **Yang terjadi:**
  - Membuat sesi baru dengan nomor urut (misal, jika Anda sudah punya sesi 1, akan dibuat sesi 2)
  - Memulai dengan lingkungan desktop yang bersih
  - Semua perubahan baru akan disimpan pada sesi baru
  - Semua sesi yang sudah ada tetap utuh dan dapat dipilih kapan saja
- **Catatan:** Anda dapat berpindah antar sesi menggunakan opsi "Pilih sesi saat startup"

### 3. Pilih Sesi Saat Startup

**Fungsinya:** Menampilkan menu interaktif untuk memilih dari sesi yang sudah ada atau membuat sesi baru.

- **Kapan digunakan:** Jika Anda memiliki beberapa sesi dan ingin memilih yang akan digunakan
- **Yang terjadi:**
  - Menampilkan kotak dialog saat startup dengan daftar sesi yang tersedia
  - Menampilkan informasi sesi (nomor, waktu akses terakhir, penggunaan disk)
  - Opsi untuk melanjutkan sesi yang ada atau memulai sesi baru
  - Memungkinkan memilih perangkat penyimpanan berbeda jika tersedia lebih dari satu
- **Keuntungan:** Kontrol penuh untuk memilih sesi, ideal bagi pengguna yang mengelola banyak workspace

### 4. Mulai Baru

**Fungsinya:** Menjalankan MiniOS tanpa menyimpan perubahan apa pun.

- **Kapan digunakan:** 
  - Mencoba sistem pada media yang dapat ditulis tanpa mempengaruhi sesi yang sudah ada
  - Troubleshooting tanpa mengubah data yang tersimpan
  - Privasi maksimal (tidak ada data yang disimpan)
  - Ketika Anda ingin memastikan tidak ada perubahan yang bersifat permanen
- **Yang terjadi:**
  - Waktu boot tercepat
  - Semua perubahan akan hilang saat Anda mematikan komputer
  - Tidak ada akses ke perangkat penyimpanan untuk penyimpanan data
- **Catatan:** Jika dijalankan dari media hanya-baca (DVD, CD), "Lanjutkan Sesi Sebelumnya" secara otomatis berperilaku seperti "Mulai Baru" karena tidak ada penyimpanan yang tersedia untuk sesi

### 5. Salin ke RAM

**Fungsinya:** Memuat seluruh sistem ke dalam memori komputer untuk performa maksimal.

- **Kapan digunakan:**
  - Anda memiliki RAM yang cukup (disarankan 4GB+)
  - Ingin performa secepat mungkin
  - Perlu melepas USB drive setelah booting
  - Bekerja dengan aplikasi yang intensif
- **Yang terjadi:**
  - Semua file sistem disalin ke RAM saat boot
  - USB drive dapat dilepas setelah proses loading selesai
  - Sistem berjalan sepenuhnya dari memori
  - Respon tercepat untuk semua operasi
- **Syarat:** RAM yang cukup untuk menampung seluruh sistem

Untuk opsi lanjutan `toram` dan teknik optimasi memori, lihat **[Optimasi Performa](/administration/Performance-Optimization.md)**.

## Cara Menggunakan Menu Boot

### Navigasi Menu

- Gunakan **tombol panah** untuk berpindah antar opsi
- Tekan **Enter** untuk memilih opsi
- Tekan **Esc** untuk kembali ke menu sebelumnya (di GRUB)
- Menu akan otomatis memilih opsi default setelah 10 detik

### Pemilihan Bahasa (GRUB)

Jika USB MiniOS Anda mendukung banyak bahasa:
1. Layar pertama akan menampilkan opsi bahasa
2. Pilih bahasa yang Anda inginkan
3. Menu boot akan muncul dalam bahasa yang dipilih
4. Semua pesan sistem selanjutnya akan menggunakan bahasa ini

⚠️ **Penting:** Menu multibahasa akan menimpa pengaturan locale yang ditentukan di `config.conf`. Bahasa yang dipilih di menu boot akan menjadi prioritas dibanding pengaturan locale yang sudah dikonfigurasi sebelumnya. Lihat **[Configuration File](/configuration/Configuration-File.md)** dan **[live-config](/configuration/live-config.md)** untuk detail tentang file konfigurasi sistem.

## Kustomisasi Opsi Boot

### Mengedit Parameter Boot Sementara

Anda dapat mengubah opsi boot untuk satu kali sesi boot:

**Di GRUB:**
1. Pilih opsi menu yang ingin Anda ubah
2. Tekan **'e'** untuk mengedit
3. Arahkan ke baris yang diawali dengan `linux`
4. Tambahkan atau ubah parameter di akhir baris
5. Tekan **Ctrl+X** atau **F10** untuk boot dengan perubahan Anda

**Di SYSLINUX:**
1. Pilih opsi menu yang diinginkan
2. Tekan **Tab** sebelum menekan Enter
3. Tambahkan parameter pada command line yang muncul
4. Tekan **Enter** untuk boot

### Modifikasi Parameter Boot yang Umum

- `debug` - Menampilkan pesan boot detail (berguna untuk troubleshooting)
- `toram=trim` - Salin hanya file penting ke RAM (jika `toram` penuh memakan terlalu banyak memori)
- `perchsize=2000` - Atur ukuran penyimpanan sesi menjadi 2GB (sesuaikan sesuai kebutuhan)
- `locale=ru_RU.UTF-8` - Paksa penggunaan bahasa/locale tertentu

Untuk daftar lengkap parameter boot yang tersedia, lihat **[Boot Parameters](/configuration/Boot-Parameters.md)**.

## Lokasi File Konfigurasi

### Pada USB Drive MiniOS Anda

- **Konfigurasi GRUB:** `/minios/boot/grub/grub.cfg`
- **Konfigurasi SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot images:** `/minios/boot/bootlogo.png`
- **File bahasa:** `/minios/boot/grub/locale/`

### Pada Sistem yang Sedang Berjalan

- **Parameter boot saat ini:** `/proc/cmdline`
- **Direktori data MiniOS:** `/run/initramfs/memory/data/minios/`

### Mengedit File Konfigurasi

⚠️ **Peringatan:** Hanya edit file konfigurasi boot jika Anda benar-benar memahami apa yang Anda lakukan. Perubahan yang salah dapat membuat USB drive Anda tidak bisa booting.

**Untuk mengedit konfigurasi GRUB:**
1. Mount USB MiniOS Anda
2. Masuk ke `/minios/boot/grub/`
3. Edit `grub.cfg` dengan text editor
4. Simpan dan eject USB drive dengan aman

**Perubahan umum:**
- Ubah `set timeout=10` untuk mengatur waktu tunggu menu
- Ubah `set default=0` untuk mengatur opsi menu default
- Tambahkan entri menu kustom
