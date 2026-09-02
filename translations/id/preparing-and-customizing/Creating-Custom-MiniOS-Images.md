---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Membuat citra MiniOS kustom

Pembuat Citra MiniOS adalah aplikasi GTK untuk meremaster citra MiniOS yang sudah ada. Aplikasi ini memilih konten dari sesi MiniOS saat ini, file ISO, atau cakram optik, menerapkan kustomisasi deklaratif, dan menggunakan `minios-image-compose` untuk menghasilkan ISO bootable yang telah diverifikasi.

Pembuat ini berjalan di dalam MiniOS. Sumber media yang dipilih tidak akan diubah.

## Pilih alur kerja yang tepat

Pembuat Citra MiniOS melakukan remaster pada citra biner MiniOS yang sudah ada. Fitur ini bukan pengganti salah satu dari alur kerja berikut:

- **Bangun MiniOS dari sumber:** gunakan `minios-live` sistem build saat mengubah daftar paket distribusi, konfigurasi build, layer kernel, artefak boot, atau rantai modul yang dibangun dari sumber secara reproducible. Lihat [Membangun MiniOS](/development/Building-MiniOS).
- **Buat modul yang dapat digunakan ulang:** gunakan `apt2sb`, `script2sb`, `chroot2sb`, atau alat modul lainnya jika hasil yang diinginkan adalah layer `.sb` mandiri. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remaster citra:** gunakan Pembuat Citra MiniOS saat memilih modul yang sudah ada, menambahkan modul eksternal yang sudah selesai, mengubah pengaturan citra yang didukung, opsional menangkap perubahan sesi, dan menerbitkan ISO baru.

Layer filesystem proyek digunakan untuk file deklaratif di root citra. Tidak menjalankan skrip, menginstal paket, atau membuka chroot. Perangkat lunak yang ingin digunakan ulang sebaiknya disiapkan sebagai modul sebelum ditambahkan ke proyek Pembuat Citra MiniOS.

## Opsi Sumber

Halaman Sumber menerima:

- Sesi MiniOS LiveKit atau dracut saat ini.
- File ISO MiniOS.
- Disk optik MiniOS.

Sumber ISO dan disk optik akan di-mount hanya-baca dengan `udisksctl`. Inventaris sumber mencatat rilis, versi, arsitektur, dukungan bootloader, ukuran, inventaris modul, dan sidik jari sumber. Jika sumber berubah setelah perencanaan, proses build akan diblokir daripada melanjutkan dengan input yang berbeda.

Penangkapan sesi selalu menggambarkan perubahan pada sesi MiniOS yang sedang berjalan. Bila ISO atau disk optik dipilih, penangkapan hanya tersedia jika sidik jari modul dasar sumber tersebut cocok dengan basis yang di-mount dari sesi yang berjalan. Memilih media eksternal tidak akan menangkap perubahan yang dibuat di sistem lain.

## Persyaratan

Pembuat Citra MiniOS membutuhkan backend `minios-image-compose` yang sesuai. Sumber file ISO dan cakram optik memerlukan `udisks2`. Membaca `/etc/live/config.conf` yang hanya root dan menangkap sesi yang dapat ditulis mungkin memerlukan `pkexec` dan agen PolicyKit desktop. Penangkapan sesi membutuhkan `savechanges` yang kompatibel dan disediakan oleh `minios-tools` versi 1.5.0 atau lebih baru.

Aplikasi dan backend komposisi tetap berjalan tanpa hak istimewa. Otorisasi dibatasi hanya untuk pembaca live-configuration tetap dan, jika dipilih, `/usr/bin/savechanges` tepercaya.

## Alur kerja proyek

### Pilih sumber

Pilih sumber dan tunggu hingga proses inventaris selesai. Tinjau identitas, arsitektur, dukungan boot, diagnostik, dan jumlah modulnya. Selesaikan kesalahan sumber sebelum melanjutkan.

### Pilih konten

Pilih modul sumber yang akan disertakan dan tambahkan modul eksternal `.sb` jika diperlukan. Modul inti dan kernel yang wajib akan dikunci. Modul yang aktif di sesi saat ini namun tidak ada di sumber yang dipilih akan ditampilkan terpisah dan tidak otomatis disertakan.

Modul tambahan harus berupa file reguler yang dapat dibaca dengan data SquashFS yang valid. Nama file duplikat atau yang hanya berbeda huruf besar/kecil serta tabrakan target akan ditolak karena runtime menentukan lapisan berdasarkan nama file.

