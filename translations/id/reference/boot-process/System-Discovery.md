---
updated: 2026-10-15
---

# Pengenalan sistem

Halaman ini menjelaskan fungsi `from`, `ip`, `cache`, `bext`, `toram` dan `toram=full` parameter boot. Bagian ini ditujukan untuk entri boot khusus, boot jaringan, dan pemecahan masalah. Sebagian besar pengguna dapat memilih entri normal di menu boot tanpa mengatur parameter ini secara manual.

Setelah bootloader memuat kernel dan initramfs, initramfs harus menemukan pohon data MiniOS yang menyediakan modul sistem `.sb`. Proses ini berlangsung sebelum network stack userspace normal, desktop, dan sesi persisten aktif.

## Sederhananya

MiniOS perlu menemukan direktori yang berisi modul sistemnya. Biasanya, sistem akan mencari drive yang terhubung untuk menemukan direktori `minios/`. Parameter `from=` mengarahkannya ke direktori atau ISO lain. Parameter jaringan menggantikan pencarian lokal ini dengan pengunduhan ISO melalui HTTP atau PXE.

Menemukan drive tidak membuktikan bahwa kumpulan modulnya lengkap, dan menemukan file sistem tidak mengaktifkan persistensi. Keduanya merupakan tahap startup yang terpisah.

## Penjelasan parameter

| Parameter | Fungsi MiniOS | Penggunaan umum |
|---|---|---|
| `from=PATH` | Mencari MiniOS di direktori atau ISO tertentu, alih-alih menerima sumber lokal pertama yang cocok. | Boot dari ISO yang tersimpan di disk atau gunakan direktori nonstandar. |
| `from=askdisk` | Membuka pemilih interaktif untuk partisi yang berisi MiniOS. | Beberapa drive yang terhubung berisi sumber yang mungkin digunakan. |
| `from=http://...` | Memasang ISO dari server HTTP biasa. | Boot jaringan terkontrol, saat sistem yang berjalan mungkin tetap bergantung pada server. |
| `ip=...` | Menggunakan jaringan statis sejak awal. Tanpa `from=` HTTP, sistem akan memilih pengunduhan data PXE dan melewati drive lokal. | Penerapan PXE atau pengalamatan statis untuk ISO HTTP. |
| `cache=MB` | Mengalokasikan cache httpfs untuk ISO HTTP. Ini tidak menjamin seluruh ISO telah diunduh. | Mengurangi pembacaan berulang dari sumber HTTP. |
| `bext=EXTENSION` | Mencari nama file modul dengan ekstensi lain, bukan `.sb`. | Hanya untuk image khusus; parameter ini tidak mengonversi modul. |
| `toram` atau `toram=full` | Menyalin data sistem MiniOS yang ditemukan, termasuk entri tersembunyi di tingkat teratas tetapi tidak termasuk `changes/`, ke RAM lalu mencoba melepas sumber. Penyalinan sesi menggunakan `perchtoram` secara terpisah. Bentuk tanpa argumen berarti `full`. | Operasi RAM pada mesin dengan memori yang cukup. |

Jika proses boot dari USB lokal berhenti sebelum desktop muncul, hapus dulu nilai khusus untuk `from=` dan `ip=` terlebih dahulu. Nilai `ip=` yang tidak sengaja diisi akan mencegah pencarian drive lokal, sedangkan nilai `from=` yang salah dapat membuat MiniOS mencari jalur yang tidak tersedia.

## Prioritas sumber

Pemilihan sumber mengikuti urutan prioritas tetap:

1. Nilai literal `from=http://...` memilih ISO HTTP.
2. Jika tidak, nilai `ip=` yang tidak kosong akan memilih pengunduhan PXE.
3. Jika tidak, `from=askdisk` atau `from=askdisk:...` akan membuka pemilih disk.
4. Jika tidak, initramfs akan memindai perangkat blok lokal.

Kedua jalur jaringan tidak beralih ke media lokal. Setelah percobaan ISO HTTP atau PXE, proses pencarian mengembalikan hasil jaringan tersebut, bukan mencoba disk; hasil yang tidak dapat digunakan atau tidak lengkap akan gagal saat validasi atau tahap penyiapan berikutnya.

Urutan ini memiliki dua konsekuensi penting:

- `from=http://...` lebih diprioritaskan daripada `ip=`. Nilai opsional `ip=` kemudian menyediakan pengalamatan statis untuk koneksi ISO HTTP.
-  yang tidak kosong lebih diprioritaskan `ip=` daripada setiap nilai `from=` lokal, termasuk perangkat, direktori, jalur ISO, atau `askdisk`. Jangan gunakan `ip=` hanya untuk mengonfigurasi jaringan sistem yang di-boot secara lokal.

