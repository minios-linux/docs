---
updated: 2026-08-26
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# MiniOS Module Manager

MiniOS Module Manager adalah aplikasi grafis untuk memeriksa, membuat, dan mengelola modul `.sb` MiniOS. Aplikasi ini memiliki dua ruang kerja: **Modules** untuk komposisi sistem dan **Create** untuk membuat modul baru.

Jalankan dari menu aplikasi atau dengan perintah:

```bash
minios-module-manager
```

Aplikasi ini berjalan sebagai pengguna desktop Anda. Permintaan autentikasi administrator hanya muncul jika operasi yang diminta membutuhkannya.

## Sedang Berjalan dan Boot Berikutnya

Workspace Modul memiliki dua tampilan terpisah:

- **Sedang Berjalan** adalah urutan modul yang saat ini membentuk sistem yang sedang aktif.
- **Boot Berikutnya** adalah urutan modul yang dipilih berdasarkan aturan boot MiniOS saat ini.

Mengubah satu tampilan tidak secara diam-diam mengubah tampilan lainnya. Misalnya, **Aktifkan untuk Sesi Ini** hanya memengaruhi sistem yang sedang berjalan, sedangkan **Tambahkan ke Boot Berikutnya** menyalin modul ke penyimpanan modul yang tahan lama tanpa langsung mengaktifkannya.

Untuk aturan boot yang otoritatif, termasuk tingkat sumber kandidat,
penggantian exact-basename, pengurutan numerik, dan penyaringan `load=`, `noload=`, serta
`bext=`, lihat
[Initrd module loading](/configuration/Initrd-Module-Loading.md). Panduan tersebut
juga menjelaskan mengapa Sedang Berjalan dan Boot Berikutnya bisa berbeda.

Aktivasi dan deaktivasi runtime hanya tersedia jika root filesystem saat ini menggunakan AUFS. Fitur ini tidak tersedia pada root OverlayFS, meskipun kernel mendukung AUFS. Modul dasar tidak dapat dinonaktifkan melalui aplikasi.

Perubahan boot berikutnya hanya tersedia jika MiniOS menemukan penyimpanan modul yang tahan lama dan dapat ditulis. Modul dasar serta modul pada penyimpanan read-only atau volatile tidak dapat dihapus. Filter boot seperti `load`, `noload`, dan `bext` tetap menentukan modul mana yang dipilih.

## Memeriksa sebuah modul

Pilih modul untuk melihat sumbernya, ukuran terkompresi, dan isi filesystem-nya. Jika file pendukungnya tersedia, **Extract to Folder** akan membuat direktori baru yang berisi file-file modul tersebut.

Pemeriksaan dan ekstraksi biasa tidak memerlukan hak administrator. Ekstraksi tidak pernah menimpa tujuan yang sudah ada.

Anda juga dapat membuka file lokal `.sb` dari file manager. Membuka file hanya untuk memeriksa; tidak mengaktifkan atau menambahkannya ke Next Boot.

## Membuat sebuah modul

Ruang kerja Create menggunakan alur **Configure**, **Review**, **Run**, dan **Result**. Modul yang berhasil dibuat akan tetap menjadi file di lokasi output. Modul tersebut tidak diaktifkan dan tidak otomatis ditambahkan ke Next Boot.

Metode yang tersedia:

- **Packages** menginstal paket repository dan file `.deb` lokal yang dipilih beserta dependensinya di lingkungan build MiniOS yang terisolasi. Instalasi paket memerlukan autentikasi administrator.
- **Installation Script** menjalankan skrip yang telah direview tanpa terminal interaktif. Folder seed opsional dapat menyediakan file awal. Skrip dijalankan dengan hak administrator tetapi tidak disimpan dalam modul hasil.
- **Interactive Chroot** membuka shell root sementara di terminal terintegrasi. Ketik `exit` saat selesai, lalu buat modul, buka kembali shell, atau batalkan perubahan. Menutup atau membatalkan sesi tidak mengubah sistem yang sedang berjalan.
- **Folder** mengemas isi direktori yang sudah ada. Direktori sumber tidak disisipkan di dalam modul. Konversi folder biasa tidak memerlukan root, sumber tetap utuh, dan kepemilikan dalam modul dinormalisasi ke root.
- **Current Session Changes** menangkap file dan penghapusan yang memenuhi syarat dari session layer yang dapat ditulis saat ini. Menggunakan kebijakan standar MiniOS `savechanges`, yang mengabaikan log, cache, data boot, dan path runtime sementara. Membaca seluruh layer writable memerlukan autentikasi administrator.

Pilih path output baru untuk setiap alur kerja. File yang sudah ada tidak pernah ditimpa. Progres dan diagnostik backend tetap terlihat selama operasi berjalan, dan proses capture session saat ini dapat dibatalkan.

Current Session Changes ditujukan untuk capture standar yang praktis, bukan untuk meninjau setiap path yang disertakan. Layer writable yang aktif dapat berisi data pribadi atau rahasia. Untuk kebijakan privasi eksplisit `exact`, `clean`, atau berdasarkan path, gunakan workflow command-line `savechanges` seperti dijelaskan di [Creating modules](/development/Creating-Modules.md).

## Drag and drop

Drag and drop hanya mengisi input atau membuka pemeriksaan:

- Modul akan membuka detailnya.
- File `.deb` akan ditambahkan ke Packages.
- Sebuah direktori dipilih untuk Folder.
- File reguler lain dipilih sebagai Installation Script.

Menjatuhkan item tidak menjalankan kode atau mengubah Running Now maupun Next Boot.

## Dokumentasi terkait

- [Membuat modul](/development/Creating-Modules.md)
- [Initrd module loading](/configuration/Initrd-Module-Loading.md)
- [Mode boot](/configuration/Boot-Modes.md)
- [Menyusun image ISO dari command line](/development/Rebuilding-ISO.md)
- [Parameter boot](/configuration/Boot-Parameters.md)
