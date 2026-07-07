# Menggunakan Drive Utility

Drive Utility adalah alat grafis untuk menulis image ISO MiniOS ke USB drive.

**Instalasi:** Tersedia secara default di MiniOS, untuk distribusi lain lihat https://github.com/minios-linux/driveutility

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive (untuk penulisan MiniOS)

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

### Filesystem yang Didukung

- **FAT32**: kompatibilitas maksimal
- **NTFS**: kompatibel dengan Windows  
- **EXT4**: direkomendasikan untuk Linux

## Menjalankan Drive Utility

**Melalui menu aplikasi:**
1. Buka menu → Sistem → "Drive Utility"

**Melalui terminal:**
```bash
driveutility
```

## Membuat USB Drive Bootable

1. **Pilih mode "Write"** di jendela utama program
2. **Pilih file ISO MiniOS:**
   - Klik tombol "Browse" di sebelah kolom "Source"
   - Temukan dan pilih file MiniOS.iso yang telah diunduh
3. **Pilih drive tujuan:**
   - Pilih USB drive Anda dari daftar perangkat
   - Verifikasi pilihan berdasarkan ukuran dan model
4. **Mulai penulisan:**
   - Klik tombol "Write"
   - Konfirmasi operasi - semua data di drive akan dihapus
5. **Tunggu hingga selesai** - proses memerlukan beberapa menit

## Persistensi Perubahan Otomatis

Saat menulis MiniOS melalui Drive Utility, salinan persis dari image ISO akan dibuat. MiniOS akan secara otomatis mendeteksi metode penulisan dan mengatur persistensi perubahan saat boot pertama.

### Konfigurasi Parameter (untuk pengguna tingkat lanjut)

Untuk konfigurasi persistensi yang lebih presisi, parameter boot dapat digunakan:

- `perchmode=native` - Penyimpanan langsung ke partisi (jika ada ruang kosong)
- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis
- `perchmode=raw` - File dengan ukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan untuk data dalam MB

Detail di [parameter boot](/configuration/Boot-Parameters.md).
