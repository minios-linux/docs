---
updated: 2026-09-26
---

# Internal Persistensi

Halaman ini menjelaskan parameter boot `perch`, `perchdir`, `perchmode`, `perchsize`, dan `perchreserve`. Parameter-parameter ini mengatur di mana perubahan dari sesi live akan disimpan. Untuk penggunaan normal, pilih entri persisten di menu boot atau gunakan Manajer Sesi MiniOS daripada mengeditnya secara manual.

MiniOS membangun root live dari modul read-only dan satu lapisan atas yang dapat ditulis.
Initrd menentukan apakah lapisan atas itu adalah sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan dan jalur aktivasi saat boot. Untuk kontrol yang ditujukan bagi pengguna, lihat [Mode Boot](/using-minios/Boot-Modes) dan [Parameter Boot](/reference/Boot-Parameters).

## Penjelasan sederhana

Tanpa parameter persistensi, MiniOS akan menyimpan perubahan di RAM dan membuangnya saat shutdown. Parameter persistensi meminta MiniOS untuk mencari media penyimpanan yang dapat ditulis, memilih atau membuat sesi bernomor, memeriksa kompatibilitas, dan menggunakan sesi tersebut sebagai layer yang dapat ditulis.

Meminta persistensi tidak menjamin fitur ini aktif. Jika target hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat melanjutkan dengan layer sementara di RAM. Bacalah peringatan saat startup sebelum mengandalkan perubahan yang tersimpan.

## Penjelasan parameter

| Parameter | Menjelaskan apa yang dilakukan MiniOS | Pilihan umum |
|---|---|---|
| `perchdir=resume` | Membuka sesi default yang kompatibel dan, jika kondisi mendukung, membuat pengganti jika tidak dapat digunakan. | Pekerjaan harian biasa. |
| `perchdir=new` | Membuat sesi baru dengan nomor tertentu. | Mempertahankan workspace yang sudah ada tanpa perubahan. |
| `perchdir=ask` | Menampilkan sesi yang tersimpan setelah penyimpanan yang dapat dilanjutkan ditemukan dan memungkinkan Anda memilih salah satunya. Tidak dapat membuat sesi pertama pada storage yang kosong. | Beberapa workspace yang sudah ada di satu perangkat; gunakan `perchdir=new` untuk sesi pertama. |
| `perchdir=NUMBER` | Meminta sesi bernomor tertentu. | Entri boot kustom yang stabil setelah memeriksa ID sesi. |
| `perchmode=MODE` | Pilih `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. | Sesuaikan filesystem pendukung dan model persistensi yang diinginkan. |
| `perchencrypt=luks` | Tambahkan lapisan LUKS2 saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. | Enkripsi backend container yang didukung. |
| `perchsize=SIZE` | Meminta ukuran sesi container baru atau yang sedang bertambah. | DynFileFS, DynBlk, VMDK, atau raw; enkripsi tidak mengubah semantik ukuran backend. |
| `perchcomp=CODEC` | Pilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`; ketersediaan tetap tergantung pada kernel yang berjalan. Kompresi dinonaktifkan saat LUKS membungkus DynBlk. |
| `perchreserve=MB` | Kurangi margin saat menentukan ukuran container baru atau yang bertambah dan atur ambang peringatan ruang rendah. | Sisakan ruang kerja saat mengalokasikan container; ini bukan kuota runtime. |
| `perch` | Gunakan perilaku resume lama tanpa pembuatan pengganti otomatis. | Kompatibilitas dengan entri kustom yang sudah ada; lebih disarankan `perchdir=resume` untuk menu saat ini. |

Jangan gabungkan persistensi dengan `toram` saat Anda mengharapkan perubahan akan ditulis kembali ke perangkat asli. MiniOS mengaktifkan sesi yang disalin di RAM, dan perubahan pada salinan tersebut akan hilang saat shutdown.

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

