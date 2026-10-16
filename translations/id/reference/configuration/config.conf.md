---
updated: 2026-10-15
---

# config.conf

`config.conf` adalah berkas prakonfigurasi utama untuk MiniOS. Pada media MiniOS biasa, berkas ini disimpan di `minios/config.conf`. Saat boot, initramfs menyinkronkannya dengan `/etc/live/config.conf` di sistem yang telah dirakit.

Gunakan berkas ini untuk menyiapkan cara MiniOS dimulai dan cara sesi persisten baru diinisialisasi. Mekanisme ini terutama ditujukan bagi administrator untuk prakonfigurasi, bukan sebagai pengganti alat konfigurasi biasa di desktop yang sedang berjalan.

## Konfigurasi ulang

Kolom **Dapat dikonfigurasi ulang** di bawah menggunakan arti berikut:

- **Ya** — pengaturan dapat diubah dan diterapkan lagi pada boot berikutnya.
- **Hanya saat boot pertama** — pengaturan digunakan saat status persisten terkait pertama kali dibuat dan biasanya tidak diterapkan kembali pada boot berikutnya.

Perbedaan ini merupakan bagian dari perilaku yang perlu diketahui pengguna. Berkas status internal `live-config` adalah detail implementasi dan bukan penggantinya.

## Konfigurasi yang dihasilkan

Image MiniOS terbaru menghasilkan `config.conf` dengan struktur umum berikut:
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
Nilai persisnya bergantung pada image dan konfigurasi build.

::: warning `LIVE_CONFIG_CMDLINE` bukan baris perintah initramfs
`LIVE_CONFIG_CMDLINE` menyediakan opsi setelah root MiniOS selesai dirakit. Parameter seperti `from=`, `load=`, `toram`, dan `perchdir=` harus berupa parameter boot kernel yang sebenarnya; menempatkannya hanya di `LIVE_CONFIG_CMDLINE` sudah terlambat untuk memengaruhi initramfs. Opsi kebijakan penyimpanan `log-storage=`, `apt-cache=`, dan `browser-cache=` merupakan pengecualian khusus: `minios-boot` membacanya dari `LIVE_CONFIG_CMDLINE` sebelum layanan normal dimulai.
:::

## Parameter standar

| Parameter | Dapat dikonfigurasi ulang | Arti |
|---|---|---|
| `LIVE_CONFIG_CMDLINE` | Ya | Opsi live-config tambahan. Baris perintah kernel yang sebenarnya ditambahkan belakangan dan akan digunakan jika opsi yang sama muncul berulang. |
| `LIVE_HOSTNAME` | Ya | Nama host sistem. |
| `LIVE_USERNAME` | Hanya saat boot pertama | Nama pengguna live yang dibuat selama penyiapan awal. |
| `LIVE_USER_FULLNAME` | Hanya saat boot pertama | Nama lengkap pengguna live. |
| `LIVE_USER_DEFAULT_GROUPS` | Hanya saat boot pertama | Grup tambahan yang ditetapkan saat pengguna live dibuat. |
| `LIVE_USER_PASSWORD_CRYPTED` | Hanya saat boot pertama | Hash Crypt untuk kata sandi pengguna live. |
| `LIVE_ROOT_PASSWORD_CRYPTED` | Hanya saat boot pertama | Hash Crypt untuk kata sandi root. |
| `LIVE_CONFIG_NOROOT` | Hanya saat boot pertama | Jika diaktifkan, menonaktifkan penyiapan hak istimewa kata sandi root, sudo, dan PolicyKit untuk MiniOS. |
| `LIVE_LOCALES` | Ya | Satu atau beberapa lokal sistem. |
| `LIVE_TIMEZONE` | Ya | Zona waktu sistem, misalnya `Europe/Berlin` atau `Etc/UTC`. |
| `LIVE_KEYBOARD_MODEL` | Ya | Model keyboard XKB. |
| `LIVE_KEYBOARD_LAYOUTS` | Ya | Tata letak keyboard yang dipisahkan dengan koma. |
| `LIVE_KEYBOARD_OPTIONS` | Ya | Opsi keyboard XKB. |
| `LIVE_KEYBOARD_VARIANTS` | Ya | Varian yang dipisahkan dengan koma dan disesuaikan dengan tata letak yang dikonfigurasi. |
| `LIVE_CONFIG_DEBUG` | Ya | Mengaktifkan output debug live-config jika nilainya `true`. |
| `LIVE_LINK_USER_DIRS` | Ya | Menautkan direktori pengguna terkelola ke lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulisi. Tidak tersedia dengan mode bind, mode `toram`, atau sesi persistensi aktif yang dienkripsi LUKS. |
| `LIVE_BIND_USER_DIRS` | Ya | Mengaitkan direktori pengguna terkelola menggunakan bind mount dari lokasi yang dikonfigurasi pada media MiniOS yang dapat ditulisi. Tidak tersedia dengan mode link, mode `toram`, atau sesi persistensi aktif yang dienkripsi LUKS. |
| `LIVE_USER_DIRS_PATH` | Ya | Lokasi yang digunakan oleh mode direktori pengguna link/bind. |
| `LIVE_MODULE_MODE` | Ya | Memilih integrasi modul live-config `simple` atau `merged`. |
| `LIVE_LOG_STORAGE` | Ya | `persistent` (default) atau `volatile` untuk log sistem biasa. Diagnostik boot tetap persisten; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). |
| `LIVE_APT_CACHE` | Ya | `persistent` (default) atau `volatile` untuk arsip APT yang diunduh; status paket dan daftar repositori tetap persisten. |
| `LIVE_BROWSER_CACHE` | Ya | `persistent` (default) atau `volatile` untuk jalur cache browser native standar. Profil browser tetap persisten. |
| `DEFAULT_TARGET` | Ya | Target boot: `graphical.target`, `multi-user.target`, atau `rescue.target`. |
| `ENABLE_SERVICES` | Ya | Layanan yang diaktifkan saat boot melalui `minios-svc`, dipisahkan dengan koma. |
| `DISABLE_SERVICES` | Ya | Layanan yang dinonaktifkan saat boot melalui `minios-svc`, dipisahkan dengan koma. |
| `EXPORT_LOGS` | Ya | Jika `true`, mengekspor MiniOS dan log startup live-config ke media MiniOS yang dapat ditulisi. |

