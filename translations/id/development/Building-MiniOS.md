---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# Membangun MiniOS

MiniOS dirakit dari image inti SquashFS, modul ekstensi yang diurutkan, file kernel dan boot, serta konfigurasi yang dihasilkan. Halaman ini menjelaskan antarmuka build pada source tree saat ini dan dependensi antarhasilnya.

Jalankan `./minios-cmd --help`, `./minios-live --help`, dan periksa `build.conf` yang dipilih sebelum membangun. File-file tersebut adalah acuan untuk versi yang sedang di-checkout.

## Persyaratan

Lakukan build di Debian atau Ubuntu dengan ruang kosong yang cukup, minimal `BUILD_DIR` dan `/tmp`.
Target desktop biasanya membutuhkan setidaknya 20 GiB. Operasi build memerlukan akses root untuk debootstrap, chroot, mount, perangkat loop, dan pembuatan image; menampilkan bantuan tidak memerlukannya.

Daftar paket host yang menjadi acuan ada di `linux-live/prerequisites.list`. Untuk checkout saat ini, paket-paket tersebut dapat diinstal dengan:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Pada source checkout, `minios-live` memeriksa daftar ini sebelum build, kecuali jika `SKIP_SETUP_HOST=true`. Di host biasa, perintah ini melaporkan paket yang belum tersedia lalu berhenti; instalasi otomatis hanya digunakan pada jalur build container.

Konfigurasi default memeriksa konektivitas Internet. Pemeriksaan ini dapat dinonaktifkan dengan `CHECK_INTERNET_CONNECTION=false` dan dilewati jika tersedia repositori cache APT yang sudah disiapkan, tetapi semua paket dan file boot yang diperlukan tetap harus tersedia dari repositori atau cache yang dikonfigurasi.

Jika `USE_APT_CACHER=true`, layanan apt-cacher-ng yang dapat dijangkau harus sudah dikonfigurasi di `APT_CACHER_ADDRESS`; jika tidak, atur opsi ke `false` sebelum build.

::: danger Kepercayaan bootstrap
Jalur bootstrap saat ini memanggil debootstrap dengan `--no-check-gpg` dan mengambil kunci arsip MiniOS melalui HTTP tanpa autentikasi. Jangan gunakan image yang dihasilkan sebagai artefak rilis tepercaya sampai jalur sumber ini menerapkan verifikasi kunci dan bootstrap yang terautentikasi.
:::

## Build cepat

Kloning repositori, lalu jalankan frontend dari direktori root-nya:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Empat opsi target wajib diisi jika tidak ada file konfigurasi yang dipilih:

