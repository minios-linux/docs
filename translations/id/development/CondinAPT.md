---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT memilih dan memasang paket APT dari daftar yang entri-entrinya dapat bergantung pada variabel konfigurasi Bash. MiniOS menggunakannya untuk pemeriksaan prasyarat host, set paket inti, dan modul SquashFS biasa.

Halaman ini mendokumentasikan implementasi di `linux-live/condinapt`. CondinAPT bukanlah pemecah dependensi umum: ia mengevaluasi filter dan ketersediaan repositori terlebih dahulu, membangun antrean APT, lalu memasang setiap antrean terpilih dalam satu pemanggilan `apt-get`.

## Sinopsis

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

Daftar paket dan konfigurasi harus berupa file reguler yang dapat dibaca. File mapping dan prioritas bersifat opsional.

| Opsi | Makna |
| --- | --- |
| `-l`, `--package-list PATH` | File daftar paket |
| `-c`, `--config PATH` | Konfigurasi Bash tepercaya |
| `-m`, `--filter-mapping PATH` | Mapping prefix ke variabel |
| `-P`, `--priority-list PATH` | Ekspresi reguler Bash untuk ekstraksi prioritas |
| `-s`, `--simulation` | Memilih dan menampilkan paket tanpa memasangnya |
| `-C`, `--check-only` | Memeriksa nama paket terpasang tanpa instalasi |
| `-v`, `--verbose` | Diagnostik filter dan antrean |
| `-vv`, `--very-verbose` | Diagnostik tambahan antrean prioritas |
| `-x`, `--xtrace` | Aktifkan pelacakan shell |
| `-f`, `--force` | Jalankan `apt-get update` bahkan jika `pkgcache.bin` ada |
| `-h`, `--help` | Tampilkan bantuan |

CondinAPT menjalankan `apt-get update` saat tidak dalam mode check-only dan baik `-f` digunakan atau `/var/cache/apt/pkgcache.bin` tidak ada. Ini termasuk simulasi, jadi `-s` bukanlah dry run tanpa efek samping.

Instalasi normal memerlukan akses root. Check-only dapat dijalankan tanpa hak istimewa; simulasi juga membutuhkan root jika memicu pembaruan APT. Implementasi saat ini tidak selalu meneruskan kegagalan `apt-get update` dengan andal, jadi anggaplah kesalahan update sebagai kegagalan meskipun CondinAPT nantinya mengembalikan `0`.

## Berkas input

### Konfigurasi

File `-c` akan di-source dengan Bash. Ini adalah kode yang dapat dieksekusi, bukan format data pasif, jadi gunakan hanya file yang tepercaya.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Array terindeks menyediakan filter keanggotaan. Sebuah variabel skalar yang berisi koma tetap dianggap satu string persis: `FEATURES="web,database"` tidak cocok dengan `+feat=web`.

Implementasi saat ini mem-parsing opsi CLI sebelum melakukan sourcing file ini.
Variabel konfigurasi yang menggunakan kembali nama internal CondinAPT, seperti `VERBOSITY_LEVEL`, dapat menimpa status CLI. Hindari penggunaan nama tersebut dalam konfigurasi generik.

### Pemetaan filter

File `-m` opsional memetakan prefix pendek ke nama variabel Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Formatnya persis `prefix=VariableName`; spasi di sekitar tidak akan dipangkas. Baris kosong dan baris yang field pertamanya dimulai dengan `#` akan diabaikan.
Prefix duplikat menggunakan nilai terakhir.

Tanpa entri mapping, prefix itu sendiri dianggap sebagai nama variabel. Skalar yang tidak di-set akan dianggap sebagai string kosong. Salah ketik pada filter negatif dapat secara diam-diam menyertakan paket, jadi lebih baik gunakan mapping dan aktifkan simulasi verbose saat menambah filter.

### Daftar paket

