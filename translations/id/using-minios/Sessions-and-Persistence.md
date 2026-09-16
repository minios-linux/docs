---
updated: 2026-09-16
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sesi dan persistensi

Sesi MiniOS menyimpan perubahan yang dilakukan pada sistem live agar tetap ada setelah reboot. Setiap sesi adalah direktori bernomor di bawah `minios/changes/`; modul MiniOS hanya-baca tetap tidak berubah dan sesi yang dipilih menyediakan lapisan union filesystem yang dapat ditulis.

Gunakan Manajer Sesi MiniOS dari sistem MiniOS yang sedang berjalan:

```bash
minios-session-manager
```

Alat baris perintah yang setara adalah `minios-session`. Perintah yang memodifikasi membutuhkan hak administratif, sehingga contoh di bawah menggunakan `sudo`.

## Mode sesi

| Mode | Penyimpanan | Kendala utama | MiniOS lapisan LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Membutuhkan filesystem yang dapat ditulis dan mempertahankan metadata serta operasi Linux yang dapat dideteksi oleh MiniOS. Kapasitas mengikuti ruang cadangan yang tersedia; `perchsize` tidak berlaku. | Tidak |
| `dynfilefs` | ext4 yang dapat diperluas `virtual.dat` didukung oleh file segmen format-400 | Berfungsi pada filesystem POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis. Payload ringan, tetapi indeks pemetaan akan meningkat seiring kapasitas logis yang dideklarasikan. | Ya |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Membutuhkan CLI DynBlk, modul kernel, dan kemampuan initrd. Ukuran yang dibuat saat boot hingga 16 GiB secara default; batas format adalah 512 GiB. Pemetaan sparse RAM dianggarkan secara terpisah. | Ya |
| `raw` | Satu `changes.img` file berisi ext4 | Kapasitas logis tetap, hanya dapat bertambah secara eksplisit. Berfungsi pada filesystem POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis; FAT32 dibatasi hingga 4000 MiB. | Ya |
| `squashfs` | Snapshot terkompresi dalam `changes.sb`; upper runtime yang dapat ditulis direkonstruksi di RAM | `perchsize` tidak berlaku. Snapshot yang sudah ada dapat dipulihkan dari media yang didukung dan dapat ditulis, sedangkan penyimpanan persis membutuhkan filesystem staging yang mendukung POSIX. | Tidak |

Raw, DynFileFS, dan DynBlk dapat membawa lapisan enkripsi LUKS2 secara opsional. Backend penyimpanan tetap mengikuti mode sesi, dan metadata sesi mencatat enkripsi secara terpisah. DynFileFS dan raw yang dibuat dengan `minios-session` default ke 4000 MiB; DynBlk default ke 16 GiB. Nilai ukuran dialokasikan dalam MiB; `GB` dan `TB` akhiran mengonversi ke 1000 dan 1.000.000 MiB. Raw dibatasi hingga 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Data payload DynFileFS bertambah sesuai kebutuhan, tetapi indeks format-400-nya disesuaikan untuk kapasitas logis penuh dan memerlukan sekitar 2 MiB dari RAM ditambah sekitar 2 MiB ruang penyimpanan cadangan per GiB. Kapasitas DynBlk tipis dan pemetaan runtime-nya sparse: pemetaan padat memerlukan sekitar 8 MiB/GiB, sedangkan kapasitas virtual yang tidak terpakai tidak menggunakan chunk pemetaan. Driver DynBlk memilih anggaran pemetaan otomatis sekitar 25% dari RAM yang dapat digunakan, dibatasi hingga 4096 MiB; MiniOS tidak menimpa kebijakan tersebut. Penulisan aktual tetap dibatasi oleh ruang kosong filesystem bawah dan sumber daya backend. Operasi resize container hanya dapat memperbesar sesi; pengecilan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem persistensi tidak dapat merepresentasikan metadata Linux.
Gunakan DynBlk jika Anda membutuhkan perangkat blok kernel nyata dengan file backing tipis; driver dapat mempertahankan beberapa volume DynBlk independen secara bersamaan, dan Session Manager menggunakan path perangkat yang dikembalikan oleh driver, bukan mengasumsikan `/dev/dynblk0` tersedia.
Gunakan raw jika diperlukan alokasi tetap, tambahkan LUKS2 jika sesi harus dienkripsi, dan gunakan SquashFS untuk snapshot terkompresi yang persis.

Jalankan perintah berikut untuk memeriksa filesystem persistensi aktual dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat di media hanya-baca. Initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada dan disimpan di FAT, exFAT, atau NTFS yang dapat ditulis karena snapshot diekstrak ke ext4 upper sementara. Membuat atau menyimpan snapshot secara persis berbeda: workspace staging privatnya harus berada di filesystem POSIX yang sesuai dan dapat mempertahankan metadata Linux serta union whiteouts.

## Pemilihan boot

