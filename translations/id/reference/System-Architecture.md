---
updated: 2026-10-15
---

# Arsitektur sistem

MiniOS melakukan boot ke sistem operasi read-only yang dirangkai dari modul SquashFS dan menambahkan satu lapisan writable untuk sesi saat ini. Initramfs bertanggung jawab menemukan media, memilih modul dan persistensi, menyusun sistem file root, menerapkan konfigurasi awal, lalu menyerahkan kendali ke sistem init yang terpasang.

## Pencarian saat boot

Bootloader BIOS atau UEFI memuat kernel Linux dan initramfs MiniOS dari `minios/boot/`. Initramfs kemudian menemukan pohon data MiniOS yang berisi modul live. Sumbernya dapat berupa sumber lokal, dipilih secara interaktif, atau disediakan melalui jalur jaringan yang didukung; ISO lokal di-loop-mount sebelum pohon datanya digunakan. Prioritas pasti dan bentuk `from=` yang diterima dijelaskan di [Pencarian sistem Initrd](/reference/boot-process/System-Discovery).

Tahap pencarian yang sama mendukung sumber ISO HTTP dan PXE. Jaringan opsional saat boot awal hanya digunakan untuk **memuat MiniOS melalui jaringan** (PXE / ISO HTTP). Ini bukan konfigurasi jaringan sesi yang persisten. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

Setelah pencarian, MiniOS dapat menyiapkan salinan RAM secara opsional. Apakah sumber asli masih diperlukan bergantung pada mode penyalinan, persistensi, dan keberhasilan pelepasan. Lihat [Mode boot](/using-minios/Boot-Modes) untuk model operasionalnya.

## Komposisi modul

Setiap `.sb` file adalah sistem file SquashFS read-only. Modul bawaan disimpan langsung di `minios/`; lokasi modul tambahan dapat berkontribusi pada komposisi berurutan. Initramfs memilih, mengurutkan, dan memasang lapisan read-only yang dihasilkan. Tingkatan kandidat, penggantian berdasarkan nama dasar, filter, ekstensi bundle kustom, dan koordinasi dengan kernel yang sedang berjalan dijelaskan di [Pemuatan modul Initrd](/reference/boot-process/Module-Loading).

Image Xfce biasanya berisi peran-peran berikut secara berurutan, meskipun nama dan jumlah persisnya bergantung pada build dan modul yang dilewati untuk target tersebut:

