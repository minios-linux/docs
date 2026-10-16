---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# CondinAPT

CondinAPT memilih dan menginstal paket APT dari daftar yang entrinya dapat bergantung pada variabel konfigurasi Bash. MiniOS menggunakannya untuk memeriksa prasyarat host, kumpulan paket inti, dan modul SquashFS biasa.

Halaman ini mendokumentasikan implementasi di `linux-live/condinapt`. CondinAPT bukan solver dependensi umum: fitur ini mengevaluasi filter dan ketersediaan repositori terlebih dahulu, menyusun antrean APT, lalu menginstal setiap antrean yang dipilih dalam satu `apt-get` panggilan.

## Ringkasan

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

Daftar paket dan konfigurasi harus berupa file reguler yang dapat dibaca. File pemetaan dan prioritas bersifat opsional.

| Opsi | Arti |
| --- | --- |
| `-l`, `--package-list PATH` | File daftar paket |
| `-c`, `--config PATH` | Konfigurasi Bash tepercaya |
| `-m`, `--filter-mapping PATH` | Pemetaan prefiks ke variabel |
| `-P`, `--priority-list PATH` | Ekspresi reguler Bash untuk mengambil prioritas |
| `-s`, `--simulation` | Pilih dan tampilkan paket tanpa menginstalnya |
| `-C`, `--check-only` | Periksa nama paket yang terinstal tanpa melakukan instalasi |
| `-v`, `--verbose` | Diagnostik filter dan antrean |
| `-vv`, `--very-verbose` | Diagnostik antrean prioritas tambahan |
| `-x`, `--xtrace` | Aktifkan pelacakan shell |
| `-f`, `--force` | Jalankan `apt-get update` meskipun `pkgcache.bin` ada |
| `-h`, `--help` | Tampilkan bantuan |

CondinAPT menjalankan `apt-get update` saat tidak dalam mode hanya-periksa dan jika `-f` digunakan atau `/var/cache/apt/pkgcache.bin` tidak ada. Ini juga berlaku untuk simulasi, jadi `-s` bukan uji coba tanpa efek samping.

Instalasi normal memerlukan akses root. Mode hanya-periksa dapat dijalankan tanpa hak istimewa; simulasi juga memerlukan akses root jika memicu pembaruan APT. Implementasi saat ini tidak meneruskan kegagalan `apt-get update` dengan andal, jadi anggap kesalahan pembaruan sebagai kegagalan proses meskipun CondinAPT kemudian mengembalikan `0`.

## File input

### Konfigurasi

File `-c` dimuat menggunakan Bash. File ini adalah kode yang dapat dieksekusi, bukan format data pasif, jadi gunakan hanya file tepercaya.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Array terindeks menyediakan filter keanggotaan. Skalar yang berisi koma tetap dianggap sebagai satu string persis: `FEATURES="web,database"` tidak cocok dengan `+feat=web`.

Implementasi saat ini mengurai opsi CLI sebelum memuat file ini.
Variabel konfigurasi yang menggunakan kembali nama internal CondinAPT, seperti `VERBOSITY_LEVEL`, dapat menimpa status CLI. Hindari nama seperti itu dalam konfigurasi umum.

### Pemetaan filter

Opsional `-m` memetakan prefiks singkat ke nama variabel Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

Formatnya harus persis `prefix=VariableName`; spasi di awal atau akhir tidak akan dihapus. Baris kosong dan baris yang kolom pertamanya diawali dengan `#` akan diabaikan.
Jika ada prefiks duplikat, nilai terakhir yang digunakan.

Jika tidak ada entri pemetaan, prefiks itu sendiri dianggap sebagai nama variabel. Skalar yang tidak disetel akan dianggap sebagai string kosong. Filter negatif yang salah ketik dapat membuat paket tetap disertakan tanpa diketahui, jadi sebaiknya gunakan pemetaan dan simulasi verbose saat menambahkan filter.

### Daftar paket

Sintaks baris yang aman:

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

Semua teks mulai dari `#` pertama hingga akhir baris akan dihapus. Spasi yang tersisa akan dinormalisasi. Tanda kutip, escape, tanda kurung, grup bertingkat, dan spasi di dalam satu token filter tidak didukung. Token tambahan yang tidak dikenal di akhir baris tidak akan ditolak, jadi anggap sintaks di atas sebagai batasan, bukan mengandalkan parsing yang permisif.

