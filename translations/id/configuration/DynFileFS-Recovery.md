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

1. Jangan memperbaiki satu-satunya salinan container penyimpanan.
2. Jangan menyalin sesi sumber ke `minios/changes` yang sedang aktif.
3. Salin seluruh direktori `changes` sebelum mencoba pemulihan.
4. Jalankan `e2fsck -y` hanya pada salinan tambahan dari sebuah sesi.
5. Jangan membuat file `changes.dat.N` yang hilang secara manual.

Jika MiniOS sedang berjalan dengan persistensi dan perangkat sumber sudah di-mount, aman untuk membuat salinan awal. Jangan mengganti `session.conf` sampai MiniOS sudah boot tanpa persistensi.

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

## 4. Mount Container DynFileFS atau dynblk

Temukan helper yang terpasang. Tergantung pada image MiniOS, nama kanoniknya bisa `dynblk` atau nama kompatibilitas `@mount.dynfilefs`:

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

Pilih salah satu sesi kandidat, misalnya sesi 3:

```bash
SESSION=3
mkdir -p /tmp/dynfilefs-recovery /tmp/old-session

"$DYN" \
    -f "$RECOVERY/$SESSION/changes.dat" \
    -m /tmp/dynfilefs-recovery \
    -p 4000
```

Jangan tentukan `-s` atau `perchsize` saat memulihkan container yang sudah ada. Ukuran virtualnya sudah tersimpan di metadata DynFileFS/dynblk.

Mount yang berhasil akan menampilkan `virtual.dat`:

```bash
ls -lh /tmp/dynfilefs-recovery/virtual.dat
```

Periksa filesystem ext4 tanpa melakukan perubahan:

```bash
"$E2FSCK" -f -n /tmp/dynfilefs-recovery/virtual.dat
```

Kemudian mount sebagai read-only:

```bash
mount -o ro,loop /tmp/dynfilefs-recovery/virtual.dat /tmp/old-session
ls -la /tmp/old-session
ls -la /tmp/old-session/home
```

Jika file yang diharapkan terlihat, sesi dapat dipulihkan.

Unmount secara urut terbalik:

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

## 6. Pulihkan Sesi untuk Boot

Lakukan langkah ini setelah mematikan sesi persisten dan boot MiniOS tanpa `perch`, `perchdir`, atau `perchmode`. Langkah ini juga bisa dilakukan dari sistem Linux lain.

Salin container yang sudah dipulihkan ke dalam direktori sesi bernomor yang belum terpakai. Menggunakan nomor baru mencegah penimpaan sesi yang sedang aktif:

```bash
NEW_CHANGES="$TARGET_MINIOS/changes"
RESTORED=90

test ! -e "$NEW_CHANGES/$RESTORED"
mkdir -p "$NEW_CHANGES/$RESTORED"
cp -a "$REPAIR/." "$NEW_CHANGES/$RESTORED/"
```

Jika tidak diperlukan perbaikan filesystem, salin dari `$RECOVERY/$SESSION` sebagai pengganti `$REPAIR`.

Backup dan ganti metadata sesi:

```bash
cp -a "$NEW_CHANGES/session.conf" \
    "$NEW_CHANGES/session.conf.before-recovery" 2>/dev/null || true

printf '%s\n' \
    "default=$RESTORED" \
    "session_mode[$RESTORED]=dynfilefs" \
    >"$NEW_CHANGES/session.conf"
sync
```

Metadata minimal sengaja tidak mencantumkan versi, edisi, dan field union agar data kompatibilitas lama tidak memaksa MiniOS membuat sesi baru.

Boot MiniOS dengan:

```text
perchdir=resume perchmode=dynfilefs
```

Jangan tambahkan `perchdir=new` atau `perchsize` pada boot recovery pertama ini.

## 7. Pulihkan File Tanpa Boot ke Sesi

Jika container bisa di-mount secara manual namun tidak dapat digunakan sebagai sesi boot, salin file penting dari hasil mount read-only ke sesi kerja baru:

```bash
mkdir -p "$TARGET_MINIOS/recovered-home"
rsync -aHAX --info=progress2 \
    /tmp/old-session/home/ \
    "$TARGET_MINIOS/recovered-home/"
sync
```

## Referensi Error

- `cannot open ... changes.dat.N`: segmen yang telah dikomit hilang. Salin ulang dari perangkat sumber atau coba sesi lain. Jangan membuat segmen kosong.
- `cannot read header`: header DynFileFS/dynblk rusak.
- `incompatible data format`: helper dan format container tidak cocok.
- `virtual.dat` ada tetapi ext4 tidak bisa di-mount: periksa salinannya dengan `e2fsck`.
- Container berhasil di-mount tapi MiniOS membuat sesi baru: pastikan `session.conf` mengarah ke nomor yang dipulihkan dan berisi `session_mode[N]=dynfilefs`.

## Mencegah Terulangnya Masalah

Sebagian besar insiden terjadi saat perangkat persistensi penuh saat digunakan. Kurangi risiko dengan langkah-langkah berikut:

- Sisakan ruang bebas dengan parameter boot `perchreserve` (default 256 MB). Container baru dan yang bertambah besar tidak akan menggunakannya, dan MiniOS akan memberi peringatan saat ruang bebas turun ke batas reserve. Tingkatkan nilainya pada perangkat kecil atau yang sering dipakai, misalnya `perchreserve=1024`.
- Hapus sesi lama atau tidak terpakai sebelum perangkat menjadi penuh.
- Gunakan sesi `raw` berukuran tetap jika Anda membutuhkan penggunaan disk yang dapat diprediksi, sehingga pertumbuhan tidak akan menghabiskan perangkat secara tiba-tiba.
- Matikan perangkat dengan benar. Pemadaman listrik mendadak saat perangkat penuh adalah penyebab paling umum container yang kemudian tidak bisa di-mount.
