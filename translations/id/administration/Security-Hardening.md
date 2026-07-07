# Panduan Penguatan Keamanan

Panduan ini memberikan langkah-langkah praktis untuk meningkatkan keamanan sistem MiniOS Anda. Karena MiniOS adalah sistem live, perhatian utama keamanan adalah melindungi data pengguna pada penyimpanan persisten dan mengontrol akses ke sistem yang sedang berjalan. Pengaturan default dirancang untuk kenyamanan penggunaan portabel, namun mungkin tidak optimal untuk semua skenario penggunaan. Rekomendasi berikut akan membantu Anda mengonfigurasi sistem untuk keamanan yang lebih baik.

## Keamanan Akun Pengguna dan Root

Secara default, MiniOS melakukan login otomatis tanpa kata sandi. Ini memberikan kemudahan untuk penggunaan portabel, namun dapat menjadi risiko keamanan dalam beberapa skenario.

**Kredensial Akun Default:**
- **User**: `live` / `evil`  
- **Root**: `root` / `toor`

⚠️ **Kredensial ini sudah diketahui publik dan harus segera diubah untuk penggunaan jaringan atau produksi.**

### Membuat Password Terenkripsi

Sebelum mengatur password, disarankan untuk membuat hash password terenkripsi:

```bash
# The command will prompt you to enter a password and output the hash
mkpasswd -m yescrypt
# Example output: $y$j9T$...(long hash)...$Spig/F.uP
```

### Mengatur Password

Anda dapat mengatur password dengan dua cara: **sangat disarankan** menggunakan password terenkripsi.

**Penting:** Pengaturan password dan parameter akun pengguna melalui parameter boot dan file konfigurasi hanya berlaku pada boot sistem pertama. Setelah itu, password hanya dapat diubah menggunakan metode standar Linux (`passwd`, `sudo passwd`).

#### Melalui Parameter Boot

Tambahkan parameter ke command line kernel di menu boot (GRUB untuk UEFI atau SYSLINUX untuk BIOS):

**Untuk password terenkripsi (disarankan):**
```
user-password-crypted='$y$j9T$...(hash).../'
root-password-crypted='$y$j9T$...(hash).../'
```

**Untuk password biasa (tidak disarankan):**
```
user-password='your_password'
root-password='root_password'
```

**Penting:** Password biasa akan terlihat di command line kernel dan dapat dibaca oleh pengguna sistem lain.

#### Melalui File Konfigurasi

Edit file `minios/config.conf` di direktori root USB drive:

**Untuk password terenkripsi:**
```
LIVE_USER_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
LIVE_ROOT_PASSWORD_CRYPTED="$y$j9T$...(hash).../"
```

**Untuk password biasa:**
```
LIVE_USER_PASSWORD="your_password"
LIVE_ROOT_PASSWORD="root_password"
```

### Mengubah Password Setelah Boot

Setelah boot sistem pertama, password dapat diubah menggunakan perintah Linux standar:

```bash
# Change current user password
passwd

# Change root user password (requires sudo)
sudo passwd root

# Change specific user password (requires sudo)
sudo passwd username
```

### Menonaktifkan Login Otomatis

Setelah mengatur password, nonaktifkan login otomatis agar autentikasi diperlukan:

#### Melalui Parameter Boot

```
noautologin
```

#### Melalui File Konfigurasi

```
LIVE_CONFIG_CMDLINE="components noautologin"
```

**Menonaktifkan autologin sebagian:**
- `nox11autologin` - hanya menonaktifkan autologin grafis (login manager akan meminta autentikasi)
- `nottyautologin` - hanya menonaktifkan autologin konsol (sudah dinonaktifkan secara default)

### Mengelola Hak Akses Pengguna

Secara default, pengguna `live` memiliki hak administrator penuh tanpa permintaan password baik di konsol (`sudo`) maupun aplikasi grafis (melalui polkit). Ini memberikan kenyamanan untuk penggunaan sistem live, namun mungkin perlu diubah untuk keamanan yang lebih baik.

