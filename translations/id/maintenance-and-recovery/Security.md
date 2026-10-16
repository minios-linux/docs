---
updated: 2026-10-15
---

# Keamanan

Kontrol keamanan MiniOS dirancang untuk sistem live: sesi sementara, sesi persisten, media portabel, dan konfigurasi saat boot. Penginstal MiniOS juga dapat melakukan konversi native. Sistem yang dihasilkan tetap menggunakan lingkungan desktop yang dipilih dan identitas visual MiniOS, tetapi perangkat lunak MiniOS khusus live akan dihapus. Karena itu, amankan dan kelola sistem menggunakan perangkat Debian standar, bukan dengan memperlakukannya sebagai mode live lainnya.
Lindungi sesi yang sedang berjalan, data persisten, media boot, dan konfigurasi apa pun yang diterapkan saat startup.

## Mulai dengan media tepercaya

Unduh MiniOS dari sumber resmi dan verifikasi ISO sebelum menuliskannya ke media.
Ikuti [Memverifikasi unduhan](/installing-minios/Verifying-Downloads) dan bandingkan hasilnya sebelum boot atau menginstal. Verifikasi dapat mendeteksi unduhan yang rusak atau diganti, tetapi tidak membuktikan bahwa perangkat USB yang sudah dimodifikasi aman.

Pastikan perangkat USB tetap berada dalam kendali fisik Anda. Kata sandi firmware dan pembatasan urutan boot dapat mengurangi risiko boot tanpa izin secara kasual, tetapi tidak mengenkripsi file di perangkat. Secure Boot dapat memberikan perlindungan tambahan pada rantai boot untuk image dan perangkat keras yang mendukungnya. Periksa perilaku rilis dan firmware yang sebenarnya, jangan mengasumsikan dukungan tersedia.

## Ganti kredensial default

Image live MiniOS yang belum dikustomisasi menggunakan kredensial yang dipublikasikan `live` / `evil` dan `root` / `toor`, dengan login otomatis dan akses administratif tanpa kata sandi dalam konfigurasi yang mengutamakan kemudahan. Siapa pun yang dapat mengakses sistem mungkin dapat menggunakan kredensial tersebut, terutama jika SSH aktif.

Sebelum terhubung ke jaringan yang tidak tepercaya:

1. Tetapkan kata sandi unik untuk pengguna dan root di Konfigurator MiniOS.
2. Pilih profil keamanan yang sesuai dan tinjau setiap kontrol yang telah diisi.
3. Nonaktifkan SSH dan XRDP kecuali jika akses jarak jauh diperlukan.
4. Boot ulang ke sesi baru setelah mengubah pengaturan akun sekali pakai atau keamanan, lalu verifikasi perilaku login dan hak akses yang dihasilkan.

Konfigurator menyimpan hash kata sandi terenkripsi, bukan kata sandi dalam teks biasa. Jika mengubah akun persisten yang sudah dibuat, gunakan `passwd` untuk pengguna saat ini dan `sudo passwd root` untuk root. Setelah konversi native, gunakan perangkat pengelolaan akun Debian standar.

## Gunakan kontrol keamanan Konfigurator

Konfigurator MiniOS menyediakan tiga profil. Profil mengisi pengaturan konkret; nama profil itu sendiri tidak disimpan sebagai kunci konfigurasi runtime, dan setiap pengaturan tetap dapat diedit secara terpisah.

| Profil | Perilaku utama |
| --- | --- |
| `convenient` | Kompatibel dengan login otomatis; sudo dan PolicyKit tanpa kata sandi; login SSH sebagai root dan dengan kata sandi diizinkan; XRDP/X11/layar kunci dengan pengamanan longgar; petunjuk kata sandi ditampilkan. |
| `balanced` | Login otomatis dinonaktifkan; sudo dan PolicyKit memerlukan kata sandi; login SSH sebagai root ditolak, tetapi login SSH dengan kata sandi diizinkan; XRDP/X11/layar kunci diperkuat. |
| `strict` | Login otomatis dinonaktifkan; sudo dan PolicyKit memerlukan kata sandi; login SSH sebagai root dan login dengan kata sandi ditolak; XRDP dinonaktifkan; X11/layar kunci diperkuat; petunjuk kata sandi disembunyikan. |

