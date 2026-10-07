---
updated: 2026-10-06
program_commits:
    minios-image-builder: bf84d50bfe9461f4e9300033c5855ec8fa387552
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Membuat citra MiniOS kustom

Pembuat Citra MiniOS adalah aplikasi GTK untuk melakukan remaster pada citra MiniOS yang sudah ada. Aplikasi ini memilih konten dari sesi MiniOS yang sedang berjalan, file ISO, atau cakram optik, menerapkan kustomisasi deklaratif, dan menggunakan `minios-image-compose` untuk menghasilkan ISO bootable yang sudah diverifikasi.

Builder berjalan di dalam MiniOS. Media sumber yang dipilih tidak akan diubah.

## Pilih alur kerja yang tepat

Pembuat Citra MiniOS melakukan remaster pada citra biner MiniOS yang sudah ada. Ini bukan pengganti dari kedua alur kerja berikut:

- **Bangun MiniOS dari source:** gunakan `minios-live` sistem build saat mengubah daftar paket distribusi, konfigurasi build, layer kernel, artefak boot, atau rantai modul yang dibangun dari source secara reproducible. Lihat [Membangun MiniOS](/development/Building-MiniOS).
- **Buat modul yang dapat digunakan ulang:** gunakan `apt2sb`, `script2sb`, `chroot2sb`, atau alat modul lain ketika hasil yang diinginkan adalah layer `.sb` mandiri. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remaster citra:** gunakan Pembuat Citra MiniOS saat memilih modul yang sudah ada, menambahkan modul eksternal yang sudah selesai, mengubah pengaturan citra yang didukung, opsional menangkap perubahan sesi, dan menerbitkan ISO baru.

Layer filesystem proyek digunakan untuk file deklaratif di root citra. Tidak menjalankan skrip, menginstal paket, atau membuka chroot. Perangkat lunak yang akan digunakan ulang sebaiknya disiapkan sebagai modul sebelum ditambahkan ke proyek Pembuat Citra MiniOS.

## Opsi sumber

Halaman Sumber menerima:

- Sesi LiveKit atau dracut MiniOS yang sedang berjalan.
- File ISO MiniOS.
- Cakram optik MiniOS.

Sumber ISO dan cakram optik akan di-mount hanya-baca dengan `udisksctl`. Inventaris sumber mencatat rilis, versi, arsitektur, dukungan bootloader, ukuran, inventaris modul, dan fingerprint sumber. Jika sumber berubah setelah perencanaan, proses build akan diblokir daripada melanjutkan dengan input berbeda.

Penangkapan sesi selalu mendeskripsikan perubahan pada sesi MiniOS yang sedang berjalan. Jika ISO atau cakram optik dipilih, penangkapan hanya tersedia jika fingerprint modul dasar sumber tersebut cocok dengan basis yang sedang di-mount pada sesi berjalan. Memilih media eksternal tidak akan menangkap perubahan yang dibuat di sistem lain.

## Persyaratan

Pembuat Citra MiniOS memerlukan `minios-image-compose` backend yang sesuai. Sumber file ISO dan cakram optik membutuhkan `udisks2`. Membaca `/etc/live/config.conf` yang hanya bisa diakses root dan menangkap sesi yang dapat ditulis mungkin memerlukan `pkexec` serta agen PolicyKit desktop. Penangkapan sesi membutuhkan `savechanges` yang kompatibel dari `minios-tools` versi 1.5.0 atau lebih baru.

Aplikasi dan backend komposisi tetap berjalan tanpa hak istimewa. Otorisasi hanya diberikan untuk pembaca konfigurasi live yang tetap dan, jika dipilih, `/usr/bin/savechanges` yang tepercaya.

## Alur kerja proyek

### Pilih sumber

Pilih sumber dan tunggu hingga proses inventaris selesai. Tinjau identitas, arsitektur, dukungan boot, diagnostik, dan jumlah modulnya. Selesaikan kesalahan sumber sebelum melanjutkan.

