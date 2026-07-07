# Membuat Modul

Modul di MiniOS adalah paket file dan konfigurasi yang berdiri sendiri untuk memperluas fungsionalitas sistem dasar. Modul ini mirip dengan paket pada distribusi Linux lain, namun dirancang agar bisa ditumpuk satu sama lain, sehingga sistem menjadi fleksibel dan mudah dikustomisasi. Pendekatan bertingkat ini memungkinkan kustomisasi yang mudah, pembatalan perubahan (rollback), dan berbagi konfigurasi.

Untuk proses build MiniOS secara lengkap dan konteks arsitektur sistem, lihat [Panduan Membangun MiniOS](/development/Building-MiniOS.md). Untuk informasi tentang sistem manajemen paket CondinAPT yang digunakan pada modul, lihat [Dokumentasi CondinAPT](/development/CondinAPT.md).

Terdapat cukup banyak utilitas untuk membuat modul di MiniOS. Semua utilitas ini dirancang untuk digunakan di terminal dan membutuhkan hak akses root.

**Utilitas Pembuatan Modul:**

**apt2sb** - menginstal paket dari repository dan mengemasnya menjadi modul.<br>
**script2sb** - menjalankan aksi sesuai skrip dan mengemas hasilnya ke dalam modul.<br>
**chroot2sb** - membuka chroot, memungkinkan Anda melakukan berbagai aksi di dalamnya, setelah keluar hasilnya disimpan dalam modul.<br>

**Utilitas Manajemen Modul Tambahan:**

**dir2sb** - mengonversi direktori yang sudah ada menjadi modul terkompresi.<br>
**sb2dir** - mengonversi modul terkompresi menjadi direktori untuk pemeriksaan.<br>
**rmsbdir** - menghapus direktori modul yang dibuat oleh sb2dir.<br>
**savechanges** - menyimpan semua file yang berubah di sistem ke dalam bundle filesystem terkompresi.<br>
**sb2iso** - menghasilkan image ISO MiniOS, dengan opsi menambah atau mengecualikan modul.<br>
**sb** - antarmuka lengkap untuk mengelola bundle MiniOS (aktivasi, nonaktifkan, daftar, konversi).<br>

**Fitur umum utilitas pembuatan modul:**
- Mendukung berbagai tipe kompresi: zstd (default), gzip, lzo, xz
- Ekstensi file modul dapat dikustomisasi (default: sb)
- Penyaringan berbasis level untuk mengontrol modul mana yang dijadikan dependensi
- Penamaan output modul yang dapat disesuaikan
- Semua utilitas harus dijalankan sebagai root

## apt2sb

Untuk membuat modul menggunakan apt2sb, cukup daftarkan paket yang ingin Anda kemas dalam modul, misal `apt2sb install chromium chromium-sandbox`. Menjalankan perintah ini di folder tempat perintah dijalankan akan menghasilkan modul chromium.sb yang berisi browser Chromium. Modul ini akan dibuat berdasarkan semua modul yang sudah dimuat ke sistem, artinya modul ini membutuhkan semua modul tersebut untuk berjalan, karena library yang dibutuhkan program mungkin sudah terinstal di sistem dan bisa saja ada di modul level bawah.

Dengan opsi `-l`/`--level`, kita bisa menentukan pada modul level atas mana modul kita akan dibangun. Misalnya, perintah `apt2sb install -l 4 chromium chromium-sandbox` akan menyaring semua modul bernomor 04 ke atas saat proses build, jadi modul akan dibangun berdasarkan modul bernomor 00-03. Setelah menjalankan perintah ini, kita akan mendapatkan modul 04-chromium.sb di folder tempat perintah dijalankan. Modul ini akan berukuran lebih besar dibandingkan paket pada contoh sebelumnya karena akan menyertakan semua library yang diperlukan untuk menjalankan program, yang mungkin ada di modul bernomor 04 ke atas, namun modul ini tetap bisa berjalan baik dengan modul 04-xx maupun tanpa modul tersebut.

