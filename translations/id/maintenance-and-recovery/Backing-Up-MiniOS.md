---
updated: 2026-09-13
---

# Mencadangkan MiniOS

Backup adalah jalur pemulihan yang andal untuk MiniOS. Dokumentasi tidak menjamin adanya prosedur perbaikan umum untuk bootloader, filesystem, atau container persistensi yang rusak. Selalu simpan salinan yang dapat dipulihkan sebelum mengubah rilis, kernel, tata letak penyimpanan, atau sesi penting.

## Apa yang perlu dicadangkan

Simpan bagian-bagian yang tidak bisa dengan mudah dibuat ulang dari image MiniOS:

- file pribadi, termasuk data aplikasi tersembunyi yang penting bagi Anda;
- `config.conf`, telah ditinjau `config.conf.d` file, serta perubahan boot-menu atau parameter boot yang disengaja;
- modul buatan pengguna`.sb` serta catatan rilis MiniOS yang menjadi target build modul tersebut;
- sesi persisten yang berisi status sistem atau aplikasi yang Anda perlukan;
- kunci enkripsi, kredensial pemulihan, dan rahasia lain yang disimpan terpisah dari backup yang dilindunginya.

File yang disimpan di luar layer sesi, misalnya di lokasi data pengguna terpisah, harus dicadangkan secara terpisah. Jangan berasumsi bahwa arsip sesi sudah mencakup data yang di-mount dari filesystem lain.

## Ekspor sesi persisten

Manajer Sesi MiniOS dapat mengekspor sesi**yang tidak berjalan** `native`, `dynfilefs`, `dynblk`, `raw`, atau `luks` ke arsip yang telah diverifikasi.`.tar.zst` Pertama, identifikasi sesi yang ingin diekspor:

```bash
minios-session list
minios-session running
```

Kemudian jalankan sesi lain atau**Mulai tanpa menyimpan** lalu ekspor sesi yang tidak aktif:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Ekspor ini merupakan salinan logis dari isi sesi, bukan salinan byte-per-byte dari kontainer penyimpanannya. Simpan arsip ini di perangkat lain.

Untuk sesi LUKS, arsip berisi file logis yang sudah didekripsi. Lindungi arsip ini secara terpisah jika data perlu tetap terenkripsi.

### SquashFS sesi

Session Manager saat ini tidak mengekspor atau menyalin sesi SquashFS. Gunakan **Simpan Sekarang** sebelum mematikan agar snapshot saat ini lengkap, lalu lindungi file penting secara terpisah. Jika Anda membutuhkan salinan lengkap yang dapat dipulihkan dari seluruh perangkat MiniOS, buat image perangkat offline sebagai gantinya.

Jangan mengandalkan penyalinan manual direktori sesi yang ter-mount atau merekonstruksi `session.conf`, segmen DynFileFS, file backing DynBlk, atau metadata kontainer lain sebagai metode cadangan. Cadangan manual DynBlk byte-per-byte hanya aman saat volume terlepas dan harus mempertahankan seluruh `volume000.db` hingga `volume063.db` namespace persis seperti aslinya; `minios-session export` logis lebih disarankan.

## Cadangkan konfigurasi dan modul

Pada media MiniOS yang dapat ditulis, pastikan untuk menyimpan`minios/config.conf`, `minios/config.conf.d/`, dan modul buatan pengguna yang disimpan di bawah`minios/modules/`.
Catat juga parameter boot kustom atau perubahan boot-menu yang tidak terlihat langsung dari file-file tersebut.

Modul yang dibuat untuk satu rilis MiniOS belum tentu cocok untuk rilis lain.
Simpan source code atau resep yang diperlukan untuk membangun ulang modul kustom penting.

## Buat image seluruh perangkat

Image seluruh perangkat berguna jika Anda ingin menyimpan tabel partisi, file boot, modul, konfigurasi, sesi, dan data lain secara bersamaan. Buatlah secara offline: matikan MiniOS dan buat image perangkat dari sistem lain yang sedang berjalan.

[Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) menyediakan**Buat Image** dan**Tulis Image** operasi. Simpan image ke perangkat fisik yang berbeda. Proses pemulihan image seluruh perangkat akan menimpa target yang dipilih, jadi pastikan model dan kapasitas target sudah benar sebelum menulis.

Image perangkat hanya sebagai pelengkap, bukan pengganti backup terpisah untuk file pribadi yang penting.

## Pulihkan arsip sesi

Mengimpor arsip Manajer Sesi akan membuat sesi baru dengan nomor berbeda; sesi yang sudah ada tidak akan ditimpa:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Pemeriksaan kompatibilitas dijalankan saat impor. Periksa sesi yang diimpor sebelum diaktifkan dan simpan sesi yang sudah terbukti berfungsi hingga salinan hasil pemulihan benar-benar telah diuji.

Saat berpindah ke rilis MiniOS lain, sebaiknya migrasikan data pribadi dan konfigurasi yang dipilih saja. Jangan berasumsi sesi lengkap lama atau modul kustom otomatis kompatibel dengan rilis baru hanya karena bisa disalin.

Lihat[Sesi dan persistensi](/using-minios/Sessions-and-Persistence) untuk manajemen sesi dan[Memperbarui MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk berpindah antar rilis MiniOS.
