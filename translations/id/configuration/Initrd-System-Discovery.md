---
updated: 2026-08-26
---

# Penemuan sistem Initrd

Setelah bootloader memuat kernel dan initramfs, initramfs harus menemukan pohon data MiniOS yang menyediakan modul sistem `.sb`. Proses ini terjadi sebelum stack jaringan userspace normal, desktop, dan sesi persisten aktif.

## Prioritas sumber

Pemilihan sumber memiliki urutan prioritas tetap:

1. Nilai literal `from=http://...` memilih HTTP ISO.
2. Jika tidak, setiap nilai `ip=` yang tidak kosong memilih unduhan PXE.
3. Jika tidak, `from=askdisk` atau `from=askdisk:...` akan membuka pemilih disk.
4. Jika tidak, initramfs akan memindai perangkat blok lokal.

Dua jalur jaringan ini tidak akan kembali ke media lokal. Setelah percobaan HTTP ISO atau PXE, penemuan akan mengembalikan hasil jaringan tersebut, bukan mencoba disk; hasil yang tidak dapat digunakan atau tidak lengkap akan gagal pada validasi atau penyiapan berikutnya.

Urutan ini memiliki dua konsekuensi penting:

- `from=http://...` mengalahkan `ip=`. Opsi `ip=` kemudian menyediakan alamat statis untuk koneksi HTTP ISO.
- Nilai `ip=` yang tidak kosong mengalahkan setiap nilai lokal `from=`, termasuk perangkat, direktori, path ISO, atau `askdisk`. Jangan gunakan `ip=` hanya untuk mengonfigurasi jaringan pada sistem yang boot dari lokal.

## Penemuan lokal

Tanpa sumber HTTP atau `ip=` yang tidak kosong, MiniOS melakukan 45 kali percobaan penemuan, kira-kira satu kali per detik. Setiap percobaan memperbarui node perangkat, mendapatkan kandidat perangkat blok dari `blkid`, mengurutkan nama perangkat mereka, dan mengujinya sesuai urutan tersebut. Kandidat pertama yang berisi sumber MiniOS yang memenuhi syarat akan dipilih; perangkat berikutnya tidak dipertimbangkan.

Jika `from=` kosong, path yang diuji pada setiap filesystem adalah `minios`. Sebuah sumber dianggap memenuhi syarat ketika direktori tersebut atau subdirektori `modules/` langsung di bawahnya berisi setidaknya satu file dengan ekstensi `.sb` secara default. Parameter `bext=` mengubah ekstensi yang digunakan pada pengujian ini. Penemuan tidak memvalidasi apakah kumpulan modul yang ditemukan sudah lengkap atau dapat di-boot.

Setiap kandidat awalnya di-mount hanya-baca. Setelah memenuhi syarat, MiniOS mencoba membuat mount data terpilih tersebut dapat ditulis, namun jika tidak berhasil, sumber yang valid tetap diterima.

### Bentuk lokal `from=`

Path relatif biasa atau yang tampak absolut akan diinterpretasikan di dalam setiap filesystem kandidat. Tanda garis miring di awal akan dinormalisasi oleh konstruksi path, sehingga keduanya mencari direktori yang sama:

```text
from=minios
from=/minios
```

Jika path yang diminta adalah file reguler pada filesystem kandidat, MiniOS menganggapnya sebagai ISO, melakukan loop-mount hanya-baca, dan menguji direktori `minios` di dalam ISO:

```text
from=/images/minios.iso
```

Path yang memenuhi syarat perangkat hanya mendukung bentuk berikut:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` mendukung nama perangkat sederhana yang diikuti path. Bentuk label harus persis `/dev/disk/by-label/LABEL/path`; label akan di-resolve dengan `blkid`, lalu sisa path diuji pada filesystem tersebut.

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
Sintaks garis miring seperti `from=askdisk/custom/dir` tetap membuka pemilih, tetapi path kustom akan diabaikan secara diam-diam dan menguji `minios`; jangan gunakan cara ini.

Daftar perangkat yang ditampilkan akan diperbarui selama pemilih terbuka dan tidak menampilkan filesystem swap. Pemilihan tetap melakukan pengujian keberadaan modul seperti biasa; memilih partisi saja tidak cukup.

## HTTP ISO

Sumber HTTP ISO memiliki bentuk berikut:

```text
from=http://server.example/path/minios.iso
```

Hanya HTTP biasa yang dikenali. HTTPS dan skema URL lain tidak didukung. Initramfs akan mencari antarmuka jaringan non-loopback pertama yang terdeteksi, mengaktifkan jaringan, dan me-mount ISO jarak jauh melalui `httpfs2`. Pemilihan antarmuka tidak memverifikasi link, keterjangkauan, atau apakah antarmuka tersebut yang dapat digunakan pada sistem multi-NIC.

Ketika `ip=` tidak ada, boot HTTP ISO akan meminta DHCP dengan `udhcpc`. Jika `ip=` ada, maka akan menggunakan field statis yang diharapkan oleh parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Untuk boot HTTP ISO, URL tetap menentukan server HTTP. Field statis mengatur alamat klien, netmask, gateway default, dan entri DNS awal; field port opsional digunakan untuk unduhan file PXE dan tidak menggantikan port pada URL ISO.

`cache=<MB>` mengaktifkan cache httpfs dengan ukuran yang diminta di `/tmp`. Ini adalah cache, bukan unduhan lengkap yang dijamin. Sistem yang berjalan tetap bergantung pada ISO jarak jauh dan jaringan kecuali salinan ke RAM berhasil dan sumber terlepas.

## Unduhan data PXE

Setiap `ip=` yang tidak kosong akan memilih unduhan data PXE kecuali `from=http://...` sudah dipilih terlebih dahulu. Sintaks yang didukung adalah:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Netmask menggunakan notasi IPv4 bertitik. Port HTTP opsional secara default adalah `7529`.
Bentuk kernel generik atau dracut seperti `ip=dhcp` dan `ip=:::::eth0:dhcp` tidak didukung. Unduhan data PXE sendiri tidak memiliki bentuk DHCP pada parser ini.

