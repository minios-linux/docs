---
updated: 2026-10-15
---

# Kompatibilitas perangkat keras

MiniOS dirancang agar dapat dijalankan di berbagai komputer x86, bukan hanya pada satu mesin tertentu. Karena itu, cara paling andal untuk menguji kompatibilitas adalah mem-boot image MiniOS secara langsung di perangkat keras yang akan digunakan, lalu memeriksa perangkat yang ingin Anda pakai.

Dukungan perangkat keras bergantung pada image yang dipilih: arsitektur, distribusi dasar, kernel, firmware, driver, desktop, dan edisinya berpengaruh. Image MiniOS yang lebih baru atau berbeda mungkin mendukung perangkat keras yang tidak didukung image lama.

## Arsitektur

MiniOS mendukung sistem x86 64-bit dan 32-bit:

| Arsitektur image | Penggunaan |
|---|---|
| **amd64** | Komputer x86 64-bit |
| **i386** | Komputer x86 32-bit yang didukung |

Gunakan arsitektur yang tercantum pada nama image dan deskripsi rilis. Ketersediaan image 32-bit bergantung pada rilis MiniOS dan distribusi dasarnya.

## Firmware dan proses boot

Image PC MiniOS dapat di-boot melalui BIOS lama maupun UEFI jika image yang dipilih menyertakan file boot yang diperlukan. Implementasi firmware sangat beragam, sehingga perangkat USB yang sama dapat ditampilkan secara berbeda di menu boot pada komputer yang berbeda.

Secure Boot bergantung pada keseluruhan rantai kernel dan EFI image, bukan hanya arsitekturnya. Build Debian/Ubuntu amd64 yang menggunakan kernel distribusi bertanda tangan dan komponen EFI yang sesuai dapat mendukung Secure Boot. Kernel kustom atau kernel tanpa tanda tangan yang disediakan oleh MiniOS tidak otomatis tepercaya hanya karena file EFI bertanda tangan tersedia. DynBlk dan driver AUFS-NG eksternal tidak bertanda tangan: Secure Boot menonaktifkan sesi DynBlk/VMDK dan biasanya hanya menyisakan OverlayFS untuk komposisi modul.

Image i386 saat ini menggunakan kernel yang dibangun oleh MiniOS ketika basis yang dipilih tidak lagi menyediakan kernel 32-bit yang sesuai. Kernel MiniOS adalah build terpisah dengan integrasi MiniOS, bukan jaminan bahwa binernya identik byte demi byte dengan Debian, dan bukan bagian dari rantai tanda tangan Debian. **Image i386 ini tidak mendukung Secure Boot.** Bitness firmware merupakan pertimbangan kompatibilitas boot yang terpisah.

## Memori

Kebutuhan memori bergantung pada rilis, desktop, aplikasi, dan jenis sesi yang digunakan. Flux umumnya membutuhkan lebih sedikit memori daripada edisi XFCE lengkap; browser, suite perkantoran, mesin virtual, atau snapshot persistensi berukuran besar dapat membutuhkan jauh lebih banyak daripada desktop saja. Ikuti persyaratan yang tercantum untuk rilis tersebut dan uji beban kerja yang akan digunakan, alih-alih menganggap angka RAM lama yang berlaku untuk semua edisi sudah cukup untuk setiap image saat ini.

**Jalankan dari RAM** membutuhkan memori tambahan karena data MiniOS disalin ke RAM bersama sistem dan aplikasi yang sedang berjalan. Karena itu, image yang lebih besar membutuhkan jauh lebih banyak memori dalam mode ini.

Lihat [Mode boot](/using-minios/Boot-Modes) sebelum menggunakan **Jalankan dari RAM** di komputer dengan memori terbatas.

## Grafis

Image amd64 MiniOS saat ini menggunakan stack grafis Debian dengan Xorg dan Mesa.
Bergantung pada kernel yang dipilih, modulnya mencakup `i915` dan `xe`, `amdgpu` dan `radeon`, serta `nouveau` untuk perangkat keras NVIDIA open source.

Xorg menyertakan driver generik `modesetting` beserta driver Intel, AMD/ATI, Radeon, Nouveau, VESA, dan framebuffer. Mesa menyediakan stack akselerasi 3D standar yang digunakan oleh Intel, AMD, dan driver open source yang didukung.

Image MiniOS berbasis Debian meminta koleksi firmware Debian beserta paket khusus vendor, termasuk `firmware-intel-graphics` pada Trixie dan Excalibur. Firmware yang benar-benar terpasang bergantung pada ketersediaan repositori dan image yang telah dibuat. Image berbasis Ubuntu menggunakan `linux-firmware` sebagai gantinya.

