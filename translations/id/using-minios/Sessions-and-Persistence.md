---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sesi dan persistensi

Sesi MiniOS menjaga perubahan yang dilakukan pada sistem live tetap ada setelah reboot. Setiap sesi adalah direktori bernomor di bawah `minios/changes/`; modul MiniOS hanya-baca tetap tidak berubah dan sesi yang dipilih menyediakan lapisan union filesystem yang dapat ditulis.

Gunakan Manajer Sesi MiniOS dari sistem MiniOS yang sedang berjalan:

```bash
minios-session-manager
```

Alat baris perintah yang setara adalah `minios-session`. Perintah yang memodifikasi memerlukan hak administratif, sehingga contoh di bawah menggunakan `sudo`.

## Mode sesi

| Mode | Penyimpanan | Kendala utama |
|------|-------------|----------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Membutuhkan filesystem POSIX yang dapat ditulis seperti ext2/3/4, Btrfs, XFS, F2FS, atau ReiserFS. |
| `dynfilefs` | Kontainer ext4 yang dapat diperluas dan dibagi menjadi file pendukung | Berjalan di POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. Membutuhkan backend DynFileFS. |
| `raw` | `changes.img` berukuran tetap berisi ext4 | Berjalan di POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. |
| `luks` | `changes.luks` terenkripsi LUKS2 berisi ext4 | Membutuhkan `cryptsetup`, dukungan loop, dan hook initrd LUKS MiniOS. |
| `squashfs` | Snapshot terkompresi di `changes.sb` | Penyimpanan membutuhkan filesystem persistensi POSIX yang dapat mempertahankan link, kepemilikan, mode, xattrs, ACL, kapabilitas, dan whiteouts. |

`dynfilefs`, `raw`, dan `luks` yang dibuat dengan `minios-session` secara default berukuran 4000 MiB. Nilai ukuran dialokasikan dalam MiB; akhiran `GB` dan `TB` mengonversi ke 1000 dan 1.000.000 MiB. Manajer Sesi MiniOS membatasi file raw dan LUKS hingga 4000 MiB pada FAT32. Jangan mengandalkan itu sebagai jaminan umum dari initrd: permintaan boot raw yang terlalu besar mungkin tetap dialokasikan dan gagal alih-alih diperkecil. Operasi resize kontainer hanya bisa memperbesar sesi; pengecilan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem persistensi tidak dapat merepresentasikan metadata Linux.
Gunakan raw jika diperlukan alokasi tetap, LUKS jika sesi harus dienkripsi, dan SquashFS untuk snapshot terkompresi yang persis.

Jalankan perintah berikut untuk memeriksa filesystem persistensi yang sebenarnya dan mode yang tersedia di atasnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat di media hanya-baca. Initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada dan disimpan di FAT, exFAT, atau NTFS yang dapat ditulis karena snapshot diekstrak ke ext4 upper sementara. Membuat atau menyimpan snapshot secara persis berbeda: workspace staging privatnya harus berada di filesystem POSIX yang sesuai dan dapat mempertahankan metadata Linux serta union whiteouts.

## Pemilihan boot

