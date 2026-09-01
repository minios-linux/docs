---
updated: 2026-08-28
---

# Penemuan sistem

Halaman ini menjelaskan perubahan yang dilakukan oleh parameter boot `from`, `ip`, `cache`, `bext`, `toram`, dan `toram=full`. Penjelasan ini ditujukan untuk entri boot kustom, boot jaringan, dan pemecahan masalah. Sebagian besar pengguna dapat memilih entri normal di menu boot tanpa perlu mengatur parameter ini secara manual.

Setelah bootloader memuat kernel dan initramfs, initramfs harus menemukan pohon data MiniOS yang menyediakan modul sistem `.sb`. Proses ini terjadi sebelum stack jaringan userspace normal, desktop, dan sesi persisten aktif.

## Dalam bahasa sederhana

MiniOS perlu menemukan direktori yang berisi modul sistemnya. Biasanya, sistem akan mencari drive yang terpasang untuk direktori `minios/`. Parameter `from=` mengarahkannya ke direktori atau ISO yang berbeda. Parameter jaringan menggantikan pencarian lokal ini dengan ISO HTTP atau unduhan PXE.

Menemukan drive tidak membuktikan bahwa set modul sudah lengkap, dan menemukan file sistem tidak otomatis mengaktifkan persistensi. Itu adalah langkah startup yang terpisah.

## Penjelasan parameter

| Parameter | Fungsi pada MiniOS | Penggunaan umum |
|---|---|---|
| `from=PATH` | Cari MiniOS di direktori atau ISO tertentu, bukan menerima sumber lokal pertama yang cocok. | Boot dari ISO yang tersimpan di disk atau menggunakan direktori non-standar. |
| `from=askdisk` | Buka pemilih interaktif untuk partisi yang berisi MiniOS. | Beberapa drive terhubung berisi sumber yang memungkinkan. |
| `from=http://...` | Mount ISO dari server HTTP biasa. | Boot jaringan terkontrol di mana sistem berjalan dapat terus bergantung pada server. |
| `ip=...` | Gunakan jaringan statis awal. Tanpa HTTP `from=`, memilih unduhan data PXE dan melewati drive lokal. | Deploy PXE atau penetapan alamat statis untuk ISO HTTP. |
| `cache=MB` | Alokasikan cache httpfs untuk ISO HTTP. Tidak menjamin seluruh ISO terunduh. | Mengurangi pembacaan berulang dari sumber HTTP. |
| `bext=EXTENSION` | Cari nama file modul dengan ekstensi lain selain `.sb`. | Hanya untuk image khusus; tidak mengonversi modul. |
| `toram` atau `toram=full` | Salin seluruh pohon data MiniOS yang ditemukan ke RAM dan coba lepaskan sumbernya. Bentuk tanpa parameter berarti `full`. | Operasi RAM sementara pada mesin dengan memori __LOKIT_PRESERVE_TERM_hardware.ram__ yang cukup. |

Jika boot USB lokal berhenti sebelum desktop muncul, pertama-tama hapus nilai kustom `from=` dan `ip=`. `ip=` yang tidak sengaja terisi mencegah penemuan drive lokal, sedangkan `from=` yang salah dapat membuat MiniOS mencari path yang tidak ada.

## Prioritas sumber

Pemilihan sumber memiliki urutan prioritas tetap:

1. Nilai literal `from=http://...` memilih ISO HTTP.
2. Jika tidak, nilai `ip=` yang tidak kosong memilih unduhan PXE.
3. Jika tidak, `from=askdisk` atau `from=askdisk:...` membuka pemilih disk.
4. Jika tidak, initramfs memindai perangkat blok lokal.

Kedua jalur jaringan tidak akan kembali ke media lokal. Setelah percobaan ISO HTTP atau PXE, penemuan akan mengembalikan hasil jaringan tersebut, bukan mencoba disk; hasil yang tidak dapat digunakan atau tidak lengkap akan gagal validasi atau pengaturan berikutnya.

Urutan ini memiliki dua konsekuensi penting:

- `from=http://...` lebih diutamakan daripada `ip=`. Opsi `ip=` kemudian menyediakan alamat statis untuk koneksi ISO HTTP.
- Nilai `ip=` yang tidak kosong mengalahkan setiap nilai lokal `from=`, termasuk perangkat, direktori, path ISO, atau `askdisk`. Jangan gunakan `ip=` hanya untuk mengatur jaringan pada sistem yang boot dari lokal.

## Penemuan lokal

Tanpa sumber HTTP atau `ip=` yang tidak kosong, MiniOS melakukan 45 kali proses penemuan, kira-kira satu kali per detik. Setiap proses memperbarui node perangkat, mendapatkan kandidat perangkat blok dari `blkid`, mengurutkan nama perangkat, dan mengujinya sesuai urutan tersebut. Kandidat pertama yang berisi sumber MiniOS yang memenuhi syarat akan dipilih; perangkat berikutnya tidak akan dipertimbangkan.

Jika `from=` kosong, path yang diuji pada setiap filesystem adalah `minios`. Sebuah sumber memenuhi syarat jika direktori tersebut atau subdirektori `modules/` di dalamnya berisi setidaknya satu file dengan ekstensi `.sb` secara default. Parameter `bext=` mengubah ekstensi yang digunakan pada pengujian ini. Penemuan tidak memvalidasi apakah set modul yang ditemukan sudah lengkap atau dapat di-boot.

Setiap kandidat awalnya di-mount hanya-baca. Setelah memenuhi syarat, MiniOS mencoba membuat mount data yang dipilih tersebut dapat ditulis, tetapi kegagalan melakukannya tidak akan menggugurkan sumber yang valid.

### Bentuk lokal `from=`

Path relatif biasa atau yang tampak absolut akan diinterpretasikan di dalam setiap filesystem kandidat. Tanda slash di awal akan dinormalisasi oleh konstruksi path, sehingga kedua contoh berikut mencari direktori yang sama:

```text
from=minios
from=/minios
```

Jika path yang diminta adalah file reguler pada filesystem kandidat, MiniOS akan memperlakukannya sebagai ISO, melakukan loop-mount secara hanya-baca, dan menguji direktori `minios` di dalam ISO:

```text
from=/images/minios.iso
```

Path dengan kualifikasi perangkat hanya mendukung bentuk berikut:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` mendukung nama perangkat sederhana diikuti path. Bentuk label harus persis `/dev/disk/by-label/LABEL/path`; label akan di-resolve dengan `blkid`, lalu sisa path diuji pada filesystem tersebut.

Tidak ada parser yang sesuai untuk path UUID, PARTUUID, atau by-id. Bentuk seperti berikut tidak didukung:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Pemilihan interaktif

Gunakan `askdisk` untuk memilih partisi lalu menguji path di dalamnya:

```text
from=askdisk
from=askdisk:custom:dir
```

Bentuk pertama menguji `minios` pada partisi yang dipilih. Pada bentuk kedua, tanda titik dua menjadi pemisah path, sehingga `askdisk:custom:dir` menguji `custom/dir`.
Sintaks slash seperti `from=askdisk/custom/dir` tetap membuka pemilih, tetapi secara diam-diam mengabaikan path kustom dan menguji `minios`; jangan gunakan cara ini.

Daftar perangkat yang ditampilkan akan diperbarui selama pemilih terbuka dan tidak menampilkan filesystem swap. Pemilihan tetap melakukan pengujian kehadiran modul secara normal; memilih partisi saja tidak cukup.

## ISO HTTP

Sumber ISO HTTP memiliki bentuk berikut:

```text
from=http://server.example/path/minios.iso
```

Hanya HTTP biasa yang dikenali. HTTPS dan skema URL lain tidak didukung.
Initramfs akan mencari antarmuka jaringan non-loopback pertama yang terdeteksi, mengaktifkan jaringan, dan me-mount ISO remote melalui `httpfs2`. Pemilihan antarmuka tidak memverifikasi link, keterjangkauan, atau apakah antarmuka tersebut yang dapat digunakan pada sistem multi-NIC.

Jika `ip=` tidak ada, boot ISO HTTP akan meminta DHCP dengan `udhcpc`. Jika `ip=` ada, akan digunakan field statis yang diharapkan oleh parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Untuk boot ISO HTTP, URL tetap menentukan server HTTP. Field statis mengatur alamat klien, netmask, gateway default, dan entri DNS awal; field port opsional hanya untuk unduhan file PXE dan tidak menggantikan port pada URL ISO.

`cache=<MB>` mengaktifkan cache httpfs dengan ukuran yang diminta di `/tmp`. Ini adalah cache, bukan unduhan penuh yang dijamin. Sistem yang berjalan tetap bergantung pada ISO remote dan jaringan kecuali salinan RAM berhasil dan sumber dapat dilepaskan.

## Unduhan data PXE

Setiap `ip=` yang tidak kosong akan memilih unduhan data PXE kecuali `from=http://...` sudah dipilih terlebih dahulu. Sintaks yang didukung adalah:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Netmask menggunakan notasi IPv4 bertitik. Port HTTP opsional secara default adalah `7529`.
Bentuk kernel generik atau dracut seperti `ip=dhcp` dan `ip=:::::eth0:dhcp` tidak didukung. Unduhan data PXE sendiri tidak memiliki bentuk DHCP di parser ini.

