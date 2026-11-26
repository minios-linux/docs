---
updated: 2026-10-15
---

# Performa

Penyetelan performa di MiniOS terutama merupakan kompromi antara waktu boot, penggunaan RAM, pembacaan saat runtime, overhead persistensi, dan daya tahan penyimpanan. Untuk mengetahui semantik opsi dan batas keamanan secara tepat, lihat [Mode boot](/using-minios/Boot-Modes), [Pemuatan modul Initrd](/reference/boot-process/Module-Loading), dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

## Parameter Boot untuk Performa

Parameter boot dapat memindahkan pekerjaan saat startup dan pembacaan sistem aktif antara RAM dan perangkat sumber. Lihat [Parameter boot](/reference/Boot-Parameters) untuk referensi lengkap.

### Memuat Sistem ke dalam RAM (`toram`)

`toram` dapat mengurangi latensi runtime akibat perangkat USB yang lambat atau ISO yang diakses melalui jaringan, tetapi waktu boot menjadi lebih lama dan penggunaan RAM meningkat drastis. Bare `toram` menggunakan jalur penyalinan penuh. `toram=trim` biasanya menggunakan lebih sedikit RAM, tetapi penyalinan yang lebih terbatas dapat melewatkan data atau modul yang dibutuhkan nanti.

Sisakan ruang untuk lapisan yang dapat ditulis, aplikasi, cache, dan zram; jangan hanya menghitung kebutuhan berkas modul. Semakin banyak RAM yang dialokasikan untuk salinan sistem aktif, semakin sedikit yang tersedia untuk beban kerja. Ikuti [Mode boot](/using-minios/Boot-Modes) untuk mengetahui ketahanan salinan dan batasan pelepasan media.

### Memfilter Modul (`load` dan `noload`)

Pemfilteran dapat mengurangi data yang disalin dan lapisan yang dipasang, terutama dengan `toram=trim`. Konsekuensinya, kemampuan sistem menjadi lebih terbatas dan risiko kegagalan saat boot atau runtime meningkat jika dependensi terlewat. Periksa kumpulan modul yang dihasilkan; sintaks filter dan batasan modul yang dilindungi dijelaskan di [Pemuatan modul Initrd](/reference/boot-process/Module-Loading).

## Optimalisasi Persistensi

Persistensi memindahkan I/O lapisan yang dapat ditulis dari RAM sementara ke penyimpanan atau kontainer. Pilihan backend memengaruhi latensi, kompatibilitas, pengelolaan kapasitas, dan kompleksitas pemulihan.

### Mode Persistensi (`perchmode`)

- **`native`:** Menyimpan layer yang dapat ditulis langsung sebagai file biasa. Mode ini memiliki overhead container paling rendah dan tidak memiliki ukuran container tetap, tetapi memerlukan filesystem pendukung yang mempertahankan metadata dan operasi Linux yang dibutuhkan MiniOS.
- **`raw`:** Menggunakan satu image ext4 berkapasitas tetap. Panjang file ditetapkan sesuai kapasitas yang diminta dan penambahan kapasitas dilakukan secara eksplisit. Karena itu, mode ini sederhana dan mudah diprediksi, tetapi tidak memiliki perilaku kapasitas dinamis seperti backend dinamis. FAT32 membatasi ukuran satu image hingga 4000 MiB.
- **`dynfilefs`:** Backend FUSE menggunakan format 600 dan mengalokasikan payload serta halaman indeks di disk sesuai kebutuhan. Backend ini memuat halaman indeks ke dalam cache terbatas, alih-alih menyimpan seluruh indeks di RAM. Batas cache tidak mencakup metadata allocator, snapshot, atau cache file kernel. FUSE dan filesystem pendukung sama-sama memengaruhi performa I/O.
- **`dynblk`:** Backend kernel format-1 `DBSPRS01` menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM (default 1 MiB). Mengisi perangkat yang sudah ada tidak akan mengalokasikan seluruh peta ke memori. Deskripsi extent dan direktori bertambah sesuai jumlah bagian yang ditetapkan; cache file dan memori codec merupakan tambahan. `dynblk limits --format dynblk` melaporkan batas geometri; `dynblk status /dev/dynblkN --json` melaporkan buffer yang tercatat dan statistik cache. Penimpaan raw biasa dilakukan di tempat; pembaruan terkompresi parsial saat ini mengompresi ulang grain 64-KiB. Pilih kebijakan cache lampiran dengan cermat: `unsafe` mengabaikan jaminan durabilitas.
- **`vmdk`:** Menggunakan driver kernel DynBlk dengan penyimpanan VMDK sparse terpisah standar. Kapasitasnya bertambah sesuai kebutuhan, tetapi tidak memiliki kompresi backend. Seperti container DynBlk native, container ini dapat disalin ke RAM secara terpisah dari modul sistem, lalu disimpan kembali ke penyimpanan secara eksplisit.
- **`squashfs`:** Menyimpan snapshot terkompresi dan membangun ulang upper yang dapat ditulis di RAM pada setiap boot. Mode ini meminimalkan penyimpanan persisten untuk sesi yang sebagian besar stabil, tetapi memerlukan biaya CPU dan RAM saat pemulihan, serta menulis ulang snapshot saat menyimpan. Jika memori mencukupi, proses penyimpanan menyiapkan salinan perubahan yang stabil di RAM dan mengompresnya langsung ke satu kandidat privat di direktori sesi. Setelah verifikasi dan sinkronisasi, MiniOS mengganti secara atomik `changes.sb`; proses ini tidak menulis salinan terkompresi kedua. Jika RAM tidak dapat menampung pohon staging, proses akan menggunakan ruang kerja disk yang ada untuk pohon tersebut.

