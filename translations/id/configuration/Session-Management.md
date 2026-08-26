---
updated: 2026-08-26
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Manajemen sesi di MiniOS

Sesi MiniOS mempertahankan perubahan yang dilakukan pada sistem live setelah reboot. Setiap sesi adalah direktori bernomor di bawah `minios/changes/`; modul MiniOS yang hanya-baca tetap tidak berubah dan sesi yang dipilih menyediakan lapisan union filesystem yang dapat ditulis.

Gunakan Session Manager dari sistem MiniOS yang sedang berjalan:

```bash
minios-session-manager
```

Alat baris perintah yang setara adalah `minios-session`. Perintah-perintah yang memodifikasi membutuhkan hak administratif, sehingga contoh di bawah ini menggunakan `sudo`.

## Mode sesi

| Mode | Penyimpanan | Kendala utama |
|------|-------------|------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Memerlukan filesystem POSIX yang dapat ditulis seperti ext2/3/4, Btrfs, XFS, F2FS, atau ReiserFS. |
| `dynfilefs` | Kontainer ext4 yang dapat diperluas dan dibagi menjadi file pendukung | Berjalan di filesystem POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. Memerlukan backend DynFileFS. |
| `raw` | `changes.img` berukuran tetap yang berisi ext4 | Berjalan di filesystem POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. |
| `luks` | `changes.luks` terenkripsi LUKS2 yang berisi ext4 | Memerlukan `cryptsetup`, dukungan loop, dan hook LUKS initrd MiniOS. |
| `squashfs` | Snapshot terkompresi di `changes.sb` | Penyimpanan memerlukan filesystem persisten POSIX yang dapat mempertahankan link, kepemilikan, mode, xattrs, ACL, capabilities, dan whiteout. |

`dynfilefs`, `raw`, dan `luks` yang dibuat dengan `minios-session` secara default berukuran 4000
MiB. Nilai ukuran dialokasikan dalam MiB; akhiran `GB` dan `TB` mengkonversi ke 1000
dan 1.000.000 MiB. Session Manager membatasi file raw dan LUKS hingga 4000 MiB pada
FAT32. Jangan mengandalkan hal itu sebagai jaminan umum initrd: permintaan boot raw yang terlalu besar bisa tetap dialokasikan
dan gagal daripada diperkecil. Operasi resize kontainer hanya dapat memperbesar sesi;
pengecilan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS ketika filesystem persisten tidak dapat merepresentasikan metadata Linux.
Gunakan raw saat alokasi tetap diperlukan, LUKS ketika sesi harus dienkripsi, dan SquashFS untuk snapshot terkompresi yang persis.

Jalankan perintah berikut untuk memeriksa filesystem persisten yang sebenarnya dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat di media hanya-baca. Initrd dapat membaca dan mengaktifkan
snapshot SquashFS yang sudah ada yang disimpan di FAT, exFAT, atau NTFS yang dapat ditulis karena
snapshot tersebut diekstrak ke ext4 upper sementara. Membuat atau menyimpan snapshot secara persis berbeda: workspace staging privatnya harus berada di filesystem POSIX yang sesuai yang dapat mempertahankan metadata Linux dan union whiteout.

## Pemilihan boot

Setiap parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan entri resume, baru, pemilihan, dan non-persisten. Deskripsi kanonik tentang selektor, kompatibilitas, fallback, dan semantik aktivasi ada di [Initrd persistence](./Initrd-Persistence.md).

