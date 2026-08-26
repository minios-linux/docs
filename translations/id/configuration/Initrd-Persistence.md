# Persistensi Initrd

MiniOS membangun root live dari modul hanya-baca dan satu lapisan atas yang dapat ditulis.
Initrd menentukan apakah lapisan atas tersebut adalah sesi persisten bernomor atau direktori sementara di RAM. Halaman ini menjelaskan keputusan saat boot dan jalur aktivasi tersebut.
Untuk kontrol yang terlihat oleh pengguna, lihat [Mode Boot](./Boot-Modes.md) dan [Parameter Boot](./Boot-Parameters.md).

## Persistensi Bersifat Eksplisit

Initrd hanya mengaktifkan penanganan persistensi jika baris perintah kernel
memuat salah satu token yang dikenali berikut:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Jika tidak ada token tersebut, termasuk jika hanya ada nama `perch...` yang tidak dikenali,
MiniOS akan membuat lapisan atas baru yang dapat ditulis di RAM. Perubahan yang dilakukan selama boot tersebut akan dihapus saat shutdown.

Selector tidak semuanya setara:

| Selector | Perilaku Initrd |
|---|---|
| `perch` | Mencoba melanjutkan metadata default. Tidak otomatis membuat sesi baru jika tidak ada yang dapat digunakan atau jika pemeriksaan kompatibilitas gagal. |
| `perchdir=resume` | Mencoba metadata default dan dapat otomatis membuat pengganti baru yang kompatibel. Ini adalah perilaku resume menu boot saat ini. |
| `perchdir=new` | Mengalokasikan direktori dengan ID numerik satu lebih besar dari ID numerik tertinggi yang ada. Tidak pernah menggunakan ulang direktori yang sudah ada. |
| `perchdir=ask` | Menawarkan sesi yang ada dan pilihan sesi baru. Sesi yang tidak kompatibel memerlukan konfirmasi. |
| `perchdir=NUMBER` | Menggunakan direktori tersebut jika ada. Jika tidak ada, pemilihan dapat kembali ke default yang tercatat di metadata; tidak memesan nomor yang diminta. |

Parameter persistensi lain yang dikenali tanpa selector akan masuk ke jalur resume legacy yang sama seperti `perch` tanpa embel-embel: mereka meminta persistensi, tetapi tidak mengaktifkan pembuatan otomatis. Jika pemilihan atau aktivasi tidak dapat menghasilkan lapisan atas yang dapat digunakan, boot tetap berlanjut dengan lapisan atas RAM dan menampilkan peringatan kegagalan.

## Penyimpanan Sesi dan Lokasi

Penyimpanan normal berada di direktori `changes` di samping data MiniOS, dengan direktori sesi bernomor dan metadata `session.conf` atau `session.json`:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

Penyimpanan juga dapat dipilih sebagai perangkat beserta path opsional. Bentuk yang diterima termasuk path langsung `/dev/...`, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, dan `askdisk:custom:path`. Sufiks yang dipisahkan tanda titik dua menjadi path di bawah perangkat yang dipilih; sintaks garis miring setelah `askdisk` akan kehilangan path kustom tersebut secara diam-diam. Subdirektori yang dipilih akan di-bind-mount sebagai penyimpanan sesi. MiniOS juga dapat mendeteksi partisi persistensi di drive yang sama dan penyimpanan persistensi Ventoy yang didukung.

Sebelum pemilihan sesi, initrd harus me-mount lokasi tersebut agar dapat ditulis dan membuktikan dapat membuat serta menghapus marker di penyimpanan. Perangkat blok yang tidak dapat dibuka untuk penulisan, mount hanya-baca, path yang tidak tersedia, atau uji tulis yang gagal akan menolak persistensi untuk boot tersebut. Sesi yang ada tidak langsung dipercaya hanya karena file-nya dapat dibaca.

## Seleksi dan Kompatibilitas

