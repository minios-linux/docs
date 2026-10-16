---
updated: 2026-10-15
---

# Ventoy

Ventoy adalah alat populer untuk membuat USB bootable yang memungkinkan Anda menyimpan beberapa file ISO di satu perangkat dan melakukan boot dari salah satunya.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan cadangkan data penting.

Integrasi MiniOS saat ini mendukung mode normal dari Ventoy **normal**, termasuk image persistensi langsung di BIOS dan UEFI. Image MiniOS yang lebih lama mungkin memerlukan **mode GRUB2**; gunakan mode tersebut jika image lama tidak dapat menemukan sumbernya dalam mode normal. Akhiran nama file `VTGRUB2` dapat memaksa mode GRUB2 untuk image tersebut. Akhiran ini tidak selalu diperlukan untuk image saat ini.

## Persyaratan Drive

### Kapasitas Drive

Sediakan ruang untuk file ISO, data lainnya, dan penyimpanan persistence yang diinginkan. Ruang cadangan dan kapasitas image persistence Ventoy adalah pilihan yang terpisah. Lihat [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility) untuk persyaratan sistem.

## Menginstal Ventoy

### Metode 1: Instalasi Standar

1. **Unduh Ventoy** dari [situs web resmi](https://www.ventoy.net/)
2. **Jalankan penginstal Ventoy** dan pilih drive USB Anda
3. **Instal Ventoy** di drive (semua data akan dihapus)
4. **Salin file ISO MiniOS** ke folder root drive USB

Cara ini membuat media multiboot berbasis file ISO: Ventoy menyimpan ISO sebagai file di partisi datanya dan menampilkannya saat boot. Cara ini bukan penulisan image MiniOS mentah atau penerapan Penginstal MiniOS.

### Metode 2: Instalasi dengan Partisi Data Terpisah (Disarankan)

1. **Unduh Ventoy** dari [situs web resmi](https://www.ventoy.net/)
2. **Jalankan penginstal Ventoy** dan pilih drive USB Anda
3. **Aktifkan opsi "Cadangkan Ruang"** selama instalasi agar tersedia ruang yang tidak dialokasikan di bagian akhir drive
4. **Instal Ventoy** di drive
5. **Salin file ISO MiniOS** ke folder root drive USB
6. **Buat partisi ext4** di ruang yang dicadangkan dengan label `persistence` menggunakan editor partisi

Partisi ini dapat digunakan sebagai lokasi persistensi, tetapi membuat partisi saja tidak mengaktifkan persistensi atau membuat sesi.

## Integrasi dengan MiniOS

MiniOS mendeteksi ISO yang disediakan oleh Ventoy secara terpisah dari penyimpanan yang dapat ditulisi. Ada dua model persistensi; pilih salah satunya dengan cermat.

### Sesi MiniOS normal

Tanpa backend Persistence Plugin Ventoy yang dipilih, permintaan **Mulai MiniOS** yang biasa `perchdir=resume`. MiniOS dapat menggunakan partisi di drive yang sama `persistence` atau penyimpanan `minios/changes/` di partisi data Ventoy. Untuk tata letak partisi data, aktifkan dukungan remount Linux milik Ventoy di `/ventoy/ventoy.json`:

```json
{
  "control": [{ "VTOY_LINUX_REMOUNT": "1" }]
}
```

Gabungkan konfigurasi ini ke konfigurasi yang sudah ada, jangan hapus plugin lain. Penyimpanan yang sesuai dan dapat ditulis tetap diperlukan. Pada FAT32/NTFS/exFAT, saat startup sistem akan memilih DynBlk jika tersedia, dan jika tidak, menggunakan DynFileFS. Session Manager, sesi bernomor, enkripsi, dan penyimpanan sesi RAM yang didukung mengikuti aturan MiniOS normal. Boot tanpa permintaan persistence akan tetap bersifat sementara.

### Persistence Plugin Ventoy

Sebagai alternatif, kaitkan ISO dengan **image persistence ext4** menggunakan Persistence Plugin milik Ventoy. Misalnya, image yang sudah dibuat di `/ventoy/minios.dat` dapat dipilih untuk `/ISO/MiniOS.iso`:

```json
{
  "persistence": [
    {
      "image": "/ISO/MiniOS.iso",
      "backend": "/ventoy/minios.dat"
    }
  ]
}
```

Path bersifat relatif terhadap root partisi data Ventoy. Buat image ext4 dengan alat persistence-image milik Ventoy dan pilih image tersebut saat boot; menaruh file `.dat` di drive saja tidak akan mengaktifkannya. MiniOS menggunakan backend yang dipilih oleh Ventoy, bukan perangkat sembarang dengan label yang sama.

Image ini berisi satu lingkungan persisten, dengan `changes/` dan, untuk OverlayFS, `workdir/`. Image ini tidak berisi sesi MiniOS bernomor. Pilih backend lain di Ventoy untuk menggunakan lingkungan lain. Session Manager dan `minios-session` tidak tersedia, pemilihan sesi `perchdir` diabaikan, dan `perchtoram` tidak dapat menyalin upper ini ke RAM. Sistem `toram` tetap dapat digunakan, tetapi tidak menghilangkan ketergantungan pada image persistence.

Penggunaan pertama akan mencatat format union. Jika image digunakan kembali dengan backend union lain, image tidak tersedia, image bukan ext4, atau aktivasi writable gagal, sistem akan memberikan peringatan dan membuat upper RAM baru. **Mulai tanpa menyimpan** tidak membuka image. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Detail internal persistence](/reference/boot-process/Persistence-Internals).

## Menggunakan MiniOS dengan Ventoy

### Booting

Setelah menginstal Ventoy dan menyalin file ISO MiniOS ke drive:

1. **Boot dari drive USB** - pilih drive tersebut di BIOS/UEFI
2. **Pilih MiniOS** dari daftar file ISO yang tersedia di menu Ventoy
3. Pilih mode normal untuk image MiniOS versi terbaru; untuk image lama, gunakan mode yang didokumentasikan
4. **Tunggu hingga MiniOS selesai dimuat**

Setelah startup, periksa status persistence sebelum mengandalkan perubahan yang disimpan. Untuk sesi biasa, gunakan `sudo minios-session status`. Dengan Persistence Plugin, periksa `/run/initramfs/minios-persistence/boot-state` sebagai root: backend yang berhasil diaktifkan mencatat `mode=ventoy` dan `boot_level=ok`. Biarkan drive tetap tersambung selama ISO atau image persistence sedang digunakan.
