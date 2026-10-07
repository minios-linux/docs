---
updated: 2026-10-06
---

# Internal Persistensi

Halaman ini menjelaskan `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, dan `perchtoram` parameter boot. Parameter ini mengatur di mana perubahan dari sesi live disimpan, bagaimana sesi baru dibuat, dan apakah penyimpanan sesi yang didukung akan disalin ke RAM. Untuk penggunaan normal, pilih entri persisten di menu boot atau gunakan Manajer Sesi MiniOS daripada mengeditnya secara manual.

MiniOS membangun root live dari modul hanya-baca dan satu lapisan atas yang dapat ditulis.
Initrd menentukan apakah lapisan atas tersebut adalah sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan dan jalur aktivasi saat boot. Untuk kontrol yang terlihat oleh pengguna, lihat [Mode Boot](/using-minios/Boot-Modes) dan [Parameter Boot](/reference/Boot-Parameters).

## Dengan bahasa sederhana

Tanpa parameter persistensi, MiniOS menempatkan perubahan di RAM dan akan menghapusnya saat aplikasi ditutup. Parameter persistensi meminta MiniOS untuk mencari media penyimpanan yang dapat ditulis, memilih atau membuat sesi bernomor, memeriksa kompatibilitas, dan menggunakan sesi tersebut sebagai layer yang dapat ditulis.

Meminta persistensi tidak menjamin fitur tersebut langsung aktif. Jika target hanya-baca, penuh, rusak, atau tidak kompatibel, MiniOS dapat tetap berjalan dengan layer RAM sementara. Bacalah peringatan saat startup sebelum mengandalkan perubahan yang disimpan.

## Penjelasan Parameter

| Parameter | Apa yang dijelaskan oleh MiniOS | Pilihan umum |
|---|---|---|
| `perchdir=resume` | Buka sesi default yang kompatibel dan, jika kondisi mendukung, buat pengganti jika tidak dapat digunakan. | Pekerjaan harian biasa. |
| `perchdir=setup` | Pilih backend persistensi dan opsi enkripsi/kompresi yang didukung secara interaktif, lalu buat sesi baru dengan nomor tertentu. | Entri **Mulai sesi baru** boot-menu saat ini. |
| `perchdir=new` | Buat sesi baru dengan nomor tertentu langsung menggunakan `perchmode` yang diminta/default, enkripsi, kompresi, dan ukuran tanpa menampilkan pemilih backend. | Entri boot yang sudah diatur atau skrip dengan opsi penyimpanan yang sudah ditentukan. |
| `perchdir=ask` | Tampilkan sesi yang tersimpan dan izinkan Anda memilih salah satu. Jika tidak ada sesi tersimpan pada penyimpanan, pemilih akan masuk ke alur pengaturan yang sama seperti `perchdir=setup`. | Beberapa workspace pada satu perangkat, termasuk pengaturan interaktif pertama pada penyimpanan kosong. |
| `perchdir=NUMBER` | Meminta sesi bernomor tertentu. | Entri boot kustom yang stabil setelah memeriksa ID sesi. |
| `perchmode=MODE` | Pilih `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. | Sesuaikan filesystem pendukung dan model persistensi yang diinginkan. |
| `perchencrypt=luks` | Tambahkan lapisan LUKS2 saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. | Enkripsi backend container yang didukung. |
| `perchsize=SIZE` | Minta ukuran untuk sesi container baru atau yang bertambah. | DynFileFS, DynBlk, VMDK, atau raw; enkripsi tidak mengubah skema ukuran backend. |
| `perchcomp=CODEC` | Pilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`; ketersediaan tetap tergantung pada kernel yang sedang berjalan. Kompresi dinonaktifkan jika LUKS membungkus DynBlk. |
| `perchreserve=MB` | Kurangi margin saat menentukan ukuran container baru atau yang bertambah dan atur ambang peringatan ruang rendah. | Sisakan ruang kerja saat mengalokasikan container; ini bukan kuota saat runtime. |
| `perch` | Gunakan perilaku resume lama tanpa pembuatan pengganti otomatis. | Kompatibilitas dengan entri kustom yang sudah ada; disarankan menggunakan `perchdir=resume` untuk menu saat ini. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Kontrol penyalinan persistensi secara terpisah dari sistem `toram`. | `off` menjaga store asli tetap aktif; `trim` hanya menyalin sesi yang didukung dan dipilih; `full` menyalin semua sesi container/SquashFS yang didukung. |

Jika persistensi diminta, sistem `toram` menjadikan `perchtoram=trim` sebagai default kecuali mode persistensi-RAM secara eksplisit diberikan. Tanpa sistem `toram`, persistensi tetap berada di penyimpanan secara default. Sesi yang disalin bersifat non-durable saat berjalan, namun Session Manager saat ini dapat secara eksplisit menyimpan status yang didukung RAM ke store asli atau menerbitkannya sebagai sesi baru jika store asli tersedia dan identitasnya sesuai dengan saat boot.

## Persistensi bersifat eksplisit

Initrd hanya mengaktifkan penanganan persistensi jika baris perintah kernel memuat salah satu token yang dikenali berikut:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Jika tidak ada token tersebut, termasuk ketika hanya terdapat `perch...` nama yang tidak dikenali, MiniOS akan membuat upper writable baru di RAM. Perubahan yang dilakukan selama boot tersebut akan dihapus saat shutdown.

Selector yang tersedia tidak semuanya setara:

| Selector | Perilaku initrd |
|---|---|
| `perch` | Mencoba melanjutkan metadata default. Tidak otomatis membuat sesi baru jika tidak ada yang dapat digunakan atau jika pemeriksaan kompatibilitas gagal. |
| `perchdir=resume` | Mencoba metadata default dan dapat secara otomatis membuat pengganti baru yang kompatibel. Ini adalah perilaku resume boot-menu saat ini. |
| `perchdir=setup` | Membuka pemilih backend terlebih dahulu, mencatat backend/enkripsi/permintaan kompresi yang dipilih, lalu mengikuti jalur alokasi sesi baru. |
| `perchdir=new` | Mengalokasikan direktori dengan ID numerik satu angka lebih besar dari ID numerik tertinggi yang ada. Tidak pernah menggunakan ulang direktori yang sudah ada dan tidak membuka pemilih backend. |
| `perchdir=ask` | Menawarkan sesi yang sudah ada jika tersedia; sesi yang tidak kompatibel memerlukan konfirmasi. Jika tidak ada default/sesi di store, akan beralih ke `setup` sehingga sesi pertama dapat dibuat secara interaktif. |
| `perchdir=NUMBER` | Menggunakan direktori tersebut jika sudah ada. Jika tidak ada, pemilihan dapat kembali ke default yang tercatat di metadata; tidak memesan nomor yang diminta. |

Parameter persistensi lain yang dikenali tanpa selector akan masuk ke jalur resume legacy yang sama seperti hanya `perch`: mereka meminta persistensi, tetapi tidak mengaktifkan pembuatan otomatis. Jika pemilihan atau aktivasi tidak dapat menghasilkan upper yang dapat digunakan, proses boot tetap berjalan normal dengan upper RAM dan menampilkan peringatan kegagalan.

## Penyimpanan dan lokasi sesi

Penyimpanan normal berada di `changes` direktori di samping data MiniOS, dengan direktori sesi bernomor dan `session.conf` atau `session.json` metadata:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Penyimpanan juga dapat dipilih sebagai perangkat beserta jalur opsional. Format yang diterima termasuk jalur `/dev/...` langsung, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, dan `askdisk:custom:path`. Sufiks yang dipisahkan dengan tanda titik dua akan menjadi jalur di bawah perangkat yang dipilih; sintaks garis miring setelah `askdisk` akan mengabaikan jalur kustom tersebut secara diam-diam. Subdirektori yang dipilih akan di-bind-mount sebagai penyimpanan sesi. MiniOS juga dapat mendeteksi partisi persistence pada drive yang sama dan penyimpanan persistence Ventoy yang didukung.

Sebelum pemilihan sesi, initrd harus me-mount lokasi sebagai writable dan membuktikan dapat membuat serta menghapus marker di penyimpanan. Perangkat blok yang tidak bisa dibuka untuk penulisan, mount hanya-baca, jalur yang tidak tersedia, atau uji tulis yang gagal akan menolak persistence untuk boot tersebut. Sesi yang sudah ada tidak langsung dipercaya hanya karena file-nya bisa dibaca.

## Seleksi dan kompatibilitas

Metadata sesi mencatat mode penyimpanan dan dapat mencatat versi MiniOS, edisi, union filesystem, dan ukuran container. Saat melanjutkan, sistem membandingkan mode, versi, edisi, dan union yang tercatat dengan mode yang diminta dan sistem saat ini.
Kolom kompatibilitas legacy yang hilang tidak dianggap sebagai ketidakcocokan.

Literal `perchdir=resume` membuat sesi bernomor baru jika default-nya tidak ada atau jika terjadi ketidakcocokan mode, versi, edisi, atau union yang tercatat sehingga default tersebut tidak sesuai. Penggunaan bare `perch`, pemilihan numerik langsung, dan permintaan resume legacy lainnya menolak penggantian otomatis dan tetap melanjutkan di RAM setelah kegagalan seleksi. `perchdir=ask` menampilkan informasi kompatibilitas dan memungkinkan override secara eksplisit. Sesi baru secara default menggunakan `native` kecuali mode lain yang diminta.

Mode penyimpanan adalah bagian dari kompatibilitas. Jika seleksi mencapai backend dispatch, mode yang diminta namun tidak dikenal akan kembali ke `native`, di mana probe-nya kemudian dapat memilih DynFileFS pada penyimpanan yang tidak sesuai. Sesi yang sudah ada dengan mode yang tercatat berbeda dapat gagal pada pengecekan kompatibilitas sebelumnya; permintaan resume legacy kemudian tetap berjalan di RAM alih-alih mencapai fallback tersebut.

## Cadangan ruang dan ukuran

MiniOS menggunakan 256 MiB sebagai margin alokasi default dan ambang peringatan ruang rendah. Perhitungan menggunakan blok filesystem 1024-byte. `perchreserve` menerima angka bulat tak bertanda tanpa satuan, dibatasi maksimal 4096, dan akan kembali ke 256 jika tidak diisi atau tidak valid. Margin ini mengurangi ruang yang ditawarkan untuk container baru atau yang bertambah. Ini bukan kuota: sesi native atau penulisan berikutnya tetap dapat menggunakan sisa ruang filesystem. Saat boot, peringatan akan muncul jika ruang kosong saat ini berada di ambang atau di bawah batas tersebut.

Ukuran container menggunakan bilangan bulat yang dialokasikan dalam satuan MiB:

- Angka tanpa satuan, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Container tipe Raw dibatasi maksimal 1.000.000 MiB dan juga oleh ruang yang tersedia setelah cadangan. DynFileFS memiliki batas terpisah yang memperhitungkan RAM dan batas keras 2.000.000 MiB. DynBlk mendapatkan batas geometri format native dari `dynblk limits --format dynblk`; MiniOS tidak menerapkan batas keras 512-GiB secara terpisah.
- Raw adalah satu file pendukung, sehingga FAT32 membatasi ukurannya hingga 4000 MiB di MiniOS. Batas yang sama berlaku jika Raw dibungkus dengan LUKS2.
- Sesi raw baru secara default berukuran 4000 MiB. Enkripsi tidak membuat kebijakan ukuran LUKS terpisah: Raw terenkripsi, DynFileFS, DynBlk, atau sesi VMDK mengikuti aturan ukuran backend dasarnya.
- Sesi DynFileFS baru yang dibuat oleh initrd tanpa `perchsize` menggunakan kapasitas logis hingga 16 GiB. Jika media penyimpanan tidak dapat menampung sebanyak itu setelah `perchreserve` dan overhead indeks DynFileFS, default akan dikurangi sesuai kapasitas yang tersedia. Indeks format-400 membutuhkan sekitar 2 MiB RAM dan sekitar 2 MiB ruang penyimpanan per GiB dari kapasitas logis yang dideklarasikan, bahkan saat payload masih kosong. Karena itu, MiniOS juga membatasi kapasitas DynFileFS dari RAM fisik dan dengan batas keras 2.000.000 MiB yang telah diuji.
- Sesi DynBlk baru tanpa `perchsize` mengikuti batas otomatis 16 GiB yang sama dan akan dikurangi jika ruang cadangan yang tersisa kurang setelah `perchreserve`. Ukuran DynBlk eksplisit adalah permintaan kapasitas tipis yang akan dicek terhadap batas backend yang terpasang. Metadata untuk bagian yang dideklarasikan dibuat di awal, namun ruang payload akan bertambah sesuai kebutuhan. DynBlk memiliki cache metadata terbatas yang terpisah dari isi payload.

Pertumbuhan container bersifat best-effort dan penyusutan tidak didukung. `perchsize` tidak mengatur ukuran sesi native atau SquashFS. Manajer Sesi MiniOS mengatur container raw dan DynFileFS yang dibuat manual ke 4000 MiB dan container DynBlk/VMDK ke 16 GiB; varian terenkripsi menggunakan default backend yang sama. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi penyimpanan

Semua backend yang berhasil harus menyediakan writable upper yang diharapkan oleh union filesystem yang dipilih. Mounting backend saja tidak membuktikan bahwa persistensi sudah aktif. Native, DynFileFS, DynBlk, VMDK, dan raw dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda komit metadata tersebut. Raw, DynFileFS, DynBlk, dan VMDK juga dapat menggunakan enkripsi LUKS2. Status current-boot yang dilindungi hanya akan dipublikasikan setelah root union terakhir dipastikan menggunakan upper yang diharapkan.

| Backend | Representasi persisten | Model kapasitas | Persyaratan backing-storage | Lapisan LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File dan direktori langsung di dalam direktori sesi bernomor | Menggunakan ruang filesystem backing secara langsung; `perchsize` tidak berlaku | Filesystem writable yang lolos uji perilaku POSIX | Tidak |
| `dynfilefs` | Format-400 `changes.dat` ditambah file segmen yang menampilkan ext4 `virtual.dat` | Payload tipis dengan indeks berukuran kapasitas yang padat | Penyimpanan POSIX, FAT32, NTFS, atau exFAT yang dapat ditulis | Ya |
| `dynblk` | Format-1 `volumeNNN.db` file yang menampilkan `/dev/dynblkN`, dengan ext4 di atasnya | Perangkat blok virtual tipis dengan pemetaan disk-residen dan cache terbatas | Filesystem yang diterima oleh backend kernel DynBlk dan sumber daya backend yang cukup | Ya |
| `vmdk` | `volume.vmdk` ditambah split sparse `volume-sNNN.vmdk` extent yang diekspos oleh driver DynBlk, dengan ext4 di atasnya | Perangkat blok virtual split-sparse tipis | Filesystem yang diterima oleh backend VMDK DynBlk dan `vmdk-session-v1` kapabilitas | Ya |
| `raw` | Satu file berukuran tetap `changes.img` yang berisi ext4 | File dibuat sesuai ukuran logis yang diminta; hanya dapat bertambah | Filesystem writable yang dapat menampung image; FAT32 dibatasi hingga 4000 MiB | Ya |
| `squashfs` | Snapshot `changes.sb` terkompresi; writable runtime upper direkonstruksi di RAM | Ukuran snapshot mengikuti perubahan yang ditangkap; `perchsize` tidak berlaku | Snapshot yang sudah ada dapat dibaca dari media writable yang didukung; penyimpanan persis memerlukan persistence store yang mendukung POSIX | Tidak |

### Native

Mode Native menyimpan isi union yang dapat ditulis langsung di direktori sesi bernomor. Tidak ada image internal, perangkat loop, kontainer FUSE, atau sistem file blok terpisah, sehingga kapasitas mengikuti ruang kosong pada filesystem dasar dan `perchsize` tidak berlaku. Ini memiliki overhead kontainer paling sedikit dan menjaga visibilitas file biasa untuk pemulihan dan pencadangan.

MiniOS terlebih dahulu mengecualikan filesystem non-POSIX yang sudah dikenal seperti FAT, exFAT, dan NTFS. Setelah itu, sistem akan menguji perilaku filesystem nyata dengan membuat file dan symlink serta memeriksa perubahan mode eksekusi. Jika pengujian berhasil, direktori sesi bernomor akan di-bind-mount langsung sebagai area yang dapat ditulis. Jika filesystem diketahui tidak cocok, atau pengujian POSIX gagal, mode native akan beralih ke DynFileFS. Kegagalan setelah aktivasi native akan dibatalkan; kandidat kosong baru akan dihapus jika sudah aman untuk dihapus.

Lapisan persistensi LUKS2 MiniOS tidak membungkus mode native karena native tidak memiliki batas kontainer atau perangkat blok untuk dienkripsi. Persistensi native masih dapat ditempatkan di penyimpanan yang dienkripsi di luar lapisan persistensi ini.

### DynFileFS

DynFileFS adalah backend kontainer format-400 berbasis FUSE. Backend ini menampilkan satu image logis`virtual.dat` saat menyimpan data di`changes.dat` ditambah file segmen bernomor. Helper harus berhasil melakukan mount dan menampilkan`virtual.dat`; jika tidak, aktivasi akan gagal daripada secara tidak sengaja membuat file hanya-RAM dengan nama yang tampak persisten.

Indeks mapping-nya padat terhadap kapasitas logis yang dideklarasikan: setiap blok logis 4 KiB memiliki satu offset 8-byte. Itu sekitar 2 MiB indeks RAM per 1 GiB kapasitas virtual, dan jumlah yang kurang lebih sama juga disimpan di indeks segmen pendukung bahkan sebelum data payload ditulis. Alokasi payload sendiri tetap dinamis. Karena binary initrd statis menggunakan i686, MiniOS juga menerapkan batas ukuran logis yang sadar RAM dan batas keras 2.000.000 MiB di bawah titik kegagalan address-space yang telah diuji.

Image logis ini berisi ext4. Image yang sudah ada akan diperiksa sebelum proses mount writable; hasil pemeriksaan filesystem di atas status error yang telah diperbaiki akan menolak sesi tersebut, bukan melakukan mount writable. Resize hanya dapat memperbesar, dan filesystem ext4 di dalamnya akan diperluas jika memungkinkan. Untuk diagnosis yang dapat diakses pengguna, lihat[Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Mode `dynblk` ini menggunakan perangkat blok kernel, terpisah dari DynFileFS. Setiap sesi bernomor memiliki `volume000.db` dan semua saudara bernomor lainnya (`volume001.db`, ..., `volume1000.db`, dan seterusnya). Tata letak native adalah `DBSPRS01`, format disk **1**. Tata letak yang tidak didukung akan ditolak, bukan diam-diam dikonversi. Pastikan versi CLI dan modul yang terpasang selalu sesuai.

MiniOS membuat ext4 pada seluruh disk yang dikembalikan oleh `/dev/dynblk-control`, seperti `/dev/dynblk3`; tidak mengasumsikan bahwa `dynblk0` bebas. ext4 yang sudah ada akan diperiksa sebelum digunakan secara writeable. Rekaman boot-state yang dilindungi mencatat perangkat tersebut secara persis sehingga shutdown hanya melepaskannya setelah semua pengguna dan filesystem atasnya ditutup. Beberapa perangkat independen dapat berjalan bersamaan.

Session Manager, installer, dan initramfs melakukan query ke `dynblk limits --format dynblk` untuk mengetahui batas geometri backend yang terpasang. Resource guard saat ini mengizinkan hingga 65536 part: rentang logis standar 1-GiB memungkinkan sampai 64 TiB. Batas part fisik yang lebih kecil akan menurunkan batas virtual. Ini adalah batas geometri, bukan jaminan host dapat membuka file sebanyak itu atau memiliki cukup RAM/storage. Pertumbuhan didukung; pengecilan tidak.

Tabel mapping disimpan di disk. `--map-memory-mb` mengatur cache metadata per perangkat (default 1 MiB, rentang 1..64 MiB), tidak lagi berupa persentase dari RAM atau batas data yang dipetakan. Deskripsi extent, vektor file terbuka, dan direktori kecil bertambah sesuai geometri yang dideklarasikan, bukan berdasarkan isi payload. Attach akan memindai metadata mapping dan sementara membangun ulang status alokasi satu part per waktu; tidak membaca setiap payload. Full `dynblk check` akan membaca payload. `engine_memory_bytes` tidak termasuk cache page filesystem, internal codec, dan alokasi kernel lainnya.

File metadata untuk semua part yang dideklarasikan diinisialisasi saat create/grow; data aktual tetap tipis. Setiap part dibatasi hingga 4000 MiB. Lakukan backup seluruh namespace yang terlepas, tanpa mengasumsikan jumlah tiga digit atau part akhir yang tetap. Volume baru dapat memilih kompresi dengan `perchcomp`; pemuatan berikutnya menggunakan codec yang tersimpan. LUKS2 di atas DynBlk akan memaksa kompresi ke `none`. Penulisan parsial ke data terkompresi saat ini akan mengompresi ulang grain 64-KiB terkait. Kegagalan penulisan masih bisa terjadi jika storage atau resource habis; filesystem atas harus di-unmount sebelum detach.

### Sesi VMDK

Mode sesi `vmdk` menggunakan driver yang sama seperti pada `twoGbMaxExtentSparse`
image asli. Fungsinya utama adalah `volume.vmdk`, dengan `volume-s001.vmdk` dan bagian-bagian berikutnya; setiap bagian mencakup hingga 2 GiB ruang logis. Deskriptor dibatasi
kurang dari 1 MiB, sehingga panjang nama file dan jumlah extent membatasi kapasitas.
Session Manager, Installer, dan initramfs akan melakukan query ke
.`dynblk limits --format vmdk`Mode native tetap menggunakan
; kedua mode tidak menafsirkan ulang file `volume000.db`mode lain. Sesi terkelola tidak mengimpor VMDK yang dipartisi eksternal secara sembarang
sebagai metadata sesi.
Dukungan sesi VMDK diumumkan oleh

 di`vmdk-session-v1` dalam initrd. Runtime saat ini dan setiap
`/etc/minios-initramfs-dynblk`initrd sumber yang disalin oleh Installer harus mendukungnya. VMDK tidak memiliki kompresi native;
akan diabaikan dengan peringatan saat boot dan Session Manager akan menolak
`perchcomp`VMDK codec non-
. LUKS2 tetap menjadi lapisan enkripsi terpisah yang opsional. Kedua mode mempublikasikan`none`mode sesi aktual dan pemilik
dalam boot-state yang terlindungi,`dynblk_device`dan kedua implementasi shutdown akan menutup perangkat tersebut setelah semua pengguna keluar.
Kedua format driver mendukung

, `writeback`, `writethrough`, `none` serta kebijakan attachment `directsync`eksplisit. Mode direct saat ini memerlukan ext2/ext4 di bawahnya. `unsafe` akan melampirkan filesystem yang sudah ada; `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` akan melepas perangkat yang dimiliki helper setelah pengguna terakhir menutupnya. `umount`Manual `dynblk load`memiliki masa aktif eksplisit. Ini tidak membuat filesystem baru atau membuka kunci LUKS.

### Raw

Mode Raw menggunakan satu `changes.img` file yang berisi ext4. Panjang file ditetapkan sesuai kapasitas logis yang diminta saat pembuatan, sehingga berbeda dengan backend dinamis, kapasitasnya tetap hingga ada operasi grow secara eksplisit. Filesystem bawah dapat merepresentasikan extent yang belum ditulis secara sparse, tetapi MiniOS tetap memperlakukan Raw sebagai penyimpanan dengan kapasitas tetap dan memeriksa ruang cadangan yang tersedia sebelum membuat atau memperbesarnya. Karena semuanya berada dalam satu file host, FAT32 dibatasi hingga 4000 MiB.

Citra Raw yang sudah ada akan diperiksa dengan `e2fsck` sebelum melakukan mounting writable. Proses grow akan memperbesar `changes.img` lalu memperluas ext4 dengan `resize2fs`; proses shrink tidak didukung. Jika pemeriksaan atau mounting gagal, citra akan dipertahankan untuk pemulihan dan booting tetap dilanjutkan di RAM. Raw tidak memiliki daemon FUSE atau metadata block-storage khusus, sehingga model pemulihannya sederhana, namun tidak memiliki perilaku thin-capacity seperti DynFileFS dan DynBlk.

### Lapisan enkripsi LUKS

LUKS2 adalah lapisan enkripsi opsional yang dapat dipilih dengan `perchencrypt=luks` saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. Sesi yang sudah ada menggunakan status enkripsi dari metadata sesi; menentukan `perchencrypt` di kemudian hari tidak akan mengubah atau mengonversi sesi plaintext yang sudah ada.

Batas enkripsi tergantung pada backend: Raw menghubungkan `changes.img` melalui perangkat loop dan menempatkan LUKS2 di dalam file tersebut; DynFileFS menghubungkan `virtual.dat` yang diekspos melalui perangkat loop dan mengenkripsi image logis tersebut; DynBlk menggunakan `/dev/dynblkN` block device yang dialokasikan secara langsung; VMDK menggunakan block device yang diekspos oleh driver DynBlk yang sama untuk split sparse image-nya. Pada keempat kasus tersebut, MiniOS membuat ext4 di dalam `/dev/mapper/...`, sehingga isi filesystem dan metadata di dalam mapper akan terenkripsi saat tidak digunakan. Metadata backend di luar batas LUKS, deskriptor VMDK, file boot, metadata sesi, dan file lain di media penyimpanan tetap tidak terenkripsi.

Pengaturan ukuran default, batas pertumbuhan, pembatasan FAT32, dan perilaku alokasi tipis/tetap tetap mengikuti backend yang digunakan. Initrd melakukan autentikasi sebelum memperbesar backend terenkripsi yang sudah ada, menutup mapper sebelum backend diperbesar, lalu membukanya kembali, memeriksa ext4, dan memperluas filesystem sebelum mounting. Untuk DynBlk terenkripsi, kompresi backend dipaksa ke `none`.

Saat pembuatan, passphrase diminta dua kali. Sesi terenkripsi yang sudah ada mengizinkan tiga kali percobaan membuka kunci di konsol boot. Tiga passphrase yang ditolak akan memicu jalur boot fatal: MiniOS tidak akan melanjutkan di RAM, tidak mengubah sesi yang sama menjadi plaintext, tidak memilih backend lain, atau membuat pengganti. Kegagalan lain saat pembuatan, pengecekan, resize, atau mount akan tetap mengikuti mekanisme pemulihan backend-nya masing-masing tanpa fallback ke plaintext. Passphrase tidak disimpan di metadata sesi atau dikirim sebagai argumen perintah. Ekspor logis berisi file sesi yang sudah didekripsi, bukan image backend terenkripsi.

Lihat [Keamanan](/maintenance-and-recovery/Security) untuk penjelasan batas perlindungan dan pertimbangan backup.

### SquashFS

Initrd biasanya mengaktifkan sesi SquashFS yang sudah ada. Pengaturan interaktif membuat metadata generasi nol dengan penyimpanan saat shutdown diaktifkan, tetapi tidak membuat `changes.sb`; lapisan atas yang dapat ditulis hanya ada di RAM sampai sistem berjalan melakukan penyimpanan pertama sesuai permintaan atau saat shutdown. Sesi generasi nol hanya valid jika field artefak snapshot dan `changes.sb` tidak ada. Untuk generasi berikutnya, aktivasi memvalidasi metadata snapshot yang ketat dan bernilai tunggal, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Sistem juga memeriksa tipe file dan ukuran tepatnya, ketersediaan RAM dan swap, digest SHA-256 sebelum dan sesudah ekstraksi, serta kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke dalam image ext4 sementara yang dibatasi di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir`; untuk AUFS, root-nya adalah cabang yang dapat ditulis.
Metadata yang rusak, memori tidak cukup, perubahan digest, error ekstraksi, atau kebijakan tidak valid akan menyebabkan aktivasi gagal dan sistem boot tetap pada lapisan atas RAM seperti biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown yang bersih. SquashFS kemudian akan memberikan peringatan dan mengembalikan `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terputus bukanlah generasi rollback kedua.

Manajer Sesi MiniOS dan backend penyimpanan sistem membuat serta menggantikan snapshot SquashFS secara atomik menggunakan metode penangkapan yang tepat. Aktivasi boot dapat membaca snapshot yang ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena ekstraksi dilakukan di lapisan atas ext4 sementara. Pembuatan dan penyimpanan persis tetap bergantung pada filesystem: penyimpanan sesi harus mendukung pembuatan workspace privat, metadata Linux, dan publikasi yang tahan lama pada filesystem POSIX yang sesuai.

Selama proses penyimpanan, backend terlebih dahulu menangkap pohon file yang stabil di penyimpanan memori privat milik root ketika initrd menyediakan tmpfs tepercaya dengan ruang yang cukup. Jika RAM tidak cukup, pohon ini menggunakan workspace disk sebelumnya. Kompresor menulis langsung ke satu direktori privat mode-0700 di filesystem sesi, bukan ke image RAM tambahan yang kemudian disalin ke disk. MiniOS memverifikasi hasil kompresi dan identitasnya, melakukan sinkronisasi, memindahkannya ke nama kandidat privat, lalu memvalidasi ulang kandidat tersebut sebelum menggantikan `changes.sb` snapshot aktif secara atomik. Salinan atau kompresi yang gagal tidak akan menggantikan snapshot terakhir yang berhasil.

Dengan sesi yang tahan lama dan sehat, `/var/log/minios` dan `/var/log/live` di-bind-mount dari `boot-logs/` di dalam sesi yang diberi nomor. Diagnostik startup ini ditulis secara independen dari lapisan atas RAM dan snapshot shutdown. Boot yang penyimpanan persistensinya tidak diaktifkan secara tahan lama tidak dapat menjamin log tersebut akan bertahan setelah restart. Log dan cache biasa dapat dikonfigurasi secara terpisah; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS tidak memiliki `perchsize`: ukuran yang disimpan mengikuti perubahan yang ditangkap dan dikompresi, sedangkan memori runtime ditentukan oleh lapisan atas yang dapat ditulis setelah diekstrak. Lapisan persistensi LUKS MiniOS tidak membungkus `changes.sb`; jika kerahasiaan snapshot diperlukan, penyimpanan pendukung harus dienkripsi di luar lapisan ini. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Batas aktivasi dan pemulihan union

Untuk AUFS, root perubahan yang diaktifkan menjadi branch nol yang dapat ditulis. Untuk OverlayFS, initrd membangun `upperdir` dan `workdir` di bawah root perubahan yang diaktifkan dan me-mount modul read-only sebagai direktori bawah. Kemudian initrd memverifikasi branch live AUFS atau OverlayFS `upperdir` sebelum menerbitkan persistensi sebagai aktif.

Jika backend persistensi, pembaruan metadata, atau verifikasi ini gagal, mount akan dilepas jika memungkinkan, tidak ada status persistensi yang berhasil yang diterbitkan, dan boot writable tetap berlanjut di RAM. Kegagalan membangun root union akan masuk ke shell fatal initramfs. Keluar dari shell tersebut dapat membuat setup tetap berjalan dengan root yang tidak valid; ini bukan perbaikan atau solusi aman. AUFS tetap menambahkan branch modul secara best-effort, tetapi union yang tidak lengkap melewati batas pemulihan: MiniOS tidak menandai persistensi sebagai aktif.

Kegagalan pemeriksaan container sengaja menghindari mount sesi yang dicurigai sebagai writable.
Jangan mengganti atau membangun ulang file sesi saat boot. Lindungi media penyimpanan yang terdampak terlebih dahulu; lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) dan [Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

## Status aktif, berjalan, dan boot saat ini

Dalam metadata sesi yang tahan lama, `default=` adalah **sesi aktif** yang dipilih untuk resume berikutnya, sedangkan `running=` adalah sesi yang dicatat sebagai penyedia boot saat ini. Proses aktivasi menulis kedua field ini dan menandai sesi tersebut sebagai `dirty`.
Setelah mount persistence hilang saat shutdown bersih, MiniOS menghapus `running=`dan menandai sesi tersebut sebagai `clean`.

Field metadata tersebut bisa saja usang setelah crash, kegagalan penulisan metadata, kegagalan pembuatan union, penyalinan store, atau shutdown yang terputus. Komponen runtime yang mengizinkan penyimpanan tidak hanya mempercayai `running=` saja. Mereka menggunakan status current-boot yang dilindungi oleh initrd, terikat pada boot ID, sesi numerik, mode, identitas store yang sebenarnya, status writable, durabilitas, generasi aktif yang terverifikasi, dan, untuk DynBlk, perangkat `/dev/dynblkN` yang terpasang secara persis. Jika catatan current-boot gagal atau hilang, persistence tidak boleh diperlakukan sebagai target penyimpanan yang disetujui.

Dengan `perchtoram=trim` atau `full`, container sesi yang didukung akan disalin ke tmpfs khusus sebelum aktivasi. Sesi yang disalin bisa writable dan dapat digunakan sebagai upper yang berjalan, namun status current-boot yang dilindungi menandainya sebagai non-durable dan mencatat `ram-origin`identitas untuk store asli. `trim` hanya menyalin sesi yang didukung dan metadata yang sesuai; `full` menyalin semua sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang didukung di dalam store. Sesi direktori native tidak disertakan. Session Manager saat ini menggunakan `ram-origin` untuk menemukan store asli berdasarkan UUID filesystem dan dapat secara eksplisit menyimpan sesi yang berbasis RAM kembali atau sebagai sesi baru dengan nomor berbeda. Perubahan RAM yang belum disimpan tetap akan hilang jika tidak ada proses penulisan ulang yang berhasil.

Untuk panduan operasional terkait, lihat [Mode boot](/using-minios/Boot-Modes), [Parameter boot](/reference/Boot-Parameters), [Sesi dan persistence](/using-minios/Sessions-and-Persistence), [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Keamanan](/maintenance-and-recovery/Security), dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## Reklamasi ruang berbasis sesi

`minios-session reclaim ID` mendukung DynFileFS, DynBlk, dan sesi VMDK. Untuk sesi plaintext, FITRIM dijalankan pada filesystem ext4 internal, bukan pada root gabungan AUFS/OverlayFS, lalu operasi reclaim backend storage pemilik dipanggil. Reklamasi DynFileFS memerlukan DynFileFS versi 4.6.0 atau lebih baru.

Untuk sesi DynFileFS yang sedang berjalan, Session Manager masuk ke namespace mount privat yang berumur pendek agar dapat mengakses `virtual.dat` di bawah overmount ext4 aktif tanpa mengganggu daemon sistem, perangkat loop, atau union mount yang sedang berjalan. Perangkat DynBlk/VMDK yang berjalan divalidasi terhadap status boot saat ini yang terlindungi. Sesi tidak aktif akan dilampirkan dan di-mount sementara; sesi yang sudah di-mount oleh Session Manager akan menggunakan lampiran yang sudah ada. Unmount yang sedang sibuk akan menghentikan proses teardown, bukan memutus storage di bawah filesystem yang sedang aktif.

Baik saat boot maupun shutdown tidak menjalankan kompaksi secara otomatis.`--compact` adalah pilihan eksplisit pengguna di CLI atau opsi dialog Session Manager yang tidak dicentang dan dapat memindahkan data aktif, sehingga meningkatkan jumlah penulisan ke flash. Tanpa opsi ini, backend hanya mereklamasi ruang yang dapat dikembalikan tanpa memindahkan data aktif, seperti rentang yang bisa di-hole-punch atau ekor file yang benar-benar kosong; pada filesystem seperti exFAT, rentang bagian dalam yang telah dibebaskan tetap dapat digunakan ulang di dalam container meskipun tidak dapat dikembalikan ke host filesystem. Sesi terenkripsi hanya mereklamasi ruang yang sudah diketahui oleh backend dan tidak secara diam-diam mengaktifkan discard melalui dm-crypt.