Daftar paket MiniOS yang dipelihara tidak mencakup driver kernel NVIDIA proprietari. Karena itu, perangkat keras NVIDIA secara default menggunakan driver `nouveau` yang disertakan. Perangkat keras atau fitur yang secara khusus memerlukan driver proprietari NVIDIA perlu menambahkannya secara terpisah.

Grafis virtual juga didukung oleh driver kernel dan Xorg untuk perangkat VMware, QXL, Bochs, dan Hyper-V yang umum.

### Penskalaan dan pengelolaan jendela XFCE

Image XFCE Debian 13 dan Devuan Excalibur menggunakan pengaturan dan paket desktop yang disesuaikan untuk MiniOS, tasklist MiniOS dan plugin Show Desktop, serta `xfwm4-gl` sebagai pengganti `xfwm4`. Display Settings menyediakan penskalaan antarmuka otomatis atau pilihan manual 100–200% dengan kelipatan 25%, disertai pratinjau berjangka waktu dan pemulihan. Teks, kontrol, dekorasi, dan kursor bertema mengikuti penskalaan antarmuka; skala piksel output dan resolusi monitor tetap menjadi pengaturan terpisah. Pilihan manual yang tersimpan akan menggantikan pengaturan otomatis.

`xfwm4-gl` secara default menggunakan OpenGL dengan XRender sebagai opsi cadangan. Window Manager Tweaks mengatur blur, animasi, pengecualian komposisi layar penuh, dan tampilan Alt+Tab. Thumbnail Alt+Tab dan taskbar dapat meredupkan atau menyembunyikan jendela lain untuk Peek tanpa mengaktifkan jendela yang dipratinjau; gambar jendela yang diminimalkan dari cache digunakan jika tersedia. Efek fade/scaling dan Peek berfungsi pada kedua renderer, sedangkan blur dan Magic Lamp memerlukan OpenGL. Suite lain tetap menggunakan komponen XFCE dari distribusinya.

### Paket MateBook E opsional

Dukungan Huawei MateBook E 2023 tersedia melalui paket Linux 6.12 yang dapat dipasang secara terpisah; jangan menganggap paket ini sudah disertakan dalam image rilis. `matebook-e-dsi-dkms` menyediakan backport eksperimental untuk layar internal: sisa pita berwarna dan fitur suspend/resume yang belum tervalidasi masih menjadi keterbatasan. Integrasi kamera menggunakan `matebook-e-cameras-dkms` serta paket userspace amd64/systemd `matebook-e-cameras`. Paket kamera tidak memasang driver pena eksperimental.

## Perangkat keras jaringan

Image amd64 MiniOS saat ini menggunakan kernel Debian dengan kumpulan driver jaringan standar. Kernel 6.12 yang digunakan image Trixie saat ini mencakup driver untuk perangkat keras Ethernet dan Wi-Fi umum dari Intel, Realtek, Broadcom, Atheros, MediaTek, Ralink, Marvell, dan lainnya.

Driver Ethernet umum mencakup Intel `e1000`, `e1000e`, `igb`, `igc`, `i40e`, `ice`, dan `ixgbe`; Realtek `8139` dan `r8169`; Broadcom `tg3`, `bnx2`, `bnx2x`, dan `bnxt`; Atheros `atl*` dan `alx`; Marvell `sky2`; serta driver Ethernet USB umum seperti ASIX, `r8152`, CDC Ethernet/NCM, dan RNDIS.

Dukungan Wi-Fi mencakup Intel `iwlwifi`; Atheros `ath5k`, `ath9k`, `ath10k`, `ath11k`, dan `ath12k`; Broadcom `brcmfmac`, `brcmsmac`, dan `b43`; MediaTek `mt76`; Ralink `rt2x00`; Realtek `rtl8xxxu`, `rtlwifi`, `rtw88`, dan `rtw89`; serta sejumlah driver lama dari Marvell, Intersil, ZyDAS, dan lainnya.

MiniOS juga menambahkan modul DKMS untuk perangkat keras yang kurang didukung oleh kernel bawaan. Kumpulan modul amd64 saat ini mencakup driver Wi-Fi USB Realtek tambahan untuk RTL8188EU, RTL8814AU, RTL8811/RTL8821AU, dan adaptor RTL88xxAU terkait, serta `wl` Broadcom STA.

Kumpulan firmware mencakup paket firmware Debian untuk perangkat keras jaringan umum dari Intel, Atheros, Realtek, MediaTek, Broadcom, Marvell/Libertas, Cavium, dan lainnya.
Ketersediaan persisnya tetap bergantung pada rilis MiniOS, arsitektur, dan kernel yang dipilih.

