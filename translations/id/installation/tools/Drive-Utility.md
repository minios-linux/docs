# Menggunakan Drive Utility

Drive Utility adalah alat grafis untuk menulis image ISO MiniOS ke USB drive.

**Instalasi:** Tersedia secara default di MiniOS, untuk distribusi lain lihat https://github.com/minios-linux/driveutility

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive (untuk penulisan MiniOS)

Lihat [Panduan Kompatibilitas Hardware](/installation/Hardware-Compatibility.md) untuk persyaratan sistem dan ukuran drive secara detail.

### Sistem Berkas yang Didukung

- **FAT32**: kompatibilitas maksimum
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

## Hasil dan persistensi

Mode tulis melakukan penulisan image secara mentah: menyalin tata letak ISO ke seluruh perangkat target. Mode ini tidak membuat partisi ext4 di ruang yang tidak terpakai, tidak membuat sesi persistensi, maupun melakukan deployment Installer MiniOS. Pilihan filesystem di atas hanya berlaku untuk operasi Drive Utility yang memformat filesystem, bukan untuk tata letak partisi yang disalin oleh penulisan ISO.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan media penyimpanan yang dapat ditulis. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang disimpan.
