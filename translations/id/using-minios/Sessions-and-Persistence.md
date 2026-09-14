---
updated: 2026-09-13
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

| Mode | Penyimpanan | Kendala utama |
|------|---------|------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Memerlukan filesystem POSIX yang dapat ditulis seperti ext2/3/4, Btrfs, XFS, F2FS, atau ReiserFS. |
| `dynfilefs` | Kontainer ext4 yang dapat diperluas dan dibagi menjadi beberapa file pendukung | Berfungsi pada filesystem POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. Memerlukan backend DynFileFS. |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Memerlukan CLI dynblk, modul kernel, dan kemampuan initrd. Ukuran virtual secara default 16 GiB dan dibatasi hingga 512 GiB. |
| `raw` | File `changes.img` berukuran tetap berisi ext4 | Berfungsi pada filesystem POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. |
| `luks` | File terenkripsi LUKS2 `changes.luks` berisi ext4 | Memerlukan `cryptsetup`, dukungan loop, dan hook LUKS initrd MiniOS. |
| `squashfs` | Snapshot terkompresi dalam `changes.sb` | Penyimpanan membutuhkan filesystem persistensi POSIX yang dapat mempertahankan link, kepemilikan, mode, xattrs, ACL, kapabilitas, dan whiteout. |

`dynfilefs`, `raw`, dan `luks` dibuat dengan `minios-session` secara default 4000 MiB; `dynblk` default 16 GiB. Nilai ukuran dialokasikan dalam MiB; `GB` dan `TB` akhiran mengonversi ke 1000 dan 1.000.000 MiB. Manajer Sesi MiniOS membatasi file raw dan LUKS hingga 4000 MiB pada FAT32. Kapasitas dynblk bersifat virtual dan tipis, bukan prealokasi, namun penulisan aktual tetap dibatasi oleh sisa ruang bebas filesystem bawah dan sumber daya dynblk. Operasi resize kontainer hanya bisa memperbesar sesi; pengecilan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem persistensi tidak dapat merepresentasikan metadata Linux.
Gunakan dynblk jika Anda membutuhkan perangkat blok kernel nyata dengan file pendukung tipis; driver dapat mempertahankan beberapa volume dynblk independen sekaligus, dan Manajer Sesi menggunakan path perangkat yang dikembalikan oleh driver, bukan mengasumsikan `/dev/dynblk0` tersedia.
Gunakan raw jika diperlukan alokasi tetap, LUKS jika sesi harus dienkripsi, dan SquashFS untuk snapshot terkompresi yang persis.

Jalankan perintah berikut untuk memeriksa filesystem persistensi yang sebenarnya dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat pada media hanya-baca. Initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada dan disimpan di FAT, exFAT, atau NTFS yang dapat ditulis karena snapshot akan diekstrak ke ext4 upper sementara. Namun, membuat atau menyimpan snapshot secara persis berbeda: workspace staging privatnya harus berada di filesystem POSIX yang sesuai dan dapat mempertahankan metadata Linux serta union whiteout.

## Pemilihan boot

