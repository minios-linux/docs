---
updated: 2026-10-15
---

# MiniOS

MiniOS menyediakan alat grafis dan command-line untuk konfigurasi, instalasi, sesi, modul, kernel, perangkat lunak, dan remastering image. Alat-alat ini dirancang berdasarkan arsitektur live modular yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS).

## Ketersediaan

Alat yang tersedia bergantung pada paket yang disertakan dalam image MiniOS. Periksa sistem live yang sedang berjalan dengan `dpkg-query`, atau periksa modul image dan [manifest paket](/reference/Package-and-Edition-Contents).

Instalasi native mempertahankan pengalaman desktop MiniOS yang familier—identitas visual, lingkungan desktop yang dipilih, dan aplikasi sehari-hari—tetapi tidak menyertakan perangkat lunak manajemen khusus MiniOS yang dirancang untuk arsitektur live. Sesi, `.sb` modul, manajemen kernel modular, dan alur kerja serupa tidak lagi berlaku. Karena itu, sistem yang terinstal menggunakan alat paket, kernel, konfigurasi, dan bootloader Debian biasa.

## Alat grafis

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Mengedit pengaturan waktu boot dan sesi baru MiniOS | **Konfigurator MiniOS** | Untuk model konfigurasi live MiniOS. Alat ini menyimpan pengaturan untuk boot live berikutnya dan tidak langsung mengonfigurasi ulang sistem yang sedang berjalan. | [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Menerapkan MiniOS ke disk lain | **Penginstal MiniOS** | Berjalan dari sesi live MiniOS. Mode live mempertahankan seluruh lingkungan live MiniOS; mode native membuat desktop Debian konvensional dan menghapus perangkat lunak khusus MiniOS yang ditujukan untuk penggunaan live. | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) |
| Membuat, memilih, memasang, mengubah ukuran, menyimpan, mengosongkan ruang, mengenkripsi, atau menghapus sesi persisten | **Manajer Sesi MiniOS** | Hanya untuk sistem live MiniOS. Alat ini dapat menulis sesi berbasis RAM yang didukung ke penyimpanan asalnya, mengubah frasa sandi LUKS yang terlepas, dan memasang sesi kontainer yang tidak aktif untuk mengakses file. | [Manajemen sesi](/using-minios/Sessions-and-Persistence) |
| Mengemas, mengaktifkan, memeriksa, atau menghapus kernel MiniOS | **Manajer Kernel MiniOS** | Hanya untuk sistem live modular MiniOS. Pengemasan repositori juga dapat menambahkan driver yang kompatibel dari katalog DKMS MiniOS yang telah dikurasi. | [Manajemen kernel](/preparing-and-customizing/Managing-Kernels) |
| Menginstal aplikasi atau membangun modul aplikasi dari resep katalog | **Toko Aplikasi MiniOS** | Sistem live MiniOS. Pembuatan modul dapat menggunakan level resep atau level build-base yang ditentukan secara eksplisit; resep mungkin mengharuskan persetujuan lisensi. | [Toko Aplikasi MiniOS](/using-minios/Installing-Software) |
| Melakukan remaster image MiniOS yang sudah ada melalui proyek terpandu | **Pembuat Citra MiniOS** | Menggunakan sesi yang sedang berjalan, ISO, atau media optik. Pengambilan sesi memerlukan sumber dari sesi yang sedang berjalan dengan seluruh sumber dan kumpulan modul eksternal aktif; fitur ini tidak tersedia untuk sumber ISO/media optik yang dipilih secara terpisah. | [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Memeriksa, membuat, mengaktifkan, dan memilih `.sb` modul | **Manajer Modul MiniOS** | Hanya untuk sistem live MiniOS; komposisi modul dan aktivasi saat runtime bergantung pada model root berlapis `.sb`. | [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules) |
| Menulis/membaca image disk, memformat penyimpanan, atau menghapus perangkat | **Utilitas Disk** | Utilitas penyimpanan umum yang disertakan dengan MiniOS. Penulisan image mentah tidak melakukan penerapan terkelola seperti Penginstal MiniOS. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) |
| Menelusuri dokumentasi yang terinstal secara offline | **Bantuan MiniOS** | Penampil GTK native untuk bundel dokumentasi yang telah dikompilasi; saat runtime, alat ini tidak memerlukan situs web, WebKit, atau koneksi jaringan. | [Dokumentasi MiniOS](/) |
| Menampilkan pengantar lokal saat pertama kali dijalankan | **Selamat datang di MiniOS** | Halaman sambutan lokal berbasis browser yang berisi Mio, tautan proyek, bantuan, komunitas, dan informasi dukungan. Isinya bersifat pengantar, bukan alat konfigurasi sistem. | [Panduan memulai](/getting-started/Quick-Start) |

