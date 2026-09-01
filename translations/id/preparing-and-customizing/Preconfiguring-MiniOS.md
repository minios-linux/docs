---
updated: 2026-08-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Prakonfigurasi MiniOS

Konfigurator MiniOS adalah editor grafis untuk pengaturan MiniOS `live-config`. Aplikasi ini memvalidasi perubahan dan menulis konfigurasi untuk proses boot berikutnya. Tidak mengubah sistem yang sedang berjalan secara langsung.

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

- `minios/config.conf` dan `minios/config.conf.d/*.conf` pada media live
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/*.conf` di filesystem root yang sedang berjalan

Konfigurator MiniOS hanya mengedit file yang dipilih. Jika tanpa argumen path, aplikasi ini akan mengedit file runtime `/etc/live/config.conf`; tidak langsung membuka file di media. MiniOS menyinkronkan konfigurasi yang lebih baru antara filesystem runtime dan media MiniOS yang dapat ditulis saat boot. Media hanya-baca tidak dapat menerima perubahan runtime, dan konfigurasi runtime persisten bisa tetap independen dari salinan di media.

Untuk setiap opsi, parameter kernel memiliki prioritas dibanding file konfigurasi, dan konfigurasi media lebih diutamakan daripada konfigurasi filesystem root.
Gunakan `-i` untuk menimpa pengaturan yang dikenali dari command line kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Waktu pengaturan diterapkan

Setiap kontrol menyatakan kapan pengaturan tersebut digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi saat ini.

### Diterapkan setelah reboot

Hostname, locale, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, dan ekspor log akan dibaca pada boot berikutnya. Lakukan reboot setelah menyimpan untuk menerapkannya.

### Hanya digunakan untuk sesi baru

Pembuatan akun, password pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk sandi, dan penguncian layar adalah pengaturan satu kali. Sesi persisten biasanya mencatat komponen `live-config` yang telah selesai di bawah `/var/lib/live/config/`, sehingga mengubah nilai-nilai ini dan reboot pada sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkannya sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan individual yang disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Melakukan linking dan bind mount pada direktori pengguna bersifat saling eksklusif. Keduanya menggunakan media data lokal MiniOS yang dapat ditulis dan path relatif terhadap media yang aman. Fitur ini tidak tersedia jika menggunakan `toram`, `toram=full`, atau `toram=trim`, dan MiniOS tidak secara otomatis menggabungkan dua pohon direktori yang sudah berisi data.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan Konfigurator MiniOS. Konfigurator MiniOS tidak membuat, membuka kunci, mengubah ukuran, atau memperbaiki container persistensi. Untuk persistensi terenkripsi, aplikasi ini hanya melaporkan apakah marker enkripsi initramfs tersedia.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang berubah dan menyamarkan kata sandi. Penyimpanan hanya memperbarui key yang berubah sambil mempertahankan komentar, urutan, key yang tidak dikenal, kepemilikan, permission, dan atribut tambahan. Proses penulisan bersifat atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat [Configuration file](/reference/configuration/config.conf), [Boot parameters](/reference/Boot-Parameters), dan [live-config](/reference/configuration/live-config).