## Penemuan lokal

Tanpa sumber HTTP atau `ip=`, MiniOS melakukan 45 kali pemindaian, kira-kira satu kali per detik. Setiap pemindaian memperbarui node perangkat dan mengambil kandidat perangkat blok dari `blkid`. Jika `/dev/mapper/ventoy` tersedia, pemetaan ISO tersebut akan dicoba terlebih dahulu; kandidat lainnya diurutkan berdasarkan nama perangkat dan duplikat dihapus. Sumber MiniOS pertama yang memenuhi syarat akan dipilih. Ini mencegah modul pengganti pada partisi data Ventoy disalahartikan sebagai sumber ISO utama.

Jika `from=` kosong, jalur yang diuji pada setiap sistem berkas adalah `minios`. Sumber memenuhi syarat jika direktori tersebut atau subdirektori `modules/` langsungnya berisi setidaknya satu file dengan ekstensi `.sb` secara default. Parameter `bext=` mengubah ekstensi yang digunakan dalam pengujian ini. Penemuan tidak memvalidasi apakah kumpulan modul yang ditemukan lengkap atau dapat di-boot.

Setiap kandidat awalnya di-mount dalam mode hanya baca. Setelah kandidat memenuhi syarat, MiniOS mencoba membuat mount data yang dipilih dapat ditulis, tetapi kegagalan melakukannya tidak menggugurkan sumber yang valid.

### Lokal `from=` formulir

Jalur relatif biasa atau jalur yang tampak absolut akan ditafsirkan di dalam setiap sistem berkas kandidat. Garis miring di awal dinormalisasi saat jalur dibuat, sehingga kedua contoh ini mencari direktori yang sama:

```text
from=minios
from=/minios
```

Jika jalur yang diminta adalah file biasa di sistem berkas kandidat, MiniOS menganggapnya sebagai ISO, me-mount-nya melalui loop dalam mode hanya baca, lalu menguji direktori `minios` di dalam ISO:

```text
from=/images/minios.iso
```

Jalur dengan nama perangkat hanya mendukung format berikut:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` mendukung nama perangkat sederhana yang diikuti jalur. Format label harus persis `/dev/disk/by-label/LABEL/path`; label dicari menggunakan `blkid`, lalu jalur sisanya diuji pada sistem berkas tersebut.

Tidak ada parser untuk jalur UUID, PARTUUID, atau by-id. Format seperti berikut tidak didukung:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Pemilihan interaktif

Gunakan `askdisk` untuk memilih partisi, lalu menguji jalur di dalamnya:

```text
from=askdisk
from=askdisk:custom:dir
```

Format pertama menguji `minios` pada partisi yang dipilih. Dalam format kedua, titik dua menjadi pemisah jalur, sehingga `askdisk:custom:dir` menguji `custom/dir`.
Sintaks garis miring seperti `from=askdisk/custom/dir` tetap membuka pemilih, tetapi jalur kustom akan diabaikan tanpa pemberitahuan dan yang diuji adalah `minios`; jangan gunakan sintaks ini.

Daftar perangkat yang ditampilkan diperbarui selama pemilih terbuka dan tidak menyertakan sistem berkas swap. Pemilihan tetap menjalankan pengujian keberadaan modul seperti biasa; memilih partisi saja tidak cukup.

## ISO HTTP

Sumber ISO HTTP memiliki format berikut:

```text
from=http://server.example/path/minios.iso
```

Hanya HTTP biasa yang dikenali. HTTPS dan skema URL lainnya tidak didukung.
initramfs mencari antarmuka jaringan non-loopback pertama yang terdeteksi, mengaktifkan jaringan, lalu me-mount ISO jarak jauh melalui `httpfs2`. Pemilihan antarmuka tidak memeriksa koneksi, keterjangkauan, atau apakah antarmuka tersebut dapat digunakan pada sistem dengan beberapa NIC.

Jika `ip=` tidak ada, boot ISO HTTP meminta DHCP dengan `udhcpc`. Jika `ip=` tersedia, parameter tersebut menggunakan kolom statis yang diharapkan parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Untuk boot ISO HTTP, URL tetap menentukan server HTTP. Kolom statis mengatur alamat klien, netmask, gateway default, dan entri DNS awal; kolom port opsional digunakan untuk pengunduhan file PXE dan tidak menggantikan port dalam URL ISO.

`cache=<MB>` mengaktifkan cache httpfs dengan ukuran yang diminta di `/tmp`. Cache ini tidak menjamin seluruh file selesai diunduh. Sistem yang berjalan tetap bergantung pada ISO jarak jauh dan jaringan, kecuali salinan RAM berhasil memutus ketergantungan pada sumber tersebut.

## Unduh data PXE

Setiap `ip=`yang tidak kosong akan memilih unduhan data PXE, kecuali `from=http://...`dipilih lebih dahulu. Sintaks yang didukung adalah:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Netmask menggunakan notasi IPv4 bertitik. Port HTTP bersifat opsional dan nilai bawaannya adalah `7529`.
Format kernel generik atau dracut seperti `ip=dhcp` dan `ip=:::::eth0:dhcp` tidak didukung. Parser ini tidak menyediakan format DHCP untuk unduhan data PXE.

