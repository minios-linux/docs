---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# Perintah build

MiniOS memiliki dua antarmuka build berbasis command-line. Jalankan perintah dari direktori sumber `minios-live` kecuali jika menggunakan salinan yang sudah terinstal.

- `minios-cmd` adalah frontend. Frontend ini menerima opsi target umum, menghasilkan konfigurasi kerja, dan memulai proses build secara lengkap.
- `minios-live` adalah backend bertahap. Backend ini membaca konfigurasi build dan menjalankan satu tahap, rentang tahap tertentu, atau seluruh pipeline.

Gunakan `./minios-cmd --help`, `./minios-live --help`, dan `build.conf` yang aktif untuk versi terinstal. Ketiganya menjadi acuan utama jika contoh atau dokumentasi lama berbeda. Nilai target yang didukung dapat berubah, sehingga halaman ini tidak mendefinisikan matriks dukungan.

## Persyaratan root

Menampilkan bantuan tidak memerlukan akses root:

```bash
./minios-cmd --help
./minios-live --help
```

Operasi build memerlukan root karena menggunakan debootstrap, chroot, mount, dan alat pembuatan image. Frontend saat ini juga memeriksa akses root sebelum menulis konfigurasi dengan `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Backend akan memeriksa dan menginstal prasyarat host yang tercantum di `linux-live/prerequisites.list` kecuali `SKIP_SETUP_HOST=true` diatur dalam konfigurasi.

## Build Frontend

Pemanggilan `minios-cmd` normal memerlukan keempat opsi pemilihan target berikut:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Contohnya:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Pengaturan opsional yang umum meliputi kompresi, perilaku kernel, lokal, zona waktu, builder initramfs, bahasa menu boot, dan direktori build. Periksa `./minios-cmd --help` daripada mengasumsikan sebuah opsi tersedia.

### Pemilihan Kernel

Frontend menampilkan pengaturan kernel saat ini secara langsung:

| Opsi | Efek |
| --- | --- |
| `-kp`, `--kernel-provider` | Pilih `distribution` atau `minios` |
| `-mk`, `--minios-kernel` | Pilih kernel MiniOS dengan AUFS yang mengaktifkan pemilihan seri otomatis |
| `-mks`, `--minios-kernel-series` | Pilih `auto`, `6.1`, atau `6.12` dan mengimplikasikan provider MiniOS |
| `-kpm`, `--kernel-payload-mode` | Pilih payload modul kernel `runtime` atau `full` |
| `-dkms`, `--kernel-build-dkms` | Build driver DKMS opsional yang dipilih untuk kernel yang digunakan |

Contohnya:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv standard \
  -mks 6.1 -kpm runtime -dkms
```

Provider `distribution` menyelesaikan paket kernel signed closure dalam status APT yang terisolasi. Jika DKMS diaktifkan, closure tersebut juga menyediakan header yang sesuai dengan kernel yang dipilih; tahap DKMS selanjutnya tidak menggantinya dengan metapackage header generik dari distribusi userspace. Endpoint arsip kernel normal menggunakan HTTP sehingga apt-cacher-ng dapat melakukan cache konten paket. APT tetap memvalidasi metadata `InRelease` yang ditandatangani dan hash paket.

Provider `minios` menginstal `linux-image-SERIES-mos-ARCH`, memverifikasi bahwa kernel memiliki dukungan AUFS, dan menggunakan `linux-headers-SERIES-mos-ARCH` untuk DKMS.
`KERNEL_FLAVOUR` harus `none`, arsitektur paket userspace dan kernel harus sama, dan kebijakan update dibekukan. Pemilihan seri otomatis menggunakan 6.1 untuk i386, Buster, Bullseye, Bookworm, dan Jammy; target lain yang didukung menggunakan 6.12. Kernel MiniOS i386 hanya mendukung seri 6.1.

`KERNEL_PAYLOAD_MODE=runtime` mempublikasikan pohon modul kernel, konfigurasi kernel, System.map, metadata deployment, dan file integrasi runtime di bawah `modprobe.d`, `modules-load.d`, dan `udev/rules.d`. Tidak termasuk database dpkg aktif, header, link build, sumber DKMS, toolchain compiler, paket initramfs, dan firmware. Firmware berada di `02-firmware`. Mode `full` mempertahankan payload paket diagnostik yang lebih luas.

Frontend menyalin template konfigurasi, menuliskan nilai frontend yang diberikan ke salinan tersebut, dan menjalankan `minios-live -`. Secara default, salinan kerja untuk contoh ini adalah:

```text
build/trixie-standard-amd64/build.conf
```

Hasilkan konfigurasi tanpa memulai build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Tanpa tujuan lain, ini akan menulis `build/build.conf`.

