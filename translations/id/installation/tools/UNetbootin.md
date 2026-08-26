# Menggunakan UNetbootin

UNetbootin adalah utilitas open-source lintas platform yang memungkinkan Anda membuat USB bootable untuk berbagai distribusi Linux, termasuk MiniOS.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/installation/Hardware-Compatibility.md) untuk persyaratan sistem dan ukuran drive secara detail.

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

## Hasil dan persistensi

UNetbootin mengekstrak file dan menginstal file boot pada filesystem yang dipilih, membuat media live berbasis file alih-alih melakukan penulisan image mentah atau deployment MiniOS Installer. Penggunaannya tidak menjamin format FAT32, dukungan EFI, atau persistensi.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan media penyimpanan yang dapat ditulis dengan sesuai. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang disimpan.