### Pilih konten

Pilih modul sumber yang ingin disertakan dan tambahkan `.sb` modul eksternal. Modul inti dan kernel yang dibutuhkan akan dikunci. Modul eksternal biasa yang aktif di sesi saat ini tetapi tidak ada di sumber yang dipilih akan ditampilkan terpisah dan tetap opsional.

Modul eksternal yang secara aktif menggantikan modul sumber pada path sistem aslinya akan diperlakukan berbeda: Pembuat Citra saat ini akan menentukan file pendukung berdasarkan perangkat dan inode, mempertahankan peran sistem aslinya, dan memasukkan pengganti tersebut sebagai modul sumber efektif, bukan sebagai duplikat opsional yang tidak terkait. Ini juga berlaku untuk path pendukung initramfs yang dipindahkan. Modul eksternal lain tetap memerlukan pemilihan eksplisit.

Modul tambahan harus berupa file reguler yang dapat dibaca dengan data SquashFS yang valid. Nama file yang duplikat atau hanya berbeda kapitalisasi serta bentrok target akan ditolak karena runtime menentukan layer berdasarkan nama file.

### Konfigurasi pengaturan

Pilih path output dan konfigurasi MiniOS yang dibutuhkan saat ini. Kolom kustomisasi yang kosong atau `Keep current` akan mempertahankan perilaku sumber. Konfigurasikan hanya override yang diperlukan untuk citra baru, lalu tentukan apakah layer sesi yang dapat ditulis perlu ditangkap.

Byte dari `/etc/live/config.conf` akan disalin ke penyimpanan build privat dengan mode 0600. File ini tidak diinterpretasikan, ditampilkan, atau dicatat. Proyek saat ini harus menyertakan konfigurasi ini; proyek lama yang secara eksplisit menonaktifkannya tidak dapat melanjutkan ke Tinjau hingga diperbaiki.

### Tinjau rencana

Tinjau akan membuat rencana baru dari identitas input saat ini. Periksa modul yang dipilih, yang dikecualikan, dan modul tambahan, lokasi output, estimasi ruang, ringkasan kustomisasi, profil penangkapan, peringatan, dan batas hak akses.

Tinjau secara sengaja tidak menampilkan nilai konfigurasi, argumen kernel mentah, path kustomisasi privat, dan path penangkapan yang dipilih. Yang ditampilkan adalah jumlah, nama file, fingerprint, dan digest jika sudah cukup untuk mengikat rencana.

Jika output sudah ada, penggantian memerlukan konfirmasi. Konfirmasi ini terkait dengan perangkat, inode, ukuran, timestamp, dan SHA-256 file yang diamati. Tujuan yang berubah, pembatalan, atau percobaan gagal akan menghapus persetujuan dan memerlukan tinjauan ulang.

### Bangun dan verifikasi

Proses build akan memvalidasi ulang setiap input efektif dan menjalankan `minios-image-compose` dengan daftar argumen di direktori kerja privat. ISO tetap privat hingga verifikasi struktural berhasil. Publikasi ke tujuan yang dipilih dilakukan secara atomik.

Simpan proyek jika sumber, pemilihan modul, output, dan tujuan kustomisasi akan digunakan kembali. File proyek berformat JSON. Perubahan yang belum disimpan memerlukan konfirmasi sebelum membuka proyek lain atau menutup aplikasi.

## Penangkapan sesi dan privasi

Modul sumber, `/etc/live/config.conf`, dan penangkapan sesi adalah input yang independen. Jika pemilihan modul dan kustomisasi deklaratif sudah cukup, jangan tangkap layer sesi yang dapat ditulis.

### Jangan sertakan perubahan sesi

Ini adalah pengaturan yang direkomendasikan secara default. Builder akan menggunakan modul yang dipilih, konfigurasi saat ini, pengaturan boot, dan kustomisasi citra lainnya tanpa menyalin layer sesi yang dapat ditulis.

