---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Mengelola modul

Manajer Modul MiniOS adalah aplikasi grafis untuk memeriksa, membuat, dan mengelola MiniOS `.sb` modul. Terdapat dua ruang kerja: **Modul** untuk komposisi sistem dan **Buat** untuk membuat modul baru.

Jalankan dari menu aplikasi atau dengan perintah:

```bash
minios-module-manager
```

Aplikasi ini berjalan sebagai pengguna desktop Anda. Permintaan autentikasi administrator hanya muncul jika operasi yang diminta membutuhkannya.

## Sedang Berjalan dan Boot Berikutnya

Ruang kerja Modul menyediakan dua tampilan terpisah:

- **Sedang Berjalan** adalah urutan modul yang saat ini membentuk sistem aktif.
- **Boot Berikutnya** adalah urutan modul yang dipilih oleh aturan boot MiniOS saat ini.

Mengubah satu tampilan tidak otomatis mengubah tampilan lainnya. Misalnya, **Aktifkan untuk Sesi Ini** hanya memengaruhi sistem yang sedang berjalan, sedangkan **Tambahkan ke Boot Berikutnya** menyalin modul ke penyimpanan modul yang tahan lama tanpa langsung mengaktifkannya.

Untuk aturan boot-time yang resmi, termasuk tier sumber kandidat, penggantian nama persis, urutan numerik, dan `load=`, `noload=`, serta `bext=` penyaringan, lihat [Pemuatan modul Initrd](/reference/boot-process/Module-Loading). Panduan tersebut juga menjelaskan mengapa Sedang Berjalan dan Boot Berikutnya bisa berbeda.

Aktivasi dan deaktivasi runtime hanya tersedia jika root filesystem saat ini menggunakan AUFS. Fitur ini tidak tersedia pada root OverlayFS, meskipun kernel mendukung AUFS. Modul dasar tidak dapat dinonaktifkan melalui aplikasi.

Perubahan boot berikutnya hanya tersedia jika MiniOS menemukan penyimpanan modul yang tahan lama dan dapat ditulis. Modul dasar serta modul di penyimpanan hanya-baca atau volatile tidak dapat dihapus. Filter boot seperti `load`, `noload`, dan `bext` tetap menentukan modul mana yang dipilih.

## Memeriksa modul

Pilih modul untuk melihat lokasi file pendukung, ukuran terkompresi, dan isi filesystem-nya. Jika file pendukung tersedia, **Ekstrak ke Folder** akan membuat direktori baru berisi file modul tersebut.

Pemeriksaan tidak memerlukan hak administrator. **Ekstrak ke Folder** meminta autentikasi administrator agar dapat mempertahankan kepemilikan, izin, dan file khusus. Ekstraksi tidak pernah menimpa tujuan yang sudah ada atau mengubah modul sumber.

Anda juga dapat membuka file `.sb` lokal dari pengelola file. Membuka file hanya untuk memeriksa; tidak mengaktifkan atau menambahkannya ke Boot Berikutnya. Pada sistem Xfce dengan integrasi Thunar MiniOS terpasang, aksi pengelola file menggunakan backend modul yang sama untuk aktivasi dan deaktivasi eksplisit; tidak melewati perbedaan antara Sedang Berjalan dan Boot Berikutnya.

## Membuat modul

Ruang kerja Buat menggunakan alur **Konfigurasi**, **Tinjau**, **Jalankan**, dan **Hasil**. Modul yang berhasil dibuat tetap berupa file di lokasi output. Modul tidak langsung diaktifkan dan tidak otomatis ditambahkan ke Boot Berikutnya.

Metode yang tersedia:

- **Paket** menginstal paket repository dan file `.deb` lokal terpilih beserta dependensinya di lingkungan build MiniOS yang terisolasi. Instalasi paket memerlukan autentikasi administrator.
- **Skrip Instalasi** menjalankan skrip yang sudah ditinjau tanpa terminal interaktif. Folder seed opsional dapat menyediakan file awal. Skrip dijalankan dengan hak administrator tetapi tidak disimpan dalam modul yang dihasilkan.
- **Chroot Interaktif** membuka shell root sementara di terminal tersemat. Ketik `exit` saat selesai, lalu buat modul, buka kembali shell, atau batalkan perubahan. Menutup atau membatalkan sesi tidak mengubah sistem yang sedang berjalan.
- **Folder** mengemas isi direktori yang sudah ada. Direktori sumber tidak disarang di dalam modul. Alur kerja grafis meminta autentikasi administrator untuk membaca file yang dilindungi dan mempertahankan atribut filesystem; sumber tetap tidak berubah. Folder yang diekstrak dengan pelestarian kepemilikan akan dikenali secara otomatis dan mempertahankan kepemilikan aslinya. Untuk folder hasil ekstraksi lama tanpa catatan asal, pilih **Pertahankan kepemilikan sumber** jika kepemilikan harus tetap dipertahankan.
- **Perubahan Sesi Saat Ini** menangkap file dan penghapusan yang memenuhi syarat dari layer sesi tulis saat ini. Menggunakan kebijakan standar MiniOS `savechanges` yang mengabaikan log, cache, data boot, dan path runtime sementara. Membaca seluruh layer tulis memerlukan autentikasi administrator.

Pilih path output baru untuk setiap alur kerja. File yang sudah ada tidak pernah ditimpa. Progres dan diagnostik backend tetap terlihat selama operasi berjalan, dan penangkapan sesi saat ini dapat dibatalkan.

Untuk folder lain, alur kerja Folder secara default mengubah user dan group ID biasa (1000–60000) menjadi root di luar `/home` dan `/opt`, mempertahankan ID sistem, dan membuat direktori tingkat atas standar dimiliki root. Kepemilikan yang hilang akibat ekstraksi tanpa hak administrator tidak dapat dipulihkan dengan opsi ini.

Perubahan Sesi Saat Ini ditujukan untuk penangkapan standar yang praktis, bukan untuk meninjau setiap path yang disertakan. Layer tulis aktif dapat berisi data pribadi atau rahasia. Untuk kebijakan `exact`, `clean`, atau kebijakan privasi berdasarkan path, gunakan alur kerja command-line `savechanges` yang dijelaskan pada [Tangkap perubahan sesi saat ini](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Seret dan lepas

Seret dan lepas hanya mengisi input atau membuka pemeriksaan:

- Sebuah modul akan membuka detailnya.
- `.deb` file akan ditambahkan ke Paket.
- Sebuah direktori dipilih untuk Folder.
- File reguler lain dipilih sebagai Skrip Instalasi.

Menjatuhkan item tidak menjalankan kode atau mengubah Sedang Berjalan maupun Boot Berikutnya.

## Dokumentasi terkait

- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading)
- [Mode boot](/using-minios/Boot-Modes)
- [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parameter boot](/reference/Boot-Parameters)

## Membuat modul

Modul MiniOS adalah citra filesystem SquashFS hanya-baca, biasanya dinamai dengan ekstensi `.sb`. Saat boot, MiniOS mengurutkan modul terpilih ke dalam root filesystem berlapis. File pada layer prioritas lebih tinggi dapat menambah atau menyembunyikan file dari layer di bawahnya. Pipeline live modular ini merupakan bagian dari arsitektur MiniOS yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS) dan [Mode boot](/using-minios/Boot-Modes). Setelah konversi native, root berlapis `.sb` digantikan oleh filesystem Debian biasa yang dapat ditulis. Perangkat lunak manajemen modul MiniOS dihapus karena alur kerja modul tidak lagi berlaku, sementara lingkungan desktop terpilih dan aplikasi biasa tetap terpasang sebagai paket normal.

