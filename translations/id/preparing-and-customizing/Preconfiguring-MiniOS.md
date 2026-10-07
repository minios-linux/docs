---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Pra-konfigurasi MiniOS

Konfigurator MiniOS adalah editor grafis untuk konfigurasi langsung MiniOS. Aplikasi ini memvalidasi perubahan dan menulis konfigurasi untuk digunakan saat boot berikutnya. Pilihan awal untuk penyimpanan cache/log diterapkan oleh `minios-boot`; komponen live-config lainnya berjalan setelahnya. Menyimpan tidak mengubah sistem yang sedang berjalan secara langsung.

## Mulai konfigurator

Buka Konfigurator MiniOS dari menu aplikasi atau jalankan:

```bash
minios-configurator
```

Target default adalah `/etc/live/config.conf`. Untuk mengedit file reguler lain, masukkan path-nya:

```bash
minios-configurator /path/to/config.conf
```

Menyimpan memerlukan autentikasi PolicyKit. Symlink dan file target non-reguler akan ditolak.

## Konfigurasi media dan runtime

MiniOS dapat membaca konfigurasi dari dua lokasi:

- `minios/config.conf` dan `minios/config.conf.d/*.conf` di media live
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/*.conf` di filesystem root yang sedang berjalan

Konfigurator MiniOS hanya mengedit file yang dipilih. Jika tidak ada argumen path, aplikasi ini mengedit file runtime `/etc/live/config.conf`; tidak langsung membuka file di media. MiniOS menyinkronkan konfigurasi terbaru antara filesystem runtime dan media MiniOS yang dapat ditulis saat boot. Media hanya-baca tidak dapat menerima perubahan runtime, dan konfigurasi runtime yang persisten bisa tetap independen dari salinan di media.

Saat boot, MiniOS menyinkronkan file media dan runtime berdasarkan waktu modifikasi. Untuk kebijakan penyimpanan baru, `config.conf.d` fragmen akan menimpa file utama, `LIVE_CONFIG_CMDLINE` selanjutnya, dan baris perintah kernel yang sebenarnya akan menjadi prioritas terakhir.
Gunakan `-i` untuk menimpa pengaturan yang dikenali dari baris perintah kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Kapan pengaturan diterapkan

Setiap kontrol menyatakan kapan pengaturan digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi yang sedang berjalan.

### Diterapkan setelah reboot

Hostname, lokal, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, ekspor log, dan tiga pengaturan penyimpanan Lanjutan akan dibaca pada saat boot berikutnya. Lakukan reboot setelah menyimpan untuk menerapkannya.

Di **Lanjutan**, **Mode modul** menerima `simple` atau `merged`. Jika `LIVE_MODULE_MODE` tidak ada pada konfigurasi yang dipilih, Konfigurator MiniOS akan menampilkan `merged` sebagai default yang efektif. Dalam mode merged, live-config akan memperbarui pengguna, cache, dan status paket sehingga konfigurasi dari stack modul terintegrasi ke sistem live yang sedang berjalan.

Di **Lanjutan**, **Penyimpanan log sistem**, **Cache unduhan APT**, dan **Cache browser** masing-masing menawarkan `persistent` (default) atau `volatile`. Pilihan `volatile` ini hanya berlaku untuk sesi `perch` yang sehat dan tahan lama. Log dari `minios-boot` dan `live-config` tetap persisten meskipun log biasa bersifat sementara. Status paket APT dan profil browser tetap persisten; hanya log dan cache yang dipilih yang dipindahkan ke RAM yang terbatas. Pengaturan browser dijalankan setelah pengguna live dibuat. Konfigurator akan memperingatkan jika initrd yang sedang berjalan tidak memiliki penanda `perch-storage-v1` yang dibutuhkan untuk pengaturan ini. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) sebelum memilih ukuran RAM pada mesin dengan memori rendah.

### Digunakan hanya untuk sesi baru

Pembuatan akun, password pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk password, dan penguncian layar adalah pengaturan sekali pakai. Sesi persisten biasanya merekam komponen `live-config` yang telah selesai di bawah `/var/lib/live/config/`, sehingga mengubah nilai ini dan reboot pada sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkannya sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan individual akan disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Menyambungkan dan bind mount direktori pengguna bersifat saling eksklusif. Keduanya menggunakan media data lokal MiniOS yang dapat ditulis dan path relatif media yang aman. Fitur ini tidak tersedia dengan `toram`, `toram=full`, atau `toram=trim`, dan MiniOS tidak secara otomatis menggabungkan dua pohon direktori yang sudah berisi data.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan Konfigurator MiniOS. Kontrol penyimpanan cache/log yang baru tidak memilih atau membuat sesi `perch`. Konfigurator MiniOS tidak membuat, membuka kunci, mengubah ukuran, atau memperbaiki kontainer persistensi. Untuk persistensi terenkripsi, aplikasi ini akan melaporkan apakah penanda enkripsi initramfs tersedia.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang diubah dan menyamarkan password. Penyimpanan hanya memperbarui kunci yang berubah sambil mempertahankan komentar, urutan, kunci yang tidak dikenal, kepemilikan, izin, dan atribut tambahan. Penulisan dilakukan secara atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat [Berkas konfigurasi](/reference/configuration/config.conf), [Parameter boot](/reference/Boot-Parameters), dan [live-config](/reference/configuration/live-config).
