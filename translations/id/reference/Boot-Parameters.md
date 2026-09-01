---
updated: 2026-08-26
---

# Parameter boot

## Cara menggunakan parameter boot

Parameter boot digunakan untuk menyesuaikan cara MiniOS melakukan proses startup. Pisahkan setiap parameter dengan spasi pada baris perintah kernel.

### Syslinux

- Tekan <kbd>Esc</kbd> saat proses boot MiniOS untuk mengakses menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter yang diinginkan lalu tekan <kbd>Enter</kbd> untuk melakukan boot.

### GRUB

- Tekan <kbd>E</kbd> pada menu GRUB.
- Edit parameter boot di akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk melakukan boot dengan pengaturan baru.

## Parameter boot

Kolom aplikasi membedakan parameter yang biasanya diterima pada setiap proses boot dari pengaturan akun yang ditujukan untuk penyiapan awal. Dengan persistensi, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/reference/configuration/live-config).

Tabel ini adalah referensi cepat. Prioritas sumber dan bentuk `from=` yang diterima dijelaskan di [Penemuan sistem Initrd](/reference/boot-process/System-Discovery), pemfilteran modul di [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading), pemilihan persistensi di [Persistensi Initrd](/reference/boot-process/Persistence-Internals), dan kombinasi yang didukung di [Mode boot](/using-minios/Boot-Modes).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, path perangkat yang didukung, atau ISO. Bentuk UUID, PARTUUID, dan by-id perangkat tidak diproses. URL **`http://` only** literal memiliki prioritas dibanding `ip=` dan akan memulai [network boot](/reference/boot-process/Network-Boot) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Menyaring kandidat `.sb` yang path-nya cocok dengan regular expression extended yang tidak ter-anchored; koma menjadi alternasi, dan rentang numerik naik utuh memiliki ekspansi khusus. Juga memfilter `toram=trim`. Dapat mengecualikan modul inti atau kernel dan dapat membuat sistem tidak dapat boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang path-nya cocok dengan regular expression extended yang tidak ter-anchored, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama literal `.sb`, sehingga ekstensi kustom tidak dapat mengoordinasikan modul `01-kernel`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output timing saat startup. | `timing` |
| `union` | Setiap boot | Memilih union filesystem. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan jaringan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE default **7529**). `from=http://...` literal akan menang atas `ip=` dan menggunakan field alamatnya; jika tidak, setiap `ip=` yang tidak kosong memaksa unduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Network boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk network boot ISO HTTP (`from=http://…`). Lihat [Network boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistensi bernomor atau aksi: `resume`, `new`, atau `ask`. Selector numerik yang tidak ada dapat kembali ke default metadata; tidak akan memesan atau membuat nomor tersebut. Path perangkat atau bentuk `askdisk` memilih lokasi persistensi lain. Gunakan akhiran yang dipisahkan titik dua untuk path kustom. Tanpa parameter persistensi, MiniOS akan mulai dari awal. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran container untuk `dynfilefs`, `raw`, dan `luks`; tidak berlaku untuk `native` atau `squashfs`. Angka polos atau nilai `M`/`MB` dialokasikan dalam MiB; `G`/`GB` dan `T`/`TB` dikonversi ke 1000 dan 1.000.000 MiB. Batasnya 1.000.000 MiB, dibatasi lagi oleh ruang yang tersedia setelah `perchreserve`. Manajer Sesi MiniOS membatasi file raw dan LUKS pada 4000 MiB di FAT32; LUKS initrd menerapkan batas itu, tetapi permintaan raw initrd yang terlalu besar bisa gagal alih-alih dikurangi. Container raw dan LUKS baru default ke 4000 MiB. DynFileFS yang dibuat initramfs default ke kapasitas tersedia dibulatkan ke bawah menjadi 1000 MiB; Manajer Sesi MiniOS default ke 4000 MiB. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=1TB` |
| `perchreserve` | Setiap boot | Margin alokasi dan ambang peringatan ruang rendah dalam MiB. Ini akan dikurangkan saat mengatur ukuran container baru atau memperbesar, tetapi bukan kuota runtime dan tidak mencegah penulisan berikutnya yang memenuhi perangkat. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistensi.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: container yang dapat diperluas, termasuk di FAT32, NTFS, atau exFAT.<br>`raw`: image ext4 berukuran tetap.<br>`luks`: container ext4 terenkripsi LUKS2; pembuatan dan pembukaan membutuhkan prompt di konsol dan dukungan crypt di initramfs.<br>`squashfs`: snapshot terkompresi yang sudah ada dan diekstrak untuk sesi. Manajer Sesi MiniOS dapat membuat dan menyimpan snapshot SquashFS dari sistem yang sedang berjalan; initramfs dapat melanjutkan tetapi tidak dapat membuatnya. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=raw`<br>`perchmode=luks`<br>`perchmode=squashfs` |
| `perch` | Setiap boot | Mengaktifkan jalur resume persistensi lama. Tidak seperti `perchdir=resume`, tidak secara otomatis membuat pengganti yang kompatibel jika tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | `toram` polos adalah `full`. Dengan persistensi, salinan `*` tingkat atas full menghilangkan dotfile; tanpa persistensi, menghilangkan `changes` tetapi menyalin entri tingkat atas lain, termasuk dotfile. Trim menyalin `config.conf` yang diperlukan, `authorized_keys` file reguler, modul terpilih tingkat atas dan rekursif, dan seluruh pohon `changes/` saat persistensi diminta; menghilangkan `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lain, dan tier modul-persistensi terpisah. Tidak ada mode yang memeriksa kapasitas RAM terlebih dahulu. Penyimpanan persistensi yang disalin ke RAM tidak tahan lama, dan perubahan tidak disalin kembali. Lepaskan media hanya setelah memastikan sumber, loop, dan mapping terlepas dengan sukses. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan mounting otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran swap zram dalam MiB. Jika dikosongkan, MiniOS menghitungnya dari total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung kernel yang berjalan. Jika dikosongkan, kernel akan mempertahankan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur target default systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Hanya menjalankan komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
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
| `noautologin` | Setiap boot | Mencegah live-config menyiapkan autologin konsol dan grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Mencegah penyiapan autologin konsol saja; konfigurasi persisten yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Mencegah penyiapan autologin grafis saja; konfigurasi persisten yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg daripada deteksi otomatis. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg daripada deteksi otomatis. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Pertimbangan keamanan

Baris perintah kernel berbentuk plaintext dan biasanya terlihat di konfigurasi bootloader, `/proc/cmdline`, dan diagnostik. Jangan letakkan rahasia yang dapat digunakan ulang di `root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted` yang sesuai, namun tetap perlakukan hash password yang terekspos sebagai data sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. Hook `http://` tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan dapat menggantinya. Gunakan hanya konten dan mekanisme distribusi yang Anda percayai; jangan gunakan hook HTTP tanpa autentikasi untuk proses startup yang sensitif terhadap keamanan.

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum pada semua distribusi Linux.

Untuk informasi detail tentang parameter live-config, lihat [live-config](/reference/configuration/live-config).

Untuk pemuatan MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/reference/boot-process/Network-Boot).
