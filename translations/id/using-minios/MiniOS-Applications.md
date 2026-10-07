---
updated: 2026-10-06
---

# Aplikasi MiniOS

MiniOS menyediakan alat grafis dan baris perintah untuk konfigurasi, instalasi, sesi, modul, kernel, perangkat lunak, dan pembuatan ulang citra. Alat-alat ini dirancang berdasarkan arsitektur live modular yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS).

## Ketersediaan

Alat yang tersedia bergantung pada paket yang disertakan dalam citra MiniOS. Periksa sistem live yang sedang berjalan dengan `dpkg-query`, atau tinjau modul citra dan [manifest paket](/reference/Package-and-Edition-Contents).

Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal — identitas visual, lingkungan desktop pilihan, dan aplikasi standar — namun tidak menyertakan perangkat lunak manajemen khusus MiniOS yang dirancang untuk arsitektur live. Sesi, `.sb` modul, manajemen kernel modular, dan alur kerja serupa tidak lagi berlaku, sehingga sistem yang terpasang menggunakan alat paket, kernel, konfigurasi, dan bootloader Debian standar.

## Alat grafis

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Edit pengaturan waktu boot dan sesi baru MiniOS | **Konfigurator MiniOS** | Untuk model konfigurasi live MiniOS. Alat ini menulis pengaturan untuk boot live berikutnya dan tidak langsung mengonfigurasi sistem yang sedang berjalan. | [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Deploy MiniOS ke disk lain | **Penginstal MiniOS** | Dijalankan dari sesi live MiniOS. Mode live mempertahankan lingkungan live MiniOS secara penuh; mode native membuat desktop Debian konvensional dan menghapus perangkat lunak khusus MiniOS yang ditujukan untuk operasi live. | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) |
| Buat, pilih, mount, ubah ukuran, simpan, klaim ulang, enkripsi, atau hapus sesi persisten | **Manajer Sesi MiniOS** | Hanya untuk sistem live MiniOS. Dapat menulis sesi yang didukung RAM ke penyimpanan aslinya, mengubah frasa sandi LUKS yang terlepas, dan mount sesi kontainer yang tidak aktif untuk akses file. | [Manajemen sesi](/using-minios/Sessions-and-Persistence) |
| Paket, aktifkan, inspeksi, atau hapus kernel MiniOS | **Manajer Kernel MiniOS** | Hanya untuk sistem live modular MiniOS. Paket repositori juga dapat menambahkan driver kompatibel dari katalog DKMS MiniOS yang telah dikurasi. | [Manajemen kernel](/preparing-and-customizing/Managing-Kernels) |
| Instal aplikasi atau buat modul aplikasi dari resep katalog | **Toko Aplikasi MiniOS** | Untuk sistem live MiniOS. Pembuatan modul dapat mempertahankan level resep atau menggunakan level build-base eksplisit; beberapa resep memerlukan persetujuan lisensi. | [Toko Aplikasi MiniOS](/using-minios/Installing-Software) |
| Remaster citra MiniOS yang sudah ada melalui proyek terpandu | **Pembuat Citra MiniOS** | Bekerja dengan konten citra live MiniOS dari sesi live yang sedang berjalan, ISO, atau media optik. Dapat memilih modul, menangkap perubahan sesi, dan membangun perilaku menu boot sebelum menghasilkan ISO live lain yang telah diverifikasi. | [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspeksi, buat, aktifkan, dan pilih `.sb` modul | **Manajer Modul MiniOS** | Hanya untuk sistem live MiniOS; komposisi modul dan aktivasi saat runtime bergantung pada model `.sb` root yang berlapis. | [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules) |
| Tulis/baca citra disk, format penyimpanan, atau hapus perangkat | **Utilitas Disk** | Utilitas penyimpanan umum yang disertakan dengan MiniOS. Penulisan citra mentah tidak melakukan deployment terkelola seperti Penginstal MiniOS. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) |
| Jelajahi dokumentasi terinstal secara offline | **Bantuan MiniOS** | Penampil GTK native untuk bundel dokumentasi yang sudah dikompilasi; tidak memerlukan situs web, WebKit, atau koneksi jaringan saat dijalankan. | [Dokumentasi MiniOS](/) |
| Tampilkan pengenalan pertama kali yang telah dilokalkan | **Selamat Datang MiniOS** | Halaman sambutan berbasis browser lokal dengan Mio, tautan proyek, bantuan, komunitas, dan dukungan. Konten ini bersifat pengenalan, bukan alat konfigurasi sistem. | [Mulai cepat](/getting-started/Quick-Start) |