Gunakan satu target rilis pada tiap baris fisik dan letakkan di akhir. CondinAPT mengekstrak target sebelum mengevaluasi alternatif paket, sehingga nilai `@release` yang berbeda tidak dapat ditetapkan ke alternatif pada baris yang sama.

## Filter

Filter membandingkan nilai konfigurasi menggunakan kecocokan string yang persis dan peka huruf besar-kecil. Jika variabel yang dipetakan adalah array berindeks, filter lolos jika nilainya cocok dengan salah satu elemen array. Array asosiatif bukanlah set keanggotaan.

| Format | Efek |
| --- | --- |
| `+x=value` | Sertakan hanya jika `x` cocok |
| `-x=value` | Kecualikan jika `x` cocok |
| `+{a|b}` | Require at least one member to match |
| `+{a&b}` | Wajibkan semua anggota cocok |
| `-{a|b}` | Exclude when any member matches |
| `-{a&b}` | Kecualikan hanya jika semua anggota cocok |

Filter positif sederhana yang diulang dengan prefiks sama merupakan alternatif:

```text
audacity +pv=toolbox +pv=ultra
```

Semua filter positif dengan prefiks berbeda harus lolos. Setiap filter negatif sederhana merupakan veto tersendiri:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Anggota grup hanya boleh menggunakan satu jenis operator. Jangan gabungkan `|` dan `&` dalam satu grup; tidak ada prioritas operator atau pengelompokan bertingkat di dalam grup. Untuk menyatakan "kecualikan Flux, atau minimum Xfce", gunakan dua filter:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternatif dan konjungsi

`&&` memiliki prioritas lebih tinggi daripada `||`. CondinAPT memisahkan alternatif terlebih dahulu, lalu mengevaluasi setiap anggota konjungsi, sehingga:

```text
A || B && C
```

berarti `A || (B && C)`.

CondinAPT memilih alternatif pertama yang semua filternya lolos dan semua paketnya tersedia. Jika salah satu anggota konjungsi gagal, paket yang sudah dipilih dari konjungsi tersebut akan dibatalkan, lalu alternatif berikutnya dievaluasi.

Ini adalah pemilihan sebelum proses, bukan percobaan ulang instalasi atau transaksi. Jika `apt-get install` pada tingkat antrean yang berjalan kemudian gagal untuk alternatif terpilih, CondinAPT tidak akan beralih ke cabang `||` berikutnya.

Setiap alternatif harus mencantumkan ulang filternya sendiri:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Paket wajib

`!` hanya dikenali di awal ekspresi fisik lengkap dan berlaku untuk semua alternatifnya:

```text
!preferred-package || fallback-package
```

Dalam mode normal, ekspresi akan menyebabkan kegagalan hanya jika tidak ada alternatif yang berhasil dan paket aktif atau versi strict tidak tersedia. Filter dapat menonaktifkan baris wajib tanpa menyebabkan kegagalan. Kegagalan instalasi APT normal akan menghentikan antreannya, terlepas dari `!`.

Dalam simulasi, error ketersediaan paket wajib dilaporkan, tetapi tidak menghentikan pemrosesan antrean; simulasi tetap berakhir dengan status nonzero sebagaimana didokumentasikan.

## Versi

| Sintaks | Perilaku |
| --- | --- |
| `package=VERSION` | Utamakan versi yang persis sama; jika tidak tersedia, gunakan kandidat tanpa versi |
| `package==VERSION` | Hanya terima versi repositori yang persis sama |

Ketersediaan versi yang persis sama dicocokkan dengan seluruh kolom versi dari `apt-cache madison`. Jika versi strict nonwajib tidak tersedia, kondisi tersebut gagal; alternatif `||` berikutnya masih dapat berhasil, jika tidak, baris akan dilewati. Awali ekspresi dengan `!` agar kegagalan ketersediaan aktif menyebabkan kegagalan.

Jika CondinAPT menginstal versi yang diminta secara persis, sistem akan menjadwalkan `apt-mark hold` setelah seluruh antrean APT berhasil diproses. Versi persis yang sudah terinstal dianggap terpenuhi dan tidak akan ditahan lagi. Kegagalan penahanan tidak diteruskan sebagai status keluar CondinAPT.

