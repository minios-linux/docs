# Arsitektur sistem MiniOS

MiniOS melakukan boot sistem operasi hanya-baca yang dirakit dari modul-modul SquashFS dan menambahkan satu lapisan tulis untuk sesi saat ini. Initramfs bertanggung jawab untuk menemukan media, memilih modul dan persistensi, membangun root filesystem, menerapkan konfigurasi awal, dan menyerahkan kontrol ke sistem init yang terpasang.

## Penemuan boot

Bootloader BIOS atau UEFI memuat kernel Linux dan initramfs MiniOS dari `minios/boot/`. Initramfs kemudian mencari perangkat blok untuk direktori `minios` yang berisi modul-modul `.sb`. Parameter boot `from=` dapat juga menentukan nama direktori, perangkat blok dan path, file ISO lokal, atau pemilihan interaktif `askdisk`. ISO lokal akan di-mount secara loop sebelum direktori `minios` digunakan.

Tahap penemuan yang sama mendukung sumber ISO HTTP dan PXE. Jaringan awal-boot opsional hanya untuk **memuat MiniOS melalui jaringan** (PXE / HTTP ISO). Ini bukan konfigurasi jaringan sesi yang permanen. Lihat [Network boot](/installation/Network-Boot.md).

Setelah penemuan, `toram=trim` dapat menyalin modul yang dipilih dan data yang diperlukan ke RAM, sementara `toram=full` menyalin pohon data media. Lihat [Boot parameters](/configuration/Boot-Parameters.md) untuk sumber, penyaringan, dan opsi penyalinan ke RAM.

## Komposisi modul

Setiap file `.sb` adalah filesystem SquashFS hanya-baca. Modul bawaan disimpan langsung di bawah `minios/`; modul tambahan dapat disimpan di bawah `minios/modules/`, termasuk penyimpanan modul tahan lama pada perangkat persistensi yang dapat ditulis. Initramfs menemukan kedua lokasi tersebut, menerapkan filter `load=` dan `noload=`, mengurutkan file yang dipilih berdasarkan awalan nama file numerik, dan me-mount-nya sebagai hanya-baca.

Image Xfce yang umum berisi peran-peran berikut secara berurutan, meskipun nama dan nomor pastinya tergantung pada build dan modul yang dilewati untuk target tersebut:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Modul yang lebih baru memiliki prioritas lebih tinggi dan dapat menggantikan path yang disediakan oleh modul sebelumnya. Sebuah modul dapat bergantung pada file di setiap modul bernomor lebih rendah, sehingga satu set file modul adalah komposisi berurutan, bukan kumpulan paket independen.

## AUFS dan OverlayFS

MiniOS menggunakan union filesystem untuk menyajikan modul dan lapisan tulis sebagai satu root filesystem. Sistem akan memilih AUFS jika kernel yang berjalan mendukungnya dan akan menggunakan OverlayFS jika tidak. `union=aufs` meminta AUFS tetapi tetap akan menggunakan OverlayFS jika AUFS tidak tersedia; `union=overlayfs` memilih OverlayFS.

Kedua implementasi ini memiliki perbedaan operasional penting:

- AUFS dimulai dengan cabang yang dapat ditulis dan menambahkan modul yang di-mount sebagai cabang hanya-baca. MiniOS dapat mengaktifkan atau menonaktifkan modul pada root yang sedang berjalan jika mount AUFS mendukung operasi tersebut.
- OverlayFS menerima daftar `lowerdir` yang terurut lengkap saat root di-mount, ditambah `upperdir` dan `workdir`. Set modul bawahnya tidak dapat diubah secara langsung oleh Module Manager.

Oleh karena itu, Module Manager memisahkan **Sedang berjalan sekarang**, yaitu set modul yang di-mount, dari **Boot berikutnya**, yaitu modul yang dipilih oleh media dan aturan boot saat ini. Menambah atau menghapus modul tahan lama biasanya hanya mengubah boot berikutnya. Membuat atau membuka modul tidak langsung mengaktifkannya. Aktivasi dan deaktivasi saat runtime hanya tersedia dengan AUFS.

## Lapisan tulis dan sesi

Tanpa persistensi, lapisan tulis didukung oleh memori dan akan hilang saat shutdown. Persistensi menempatkan lapisan tersebut dalam sesi bernomor di bawah `minios/changes/`. `session.conf` mencatat sesi default untuk boot berikutnya, sesi yang digunakan pada boot saat ini, metadata kompatibilitas, status, dan pengaturan khusus mode.