Berkas yang dihasilkan tidak mencantumkan semua hal yang didukung oleh `minios-live-config`. Variabel tambahan untuk prakonfigurasi jaringan kabel, postur keamanan, hook, preseeding, Xorg, dan komponen lain dapat ditambahkan secara manual. Lihat [live-config](/reference/configuration/live-config) untuk referensi lengkap.

Komponen `user-media` menolak aktivasi maupun penyalinan kembali saat sesi persistensi aktif dienkripsi LUKS. Komponen ini menggunakan status enkripsi runtime yang sebenarnya: parameter kernel `perchencrypt=luks` hanya meminta enkripsi saat sesi baru dibuat dan tidak menjelaskan status sesi yang sudah ada.

## Prapengaturan jaringan kabel

MiniOS dapat melakukan prapengaturan **kebijakan IPv4 kabel** melalui komponen `network`. Fitur ini ditujukan untuk prapengaturan administratif pada sistem sebelum sistem dijalankan di perangkat keras target.
Contoh:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Pengaturan ini hanya berlaku **Saat boot pertama** untuk kebijakan jaringan persisten. Setelah berhasil diterapkan, komponen akan mencatat `/var/lib/live/config/network`.
Mengubah nilai tidak akan menimpa sesi persisten yang sudah dikonfigurasi, kecuali status tersebut sengaja direset.

`LIVE_NETWORK_METHOD=static` menetapkan kebijakan statis. `off` menonaktifkan IPv4 otomatis untuk antarmuka yang dipilih. Jika nilai tidak ditetapkan atau nilainya `dhcp`, konfigurasi jaringan yang sudah ada pada image tidak akan berubah. `LIVE_NETWORK_BACKEND=auto` mengutamakan NetworkManager dan menggunakan ifupdown sebagai cadangan.

Fitur ini tidak mengonfigurasi Wi-Fi. Setelah boot, NetworkManager mengelola jaringan kabel dan nirkabel seperti biasa. Lihat [Jaringan](/using-minios/Networking) untuk penggunaan jaringan saat runtime dan [live-config](/reference/configuration/live-config) untuk semua variabel jaringan.

## Pengaturan early-userspace MiniOS

`DEFAULT_TARGET`, `ENABLE_SERVICES`, `DISABLE_SERVICES`, `EXPORT_LOGS`, dan tiga kebijakan penyimpanan `LIVE_*` di atas merupakan pengaturan boot MiniOS, bukan variabel komponen live-config yang diterapkan belakangan. MiniOS menerapkannya sebelum sistem init normal mengambil alih; `minios-boot` mengelola tiga kebijakan penyimpanan tersebut. Semuanya **Dapat dikonfigurasi ulang: Ya**.

Parameter boot yang sesuai, `default-target=`, `enable-services=`, dan `disable-services=` akan diprioritaskan untuk boot saat ini. Parameter `text` memaksa `multi-user.target`.

Build Toolbox dan Ultra saat ini menambahkan `ssh` ke `ENABLE_SERVICES`. Untuk menonaktifkan SSH secara eksplisit, tambahkan ke `DISABLE_SERVICES`; menghapusnya dari `ENABLE_SERVICES` saja tidak akan meminta penonaktifan.

Dengan `EXPORT_LOGS="true"`, media MiniOS yang dapat ditulis menyimpan log startup di lokasi berikut:

```text
minios/log/YYYYMMDD_HHMMSS/
├── minios/
└── live/
```

