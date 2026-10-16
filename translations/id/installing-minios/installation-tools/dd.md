---
updated: 2026-08-26
---

# dd

`dd` adalah utilitas command-line serbaguna untuk menyalin data bit demi bit antara file dan perangkat. Umumnya digunakan untuk menulis image ISO ke drive USB, membuat cadangan, dan memulihkan data.

## Penting

**Peringatan:** Salah memilih perangkat dapat menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan cadangkan data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk mengetahui persyaratan sistem dan ukuran drive secara terperinci.

## Persiapan

1. Identifikasi drive USB Anda:
   - **Linux:** `lsblk` atau `sudo fdisk -l`
   - **macOS:** `diskutil list`

2. Lepas drive:
   - **Linux:** `sudo umount /dev/sdX*`
   - **macOS:** `sudo diskutil unmountDisk /dev/diskX`

## Membuat Drive USB Bootable

**Linux:**
```bash
sudo dd if=MiniOS.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**macOS:**
```bash
sudo dd if=MiniOS.iso of=/dev/diskX bs=4m
```

**Ganti:**
- `MiniOS.iso` - jalur ke file ISO Anda
- `/dev/sdX` - drive USB Anda (misalnya, `/dev/sdb`)

## Hasil dan persistensi

`dd` melakukan penulisan image mentah: tata letak ISO disalin ke seluruh perangkat target. Proses ini tidak membuat partisi ext4 di ruang yang tidak terpakai, membuat sesi persistensi, atau menjalankan deployment Penginstal MiniOS.

Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan tetap memerlukan penyimpanan tulis yang sesuai. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Persistensi Initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang tersimpan.
