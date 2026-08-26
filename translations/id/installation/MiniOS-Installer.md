---
updated: 2026-08-26
program_commits:
    minios-installer: 1b4c3df8b7aad7cec67b30263a6bb3929d98a77c
---

# Menggunakan MiniOS Installer

MiniOS Installer adalah wizard berbasis GTK dan backend command-line untuk melakukan instalasi MiniOS dari sesi live MiniOS. Aplikasi ini menginstal ke disk target; ini berbeda dengan menulis file ISO ke media bootable.

## Sebelum memulai

Pilihan target atau partisi yang salah dapat menyebabkan hilangnya data. Cadangkan file penting, lepaskan disk yang tidak diperlukan, dan identifikasi target berdasarkan jalur perangkat, model, dan kapasitas. Konfirmasi terakhir adalah titik akhir di mana instalasi masih dapat dibatalkan dengan aman.

Disk yang berisi sistem MiniOS live yang sedang berjalan tidak akan muncul dalam pemilihan target. Untuk panduan kapasitas secara umum, lihat [Panduan kompatibilitas perangkat keras](Hardware-Compatibility.md).

## Mode instalasi

Mode Live menyalin modul MiniOS terkompresi yang dipilih beserta aset boot. Hasilnya mempertahankan tata letak sistem live modular dan dapat menggunakan persistensi sesi MiniOS.

Mode Native mengekstrak modul yang dipilih ke dalam filesystem root Linux konvensional, mengonfigurasi target, menginstal paket yang dibutuhkan, menghasilkan initramfs, dan memasang bootloader. Installer mendeteksi dukungan native dari image yang sedang dijalankan. Jika metadata kernel yang dibutuhkan dan kontrak arsitektur EFI tidak ada, mode kompatibilitas hanya mengizinkan instalasi live.

Penerapan ini berbeda dengan penulisan ISO mentah, setup multiboot file ISO Ventoy, atau alat media live berbasis file. Lihat [Mode Boot](/configuration/Boot-Modes.md) untuk batasan antara sistem live dan native.

## Memulai installer grafis

Buka menu aplikasi, pilih Sistem, lalu pilih Install MiniOS. Installer juga dapat dijalankan dari terminal:

```bash
sudo minios-installer
```

Wizard akan mengumpulkan pengaturan mode instalasi, keamanan, lokasi, jaringan kabel, keyboard, akun, modul, penyimpanan, dan boot. Tinjau detail geometri partisi dan ringkasan operasi sebelum menyetujui konfirmasi akhir yang bersifat destruktif.

## Penempatan dan tata letak boot

Installer grafis menawarkan pilihan penempatan berikut saat target memenuhi syarat:

- Hapus semua akan membuat tabel partisi baru dan menghapus semua data di disk target.
- Ruang kosong menggunakan ruang tidak terpakai yang sesuai tanpa mengecilkan filesystem yang sudah ada.
- Berdampingan akan mengecilkan partisi ext2, ext3, ext4, atau NTFS terakhir yang memenuhi syarat dan tidak ter-mount. Tata letak yang kotor, ter-mount, bersarang, ambigu, atau tidak aman akan ditolak. Installer dapat meminta izin sebelum mengunduh tools filesystem yang belum tersedia.
- Partisi manual hanya tersedia untuk instalasi GUI native pada disk langsung yang memenuhi syarat. Perubahan akan disimpan sementara hingga konfirmasi akhir.

Tata letak boot otomatis yang didukung adalah BIOS/MBR, UEFI/MBR, dan UEFI/GPT. UEFI dapat digunakan dengan GPT atau MBR primer. BIOS didukung pada MBR primer, bukan GPT. Tata letak preserve MBR extended atau logical tidak didukung.

Mode manual dapat membuat, menghapus, memformat, dan menggunakan kembali partisi; mengecilkan filesystem yang didukung dari ujungnya; menetapkan mount point, partisi sistem EFI, dan swap; serta membatalkan atau mengatur ulang perubahan yang telah disimpan sementara. Tidak mendukung LVM, RAID, root LUKS native, penyimpanan mapped atau bersarang, bcache, ZFS, atau pengeditan subvolume Btrfs. Persistensi sesi LUKS tidak mengenkripsi filesystem root native.

## Filesystem