Panduan ini mendokumentasikan alur kerja command-line MiniOS Tools saat ini. Untuk aplikasi grafis, lihat [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules). Untuk proses build citra lengkap dan arsitektur sistem, lihat [Membangun MiniOS](/development/Building-MiniOS). Daftar paket yang digunakan saat membangun MiniOS dijelaskan pada [dokumentasi CondinAPT](/development/CondinAPT).

### Keamanan dan batas hak istimewa

Tidak semua operasi modul memerlukan root:

| Operasi | Hak Istimewa |
|---|---|
| Daftar Sedang Berjalan atau Boot Berikutnya dengan `sb` | Tanpa root |
| Periksa modul dengan `sb inspect` | Tanpa root |
| Konversi command-line biasa `dir2sb` dan `sb2dir` konversi | Tanpa root |
| Pertahankan kepemilikan atau izinkan file khusus saat konversi | Root |
| Build dengan `apt2sb`, `script2sb` atau `chroot2sb` | Root |
| Tangkap sesi dengan `savechanges` | Root |
| Aktifkan, nonaktifkan, tambahkan ke Boot Berikutnya, atau hapus dari Boot Berikutnya | Root |

Builder menggunakan union terisolasi dan tidak menginstal paket atau perubahan skrip ke root yang sedang berjalan. Proses pembuatan juga tidak mengaktifkan hasilnya atau memilihnya untuk boot berikutnya.

Alur kerja Folder dan Ekstrak ke Folder secara grafis meminta autentikasi administrator agar dapat menangani file yang dilindungi dan mempertahankan atribut filesystem.

Konverter dan builder saat ini menggunakan publikasi tanpa menimpa. Target yang sudah ada, termasuk symbolic link, tidak akan ditimpa. Pilih path output baru atau tinjau dan hapus output lama secara manual.

Gunakan output `--help` setiap perintah sebagai referensi versi terpasang. Alur kerja saat ini `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, dan `savechanges` menerima `zstd` (default), `gzip`, `lzo`, `lz4`, dan `xz`. Kompresor yang dipilih harus tersedia di sistem yang sedang berjalan.

### Nama modul dan level filter

Nama biasanya diawali dengan angka seperti `06-browser.sb` karena urutan layer memengaruhi penyelesaian konflik. Modul sebaiknya berisi path relatif terhadap root sistem, misalnya `usr/bin/example`, bukan direktori tambahan yang berisi pohon tersebut.

Untuk tier sumber kandidat yang tepat, perilaku tabrakan basename, urutan numerik, dan `bext=`, `load=`, serta `noload=` semantik, lihat [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading). Secara khusus, gunakan basename unik kecuali modul memang dimaksudkan untuk menggantikan slot bernama sama dari tier sumber sebelumnya.

Opsi `--level LEVEL` pada `apt2sb`, `script2sb`, dan `chroot2sb` membatasi layer dasar yang digunakan untuk membangun union. Dengan `--level 3`, layer bernomor hingga `03` akan digunakan dan layer dengan nomor lebih tinggi akan difilter. Ini dapat membuat modul lebih mandiri dari layer opsional yang lebih tinggi, dengan konsekuensi menambah dependensi di hasil akhir.

### Buat modul dari paket

`apt2sb` menginstal paket repository atau file `.deb` lokal yang dapat dibaca ke union build privat dan menangkap hasilnya. Membutuhkan sesi live MiniOS yang didukung dan akses root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Tanpa `--name`, nama output diambil dari paket pertama. Opsi APT yang berguna antara lain `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, dan `--target-release RELEASE`Opsi target-release hanya berlaku untuk `install`.

Untuk menangkap upgrade pada paket yang sudah terpasang:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Buat modul dari skrip

`script2sb` menyalin skrip instalasi ke chroot privat, menjadikannya dapat dieksekusi, menjalankannya sebagai root tanpa terminal interaktif, menghapusnya, lalu menangkap perubahan filesystem yang dihasilkan. Skrip yang gagal tidak menghasilkan modul.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opsi `--directory DIR` akan menyalin seluruh isi sumber, termasuk dotfile, ke root modul sebelum skrip dijalankan. Atur direktori seed seperti pohon filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Tinjau skrip sebelum menjalankannya. Skrip dijalankan dengan hak administrator dan dapat menjalankan perintah apa pun. Gunakan `chroot2sb` jika instalasi membutuhkan prompt atau pekerjaan manual.