Untuk jaringan biasa setelah boot, MiniOS menggunakan NetworkManager. Jika adaptor sama sekali tidak terdeteksi, mengubah pengaturan NetworkManager tidak akan menyediakan driver kernel atau firmware yang tidak tersedia. Lihat [Konfigurasi jaringan](/using-minios/Networking) untuk penggunaan jaringan biasa.

## Penyimpanan

Untuk boot MiniOS langsung, pengontrol penyimpanan berperan dua kali: firmware harus dapat memulai bootloader, lalu initramfs MiniOS harus dapat mendeteksi perangkat yang berisi `minios/` pohon data.

MiniOS hanya menyertakan driver penyimpanan tertentu di initramfs-nya.
Builder saat ini selalu menyertakan dukungan IDE/PATA/SATA, NVMe, SD/MMC, USB mass storage/UAS, dan penyimpanan Hyper-V. Standard, Toolbox, dan Ultra juga menambahkan dukungan VirtIO block/SCSI dan VMware PVSCSI ke initramfs; Flux tidak.

Pohon modul kernel lengkap berisi driver penyimpanan tambahan yang tidak tersedia selama tahap awal penemuan sumber MiniOS. Jika menu boot muncul, tetapi MiniOS tidak dapat menemukan modulnya, lihat [Penemuan sistem initrd](/reference/boot-process/System-Discovery).

## Mesin virtual

MiniOS mendukung perangkat keras virtual umum yang digunakan oleh VirtualBox, VMware, QEMU/KVM, dan Hyper-V. Untuk media boot dan disk tujuan instalasi, sebaiknya gunakan pengontrol **IDE atau SATA** jika tersedia di hypervisor. Pengontrol ini memberikan perilaku yang paling konsisten selama boot awal dan instalasi.

Kernel Debian 6.12 saat ini sudah menyertakan driver perangkat keras utama untuk guest:

| Hypervisor | Driver yang disertakan dalam kernel |
|---|---|
| **VirtualBox** | `vboxguest`, `vboxsf`, `vboxvideo` |
| **VMware** | `vmwgfx`, `vmxnet3` |
| **QEMU/KVM** | Driver VirtIO untuk block, jaringan, grafis, input, balloon, SCSI, suara, dan lainnya |
| **Hyper-V** | `hv_vmbus`, `hv_storvsc`, `hv_netvsc`, `hv_balloon`, `hv_utils`, `hyperv_drm`, dan dukungan input Hyper-V |

Driver kernel ini cukup untuk menjalankan guest secara dasar. Layanan guest tambahan menyediakan integrasi dengan host, seperti penyesuaian tampilan otomatis, shutdown yang tertib, berbagi sistem berkas, serta komunikasi antara host dan guest.

Toolbox dan Ultra menyertakan `open-vm-tools` dan `open-vm-tools-desktop` untuk VMware, `qemu-guest-agent` untuk QEMU/KVM, dan `hyperv-daemons` untuk Hyper-V. Pada suite yang didukung, termasuk image Trixie terkini, keduanya juga menyertakan `virtualbox-guest-utils` dan `virtualbox-guest-x11`. Flux dan Standard tidak menyertakan paket layanan guest ini secara default.

Lihat [Virtualisasi](/maintenance-and-recovery/Virtualization) dan [Paket dan edisi](/reference/Package-and-Edition-Contents) untuk mengetahui perangkat lunak khusus edisi.

## Uji komputer sebelum mengandalkannya

1. Boot image MiniOS yang benar-benar akan Anda gunakan.
2. Gunakan mode **Mulai MiniOS** default untuk pengujian biasa, atau **Mulai tanpa menyimpan** jika Anda memang tidak ingin membuka atau membuat sesi persisten.
3. Periksa grafis, keyboard dan perangkat penunjuk, suara, jaringan kabel dan nirkabel, perangkat penyimpanan yang Anda perlukan, serta fungsi suspend/resume jika ingin menggunakannya.
4. Jika Anda berencana menggunakan persistensi, buat perubahan kecil untuk pengujian, reboot, lalu pastikan sesi yang diharapkan telah diaktifkan dan perubahan tersebut tetap tersimpan.
5. Andalkan komputer tersebut untuk pekerjaan penting atau lakukan operasi disk yang menghapus data hanya setelah itu.

Jika terjadi kegagalan, tentukan terlebih dahulu apakah masalah muncul sebelum menu boot, selama penemuan sumber MiniOS, atau setelah sistem operasi dimulai.
Pembedaan ini biasanya membantu menentukan apakah yang perlu diperiksa adalah firmware, initramfs, atau dukungan perangkat keras Linux biasa.