| Opsi | Pengaturan |
| --- | --- |
| `-d`, `--distribution` | Suite distribusi target |
| `-a`, `--architecture` | Arsitektur target |
| `-de`, `--desktop-environment` | Lingkungan modul |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox`, atau `ultra` |

Nilai distribusi, arsitektur, desktop, kompresi, dan varian yang saat ini didukung tercantum di `linux-live/build.conf`. Jangan menyimpulkan dukungan hanya berdasarkan contoh perintah lama.

## Antarmuka build

### `minios-cmd`

`minios-cmd` menyalin template konfigurasi ke direktori kerja target, menulis pengaturan frontend ke salinan tersebut, dan memulai `minios-live -` pipeline lengkap. Opsi umum meliputi:

| Opsi | Efek |
| --- | --- |
| `-b`, `--build-dir` | Pilih root output build |
| `-c`, `--compression-type` | Pilih kompresi SquashFS |
| `-kp`, `--kernel-provider` | Pilih `distribution` atau `minios` |
| `-kf`, `--kernel-flavour` | Pilih varian kernel distribusi |
| `-mk`, `--minios-kernel` | Pilih penyedia kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Pilih `auto`, `6.1`, atau `6.12` dan tentukan penyedia MiniOS |
| `-kpm`, `--kernel-payload-mode` | Pilih `runtime` atau `full` |
| `-dkms`, `--kernel-build-dkms` | Build driver opsional untuk kernel yang dipilih |
| `-l`, `--locale` | Atur lokal sistem |
| `-ml`, `--multilingual` | Buat beberapa lokal |
| `-kl`, `--keep-locales` | Pertahankan lokal yang tersedia |
| `-tz`, `--timezone` | Atur zona waktu sistem live |
| `-ib`, `--initramfs-builder` | Pilih `livekit` atau `dracut` |
| `-mln`, `--menu-language` | Pilih bahasa menu boot |

Contoh:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Buat konfigurasi tanpa memulai build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Tanpa tujuan lain, ini akan menulis ke `build/build.conf`. Frontend tetap memerlukan akses root dalam mode ini.

`--config-file FILE` memilih konfigurasi untuk disalin. Implementasi saat ini kemudian menulis nilai baris perintah yang telah diurai dan nilai default frontend yang tidak kosong ke salinan kerja, meskipun redaksi di `--help` lebih singkat. Untuk konfigurasi yang dikelola secara manual dan harus persis, jalankan `minios-live` secara langsung dan periksa file yang aktif, alih-alih mengandalkan penggabungan frontend.

Jangan gabungkan `--config-only` dengan `--config-file` yang mengarah ke konfigurasi yang sudah ada: mode config-only menyalin template default ke jalur tersebut.
Gunakan `-b DIR --config-only` untuk memilih tujuan terpisah bagi hasil yang dibuat.

### `minios-live`

`minios-live` adalah backend yang telah disiapkan. Di checkout source, secara default backend membaca `linux-live/build.conf`; salinan yang diinstal membaca `/etc/minios-live/build.conf`. Pilih file dan root output lain melalui variabel lingkungan:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Gunakan jalur `BUILD_CONF` absolut di seluruh `sudo`. File konfigurasi dijalankan sebagai Bash, jadi hanya gunakan file tepercaya. Backend tidak menyediakan flag untuk mengganti variabel konfigurasi satu per satu.

## Tahapan build

Pipeline berjalan dengan urutan berikut:

1. `build-bootstrap` membuat root target minimal dengan debootstrap.
2. `build-chroot` menginstal dan mengonfigurasi sistem inti.
3. `build-live` membuat modul `00-core` SquashFS.
4. `build-modules` membangun modul lingkungan yang dipilih sesuai urutannya.
5. `build-boot` menghasilkan initramfs, kernel, EFI, dan file bootloader.
6. `build-config` menghasilkan MiniOS dan konfigurasi boot.
7. `build-iso` menerbitkan ISO yang dapat di-boot dan checksum.
8. `remove-sources` menghapus direktori kerja yang dipilih jika dikonfigurasi demikian.

Nama dengan tanda hubung yang ditampilkan di atas dan bentuk dengan garis bawah sama-sama diterima.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Perintah parsial tidak membuat ulang input yang dihilangkan. `build-iso` hanya mengemas pohon image yang telah disiapkan, dan `build-modules` tidak dapat membuat ulang `00-core`. Setelah mengubah tahap sebelumnya, jalankan ulang build hingga tahap terakhir yang bergantung padanya.

Pipeline lengkap dimulai dengan `build-bootstrap`, yang menghapus `core/` dan `image/` yang sudah ada di target terpilih. Simpan konten yang tidak dapat dibuat ulang sebelum memulai; pohon target yang dihasilkan adalah output build, bukan penyimpanan source permanen.

Jika `REMOVE_SOURCES=true`, tahap `remove-sources` terakhir akan menghapus dan membuat ulang seluruh direktori kerja `build/<distribution>-<variant>-<architecture>/`, bukan hanya arsip source yang diunduh. ISO yang diterbitkan, cache bersama, dan log di luar direktori tersebut akan tetap ada.

## Konfigurasi

`linux-live/build.conf` mengontrol identitas target, kernel, lokal, bootloader, pengguna live, layanan, cache, snapshot, pembersihan, dan publikasi. Grup penting meliputi:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, dan `PACKAGE_VARIANT` memilih target dan rangkaian modul.
- `COMP_TYPE` mengontrol kompresi SquashFS.
- `LIVE_MODULE_MODE` memilih `merged` (default saat ini untuk setiap varian) atau `simple` integrasi live-config; pilihan ini tidak lagi ditentukan hanya berdasarkan ukuran edisi.
- `KERNEL_*` dan `MINIOS_KERNEL_SERIES` mengontrol pengambilan kernel dan payload.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, dan `SERIAL_CONSOLE` mengontrol artefak boot.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, dan `USE_APT_CACHER` mengontrol input yang dapat digunakan kembali.
- `VERBOSITY_LEVEL` menerima `0`, `1`, atau `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, dan `BUILD_TEST_ISO` mengontrol publikasi dan pembersihan.

