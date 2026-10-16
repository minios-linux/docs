---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Mengelola kernel

Manajer Kernel MiniOS mengemas, memeriksa, mengaktifkan, dan menghapus bundel kernel untuk sistem modular MiniOS live. Kernel MiniOS adalah satu set terpadu yang terdiri dari image kernel, initramfs, dan `01-kernel-<version>.sb` modul yang sesuai harus tetap bersama.

Alur kerja ini hanya berlaku untuk arsitektur live. Instalasi native menggunakan paket kernel Debian atau Ubuntu biasa, tooling initramfs standar, dan bootloader yang terpasang.

## Fungsi Manajer Kernel

Antarmuka grafis **Manajer Kernel MiniOS** dan `minios-kernel` CLI menggunakan backend yang sama. Keduanya dapat:

- menampilkan kernel yang dikemas serta membedakan versi yang sedang berjalan, aktif, dan tidak aktif;
- mengemas kernel berversi yang tersedia di repositori APT yang dikonfigurasi;
- mengemas satu set file kernel lokal `.deb` yang konsisten;
- secara opsional menambahkan driver pilihan dari katalog DKMS MiniOS terkurasi saat mengemas kernel dari repositori;
- membangun initramfs MiniOS dan modul kernel SquashFS yang sesuai;
- menyiapkan bundel yang telah selesai di repositori kernel MiniOS;
- mengaktifkan bundel lengkap untuk boot berikutnya dan memperbarui konfigurasi bootloader yang didukung;
- menghapus kernel terkemas yang tidak aktif.

Manajer Kernel tidak mengompilasi source tree kernel sembarang. Jika Anda perlu mengubah input build kernel MiniOS itu sendiri, gunakan alur kerja build source MiniOS.

## Jalankan manajer grafis

Buka dari menu aplikasi MiniOS atau jalankan:

```bash
minios-kernel-manager
```

Aplikasi ini memisahkan pengelolaan kernel yang terpasang dari proses pengemasan. Kernel repositori dapat dicari berdasarkan nama paket atau versi kernel yang ditampilkan. Kontrol paket tidak tersedia jika root MiniOS yang terdeteksi tidak dapat ditulisi.

Operasi backend yang memerlukan hak istimewa menggunakan PolicyKit. `minios-kernel`CLI mandiri memerlukan akses root untuk setiap perintah selain help.

## Mengemas kernel dari repositori

Pilih **Repositori** pada tampilan pengemasan, lalu pilih paket kernel berversi yang sebenarnya, misalnya:

```text
linux-image-6.12.107+deb13-amd64
```

Metapaket pelacakan seperti `linux-image-amd64` tidak diterima sebagai sumber paket. Mode repositori menggunakan sumber APT, konfigurasi kepercayaan, dan daftar paket yang dikonfigurasi pada sistem yang sedang berjalan. Dependensi kernel terpisah dengan versi yang sesuai akan diatasi secara otomatis jika distribusi menggunakannya.

GUI tidak menjalankan `apt update` hanya karena daftar paket sudah lama. Perbarui daftar secara manual bila diperlukan, atau gunakan `--force-update` dengan CLI.

### Tambahkan driver DKMS pilihan

Pengemasan repositori dapat menambahkan driver pilihan dari MiniOS `01-kernel` katalog DKMS. GUI menampilkan pilihan yang kompatibel untuk kernel yang dipilih; CLI menerima opsi `--dkms-driver` yang dapat diulang:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Driver pilihan dibuat dalam overlay/chroot terisolasi dengan header yang sesuai. Backend memverifikasi bahwa modul yang dihasilkan cocok dengan kernel target sebelum menyertakannya, lalu mencatat asal-usul driver di dalam bundle pada `/usr/share/minios/kernel-dkms/`.

Fitur ini menyediakan kompatibilitas untuk driver pilihan, bukan frontend DKMS generik. Paket kernel lokal yang dipasang secara manual tidak menyediakan pilihan driver karena header repositori yang sesuai tidak dapat ditentukan dengan andal.

## Kemas paket kernel lokal

Untuk kernel lokal, sertakan semua file `.deb` yang diperlukan dari build kernel yang sama:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian dan Ubuntu dapat membagi satu kernel ke dalam beberapa paket. Backend memeriksa apakah paket image, modules, base, dan modules-extra opsional yang disertakan memiliki versi yang konsisten, alih-alih diam-diam menggabungkan revisi yang tidak terkait.

## Output pengemasan dan kompresi

