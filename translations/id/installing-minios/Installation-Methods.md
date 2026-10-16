---
updated: 2026-10-15
---

# Metode instalasi

MiniOS adalah sistem operasi yang mengutamakan penggunaan live. Instalasi MiniOS biasanya dilakukan dengan menempatkan sistem live modularnya di media lepas-pasang atau disk lain. Karena itu, menulis atau menyalin MiniOS ke drive USB sudah termasuk metode instalasi, bukan sekadar persiapan untuk instalasi berikutnya.

Ada dua kategori utama metode instalasi:

- **Instalasi live** mempertahankan tumpukan modul MiniOS, konfigurasi saat boot, persistensi sesi, dan alur kerja pengelolaan MiniOS. Penulisan image mentah, instalasi berbasis file, Ventoy, serta mode live Penginstal MiniOS sama-sama menghasilkan cara untuk menjalankan sistem live MiniOS.
- **Instalasi native** adalah konversi opsional yang dilakukan oleh [Penginstal MiniOS](/installing-minios/MiniOS-Installer). Proses ini membuat desktop Debian konvensional dari image MiniOS yang dipilih, dengan tetap mempertahankan lingkungan desktop, identitas visual, dan aplikasi umum, sekaligus menghapus perangkat lunak khusus MiniOS yang diperlukan untuk arsitektur live.

## Unduh dan verifikasi ISO

Unduh ISO dari [situs web resmi](https://minios.dev), halaman resmi [Rilis GitHub](https://github.com/minios-linux/minios-live/releases), atau [SourceForge](https://sourceforge.net/projects/minios-linux/). Verifikasi ISO sebelum menulisnya ke perangkat; lihat [Memverifikasi unduhan](/installing-minios/Verifying-Downloads).

## Instal MiniOS ke media lepas-pasang

Pilih metode berdasarkan tata letak yang diinginkan pada perangkat tujuan:

| Hasil | Metode | Hasil yang didapat |
|---|---|---|
| Sistem file biasa yang dapat ditulis dan juga mem-boot MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode ISO atau [instalasi berbasis file manual](/installing-minios/Manual-File-Based-Installation) | file MiniOS dan bootloader pada sistem file biasa; ruang yang tersisa tetap dapat digunakan untuk file biasa |
| Perangkat multiboot dengan dukungan persistensi MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | partisi data Ventoy untuk file ISO serta dukungan sesi persisten MiniOS |
| Instalasi MiniOS modular terkelola | [Penginstal MiniOS](/installing-minios/MiniOS-Installer) dalam mode **Live** | tata letak modul MiniOS dengan penyimpanan persisten opsional yang dikonfigurasi oleh penginstal |
| Salinan ISO terbitan yang sama persis, blok demi blok | [Rufus](/installing-minios/installation-tools/Rufus) dalam mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitas Disk](/installing-minios/installation-tools/Drive-Utility), atau [`dd`](/installing-minios/installation-tools/dd) | Tata letak blok ISO yang sama persis; sederhana dan mudah diprediksi, tetapi perangkat tujuan tidak lagi berfungsi seperti flash drive serbaguna biasa |

::: danger Penulisan image mentah akan menimpa tata letak perangkat tujuan
mode DD Rufus, Etcher, penulisan image dengan Utilitas Disk, dan `dd`akan mengganti tata letak blok yang ada pada perangkat. Pastikan model dan kapasitas perangkat tujuan sudah benar, lalu cadangkan data penting sebelum memulai. Peringatan ini tidak berlaku untuk mode ISO Rufus, Ventoy, atau instalasi berbasis file.
:::

## Boot sesi live

1. Mulai ulang komputer, lalu buka menu boot firmware.
2. Pilih perangkat USB atau media lain yang dapat di-boot.
3. Jalankan MiniOS dan pastikan penyimpanan, jaringan, serta perangkat input berfungsi sebagaimana mestinya.

Pengaturan firmware berbeda-beda di setiap komputer. Image MiniOS dapat di-boot melalui BIOS atau UEFI; tujuan penerapan Penginstal MiniOS nantinya tidak terbatas pada MBR.

Gunakan [Mode boot](/using-minios/Boot-Modes) sebagai panduan utama untuk perilaku boot live. Jika proses boot awal tidak dapat menemukan image atau modulnya, lihat [Penemuan sistem Initrd](/reference/boot-process/System-Discovery).

## Pilih tata letak yang akan diinstal

Dari sesi live, mulai [Penginstal MiniOS](/installing-minios/MiniOS-Installer) jika Anda ingin memasang sistem di drive USB, SSD, atau hard disk lain.

- **Mode Live** mempertahankan tumpukan modul terkompresi, tata letak boot MiniOS, alat pengelolaan MiniOS, serta persistensi sesi opsional. Pilih opsi ini jika Anda ingin MiniOS itu sendiri berada di disk tujuan.
- **Mode Native** mengekstrak image yang dipilih menjadi desktop Debian konvensional yang dapat ditulis. Sistem tujuan tetap menggunakan lingkungan desktop, identitas visual, dan aplikasi umum dari edisi yang dipilih, sementara runtime live MiniOS dan perangkat lunak pengelolaan khusus live dihapus. Sistem yang diinstal menggunakan initramfs, bootloader, paket kernel, dan alur kerja pengelolaan paket Debian konvensional.

::: warning Instalasi Native menggunakan model sistem yang berbeda
Arsitektur MiniOS yang menjadi ciri khasnya adalah sistem modular live yang dijelaskan di [Tentang MiniOS](/getting-started/About-MiniOS). Mode Native mempertahankan pengalaman desktop MiniOS yang familier, termasuk identitas visual, lingkungan desktop, dan aplikasi umum, tetapi mengubah sistem menjadi instalasi Debian konvensional. Alat khusus MiniOS untuk sesi, modul, kernel modular, dan alur kerja live lainnya dihapus karena fitur-fitur tersebut tidak lagi berlaku. Pilih instalasi live jika Anda ingin menggunakan seluruh rangkaian fitur MiniOS.
:::

Persistensi live dapat dibuat terlebih dahulu di perangkat tujuan oleh Penginstal MiniOS atau disiapkan saat proses boot awal. Penjelasan lengkapnya ada di [Persistensi Initrd](/reference/boot-process/Persistence-Internals). Fitur ini tidak berlaku setelah konversi ke Native.

Penginstal mendukung tata letak BIOS/MBR, UEFI/MBR, dan UEFI/GPT. Instalasi Live otomatis ke seluruh disk menggunakan MBR dengan dukungan boot BIOS dan UEFI; disk berukuran 2 TiB atau lebih memerlukan pilihan UEFI/GPT secara eksplisit. BIOS pada GPT tidak didukung. Alur kerja Native dan tabel partisi yang sudah ada memiliki kebijakan tersendiri. Lihat [Menggunakan Penginstal MiniOS](/installing-minios/MiniOS-Installer) untuk mengetahui batasan lokasi pemasangan, sistem berkas, persistensi, dan partisi.
