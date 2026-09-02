---
updated: 2026-08-28
---

# Internal Persistensi

Halaman ini menjelaskan parameter boot `perch`, `perchdir`, `perchmode`, `perchsize`, dan `perchreserve`. Parameter-parameter ini mengatur di mana perubahan dari sesi live akan disimpan. Untuk penggunaan normal, pilih entri persisten di menu boot atau gunakan Manajer Sesi MiniOS daripada mengeditnya secara manual.

MiniOS membangun root live dari modul read-only dan satu lapisan atas yang dapat ditulis.
Initrd menentukan apakah lapisan atas itu adalah sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan dan jalur aktivasi saat boot. Untuk kontrol yang ditujukan bagi pengguna, lihat [Mode Boot](/using-minios/Boot-Modes) dan [Parameter Boot](/reference/Boot-Parameters).

## Penjelasan sederhana

Tanpa parameter persistensi, MiniOS akan menyimpan perubahan di RAM dan membuangnya saat shutdown. Parameter persistensi meminta MiniOS untuk mencari media penyimpanan yang dapat ditulis, memilih atau membuat sesi bernomor, memeriksa kompatibilitas, dan menggunakan sesi tersebut sebagai layer yang dapat ditulis.

Meminta persistensi tidak menjamin fitur ini aktif. Jika target hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat melanjutkan dengan layer sementara di RAM. Bacalah peringatan saat startup sebelum mengandalkan perubahan yang tersimpan.

## Penjelasan parameter

| Parameter | Instruksi untuk MiniOS | Pilihan umum |
|---|---|---|
| `perchdir=resume` | Membuka sesi kompatibel default dan, dalam kondisi yang didukung, membuat pengganti jika tidak dapat digunakan. | Pekerjaan harian biasa. |
| `perchdir=new` | Membuat sesi bernomor baru. | Menjaga workspace yang sudah ada tetap utuh. |
| `perchdir=ask` | Menampilkan sesi yang tersimpan setelah penyimpanan yang dapat dilanjutkan ditemukan dan memungkinkan Anda memilih salah satunya. Tidak dapat membuat sesi pertama pada media kosong. | Beberapa workspace pada satu perangkat; gunakan `perchdir=new` untuk sesi pertama. |
| `perchdir=NUMBER` | Meminta sesi bernomor tertentu. | Entri boot kustom yang stabil setelah memeriksa ID sesi. |
| `perchmode=MODE` | Memilih `native`, `dynfilefs`, `raw`, `luks`, atau sesi `squashfs` yang sudah ada. | Menyesuaikan filesystem penyimpanan dan kebutuhan enkripsi. |
| `perchsize=SIZE` | Meminta ukuran untuk sesi container baru atau yang bertambah. | Penyimpanan DynFileFS, raw, atau LUKS. |
| `perchreserve=MB` | Mengurangi margin saat menentukan ukuran container baru atau yang bertambah dan mengatur ambang peringatan ruang rendah. | Menyisakan ruang kerja saat membuat container; ini bukan kuota runtime. |
| `perch` | Menggunakan perilaku resume lama tanpa pembuatan pengganti otomatis. | Kompatibilitas dengan entri kustom yang sudah ada; lebih disarankan `perchdir=resume` untuk menu saat ini. |

Jangan menggabungkan persistensi dengan `toram` jika Anda mengharapkan perubahan ditulis kembali ke perangkat asli. MiniOS mengaktifkan sesi yang telah disalin di RAM, dan perubahan pada salinan tersebut akan hilang saat shutdown.

## Persistensi bersifat eksplisit

Initrd hanya mengaktifkan penanganan persistensi jika baris perintah kernel memuat salah satu token berikut:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Tanpa token-token tersebut, termasuk jika hanya terdapat nama `perch...` yang tidak dikenali, MiniOS akan membuat layer atas yang dapat ditulis baru di RAM. Perubahan yang dibuat selama boot tersebut akan dihapus saat shutdown.

Selector tidak semuanya setara:

| Selector | Perilaku Initrd |
|---|---|
| `perch` | Berusaha melanjutkan metadata default. Tidak secara otomatis membuat sesi jika tidak ada yang dapat digunakan atau jika pemeriksaan kompatibilitas gagal. |
| `perchdir=resume` | Mencoba metadata default dan dapat secara otomatis membuat pengganti baru yang kompatibel. Ini adalah perilaku resume menu boot saat ini. |
| `perchdir=new` | Mengalokasikan direktori dengan ID numerik satu lebih besar dari ID numerik tertinggi yang ada. Tidak pernah menggunakan ulang direktori yang sudah ada. |
| `perchdir=ask` | Menawarkan sesi yang sudah ada setelah penyimpanan yang dapat dilanjutkan dan default ditemukan. Sesi yang tidak kompatibel memerlukan konfirmasi. Pada media kosong, gunakan `perchdir=new` untuk membuat sesi pertama. |
| `perchdir=NUMBER` | Menggunakan direktori tersebut jika ada. Jika tidak ada, pemilihan dapat kembali ke default yang tercatat di metadata; tidak akan memesan nomor yang diminta. |

Parameter persistensi lain yang dikenali tanpa selector akan masuk ke jalur resume lama seperti `perch` tanpa selector: mereka meminta persistensi, tetapi tidak mengaktifkan pembuatan otomatis. Jika pemilihan atau aktivasi tidak menghasilkan upper yang dapat digunakan, boot tetap dilanjutkan dengan upper RAM dan menampilkan peringatan kegagalan.

## Penyimpanan dan Lokasi Sesi

Penyimpanan standar berada di `changes` direktori di samping data MiniOS, dengan direktori sesi bernomor dan `session.conf` atau `session.json` metadata:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Penyimpanan juga dapat dipilih sebagai perangkat beserta path opsional. Bentuk yang diterima termasuk path langsung `/dev/...` , `/dev/disk/by-label/LABEL/...` , `/dev/mapper/...` , `label:LABEL/...` , `askdisk`, dan `askdisk:custom:path`. Sufiks yang dipisahkan tanda titik dua akan menjadi path di bawah perangkat yang dipilih; sintaks garis miring setelah `askdisk` akan mengabaikan path kustom tersebut. Subdirektori yang dipilih akan di-bind-mount sebagai penyimpanan sesi. MiniOS juga dapat mendeteksi partisi persistence di drive yang sama dan penyimpanan persistence Ventoy yang didukung.

Sebelum pemilihan sesi, initrd harus me-mount lokasi tersebut agar dapat ditulis dan memastikan dapat membuat serta menghapus marker di penyimpanan. Perangkat blok yang tidak dapat dibuka untuk penulisan, mount hanya-baca, path yang tidak tersedia, atau uji tulis yang gagal akan menolak persistence untuk boot tersebut. Sesi yang sudah ada tidak langsung dipercaya hanya karena file-nya dapat dibaca.

## Seleksi dan kompatibilitas

Metadata sesi mencatat mode penyimpanan dan dapat mencatat versi MiniOS, edisi, union filesystem, dan ukuran container. Resume membandingkan mode, versi, edisi, dan union yang tercatat dengan mode yang diminta dan sistem saat ini.
Field kompatibilitas lama yang hilang tidak dianggap sebagai ketidakcocokan.

Literal `perchdir=resume` akan membuat sesi bernomor baru jika default-nya tidak ada atau jika mode, versi, edisi, atau union yang tercatat tidak cocok sehingga default tersebut tidak sesuai. `perch` tanpa selector, pemilihan numerik langsung, dan permintaan resume lama lainnya menolak pembuatan pengganti otomatis dan melanjutkan di RAM jika pemilihan gagal. `perchdir=ask` menampilkan informasi kompatibilitas dan memungkinkan override eksplisit. Sesi baru akan default ke `native` kecuali mode lain diminta.

Mode penyimpanan adalah bagian dari kompatibilitas. Jika seleksi mencapai backend dispatch, mode yang diminta tidak dikenal akan kembali ke `native`, yang kemudian dapat memilih DynFileFS pada media yang tidak sesuai. Sesi yang sudah ada dengan mode berbeda dapat gagal pada pemeriksaan kompatibilitas sebelumnya; permintaan resume lama kemudian akan melanjutkan di RAM daripada mencapai fallback tersebut.

## Cadangan Ruang dan Ukuran

MiniOS menggunakan 256 MiB sebagai margin alokasi default dan ambang peringatan ruang rendah. Perhitungan menggunakan blok filesystem 1024-byte. `perchreserve` menerima angka bulat tak bertanda tanpa satuan, dibatasi pada 4096, dan akan kembali ke 256 jika tidak ada atau tidak valid. Margin ini mengurangi ruang yang ditawarkan untuk kontainer baru atau yang bertambah besar. Ini bukan kuota: sesi native atau penulisan berikutnya tetap dapat menggunakan sisa ruang filesystem. Boot akan memperingatkan jika ruang bebas saat ini sama dengan atau di bawah ambang batas.

