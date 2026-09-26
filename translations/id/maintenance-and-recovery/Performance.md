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

- **`native`:** Menyimpan layer yang dapat ditulis langsung sebagai file biasa. Overhead kontainer paling rendah dan tidak ada ukuran kontainer tetap, namun membutuhkan filesystem pendukung yang dapat menjaga metadata dan operasi Linux yang diperlukan oleh MiniOS.
- **`raw`:** Menggunakan satu image ext4 berkapasitas tetap. Panjang file ditetapkan sesuai kapasitas yang diminta dan pertumbuhan harus dilakukan secara eksplisit, sehingga sederhana dan dapat diprediksi namun tidak memiliki perilaku kapasitas tipis seperti backend dinamis. FAT32 membatasi satu image hingga 4000 MiB.
- **`dynfilefs`:** Backend FUSE/format-400 memperluas penyimpanan payload sesuai kebutuhan dan mendukung media yang biasanya tidak cocok. Indeksnya tidak sparse: setiap blok logis 4 KiB membutuhkan satu offset 8-byte, sehingga kapasitas logis memerlukan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan indeks per GiB, bahkan jika payload kosong. Ini membuat kapasitas sedang efisien, tetapi kapasitas tipis besar menjadi mahal di awal.
- **`dynblk`:** Format-1 `DBSPRS01` backend kernel menyimpan tabel pemetaan di disk dan cache metadata terbatas di RAM (default 1 MiB). Mengisi perangkat yang sudah ada tidak mengalokasikan peta resident penuh. Deskripsi extent dan direktori diskalakan sesuai bagian yang dideklarasikan; cache file dan memori codec adalah tambahan. `dynblk limits --format dynblk` melaporkan batas geometri; `dynblk status /dev/dynblkN --json` melaporkan buffer dan statistik cache yang dihitung. Penulisan ulang raw biasa tetap di tempat; pembaruan terkompresi parsial saat ini akan mengompresi ulang satu grain 64-KiB. Pilih kebijakan cache attachment dengan cermat: `unsafe` mengorbankan jaminan durabilitas.
- **`squashfs`:** Menyimpan snapshot terkompresi dan merekonstruksi upper yang dapat ditulis di RAM setiap kali boot. Ini meminimalkan penyimpanan persisten untuk sesi yang sebagian besar stabil, tetapi membutuhkan biaya CPU dan RAM saat restore dan menulis ulang snapshot ketika menyimpan. Jika memori memungkinkan, proses penyimpanan akan menyiapkan salinan perubahan yang stabil di RAM dan mengompresi langsung ke satu kandidat privat di direktori sesi. Setelah verifikasi dan sinkronisasi, MiniOS secara atomik menggantikan `changes.sb`; tidak menulis salinan terkompresi kedua. Jika RAM tidak cukup untuk staging tree, maka menggunakan workspace disk yang ada untuk tree tersebut.

LUKS2 dapat membungkus Raw, DynFileFS, atau DynBlk. Enkripsi menambah overhead unlock dan kriptografi, namun tetap mempertahankan kapasitas dan perilaku penyimpanan backend yang mendasarinya.

Lakukan benchmark pada beban kerja representatif di perangkat sebenarnya. Perbedaan pengontrol flash, filesystem, USB bridge, enkripsi, kompresi, dan beban kerja lebih berpengaruh daripada peringkat mode persistensi secara umum.

### Kurangi penulisan cache dan log dengan `perch`

Konfigurator MiniOS **Lanjutan** menyediakan pengaturan penyimpanan terpisah untuk log sistem biasa, unduhan APT, dan cache browser-native standar. Fitur ini juga berlaku di `minios/config.conf` atau fragmen `config.conf.d/*.conf` berikut:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Setiap pengaturan menerima `persistent` (default) atau `volatile`. Reboot setelah mengubah salah satu pengaturan. `minios-boot` hanya menerapkan kebijakan jika sesi `perch` yang berjalan sudah dipastikan dapat ditulis dan tahan lama; permintaan persistensi saja tidak cukup. Untuk boot satu kali, gunakan `log-storage=volatile`, `apt-cache=volatile`, atau `browser-cache=volatile` di baris perintah kernel. Bentuk yang diawali dengan `live-config.`- juga berfungsi dan akan mengesampingkan file konfigurasi. Pengaturan ini **tidak** mengaktifkan `perch` secara otomatis. Lihat [File konfigurasi](/reference/configuration/config.conf) untuk urutan file sumber dan [Parameter boot](/reference/Boot-Parameters) untuk sintaks lengkapnya.