Tata bahasa baris yang aman adalah:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Contoh:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Semua yang dimulai dari `#` pertama hingga akhir baris akan dihapus. Spasi yang tersisa akan dinormalisasi. Tidak didukung pengutipan, escape, tanda kurung, grup bertingkat, dan spasi di dalam satu token filter. Token tidak dikenal di akhir baris tidak akan ditolak, jadi perlakukan tata bahasa di atas sebagai batasan, bukan mengandalkan parsing yang permisif.

Gunakan satu target rilis per baris fisik dan letakkan di akhir. CondinAPT mengekstrak target sebelum mengevaluasi alternatif paket, jadi nilai `@release` yang berbeda tidak dapat diberikan ke alternatif di baris yang sama.

## Filter

Filter membandingkan nilai konfigurasi menggunakan persamaan string yang persis dan peka huruf besar-kecil. Jika variabel yang dipetakan adalah array terindeks, kecocokan dengan salah satu elemen array dianggap lolos. Array asosiatif bukanlah set keanggotaan.

| Bentuk | Efek |
| --- | --- |
| `+x=value` | Hanya sertakan jika `x` cocok |
| `-x=value` | Kecualikan jika `x` cocok |
| `+{a|b}` | Setidaknya satu anggota harus cocok |
| `+{a&b}` | Semua anggota harus cocok |
| `-{a|b}` | Kecualikan jika ada anggota yang cocok |
| `-{a&b}` | Kecualikan hanya jika semua anggota cocok |

Filter positif sederhana yang diulang dengan prefix yang sama adalah alternatif:

```text
audacity +pv=toolbox +pv=ultra
```

Filter positif dengan prefix berbeda semuanya harus lolos. Setiap filter negatif sederhana adalah veto independen:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Anggota grup harus menggunakan satu jenis operator saja. Jangan mencampur `|` dan `&` dalam satu grup; tidak ada prioritas atau penempatan di dalam grup. Ekspresikan "kecualikan Flux, atau minimum Xfce" sebagai dua filter:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternatif dan konjungsi

`&&` memiliki prioritas lebih tinggi daripada `||`. CondinAPT membagi alternatif terlebih dahulu lalu mengevaluasi setiap anggota konjungsi, sehingga:

```text
A || B && C
```

berarti `A || (B && C)`.

CondinAPT memilih alternatif pertama yang semua filter dan pemeriksaan ketersediaan paketnya lolos. Jika satu anggota konjungsi gagal, paket yang sudah dipilih dari konjungsi itu akan dibatalkan dan alternatif berikutnya dievaluasi.

Ini adalah seleksi preflight, bukan percobaan instalasi ulang atau transaksi. Jika kemudian antrean `apt-get install` gagal untuk alternatif yang dipilih, CondinAPT tidak kembali ke cabang `||` berikutnya.

Setiap alternatif harus mengulang filternya sendiri:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Paket wajib

`!` hanya dikenali di awal ekspresi fisik lengkap dan berlaku untuk semua alternatifnya:

```text
!preferred-package || fallback-package
```

Ekspresi ini bersifat fatal pada mode normal hanya jika tidak ada alternatif yang berhasil dan paket aktif atau versi ketat tidak tersedia. Filter dapat menonaktifkan baris wajib tanpa kegagalan. Kegagalan instalasi APT normal akan membatalkan antrean terlepas dari `!`.

Pada simulasi, kesalahan ketersediaan wajib akan dilaporkan tetapi tidak menghentikan pemrosesan antrean; simulasi tetap berakhir dengan status nonzero yang telah didokumentasikan.

## Versi

| Sintaks | Perilaku |
| --- | --- |
| `package=VERSION` | Lebih mengutamakan versi persis; fallback ke kandidat tanpa versi |
| `package==VERSION` | Hanya menerima versi repositori yang persis |

Ketersediaan persis dicocokkan dengan field versi lengkap dari `apt-cache madison`. Jika versi ketat yang tidak wajib tidak tersedia, kondisi itu gagal; alternatif `||` berikutnya masih bisa lolos, jika tidak baris tersebut dilewati. Awali ekspresi dengan `!` untuk membuat kegagalan ketersediaan aktif menjadi fatal.

