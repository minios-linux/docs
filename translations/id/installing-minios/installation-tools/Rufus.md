---
updated: 2026-08-31
---

# Rufus

Rufus adalah utilitas populer untuk Windows yang membantu memformat dan membuat USB drive bootable.

## Penting

**Peringatan:** Salah memilih perangkat dapat menyebabkan hilangnya data! Selalu periksa kembali drive yang dipilih dan cadangkan data penting.

## Persyaratan Drive

### Ukuran Drive

Lihat [Panduan Kompatibilitas Hardware](/getting-started/Hardware-Compatibility) untuk mengetahui persyaratan sistem dan ukuran drive secara terperinci.

## Menginstal Rufus

1. **Unduh Rufus** dari [situs web resmi](https://rufus.ie/)
2. **Jalankan program** - Rufus tidak perlu diinstal karena merupakan aplikasi portabel

## Membuat Drive USB Bootable

Rufus dapat membuat media MiniOS dengan dua cara berbeda. Mode ISO standar adalah pilihan yang lebih baik jika Anda ingin drive USB tetap menjadi sistem file biasa yang dapat ditulisi sekaligus berfungsi sebagai perangkat boot.

### Metode 1: Mode ISO

1. **Jalankan Rufus** sebagai administrator.
2. **Pilih drive USB** di kolom **Perangkat**.
3. **Pilih file ISO MiniOS** dengan mengeklik **SELECT**.
4. Saat Rufus menanyakan cara menulis image hybrid, tetap gunakan **Mode ISO Image**.
5. Pilih sistem file yang sesuai. FAT32 menawarkan kompatibilitas firmware terluas; NTFS dapat membatasi boot UEFI langsung pada beberapa sistem.
6. Klik **START** lalu konfirmasikan pemformatan perangkat yang dipilih.

Mode ISO mengekstrak file MiniOS ke sistem file biasa. Setelah instalasi, ruang kosong yang tersisa tetap dapat digunakan untuk menyimpan file biasa. Tata letak ini biasanya lebih praktis untuk drive Rufus MiniOS portabel.

### Metode 2: Mode DD

Pilih **Mode DD Image** hanya jika Anda memang menginginkan salinan persis ISO yang dipublikasikan, blok demi blok. Rufus kemudian menyalin tata letak ISO ke seluruh perangkat, serupa dengan `dd`, Etcher, atau mode penulisan Utilitas Disk.

Mode DD sederhana dan mudah diprediksi, tetapi perangkat tidak lagi memiliki tata letak sistem file tunggal yang dapat ditulisi seperti biasanya, yang diharapkan dari flash drive serbaguna.

## Hasil dan persistensi

Mode ISO membuat media berbasis file MiniOS pada sistem file normal yang dapat ditulisi. Mode DD membuat media image mentah. Kedua mode tersebut bukan deployment Penginstal MiniOS, dan tidak ada yang otomatis membuat sesi persisten.

Persistensi MiniOS dapat menggunakan penyimpanan yang sesuai dan dapat ditulisi pada instalasi Rufus berbasis file saat mode boot persisten dipilih. Lihat [Mode boot](/using-minios/Boot-Modes) dan [Manajemen sesi](/using-minios/Sessions-and-Persistence).
