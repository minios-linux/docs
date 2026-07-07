# Menggunakan Perintah `dd`

`dd` adalah utilitas baris perintah serbaguna untuk menyalin data secara bit-per-bit antara file dan perangkat. Paling sering digunakan untuk menulis file ISO ke flashdisk USB, membuat cadangan, dan pemulihan data.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan backup data penting Anda.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

## Persiapan

1. Identifikasi flashdisk USB Anda:
   - **Linux:** `lsblk` atau `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Lepaskan mount drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Membuat USB Bootable

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Ganti:**
- `MiniOS.iso` - path ke file ISO Anda
- `/dev/sdX` - flashdisk USB Anda (misal: `/dev/sdb`)

## Persistensi Perubahan Otomatis

Pada boot pertama, MiniOS akan memeriksa tipe filesystem drive dan memilih mode persistensi perubahan yang optimal. Jika ruang kosong tersedia, sistem akan otomatis membuat partisi ext4 untuk performa maksimal.

### Konfigurasi Parameter (untuk pengguna tingkat lanjut)

Untuk konfigurasi persistensi yang lebih presisi, parameter boot dapat digunakan:

- `perchmode=native` - Penyimpanan langsung ke partisi (default, tercepat)
- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis
- `perchmode=raw` - File dengan ukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB untuk file image

Detail di [parameter boot](/configuration/Boot-Parameters.md).
