---
updated: 2026-10-15
---

# Mode boot

Mode boot menentukan apakah MiniOS memulai sesi baru dengan bersih, membuka sesi tersimpan, atau berjalan sebagai sistem terinstal konvensional. Anda tidak perlu memahami proses boot internal untuk menentukan pilihan ini.

Label menu dapat sedikit berbeda bergantung pada rilis, mode firmware, dan alat boot. Pilih berdasarkan hasil yang Anda inginkan, bukan berdasarkan kata-kata persisnya.

## Pilihan cepat

Entri default yang normal adalah **Mulai MiniOS**. Entri ini menggunakan pemilihan persistensi otomatis: MiniOS mencoba melanjutkan sesi default yang kompatibel dan dapat membuat sesi pengganti yang kompatibel jika tidak ada sesi yang dapat digunakan dan tersedia penyimpanan yang sesuai serta dapat ditulisi.

| Entri menu | Gunakan jika | Apakah perubahan disimpan? | Perlukah USB tetap terhubung? |
|---|---|---|---|
| **Mulai MiniOS** (default) | Penggunaan portabel biasa | Ya, jika aktivasi persistensi otomatis berhasil | Ya |
| **Mulai sesi baru** | Anda ingin ruang kerja baru yang terpisah | Hanya jika sesi baru berhasil dibuat dan diaktifkan | Ya |
| **Pilih sesi yang disimpan** | Anda ingin memilih salah satu dari beberapa ruang kerja yang ada | Hanya jika sesi yang dipilih berhasil diaktifkan | Ya |
| **Mulai tanpa menyimpan** | Anda ingin boot sementara yang bersih tanpa persistensi | Tidak | Ya |
| **Jalankan dari RAM** | Anda ingin menyalin data sistem MiniOS ke RAM untuk boot ini | Perubahan yang didukung RAM bersifat sementara, kecuali jika sesi persistensi yang didukung secara eksplisit disimpan kembali atau disimpan sebagai sesi baru | Sampai MiniOS berhasil melepaskan sumber dan penyimpanan apa pun yang masih Anda perlukan |

Untuk boot pertama yang normal, biarkan **Mulai MiniOS** dipilih. Gunakan **Mulai tanpa menyimpan** jika Anda secara khusus memerlukan sesi pengujian perangkat keras atau pemulihan sementara yang bersih, tanpa membuka atau membuat persistensi.

::: warning Pastikan persistensi aktif
Memilih entri menu persisten akan meminta penggunaan sesi, tetapi tidak menjamin sesi tersebut dapat dibuka. Jika penyimpanan hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat berjalan tanpa menyimpan perubahan. Periksa peringatan saat startup sebelum mulai mengerjakan sesuatu yang harus dipertahankan.
:::

## Mulai MiniOS

**Mulai MiniOS** adalah entri menu pertama dan default. Entri ini ditujukan untuk penggunaan normal, termasuk boot pertama perangkat MiniOS yang baru disiapkan.

MiniOS secara otomatis mencari sesi persisten yang kompatibel. Jika ada sesi default yang dapat digunakan, sesi tersebut akan dilanjutkan. Jika tidak ada, MiniOS dapat membuat sesi yang kompatibel secara otomatis jika tersedia penyimpanan yang sesuai dan dapat ditulisi.

Jika persistensi tidak dapat dibuat atau diaktifkan karena penyimpanan hanya-baca, penuh, rusak, atau tidak sesuai, MiniOS akan melanjutkan dengan lapisan tulis sementara dan memberi tahu bahwa sesi tidak persisten. Periksa peringatan tersebut sebelum melakukan pekerjaan yang harus tetap tersedia setelah reboot.

