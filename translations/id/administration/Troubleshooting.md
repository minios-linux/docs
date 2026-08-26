---
updated: 2026-08-26
---

# Pemecahan Masalah

Mulailah dengan observasi dan pengujian yang dapat dibatalkan. Jangan melakukan repartisi, format ulang, perbaikan sistem berkas, menghapus sesi, atau menimpa file boot sebelum data penting dicadangkan dan perangkat yang bermasalah telah diidentifikasi berdasarkan model, ukuran, sistem berkas, dan titik mount.

Gunakan [Backup dan pemulihan](/administration/Backup-Recovery.md) sebelum melakukan tindakan destruktif dan [Pemulihan boot](/administration/Boot-Recovery.md) jika firmware, bootloader, kernel, atau file boot yang terpasang terlibat.

## Pemeriksaan awal

1. Verifikasi ISO yang telah diunduh menggunakan
   [Memverifikasi unduhan](/installation/Verifying-Downloads.md).
2. Uji boot baru tanpa persistensi. Ini memisahkan masalah sistem dasar dan perangkat keras dari sesi yang rusak atau tidak kompatibel.
3. Coba port USB lain dan, jika memungkinkan, perangkat lain yang sudah terbukti baik.
4. Catat entri menu boot secara persis, parameter yang ditambahkan, dan kesalahan pertama, bukan hanya kegagalan akhirnya.
5. Periksa [Kompatibilitas perangkat keras](/installation/Hardware-Compatibility.md) dan panduan untuk alat yang digunakan menulis perangkat.

## Masalah boot

Jika perangkat tidak muncul di menu boot firmware, periksa apakah perangkat tersebut ditulis untuk UEFI, BIOS legacy, atau keduanya. Nonaktifkan fast boot firmware sementara, coba menu boot sekali pakai dari firmware, dan uji port lain sebelum menulis ulang perangkat. Jangan mengubah tabel partisi disk internal untuk mendiagnosis masalah boot USB.

Jika menu boot MiniOS muncul tetapi proses startup gagal:

- Boot sesi baru tanpa `perch`, `perchdir`, atau `perchmode`.
- Hapus parameter opsional dan filter modul.
- Pastikan ISO dan media yang ditulis tidak korup.
- Catat kesalahan secara lengkap. Parameter `debug` dan `timing` menampilkan output boot;
  `rd.break` membuka shell initramfs untuk diagnosis lanjutan.
- Jika data MiniOS tidak ditemukan, periksa nilai `from` dan jalur perangkat terhadap
  [Parameter boot](/configuration/Boot-Parameters.md).

Untuk startup ISO PXE atau HTTP, gunakan panduan khusus
[Network boot](/installation/Network-Boot.md). Jaringan boot awal terpisah dari NetworkManager di sesi berjalan.

### Kegagalan sumber MiniOS

Gunakan [Penemuan sistem Initrd](/configuration/Initrd-System-Discovery.md) untuk aturan prioritas sumber dan jalur secara lengkap. Detail yang paling berguna saat diagnosis adalah:

- Literal `from=http://...` mengalahkan `ip=`; `ip=` kemudian menyediakan alamat HTTP ISO statis. Jika tidak, setiap `ip=` yang tidak kosong akan memilih PXE. Tidak ada jalur jaringan yang akan kembali ke media lokal.
- Penemuan lokal melakukan 45 kali percobaan dan menguji nama perangkat blok secara berurutan. Ia mempertahankan perangkat pertama yang berisi sumber yang memenuhi syarat, tidak selalu perangkat yang dimaksud atau set modul yang lengkap.
- `/dev/disk/by-label/LABEL/path` didukung di `from=`. Jalur UUID, PARTUUID, dan by-id tidak didukung oleh parser ini.
- Sintaks jalur kustom yang tepat untuk selector menggunakan tanda titik dua, misalnya `from=askdisk:custom:dir`. Sintaks garis miring secara diam-diam akan menguji jalur default `minios` sebagai gantinya.
- Jika penemuan masuk ke shell initramfs fatal, keluar tidak akan memperbaiki sumber atau menyediakan fallback. Ini hanya memungkinkan proses boot berlanjut ke kegagalan berikutnya yang kurang jelas.

Pada shell initramfs, mulai dengan inspeksi hanya-baca:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Catat kesalahan sumber, mount, atau unduhan pertama. Jangan jalankan perbaikan filesystem atau melepas media saat masih ter-mount.

### Kegagalan modul dan root

Gunakan [Pemrosesan modul Initrd](/configuration/Initrd-Module-Loading.md) untuk aturan pemilihan, urutan, dan union. Periksa penyebab umum berikut terlebih dahulu:

- `load=` dan `noload=` adalah filter regular-expression. Tidak ada set inti atau kernel yang dilindungi, sehingga sebuah filter dapat mengecualikan `00-core` atau modul `01-kernel` dari kernel yang sedang berjalan; `noload=` menang jika kedua filter cocok.
- Jalur modul diratakan ke nama dasar (basename). Dua kandidat dengan nama dasar yang sama menempati satu slot pengganti, sehingga tier sumber berikutnya dapat menggantikan kandidat sebelumnya, bukan menambah lapisan baru.
- Akhiran `.sb` tidak membuktikan bahwa kandidat adalah image SquashFS yang valid. Kegagalan mount loop atau modul secara individual dapat memungkinkan boot tetap berlanjut dengan lapisan yang hilang. Catat kesalahan mount pertama.
- `toram=full` dan `toram=trim` tidak memeriksa ketersediaan RAM terlebih dahulu. Kegagalan copy atau detach dapat membuat sumber asli tetap ter-mount, jadi jangan cabut media atau putuskan koneksi HTTP hanya karena `toram` telah ditentukan.

