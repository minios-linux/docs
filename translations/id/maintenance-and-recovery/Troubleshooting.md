---
updated: 2026-10-06
---

# Pemecahan Masalah

Mulailah dengan observasi dan pengujian yang dapat dibatalkan. Jangan melakukan partisi ulang, format, perbaikan sistem file, menghapus sesi, atau mengganti file boot hanya untuk mencoba apakah itu membantu. Pastikan data penting sudah dicadangkan terlebih dahulu.

## Pemeriksaan awal

1. [Verifikasi citra yang diunduh](/installing-minios/Verifying-Downloads).
2. Boot **Mulai tanpa menyimpan**. Jika masalah hilang, periksa sesi persisten atau konfigurasinya, bukan citra dasarnya.
3. Hapus parameter boot dan filter modul kustom kecuali diperlukan untuk mereproduksi masalah.
4. Coba port USB lain dan, jika memungkinkan, perangkat atau komputer lain yang sudah dipastikan berfungsi.
5. Catat kesalahan pertama dan entri menu boot yang dipilih, bukan hanya pesan terakhir yang muncul di layar.
6. Periksa [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) jika citra yang sudah diverifikasi gagal di satu mesin tetapi berjalan di mesin lain.

## Perangkat tidak mencapai menu boot MiniOS

Tentukan terlebih dahulu bagaimana perangkat MiniOS dibuat.

- Untuk citra yang ditulis secara mentah (`dd`, Etcher, Rufus mode DD, atau penulisan citra dengan Utilitas Disk), jangan perbaiki file boot satu per satu. Jika salinan rusak, tulis ulang seluruh perangkat dari citra yang sudah diverifikasi.
- Untuk instalasi berbasis file MiniOS, buat ulang tata letak bootable menggunakan metode instalasi terdokumentasi yang sama, bukan dengan menyalin file GRUB, Syslinux, atau EFI dari rilis lain.
- Ventoy memiliki bootloader dan tata letak sendiri. Jangan instal bootloader MiniOS di atas perangkat Ventoy; gunakan prosedur [Ventoy](/installing-minios/installation-tools/Ventoy) sebagai gantinya.
- Setelah konversi native, target menggunakan bootloader Debian konvensional dan tata letak sistem file standar. Tampilan desktop MiniOS dapat dipertahankan, tetapi infrastruktur live dan alat khusus live MiniOS tidak lagi tersedia. Cadangkan data yang dapat dipulihkan sebelum melakukan perbaikan atau instalasi ulang bootloader Debian sesuai dengan BIOS/UEFI dan tata letak partisinya.

Jika perangkat yang baru dibuat ulang tetap tidak muncul di menu boot firmware, periksa mode firmware, dukungan Secure Boot pada arsitektur yang dipilih, port/perangkat USB, dan [kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility).

## Menu boot MiniOS muncul tetapi proses startup gagal

Hapus parameter opsional terlebih dahulu. Gunakan `debug` dan `timing` jika membutuhkan output awal boot lebih detail. `rd.break` digunakan untuk inspeksi lanjutan initramfs, bukan perbaikan.

Jika MiniOS tidak dapat menemukan sumbernya, lihat [Penemuan sistem](/reference/boot-process/System-Discovery). Pada shell initramfs, informasi read-only yang berguna meliputi:

```sh
cat /proc/cmdline
blkid
cat /proc/net/dev
findmnt
cat /var/log/livedbg
```

Sebuah `from=askdisk` sementara dapat membantu mengidentifikasi perangkat yang benar-benar berisi data MiniOS. Setelah itu, gunakan sintaks yang terdokumentasi `from=` daripada menebak nama perangkat.

Untuk startup ISO PXE atau HTTP, lihat [Boot jaringan](/reference/boot-process/Network-Boot). Jaringan pada awal boot terpisah dari NetworkManager di sesi berjalan.

### Kegagalan modul atau root-union

Lihat [Pemuatan modul](/reference/boot-process/Module-Loading) untuk aturan pemilihan dan urutan modul yang sebenarnya. Khususnya:

- `load=` dan `noload=` dapat mengecualikan modul dasar atau kernel penting; `noload=` menang jika keduanya cocok;
- kandidat dengan nama dasar sama menempati slot pengganti yang sama;
- sebuah `.sb` nama file tidak membuktikan bahwa file tersebut adalah citra SquashFS yang valid;
- kernel yang berjalan harus sesuai dengan modul kernel MiniOS dan file boot yang terkoordinasi.

