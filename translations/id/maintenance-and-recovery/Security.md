---
updated: 2026-08-31
---

# Keamanan

Kontrol keamanan MiniOS dirancang untuk sistem live: sesi sementara, sesi persisten, media portabel, dan konfigurasi saat boot. Penginstal MiniOS juga dapat melakukan konversi native. Sistem hasil konversi akan mempertahankan lingkungan desktop dan identitas visual MiniOS yang dipilih, tetapi perangkat lunak khusus live MiniOS akan dihapus. Karena itu, amankan dan pelihara sistem tersebut menggunakan alat Debian standar, bukan sebagai mode live lain.
Lindungi sesi yang sedang berjalan, data persisten, media boot, dan setiap konfigurasi yang diterapkan saat startup.

## Mulai dengan media tepercaya

Unduh MiniOS dari sumber resmi dan verifikasi file ISO sebelum menulisnya.
Ikuti panduan [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) dan bandingkan hasilnya sebelum melakukan booting atau instalasi. Verifikasi mendeteksi unduhan yang rusak atau telah diganti; namun tidak membuktikan bahwa perangkat USB yang sudah dimodifikasi aman.

Jaga perangkat USB tetap dalam kendali fisik Anda. Kata sandi firmware dan pembatasan urutan boot dapat menghambat upaya boot tanpa izin yang sederhana, tetapi tidak mengenkripsi file di perangkat. Secure Boot dapat memberikan perlindungan tambahan pada proses boot untuk image dan perangkat keras yang mendukungnya; periksa dukungan pada rilis yang digunakan dan perilaku firmware yang sebenarnya, jangan hanya mengasumsikannya.

## Ganti kredensial default

Image live MiniOS yang belum dikustomisasi menggunakan kredensial yang dipublikasikan `live` / `evil` dan `root` / `toor`, dengan login otomatis dan akses administratif tanpa kata sandi pada konfigurasi yang berorientasi kenyamanan. Siapa pun yang dapat mengakses sistem mungkin dapat menggunakan kredensial tersebut, terutama jika SSH aktif.

Sebelum terhubung ke jaringan yang tidak tepercaya:

1. Atur kata sandi unik untuk user dan root di Konfigurator MiniOS.
2. Pilih profil keamanan yang sesuai dan tinjau setiap kontrol yang terisi.
3. Nonaktifkan SSH dan XRDP kecuali akses jarak jauh diperlukan.
4. Reboot ke sesi baru saat mengubah pengaturan akun atau keamanan yang hanya diterapkan sekali, lalu verifikasi perilaku login dan hak akses yang dihasilkan.

Konfigurator menyimpan hash kata sandi terenkripsi, bukan kata sandi dalam bentuk teks. Jika mengubah akun persisten yang sudah dibuat, gunakan `passwd` untuk user saat ini dan `sudo passwd root` untuk root. Setelah konversi native, gunakan alat manajemen akun Debian seperti biasa.

## Gunakan kontrol keamanan Konfigurator

Konfigurator MiniOS menyediakan tiga profil. Sebuah profil akan mengisi pengaturan konkret; nama profil itu sendiri tidak disimpan sebagai kunci konfigurasi runtime, dan setiap pengaturan tetap dapat diedit secara independen.

| Profil | Perilaku utama |
| --- | --- |
| `convenient` | Kompatibel dengan autologin, sudo dan PolicyKit tanpa kata sandi, login root melalui SSH dan autentikasi SSH dengan kata sandi diizinkan, pengaturan XRDP/X11/layar kunci dilonggarkan, petunjuk kata sandi ditampilkan. |
| `balanced` | Tanpa autologin, sudo dan PolicyKit memerlukan kata sandi, login root melalui SSH ditolak tetapi autentikasi SSH dengan kata sandi diizinkan, pengaturan XRDP/X11/layar kunci diperketat. |
| `strict` | Tanpa autologin, sudo dan PolicyKit memerlukan kata sandi, login root melalui SSH dan autentikasi SSH dengan kata sandi ditolak, XRDP dinonaktifkan, pengaturan X11/layar kunci diperketat, petunjuk kata sandi disembunyikan. |

Default penginstal berbeda tergantung mode deployment: instalasi live menggunakan `convenient`, sedangkan konversi native dimulai dari `balanced`. Pengaturan native diterapkan saat konversi; setelah instalasi, gunakan konfigurasi keamanan Debian seperti biasa. Ini adalah default, bukan rekomendasi untuk setiap model ancaman.