```text
00-core-<arch>.sb
01-kernel-<version>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

Modul yang lebih akhir memiliki prioritas lebih tinggi dan dapat mengganti jalur yang disediakan oleh modul sebelumnya. Modul dapat bergantung pada file di setiap modul bernomor lebih rendah, sehingga sekumpulan file modul merupakan komposisi berurutan, bukan kumpulan paket yang berdiri sendiri.

## AUFS dan OverlayFS

MiniOS menggunakan filesystem union untuk menyajikan modul dan lapisan yang dapat ditulis sebagai satu filesystem root. Sistem memilih AUFS jika kernel yang sedang berjalan mendukungnya, dan menggunakan OverlayFS sebagai fallback jika tidak. `union=aufs` meminta AUFS, tetapi tetap menggunakan OverlayFS sebagai fallback saat AUFS tidak tersedia; `union=overlayfs` memilih OverlayFS. Dalam UEFI Secure Boot, initrd tidak memuat modul yang tidak ditandatangani `aufs-ng` dan menggunakan OverlayFS, kecuali jika implementasi AUFS lain yang dapat digunakan sudah tersedia.

Kedua implementasi ini memiliki perbedaan operasional yang penting:

- AUFS dimulai dengan cabang yang dapat ditulis, lalu menambahkan modul yang di-mount sebagai cabang hanya-baca. MiniOS dapat mengaktifkan atau menonaktifkan modul pada root yang sedang berjalan jika mount AUFS mendukung operasi tersebut.
- OverlayFS menerima daftar lengkap yang berurutan `lowerdir` saat root di-mount, serta sebuah `upperdir` dan `workdir`. Kumpulan modul lapisan bawahnya tidak dapat diubah langsung oleh **Manajer Modul MiniOS**.

**Manajer Modul MiniOS** memisahkan **Yang berjalan saat ini**, yaitu kumpulan modul yang di-mount, dari **Boot berikutnya**, yaitu modul yang dipilih berdasarkan media dan aturan boot saat ini. Menambahkan atau menghapus modul permanen biasanya hanya memengaruhi boot berikutnya. Membuat atau membuka modul tidak akan mengaktifkannya. Aktivasi dan penonaktifan saat runtime hanya tersedia dengan AUFS.

Setelah root dirakit dan penyiapan awal selesai, initrd LiveKit menggunakan `pivot_root`, mempertahankan initrd lama untuk keperluan shutdown, lalu menjalankan init pada root baru. Jalur dracut menyiapkan root rakitan yang sama, tetapi menyerahkan tahap akhir `switch_root` kepada dracut. Lihat [Pemuatan modul initrd](/reference/boot-process/Module-Loading) untuk mengetahui batas serah terima secara terperinci.

## Lapisan tulis dan sesi

Tanpa persistensi, lapisan tulis menggunakan memori dan akan hilang saat sistem dimatikan. Persistensi dapat mengaktifkan sesi bernomor dengan backend penyimpanan yang didukung. Dengan backend Persistence Plugin Ventoy yang dipilih, MiniOS menggunakan satu lingkungan persisten ext4 langsung, bukan sesi bernomor. Pemilihan, kompatibilitas, kegagalan aktivasi, otoritas boot saat ini, dan durabilitas dijelaskan di [Persistensi initrd](/reference/boot-process/Persistence-Internals).

| Mode | Penyimpanan tulis | Catatan |
|------|------------------|-------|
| `native` | File disimpan langsung di direktori sesi | Memerlukan filesystem POSIX yang dapat ditulis dan mempertahankan metadata Linux. |
| `dynfilefs` | Filesystem ext4 yang dapat diperluas dan dibagi ke beberapa file pendukung | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `dynblk` | Filesystem ext4 tipis pada perangkat blok kernel yang didukung oleh `volumeNNN.db` file | Memerlukan userspace DynBlk, kernel, dan dukungan initrd. |
| `vmdk` | Penyimpanan `volume.vmdk` / `volume-sNNN.vmdk` sparse terpisah yang diekspos sebagai perangkat blok oleh driver DynBlk | Memerlukan kemampuan `vmdk-session-v1` DynBlk/initrd; tanpa kompresi backend. |
| `raw` | File berukuran tetap `changes.img` yang berisi ext4 | Mendukung filesystem POSIX serta media FAT32, NTFS, atau exFAT. |
| `squashfs` | Snapshot `changes.sb` terkompresi | Diekstrak ke RAM untuk digunakan; penyimpanan akan membuat ulang dan mengganti snapshot secara atomik. Filesystem persistensi harus mempertahankan metadata Linux selama penyimpanan. |

Raw, DynFileFS, DynBlk, dan VMDK dapat menggunakan lapisan LUKS2 secara opsional. Metadata mencatat backend penyimpanan dan enkripsi secara terpisah. Saat dimatikan, ext4, mapper, loop yang dimiliki, dan backend dilepas sesuai urutan dependensinya.

Sesi aktif yang dipilih untuk dilanjutkan nanti dan lapisan tulis yang benar-benar diizinkan untuk boot saat ini adalah status yang saling terkait, tetapi berbeda. Mengubah pilihan untuk penggunaan mendatang tidak mengganti lapisan tulis yang sedang berjalan.

Lihat [Pengelolaan sesi](/using-minios/Sessions-and-Persistence) untuk perintah pembuatan, pemilihan, pengaturan ukuran, enkripsi, konversi, ekspor, dan pemulihan.

## Prioritas konfigurasi

Konfigurasi media berada di `minios/config.conf`, dengan fragmen opsional di `minios/config.conf.d/`. Salinan runtime berada di `/etc/live/config.conf` dan `/etc/live/config.conf.d/` di root yang telah dirangkai.

Saat boot, MiniOS membandingkan waktu modifikasi dan menyalin file media yang lebih baru ke root runtime. Jika media dapat ditulis dan salinan runtime lebih baru, file tersebut disalin kembali ke media. File fragmen disinkronkan berdasarkan nama file ke kedua arah. Jika jam mundur sejak sinkronisasi sebelumnya, MiniOS menghindari penggantian berdasarkan timestamp dan hanya mengisi tujuan yang belum ada.

Opsi command line kernel mengesampingkan nilai terkait yang dibaca dari konfigurasi runtime untuk boot tersebut. Artinya, urutan efektif untuk pengaturan yang didukung secara eksplisit adalah parameter boot, lalu konfigurasi runtime/media yang disinkronkan, kemudian nilai default bawaan. Perubahan runtime yang persisten dapat menjadi konfigurasi media jika sumbernya dapat ditulis; media ISO hanya-baca tidak dapat menerima pembaruan tersebut.

Lihat [File konfigurasi](/reference/configuration/config.conf) dan [live-config](/reference/configuration/live-config) untuk pengaturan yang didukung.

## Siklus hidup shutdown dan penyimpanan

Shutdown normal terlebih dahulu memberi kesempatan kepada sistem yang berjalan untuk menyelesaikan penulisan data layanan dan sesi. Sesi SquashFS dengan penyimpanan saat shutdown yang diaktifkan akan dibuat ulang dan divalidasi sebelum filesystem dilepas. Backend penyimpanan menulis penanda penyelesaian untuk sesi yang sedang berjalan; initramfs shutdown memeriksa penanda tersebut dan membiarkan sesi berstatus dirty jika penyimpanan wajib gagal.

Selanjutnya, initramfs shutdown melepaskan perangkat loop yang tidak digunakan, melepas mount root lama dan lapisan tulis, mencatat sesi yang berhasil sebagai clean, melepas mount media, lalu menutup mapping LUKS yang dimiliki MiniOS. Media optik kemudian dapat dikeluarkan sebelum daya dimatikan atau sistem dinyalakan ulang. Penyimpanan manual dan berkala SquashFS menggunakan backend snapshot yang sama, tetapi hanya kebijakan shutdown yang dikonfigurasi yang mencegah finalisasi clean jika penyimpanan saat shutdown tidak ada.

## Struktur media

Image saat ini memiliki struktur sebagai berikut. Direktori opsional hanya muncul jika fitur terkait telah membuat konten.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>.sb
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

Path yang telah di-boot di `/run/initramfs/memory/` adalah mount implementasi, bukan salinan kedua yang persisten dari struktur ini.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Penemuan sistem Initrd](/reference/boot-process/System-Discovery)
- [Pemuatan modul Initrd](/reference/boot-process/Module-Loading)
- [Persistensi Initrd](/reference/boot-process/Persistence-Internals)
- [Parameter boot](/reference/Boot-Parameters)
- [Menu boot](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [File konfigurasi](/reference/configuration/config.conf)
- [Manajemen sesi](/using-minios/Sessions-and-Persistence)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
