# Penguatan Keamanan

MiniOS dapat dijalankan sebagai sistem pemulihan live, sistem portabel persisten, atau instalasi native. Pengendalian yang tepat bergantung pada bagaimana sistem digunakan. Lindungi sesi yang sedang berjalan, data persisten, media boot, dan setiap konfigurasi yang diterapkan saat startup.

## Mulai dengan media tepercaya

Unduh MiniOS dari sumber resmi dan verifikasi file ISO sebelum menuliskannya. Ikuti panduan [Memverifikasi unduhan](/installation/Verifying-Downloads.md) dan bandingkan hasilnya sebelum melakukan booting atau instalasi. Verifikasi mendeteksi unduhan yang rusak atau telah diganti; namun, ini tidak membuktikan bahwa perangkat USB yang sudah dimodifikasi aman.

Jaga perangkat USB tetap dalam kendali fisik Anda. Kata sandi firmware dan pengaturan urutan boot yang dibatasi dapat mengurangi booting tidak sah secara kasual, tetapi tidak mengenkripsi file di perangkat tersebut. Secure Boot dapat memberikan perlindungan tambahan pada rantai boot untuk image dan perangkat keras yang mendukungnya; periksa perilaku rilis dan firmware yang sebenarnya, jangan hanya mengandalkan asumsi dukungan.

## Ganti kredensial default

Image live MiniOS yang belum dikustomisasi menggunakan kredensial yang dipublikasikan `live` /
`evil` dan `root` / `toor`, dengan login otomatis dan akses administratif tanpa kata sandi dalam konfigurasi yang berorientasi pada kemudahan. Siapa pun yang dapat mengakses sistem mungkin bisa menggunakan kredensial tersebut, terutama jika SSH aktif.

Sebelum bergabung ke jaringan yang tidak tepercaya:

1. Atur kata sandi unik untuk user dan root di MiniOS Configurator.
2. Pilih profil keamanan yang sesuai dan tinjau setiap kontrol yang diisi.
3. Nonaktifkan SSH dan XRDP kecuali akses jarak jauh memang diperlukan.
4. Reboot ke sesi baru saat mengubah pengaturan akun atau keamanan satu kali, lalu verifikasi perilaku login dan hak akses yang dihasilkan.

Configurator menyimpan hash kata sandi terenkripsi, bukan kata sandi dalam bentuk teks. Jika mengubah akun persisten atau native yang sudah dibuat, gunakan `passwd` untuk pengguna saat ini dan `sudo passwd root` untuk root.

## Gunakan kontrol keamanan Configurator

MiniOS Configurator menyediakan tiga profil. Sebuah profil mengisi pengaturan konkret; nama profil itu sendiri tidak disimpan sebagai kunci konfigurasi runtime, dan setiap pengaturan tetap dapat diedit secara independen.

| Profil | Perilaku utama |
| --- | --- |
| `convenient` | Kompatibel autologin, sudo dan PolicyKit tanpa kata sandi, root dan SSH dengan kata sandi diizinkan, XRDP/X11/layar kunci longgar, petunjuk kata sandi ditampilkan. |
| `balanced` | Tidak ada autologin, sudo dan PolicyKit memerlukan kata sandi, login root SSH ditolak tapi SSH dengan kata sandi diizinkan, XRDP/X11/layar kunci diperketat. |
| `strict` | Tidak ada autologin, sudo dan PolicyKit memerlukan kata sandi, login root dan SSH dengan kata sandi ditolak, XRDP dinonaktifkan, X11/layar kunci diperketat, petunjuk kata sandi disembunyikan. |

Pengaturan default installer berbeda tergantung mode instalasi: instalasi live mengutamakan `convenient`, sedangkan instalasi native mengutamakan `balanced`. Ini adalah default, bukan rekomendasi untuk setiap model ancaman.

Pengaturan yang sama tersedia sebagai kunci konfigurasi terdokumentasi, termasuk `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`,
`LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`,
`LIVE_ISSUE_PASSWORD_HINTS`, dan `LIVE_LOCKSCREEN_MODE`. Utamakan penggunaan kunci ini atau Configurator daripada mengedit file sudoers, PolicyKit, display-manager, atau SSH yang dihasilkan secara manual. Lihat [Berkas konfigurasi](/configuration/Configuration-File.md). Untuk perilaku penyimpanan dan penerapan pengaturan, lihat [MiniOS Configurator](/configuration/MiniOS-Configurator.md).

