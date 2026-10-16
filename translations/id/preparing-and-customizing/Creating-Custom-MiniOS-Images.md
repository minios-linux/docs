---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Membuat image MiniOS kustom

Pembuat Citra MiniOS adalah aplikasi GTK untuk meremaster image MiniOS yang sudah ada. Aplikasi ini memilih konten dari sesi MiniOS aktif, file ISO, atau disk optik, menerapkan kustomisasi deklaratif, dan menggunakan `minios-image-compose` untuk menghasilkan ISO bootable yang terverifikasi.

Pembuat ini berjalan di dalam MiniOS. Media sumber yang dipilih tidak diubah.

## Pilih alur kerja yang tepat

Pembuat Citra MiniOS melakukan remaster pada image binary MiniOS yang sudah ada. Aplikasi ini bukan pengganti untuk kedua alur kerja berikut:

- **Bangun MiniOS dari sumber:** gunakan `minios-live` build system saat mengubah daftar paket distribusi, konfigurasi build, lapisan kernel, artefak boot, atau rangkaian modul reproducible yang dibangun dari sumber. Lihat [Membangun MiniOS](/development/Building-MiniOS).
- **Buat modul yang dapat digunakan kembali:** gunakan `apt2sb`, `script2sb`, `chroot2sb`, atau alat modul lainnya jika hasil yang diinginkan adalah lapisan `.sb`. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Lakukan remaster pada image:** gunakan Pembuat Citra MiniOS untuk memilih modul yang sudah ada, menambahkan modul eksternal yang sudah selesai, mengubah pengaturan image yang didukung, mengambil perubahan sesi secara opsional, dan menerbitkan ISO lain.

Lapisan sistem file proyek digunakan untuk file deklaratif di root image. Lapisan ini tidak menjalankan skrip, menginstal paket, atau membuka chroot. Perangkat lunak yang akan digunakan kembali sebaiknya disiapkan sebagai modul sebelum ditambahkan ke proyek Pembuat Citra MiniOS.

## Opsi sumber

Halaman Sumber menerima:

- Sesi LiveKit atau dracut MiniOS yang sedang berjalan.
- File ISO MiniOS.
- Cakram optik MiniOS.

Sumber ISO dan cakram optik dipasang hanya-baca dengan `udisksctl`. Inventaris sumber mencatat rilis, versi, arsitektur, dukungan bootloader, ukuran, inventaris modul, dan sidik jari sumber. Jika sumber berubah setelah perencanaan, proses build akan diblokir alih-alih dilanjutkan dengan masukan yang berbeda.

Di builder grafis, pengambilan sesi hanya tersedia jika menggunakan **sesi MiniOS yang sedang berjalan** sebagai sumber, dengan semua modul sumber dan semua modul eksternal aktif disertakan. Fitur ini tidak tersedia untuk file ISO atau cakram optik yang dipilih secara terpisah, sekalipun memuat rilis yang sama. Jangan batalkan pilihan lapisan sumber saat mengambil sesi yang dapat ditulis, karena perubahannya bergantung pada basis yang sedang berjalan secara utuh.

## Persyaratan

Pembuat Citra MiniOS memerlukan `minios-image-compose`backend yang sesuai. Sumber file ISO dan cakram optik memerlukan `udisks2`. Membaca `/etc/live/config.conf` dan mengambil sesi yang dapat ditulis mungkin memerlukan `pkexec` serta agen PolicyKit desktop. Pengambilan sesi memerlukan `savechanges` yang disediakan oleh `minios-tools` versi 1.5.0 atau yang lebih baru.

Aplikasi dan backend komposisi tetap tidak memiliki hak istimewa. Otorisasi dibatasi pada pembaca konfigurasi langsung yang tetap dan, jika dipilih, `/usr/bin/savechanges` tepercaya.

## Alur kerja proyek

### Pilih sumber

Pilih sumber dan tunggu hingga inventaris selesai. Tinjau identitas, arsitektur, dukungan boot, diagnostik, dan jumlah modulnya. Atasi kesalahan pada sumber sebelum melanjutkan.

### Pilih konten