Proses pengemasan menghasilkan image kernel, initramfs, dan modul kernel SquashFS. Metadata paket pilihan disimpan di dalam modul pada `/usr/share/minios/kernel-dpkg/`.

Kompresi SquashFS default adalah `zstd`. Metode lain hanya tersedia jika alat yang diperlukan tersedia; saat ini metode yang didukung mencakup `lz4`, `lzo`, `gzip`, `lzma`, `xz`, dan `bzip2`.

Jika root MiniOS yang dapat ditulisi terdeteksi dan output yang diminta berada di lokasi lain, bundle yang telah selesai akan ditempatkan secara atomik di:

```text
<MiniOS-root>/kernels/<version>/
```

Unduhan repositori adalah input build sementara dan akan dihapus setelah proses pengemasan selesai atau setelah kegagalan ditangani. Input lokal `.deb` tetap menjadi milik pemanggil.

## Kompatibilitas persistensi terenkripsi

Jika initramfs MiniOS yang sedang berjalan mengiklankan dukungan persistensi LUKS berlapis, kernel pengganti harus mempertahankan jalur boot dm-crypt. Initramfs yang dihasilkan diperiksa untuk memastikan dukungan cryptsetup, modul dm-crypt, dan penanda kemampuan kripto MiniOS tersedia.

Proses pengemasan akan gagal, alih-alih menghasilkan bundle kernel yang membuat sesi persistensi terenkripsi tidak dapat di-boot.

## Aktifkan dan hapus kernel

Tampilan pengelolaan membedakan:

- **BERJALAN** — kernel yang sedang berjalan pada boot saat ini;
- **AKTIF** — bundle lengkap yang dipilih untuk boot berikutnya;
- **TERSEDIA** — bundle lain yang dikemas dalam repositori MiniOS.

Aktivasi memerlukan entri repositori yang lengkap. Proses ini menyiapkan image kernel, initramfs, modul SquashFS aktif, penanda versi aktif, dan perubahan bootloader sebagai satu operasi terkoordinasi. Konfigurasi GRUB wajib tersedia; konfigurasi SYSLINUX native diperbarui jika ada. Jika aktivasi gagal, file boot yang telah disiapkan akan dikembalikan.

Aktivasi hanya mengubah boot berikutnya; sistem saat ini tidak akan di-boot ulang. Simpan setidaknya satu bundle lengkap yang diketahui berfungsi dengan baik sampai penggantinya berhasil melakukan boot.

Hapus hanya kernel dalam paket yang tidak aktif dan tidak lagi diperlukan. Jangan mencampur image kernel, initramfs, atau `01-kernel-*.sb` dari bundle yang berbeda secara manual.

<a id="command-line-reference"></a>

## Referensi baris perintah

Perintah yang umum digunakan:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Paket dari repositori atau file lokal:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Tambahkan `--json` untuk output terstruktur. Gunakan bantuan dan manual yang terpasang untuk mengetahui opsi yang tersedia secara tepat pada versi yang sedang berjalan:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Tata letak penyimpanan

Kernel Manager menemukan root konten MiniOS alih-alih mengasumsikan nama perangkat blok tertentu. Jalur yang dikelola bersifat relatif terhadap root tersebut:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
Jalur modul runtime kanonis adalah `/lib/modules/<version>`. Pada sistem usrmerged, jalur tersebut mengarah ke `/usr/lib/modules/<version>`; tata letak lama dapat menyimpannya secara fisik di `/lib`. Proses pengemasan menolak pohon modul dengan versi yang sama jika sudah ada, alih-alih mencampurnya dengan revisi paket yang berbeda.

## Pemulihan setelah kernel bermasalah

Jika kernel yang baru diaktifkan gagal, boot menggunakan set kernel MiniOS lengkap yang diketahui berfungsi dengan baik, jika masih tersedia. Jangan memperbaiki instalasi dengan menyalin file kernel, initramfs, atau SquashFS satu per satu dari image lain: file-file tersebut merupakan satu bundle yang terkoordinasi.

Jika tidak ada lagi bundle lengkap yang diketahui berfungsi dengan baik, boot dari media pemulihan tepercaya, amankan data penting, lalu instal ulang atau pulihkan instalasi MiniOS yang terdampak. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting) dan [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Dokumentasi terkait

- [Arsitektur sistem MiniOS](/reference/System-Architecture)
- [Pemuatan modul Initrd](/reference/boot-process/Module-Loading)
- [Membangun MiniOS](/development/Building-MiniOS)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
