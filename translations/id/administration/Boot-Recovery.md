---
updated: 2026-08-26
---

# Pemulihan Boot

Perbaikan boot tergantung pada bagaimana MiniOS ditempatkan di perangkat dan apakah firmware memulainya dalam mode BIOS atau UEFI. Prosedur untuk satu tata letak dapat merusak tata letak lain. Cadangkan file penting sebelum menulis sektor boot, mengubah flag partisi, mengganti pohon EFI, atau menginstal ulang GRUB. Lihat [Backup dan pemulihan](/administration/Backup-Recovery.md). Jika jenis instalasi tidak pasti, bandingkan dengan [Mode Boot](/configuration/Boot-Modes.md) sebelum memilih alur kerja perbaikan.

## Identifikasi tata letak

- **ISO yang ditulis mentah:** `dd`, Etcher, Rufus dalam mode DD, atau penulis image serupa menyalin tata letak blok ISO ke seluruh perangkat. Perlakukan ini sebagai media image, bukan sebagai instalasi berbasis file biasa.
- **Instalasi live berbasis file:** perangkat memiliki filesystem normal dengan direktori `minios/` yang berisi modul SquashFS dan `minios/boot/`. Ini mencakup metode salin-file lama dan deployment live yang dibuat oleh MiniOS Installer.
- **Instalasi native:** MiniOS Installer mengekstrak modul ke filesystem root Linux konvensional. Ia menggunakan GRUB dan initramfs dari sistem yang telah diinstal, bukan tata letak modular live boot.

`Ventoy` biasanya menyimpan ISO sebagai file di bawah bootloader-nya sendiri. Perbaiki dengan prosedur di dokumentasi `Ventoy`; jangan instal sektor boot Syslinux MiniOS di atasnya.

## Diagnosis tanpa mengubah disk

Pertama, pastikan apakah kegagalan terjadi sebelum menu MiniOS, setelah menu, atau setelah kernel mulai berjalan. Periksa menu boot satu kali pada firmware dan catat apakah entri yang dipilih adalah UEFI atau BIOS lama (legacy). Coba port lain dan, jika memungkinkan, boot perangkat yang sama di komputer lain.

Dari media rescue Linux yang berfungsi, lakukan inspeksi tanpa memperbaiki:

```bash
lsblk -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,PARTTYPE,PARTFLAGS,MOUNTPOINTS,MODEL
findmnt
sudo blkid
sudo fdisk -l
```

Pada sistem yang boot dalam mode UEFI, `sudo efibootmgr -v` dapat menampilkan daftar entri firmware. Tidak adanya atau munculnya error tidak membuktikan bahwa file EFI hilang. Jangan format, repartisi, jalankan perbaikan filesystem, atau ubah flag hanya untuk pengujian. Pastikan setiap perangkat berdasarkan model dan kapasitas serta mount filesystem dalam mode read-only saat hanya melakukan inspeksi.

Jika menu boot muncul tetapi MiniOS tidak dapat menemukan modulnya, edit entri boot sementara dan coba `from=askdisk`. Setelah filesystem yang benar diketahui, label filesystem lebih stabil dibandingkan nama seperti `/dev/sdb1`:

```text
from=/dev/disk/by-label/MINIOS/minios
```

Label harus ada dan mengidentifikasi filesystem yang dimaksud; label sebaiknya unik. Tambahkan `debug timing` untuk output awal boot yang lebih detail. Tambahkan `rd.break` hanya jika shell initramfs diperlukan untuk inspeksi lanjutan. Opsi ini untuk diagnosis penemuan modul; tidak memperbaiki bootloader. Lihat [Penemuan sistem Initrd](/configuration/Initrd-System-Discovery.md) untuk bentuk `from=` yang didukung, perilaku `askdisk`, dan prioritas sumber. Lihat juga [Parameter boot](/configuration/Boot-Parameters.md) dan [Pemecahan masalah](/administration/Troubleshooting.md).

## Media ISO yang Ditulis Mentah

Jangan jalankan `bootinst.sh`, instal GRUB, atau salin file boot individual ke perangkat ISO yang ditulis mentah. Peta partisi, rekaman boot, file ISO, dan file EFI membentuk satu image. Jika ISO yang sudah diverifikasi dapat boot di tempat lain tetapi salinan ini tidak, amankan data yang disimpan di luar tata letak image dan tulis ulang seluruh perangkat dari ISO yang sudah diverifikasi. Lihat [Verifikasi Unduhan](/installation/Verifying-Downloads.md) dan [Instalasi MiniOS](/installation/Installing-MiniOS.md).

