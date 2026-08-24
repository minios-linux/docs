# Mulai Cepat

Panduan ini mencakup proses mengunduh, menulis, booting, dan melakukan konfigurasi awal MiniOS.

## 1. Pilih edisi

- **Minimum** menyediakan paket yang lebih sedikit dan lingkungan Flux.
- **Standard** adalah edisi Xfce untuk penggunaan umum.
- **Toolbox** menambahkan alat administrasi, diagnostik, penyimpanan, dan pemulihan.
- **Ultra** mencakup kumpulan aplikasi terlengkap.

Ketersediaan edisi dan desktop berbeda-beda di setiap rilis. Lihat
[Tentang MiniOS](/about/About-MiniOS.md) dan
[daftar paket](/administration/Packages.md) sebelum mengunduh.

Unduh ISO dari [minios.dev](https://minios.dev) atau
[halaman rilis GitHub](https://github.com/minios-linux/minios-live/releases).
Verifikasi checksum sebelum digunakan; lihat
[Memverifikasi unduhan](/installation/Verifying-Downloads.md).

## 2. Siapkan perangkat target

Gunakan perangkat yang cukup besar untuk ISO yang dipilih dan data atau sesi persisten yang ingin Anda simpan. Ukuran ISO dapat berubah di setiap rilis, jadi periksa file unduhan dan alat penulisan, bukan hanya mengandalkan ukuran tetap yang tercantum di panduan. Cadangkan perangkat target terlebih dahulu: sebagian besar metode instalasi akan menimpa sebagian atau seluruh isinya.

Pilih satu metode dan baca panduannya sebelum memilih perangkat:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), atau
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), atau
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) atau
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Dari MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Metode lain yang terdokumentasi adalah [UNetbootin](/installation/tools/UNetbootin.md) dan [metode asli](/installation/tools/Original-Method.md). Lihat
[Alat pembuatan USB](/installation/tools/USB-Creation-Tools.md) untuk perbandingan dan [Instalasi MiniOS](/installation/Installing-MiniOS.md) untuk gambaran instalasi.

## 3. Pahami persistensi sebelum menulis

Persistensi tidak selalu dibuat oleh setiap metode penulisan atau booting.

- Penulisan image mentah menggunakan `dd`, Etcher, atau alat serupa akan mereplikasi ISO. Ini tidak otomatis mengatur sesi persisten.
- Ventoy biasanya melakukan boot ISO sebagai file. Persistensi MiniOS harus diatur secara terpisah.
- MiniOS Installer dapat membuat instalasi live dan mengonfigurasi penyimpanan sesi native, DynFileFS, raw, atau terenkripsi LUKS.
- Boot baru sengaja berjalan tanpa persistensi. Entri boot-menu MiniOS lainnya dapat melanjutkan, membuat, atau memilih sesi jika penyimpanan yang dapat ditulis tersedia.
- Instalasi native adalah sistem yang diinstal secara konvensional dan tidak menggunakan persistensi sesi live dengan cara yang sama.

Lihat [Manajemen sesi](/configuration/Session-Management.md) dan [Parameter boot](/configuration/Boot-Parameters.md) sebelum mengubah penyimpanan sesi. Selalu cadangkan file penting terlepas dari mode persistensi.

## 4. Boot MiniOS

1. Matikan komputer dan hubungkan perangkat yang sudah disiapkan.
2. Buka menu boot firmware dan pilih entri UEFI atau legacy dari perangkat tersebut.
3. Pilih sesi baru untuk pengujian perangkat keras awal, atau sesi persisten hanya jika sudah dikonfigurasi sebelumnya.
4. Pastikan grafis, keyboard, penyimpanan, dan jaringan berfungsi sebelum melakukan perubahan instalasi yang bersifat destruktif.

Jika perangkat tidak terdaftar atau desktop tidak berjalan, lihat
[Kompatibilitas perangkat keras](/installation/Hardware-Compatibility.md) dan
[Pemecahan masalah](/administration/Troubleshooting.md).

## 5. Konfigurasi sistem

Buka **Aplikasi > Sistem > Konfigurasi MiniOS**, atau jalankan:

```bash
minios-configurator
```

Configurator mengedit `/etc/live/config.conf`. Anda dapat mengatur identitas pengguna, sandi, lokal, zona waktu, keyboard, hostname, layanan, penyimpanan direktori pengguna, dan kontrol keamanan. Pengaturan ini tidak langsung mengubah sistem yang sedang berjalan; pengaturan yang disimpan akan diterapkan sesuai dengan relevansi masing-masing, biasanya setelah reboot atau saat sesi baru dibuat.

Profil keamanan mengisi pengaturan konkret untuk sudo, PolicyKit, SSH, XRDP, X11, petunjuk sandi, penguncian layar, dan autologin. Tinjau kontrol yang dihasilkan, jangan hanya mengandalkan nama profil sebagai pengaturan runtime. Lihat [Penguatan keamanan](/administration/Security-Hardening.md) dan [panduan MiniOS Configurator](/configuration/MiniOS-Configurator.md). [Referensi file konfigurasi](/configuration/Configuration-File.md) mendokumentasikan kunci-kunci dasarnya.

## 6. Instal perangkat lunak dan simpan pekerjaan

Perubahan APT yang dilakukan di sesi live hanya akan bertahan setelah reboot jika sesi tersebut persisten. Modul SquashFS tetap terpisah dari sesi yang dapat ditulis dan dapat dimuat sebagai bagian dari sistem modular; lihat [Membuat modul](/development/Creating-Modules.md).

Simpan file penting di media penyimpanan yang sudah dipastikan dapat ditulis dan lakukan satu kali shutdown bersih serta reboot sebelum benar-benar mengandalkan sesi persisten.

## Mendapatkan bantuan

- [Optimasi performa](/administration/Performance-Optimization.md)
- [Manajemen kernel](/administration/Kernel-Management.md)
- [Membangun MiniOS](/development/Building-MiniOS.md)
- [Membangun ulang ISO](/development/Rebuilding-ISO.md)
- [Isu GitHub](https://github.com/minios-linux/minios-live/issues)
- [Sumber MiniOS](https://github.com/minios-linux/minios-live)
- [Dokumentasi Debian](https://www.debian.org/doc/)
