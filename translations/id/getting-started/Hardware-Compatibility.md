---
updated: 2026-08-31
---

# Kompatibilitas perangkat keras

MiniOS dirancang untuk berjalan di berbagai komputer x86, bukan hanya terikat pada satu mesin saja. Pengujian kompatibilitas yang paling andal adalah dengan melakukan boot langsung menggunakan image MiniOS pada perangkat keras target dan memeriksa perangkat yang ingin Anda gunakan.

Dukungan perangkat keras tergantung pada image yang dipilih: arsitektur, distribusi dasar, kernel, firmware, driver, desktop, dan edisi semuanya berpengaruh. Image MiniOS yang lebih baru atau berbeda dapat mendukung perangkat keras yang tidak didukung oleh versi lama.

## Arsitektur

MiniOS mendukung sistem x86 64-bit dan 32-bit:

| Arsitektur image | Gunakan untuk |
|---|---|
| **amd64** | Komputer x86 64-bit |
| **i386** | Komputer x86 32-bit yang didukung |

Gunakan arsitektur yang tertera pada nama image dan deskripsi rilis. Ketersediaan image 32-bit tergantung pada rilis MiniOS dan distribusi dasarnya.

## Firmware dan boot

Image PC MiniOS dapat melakukan boot melalui legacy BIOS maupun UEFI selama file boot yang dibutuhkan tersedia pada image yang dipilih. Implementasi firmware sangat bervariasi, sehingga perangkat USB yang sama bisa muncul berbeda di menu boot pada komputer yang berbeda.

Image MiniOS 64-bit saat ini menggunakan kernel Debian dan komponen EFI Debian.
Karena itu, mendukung **Secure Boot** pada sistem amd64.

Image i386 32-bit menggunakan kernel yang dibangun oleh MiniOS karena Debian tidak lagi merilis paket kernel 32-bit. Kernel ini tetap identik dengan kernel Debian yang bersangkutan, namun dibangun oleh MiniOS dan bukan bagian dari rantai boot signed milik Debian. Oleh karena itu, **Secure Boot tidak didukung oleh image i386 MiniOS**.

## Memori

Rekomendasi minimum memori tergantung pada edisi:

| Edisi | Minimum RAM yang direkomendasikan |
|---|---:|
| **Flux** | 512 MB |
| **Standard** | 756 MB |
| **Toolbox** | 756 MB |
| **Ultra** | 756 MB |

Nilai-nilai ini untuk penggunaan normal dari media boot. Aplikasi tertentu mungkin membutuhkan memori lebih besar.

**Jalankan dari RAM** membutuhkan memori tambahan karena data MiniOS disalin ke dalam RAM bersamaan dengan sistem dan aplikasi yang sedang berjalan. Image yang lebih besar membutuhkan memori yang jauh lebih banyak dalam mode ini.

Lihat [Mode Boot](/using-minios/Boot-Modes) sebelum menggunakan **Jalankan dari RAM** pada komputer dengan memori terbatas.

## Grafis

Image MiniOS amd64 saat ini menggunakan stack grafis Debian dengan Xorg dan Mesa.
Kernel sudah mencakup driver Intel `i915` dan `xe`, AMD `amdgpu` dan `radeon`, serta driver open-source NVIDIA `nouveau`.

Xorg menyertakan driver generik `modesetting` bersama dengan driver Intel, AMD/ATI, Radeon, Nouveau, VESA, dan framebuffer. Mesa menyediakan stack akselerasi 3D standar yang digunakan oleh Intel, AMD, dan driver open-source yang didukung.

Image MiniOS berbasis Debian menginstal koleksi firmware Debian bersama paket firmware khusus vendor. Image Trixie Standard saat ini menyertakan `firmware-amd-graphics` dan `firmware-misc-nonfree`; image berbasis Ubuntu menggunakan `linux-firmware` sebagai gantinya.

Daftar paket MiniOS yang dipelihara tidak mencakup driver kernel NVIDIA proprietary. Karena itu, perangkat keras NVIDIA menggunakan driver `nouveau` yang sudah disertakan secara default. Perangkat keras atau fitur yang secara khusus membutuhkan driver proprietary NVIDIA harus ditambahkan secara terpisah.

Grafis virtual juga didukung oleh driver kernel dan Xorg untuk perangkat VMware, QXL, Bochs, dan Hyper-V yang umum.

## Perangkat keras jaringan

Image MiniOS amd64 saat ini menggunakan kernel Debian dengan set driver jaringan standar. Kernel 6.12 yang digunakan pada image Trixie saat ini sudah mencakup driver untuk perangkat Ethernet dan Wi-Fi Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell, dan lainnya yang umum.

Driver Ethernet yang umum meliputi Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, dan `ixgbe`; Realtek `8139` dan `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x`, dan `bnxt`; Atheros `atl*` dan `alx`; Marvell `sky2`; serta driver USB Ethernet umum seperti ASIX, `r8152`, CDC Ethernet/NCM, dan RNDIS.

