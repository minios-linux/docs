---
updated: 2026-08-26
---

# Optimasi Performa

Penyesuaian performa di MiniOS terutama merupakan kompromi antara waktu boot, penggunaan RAM, pembacaan saat runtime, overhead persistensi, dan daya tahan penyimpanan. Untuk detail opsi, makna, dan batasan keamanannya, gunakan [Boot modes](/configuration/Boot-Modes.md), [Initrd module loading](/configuration/Initrd-Module-Loading.md), dan [Initrd persistence](/configuration/Initrd-Persistence.md).

## Parameter Boot untuk Performa

Parameter boot dapat memindahkan proses startup dan pembacaan sistem berjalan antara RAM dan perangkat sumber. Lihat [Boot parameters](/configuration/Boot-Parameters.md) untuk referensi lengkapnya.

### Memuat Sistem ke dalam RAM (`toram`)

`toram` dapat mengurangi latensi runtime dari perangkat USB lambat atau ISO berbasis jaringan, dengan konsekuensi waktu boot lebih lama dan penggunaan RAM yang jauh lebih besar. `toram` secara langsung menggunakan jalur penyalinan penuh. `toram=trim` biasanya memakai lebih sedikit RAM, namun penyalinan yang lebih terbatas ini bisa melewatkan data atau modul yang dibutuhkan kemudian.

Sisakan ruang untuk layer yang dapat ditulis, aplikasi, cache, dan zram, bukan hanya memperhitungkan file modul saja. Semakin banyak RAM yang dialokasikan untuk salinan live, semakin sedikit yang tersedia untuk beban kerja. Ikuti [Boot modes](/configuration/Boot-Modes.md) untuk ketahanan salinan dan batasan pelepasan media.

### Memfilter Modul (`load` dan `noload`)

Pemfilteran dapat mengurangi data yang disalin dan layer yang di-mount, terutama dengan `toram=trim`. Konsekuensinya adalah sistem menjadi kurang kapabel dan risiko kegagalan boot atau runtime meningkat jika ada dependensi yang terlewat. Pastikan set modul yang dihasilkan sudah benar; sintaks filter dan batasan modul yang dilindungi dijelaskan di [Initrd module loading](/configuration/Initrd-Module-Loading.md).

## Optimasi Persistensi

Persistensi memindahkan I/O layer yang dapat ditulis dari RAM sementara ke penyimpanan atau kontainer. Pilihan backend memengaruhi latensi, kompatibilitas, manajemen kapasitas, dan kompleksitas pemulihan.

### Mode Persistensi (`perchmode`)

- **`native`:** Menghindari layer filesystem-in-a-file dan merupakan pilihan paling sederhana pada filesystem POSIX yang sesuai, namun tidak tersedia pada filesystem yang tidak dapat mempertahankan metadata Linux yang dibutuhkan.
- **`raw`:** Memiliki kapasitas tetap yang dapat diprediksi dan perilaku ext4 konvensional, tetapi ukuran file-nya sudah dipesan dan tidak dapat melebihi kapasitas penyimpanan yang tersedia.
- **`dynfilefs`:** Dapat berkembang sesuai kebutuhan dan mendukung media yang sebelumnya tidak cocok, dengan tambahan kompleksitas pemetaan dan pemulihan.
- **`luks`:** Menambah kerahasiaan dengan konsekuensi pekerjaan unlock dan overhead enkripsi.
- **`squashfs`:** Menukar kompresi saat penyimpanan dan proses ekstraksi RAM untuk snapshot yang ringkas; ini bukan backend writable berlatensi rendah secara umum.

Lakukan benchmark pada beban kerja representatif di perangkat sebenarnya. Perbedaan pada controller flash, filesystem, USB bridge, dan beban kerja lebih menentukan dibandingkan peringkat mode persistensi secara umum.

## Konfigurasi ZRAM

Zram menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menyerap lebih banyak halaman tidak aktif namun tidak menciptakan RAM fisik; beban kerja yang tidak dapat dikompresi tetap mengonsumsi memori. Algoritma kompresi menukar throughput dan penggunaan CPU dengan rasio kompresi, dan ketersediaannya tergantung pada kernel. Mulailah dengan pengaturan default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk beban kerja yang sudah terukur; lihat [Boot parameters](/configuration/Boot-Parameters.md) untuk nilai yang diterima.

## Filesystem dan Perangkat Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang lebih tinggi mempercepat penyalinan modul besar, sementara latensi random-I/O yang rendah lebih penting untuk beban kerja desktop yang persisten. Ukur perangkat dan enclosure secara bersamaan; generasi USB saja tidak menjamin performa flash atau SSD.
- **Pilihan filesystem:** Filesystem Linux native dapat menggunakan persistensi native tanpa overhead kontainer. Filesystem lintas platform meningkatkan portabilitas namun membutuhkan backend kontainer yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan filesystem. Pilih berdasarkan kebutuhan portabilitas, pemulihan, dan hasil benchmark.
