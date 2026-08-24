# Parameter Boot

## Cara menggunakan parameter boot

Parameter boot digunakan untuk menyesuaikan cara MiniOS melakukan proses startup. Pisahkan setiap parameter dengan spasi pada baris perintah kernel.

### Syslinux

- Tekan <kbd>Esc</kbd> selama proses boot MiniOS untuk mengakses menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter yang diinginkan lalu tekan <kbd>Enter</kbd> untuk memulai boot.

### GRUB

- Tekan <kbd>E</kbd> pada menu GRUB.
- Edit parameter boot di akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk melakukan boot dengan pengaturan baru.

## Parameter boot

Kolom aplikasi membedakan parameter yang biasanya diterima pada setiap proses boot dari pengaturan akun yang ditujukan untuk setup awal. Dengan persistence, komponen live-config biasanya hanya berjalan satu kali; lihat [live-config](/configuration/live-config.md).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, perangkat, atau ISO. ISO remote melalui **`http://` saja** akan memulai [network boot](/installation/Network-Boot.md) (httpfs2). | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk/customdir` |
| `load` | Setiap boot | Hanya memuat modul `.sb` yang sesuai dengan nama, daftar, regular expression, atau rentang angka yang didukung. Juga memfilter modul yang disalin oleh `toram=trim`. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan modul `.sb` yang cocok, termasuk dari `toram=trim`. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output waktu startup. | `timing` |
| `union` | Setiap boot | Memilih filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | **Hanya network boot (PXE).** Alamat statis untuk pengambilan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP default **7529**). `ip=` yang tidak kosong memaksa unduh data PXE dan melewati media lokal. Bukan konfigurasi NetworkManager sesi. Lihat [Network boot](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MB untuk network boot ISO HTTP (`from=http://…`). Lihat [Network boot](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistence bernomor atau sebuah aksi: `resume`, `new`, atau `ask`. Perangkat/path atau bentuk `askdisk` memilih lokasi persistence lain. Tanpa parameter persistence, MiniOS akan memulai secara bersih. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk/customdir` |
| `perchsize` | Setiap boot | Ukuran container untuk `dynfilefs`, `raw`, dan `luks`; tidak berlaku untuk `native` atau `squashfs`. Menerima angka bulat dalam MB atau akhiran `M`/`MB`, `G`/`GB`, atau `T`/`TB`; GB dan TB dikonversi ke 1000 MB dan 1.000.000 MB. Batasnya 1.000.000 MB, dibatasi lagi oleh ruang yang tersedia setelah `perchreserve`; file raw dan LUKS dibatasi maksimal 4000 MB pada FAT32. Container raw dan LUKS baru default ke 4000 MB. DynFileFS yang dibuat initramfs default ke kapasitas yang tersedia dibulatkan ke bawah ke 1000 MB; Session Manager default ke 4000 MB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Setiap boot | Ruang kosong, dalam MiB, yang dipertahankan pada perangkat persistence. Container baru atau yang bertambah tidak akan menggunakannya, dan MiniOS akan memberi peringatan saat ruang kosong mencapainya. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistence.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: container yang dapat diperluas, termasuk pada FAT32, NTFS, atau exFAT.<br>`raw`: image ext4 dengan ukuran tetap.<br>`luks`: container ext4 terenkripsi LUKS2; pembuatan dan pembukaan memerlukan prompt di konsol dan dukungan crypt pada initramfs.<br>`squashfs`: snapshot terkompresi yang sudah ada dan dibuka untuk sesi. Session Manager dapat membuat dan menyimpan snapshot SquashFS dari sistem yang sedang berjalan; initramfs dapat melanjutkan tetapi tidak dapat membuatnya. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Setiap boot | Mengaktifkan persistence dan melanjutkan sesi terakhir. Setara dengan `perchdir=resume`. | `perch` |
| `toram` | Setiap boot | Menyalin MiniOS ke RAM. Tanpa nilai akan menggunakan `full`; `full` menyalin seluruh direktori MiniOS, sedangkan `trim` menyalin set modul yang dipilih oleh `load` dan `noload`. Perubahan yang persisten akan disertakan jika persistence diaktifkan. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan mounting otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran swap zram dalam MiB. Jika tidak diisi, MiniOS akan menghitungnya dari total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung pada kernel yang berjalan. Jika tidak diisi, kernel akan menggunakan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur default systemd target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Hanya menjalankan komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap boot | Menjalankan semua komponen live-config kecuali yang terdaftar. | `nocomponents=anacron,apport` |
| `hostname` | Setiap boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Setup awal | Mengatur username yang dibuat untuk autologin. | `username=live` |
| `user-default-groups` | Setup awal | Mengatur grup default untuk user yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Setup awal | Mengatur nama lengkap user yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Setup awal | Mengatur password root dalam teks biasa. | `root-password=toor` |
| `root-password-crypted` | Setup awal | Mengatur password root sebagai hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Setup awal | Mengatur password user dalam teks biasa. | `user-password=live` |
| `user-password-crypted` | Setup awal | Mengatur password user sebagai hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap boot | Mengatur satu atau lebih locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap boot | Mengatur layout keyboard yang dipisahkan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap boot | Mengatur varian keyboard yang dipisahkan koma sesuai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Setup awal | Mencegah live-config memberikan hak sudo dan policykit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur autologin konsol dan grafis; konfigurasi persistence yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Mencegah pengaturan autologin konsol saja; konfigurasi persistence yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Mencegah pengaturan autologin grafis saja; konfigurasi persistence yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg daripada autodeteksi. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg daripada autodeteksi. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum pada semua distribusi Linux.

Untuk informasi detail tentang parameter live-config, lihat [live-config](/configuration/live-config.md).

Untuk memuat MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/installation/Network-Boot.md).
