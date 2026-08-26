---
updated: 2026-08-26
---

# Menggunakan Perintah `dd`

`dd` adalah utilitas baris perintah serbaguna untuk menyalin data secara bit-per-bit antara file dan perangkat. Paling sering digunakan untuk menulis file ISO ke flashdisk USB, membuat cadangan, dan pemulihan data.

## Penting

**Peringatan:** Pemilihan perangkat yang salah dapat menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan cadangkan data penting Anda.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md) untuk persyaratan sistem dan ukuran drive secara detail.

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

## Hasil dan persistensi

`dd` melakukan penulisan image mentah: ini menyalin tata letak ISO ke seluruh perangkat target. Proses ini tidak membuat partisi ext4 di ruang yang tidak terpakai, tidak membuat sesi persistensi, maupun melakukan deployment MiniOS Installer.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap membutuhkan media penyimpanan yang dapat ditulis. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang disimpan.
