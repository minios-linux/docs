---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Mengelola modul

Manajer Modul MiniOS adalah aplikasi grafis untuk memeriksa, membuat, dan mengelola MiniOS`.sb` modul. Aplikasi ini memiliki dua ruang kerja: **Modul** untuk menyusun sistem dan **Buat** untuk membuat modul baru.

Buka aplikasi ini dari menu aplikasi atau jalankan:

```bash
minios-module-manager
```

Aplikasi ini berjalan dengan akun pengguna desktop Anda. Aplikasi hanya meminta autentikasi administrator saat operasi yang diminta memerlukannya.

## Sedang Berjalan dan Boot Berikutnya

Ruang kerja Modul memiliki dua tampilan terpisah:

- **Sedang Berjalan** adalah kumpulan modul berurutan yang saat ini membentuk sistem aktif.
- **Boot Berikutnya** adalah kumpulan berurutan yang dipilih oleh aturan boot MiniOS saat ini.

Mengubah satu tampilan tidak akan mengubah tampilan lainnya secara diam-diam. Misalnya, **Aktifkan untuk Sesi Ini** hanya memengaruhi sistem yang sedang berjalan, sedangkan **Tambahkan ke Boot Berikutnya** menyalin modul ke penyimpanan modul permanen tanpa mengaktifkannya sekarang.

Untuk mengetahui aturan boot yang menjadi acuan, termasuk tingkatan sumber kandidat, penggantian berdasarkan nama dasar yang persis, pengurutan numerik, dan `load=`, `noload=`, serta `bext=` penyaringan, lihat [Pemuatan modul Initrd](/reference/boot-process/Module-Loading). Panduan tersebut juga menjelaskan alasan tampilan Sedang Berjalan dan Boot Berikutnya bisa berbeda.

Aktivasi dan penonaktifan saat runtime hanya tersedia jika sistem berkas root saat ini menggunakan AUFS. Fitur ini tidak tersedia pada root OverlayFS, meskipun kernel mendukung AUFS. Modul bawaan tidak dapat dinonaktifkan melalui aplikasi.

Perubahan untuk boot berikutnya hanya tersedia jika penyimpanan modul permanen yang sesuai dan dapat ditulisi tersedia. Menonaktifkan modul pengguna akan memindahkannya ke penyimpanan `modules-disabled/` yang terpisah, bukan menghapusnya; modul tersebut dapat dipulihkan nanti. Penghapusan permanen adalah tindakan terpisah untuk modul yang dinonaktifkan. Modul bawaan dan modul di penyimpanan hanya-baca atau volatil tidak dapat dinonaktifkan. Filter boot seperti `load`, `noload`, dan `bext` tetap menentukan modul mana yang dipilih.

## Memeriksa modul

Pilih modul untuk melihat lokasi file sumber, ukuran terkompresi, dan isi sistem file. Jika file sumbernya tersedia, **Ekstrak ke Folder** akan membuat direktori baru yang berisi file modul.

Pemeriksaan tidak memerlukan hak administrator. **Ekstrak ke Folder** akan meminta autentikasi administrator agar pemilik, izin, dan file khusus tetap dipertahankan. Proses ekstraksi tidak pernah mengganti tujuan yang sudah ada atau mengubah modul sumber.

Anda juga dapat membuka file `.sb` lokal dari pengelola file. Membuka file hanya akan memeriksanya; file tidak akan diaktifkan atau ditambahkan ke Boot Berikutnya. Pada sistem Xfce yang memasang integrasi Thunar MiniOS, tindakan di pengelola file menggunakan backend modul yang sama untuk aktivasi dan penonaktifan secara eksplisit; tindakan tersebut tidak mengabaikan perbedaan antara Sedang Berjalan dan Boot Berikutnya.

## Membuat modul

Ruang kerja Create menggunakan alur **Configure**, **Review**, **Run**, dan **Result**. Modul yang berhasil dibuat tetap berupa file di lokasi output. Modul tersebut tidak diaktifkan dan tidak otomatis ditambahkan ke Next Boot.

Metode yang tersedia:

