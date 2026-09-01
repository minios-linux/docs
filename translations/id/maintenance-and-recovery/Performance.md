---
updated: 2026-08-26
---

# Performa

Pengaturan performa di MiniOS pada dasarnya merupakan kompromi antara waktu boot, penggunaan RAM, pembacaan saat runtime, overhead persistensi, dan daya tahan penyimpanan. Untuk detail semantik opsi dan batasan keamanannya, gunakan [Mode Boot](/using-minios/Boot-Modes), [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading), dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals).

## Parameter Boot untuk Performa

Parameter boot dapat memindahkan pekerjaan startup dan pembacaan sistem aktif antara RAM dan perangkat sumber. Lihat [Parameter boot](/reference/Boot-Parameters) untuk referensi lengkap.

### Memuat Sistem ke dalam RAM (`toram`)

`toram` dapat mengurangi latensi runtime dari perangkat USB lambat atau ISO berbasis jaringan, dengan konsekuensi waktu boot lebih lama dan penggunaan RAM yang jauh lebih besar. `toram` secara langsung menggunakan jalur penyalinan penuh. `toram=trim` biasanya memakai lebih sedikit RAM, namun penyalinan yang lebih sempit dapat melewatkan data atau modul yang dibutuhkan kemudian.

Sisakan ruang untuk layer yang dapat ditulis, aplikasi, cache, dan zram, bukan hanya memperhitungkan ukuran file modul. Semakin banyak RAM yang dialokasikan untuk salinan live, semakin sedikit yang tersedia untuk beban kerja. Ikuti [Mode Boot](/using-minios/Boot-Modes) untuk ketahanan salinan dan batasan pelepasan media.

### Memfilter Modul (`load` dan `noload`)

Pemfilteran dapat mengurangi data yang disalin dan layer yang di-mount, terutama dengan `toram=trim`. Konsekuensinya adalah sistem menjadi kurang kapabel dan risiko kegagalan boot atau runtime lebih tinggi jika ada dependensi yang terlewat. Pastikan set modul yang dihasilkan sudah benar; sintaks filter dan batasan modul yang dilindungi dijelaskan di [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading).

## Optimasi Persistensi

Persistensi memindahkan I/O layer yang dapat ditulis dari RAM sementara ke penyimpanan atau kontainer. Pilihan backend memengaruhi latensi, kompatibilitas, manajemen kapasitas, dan kompleksitas pemulihan.

### Mode Persistensi (`perchmode`)

- **`native`:** Menghindari layer filesystem-in-a-file dan merupakan pilihan paling sederhana pada filesystem POSIX yang sesuai, namun tidak tersedia pada filesystem yang tidak dapat mempertahankan metadata Linux yang dibutuhkan.
- **`raw`:** Memiliki kapasitas tetap yang dapat diprediksi dan perilaku ext4 konvensional, namun ukuran file-nya dicadangkan dan tidak dapat bertambah melebihi kapasitas penyimpanan yang tersedia.
- **`dynfilefs`:** Dapat berkembang sesuai kebutuhan dan mendukung media yang seharusnya tidak cocok, dengan tambahan kompleksitas pemetaan dan pemulihan.
- **`luks`:** Menambah kerahasiaan dengan konsekuensi pekerjaan unlock dan overhead enkripsi.
- **`squashfs`:** Menukar kompresi saat penyimpanan dan pekerjaan ekstraksi RAM untuk snapshot yang ringkas; ini bukan backend writable berlatensi rendah secara umum.

Uji beban kerja representatif pada perangkat sebenarnya. Perbedaan pada controller flash, filesystem, bridge USB, dan beban kerja lebih menentukan dibandingkan peringkat mode persistensi secara umum.

## Konfigurasi ZRAM

Zram menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menyerap lebih banyak halaman tidak aktif, namun tidak menciptakan RAM fisik; beban kerja yang tidak dapat dikompresi tetap mengonsumsi memori.
Algoritma kompresi menyeimbangkan throughput dan penggunaan CPU terhadap rasio kompresi, dan ketersediaannya tergantung kernel. Mulailah dengan pengaturan default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk beban kerja yang sudah diukur; lihat [Parameter boot](/reference/Boot-Parameters) untuk nilai yang diterima.

## Filesystem dan Perangkat Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang lebih tinggi mempercepat penyalinan modul besar, sementara latensi I/O acak yang rendah lebih penting untuk beban kerja desktop persisten.
  Ukur perangkat dan enclosure secara bersamaan; generasi USB saja tidak menjamin performa flash atau SSD.
- **Pilihan filesystem:** Filesystem Linux native dapat menggunakan persistensi native tanpa overhead kontainer. Filesystem lintas platform meningkatkan portabilitas namun membutuhkan backend kontainer yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan filesystem. Pilih berdasarkan kebutuhan portabilitas dan pemulihan serta hasil benchmark.
