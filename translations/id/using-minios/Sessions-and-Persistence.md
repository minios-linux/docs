---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sesi dan persistensi

Sesi MiniOS menjaga perubahan yang dilakukan pada sistem live tetap ada setelah reboot. Setiap sesi merupakan direktori bernomor di bawah `minios/changes/`; modul MiniOS hanya-baca tetap tidak berubah dan sesi yang dipilih menyediakan lapisan union filesystem yang dapat ditulis.

Gunakan Manajer Sesi MiniOS dari sistem MiniOS yang sedang berjalan:

```bash
minios-session-manager
```

Alat baris perintah yang setara adalah `minios-session`. Perintah yang memodifikasi memerlukan hak administratif, sehingga contoh di bawah ini menggunakan `sudo`.

## Mode sesi

| Mode | Penyimpanan | Keterbatasan utama | Lapisan LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Memerlukan filesystem yang dapat ditulis dan dapat mempertahankan metadata serta operasi Linux yang dideteksi oleh MiniOS. Kapasitas mengikuti ruang kosong pada media penyimpanan; `perchsize` tidak berlaku. | Tidak |
| `dynfilefs` | ext4 yang dapat diperluas `virtual.dat` didukung oleh file segmen format-400 | Berfungsi pada filesystem POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis. Payload tipis, namun indeks pemetaan akan bertambah sesuai kapasitas logis yang ditetapkan. | Ya |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Memerlukan CLI DynBlk, modul kernel, dan kemampuan initrd. Ukuran yang dibuat saat boot hingga 16 GiB secara default; maksimum dilaporkan oleh `dynblk limits`. Pemetaan yang berada di disk menggunakan cache metadata terbatas. | Ya |
| `vmdk` | Filesystem ext4 tipis pada VMDK split sparse standar, diekspos oleh driver DynBlk | Menggunakan `volume.vmdk` dan `volume-sNNN.vmdk`. Tanpa kompresi. Memerlukan `vmdk-session-v1` pada penanda kemampuan initrd yang berjalan. Default manual 16 GiB sama seperti DynBlk; cek `dynblk limits --format vmdk` untuk batasnya. | Ya |
| `raw` | Satu `changes.img` file berisi ext4 | Kapasitas logis tetap dengan pertumbuhan eksplisit saja. Berfungsi pada filesystem POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis; FAT32 dibatasi hingga 4000 MiB. | Ya |
| `squashfs` | Snapshot terkompresi di `changes.sb`; upper writable runtime direkonstruksi di RAM | `perchsize` tidak berlaku. Snapshot yang ada dapat dipulihkan dari media yang dapat ditulis yang didukung; penyimpanan persisten yang mendukung POSIX diperlukan untuk penyimpanan yang persis. | Tidak |

Raw, DynFileFS, DynBlk, dan VMDK dapat membawa lapisan enkripsi LUKS2 secara opsional. Backend penyimpanan tetap mengikuti mode sesi, dan metadata sesi mencatat enkripsi secara terpisah. DynFileFS dan raw yang dibuat dengan `minios-session` default ke 4000 MiB; DynBlk dan VMDK default ke 16 GiB. Nilai ukuran dialokasikan dalam MiB; `GB` dan `TB` akhiran mengubah ke 1000 dan 1.000.000 MiB. Raw dibatasi 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Data payload DynFileFS bertambah sesuai kebutuhan, tetapi indeks format-400-nya berukuran sesuai kapasitas logis penuh dan memerlukan sekitar 2 MiB RAM ditambah sekitar 2 MiB media penyimpanan per GiB. DynBlk menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM, default 1 MiB bukan persentase dari RAM. Vektor extent/file dan direktori bertambah sesuai bagian yang dideklarasikan, sedangkan pengisian payload tidak memerlukan peta resident penuh. Cek batas kapasitas terpasang dengan `dynblk limits --format dynblk`. Penulisan aktual tetap dibatasi oleh ruang kosong filesystem bawah dan sumber daya backend. Operasi resize container hanya dapat menambah kapasitas sesi; pengurangan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem persistensi tidak dapat merepresentasikan metadata Linux.
Gunakan DynBlk jika Anda menginginkan perangkat blok kernel nyata dengan file backing tipis; driver dapat mempertahankan beberapa volume DynBlk independen terpasang sekaligus, dan Manajer Sesi menggunakan path perangkat yang dikembalikan driver, bukan mengasumsikan `/dev/dynblk0` tersedia. DynBlk dan VMDK tidak tersedia saat UEFI Secure Boot aktif karena MiniOS tidak menandatangani modul kernel eksternal DynBlk. Installer dan Manajer Sesi akan menyembunyikan mode ini dan menolak permintaan pembuatan eksplisit sebelum mencoba memuat modul.
Gunakan raw jika diperlukan alokasi tetap, tambahkan LUKS2 jika sesi harus dienkripsi, dan gunakan SquashFS untuk snapshot terkompresi yang presisi.

