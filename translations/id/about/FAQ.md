# Pertanyaan yang Sering Diajukan

## Edisi mana yang sebaiknya saya pilih, dan mengapa ada aplikasi yang tidak tersedia?

Edisi Flux menggunakan lingkungan Flux berbasis Fluxbox dan paket yang lebih sedikit.
Edisi Standard, Toolbox, dan Ultra menambahkan perangkat lunak berbeda secara bertahap, namun ketersediaannya bervariasi tergantung rilisnya. Periksa
[About MiniOS](/about/About-MiniOS.md),
[Aplikasi MiniOS](/about/MiniOS-Applications.md), dan
[daftar paket](/administration/Packages.md).

## Apakah menulis ISO sama dengan menginstal MiniOS?

Tidak. Menulis ISO akan membuat media live yang dapat di-boot. MiniOS Installer dapat memasang sistem live modular dengan opsi persistensi atau sistem native konvensional. Pilih tata letak melalui [Menginstal MiniOS](/installation/Installing-MiniOS.md) dan [MiniOS Installer](/installation/MiniOS-Installer.md).

## Apa kredensial defaultnya?

Citra live yang belum dikustomisasi menggunakan `live` / `evil` dan `root` / `toor`, serta mungkin mengizinkan login otomatis dan administrasi tanpa sandi. Ubah kredensial ini sebelum menggunakan jaringan yang tidak tepercaya; ikuti panduan [Penguatan Keamanan](/administration/Security-Hardening.md).

## Apakah menulis MiniOS ke flashdisk USB otomatis mengaktifkan persistensi?

Tidak selalu. Penulisan ISO secara langsung dan boot ISO normal dengan Ventoy tidak otomatis mengonfigurasi sesi persisten. Ikuti [Mulai Cepat](/installation/Quick-Start.md) dan [Manajemen Sesi](/configuration/Session-Management.md) sesuai metode penulisan dan boot yang dipilih.

## Apa perbedaan antara sesi aktif dan sesi berjalan?

Sesi aktif dipilih untuk boot berikutnya; sesi berjalan menyediakan
persistensi saat ini. Mengaktifkan sesi tidak akan mengganti sistem yang sedang berjalan. Lihat
[Manajemen Sesi](/configuration/Session-Management.md).

## Mengapa perubahan saya hilang setelah reboot?

Anda mungkin melakukan boot ke sesi baru, menggunakan media tanpa persistensi, memilih sesi yang berbeda, atau mematikan perangkat sebelum perubahan disimpan. Periksa sesi berjalan dan
aktif seperti dijelaskan di
[Manajemen Sesi](/configuration/Session-Management.md) dan
[Pemecahan Masalah](/administration/Troubleshooting.md).

## Apakah LUKS dan SquashFS jenis persistensi yang sama?

Tidak. LUKS menyimpan sesi ext4 yang dapat ditulis dan terenkripsi dalam sebuah container. SquashFS adalah
snapshot terkompresi yang berjalan dari layer writable berbasis RAM dan harus
disimpan sesuai kebijakannya. Lihat
[Manajemen Sesi](/configuration/Session-Management.md) dan [Penguatan Keamanan](/administration/Security-Hardening.md).

## Mengapa aplikasi atau modul Store hanya muncul setelah reboot?

Mode modul membuat modul `.sb` hanya-baca untuk boot berikutnya; ini tidak menambahkan
aplikasi ke modul stack saat ini. Pastikan lokasinya dan reboot seperti dijelaskan di [MiniOS Store](/administration/MiniOS-Store.md).

## Haruskah saya menginstal perangkat lunak dengan APT atau sebagai modul?

Gunakan APT untuk memodifikasi satu sistem berjalan atau sesi persisten. Gunakan modul untuk lapisan perangkat lunak read-only yang dimuat saat boot. Bandingkan efek dan kebutuhan penyimpanan di [Pembaruan Perangkat Lunak](/administration/Software-Updates.md) dan [Membuat Modul](/development/Creating-Modules.md).

## Bisakah saya upgrade MiniOS ke rilis baru secara langsung?

Tidak ada upgrade rilis in-place yang didukung. Jangan perlakukan upgrade rilis Debian sebagai upgrade citra MiniOS. Cadangkan data Anda dan gunakan citra yang dibuat untuk rilis target; lihat [Pembaruan Perangkat Lunak](/administration/Software-Updates.md).

## Haruskah saya menggunakan `ip=` untuk mengatur jaringan normal?

Tidak. Memberikan konfigurasi alamat sebagai `ip=<configuration>` akan memilih boot jaringan awal dan melewati media lokal. Konfigurasikan sistem yang sedang berjalan menggunakan NetworkManager atau alat jaringan yang sudah didokumentasikan. Lihat [Boot Jaringan](/installation/Network-Boot.md) dan [Konfigurasi Jaringan](/configuration/Network-Configuration.md).

## Bagaimana cara menyimpan pengaturan Wi-Fi setelah reboot?

Simpan profil NetworkManager di sesi live persisten atau instalasi native, lalu uji dengan reboot. Installer tidak membuat atau mengubah profil Wi-Fi. Lihat [Konfigurasi Jaringan](/configuration/Network-Configuration.md) dan [Manajemen Sesi](/configuration/Session-Management.md).

## Apakah MiniOS mendukung BIOS dan UEFI?

MiniOS mendukung legacy BIOS dan UEFI x86-64, namun entri firmware yang tersedia dan tata letak partisi installer tetap penting. Lihat [Menginstal MiniOS](/installation/Installing-MiniOS.md) dan gunakan [Pemulihan Boot](/administration/Boot-Recovery.md) jika sistem yang diinstal tidak dapat dijalankan.

## Bagaimana cara memverifikasi ISO?

Unduh ISO dan file `.iso.sha256` yang sesuai dari rilis resmi yang sama, lalu bandingkan checksum SHA-256 sebelum menulis atau melakukan boot. Ikuti [Memverifikasi Unduhan](/installation/Verifying-Downloads.md).

## Haruskah saya memperbaiki sesi atau filesystem yang rusak terlebih dahulu?

Cadangkan data penting dan identifikasi perangkat, filesystem, dan mount point secara tepat sebelum melakukan perubahan apa pun. Jangan pernah memperbaiki satu-satunya salinan atau sesi aktif. Mulai dari [Backup dan Pemulihan](/administration/Backup-Recovery.md), [Pemecahan Masalah](/administration/Troubleshooting.md), dan [Pemulihan Boot](/administration/Boot-Recovery.md).

## Apa saja yang perlu saya sertakan saat meminta bantuan atau melaporkan masalah?

Catat edisi dan versi, metode boot dan persistensi, perangkat keras, langkah-langkah yang dilakukan, error pertama, dan log relevan. Hapus kredensial serta data sensitif lainnya, lalu ikuti [Kumpulkan log](/administration/Troubleshooting.md)
dan laporkan bug yang dapat direproduksi di
[MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

## Haruskah saya membangun dari source atau menggunakan Image Builder?

Bangun dari source jika Anda perlu membuat seluruh sistem dan set modul MiniOS. Gunakan [MiniOS Image Builder](/development/Image-Builder.md) untuk remaster dengan panduan, atau [`minios-image-compose`](/development/Rebuilding-ISO.md) untuk menyusun pohon konten MiniOS yang sudah ada melalui command line. Lihat [Membangun MiniOS](/development/Building-MiniOS.md) untuk build dari source.
