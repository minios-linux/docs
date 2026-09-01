---
updated: 2026-08-31
---

# Mencadangkan MiniOS

Cadangan adalah jalur pemulihan yang andal untuk MiniOS. Dokumentasi tidak menjanjikan prosedur perbaikan umum untuk bootloader, filesystem, atau container persistensi yang rusak. Simpan salinan yang dapat dipulihkan sebelum mengubah rilis, kernel, tata letak penyimpanan, atau sesi penting.

## Apa yang perlu dicadangkan

Simpan bagian-bagian yang tidak dapat dengan mudah dibuat ulang dari image MiniOS:

- file pribadi, termasuk data aplikasi tersembunyi yang penting bagi Anda;
- file `config.conf`, file `config.conf.d` yang sudah ditinjau, dan perubahan boot-menu atau parameter boot yang disengaja;
- modul `.sb` yang dibuat pengguna dan catatan rilis MiniOS tempat modul tersebut dibuat;
- sesi persisten yang berisi status sistem atau aplikasi yang Anda butuhkan;
- kunci enkripsi, kredensial pemulihan, dan rahasia lain yang disimpan terpisah dari cadangan yang mereka lindungi.

File yang disimpan di luar layer sesi, misalnya di lokasi data pengguna terpisah, harus dicadangkan secara terpisah. Jangan berasumsi bahwa arsip sesi berisi data yang di-mount dari filesystem lain.

## Ekspor sesi persisten

Manajer Sesi MiniOS dapat mengekspor sesi **yang tidak berjalan** `native`, `dynfilefs`, `raw`, atau `luks` ke arsip `.tar.zst` yang telah diverifikasi. Identifikasi terlebih dahulu sesi yang dimaksud:

```bash
minios-session list
minios-session running
```

Kemudian jalankan sesi lain atau pilih **Mulai tanpa menyimpan** dan ekspor sesi yang tidak aktif:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

Ekspor ini merupakan salinan logis dari isi sesi, bukan salinan byte-per-byte dari wadah penyimpanannya. Simpan arsip tersebut di perangkat lain.

Untuk sesi LUKS, arsip berisi file logis yang telah didekripsi. Lindungi arsip tersebut secara terpisah jika data harus tetap terenkripsi.

### Sesi SquashFS

Session Manager saat ini tidak mengekspor atau menyalin sesi SquashFS. Gunakan **Simpan Sekarang** sebelum mematikan agar snapshot saat ini lengkap, lalu lindungi file penting secara terpisah. Jika Anda memerlukan salinan lengkap yang dapat dipulihkan dari seluruh perangkat MiniOS, buat image perangkat secara offline.

Jangan mengandalkan penyalinan manual direktori sesi yang di-mount atau merekonstruksi `session.conf`, segmen DynFileFS, atau metadata container sebagai metode cadangan.

## Cadangkan konfigurasi dan modul

Pada media MiniOS yang dapat ditulis, simpan `minios/config.conf`, `minios/config.conf.d/`, dan modul buatan pengguna yang disimpan di bawah `minios/modules/`.
Catat juga parameter boot kustom atau perubahan boot-menu yang tidak terlihat jelas dari file-file tersebut.

Modul yang dibuat untuk satu rilis MiniOS tidak otomatis cocok untuk rilis lain.
Simpan sumber atau resep yang dibutuhkan untuk membangun ulang modul kustom yang penting.

## Membuat image seluruh perangkat

Image seluruh perangkat berguna ketika Anda ingin mempertahankan tabel partisi, file boot, modul, konfigurasi, sesi, dan data lainnya secara bersamaan. Buat image secara offline: matikan MiniOS dan buat image perangkat dari sistem lain yang sedang berjalan.

[Utilitas Disk](/installing-minios/installation-tools/Drive-Utility) menyediakan operasi **Buat Image** dan **Tulis Image**. Simpan image ke perangkat fisik yang berbeda. Pemulihan image seluruh perangkat akan menimpa target yang dipilih, jadi pastikan model dan kapasitas target sudah benar sebelum menulisnya.

Image perangkat adalah pelengkap, bukan pengganti, cadangan terpisah untuk file pribadi penting.

## Memulihkan arsip sesi

Mengimpor arsip Session Manager akan membuat sesi baru yang diberi nomor; sesi yang sudah ada tidak akan ditimpa:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Pemeriksaan kompatibilitas akan dijalankan saat impor. Periksa sesi yang diimpor sebelum mengaktifkannya dan simpan sesi yang sudah terbukti berfungsi sampai salinan hasil pemulihan telah diuji.

Saat berpindah ke rilis MiniOS lain, sebaiknya migrasikan data pribadi dan konfigurasi yang dipilih. Jangan berasumsi bahwa sesi lengkap lama atau modul kustom kompatibel dengan rilis baru hanya karena dapat disalin ke sana.

Lihat [Sessions and persistence](/using-minios/Sessions-and-Persistence) untuk manajemen sesi dan [Updating MiniOS](/maintenance-and-recovery/Updating-MiniOS) untuk berpindah antar rilis MiniOS.
