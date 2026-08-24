# MiniOS Store

MiniOS Store menyediakan katalog resep aplikasi di [store.minios.dev](https://store.minios.dev). Di MiniOS, resep-resep ini dapat diinstal langsung ke sistem yang sedang berjalan atau digunakan untuk membangun satu atau lebih modul SquashFS (`.sb`).

Menjelajahi katalog tidak memerlukan server lokal. Namun, instalasi membutuhkan: antarmuka web akan terhubung ke daemon MiniOS Store lokal atau membuka handler URI `minios-store://` yang sudah terpasang.

## Sebelum menginstal

Buka detail aplikasi dan tinjau informasi berikut sebelum menambahkannya ke keranjang:

- Nama paket dan metode instalasi.
- Skrip instalasi, jika tersedia.
- Halaman utama aplikasi dan informasi pengembang.
- Apakah resep akan mengunduh paket Debian terpisah.

Resep dapat menginstal paket APT, mengunduh paket Debian, atau menjalankan skrip shell. Proses instalasi dijalankan dengan hak akses root. Perlakukan resep dan setiap unduhan atau repositori yang digunakan sebagai kode yang memiliki hak istimewa.

## Menginstal aplikasi

1. Buka MiniOS Store dari menu aplikasi. Peluncur akan memeriksa `https://store.minios.dev` dan membukanya di browser default.
2. Cari atau jelajahi berdasarkan kategori, buka detail aplikasi, dan periksa paket atau skripnya.
3. Tambahkan satu atau lebih aplikasi ke keranjang.
4. Pada sesi MiniOS live, pilih `Module` atau `System`. Sistem MiniOS yang diinstal secara native akan otomatis menggunakan mode `System`.
5. Untuk beberapa aplikasi dalam mode modul, pilih satu modul gabungan atau modul terpisah. Modul gabungan juga dapat diberi nama khusus.
6. Pilih `Install` dan ikuti perkembangan serta output perintahnya. Halaman akan menggunakan daemon lokal jika statusnya `Connected`; jika tidak, akan mencoba handler URI dan mungkin menampilkan prompt autentikasi PolicyKit.

Hanya satu batch instalasi daemon yang dapat berjalan dalam satu waktu. Menutup dialog progres tidak selalu menghentikan instalasi daemon; buka kembali indikator instalasi untuk melihatnya atau batalkan secara eksplisit.

## Mode modul dan sistem

### Mode modul

Mode modul menjalankan `apt2sb` atau `script2sb` dalam lingkungan pembuatan modul yang terisolasi. Hasil file `.sb` akan ditulis ke lokasi yang dapat ditulis pertama di bawah ini:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Path pertama adalah direktori modul pada media boot MiniOS saat ini. Modul yang dibuat di sana tidak akan diaktifkan pada sesi saat ini oleh MiniOS Store. Biarkan modul di direktori tersebut dan reboot untuk memuatnya pada boot berikutnya. Hasilnya hanya tersedia jika media boot yang digunakan dapat ditulis dan file tetap ada.

Path kedua adalah fallback yang digunakan jika direktori modul normal tidak dapat ditulis. Modul di direktori fallback tidak otomatis menjadi bagian dari live boot berikutnya. Gunakan `Open folder`, lalu salin modul yang sudah selesai ke direktori `minios/modules` di media boot MiniOS yang dapat ditulis sebelum reboot.

Modul gabungan berisi semua resep yang dipilih. Dengan pengemasan terpisah, kegagalan dapat memengaruhi satu resep sementara modul yang sudah selesai sebelumnya tetap ada di direktori target.

### Mode sistem

Mode sistem menggunakan APT atau skrip resep secara langsung pada root filesystem yang sedang berjalan. Perubahan langsung berlaku pada sistem saat ini, bukan menghasilkan modul. Pada sesi live, apakah perubahan tersebut bertahan setelah reboot bergantung pada konfigurasi persistensi sesi. Pada sistem yang diinstal secara native, MiniOS Store selalu menggunakan mode sistem.

Mode sistem tidak bersifat transaksional. Operasi yang gagal atau dibatalkan dapat meninggalkan paket, status repositori, atau file yang telah diubah oleh perintah sebelumnya.

## Layanan lokal dan batas kepercayaan

Layanan `minios-store` berjalan sebagai root karena pembuatan modul dan instalasi paket langsung memerlukan operasi mount, overlay, chroot, APT, dan dpkg. Secara default, layanan ini hanya mendengarkan di `ws://127.0.0.1:8765`. Antarmuka web yang dihosting mengirimkan data resep lengkap, termasuk skrip dan URL unduhan, ke layanan lokal ini.

Daemon memvalidasi bentuk permintaan dan metode instalasi yang didukung, namun tidak secara independen melakukan autentikasi atau menandatangani payload resep. Halaman yang dapat mengakses endpoint WebSocket lokal dapat meminta pekerjaan instalasi dengan hak istimewa. Oleh karena itu:

- Biarkan daemon tetap terikat pada `127.0.0.1`. Jangan buka port `8765` ke LAN atau internet.
- Jangan atur `MINIOS_STORE_HOST` ke alamat non-loopback kecuali ada batas keamanan tambahan yang sudah ditinjau.
- Gunakan situs Store resmi HTTPS dan periksa resep sebelum instalasi.
- Hentikan atau nonaktifkan layanan jika instalasi berbasis browser tidak diperlukan.

Kelola layanan systemd dengan:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Handler URI adalah jalur terpisah. Handler ini akan menjalankan installer GTK melalui PolicyKit dan tidak memerlukan daemon WebSocket. Entri URI saat ini diinterpretasikan sebagai nama paket APT dengan level modul dan pengaturan kompresi yang diminta. Installer akan berjalan setelah otorisasi, jadi periksa permintaan browser sebelum menerima prompt autentikasi.

## Pembatalan

Pilih `Cancel` pada dialog progres web atau `Cancel installation` pada installer GTK. Pembatalan akan menandai batch sebagai dibatalkan dan menghentikan proses anak yang sedang berjalan. Resep yang tersisa tidak akan dijalankan.

Pembatalan bukanlah rollback. Paket atau modul yang sudah selesai sebelumnya tetap ada, dan perintah yang terputus saat APT, dpkg, skrip, unduhan, atau pembuatan modul dapat meninggalkan status sebagian atau file output yang tidak lengkap. Setelah pembatalan:

1. Baca log instalasi terakhir.
2. Periksa direktori modul target untuk file yang tidak terduga atau berukuran nol.
3. Untuk mode sistem, jalankan `sudo dpkg --audit` dan perbaiki konfigurasi paket jika diperlukan.
4. Hapus hanya artefak yang sudah Anda identifikasi sebagai milik operasi yang dibatalkan.

## Pemecahan masalah

### Store sedang offline

Periksa akses jaringan ke `https://store.minios.dev`. Status `Offline` juga berarti browser tidak terhubung ke daemon WebSocket lokal; instalasi masih dapat dilakukan melalui handler URI jika `minios-store-gui` sudah terpasang.

### Browser tidak dapat terhubung ke daemon

Periksa layanan dan log-nya:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Endpoint normal adalah `ws://127.0.0.1:8765`. Konflik port, layanan yang berhenti, `python3-websockets` yang hilang, atau pembatasan browser dapat mencegah koneksi. Merestart browser tidak memperbaiki daemon yang sudah berhenti.

### Autentikasi gagal atau tidak muncul prompt

Installer URI memerlukan PolicyKit, `pkexec`, dan agen autentikasi desktop yang aktif. Jalankan installer dari sesi grafis yang aktif dan pastikan `minios-store-gui` sudah terpasang. Jangan mengakali prompt dengan membuka akses daemon root melalui jaringan.

### Pembuatan modul gagal

Perluas log instalasi dan gunakan pesan error perintah terakhir, bukan hanya ringkasannya. Penyebab umum meliputi paket yang tidak tersedia, kegagalan repositori atau DNS, ruang kosong yang tidak cukup, alat kompresi yang tidak didukung, dan direktori modul yang hanya-baca. Daemon akan melaporkan saat beralih ke `/var/lib/minios-store/modules`.

### Aplikasi tidak muncul setelah instalasi

Untuk mode modul, reboot setelah memastikan file `.sb` ada di direktori `minios/modules` pada media boot. File yang tertinggal di direktori fallback tidak akan dimuat secara otomatis. Untuk mode sistem pada sesi live, pastikan sesi bersifat persisten jika aplikasi hilang setelah reboot.

### Instalasi sistem yang dibatalkan membuat dpkg tidak selesai

Periksa status paket sebelum mencoba lagi:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Tinjau perubahan APT yang diusulkan sebelum mengonfirmasi operasi perbaikan tambahan apa pun.

## Dokumentasi terkait

- [Membuat modul](/development/Creating-Modules.md)
- [Membangun ulang ISO](/development/Rebuilding-ISO.md)
