---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Membangun MiniOS

MiniOS dirakit dari image inti SquashFS, modul ekstensi berurutan, file kernel dan boot, serta konfigurasi yang dihasilkan. Halaman ini menjelaskan antarmuka build source-tree saat ini dan ketergantungan antar output-nya.

Jalankan `./minios-cmd --help`, `./minios-live --help`, dan periksa `build.conf` yang dipilih sebelum membangun. File-file tersebut adalah referensi utama untuk versi yang sedang di-checkout.

## Persyaratan

Build di Debian atau Ubuntu dengan ruang kosong yang cukup di bawah `BUILD_DIR` dan `/tmp`.
Target desktop umumnya membutuhkan minimal 20 GiB. Proses build memerlukan akses root untuk debootstrap, chroot, mount, perangkat loop, dan pembuatan image; menampilkan bantuan tidak memerlukannya.

Daftar paket host yang menjadi referensi utama adalah `linux-live/prerequisites.list`. Untuk checkout saat ini, daftar tersebut dapat diinstal dengan:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Pada source checkout, `minios-live` akan memeriksa daftar ini sebelum build kecuali jika `SKIP_SETUP_HOST=true`. Pada host normal, tool ini akan melaporkan paket yang hilang dan berhenti; instalasi otomatis hanya digunakan pada jalur build container.

Konfigurasi default akan memeriksa konektivitas Internet. Pemeriksaan ini dapat dinonaktifkan dengan `CHECK_INTERNET_CONNECTION=false` dan akan dilewati jika menggunakan repository cache APT yang sudah disiapkan, namun semua paket dan file boot yang dibutuhkan tetap harus tersedia dari repository atau cache yang dikonfigurasi.

Jika `USE_APT_CACHER=true`, layanan apt-cacher-ng yang dapat dijangkau harus sudah dikonfigurasi di `APT_CACHER_ADDRESS`; jika tidak, atur opsi ke `false` sebelum membangun.

::: danger Bootstrap trust
Jalur bootstrap saat ini memanggil debootstrap dengan `--no-check-gpg` dan mengambil kunci arsip MiniOS melalui HTTP tanpa autentikasi. Jangan gunakan image yang dihasilkan sebagai artefak rilis terpercaya sampai jalur sumber ini menerapkan verifikasi kunci dan bootstrap yang terautentikasi.
:::

## Build cepat

Clone repository dan jalankan frontend dari root-nya:

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

Nilai distribusi, arsitektur, desktop, kompresi, dan varian yang didukung saat ini tercantum di `linux-live/build.conf`. Jangan menyimpulkan dukungan dari contoh perintah lama.

## Antarmuka build

### `minios-cmd`

`minios-cmd` menyalin template konfigurasi ke direktori kerja target, menuliskan pengaturan frontend ke salinan tersebut, dan memulai seluruh pipeline `minios-live -`. Opsi umum meliputi:

| Opsi | Efek |
| --- | --- |
| `-b`, `--build-dir` | Pilih root output build |
| `-c`, `--compression-type` | Pilih kompresi SquashFS |
| `-kp`, `--kernel-provider` | Pilih `distribution` atau `minios` |
| `-kf`, `--kernel-flavour` | Pilih flavour kernel distribusi |
| `-mk`, `--minios-kernel` | Pilih penyedia kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Pilih `auto`, `6.1`, atau `6.12` dan menyertakan penyedia MiniOS |
| `-kpm`, `--kernel-payload-mode` | Pilih `runtime` atau `full` |
| `-dkms`, `--kernel-build-dkms` | Build driver opsional untuk kernel yang dipilih |
| `-l`, `--locale` | Atur locale sistem |
| `-ml`, `--multilingual` | Hasilkan beberapa locale |
| `-kl`, `--keep-locales` | Pertahankan locale yang tersedia |
| `-tz`, `--timezone` | Atur zona waktu live-system |
| `-ib`, `--initramfs-builder` | Pilih `livekit` atau `dracut` |
| `-mln`, `--menu-language` | Pilih bahasa menu boot |

