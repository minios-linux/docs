---
updated: 2026-08-26
---

# Instalasi USB manual berbasis file (Windows/Linux, legacy)

Metode instalasi legacy MiniOS ini melibatkan penyalinan file sistem langsung ke drive dan pemasangan bootloader. Disarankan menggunakan metode terbaru dari [Menginstal MiniOS](/installation/Installing-MiniOS.md) kecuali layout berbasis file memang dibutuhkan.

**Catatan:** Metode ini hanya berfungsi di Windows dan Linux karena menggunakan bootloader SYSLINUX.

## Penting

**Peringatan:** Prosedur ini akan mempartisi ulang dan memformat perangkat yang dipilih. Proses ini akan menghapus seluruh isi perangkat, bukan hanya file yang saat ini terlihat. Cadangkan data penting dan pastikan jalur perangkat, model, kapasitas, partisi, dan mount point sudah benar sebelum menjalankan `fdisk`, `mkfs`, atau `bootinst`. Lepaskan drive removable lain jika memungkinkan.

## Persyaratan drive

### Ukuran drive

Lihat [Panduan kompatibilitas perangkat keras](/installation/Hardware-Compatibility.md) untuk detail persyaratan sistem dan ukuran drive.

### Persyaratan teknis

- **Sistem file**: FAT32, NTFS, ext2/3/4, Btrfs
- **Skema partisi**: MBR
- **Booting EFI**: Jika menggunakan sistem file NTFS, exFAT, atau ext2/3/4, mode boot EFI mungkin tidak tersedia. Untuk dukungan EFI, disarankan menggunakan FAT32.

## Membuat USB drive bootable

### Langkah 1: Siapkan drive

**Windows:**
1. Buka "Disk Management" (`Win+R`, lalu `diskmgmt.msc`)
2. Verifikasi perangkat USB berdasarkan nomor disk, model, dan kapasitas. Jangan lanjutkan jika ada detail yang belum pasti.
3. Klik kanan pada volumenya lalu pilih "Delete Volume"
4. Klik kanan pada ruang yang belum teralokasi dan pilih "New Simple Volume"
5. Pilih sistem file: FAT32 (disarankan) atau NTFS

**Linux:**

Setel `TARGET_DISK` dan `TARGET_PARTITION` ke jalur yang tepat hanya setelah mencocokkan model dan kapasitas perangkat di `lsblk`. Penulisan `fdisk` akan mengganti tabel partisi pada seluruh disk target. Jalankan hanya satu perintah `mkfs` untuk filesystem yang diinginkan.

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

**Mounting ISO:**

*Windows:*
- Klik kanan file ISO lalu pilih "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso

TARGET_PARTITION=/dev/sdX1
sudo mkdir /mnt/minios-target
sudo mount "$TARGET_PARTITION" /mnt/minios-target
findmnt --mountpoint /mnt/minios-target
```

**Menyalin File:**
1. **Cari folder `/minios/`** di ISO yang sudah dimount
2. **Salin seluruh folder `/minios/`** ke root USB drive

Di Linux, root target pada contoh di atas adalah `/mnt/minios-target`. Pastikan `findmnt --mountpoint /mnt/minios-target` menampilkan partisi yang benar seperti yang dipilih pada Langkah 1 sebelum menyalin file.

### Langkah 3: Instal bootloader

Arahkan ke folder `/minios/boot/syslinux/` di drive dan jalankan installer:

`bootinst` akan menulis kode boot ke disk yang diambil dari lokasi installer. Baca [Pemulihan Boot](/administration/Boot-Recovery.md) sebelum mengubah kode boot, dan jangan jalankan installer sebelum perangkat dan mount point-nya terverifikasi.

**Windows:**
- Buka USB drive yang sudah diverifikasi berdasarkan drive letter yang tepat, masuk ke `minios\boot\syslinux`, dan jalankan `bootinst.bat` **sebagai administrator**.

**Linux:**
```bash
TARGET_MOUNT=/mnt/minios-target
findmnt --mountpoint "$TARGET_MOUNT"
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Jangan gunakan wildcard untuk mount point. Script akan menentukan disk target dari lokasinya sendiri dan menulis kode boot ke disk tersebut.

## Hasil dan persistensi

Prosedur ini membuat instalasi live berbasis file dengan menempatkan pohon `minios/` dan bootloader pada filesystem normal. Ini bukan penulisan ISO mentah, setup multiboot file ISO, ataupun deployment MiniOS Installer.

Filesystem yang dipilih mempengaruhi backend persistensi yang dapat digunakan, namun tidak secara otomatis mengaktifkan persistensi atau menjamin sesi akan dibuat. Persistensi hanya aktif jika entri boot atau kernel command line memintanya, dan aktivasi tetap membutuhkan media penyimpanan yang dapat ditulis. Lihat [Mode Boot](/configuration/Boot-Modes.md) dan [Persistensi Initrd](/configuration/Initrd-Persistence.md) sebelum mengandalkan perubahan yang disimpan.
