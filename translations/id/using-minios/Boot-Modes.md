---
updated: 2026-10-06
---

# Mode boot

Mode boot menentukan apakah MiniOS akan memulai dari awal, membuka sesi yang tersimpan, atau berjalan sebagai sistem terinstal biasa. Anda tidak perlu memahami proses boot internal untuk memilih opsi ini.

Label menu dapat sedikit berbeda antar rilis, mode firmware, dan alat boot. Pilihlah berdasarkan hasil yang Anda butuhkan, bukan berdasarkan kata-kata persisnya.

## Pilihan cepat

Entri default normal adalah **Mulai MiniOS**. Mode ini menggunakan pemilihan persistensi otomatis: MiniOS mencoba melanjutkan sesi default yang kompatibel dan dapat membuat pengganti yang kompatibel jika tidak ada sesi yang dapat digunakan dan tersedia media penyimpanan yang dapat ditulis.

| Entri menu | Gunakan saat | Apakah perubahan disimpan? | Perlu tetap sambung USB? |
|---|---|---|---|
| **Mulai MiniOS** (default) | Penggunaan portabel normal | Ya, jika aktivasi persistensi otomatis berhasil | Ya |
| **Mulai sesi baru** | Anda ingin ruang kerja baru yang terpisah | Hanya jika sesi baru berhasil dibuat dan diaktifkan | Ya |
| **Pilih sesi yang disimpan** | Anda ingin memilih salah satu dari beberapa ruang kerja yang sudah ada | Hanya jika sesi yang dipilih berhasil diaktifkan | Ya |
| **Mulai tanpa menyimpan** | Anda ingin boot sementara yang bersih tanpa persistensi | Tidak | Ya |
| **Jalankan dari RAM** | Anda ingin menyalin data sistem MiniOS ke RAM untuk boot ini | Perubahan yang didukung RAM bersifat sementara kecuali sesi persistensi yang didukung secara eksplisit disimpan kembali atau disimpan sebagai baru | Hingga MiniOS berhasil melepas sumber dan media penyimpanan lain yang masih Anda perlukan |

Untuk boot pertama yang normal, biarkan **Mulai MiniOS** tetap dipilih. Gunakan **Mulai tanpa menyimpan** saat Anda benar-benar membutuhkan sesi pengujian perangkat keras sementara atau pemulihan yang bersih, yang tidak boleh membuka atau membuat persistensi.

::: warning Pastikan persistensi aktif
Memilih entri menu persisten akan meminta sesi, namun tidak menjamin sesi tersebut dapat dibuka. Jika penyimpanan hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat tetap berjalan tanpa menyimpan perubahan. Periksa peringatan saat startup sebelum memulai pekerjaan yang harus disimpan.
:::

## Mulai MiniOS

**Mulai MiniOS** adalah entri menu pertama dan default. Mode ini ditujukan untuk penggunaan normal, termasuk boot pertama pada perangkat MiniOS yang baru disiapkan.

MiniOS secara otomatis mencari sesi persisten yang kompatibel. Jika ada sesi default yang dapat digunakan, sesi tersebut akan dilanjutkan. Jika tidak ada, MiniOS dapat membuat sesi yang kompatibel secara otomatis jika tersedia media penyimpanan yang dapat ditulis.

Jika persistensi tidak dapat dibuat atau diaktifkan karena penyimpanan hanya-baca, penuh, rusak, atau tidak sesuai, MiniOS akan melanjutkan dengan lapisan tulis sementara dan melaporkan bahwa sesi tidak persisten. Periksa peringatan tersebut sebelum melakukan pekerjaan yang harus tetap ada setelah reboot.