Jangan mengedit `build/<target>/build.conf` yang dihasilkan sebagai pengganti pemeliharaan konfigurasi source yang dipilih.

### Pemilihan kernel

Provider `distribution`menentukan kernel Debian atau Ubuntu yang dipilih dan, jika DKMS diaktifkan, header yang sesuai dalam state APT bertanda tangan yang terisolasi.
`KERNEL_AUTO_SELECT=true` mengambil suite sumber dan arsitektur dari target userspace. Atur ke `false` untuk menggunakan kolom distribusi, arsitektur, versi, snapshot, dan kebijakan pembaruan manual di `build.conf`.

Provider `minios` memasang `linux-image-SERIES-mos-ARCH`, memverifikasi dukungan AUFS, dan menggunakan header MiniOS yang sesuai untuk DKMS. Provider ini memerlukan `KERNEL_FLAVOUR=none` serta arsitektur paket userspace dan kernel yang cocok.
Dalam kode saat ini, `MINIOS_KERNEL_SERIES=auto` ditetapkan ke `6.12`; gunakan `6.1` secara eksplisit jika seri tersebut diperlukan.

`KERNEL_PAYLOAD_MODE=runtime` mempertahankan pohon modul kernel, konfigurasi kernel, `System.map`, metadata deployment, dan integrasi runtime di bawah `modprobe.d`, `modules-load.d`, dan `udev/rules.d`. Komponen ini menghapus state paket khusus build, header, sumber DKMS, alat compiler, dan paket initramfs. Firmware tetap dikelola oleh `02-firmware`. `full` menyertakan payload diagnostik yang lebih lengkap.

## Sistem modul

Sumber modul berada di `linux-live/scripts/`. Lingkungan di bawah `linux-live/environments/<desktop>/` berisi symlink berurutan ke sumber yang digunakan. Nama lokal lingkungan menentukan urutan build dan dapat mengubah nomor sumber bersama, misalnya:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` dibuat oleh `build-live` dan bukan link lingkungan biasa.
Modul `01` dan seterusnya bersifat kumulatif: setiap modul dibangun di atas modul yang lebih rendah dan berlaku. `skip_conditions.conf` dapat tidak menyertakan entri untuk target tertentu, jadi periksa lingkungan yang dipilih alih-alih menganggap ada satu rangkaian yang berlaku untuk semua.

Gunakan `linux-live/scripts/10-example/` sebagai template penulisan saat ini. Modul dapat berisi:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

Hanya file yang diperlukan modul yang wajib disertakan. `build`, `postinstall`, kondisi skip, patch, dan pohon rootcopy bersifat opsional. `build` dan `patches/` tidak tersedia untuk `00-core`.

Kepemilikan host pada pohon rootcopy tidak dipertahankan; file yang disalin biasanya akan menjadi `root:root`. File manifes `.minios-ownership` di dalam pohon rootcopy menggunakan:

```text
owner:group relative/path
```

Path harus tetap berada di dalam pohon. Host menerapkan manifes segera dan mencari nama menggunakan database akun host. Gunakan nilai `UID:GID` numerik untuk akun yang hanya ada di target, atau atur kepemilikan dari `install` atau `postinstall` di dalam chroot. Memindahkan manifes ke `rootcopy-postinstall/` tidak mengubah pencarian nama.

Karena pemeriksaan containment saat ini tidak mengkanonisasi path target, jangan gunakan komponen `..` atau komponen symlink dalam path manifes. Periksa pohon rootcopy sebelum build dengan hak istimewa; path yang dibuat khusus dapat membuat `chown` di sisi host keluar dari pohon yang disalin.

Untuk paket, skrip instalasi modul biasa menggunakan file yang disalin ke chroot oleh `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Lihat [CondinAPT](/development/CondinAPT) untuk sintaks daftar paket dan peta filter MiniOS saat ini.

### Menambahkan modul

