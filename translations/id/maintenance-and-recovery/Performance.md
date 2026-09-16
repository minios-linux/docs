---
updated: 2026-09-16
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

- **`native`:** Menyimpan layer yang dapat ditulis langsung sebagai file biasa. Overhead kontainer paling rendah dan tidak ada ukuran kontainer tetap, namun membutuhkan filesystem pendukung yang dapat mempertahankan metadata Linux serta operasi yang dibutuhkan MiniOS.
- **`raw`:** Menggunakan satu image ext4 dengan kapasitas tetap. Panjang file diatur sesuai kapasitas yang diminta dan pertumbuhan dilakukan secara eksplisit, sehingga sederhana dan mudah diprediksi, namun tidak memiliki perilaku kapasitas dinamis seperti backend dinamis. FAT32 membatasi ukuran image tunggal hingga 4000 MiB.
- **`dynfilefs`:** Backend FUSE/format-400 memperluas penyimpanan payload sesuai kebutuhan dan mendukung media yang biasanya tidak cocok. Indeksnya tidak sparse: setiap blok logis 4 KiB membutuhkan satu offset 8-byte, sehingga kapasitas logis memerlukan sekitar 2 MiB RAM dan sekitar 2 MiB penyimpanan indeks pendukung per GiB meskipun payload kosong. Hal ini membuat kapasitas sedang menjadi efisien, tetapi kapasitas tipis yang besar menjadi mahal di awal.
- **`dynblk`:** Backend blok kernel format-1 menghadirkan perangkat blok normal sementara kapasitas tipis `volumeNNN.db` pendukung bertambah sesuai kebutuhan. Pemetaan runtime bersifat sparse dan mengalokasikan satu chunk 4 KiB untuk 128 blok logis, sehingga data yang dipetakan padat memerlukan sekitar 8 MiB RAM per GiB, tetapi kapasitas virtual yang belum dialokasikan tidak menggunakan chunk pemetaan. Indeks pohon internal tetap hanya 396.312 byte per perangkat yang terpasang dan penghitung referensi halaman bersifat sparse. Driver, bukan MiniOS, yang memilih anggaran pemetaan default sekitar 25% dari RAM yang dapat digunakan, dibatasi hingga 4096 MiB. Ini menguntungkan kapasitas sparse yang besar; volume yang terisi penuh dapat menggunakan lebih banyak RAM per GiB dibandingkan DynFileFS.
- **`squashfs`:** Menyimpan snapshot terkompresi dan membangun ulang layer atas yang dapat ditulis di RAM setiap kali boot. Ini meminimalkan penyimpanan persisten untuk sesi yang sebagian besar stabil, namun membutuhkan biaya CPU dan RAM saat proses restore serta menulis ulang snapshot saat menyimpan.

LUKS2 dapat membungkus Raw, DynFileFS, atau DynBlk. Enkripsi menambah overhead saat membuka dan proses kriptografi, namun tetap mempertahankan kapasitas dan perilaku penyimpanan backend yang digunakan.

Lakukan benchmark pada beban kerja yang representatif langsung di perangkat yang digunakan. Perbedaan pada controller flash, filesystem, USB bridge, enkripsi, kompresi, dan jenis beban kerja lebih berpengaruh dibandingkan peringkat universal mode persistensi.

## Konfigurasi ZRAM

Zram menukar waktu CPU dengan kapasitas memori terkompresi dan dapat menghindari swap berbasis penyimpanan yang jauh lebih lambat. Perangkat zram yang lebih besar dapat menyerap lebih banyak halaman tidak aktif namun tidak menciptakan RAM fisik; workload yang tidak dapat dikompresi tetap mengonsumsi memori.
Algoritma kompresi menukar throughput dan penggunaan CPU dengan rasio kompresi, dan ketersediaannya tergantung pada kernel. Mulai dengan pengaturan default dan ubah `zramsize`, `zramcomp`, atau `nozram` hanya untuk workload yang sudah diukur; lihat [Parameter Boot](/reference/Boot-Parameters) untuk nilai yang diterima.

## Filesystem dan Perangkat Penyimpanan

- **Pilihan perangkat:** Throughput sekuensial yang tinggi mempercepat penyalinan modul besar, sedangkan latensi I/O acak yang rendah lebih penting untuk workload desktop yang persisten.
  Ukur perangkat dan enclosure secara bersamaan; generasi USB saja tidak menjamin performa flash atau SSD.
- **Pilihan filesystem:** Filesystem Linux native dapat menggunakan persistensi native tanpa beban kontainer. Filesystem lintas platform meningkatkan portabilitas namun membutuhkan backend kontainer yang kompatibel untuk metadata Linux, sehingga menambah lapisan pemetaan dan filesystem. Pilih berdasarkan kebutuhan portabilitas dan pemulihan serta hasil benchmark.