`--config-file FILE` memilih file konfigurasi. Bantuan perintah saat ini menyatakan bahwa semua opsi lain diabaikan dalam mode ini, jadi jangan gabungkan dengan opsi target atau tuning:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Untuk mode opsi frontend, nilai command-line eksplisit akan menimpa nilai template yang sesuai. Untuk mode file konfigurasi, perlakukan file yang dipilih sebagai input konfigurasi, bukan mencoba menimpanya dengan flag frontend lain.

## Konfigurasi Backend

Pada source checkout, `minios-live` secara default membaca `linux-live/build.conf`. Salinan yang terinstal menggunakan `/etc/minios-live/build.conf`. Backend akan mengambil sumber dari file yang dipilih sebelum menghitung path target dan tidak memiliki flag command-line untuk mengganti pengaturan konfigurasi secara individual.

Pilih file lain melalui `BUILD_CONF`. Gunakan path absolut saat melewati batas `sudo`:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` memilih root output build lain:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Jangan edit file yang dihasilkan di bawah direktori kerja target sebagai pengganti pemeliharaan konfigurasi yang dipilih. Lihat `linux-live/build.conf` untuk opsi lanjutan kernel, bootloader, lokal, cache, snapshot, modul, pembersihan, dan publikasi.

## Tahapan Backend

Tahapan dijalankan dalam urutan berikut:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Nama tahap dengan tanda hubung yang ditampilkan oleh bantuan dapat diterima oleh skrip.

Jalankan seluruh pipeline:

```bash
sudo ./minios-live -
```

Jalankan hanya satu tahap:

```bash
sudo ./minios-live build-iso
```

Jalankan rentang inklusif:

```bash
sudo ./minios-live build-chroot - build-live
```

Jalankan dari tahap pertama hingga tahap yang dipilih:

```bash
sudo ./minios-live - build-live
```

Jalankan dari tahap yang dipilih hingga tahap akhir:

```bash
sudo ./minios-live build-modules -
```

Contoh backend ini menggunakan target yang dipilih pada konfigurasi aktif. Untuk contoh pada halaman ini, atur `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"`, dan `PACKAGE_VARIANT="standard"` terlebih dahulu.

## Ketergantungan Tahap

Perintah parsial tidak akan membuat ulang output dari tahap sebelumnya yang dilewati. Tahap selanjutnya akan menggunakan root filesystem, modul SquashFS, file boot, dan konfigurasi yang dihasilkan oleh tahap sebelumnya.

Membangun ulang tahap sebelumnya dapat membuat semua output tahap berikutnya menjadi usang. Lakukan build ulang hingga tahap terakhir yang terdampak, dan jangan pertahankan modul bernomor lebih tinggi setelah mengubah modul bernomor lebih rendah yang menjadi dasar mereka. Secara khusus, `build-iso` hanya mengemas data image yang sudah dipersiapkan; tidak membangun ulang data tersebut.

Gunakan build lengkap untuk target baru atau ketika output tahap sebelumnya yang diperlukan belum ada:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Output dan Log

Dengan konfigurasi checkout dan root build default, contoh trixie menggunakan lokasi terverifikasi berikut:

- `build/trixie-standard-amd64/core/` untuk filesystem inti yang dapat diubah
- `build/trixie-standard-amd64/image/` untuk pohon ISO yang sudah dipersiapkan
- `build/trixie-standard-amd64/image/minios/` untuk modul dan payload MiniOS yang dihasilkan
- `build/iso/` untuk file ISO dan sidecar `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` untuk log build yang ditangkap

Semua path relatif terhadap `BUILD_DIR`. Nama file dasar ISO mencakup pengaturan build dan, untuk build non-rilis, timestamp; gunakan path yang dicetak oleh build yang berhasil daripada memprediksi nama file lengkapnya.

## Token Ubuntu Pro

`--ubuntu-pro-token` mengaktifkan penggunaan Ubuntu Pro selama build frontend. Kode build akan menempel di dalam chroot, lalu melepas dan menghapus status Pro, autentikasi repository, preferensi, dan jejak keyring sebelum membuat image. Pembersihan ini tidak membuat token aman untuk diekspos di host.

Jangan pernah menaruh token asli dalam dokumentasi, version control, riwayat shell, output CI, atau command line bersama. Lebih baik gunakan file konfigurasi privat di luar repository, batasi hanya untuk pemiliknya, dan hanya berikan path-nya:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Setel `USE_UBUNTU_PRO="true"` dan `UBUNTU_PRO_TOKEN="..."` di file privat tersebut. Lindungi dan hapus konfigurasi kerja sisi host yang berisi token saat sudah tidak diperlukan, dan pastikan tidak ada token atau data autentikasi Pro yang ada pada artefak yang dipublikasikan.
