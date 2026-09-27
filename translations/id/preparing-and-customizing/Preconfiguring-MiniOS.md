---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Prakonfigurasi MiniOS

Konfigurator MiniOS adalah editor grafis untuk konfigurasi live MiniOS. Aplikasi ini memvalidasi perubahan dan menulis konfigurasi untuk digunakan pada boot berikutnya. Pilihan awal penyimpanan cache/log diterapkan oleh `minios-boot`; komponen live-config lainnya berjalan setelahnya. Menyimpan tidak langsung mengubah sistem yang sedang berjalan.

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

## Media dan konfigurasi runtime

MiniOS dapat membaca konfigurasi dari dua lokasi:

- `minios/config.conf` dan `minios/config.conf.d/*.conf` pada media live
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/*.conf` di filesystem root yang sedang berjalan

Konfigurator MiniOS hanya mengedit file yang dipilih. Jika tanpa argumen path, aplikasi ini mengedit file runtime `/etc/live/config.conf`; tidak membuka file pada media secara langsung. MiniOS menyinkronkan konfigurasi terbaru antara filesystem runtime dan media MiniOS yang dapat ditulis saat boot. Media hanya-baca tidak dapat menerima perubahan runtime, dan konfigurasi runtime yang persisten bisa tetap terpisah dari salinan di media.

Saat boot, MiniOS menyinkronkan file media dan runtime berdasarkan waktu modifikasi. Untuk kebijakan penyimpanan baru, fragmen `config.conf.d` yang lebih baru akan menimpa file utama, `LIVE_CONFIG_CMDLINE` selanjutnya, dan baris perintah kernel yang sebenarnya akan menjadi prioritas terakhir.
Gunakan `-i` untuk menimpa pengaturan yang dikenali dari baris perintah kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Waktu pengaturan diterapkan

Setiap kontrol menyatakan kapan pengaturan tersebut digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi saat ini.

### Diterapkan setelah reboot

Hostname, locale, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, ekspor log, dan tiga pengaturan Advanced storage akan dibaca pada saat boot berikutnya. Lakukan reboot setelah menyimpan untuk menerapkan perubahan.

Pada menu **Advanced**, **Penyimpanan log sistem**, **Cache unduhan APT**, dan **Cache browser** masing-masing menawarkan `persistent` (default) atau `volatile`. Pilihan `volatile` ini hanya berlaku untuk sesi `perch` yang sehat dan tahan lama. Log dari `minios-boot` dan `live-config` tetap persisten meskipun log biasa bersifat sementara. Status paket APT dan profil browser tetap persisten; hanya log dan cache yang dipilih yang dipindahkan ke RAM yang terbatas. Pengaturan browser dijalankan setelah pengguna live dibuat. Konfigurator akan memberikan peringatan jika initrd yang berjalan tidak memiliki `perch-storage-v1` penanda yang dibutuhkan untuk pengaturan ini. Lihat [Kinerja](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) sebelum memilih ukuran RAM pada perangkat dengan memori rendah.

### Hanya digunakan untuk sesi baru

Pembuatan akun, password pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk sandi, dan penguncian layar adalah pengaturan satu kali. Sesi persisten biasanya mencatat komponen `live-config` yang telah selesai di bawah `/var/lib/live/config/`, sehingga mengubah nilai-nilai ini dan reboot pada sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkannya sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan individual yang disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Menyambungkan (linking) dan bind mount direktori pengguna tidak dapat digunakan bersamaan. Keduanya menggunakan media data lokal MiniOS yang sudah dapat ditulis dan path relatif media yang aman. Fitur ini tidak tersedia pada `toram`, `toram=full`, atau `toram=trim`, dan MiniOS tidak secara otomatis menggabungkan dua pohon direktori yang sudah berisi data.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan Konfigurator MiniOS. Kontrol penyimpanan cache/log yang baru tidak memilih atau membuat sesi `perch`persistensi. Konfigurator MiniOS tidak membuat, membuka, mengubah ukuran, atau memperbaiki kontainer persistensi. Untuk persistensi terenkripsi, aplikasi ini akan melaporkan apakah penanda enkripsi initramfs tersedia.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang berubah dan menyamarkan kata sandi. Penyimpanan hanya memperbarui key yang berubah sambil mempertahankan komentar, urutan, key yang tidak dikenal, kepemilikan, permission, dan atribut tambahan. Proses penulisan bersifat atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat [Configuration file](/reference/configuration/config.conf), [Boot parameters](/reference/Boot-Parameters), dan [live-config](/reference/configuration/live-config).