LUKS2 dapat membungkus Raw, DynFileFS, DynBlk, atau VMDK. Enkripsi menambah proses buka kunci dan overhead kriptografi, tetapi tetap mempertahankan kapasitas dan perilaku penyimpanan backend yang mendasarinya. Kompresi DynBlk dinonaktifkan saat LUKS2 digunakan; VMDK tidak menyediakan kompresi backend.

DynFileFS mendukung discard dan penggunaan kembali ruang yang telah dibebaskan. Jumlah ruang yang dapat dikembalikan ke filesystem host bergantung pada tata letak file pendukung, dukungan filesystem untuk hole punching, dan apakah snapshot masih merujuk data tersebut. Reclaim tidak memindahkan data aktif atau menghapus snapshot. Pemadatan opsional dapat memindahkan data dan menimbulkan penulisan tambahan; lihat [Sesi dan persistensi](/using-minios/Sessions-and-Persistence).

Uji workload yang representatif pada perangkat sebenarnya. Perbedaan pengontrol flash, filesystem, bridge USB, enkripsi, kompresi, dan workload lebih dapat diandalkan daripada pemeringkatan universal mode persistensi.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Kurangi penulisan cache dan log dengan `perch`

Konfigurator MiniOS **Lanjutan** di tab ini menyediakan pengaturan penyimpanan terpisah untuk log sistem biasa, unduhan APT, dan cache browser native standar. Pengaturan ini juga berfungsi di `minios/config.conf` atau `config.conf.d/*.conf` fragmennya:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Setiap pengaturan menerima `persistent` (default) atau `volatile`. Boot ulang setelah mengubah pengaturan. `minios-boot` menerapkan kebijakan setelah aktivasi persistensi berhasil pada penyimpanan tahan lama atau pada sesi RAM yang dapat ditulis dan memiliki catatan `ram-origin` yang terlindungi; meminta persistensi saja tidak cukup. Untuk boot satu kali, gunakan `log-storage=volatile`, `apt-cache=volatile`, atau `browser-cache=volatile` pada baris perintah kernel. Bentuk yang diawali `live-config.`- juga berfungsi dan lebih diutamakan daripada file konfigurasi. Pengaturan ini **tidak** mengaktifkan `perch` dengan sendirinya. Lihat [File konfigurasi](/reference/configuration/config.conf) untuk urutan file sumber dan [Parameter boot](/reference/Boot-Parameters) untuk sintaks lengkap.

| Pengaturan | Yang tetap berada di RAM dengan `volatile` | Yang tetap berada di penyimpanan persisten |
|---|---|---|
| `LIVE_LOG_STORAGE` | Jurnal systemd (maksimum 32 MiB) dan file `/var/log` biasa (tmpfs 32 MiB). | Diagnostik boot di `/var/log/minios/` dan `/var/log/live/`, termasuk tiga versi log sebelumnya. |
| `LIVE_APT_CACHE` | Paket yang diunduh di `/var/cache/apt/archives` (tmpfs 256 atau 512 MiB, bergantung pada memori yang tersedia). | Status paket di `/var/lib/dpkg`, daftar repositori di `/var/lib/apt/lists`, dan file yang terinstal. |
| `LIVE_BROWSER_CACHE` | Satu tmpfs 512 MiB untuk direktori cache standar Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera, dan Yandex Browser di bawah direktori pengguna live `~/.cache`. Kebijakan sistem menonaktifkan cache disk Firefox. | Profil, cookie, kata sandi, data situs, dan cache aplikasi lain yang tidak terkait. |

