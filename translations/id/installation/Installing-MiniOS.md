# Menginstal MiniOS

Panduan ini menjelaskan berbagai cara untuk menginstal MiniOS pada perangkat penyimpanan.

## 1. Unduh Berkas ISO MiniOS

- Unduh berkas ISO MiniOS dari situs resmi.

## 2. Membuat Drive Bootable

Pilih salah satu metode berikut:

- [Metode Original](/installation/tools/Original-Method.md)
- [Menggunakan Rufus](/installation/tools/Rufus.md) (Windows) (Direkomendasikan)
- [Menggunakan UNetbootin](/installation/tools/UNetbootin.md) (Windows/Linux/MacOS)
- [Menggunakan Ventoy](/installation/tools/Ventoy.md) (Windows/Linux) (Direkomendasikan)
- [Menggunakan Balena Etcher](/installation/tools/Balena-Etcher.md) (Windows/Linux/MacOS) (Direkomendasikan)
- [Menggunakan `dd`](/installation/tools/dd.md) (Linux/MacOS) (Direkomendasikan)
- [Menggunakan Drive Utility](/installation/tools/Drive-Utility.md) (Linux) (Direkomendasikan)
- [Menggunakan MiniOS Installer](/installation/MiniOS-Installer.md) (Direkomendasikan, hanya untuk MiniOS)

## 3. Booting dari Drive

1.  Restart komputer Anda.
2.  Pilih drive bootable di menu boot komputer Anda untuk melakukan boot dari drive tersebut.

## 4. Catatan

- Boot installer tidak mendukung multiboot; hanya MiniOS yang dapat di-boot dari drive.
- Disk Anda harus menggunakan skema partisi `msdos` (gunakan MBR, bukan GPT).
- Drive harus diformat dengan salah satu sistem file yang didukung: FAT32, NTFS, ext2, ext3, ext4, btrfs.

---


**Pengingat:** Metode instalasi original tidak lagi menjadi rekomendasi utama karena dapat menyulitkan pengguna pemula. Saat menggunakan Balena Etcher, `dd`, atau Drive Utility, partisi untuk menyimpan perubahan akan dibuat secara otomatis.
