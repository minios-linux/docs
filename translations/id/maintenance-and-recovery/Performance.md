---
updated: 2026-09-13
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

- **`native`:** Menghindari layer filesystem-in-a-file dan merupakan pilihan paling sederhana pada filesystem POSIX yang sesuai, namun tidak tersedia pada filesystem yang tidak dapat menyimpan metadata Linux yang diperlukan.
- **`raw`:** Memiliki kapasitas tetap yang dapat diprediksi dan perilaku ext4 konvensional, tetapi ukuran file-nya dicadangkan dan tidak dapat bertambah melebihi ruang penyimpanan yang tersedia.
- **`dynfilefs`:** Backend FUSE/format-400 dapat berkembang sesuai kebutuhan dan mendukung media yang sebelumnya tidak cocok, dengan tambahan kompleksitas pemetaan dan pemulihan.
- **`dynblk`:** Backend blok kernel format-1 menghadirkan perangkat blok normal sementara dukungan tipis `volumeNNN.db` bertambah sesuai kebutuhan. Menghindari I/O FUSE, namun setiap perangkat yang terpasang mengonsumsi memori metadata tetap dan penulisan tetap dibatasi oleh ruang kosong filesystem dan batasan admisi dynblk.
- **`luks`:** Menambah kerahasiaan dengan konsekuensi pekerjaan unlock dan beban enkripsi.
- **`squashfs`:** Mengorbankan waktu kompresi saat menyimpan dan proses ekstraksi RAM untuk snapshot yang ringkas; bukan backend writable berlatensi rendah secara umum.

Lakukan benchmark workload yang representatif pada perangkat sebenarnya. Perbedaan pengendali flash, filesystem, bridge USB, dan workload lebih menentukan daripada urutan mode persistensi secara universal.

## Konfigurasi ZRAM

Zram menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menyerap lebih banyak halaman tidak aktif namun tidak menciptakan RAM fisik; workload yang tidak dapat dikompresi tetap mengonsumsi memori.
Algoritma kompresi menukar throughput dan penggunaan CPU dengan rasio kompresi, dan ketersediaannya tergantung pada kernel. Mulai dengan pengaturan default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk workload yang sudah diukur; lihat [Parameter Boot](/reference/Boot-Parameters) untuk nilai yang diterima.

## Filesystem dan Perangkat Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang tinggi mempercepat penyalinan modul besar, sedangkan latensi I/O acak yang rendah lebih penting untuk workload desktop yang persisten.
  Ukur perangkat dan enclosure secara bersamaan; generasi USB saja tidak menjamin performa flash atau SSD.
- **Pilihan filesystem:** Filesystem Linux native dapat menggunakan persistensi native tanpa beban kontainer. Filesystem lintas platform meningkatkan portabilitas namun membutuhkan backend kontainer yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan filesystem. Pilih berdasarkan kebutuhan portabilitas dan pemulihan serta hasil benchmark.
