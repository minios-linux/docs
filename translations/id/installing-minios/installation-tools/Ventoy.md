---
updated: 2026-08-26
---

# Ventoy

Ventoy adalah alat populer untuk membuat USB bootable yang memungkinkan Anda menyimpan beberapa file ISO dalam satu perangkat dan melakukan boot dari salah satunya.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

**Persyaratan Mode Boot:** Agar MiniOS dapat berjalan dengan baik di Ventoy, Anda HARUS memilih **mode GRUB2** saat booting, atau ganti nama file ISO Anda dengan akhiran `VTGRUB2` (misalnya, `minios-standard-amd64_VTGRUB2.iso`) untuk memaksa mode GRUB2 secara otomatis.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk detail persyaratan sistem dan ukuran drive.

## Instalasi Ventoy

### Metode 1: Instalasi Standar

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan penginstal Ventoy** dan pilih drive USB Anda
3. **Instal Ventoy** ke drive tersebut (semua data akan dihapus)
4. **Salin file ISO MiniOS** ke folder root drive USB

Ini akan membuat media multiboot file ISO: Ventoy menyimpan ISO sebagai file di partisi data dan menampilkannya saat boot. Ini bukan penulisan image MiniOS secara mentah atau deployment Penginstal MiniOS.

### Metode 2: Instalasi dengan Partisi Data Terpisah (Direkomendasikan)

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan installer Ventoy** dan pilih USB drive Anda
3. **Aktifkan opsi "Reserve Space"** saat instalasi untuk membuat partisi tambahan
4. **Instal Ventoy** ke drive tersebut
5. **Salin file ISO MiniOS** ke folder root USB drive
6. **Buat partisi ext4** di ruang yang disediakan dengan label `persistence`

Ini menyediakan lokasi kemungkinan untuk persistence, namun membuat partisi saja tidak otomatis mengaktifkan persistence atau membuat sesi.

## Integrasi dengan MiniOS

MiniOS sudah mendukung deteksi ISO yang disajikan oleh Ventoy. Proses deteksi sumber dan pemilihan persistence bersifat terpisah; Ventoy sendiri tidak mengaktifkan persistence MiniOS.

### Persistence

Persistence hanya diaktifkan jika entri boot atau kernel command line memintanya. Aktivasi kemudian bergantung pada lokasi yang dapat ditulis dan sesi yang dapat digunakan; instalasi Ventoy standar tidak menjamin keduanya akan dibuat secara otomatis. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Initrd persistence](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang tersimpan.

## Menggunakan MiniOS dengan Ventoy

### Booting

Setelah menginstal Ventoy dan menyalin file ISO MiniOS ke drive:

1. **Boot dari USB drive** - pilih di BIOS/UEFI
2. **Pilih MiniOS** dari daftar file ISO yang tersedia di menu Ventoy
3. **PENTING: Pilih mode GRUB2** saat diminta oleh Ventoy
4. **Tunggu hingga MiniOS selesai loading**

### **Persyaratan Mode Boot Ventoy**

**Agar MiniOS berjalan dengan baik:**
- **Mode GRUB2** - Wajib untuk operasi MiniOS yang benar

**Solusi Alternatif:**
- Tambahkan akhiran `VTGRUB2` pada nama file ISO (misal, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Ini akan memaksa Ventoy menggunakan mode GRUB2 secara otomatis tanpa konfirmasi
