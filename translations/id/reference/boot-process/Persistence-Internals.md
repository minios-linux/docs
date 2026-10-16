---
updated: 2026-10-15
---

# Internal persistensi

Halaman ini menjelaskan `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, dan `perchtoram` parameter boot. Parameter ini mengatur lokasi penyimpanan perubahan dari sesi live, cara membuat sesi baru, dan apakah penyimpanan sesi yang didukung disalin ke RAM. Untuk penggunaan biasa, pilih entri persisten di menu boot atau gunakan Manajer Sesi MiniOS alih-alih mengeditnya secara manual.

MiniOS membangun root live dari modul hanya-baca dan satu lapisan atas yang dapat ditulis.
initrd menentukan apakah lapisan atas tersebut berupa sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan saat boot dan jalur aktivasinya. Untuk kontrol yang ditampilkan kepada pengguna, lihat [Mode boot](/using-minios/Boot-Modes) dan [Parameter boot](/reference/Boot-Parameters).

## Dalam bahasa sederhana

Tanpa parameter persistensi, MiniOS menyimpan perubahan di RAM dan membuangnya saat dimatikan. Parameter persistensi meminta MiniOS mencari penyimpanan yang dapat ditulis, memilih atau membuat sesi bernomor, memeriksa kompatibilitas, lalu menggunakan sesi tersebut sebagai lapisan yang dapat ditulis.

Meminta persistensi tidak menjamin bahwa fitur ini akan aktif. Jika target hanya dapat dibaca, penuh, rusak, atau tidak kompatibel, MiniOS dapat melanjutkan dengan lapisan RAM sementara. Baca peringatan saat startup sebelum mengandalkan perubahan yang disimpan.

## Penjelasan parameter

| Parameter | Keterangan MiniOS | Pilihan umum |
|---|---|---|
| `perchdir=resume` | Buka sesi kompatibel default dan, jika kondisi yang didukung terpenuhi, buat sesi pengganti jika sesi tersebut tidak dapat digunakan. | Pekerjaan sehari-hari. |
| `perchdir=setup` | Pilih backend persistensi dan opsi enkripsi/kompresi yang didukung secara interaktif, lalu buat sesi bernomor baru. | Entri menu boot **Mulai sesi baru** saat ini. |
| `perchdir=new` | Buat sesi bernomor baru secara langsung dengan `perchmode` yang diminta/default, enkripsi, kompresi, dan ukuran, tanpa menampilkan pemilih backend. | Entri boot skrip atau ahli dengan opsi penyimpanan yang telah ditentukan. |
| `perchdir=ask` | Tampilkan sesi tersimpan dan biarkan Anda memilih salah satunya. Jika penyimpanan tidak memiliki sesi tersimpan, pemilih akan menjalankan alur penyiapan yang sama dengan `perchdir=setup`. | Beberapa ruang kerja di satu perangkat, termasuk penyiapan interaktif pertama pada penyimpanan kosong. |
| `perchdir=NUMBER` | Minta sesi bernomor tertentu. | Entri boot kustom yang stabil setelah memeriksa ID sesi. |
| `perchmode=MODE` | Pilih `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. | Sesuaikan dengan filesystem penyimpanan dan model persistensi yang diinginkan. |
| `perchencrypt=luks` | Tambahkan lapisan LUKS2 saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. | Enkripsi backend kontainer yang didukung. |
| `perchsize=SIZE` | Tentukan ukuran sesi kontainer baru atau yang sedang diperbesar. | DynFileFS, DynBlk, VMDK, atau raw; enkripsi tidak mengubah semantik ukuran backend. |
| `perchcomp=CODEC` | Pilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`; ketersediaannya tetap bergantung pada kernel yang berjalan. Kompresi dinonaktifkan jika LUKS membungkus DynBlk. |
| `perchreserve=MB` | Kurangi margin saat menentukan ukuran kontainer baru atau yang sedang diperbesar, dan tetapkan ambang peringatan ruang rendah. | Sisakan ruang kerja saat mengalokasikan kontainer; ini bukan kuota saat runtime. |
| `perch` | Gunakan perilaku resume lama tanpa pembuatan sesi pengganti otomatis. | Kompatibilitas dengan entri kustom yang sudah ada; untuk menu saat ini, gunakan `perchdir=resume`. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Kontrol penyalinan persistensi secara terpisah dari `toram` sistem. | `off` mempertahankan penyimpanan asli tetap aktif; `trim` hanya menyalin sesi terpilih yang didukung; `full` menyalin semua sesi kontainer/SquashFS yang didukung. |

Jika persistensi diminta, `toram` menjadikan `perchtoram=trim` sebagai default, kecuali mode persistence-RAM ditentukan secara eksplisit. Tanpa `toram` sistem, persistensi secara default tetap menggunakan penyimpanan. Sesi yang disalin tidak persisten saat berjalan, tetapi Session Manager saat ini dapat secara eksplisit menyimpan status berbasis RAM yang didukung ke penyimpanan asli atau menerbitkannya sebagai sesi baru jika penyimpanan asli tersedia dan identitasnya cocok dengan identitas saat boot.

## Persistensi harus diaktifkan secara eksplisit

initrd hanya mengaktifkan penanganan persistensi jika baris perintah kernel memuat salah satu token yang dikenali berikut:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Jika tidak ada token tersebut, termasuk jika hanya ada `perch...` yang tidak dikenali, MiniOS membuat upper baru yang dapat ditulisi di RAM. Perubahan yang dibuat selama boot tersebut akan dibuang saat sistem dimatikan.

Selector tidak semuanya memiliki perilaku yang sama:

| Selector | Perilaku initrd |
|---|---|
| `perch` | Mencoba melanjutkan sesi default dari metadata. Tidak otomatis membuat sesi jika tidak ada sesi yang dapat digunakan atau pemeriksaan kompatibilitas gagal. |
| `perchdir=resume` | Mencoba menggunakan sesi default dari metadata dan dapat otomatis membuat pengganti baru yang kompatibel. Ini adalah perilaku melanjutkan sesi pada menu boot saat ini. |
| `perchdir=setup` | Membuka pemilih backend terlebih dahulu, mencatat permintaan backend/enkripsi/kompresi yang dipilih, lalu melanjutkan ke proses alokasi sesi baru. |
| `perchdir=new` | Mengalokasikan direktori dengan ID numerik satu angka lebih besar daripada ID numerik tertinggi yang ada. Tidak pernah menggunakan kembali direktori yang ada dan tidak membuka pemilih backend. |
| `perchdir=ask` | Menampilkan sesi yang ada jika tersedia; sesi yang tidak kompatibel memerlukan konfirmasi. Jika penyimpanan tidak memiliki sesi/default, beralih ke `setup` agar sesi pertama dapat dibuat secara interaktif. |
| `perchdir=NUMBER` | Menggunakan direktori tersebut jika tersedia. Jika tidak, pemilihan dapat beralih ke default yang tercatat dalam metadata; nomor yang diminta tidak dicadangkan. |

Parameter persistensi lain yang dikenali tanpa selector mengikuti jalur lama untuk melanjutkan sesi yang sama seperti `perch`: parameter ini meminta persistensi, tetapi tidak mengaktifkan pembuatan otomatis. `perchtoram` saja bukan permintaan persistensi. Jika pemilihan atau aktivasi tidak menghasilkan upper yang dapat digunakan, boot biasanya tetap berlanjut dengan upper RAM dan menampilkan peringatan kegagalan.

## Lokasi penyimpanan sesi

Lokasi penyimpanan default adalah `changes` direktori di sebelah data MiniOS, yang berisi direktori sesi bernomor dan metadata `session.conf` atau `session.json` metadata:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Lokasi penyimpanan juga dapat ditentukan sebagai perangkat dengan jalur opsional. Format yang didukung mencakup jalur `/dev/...` langsung, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, dan `askdisk:custom:path`. Sufiks yang dipisahkan dengan titik dua menjadi jalur di bawah perangkat yang dipilih; sintaks garis miring setelah `askdisk` akan mengabaikan jalur khusus tersebut. Subdirektori yang dipilih akan di-bind mount sebagai lokasi penyimpanan sesi. MiniOS juga dapat menemukan partisi persistensi di drive yang sama serta penyimpanan persistensi Ventoy yang didukung.

Sebelum memilih sesi, initrd harus memasang lokasi tersebut dengan akses tulis dan memastikan bahwa penanda dapat dibuat dan dihapus di lokasi penyimpanan. Jika perangkat blok tidak dapat dibuka untuk ditulis, lokasi dipasang hanya-baca, jalur tidak tersedia, atau pengujian tulis gagal, persistensi akan ditolak untuk boot tersebut. Sesi yang sudah ada tidak otomatis dianggap tepercaya hanya karena berkasnya dapat dibaca.

## Pemilihan dan kompatibilitas

Metadata sesi mencatat mode penyimpanan dan dapat mencatat versi MiniOS, edisi, union filesystem, serta ukuran container. Saat sesi dilanjutkan, mode, versi, edisi, dan union yang tercatat dibandingkan dengan mode yang diminta dan sistem saat ini.
Kolom kompatibilitas lama yang tidak ada tidak dianggap sebagai ketidakcocokan.

Literal `perchdir=resume` membuat sesi bernomor baru jika nilai default-nya tidak tersedia atau jika ketidakcocokan mode, versi, edisi, atau union yang tercatat membuat nilai default tersebut tidak sesuai. Bare `perch`, pemilihan numerik langsung, dan permintaan resume lama lainnya menolak penggantian otomatis dan melanjutkan di RAM setelah pemilihan gagal. `perchdir=ask` menampilkan informasi kompatibilitas dan mengizinkan penggantian secara eksplisit. Sesi baru menggunakan `native` sebagai default, kecuali mode lain diminta.

Mode penyimpanan merupakan bagian dari kompatibilitas. Jika pemilihan mencapai tahap pengiriman ke backend, mode yang diminta tetapi tidak dikenal akan beralih ke `native`, yang pemeriksaannya dapat memilih DynBlk atau DynFileFS jika penyimpanan tidak sesuai. Sesi yang sudah ada dengan mode tercatat yang berbeda mungkin gagal dalam pemeriksaan kompatibilitas sebelumnya; permintaan resume lama kemudian melanjutkan di RAM alih-alih mencapai mekanisme fallback tersebut.

### Mereset sesi yang tidak kompatibel

Pilihan interaktif menyediakan **Reset, pertahankan pengaturan** dan **Reset, pertahankan data** selain opsi untuk kembali ke daftar atau melanjutkan secara eksplisit tanpa reset. Reset dijalankan sebelum aktivasi union. Reset menghapus pohon program/pustaka sistem, status pengelola paket sistem, software Flatpak/Snap seluruh sistem, dan cache. Daftar file paket membantu mengidentifikasi software yang terpasang di lokasi lain; file yang tidak tercantum akan dipertahankan secara konservatif.

Kedua mode mempertahankan `/home` dan `/root`, termasuk konfigurasi tersembunyi, cache, profil browser, dan program yang dipasang di direktori home. Keduanya juga mempertahankan akun, pemetaan UID/GID, kata sandi, kunci host SSH, kunci TLS privat, dan data yang dipertahankan di luar pohon direktori home. Mode yang mempertahankan pengaturan juga mempertahankan `/etc` biasa dan konfigurasi paket; mode khusus data mereset pengaturan sistem tersebut sambil mempertahankan konfigurasi pribadi di pohon direktori home. Proses ini tidak mengidentifikasi setiap program yang dipasang secara manual di lokasi sembarang.

Upper pengganti disiapkan di samping upper asli, sehingga diperlukan ruang kosong untuk salinan kedua data yang dipertahankan. Jika penyalinan atau penggantian gagal, perubahan akan dibatalkan; transaksi yang terhenti akan dipulihkan saat mount berikutnya. Reset SquashFS hanya mengubah upper RAM hasil rekonstruksinya: snapshot lama dan metadata kompatibilitas tetap menjadi acuan hingga upper yang di-reset berhasil disimpan. Reset sesi native menonaktifkan `perchtoram` untuk boot tersebut agar data yang dipertahankan tidak tergantikan oleh kontainer RAM yang kosong. Resume otomatis tidak pernah mereset sesi secara diam-diam.

## Cadangan ruang dan ukuran

MiniOS menggunakan 256 MiB sebagai margin alokasi default dan ambang peringatan ruang rendah. Perhitungan menggunakan blok sistem file berukuran 1024 byte. `perchreserve` menerima bilangan bulat tanpa tanda dan tanpa satuan, dengan batas maksimum 4096. Jika tidak diisi atau nilainya tidak valid, nilai defaultnya adalah 256. Margin ini mengurangi ruang yang ditawarkan kepada container baru atau yang sedang diperbesar. Margin ini bukan kuota: sesi native atau penulisan berikutnya tetap dapat menggunakan sisa ruang sistem file. Saat boot, peringatan ditampilkan jika ruang kosong saat ini sama dengan atau kurang dari ambang batas.

Ukuran container menggunakan bilangan bulat yang dialokasikan dalam MiB:

- Angka tanpa satuan, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Container Raw dibatasi hingga 1.000.000 MiB dan ruang yang tersedia setelah cadangan dikurangi. DynFileFS memiliki batas tersendiri yang memperhitungkan RAM serta batas maksimum 2.000.000 MiB. DynBlk mendapatkan batas geometri format native-nya dari `dynblk limits --format dynblk`; MiniOS tidak menetapkan batas maksimum terpisah sebesar 512 GiB.
- Raw adalah satu file penyimpanan, sehingga FAT32 membatasinya hingga 4000 MiB di MiniOS. Batas yang sama berlaku jika Raw dibungkus dengan LUKS2.
- Ukuran default sesi Raw baru adalah 4000 MiB. Enkripsi tidak menerapkan kebijakan ukuran LUKS tersendiri: sesi Raw terenkripsi, DynFileFS, DynBlk, atau VMDK tetap mengikuti aturan ukuran backend yang mendasarinya.
- Sesi DynFileFS baru yang dibuat oleh initrd tanpa `perchsize` menggunakan kapasitas logis hingga 16 GiB. Jika penyimpanan pendukung pada akhirnya tidak dapat menampung kapasitas sebesar itu setelah `perchreserve` dan overhead indeks DynFileFS diperhitungkan, ukuran default akan dikurangi agar sesuai dengan kapasitas yang tersedia. Indeks format 400 membutuhkan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan pendukung per GiB kapasitas logis yang dideklarasikan, meskipun payload masih kosong. Karena itu, MiniOS juga membatasi kapasitas DynFileFS berdasarkan RAM fisik dan batas maksimum teruji sebesar 2.000.000 MiB.
- Sesi DynBlk baru tanpa `perchsize` mengikuti batas maksimum otomatis 16 GiB yang sama dan ukurannya dikurangi jika ruang penyimpanan pendukung yang tersisa setelah `perchreserve`. Ukuran DynBlk yang ditentukan secara eksplisit merupakan permintaan kapasitas thin yang diperiksa terhadap batas backend terpasang. Metadata untuk bagian yang dideklarasikan dibuat sejak awal, tetapi ruang payload bertambah sesuai kebutuhan. DynBlk memiliki cache metadata terbatas yang terpisah dari penggunaan kapasitas payload.

Penambahan ukuran container dilakukan sebaik mungkin, sedangkan pengurangan ukuran tidak didukung. `perchsize` tidak mengatur ukuran sesi native atau SquashFS. Manajer Sesi MiniOS menetapkan ukuran default 4000 MiB untuk container Raw dan DynFileFS yang dibuat secara manual, serta 16 GiB untuk container DynBlk/VMDK; varian terenkripsi menggunakan ukuran default backend yang sama. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi penyimpanan

Semua backend yang berhasil harus menyediakan upper yang dapat ditulis sesuai kebutuhan union filesystem yang dipilih. Memasang backend saja tidak membuktikan bahwa persistensi aktif. Native, DynFileFS, DynBlk, VMDK, dan raw dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda commit metadata tersebut. Raw, DynFileFS, DynBlk, dan VMDK juga dapat menggunakan enkripsi LUKS2. Status boot saat ini yang dilindungi hanya dipublikasikan setelah dipastikan bahwa root union akhir menggunakan upper yang diharapkan.

| Backend | Representasi persisten | Model kapasitas | Persyaratan media penyimpanan | Lapisan LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | File dan direktori langsung di direktori sesi bernomor | Menggunakan ruang sistem file penyimpanan secara langsung; `perchsize` tidak berlaku | Sistem file yang dapat ditulis dan lolos uji perilaku POSIX | Tidak |
| `dynfilefs` | Format-400 `changes.dat` ditambah file segmen yang mengekspos ext4 `virtual.dat` | Payload tipis dengan indeks padat berukuran sesuai kapasitas | Penyimpanan POSIX, FAT32, NTFS, atau exFAT yang dapat ditulis | Ya |
| `dynblk` | File Format-1 `volumeNNN.db` yang mengekspos `/dev/dynblkN`, dengan ext4 di atasnya | Perangkat blok virtual tipis dengan pemetaan yang tersimpan di disk dan cache terbatas | Sistem file yang diterima backend kernel DynBlk dan sumber daya backend yang memadai | Ya |
| `vmdk` | `volume.vmdk` ditambah extent sparse terpisah `volume-sNNN.vmdk` yang diekspos driver DynBlk, dengan ext4 di atasnya | Perangkat blok virtual tipis dengan sparse terpisah | Sistem file yang diterima backend VMDK DynBlk dan kemampuan `vmdk-session-v1` | Ya |
| `raw` | Satu file `changes.img` berukuran tetap yang berisi ext4 | File dibuat dengan ukuran logis yang diminta; hanya dapat diperbesar | Sistem file yang dapat ditulis dan mampu menampung image; FAT32 dibatasi hingga 4000 MiB | Ya |
| `squashfs` | Snapshot `changes.sb`terkompresi; upper runtime yang dapat ditulis dibangun kembali di RAM | Ukuran snapshot mengikuti perubahan yang direkam; `perchsize` tidak berlaku | Snapshot yang ada dapat dibaca dari media tulis yang didukung; penyimpanan persis memerlukan penyimpanan persistensi yang sesuai dan mendukung POSIX | Tidak |

### Native

Mode Native menyimpan konten union yang dapat ditulis langsung di direktori sesi bernomor. Tidak ada image internal, loop device, kontainer FUSE, atau sistem file blok terpisah, sehingga kapasitas hanya bergantung pada ruang kosong di sistem file yang mendasarinya dan `perchsize` tidak berlaku. Mode ini memiliki overhead kontainer paling rendah dan mempertahankan visibilitas file biasa untuk pemulihan dan pencadangan.

MiniOS terlebih dahulu mengecualikan sistem file non-POSIX yang dikenal, seperti FAT, exFAT, dan NTFS. Selanjutnya, mode ini menguji perilaku sistem file yang sebenarnya dengan membuat file dan symlink, lalu memeriksa perubahan mode eksekusi. Jika pengujian berhasil, direktori sesi bernomor akan di-mount langsung sebagai area yang dapat ditulis. Jika penyimpanan tidak sesuai atau pengujian gagal, pembuatan Native akan memilih DynBlk jika CLI-nya tersedia dan Secure Boot mengizinkannya; jika tidak, DynFileFS. Fallback awal ini tidak menjamin bahwa driver yang dipilih dapat melakukan attach atau bahwa setiap sistem file yang mendasarinya didukung. Kegagalan setelah aktivasi Native akan dibatalkan; kandidat baru yang kosong akan dihapus jika aman untuk dilakukan.

Lapisan persistensi LUKS2 MiniOS tidak membungkus mode Native karena Native tidak memiliki batas kontainer atau perangkat blok yang dapat dienkripsi. Persistensi Native tetap dapat disimpan di media penyimpanan yang dienkripsi di luar lapisan persistensi ini.

### DynFileFS

DynFileFS adalah backend container format-400 berbasis FUSE. Backend ini menyediakan satu`virtual.dat` image logis sekaligus menyimpan data di`changes.dat` serta file segmen bernomor. Helper harus berhasil melakukan mount dan mengekspos `virtual.dat`; jika tidak, aktivasi akan gagal, bukan malah membuat file khusus RAM dengan nama yang tampak persisten.

Indeks pemetaannya padat terhadap kapasitas logis yang dideklarasikan: setiap blok logis 4 KiB memiliki satu offset 8 byte. Ini setara dengan sekitar 2 MiB RAM indeks per GiB kapasitas virtual. Jumlah yang kurang lebih sama juga disimpan dalam indeks segmen penyimpanan, bahkan sebelum data payload ditulis. Alokasi payload itu sendiri tetap dinamis. Karena binary initrd statis berarsitektur i686, MiniOS juga menerapkan batas ukuran logis yang memperhitungkan RAM dan batas maksimum keras 2,000,000 MiB, di bawah titik kegagalan ruang alamat yang telah diuji.

Image logis berisi ext4. Image yang sudah ada diperiksa sebelum di-mount dengan akses tulis; hasil pemeriksaan sistem file yang lebih tinggi daripada status kesalahan yang telah diperbaiki akan membuat sesi ditolak, bukan di-mount dengan akses tulis. Perubahan ukuran hanya dapat memperbesar, dan sistem file ext4 di dalamnya akan diperluas jika memungkinkan. Untuk diagnosis yang ditujukan bagi pengguna, lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

### DynBlk

Mode `dynblk` menggunakan perangkat blok kernel yang terpisah dari DynFileFS. Setiap sesi bernomor memiliki `volume000.db` serta semua perangkat bernomor lainnya (`volume001.db`, ..., `volume1000.db`, dan seterusnya). Tata letak native menggunakan `DBSPRS01`, format disk **1**. Tata letak yang tidak didukung akan ditolak, bukan dikonversi secara diam-diam. Pastikan versi CLI dan modul yang terpasang tetap sama.

MiniOS membuat ext4 pada seluruh disk yang dikembalikan oleh `/dev/dynblk-control`, seperti `/dev/dynblk3`; proses ini tidak menganggap bahwa `dynblk0` kosong. ext4 yang sudah ada akan diperiksa sebelum digunakan untuk penulisan. Catatan status boot yang dilindungi menyimpan perangkat tersebut secara persis agar saat shutdown perangkat dilepas hanya setelah semua penggunanya dan sistem file tingkat atas ditutup. Beberapa perangkat independen dapat digunakan bersamaan.

Session Manager, installer, dan initramfs mengkueri `dynblk limits --format dynblk` untuk mengetahui batas geometri backend yang terpasang. Guard resource saat ini mengizinkan 65536 part: rentang logis standar 1-GiB mendukung hingga 64 TiB. Batas jumlah part fisik yang lebih kecil mengurangi batas virtual. Ini adalah batas geometri, bukan jaminan bahwa host dapat membuka file sebanyak itu atau memiliki RAM/penyimpanan yang cukup. Kapasitas dapat ditambah, tetapi tidak dapat dikurangi.

Tabel pemetaan disimpan di disk. `--map-memory-mb` mengontrol cache metadata per perangkat (default 1 MiB, rentang 1..64 MiB), bukan lagi persentase RAM atau batas jumlah data yang dipetakan. Deskripsi extent, vektor file terbuka, dan direktori kecil bertambah sesuai geometri yang dideklarasikan, bukan jumlah payload yang terisi. Saat attach, metadata pemetaan dipindai dan status alokasi dibangun ulang sementara, satu part setiap kali; payload tidak dibaca seluruhnya. `dynblk check` membaca payload. `engine_memory_bytes` tidak mencakup cache halaman sistem file, internal codec, dan alokasi kernel lainnya.

File metadata untuk semua part yang dideklarasikan diinisialisasi saat dibuat atau diperbesar; data sebenarnya tetap thin. Ukuran part dibatasi hingga 4000 MiB. Cadangkan seluruh namespace yang sudah dilepas, tanpa mengasumsikan nomor tiga digit atau part terakhir yang tetap. Volume baru dapat memilih kompresi dengan `perchcomp`; pemuatan berikutnya menggunakan codec yang tersimpan. LUKS2 di atas DynBlk memaksa kompresi menjadi `none`. Penulisan parsial ke data terkompresi saat ini akan mengompresi ulang blok 64-KiB terkait. Kehabisan penyimpanan atau resource tetap dapat menyebabkan penulisan gagal; sistem file tingkat atas harus di-unmount sebelum detach.

### Sesi VMDK

Mode sesi `vmdk` menggunakan driver yang sama dengan `twoGbMaxExtentSparse`
image asli. File utamanya adalah `volume.vmdk`, dengan `volume-s001.vmdk` dan bagian-bagian berikutnya
; setiap bagian mencakup ruang logis hingga 2 GiB. Ukuran descriptor dibatasi
kurang dari 1 MiB, sehingga panjang nama file dan jumlah extent membatasi kapasitas.
Session Manager, Installer, dan initramfs memeriksa `dynblk limits --format vmdk`.
Format DynBlk native tetap menggunakan `volume000.db`; kedua format tidak menafsirkan ulang
file milik format lainnya. Sesi terkelola tidak mengimpor VMDK yang partisinya ditentukan secara eksternal dan sembarang
sebagai metadata sesi.

Dukungan sesi VMDK diiklankan oleh `vmdk-session-v1` di
`/etc/minios-initramfs-dynblk` dalam initrd. Runtime saat ini dan setiap initrd sumber
yang disalin oleh Installer harus mendukungnya. VMDK tidak memiliki kompresi native;
`perchcomp` akan diabaikan saat boot dengan peringatan, dan Session Manager menolak codec VMDK
non-`none`. LUKS2 tetap menjadi lapisan enkripsi terpisah yang opsional. Kedua mode mencatat mode sesi aktual dan
 pemiliknya`dynblk_device` dalam status boot yang terlindungi,
dan kedua implementasi shutdown menutup perangkat tersebut setelah semua penggunanya keluar.

Kedua format driver mendukung `writeback`, `writethrough`, `none`, `directsync` dan kebijakan pemasangan `unsafe`eksplisit. Mode langsung saat ini memerlukan ext2/ext4 di bawahnya. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` memasang sistem file yang sudah ada; `umount` melepaskan perangkat yang dikelola helper setelah pengguna terakhir menutupnya. `dynblk load`Manual memiliki masa pakai eksplisit. Ini tidak membuat sistem file atau membuka kunci LUKS.

