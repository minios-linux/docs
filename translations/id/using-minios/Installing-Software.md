---
updated: 2026-10-06
program_commits:
    minios-store: eec5785dd7eb547961c2799f1907496a33be2e8c
---

# Menginstal perangkat lunak

Toko Aplikasi MiniOS menyediakan katalog resep aplikasi di [store.minios.dev](https://store.minios.dev). Pada lingkungan live MiniOS, resep-resep tersebut dapat langsung diinstal ke sistem yang sedang berjalan atau digunakan untuk membangun satu atau beberapa SquashFS (`.sb`) modul.

Halaman ini menjelaskan alur kerja perangkat lunak live MiniOS. Instalasi native akan mempertahankan desktop dan aplikasi pilihan Anda, namun menghapus perangkat lunak khusus MiniOS yang ditujukan untuk operasi live. Gunakan alur kerja manajemen paket Debian seperti biasa pada sistem yang sudah terinstal.

Menjelajah katalog tidak memerlukan server lokal. Instalasi memerlukan: antarmuka web akan terhubung ke daemon Toko Aplikasi MiniOS lokal atau membuka `minios-store://` penangan URI yang sudah terpasang.

## Sebelum menginstal

Buka detail aplikasi dan tinjau informasi berikut sebelum menambahkannya ke keranjang:

- Nama paket dan metode instalasi.
- Skrip instalasi, jika tersedia.
- Halaman utama aplikasi dan informasi pengembang.
- Tangkapan layar dan artwork aplikasi, jika tersedia. Ini adalah metadata presentasi, bukan bukti bahwa resep tersebut dapat dipercaya.
- Apakah resep akan mengunduh paket Debian terpisah.
- Lisensi perangkat lunak tambahan yang ditampilkan oleh resep. Resep yang menandai persyaratan persetujuan lisensi tidak dapat diinstal sebelum Anda menyetujui lisensi tersebut secara eksplisit.

Resep dapat menginstal paket APT, mengunduh paket Debian, atau menjalankan skrip shell. Proses instalasi berjalan dengan hak akses root. Perlakukan resep dan setiap unduhan atau repository yang digunakan sebagai kode yang memiliki hak istimewa.

## Instal aplikasi

1. Buka Toko Aplikasi MiniOS dari menu aplikasi. Peluncur akan memeriksa `https://store.minios.dev` dan membukanya di browser default.
2. Cari atau jelajahi berdasarkan kategori, buka detail aplikasi, dan periksa paket atau skripnya.
3. Tambahkan satu atau beberapa aplikasi ke keranjang.
4. Pada sesi live MiniOS, pilih `Module` atau `System`.
5. Pada mode modul, pilih level build bila diperlukan. **Default resep** mempertahankan level yang dikonfigurasi pada setiap resep; **Otomatis** menggunakan semua modul yang sedang dimuat sebagai basis build dan menghasilkan nama modul tanpa nomor; level numerik dari `01` hingga `09` hanya menggunakan modul yang dimuat hingga level tersebut. Sebaiknya gunakan Default resep kecuali Anda memang perlu menghindari dependensi pada lapisan opsional yang lebih tinggi.
6. Untuk beberapa aplikasi pada mode modul, pilih satu modul gabungan atau modul terpisah. Modul gabungan juga dapat diberi nama khusus.
7. Setujui lisensi resep yang memang memerlukan persetujuan secara eksplisit.
8. Pilih `Install` dan ikuti proses serta keluaran perintahnya. Halaman ini menggunakan daemon lokal jika statusnya `Connected`; jika tidak, akan mencoba menggunakan penangan URI dan mungkin menampilkan permintaan autentikasi PolicyKit.

Hanya satu batch instalasi daemon yang dapat berjalan dalam satu waktu. Menutup dialog progres tidak selalu menghentikan instalasi daemon; buka kembali indikator instalasi untuk melihat atau membatalkannya secara eksplisit.

## Mode modul dan sistem

### Mode modul

Mode modul menjalankan `apt2sb` atau `script2sb` pada lingkungan pembuatan modul yang terisolasi. Hasilnya akan ditulis ke file `.sb` di lokasi yang dapat ditulis pertama berikut:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Path pertama adalah direktori modul pada media boot MiniOS saat ini. Modul yang dibuat di sana tidak akan diaktifkan pada sesi saat ini oleh Toko Aplikasi MiniOS. Biarkan modul di direktori tersebut dan reboot untuk memuatnya pada boot berikutnya. Hasil hanya akan tersedia jika media boot yang digunakan dapat ditulis dan file tetap ada.

Path kedua adalah fallback yang digunakan jika direktori modul utama tidak dapat ditulis. Modul di direktori fallback tidak otomatis menjadi bagian dari live boot berikutnya. Gunakan `Open folder`, lalu salin modul yang sudah selesai ke direktori `minios/modules` pada media boot MiniOS yang dapat ditulis sebelum reboot.

Modul gabungan berisi semua resep yang dipilih. Jika dikemas terpisah, kegagalan pada salah satu resep hanya memengaruhi resep tersebut, sedangkan modul yang sudah selesai sebelumnya tetap ada di direktori target.

### Mode sistem

Mode sistem menggunakan APT atau skrip resep secara langsung pada root filesystem yang sedang berjalan. Perubahan langsung berlaku pada sistem live saat ini, bukan menghasilkan modul. Apakah perubahan tersebut bertahan setelah reboot tergantung pada konfigurasi persistensi sesi.

Mode sistem tidak bersifat transaksional. Operasi yang gagal atau dibatalkan dapat meninggalkan paket, status repository, atau file yang sudah diubah oleh perintah sebelumnya.

## Layanan lokal dan batas kepercayaan

Layanan `minios-store` berjalan sebagai root karena proses pembuatan modul dan instalasi paket langsung memerlukan operasi mount, overlay, chroot, APT, dan dpkg. Secara default, layanan ini hanya mendengarkan di `ws://127.0.0.1:8765`. Antarmuka web yang dihosting akan mengirimkan data resep lengkap, termasuk skrip dan URL unduhan, ke layanan lokal ini.

Daemon memvalidasi bentuk permintaan dan metode instalasi yang didukung, namun tidak melakukan autentikasi atau penandatanganan payload resep secara independen. Halaman yang dapat mengakses endpoint WebSocket lokal dapat meminta pekerjaan instalasi dengan hak istimewa. Oleh karena itu:

- Biarkan daemon terikat pada `127.0.0.1` saja. Jangan buka port `8765` ke LAN atau internet.
- Jangan atur `MINIOS_STORE_HOST` ke alamat non-loopback kecuali ada batas keamanan tambahan yang sudah ditinjau.
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

Penangan URI merupakan jalur terpisah. Penangan ini akan menjalankan installer GTK melalui PolicyKit dan tidak memerlukan daemon WebSocket. Tautan Store saat ini menyertakan payload resep yang sudah dienkode lengkap sehingga resep APT, skrip, dan unduhan-DEB dapat menggunakan jalur fallback yang sama; persetujuan lisensi eksplisit dikirim terpisah dan divalidasi ulang oleh installer lokal. Format lama `recipes=id:level:compression` tetap menjadi fallback kompatibilitas dan diinterpretasikan sebagai resep APT. Installer akan berjalan setelah otorisasi, jadi periksa permintaan browser sebelum menyetujui permintaan autentikasi.

## Pembatalan

Pilih `Cancel` di dialog progres web atau `Cancel installation` di installer GTK. Pembatalan akan menandai batch sebagai dibatalkan dan menghentikan proses anak yang sedang berjalan. Resep yang tersisa tidak akan dijalankan.

Pembatalan bukanlah rollback. Paket atau modul yang sudah selesai sebelumnya tetap ada, dan perintah yang terputus saat proses APT, dpkg, skrip, unduhan, atau pembuatan modul dapat meninggalkan status sebagian atau file output yang tidak lengkap. Setelah membatalkan:

1. Baca log instalasi akhir.
2. Periksa direktori modul target untuk file yang tidak terduga atau berukuran nol.
3. Untuk mode sistem, jalankan `sudo dpkg --audit` dan perbaiki konfigurasi paket jika diperlukan.
4. Hapus hanya artefak yang telah Anda identifikasi sebagai milik operasi yang dibatalkan.

## Pemecahan masalah

### Toko Aplikasi MiniOS sedang offline

Periksa akses jaringan ke `https://store.minios.dev`. Status `Offline` juga berarti browser tidak terhubung ke daemon WebSocket lokal; instalasi masih dapat dilakukan melalui penangan URI jika `minios-store-gui` sudah terpasang.

### Browser tidak dapat terhubung ke daemon

Periksa layanan dan log-nya:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Endpoint normal adalah `ws://127.0.0.1:8765`. Konflik port, layanan yang berhenti, tidak adanya `python3-websockets`, atau pembatasan browser dapat mencegah koneksi. Merestart browser tidak memperbaiki daemon yang berhenti.

### Autentikasi gagal atau tidak ada prompt yang muncul

Installer URI memerlukan PolicyKit, `pkexec`, dan agen autentikasi desktop yang aktif. Jalankan installer dari sesi grafis yang aktif dan pastikan bahwa `minios-store-gui` sudah terpasang. Jangan mengakali prompt dengan membuka daemon root ke jaringan.

### Pembuatan modul gagal

Perluas log instalasi dan gunakan pesan error perintah terakhir, bukan hanya ringkasannya. Penyebab umum meliputi paket yang tidak tersedia, kegagalan repository atau DNS, ruang kosong tidak cukup, alat kompresi yang tidak didukung, dan direktori modul hanya-baca. Daemon akan melaporkan jika telah beralih ke `/var/lib/minios-store/modules`.

### Aplikasi tidak muncul setelah instalasi

Untuk mode modul, reboot setelah memastikan bahwa file `.sb` ada di direktori `minios/modules` pada media boot. File yang tertinggal di direktori fallback tidak akan dimuat secara otomatis. Untuk mode sistem pada sesi live, pastikan sesi bersifat persisten jika aplikasi hilang setelah reboot.

### Instalasi sistem yang dibatalkan membuat dpkg belum selesai

Periksa status paket sebelum mencoba ulang:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Tinjau perubahan APT yang diusulkan sebelum mengonfirmasi operasi perbaikan tambahan apa pun.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Membangun ulang ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
