---
updated: 2026-09-16
---

# Internal Persistensi

Halaman ini menjelaskan parameter boot `perch`, `perchdir`, `perchmode`, `perchsize`, dan `perchreserve`. Parameter-parameter ini mengatur di mana perubahan dari sesi live akan disimpan. Untuk penggunaan normal, pilih entri persisten di menu boot atau gunakan Manajer Sesi MiniOS daripada mengeditnya secara manual.

MiniOS membangun root live dari modul read-only dan satu lapisan atas yang dapat ditulis.
Initrd menentukan apakah lapisan atas itu adalah sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan dan jalur aktivasi saat boot. Untuk kontrol yang ditujukan bagi pengguna, lihat [Mode Boot](/using-minios/Boot-Modes) dan [Parameter Boot](/reference/Boot-Parameters).

## Penjelasan sederhana

Tanpa parameter persistensi, MiniOS akan menyimpan perubahan di RAM dan membuangnya saat shutdown. Parameter persistensi meminta MiniOS untuk mencari media penyimpanan yang dapat ditulis, memilih atau membuat sesi bernomor, memeriksa kompatibilitas, dan menggunakan sesi tersebut sebagai layer yang dapat ditulis.

Meminta persistensi tidak menjamin fitur ini aktif. Jika target hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat melanjutkan dengan layer sementara di RAM. Bacalah peringatan saat startup sebelum mengandalkan perubahan yang tersimpan.

## Penjelasan Parameter