Pilih modul sumber yang akan disertakan dan tambahkan `.sb` modul eksternal yang diperlukan. Modul inti dan kernel yang wajib disertakan tidak dapat diubah. Modul eksternal biasa yang aktif di sesi saat ini tetapi tidak ada dalam sumber yang dipilih ditampilkan secara terpisah dan hanya disertakan jika dipilih.

Modul eksternal yang secara aktif menggantikan modul sumber di jalur sistem aslinya ditangani secara berbeda: Image Builder saat ini mencari file pendukung berdasarkan perangkat dan inode, mempertahankan peran sistem aslinya, dan menyertakan pengganti tersebut sebagai modul sumber yang efektif, bukan menampilkannya sebagai duplikat opsional yang tidak terkait. Hal ini juga mencakup jalur file pendukung initramfs yang dipindahkan. Modul eksternal lainnya tetap harus dipilih secara eksplisit.

Modul tambahan harus berupa file reguler yang dapat dibaca dan memiliki data SquashFS yang valid. Nama dasar yang duplikat atau sama jika huruf besar-kecil diabaikan, serta konflik target, akan ditolak karena runtime menyelesaikan lapisan berdasarkan nama dasar.

### Konfigurasikan pengaturan

Pilih jalur output dan konfigurasi MiniOS yang wajib digunakan saat ini. Kolom kustomisasi yang kosong atau `Keep current` akan mempertahankan perilaku sumber. Konfigurasikan hanya penggantian yang diperlukan untuk image baru, lalu tentukan apakah lapisan sesi yang dapat ditulis perlu disertakan.

Byte `/etc/live/config.conf` akan disalin ke penyimpanan build privat dengan mode 0600. Byte tersebut tidak ditafsirkan, ditampilkan, atau dicatat dalam log. Proyek saat ini harus menyertakan konfigurasi ini; proyek lama yang secara eksplisit menonaktifkannya tidak dapat melanjutkan ke Tinjauan sebelum diperbaiki.

### Tinjau rencana

Peninjauan membuat rencana baru berdasarkan identitas input saat ini. Periksa modul yang dipilih, dikecualikan, dan ditambahkan, lokasi output, perkiraan ruang, ringkasan kustomisasi, profil capture, peringatan, dan batas hak akses.

Peninjauan sengaja tidak menampilkan nilai konfigurasi, argumen kernel mentah, jalur kustomisasi privat, dan jalur capture yang dipilih. Peninjauan menampilkan jumlah, nama dasar, sidik jari, dan digest jika informasi tersebut cukup untuk mengikat rencana.

Jika output sudah ada, penggantian memerlukan konfirmasi. Konfirmasi terkait dengan perangkat, inode, ukuran, stempel waktu, dan SHA-256 file yang teramati. Perubahan tujuan, pembatalan, atau upaya yang gagal akan menghapus persetujuan sehingga peninjauan harus dilakukan lagi.

### Bangun dan verifikasi

Proses build memvalidasi ulang setiap input efektif dan menjalankan `minios-image-compose` dengan daftar argumen di direktori kerja privat. ISO tetap privat hingga verifikasi struktural berhasil. Publikasi ke tujuan yang dipilih dilakukan secara atomik.

Simpan proyek jika sumber, pilihan modul, output, dan tujuan kustomisasi akan digunakan kembali. File proyek berformat JSON. Perubahan yang belum disimpan memerlukan konfirmasi sebelum membuka proyek lain atau menutup aplikasi.

## Capture sesi dan privasi

Modul sumber, `/etc/live/config.conf`, dan capture sesi merupakan input yang terpisah. Jika pilihan modul dan kustomisasi deklaratif sudah memadai, jangan capture sesi yang dapat ditulis.

### Jangan sertakan perubahan sesi

Ini adalah pengaturan default yang direkomendasikan. Builder menggunakan modul yang dipilih, konfigurasi saat ini, pengaturan boot, dan kustomisasi image lainnya tanpa menyalin lapisan sesi yang dapat ditulis.

### Sertakan semua perubahan sesi