Setiap parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan opsi lanjutkan, baru, pemilihan, dan non-persisten. Penjelasan resmi tentang pemilih, kompatibilitas, fallback, dan semantik aktivasi dapat ditemukan di[Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Makna |
|-----------|---------|
| `perch` | Gunakan jalur lanjutkan legacy best-effort. Akan mencoba default metadata namun tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan default metadata dan, jika tidak ada atau tidak kompatibel, izinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku lanjutkan menu boot saat ini. |
| `perchdir=new` | Alokasikan sesi baru dengan nomor. |
| `perchdir=ask` | Pilih sesi yang sudah ada atau buat sesi baru saat boot. |
| `perchdir=<id>` | Pilih langsung sesi bernomor tersebut. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk`/dev/...`dan`label:...`format yang didukung oleh initrd. |
| `perchmode=<mode>` | Atur`native`,`dynfilefs`,`dynblk`,`raw`,`luks`, atau`squashfs`. |
| `perchsize=<size>` | Atur ukuran kontainer baru atau lebih besar; nilai tanpa akhiran akan dialokasikan dalam MiB dan`MB`,`GB`, dan`TB`akhiran juga diterima. |

Jika mode tidak ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan fallback ke DynFileFS. Kontainer boot raw atau LUKS baru akan default ke 4000 MiB; sesi boot DynFileFS baru tanpa`perchsize`akan disesuaikan dari ruang yang tersedia dengan tetap menjaga cadangan keamanan. Sesi boot dynblk baru tanpa`perchsize`menggunakan default driver 16 GiB; pertumbuhan dynblk eksplisit dibatasi hingga 512 GiB.
Sesi SquashFS diambil dari sistem yang sedang berjalan menggunakan Manajer Sesi MiniOS atau`minios-session create squashfs`;`perchdir=new perchmode=squashfs`tidak membuat snapshot di initrd.

Saat melanjutkan, MiniOS akan memeriksa versi, edisi, union filesystem, dan mode yang tercatat. Nilai literal`perchdir=resume`dapat membuat sesi baru daripada menggunakan default yang tidak ada atau tidak kompatibel. Permintaan lanjutkan legacy tanpa parameter, pemilihan numerik langsung, dan lainnya tidak otomatis membuat pengganti tersebut.`perch`, pemilihan numerik langsung, dan permintaan lanjutkan legacy lainnya tidak otomatis membuat pengganti tersebut.
Pemilihan interaktif akan menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot biasanya akan lanjut dengan upper RAM dan peringatan persistensi.

Penyimpanan sesi memiliki format berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf`mencatat ID default dan running serta mode, versi, edisi, union filesystem, ukuran, status, dan pengaturan khusus mode untuk setiap sesi.
Ini adalah metadata persisten yang dicatat oleh implementasi boot, bukan bukti keadaan runtime saat ini. Jangan mengedit atau memindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Manajer Sesi MiniOS atau`minios-session`.

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

Daftar sesi dan inspeksi penyimpanan:

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` tanpa mode akan memilih native. Pembuatan SquashFS menangkap perubahan aktif saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya secara default adalah `shutdown`; penyimpanan berkala secara default nonaktif.

Simpan dan atur sesi SquashFS:

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
```

Hanya `.tar.zst` impor yang diterima. Path dan anggota arsip akan divalidasi, dan ekstraksi dibatasi. `--auto-convert` memilih mode yang kompatibel dengan filesystem saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin, dan konversi tidak didukung untuk sesi SquashFS; simpan snapshot dan salin seluruh direktori sesi yang tidak aktif.

Salin atau konversi sesi:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` selalu memberikan ID sesi baru. `convert` secara default menggantikan sumber; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target container.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Ubah ukuran didukung untuk sesi DynFileFS, dynblk, raw, dan LUKS, serta memerlukan ukuran lebih besar dari ukuran saat ini. Resize dynblk akan memperbesar perangkat blok virtual terlebih dahulu lalu memperluas filesystem ext4-nya; kapasitas virtual baru tidak akan dialokasikan sebelumnya. Pembersihan secara default berlaku untuk sesi yang berusia lebih dari 30 hari.

Semua perintah menerima `--json`, dan penyimpanan sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

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

Mode LUKS menyimpan filesystem ext4 langsung di dalam file LUKS2 `changes.luks`; tidak ada tabel partisi atau kontainer DynFileFS bertingkat. Opsi LUKS hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`, dan `losetup` tersedia.

Pembuatan LUKS secara interaktif akan meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membacanya dari standar input dengan `--password-stdin`.
Frasa sandi tidak dimasukkan ke dalam argumen perintah atau metadata sesi. Saat boot, initrd akan meminta frasa sandi di konsol dan tidak akan beralih ke penyimpanan tanpa enkripsi jika aktivasi gagal.

Ekspor LUKS berisi file sesi logis yang telah didekripsi, bukan `changes.luks`.
Impor atau konversi ke LUKS akan membuat kontainer terenkripsi baru.

## Cadangan dan sesi gagal

Untuk sesi native, DynFileFS, dynblk, raw, dan LUKS, gunakan `export` sebagai metode pencadangan, bukan menyalin direktori sesi yang sudah di-mount. Simpan arsip hasilnya di perangkat lain dan pastikan arsip tersebut bisa diimpor sebelum digunakan. Proses impor selalu membuat sesi baru dengan nomor unik; aktifkan secara manual saat sudah siap digunakan.
Untuk prosedur pencadangan SquashFS dan seluruh perangkat, lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah penyimpanan penuh, penulisan terputus, atau sesi kosong dibuat berulang kali, segera hentikan modifikasi pada penyimpanan yang terdampak. Ekspor terlebih dahulu sesi yang dapat dibaca dan tidak sedang berjalan jika memungkinkan, lalu ikuti [Pemecahan Masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa mengubah data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, filesystem kontainer akan diperiksa sebelum aktivasi dalam mode tulis. Jika terjadi kegagalan serius pada pemeriksaan filesystem, kontainer akan diamankan untuk pemulihan dan tidak di-mount secara writable. SquashFS mendeteksi status sebelumnya yang tidak bersih dan mengembalikan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan menghapus direktori sesi secara manual.
