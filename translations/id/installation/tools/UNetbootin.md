# Menggunakan UNetbootin

UNetbootin adalah utilitas open-source lintas platform yang memungkinkan Anda membuat USB bootable untuk berbagai distribusi Linux, termasuk MiniOS.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/installation/Hardware-Compatibility.md#system-requirements) untuk persyaratan sistem dan ukuran drive secara detail.

## Instalasi UNetbootin

1. **Unduh UNetbootin** dari [situs resmi](https://unetbootin.github.io/)
2. **Instal program** di sistem Anda:
   - **Windows**: Jalankan installer sebagai administrator
   - **Linux**: Instal dari repository atau gunakan AppImage
   - **macOS**: Seret aplikasi ke folder Applications

## Membuat USB Bootable

1. **Jalankan UNetbootin** sebagai administrator/root
2. **Pilih sumber image:**
   - Atur toggle ke "Disk image"
   - Klik tombol "..." dan pilih file ISO MiniOS
3. **Pilih perangkat target:**
   - Pada daftar "Drive", pilih USB drive Anda
   - Pastikan perangkat yang dipilih sudah benar
4. **Mulai proses:** Klik "OK"
5. **Tunggu hingga selesai** - proses ini dapat memakan waktu 10-20 menit

## Persistensi Perubahan Otomatis

UNetbootin secara otomatis memformat drive ke FAT32, sehingga MiniOS akan menggunakan mode dynfilefs untuk menyimpan perubahan. Ini memastikan kompatibilitas maksimal dengan berbagai sistem, termasuk dukungan boot EFI.

### Konfigurasi Parameter (untuk Pengguna Lanjutan)

Jika diperlukan konfigurasi yang lebih spesifik, parameter boot dapat digunakan:

- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis (default)
- `perchmode=raw` - File berukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB

Detail ada di [parameter boot](/configuration/Boot-Parameters.md).