Profil ini mempertahankan setiap perubahan yang dapat ditulis dan didukung dari penyedia OverlayFS atau AUFS yang terdeteksi. Perubahan tersebut dapat mencakup kata sandi, kunci, token, data browser, identitas mesin, file pribadi, log, dan status file yang dihapus. Profil ini memerlukan persetujuan eksplisit dan sebaiknya tidak digunakan untuk citra yang ditujukan bagi orang lain tanpa audit terpisah.

### Sertakan hanya perubahan yang dapat digunakan kembali

Profil ini menggunakan daftar izin jalur yang ketat untuk perangkat lunak dan pengaturan default yang aman, sekaligus mengecualikan sebagian besar data pribadi, identitas, cache, dan log. Profil ini mengurangi paparan, tetapi tidak menjamin bahwa file yang diizinkan bebas dari rahasia. Periksa citra yang telah selesai sebelum membagikannya.

### Pilih perubahan sesi secara manual

Jalankan `Analyze session changes`, lalu pilih setidaknya satu jalur yang telah dinormalisasi dari inventaris dalam memori. Direktori yang dipilih mencakup semua turunannya. Pengecualian yang tepat atau berada di direktori induk akan mengesampingkan pilihan yang cocok.

Inventaris ini berisi metadata, termasuk nama file, sehingga tetap sensitif meskipun tidak berisi konten file. Inventaris disimpan dalam memori dan tidak ditulis ke proyek atau disalin ke Tinjauan maupun log. Aturan penyertaan dan pengecualian eksplisit mencerminkan maksud proyek dan disimpan; Tinjauan hanya menampilkan jumlah dan digest-nya.

Memulai analisis lain, menyegarkan atau mengubah sumber, membatalkan atau mengalami kegagalan, serta membuka atau membuat proyek akan menghapus inventaris runtime. Analisis dan pengambilan data mungkin meminta otorisasi administrator, tetapi proses Pembuat Citra MiniOS dan penyusunan ISO tidak dijalankan dengan hak istimewa yang ditingkatkan.

## Kustomisasi citra

Pengaturan yang didukung dibatasi dan divalidasi oleh backend:

- **Default sistem:** nama host, zona waktu, target systemd default, serta layanan yang diaktifkan atau dinonaktifkan.
- **Keamanan dan akses:** mode sudo, PolicyKit, SSH, XRDP, X11, layar kunci, dan petunjuk masalah yang dibatasi oleh daftar izin.
- **Data pengguna:** direktori pengguna relatif terhadap root yang telah divalidasi, dengan perilaku link atau bind, bukan keduanya.
- **Perilaku boot:** batas waktu 0 hingga 300 detik, menu sumber atau menu yang dibuat, serta entri default yang dipilih.
- **Entri boot:** templat resume, new, choose, fresh, dan copy-to-RAM dapat disembunyikan, diurutkan ulang, diduplikasi, dan dikonfigurasi melalui kontrol persistensi, modul, startup, lokalisasi, zRAM, dan diagnostik yang bertipe. Templat sesi baru saat ini menggunakan `perchdir=setup` agar backend persistensi dapat dipilih saat startup; jika sumber lama sudah menggunakan `perchdir=new`, pemilih lama tersebut akan dipertahankan, bukan diubah secara diam-diam.
- **Perilaku RAM:** penyalinan sistem (`toram`) dan penyalinan sesi persistensi (`perchtoram`) adalah kontrol yang terpisah. `perchtoram=off` mempertahankan persistensi di penyimpanan, `trim` menyalin sesi yang didukung dan dipilih, sedangkan `full` meminta penyalinan seluruh sesi yang didukung. Jika persistensi diminta, boot sistem RAM secara default menggunakan `trim` kecuali nilai lain dipilih. Data direktori native tidak disalin: biasanya initrd akan memulai kontainer kosong baru untuk permintaan tersebut. Gunakan `perchtoram=off` untuk mempertahankan data native di penyimpanan.
- **Pengaturan boot lanjutan:** argumen kernel global dan per entri yang telah divalidasi untuk opsi yang tidak tersedia melalui kontrol bertipe.
- **Tampilan:** latar belakang boot PNG yang telah divalidasi.
- **Lapisan sistem file proyek:** satu direktori nyata yang ditafsirkan relatif terhadap root citra dan dikemas sebagai modul overlay SquashFS milik root.

