---
updated: 2026-08-31
---

# Mulai Cepat

Panduan ini membawa Anda dari mengunduh image MiniOS hingga sistem siap digunakan. Panduan ini hanya membahas keputusan yang diperlukan untuk memulai pertama kali; panduan terkait menjelaskan setiap topik secara detail.

## 1. Unduh MiniOS

Pilih edisi yang paling sesuai dengan kebutuhan Anda:

| Edisi | Paling cocok untuk |
|---|---|
| **Standard** | **Direkomendasikan untuk sebagian besar pengguna dan pengalaman pertama MiniOS.** Sistem minimal dengan fungsionalitas dasar dan desktop Xfce yang ringkas serta efisien untuk komputasi sehari-hari. |
| **Toolbox** | Edisi administrasi sistem dan diagnostik untuk pekerjaan IT profesional dan pemulihan sistem. Termasuk Standard ditambah alat administrasi, pemulihan, jaringan, pengujian perangkat keras, backup, dan akses jarak jauh. |
| **Ultra** | Desktop lengkap dengan berbagai aplikasi dan alat profesional untuk kreativitas dan pengembangan. Termasuk Toolbox serta aplikasi perkantoran, grafis, video, audio, 3D, pengembangan, dan perangkat lunak container. |
| **Flux** | Edisi Fluxbox yang sangat ringan untuk penggunaan sumber daya minimal dan perangkat keras lama. Memiliki set aplikasi yang lebih sedikit dan fitur desktop yang lebih terbatas dibandingkan Standard. **Tidak direkomendasikan untuk pemula.** |

Ketersediaan paket dan desktop yang tepat tergantung pada rilis. Lihat [Tentang MiniOS](/getting-started/About-MiniOS) untuk model edisi dan [Paket dan edisi](/reference/Package-and-Edition-Contents) untuk daftar paket yang dikelola.

Unduh file ISO dari [situs web MiniOS](https://minios.dev), halaman resmi [GitHub Releases](https://github.com/minios-linux/minios-live/releases), atau [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Verifikasi unduhan

Verifikasi file ISO sebelum menginstalnya. Rilis MiniOS menyediakan file `.iso.sha256` yang sesuai; lihat [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) untuk perintah di Linux, macOS, dan Windows.

## 3. Instal MiniOS

Untuk MiniOS, menulis sistem ke media yang dapat dilepas sudah merupakan metode instalasi: perangkat yang dihasilkan akan menjadi sistem MiniOS yang dapat di-boot.

Pilih metode berdasarkan hasil yang Anda inginkan dari perangkat tersebut:

| Yang Anda inginkan | Metode | Hasil |
|---|---|---|
| USB drive normal yang juga dapat boot MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode ISO normal atau [Instalasi berbasis file](/installing-minios/Manual-File-Based-Installation) | File MiniOS dan bootloader berada di filesystem normal, sehingga drive tetap bisa digunakan untuk file biasa |
| MiniOS bersama ISO image lain | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy tetap memiliki partisi data normal, mendukung multiboot, dan MiniOS mendukung sesi persisten pada tata letak ini |
| Instalasi MiniOS portabel yang terkelola | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dalam mode **Live** | Membuat instalasi MiniOS modular dan dapat mengonfigurasi penyimpanan persisten |
| Salinan blok demi blok yang persis dari ISO | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility), atau [`dd`](/installing-minios/installation-tools/dd) | Mereproduksi tata letak blok ISO; sederhana dan dapat diprediksi, tetapi perangkat tidak lagi berfungsi seperti flash drive umum |

Untuk drive portabel yang juga ingin Anda gunakan untuk penyimpanan file biasa, sebaiknya gunakan Rufus dalam mode ISO, instalasi berbasis file, Ventoy, atau instalasi Live yang sesuai yang dibuat oleh Penginstal MiniOS. Penulisan image mentah berguna jika Anda membutuhkan salinan persis dari image yang dipublikasikan dibandingkan menggunakan perangkat sebagai penyimpanan umum.

::: danger Periksa perangkat target
Kebanyakan metode instalasi akan menimpa sebagian atau seluruh data pada perangkat yang dipilih.
Cadangkan data penting dan pastikan model serta kapasitas perangkat sebelum memulai.
:::

Lihat [Menginstal MiniOS](/installing-minios/Installation-Methods) untuk perbedaan antara penulisan image mentah, Ventoy, tata letak berbasis file, dan Penginstal MiniOS.

## 4. Jalankan MiniOS untuk pertama kali

1. Restart komputer dengan perangkat MiniOS terpasang.
2. Buka menu boot firmware komputer dan pilih perangkat tersebut.
3. Biarkan entri default **Start MiniOS** tetap terpilih dan mulai sistem.
4. Pastikan grafis, keyboard, jaringan, dan perangkat penyimpanan yang Anda butuhkan berfungsi dengan baik.

