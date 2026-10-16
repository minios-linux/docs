---
updated: 2026-10-15
---

# Mulai cepat

Panduan ini membantu Anda beralih dari image MiniOS yang telah diunduh ke sistem yang siap digunakan. Panduan ini hanya membahas keputusan yang diperlukan untuk memulai; panduan tertaut menjelaskan setiap topik secara terperinci.

## 1. Unduh MiniOS

Pilih edisi yang paling sesuai dengan kebutuhan Anda:

| Edisi | Cocok untuk |
|---|---|
| **Standard** | **Direkomendasikan untuk sebagian besar pengguna dan pengalaman MiniOS pertama.** Sistem minimal dengan fungsi dasar dan desktop Xfce yang ringkas dan efisien untuk penggunaan sehari-hari. |
| **Toolbox** | Edisi administrasi sistem dan diagnostik untuk pekerjaan IT profesional dan pemulihan sistem. Mencakup Standard serta berbagai alat administrasi, pemulihan, jaringan, pengujian perangkat keras, pencadangan, dan akses jarak jauh. |
| **Ultra** | Desktop dengan fitur lengkap, beragam aplikasi, serta alat profesional untuk kreativitas dan pengembangan. Mencakup Toolbox serta perangkat lunak perkantoran, grafis, video, audio, 3D, pengembangan, dan kontainer. |
| **Flux** | Edisi Fluxbox yang sangat ringan untuk meminimalkan penggunaan sumber daya dan mendukung perangkat keras lama. Pilihan aplikasinya lebih terbatas dan kemudahan desktopnya lebih sedikit daripada Standard. **Tidak direkomendasikan untuk pemula.** |

Ketersediaan paket dan desktop secara persis bergantung pada rilis. Lihat [Tentang MiniOS](/getting-started/About-MiniOS) untuk mengetahui model edisi dan [Paket dan edisi](/reference/Package-and-Edition-Contents) untuk mengetahui pilihan paket yang dipelihara.

Unduh ISO dari [situs MiniOS](https://minios.dev), halaman resmi [Rilis GitHub](https://github.com/minios-linux/minios-live/releases), atau [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifikasi unduhan

Verifikasi ISO sebelum menginstalnya. Rilis MiniOS menyediakan file `.iso.sha256` yang cocok; lihat [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) untuk perintah Linux, macOS, dan Windows.

## 3. Instal MiniOS

Untuk MiniOS, menulis sistem ke media lepas-pasang juga merupakan metode instalasi: perangkat yang dihasilkan adalah sistem MiniOS yang dapat di-boot.

Pilih metode berdasarkan hasil yang Anda inginkan dari perangkat:

| Kebutuhan | Metode | Hasil |
|---|---|---|
| Drive USB biasa yang juga dapat mem-boot MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode ISO biasa atau [Instalasi berbasis file](/installing-minios/Manual-File-Based-Installation) | File MiniOS dan bootloader tersimpan di sistem file biasa, sehingga drive tetap dapat digunakan untuk menyimpan file sehari-hari |
| MiniOS bersama image ISO lainnya | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy mempertahankan partisi data biasa dan mendukung multiboot; MiniOS mendukung sesi persisten pada tata letak ini |
| Instalasi MiniOS portabel yang dikelola | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dalam mode **Live** | Membuat instalasi MiniOS modular dan dapat mengonfigurasi penyimpanan persisten |
| Salinan ISO yang persis, blok demi blok | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility), atau [`dd`](/installing-minios/installation-tools/dd) | Menyalin tata letak blok ISO; sederhana dan mudah diprediksi, tetapi perangkat tidak lagi berfungsi seperti flash drive serbaguna biasa |

Untuk drive portabel yang juga ingin Anda gunakan untuk menyimpan file biasa, pilih Rufus dalam mode ISO, instalasi berbasis file, Ventoy, atau instalasi Live yang sesuai menggunakan Penginstal MiniOS. Penulisan image mentah berguna jika salinan persis image yang diterbitkan lebih penting daripada menggunakan kembali perangkat sebagai penyimpanan serbaguna.

::: danger Periksa perangkat tujuan
Sebagian besar metode instalasi akan menimpa sebagian atau seluruh data pada perangkat yang dipilih.
Cadangkan data penting dan periksa model serta kapasitas perangkat sebelum memulai.
:::

Lihat [Menginstal MiniOS](/installing-minios/Installation-Methods) untuk mengetahui perbedaan antara penulisan image mentah, Ventoy, tata letak berbasis file, dan Penginstal MiniOS.

## 4. Jalankan MiniOS untuk pertama kalinya

1. Nyalakan ulang komputer dengan perangkat MiniOS terpasang.
2. Buka menu boot firmware komputer, lalu pilih perangkat tersebut.
3. Biarkan pilihan default **Mulai MiniOS** tetap dipilih, lalu jalankan sistem.
4. Pastikan grafis, keyboard, jaringan, dan perangkat penyimpanan yang Anda perlukan berfungsi dengan baik.

