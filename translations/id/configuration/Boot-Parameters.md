# Parameter Boot

## Cara Menggunakan Parameter Boot

Parameter boot, juga dikenal sebagai parameter kernel, adalah perintah yang dapat Anda masukkan untuk menyesuaikan proses boot MiniOS. Parameter ini dapat digunakan untuk menonaktifkan deteksi perangkat keras, memulai MiniOS dari perangkat tertentu, dan lain-lain.

### Untuk Syslinux:

- Tekan <kbd>Esc</kbd> saat proses boot MiniOS untuk mengakses menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter yang diinginkan dan tekan Enter untuk memulai boot.

### Untuk Grub:

- Tekan <kbd>E</kbd> ketika Anda melihat menu grub.
- Edit parameter boot di akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk boot dengan pengaturan baru.

## Tabel Parameter Boot

Tabel di bawah ini menampilkan parameter boot yang tersedia di MiniOS, fungsinya, dan contoh penggunaannya.

**Legenda:**
- 🔒 **Hanya sekali** - Diterapkan hanya pada boot pertama, tidak dapat diubah pada boot berikutnya
- 🔄 **Dapat dikonfigurasi ulang** - Dapat diubah setiap kali boot dan diterapkan ulang


| Parameter | Dapat dikonfigurasi ulang | Deskripsi | Contoh Penggunaan |
|---|---|---|---|
| `from` | 🔄 | Memuat data MiniOS dari direktori, perangkat, atau file ISO yang ditentukan. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | 🔄 | Mengaktifkan pemuatan modul `.sb` tertentu menggunakan ekspresi reguler. Bekerja bersama dengan perintah `toram=trim`, hanya modul yang dipilih yang dimuat ke RAM.| `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | 🔄 | Menonaktifkan pemuatan modul `.sb` tertentu menggunakan ekspresi reguler. Digunakan bersama perintah `toram=trim` untuk mengecualikan modul tertentu dari pemuatan ke RAM. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | 🔄 | Menetapkan ekstensi file untuk bundle (modul). Default: `sb`. | `bext=mymod` |
| `timing` | 🔄 | Mengaktifkan output timing saat startup untuk debugging performa. | `timing` |
| `union` | 🔄 | Memaksa penggunaan filesystem union tertentu. | `union=aufs`<br>`union=overlayfs` |
| `ip` | 🔄 | Menetapkan alamat IP statis untuk antarmuka jaringan, digunakan untuk boot PXE. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>`. | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | 🔄 | Menetapkan ukuran cache (MB) untuk data yang dimuat melalui HTTP. | `cache=512` |
| `rd.break` | 🔄 | Menghentikan proses boot di akhir tahap initramfs dan menyediakan shell debug. | `rd.break` |
| `perchdir` | 🔄 | Memilih profil atau menjalankan aksi dengan profil. Menerima nomor profil atau kata kunci `resume` (lanjutkan sesi sebelumnya), `new` (mulai sesi baru), atau `ask` (pilih sesi saat startup). Jika dikosongkan, MiniOS akan mulai dalam mode "bersih". | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | 🔄 | Menetapkan ukuran sistem file virtual DynFileFS (dalam MB), digunakan untuk menyimpan data pada file system non-Linux (misal FAT32, NTFS). Default: 16GB. Gunakan opsi ini jika disk target Anda lebih kecil. | `perchsize=4000`<br>`perchsize=32000` |
| `perchmode` | 🔄 | Mode penyimpanan untuk perubahan persisten.<br>`native` (default) - menyimpan data apa adanya pada file system yang kompatibel POSIX;<br>`dynfilefs` - menyimpan data dalam file image yang dapat berkembang dinamis;<br>`raw` - menyimpan data dalam file image berukuran tetap.| `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw` |
| `perch` | 🔄 | Mengaktifkan persistensi dan melanjutkan sesi terakhir yang digunakan. Setara dengan `perchdir=resume`. | `perch` |
| `toram` | 🔄 | Menyalin sistem ke RAM. Dapat menggunakan nilai `trim` dan `full`. Jika tanpa parameter, default ke `full`.<br>`trim` - hanya data yang diperlukan yang disalin, memperhatikan filter `load` dan `noload`. Jika parameter `perch` ditentukan, perubahan juga dimuat.<br>`full` - seluruh folder minios dimuat, kecuali perubahan kecuali `perch` ditentukan. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | 🔄 | Menonaktifkan X server dan memulai dalam mode konsol teks. | `text` |
| `automount` | 🔄 | Mengaktifkan mounting otomatis perangkat penyimpanan. | `automount` |
| `debug` | 🔄 | Mengaktifkan output debugging saat startup. | `debug` |
| `nozram` | 🔄 | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | 🔄 | Menetapkan ukuran swap zram (MB). | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | 🔄 | Menentukan algoritma kompresi zram. Opsi yang tersedia untuk Debian 12: `lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`. Default: `lzo-rle`. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | 🔄 | Menetapkan target systemd default. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | 🔄 | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | 🔄 | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | 🔄 | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Resolusi default di mesin virtual adalah 1280x800. (Hanya berlaku di lingkungan XFCE.) | `novirtres` |
| `virtres` | 🔄 | Menetapkan resolusi layar di mesin virtual (lebar x tinggi). (Hanya berlaku di lingkungan XFCE.) | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | 🔄 | Menentukan komponen live-config yang akan dijalankan. | `components=hostname,user-setup,sudo` |
| `nocomponents` | 🔄 | Menentukan komponen live-config yang TIDAK dijalankan. | `nocomponents=anacron,apport` |
| `hostname` | 🔄 | Menetapkan hostname sistem. | `hostname=minios` |
| `username` | 🔒 | Menetapkan username untuk autologin. | `username=live` |
| `user-default-groups` | 🔒 | Menetapkan grup default untuk user. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | 🔒 | Menetapkan nama lengkap user. | `user-fullname="MiniOS Live User"` |
| `root-password` | 🔒 | Menetapkan password root dalam teks biasa. | `root-password=toor` |
| `root-password-crypted` | 🔒 | Menetapkan password root dalam bentuk terenkripsi. | `root-password-crypted=$y$j9T$...` |
| `user-password` | 🔒 | Menetapkan password user dalam teks biasa. | `user-password=live` |
| `user-password-crypted` | 🔒 | Menetapkan password user dalam bentuk terenkripsi. | `user-password-crypted=$y$j9T$...` |
| `locales` | 🔄 | Menetapkan locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | 🔄 | Menetapkan zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | 🔄 | Menetapkan model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | 🔄 | Menetapkan layout keyboard (dipisahkan koma). | `keyboard-layouts=us,de` |
| `keyboard-variants` | 🔄 | Menetapkan varian keyboard (dipisahkan koma). | `keyboard-variants=,dvorak` |
| `keyboard-options` | 🔄 | Menetapkan opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | 🔒 | Menonaktifkan hak sudo dan policykit. | `noroot` |
| `noautologin` | 🔄 | Menonaktifkan autologin baik di konsol maupun grafis. | `noautologin` |
| `nottyautologin` | 🔄 | Menonaktifkan autologin hanya di konsol. | `nottyautologin` |
| `nox11autologin` | 🔄 | Menonaktifkan autologin hanya di grafis. | `nox11autologin` |
| `xorg-driver` | 🔄 | Menetapkan driver xorg, bukan deteksi otomatis. | `xorg-driver=nouveau` |
| `xorg-resolution` | 🔄 | Menetapkan resolusi xorg, bukan deteksi otomatis. | `xorg-resolution=1920x1080` |
| `module-mode` | 🔄 | Menetapkan mode modul konfigurasi live. Jika disetel ke "merged", mengintegrasikan perubahan konfigurasi secara dinamis. | `module-mode=merged` |
| `hooks` | 🔄 | Menjalankan file dari filesystem, media, atau URL secara bebas. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum pada semua distribusi Linux.

Untuk informasi detail tentang parameter live-config, lihat [live-config](/configuration/live-config.md).
