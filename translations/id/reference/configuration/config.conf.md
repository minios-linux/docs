---
updated: 2026-08-31
---

# config.conf

`config.conf` adalah file pra-konfigurasi utama MiniOS. Pada media MiniOS normal, file ini disimpan sebagai `minios/config.conf`. Saat boot, initramfs menyinkronkan file ini dengan `/etc/live/config.conf` di sistem yang telah dirakit.

Gunakan file ini untuk menyiapkan bagaimana MiniOS dimulai dan bagaimana sesi persisten baru diinisialisasi. File ini terutama ditujukan sebagai mekanisme pra-konfigurasi untuk administrator, bukan pengganti alat konfigurasi normal di desktop yang sedang berjalan.

## Rekonfigurasi

Kolom **Reconfigurable** di bawah ini menggunakan arti berikut:

- **Ya** — pengaturan dapat diubah dan diterapkan kembali saat boot berikutnya.
- **Hanya boot pertama** — pengaturan digunakan ketika status persisten terkait pertama kali dibuat dan biasanya tidak diterapkan ulang pada boot berikutnya.

Perbedaan ini adalah bagian dari perilaku yang perlu diketahui pengguna. File status internal `live-config` merupakan detail implementasi dan tidak menggantikan penjelasan ini.

## Konfigurasi yang dihasilkan

Image MiniOS saat ini menghasilkan `config.conf` dengan struktur umum seperti berikut:
```bash
# live-config settings
LIVE_CONFIG_CMDLINE="components nottyautologin"
LIVE_HOSTNAME="minios"
LIVE_USERNAME="live"
LIVE_USER_FULLNAME="MiniOS Live User"
LIVE_USER_DEFAULT_GROUPS="dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark"
LIVE_USER_PASSWORD_CRYPTED='$y$...'
LIVE_ROOT_PASSWORD_CRYPTED='$y$...'
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
DEFAULT_TARGET="graphical.target"
ENABLE_SERVICES="ssh"
DISABLE_SERVICES=""
EXPORT_LOGS="false"
```
Nilai pastinya tergantung pada image dan konfigurasi build.

::: warning `LIVE_CONFIG_CMDLINE` bukanlah command line initramfs
`LIVE_CONFIG_CMDLINE` menyediakan opsi untuk **live-config** setelah root MiniOS selesai dirakit. Parameter seperti `from=`, `load=`, `toram`, dan `perchdir=` harus berupa parameter boot kernel yang sebenarnya; menaruhnya hanya di `LIVE_CONFIG_CMDLINE` sudah terlambat untuk memengaruhi initramfs.
:::

## Parameter standar