### Konfigurasi pengaturan

Pilih jalur output dan konfigurasi MiniOS saat ini yang diperlukan. Kolom kustomisasi yang kosong atau `Keep current` akan mempertahankan perilaku sumber. Konfigurasikan hanya override yang dibutuhkan untuk citra baru, lalu tentukan apakah lapisan sesi yang dapat ditulis perlu ditangkap.

Byte dari `/etc/live/config.conf` akan disalin ke penyimpanan build privat dengan mode 0600. Data ini tidak diinterpretasi, ditampilkan, atau dicatat. Proyek saat ini harus menyertakan konfigurasi ini; proyek lama yang secara eksplisit menonaktifkannya tidak dapat melanjutkan ke Review hingga dikoreksi.

### Tinjau rencana

Review akan membuat rencana baru dari identitas input saat ini. Periksa modul yang dipilih, dikecualikan, dan tambahan, lokasi output, estimasi ruang, ringkasan kustomisasi, profil penangkapan, peringatan, serta batas hak istimewa.

Review sengaja tidak menampilkan nilai konfigurasi, argumen kernel mentah, jalur kustomisasi privat, dan jalur penangkapan yang dipilih. Hanya menampilkan jumlah, nama file, sidik jari, dan digest jika sudah cukup untuk mengikat rencana.

Jika output sudah ada, penggantian memerlukan konfirmasi. Konfirmasi ini terkait dengan perangkat, inode, ukuran, timestamp, dan SHA-256 file yang diamati. Tujuan yang berubah, pembatalan, atau upaya gagal akan menghapus persetujuan dan memerlukan review ulang.

### Bangun dan verifikasi

Build akan memvalidasi ulang setiap input yang efektif dan menjalankan `minios-image-compose` dengan daftar argumen di direktori kerja privat. ISO tetap privat hingga verifikasi struktur berhasil. Publikasi ke tujuan yang dipilih dilakukan secara atomik.

Simpan proyek jika sumber, pemilihan modul, output, dan tujuan kustomisasi akan digunakan kembali. File proyek menggunakan format JSON. Perubahan yang belum disimpan memerlukan konfirmasi sebelum membuka proyek lain atau menutup aplikasi.

## Penangkapan sesi dan privasi

Modul sumber, `/etc/live/config.conf`, dan penangkapan sesi adalah input yang independen. Jika pemilihan modul dan kustomisasi deklaratif sudah cukup, tidak perlu menangkap sesi yang dapat ditulis.

### Jangan sertakan perubahan sesi

Ini adalah pengaturan yang direkomendasikan secara default. Builder akan menggunakan modul yang dipilih, konfigurasi saat ini, pengaturan boot, dan kustomisasi citra lainnya tanpa menyalin lapisan sesi yang dapat ditulis.

### Sertakan semua perubahan sesi

Profil ini mempertahankan setiap perubahan yang dapat ditulis dari penyedia OverlayFS atau AUFS yang terdeteksi. Dapat mencakup kata sandi, kunci, token, data browser, identitas mesin, file pribadi, log, dan status file yang dihapus. Memerlukan persetujuan eksplisit dan sebaiknya tidak digunakan untuk citra yang akan diberikan ke orang lain tanpa audit terpisah.

### Hanya sertakan perubahan yang dapat digunakan ulang

Profil ini menggunakan allowlist path yang ketat untuk perangkat lunak dan pengaturan default yang aman, sambil mengabaikan data pribadi, identitas, cache, dan status log secara luas. Ini mengurangi risiko, tetapi tidak menjamin file yang diizinkan tidak mengandung rahasia. Periksa citra yang sudah jadi sebelum membagikannya.

### Pilih perubahan sesi secara manual

Jalankan `Analyze session changes`, lalu pilih minimal satu path yang sudah dinormalisasi dari inventori di memori. Direktori yang dipilih akan mewakili semua turunannya. Pengecualian yang spesifik atau merupakan induk akan menimpa pemilihan yang cocok.

Inventori berisi metadata, termasuk nama file, sehingga tetap sensitif meskipun tidak berisi isi file. Data ini hanya berada di memori dan tidak ditulis ke proyek atau disalin ke Review maupun log. Aturan include dan exclude eksplisit adalah bagian dari intent proyek dan akan disimpan; Review hanya menampilkan jumlah dan digest-nya.

