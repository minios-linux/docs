---
updated: 2026-10-06
---

# Arsitektur sistem

MiniOS melakukan boot sistem operasi hanya-baca yang dirakit dari modul-modul SquashFS dan menambahkan satu lapisan tulis untuk sesi saat ini. Initramfs bertanggung jawab menemukan media, memilih modul dan persistensi, membangun root filesystem, menerapkan konfigurasi awal, lalu menyerahkan kontrol ke sistem init yang terpasang.

## Deteksi boot

Bootloader BIOS atau UEFI memuat kernel Linux dan initramfs MiniOS dari `minios/boot/`. Kemudian initramfs mendeteksi pohon data MiniOS yang berisi modul live. Sumber dapat lokal, dipilih secara interaktif, atau disediakan melalui jalur jaringan yang didukung; ISO lokal akan di-mount loop sebelum pohon datanya digunakan. Urutan prioritas dan bentuk yang diterima dijelaskan dalam `from=` dokumentasi [Penemuan sistem Initrd](/reference/boot-process/System-Discovery).

Tahap deteksi yang sama mendukung sumber ISO HTTP dan PXE. Jaringan awal-boot opsional hanya digunakan untuk **memuat MiniOS melalui jaringan** (PXE / HTTP ISO). Ini bukan konfigurasi jaringan sesi yang bersifat permanen. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

Setelah deteksi, MiniOS dapat secara opsional menyiapkan salinan RAM. Apakah sumber asli masih dibutuhkan tergantung pada mode penyalinan, persistensi, dan keberhasilan pemutusan. Lihat [Mode boot](/using-minios/Boot-Modes) untuk model operasional.

## Komposisi modul

Setiap `.sb` file adalah filesystem SquashFS hanya-baca. Modul bawaan disimpan langsung di bawah `minios/`; lokasi modul tambahan dapat berkontribusi pada komposisi berurutan. Initramfs memilih, mengurutkan, dan me-mount lapisan hanya-baca yang dihasilkan. Kandidat tier, penggantian basename, filter, ekstensi bundle kustom, dan koordinasi kernel berjalan diatur dalam [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading).

Citra Xfce umumnya berisi peran berurutan berikut, meskipun nama dan jumlah pastinya tergantung pada build dan modul yang dilewati untuk target tersebut:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Modul yang lebih akhir memiliki prioritas lebih tinggi dan dapat menggantikan path yang disediakan oleh modul sebelumnya. Sebuah modul dapat bergantung pada file di setiap modul bernomor lebih rendah, sehingga satu set file modul merupakan komposisi berurutan, bukan sekadar kumpulan paket independen.

## AUFS dan OverlayFS

MiniOS menggunakan union filesystem untuk menyajikan modul dan lapisan tulis sebagai satu root filesystem. Ia memilih AUFS jika kernel yang berjalan mendukungnya, dan akan menggunakan OverlayFS jika tidak. `union=aufs` meminta AUFS namun tetap kembali ke OverlayFS jika AUFS tidak tersedia; `union=overlayfs` memilih OverlayFS. Pada UEFI Secure Boot, initrd tidak memuat modul `aufs-ng` yang belum ditandatangani dan menggunakan OverlayFS kecuali sudah ada implementasi AUFS lain yang dapat digunakan.

Kedua implementasi ini memiliki perbedaan operasional penting:

- AUFS dimulai dengan cabang tulis dan menambahkan modul yang di-mount sebagai cabang hanya-baca. MiniOS dapat mengaktifkan atau menonaktifkan modul di root yang berjalan jika mount AUFS mendukung operasi tersebut.
- OverlayFS menerima daftar urutan lengkap `lowerdir` saat root di-mount, ditambah satu `upperdir` dan `workdir`. Set modul bawahnya tidak dapat diubah secara langsung oleh **Manajer Modul MiniOS**.

**Manajer Modul MiniOS** memisahkan **Sedang berjalan sekarang**, set modul yang di-mount, dari **Boot berikutnya**, modul yang dipilih oleh media dan aturan boot saat ini. Menambah atau menghapus modul permanen biasanya hanya mengubah boot berikutnya. Membuat atau membuka modul tidak langsung mengaktifkannya. Aktivasi dan deaktivasi runtime hanya tersedia dengan AUFS.

Setelah root dirakit dan pengaturan awal selesai, initrd LiveKit menggunakan `pivot_root`, mempertahankan initrd lama untuk proses shutdown, dan menjalankan init root baru. Jalur dracut menyiapkan root yang sama, tetapi menyerahkan proses akhir `switch_root` ke dracut. Lihat [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading) untuk detail batas penyerahan.

## Lapisan tulis dan sesi

