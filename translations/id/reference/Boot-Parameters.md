---
updated: 2026-09-16
---

# Parameter boot

## Cara menggunakan parameter boot

Parameter boot menyesuaikan cara MiniOS dijalankan. Pisahkan setiap parameter dengan spasi pada command line kernel.

### Syslinux

- Tekan <kbd>Esc</kbd> saat urutan boot MiniOS untuk mengakses menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter lalu tekan <kbd>Enter</kbd> untuk memulai booting.

### GRUB

- Tekan <kbd>E</kbd> pada menu GRUB.
- Edit parameter boot di akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk boot dengan pengaturan baru.

## Parameter boot

Kolom aplikasi membedakan parameter yang biasanya diterima setiap kali boot dari pengaturan akun yang ditujukan untuk penyiapan awal. Dengan persistensi, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/reference/configuration/live-config).

Tabel ini adalah referensi cepat. Prioritas sumber dan bentuk yang diterima `from=` didefinisikan di [Initrd system discovery](/reference/boot-process/System-Discovery), pemfilteran modul di [Initrd module loading](/reference/boot-process/Module-Loading), pemilihan persistensi di [Initrd persistence](/reference/boot-process/Persistence-Internals), dan kombinasi yang didukung di [Boot modes](/using-minios/Boot-Modes).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, path perangkat yang didukung, atau ISO. Bentuk perangkat UUID, PARTUUID, dan by-id tidak diproses. Sebuah **`http://` saja** URL memiliki prioritas lebih tinggi dibandingkan `ip=` dan memulai [network boot](/reference/boot-process/Network-Boot) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Menjaga `.sb` kandidat yang path-nya sesuai dengan regular expression extended yang tidak berjangkar; koma menjadi alternasi, dan seluruh rentang numerik naik memiliki ekspansi khusus. Juga memfilter `toram=trim`. Dapat mengecualikan modul inti atau kernel dan membuat sistem tidak dapat boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang path-nya sesuai dengan regular expression extended yang tidak berjangkar, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama `.sb` literal, sehingga ekstensi kustom tidak dapat mengoordinasikan modul `01-kernel`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output waktu proses saat startup. | `timing` |
| `union` | Setiap boot | Memilih union filesystem. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan jaringan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE default **7529**). Nilai literal `from=http://...` mengungguli `ip=` dan menggunakan field alamatnya; jika tidak, setiap `ip=` yang tidak kosong memaksa unduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Network boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk boot jaringan HTTP ISO (`from=http://…`). Lihat [Network boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistensi bernomor atau sebuah aksi: `resume`, `new`, atau `ask`. Pemilih numerik yang tidak ada dapat kembali ke default metadata; ini tidak memesan atau membuat nomor tersebut. Sebuah perangkat/jalur atau `askdisk` memilih lokasi persistensi lain. Gunakan akhiran yang dipisahkan tanda titik dua untuk jalur kustom. Tanpa parameter persistensi, MiniOS akan mulai dari awal. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran kontainer logis untuk `dynfilefs`, `dynblk`, dan `raw`; tidak berlaku untuk `native` atau `squashfs`. Angka polos atau nilai `M`/`MB` dialokasikan dalam MiB; `G`/`GB` dan `T`/`TB` dikonversi menjadi 1000 dan 1.000.000 MiB. Tanpa ukuran eksplisit, sesi DynFileFS dan DynBlk yang dibuat initrd menggunakan hingga 16 GiB dan akan mengurangi default tersebut jika ruang cadangan kurang setelah `perchreserve`; DynFileFS juga memperhitungkan overhead indeks dan batas RAM. DynBlk memiliki batas kapasitas virtual 512 GiB. Payload DynFileFS dan data backing DynBlk bertambah sesuai kebutuhan, sementara DynFileFS juga memesan indeks untuk kapasitas logis yang dideklarasikan. Permintaan raw dibatasi hingga 1.000.000 MiB dan oleh ruang yang tersedia setelah `perchreserve`; Raw dibatasi hingga 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Kontainer raw baru secara default berukuran 4000 MiB. Manajer Sesi MiniOS masih menetapkan default kontainer DynFileFS yang dibuat manual ke 4000 MiB dan DynBlk ke 16 GiB. Lihat [Persistensi initrd](/reference/boot-process/Persistence-Internals) untuk perilaku memori backend dan penyimpanan. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Setiap boot | Margin alokasi dan ambang peringatan ruang rendah dalam MiB. Nilai ini akan dikurangkan saat menentukan ukuran container baru atau yang bertambah, namun ini bukan kuota runtime dan tidak mencegah penulisan berikutnya memenuhi perangkat. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistensi.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: container format-400 berbasis FUSE yang dapat diperluas, termasuk di FAT32, NTFS, atau exFAT.<br>`dynblk`: perangkat blok kernel format-1 terpisah yang didukung oleh thin `volumeNNN.db` file; jumlah `/dev/dynblkN` aktual dialokasikan secara dinamis dan beberapa volume dapat berjalan bersamaan.<br>`raw`: image ext4 berukuran tetap.<br>`squashfs`: snapshot terkompresi yang diekstrak ke lapisan atas yang didukung oleh RAM. Penyiapan initrd hanya membuat metadata generasi-nol; sistem berjalan akan membuat snapshot pertama sesuai permintaan atau saat shutdown. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Hanya saat pembuatan | Lapisan enkripsi opsional untuk `raw`, `dynfilefs`, atau `dynblk` sesi yang baru dibuat. `perchencrypt=luks` membutuhkan kemampuan `luks-layer-v1` initramfs versi. Sesi yang sudah ada hanya mengambil enkripsi dari `session_encryption[N]`, jadi parameter ini tidak mengubah atau mengonversi sesi tersebut. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Hanya saat pembuatan | Memilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`. Codec kernel yang dipilih harus tersedia. Jika `perchencrypt=luks` membungkus DynBlk, MiniOS memaksa kompresi DynBlk ke `none`. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Setiap boot | Mengaktifkan jalur resume persistensi lama. Tidak seperti `perchdir=resume`, mode ini tidak otomatis membuat pengganti yang kompatibel jika tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | Bare `toram` adalah `full`. Dengan persistensi, salinan level teratas full `*` mengabaikan dotfile; tanpa persistensi, salinan tersebut mengabaikan `changes` tetapi menyalin entri level teratas lainnya, termasuk dotfile. Trim hanya menyalin `config.conf`, file reguler `authorized_keys`, modul level teratas dan rekursif yang dipilih, serta seluruh pohon `changes/` saat persistensi diminta; mode ini mengabaikan `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lainnya, dan tier modul-persistensi terpisah. Tidak ada mode yang memeriksa kapasitas RAM terlebih dahulu. Penyimpanan persistensi yang disalin ke RAM bersifat non-durable, dan perubahan tidak disalin kembali. Lepaskan media hanya setelah memastikan sumber, loop, dan mapping telah terlepas dengan sukses. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Setiap boot | Selalu memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan pemasangan otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan zram swap. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran zram swap dalam MiB. Jika dikosongkan, MiniOS akan menghitungnya berdasarkan total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung pada kernel yang berjalan. Jika dikosongkan, kernel akan menggunakan pengaturan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur target default systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Menjalankan hanya komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap boot | Menjalankan semua komponen live-config kecuali yang terdaftar. | `nocomponents=anacron,apport` |
| `hostname` | Setiap boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Pengaturan awal | Mengatur nama pengguna yang dibuat untuk autologin. | `username=live` |
| `user-default-groups` | Pengaturan awal | Mengatur grup default untuk pengguna yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Pengaturan awal | Mengatur nama lengkap pengguna yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Pengaturan awal | Mengatur kata sandi root dalam bentuk teks biasa. | `root-password=toor` |
| `root-password-crypted` | Pengaturan awal | Mengatur kata sandi root sebagai hash kriptografi. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Pengaturan awal | Mengatur kata sandi pengguna dalam bentuk teks biasa. | `user-password=live` |
| `user-password-crypted` | Pengaturan awal | Mengatur kata sandi pengguna sebagai hash kriptografi. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap boot | Mengatur satu atau beberapa locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap boot | Mengatur tata letak keyboard yang dipisahkan dengan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap boot | Mengatur varian keyboard yang dipisahkan koma sesuai dengan tata letaknya. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Pengaturan awal | Mencegah live-config memberikan hak istimewa sudo dan policykit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur autologin konsol dan grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Mencegah pengaturan autologin konsol saja; konfigurasi persisten yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Mencegah pengaturan autologin grafis saja; konfigurasi persisten yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg secara manual daripada deteksi otomatis. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg secara manual, bukan deteksi otomatis. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Pertimbangan Keamanan

Baris perintah kernel berbentuk teks biasa dan biasanya terlihat pada konfigurasi bootloader, `/proc/cmdline`, serta diagnostik. Jangan menempatkan rahasia yang dapat digunakan ulang di `root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted` yang sesuai, namun tetap perlakukan hash sandi yang terekspos sebagai data sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. `http://` hook tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan bisa menggantinya. Gunakan hanya konten dan mekanisme distribusi yang Anda percaya; jangan gunakan HTTP hook tanpa autentikasi untuk proses startup yang sensitif terhadap keamanan.

Pisahkan perintah dengan spasi. Lihat `man bootparam` halaman referensi untuk parameter kernel tambahan yang umum di semua distribusi Linux.

Untuk informasi detail tentang parameter live-config, lihat [live-config](/reference/configuration/live-config).

Untuk memuat MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/reference/boot-process/Network-Boot).
