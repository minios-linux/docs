---
updated: 2026-10-06
---

# Mencadangkan MiniOS

Cadangan adalah jalur pemulihan yang andal untuk MiniOS. Dokumentasi tidak menjamin adanya prosedur perbaikan umum untuk bootloader, filesystem, atau container persistensi yang rusak. Selalu simpan salinan yang dapat dipulihkan sebelum mengubah rilis, kernel, tata letak penyimpanan, atau sesi penting.

## Apa yang perlu dicadangkan

Simpan bagian-bagian yang tidak dapat dengan mudah dibuat ulang dari image MiniOS:

- file pribadi, termasuk data aplikasi tersembunyi yang penting bagi Anda;
- `config.conf`, telah ditinjau `config.conf.d`file, serta perubahan pada boot-menu atau parameter boot yang disengaja;
- modul buatan pengguna`.sb`dan catatan rilis MiniOS tempat modul tersebut dibuat;
- sesi persisten yang berisi status sistem atau aplikasi yang Anda perlukan;
- kunci enkripsi, kredensial pemulihan, dan rahasia lain yang disimpan terpisah dari cadangan yang mereka lindungi.

File yang disimpan di luar layer sesi, misalnya di lokasi data pengguna terpisah, harus dicadangkan secara terpisah. Jangan berasumsi bahwa arsip sesi berisi data yang di-mount dari filesystem lain.

## Ekspor sesi persisten

Manajer Sesi MiniOS dapat mengekspor sesi**yang tidak sedang berjalan** `native`, `dynfilefs`, `dynblk`, `vmdk`, atau `raw`ke arsip sesi, termasuk bentuk terenkripsi LUKS2 yang didukung, ke dalam arsip yang telah diverifikasi`.tar.zst`arsip. Pertama, identifikasi sesi yang akan diekspor:

```bash
minios-session list
minios-session running
```

Kemudian boot ke sesi lain atau**Mulai tanpa menyimpan**dan ekspor sesi yang tidak aktif:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Ekspor ini adalah salinan logis dari isi sesi, bukan salinan byte-per-byte dari container penyimpanannya. Simpan arsip ini di perangkat lain.

Untuk sesi dengan backend Raw, DynFileFS, DynBlk, atau VMDK yang dibungkus LUKS2, arsip akan berisi file logis yang telah didekripsi. Lindungi arsip secara terpisah jika data harus tetap terenkripsi.

### Sesi SquashFS

Manajer Sesi saat ini tidak mengekspor atau menyalin sesi SquashFS. Gunakan**Simpan Sekarang**sebelum mematikan perangkat agar snapshot saat ini lengkap, lalu lindungi file penting secara terpisah. Jika Anda memerlukan salinan lengkap yang dapat dipulihkan dari seluruh perangkat MiniOS, buat image perangkat secara offline.

Jangan mengandalkan penyalinan manual direktori sesi yang di-mount atau membangun ulang`session.conf`, segmen DynFileFS, file backing DynBlk, atau metadata container lain sebagai metode backup. Backup manual byte-per-byte DynBlk hanya aman jika volume dalam keadaan detached dan harus mempertahankan semua bagian yang ada`volume*.db`termasuk nomor dengan empat digit atau lebih, persis seperti aslinya; backup logis`minios-session export`lebih direkomendasikan.

## Cadangkan konfigurasi dan modul

Pada media MiniOS yang dapat ditulis, simpan`minios/config.conf`, `minios/config.conf.d/`, serta modul buatan pengguna yang disimpan di bawah`minios/modules/`.
Catat juga parameter boot kustom atau perubahan boot-menu yang tidak terlihat langsung dari file-file tersebut.

Modul yang dibuat untuk satu rilis MiniOS belum tentu cocok untuk rilis lainnya.
Simpan sumber atau resep yang dibutuhkan untuk membangun ulang modul kustom yang penting.

## Buat image seluruh perangkat

Image seluruh perangkat berguna jika Anda ingin menyimpan tabel partisi, file boot, modul, konfigurasi, sesi, dan data lain secara bersamaan. Buat image secara offline: matikan MiniOS lalu buat image perangkat dari sistem lain yang sedang berjalan.

[Utilitas Disk](/installing-minios/installation-tools/Drive-Utility)menyediakan**Buat Image**dan**Tulis Image**operasi. Simpan image ke perangkat fisik yang berbeda. Memulihkan image seluruh perangkat akan menimpa target yang dipilih, jadi pastikan model dan kapasitas target sudah benar sebelum menulis.

Image perangkat adalah pelengkap, bukan pengganti, backup terpisah untuk file pribadi yang penting.

## Pulihkan arsip sesi

Mengimpor arsip Manajer Sesi akan membuat sesi baru dengan nomor berbeda; sesi yang ada tidak akan ditimpa:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Pemeriksaan kompatibilitas dilakukan saat impor. Periksa sesi yang diimpor sebelum mengaktifkannya dan simpan sesi yang sudah terbukti berfungsi sampai salinan hasil pemulihan telah diuji.

Saat berpindah ke rilis MiniOS lain, sebaiknya migrasikan data pribadi dan konfigurasi yang dipilih saja. Jangan berasumsi sesi lengkap lama atau modul kustom akan kompatibel dengan rilis baru hanya karena dapat disalin ke sana.

Lihat[Sesi dan persistensi](/using-minios/Sessions-and-Persistence)untuk manajemen sesi dan[Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS)untuk berpindah antar rilis MiniOS.
