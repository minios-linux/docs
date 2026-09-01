---
updated: 2026-08-31
---

# Pemecahan Masalah

Mulailah dengan observasi dan pengujian yang dapat dibatalkan. Jangan melakukan repartisi, format, perbaikan sistem berkas, menghapus sesi, atau mengganti berkas boot hanya untuk mencoba apakah itu membantu. Pastikan data penting sudah diamankan terlebih dahulu.

## Pemeriksaan Awal

1. [Verifikasi citra yang diunduh](/installing-minios/Verifying-Downloads).
2. Boot dengan **Mulai tanpa menyimpan**. Jika masalah hilang, periksa sesi persisten atau konfigurasinya, bukan citra dasarnya.
3. Hapus parameter boot dan filter modul kustom kecuali memang diperlukan untuk mereproduksi masalah.
4. Coba port USB lain dan, jika memungkinkan, perangkat atau komputer lain yang sudah terbukti berfungsi.
5. Catat pesan error pertama dan entri menu boot yang digunakan, bukan hanya pesan terakhir yang muncul di layar.
6. Periksa [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) jika citra yang sudah diverifikasi gagal di satu mesin tetapi berfungsi di mesin lain.

## Perangkat tidak mencapai menu boot MiniOS

Pertama, tentukan bagaimana perangkat MiniOS dibuat.

- Untuk image yang ditulis secara mentah (`dd`, Etcher, Rufus DD mode, atau penulisan image dengan Utilitas Disk), jangan memperbaiki file boot secara individual. Jika salinan rusak, tulis ulang seluruh perangkat dari image yang telah diverifikasi.
- Untuk instalasi berbasis file MiniOS, buat ulang tata letak bootable menggunakan metode instalasi terdokumentasi yang sama, bukan dengan menyalin file GRUB, Syslinux, atau EFI dari rilis lain.
- Ventoy memiliki bootloader dan tata letak sendiri. Jangan instal bootloader MiniOS di atas perangkat Ventoy; gunakan prosedur [Ventoy](/installing-minios/installation-tools/Ventoy) sebagai gantinya.
- Setelah konversi native, target menggunakan bootloader Debian konvensional dan tata letak filesystem standar. Tampilan desktop MiniOS masih dapat dipertahankan, namun infrastruktur live dan alat khusus live MiniOS tidak lagi tersedia. Cadangkan data yang dapat dipulihkan sebelum menggunakan prosedur perbaikan atau instalasi ulang bootloader Debian yang sesuai dengan BIOS/UEFI dan tata letak partisi perangkat tersebut.