- **Packages** menginstal paket repositori dan file lokal `.deb` yang dipilih, termasuk dependensinya, di lingkungan build terisolasi MiniOS. Penginstalan paket memerlukan autentikasi administrator.
- **Installation Script** menjalankan skrip yang telah ditinjau tanpa terminal interaktif. Folder seed opsional dapat menyediakan file awal. Skrip berjalan dengan hak administrator, tetapi tidak disimpan dalam modul yang dihasilkan.
- **Interactive Chroot** membuka shell root sementara di terminal tersemat. Ketik `exit` setelah selesai, lalu buat modul, buka kembali shell, atau buang perubahan. Menutup atau membuang sesi tidak mengubah sistem yang sedang berjalan.
- **Folder** mengemas isi direktori yang sudah ada. Direktori sumber tidak ditempatkan di dalam modul. Alur kerja grafis meminta autentikasi administrator untuk membaca file terlindungi dan mempertahankan atribut sistem file; sumber tidak diubah. Folder yang diekstrak dengan preservasi kepemilikan akan dikenali secara otomatis dan kepemilikannya dipertahankan. Untuk folder lama hasil ekstraksi tanpa catatan asal, pilih **Pertahankan kepemilikan sumber** jika kepemilikannya perlu dipertahankan.
- **Perubahan Sesi Saat Ini** mengambil file dan penghapusan yang memenuhi syarat dari lapisan sesi saat ini yang dapat ditulisi. Metode ini menggunakan kebijakan MiniOS `savechanges` standar, yang mengecualikan log, cache, data boot, dan jalur runtime sementara. Membaca seluruh lapisan yang dapat ditulisi memerlukan autentikasi administrator.

Pilih jalur output baru untuk setiap alur kerja. File yang sudah ada tidak akan pernah ditimpa. Progres dan diagnostik backend tetap terlihat selama operasi berlangsung, dan pengambilan dari sesi saat ini dapat dibatalkan.

Untuk folder lain, alur kerja Folder default mengubah ID pengguna dan grup biasa (1000–60000) menjadi root, kecuali di `/home` dan `/opt`, mempertahankan ID sistem, dan menjadikan direktori tingkat teratas standar dimiliki root. Kepemilikan yang hilang saat ekstraksi sebelumnya tanpa hak istimewa tidak dapat dipulihkan dengan opsi ini.

Perubahan Sesi Saat Ini ditujukan untuk pengambilan standar yang praktis, bukan untuk meninjau setiap jalur yang disertakan. Lapisan aktif yang dapat ditulisi mungkin berisi data pribadi atau rahasia. Untuk kebijakan privasi yang secara eksplisit menentukan `exact`, `clean` atau jalur, gunakan alur kerja `savechanges` baris perintah yang dijelaskan di [Mengambil perubahan sesi saat ini](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Seret dan lepas

Seret dan lepas hanya mengisi input atau membuka pemeriksaan:

- Detail modul akan terbuka.
- `.deb` file ditambahkan ke Paket.
- Direktori dipilih untuk Folder.
- File reguler lainnya dipilih sebagai Skrip Instalasi.

Menjatuhkan item tidak akan menjalankan kode atau mengubah Sedang Berjalan atau Boot Berikutnya.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Memuat modul Initrd](/reference/boot-process/Module-Loading)
- [Mode boot](/using-minios/Boot-Modes)
- [Menyusun image ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parameter boot](/reference/Boot-Parameters)

<a id="creating-modules"></a>

## Membuat modul

MiniOS modul adalah image sistem file yang bersifat hanya-baca SquashFS, biasanya menggunakan nama dengan ekstensi`.sb`. Saat boot, MiniOS menyusun modul yang dipilih menjadi sistem file root berlapis. File di lapisan dengan prioritas lebih tinggi dapat menambahkan atau menyembunyikan file dari lapisan di bawahnya. Pipeline live modular ini merupakan bagian dari arsitektur MiniOS yang menjadi ciri khas, seperti dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS) dan [Mode boot](/using-minios/Boot-Modes). Setelah dikonversi menjadi native, root berlapis `.sb` akan digantikan oleh sistem file Debian konvensional yang dapat ditulis. Software manajemen modul MiniOS dihapus karena alur kerja modul tidak lagi berlaku, sementara lingkungan desktop yang dipilih dan aplikasi biasa tetap terpasang sebagai paket standar.

Panduan ini menjelaskan alur kerja baris perintah MiniOS Tools saat ini. Untuk aplikasi grafis, lihat [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules). Untuk mengetahui proses lengkap pembuatan image dan arsitektur sistem, lihat [Membangun MiniOS](/development/Building-MiniOS). Daftar paket yang digunakan saat membangun MiniOS dijelaskan dalam dokumentasi [CondinAPT](/development/CondinAPT).

