---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher adalah program lintas platform yang praktis untuk menulis image ISO ke USB drive. Cocok untuk Windows, macOS, dan Linux.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk persyaratan sistem dan ukuran drive secara detail.

## Persiapan

1. Unduh Balena Etcher dari [situs resmi](https://www.balena.io/etcher/)
2. Instal program pada sistem operasi Anda
3. Hubungkan USB drive

## Membuat USB Bootable

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

## Hasil dan persistensi

Etcher melakukan penulisan image secara mentah: ia menyalin tata letak ISO ke seluruh perangkat target. Etcher tidak membuat partisi ext4 di ruang yang tidak terpakai, tidak membuat sesi persistensi, maupun melakukan deployment Penginstal MiniOS.

Persistensi hanya diaktifkan jika ada entri boot atau baris perintah kernel yang memintanya, dan tetap membutuhkan media penyimpanan yang dapat ditulis dengan benar. Lihat [Mode Boot](/using-minios/Boot-Modes) dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang disimpan.
