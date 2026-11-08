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

- **`native`:** Menyimpan layer yang dapat ditulis langsung sebagai file biasa. Overhead kontainer paling rendah dan tidak ada ukuran kontainer tetap, namun membutuhkan filesystem pendukung yang menjaga metadata dan operasi Linux yang diperlukan oleh MiniOS.
- **`raw`:** Menggunakan satu image ext4 dengan kapasitas tetap. Panjang file disesuaikan dengan kapasitas yang diminta dan pertumbuhan dilakukan secara eksplisit, sehingga sederhana dan mudah diprediksi, namun tidak memiliki perilaku kapasitas tipis seperti backend dinamis. FAT32 membatasi ukuran image tunggal hingga 4000 MiB.
- **`dynfilefs`:** Backend FUSE/format-400 memperluas penyimpanan payload sesuai kebutuhan dan mendukung media yang biasanya tidak cocok. Indeksnya tidak sparse: setiap blok logis 4 KiB membutuhkan satu offset 8-byte, sehingga kapasitas logis memerlukan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan indeks per GiB meskipun payload kosong. Hal ini membuat kapasitas sedang efisien, namun kapasitas tipis yang besar menjadi mahal di awal.
- **`dynblk`:** Format-1 `DBSPRS01` backend kernel menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM (standar 1 MiB). Mengisi perangkat yang sudah ada tidak mengalokasikan peta resident penuh. Deskripsi extent dan direktori diskalakan sesuai bagian yang dideklarasikan; cache file dan memori codec merupakan tambahan.`dynblk limits --format dynblk` melaporkan batas geometri; `dynblk status /dev/dynblkN --json` melaporkan buffer yang digunakan dan statistik cache. Penulisan ulang mentah biasa tetap di tempat; pembaruan terkompresi parsial saat ini akan mengompresi ulang satu grain 64-KiB. Pilih kebijakan cache attachment dengan cermat: `unsafe` mengorbankan jaminan daya tahan.
- **`vmdk`:** Menggunakan driver kernel DynBlk dengan penyimpanan VMDK split sparse standar. Bertambah sesuai kebutuhan namun tidak memiliki kompresi backend. Seperti kontainer DynBlk native, dapat disalin ke RAM secara independen dari modul sistem dan disimpan kembali ke penyimpanan secara eksplisit.
- **`squashfs`:** Menyimpan snapshot terkompresi dan merekonstruksi layer atas yang dapat ditulis di RAM setiap kali boot. Meminimalkan penyimpanan persisten untuk sesi yang sebagian besar stabil namun membutuhkan beban CPU dan RAM saat restore serta menulis ulang snapshot saat menyimpan. Jika memori cukup, proses penyimpanan akan melakukan staging salinan perubahan yang stabil di RAM dan langsung mengompresi ke satu kandidat privat di direktori sesi. Setelah verifikasi dan sinkronisasi, MiniOS secara atomik menggantikan `changes.sb`; tidak menulis salinan terkompresi kedua. Jika RAM tidak dapat menampung pohon staging, maka akan menggunakan ruang kerja disk yang sudah ada untuk pohon tersebut.

LUKS2 dapat membungkus Raw, DynFileFS, DynBlk, atau VMDK. Enkripsi menambah proses unlock dan overhead kriptografi sambil mempertahankan kapasitas dan perilaku penyimpanan backend yang digunakan. Kompresi DynBlk dinonaktifkan saat LUKS2 digunakan; VMDK tidak pernah menyediakan kompresi backend.

DynFileFS 4.6.0 dan branch eksperimental 5.01 MiniOS menambahkan fitur discard dan penggunaan ulang alokasi pada backend asli. Untuk demonstrasi yang dapat direproduksi, lihat `tests/benefit-minios.py` di repository DynFileFS. Pada pengujian sintetis di penyimpanan ext4 lego2 (bukan perangkat USB flash), melakukan discard 32 MiB menurunkan alokasi MiniOS dari sekitar 49 MiB menjadi 17 MiB; setelah 16 MiB penulisan tambahan, MiniOS menggunakan sekitar 25 MiB, dibandingkan sekitar 57 MiB pada backend Tomas-M 5.01 asli. Reclaim tanpa pemindahan dan kompaksi opsional tidak melepaskan ruang tambahan pada layout tersebut. Angka-angka ini spesifik untuk beban kerja, dan backend asli tidak diberikan penulisan (zero writes) melainkan discard karena tidak mengimplementasikan antarmuka tersebut. Jangan menafsirkan hasil ini sebagai keunggulan kecepatan atau daya tahan secara umum.

Lakukan benchmark beban kerja representatif pada perangkat yang sebenarnya. Perbedaan pada controller flash, filesystem, USB bridge, enkripsi, kompresi, dan beban kerja lebih menentukan dibandingkan peringkat mode persistensi secara umum.

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
