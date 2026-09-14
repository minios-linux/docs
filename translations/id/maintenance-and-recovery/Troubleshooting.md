---
updated: 2026-09-13
---

# Pemecahan Masalah

Mulailah dengan observasi dan pengujian yang dapat dibatalkan. Jangan melakukan repartisi, format, perbaikan sistem file, menghapus sesi, atau mengganti file boot hanya untuk mencoba apakah itu membantu. Pastikan data penting sudah dicadangkan terlebih dahulu.

## Pemeriksaan awal

1. [Verifikasi image yang diunduh](/installing-minios/Verifying-Downloads).
2. Boot **Mulai tanpa menyimpan**. Jika masalah hilang, periksa sesi persisten atau konfigurasinya, bukan image dasarnya.
3. Hapus parameter boot dan filter modul kustom kecuali memang diperlukan untuk mereproduksi masalah.
4. Coba port USB lain dan, jika memungkinkan, perangkat atau komputer lain yang sudah dipastikan berfungsi baik.
5. Catat kesalahan pertama dan entri menu boot yang digunakan secara tepat, bukan hanya pesan terakhir yang muncul di layar.
6. Periksa [Kompatibilitas hardware](/getting-started/Hardware-Compatibility) jika image yang sudah diverifikasi gagal di satu mesin tetapi berfungsi di mesin lain.

## Perangkat tidak mencapai menu boot MiniOS

Pertama, tentukan bagaimana perangkat MiniOS dibuat.

- Untuk image yang ditulis secara langsung (`dd`, Etcher, mode DD Rufus, atau penulisan image dengan Utilitas Disk), jangan perbaiki file boot satu per satu. Jika salinan rusak, tulis ulang seluruh perangkat dari image yang sudah diverifikasi.
- Untuk instalasi berbasis file MiniOS, buat ulang tata letak bootable menggunakan metode instalasi terdokumentasi yang sama, bukan dengan menyalin file GRUB, Syslinux, atau EFI dari rilis lain.
- Ventoy memiliki bootloader dan tata letak sendiri. Jangan instal bootloader MiniOS di atas perangkat Ventoy; gunakan [prosedur Ventoy](/installing-minios/installation-tools/Ventoy) sebagai gantinya.
- Setelah konversi native, target akan menggunakan bootloader dan tata letak filesystem Debian konvensional. Tampilan desktop MiniOS masih dapat dipertahankan, namun infrastruktur live dan alat khusus live MiniOS tidak lagi tersedia. Cadangkan data yang masih bisa dipulihkan sebelum menggunakan prosedur perbaikan atau instalasi ulang bootloader Debian yang sesuai dengan BIOS/UEFI dan tata letak partisinya.