MiniOS menggunakan 256 MiB sebagai margin alokasi default dan ambang peringatan ruang rendah. Perhitungan menggunakan blok filesystem 1024-byte. `perchreserve` menerima angka bulat tak bertanda tanpa satuan, dibatasi maksimal 4096, dan akan kembali ke 256 jika kosong atau tidak valid. Margin ini mengurangi ruang yang ditawarkan untuk container baru atau yang bertambah. Ini bukan kuota: sesi native atau penulisan berikutnya masih dapat menggunakan sisa ruang filesystem. Boot akan memperingatkan jika ruang kosong saat ini sama dengan atau di bawah ambang batas.

Ukuran container menggunakan jumlah bulat yang dialokasikan dalam MiB:

- Angka tanpa satuan, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Container Raw dibatasi hingga 1.000.000 MiB dan oleh ruang yang tersedia setelah cadangan. DynFileFS memiliki batas khusus yang memperhitungkan RAM dan batas keras 2.000.000 MiB. DynBlk mendapatkan batas geometri format native dari `dynblk limits --format dynblk`; MiniOS tidak memberlakukan batas 512-GiB terpisah.
- Raw adalah satu file pendukung, sehingga FAT32 membatasinya hingga 4000 MiB di MiniOS. Batas yang sama berlaku saat Raw dibungkus dalam LUKS2.
- Sesi raw baru secara default berukuran 4000 MiB. Enkripsi tidak membuat kebijakan ukuran LUKS terpisah: Raw terenkripsi, DynFileFS, DynBlk, atau sesi VMDK mengikuti aturan ukuran backend dasarnya.
- Sesi DynFileFS baru yang dibuat initrd tanpa `perchsize` menggunakan hingga 16 GiB kapasitas logis. Jika media pendukung tidak dapat menampung sebanyak itu setelah `perchreserve` dan overhead indeks DynFileFS, default dikurangi ke kapasitas yang tersedia. Indeks format-400 memakan sekitar 2 MiB dari RAM dan sekitar 2 MiB penyimpanan pendukung per GiB kapasitas logis yang dideklarasikan, meskipun payload masih kosong. MiniOS juga membatasi kapasitas DynFileFS dari RAM fisik dan oleh batas keras 2.000.000 MiB yang telah diuji.
- Sesi DynBlk baru tanpa `perchsize` mengikuti batas otomatis 16 GiB yang sama dan akan dikurangi jika ruang pendukung yang tersisa kurang setelah `perchreserve`. Ukuran DynBlk eksplisit adalah permintaan kapasitas tipis yang diperiksa terhadap batas backend terpasang. Metadata untuk bagian yang dideklarasikan dibuat di awal, namun ruang payload akan bertambah sesuai kebutuhan. DynBlk memiliki cache metadata terbatas yang terpisah dari pemenuhan payload.

Pertumbuhan container bersifat best-effort dan pengurangan ukuran tidak didukung. `perchsize` tidak menentukan ukuran sesi native atau SquashFS. Manajer Sesi MiniOS mengatur default container raw dan DynFileFS yang dibuat manual ke 4000 MiB dan DynBlk ke 16 GiB; varian terenkripsi menggunakan default backend yang sama. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi penyimpanan

Semua backend yang berhasil harus menyediakan writable upper yang diharapkan oleh union filesystem yang dipilih. Mount backend saja tidak membuktikan bahwa persistensi sudah aktif. Native, DynFileFS, DynBlk, VMDK, dan raw dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda commit metadata tersebut. Raw, DynFileFS, DynBlk, dan VMDK juga dapat menggunakan enkripsi LUKS2. Status current-boot yang terlindungi hanya dipublikasikan setelah root union terakhir dipastikan menggunakan upper yang sesuai.

