---
updated: 2026-10-06
---

# Parameter boot

## Cara menggunakan parameter boot

Parameter boot menyesuaikan cara MiniOS dijalankan. Pisahkan setiap parameter dengan spasi pada baris perintah kernel.

### Syslinux

- Tekan <kbd>Esc</kbd> saat urutan boot MiniOS untuk mengakses menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter lalu tekan <kbd>Enter</kbd> untuk memulai booting.

### GRUB

- Tekan <kbd>E</kbd> pada menu GRUB.
- Edit parameter boot di akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk boot dengan pengaturan baru.

## Parameter boot

Kolom aplikasi membedakan parameter yang biasanya diterima di setiap proses boot dari pengaturan akun yang ditujukan untuk penyiapan awal. Dengan persistence, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/reference/configuration/live-config).

Tabel ini adalah referensi cepat. Prioritas sumber dan bentuk yang diterima `from=` diatur dalam [Initrd system discovery](/reference/boot-process/System-Discovery), pemfilteran modul di [Initrd module loading](/reference/boot-process/Module-Loading), pemilihan persistence di [Initrd persistence](/reference/boot-process/Persistence-Internals), dan kombinasi yang didukung di [Boot modes](/using-minios/Boot-Modes).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, path perangkat yang didukung, atau ISO. Bentuk perangkat UUID, PARTUUID, dan by-id tidak diproses. Sebuah **`http://` saja** URL memiliki prioritas dibandingkan `ip=` dan memulai [network boot](/reference/boot-process/Network-Boot) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Menyimpan `.sb` kandidat yang path-nya cocok dengan regular expression extended tanpa anchor; koma menjadi alternasi, dan seluruh rentang numerik naik memiliki ekspansi khusus. Juga memfilter `toram=trim`. Dapat mengecualikan modul inti atau kernel dan membuat sistem tidak dapat boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang path-nya cocok dengan regular expression extended tanpa anchor, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Mengatur ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama `.sb` secara literal, sehingga ekstensi kustom tidak dapat mengoordinasikan modul `01-kernel` tersebut. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan output waktu mulai. | `timing` |
| `union` | Setiap boot | Memilih union filesystem. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan jaringan awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE default **7529**). Nilai literal `from=http://...` mengungguli `ip=` dan menggunakan field alamatnya; jika tidak, setiap nilai `ip=` memaksa unduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Network boot](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk boot jaringan HTTP ISO (`from=http://…`). Lihat [Network boot](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistensi bernomor atau sebuah aksi. `resume` membuka sesi kompatibel default; `setup` memilih backend penyimpanan secara interaktif lalu membuat sesi bernomor baru; `new` membuat sesi baru langsung dari `perchmode`, pengaturan enkripsi, kompresi, dan ukuran yang diminta/default; `ask` menawarkan sesi tersimpan dan otomatis masuk ke pengaturan jika belum ada. Pemilih numerik yang tidak ada dapat kembali ke default metadata; ini tidak memesan atau membuat nomor tersebut. Perangkat/jalur atau `askdisk` memilih lokasi persistensi lain. Gunakan akhiran dengan pemisah titik dua untuk jalur kustom. Tanpa parameter persistensi, MiniOS akan mulai dari awal. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran kontainer logis untuk `dynfilefs`, `dynblk`, `vmdk`, dan `raw`; tidak berlaku untuk `native` atau `squashfs`. Angka polos atau `M`/`MB` nilainya dialokasikan dalam MiB; `G`/`GB` dan `T`/`TB` dikonversi menjadi 1000 dan 1.000.000 MiB. Tanpa ukuran eksplisit, sesi DynFileFS, DynBlk, dan VMDK yang dibuat initrd menggunakan hingga 16 GiB dan akan menyesuaikan default tersebut jika ruang cadangan kurang setelah `perchreserve`; DynFileFS juga memperhitungkan overhead indeks dan batas RAM. DynBlk memeriksa batas backend terpasang menggunakan `dynblk limits --format dynblk` (atau `--format vmdk` untuk VMDK); tidak ada batas terpisah 512-GiB. Payload DynFileFS dan data cadangan DynBlk akan bertambah sesuai kebutuhan, sedangkan DynFileFS juga memesan indeks untuk kapasitas logis yang ditentukan. Permintaan raw dibatasi hingga 1.000.000 MiB dan oleh ruang yang tersedia setelah `perchreserve`; Raw dibatasi 4000 MiB pada FAT32 baik terenkripsi maupun tidak. Kontainer raw baru default ke 4000 MiB. Manajer Sesi MiniOS tetap mengatur kontainer DynFileFS yang dibuat manual ke 4000 MiB dan DynBlk/VMDK ke 16 GiB. Lihat [Initrd persistence](/reference/boot-process/Persistence-Internals) untuk perilaku backend memori dan penyimpanan. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Setiap boot | Margin alokasi dan ambang peringatan ruang rendah dalam MiB. Nilai ini akan dikurangkan saat mengatur ukuran container baru atau yang bertambah, namun ini bukan kuota runtime dan tidak mencegah penulisan berikutnya hingga perangkat penuh. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persistensi.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulis.<br>`dynfilefs`: format container format-400 berbasis FUSE yang dapat diperluas, termasuk pada FAT32, NTFS, atau exFAT.<br>`dynblk`: perangkat blok kernel format-1 terpisah yang didukung oleh thin `volumeNNN.db` file; jumlah `/dev/dynblkN` aktual dialokasikan secara dinamis dan beberapa volume dapat berjalan bersamaan.<br>`vmdk`: file sparse terpisah standar `volume.vmdk` / `volume-sNNN.vmdk` file yang diekspos oleh driver DynBlk; tanpa kompresi. Membutuhkan kemampuan `vmdk-session-v1` initrd versi tertentu.<br>`raw`: image ext4 dengan ukuran tetap.<br>`squashfs`: snapshot terkompresi yang diekstrak ke layer atas yang didukung oleh RAM. Penyiapan initrd hanya membuat metadata generasi-nol; sistem berjalan akan membuat snapshot pertama sesuai permintaan atau saat shutdown. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Hanya saat pembuatan | Lapisan enkripsi opsional untuk `raw`, `dynfilefs`, `dynblk`, atau `vmdk` sesi yang baru dibuat. `perchencrypt=luks` memerlukan kemampuan `luks-layer-v1` initramfs versi tertentu. Sesi yang sudah ada hanya mengambil enkripsi dari `session_encryption[N]`, sehingga parameter ini tidak mengubah atau mengonversi sesi tersebut. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Hanya saat pembuatan | Memilih kompresi backend DynBlk untuk sesi DynBlk yang baru dibuat: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`. Codec kernel yang dipilih harus tersedia. Jika `perchencrypt=luks` membungkus DynBlk, MiniOS memaksa kompresi DynBlk ke `none`. VMDK tidak memiliki kompresi: boot akan mengabaikan codec non-`none` dengan peringatan. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Setiap boot | Mengaktifkan jalur resume persistensi lama. Tidak seperti `perchdir=resume`, fitur ini tidak otomatis membuat pengganti yang kompatibel jika tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | Mengatur penyalinan MiniOS **data sistem** ke RAM. Bare `toram` akan `full`; `trim` menyalin konfigurasi yang diperlukan dan set modul yang dipilih, tanpa menyertakan data sumber lain yang tidak terkait. Penyalinan data persistensi diatur secara terpisah oleh `perchtoram`. Ketika persistensi diminta dan `perchtoram` tidak ditentukan, mode `toram` apa pun yang aktif akan menggunakan penyalinan persistensi secara default ke `trim`. Lepaskan media hanya setelah memastikan bahwa sumber asli, loop, mapping, dan penyimpanan persistensi yang diperlukan sudah terlepas dengan sukses. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Setiap boot dengan persistensi | Mengatur penyalinan sesi persistensi yang didukung secara independen dari `toram` sistem: `off` menjaga sesi tetap di penyimpanan aslinya, `trim` hanya menyalin sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang dipilih beserta metadata yang sesuai, dan `full` menyalin semua sesi container/SquashFS yang didukung dari penyimpanan tersebut. Sesi direktori native tidak disalin. Default adalah `trim` saat `toram` sistem aktif, jika tidak maka `off`; nilai eksplisit akan diutamakan. Sesi yang disalin akan ditandai sebagai non-durable, namun Session Manager saat ini dapat secara eksplisit menyimpan perubahan yang didukung oleh RAM ke penyimpanan asli atau sebagai sesi baru jika penyimpanan tersebut masih tersedia dan identitasnya masih cocok. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan mounting otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan zram swap. | `nozram` |
| `zramsize` | Setiap boot | Mengatur ukuran zram swap dalam MiB. Jika dikosongkan, MiniOS akan menghitungnya dari total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan tergantung pada kernel yang berjalan. Jika dikosongkan, kernel akan menggunakan default. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Mengatur default systemd target. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd tertentu saat booting. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap kali boot | Menonaktifkan layanan systemd tertentu saat booting. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap kali boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap kali boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap kali boot | Menjalankan hanya komponen live-config yang terdaftar, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap kali boot | Menjalankan semua komponen live-config kecuali yang terdaftar. | `nocomponents=anacron,apport` |
| `hostname` | Setiap kali boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Pengaturan awal | Mengatur nama pengguna yang dibuat untuk autologin. | `username=live` |
| `user-default-groups` | Pengaturan awal | Mengatur grup default untuk pengguna yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Pengaturan awal | Mengatur nama lengkap pengguna yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Pengaturan awal | Mengatur kata sandi root dalam bentuk teks biasa. | `root-password=toor` |
| `root-password-crypted` | Pengaturan awal | Mengatur kata sandi root sebagai crypt hash. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Pengaturan awal | Mengatur kata sandi pengguna dalam bentuk teks biasa. | `user-password=live` |
| `user-password-crypted` | Pengaturan awal | Mengatur kata sandi pengguna sebagai crypt hash. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap kali boot | Mengatur satu atau beberapa locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap kali boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap kali boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap kali boot | Mengatur layout keyboard yang dipisahkan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap kali boot | Mengatur varian keyboard yang dipisahkan koma sesuai dengan layout. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap kali boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Pengaturan awal | Mencegah live-config memberikan hak istimewa sudo dan policykit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur autologin konsol dan grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Hanya mencegah pengaturan autologin konsol; konfigurasi persisten yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Hanya mencegah pengaturan autologin grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg secara manual, bukan autodetection. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg secara manual, bukan autodetection. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, perubahan konfigurasi akan langsung diterapkan ke sistem live yang sedang berjalan. | `module-mode=merged` |
| `link-user-dirs` | Setiap boot | Menautkan direktori pengguna yang dikelola ke media MiniOS yang dapat ditulis. Opsi ini tidak dapat digunakan bersamaan dengan `bind-user-dirs` dan tidak tersedia dengan mode `toram` apa pun atau saat sesi persistensi aktif dienkripsi dengan LUKS. Enkripsi aktif ditentukan dari sesi yang sedang berjalan, bukan dari permintaan `perchencrypt` pembuatan. | `link-user-dirs` |
| `bind-user-dirs` | Setiap boot | Bind-mount direktori pengguna yang dikelola dari media MiniOS yang dapat ditulis. Memiliki batasan `toram` dan enkripsi sesi aktif yang sama seperti `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Setiap boot | Mengatur lokasi relatif media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Default: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari filesystem, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

## Pertimbangan keamanan

Baris perintah kernel berbentuk teks biasa dan biasanya terlihat di konfigurasi bootloader, `/proc/cmdline`, serta diagnostik. Jangan letakkan rahasia yang dapat digunakan kembali di `root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted` terkait, namun tetap perlakukan hash sandi yang terekspos sebagai data sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. Sebuah `http://` hook tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan bisa menggantinya. Gunakan hanya konten dan mekanisme distribusi yang Anda percayai; jangan gunakan HTTP hook tanpa autentikasi untuk proses startup yang sensitif terhadap keamanan.

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum di semua distribusi Linux.

Untuk informasi lebih detail tentang parameter live-config, lihat [live-config](/reference/configuration/live-config).

Untuk memuat MiniOS melalui jaringan (PXE dan HTTP ISO), lihat [Network boot](/reference/boot-process/Network-Boot).

## Parameter cache sesi-persisten dan log

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `log-storage` atau `live-config.log-storage` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile`. Dalam mode volatile, journald menggunakan hingga 32 MiB RAM dan `/var/log` menggunakan tmpfs 32 MiB. `minios-boot` dan `live-config` log boot tetap berada di media penyimpanan persisten yang dapat ditulis. Filesystem log RAM yang penuh akan berhenti menerima penulisan daripada meluap ke perangkat USB. | `log-storage=volatile` |
| `apt-cache` atau `live-config.apt-cache` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile` untuk `/var/cache/apt/archives`. Mount RAM berukuran 256 atau 512 MiB jika memori cukup tersedia dan tidak ada swap non-zRAM yang aktif; unduhan besar dapat menghabiskannya. `/var/lib/apt/lists` dan status dpkg tetap persisten. | `apt-cache=volatile` |
| `browser-cache` atau `live-config.browser-cache` | Setiap boot, dengan `perch` | `persistent` (default) atau `volatile` untuk cache browser native standar. Setelah pengguna live keluar, beberapa `~/.cache` subdirektori menggunakan tmpfs bersama 512 MiB, dan caching disk Firefox dinonaktifkan oleh kebijakan sistem terkelola jika tidak ada file kebijakan Firefox lain. Profil dan cache aplikasi lain yang tidak terkait tetap persisten. | `browser-cache=volatile` |

Ketiga parameter storage-policy diproses oleh `minios-boot` sebelum sistem init normal, **bukan** oleh pemilih persistensi awal. Parameter ini tidak mengaktifkan `perch` dan hanya berlaku setelah aktivasi persistensi yang berhasil. Initrd yang kompatibel akan mengumumkan `perch-storage-v1` di `/run/initramfs/etc/minios-initramfs-storage`. Configurator dan `config.conf` menyediakan pilihan yang sama; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk batasan, prioritas, dan catatan instalasi browser.