Memulai analisis lain, menyegarkan atau mengubah sumber, membatalkan atau gagal, serta membuka atau membuat proyek baru akan menghapus inventori runtime. Analisis dan penangkapan dapat meminta otorisasi administrator, namun proses Pembuat Citra MiniOS dan komposisi ISO tidak berjalan dengan hak istimewa.

## Kustomisasi Citra

Pengaturan yang didukung dibatasi dan divalidasi oleh backend:

- **Default sistem:** hostname, zona waktu, target systemd default, serta layanan yang diaktifkan atau dinonaktifkan.
- **Keamanan dan akses:** sudo, PolicyKit, SSH, XRDP, X11, mode lock-screen, dan issue-hint yang di-allowlist.
- **Data pengguna:** direktori pengguna yang divalidasi relatif terhadap root dengan perilaku link atau bind, tidak keduanya.
- **Perilaku boot:** timeout dari 0 hingga 300 detik, menu sumber atau menu yang dibangun, dan entri default yang dipilih.
- **Entri boot:** template resume, new, choose, fresh, dan copy-to-RAM dapat disembunyikan, diurutkan ulang, diduplikasi, dan dikonfigurasi melalui kontrol persistence, modul, startup, lokalisasi, zRAM, dan diagnostik yang bertipe.
- **Pengaturan boot tingkat lanjut:** argumen kernel global dan per-entry yang divalidasi untuk opsi yang tidak diwakili oleh kontrol bertipe.
- **Tampilan:** latar belakang boot PNG yang divalidasi.
- **Lapisan filesystem proyek:** satu direktori nyata yang diinterpretasikan relatif terhadap root citra dan dikemas sebagai modul overlay SquashFS milik root.

Lapisan filesystem mendukung file reguler, symbolic link relatif yang aman, direktori kosong, bit eksekusi, dan timestamp. Node perangkat, socket, FIFO, crossing filesystem, link absolut atau yang keluar dari root, serta nama yang tidak aman akan ditolak. Bit hak istimewa akan dihapus dan kepemilikan pada modul yang dihasilkan dinormalisasi.

Kustomisasi boot mendukung GRUB MiniOS yang dikenali, SYSLINUX native, dan rantai SYSLINUX-ke-GRUB standar. Konfigurasi boot yang tidak didukung atau ambigu akan ditolak daripada ditebak. Build tanpa kustomisasi boot dapat mempertahankan layout sumber yang tidak dikenali oleh parser kustomisasi.

## Verifikasi output

Sebelum publikasi, `minios-image-compose` memverifikasi ISO yang dihasilkan, bukan hanya mengandalkan keluaran sukses dari `xorriso`. Pemeriksaan meliputi:

- Struktur filesystem ISO dan label volume.
- Rekaman boot BIOS dan UEFI serta area sistem.
- Konten boot, kernel, initramfs, konfigurasi, dan modul yang diperlukan.
- Kustomisasi tertanam dan atestasi penangkapan sesi jika ada.
- Digest dan struktur overlay yang dihasilkan serta modul hasil penangkapan sesi.
- Target latar belakang boot dan konfigurasi boot yang telah diubah jika dikustomisasi.

Identitas path input, mode, waktu modifikasi, dan SHA-256 dicatat sebelum build. Input yang dapat diubah akan disnapshot secara privat menggunakan reflink jika didukung; jika tidak, akan diperiksa perubahan sebelum dan sesudah penulisan ISO. Ketidaksesuaian atau kegagalan verifikasi akan mencegah publikasi.

Setelah build berhasil, catat checksum secara terpisah:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan uji boot. Booting ISO di mesin virtual sekali pakai dan uji baik BIOS maupun UEFI jika keduanya didukung. Pembuat Citra MiniOS dapat melaporkan jika QEMU atau VirtualBox terpasang, namun tidak menjalankan atau mengonfigurasi hypervisor.

## Keamanan dan pembatalan

- Pastikan media sumber hanya-baca dan tulis output ke filesystem dengan ruang kosong yang cukup untuk estimasi dan ruang sementara.
- Jangan membangun langsung di atas satu-satunya ISO yang sudah teruji. Gunakan nama output baru kecuali penggantian memang disengaja dan sudah dikonfirmasi.
- Verifikasi modul eksternal sebelum menambahkannya. Pembuat Citra MiniOS memvalidasi struktur SquashFS mereka tetapi tidak memastikan siapa pembuat kontennya.
- Sebaiknya tidak melakukan penangkapan sesi untuk citra yang akan didistribusikan. Jika penangkapan diperlukan, audit filesystem hasilnya, bukan hanya nama profilnya.
- Perlakukan file proyek sebagai data sensitif jika berisi path sumber eksplisit, path modul, path output, atau aturan penangkapan yang dipilih.