| Backend | Representasi persisten | Model kapasitas | Kebutuhan penyimpanan pendukung | Lapisan LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File dan direktori langsung di dalam direktori sesi bernomor | Menggunakan ruang filesystem pendukung secara langsung; `perchsize` tidak berlaku | Filesystem yang dapat ditulis dan lolos uji perilaku POSIX | Tidak |
| `dynfilefs` | Format-400 `changes.dat` ditambah file segmen yang mengekspose ext4 `virtual.dat` | Payload tipis dengan indeks berdensitas sesuai kapasitas | Penyimpanan POSIX, FAT32, NTFS, atau exFAT yang dapat ditulis | Ya |
| `dynblk` | Format-1 `volumeNNN.db` file yang mengekspose `/dev/dynblkN`, dengan ext4 di atasnya | Perangkat blok virtual tipis dengan pemetaan di disk dan cache terbatas | Filesystem yang diterima oleh backend kernel DynBlk dan sumber daya backend yang cukup | Ya |
| `raw` | Satu file berukuran tetap `changes.img` yang berisi ext4 | File dibuat sesuai ukuran logis yang diminta; hanya dapat bertambah | Filesystem yang dapat ditulis dan mampu menampung image; FAT32 terbatas hingga 4000 MiB | Ya |
| `squashfs` | Terkompresi `changes.sb` snapshot; writable runtime upper direkonstruksi di RAM | Ukuran snapshot mengikuti perubahan yang ditangkap; `perchsize` tidak berlaku | Snapshot yang sudah ada dapat dibaca dari media tulis yang didukung; penyimpanan persis membutuhkan store persisten yang mendukung POSIX | Tidak |

### Native

Mode Native menyimpan konten union yang dapat ditulis secara langsung di direktori sesi bernomor. Tidak ada image internal, perangkat loop, kontainer FUSE, atau filesystem blok terpisah, sehingga kapasitasnya mengikuti ruang kosong pada filesystem dasar dan `perchsize` tidak berlaku. Ini memberikan overhead kontainer paling rendah dan menjaga visibilitas file seperti biasa untuk pemulihan dan pencadangan.

MiniOS terlebih dahulu mengecualikan filesystem non-POSIX yang sudah dikenal seperti FAT, exFAT, dan NTFS. Selanjutnya, sistem akan menguji perilaku filesystem sebenarnya dengan membuat file dan symlink serta memeriksa perubahan mode eksekusi. Jika pengujian berhasil, direktori sesi bernomor akan di-bind-mount langsung sebagai area yang dapat ditulis. Jika filesystem diketahui tidak cocok, atau pengujian POSIX gagal, mode native akan beralih ke DynFileFS. Kegagalan setelah aktivasi native akan dibatalkan; kandidat kosong baru akan dihapus jika sudah aman untuk dihapus.

Lapisan persistensi MiniOS LUKS2 tidak membungkus mode native karena mode native tidak memiliki batas kontainer atau block device untuk dienkripsi. Persistensi native tetap dapat ditempatkan pada media penyimpanan yang dienkripsi di luar lapisan persistensi ini.

### DynFileFS

DynFileFS adalah backend container format-400 berbasis FUSE. Backend ini menyediakan satu image logis`virtual.dat` saat data disimpan di`changes.dat` beserta file segmen bernomor. Helper harus berhasil melakukan mount dan menampilkan`virtual.dat`; jika tidak, proses aktivasi akan gagal daripada secara tidak sengaja membuat file hanya-RAM dengan nama yang tampak persisten.

Indeks mapping-nya padat terhadap kapasitas logis yang dideklarasikan: setiap blok logis 4 KiB memiliki satu offset 8-byte. Ini setara sekitar 2 MiB indeks RAM per 1 GiB kapasitas virtual, dan jumlah yang kurang lebih sama juga disimpan pada indeks segmen pendukung bahkan sebelum data payload ditulis. Alokasi payload tetap dinamis. Karena binary initrd statis menggunakan i686, MiniOS juga menerapkan batas ukuran logis yang sadar RAM serta batas keras 2.000.000 MiB di bawah titik kegagalan address-space yang telah diuji.

