---
updated: 2026-08-31
---

# Virtualisasi

MiniOS dapat dijalankan sebagai guest di VirtualBox, VMware, QEMU/KVM, dan Hyper-V.
Toolbox dan Ultra juga menyertakan software untuk menjalankan mesin virtual QEMU/KVM dari MiniOS itu sendiri.

Halaman ini mendokumentasikan perilaku virtualisasi khusus MiniOS. Untuk membuat VM biasa dan mengatur hypervisor, lihat dokumentasi hypervisor tersebut.

## Menjalankan MiniOS sebagai guest

### Konfigurasi VM yang disarankan

Untuk kompatibilitas seluas mungkin, hubungkan media boot MiniOS dan disk virtual apa pun yang akan digunakan untuk instalasi live MiniOS melalui pengontrol **IDE atau SATA**. Rekomendasi ini berlaku untuk VirtualBox, VMware, QEMU/KVM, dan Hyper-V jika pengontrol tersebut tersedia.

Pengontrol penyimpanan virtual lainnya mungkin dapat digunakan, tetapi MiniOS harus dapat mengakses sumber live-nya selama tahap initramfs, sebelum pohon modul kernel lengkap dari `01-kernel-*.sb` tersedia.

### Dukungan penyimpanan saat boot awal

MiniOS sengaja hanya menyertakan kumpulan driver penyimpanan tertentu di initramfs. Builder Dracut dan LiveKit saat ini menggunakan kebijakan yang sama:

| Antarmuka penyimpanan | Flux | Standard / Toolbox / Ultra |
|---|---|---|
| IDE / PATA / SATA | Ya | Ya |
| NVMe | Ya | Ya |
| Penyimpanan massal USB / UAS | Ya | Ya |
| Penyimpanan Hyper-V (`hv_storvsc`) | Ya | Ya |
| Blok VirtIO / SCSI | Tidak | Ya |
| VMware PVSCSI | Tidak | Ya |
| Frontend blok Xen | Tidak | Tidak |

Driver SAS/RAID umum seperti `mpt3sas`, `mptspi`, `mptsas`, `megaraid_sas`, dan `aacraid` tersedia di pohon modul kernel lengkap, tetapi tidak disertakan dalam initramfs MiniOS.

Perbedaan ini hanya berpengaruh sebelum sumber live MiniOS ditemukan dan sistem lengkap mulai berjalan. Perangkat keras yang berfungsi normal setelah boot belum tentu cocok untuk menampung sumber live itu sendiri.

Karena itu, **IDE atau SATA tetap menjadi pilihan penyimpanan VM yang disarankan**, bahkan untuk edisi yang initramfs-nya juga mendukung VirtIO atau VMware PVSCSI.

### Integrasi guest

Kernel sudah menyediakan driver perangkat keras virtual dasar yang digunakan oleh hypervisor utama. Toolbox dan Ultra menambahkan paket layanan guest untuk integrasi yang lebih erat:

| Platform | Integrasi guest yang disertakan di Toolbox / Ultra |
|---|---|
| VMware | `open-vm-tools`, `open-vm-tools-desktop` |
| QEMU/KVM | `qemu-guest-agent` |
| VirtualBox | `virtualbox-guest-utils`, `virtualbox-guest-x11` pada basis yang didukung |
| Hyper-V | `hyperv-daemons` |

Kernel Debian saat ini yang digunakan oleh amd64 MiniOS juga menyertakan driver guest VirtualBox, driver grafis/jaringan VMware, VirtIO, dan driver Hyper-V. Paket layanan guest menambahkan fitur integrasi; paket ini bukan syarat agar VM dasar dapat melakukan boot.

### Penanganan resolusi Xfce

MiniOS menyediakan `/usr/bin/minios-virtual-resolution` melalui `minios-tools` dan menjalankannya dari sesi autostart Xfce. Fitur ini mendeteksi mesin virtual yang umum dan hanya menggunakan XRandR jika guest tools aktif belum mengelola layar.

Jika tidak ada override, resolusi yang diminta adalah `1280x800`. Gunakan `virtres=WIDTHxHEIGHT` untuk meminta resolusi lain atau `novirtres` untuk menonaktifkan penyesuaian MiniOS ini.
Setelah penyesuaian berhasil, utilitas ini membuat `~/.config/minios/virtual-resolution-configured`. Dalam sesi persisten, penyesuaian otomatis tidak akan diterapkan lagi sampai penanda tersebut dihapus.

## Menggunakan MiniOS sebagai host virtualisasi

Toolbox dan Ultra menyertakan stack QEMU/KVM untuk menjalankan mesin virtual lokal:

- `qemu-system-x86`;
- `qemu-utils`;
- `libvirt-daemon-system`;
- `virt-manager`.

Ultra juga menyertakan stack Docker dan `lazydocker` untuk beban kerja container.

Dokumentasi ini tidak membahas cara memasang produk virtualisasi yang tidak disertakan dalam suatu edisi.

## Lihat juga

- [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility)
- [Pengenalan sistem Initrd](/reference/boot-process/System-Discovery)
- [Parameter boot](/reference/Boot-Parameters)
- [Paket dan edisi](/reference/Package-and-Edition-Contents)
