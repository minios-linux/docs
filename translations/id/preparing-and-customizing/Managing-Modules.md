---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Mengelola modul

Manajer Modul MiniOS adalah aplikasi grafis untuk memeriksa, membuat, dan mengelola MiniOS `.sb` modul. Aplikasi ini memiliki dua ruang kerja: **Modul** untuk komposisi sistem dan **Buat** untuk membuat modul baru.

Jalankan dari menu aplikasi atau dengan perintah berikut:

```bash
minios-module-manager
```

Aplikasi ini berjalan sebagai pengguna desktop Anda. Permintaan autentikasi administrator hanya muncul jika operasi yang diminta membutuhkannya.

## Sedang Berjalan dan Boot Berikutnya

Workspace Modul menyediakan dua tampilan terpisah:

- **Sedang Berjalan** adalah urutan modul yang saat ini membentuk sistem yang sedang aktif.
- **Boot Berikutnya** adalah urutan modul yang dipilih berdasarkan aturan boot MiniOS saat ini.

Mengubah satu tampilan tidak akan otomatis mengubah tampilan lainnya. Sebagai contoh, **Aktifkan untuk Sesi Ini** hanya memengaruhi sistem yang sedang berjalan, sedangkan **Tambahkan ke Boot Berikutnya** menyalin modul ke penyimpanan modul yang tahan lama tanpa langsung mengaktifkannya.

Untuk aturan boot yang otoritatif, termasuk tingkatan sumber kandidat, penggantian nama file dasar secara tepat, pengurutan numerik, dan penyaringan `load=`, `noload=`, dan `bext=`, lihat [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading). Panduan tersebut juga menjelaskan mengapa Sedang Berjalan dan Boot Berikutnya bisa berbeda.

Aktivasi dan deaktivasi runtime hanya tersedia ketika root filesystem saat ini menggunakan AUFS. Fitur ini tidak tersedia pada root OverlayFS, meskipun kernel mendukung AUFS. Modul dasar tidak dapat dinonaktifkan melalui aplikasi.

Perubahan boot berikutnya hanya tersedia jika MiniOS menemukan penyimpanan modul yang tahan lama dan dapat ditulis. Modul dasar dan modul yang berada di penyimpanan hanya-baca atau volatile tidak dapat dihapus. Filter boot seperti `load`, `noload`, dan `bext` tetap menentukan modul mana yang dipilih.

## Memeriksa modul

Pilih sebuah modul untuk melihat sumbernya, ukuran terkompresi, dan isi filesystem-nya. Jika file pendukungnya tersedia, **Extract to Folder** akan membuat direktori baru yang berisi file modul tersebut.

Pemeriksaan dan ekstraksi biasa tidak memerlukan hak administrator. Ekstraksi tidak pernah menimpa tujuan yang sudah ada.

Anda juga dapat membuka file lokal `.sb` dari file manager. Membuka file hanya untuk memeriksa; tidak mengaktifkan atau menambahkannya ke Next Boot.

## Membuat modul

Ruang kerja Create menggunakan alur **Configure**, **Review**, **Run**, dan **Result**. Modul yang berhasil dibuat akan tetap menjadi file di lokasi output. Modul tersebut tidak langsung diaktifkan maupun otomatis ditambahkan ke Next Boot.

Metode yang tersedia:

- **Packages** menginstal paket repository dan file lokal `.deb` terpilih, beserta dependensinya, dalam lingkungan build MiniOS yang terisolasi. Instalasi paket memerlukan autentikasi administrator.
- **Installation Script** menjalankan skrip yang telah direview tanpa terminal interaktif. Folder seed opsional dapat menyediakan file awal. Skrip dijalankan dengan hak administrator, tetapi tidak disimpan di modul hasil.
- **Interactive Chroot** membuka shell root sementara di terminal terintegrasi. Ketik `exit` saat selesai, lalu buat modul, buka kembali shell, atau batalkan perubahan. Menutup atau membatalkan sesi tidak mengubah sistem yang sedang berjalan.
- **Folder** mengemas isi direktori yang sudah ada. Direktori sumber tidak akan terduplikasi di dalam modul. Konversi folder biasa tidak memerlukan root, tidak mengubah sumber, dan kepemilikan file di modul dinormalisasi ke root.
- **Current Session Changes** menangkap file dan penghapusan yang memenuhi syarat dari layer sesi writable saat ini. Menggunakan kebijakan standar MiniOS `savechanges`, yang mengabaikan log, cache, data boot, dan path runtime sementara. Membaca seluruh layer writable memerlukan autentikasi administrator.