| Mode | Penyimpanan yang dapat ditulis | Catatan |
|------|-------------------------------|---------|
| `native` | File disimpan langsung di direktori sesi | Membutuhkan filesystem POSIX yang dapat ditulis dan mempertahankan metadata Linux. |
| `dynfilefs` | Filesystem ext4 yang dapat diperluas dan dibagi ke beberapa file pendukung | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `raw` | `changes.img` berukuran tetap berisi ext4 | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `luks` | LUKS2 `changes.luks` berisi ext4 | Membutuhkan cryptsetup dan initramfs yang dibangun dengan dukungan enkripsi MiniOS. Kata sandi akan diminta saat boot. |
| `squashfs` | Snapshot `changes.sb` terkompresi | Diekstrak ke RAM untuk digunakan; saat disimpan, snapshot akan dibangun ulang dan diganti secara atomik. Filesystem persistensi harus mempertahankan metadata Linux saat penyimpanan. |

Sesi aktif menjadi default untuk boot berikutnya. Sesi yang berjalan adalah yang sudah di-mount ke root saat ini. Mengaktifkan sesi lain tidak akan menggantikan lapisan tulis yang sedang berjalan. Pemeriksaan kompatibilitas sesi meliputi versi MiniOS, edisi, union filesystem, dan mode persistensi.

Lihat [Session management](/configuration/Session-Management.md) untuk perintah pembuatan, pemilihan, pengaturan ukuran, enkripsi, konversi, ekspor, dan pemulihan.

## Prioritas konfigurasi

Konfigurasi media adalah `minios/config.conf`, dengan fragmen opsional di `minios/config.conf.d/`. Salinan runtime adalah `/etc/live/config.conf` dan `/etc/live/config.conf.d/` di root yang telah dikomposisi.

Saat boot, MiniOS membandingkan waktu modifikasi dan menyalin file media yang lebih baru ke root runtime. Jika media dapat ditulis dan salinan runtime lebih baru, file tersebut akan disalin kembali ke media. File fragmen disinkronkan berdasarkan nama file di kedua arah. Jika jam sistem mundur sejak sinkronisasi sebelumnya, MiniOS akan menghindari penggantian timestamp dan hanya mengisi tujuan yang belum ada.

Opsi pada command-line kernel akan menimpa nilai yang dibaca dari konfigurasi runtime untuk boot tersebut. Artinya, urutan efektif untuk pengaturan yang didukung secara eksplisit adalah parameter boot, lalu konfigurasi runtime/media yang telah disinkronkan, lalu default bawaan. Edit runtime yang persisten dapat menjadi konfigurasi media jika sumbernya dapat ditulis; media ISO hanya-baca tidak dapat menerima pembaruan tersebut.

Lihat [Configuration file](/configuration/Configuration-File.md) dan [live-config](/configuration/live-config.md) untuk pengaturan yang didukung.

## Siklus shutdown dan penyimpanan

Shutdown normal pertama-tama memberikan kesempatan kepada sistem yang berjalan untuk melakukan flush layanan dan data sesi. Sesi SquashFS dengan penyimpanan saat shutdown diaktifkan akan dibangun ulang dan divalidasi sebelum filesystem dibongkar. Backend penyimpanan akan menulis penanda penyelesaian untuk sesi yang sedang berjalan; initramfs shutdown akan memeriksa penanda tersebut dan menandai sesi sebagai kotor jika penyimpanan yang diperlukan gagal.

Initramfs shutdown kemudian melepaskan loop device yang tidak digunakan, me-unmount root lama dan lapisan tulis, mencatat sesi yang berhasil sebagai bersih, me-unmount media, dan menutup mapping LUKS yang dimiliki MiniOS. Media optik kemudian dapat dikeluarkan sebelum poweroff atau reboot. Penyimpanan SquashFS manual dan periodik menggunakan backend snapshot yang sama, tetapi hanya kebijakan shutdown yang dikonfigurasi yang akan memblokir finalisasi bersih jika penyimpanan shutdown hilang.

## Struktur media

Image saat ini diorganisasi sebagai berikut. Direktori opsional hanya muncul jika fitur terkait telah membuat konten.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

Path yang di-boot di bawah `/run/initramfs/memory/` adalah mount implementasi, bukan salinan kedua yang persisten dari struktur ini.

## Dokumentasi terkait

- [Boot parameters](/configuration/Boot-Parameters.md)
- [Boot menus](/configuration/Boot-Menus.md)
- [Configuration file](/configuration/Configuration-File.md)
- [Session management](/configuration/Session-Management.md)
- [Network boot](/installation/Network-Boot.md)
- [Creating modules](/development/Creating-Modules.md)