### Batas keamanan dan hak istimewa

Tidak semua operasi modul memerlukan akses root:

| Operasi | Hak istimewa |
|---|---|
| Daftar yang Sedang Berjalan atau Boot Berikutnya dengan `sb` | Tanpa root |
| Periksa modul dengan `sb inspect` | Tanpa root |
| Baris perintah biasa `dir2sb` dan `sb2dir` konversi | Tanpa root |
| Pertahankan kepemilikan atau izinkan file khusus selama konversi | Root |
| Build dengan `apt2sb`, `script2sb`, atau `chroot2sb` | Root |
| Rekam sesi dengan `savechanges` | Root |
| Aktifkan, nonaktifkan, tambahkan ke Boot Berikutnya, atau hapus dari Boot Berikutnya | Root |

Builder menggunakan union terisolasi dan tidak menginstal paket atau perubahan skrip ke root yang sedang berjalan. Pembuatan juga tidak mengaktifkan hasilnya atau memilihnya untuk boot berikutnya.

Alur kerja Folder dan Extract to Folder pada antarmuka grafis meminta autentikasi administrator agar dapat menangani file yang dilindungi dan mempertahankan atribut sistem file.

Konverter dan builder saat ini menggunakan publikasi tanpa penggantian. Target yang sudah ada, termasuk tautan simbolis, tidak akan ditimpa. Pilih jalur output baru atau tinjau dan hapus sendiri output lama secara eksplisit.

Gunakan output `--help` setiap perintah sebagai referensi versi yang terinstal. Alur kerja `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, dan `savechanges` menerima `zstd` (default), `gzip`, `lzo`, `lz4`, dan `xz`. Kompresor yang dipilih harus tersedia di sistem yang sedang berjalan.

### Nama modul dan level filter

Nama biasanya diawali angka, seperti `06-browser.sb` karena urutan layer memengaruhi penyelesaian konflik. Modul sebaiknya berisi path relatif terhadap root sistem, seperti `usr/bin/example`, bukan direktori tambahan yang berisi pohon tersebut.

Untuk mengetahui tier sumber kandidat, perilaku saat basename bertabrakan, urutan numerik, dan `bext=`, `load=`, dan `noload=`semantik, lihat [Pemuatan modul Initrd](/reference/boot-process/Module-Loading). Secara khusus, gunakan basename yang unik kecuali modul memang dimaksudkan untuk menggantikan slot dengan nama yang sama dari tier sumber sebelumnya.

Opsi `--level LEVEL` pada `apt2sb`, `script2sb` dan `chroot2sb` membatasi layer dasar yang digunakan untuk membentuk union build. Dengan `--level 3`, layer bernomor hingga `03` akan digunakan, sedangkan layer dengan nomor lebih tinggi akan difilter. Ini dapat mengurangi ketergantungan modul pada layer opsional yang lebih tinggi, dengan konsekuensi lebih banyak dependensi disertakan dalam hasil.

<a id="create-a-module-from-packages"></a>

### Membuat modul dari paket

`apt2sb` menginstal paket repositori atau `.deb` file lokal yang dapat dibaca ke dalam union build privat dan merekam hasilnya. Proses ini memerlukan sesi live MiniOS yang didukung dan akses root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Tanpa `--name`, nama output diturunkan dari paket pertama. Opsi APT yang berguna mencakup `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, dan `--target-release RELEASE`. Opsi target-release hanya berlaku untuk `install`.

Untuk merekam peningkatan versi paket yang sudah terinstal:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Buat modul dari skrip

`script2sb` menyalin skrip instalasi ke chroot privat, menjadikannya dapat dieksekusi, menjalankannya sebagai root tanpa terminal interaktif, menghapusnya, lalu merekam perubahan pada sistem file. Skrip yang gagal tidak akan membuat modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opsional, `--directory DIR` menyalin semua isi sumber, termasuk dotfile, ke root modul sebelum skrip dijalankan. Susun direktori seed sebagai hierarki sistem file:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Tinjau skrip sebelum menjalankannya. Skrip dijalankan dengan hak administrator dan dapat menjalankan perintah apa pun. Gunakan `chroot2sb` jika instalasi memerlukan prompt atau pekerjaan manual.

<a id="create-a-module-interactively"></a>

### Buat modul secara interaktif