Nama modul dibuat otomatis berdasarkan nama paket pertama yang disebutkan (dalam contoh ini, chromium) dan, jika opsi --level digunakan, nomor levelnya. Jika Anda ingin menentukan nama modul sendiri, gunakan opsi `-n`/`--name`, misal `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Opsi tambahan yang tersedia di apt2sb:**

- `-c`/`--comp` - Jenis kompresi (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Ekstensi bundle. Default: sb
- `-y`/`--yes` - Otomatis menjawab ya pada prompt
- `--allow-downgrades` - Izinkan downgrade paket
- `--install-recommends` - Anggap paket yang direkomendasikan sebagai dependensi untuk instalasi
- `--install-suggests` - Anggap paket yang disarankan sebagai dependensi untuk instalasi
- `--no-install-recommends` - Jangan anggap paket yang direkomendasikan sebagai dependensi
- `--no-install-suggests` - Jangan anggap paket yang disarankan sebagai dependensi
- `-t`/`--target-release` - Rilis default untuk instalasi paket

apt2sb juga memiliki perintah `upgrade` untuk memperbarui paket yang sudah terinstal. Perintah upgrade menggunakan opsi yang sama dengan install.

## script2sb

Untuk membuat modul menggunakan script2sb, Anda perlu menulis skrip bash yang mendeskripsikan langkah-langkah yang diperlukan untuk membangun modul Anda. Ini berguna jika Anda perlu melakukan aksi tertentu pada sistem file, mengimpor key, menambah repository, dll sebelum atau sesudah instalasi. Berikut contoh skripnya:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Untuk menjalankan build pada skrip ini (misal kita beri nama caddy.sh), jalankan perintah `script2sb -s ./caddy.sh`.

**Opsi yang tersedia untuk script2sb:**

- `-s`/`--script` - Gunakan FILE sebagai skrip instalasi (wajib)
- `-l`/`--level` - Gunakan LEVEL sebagai filter level
- `-n`/`--name` - Gunakan NAME sebagai nama file modul
- `-c`/`--comp` - Jenis kompresi (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Ekstensi bundle. Default: sb
- `-d`/`--directory` - Salin isi DIR ke root modul

Jika nama modul tidak ditentukan, nama akan dibuat berdasarkan nomor level (jika ada) dan nama skrip. Contoh menjalankan perintah dengan opsi ini: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

Selain opsi di atas, Anda bisa menggunakan opsi `-d`/`--directory`. Jika opsi ini digunakan, isi folder yang ditunjuk oleh argumen opsi akan disalin ke root modul sebelum skrip dijalankan. File dalam folder tersebut harus disusun seperti pada root sistem. Misal Anda ingin menambahkan shortcut program ke menu, buat folder mymodule dan buat struktur di dalamnya sesuai root sistem:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
Di folder mymodule/usr/share/applications Anda bisa meletakkan file desktop yang akan dikemas ke dalam modul setelah proses build selesai, lalu jalankan perintah build:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

Utilitas `chroot2sb` digunakan untuk membuat lingkungan chroot interaktif. Ini memungkinkan Anda melakukan *berbagai* aksi secara manual untuk membangun modul Anda (menginstal paket, mengedit file, menjalankan perintah, dll). Setelah Anda keluar dari lingkungan chroot, perubahan yang Anda lakukan akan dikemas menjadi modul.

**Opsi yang tersedia untuk chroot2sb:**

- `-l`/`--level` - Gunakan LEVEL sebagai filter level  
- `-n`/`--name` - Gunakan NAME sebagai nama file modul
- `-c`/`--comp` - Jenis kompresi (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Ekstensi bundle. Default: sb
- `-d`/`--directory` - Salin isi DIR ke root modul

Jika nama modul tidak ditentukan, nama akan dibuat berdasarkan nomor level (jika ada) dan tanggal serta waktu saat ini dengan format YYYYMMDD-HHMM.

Anda juga dapat menggunakan opsi `-d`/`--directory`, mirip dengan `script2sb`. Jika opsi ini digunakan, isi folder yang ditentukan akan disalin ke root modul *sebelum* Anda masuk ke lingkungan chroot. Ini memberikan titik awal untuk kustomisasi Anda.

**Contoh Penggunaan:**

- Chroot dasar, nama modul otomatis: `chroot2sb`
- Tentukan level dan kompresi: `chroot2sb -l 3 -c gzip`
- Tentukan level, nama, dan kompresi: `chroot2sb -l 3 -n 04-my-module.sb -c xz`
- Salin file dari direktori sebelum masuk chroot: `chroot2sb -d /path/to/my/files`

Setelah menjalankan perintah `chroot2sb`, Anda akan masuk ke lingkungan chroot. Anda dapat melakukan aksi apa pun yang diperlukan. Setelah selesai, ketik `exit` untuk keluar dari lingkungan chroot. `chroot2sb` kemudian akan mengemas perubahan ke dalam modul. Perintah yang dijalankan di dalam chroot *tidak* disimpan sebagai bagian dari proses instalasi modul akhir. Ini adalah snapshot dari keadaan akhir filesystem. Riwayat bash akan otomatis dihapus dari modul.

## Utilitas Manajemen Modul Tambahan

Selain utilitas pembuatan modul, MiniOS menyediakan beberapa utilitas untuk mengelola dan bekerja dengan modul yang sudah ada:

### dir2sb

Utilitas `dir2sb` digunakan untuk mengonversi direktori yang sudah ada menjadi modul terkompresi. Ini berguna jika Anda sudah menyiapkan struktur direktori beserta semua file yang diperlukan dan ingin mengemasnya menjadi modul tanpa menjalankan proses instalasi apa pun.

**Opsi yang tersedia untuk dir2sb:**

- `-c`/`--comp` - Jenis kompresi (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Ekstensi bundle. Default: sb

**Penggunaan:**

`dir2sb [OPTIONS] SOURCE_DIRECTORY [TARGET_FILE]`

**Perilaku:**

- Jika `SOURCE_DIRECTORY` tidak memiliki ekstensi .sb dan namanya bukan 'squashfs-root', maka direktori tersebut akan disertakan dalam modul, dan `TARGET_FILE` wajib diisi.
- Jika `TARGET_FILE` tidak ditentukan, `SOURCE_DIRECTORY` akan digantikan oleh file modul baru.

**Contoh:**

- Konversi direktori yang sudah disiapkan menjadi modul: `dir2sb /path/to/my/prepared/files my-module.sb`
- Konversi direktori squashfs-root (mengganti yang asli): `dir2sb squashfs-root`
- Gunakan kompresi berbeda: `dir2sb -c xz /path/to/files custom-module.sb`

Utilitas ini sangat berguna jika Anda ingin:
- Mengemas file dan direktori yang sudah dikonfigurasi
- Mengonversi isi modul yang diekstrak kembali menjadi modul
- Membuat modul dari struktur direktori yang disiapkan secara manual

### sb2dir

Utilitas `sb2dir` mengonversi modul terkompresi (.sb file) menjadi direktori dengan nama yang sama. Ini berguna untuk mengekstrak dan memeriksa isi modul.

**Penggunaan:**

`sb2dir [source_file.sb] [optional_output_directory]`

**Perilaku:**

- Jika output directory ditentukan, direktori tersebut harus sudah ada
- Jika output directory tidak ditentukan, nama source_file.sb digunakan dan direktori tersebut di-mount sementara dengan tmpfs

**Contoh:**

- Ekstrak modul untuk memeriksa isinya: `sb2dir mymodule.sb`
- Ekstrak ke direktori tertentu: `sb2dir mymodule.sb /tmp/extracted`

### rmsbdir

Utilitas `rmsbdir` menghapus direktori modul yang dibuat oleh `sb2dir`. Ini akan membersihkan mount tmpfs dengan benar jika digunakan.

**Penggunaan:**

`rmsbdir [source_directory.sb]`

**Contoh:**

- Hapus direktori modul hasil ekstrak: `rmsbdir mymodule.sb`

### savechanges

Utilitas `savechanges` menyimpan semua file yang berubah di sistem ke dalam bundle filesystem terkompresi. Ini berguna untuk membuat modul dari perubahan yang terjadi saat runtime.

**Opsi yang tersedia:**

- `-c`/`--comp` - Jenis kompresi (zstd, gzip, lzo, xz). Default: zstd
- `-b`/`--bext` - Ekstensi bundle. Default: sb

**Penggunaan:**

`savechanges [OPTIONS] target_file.sb [changes_directory]`

Jika changes_directory tidak ditentukan, `/run/initramfs/memory/changes` akan digunakan.

**Contoh:**

- Simpan semua perubahan saat ini: `savechanges my-changes.sb`
- Simpan dengan kompresi berbeda: `savechanges -c xz my-changes.sb`

### sb2iso

Utilitas `sb2iso` menghasilkan image ISO MiniOS, dengan opsi menambahkan modul tertentu atau mengecualikan modul yang sudah ada.

**Opsi yang tersedia:**

- `-e`/`--exclude` - Kecualikan path atau file yang cocok dengan REGEX
- `-n`/`--name` - Tentukan nama file ISO output (default: minios-YYYYMMDD_HHMM.iso)

**Penggunaan:**

`sb2iso [OPTIONS]... [MODULE.SB]...`

**Contoh:**

- Buat ISO MiniOS tanpa modul firefox.sb: `sb2iso -e 'firefox' -n minios_without_firefox.iso`
- Buat MiniOS hanya mode teks: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

Utilitas `sb` menyediakan antarmuka lengkap untuk mengelola bundle MiniOS, termasuk aktivasi, deaktivasi, dan operasi konversi.

**Penting:** Utilitas `sb` membutuhkan dukungan kernel AUFS (Advanced multi layered UniFication FileSystem) untuk sebagian besar operasi. Jika AUFS tidak tersedia di kernel Anda, banyak perintah yang tidak akan berfungsi.

**Perintah yang tersedia:**

- `activate BUNDLE` - Aktifkan bundle MiniOS
- `deactivate BUNDLE` - Nonaktifkan bundle MiniOS yang aktif  
- `list` - Daftar bundle MiniOS yang aktif
- `savechanges` - Simpan perubahan yang terjadi saat runtime ke bundle
- `rm DIR` / `rmdir DIR` - Hapus direktori bundle yang sudah diekstrak
- `conv PATH` - Konversi bundle .sb ke direktori atau sebaliknya

**Contoh:**

- Aktifkan modul: `sb activate mymodule.sb`
- Nonaktifkan modul: `sb deactivate mymodule.sb`
- Daftar modul yang aktif: `sb list`
- Konversi modul ke direktori: `sb conv mymodule.sb`
- Konversi direktori ke modul: `sb conv mymodule/`

**Catatan:** Perintah `activate`, `deactivate`, dan `list` membutuhkan dukungan kernel AUFS dan hak akses root. Perintah `conv`, `rm`, dan `rmdir` dapat berjalan tanpa AUFS namun tetap membutuhkan hak akses root.

## Dokumentasi Terkait

- **[Membangun Ulang ISO](/development/Rebuilding-ISO.md)** - Pelajari cara mengemas modul kustom Anda menjadi image ISO bootable menggunakan `sb2iso`
- **[Membangun MiniOS](/development/Building-MiniOS.md)** - Panduan lengkap membangun MiniOS dari source dengan konfigurasi kustom