Setelah boot berhasil, periksa kondisi sebenarnya tanpa mengubahnya:

```bash
cat /proc/cmdline
sb list
sb next-boot
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

## Masalah tampilan

Untuk layar hitam, resolusi tidak dapat digunakan, atau loop display-manager:

1. Coba parameter boot `text`. Konsol yang berfungsi membedakan masalah grafis/desktop dari kegagalan boot sebelumnya.
2. Hapus parameter `xorg-driver` atau `xorg-resolution` yang dimasukkan secara manual.
3. Uji **Mulai tanpa menyimpan** untuk menyingkirkan konfigurasi tampilan persisten.
4. Catat GPU dan driver dengan `lspci -nnk`.
5. Periksa `journalctl -b -p warning` dan `dmesg --level=err,warn`.

Untuk mesin virtual, lihat [Virtualisasi](/maintenance-and-recovery/Virtualization).

## Masalah jaringan

Koneksi kabel dan Wi-Fi normal dikelola melalui NetworkManager; lihat [Jaringan](/using-minios/Networking).

Tentukan terlebih dahulu apakah antarmuka tersedia:

```bash
ip link
ip address
ip route
nmcli device status
nmcli connection show
```

- Jika tidak ada antarmuka, catat `lspci -nnk` atau `lsusb` dan cari kesalahan firmware atau driver di `dmesg`.
- Jika antarmuka tersedia tetapi tidak memiliki alamat, bedakan masalah koneksi/DHCP dari dukungan perangkat keras yang hilang.
- Jika alamat tersedia, uji gateway, lalu alamat IP, lalu nama DNS untuk memisahkan kegagalan link, routing, dan DNS.
- Parameter boot `ip=` digunakan hanya untuk boot jaringan awal dan tidak mengonfigurasi koneksi NetworkManager yang persisten. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

## Masalah persistensi

Boot **Mulai tanpa menyimpan** sebelum mengubah media persistensi yang dicurigai. Jangan memperbaiki atau menghapus satu-satunya salinan sesi saat sesi tersebut masih aktif.

Periksa apa yang saat ini dilihat oleh MiniOS:

```bash
sudo minios-session list
sudo minios-session running
sudo minios-session active
sudo minios-session status
sudo minios-session info
```

Periksa mode boot yang dipilih, ruang tulis yang tersedia, kompatibilitas sistem file, dan kompatibilitas sesi. Aturan pemilihan detail ada di [Sesi dan persistensi](/using-minios/Sessions-and-Persistence) dan [Internal persistensi](/reference/boot-process/Persistence-Internals).

Jika sesi penting yang tidak berjalan `native`, `dynfilefs`, `dynblk`, `vmdk`, atau `raw` masih dapat dibaca, termasuk dalam bentuk terenkripsi yang dapat dibuka, ekspor terlebih dahulu **sebelum** mencoba-coba pada media penyimpanan:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Jika Session Manager tidak dapat membaca atau mengekspor sesi, hentikan penulisan ke sumber dan simpan salinan offline dari media yang terdampak sebelum melanjutkan. Untuk sesi DynBlk yang terlepas, `dynblk inspect /path/to/volume000.db --metadata-only` dan `dynblk check /path/to/volume000.db` menyediakan diagnostik format read-only; jangan jalankan pada volume yang masih terpasang. MiniOS tidak menyediakan prosedur manual universal untuk membangun ulang segmen DynFileFS, merekonstruksi bagian pendukung DynBlk, memperbaiki sistem file di dalamnya, atau merekonstruksi metadata sesi. Pemulihan seperti ini bersifat spesifik sistem file/kontainer dan sebaiknya hanya dilakukan pada salinan jika memang data tersebut sangat penting.

Lihat [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) untuk alur kerja backup dan impor sesi yang didukung.

## Masalah penyimpanan dan ruang kosong

Periksa perangkat dan mount tanpa mengubahnya:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
findmnt
df -hT
df -ih
```

Sistem file penuh dapat menyebabkan kegagalan operasi paket, penyimpanan sesi tidak lengkap, dan kesalahan sekunder lainnya. Kosongkan ruang dengan memindahkan atau menghapus data yang sudah diketahui hanya setelah memastikan sistem file yang benar. Gunakan Manajer Sesi MiniOS untuk menghapus sesi, bukan menghapus direktori sesi bernomor secara manual.