Jika perangkat yang baru dibuat ulang tetap tidak muncul di menu boot firmware, periksa mode firmware, dukungan Secure Boot pada arsitektur yang dipilih, port/perangkat USB, dan [kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Menu boot MiniOS muncul tetapi proses startup gagal

Hapus parameter opsional terlebih dahulu. Gunakan `debug` dan `timing` jika membutuhkan output early-boot yang lebih detail. `rd.break` digunakan untuk inspeksi initramfs tingkat lanjut, bukan untuk perbaikan.

Jika MiniOS tidak dapat menemukan sumbernya, lihat [Penemuan Sistem](/reference/boot-process/System-Discovery). Di shell initramfs, informasi read-only yang berguna meliputi:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Sebuah `from=askdisk` sementara dapat membantu mengidentifikasi perangkat yang benar-benar berisi data MiniOS. Setelah itu, gunakan sintaks `from=` yang sudah didokumentasikan daripada menebak nama perangkat.

Untuk startup PXE atau ISO HTTP, lihat [Network boot](/reference/boot-process/Network-Boot). Jaringan early-boot terpisah dari NetworkManager pada sesi yang berjalan.

### Kegagalan modul atau root-union

Lihat [Pemrosesan modul](/reference/boot-process/Module-Loading) untuk aturan pemilihan dan urutan modul yang sebenarnya. Secara khusus:

- `load=` dan `noload=` dapat mengecualikan modul dasar atau kernel yang penting; `noload=` akan menang jika keduanya cocok;
- kandidat dengan basename yang sama menempati slot pengganti yang sama;
- sebuah `.sb` nama file tidak membuktikan bahwa file tersebut adalah image SquashFS yang valid;
- kernel yang sedang berjalan harus sesuai dengan modul kernel dan file boot MiniOS yang terkoordinasi.

Setelah boot berhasil, periksa status sebenarnya tanpa mengubahnya:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Masalah tampilan

Untuk layar hitam, resolusi tidak dapat digunakan, atau loop display-manager:

1. Coba parameter boot `text`. Konsol yang berfungsi menandakan masalah grafis/desktop, bukan kegagalan boot lebih awal.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang ditentukan secara manual.
3. Uji **Mulai tanpa menyimpan** untuk mengabaikan konfigurasi tampilan yang persisten.
4. Catat GPU dan driver dengan `lspci -nnk`.
5. Periksa `journalctl -b -p warning` dan `dmesg --level=err,warn`.

Untuk mesin virtual, lihat [Virtualisasi](/maintenance-and-recovery/Virtualization).

## Masalah jaringan

Koneksi kabel dan Wi-Fi normal dikelola melalui NetworkManager; lihat [Jaringan](/using-minios/Networking).

Pertama, pastikan apakah antarmuka jaringan tersedia:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Jika tidak ada antarmuka, catat `lspci -nnk` atau `lsusb` dan periksa apakah ada kesalahan firmware atau driver di `dmesg`.
- Jika antarmuka tersedia tetapi tidak memiliki alamat, bedakan masalah koneksi/DHCP dari dukungan perangkat keras yang tidak tersedia.
- Jika alamat tersedia, uji gateway, lalu alamat IP, lalu nama DNS untuk memisahkan kegagalan link, routing, dan DNS.
- Parameter boot `ip=` digunakan untuk proses boot jaringan awal dan tidak mengonfigurasi koneksi NetworkManager yang permanen. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

## Masalah persistensi

Boot **Mulai tanpa menyimpan** sebelum mengubah penyimpanan persistensi yang dicurigai bermasalah. Jangan perbaiki atau hapus satu-satunya salinan sesi saat sesi tersebut masih aktif.

Periksa apa yang saat ini dilihat oleh MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Periksa mode boot yang dipilih, ruang tulis yang tersedia, kompatibilitas filesystem, dan kompatibilitas sesi. Aturan pemilihan detail ada di [Sesi dan persistensi](/using-minios/Sessions-and-Persistence) dan [Internal persistensi](/reference/boot-process/Persistence-Internals).

Jika sebuah sesi penting yang tidak berjalan `native`, `dynfilefs`, `dynblk`, `raw`, atau `luks` masih dapat dibaca, ekspor sesi tersebut **sebelum** mencoba-coba dengan penyimpanan:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Jika Session Manager tidak dapat membaca atau mengekspor sesi, hentikan penulisan ke sumber dan simpan salinan offline dari penyimpanan yang terdampak sebelum melanjutkan. Untuk sesi dynblk yang terlepas, `dynblk inspect /path/to/volume000.db` dan `dynblk check /path/to/volume000.db` memberikan diagnostik format hanya-baca; jangan jalankan pada volume yang masih terpasang. MiniOS tidak menyediakan prosedur manual universal untuk membangun ulang segmen DynFileFS, merekonstruksi bagian belakang dynblk, memperbaiki filesystem internal, atau merekonstruksi metadata sesi. Pemulihan seperti ini tergantung pada filesystem/container dan hanya boleh dilakukan pada salinan jika data tersebut memang sangat berharga.

Lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) untuk alur kerja backup dan impor sesi yang didukung.

## Masalah penyimpanan dan ruang kosong

Periksa perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Filesystem yang penuh dapat menyebabkan kegagalan operasi paket, penyimpanan sesi yang tidak lengkap, dan error sekunder lainnya. Kosongkan ruang dengan memindahkan atau menghapus data yang sudah diketahui hanya setelah memastikan filesystem yang benar. Gunakan Manajer Sesi MiniOS untuk menghapus sesi, bukan menghapus direktori sesi bernomor secara manual.

Perbaikan filesystem bukan operasi MiniOS yang umum. Jika filesystem rusak, unmount terlebih dahulu, amankan data penting atau buat image, lalu gunakan prosedur perbaikan yang sesuai dengan filesystem dan perangkat penyimpanan tersebut.

## Perubahan paket dan pembaruan sistem

Jika masalah muncul setelah ada perubahan paket APT, perlu diingat bahwa sesi live persistent dapat menimpa file dari modul MiniOS yang hanya-baca. Coba **Mulai tanpa menyimpan** untuk membandingkan dengan set modul asli. Lihat [Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk perbedaan antara pemeliharaan APT dan perubahan rilis MiniOS.

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

Hapus kredensial, private key, rahasia Wi-Fi, dan informasi pribadi lainnya sebelum membagikan log. Untuk bug yang dapat direproduksi, sertakan cuplikan yang relevan dan buka issue di [pelacak issue MiniOS](https://github.com/minios-linux/minios-live/issues).
