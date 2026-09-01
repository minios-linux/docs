---
updated: 2026-08-31
---

# Tentang MiniOS

MiniOS adalah distribusi Linux berbasis Debian yang dirancang terutama sebagai sistem operasi portabel. Sistem ini dapat dijalankan dari media lepas-pasang atau disk lokal, sambil menjaga sistem operasi, aplikasi, dan lingkungan pengguna tetap independen dari komputer tertentu.

Instalasi desktop konvensional secara bertahap akan terikat pada mesin tempat ia dipasang. MiniOS mengambil pendekatan berbeda: lingkungan kerja dapat tetap bersama pengguna dan berpindah antar komputer yang kompatibel.
Pengaturan, file, perangkat lunak yang terpasang, dan sesi persisten dapat ikut berpindah bersama sistem, bukan hanya tersimpan di satu disk internal.

Oleh karena itu, MiniOS dimaksudkan untuk menjadi lebih dari sekadar lingkungan live sementara. Tujuannya adalah menyediakan sistem Linux portabel yang lengkap dan tetap praktis untuk pekerjaan sehari-hari, pemeliharaan, pemulihan, eksperimen, serta tugas khusus.

## Apa yang membedakan MiniOS

### Portabel sejak awal

MiniOS dibangun berdasarkan ide sederhana: **sistem operasi seharusnya milik pengguna, bukan milik perangkat tempat ia dijalankan**.

Komputer menyediakan prosesor, memori, tampilan, antarmuka penyimpanan, dan periferal. Lingkungan MiniOS dapat tetap berada di media milik pengguna sendiri dan dijalankan di perangkat keras yang berbeda. Hal ini membuat komputer menjadi tempat sistem dijalankan hari ini, bukan tempat di mana sistem tersebut secara permanen terikat.

### Modular sejak awal

MiniOS dirakit dari modul-modul SquashFS terpisah yang hanya-baca, bukan satu citra sistem besar yang dapat ditulis. Sistem dasar, kernel, firmware, desktop, aplikasi, dan perangkat lunak tambahan dapat tetap menjadi lapisan-lapisan terpisah.

Perubahan pengguna dapat disimpan secara independen dari modul-modul dasar tersebut. Hal ini memungkinkan penambahan, penggantian, penonaktifan, atau pengujian bagian sistem tanpa harus menulis ulang seluruh sistem operasi, serta memudahkan untuk kembali ke kondisi dasar yang sudah diketahui jika eksperimen tidak berjalan sesuai harapan.

Modularitas juga memungkinkan berbagai edisi MiniOS dan sistem kustom berbagi arsitektur yang sama, bukan menjadi produk yang tidak saling terkait.

### Ringkas tanpa mengorbankan kenyamanan

Nama **MiniOS** mencerminkan tujuan penting proyek ini: menjaga sistem tetap sekecil mungkin secara wajar. Namun, ukuran kecil tidak dikejar dengan mengorbankan kenyamanan, kestabilan, atau kegunaan sistem.

Citra live yang sangat kecil memang mudah dibuat jika firmware, lokaliasi, dukungan filesystem, persistensi, integrasi desktop, alat pemulihan, dan aplikasi dihilangkan. Namun, sistem operasi portabel menghadapi tantangan berbeda: sistem ini harus tetap berguna ketika dijalankan di perangkat keras yang belum diketahui saat citra dibuat.

Karena itu, MiniOS menargetkan **ukuran sekecil mungkin tanpa mengurangi kenyamanan, dukungan perangkat keras, dan fungsionalitas yang wajar**. Sebuah komponen tidak dihapus hanya karena membuat ukuran ISO lebih besar; pertanyaan pentingnya adalah apakah ruang yang digunakan memberikan nilai praktis yang cukup.

Inilah sebabnya beberapa edisi MiniOS berukuran lebih besar dari yang mungkin diasumsikan dari namanya.
Penambahan ukuran ini memang disengaja jika meningkatkan kemudahan penggunaan sehari-hari atau membuat sistem portabel yang sama dapat digunakan di lebih banyak komputer. Pengguna yang membutuhkan sistem lebih kecil dapat memilih edisi yang lebih ringan atau set modul yang dikurangi, sementara pengguna yang membutuhkan workstation lengkap bisa mempertahankan lebih banyak fungsionalitas.

### Debian, bukan ekosistem terpisah