Contoh:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Hasilkan konfigurasi tanpa memulai build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Tanpa tujuan lain, ini akan menulis ke `build/build.conf`. Frontend tetap memerlukan akses root dalam mode ini.

`--config-file FILE` memilih konfigurasi yang akan disalin. Implementasi saat ini kemudian menuliskan nilai command-line yang sudah diurai dan default frontend yang tidak kosong ke salinan kerja, meskipun penjelasan singkat di `--help`. Untuk konfigurasi manual yang presisi, jalankan `minios-live` secara langsung dan periksa file aktif, jangan hanya mengandalkan penggabungan frontend.

Jangan gabungkan `--config-only` dengan `--config-file` yang menunjuk ke konfigurasi yang sudah ada: mode hanya-konfigurasi akan menyalin template default ke path tersebut.
Gunakan `-b DIR --config-only` untuk memilih tujuan hasil generate yang terpisah.

### `minios-live`

`minios-live` adalah backend bertahap. Pada source checkout, secara default membaca `linux-live/build.conf`; salinan yang terinstal membaca `/etc/minios-live/build.conf`. Pilih file lain dan root output melalui variabel environment:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Gunakan path `BUILD_CONF` absolut di seluruh `sudo`. File konfigurasi dibaca sebagai Bash, jadi hanya gunakan file yang tepercaya. Backend tidak memiliki flag untuk menimpa variabel konfigurasi secara individual.

## Tahapan build

Pipeline berjalan dengan urutan berikut:

1. `build-bootstrap` membuat root target minimal dengan debootstrap.
2. `build-chroot` menginstal dan mengonfigurasi sistem inti.
3. `build-live` membuat modul `00-core` SquashFS.
4. `build-modules` membangun modul berurutan untuk environment yang dipilih.
5. `build-boot` menghasilkan file initramfs, kernel, EFI, dan bootloader.
6. `build-config` menghasilkan MiniOS dan konfigurasi boot.
7. `build-iso` mempublikasikan ISO bootable dan checksum.
8. `remove-sources` menghapus direktori kerja yang dipilih jika dikonfigurasi.

Nama dengan tanda hubung di atas dan bentuk underscore keduanya diterima.

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

Perintah parsial tidak akan membuat ulang input yang dilewati. `build-iso` hanya mengemas pohon image yang sudah disiapkan, dan `build-modules` tidak dapat membuat ulang `00-core`. Lakukan build ulang hingga tahap terakhir yang bergantung setelah mengubah produsen sebelumnya.

Pipeline lengkap dimulai dengan `build-bootstrap`, yang akan menghapus direktori `core/` dan `image/` target yang sudah ada. Simpan konten yang tidak dapat di-regenerate sebelum memulai; pohon target yang dihasilkan adalah output build, bukan penyimpanan sumber yang tahan lama.

Jika `REMOVE_SOURCES=true`, tahap akhir `remove-sources` akan menghapus dan membuat ulang seluruh direktori kerja `build/<distribution>-<variant>-<architecture>/`, bukan hanya arsip sumber yang diunduh. ISO yang dipublikasikan, cache bersama, dan log di luar direktori tersebut tetap ada.

## Konfigurasi