**Mulai MiniOS** adalah mode boot default yang normal. Mode ini menggunakan pemilihan persistensi otomatis: MiniOS akan mencoba melanjutkan sesi default yang kompatibel dan, jika tidak ada sesi yang dapat digunakan, dapat membuat sesi yang kompatibel bila tersedia penyimpanan tulis yang sesuai. Jika persistensi tidak dapat diaktifkan, MiniOS akan melanjutkan dengan lapisan tulis sementara dan memberi tahu bahwa perubahan tidak akan disimpan.

Artinya, boot pertama secara normal tidak mengharuskan Anda membuat sesi terlebih dahulu. Pilih **Mulai tanpa menyimpan** hanya jika Anda memang ingin melakukan boot sementara yang bersih tanpa membuka atau membuat sesi persisten.

Lihat [Mode boot](/using-minios/Boot-Modes) untuk pilihan startup lainnya. Jika perangkat tidak dapat melakukan boot atau perangkat keras penting tidak berfungsi, lihat [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## 5. Pilih perilaku sesi lain bila diperlukan

Untuk penggunaan portabel sehari-hari, tetap gunakan entri default **Mulai MiniOS**. Pilih mode lain hanya jika Anda memerlukan hasil yang berbeda:

| Pilihan boot | Gunakan jika | Hasil |
|---|---|---|
| **Mulai MiniOS** (default) | Penggunaan portabel sehari-hari | Melanjutkan sesi default yang kompatibel secara otomatis atau membuat sesi jika didukung |
| **Mulai sesi baru** | Anda menginginkan ruang kerja tambahan yang terpisah | Membuat sesi persisten bernomor tambahan tanpa mengubah sesi yang sudah ada |
| **Pilih sesi yang disimpan** | Anda ingin memilih salah satu dari beberapa ruang kerja yang sudah ada | Memungkinkan Anda memilih sesi yang sudah ada secara interaktif |
| **Mulai tanpa menyimpan** | Anda menginginkan boot sementara yang bersih tanpa persistensi | Menggunakan lapisan tulis sementara di RAM |
| **Jalankan dari RAM** | Anda ingin menyalin MiniOS ke RAM untuk boot ini | Entri yang disediakan akan memulai sesi sementara tanpa sesi tersimpan. Dengan permintaan persistensi tambahan, sesi yang didukung dapat disalin secara terpisah dan disimpan kembali secara eksplisit; data native tidak disalin |

Persistensi otomatis tetap memerlukan penyimpanan tulis yang sesuai. Menulis ISO mentah saja tidak menyiapkan penyimpanan persisten. Instalasi berbasis file, tata letak Ventoy, dan instalasi Live yang dibuat oleh [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dapat menyediakan tata letak yang dapat ditulis untuk penggunaan persisten MiniOS. Sesi yang sudah ada dapat diperiksa dan dikelola melalui [Manajemen sesi](/using-minios/Sessions-and-Persistence).

Sebelum mengandalkan persistensi, lakukan boot ulang sekali dan pastikan MiniOS melaporkan sesi yang diharapkan sebagai sesi aktif dan perubahan uji coba tetap tersimpan setelah boot ulang.

## 6. Lakukan prakonfigurasi MiniOS

Sebagian besar alat konfigurasi khusus MiniOS menyiapkan pengaturan untuk boot berikutnya atau sesi baru, bukan langsung mengubah desktop yang sedang berjalan.

Gunakan **Konfigurator MiniOS** untuk prakonfigurasi ini: lokal, zona waktu, keyboard, nama host, layanan, default akun, kebijakan keamanan, dan pengaturan startup MiniOS lainnya. Buka dari menu aplikasi atau jalankan:

```bash
minios-configurator
```

Gunakan desktop standar dan alat Linux untuk pengaturan saat sistem berjalan, seperti koneksi jaringan, audio, konfigurasi layar, dan preferensi aplikasi.
Beberapa pengaturan Konfigurator MiniOS diterapkan saat boot berikutnya, sedangkan pengaturan akun dan keamanan mungkin hanya digunakan saat sesi baru dibuat. Lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) untuk mengetahui perilaku pastinya.

## Langkah selanjutnya

Setelah MiniOS berhasil melakukan boot dan mempertahankan status yang Anda perlukan:

- [Aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications) — lihat utilitas khusus MiniOS yang tersedia di sistem.
- [Konfigurasi jaringan](/using-minios/Networking) — gunakan NetworkManager seperti biasa atau siapkan prakonfigurasi jaringan kabel MiniOS.
- [Toko Aplikasi MiniOS](/using-minios/Installing-Software) — instal aplikasi dari katalog MiniOS.
- [Manajer Modul](/preparing-and-customizing/Managing-Modules) — periksa dan kelola modul MiniOS.
- [Pencadangan dan pemulihan](/maintenance-and-recovery/Backing-Up-MiniOS) — lindungi sistem yang ingin terus Anda gunakan.