Setelah handoff berhasil, perintah berikut dapat memeriksa status tanpa mengubahnya:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

Untuk pemilihan dan kegagalan writable-layer, lihat [Persistensi Initrd](/configuration/Initrd-Persistence.md). Persistensi dapat kembali ke RAM upper sementara setelah beberapa kegagalan aktivasi, sementara kegagalan membangun root union akan masuk ke shell initramfs fatal.

## Masalah tampilan

Untuk layar hitam, resolusi tidak terbaca, atau loop display-manager:

1. Coba parameter boot `text`. Jika konsol berhasil dimulai, sistem dasar sudah boot dan kemungkinan masalah ada pada grafis, X11, atau display manager.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang ditentukan secara manual.
3. Uji sesi baru untuk memastikan konfigurasi tampilan persisten tidak berpengaruh.
4. Catat GPU dan driver yang dimuat dengan `lspci -nnk`.
5. Periksa error pada boot saat ini dengan `journalctl -b -p warning` dan `dmesg --level=err,warn`.

Kontrol resolusi mesin virtual yang didokumentasikan sebagai `virtres` dan `novirtres` hanya berlaku untuk lingkungan Xfce. Lihat [Virtualisasi](/administration/Virtualization.md) untuk pengaturan khusus guest.

## Masalah jaringan

Untuk pengaturan kabel dan Wi-Fi normal, persistensi, dan perintah NetworkManager, lihat [Konfigurasi jaringan](/configuration/Network-Configuration.md).

Pastikan antarmuka sudah ada sebelum mengubah konfigurasi:

```bash
ip link
ip address
ip route
```

Untuk sesi berjalan normal, periksa NetworkManager jika tersedia:

```bash
nmcli device status
nmcli connection show
systemctl status NetworkManager --no-pager
```

- Jika tidak ada antarmuka yang muncul, catat output `lspci -nnk` atau `lsusb` dan periksa firmware yang hilang di `dmesg`.
- Jika antarmuka ada tapi belum memiliki alamat, uji DHCP sebelum memasukkan nilai statis.
- Jika alamat sudah ada, uji gateway, lalu alamat IP, lalu nama DNS untuk membedakan kegagalan link, routing, dan DNS.
- Installer mengonfigurasi DHCP kabel atau IPv4 statis. Profil Wi-Fi yang sudah ada tidak diubah.
- Parameter boot `ip=` mengonfigurasi unduhan PXE awal, bukan jaringan sesi persisten. Lihat [Network boot](/installation/Network-Boot.md).

## Masalah persistensi

Boot pertama tanpa persistensi dan buat salinan lengkap direktori `minios/changes`. Jangan jalankan alat perbaikan pada satu-satunya salinan atau pada sesi yang sedang aktif.

Periksa status sesi dengan:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Penyebab umum meliputi boot pada entri baru, menggunakan metode penulisan ISO yang tidak pernah mengonfigurasi persistensi, ruang kosong tidak cukup, memilih sesi dari edisi atau versi yang berbeda, ketidakcocokan filesystem, dan shutdown yang tidak bersih. Lihat [Manajemen sesi](/configuration/Session-Management.md).

Jika MiniOS berulang kali membuat sesi kosong, tidak bisa melanjutkan DynFileFS, atau melaporkan error container, ikuti [Pemulihan DynFileFS dan dynblk](/configuration/DynFileFS-Recovery.md). Panduan tersebut dimulai dengan salinan penuh dan pemeriksaan hanya-baca. Sesi LUKS juga memerlukan passphrase yang benar dan initrd dengan dukungan persistensi LUKS.

## Masalah penyimpanan dan ruang

Identifikasi perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Pastikan model dan ukuran perangkat sebelum melakukan operasi apa pun. Filesystem penuh dapat menyebabkan pembaruan gagal, penulisan sesi tidak lengkap, dan pemulihan saat boot. Bebaskan ruang dengan memindahkan atau menghapus data pengguna yang diketahui hanya setelah melakukan backup; jangan hapus direktori persistensi bernomor secara manual saat salah satu sedang aktif. Gunakan Session Manager atau `minios-session` untuk operasi sesi.

Perbaikan filesystem adalah langkah berikutnya. Unmount filesystem terlebih dahulu, kerjakan pada salinan jika memungkinkan, dan gunakan alat pemeriksaan khusus filesystem. Jangan pernah memformat perangkat sebagai tes diagnostik.

## Kumpulkan log

Catat edisi dan versi MiniOS, metode boot, mode persistensi, perangkat keras, dan langkah-langkah untuk mereproduksi masalah. Perintah yang berguna meliputi:

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

Hapus kata sandi, private key, kredensial nirkabel, alamat IP publik, dan data sensitif lain sebelum membagikan log. `journalctl -b -1` dapat menampilkan boot sebelumnya jika journal bersifat persisten.

Untuk kegagalan boot berulang pada media MiniOS yang dapat ditulis, setel `EXPORT_LOGS=true` di file konfigurasi. MiniOS akan menyalin log boot ke direktori bertimestamp di bawah `minios/log/` jika media dapat ditulis. Lihat [File konfigurasi](/configuration/Configuration-File.md).

Saat melaporkan bug yang dapat direproduksi, lampirkan cuplikan relevan dan buka issue di [pelacak issue MiniOS](https://github.com/minios-linux/minios-live/issues).