MiniOS akan mengonfigurasi antarmuka non-loopback pertama yang terdeteksi tanpa membuktikan adanya link yang aktif. Pertama-tama akan meminta `PXEFILELIST` dan file MiniOS yang terdaftar melalui HTTP dari field server. TFTP hanya menjadi fallback terbatas: dipilih hanya jika permintaan HTTP awal untuk `PXEFILELIST` gagal. Ini bukan failover antarmuka umum, fallback ke media lokal, atau pemulihan dari setiap kegagalan unduhan HTTP parsial.

## Menyalin dan melepas dengan `toram=full`

`toram=full` penting dalam proses penemuan karena dapat menghilangkan ketergantungan berkelanjutan pada sumber yang dipilih. Setelah penemuan, MiniOS akan menyalin pohon data ke RAM lalu mencoba unmount sumber dan memindahkan salinan RAM ke tempatnya. Hanya unmount dan pemindahan yang berhasil yang akan melepaskan media lokal, ISO yang di-mount loop, atau ISO HTTP.

Batasan penting:

- Tidak ada pengecekan awal apakah RAM yang tersedia cukup untuk menampung salinan.
- Jika persistensi diminta, salinan `*` tingkat atas akan mengabaikan dotfiles.
- Jika persistensi tidak diminta, entri `changes` sengaja diabaikan. Cabang ini akan menyalin entri tingkat atas lain, termasuk dotfiles.
- Kegagalan menyalin, unmount, atau memindahkan dapat menyebabkan sumber asli tetap ter-mount. Jangan berasumsi bahwa menentukan `toram=full` membuat pelepasan media atau kehilangan jaringan menjadi aman; pastikan proses pelepasan benar-benar berhasil.

Lihat [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum menggabungkan `toram` dengan `perch` atau `perchdir`.

## Kegagalan dan diagnostik

Jika semua 45 proses lokal gagal, MiniOS akan masuk ke jalur error fatal dan membuka shell initramfs, bukan memulai sistem live. Jalur jaringan tidak melakukan pencarian lokal 45 kali atau kembali ke media lokal; tergantung hasil parsial, proses ini bisa gagal pada pemeriksaan data atau pengaturan berikutnya. Keluar dari shell fatal tidak memperbaiki sumber yang hilang dan mungkin hanya membuat kegagalan berikutnya kurang jelas.

Parameter diagnostik yang berguna:

- `debug` mengaktifkan pelacakan shell, diagnostik tambahan, dan shell interaktif di beberapa checkpoint initramfs. Keluar dari shell checkpoint untuk melanjutkan.
- `timing` mencetak waktu yang berlalu antar tahap initramfs dan total akhir.
- `rd.break` meminta shell initramfs di dekat penyerahan ke root sebenarnya; keluar dari shell ini untuk melanjutkan booting.

Di shell, periksa `/proc/cmdline`, `/proc/net/dev`, `blkid`, filesystem yang di-mount, dan `/var/log/livedbg`. Mulailah dengan nilai `from=`, `ip=`, dan `bext=` persis seperti yang ditampilkan di `/proc/cmdline`.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Pemuatan modul](/reference/boot-process/Module-Loading)
- [Persistensi](/reference/boot-process/Persistence-Internals)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Parameter boot](/reference/Boot-Parameters)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
