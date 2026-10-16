---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitas Disk

Utilitas Disk adalah utilitas disk GTK serbaguna yang disertakan dengan MiniOS. Utilitas ini dapat menulis image disk yang sudah ada, membuat image dari perangkat fisik, memformat seluruh perangkat, atau menghapusnya. Utilitas ini tidak terbatas pada media MiniOS dan bukan pengganti Penginstal MiniOS.

Buka dari menu aplikasi di bagian **Sistem**, atau jalankan:

```bash
driveutility
```

## Keamanan

Menulis image, memformat, dan menghapus data adalah operasi yang merusak data. Pastikan target sudah benar dengan memeriksa perangkat, model, dan kapasitasnya sebelum mengonfirmasi. Cadangkan semua data penting dan, jika memungkinkan, lepaskan drive lepasan lain yang tidak terkait.

Secara default, disk yang terpasang tidak ditampilkan. Anda dapat menampilkannya secara eksplisit, tetapi Utilitas Disk akan memberikan peringatan sebelum operasi yang merusak data. Backend juga akan mencoba melepas kait perangkat yang dipilih beserta partisinya sebelum mengubahnya. Jika status pemasangan tidak jelas atau sistem file masih terpasang, operasi akan gagal alih-alih dilanjutkan saat sistem file masih aktif.

## Menulis image

**Tulis** menyalin image byte demi byte ke perangkat yang dipilih. Backend akan mendeteksi input image terkompresi jika didukung.

Contoh penggunaan umum mencakup menulis ISO MiniOS ke media USB atau SD, serta memulihkan image seluruh perangkat yang telah dibuat sebelumnya.
Untuk ISO MiniOS, ini adalah penulisan image mentah. Proses ini menyalin partisi ISO dan tata letak boot persis seperti yang tersimpan dalam image. Proses ini **tidak** membuat partisi data tambahan yang dapat ditulis, membuat sesi persistensi, atau melakukan deployment Penginstal MiniOS terkelola.

Persistensi setelah penulisan mentah tetap bergantung pada mode boot dan penyimpanan yang dapat ditulis yang tersedia pada image hasilnya. Untuk tata letak target terkelola atau sesi yang telah dibuat sebelumnya, gunakan [Penginstal MiniOS](/installing-minios/MiniOS-Installer).

Contoh CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Membuat image perangkat

**Buat Image** membaca perangkat fisik dan menyimpannya ke file image. File output dapat tetap dalam format mentah atau dikompresi saat ditulis.

Pilihan kompresi yang didukung:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) jika dukungan zstd Python yang diperlukan telah terpasang

Aplikasi grafis juga dapat menetapkan file hasil ke pengguna desktop, sehingga cadangan yang dibuat oleh root langsung dapat digunakan tanpa perlu memperbaiki kepemilikan secara terpisah.
Contoh CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

Ekstensi khusus kompresi ditambahkan secara otomatis oleh pembaca command-line.

## Format perangkat

**Format** akan membuat tata letak sistem berkas tunggal yang baru pada perangkat yang dipilih. Pilihan sistem berkas saat ini:

- FAT32
- exFAT
- NTFS
- ext4

Anda dapat menetapkan label volume. Untuk ext4, Utilitas Disk dapat menetapkan direktori root kepada pengguna dan grup yang dipilih.

Pemformatan tidak bergantung pada penulisan ISO MiniOS. Pilihan sistem berkas di halaman ini menjelaskan operasi pemformatan Utilitas Disk; pilihan tersebut tidak mengubah tata letak sistem berkas yang tertanam dalam penulisan ISO mentah.

Contoh CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Hapus perangkat

**Penghapusan** memilih antara operasi penghapusan bawaan pengontrol, discard/TRIM, dan penimpaan dari host berdasarkan perangkat yang dipilih dan metode yang diminta.

Backend yang tersedia saat ini mencakup:

- **Penghapusan aman** — otomatis memilih metode yang didukung pengontrol jika tersedia.
- **ATA Secure Erase / Enhanced Secure Erase** — dijalankan melalui UDisks2 untuk drive SATA/ATA yang didukung; perangkat yang terkunci atau tidak didukung akan ditolak.
- **NVMe User Data Erase / Cryptographic Erase** — menggunakan NVMe Format NVM hanya jika pengontrol melaporkan kemampuan yang diminta.
- **Discard / secure discard** — menggunakan `blkdiscard` saat perangkat blok mendukung discard.
- **Penimpaan dengan nol** — menulis nilai nol dari host.
- **Penimpaan dengan data acak** — menulis data acak sebanyak jumlah lintasan yang diminta dan dapat menambahkan satu lintasan nol di akhir.

Penghapusan aman oleh pengontrol tidak sama dengan menimpa setiap blok logis berulang kali dari host. Ketersediaannya bergantung pada firmware perangkat, antarmuka kernel, UDisks2, `nvme-cli`, dan dukungan `blkdiscard` .
Untuk perangkat NVMe, Utilitas Disk mempertahankan format LBA namespace aktif, pengaturan metadata, dan pengaturan informasi proteksi saat menjalankan Format NVM. Utilitas Disk juga menolak operasi pengontrol yang cakupannya dapat memengaruhi beberapa namespace jika keamanan target sebagai operasi satu namespace tidak dapat dipastikan.

Contoh:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Gunakan kontrol jumlah lintasan penimpaan dan ukuran parsial hanya untuk metode nol/acak tradisional. Penghapusan oleh pengontrol dan discard mengikuti perintah perangkat, bukan jumlah byte yang ditentukan dari host.

## Alat baris perintah

Utilitas Disk memasang empat perintah tingkat rendah:

| Perintah | Fungsi |
|---|---|
| `driveutility-write` | Menulis image mentah atau image terkompresi yang didukung ke perangkat blok. |
| `driveutility-read` | Membuat image mentah atau terkompresi dari perangkat blok. |
| `driveutility-format` | Membuat penyimpanan FAT32, exFAT, NTFS, atau ext4 pada perangkat. |
| `driveutility-wipe` | Menghapus melalui metode pengontrol, discard, atau penimpaan. |

Jalankan perintah yang dapat menghapus data hanya setelah memastikan perangkat target yang tepat. Gunakan halaman man yang terpasang dan keluaran `--help` untuk opsi khusus versi.

## Utilitas Disk versus Penginstal MiniOS

Gunakan **Utilitas Disk** jika operasi yang diinginkan adalah tindakan disk umum: menulis image mentah, membuat image perangkat, memformat, atau menghapus.

Gunakan **Penginstal MiniOS** jika Anda ingin melakukan deployment yang memperhatikan MiniOS, dengan kontrol atas penempatan, pilihan sistem berkas dan tata letak boot, pemilihan modul, konfigurasi, atau pembuatan sesi live opsional.

Untuk cara lain memasang MiniOS ke media, lihat [Metode instalasi](/installing-minios/Installation-Methods). Untuk perubahan tersimpan setelah boot, lihat [Mode boot](/using-minios/Boot-Modes) dan [Sesi dan persistensi](/using-minios/Sessions-and-Persistence).
