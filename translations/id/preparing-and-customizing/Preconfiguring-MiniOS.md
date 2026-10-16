---
updated: 2026-10-15
program_commits:
    minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
---

# Prakonfigurasi MiniOS

Konfigurator MiniOS adalah editor grafis untuk konfigurasi aktif MiniOS. Editor ini memvalidasi perubahan dan menyimpan konfigurasi untuk proses boot berikutnya. Pilihan penyimpanan cache/log awal diterapkan oleh `minios-boot`; komponen konfigurasi aktif lainnya berjalan kemudian. Penyimpanan tidak mengubah sistem yang sedang berjalan secara langsung.

## Mulai konfigurator

Buka Konfigurator MiniOS dari menu aplikasi atau jalankan:

```bash
minios-configurator
```

Target default adalah `/etc/live/config.conf`. Untuk mengedit file reguler lainnya, berikan path-nya:

```bash
minios-configurator /path/to/config.conf
```

Penyimpanan memerlukan autentikasi PolicyKit. Symlink dan file target non-reguler tidak diizinkan.

## Konfigurasi media dan runtime

MiniOS dapat membaca konfigurasi dari dua lokasi:

- `minios/config.conf` dan `minios/config.conf.d/*.conf` pada media aktif
- `/etc/live/config.conf` dan `/etc/live/config.conf.d/*.conf` di sistem file root yang sedang berjalan

Konfigurator MiniOS hanya mengedit file yang dipilih. Jika tidak ada argumen path, konfigurator mengedit file runtime `/etc/live/config.conf`; konfigurator tidak membuka file media secara langsung. MiniOS menyinkronkan konfigurasi yang lebih baru antara sistem file runtime dan media MiniOS yang dapat ditulis selama boot. Media hanya-baca tidak dapat menerima perubahan runtime, dan konfigurasi runtime persisten dapat tetap terpisah dari salinan di media.

Saat boot, MiniOS menyinkronkan file media dan runtime berdasarkan waktu modifikasi. Untuk kebijakan penyimpanan baru, fragmen `config.conf.d` yang ditambahkan belakangan mengesampingkan file utama, `LIVE_CONFIG_CMDLINE` digunakan berikutnya, dan baris perintah kernel aktual memiliki prioritas terakhir.
Gunakan `-i` untuk menerapkan pengaturan yang dikenali dari baris perintah kernel saat ini di editor:

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

File yang dipilih tetap menjadi target penyimpanan. Parameter kernel yang tidak dikenal akan diabaikan.

## Kapan pengaturan diterapkan

Setiap kontrol menjelaskan kapan pengaturan tersebut digunakan. Menyimpan tidak pernah menerapkan pengaturan ke sesi saat ini.

### Diterapkan setelah reboot

Nama host, lokal, zona waktu, keyboard, target boot, pemilihan layanan, mode modul, penanganan media direktori pengguna, pengaturan debug, ekspor log, dan tiga pengaturan penyimpanan Advanced dibaca saat boot berikutnya. Reboot setelah menyimpan untuk menerapkannya.

Di **Advanced**, **Mode modul** menerima `simple` atau `merged`. Jika `LIVE_MODULE_MODE` tidak ada dalam konfigurasi yang dipilih, Konfigurator MiniOS saat ini menampilkan `merged` sebagai default efektif. Dalam mode gabungan, live-config menyegarkan pengguna, cache, dan status paket agar konfigurasi dari tumpukan modul terintegrasi ke sistem live yang sedang berjalan.

Di **Advanced**, **Penyimpanan log sistem**, **Cache unduhan APT**, dan **Cache browser** masing-masing menawarkan `persistent` (default) atau `volatile`. Pengaturan ini diterapkan setelah aktivasi persistensi berhasil, termasuk pada sesi salinan RAM yang dapat ditulisi dengan informasi asal yang terlindungi. Dengan persistensi tahan lama, diagnostik boot MiniOS, status paket APT, dan profil browser tetap tersimpan di media penyimpanan; hanya log dan cache terpilih yang dipindahkan ke RAM yang dibatasi. Dalam sesi salinan RAM, status yang dipertahankan tetap harus berhasil disimpan ke media penyimpanan. Cache RAM APT dan browser memerlukan ruang tersedia minimal 1 GiB dan tidak boleh ada swap non-zRAM. Penyiapan browser berjalan setelah pembuatan pengguna. Konfigurator memberikan peringatan jika initrd tidak memiliki penanda yang diperlukan`perch-storage-v1` Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk batas tetap RAM.

### Hanya digunakan untuk sesi baru

Pembuatan akun, kata sandi pengguna dan root, `noroot`, kebijakan sudo dan PolicyKit, kebijakan SSH dan XRDP, akses X11, petunjuk kata sandi, dan penguncian layar adalah pengaturan sekali pakai. Sesi persisten biasanya mencatat komponen `live-config` yang telah selesai di `/var/lib/live/config/`, sehingga mengubah nilai ini lalu me-reboot sesi yang sama tidak akan membuat ulang akun atau status keamanan. Mulai sesi baru untuk menerapkannya sebagai pengaturan awal.

Profil keamanan adalah preset editor. Nama profil tidak disimpan; pengaturan keamanan masing-masing disimpan dan tetap dapat diedit.

## Direktori pengguna dan persistensi

Penautan dan pemasangan bind pada direktori pengguna tidak dapat digunakan bersamaan. Keduanya menggunakan media data lokal MiniOS yang sudah ada dan dapat ditulisi, serta jalur relatif terhadap media yang aman. Fitur ini tidak tersedia dengan `toram`, `toram=full`, atau `toram=trim`, maupun saat sesi persistensi aktif dienkripsi dengan LUKS. Penyalinan kembali juga diblokir untuk sesi terenkripsi. MiniOS tidak menggabungkan dua pohon direktori yang berisi data secara otomatis.

`perchmode` dan `perchsize` adalah parameter boot initramfs, bukan pengaturan Konfigurator MiniOS. Kontrol penyimpanan cache/log yang baru tidak memilih atau membuat sesi `perch`. Konfigurator MiniOS tidak membuat, membuka kunci, mengubah ukuran, atau memperbaiki kontainer persistensi. Untuk persistensi terenkripsi, Konfigurator melaporkan apakah penanda enkripsi initramfs tersedia.

## Perilaku penyimpanan

Tinjauan hanya menampilkan nilai yang berubah dan menyamarkan kata sandi. Penyimpanan hanya memperbarui kunci yang berubah, sekaligus mempertahankan komentar, urutan, kunci yang tidak dikenal, kepemilikan, izin, dan atribut tambahan. Penulisan dilakukan secara atomik.

Untuk referensi lengkap variabel dan parameter boot, lihat [File konfigurasi](/reference/configuration/config.conf), [Parameter boot](/reference/Boot-Parameters), dan [live-config](/reference/configuration/live-config).
