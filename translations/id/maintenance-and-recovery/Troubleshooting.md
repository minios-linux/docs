---
updated: 2026-10-15
---

# Pemecahan masalah

Mulailah dengan mengamati dan melakukan pengujian yang dapat dibatalkan. Jangan mengubah partisi, memformat, memperbaiki filesystem, menghapus sesi, atau mengganti file boot hanya untuk melihat apakah tindakan tersebut membantu. Amankan data penting terlebih dahulu.

## Pemeriksaan awal

1. [Verifikasi image yang diunduh](/installing-minios/Verifying-Downloads).
2. Boot **Mulai tanpa menyimpan**. Jika masalahnya tidak muncul lagi, periksa sesi persisten atau konfigurasinya, bukan image dasar.
3. Hapus parameter boot khusus dan filter modul, kecuali jika diperlukan untuk mereproduksi masalah.
4. Coba port USB lain dan, jika memungkinkan, perangkat atau komputer lain yang telah dipastikan berfungsi.
5. Catat error pertama dan entri menu boot yang persis, bukan hanya pesan terakhir yang muncul di layar.
6. Periksa [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) jika image terverifikasi yang sama gagal di satu mesin, tetapi berfungsi di mesin lain.

## Perangkat tidak menampilkan menu boot MiniOS

Pertama, tentukan cara perangkat MiniOS dibuat.

- Untuk image yang ditulis secara mentah (`dd`, Etcher, mode DD Rufus, atau penulisan image dengan Utilitas Disk), jangan memperbaiki file boot satu per satu. Jika salinannya rusak, tulis ulang seluruh perangkat menggunakan image yang sudah diverifikasi.
- Untuk instalasi MiniOS berbasis file, buat ulang tata letak bootable menggunakan metode instalasi terdokumentasi yang sama, alih-alih menyalin file GRUB, Syslinux, atau EFI dari rilis lain.
- Ventoy memiliki bootloader dan tata letaknya sendiri. Jangan memasang bootloader MiniOS pada perangkat Ventoy; gunakan prosedur [Ventoy](/installing-minios/installation-tools/Ventoy) sebagai gantinya.
- Setelah konversi native, sistem target menggunakan bootloader Debian konvensional dan tata letak filesystem standar. Tampilan desktop MiniOS dapat dipertahankan, tetapi infrastruktur live dan alat khusus live MiniOS tidak lagi tersedia. Cadangkan data yang masih dapat dipulihkan sebelum menggunakan prosedur perbaikan atau instalasi ulang bootloader Debian yang sesuai dengan tata letak BIOS/UEFI dan partisinya.