Untuk paket tanpa versi yang sudah terinstal, CondinAPT membandingkan versi terinstal dengan kandidat repositori. Jika berbeda, kandidat akan dimasukkan kembali ke antrean; APT dipanggil dengan `--allow-downgrades`.

## Antrean

`---` mengakhiri antrean normal saat ini. Semua paket terpilih dalam satu antrean diteruskan dalam satu pemanggilan `apt-get install` noninteraktif dengan `--force-confdef`, `--force-confold`, `--allow-downgrades`, dan `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Baris yang menargetkan rilis dikeluarkan dari alur antrean normal dan dikelompokkan secara global berdasarkan rilis. Baris untuk rilis yang sama digabungkan meskipun dipisahkan oleh `---`.
Urutan eksekusi yang berlaku:

1. Antrean prioritas non-target.
2. Antrean target-rilis prioritas.
3. Antrean normal sesuai urutan sumber.
4. Antrean target-rilis lainnya sesuai urutan pertama kali munculnya rilis.

Karena itu, baris target yang ditulis di antara dua baris normal tidak menjadi pemisah, dan antrean target dijalankan setelah semua antrean normal, kecuali jika diekstrak sebagai pekerjaan prioritas.

Pemeriksaan awal ketersediaan repositori tidak memperhitungkan target; hanya `apt-get install` akhir yang menerima `-t RELEASE`. Pastikan paket target tersedia di repositori yang dikonfigurasi.

## Daftar prioritas

`-P` membaca satu ekspresi reguler extended Bash per baris. Pola dicocokkan dengan nama paket pertama dalam setiap ekspresi daftar paket. Jika cocok, seluruh ekspresi—termasuk filter, alternatif, status wajib, dan target rilis—dipindahkan ke antrean prioritas.

```text
^dkms$
^linux-.*
```

Pola tidak ditambatkan ke awal atau akhir kecuali menyertakan anchor. Mencocokkan paket `&&` atau `||` berikutnya tidak berpengaruh; hanya token paket pertama yang diperiksa. Ekstraksi prioritas juga menggabungkan kecocokan dari antrean normal yang terpisah, jadi jangan gunakan untuk entri yang memerlukan batas `---` aslinya untuk pengaturan dependensi bertahap.

Prioritas berarti evaluasi dan instalasi dilakukan lebih awal, bukan jaminan bahwa paket akan diinstal. Filter dan pemeriksaan ketersediaan tetap berlaku.

## Mode operasi dan status keluar

### Simulasi

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

Simulasi mengevaluasi filter, versi, alternatif, dan antrean, lalu mencetak paket yang akan diteruskan ke APT. Simulasi tidak membuktikan bahwa proses instalasi nantinya akan berhasil. Simulasi yang valid sengaja keluar dengan status `1`, bahkan jika pemilihan paket berhasil.

### Pemeriksaan saja

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

Pemeriksaan saja mengevaluasi filter dan operator, tetapi hanya memeriksa apakah nama paket telah terinstal melalui `dpkg-query`. Pemeriksaan ini tidak memvalidasi versi yang diminta, kandidat dari repositori, atau target rilis. Pemeriksaan ini mengembalikan `0` jika semua ekspresi aktif terpenuhi dan `1` jika tidak.

Perintah `sudo apt install ...` yang dicetak hanya berfungsi sebagai diagnostik kasar. Perintah ini menghilangkan informasi versi dan target rilis, dapat menyertakan beberapa alternatif yang gagal, dan tidak dijamin dapat mereproduksi ekspresi aslinya.

### Ringkasan status

| Kasus | Status |
| --- | --- |
| Bantuan | `0` |
| Proses normal berhasil | `0` |
| Input tidak valid, kegagalan ketersediaan wajib, atau kegagalan antrean APT | `1` |
| Simulasi valid | `1` |
| Pemeriksaan saja dengan paket aktif yang tidak ditemukan | `1` |

## Penanganan paket khusus

Implementasi ini memiliki satu nama paket khusus: `qemu-kvm`. Paket ini diterima jika `apt-cache show qemu-kvm` melaporkannya sebagai paket virtual murni. Paket virtual lainnya tidak memiliki resolusi penyedia generik. Jika portabilitas penting, gunakan alternatif penyedia yang eksplisit.

## Integrasi MiniOS

### Pemanggilan modul

Untuk modul biasa, `build-modules` menyalin skrip instalasi ke `/install`, CondinAPT ke `/condinapt`, konfigurasi yang dihasilkan ke `/minios_build.conf`, dan peta ke `/condinapt.map`. Skrip instalasi konvensional adalah:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Gunakan `SCRIPT_DIR`; `$CWD` bukan bagian dari kontrak modul biasa.
`00-core` adalah tahap build khusus yang lebih awal dan menjalankan penyalinan pohon sumber di bawah `/linux-live` sebagai gantinya.

Builder modul biasa saat ini hanya menyalin secara otomatis file bernama `packages.list`. Modul yang menggunakan nama file daftar tambahan harus mengatur input tersebut secara eksplisit; jangan berasumsi bahwa setiap file di samping `install` akan muncul di direktori root chroot.

### Peta filter MiniOS

`linux-live/condinapt.map` saat ini mendefinisikan:

| Prefiks | Variabel | Arti |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite target |
| `da` | `DISTRIBUTION_ARCH` | Arsitektur target |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` atau `ubuntu` keluarga paket |
| `is` | `INIT_SYSTEM` | Sistem init yang dipilih |
| `de` | `DESKTOP_ENVIRONMENT` | Lingkungan modul |
| `pv` | `PACKAGE_VARIANT` | Varian paket |
| `ik` | `INSTALL_KERNEL` | Sakelar instalasi kernel |
| `kf` | `KERNEL_FLAVOUR` | Varian kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` atau `minios` |
| `ks` | `KERNEL_SERIES` | Seri kernel aktual saat `01-kernel` pemilihan DKMS |
| `kc` | `KERNEL_CAPABILITIES` | Array kemampuan yang terdeteksi saat `01-kernel` pemilihan DKMS |
| `kbd` | `KERNEL_BUILD_DKMS` | Sakelar build DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementasi initramfs |
| `lo` | `LOCALE` | Lokal sistem |
| `ml` | `MULTILINGUAL` | Sakelar multibahasa |
| `kl` | `KEEP_LOCALES` | Sakelar penyimpanan lokal |

`ks` dan `kc` adalah filter `01-kernel` khusus. Jika build DKMS diaktifkan, modul tersebut mendeteksi `KERNEL_SERIES` dari kernel yang terinstal dan membuat array `KERNEL_CAPABILITIES` berindeks dalam konfigurasi sementara yang digunakan untuk pemilihan paket DKMS-nya. Keduanya tidak ada dalam konfigurasi modul biasa; menggunakannya di sana akan membuat filter positif gagal dan dapat menyebabkan filter negatif lolos.
`KERNEL_SERIES` bukan preferensi `MINIOS_KERNEL_SERIES`. Kemampuan yang terdeteksi saat ini mencakup `aufs`, `ntfs3`, `btf_modules`, serta driver `rtw88_*` bawaan yang didukung.

Contoh dari daftar paket kernel saat ini:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Pemecahan masalah

Gunakan simulasi verbose untuk memeriksa pemilihan:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Jangan gunakan `/dev/stdin`; `-l` memerlukan file biasa.

- Jika filter meloloskan sesuatu secara tak terduga, periksa pemetaan prefix, tipe variabel, huruf besar-kecil, dan nilainya. Periksa apakah ada variabel yang belum disetel atau salah eja.
- Jika fallback tidak dipilih, ingat bahwa fallback terjadi selama preflight, bukan setelah kegagalan APT pada level antrean.
- Jika paket yang ditargetkan gagal, periksa sumber yang dikonfigurasi dan jalankan `apt-cache policy PACKAGE`; preflight tidak menerapkan `-t RELEASE`.
- Jika versi yang ditetapkan secara ketat dilewati, bandingkan kolom versi yang persis dengan `apt-cache madison PACKAGE`.
- Jika urutan antrean tidak sesuai dugaan, perhitungkan pengelompokan target global dan ekstraksi prioritas sebelum antrean normal.

Untuk alur kerja build yang lebih luas, lihat [Membangun MiniOS](/development/Building-MiniOS).
