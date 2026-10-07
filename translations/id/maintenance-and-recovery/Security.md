---
updated: 2026-10-06
---

# Keamanan

Kontrol keamanan MiniOS dirancang untuk sistem live: sesi sementara, sesi persisten, media portabel, dan konfigurasi saat boot. Penginstal MiniOS juga dapat melakukan konversi native. Sistem hasil konversi akan mempertahankan lingkungan desktop dan identitas visual MiniOS yang dipilih, namun perangkat lunak khusus live MiniOS akan dihapus, sehingga Anda dapat mengamankan dan memeliharanya dengan alat Debian standar, bukan memperlakukannya seperti mode live lain.
Lindungi sesi yang sedang berjalan, data persisten, media boot, dan konfigurasi apa pun yang diterapkan saat startup.

## Mulai dengan media tepercaya

Unduh MiniOS dari sumber resmi dan verifikasi file ISO sebelum menuliskannya.
Ikuti [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) dan bandingkan hasilnya sebelum melakukan boot atau instalasi. Verifikasi akan mendeteksi unduhan yang rusak atau telah diganti; namun tidak menjamin bahwa perangkat USB yang sudah dimodifikasi aman.

Jaga perangkat USB tetap dalam kendali fisik Anda. Kata sandi firmware dan pengaturan urutan boot yang dibatasi dapat mengurangi risiko booting tidak sah secara sembarangan, namun tidak mengenkripsi file di perangkat. Secure Boot dapat memberikan perlindungan tambahan pada proses boot untuk image dan perangkat keras yang mendukungnya; periksa perilaku rilis dan firmware secara langsung, jangan hanya mengandalkan asumsi.

## Ganti kredensial default

Image live MiniOS yang belum dikustomisasi menggunakan kredensial yang dipublikasikan `live` / `evil` dan `root` / `toor`, dengan login otomatis dan akses administratif tanpa kata sandi pada konfigurasi yang berorientasi kemudahan. Siapa pun yang dapat mengakses sistem mungkin bisa menggunakan kredensial tersebut, terutama jika SSH aktif.

Sebelum terhubung ke jaringan yang tidak tepercaya:

1. Atur kata sandi unik untuk pengguna dan root di Konfigurator MiniOS.
2. Pilih profil keamanan yang sesuai dan tinjau setiap kontrol yang diaktifkan.
3. Nonaktifkan SSH dan XRDP kecuali akses jarak jauh memang diperlukan.
4. Lakukan reboot ke sesi baru setelah mengubah pengaturan akun satu kali atau pengaturan keamanan, lalu pastikan perilaku login dan hak akses sudah sesuai.

Konfigurator menyimpan hash kata sandi terenkripsi, bukan kata sandi dalam bentuk teks biasa. Jika Anda mengubah akun persisten yang sudah ada, gunakan `passwd` untuk pengguna saat ini dan `sudo passwd root` untuk root. Setelah konversi native, gunakan alat manajemen akun Debian seperti biasa.

## Gunakan kontrol keamanan Konfigurator

Konfigurator MiniOS menyediakan tiga profil. Setiap profil mengisi pengaturan konkret; nama profil itu sendiri tidak disimpan sebagai kunci konfigurasi saat runtime, dan setiap pengaturan tetap dapat diedit secara mandiri.

| Profil | Perilaku utama |
| --- | --- |
| `convenient` | Mendukung autologin, sudo dan PolicyKit tanpa kata sandi, login root dan SSH dengan kata sandi diizinkan, XRDP/X11/layar kunci longgar, petunjuk kata sandi ditampilkan. |
| `balanced` | Tanpa autologin, sudo dan PolicyKit memerlukan kata sandi, login root SSH ditolak namun SSH dengan kata sandi diizinkan, XRDP/X11/layar kunci diperketat. |
| `strict` | Tanpa autologin, sudo dan PolicyKit memerlukan kata sandi, login root dan login SSH dengan kata sandi ditolak, XRDP dinonaktifkan, X11/layar kunci diperketat, petunjuk kata sandi disembunyikan. |