Backing tmpfs didukung untuk kedua format dengan `writeback`, `writethrough` dan `unsafe`; mode direct-I/O ditolak, bukan diam-diam diubah. Urutan flush tidak membuat sesi yang menggunakan tmpfs sebagai backing tetap tersimpan setelah shutdown. Dukungan ini menjadi dasar sesi DynBlk/VMDK RAM, yang perubahannya harus disimpan secara eksplisit ke penyimpanan asal.

### Raw

Mode Raw menggunakan satu `changes.img` berkas yang berisi ext4. Panjang berkas ditetapkan sesuai kapasitas logis yang diminta saat dibuat. Jadi, tidak seperti backend dinamis, kapasitasnya tetap hingga dilakukan operasi perluasan secara eksplisit. Sistem file di bawahnya dapat merepresentasikan extent yang belum ditulis secara sparse, tetapi MiniOS tetap memperlakukan Raw sebagai penyimpanan berkapasitas tetap dan memeriksa ruang penyimpanan yang tersedia sebelum membuat atau memperluasnya. Karena semuanya berada dalam satu file di host, FAT32 dibatasi hingga 4000 MiB.

Image Raw yang sudah ada diperiksa menggunakan `e2fsck` sebelum dipasang dengan akses tulis. Penambahan kapasitas memperbesar `changes.img` lalu memperluas ext4 menggunakan `resize2fs`; penyusutan tidak didukung. Jika pemeriksaan atau pemasangan gagal, image tetap dipertahankan untuk pemulihan dan proses boot dilanjutkan di RAM. Raw tidak menggunakan daemon FUSE atau metadata penyimpanan blok khusus, sehingga model pemulihannya sederhana. Namun, Raw tidak memiliki perilaku kapasitas tipis seperti DynFileFS dan DynBlk.

