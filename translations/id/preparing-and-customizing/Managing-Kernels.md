---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Mengelola kernel

Manajer Kernel MiniOS mengemas, memeriksa, mengaktifkan, dan menghapus bundel kernel untuk sistem live modular MiniOS. Kernel MiniOS adalah satu set terkoordinasi: image kernel, initramfs, dan `01-kernel-<version>.sb` modul yang sesuai harus tetap bersama.

Alur kerja ini hanya berlaku untuk arsitektur live. Instalasi native menggunakan paket kernel Debian atau Ubuntu biasa, alat initramfs standar, dan bootloader yang telah terpasang.

## Fungsi Kernel Manager

Antarmuka grafis **Manajer Kernel MiniOS** dan `minios-kernel` CLI menggunakan backend yang sama. Keduanya dapat:

- menampilkan daftar kernel yang dikemas dan membedakan versi yang sedang berjalan, aktif, dan tidak aktif;
- mengemas kernel versi nyata dari repository APT yang telah dikonfigurasi;
- mengemas satu set file kernel lokal yang konsisten `.deb`;
- secara opsional menambahkan driver terpilih dari katalog DKMS MiniOS yang telah dikurasi saat mengemas kernel dari repository;
- membangun initramfs MiniOS dan modul kernel SquashFS yang sesuai;
- menyimpan bundel yang sudah selesai di repository kernel MiniOS;
- mengaktifkan bundel lengkap untuk boot berikutnya dan memperbarui konfigurasi bootloader yang didukung;
- menghapus kernel yang dikemas dan tidak aktif.

Kernel Manager tidak melakukan kompilasi source tree kernel secara acak. Jika Anda perlu mengubah input build kernel MiniOS itu sendiri, gunakan alur kerja build source MiniOS sebagai gantinya.

## Mulai manajer grafis

Jalankan dari menu aplikasi MiniOS atau gunakan perintah berikut:

```bash
minios-kernel-manager
```

Aplikasi ini memisahkan pengelolaan kernel yang terpasang dari proses pengemasan. Kernel repository dapat dicari berdasarkan nama paket atau versi kernel yang ditampilkan. Kontrol paket tidak tersedia jika root MiniOS yang terdeteksi tidak dapat ditulis.

Operasi backend yang membutuhkan hak istimewa menggunakan PolicyKit. `minios-kernel` CLI mandiri memerlukan akses root untuk setiap perintah kecuali bantuan.

## Mengemas kernel dari repository

Pilih **Repository** di tampilan pengemasan dan pilih paket kernel versi nyata, misalnya:

```text
linux-image-6.12.107+deb13-amd64
```

Metapackage pelacak seperti `linux-image-amd64` tidak diterima sebagai sumber paket. Mode repository menggunakan sumber APT, konfigurasi kepercayaan, dan daftar paket yang telah dikonfigurasi pada sistem yang sedang berjalan. Ketergantungan split-kernel versi yang sesuai akan diselesaikan secara otomatis jika distribusi menggunakannya.

GUI tidak menjalankan `apt update` hanya karena daftar paket sudah lama. Segarkan secara manual jika diperlukan, atau gunakan `--force-update` melalui CLI.

### Tambah driver DKMS terkurasi

Pengemasan dari repository dapat menambahkan driver terpilih dari katalog DKMS MiniOS `01-kernel`. GUI akan menampilkan pilihan yang kompatibel untuk kernel yang dipilih; CLI menerima opsi `--dkms-driver` yang dapat diulang:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Driver yang dipilih akan dibangun di overlay/chroot terisolasi dengan header yang sesuai. Backend akan memverifikasi bahwa modul yang dihasilkan cocok dengan kernel target sebelum memasukkannya, dan mencatat asal-usul driver di dalam bundel di bawah `/usr/share/minios/kernel-dkms/`.

Fitur ini merupakan kompatibilitas terkurasi, bukan frontend DKMS umum. Paket kernel lokal manual tidak menyediakan pemilihan driver karena header repository yang cocok tidak dapat dideteksi secara andal.

## Mengemas paket kernel lokal

Untuk kernel lokal, sediakan semua file `.deb` yang diperlukan dari build kernel yang sama:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian dan Ubuntu dapat membagi satu kernel ke beberapa paket. Backend akan memeriksa bahwa image, modul, base, dan paket modules-extra opsional yang disediakan membentuk satu versi yang konsisten, bukan menggabungkan revisi yang tidak berhubungan secara diam-diam.