`chroot2sb` membuat build union privat dan membuka shell root di dalamnya. Instal paket atau edit file, lalu keluar dari shell untuk merekam perubahan:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Perintah yang dimasukkan di shell tidak akan dijalankan ulang saat modul dimuat; modul adalah snapshot dari kondisi sistem file yang dihasilkan. Riwayat shell dihapus dari hasil. Jika nama tidak ditentukan, nama yang dibuat akan menggunakan tanggal dan waktu saat ini.

Pemisahan `prepare`, `shell`, `finish`, dan `cancel` siklus tersedia untuk frontend grafis yang dilindungi. Untuk penggunaan terminal biasa, gunakan satu perintah interaktif yang ditampilkan di atas.

<a id="create-a-module-from-a-directory"></a>

### Buat modul dari direktori

`dir2sb` mengemas isi direktori yang telah disiapkan menjadi modul baru. Kedua operand wajib diisi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Konversi biasa tidak memerlukan root. Proses ini tidak mengubah sumber, mengubah ID pengguna dan grup biasa (1000–60000) menjadi root di luar `/home` dan `/opt`, mempertahankan ID sistem, dan menjadikan direktori tingkat atas standar dimiliki root. Proses ini menolak node perangkat, socket, dan FIFO, serta tidak pernah menimpa target. `--keep-ownership` mempertahankan semua pemilik sumber dan `--allow-special` mengizinkan file khusus; keduanya memerlukan root.

`sb2dir` menulis `.minios-module-origin.json` di direktori hasil ekstraksi. Jika ekstraksi mempertahankan kepemilikan, `dir2sb` mengenali catatan ini dan otomatis mempertahankan pemilik serta file khusus saat mengemas ulang; catatan itu sendiri tidak disertakan dalam modul baru. Direktori yang diekstrak tanpa mempertahankan kepemilikan tidak dapat dikemas ulang karena pemilik aslinya tidak lagi diketahui. Ekstrak ulang modul asli dengan opsi berhak istimewa.

<a id="capture-current-session-changes"></a>

### Ambil perubahan sesi saat ini

`savechanges` membaca lapisan writable otoritatif dari sesi MiniOS yang sedang berjalan. Proses ini memerlukan akses root karena lapisan tersebut dapat berisi file yang hanya dapat diakses oleh root. Lokasi perubahan default dideteksi secara otomatis:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Tanpa `--profile`, kebijakan MiniOS lama mengabaikan direktori kosong, cache, log, data boot, path runtime, pseudo-filesystem, serta file sesi dan sistem tertentu. Ini memudahkan pembuatan modul secara tradisional, tetapi bukan jaminan privasi yang eksplisit.

Profil eksplisit yang tersedia:

- `exact` mempertahankan perubahan yang dapat direpresentasikan, termasuk data pengguna, log, cache, file identitas, kredensial, dan metadata penghapusan yang didukung. Profil ini menolak objek filesystem yang tidak didukung agar tidak hilang begitu saja.
- `clean` menggunakan daftar izin path terbatas yang berorientasi pada perangkat lunak. Profil ini mengecualikan data home dan root, log, cache, identitas, konfigurasi jaringan, kredensial, konfigurasi sistem sembarang, serta `/usr/local`. Profil ini mengurangi paparan privasi, tetapi tidak menjamin bahwa file perangkat lunak yang diizinkan tidak berisi rahasia.
- `selected` hanya menyertakan path relatif yang telah ditinjau dari file inventaris dan seleksi. Pengecualian eksplisit selalu diutamakan. Profil ini cocok digunakan saat modul harus berisi subset perubahan sesi yang terkontrol.

Contoh:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

File seleksi menggunakan struktur JSON yang ketat berikut:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Path dinormalisasi, tidak kosong, dan relatif terhadap root perubahan. Buat dan tinjau inventaris terlebih dahulu; setiap entri yang disertakan harus cocok dengan data inventaris. Catatan inventaris mencakup metadata seperti path, jenis, kategori, sensitivitas, dan ukuran, tetapi tidak membaca atau mengeluarkan isi file, target tautan simbolis, maupun nilai rahasia. Output dan inventaris profil eksplisit menggunakan mode `0600`; modul dengan kebijakan lama menggunakan mode `0644`.

Pengambilan sesi dapat mempertahankan penghapusan file yang didukung dan opasitas direktori untuk backend AUFS atau OverlayFS yang aktif. Proses ini mengecualikan mount runtime, filesystem bersarang, pencatatan internal union, dan output itu sendiri. Target yang sudah ada tidak akan pernah diganti.

<a id="inspect-and-extract-modules"></a>

