---
updated: 2026-08-31
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Penginstal MiniOS

Penginstal MiniOS adalah wizard GTK dan backend command-line untuk melakukan deployment sistem dari sesi live MiniOS yang sedang berjalan. Menulis atau menyalin MiniOS ke media yang dapat dilepas memang sudah merupakan metode instalasi; Penginstal MiniOS adalah alat deployment terkelola yang digunakan ketika Anda menginginkan tata letak target yang terkontrol, pengaturan persistensi, atau konversi native opsional.

## Sebelum memulai

Pilihan target atau partisi yang salah dapat menyebabkan hilangnya data. Cadangkan file penting, lepaskan disk yang tidak diperlukan, dan identifikasi target berdasarkan path perangkat, model, dan kapasitas. Konfirmasi terakhir adalah titik akhir di mana instalasi masih bisa dibatalkan dengan aman.

Disk yang berisi sistem live MiniOS yang sedang berjalan tidak akan muncul dalam pilihan target. Untuk panduan kapasitas secara umum, lihat [Panduan kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Mode instalasi

**Live mode** menyalin modul MiniOS terkompresi yang dipilih beserta aset boot. Hasilnya tetap MiniOS: tetap menggunakan tata letak live-system modular, konfigurasi boot MiniOS, workflow manajemen MiniOS, dan opsi persistensi sesi.

**Native mode** membuat desktop Debian konvensional dari image MiniOS yang dipilih. Mode ini mengekstrak modul yang dipilih ke filesystem root yang dapat ditulis, mempertahankan lingkungan desktop dan aplikasi biasa yang dipilih, menghapus runtime live MiniOS dan utilitas khusus live, menginstal paket Debian yang diperlukan, menghasilkan initramfs konvensional, dan memasang bootloader. Penginstal akan mendeteksi dukungan native dari image yang sedang dijalankan. Jika metadata kernel yang dibutuhkan dan kontrak arsitektur EFI tidak tersedia, mode kompatibilitas hanya mengizinkan instalasi live.

::: warning Mode native mengubah cara sistem dikelola
Sistem yang terinstal tetap mempertahankan pengalaman desktop MiniOS yang sudah dikenal — tampilannya, lingkungan desktop yang dipilih, dan aplikasi biasa — namun tidak lagi menggunakan arsitektur live MiniOS. Selama proses konversi, penginstal akan menghapus paket `minios-*` dan utilitas khusus live lainnya karena sesi, modul `.sb`, manajemen kernel modular, dan konfigurasi boot live tidak lagi berlaku. Setelah reboot, kelola sistem sebagai desktop Debian konvensional menggunakan APT, paket kernel Debian, initramfs normal, dan bootloader yang terpasang. Lihat [Tentang MiniOS](/getting-started/About-MiniOS).
:::

Deployment ini berbeda dengan menulis ISO mentah, setup multiboot file ISO Ventoy, atau instalasi live berbasis file. Lihat [Metode instalasi](/installing-minios/Installation-Methods) untuk perbedaannya.

## Mulai penginstal grafis

Buka menu aplikasi, pilih Sistem, lalu pilih Penginstal MiniOS. Anda juga dapat menjalankannya dari terminal:

```bash
sudo minios-installer
```

Wizard akan mengumpulkan mode instalasi, keamanan, lokasi, jaringan kabel, keyboard, akun, modul, penyimpanan, dan pengaturan boot. Tinjau geometri partisi secara detail dan ringkasan operasi sebelum menyetujui konfirmasi akhir yang bersifat destruktif.

## Penempatan dan tata letak boot

Penginstal grafis menawarkan pilihan penempatan berikut saat target memenuhi syarat:

- Erase all membuat tabel partisi baru dan menghapus semua data di disk target.
- Free space menggunakan ruang kosong yang tersedia tanpa mengecilkan filesystem yang sudah ada.
- Alongside mengecilkan partisi ext2, ext3, ext4, atau NTFS terakhir yang memenuhi syarat dan tidak ter-mount. Tata letak yang kotor, ter-mount, nested, ambigu, atau tidak aman lainnya akan ditolak. Penginstal dapat meminta konfirmasi sebelum mengunduh alat filesystem yang belum tersedia.
- Manual partitioning hanya tersedia untuk konversi native di GUI pada disk langsung yang memenuhi syarat. Perubahan akan disimpan sementara hingga konfirmasi akhir.

Tata letak boot otomatis yang didukung adalah BIOS/MBR, UEFI/MBR, dan UEFI/GPT. UEFI bekerja dengan layout GPT atau MBR primer. BIOS didukung pada MBR primer, bukan GPT. Layout MBR extended atau logical preserve tidak didukung.

Mode manual dapat membuat, menghapus, memformat, dan menggunakan kembali partisi; mengecilkan filesystem yang didukung dari ujungnya; menetapkan mount point, partisi sistem EFI, dan swap; serta membatalkan atau mereset perubahan yang telah disimpan sementara. Tidak mendukung LVM, RAID, root LUKS native, storage yang dipetakan atau nested, bcache, ZFS, atau pengeditan subvolume Btrfs. Persistensi sesi LUKS tidak mengenkripsi filesystem root native.

## Filesystem

- Tata letak live dapat menggunakan ext2, ext4, Btrfs, FAT32, atau NTFS jika alat yang diperlukan sudah terpasang.
- Filesystem root yang dibuat oleh konversi native dapat menggunakan ext2, ext4, atau Btrfs. Ext4 adalah default serbaguna.
- Filesystem ext3 yang sudah ada dapat digunakan ulang atau dikecilkan jika didukung, tetapi ext3 tidak ditawarkan untuk format baru.
- FAT32 terbatas pada file berukuran kurang dari 4 GiB dan hanya tersedia untuk tata letak live.
- NTFS hanya tersedia untuk tata letak live, meskipun partisi NTFS yang memenuhi syarat dapat dikecilkan untuk penempatan alongside.

Ruang yang dibutuhkan mencakup data modul yang dipilih, aset boot, permintaan persistensi, dan cadangan filesystem sebesar 25 persen. Ruang EFI dan swap native dihitung secara terpisah.

## Konfigurasi dan keamanan

Penginstal dapat mengatur lokal, zona waktu, keyboard, nama pengguna, kata sandi, grup pengguna, hostname, layanan, menu boot, dan pemilihan modul. Memilih modul MiniOS yang lebih tinggi akan otomatis menyertakan layer yang lebih rendah yang diperlukan.

Profil keamanan yang tersedia adalah `convenient`, `balanced`, dan `strict`. Mode live secara default menggunakan `convenient`; konversi native dimulai dari `balanced`. Kontrol SSH dan XRDP terpisah dari profil yang dipilih. Tinjau layanan akses jarak jauh sebelum koneksi jaringan pertama. Setelah konversi native, konfigurasi keamanan selanjutnya mengikuti workflow administrasi sistem Debian biasa.

Konfigurasi jaringan mencakup hostname dan DHCP kabel atau IPv4 statik. Penginstal tidak membuat atau mengubah profil Wi-Fi. Konversi native dan beberapa operasi alongside mungkin memerlukan akses jaringan, dengan persetujuan Anda, untuk mendapatkan paket GRUB, EFI, initramfs, `os-prober`, atau resize filesystem sebelum perubahan disk dilakukan.

## Persistensi sesi live

Persistensi hanya berlaku untuk instalasi live:

- Mode persistensi `native` menyimpan perubahan sesi live langsung pada filesystem target yang kompatibel dengan POSIX. Meski namanya demikian, ini adalah **backend persistensi live** dan tidak berhubungan dengan instalasi native. Tidak tersedia pada FAT32 atau NTFS.
- DynFileFS menggunakan kontainer yang dapat diperbesar.
- Raw menggunakan image berukuran tetap.
- LUKS menggunakan image terenkripsi yang dibuat oleh initrd saat boot pertama. Kata sandi diminta saat boot dan tidak pernah diterima atau disimpan oleh penginstal.

Mode kontainer default ke 4000 MiB. Kontainer Raw dan LUKS tidak dapat melebihi 4000 MiB pada FAT32; DynFileFS tidak terkena batas ukuran file tunggal tersebut. LUKS hanya ditawarkan jika initrd yang berjalan dan setiap initrd sumber yang disalin mendukung kriptografi yang diperlukan.

Opsi boot yang dihasilkan menggunakan `perchmode` dan `perchsize`. Lihat [Persistensi initrd](/reference/boot-process/Persistence-Internals) dan [Parameter boot](/reference/Boot-Parameters) untuk arti dan syarat aktivasi saat runtime.

## Deployment via command-line

`minios-deploy` ditujukan untuk otomasi, pengujian, dan pemulihan. Partisi manual dan pengaturan jaringan kabel interaktif tetap hanya tersedia di GUI.

Daftar disk yang dikenali sebagai target instalasi:

```bash
minios-deploy list-disks
```

Ganti `/dev/sdb` pada setiap contoh dengan disk target yang sudah diverifikasi. Cetak rencana non-destruktif terlebih dahulu:

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

Jalankan instalasi nyata hanya setelah memeriksa rencana, identitas target, dan output dry-run. `--yes` mengotorisasi perubahan destruktif:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Jika Anda memang ingin melakukan konversi native ke ruang kosong yang ada, gunakan opsi storage yang sama untuk perencanaan dan instalasi:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Konversi native mungkin tidak muncul di bantuan CLI pada image yang tidak mendukung native-install. CLI juga menerima opsi konfigurasi untuk akun, lokal, zona waktu, keyboard, hostname, layanan, dan base `config.conf`. Periksa opsi pasti yang disediakan oleh image yang sedang berjalan:

```bash
minios-deploy install --help
man minios-deploy
```

Hindari `--password` dan `--root-password` di lingkungan bersama karena argumen command-line dalam bentuk plaintext dapat terekspos di riwayat shell dan daftar proses. Gunakan penginstal grafis atau workflow konfigurasi yang terlindungi sebagai gantinya.