Pembuatan akun, kata sandi, `LIVE_CONFIG_NOROOT`, dan postur keamanan adalah pengaturan satu kali yang digunakan saat sesi baru dibuat. Configurator menampilkan penerapan untuk setiap kontrol. Pengaturan yang dapat dikonfigurasi ulang seperti layanan akan diterapkan setelah reboot.

## Amankan akses jarak jauh

SSH dapat diaktifkan dalam image MiniOS untuk keperluan pemulihan. Pada jaringan di mana pengguna lain tidak tepercaya, anggap kredensial default yang dipublikasikan terekspos sampai Anda memastikan sebaliknya.

- Jika SSH tidak diperlukan, tambahkan `ssh` ke `DISABLE_SERVICES` di Configurator dan hapus dari `ENABLE_SERVICES` jika ada.
- Jika SSH diperlukan, tolak login root dengan `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Utamakan otentikasi kunci. Konfirmasi login kunci di koneksi terpisah sebelum mengatur `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Batasi akses masuk dengan firewall jaringan atau router, dan jangan mengekspos sistem pemulihan portabel langsung ke Internet.
- Tinjau XRDP secara terpisah. Profil ketat menonaktifkannya; profil seimbang memperketatnya tetapi tidak selalu menonaktifkan layanannya.

Parameter boot dapat menimpa nilai file konfigurasi. Periksa perilaku layanan yang tidak terduga terhadap [Parameter boot](/configuration/Boot-Parameters.md).

## Enkripsi data persisten

Data native, DynFileFS, dan persistensi raw yang tidak dienkripsi dapat dibaca oleh siapa saja yang mendapatkan perangkat tersebut. MiniOS Installer dapat mengonfigurasi kontainer LUKS terenkripsi untuk sesi live jika initrd sumber mendukung LUKS. Initrd akan membuat `changes.luks` saat boot pertama dan meminta passphrase-nya; installer tidak menerima atau menyimpan passphrase tersebut.

Persistensi LUKS melindungi isi kontainer saat kontainer dalam keadaan tertutup. Ini tidak melindungi data setelah kontainer dibuka, file boot yang tidak dienkripsi, file yang disalin ke luar kontainer, atau filesystem root native. Persistensi sesi LUKS bukanlah enkripsi root native. Gunakan passphrase yang kuat dan simpan cadangan yang sudah diuji.

Lihat [MiniOS Installer](/installation/MiniOS-Installer.md) dan [Manajemen sesi](/configuration/Session-Management.md).

## Terapkan pembaruan secara sengaja

Segarkan metadata paket dan instal pembaruan keamanan Debian pada sesi live persisten atau instalasi native menggunakan alur kerja APT seperti biasa. Perubahan APT pada sesi live baru akan hilang saat reboot. Modul dasar SquashFS bersifat read-only, jadi mengganti ISO atau modul dengan rilis MiniOS tepercaya yang lebih baru sering kali merupakan cara paling bersih untuk memperbarui sistem live dasar.

Lihat [Pembaruan perangkat lunak](/administration/Software-Updates.md) untuk alur kerja APT, modul, image, dan kernel yang terpisah.

Sebelum melakukan pembaruan besar:

- Cadangkan file penting dan sesi persisten.
- Pastikan ruang kosong yang cukup tersedia.
- Hindari menginterupsi proses penulisan atau mematikan perangkat secara paksa.
- Reboot dan verifikasi sistem yang telah diperbarui sebelum membuang media atau sesi yang sebelumnya sudah teruji.

## Perlakukan hook dan preseeding sebagai eksekusi kode

Opsi boot `hooks` dan hook live-config dapat mengeksekusi file dari filesystem root, media boot, atau URL. Hook jarak jauh, hook media yang telah dimodifikasi, dan preseed yang belum ditinjau dapat berjalan dengan hak istimewa sistem. Gunakan hanya file yang telah ditinjau dari sumber tepercaya, utamakan distribusi yang terautentikasi, dan hindari hook jarak jauh di jaringan yang tidak tepercaya. Lihat [live-config](/configuration/live-config.md) untuk urutan eksekusi dan lokasi yang didukung.

## Cadangkan dan hapus media dengan aman

Persistensi bukanlah cadangan. Simpan salinan terpisah file pengguna dan ekspor atau salin sesi saat masih sehat. Uji proses pemulihan di media yang berbeda. Matikan perangkat dengan benar sebelum melepas media penyimpanan yang dapat ditulis, dan sisakan ruang kosong untuk metadata sesi serta operasi filesystem.

Sebelum membuang perangkat, hapus data secara aman sesuai dengan teknologi penyimpanan dan sensitivitas data. Menghapus file atau sekadar memformat ulang biasanya tidak cukup untuk membuat data lama tidak dapat dipulihkan.
