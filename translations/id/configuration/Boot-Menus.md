---
updated: 2026-08-26
---

# Panduan Menu Boot MiniOS

Menu boot MiniOS menyediakan entri praktis untuk mode live boot yang umum. Panduan ini menjelaskan cara memilih dan mengedit entri-entri tersebut.

## Ikhtisar

Image MiniOS dapat menggunakan GRUB atau Syslinux tergantung pada firmware, tata letak image, dan build. Tampilan menu, tombol pengeditan, penanganan bahasa, dan entri yang tersedia tidak selalu sama. Bootloader pada akhirnya akan meneruskan baris perintah kernel ke initrd yang sama; lihat [Boot modes](/configuration/Boot-Modes.md) untuk perilaku sumber, persistensi, salin ke RAM, dan ketergantungan media.

## Opsi Menu Boot

Image yang disediakan umumnya menawarkan pilihan semantik berikut, meskipun judul, ketersediaan, urutan, dan pilihan default dapat berbeda pada setiap image:

| Pilihan Menu | Selector initrd umum | Tujuan |
|---|---|---|
| Lanjutkan Sesi Sebelumnya | `perchdir=resume` | Mencoba sesi kompatibel default dan mengizinkan pembuatan pengganti sesuai ketentuan yang dijelaskan. |
| Mulai Sesi Baru | `perchdir=new` | Membuat sesi persisten baru dengan nomor unik. |
| Pilih Sesi Saat Startup | `perchdir=ask` | Memilih sesi yang sudah ada atau meminta sesi baru secara interaktif. |
| Awal Baru | tanpa selector persistensi | Menggunakan layer writable sementara. |
| Salin ke RAM | `toram` | Meminta jalur salin penuh ke RAM. |

Ini adalah selector, bukan jaminan bahwa media penyimpanan dapat ditulis, sesi kompatibel, RAM mencukupi, atau media sumber telah dilepas. Lihat [Boot modes](/configuration/Boot-Modes.md) untuk perilaku dan kombinasi, [Initrd persistence](/configuration/Initrd-Persistence.md) untuk kasus khusus selector, dan [Performance optimization](/administration/Performance-Optimization.md) untuk pertimbangan RAM dan I/O.

## Cara Menggunakan Menu Boot

### Navigasi Menu

- Gunakan **tombol panah** untuk berpindah antar opsi
- Tekan **Enter** untuk memilih opsi
- Tekan **Esc** untuk kembali ke menu sebelumnya (di GRUB)
- Pemilihan otomatis dan durasi waktu tunggu bergantung pada konfigurasi menu yang aktif; beberapa menu mungkin menunggu tanpa batas waktu

### Pemilihan Bahasa (GRUB)

Jika USB drive MiniOS Anda mendukung beberapa bahasa:
1. Layar pertama akan menampilkan opsi bahasa
2. Pilih bahasa yang Anda inginkan
3. Menu boot akan muncul dalam bahasa yang dipilih
4. Pilihan ini juga dapat meneruskan pengaturan lokal ke proses startup berikutnya, namun tidak menjamin semua pesan boot atau aplikasi akan diterjemahkan

**Penting:** Menu multibahasa akan menimpa pengaturan lokal apa pun yang ditentukan di `config.conf`. Bahasa yang dipilih di menu boot akan menjadi prioritas dibandingkan pengaturan lokal yang sudah dikonfigurasi sebelumnya. Lihat **[Configuration File](/configuration/Configuration-File.md)** dan **[live-config](/configuration/live-config.md)** untuk detail mengenai file konfigurasi sistem.

## Kustomisasi Opsi Boot

### Mengedit Parameter Boot Sementara

Anda dapat mengubah opsi boot untuk satu sesi boot saja:

**Di GRUB:**
1. Pilih opsi menu yang ingin Anda ubah
2. Tekan **'e'** untuk mengedit
3. Arahkan ke baris yang diawali dengan `linux`
4. Tambahkan atau ubah parameter di akhir baris tersebut
5. Tekan **Ctrl+X** atau **F10** untuk boot dengan perubahan Anda

**Di SYSLINUX:**
1. Pilih opsi menu yang diinginkan
2. Tekan **Tab** sebelum menekan Enter
3. Tambahkan parameter pada command line yang muncul
4. Tekan **Enter** untuk boot

### Modifikasi Parameter Boot yang Umum

- `debug` - Tampilkan pesan boot detail (berguna untuk troubleshooting)
- `toram=trim` - Salin set modul yang difilter dan data penting ke RAM
- `perchsize=2000` - Atur ukuran penyimpanan sesi menjadi 2GB (sesuaikan sesuai kebutuhan)
- `locales=ru_RU.UTF-8` - Meminta bahasa/lokal tertentu

Untuk daftar lengkap parameter boot yang tersedia, lihat **[Boot Parameters](/configuration/Boot-Parameters.md)**.

## Lokasi File Konfigurasi

### Di USB Drive MiniOS Anda

- **Konfigurasi GRUB:** `/minios/boot/grub/grub.cfg`
- **Konfigurasi SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot images:** `/minios/boot/bootlogo.png`
- **File bahasa:** `/minios/boot/grub/locale/`

### Di Sistem yang Sedang Berjalan

- **Parameter boot saat ini:** `/proc/cmdline`
- **Direktori data MiniOS:** `/run/initramfs/memory/data/minios/`

### Mengedit File Konfigurasi

**Peringatan:** Hanya edit file konfigurasi boot jika Anda benar-benar memahami apa yang Anda lakukan. Perubahan yang salah dapat membuat USB drive Anda tidak bisa melakukan booting.

**Untuk mengedit konfigurasi GRUB:**
1. Mount USB drive MiniOS Anda
2. Arahkan ke `/minios/boot/grub/`
3. Edit `grub.cfg` menggunakan editor teks
4. Simpan dan keluarkan USB drive dengan aman

**Perubahan umum:**
- Mengubah direktif timeout yang digunakan oleh menu GRUB atau Syslinux aktif
- Ubah `set default=0` untuk mengubah opsi menu default
- Tambahkan entri menu kustom
