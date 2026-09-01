---
updated: 2026-08-31
---

# Memperbarui MiniOS

MiniOS **tidak** memiliki prosedur upgrade in-place yang didukung dari satu rilis MiniOS ke rilis lainnya. Sistem live modular ini dirakit dari modul SquashFS yang hanya-baca ditambah lapisan sesi yang dapat ditulis, sehingga mengubah paket Debian di sistem yang sedang berjalan tidak akan menggantikan rilis MiniOS itu sendiri.

::: warning Rilis MiniOS yang lebih baru adalah instalasi baru
Tidak ada padanan MiniOS dari `dist-upgrade` yang dapat mengubah salinan terpasang atau persisten dari satu rilis MiniOS menjadi rilis lain. Berpindah ke rilis MiniOS yang lebih baru berarti menginstal rilis tersebut, lalu memigrasikan data dan pengaturan yang ingin Anda simpan.
:::

## APT diizinkan

MiniOS tidak memblokir atau melarang penggunaan APT. Anda dapat memasang dan memperbarui paket Debian jika diperlukan:

```bash
sudo apt update
sudo apt upgrade
```

### Live modular MiniOS

Dalam sesi live MiniOS, APT akan menulis file paket dan metadata paket ke lapisan yang dapat ditulis. Dengan persistensi, perubahan tersebut dapat bertahan setelah reboot. Modul `.sb` yang hanya-baca di bawah lapisan itu tidak berubah; file yang diperbarui di sesi hanya menimpa file dari modul.

Ini adalah pemeliharaan paket **di dalam sesi tersebut**, bukan pembaruan MiniOS.
Hal ini juga mengonsumsi ruang persistensi dan dapat membuat sesi berbeda secara signifikan dari image yang dipublikasikan. Sesi baru tetap akan dimulai dari kumpulan paket yang ada di modul MiniOS.

Jangan ubah sumber APT ke rilis Debian lain dan menjalankan `upgrade`, `full-upgrade`, atau `dist-upgrade` dengan harapan mendapatkan rilis MiniOS yang lebih baru.
Tindakan tersebut akan menciptakan status sistem campuran; tidak akan mereproduksi kumpulan modul, file boot, pemilihan firmware, paket MiniOS, atau pilihan lain dari rilis MiniOS yang dipublikasikan.

### Setelah konversi native

Instalasi native yang dibuat oleh MiniOS adalah instalasi desktop Debian konvensional, bukan sistem live modular MiniOS. Sistem ini tetap mempertahankan pengalaman desktop MiniOS yang sudah dikenal, termasuk lingkungan desktop yang dipilih, identitas visual, dan aplikasi sehari-hari, sementara perangkat lunak live khusus MiniOS dihapus. Sistem yang dihasilkan memiliki filesystem root yang dapat ditulis: APT memperbarui paket seperti biasa, kernel dikelola melalui paket Debian, dan bootloader serta initramfs yang terpasang menggunakan alur kerja Debian konvensional.

Model upgrade rilis MiniOS tidak berlaku untuk sistem yang telah dikonversi tersebut. Identitas visual dan perangkat lunak desktop biasa MiniOS dapat tetap digunakan, sementara pemeliharaan berkelanjutan mengikuti model Debian standar, bukan alur kerja modul/sesi MiniOS.

## Berpindah ke rilis MiniOS yang lebih baru

Perlakukan rilis MiniOS yang lebih baru sebagai sistem terpisah:

1. Unduh dan [verifikasi](/installing-minios/Verifying-Downloads) image baru.
2. Cadangkan file penting, konfigurasi, modul pengguna, dan sesi persisten seperti dijelaskan di [Mencadangkan MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Instal rilis baru menggunakan [metode instalasi](/installing-minios/Installation-Methods) yang sesuai.
4. Boot terlebih dahulu dengan sesi baru dan verifikasi perangkat keras serta aplikasi yang Anda butuhkan.
5. Migrasikan file pribadi dan konfigurasi terpilih. Jika Session Manager dapat mengekspor sesi lama, impor arsipnya dan biarkan pemeriksaan kompatibilitas berjalan, daripada menyalin store sesi live secara manual.
6. Bangun ulang atau instal ulang modul kustom jika belum dipastikan kompatibel dengan rilis tujuan.

Simpan instalasi lama atau cadangan hingga rilis baru telah diuji.
Jangan menggabungkan modul dasar, file boot, file kernel, atau file initramfs dari rilis MiniOS yang berbeda untuk mencoba membuat upgrade.

## Modul dan kernel adalah tugas pemeliharaan terpisah

Modul `.sb` yang dibuat pengguna dapat diganti atau dibangun ulang secara independen jika memang diinginkan. Hal ini hanya mengubah lapisan kustomisasi; tidak mengubah rilis MiniOS. Lihat [Mengelola modul](/preparing-and-customizing/Managing-Modules).

Kernel MiniOS juga dikelola sebagai satu set kernel module, `vmlinuz`, dan initramfs yang terkoordinasi. Gunakan [Mengelola kernel](/preparing-and-customizing/Managing-Kernels) untuk operasi tersebut. Memperbarui hanya paket `linux-image` dengan APT bukanlah workflow manajemen kernel MiniOS, dan mengganti kernel tidak memperbarui rilis MiniOS.
