---
updated: 2026-08-26
---

# Berkas konfigurasi

Media boot MiniOS menyimpan konfigurasi utama di `minios/config.conf`. Saat boot, initramfs menyinkronkannya ke `/etc/live/config.conf` di live root yang telah dirakit. Oleh karena itu, skrip di sistem yang sedang berjalan sebaiknya membaca `/etc/live/config.conf`; `/etc/minios/config.conf` dan `config/config.conf` bukan jalur konfigurasi yang digunakan oleh kode boot saat ini.

Parameter boot dapat menimpa pengaturan berkas yang bersesuaian. Berikut ini adalah contoh standar `config.conf`:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$j9T$ZjqXh232.8hREYixjgMNN.$ADNa7mAp.Cjky5HgjG7JioH3SxnzPLljAC0fVxPsYr6'
LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$y6H8zml37HjzKO517qvkc.$53Ux0xA0OVHIELjgf91mMd8nr1DM.E3PSI.StCEnn4.'
LIVE_CONFIG_NOROOT=""
LIVE_LOCALES="en_US.UTF-8"
LIVE_TIMEZONE="Etc/UTC"
LIVE_KEYBOARD_MODEL="pc105"
LIVE_KEYBOARD_LAYOUTS="us,us"
LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll"
LIVE_KEYBOARD_VARIANTS=","
LIVE_CONFIG_DEBUG="true"
LIVE_LINK_USER_DIRS="false"
LIVE_BIND_USER_DIRS="false"
LIVE_USER_DIRS_PATH="/minios/userdata"
LIVE_MODULE_MODE="merged"

# MiniOS LiveKit settings.
DEFAULT_TARGET="graphical"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```

## Deskripsi Parameter

**Legenda:**
- **Hanya saat boot pertama** - Diterapkan hanya pada boot pertama dan tidak diterapkan ulang pada boot berikutnya
- **Ya** - Dapat diubah dan diterapkan ulang setiap kali boot

| Parameter | Dapat Dikonfigurasi Ulang | Arti | Contoh |
| --------- | ------------------------ | ----- | ------- |
| LIVE_CONFIG_CMDLINE | Ya | Opsi tambahan untuk live-config. `nottyautologin` disimpan di sini, bukan di-hardcode pada setiap entri boot. Lihat `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components nottyautologin" |
| LIVE_HOSTNAME | Ya | Nama node yang terkait dengan sistem. Lihat `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | Hanya saat boot pertama | Nama pengguna yang profilnya akan dibuat pada boot pertama. Jika Anda menentukan username <strong>root</strong>, maka profil pengguna tidak akan dibuat, dan login akan dilakukan menggunakan profil <strong>root</strong>. Lihat `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | Hanya saat boot pertama | Nama lengkap untuk pengguna utama. Lihat `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | Hanya saat boot pertama | Daftar grup untuk pengguna utama, dipisahkan koma. Lihat `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | Hanya saat boot pertama | Password pengguna utama dalam bentuk terenkripsi (hash). Gunakan `mkpasswd -m yescrypt` untuk menghasilkan. Lihat `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | Hanya saat boot pertama | Password pengguna dengan hak istimewa **root** dalam bentuk terenkripsi (hash). Gunakan `mkpasswd -m yescrypt` untuk menghasilkan. Lihat `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | Hanya saat boot pertama | Jika diatur, login akun root akan dinonaktifkan dan sudo/policykit untuk pengguna juga dinonaktifkan. Lihat `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | Ya | Mengatur locale. Beberapa nilai dapat dipisahkan koma. Lihat `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | Ya | Mengatur zona waktu (misal: "Europe/Berlin", "Etc/UTC"). Lihat `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | Ya | Mengatur model keyboard (misal: "pc105"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | Ya | Mengatur layout keyboard (dipisahkan koma, misal: "us,de"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | Ya | Mengatur opsi keyboard (misal: "grp:alt_shift_toggle,grp_led:scroll"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | Ya | Mengatur varian keyboard (dipisahkan koma, bisa kosong atau sesuai layout). Lihat `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | Ya | Mengaktifkan output debug untuk live-config. Lihat `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | Ya | Jika true, direktori pengguna akan di-link dari path yang ditentukan. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | Ya | Jika true, direktori pengguna akan di-bind-mount dari path yang ditentukan. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | Ya | Path ke direktori data pengguna di flash drive. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | Ya | Pilih mode operasi sistem. Jika Anda berencana menginstal software hanya melalui modul, gunakan "merged". Jika ingin menginstal software menggunakan apt, gunakan "simple". Default-nya adalah "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | Ya | Target systemd untuk boot. Lihat `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | Ya | Mengaktifkan layanan saat boot (dipisahkan koma). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | Ya | Mematikan layanan saat boot (dipisahkan koma). | DISABLE_SERVICES="" |
| EXPORT_LOGS | Ya | Jika true dan direktori data MiniOS yang dipilih dapat ditulis, log boot akan disalin ke `minios/log/YYYYMMDD_HHMMSS/`. | EXPORT_LOGS="false" |