### Buat modul secara interaktif

`chroot2sb` membuat union build privat dan membuka shell root di dalamnya. Instal paket atau edit file, lalu keluar dari shell untuk menangkap perubahan:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Perintah yang dimasukkan di shell tidak akan dijalankan ulang saat modul dimuat; modul adalah snapshot dari keadaan filesystem setelah perubahan. Riwayat shell dihapus dari hasil. Jika tidak ada nama yang diberikan, nama yang dihasilkan menggunakan tanggal dan waktu saat ini.

Alur kerja terpisah `prepare`, `shell`, `finish`, dan `cancel` tersedia untuk frontend grafis yang dilindungi. Untuk penggunaan terminal biasa, gunakan perintah interaktif tunggal seperti di atas.

### Buat modul dari direktori

`dir2sb` mengemas isi direktori yang sudah disiapkan ke dalam modul baru. Kedua operand wajib diisi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Konversi biasa dapat dilakukan tanpa root. Sumber tidak diubah, user dan group ID biasa (1000–60000) diubah menjadi root di luar `/home` dan `/opt`, ID sistem dipertahankan, dan direktori tingkat atas standar dimiliki root. Node perangkat, socket, dan FIFO ditolak, serta target tidak pernah ditimpa. `--keep-ownership` mempertahankan semua kepemilikan sumber dan `--allow-special` mengizinkan file khusus; keduanya memerlukan root.

`sb2dir` menulis `.minios-module-origin.json` di direktori hasil ekstraksi. Jika ekstraksi mempertahankan kepemilikan, `dir2sb` akan mengenali catatan ini dan secara otomatis mempertahankan kepemilikan serta file khusus saat dikemas ulang; catatan tersebut tidak disertakan dalam modul baru. Direktori yang diekstrak tanpa pelestarian kepemilikan tidak dapat dikemas ulang karena kepemilikan aslinya tidak diketahui. Ekstrak ulang modul asli dengan opsi yang memerlukan hak administrator.

### Tangkap perubahan sesi saat ini

`savechanges` membaca layer tulis resmi dari sesi MiniOS yang sedang berjalan. Memerlukan root karena layer tersebut dapat berisi file khusus root. Lokasi perubahan default terdeteksi secara otomatis:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Tanpa `--profile`, kebijakan MiniOS historis mengabaikan direktori kosong, cache, log, data boot, path runtime, pseudo-filesystem, serta file sesi dan sistem tertentu. Ini praktis untuk pembuatan modul tradisional, namun bukan jaminan privasi eksplisit.

Profil eksplisit yang tersedia:

- `exact` mempertahankan perubahan yang dapat direpresentasikan, termasuk data pengguna, log, cache, file identitas, kredensial, dan metadata penghapusan yang didukung. Objek filesystem yang tidak didukung akan ditolak, bukan diabaikan begitu saja.
- `clean` menggunakan daftar putih path yang berorientasi perangkat lunak. Data home dan root, log, cache, identitas, konfigurasi jaringan, kredensial, konfigurasi sistem, dan `/usr/local` dikecualikan. Ini mengurangi risiko privasi tetapi tidak dapat menjamin file perangkat lunak yang diizinkan bebas dari rahasia.
- `selected` hanya menyertakan path relatif yang sudah ditinjau dari file inventaris dan seleksi. Pengecualian eksplisit akan menang. Profil ini tepat jika modul harus berisi subset perubahan sesi yang terkontrol.

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

Path dinormalisasi, tidak kosong, dan relatif terhadap root perubahan. Buat dan tinjau inventaris terlebih dahulu; setiap include harus cocok dengan data inventaris. Inventaris mencatat metadata seperti path, tipe, kategori, sensitivitas, dan ukuran, tetapi tidak membaca atau mengeluarkan isi file, target symbolic link, atau nilai rahasia. Output dan inventaris profil eksplisit menggunakan mode `0600`; modul kebijakan lama menggunakan mode `0644`.

