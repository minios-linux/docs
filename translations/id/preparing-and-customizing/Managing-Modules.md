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

Workspace Create menggunakan alur **Konfigurasi**, **Tinjau**, **Jalankan**, dan **Hasil**. Modul yang berhasil dibuat tetap berupa file di lokasi output. Modul tersebut tidak diaktifkan dan tidak otomatis ditambahkan ke Next Boot.

Metode yang tersedia:

- **Paket** menginstal paket repository dan file lokal terpilih `.deb`, beserta dependensinya, di lingkungan build terisolasi MiniOS. Instalasi paket memerlukan autentikasi administrator.
- **Skrip Instalasi** menjalankan skrip yang telah ditinjau tanpa terminal interaktif. Folder seed opsional dapat menyediakan file awal. Skrip dijalankan dengan hak administrator namun tidak disimpan di modul hasil.
- **Chroot Interaktif** membuka root shell sementara di terminal tersemat. Ketik `exit` saat selesai, lalu buat modul, buka kembali shell, atau batalkan perubahan. Menutup atau membatalkan sesi tidak memengaruhi sistem yang sedang berjalan.
- **Folder** mengemas isi direktori yang sudah ada. Direktori sumber tidak disarangkan di dalam modul. Konversi folder biasa tidak memerlukan root, sumber tetap tidak berubah, dan kepemilikan di modul dinormalisasi menjadi root.
- **Perubahan Sesi Saat Ini** menangkap file dan penghapusan yang memenuhi syarat dari layer sesi tulis saat ini. Menggunakan kebijakan standar MiniOS `savechanges` yang mengabaikan log, cache, data boot, dan path runtime sementara. Membaca seluruh layer tulis membutuhkan autentikasi administrator.

Pilih path output baru untuk setiap workflow. File yang sudah ada tidak pernah ditimpa. Progres dan diagnostik backend tetap terlihat selama operasi berjalan, dan penangkapan sesi saat ini dapat dibatalkan.

Perubahan Sesi Saat Ini ditujukan untuk penangkapan standar yang praktis, bukan untuk meninjau setiap path yang disertakan. Layer tulis aktif dapat berisi data pribadi atau rahasia. Untuk kebijakan privasi yang eksplisit berdasarkan `exact`, `clean`, atau pemilihan path, gunakan workflow command-line `savechanges` yang dijelaskan di [Tangkap perubahan sesi saat ini](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Drag and drop

Drag and drop hanya mengisi input atau membuka tampilan inspeksi:

- Sebuah modul akan membuka detailnya.
- File `.deb` akan ditambahkan ke Packages.
- Sebuah direktori akan dipilih untuk Folder.
- File reguler lain akan dipilih sebagai Installation Script.

Menjatuhkan item tidak akan mengeksekusi kode atau mengubah Running Now maupun Next Boot.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Pemuatan modul initrd](/reference/boot-process/Module-Loading)
- [Mode boot](/using-minios/Boot-Modes)
- [Membuat image ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parameter boot](/reference/Boot-Parameters)

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

### Buat modul dari skrip

`script2sb` menyalin skrip instalasi ke dalam chroot privat, mengatur agar dapat dieksekusi, menjalankannya sebagai root tanpa terminal interaktif, menghapusnya, dan merekam perubahan filesystem yang dihasilkan. Jika skrip gagal, modul tidak akan dibuat.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opsi tambahan `--directory DIR` menyalin seluruh isi sumber, termasuk dotfiles, ke root modul sebelum skrip dijalankan. Atur direktori seed seperti struktur pohon filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Tinjau skrip sebelum menjalankannya. Skrip ini dijalankan dengan hak administrator dan dapat mengeksekusi perintah apa pun. Gunakan `chroot2sb` sebagai gantinya jika instalasi memerlukan prompt atau pekerjaan manual.

### Buat modul secara interaktif

`chroot2sb` membuat union build privat dan membuka shell root di dalamnya. Instal paket atau edit file, lalu keluar dari shell untuk merekam perubahan:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Perintah yang dimasukkan di shell tidak akan dijalankan ulang saat modul dimuat; modul adalah snapshot dari keadaan filesystem setelah perubahan. Riwayat shell dihapus dari hasil. Jika tidak ada nama yang diberikan, nama yang dihasilkan akan menggunakan tanggal dan waktu saat ini.

Siklus hidup terpisah `prepare`, `shell`, `finish`, dan `cancel` tersedia untuk frontend grafis yang dilindungi. Untuk penggunaan terminal biasa, gunakan perintah interaktif tunggal seperti di atas.

### Buat modul dari direktori

`dir2sb` mengemas isi direktori yang sudah disiapkan ke dalam modul baru. Kedua operand wajib diisi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Konversi biasa tidak memerlukan root. Sumber tidak diubah, kepemilikan di dalam modul dinormalisasi menjadi root, node perangkat, socket, dan FIFO ditolak, serta target tidak pernah ditimpa. Gunakan `--keep-ownership` atau `--allow-special` hanya jika memang membutuhkan hak istimewa tersebut.

### Tangkap perubahan sesi saat ini

