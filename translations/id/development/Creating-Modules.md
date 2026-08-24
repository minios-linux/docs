# Membuat modul

Modul MiniOS adalah image filesystem SquashFS hanya-baca, yang secara konvensional dinamai dengan ekstensi `.sb`. Saat boot, MiniOS mengurutkan modul-modul terpilih ke dalam root filesystem berlapis. File pada lapisan prioritas lebih tinggi dapat melengkapi atau menyembunyikan file dari lapisan yang lebih rendah.

Panduan ini mendokumentasikan alur kerja MiniOS Tools berbasis command-line saat ini. Untuk aplikasi grafis, lihat [MiniOS Module Manager](/administration/Module-Manager.md). Untuk proses build image lengkap dan arsitektur sistem, lihat [Building MiniOS](/development/Building-MiniOS.md). Daftar paket yang digunakan saat membangun MiniOS dijelaskan dalam dokumentasi [CondinAPT](/development/CondinAPT.md).

## Batasan keamanan dan hak istimewa

Tidak semua operasi modul memerlukan akses root:

| Operasi | Hak Istimewa |
|---|---|
| Daftar Running Now atau Next Boot dengan `sb` | Tanpa Root |
| Inspeksi modul dengan `sb inspect` | Tanpa Root |
| Konversi biasa `dir2sb` dan `sb2dir` | Tanpa Root |
| Pertahankan kepemilikan atau izinkan file khusus saat konversi | Root |
| Build dengan `apt2sb`, `script2sb`, atau `chroot2sb` | Root |
| Tangkap sesi dengan `savechanges` | Root |
| Aktifkan, nonaktifkan, tambahkan ke Next Boot, atau hapus dari Next Boot | Root |

Builder menggunakan union terisolasi dan tidak menginstal paket atau perubahan skrip ke root yang sedang berjalan. Proses pembuatan juga tidak mengaktifkan hasilnya atau memilihnya untuk boot berikutnya.

Konverter dan builder saat ini menggunakan publikasi tanpa-replace. Target yang sudah ada, termasuk symbolic link, tidak akan ditimpa. Pilih jalur output baru atau tinjau dan hapus output lama secara manual.

Gunakan output `--help` dari setiap perintah sebagai referensi versi terinstal. Pilihan kompresi builder standar adalah `zstd` (default), `gzip`, `lzo`, dan `xz`; `dir2sb` juga mendukung `lz4`.

## Nama modul dan tingkat filter

Nama biasanya diawali dengan angka seperti `06-browser.sb` karena urutan lapisan memengaruhi penyelesaian konflik. Sebuah modul sebaiknya berisi path relatif terhadap root sistem, seperti `usr/bin/example`, bukan direktori tambahan yang memuat pohon tersebut.

Opsi `--level LEVEL` pada `apt2sb`, `script2sb`, dan `chroot2sb` membatasi lapisan dasar yang digunakan untuk membangun union build. Dengan `--level 3`, lapisan bernomor hingga `03` digunakan dan lapisan bernomor lebih tinggi akan difilter. Ini dapat membuat modul menjadi kurang bergantung pada lapisan opsional yang lebih tinggi, dengan konsekuensi menambah lebih banyak dependensi pada hasilnya.

## Membuat modul dari paket

