---
updated: 2026-09-26
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

Kolom aplikasi membedakan parameter yang biasanya diterima pada setiap proses boot dari pengaturan akun yang dimaksudkan untuk penyiapan awal. Dengan mode persistensi, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/reference/configuration/live-config).

Tabel ini adalah referensi cepat. Prioritas sumber dan bentuk yang diterima `from=` diatur dalam [Penemuan sistem Initrd](/reference/boot-process/System-Discovery), pemfilteran modul di [Pemrosesan modul Initrd](/reference/boot-process/Module-Loading), pemilihan persistensi di [Persistensi Initrd](/reference/boot-process/Persistence-Internals), dan kombinasi yang didukung di [Mode boot](/using-minios/Boot-Modes).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, path perangkat yang didukung, atau ISO. Bentuk perangkat UUID, PARTUUID, dan by-id tidak diproses. Jika menggunakan literal **`http://` saja,** URL akan diutamakan dibandingkan `ip=` dan memulai [boot jaringan](/reference/boot-process/Network-Boot) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Menyimpan kandidat `.sb` yang path-nya cocok dengan regular expression extended yang tidak di-anchored; koma menjadi alternatif, dan seluruh rentang angka naik memiliki ekspansi khusus. Juga memfilter `toram=trim`. Dapat mengecualikan modul inti atau kernel dan membuat sistem tidak dapat boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang path-nya cocok dengan regular expression extended yang tidak di-anchored, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama `.sb` literal, sehingga ekstensi kustom tidak dapat mengkoordinasikan modul `01-kernel`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output waktu startup. | `timing` |
| `union` | Setiap boot | Memilih filesystem union. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan jaringan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE default **7529**). Literal `from=http://...` akan diutamakan dibandingkan `ip=` dan menggunakan field alamatnya; jika tidak, setiap `ip=` yang tidak kosong memaksa unduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Boot jaringan](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk boot jaringan HTTP ISO (`from=http://…`). Lihat [Boot jaringan](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistensi bernomor atau tindakan: `resume`, `new`, atau `ask`. Selector numerik yang tidak ada dapat menggunakan default metadata; tidak akan memesan atau membuat nomor tersebut. Perangkat/path atau bentuk `askdisk` akan memilih lokasi persistensi lain. Gunakan akhiran yang dipisahkan tanda titik dua untuk path kustom. Tanpa parameter persistensi, MiniOS akan mulai dari awal. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran kontainer logis untuk `dynfilefs`, `dynblk`, `vmdk`, dan `raw`; tidak berlaku untuk `native` atau `squashfs`. Angka saja atau nilai `M`/`MB` akan dialokasikan dalam MiB; `G`/`GB` dan `T`/`TB` diubah menjadi 1000 dan 1.000.000 MiB. Jika tanpa ukuran eksplisit, sesi initrd-DynFileFS, DynBlk, dan VMDK akan menggunakan hingga 16 GiB dan mengurangi default tersebut bila sisa ruang lebih sedikit setelah `perchreserve`; DynFileFS juga memperhitungkan overhead indeks dan batas RAM. DynBlk akan memeriksa batas backend terpasang menggunakan `dynblk limits --format dynblk` (atau `--format vmdk` untuk VMDK); tidak ada batas terpisah 512-GiB. Payload DynFileFS dan data backing DynBlk akan bertambah sesuai kebutuhan, sedangkan DynFileFS juga memesan indeks untuk kapasitas logis yang ditentukan. Permintaan raw dibatasi pada 1.000.000 MiB dan oleh ruang yang tersedia setelah `perchreserve`; Raw dibatasi 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Kontainer raw baru default ke 4000 MiB. Manajer Sesi MiniOS masih mengatur kontainer DynFileFS yang dibuat manual ke 4000 MiB dan DynBlk/VMDK ke 16 GiB. Lihat [Persistensi Initrd](/reference/boot-process/Persistence-Internals) untuk perilaku backend memori dan penyimpanan. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Setiap boot | Margin alokasi dan ambang peringatan ruang rendah dalam MiB. Nilai ini dikurangkan saat mengatur ukuran kontainer baru atau memperbesar, tetapi bukan kuota runtime dan tidak mencegah penulisan selanjutnya hingga perangkat penuh. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistensi.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: kontainer format-400 berbasis FUSE yang dapat diperluas, termasuk pada FAT32, NTFS, atau exFAT.<br>`dynblk`: perangkat blok kernel format-1 terpisah yang didukung oleh file tipis `volumeNNN.db`; nomor `/dev/dynblkN` dialokasikan secara dinamis dan beberapa volume dapat berdampingan.<br>`vmdk`: file sparse split standar `volume.vmdk` / `volume-sNNN.vmdk` yang diekspos oleh driver DynBlk; tanpa kompresi. Membutuhkan kapabilitas initrd versi tertentu.`vmdk-session-v1` initrd.<br>`raw`: image ext4 dengan ukuran tetap.<br>`squashfs`: snapshot terkompresi yang diekstrak ke upper layer berbasis RAM. Setup initrd hanya membuat metadata generasi nol; sistem berjalan akan membuat snapshot pertama sesuai permintaan atau saat shutdown. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Hanya saat pembuatan | Lapisan enkripsi opsional untuk `raw`, `dynfilefs`, `dynblk`, atau sesi `vmdk`. `perchencrypt=luks` membutuhkan kapabilitas initramfs versi tertentu. Sesi yang sudah ada hanya mengambil enkripsi dari `luks-layer-v1`; parameter ini tidak mengubah atau mengkonversi sesi tersebut.`session_encryption[N]` | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Hanya saat pembuatan | Memilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`. Codec kernel yang dipilih harus tersedia. Jika `perchencrypt=luks` membungkus DynBlk, MiniOS memaksa kompresi DynBlk ke `none`. VMDK tidak mendukung kompresi: boot akan mengabaikan codec non-`none` dengan peringatan. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Setiap boot | Mengaktifkan jalur resume persistensi lama. Tidak seperti `perchdir=resume`, tidak otomatis membuat pengganti yang kompatibel jika tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | Hanya `toram` saja.`full` Dengan persistensi, salinan level atas full `*` mengabaikan dotfiles; tanpa persistensi akan mengabaikan `changes` tetapi menyalin entri level atas lain, termasuk dotfiles. Trim menyalin `config.conf` yang diperlukan, file reguler `authorized_keys`, modul terpilih level atas dan rekursif, serta seluruh pohon `changes/` saat persistensi diminta; mengabaikan `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lain, dan tier modul-persistensi terpisah. Tidak ada mode yang memeriksa kapasitas RAM terlebih dahulu. Penyimpanan persistensi yang disalin ke RAM tidak tahan lama, dan perubahan tidak disalin kembali. Lepaskan media hanya setelah memastikan sumber, loop, dan mapping telah dilepas dengan sukses. | `toram`<br>`toram=trim`<br>`toram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan pemasangan otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran swap zram dalam MiB. Jika dikosongkan, MiniOS akan menghitung berdasarkan total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung kernel yang berjalan. Jika dikosongkan, kernel akan mempertahankan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur target default systemd. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd tertentu saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Hanya menjalankan komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap boot | Menjalankan semua komponen live-config kecuali yang terdaftar. | `nocomponents=anacron,apport` |
| `hostname` | Setiap boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Penyiapan awal | Mengatur nama pengguna yang dibuat untuk autologin. | `username=live` |
| `user-default-groups` | Penyiapan awal | Mengatur grup default pengguna yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Penyiapan awal | Mengatur nama lengkap pengguna yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Penyiapan awal | Mengatur password root dalam teks biasa. | `root-password=toor` |
| `root-password-crypted` | Penyiapan awal | Mengatur password root sebagai hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Penyiapan awal | Mengatur password pengguna dalam teks biasa. | `user-password=live` |
| `user-password-crypted` | Penyiapan awal | Mengatur password pengguna sebagai hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap boot | Mengatur satu atau lebih locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap boot | Mengatur layout keyboard yang dipisahkan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap boot | Mengatur varian keyboard yang dipisahkan koma sesuai layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Penyiapan awal | Mencegah live-config memberikan hak sudo dan policykit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur autologin konsol dan grafis; konfigurasi persistensi yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Mencegah pengaturan autologin konsol saja; konfigurasi persistensi yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Mencegah pengaturan autologin grafis saja; konfigurasi persistensi yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg daripada deteksi otomatis. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg daripada deteksi otomatis. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `link-user-dirs` | Setiap boot | Menautkan direktori pengguna yang dikelola ke media MiniOS yang dapat ditulis. Tidak dapat digunakan bersamaan dengan `bind-user-dirs` dan tidak tersedia pada mode `toram` apa pun atau saat sesi persistensi aktif dienkripsi LUKS. Enkripsi aktif ditentukan dari sesi berjalan, bukan dari permintaan pembuatan `perchencrypt`. | `link-user-dirs` |
| `bind-user-dirs` | Setiap boot | Bind-mount direktori pengguna yang dikelola dari media MiniOS yang dapat ditulis. Memiliki batasan `toram` dan enkripsi sesi aktif yang sama seperti `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Setiap boot | Mengatur lokasi relatif media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Default: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Pertimbangan Keamanan

Baris perintah kernel berbentuk teks biasa dan biasanya terlihat pada konfigurasi bootloader, `/proc/cmdline`, serta diagnostik. Jangan menempatkan rahasia yang dapat digunakan ulang di `root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted` yang sesuai, namun tetap perlakukan hash sandi yang terekspos sebagai data sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. `http://` hook tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan bisa menggantinya. Gunakan hanya konten dan mekanisme distribusi yang Anda percaya; jangan gunakan HTTP hook tanpa autentikasi untuk proses startup yang sensitif terhadap keamanan.

Pisahkan perintah dengan spasi. Lihat `man bootparam` halaman referensi untuk parameter kernel tambahan yang umum di semua distribusi Linux.

Untuk informasi detail tentang parameter live-config, lihat [live-config](/reference/configuration/live-config).

Untuk memuat MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/reference/boot-process/Network-Boot).

## Parameter cache sesi persisten dan log

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `log-storage` atau `live-config.log-storage` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile`. Pada mode volatile, journald menggunakan hingga 32 MiB RAM dan `/var/log` menggunakan tmpfs 32 MiB. `minios-boot` dan `live-config` log boot tetap berada di media penyimpanan persisten yang dapat ditulis. Sistem file log RAM yang penuh akan berhenti menerima penulisan, bukan melimpah ke perangkat USB. | `log-storage=volatile` |
| `apt-cache` atau `live-config.apt-cache` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile` untuk `/var/cache/apt/archives`. Mount RAM berukuran 256 atau 512 MiB jika memori cukup tersedia dan tidak ada swap non-zRAM yang aktif; unduhan besar dapat menghabiskannya. `/var/lib/apt/lists` dan status dpkg tetap persisten. | `apt-cache=volatile` |
| `browser-cache` atau `live-config.browser-cache` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile` untuk cache browser-native standar. Setelah pengguna live selesai, beberapa `~/.cache` subdirektori menggunakan tmpfs bersama 512 MiB, dan cache disk Firefox dinonaktifkan melalui kebijakan sistem terkelola jika tidak ada file kebijakan Firefox lain yang tersedia. Profil dan cache aplikasi lain yang tidak terkait tetap persisten. | `browser-cache=volatile` |

Ketiga parameter storage-policy diproses oleh `minios-boot` sebelum sistem init normal, **bukan** oleh pemilih persistensi awal. Parameter ini tidak mengaktifkan `perch` dan hanya berlaku setelah aktivasi persistensi yang berhasil. Initrd yang kompatibel akan menampilkan `perch-storage-v1` pada `/run/initramfs/etc/minios-initramfs-storage`. Konfigurator dan `config.conf` menyediakan pilihan yang sama; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk batasan, prioritas, dan catatan pemasangan browser.
