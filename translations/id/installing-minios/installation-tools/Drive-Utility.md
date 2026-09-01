---
updated: 2026-08-26
program_commits:
    driveutility: 4887bc27be38cf996333af8cd969149a7136bfa6
---

# Utilitas Disk

Utilitas Disk adalah alat grafis untuk menulis citra ISO MiniOS ke drive USB.

**Instalasi:** Tersedia secara default di MiniOS, untuk distribusi lain lihat https://github.com/minios-linux/driveutility

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive (untuk penulisan MiniOS)

Lihat [Panduan Kompatibilitas Perangkat Keras](/getting-started/Hardware-Compatibility) untuk persyaratan sistem dan ukuran drive secara detail.

### Filesystem yang Didukung

- **FAT32**: kompatibilitas maksimal
- **NTFS**: kompatibel dengan Windows
- **EXT4**: direkomendasikan untuk Linux

## Meluncurkan Utilitas Disk

**Melalui menu aplikasi:**
1. Buka menu → Sistem → "Utilitas Disk"

**Melalui terminal:**
```bash
driveutility
```

## Membuat USB Drive Bootable

1. **Pilih mode "Write"** di jendela utama program
2. **Pilih file ISO MiniOS:**
   - Klik tombol "Browse" di sebelah kolom "Source"
   - Temukan dan pilih file MiniOS.iso yang sudah diunduh
3. **Pilih drive tujuan:**
   - Pilih USB drive Anda dari daftar perangkat
   - Pastikan pilihan berdasarkan ukuran dan model
4. **Mulai penulisan:**
   - Klik tombol "Write"
   - Konfirmasi operasi - semua data di drive akan dihapus
5. **Tunggu hingga selesai** - proses ini akan memakan waktu beberapa menit

## Hasil dan persistensi

Mode tulis melakukan penulisan citra mentah: ini menyalin tata letak ISO ke seluruh perangkat target. Mode ini tidak membuat partisi ext4 di ruang yang tidak terpakai, tidak membuat sesi persistensi, maupun melakukan deployment Penginstal MiniOS. Pilihan sistem berkas di atas berlaku untuk operasi Utilitas Disk yang memformat sistem berkas, bukan untuk tata letak partisi yang disalin oleh penulisan ISO.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan media penyimpanan yang dapat ditulis. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang tersimpan.
