---
updated: 2026-08-31
---

# Virtualisasi

MiniOS dapat dijalankan sebagai guest di VirtualBox, VMware, QEMU/KVM, dan Hyper-V.
Toolbox dan Ultra juga menyertakan perangkat lunak untuk menjalankan mesin virtual QEMU/KVM langsung dari MiniOS itu sendiri.

Halaman ini mendokumentasikan perilaku virtualisasi khusus MiniOS. Untuk pembuatan VM biasa dan pengaturan hypervisor, gunakan dokumentasi dari hypervisor yang bersangkutan.

## Menjalankan MiniOS sebagai guest

### Tata letak VM yang direkomendasikan

Untuk kompatibilitas paling luas, pasang media boot MiniOS dan disk virtual apa pun yang akan berisi instalasi live MiniOS melalui **IDE atau SATA controller**. Rekomendasi ini berlaku untuk VirtualBox, VMware, QEMU/KVM, dan Hyper-V selama controller tersebut tersedia.

Controller penyimpanan virtual lain bisa digunakan, namun MiniOS harus dapat mengakses sumber live-nya selama tahap initramfs, sebelum seluruh pohon modul kernel dari `01-kernel-*.sb` tersedia.

### Dukungan penyimpanan saat boot awal

MiniOS secara sengaja hanya membawa sejumlah driver penyimpanan tertentu di dalam initramfs. Builder Dracut dan LiveKit saat ini menggunakan kebijakan yang sama:

| Antarmuka penyimpanan | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Ya | Ya |
| NVMe | Ya | Ya |
| USB mass storage / UAS | Ya | Ya |
| Hyper-V storage (`hv_storvsc`) | Ya | Ya |
| VirtIO block / SCSI | Tidak | Ya |
| VMware PVSCSI | Tidak | Ya |
| Xen block frontend | Tidak | Tidak |

Driver SAS/RAID umum seperti `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas`, dan `aacraid` tersedia di seluruh pohon modul kernel, tetapi tidak termasuk dalam initramfs MiniOS.

Perbedaan ini hanya penting sebelum sumber live MiniOS ditemukan dan sistem penuh dijalankan. Perangkat keras yang berfungsi normal setelah boot belum tentu cocok untuk menyimpan sumber live itu sendiri.

Karena alasan ini, **IDE atau SATA tetap menjadi pilihan penyimpanan VM yang direkomendasikan**, bahkan untuk edisi yang initramfs-nya juga berisi dukungan VirtIO atau VMware PVSCSI.

### Integrasi guest

Kernel sudah menyediakan driver perangkat keras virtual dasar yang digunakan oleh hypervisor utama. Toolbox dan Ultra menambahkan paket guest-service untuk integrasi yang lebih erat:

| Platform | Integrasi guest yang disertakan di Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` pada basis yang didukung |
| Hyper-V | `hyperv-daemons` |

Kernel Debian saat ini yang digunakan oleh amd64 MiniOS juga sudah berisi driver guest VirtualBox, driver grafis/jaringan VMware, VirtIO, dan Hyper-V. Paket layanan guest menambahkan fitur integrasi; mereka bukanlah yang membuat VM dasar dapat boot.

### Penanganan resolusi Xfce

MiniOS menyediakan `/usr/bin/minios-virtual-resolution` hingga `minios-tools` dan menjalankannya dari sesi autostart Xfce. Utilitas ini mendeteksi mesin virtual umum dan hanya menggunakan XRandR jika guest tools aktif belum mengelola tampilan.

Tanpa override, resolusi yang diminta adalah `1280x800`. Gunakan `virtres=WIDTHxHEIGHT` untuk meminta resolusi lain atau `novirtres` untuk menonaktifkan penyesuaian MiniOS ini.
Setelah penyesuaian berhasil, utilitas akan membuat `~/.config/minios/virtual-resolution-configured`. Dalam sesi persisten, penyesuaian otomatis tidak akan diterapkan lagi hingga marker tersebut dihapus.

## Menggunakan MiniOS sebagai host virtualisasi

Toolbox dan Ultra menyertakan stack QEMU/KVM untuk menjalankan mesin virtual lokal:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra juga menyertakan stack Docker dan `lazydocker` untuk workload container.

Dokumentasi ini tidak membahas instalasi produk virtualisasi yang tidak termasuk dalam sebuah edisi.

## Lihat juga

- [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility)
- [Penemuan sistem initrd](/reference/boot-process/System-Discovery)
- [Parameter boot](/reference/Boot-Parameters)
- [Paket dan edisi](/reference/Package-and-Edition-Contents)