Jika perangkat yang baru dibuat ulang tetap tidak muncul di menu boot firmware, periksa mode firmware, dukungan Secure Boot untuk arsitektur yang dipilih, port/perangkat USB, serta [kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Menu boot MiniOS muncul, tetapi proses startup gagal

Hapus parameter opsional terlebih dahulu. Gunakan `debug` dan `timing` jika diperlukan lebih banyak output pada tahap awal boot. `rd.break` ditujukan untuk pemeriksaan initramfs tingkat lanjut, bukan untuk perbaikan.

Jika MiniOS tidak dapat menemukan sumbernya, lihat [Penemuan sistem](/reference/boot-process/System-Discovery). Di shell initramfs, informasi hanya-baca yang berguna mencakup:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Sementara, `from=askdisk` dapat membantu mengidentifikasi perangkat yang benar-benar berisi data MiniOS. Setelah itu, gunakan sintaks `from=` yang terdokumentasi, alih-alih menebak nama perangkat.

Untuk startup PXE atau ISO melalui HTTP, lihat [Boot jaringan](/reference/boot-process/Network-Boot). Jaringan pada tahap awal boot terpisah dari NetworkManager di sesi yang sedang berjalan.

### Kegagalan modul atau root-union

Lihat [Pemuatan modul](/reference/boot-process/Module-Loading) untuk mengetahui aturan pemilihan dan pengurutan modul yang sebenarnya. Terutama:

- `load=` dan `noload=` dapat mengecualikan modul dasar atau kernel yang penting; `noload=`akan digunakan jika keduanya cocok;
- kandidat dengan nama dasar yang sama menempati slot pengganti yang sama;
- file `.sb` tidak membuktikan bahwa file tersebut adalah image SquashFS yang valid;
- kernel yang sedang berjalan harus cocok dengan modul kernel dan file boot MiniOS yang terkoordinasi.

Setelah berhasil boot, periksa keadaan sebenarnya tanpa mengubahnya:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Masalah tampilan

Jika layar hitam, resolusi tidak dapat digunakan, atau display manager terus berulang:

1. Coba parameter boot `text`. Jika konsol berfungsi, berarti masalahnya ada pada grafis/desktop, bukan pada kegagalan boot sebelumnya.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang ditentukan secara manual.
3. Uji **Mulai tanpa menyimpan** untuk mengesampingkan konfigurasi tampilan persisten.
4. Catat GPU dan driver menggunakan `lspci -nnk`.
5. Periksa `journalctl -b -p warning` dan `dmesg --level=err,warn`.

Untuk mesin virtual, lihat [Virtualisasi](/maintenance-and-recovery/Virtualization).

Pada image XFCE Debian 13 / Devuan Excalibur, **Pengaturan Tampilan** memiliki kontrol **Skala antarmuka** dengan pilihan Otomatis dan persentase manual. Otomatis mengikuti tampilan utama; persentase eksplisit yang tersimpan akan menggantikannya. Gunakan pratinjau dengan batas waktu dan konfirmasi, jangan samakan resolusi output dengan skala antarmuka. Efek jendela dan renderer dikonfigurasi secara terpisah di **Penyesuaian Window Manager → Compositor**. `xfwm4-gl` akan beralih ke XRender jika OpenGL tidak dapat digunakan; blur dan Magic Lamp memerlukan OpenGL, sedangkan animasi fade/scaling dan Peek juga berfungsi dengan XRender.

## Masalah jaringan

Koneksi kabel dan Wi-Fi biasa dikelola melalui NetworkManager; lihat [Jaringan](/using-minios/Networking).

Pertama, pastikan apakah antarmuka tersedia:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Jika antarmuka tidak tersedia, catat `lspci -nnk` atau `lsusb` dan cari kesalahan firmware atau driver di `dmesg`.
- Jika antarmuka tersedia tetapi tidak memiliki alamat, bedakan masalah koneksi/DHCP dari dukungan perangkat keras yang tidak tersedia.
- Jika ada alamat, uji gateway, lalu alamat IP, kemudian nama DNS untuk membedakan kegagalan koneksi, perutean, dan DNS.
- Parameter boot `ip=` digunakan untuk boot jaringan tahap awal dan tidak mengonfigurasi koneksi NetworkManager persisten. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

## Masalah persistensi

Boot **Mulai tanpa menyimpan** sebelum mengubah penyimpanan persistensi yang dicurigai bermasalah. Jangan memperbaiki atau menghapus satu-satunya salinan sesi saat sesi tersebut sedang aktif.

Periksa apa yang saat ini dapat dilihat oleh MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Periksa mode boot yang dipilih, ruang tulis yang tersedia, kompatibilitas sistem file, dan kompatibilitas sesi. Aturan pemilihan terperinci tersedia di [Sesi dan persistensi](/using-minios/Sessions-and-Persistence) dan [Detail internal persistensi](/reference/boot-process/Persistence-Internals).

Jika `native` penting yang tidak sedang berjalan`dynfilefs`, `dynblk`, `vmdk`, atau `raw` sesi masih dapat dibaca, termasuk bentuk terenkripsi yang dapat dibuka kuncinya, ekspor sesi tersebut **sebelum** mencoba mengutak-atik penyimpanan:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Jika Session Manager tidak dapat membaca atau mengekspor sesi, hentikan penulisan ke sumber dan simpan salinan offline penyimpanan yang terdampak sebelum melakukan tindakan lebih lanjut. Untuk sesi DynBlk yang dilepas, `dynblk inspect /path/to/volume000.db --metadata-only` dan `dynblk check /path/to/volume000.db` menyediakan diagnostik format hanya-baca; jangan jalankan diagnostik tersebut pada volume yang masih terpasang. MiniOS tidak menetapkan prosedur manual universal untuk membangun ulang segmen DynFileFS, merekonstruksi bagian pendukung DynBlk, memperbaiki sistem file internal, atau merekonstruksi metadata sesi. Pemulihan semacam ini bergantung pada sistem file/kontainer dan sebaiknya hanya dilakukan pada salinan jika nilai data tersebut memang sepadan dengan upaya pemulihan.

Lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) untuk mengetahui alur pencadangan dan impor sesi yang didukung.

### Ventoy Plugin Persistensi

Jika Session Manager melaporkan bahwa plugin ini tidak tersedia dengan Ventoy Persistence Plugin, ini sesuai dengan model satu image yang diharapkan, bukan karena metadata sesi hilang. Pilih backend lain di Ventoy atau boot tanpa memilih image plugin untuk menggunakan sesi MiniOS bernomor. Backend yang tidak tersedia atau bukan ext4, format union tercatat yang berbeda, atau aktivasi tulis yang gagal akan membuat MiniOS memberikan peringatan lalu melanjutkan dalam RAM. Periksa `/run/initramfs/minios-persistence/boot-state` dan peringatan saat startup; jangan membuat `session.conf` secara manual di dalam image plugin. Lihat [Ventoy](/installing-minios/installation-tools/Ventoy).

## Masalah penyimpanan dan ruang kosong