Pengaturan yang sama tersedia sebagai kunci konfigurasi terdokumentasi, termasuk `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, dan `LIVE_LOCKSCREEN_MODE`. Gunakan kunci ini atau Konfigurator daripada mengedit file sudoers, PolicyKit, display-manager, atau SSH yang dihasilkan. Lihat [File konfigurasi](/reference/configuration/config.conf).
Untuk perilaku penyimpanan dan keberlakuan pengaturan, lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Pembuatan akun, kata sandi, `LIVE_CONFIG_NOROOT`, dan postur keamanan adalah pengaturan satu kali yang digunakan saat sesi baru dibuat. Konfigurator menunjukkan kapan setiap kontrol berlaku. Pengaturan yang dapat dikonfigurasi ulang seperti layanan akan diterapkan setelah reboot.

## Amankan akses jarak jauh

SSH dapat diaktifkan pada image MiniOS untuk keperluan pemulihan. Pada jaringan di mana pengguna lain tidak tepercaya, anggap kredensial default yang dipublikasikan terekspos sampai Anda memastikan sebaliknya.

- Jika SSH tidak diperlukan, tambahkan `ssh` ke `DISABLE_SERVICES` di Konfigurator dan hapus dari `ENABLE_SERVICES` jika ada.
- Jika SSH diperlukan, tolak login root dengan `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Utamakan autentikasi kunci. Pastikan login dengan kunci berhasil di koneksi terpisah sebelum mengatur `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Batasi akses masuk dengan firewall jaringan atau router, dan jangan mengekspos sistem pemulihan portabel langsung ke Internet.
- Tinjau XRDP secara terpisah. Profil ketat akan menonaktifkannya; profil seimbang memperketatnya namun tidak selalu menonaktifkan layanannya.

Parameter boot dapat menimpa nilai file konfigurasi. Periksa perilaku layanan yang tidak terduga dengan [Parameter boot](/reference/Boot-Parameters).

## Enkripsi data persisten

Data persisten native, DynFileFS, dan raw yang tidak dienkripsi dapat dibaca oleh siapa pun yang mendapatkan perangkat. Penginstal MiniOS dapat mengonfigurasi kontainer LUKS terenkripsi untuk sesi live ketika initrd sumber menandai dukungan LUKS. Initrd akan membuat `changes.luks` pada boot pertama dan meminta frasa sandinya; penginstal tidak menerima atau menyimpan frasa sandi tersebut.

Persistensi LUKS melindungi isi kontainer selama kontainer tersebut tertutup. Ini tidak melindungi data setelah kontainer dibuka, file boot yang tidak dienkripsi, file yang disalin ke luar kontainer, atau filesystem root native. Persistensi sesi LUKS bukanlah enkripsi root native. Gunakan frasa sandi yang kuat dan simpan cadangan yang telah diuji.

Lihat [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Terapkan pembaruan secara sengaja

Segarkan metadata paket dan instal pembaruan keamanan Debian pada sesi live persisten menggunakan workflow APT seperti biasa jika memang diperlukan. Perubahan APT pada sesi live baru akan hilang setelah reboot. Modul dasar SquashFS bersifat read-only, jadi mengganti ISO atau modul dengan rilis MiniOS yang lebih baru dan tepercaya sering kali menjadi cara paling bersih untuk memperbarui sistem live dasar. Setelah konversi native, pemeliharaan keamanan paket cukup mengikuti workflow APT Debian seperti biasa untuk sistem yang sudah terpasang.

Lihat [Pembaruan perangkat lunak](/maintenance-and-recovery/Updating-MiniOS) untuk workflow APT, modul, image, dan kernel yang terpisah.

Sebelum melakukan pembaruan besar:

- Cadangkan file penting dan sesi persisten.
- Pastikan ruang kosong yang cukup tersedia.
- Hindari interupsi proses penulisan atau mematikan perangkat.
- Reboot dan verifikasi sistem yang telah diperbarui sebelum membuang media atau sesi yang sebelumnya sudah terbukti stabil.

## Perlakukan hook dan preseeding sebagai eksekusi kode

Opsi boot `hooks` dan live-config hook dapat mengeksekusi file dari filesystem root, media boot, atau URL. Hook jarak jauh, hook media yang telah dimodifikasi, dan preseed yang belum ditinjau dapat berjalan dengan hak istimewa sistem. Gunakan hanya file yang telah ditinjau dari sumber tepercaya, utamakan distribusi yang terautentikasi, dan hindari hook jarak jauh di jaringan yang tidak tepercaya. Lihat [live-config](/reference/configuration/live-config) untuk urutan eksekusi dan lokasi yang didukung.

## Cadangkan dan pensiunkan media dengan aman

Persistensi bukanlah backup. Simpan salinan terpisah untuk file pengguna dan ekspor atau salin sesi saat masih sehat. Uji proses pemulihan di media yang berbeda.
Matikan perangkat dengan benar sebelum melepas media penyimpanan yang dapat ditulis, dan sisakan ruang kosong untuk metadata sesi serta operasi filesystem.

Sebelum membuang perangkat, hapus seluruh data di dalamnya secara aman sesuai dengan teknologi penyimpanan dan tingkat sensitivitas data. Menghapus file atau memformat ulang saja belum tentu membuat data lama tidak dapat dipulihkan.