### Lapisan enkripsi LUKS

LUKS2 adalah lapisan enkripsi opsional yang dipilih dengan `perchencrypt=luks` saat membuat sesi Raw, DynFileFS, DynBlk, atau VMDK. Status enkripsi sesi yang sudah ada ditentukan oleh metadata sesi; menentukan `perchencrypt` di kemudian hari tidak akan menafsirkan ulang atau mengonversi sesi yang sudah ada dan belum dienkripsi.

Batas enkripsi bergantung pada backend: Raw memasang `changes.img` melalui perangkat loop dan menempatkan LUKS2 di dalam file tersebut; DynFileFS memasang `virtual.dat` yang diekspos melalui perangkat loop dan mengenkripsi image logis tersebut; DynBlk menggunakan perangkat blok `/dev/dynblkN` yang dialokasikan secara langsung; VMDK menggunakan perangkat blok yang diekspos oleh driver DynBlk yang sama untuk image sparse terpisahnya. Dalam keempat kasus, MiniOS membuat ext4 di dalam `/dev/mapper/...`, sehingga konten dan metadata sistem file di dalam mapper terenkripsi saat tidak digunakan. Metadata backend di luar batas LUKS, deskriptor VMDK, file boot, metadata sesi, dan file lain pada media persistensi tetap tidak terenkripsi.

