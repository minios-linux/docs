---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Menginstal perangkat lunak

Toko Aplikasi MiniOS menyediakan katalog resep aplikasi di [store.minios.dev](https://store.minios.dev). Di lingkungan live MiniOS, resep tersebut dapat langsung diinstal ke sistem yang sedang berjalan atau digunakan untuk membuat satu atau beberapa modul SquashFS (`.sb`)

Halaman ini menjelaskan alur kerja perangkat lunak live MiniOS. Instalasi native mempertahankan desktop dan aplikasi biasa yang dipilih, tetapi menghapus perangkat lunak khusus MiniOS yang ditujukan untuk operasi live. Sebagai gantinya, gunakan alur pengelolaan paket Debian biasa pada sistem yang telah diinstal tersebut.

Menjelajahi katalog tidak memerlukan server lokal. Namun, untuk menginstal diperlukan server: antarmuka web akan terhubung ke daemon Toko Aplikasi MiniOS lokal atau membuka `minios-store://` handler URI yang terinstal.

## Sebelum menginstal

Buka detail aplikasi dan periksa informasi berikut sebelum menambahkannya ke keranjang:

- Nama paket dan metode instalasi.
- Skrip instalasi, jika ditampilkan.
- Beranda aplikasi dan informasi pengembang.
- Screenshot dan artwork aplikasi, jika tersedia. Ini adalah metadata tampilan, bukan bukti bahwa resep tepercaya.
- Apakah resep mengunduh paket Debian terpisah.
- Lisensi perangkat lunak tambahan yang ditampilkan oleh resep. Resep yang memerlukan persetujuan tidak dapat diinstal sampai Anda menyetujui lisensi tersebut secara eksplisit.

Resep dapat menginstal paket APT, mengunduh paket Debian, atau menjalankan skrip shell. Operasi instalasi berjalan dengan hak akses root. Perlakukan resep serta setiap unduhan atau repositori yang digunakannya sebagai kode dengan hak istimewa.

## Menginstal aplikasi

1. Buka Toko Aplikasi MiniOS dari menu aplikasi. Peluncur akan memeriksa `https://store.minios.dev` dan membukanya di browser default.
2. Cari atau telusuri berdasarkan kategori, buka detail aplikasi, lalu periksa paket atau skripnya.
3. Tambahkan satu atau beberapa aplikasi ke keranjang.
4. Dalam sesi live MiniOS, pilih `Module` atau `System`.
5. Dalam mode modul, pilih tingkat build jika diperlukan. **Default resep** mempertahankan tingkat yang dikonfigurasi untuk setiap resep; **Otomatis** menggunakan semua modul yang sedang dimuat sebagai basis build dan menghasilkan nama modul tanpa nomor; tingkat numerik dari `01` hingga `09` hanya menggunakan modul yang dimuat sampai tingkat tersebut. Sebaiknya gunakan Default resep, kecuali jika Anda memang perlu menghindari dependensi pada lapisan opsional yang lebih tinggi.
6. Untuk beberapa aplikasi dalam mode modul, pilih satu modul gabungan atau modul terpisah. Anda juga dapat memberi nama khusus pada modul gabungan.
7. Setujui lisensi resep yang secara eksplisit memerlukan persetujuan.
8. Pilih `Install` lalu ikuti progres dan output perintah. Halaman ini menggunakan daemon lokal jika statusnya `Connected`; jika tidak, halaman akan mencoba handler URI dan mungkin menampilkan permintaan autentikasi PolicyKit.

Hanya satu batch instalasi daemon yang dapat berjalan pada satu waktu. Menutup dialog progres belum tentu menghentikan instalasi daemon; buka kembali indikator instalasi untuk melihatnya atau membatalkannya secara eksplisit.

## Mode modul dan sistem

### Mode Modul

Mode Modul menjalankan `apt2sb` atau `script2sb` dalam lingkungan pembuatan modul yang terisolasi. File `.sb` yang dihasilkan ditulis ke lokasi pertama yang dapat ditulisi di bawah ini:

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Path pertama adalah direktori modul pada pohon data MiniOS yang aktif. Dalam proses boot normal yang dapat ditulisi, lokasinya ada di penyimpanan, tetapi setelah sistem `toram` disalin, lokasinya bisa menggunakan RAM sebagai backing; Store memeriksa apakah lokasi dapat ditulisi, bukan apakah datanya tahan lama. Modul yang dibuat tidak diaktifkan pada sesi saat ini. Modul akan dimuat saat boot berikutnya hanya jika disalin ke penyimpanan permanen `minios/modules/` dan diizinkan oleh filter boot. Gunakan opsi **Tambahkan ke Boot Berikutnya** atau `sudo sb next-boot add /path/to/module.sb` jika tersedia penyimpanan permanen yang sesuai.

Path kedua adalah lokasi cadangan yang digunakan saat direktori modul biasa tidak dapat ditulisi. Modul di direktori cadangan tidak otomatis disertakan pada boot aktif berikutnya. Gunakan `Open folder`, lalu salin modul yang sudah selesai ke direktori `minios/modules` pada media boot MiniOS yang dapat ditulisi sebelum melakukan boot ulang.

Modul gabungan berisi semua resep yang dipilih. Dengan pengemasan terpisah, kegagalan dapat memengaruhi satu resep, sementara modul yang selesai lebih dulu dalam batch tetap berada di direktori tujuan.

### Mode Sistem

Mode Sistem menggunakan APT atau skrip resep secara langsung pada root filesystem yang sedang berjalan. Perubahan langsung berlaku pada sistem aktif saat ini, bukan menghasilkan modul. Apakah perubahan tersebut tetap ada setelah boot ulang bergantung pada konfigurasi persistensi sesi.

Mode Sistem tidak bersifat transaksional. Operasi yang gagal atau dibatalkan dapat meninggalkan perubahan pada paket, status repositori, atau file akibat perintah yang dijalankan sebelumnya.

## Layanan lokal dan batas kepercayaan

Layanan `minios-store` berjalan sebagai root karena pembuatan modul dan instalasi paket langsung memerlukan operasi mount, overlay, chroot, APT, dan dpkg. Secara default, layanan ini hanya mendengarkan di `ws://127.0.0.1:8765`. Antarmuka web yang di-host mengirimkan data resep lengkap, termasuk skrip dan URL unduhan, ke layanan lokal ini.

Daemon memvalidasi struktur permintaan dan metode instalasi yang didukung, tetapi tidak mengautentikasi atau menandatangani payload resep secara mandiri. Halaman yang dapat mengakses endpoint WebSocket lokal bisa meminta operasi instalasi dengan hak istimewa. Karena itu:

- Pastikan daemon hanya terikat ke `127.0.0.1`. Jangan buka port `8765` ke LAN atau internet.
- Jangan atur `MINIOS_STORE_HOST` ke alamat non-loopback kecuali ada batas keamanan tambahan yang telah ditinjau.
- Akses Toko Aplikasi MiniOS hanya melalui situs web HTTPS resminya, dan periksa resep sebelum instalasi.
- Hentikan atau nonaktifkan layanan jika instalasi melalui browser tidak diperlukan.

Kelola layanan systemd dengan:

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Handler URI menggunakan jalur terpisah. Handler ini menjalankan installer GTK melalui PolicyKit dan tidak memerlukan daemon WebSocket. Tautan Store saat ini menyertakan payload resep berkode lengkap sehingga resep APT, skrip, dan DEB yang diunduh dapat menggunakan jalur alternatif yang sama; persetujuan lisensi eksplisit disertakan secara terpisah dan divalidasi ulang oleh installer lokal. Format lama `recipes=id:level:compression` tetap tersedia sebagai jalur alternatif untuk kompatibilitas dan ditafsirkan sebagai resep APT. Installer berjalan setelah otorisasi, jadi periksa permintaan browser sebelum menyetujui permintaan autentikasi.

## Pembatalan

Pilih `Cancel` pada dialog progres web atau `Cancel installation` pada installer GTK. Pembatalan menandai batch sebagai dibatalkan dan menghentikan proses anak yang sedang dilacak. Resep yang tersisa tidak akan dijalankan.

Pembatalan bukanlah rollback. Paket atau modul yang selesai lebih dulu akan tetap ada, dan perintah yang dihentikan saat APT, dpkg, skrip, unduhan, atau pembuatan modul berjalan mungkin meninggalkan status parsial atau file output yang tidak lengkap. Setelah membatalkan:

1. Baca log instalasi akhir.
2. Periksa direktori modul tujuan untuk mencari file yang tidak terduga atau berukuran nol.
3. Untuk mode sistem, jalankan `sudo dpkg --audit` dan perbaiki konfigurasi paket jika perlu.
4. Hapus hanya artefak yang telah Anda pastikan berasal dari operasi yang dibatalkan.

## Pemecahan Masalah

### Toko Aplikasi MiniOS sedang offline

Periksa akses jaringan ke `https://store.minios.dev`. Status `Offline` juga berarti browser tidak terhubung ke daemon WebSocket lokal; instalasi mungkin tetap dapat dilanjutkan melalui URI handler jika `minios-store-gui` terpasang.

### Browser tidak dapat terhubung ke daemon

Periksa layanan dan log-nya:

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Endpoint yang biasanya digunakan adalah `ws://127.0.0.1:8765`. Konflik port, layanan yang berhenti, `python3-websockets` yang tidak tersedia, atau pembatasan browser dapat menghalangi koneksi. Memulai ulang browser tidak akan memperbaiki daemon yang berhenti.

### Autentikasi gagal atau tidak ada prompt yang muncul

Penginstal URI memerlukan PolicyKit, `pkexec`, dan agen autentikasi desktop yang aktif. Jalankan penginstal dari sesi grafis yang aktif dan pastikan `minios-store-gui` terpasang. Jangan mengakali prompt dengan mengekspos daemon root ke jaringan.

### Pembuatan modul gagal

Perluas log instalasi dan periksa error perintah terakhir, bukan hanya ringkasannya. Penyebab umum meliputi paket yang tidak tersedia, masalah repositori atau DNS, ruang kosong yang tidak mencukupi, alat kompresi yang tidak didukung, dan direktori modul yang bersifat hanya-baca. Daemon akan memberi tahu jika telah beralih ke `/var/lib/minios-store/modules`.

### Aplikasi tidak ada setelah instalasi

Untuk mode modul, lakukan boot ulang setelah memastikan bahwa file `.sb` berada di direktori `minios/modules` pada media boot. File yang tersimpan di direktori fallback tidak akan dimuat secara otomatis. Untuk mode sistem pada sesi live, pastikan sesi tersebut persisten jika aplikasi hilang setelah boot ulang.

### Instalasi sistem yang dibatalkan menyebabkan dpkg tidak selesai

Periksa status paket sebelum mencoba lagi:

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Tinjau perubahan APT yang diusulkan sebelum mengonfirmasi operasi perbaikan tambahan.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Membangun ulang ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