| Parameter | Fungsinya untuk memberi tahu MiniOS | Pilihan umum |
|---|---|---|
| `perchdir=resume` | Buka sesi default yang kompatibel dan, jika kondisi mendukung, buat pengganti jika tidak dapat digunakan. | Pekerjaan harian biasa. |
| `perchdir=new` | Buat sesi baru dengan nomor tertentu. | Biarkan workspace yang sudah ada tetap tidak berubah. |
| `perchdir=ask` | Tampilkan sesi yang tersimpan setelah penyimpanan yang dapat dilanjutkan ditemukan dan memungkinkan Anda memilih salah satunya. Tidak dapat membuat sesi pertama pada penyimpanan kosong. | Beberapa workspace yang sudah ada di satu perangkat; gunakan `perchdir=new` untuk sesi pertama. |
| `perchdir=NUMBER` | Meminta sesi bernomor tertentu. | Entri boot kustom yang stabil setelah memeriksa ID sesi. |
| `perchmode=MODE` | Pilih `native`, `dynfilefs`, `dynblk`, `raw`, atau `squashfs`. | Sesuaikan filesystem pendukung dan model persistensi yang diinginkan. |
| `perchencrypt=luks` | Tambahkan lapisan LUKS2 saat membuat sesi Raw, DynFileFS, atau DynBlk. | Enkripsi backend container yang didukung. |
| `perchsize=SIZE` | Minta ukuran untuk sesi container baru atau yang sedang bertambah. | DynFileFS, DynBlk, atau raw; enkripsi tidak mengubah semantik ukuran backend. |
| `perchcomp=CODEC` | Pilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`; ketersediaan tetap tergantung pada kernel yang sedang berjalan. Kompresi dinonaktifkan jika LUKS membungkus DynBlk. |
| `perchreserve=MB` | Kurangi margin saat menentukan ukuran container baru atau yang bertambah, dan atur ambang peringatan ruang rendah. | Sisakan ruang kerja saat mengalokasikan container; ini bukan kuota saat runtime. |
| `perch` | Gunakan perilaku resume lama tanpa pembuatan pengganti otomatis. | Kompatibilitas dengan entri kustom yang sudah ada; lebih disarankan `perchdir=resume` untuk menu saat ini. |

Jangan gabungkan persistensi dengan `toram` jika Anda mengharapkan perubahan ditulis kembali ke perangkat asli. MiniOS mengaktifkan sesi hasil salinan di RAM, dan perubahan pada salinan tersebut akan hilang saat shutdown.

## Persistensi bersifat eksplisit

Initrd hanya mengaktifkan penanganan persistensi ketika baris perintah kernel berisi salah satu token yang dikenali berikut:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Jika tidak ada token tersebut, termasuk ketika hanya terdapat nama `perch...` yang tidak dikenali, MiniOS akan membuat upper writable baru di RAM. Perubahan yang dilakukan selama boot tersebut akan dihapus saat shutdown.

Selector tidak semuanya setara:

| Selector | Perilaku Initrd |
|---|---|
| `perch` | Mencoba melanjutkan metadata default. Tidak secara otomatis membuat sesi baru jika tidak ada yang dapat digunakan atau jika pemeriksaan kompatibilitas gagal. |
| `perchdir=resume` | Mencoba metadata default dan dapat secara otomatis membuat pengganti baru yang kompatibel. Ini adalah perilaku resume boot-menu saat ini. |
| `perchdir=new` | Mengalokasikan direktori dengan ID numerik satu angka lebih besar dari ID numerik tertinggi yang sudah ada. Tidak pernah menggunakan ulang direktori yang sudah ada. |
| `perchdir=ask` | Menawarkan sesi yang sudah ada setelah store yang dapat dilanjutkan dan default ditemukan. Sesi yang tidak kompatibel memerlukan konfirmasi. Pada penyimpanan kosong, gunakan `perchdir=new` untuk membuat sesi pertama. |
| `perchdir=NUMBER` | Menggunakan direktori tersebut jika sudah ada. Jika tidak ada, pemilihan dapat kembali ke default yang tercatat di metadata; tidak memesan nomor yang diminta. |

Parameter persistensi lain yang dikenali tanpa selector akan masuk ke jalur resume lama yang sama seperti bare `perch`: mereka meminta persistensi, tetapi tidak mengaktifkan pembuatan otomatis. Jika pemilihan atau aktivasi tidak dapat menghasilkan upper yang dapat digunakan, proses boot akan tetap berjalan dengan upper RAM dan menampilkan peringatan kegagalan.

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

## Cadangan ruang dan ukuran

MiniOS menggunakan 256 MiB sebagai margin alokasi default dan ambang peringatan ruang rendah. Perhitungan ini menggunakan blok filesystem 1024-byte. `perchreserve` menerima angka bulat tak bertanda tanpa satuan, dibatasi maksimal 4096, dan akan kembali ke 256 jika tidak diisi atau tidak valid. Margin ini mengurangi ruang yang ditawarkan untuk container baru atau yang bertambah besar. Ini bukan kuota: sesi native atau penulisan berikutnya tetap dapat menggunakan sisa ruang filesystem. Saat boot, peringatan akan muncul jika ruang kosong saat ini sama dengan atau di bawah ambang batas.

Ukuran container menggunakan jumlah bulat yang dialokasikan dalam satuan MiB:

- Angka tanpa satuan, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Container tipe Raw dibatasi hingga 1.000.000 MiB dan juga oleh ruang yang tersedia setelah cadangan. DynFileFS memiliki batas terpisah yang memperhitungkan RAM dan batas keras 2.000.000 MiB. DynBlk memiliki batas format/ABI sendiri sebesar 512 GiB.
- Raw adalah satu file pendukung, sehingga FAT32 membatasinya hingga 4000 MiB di MiniOS. Batas yang sama berlaku saat Raw dibungkus dalam LUKS2.
- Sesi raw baru secara default berukuran 4000 MiB. Enkripsi tidak membuat kebijakan ukuran LUKS terpisah: raw terenkripsi, DynFileFS, atau sesi DynBlk tetap mengikuti aturan ukuran backend dasarnya.
- Sesi DynFileFS baru yang dibuat initrd tanpa `perchsize` menggunakan kapasitas logis hingga 16 GiB. Jika media penyimpanan tidak dapat menampung sebanyak itu setelah `perchreserve` dan overhead indeks DynFileFS, maka default akan dikurangi sesuai kapasitas yang tersedia. Indeks format-400 memerlukan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan per GiB kapasitas logis yang dideklarasikan, bahkan saat payload masih kosong. Karena itu, MiniOS juga membatasi kapasitas DynFileFS dari RAM fisik dan oleh batas keras 2.000.000 MiB yang telah diuji.
- Sesi DynBlk baru tanpa `perchsize` mengikuti batas otomatis 16 GiB yang sama dan akan dikurangi jika ruang penyimpanan yang tersisa kurang setelah `perchreserve`. Ukuran virtual DynBlk yang eksplisit tetap merupakan permintaan kapasitas tipis dan hanya dibatasi oleh batas format/ABI 512 GiB; file pendukung fisik dibuat secara bertahap. DynBlk memiliki kebijakan pemetaan-memori sparse sendiri dan tidak memerlukan MiniOS untuk mengatur anggaran tersebut.

Pertumbuhan container bersifat best-effort dan penyusutan tidak didukung. `perchsize` tidak mengatur ukuran sesi native maupun SquashFS. Manajer Sesi MiniOS mengatur container raw dan DynFileFS yang dibuat manual menjadi 4000 MiB dan DynBlk menjadi 16 GiB; varian terenkripsi menggunakan default backend yang sama. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi penyimpanan

Semua backend yang berhasil harus menyediakan writable upper yang diharapkan oleh union filesystem yang dipilih. Mount backend saja tidak membuktikan bahwa persistensi sudah aktif. Native, DynFileFS, DynBlk, dan raw dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda commit metadata tersebut. Raw, DynFileFS, dan DynBlk juga dapat menggunakan enkripsi LUKS2. Status current-boot yang terlindungi hanya dipublikasikan setelah union root terakhir dipastikan menggunakan upper yang diharapkan.

| Backend | Representasi persisten | Model kapasitas | Persyaratan penyimpanan dasar | Lapisan LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File dan direktori langsung di direktori sesi bernomor | Menggunakan ruang filesystem dasar secara langsung; `perchsize` tidak berlaku | Filesystem writable yang lolos uji perilaku POSIX | Tidak |
| `dynfilefs` | Format-400 `changes.dat` ditambah file segmen yang menampilkan ext4 `virtual.dat` | Payload tipis dengan indeks berukuran kapasitas yang padat | Penyimpanan writable POSIX, FAT32, NTFS, atau exFAT | Ya |
| `dynblk` | Format-1 `volumeNNN.db` file yang menampilkan `/dev/dynblkN`, dengan ext4 di atasnya | Perangkat blok virtual tipis dengan pemetaan runtime yang sparse | Filesystem yang diterima oleh backend kernel DynBlk dan sumber daya backend yang cukup | Ya |
| `raw` | Satu file berukuran tetap `changes.img` yang berisi ext4 | File dibuat sesuai ukuran logis yang diminta; hanya dapat bertambah | Filesystem writable yang dapat menampung image; FAT32 dibatasi hingga 4000 MiB | Ya |
| `squashfs` | Snapshot `changes.sb` terkompresi; writable runtime upper direkonstruksi di RAM | Ukuran snapshot mengikuti perubahan yang ditangkap; `perchsize` tidak berlaku | Snapshot yang sudah ada dapat dibaca dari media writable yang didukung, namun penyimpanan persis membutuhkan filesystem staging yang mendukung POSIX | Tidak |

### Native

Mode Native menyimpan konten union yang dapat ditulis secara langsung di direktori sesi bernomor. Tidak ada image internal, perangkat loop, kontainer FUSE, atau filesystem blok terpisah, sehingga kapasitasnya mengikuti ruang kosong pada filesystem dasar dan `perchsize` tidak berlaku. Ini memberikan overhead kontainer paling rendah dan menjaga visibilitas file seperti biasa untuk pemulihan dan pencadangan.

MiniOS terlebih dahulu mengecualikan filesystem non-POSIX yang sudah dikenal seperti FAT, exFAT, dan NTFS. Selanjutnya, sistem akan menguji perilaku filesystem sebenarnya dengan membuat file dan symlink serta memeriksa perubahan mode eksekusi. Jika pengujian berhasil, direktori sesi bernomor akan di-bind-mount langsung sebagai area yang dapat ditulis. Jika filesystem diketahui tidak cocok, atau pengujian POSIX gagal, mode native akan beralih ke DynFileFS. Kegagalan setelah aktivasi native akan dibatalkan; kandidat kosong baru akan dihapus jika sudah aman untuk dihapus.

Lapisan persistensi MiniOS LUKS2 tidak membungkus mode native karena mode native tidak memiliki batas kontainer atau block device untuk dienkripsi. Persistensi native tetap dapat ditempatkan pada media penyimpanan yang dienkripsi di luar lapisan persistensi ini.

### DynFileFS

DynFileFS adalah backend container format-400 berbasis FUSE. Backend ini menyediakan satu image logis`virtual.dat` saat data disimpan di`changes.dat` beserta file segmen bernomor. Helper harus berhasil melakukan mount dan menampilkan`virtual.dat`; jika tidak, proses aktivasi akan gagal daripada secara tidak sengaja membuat file hanya-RAM dengan nama yang tampak persisten.

Indeks mapping-nya padat terhadap kapasitas logis yang dideklarasikan: setiap blok logis 4 KiB memiliki satu offset 8-byte. Ini setara sekitar 2 MiB indeks RAM per 1 GiB kapasitas virtual, dan jumlah yang kurang lebih sama juga disimpan pada indeks segmen pendukung bahkan sebelum data payload ditulis. Alokasi payload tetap dinamis. Karena binary initrd statis menggunakan i686, MiniOS juga menerapkan batas ukuran logis yang sadar RAM serta batas keras 2.000.000 MiB di bawah titik kegagalan address-space yang telah diuji.

Image logis berisi ext4. Image yang sudah ada akan diperiksa sebelum proses mount writable; hasil pemeriksaan filesystem di atas status error-terkoreksi akan menolak sesi, bukan melakukan mount writable. Resize hanya mendukung penambahan kapasitas, dan filesystem ext4 di dalamnya akan diperluas jika memungkinkan. Untuk diagnosis yang ditujukan ke pengguna, lihat[Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Mode `dynblk` ini adalah backend block-device kernel yang terpisah dari DynFileFS. Setiap sesi bernomor memiliki namespace `volume000.db` sendiri dengan namespace yang dibuat secara dinamis `volume001.db` hingga `volume063.db` sibling. Melampirkan volume melalui `/dev/dynblk-control` akan mengembalikan perangkat whole-disk yang dialokasikan secara dinamis seperti `/dev/dynblk0` atau `/dev/dynblk3`; MiniOS harus menggunakan perangkat yang dikembalikan dan tidak boleh mengasumsikan bahwa `dynblk0` tersedia. Beberapa volume DynBlk dapat dilampirkan secara bersamaan.

MiniOS membuat ext4 langsung pada perangkat whole-disk DynBlk, memeriksa ext4 yang sudah ada sebelum digunakan secara writeable, dan mendukung pertumbuhan hingga batas format-1 sebesar 512 GiB. Proses pengecilan tidak didukung. Status boot yang dilindungi akan mencatat secara tepat `/dev/dynblkN` yang digunakan oleh sesi persisten yang sedang berjalan sehingga saat shutdown, perangkat yang sama akan dilepas setelah filesystem-nya di-unmount. Hal ini tetap akurat meskipun Session Manager sementara melampirkan sesi DynBlk lain secara paralel.

Kapasitas virtual bersifat tipis: tidak ada ruang host yang dialokasikan sebelumnya atau pemetaan RAM. DynBlk menyimpan 128 pemetaan logis 4 KiB di setiap chunk runtime 4 KiB, sehingga memori pemetaan padat sekitar 8 MiB/GiB. Pointer pohon level-0 berada bersama chunk sparse tersebut; indeks internal-node tetap sebesar 396.312 byte per perangkat yang terpasang, dan penghitung referensi physical-page dialokasikan secara dinamis dalam chunk 4 KiB yang masing-masing mencakup 8 MiB ruang backing. Jika tidak ada anggaran pemetaan eksplisit, driver DynBlk akan memilih sekitar 25% dari RAM yang dapat digunakan kernel setelah normalisasi 64 MiB, dengan batas maksimum 4096 MiB. MiniOS menyerahkan kebijakan tersebut kepada driver.

Volume DynBlk baru dapat menggunakan kompresi backend yang dipilih dengan `perchcomp`. Kompresi merupakan properti dari format penyimpanan DynBlk dan akan tetap untuk volume tersebut setelah dibuat. Jika LUKS2 membungkus DynBlk, maka MiniOS memaksa kompresi DynBlk ke `none`, karena lapisan enkripsi berada di atas perangkat DynBlk. Penulisan aktual tetap dapat gagal karena ruang kosong filesystem bawah, namespace backing 64-part, atau penerimaan pemetaan DynBlk. Perangkat yang gagal atau terblokir hanya akan dilepas setelah filesystem atasnya tidak lagi ter-mount; proses pemulihan akan memvalidasi format yang tersimpan pada saat attach berikutnya.

### Raw

Mode Raw menggunakan satu `changes.img` file yang berisi ext4. Panjang file ditetapkan sesuai kapasitas logis yang diminta saat pembuatan, sehingga berbeda dengan backend dinamis, kapasitasnya tetap hingga dilakukan operasi grow secara eksplisit. Filesystem bawah dapat merepresentasikan bagian yang belum ditulis secara sparse, tetapi MiniOS tetap memperlakukan Raw sebagai penyimpanan dengan kapasitas tetap dan memeriksa ketersediaan ruang sebelum membuat atau memperbesar file tersebut. Karena semuanya berada dalam satu file di host, FAT32 dibatasi hingga 4000 MiB.

Citra Raw yang sudah ada akan diperiksa dengan `e2fsck` sebelum proses mounting writable. Proses grow akan memperbesar `changes.img` lalu memperluas ext4 menggunakan `resize2fs`; proses shrink tidak didukung. Jika pemeriksaan atau mounting gagal, citra tetap dipertahankan untuk pemulihan dan booting akan dilanjutkan di RAM. Raw tidak memiliki daemon FUSE atau metadata block-storage khusus, sehingga model pemulihannya menjadi sederhana, namun tidak memiliki perilaku thin-capacity seperti DynFileFS dan DynBlk.

### Lapisan enkripsi LUKS

LUKS2 adalah lapisan enkripsi opsional yang dapat dipilih dengan `perchencrypt=luks` saat membuat sesi Raw, DynFileFS, atau DynBlk. Sesi yang sudah ada mengambil status enkripsinya dari metadata sesi; penentuan `perchencrypt` setelahnya tidak akan mengubah atau mengonversi sesi plaintext yang sudah ada.

Batas enkripsi tergantung pada backend: Raw menghubungkan `changes.img` melalui perangkat loop dan menempatkan LUKS2 di dalam file tersebut; DynFileFS menghubungkan `virtual.dat` yang diekspos melalui perangkat loop dan mengenkripsi image logis tersebut; DynBlk menggunakan `/dev/dynblkN` perangkat blok secara langsung sebagai sumber LUKS2. Pada ketiga kasus tersebut, MiniOS membuat ext4 di dalam `/dev/mapper/...`, sehingga isi dan metadata filesystem di dalam mapper akan terenkripsi saat tidak digunakan. Metadata backend di luar batas LUKS, file boot, metadata sesi, dan file lain pada media penyimpanan tetap tidak terenkripsi.

Default ukuran, batas pertumbuhan, pembatasan FAT32, dan perilaku alokasi thin/fixed tetap mengikuti backend yang digunakan. Initrd melakukan autentikasi sebelum memperbesar backend terenkripsi yang sudah ada, menutup mapper sebelum pertumbuhan backend, lalu membukanya kembali, memeriksa ext4, dan memperluas filesystem sebelum melakukan mounting. Untuk DynBlk terenkripsi, kompresi backend dipaksa ke `none`.

Proses pembuatan meminta frasa sandi dua kali. Sesi terenkripsi yang sudah ada mengizinkan tiga kali percobaan membuka kunci di konsol boot. Tiga frasa sandi yang ditolak akan memicu jalur boot fatal: MiniOS tidak akan melanjutkan di RAM, tidak akan mengubah sesi yang sama menjadi plaintext, memilih backend lain, atau membuat pengganti. Kegagalan lain saat pembuatan, pengecekan, resize, atau mounting tetap mengikuti mekanisme pemulihan backend tanpa fallback ke plaintext. Frasa sandi tidak disimpan di metadata sesi maupun dikirim sebagai argumen perintah. Ekspor logis berisi file sesi yang telah didekripsi, bukan image backend terenkripsi.

Lihat [Keamanan](/maintenance-and-recovery/Security) untuk penjelasan batas perlindungan dan pertimbangan backup.

### SquashFS

Initrd biasanya mengaktifkan sesi SquashFS yang sudah ada. Pengaturan interaktif membuat metadata generasi nol dengan penyimpanan saat shutdown diaktifkan, namun tidak membuat `changes.sb`; layer atas yang dapat ditulis hanya ada di RAM hingga sistem berjalan melakukan penyimpanan pertama secara on demand atau saat shutdown. Sesi generasi nol hanya valid jika field artefak snapshot dan `changes.sb` tidak ada. Untuk generasi berikutnya, aktivasi akan memvalidasi metadata snapshot yang ketat dan bernilai tunggal, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Sistem juga memeriksa tipe file dan ukuran pastinya, ketersediaan RAM dan swap, digest SHA-256 sebelum dan sesudah ekstraksi, serta kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke dalam image ext4 sementara yang terbatas di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir`; untuk AUFS, root-nya adalah cabang yang dapat ditulis.
Metadata yang rusak, memori tidak cukup, perubahan digest, error ekstraksi, atau kebijakan tidak valid akan menyebabkan aktivasi gagal dan boot tetap menggunakan upper RAM biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown yang bersih. SquashFS kemudian akan memberikan peringatan dan memulihkan `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terputus tersebut tidak dihitung sebagai generasi rollback kedua.

Manajer Sesi MiniOS dan backend penyimpanan sistem membuat serta mengganti snapshot SquashFS secara atomik menggunakan capture yang presisi. Aktivasi boot dapat membaca snapshot yang sudah ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena proses ekstraksi berlangsung di upper ext4 sementara. Pembuatan dan penyimpanan presisi tetap bergantung pada filesystem: area staging privatnya harus mempertahankan link, kepemilikan, mode, xattr, ACL, capability, dan union whiteout, sehingga penyimpanan saat ini memerlukan filesystem POSIX yang sesuai.

SquashFS tidak memiliki `perchsize`: ukuran yang disimpan mengikuti perubahan terkompresi yang dicapture, sedangkan memori runtime ditentukan oleh upper yang dapat ditulis hasil ekstraksi. Layer persistensi LUKS MiniOS tidak membungkus `changes.sb`; jika kerahasiaan snapshot diperlukan, media penyimpanan harus dienkripsi di luar layer ini. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi union dan batas pemulihan

Untuk AUFS, root perubahan yang diaktifkan menjadi branch writable nol. Untuk OverlayFS, initrd membangun `upperdir` dan `workdir` di bawah root perubahan yang diaktifkan dan me-mount modul read-only sebagai direktori bawah. Initrd kemudian memverifikasi branch AUFS live atau OverlayFS `upperdir` sebelum mempublikasikan persistensi sebagai aktif.

Jika backend persistensi, pembaruan metadata, atau verifikasi ini gagal, mount akan dibatalkan jika memungkinkan, tidak ada status persistensi yang sukses dipublikasikan, dan boot writable tetap dilanjutkan di RAM. Kegagalan membangun root union akan masuk ke shell initramfs fatal. Keluar dari shell tersebut dapat membuat setup berlanjut dengan root tidak valid; ini bukan perbaikan atau fallback yang aman. AUFS tetap mencoba menambahkan branch modul, tetapi union yang tidak lengkap melewati batas pemulihan: MiniOS tidak menandai persistensi sebagai aktif.

Kegagalan pemeriksaan container sengaja menghindari mount sesi yang dicurigai secara writable.
Jangan mengganti atau membangun ulang file sesi saat boot. Lindungi media penyimpanan yang terdampak terlebih dahulu; lihat [Membackup MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## Status aktif, berjalan, dan boot saat ini

Dalam metadata sesi yang tahan lama, `default=` adalah **aktif** sesi yang dipilih untuk resume berikutnya, sedangkan `running=` adalah sesi yang tercatat sebagai pemasok boot saat ini. Aktivasi menulis kedua field tersebut dan menandai sesi tersebut sebagai `dirty`.
Setelah mount persistence hilang selama shutdown yang bersih, MiniOS menghapus `running=` dan menandai sesi tersebut sebagai `clean`.

Field metadata tersebut bisa saja usang setelah crash, kegagalan penulisan metadata, kegagalan pembuatan union, penyalinan store, atau shutdown yang terputus. Komponen runtime yang mengizinkan penyimpanan tidak mempercayai `running=` saja. Mereka menggunakan status boot saat ini yang dilindungi oleh initrd, terikat pada boot ID, sesi numerik, mode, identitas store yang sebenarnya, status writable, durabilitas, generasi aktif yang terverifikasi, dan, untuk DynBlk, perangkat terlampir yang persis sama.`/dev/dynblkN` Jika catatan boot saat ini gagal atau hilang, persistence tidak boleh dianggap sebagai target penyimpanan yang disetujui.

Dengan `toram` dan permintaan persistence yang dikenali, store sesi akan disalin ke RAM sebelum aktivasi. Sesi yang disalin dapat writable dan dapat digunakan sebagai upper yang berjalan, namun status boot saat ini ditandai sebagai non-durable. Perubahan pada salinan RAM tersebut tidak akan kembali ke perangkat asli dan akan hilang saat shutdown.

Untuk panduan operasional terkait, lihat [Mode boot](/using-minios/Boot-Modes), [Parameter boot](/reference/Boot-Parameters), [Sesi dan persistence](/using-minios/Sessions-and-Persistence), [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Keamanan](/maintenance-and-recovery/Security), dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).