Setiap parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan opsi lanjutkan, baru, pilih, dan non-persisten. Penjelasan resmi mengenai pemilih, kompatibilitas, fallback, dan semantik aktivasi dapat ditemukan di [Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Makna |
|-----------|---------|
| `perch` | Gunakan jalur resume best-effort lama. Ini mencoba metadata default tetapi tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan metadata default dan, jika tidak ada atau tidak kompatibel, izinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku resume menu boot saat ini. |
| `perchdir=new` | Alokasikan sesi bernomor baru. |
| `perchdir=ask` | Pilih sesi yang sudah ada atau buat sesi baru saat boot. |
| `perchdir=<id>` | Pilih langsung sesi bernomor tersebut. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk `/dev/...` dan `label:...` format yang ditangani oleh initrd. |
| `perchmode=<mode>` | Setel `native`, `dynfilefs`, `dynblk`, `raw`, atau `squashfs`. |
| `perchencrypt=luks` | Enkripsi sesi Raw, DynFileFS, atau DynBlk yang baru dibuat dengan LUKS2. Sesi yang sudah ada hanya mendapatkan enkripsi dari metadata. |
| `perchcomp=<codec>` | Pilih kompresi backend DynBlk untuk sesi DynBlk baru. Kompresi akan dipaksa ke `none` saat DynBlk dibungkus dengan LUKS2. |
| `perchsize=<size>` | Atur ukuran kontainer baru atau lebih besar; nilai tanpa satuan dialokasikan dalam MiB dan `MB`, `GB`, dan `TB` akhiran juga diterima. |

Jika tidak ada mode yang ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan fallback ke DynFileFS. Kontainer raw baru secara default berukuran 4000 MiB. Sesi boot DynFileFS dan DynBlk baru tanpa `perchsize` akan menggunakan hingga 16 GiB; jika ruang cadangan kurang dari itu setelah menyisakan ruang aman, ukuran otomatis akan dikurangi. DynFileFS juga memperhitungkan overhead indeks dan batas RAM. Pertumbuhan eksplisit DynBlk dibatasi hingga 512 GiB.
Sesi SquashFS dapat diambil dari sistem yang sedang berjalan menggunakan Manajer Sesi MiniOS atau `minios-session create squashfs`. Penyiapan initrd hanya membuat metadata sesi generasi nol dan menyimpan upper layer yang dapat ditulis di RAM. Sistem yang sedang berjalan akan membuat `changes.sb` snapshot pertama sesuai permintaan atau saat shutdown.

Saat melanjutkan, MiniOS akan memeriksa versi, edisi, union filesystem, dan mode yang tercatat. Perintah literal `perchdir=resume` dapat membuat sesi baru daripada menggunakan default yang tidak ada atau tidak kompatibel. `perch` , pemilihan numerik langsung, dan permintaan resume lama lainnya tidak secara otomatis membuat pengganti tersebut.
Pemilihan interaktif akan menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot akan tetap berlanjut dengan upper RAM dan peringatan persistensi.

Penyimpanan sesi memiliki format berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat ID default dan ID yang sedang berjalan serta mode, versi, edisi, union filesystem, ukuran, status, dan pengaturan khusus mode untuk setiap sesi.
Ini adalah metadata persisten yang dikomit oleh implementasi boot, bukan bukti langsung status runtime saat ini. Jangan mengedit atau memindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Manajer Sesi MiniOS atau `minios-session`.

## Sesi aktif dan berjalan

Istilah-istilah berikut menjelaskan status yang berbeda:

- Sesi**aktif**adalah sesi default yang dipilih untuk boot berikutnya.
- Secara konsep,**berjalan**adalah sesi yang lapisan tulisnya benar-benar menyediakan persistensi untuk boot saat ini.

Field persistensi`running=`mencatat hubungan yang dimaksudkan tersebut. Crash, kegagalan pembuatan union, penyalinan store, atau shutdown yang terputus dapat membuatnya menjadi usang meski boot saat ini menggunakan RAM atau sesi lain. Operasi seperti penyimpanan SquashFS karena itu membutuhkan status boot saat ini yang dilindungi oleh initrd, terikat pada boot-ID, dan upper yang sudah ter-mount dan terverifikasi; mereka tidak mempercayai`running=`saja. Lihat[Status aktif, berjalan, dan boot saat ini](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Mengaktifkan sesi akan mengubah boot berikutnya dan tidak akan mengganti union filesystem yang sedang berjalan:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi langsung. Sesi yang sedang berjalan biasanya tidak dapat dihapus, diekspor, disalin, diubah ukuran, atau dikonversi. Pembersihan juga melindungi kedua ID.

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
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` tanpa mode akan memilih native. Pembuatan SquashFS akan menangkap perubahan aktif saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya secara default adalah `shutdown`; penyimpanan berkala secara default tidak aktif.

Simpan dan konfigurasikan sesi SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Interval berkala yang valid adalah `30`, `60`, `120`, `240`, dan `480` menit; `0` menonaktifkan penyimpanan berkala. Pengaturan shutdown dan periodik bersifat independen.

Ekspor dan impor `.tar.zst` arsip:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Hanya `.tar.zst` impor yang diterima. Path dan anggota arsip akan divalidasi, dan ekstraksi dibatasi. `--auto-convert` akan memilih mode yang kompatibel untuk sistem file saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin, dan konversi tidak didukung untuk sesi SquashFS; simpan snapshot dan salin seluruh direktori sesi yang tidak aktif sebagai gantinya.

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

`copy` adalah salinan sistem file secara logis dan selalu memberikan ID sesi baru. Dapat mengubah backend, kapasitas, atau enkripsi serta membuat identitas ext4 dan LUKS yang baru. `clone` secara fisik menyalin backend yang terlepas dan mempertahankan header LUKS, keyslot, UUID LUKS, dan UUID ext4. `convert` secara default akan menggantikan sumber; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target container.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize mendukung DynFileFS, DynBlk, dan sesi raw, termasuk yang terenkripsi, dan membutuhkan ukuran lebih besar dari ukuran saat ini. Resize DynBlk akan memperbesar perangkat blok virtual terlebih dahulu lalu memperluas filesystem ext4-nya; kapasitas virtual baru tidak dialokasikan di awal. Cleanup secara default berlaku untuk sesi yang berumur lebih dari 30 hari.

Semua perintah menerima `--json`, dan store sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Perilaku penyimpanan SquashFS

Sesi SquashFS akan diekstrak ke RAM untuk layer writable yang berjalan. Proses penyimpanan akan membangun ulang dan memvalidasi snapshot secara tepat, lalu menggantikan `changes.sb`.
Tidak ada generasi rollback yang disimpan. Simpan Sekarang tersedia dari ikon tray, Manajer Sesi MiniOS, atau `minios-session save` terlepas dari kebijakan otomatis.

Penyimpanan saat shutdown dilakukan oleh pemicu shutdown inti MiniOS dan `minios-squashfs-save` backend, sehingga tidak bergantung pada Manajer Sesi MiniOS terbuka atau terpasang. Penyimpanan berkala diperiksa setiap 30 menit oleh timer systemd atau worker SysV, keduanya memanggil backend autosave yang sama. Proses membangun ulang snapshot menggunakan CPU dan menulis snapshot secara penuh; interval satu jam atau lebih lama direkomendasikan.

Selama operasi RAM-backed SquashFS, snapshot SquashFS yang baru ditangkap dan diaktifkan dapat mengambil alih target penyimpanan yang sedang berjalan. Setelah penyerahan tersebut, snapshot lama yang berjalan dapat dihapus tanpa perlu reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk penyerahan SquashFS current-boot yang valid. Mode persistensi lain yang sedang berjalan tetap terlindungi dari penghapusan.

## Enkripsi

LUKS2 adalah lapisan opsional di atas Raw `changes.img`, DynFileFS `virtual.dat`, atau perangkat langsung DynBlk. Fitur ini hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt` berisi `luks-layer-v1` dan alat serta kapabilitas backend yang dipilih tersedia.

Pembuatan LUKS secara interaktif akan meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membaca dari input standar dengan `--password-stdin`.
Frasa sandi tidak dimasukkan ke dalam argumen perintah atau metadata sesi. Saat boot, initrd akan meminta frasa sandi melalui konsol. Tiga kali percobaan yang gagal akan menghentikan proses boot secara fatal; MiniOS tidak akan melanjutkan dengan plaintext, RAM, backend lain, atau sesi pengganti dalam permintaan yang sama.

Ekspor terenkripsi berisi file sesi logis yang sudah didekripsi, bukan backend yang terenkripsi. Proses impor, penyalinan, atau konversi ke LUKS akan membuat backend terenkripsi baru dengan identitas baru.

## Cadangan dan sesi gagal

Untuk sesi native, DynFileFS, DynBlk, dan sesi mentah, termasuk bentuk terenkripsi, gunakan `export` untuk pencadangan logis, bukan menyalin direktori sesi yang sudah di-mount. Simpan arsip hasilnya di perangkat lain dan pastikan arsip tersebut dapat diimpor sebelum mengandalkannya. Proses impor selalu membuat sesi baru dengan nomor berbeda; aktifkan sesi tersebut secara manual saat sudah siap digunakan.
Untuk prosedur pencadangan SquashFS dan seluruh perangkat, lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah penyimpanan penuh, penulisan terputus, atau sesi kosong terus-menerus dibuat, hentikan semua modifikasi pada penyimpanan yang terdampak. Ekspor terlebih dahulu sesi yang dapat dibaca dan tidak berjalan jika memungkinkan, lalu ikuti [Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa mengubah data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, sistem file container akan diperiksa sebelum aktivasi tulis. Jika terjadi kegagalan pemeriksaan sistem file yang serius, container akan dipertahankan untuk pemulihan dan tidak di-mount secara writable. SquashFS mendeteksi status sebelumnya yang tidak bersih dan mengembalikan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan hapus direktori sesi secara manual.
