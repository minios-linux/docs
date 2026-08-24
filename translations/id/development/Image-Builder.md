# MiniOS Image Builder

MiniOS Image Builder adalah aplikasi GTK untuk melakukan remastering pada image MiniOS yang sudah ada. Aplikasi ini memilih konten dari sesi MiniOS saat ini, file ISO, atau cakram optik, menerapkan kustomisasi deklaratif, dan menggunakan `minios-image-compose` untuk menghasilkan ISO bootable yang telah diverifikasi.

Builder dijalankan di dalam MiniOS. Aplikasi ini tidak mengubah media sumber yang dipilih.

## Pilih alur kerja yang tepat

Image Builder melakukan remaster pada image MiniOS biner yang sudah ada. Ini bukan pengganti untuk salah satu alur kerja berikut:

- **Membangun MiniOS dari source:** gunakan sistem build `minios-live` saat mengubah daftar paket distribusi, konfigurasi build, lapisan kernel, artefak boot, atau rantai modul yang dibangun dari source secara reproducible. Lihat [Building MiniOS](/development/Building-MiniOS.md).
- **Membuat modul yang dapat digunakan ulang:** gunakan `apt2sb`, `script2sb`, `chroot2sb`, atau alat modul lainnya jika hasil yang diinginkan adalah lapisan `.sb` yang berdiri sendiri. Lihat [Creating modules](/development/Creating-Modules.md).
- **Remaster image:** gunakan Image Builder saat memilih modul yang sudah ada, menambahkan modul eksternal yang sudah selesai, mengubah pengaturan image yang didukung, opsional menangkap perubahan sesi, dan mempublikasikan ISO baru.

Lapisan filesystem proyek digunakan untuk file deklaratif di root image. Tidak menjalankan skrip, menginstal paket, atau membuka chroot. Perangkat lunak yang ingin digunakan ulang sebaiknya disiapkan sebagai modul sebelum ditambahkan ke proyek Image Builder.

## Opsi sumber

Halaman Sumber menerima:

- Sesi MiniOS LiveKit atau dracut saat ini.
- File ISO MiniOS.
- Cakram optik MiniOS.

Sumber ISO dan cakram optik akan di-mount hanya-baca dengan `udisksctl`. Inventaris sumber mencatat rilis, versi, arsitektur, dukungan bootloader, ukuran, inventaris modul, dan fingerprint sumber. Jika sumber berubah setelah perencanaan, proses build akan diblokir daripada melanjutkan dengan input yang berbeda.

Penangkapan sesi selalu mendeskripsikan perubahan pada sesi MiniOS yang sedang berjalan. Ketika ISO atau cakram optik dipilih, penangkapan hanya tersedia jika fingerprint modul dasar sumber tersebut cocok dengan modul dasar yang di-mount dari sesi yang berjalan. Memilih media eksternal tidak akan menangkap perubahan yang dilakukan pada sistem lain.

## Persyaratan

Image Builder memerlukan backend `minios-image-compose` yang sesuai. Sumber file ISO dan cakram optik memerlukan `udisks2`. Membaca `/etc/live/config.conf` yang hanya root dan menangkap sesi yang dapat ditulis mungkin memerlukan `pkexec` serta agen PolicyKit desktop. Penangkapan sesi memerlukan `savechanges` yang kompatibel yang disediakan oleh `minios-tools` versi 1.5.0 atau lebih baru.

Aplikasi dan backend komposisi tetap tidak memiliki hak istimewa. Otorisasi dibatasi hanya untuk pembaca konfigurasi live tetap dan, jika dipilih, `/usr/bin/savechanges` yang tepercaya.

## Alur kerja proyek

### Pilih sumber

Pilih sumber dan tunggu proses inventaris selesai. Tinjau identitas, arsitektur, dukungan boot, diagnostik, dan jumlah modulnya. Selesaikan kesalahan sumber sebelum melanjutkan.

### Pilih konten

Pilih modul sumber yang ingin disertakan dan tambahkan modul eksternal `.sb` jika diperlukan. Modul inti dan kernel yang wajib akan dikunci. Modul yang aktif di sesi saat ini tetapi tidak ada di sumber yang dipilih akan ditampilkan terpisah dan tidak otomatis disertakan.

Modul tambahan harus berupa file reguler yang dapat dibaca dengan data SquashFS yang valid. Nama file yang duplikat atau berbeda hanya pada kapitalisasi serta tabrakan target akan ditolak karena runtime menyelesaikan lapisan berdasarkan nama file (basename).

### Konfigurasi pengaturan

Pilih path output dan konfigurasi MiniOS saat ini yang diperlukan. Kolom kustomisasi yang kosong atau `Keep current` akan mempertahankan perilaku sumber. Konfigurasikan hanya override yang dibutuhkan untuk image baru, lalu tentukan apakah layer sesi yang dapat ditulis perlu ditangkap.