## Output pengemasan dan kompresi

Proses pengemasan menghasilkan image kernel, initramfs, dan modul kernel SquashFS. Metadata paket terpilih disimpan di dalam modul pada `/usr/share/minios/kernel-dpkg/`.

Metode kompresi bawaan adalah SquashFS `zstd`. Metode lain hanya tersedia jika alat yang dibutuhkan ada; saat ini didukung `lz4`, `lzo`, `gzip`, `lzma`, `xz`, dan `bzip2`.

Jika root MiniOS dapat ditulis dan output yang diminta berada di lokasi lain, bundel yang sudah selesai akan dipindahkan secara atomik ke:

```text
<MiniOS-root>/kernels/<version>/
```

Unduhan dari repository hanya digunakan sementara sebagai input build dan akan dihapus setelah proses pengemasan selesai atau gagal. `.deb`Input lokal tetap menjadi tanggung jawab pemanggil.

## Kompatibilitas persistensi terenkripsi

Jika initramfs MiniOS yang sedang berjalan mengiklankan persistensi LUKS berlapis, kernel pengganti harus mempertahankan jalur boot dm-crypt. Initramfs yang dihasilkan akan diperiksa untuk dukungan cryptsetup yang diperlukan, modul dm-crypt, dan penanda kemampuan crypto MiniOS.

Proses pengemasan akan gagal daripada menghasilkan bundel kernel yang membuat sesi persistensi terenkripsi tidak dapat boot.

## Aktivasi dan penghapusan kernel

Tampilan manajemen membedakan:

- **RUNNING** — kernel yang sedang berjalan pada boot saat ini;
- **ACTIVE** — bundel lengkap yang dipilih untuk boot berikutnya;
- **AVAILABLE** — bundel lain yang telah dikemas di repository MiniOS.

Aktivasi memerlukan entri repository yang lengkap. Proses ini akan menyiapkan image kernel, initramfs, modul SquashFS aktif, penanda versi aktif, dan perubahan bootloader sebagai satu operasi terkoordinasi. Konfigurasi GRUB diperlukan; konfigurasi SYSLINUX native akan diperbarui jika ada. Jika aktivasi gagal, file boot yang sudah disiapkan akan dikembalikan seperti semula.

Aktivasi hanya mengubah boot berikutnya; tidak me-reboot sistem saat ini. Pastikan setidaknya ada satu bundel lengkap yang sudah terbukti berhasil sebelum mengganti kernel.

Hapus hanya kernel yang telah dikemas dan tidak aktif jika memang sudah tidak diperlukan. Jangan mencampur image kernel, initramfs, atau `01-kernel-*.sb` dari bundel yang berbeda secara manual.

## Referensi baris perintah

Perintah yang umum digunakan antara lain:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Mengemas dari repository atau file lokal:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Tambahkan `--json` untuk output terstruktur. Gunakan bantuan dan manual yang terpasang untuk opsi yang tersedia pada versi yang sedang berjalan:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Tata letak penyimpanan

Kernel Manager mendeteksi root konten MiniOS secara otomatis, bukan mengasumsikan nama block-device tertentu. Path yang dikelola bersifat relatif terhadap root tersebut:

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
Path modul runtime utama adalah `/lib/modules/<version>`. Pada sistem usrmerged, path tersebut mengarah ke `/usr/lib/modules/<version>`; pada tata letak lama, file dapat disimpan secara fisik di bawah `/lib`. Pengemasan akan menolak pohon modul versi sama yang sudah ada daripada mencampur dengan revisi paket berbeda.

## Pemulihan setelah kernel bermasalah

Jika kernel yang baru diaktifkan gagal, boot set kernel lengkap MiniOS yang sudah terbukti jika masih tersedia. Jangan memperbaiki instalasi dengan menyalin file kernel, initramfs, atau SquashFS secara individual dari image lain: file-file tersebut merupakan satu bundel terkoordinasi.

Jika tidak ada bundel lengkap yang terbukti tersisa, boot media rescue tepercaya, amankan data penting, lalu instal ulang atau pulihkan instalasi MiniOS yang terdampak. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting) dan [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Dokumentasi terkait

- [Arsitektur sistem MiniOS](/reference/System-Architecture)
- [Pemanggilan modul initrd](/reference/boot-process/Module-Loading)
- [Membangun MiniOS](/development/Building-MiniOS)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