Default pada penginstal berbeda tergantung mode deployment: instalasi live menggunakan `convenient`, sedangkan konversi native dimulai dari `balanced`. Pengaturan native diterapkan saat konversi; setelah instalasi, gunakan konfigurasi keamanan Debian seperti biasa. Ini adalah pengaturan default, bukan rekomendasi untuk semua model ancaman.

Pengaturan yang sama tersedia sebagai kunci konfigurasi terdokumentasi, termasuk `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, dan `LIVE_LOCKSCREEN_MODE`. Sebaiknya gunakan kunci ini atau Konfigurator daripada mengedit file sudoers, PolicyKit, display-manager, atau SSH yang dihasilkan. Lihat [Berkas konfigurasi](/reference/configuration/config.conf).
Untuk perilaku penyimpanan dan penerapan pengaturan, lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Pembuatan akun, kata sandi, `LIVE_CONFIG_NOROOT`, dan postur keamanan adalah pengaturan satu kali yang digunakan saat sesi baru dibuat. Konfigurator menampilkan penerapan untuk setiap kontrol. Pengaturan yang dapat dikonfigurasi ulang seperti layanan akan diterapkan setelah reboot.

## Amankan akses jarak jauh

SSH dapat diaktifkan pada image MiniOS untuk keperluan pemulihan. Pada jaringan yang penggunanya tidak tepercaya, anggap kredensial default yang dipublikasikan tetap terbuka sampai Anda memastikan sebaliknya.

- Jika SSH tidak diperlukan, tambahkan `ssh` ke `DISABLE_SERVICES` di Konfigurator dan hapus dari `ENABLE_SERVICES` jika ada.
- Jika SSH diperlukan, tolak login root dengan `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Utamakan autentikasi kunci. Pastikan login dengan kunci pada koneksi terpisah sebelum mengatur `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Batasi akses masuk dengan firewall jaringan atau router, dan jangan mengekspos sistem pemulihan portabel langsung ke Internet.
- Tinjau XRDP secara terpisah. Profil ketat akan menonaktifkannya; profil seimbang memperketatnya namun belum tentu menonaktifkan layanannya.

Parameter boot dapat menimpa nilai pada berkas konfigurasi. Periksa perilaku layanan yang tidak terduga dengan membandingkan pada [Parameter boot](/reference/Boot-Parameters).

## Enkripsi data persisten

Data native yang tidak dienkripsi, DynFileFS, DynBlk, VMDK, raw, dan persistensi SquashFS dapat dibaca oleh siapa pun yang memperoleh perangkat tersebut. MiniOS dapat melapiskan LUKS2 di atas Raw, DynFileFS, DynBlk, atau VMDK. LUKS2 tetap menjadi lapisan enkripsi, bukan mode sesi terpisah. Untuk pembuatan saat boot, pilih dengan `perchencrypt=luks`; sesi yang sudah ada mendapatkan status enkripsinya dari metadata sesi, bukan dari override perintah setelahnya.

Batas enkripsi berbeda tergantung backend. Raw mengenkripsi image blok logis di dalam `changes.img`; DynFileFS mengenkripsi `virtual.dat` yang diekspos; DynBlk dan VMDK mengenkripsi perangkat blok yang diekspos oleh driver DynBlk. Metadata sesi, berkas boot, metadata backend dan deskriptor VMDK di luar perangkat blok terenkripsi, serta berkas lain yang tidak terkait di media tetap dapat terlihat. Kompresi backend DynBlk dinonaktifkan saat LUKS2 dipilih; VMDK tidak menyediakan kompresi backend.

Initrd akan membuat filesystem terenkripsi saat pertama kali digunakan dan meminta frasa sandinya; penginstal tidak menerima atau menyimpan frasa sandi tersebut. Saat boot, tiga kali gagal membuka kunci akan menghentikan proses boot, bukan kembali ke mode plaintext, backend lain, atau pengganti di memori pada permintaan persistensi yang sama.

Lapisan persistensi LUKS2 MiniOS melindungi isi filesystem selama mapper tertutup. Ini tidak melindungi data setelah dibuka, berkas boot yang tidak dienkripsi, berkas yang disalin di luar backend terenkripsi, atau filesystem root native. Enkripsi persistensi berlapis bukan enkripsi root native. Ekspor logis berisi file sesi yang sudah didekripsi, jadi lindungi arsip cadangan secara terpisah. Gunakan frasa sandi yang kuat dan simpan cadangan yang sudah diuji.

Penyimpanan cache atau jurnal sementara adalah pilihan untuk mengurangi penulisan, bukan enkripsi. Bahkan dengan `LIVE_LOG_STORAGE=volatile`, MiniOS menyimpan `minios-boot` dan `live-config` diagnostik pada penyimpanan sesi yang persisten. Untuk SquashFS berkas-berkas ini berada di luar `changes.sb` di bawah direktori `boot-logs/` sesi. Perangkat penyimpanan yang tidak dienkripsi akan mengekspos file tersebut bersama file lainnya. `LIVE_CONFIG_DEBUG=true` juga mengaktifkan jejak detail dan salinan input penggabungan akun pengguna; sebaiknya nonaktifkan debug untuk penggunaan sehari-hari dan tinjau log sebelum membagikannya. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Lihat [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).

## Terapkan pembaruan dengan sengaja

Segarkan metadata paket dan instal pembaruan keamanan Debian di sesi live persisten menggunakan alur kerja APT seperti biasa jika memang diperlukan. Perubahan APT pada sesi live baru akan hilang setelah reboot. Modul SquashFS dasar bersifat hanya-baca, sehingga mengganti ISO atau modul dengan rilis MiniOS yang lebih baru dan tepercaya sering kali menjadi cara paling bersih untuk memperbarui sistem live dasar. Setelah konversi native, pemeliharaan keamanan paket cukup mengikuti alur kerja APT Debian biasa untuk sistem yang telah diinstal.

Lihat [Pembaruan perangkat lunak](/maintenance-and-recovery/Updating-MiniOS) untuk alur kerja APT, modul, image, dan kernel yang terpisah.

Sebelum melakukan pembaruan besar:

- Cadangkan file penting dan sesi persisten.
- Pastikan ruang kosong yang tersedia cukup.
- Hindari memutus proses penulisan atau mematikan perangkat secara paksa.
- Lakukan reboot dan pastikan sistem yang telah diperbarui berjalan dengan baik sebelum membuang media atau sesi yang sebelumnya sudah dipastikan baik.

## Perlakukan hook dan preseeding sebagai eksekusi kode

Opsi boot `hooks` dan hook live-config dapat mengeksekusi file dari filesystem root, media boot, atau URL. Hook jarak jauh, hook media yang telah dimodifikasi, dan preseed yang belum ditinjau dapat berjalan dengan hak istimewa sistem. Hanya gunakan file yang telah ditinjau dari sumber tepercaya, utamakan distribusi yang terautentikasi, dan hindari hook jarak jauh di jaringan yang tidak tepercaya. Lihat [live-config](/reference/configuration/live-config) untuk urutan eksekusi dan lokasi yang didukung.

## Cadangkan dan pensiunkan media dengan aman

Persistensi bukanlah cadangan. Simpan salinan terpisah file pengguna dan ekspor atau salin sesi saat masih dalam kondisi baik. Uji pemulihan di media yang berbeda.
Matikan perangkat dengan benar sebelum melepas media penyimpanan yang dapat ditulis, dan sisakan ruang kosong untuk metadata sesi serta operasi filesystem.

Sebelum membuang perangkat, hapus secara aman sesuai teknologi penyimpanan dan tingkat sensitivitas data. Menghapus file atau memformat ulang saja belum tentu membuat data lama tidak dapat dipulihkan.
