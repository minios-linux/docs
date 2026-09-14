---
updated: 2026-09-13
---

# Keamanan

Kontrol keamanan MiniOS dirancang untuk sistem live: sesi sementara, sesi persisten, media portabel, dan konfigurasi saat boot. Penginstal MiniOS juga dapat melakukan konversi native. Sistem hasilnya akan mempertahankan lingkungan desktop yang dipilih dan identitas visual MiniOS, namun perangkat lunak MiniOS khusus live akan dihapus, sehingga Anda dapat mengamankan dan memeliharanya dengan alat Debian standar, bukan memperlakukannya sebagai mode live lain.
Lindungi sesi yang sedang berjalan, data persisten, media boot, dan konfigurasi apa pun yang diterapkan saat startup.

## Mulai dengan media tepercaya

Unduh MiniOS dari sumber resmi dan verifikasi file ISO sebelum menuliskannya.
Ikuti [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) dan bandingkan hasilnya sebelum melakukan booting atau instalasi. Verifikasi dapat mendeteksi unduhan yang rusak atau telah diganti; namun, ini tidak menjamin bahwa perangkat USB yang sudah dimodifikasi aman.

Jaga perangkat USB tetap dalam kendali fisik Anda. Kata sandi firmware dan pengaturan urutan boot yang dibatasi dapat mengurangi booting tidak sah secara sembarangan, tetapi tidak mengenkripsi file di perangkat. Secure Boot dapat memberikan perlindungan tambahan pada proses boot untuk image dan perangkat keras yang mendukungnya; pastikan untuk memeriksa perilaku rilis dan firmware sebenarnya, jangan hanya mengasumsikan dukungan.

## Ganti kredensial default

Live image MiniOS yang belum dikustomisasi menggunakan kredensial yang dipublikasikan `live` / `evil` dan `root` / `toor`, dengan login otomatis dan akses administratif tanpa sandi pada konfigurasi yang berorientasi pada kemudahan. Siapa pun yang dapat mengakses sistem ini mungkin bisa menggunakan kredensial tersebut, terutama jika SSH aktif.

Sebelum bergabung ke jaringan yang tidak tepercaya:

1. Atur sandi unik untuk pengguna dan root di Konfigurator MiniOS.
2. Pilih profil keamanan yang sesuai dan tinjau setiap kontrol yang sudah diisi.
3. Nonaktifkan SSH dan XRDP kecuali akses jarak jauh memang diperlukan.
4. Lakukan reboot ke sesi baru saat mengubah pengaturan akun satu kali atau keamanan, lalu verifikasi perilaku login dan hak akses yang dihasilkan.

Konfigurator menyimpan hash sandi terenkripsi, bukan sandi dalam bentuk teks biasa. Jika mengubah akun persisten yang sudah dibuat, gunakan `passwd` untuk pengguna saat ini dan `sudo passwd root` untuk root. Setelah konversi native, gunakan alat manajemen akun Debian seperti biasa.

## Gunakan kontrol keamanan Konfigurator

Konfigurator MiniOS menyediakan tiga profil. Setiap profil mengisi pengaturan konkret; nama profil itu sendiri tidak disimpan sebagai kunci konfigurasi runtime, dan setiap pengaturan tetap dapat diedit secara independen.

| Profil | Perilaku utama |
| --- | --- |
| `convenient` | Mendukung autologin, sudo dan PolicyKit tanpa password, SSH root dan login password diizinkan, pengaturan XRDP/X11/lock screen lebih longgar, petunjuk password ditampilkan. |
| `balanced` | Tanpa autologin, sudo dan PolicyKit memerlukan password, login root SSH ditolak tapi login password SSH diizinkan, XRDP/X11/lock screen diperketat. |
| `strict` | Tanpa autologin, sudo dan PolicyKit memerlukan password, login root dan password SSH ditolak, XRDP dinonaktifkan, X11/lock screen diperketat, petunjuk password disembunyikan. |

Pengaturan default installer berbeda tergantung mode deployment: instalasi live menggunakan `convenient`, sedangkan konversi native dimulai dari `balanced`. Pengaturan native diterapkan saat konversi; setelah instalasi, gunakan konfigurasi keamanan Debian seperti biasa. Ini adalah default, bukan rekomendasi untuk setiap model ancaman.

