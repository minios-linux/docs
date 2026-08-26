---
updated: 2026-08-26
---

# Mulai Cepat

Panduan ini mencakup proses mengunduh, menulis, booting, dan melakukan konfigurasi awal MiniOS.

## 1. Pilih edisi

- **Flux** menyediakan paket yang lebih ringkas dan lingkungan Flux.
- **Standard** adalah edisi Xfce serbaguna.
- **Toolbox** menambahkan alat administrasi, diagnostik, penyimpanan, dan pemulihan.
- **Ultra** mencakup set aplikasi terlengkap.

Ketersediaan edisi dan desktop bervariasi tergantung rilis. Lihat
[Tentang MiniOS](/about/About-MiniOS.md) dan
[daftar paket](/administration/Packages.md) sebelum mengunduh.

Unduh ISO dari [minios.dev](https://minios.dev) atau
[halaman rilis GitHub](https://github.com/minios-linux/minios-live/releases).
Verifikasi checksum sebelum digunakan; lihat
[Memverifikasi unduhan](/installation/Verifying-Downloads.md).

## 2. Siapkan perangkat target

Gunakan perangkat yang kapasitasnya cukup untuk ISO yang dipilih serta data atau sesi persisten yang ingin Anda simpan. Ukuran ISO dapat berubah di setiap rilis, jadi pastikan untuk memeriksa file unduhan dan alat penulisan yang digunakan, bukan hanya mengandalkan ukuran tetap yang tercantum di panduan. Cadangkan perangkat target terlebih dahulu: sebagian besar metode instalasi akan menimpa sebagian atau seluruh isi perangkat tersebut.

Pilih salah satu metode berikut dan baca panduannya sebelum menentukan perangkat:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), atau
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), atau
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) atau
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Dari MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Metode lain yang terdokumentasi adalah [UNetbootin](/installation/tools/UNetbootin.md) dan [Instalasi USB berbasis file](/installation/tools/File-Based-USB-Installation.md). Lihat [Alat pembuatan USB](/installation/tools/USB-Creation-Tools.md) untuk perbandingan dan [Instalasi MiniOS](/installation/Installing-MiniOS.md) untuk gambaran umum instalasi.

## 3. Pahami persistensi sebelum menulis

Persistensi tidak otomatis dibuat oleh setiap metode penulisan atau boot.

- Penulisan image mentah dengan `dd`, Etcher, atau alat serupa hanya mereproduksi ISO. Ini tidak secara otomatis mengonfigurasi sesi persisten.
- Ventoy biasanya melakukan boot ISO sebagai file. Persistensi MiniOS harus diatur secara terpisah.
- MiniOS Installer dapat membuat instalasi live dan mengonfigurasi penyimpanan sesi native, DynFileFS, raw, atau terenkripsi LUKS.
- Boot baru sengaja berjalan tanpa persistensi. Entri menu boot MiniOS lainnya dapat melanjutkan, membuat, atau memilih sesi saat penyimpanan yang dapat ditulis tersedia.
- Instalasi native adalah sistem terinstal konvensional dan tidak menggunakan persistensi sesi live dengan cara yang sama.

Gunakan [Boot modes](/configuration/Boot-Modes.md) sebagai panduan utama untuk perilaku boot live yang terlihat oleh pengguna. Lihat [Session management](/configuration/Session-Management.md) untuk pilihan penyimpanan, [Initrd persistence](/configuration/Initrd-Persistence.md) untuk kontrak detail saat boot, dan [Boot parameters](/configuration/Boot-Parameters.md) sebelum mengubah opsi kernel. Selalu buat cadangan file penting terlepas dari mode persistensi.

## 4. Boot MiniOS

1. Matikan komputer dan pasang perangkat yang sudah dipersiapkan.
2. Buka menu boot firmware dan pilih entri UEFI atau legacy dari perangkat tersebut.
3. Pilih sesi baru untuk pengujian perangkat keras awal, atau sesi persisten hanya jika sudah dikonfigurasi sebelumnya.
4. Pastikan grafis, keyboard, penyimpanan, dan jaringan berfungsi sebelum melakukan perubahan instalasi yang bersifat destruktif.

Jika perangkat tidak terdaftar atau desktop tidak berhasil dimulai, lihat [Hardware compatibility](/installation/Hardware-Compatibility.md) dan [Troubleshooting](/administration/Troubleshooting.md). Untuk kegagalan saat mencari sumber live, lihat [Initrd system discovery](/configuration/Initrd-System-Discovery.md).

## 5. Konfigurasi sistem

Buka **Aplikasi > Sistem > Konfigurasi MiniOS**, atau jalankan:

```bash
minios-configurator
```

Configurator mengedit `/etc/live/config.conf`. Anda dapat mengatur identitas pengguna,
kata sandi, lokal, zona waktu, keyboard, hostname, layanan, penyimpanan direktori pengguna,
dan kontrol keamanan. Perubahan tidak langsung diterapkan ke sistem yang sedang berjalan;
pengaturan yang disimpan akan diterapkan sesuai dengan relevansi masing-masing pengaturan, biasanya
setelah reboot atau saat sesi baru dibuat.

Profil keamanan mengisi pengaturan konkret untuk sudo, PolicyKit, SSH, XRDP, X11,
petunjuk kata sandi, penguncian layar, dan autologin. Tinjau kontrol yang dihasilkan
bukan hanya nama profil sebagai pengaturan runtime. Lihat
[Pengerasan keamanan](/administration/Security-Hardening.md) dan
[panduan MiniOS Configurator](/configuration/MiniOS-Configurator.md). Referensi
[berkas konfigurasi](/configuration/Configuration-File.md) mendokumentasikan
kunci-kunci dasarnya.

Konfigurasikan koneksi kabel dan Wi-Fi biasa dengan [Konfigurasi Jaringan](/configuration/Network-Configuration.md). Parameter boot jaringan `ip=` bukan pengaturan NetworkManager yang persisten.

## 6. Instal perangkat lunak dan simpan pekerjaan

Perubahan APT yang dilakukan dalam sesi live hanya akan bertahan setelah reboot jika sesi tersebut persisten. Modul SquashFS tetap terpisah dari sesi yang dapat ditulis dan dapat dimuat sebagai bagian dari sistem modular; lihat [Creating modules](/development/Creating-Modules.md) dan [Initrd module loading](/configuration/Initrd-Module-Loading.md).

Simpan file penting di media penyimpanan yang sudah dipastikan dapat ditulis dan lakukan satu kali shutdown serta reboot bersih sebelum mengandalkan sesi persisten.

## Mendapatkan bantuan

- [Optimasi performa](/administration/Performance-Optimization.md)
- [Aplikasi dan alat MiniOS](/about/MiniOS-Applications.md)
- [Backup dan pemulihan](/administration/Backup-Recovery.md)
- [Pertanyaan yang sering diajukan](/about/FAQ.md)
- [Manajemen kernel](/administration/Kernel-Management.md)
- [Membangun MiniOS](/development/Building-MiniOS.md)
- [Membangun ulang ISO](/development/Rebuilding-ISO.md)
- [Isu GitHub](https://github.com/minios-linux/minios-live/issues)
- [Sumber MiniOS](https://github.com/minios-linux/minios-live)
- [Dokumentasi Debian](https://www.debian.org/doc/)
