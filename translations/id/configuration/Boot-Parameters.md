---
updated: 2026-08-26
---

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

Kolom aplikasi membedakan parameter yang biasanya diterima pada setiap proses boot dari pengaturan akun yang ditujukan untuk penyiapan awal. Dengan persistence, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/configuration/live-config.md).

Tabel ini adalah referensi cepat. Urutan prioritas sumber dan bentuk `from=` yang diterima
didefinisikan di [Initrd system discovery](/configuration/Initrd-System-Discovery.md),
penyaringan modul di [Initrd module loading](/configuration/Initrd-Module-Loading.md),
pemilihan persistence di [Initrd persistence](/configuration/Initrd-Persistence.md),
dan kombinasi yang didukung di [Boot modes](/configuration/Boot-Modes.md).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, path perangkat yang didukung, atau ISO. Bentuk UUID, PARTUUID, dan by-id perangkat tidak diproses. URL **`http://` only** literal akan diutamakan dibanding `ip=` dan memulai [network boot](/installation/Network-Boot.md) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Menyimpan kandidat `.sb` yang path-nya cocok dengan regular expression extended tanpa anchor; koma menjadi alternasi, dan rentang angka naik penuh memiliki ekspansi khusus. Juga memfilter `toram=trim`. Dapat mengecualikan modul inti atau kernel dan membuat sistem tidak dapat boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang path-nya cocok dengan regular expression extended tanpa anchor, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama literal `.sb`, sehingga ekstensi kustom tidak dapat mengoordinasikan modul `01-kernel`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output waktu startup. | `timing` |
| `union` | Setiap boot | Memilih union filesystem. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan jaringan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (default port PXE HTTP **7529**). `from=http://...` literal diutamakan dibanding `ip=` dan menggunakan field alamatnya; jika tidak, setiap `ip=` yang tidak kosong akan memaksa unduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Network boot](/installation/Network-Boot.md). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk network boot HTTP ISO (`from=http://…`). Lihat [Network boot](/installation/Network-Boot.md). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistence bernomor atau aksi: `resume`, `new`, atau `ask`. Selector numerik yang tidak ada dapat kembali ke default metadata; ini tidak memesan atau membuat nomor tersebut. Bentuk perangkat/path atau `askdisk` memilih lokasi persistence lain. Gunakan akhiran dipisahkan tanda titik dua untuk path kustom. Tanpa parameter persistence, MiniOS akan memulai secara bersih. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran container untuk `dynfilefs`, `raw`, dan `luks`; tidak berlaku untuk `native` atau `squashfs`. Angka polos atau nilai `M`/`MB` dialokasikan dalam MiB; `G`/`GB` dan `T`/`TB` dikonversi ke 1000 dan 1.000.000 MiB. Batasnya 1.000.000 MiB, dibatasi lagi oleh ruang yang tersedia setelah `perchreserve`. Session Manager membatasi file raw dan LUKS hingga 4000 MiB pada FAT32; initrd LUKS menerapkan batas tersebut, tetapi permintaan raw initrd yang terlalu besar dapat gagal alih-alih dikurangi. Container raw dan LUKS baru default ke 4000 MiB. DynFileFS yang dibuat initramfs default ke kapasitas yang tersedia dibulatkan ke bawah ke 1000 MiB; Session Manager mendefaultkannya ke 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Setiap boot | Ruang kosong, dalam MiB, yang disisakan di perangkat persistence. Container baru atau yang bertambah tidak menggunakannya, dan MiniOS akan memberi peringatan ketika ruang kosong mencapai batas ini. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistence.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: container yang dapat diperluas, termasuk di FAT32, NTFS, atau exFAT.<br>`raw`: image ext4 berukuran tetap.<br>`luks`: container ext4 terenkripsi LUKS2; pembuatan dan pembukaan memerlukan prompt di konsol serta dukungan crypt di initramfs.<br>`squashfs`: snapshot terkompresi yang sudah ada, diekstrak untuk sesi. Session Manager dapat membuat dan menyimpan snapshot SquashFS dari sistem yang sedang berjalan; initramfs dapat melanjutkan tetapi tidak dapat membuatnya. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Setiap boot | Mengaktifkan jalur resume persistence lama. Tidak seperti `perchdir=resume`, ini tidak otomatis membuat pengganti yang kompatibel saat tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | `toram` polos adalah `full`. Dengan persistence, salinan `*` tingkat atas full menghilangkan dotfile; tanpa persistence akan menghilangkan `changes` tetapi menyalin entri tingkat atas lainnya, termasuk dotfile. Trim menyalin `config.conf` yang diperlukan, `authorized_keys` file reguler, modul tingkat atas dan rekursif terpilih, dan seluruh pohon `changes/` saat persistence diminta; menghilangkan `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lainnya, dan tier modul persistence terpisah. Tidak ada mode yang memeriksa kapasitas RAM terlebih dahulu. Penyimpanan persistence yang disalin ke RAM bersifat tidak tahan lama, dan perubahan tidak disalin kembali. Lepaskan media hanya setelah memastikan sumber, loop, dan mapping telah terlepas dengan sukses. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan mounting otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran swap zram dalam MiB. Jika dikosongkan, MiniOS akan menghitungnya dari total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung pada kernel yang berjalan. Jika dikosongkan, kernel akan mempertahankan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur target default systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Menjalankan hanya komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap boot | Menjalankan semua komponen live-config kecuali yang terdaftar. | `nocomponents=anacron,apport` |
| `hostname` | Setiap boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Penyiapan awal | Mengatur username yang dibuat untuk autologin. | `username=live` |
| `user-default-groups` | Penyiapan awal | Mengatur grup default untuk user yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Penyiapan awal | Mengatur nama lengkap user yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Penyiapan awal | Mengatur password root dalam teks biasa. | `root-password=toor` |
| `root-password-crypted` | Penyiapan awal | Mengatur password root sebagai hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Penyiapan awal | Mengatur password user dalam teks biasa. | `user-password=live` |
| `user-password-crypted` | Penyiapan awal | Mengatur password user sebagai hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap boot | Mengatur satu atau lebih locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap boot | Mengatur layout keyboard yang dipisahkan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap boot | Mengatur varian keyboard yang dipisahkan koma sesuai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Penyiapan awal | Mencegah live-config memberikan hak sudo dan policykit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur autologin konsol dan grafis; konfigurasi persistent yang ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Mencegah pengaturan autologin konsol saja; konfigurasi persistent yang ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Mencegah pengaturan autologin grafis saja; konfigurasi persistent yang ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg daripada autodetection. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg daripada autodetection. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Pertimbangan keamanan

Baris perintah kernel bersifat plaintext dan biasanya terlihat pada konfigurasi bootloader,
`/proc/cmdline`, dan diagnostik. Jangan letakkan rahasia yang dapat digunakan kembali di
`root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted`
yang sesuai, namun tetap perlakukan hash password yang terekspos sebagai data sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. Hook `http://` tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan dapat menggantinya. Gunakan hanya konten dan mekanisme pengiriman yang Anda percayai; jangan gunakan hook HTTP tanpa autentikasi untuk proses startup yang sensitif terhadap keamanan.

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum di semua distribusi Linux.

Untuk informasi detail mengenai parameter live-config, lihat [live-config](/configuration/live-config.md).

Untuk memuat MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/installation/Network-Boot.md).
