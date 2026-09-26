---
updated: 2026-09-26
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

| Mode | Penyimpanan | Keterbatasan utama | MiniOS lapisan LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Perubahan disimpan langsung di direktori sesi | Membutuhkan filesystem yang dapat ditulis dan mampu mempertahankan metadata serta operasi Linux yang dipantau oleh MiniOS. Kapasitas mengikuti ruang bebas pada media penyimpanan; `perchsize` tidak berlaku. | Tidak |
| `dynfilefs` | ext4 yang dapat diperluas `virtual.dat` didukung oleh file segmen format-400 | Berfungsi di filesystem POSIX yang dapat ditulis, FAT32, NTFS, dan exFAT. Payload ringan, namun indeks pemetaan bertambah sesuai kapasitas logis yang ditentukan. | Ya |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Membutuhkan CLI DynBlk, modul kernel, dan kemampuan initrd. Ukuran yang dibuat saat booting hingga 16 GiB secara default; maksimum dilaporkan oleh `dynblk limits`. Pemetaan yang berada di disk menggunakan cache metadata terbatas. | Ya |
| `vmdk` | Filesystem ext4 tipis pada VMDK sparse split standar, diekspos oleh driver DynBlk | Menggunakan `volume.vmdk` dan `volume-sNNN.vmdk`. Tanpa kompresi. Membutuhkan `vmdk-session-v1` pada penanda kemampuan initrd yang berjalan. Default manual 16 GiB sama seperti DynBlk; cek `dynblk limits --format vmdk` untuk batasnya. | Ya |
| `raw` | Satu `changes.img` file berisi ext4 | Kapasitas logis tetap, hanya dapat bertambah secara eksplisit. Berfungsi di filesystem POSIX, FAT32, NTFS, dan exFAT yang dapat ditulis; FAT32 terbatas hingga 4000 MiB. | Ya |
| `squashfs` | Snapshot terkompresi dalam `changes.sb`; upper writable runtime direkonstruksi di RAM | `perchsize` tidak berlaku. Snapshot yang sudah ada dapat dipulihkan dari media tulis yang didukung; penyimpanan persis membutuhkan penyimpanan persisten yang mendukung POSIX. | Tidak |

Raw, DynFileFS, DynBlk, dan VMDK dapat menggunakan lapisan enkripsi LUKS2 secara opsional. Backend penyimpanan tetap mengikuti mode sesi, dan metadata sesi mencatat enkripsi secara terpisah. DynFileFS dan raw yang dibuat dengan `minios-session` default 4000 MiB; DynBlk dan VMDK default 16 GiB. Nilai ukuran dialokasikan dalam MiB; `GB` dan `TB` akhiran mengonversi ke 1000 dan 1.000.000 MiB. Raw dibatasi hingga 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Data payload DynFileFS bertambah sesuai kebutuhan, namun indeks format-400-nya disesuaikan dengan kapasitas logis penuh dan memerlukan sekitar 2 MiB RAM ditambah sekitar 2 MiB penyimpanan per GiB. DynBlk menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM, default 1 MiB bukan persentase dari RAM. Vektor extent/file dan direktori bertambah sesuai bagian yang dideklarasikan, sedangkan pengisian payload tidak memerlukan peta penuh yang selalu aktif. Cek batas kapasitas terpasang dengan `dynblk limits --format dynblk`. Penulisan aktual tetap dibatasi oleh ruang bebas filesystem bawah dan sumber daya backend. Operasi resize container hanya dapat menambah sesi; pengurangan tidak didukung.

Mode native adalah pilihan paling sederhana dan tercepat pada filesystem yang kompatibel.
Gunakan DynFileFS jika filesystem persistence tidak dapat merepresentasikan metadata Linux.
Gunakan DynBlk jika Anda membutuhkan perangkat blok kernel nyata dengan file backing tipis; driver dapat menahan beberapa volume DynBlk independen secara bersamaan, dan Session Manager menggunakan path device yang dikembalikan oleh driver, bukan mengasumsikan `/dev/dynblk0` tersedia. DynBlk dan VMDK tidak tersedia saat UEFI Secure Boot aktif karena MiniOS tidak menandatangani modul kernel eksternal DynBlk. Installer dan Session Manager akan menyembunyikan mode ini dan menolak permintaan pembuatan eksplisit sebelum mencoba memuat modul.
Gunakan raw jika membutuhkan alokasi tetap, tambahkan LUKS2 jika sesi harus terenkripsi, dan gunakan SquashFS untuk snapshot terkompresi yang presisi.

