# Menggunakan Balena Etcher

Balena Etcher adalah program lintas platform yang praktis untuk menulis image ISO ke USB drive. Cocok untuk Windows, macOS, dan Linux.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah dapat menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md#system-requirements) untuk persyaratan sistem dan ukuran drive secara detail.

## Persiapan

1. Unduh Balena Etcher dari [situs resmi](https://www.balena.io/etcher/)
2. Instal program di OS Anda
3. Hubungkan USB drive

## Membuat USB Drive Bootable

1. Jalankan Balena Etcher
2. Pilih image ISO MiniOS:
   - Klik "Flash from file"
   - Tentukan lokasi file ISO
3. Pilih USB drive tujuan:
   - Klik "Select target"
   - Periksa model dan ukuran perangkat
4. Mulai proses penulisan:
   - Klik "Flash!"
   - Tunggu hingga proses selesai (5–15 menit)

## Persistensi Perubahan Otomatis

Pada boot pertama, MiniOS akan memeriksa tipe sistem file drive dan memilih mode persistensi perubahan yang optimal. Jika ada ruang kosong, sistem akan otomatis membuat partisi ext4 untuk performa maksimal.

### Konfigurasi Parameter (untuk Pengguna Lanjutan)

Jika diperlukan konfigurasi persistensi yang lebih spesifik, parameter boot dapat digunakan:

- `perchmode=native` - Menyimpan langsung ke partisi (default, tercepat)
- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis
- `perchmode=raw` - File dengan ukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB untuk file image

Detail ada di [parameter boot](/configuration/Boot-Parameters.md).
