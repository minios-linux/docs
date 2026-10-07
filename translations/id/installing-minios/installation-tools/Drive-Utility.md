---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitas Disk

Utilitas Disk adalah utilitas disk GTK umum yang disertakan bersama MiniOS. Aplikasi ini dapat menulis image disk yang sudah ada, membuat image dari perangkat fisik, memformat seluruh perangkat, atau menghapusnya. Tidak terbatas pada media MiniOS dan bukan pengganti Penginstal MiniOS.

Buka dari menu aplikasi di bawah **Sistem**, atau jalankan:

```bash
driveutility
```

## Keamanan

Menulis image, memformat, dan menghapus adalah operasi yang bersifat merusak data. Pastikan target yang dipilih sudah benar berdasarkan perangkat, model, dan kapasitas sebelum mengonfirmasi. Selalu cadangkan data penting dan lepas perangkat penyimpanan eksternal yang tidak terkait jika memungkinkan.

Disk yang sedang ter-mount disembunyikan secara default. Anda dapat menampilkannya secara eksplisit, namun Utilitas Disk akan memberikan peringatan sebelum melakukan operasi yang merusak dan backend akan mencoba melepaskan (unmount) perangkat serta partisi yang dipilih sebelum mengubahnya. Jika status mount tidak jelas atau sistem file masih ter-mount, operasi akan gagal dan tidak akan dilanjutkan di bawah sistem file yang aktif.

## Tulis image

**Tulis** menyalin image byte-per-byte ke perangkat yang dipilih. Input image terkompresi akan terdeteksi oleh backend jika didukung.

Penggunaan umumnya meliputi menulis ISO MiniOS ke media USB atau SD serta mengembalikan image perangkat utuh yang telah dibuat sebelumnya.
Untuk ISO MiniOS, ini adalah penulisan image mentah (raw). Proses ini menyalin partisi ISO dan tata letak boot persis seperti yang ada di dalam image. Ini **tidak** membuat partisi data tambahan yang dapat ditulis, membuat sesi persistensi, atau melakukan deployment Penginstal MiniOS yang terkelola.

Persistensi setelah penulisan raw tetap bergantung pada mode boot dan media penyimpanan yang dapat ditulis yang tersedia pada image hasil. Untuk tata letak target yang terkelola atau sesi yang sudah dibuat sebelumnya, gunakan [Penginstal MiniOS](/installing-minios/MiniOS-Installer).

Contoh CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Buat image perangkat

**Buat Image** membaca perangkat fisik ke dalam file image. Output dapat tetap dalam bentuk raw atau dikompresi selama proses penulisan.

Pilihan kompresi yang didukung antara lain:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) jika dukungan Python zstd yang diperlukan sudah terpasang

Aplikasi grafis juga dapat mengatur file hasil agar menjadi milik pengguna desktop sehingga backup yang dibuat oleh root langsung dapat digunakan tanpa perlu mengubah kepemilikan secara terpisah.
Contoh CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

Ekstensi khusus kompresi akan ditambahkan secara otomatis oleh pembaca command-line.

## Format perangkat

**Format** membuat tata letak sistem file tunggal yang baru pada perangkat yang dipilih. Pilihan sistem file saat ini meliputi:

- FAT32
- exFAT
- NTFS
- ext4

Anda dapat mengatur label volume. Untuk ext4, Utilitas Disk dapat mengatur direktori root agar menjadi milik pengguna dan grup yang dipilih.

Proses format ini terpisah dari penulisan ISO MiniOS. Pilihan sistem file di halaman ini hanya berlaku untuk operasi format Utilitas Disk; tidak mengubah tata letak sistem file yang tertanam pada penulisan ISO mentah.

Contoh CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Hapus perangkat

**Hapus** memilih antara operasi penghapusan native dari controller, discard/TRIM, dan penimpaan dari sisi host sesuai dengan perangkat yang dipilih dan metode yang diminta.

Backend yang didukung saat ini meliputi:

- **Secure erase** — secara otomatis memilih metode yang didukung controller jika tersedia.
- **ATA Secure Erase / Enhanced Secure Erase** — dijalankan melalui UDisks2 untuk drive SATA/ATA yang didukung; perangkat yang frozen atau tidak didukung akan ditolak.
- **NVMe User Data Erase / Cryptographic Erase** — menggunakan NVMe Format NVM hanya jika controller melaporkan kemampuan yang diminta.
- **Discard / secure discard** — menggunakan `blkdiscard` jika block device mendukung discard.
- **Zero overwrite** — menulis data nol dari host.
- **Random overwrite** — menulis data acak sesuai jumlah pass yang diminta dan dapat menambahkan pass nol terakhir.

Penghapusan aman melalui controller tidak sama dengan menimpa setiap blok logis secara berulang dari sisi host. Ketersediaan fitur ini tergantung pada firmware perangkat, antarmuka kernel, UDisks2, `nvme-cli`, dan `blkdiscard` dukungan.
Untuk perangkat NVMe, Utilitas Disk mempertahankan format LBA namespace aktif, pengaturan metadata, dan pengaturan informasi perlindungan saat menjalankan Format NVM. Utilitas ini juga akan menolak operasi controller yang cakupannya dapat memengaruhi beberapa namespace jika target tidak dapat dipastikan aman sebagai operasi satu namespace.

Contoh:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Gunakan kontrol overwrite-pass dan partial-size hanya untuk metode zero/random tradisional. Penghapusan melalui controller dan discard berjalan sesuai perintah perangkat, bukan berdasarkan jumlah byte dari sisi host.

## Perangkat command-line

Utilitas Disk memasang empat perintah tingkat bawah:

| Perintah | Tujuan |
|---|---|
| `driveutility-write` | Menulis image mentah atau terkompresi yang didukung ke perangkat blok. |
| `driveutility-read` | Membuat image mentah atau terkompresi dari perangkat blok. |
| `driveutility-format` | Membuat penyimpanan FAT32, exFAT, NTFS, atau ext4 pada perangkat. |
| `driveutility-wipe` | Menghapus melalui metode controller, discard, atau overwrite. |

Semua perintah yang bersifat merusak sebaiknya hanya dijalankan setelah memverifikasi perangkat target secara tepat. Gunakan halaman man yang terpasang dan `--help` output untuk opsi khusus versi.

## Utilitas Disk vs Penginstal MiniOS

Gunakan **Utilitas Disk** saat Anda ingin melakukan operasi disk umum: penulisan image mentah, pembuatan image perangkat, format, atau penghapusan.

Gunakan **Penginstal MiniOS** jika Anda membutuhkan deployment yang sadar MiniOS dengan penempatan terkontrol, pilihan sistem file dan tata letak boot, pemilihan modul, konfigurasi, atau pembuatan sesi live opsional.

Untuk cara lain menempatkan MiniOS ke media, lihat [Metode instalasi](/installing-minios/Installation-Methods). Untuk penyimpanan perubahan setelah boot, lihat [Mode boot](/using-minios/Boot-Modes) dan [Sesi dan persistensi](/using-minios/Sessions-and-Persistence).
