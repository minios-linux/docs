---
updated: 2026-09-26
---

# Performa

Penyetelan performa di MiniOS umumnya merupakan kompromi antara waktu boot, penggunaan RAM, pembacaan saat runtime, beban persistensi, dan daya tahan penyimpanan. Untuk detail opsi dan batasan keamanannya, gunakan [Mode Boot](/using-minios/Boot-Modes), [Pemrosesan Modul Initrd](/reference/boot-process/Module-Loading), dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

## Parameter Boot untuk Performa

Parameter boot dapat memindahkan proses startup dan pembacaan sistem berjalan antara RAM dan perangkat sumber. Lihat [Parameter Boot](/reference/Boot-Parameters) untuk referensi lengkap.

### Memuat Sistem ke dalam RAM (`toram`)

`toram` dapat mengurangi latensi saat runtime dari perangkat USB lambat atau ISO berbasis jaringan, dengan konsekuensi waktu boot lebih lama dan penggunaan RAM yang jauh lebih besar. Bare `toram` menggunakan metode salin penuh. `toram=trim` biasanya lebih hemat RAM, namun penyalinan yang lebih sempit bisa melewatkan data atau modul yang dibutuhkan kemudian.

Sisakan ruang untuk layer yang bisa ditulis, aplikasi, cache, dan zram, bukan hanya memperhitungkan file modul saja. Semakin banyak RAM yang dialokasikan untuk salinan live, semakin sedikit yang tersedia untuk workload. Ikuti [Mode Boot](/using-minios/Boot-Modes) untuk ketahanan salinan dan batasan pelepasan media.

### Penyaringan Modul (`load` dan `noload`)

Penyaringan dapat mengurangi data yang disalin dan layer yang di-mount, terutama dengan `toram=trim`. Konsekuensinya adalah sistem menjadi kurang kapabel dan risiko kegagalan boot atau runtime meningkat jika ada dependensi yang terlewat. Pastikan set modul hasil filter; sintaks filter dan batasan modul yang dilindungi dijelaskan di [Pemrosesan Modul Initrd](/reference/boot-process/Module-Loading).

## Optimasi Persistensi

Persistensi memindahkan I/O layer yang bisa ditulis dari RAM sementara ke penyimpanan atau kontainer. Pilihan backend memengaruhi latensi, kompatibilitas, manajemen kapasitas, dan kompleksitas pemulihan.

### Mode Persistensi (`perchmode`)

- **`native`:** Menyimpan layer yang dapat ditulis langsung sebagai file biasa. Overhead container sangat minim dan tidak ada ukuran container tetap, namun membutuhkan filesystem pendukung yang dapat mempertahankan metadata dan operasi Linux yang diperlukan oleh MiniOS.
- **`raw`:** Menggunakan satu image ext4 dengan kapasitas tetap. Panjang file diatur sesuai kapasitas yang diminta dan pertumbuhan dilakukan secara eksplisit, sehingga sederhana dan dapat diprediksi, namun tidak memiliki perilaku kapasitas tipis seperti backend dinamis. FAT32 membatasi satu image hingga 4000 MiB.
- **`dynfilefs`:** Backend FUSE/format-400 memperluas penyimpanan payload sesuai kebutuhan dan mendukung media yang biasanya tidak cocok. Indeksnya tidak sparse: setiap blok logis 4 KiB membutuhkan satu offset 8-byte, sehingga kapasitas logis memerlukan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan indeks per GiB, bahkan saat payload kosong. Hal ini membuat kapasitas sedang menjadi efisien, namun kapasitas tipis yang besar menjadi mahal di awal.
- **`dynblk`:** Backend kernel format-1 `DBSPRS01` menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM (default 1 MiB). Mengisi perangkat yang sudah ada tidak mengalokasikan peta resident penuh. Deskripsi extent dan direktori diskalakan sesuai bagian yang dideklarasikan; cache file dan memori codec merupakan tambahan.`dynblk limits --format dynblk` melaporkan batas geometri; `dynblk status /dev/dynblkN --json` melaporkan buffer yang digunakan dan statistik cache. Penulisan ulang mentah biasa tetap di tempat; pembaruan terkompresi parsial saat ini akan mengompresi ulang satu grain 64-KiB. Pilih kebijakan cache attachment dengan cermat: `unsafe` mengorbankan jaminan durabilitas.
- **`squashfs`:** Menyimpan snapshot terkompresi dan merekonstruksi layer atas yang dapat ditulis di RAM setiap kali boot. Mode ini meminimalkan penyimpanan persisten untuk sesi yang sebagian besar stabil, tetapi membutuhkan beban CPU dan RAM saat restore dan menulis ulang snapshot saat menyimpan. Jika memori cukup, proses penyimpanan akan menyiapkan salinan perubahan yang stabil di RAM dan mengompres langsung ke satu kandidat privat di direktori sesi. Setelah verifikasi dan sinkronisasi, MiniOS secara atomik menggantikan `changes.sb`; tidak menulis salinan terkompresi kedua. Jika RAM tidak cukup untuk staging tree, maka workspace disk yang ada akan digunakan.

LUKS2 dapat membungkus Raw, DynFileFS, atau DynBlk. Enkripsi menambah overhead saat unlock dan kriptografi, namun tetap mempertahankan kapasitas dan perilaku penyimpanan backend yang digunakan.

Lakukan benchmark beban kerja representatif langsung pada perangkat yang digunakan. Perbedaan pada controller flash, filesystem, USB bridge, enkripsi, kompresi, dan jenis beban kerja lebih berpengaruh daripada urutan mode persistensi secara umum.

### Kurangi penulisan cache dan log dengan `perch`

