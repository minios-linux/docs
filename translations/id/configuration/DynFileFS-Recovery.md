---
updated: 2026-08-26
program_commits:
    dynblk: 25f627f2cf86b79c35a185999af90e5e1aa08d17
    dynfilefs-app: 7b2a6b69edeedcc24e0847df44e9060796c0af4b
---

# Memulihkan Penyimpanan DynFileFS dan dynblk

DynFileFS dan `dynblk` menyediakan image blok `virtual.dat` yang dialokasikan secara dinamis, di mana datanya disimpan dalam serangkaian file `changes.dat`. MiniOS memformat `virtual.dat` sebagai ext4 dan menggunakannya untuk perubahan yang persisten. `dynblk` adalah implementasi yang dipelihara dari format penyimpanan yang sama; MiniOS mempertahankan nama mode persistensi `dynfilefs` dan perintah kompatibilitas `@mount.dynfilefs` jika diperlukan.

Panduan ini membahas inspeksi, migrasi, perbaikan sistem file, pemulihan sesi, dan ekstraksi file. Panduan ini berlaku setelah shutdown yang tidak bersih, perangkat penyimpanan penuh, penyalinan yang terputus, atau kegagalan metadata sesi.

Gejala yang umum adalah:

- MiniOS membuat sesi bernomor baru setiap kali boot.
- `resume` tidak memuat desktop dan file sebelumnya.
- Memilih sesi lama dari menu boot tidak berpengaruh.
- Direktori sesi masih berisi file `changes.dat` tetapi tidak diaktifkan.

Penyebabnya bisa berupa segmen penyimpanan yang tidak lengkap, metadata container yang rusak, filesystem ext4 yang kotor di dalam `virtual.dat`, atau `session.conf` yang salah.

## Aturan Keamanan

1. Jangan memperbaiki satu-satunya salinan kontainer penyimpanan.
2. Jangan menyalin sesi sumber ke atas store `minios/changes` yang sedang berjalan atau ter-mount.
3. Salin seluruh direktori `changes` sebelum mencoba pemulihan.
4. Jalankan `e2fsck -y` hanya pada salinan tambahan dari sebuah sesi.
5. Jangan membuat file `changes.dat.N` yang hilang secara manual.

Jangan membuat salinan awal saat sesi sumber sedang berjalan atau kontainer DynFileFS-nya sedang ter-mount. Metadata dan file segmennya dapat berubah secara independen dan menghasilkan salinan yang tidak konsisten. Boot tanpa persistensi atau gunakan sistem Linux lain. Pastikan tampilan DynFileFS/FUSE, perangkat loop `virtual.dat`, dan filesystem ext4 di dalamnya tetap tidak aktif. Mount hanya filesystem penyimpanan luar, sebaiknya dalam mode read-only, agar file segmen pendukungnya dapat disalin secara konsisten.

## 1. Temukan Sumber dan Tujuan

Tampilkan filesystem dan mount point:

```bash
lsblk -f
findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS
```

Tentukan path untuk direktori `changes` sumber dan direktori recovery terpisah di perangkat dengan ruang kosong yang cukup:

```bash
SOURCE_CHANGES="/media/user/SOURCE/minios/changes"
TARGET_MINIOS="/media/user/TARGET/minios"
RECOVERY="$TARGET_MINIOS/recovery-changes"
```

Pastikan tujuan memiliki ruang kosong yang cukup:

```bash
du -sh "$SOURCE_CHANGES"
df -h "$TARGET_MINIOS"
```

## 2. Salin Semua File Sesi

Gunakan `rsync` jika tersedia:

```bash
mkdir -p "$RECOVERY"
rsync -aH --sparse --info=progress2 "$SOURCE_CHANGES/" "$RECOVERY/"
sync
```

Atau alternatifnya:

```bash
mkdir -p "$RECOVERY"
cp -a "$SOURCE_CHANGES/." "$RECOVERY/"
sync
```

Jangan hanya menyalin file utama `changes.dat`. Sesi DynFileFS biasanya berisi urutan lengkap:

```text
changes.dat
changes.dat.0
changes.dat.1
changes.dat.2
...
```

Semua segmen merupakan bagian dari satu container.

## 3. Identifikasi Sesi Penyimpanan

Bandingkan ukuran sesi dan tanggal modifikasi:

```bash
du -sh "$RECOVERY"/[0-9]* 2>/dev/null
ls -ld --time-style=long-iso "$RECOVERY"/[0-9]* 2>/dev/null
ls -lah "$RECOVERY"/[0-9]*/changes.dat* 2>/dev/null
```

Sesi yang kosong atau gagal biasanya berukuran kecil. Sesi yang berisi data persisten biasanya memakan ruang lebih besar.

Periksa metadata sesi yang tersimpan:

```bash
cat "$RECOVERY/session.conf" 2>/dev/null
```

MiniOS menggunakan `session.conf` untuk memilih dan mendeskripsikan sesi persistensi.

## 4. Mount Kontainer DynFileFS atau dynblk

Temukan helper yang telah terpasang. Bergantung pada image MiniOS, nama kanoniknya bisa `dynblk` atau nama kompatibilitas `@mount.dynfilefs`:

```bash
DYN=""
for candidate in \
    /run/initramfs/bin/dynblk \
    /run/initramfs/bin/@mount.dynfilefs \
    /bin/dynblk \
    /bin/@mount.dynfilefs; do
    if [ -x "$candidate" ]; then
        DYN="$candidate"
        break
    fi
done

[ -n "$DYN" ] || { echo "DynFileFS/dynblk helper not found" >&2; exit 1; }

E2FSCK=/run/initramfs/bin/e2fsck
[ -x "$E2FSCK" ] || E2FSCK=$(command -v e2fsck)

ls -l "$DYN" "$E2FSCK"
```

Pilih sesi kandidat, misalnya sesi 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Jangan tentukan `-s` atau `perchsize` selama proses mount pemulihan manual ini. Jalur boot normal mungkin meneruskan `-s` untuk ukuran logis yang diminta atau tercatat, namun pemulihan secara sengaja menghindari permintaan resize dan membaca ukuran yang ada dari metadata DynFileFS/dynblk.

Mount yang berhasil akan menampilkan `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Periksa filesystem ext4-nya tanpa melakukan perubahan:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Kemudian mount dalam mode read-only:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Jika file yang diharapkan terlihat, sesi dapat dipulihkan.

Unmount secara berurutan dari belakang:

```bash
umount /tmp/old-session
fusermount -u /tmp/dynfilefs-recovery
```

## 5. Perbaiki Filesystem Internal

Jika container berhasil di-mount tetapi `e2fsck -n` melaporkan error ext4, buat salinan sesi tersebut terlebih dahulu:

```bash
cp -a "$RECOVERY/$SESSION" "$RECOVERY/${SESSION}-repair"
REPAIR="$RECOVERY/${SESSION}-repair"
```

Mount dan perbaiki hanya salinan ini:

```bash
mkdir -p /tmp/dynfilefs-repair

"$DYN" \
    -f "$REPAIR/changes.dat" \
    -m /tmp/dynfilefs-repair \
    -p 4000

"$E2FSCK" -f -y /tmp/dynfilefs-repair/virtual.dat
fusermount -u /tmp/dynfilefs-repair
```

Ulangi pengecekan read-only dari bagian sebelumnya setelah perbaikan dilakukan.

## 6. Pulihkan ke Sesi Baru yang Kompatibel

Lebih disarankan melakukan pemulihan ke sesi baru yang dibuat daripada merekonstruksi metadata untuk sesi yang rusak. Jika terdapat ekspor `.tar.zst` yang valid, boot secara normal dan impor dengan konversi otomatis untuk filesystem tujuan:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Impor akan membuat sesi baru dengan nomor berbeda. Periksa, lalu aktifkan secara eksplisit.

Jika hanya kontainer yang ter-mount yang dapat digunakan, buat dan boot sesi baru dalam mode yang kompatibel dengan filesystem tujuan. Mount salinan hasil pemulihan dalam mode read-only seperti pada bagian 4, lalu salin file yang diperlukan ke sesi yang sedang berjalan tersebut. Misalnya, untuk memulihkan direktori home:

```bash
sudo rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    /home/
sync
```

Salin hanya data dan konfigurasi yang diperlukan. Ini menghindari perlakuan metadata kompatibilitas yang tidak dikenal atau tidak lengkap sebagai definisi sesi bootable.

## 7. Jangan Rekonstruksi Metadata Sesi di Tempat

Jangan mengganti `session.conf` dengan file minimal atau menambah direktori hasil pemulihan ke store yang sudah ada secara manual. Metadata mendeskripsikan setiap sesi dalam store tersebut; menggantinya dapat membuat sesi sehat menjadi yatim, menghapus field kompatibilitas dan kebijakan penyimpanan, serta mengubah pemilihan boot berikutnya.

Jika kontainer bisa di-mount dalam mode read-only, pulihkan file-file-nya ke sesi baru yang kompatibel seperti dijelaskan di atas. Jika tidak bisa di-mount, simpan salinan offline lengkap untuk pemulihan filesystem atau forensik lebih lanjut. Kontainer tanpa metadata store yang dapat dipercaya adalah input yang dapat dipulihkan, bukan definisi sesi bootable.

## Referensi Error

- `cannot open ... changes.dat.N`: segmen yang sudah dikomit hilang. Salin ulang dari perangkat sumber atau coba sesi lain. Jangan membuat segmen kosong.
- `cannot read header`: header DynFileFS/dynblk rusak.
- `incompatible data format`: helper dan format kontainer tidak cocok.
- `virtual.dat` ada tapi ext4 tidak bisa di-mount: periksa salinan dengan `e2fsck`.

## Mencegah Terulang Kembali

Kebanyakan insiden terjadi saat perangkat persistensi penuh selama penggunaan. Kurangi risiko dengan langkah-langkah berikut:

- Sisakan cadangan ruang kosong dengan parameter boot `perchreserve` (default 256 MiB). Kontainer baru dan yang bertambah besar tidak akan menggunakan cadangan ini, dan MiniOS akan memberi peringatan saat ruang kosong turun ke cadangan. Tingkatkan cadangan pada perangkat yang kecil atau sering digunakan, misalnya `perchreserve=1024`.
- Hapus sesi lama atau yang tidak digunakan sebelum perangkat menjadi penuh.
- Lebih baik gunakan sesi `raw` dengan ukuran tetap jika Anda membutuhkan penggunaan disk yang dapat diprediksi, sehingga pertumbuhan tidak akan menghabiskan perangkat secara tak terduga.
- Matikan perangkat dengan benar. Pemadaman listrik mendadak saat perangkat penuh adalah penyebab paling umum kontainer yang kemudian tidak dapat di-mount.