Lapisan sistem file mendukung file biasa, tautan simbolis relatif yang aman, direktori kosong, bit eksekusi, dan stempel waktu. Node perangkat, soket, FIFO, lintas sistem file, tautan absolut atau yang keluar dari jalur, serta nama yang tidak aman akan ditolak. Bit hak istimewa dihapus dan kepemilikan dalam modul yang dihasilkan dinormalisasi.

Kustomisasi boot mendukung GRUB MiniOS yang dikenali, SYSLINUX native, serta rantai standar SYSLINUX-ke-GRUB. Konfigurasi boot yang tidak didukung atau ambigu akan ditolak, bukan ditebak. Build tanpa kustomisasi boot dapat mempertahankan tata letak sumber yang tidak dipahami oleh parser kustomisasi.

## Verifikasi output

Sebelum dipublikasikan, `minios-image-compose` memverifikasi ISO yang dihasilkan, bukan hanya mengandalkan keberhasilan proses `xorriso` saja. Pemeriksaan mencakup:

- Pohon sistem file ISO dan label volume.
- Record boot BIOS dan UEFI serta area sistem.
- Konten boot, kernel, initramfs, konfigurasi, dan modul yang diperlukan.
- Pengesahan kustomisasi tertanam dan pengambilan sesi, jika ada.
- Digest dan struktur overlay yang dihasilkan serta modul sesi yang direkam.
- Target latar belakang boot dan konfigurasi boot yang diubah jika dikustomisasi.

Identitas jalur input, mode, waktu modifikasi, dan SHA-256 dicatat sebelum build. Input yang dapat berubah disalin ke snapshot privat menggunakan reflink jika didukung; jika tidak, perubahan pada input diperiksa sebelum dan sesudah penulisan ISO. Ketidakcocokan atau kegagalan verifikasi akan mencegah publikasi.

Setelah build berhasil, catat checksum secara terpisah:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Verifikasi struktural bukan pengganti pengujian boot. Boot ISO di mesin virtual sementara dan uji BIOS serta UEFI jika keduanya memang didukung. MiniOS Pembuat Citra dapat melaporkan bahwa QEMU atau VirtualBox terinstal, tetapi tidak menjalankan atau mengonfigurasi hypervisor.

## Keamanan dan pembatalan

- Pastikan media sumber bersifat hanya-baca dan tulis output ke sistem file dengan ruang kosong yang cukup untuk perkiraan kebutuhan serta ruang sementara.
- Jangan build langsung di atas satu-satunya ISO yang diketahui berfungsi dengan baik. Gunakan nama output baru, kecuali jika penggantian memang disengaja dan sudah dikonfirmasi.
- Verifikasi modul eksternal sebelum menambahkannya. MiniOS Pembuat Citra memvalidasi struktur SquashFS-nya, tetapi tidak memastikan siapa yang membuat kontennya.
- Sebaiknya jangan mengambil sesi untuk citra yang akan didistribusikan. Jika pengambilan sesi diperlukan, audit sistem file yang dihasilkan, bukan hanya nama profilnya.
- Perlakukan file proyek sebagai informasi sensitif jika berisi jalur sumber, jalur modul, jalur output, atau aturan pengambilan yang dipilih.

Subproses inventarisasi, build, dan verifikasi berjalan dalam grup proses khusus. Permintaan pembatalan akan menghentikan proses dan meningkatkan tindakan setelah masa tunggu. Proses hashing mungkin selesai sebelum pembatalan mencapai titik aman, tetapi hasil yang sudah kedaluwarsa akan dibuang. Setelah publikasi atomik dimulai, proses dibiarkan selesai agar tujuan tidak sengaja dibiarkan dalam keadaan tertulis sebagian.

Build yang dibatalkan atau gagal tidak akan memublikasikan ISO privatnya. Tujuan sebelumnya tetap utuh, kecuali jika penggantian terverifikasi telah mencapai tahap publikasi atomik.

## Dokumentasi terkait

- [Membangun MiniOS](/development/Building-MiniOS)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## Menyusun citra ISO MiniOS dari command line