Ukuran default, batas pertumbuhan, batasan FAT32, serta perilaku alokasi thin/fixed tetap ditentukan oleh backend yang mendasarinya. Initrd melakukan autentikasi sebelum memperbesar backend terenkripsi yang sudah ada, menutup mapper sebelum memperbesar backend, lalu membukanya kembali, memeriksa ext4, dan memperluas sistem file sebelum memasangnya. Untuk DynBlk terenkripsi, kompresi backend ditetapkan ke `none`.

Saat pembuatan, frasa sandi diminta dua kali. Sesi terenkripsi yang sudah ada menyediakan tiga kali percobaan untuk membuka kunci melalui konsol boot. Tiga kali penolakan frasa sandi akan memicu proses boot fatal: MiniOS tidak melanjutkan boot ke RAM, menafsirkan sesi yang sama sebagai teks biasa, memilih backend lain, atau membuat pengganti. Kegagalan lain saat pembuatan, pemeriksaan, pengubahan ukuran, atau pemasangan tetap ditangani sesuai mekanisme pemulihan khusus backend, tanpa beralih ke teks biasa. Frasa sandi tidak disimpan dalam metadata sesi atau diteruskan sebagai argumen perintah. Ekspor logis berisi file sesi yang telah didekripsi, bukan image backend terenkripsi.