Image logis berisi ext4. Image yang sudah ada akan diperiksa sebelum proses mount writable; hasil pemeriksaan filesystem di atas status error-terkoreksi akan menolak sesi, bukan melakukan mount writable. Resize hanya mendukung penambahan kapasitas, dan filesystem ext4 di dalamnya akan diperluas jika memungkinkan. Untuk diagnosis yang ditujukan ke pengguna, lihat[Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Mode `dynblk` menggunakan perangkat blok kernel, terpisah dari DynFileFS. Setiap sesi bernomor memiliki `volume000.db` dan semua saudara bernomor (`volume001.db`, ..., `volume1000.db`, dan seterusnya). Tata letak native adalah `DBSPRS01`, format disk **1**. Tata letak yang tidak didukung akan ditolak, bukan diam-diam dikonversi. Pastikan versi CLI dan modul yang terpasang sesuai.

MiniOS membuat ext4 pada seluruh disk yang dikembalikan oleh `/dev/dynblk-control`, seperti `/dev/dynblk3`; tidak mengasumsikan bahwa `dynblk0` bebas. ext4 yang sudah ada akan diperiksa sebelum digunakan secara writable. Status boot yang dilindungi mencatat perangkat tersebut secara persis sehingga shutdown hanya melepaskannya setelah semua pengguna dan filesystem upper ditutup. Beberapa perangkat independen dapat digunakan bersamaan.

Session Manager, installer, dan initramfs melakukan query ke `dynblk limits --format dynblk` untuk batas geometri backend yang terpasang. Resource guard saat ini mengizinkan 65536 part: rentang logis standar 1-GiB memungkinkan hingga 64 TiB. Batas fisik part yang lebih kecil akan mengurangi batas virtual. Ini adalah batas geometri, bukan jaminan host dapat membuka sebanyak itu file atau memiliki cukup RAM/storage. Pertumbuhan didukung; pengurangan tidak.

Tabel pemetaan disimpan di disk. `--map-memory-mb` mengatur cache metadata per perangkat (default 1 MiB, rentang 1..64 MiB), tidak lagi berupa persentase dari RAM atau batas data yang dipetakan. Deskripsi extent, vektor file terbuka, dan direktori kecil bertambah sesuai geometri yang dideklarasikan, bukan isi payload. Attach akan memindai metadata pemetaan dan sementara membangun ulang status alokasi satu part per waktu; tidak membaca setiap payload. Full `dynblk check` akan membaca payload. `engine_memory_bytes` tidak termasuk page cache filesystem, internal codec, dan alokasi kernel lainnya.

File metadata untuk semua part yang dideklarasikan diinisialisasi saat create/grow; data aktual tetap tipis. Setiap part dibatasi 4000 MiB. Cadangkan seluruh namespace yang terlepas, tanpa mengasumsikan tiga digit atau part terakhir tetap. Volume baru dapat memilih kompresi dengan `perchcomp`; pemuatan berikutnya menggunakan codec yang tersimpan. LUKS2 di atas DynBlk memaksa kompresi ke `none`. Penulisan parsial ke data terkompresi saat ini akan mengompresi ulang grain 64-KiB terkait. Kegagalan storage atau resource masih dapat menyebabkan penulisan gagal; filesystem upper harus di-unmount sebelum detach.

### Sesi VMDK

Mode sesi `vmdk` menggunakan driver yang sama dengan image `twoGbMaxExtentSparse`
asli. Primernya adalah `volume.vmdk`, dengan `volume-s001.vmdk` dan part berikutnya
; setiap part mencakup hingga 2 GiB ruang logis. Deskriptornya dibatasi
kurang dari 1 MiB, jadi panjang nama file dan jumlah extent membatasi kapasitas.
Session Manager, Installer, dan initramfs melakukan query ke `dynblk limits --format vmdk`.
Mode native tetap menggunakan `volume000.db`; kedua mode tidak menafsirkan ulang 
file satu sama lain. Sesi yang dikelola tidak mengimpor VMDK eksternal yang dipartisi sembarangan 
sebagai metadata sesi.

Dukungan sesi VMDK diiklankan oleh `vmdk-session-v1` di
`/etc/minios-initramfs-dynblk` dalam initrd. Runtime saat ini dan setiap
initrd sumber yang disalin oleh Installer harus mendukungnya. VMDK tidak memiliki kompresi native;
`perchcomp` akan diabaikan dengan peringatan saat boot dan Session Manager akan menolak 
codec VMDK non-`none`. LUKS tetap menjadi lapisan terpisah opsional. Kedua mode mempublikasikan
mode sesi aktual dan pemilik `dynblk_device` di boot-state yang dilindungi,
dan kedua implementasi shutdown akan menutup perangkat tersebut setelah semua pengguna keluar.

Kedua format driver mendukung `writeback`, `writethrough`, `none`, `directsync` dan kebijakan attachment `unsafe`eksplisit. Mode langsung saat ini memerlukan ext2/ext4 di bawahnya. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` mengaitkan filesystem yang sudah ada; `umount` melepaskan perangkat yang dimiliki helper setelah pengguna terakhir menutupnya. `dynblk load` memiliki masa aktif eksplisit. Ini tidak membuat filesystem atau membuka kunci LUKS.

### Raw

Mode Raw menggunakan satu `changes.img` file yang berisi ext4. Panjang file ditetapkan sesuai kapasitas logis yang diminta saat pembuatan, sehingga berbeda dengan backend dinamis, kapasitasnya tetap hingga dilakukan operasi grow secara eksplisit. Filesystem bawah dapat merepresentasikan bagian yang belum ditulis secara sparse, tetapi MiniOS tetap memperlakukan Raw sebagai penyimpanan dengan kapasitas tetap dan memeriksa ketersediaan ruang sebelum membuat atau memperbesar file tersebut. Karena semuanya berada dalam satu file di host, FAT32 dibatasi hingga 4000 MiB.

Citra Raw yang sudah ada akan diperiksa dengan `e2fsck` sebelum proses mounting writable. Proses grow akan memperbesar `changes.img` lalu memperluas ext4 menggunakan `resize2fs`; proses shrink tidak didukung. Jika pemeriksaan atau mounting gagal, citra tetap dipertahankan untuk pemulihan dan booting akan dilanjutkan di RAM. Raw tidak memiliki daemon FUSE atau metadata block-storage khusus, sehingga model pemulihannya menjadi sederhana, namun tidak memiliki perilaku thin-capacity seperti DynFileFS dan DynBlk.

### Lapisan enkripsi LUKS

LUKS2 adalah lapisan enkripsi opsional yang dipilih dengan `perchencrypt=luks` saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. Sesi yang sudah ada mengambil status enkripsi dari metadata sesi; menentukan `perchencrypt` setelahnya tidak akan menafsirkan ulang atau mengonversi sesi plaintext yang sudah ada.

Batas enkripsi tergantung pada backend: Raw mengaitkan `changes.img` melalui perangkat loop dan menempatkan LUKS2 di dalam file tersebut; DynFileFS mengaitkan `virtual.dat` yang diekspos melalui perangkat loop dan mengenkripsi image logis tersebut; DynBlk menggunakan perangkat blok `/dev/dynblkN` secara langsung sebagai sumber LUKS2. Pada ketiga kasus, MiniOS membuat ext4 di dalam `/dev/mapper/...`, sehingga isi filesystem dan metadata di dalam mapper terenkripsi saat diam. Metadata backend di luar batas LUKS, file boot, metadata sesi, dan file lain di media persistensi tetap tidak terenkripsi.

Default ukuran, batas pertumbuhan, pembatasan FAT32, dan perilaku alokasi tipis/tetap tetap mengikuti backend dasarnya. Initrd melakukan autentikasi sebelum menambah backend terenkripsi yang sudah ada, menutup mapper sebelum pertumbuhan backend, lalu membukanya kembali, memeriksa ext4, dan memperbesar filesystem sebelum mount. Untuk DynBlk terenkripsi, kompresi backend dipaksa ke `none`.

Saat pembuatan, passphrase diminta dua kali. Sesi terenkripsi yang sudah ada mengizinkan tiga kali percobaan unlock di konsol boot. Tiga passphrase yang ditolak akan memicu jalur boot fatal: MiniOS tidak akan melanjutkan di RAM, menafsirkan ulang sesi yang sama sebagai plaintext, memilih backend lain, atau membuat pengganti. Kegagalan pembuatan, pemeriksaan, resize, atau mount lainnya tetap mengikuti perilaku pemulihan backend tanpa fallback plaintext. Passphrase tidak disimpan di metadata sesi atau dikirim sebagai argumen perintah. Ekspor logis berisi file sesi yang sudah didekripsi, bukan image backend terenkripsi.

Lihat [Keamanan](/maintenance-and-recovery/Security) untuk batas perlindungan dan pertimbangan backup.

### SquashFS

Initrd biasanya mengaktifkan sesi SquashFS yang sudah ada. Setup interaktif membuat metadata generasi-nol dengan penyimpanan saat shutdown diaktifkan, namun tidak membuat `changes.sb`; writable upper layer hanya ada di RAM sampai sistem berjalan melakukan penyimpanan pertama sesuai permintaan atau saat shutdown. Sesi generasi-nol hanya valid jika field artefak snapshot dan `changes.sb` tidak ada. Untuk generasi berikutnya, aktivasi memvalidasi metadata snapshot yang ketat dan bernilai tunggal, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Sistem juga memeriksa tipe dan ukuran file, RAM dan swap yang tersedia, digest SHA-256 sebelum dan sesudah ekstraksi, serta kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke dalam image ext4 sementara yang dibatasi di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir`; untuk AUFS, root-nya adalah branch yang dapat ditulis.
Metadata yang rusak, memori tidak cukup, perubahan digest, error ekstraksi, atau kebijakan tidak valid akan menggagalkan aktivasi dan sistem boot tetap menggunakan upper RAM biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown bersih. SquashFS kemudian akan memberi peringatan dan mengembalikan snapshot `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terputus tidak dianggap sebagai generasi rollback kedua.

Manajer Sesi MiniOS dan backend penyimpanan sistem membuat dan mengganti snapshot SquashFS secara atomik menggunakan capture yang persis. Aktivasi boot dapat membaca snapshot yang sudah ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena ekstraksi dilakukan di upper ext4 sementara. Pembuatan dan penyimpanan persis tetap tergantung pada filesystem: store sesi harus mendukung pembuatan workspace privat, metadata Linux, dan publikasi yang tahan lama di filesystem POSIX yang sesuai.

Saat menyimpan, backend pertama-tama menangkap pohon file yang stabil di penyimpanan memori privat milik root jika initrd menyediakan tmpfs tepercaya dengan ruang yang cukup. Jika RAM tidak mencukupi, pohon ini menggunakan workspace disk sebelumnya. Kompresor menulis langsung ke satu direktori mode-0700 privat di filesystem sesi, bukan ke image RAM tambahan lalu disalin ke disk lagi. MiniOS memverifikasi hasil kompresi dan identitasnya, melakukan sync, memindahkan ke nama kandidat privat, lalu merevalidasi kandidat sebelum mengganti snapshot aktif secara atomik.`changes.sb`. Salinan atau kompresi yang gagal tidak akan menggantikan snapshot terakhir yang berhasil.

Dengan sesi yang tahan lama dan sehat, `/var/log/minios` dan `/var/log/live` di-bind-mount dari `boot-logs/` di dalam sesi bernomor. Diagnostik startup ini ditulis terpisah dari upper RAM dan snapshot shutdown. Boot yang store persistensinya tidak diaktifkan secara tahan lama tidak dapat menjamin log tersebut akan bertahan setelah restart. Log dan cache biasa dapat dikonfigurasi secara terpisah; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS tidak memiliki `perchsize`: ukuran yang disimpan mengikuti perubahan terkompresi, sedangkan memori runtime ditentukan oleh writable upper yang diekstrak. Lapisan persistensi LUKS MiniOS tidak membungkus `changes.sb`; jika kerahasiaan snapshot diperlukan, penyimpanan pendukung harus dienkripsi di luar lapisan ini. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

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

## Reklamasi ruang berbasis sesi

`minios-session reclaim ID` beroperasi pada kedua format blok. Untuk sesi plaintext
akan melaporkan rentang ext4 kosong dengan FITRIM, lalu memanggil `dynblk reclaim`.
Untuk sesi aktif, perangkat terikat pada status boot saat ini yang dilindungi dan
mount ext4 aktual akan diperiksa; root union tidak pernah dipangkas langsung.
Sesi tidak aktif akan di-attach dan di-mount sementara untuk operasi ini.

Baik boot maupun shutdown tidak menjalankan kompaksi secara otomatis. `--compact` adalah
pilihan eksplisit pengguna di CLI atau opsi dialog Session Manager yang tidak dicentang.
Tanpa itu, hanya hole punching (jika didukung) dan truncation free-tail yang terjadi.
Kebijakan discard LUKS tidak diubah oleh perintah sesi.