Metadata sesi mencatat mode penyimpanan dan dapat mencatat versi MiniOS, edisi, filesystem union, dan ukuran container. Resume membandingkan mode, versi, edisi, dan union yang tercatat dengan mode yang diminta dan sistem saat ini. Field kompatibilitas legacy yang hilang tidak dianggap sebagai ketidakcocokan.

Literal `perchdir=resume` akan membuat sesi bernomor baru jika default-nya tidak ada atau jika mode, versi, edisi, atau union yang tercatat tidak cocok sehingga default tersebut tidak layak digunakan. `perch` tanpa embel-embel, pemilihan numerik langsung, dan permintaan resume legacy lainnya menolak penggantian otomatis dan akan melanjutkan di RAM setelah pemilihan gagal. `perchdir=ask` menampilkan informasi kompatibilitas dan mengizinkan override secara eksplisit. Sesi baru akan default ke `native` kecuali mode lain diminta.

Mode penyimpanan adalah bagian dari kompatibilitas. Jika seleksi mencapai backend dispatch, mode yang diminta namun tidak dikenal akan kembali ke `native`, yang probe-nya kemudian dapat memilih DynFileFS pada penyimpanan yang tidak sesuai. Sesi yang ada dengan mode tercatat berbeda dapat gagal pada pemeriksaan kompatibilitas sebelumnya; permintaan resume legacy kemudian akan berlanjut di RAM daripada sampai ke fallback tersebut.

## Cadangan Ruang dan Ukuran

MiniOS secara default menjaga ruang kosong 256 MiB pada filesystem persistensi. Cadangan dan pengecekan ruang kosong menggunakan blok filesystem 1024-byte. `perchreserve` menerima angka bulat tanpa satuan, dibatasi maksimal 4096, dan akan kembali ke 256 jika tidak ada atau tidak valid. Alokasi baru dan permintaan pertumbuhan dibatasi agar cadangan ini tetap tersedia. Boot juga akan memperingatkan jika ruang kosong saat ini sama atau di bawah cadangan.

Ukuran container menggunakan satuan bulat yang dialokasikan dalam MiB:

- Angka saja, `M`, atau `MB` berarti MiB.
- `G` atau `GB` mengalikan angka dengan 1000 MiB.
- `T` atau `TB` mengalikan angka dengan 1.000.000 MiB.
- Permintaan logis maksimum adalah 1.000.000 MiB, dibatasi lagi oleh ruang yang tersedia setelah cadangan.
- Session Manager membatasi file raw dan LUKS pada 4000 MiB di FAT32. Selama aktivasi initrd, batas ini diterapkan secara andal pada LUKS, sementara permintaan raw yang terlalu besar dapat mencapai alokasi dan gagal alih-alih diperkecil.
- Sesi raw dan LUKS baru default ke 4000 MiB.
- Sesi DynFileFS yang dibuat initrd baru default ke kapasitas yang tersedia setelah cadangan, dibulatkan ke batas 1000 MiB jika memungkinkan.

Pertumbuhan container bersifat best-effort dan penyusutan tidak didukung. `perchsize` tidak mengatur ukuran sesi native atau SquashFS. Session Manager menggunakan default 4000 MiB untuk sesi container yang baru dibuat; lihat [Manajemen Sesi](./Session-Management.md).

## Aktivasi Penyimpanan

Semua mode yang berhasil harus menyediakan lapisan atas yang dapat ditulis sesuai dengan filesystem union yang dipilih. Mount backend saja bukanlah otoritas runtime akhir. Native, DynFileFS, raw, dan LUKS dapat memperbarui metadata sesi persisten sebelum validasi union; SquashFS menunda komit metadata tersebut. Status current-boot yang dilindungi hanya dipublikasikan setelah root union final dikonfirmasi menggunakan lapisan atas yang diharapkan.

### Native

Mode native pertama-tama mengecualikan filesystem non-POSIX yang sudah dikenal seperti FAT, exFAT, dan NTFS. Kemudian, mode ini menguji perilaku filesystem nyata dengan membuat file dan symlink serta memeriksa perubahan mode eksekusi. Jika uji berhasil, direktori sesi bernomor akan di-bind-mount langsung sebagai area yang dapat ditulis.