Byte dari `/etc/live/config.conf` akan disalin ke penyimpanan build privat dengan mode 0600. Data ini tidak diinterpretasikan, ditampilkan, atau dicatat. Proyek saat ini harus menyertakan konfigurasi ini; proyek lama yang secara eksplisit menonaktifkannya tidak dapat melanjutkan ke Review hingga dikoreksi.

### Tinjau rencana

Review akan membuat rencana baru dari identitas input saat ini. Periksa modul yang dipilih, dikecualikan, dan tambahan, lokasi output, estimasi ruang, ringkasan kustomisasi, profil penangkapan, peringatan, dan batas hak istimewa.

Review secara sengaja tidak menampilkan nilai konfigurasi, argumen kernel mentah, path kustomisasi privat, dan path penangkapan yang dipilih. Review hanya menampilkan jumlah, nama file (basename), fingerprint, dan digest jika itu cukup untuk mengikat rencana.

Jika output sudah ada, penggantian memerlukan konfirmasi. Konfirmasi terikat pada perangkat, inode, ukuran, timestamp, dan SHA-256 file yang diamati. Tujuan yang berubah, pembatalan, atau upaya gagal akan menghapus persetujuan dan memerlukan review ulang.

### Build dan verifikasi

Build akan memvalidasi ulang setiap input yang efektif dan menjalankan `minios-image-compose` dengan daftar argumen di direktori kerja privat. ISO tetap privat sampai verifikasi struktural berhasil. Publikasi ke tujuan yang dipilih dilakukan secara atomik.

Simpan proyek jika sumber, pemilihan modul, output, dan tujuan kustomisasinya akan digunakan kembali. File proyek berformat JSON. Perubahan yang belum disimpan memerlukan konfirmasi sebelum membuka proyek lain atau menutup aplikasi.

## Penangkapan sesi dan privasi

Modul sumber, `/etc/live/config.conf`, dan penangkapan sesi adalah input yang independen. Jika pemilihan modul dan kustomisasi deklaratif sudah cukup, jangan tangkap layer sesi yang dapat ditulis.

### Jangan sertakan perubahan sesi

Ini adalah pilihan default yang direkomendasikan. Builder akan menggunakan modul yang dipilih, konfigurasi saat ini, pengaturan boot, dan kustomisasi image lainnya tanpa menyalin layer sesi yang dapat ditulis.

### Sertakan semua perubahan sesi

Profil ini mempertahankan setiap perubahan yang dapat ditulis dari provider OverlayFS atau AUFS yang terdeteksi. Profil ini dapat mencakup kata sandi, kunci, token, data browser, identitas mesin, file pribadi, log, dan status file yang dihapus. Memerlukan pengakuan eksplisit dan sebaiknya tidak digunakan untuk image yang akan diberikan ke orang lain tanpa audit terpisah.

### Hanya sertakan perubahan yang dapat digunakan ulang

Profil ini menggunakan allowlist path yang ketat untuk perangkat lunak dan default yang aman, sambil menghilangkan data pribadi, identitas, cache, dan status log secara luas. Ini mengurangi risiko, tetapi tidak menjamin bahwa file yang diizinkan tidak mengandung rahasia. Periksa image yang telah selesai sebelum membagikannya.

### Pilih perubahan sesi secara manual

Jalankan `Analyze session changes`, lalu pilih minimal satu path yang sudah dinormalisasi dari inventaris di memori. Direktori yang dipilih mewakili seluruh turunannya. Pengecualian yang tepat atau pada induk akan menimpa pemilihan yang cocok.

Inventaris berisi metadata, termasuk nama file, sehingga tetap sensitif meskipun tidak memuat isi file. Data ini tetap di memori dan tidak ditulis ke proyek atau disalin ke Review atau log. Aturan include dan exclude eksplisit adalah bagian dari tujuan proyek dan akan disimpan; Review hanya menampilkan jumlah dan digest-nya.

Memulai analisis lain, menyegarkan atau mengganti sumber, pembatalan atau kegagalan, serta membuka atau membuat proyek akan menghapus inventaris runtime. Analisis dan penangkapan dapat meminta otorisasi administrator, tetapi proses Image Builder dan komposisi ISO tidak berjalan dengan hak istimewa.

## Kustomisasi image

Pengaturan yang didukung dibatasi dan divalidasi oleh backend:

- **Default sistem:** hostname, zona waktu, target systemd default, serta layanan yang diaktifkan atau dinonaktifkan.
- **Keamanan dan akses:** sudo, PolicyKit, SSH, XRDP, X11, mode lock-screen, dan issue-hint yang di-allowlist.
- **Data pengguna:** direktori pengguna yang divalidasi relatif terhadap root dengan perilaku link atau bind, tidak keduanya.
- **Perilaku boot:** timeout antara 0 hingga 300 detik, menu sumber atau menu yang dikonstruksi, serta entri default yang dipilih.
- **Entri boot:** template resume, new, choose, fresh, dan copy-to-RAM dapat disembunyikan, diurutkan ulang, diduplikasi, dan dikonfigurasi melalui kontrol persistence, modul, startup, lokalisasi, zRAM, dan diagnostik yang bertipe.
- **Pengaturan boot tingkat ahli:** argumen kernel global dan per-entry yang divalidasi untuk opsi yang tidak diwakili oleh kontrol bertipe.
- **Tampilan:** gambar latar belakang boot PNG yang divalidasi.
- **Lapisan filesystem proyek:** satu direktori nyata yang diinterpretasikan relatif terhadap root image dan dikemas sebagai modul overlay SquashFS milik root.

Lapisan filesystem mendukung file reguler, symbolic link relatif yang aman, direktori kosong, bit eksekusi, dan timestamp. Node perangkat, socket, FIFO, crossing filesystem, symbolic link absolut atau yang keluar dari root, serta nama yang tidak aman akan ditolak. Bit hak istimewa akan dihapus dan kepemilikan pada modul yang dihasilkan akan dinormalisasi.

Kustomisasi boot mendukung GRUB MiniOS yang dikenali, SYSLINUX native, dan rantai SYSLINUX-ke-GRUB standar. Konfigurasi boot yang tidak didukung atau ambigu akan ditolak daripada ditebak. Build tanpa kustomisasi boot dapat mempertahankan layout sumber yang tidak dipahami oleh parser kustomisasi.

## Verifikasi output

Sebelum publikasi, `minios-image-compose` memverifikasi ISO yang dihasilkan, tidak hanya mengandalkan keluaran sukses dari `xorriso`. Pemeriksaan meliputi:

- Struktur pohon filesystem ISO dan label volume.
- Rekaman boot BIOS dan UEFI serta area sistem.
- Konten boot, kernel, initramfs, konfigurasi, dan modul yang diperlukan.
- Kustomisasi tertanam dan atestasi penangkapan sesi jika ada.
- Digest dan struktur overlay serta modul sesi yang ditangkap.
- Target latar belakang boot dan konfigurasi boot yang telah diubah jika dikustomisasi.

Identitas path input, mode, waktu modifikasi, dan SHA-256 dicatat sebelum build. Input yang dapat berubah akan di-snapshot secara privat dengan reflink jika didukung; jika tidak, akan diperiksa perubahannya sebelum dan sesudah penulisan ISO. Ketidaksesuaian atau kegagalan verifikasi akan mencegah publikasi.

Setelah build berhasil, catat checksum secara terpisah:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan uji boot. Boot-lah ISO di mesin virtual sementara dan uji baik BIOS maupun UEFI jika keduanya ingin didukung. Image Builder dapat melaporkan bahwa QEMU atau VirtualBox terinstal, tetapi tidak menjalankan atau mengonfigurasi hypervisor.

## Keamanan dan pembatalan

- Jaga media sumber tetap hanya-baca dan tulis output ke filesystem dengan ruang kosong yang cukup untuk estimasi dan ruang sementara.
- Jangan build langsung di atas ISO satu-satunya yang sudah terbukti baik. Gunakan nama output baru kecuali penggantian memang disengaja dan dikonfirmasi.
- Verifikasi modul eksternal sebelum menambahkannya. Image Builder memvalidasi struktur SquashFS-nya tetapi tidak memastikan siapa pembuat kontennya.
- Sebaiknya tidak menangkap sesi untuk image yang akan didistribusikan. Jika penangkapan diperlukan, audit filesystem hasilnya, bukan hanya nama profilnya.
- Perlakukan file proyek sebagai data sensitif jika memuat path sumber, path modul, path output, atau aturan penangkapan yang dipilih secara eksplisit.

Proses inventaris, build, dan verifikasi dijalankan dalam grup proses terpisah. Permintaan pembatalan akan mengakhiri proses dan meningkat setelah masa tenggang. Proses hashing dapat selesai sebelum pembatalan mencapai checkpoint yang aman, tetapi hasil lama akan diabaikan. Setelah publikasi atomik dimulai, proses akan dibiarkan selesai agar tujuan tidak dibiarkan setengah tertulis.

Build yang dibatalkan atau gagal tidak akan mempublikasikan ISO privatnya. Tujuan sebelumnya akan tetap ada kecuali penggantian terverifikasi telah mencapai publikasi atomik.

## Dokumentasi terkait

- [Building MiniOS](/development/Building-MiniOS.md)
- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