Setiap parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan entri lanjutkan, baru, pemilihan, dan non-persisten. Deskripsi standar mengenai pemilih, kompatibilitas, fallback, dan semantik aktivasi terdapat di [Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Makna |
|-----------|---------|
| `perch` | Gunakan jalur lanjutkan best-effort lama. Ini mencoba metadata default tetapi tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan metadata default dan, jika tidak ada atau tidak kompatibel, izinkan initrd untuk membuat pengganti baru yang kompatibel. Ini adalah perilaku lanjutkan menu boot saat ini. |
| `perchdir=new` | Alokasikan sesi baru dengan nomor. |
| `perchdir=ask` | Pilih sesi yang sudah ada atau buat sesi baru saat boot. |
| `perchdir=<id>` | Pilih langsung sesi bernomor tersebut. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk `/dev/...` dan `label:...` format yang ditangani oleh initrd. |
| `perchmode=<mode>` | Setel `native`, `dynfilefs`, `raw`, `luks`, atau `squashfs`. |
| `perchsize=<size>` | Atur ukuran kontainer baru atau lebih besar; nilai tanpa satuan akan dialokasikan dalam MiB dan `MB`, `GB`, dan `TB` akhiran diterima. |

Jika tidak ada mode yang ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan menggunakan DynFileFS jika gagal. Kontainer boot raw atau LUKS baru secara default berukuran 4000 MiB; sesi boot DynFileFS baru tanpa `perchsize` akan menyesuaikan ukuran dari ruang yang tersedia dengan tetap menjaga cadangan keamanan.
Sesi SquashFS diambil dari sistem yang sedang berjalan menggunakan Manajer Sesi MiniOS atau `minios-session create squashfs`; `perchdir=new perchmode=squashfs` tidak membuat snapshot di initrd.

Saat melanjutkan, MiniOS akan memeriksa versi yang tercatat, edisi, union filesystem, dan mode. Literal `perchdir=resume` dapat membuat sesi baru daripada menggunakan default yang tidak ada atau tidak kompatibel. Pilihan numerik langsung, `perch`, dan permintaan lanjutkan lama lainnya tidak secara otomatis membuat pengganti tersebut.
Pemilihan interaktif akan menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot biasanya akan berlanjut dengan upper RAM dan peringatan persistensi.

Penyimpanan sesi memiliki format berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat ID default dan yang sedang berjalan serta mode per sesi, versi, edisi, union filesystem, ukuran, status, dan pengaturan khusus mode.
Ini adalah metadata persisten yang dikomit oleh implementasi boot, bukan bukti langsung dari status runtime saat ini. Jangan mengedit atau memindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Manajer Sesi MiniOS atau `minios-session`.

## Sesi aktif dan berjalan

Istilah-istilah ini menjelaskan status yang berbeda:

- Sesi **aktif** adalah sesi yang akan dipilih secara default untuk boot berikutnya.
- Secara konsep, sesi **berjalan** adalah sesi yang lapisan writable-nya benar-benar menyediakan persistensi untuk boot saat ini.

Kolom persistent `running=` mencatat hubungan yang dimaksudkan tersebut. Crash, kegagalan konstruksi union, penyalinan store, atau shutdown yang terputus dapat membuatnya menjadi usang meskipun boot saat ini menggunakan RAM atau sesi lain. Operasi seperti penyimpanan SquashFS karena itu memerlukan status current-boot yang dilindungi oleh initrd, terikat boot-ID, dan upper yang sudah terpasang serta terverifikasi; operasi ini tidak hanya mengandalkan `running=` saja. Lihat [Status aktif, berjalan, dan current-boot](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Mengaktifkan sesi akan mengubah boot berikutnya dan tidak mengganti union filesystem yang sedang berjalan:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi secara langsung. Sesi yang sedang berjalan biasanya tidak dapat dihapus, diekspor, disalin, diubah ukuran, atau dikonversi. Proses pembersihan juga melindungi kedua ID tersebut.

## Referensi perintah

Daftar sesi dan inspeksi store:

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

`create` tanpa mode akan memilih native. Pembuatan SquashFS akan menangkap perubahan live saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya secara default adalah `shutdown`; penyimpanan berkala secara default nonaktif.

Simpan dan atur sesi SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
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
```

Hanya impor `.tar.zst` yang diterima. Path dan anggota arsip divalidasi, dan ekstraksi dibatasi. `--auto-convert` akan memilih mode yang kompatibel untuk filesystem saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin, dan konversi tidak didukung untuk sesi SquashFS; simpan snapshot dan salin seluruh direktori sesi nonaktif sebagai gantinya.

Salin atau konversi sesi:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` selalu memberikan ID sesi baru. `convert` secara default akan menggantikan sumber; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target kontainer.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Ubah ukuran mendukung sesi DynFileFS, raw, dan LUKS serta memerlukan ukuran lebih besar dari ukuran saat ini. Pembersihan secara default berlaku untuk sesi yang lebih lama dari 30 hari.

Semua perintah menerima `--json`, dan store sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Perilaku penyimpanan SquashFS

Sesi SquashFS diekstrak ke RAM untuk lapisan tulis yang berjalan. Penyimpanan akan membangun ulang dan memvalidasi snapshot yang persis, lalu menggantikan `changes.sb`.
Tidak ada generasi rollback yang disimpan. Simpan Sekarang tersedia dari ikon tray, Manajer Sesi MiniOS, atau `minios-session save` terlepas dari kebijakan otomatis.

Penyimpanan saat shutdown diimplementasikan oleh pemicu shutdown inti MiniOS dan backend `minios-squashfs-save`, sehingga tidak bergantung pada Manajer Sesi MiniOS terbuka atau terinstal. Penyimpanan berkala diperiksa setiap 30 menit oleh timer systemd atau worker SysV, keduanya memanggil backend autosave yang sama. Pembangunan ulang snapshot menggunakan CPU dan menulis seluruh snapshot; interval satu jam atau lebih lama direkomendasikan.

Selama operasi RAM yang didukung SquashFS, snapshot SquashFS yang baru diambil dan diaktifkan dapat mengambil alih target penyimpanan yang sedang berjalan. Setelah penyerahan tersebut, snapshot lama yang sedang berjalan dapat dihapus tanpa reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk penyerahan SquashFS boot saat ini yang valid. Mode persistensi lain yang sedang berjalan tetap terlindungi dari penghapusan.

## Enkripsi

Mode LUKS menyimpan filesystem ext4 langsung di file LUKS2 `changes.luks`; tidak ada tabel partisi atau kontainer DynFileFS di dalamnya. Pilihan LUKS hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`, dan `losetup` tersedia.

Pembuatan LUKS interaktif meminta kata sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membacanya dari standar input dengan `--password-stdin`.
Kata sandi tidak ditempatkan di argumen perintah atau metadata sesi. Saat boot, initrd akan meminta kata sandi di konsol dan tidak akan beralih ke persistensi tidak terenkripsi jika aktivasi gagal.

Ekspor LUKS berisi file sesi logis yang telah didekripsi, bukan `changes.luks`.
Impor atau konversi ke dalam LUKS akan membuat kontainer terenkripsi baru.

## Cadangan dan sesi gagal

Untuk sesi native, DynFileFS, raw, dan LUKS, gunakan `export` untuk pencadangan, bukan menyalin direktori sesi yang sedang ter-mount. Simpan arsip hasilnya di perangkat lain dan pastikan dapat diimpor sebelum mengandalkannya. Impor selalu membuat sesi baru dengan nomor; aktifkan secara eksplisit saat siap digunakan.
Untuk prosedur pencadangan SquashFS dan seluruh perangkat, lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah media penuh, penulisan terganggu, atau sesi kosong dibuat berulang kali, hentikan modifikasi pada media yang terdampak. Ekspor terlebih dahulu sesi nonaktif yang masih bisa dibaca jika memungkinkan, lalu ikuti [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa memodifikasi data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, filesystem kontainer akan diperiksa sebelum aktivasi tulis. Kegagalan pemeriksaan filesystem yang serius akan mempertahankan kontainer untuk pemulihan, bukan me-mount secara tulis. SquashFS mendeteksi status sebelumnya yang tidak bersih dan mengembalikan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan hapus direktori sesi secara manual.