`minios-image-compose` adalah backend command line yang disertakan bersama Pembuat Citra MiniOS. Backend ini menggantikan `sb2iso` utility yang sudah dihentikan. Perintah ini membuat ulang pohon konten MiniOS yang sudah ada, secara opsional mengubah kumpulan modul dan konfigurasi yang didukung, memverifikasi hasilnya, lalu memublikasikan ISO yang dapat di-boot.

Gunakan [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) untuk alur kerja proyek terpandu. Gunakan perintah ini secara langsung untuk skrip, otomatisasi, atau build command line yang dapat direproduksi. Untuk build sumber lengkap, gunakan [Membangun MiniOS](/development/Building-MiniOS) sebagai gantinya.

### Penggunaan dasar

Dari sesi MiniOS yang sedang berjalan, buat ISO dengan sumber MiniOS yang ditemukan dan `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Jangan awali seluruh perintah dengan `sudo` atau `pkexec`. Penyusunan, verifikasi, dan publikasi berjalan sebagai pengguna saat ini. Hanya pengambilan sesi opsional yang dapat menggunakan backend tepercaya `/usr/bin/savechanges` melalui PolicyKit.

Nama output default adalah `minios-YYYYMMDD_HHMM.iso`. Tujuan yang sudah ada akan ditolak kecuali `--overwrite` diberikan secara eksplisit.

### Pilih sumber

Tanpa `--source`, perintah akan menemukan konten MiniOS yang digunakan oleh sesi LiveKit atau dracut saat ini. Untuk membuat ulang tree MiniOS lain yang sudah di-mount, tentukan direktori yang berisi `boot/` dan modul MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Sumber hanya dibaca dan tidak pernah diubah. File ISO dan media optik harus di-mount sebelum menggunakan tree kontennya yang MiniOS dengan CLI. Pembuat Citra MiniOS berbasis GUI dapat me-mount sumber ini melalui `udisksctl`.

### Pilih modul

Modul tambahan `.sb` adalah argumen posisi:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Perintah memvalidasi setiap modul sebagai file SquashFS yang dapat dibaca dan bukan symlink.
Modul dengan nama yang diawali dua digit dan tanda hubung ditempatkan di tingkat teratas MiniOS. Modul tambahan lainnya ditempatkan di `minios/modules/`. Nama dasar duplikat atau yang bentrok tanpa membedakan huruf besar-kecil akan ditolak.

Kecualikan jalur sumber menggunakan ekspresi reguler extended POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File boot yang wajib, file kernel dan initramfs, modul inti, menu boot yang dipilih, serta konfigurasi yang dipilih tidak dapat dikecualikan.

Buat modul yang dapat digunakan kembali sebelum menyusun ISO. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules) dan [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules).

### Konfigurasi dan manifest

`--config FILE` memasang file reguler yang dipilih sebagai `minios/config.conf`. Nilai default-nya adalah `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Manifest opsional harus berupa objek JSON. Label volume berisi 1 hingga 32 karakter ASCII yang dapat dicetak; label yang tidak hanya menggunakan huruf besar, digit, dan garis bawah sesuai standar ISO 9660 yang ketat akan memunculkan peringatan.

### Rekam perubahan sesi

Perekaman sesi bersifat opsional dan berlaku untuk lapisan yang dapat ditulis pada sesi MiniOS yang sedang berjalan. Perekaman hanya diterima untuk sumber yang ditentukan secara eksplisit jika sumber tersebut memiliki sidik jari base module yang sama dengan sistem yang sedang berjalan.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profil yang tersedia:

- `exact` merekam semua perubahan yang dapat direpresentasikan dan dapat mencakup kredensial, data pribadi, log, status browser, dan identitas mesin.
- `clean` menggunakan allowlist berfokus pada perangkat lunak. Cara ini mengurangi paparan, tetapi tidak menjamin bahwa hasilnya bebas dari rahasia.
- `selected` menggunakan pilihan inventaris yang dihasilkan oleh frontend yang kompatibel atau `savechanges` workflow.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Utamakan modul dan konfigurasi deklaratif daripada perekaman sesi jika ISO akan dibagikan. Lihat [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) untuk mengetahui model privasi dan alur peninjauannya.