`linux-live/build.conf` mengatur identitas target, kernel, locale, bootloader, live user, layanan, cache, snapshot, pembersihan, dan publikasi. Grup penting meliputi:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, dan `PACKAGE_VARIANT` memilih target dan rantai modul.
- `COMP_TYPE` mengatur kompresi SquashFS.
- `KERNEL_*` dan `MINIOS_KERNEL_SERIES` mengatur akuisisi kernel dan payload.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, dan `SERIAL_CONSOLE` mengatur artefak boot.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, dan `USE_APT_CACHER` mengatur input yang dapat digunakan ulang.
- `VERBOSITY_LEVEL` menerima `0`, `1`, atau `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, dan `BUILD_TEST_ISO` mengatur publikasi dan pembersihan.

Jangan mengedit `build/<target>/build.conf` yang dihasilkan sebagai pengganti pemeliharaan konfigurasi sumber yang dipilih.

### Pemilihan kernel

Penyedia `distribution` akan menentukan kernel Debian atau Ubuntu yang dipilih dan, jika DKMS diaktifkan, header yang sesuai dalam status APT yang terisolasi dan ditandatangani.
`KERNEL_AUTO_SELECT=true` mengambil suite sumber dan arsitektur dari target userspace. Atur ke `false` untuk menggunakan field distribusi manual, arsitektur, versi, snapshot, dan kebijakan update di `build.conf`.

Penyedia `minios` menginstal `linux-image-SERIES-mos-ARCH`, memverifikasi dukungan AUFS, dan menggunakan header MiniOS yang sesuai untuk DKMS. Ini memerlukan `KERNEL_FLAVOUR=none` dan arsitektur paket userspace serta kernel yang cocok.
Pada kode saat ini, `MINIOS_KERNEL_SERIES=auto` akan menjadi `6.12`; gunakan `6.1` secara eksplisit jika membutuhkan seri tersebut.

`KERNEL_PAYLOAD_MODE=runtime` mempertahankan pohon modul kernel, konfigurasi kernel, `System.map`, metadata deployment, dan integrasi runtime di bawah `modprobe.d`, `modules-load.d`, dan `udev/rules.d`. Ini akan menghapus status paket untuk build saja, header, sumber DKMS, tool compiler, dan paket initramfs. Firmware tetap dimiliki oleh `02-firmware`. `full` mempertahankan payload diagnostik yang lebih luas.

## Sistem modul

Sumber modul berada di bawah `linux-live/scripts/`. Sebuah environment di bawah `linux-live/environments/<desktop>/` berisi symlink berurutan ke sumber yang digunakan. Nama lokal environment mengatur urutan build dan dapat menomori ulang sumber bersama, misalnya:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` dihasilkan oleh `build-live` dan bukan link environment biasa.
Modul `01` ke atas bersifat kumulatif: masing-masing dibangun di atas modul yang lebih rendah. `skip_conditions.conf` dapat menghilangkan entri untuk target tertentu, jadi periksa environment yang dipilih daripada mengasumsikan satu rantai universal.

Gunakan `linux-live/scripts/10-example/` sebagai template authoring saat ini. Sebuah modul dapat berisi:

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

Hanya file yang dibutuhkan modul yang wajib ada. `build`, `postinstall`, kondisi skip, patch, dan rootcopy tree bersifat opsional. `build` dan `patches/` tidak tersedia untuk `00-core`.

Kepemilikan host pada rootcopy tree tidak dipertahankan; file yang disalin biasanya menjadi `root:root`. Manifest `.minios-ownership` di dalam rootcopy tree menggunakan:

```text
owner:group relative/path
```

Path harus tetap di dalam tree. Host akan menerapkan manifest secara langsung dan menyelesaikan nama menggunakan database akun host. Gunakan nilai numerik `UID:GID` untuk akun khusus target, atau atur kepemilikan dari `install` atau `postinstall` di dalam chroot. Memindahkan manifest ke `rootcopy-postinstall/` tidak mengubah resolusi nama.

Karena pemeriksaan containment saat ini tidak mengkanonisasi path target, jangan pernah gunakan komponen `..` atau symlink dalam path manifest. Periksa rootcopy tree sebelum build dengan hak istimewa; path yang dibuat dapat menyebabkan `chown` di sisi host keluar dari tree yang disalin.

Untuk paket, skrip instalasi modul biasa menggunakan file yang disalin ke chroot oleh `build-modules`:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Lihat [CondinAPT](/development/CondinAPT) untuk sintaks daftar paket dan peta filter MiniOS saat ini.

### Menambahkan modul

Salin template, lalu tautkan ke setiap environment yang diinginkan dengan posisi lokal environment yang diinginkan:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Sesuaikan `packages.list`, skrip, metadata, dan konten rootcopy sebelum membangun.
Validasi setiap desktop, varian, distribusi, dan arsitektur yang diklaim.