Pilih path output baru untuk setiap workflow. File yang sudah ada tidak pernah ditimpa. Progres dan diagnostik backend tetap terlihat selama operasi berlangsung, dan proses capture sesi saat ini dapat dibatalkan.

Current Session Changes ditujukan untuk capture standar yang praktis, bukan untuk meninjau setiap path yang termasuk. Layer writable yang aktif dapat berisi data pribadi atau rahasia. Untuk kebijakan privasi eksplisit berbasis `exact`, `clean`, atau path tertentu, gunakan workflow command-line `savechanges` yang dijelaskan di [Creating modules](/preparing-and-customizing/Managing-Modules).

## Drag and drop

Drag and drop hanya mengisi input atau membuka tampilan inspeksi:

- Sebuah modul akan membuka detailnya.
- File `.deb` akan ditambahkan ke Packages.
- Sebuah direktori akan dipilih untuk Folder.
- File reguler lain akan dipilih sebagai Installation Script.

Menjatuhkan item tidak akan mengeksekusi kode atau mengubah Running Now maupun Next Boot.

## Dokumentasi terkait

- [Creating modules](/preparing-and-customizing/Managing-Modules)
- [Initrd module loading](/reference/boot-process/Module-Loading)
- [Boot modes](/using-minios/Boot-Modes)
- [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Boot parameters](/reference/Boot-Parameters)

## Membuat modul

MiniOS modul adalah citra filesystem SquashFS yang hanya-baca, biasanya dinamai dengan ekstensi `.sb`. Saat boot, MiniOS mengurutkan modul-modul terpilih ke dalam filesystem root berlapis. Berkas pada layer prioritas lebih tinggi dapat menambah atau menyembunyikan berkas dari layer di bawahnya. Pipeline live modular ini merupakan bagian dari arsitektur MiniOS yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS) dan [Mode Boot](/using-minios/Boot-Modes). Setelah konversi native, root berlapis `.sb` akan digantikan oleh filesystem Debian biasa yang dapat ditulis. Perangkat lunak manajemen modul MiniOS dihapus karena workflow modul tidak lagi berlaku, sementara lingkungan desktop yang dipilih dan aplikasi biasa tetap terpasang sebagai paket normal.

Panduan ini mendokumentasikan workflow baris perintah MiniOS Tools yang berlaku saat ini. Untuk aplikasi grafis, lihat [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules). Untuk proses build image lengkap dan arsitektur sistem, lihat [Membangun MiniOS](/development/Building-MiniOS). Daftar paket yang digunakan saat membangun MiniOS dijelaskan dalam [dokumentasi CondinAPT](/development/CondinAPT).

### Batasan Keamanan dan Hak Akses

Tidak semua operasi modul memerlukan root:

| Operasi | Hak Akses |
|---|---|
| List Running Now atau Next Boot dengan `sb` | Tanpa root |
| Memeriksa modul dengan `sb inspect` | Tanpa root |
| Konversi `dir2sb` dan `sb2dir` biasa | Tanpa root |
| Mempertahankan kepemilikan atau mengizinkan file khusus saat konversi | Root |
| Build dengan `apt2sb`, `script2sb`, atau `chroot2sb` | Root |
| Capture sesi dengan `savechanges` | Root |
| Aktivasi, deaktivasi, tambah ke Next Boot, atau hapus dari Next Boot | Root |

Builder menggunakan union terisolasi dan tidak menginstal paket atau perubahan skrip ke root yang sedang berjalan. Proses pembuatan juga tidak mengaktifkan hasil atau memilihnya untuk boot berikutnya.

Konverter dan builder saat ini menggunakan publikasi tanpa replace. Target yang sudah ada, termasuk symbolic link, tidak akan ditimpa. Pilih path output baru atau secara eksplisit tinjau dan hapus output lama sendiri.

Gunakan output `--help` dari setiap perintah sebagai referensi versi terpasang. Pilihan kompresi builder standar adalah `zstd` (default), `gzip`, `lzo`, dan `xz`; `dir2sb` juga mendukung `lz4`.

### Nama Modul dan Level Filter

Nama biasanya diawali dengan angka seperti `06-browser.sb` karena urutan layer memengaruhi penyelesaian konflik. Sebuah modul sebaiknya berisi path relatif terhadap root sistem, seperti `usr/bin/example`, bukan direktori tambahan yang berisi pohon tersebut.

