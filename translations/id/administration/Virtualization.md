# Panduan Virtualisasi MiniOS

Panduan ini membahas cara menjalankan MiniOS di mesin virtual, mengoptimalkan performa, dan menggunakan MiniOS sebagai host virtualisasi. MiniOS berbasis Debian 13 "Trixie" dan sudah dilengkapi dengan driver virtualisasi serta guest tools bawaan untuk performa optimal.

## Fitur Virtualisasi Khusus MiniOS

MiniOS sudah mendukung deteksi virtualisasi dan penyesuaian resolusi otomatis secara bawaan. Sistem ini menyertakan skrip `minios-virtreschange`, yang secara otomatis mendeteksi lingkungan virtual (VirtualBox, VMware, KVM, QEMU, Xen, Hyper-V) dan menyesuaikan resolusi layar sesuai kebutuhan.

**Manajemen Resolusi Otomatis:**
- **Parameter kernel:** `virtres=LEBARxTINGGI` (contoh: `virtres=1920x1080`)
- **Nonaktifkan penyesuaian otomatis:** parameter kernel `novirtres`
- **Resolusi default:** 1280x800 (jika parameter virtres tidak ditentukan)
- **Deteksi:** Secara otomatis mendeteksi lingkungan VM dan menyesuaikan resolusi

## Menjalankan MiniOS sebagai Sistem Tamu

### Konfigurasi VM Umum

**Pengaturan yang direkomendasikan (semua platform):**
- **Memori:** Minimal 2 GB, direkomendasikan 4 GB (Edisi Standard: minimal 1 GB)
- **Prosesor:** Minimal 2 core
- **Penyimpanan:** Minimal 4 GB (8 GB direkomendasikan untuk mode persistent)
- **Tipe OS:** Linux 64-bit / Other Linux 64-bit

**Pemilihan Kontroler Disk:**
- **VMware:** Gunakan kontroler SCSI untuk performa lebih baik
- **VirtualBox:** Gunakan kontroler SATA dengan AHCI
- **QEMU/KVM:** Gunakan perangkat blok VirtIO
- **Hyper-V:** Gunakan kontroler SCSI

**Pemilihan Adapter Jaringan:**
- **VMware:** Gunakan VMXNET3 untuk performa lebih baik
- **VirtualBox:** Gunakan Intel PRO/1000 MT Desktop
- **QEMU/KVM:** Gunakan antarmuka jaringan VirtIO
- **Hyper-V:** Gunakan synthetic network adapter

### Instalasi Guest Tools

**VMware (VMware Workstation/Player):**
Pada MiniOS Toolbox dan Ultra edition, `open-vm-tools` sudah terpasang. Untuk edisi Standard:
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

**VirtualBox:**
```bash
# Insert Guest Additions CD and install
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot
```

**QEMU/KVM:**
Pada MiniOS Toolbox dan Ultra edition, `qemu-guest-agent` sudah terpasang. Untuk edisi Standard:
```bash
sudo apt install qemu-guest-agent
sudo systemctl enable qemu-guest-agent
```

**Hyper-V:**
Komponen integrasi sudah terpasang di MiniOS. Untuk fitur lanjutan:
```bash
sudo apt install linux-cloud-tools-generic linux-tools-generic
```

## Menggunakan MiniOS sebagai Host Virtualisasi

MiniOS sudah mendukung menjalankan container dan mesin virtual secara bawaan di edisi Toolbox dan Ultra. Edisi Ultra menyediakan dukungan penuh untuk Docker dan KVM/QEMU, sedangkan Toolbox hanya menyertakan tools virtualisasi.

### Dukungan Docker

**Edisi Ultra:** Docker sudah terpasang, termasuk lazydocker - antarmuka UI untuk mengelola Docker

**Edisi lain:** Docker dapat diinstal secara manual:
```bash
# Install from Debian repositories
sudo apt update
sudo apt install docker.io docker-compose

# Or install the official version
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Dukungan KVM/QEMU

**Edisi Toolbox dan Ultra:** Tools KVM sudah terpasang, termasuk virt-manager - antarmuka GUI untuk mengelola mesin virtual

**Edisi lain:** Tools virtualisasi dapat diinstal secara manual:
```bash
# Install KVM tools
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system virt-manager
```

### Dukungan VirtualBox

VirtualBox tidak tersedia di repository resmi Debian 13, namun dapat diinstal melalui paket resmi Oracle:

```bash
# Download deb-package from https://www.virtualbox.org/wiki/Linux_Downloads
# and install
sudo apt install ./virtualbox-*.deb
```

Pengguna akan otomatis ditambahkan ke grup `vboxusers` untuk mengakses fitur VirtualBox.
