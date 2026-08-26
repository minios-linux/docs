# Tentang MiniOS

MiniOS adalah distribusi Linux berbasis Debian yang dirancang untuk dijalankan dari media removable atau disk lokal. Sistemnya yang hanya-baca dibangun dari modul SquashFS, dengan opsi sesi yang dapat ditulis untuk file, pengaturan, dan paket yang diinstal. MiniOS mendukung sistem x86 64-bit dan dapat melakukan boot melalui UEFI atau BIOS lama.

## Model sistem

- Sistem dasar dan perangkat lunak opsional adalah modul terpisah. Modul dapat dipilih saat boot atau ditambahkan tanpa membangun ulang seluruh sistem.
- Sesi live baru tidak mengubah modul dasar.
- Persistensi dapat menyimpan perubahan di direktori native, kontainer DynFileFS yang dapat diperluas, image raw berukuran tetap, atau kontainer LUKS terenkripsi, tergantung pada instalasi dan filesystem target.
- MiniOS Installer dapat membuat instalasi live modular atau, jika image mendukungnya, melakukan instalasi Linux native konvensional.

Lihat [Boot modes](/configuration/Boot-Modes.md) untuk panduan resmi perilaku boot live dan [System architecture](/about/System-Architecture.md) untuk tata letak boot dan modul. Kontrak detail early-boot didokumentasikan di [initrd system discovery](/configuration/Initrd-System-Discovery.md), [initrd module loading](/configuration/Initrd-Module-Loading.md), dan [initrd persistence](/configuration/Initrd-Persistence.md).

## Edisi

Edisi yang tersedia bergantung pada rilis dan distribusi dasar:

- **Flux** menggunakan lingkungan Flux dan paket yang lebih sedikit. Cocok untuk
  sistem yang mengutamakan pilihan perangkat lunak yang lebih ringkas.
- **Standard** adalah edisi serbaguna. Build Debian dan Ubuntu standar saat ini menggunakan Xfce.
- **Toolbox** menambahkan alat administrasi sistem, penyimpanan, diagnostik, dan pemulihan.
- **Ultra** menambahkan lebih banyak aplikasi di atas edisi lainnya.

Xfce biasanya menjadi desktop utama pada image Standard, Toolbox, dan Ultra, namun bukan satu-satunya lingkungan MiniOS. Edisi Flux menggunakan Fluxbox, dan konfigurasi build yang didukung dapat menawarkan lingkungan lain. Periksa deskripsi rilis sebelum mengunduh jika lingkungan desktop menjadi pertimbangan.

Untuk daftar perangkat lunak yang disertakan di setiap edisi, lihat
[daftar paket](/administration/Packages.md) dan [aplikasi serta alat MiniOS](/about/MiniOS-Applications.md).

## Instalasi dan persistensi

Sebuah ISO dapat ditulis sebagai image bootable, disalin ke perangkat multiboot, atau diinstal dengan MiniOS Installer. Metode-metode ini memiliki perilaku penyimpanan yang tidak identik. Alat penulisan image seperti `dd` dan Etcher mereproduksi tata letak ISO; Ventoy melakukan boot dari file ISO; MiniOS Installer dapat mengalokasikan dan mengonfigurasi penyimpanan sesi yang dapat ditulis. Jangan berasumsi bahwa metode penulisan akan otomatis membuat persistensi.

Mulailah dengan [Quick start](/installation/Quick-Start.md) dan gunakan panduan yang terhubung untuk metode instalasi yang dipilih. Persistensi juga dapat dipilih dari menu boot yang sesuai atau dikonfigurasi dengan parameter boot yang didokumentasikan jika penyimpanan yang dapat ditulis tersedia. Lihat [Boot modes](/configuration/Boot-Modes.md) untuk perilaku sesi live yang dihasilkan dan [Session management](/configuration/Session-Management.md) untuk opsi penyimpanan.

## Sumber daya proyek

- [Situs web MiniOS](https://minios.dev)
- [Kode sumber](https://github.com/minios-linux/minios-live)
- [Pelacak isu](https://github.com/minios-linux/minios-live/issues)
- [Pertanyaan yang sering diajukan](/about/FAQ.md)
