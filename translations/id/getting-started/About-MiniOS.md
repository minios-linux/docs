---
updated: 2026-08-31
---

# Tentang MiniOS

MiniOS adalah distribusi Linux berbasis Debian yang dirancang terutama sebagai sistem operasi portabel. Sistem ini dapat dijalankan dari media eksternal atau disk lokal, dengan sistem operasi, aplikasi, dan lingkungan pengguna yang tetap independen dari komputer tertentu.

Instalasi desktop biasa lama-kelamaan akan terikat pada mesin tempatnya dipasang. MiniOS menggunakan pendekatan berbeda: lingkungan kerja dapat dibawa oleh pengguna dan digunakan di berbagai komputer yang kompatibel.
Pengaturan, file, software yang terpasang, dan sesi persisten dapat dibawa bersama sistem, bukan tersimpan di satu disk internal.

Karena itu, MiniOS dirancang untuk lebih dari sekadar lingkungan live sementara. Tujuannya adalah menyediakan sistem Linux portabel yang lengkap dan praktis untuk pekerjaan sehari-hari, pemeliharaan, pemulihan, eksperimen, serta tugas khusus.

## Apa yang membedakan MiniOS

### Dirancang untuk portabilitas

MiniOS dibangun berdasarkan gagasan sederhana: **sistem operasi seharusnya menjadi milik pengguna, bukan perangkat tempatnya dijalankan**.

Komputer menyediakan prosesor, memori, layar, antarmuka penyimpanan, dan periferal. Lingkungan MiniOS dapat tetap tersimpan di media milik pengguna dan dijalankan pada perangkat keras yang berbeda. Dengan demikian, komputer menjadi tempat sistem dijalankan saat ini, bukan tempat sistem terikat secara permanen.

### Dirancang secara modular

MiniOS dirakit dari modul SquashFS terpisah, bukan dari satu image sistem besar yang dapat ditulis. Sistem dasar, kernel, firmware, desktop, aplikasi, dan software tambahan dapat tetap berada di lapisan terpisah.

Perubahan yang dibuat pengguna dapat disimpan secara terpisah dari modul dasar tersebut. Dengan begitu, bagian-bagian sistem dapat ditambahkan, diganti, dinonaktifkan, atau diuji tanpa menulis ulang seluruh sistem operasi. Jika eksperimen tidak berjalan sesuai harapan, sistem juga lebih mudah dikembalikan ke kondisi dasar yang diketahui.

Modularitas juga memungkinkan edisi MiniOS yang berbeda dan sistem kustom berbagi arsitektur yang sama, alih-alih menjadi produk yang tidak saling terkait.

### Ringkas tanpa mengurangi kenyamanan

Nama **MiniOS** mencerminkan tujuan penting proyek ini: menjaga sistem tetap sekecil mungkin tanpa mengorbankan hal-hal penting. Namun, ukuran yang kecil tidak dicapai dengan membuat sistem menjadi tidak nyaman, rentan, atau hanya berguna untuk kebutuhan terbatas.

Image live yang sangat kecil mudah dibuat dengan menghapus firmware, lokalisasi, dukungan sistem file, persistensi, integrasi desktop, alat pemulihan, dan aplikasi. Namun, sistem operasi portabel menghadapi tantangan berbeda: sistem harus tetap berguna saat dijalankan pada perangkat keras yang belum diketahui ketika image dibuat.

MiniOS mengutamakan ukuran **sekecil mungkin secara praktis, sambil mempertahankan kenyamanan, dukungan perangkat keras, dan fungsionalitas semaksimal mungkin**. Komponen tidak dihapus hanya karena membuat ukuran ISO lebih besar; yang penting adalah apakah manfaat praktisnya sepadan dengan ruang yang digunakan.

Karena itulah, beberapa edisi MiniOS berukuran lebih besar daripada yang mungkin dibayangkan dari namanya.
Ukuran tambahan ini disengaja jika dapat meningkatkan kemudahan penggunaan sehari-hari atau membuat sistem portabel yang sama berguna di lebih banyak komputer. Pengguna yang membutuhkan sistem lebih kecil dapat memilih edisi yang lebih ringan atau set modul yang lebih ringkas, sedangkan pengguna yang memerlukan workstation lengkap dapat mempertahankan lebih banyak fungsionalitas.

### Debian, bukan ekosistem terpisah

MiniOS berbasis Debian dan sengaja tetap menjadi bagian dari ekosistem Debian.
Sistem ini menggunakan paket Debian biasa, APT, layanan standar, dan konvensi Linux yang sudah dikenal. Infrastruktur khusus MiniOS ditambahkan jika sistem modular portabel memerlukan perilaku yang tidak tersedia pada instalasi konvensional.

