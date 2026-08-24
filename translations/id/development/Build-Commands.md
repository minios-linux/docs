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

## Build frontend

Pemanggilan `minios-cmd` secara normal memerlukan keempat opsi pemilihan target:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Contoh:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Pengaturan opsional yang umum meliputi kompresi, perilaku kernel, lokal, zona waktu, builder initramfs, bahasa menu boot, dan direktori build. Periksa `./minios-cmd --help` daripada mengasumsikan suatu opsi tersedia.

Frontend akan menyalin template konfigurasi, menulis nilai frontend yang diberikan ke dalam salinan tersebut, lalu menjalankan `minios-live -`. Secara default, salinan kerja untuk contoh ini berada di:

```text
build/trixie-standard-amd64/build.conf
```

Hasilkan konfigurasi tanpa memulai proses build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Tanpa tujuan lain, ini akan menulis `build/build.conf`.

`--config-file FILE` memilih file konfigurasi. Bantuan perintah saat ini menyatakan bahwa semua opsi lain akan diabaikan dalam mode ini, jadi jangan menggabungkannya dengan opsi target atau tuning:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

Untuk mode opsi frontend, nilai command-line yang eksplisit akan menimpa nilai template terkait. Untuk mode file konfigurasi, perlakukan file yang dipilih sebagai input konfigurasi, bukan mencoba menimpanya dengan flag frontend lain.

## Konfigurasi backend

Pada source checkout, `minios-live` secara default membaca `linux-live/build.conf`. Untuk salinan yang terinstal menggunakan `/etc/minios-live/build.conf`. Backend akan memuat file yang dipilih sebelum menghitung jalur target dan tidak memiliki flag command-line untuk menimpa pengaturan konfigurasi secara individual.

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

Jangan mengedit file yang dihasilkan di bawah direktori kerja target sebagai pengganti pemeliharaan konfigurasi yang dipilih. Lihat `linux-live/build.conf` untuk opsi lanjutan kernel, bootloader, lokal, cache, snapshot, modul, pembersihan, dan publikasi.

## Tahapan backend

Tahapan dijalankan dengan urutan berikut:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Nama tahap dengan tanda hubung yang ditampilkan di bantuan dapat diterima oleh skrip.

Jalankan seluruh pipeline:

```bash
sudo ./minios-live -
```

Jalankan satu tahap saja:

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

Jalankan dari tahap yang dipilih hingga tahap terakhir:

```bash
sudo ./minios-live build-modules -
```

Contoh backend ini menggunakan target yang dipilih di konfigurasi aktif. Untuk contoh di halaman ini, atur `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"`, dan `PACKAGE_VARIANT="standard"` terlebih dahulu.

## Ketergantungan tahap

Perintah parsial tidak akan membuat ulang output dari tahap sebelumnya yang dilewati. Tahap selanjutnya akan menggunakan root filesystem, modul SquashFS, file boot, dan konfigurasi yang dihasilkan oleh tahap sebelumnya.

Membangun ulang tahap sebelumnya dapat menyebabkan semua output tahap berikutnya menjadi usang. Lakukan build ulang hingga tahap terakhir yang terdampak, dan jangan menyimpan modul bernomor lebih tinggi setelah mengubah modul bernomor lebih rendah yang menjadi dasarnya. Khususnya, `build-iso` hanya mengemas data image yang sudah dipersiapkan; tidak membangun ulang data tersebut.

Lakukan build lengkap untuk target baru atau jika output tahap sebelumnya yang dibutuhkan belum ada:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Output dan log

Dengan konfigurasi checkout dan root build default, contoh trixie menggunakan lokasi terverifikasi berikut:

- `build/trixie-standard-amd64/core/` untuk filesystem core yang dapat diubah
- `build/trixie-standard-amd64/image/` untuk pohon ISO yang sudah dipersiapkan
- `build/trixie-standard-amd64/image/minios/` untuk modul dan payload MiniOS yang dihasilkan
- `build/iso/` untuk file ISO dan sidecar `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` untuk log build yang direkam

Semua path relatif terhadap `BUILD_DIR`. Nama file dasar ISO mencakup pengaturan build dan, untuk build non-rilis, timestamp; gunakan path yang dicetak oleh build yang berhasil daripada memprediksi nama file lengkapnya.

## Token Ubuntu Pro

`--ubuntu-pro-token` mengaktifkan penggunaan Ubuntu Pro selama build frontend. Kode build akan menempelkan token di dalam chroot, lalu melepas dan menghapus status Pro, autentikasi repository, preferensi, dan jejak keyring sebelum membuat image. Pembersihan ini tidak membuat token aman untuk diekspos di host.

Jangan pernah menaruh token asli di dokumentasi, version control, riwayat shell, output CI, atau command line bersama. Sebaiknya gunakan file konfigurasi privat di luar repository, batasi hanya untuk pemiliknya, dan hanya berikan path-nya saja:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Atur `USE_UBUNTU_PRO="true"` dan `UBUNTU_PRO_TOKEN="..."` di file privat tersebut. Lindungi dan hapus konfigurasi kerja di sisi host yang berisi token ketika sudah tidak diperlukan, serta pastikan tidak ada token atau data autentikasi Pro yang tersisa di artefak yang dipublikasikan.
