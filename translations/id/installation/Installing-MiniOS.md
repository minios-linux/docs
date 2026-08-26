---
updated: 2026-08-26
---

# Instalasi MiniOS

Ada dua tugas terpisah yang sering disebut instalasi:

- Menulis ISO ke media yang dapat dilepas akan membuat media bootable yang digunakan untuk memulai sesi live MiniOS. Alat penulis image akan menimpa perangkat yang dipilih dengan tata letak ISO.
- Menjalankan [MiniOS Installer](/installation/MiniOS-Installer.md) dari sesi live akan menerapkan MiniOS ke disk lain. Proses ini dapat membuat instalasi live modular atau instalasi Linux native konvensional.

## Unduh dan verifikasi ISO

Unduh ISO dari [situs resmi](https://minios.dev) atau [halaman GitHub Releases resmi](https://github.com/minios-linux/minios-live/releases). Verifikasi file tersebut sebelum menuliskannya ke perangkat; lihat [Memverifikasi unduhan](/installation/Verifying-Downloads.md).

## Tulis media bootable

Pilih metode sesuai sistem operasi Anda:

- [Rufus](/installation/tools/Rufus.md) di Windows
- [Ventoy](/installation/tools/Ventoy.md) di Windows atau Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) di Windows, Linux, atau macOS
- [`dd`](/installation/tools/dd.md) di Linux atau macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) di Linux
- [UNetbootin](/installation/tools/UNetbootin.md) di Windows, Linux, atau macOS
- [Instalasi USB berbasis file](/installation/tools/File-Based-USB-Installation.md) untuk tata letak MiniOS yang disiapkan manual

Menulis image dengan Rufus, Etcher, `dd`, atau Drive Utility bersifat destruktif. Pastikan jalur perangkat, model, dan kapasitas sudah benar sebelum memulai. Penulisan image mentah akan menyalin tata letak image; proses ini tidak secara otomatis mengatur persistensi atau melakukan deployment live maupun native dengan MiniOS Installer.

Ventoy berbeda: instal Ventoy di perangkat, lalu salin file ISO ke partisi data Ventoy. Ini akan mempertahankan tata letak multiboot Ventoy.

## Boot sesi live

1. Restart komputer dan buka menu boot firmware-nya.
2. Pilih perangkat USB atau media bootable lainnya.
3. Jalankan MiniOS dan pastikan perangkat penyimpanan, jaringan, serta input berfungsi sebagaimana mestinya.

Pengaturan firmware berbeda-beda tergantung komputer. Image MiniOS dapat boot melalui BIOS atau UEFI; target deployment MiniOS Installer selanjutnya tidak terbatas pada MBR.

Gunakan [Boot modes](/configuration/Boot-Modes.md) sebagai panduan utama perilaku boot live. Jika pada proses boot awal image atau modulnya tidak ditemukan, lihat [Initrd system discovery](/configuration/Initrd-System-Discovery.md).

## Pilih layout terinstal

Dari sesi live, jalankan [MiniOS Installer](/installation/MiniOS-Installer.md) jika Anda ingin menginstal MiniOS ke USB drive lain, SSD, atau hard disk.

- Mode Live mempertahankan stack modul terkompresi dan layout boot live. Mendukung opsi persistensi sesi dan cocok untuk instalasi portabel.
- Mode Native mengekstrak modul yang dipilih ke filesystem root Linux konvensional, menghasilkan initramfs, dan menginstal bootloader yang didukung. Mode Native hanya tersedia jika image yang diboot menyediakan metadata installer yang diperlukan.

Persistensi live dipersiapkan saat boot awal; perilaku detailnya dijelaskan di [Initrd persistence](/configuration/Initrd-Persistence.md). Fitur ini tidak berlaku untuk filesystem root konvensional yang digunakan pada mode native.

Installer mendukung layout otomatis BIOS/MBR, UEFI/MBR, dan UEFI/GPT. BIOS pada GPT tidak didukung oleh installer saat ini. Lihat [Using MiniOS Installer](/installation/MiniOS-Installer.md) untuk informasi tentang penempatan, filesystem, persistensi, dan batasan partisi.
