---
updated: 2026-08-26
---

# Panduan kompatibilitas perangkat keras

Dukungan perangkat keras bergantung pada rilis dan image MiniOS: distribusi dasar, kernel, firmware, modul yang disertakan, dan edisi semuanya berpengaruh. Periksa deskripsi rilis untuk image yang Anda unduh, lalu uji sesi live baru sebelum mengganti disk atau menggunakan mesin tersebut untuk pekerjaan yang bersifat persisten.

## Persyaratan sistem

Image MiniOS untuk PC yang dipublikasikan ditujukan untuk arsitektur **amd64** (x86 64-bit) kecuali jika deskripsi rilis menyatakan lain. Kebutuhan sumber daya bervariasi tergantung image, edisi, desktop, aplikasi, dan mode boot:

- CPU harus mendukung arsitektur image dan mode firmware yang dipilih.
- RAM harus mencukupi untuk edisi dan beban kerja yang dipilih. Mode `toram` membutuhkan memori tambahan untuk data image yang disalin.
- Media boot harus memiliki ruang yang cukup untuk image yang diunduh. Persistensi, data pengguna, dan instalasi native memerlukan penyimpanan tambahan yang dapat ditulis.
- Kebutuhan grafis bergantung pada desktop dan aplikasi di edisi yang dipilih.

Menulis image ke perangkat yang lebih besar tidak otomatis membuat penyimpanan persisten. Lihat [Boot modes](/configuration/Boot-Modes.md) untuk panduan resmi perilaku live boot dan [Quick start](/installation/Quick-Start.md) untuk persiapan media.

## Kompatibilitas komponen

### Prosesor

Kompatibilitas bergantung pada arsitektur dan kernel yang disertakan dalam image yang dipilih. Periksa catatan rilis jika menggunakan prosesor terbaru atau fitur CPU yang memerlukan dukungan kernel yang lebih baru.

### Grafis

Dukungan grafis bergantung pada driver kernel, firmware, dan stack grafis userspace dalam image. Sebuah kartu grafis mungkin hanya menyediakan output tampilan dasar tanpa mendukung akselerasi hardware atau semua konektor. Beberapa hardware NVIDIA mungkin memerlukan driver proprietary yang tidak disertakan dalam image tertentu.

### Jaringan

Dukungan Ethernet dan Wi-Fi bergantung pada controller, driver kernel, dan firmware yang disertakan dalam image. Uji jaringan dari sesi baru. Untuk Wi-Fi, periksa juga apakah perangkat memerlukan firmware atau driver out-of-tree yang tidak ada di rilis tersebut.

### Penyimpanan

Perangkat USB, SATA, NVMe, IDE, dan SD/MMC hanya berfungsi jika image yang dipilih memiliki driver untuk controller-nya dan kernel dapat mengenali perangkat tersebut. Pemindaian initrd tidak membuat controller yang tidak didukung menjadi kompatibel. Lihat [Initrd system discovery](/configuration/Initrd-System-Discovery.md) untuk perilaku pencarian live-source secara detail.

Mode live dan mode native memiliki jalur boot yang berbeda. Mode live mendeteksi pohon data MiniOS dan merakit modul read-only di userspace awal; mode native melakukan boot ke root yang diinstal secara konvensional. Lihat [Initrd module loading](/configuration/Initrd-Module-Loading.md) untuk penanganan modul live dan [Installing MiniOS](/installation/Installing-MiniOS.md) untuk perbedaan tata letak.

### Virtualisasi

MiniOS dapat dijalankan sebagai guest jika image yang dipilih menyertakan driver untuk CPU, penyimpanan, jaringan, dan perangkat display yang dikonfigurasi pada VM. Dukungan tidak dijamin untuk setiap hypervisor atau model controller. Dukungan VirtIO, VMware, Hyper-V, serta IDE atau SATA emulasi harus dicek terhadap rilis dan diuji dengan konfigurasi VM yang spesifik.

Agen guest dan alat integrasi desktop juga bervariasi tergantung edisi dan image. Lihat [daftar paket](/administration/Packages.md) dan [panduan Virtualisasi](/administration/Virtualization.md) sebelum mengasumsikan fitur seperti clipboard sharing, resolusi dinamis, shutdown bersih, atau komunikasi dengan host tersedia.