Untuk sesi persisten yang berfungsi, Konfigurator MiniOS dapat menyimpan log dan cache biasa yang dipilih di RAM, sementara diagnostik boot dan data pengguna tetap disimpan di penyimpanan. Tiga pengaturan beserta batas RAM-nya dijelaskan di bagian [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Pengaturan tersebut tidak berpengaruh pada boot **Mulai tanpa menyimpan**.

## Mulai sesi baru

MiniOS membuka menu penyiapan persistensi, memungkinkan Anda memilih backend penyimpanan yang didukung serta opsi enkripsi atau kompresi DynBlk yang tersedia, lalu membuat sesi persisten bernomor tambahan tanpa mengubah sesi yang sudah ada. Inilah perilaku `perchdir=setup` saat ini. Gunakan fitur ini untuk menyimpan ruang kerja terpisah atau menguji konfigurasi baru tanpa mengganti sesi yang sedang Anda gunakan.

Pembuatan sesi memerlukan penyimpanan kompatibel yang dapat ditulisi dan ruang kosong yang cukup. Pilihan backend yang tersedia bergantung pada sistem file, status Secure Boot, driver/alat yang terinstal, serta kemampuan initrd. Sesi baru bukan cadangan dari sesi yang sudah ada.

## Pilih sesi yang disimpan

MiniOS menampilkan sesi tersimpan yang tersedia dan memungkinkan Anda memilih salah satunya. Gunakan ini jika satu perangkat memiliki beberapa ruang kerja. Jika penyimpanan persisten yang dipilih kosong, `ask` jalur tersebut otomatis masuk ke penyiapan penyimpanan persisten agar Anda dapat membuat sesi pertama.

Sesi mungkin tidak kompatibel jika berasal dari rilis atau edisi MiniOS lain. Pengaturan `union=` yang berbeda juga dapat menyebabkan sesi tidak kompatibel.
Memilih sesi secara interaktif tidak membuat sesi yang tidak kompatibel menjadi aman.

Dialog ketidakcocokan dapat mereset perangkat lunak yang terinstal di sistem dengan tetap mempertahankan data dan, secara opsional, pengaturan sistem. Kedua mode reset mempertahankan folder home, pengaturan pribadi, akun, dan kata sandi. Mode ini memerlukan ruang kosong untuk menyimpan sementara data yang dipertahankan; reset SquashFS baru menjadi permanen setelah disimpan. Lihat [Pengelolaan sesi](/using-minios/Sessions-and-Persistence) sebelum melakukan reset.

## Mulai tanpa menyimpan

Mode ini sengaja menonaktifkan persistensi untuk boot saat ini. MiniOS menggunakan area sementara yang dapat ditulisi di RAM, sehingga file yang dibuat di sistem live, paket yang diinstal, dan pengaturan yang diubah akan hilang saat dimatikan.

Gunakan mode ini jika Anda ingin:

- menguji perangkat keras tanpa membuka atau membuat sesi persisten;
- mendiagnosis masalah tanpa mengubah status tersimpan;
- bekerja sementara saat tidak ada yang perlu dipertahankan.

Memulai tanpa menyimpan bukan berarti media boot dapat dilepas. Sistem yang sedang berjalan biasanya tetap membaca modul sistemnya dari media tersebut.

## Jalankan dari RAM

Mode ini menyalin data sistem MiniOS ke RAM untuk mengurangi pembacaan dari sumber. Mode ini memerlukan memori yang cukup untuk menampung sistem yang disalin dan beban kerja yang sedang berjalan.

Penyalinan sistem dan penyalinan persistensi adalah proses terpisah. Jika persistensi diminta, `toram` secara default `perchtoram` akan `trim`, sehingga sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang didukung dan dipilih akan disalin ke RAM, sementara sesi tersimpan lain tetap berada di penyimpanan asal. Gunakan `perchtoram=off` jika Anda ingin sistem berada di RAM, tetapi sesi persistensi aktif tetap menulis langsung ke penyimpanan, atau `perchtoram=full` jika semua sesi tersimpan yang didukung harus disalin. Data direktori native tidak disalin: permintaan RAM native yang berhasil akan memulai kontainer baru yang kosong. Saat reset sesi native, penyalinan dinonaktifkan untuk mempertahankan data. Jika penyalinan sesi kekurangan memori atau gagal, MiniOS akan melaporkan penggunaan metode alternatif dan mempertahankan sesi di penyimpanan.

Sesi persistensi yang didukung RAM tidak permanen selama sedang berjalan. Manajer Sesi MiniOS saat ini dapat menulis perubahan yang didukung dan berbasis RAM kembali ke penyimpanan asal secara eksplisit dengan **Simpan Sekarang**, atau menyimpannya sebagai sesi bernomor baru, selama penyimpanan asal tersedia, dapat ditulisi, dan masih cocok dengan identitas yang tercatat saat boot. Sebelum penyimpanan berhasil, perubahan RAM yang belum disimpan akan hilang saat dimatikan. Kebijakan penyimpanan otomatis SquashFS menggunakan backend sesi yang sama jika penyimpanan asal tersedia.

Jangan lepaskan perangkat boot hanya karena **Jalankan dari RAM** telah dipilih. Perangkat hanya aman dilepas setelah MiniOS berhasil melepaskan filesystem sumber, loop ISO, pemetaan Ventoy, dan dependensi persistensi apa pun yang masih diperlukan. Jika pelepasan gagal, sumber masih digunakan.

## Image persistensi Ventoy

Dengan backend Persistence Plugin Ventoy yang dipilih, boot persisten menggunakan satu lingkungan ext4 yang dapat ditulisi dari image tersebut, bukan sesi MiniOS bernomor. **Mulai sesi baru** dan **Pilih sesi yang disimpan** tidak dapat membuat atau memilih sesi bernomor dalam mode ini; pilih backend lain di Ventoy. Manajer Sesi dan `perchtoram` tidak tersedia, sehingga bahkan boot sistem RAM tetap menggunakan image tersebut. **Mulai tanpa menyimpan** tetap menggunakan upper RAM sementara. Boot Ventoy biasa tanpa image plugin yang dipilih tetap menggunakan perilaku sesi MiniOS normal. Lihat [Ventoy](/installing-minios/installation-tools/Ventoy).

## Instalasi native

::: warning Instalasi native mengubah model sistem
Instalasi native mempertahankan pengalaman desktop yang familier, MiniOS — identitas visualnya, lingkungan desktop yang dipilih, dan aplikasi umum — tetapi mengubah image live menjadi desktop Debian konvensional. Alat khusus MiniOS untuk sesi, modul, kernel modular, dan alur kerja live lainnya dihapus karena fitur-fitur tersebut tidak lagi berlaku.
:::

Setelah konversi native, gunakan alat Debian biasa untuk paket, kernel, konfigurasi, dan bootloader. Hasilnya tetap familier secara visual dan mempertahankan aplikasi desktop umum dari edisi yang dipilih, tetapi rangkaian fitur live khusus MiniOS tidak lagi tersedia. Arsitektur live MiniOS dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS).

Gunakan [Penginstal MiniOS](/installing-minios/MiniOS-Installer) hanya jika Anda memang ingin melakukan konversi tersebut dan image yang dipilih mendukung deployment native.

## Untuk informasi lebih lanjut

- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu) menjelaskan navigasi dan pengeditan sementara entri menu.
- [Manajemen sesi](/using-minios/Sessions-and-Persistence) menjelaskan mode penyimpanan, pembuatan, pengubahan ukuran, dan penghapusan sesi.
- [Parameter boot](/reference/Boot-Parameters) merupakan referensi lengkap baris perintah.
- [Penemuan sistem initrd](/reference/boot-process/System-Discovery), [pemuatan modul](/reference/boot-process/Module-Loading), dan [persistensi](/reference/boot-process/Persistence-Internals) menjelaskan cara grup parameter terkait diproses saat startup.
