---
updated: 2026-08-26
---

# Menggunakan Ventoy

Ventoy adalah alat populer untuk membuat USB bootable yang memungkinkan Anda menyimpan beberapa file ISO dalam satu perangkat dan melakukan boot dari salah satunya.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

**Persyaratan Mode Boot:** Agar MiniOS dapat berjalan dengan baik bersama Ventoy, Anda HARUS memilih **mode GRUB2** saat booting, atau mengganti nama file ISO Anda dengan akhiran `VTGRUB2` (misalnya, `minios-standard-amd64_VTGRUB2.iso`) untuk memaksa mode GRUB2 secara otomatis.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/installation/Hardware-Compatibility.md) untuk persyaratan sistem dan ukuran drive secara detail.

## Instalasi Ventoy

### Metode 1: Instalasi Standar

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan installer Ventoy** dan pilih USB drive Anda
3. **Instal Ventoy** ke drive tersebut (seluruh data akan terhapus)
4. **Salin file ISO MiniOS** ke folder root USB drive

Ini akan membuat media multiboot berbasis file ISO: Ventoy menyimpan ISO sebagai file di partisi data dan menampilkannya saat boot. Ini bukan penulisan image MiniOS secara mentah maupun deployment Installer MiniOS.

### Metode 2: Instalasi dengan Partisi Data Terpisah (Direkomendasikan)

1. **Unduh Ventoy** dari [situs resmi](https://www.ventoy.net/)
2. **Jalankan installer Ventoy** dan pilih drive USB Anda
3. **Aktifkan opsi "Reserve Space"** saat instalasi untuk membuat partisi tambahan
4. **Instal Ventoy** ke drive tersebut
5. **Salin file ISO MiniOS** ke folder root drive USB
6. **Buat partisi ext4** di ruang yang telah dicadangkan dengan label `persistence`

Ini menyediakan lokasi kemungkinan untuk persistensi, namun membuat partisi saja tidak otomatis mengaktifkan persistensi atau membuat sesi.

## Integrasi dengan MiniOS

MiniOS sudah mendukung deteksi ISO yang disajikan oleh Ventoy. Deteksi sumber dan pemilihan persistence adalah proses terpisah; Ventoy sendiri tidak mengaktifkan persistence MiniOS.

### Persistence

Persistence hanya aktif jika entri boot atau kernel command line memintanya. Aktivasi kemudian tergantung pada lokasi yang dapat ditulis dan sesi yang dapat digunakan; instalasi Ventoy standar tidak menjamin keduanya akan dibuat secara otomatis. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Initrd persistence](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang tersimpan.

## Menggunakan MiniOS dengan Ventoy

### Booting

Setelah menginstal Ventoy dan menyalin file ISO MiniOS ke drive:

1. **Boot dari USB drive** - pilih di BIOS/UEFI
2. **Pilih MiniOS** dari daftar file ISO yang tersedia di menu Ventoy
3. **PENTING: Pilih mode GRUB2** saat diminta oleh Ventoy
4. **Tunggu hingga MiniOS selesai memuat**

### **Persyaratan Mode Boot Ventoy**

**Agar MiniOS berjalan dengan baik:**
- **Mode GRUB2** - Diperlukan untuk operasi MiniOS yang benar

**Solusi Alternatif:**
- Tambahkan akhiran `VTGRUB2` pada nama file ISO (misal, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Ini akan memaksa Ventoy secara otomatis menggunakan mode GRUB2 tanpa konfirmasi