**Start MiniOS** adalah mode boot default normal. Mode ini menggunakan pemilihan persistensi otomatis: MiniOS mencoba melanjutkan sesi default yang kompatibel dan, jika tidak ada sesi yang dapat digunakan, dapat membuat sesi baru jika tersedia media penyimpanan yang dapat ditulis. Jika persistensi tidak dapat diaktifkan, MiniOS akan melanjutkan dengan layer sementara yang dapat ditulis dan memberi tahu bahwa perubahan tidak akan disimpan.

Artinya, boot pertama kali secara normal tidak mengharuskan Anda membuat sesi terlebih dahulu. Pilih **Start tanpa menyimpan** hanya jika Anda memang menginginkan boot sementara yang bersih tanpa membuka atau membuat sesi persisten.

Lihat [Mode boot](/using-minios/Boot-Modes) untuk pilihan startup lainnya. Jika perangkat tidak bisa boot atau perangkat keras penting tidak berfungsi, lihat [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## 5. Pilih perilaku sesi lain jika diperlukan

Untuk penggunaan portabel normal, tetap gunakan entri **Mulai MiniOS** secara default. Pilih mode lain hanya jika Anda memerlukan hasil yang berbeda:

| Pilihan boot | Gunakan saat | Hasil |
|---|---|---|
| **Mulai MiniOS** (default) | Penggunaan portabel normal | Secara otomatis melanjutkan sesi default yang kompatibel atau membuat sesi baru jika didukung |
| **Mulai sesi baru** | Anda ingin ruang kerja tambahan yang terpisah | Membuat sesi persisten tambahan dengan nomor urut dan menjaga sesi yang ada tetap utuh |
| **Pilih sesi tersimpan** | Anda ingin memilih salah satu dari beberapa ruang kerja yang sudah ada | Memungkinkan Anda memilih sesi yang sudah ada secara interaktif |
| **Mulai tanpa menyimpan** | Anda ingin boot sementara yang bersih tanpa persistensi | Menggunakan lapisan tulis sementara di RAM |
| **Jalankan dari RAM** | Anda ingin menyalin MiniOS ke RAM untuk boot ini | Berjalan dari salinan RAM; perlakukan perubahan sebagai sementara |

Persistensi otomatis tetap membutuhkan media penyimpanan yang dapat ditulis. Penulisan ISO mentah tidak secara otomatis menyiapkan penyimpanan persisten. Instalasi berbasis file, tata letak Ventoy, dan instalasi Live yang dibuat oleh [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dapat menyediakan tata letak yang dapat ditulis untuk penggunaan MiniOS persisten. Sesi yang ada dapat diperiksa dan dikelola dengan [Manajemen sesi](/using-minios/Sessions-and-Persistence).

Sebelum mengandalkan persistensi, reboot sekali dan pastikan MiniOS melaporkan sesi yang diharapkan aktif dan perubahan uji bertahan setelah reboot.

## 6. Prakonfigurasi MiniOS

Sebagian besar alat konfigurasi khusus MiniOS menyiapkan pengaturan untuk boot berikutnya atau sesi baru, bukan langsung mengubah desktop yang sedang berjalan.

Gunakan **Konfigurator MiniOS** untuk prakonfigurasi ini: lokal, zona waktu, keyboard, hostname, layanan, default akun, kebijakan keamanan, dan pengaturan startup MiniOS lainnya. Buka dari menu aplikasi atau jalankan:

```bash
minios-configurator
```

Gunakan desktop standar dan alat Linux untuk pengaturan runtime biasa seperti koneksi jaringan, audio, konfigurasi tampilan, dan preferensi aplikasi.
Beberapa pengaturan Konfigurator MiniOS akan diterapkan pada boot berikutnya, sedangkan pengaturan akun dan keamanan mungkin hanya digunakan saat sesi baru dibuat. Lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) untuk perilaku detailnya.

## Langkah selanjutnya

Setelah MiniOS berhasil boot dan menyimpan status yang Anda butuhkan:

- [Aplikasi dan alat MiniOS](/using-minios/MiniOS-Applications) — lihat utilitas khusus MiniOS yang tersedia di sistem.
- [Konfigurasi jaringan](/using-minios/Networking) — gunakan NetworkManager seperti biasa atau siapkan prakonfigurasi kabel MiniOS.
- [Toko Aplikasi MiniOS](/using-minios/Installing-Software) — instal aplikasi dari katalog MiniOS.
- [Manajer Modul](/preparing-and-customizing/Managing-Modules) — periksa dan kelola modul MiniOS.
- [Backup dan pemulihan](/maintenance-and-recovery/Backing-Up-MiniOS) — lindungi sistem yang ingin Anda gunakan terus-menerus.
