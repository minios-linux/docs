---
updated: 2026-08-31
---

# Metode instalasi

MiniOS adalah sistem operasi live-first. Menginstal MiniOS biasanya berarti menempatkan sistem live modularnya ke media yang dapat dilepas atau disk lain, sehingga menulis atau menyalin MiniOS ke USB drive sendiri sudah merupakan metode instalasi, bukan sekadar persiapan untuk instalasi berikutnya.

Ada dua keluarga instalasi utama:

- **Instalasi Live** mempertahankan tumpukan modul MiniOS, konfigurasi saat boot, persistensi sesi, dan alur kerja manajemen MiniOS. Penulisan image mentah, instalasi berbasis file, Ventoy, dan mode Live Penginstal MiniOS semuanya menghasilkan cara untuk menjalankan sistem live MiniOS.
- **Instalasi Native** adalah konversi opsional yang dilakukan oleh [Penginstal MiniOS](/installing-minios/MiniOS-Installer). Ini membuat desktop Debian konvensional dari image MiniOS yang dipilih, mempertahankan lingkungan desktop, identitas visual, dan aplikasi umum, sambil menghapus perangkat lunak khusus MiniOS yang hanya ada untuk arsitektur live.

## Unduh dan verifikasi ISO

Unduh ISO dari [situs resmi](https://minios.dev), halaman resmi [GitHub Releases](https://github.com/minios-linux/minios-live/releases), atau [SourceForge](https://sourceforge.net/projects/minios-linux/). Verifikasi terlebih dahulu sebelum menulisnya ke perangkat; lihat [Memverifikasi unduhan](/installing-minios/Verifying-Downloads).

## Instal MiniOS ke media yang dapat dilepas

Pilih metode berdasarkan tata letak yang Anda inginkan pada perangkat target:

| Hasil | Metode | Yang Anda dapatkan |
|---|---|---|
| Filesystem dapat ditulis normal yang juga dapat melakukan boot MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode ISO atau [instalasi manual berbasis file](/installing-minios/Manual-File-Based-Installation) | File MiniOS dan bootloader pada filesystem normal; sisa ruang tetap dapat digunakan untuk file biasa |
| Perangkat multiboot dengan dukungan persistensi MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partisi data Ventoy untuk file ISO plus dukungan sesi-persisten MiniOS |
| Instalasi modular MiniOS yang dikelola | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dalam mode **Live** | Tata letak modul MiniOS dengan opsi penyimpanan persisten yang dikonfigurasi oleh penginstal |
| Salinan blok demi blok persis dari ISO yang dipublikasikan | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility), atau [`dd`](/installing-minios/installation-tools/dd) | Tata letak blok ISO persis; sederhana dan dapat diprediksi, tetapi target tidak lagi berfungsi seperti flash drive umum |

::: danger Penulisan image mentah akan menimpa tata letak target
Mode DD Rufus, Etcher, penulisan image Utilitas Disk, dan `dd` akan menggantikan tata letak blok perangkat yang ada. Pastikan model dan kapasitas target, serta cadangkan data penting sebelum memulai. Peringatan ini tidak berlaku untuk mode ISO Rufus, Ventoy, atau instalasi berbasis file.
:::

## Boot ke sesi live

1. Restart komputer dan buka menu boot firmware-nya.
2. Pilih perangkat USB atau media bootable lainnya.
3. Mulai MiniOS dan pastikan penyimpanan, jaringan, serta perangkat input berfungsi sebagaimana mestinya.

Pengaturan firmware berbeda-beda tergantung komputer. Image MiniOS dapat boot melalui BIOS atau UEFI; target deployment Penginstal MiniOS berikutnya tidak terbatas pada MBR.

Gunakan [Mode Boot](/using-minios/Boot-Modes) sebagai panduan utama perilaku boot live. Jika saat boot awal image atau modulnya tidak ditemukan, lihat [Penemuan sistem Initrd](/reference/boot-process/System-Discovery).

## Pilih tata letak instalasi

Dari sesi live, jalankan [Penginstal MiniOS](/installing-minios/MiniOS-Installer) ketika Anda ingin sistem dipasang ke USB drive, SSD, atau hard disk lain.

- **Mode Live** mempertahankan tumpukan modul terkompresi, tata letak boot MiniOS, alat manajemen MiniOS, dan opsi persistensi sesi. Pilih ini jika Anda ingin MiniOS langsung pada disk target.
- **Mode Native** mengekspansi image yang dipilih menjadi desktop Debian yang dapat ditulis secara konvensional. Target tetap menggunakan lingkungan desktop, identitas visual, dan aplikasi umum dari edisi yang dipilih, sementara runtime live MiniOS dan perangkat lunak manajemen khusus live dihapus. Sistem yang diinstal menggunakan initramfs Debian konvensional, bootloader, paket kernel, dan alur kerja manajemen paket.

::: warning Instalasi native menggunakan model sistem yang berbeda
Arsitektur utama MiniOS adalah sistem live modular seperti dijelaskan pada [Tentang MiniOS](/getting-started/About-MiniOS). Mode native mempertahankan pengalaman desktop MiniOS yang sudah dikenal, termasuk identitas visual, lingkungan desktop, dan aplikasi umum, namun mengubah sistem menjadi instalasi Debian konvensional. Alat khusus MiniOS untuk sesi, modul, kernel modular, dan alur kerja live lainnya dihapus karena fitur tersebut tidak lagi berlaku. Pilih instalasi live jika Anda menginginkan seluruh fitur MiniOS.
:::

Persistensi live disiapkan saat boot awal; perilaku detailnya dapat dilihat di [Persistensi Initrd](/reference/boot-process/Persistence-Internals). Fitur ini tidak berlaku setelah konversi native.

Penginstal mendukung tata letak otomatis BIOS/MBR, UEFI/MBR, dan UEFI/GPT. BIOS pada GPT belum didukung oleh penginstal saat ini. Lihat [Menggunakan Penginstal MiniOS](/installing-minios/MiniOS-Installer) untuk penempatan, filesystem, persistensi, dan batasan partisi.
