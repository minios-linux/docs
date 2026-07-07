# Menggunakan MiniOS Installer

MiniOS Installer adalah alat grafis untuk menginstal MiniOS ke hard drive atau USB drive dengan dukungan UEFI/BIOS dan kompatibilitas berbagai filesystem.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali perangkat yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

### Filesystem yang Didukung

- **ext4** (direkomendasikan untuk Linux)
- **Btrfs** (filesystem modern dengan fitur snapshot)
- **FAT32** (kompatibilitas maksimal)
- **NTFS** (kompatibel dengan Windows)

## Membuat Instalasi

### Menjalankan MiniOS Installer

**Melalui menu aplikasi:**
1. Buka menu → Sistem → "Install MiniOS"

**Melalui terminal:**
```bash
sudo minios-installer
```

### Proses Instalasi

1. **Konfigurasi pengaturan sistem (Opsional namun disarankan):**
   - Klik tombol **"Konfigurasi MiniOS sebelum instalasi"**
   - Atur preferensi Anda:
     - Bahasa dan locale sistem
     - Zona waktu dan layout keyboard  
     - Akun pengguna dan kata sandi
     - Hostname dan layanan sistem
   - Simpan dan tutup konfigurator
   
2. **Pilih perangkat target:**
   - Pilih hard drive atau USB drive dari daftar
   - Verifikasi ukuran dan model perangkat
   
3. **Pilih filesystem:**
   - **ext4**: direkomendasikan untuk kebanyakan kasus
   - **Btrfs**: untuk pengguna tingkat lanjut
   - **FAT32**: untuk kompatibilitas maksimal
   
4. **Konfirmasi penghapusan disk:**
   - Semua data pada perangkat yang dipilih akan dihapus
   - Pastikan perangkat yang dipilih sudah benar
   
5. **Mulai instalasi:**
   - Klik tombol "Install"
   - Tunggu hingga proses selesai
   
6. **Selesai:**
   - Restart sistem
   - Lepaskan LiveUSB/LiveCD
   - **Hasil:** Sistem boot dengan pengaturan yang sudah Anda konfigurasi

## Konfigurasi Pra-Instalasi

### Keuntungan Menggunakan MiniOS Configurator Sebelum Instalasi

**Alur kerja yang direkomendasikan untuk pengguna baru:**

1. **Pengaturan sekali saja**: Konfigurasi semua preferensi sistem sebelum instalasi
2. **Siap pakai**: Sistem yang diinstal langsung boot dengan bahasa, keyboard, dan pengaturan pengguna yang benar
3. **Tanpa konfigurasi ulang**: Tidak perlu konfigurasi manual setelah boot pertama
4. **Pengalaman konsisten**: Pengaturan yang sama di semua instalasi

**Opsi konfigurasi yang tersedia:**
- **🌍 Lokalisasi**: Bahasa sistem, locale, dan zona waktu
- **⌨️ Input**: Layout keyboard dan opsi pengalihan  
- **👤 Akun**: Username, nama lengkap, kata sandi, dan grup pengguna
- **🖥️ Sistem**: Hostname, layanan yang diaktifkan/nonaktifkan
- **🔒 Keamanan**: Pengaturan kata sandi yang aman sebelum terhubung ke internet

**Alur kerja sederhana:**
- Konfigurasi preferensi Anda sebelum instalasi
- Instal MiniOS dengan pengaturan khusus Anda
- Boot ke sistem yang sudah terkonfigurasi penuh

## Persistensi Perubahan Otomatis

Setelah instalasi, MiniOS Installer membuat sistem pada perangkat yang dipilih:

- **Kompatibilitas UEFI/BIOS**: Pembuatan partisi boot yang diperlukan secara otomatis
- **Persistensi perubahan**: Dukungan penuh untuk mode persistensi MiniOS
- **Filesystem**: Mendukung ext4, Btrfs, FAT32, NTFS

### Konfigurasi Parameter (untuk pengguna tingkat lanjut)

Untuk konfigurasi persistensi yang lebih presisi, parameter boot dapat digunakan:

- `perchmode=native` - Penyimpanan langsung ke partisi (jika ada ruang kosong)
- `perchmode=dynfilefs` - File yang dapat berkembang secara dinamis
- `perchmode=raw` - File dengan ukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB

Detail ada di [parameter boot](/configuration/Boot-Parameters.md).