| Parameter | Arti |
|-----------|------|
| `perch` | Gunakan jalur resume best-effort lama. Mencoba default metadata tetapi tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Melanjutkan default metadata dan, jika tidak ada atau tidak kompatibel, memungkinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku resume menu boot saat ini. |
| `perchdir=new` | Alokasikan sesi baru dengan nomor urut. |
| `perchdir=ask` | Pilih sesi yang sudah ada atau buat satu saat boot. |
| `perchdir=<id>` | Pilih sesi bernomor tersebut secara langsung. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk bentuk `/dev/...` dan `label:...` yang ditangani oleh initrd. |
| `perchmode=<mode>` | Setel `native`, `dynfilefs`, `raw`, `luks`, atau `squashfs`. |
| `perchsize=<size>` | Setel ukuran kontainer baru atau lebih besar; nilai tanpa akhiran dialokasikan dalam MiB dan akhiran `MB`, `GB`, dan `TB` diterima. |

Jika tidak ada mode yang ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan fallback ke DynFileFS. Kontainer boot raw atau LUKS baru secara default berukuran 4000 MiB; sesi boot DynFileFS baru tanpa `perchsize` akan disesuaikan dari ruang yang tersedia sambil mempertahankan cadangan keamanan.
Sesi SquashFS diambil dari sistem yang sedang berjalan menggunakan Session Manager atau `minios-session create squashfs`; `perchdir=new perchmode=squashfs` tidak membuat snapshot di initrd.

Saat resume, MiniOS memeriksa versi, edisi, union filesystem, dan mode yang tercatat. Literal `perchdir=resume` dapat membuat sesi baru alih-alih menggunakan default yang tidak ada atau tidak kompatibel. `perch` tanpa embel-embel, pemilihan numerik langsung, dan permintaan resume lama lainnya tidak secara otomatis membuat pengganti tersebut.
Pemilihan interaktif akan menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot akan tetap berlanjut dengan RAM upper dan peringatan persistensi.

Penyimpanan sesi memiliki bentuk seperti berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat ID default dan yang sedang berjalan serta mode per sesi, versi, edisi, union filesystem, ukuran, status, dan pengaturan khusus mode.
Ini adalah metadata persisten yang dikomit oleh implementasi boot, bukan bukti keadaan runtime saat ini. Jangan mengedit atau memindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Session Manager atau `minios-session`.

## Sesi aktif dan berjalan

Istilah-istilah ini menggambarkan status yang berbeda:

- **Sesi aktif** adalah sesi yang secara default akan dipilih untuk boot berikutnya.
- Secara konsep, **sesi berjalan** adalah sesi yang lapisan writablenya
  benar-benar menyediakan persistensi untuk boot saat ini.

Field persisten `running=` mencatat hubungan yang dimaksudkan tersebut. Crash,
gagal membangun union, store yang disalin, atau shutdown yang terputus dapat membuatnya
tidak sinkron meskipun boot saat ini menggunakan RAM atau sesi lain. Oleh karena itu, operasi
seperti penyimpanan SquashFS memerlukan status current-boot yang dilindungi oleh initrd,
terikat pada boot-ID, dan upper yang sudah terpasang serta terverifikasi; mereka tidak hanya
mengandalkan `running=`. Lihat [Status aktif, berjalan, dan current-boot](./Initrd-Persistence.md).

Mengaktifkan sesi akan mengubah boot berikutnya dan tidak akan mengganti
filesystem union saat ini:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi secara langsung. Sesi berjalan
biasanya tidak dapat dihapus, diekspor, disalin, diubah ukuran, atau dikonversi. Pembersihan
juga melindungi kedua ID tersebut.

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

`create` tanpa mode akan memilih native. Pembuatan SquashFS menangkap perubahan langsung saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown secara default menggunakan `shutdown`; penyimpanan berkala secara default nonaktif.

Simpan dan konfigurasi sesi SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Interval berkala yang valid adalah `30`, `60`, `120`, `240`, dan `480` menit; `0` menonaktifkan penyimpanan berkala. Pengaturan shutdown dan periodik bersifat independen.