## Alat command-line

Sebagian besar alat grafis memiliki padanan atau backend command-line yang tersedia untuk umum. Manifest inti meminta `minios-tools` untuk setiap edisi dan `minios-image-compose`, `minios-deploy`, `minios-kernel`, serta `minios-session` untuk varian non-minimal, terlepas dari alat desktop grafis. Flux menggunakan varian `minimum` dan secara default tidak meminta keempat backend pendamping tersebut. Periksa paket yang benar-benar terinstal; dependensi dan image kustom dapat menambahkan alat di luar yang tercantum dalam manifest.

### Deployment dan sesi

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Cantumkan disk target, pratinjau rencana deployment, atau instal MiniOS tanpa interaksi | **`minios-deploy`** | Berjalan dari sesi live MiniOS. Instalasi memerlukan akses root dan konfirmasi eksplisit; mode native, jika didukung, membuat desktop Debian standar dari image yang dipilih. | [Deployment melalui command line](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Buat, aktifkan, simpan, mount, ubah ukuran, reklamasi, ubah kredensial enkripsi, ekspor, impor, atau hapus sesi persisten | **`minios-session`** | Memerlukan akses root dan sistem live MiniOS dengan penyimpanan persistensi yang kompatibel. Penyimpanan berbasis RAM untuk menyimpan data, mount terlepas, dan operasi khusus backend hanya tersedia jika didukung. | [Referensi perintah sesi](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel dan image

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Cantumkan, kemas, aktifkan, periksa, atau hapus kernel | **`minios-kernel`** | Memerlukan akses root dan instalasi live MiniOS modular dengan root MiniOS yang dapat ditulis. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remaster pohon konten MiniOS yang sudah ada menggunakan skrip atau otomatisasi | **`minios-image-compose`** | Beroperasi pada konten image live MiniOS dan menerbitkan ISO yang dapat di-boot. | [Menyusun image ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Alur kerja modul

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Periksa modul dan kelola kumpulan modul yang sedang berjalan atau untuk boot berikutnya | **`sb`** | Pemeriksaan modul juga dapat dilakukan di luar sesi MiniOS yang sedang berjalan. Operasi pada modul yang sedang berjalan dan untuk boot berikutnya memerlukan tata letak modul live MiniOS; perubahan memerlukan akses root. | [Periksa dan ekstrak modul](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [kelola modul yang sedang berjalan dan untuk boot berikutnya](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Buat modul dari paket repositori atau file `.deb` lokal | **`apt2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Paket diinstal ke lingkungan build terisolasi, bukan ke root yang sedang berjalan. | [Buat modul dari paket](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Buat modul dengan menjalankan skrip instalasi | **`script2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Skrip dijalankan tanpa interaksi di lingkungan build terisolasi. | [Buat modul dari skrip](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Buat modul secara interaktif di lingkungan yang telah disiapkan | **`chroot2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Gunakan opsi ini jika instalasi memerlukan prompt atau perubahan manual. | [Buat modul secara interaktif](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Konversi antara pohon direktori dan modul `.sb` | **`dir2sb`**, **`sb2dir`** | Konversi biasa tidak memerlukan akses root dan dapat dilakukan di luar sesi live. Ekstraksi dan pengemasan ulang yang mempertahankan pemilik asli serta file khusus memerlukan akses root; alur kerja grafis akan meminta autentikasi administrator. | [Buat](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) atau [ekstrak](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) modul; `man dir2sb`, `man sb2dir` |
| Ambil perubahan yang memenuhi syarat dari lapisan sesi yang dapat ditulis, lalu masukkan ke dalam modul | **`savechanges`** | Memerlukan akses root dan sesi live MiniOS yang sedang berjalan dengan backend lapisan yang dapat ditulis dan didukung. | [Ambil perubahan sesi saat ini](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Alur kerja penyimpanan

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Baca atau tulis image disk, format perangkat, atau hapus penyimpanan | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operasi disk umum. Penghapusan mendukung metode penghapusan melalui pengontrol, discard, dan penimpaan dari host jika didukung oleh perangkat dan alat yang diperlukan. Operasi yang merusak biasanya memerlukan akses root. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Untuk mengubah daftar paket sumber, kernel, artefak boot, atau seluruh rantai modul, gunakan sistem build sumber, bukan salah satu alat remaster image. Lihat [Membangun MiniOS](/development/Building-MiniOS).
