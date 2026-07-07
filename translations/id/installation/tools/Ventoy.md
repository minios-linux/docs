# Menggunakan Ventoy

Ventoy adalah alat populer untuk membuat USB bootable yang memungkinkan Anda menyimpan beberapa file ISO dalam satu perangkat dan melakukan boot dari salah satunya.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa ulang drive yang dipilih dan lakukan backup data penting.

⚠️ **Persyaratan Mode Boot:** Agar MiniOS berjalan dengan baik di Ventoy, Anda HARUS memilih **mode GRUB2** saat booting, atau ganti nama file ISO Anda dengan akhiran `VTGRUB2` (misal, `minios-standard-amd64_VTGRUB2.iso`) untuk memaksa mode GRUB2 secara otomatis.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/installation/Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

## Instalasi Ventoy

### Metode 1: Instalasi Standar

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan installer Ventoy** dan pilih USB drive Anda
3. **Instal Ventoy** ke drive (semua data akan dihapus)
4. **Salin file ISO MiniOS** ke folder root USB drive

Setelah instalasi, drive siap digunakan. MiniOS akan otomatis membuat penyimpanan untuk menyimpan perubahan.

### Metode 2: Instalasi dengan Partisi Data Terpisah (Direkomendasikan)

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan installer Ventoy** dan pilih USB drive Anda  
3. **Aktifkan opsi "Reserve Space"** saat instalasi untuk membuat partisi tambahan
4. **Instal Ventoy** ke drive
5. **Salin file ISO MiniOS** ke folder root USB drive
6. **Buat partisi ext4** di ruang yang dicadangkan dengan label `persistence`

Metode ini memberikan operasi data yang lebih cepat dan kontrol penyimpanan yang lebih baik.

## Integrasi dengan MiniOS

MiniOS sudah mendukung Ventoy secara bawaan dan akan otomatis mendeteksi jika berjalan di lingkungan Ventoy. Sistem akan mengatur penyimpanan perubahan secara otomatis tanpa konfigurasi tambahan dari pengguna.

### Penyimpanan Perubahan Otomatis

MiniOS secara otomatis mendeteksi jika berjalan di lingkungan Ventoy dan mengatur penyimpanan perubahan:

- **Dengan partisi `persistence` terpisah**: Menggunakan partisi tersebut untuk penyimpanan data langsung (mode native, kecepatan maksimal)
- **Dengan instalasi standar**: Membuat file dinamis di partisi utama Ventoy (mode dynfilefs)

### Konfigurasi Parameter (untuk Pengguna Lanjutan)

Jika diperlukan konfigurasi yang lebih spesifik, parameter boot dapat digunakan:

**Untuk partisi `persistence` terpisah (semua mode tersedia):**
- `perchmode=native` - Menyimpan langsung ke partisi (paling cepat)
- `perchmode=dynfilefs` - File yang dapat berkembang secara dinamis
- `perchmode=raw` - File dengan ukuran tetap

**Untuk instalasi Ventoy standar (dua mode tersedia):**
- `perchmode=dynfilefs` - File yang dapat berkembang secara dinamis (default, hemat ruang)
- `perchmode=raw` - File dengan ukuran tetap

**Parameter umum untuk file:**
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB

Detail lebih lanjut di [parameter boot](/configuration/Boot-Parameters.md).

## Menggunakan MiniOS dengan Ventoy

### Booting

Setelah menginstal Ventoy dan menyalin file ISO MiniOS ke drive:

1. **Boot dari USB drive** - pilih di BIOS/UEFI
2. **Pilih MiniOS** dari daftar file ISO yang tersedia di menu Ventoy
3. **⚠️ PENTING: Pilih mode GRUB2** saat diminta oleh Ventoy
4. **Tunggu proses loading** - sistem akan otomatis mengatur untuk operasi

### **Persyaratan Mode Boot Ventoy**

**Agar MiniOS berjalan dengan baik:**
- **Mode GRUB2** - Diperlukan untuk operasi MiniOS yang benar

**Solusi Alternatif:**
- Tambahkan akhiran `VTGRUB2` pada nama file ISO (misal, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Ini akan memaksa Ventoy otomatis menggunakan mode GRUB2 tanpa konfirmasi
