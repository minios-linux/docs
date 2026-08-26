# Aplikasi dan alat MiniOS

MiniOS menyertakan alat untuk mengonfigurasi, menginstal, memelihara, dan meremaster sistem MiniOS. Gunakan halaman ini untuk memilih alat yang diinginkan, lalu ikuti panduan yang terhubung untuk mengetahui persyaratan, batasan keamanan, dan detail perintahnya.

## Periksa apa yang terpasang

Manifest paket Xfce saat ini mencakup set grafis di edisi Standard, Toolbox, dan Ultra: Configurator, Installer, Session Manager, Kernel Manager, Store, Image Builder, Module Manager, MiniOS Help, dan Drive Utility.
Edisi Flux tidak menyertakan set GUI ini, dan build menggunakan lingkungan desktop atau konsol lain mungkin juga tidak menyertakannya. Pemilihan paket bersyarat juga bervariasi sesuai suite distribusi dan opsi build.

Set paket yang terpasang atau image yang telah selesai adalah acuan utama. Periksa sistem yang sedang berjalan dengan `dpkg-query`, atau inspeksi modul image dan manifest seperti dijelaskan di [Packages and editions](/administration/Packages.md).

## Pilih alat grafis

| Tugas | Alat | Dukungan live dan native | Dokumentasi |
|---|---|---|---|
| Edit pengaturan MiniOS saat boot dan sesi baru | **MiniOS Configurator** | Untuk model konfigurasi live MiniOS. Alat ini menulis pengaturan untuk boot live berikutnya dan tidak langsung mengonfigurasi sistem yang sedang berjalan. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Deploy MiniOS ke disk lain | **MiniOS Installer** | Jalankan dari sesi live MiniOS. Dapat membuat instalasi live modular atau instalasi native konvensional jika image mendukung deployment native. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Membuat, memilih, mengubah ukuran, menyimpan, atau menghapus sesi persisten | **MiniOS Session Manager** | Hanya untuk sistem live. Instalasi native menulis langsung ke filesystem root dan tidak menggunakan sesi live MiniOS. | [Session management](/configuration/Session-Management.md) |
| Paket, aktivasi, inspeksi, atau hapus kernel MiniOS | **MiniOS Kernel Manager** | Ditujukan untuk instalasi live modular dan repositori kernel MiniOS. Gunakan workflow paket kernel distribusi pada instalasi native. | [Kernel management](/administration/Kernel-Management.md) |
| Instal aplikasi atau buat modul aplikasi dari resep katalog | **MiniOS Store** | Pada sistem live, pilih instalasi modul atau langsung ke sistem; persistensi menentukan apakah perubahan langsung bertahan setelah reboot. Instalasi native menggunakan mode sistem langsung. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Remaster image MiniOS yang ada melalui proyek terpandu | **MiniOS Image Builder** | Bekerja dengan konten image live MiniOS dari sesi live yang sedang berjalan, ISO, atau media optik. Membuat ISO live baru; tidak memelihara instalasi native atau menggantikan build sumber. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Inspeksi, buat, aktifkan, dan pilih modul `.sb` | **MiniOS Module Manager** | Komposisi modul dan aktivasi runtime adalah fitur sistem live. Instalasi native tidak menggunakan model root berlapis `.sb`. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Baca dokumentasi MiniOS yang terpasang | **MiniOS Help** | Penampil dokumentasi lokal. Dapat digunakan di mana pun paket `minios-help` dan set dokumentasinya terpasang. | [MiniOS documentation](/) |
| Tulis ISO MiniOS ke USB drive | **Drive Utility** | Dapat dijalankan di sistem grafis live atau native jika terpasang. Menulis media bootable; tidak melakukan deployment live atau native seperti MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Pilih alat command-line

Manifest inti bersama saat ini mencakup `minios-tools` dan `minios-image-compose`, termasuk di edisi Flux. Namun, keberadaannya di sistem atau image yang terpasang tertentu tetap harus diperiksa secara langsung.

### Bekerja dengan modul dan perubahan sesi

Gunakan alat CLI MiniOS inti saat Anda memerlukan workflow modul yang dapat di-script:

- `sb` untuk inspeksi modul dan mengelola set modul yang berjalan dan modul boot berikutnya.
- `apt2sb`, `script2sb`, dan `chroot2sb` untuk membangun modul di lingkungan terisolasi.
- `dir2sb` dan `sb2dir` untuk konversi antara pohon direktori dan modul `.sb`.
- `savechanges` untuk menangkap perubahan yang memenuhi syarat dari sesi writable live ke dalam modul.
- `rmsbdir` untuk menghapus direktori ekstraksi modul dengan pemeriksaan keamanan yang diperlukan.

Sebagian besar operasi build, capture, aktivasi, dan boot berikutnya bergantung pada layout modul live MiniOS. Konversi file dasar dan inspeksi dapat berguna di luar sesi live yang berjalan jika alat dan file input yang diperlukan tersedia.
Lihat [Creating modules](/development/Creating-Modules.md) untuk hak akses, aturan output, dan workflow perintah saat ini.

### Komposisi ISO MiniOS

Gunakan `minios-image-compose` untuk skrip, otomasi, atau remaster command-line yang dapat direproduksi dari pohon konten MiniOS yang ada. Alat ini dapat memilih modul, menerapkan konfigurasi image yang didukung, secara opsional menangkap perubahan sesi live yang kompatibel, memverifikasi hasil, dan menerbitkan ISO bootable. Alat ini bekerja pada konten image live MiniOS dan tidak mengonversi atau memperbarui instalasi native. Lihat [Composing MiniOS ISO images from the command line](/development/Rebuilding-ISO.md).

Untuk perubahan pada daftar paket sumber, kernel, artefak boot, atau seluruh rantai modul, gunakan sistem build sumber alih-alih alat remaster image apa pun. Lihat [Building MiniOS](/development/Building-MiniOS.md).