Saat CondinAPT memasang versi yang diminta secara persis, ia menjadwalkan `apt-mark hold` setelah seluruh antrean APT berhasil. Versi yang sudah terpasang dan sesuai dianggap sudah terpenuhi dan tidak akan di-hold ulang. Kegagalan hold tidak diteruskan sebagai status keluar CondinAPT.

Untuk paket terpasang tanpa versi, CondinAPT membandingkan versi terpasang dengan kandidat dari repositori. Jika kandidat berbeda, akan diantrekan ulang; APT dipanggil dengan `--allow-downgrades`.

## Antrean

`---` mengakhiri antrean normal saat ini. Setiap paket terpilih dalam antrean akan diteruskan ke satu pemanggilan `apt-get install` noninteraktif dengan `--force-confdef`, `--force-confold`, `--allow-downgrades`, dan `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Baris dengan target rilis dihapus dari alur antrean normal dan dikelompokkan secara global berdasarkan rilis. Baris untuk rilis yang sama akan digabungkan meskipun dipisahkan oleh `---`.
Urutan eksekusi efektif adalah:

1. Antrean prioritas non-target.
2. Antrean prioritas target-release.
3. Antrean normal sesuai urutan sumber.
4. Sisa antrean target-release berdasarkan urutan rilis pertama kali ditemukan.

Akibatnya, baris target yang ditulis di antara dua baris normal tidak menjadi pemisah, dan antrean target dijalankan setelah semua antrean normal kecuali diekstraksi sebagai pekerjaan prioritas.

Pemeriksaan ketersediaan repositori preflight tidak memperhatikan target; hanya `apt-get install` terakhir yang menerima `-t RELEASE`. Pastikan paket target sudah sesuai dengan repositori yang dikonfigurasi.

## Daftar prioritas

`-P` membaca satu ekspresi reguler Bash per baris. Pola akan dicocokkan dengan nama paket pertama di setiap ekspresi daftar paket. Jika cocok, seluruh ekspresi, termasuk filter, alternatif, status wajib, dan target rilis, akan dipindahkan ke antrean prioritas.

```text
^dkms$
^linux-.*
```

Pola tidak di-anchor kecuali mengandung anchor. Mencocokkan paket `&&` atau `||` berikutnya tidak berpengaruh; hanya token paket pertama yang diperiksa. Ekstraksi prioritas juga menggabungkan kecocokan dari antrean normal terpisah, jadi jangan gunakan fitur ini untuk entri yang membutuhkan batas `---` asli untuk staging dependensi.

Prioritas berarti evaluasi dan instalasi lebih awal, bukan jaminan instalasi. Filter dan pemeriksaan ketersediaan tetap berlaku.

## Mode operasi dan status keluar

### Simulasi

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

Simulasi mengevaluasi filter, versi, alternatif, dan antrean, lalu mencetak paket yang akan diteruskan ke APT. Ini tidak menjamin bahwa instalasi nantinya akan berhasil. Simulasi yang valid sengaja keluar dengan status `1`, bahkan saat pemilihan paket berhasil.

### Hanya-periksa

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

Hanya-periksa mengevaluasi filter dan operator tapi hanya memeriksa apakah nama paket sudah terpasang melalui `dpkg-query`. Ini tidak memvalidasi versi yang diminta, kandidat repositori, atau target rilis. Akan mengembalikan `0` jika setiap ekspresi aktif terpenuhi dan `1` jika tidak.

Perintah `sudo apt install ...` yang dicetak hanya diagnostik kasar. Ia menghilangkan versi dan target rilis, dapat mencakup beberapa alternatif gagal, dan tidak dijamin mereproduksi ekspresi asli.

### Ringkasan status

| Kasus | Status |
| --- | --- |
| Bantuan | `0` |
| Berhasil dijalankan normal | `0` |
| Input tidak valid, kegagalan ketersediaan wajib, atau kegagalan antrean APT | `1` |
| Simulasi valid | `1` |
| Hanya-periksa dengan paket aktif yang hilang | `1` |

## Penanganan paket khusus

Implementasi memiliki satu nama paket khusus: `qemu-kvm`. Nama ini diterima jika `apt-cache show qemu-kvm` melaporkannya sebagai paket virtual murni. Paket virtual lain tidak memiliki resolusi penyedia generik. Sebaiknya gunakan alternatif penyedia eksplisit jika portabilitas penting.

## Integrasi MiniOS

### Pemanggilan modul

Untuk modul biasa, `build-modules` menyalin skrip instalasi ke `/install`, CondinAPT ke `/condinapt`, konfigurasi yang dihasilkan ke `/minios_build.conf`, dan peta ke `/condinapt.map`. Skrip instalasi konvensional adalah:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Gunakan `SCRIPT_DIR`; `$CWD` bukan bagian dari kontrak modul biasa.
`00-core` adalah tahap build khusus yang lebih awal dan memanggil salinan source-tree di bawah `/linux-live` sebagai gantinya.

Builder modul biasa saat ini hanya otomatis menyalin file bernama `packages.list`. Modul yang menggunakan nama file daftar tambahan harus mengatur input tersebut secara eksplisit; jangan mengasumsikan setiap file di samping `install` akan muncul di root chroot.

### Peta filter MiniOS

`linux-live/condinapt.map` saat ini mendefinisikan:

| Prefix | Variabel | Makna |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Target suite |
| `da` | `DISTRIBUTION_ARCH` | Target arsitektur |
| `dp` | `DISTRIBUTION_PROFILE` | Keluarga paket `debian` atau `ubuntu` |
| `is` | `INIT_SYSTEM` | Sistem init terpilih |
| `de` | `DESKTOP_ENVIRONMENT` | Lingkungan modul |
| `pv` | `PACKAGE_VARIANT` | Varian paket |
| `ik` | `INSTALL_KERNEL` | Toggle instalasi kernel |
| `kf` | `KERNEL_FLAVOUR` | Flavour kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` atau `minios` |
| `ks` | `KERNEL_SERIES` | Seri kernel aktual selama seleksi DKMS `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Array kapabilitas terdeteksi selama seleksi DKMS `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Toggle build DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementasi initramfs |
| `lo` | `LOCALE` | Lokal sistem |
| `ml` | `MULTILINGUAL` | Toggle multibahasa |
| `kl` | `KEEP_LOCALES` | Toggle retensi lokal |