Jika filesystem diketahui tidak cocok, atau uji POSIX gagal, mode native akan kembali ke DynFileFS. Kegagalan setelah aktivasi native akan dibatalkan; kandidat kosong yang baru akan dihapus jika dapat dihapus dengan aman.

### DynFileFS

DynFileFS, yang diimplementasikan oleh helper yang kompatibel dengan `dynblk`, menyimpan satu image blok logis di `changes.dat` beserta file segmen bernomornya. Helper harus berhasil mount dan menampilkan `virtual.dat`; jika tidak, aktivasi gagal daripada secara tidak sengaja membuat file hanya-RAM dengan nama yang tampak persisten.

Image logis berisi ext4. Image yang sudah ada akan dicek sebelum mount writable; hasil fsck di atas status error-terkoreksi akan menolak sesi dan menyimpannya untuk pemulihan. Resize hanya mendukung pertumbuhan, dan filesystem ext4 di dalamnya akan diperluas jika memungkinkan. Lihat [Pemulihan DynFileFS](./DynFileFS-Recovery.md) untuk detail segmen dan perbaikan.

### Raw

Mode raw menggunakan image ext4 `changes.img` yang tetap. Image baru akan dialokasikan dan diformat sebelum digunakan. Image yang sudah ada akan dicek sebelum mount, dapat diperbesar sesuai permintaan, dan ext4 di dalamnya akan diperluas agar sesuai dengan image. Jika pengecekan atau mount gagal, container akan tersedia untuk pemulihan dan boot akan dilanjutkan di RAM.

### LUKS

Mode LUKS menggunakan container LUKS2 `changes.luks` dengan ext4 langsung di dalamnya.
Tersedia hanya jika initrd menyertakan marker dukungan crypt dan tools yang dibutuhkan. Pembuatan meminta input konfirmasi yang cocok. Container yang sudah ada mengizinkan tiga kali percobaan unlock di konsol boot.

Initrd melakukan autentikasi sebelum memperbesar file terenkripsi yang ada, lalu mengecek dan memperluas ext4 sebelum mount. Jika pembuatan, unlock, pengecekan, resize, atau mount gagal, MiniOS akan membersihkan mapping dan melanjutkan di RAM. Tidak pernah kembali ke native, DynFileFS, raw, atau persistensi tanpa enkripsi lainnya. Passphrase tidak disimpan di metadata sesi maupun dikirim sebagai argumen perintah. Lihat [Keamanan](../administration/Security-Hardening.md).

### SquashFS

Initrd hanya dapat mengaktifkan sesi SquashFS yang sudah ada; tidak dapat membuat `changes.sb` baru. Aktivasi memvalidasi metadata snapshot yang ketat dan bernilai tunggal, termasuk digest, ukuran terkompresi dan tidak terkompresi, jumlah entri, tipe union, dan kebijakan penyimpanan. Juga memeriksa tipe file dan ukuran persis, RAM dan swap yang tersedia, digest SHA-256 sebelum dan sesudah ekstraksi, serta kompatibilitas union saat ini.

Snapshot diekstrak dengan penanganan error dan xattr yang ketat ke image ext4 sementara yang dibatasi di RAM. Untuk OverlayFS, image tersebut berisi direktori `changes` dan `workdir` terpisah; untuk AUFS, root-nya adalah branch writable. Metadata yang rusak, memori tidak cukup, digest berubah, error ekstraksi, atau kebijakan tidak valid akan menyebabkan aktivasi gagal dan boot tetap menggunakan lapisan atas RAM biasa.

Sesi yang ditandai `dirty` berarti boot sebelumnya tidak menyelesaikan transisi shutdown bersih. SquashFS kemudian akan memperingatkan dan memulihkan `changes.sb` terakhir yang berhasil disimpan; perubahan yang belum disimpan dari boot yang terputus tidak menjadi generasi rollback kedua.

