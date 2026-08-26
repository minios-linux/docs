# Menggunakan Rufus (Windows)

Rufus adalah utilitas populer untuk Windows yang membantu memformat dan membuat USB drive bootable.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md) untuk persyaratan sistem dan ukuran drive secara detail.

## Instalasi Rufus

1. **Unduh Rufus** dari [situs resmi](https://rufus.ie/)
2. **Jalankan programnya** - Rufus tidak memerlukan instalasi, ini adalah aplikasi portabel

## Membuat USB Drive Bootable

Rufus menawarkan dua metode untuk menulis MiniOS ke USB drive:

### Metode 1: DD Mode (Direkomendasikan)

1. **Jalankan Rufus** sebagai administrator
2. **Pilih USB drive** pada kolom "Device"
3. **Pilih file ISO MiniOS**:
   - Klik tombol "SELECT"
   - Cari dan pilih file ISO MiniOS yang sudah diunduh
4. **Pilih mode penulisan**:
   - Pada dialog "Hybrid ISO image detected", pilih **"Write in DD Image mode"**
5. **Mulai proses**: Klik tombol "START"
6. **Konfirmasi tindakan** - semua data di drive akan dihapus
7. **Tunggu hingga proses penulisan selesai**

### Metode 2: ISO Mode (Alternatif)

1. **Jalankan Rufus** sebagai administrator
2. **Pilih USB drive** pada kolom "Device"
3. **Pilih file ISO MiniOS**:
   - Klik tombol "SELECT"
   - Cari dan pilih file ISO MiniOS yang sudah diunduh
4. **Pilih mode penulisan**:
   - Pada dialog "Hybrid ISO image detected", pilih **"Write in ISO Image mode"**
5. **Konfigurasi pengaturan**:
   - **File system**: FAT32 (disarankan) atau NTFS
   - ⚠️ **Jika memilih NTFS**: Booting mode EFI mungkin tidak tersedia
6. **Mulai proses**: Klik tombol "START"
7. **Konfirmasi format** - semua data di drive akan dihapus

## Hasil dan persistensi

Mode DD melakukan penulisan image mentah dan menyalin tata letak ISO ke seluruh perangkat target. Mode ISO memformat filesystem dan mengekstrak isi ISO untuk membuat media live berbasis file. Kedua mode tersebut bukan deployment MiniOS Installer, dan Rufus tidak secara otomatis membuat partisi ext4 atau sesi persistensi.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan media penyimpanan yang dapat ditulis. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang disimpan.
