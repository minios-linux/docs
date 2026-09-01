---
updated: 2026-08-31
---

# Mode boot

Mode boot menentukan apakah MiniOS akan memulai dari awal, membuka sesi yang tersimpan, atau berjalan sebagai sistem terinstal konvensional. Anda tidak perlu memahami proses boot internal untuk membuat pilihan ini.

Label menu dapat sedikit berbeda antara rilis, mode firmware, dan alat boot. Pilih berdasarkan hasil yang Anda butuhkan, bukan dari kata-kata persisnya.

## Pilihan cepat

Entri default normal adalah **Mulai MiniOS**. Ini menggunakan pemilihan persistensi otomatis: MiniOS mencoba melanjutkan sesi default yang kompatibel dan dapat membuat pengganti yang kompatibel jika tidak ada sesi yang dapat digunakan dan tersedia media penyimpanan yang dapat ditulis.

| Entri menu | Gunakan saat | Apakah perubahan disimpan? | Apakah USB tetap terhubung? |
|---|---|---|---|
| **Mulai MiniOS** (default) | Penggunaan portabel normal | Ya, jika aktivasi persistensi otomatis berhasil | Ya |
| **Mulai sesi baru** | Anda ingin ruang kerja terpisah | Hanya jika sesi baru berhasil dibuat dan diaktifkan | Ya |
| **Pilih sesi tersimpan** | Anda ingin memilih salah satu dari beberapa workspace yang ada | Hanya jika sesi yang dipilih berhasil diaktifkan | Ya |
| **Mulai tanpa menyimpan** | Anda ingin boot sementara yang bersih tanpa persistensi | Tidak | Ya |
| **Jalankan dari RAM** | Anda ingin menyalin MiniOS ke RAM untuk boot ini | Tidak; salinan RAM dianggap sementara | Hingga MiniOS berhasil melepaskan sumber |

Untuk boot pertama yang normal, biarkan **Mulai MiniOS** tetap dipilih. Gunakan **Mulai tanpa menyimpan** jika Anda memang membutuhkan sesi pengujian perangkat keras atau pemulihan sementara yang bersih dan tidak boleh membuka atau membuat persistensi.

::: warning Pastikan persistensi aktif
Memilih entri menu persisten meminta sesi; ini tidak menjamin sesi dapat dibuka. Jika penyimpanan hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat melanjutkan tanpa menyimpan perubahan. Periksa peringatan saat startup sebelum memulai pekerjaan yang harus disimpan.
:::

## Mulai MiniOS

**Mulai MiniOS** adalah entri menu pertama dan default. Ini ditujukan untuk penggunaan normal, termasuk boot pertama pada perangkat MiniOS yang baru disiapkan.

MiniOS secara otomatis mencari sesi persisten yang kompatibel. Jika sesi default yang dapat digunakan tersedia, sesi tersebut akan dilanjutkan. Jika tidak ada, MiniOS dapat membuat sesi yang kompatibel secara otomatis jika tersedia penyimpanan yang dapat ditulis.

Jika persistensi tidak dapat dibuat atau diaktifkan karena penyimpanan hanya-baca, penuh, rusak, atau tidak sesuai, MiniOS akan melanjutkan dengan layer tulis sementara dan melaporkan bahwa sesi tidak persisten. Periksa peringatan tersebut sebelum melakukan pekerjaan yang harus bertahan setelah reboot.

## Mulai sesi baru

MiniOS membuat sesi persisten tambahan dengan nomor baru dan membiarkan sesi yang sudah ada tetap utuh. Gunakan fitur ini untuk memisahkan workspace atau menguji konfigurasi baru tanpa mengganti sesi kerja Anda saat ini.

Pembuatan membutuhkan penyimpanan yang kompatibel dan dapat ditulis serta ruang kosong yang cukup. Sesi baru bukanlah cadangan dari sesi yang sudah ada.

