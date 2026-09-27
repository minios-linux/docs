---
updated: 2026-09-26
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

Image MiniOS saat ini menghasilkan `config.conf` dengan struktur umum seperti ini:
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

::: warning `LIVE_CONFIG_CMDLINE` ini bukanlah command line initramfs
`LIVE_CONFIG_CMDLINE` menyediakan opsi setelah root MiniOS selesai dirakit. Parameter seperti `from=`, `load=`, `toram`, dan `perchdir=` harus berupa parameter boot kernel yang valid; jika hanya diletakkan di `LIVE_CONFIG_CMDLINE` maka sudah terlambat untuk memengaruhi initramfs. Opsi storage-policy seperti `log-storage=`, `apt-cache=`, dan `browser-cache=` adalah pengecualian khusus: `minios-boot` membaca opsi tersebut dari `LIVE_CONFIG_CMDLINE` sebelum layanan normal dijalankan.
:::

## Parameter standar

| Parameter | Dapat dikonfigurasi ulang | Makna |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Ya | Opsi live-config tambahan. Kernel command line yang sebenarnya akan ditambahkan kemudian dan akan mengungguli opsi yang sama jika ada pengulangan. |
| `LIVE_HOSTNAME` | Ya | Hostname sistem. |
| `LIVE_USERNAME` | Hanya saat boot pertama | Nama live user yang dibuat saat penyiapan awal. |
| `LIVE_USER_FULLNAME` | Hanya saat boot pertama | Nama lengkap live user. |
| `LIVE_USER_DEFAULT_GROUPS` | Hanya saat boot pertama | Grup tambahan yang diberikan saat live user dibuat. |
| `LIVE_USER_PASSWORD_CRYPTED` | Hanya saat boot pertama | Crypt hash untuk password live-user. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Hanya saat boot pertama | Crypt hash untuk password root. |
| `LIVE_CONFIG_NOROOT` | Hanya saat boot pertama | Jika diaktifkan, menonaktifkan pengaturan hak istimewa MiniOS, sudo, dan PolicyKit. |
| `LIVE_LOCALES` | Ya | Satu atau lebih locale sistem. |
| `LIVE_TIMEZONE` | Ya | Zona waktu sistem, misalnya `Europe/Berlin` atau `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Ya | Model keyboard XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Ya | Layout keyboard yang dipisahkan dengan koma. |
| `LIVE_KEYBOARD_OPTIONS` | Ya | Opsi keyboard XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Ya | Varian yang dipisahkan koma dan disesuaikan dengan layout yang dikonfigurasi. |
| `LIVE_CONFIG_DEBUG` | Ya | Mengaktifkan output debug live-config jika disetel ke `true`. |
| `LIVE_LINK_USER_DIRS` | Ya | Menghubungkan direktori pengguna yang dikelola ke lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulis. Tidak tersedia pada mode bind, mode `toram` apa pun, atau saat sesi persistence terenkripsi LUKS sedang aktif. |
| `LIVE_BIND_USER_DIRS` | Ya | Bind-mount mengelola direktori pengguna dari lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulis. Tidak tersedia pada mode link, mode `toram` apa pun, atau sesi persistensi terenkripsi LUKS yang aktif. |
| `LIVE_USER_DIRS_PATH` | Ya | Lokasi yang digunakan oleh mode user-directory link/bind. |
| `LIVE_MODULE_MODE` | Ya | Memilih `simple` atau `merged` integrasi modul live-config. |
| `LIVE_LOG_STORAGE` | Ya | `persistent` (default) atau `volatile` untuk log sistem biasa. Log diagnostik boot tetap persisten; lihat [Kinerja](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Ya | `persistent` (default) atau `volatile` untuk arsip APT yang diunduh; status paket dan daftar repositori tetap persisten. |
| `LIVE_BROWSER_CACHE` | Ya | `persistent` (default) atau `volatile` untuk path cache browser-native standar. Profil browser tetap persisten. |
| `DEFAULT_TARGET` | Ya | Target boot: `graphical.target`, `multi-user.target`, atau `rescue.target`. |
| `ENABLE_SERVICES` | Ya | Layanan yang diaktifkan saat boot dipisahkan dengan koma melalui `minios-svc`. |
| `DISABLE_SERVICES` | Ya | Layanan yang dinonaktifkan saat boot dipisahkan dengan koma melalui `minios-svc`. |
| `EXPORT_LOGS` | Ya | Saat `true`, mengekspor MiniOS dan log startup live-config ke media MiniOS yang dapat ditulis. |

File yang dihasilkan bukanlah daftar lengkap dari semua yang didukung oleh `minios-live-config`. Variabel tambahan untuk pra-konfigurasi jaringan kabel, postur keamanan, hook, preseeding, Xorg, dan komponen lain dapat ditambahkan secara manual. Lihat [live-config](/reference/configuration/live-config) untuk referensi lengkap.

Komponen `user-media` menolak aktivasi dan copy-back jika sesi persistensi aktif terenkripsi LUKS. Komponen ini menggunakan status enkripsi runtime yang sebenarnya: parameter kernel `perchencrypt=luks` hanya meminta enkripsi saat membuat sesi baru dan tidak menggambarkan sesi yang sudah ada.

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

## MiniOS pengaturan early-userspace

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, dan tiga `LIVE_*` kebijakan storage di atas adalah pengaturan boot MiniOS daripada variabel komponen live-config tahap akhir. MiniOS menerapkan pengaturan ini sebelum sistem init normal berjalan; `minios-boot` memiliki tiga kebijakan storage tersebut. Semuanya merupakan **Dapat dikonfigurasi ulang: Ya**.

Parameter boot terkait `default-target=`, `enable-services=`, dan `disable-services=` memiliki prioritas untuk boot saat ini. Parameter `text` memaksa `multi-user.target`.

Build Toolbox dan Ultra saat ini menambahkan `ssh` ke `ENABLE_SERVICES`. Untuk mematikan SSH secara eksplisit, masukkan ke dalam `DISABLE_SERVICES`; hanya menghapusnya dari `ENABLE_SERVICES` tidak akan menonaktifkan operasi.

Dengan `EXPORT_LOGS="true"`, media MiniOS yang dapat ditulis akan menerima log startup berikut:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Log runtime terkait adalah `/var/log/minios/minios-boot.log` dan `/var/log/live/config.log`.

## Kebijakan cache dan log untuk sesi persisten

Untuk mengurangi penulisan selama `perch` sesi, tambahkan pengaturan secara terpisah:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Pengaturan ini juga menerima `persistent`, yang menjadi default. `minios-boot` menerima pengaturan yang sama dari `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), atau parameter kernel. Fragmen yang ditambahkan belakangan akan menggantikan yang sebelumnya, parameter blob akan mengungguli kunci file, dan parameter kernel aktual akan menjadi prioritas terakhir. Ketiga opsi ini berdiri sendiri dan tidak secara otomatis meminta persistensi. Initrd yang kompatibel akan mengiklankan `perch-storage-v1` di `/run/initramfs/etc/minios-initramfs-storage`; Konfigurator MiniOS akan memberi peringatan jika initrd saat ini tidak mengiklankannya.