Lihat [Keamanan](/maintenance-and-recovery/Security) untuk mengetahui batas perlindungan dan hal-hal yang perlu diperhatikan terkait pencadangan.

### SquashFS

initrd biasanya mengaktifkan sesi SquashFS yang sudah ada. Penyiapan interaktif membuat metadata generasi nol dengan penyimpanan saat shutdown diaktifkan, tetapi tidak membuat `changes.sb`; lapisan atas yang dapat ditulis hanya tersedia di RAM sampai sistem yang berjalan melakukan penyimpanan pertama sesuai permintaan atau saat shutdown. Sesi generasi nol hanya valid jika kolom artefak snapshot dan `changes.sb` tidak ada. Untuk generasi berikutnya, aktivasi memvalidasi metadata snapshot yang ketat dan hanya memiliki satu nilai, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Aktivasi juga memeriksa tipe file dan ukuran persisnya, RAM serta swap yang tersedia, digest SHA-256 sebelum dan sesudah ekstraksi, dan kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke dalam image ext4 sementara dengan batas ukuran di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir`; untuk AUFS, root-nya adalah cabang yang dapat ditulis.
Metadata yang cacat, memori yang tidak mencukupi, perubahan digest, error ekstraksi, atau kebijakan yang tidak valid akan menggagalkan aktivasi dan membuat boot tetap menggunakan lapisan atas RAM biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown dengan bersih. SquashFS kemudian memberikan peringatan dan memulihkan `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terhenti bukanlah generasi rollback kedua.