MiniOS berbasis Debian dan secara sengaja tetap menjadi bagian dari ekosistem Debian.
Sistem ini menggunakan paket Debian standar, APT, layanan standar, dan konvensi Linux yang sudah dikenal. Infrastruktur khusus MiniOS ditambahkan hanya jika sistem modular portabel membutuhkan perilaku yang tidak disediakan oleh instalasi konvensional.

Proyek ini lebih memilih mekanisme Linux yang sudah mapan jika sudah menyelesaikan masalah, daripada menggantinya dengan solusi khusus MiniOS.

### Transparan dan adaptif

MiniOS berupaya mengotomatisasi pekerjaan rutin tanpa menyembunyikan struktur sistem. Pengguna dapat tetap menggunakan alat grafis dan citra siap pakai, namun sistem yang sama juga dapat diperiksa, dikonfigurasi ulang, diperluas dengan modul, atau dibangun ulang untuk kebutuhan khusus.

Hal ini memungkinkan MiniOS melayani berbagai tugas tanpa harus menjadi produk yang terpisah. Desktop portabel ringan, toolkit pemulihan, dan workstation yang lebih lengkap dapat menggunakan model dasar yang sama dan berbeda terutama pada modul serta aplikasi yang disertakan.

## Cara kerja MiniOS

Saat boot, MiniOS menggabungkan modul SquashFS yang hanya-baca menjadi satu filesystem root yang berjalan dan menambahkan layer yang dapat ditulis untuk sesi saat ini. Tanpa persistensi, status yang dapat ditulis tersebut bersifat sementara. Dengan persistensi, perubahan tertentu dapat bertahan setelah reboot sementara modul dasar tetap terpisah.

Sistem live modular bukan hanya salah satu opsi instalasi: **ini adalah model MiniOS yang mendefinisikan**. Modul MiniOS, sesi persisten, konfigurasi saat boot, manajemen kernel modular, komposisi image, dan aplikasi manajemen MiniOS semuanya dirancang berdasarkan arsitektur live ini.

Penginstal MiniOS juga menyediakan jalur instalasi **native** untuk pengguna yang lebih memilih sistem desktop konvensional pada filesystem root yang dapat ditulis. Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal — lingkungan desktop yang dipilih, identitas visual, dan aplikasi-aplikasi biasa — namun meninggalkan model live modular: sesi MiniOS, alur kerja modul `.sb`, manajemen kernel modular, dan utilitas khusus MiniOS yang dirancang untuk operasi live akan dihapus. Sistem yang telah diinstal kemudian dikelola sebagai desktop Debian konvensional dengan APT, paket kernel Debian, initramfs normal, dan bootloader yang telah diinstal.

Untuk detail teknis, lihat [arsitektur sistem MiniOS](/reference/System-Architecture).
Untuk perilaku sesi yang terlihat oleh pengguna dan pilihan penyimpanan, lihat [Mode boot](/using-minios/Boot-Modes) dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Edisi

Edisi MiniOS adalah konfigurasi berbeda dari arsitektur yang sama, bukan sistem operasi yang terpisah.

| Edisi | Tujuan |
|---|---|
| **Standard** | Sistem Xfce minimal dengan fungsionalitas dasar untuk komputasi sehari-hari; direkomendasikan untuk sebagian besar pengguna |
| **Toolbox** | Administrasi sistem dan diagnostik untuk pekerjaan IT profesional dan pemulihan sistem |
| **Ultra** | Desktop lengkap dengan berbagai aplikasi dan alat profesional untuk kreativitas serta pengembangan |
| **Flux** | Edisi Fluxbox ultra-ringan untuk penggunaan sumber daya minimal dan perangkat keras lama; tidak direkomendasikan untuk pemula |

Ketersediaan desktop dan paket yang tepat tergantung pada rilis dan platform target. Untuk daftar paket yang dipelihara dan hubungan antar edisi, lihat [Paket dan edisi](/reference/Package-and-Edition-Contents). Untuk alat khusus MiniOS yang tersedia di sistem, lihat [aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications).

## Langkah selanjutnya

- [Mulai cepat](/getting-started/Quick-Start) — mulai menggunakan MiniOS.
- [Aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications) — temukan utilitas MiniOS yang disertakan.
- [Arsitektur sistem MiniOS](/reference/System-Architecture) — pahami lebih detail tentang model modul, sesi, dan boot.
- [Paket dan edisi](/reference/Package-and-Edition-Contents) — bandingkan isi edisi yang dipelihara.

Sumber daya proyek:

- [Situs web MiniOS](https://minios.dev)
- [Kode sumber](https://github.com/minios-linux/minios-live)
- [Pelacak isu](https://github.com/minios-linux/minios-live/issues)
