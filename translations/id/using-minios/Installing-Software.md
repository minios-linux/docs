---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Menginstal perangkat lunak

Toko Aplikasi MiniOS menyediakan katalog resep aplikasi di [store.minios.dev](https://store.minios.dev). Dalam lingkungan langsung MiniOS, resep-resep tersebut dapat diinstal langsung ke sistem yang sedang berjalan atau digunakan untuk membangun satu atau lebih modul SquashFS (`.sb`).

Halaman ini menjelaskan alur kerja perangkat lunak langsung MiniOS. Instalasi native akan mempertahankan desktop dan aplikasi biasa yang dipilih, namun menghapus perangkat lunak khusus MiniOS yang ditujukan untuk operasi live. Gunakan alur kerja manajemen paket Debian seperti biasa pada sistem yang telah diinstal tersebut.

Menjelajah katalog tidak memerlukan server lokal. Namun, instalasi membutuhkan: antarmuka web akan terhubung ke daemon Toko Aplikasi MiniOS lokal atau membuka handler URI `minios-store://` yang telah terpasang.

## Sebelum menginstal

Buka detail aplikasi dan tinjau informasi berikut sebelum menambahkannya ke keranjang:

- Nama paket dan metode instalasi.
- Skrip instalasi, jika ditampilkan.
- Halaman utama aplikasi dan informasi pengembang.
- Apakah resep mengunduh paket Debian terpisah.

Resep dapat menginstal paket APT, mengunduh paket Debian, atau menjalankan skrip shell. Operasi instalasi dijalankan dengan hak akses root. Perlakukan resep dan setiap unduhan atau repositori yang digunakan sebagai kode dengan hak istimewa.

## Menginstal aplikasi

1. Buka Toko Aplikasi MiniOS dari menu aplikasi. Peluncur akan memeriksa `https://store.minios.dev` dan membukanya di browser default.
2. Cari atau telusuri berdasarkan kategori, buka detail aplikasi, dan periksa paket atau skripnya.
3. Tambahkan satu atau lebih aplikasi ke keranjang.
4. Pada sesi live MiniOS, pilih `Module` atau `System`.
5. Untuk beberapa aplikasi dalam mode modul, pilih satu modul gabungan atau modul terpisah. Modul gabungan juga dapat diberi nama khusus.
6. Pilih `Install` dan ikuti perkembangan serta keluaran perintahnya. Halaman akan menggunakan daemon lokal saat statusnya `Connected`; jika tidak, akan mencoba handler URI dan mungkin menampilkan prompt autentikasi PolicyKit.

Hanya satu batch instalasi daemon yang dapat berjalan dalam satu waktu. Menutup dialog progres tidak selalu menghentikan instalasi daemon; buka kembali indikator instalasi untuk melihat atau membatalkannya secara eksplisit.

## Mode modul dan sistem

### Mode Modul

Mode modul menjalankan `apt2sb` atau `script2sb` dalam lingkungan pembuatan modul yang terisolasi. File hasil `.sb` akan ditulis ke lokasi yang dapat ditulis pertama di bawah ini:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Path pertama adalah direktori modul pada media boot MiniOS saat ini. Modul yang dibuat di sana tidak akan diaktifkan pada sesi saat ini oleh Toko Aplikasi MiniOS. Biarkan modul tetap di direktori tersebut dan lakukan reboot untuk memuatnya pada boot berikutnya. Hasilnya hanya akan tersedia jika media boot yang digunakan dapat ditulis dan file tetap tersimpan.

Path kedua adalah fallback yang digunakan jika direktori modul normal tidak dapat ditulis. Modul di direktori fallback tidak otomatis menjadi bagian dari boot live berikutnya. Gunakan `Open folder`, lalu salin modul yang sudah selesai ke direktori `minios/modules` pada media boot MiniOS yang dapat ditulis sebelum melakukan reboot.

Modul gabungan berisi semua resep yang dipilih. Dengan pengemasan terpisah, kegagalan dapat memengaruhi satu resep sementara modul lain yang telah selesai sebelumnya tetap berada di direktori tujuan.

### Mode sistem

Mode sistem menggunakan APT atau skrip resep secara langsung pada filesystem root yang sedang berjalan. Perubahan akan langsung berlaku pada sistem live saat ini, bukan menghasilkan modul. Apakah perubahan tersebut bertahan setelah reboot tergantung pada konfigurasi persistensi sesi.

Mode sistem tidak bersifat transaksional. Operasi yang gagal atau dibatalkan dapat meninggalkan paket, status repositori, atau file yang telah diubah oleh perintah sebelumnya.

## Layanan lokal dan batas kepercayaan

Layanan `minios-store` berjalan sebagai root karena proses pembuatan modul dan instalasi paket langsung memerlukan operasi mount, overlay, chroot, APT, dan dpkg. Secara default, layanan ini hanya mendengarkan pada `ws://127.0.0.1:8765`. Antarmuka web yang dihosting akan mengirimkan data resep lengkap, termasuk skrip dan URL unduhan, ke layanan lokal ini.

Daemon akan memvalidasi bentuk permintaan dan metode instalasi yang didukung, namun tidak melakukan autentikasi atau penandatanganan payload resep secara independen. Halaman yang dapat mengakses endpoint WebSocket lokal dapat meminta pekerjaan instalasi dengan hak istimewa. Oleh karena itu:

- Pastikan daemon tetap terikat pada `127.0.0.1`. Jangan buka port `8765` ke LAN atau internet.
- Jangan atur `MINIOS_STORE_HOST` ke alamat non-loopback kecuali ada batas keamanan tambahan yang telah ditinjau.
- Akses Toko Aplikasi MiniOS hanya melalui situs resmi HTTPS dan periksa resep sebelum instalasi.
- Hentikan atau nonaktifkan layanan jika instalasi berbasis browser tidak diperlukan.

Kelola layanan systemd dengan:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Handler URI adalah jalur terpisah. Handler ini akan memulai installer GTK melalui PolicyKit dan tidak memerlukan daemon WebSocket. Entri URI saat ini diinterpretasikan sebagai nama paket APT dengan level modul dan pengaturan kompresi yang diminta. Installer akan berjalan setelah otorisasi, jadi periksa permintaan browser sebelum menerima prompt autentikasi.

## Pembatalan

Pilih `Cancel` di dialog progres web atau `Cancel installation` di installer GTK. Pembatalan akan menandai batch sebagai dibatalkan dan menghentikan proses anak yang sedang berjalan. Resep yang tersisa tidak akan dijalankan.

Pembatalan bukan berarti rollback. Paket atau modul yang sudah selesai sebelumnya tetap ada, dan perintah yang terputus saat proses APT, dpkg, skrip, unduhan, atau pembuatan modul dapat meninggalkan status sebagian atau file output yang tidak lengkap. Setelah pembatalan:

1. Baca log instalasi terakhir.
2. Periksa direktori modul target untuk file yang tidak terduga atau berukuran nol.
3. Untuk mode sistem, jalankan `sudo dpkg --audit` dan perbaiki konfigurasi paket jika diperlukan.
4. Hapus hanya artefak yang sudah Anda identifikasi sebagai milik operasi yang dibatalkan.

## Pemecahan masalah

### Toko Aplikasi MiniOS sedang offline

Periksa akses jaringan ke `https://store.minios.dev`. Status `Offline` juga berarti browser tidak terhubung ke daemon WebSocket lokal; instalasi masih dapat dilanjutkan melalui handler URI jika `minios-store-gui` telah terpasang.

### Browser tidak dapat terhubung ke daemon

Periksa layanan dan log-nya:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Endpoint normal adalah `ws://127.0.0.1:8765`. Konflik port, layanan yang berhenti, `python3-websockets` yang hilang, atau pembatasan browser dapat mencegah koneksi. Merestart browser tidak akan memperbaiki daemon yang sudah berhenti.

### Autentikasi gagal atau tidak muncul prompt

Installer URI membutuhkan PolicyKit, `pkexec`, dan agen autentikasi desktop yang aktif. Jalankan installer dari sesi grafis yang aktif dan pastikan `minios-store-gui` sudah terpasang. Jangan mengakali prompt dengan mengekspos daemon root ke jaringan.

### Pembuatan modul gagal

Perluas log instalasi dan gunakan pesan error perintah terakhir, bukan hanya ringkasannya. Penyebab umum meliputi paket yang tidak tersedia, kegagalan repositori atau DNS, ruang kosong yang tidak cukup, alat kompresi yang tidak didukung, dan direktori modul yang hanya-baca. Daemon akan melaporkan saat telah beralih ke `/var/lib/minios-store/modules`.

### Aplikasi tidak muncul setelah instalasi

Untuk mode modul, reboot setelah memastikan file `.sb` ada di direktori `minios/modules` pada media boot. File yang tertinggal di direktori fallback tidak akan dimuat secara otomatis. Untuk mode sistem pada sesi live, pastikan sesi Anda persistent jika aplikasi hilang setelah reboot.

### Instalasi sistem yang dibatalkan meninggalkan dpkg dalam keadaan tidak selesai

Periksa status paket sebelum mencoba ulang:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Tinjau perubahan APT yang diusulkan sebelum mengonfirmasi operasi perbaikan tambahan apa pun.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules)
- [Membangun ulang ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