#### Mengaktifkan Permintaan Password untuk sudo

Untuk meminta password saat menggunakan `sudo`, jalankan setelah sistem boot:

```bash
# Change rule to require password
echo "live ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/live
```

Setelah itu, perintah `sudo` akan meminta password pengguna.

#### Mengaktifkan Permintaan Password untuk Aplikasi Grafis

Agar program administratif grafis meminta password, hapus aturan polkit:

```bash
sudo rm /usr/share/polkit-1/rules.d/sudo_on_live.rules
```

Setelah itu, installer software, pengaturan sistem, dan aplikasi GUI administratif lainnya akan meminta password.

#### Menonaktifkan Hak Administrator Sepenuhnya (`noroot`)

Untuk keamanan maksimal, Anda dapat menonaktifkan `sudo` dan akses root sepenuhnya:

**Melalui parameter boot:**
```
noroot
```

**Melalui file konfigurasi:**
```
LIVE_CONFIG_NOROOT=true
```

**Dampak:** Perintah `sudo` tidak akan berfungsi, login root akan dinonaktifkan, dan tidak ada tindakan administratif yang tersedia.

## Keamanan Jaringan

### Pengaturan SSH Default

**Mengapa SSH diaktifkan secara default:** MiniOS dirancang sebagai sistem pemulihan dan diagnostik untuk servis perangkat keras bermasalah. SSH diaktifkan dengan pengaturan permisif untuk menyediakan akses jarak jauh saat tampilan lokal tidak tersedia, rusak, atau saat bekerja dengan sistem tanpa layar.

**Pengaturan SSH saat ini:**
- Layanan SSH diaktifkan dan berjalan otomatis
- Login root melalui SSH diizinkan
- Autentikasi password diaktifkan

**Implikasi keamanan:** Konfigurasi ini menimbulkan risiko keamanan pada jaringan yang tidak terpercaya, namun diperlukan untuk skenario pemulihan.

### Menonaktifkan SSH

Jika akses jarak jauh tidak diperlukan, nonaktifkan SSH sepenuhnya:

**Melalui parameter boot:**
```
disable-services=ssh,avahi-daemon
```

**Melalui file konfigurasi:**
```
DISABLE_SERVICES=ssh,avahi-daemon
```

### Mengonfigurasi Akses SSH yang Aman

Jika SSH diperlukan, amankan dengan metode berikut:

#### 1. Mengatur Password yang Kuat

Gunakan metode pengaturan password yang dijelaskan di atas.

#### 2. Autentikasi Kunci SSH

Tempatkan file `authorized_keys` di direktori root USB drive:

- `authorized_keys.root` - untuk pengguna root
- `authorized_keys.live` - untuk pengguna live
- `authorized_keys.username` - untuk pengguna lain

Komponen sistem akan secara otomatis menyalinnya ke direktori home saat boot.

#### 3. Penguatan Keamanan SSH

Setelah sistem boot, edit konfigurasi SSH:

```bash
sudo nano /etc/ssh/sshd_config.d/minios.conf
```

Ubah pengaturan ke yang lebih aman:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart layanan SSH:
```bash
sudo systemctl restart ssh
```

**Penting:** Selalu uji akses kunci SSH sebelum menonaktifkan autentikasi password.

## Keamanan Boot

### UEFI Secure Boot

MiniOS sepenuhnya kompatibel dengan Secure Boot, karena menggunakan kernel Debian standar dengan bootloader yang sudah ditandatangani. Secure Boot memberikan perlindungan terhadap malware sebelum boot (bootkit) dan direkomendasikan untuk keamanan yang lebih baik.

### Password BIOS/UEFI

Untuk keamanan fisik, atur password di BIOS/UEFI komputer Anda untuk mencegah pengguna tidak sah melakukan boot dari perangkat lain atau mengubah pengaturan boot.