Jalankan perintah berikut untuk memeriksa filesystem persistensi dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat di media hanya-baca. Initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada di FAT, exFAT, atau NTFS yang dapat ditulis karena snapshot diekstrak ke ext4 upper sementara. Membuat atau menyimpan snapshot secara presisi berbeda: penyimpanan persistensi harus mendukung metadata POSIX yang dibutuhkan dan publikasi privat yang tahan lama. Working tree exact-capture menggunakan RAM terpercaya jika tersedia, dengan fallback workspace disk jika RAM tidak cukup.

## Pemilihan boot

Parameter persistensi apa pun yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan entri resume, baru, pemilihan, dan non-persisten. Deskripsi kanonik selector, kompatibilitas, fallback, dan semantik aktivasi ada di [Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Makna |
|-----------|---------|
| `perch` | Gunakan jalur resume best-effort lama. Akan mencoba default metadata namun tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan default metadata dan, jika tidak ada atau tidak kompatibel, izinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku resume menu boot saat ini. |
| `perchdir=setup` | Buka pemilih backend persistensi interaktif, lalu alokasikan sesi bernomor baru. Ini adalah perilaku **Mulai sesi baru** saat ini. |
| `perchdir=new` | Alokasikan sesi bernomor baru langsung dari backend, enkripsi, kompresi, dan pengaturan ukuran yang diminta/default tanpa membuka pemilih backend. |
| `perchdir=ask` | Pilih sesi yang sudah ada; jika store kosong, otomatis masuk ke alur setup yang sama seperti `perchdir=setup`. |
| `perchdir=<id>` | Pilih sesi bernomor tersebut secara langsung. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk `/dev/...` dan `label:...` format yang ditangani oleh initrd. |
| `perchmode=<mode>` | Setel `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. |
| `perchencrypt=luks` | Enkripsi sesi Raw, DynFileFS, DynBlk, atau VMDK yang baru dibuat dengan LUKS2. Sesi yang sudah ada hanya mengambil enkripsi dari metadata. |
| `perchcomp=<codec>` | Pilih kompresi backend DynBlk untuk sesi DynBlk baru. Kompresi dipaksa ke `none` saat DynBlk dibungkus dalam LUKS2. |
| `perchsize=<size>` | Setel ukuran container baru atau lebih besar; nilai tanpa akhiran dialokasikan dalam MiB dan `MB`, `GB`, dan `TB` akhiran diterima. |

Jika tidak ada mode yang ditentukan untuk sesi baru, boot menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan fallback ke DynFileFS. Container raw baru default ke 4000 MiB. Sesi boot DynFileFS, DynBlk, dan VMDK baru tanpa `perchsize` menggunakan hingga 16 GiB; jika sisa ruang setelah cadangan keamanan kurang, ukuran otomatis akan dikurangi. DynFileFS juga memperhitungkan overhead indeks dan batas RAM. Pertumbuhan DynBlk eksplisit mengikuti batas backend terpasang, cek dengan `dynblk limits --format dynblk`. Pada Secure Boot, initrd tidak menawarkan DynBlk/VMDK dan memperlakukan sesi DynBlk/VMDK eksplisit atau resume sebagai tidak tersedia daripada mencoba memuat modul yang tidak ditandatangani.
Sesi SquashFS dapat diambil dari sistem berjalan menggunakan Manajer Sesi MiniOS atau `minios-session create squashfs`. Setup initrd hanya membuat metadata sesi generasi nol dan menyimpan upper writable di RAM. Sistem berjalan membuat `changes.sb` snapshot pertama sesuai permintaan atau saat shutdown.

Saat melanjutkan, MiniOS memeriksa versi, edisi, union filesystem, dan mode yang tercatat. `perchdir=resume` dapat membuat sesi baru alih-alih menggunakan default yang tidak ada atau tidak kompatibel. `perch` tanpa mode, pemilihan numerik langsung, dan permintaan resume lama lainnya tidak otomatis membuat pengganti tersebut.
Pemilihan interaktif menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot akan tetap berjalan dengan upper RAM dan peringatan persistensi.

Store sesi memiliki bentuk berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat ID default dan yang sedang berjalan serta mode, versi, edisi, union filesystem, ukuran, status, dan pengaturan khusus mode per sesi.
Ini adalah metadata persisten yang dikomit oleh implementasi boot, bukan bukti status runtime saat ini. Jangan mengedit atau memindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Manajer Sesi MiniOS atau `minios-session`.

## Sesi aktif dan berjalan

Istilah-istilah ini menjelaskan status yang berbeda:

- Sesi **aktif** adalah default yang dipilih untuk boot berikutnya.
- Secara konsep, sesi **berjalan** adalah sesi yang lapisan writable-nya benar-benar menyediakan persistensi untuk boot saat ini.

Field persisten `running=` mencatat hubungan yang dimaksudkan tersebut. Crash, kegagalan pembuatan union, penyalinan store, atau shutdown yang terputus dapat membuatnya menjadi usang walaupun boot saat ini menggunakan RAM atau sesi lain. Operasi seperti penyimpanan SquashFS memerlukan status boot saat ini yang dilindungi initrd, terikat ID boot, dan upper yang sudah ter-mount terverifikasi; mereka tidak mempercayai `running=` saja. Lihat [Status aktif, berjalan, dan boot saat ini](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Mengaktifkan sesi mengubah boot berikutnya dan tidak mengganti union filesystem saat ini:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi langsung. Sesi yang sedang berjalan biasanya tidak dapat dihapus, diekspor, disalin, di-resize, atau dikonversi. Pembersihan juga melindungi kedua ID.

## Referensi perintah

Daftar sesi dan periksa store:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Buat sesi:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` tanpa mode akan memilih native. Pembuatan SquashFS menangkap perubahan live saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya default ke `shutdown`; penyimpanan berkala default nonaktif.

Simpan sesi SquashFS yang sedang berjalan, atau sesi persistensi yang didukung yang disalin boot saat ini ke RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Untuk SquashFS, `save` membangun ulang snapshot saat ini. Untuk sesi Raw, RAM-backed, DynFileFS, DynBlk, VMDK, atau SquashFS, perintah ini menulis salinan RAM kembali ke store persistensi asli. `--as-new` menjaga sesi yang tersimpan tetap utuh dan mempublikasikan status RAM di bawah nomor sesi baru. Media asli tetap harus terpasang, dapat ditulis, dan cocok dengan identitas filesystem yang tercatat saat boot.

Atur penyimpanan otomatis SquashFS secara terpisah:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Interval berkala yang valid adalah `30`, `60`, `120`, `240`, dan `480` menit; `0` menonaktifkan penyimpanan berkala. Pengaturan shutdown dan berkala bersifat independen.

Ekspor dan impor `.tar.zst` arsip:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Hanya `.tar.zst` impor yang diterima. Path dan anggota arsip divalidasi, dan ekstraksi dibatasi. `--auto-convert` memilih mode yang kompatibel untuk filesystem saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin/klon umum, dan konversi tidak didukung untuk sesi SquashFS; gunakan alur penyimpanannya dan ikuti [Membackup MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) daripada merekonstruksi atau menyalin internal sesi live secara manual.

Salin atau konversi sesi:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` adalah salinan filesystem logis dan selalu memberikan ID sesi baru. Dapat mengubah backend, kapasitas, atau enkripsi dan membuat identitas ext4 serta LUKS yang baru. `clone` menyalin backend yang terlepas secara fisik dan mempertahankan header LUKS, keyslot, UUID LUKS, dan UUID ext4. `convert` secara default menggantikan sumber; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target container.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize mendukung DynFileFS, DynBlk, sesi VMDK, dan raw, termasuk bentuk terenkripsi, dan memerlukan ukuran lebih besar dari ukuran saat ini. Resize DynBlk memperbesar perangkat blok virtual terlebih dahulu lalu memperluas filesystem ext4-nya; tidak melakukan prealokasi kapasitas virtual baru. Cleanup default ke sesi yang lebih tua dari 30 hari.

Semua perintah menerima `--json`, dan store sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Write-back sesi berbasis RAM

Ketika initrd menyalin sesi persistensi yang didukung ke RAM dengan `perchtoram`, sesi yang sedang berjalan tidak lagi menulis langsung ke backend aslinya. MiniOS mencatat store asli berdasarkan UUID filesystem dan nomor sesi, bukan hanya nama `/dev/sdX`. Manajer Sesi tetap menampilkan sesi RAM tersebut meskipun perangkat aslinya sementara dilepas.

Jika store asli tersedia, dapat ditulis, dan tidak berubah, **Simpan Sekarang** menulis status RAM kembali ke sesi asli. **Simpan ke Penyimpanan sebagai Sesi Baru** menjaga sumber yang tersimpan tetap utuh dan mempublikasikan status RAM sebagai sesi bernomor baru. Padanan CLI-nya adalah `minios-session save <id>` dan `minios-session save <id> --as-new`. Proses penyimpanan menampilkan progres penyalinan dan dapat dibatalkan sebelum tahap publikasi; publikasi akan selesai secara atomik setelah dimulai.

Jika media asli hilang, hanya-baca, tidak lagi cocok dengan identitas saat boot, atau sesi asli berubah secara independen, write-back akan ditolak daripada menargetkan perangkat lain berdasarkan nama. Pasang kembali media asli dan coba lagi, atau gunakan simpan-sebagai-baru jika sesi asli sudah berbeda. Sesi direktori native tidak disalin oleh implementasi `perchtoram`, sehingga jalur write-back ini berlaku untuk sesi Raw, DynFileFS, DynBlk, VMDK, dan SquashFS.

## Perilaku penyimpanan SquashFS

Sesi SquashFS akan diekstrak ke RAM untuk lapisan writable yang berjalan. Penyimpanan akan membangun ulang dan memvalidasi snapshot yang presisi, lalu mengganti `changes.sb`.
Tidak ada generasi rollback yang disimpan. Simpan Sekarang tersedia dari ikon tray, Manajer Sesi MiniOS, atau `minios-session save` terlepas dari kebijakan otomatis.

Untuk setiap penyimpanan, MiniOS menyalin tampilan stabil pohon yang dimodifikasi ke penyimpanan privat RAM jika memori cukup. Kompresi menulis **satu** image ke direktori privat dalam sesi bernomor. Hanya setelah memeriksa isi filesystem, digest, identitas, dan sinkronisasi yang tahan lama, penyimpan akan mengganti `changes.sb`. Tidak ada image terkompresi kedua penuh di RAM atau penulisan kedua image tersebut ke perangkat persistensi. Jika memori RAM terlalu sedikit untuk pohon, hanya working tree yang akan fallback ke disk; kandidat terkompresi tetap membutuhkan satu penulisan. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk kebijakan cache dan penulisan log.

Diagnostik boot untuk sesi SquashFS yang tahan lama disimpan di bawah `boot-logs/minios/` dan `boot-logs/live/` direktori. Tidak tergantung pada snapshot shutdown yang sukses dan tetap tersedia meski perubahan terakhir pada upper RAM tidak dapat disimpan. Store backing tetap harus dapat ditulis; file jurnal biasa bisa saja hanya bersifat sementara jika `LIVE_LOG_STORAGE=volatile` dipilih.

Penyimpanan saat shutdown diimplementasikan oleh trigger shutdown inti MiniOS dan backend `minios-squashfs-save`, sehingga tidak tergantung pada Manajer Sesi MiniOS terbuka atau terpasang. Penyimpanan berkala dicek setiap 30 menit oleh timer systemd atau worker SysV, keduanya memanggil backend autosave yang sama. Pembangunan ulang snapshot menggunakan CPU dan menulis snapshot lengkap; interval satu jam atau lebih lama direkomendasikan.

Selama operasi RAM-backed SquashFS, snapshot SquashFS yang baru diambil dan diaktifkan dapat mengambil alih target penyimpanan yang sedang berjalan. Setelah penyerahan tersebut, snapshot berjalan lama dapat dihapus tanpa reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk handoff SquashFS boot-saat-ini yang valid. Mode persistensi berjalan lainnya tetap terlindungi dari penghapusan.

## Enkripsi

LUKS2 adalah lapisan enkripsi opsional di atas penyimpanan sesi Raw, DynFileFS, DynBlk, atau VMDK; ini bukan mode sesi terpisah. Hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt` berisi `luks-layer-v1` dan alat serta kapabilitas backend yang dipilih tersedia. Kompresi backend DynBlk dinonaktifkan saat LUKS2 dipilih.

Pembuatan LUKS interaktif meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membacanya dari input standar dengan `--password-stdin`. Frasa sandi tidak ditempatkan dalam argumen perintah atau metadata sesi. Saat boot, initrd meminta frasa sandi di konsol. Tiga kali penolakan akan menghentikan boot secara fatal; MiniOS tidak akan melanjutkan dengan plaintext, RAM, backend lain, atau sesi pengganti di bawah permintaan yang sama.

Untuk sesi Raw, DynFileFS, DynBlk, atau VMDK yang terenkripsi, tidak aktif, dan terlepas, Manajer Sesi menawarkan **Ubah Frasa Sandi...**. Padanan CLI-nya:

```bash
sudo minios-session change-passphrase <id>
```

Akan meminta frasa sandi saat ini, frasa sandi baru, dan konfirmasi. Dengan `--password-stdin`, masukkan ketiga baris tersebut secara berurutan. Keyslot yang dipilih akan diganti tanpa memformat ulang atau mengenkripsi ulang seluruh file. Sesi aktif, berjalan, atau ter-mount harus dilepas terlebih dahulu; keyslot LUKS tambahan yang dikelola di luar Manajer Sesi tidak akan diubah.

Ekspor terenkripsi berisi file sesi logis yang sudah didekripsi, bukan backend yang terenkripsi. Impor, salin, atau konversi ke LUKS akan membuat backend terenkripsi baru dengan identitas baru.

## Mount sesi tidak aktif

Manajer Sesi dapat me-mount sesi Raw, DynFileFS, DynBlk, atau VMDK yang tidak aktif dan tidak berjalan secara read-write tanpa menjadikannya default boot. Klik kanan sesi dan pilih **Mount Sesi**; sesi terenkripsi akan meminta frasa sandi LUKS. Beberapa ID sesi berbeda dapat di-mount secara bersamaan. **Buka Folder yang Ter-mount** membuka filesystem yang terpasang, sedangkan **Buka Folder Sesi** membuka direktori bernomor yang berisi file backing-nya.

Menutup Manajer Sesi tidak akan membongkar mount yang dikelola GUI. Buka kembali aplikasi untuk melihatnya dan pilih **Unmount Sesi**. Jika proses unmount sibuk, MiniOS akan membiarkan daemon backing, perangkat loop, atau perangkat DynBlk tetap terhubung daripada memutus penyimpanan di bawah filesystem yang masih aktif.

CLI mandiri akan mempertahankan mount tetap aktif hingga input standarnya ditutup atau menerima Ctrl+C:

```bash
sudo minios-session mount <id>
```

Perintah ini menolak sesi aktif atau berjalan dan tidak pernah memformat filesystem yang sudah ada karena proses mounting gagal.

## Backup dan sesi gagal

Untuk sesi native, DynFileFS, DynBlk, VMDK, dan raw, termasuk bentuk terenkripsi, gunakan `export` untuk backup logis, bukan menyalin direktori sesi yang ter-mount. Simpan arsip yang dihasilkan di perangkat lain dan pastikan dapat diimpor sebelum mengandalkannya. Impor selalu membuat sesi bernomor baru; aktifkan secara eksplisit ketika sudah siap digunakan.
Untuk prosedur backup SquashFS dan seluruh perangkat, lihat [Membackup MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah penyimpanan penuh, penulisan terputus, atau sesi kosong dibuat berulang kali, hentikan modifikasi pada penyimpanan terkait. Ekspor sesi non-running yang masih dapat dibaca terlebih dahulu jika memungkinkan, lalu ikuti [Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa memodifikasi data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, filesystem container akan diperiksa sebelum aktivasi writable. Kegagalan pemeriksaan filesystem yang serius akan mempertahankan container untuk pemulihan alih-alih me-mount secara writable. SquashFS mendeteksi status sebelumnya yang tidak bersih dan mengembalikan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan menghapus direktori sesi secara manual.

## Mengembalikan penyimpanan DynFileFS, DynBlk, dan VMDK yang tidak terpakai

Di Manajer Sesi, klik kanan sesi DynFileFS, DynBlk, atau VMDK lalu pilih **Bebaskan Ruang...**. Dialog ini berfungsi untuk sesi berjalan atau tidak aktif yang didukung dan juga dapat digunakan kembali pada sesi yang sudah ter-mount melalui Manajer Sesi. Untuk sesi plaintext, MiniOS menjalankan FITRIM pada filesystem ext4 internal lalu meminta backend untuk mengembalikan ruang kosong yang diketahui. Sesi yang terlepas akan dipasang sementara dan dilepas hanya setelah filesystem-nya di-unmount dengan bersih.

Reklamasi DynFileFS memerlukan DynFileFS versi 4.6.0 atau lebih baru. Jika paket diperbarui saat daemon DynFileFS lama masih aktif, reboot ke backend yang sudah diperbarui sebelum mereklamasi sesi berjalan tersebut.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

Kotak centang kompaksi **nonaktif secara default**, termasuk di exFAT. Tidak ada
fallback kompaksi otomatis. Sesi terenkripsi hanya mereklamasi ruang yang sudah
diketahui backend; operasi ini tidak mengaktifkan discard melalui LUKS atau
mengungkap pola alokasinya. Kesalahan perangkat dan trim gagal akan menghentikan operasi.

### Perintah driver tingkat rendah

Dengan backend VMDK native atau split DynBlk saat ini, pembuangan seluruh grain
membuat penempatannya dapat digunakan kembali. Pada filesystem ext4, rentang yang sudah tidak digunakan
juga dapat secara otomatis di-hole-punch. Pada exFAT, pembersihan otomatis hanya memangkas
bagian akhir file yang benar-benar kosong.**Pembersihan otomatis tidak pernah memindahkan data yang masih aktif.**

Gunakan `fstrim` pada filesystem perubahan internal yang ter-mount (bukan gabungan AUFS/OverlayFS
root) untuk melaporkan blok yang dihapus, lalu `dynblk reclaim /dev/dynblkN --execute` untuk
pembersihan tanpa pemindahan. Pilih perangkat sesi yang sebenarnya, bukan indeks asumsi.
Untuk meminta kompaksi in-place yang intensif penulisan secara manual, tambahkan `--compact`.
Fitur ini berjalan tanpa mengonversi image atau mengubah ukuran virtual filesystem;
proses baca/tulis lain dapat berjalan di antara langkah reclaim. Ini bukan fallback otomatis.
Opsi `--scan-zeroes` membaca grain yang dipetakan, dan tidak diaktifkan secara default.

Perintah-perintah ini juga tersedia di CLI initrd DynBlk yang telah dibangun ulang. Tidak ada kompaksi
startup otomatis yang diaktifkan. Sesi terenkripsi mempertahankan kebijakan discard yang sudah ada;
alat ini tidak secara diam-diam mengaktifkan passthrough discard dm-crypt.
Lampiran read-only atau `cache=unsafe` tidak dapat direklamasi. Rentang yang sudah di-punch dan panjang yang sudah dipangkas yang dilaporkan
tidak sama dengan ruang kosong filesystem yang terukur.

## Alur kerja sesi VMDK

VMDK adalah mode sesi terpisah, bukan codec kompresi baru. Pembuatan, aktivasi,
resize, ekspor/impor, salin, klon, dan konversi menggunakan perintah Manajer Sesi
yang sama seperti mode container lainnya:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Arsip sesi berisi file logis dan metadata, bukan lampiran VMDK eksternal sembarangan.
Sesi VMDK yang dikelola menggunakan `volume.vmdk`descriptor kanonik
dan semua `volume-sNNN.vmdk`saudara kandungnya. Jangan mengganti nama bagian atau menyalin image aktif
di belakang driver. Berpindah antara DynBlk native dan VMDK memerlukan
salinan/konversi eksplisit; mengubah `session_mode`secara manual bukanlah konversi.

Installer hanya menawarkan VMDK jika didukung oleh runtime dan akan menolak image sumber
yang initrd-nya tidak memiliki kemampuan `vmdk-session-v1`yang disalin. Perbarui CLI,
driver, alat sesi, dan skrip boot secara bersamaan sebelum membuat sesi VMDK.