`apt2sb` menginstal paket repository atau file `.deb` lokal yang dapat dibaca ke dalam union build privat dan menangkap hasilnya. Fitur ini memerlukan sesi live MiniOS yang didukung dan akses root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Tanpa `--name`, nama output diambil dari paket pertama. Opsi APT yang berguna antara lain `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, dan `--target-release RELEASE`. Opsi target-release hanya berlaku untuk `install`.

Untuk menangkap upgrade pada paket yang sudah terinstal:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

## Membuat modul dari skrip

`script2sb` menyalin skrip instalasi ke dalam chroot privat, menjadikannya executable, menjalankannya sebagai root tanpa terminal interaktif, menghapusnya, lalu menangkap perubahan filesystem yang dihasilkan. Jika skrip gagal, modul tidak akan dibuat.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

Opsi `--directory DIR` yang opsional akan menyalin seluruh isi sumber, termasuk dotfiles, ke root modul sebelum skrip dijalankan. Atur direktori seed sebagai struktur pohon filesystem:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Tinjau skrip sebelum menjalankannya. Skrip dijalankan dengan hak administrator dan dapat menjalankan perintah apa pun. Gunakan `chroot2sb` jika proses instalasi memerlukan prompt atau pekerjaan manual.

## Membuat modul secara interaktif

`chroot2sb` membuat union build privat dan membuka shell root di dalamnya. Instal paket atau edit file, lalu keluar dari shell untuk menangkap perubahan:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Perintah yang dimasukkan di shell tidak akan dijalankan ulang saat modul dimuat; modul adalah snapshot dari keadaan filesystem yang dihasilkan. Riwayat shell dihapus dari hasil. Jika tidak ada nama yang diberikan, nama yang dihasilkan menggunakan tanggal dan waktu saat ini.

Siklus hidup terpisah `prepare`, `shell`, `finish`, dan `cancel` tersedia untuk frontend grafis yang dilindungi. Untuk penggunaan terminal biasa, gunakan perintah interaktif tunggal seperti di atas.

## Membuat modul dari direktori

`dir2sb` mengemas isi direktori yang sudah disiapkan ke dalam modul baru. Kedua operand wajib diisi:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

Konversi biasa tidak memerlukan root. Sumber tidak diubah, kepemilikan di dalam modul dinormalisasi ke root, node device, socket, dan FIFO ditolak, serta target tidak pernah ditimpa. Gunakan `--keep-ownership` atau `--allow-special` hanya jika memang membutuhkan semantik khusus tersebut.

## Menangkap perubahan sesi saat ini

`savechanges` membaca layer writable otoritatif dari sesi MiniOS yang sedang berjalan. Fitur ini memerlukan root karena layer tersebut dapat berisi file khusus root. Lokasi perubahan default dideteksi secara otomatis:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Tanpa `--profile`, kebijakan historis MiniOS menghilangkan direktori kosong, cache, log, data boot, path runtime, pseudo-filesystem, serta file sesi dan sistem tertentu. Ini memudahkan pembuatan modul tradisional, namun bukan jaminan privasi eksplisit.

Profil eksplisit meliputi:

- `exact` mempertahankan perubahan yang dapat direpresentasikan, termasuk data pengguna, log, cache, file identitas, kredensial, dan metadata penghapusan yang didukung. File sistem yang tidak didukung akan ditolak, bukan diabaikan diam-diam.
- `clean` menggunakan allowlist path yang sempit berorientasi perangkat lunak. Ini mengecualikan data home dan root, log, cache, identitas, konfigurasi jaringan, kredensial, konfigurasi sistem sembarang, dan `/usr/local`. Profil ini mengurangi risiko privasi, tetapi tidak dapat menjamin bahwa file perangkat lunak yang diperbolehkan benar-benar bebas dari rahasia.
- `selected` hanya menyertakan path relatif yang telah ditinjau dari file inventaris dan seleksi. Eksklusi eksplisit akan menang. Profil ini cocok jika modul harus berisi subset perubahan sesi yang terkontrol.

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

Path dinormalisasi, tidak kosong, dan relatif terhadap root perubahan. Buat dan tinjau inventaris terlebih dahulu; setiap include harus cocok dengan data inventaris. Inventaris mencatat metadata seperti path, tipe, kategori, sensitivitas, dan ukuran, tetapi tidak membaca atau mengeluarkan isi file, target symbolic-link, atau nilai rahasia. Output profil eksplisit dan inventaris menggunakan mode `0600`; modul kebijakan lama menggunakan mode `0644`.

Penangkapan sesi dapat mempertahankan penghapusan file dan opasitas direktori yang didukung untuk backend AUFS atau OverlayFS aktif. Runtime mount, filesystem bersarang, pembukuan union, dan output itu sendiri dikecualikan. Target yang sudah ada tidak pernah diganti.

## Inspeksi dan ekstraksi modul

Inspeksi modul tanpa perlu mounting atau ekstraksi:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

Inspeksi tidak memerlukan root dan juga dapat dilakukan di luar sesi MiniOS yang sedang berjalan.

Ekstrak modul ke direktori baru:

```bash
sb2dir 06-example.sb example-root
```

Ekstraksi biasa tidak memerlukan root dan tidak mengubah sumber. Direktori target tidak boleh sudah ada. File khusus akan ditolak kecuali `--allow-special` diminta dengan hak istimewa yang cukup.

Direktori yang dihasilkan oleh `sb2dir` saat ini adalah direktori biasa. `rmsbdir`, `sb rm`, dan `sb rmdir` adalah perintah kompatibilitas lama yang selalu menolak penghapusan; mereka tidak melakukan unmount atau menghapus secara rekursif. Tinjau path hasil ekstraksi dan isinya sebelum menghapusnya dengan alat filesystem standar.

## Mengelola modul yang berjalan dan next-boot

Running Now dan Next Boot adalah komposisi yang terpisah.

Daftar modul yang benar-benar membentuk root AUFS atau OverlayFS saat ini, dari prioritas terendah ke tertinggi:

```bash
sb list
sb list --json
```

Daftar modul yang dipilih oleh aturan boot saat ini, termasuk `bext`, `load`, dan `noload`:

```bash
sb next-boot
sb next-boot --json
```

Kueri ini tidak memerlukan root. Modul next-boot dapat berasal dari pohon data dasar, direktori `modules/`-nya, atau penyimpanan modul persisten terpisah. Sumber yang muncul belakangan dengan basename yang sama akan menggantikan pilihan sebelumnya.

Untuk membuat modul user tersedia pada boot berikutnya:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS akan menggunakan media penyimpanan writable yang sesuai, menyiapkan dan memvalidasi salinan, lalu mempublikasikannya secara atomik tanpa mengganti modul yang sudah ada. Nama file harus memenuhi filter boot saat ini. Hapus modul user yang dipilih dengan basename persisnya:

```bash
sudo sb next-boot remove 50-extra.sb
```

Penghapusan akan ditolak untuk modul dasar dan modul pada sumber yang hanya-baca atau volatile.

Aktivasi runtime adalah operasi terpisah, hanya untuk sesi saat ini:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Aktivasi dan deaktivasi hanya berfungsi jika `/` saat ini adalah union AUFS. Fitur ini tidak tersedia di OverlayFS, dan dukungan kernel AUFS saja tidak cukup. Kedua perintah ini tidak mengubah Next Boot.

Dispatcher konverter kompatibilitas memerlukan kedua operand:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

Penggunaan langsung `dir2sb` dan `sb2dir` lebih disarankan karena konversi biasa dapat dijalankan tanpa root.

## Dokumentasi terkait

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [Membangun ulang image ISO](/development/Rebuilding-ISO.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Parameter boot](/configuration/Boot-Parameters.md)
