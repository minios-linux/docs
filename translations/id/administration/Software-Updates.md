# Pembaruan perangkat lunak

MiniOS menggabungkan modul image SquashFS hanya-baca dengan overlay runtime yang dapat ditulis. Metode pembaruan harus sesuai dengan lapisan yang diubah. Memperbarui paket di dalam sesi yang sedang berjalan tidak sama dengan mengganti modul pada media MiniOS.

## Memperbarui paket dengan APT

APT menulis ke overlay runtime. Aktifkan dan gunakan sesi persisten sebelum
melakukan pembaruan jika perubahan harus tetap ada setelah reboot:

```bash
sudo apt update
sudo apt upgrade
```

Tanpa persistensi, perubahan paket akan hilang saat shutdown. Dengan persistensi,
file yang diperbarui dan status APT tetap ada di sesi tersebut, namun modul image `.sb`
dasar tidak berubah. Sesi baru tetap menggunakan versi paket yang ada di image.

APT cocok untuk memelihara satu instalasi persisten. Periksa ketersediaan ruang terlebih dahulu karena file yang diperbarui akan disimpan selain modul dasar yang terkompresi. MiniOS tidak mendukung upgrade in-place antar rilis. Jangan perlakukan upgrade rilis Debian sebagai upgrade image MiniOS; lakukan backup data Anda dan gunakan image yang dibuat untuk rilis target.

## Memperbarui perangkat lunak dengan modul

Modul `.sb` adalah perangkat lunak hanya-baca yang dimuat saat boot. Modul bersifat tahan lama jika disimpan di direktori `modules/` MiniOS yang dapat ditulis atau sumber modul persistensi yang tahan lama. Modul tidak memerlukan perubahan paket untuk disimpan di sesi.

Periksa set modul untuk boot berikutnya sebelum dan sesudah menambahkan modul:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` memvalidasi dan mempublikasikan modul baru secara atomik, tetapi tidak menimpa modul yang sudah ada dengan nama yang sama. Hapus modul pengguna yang dapat diganti terlebih dahulu jika pembaruan memang menggunakan basename yang sama:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Modul dasar dan modul di media hanya-baca tidak dapat dihapus dengan perintah ini. Bangun atau dapatkan modul yang diperbarui untuk arsitektur, rilis distribusi, dan stack modul yang sama. Modul dengan nomor lebih tinggi akan menimpa lapisan di bawahnya, sehingga modul add-on lama juga dapat menimpa file yang disediakan oleh image dasar yang lebih baru.

Untuk perangkat lunak yang dikemas secara lokal, `apt2sb upgrade` dapat membuat modul pembaruan. Lihat [Membuat modul](/development/Creating-Modules.md) untuk detail pembuatan modul dan tingkat dependensi.

## Mengganti modul image

Pembaruan image resmi menggantikan file di media MiniOS; `apt upgrade` tidak
memperbaruinya. Disarankan untuk mengganti seluruh set modul dasar dan file boot yang sesuai dari satu rilis MiniOS, atau melakukan instalasi ulang dari image baru. Jangan mencampur file core, desktop, aplikasi, firmware, atau boot dari rilis yang berbeda kecuali kompatibilitasnya sudah didokumentasikan.

Sebelum penggantian:

1. Cadangkan konfigurasi MiniOS, data persistensi, modul pengguna, dan modul dasar saat ini seperti dijelaskan di [Backup dan
   pemulihan](/administration/Backup-Recovery.md).
2. Catat daftar modul aktif dan modul untuk boot berikutnya dengan `sb list` dan
   `sb next-boot`.
3. Lakukan penggantian dari sistem lain atau dari boot yang dimuat ke RAM sehingga
   file sumber tidak sedang digunakan.
4. Simpan file sebelumnya hingga image baru berhasil boot dan perangkat keras serta aplikasi yang diperlukan sudah diuji.

Pertahankan nama dasar modul dan urutannya jika rilis menginstruksikan penggantian langsung. Sumber yang lebih baru dengan nama dasar yang sama akan menggantikan sumber sebelumnya dalam seleksi boot berikutnya; salinan dengan nama berbeda dapat sama-sama dimuat dan menghasilkan urutan layer yang tidak diinginkan.

## Memperbarui kernel

Kernel adalah satu set terkoordinasi: modul driver `01-kernel.sb`, image kernel, initramfs, dan konfigurasi bootloader harus sesuai. Gunakan MiniOS Kernel Manager atau perintah `minios-kernel` daripada hanya memperbarui paket `linux-image` dengan APT.

Daftar dan paketkan kernel repositori, lalu aktifkan untuk boot berikutnya:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

Aktivasi akan memperbarui konfigurasi boot MiniOS. Reboot untuk menjalankan kernel yang dipilih, lalu verifikasi dengan `uname -r`. Simpan minimal satu kernel yang sudah terbukti berfungsi beserta file boot-nya hingga perangkat keras, penyimpanan, jaringan, dan driver eksternal telah diuji. Modul kernel standar MiniOS mungkin mencakup driver tambahan yang tidak tersedia di kernel repositori distribusi.

Lihat [Manajemen Kernel](/administration/Kernel-Management.md) untuk alur kerja grafis, opsi perintah, dan prosedur pemulihan.

## Kompatibilitas dan pemulihan

Cadangkan persistensi sebelum mengganti image dasar atau kernel. File paket persisten dan metadata dapat menimpa modul dasar baru atau mendeskripsikan versi paket yang tidak lagi cocok. Uji image baru dengan sesi baru terlebih dahulu, lalu uji salinan sesi yang sudah ada. Simpan image asli, modul, dan cadangan sesi hingga rollback tidak lagi diperlukan.

Setelah pembaruan apa pun, verifikasi modul yang dipilih, boot sekali, dan periksa aplikasi serta perangkat keras yang terpengaruh. Jika image dasar baru bertabrakan dengan modul pengguna lama atau persistensi, nonaktifkan lapisan tersebut dan aktifkan kembali satu per satu.
