---
updated: 2026-10-15
---

# Mencadangkan MiniOS

Cadangan adalah cara pemulihan yang andal untuk MiniOS. Dokumentasi tidak menjanjikan prosedur perbaikan umum untuk bootloader, sistem file, atau kontainer persistensi yang rusak. Simpan salinan yang dapat dipulihkan sebelum mengubah rilis, kernel, tata letak penyimpanan, atau sesi penting.

## Data yang perlu dicadangkan

Simpan bagian yang tidak bisa begitu saja dibuat ulang dari image MiniOS:

- file pribadi, termasuk data aplikasi tersembunyi yang penting bagi Anda;
- `config.conf`, file `config.conf.d` yang telah ditinjau, serta perubahan menu boot atau parameter boot yang disengaja;
- modul `.sb`buatan pengguna dan catatan rilis MiniOS yang menjadi sasaran pembuatannya;
- sesi persisten yang berisi status sistem atau aplikasi yang Anda perlukan;
- kunci enkripsi, kredensial pemulihan, dan rahasia lain yang disimpan terpisah dari cadangan yang dilindunginya.

File yang disimpan di luar lapisan sesi, misalnya di lokasi data pengguna terpisah, harus dicadangkan secara terpisah. Jangan berasumsi bahwa arsip sesi mencakup data yang dipasang dari sistem file lain.

## Mengekspor sesi persisten

Manajer Sesi MiniOS dapat mengekspor sesi **yang tidak sedang berjalan** `native`, `dynfilefs`, `dynblk`, `vmdk`, atau `raw` sesi, termasuk format terenkripsi LUKS2 yang didukung, ke arsip `.tar.zst`yang telah diverifikasi. Identifikasi sesi terlebih dahulu:

```bash
sudo minios-session list
sudo minios-session running
```

Selanjutnya, boot sesi lain atau **Mulai tanpa menyimpan** dan ekspor sesi yang tidak aktif:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Ekspor ini merupakan salinan logis dari isi sesi, bukan salinan kontainer penyimpanannya yang identik byte demi byte. Simpan di perangkat lain.

Untuk sesi dengan backend Raw, DynFileFS, DynBlk, atau VMDK yang dilapisi LUKS2, arsip berisi file logis yang telah didekripsi. Lindungi arsip secara terpisah jika data harus tetap terenkripsi.

### Sesi SquashFS

Manajer Sesi saat ini tidak mengekspor atau menyalin sesi SquashFS. Gunakan **Simpan Sekarang** sebelum mematikan perangkat agar snapshot saat ini lengkap, lalu lindungi file penting secara terpisah. Jika Anda memerlukan salinan lengkap seluruh perangkat MiniOS yang dapat dipulihkan, buat image perangkat saat offline.

Jangan mengandalkan penyalinan manual direktori sesi yang terpasang atau merekonstruksi `session.conf`, segmen DynFileFS, file pendukung DynBlk, atau metadata kontainer lainnya sebagai metode pencadangan. Cadangan DynBlk manual byte demi byte hanya aman saat volume dilepas dan harus mempertahankan semua bagian `volume*.db` yang ada, termasuk nomor dengan empat digit atau lebih, persis seperti aslinya; pencadangan logis `minios-session export` lebih disarankan.

## sesi RAM dan image persistensi Ventoy

Sebelum mencadangkan penyimpanan yang digunakan oleh sebuah `perchtoram` sesi, simpan secara eksplisit status RAM kembali ke penyimpanan asal atau sebagai sesi baru. Jika tidak, salinan offline dari media asli hanya berisi status terakhir yang tersimpan. Penyimpanan memerlukan media asli yang dapat ditulis dan identitasnya yang tercatat; lihat [Sesi dan persistensi](/using-minios/Sessions-and-Persistence).

Backend Persistence Plugin Ventoy yang dipilih adalah satu lingkungan ext4, bukan sesi MiniOS bernomor, dan tidak dapat diekspor melalui Session Manager. Matikan dengan benar sebelum menyalin seluruh image backend dari sistem lain; simpan juga konfigurasi Ventoy-nya. Simpan cadangan terpisah untuk file pribadi yang penting.

## Cadangkan konfigurasi dan modul

Pada media MiniOS yang dapat ditulis, simpan `minios/config.conf`, `minios/config.conf.d/`, dan modul buatan pengguna yang disimpan di `minios/modules/`.
Catat juga parameter boot kustom atau perubahan menu boot yang tidak terlihat jelas dari file-file tersebut.

Modul yang dibuat untuk satu rilis MiniOS belum tentu cocok untuk rilis lainnya.
Simpan kode sumber atau resep yang diperlukan untuk membangun ulang modul kustom yang penting.

## Buat image seluruh perangkat

Image seluruh perangkat berguna jika Anda ingin menyimpan tabel partisi, file boot, modul, konfigurasi, sesi, dan data lainnya sekaligus. Buat image saat perangkat offline: matikan MiniOS lalu buat image perangkat dari sistem lain yang sedang berjalan.

[Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) menyediakan operasi **Buat Image** dan **Tulis Image**. Simpan image di perangkat fisik lain. Memulihkan image seluruh perangkat akan menimpa target yang dipilih, jadi pastikan model dan kapasitas target sebelum menulis image.

Image perangkat merupakan pelengkap, bukan pengganti, cadangan terpisah untuk file pribadi yang penting.

## Pulihkan arsip sesi

Mengimpor arsip Session Manager akan membuat sesi bernomor baru; sesi yang sudah ada tidak akan ditimpa:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Pemeriksaan kompatibilitas dilakukan selama impor. Periksa sesi yang diimpor sebelum mengaktifkannya dan pertahankan sesi yang diketahui berfungsi sampai salinan yang dipulihkan selesai diuji.

Saat beralih ke rilis MiniOS lain, sebaiknya migrasikan data pribadi dan konfigurasi yang dipilih. Jangan menganggap sesi lama secara keseluruhan atau modul kustom kompatibel dengan rilis baru hanya karena dapat disalin ke sana.

Lihat [Sesi dan persistensi](/using-minios/Sessions-and-Persistence) untuk pengelolaan sesi dan [Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk beralih antar rilis MiniOS.