Tanpa persistensi, lapisan tulis didukung oleh memori dan akan hilang saat shutdown. Persistensi dapat mengaktifkan sesi bernomor dengan backend penyimpanan yang didukung. Pemilihan, kompatibilitas, kegagalan aktivasi, otoritas boot saat ini, dan daya tahan diatur dalam [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

| Mode | Penyimpanan tulis | Catatan |
|------|------------------|-------|
| `native` | File disimpan langsung di direktori sesi | Membutuhkan filesystem POSIX yang dapat ditulis dan mempertahankan metadata Linux. |
| `dynfilefs` | Filesystem ext4 yang dapat diperluas dan dibagi ke beberapa file backend | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Membutuhkan userspace, kernel, dan kemampuan initrd DynBlk. |
| `vmdk` | Sparse terpisah `volume.vmdk` / `volume-sNNN.vmdk` penyimpanan yang diekspos sebagai perangkat blok oleh driver DynBlk | Membutuhkan kemampuan `vmdk-session-v1` DynBlk/initrd; tanpa kompresi backend. |
| `raw` | Ukuran tetap `changes.img` berisi ext4 | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `squashfs` | Snapshot `changes.sb` terkompresi | Diekstrak ke RAM untuk digunakan; penyimpanan akan membangun ulang dan mengganti snapshot secara atomik. Filesystem persistensi harus mempertahankan metadata Linux saat penyimpanan. |

Raw, DynFileFS, DynBlk, dan VMDK dapat membawa lapisan LUKS2 secara opsional. Metadata mencatat backend penyimpanan dan enkripsi secara terpisah. Saat shutdown, ext4, mapper, loop yang dimiliki, dan backend dilepas sesuai urutan dependensinya.

Sesi aktif yang dipilih untuk resume di masa depan dan lapisan tulis yang benar-benar diotorisasi untuk boot saat ini adalah dua status yang berbeda. Mengubah pilihan untuk masa depan tidak akan menggantikan lapisan tulis yang sedang berjalan.

Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence) untuk perintah pembuatan, pemilihan, pengaturan ukuran, enkripsi, konversi, ekspor, dan pemulihan.

## Prioritas konfigurasi

Konfigurasi media adalah `minios/config.conf`, dengan fragmen opsional di `minios/config.conf.d/`. Salinan runtime adalah `/etc/live/config.conf` dan `/etc/live/config.conf.d/` di root hasil komposisi.

Saat boot, MiniOS membandingkan waktu modifikasi dan menyalin file media yang lebih baru ke root runtime. Jika media dapat ditulis dan salinan runtime lebih baru, maka akan disalin kembali ke media. File fragmen disinkronkan berdasarkan nama file di kedua arah. Jika jam sistem mundur sejak sinkronisasi sebelumnya, MiniOS menghindari penggantian cap waktu dan hanya mengisi tujuan yang belum ada.

Opsi command-line kernel akan menimpa nilai yang dibaca dari konfigurasi runtime untuk boot tersebut. Artinya, urutan efektif untuk pengaturan yang didukung secara eksplisit adalah parameter boot, lalu konfigurasi runtime/media yang tersinkronisasi, lalu default bawaan. Edit runtime yang persisten dapat menjadi konfigurasi media jika sumbernya dapat ditulis; media ISO hanya-baca tidak dapat menerima pembaruan tersebut.

Lihat [Berkas konfigurasi](/reference/configuration/config.conf) dan [live-config](/reference/configuration/live-config) untuk pengaturan yang didukung.

## Siklus shutdown dan penyimpanan

Shutdown normal pertama-tama memberi kesempatan pada sistem yang berjalan untuk menyimpan layanan dan data sesi. Sesi SquashFS dengan penyimpanan saat shutdown diaktifkan akan dibangun ulang dan divalidasi sebelum filesystem dibongkar. Backend penyimpanan akan menulis penanda selesai untuk sesi yang sedang berjalan; initramfs shutdown akan memeriksa penanda tersebut dan menandai sesi sebagai kotor jika penyimpanan yang diperlukan gagal.

Initramfs shutdown kemudian melepas perangkat loop yang tidak digunakan, unmount root lama dan lapisan tulis, mencatat sesi yang sukses sebagai bersih, unmount media, dan menutup mapping LUKS milik MiniOS. Media optik kemudian dapat dikeluarkan sebelum poweroff atau reboot. Penyimpanan manual dan berkala SquashFS menggunakan backend snapshot yang sama, namun hanya kebijakan shutdown yang dikonfigurasi yang akan memblokir finalisasi bersih jika penyimpanan shutdown hilang.

## Pohon media

Citra terkini diorganisasikan sebagai berikut. Direktori opsional hanya muncul jika fitur terkait telah membuat konten.

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

Path yang di-boot di bawah `/run/initramfs/memory/` adalah mount implementasi, bukan salinan kedua pohon ini yang bersifat persisten.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Penemuan sistem Initrd](/reference/boot-process/System-Discovery)
- [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading)
- [Persistensi Initrd](/reference/boot-process/Persistence-Internals)
- [Parameter boot](/reference/Boot-Parameters)
- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [Berkas konfigurasi](/reference/configuration/config.conf)
- [Manajemen sesi](/using-minios/Sessions-and-Persistence)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Pembuatan modul](/preparing-and-customizing/Managing-Modules#creating-modules)