Dukungan Wi-Fi meliputi Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, dan `ath12k`; Broadcom `brcmfmac`, `brcmsmac`, dan `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, dan `rtw89`; serta beberapa driver Marvell, Intersil, ZyDAS, dan lainnya yang lebih lama.

MiniOS juga menambahkan modul DKMS untuk perangkat keras yang belum tercakup dengan baik oleh kernel standar. Set modul amd64 saat ini mencakup driver Wi-Fi USB Realtek tambahan untuk RTL8188EU, RTL8814AU, RTL8811/RTL8821AU dan adapter RTL88xxAU terkait, serta driver Broadcom STA `wl`.

Set firmware mencakup paket firmware Debian untuk perangkat jaringan Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium, dan perangkat jaringan umum lainnya.
Ketersediaan yang tepat tetap tergantung pada rilis MiniOS, arsitektur, dan kernel yang dipilih.

Untuk jaringan biasa setelah boot, MiniOS menggunakan NetworkManager. Jika sebuah adapter tidak terdeteksi sama sekali, mengubah pengaturan NetworkManager tidak akan menyediakan driver kernel atau firmware yang hilang. Lihat [Konfigurasi jaringan](/using-minios/Networking) untuk penggunaan jaringan normal.

## Penyimpanan

Untuk boot live MiniOS, pengendali penyimpanan menjadi penting dua kali: firmware harus bisa memulai bootloader, dan initramfs MiniOS harus bisa mendeteksi perangkat yang berisi pohon data `minios/`.

MiniOS secara sengaja hanya menyertakan driver penyimpanan tertentu di initramfs-nya.
Builder saat ini selalu menyertakan dukungan IDE/PATA/SATA, NVMe, SD/MMC, USB mass storage/UAS, dan penyimpanan Hyper-V. Edisi Standard, Toolbox, dan Ultra juga menambahkan dukungan VirtIO block/SCSI dan VMware PVSCSI ke initramfs; Flux tidak.

Pohon modul kernel penuh berisi driver penyimpanan tambahan yang tidak tersedia saat penemuan sumber MiniOS awal. Jika menu boot muncul tetapi MiniOS tidak dapat menemukan modulnya, lihat [Penemuan sistem initrd](/reference/boot-process/System-Discovery).

## Mesin virtual

MiniOS mendukung perangkat keras virtual umum yang digunakan oleh VirtualBox, VMware, QEMU/KVM, dan Hyper-V. Untuk media boot dan disk target instalasi, sebaiknya gunakan **kontroler IDE atau SATA** jika tersedia di hypervisor. Kontroler ini memberikan perilaku paling stabil selama proses boot awal dan instalasi.

Kernel Debian 6.12 saat ini sudah mencakup driver perangkat guest utama:

| Hypervisor | Driver yang sudah ada di kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | VirtIO block, network, graphics, input, balloon, SCSI, sound, dan driver terkait |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`, dan dukungan input Hyper-V |

Driver kernel ini sudah cukup untuk operasi guest dasar. Layanan guest tambahan menyediakan integrasi host seperti pengaturan tampilan otomatis, shutdown bersih, berbagi filesystem, dan komunikasi host/guest.

Toolbox dan Ultra menyertakan `open-vm-tools` dan `open-vm-tools-desktop` untuk VMware, `qemu-guest-agent` untuk QEMU/KVM, dan `hyperv-daemons` untuk Hyper-V. Pada suite yang didukung, termasuk image Trixie saat ini, juga disertakan `virtualbox-guest-utils` dan `virtualbox-guest-x11`. Flux dan Standard tidak menyertakan paket layanan guest ini secara default.

Lihat [Virtualisasi](/maintenance-and-recovery/Virtualization) dan [Paket dan edisi](/reference/Package-and-Edition-Contents) untuk perangkat lunak khusus edisi.

## Uji komputer sebelum mengandalkannya

1. Boot image MiniOS yang persis akan Anda gunakan.
2. Gunakan mode default **Mulai MiniOS** untuk pengujian normal, atau **Mulai tanpa menyimpan** jika Anda memang tidak ingin membuka atau membuat sesi persisten.
3. Periksa grafis, keyboard dan perangkat penunjuk, suara, jaringan kabel dan nirkabel, perangkat penyimpanan yang Anda butuhkan, serta suspend/resume jika akan digunakan.
4. Jika Anda ingin menggunakan persistensi, lakukan perubahan kecil sebagai uji coba, reboot, dan pastikan sesi yang diharapkan aktif serta perubahan tetap tersimpan.
5. Hanya setelah itu, andalkan mesin untuk pekerjaan penting atau lakukan operasi disk yang bersifat destruktif.

Jika ada yang gagal, tentukan terlebih dahulu apakah masalah terjadi sebelum menu boot, saat penemuan sumber MiniOS, atau setelah sistem operasi berjalan.
Pembedaan ini biasanya membantu menentukan apakah Anda perlu memeriksa firmware, initramfs, atau dukungan perangkat keras Linux biasa.