Manajer Sesi MiniOS dan backend penyimpanan sistem membuat serta mengganti snapshot SquashFS secara atomik menggunakan pengambilan persis. Aktivasi boot dapat membaca snapshot yang sudah ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena ekstraksi berlangsung di lapisan atas ext4 sementara. Pembuatan dan penyimpanan persis tetap bergantung pada sistem file: penyimpanan sesi harus mendukung pembuatan ruang kerja privat, metadata Linux, dan publikasi yang persisten pada sistem file POSIX yang sesuai.

Saat menyimpan, backend terlebih dahulu mengambil pohon file yang stabil ke penyimpanan memori privat milik root jika initrd menyediakan tmpfs tepercaya dengan ruang yang cukup. Jika RAM tidak mencukupi, pohon ini menggunakan ruang kerja disk sebelumnya. Kompresor menulis langsung ke satu direktori privat bermode 0700 pada sistem file sesi, bukan ke image RAM tambahan yang kemudian disalin lagi ke disk. MiniOS memverifikasi hasil kompresi dan identitasnya, menyinkronkannya, memindahkannya ke nama kandidat privat, lalu memvalidasi ulang kandidat sebelum mengganti `changes.sb` secara atomik. Kegagalan penyalinan atau kompresi tidak akan mengganti snapshot terakhir yang berhasil disimpan.