### Sertakan semua perubahan sesi

Profil ini mempertahankan setiap perubahan yang dapat ditulis dari penyedia OverlayFS atau AUFS yang terdeteksi. Ini dapat mencakup kata sandi, kunci, token, data browser, identitas mesin, file pribadi, log, dan status file yang dihapus. Membutuhkan persetujuan eksplisit dan sebaiknya tidak digunakan untuk citra yang akan dibagikan ke orang lain tanpa audit terpisah.

### Hanya sertakan perubahan yang dapat digunakan ulang

Profil ini menggunakan daftar putih path yang ketat untuk perangkat lunak dan pengaturan aman, sambil mengabaikan data pribadi, identitas, cache, dan log secara umum. Ini mengurangi risiko, namun tidak menjamin file yang diizinkan benar-benar bebas dari rahasia. Periksa citra yang sudah jadi sebelum membagikannya.

### Pilih perubahan sesi secara manual

Jalankan `Analyze session changes`, lalu pilih minimal satu path yang sudah dinormalisasi dari inventaris di memori. Direktori yang dipilih mewakili seluruh isinya. Pengecualian path yang sama persis atau di atasnya akan menimpa pemilihan yang cocok.

Inventaris berisi metadata, termasuk nama file, sehingga tetap sensitif meskipun tidak berisi isi file. Data ini tetap di memori dan tidak ditulis ke proyek atau disalin ke Tinjau maupun log. Aturan include dan exclude eksplisit adalah bagian dari intent proyek dan akan disimpan; Tinjau hanya menampilkan jumlah dan digest-nya.

Memulai analisis lain, menyegarkan atau mengganti sumber, pembatalan atau kegagalan, serta membuka atau membuat proyek baru akan menghapus inventaris runtime. Analisis dan penangkapan dapat meminta otorisasi administrator, namun proses Pembuat Citra MiniOS dan komposisi ISO tidak berjalan dengan hak istimewa.

## Kustomisasi citra

Pengaturan yang didukung dibatasi dan divalidasi oleh backend:

- **Default sistem:** hostname, zona waktu, target systemd default, serta layanan yang diaktifkan atau dinonaktifkan.
- **Keamanan dan akses:** mode sudo, PolicyKit, SSH, XRDP, X11, kunci layar, dan issue-hint yang diizinkan.
- **Data pengguna:** direktori pengguna root-relatif yang sudah divalidasi dengan perilaku link atau bind, bukan keduanya.
- **Perilaku boot:** timeout dari 0 hingga 300 detik, menu sumber atau menu yang dikonstruksi, serta entri default yang dipilih.
- **Entri boot:** template resume, new, choose, fresh, dan copy-to-RAM dapat disembunyikan, diurutkan ulang, diduplikasi, dan dikonfigurasi melalui kontrol persistensi bertipe, modul, startup, lokal, zRAM, dan diagnostik. Template sesi baru saat ini menggunakan `perchdir=setup` sehingga backend persistensi dapat dipilih saat startup; jika sumber lama sudah menggunakan `perchdir=new`, selector lama tersebut tetap dipertahankan dan tidak diubah diam-diam.
- **Perilaku RAM:** penyalinan sistem (`toram`) dan penyalinan sesi persistensi (`perchtoram`) adalah kontrol yang terpisah. `perchtoram=off` akan mempertahankan persistensi di penyimpanan, `trim` menyalin sesi yang didukung yang dipilih, dan `full` meminta penyalinan sesi yang didukung secara penuh. Jika persistensi diaktifkan, menu saat ini menggunakan `trim` dengan boot sistem RAM dan `off` jika tidak, kecuali Anda memilih nilai lain. Sesi direktori native tidak disalin oleh `perchtoram`.
- **Pengaturan boot lanjutan:** argumen kernel global dan per-entri yang sudah divalidasi untuk opsi yang tidak diwakili oleh kontrol bertipe.
- **Tampilan:** latar belakang boot PNG yang sudah divalidasi.
- **Layer filesystem proyek:** satu direktori nyata yang diinterpretasikan relatif terhadap root citra dan dikemas sebagai modul overlay SquashFS milik root.

