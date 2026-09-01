---
updated: 2026-08-26
---

# dd

`dd` adalah utilitas command-line serbaguna untuk menyalin data secara bit-per-bit antara file dan perangkat. Paling sering digunakan untuk menulis image ISO ke USB drive, membuat cadangan, dan pemulihan data.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk detail persyaratan sistem dan ukuran drive.

## Persiapan

1. Identifikasi USB drive Anda:
   - **Linux:** `lsblk` atau `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Unmount drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Membuat USB Drive Bootable

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
- `/dev/sdX` - USB drive Anda (misal: `/dev/sdb`)

## Hasil dan persistensi

`dd` melakukan penulisan image secara mentah: menyalin tata letak ISO ke seluruh perangkat target. Proses ini tidak membuat partisi ext4 di ruang yang tidak terpakai, tidak membuat sesi persistensi, maupun melakukan deployment Penginstal MiniOS.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap membutuhkan media penyimpanan yang dapat ditulis. Lihat [Mode Boot](/using-minios/Boot-Modes) dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang disimpan.