Jika `LIVE_APT_CACHE=volatile`, periksa juga `findmnt -T /var/cache/apt/archives` dan `df -h /var/cache/apt/archives`: area arsip adalah sistem file RAM terbatas dan unduhan besar dapat memenuhi area ini meskipun perangkat USB masih memiliki ruang kosong. Dengan `LIVE_LOG_STORAGE=volatile`, `/var/log` biasa memiliki batas terpisah 32 MiB RAM. Jika salah satu area penuh, MiniOS tidak akan secara diam-diam menulis file tersebut ke perangkat USB. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Perbaikan sistem file bukan operasi MiniOS yang umum. Jika sistem file rusak, lepas mount-nya, cadangkan data penting atau citra terlebih dahulu, dan gunakan prosedur perbaikan yang sesuai dengan sistem file dan perangkat penyimpanan tersebut.

## Perubahan paket dan pembaruan sistem

Jika masalah muncul setelah perubahan paket APT, ingat bahwa sesi live persisten dapat menimpa file dari modul MiniOS yang hanya-baca. Uji **Mulai tanpa menyimpan** untuk membandingkan dengan set modul asli. Lihat [Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk perbedaan antara pemeliharaan APT dan perubahan rilis MiniOS.

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

Pada sesi tahan lama yang sehat `perch`, dua log startup wajib sudah tersimpan terlepas dari `LIVE_LOG_STORAGE`:

```bash
sudo ls -l /var/log/minios/minios-boot.log*
sudo ls -l /var/log/live/config.log*
sudo cat /run/initramfs/minios-persistence/boot-state
findmnt -T /var/log
findmnt -T /var/log/minios
```

Versi `.1`, `.2` dan `.3` adalah boot sebelumnya. Mount `/var/log` biasa dapat `tmpfs` sementara `/var/log/minios` dan `/var/log/live` tetap berada di media persistensi. Untuk SquashFS, log ini juga berada di bawah `minios/changes/<session-id>/boot-logs/`, di luar `changes.sb`; log ini tetap ada meskipun snapshot shutdown gagal. Aktivasi `perch` yang gagal atau tidak tahan lama tidak memiliki tujuan log persisten yang dijamin. Dengan `LIVE_LOG_STORAGE=volatile`, `journalctl -b` dan log biasa lainnya tersedia hanya untuk boot **saat ini**. Aktifkan jejak `minios-update-*` detail menggunakan `LIVE_CONFIG_DEBUG=true` hanya jika diperlukan; kesalahan normal tetap dilaporkan tanpa itu.

Hapus kredensial, kunci privat, rahasia Wi-Fi, dan informasi pribadi lain sebelum membagikan log. Untuk bug yang dapat direproduksi, sertakan bagian log yang relevan dan buka isu di [pelacak isu MiniOS](https://github.com/minios-linux/minios-live/issues).

### Sesi VMDK tidak tersedia

Perbarui driver/CLI DynBlk dan alat sesi secara bersamaan, lalu bangun ulang
initrd boot. Initrd yang berjalan harus mengumumkan `vmdk-session-v1`; Installer juga
memeriksa setiap initrd sumber yang akan disalin. Penanda kosong lama DynBlk hanya
menandakan dukungan blok native dan tidak menjamin dukungan boot sesi VMDK.
Jangan mengubah mode sesi yang sudah ada secara manual: gunakan salin eksplisit atau
konversi ke format lain.

### Mengosongkan ruang di DynFileFS, DynBlk, atau sesi VMDK

Gunakan menu konteks Session Manager **Bebaskan Ruang...**, atau
`minios-session reclaim ID --json`. Untuk sesi plaintext, ini akan memangkas
ext4 bagian dalam yang sebenarnya lalu meminta backend pemilik untuk mereklamasi penyimpanan tanpa
memindahkan data aktif. DynFileFS memerlukan versi 4.6.0 atau lebih baru untuk operasi ini.
Pada sistem file seperti exFAT, celah di dalamnya mungkin tetap dialokasikan ke file host
tetapi dapat digunakan ulang oleh kontainer; `--compact` adalah pilihan manual terpisah yang dapat
memindahkan data aktif dan menulis lebih banyak ke perangkat flash. Tidak ada yang mengaktifkan
kompaksi atau LUKS discard secara otomatis. Sesi terenkripsi hanya dapat mereklamasi
ruang yang sudah diketahui backend terkait melalui perintah ini.
