---
updated: 2026-08-26
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# CondinAPT: Panduan Lengkap Instalasi Paket Bersyarat

**CondinAPT** adalah alat serbaguna untuk mengotomatisasi instalasi paket di sistem berbasis Debian (Debian, Ubuntu, dan turunannya). Fitur utamanya adalah kemampuan untuk mendefinisikan kondisi dan aturan kompleks untuk instalasi setiap paket berdasarkan konfigurasi sistem apa pun.

**Area Penerapan:**
- Sistem build distribusi Linux
- Otomatisasi setup server dan workstation
- Deploy berbagai konfigurasi sistem
- Manajemen paket di container Docker
- Pipeline CI/CD untuk setup environment
- Pembuatan image instalasi kustom

## Daftar Isi

### Dasar-dasar

- [Cara Kerja dan Komponen Inti](#how-it-works-and-core-components)
- [Mulai Cepat](#quick-start)
- [Penggunaan](#usage)

### Sintaks dan Kapabilitas

- [Sintaks File Daftar Paket](#package-list-file-syntax)
- [Filter dan Kondisi](#filters-and-conditions)
- [Antrian Instalasi](#installation-queues)
- [Antrian Prioritas](#priority-queue)

### Mode Operasi

- [Mode Operasi dan Debugging](#operating-modes-and-debugging)
- [Penanganan Error dan Pemulihan](#error-handling-and-recovery)

### Penggunaan Lanjutan

- [Fitur Lanjutan](#advanced-features)
- [Integrasi dengan Sistem Build](#integration-with-build-systems)

### Contoh Praktis

- [Contoh Skenario Dunia Nyata](#examples-of-real-world-scenarios)
- [Tips Optimasi](#optimization-tips)
- [Pemecahan Masalah](#troubleshooting)

**Fitur Utama:**

*   **Instalasi Bersyarat:** Instal paket berdasarkan filter yang fleksibel (+, -).
*   **Konfigurasi Eksternal:** Pemisahan total antara logika (daftar paket) dan data (parameter sistem).
*   **Antrean Instalasi:** Membagi proses menjadi beberapa tahap berurutan untuk menyelesaikan dependensi.
*   **Antrean Prioritas:** Menjamin instalasi paket penting terlebih dahulu.
*   **Logika Kompleks:** Mendukung operator "AND" (`&&`), "OR" (`||`), serta filter grup (`+{a|b}`, `-{a&b}`).
*   **Keterbacaan:** Mendukung komentar dan baris kosong untuk menata daftar.
*   **Kompatibilitas Mundur:** Mendukung daftar paket sederhana tanpa syarat.

## Cara Kerja dan Komponen Inti

CondinAPT beroperasi dengan empat berkas utama:

1.  **Script `condinapt`:** Inti utama, berisi seluruh logika pemrosesan.

2.  **Berkas konfigurasi utama (`-c`):** Berkas yang berisi variabel bash yang mendeskripsikan lingkungan saat ini.

    Contoh (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Berkas pemetaan filter (`-m`):** Menghubungkan prefix pendek (yang digunakan dalam daftar paket) ke nama variabel dari berkas konfigurasi utama. Berkas ini **opsional**. Jika filter tidak ada di berkas pemetaan filter, maka akan digunakan sebagai nama variabel dari berkas konfigurasi utama. Jika variabel tidak ditemukan, CondinAPT akan mendeklarasikannya kosong.

    Contoh (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Berkas daftar paket (`-l`):** Berkas utama yang mendeskripsikan apa saja yang akan diinstal dan dalam kondisi apa.

## Mulai Cepat

Untuk mengenal CondinAPT dengan cepat, buat contoh sederhana berikut:

**1. Buat berkas konfigurasi `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Buat daftar paket `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Jalankan instalasi:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Atau uji dengan mode simulasi:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Penggunaan

### Baris Perintah

```bash
./condinapt [OPTIONS]
```

| Flag         | Long Flag                      | Argumen  | Deskripsi                                           |
| :----------- | :----------------------------- | :------- | :-------------------------------------------------- |
| `-l`         | `--package-list`               | `PATH`   | **(Wajib)** Path ke berkas daftar paket.            |
| `-c`         | `--config`                     | `PATH`   | **(Wajib)** Path ke berkas konfigurasi utama.       |
| `-m`         | `--filter-mapping`             | `PATH`   | (Opsional) Path ke berkas pemetaan filter.          |
| `-P`         | `--priority-list`              | `PATH`   | (Opsional) Path ke berkas filter prioritas. Berkas berisi pola regex untuk mencocokkan paket. Paket yang cocok akan dipindahkan ke antrian prioritas (dengan filter tetap dipertahankan). |
| `-s`         | `--simulation`                 |          | Mode simulasi. Paket tidak akan diinstal.           |
| `-C`         | `--check-only`                 |          | Hanya memeriksa apakah paket sudah terinstal. Mengembalikan exit code 1 jika ada paket yang belum terinstal. Di akhir, menampilkan perintah untuk menginstal paket yang belum ada. |
| `-v` / `-vv` | `--verbose` / `--very-verbose` |          | Output verbose / sangat verbose.                    |
| `-x`         | `--xtrace`                     |          | Aktifkan pelacakan perintah `set -x`.               |
| `-f`         | `--force`                      |          | Paksa pembaruan daftar paket sebelum instalasi. Secara default, update dilewati jika `/var/cache/apt/pkgcache.bin` ada. |
| `-h`         | `--help`                       |          | Tampilkan bantuan.                                  |

## Sintaks Berkas Daftar Paket

### Struktur Dasar

Ini adalah inti dari CondinAPT. Seluruh logika dideskripsikan di sini.

Setiap baris dalam berkas daftar paket terdiri dari dua bagian utama:

1. **Nama paket dengan spesifikasi versi dan rilis (opsional)**
2. **Filter kondisi** - mendefinisikan kondisi di mana paket akan diinstal

> **Dasar untuk semua contoh di bawah:**
> Untuk semua contoh berikut, diasumsikan bahwa berkas `system.conf` dan `filters.map` dari bagian [Cara Kerja dan Komponen Inti](#how-it-works-and-core-components) digunakan.
>
> *   `DISTRIBUTION` = `"bookworm"`
> *   `SYSTEM_TYPE` = `"server"`
> *   `ENVIRONMENT` = `"production"`

### Struktur Nama Paket

**Nama sederhana:**
```
vim
```

**Versi paket:**
- `package=version` — syarat versi longgar. Jika versi yang diminta tidak tersedia, akan diinstal versi yang tersedia.
  ```
  git=2.25.1
  ```
- `package==version` — syarat ketat. Jika versi tidak ditemukan, instalasi dibatalkan dengan error.
  ```
  curl==7.68.0
  ```

**Spesifikasi rilis:**
Rilis ditentukan menggunakan simbol `@`, yang memungkinkan mengaitkan instalasi ke branch repository tertentu.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Struktur Berkas

*   **Nama paket:** Setiap paket atau kondisi ditulis pada baris baru.
*   **Komentar:** Baris yang diawali dengan `#`, atau teks setelah `#` pada baris, sepenuhnya diabaikan.
*   **Baris kosong:** Diabaikan dan hanya untuk pemisah visual.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filter dan Kondisi

Filter memungkinkan Anda menetapkan kondisi tambahan untuk pemilihan paket. Filter membandingkan nilai variabel sistem (arsitektur, distribusi, lingkungan kerja) dengan yang ditentukan dalam berkas konfigurasi.

#### Filter Tunggal

*   **`+` (Positif):** Kondisi bernilai benar jika nilai variabel **sesuai**.
    **Format:** `+<prefix>=<value>`
    
    *   **Baris:** `nginx +st=server`
    *   **Analisis:** `SYSTEM_TYPE` sama dengan `"server"`. Kondisi benar.
    *   **Hasil:** `nginx` akan diinstal.

*   **Beberapa filter positif dengan prefix sama:**
    Bertindak sebagai kondisi OR.
    **Format:** `+<prefix>=<value1> +<prefix>=<value2>`
    
    *   **Baris:** `debug-tools +env=development +env=testing`
    *   **Analisis:** `ENVIRONMENT` sama dengan `"production"`, tidak sesuai dengan `"development"` maupun `"testing"`. Kondisi salah.
    *   **Hasil:** `debug-tools` tidak akan diinstal.

*   **`-` (Negatif):** Kondisi bernilai benar jika nilai variabel **tidak sesuai**.
    **Format:** `-<prefix>=<value>`

    *   **Baris:** `monitoring-tools -st=desktop`
    *   **Analisis:** `SYSTEM_TYPE` sama dengan `"server"`, tidak sama dengan `"desktop"`. Kondisi benar.
    *   **Hasil:** `monitoring-tools` akan diinstal.

*   **Beberapa filter negatif:**
    Paket dikecualikan jika ADA kondisi yang cocok.
    **Format:** `-<prefix>=<value1> -<prefix>=<value2>`
    
    *   **Baris:** `realtek-driver -d=trixie -d=sid`
    *   **Analisis:** `DISTRIBUTION` sama dengan `"bookworm"`, tidak sama dengan `"trixie"` maupun `"sid"`. Kondisi pengecualian tidak terpenuhi.
    *   **Hasil:** `realtek-driver` akan diinstal.

#### Filter Grup

*   **`+{a|b}` (OR untuk inklusi):** Bernilai benar jika **setidaknya satu** kondisi dalam grup bernilai benar.

    *   **Baris:** `web-server +{st=server|st=web-server}`
    *   **Analisis:** `SYSTEM_TYPE` sama dengan `"server"`. Kondisi pertama benar, sudah cukup.
    *   **Hasil:** Paket akan diinstal.

*   **`+{a&b}` (AND untuk inklusi):** Bernilai benar hanya jika **semua** kondisi dalam grup bernilai benar.

    *   **Baris:** `database-tools +{d=bookworm&st=server}`
    *   **Analisis:** `DISTRIBUTION` sama dengan `"bookworm"` (benar) DAN `SYSTEM_TYPE` sama dengan `"server"` (benar).
    *   **Hasil:** Paket akan diinstal.

*   **`-{a|b}` (OR untuk pengecualian):** Paket dikecualikan jika **setidaknya satu** kondisi bernilai benar.

    *   **Baris:** `debug-tools -{env=production|st=minimal}`
    *   **Analisis:** `ENVIRONMENT` sama dengan `"production"`. Kondisi pertama benar, jadi paket dikecualikan.
    *   **Hasil:** Paket tidak akan diinstal.

*   **`-{a&b}` (AND untuk pengecualian):** Paket dikecualikan hanya jika **semua** kondisi bernilai benar.

    *   **Baris:** `development-tools -{env=production&st=minimal}`
    *   **Analisis:** `ENVIRONMENT` sama dengan `"production"` (benar), tapi `SYSTEM_TYPE` tidak sama dengan `"minimal"`. Kondisi kedua salah. Grup tidak memicu pengecualian.
    *   **Hasil:** Paket akan diinstal (jika tidak ada filter lain).

### Alternatif

Paket berbeda dapat ditawarkan untuk fungsi yang sama dan diinstal tergantung pada kondisi. Opsi alternatif dipisahkan dengan operator `||`.

**Penting:** Setiap alternatif harus memuat deskripsi lengkap — nama paket (dengan versi dan rilis opsional) dan sekumpulan filter.

**Contoh:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Jika `SYSTEM_TYPE` adalah `database-server`, **postgresql** dipilih.
- Jika `SYSTEM_TYPE` adalah `web-server`, **mysql-server** diinstal.

### Operator Logika untuk Paket

*   **`||` (OR / Fallback):** Coba instal bagian kiri. Jika gagal (paket tidak ditemukan atau terfilter), coba bagian kanan.

    *   **Baris:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Analisis:** `DISTRIBUTION` tidak sama dengan `"bookworm"`, bagian kiri terfilter. CondinAPT lanjut ke bagian kanan. `exfat-utils` tidak punya filter, jadi akan diinstal.
    *   **Hasil:** `exfat-utils` akan diinstal.

*   **`&&` (AND / Konjungsi):** Semua bagian harus lolos pengecekan filter untuk masuk ke antrian.

    *   **Baris:** `nginx +st=web-server && php-fpm`
    *   **Analisis:** `SYSTEM_TYPE` sama dengan `"server"`, tapi kondisi butuh `"web-server"`. Bagian kiri gagal.
    *   **Hasil:** Tidak ada paket yang diinstal.

    *   **Contoh kompleks:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Hasil:** Ketiga paket hanya akan diinstal jika `ENVIRONMENT` adalah `production`.

### Modifier Khusus

*   **`!` (Paket Wajib):** Jika paket ditandai dengan `!`, tapi tidak ditemukan di repository, CondinAPT akan membatalkan eksekusi dengan error.

    *   **Baris:** `!essential-package`

*   **`@` (Spesifikasi Rilis):** Instal paket dari rilis Debian/Ubuntu tertentu (misal, `bookworm-backports`).

    *   **Baris:** `kernel-image-6.5.0 @trixie-backports`

### Spesifikasi Versi Paket

CondinAPT memungkinkan kontrol versi paket yang diinstal secara presisi.

*   **Sintaks:**
    *   `package=VERSION`: Mencoba menginstal versi (`VERSION`) yang ditentukan. Jika tidak tersedia di repository, CondinAPT akan menginstal versi apa pun yang tersedia.
        *   Contoh: `my-app=1.2.3` (mencoba instal 1.2.3, jika tidak, misal, 1.2.4)
    *   `package==VERSION`: Instalasi **ketat** versi tertentu. Jika versi ini tidak tersedia di repository, paket **tidak akan diinstal**. Jika juga ditandai wajib (`!`), script akan keluar dengan error.
        *   Contoh: `another-app==2.0.0` (hanya instal 2.0.0, jika tidak, dilewati atau error jika wajib)

*   **Perilaku:**
    1.  CondinAPT pertama-tama memeriksa apakah versi paket yang diminta sudah terinstal di sistem. Jika ya, paket dianggap sudah terinstal dan dilewati.
    2.  Lalu memeriksa apakah versi yang diminta tersedia di repository (`apt-cache madison`).
    3.  **Jika menggunakan `=` (versi longgar):**
        *   Jika versi yang diminta tidak tersedia, CondinAPT akan memberi peringatan bahwa versi persis tidak ditemukan.
        *   Namun, akan tetap mencoba menginstal versi apa pun yang tersedia dari repository.
    4.  **Jika menggunakan `==` (versi ketat):**
        *   Jika versi yang diminta tidak tersedia, CondinAPT **tidak akan** menginstal paket.
        *   Jika paket ditandai wajib (`!`), script akan membatalkan eksekusi dengan error.
    5.  **Penahanan versi (`apt-mark hold`):**
        *   Jika paket berhasil diinstal dengan **versi yang persis diminta** (misal, jika `package==VERSION` berhasil, atau `package=VERSION` menemukan versi yang sama persis dan menginstalnya), CondinAPT akan otomatis menjalankan perintah `apt-mark hold` untuk paket tersebut.
        *   Ini mencegah update otomatis paket ke versi baru saat menjalankan `apt upgrade` berikutnya.

### Contoh Filter Kompleks

#### Contoh 1: Filter kompleks untuk satu paket

**Tugas:** Instal `database-tools` untuk distribusi `bookworm`, tapi hanya jika tipe sistem adalah `server` atau `database-server`, dan bukan untuk environment `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Analisis (dengan konfigurasi kita):**

1.  `+d=bookworm`: Benar.
2.  `+{st=server|st=database-server}`: Benar, karena `SYSTEM_TYPE` adalah `"server"`.
3.  `-env=minimal`: Benar, karena `ENVIRONMENT` adalah `"production"`.
    **Hasil:** Semua kondisi benar. Paket akan diinstal.

#### Contoh 2: Rantai fallback dengan kondisi berbeda

**Tugas:** Untuk Debian `trixie`, instal `firefox-esr`. Untuk `bookworm`, instal `firefox`. Untuk kasus lain, instal `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Analisis:**

1.  `firefox-esr +d=trixie`: Bagian kiri. `DISTRIBUTION` adalah `"bookworm"`, kondisi salah.
2.  `firefox +d=bookworm`: Bagian tengah. `DISTRIBUTION` adalah `"bookworm"`, kondisi benar.
3.  Karena bagian kedua dari rantai `||` berhasil, bagian ketiga (`w3m`) akan diabaikan.
    **Hasil:** `firefox` akan diinstal.

#### Contoh 3: Interaksi antara antrian prioritas dan paket wajib

**Tugas:** `dkms` sangat penting untuk pembuatan modul; harus diinstal pertama. Di daftar utama, ditandai wajib, tapi dengan kondisi.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Analisis:**

1.  CondinAPT membaca pola prioritas `^dkms$` dan `^build-essential$`.
2.  Baris `!dkms +pv=standard` cocok dengan pola `^dkms$` dan dipindahkan ke antrian prioritas **dengan seluruh propertinya**: flag wajib (`!`) dan filter (`+pv=standard`).
3.  **Rencana Eksekusi:**

    *   **Antrian Prioritas:** Instal `!dkms +pv=standard` (flag wajib dan filter tetap dipertahankan).
    *   **Antrian Normal:** `vim`.

**Hasil:** `dkms` akan diinstal lebih dulu, tetapi filter `+pv=standard` tetap dievaluasi. Jika kondisi filter tidak terpenuhi, instalasi gagal karena flag `!` (wajib).

## Antrian Instalasi

Pemisah `---` pada baris terpisah membagi daftar menjadi grup (antrian). Paket dari satu antrian diinstal bersama dalam satu pemanggilan `apt`. Antrian dieksekusi secara berurutan.

### Antrian Normal

**Contoh:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Antrian Target (dengan spesifikasi rilis)

Paket dengan `@release` otomatis dikelompokkan ke antrian terpisah per rilis:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Antrian Prioritas

Mekanisme ini untuk instalasi prioritas paket-paket penting sambil mempertahankan filter dan kondisinya.

*   **Prinsip:** Berkas yang ditentukan dengan flag `-P` berisi pola regex (satu pola per baris, tanpa filter). CondinAPT memindai semua antrian, menemukan paket yang cocok dengan pola ini, dan memindahkannya (dengan seluruh filter dan kondisinya) ke "Antrian Prioritas" khusus yang dijalankan pertama.
*   **Pencocokan Pola:** Menggunakan pencocokan regex bash (`=~` operator). Pola bisa berupa nama paket sederhana atau ekspresi regex kompleks.
*   **Menjaga Konteks:** Berbeda dengan daftar prioritas sederhana, mekanisme ini menjaga seluruh kondisi paket, filter, dan spesifikasi rilis dari daftar paket asli.
*   **Override:** Paket yang cocok otomatis dihapus dari antrian asalnya (baik antrian reguler maupun target dengan `@release`) dan dipindahkan ke antrian prioritas. Target rilis tetap dipertahankan dalam antrian prioritas target terpisah.

**Contoh 1: Pencocokan nama paket sederhana**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Analisis:**

    1.  CondinAPT membaca `priority.list` dan tahu bahwa paket yang cocok dengan pola `^gpg$` dan `^git$` harus diinstal lebih dulu.
    2.  Ia memindai `packages.list` dan menemukan baris `git +st=full-server`. Karena `git` cocok dengan pola, seluruh baris ini (dengan filter `+st=full-server`) dipindahkan ke antrian prioritas.
    3.  Begitu juga, `gpg -st=minimal` dipindahkan ke antrian prioritas dengan filter `-st=minimal` tetap dipertahankan.
    4.  **Rencana Akhir:**

        *   **Antrian Prioritas:** Instal `git +st=full-server` dan `gpg -st=minimal` (filter tetap dipertahankan dan dievaluasi).
        *   **Antrian Normal:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Contoh 2: Pencocokan pola regex**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Analisis:**

    1.  Pola `^linux-.*` cocok dengan `linux-image-6.1.0-amd64` dan `linux-headers-6.1.0-amd64`.
    2.  Pola `^firmware-.*` cocok dengan `firmware-linux`.
    3.  **Rencana Akhir:**

        *   **Antrian Prioritas:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Antrian Normal:** `build-essential`, `nginx +st=server`.

## Mode Operasi dan Debugging

#### Mode Simulasi (`-s`)

Memungkinkan Anda melihat paket apa saja yang akan diinstal tanpa benar-benar menginstalnya:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Contoh Output:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Catatan:** Pada mode simulasi, script keluar dengan exit code 1.

#### Mode Cek (`-C`)

Memeriksa paket mana dari daftar yang sudah terinstal di sistem:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Perilaku:**
- Menampilkan error untuk paket yang belum terinstal
- Mengembalikan exit code 1 jika ada paket yang belum terinstal
- Di akhir, menampilkan perintah untuk menginstal paket yang belum ada

#### Mode Debugging

**Output Verbose (`-v`):**
- Menampilkan informasi detail tentang pengecekan filter
- Menampilkan hasil untuk setiap paket

**Output Sangat Verbose (`-vv`):**
- Detail proses maksimum
- Menampilkan semua langkah antara

**Pelacakan Perintah (`-x`):**
- Mengaktifkan `set -x` untuk debugging script
- Menampilkan setiap perintah yang dijalankan

**Contoh dengan Debugging:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Paksa Update Cache (`-f`)

Memaksa CondinAPT menjalankan `apt update` sebelum instalasi:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Fitur Lanjutan

### Dukungan Array pada Konfigurasi

CondinAPT dapat bekerja dengan variabel array di berkas konfigurasi:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Paket Khusus

CondinAPT memiliki dukungan bawaan untuk paket-paket khusus yang membutuhkan penanganan spesial:

**Paket Virtual:**
- `qemu-kvm` - diperlakukan sebagai paket virtual

**Mekanisme Penanganan:**
1. CondinAPT memeriksa apakah paket virtual menggunakan perintah `apt-cache show`
2. Jika paket ditandai sebagai "murni virtual", dianggap tersedia untuk instalasi
3. Daftar paket khusus didefinisikan dalam array `SPECIAL_PACKAGES` di dalam script:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Menambah Daftar:** Untuk menambah paket khusus baru, Anda perlu mengedit array `SPECIAL_PACKAGES` di kode CondinAPT.

## Penanganan Error dan Pemulihan

### Paket Wajib (`!`)

Jika paket ditandai sebagai wajib tapi tidak ditemukan di repository, CondinAPT akan:
1. Menampilkan pesan error
2. Membatalkan eksekusi (kecuali pada mode simulasi)
3. Mengembalikan exit code 1

**Contoh:**
```text
!essential-package +pv=standard
```

Jika `essential-package` tidak ditemukan di repository, eksekusi akan dibatalkan.

### Penanganan Versi Tidak Tersedia

**Versi Longgar (`=`):**
- Jika versi persis tidak tersedia, akan diinstal versi apa pun yang tersedia
- Peringatan akan muncul tentang ketidaktersediaan versi yang diminta

**Versi Ketat (`==`):**
- Jika versi persis tidak tersedia, paket dilewati
- Jika paket wajib (`!`), eksekusi dibatalkan

### Penahanan Versi (`apt-mark hold`)

CondinAPT otomatis menahan versi paket pada kasus berikut:
- Ketika versi yang diminta persis berhasil diinstal
- Untuk paket dengan `==VERSION`, jika versi ditemukan dan diinstal
- Untuk paket dengan `=VERSION`, jika versi yang sama persis ditemukan dan diinstal

## Integrasi dengan Sistem Build

### Penggunaan dalam Script Otomasi

CondinAPT mudah diintegrasikan ke sistem build dan script otomasi. Untuk detail lebih lanjut tentang sintaks berkas paket, lihat bagian [Sintaks Berkas Daftar Paket](#package-list-file-syntax).

### Contoh Integrasi Umum:

**Dalam script otomasi (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Contoh Konfigurasi Universal

**Contoh berkas pemetaan filter (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Contoh konfigurasi (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Contoh Skenario Dunia Nyata

### Contoh 1: Server Multimedia

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Contoh 2: Web Server dengan Berbagai Konfigurasi

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Contoh 3: Platform Container

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Contoh 4: Penggunaan Filter Lanjutan

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Tips Optimasi

### Mengatur Daftar Paket

1. **Mengelompokkan berdasarkan fungsionalitas:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Menggunakan antrean untuk dependensi:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Mengoptimalkan kondisi:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Performa

- Gunakan antrean prioritas untuk paket penting
- Minimalkan jumlah antrean
- Kelompokkan paket terkait dalam satu antrean
- Gunakan caching APT untuk build berukuran besar

## Pemecahan Masalah

### Masalah Umum

**Masalah:** Paket tidak terpasang meskipun kondisi sudah benar
**Solusi:** Periksa dengan flag `-vv` untuk informasi filter yang lebih detail

**Masalah:** CondinAPT berhenti pada paket wajib
**Solusi:** Periksa ketersediaan paket di repository atau gunakan fallback. Lihat bagian [Penanganan Error dan Pemulihan](#error-handling-and-recovery)

**Masalah:** Perilaku tidak terduga pada versi paket
**Solusi:** Gunakan [mode simulasi](#operating-modes-and-debugging) (`-s`) untuk verifikasi

### Debugging Filter

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Memeriksa Ketersediaan Paket

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