| Parameter | Dapat dikonfigurasi ulang | Arti |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Ya | Opsi tambahan live-config. Kernel command line yang sebenarnya akan ditambahkan kemudian dan akan menang untuk opsi yang berulang. |
| `LIVE_HOSTNAME` | Ya | Hostname sistem. |
| `LIVE_USERNAME` | Hanya boot pertama | Nama pengguna live yang dibuat saat setup awal. |
| `LIVE_USER_FULLNAME` | Hanya boot pertama | Nama lengkap pengguna live. |
| `LIVE_USER_DEFAULT_GROUPS` | Hanya boot pertama | Grup tambahan yang diberikan saat pengguna live dibuat. |
| `LIVE_USER_PASSWORD_CRYPTED` | Hanya boot pertama | Crypt hash untuk password pengguna live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Hanya boot pertama | Crypt hash untuk password root. |
| `LIVE_CONFIG_NOROOT` | Hanya boot pertama | Jika diaktifkan, menonaktifkan pengaturan password root MiniOS, sudo, dan hak istimewa PolicyKit. |
| `LIVE_LOCALES` | Ya | Satu atau lebih locale sistem. |
| `LIVE_TIMEZONE` | Ya | Zona waktu sistem, misalnya `Europe/Berlin` atau `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Ya | Model keyboard XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Ya | Tata letak keyboard dipisahkan koma. |
| `LIVE_KEYBOARD_OPTIONS` | Ya | Opsi keyboard XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Ya | Varian dipisahkan koma yang dicocokkan dengan tata letak yang dikonfigurasi. |
| `LIVE_CONFIG_DEBUG` | Ya | Mengaktifkan output debug live-config saat diatur ke `true`. |
| `LIVE_LINK_USER_DIRS` | Ya | Menghubungkan direktori pengguna yang dikelola ke lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulis. |
| `LIVE_BIND_USER_DIRS` | Ya | Bind-mount direktori pengguna yang dikelola dari lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulis. |
| `LIVE_USER_DIRS_PATH` | Ya | Lokasi yang digunakan oleh mode link/bind direktori pengguna. |
| `LIVE_MODULE_MODE` | Ya | Memilih integrasi modul live-config `simple` atau `merged`. |
| `DEFAULT_TARGET` | Ya | Target boot: `graphical.target`, `multi-user.target`, atau `rescue.target`. |
| `ENABLE_SERVICES` | Ya | Service yang diaktifkan saat boot, dipisahkan koma, melalui `minios-svc`. |
| `DISABLE_SERVICES` | Ya | Service yang dinonaktifkan saat boot, dipisahkan koma, melalui `minios-svc`. |
| `EXPORT_LOGS` | Ya | Jika `true`, mengekspor log MiniOS dan startup live-config ke media MiniOS yang dapat ditulis. |

File yang dihasilkan ini bukan daftar lengkap dari semua yang didukung oleh `minios-live-config`. Variabel tambahan untuk pra-konfigurasi jaringan kabel, keamanan, hooks, preseeding, Xorg, dan komponen lain dapat ditambahkan secara manual. Lihat [live-config](/reference/configuration/live-config) untuk referensi lengkap.

## Pra-konfigurasi jaringan kabel

MiniOS dapat melakukan pra-konfigurasi kebijakan **IPv4 kabel** melalui komponen live-config `network`. Fitur ini ditujukan untuk pra-konfigurasi administratif sistem sebelum dijalankan pada perangkat keras target.
Sebagai contoh:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Pengaturan ini berlaku **Hanya boot pertama** untuk kebijakan jaringan persisten. Setelah berhasil diterapkan, komponen akan mencatat `/var/lib/live/config/network`.
Mengubah nilai tidak akan menimpa sesi persisten yang sudah dikonfigurasi kecuali status tersebut direset secara sengaja.

`LIVE_NETWORK_METHOD=static` menulis kebijakan statis. `off` menonaktifkan IPv4 otomatis untuk interface yang dipilih. Nilai yang tidak diatur atau `dhcp` akan membiarkan pengaturan jaringan image yang ada tetap seperti semula. `LIVE_NETWORK_BACKEND=auto` memprioritaskan NetworkManager dan akan menggunakan ifupdown jika gagal.

Fasilitas ini tidak mengkonfigurasi Wi-Fi. Setelah boot, jaringan kabel dan nirkabel biasa dikelola oleh NetworkManager. Lihat [Networking](/using-minios/Networking) untuk penggunaan jaringan saat runtime dan [live-config](/reference/configuration/live-config) untuk semua variabel jaringan.

## Pengaturan early-userspace MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, dan `EXPORT_LOGS` adalah pengaturan MiniOS, bukan variabel live-config. Pengaturan ini dibaca oleh `minios-boot` sebelum sistem init normal mengambil alih dan semuanya **Dapat dikonfigurasi ulang: Ya**.

Parameter boot yang sesuai `default-target=`, `enable-services=`, dan `disable-services=` akan mengambil prioritas untuk boot saat ini. Parameter `text` memaksa `multi-user.target`.

Build Toolbox dan Ultra saat ini menambahkan `ssh` ke `ENABLE_SERVICES`. Untuk mematikan SSH secara eksplisit, masukkan ke dalam `DISABLE_SERVICES`; hanya menghapusnya dari `ENABLE_SERVICES` tidak akan menonaktifkan secara eksplisit.

Dengan `EXPORT_LOGS="true"`, media MiniOS yang dapat ditulis akan menerima log startup berikut:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Log runtime yang sesuai adalah `/var/log/minios/minios-boot.log` dan `/var/log/live/config.log`.

## Sumber, salinan runtime, dan prioritas

Direktori data MiniOS yang dipilih biasanya berisi file sumber berikut:

| Direktori data terpilih | Sistem berjalan |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Pada media yang ter-mount secara normal, file-file ini terlihat sebagai `minios/config.conf` dan `minios/config.conf.d/*.conf`, sering kali di bawah `/run/initramfs/memory/data/` saat sistem berjalan.

Sinkronisasi terjadi saat boot; ini bukan file monitor:

- Salinan `config.conf` yang lebih baru akan menang berdasarkan waktu modifikasi. Salinan media yang lebih baru akan disalin ke live root. Salinan runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis.
- Setiap file `config.conf.d/*.conf` disinkronkan secara independen berdasarkan nama file menggunakan aturan timestamp dan writability yang sama. File tidak dihapus dari kedua sisi.
- Jika jam sistem lebih awal dari waktu sinkronisasi terakhir yang tercatat, perbandingan timestamp akan dilewati dan hanya file tujuan yang hilang yang akan diisi.
- `toram=trim` menyalin `config.conf` tetapi mengabaikan `config.conf.d/`. Perintah `toram` penuh akan menyalin seluruh pohon data, tetapi sinkronisasi kemudian akan menargetkan salinan RAM daripada sumber media yang terlepas.
Setelah sinkronisasi, `live-config` membaca `/etc/live/config.conf` terlebih dahulu lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Fragmen yang lebih akhir dapat menggantikan nilai dari file utama atau fragmen sebelumnya.

Kernel command line yang sebenarnya akan ditambahkan ke `LIVE_CONFIG_CMDLINE`. Untuk opsi yang muncul lebih dari sekali, opsi kernel-command-line yang lebih akhir akan menang. `minios-boot` juga memberikan prioritas pada parameter kernel yang dikenali dibandingkan pengaturan yang sesuai dari `/etc/live/config.conf`.

Anda dapat menambahkan variabel shell spesifik proyek ke `config.conf` atau fragmennya dan membacanya dari salinan runtime. Kutip nilai sebagai string shell dan jangan beri spasi di sekitar `=`.

## Referensi terkait

- [Boot parameters](/reference/Boot-Parameters) — parameter yang harus ditempatkan pada kernel command line yang sebenarnya dan override live-config.
- [live-config](/reference/configuration/live-config) — referensi lengkap parameter, variabel, komponen, dan status late-userspace.
- [Boot modes](/using-minios/Boot-Modes) — bagaimana persistensi dan `toram` memengaruhi penyimpanan konfigurasi.
