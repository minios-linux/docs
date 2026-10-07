---
updated: 2026-10-06
---

# Kustomisasi Menu Boot

Menu boot MiniOS menyediakan entri yang praktis untuk mode live boot yang umum. Panduan ini menjelaskan cara memilih dan mengedit entri tersebut.

## Ikhtisar

Image MiniOS dapat menggunakan GRUB atau Syslinux tergantung pada firmware, tata letak image, dan build. Struktur menu, tombol pengeditan, penanganan bahasa, serta entri yang tersedia bisa berbeda. Bootloader pada akhirnya akan meneruskan kernel command line ke initrd yang sama; lihat [Mode Boot](/using-minios/Boot-Modes) untuk sumber yang dihasilkan, persistensi, perilaku salin-RAM, dan ketergantungan media.

## Opsi Menu Boot

Image yang disediakan umumnya menampilkan pilihan semantik berikut, meskipun judul, ketersediaan, urutan, dan pilihan default dapat berbeda pada setiap image:

| Pilihan menu | Selector initrd yang umum | Tujuan |
|---|---|---|
| Mulai MiniOS | `perchdir=resume` | Coba sesi kompatibel default dan izinkan pembuatan pengganti sesuai kondisi yang didokumentasikan. |
| Mulai sesi baru | `perchdir=setup` | Buka pemilih backend-persistensi, lalu buat sesi bernomor tambahan tanpa mengubah sesi yang sudah ada. |
| Pilih sesi yang disimpan | `perchdir=ask` | Pilih sesi tersimpan yang sudah ada secara interaktif; jika penyimpanan kosong, MiniOS akan masuk ke alur pengaturan yang sama agar sesi pertama dapat dibuat. |
| Mulai tanpa menyimpan | tanpa pemilih persistensi | Gunakan layer writable sementara di RAM. |
| Jalankan dari RAM | `toram` | Salin data sistem MiniOS ke RAM; dengan persistensi, default `perchtoram=trim` menyalin sesi yang didukung dan dipilih secara terpisah. |

Ini adalah pemilih, bukan jaminan bahwa penyimpanan dapat ditulis, sesi kompatibel, RAM mencukupi, atau media sumber telah dilepas. Lihat [Mode Boot](/using-minios/Boot-Modes) untuk perilaku dan kombinasi, [Persistensi initrd](/reference/boot-process/Persistence-Internals) untuk kasus khusus pemilih, dan [Optimasi Performa](/maintenance-and-recovery/Performance) untuk RAM dan pertimbangan I/O.

## Cara Menggunakan Menu Boot

### Menavigasi Menu

- Gunakan **tombol panah** untuk berpindah antar opsi
- Tekan **Enter** untuk memilih opsi
- Tekan **Esc** untuk kembali ke menu sebelumnya (di GRUB)
- Pemilihan otomatis dan durasi timeout bergantung pada konfigurasi menu aktif; beberapa menu mungkin menunggu tanpa batas waktu

### Pemilihan Bahasa (GRUB)

Jika USB drive MiniOS Anda mendukung beberapa bahasa:
1. Layar pertama akan menampilkan opsi bahasa
2. Pilih bahasa yang Anda inginkan
3. Menu boot akan muncul dalam bahasa yang dipilih
4. Pilihan ini juga dapat meneruskan pengaturan lokal ke proses startup berikutnya, namun tidak menjamin semua pesan boot atau aplikasi akan diterjemahkan

**Penting:** Menu multibahasa akan menimpa pengaturan lokal apa pun yang telah ditentukan di `config.conf`. Bahasa yang dipilih di menu boot akan diutamakan daripada pengaturan lokal yang sudah dikonfigurasi sebelumnya. Lihat **[Berkas Konfigurasi](/reference/configuration/config.conf)** dan **[live-config](/reference/configuration/live-config)** untuk detail tentang file konfigurasi sistem.

## Kustomisasi Opsi Boot

### Mengedit Parameter Boot Sementara

Anda dapat memodifikasi opsi boot untuk satu sesi boot:

**Di GRUB:**
1. Pilih opsi menu yang ingin Anda ubah
2. Tekan **'e'** untuk mengedit
3. Arahkan ke baris yang diawali dengan `linux`
4. Tambahkan atau ubah parameter di akhir baris
5. Tekan **Ctrl+X** atau **F10** untuk boot dengan perubahan Anda

**Di SYSLINUX:**
1. Pilih opsi menu yang diinginkan
2. Tekan **Tab** sebelum menekan Enter
3. Tambahkan parameter ke command line yang muncul
4. Tekan **Enter** untuk boot

### Modifikasi Parameter Boot yang Umum

- `debug` - Tampilkan pesan boot secara detail (berguna untuk troubleshooting)
- `toram=trim` - Salin set modul yang sudah difilter dan data penting terbatas ke RAM
- `perchsize=2000` - Atur ukuran penyimpanan sesi menjadi 2GB (ubah sesuai kebutuhan)
- `locales=ru_RU.UTF-8` - Minta bahasa/lokal tertentu

Untuk daftar lengkap parameter boot yang tersedia, lihat **[Parameter Boot](/reference/Boot-Parameters)**.

## Lokasi File Konfigurasi

### Pada USB Drive MiniOS Anda

- **Konfigurasi GRUB:** `/minios/boot/grub/grub.cfg`
- **Konfigurasi SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Image boot:** `/minios/boot/bootlogo.png`
- **File bahasa:** `/minios/boot/grub/locale/`

### Di Sistem yang Sedang Berjalan

- **Parameter boot saat ini:** `/proc/cmdline`
- **Direktori data MiniOS:** `/run/initramfs/memory/data/minios/`

### Mengedit File Konfigurasi

**Peringatan:** Hanya edit file konfigurasi boot jika Anda memahami apa yang Anda lakukan. Perubahan yang salah dapat membuat USB drive Anda tidak dapat melakukan boot.

**Untuk mengedit konfigurasi GRUB:**
1. Mount USB drive MiniOS Anda
2. Arahkan ke `/minios/boot/grub/`
3. Edit `grub.cfg` dengan editor teks
4. Simpan dan keluarkan USB drive dengan aman

**Perubahan umum:**
- Modifikasi direktif timeout yang digunakan oleh menu GRUB atau Syslinux aktif
- Ubah `set default=0` untuk mengubah opsi menu default
- Tambahkan entri menu kustom