Log runtime yang sesuai berada di `/var/log/minios/minios-boot.log` dan `/var/log/live/config.log`.

<a id="cache-and-log-policy-for-a-persistent-session"></a>

## Kebijakan cache dan log untuk sesi persisten

Untuk mengurangi penulisan selama sesi `perch`, tambahkan pengaturan berikut secara terpisah:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Pengaturan tersebut juga menerima nilai `persistent`, yang merupakan nilai default. `minios-boot` menerima pengaturan yang sama dari `/etc/live/config.conf.d/*.conf`, `LIVE_CONFIG_CMDLINE` (`log-storage=volatile`, `apt-cache=volatile`, `browser-cache=volatile`), atau parameter kernel. Fragmen yang muncul belakangan menggantikan yang sebelumnya, blob parameter mengungguli kunci file, dan parameter kernel aktual menjadi prioritas terakhir. Ketiga opsi ini berdiri sendiri dan tidak dengan sendirinya meminta persistensi. initrd yang kompatibel mengiklankan `perch-storage-v1` di `/run/initramfs/etc/minios-initramfs-storage`; Konfigurator MiniOS akan memberi peringatan jika initrd saat ini tidak mengiklankannya.

Kebijakan ini memerlukan aktivasi persistensi yang berhasil, baik pada penyimpanan tahan lama yang dapat ditulis maupun sebagai sesi RAM yang dapat ditulis dengan informasi `ram-origin`. Sistem `toram` saja tidak menentukan ketahanan sesi: `perchtoram=off` dapat mempertahankan sesi di penyimpanan, sedangkan sesi yang disalin tetap perlu disimpan. Kegagalan persistensi dan **Mulai tanpa menyimpan** tidak memenuhi syarat. Diagnostik boot disimpan terpisah dari log volatil biasa, tetapi tetap berada di memori pada sesi yang disalin ke RAM hingga disimpan. Komponen cache browser berjalan setelah pengguna aktif dibuat. Lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk mengetahui batasan RAM, jalur yang didukung, dan ketentuan penerimaan.

## Sumber, salinan runtime, dan prioritas

Direktori data MiniOS yang dipilih biasanya berisi file sumber berikut:

| Direktori data yang dipilih | Sistem yang sedang berjalan |
|---|---|
| `config.conf` | `/etc/live/config.conf` |
| `config.conf.d/*.conf` | `/etc/live/config.conf.d/*.conf` |

Pada media yang terpasang secara normal, file-file tersebut terlihat sebagai `minios/config.conf` dan `minios/config.conf.d/*.conf`, biasanya di bawah `/run/initramfs/memory/data/` saat sistem berjalan.

Sinkronisasi berlangsung saat boot; fitur ini bukan pemantau file:

- Salinan `config.conf` yang lebih baru akan dipilih berdasarkan waktu modifikasi. Salinan yang lebih baru di media akan disalin ke root live. Salinan runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis.
- Setiap file `config.conf.d/*.conf` disinkronkan secara terpisah berdasarkan nama dasar, dengan aturan waktu dan izin tulis yang sama. File tidak dihapus dari kedua sisi.
- Jika waktu sistem lebih awal daripada waktu sinkronisasi terakhir yang tercatat, perbandingan waktu akan dilewati dan hanya file tujuan yang belum ada yang akan disalin.
- `toram=trim` menyalin `config.conf` tetapi tidak menyertakan `config.conf.d/`. `toram` akan menyalin seluruh pohon data, tetapi sinkronisasi selanjutnya akan menggunakan salinan RAM, bukan media sumber yang dilepas.
Setelah sinkronisasi, `live-config` akan membaca `/etc/live/config.conf` terlebih dahulu, lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Karena itu, fragmen yang muncul belakangan dapat menggantikan nilai dari file utama atau fragmen sebelumnya.

Baris perintah kernel aktual ditambahkan ke `LIVE_CONFIG_CMDLINE`. Jika suatu opsi muncul lebih dari sekali, kemunculan yang paling akhir pada baris perintah kernel akan digunakan. Untuk tiga kebijakan penyimpanan, `minios-boot` akan membaca file utama yang telah disinkronkan, lalu fragmennya, kemudian blob opsi, dan terakhir baris perintah kernel aktual; pengaturan terakhir yang berlaku.

Anda dapat menambahkan variabel shell khusus proyek ke `config.conf` atau fragmennya, lalu membacanya dari salinan runtime. Beri tanda kutip pada nilai sebagai string shell dan jangan beri spasi di sekitar `=`.

## Referensi terkait

- [Parameter boot](/reference/Boot-Parameters) — parameter yang harus dicantumkan pada baris perintah kernel aktual serta override live-config.
- [live-config](/reference/configuration/live-config) — referensi lengkap tentang parameter, variabel, komponen, dan status late-userspace.
- [Mode boot](/using-minios/Boot-Modes) — pengaruh persistensi dan `toram` terhadap penyimpanan konfigurasi.