Pengaturan yang sama tersedia sebagai kunci konfigurasi terdokumentasi, termasuk `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, dan `LIVE_LOCKSCREEN_MODE`. Sebaiknya gunakan kunci ini atau Konfigurator daripada mengedit file sudoers, PolicyKit, display-manager, atau SSH yang dihasilkan. Lihat [Berkas konfigurasi](/reference/configuration/config.conf).
Untuk perilaku penyimpanan dan penerapan pengaturan, lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Pembuatan akun, password, `LIVE_CONFIG_NOROOT`, dan postur keamanan adalah pengaturan satu kali yang digunakan saat sesi baru dibuat. Konfigurator menampilkan penerapan untuk setiap kontrol. Pengaturan yang dapat dikonfigurasi ulang seperti layanan akan diterapkan setelah reboot.

## Akses jarak jauh yang aman

SSH dapat diaktifkan pada image MiniOS untuk keperluan pemulihan. Di jaringan tempat pengguna lain tidak dapat dipercaya, anggap kredensial default yang dipublikasikan sudah terekspos sampai Anda memastikan sebaliknya.

- Jika SSH tidak diperlukan, tambahkan `ssh` ke `DISABLE_SERVICES` di Configurator dan hapus dari `ENABLE_SERVICES` jika ada.
- Jika SSH diperlukan, tolak login root dengan `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Utamakan autentikasi kunci. Pastikan login dengan kunci berhasil di koneksi terpisah sebelum mengatur `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Batasi akses masuk dengan firewall jaringan atau router, dan jangan mengekspos sistem pemulihan portabel langsung ke Internet.
- Tinjau XRDP secara terpisah. Profil strict menonaktifkannya; profil balanced memperkuatnya namun tidak selalu menonaktifkan layanannya.

Parameter boot dapat menimpa nilai di file konfigurasi. Periksa perilaku layanan yang tidak terduga dengan membandingkan ke [Parameter boot](/reference/Boot-Parameters).

## Enkripsi data persisten

Penyimpanan native, DynFileFS, dynblk, raw, dan SquashFS yang tidak dienkripsi dapat dibaca oleh siapa saja yang mendapatkan perangkat. Dynblk adalah backend blok kernel yang ringan, bukan lapisan enkripsi;`volumeNNN.db`file backing-nya berisi data sesi biasa yang tidak terenkripsi kecuali penyimpanan dasarnya dilindungi secara terpisah. Penginstal MiniOS dapat mengonfigurasi kontainer LUKS terenkripsi untuk sesi live jika initrd sumber mendukung LUKS. Initrd akan membuat`changes.luks`pada boot pertama dan meminta frasa sandi; penginstal tidak menerima atau menyimpan frasa sandi tersebut.

Persistensi LUKS melindungi isi saat kontainer ditutup. Ini tidak melindungi data setelah dibuka, file boot yang tidak terenkripsi, file yang disalin ke luar kontainer, atau filesystem root native. Persistensi sesi LUKS bukan enkripsi root native. Gunakan frasa sandi yang kuat dan pastikan Anda memiliki cadangan yang telah diuji.

Lihat [Penginstal MiniOS](/installing-minios/MiniOS-Installer)dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Terapkan pembaruan secara sengaja

Segarkan metadata paket dan instal pembaruan keamanan Debian di sesi live persisten menggunakan alur kerja APT normal jika memang diperlukan. Perubahan APT pada sesi live baru akan hilang setelah reboot. Modul dasar SquashFS bersifat hanya-baca, sehingga mengganti ISO atau modul dengan rilis MiniOS tepercaya yang lebih baru sering kali menjadi cara paling bersih untuk memperbarui sistem live dasar. Setelah konversi native, pemeliharaan keamanan paket cukup menggunakan alur kerja APT Debian biasa untuk sistem yang telah diinstal tersebut.

Lihat [Pembaruan perangkat lunak](/maintenance-and-recovery/Updating-MiniOS) untuk alur kerja APT, modul, image, dan kernel secara terpisah.

Sebelum melakukan pembaruan besar:

- Cadangkan file penting dan sesi persisten.
- Pastikan ruang kosong yang tersedia sudah cukup.
- Hindari menginterupsi proses penulisan atau mematikan perangkat.
- Lakukan reboot dan verifikasi sistem yang telah diperbarui sebelum membuang media atau sesi yang sebelumnya sudah dipastikan berfungsi.

## Perlakukan hooks dan preseeding sebagai eksekusi kode

Opsi boot `hooks` dan hooks live-config dapat mengeksekusi file dari root filesystem, media boot, atau URL. Remote hooks, hooks pada media yang telah dimodifikasi, dan preseeds yang belum ditinjau dapat berjalan dengan hak akses sistem. Gunakan hanya file yang sudah ditinjau dari sumber tepercaya, utamakan distribusi yang terautentikasi, dan hindari remote hooks pada jaringan yang tidak tepercaya. Lihat [live-config](/reference/configuration/live-config) untuk urutan eksekusi dan lokasi yang didukung.

## Cadangkan dan pensiunkan media dengan aman

Penyimpanan persisten bukanlah cadangan. Simpan salinan terpisah untuk file pengguna dan ekspor atau salin sesi saat masih dalam kondisi baik. Uji proses pemulihan pada media yang berbeda.
Matikan perangkat dengan benar sebelum melepas media penyimpanan yang dapat ditulis, dan pastikan ada ruang kosong yang cukup untuk metadata sesi dan operasi sistem file.

Sebelum membuang perangkat, hapus data secara aman sesuai dengan teknologi penyimpanan dan tingkat sensitivitas data. Menghapus file atau memformat ulang saja belum tentu membuat data lama tidak dapat dipulihkan.