MiniOS mengonfigurasi antarmuka non-loopback pertama yang terdeteksi, tanpa memastikan bahwa koneksinya berfungsi. Proses ini terlebih dahulu meminta `PXEFILELIST` dan file MiniOS yang tercantum melalui HTTP dari server yang disebutkan pada kolom server. TFTP hanya menjadi opsi cadangan terbatas: opsi ini dipilih hanya jika permintaan HTTP awal untuk `PXEFILELIST` gagal. Ini bukan mekanisme failover antarmuka umum, opsi cadangan media lokal, ataupun pemulihan dari setiap kegagalan unduhan HTTP parsial.

## Menyalin dan melepaskan dengan `toram=full`

`toram=full`penting untuk proses discovery karena langkah ini dapat menghilangkan ketergantungan berkelanjutan pada sumber yang dipilih. Setelah menemukan sumber dan pohon MiniOS eksternal, data sistem disalin ke RAM, lalu sistem mencoba melepas mount sumber dan memindahkan salinan RAM ke lokasinya. Sumber hanya terlepas jika pelepasan mount dan pemindahan berhasil; filesystem host ISO dan pemetaan Ventoy juga perlu dilepas.

Batasan penting:

- Tidak ada pemeriksaan awal untuk memastikan RAM yang tersedia cukup untuk menampung salinan.
- Penyalinan seluruh sistem mencakup entri tersembunyi di tingkat teratas dan tidak menyertakan `changes/`baik persistensi diminta maupun tidak. Pohon MiniOS eksternal yang ditemukan akan disalin menimpa pohon sumber, termasuk modul pengganti.
- Kontainer sesi yang didukung disalin secara terpisah dengan `perchtoram=trim|full`; `perchtoram=off`tetap bergantung pada penyimpanan. Sesi native memiliki batasan tersendiri yang dijelaskan di bagian [Mode boot](/using-minios/Boot-Modes).
- Kesalahan penyalinan sistem akan masuk ke jalur initramfs fatal. Kegagalan melepas mount atau memindahkan sumber dapat menyebabkan sumber asli tetap ter-mount sementara boot menggunakan jalur staging RAM. Jangan berasumsi bahwa `toram=full`membuat pelepasan media atau hilangnya jaringan menjadi aman; pastikan sumber benar-benar terlepas.

Lihat [Persistensi initrd](/reference/boot-process/Persistence-Internals) sebelum menggabungkan `toram` dengan `perch` atau `perchdir`.

## Kegagalan dan diagnostik

Jika semua 45 percobaan lokal gagal, MiniOS akan masuk ke jalur kesalahan fatal dan membuka shell initramfs, alih-alih memulai sistem live. Jalur jaringan tidak melakukan pencarian lokal sebanyak 45 kali atau beralih ke media lokal; bergantung pada hasil parsial, proses dapat gagal saat pemeriksaan data atau pada tahap penyiapan berikutnya. Keluar dari shell fatal tidak akan memulihkan sumber yang hilang dan hanya dapat menyebabkan kegagalan yang kurang jelas pada tahap selanjutnya.

Parameter diagnostik yang berguna:

- `debug`mengaktifkan pelacakan shell, diagnostik tambahan, dan shell interaktif di beberapa checkpoint initramfs. Keluar dari shell checkpoint untuk melanjutkan.
- `timing`menampilkan waktu yang berlalu di antara tahap initramfs serta total waktu akhir.
- `rd.break`meminta shell initramfs menjelang peralihan ke root sebenarnya; keluar dari shell untuk melanjutkan boot.

Di shell, periksa `/proc/cmdline`, `/proc/net/dev`, `blkid`, filesystem yang ter-mount, dan `/var/log/livedbg`. Mulailah dengan nilai `from=` yang persis, `ip=`, dan `bext=` yang ditampilkan di `/proc/cmdline`.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Pemuatan modul](/reference/boot-process/Module-Loading)
- [Persistensi](/reference/boot-process/Persistence-Internals)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Parameter boot](/reference/Boot-Parameters)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