Cache APT dan browser RAM tidak digunakan jika ruang yang tersedia kurang dari 1 GiB atau swap non-zRAM aktif. tmpfs arsip APT tidak akan melimpah ke perangkat: unduhan yang lebih besar daripada kapasitas tersisa dapat gagal. `policies.json`Cache Firefox yang sudah ada tidak diganti; periksa pengaturan cache disk-nya secara terpisah. Jalur standar browser native disiapkan setelah pengguna live dibuat, termasuk jika browser diinstal belakangan. Jalur khusus, instalasi Flatpak/Snap, dan pengguna yang dibuat setelah penyiapan tersebut tidak dialihkan secara otomatis. Cache browser yang tersimpan sebelumnya disembunyikan oleh mount RAM selama boot ini dan akan muncul kembali saat beralih kembali ke `persistent`.

Dengan persistensi tahan lama, log boot tetap berada di penyimpanan sesi yang dapat ditulis terlepas dari pengaturan log biasa; sesi SquashFS yang tahan lama menyimpannya di luar `changes.sb`, sehingga log tidak bergantung pada penyimpanan snapshot saat dimatikan. Sesi yang disalin dengan `perchtoram` berbeda: lognya tetap berbasis memori hingga disimpan ke penyimpanan. Dengan `volatile`, file lain di bawah `/var/log` (termasuk riwayat teks APT/dpkg) akan hilang saat boot ulang. `EXPORT_LOGS=true` merupakan ekspor eksplisit terpisah ke media MiniOS. Jika tmpfs log 32 MiB penuh, sistem berhenti menerima penulisan log baru alih-alih menumpahkannya ke flash. Jika swap lain yang berbasis disk diaktifkan kemudian, file berbasis memori tetap dapat dipindahkan ke swap tersebut. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting#collecting-logs) untuk mengetahui cara menemukan diagnostik boot.

MiniOS juga menggunakan `noatime` saat memasang filesystem data dan kontainernya sendiri untuk menghindari pembaruan metadata waktu akses; ini tidak memasang ulang disk pengguna yang tidak terkait. `relatime` standar sudah membatasi pembaruan semacam itu, jadi ukur perbedaannya sebelum menganggapnya sebagai penghematan besar. Biarkan jurnal filesystem, barrier, dan `fsync` tetap aktif untuk penyimpanan persisten yang dapat dilepas.

Untuk penulisan file log 16 MiB yang terkontrol, diikuti oleh `sync`, VM Testo mencatat 33.304 sektor ditulis ke disk virtual bawah dalam mode persisten dan 8 sektor dalam mode volatil. Ini menunjukkan perubahan jalur penulisan untuk beban kerja tersebut. Pengukuran ini tidak mencakup penulisan di dalam pengontrol flash USB dan tidak memprediksi umur NAND. Bandingkan beban kerja aplikasi yang sama pada perangkat sebenarnya sebelum menyimpulkan umur pakainya.

## Konfigurasi ZRAM

ZRAM menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menampung lebih banyak halaman tidak aktif, tetapi tidak menambah RAM fisik; beban kerja yang tidak dapat dikompresi tetap menggunakan memori.
Algoritma kompresi menukar throughput dan penggunaan CPU dengan rasio kompresi, dan ketersediaannya bergantung pada kernel. Mulailah dengan nilai default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk beban kerja yang sudah diukur; lihat [Parameter boot](/reference/Boot-Parameters) untuk nilai yang diterima.

## Sistem File dan Perangkat Keras Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang lebih tinggi mempercepat penyalinan modul berukuran besar, sedangkan latensi I/O acak yang rendah lebih penting untuk beban kerja desktop persisten.
  Ukur kinerja perangkat dan enklosur secara bersamaan; generasi USB saja tidak dapat memprediksi kinerja flash atau SSD.
- **Pilihan sistem file:** Sistem file Linux native dapat menggunakan persistensi native tanpa overhead container. Sistem file lintas platform meningkatkan portabilitas, tetapi memerlukan backend container yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan sistem file. Pilih berdasarkan kebutuhan portabilitas dan pemulihan, serta hasil benchmark.