Salin template, lalu tautkan ke setiap lingkungan yang dituju dengan posisi lokal lingkungan yang diinginkan:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Sesuaikan `packages.list`, skrip, metadata, dan konten rootcopy sebelum build.
Validasi setiap desktop, varian, distribusi, dan arsitektur yang diklaim.

## Membangun ulang dengan aman

Artefak modul yang sudah ada akan dilewati. Jika modul kumulatif yang lebih rendah berubah, hapus artefaknya dan seluruh rangkaian modul yang lebih tinggi sebelum menjalankan `build-modules`; jika modul yang lebih tinggi dipertahankan, konten yang dibangun berdasarkan lapisan lama juga akan tetap ada. Identifikasi artefak berdasarkan urutan lingkungan yang dipilih dan nama modul karena kondisi skip dapat membuat nomor tidak berurutan.

Lapisan kernel merupakan pengecualian. Untuk membangun ulang hanya `01-kernel`, hapus artefaknya untuk target yang dipilih, lalu bangun ulang dari modul hingga publikasi:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Pastikan path target sebelum menghapus. Jangan gunakan cara pintas ini untuk `00-core` atau menganggapnya aman untuk modul `02` dan seterusnya.

Untuk modul biasa seperti `03-gui-base`, hapus artefaknya dan semua artefak modul berikutnya yang berlaku, lalu jalankan rentang `build-modules -` yang sama. Untuk perubahan khusus initramfs, EFI, atau boot, biarkan modul SquashFS tetap ada dan jalankan:

```bash
sudo ./minios-live build-boot -
```

Lakukan build lengkap setelah mengubah `00-core`, penyiapan bootstrap/chroot, identitas target, kebijakan repositori, atau input lain yang tidak dapat dibatasi pada tahap berikutnya.

## Output dan log

Dengan konfigurasi default `BUILD_DIR`, jalur pentingnya adalah:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` dan `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Nama ISO bergantung pada setelan build, mode rilis, dan stempel waktu. Gunakan jalur yang ditampilkan oleh build yang berhasil, alih-alih menebak nama dasar lengkapnya.

## Rahasia dan artefak debug

Jangan simpan token Ubuntu Pro di kontrol versi, dokumentasi, riwayat shell, atau log bersama. Sebaiknya gunakan file konfigurasi privat di luar repositori:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Atur `USE_UBUNTU_PRO=true` dan `UBUNTU_PRO_TOKEN=...` hanya di file tersebut. Build menghapus status Pro dari image, tetapi file di host tetap berisi rahasia.

`DEBUG_SSH_KEYS=true` menghasilkan materi kunci privat untuk keperluan debugging. Perlakukan image yang dihasilkan sebagai image sementara dan jangan pernah memublikasikannya sebelum memastikan kunci tersebut tidak ada.

Mengubah opsi kembali ke `false` tidak menghapus kunci yang sudah dibuat di `build/<target>/image/minios/debug_ssh_key`, file `authorized_keys.*` yang berdekatan, atau `build/<target>/debug_ssh_key`. Gunakan target yang bersih atau hapus file tersebut secara eksplisit, lalu periksa struktur direktori ISO sebelum memublikasikannya.

## Pemecahan masalah

- Kegagalan bootstrap biasanya disebabkan oleh repositori yang tidak dapat dijangkau, dukungan debootstrap, arsitektur, snapshot, atau prasyarat host yang belum terpenuhi.
- Kegagalan core dan modul biasanya disebabkan oleh ketersediaan paket, filter CondinAPT, skrip maintainer, konten rootcopy, atau modul dasar yang sudah usang.
- Kegagalan boot biasanya disebabkan oleh kernel yang dipilih, pembuat initramfs, pengambilan EFI, pembuatan GRUB/SYSLINUX, atau input boot yang belum tersedia.
- Kegagalan ISO biasanya disebabkan oleh struktur direktori image yang sudah disiapkan, xorriso, ruang output, atau setelan pembersihan.

Setelah build dengan hak istimewa terhenti, periksa mount di bawah direktori kerja target sebelum mencoba lagi. Baca `build/log/build-*.log` yang sesuai; jangan perbaiki overlay yang dihasilkan atau file `.sb` di tempat.

## Dokumentasi terkait

- [Mengelola modul](/preparing-and-customizing/Managing-Modules)
- [Menyusun image kustom](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