- Tata letak live dapat menggunakan ext2, ext4, Btrfs, FAT32, atau NTFS jika tools yang diperlukan telah terinstal.
- Filesystem root native dapat menggunakan ext2, ext4, atau Btrfs. Ext4 adalah default serbaguna.
- Filesystem ext3 yang sudah ada dapat digunakan kembali atau diperkecil jika didukung, namun ext3 tidak tersedia untuk format baru.
- FAT32 terbatas untuk file berukuran kurang dari 4 GiB dan hanya tersedia untuk tata letak live.
- NTFS hanya tersedia untuk tata letak live, meskipun partisi NTFS yang memenuhi syarat dapat diperkecil untuk penempatan berdampingan.

Ruang yang dibutuhkan mencakup data modul yang dipilih, aset boot, permintaan persistensi, dan cadangan filesystem sebesar 25 persen. Ruang EFI dan swap native dihitung secara terpisah.

## Konfigurasi dan keamanan

Installer dapat mengatur lokal, zona waktu, keyboard, nama pengguna, kata sandi, grup pengguna, hostname, layanan, menu boot, dan pemilihan modul. Memilih modul MiniOS yang lebih tinggi akan otomatis menyertakan lapisan bawah yang dibutuhkan.

Profil keamanan adalah `convenient`, `balanced`, dan `strict`. Mode live menggunakan default `convenient`; mode native menggunakan default `balanced`. Kontrol SSH dan XRDP terpisah dari profil yang dipilih. Tinjau layanan akses jarak jauh sebelum koneksi jaringan pertama.

Konfigurasi jaringan mencakup hostname dan DHCP kabel atau IPv4 statis. Installer tidak membuat atau mengubah profil Wi-Fi. Instalasi native dan berdampingan mungkin memerlukan akses jaringan, dengan persetujuan Anda, untuk mendapatkan paket GRUB, EFI, initramfs, `os-prober`, atau resize filesystem sebelum perubahan disk.

## Persistensi sesi live

Persistensi hanya berlaku untuk instalasi live:

- Persistensi native menyimpan perubahan langsung pada filesystem target yang kompatibel dengan POSIX. Fitur ini tidak tersedia pada FAT32 atau NTFS.
- DynFileFS menggunakan kontainer yang dapat diperluas.
- Raw menggunakan image berukuran tetap.
- LUKS menggunakan image terenkripsi yang dibuat oleh initrd saat boot pertama kali. Kata sandi diminta saat boot dan tidak pernah diterima atau disimpan oleh installer.

Mode kontainer secara default berukuran 4000 MiB. Kontainer Raw dan LUKS tidak dapat melebihi 4000 MiB pada FAT32; DynFileFS tidak terkena batasan ukuran file tunggal tersebut. LUKS hanya tersedia jika baik initrd yang berjalan maupun setiap initrd sumber yang disalin mendukung fitur kripto yang dibutuhkan.

Opsi boot yang dihasilkan menggunakan `perchmode` dan `perchsize`. Lihat [Persistensi Initrd](/configuration/Initrd-Persistence.md) dan [Parameter Boot](/configuration/Boot-Parameters.md) untuk makna runtime dan persyaratan aktivasinya.

## Deploy melalui command-line

`minios-deploy` ditujukan untuk otomasi, pengujian, dan pemulihan. Partisi manual dan pengaturan jaringan kabel interaktif tetap hanya tersedia di GUI.

Daftar disk yang dikenali sebagai target instalasi:

```bash
minios-deploy list-disks
```

Ganti `/dev/sdb` di setiap contoh dengan disk target yang sudah diverifikasi. Cetak dulu rencana yang tidak bersifat destruktif:

```bash
minios-deploy plan /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000
```

Pratinjau perintah deploy yang sesuai tanpa menulis ke disk:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --dry-run
```

Jalankan instalasi sebenarnya hanya setelah memeriksa rencana, identitas target, dan output dry-run. `--yes` mengizinkan perubahan destruktif:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Untuk instalasi native ke ruang kosong yang sudah ada, gunakan opsi penyimpanan yang sama untuk perencanaan dan instalasi:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Mode native mungkin tidak muncul di bantuan CLI pada image yang tidak mendukung instalasi native. CLI juga menerima opsi konfigurasi untuk akun, lokal, zona waktu, keyboard, hostname, layanan, dan `config.conf` dasar. Periksa opsi yang tersedia pada image yang sedang berjalan:

```bash
minios-deploy install --help
man minios-deploy
```

Hindari `--password` dan `--root-password` di lingkungan bersama karena argumen command-line dalam bentuk plaintext dapat terlihat di riwayat shell dan daftar proses. Gunakan installer grafis atau alur kerja konfigurasi yang terlindungi sebagai gantinya.