### Periksa dan ekstrak modul

Periksa modul tanpa memasang atau mengekstraknya:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Pemeriksaan tidak memerlukan akses root dan juga dapat dilakukan di luar sesi MiniOS.

Ekstrak modul ke direktori baru:

```bash
sb2dir 06-example.sb example-root
```

Ekstraksi biasa tidak memerlukan akses root dan tidak mengubah sumber. Direktori tujuan tidak boleh sudah ada. File khusus akan ditolak kecuali `--allow-special` diminta dengan hak istimewa yang memadai.

Untuk direktori yang dapat dikemas ulang dengan tepat, lakukan ekstraksi dengan hak administrator dan pertahankan kepemilikan serta file khusus:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

Ekstraksi mencatat asal modul di `.minios-module-origin.json` di dalam direktori baru. Ekstraksi tanpa akses root mencatat bahwa kepemilikan tidak dipertahankan; direktori tersebut tidak dapat diberikan kembali ke `dir2sb`. Simpan catatan asal dari ekstraksi dengan hak istimewa hingga pengemasan ulang.

Direktori yang dihasilkan oleh `sb2dir` saat ini adalah direktori biasa. `rmsbdir`, `sb rm`, dan `sb rmdir` adalah perintah kompatibilitas lama yang selalu menolak penghapusan; perintah tersebut tidak melepas kaitan (unmount) atau menghapus apa pun secara rekursif. Tinjau jalur hasil ekstraksi beserta isinya sebelum menghapusnya menggunakan alat sistem file standar.

<a id="manage-running-and-next-boot-modules"></a>

### Kelola modul yang berjalan dan yang akan dimuat saat boot

Running Now dan Next Boot adalah komposisi yang berdiri sendiri. Lihat [konstruksi union dan aktivasi runtime](/reference/boot-process/Module-Loading#union-construction) untuk memahami batas antara boot dan runtime, serta alasan kedua daftar tersebut dapat berbeda.

Tampilkan modul yang benar-benar menyusun root AUFS atau OverlayFS saat ini, dari prioritas terendah ke tertinggi:

```bash
sb list
sb list --json
```

Tampilkan modul yang dipilih oleh aturan boot saat ini:

```bash
sb next-boot
sb next-boot --json
```

Kueri ini tidak bergantung pada root. [aturan tingkat kandidat dan penggantian](/reference/boot-process/Module-Loading#candidate-tiers) yang berlaku menentukan sumber yang menyediakan setiap nama dasar Next Boot.

Agar modul pengguna tersedia pada boot berikutnya:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS menggunakan penyimpanan tahan lama yang dapat ditulisi dan sesuai, menyiapkan serta memvalidasi salinan, lalu menerbitkannya secara atomik tanpa mengganti modul yang sudah ada. Nama file harus memenuhi filter boot saat ini. Nonaktifkan modul pengguna yang dipilih dengan nama dasar yang persis:

```bash
sudo sb next-boot disable 50-extra.sb
```

Menonaktifkan modul akan menyimpan file di `modules-disabled/`. Perintah `next-boot remove` yang lebih lama merupakan alias untuk menonaktifkan, bukan menghapus secara permanen. Pulihkan atau hapus permanen file tersebut dengan:

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

Modul dasar serta modul dari sumber hanya-baca atau volatil tidak dapat dinonaktifkan. Penghapusan permanen juga tidak dapat dilakukan pada modul yang aktif. Periksa `sb next-boot` dan daftar modul yang dinonaktifkan sebelum menghapus file yang disimpan.

Aktivasi runtime adalah operasi terpisah yang hanya berlaku untuk sesi saat ini:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivasi dan penonaktifan hanya berfungsi jika `/` saat ini merupakan union AUFS. Fitur ini tidak tersedia pada OverlayFS, dan dukungan AUFS kernel saja tidak cukup. Kedua perintah tersebut tidak mengubah Next Boot.

Dispatcher konverter kompatibilitas memerlukan kedua operand:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Penggunaan `dir2sb` dan `sb2dir`secara langsung lebih disarankan karena konversi biasa dapat dijalankan tanpa root.

### Dokumentasi terkait

- [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules)
- [Memuat modul Initrd](/reference/boot-process/Module-Loading)
- [Mode boot](/using-minios/Boot-Modes)
- [Membangun ulang image ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Membangun MiniOS](/development/Building-MiniOS)
- [Parameter boot](/reference/Boot-Parameters)
