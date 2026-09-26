---
updated: 2026-09-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Pra-konfigurasi MiniOS

Konfigurator MiniOS adalah editor grafis untuk konfigurasi langsung MiniOS. Perubahan akan divalidasi dan konfigurasi akan disimpan untuk digunakan saat boot berikutnya. Pilihan awal untuk cache/log akan diterapkan oleh `minios-boot`; komponen live-config lainnya berjalan setelahnya. Menyimpan tidak langsung mengubah sistem yang sedang berjalan.

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

Konfigurator MiniOS hanya mengedit file yang dipilih. Jika tidak ada argumen path, maka akan mengedit file runtime `/etc/live/config.conf`; tidak membuka file media secara langsung. MiniOS melakukan sinkronisasi konfigurasi terbaru antara filesystem runtime dan media MiniOS yang dapat ditulis saat boot. Media read-only tidak dapat menerima perubahan runtime, dan konfigurasi runtime yang persisten dapat tetap independen dari salinan di media.

Saat boot, MiniOS menyinkronkan file media dan runtime berdasarkan waktu modifikasi. Untuk kebijakan penyimpanan baru, `config.conf.d` fragmen yang lebih baru akan menimpa file utama, `LIVE_CONFIG_CMDLINE` lalu file utama, dan terakhir baris perintah kernel yang sebenarnya akan digunakan.
Gunakan `-i` untuk menimpa pengaturan yang dikenali dari baris perintah kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Waktu pengaturan diterapkan

Setiap kontrol menyatakan kapan pengaturan tersebut digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi saat ini.

### Diterapkan setelah reboot

Hostname, locale, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, ekspor log, dan tiga pengaturan penyimpanan Lanjutan akan dibaca pada boot berikutnya. Lakukan reboot setelah menyimpan untuk menerapkan perubahan.

Pada **Lanjutan**, **Penyimpanan log sistem**, **Cache unduhan APT**, dan **Cache browser** masing-masing menyediakan `persistent` (default) atau `volatile`. Pilihan `volatile` hanya berlaku pada sesi `perch` yang sehat dan tahan lama. Log dari `minios-boot` dan `live-config` tetap persisten meskipun log biasa bersifat sementara. Status paket APT dan profil browser tetap persisten; hanya log dan cache yang dipilih yang dipindahkan ke RAM yang terbatas. Pengaturan browser dijalankan setelah pengguna live dibuat. Konfigurator akan memberi peringatan jika initrd yang berjalan tidak memiliki `perch-storage-v1` penanda yang dibutuhkan untuk pengaturan ini. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) sebelum memilih ukuran RAM untuk perangkat dengan memori rendah.

### Hanya digunakan untuk sesi baru

Pembuatan akun, password pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk sandi, dan penguncian layar adalah pengaturan satu kali. Sesi persisten biasanya mencatat komponen `live-config` yang telah selesai di bawah `/var/lib/live/config/`, sehingga mengubah nilai-nilai ini dan reboot pada sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkannya sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan individual yang disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Menautkan dan bind mount direktori pengguna bersifat saling eksklusif. Keduanya menggunakan media data lokal MiniOS yang dapat ditulis dan path relatif ke media yang aman. Fitur ini tidak tersedia dengan `toram`, `toram=full`, atau `toram=trim`, dan MiniOS tidak secara otomatis menggabungkan dua pohon direktori yang sudah berisi data.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan Konfigurator MiniOS. Kontrol penyimpanan cache/log yang baru tidak memilih atau membuat `perch` sesi. Konfigurator MiniOS tidak membuat, membuka, mengubah ukuran, atau memperbaiki kontainer persistensi. Untuk persistensi terenkripsi, aplikasi ini akan melaporkan apakah penanda enkripsi initramfs tersedia.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang berubah dan menyamarkan kata sandi. Penyimpanan hanya memperbarui key yang berubah sambil mempertahankan komentar, urutan, key yang tidak dikenal, kepemilikan, permission, dan atribut tambahan. Proses penulisan bersifat atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat [Configuration file](/reference/configuration/config.conf), [Boot parameters](/reference/Boot-Parameters), dan [live-config](/reference/configuration/live-config).