| Pengaturan | Apa yang tetap di RAM dengan `volatile` | Apa yang tetap di penyimpanan persisten |
|---|---|---|
| `LIVE_LOG_STORAGE` | Jurnal systemd (maksimal 32 MiB) dan file `/var/log` biasa (tmpfs 32 MiB). | Log boot di `/var/log/minios/` dan `/var/log/live/`, termasuk tiga versi log sebelumnya. |
| `LIVE_APT_CACHE` | Paket yang diunduh di `/var/cache/apt/archives` (tmpfs 256 atau 512 MiB, tergantung memori yang tersedia). | Status paket di `/var/lib/dpkg`, daftar repository di `/var/lib/apt/lists`, dan file yang terpasang. |
| `LIVE_BROWSER_CACHE` | Satu tmpfs 512 MiB bersama untuk direktori cache standar Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera, dan Yandex Browser di bawah direktori `~/.cache` pengguna live. Kebijakan sistem menonaktifkan cache disk Firefox. | Profil, cookie, kata sandi, data situs, dan cache aplikasi lain yang tidak terkait. |

Cache APT dan browser RAM dilewati jika tersedia kurang dari 1 GiB atau swap non-zRAM aktif. Tmpfs arsip APT tidak akan overflow ke perangkat: unduhan yang lebih besar dari kapasitas tersisa bisa gagal. File `policies.json` Firefox yang sudah ada tidak akan diganti; periksa pengaturan cache disk secara terpisah. Path browser-native standar disiapkan setelah user live dibuat, termasuk jika browser diinstal belakangan. Path kustom, instalasi Flatpak/Snap, dan user yang dibuat setelah setup tidak otomatis diarahkan ulang. Cache browser yang sudah tersimpan sebelumnya akan disembunyikan oleh mount RAM untuk boot ini dan akan muncul kembali saat kembali ke `persistent`.

Log boot tetap berada di media persistensi yang dapat ditulis terlepas dari pengaturan log biasa; sesi SquashFS menyimpannya di luar `changes.sb`, sehingga tidak tergantung pada penyimpanan snapshot saat shutdown. Dengan `volatile` pengaturan ini, file lain di bawah `/var/log` (termasuk riwayat teks APT/dpkg) akan hilang saat reboot. `EXPORT_LOGS=true` adalah ekspor eksplisit terpisah ke media MiniOS. Jika tmpfs log 32 MiB penuh, penulisan log baru akan ditolak, tidak dialihkan ke flash. Jika swap berbasis disk diaktifkan kemudian, file berbasis memori tetap dapat dipindahkan ke swap tersebut. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting#collecting-logs) untuk menemukan log boot.

MiniOS juga menggunakan `noatime` saat me-mount data dan filesystem kontainernya sendiri, sehingga menghindari update metadata access-time; ini tidak me-remount disk user lain. `relatime` standar sudah membatasi update semacam itu, jadi ukur dulu perbedaannya sebelum menganggapnya sebagai penghematan besar. Pastikan journal filesystem, barrier, dan `fsync` tetap aktif untuk media persistensi yang dapat dilepas.

Untuk penulisan file log 16 MiB secara terkontrol yang diikuti dengan `sync`, sebuah VM Testo mencatat 33.304 sektor ditulis ke disk virtual bawahnya dalam mode persisten dan 8 di mode volatile. Ini menunjukkan perubahan jalur penulisan untuk beban kerja tersebut. Namun tidak mengukur penulisan di dalam pengontrol USB flash atau memprediksi umur NAND. Bandingkan beban kerja aplikasi yang identik di perangkat sebenarnya sebelum menarik kesimpulan tentang masa pakai perangkat.