Untuk tingkatan sumber kandidat yang tepat, perilaku tabrakan nama file dasar, pengurutan numerik, serta semantik `bext=`, `load=`, dan `noload=`, lihat [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading). Secara khusus, gunakan nama file dasar yang unik kecuali modul memang dimaksudkan untuk menggantikan slot bernama sama dari tingkatan sumber sebelumnya.

Opsi `--level LEVEL` pada `apt2sb`, `script2sb`, dan `chroot2sb` membatasi layer dasar yang digunakan untuk membangun union build. Dengan `--level 3`, layer bernomor hingga `03` akan digunakan dan layer dengan nomor lebih tinggi akan difilter. Ini dapat membuat modul menjadi kurang bergantung pada layer opsional yang lebih tinggi, dengan konsekuensi menambah lebih banyak dependensi pada hasil akhir.

### Membuat modul dari paket

`apt2sb` menginstal paket repository atau file lokal `.deb` yang dapat dibaca ke dalam union build privat dan menangkap hasilnya. Memerlukan sesi live MiniOS yang didukung dan akses root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Tanpa `--name`, nama output diambil dari paket pertama. Opsi APT yang berguna termasuk `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, dan `--target-release RELEASE`. Opsi target-release hanya berlaku untuk `install`.

Untuk menangkap upgrade pada paket yang sudah terinstal:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Membuat modul dari skrip

`script2sb` menyalin skrip instalasi ke dalam chroot privat, menjadikannya executable, menjalankannya sebagai root tanpa terminal interaktif, menghapusnya, lalu menangkap perubahan filesystem yang dihasilkan. Jika skrip gagal, modul tidak akan dibuat.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opsi `--directory DIR` akan menyalin seluruh isi sumber, termasuk dotfiles, ke root modul sebelum skrip dijalankan. Atur direktori seed seperti struktur filesystem berikut:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Tinjau skrip sebelum menjalankannya. Skrip akan dieksekusi dengan hak administrator dan dapat menjalankan perintah apa pun. Gunakan `chroot2sb` jika instalasi memerlukan prompt atau pekerjaan manual.

### Membuat modul secara interaktif

`chroot2sb` membuat union build privat dan membuka shell root di dalamnya. Instal paket atau edit file, lalu keluar dari shell untuk menangkap perubahan:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Perintah yang dimasukkan di shell tidak akan diulang saat modul dimuat; modul hanyalah snapshot dari keadaan filesystem setelah perubahan. Riwayat shell dihapus dari hasil. Jika nama tidak diberikan, nama yang dihasilkan menggunakan tanggal dan waktu saat ini.

Siklus hidup terpisah `prepare`, `shell`, `finish`, dan `cancel` digunakan untuk frontend grafis yang dilindungi. Untuk penggunaan terminal biasa, gunakan perintah interaktif tunggal seperti di atas.

### Membuat modul dari direktori

`dir2sb` mengemas isi direktori yang telah disiapkan ke dalam modul baru. Kedua operand wajib diisi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Konversi biasa tidak memerlukan root. Sumber tidak diubah, kepemilikan file di modul dinormalisasi ke root, node perangkat, socket, dan FIFO ditolak, dan target tidak pernah ditimpa. Gunakan `--keep-ownership` atau `--allow-special` hanya jika membutuhkan hak istimewa tersebut.

### Menangkap perubahan sesi saat ini

`savechanges` membaca layer writable yang sah dari sesi MiniOS yang sedang berjalan. Memerlukan root karena layer ini dapat berisi file yang hanya dapat diakses root. Lokasi perubahan default dideteksi secara otomatis:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Tanpa `--profile`, kebijakan MiniOS lama mengabaikan direktori kosong, cache, log, data boot, path runtime, pseudo-filesystem, serta file sesi dan sistem tertentu. Ini praktis untuk pembuatan modul tradisional, namun bukan jaminan privasi eksplisit.

Profil eksplisit yang tersedia:

- `exact` mempertahankan perubahan yang dapat direpresentasikan, termasuk data pengguna, log, cache, file identitas, kredensial, dan metadata penghapusan yang didukung. File sistem yang tidak didukung akan ditolak, bukan diabaikan diam-diam.
- `clean` menggunakan allowlist path yang sempit dan berorientasi perangkat lunak. Mengabaikan data home dan root, log, cache, identitas, konfigurasi jaringan, kredensial, konfigurasi sistem arbitrer, dan `/usr/local`. Ini mengurangi eksposur privasi, tetapi tidak dapat menjamin file perangkat lunak yang diizinkan benar-benar bebas dari rahasia.
- `selected` hanya menyertakan path relatif yang telah direview dari file inventaris dan seleksi. Eksklusi eksplisit akan menang. Profil ini tepat digunakan jika modul harus berisi subset perubahan sesi yang terkontrol.

Contoh:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

File seleksi memiliki struktur JSON yang ketat seperti berikut:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Path dinormalisasi, tidak kosong, dan relatif terhadap root perubahan. Hasilkan dan tinjau inventaris terlebih dahulu; setiap include harus cocok dengan data inventaris. Inventaris mencatat metadata seperti path, tipe, kategori, sensitivitas, dan ukuran, tetapi tidak membaca atau mengeluarkan isi file, target symbolic-link, atau nilai rahasia. Output profil eksplisit dan inventaris menggunakan mode `0600`; modul kebijakan lama menggunakan mode `0644`.

Capture sesi dapat mempertahankan penghapusan file yang didukung dan opasitas direktori untuk backend AUFS atau OverlayFS yang aktif. Tidak termasuk mount runtime, filesystem bertingkat, pembukuan union, dan output itu sendiri. Target yang sudah ada tidak pernah ditimpa.

### Memeriksa dan mengekstrak modul

Periksa modul tanpa mounting atau ekstraksi:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Pemeriksaan tidak memerlukan root dan juga dapat dilakukan di luar sesi MiniOS yang sedang berjalan.

Ekstrak modul ke direktori baru:

```bash
sb2dir 06-example.sb example-root
```

Ekstraksi biasa tidak memerlukan root dan tidak mengubah sumber. Direktori target tidak boleh sudah ada. File khusus akan ditolak kecuali `--allow-special` diminta dengan hak istimewa yang cukup.

Direktori yang dihasilkan oleh `sb2dir` saat ini adalah direktori biasa. `rmsbdir`, `sb rm`, dan `sb rmdir` adalah perintah kompatibilitas lama yang selalu menolak penghapusan; mereka tidak melakukan unmount atau menghapus secara rekursif. Tinjau path hasil ekstraksi dan isinya sebelum menghapusnya dengan alat filesystem standar.

### Kelola Modul yang Sedang Berjalan dan Boot Berikutnya

Sedang Berjalan dan Boot Berikutnya adalah komposisi yang independen. Lihat [konstruksi union dan aktivasi runtime](/reference/boot-process/Module-Loading) untuk batas antara boot/runtime dan alasan kedua daftar tersebut bisa berbeda.

Daftar modul yang benar-benar membentuk root AUFS atau OverlayFS saat ini, dari prioritas terendah ke tertinggi:

```bash
sb list
sb list --json
```

Daftar modul yang dipilih oleh aturan boot saat ini:

```bash
sb next-boot
sb next-boot --json
```

Query ini dapat dijalankan tanpa akses root. [Aturan kandidat-tier dan penggantian](/reference/boot-process/Module-Loading) yang kanonik menentukan sumber mana yang menyediakan setiap nama file dasar Boot Berikutnya.

Untuk membuat modul pengguna tersedia pada boot berikutnya:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS menggunakan penyimpanan tahan lama yang dapat ditulis, melakukan staging dan validasi salinan, serta mempublikasikannya secara atomik tanpa menggantikan modul yang sudah ada. Nama file harus sesuai dengan filter boot saat ini. Hapus modul pengguna yang dipilih berdasarkan nama file dasar yang tepat:

```bash
sudo sb next-boot remove 50-extra.sb
```

Penghapusan akan ditolak untuk modul dasar dan modul yang berasal dari sumber hanya-baca atau volatile.

Aktivasi runtime adalah operasi terpisah yang hanya berlaku untuk sesi saat ini:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivasi dan deaktivasi hanya berfungsi jika `/` saat ini merupakan union AUFS. Fitur ini tidak tersedia pada OverlayFS, dan dukungan kernel AUFS saja tidak cukup. Kedua perintah ini tidak mengubah Boot Berikutnya.

Dispatcher konverter kompatibilitas membutuhkan kedua operand:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Penggunaan langsung `dir2sb` dan `sb2dir` lebih disarankan karena konversi biasa dapat dijalankan tanpa akses root.

### Dokumentasi terkait

- [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules)
- [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading)
- [Mode Boot](/using-minios/Boot-Modes)
- [Membangun ulang image ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Membangun MiniOS](/development/Building-MiniOS)
- [Parameter boot](/reference/Boot-Parameters)
