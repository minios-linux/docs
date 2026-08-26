# Metode instalasi asli (Windows/Linux, legacy)

Metode instalasi MiniOS legacy ini melibatkan penyalinan file sistem secara langsung ke drive dan pemasangan bootloader. Disarankan menggunakan metode terbaru dari [Installing MiniOS](/installation/Installing-MiniOS.md) kecuali jika tata letak berbasis file memang diperlukan.

**Catatan:** Metode ini hanya berfungsi di Windows dan Linux karena menggunakan bootloader SYSLINUX.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data. Selalu periksa ulang drive yang dipilih dan lakukan backup data penting.

## Persyaratan drive

### Ukuran drive

Lihat [Panduan kompatibilitas perangkat keras](/installation/Hardware-Compatibility.md#system-requirements) untuk detail persyaratan sistem dan ukuran drive.

### Persyaratan teknis

- **Sistem file**: FAT32, NTFS, ext2/3/4, Btrfs
- **Skema partisi**: MBR
- **Booting EFI**: Saat menggunakan sistem file NTFS, exFAT, atau ext2/3/4, mode booting EFI mungkin tidak tersedia. Untuk dukungan EFI, disarankan menggunakan FAT32.

## Membuat USB drive bootable

### Langkah 1: Siapkan drive

**Windows:**
1. Buka "Disk Management" (`Win+R`, lalu `diskmgmt.msc`)
2. Temukan USB drive, klik kanan, lalu pilih "Delete Volume"
3. Klik kanan pada ruang yang belum teralokasi dan pilih "New Simple Volume"
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

### Langkah 2: Ekstrak dan salin file

**Mounting ISO:**

*Windows:*
- Klik kanan file ISO dan pilih "Mount"

*Linux:*
```bash
sudo mkdir /mnt/minios-iso
sudo mount -o loop MiniOS.iso /mnt/minios-iso
```

**Menyalin File:**
1. **Cari folder `/minios/`** di ISO yang sudah dimount
2. **Salin seluruh folder `/minios/`** ke root USB drive

### Langkah 3: Instal bootloader

Arahkan ke folder `/minios/boot/syslinux/` di drive dan jalankan installer:

**Windows:**
- Jalankan `bootinst.bat` **sebagai administrator**

**Linux:**
```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS,MODEL
TARGET_MOUNT="/media/$USER/MINIOS"
cd "$TARGET_MOUNT/minios/boot/syslinux"
chmod +x bootinst.sh
sudo ./bootinst.sh
```

Ganti `MINIOS` dengan direktori mount yang sudah diverifikasi menggunakan `lsblk`. Jangan gunakan wildcard: skrip akan menentukan disk target dari lokasi skrip itu sendiri dan menulis kode boot ke disk tersebut.

## Persistensi perubahan otomatis

Pada boot pertama, MiniOS akan memeriksa tipe sistem file drive dan mencoba menggunakan mode persistensi perubahan yang optimal:

- **ext2/3/4, Btrfs**: mencoba menggunakan mode `native` (penyimpanan langsung)
- **FAT32/NTFS**: menggunakan mode `dynfilefs` (file dinamis)
- Jika mode native tidak tersedia, otomatis beralih ke dynfilefs

### Konfigurasi parameter untuk pengguna tingkat lanjut

Jika diperlukan konfigurasi persistensi yang lebih presisi, parameter boot dapat digunakan:

- `perchmode=native` - Penyimpanan langsung ke partisi (untuk ext4)
- `perchmode=dynfilefs` - File yang dapat diperluas secara dinamis
- `perchmode=raw` - File dengan ukuran tetap
- `perchsize=8000` - Ukuran ruang penyimpanan data dalam MB

Detail selengkapnya di [parameter boot](/configuration/Boot-Parameters.md).