MiniOS akan mengonfigurasi antarmuka non-loopback pertama yang terdeteksi tanpa memastikan link berfungsi. Pertama, ia meminta `PXEFILELIST` dan file MiniOS yang terdaftar melalui HTTP dari field server. TFTP adalah fallback terbatas: hanya dipilih ketika permintaan HTTP awal untuk `PXEFILELIST` gagal. Ini bukan failover antarmuka umum, fallback media lokal, atau pemulihan dari setiap kegagalan unduhan HTTP parsial.

## Menyalin dan melepas dengan `toram=full`

`toram=full` penting untuk penemuan karena dapat menghilangkan ketergantungan berkelanjutan pada sumber yang dipilih. Setelah penemuan, MiniOS akan menyalin pohon data ke RAM lalu mencoba unmount sumber dan memindahkan salinan RAM ke tempatnya. Hanya unmount dan pemindahan yang berhasil yang akan melepaskan media lokal, ISO yang di-mount loop, atau HTTP ISO.

Batasan penting:

- Tidak ada pengecekan awal apakah RAM yang tersedia cukup untuk menampung salinan.
- Jika persistensi diminta, salinan `*` tingkat atas akan mengabaikan dotfiles.
- Jika persistensi tidak diminta, entri `changes` sengaja diabaikan. Cabang tersebut menyalin entri tingkat atas lain, termasuk dotfiles.
- Kegagalan salin, unmount, atau pemindahan dapat membuat sumber asli tetap ter-mount. Jangan berasumsi bahwa menentukan `toram=full` membuat penghapusan media atau kehilangan jaringan menjadi aman; pastikan pelepasan berhasil.

Lihat [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum menggabungkan `toram` dengan `perch` atau `perchdir`.

## Kegagalan dan diagnostik

Jika semua 45 percobaan lokal gagal, MiniOS akan masuk ke jalur error fatal dan membuka shell initramfs, bukan memulai sistem live. Jalur jaringan tidak melakukan pencarian lokal 45 kali atau kembali ke media lokal; tergantung pada hasil parsial, mereka dapat gagal pada pemeriksaan data atau penyiapan berikutnya. Keluar dari shell fatal tidak memperbaiki sumber yang hilang dan mungkin hanya membuat penyiapan berikutnya gagal dengan cara yang kurang jelas.

Parameter diagnostik yang berguna:

- `debug` mengaktifkan tracing shell, diagnostik tambahan, dan shell interaktif di beberapa checkpoint initramfs. Keluar dari shell checkpoint untuk melanjutkan.
- `timing` menampilkan waktu yang berlalu antar tahap initramfs dan total akhir.
- `rd.break` meminta shell initramfs di dekat penyerahan ke root sesungguhnya; keluar dari shell untuk melanjutkan booting.

Di shell, periksa `/proc/cmdline`, `/proc/net/dev`, `blkid`, filesystem yang di-mount, dan `/var/log/livedbg`. Mulai dengan nilai `from=`, `ip=`, dan `bext=` persis seperti yang ditampilkan di `/proc/cmdline`.

## Dokumentasi terkait

- [Mode boot](/configuration/Boot-Modes.md)
- [Pemuatan modul](/configuration/Initrd-Module-Loading.md)
- [Persistensi](/configuration/Initrd-Persistence.md)
- [Boot jaringan](/installation/Network-Boot.md)
- [Parameter boot](/configuration/Boot-Parameters.md)
- [Pemecahan masalah](/administration/Troubleshooting.md)
