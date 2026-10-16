---
updated: 2026-10-15
---

# Menyesuaikan menu boot

Menu boot MiniOS menyediakan pilihan praktis untuk mode boot live yang umum. Panduan ini menjelaskan cara memilih dan mengedit pilihan tersebut.

## Ringkasan

Image MiniOS dapat menggunakan GRUB atau Syslinux, bergantung pada firmware, tata letak image, dan build. Struktur menu, tombol untuk mengedit, penanganan bahasa, dan pilihan yang tersedia mungkin berbeda. Pada akhirnya, bootloader meneruskan baris perintah kernel ke initrd yang sama; lihat [Mode boot](/using-minios/Boot-Modes) untuk mengetahui perilaku sumber, persistensi, RAM-copy, dan ketergantungan pada media.

## Opsi Menu Boot

Image yang disediakan biasanya menampilkan pilihan dengan fungsi berikut, meskipun judul, ketersediaan, urutan, dan pilihan default dapat berbeda antar-image:

| Pilihan menu | Pemilih initrd yang umum | Fungsi |
|---|---|---|
| Mulai MiniOS | `perchdir=resume` | Coba sesi kompatibel default dan izinkan pembuatan pengganti dalam kondisi yang dijelaskan. |
| Mulai sesi baru | `perchdir=setup` | Buka pemilih backend persistensi, lalu buat sesi bernomor tambahan tanpa mengubah sesi yang sudah ada. |
| Pilih sesi yang disimpan | `perchdir=ask` | Pilih sesi tersimpan yang sudah ada secara interaktif; jika penyimpanan kosong, MiniOS akan membuka alur penyiapan yang sama agar sesi pertama dapat dibuat. |
| Mulai tanpa menyimpan | tanpa pemilih persistensi | Gunakan lapisan sementara yang dapat ditulis di RAM. |
| Jalankan dari RAM | `toram` | Salin data sistem MiniOS ke RAM; dengan persistensi, pilihan default `perchtoram=trim` juga menyalin sesi yang didukung dan dipilih secara terpisah. |

Pilihan ini hanya pemilih, bukan jaminan bahwa penyimpanan dapat ditulis, sesi kompatibel, RAM memadai, atau media sumber telah dilepas. Lihat [Mode boot](/using-minios/Boot-Modes) untuk perilaku dan kombinasinya, [Persistensi initrd](/reference/boot-process/Persistence-Internals) untuk kasus khusus pemilih, dan [Optimasi performa](/maintenance-and-recovery/Performance) untuk RAM dan kompromi I/O.

## Cara Menggunakan Menu Boot

### Menavigasi Menu

- Gunakan **tombol panah** untuk berpindah antaropsi
- Tekan **Enter** untuk memilih opsi
- Tekan **Esc** untuk kembali ke menu sebelumnya (di GRUB)
- Pilihan otomatis dan durasi waktu tunggu bergantung pada konfigurasi menu yang aktif; beberapa menu mungkin menunggu tanpa batas waktu

### Bantuan dan pemilihan bahasa

Menu GRUB multibahasa dan menu SYSLINUX bawaan saat ini dimulai dengan mode boot, bukan layar pemilihan bahasa. **F1** membuka bantuan boot dan **F2** membuka pemilihan bahasa. Setelah memilih bahasa, Anda akan kembali ke menu mode yang telah diterjemahkan. Media dengan satu bahasa tetap menyediakan bantuan, tetapi tidak menawarkan navigasi bahasa yang tidak tersedia.

Menu multibahasa awal menggunakan lokal sistem yang telah dikonfigurasi. Hanya pemilihan bahasa secara eksplisit yang menambahkan pengaturan lokal untuk menggantikan `config.conf` selama boot tersebut. Ini tidak menjamin bahwa semua pesan saat startup atau dari aplikasi akan diterjemahkan. Lihat [File konfigurasi](/reference/configuration/config.conf) dan [live-config](/reference/configuration/live-config).

## Menyesuaikan Opsi Boot

### Mengedit Parameter Boot untuk Sementara

Anda dapat mengubah opsi boot untuk satu sesi boot:

**Di GRUB:**
1. Pilih opsi menu yang ingin Anda ubah
2. Tekan **'e'** untuk mengedit
3. Buka baris yang diawali dengan `linux`
4. Tambahkan atau ubah parameter di akhir baris
5. Tekan **Ctrl+X** atau **F10** untuk boot dengan perubahan Anda

**Di SYSLINUX:**
1. Pilih opsi menu yang diinginkan
2. Tekan **Tab** sebelum menekan Enter
3. Tambahkan parameter ke baris perintah yang muncul
4. Tekan **Enter** untuk boot

### Perubahan Parameter Boot Umum

- `debug` - Tampilkan pesan boot terperinci (berguna untuk pemecahan masalah)
- `toram=trim` - Salin kumpulan modul yang difilter dan data wajib terbatas ke RAM
- `perchsize=2000` - Minta 2000 MiB untuk kontainer yang didukung, baik yang baru maupun yang ukurannya bertambah; pengaturan ini tidak menentukan ukuran sesi native atau SquashFS
- `locales=ru_RU.UTF-8` - Minta bahasa/lokal tertentu

Untuk daftar lengkap parameter boot yang tersedia, lihat **[Parameter Boot](/reference/Boot-Parameters)**.

## Lokasi File Konfigurasi

### Di Drive USB MiniOS Anda

- **Konfigurasi GRUB:** `/minios/boot/grub/grub.cfg`
- **Menu mode dan bahasa GRUB:** `/minios/boot/grub/main.cfg` dan `/minios/boot/grub/languages.cfg`; build yang dilokalkan dapat memilih file lain yang dihasilkan
- **Konfigurasi SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Gambar boot:** periksa pengaturan tema SYSLINUX yang aktif`MENU BACKGROUND` atau GRUB; jalurnya bergantung pada bootloader yang dipilih
- **File bahasa:** `/minios/boot/grub/locale/`

### Di Sistem yang Sedang Berjalan

- **Parameter boot saat ini:** `/proc/cmdline`
- **Direktori data MiniOS:** `/run/initramfs/memory/data/minios/`

### Mengedit File Konfigurasi

**Peringatan:** Hanya edit file konfigurasi boot jika Anda memahami tindakan yang dilakukan. Perubahan yang salah dapat membuat drive USB Anda tidak dapat di-boot.

**Untuk mengedit konfigurasi GRUB:**
1. Pasang drive USB MiniOS Anda
2. Buka `/minios/boot/grub/`
3. Edit `grub.cfg` menggunakan editor teks
4. Simpan, lalu keluarkan drive USB dengan aman

**Perubahan umum:**
- Ubah direktif timeout yang digunakan oleh menu GRUB atau Syslinux yang aktif
- Ubah `set default=0` untuk mengubah opsi menu default
- Tambahkan entri menu kustom