Jika sesi persisten berfungsi dengan baik, `/var/log/minios` dan `/var/log/live` dipasang dengan bind mount dari `boot-logs/` di dalam sesi bernomor. Karena itu, diagnostik startup ini ditulis secara terpisah dari lapisan atas RAM dan snapshot saat shutdown. Boot yang penyimpanan persistensinya tidak diaktifkan secara persisten tidak dapat menjamin bahwa log tersebut akan tetap ada setelah restart. Log dan cache biasa dapat dikonfigurasi secara terpisah; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS tidak memiliki `perchsize`: ukuran yang tersimpan mengikuti perubahan yang diambil dan dikompresi, sedangkan memori saat runtime ditentukan oleh lapisan atas yang dapat ditulis setelah diekstrak. Lapisan persistensi LUKS MiniOS tidak membungkus `changes.sb`; jika kerahasiaan snapshot diperlukan, penyimpanan pendukung harus dienkripsi di luar lapisan ini. Lihat [Pengelolaan sesi](/using-minios/Sessions-and-Persistence).

## Aktivasi union dan batas pemulihan

Untuk AUFS, perubahan yang diaktifkan menjadi branch nol yang dapat ditulis. Untuk OverlayFS, initrd membuat `upperdir` dan `workdir` di bawah root changes yang diaktifkan, lalu memasang modul hanya-baca sebagai direktori lower. Selanjutnya, initrd memverifikasi branch AUFS atau OverlayFS yang aktif `upperdir` sebelum mengumumkan bahwa persistence aktif.

Jika backend persistence, pembaruan metadata, atau verifikasi ini gagal, mount terkait dilepas jika memungkinkan, status persistence yang berhasil tidak diumumkan, dan proses boot berlanjut dengan akses tulis di RAM. Kegagalan membuat root union akan masuk ke shell initramfs fatal. Keluar dari shell tersebut dapat membuat penyiapan berlanjut dengan root yang tidak valid; ini bukan perbaikan ataupun fallback yang aman. AUFS tetap menambahkan branch modul dengan upaya terbaik, tetapi union yang tidak lengkap melewati batas pemulihan: MiniOS tidak menandai persistence sebagai aktif.

Kegagalan pemeriksaan container sengaja tidak memasang sesi yang dicurigai dengan akses tulis.
Jangan mengganti atau membuat ulang file sesi selama boot. Amankan penyimpanan yang terdampak terlebih dahulu; lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## Ventoy Plugin Persistensi

Backend yang dipilih melalui Plugin Persistensi milik Ventoy melewati penemuan sesi bernomor. MiniOS menyelesaikan pemetaan perangkat Ventoy`vtoy_persistent` perangkat, memerlukan image ext4 yang di-mount dengan akses tulis, dan menggunakan direktori `changes/` sebagai upper AUFS atau `changes/` plus `workdir/` untuk OverlayFS. Plugin ini tidak membuat `minios/changes/`, `session.conf`, atau sesi bernomor di dalam image tersebut. Persistensi tetap memerlukan permintaan persistensi yang dikenali; **Mulai tanpa menyimpan** tetap bersifat sementara.

Penggunaan pertama mencatat format union di `.minios-union`. Backend union yang berbeda, perangkat yang tidak tersedia, sistem file yang salah, image yang tidak dapat ditulis, atau aktivasi union yang gagal akan menampilkan peringatan dan membuat upper RAM baru. Plugin ini tidak akan menggunakan image lain hanya karena sistem filenya memiliki label yang cocok.

