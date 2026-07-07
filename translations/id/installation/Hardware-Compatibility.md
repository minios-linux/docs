# Panduan Kompatibilitas Perangkat Keras

Panduan ini memberikan informasi penting tentang kompatibilitas perangkat keras untuk MiniOS. Sistem ini berbasis Debian 13 "Trixie" dengan kernel Linux Long-Term Support (LTS), memastikan dukungan perangkat keras yang luas.

## Persyaratan Sistem

MiniOS dibuat untuk arsitektur **amd64** (64-bit). Persyaratan berbeda tergantung pada edisinya:

**Untuk Varian Standar:**
- **CPU:** Prosesor 64-bit 1 GHz
- **RAM:** Minimal 1 GB (2 GB direkomendasikan)
- **Penyimpanan:** 2 GB untuk menjalankan sistem (4 GB+ direkomendasikan untuk penyimpanan data)
- **Grafis:** Adapter display yang kompatibel dengan VGA

**Untuk Varian Toolbox:**
- **CPU:** Prosesor 64-bit 1.2 GHz
- **RAM:** Minimal 2 GB (4 GB direkomendasikan)
- **Penyimpanan:** 2 GB untuk menjalankan sistem (8 GB+ direkomendasikan untuk penyimpanan data)
- **Grafis:** Kartu grafis dengan dukungan akselerasi perangkat keras

**Untuk Varian Ultra:**
- **CPU:** Prosesor dual-core 64-bit 1.5 GHz
- **RAM:** Minimal 4 GB (8 GB direkomendasikan)
- **Penyimpanan:** 2 GB untuk menjalankan sistem (8 GB+ direkomendasikan untuk penyimpanan data)
- **Grafis:** GPU modern dengan dukungan akselerasi perangkat keras

## Kompatibilitas Komponen

### Prosesor

Beragam prosesor x86 64-bit dari Intel (Core i3/i5/i7/i9) dan AMD (Ryzen 3/5/7/9) didukung.

### Grafis

- **Intel:** Grafis terintegrasi (UHD, Iris Xe, Arc) didukung dengan baik.
- **NVIDIA:** Driver open-source Nouveau sudah termasuk. Untuk kartu grafis modern, disarankan menginstal driver proprietary untuk performa terbaik.
- **AMD:** Kartu grafis Radeon RX seri terbaru sepenuhnya didukung oleh driver open-source AMDGPU.

### Jaringan

- **Ethernet:** Sebagian besar controller kabel dari Intel, Realtek, dan Broadcom langsung dapat digunakan.
- **Wi-Fi:** Beragam adapter Wi-Fi didukung melalui firmware yang sudah termasuk dan driver DKMS yang dibangun otomatis, terutama model umum dari Intel, Atheros, dan Realtek.

### Penyimpanan

MiniOS dirancang untuk boot dari berbagai perangkat penyimpanan. Skrip startup sistem akan memindai semua perangkat blok yang tersedia secara otomatis, sehingga kompatibel dengan:

- **USB Drive:** Semua generasi USB didukung.
- **SATA/IDE Drive:** Semua hard disk internal dan SSD standar.
- **NVMe Drive:** Dukungan penuh untuk SSD NVMe modern.
- **SD/MMC Card:** Didukung jika pembaca kartu dikenali oleh kernel.

### Virtualisasi

MiniOS sepenuhnya dioptimalkan untuk digunakan sebagai sistem operasi tamu di semua lingkungan virtualisasi utama. Proses build sudah menyertakan semua driver yang diperlukan dalam ramdisk awal (`initrd`) untuk memastikan performa maksimal secara langsung.

- **Driver Performa Tinggi:** Dukungan untuk controller penyimpanan paravirtualisasi sudah terintegrasi, termasuk **VirtIO** (KVM/QEMU), **VMware Paravirtual SCSI**, dan **Hyper-V Storvsc**. Hal ini memungkinkan performa I/O disk yang mendekati native.
- **Kompatibilitas Luas:** Sistem juga dapat boot dari controller **IDE** dan **SATA** yang diemulasi, memastikan kompatibilitas dengan konfigurasi hypervisor apa pun.
- **Guest Tools:** Untuk integrasi yang lebih baik (seperti mouse seamless, berbagi clipboard, dan resolusi dinamis), varian `toolbox` dan `ultra` sudah menyertakan `open-vm-tools` (untuk VMware) dan `hyperv-daemons` (untuk Hyper-V).

Untuk petunjuk setup detail dan konfigurasi spesifik platform, lihat [Panduan Virtualisasi](/administration/Virtualization.md).
