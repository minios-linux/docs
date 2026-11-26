---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sesi dan persistensi

MiniOS menyimpan perubahan pada sistem yang sedang berjalan agar tetap ada setelah reboot. Setiap sesi berupa direktori bernomor di bawah `minios/changes/`; modul MiniOS hanya-baca tetap tidak berubah, sedangkan sesi yang dipilih menyediakan lapisan writable untuk union filesystem.

Gunakan Manajer Sesi MiniOS dari sistem MiniOS yang sedang berjalan:

```bash
minios-session-manager
```

Alat command-line yang setara adalah `minios-session`. Semua perintah selain help memerlukan hak administratif; jalankan contoh dengan `sudo`.

Alur kerja sesi bernomor ini tidak tersedia jika yang dipilih adalah image **Ventoy Persistence Plugin**. Image tersebut menyediakan satu lingkungan persisten yang dipilih di Ventoy, tanpa metadata sesi MiniOS. Boot Ventoy biasa tanpa backend plugin yang dipilih akan mempertahankan sesi MiniOS; lihat [Ventoy](/installing-minios/installation-tools/Ventoy).

## Mode sesi

| Mode | Penyimpanan | Batasan utama | MiniOS lapisan LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Memerlukan sistem file yang dapat ditulis dan mendukung metadata serta operasi Linux yang diperiksa oleh MiniOS. Kapasitas mengikuti ruang kosong pada media penyimpanan; `perchsize` tidak berlaku. | Tidak |
| `dynfilefs` | Dapat diperluas `virtual.dat` dengan file format-600, berisi ext4 | Berfungsi pada sistem file POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis. Payload dialokasikan sesuai kebutuhan. | Ya |
| `dynblk` | Sistem file ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Memerlukan CLI DynBlk, modul kernel, dan dukungan initrd. Ukuran yang dibuat saat boot secara default hingga 16 GiB; batas maksimumnya dilaporkan oleh `dynblk limits`. Pemetaan yang tersimpan di disk menggunakan cache metadata terbatas. | Ya |
| `vmdk` | Sistem file ext4 tipis pada VMDK sparse terpisah standar, diekspos oleh driver DynBlk | Menggunakan `volume.vmdk` dan `volume-sNNN.vmdk`. Tanpa kompresi. Memerlukan `vmdk-session-v1` pada penanda kapabilitas initrd yang sedang berjalan. Default manual sama, yaitu 16 GiB, seperti DynBlk; tanyakan `dynblk limits --format vmdk` untuk mengetahui batasnya. | Ya |
| `raw` | Satu file `changes.img` yang berisi ext4 | Kapasitas logis tetap dan hanya dapat diperbesar secara eksplisit. Berfungsi pada sistem file POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis; FAT32 dibatasi hingga 4000 MiB. | Ya |
| `squashfs` | Snapshot terkompresi di `changes.sb`; area atas yang dapat ditulis saat runtime dibuat ulang di RAM | `perchsize` tidak berlaku. Snapshot yang ada dapat dipulihkan dari media dapat tulis yang didukung; penyimpanan yang sesuai dan mendukung POSIX diperlukan untuk menyimpan perubahan secara persis. | Tidak |

Raw, DynFileFS, DynBlk, dan VMDK dapat menggunakan lapisan enkripsi LUKS2 secara opsional. Backend penyimpanan tetap menjadi mode sesi, sementara metadata sesi mencatat enkripsi secara terpisah. DynFileFS dan raw yang dibuat dengan `minios-session` secara default berukuran 4000 MiB; DynBlk dan VMDK secara default berukuran 16 GiB. Nilai ukuran dialokasikan dalam MiB; `GB` dan `TB` sebagai akhiran masing-masing dikonversi menjadi 1000 dan 1.000.000 MiB. Raw dibatasi hingga 4000 MiB pada FAT32, baik dienkripsi maupun tidak. DynFileFS menyimpan halaman indeks di disk dan menyimpannya dalam cache sesuai kebutuhan. DynBlk menyimpan tabel pemetaan di disk dan menggunakan cache metadata terbatas di RAM, dengan nilai default 1 MiB, bukan persentase dari RAM. Vektor extent/file dan direktori bertambah sesuai jumlah bagian yang ditetapkan, sementara pengisian payload tidak memerlukan peta lengkap di memori. Tanyakan batas kapasitas yang terpasang dengan `dynblk limits --format dynblk`. Penulisan aktual tetap dibatasi oleh ruang kosong sistem file dasar dan penerimaan sumber daya backend. Operasi ubah ukuran container hanya dapat memperbesar sesi; ukuran tidak dapat diperkecil.

