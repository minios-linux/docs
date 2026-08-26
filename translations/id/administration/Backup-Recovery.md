---
updated: 2026-08-26
---

# Cadangan dan pemulihan

Tidak ada satu cadangan pun yang melindungi seluruh bagian sistem MiniOS. File pribadi, konfigurasi, sesi persisten, modul, dan perangkat penyimpanan memiliki prosedur pemulihan yang berbeda. Simpan lebih dari satu salinan, pastikan setidaknya satu salinan berada di perangkat lain, dan uji proses pemulihan sebelum salinan asli benar-benar dibutuhkan.

## Gunakan strategi cadangan berlapis

Set cadangan yang praktis memiliki beberapa lapisan berikut:

1. Cadangkan file pribadi yang tidak tergantikan secara rutin dan terpisah dari sesi MiniOS.
2. Catat konfigurasi dan pilihan modul setiap kali ada perubahan.
3. Ekspor setiap sesi yang sehat dan tidak sedang berjalan dalam mode yang didukung.
4. Simpan salinan offline dari data yang tidak dapat diekspor oleh Session Manager.
5. Buat citra seluruh media secara berkala setelah sumber dimatikan dan tidak lagi menerima penulisan data.

Gunakan tujuan versi (versioned destinations) daripada mengganti cadangan terakhir yang sudah terbukti baik. Catat rilis MiniOS, edisi, arsitektur, tanggal cadangan, mode sesi, dan status enkripsi pada setiap cadangan. Citra seluruh media adalah jaring pengaman terakhir yang berguna, namun sebaiknya bukan satu-satunya salinan file pribadi.

## Cadangkan data pribadi terlebih dahulu

Cadangkan seluruh direktori home jika memungkinkan, termasuk pengaturan aplikasi tersembunyi. Minimal, sertakan pekerjaan yang disimpan di Desktop, Documents, Downloads, Music, Pictures, Public, Templates, dan Videos, serta direktori proyek atau data yang dibuat di luar lokasi standar tersebut.

Dukungan user-media MiniOS dapat menghubungkan atau mengikat direktori pengguna standar ke lokasi terpisah di media MiniOS yang dapat ditulis. Jalur yang dikonfigurasi secara default adalah `/minios/userdata`, namun `LIVE_USER_DIRS_PATH` dapat memilih jalur aman lain. Data di sana berada di luar lapisan sesi normal dan harus dicadangkan secara terpisah. Periksa target tautan atau mount yang sebenarnya, jangan berasumsi bahwa ekspor sesi sudah mencakupnya. Juga cadangkan file yang sengaja disimpan di volume terpasang lainnya.

Tutup aplikasi yang menulis database, penyimpanan email, profil browser, atau citra mesin virtual sebelum menyalin datanya. Untuk data penting, utamakan metode cadangan yang mempertahankan kepemilikan, izin, tautan, atribut tambahan, dan cap waktu jika tujuan mendukungnya.

## Cadangkan konfigurasi

Lindungi konfigurasi yang mengatur proses boot di masa depan, bukan hanya file yang terlihat di filesystem root saat ini. Lokasi yang relevan dapat mencakup:

- `minios/config.conf` dan `minios/config.conf.d/` pada media MiniOS yang dapat ditulis.
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/` pada sistem persisten atau native.
- Hook, preseed, perubahan menu boot yang sudah ditinjau, dan catatan parameter boot kustom.
- Konfigurasi pengguna di bawah direktori home dan konfigurasi sistem tertentu di `/etc` untuk instalasi native.

Konfigurasi dapat berisi hash kata sandi, kredensial jaringan, kunci, dan pengaturan layanan. Lindungi cadangannya sesuai kebutuhan. Jangan menyimpan passphrase dalam bentuk teks biasa di samping cadangan sesi terenkripsi. Lihat [Penguatan keamanan](/administration/Security-Hardening.md) untuk panduan enkripsi dan penanganan media.

## Cadangkan modul

Cadangkan file `.sb` kustom dari penyimpanan modul yang tahan lama dan catat urutan, sumber, rilis MiniOS, serta tujuannya. Jangan menyimpulkan boot berikutnya hanya dari apa yang terlihat di filesystem root saat ini:

- **Running Now** adalah set modul yang membentuk sistem live saat ini.
- **Next Boot** adalah set modul yang dipilih oleh aturan boot saat ini.

Modul yang diaktifkan hanya untuk sesi saat ini mungkin tidak ada di penyimpanan tahan lama. Modul yang ditambahkan untuk boot berikutnya mungkin belum aktif sekarang. Tinjau dan catat kedua tampilan sebelum melakukan cadangan. Filter boot seperti `load`, `noload`, dan `bext` juga dapat mengubah set modul untuk boot berikutnya. Lihat [Module Manager](/administration/Module-Manager.md).

## Ekspor sesi persisten

Gunakan [Manajemen Sesi](/configuration/Session-Management.md) untuk mengidentifikasi sesi Running Now dan sesi yang dipilih untuk boot berikutnya. Mengaktifkan sesi yang berbeda hanya mengubah boot berikutnya; ini tidak membuat sesi saat ini aman untuk diekspor. Lakukan reboot ke sesi lain, atau boot tanpa persistensi, sebelum mencadangkan sesi yang sebelumnya berjalan.

Session Manager dapat mengekspor sesi `native`, `dynfilefs`, `raw`, atau `luks` yang tidak sedang berjalan sebagai arsip `.tar.zst`. Ekspor adalah cadangan logis dari file di dalam sesi, tidak selalu merupakan salinan byte-per-byte dari kontainer penyimpanannya. Simpan arsip di perangkat lain. Impor akan membuat sesi baru dengan nomor berbeda; periksa dan aktifkan secara eksplisit hanya setelah validasi.

Ekspor LUKS berisi data sesi logis yang telah didekripsi, bukan kontainer `changes.luks` yang terenkripsi. Enkripsi tujuan cadangan atau arsip dengan metode terpisah yang telah ditinjau jika data yang diekspor harus tetap rahasia. Impor ke LUKS akan membuat kontainer terenkripsi baru dan membutuhkan passphrase target baru.

Jangan menyalin direktori sesi yang sedang ter-mount secara manual. Sesi mungkin sedang berubah, dan filesystem berbasis kontainer mungkin tidak diwakili oleh kumpulan file yang konsisten saat aktif.

## Tangani sesi SquashFS secara offline

Sebelum mencadangkan sesi SquashFS yang sedang berjalan, gunakan **Save Now** dan tunggu hingga proses penyimpanan serta validasi selesai. Penyimpanan akan membangun ulang `changes.sb` dan secara atomik menggantikan snapshot sebelumnya; tidak menyimpan generasi rollback. Setelah itu, matikan sistem dengan benar.

Implementasi Session Manager saat ini menolak ekspor dan penyalinan SquashFS. Setelah penyimpanan selesai, boot tanpa persistensi atau gunakan sistem Linux lain dan salin sesi SquashFS dari penyimpanan sesi yang tidak aktif. Pastikan untuk menjaga seluruh direktori sesi bernomor beserta metadata session-store secara bersamaan. Jangan mengganti atau mengubah nomor entri pada store `minios/changes` yang sedang aktif. Lihat [Pemulihan boot](/administration/Boot-Recovery.md) sebelum mengubah struktur boot atau disk saat proses pemulihan.

## Jaga setiap segmen DynFileFS

Sesi DynFileFS adalah satu kontainer logis yang dibagi ke dalam satu set lengkap file pendukung. Salinan offline harus mencakup `changes.dat` dan setiap segmen bernomor seperti `changes.dat.0`, `changes.dat.1`, dan segmen berikutnya. Menyalin hanya file pertama tidak akan menghasilkan cadangan yang dapat digunakan. Jangan membuat segmen yang hilang atau memperbaiki satu-satunya salinan.

Ekspor Session Manager secara normal menghindari masalah di tingkat kontainer ini dengan mengekspor file sesi secara logis. Untuk penyalinan yang terputus, segmen yang hilang, media penuh, dan perbaikan filesystem, ikuti [Pemulihan DynFileFS dan dynblk](/configuration/DynFileFS-Recovery.md).

## Buat citra seluruh media

[Drive Utility](/installation/tools/Drive-Utility.md) dapat menggunakan **Create Image** untuk membaca seluruh perangkat ke dalam citra mentah (raw image), opsional dengan kompresi. Ini akan menangkap tabel partisi, file boot, modul, konfigurasi, penyimpanan sesi, data user-media, dan blok yang tidak terpakai sebagaimana adanya di perangkat sumber. File citra ini membutuhkan ruang tujuan yang memadai dan dapat berisi data yang telah dihapus namun masih dapat dipulihkan serta rahasia lainnya.

Buat citra secara offline. Matikan MiniOS dan hubungkan media sumber ke sistem lain yang sedang berjalan, atau boot dari perangkat lain. Pastikan tidak ada partisi sumber yang ter-mount dan tidak ada proses persistensi, swap, database, atau layanan latar belakang yang menulis ke sana. Drive Utility biasanya menyembunyikan perangkat yang sedang ter-mount, tetapi menampilkan perangkat di antarmuka tidak menjamin citra mentah yang konsisten.

Verifikasi sumber berdasarkan model perangkat, ukuran, dan nama perangkat. Simpan citra ke perangkat fisik yang berbeda, jangan pernah ke filesystem pada sumber yang sedang dicitrakan. Untuk pemulihan, **Write Image** akan melakukan penimpaan mentah pada perangkat target yang dipilih. Pastikan target dengan kehati-hatian yang sama; semua data yang ada di target akan hilang. Gunakan target yang ukurannya minimal sama dengan sumber asli kecuali citra telah disiapkan secara khusus untuk perangkat yang lebih kecil.

## Cadangkan instalasi native

Instalasi native tidak menggunakan sesi persisten live sebagai filesystem root-nya, sehingga ekspor Session Manager bukanlah cadangan lengkap untuk sistem native. Cadangkan direktori home pengguna, konfigurasi sistem terpilih, data aplikasi, file yang dikelola secara lokal, dan kredensial pemulihan menggunakan metode cadangan yang memahami filesystem. Catat rilis MiniOS, tata letak partisi, pilihan paket yang terpasang, mode boot, serta modul atau kernel kustom apa pun.

Untuk pemulihan bare-metal, buat citra seluruh disk secara offline atau gunakan produk cadangan yang telah teruji dan mendukung filesystem serta tata letak partisi native. Simpan juga cadangan tingkat file secara terpisah agar file individual dapat dipulihkan tanpa menimpa seluruh disk. Lihat [Pemulihan boot](/administration/Boot-Recovery.md) untuk diagnosis file boot dan bootloader.

## Validasi cadangan dan uji pemulihan

Salinan yang selesai belum tentu merupakan cadangan yang terbukti. Untuk setiap siklus cadangan:

1. Pastikan cadangan berada di perangkat berbeda dan memiliki tanggal serta ukuran yang sesuai.
2. Catat dan bandingkan checksum kriptografi untuk arsip dan citra disk.
3. Buka sampel file pribadi, termasuk setidaknya satu file besar dan satu file dari setiap kumpulan data aplikasi penting.
4. Impor arsip sesi sebagai sesi baru yang tidak aktif dan periksa file-filenya. Uji boot hanya setelah menyimpan pilihan sesi yang sudah terbukti baik.
5. Verifikasi bahwa salinan offline DynFileFS berisi urutan segmen yang lengkap.
6. Pulihkan citra seluruh media hanya ke perangkat cadangan atau sementara yang ukurannya memadai, lalu uji boot dan akses ke data penting.
7. Uji pemulihan file native ke lokasi terpisah dan verifikasi izin, kepemilikan, tautan, serta keterbacaan aplikasi.

Lakukan uji pemulihan setelah mengubah mode persistensi, enkripsi, tata letak partisi, rilis MiniOS, atau perangkat lunak cadangan. Simpan cadangan terakhir yang sudah terbukti baik hingga penggantinya lolos uji pemulihan. Untuk diagnosis lebih lanjut, lihat [Pemulihan boot](/administration/Boot-Recovery.md), [Pemulihan DynFileFS dan dynblk](/configuration/DynFileFS-Recovery.md), dan [Penguatan keamanan](/administration/Security-Hardening.md).