Ukuran kontainer menggunakan jumlah bulat yang dialokasikan dalam MiB:

- Angka polos, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Permintaan logis maksimum adalah 1.000.000 MiB, dibatasi lagi oleh ruang yang tersedia setelah cadangan.
- Manajer Sesi MiniOS membatasi file mentah dan LUKS pada 4000 MiB di FAT32. Selama aktivasi initrd, batas ini diterapkan secara konsisten pada LUKS, sedangkan permintaan raw yang terlalu besar bisa mencapai alokasi dan gagal, bukan dikurangi.
- Sesi raw dan LUKS baru secara default berukuran 4000 MiB.
- Sesi DynFileFS baru yang dibuat oleh initrd secara default menggunakan kapasitas yang tersedia setelah cadangan, dibulatkan ke batas 1000 MiB jika memungkinkan.

Pertumbuhan kontainer bersifat best-effort dan pengecilan tidak didukung. `perchsize` tidak mengatur ukuran sesi native atau SquashFS. Manajer Sesi MiniOS menggunakan default 4000 MiB untuk sesi kontainer yang baru dibuat; lihat [Manajemen Sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi penyimpanan

Semua mode yang berhasil harus menyediakan upper yang dapat ditulis sesuai dengan union filesystem yang dipilih. Mount backend saja tidak membuktikan persistensi aktif. Native, DynFileFS, raw, dan LUKS dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda commit metadata tersebut. Status current-boot yang dilindungi hanya dipublikasikan setelah root union final dikonfirmasi menggunakan upper yang diharapkan.

### Native

Mode native pertama-tama mengecualikan filesystem non-POSIX yang sudah dikenal seperti FAT, exFAT, dan NTFS. Kemudian melakukan uji perilaku filesystem nyata dengan membuat file dan symlink serta memeriksa perubahan mode eksekusi. Jika uji berhasil, direktori sesi bernomor akan di-bind-mount langsung sebagai area yang dapat ditulis.

Jika filesystem diketahui tidak cocok, atau uji POSIX gagal, mode native akan beralih ke DynFileFS. Kegagalan setelah aktivasi native akan dibatalkan; kandidat kosong baru akan dihapus jika aman untuk dihapus.

### DynFileFS

DynFileFS, diimplementasikan oleh helper yang kompatibel dengan `dynblk`, menyimpan satu image blok logis di `changes.dat` beserta file segmen bernomornya. Helper harus berhasil mount dan menampilkan `virtual.dat`; jika tidak, aktivasi gagal agar tidak secara tidak sengaja membuat file hanya-RAM dengan nama yang terlihat persisten.

Image logis berisi ext4. Image yang sudah ada akan diperiksa sebelum mount writable; hasil fsck di atas status error-terkoreksi akan menolak sesi daripada mount writable. Resize hanya mendukung pertumbuhan, dan filesystem ext4 di dalamnya akan diperluas jika memungkinkan. Untuk diagnosis yang ditujukan pengguna, lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

### Raw

Mode raw menggunakan image ext4 `changes.img` yang tetap. Image baru akan dialokasikan dan diformat sebelum digunakan. Image yang sudah ada akan diperiksa sebelum mount, dapat diperbesar jika ukuran yang diminta lebih besar, dan ext4 akan diperluas untuk menggunakan seluruh image. Jika pemeriksaan atau mount gagal, container tetap tersedia untuk pemulihan dan boot akan dilanjutkan di RAM.

### LUKS

Mode LUKS menggunakan container LUKS2 `changes.luks` dengan ext4 langsung di dalamnya.
Tersedia hanya jika initrd memuat marker dukungan crypt dan tools yang dibutuhkan. Pembuatan meminta input konfirmasi yang sesuai. Container yang sudah ada memungkinkan tiga kali percobaan unlock di konsol boot.

Initrd melakukan autentikasi sebelum memperbesar file terenkripsi yang sudah ada, lalu memeriksa dan memperluas ext4 sebelum mount. Jika pembuatan, unlock, pemeriksaan, resize, atau mount gagal, MiniOS akan membersihkan mapping dan melanjutkan di RAM. Tidak pernah beralih ke native, DynFileFS, raw, atau persistensi tanpa enkripsi lainnya.
Passphrase tidak disimpan di metadata sesi atau diteruskan sebagai argumen perintah.
Lihat [Keamanan](/maintenance-and-recovery/Security).

### SquashFS

Initrd hanya dapat mengaktifkan sesi SquashFS yang sudah ada; tidak dapat membuat `changes.sb` baru. Aktivasi memvalidasi metadata snapshot yang ketat dan bernilai tunggal, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Ini juga memeriksa tipe file dan ukuran tepatnya, RAM dan swap yang tersedia, digest SHA-256 sebelum dan sesudah ekstraksi, serta kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke dalam image ext4 sementara yang dibatasi di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir` terpisah; untuk AUFS, root-nya adalah cabang yang dapat ditulis.
Metadata yang rusak, memori tidak cukup, perubahan digest, error ekstraksi, atau kebijakan tidak valid akan membuat aktivasi gagal dan boot tetap pada upper RAM biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown bersih. SquashFS kemudian akan memperingatkan dan mengembalikan `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terputus tidak menjadi generasi rollback kedua.

Manajer Sesi MiniOS dan backend penyimpanan sistem membuat dan mengganti snapshot SquashFS secara atomik menggunakan capture yang presisi. Aktivasi boot dapat membaca snapshot yang ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena ekstraksi dilakukan di upper ext4 sementara. Pembuatan dan penyimpanan presisi tetap tergantung filesystem: area staging privat mereka harus mempertahankan link, kepemilikan, mode, xattr, ACL, capabilities, dan union whiteout, sehingga penyimpanan saat ini memerlukan filesystem POSIX yang sesuai. Lihat [Manajemen Sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi union dan batas pemulihan

Untuk AUFS, root perubahan yang diaktifkan menjadi branch writable nol. Untuk OverlayFS, initrd membangun `upperdir` dan `workdir` di bawah root perubahan yang diaktifkan dan me-mount modul read-only sebagai direktori bawah. Initrd kemudian memverifikasi branch AUFS live atau OverlayFS `upperdir` sebelum mempublikasikan persistensi sebagai aktif.

Jika backend persistensi, pembaruan metadata, atau verifikasi ini gagal, mount akan dibatalkan jika memungkinkan, tidak ada status persistensi yang sukses dipublikasikan, dan boot writable tetap dilanjutkan di RAM. Kegagalan membangun root union akan masuk ke shell initramfs fatal. Keluar dari shell tersebut dapat membuat setup berlanjut dengan root tidak valid; ini bukan perbaikan atau fallback yang aman. AUFS tetap mencoba menambahkan branch modul, tetapi union yang tidak lengkap melewati batas pemulihan: MiniOS tidak menandai persistensi sebagai aktif.

Kegagalan pemeriksaan container sengaja menghindari mount sesi yang dicurigai secara writable.
Jangan mengganti atau membangun ulang file sesi saat boot. Lindungi media penyimpanan yang terdampak terlebih dahulu; lihat [Membackup MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## Status aktif, berjalan, dan current-boot

Pada metadata sesi yang tahan lama, `default=` adalah sesi **aktif** yang dipilih untuk resume berikutnya, sedangkan `running=` adalah sesi yang dicatat sebagai pemasok boot saat ini. Aktivasi menulis kedua field dan menandai sesi tersebut `dirty`.
Setelah mount persistensi hilang saat shutdown bersih, MiniOS akan menghapus `running=` dan menandai sesi `clean`.

Field metadata tersebut bisa saja usang setelah crash, gagal menulis metadata, gagal membangun union, penyimpanan yang disalin, atau shutdown yang terputus. Komponen runtime yang mengizinkan penyimpanan tidak mempercayai `running=` saja. Mereka menggunakan status current-boot yang dilindungi initrd, terikat pada boot ID, sesi numerik, mode, identitas penyimpanan sebenarnya, status writable, durabilitas, dan generasi aktif yang terverifikasi. Catatan current-boot yang gagal atau hilang berarti persistensi tidak boleh dianggap sebagai target penyimpanan yang disetujui.

Dengan `toram` dan permintaan persistensi yang dikenali, penyimpanan sesi akan disalin ke RAM sebelum aktivasi. Sesi yang disalin dapat writable dan dapat menyediakan upper yang berjalan, tetapi status current-boot-nya ditandai non-durable. Perubahan pada salinan RAM tersebut tidak kembali ke perangkat asli dan akan hilang saat shutdown.

Untuk panduan operasional terkait, lihat [Mode Boot](/using-minios/Boot-Modes), [Parameter Boot](/reference/Boot-Parameters), [Sesi dan persistensi](/using-minios/Sessions-and-Persistence), [Membackup MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Keamanan](/maintenance-and-recovery/Security), dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).