`savechanges` membaca layer writable utama dari sesi MiniOS yang sedang berjalan. Membutuhkan akses root karena layer ini bisa berisi file yang hanya dapat diakses root. Lokasi perubahan default terdeteksi secara otomatis:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Tanpa `--profile`, kebijakan historis MiniOS mengabaikan direktori kosong, cache, log, data boot, path runtime, pseudo-filesystem, serta file sesi dan sistem tertentu. Ini memudahkan pembuatan modul tradisional, namun bukan jaminan privasi eksplisit.

Profil eksplisit yang tersedia:

- `exact` menyimpan perubahan yang dapat direpresentasikan, termasuk data pengguna, log, cache, file identitas, kredensial, dan metadata penghapusan yang didukung. Objek filesystem yang tidak didukung akan ditolak, bukan diabaikan begitu saja.
- `clean` menggunakan allowlist path yang sempit dan berorientasi perangkat lunak. Tidak menyertakan data home dan root, log, cache, identitas, konfigurasi jaringan, kredensial, konfigurasi sistem sembarang, dan `/usr/local`. Ini mengurangi risiko privasi namun tidak dapat menjamin bahwa file perangkat lunak yang diizinkan tidak mengandung rahasia.
- `selected` hanya menyertakan path relatif yang telah ditinjau dari file inventaris dan seleksi. Pengecualian eksplisit akan diutamakan. Profil ini cocok jika modul harus berisi subset perubahan sesi yang terkontrol.

Contoh:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

File seleksi memiliki struktur JSON ketat seperti ini:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Path dinormalisasi, tidak kosong, dan relatif terhadap root perubahan. Hasil inventaris harus dibuat dan ditinjau terlebih dahulu; setiap path yang disertakan harus cocok dengan data inventaris. Inventaris mencatat metadata seperti path, tipe, kategori, sensitivitas, dan ukuran, namun tidak membaca atau menampilkan isi file, target symbolic-link, atau nilai rahasia. Output profil eksplisit dan inventaris menggunakan mode `0600`; modul dengan kebijakan lama menggunakan mode `0644`.

Penangkapan sesi dapat mempertahankan penghapusan file yang didukung dan opasitas direktori untuk backend AUFS atau OverlayFS yang aktif. Tidak termasuk mount runtime, filesystem bersarang, pencatatan union, dan output itu sendiri. Target yang sudah ada tidak pernah diganti.

### Inspeksi dan ekstrak modul

Inspeksi modul tanpa perlu mount atau ekstraksi:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Inspeksi dapat dilakukan tanpa root dan juga dapat dijalankan di luar sesi MiniOS yang sedang berjalan.

Ekstrak modul ke direktori baru:

```bash
sb2dir 06-example.sb example-root
```

Ekstraksi biasa tidak memerlukan root dan tidak mengubah sumber. Direktori target tidak boleh sudah ada. File khusus akan ditolak kecuali `--allow-special` diminta dengan hak istimewa yang memadai.

Direktori yang dihasilkan oleh `sb2dir` saat ini adalah direktori biasa. `rmsbdir`, `sb rm`, dan `sb rmdir` adalah perintah kompatibilitas lama yang selalu menolak penghapusan; perintah ini tidak melakukan unmount atau menghapus secara rekursif. Tinjau path hasil ekstraksi dan isinya sebelum menghapusnya menggunakan alat filesystem standar.

### Kelola modul yang berjalan dan modul next-boot

Running Now dan Next Boot adalah komposisi yang terpisah. Lihat [konstruksi union dan aktivasi runtime](/reference/boot-process/Module-Loading#union-construction) untuk batas boot/runtime dan alasan mengapa kedua daftar bisa berbeda.

Daftar modul yang benar-benar membentuk root AUFS atau OverlayFS saat ini, dari prioritas terendah hingga tertinggi:

```bash
sb list
sb list --json
```

Daftar modul yang dipilih berdasarkan aturan boot saat ini:

```bash
sb next-boot
sb next-boot --json
```

Kueri ini tidak memerlukan akses root. Aturan kanonik [candidate-tier dan penggantian](/reference/boot-process/Module-Loading#candidate-tiers) menentukan sumber mana yang menyediakan setiap basename Next Boot.

Untuk membuat modul pengguna tersedia pada boot berikutnya:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS menggunakan penyimpanan tulis yang tahan lama, melakukan staging dan validasi salinan, serta mempublikasikannya secara atomik tanpa menggantikan modul yang sudah ada. Nama file harus memenuhi filter boot saat ini. Hapus modul pengguna terpilih berdasarkan basename persisnya:

```bash
sudo sb next-boot remove 50-extra.sb
```

Penghapusan ditolak untuk modul dasar serta modul di sumber read-only atau volatile.

Aktivasi runtime adalah operasi terpisah, hanya berlaku untuk sesi saat ini:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivasi dan deaktivasi hanya dapat dilakukan jika `/` saat ini merupakan union AUFS. Fitur ini tidak tersedia di OverlayFS, dan dukungan kernel AUFS saja tidak cukup. Kedua perintah ini tidak mengubah Next Boot.

Dispatcher konverter kompatibilitas memerlukan kedua operand:

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