## Pilih sesi tersimpan

MiniOS menampilkan sesi tersimpan yang tersedia dan memungkinkan Anda memilih salah satunya. Gunakan fitur ini jika satu perangkat berisi beberapa workspace. Untuk membuat sesi pertama di penyimpanan kosong, pilih **Mulai sesi baru**.

Sebuah sesi bisa tidak kompatibel jika berasal dari rilis atau edisi MiniOS yang berbeda. Pengaturan `union=` yang berbeda juga dapat menyebabkan sesi menjadi tidak kompatibel.
Pemilihan interaktif tidak membuat sesi yang tidak kompatibel menjadi aman.

## Mulai tanpa menyimpan

Mode ini sengaja menonaktifkan persistensi untuk boot saat ini. MiniOS menggunakan area tulis sementara di RAM, sehingga file yang dibuat di sistem live, paket yang diinstal, dan pengaturan yang diubah akan hilang saat shutdown.

Gunakan mode ini jika Anda secara khusus ingin:

- menguji perangkat keras tanpa membuka atau membuat sesi persisten;
- mendiagnosis masalah tanpa mengubah status yang tersimpan;
- bekerja secara sementara ketika tidak ada yang perlu disimpan.

Memulai tanpa menyimpan tidak berarti media boot dapat dilepas. Sistem yang berjalan biasanya tetap membaca modul sistemnya dari media tersebut.

## Jalankan dari RAM

Mode ini menyalin data MiniOS ke RAM untuk mengurangi pembacaan dari sumber. Diperlukan memori yang cukup untuk sistem yang disalin dan beban kerja yang berjalan.

Anggap sesi yang dimuat melalui RAM sebagai sementara. Menggabungkan `toram` dengan persistensi akan menyalin data sesi yang dipilih ke RAM; perubahan selanjutnya tidak akan disalin kembali ke penyimpanan persistensi asli.

Jangan melepas perangkat boot hanya karena **Jalankan dari RAM** dipilih. Ini hanya aman setelah MiniOS berhasil melepaskan filesystem sumber, loop ISO, dan semua pemetaan Ventoy. Jika operasi tersebut gagal, sumber masih tetap digunakan.

## Instalasi native

::: warning Instalasi native mengubah model sistem
Instalasi native mempertahankan pengalaman desktop MiniOS yang sudah dikenal — identitas visualnya, lingkungan desktop yang dipilih, dan aplikasi-aplikasi biasa — namun mengubah live image menjadi desktop Debian konvensional. Alat khusus MiniOS untuk sesi, modul, kernel modular, dan alur kerja live lainnya akan dihapus karena fitur-fitur tersebut tidak lagi berlaku.
:::

Setelah konversi native, gunakan alat paket, kernel, konfigurasi, dan bootloader Debian seperti biasa. Hasilnya tetap terlihat familiar dan mempertahankan aplikasi desktop standar dari edisi yang dipilih, namun fitur live khusus MiniOS tidak lagi tersedia. Arsitektur live MiniOS dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS).

Gunakan [Penginstal MiniOS](/installing-minios/MiniOS-Installer) hanya jika Anda memang ingin melakukan konversi tersebut dan image yang dipilih mendukung deployment native.

## Jika Anda membutuhkan detail lebih lanjut

- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu) menjelaskan navigasi dan pengeditan sementara entri menu.
- [Manajemen sesi](/using-minios/Sessions-and-Persistence) menjelaskan mode penyimpanan, pembuatan sesi, perubahan ukuran, dan penghapusan.
- [Parameter boot](/reference/Boot-Parameters) adalah referensi lengkap baris perintah.
- [Penemuan sistem initrd](/reference/boot-process/System-Discovery), [pemanggilan modul](/reference/boot-process/Module-Loading), dan [persistensi](/reference/boot-process/Persistence-Internals) menjelaskan bagaimana grup parameter terkait diproses saat startup.
