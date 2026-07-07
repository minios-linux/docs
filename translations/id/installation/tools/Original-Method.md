# Metode Instalasi Asli (Windows/Linux)

Metode instalasi MiniOS yang asli melibatkan penyalinan file sistem langsung ke drive dan pemasangan bootloader. Metode ini memberikan fleksibilitas konfigurasi maksimal dan kompatibilitas dengan berbagai jenis media.

⚠️ **Catatan**: Metode ini hanya berfungsi di Windows dan Linux karena menggunakan bootloader SYSLINUX.

## Penting

⚠️ **Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Perangkat Keras](/installation/Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

### Persyaratan Teknis

- **Sistem file**: FAT32, NTFS, ext2/3/4, Btrfs
- **Skema partisi**: MBR
- ⚠️ **Booting EFI**: Saat menggunakan sistem file NTFS, exFAT, atau ext2/3/4, mode booting EFI mungkin tidak tersedia. Untuk dukungan EFI, disarankan menggunakan FAT32.

## Membuat USB Drive Bootable

### Langkah 1: Siapkan Drive

**Windows:**
1. Buka "Disk Management" (`Win+R` → `diskmgmt.msc`)
2. Temukan USB drive → klik kanan → "Delete Volume"
3. Klik kanan pada ruang yang belum teralokasi → "New Simple Volume"
4. Pilih sistem file: FAT32 (disarankan) atau NTFS

**Linux:**
```bash
# Identify the device
lsblk

# Create new MBR partition table
sudo fdisk /dev/sdX
# In fdisk: o (new table), n (new partition), p (primary), a (bootable), w (write)

# Create file system
sudo mkfs.vfat -F 32 /dev/sdX1  # For FAT32
sudo mkfs.ext4 /dev/sdX1         # For ext4
```

### Langkah 2: Ekstrak dan Salin File

**Mounting ISO:**

*Windows:*
- Klik kanan file ISO → "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Menyalin File:**
1. **Cari folder `/minios/`** di ISO yang telah di-mount
2. **Salin seluruh folder `/minios/`** ke root USB drive

### Langkah 3: Instal Bootloader

Arahkan ke folder `/minios/boot/` di drive dan jalankan installer:

**Windows:**
- Jalankan `bootinst.bat` **sebagai administrator**

**Linux:**
```bash
cd /media/$USER/*/minios/boot/
chmod +x bootinst.sh
sudo ./bootinst.sh
```

## Persistensi Perubahan Otomatis

Pada boot pertama, MiniOS akan memeriksa tipe sistem file drive dan mencoba menggunakan mode persistensi perubahan yang optimal:

- **ext2/3/4, Btrfs**: mencoba menggunakan mode `native` (penyimpanan langsung)
- **FAT32/NTFS**: menggunakan mode `dynfilefs` (file dinamis)
- Jika mode native tidak tersedia, akan otomatis beralih ke dynfilefs

### Konfigurasi Parameter (untuk Pengguna Lanjutan)

Jika diperlukan konfigurasi persistensi yang lebih spesifik, parameter boot dapat digunakan:

- `perchmode=native` - Penyimpanan langsung ke partisi (untuk ext4)
- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis
- `perchmode=raw` - File dengan ukuran tetap  
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB

Detail ada di [parameter boot](/configuration/Boot-Parameters.md).
