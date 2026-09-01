---
updated: 2026-08-31
---

# MiniOS aplikasi

MiniOS menyediakan alat grafis dan baris perintah untuk konfigurasi, instalasi, sesi, modul, kernel, perangkat lunak, dan pembuatan ulang citra. Alat-alat ini dirancang berdasarkan arsitektur live modular yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS).

## Ketersediaan

Alat yang tersedia bergantung pada paket yang disertakan dalam citra MiniOS. Periksa sistem live yang sedang berjalan dengan `dpkg-query`, atau tinjau modul citra dan [daftar paket](/reference/Package-and-Edition-Contents).

Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal — identitas visual, lingkungan desktop pilihan, dan aplikasi umum — namun tidak menyertakan perangkat lunak manajemen khusus MiniOS yang dirancang untuk arsitektur live. Sesi, modul `.sb`, manajemen kernel modular, dan alur kerja serupa tidak lagi berlaku, sehingga sistem yang terinstal akan menggunakan alat paket, kernel, konfigurasi, dan bootloader Debian standar.

## Alat grafis

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Edit pengaturan waktu boot dan sesi baru MiniOS | **Konfigurator MiniOS** | Untuk model konfigurasi live MiniOS. Alat ini menulis pengaturan untuk boot live berikutnya dan tidak langsung mengubah sistem yang sedang berjalan. | [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Deploy MiniOS ke disk lain | **Penginstal MiniOS** | Berjalan dari sesi live MiniOS. Mode live mempertahankan lingkungan live MiniOS secara lengkap; mode native membuat desktop Debian konvensional dan menghapus perangkat lunak khusus MiniOS yang ditujukan untuk operasi live. | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) |
| Membuat, memilih, mengubah ukuran, menyimpan, atau menghapus sesi persisten | **Manajer Sesi MiniOS** | Hanya untuk sistem live MiniOS. | [Manajemen sesi](/using-minios/Sessions-and-Persistence) |
| Paket, aktifkan, inspeksi, atau hapus kernel MiniOS | **Manajer Kernel MiniOS** | Hanya untuk sistem live modular MiniOS. | [Manajemen kernel](/preparing-and-customizing/Managing-Kernels) |
| Instal aplikasi atau buat modul aplikasi dari resep katalog | **Toko Aplikasi MiniOS** | Sistem live MiniOS. Pilih instalasi modul atau langsung ke sistem; persistensi menentukan apakah perubahan langsung bertahan setelah reboot. | [Toko Aplikasi MiniOS](/using-minios/Installing-Software) |
| Remaster citra MiniOS yang ada melalui proyek terpandu | **Pembuat Citra MiniOS** | Bekerja dengan konten citra live MiniOS dari sesi live yang berjalan, ISO, atau media optik. Alat ini membuat ISO live baru. | [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspeksi, buat, aktifkan, dan pilih modul `.sb` | **Manajer Modul MiniOS** | Hanya untuk sistem live MiniOS; komposisi modul dan aktivasi saat runtime bergantung pada model root berlapis `.sb`. | [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules) |
| Tulis ISO MiniOS ke USB drive | **Utilitas Disk** | Utilitas disk-image generik yang disertakan dengan MiniOS. Alat ini menulis media bootable; tidak melakukan deployment terkelola seperti Penginstal MiniOS. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) |
| Jelajahi dokumentasi yang terinstal secara offline | **Bantuan MiniOS** | Membaca dokumentasi yang sudah dikemas tanpa perlu koneksi jaringan. | [Dokumentasi Bantuan MiniOS](/) |

## Alat baris perintah

Sebagian besar alat grafis memiliki padanan baris perintah publik atau backend. Perintah-perintah ini dikirimkan baik dalam paket yang sama dengan aplikasi grafis atau dalam paket pendamping yang diperlukan. Manifest inti bersama mencakup `minios-tools` dan `minios-image-compose`. Perintah lainnya mengikuti ketersediaan paket grafis terkait. Kehadiran mereka di sistem atau citra yang diinstal tertentu tetap harus diperiksa secara langsung.

### Deployment dan sesi

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Daftar disk target, pratinjau rencana deployment, atau instal MiniOS secara non-interaktif | **`minios-deploy`** | Berjalan dari sesi live MiniOS. Instalasi memerlukan akses root dan konfirmasi eksplisit; mode native, jika didukung, akan membuat desktop Debian konvensional dari citra yang dipilih. | [Penginstal MiniOS](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Membuat, mengaktifkan, menyimpan, mengubah ukuran, mengekspor, mengimpor, atau menghapus sesi persisten | **`minios-session`** | Memerlukan akses root dan sistem live MiniOS dengan penyimpanan persistensi yang kompatibel. | [Manajemen sesi](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernel dan citra

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Daftar, paket, aktifkan, inspeksi, atau hapus kernel | **`minios-kernel`** | Memerlukan akses root dan instalasi live modular MiniOS dengan root MiniOS yang dapat ditulis. | [Manajemen kernel](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Remaster pohon konten MiniOS yang ada dari skrip atau otomatisasi | **`minios-image-compose`** | Beroperasi pada konten citra live MiniOS dan menghasilkan ISO bootable. | [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images); `man minios-image-compose` |

### Alur kerja modul

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Inspeksi modul dan kelola set modul yang berjalan atau untuk boot berikutnya | **`sb`** | Inspeksi modul juga dapat dilakukan di luar sesi MiniOS yang berjalan. Operasi berjalan dan boot berikutnya memerlukan tata letak modul live MiniOS; perubahan memerlukan akses root. | [Membuat modul](/preparing-and-customizing/Managing-Modules); `man sb` |
| Bangun modul dari paket repository atau file lokal `.deb` | **`apt2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Paket akan diinstal ke lingkungan build terisolasi, bukan root yang sedang berjalan. | [Membuat modul](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Bangun modul dengan menjalankan skrip instalasi | **`script2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Skrip dijalankan secara non-interaktif di lingkungan build terisolasi. | [Membuat modul](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Bangun modul secara interaktif di lingkungan yang telah disiapkan | **`chroot2sb`** | Memerlukan akses root dan sesi live MiniOS yang didukung. Gunakan jika instalasi memerlukan prompt atau perubahan manual. | [Membuat modul](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Konversi antara pohon direktori dan modul `.sb` | **`dir2sb`**, **`sb2dir`** | Konversi biasa tidak memerlukan root dan dapat digunakan di luar sesi live yang berjalan jika alat dan file input yang dibutuhkan tersedia. | [Membuat](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) atau [mengekstrak](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) modul; `man dir2sb`, `man sb2dir` |
| Tangkap perubahan yang memenuhi syarat dari layer sesi yang dapat ditulis ke dalam modul | **`savechanges`** | Memerlukan akses root dan sesi live MiniOS yang berjalan dengan backend layer-tulis yang didukung. | [Membuat modul](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Alur kerja penyimpanan

| Tugas | Alat | Cakupan | Dokumentasi |
|---|---|---|---|
| Baca atau tulis citra disk, format perangkat, atau timpa perangkat | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operasi disk generik. Penulisan, format, dan penghapusan bersifat destruktif dan biasanya memerlukan akses root. | [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Untuk perubahan pada daftar paket sumber, kernel, artefak boot, atau seluruh rantai modul, gunakan sistem build sumber daripada alat pembuatan ulang citra. Lihat [Membangun MiniOS](/development/Building-MiniOS).
