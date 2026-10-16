---
updated: 2026-08-31
---

# Instalasi manual berbasis file

Metode instalasi MiniOS ini menyalin file sistem ke sistem file biasa dan menginstal bootloader di sana, alih-alih menulis ISO blok demi blok.
Ruang yang tersisa di sistem file tetap tersedia untuk file biasa, sehingga perangkat dapat terus digunakan sebagai drive USB biasa sekaligus perangkat boot MiniOS.

Metode ini sangat berguna jika Anda ingin mengakses file MiniOS secara langsung, menyimpan data biasa di partisi yang sama, atau menggunakan tata letak yang dapat ditulis untuk sesi persisten. Metode ini menggunakan bootloader SYSLINUX dan ditujukan untuk Windows dan Linux.

## Penting

**Peringatan:** Prosedur ini mempartisi ulang dan memformat perangkat yang dipilih. Prosedur ini akan menghapus seluruh isi perangkat, bukan hanya file yang saat ini terlihat di dalamnya. Cadangkan data penting dan pastikan jalur perangkat, model, kapasitas, partisi, serta titik kait yang dipilih sudah benar sebelum menjalankan `fdisk`, `mkfs`, atau `bootinst`. Jika memungkinkan, lepaskan drive lepasan lainnya.

## Persyaratan drive

### Ukuran drive

Lihat [Panduan kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) untuk mengetahui persyaratan sistem dan ukuran drive secara terperinci.

### Persyaratan teknis

- **Sistem file**: FAT32, NTFS, ext2/3/4, Btrfs
- **Skema partisi**: MBR
- **Boot EFI**: Saat menggunakan sistem file NTFS, exFAT, atau ext2/3/4, boot dalam mode EFI mungkin tidak tersedia. Untuk mendukung EFI, sebaiknya gunakan FAT32.

## Membuat drive USB yang dapat di-boot

### Langkah 1: Siapkan drive

**Windows:**
1. Buka "Manajemen Disk" (`Win+R`, lalu `diskmgmt.msc`)
2. Pastikan perangkat USB yang dipilih benar dengan memeriksa nomor disk, model, dan kapasitasnya. Jangan lanjutkan jika ada detail yang belum pasti.
3. Klik kanan volumenya, lalu pilih "Hapus Volume"
4. Klik kanan ruang yang belum dialokasikan, lalu pilih "Volume Sederhana Baru"
5. Pilih sistem file: FAT32 (disarankan) atau NTFS

**Linux:**

Atur `TARGET_DISK` dan `TARGET_PARTITION` hanya ke jalur yang tepat setelah mencocokkan model dan kapasitas perangkat di `lsblk`. Penulisan `fdisk` akan mengganti tabel partisi di seluruh disk target. Jalankan hanya satu perintah `mkfs` untuk sistem file yang diinginkan.

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_DISK=/dev/sdX
TARGET_PARTITION=/dev/sdX1
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"

# Create new MBR partition table
sudo fdisk "$TARGET_DISK"
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Verify the new partition, then create one filesystem
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL "$TARGET_DISK"
sudo mkfs.vfat -F 32 "$TARGET_PARTITION"  # For FAT32
# Or: sudo mkfs.ext4 "$TARGET_PARTITION"  # For ext4
```

### Langkah 2: Ekstrak dan salin file

**Memasang ISO:**

*Windows:*
- Klik kanan file ISO, lalu pilih "Pasang"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Menyalin file:**
1. **Temukan folder `/minios/`** di ISO yang telah dipasang
2. **Salin seluruh folder `/minios/`** ke direktori root drive USB

Di Linux, direktori root target pada contoh di atas adalah `/mnt/minios-target`. Pastikan `findmnt --mountpoint /mnt/minios-target` menunjukkan partisi yang tepat seperti yang dipilih pada Langkah 1 sebelum menyalin file.

### Langkah 3: Instal bootloader

Buka folder `/minios/boot/syslinux/` di drive, lalu jalankan installer:

`bootinst` menulis kode boot ke disk yang ditentukan berdasarkan lokasi installer. Baca [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting) sebelum mengubah kode boot, dan jangan jalankan installer sebelum perangkat dan titik mount-nya dipastikan.

**Windows:**
- Buka drive USB yang telah diverifikasi menggunakan huruf drive yang tepat, lalu buka `minios\boot\syslinux`, dan jalankan `bootinst.bat` **sebagai administrator**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Jangan gunakan wildcard sebagai pengganti titik mount. Skrip menentukan disk tujuan berdasarkan lokasinya sendiri dan menulis kode boot ke disk tersebut.

## Hasil dan persistensi

Prosedur ini membuat instalasi live berbasis file dengan menempatkan `minios/` tree dan bootloader pada filesystem biasa. Ini bukan penulisan ISO mentah, konfigurasi multiboot dengan file ISO, atau Penginstal MiniOS.

Filesystem yang dipilih memengaruhi backend persistensi yang dapat digunakan, tetapi tidak mengaktifkan persistensi atau menjamin sesi akan dibuat. Persistensi hanya diaktifkan jika entri boot atau baris perintah kernel memintanya, dan aktivasi tetap memerlukan penyimpanan yang dapat ditulis dan sesuai. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Persistensi initrd](/reference/boot-process/Persistence-Internals) sebelum mengandalkan perubahan yang tersimpan.