Konfigurator MiniOS **Lanjutan** menyediakan pengaturan penyimpanan terpisah untuk log sistem biasa, unduhan APT, dan cache browser-native standar. Pengaturan ini juga berfungsi di `minios/config.conf` atau fragmen `config.conf.d/*.conf`:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Setiap pengaturan menerima `persistent` (default) atau `volatile`. Reboot setelah mengubah salah satunya. `minios-boot` hanya menerapkan kebijakan saat sesi `perch` berjalan sudah dipastikan dapat ditulis dan tahan lama; permintaan persistensi saja tidak cukup. Untuk boot satu kali, gunakan `log-storage=volatile`, `apt-cache=volatile`, atau `browser-cache=volatile` pada kernel command line. Bentuk dengan awalan `live-config.`- juga berlaku dan akan lebih diutamakan daripada file konfigurasi. Pengaturan ini **tidak** mengaktifkan `perch` secara otomatis. Lihat [File konfigurasi](/reference/configuration/config.conf) untuk urutan sumber file dan [Parameter boot](/reference/Boot-Parameters) untuk sintaks lengkap.

| Pengaturan | Apa yang tetap di RAM dengan `volatile` | Apa yang tetap di penyimpanan persisten |
|---|---|---|
| `LIVE_LOG_STORAGE` | Jurnal systemd (maksimum 32 MiB) dan file `/var/log` biasa (32 MiB tmpfs). | Log boot di `/var/log/minios/` dan `/var/log/live/`, termasuk tiga versi log sebelumnya. |
| `LIVE_APT_CACHE` | Paket yang diunduh di `/var/cache/apt/archives` (256 atau 512 MiB tmpfs, tergantung memori yang tersedia). | Status paket di `/var/lib/dpkg`, daftar repository di `/var/lib/apt/lists`, dan file yang terinstal. |
| `LIVE_BROWSER_CACHE` | Satu tmpfs 512 MiB bersama untuk direktori cache standar Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera, dan Yandex Browser di bawah direktori `~/.cache`. Kebijakan sistem menonaktifkan cache disk Firefox. | Profil, cookie, kata sandi, data situs, dan cache aplikasi lain yang tidak terkait. |

Cache APT dan browser RAM akan dilewati jika tersedia kurang dari 1 GiB atau swap non-zRAM aktif. Tmpfs arsip APT tidak akan overflow ke perangkat: unduhan yang lebih besar dari sisa kapasitasnya bisa gagal. Jika sudah ada `policies.json` Firefox tidak akan diganti; periksa pengaturan disk-cache secara terpisah. Path browser-native standar disiapkan setelah user live dibuat, termasuk jika browser diinstal kemudian. Path kustom, instalasi Flatpak/Snap, dan user yang dibuat setelah setup tidak otomatis dialihkan. Cache browser yang sudah tersimpan sebelumnya akan disembunyikan oleh mount RAM untuk sesi boot ini dan akan muncul kembali saat kembali ke `persistent`.

Log boot tetap berada di media persistensi yang dapat ditulis, terlepas dari pengaturan log biasa; sesi SquashFS menyimpannya di luar `changes.sb`, sehingga tidak tergantung pada penyimpanan snapshot saat shutdown. Dengan `volatile`, file lain di bawah `/var/log` (termasuk riwayat teks APT/dpkg) akan hilang saat reboot. `EXPORT_LOGS=true` merupakan ekspor terpisah secara eksplisit ke media MiniOS. Jika log tmpfs 32 MiB penuh, tidak akan menerima penulisan log baru dan tidak akan menulis ke flash. Jika swap berbasis disk diaktifkan kemudian, file berbasis memori tetap dapat dipindahkan ke swap tersebut. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting#collecting-logs) untuk menemukan log boot.

MiniOS juga menggunakan `noatime` saat me-mount data dan filesystem container-nya sendiri, sehingga menghindari update metadata access-time; ini tidak me-remount disk user lain. `relatime` standar sudah membatasi update seperti itu, jadi ukur dulu perbedaannya sebelum menganggapnya sebagai penghematan besar. Pastikan journal filesystem, barrier, dan `fsync` tetap aktif untuk media persistensi yang dapat dilepas.

Untuk penulisan file log 16 MiB secara terkontrol yang diikuti dengan `sync`, VM Testo mencatat 33.304 sektor ditulis ke disk virtual bawahnya dalam mode persisten dan 8 di mode volatile. Ini menunjukkan perubahan jalur penulisan untuk beban kerja tersebut. Tidak mengukur penulisan di dalam controller USB flash atau memprediksi umur NAND. Bandingkan beban kerja aplikasi yang sama persis di perangkat sebenarnya sebelum mengambil kesimpulan tentang umur perangkat.

## Konfigurasi ZRAM

Zram menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menyerap lebih banyak halaman tidak aktif, namun tidak menciptakan RAM fisik; beban kerja yang tidak dapat dikompresi tetap mengonsumsi memori.
Algoritma kompresi menukar throughput dan penggunaan CPU dengan rasio kompresi, dan ketersediaannya tergantung pada kernel. Mulailah dengan default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk beban kerja yang sudah diukur; lihat [Parameter boot](/reference/Boot-Parameters) untuk nilai yang diterima.

## Filesystem dan Perangkat Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang tinggi mempercepat penyalinan modul besar, sedangkan latensi I/O acak yang rendah lebih penting untuk beban kerja desktop persisten.
  Ukur perangkat dan enclosure secara bersamaan; generasi USB saja tidak menjamin performa flash atau SSD.
- **Pilihan filesystem:** Filesystem Linux native dapat menggunakan persistensi native tanpa overhead container. Filesystem lintas platform meningkatkan portabilitas, namun membutuhkan backend container yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan filesystem. Pilih berdasarkan kebutuhan portabilitas dan pemulihan, serta hasil benchmark.