Jalankan perintah berikut untuk memeriksa filesystem persistence aktual dan mode yang tersedia di dalamnya:

```bash
sudo minios-session info
sudo minios-session status
```

Tidak ada sesi yang dapat dibuat pada media hanya-baca. Initrd dapat membaca dan mengaktifkan snapshot SquashFS yang sudah ada dan disimpan di FAT, exFAT, atau NTFS yang dapat ditulis karena snapshot akan diekstrak ke ext4 upper sementara. Membuat atau menyimpan snapshot secara presisi berbeda: penyimpanan persistence harus mendukung metadata POSIX yang dibutuhkan serta publikasi privat dan tahan lama. Working tree exact-capture menggunakan RAM terpercaya jika tersedia, dengan fallback workspace disk jika RAM tidak mencukupi.

## Pemilihan boot

Setiap parameter persistensi yang dikenali akan mengaktifkan penanganan persistensi. Menu boot MiniOS biasanya menyediakan entri resume, baru, pemilihan, dan non-persisten. Deskripsi kanonik tentang selector, kompatibilitas, fallback, dan semantik aktivasi ada di [Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Parameter | Makna |
|-----------|---------|
| `perch` | Gunakan jalur resume best-effort lama. Akan mencoba default metadata tetapi tidak membuat pengganti jika tidak ada yang dapat digunakan. |
| `perchdir=resume` | Lanjutkan ke default metadata dan, jika tidak ada atau tidak kompatibel, izinkan initrd membuat pengganti baru yang kompatibel. Ini adalah perilaku resume pada menu boot saat ini. |
| `perchdir=new` | Membuat sesi bernomor yang baru. |
| `perchdir=ask` | Pilih sesi yang sudah ada atau buat satu saat boot. |
| `perchdir=<id>` | Pilih sesi bernomor tersebut secara langsung. |
| `perchdir=<device/path>` | Gunakan lokasi persistensi pada perangkat, termasuk `/dev/...` dan `label:...` bentuk yang ditangani oleh initrd. |
| `perchmode=<mode>` | Setel `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, atau `squashfs`. |
| `perchencrypt=luks` | Enkripsi sesi Raw, DynFileFS, DynBlk, atau VMDK yang baru dibuat dengan LUKS2. Sesi yang sudah ada hanya mengambil enkripsi dari metadata. |
| `perchcomp=<codec>` | Pilih kompresi backend DynBlk untuk sesi DynBlk yang baru. Kompresi dipaksa ke `none` saat DynBlk dibungkus dalam LUKS2. |
| `perchsize=<size>` | Setel ukuran kontainer baru atau lebih besar; nilai tanpa akhiran dialokasikan dalam MiB dan `MB`, `GB`, dan `TB` akhiran diterima. |

Jika tidak ada mode yang ditentukan untuk sesi baru, boot akan menggunakan mode native. Pada FAT32/NTFS/exFAT, pembuatan boot native akan fallback ke DynFileFS. Kontainer raw baru default ke 4000 MiB. Sesi boot DynFileFS, DynBlk, dan VMDK baru tanpa `perchsize` menggunakan hingga 16 GiB; jika ruang penyimpanan tersisa setelah cadangan keamanan lebih sedikit, ukuran otomatis akan dikurangi. DynFileFS juga memperhitungkan overhead indeks dan batas RAM. Pertumbuhan DynBlk eksplisit mengikuti batas backend terpasang, dicek dengan `dynblk limits --format dynblk`. Pada Secure Boot, initrd tidak menawarkan DynBlk/VMDK dan memperlakukan sesi DynBlk/VMDK eksplisit atau resume sebagai tidak tersedia, bukan mencoba memuat modul yang tidak ditandatangani.
Sesi SquashFS dapat di-capture dari sistem yang sedang berjalan menggunakan Manajer Sesi MiniOS atau `minios-session create squashfs`. Setup initrd hanya membuat metadata sesi generasi-nol dan menjaga upper layer writable di RAM. Sistem yang berjalan membuat `changes.sb` snapshot pertama sesuai permintaan atau saat shutdown.

Saat melanjutkan, MiniOS akan memeriksa versi, edisi, filesystem union, dan mode yang tercatat. `perchdir=resume` literal dapat membuat sesi baru daripada menggunakan default yang tidak ada atau tidak kompatibel. `perch` kosong, pemilihan numerik langsung, dan permintaan resume lama lainnya tidak otomatis membuat pengganti tersebut.
Pemilihan interaktif akan menampilkan peringatan sebelum mengizinkan sesi yang tidak kompatibel. Jika pemilihan atau aktivasi tetap gagal, boot akan tetap berjalan dengan upper RAM dan peringatan persistensi.

Store sesi memiliki bentuk berikut:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` mencatat default dan ID yang berjalan serta mode, versi, edisi, filesystem union, ukuran, status, dan pengaturan spesifik mode per sesi.
Ini adalah metadata persisten yang dikomit oleh implementasi boot, bukan bukti status runtime saat ini. Jangan edit atau pindahkan data sesi bernomor saat sesi sedang ter-mount; gunakan Manajer Sesi MiniOS atau `minios-session`.

## Sesi aktif dan berjalan

Istilah-istilah berikut menjelaskan status yang berbeda:

- Sesi**aktif**adalah sesi default yang dipilih untuk boot berikutnya.
- Secara konsep,**berjalan**adalah sesi yang lapisan tulisnya benar-benar menyediakan persistensi untuk boot saat ini.

Field persistensi`running=`mencatat hubungan yang dimaksudkan tersebut. Crash, kegagalan pembuatan union, penyalinan store, atau shutdown yang terputus dapat membuatnya menjadi usang meski boot saat ini menggunakan RAM atau sesi lain. Operasi seperti penyimpanan SquashFS karena itu membutuhkan status boot saat ini yang dilindungi oleh initrd, terikat pada boot-ID, dan upper yang sudah ter-mount dan terverifikasi; mereka tidak mempercayai`running=`saja. Lihat[Status aktif, berjalan, dan boot saat ini](/reference/boot-process/Persistence-Internals#status-aktif-berjalan-dan-boot-saat-ini).

Mengaktifkan sesi akan mengubah boot berikutnya dan tidak akan mengganti union filesystem yang sedang berjalan:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

Sesi aktif tidak dapat dihapus atau dikonversi langsung. Sesi yang sedang berjalan biasanya tidak dapat dihapus, diekspor, disalin, diubah ukuran, atau dikonversi. Pembersihan juga melindungi kedua ID.

## Referensi perintah

Daftar sesi dan periksa penyimpanan:

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

`create` tanpa mode akan memilih native. Pembuatan SquashFS menangkap perubahan live saat ini dan tidak memiliki ukuran tetap. Kebijakan shutdown-nya default ke `shutdown`; penyimpanan berkala default nonaktif.

Simpan dan konfigurasikan sesi SquashFS:

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
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Hanya `.tar.zst` impor yang diterima. Path dan anggota arsip divalidasi, dan ekstraksi dibatasi. `--auto-convert` memilih mode yang kompatibel untuk filesystem saat ini. `--force-mode <mode>` secara eksplisit memilih mode yang tersedia. Ekspor, salin, dan konversi tidak didukung untuk sesi SquashFS; simpan snapshot dan salin seluruh direktori sesi nonaktif sebagai gantinya.

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

`copy` adalah salinan filesystem logis dan selalu memberikan ID sesi baru. Dapat mengubah backend, kapasitas, atau enkripsi serta membuat identitas ext4 dan LUKS baru. `clone` menyalin backend yang terlepas secara fisik dan mempertahankan header LUKS, keyslots, UUID LUKS, dan UUID ext4. `convert` secara default menggantikan sumber; gunakan `--new-session` untuk mempertahankan sumber. Ukuran hanya relevan untuk target container.

Perbesar, hapus, atau bersihkan sesi:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

Resize mendukung DynFileFS, DynBlk, VMDK, dan sesi raw, termasuk bentuk terenkripsi, dan memerlukan ukuran lebih besar dari ukuran saat ini. Resize DynBlk memperbesar perangkat blok virtual terlebih dahulu lalu memperluas filesystem ext4-nya; tidak melakukan prealokasi kapasitas virtual baru. Cleanup default untuk sesi yang lebih lama dari 30 hari.

Semua perintah menerima `--json`, dan penyimpanan sesi berbeda dapat dipilih dengan `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Perilaku penyimpanan SquashFS

Sesi SquashFS akan diekstrak ke RAM sebagai layer yang dapat ditulis saat berjalan. Saat disimpan, snapshot presisi akan dibangun ulang dan divalidasi, lalu secara atomik menggantikan `changes.sb`.
Tidak ada generasi rollback yang disimpan. Simpan Sekarang tersedia dari ikon tray, Manajer Sesi MiniOS, atau `minios-session save` terlepas dari kebijakan otomatis.

Untuk setiap penyimpanan, MiniOS menyalin tampilan stabil dari pohon yang telah diubah ke penyimpanan privat RAM jika memori mencukupi. Kompresi akan menulis **satu** image ke direktori privat dalam sesi bernomor. Hanya setelah memeriksa isi filesystem, digest, identitas, dan sinkronisasi yang tahan lama, saver akan menggantikan `changes.sb`. Tidak ada image terkompresi kedua penuh di RAM atau penulisan kedua image tersebut ke perangkat persistence. Jika RAM tidak cukup untuk pohon, hanya working tree tersebut yang dialihkan ke disk; kandidat terkompresi tetap membutuhkan satu kali penulisan. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk kebijakan cache dan penulisan log.

Diagnostik boot untuk sesi SquashFS yang tahan lama disimpan di bawah `boot-logs/minios/` dan `boot-logs/live/` direktori. Tidak bergantung pada snapshot shutdown yang berhasil dan tetap tersedia meski perubahan terakhir pada upper RAM tidak dapat disimpan. Penyimpanan harus tetap dapat ditulis; file jurnal biasa bisa saja bersifat sementara jika `LIVE_LOG_STORAGE=volatile` dipilih.

Penyimpanan saat shutdown diatur oleh trigger shutdown inti MiniOS dan backend `minios-squashfs-save`, sehingga tidak tergantung pada Manajer Sesi MiniOS terbuka atau terpasang. Penyimpanan berkala diperiksa setiap 30 menit oleh timer systemd atau worker SysV, keduanya memanggil backend autosave yang sama. Proses rebuild snapshot memerlukan CPU dan menulis snapshot lengkap; interval satu jam atau lebih lama direkomendasikan.

Selama operasi RAM-backed SquashFS, snapshot SquashFS yang baru di-capture dan diaktifkan dapat mengambil alih target penyimpanan berjalan. Setelah handoff, snapshot berjalan lama dapat dihapus tanpa reboot:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Pengecualian ini hanya berlaku untuk handoff SquashFS current-boot yang valid. Mode persistence lain yang sedang berjalan tetap dilindungi dari penghapusan.

## Enkripsi

LUKS2 adalah lapisan opsional di atas Raw `changes.img`, DynFileFS `virtual.dat`, atau perangkat langsung DynBlk. Fitur ini hanya tersedia jika `/run/initramfs/etc/minios-initramfs-crypt` berisi `luks-layer-v1` dan alat serta kapabilitas backend yang dipilih tersedia.

Pembuatan LUKS secara interaktif akan meminta frasa sandi dua kali. Operasi yang membaca atau membuat data LUKS dapat membaca dari input standar dengan `--password-stdin`.
Frasa sandi tidak dimasukkan ke dalam argumen perintah atau metadata sesi. Saat boot, initrd akan meminta frasa sandi melalui konsol. Tiga kali percobaan yang gagal akan menghentikan proses boot secara fatal; MiniOS tidak akan melanjutkan dengan plaintext, RAM, backend lain, atau sesi pengganti dalam permintaan yang sama.

Ekspor terenkripsi berisi file sesi logis yang sudah didekripsi, bukan backend yang terenkripsi. Proses impor, penyalinan, atau konversi ke LUKS akan membuat backend terenkripsi baru dengan identitas baru.

## Cadangan dan sesi gagal

Untuk sesi native, DynFileFS, DynBlk, VMDK, dan raw, termasuk bentuk terenkripsi, gunakan `export` untuk backup logis, bukan menyalin direktori sesi yang sedang ter-mount. Simpan arsip hasil di perangkat lain dan pastikan dapat diimpor sebelum mengandalkannya. Impor selalu membuat sesi bernomor baru; aktifkan secara eksplisit saat siap digunakan.
Untuk prosedur backup SquashFS dan seluruh perangkat, lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Jika sesi gagal setelah penyimpanan penuh, penulisan terputus, atau sesi kosong dibuat berulang kali, hentikan modifikasi penyimpanan yang terdampak. Ekspor sesi yang dapat dibaca dan tidak berjalan terlebih dahulu jika memungkinkan, lalu ikuti [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting).

Mulai diagnosis tanpa memodifikasi data sesi:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Saat boot, filesystem container diperiksa sebelum aktivasi writable. Kegagalan fsck serius akan mempertahankan container untuk pemulihan daripada me-mount writable. SquashFS mendeteksi status sebelumnya yang tidak bersih dan memulihkan snapshot terakhir yang berhasil disimpan. Hapus sesi hanya melalui Manajer Sesi MiniOS atau `minios-session delete`; jangan hapus direktori sesi secara manual.

## Mengembalikan penyimpanan DynBlk dan VMDK yang tidak terpakai

Di Session Manager, klik kanan sesi DynBlk atau VMDK lalu pilih **Free Space...**.
Dialog ini berfungsi untuk sesi yang sedang berjalan maupun yang tidak aktif. Untuk
sesi plaintext akan memangkas ext4 internal sebelum meminta driver untuk mereklamasi
ruang. Sesi tidak aktif akan di-attach sementara lalu dilepas; perangkat sesi berjalan tetap terhubung.
Perangkat sesi berjalan tetap terhubung.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

Kotak centang kompaksi **nonaktif secara default**, termasuk di exFAT. Tidak ada
fallback kompaksi otomatis. Sesi terenkripsi hanya mereklamasi ruang yang sudah
diketahui driver; operasi ini tidak mengaktifkan discard melalui LUKS atau
mengungkap pola alokasinya. Error perangkat dan trim gagal akan menghentikan operasi.

### Perintah driver tingkat rendah

Dengan backend native DynBlk atau VMDK split saat ini, discard pada grain lengkap
membuat penempatannya dapat digunakan kembali. Pada filesystem ext4 backing, rentang yang dipensiunkan
juga dapat di-hole-punch secara otomatis. Pada exFAT, pembersihan otomatis hanya memangkas
ekor file yang benar-benar kosong. **Pembersihan otomatis tidak pernah memindahkan data aktif.**

Gunakan `fstrim` pada filesystem perubahan internal yang ter-mount (bukan root gabungan AUFS/OverlayFS
root) untuk melaporkan blok yang dihapus, lalu `dynblk reclaim /dev/dynblkN --execute`untuk pembersihan non-moving. Pilih perangkat sesi yang sebenarnya, bukan indeks asumsi.
Pilih perangkat sesi yang sebenarnya, bukan indeks asumsi.
Untuk meminta kompaksi in-place intensif tulis secara manual, tambahkan `--compact`.
Ini bekerja tanpa mengonversi image atau mengubah ukuran filesystem virtual;
baca/tulis lain dapat berjalan di antara langkah reclaim. Ini bukan fallback otomatis.
Opsi tambahan `--scan-zeroes` membaca grain yang sudah dipetakan, dan tidak aktif secara default.

Perintah ini juga tersedia di CLI DynBlk initrd yang telah dibangun ulang. Tidak ada kompaksi startup otomatis yang diaktifkan.
Sesi terenkripsi mempertahankan kebijakan discard yang ada; alat tidak diam-diam mengaktifkan dm-crypt discard passthrough.
alat tidak diam-diam mengaktifkan dm-crypt discard passthrough.
Read-only atau `cache=unsafe` attachment tidak dapat direklamasi. Rentang yang di-punch dan panjang yang dipangkas tidak sama dengan ruang kosong filesystem yang terukur.
Rentang yang di-punch dan panjang yang dipangkas tidak sama dengan ruang kosong filesystem yang terukur.

## Alur kerja sesi VMDK

VMDK adalah mode sesi terpisah, bukan codec kompresi baru. Pembuatan, aktivasi,
resize, ekspor/impor, salin, clone, dan konversi menggunakan perintah Session Manager
yang sama seperti mode container lain:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Arsip sesi berisi file logis dan metadata, bukan attachment VMDK eksternal sembarang.
Sesi VMDK terkelola menggunakan `volume.vmdk` descriptor kanonik
dan semua `volume-sNNN.vmdk` sibling-nya. Jangan mengganti nama bagian atau menyalin image aktif
di belakang driver. Beralih antara DynBlk native dan VMDK memerlukan
salinan/konversi eksplisit; mengubah `session_mode` secara manual bukanlah konversi.

Installer hanya menawarkan VMDK jika didukung oleh runtime dan menolak image sumber
yang initrd-nya tidak memiliki kemampuan `vmdk-session-v1`. Perbarui CLI,
driver, alat sesi, dan skrip boot bersamaan sebelum membuat sesi VMDK.
