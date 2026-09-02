---
updated: 2026-08-26
---

# Arsitektur sistem

MiniOS melakukan boot sistem operasi hanya-baca yang dirakit dari modul-modul SquashFS dan menambahkan satu lapisan yang dapat ditulis untuk sesi saat ini. Initramfs bertanggung jawab untuk menemukan media, memilih modul dan persistensi, membangun root filesystem, menerapkan konfigurasi awal, dan menyerahkan kontrol ke sistem init yang terpasang.

## Penemuan boot

Bootloader BIOS atau UEFI memuat kernel Linux dan initramfs MiniOS dari `minios/boot/`. Initramfs kemudian menemukan pohon data MiniOS yang berisi modul live. Sumber bisa lokal, dipilih secara interaktif, atau disediakan melalui jalur jaringan yang didukung; ISO lokal akan di-mount secara loop sebelum pohon datanya digunakan. Urutan prioritas dan bentuk `from=` yang diterima dijelaskan di [Penemuan sistem Initrd](/reference/boot-process/System-Discovery).

Tahap penemuan yang sama mendukung sumber ISO HTTP dan PXE. Jaringan awal-boot opsional hanya untuk **memuat MiniOS melalui jaringan** (PXE / HTTP ISO). Ini bukan konfigurasi jaringan sesi yang bersifat permanen. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

Setelah penemuan, MiniOS dapat secara opsional menyiapkan salinan RAM. Apakah sumber asli tetap dibutuhkan tergantung pada mode salin, persistensi, dan keberhasilan pelepasan. Lihat [Mode boot](/using-minios/Boot-Modes) untuk model operasionalnya.

## Komposisi modul

Setiap file `.sb` adalah filesystem SquashFS hanya-baca. Modul bawaan disimpan langsung di bawah `minios/`; lokasi modul tambahan dapat berkontribusi pada komposisi berurutan. Initramfs memilih, mengurutkan, dan me-mount lapisan hanya-baca yang dihasilkan. Kandidat tier, penggantian basename, filter, ekstensi bundle kustom, dan koordinasi kernel yang sedang berjalan dijelaskan di [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading).

Citra Xfce yang umum berisi peran berurutan berikut, meskipun nama dan jumlah pastinya tergantung pada build dan modul yang dilewati untuk target tersebut:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Modul yang lebih baru memiliki prioritas lebih tinggi dan dapat menggantikan path yang disediakan oleh modul sebelumnya. Sebuah modul dapat bergantung pada file di setiap modul bernomor lebih rendah, sehingga satu set file modul adalah komposisi berurutan, bukan sekadar kumpulan paket independen.

## AUFS dan OverlayFS

MiniOS menggunakan union filesystem untuk menyajikan modul dan layer yang dapat ditulis sebagai satu root filesystem. Sistem ini akan memilih AUFS jika kernel yang berjalan mendukungnya, dan akan kembali menggunakan OverlayFS jika tidak. `union=aufs` meminta AUFS, namun tetap akan menggunakan OverlayFS jika AUFS tidak tersedia; `union=overlayfs` memilih OverlayFS.

Kedua implementasi ini memiliki perbedaan operasional yang penting:

- AUFS dimulai dengan cabang yang dapat ditulis dan menambahkan modul yang di-mount sebagai cabang read-only. MiniOS dapat mengaktifkan atau menonaktifkan modul pada root yang sedang berjalan jika mount AUFS mendukung operasi tersebut.
- OverlayFS menerima daftar `lowerdir` yang sudah urut dan lengkap saat root di-mount, ditambah dengan `upperdir` dan `workdir`. Set modul bawahnya tidak dapat diubah secara langsung oleh **Manajer Modul MiniOS**.

Karena itu, **Manajer Modul MiniOS** memisahkan **Sedang berjalan sekarang** (set modul yang sedang di-mount) dari **Boot berikutnya** (modul yang dipilih berdasarkan media dan aturan boot saat ini). Menambah atau menghapus modul yang bersifat persisten biasanya hanya mengubah boot berikutnya. Membuat atau membuka modul tidak otomatis mengaktifkannya. Aktivasi dan deaktivasi modul saat runtime hanya tersedia dengan AUFS.

Setelah root dirakit dan proses setup awal selesai, initrd LiveKit menggunakan `pivot_root`, mempertahankan initrd lama untuk proses shutdown, dan mengeksekusi init pada root baru. Jalur dracut menyiapkan root yang sama, namun menyerahkan proses akhir `switch_root` ke dracut. Lihat [Pemrosesan modul initrd](/reference/boot-process/Module-Loading) untuk detail batas penyerahan proses.

## Lapisan yang dapat ditulis dan sesi

