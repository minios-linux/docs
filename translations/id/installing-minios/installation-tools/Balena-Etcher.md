---
updated: 2026-08-26
---

# Balena Etcher

Balena Etcher adalah program lintas platform yang praktis untuk menulis image ISO ke drive USB. Cocok untuk Windows, macOS, dan Linux.

## Penting

**Peringatan:** Salah memilih perangkat dapat menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan cadangkan data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/getting-started/Hardware-Compatibility) untuk mengetahui persyaratan sistem dan ukuran drive secara terperinci.

## Persiapan

1. Unduh Balena Etcher dari [situs web resmi](https://www.balena.io/etcher/)
2. Instal program di OS Anda
3. Sambungkan drive USB

## Membuat Drive USB Bootable

1. Jalankan Balena Etcher
2. Pilih image ISO MiniOS:
   - Klik "Flash from file"
   - Tentukan lokasi file ISO
3. Pilih drive USB tujuan:
   - Klik "Select target"
   - Periksa model dan kapasitas perangkat
4. Mulai menulis:
   - Klik "Flash!"
   - Tunggu hingga proses selesai (5–15 menit)

## Hasil dan persistensi

Etcher menulis image mentah: tata letak ISO disalin ke seluruh perangkat tujuan. Etcher tidak membuat partisi ext4 di ruang yang tidak terpakai, membuat sesi persistensi, atau melakukan deployment Penginstal MiniOS.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan media penyimpanan yang dapat ditulisi. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang tersimpan.