Proyek ini mengutamakan mekanisme Linux yang sudah mapan jika mekanisme tersebut dapat menyelesaikan masalah, alih-alih menggantinya dengan solusi khusus MiniOS.

### Transparan dan mudah disesuaikan

MiniOS berupaya mengotomatiskan pekerjaan rutin tanpa menyembunyikan struktur sistem. Pengguna dapat menggunakan alat grafis dan image siap pakai, tetapi sistem yang sama juga dapat diperiksa, dikonfigurasi ulang, diperluas dengan modul, atau dibuat ulang untuk kebutuhan khusus.

Dengan demikian, MiniOS dapat digunakan untuk berbagai keperluan tanpa harus dipecah menjadi produk-produk yang tidak saling terkait. Desktop portabel yang ringan, toolkit pemulihan, dan workstation dengan fitur lebih lengkap dapat menggunakan model dasar yang sama, dengan perbedaan utama pada modul dan aplikasi yang disertakan.

## Cara kerja MiniOS

Saat boot, MiniOS menggabungkan modul SquashFS hanya-baca ke dalam satu sistem berkas root yang berjalan, lalu menambahkan lapisan yang dapat ditulis untuk sesi saat ini. Tanpa persistensi, perubahan pada lapisan tersebut bersifat sementara. Dengan persistensi, perubahan tertentu dapat dipertahankan setelah reboot, sementara modul dasar tetap terpisah.

Sistem live modular bukan sekadar salah satu opsi instalasi: **ini adalah model MiniOS yang menjadi ciri khasnya**. Modul MiniOS, sesi persisten, konfigurasi saat boot, pengelolaan kernel modular, penyusunan image, dan aplikasi pengelolaan MiniOS dirancang berdasarkan arsitektur live ini.

Penginstal MiniOS juga menyediakan jalur instalasi **native** bagi pengguna yang lebih memilih sistem desktop konvensional dengan sistem berkas root yang dapat ditulis. Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal—lingkungan desktop pilihan, identitas visual, dan aplikasi sehari-hari—tetapi tidak lagi menggunakan model live modular: sesi MiniOS, `.sb`alur kerja modul, pengelolaan kernel modular, dan utilitas khusus MiniOS yang dirancang untuk operasi live dihapus. Sistem yang terpasang kemudian dikelola sebagai desktop Debian konvensional dengan APT, paket kernel Debian, initramfs biasa, dan bootloader yang terpasang.

Untuk detail teknis, lihat [arsitektur sistem MiniOS](/reference/System-Architecture).
Untuk mengetahui perilaku sesi yang terlihat oleh pengguna dan pilihan penyimpanan, lihat [Mode boot](/using-minios/Boot-Modes) dan [Pengelolaan sesi](/using-minios/Sessions-and-Persistence).

## Edisi

Edisi MiniOS adalah konfigurasi berbeda dari arsitektur yang sama, bukan sistem operasi terpisah.

| Edisi | Kegunaan |
|---|---|
| **Standard** | Sistem Xfce minimal dengan fungsi dasar untuk penggunaan sehari-hari; direkomendasikan bagi sebagian besar pengguna |
| **Toolbox** | Administrasi sistem dan diagnostik untuk pekerjaan TI profesional serta pemulihan sistem |
| **Ultra** | Desktop dengan fitur lengkap, beragam aplikasi, serta alat profesional untuk kreativitas dan pengembangan |
| **Flux** | Edisi Fluxbox yang sangat ringan untuk penggunaan sumber daya minimal dan perangkat keras lama; tidak direkomendasikan bagi pemula |

Desktop dan paket yang tersedia bergantung pada rilis dan platform target. Untuk mengetahui pilihan paket yang dipelihara dan hubungan antar-edisi, lihat [Paket dan edisi](/reference/Package-and-Edition-Contents). Untuk melihat alat khusus MiniOS yang tersedia di sistem, lihat [Aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications).

## Langkah berikutnya

- [Mulai cepat](/getting-started/Quick-Start) — mulai gunakan MiniOS.
- [Aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications) — temukan utilitas MiniOS yang disertakan.
- [Arsitektur sistem MiniOS](/reference/System-Architecture) — pelajari lebih lanjut model modul, sesi, dan boot.
- [Paket dan edisi](/reference/Package-and-Edition-Contents) — bandingkan konten edisi yang dipelihara.

Sumber daya proyek:

- [Situs web MiniOS](https://minios.dev)
- [Kode sumber](https://github.com/minios-linux/minios-live)
- [Pelacak masalah](https://github.com/minios-linux/minios-live/issues)