Jika perangkat yang baru dibuat ulang tetap tidak muncul di menu boot firmware, periksa mode firmware, dukungan Secure Boot pada arsitektur yang dipilih, port/perangkat USB, dan [kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Menu boot MiniOS muncul tetapi startup gagal

Hapus parameter opsional terlebih dahulu. Gunakan `debug` dan `timing` jika membutuhkan output awal boot yang lebih detail. `rd.break` hanya untuk inspeksi lanjutan initramfs, bukan perbaikan.

Jika MiniOS tidak dapat menemukan sumbernya, lihat [Penemuan Sistem](/reference/boot-process/System-Discovery). Pada shell initramfs, informasi read-only yang berguna meliputi:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

`from=askdisk` sementara dapat membantu mengidentifikasi perangkat yang benar-benar berisi data MiniOS. Setelah itu, gunakan sintaks `from=` yang terdokumentasi, bukan menebak nama perangkat.

Untuk startup ISO PXE atau HTTP, lihat [Network boot](/reference/boot-process/Network-Boot). Jaringan awal boot terpisah dari NetworkManager pada sesi yang sedang berjalan.

### Kegagalan modul atau root-union

Lihat [Pemuatan modul](/reference/boot-process/Module-Loading) untuk aturan pemilihan dan urutan modul yang sebenarnya. Secara khusus:

- `load=` dan `noload=` dapat mengecualikan modul dasar atau kernel yang penting; `noload=` menang jika keduanya cocok;
- kandidat dengan basename yang sama akan menempati slot pengganti yang sama;
- nama berkas `.sb` tidak membuktikan bahwa berkas tersebut adalah citra SquashFS yang valid;
- kernel yang berjalan harus sesuai dengan modul kernel dan berkas boot MiniOS yang terkoordinasi.

Setelah boot berhasil, inspeksi keadaan aktual tanpa mengubahnya:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Masalah tampilan

Untuk layar hitam, resolusi tidak dapat digunakan, atau loop display-manager:

1. Coba parameter boot `text`. Konsol yang berfungsi akan membedakan masalah grafis/desktop dari kegagalan boot sebelumnya.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang ditentukan secara manual.
3. Uji **Mulai tanpa menyimpan** untuk menyingkirkan konfigurasi tampilan persisten.
4. Catat GPU dan driver dengan `lspci -nnk`.
5. Periksa `journalctl -b -p warning` dan `dmesg --level=err,warn`.

Untuk mesin virtual, lihat [Virtualisasi](/maintenance-and-recovery/Virtualization).

## Masalah jaringan

Koneksi kabel dan Wi-Fi normal dikelola melalui NetworkManager; lihat [Jaringan](/using-minios/Networking).

Pertama, tentukan apakah antarmuka tersedia:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Jika tidak ada antarmuka, catat `lspci -nnk` atau `lsusb` dan cari error firmware atau driver di `dmesg`.
- Jika antarmuka ada tapi tidak memiliki alamat, bedakan masalah koneksi/DHCP dari dukungan perangkat keras yang hilang.
- Jika alamat ada, uji gateway, lalu alamat IP, lalu nama DNS untuk memisahkan kegagalan link, routing, dan DNS.
- Parameter boot `ip=` hanya untuk network boot awal dan tidak mengonfigurasi koneksi NetworkManager yang persisten. Lihat [Network boot](/reference/boot-process/Network-Boot).

## Masalah persistensi

Boot dengan **Mulai tanpa menyimpan** sebelum mengubah media persistensi yang dicurigai bermasalah. Jangan memperbaiki atau menghapus satu-satunya salinan sesi saat sesi tersebut sedang aktif.

Periksa apa yang saat ini dilihat oleh MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Periksa mode boot yang dipilih, ruang tulis yang tersedia, kompatibilitas sistem berkas, dan kompatibilitas sesi. Aturan seleksi detail ada di [Sesi dan persistensi](/using-minios/Sessions-and-Persistence) dan [Internal persistensi](/reference/boot-process/Persistence-Internals).

Jika sesi `native`, `dynfilefs`, `raw`, atau `luks` penting yang tidak sedang berjalan masih dapat dibaca, ekspor terlebih dahulu **sebelum** bereksperimen dengan media penyimpanan:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Jika Session Manager tidak dapat membaca atau mengekspor sesi, hentikan penulisan ke sumber dan amankan salinan offline dari media yang terdampak sebelum melanjutkan. MiniOS tidak menyediakan prosedur manual universal untuk membangun ulang segmen DynFileFS, memperbaiki sistem berkas di dalamnya, atau merekonstruksi metadata sesi. Pemulihan semacam ini spesifik untuk filesystem/container dan sebaiknya hanya dilakukan pada salinan jika nilai datanya memang layak.

Lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) untuk alur kerja backup dan impor sesi yang didukung.

## Masalah penyimpanan dan ruang kosong

Periksa perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Filesystem yang penuh dapat menyebabkan operasi paket gagal, penyimpanan sesi tidak lengkap, dan error sekunder lainnya. Kosongkan ruang dengan memindahkan atau menghapus data yang sudah diketahui hanya setelah memastikan filesystem yang benar. Gunakan Manajer Sesi MiniOS untuk menghapus sesi, bukan menghapus direktori sesi bernomor secara manual.

Perbaikan filesystem bukan operasi MiniOS yang bersifat umum. Jika filesystem itu sendiri rusak, unmount terlebih dahulu, amankan data penting atau image, lalu gunakan prosedur perbaikan yang sesuai dengan filesystem dan perangkat penyimpanan tersebut.

## Perubahan paket dan pembaruan sistem

Jika masalah muncul setelah perubahan paket APT, ingat bahwa sesi persisten live dapat menimpa berkas dari modul MiniOS yang hanya-baca. Uji **Mulai tanpa menyimpan** untuk membandingkan dengan set modul asli. Lihat [Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk perbedaan antara pemeliharaan APT dan perubahan rilis MiniOS.

## Mengumpulkan log

Informasi yang berguna meliputi:

```bash
uname -a
cat /etc/os-release
journalctl -b
journalctl -b -p warning
dmesg
lsblk -f
lspci -nnk
lsusb
```

Untuk kegagalan boot berulang pada media MiniOS yang dapat ditulis, `EXPORT_LOGS=true` di `config.conf` mengekspor log boot di bawah `minios/log/`. Lihat [config.conf](/reference/configuration/config.conf).

Hapus kredensial, kunci privat, rahasia Wi-Fi, dan informasi pribadi lain sebelum membagikan log. Untuk bug yang dapat direproduksi, sertakan potongan yang relevan dan buka isu di [pelacak isu MiniOS](https://github.com/minios-linux/minios-live/issues).