Untuk sesi persisten yang berfungsi, Konfigurator MiniOS dapat menyimpan log dan cache biasa yang dipilih di RAM sambil tetap mempertahankan diagnostik boot dan data pengguna di media penyimpanan. Tiga pengaturan beserta batas RAM dijelaskan pada [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Pengaturan ini tidak berpengaruh pada **Mulai tanpa menyimpan** boot.

## Mulai sesi baru

MiniOS membuka menu pengaturan persistensi, memungkinkan Anda memilih backend penyimpanan yang didukung serta opsi enkripsi atau kompresi DynBlk yang tersedia, lalu membuat sesi persisten bernomor tambahan tanpa mengubah sesi yang sudah ada. Ini adalah perilaku saat ini`perchdir=setup`. Gunakan fitur ini untuk menjaga ruang kerja terpisah atau menguji konfigurasi baru tanpa mengganti sesi kerja Anda saat ini.

Pembuatan membutuhkan media penyimpanan yang kompatibel dan dapat ditulis serta ruang kosong yang cukup. Pilihan backend yang tersedia bergantung pada sistem file, status Secure Boot, driver/alat yang terpasang, dan kemampuan initrd. Sesi baru bukan cadangan dari sesi yang sudah ada.

## Pilih sesi yang disimpan

MiniOS menampilkan daftar sesi tersimpan yang tersedia dan memungkinkan Anda memilih salah satunya. Gunakan fitur ini jika satu perangkat berisi beberapa ruang kerja. Jika penyimpanan persistensi yang dipilih kosong, jalur `ask` secara otomatis masuk ke pengaturan persistensi sehingga Anda dapat membuat sesi pertama.

Sebuah sesi bisa tidak kompatibel jika berasal dari rilis atau edisi MiniOS yang berbeda. Pengaturan `union=` yang berbeda juga dapat membuat sesi menjadi tidak kompatibel.
Pemilihan interaktif tidak membuat sesi yang tidak kompatibel menjadi aman.

## Mulai tanpa menyimpan

Mode ini secara sengaja menonaktifkan persistensi untuk boot saat ini. MiniOS menggunakan area tulis sementara di RAM, sehingga file yang dibuat di sistem live, paket yang diinstal, dan pengaturan yang diubah akan hilang saat dimatikan.

Gunakan mode ini jika Anda secara khusus ingin:

- menguji perangkat keras tanpa membuka atau membuat sesi persisten;
- mendiagnosis masalah tanpa mengubah status yang tersimpan;
- bekerja secara sementara tanpa perlu menyimpan hasilnya.

Memulai tanpa menyimpan tidak berarti media boot dapat dilepas. Sistem yang berjalan biasanya tetap membaca modul sistemnya dari media tersebut.

## Jalankan dari RAM

Mode ini menyalin data sistem MiniOS ke RAM untuk mengurangi pembacaan dari sumber. Dibutuhkan memori yang cukup untuk sistem yang disalin dan beban kerja yang berjalan.

Penyalinan sistem dan penyalinan persistensi sekarang terpisah. Dengan permintaan persistensi, `toram` default `perchtoram` ke `trim`, sehingga sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang didukung akan disalin ke RAM sementara sesi tersimpan lain tetap berada di penyimpanan aslinya. Gunakan `perchtoram=off` jika Anda ingin sistem berada di RAM tetapi sesi persistensi aktif tetap menulis langsung ke media penyimpanan, atau `perchtoram=full` jika semua sesi yang tersimpan dan didukung harus disalin. Sesi direktori native tidak disalin oleh `perchtoram`.

Sesi persistensi yang didukung RAM bersifat tidak tahan lama selama berjalan. Saat ini, Manajer Sesi MiniOS dapat secara eksplisit menulis perubahan yang didukung RAM kembali ke penyimpanan asli dengan **Simpan Sekarang**, atau menyimpannya sebagai sesi baru bernomor, selama penyimpanan asli masih ada, dapat ditulis, dan masih sesuai dengan identitas yang tercatat saat boot. Sampai penyimpanan berhasil, perubahan RAM yang belum disimpan akan hilang saat shutdown. Kebijakan simpan otomatis SquashFS menggunakan backend sesi yang sama jika penyimpanan asli tersedia.

Jangan lepaskan perangkat boot hanya karena **Jalankan dari RAM** dipilih. Aman hanya setelah MiniOS berhasil melepas filesystem sumber, loop ISO, pemetaan Ventoy, dan dependensi persistensi lain yang masih Anda perlukan. Jika pelepasan gagal, sumber masih digunakan.

## Instalasi native

::: warning Instalasi native mengubah model sistem
Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal — identitas visual, lingkungan desktop yang dipilih, dan aplikasi biasa — namun mengubah citra live menjadi desktop Debian konvensional. Alat khusus MiniOS untuk sesi, modul, kernel modular, dan alur kerja live lainnya akan dihapus karena fitur-fitur tersebut tidak lagi berlaku.
:::

Setelah konversi native, gunakan alat paket, kernel, konfigurasi, dan bootloader Debian seperti biasa. Hasilnya tetap terlihat familiar dan mempertahankan aplikasi desktop dari edisi yang dipilih, tetapi fitur live khusus MiniOS tidak lagi tersedia. Arsitektur live MiniOS dijelaskan pada [Tentang MiniOS](/getting-started/About-MiniOS).

Gunakan [Penginstal MiniOS](/installing-minios/MiniOS-Installer) hanya jika Anda memang ingin melakukan konversi tersebut dan citra yang dipilih mendukung deployment native.

## Jika Anda membutuhkan detail lebih lanjut

- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu) menjelaskan navigasi dan pengeditan sementara entri menu.
- [Manajemen sesi](/using-minios/Sessions-and-Persistence) menjelaskan mode penyimpanan, pembuatan sesi, pengubahan ukuran, dan penghapusan.
- [Parameter boot](/reference/Boot-Parameters) adalah referensi lengkap untuk baris perintah.
- [Penemuan sistem initrd](/reference/boot-process/System-Discovery), [pemuat modul](/reference/boot-process/Module-Loading), dan [persistensi](/reference/boot-process/Persistence-Internals) menjelaskan bagaimana kelompok parameter terkait diproses saat startup.
