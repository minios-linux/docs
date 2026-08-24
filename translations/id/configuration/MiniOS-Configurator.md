# MiniOS Configurator

MiniOS Configurator adalah editor grafis untuk pengaturan MiniOS `live-config`. Aplikasi ini memvalidasi perubahan dan menulis konfigurasi untuk proses boot berikutnya. Konfigurator tidak mengubah sistem yang sedang berjalan secara langsung.

## Memulai konfigurator

Buka MiniOS Configurator dari menu aplikasi atau jalankan:

```bash
minios-configurator
```

Target default adalah `/etc/live/config.conf`. Untuk mengedit file reguler lain, masukkan path-nya:

```bash
minios-configurator /path/to/config.conf
```

Menyimpan perubahan memerlukan autentikasi PolicyKit. Symlink dan file target yang bukan file reguler akan ditolak.

## Konfigurasi media dan runtime

MiniOS dapat membaca konfigurasi dari dua lokasi:

- `minios/config.conf` dan `minios/config.conf.d/*.conf` pada media live
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/*.conf` di filesystem root yang sedang berjalan

Configurator hanya mengedit file yang dipilih. Jika tidak ada argumen path, maka akan mengedit file runtime `/etc/live/config.conf`; tidak langsung membuka file di media. MiniOS akan menyinkronkan konfigurasi terbaru antara filesystem runtime dan media MiniOS yang dapat ditulis saat boot. Media yang hanya-baca tidak dapat menerima perubahan runtime, dan konfigurasi runtime yang persisten dapat tetap independen dari salinan di media.

Untuk setiap opsi, parameter kernel memiliki prioritas lebih tinggi daripada file konfigurasi, dan konfigurasi media lebih diutamakan daripada konfigurasi filesystem root. Gunakan `-i` untuk menimpa pengaturan yang dikenali dari command line kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Waktu pengaturan diterapkan

Setiap kontrol menyatakan kapan pengaturan tersebut digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi yang sedang berjalan.

### Diterapkan setelah reboot

Hostname, lokal, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, dan ekspor log akan dibaca pada proses boot berikutnya. Lakukan reboot setelah menyimpan untuk menerapkan perubahan tersebut.

### Digunakan hanya untuk sesi baru

Pembuatan akun, password pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk password, dan penguncian layar adalah pengaturan satu kali pakai. Sesi persisten biasanya mencatat komponen `live-config` yang telah selesai di bawah `/var/lib/live/config/`, sehingga mengubah nilai ini dan melakukan reboot pada sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkan pengaturan ini sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan individual yang disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Linking dan bind mount direktori pengguna saling eksklusif. Keduanya menggunakan media data MiniOS lokal yang sudah dapat ditulis dan path relatif media yang aman. Fitur ini tidak tersedia pada `toram`, `toram=full`, atau `toram=trim`, dan MiniOS tidak menggabungkan dua pohon direktori yang sudah berisi data secara otomatis.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan di Configurator. Configurator tidak membuat, membuka kunci, mengubah ukuran, atau memperbaiki container persistensi. Untuk persistensi terenkripsi, Configurator hanya melaporkan apakah marker enkripsi initramfs ada.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang berubah dan menyembunyikan password. Penyimpanan hanya memperbarui key yang berubah sambil mempertahankan komentar, urutan, key yang tidak dikenal, kepemilikan, izin, dan atribut tambahan. Proses penulisan bersifat atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat
[Configuration file](/configuration/Configuration-File.md),
[Boot parameters](/configuration/Boot-Parameters.md), dan
[live-config](/configuration/live-config.md).
