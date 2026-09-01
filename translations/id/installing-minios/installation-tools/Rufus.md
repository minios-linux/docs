---
updated: 2026-08-31
---

# Rufus

Rufus adalah utilitas populer untuk Windows yang membantu memformat dan membuat USB bootable.

## Penting

**Peringatan:** Pemilihan perangkat yang salah akan menyebabkan kehilangan data! Selalu periksa kembali drive yang dipilih dan lakukan backup data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk persyaratan sistem dan ukuran drive secara detail.

## Instalasi Rufus

1. **Unduh Rufus** dari [situs resmi](https://rufus.ie/)
2. **Jalankan programnya** - Rufus tidak memerlukan instalasi, ini adalah aplikasi portabel

## Membuat USB Drive Bootable

Rufus dapat membuat media MiniOS dengan dua cara berbeda. Mode ISO normal adalah pilihan terbaik jika Anda ingin USB drive tetap menjadi filesystem yang dapat ditulis seperti biasa sekaligus sebagai perangkat boot.

### Metode 1: Mode ISO

1. **Jalankan Rufus** sebagai administrator.
2. **Pilih USB drive** pada kolom **Device**.
3. **Pilih file ISO MiniOS** dengan **SELECT**.
4. Ketika Rufus menanyakan cara menulis hybrid image, biarkan pada **ISO Image mode**.
5. Pilih filesystem yang sesuai. FAT32 memberikan kompatibilitas firmware paling luas; NTFS mungkin membatasi boot UEFI langsung di beberapa sistem.
6. Klik **START** dan konfirmasi pemformatan perangkat yang dipilih.

Mode ISO akan mengekstrak file MiniOS ke dalam filesystem normal. Setelah instalasi, sisa ruang kosong masih dapat digunakan untuk file biasa. Ini biasanya merupakan tata letak Rufus yang lebih praktis untuk USB drive MiniOS portabel.

### Metode 2: Mode DD

Pilih **mode DD Image** hanya jika Anda memang ingin menyalin ISO yang dipublikasikan secara persis blok demi blok. Rufus kemudian mereproduksi tata letak ISO ke seluruh perangkat, mirip dengan `dd`, Etcher, atau mode tulis Utilitas Disk.

Mode DD itu sederhana dan dapat diprediksi, tetapi perangkat tidak lagi memiliki tata letak filesystem tunggal yang dapat ditulis seperti yang diharapkan dari flash drive serbaguna.

## Hasil dan persistensi

Mode ISO membuat media MiniOS berbasis file pada filesystem yang dapat ditulis secara normal. Mode DD membuat media image mentah. Tidak ada mode yang merupakan deployment Penginstal MiniOS, dan tidak ada yang secara otomatis membuat sesi persisten.

Persistensi MiniOS dapat menggunakan penyimpanan yang dapat ditulis dan sesuai pada instalasi Rufus berbasis file jika mode boot persisten dipilih. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).