### Sesuaikan perilaku boot

CLI dapat mengubah tata letak GRUB dan SYSLINUX yang didukung:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` menerima `resume`, `new`, `choose`, `fresh`, atau `toram`. Template semantik `new` dipetakan ke `perchdir=setup` pada menu MiniOS saat ini, sedangkan sumber lama `perchdir=new` tetap dikenali. Konstruktor menu boot grafis juga mempertahankan `perchtoram=off|trim|full` secara terpisah dari pengaturan sistem `toram`.
`--menu` menerima `multilang` atau lokal yang didukung seperti `en_US`, `ru_RU`, atau `de_DE`. Argumen kernel divalidasi dan ditambahkan tanpa evaluasi shell. Tata letak menu boot yang tidak didukung atau ambigu akan ditolak, bukan diubah berdasarkan tebakan.

### Tambahkan artwork atau filesystem overlay

Ganti latar belakang boot dengan PNG yang telah divalidasi:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Kemas satu pohon direktori yang telah disiapkan sebagai modul overlay image milik root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Overlay ditafsirkan relatif terhadap root image. Overlay tidak menjalankan skrip, menginstal paket, atau membuka chroot. Tautan yang tidak aman, file khusus, perpindahan lintas filesystem, dan benturan tujuan akan ditolak.

### Verifikasi dan publikasi

Sebelum publikasi, `minios-image-compose` memverifikasi pohon filesystem ISO, label volume, catatan boot BIOS dan UEFI, area sistem, file boot, modul, serta penyesuaian yang diminta. Modul overlay yang dibuat dan modul sesi yang direkam diekstrak, lalu diperiksa berdasarkan metadata dan digest yang tercatat.

ISO dibuat di direktori privat pada filesystem tujuan dan dipublikasikan secara atomik hanya setelah verifikasi berhasil. Perubahan pada input, kegagalan verifikasi, pembatalan, atau ruang tujuan yang tidak mencukupi akan mencegah publikasi. Tujuan sebelumnya tidak akan berubah kecuali `--overwrite` build yang disetujui secara eksplisit mencapai tahap publikasi atomik.

Buat checksum dan lakukan pengujian boot terpisah setelah build berhasil:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan pengujian jalur BIOS dan UEFI yang diinginkan di mesin virtual sekali pakai atau pada perangkat keras yang sesuai.

### Referensi perintah

Gunakan manual yang terinstal dan output bantuan untuk versi backend yang tepat:

```bash
minios-image-compose --help
man minios-image-compose
```

Opsi umum meliputi:

| Opsi | Tujuan |
|---|---|
| `-n`, `--name FILE` | Atur lokasi output. |
| `-e`, `--exclude REGEX` | Kecualikan jalur sumber yang cocok. |
| `--source DIR` | Pilih pohon konten MiniOS tertentu. |
| `--config FILE` | Pilih konfigurasi aktif yang disematkan dalam ISO. |
| `--manifest FILE` | Sertakan manifes build JSON yang telah divalidasi. |
| `--capture-changes MODE` | Ambil `exact`, `clean`, atau `selected` perubahan sesi. |
| `--boot-timeout SECONDS` | Atur batas waktu menu boot dari 0 hingga 300 detik. |
| `--default-boot MODE` | Pilih tindakan sesi default MiniOS. |
| `--kernel-args TEXT` | Tambahkan argumen kernel global yang telah divalidasi. |
| `--boot-background PNG` | Ganti artwork boot yang didukung. |
| `--overlay-directory DIR` | Tambahkan satu lapisan sistem berkas deklaratif. |
| `--menu TYPE` | Pilih menu multibahasa atau yang telah dilokalkan. |
| `--overwrite` | Izinkan secara eksplisit penggantian output yang sudah ada. |

Perintah akan keluar dengan kode nonzero jika pemeriksaan sumber, modul, kustomisasi, penyimpanan, verifikasi, atau publikasi gagal. Jangan distribusikan output kecuali perintah berhasil diselesaikan dan checksum serta jalur boot hasilnya telah diuji.