## Membangun ulang dengan aman

Artefak modul yang sudah ada akan dilewati. Jika modul kumulatif yang lebih rendah berubah, hapus artefaknya dan seluruh rangkaian modul yang lebih tinggi sebelum menjalankan `build-modules`; mempertahankan modul yang lebih tinggi akan menyimpan konten yang dibangun berdasarkan layer bawah lama. Identifikasi artefak berdasarkan urutan environment yang dipilih dan nama modul karena kondisi skip dapat menutup celah penomoran.

Layer kernel adalah kasus khusus. Untuk membangun ulang hanya `01-kernel`, hapus artefaknya untuk target yang dipilih dan bangun ulang dari modul hingga publikasi:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Konfirmasi path target sebelum menghapus. Jangan gunakan shortcut ini untuk `00-core` atau berasumsi aman untuk modul `02` ke atas.

Untuk modul biasa seperti `03-gui-base`, hapus artefaknya dan semua artefak modul berikutnya yang berlaku, lalu jalankan rentang `build-modules -` yang sama. Untuk perubahan hanya pada initramfs, EFI, atau boot, biarkan modul SquashFS tetap ada dan jalankan:

```bash
sudo ./minios-live build-boot -
```

Lakukan build lengkap setelah perubahan pada `00-core`, setup bootstrap/chroot, identitas target, kebijakan repository, atau input lain yang tidak dapat diisolasi ke tahap selanjutnya.

## Output dan log

Dengan `BUILD_DIR` default, path penting adalah:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` dan `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Nama ISO bergantung pada pengaturan build, mode rilis, dan timestamp. Gunakan path yang dicetak oleh build yang berhasil, jangan menebak nama file dasarnya.

## Rahasia dan artefak debug

Jangan letakkan token Ubuntu Pro di version control, dokumentasi, riwayat shell, atau log bersama. Lebih baik gunakan konfigurasi privat di luar repository:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Set `USE_UBUNTU_PRO=true` dan `UBUNTU_PRO_TOKEN=...` hanya di file tersebut. Build akan menghapus status Pro dari image, tetapi file di sisi host tetap berisi rahasia tersebut.

`DEBUG_SSH_KEYS=true` menghasilkan material kunci privat untuk debugging. Perlakukan image yang dihasilkan sebagai disposable dan jangan pernah publikasikan tanpa memastikan kunci sudah tidak ada.

Mengubah opsi kembali ke `false` tidak akan menghapus kunci yang sudah dihasilkan di `build/<target>/image/minios/debug_ssh_key`, file `authorized_keys.*` yang berdekatan, atau `build/<target>/debug_ssh_key`. Gunakan target baru atau hapus file tersebut secara manual, lalu periksa pohon ISO sebelum publikasi.

## Pemecahan masalah

- Kegagalan bootstrap biasanya terkait dengan akses repository, dukungan debootstrap, arsitektur, snapshot, atau prasyarat host yang hilang.
- Kegagalan inti dan modul biasanya terkait dengan ketersediaan paket, filter CondinAPT, skrip maintainer, konten rootcopy, atau modul bawah yang sudah usang.
- Kegagalan boot biasanya terkait dengan kernel yang dipilih, builder initramfs, akuisisi EFI, pembuatan GRUB/SYSLINUX, atau input boot yang hilang.
- Kegagalan ISO biasanya terkait dengan pohon image yang sudah disiapkan, xorriso, ruang output, atau pengaturan pembersihan.

Setelah build dengan hak istimewa terputus, periksa mount di bawah direktori kerja target sebelum mencoba ulang. Baca `build/log/build-*.log` terkait; jangan memperbaiki overlay yang dihasilkan atau file `.sb` secara langsung.

## Dokumentasi terkait

- [Mengelola modul](/preparing-and-customizing/Managing-Modules)
- [Menyusun image kustom](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