## Alat baris perintah

Sebagian besar alat grafis memiliki padanan baris perintah publik atau backend. Perintah-perintah ini dikirimkan baik dalam paket yang sama dengan aplikasi grafis maupun dalam paket pendamping yang diperlukan. Manifest inti bersama mencakup `minios-tools` dan `minios-image-compose`. Perintah lain mengikuti ketersediaan paket grafis terkait. Keberadaan mereka pada sistem atau citra yang terpasang tertentu tetap harus diperiksa secara langsung.

### Deployment dan sesi

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Daftar disk target, pratinjau rencana deployment, atau instal MiniOS secara non-interaktif | **`minios-deploy`** | Dijalankan dari sesi live MiniOS. Instalasi memerlukan akses root dan konfirmasi eksplisit; mode native, jika didukung, membuat desktop Debian konvensional dari citra yang dipilih. | [Deployment baris perintah](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Buat, aktifkan, simpan, mount, ubah ukuran, klaim ulang, ubah kredensial enkripsi, ekspor, impor, atau hapus sesi persisten | **`minios-session`** | Memerlukan akses root dan sistem live MiniOS dengan penyimpanan persistensi yang kompatibel. Penyimpanan berbasis RAM, mount terlepas, dan operasi khusus backend bergantung pada kemampuan. | [Referensi perintah sesi](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel dan citra

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Daftar, paket, aktifkan, inspeksi, atau hapus kernel | **`minios-kernel`** | Memerlukan akses root dan instalasi live modular MiniOS dengan root MiniOS yang dapat ditulis. | [`minios-kernel`CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remaster pohon konten MiniOS yang sudah ada melalui skrip atau otomatisasi | **`minios-image-compose`** | Beroperasi pada konten citra live MiniOS dan menghasilkan ISO yang dapat di-boot. | [Menyusun citra ISO dari baris perintah](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Alur kerja modul

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Inspeksi modul dan kelola set modul yang berjalan atau untuk boot berikutnya | **`sb`** | Inspeksi modul juga dapat dilakukan di luar sesi MiniOS yang berjalan. Operasi berjalan dan boot berikutnya memerlukan tata letak modul live MiniOS; perubahan memerlukan akses root. | [Inspeksi dan ekstrak modul](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [kelola modul berjalan dan boot berikutnya](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Buat modul dari paket repositori atau `.deb` file lokal | **`apt2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Paket diinstal ke lingkungan build terisolasi, bukan ke root yang sedang berjalan. | [Buat modul dari paket](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Buat modul dengan menjalankan skrip instalasi | **`script2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Skrip dijalankan secara non-interaktif di lingkungan build terisolasi. | [Buat modul dari skrip](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Buat modul secara interaktif di lingkungan yang telah disiapkan | **`chroot2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Gunakan jika instalasi membutuhkan prompt atau perubahan manual. | [Buat modul secara interaktif](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Konversi antara pohon direktori dan `.sb` modul | **`dir2sb`**, **`sb2dir`** | Konversi biasa tidak memerlukan root dan dapat dijalankan di luar sesi live. Ekstraksi dan pengemasan ulang dengan pemilik asli dan file khusus memerlukan root; alur kerja grafis meminta autentikasi administrator. | [Buat](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) atau [ekstrak](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) modul; `man dir2sb`, `man sb2dir` |
| Tangkap perubahan yang memenuhi syarat dari layer sesi yang dapat ditulis ke dalam modul | **`savechanges`** | Memerlukan akses root dan sesi live MiniOS yang sedang berjalan dengan backend layer yang dapat ditulis dan didukung. | [Tangkap perubahan sesi saat ini](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Alur kerja penyimpanan

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Baca atau tulis citra disk, format perangkat, atau hapus penyimpanan | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operasi disk umum. Penghapusan mendukung metode erase controller, discard, dan overwrite oleh host jika perangkat dan alat yang diperlukan mendukungnya. Operasi destruktif biasanya memerlukan akses root. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Untuk perubahan pada daftar paket sumber, kernel, artefak boot, atau seluruh rantai modul, gunakan sistem build sumber alih-alih alat remaster citra. Lihat [Membangun MiniOS](/development/Building-MiniOS).