Kebijakan ini hanya berlaku pada boot berikutnya jika persistensi benar-benar aktif di media penyimpanan yang dapat ditulis secara permanen. Dengan `toram`, persistensi gagal, atau **Mulai tanpa menyimpan**, kebijakan volatil yang diminta tidak dianggap sebagai bukti bahwa apa pun akan disimpan. Komponen browser-cache berjalan setelah `minios-boot`, setelah pengguna live dibuat. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk batas pasti RAM, path browser yang didukung, kondisi fallback, dan log yang tetap ada di media.

## Sumber, salinan runtime, dan prioritas

Direktori data MiniOS yang dipilih biasanya berisi file sumber berikut:

| Direktori data yang dipilih | Sistem yang sedang berjalan |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Pada media yang biasanya terpasang, file ini terlihat sebagai `minios/config.conf` dan `minios/config.conf.d/*.conf`, sering kali di bawah `/run/initramfs/memory/data/` saat sistem sedang berjalan.

Sinkronisasi terjadi saat boot; ini bukan pemantau file:

- Salinan terbaru dari `config.conf` menang berdasarkan waktu modifikasi. Salinan media yang lebih baru akan disalin ke root aktif. Salinan runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis.
- Setiap file `config.conf.d/*.conf` disinkronkan secara independen berdasarkan nama file menggunakan aturan timestamp dan hak tulis yang sama. File tidak akan dihapus dari kedua sisi.
- Jika waktu pada sistem lebih awal dari waktu sinkronisasi terakhir yang tercatat, perbandingan timestamp dilewati dan hanya file tujuan yang hilang yang akan diisi.
- `toram=trim` menyalin `config.conf` tetapi mengabaikan `config.conf.d/`. Salinan penuh `toram` menyalin pohon data, tetapi sinkronisasi selanjutnya menargetkan salinan RAM daripada sumber media yang terlepas.
Setelah sinkronisasi, `live-config` membaca `/etc/live/config.conf` terlebih dahulu lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Dengan demikian, fragmen yang lebih akhir dapat menggantikan nilai dari file utama atau fragmen sebelumnya.

Baris perintah kernel yang sebenarnya akan ditambahkan ke `LIVE_CONFIG_CMDLINE`. Untuk opsi yang muncul lebih dari sekali, entri kernel-command-line yang lebih akhir akan digunakan. Untuk tiga kebijakan penyimpanan, `minios-boot` membaca file utama yang telah disinkronkan, lalu fragmennya, kemudian opsi blob, dan terakhir baris perintah kernel yang sebenarnya; pengaturan terakhir yang berlaku.

Anda dapat menambahkan variabel shell khusus proyek ke `config.conf` atau fragmennya dan membacanya dari salinan runtime. Kutip nilai sebagai string shell dan jangan beri spasi di sekitar `=`.

## Referensi terkait

- [Parameter boot](/reference/Boot-Parameters) — parameter yang harus ditempatkan pada command line kernel dan override live-config.
- [live-config](/reference/configuration/live-config) — referensi lengkap parameter, variabel, komponen, dan status late-userspace.
- [Mode boot](/using-minios/Boot-Modes) — bagaimana persistensi dan `toram` memengaruhi penyimpanan konfigurasi.