Proses inventori, build, dan verifikasi berjalan pada grup proses khusus. Permintaan pembatalan akan mengakhiri proses dan meningkat setelah masa tenggang. Proses hashing mungkin selesai sebelum pembatalan mencapai titik aman, namun hasil lama akan dibuang. Setelah publikasi atomik dimulai, proses dibiarkan selesai agar tujuan tidak sengaja tertulis setengah.

Build yang dibatalkan atau gagal tidak akan mempublikasikan ISO privatnya. Tujuan sebelumnya tetap ada kecuali pengganti yang terverifikasi sudah mencapai publikasi atomik.

## Dokumentasi terkait

- [Membangun MiniOS](/development/Building-MiniOS)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Menyusun citra ISO MiniOS dari command line

`minios-image-compose` adalah backend command-line yang disediakan bersama Pembuat Citra MiniOS. Ini menggantikan utilitas `sb2iso` yang sudah tidak digunakan. Perintah ini meremaster pohon konten MiniOS yang sudah ada, opsional mengubah set modul dan konfigurasi yang didukung, memverifikasi hasilnya, dan menerbitkan ISO bootable.

Gunakan [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) versi grafis untuk alur kerja proyek yang terpandu. Gunakan perintah ini secara langsung untuk skrip, otomasi, atau build command-line yang dapat direproduksi. Untuk build source lengkap, gunakan [Membangun MiniOS](/development/Building-MiniOS).

### Penggunaan dasar

Dari sesi live MiniOS yang sedang berjalan, buat ISO dengan sumber MiniOS yang terdeteksi dan `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Jangan tambahkan awalan `sudo` atau `pkexec` pada perintah lengkap. Proses komposisi, verifikasi, dan publikasi dijalankan sebagai pengguna saat ini. Hanya penangkapan sesi opsional yang dapat memanggil backend `/usr/bin/savechanges` yang tepercaya melalui PolicyKit.

Nama output default adalah `minios-YYYYMMDD_HHMM.iso`. Tujuan yang sudah ada akan ditolak kecuali `--overwrite` diberikan secara eksplisit.

### Pilih sumber

Tanpa `--source`, perintah akan mendeteksi konten MiniOS yang digunakan oleh sesi LiveKit atau dracut saat ini. Untuk meremaster pohon MiniOS lain yang sudah di-mount, tentukan direktori yang berisi `boot/` dan modul MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Sumber adalah input hanya-baca dan tidak pernah diubah. File ISO dan media optik harus di-mount sebelum menggunakan pohon konten MiniOS mereka melalui CLI. Pembuat Citra MiniOS versi grafis dapat me-mount sumber ini melalui `udisksctl`.

### Pilih modul

Modul tambahan `.sb` adalah argumen posisi:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Perintah ini memvalidasi setiap modul sebagai file SquashFS yang dapat dibaca dan bukan symlink.
Modul dengan nama diawali dua digit dan tanda hubung akan ditempatkan di tingkat atas MiniOS. Modul lain yang ditambahkan akan ditempatkan di `minios/modules/`. Modul dengan nama dasar yang sama (duplikat) atau hanya berbeda kapitalisasi akan ditolak.

Kecualikan path sumber dengan ekspresi reguler POSIX extended:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File boot yang diperlukan, file kernel dan initramfs, modul inti, menu boot yang dipilih, dan konfigurasi yang dipilih tidak dapat dikecualikan.

Buat modul yang dapat digunakan ulang sebelum menyusun ISO. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules) dan [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules).

### Konfigurasi dan manifest

`--config FILE` akan menginstal file reguler yang dipilih sebagai `minios/config.conf`. Default-nya adalah `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Manifest opsional harus berupa objek JSON. Label volume berisi 1 hingga 32 karakter ASCII yang dapat dicetak; label di luar set ISO 9660 yang ketat (huruf besar, angka, dan garis bawah) akan menghasilkan peringatan.

### Menangkap perubahan sesi

Penangkapan sesi bersifat opsional dan berlaku pada layer yang dapat ditulis dari sesi MiniOS yang sedang berjalan. Ini hanya diterima untuk sumber eksplisit jika sumber tersebut memiliki fingerprint base-module yang sama dengan sistem yang sedang berjalan.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profil yang tersedia:

- `exact` menangkap setiap perubahan yang dapat direpresentasikan dan dapat mencakup kredensial, data pribadi, log, status browser, dan identitas mesin.
- `clean` menggunakan allowlist yang sempit dan berorientasi pada perangkat lunak. Ini mengurangi risiko, tetapi tidak membuktikan hasilnya bebas dari data rahasia.
- `selected` menggunakan seleksi inventori yang dihasilkan oleh frontend yang kompatibel atau alur kerja `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Lebih disarankan menggunakan modul dan konfigurasi deklaratif daripada penangkapan sesi jika ISO akan dibagikan. Lihat [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) untuk model privasi dan alur review.

### Kustomisasi perilaku boot

CLI dapat mengubah layout GRUB dan SYSLINUX yang didukung:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` menerima `resume`, `new`, `choose`, `fresh`, atau `toram`.
`--menu` menerima `multilang` atau locale yang didukung seperti `en_US`, `ru_RU`, atau `de_DE`. Argumen kernel divalidasi dan ditambahkan tanpa evaluasi shell. Layout menu boot yang tidak didukung atau ambigu akan ditolak, bukan diubah berdasarkan perkiraan.

### Tambahkan artwork atau overlay filesystem

Ganti latar belakang boot dengan file PNG yang telah divalidasi:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Kemasi satu pohon direktori yang sudah disiapkan sebagai modul overlay image milik root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Overlay diinterpretasikan relatif terhadap root image. Overlay ini tidak menjalankan skrip, menginstal paket, atau membuka chroot. Link yang tidak aman, file khusus, crossing filesystem, dan tabrakan tujuan akan ditolak.

### Verifikasi dan publikasi

Sebelum dipublikasikan, `minios-image-compose` memverifikasi pohon filesystem ISO, label volume, rekaman boot BIOS dan UEFI, area sistem, file boot, modul, dan kustomisasi yang diminta. Modul overlay yang dihasilkan dan modul hasil penangkapan sesi diekstrak dan diperiksa terhadap metadata dan digest yang tercatat.

ISO dibangun di direktori privat pada filesystem tujuan dan dipublikasikan secara atomik hanya setelah verifikasi berhasil. Mutasi input, kegagalan verifikasi, pembatalan, atau ruang tujuan yang tidak cukup akan mencegah publikasi. Tujuan sebelumnya tetap tidak berubah kecuali build `--overwrite` yang disetujui secara eksplisit berhasil dipublikasikan secara atomik.

Buat checksum dan lakukan uji boot terpisah setelah build berhasil:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan pengujian jalur boot BIOS dan UEFI yang diinginkan di mesin virtual sekali pakai atau perangkat keras yang sesuai.

### Referensi perintah

Gunakan manual terinstal dan output bantuan untuk versi backend yang tepat:

```bash
minios-image-compose --help
man minios-image-compose
```

Opsi umum meliputi:

| Opsi | Tujuan |
|---|---|
| `-n`, `--name FILE` | Atur path output. |
| `-e`, `--exclude REGEX` | Kecualikan path sumber yang cocok. |
| `--source DIR` | Pilih pohon konten MiniOS secara eksplisit. |
| `--config FILE` | Pilih konfigurasi live yang tertanam di ISO. |
| `--manifest FILE` | Sertakan manifest build JSON yang telah divalidasi. |
| `--capture-changes MODE` | Tangkap perubahan sesi `exact`, `clean`, atau `selected`. |
| `--boot-timeout SECONDS` | Atur timeout menu boot dari 0 hingga 300 detik. |
| `--default-boot MODE` | Pilih aksi sesi MiniOS default. |
| `--kernel-args TEXT` | Tambahkan argumen kernel global yang telah divalidasi. |
| `--boot-background PNG` | Ganti artwork boot yang didukung. |
| `--overlay-directory DIR` | Tambahkan satu layer filesystem deklaratif. |
| `--menu TYPE` | Pilih menu multibahasa atau terlokalisasi. |
| `--overwrite` | Izinkan secara eksplisit penggantian output yang sudah ada. |

Perintah akan keluar dengan kode non-nol jika pemeriksaan sumber, modul, kustomisasi, penyimpanan, verifikasi, atau publikasi gagal. Jangan distribusikan output kecuali perintah selesai dengan sukses dan checksum serta jalur boot yang dihasilkan telah diuji.
