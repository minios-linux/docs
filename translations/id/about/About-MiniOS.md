# Tentang MiniOS

MiniOS adalah distribusi Linux berbasis Debian yang dirancang untuk dijalankan dari media removable atau disk lokal. Sistemnya yang hanya-baca dibangun dari modul SquashFS, dengan opsi sesi yang dapat ditulis untuk file, pengaturan, dan paket yang diinstal. MiniOS mendukung sistem x86 64-bit dan dapat melakukan boot melalui UEFI atau BIOS lama.

## Model sistem

- Sistem dasar dan perangkat lunak opsional merupakan modul terpisah. Modul dapat dipilih saat boot atau ditambahkan tanpa membangun ulang seluruh sistem.
- Sesi live baru tidak mengubah modul dasar.
- Persistensi dapat menyimpan perubahan di direktori native, kontainer DynFileFS yang dapat diperluas, image mentah berukuran tetap, atau kontainer LUKS terenkripsi, tergantung pada instalasi dan filesystem target.
- MiniOS Installer dapat membuat instalasi live modular atau, jika image mendukungnya, melakukan instalasi Linux native konvensional.

Lihat [Arsitektur sistem](/about/System-Architecture.md) untuk tata letak boot dan modul, serta [Manajemen sesi](/configuration/Session-Management.md) untuk sesi persisten.

## Edisi

Edisi yang tersedia tergantung pada rilis dan distribusi dasar:

- **Minimum** menggunakan lingkungan Flux dan paket yang lebih sedikit. Cocok untuk sistem yang membutuhkan pilihan perangkat lunak lebih ringkas.
- **Standard** adalah edisi serbaguna. Build Debian dan Ubuntu standar saat ini menggunakan Xfce.
- **Toolbox** menambahkan alat administrasi sistem, penyimpanan, diagnostik, dan pemulihan.
- **Ultra** menambahkan lebih banyak aplikasi di atas edisi lainnya.

Xfce adalah desktop utama pada image Standard, Toolbox, dan Ultra, namun bukan satu-satunya lingkungan MiniOS. Minimum menggunakan Flux, dan konfigurasi build yang didukung dapat menawarkan lingkungan lain. Periksa deskripsi rilis sebelum mengunduh jika lingkungan desktop menjadi pertimbangan.

Untuk perangkat lunak yang disertakan di setiap edisi, lihat [daftar paket](/administration/Packages.md).

## Instalasi dan persistensi

File ISO dapat ditulis sebagai image bootable, disalin ke perangkat multiboot, atau diinstal menggunakan MiniOS Installer. Metode ini memiliki perilaku penyimpanan yang berbeda. Alat penulisan image seperti `dd` dan Etcher mereplikasi tata letak ISO; Ventoy melakukan boot dari file ISO; MiniOS Installer dapat mengalokasikan dan mengonfigurasi penyimpanan sesi yang dapat ditulis. Jangan berasumsi bahwa metode penulisan otomatis membuat persistensi.

Mulailah dengan [Quick start](/installation/Quick-Start.md) dan gunakan panduan yang terhubung sesuai metode instalasi yang dipilih. Persistensi juga dapat dipilih dari menu boot yang sesuai atau dikonfigurasi dengan parameter boot yang didokumentasikan jika penyimpanan yang dapat ditulis tersedia.

## Sumber daya proyek

- [Situs web MiniOS](https://minios.dev)
- [Kode sumber](https://github.com/minios-linux/minios-live)
- [Pelacak isu](https://github.com/minios-linux/minios-live/issues)