**Untuk detail lebih lanjut tentang sebagian besar parameter, lihat:**
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Untuk target systemd: `man systemd.special`

## Penting!

* Server SSH diaktifkan secara default untuk kompatibilitas dengan initrd pihak ketiga, untuk menonaktifkannya, Anda tidak hanya harus menghapusnya dari `ENABLE_SERVICES`.

## Sumber, salinan runtime, dan prioritas

Direktori data MiniOS yang dipilih biasanya adalah direktori `minios/` pada media boot. Path konfigurasi dan salinan runtime-nya adalah:

| Direktori data yang dipilih | Sistem berjalan |
| --- | --- |
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Untuk media yang ter-mount secara normal, file sumber ini terlihat sebagai `minios/config.conf` dan `minios/config.conf.d/*.conf`, sering kali di bawah `/run/initramfs/memory/data/`. File-file ini tidak dimuat langsung oleh `live-config`. Initramfs akan menyinkronkan dengan path runtime sebelum menjalankan `minios-boot`; lihat [Boot modes](/configuration/Boot-Modes.md) untuk mengetahui di mana proses ini terjadi dalam urutan boot.

Sinkronisasi dilakukan saat boot, bukan oleh pemantau file:

- Salinan `config.conf` yang lebih baru (berdasarkan waktu modifikasi) yang akan digunakan. Salinan sumber yang lebih baru akan disalin ke live root. Salinan runtime yang lebih baru hanya akan disalin kembali jika direktori data yang dipilih dapat ditulis.
- Setiap file `config.conf.d/*.conf` disinkronkan secara independen berdasarkan nama file menggunakan aturan waktu modifikasi dan hak tulis yang sama. File tidak dihapus dari kedua sisi.
- Jika jam sistem lebih awal dari waktu sinkronisasi terakhir yang tercatat, perbandingan timestamp dilewati dan hanya file tujuan yang belum ada yang akan diisi.
- `toram=trim` menyalin `config.conf` tetapi mengabaikan `config.conf.d/`; lihat [Initrd module loading](/configuration/Initrd-Module-Loading.md). Salinan penuh `toram` menyalin seluruh pohon data, namun sinkronisasi kemudian menargetkan salinan di RAM, bukan media yang terlepas.

Setelah sinkronisasi, `live-config` membaca `/etc/live/config.conf` terlebih dahulu lalu `/etc/live/config.conf.d/*.conf` sesuai urutan shell glob, sehingga fragmen yang lebih akhir dapat menggantikan nilai sebelumnya. Baris perintah kernel yang sebenarnya akan ditambahkan ke `LIVE_CONFIG_CMDLINE`; untuk opsi yang diulang di sana, kemunculan kernel command-line yang lebih akhir akan digunakan. `minios-boot` juga membaca `/etc/live/config.conf` untuk pengaturan awal yang didukung dan memberikan prioritas pada parameter kernel yang dikenali.

Anda dapat menambahkan variabel shell khusus proyek ke file-file ini dan membacanya dari `/etc/live/config.conf` atau fragmen saat runtime. Kutip nilai sebagai string shell dan jangan beri spasi di sekitar `=`.

Log awal MiniOS adalah `/var/log/minios/minios-boot.log`, sedangkan output `live-config` yang lebih akhir adalah `/var/log/live/config.log`. Dengan `EXPORT_LOGS="true"`, kedua pohon akan disalin ke `minios/log/YYYYMMDD_HHMMSS/{minios,live}/` jika direktori data yang dipilih dapat ditulis.