Default penginstal berbeda-beda menurut mode penerapan: instalasi live menggunakan `convenient`, sedangkan konversi native dimulai dengan `balanced`. Pengaturan native diterapkan selama konversi; setelah instalasi, gunakan konfigurasi keamanan Debian standar. Ini adalah nilai default, bukan rekomendasi untuk setiap model ancaman.

Pengaturan yang sama tersedia sebagai kunci konfigurasi yang terdokumentasi, termasuk `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, dan `LIVE_LOCKSCREEN_MODE`. Utamakan penggunaan kunci ini atau Konfigurator daripada mengedit file sudoers, PolicyKit, display manager, atau SSH yang dibuat secara otomatis. Lihat [File konfigurasi](/reference/configuration/config.conf).
Untuk mengetahui perilaku penyimpanan dan penerapan pengaturan, lihat [Konfigurator MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Pembuatan akun, kata sandi, `LIVE_CONFIG_NOROOT`, dan postur keamanan adalah pengaturan sekali pakai yang digunakan saat sesi baru dibuat. Konfigurator menampilkan penerapan untuk setiap kontrol. Pengaturan yang dapat dikonfigurasi ulang, seperti layanan, diterapkan setelah boot ulang.

## Akses jarak jauh yang aman

SSH dapat diaktifkan pada image MiniOS untuk keperluan pemulihan. Jika pengguna lain di jaringan tidak tepercaya, anggap kredensial default yang dipublikasikan telah diketahui orang lain sampai Anda memastikan sebaliknya.

- Jika SSH tidak diperlukan, tambahkan `ssh` ke `DISABLE_SERVICES` di Configurator dan hapus dari `ENABLE_SERVICES` jika ada.
- Jika SSH diperlukan, larang login root dengan `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Utamakan autentikasi dengan kunci. Pastikan login dengan kunci berhasil melalui koneksi terpisah sebelum menetapkan `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Batasi akses masuk dengan firewall jaringan atau router, dan jangan hubungkan sistem pemulihan portabel langsung ke Internet.
- Tinjau XRDP secara terpisah. Profil ketat menonaktifkannya; profil seimbang memperkuat keamanannya, tetapi belum tentu menonaktifkan layanannya.

Parameter boot dapat mengesampingkan nilai dalam file konfigurasi. Periksa perilaku layanan yang tidak terduga dengan merujuk ke [Parameter boot](/reference/Boot-Parameters).

## Enkripsi data persisten

Data persisten dalam format native yang tidak terenkripsi, DynFileFS, DynBlk, VMDK, raw, dan SquashFS dapat dibaca oleh siapa pun yang mendapatkan perangkat tersebut. MiniOS dapat menerapkan LUKS2 di atas Raw, DynFileFS, DynBlk, atau VMDK. LUKS2 tetap merupakan lapisan enkripsi, bukan mode sesi terpisah. Untuk membuatnya saat boot, pilih opsi ini dengan`perchencrypt=luks`; status enkripsi sesi yang sudah ada ditentukan dari metadata sesi, bukan dari penggantian melalui baris perintah yang dilakukan kemudian.

Batas enkripsi berbeda-beda menurut backend. Raw mengenkripsi image blok logis di dalam `changes.img`; DynFileFS mengenkripsi `virtual.dat` yang diekspos; DynBlk dan VMDK mengenkripsi perangkat blok yang diekspos oleh driver DynBlk. Metadata sesi, file boot, metadata backend dan deskriptor VMDK di luar perangkat blok terenkripsi, serta file lain yang tidak terkait di media tetap dapat dilihat. Kompresi backend DynBlk dinonaktifkan saat LUKS2 dipilih; VMDK tidak menyediakan kompresi backend.

Pembuatan saat boot meminta frasa sandi dua kali di initrd. Saat Installer membuat sesi terenkripsi terlebih dahulu di target, wizard-nya meminta dan mengonfirmasi frasa sandi, lalu meneruskannya ke `minios-session` melalui input standar. Frasa sandi tidak disimpan dalam konfigurasi, log, atau argumen proses. Sesi terenkripsi yang sudah ada akan meminta frasa sandi saat boot; tiga kali percobaan membuka kunci yang gagal akan menghentikan proses boot, tanpa beralih ke teks biasa, backend lain, atau pengganti di memori untuk permintaan persistensi yang sama.

Lapisan persistensi LUKS2 MiniOS melindungi isi sistem file saat mapper ditutup. Lapisan ini tidak melindungi data setelah dibuka, file boot yang tidak terenkripsi, file yang disalin ke luar backend terenkripsi, atau sistem file root native. Enkripsi persistensi berlapis bukanlah enkripsi root native. Ekspor logis berisi file sesi yang telah didekripsi, jadi lindungi arsip cadangan secara terpisah. Gunakan frasa sandi yang kuat dan simpan cadangan yang sudah diuji.

Penyimpanan cache atau jurnal sementara adalah pilihan untuk mengurangi penulisan, bukan enkripsi. Dengan persistensi tahan lama, MiniOS menyimpan `minios-boot` dan `live-config` diagnostik di penyimpanan sesi, bahkan saat `LIVE_LOG_STORAGE=volatile`. Untuk SquashFS yang tahan lama, file-file ini berada di luar `changes.sb`, di dalam direktori `boot-logs/` sesi. Dengan `perchtoram`, sesi dan diagnostiknya disimpan di memori; persistensi memerlukan penyimpanan yang berhasil ke media. Perangkat penyimpanan pendukung yang tidak terenkripsi akan mengekspos log bersama file lainnya. `LIVE_CONFIG_DEBUG=true` juga mengaktifkan pelacakan terperinci dan salinan input penggabungan akun pengguna; nonaktifkan debug untuk penggunaan biasa dan tinjau log tersebut sebelum membagikannya. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Lihat [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dan [Pengelolaan sesi](/using-minios/Sessions-and-Persistence).

## Terapkan pembaruan dengan cermat

Perbarui metadata paket dan instal pembaruan keamanan Debian di sesi live persisten menggunakan alur kerja APT biasa jika sesuai. Perubahan APT di sesi live baru akan hilang saat reboot. Modul dasar SquashFS bersifat hanya-baca, jadi mengganti ISO atau modul dengan rilis MiniOS tepercaya yang lebih baru sering kali merupakan cara paling bersih untuk memperbarui sistem live dasar. Setelah dikonversi ke native, pemeliharaan keamanan paket cukup dilakukan dengan alur kerja APT Debian biasa untuk sistem yang terinstal tersebut.

Lihat [Pembaruan perangkat lunak](/maintenance-and-recovery/Updating-MiniOS) untuk mengetahui alur kerja APT, modul, image, dan kernel yang terpisah.

Sebelum melakukan pembaruan besar:

- Cadangkan file penting dan sesi persisten.
- Pastikan ruang kosong yang tersedia cukup.
- Jangan sampai proses penulisan terhenti atau perangkat dimatikan.
- Lakukan reboot dan verifikasi sistem yang telah diperbarui sebelum menghapus media atau sesi sebelumnya yang diketahui berfungsi dengan baik.

## Perlakukan hook dan preseeding sebagai eksekusi kode

Opsi boot `hooks` dan hook live-config dapat mengeksekusi file dari sistem file root, media boot, atau URL. Hook jarak jauh, hook media yang dimodifikasi, dan preseeding yang belum ditinjau dapat berjalan dengan hak istimewa sistem. Gunakan hanya file yang telah ditinjau dari sumber tepercaya, utamakan distribusi terautentikasi, dan hindari hook jarak jauh di jaringan yang tidak tepercaya. Lihat [live-config](/reference/configuration/live-config) untuk mengetahui urutan eksekusi dan lokasi yang didukung.

## Cadangkan data dan hentikan penggunaan media penyimpanan dengan aman

Persistensi bukanlah cadangan. Simpan salinan terpisah file pengguna, lalu ekspor atau salin sesi selagi masih berfungsi dengan baik. Uji pemulihan di media lain.
Matikan perangkat dengan benar sebelum melepas penyimpanan yang dapat ditulisi, dan sisakan ruang kosong untuk metadata sesi serta operasi sistem file.

Sebelum membuang perangkat, hapus data secara aman sesuai teknologi penyimpanan dan sensitivitas data. Menghapus file atau memformat ulang saja mungkin tidak membuat data lama mustahil dipulihkan.