Session Manager dan backend penyimpanan sistem membuat dan mengganti snapshot SquashFS secara atomik menggunakan capture yang persis. Aktivasi boot dapat membaca snapshot yang ada dari penyimpanan FAT, exFAT, atau NTFS yang dapat ditulis karena ekstraksi dilakukan di ext4 upper sementara. Pembuatan dan penyimpanan persis tetap bergantung pada filesystem: area staging privatnya harus mempertahankan link, kepemilikan, mode, xattr, ACL, capabilities, dan union whiteout, sehingga penyimpanan saat ini memerlukan filesystem POSIX yang sesuai. Lihat [Manajemen Sesi](./Session-Management.md).

## Aktivasi Union dan Batas Pemulihan

Untuk AUFS, root perubahan yang diaktifkan menjadi branch writable nol. Untuk OverlayFS, initrd membangun `upperdir` dan `workdir` di bawah root perubahan yang diaktifkan dan me-mount modul hanya-baca sebagai direktori bawah. Initrd kemudian memverifikasi branch AUFS live atau `upperdir` OverlayFS sebelum mempublikasikan persistensi sebagai aktif.

Jika backend persistensi, pembaruan metadata, atau verifikasi ini gagal, mount akan dibatalkan jika memungkinkan, tidak ada otoritas runtime yang berhasil dipublikasikan, dan boot writable berlanjut di RAM. Kegagalan membangun root union akan masuk ke shell fatal initramfs. Keluar dari shell tersebut dapat membuat setup berlanjut dengan root yang tidak valid; ini bukan perbaikan atau fallback yang aman. AUFS tetap mempertahankan penambahan branch modul best-effort, tetapi union yang tidak lengkap melewati batas pemulihan: MiniOS tidak mempublikasikan otoritas persistensi yang berhasil.

Kegagalan pengecekan container sengaja menghindari pemulihan writable. Simpan sesi dan ikuti [Pemulihan Backup](../administration/Backup-Recovery.md), [Pemulihan DynFileFS](./DynFileFS-Recovery.md), atau [Troubleshooting](../administration/Troubleshooting.md) daripada mengganti file sesi saat boot.

## Status Aktif, Berjalan, dan Current-Boot

Dalam metadata sesi yang tahan lama, `default=` adalah sesi **aktif** yang dipilih untuk resume berikutnya, sedangkan `running=` adalah sesi yang dicatat sebagai penyedia boot saat ini. Aktivasi menulis kedua field dan menandai sesi tersebut `dirty`. Setelah mount persistensi menghilang selama shutdown bersih, MiniOS menghapus `running=` dan menandai sesi `clean`.

Field metadata tersebut bisa saja usang setelah crash, penulisan metadata gagal, konstruksi union gagal, penyimpanan yang disalin, atau shutdown yang terputus. Konsumen runtime yang perlu mengotorisasi penyimpanan tidak mempercayai `running=` saja. Mereka menggunakan status current-boot yang dilindungi oleh initrd, terikat pada boot ID, sesi numerik, mode, identitas penyimpanan aktual, status writable, durabilitas, dan generasi aktif yang terverifikasi. Catatan current-boot yang gagal atau hilang berarti persistensi tidak boleh diperlakukan sebagai target penyimpanan yang sah.

Dengan `toram` dan permintaan persistensi yang dikenali, penyimpanan sesi akan disalin ke RAM sebelum aktivasi. Sesi yang disalin dapat writable dan dapat menjadi upper yang berjalan, tetapi status current-boot-nya ditandai non-durable. Perubahan pada salinan RAM tersebut tidak kembali ke perangkat asli dan akan hilang saat shutdown.

Untuk panduan operasional terkait, lihat [Mode Boot](./Boot-Modes.md), [Parameter Boot](./Boot-Parameters.md), [Manajemen Sesi](./Session-Management.md), [Pemulihan DynFileFS](./DynFileFS-Recovery.md), [Pemulihan Backup](../administration/Backup-Recovery.md), [Keamanan](../administration/Security-Hardening.md), dan [Troubleshooting](../administration/Troubleshooting.md).