Ekspor dan impor arsip `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Hanya impor `.tar.zst` yang diterima. Path dan anggota arsip akan divalidasi, dan ekstraksi dibatasi. `--auto-convert` memilih mode yang kompatibel untuk filesystem saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin, dan konversi tidak didukung untuk sesi SquashFS; simpan snapshot dan salin seluruh direktori sesi yang tidak aktif sebagai gantinya.

Salin atau konversi sesi:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
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

Resize mendukung sesi DynFileFS, raw, dan LUKS dan memerlukan ukuran lebih besar dari ukuran saat ini. Cleanup secara default untuk sesi yang lebih dari 30 hari.

Semua perintah menerima `--json`, dan store sesi yang berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Perilaku penyimpanan SquashFS

Sesi SquashFS diekstrak ke dalam RAM untuk lapisan writable yang sedang berjalan. Proses penyimpanan akan membangun ulang dan memvalidasi snapshot yang persis, lalu secara atomik menggantikan `changes.sb`. Tidak ada generasi rollback yang disimpan. Save Now tersedia dari ikon tray, Session Manager, atau `minios-session save` terlepas dari kebijakan otomatis.

Penyimpanan saat shutdown diimplementasikan oleh trigger shutdown inti MiniOS dan backend `minios-squashfs-save`, sehingga tidak bergantung pada Session Manager yang sedang terbuka atau terpasang. Penyimpanan periodik dicek setiap 30 menit oleh timer systemd atau worker SysV, keduanya memanggil backend autosave yang sama. Proses rebuild snapshot akan menggunakan CPU dan menulis seluruh snapshot; interval satu jam atau lebih lama sangat disarankan.

Selama operasi SquashFS berbasis RAM, snapshot SquashFS yang baru di-capture dan diaktifkan dapat mengambil alih target penyimpanan yang sedang berjalan. Setelah proses handoff tersebut, snapshot yang sedang berjalan sebelumnya dapat dihapus tanpa reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk handoff SquashFS yang valid pada boot saat ini. Mode persistensi lain yang sedang berjalan tetap terlindungi dari penghapusan.

## Enkripsi

Mode LUKS menyimpan filesystem ext4 secara langsung di file `changes.luks` LUKS2; tidak ada tabel partisi atau kontainer DynFileFS bersarang. Opsi LUKS hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup`, dan `losetup` tersedia.

Pembuatan LUKS interaktif meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membacanya dari standard input dengan `--password-stdin`. Frasa sandi tidak ditempatkan di argumen perintah atau metadata sesi. Saat boot, initrd akan meminta frasa sandi di konsol dan tidak akan beralih ke persistensi tidak terenkripsi jika aktivasi gagal.

Ekspor LUKS berisi file sesi logis yang telah didekripsi, bukan `changes.luks`. Impor atau konversi ke LUKS akan membuat kontainer terenkripsi baru.

## Cadangan dan pemulihan

Untuk sesi native, DynFileFS, raw, dan LUKS, gunakan `export` untuk backup daripada menyalin direktori sesi yang sedang ter-mount. Simpan arsip hasilnya di perangkat lain dan pastikan arsip tersebut dapat dilihat atau diimpor sebelum mengandalkannya. Impor selalu membuat sesi baru dengan nomor; aktifkan secara eksplisit ketika sudah siap digunakan. Untuk prosedur backup SquashFS dan seluruh perangkat, lihat [Backup dan pemulihan](/administration/Backup-Recovery.md).

Untuk pemulihan setelah perangkat penyimpanan penuh, penulisan yang terputus, atau pembuatan sesi kosong berulang, ikuti panduan khusus [Pemulihan DynFileFS dan dynblk](./DynFileFS-Recovery.md).

Mulai diagnosis tanpa memodifikasi data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, filesystem container akan diperiksa sebelum aktivasi writable. Kegagalan pemeriksaan filesystem yang serius akan mempertahankan container untuk pemulihan, bukan me-mount-nya dalam mode writable. SquashFS mendeteksi status sebelumnya yang tidak bersih dan mengembalikan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Session Manager atau `minios-session delete`; jangan menghapus direktori sesi secara manual.
