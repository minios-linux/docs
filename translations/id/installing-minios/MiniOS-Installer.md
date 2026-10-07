---
updated: 2026-10-06
program_commits:
    minios-installer: ecabe245a5eaff606ce06f034af334b399f4c3b3
---

# Penginstal MiniOS

Penginstal MiniOS adalah wizard GTK dan backend command-line untuk melakukan deployment sistem dari sesi live MiniOS yang sedang berjalan. Menulis atau menyalin MiniOS ke media yang dapat dilepas sudah merupakan metode instalasi; Penginstal MiniOS adalah alat deployment terkelola yang digunakan saat Anda menginginkan tata letak target yang terkontrol, pengaturan persistensi, atau konversi native opsional.

## Sebelum memulai

Pilihan target atau partisi yang salah dapat menyebabkan hilangnya data. Cadangkan file penting, lepaskan disk yang tidak diperlukan, dan identifikasi target berdasarkan path perangkat, model, serta kapasitasnya. Konfirmasi akhir adalah titik terakhir di mana instalasi dapat dibatalkan dengan aman.

Disk yang berisi sistem live MiniOS yang sedang berjalan tidak dapat dipilih sebagai target. Untuk panduan kapasitas umum, lihat [Panduan kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Mode instalasi

**Mode live** menyalin modul MiniOS terkompresi yang dipilih beserta aset boot. Hasilnya tetap MiniOS: tata letak sistem live modular tetap dipertahankan, konfigurasi boot MiniOS, workflow manajemen MiniOS, serta opsi persistensi sesi.

**Mode native** membuat desktop Debian konvensional dari image MiniOS yang dipilih. Modul yang dipilih diekstrak ke filesystem root yang dapat ditulis, lingkungan desktop dan aplikasi tetap dipertahankan, runtime live MiniOS dan utilitas khusus live dihapus, paket Debian yang dibutuhkan diinstal, initramfs konvensional dibuat, dan bootloader diinstal. Installer mendeteksi dukungan native dari image yang di-boot. Jika metadata kernel yang dibutuhkan dan kontrak arsitektur EFI tidak ada, mode kompatibilitas hanya mengizinkan instalasi live.

::: warning Mode native mengubah cara sistem dikelola
Sistem yang telah diinstal tetap mempertahankan pengalaman desktop MiniOS yang sudah dikenal — tampilan, lingkungan desktop, dan aplikasi — namun tidak lagi menggunakan arsitektur live MiniOS. Selama proses konversi, installer akan menghapus `minios-*` paket dan utilitas khusus live lainnya karena sesi, `.sb` modul, manajemen kernel modular, serta konfigurasi boot live tidak lagi berlaku. Setelah reboot, sistem dikelola seperti desktop Debian konvensional dengan APT, paket kernel Debian, initramfs normal, dan bootloader yang telah diinstal. Lihat [Tentang MiniOS](/getting-started/About-MiniOS).
:::

Deployment ini berbeda dengan penulisan ISO mentah, setup multiboot file ISO Ventoy, atau instalasi live berbasis file. Lihat [Metode instalasi](/installing-minios/Installation-Methods) untuk perbedaannya.

## Mulai penginstal grafis

Buka menu aplikasi, pilih Sistem, lalu pilih Penginstal MiniOS. Anda juga dapat menjalankannya dari terminal:

```bash
sudo minios-installer
```

Wizard akan mengumpulkan pengaturan mode instalasi, keamanan, lokasi, jaringan kabel, keyboard, akun, modul, penyimpanan, dan boot. Tinjau geometri partisi dan ringkasan operasi secara detail sebelum menyetujui konfirmasi akhir yang bersifat destruktif.

## Penempatan dan tata letak boot

Penginstal grafis menawarkan pilihan penempatan berikut saat target memenuhi syarat:

- Hapus semua akan membuat tabel partisi baru dan menghapus semua data pada disk target.
- Ruang kosong menggunakan ruang yang belum teralokasi tanpa mengecilkan filesystem yang sudah ada.
- Bersisian akan mengecilkan partisi ext2, ext3, ext4, atau NTFS terakhir yang memenuhi syarat dan tidak ter-mount. Tata letak yang kotor, ter-mount, bersarang, ambigu, atau tidak aman akan ditolak. Installer mungkin meminta konfirmasi sebelum mengunduh alat filesystem yang belum tersedia.
- Partisi manual hanya tersedia untuk konversi native melalui GUI pada disk langsung yang memenuhi syarat. Perubahan akan disimpan sementara hingga konfirmasi akhir.

Tata letak boot otomatis yang didukung adalah BIOS/MBR, UEFI/MBR, dan UEFI/GPT. UEFI dapat digunakan dengan GPT atau MBR primer. BIOS didukung pada MBR primer, bukan GPT. Tata letak MBR extended atau logical preserve tidak didukung.

Mode manual dapat membuat, menghapus, memformat, dan menggunakan kembali partisi; mengecilkan filesystem yang didukung dari ujungnya; menetapkan mount point, partisi sistem EFI, dan swap; serta membatalkan atau mengatur ulang perubahan yang telah disiapkan. Tidak mendukung LVM, RAID, root LUKS native, penyimpanan mapped atau bersarang, bcache, ZFS, atau pengeditan subvolume Btrfs. Enkripsi LUKS2 untuk sesi persistensi live tidak mengenkripsi filesystem root native.

## Filesystem

- Tata letak live dapat menggunakan ext2, ext4, Btrfs, FAT32, atau NTFS jika alat yang dibutuhkan telah terpasang.
- Filesystem root yang dibuat melalui konversi native dapat menggunakan ext2, ext4, atau Btrfs. Ext4 adalah pilihan default serbaguna.
- Filesystem ext3 yang sudah ada dapat digunakan kembali atau diperkecil jika didukung, namun ext3 tidak tersedia untuk format baru.
- FAT32 hanya mendukung file berukuran kurang dari 4 GiB dan hanya tersedia untuk tata letak live.
- NTFS hanya tersedia untuk tata letak live, meskipun partisi NTFS yang memenuhi syarat dapat diperkecil untuk penempatan bersisian.

Ruang yang dibutuhkan mencakup data modul yang dipilih, aset boot, permintaan persistensi, dan cadangan filesystem sebesar 25 persen. Ruang EFI dan swap native dihitung secara terpisah.

## Konfigurasi dan keamanan

Installer dapat mengatur lokal, zona waktu, keyboard, nama pengguna, sandi, grup pengguna, hostname, layanan, menu boot, dan pemilihan modul. Memilih modul MiniOS yang lebih tinggi akan otomatis menyertakan lapisan bawah yang dibutuhkan.

Profil keamanan yang tersedia adalah `convenient`, `balanced`, dan `strict`. Mode live menggunakan default `convenient`; konversi native dimulai dari `balanced`. Kontrol SSH dan XRDP terpisah dari profil yang dipilih. Tinjau layanan akses jarak jauh sebelum koneksi jaringan pertama. Setelah konversi native, konfigurasi keamanan selanjutnya mengikuti workflow administrasi sistem Debian seperti biasa.

Konfigurasi jaringan mencakup hostname dan DHCP kabel atau IPv4 statis. Installer tidak membuat atau mengubah profil Wi-Fi. Konversi native dan beberapa operasi bersisian mungkin memerlukan akses jaringan, dengan persetujuan Anda, untuk mendapatkan GRUB, EFI, initramfs, `os-prober`, atau paket resize filesystem sebelum perubahan disk.

## Persistensi sesi live

Persistensi hanya berlaku untuk instalasi live. Ketika `minios-session` tersedia, Penginstal MiniOS dapat membuat dan mengaktifkan sesi bernomor langsung di target sebelum instalasi selesai. **Atur otomatis saat boot pertama** melewati langkah ini; MiniOS kemudian dapat membuat penyimpanan sesi nanti melalui logika persistensi saat boot seperti biasa.

Installer menawarkan backend penyimpanan berikut saat sistem berjalan dan target mendukungnya:

- `native` menyimpan perubahan sesi live langsung di direktori sesi pada filesystem target yang kompatibel dengan POSIX. Meskipun namanya demikian, ini adalah **backend persistensi live** dan tidak berhubungan dengan instalasi native. Tidak tersedia pada FAT32 atau NTFS.
- DynFileFS membuat penyimpanan ext4 berbasis file yang dapat diperluas. Ukuran yang dipilih adalah batas logis, bukan ruang yang dicadangkan di awal. Ukuran defaultnya adalah 4000 MiB.
- DynBlk membuat filesystem ext4 pada perangkat blok tipis yang disediakan oleh driver kernel DynBlk. Data sesi didukung oleh file `volumeNNN.db` yang dialokasikan sesuai kebutuhan, sehingga ukuran yang dipilih adalah batas logis, bukan penggunaan disk yang dialokasikan di awal. Installer menetapkan default sesi DynBlk baru ke 16384 MiB. Untuk sesi DynBlk yang tidak dienkripsi, installer dapat memilih codec kompresi yang didukung oleh sistem berjalan dan initrd yang disalin ke target.
- VMDK menggunakan driver DynBlk untuk membuat penyimpanan VMDK split sparse standar (`volume.vmdk` dan `volume-sNNN.vmdk`). Model alokasi tipis dan default 16384 MiB sama seperti DynBlk, namun kompresi backend tidak tersedia.
- Raw membuat image ext4 berukuran tetap dan langsung mencadangkan kapasitas yang dipilih. Ukuran defaultnya adalah 4000 MiB.

LUKS2 adalah lapisan enkripsi terpisah yang dapat membungkus penyimpanan sesi Raw, DynFileFS, DynBlk, atau VMDK. Installer hanya mengumpulkan passphrase yang dikonfirmasi untuk pembuatan sesi, mengirimkannya ke `minios-session` melalui input standar, dan tidak menaruhnya di argumen command-line, log, atau konfigurasi permanen. Passphrase ini kemudian diperlukan saat sesi terenkripsi dibuka saat boot. LUKS2 hanya ditawarkan jika lingkungan berjalan dan initrd target yang disalin mendukung kompatibilitas. Kompresi DynBlk dinonaktifkan jika LUKS2 dipilih.

DynBlk dan penyimpanan sesi VMDK tidak tersedia saat UEFI Secure Boot aktif karena modul kernel eksternal DynBlk yang digunakan backend ini belum ditandatangani oleh MiniOS. Kontainer Raw dibatasi hingga 4000 MiB pada FAT32; DynFileFS, DynBlk, dan penyimpanan VMDK split tidak bergantung pada satu file yang melebihi batas 4 GiB FAT32, meskipun batas backend dan ruang kosong tetap berlaku.

Karena installer membuat dan mengaktifkan sesi yang dipilih di target, proses ini tidak bergantung pada `perchmode` dan `perchsize` untuk membuat penyimpanan tersebut saat boot pertama. Parameter boot tersebut tetap menjelaskan pembuatan dan pemilihan persistensi berbasis initrd di luar jalur pre-created-session milik installer. Lihat [Manajemen sesi](/using-minios/Sessions-and-Persistence), [Persistensi initrd](/reference/boot-process/Persistence-Internals), dan [Parameter boot](/reference/Boot-Parameters).

## Deployment melalui command-line

`minios-deploy` ditujukan untuk otomatisasi, pengujian, dan pemulihan. Partisi manual dan pengaturan jaringan kabel interaktif hanya tersedia di GUI.

Daftar disk yang dikenali sebagai target instalasi:

```bash
minios-deploy list-disks
```

Ganti `/dev/sdb` pada setiap contoh dengan disk target yang telah diverifikasi. Cetak rencana non-destruktif terlebih dahulu:

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

Jalankan instalasi sebenarnya hanya setelah memeriksa rencana, identitas target, dan hasil dry-run. `--yes` mengizinkan perubahan destruktif:

```bash
sudo minios-deploy install /dev/sdb --mode live --placement free_space \
  --filesystem ext4 --persistence-mode dynfilefs --persistence-size 8000 \
  --security-profile balanced --yes
```

Jika Anda memang ingin melakukan konversi native ke ruang kosong yang sudah ada, gunakan opsi penyimpanan yang sama untuk perencanaan dan instalasi:

```bash
minios-deploy plan /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto
sudo minios-deploy install /dev/sdb --mode native --placement free_space \
  --filesystem ext4 --boot-layout auto --security-profile balanced \
  --download-packages --yes
```

Konversi native mungkin tidak muncul di bantuan CLI pada image yang tidak mendukung native-install. CLI juga menerima opsi konfigurasi untuk akun, lokal, zona waktu, keyboard, hostname, layanan, dan basis `config.conf`. Periksa opsi yang tersedia pada image yang sedang berjalan:

```bash
minios-deploy install --help
man minios-deploy
```

Hindari `--password` dan `--root-password` di lingkungan bersama karena argumen command-line dalam bentuk plaintext dapat terlihat di riwayat shell dan daftar proses. Gunakan penginstal grafis atau workflow konfigurasi yang terlindungi sebagai gantinya.
