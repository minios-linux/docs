---
updated: 2026-08-31
---

# Memperbarui MiniOS

MiniOS **tidak** memiliki prosedur upgrade langsung yang didukung dari satu rilis MiniOS ke rilis lainnya. Sistem modular live dirakit dari modul SquashFS hanya-baca dan lapisan sesi yang dapat ditulis. Karena itu, mengubah paket Debian pada sistem yang sedang berjalan tidak menggantikan rilis MiniOS itu sendiri.

::: warning Rilis MiniOS yang lebih baru adalah instalasi baru
Tidak ada padanan MiniOS untuk `dist-upgrade` yang mengubah salinan terinstal atau persisten dari satu rilis MiniOS menjadi rilis lainnya. Untuk beralih ke rilis MiniOS yang lebih baru, instal rilis tersebut, lalu migrasikan data dan pengaturan yang ingin dipertahankan.
:::

## APT boleh digunakan

MiniOS tidak memblokir atau melarang APT. Anda dapat menginstal dan memperbarui paket Debian jika diperlukan:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modular

Dalam sesi MiniOS live, APT menulis file paket dan metadata paket ke lapisan yang dapat ditulis. Jika menggunakan persistensi, perubahan tersebut dapat tetap ada setelah reboot. Modul `.sb`hanya-baca di bawah lapisan tersebut tidak berubah; file yang diperbarui dalam sesi hanya menimpa file dari modul.

Ini adalah pemeliharaan paket **di dalam sesi tersebut**, bukan pembaruan MiniOS.
Proses ini juga menghabiskan ruang persistensi dan dapat membuat sesi sangat berbeda dari image yang dipublikasikan. Sesi baru tetap dimulai dengan kumpulan paket yang terdapat dalam modul MiniOS.

Jangan ubah sumber APT ke rilis Debian lain lalu jalankan `upgrade`, `full-upgrade`, atau `dist-upgrade` dengan harapan mendapatkan rilis MiniOS yang lebih baru.
Tindakan itu menghasilkan keadaan sistem campuran; tindakan tersebut tidak mereplikasi kumpulan modul, file boot, pilihan firmware, paket MiniOS, atau pilihan lain dari rilis MiniOS yang dipublikasikan.

### Setelah konversi native

Instalasi native yang dibuat dengan Penginstal MiniOS adalah desktop Debian konvensional, bukan sistem live modular MiniOS. Instalasi ini mempertahankan pengalaman desktop MiniOS yang familier, termasuk lingkungan desktop yang dipilih, identitas visual, dan aplikasi umum, sementara perangkat lunak live khusus MiniOS dihapus. Sistem yang dihasilkan memiliki sistem file root yang dapat ditulis: APT memperbarui paket seperti biasa, kernel dikelola melalui paket Debian, dan bootloader serta initramfs yang terinstal menggunakan alur kerja Debian konvensional.

Karena itu, model upgrade rilis MiniOS tidak berlaku untuk sistem yang telah dikonversi tersebut. Identitas visual MiniOS dan perangkat lunak desktop umum dapat dipertahankan, sementara pemeliharaan selanjutnya mengikuti model Debian standar, bukan alur kerja modul/sesi MiniOS.

## Beralih ke rilis MiniOS yang lebih baru

Perlakukan rilis MiniOS yang lebih baru sebagai sistem terpisah:

1. Unduh dan [verifikasi](/installing-minios/Verifying-Downloads) image baru.
2. Cadangkan file penting, konfigurasi, modul pengguna, dan sesi persisten seperti yang dijelaskan di [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Instal rilis baru menggunakan [metode instalasi](/installing-minios/Installation-Methods) yang sesuai.
4. Boot dengan sesi baru terlebih dahulu, lalu verifikasi perangkat keras dan aplikasi yang Anda perlukan.
5. Migrasikan file pribadi dan konfigurasi yang dipilih. Jika Session Manager dapat mengekspor sesi lama, impor arsipnya dan biarkan pemeriksaan kompatibilitas berjalan daripada menyalin penyimpanan sesi yang sedang aktif secara manual.
6. Bangun ulang atau instal ulang modul kustom jika kompatibilitasnya dengan rilis target belum diketahui.

Simpan instalasi lama atau cadangannya hingga rilis baru selesai diuji.
Jangan gabungkan modul dasar, file boot, file kernel, atau file initramfs dari rilis MiniOS yang berbeda untuk mencoba membuat proses upgrade sendiri.

## Modul dan kernel merupakan tugas pemeliharaan terpisah

Modul buatan pengguna `.sb` dapat diganti atau dibangun ulang secara terpisah jika memang diperlukan. Tindakan ini mengubah lapisan kustomisasi; bukan rilis MiniOS. Lihat [Mengelola modul](/preparing-and-customizing/Managing-Modules).

Kernel MiniOS juga dikelola sebagai satu set modul kernel, `vmlinuz`, dan initramfs yang terkoordinasi. Gunakan [Mengelola kernel](/preparing-and-customizing/Managing-Kernels) untuk operasi tersebut. Memperbarui hanya paket `linux-image` dengan APT bukanlah alur kerja pengelolaan kernel MiniOS, dan mengubah kernel tidak memperbarui rilis MiniOS.
