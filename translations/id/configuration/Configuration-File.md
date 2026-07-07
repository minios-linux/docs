# Berkas Konfigurasi

MiniOS berbeda dari kebanyakan distribusi flash klasik karena beberapa parameter dapat diatur sebelum boot melalui berkas konfigurasi yang cukup sederhana `config/config.conf`, sehingga meminimalkan pekerjaan yang diperlukan saat membuat modul sendiri untuk sistem embedded. Opsional, beberapa parameter juga bisa diatur melalui parameter boot. Opsi boot memiliki prioritas lebih tinggi dibandingkan berkas konfigurasi. Beberapa parameter dalam berkas ini bersifat layanan dan sebaiknya tidak diubah. Berikut adalah contoh berkas konfigurasi standar:

```
# You can get information about minios-live-config and other options:
# man live-config
LIVE_CONFIG_CMDLINE="components"
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
- 🔒 **Sekali saja** - Diterapkan hanya pada boot pertama, tidak dapat diubah pada boot berikutnya  
- 🔄 **Dapat dikonfigurasi ulang** - Dapat diubah setiap kali boot dan diterapkan kembali

| Parameter | Dapat dikonfigurasi ulang | Arti | Contoh |
| --------- | ------------------------ | ----- | ------ |
| LIVE_CONFIG_CMDLINE | 🔄 | Parameter boot tambahan untuk live-config. Lihat `man 7 live-config`. | LIVE_CONFIG_CMDLINE="components" |
| LIVE_HOSTNAME | 🔄 | Nama node yang terhubung dengan sistem. Lihat `man 7 live-config`. | LIVE_HOSTNAME="minios" |
| LIVE_USERNAME | 🔒 | Nama pengguna yang profilnya akan dibuat pada boot pertama. Jika Anda menentukan username <strong>root</strong>, maka tidak ada profil pengguna yang akan dibuat, dan login akan dilakukan menggunakan profil <strong>root</strong>. Lihat `man 7 live-config`. | LIVE_USERNAME="live" |
| LIVE_USER_FULLNAME | 🔒 | Nama lengkap untuk pengguna utama. Lihat `man 7 live-config`. | LIVE_USER_FULLNAME="MiniOS Live User" |
| LIVE_USER_DEFAULT_GROUPS | 🔒 | Daftar grup untuk pengguna utama, dipisahkan koma. Lihat `man 7 live-config`. | LIVE_USER_DEFAULT_GROUPS="dialout,cdrom,floppy..." |
| LIVE_USER_PASSWORD_CRYPTED | 🔒 | Kata sandi pengguna utama dalam bentuk terenkripsi (hash). Gunakan `mkpasswd -m yescrypt` untuk menghasilkan. Lihat `man 7 live-config`. | LIVE_USER_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_ROOT_PASSWORD_CRYPTED | 🔒 | Kata sandi pengguna istimewa **root** dalam bentuk terenkripsi (hash). Gunakan `mkpasswd -m yescrypt` untuk menghasilkan. Lihat `man 7 live-config`. | LIVE_ROOT_PASSWORD_CRYPTED='$y$j9T$...' |
| LIVE_CONFIG_NOROOT | 🔒 | Jika diatur, menonaktifkan login akun root dan menonaktifkan sudo/policykit untuk pengguna. Lihat `man 7 live-config`. | LIVE_CONFIG_NOROOT="" |
| LIVE_LOCALES | 🔄 | Mengatur locale. Bisa lebih dari satu nilai, dipisahkan koma. Lihat `man 7 live-config`. | LIVE_LOCALES="en_US.UTF-8" |
| LIVE_TIMEZONE | 🔄 | Mengatur zona waktu (misal: "Europe/Berlin", "Etc/UTC"). Lihat `man 7 live-config`. | LIVE_TIMEZONE="Etc/UTC" |
| LIVE_KEYBOARD_MODEL | 🔄 | Mengatur model keyboard (misal: "pc105"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_MODEL="pc105" |
| LIVE_KEYBOARD_LAYOUTS | 🔄 | Mengatur layout keyboard (dipisahkan koma, misal: "us,de"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_LAYOUTS="us,de" |
| LIVE_KEYBOARD_OPTIONS | 🔄 | Mengatur opsi keyboard (misal: "grp:alt_shift_toggle,grp_led:scroll"). Lihat `man 7 live-config`. | LIVE_KEYBOARD_OPTIONS="grp:alt_shift_toggle,grp_led:scroll" |
| LIVE_KEYBOARD_VARIANTS | 🔄 | Mengatur varian keyboard (dipisahkan koma, bisa kosong atau sesuai layout). Lihat `man 7 live-config`. | LIVE_KEYBOARD_VARIANTS="," |
| LIVE_CONFIG_DEBUG | 🔄 | Mengaktifkan output debug untuk live-config. Lihat `man 7 live-config`. | LIVE_CONFIG_DEBUG="true" |
| LIVE_LINK_USER_DIRS | 🔄 | Jika true, direktori pengguna akan dilink dari path yang ditentukan. | LIVE_LINK_USER_DIRS="false" |
| LIVE_BIND_USER_DIRS | 🔄 | Jika true, direktori pengguna akan di-bind-mount dari path yang ditentukan. | LIVE_BIND_USER_DIRS="false" |
| LIVE_USER_DIRS_PATH | 🔄 | Path ke direktori data pengguna di flash drive. | LIVE_USER_DIRS_PATH="/minios/userdata" |
| LIVE_MODULE_MODE | 🔄 | Pilih mode operasi sistem. Jika Anda ingin instalasi software hanya melalui modul, gunakan "merged". Jika ingin instalasi software menggunakan apt, gunakan "simple". Default adalah "merged". | LIVE_MODULE_MODE="merged" |
| DEFAULT_TARGET | 🔄 | systemd target untuk boot. Lihat `man systemd.special`. | DEFAULT_TARGET="graphical" |
| ENABLE_SERVICES | 🔄 | Mengaktifkan layanan saat boot (dipisahkan koma). | ENABLE_SERVICES="ssh" |
| DISABLE_SERVICES | 🔄 | Menonaktifkan layanan saat boot (dipisahkan koma). | DISABLE_SERVICES="" |
| EXPORT_LOGS | 🔄 | Jika true, saat boot dari media yang dapat ditulis, log MiniOS akan disalin ke folder minios/logs saat boot. | EXPORT_LOGS="false" |


**Untuk detail lebih lanjut tentang sebagian besar parameter, lihat:**  
- `man 7 live-config` ([live-config](/configuration/live-config.md))
- Untuk systemd target: `man systemd.special`

## Penting!

* Server SSH diaktifkan secara default untuk kompatibilitas dengan initrd pihak ketiga. Untuk menonaktifkannya, Anda tidak hanya perlu menghapusnya dari `ENABLE_SERVICES`.

Apa lagi kegunaan berkas `config.conf`? Anda dapat menggunakannya untuk menetapkan parameter sendiri di skrip Anda saat membuat modul. Pada boot pertama, file ini akan disalin ke folder /etc/minios, lalu file `/etc/live/config.conf` akan dipantau secara otomatis dan, jika ada perubahan, akan menimpa file konfigurasi di flash drive jika dapat ditulis. Dengan demikian, Anda bisa menaruh variabel Anda di config.conf dan mengambilnya dari `/etc/live/config.conf` di skrip Anda, terlepas dari jenis initrd yang digunakan.
