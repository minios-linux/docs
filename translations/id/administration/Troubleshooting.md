# Pemecahan Masalah

Mulailah dengan observasi dan pengujian yang dapat dibatalkan. Jangan melakukan repartisi, format ulang, perbaikan sistem berkas, menghapus sesi, atau menimpa berkas boot sebelum data penting dicadangkan dan perangkat yang bermasalah telah diidentifikasi berdasarkan model, ukuran, sistem berkas, dan titik mount.

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

## Masalah tampilan

Untuk layar hitam, resolusi tidak terbaca, atau loop pada display manager:

1. Coba parameter boot `text`. Jika konsol berhasil dimulai, sistem dasar sudah boot dan kemungkinan masalah ada pada grafis, X11, atau display manager.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang ditentukan secara manual.
3. Uji sesi baru untuk menyingkirkan konfigurasi tampilan yang persisten.
4. Catat GPU dan driver yang dimuat dengan `lspci -nnk`.
5. Periksa kesalahan boot saat ini dengan `journalctl -b -p warning` dan
   `dmesg --level=err,warn`.

Kontrol resolusi mesin virtual yang didokumentasikan sebagai `virtres` dan `novirtres`
hanya berlaku untuk lingkungan Xfce. Lihat
[Virtualisasi](/administration/Virtualization.md) untuk pengaturan khusus guest.

## Masalah jaringan

Pastikan antarmuka ada sebelum mengubah konfigurasi:

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
- Jika antarmuka ada tetapi tidak memiliki alamat, uji DHCP sebelum memasukkan nilai statis.
- Jika sudah ada alamat, uji gateway, lalu alamat IP, lalu nama DNS untuk membedakan kegagalan link, routing, dan DNS.
- Installer mengonfigurasi DHCP kabel atau IPv4 statis. Profil Wi-Fi yang sudah ada tidak diubah.
- Parameter boot `ip=` mengatur unduhan PXE awal, bukan jaringan sesi persisten. Lihat [Network boot](/installation/Network-Boot.md).

## Masalah persistensi

Pertama, boot tanpa persistensi dan buat salinan lengkap direktori `minios/changes`. Jangan jalankan alat perbaikan terhadap satu-satunya salinan atau terhadap sesi yang sedang aktif.

Periksa status sesi dengan:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Penyebab umum meliputi boot pada entri baru, menggunakan metode penulisan ISO yang tidak pernah mengonfigurasi persistensi, ruang kosong tidak cukup, memilih sesi dari edisi atau versi yang berbeda, ketidakcocokan sistem berkas, dan shutdown yang tidak bersih. Lihat [Manajemen sesi](/configuration/Session-Management.md).

Jika MiniOS terus-menerus membuat sesi kosong, tidak dapat melanjutkan DynFileFS, atau melaporkan kesalahan kontainer, ikuti [Pemulihan DynFileFS dan dynblk](/configuration/DynFileFS-Recovery.md).
Panduan tersebut dimulai dengan salinan penuh dan pemeriksaan read-only. Sesi LUKS juga memerlukan kata sandi yang benar dan initrd dengan dukungan persistensi LUKS.

## Masalah penyimpanan dan ruang

Identifikasi perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Pastikan model dan ukuran perangkat sebelum melakukan operasi apa pun. Sistem berkas penuh dapat menyebabkan pembaruan gagal, penulisan sesi tidak lengkap, dan pemulihan saat boot. Kosongkan ruang dengan memindahkan atau menghapus data pengguna yang sudah diketahui hanya setelah membuat cadangan; jangan menghapus direktori persistensi bernomor secara manual saat salah satu masih aktif. Gunakan Session Manager atau `minios-session` untuk operasi sesi.

Perbaikan sistem berkas adalah langkah berikutnya. Lepas mount sistem berkas terlebih dahulu, kerjakan pada salinan jika memungkinkan, dan gunakan alat pemeriksaan khusus sistem berkas. Jangan pernah memformat perangkat sebagai tes diagnostik.

## Mengumpulkan log

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

Hapus kata sandi, kunci privat, kredensial nirkabel, alamat IP publik, dan data sensitif lain sebelum membagikan log. `journalctl -b -1` dapat menampilkan boot sebelumnya jika journal bersifat persisten.

Untuk kegagalan boot berulang pada media MiniOS yang dapat ditulis, setel `EXPORT_LOGS=true` di file konfigurasi. MiniOS akan menyalin log boot-nya ke `minios/logs` jika media dapat ditulis. Lihat [File konfigurasi](/configuration/Configuration-File.md).

Saat melaporkan bug yang dapat direproduksi, lampirkan cuplikan yang relevan dan buka isu di [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).