Periksa perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Filesystem yang penuh dapat menyebabkan operasi paket gagal, penyimpanan sesi tidak tuntas, dan error turunan lainnya. Kosongkan ruang dengan memindahkan atau menghapus data yang diketahui hanya setelah memastikan filesystem yang benar. Gunakan Manajer Sesi MiniOS untuk menghapus sesi, bukan menghapus direktori sesi bernomor secara manual.

Jika `LIVE_APT_CACHE=volatile`, periksa juga `findmnt -T /var/cache/apt/archives` dan `df -h /var/cache/apt/archives`: area arsip adalah filesystem RAM yang kapasitasnya terbatas, dan unduhan besar dapat memenuhinya meskipun perangkat USB masih memiliki ruang kosong. Dengan `LIVE_LOG_STORAGE=volatile`, `/var/log` memiliki batas RAM tersendiri sebesar 32 MiB. Memenuhi salah satu area tersebut tidak membuat MiniOS diam-diam beralih untuk menulis file itu ke perangkat USB. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Perbaikan filesystem bukan operasi MiniOS yang berlaku umum. Jika filesystem itu sendiri rusak, unmount filesystem tersebut, amankan data penting atau image terlebih dahulu, lalu gunakan prosedur perbaikan yang sesuai dengan filesystem dan perangkat penyimpanan tersebut.

## Perubahan paket dan pembaruan sistem

Jika masalah muncul setelah perubahan paket APT, ingat bahwa sesi persisten live dapat menimpa file dari modul MiniOS yang hanya dapat dibaca. Uji **Mulai tanpa menyimpan** untuk membandingkannya dengan set modul asli. Lihat [Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk memahami perbedaan antara pemeliharaan APT dan perubahan rilis MiniOS.

<a id="collecting-logs"></a>

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

Jika boot berulang kali gagal pada media MiniOS yang dapat ditulis, `EXPORT_LOGS=true` di `config.conf` mengekspor log boot ke `minios/log/`. Lihat [config.conf](/reference/configuration/config.conf).

Dalam sesi `perch` yang sehat dan persisten, dua log startup wajib sudah tersimpan, terlepas dari `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Log `.1`, `.2`, dan `.3` adalah log dari boot sebelumnya. Mount `/var/log` biasa dapat `tmpfs` sementara `/var/log/minios` dan `/var/log/live` tetap berada di penyimpanan persisten. Untuk SquashFS, log ini juga tersimpan di `minios/changes/<session-id>/boot-logs/`, di luar `changes.sb`; log tetap tersimpan meskipun snapshot saat shutdown gagal. Aktivasi `perch` yang gagal atau tidak persisten tidak memiliki lokasi penyimpanan log persisten yang terjamin. Dengan `LIVE_LOG_STORAGE=volatile`, `journalctl -b` dan log biasa lainnya hanya tersedia untuk boot **saat ini** saja. Aktifkan trace `minios-update-*` terperinci menggunakan `LIVE_CONFIG_DEBUG=true` hanya jika diperlukan; error biasa tetap dilaporkan tanpa fitur ini.

Hapus kredensial, private key, rahasia Wi-Fi, dan informasi pribadi lainnya sebelum membagikan log. Untuk bug yang dapat direproduksi, sertakan kutipan yang relevan dan buat issue di [pelacak issue MiniOS](https://github.com/minios-linux/minios-live/issues).

### Sesi VMDK tidak didukung

Perbarui driver/CLI DynBlk dan alat sesi secara bersamaan, lalu bangun ulang
initrd boot. Initrd yang berjalan harus mengiklankan `vmdk-session-v1`; Installer juga
memeriksa setiap initrd sumber yang akan disalin. Penanda DynBlk lama yang kosong hanya
menunjukkan dukungan blok native dan tidak menjamin dukungan boot sesi VMDK.
Jangan ubah mode sesi yang sudah ada secara manual: gunakan penyalinan eksplisit atau
konversi ke format lain.

### Mengosongkan ruang di DynFileFS, DynBlk, atau sesi VMDK

Gunakan menu konteks Session Manager **Kosongkan Ruang...**, atau
`minios-session reclaim ID --json`. Untuk sesi plaintext, tindakan ini memangkas
ext4 internal yang sebenarnya, lalu meminta backend pemilik untuk mengklaim kembali penyimpanan tanpa
memindahkan data aktif. DynFileFS memerlukan versi 4.6.0 atau yang lebih baru untuk operasi ini.
Pada sistem file seperti exFAT, celah di bagian dalam mungkin tetap dialokasikan untuk file host
tetapi dapat digunakan kembali oleh container; `--compact` adalah pilihan manual terpisah yang dapat
memindahkan data aktif dan menambah penulisan ke perangkat flash. Tidak ada yang mengaktifkan
pemadatan atau discard LUKS secara otomatis. Sesi terenkripsi hanya dapat mengklaim kembali
ruang yang sudah diketahui oleh backend yang mendasarinya melalui perintah ini.