Penangkapan sesi dapat mempertahankan penghapusan file yang didukung dan opasitas direktori untuk backend AUFS atau OverlayFS yang aktif. Mount runtime, filesystem bersarang, pembukuan union, dan output sendiri dikecualikan. Target yang sudah ada tidak pernah diganti.

### Periksa dan ekstrak modul

Periksa modul tanpa mount atau ekstraksi:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Pemeriksaan dapat dilakukan tanpa root dan juga berfungsi di luar sesi MiniOS yang sedang berjalan.

Ekstrak modul ke direktori baru:

```bash
sb2dir 06-example.sb example-root
```

Ekstraksi biasa dapat dilakukan tanpa root dan tidak mengubah sumber. Direktori tujuan tidak boleh sudah ada. File khusus akan ditolak kecuali `--allow-special` diminta dengan hak istimewa yang cukup.

Agar direktori dapat dikemas ulang secara utuh, ekstrak dengan hak administrator dan pertahankan kepemilikan serta file khusus:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

Ekstraksi mencatat asal modul di `.minios-module-origin.json` di dalam direktori baru. Ekstraksi tanpa hak administrator mencatat bahwa kepemilikan tidak dipertahankan; direktori seperti ini tidak dapat dikembalikan ke `dir2sb`. Simpan catatan asal dari ekstraksi dengan hak administrator hingga proses pengemasan ulang.

Direktori yang dihasilkan oleh `sb2dir` saat ini adalah direktori biasa. `rmsbdir`, `sb rm`, dan `sb rmdir` adalah perintah kompatibilitas yang sudah tidak digunakan yang selalu menolak penghapusan; tidak melakukan unmount atau menghapus secara rekursif. Tinjau path hasil ekstraksi dan isinya sebelum menghapusnya dengan alat filesystem standar.

### Kelola modul berjalan dan boot berikutnya

Sedang Berjalan dan Boot Berikutnya adalah komposisi yang independen. Lihat [konstruksi union dan aktivasi runtime](/reference/boot-process/Module-Loading#union-construction) untuk batas boot/runtime dan alasan kedua daftar bisa berbeda.

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

Kueri ini dapat dijalankan tanpa root. [Aturan tier kandidat dan penggantian](/reference/boot-process/Module-Loading#candidate-tiers) menentukan sumber mana yang memasok setiap basename Boot Berikutnya.

Untuk membuat modul pengguna tersedia pada boot berikutnya:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS menggunakan penyimpanan tahan lama yang dapat ditulis, menyiapkan dan memvalidasi salinan, lalu mempublikasikannya secara atomik tanpa menimpa modul yang sudah ada. Nama file harus sesuai dengan filter boot saat ini. Hapus modul pengguna terpilih dengan basename persis:

```bash
sudo sb next-boot remove 50-extra.sb
```

Penghapusan ditolak untuk modul dasar dan modul di sumber hanya-baca atau volatile.

Aktivasi runtime adalah operasi terpisah khusus sesi:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivasi dan deaktivasi hanya berfungsi jika `/` saat ini adalah union AUFS. Tidak tersedia pada OverlayFS, dan dukungan kernel AUFS saja tidak cukup. Kedua perintah ini tidak mengubah Boot Berikutnya.

Dispatcher konverter kompatibilitas memerlukan kedua operand:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Penggunaan langsung `dir2sb` dan `sb2dir` lebih disarankan karena konversi biasa dapat dijalankan tanpa root.

### Dokumentasi terkait

- [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules)
- [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading)
- [Mode boot](/using-minios/Boot-Modes)
- [Membangun ulang citra ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Membangun MiniOS](/development/Building-MiniOS)
- [Parameter boot](/reference/Boot-Parameters)
