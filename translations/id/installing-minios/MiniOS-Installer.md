---
updated: 2026-10-15
program_commits:
    minios-installer: e895f8065faef84356f9c1cda4dbfa97700b0370
---

# Penginstal MiniOS

Penginstal MiniOS adalah wizard GTK dan backend command-line untuk menerapkan sistem dari sesi live MiniOS yang sedang berjalan. Menulis atau menyalin MiniOS ke media lepasan juga merupakan metode instalasi; Penginstal MiniOS adalah alat penerapan terkelola yang digunakan jika Anda menginginkan tata letak target yang terkontrol, konfigurasi persistensi, atau konversi native opsional.

## Sebelum memulai

Pilihan target atau partisi yang keliru dapat menghapus data. Cadangkan file penting, lepaskan disk yang tidak diperlukan, dan pastikan target dengan memeriksa jalur perangkat, model, serta kapasitasnya. Konfirmasi terakhir adalah kesempatan terakhir untuk membatalkan instalasi dengan aman.

Disk yang berisi sistem live MiniOS yang sedang berjalan tidak disertakan dalam pemilihan target. Untuk panduan kapasitas umum, lihat [Panduan kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Mode instalasi

**Mode live** menyalin modul MiniOS terkompresi dan aset boot yang dipilih. Hasilnya tetap MiniOS: tata letak sistem live modular tetap dipertahankan, begitu pula konfigurasi boot MiniOS, alur kerja pengelolaan MiniOS, dan persistensi sesi opsional.

**Mode native** membuat desktop Debian konvensional dari image MiniOS yang dipilih. Modul yang dipilih diekstrak ke sistem file root yang dapat ditulis, lingkungan desktop dan aplikasi biasa yang dipilih tetap dipertahankan, runtime live MiniOS serta utilitas khusus live dihapus, paket Debian yang diperlukan dipasang, initramfs konvensional dibuat, dan bootloader dipasang. Penginstal mendeteksi dukungan native dari image yang digunakan untuk boot. Jika metadata kernel yang diperlukan dan kontrak arsitektur EFI tidak tersedia, mode kompatibilitas hanya mengizinkan instalasi live.

::: warning Mode native mengubah cara sistem dikelola
Sistem yang diinstal tetap memiliki pengalaman desktop MiniOS yang familier — tampilan, lingkungan desktop yang dipilih, dan aplikasi biasa — tetapi tidak lagi menggunakan arsitektur live MiniOS. Selama konversi, penginstal menghapus paket `minios-*` serta utilitas khusus live lainnya karena sesi, `.sb` modul, pengelolaan kernel modular, dan konfigurasi boot live tidak lagi digunakan. Setelah reboot, kelola sistem sebagai desktop Debian konvensional dengan APT, paket kernel Debian, initramfs standar, dan bootloader yang telah dipasang. Lihat [Tentang MiniOS](/getting-started/About-MiniOS).
:::

Penerapan ini berbeda dari penulisan ISO mentah, konfigurasi multiboot file ISO Ventoy, atau instalasi live berbasis file. Lihat [Metode instalasi](/installing-minios/Installation-Methods) untuk mengetahui perbedaannya.

## Mulai penginstal grafis

Buka Penginstal MiniOS dari **MiniOS** kategori menu aplikasi. Anda juga dapat menjalankannya dari terminal; otorisasi administrator akan diminta bila diperlukan:

```bash
minios-installer
```

Wizard akan meminta pengaturan mode instalasi, keamanan, lokasi, jaringan kabel, keyboard, akun, modul, penyimpanan, dan boot. Periksa geometri partisi dan ringkasan operasi secara saksama sebelum menyetujui konfirmasi akhir yang bersifat destruktif.

## Opsi penempatan dan tata letak boot

Penginstal grafis menyediakan pilihan penempatan berikut jika target memenuhi syarat:

- Hapus semua membuat tabel partisi baru dan menghapus semua data di disk target.
- Ruang kosong menggunakan ruang yang belum dialokasikan dan sesuai, tanpa mengecilkan filesystem yang sudah ada.
- Berdampingan mengecilkan partisi ext2, ext3, ext4, atau NTFS yang memenuhi syarat dan belum di-mount pada posisi terakhir. Tata letak yang bermasalah, di-mount, bertingkat, ambigu, atau tidak aman karena alasan lain akan ditolak. Penginstal mungkin meminta persetujuan sebelum mengunduh alat filesystem yang belum tersedia.
- Partisi manual hanya tersedia untuk konversi native melalui GUI pada disk langsung yang memenuhi syarat. Perubahan akan disiapkan hingga konfirmasi akhir.

Tata letak boot otomatis adalah BIOS/MBR, UEFI/MBR, dan UEFI/GPT. UEFI mendukung tata letak GPT atau MBR primer. BIOS didukung pada MBR primer, bukan GPT. Tata letak MBR yang mempertahankan partisi extended atau logical tidak didukung.

Untuk **Hapus semua** dalam mode Live, **Otomatis** memilih MBR meskipun penginstal berjalan dalam UEFI. Target Live MBR mempertahankan file EFI dan memasang bootloader BIOS, sehingga mendukung kedua mode firmware. Disk berukuran 2 TiB atau lebih memerlukan pilihan **UEFI/GPT** secara eksplisit; target Live GPT hanya mendukung UEFI. Hapus semua untuk native mengikuti kebijakan terpisah yang bergantung pada firmware. Instalasi di ruang kosong dan berdampingan mempertahankan tabel partisi yang sudah ada.

Mode manual dapat membuat, menghapus, memformat, dan menggunakan kembali partisi; mengecilkan filesystem yang didukung dari bagian akhirnya; menetapkan titik mount, partisi sistem EFI, dan swap; serta membatalkan atau mengatur ulang perubahan yang disiapkan. Mode ini tidak mendukung LVM, RAID, root LUKS native, penyimpanan yang dipetakan atau bertingkat, bcache, ZFS, maupun pengeditan subvolume Btrfs. Enkripsi LUKS2 untuk sesi persistensi Live tidak mengenkripsi filesystem root native.

## Filesystem

- Tata letak Live dapat menggunakan ext2, ext4, Btrfs, FAT32, atau NTFS jika alat yang diperlukan sudah terpasang.
- Filesystem root yang dibuat melalui konversi native dapat menggunakan ext2, ext4, atau Btrfs. ext4 adalah pilihan default untuk penggunaan umum.
- Filesystem ext3 yang sudah ada dapat digunakan kembali atau diperkecil jika didukung, tetapi ext3 tidak tersedia untuk pemformatan baru.
- FAT32 membatasi ukuran file hingga kurang dari 4 GiB dan hanya tersedia untuk tata letak Live.
- NTFS hanya tersedia untuk tata letak Live, meskipun partisi NTFS yang memenuhi syarat dapat diperkecil untuk penempatan berdampingan.

Ruang yang diperlukan mencakup data modul yang dipilih, aset boot, persistensi yang diminta, dan cadangan filesystem sebesar 25 persen. Ruang EFI dan swap native dihitung secara terpisah.

## Konfigurasi dan keamanan

Penginstal dapat mengatur lokal, zona waktu, keyboard, nama pengguna, kata sandi, grup pengguna, nama host, layanan, menu boot, dan pemilihan modul. Memilih lapisan sistem yang lebih tinggi akan menyertakan lapisan sistem di bawahnya yang diperlukan. Modul kustom dari `minios/modules/` dipilih secara terpisah, meskipun nama filenya menyerupai modul sistem atau kernel.

Profil keamanan yang tersedia adalah `convenient`, `balanced`, dan `strict`. Mode Live menggunakan `convenient` secara default; konversi native dimulai dengan `balanced`. Pengaturan SSH dan XRDP terpisah dari profil yang dipilih. Periksa layanan akses jarak jauh sebelum koneksi jaringan pertama. Setelah konversi native, konfigurasi keamanan berikutnya mengikuti alur administrasi sistem Debian seperti biasa.

Konfigurasi jaringan mencakup nama host serta DHCP berkabel atau IPv4 statis. Penginstal tidak membuat atau mengubah profil Wi-Fi. Konversi native dan beberapa operasi berdampingan mungkin memerlukan akses jaringan, dengan persetujuan Anda, untuk mendapatkan paket GRUB, EFI, initramfs, `os-prober`, atau pengubahan ukuran filesystem sebelum perubahan disk dilakukan.

## Persistensi sesi Live

Persistensi hanya berlaku untuk instalasi Live. Jika `minios-session` tersedia, Penginstal MiniOS dapat membuat dan mengaktifkan sesi bernomor langsung di target sebelum instalasi selesai. **Siapkan otomatis saat boot pertama** melewati langkah ini; MiniOS kemudian dapat membuat penyimpanan sesi melalui mekanisme persistensi normalnya saat boot.

Penginstal menyediakan backend penyimpanan berikut jika didukung oleh sistem yang berjalan dan target:

- `native` menyimpan perubahan sesi Live langsung di direktori sesi pada filesystem target yang kompatibel dengan POSIX. Meskipun namanya demikian, ini adalah **backend persistensi Live** dan tidak terkait dengan instalasi native. Opsi ini tidak tersedia di FAT32 atau NTFS.
- DynFileFS membuat penyimpanan ext4 berbasis file yang dapat diperluas. Ukuran yang dipilih adalah batas maksimum logis, bukan ruang yang langsung dicadangkan. Ukuran defaultnya adalah 4000 MiB.
- DynBlk membuat filesystem ext4 pada perangkat blok tipis yang disediakan oleh driver kernel DynBlk. Data sesi disimpan dalam file `volumeNNN.db` yang dialokasikan sesuai kebutuhan, sehingga ukuran yang dipilih merupakan batas maksimum logis, bukan penggunaan disk yang dialokasikan sebelumnya. Secara default, penginstal menetapkan ukuran sesi DynBlk baru menjadi 16384 MiB. Untuk sesi DynBlk yang tidak dienkripsi, penginstal dapat memilih codec kompresi yang didukung oleh sistem yang berjalan dan initrd yang disalin ke target.
- VMDK menggunakan driver DynBlk untuk membuat penyimpanan VMDK sparse terpisah standar (`volume.vmdk` dan `volume-sNNN.vmdk`). Opsi ini menggunakan model alokasi tipis yang sama dan ukuran default 16384 MiB seperti DynBlk, tetapi kompresi backend tidak tersedia.
- Raw membuat image ext4 berukuran tetap dan langsung mencadangkan kapasitas yang dipilih. Ukuran defaultnya adalah 4000 MiB.

LUKS2 adalah lapisan enkripsi terpisah yang dapat membungkus penyimpanan sesi Raw, DynFileFS, DynBlk, atau VMDK. Penginstal hanya mengumpulkan frasa sandi yang telah dikonfirmasi saat membuat sesi, mengirimkannya ke `minios-session` melalui input standar, dan tidak menyimpannya dalam argumen baris perintah, log, atau konfigurasi persisten. Frasa sandi tersebut diperlukan untuk membuka sesi terenkripsi saat boot. LUKS2 hanya tersedia jika lingkungan yang berjalan dan initrd target yang disalin menyatakan dukungan yang kompatibel. Kompresi DynBlk dinonaktifkan jika LUKS2 dipilih.

Penyimpanan sesi DynBlk dan VMDK tidak tersedia saat UEFI Secure Boot diaktifkan karena modul kernel eksternal DynBlk yang digunakan backend ini tidak ditandatangani oleh MiniOS. Kontainer Raw dibatasi hingga 4000 MiB di FAT32; DynFileFS, DynBlk, dan penyimpanan VMDK terpisah tidak bergantung pada satu file yang melebihi batas 4 GiB FAT32, meskipun batas backend dan ruang kosong masing-masing tetap berlaku.

Karena penginstal membuat dan mengaktifkan sesi yang dipilih di target, penginstal tidak mengandalkan `perchmode` dan `perchsize` untuk membuat penyimpanan tersebut saat boot pertama. Parameter boot tersebut tetap menjelaskan pembuatan dan pemilihan persistensi yang digerakkan initrd di luar alur sesi yang telah dibuat sebelumnya oleh penginstal. Lihat [Pengelolaan sesi](/using-minios/Sessions-and-Persistence), [Persistensi initrd](/reference/boot-process/Persistence-Internals), dan [Parameter boot](/reference/Boot-Parameters).

<a id="command-line-deployment"></a>

## Deployment melalui command line

`minios-deploy` ditujukan untuk otomatisasi, pengujian, dan pemulihan. Pemartisian manual dan pengaturan jaringan kabel secara interaktif hanya tersedia melalui GUI.

Tampilkan daftar disk yang dikenali sebagai disk yang dapat digunakan untuk instalasi:

```bash
minios-deploy list-disks
```

Ganti `/dev/sdb` di setiap contoh dengan disk target yang sudah diverifikasi. Cetak rencana tanpa mengubah apa pun terlebih dahulu:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Pratinjau perintah deployment yang sesuai tanpa menulis ke disk:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Jalankan instalasi sebenarnya hanya setelah memeriksa rencana, identitas target, dan output dry-run. `--yes` mengizinkan perubahan yang bersifat destruktif:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Jika Anda memang ingin melakukan konversi native ke ruang kosong yang tersedia, gunakan opsi penyimpanan yang sama untuk perencanaan dan instalasi:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Opsi konversi native mungkin tidak muncul di bantuan CLI pada image yang tidak mendukung instalasi native. CLI juga menerima opsi konfigurasi untuk akun, lokal, zona waktu, keyboard, nama host, layanan, dan `config.conf`. Periksa opsi persis yang disediakan oleh image yang sedang berjalan:

```bash
minios-deploy install --help
man minios-deploy
```

Hindari `--password` dan `--root-password` di lingkungan bersama karena argumen command line dalam teks biasa dapat terlihat di riwayat shell dan daftar proses. Sebagai gantinya, gunakan installer grafis atau alur kerja konfigurasi yang terlindungi.