`ks` dan `kc` adalah filter `01-kernel` khusus. Ketika build DKMS diaktifkan, modul tersebut mendeteksi `KERNEL_SERIES` dari kernel yang terpasang dan membuat array `KERNEL_CAPABILITIES` terindeks dalam konfigurasi sementara yang digunakan untuk seleksi paket DKMS. Keduanya tidak ada di konfigurasi modul biasa; menggunakannya di sana membuat filter positif gagal dan filter negatif bisa lolos.
`KERNEL_SERIES` bukan preferensi `MINIOS_KERNEL_SERIES`. Kapabilitas terdeteksi saat ini meliputi `aufs`, `ntfs3`, `btf_modules`, dan driver `rtw88_*` in-tree yang didukung.

Contoh dari daftar paket kernel saat ini:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Pemecahan masalah

Gunakan simulasi verbose untuk memeriksa seleksi:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Jangan gunakan `/dev/stdin`; `-l` memerlukan file reguler.

- Jika filter tidak terduga lolos, periksa mapping prefix, tipe variabel, huruf besar-kecil, dan nilainya secara persis. Cek apakah variabel tidak di-set atau salah ketik.
- Jika fallback tidak terpilih, ingat bahwa fallback terjadi saat preflight, bukan setelah kegagalan APT pada antrean.
- Jika paket target gagal, periksa sumber yang dikonfigurasi dan jalankan `apt-cache policy PACKAGE`; preflight tidak menerapkan `-t RELEASE`.
- Jika versi ketat dilewati, bandingkan field versi persis dengan `apt-cache madison PACKAGE`.
- Jika urutan antrean mengejutkan, perhitungkan pengelompokan target global dan ekstraksi prioritas sebelum antrean normal.

Untuk alur kerja build yang lebih luas, lihat [Membangun MiniOS](/development/Building-MiniOS).