Layer filesystem mendukung file reguler, symbolic link relatif yang aman, direktori kosong, bit eksekusi, dan timestamp. Node perangkat, socket, FIFO, crossing filesystem, link absolut atau keluar, serta nama yang tidak aman akan ditolak. Bit hak istimewa akan dihapus dan kepemilikan pada modul yang dihasilkan akan dinormalisasi.

Kustomisasi boot mendukung GRUB MiniOS yang dikenali, SYSLINUX native, dan rantai SYSLINUX-ke-GRUB standar. Konfigurasi boot yang tidak didukung atau ambigu akan ditolak daripada ditebak. Build tanpa kustomisasi boot dapat mempertahankan layout sumber yang tidak dikenali oleh parser kustomisasi.

## Verifikasi output

Sebelum publikasi, `minios-image-compose` akan memverifikasi ISO yang dihasilkan, bukan hanya mengandalkan keluaran `xorriso` yang sukses. Pemeriksaan meliputi:

- Struktur pohon filesystem ISO dan label volume.
- Rekaman boot BIOS dan UEFI serta area sistem.
- Konten boot, kernel, initramfs, konfigurasi, dan modul yang dibutuhkan.
- Kustomisasi yang disematkan dan atestasi penangkapan sesi jika ada.
- Digest dan struktur modul overlay serta modul sesi yang ditangkap.
- Target latar belakang boot dan konfigurasi boot yang sudah diubah jika dikustomisasi.

Identitas path input, mode, waktu modifikasi, dan SHA-256 dicatat sebelum build. Input yang dapat berubah akan di-snapshot secara privat dengan reflink jika didukung; jika tidak, akan dicek perubahan sebelum dan sesudah penulisan ISO. Ketidakcocokan atau kegagalan verifikasi akan mencegah publikasi.

Setelah build berhasil, catat checksum secara terpisah:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan pengujian boot. Boot ISO di mesin virtual sekali pakai dan uji baik BIOS maupun UEFI jika keduanya ingin didukung. Pembuat Citra MiniOS dapat melaporkan bahwa QEMU atau VirtualBox terpasang, namun tidak menjalankan atau mengonfigurasi hypervisor.

## Keamanan dan pembatalan

- Pastikan media sumber tetap hanya-baca dan tulis output ke filesystem dengan ruang kosong yang cukup sesuai estimasi dan kebutuhan sementara.
- Jangan melakukan build langsung di atas satu-satunya ISO yang sudah teruji. Gunakan nama output baru kecuali penggantian memang disengaja dan sudah dikonfirmasi.
- Verifikasi modul eksternal sebelum menambahkannya. Pembuat Citra MiniOS akan memvalidasi struktur SquashFS-nya, namun tidak memastikan siapa pembuat isinya.
- Sebaiknya tidak menangkap sesi untuk citra yang akan didistribusikan. Jika penangkapan diperlukan, audit filesystem hasilnya, bukan hanya nama profilnya.
- Perlakukan file proyek sebagai data sensitif jika berisi path sumber, path modul, path output, atau aturan penangkapan yang eksplisit.

Proses inventaris, build, dan verifikasi dijalankan dalam grup proses khusus. Permintaan pembatalan akan mengakhiri proses dan meningkat setelah masa tenggang. Proses hashing dapat selesai sebelum pembatalan mencapai checkpoint aman, namun hasil lama akan diabaikan. Setelah publikasi atomik dimulai, proses dibiarkan selesai agar tujuan tidak setengah tertulis.

Build yang dibatalkan atau gagal tidak akan mempublikasikan ISO privatnya. Tujuan sebelumnya tetap ada kecuali penggantian yang sudah diverifikasi berhasil mencapai publikasi atomik.

