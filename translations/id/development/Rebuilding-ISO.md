---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Membuat Citra ISO MiniOS dari Command Line

`minios-image-compose` adalah backend command-line yang disediakan bersama MiniOS Image Builder. Perintah ini menggantikan utilitas `sb2iso` yang sudah tidak digunakan lagi. Perintah ini melakukan remaster pada pohon konten MiniOS yang sudah ada, secara opsional mengubah set modul dan konfigurasi yang didukung, memverifikasi hasilnya, dan menerbitkan ISO yang dapat di-boot.

Gunakan [MiniOS Image Builder](/development/Image-Builder.md) versi grafis untuk alur kerja proyek yang terarah. Gunakan perintah ini secara langsung untuk skrip, otomasi, atau build command-line yang dapat direproduksi. Untuk build dari sumber secara lengkap, gunakan [Building MiniOS](/development/Building-MiniOS.md).

## Penggunaan dasar

Dari sesi live MiniOS yang sedang berjalan, buat ISO dengan sumber MiniOS yang terdeteksi dan `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Jangan tambahkan awalan `sudo` atau `pkexec` pada perintah lengkap. Proses komposisi, verifikasi, dan publikasi dijalankan sebagai pengguna saat ini. Hanya penangkapan sesi opsional yang dapat memanggil backend tepercaya `/usr/bin/savechanges` melalui PolicyKit.

Nama output default adalah `minios-YYYYMMDD_HHMM.iso`. Tujuan yang sudah ada akan ditolak kecuali `--overwrite` diberikan secara eksplisit.

## Pilih sumber

Tanpa `--source`, perintah akan mendeteksi konten MiniOS yang digunakan oleh sesi LiveKit atau dracut saat ini. Untuk melakukan remaster pada pohon MiniOS yang sudah ter-mount, tentukan direktori yang berisi `boot/` dan modul MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

Sumber hanya digunakan sebagai input read-only dan tidak pernah diubah. File ISO dan media optik harus di-mount sebelum menggunakan pohon konten MiniOS-nya melalui CLI. Image Builder grafis dapat melakukan mount sumber-sumber ini melalui `udisksctl`.

## Pilih modul

Modul tambahan `.sb` adalah argumen posisional:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

Perintah akan memvalidasi setiap modul sebagai file SquashFS yang dapat dibaca dan bukan symlink. Modul dengan nama diawali dua digit dan tanda hubung akan ditempatkan di tingkat atas MiniOS. Modul lain yang ditambahkan akan ditempatkan di `minios/modules/`. Modul dengan nama dasar yang sama atau bentrok secara case-insensitive akan ditolak.

Kecualikan path sumber menggunakan ekspresi reguler POSIX extended:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

File boot yang dibutuhkan, file kernel dan initramfs, modul inti, menu boot yang dipilih, dan konfigurasi yang dipilih tidak dapat dikecualikan.

Buat modul yang dapat digunakan ulang sebelum menyusun ISO. Lihat [Membuat modul](/development/Creating-Modules.md) dan [MiniOS Module Manager](/administration/Module-Manager.md).

## Konfigurasi dan manifest

`--config FILE` akan menginstal file reguler yang dipilih sebagai `minios/config.conf`. Default-nya adalah `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

Manifest opsional harus berupa objek JSON. Label volume harus terdiri dari 1 hingga 32 karakter ASCII yang dapat dicetak; label di luar set ISO 9660 yang ketat (huruf kapital, angka, dan garis bawah) akan menghasilkan peringatan.

## Tangkap perubahan sesi

Penangkapan sesi bersifat opsional dan berlaku pada layer writable dari sesi MiniOS yang sedang berjalan. Fitur ini diterima untuk sumber eksplisit hanya jika sumber tersebut memiliki sidik jari base-module yang sama dengan sistem yang sedang berjalan.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Profil yang tersedia:

- `exact` menangkap semua perubahan yang dapat direpresentasikan dan dapat mencakup kredensial, data pribadi, log, status browser, dan identitas mesin.
- `clean` menggunakan allowlist yang berorientasi pada perangkat lunak. Ini mengurangi eksposur tetapi tidak menjamin hasilnya bebas dari rahasia.
- `selected` menggunakan seleksi inventaris yang dihasilkan oleh frontend yang kompatibel atau alur kerja `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Lebih disarankan menggunakan modul dan konfigurasi deklaratif daripada penangkapan sesi jika ISO akan dibagikan. Lihat [MiniOS Image Builder](/development/Image-Builder.md) untuk model privasi dan alur tinjauan.

## Kustomisasi perilaku boot

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
`--menu` menerima `multilang` atau locale yang didukung seperti `en_US`, `ru_RU`, atau `de_DE`. Argumen kernel akan divalidasi dan ditambahkan tanpa evaluasi shell. Layout menu boot yang tidak didukung atau ambigu akan ditolak, bukan diubah secara coba-coba.

## Tambahkan artwork atau overlay filesystem

Ganti latar belakang boot dengan file PNG yang telah divalidasi:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Paketkan satu pohon direktori yang sudah disiapkan sebagai modul overlay image milik root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

Overlay akan diinterpretasikan relatif terhadap root image. Overlay ini tidak menjalankan skrip, menginstal paket, atau membuka chroot. Link yang tidak aman, file spesial, crossing filesystem, dan tabrakan tujuan akan ditolak.

## Verifikasi dan publikasi

Sebelum publikasi, `minios-image-compose` akan memverifikasi pohon filesystem ISO, label volume, rekaman boot BIOS dan UEFI, area sistem, file boot, modul, dan kustomisasi yang diminta. Modul overlay yang dihasilkan dan modul hasil penangkapan sesi akan diekstrak dan diperiksa terhadap metadata serta digest yang tercatat.

ISO dibangun di direktori privat pada filesystem tujuan dan dipublikasikan secara atomik hanya setelah verifikasi berhasil. Mutasi input, kegagalan verifikasi, pembatalan, atau ruang tujuan yang tidak cukup akan mencegah publikasi. Tujuan sebelumnya tidak akan berubah kecuali build `--overwrite` yang disetujui secara eksplisit berhasil dipublikasikan secara atomik.

Buat checksum dan lakukan uji boot terpisah setelah build berhasil:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

Verifikasi struktural tidak menggantikan pengujian jalur boot BIOS dan UEFI yang diinginkan pada mesin virtual sekali pakai atau perangkat keras yang sesuai.

## Referensi perintah

Gunakan manual terinstal dan keluaran bantuan untuk versi backend yang tepat:

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

Perintah akan keluar dengan kode non-nol jika pemeriksaan sumber, modul, kustomisasi, penyimpanan, verifikasi, atau publikasi gagal. Jangan distribusikan output kecuali perintah selesai dengan sukses dan checksum serta jalur boot hasilnya telah diuji.