Jika menulis ulang image yang sama tetap gagal, coba perangkat lain dan periksa kompatibilitas firmware serta hardware, bukan terus-menerus memodifikasi image.

## Instalasi Live Berbasis File

### Installer bundel pada media MBR

Installer bundel hanya cocok digunakan jika semua kondisi berikut terpenuhi:

- Perangkat merupakan instalasi live berbasis file pada disk yang dipartisi MBR.
- Direktori `minios/boot/syslinux/` lengkap, utuh, dan berasal dari pohon serta rilis MiniOS yang sama dengan aset boot lainnya.
- Filesystem yang ter-mount beserta perangkat disk induknya telah teridentifikasi tanpa menebak.

Jalankan skrip dari direktori tersebut pada filesystem target:

```bash
cd /media/$USER/<target>/minios/boot/syslinux
sudo ./bootinst.sh
```

Skrip ini menentukan targetnya dari filesystem tempat skrip berada. Skrip akan menginstal Syslinux di sana, menulis 440 byte kode boot MBR ke disk induk, mungkin mengubah flag partisi aktif, dan menyalin pohon loader UEFI bundel ke filesystem target. Mount atau perangkat yang salah dapat membuat sistem lain tidak dapat boot. Jangan gunakan pada disk GPT atau EFI System Partition yang digunakan bersama, jangan hanya menyalin `bootinst.sh` ke pohon yang rusak lalu menjalankannya, dan jangan gunakan aset dari rilis MiniOS yang berbeda.

Pada Windows, path yang sesuai adalah:

```text
X:\minios\boot\syslinux\bootinst.bat
```

Jalankan sebagai administrator hanya dari perangkat removable yang dimaksudkan. Skrip akan menolak disk sistem Windows yang terdeteksi, namun pengecekan ini bukan pengganti untuk memverifikasi huruf drive dan perangkat fisik.

### UEFI

Boot UEFI tidak menggunakan kode BIOS MBR. Firmware membutuhkan EFI System Partition atau filesystem FAT yang dapat dibaca dan pohon loader yang valid. Pulihkan hanya pohon `EFI/boot` yang lengkap dan sesuai beserta file MiniOS EFI terkait dari image atau backup yang persis digunakan untuk instalasi tersebut. Jangan menggabungkan file eksekusi EFI dari satu rilis dengan konfigurasi GRUB atau file `minios/boot` dari rilis lain.

`bootinst.sh` bundel juga menyalin pohon loader UEFI yang sesuai, namun tetap melakukan penulisan MBR dan Syslinux seperti dijelaskan di atas. Gunakan hanya untuk layout MBR berbasis file seperti dijelaskan pada bagian sebelumnya, bukan sebagai alat perbaikan UEFI umum.

Menyalin satu file `.efi` saja dapat menyebabkan rantai loader tidak lengkap. Jika pohon EFI lengkap yang tepat tidak tersedia, instal ulang layout live berbasis file daripada mencoba rekonstruksi parsial. Jaga agar direktori vendor dan sistem operasi lain tetap utuh pada EFI System Partition yang digunakan bersama.

`minios-deploy` menyediakan operasi `plan` dan `install`, bukan operasi perbaikan boot. Jangan arahkan perintah instalasi ke disk yang sudah ada sebagai upaya perbaikan. Lihat [MiniOS Installer](/installation/MiniOS-Installer.md) untuk layout instalasi yang didukung.

## Instalasi Native

### BIOS GRUB dari chroot

Gunakan prosedur ini hanya untuk instalasi native yang diinstal untuk BIOS legacy pada disk MBR. Proses ini menulis GRUB ke seluruh disk dan dapat menggantikan kode boot yang digunakan oleh sistem operasi lain. Jangan gunakan untuk UEFI, GPT, layout live berbasis file, atau ISO yang ditulis mentah.

Boot media rescue Linux yang terpercaya, identifikasi partisi root native dan disk induknya, lalu ganti path nyata pada contoh di bawah. Pada contoh ini, `/dev/sdXN` adalah partisi root dan `/dev/sdX` adalah disk induk. Jangan pernah memasukkan partisi seperti `/dev/sdX1` ke perintah `grub-install` terakhir.