## Dokumentasi terkait

- [Membangun MiniOS](/development/Building-MiniOS)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Menyusun citra ISO dari command line](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Menyusun citra ISO MiniOS dari command line

`minios-image-compose` adalah backend command-line yang disediakan bersama Pembuat Citra MiniOS. Backend ini menggantikan `sb2iso` utility yang sudah tidak digunakan. Perintah ini melakukan remaster pada pohon konten MiniOS yang sudah ada, opsional mengubah set modul dan konfigurasi yang didukung, memverifikasi hasilnya, dan menerbitkan ISO bootable.

Gunakan antarmuka grafis [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) untuk alur kerja proyek terarah. Gunakan perintah ini langsung untuk skrip, otomatisasi, atau build command-line yang dapat direproduksi. Untuk build source lengkap, gunakan [Membangun MiniOS](/development/Building-MiniOS) sebagai gantinya.

### Penggunaan dasar

Dari sesi live MiniOS yang sedang berjalan, buat ISO dengan sumber MiniOS yang terdeteksi dan `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Jangan awali perintah lengkap dengan `sudo` atau `pkexec`. Proses komposisi, verifikasi, dan publikasi dijalankan sebagai pengguna saat ini. Hanya penangkapan sesi opsional yang dapat memanggil `/usr/bin/savechanges` backend melalui PolicyKit.

Nama output default adalah `minios-YYYYMMDD_HHMM.iso`. Tujuan yang sudah ada akan ditolak kecuali `--overwrite` diberikan secara eksplisit.

### Pilih sumber

Tanpa `--source`, perintah akan mendeteksi konten MiniOS yang digunakan oleh sesi LiveKit atau dracut saat ini. Untuk remaster pohon MiniOS yang sudah di-mount, tentukan direktori yang berisi `boot/` serta modul MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Sumber adalah input hanya-baca dan tidak pernah diubah. File ISO dan media optik harus di-mount sebelum menggunakan pohon konten MiniOS-nya melalui CLI. Pembuat Citra MiniOS grafis dapat me-mount sumber ini melalui `udisksctl`.

### Pilih modul

Tambahan `.sb` modul adalah argumen posisi:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Perintah akan memvalidasi setiap modul sebagai file SquashFS yang dapat dibaca dan bukan symlink.
Modul yang namanya diawali dua digit dan tanda hubung akan ditempatkan di level atas MiniOS. Modul lain yang ditambahkan akan ditempatkan di `minios/modules/`. Nama file duplikat atau bentrok hanya berbeda kapitalisasi akan ditolak.

Kecualikan path sumber dengan ekspresi reguler POSIX extended:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File boot yang dibutuhkan, file kernel dan initramfs, modul inti, menu boot yang dipilih, dan konfigurasi yang dipilih tidak dapat dikecualikan.

Buat modul yang dapat digunakan ulang sebelum menyusun ISO. Lihat [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules) dan [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules).

### Konfigurasi dan manifest

`--config FILE` akan menginstal file reguler yang dipilih sebagai `minios/config.conf`. Default-nya adalah `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Manifest opsional harus berupa objek JSON. Label volume berisi 1 hingga 32 karakter ASCII yang dapat dicetak; label di luar set ISO 9660 yang ketat (huruf kapital, angka, dan garis bawah) akan menghasilkan peringatan.

### Tangkap perubahan sesi

Penangkapan sesi bersifat opsional dan berlaku untuk layer yang dapat ditulis dari sesi MiniOS yang sedang berjalan. Penangkapan diterima untuk sumber eksplisit hanya jika fingerprint modul dasar sumber tersebut sama dengan sistem yang sedang berjalan.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profil yang tersedia:

- `exact` akan menangkap setiap perubahan yang dapat direpresentasikan dan dapat mencakup kredensial, data pribadi, log, status browser, dan identitas mesin.
- `clean` menggunakan daftar putih yang sempit dan berorientasi perangkat lunak. Ini mengurangi risiko, namun tidak menjamin hasilnya bebas dari rahasia.
- `selected` menggunakan seleksi inventaris yang dihasilkan oleh frontend yang kompatibel atau `savechanges` workflow.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Utamakan modul dan konfigurasi deklaratif daripada penangkapan sesi jika ISO akan dibagikan. Lihat [Pembuat Citra MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) untuk model privasi dan alur tinjauan.

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

`--default-boot` menerima `resume`, `new`, `choose`, `fresh`, atau `toram`. Template semantik `new` akan dipetakan ke `perchdir=setup` pada menu MiniOS saat ini, sedangkan entri sumber lama `perchdir=new` tetap dikenali. Konstruktor menu boot grafis juga mempertahankan `perchtoram=off|trim|full` secara independen dari pengaturan sistem `toram`.
`--menu` menerima `multilang` atau locale yang didukung seperti `en_US`, `ru_RU`, atau `de_DE`. Argumen kernel akan divalidasi dan ditambahkan tanpa evaluasi shell. Layout menu boot yang tidak didukung atau ambigu akan ditolak daripada diubah secara tebakan.

### Tambahkan artwork atau overlay filesystem

Ganti latar belakang boot dengan file PNG yang sudah divalidasi:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Kemas satu pohon direktori yang sudah disiapkan sebagai modul overlay citra milik root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Overlay diinterpretasikan relatif terhadap root citra. Tidak menjalankan skrip, menginstal paket, atau membuka chroot. Link tidak aman, file khusus, crossing filesystem, dan bentrok tujuan akan ditolak.

### Verifikasi dan publikasi

Sebelum publikasi, `minios-image-compose` akan memverifikasi pohon filesystem ISO, label volume, rekaman boot BIOS dan UEFI, area sistem, file boot, modul, dan kustomisasi yang diminta. Modul overlay yang dihasilkan dan modul sesi yang ditangkap akan diekstrak dan diperiksa terhadap metadata serta digest yang dicatat.

ISO dibangun di direktori privat pada filesystem tujuan dan hanya akan dipublikasikan secara atomik setelah verifikasi berhasil. Mutasi input, kegagalan verifikasi, pembatalan, atau ruang tujuan yang tidak cukup akan mencegah publikasi. Tujuan sebelumnya tetap tidak berubah kecuali build `--overwrite` yang sudah disetujui secara eksplisit berhasil mencapai publikasi atomik.

Buat checksum dan lakukan pengujian boot terpisah setelah build berhasil:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan pengujian jalur BIOS dan UEFI pada mesin virtual sekali pakai atau perangkat keras yang sesuai.

### Referensi perintah

Gunakan manual terpasang dan output bantuan untuk versi backend yang tepat:

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
| `--config FILE` | Pilih konfigurasi live yang disematkan dalam ISO. |
| `--manifest FILE` | Sertakan manifest build JSON yang sudah divalidasi. |
| `--capture-changes MODE` | Tangkap `exact`, `clean`, atau `selected` perubahan sesi. |
| `--boot-timeout SECONDS` | Atur timeout menu boot dari 0 hingga 300 detik. |
| `--default-boot MODE` | Pilih aksi sesi MiniOS default. |
| `--kernel-args TEXT` | Tambahkan argumen kernel global yang sudah divalidasi. |
| `--boot-background PNG` | Ganti artwork boot yang didukung. |
| `--overlay-directory DIR` | Tambahkan satu layer filesystem deklaratif. |
| `--menu TYPE` | Pilih menu multibahasa atau terlokalisasi. |
| `--overwrite` | Izinkan penggantian output yang sudah ada secara eksplisit. |

Perintah akan keluar dengan kode nonzero jika pemeriksaan sumber, modul, kustomisasi, penyimpanan, verifikasi, atau publikasi gagal. Jangan distribusikan output kecuali perintah selesai dengan sukses dan checksum serta jalur boot hasilnya sudah diuji.
