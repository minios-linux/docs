# Panduan Optimasi Performa

Panduan ini memberikan teknik untuk mengoptimalkan performa MiniOS, dengan fokus pada fitur uniknya sebagai sistem live. Peningkatan performa paling signifikan dapat dicapai dengan menyesuaikan cara MiniOS memuat data dan menangani perubahan yang bersifat persisten.

## Parameter Boot untuk Performa

Cara paling efektif untuk meningkatkan performa, terutama saat dijalankan dari USB drive yang lambat, adalah dengan menggunakan parameter boot untuk mengontrol bagaimana sistem dimuat ke dalam memori. Untuk daftar lengkap parameter yang tersedia, lihat [Boot Parameters](/configuration/Boot-Parameters.md).

### Memuat Sistem ke RAM (`toram`)

Ini adalah optimasi paling penting. Parameter boot `toram` akan menyalin seluruh sistem MiniOS dari media boot ke RAM komputer Anda. Hal ini membuat sistem menjadi sangat responsif, karena tidak perlu lagi membaca data dari USB drive yang lebih lambat.

- **Penggunaan:** Tambahkan `toram` ke baris perintah kernel saat boot.
- **Persyaratan:** Anda membutuhkan RAM yang cukup untuk menampung modul inti sistem. Untuk edisi `standard`, disarankan minimal 2-3 GB RAM kosong.
- **Manfaat:** Meningkatkan waktu peluncuran aplikasi dan respons sistem secara drastis.

Terdapat dua mode untuk `toram`:

- **`toram=full` (Default):** Menyalin semua modul sistem ke RAM. Gunakan ini jika Anda memiliki banyak memori.
- **`toram=trim`:** Hanya menyalin modul penting yang didefinisikan oleh parameter boot `load` dan `noload`. Cocok untuk sistem dengan RAM terbatas.

### Memfilter Modul (`load` dan `noload`)

Untuk mengurangi penggunaan memori, Anda dapat menentukan modul mana saja yang akan dimuat. Cara ini sangat efektif bila dikombinasikan dengan `toram=trim`.

- **`load=module1,module2`:** Hanya memuat modul yang disebutkan (misal, `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Mengecualikan modul tertentu agar tidak dimuat.

Dengan cara ini, Anda dapat membuat sistem di RAM yang ramping dan sesuai kebutuhan.

## Optimasi Persistensi

Cara MiniOS menyimpan perubahan Anda (persistensi) dapat sangat mempengaruhi performa, terutama kecepatan penulisan data.

### Mode Persistensi (`perchmode`)

Parameter boot `perchmode` menentukan backend untuk penyimpanan persisten Anda. Pilihan tergantung pada perangkat penyimpanan yang digunakan:

- **`perchmode=native` (Default):** Menyimpan file langsung ke direktori di perangkat penyimpanan Anda. Ini adalah **opsi tercepat untuk SSD dan USB drive cepat** karena menghindari overhead filesystem-in-a-file.
- **`perchmode=raw`:** Menggunakan file image mentah yang sudah dialokasikan sebelumnya untuk perubahan. Performa baik, namun ukuran file tetap.
- **`perchmode=dynfilefs`:** Menggunakan file yang berkembang secara dinamis. Ini pilihan yang baik untuk **USB flash drive yang lebih lambat** karena dapat mengurangi write amplification dan memperpanjang umur drive, meski sedikit lebih lambat dibanding mode `native`.

### Mengaktifkan dan Menonaktifkan Persistensi

Secara default, MiniOS berjalan dalam mode "live" di mana semua perubahan akan dihapus saat reboot. Untuk menyimpan perubahan Anda, Anda harus mengaktifkan persistensi secara eksplisit.

- **Untuk Mengaktifkan Persistensi:** Tambahkan parameter `perch` pada baris perintah boot Anda. Ini memberi tahu MiniOS untuk mengaktifkan mekanisme persistensi.
- **Untuk Menonaktifkan Persistensi:** Cukup jangan tambahkan parameter `perch`. Jika tidak ada, sistem akan berjalan sepenuhnya dari RAM (atau perangkat boot), dan tidak ada perubahan yang akan disimpan.

## Konfigurasi ZRAM

MiniOS secara default menggunakan `zram` untuk membuat ruang swap terkompresi di dalam RAM Anda. Ini meningkatkan performa pada sistem dengan memori fisik terbatas dengan menghindari penggunaan swap file di disk yang jauh lebih lambat.

**Pengaturan ukuran otomatis:**
- **≥4GB RAM:** 2GB ZRAM
- **1-4GB RAM:** Setengah dari total RAM
- **<1GB RAM:** 512MB ZRAM

**Parameter boot:**
- **`zramsize=1024`:** Mengatur ukuran perangkat zram (misal, `zramsize=1024` untuk 1GB). Secara default, ini dikonfigurasi otomatis berdasarkan total RAM Anda.
- **`zramcomp=lz4`:** Mengatur algoritma kompresi (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` umumnya memberikan keseimbangan yang baik antara kecepatan dan rasio kompresi.
- **`nozram`:** Menonaktifkan ZRAM sepenuhnya.

Untuk sebagian besar pengguna, pengaturan default `zram` sudah optimal. Penyesuaian hanya disarankan jika Anda memiliki kebutuhan khusus dan memahami konsekuensinya.

## Filesystem dan Perangkat Penyimpanan

- **Gunakan USB Drive yang Cepat:** Faktor perangkat keras terbesar untuk performa MiniOS adalah kecepatan USB drive Anda. Menggunakan **USB 3.0 atau SSD berbasis USB yang lebih cepat** akan memberikan pengalaman jauh lebih baik dibanding USB flash drive 2.0 yang murah dan lambat.
- **Pilihan Filesystem:** Untuk partisi persistensi, menggunakan filesystem Linux standar seperti **ext4** umumnya akan memberikan performa dan keandalan terbaik.