```bash
sudo mount /dev/sdXN /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /dev/pts /mnt/dev/pts
sudo mount -t proc proc /mnt/proc
sudo mount -t sysfs sysfs /mnt/sys
sudo mount --bind /run /mnt/run
sudo chroot /mnt /bin/bash
update-grub
grub-script-check /boot/grub/grub.cfg
grub-install --target=i386-pc --recheck /dev/sdX
exit
sudo umount /mnt/run /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev
sudo umount /mnt
```

Mount partisi `/boot` native terpisah di `/mnt/boot` sebelum bind mount, lalu unmount sebelum `sudo umount /mnt` terakhir. Jangan mount EFI System Partition untuk prosedur khusus BIOS ini. Jika root menggunakan LUKS, LVM, RAID, atau layout yang tidak sepenuhnya dipahami, hentikan dan gunakan metode pemulihan khusus untuk stack storage tersebut. Jika `update-grub`, `grub-script-check`, atau `grub-install` gagal, jangan lanjutkan dengan mengubah tabel partisi atau mencoba disk lain.

### Native UEFI

Rekonstruksi manual UEFI native tidak aman untuk digeneralisasi. Proses ini tergantung pada arsitektur EFI yang tepat, rantai loader, status paket, layout mount, status Secure Boot, perilaku firmware, dan apakah EFI System Partition digunakan bersama. Penyalinan file generik atau perintah `grub-install` dapat menimpa fallback loader sistem operasi lain.

Lebih disarankan untuk memulihkan backup root native, konten EFI System Partition, dan konfigurasi boot yang sudah diuji dan sesuai. Jika tidak memungkinkan, cadangkan data pengguna dan instal ulang sistem native dengan MiniOS Installer. Jangan adaptasi prosedur penyalinan live berbasis file `EFI/boot` ke instalasi native.

## Rollback kernel modular

Untuk instalasi live berbasis file yang gagal booting setelah perubahan kernel,
gunakan media rescue dari rilis dan arsitektur MiniOS yang sama. Pada menu boot-nya, gunakan `from=askdisk` atau path label stabil untuk memilih pohon `minios/` yang terpasang.
Pohon yang dipilih harus berisi triplet lengkap yang cocok dengan kernel yang sudah dimuat dari media rescue; initrd tidak dapat mengganti kernel yang sedang berjalan. Lihat
[koordinasi kernel yang berjalan](/configuration/Initrd-Module-Loading.md)
untuk detail path modul, image kernel, dan initramfs serta perilakunya.

Jika kombinasi tersebut berhasil mencapai sistem yang berjalan dan pohon yang terpasang dapat ditulis, periksa set kernel yang terkoordinasi dan aktifkan salah satu yang sudah terbukti berfungsi:

```bash
sudo minios-kernel list
sudo minios-kernel status
sudo minios-kernel activate <working-version>
```

Aktivasi harus mengembalikan modul kernel, image kernel, initramfs, dan konfigurasi bootloader yang terkoordinasi. Jangan hanya mengganti `vmlinuz`, hanya initramfs, atau hanya `01-kernel*.sb`. Pertahankan kernel paket sebelumnya sampai penggantiannya berhasil booting. Lihat
[Manajemen Kernel](/administration/Kernel-Management.md).

Rollback ini hanya untuk instalasi live modular. Instalasi native menggunakan paket kernel dan GRUB yang sudah terpasang dan membutuhkan recovery native atau instalasi ulang.

## Kapan Harus Instal Ulang

Cadangkan data yang masih bisa diselamatkan dan lakukan instal ulang daripada memperbaiki jika salah satu kondisi berikut terjadi:

- ISO yang ditulis mentah rusak atau telah dimodifikasi sebagian.
- Syslinux, GRUB, kernel, initramfs, atau aset EFI lengkap yang cocok tidak tersedia.
- Tabel partisi, filesystem, atau EFI System Partition rusak selain bootloader.
- Disk target atau perangkat induk tidak dapat diidentifikasi dengan pasti.
- Rantai loader UEFI native harus direkonstruksi tanpa backup yang persis sama.
- Error baca berulang, disk terputus, atau error SMART menandakan media bermasalah.
- Perintah perbaikan gagal dan langkah berikutnya membutuhkan tebakan atau menimpa data boot lain yang tidak terkait.

Instal ulang akan mengembalikan tata letak boot yang sudah terkoordinasi; proses ini tidak memulihkan data pengguna yang belum dicadangkan atau data persistensi. Salin data penting terlebih dahulu selama filesystem masih bisa dibaca.