Saat runtime DynFileFS yang baru pertama kali memasang container format 400 atau 500 yang sudah ada, container tersebut otomatis dikonversi langsung ke format 600 jika pemisahan lama berukuran genap dalam MiB. Pemisahan dengan ukuran ganjil dalam MiB akan ditolak tanpa mengubah sumber. Proses ini memperbarui format container, bukan mode `dynfilefs`sesi. Simpan cadangan terpisah dan perbarui initrd boot sebelum mengonversi; helper versi lama tidak dapat membuka container yang telah dikonversi.

Mode native adalah pilihan paling sederhana dan cepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem penyimpanan persisten tidak dapat merepresentasikan metadata Linux.
Gunakan DynBlk jika Anda menginginkan perangkat blok kernel sungguhan dengan file backing thin; driver dapat memasang beberapa volume DynBlk independen sekaligus, dan Session Manager menggunakan path perangkat yang dikembalikan oleh driver, bukan mengasumsikan `/dev/dynblk0` tersedia. DynBlk dan VMDK tidak tersedia saat UEFI Secure Boot diaktifkan karena MiniOS tidak menandatangani modul kernel DynBlk eksternal. Karena itu, Installer dan Session Manager menyembunyikan mode ini dan menolak permintaan pembuatan eksplisit sebelum mencoba memuat modul.
Gunakan raw jika alokasi tetap diperlukan, tambahkan LUKS2 jika sesi harus dienkripsi, dan gunakan SquashFS untuk snapshot terkompresi yang persis.

Jalankan perintah berikut untuk memeriksa filesystem penyimpanan persisten yang sebenarnya dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Sesi tidak dapat dibuat di media hanya-baca. initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada dan tersimpan di FAT, exFAT, atau NTFS yang dapat ditulisi karena snapshot tersebut diekstrak ke upper ext4 sementara. Membuat atau menyimpan snapshot secara persis berbeda: penyimpanan persisten harus mendukung metadata POSIX yang diperlukan serta publikasi privat dan tahan lama. Pohon kerja untuk pengambilan persis menggunakan RAM tepercaya jika tersedia, dengan fallback ruang kerja disk jika RAM tidak memadai.

## Pemilihan boot

Parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan entri untuk melanjutkan sesi, memulai sesi baru, memilih sesi, dan menjalankan sistem tanpa persistensi. Penjelasan kanonis tentang semantik pemilih, kompatibilitas, fallback, dan aktivasi tersedia di [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Arti |
|-----------|---------|
| `perch` | Gunakan jalur melanjutkan sesi lama yang bersifat upaya terbaik. Jalur ini mencoba default metadata, tetapi tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan sesi default metadata dan, jika sesi tersebut tidak ada atau tidak kompatibel, izinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku melanjutkan sesi saat ini pada menu boot. |
| `perchdir=setup` | Buka pemilih backend persistensi interaktif, lalu alokasikan sesi bernomor baru. Ini adalah perilaku **Mulai sesi baru** saat ini. |
| `perchdir=new` | Alokasikan sesi bernomor baru langsung dari pengaturan backend, enkripsi, kompresi, dan ukuran yang diminta atau default, tanpa membuka pemilih backend. |
| `perchdir=ask` | Pilih sesi yang ada; jika penyimpanan kosong, otomatis masuk ke alur penyiapan yang sama dengan `perchdir=setup`. |
| `perchdir=<id>` | Pilih sesi bernomor tersebut secara langsung. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk `/dev/...` dan `label:...` dalam format yang ditangani initrd. |
| `perchmode=<mode>` | Atur `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. |
| `perchencrypt=luks` | Enkripsi sesi Raw, DynFileFS, DynBlk, atau VMDK yang baru dibuat dengan LUKS2. Enkripsi sesi yang sudah ada ditentukan hanya dari metadata. |
| `perchcomp=<codec>` | Pilih kompresi backend DynBlk untuk sesi DynBlk baru. Kompresi akan dipaksakan menjadi `none` jika DynBlk dibungkus dengan LUKS2. |
| `perchsize=<size>` | Atur ukuran kontainer baru atau yang lebih besar; nilai biasa dialokasikan dalam MiB dan `MB`, `GB`, dan `TB` dapat digunakan sebagai sufiks. |

Jika mode tidak ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, atau jika pemeriksaan sistem file native gagal, saat startup sistem akan memilih DynBlk jika helper-nya tersedia dan Secure Boot mengizinkannya; jika tidak, sistem akan beralih ke DynFileFS. Fallback ini tidak mengubah mode penyimpanan sesi yang sudah ada. Kontainer raw baru menggunakan ukuran default 4000 MiB. Sesi boot DynFileFS, DynBlk, dan VMDK baru tanpa `perchsize` menggunakan hingga 16 GiB; jika ruang penyimpanan yang tersisa setelah cadangan keamanan kurang dari itu, ukuran otomatis akan dikurangi. Pemeriksaan kapasitas backend tetap berlaku. Penambahan ukuran DynBlk yang ditentukan secara eksplisit mengikuti batas backend yang terpasang, yang diperiksa menggunakan `dynblk limits --format dynblk`. Dengan Secure Boot, initrd tidak menawarkan DynBlk/VMDK dan menganggap sesi DynBlk/VMDK yang dipilih secara eksplisit atau dilanjutkan tidak tersedia, alih-alih mencoba memuat modul yang tidak ditandatangani.
Sesi SquashFS dapat diambil dari sistem yang sedang berjalan menggunakan Manajer Sesi MiniOS atau `minios-session create squashfs`. Penyiapan initrd hanya membuat metadata sesi generasi nol dan menyimpan lapisan atas yang dapat ditulis di RAM. Sistem yang sedang berjalan membuat snapshot pertama `changes.sb` sesuai kebutuhan atau saat dimatikan.

Saat melanjutkan sesi, MiniOS memeriksa versi, edisi, sistem file union, dan mode yang tercatat. `perchdir=resume` dapat membuat sesi baru sebagai pengganti default yang tidak ada atau tidak kompatibel. Permintaan `perch` tanpa argumen, pemilihan nomor secara langsung, dan permintaan melanjutkan sesi lama lainnya tidak otomatis membuat sesi pengganti tersebut.
Pemilihan interaktif menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot biasanya berlanjut dengan lapisan atas RAM dan peringatan persistensi.

Penyimpanan sesi memiliki format berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat ID default dan ID yang sedang berjalan, serta mode, versi, edisi, sistem file union, ukuran, status, dan pengaturan khusus mode untuk setiap sesi.
Metadata ini bersifat persisten dan ditulis oleh implementasi boot, tetapi dengan sendirinya tidak membuktikan status runtime saat ini. Jangan mengeditnya atau memindahkan data sesi bernomor saat sesi sedang terpasang; gunakan Manajer Sesi MiniOS atau `minios-session`.

## Sesi aktif dan sesi yang berjalan

Istilah-istilah ini menjelaskan keadaan yang berbeda:

- Sesi **aktif** adalah sesi default yang dipilih untuk boot berikutnya.
- Secara konseptual, sesi **yang berjalan** adalah sesi yang lapisan writable-nya benar-benar menyediakan persistensi untuk boot saat ini.

Field `running=` persisten mencatat hubungan yang dimaksud tersebut. Crash, kegagalan pembuatan union, penyalinan penyimpanan, atau shutdown yang terhenti dapat membuatnya tidak lagi akurat, meskipun boot saat ini menggunakan RAM atau sesi lain. Karena itu, operasi seperti menyimpan SquashFS memerlukan status boot saat ini yang dilindungi initrd dan terikat pada ID boot, serta upper yang ter-mount dan terverifikasi; operasi tersebut tidak hanya mengandalkan `running=` saja. Lihat [Status aktif, berjalan, dan boot saat ini](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Mengaktifkan sesi akan mengubah sesi untuk boot berikutnya dan tidak mengganti union filesystem saat ini:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi di tempat. Sesi yang sedang berjalan biasanya tidak dapat dihapus, diekspor, disalin, diubah ukurannya, atau dikonversi. Pembersihan juga melindungi kedua ID.

<a id="command-reference"></a>

## Referensi perintah

Lihat daftar sesi dan periksa penyimpanan:

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

`create` tanpa mode akan memilih native. Pembuatan SquashFS mengambil perubahan aktif saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya secara default adalah `shutdown`; penyimpanan berkala secara default dinonaktifkan.

Simpan sesi SquashFS yang sedang berjalan, atau sesi persistence yang didukung dan disalin oleh boot saat ini ke RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Untuk SquashFS, `save` membangun ulang snapshot saat ini. Untuk sesi Raw berbasis RAM, DynFileFS, DynBlk, VMDK, atau SquashFS, tindakan ini menulis salinan RAM kembali ke penyimpanan persistence asal. `--as-new` mempertahankan sesi tersimpan yang asli dan menerbitkan status RAM dengan nomor sesi baru. Media asli harus tetap tersedia, dapat ditulis, dan cocok dengan identitas filesystem yang dicatat saat boot.

Konfigurasikan penyimpanan otomatis SquashFS secara terpisah:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Interval berkala yang valid adalah `30`, `60`, `120`, `240`, dan `480` menit; `0` menonaktifkan penyimpanan berkala. Pengaturan shutdown dan berkala tidak saling bergantung.

Ekspor dan impor arsip `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Hanya `.tar.zst` yang dapat diimpor. Path dan isi arsip divalidasi, dan ekstraksi dibatasi. `--auto-convert` memilih mode yang kompatibel dengan filesystem saat ini. `--force-mode <mode>` memilih mode tersedia secara eksplisit. Ekspor, penyalinan/kloning umum, dan konversi tidak didukung untuk sesi SquashFS; gunakan alur kerja penyimpanannya dan ikuti [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) alih-alih merekonstruksi atau menyalin sendiri bagian internal sesi yang sedang aktif.

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

`copy` adalah salinan filesystem logis dan selalu menetapkan ID sesi baru. Tindakan ini dapat mengubah backend, kapasitas, atau enkripsi, serta membuat identitas ext4 dan LUKS baru. `clone` menyalin backend yang telah dilepas secara fisik dan mempertahankan header LUKS, keyslot, UUID LUKS, serta UUID ext4-nya. `convert` menggantikan sumber secara default; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target container.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize mendukung sesi DynFileFS, DynBlk, VMDK, dan raw, termasuk yang terenkripsi, serta memerlukan ukuran yang lebih besar daripada ukuran saat ini. Resize DynBlk memperbesar perangkat blok virtual terlebih dahulu, lalu memperluas filesystem ext4-nya; tindakan ini tidak mengalokasikan kapasitas virtual baru terlebih dahulu. Secara default, pembersihan mencakup sesi yang lebih lama dari 30 hari.

Semua perintah menerima `--json`, dan penyimpanan sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Penulisan kembali sesi berbasis RAM

Saat initrd menyalin sesi persistence yang didukung ke RAM dengan `perchtoram`, sesi yang sedang berjalan tidak lagi menulis langsung ke backend asalnya. MiniOS mencatat penyimpanan asal berdasarkan UUID filesystem dan nomor sesi, bukan mengandalkan nama `/dev/sdX`. Session Manager menjaga agar sesi RAM tersebut tetap terlihat, meskipun perangkat asal untuk sementara dilepas.

Jika penyimpanan asal tersedia, dapat ditulis, dan tidak berubah, **Simpan Sekarang** menulis status RAM kembali ke sesi asal. **Simpan ke Penyimpanan sebagai Sesi Baru** mempertahankan sumber tersimpan tanpa perubahan dan menerbitkan status RAM sebagai sesi bernomor baru. Padanan CLI-nya adalah `minios-session save <id>` dan `minios-session save <id> --as-new`. Proses penyimpanan melaporkan progres penyalinan dan dapat dibatalkan sebelum tahap publikasi; setelah dimulai, publikasi diselesaikan secara atomik.

Jika media asal hilang, hanya-baca, tidak lagi cocok dengan identitas saat boot, atau sesi asal berubah secara independen, penulisan kembali akan ditolak alih-alih diarahkan ke perangkat lain berdasarkan nama. Pasang kembali media asal lalu coba lagi, atau gunakan opsi simpan sebagai sesi baru jika sesi asal telah berubah. Sesi direktori native tidak disalin oleh `perchtoram`: permintaan RAM yang berhasil akan memulai container kosong baru, tanpa mengimpor data native. Gunakan `perchtoram=off` untuk mempertahankan sesi native tersebut. Selama reset sesi native, penyalinan dinonaktifkan untuk boot tersebut guna menjaga data yang dipertahankan.

## Reset sesi yang tidak kompatibel

Menu **Pilih sesi yang disimpan** saat boot dapat mereset sesi yang tidak kompatibel sebelum aktivasi. **Reset, pertahankan pengaturan** menghapus software yang terpasang oleh sistem, tetapi mempertahankan pengaturan dan data sistem. **Reset, pertahankan data** juga mereset konfigurasi sistem biasa. Keduanya mempertahankan `/home` dan `/root`, termasuk pengaturan pribadi dan aplikasi yang dipasang di direktori home, akun, kata sandi, serta kunci. File yang dipasang secara manual di lokasi lain dan tidak tercantum juga mungkin tetap ada; proses ini tidak menghapus semua software sepenuhnya.

Reset memerlukan ruang kosong untuk membuat salinan kedua dari data yang dipertahankan. Penggantian direktori yang gagal atau terputus akan dibatalkan atau dipulihkan saat pemasangan berikutnya. Lanjutkan otomatis tidak pernah mereset sesi secara diam-diam. Untuk SquashFS, reset hanya memengaruhi lapisan RAM yang dipulihkan, sampai penyimpanan berhasil menerbitkan snapshot baru beserta informasi kompatibilitasnya. Cadangkan data penting sebelum mereset; lihat [Internal persistence](/reference/boot-process/Persistence-Internals).

## Perilaku penyimpanan SquashFS

Sesi SquashFS diekstrak ke RAM sebagai lapisan tulis yang sedang berjalan. Proses penyimpanan membangun ulang dan memvalidasi snapshot yang sama persis, lalu mengganti `changes.sb`.
Generasi rollback tidak disimpan. Simpan Sekarang tersedia dari ikon tray, Manajer Sesi MiniOS, atau `minios-session save` terlepas dari kebijakan otomatis.

Untuk setiap penyimpanan, MiniOS menyalin tampilan stabil dari pohon yang telah diubah ke penyimpanan RAM privat jika memori mencukupi. Kompresi menulis **satu** image ke direktori privat dalam sesi bernomor. Setelah memeriksa isi filesystem, digest, identitas, dan sinkronisasi permanennya, proses penyimpan mengganti `changes.sb`. Tidak ada image terkompresi kedua yang lengkap di RAM atau penulisan image tersebut yang kedua kali ke perangkat persistence. Jika RAM tidak cukup untuk pohon tersebut, hanya pohon kerja itu yang dialihkan ke disk; kandidat terkompresi tetap perlu ditulis satu kali. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk kebijakan penulisan cache dan log.

Diagnostik boot untuk sesi SquashFS yang persisten disimpan di direktori `boot-logs/minios/` dan `boot-logs/live/`. Diagnostik ini tidak bergantung pada keberhasilan snapshot saat shutdown dan tetap tersedia meskipun perubahan terakhir pada upper RAM tidak dapat disimpan. Penyimpanan pendukung tetap harus dapat ditulis; file journal biasa mungkin bersifat sementara jika `LIVE_LOG_STORAGE=volatile` dipilih.

Penyimpanan saat shutdown diterapkan oleh pemicu shutdown inti MiniOS dan backend `minios-squashfs-save`, sehingga tidak bergantung pada Manajer Sesi MiniOS yang sedang terbuka atau terpasang. Penyimpanan berkala diperiksa setiap 30 menit oleh timer systemd atau worker SysV; keduanya memanggil backend simpan otomatis yang sama. Membangun ulang snapshot menggunakan CPU dan menulis seluruh snapshot; interval satu jam atau lebih disarankan.

Selama operasi RAM berbasis SquashFS, snapshot SquashFS yang baru diambil dan diaktifkan dapat mengambil alih target penyimpanan yang sedang berjalan. Setelah pengalihan tersebut, snapshot lama yang sedang berjalan dapat dihapus tanpa reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk pengalihan SquashFS yang valid pada boot saat ini. Mode persistence lain yang sedang berjalan tetap dilindungi dari penghapusan.

## Enkripsi

LUKS2 adalah lapisan enkripsi opsional di atas penyimpanan sesi Raw, DynFileFS, DynBlk, atau VMDK; LUKS2 bukan mode sesi terpisah. Fitur ini hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt`memiliki `luks-layer-v1` dan alat serta kapabilitas backend yang dipilih tersedia. Kompresi backend DynBlk dinonaktifkan saat LUKS2 dipilih.

Pembuatan LUKS secara interaktif meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membaca frasa sandi dari input standar dengan `--password-stdin`. Frasa sandi tidak disertakan dalam argumen perintah atau metadata sesi. Saat boot, initrd meminta frasa sandi melalui konsol. Tiga kali percobaan yang ditolak akan menghentikan proses boot secara fatal; MiniOS tidak akan melanjutkan dengan plaintext, RAM, backend lain, atau sesi pengganti dengan permintaan yang sama.

Untuk sesi Raw terenkripsi, DynFileFS, DynBlk, atau VMDK yang tidak aktif dan telah dilepas, Session Manager menyediakan opsi **Ubah Frasa Sandi...**. Perintah CLI yang setara adalah:

```bash
sudo minios-session change-passphrase <id>
```

Perintah ini meminta frasa sandi saat ini, frasa sandi baru, dan konfirmasi. Dengan `--password-stdin`, masukkan tiga baris tersebut sesuai urutan itu. Slot kunci yang dipilih akan diganti tanpa memformat ulang atau mengenkripsi ulang semua file. Sesi yang aktif, berjalan, atau terpasang harus dilepas terlebih dahulu; slot kunci LUKS tambahan yang dikelola di luar Session Manager tidak akan berubah.

Ekspor terenkripsi berisi file sesi logis yang telah didekripsi, bukan backend terenkripsi. Mengimpor, menyalin, atau mengonversi ke LUKS akan membuat backend terenkripsi baru dengan identitas baru.

## Memasang sesi yang tidak aktif

Session Manager dapat memasang sesi Raw, DynFileFS, DynBlk, atau VMDK yang tidak aktif dan tidak berjalan dengan akses baca-tulis tanpa menjadikannya sesi boot default. Klik kanan sesi, lalu pilih **Pasang Sesi**; sesi terenkripsi akan meminta frasa sandi LUKS. Beberapa sesi dengan ID berbeda dapat dipasang secara bersamaan. **Buka Folder Terpasang** akan membuka sistem file yang terpasang, sedangkan **Buka Folder Sesi** akan membuka direktori bernomor yang berisi file pendukungnya.

Menutup Session Manager tidak akan membongkar pemasangan yang dikelola GUI. Buka kembali aplikasi untuk melihatnya, lalu pilih **Lepas Sesi**. Jika proses pelepasan terhambat, MiniOS akan membiarkan daemon backend, perangkat loop, atau perangkat DynBlk tetap terhubung, alih-alih memutus penyimpanan yang masih digunakan oleh sistem file aktif.

CLI mandiri akan mempertahankan pemasangan hingga input standarnya ditutup atau menerima Ctrl+C:

```bash
sudo minios-session mount <id>
```

Perintah ini menolak sesi yang aktif atau sedang berjalan dan tidak akan pernah memformat sistem file yang sudah ada jika pemasangan gagal.

## Cadangan dan sesi yang gagal

Untuk sesi native, DynFileFS, DynBlk, VMDK, dan raw, termasuk yang terenkripsi, gunakan `export` untuk membuat cadangan logis, bukan menyalin direktori sesi yang terpasang. Simpan arsip yang dihasilkan di perangkat lain dan pastikan arsip tersebut dapat diimpor sebelum mengandalkannya. Impor selalu membuat sesi bernomor baru; aktifkan sesi tersebut secara eksplisit jika sudah siap digunakan.
Untuk prosedur pencadangan SquashFS dan seluruh perangkat, lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah penyimpanan penuh, penulisan terhenti, atau sesi kosong berulang kali dibuat, hentikan perubahan pada penyimpanan yang terdampak. Jika memungkinkan, ekspor terlebih dahulu sesi yang dapat dibaca dan tidak sedang berjalan, lalu ikuti panduan [Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa mengubah data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, sistem file kontainer diperiksa sebelum diaktifkan dengan akses tulis. Jika pemeriksaan sistem file menemukan masalah serius, kontainer akan dipertahankan untuk pemulihan, bukan dipasang dengan akses tulis. SquashFS mendeteksi keadaan sebelumnya yang tidak bersih dan memulihkan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan hapus direktori sesi secara manual.

## Mengembalikan DynFileFS, DynBlk, dan penyimpanan VMDK

Saat Anda menghapus file dalam sesi persisten, segmen `changes.dat`host **tidak** selalu menyusut. Sistem file ext4 di dalam mengetahui blok mana yang kosong, tetapi backend penyimpanannya mungkin masih menganggap blok tersebut terpakai. Tindakan **Free Space...** dimaksudkan untuk mengosongkan ruang di drive USB, bukan menambah kapasitas logis sesi.

Untuk DynFileFS, setiap operasi memiliki tujuan yang berbeda:

| Mekanisme | Alasan penggunaannya | Fungsi sebenarnya |
| --- | --- | --- |
| **TRIM / discard** | Anda menghapus file dari sesi ext4 yang tidak dienkripsi dan ingin backend mengetahui blok mana yang tidak lagi diperlukan. | `fstrim` memberi tahu DynFileFS tentang blok logis yang tidak terpakai. Blok utuh berukuran 4 KiB dapat dilepas petanya; rentang parsial diisi dengan nol. Slot fisik dapat digunakan kembali setelah tidak lagi direferensikan. Ini tidak sama dengan penghapusan aman. |
| **Pengosongan ruang otomatis dan pemangkasan bagian akhir** | Anda ingin sistem file host mendapatkan kembali ruang tanpa memindahkan data yang ada. | Setelah discard berhasil, DynFileFS dapat melepaskan rentang fisik yang tidak terpakai pada sistem file penyimpanan yang mendukung hole punching (seperti ext4), serta memangkas bagian akhir segmen yang sepenuhnya kosong. FAT32/exFAT umumnya tidak dapat melepaskan lubang di bagian tengah dengan cara ini. |
| **Pengosongan ruang** (default **Free Space...**) | Anda telah menghapus file dan ingin membersihkan ruang tanpa memindahkan data, termasuk memulihkan slot tak terpakai yang tersisa dari pemasangan sebelumnya. | Session Manager menjalankan FITRIM pada sistem file ext4 di dalam dan memanggil `dynfilefs --reclaim`. Tindakan ini mungkin mengembalikan ruang ke host, atau hanya membuat slot fisik dapat digunakan kembali di dalam kontainer. Tindakan ini **tidak** memindahkan blok yang masih digunakan. |
| **Pemadatan** (`--compact`) | Anda menggunakan FAT32/exFAT atau memiliki file segmen yang terfragmentasi dengan slot kosong yang berada *sebelum* data yang masih digunakan, sehingga pembersihan tanpa pemindahan tidak dapat memangkas file. | Memindahkan blok yang masih digunakan ke slot kosong bernomor lebih rendah, lalu memangkas bagian akhir yang kosong jika memungkinkan. Proses ini dapat menyebabkan banyak penulisan tambahan dan memerlukan waktu jauh lebih lama; gunakan hanya jika pemulihan ruang host sepadan dengan biayanya. |

**Mana yang harus dipilih?** Biasanya pilih **Free Space...** tanpa pemadatan setelah menghapus banyak data. Periksa ruang kosong sebenarnya di drive USB setelahnya. Aktifkan **Pemadatan** hanya jika file penyimpanan tetap berukuran besar meski ada ruang kosong di dalam sesi, terutama pada FAT32/exFAT. Jika tidak ada yang dihapus atau penyimpanan sudah penuh, pengosongan ruang dan pemadatan mungkin tidak memulihkan ruang apa pun. Jangan anggap operasi ini sebagai perawatan SSD rutin atau pengganti pencadangan.

**Batasan:** Penghapusan file saja tidak membuktikan bahwa bloknya telah di-discard; sistem file di dalam harus melaporkan blok yang tidak terpakai. Sesi LUKS terenkripsi tidak meneruskan discard secara otomatis melalui lapisan enkripsi. Dukungan sistem file penyimpanan dan tata letak blok yang masih digunakan menentukan seberapa banyak ruang yang benar-benar dapat dikembalikan. Opsi boot `perchtoram=trim` tidak terkait: opsi ini menentukan sesi mana yang disalin ke RAM, bukan discard sistem file.

Di Session Manager, klik kanan DynFileFS, DynBlk, atau sesi VMDK, lalu pilih **Kosongkan Ruang...**. Dialog ini dapat digunakan untuk sesi yang didukung, baik yang sedang berjalan maupun tidak aktif, dan juga akan menggunakan kembali sesi yang sudah di-mount melalui Session Manager. Untuk sesi plaintext, MiniOS menjalankan FITRIM pada sistem file ext4 bagian dalam yang sebenarnya, lalu meminta backend pemiliknya mengembalikan ruang backing yang diketahui kosong. Sesi yang detached akan dilampirkan sementara dan dilepas hanya setelah sistem filenya berhasil di-unmount dengan bersih.

Snapshot DynFileFS dapat mempertahankan blok yang Anda hapus dari image kerja. Proses reclaim tidak pernah menghapus snapshot. Jika paket diperbarui saat daemon DynFileFS versi lama masih aktif, reboot dengan initrd yang telah diperbarui agar runtime saat ini digunakan untuk sesi boot tersebut.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

Kotak centang pemadatan **tidak dicentang secara default**, termasuk pada exFAT. Tidak ada
fallback pemadatan otomatis. Sesi terenkripsi hanya mengklaim kembali ruang yang sudah
diketahui oleh backend; operasi ini tidak mengaktifkan discard melalui LUKS atau
mengungkap pola alokasinya. Kesalahan perangkat dan kegagalan trim akan menghentikan operasi.

### Perintah driver tingkat rendah

Dengan backend VMDK native atau split DynBlk saat ini, membuang grain secara keseluruhan
membuat ruang yang ditempatinya dapat digunakan kembali. Pada filesystem ext4, rentang yang sudah tidak digunakan
juga dapat dibersihkan otomatis dengan membuang blok. Pada exFAT, pembersihan otomatis hanya memotong
bagian akhir file yang sepenuhnya kosong. **Pembersihan otomatis tidak pernah memindahkan data yang masih digunakan.**

Gunakan `fstrim` pada filesystem perubahan internal yang terpasang (bukan root gabungan AUFS/OverlayFS
) untuk melaporkan blok yang dihapus, lalu `dynblk reclaim /dev/dynblkN --execute` untuk
pembersihan tanpa pemindahan. Pilih perangkat sesi yang sebenarnya, bukan indeks yang diasumsikan.
Untuk meminta pemadatan di tempat yang intensif menulis secara manual, tambahkan `--compact`.
Fitur ini bekerja tanpa mengonversi image atau mengubah ukuran filesystem virtual;
operasi baca/tulis lain dapat berjalan di antara langkah-langkah pembebasan ruang. Fitur ini bukan fallback otomatis.
Opsional, `--scan-zeroes` membaca grain yang dipetakan dan tidak diaktifkan secara default.

Perintah ini juga tersedia di CLI initrd DynBlk yang telah dibangun ulang. Pemadatan otomatis saat
startup tidak diaktifkan. Sesi terenkripsi tetap menggunakan kebijakan discard yang sudah ada;
tool tidak akan diam-diam mengaktifkan penerusan discard dm-crypt.
Lampiran hanya-baca atau `cache=unsafe` tidak dapat dibebaskan ruangnya. Rentang yang dilaporkan telah dibuang
dan panjang yang dipotong tidak sama dengan ruang kosong filesystem yang diukur.

## Alur kerja sesi VMDK

VMDK adalah mode sesi terpisah, bukan codec kompresi baru. Buat, aktifkan,
ubah ukuran, ekspor/impor, salin, klon, dan konversi menggunakan perintah Session Manager yang sama
seperti mode container lainnya:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Arsip sesi berisi file logis dan metadata, bukan lampiran VMDK eksternal sembarang.
Sesi VMDK terkelola menggunakan `volume.vmdk`descriptor kanonis
beserta semua file `volume-sNNN.vmdk`pendampingnya. Jangan ganti nama bagian atau menyalin image yang sedang digunakan
di belakang driver. Beralih antara DynBlk native dan VMDK memerlukan
penyalinan/konversi secara eksplisit; mengubah `session_mode`secara manual bukanlah konversi.

Installer hanya menawarkan VMDK jika didukung runtime, dan menolak image sumber
yang initrd salinannya tidak memiliki kemampuan `vmdk-session-v1`. Perbarui CLI,
driver, tool sesi, dan skrip boot secara bersamaan sebelum membuat sesi VMDK.