`perchdir` pemilihan sesi dan `perchtoram` diabaikan untuk image plugin yang dipilih; perubahan tetap tersimpan pada image tersebut meskipun sistem `toram`. Session Manager dan `minios-session` menolak operasi, termasuk penggunaan direktori sesi kustom. Pilih image lain di Ventoy untuk mengubah lingkungan. Jika tidak ada backend plugin yang dipilih, proses boot Ventoy biasa menggunakan model sesi bernomor MiniOS standar. Lihat [Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## Status aktif, berjalan, dan boot saat ini

Dalam metadata sesi persisten, `default=` adalah sesi **aktif** yang dipilih untuk dilanjutkan nanti, sedangkan `running=` adalah sesi yang tercatat digunakan saat boot saat ini. Aktivasi menulis kedua kolom dan menandai sesi tersebut `dirty`.
Setelah mount penyimpanan persisten dilepas saat shutdown normal, MiniOS menghapus `running=` dan menandai sesi `clean`.

Nilai metadata tersebut bisa usang setelah crash, penulisan metadata gagal, pembuatan union gagal, penyimpanan disalin, atau shutdown terputus. Komponen runtime yang mengizinkan penyimpanan tidak hanya mengandalkan `running=` saja. Komponen tersebut menggunakan status boot saat ini yang dilindungi initrd dan terikat pada ID boot, nomor sesi, mode, identitas penyimpanan sebenarnya, status dapat ditulis, persistensi, generasi aktif yang terverifikasi, serta, untuk DynBlk, perangkat `/dev/dynblkN` yang terpasang secara persis. Jika catatan boot saat ini gagal dibuat atau tidak ada, penyimpanan persisten tidak boleh dianggap sebagai target penyimpanan yang disetujui.

Dengan `perchtoram=trim` atau `full` wadah sesi yang didukung disalin ke tmpfs khusus sebelum aktivasi. Penyalinan hanya dilakukan jika memori yang tersedia dan ruang kosong tmpfs cukup untuk menampung panjang file pendukung beserta cadangan ruang; jika penyalinan gagal, operasi tetap menggunakan penyimpanan lokal dengan peringatan. Sesi yang disalin dapat menjadi lapisan atas yang dapat ditulis, tetapi status boot saat ini yang dilindungi menandainya sebagai tidak persisten dan mencatat identitas `ram-origin` tersendiri untuk penyimpanan asli. `trim` hanya menyalin sesi yang dipilih dan didukung beserta metadata yang cocok; `full` menyalin semua sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang didukung di dalam penyimpanan. Data direktori native tidak disalin: permintaan native RAM yang berhasil akan memulai wadah DynBlk atau DynFileFS baru yang kosong, kecuali saat reset, yang menonaktifkan penyalinan. Current Session Manager menemukan penyimpanan asli menggunakan UUID sistem file dan dapat menyimpan sesi berbasis RAM kembali secara eksplisit atau sebagai sesi bernomor baru. Perubahan RAM yang belum disimpan akan hilang jika penulisan balik tidak berhasil.

Untuk panduan operasional terkait, lihat [Mode boot](/using-minios/Boot-Modes), [Parameter boot](/reference/Boot-Parameters), [Sesi dan persistensi](/using-minios/Sessions-and-Persistence), [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Keamanan](/maintenance-and-recovery/Security), dan [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

## Reklamasi ruang yang mempertimbangkan sesi

`minios-session reclaim ID` mendukung DynFileFS, DynBlk, dan sesi VMDK. Untuk sesi plaintext, FITRIM dijalankan pada sistem file ext4 bagian dalam yang sebenarnya, bukan pada root gabungan AUFS/OverlayFS, lalu operasi reklamasi backend penyimpanan terkait dijalankan. Reklamasi DynFileFS memerlukan DynFileFS 4.6.0 atau yang lebih baru.

Untuk sesi DynFileFS yang sedang berjalan, Session Manager memasuki namespace mount privat sementara agar dapat mengakses `virtual.dat` di bawah overmount ext4 aktif tanpa mengganggu daemon, perangkat loop, atau mount union yang sedang digunakan sistem. Perangkat DynBlk/VMDK yang sedang berjalan divalidasi terhadap status boot saat ini yang dilindungi. Sesi tidak aktif dipasang dan di-mount untuk sementara; sesi yang sudah di-mount oleh Session Manager menggunakan kembali attachment tersebut. Jika unmount sibuk, proses teardown dihentikan agar penyimpanan tidak terputus di bawah sistem file yang sedang digunakan.

Kompaksi tidak dijalankan secara otomatis saat boot maupun shutdown. `--compact` merupakan pilihan eksplisit pengguna di CLI atau opsi dialog Session Manager yang tidak dicentang, dan dapat memindahkan data aktif sehingga meningkatkan jumlah penulisan flash. Tanpa opsi ini, backend hanya mereklamasi ruang yang dapat dikembalikan tanpa memindahkan data aktif, seperti rentang yang dapat dihapus dengan hole-punch atau bagian akhir file yang sepenuhnya kosong; pada sistem file seperti exFAT, rentang bagian dalam yang telah dibebaskan dapat tetap digunakan kembali di dalam container meskipun tidak dapat dikembalikan ke sistem file host. Sesi terenkripsi hanya mereklamasi ruang yang sudah diketahui backend dan tidak secara diam-diam mengaktifkan discard melalui dm-crypt.
