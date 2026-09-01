---
updated: 2026-08-28
---

# Kustomisasi menu boot

Menu boot MiniOS menyediakan entri yang praktis untuk mode live boot yang umum digunakan. Panduan ini menjelaskan cara memilih dan mengedit entri-entri tersebut.

## Ikhtisar

Image MiniOS dapat menggunakan GRUB atau Syslinux tergantung pada firmware, tata letak image, dan build. Grafik menu, tombol pengeditan, penanganan bahasa, dan entri yang tersedia tidak selalu identik. Bootloader pada akhirnya akan meneruskan command line kernel ke initrd yang sama; lihat [Mode Boot](/using-minios/Boot-Modes) untuk sumber yang dihasilkan, persistensi, perilaku RAM-copy, dan ketergantungan media.

## Opsi Menu Boot

Image yang disediakan umumnya menampilkan pilihan semantik berikut, meskipun judul, ketersediaan, urutan, dan pilihan default dapat berbeda-beda tergantung image:

| Pilihan menu | Selector initrd tipikal | Tujuan |
|---|---|---|
| Mulai MiniOS | `perchdir=resume` | Mencoba sesi kompatibel default dan mengizinkan pembuatan pengganti sesuai kondisi yang didokumentasikan. |
| Mulai sesi baru | `perchdir=new` | Membuat sesi persisten bernomor tambahan tanpa mengubah sesi yang sudah ada. |
| Pilih sesi tersimpan | `perchdir=ask` | Memilih sesi tersimpan yang sudah ada secara interaktif. Gunakan **Mulai sesi baru** jika penyimpanan kosong. |
| Mulai tanpa menyimpan | selector tanpa persistensi | Menggunakan layer writable sementara di RAM. |
| Jalankan dari RAM | `toram` | Menyalin seluruh pohon data MiniOS ke RAM dan mencoba melepas sumbernya. |

Ini adalah selector, bukan jaminan bahwa penyimpanan dapat ditulis, sesi kompatibel, RAM mencukupi, atau media sumber telah dilepas. Lihat [Mode Boot](/using-minios/Boot-Modes) untuk perilaku dan kombinasi, [Persistensi Initrd](/reference/boot-process/Persistence-Internals) untuk kasus tepi selector, dan [Optimasi performa](/maintenance-and-recovery/Performance) untuk RAM dan pertimbangan I/O.

## Cara Menggunakan Menu Boot

### Navigasi Menu

- Gunakan **tombol panah** untuk berpindah antar opsi
- Tekan **Enter** untuk memilih opsi
- Tekan **Esc** untuk kembali ke menu sebelumnya (di GRUB)
- Pemilihan otomatis dan durasi timeout bergantung pada konfigurasi menu yang aktif; beberapa menu mungkin menunggu tanpa batas waktu

### Pemilihan Bahasa (GRUB)

Jika USB drive MiniOS Anda mendukung beberapa bahasa:
1. Layar pertama akan menampilkan opsi bahasa
2. Pilih bahasa yang Anda inginkan
3. Menu boot akan muncul dalam bahasa yang dipilih
4. Pilihan ini juga dapat meneruskan pengaturan lokal ke proses startup berikutnya, namun tidak menjamin semua pesan boot atau aplikasi akan diterjemahkan

**Penting:** Menu multibahasa akan menimpa pengaturan lokal apa pun yang ditentukan di `config.conf`. Bahasa yang dipilih di menu boot akan menjadi prioritas dibanding pengaturan lokal yang sudah dikonfigurasi. Lihat **[Configuration File](/reference/configuration/config.conf)** dan **[live-config](/reference/configuration/live-config)** untuk detail mengenai file konfigurasi sistem.

## Menyesuaikan Opsi Boot

### Mengedit Parameter Boot Sementara

Anda dapat memodifikasi opsi boot untuk satu sesi boot saja:

**Di GRUB:**
1. Pilih opsi menu yang ingin Anda ubah
2. Tekan **'e'** untuk mengedit
3. Arahkan ke baris yang diawali dengan `linux`
4. Tambahkan atau ubah parameter di akhir baris
5. Tekan **Ctrl+X** atau **F10** untuk boot dengan perubahan Anda

**Di SYSLINUX:**
1. Pilih opsi menu yang diinginkan
2. Tekan **Tab** sebelum menekan Enter
3. Tambahkan parameter ke baris perintah yang muncul
4. Tekan **Enter** untuk boot

### Modifikasi Parameter Boot yang Umum

- `debug` - Tampilkan pesan boot secara detail (berguna untuk troubleshooting)
- `toram=trim` - Salin set modul yang difilter dan data penting terbatas ke RAM
- `perchsize=2000` - Atur ukuran penyimpanan sesi menjadi 2GB (sesuaikan sesuai kebutuhan)
- `locales=ru_RU.UTF-8` - Minta bahasa/lokal tertentu

Untuk daftar lengkap parameter boot yang tersedia, lihat **[Boot Parameters](/reference/Boot-Parameters)**.

## Lokasi File Konfigurasi

### Pada USB Drive MiniOS Anda

- **Konfigurasi GRUB:** `/minios/boot/grub/grub.cfg`
- **Konfigurasi SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Boot images:** `/minios/boot/bootlogo.png`
- **File bahasa:** `/minios/boot/grub/locale/`

### Di Sistem yang Sedang Berjalan

- **Parameter boot saat ini:** `/proc/cmdline`
- **Direktori data MiniOS:** `/run/initramfs/memory/data/minios/`

### Mengedit File Konfigurasi

**Peringatan:** Edit file konfigurasi boot hanya jika Anda benar-benar memahami apa yang Anda lakukan. Perubahan yang salah dapat membuat USB drive Anda tidak bisa boot.

**Untuk mengedit konfigurasi GRUB:**
1. Mount USB drive MiniOS Anda
2. Arahkan ke `/minios/boot/grub/`
3. Edit `grub.cfg` dengan text editor
4. Simpan dan eject USB drive dengan aman

**Perubahan umum:**
- Ubah direktif timeout yang digunakan oleh menu GRUB atau Syslinux yang aktif
- Ubah `set default=0` untuk mengubah opsi menu default
- Tambahkan entri menu kustom