Tanpa persistensi, lapisan yang dapat ditulis didukung oleh memori dan akan hilang saat shutdown. Persistensi dapat mengaktifkan sesi bernomor dengan backend penyimpanan yang didukung. Pemilihan, kompatibilitas, kegagalan aktivasi, otoritas boot saat ini, dan daya tahan dijelaskan di [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

| Mode | Penyimpanan yang dapat ditulis | Catatan |
|------|------------------|-------|
| `native` | File disimpan langsung di direktori sesi | Membutuhkan filesystem POSIX yang dapat ditulis dan mampu mempertahankan metadata Linux. |
| `dynfilefs` | Filesystem ext4 yang dapat diperluas, dibagi ke beberapa file pendukung | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `raw` | `changes.img` berukuran tetap berisi ext4 | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `luks` | LUKS2 `changes.luks` berisi ext4 | Membutuhkan cryptsetup dan initramfs yang dibangun dengan dukungan enkripsi MiniOS. Kata sandi diminta saat boot. |
| `squashfs` | Snapshot `changes.sb` terkompresi | Diekstrak ke RAM untuk digunakan; penyimpanan ulang akan membangun ulang dan mengganti snapshot secara atomik. Filesystem persistensi harus mempertahankan metadata Linux saat penyimpanan. |

Sesi aktif yang dipilih untuk resume di masa depan dan lapisan yang dapat ditulis yang benar-benar diotorisasi untuk boot saat ini adalah dua status yang terkait tetapi berbeda. Mengubah pilihan masa depan tidak akan menggantikan lapisan yang sedang berjalan.

Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence) untuk perintah pembuatan, pemilihan, pengaturan ukuran, enkripsi, konversi, ekspor, dan pemulihan.

## Prioritas konfigurasi

Konfigurasi media berada di `minios/config.conf`, dengan fragmen opsional di `minios/config.conf.d/`. Salinan runtime berada di `/etc/live/config.conf` dan `/etc/live/config.conf.d/` dalam root yang sudah terkomposisi.

Saat boot, MiniOS membandingkan waktu modifikasi dan menyalin file media yang lebih baru ke root runtime. Jika media dapat ditulis dan salinan runtime lebih baru, maka akan disalin kembali ke media. File fragmen disinkronkan berdasarkan nama file di kedua arah. Jika jam sistem mundur sejak sinkronisasi sebelumnya, MiniOS menghindari penggantian timestamp dan hanya mengisi tujuan yang belum ada.

Opsi baris perintah kernel akan menimpa nilai yang dibaca dari konfigurasi runtime untuk boot tersebut. Artinya, urutan efektif untuk pengaturan yang didukung secara eksplisit adalah parameter boot, lalu konfigurasi runtime/media yang telah disinkronkan, lalu default bawaan. Edit runtime yang persisten dapat menjadi konfigurasi media jika sumbernya dapat ditulis; media ISO hanya-baca tidak dapat menerima pembaruan tersebut.

Lihat [Berkas konfigurasi](/reference/configuration/config.conf) dan [live-config](/reference/configuration/live-config) untuk pengaturan yang didukung.

## Siklus hidup shutdown dan penyimpanan

Shutdown normal pertama-tama memberi kesempatan pada sistem yang berjalan untuk melakukan flush layanan dan data sesi. Sesi SquashFS dengan penyimpanan saat shutdown diaktifkan akan dibangun ulang dan divalidasi sebelum filesystem dibongkar. Backend penyimpanan menulis penanda penyelesaian untuk sesi yang sedang berjalan; initramfs shutdown memeriksa penanda itu dan akan membiarkan sesi tetap "kotor" jika penyimpanan yang diperlukan gagal.

Initramfs shutdown kemudian melepas perangkat loop yang tidak digunakan, unmount root lama dan lapisan yang dapat ditulis, mencatat sesi yang berhasil sebagai bersih, unmount media, dan menutup pemetaan LUKS milik MiniOS. Media optik kemudian dapat dikeluarkan sebelum poweroff atau reboot. Penyimpanan manual dan periodik SquashFS menggunakan backend snapshot yang sama, tetapi hanya kebijakan shutdown yang dikonfigurasi yang akan memblokir finalisasi bersih jika penyimpanan shutdown hilang.

## Pohon media

Struktur gambar saat ini adalah sebagai berikut. Direktori opsional hanya akan muncul jika fitur terkait telah membuat konten.

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

Path yang dijalankan di bawah `/run/initramfs/memory/` adalah mount implementasi, bukan salinan kedua pohon ini yang bersifat persisten.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Deteksi sistem Initrd](/reference/boot-process/System-Discovery)
- [Pemuat modul Initrd](/reference/boot-process/Module-Loading)
- [Persistensi Initrd](/reference/boot-process/Persistence-Internals)
- [Parameter boot](/reference/Boot-Parameters)
- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Berkas konfigurasi](/reference/configuration/config.conf)
- [Manajemen sesi](/using-minios/Sessions-and-Persistence)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
