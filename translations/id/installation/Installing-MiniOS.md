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
- [Metode asli](/installation/tools/Original-Method.md) untuk tata letak MiniOS berbasis file

Menulis image dengan Rufus, Etcher, `dd`, atau Drive Utility bersifat destruktif. Pastikan jalur perangkat, model, dan kapasitas sudah benar sebelum memulai. Alat-alat ini membuat media bootable; mereka tidak melakukan deployment live atau native menggunakan MiniOS Installer.

Ventoy berbeda: instal Ventoy pada perangkat, lalu salin ISO ke partisi data Ventoy. Ini mempertahankan tata letak multiboot milik Ventoy.

## Boot ke sesi live

1. Restart komputer dan buka menu boot firmware-nya.
2. Pilih perangkat USB atau media bootable lainnya.
3. Mulai MiniOS dan pastikan penyimpanan, jaringan, serta perangkat input berfungsi sebagaimana mestinya.

Pengaturan firmware berbeda-beda tergantung komputer. Image MiniOS dapat boot melalui BIOS atau UEFI; target deployment MiniOS Installer selanjutnya tidak terbatas pada MBR.

## Pilih tata letak instalasi

Dari sesi live, jalankan [MiniOS Installer](/installation/MiniOS-Installer.md) jika Anda ingin menginstal MiniOS ke USB drive, SSD, atau hard disk lain.

- Mode live mempertahankan stack modul terkompresi dan tata letak boot live. Mendukung opsi persistensi sesi dan cocok untuk instalasi portabel.
- Mode native mengekstrak modul yang dipilih ke filesystem root Linux konvensional, menghasilkan initramfs, dan memasang bootloader yang didukung. Mode native hanya tersedia jika image yang diboot menyediakan metadata installer yang diperlukan.

Installer mendukung tata letak otomatis BIOS/MBR, UEFI/MBR, dan UEFI/GPT. BIOS pada GPT tidak didukung oleh installer saat ini. Lihat [Menggunakan MiniOS Installer](/installation/MiniOS-Installer.md) untuk informasi tentang penempatan, filesystem, persistensi, dan batasan partisi.
