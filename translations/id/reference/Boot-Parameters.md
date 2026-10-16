---
updated: 2026-10-15
---

# Parameter boot

## Cara menggunakan parameter boot

Parameter boot menyesuaikan cara MiniOS dimulai. Pisahkan parameter dengan spasi pada baris perintah kernel.

### Syslinux

- Tekan <kbd>Esc</kbd> selama proses boot MiniOS untuk membuka menu boot.
- Tekan <kbd>Tab</kbd> untuk mengedit opsi boot.
- Masukkan parameter, lalu tekan <kbd>Enter</kbd> untuk memulai boot.

### GRUB

- Tekan <kbd>E</kbd> pada menu GRUB.
- Edit parameter boot di bagian akhir baris perintah.
- Tekan <kbd>F10</kbd> untuk boot dengan pengaturan baru.

## Parameter boot

Kolom aplikasi membedakan parameter yang biasanya diterima setiap kali boot dari pengaturan akun yang ditujukan untuk penyiapan awal. Dengan persistence, komponen live-config biasanya hanya dijalankan sekali; lihat [live-config](/reference/configuration/live-config).

Tabel ini merupakan referensi singkat. Prioritas sumber dan bentuk yang diterima`from=` ditetapkan di [Penemuan sistem Initrd](/reference/boot-process/System-Discovery), pemfilteran modul di [Pemuatan modul Initrd](/reference/boot-process/Module-Loading), pemilihan persistence di [Persistence Initrd](/reference/boot-process/Persistence-Internals), dan kombinasi yang didukung di [Mode boot](/using-minios/Boot-Modes).

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `from` | Setiap boot | Memuat data MiniOS dari direktori, jalur perangkat yang didukung, atau ISO. UUID, PARTUUID, dan bentuk perangkat by-id tidak diuraikan. URL **`http://` literal saja** lebih diprioritaskan daripada `ip=` dan memulai [boot jaringan](/reference/boot-process/Network-Boot) melalui httpfs2. | `from=/minios/`<br>`from=/Downloads/minios.iso`<br>`from=http://domain.com/minios.iso`<br>`from=/dev/sr0/minios`<br>`from=/dev/disk/by-label/MyFlash/minios`<br>`from=askdisk`<br>`from=askdisk:customdir` |
| `load` | Setiap boot | Mempertahankan `.sb`kandidat yang jalurnya cocok dengan ekspresi reguler extended tanpa jangkar; koma menjadi alternatif, dan rentang numerik menaik penuh diperluas secara khusus. Juga memfilter `toram=trim` modul. Dapat mengecualikan modul inti atau kernel dan menyebabkan sistem tidak dapat di-boot. | `load=00-core`<br>`load=core,kernel,firmware`<br>`load=00,01,02`<br>`load=00-03` |
| `noload` | Setiap boot | Mengecualikan kandidat yang jalurnya cocok dengan ekspresi reguler extended tanpa jangkar, termasuk dari `toram=trim`; diterapkan setelah `load` dan dapat mengecualikan modul inti atau kernel. | `noload=05-xfce-apps`<br>`noload=xfce-apps,firefox`<br>`noload=05,06`<br>`noload=04-06` |
| `bext` | Setiap boot | Menetapkan ekstensi bundle. Default: `sb`. Koordinasi kernel tetap menggunakan nama `.sb` literal, sehingga ekstensi khusus tidak dapat mengoordinasikan modul `01-kernel`. | `bext=mymod` |
| `timing` | Setiap boot | Mengaktifkan keluaran waktu startup. | `timing` |
| `union` | Setiap boot | Memilih filesystem gabungan. | `union=aufs`<br>`union=overlayfs` |
| `ip` | Setiap boot | Alamat statis untuk pengambilan data jaringan pada tahap awal. Format: `<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]` (port HTTP PXE default **7529**). Nilai literal `from=http://...` memiliki prioritas dibanding `ip=` dan menggunakan kolom alamatnya; jika tidak, nilai `ip=` yang tidak kosong akan memaksa pengunduhan data PXE dan melewati media lokal. Ini bukan konfigurasi NetworkManager sesi. Lihat [Boot jaringan](/reference/boot-process/Network-Boot). | `ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0` |
| `cache` | Setiap boot | Ukuran cache httpfs dalam MiB untuk boot jaringan ISO HTTP (`from=http://…`). Lihat [Boot jaringan](/reference/boot-process/Network-Boot). | `cache=512` |
| `rd.break` | Setiap boot | Membuka shell debug di akhir tahap initramfs. | `rd.break` |
| `perchdir` | Setiap boot | Memilih sesi persistence bernomor atau suatu tindakan. `resume` membuka sesi kompatibel default; `setup` memilih backend penyimpanan secara interaktif, lalu membuat sesi bernomor baru; `new` membuat sesi baru secara langsung menggunakan pengaturan `perchmode`, enkripsi, kompresi, dan ukuran yang diminta/default; `ask` menampilkan sesi tersimpan dan otomatis masuk ke penyiapan jika tidak ada sesi. Selector numerik yang tidak ada dapat menggunakan default metadata; selector tersebut tidak mencadangkan atau membuat nomor itu. Perangkat/jalur atau formulir `askdisk` memilih lokasi persistence lain. Gunakan akhiran yang dipisahkan titik dua untuk jalur kustom. Tanpa parameter persistence, MiniOS melakukan boot dengan bersih. | `perchdir=1`<br>`perchdir=resume`<br>`perchdir=setup`<br>`perchdir=new`<br>`perchdir=ask`<br>`perchdir=/dev/sda1/changes`<br>`perchdir=/dev/disk/by-label/MyFlash/changes`<br>`perchdir=askdisk`<br>`perchdir=askdisk:customdir` |
| `perchsize` | Setiap boot | Ukuran kontainer logis untuk `dynfilefs`, `dynblk`, `vmdk`, dan `raw`; pengaturan ini tidak berlaku untuk `native` atau `squashfs`. Angka tanpa satuan atau nilai `M`/`MB` dialokasikan dalam MiB; nilai `G`/`GB` dan `T`/`TB` dikonversi menjadi 1000 dan 1.000.000 MiB. Tanpa ukuran eksplisit, sesi DynFileFS, DynBlk, dan VMDK yang dibuat initrd menggunakan hingga 16 GiB dan mengurangi nilai default tersebut jika ruang pendukung yang tersisa setelah `perchreserve`; DynFileFS juga memperhitungkan overhead indeks dan batas RAM. DynBlk mengambil batas backend yang terpasang menggunakan `dynblk limits --format dynblk` (atau `--format vmdk` untuk VMDK); tidak ada batas maksimum terpisah sebesar 512 GiB. Payload DynFileFS dan data pendukung DynBlk bertambah sesuai kebutuhan, sedangkan DynFileFS juga mencadangkan indeks untuk kapasitas logis yang ditetapkan. Permintaan Raw dibatasi hingga 1.000.000 MiB dan oleh ruang yang tersedia setelah `perchreserve`; Raw dibatasi hingga 4000 MiB di FAT32, baik terenkripsi maupun tidak. Kontainer Raw baru memiliki ukuran default 4000 MiB. Manajer Sesi MiniOS tetap menetapkan ukuran default 4000 MiB untuk kontainer DynFileFS yang dibuat secara manual, dan 16 GiB untuk DynBlk/VMDK. Lihat [Persistence initrd](/reference/boot-process/Persistence-Internals) untuk perilaku memori dan penyimpanan backend. | `perchsize=4000`<br>`perchsize=32GB`<br>`perchsize=512GB` |
| `perchreserve` | Setiap boot | Margin alokasi dan ambang peringatan ruang rendah dalam MiB. Nilai ini dikurangi saat menentukan ukuran container baru atau yang diperbesar, tetapi bukan kuota saat runtime dan tidak mencegah penulisan selanjutnya hingga perangkat penuh. Default: 256; maksimum: 4096. | `perchreserve=512`<br>`perchreserve=1024` |
| `perchmode` | Setiap boot | Mode penyimpanan persisten.<br>`native` (default): direktori pada filesystem POSIX yang dapat ditulisi.<br>`dynfilefs`: container format-400 yang dapat diperluas berbasis FUSE, termasuk pada FAT32, NTFS, atau exFAT.<br>`dynblk`: perangkat blok kernel format-1 terpisah yang didukung oleh berkas thin `volumeNNN.db`; nomor `/dev/dynblkN` aktual dialokasikan secara dinamis dan beberapa volume dapat digunakan bersamaan.<br>`vmdk`: `volume.vmdk` berkas sparse terpisah standar / `volume-sNNN.vmdk` yang diekspos oleh driver DynBlk; tanpa kompresi. Memerlukan kapabilitas initrd berversi `vmdk-session-v1` initrd.<br>`raw`: image ext4 berukuran tetap.<br>`squashfs`: snapshot terkompresi yang diekstrak ke lapisan atas yang didukung oleh RAM. Penyiapan initrd hanya membuat metadata generasi nol; sistem yang sedang berjalan membuat snapshot pertama sesuai permintaan atau saat shutdown. | `perchmode=native`<br>`perchmode=dynfilefs`<br>`perchmode=dynblk`<br>`perchmode=vmdk`<br>`perchmode=raw`<br>`perchmode=squashfs` |
| `perchencrypt` | Hanya saat pembuatan | Lapisan enkripsi opsional untuk sesi `raw`, `dynfilefs`, `dynblk`, atau `vmdk` yang baru dibuat. `perchencrypt=luks` memerlukan kapabilitas initramfs berversi `luks-layer-v1` initramfs. Enkripsi sesi yang sudah ada hanya ditentukan oleh `session_encryption[N]`, jadi parameter ini tidak mengubah interpretasi atau mengonversinya. | `perchmode=raw perchencrypt=luks`<br>`perchmode=dynfilefs perchencrypt=luks`<br>`perchmode=dynblk perchencrypt=luks` |
| `perchcomp` | Hanya saat pembuatan | Memilih kompresi backend DynBlk untuk sesi DynBlk baru: `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, atau `842`. Codec kernel yang dipilih harus tersedia. Saat `perchencrypt=luks` membungkus DynBlk, MiniOS memaksa kompresi DynBlk menjadi `none`. VMDK tidak mendukung kompresi: boot mengabaikan codec non-`none` dengan peringatan. | `perchmode=dynblk perchcomp=lz4`<br>`perchmode=dynblk perchcomp=zstd` |
| `perch` | Setiap boot | Mengaktifkan jalur pemulihan persistensi lama. Tidak seperti `perchdir=resume`, opsi ini tidak otomatis membuat pengganti yang kompatibel jika tidak ada sesi default yang dapat digunakan. | `perch` |
| `toram` | Setiap boot | Mengontrol penyalinan MiniOS **data sistem** ke RAM. Bare `toram` adalah `full`; `trim` menyalin konfigurasi yang diperlukan dan kumpulan modul yang dipilih, tanpa menyertakan data sumber yang tidak terkait. Penyalinan persistensi dikontrol secara terpisah melalui `perchtoram`. Jika persistensi diminta dan `perchtoram` tidak ditentukan, mode `toram` yang aktif akan menetapkan penyalinan persistensi ke `trim`. Hapus media hanya setelah memastikan bahwa sumber asli, loop, pemetaan, dan penyimpanan persistensi yang diperlukan berhasil dilepas. | `toram`<br>`toram=trim`<br>`toram=full` |
| `perchtoram` | Setiap boot dengan persistensi | `off` mempertahankan penyimpanan asli; `trim` menyalin sesi Raw, DynFileFS, DynBlk, VMDK, atau SquashFS yang dipilih; `full` menyalin semua container/snapshot yang didukung beserta metadata yang cocok. Default: `trim` dengan sistem `toram`, selain itu `off`. Opsi ini tidak meminta persistensi dengan sendirinya. Data native tidak disalin: permintaan RAM yang berhasil akan memulai container kosong baru, kecuali saat reset, yang menonaktifkan penyalinan. Jika penyalinan gagal, operasi tetap menggunakan penyimpanan. Perubahan RAM harus disimpan ke penyimpanan asli yang dapat ditulis atau sebagai sesi baru. Diabaikan jika backend Persistence Plugin Ventoy dipilih. | `perchtoram=off`<br>`perchtoram=trim`<br>`perchtoram=full` |
| `text` | Setiap boot | Memulai dalam mode konsol teks. | `text` |
| `automount` | Setiap boot | Mengaktifkan pemasangan otomatis perangkat penyimpanan. | `automount` |
| `debug` | Setiap boot | Mengaktifkan diagnostik startup tambahan. | `debug` |
| `nozram` | Setiap boot | Menonaktifkan swap zram. | `nozram` |
| `zramsize` | Setiap boot | Menetapkan ukuran swap zram dalam MiB. Jika tidak dicantumkan, MiniOS menghitungnya dari total RAM. | `zramsize=512`<br>`zramsize=2048` |
| `zramcomp` | Setiap boot | Memilih `lzo`, `lzo-rle`, `lz4`, `lz4hc`, atau `zstd`; ketersediaan bergantung pada kernel yang sedang berjalan. Jika tidak dicantumkan, nilai default kernel akan digunakan. | `zramcomp=lzo`<br>`zramcomp=lz4` |
| `default-target` | Setiap boot | Menetapkan target systemd default. | `default-target=multi-user`<br>`default-target=rescue` |
| `enable-services` | Setiap boot | Mengaktifkan layanan systemd yang ditentukan saat boot. | `enable-services=ssh,docker`<br>`enable-services=ssh` |
| `disable-services` | Setiap boot | Menonaktifkan layanan systemd yang ditentukan saat boot. | `disable-services=apache2`<br>`disable-services=nginx` |
| `novirtres` | Setiap boot | Menonaktifkan perubahan resolusi layar otomatis di mesin virtual. Resolusi default XFCE adalah 1280x800. | `novirtres` |
| `virtres` | Setiap boot | Mengatur resolusi layar XFCE di mesin virtual. | `virtres=1920x1080`<br>`virtres=1024x768` |
| `components` | Setiap boot | Hanya menjalankan komponen live-config yang tercantum, sesuai urutan komponen. | `components=hostname,user-setup,sudo` |
| `nocomponents` | Setiap boot | Menjalankan semua komponen live-config kecuali yang tercantum. | `nocomponents=anacron,apport` |
| `hostname` | Setiap boot | Mengatur hostname sistem. | `hostname=minios` |
| `username` | Penyiapan awal | Mengatur nama pengguna yang dibuat untuk login otomatis. | `username=live` |
| `user-default-groups` | Penyiapan awal | Mengatur grup default pengguna yang dibuat. | `user-default-groups=audio,cdrom,video` |
| `user-fullname` | Penyiapan awal | Mengatur nama lengkap pengguna yang dibuat. | `user-fullname="MiniOS Live User"` |
| `root-password` | Penyiapan awal | Mengatur kata sandi root dalam teks biasa. | `root-password=toor` |
| `root-password-crypted` | Penyiapan awal | Mengatur kata sandi root sebagai hash crypt. | `root-password-crypted=$y$j9T$...` |
| `user-password` | Penyiapan awal | Mengatur kata sandi pengguna dalam teks biasa. | `user-password=live` |
| `user-password-crypted` | Penyiapan awal | Mengatur kata sandi pengguna sebagai hash crypt. | `user-password-crypted=$y$j9T$...` |
| `locales` | Setiap boot | Mengatur satu atau beberapa locale sistem. | `locales=en_US.UTF-8` |
| `timezone` | Setiap boot | Mengatur zona waktu sistem. | `timezone=Europe/Berlin` |
| `keyboard-model` | Setiap boot | Mengatur model keyboard. | `keyboard-model=pc105` |
| `keyboard-layouts` | Setiap boot | Mengatur tata letak keyboard yang dipisahkan dengan koma. | `keyboard-layouts=us,de` |
| `keyboard-variants` | Setiap boot | Mengatur varian keyboard yang dipisahkan dengan koma dan sesuai dengan tata letaknya. | `keyboard-variants=,dvorak` |
| `keyboard-options` | Setiap boot | Mengatur opsi keyboard. | `keyboard-options=grp:alt_shift_toggle` |
| `noroot` | Penyiapan awal | Mencegah live-config memberikan hak istimewa sudo dan PolicyKit. | `noroot` |
| `noautologin` | Setiap boot | Mencegah live-config mengatur login otomatis di konsol dan antarmuka grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `noautologin` |
| `nottyautologin` | Setiap boot | Hanya mencegah pengaturan login otomatis di konsol; konfigurasi persisten yang sudah ada tidak dihapus. | `nottyautologin` |
| `nox11autologin` | Setiap boot | Hanya mencegah pengaturan login otomatis di antarmuka grafis; konfigurasi persisten yang sudah ada tidak dihapus. | `nox11autologin` |
| `xorg-driver` | Setiap boot | Memilih driver Xorg alih-alih mendeteksinya secara otomatis. | `xorg-driver=nouveau` |
| `xorg-resolution` | Setiap boot | Mengatur resolusi Xorg alih-alih mendeteksinya secara otomatis. | `xorg-resolution=1920x1080` |
| `module-mode` | Setiap boot | Dengan `merged`, mengintegrasikan perubahan konfigurasi ke dalam sistem live yang sedang berjalan. | `module-mode=merged` |
| `link-user-dirs` | Setiap boot | Menautkan direktori pengguna yang dikelola ke media MiniOS yang dapat ditulisi. Opsi ini tidak dapat digunakan bersamaan dengan `bind-user-dirs` dan tidak tersedia dalam mode `toram` apa pun atau saat sesi persistence aktif dienkripsi dengan LUKS. Enkripsi aktif ditentukan berdasarkan sesi yang sedang berjalan, bukan berdasarkan permintaan pembuatan `perchencrypt` . | `link-user-dirs` |
| `bind-user-dirs` | Setiap boot | Menggunakan bind mount untuk menautkan direktori pengguna yang dikelola dari media MiniOS yang dapat ditulisi. Opsi ini memiliki batasan yang sama terkait `toram` dan enkripsi sesi aktif seperti `link-user-dirs`. | `bind-user-dirs` |
| `user-dirs-path` | Setiap boot | Mengatur lokasi relatif terhadap media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Default: `/minios/userdata`. | `user-dirs-path=/minios/userdata` |
| `hooks` | Setiap boot | Mengambil dan menjalankan hook dari sistem berkas, media live, atau URL yang didukung wget. | `hooks=filesystem`<br>`hooks=http://example.com/script.sh` |

Untuk pembuatan native pada FAT32/NTFS/exFAT atau jika pemeriksaan POSIX gagal, initrd akan memilih DynBlk jika tersedia dan diizinkan oleh Secure Boot; jika tidak, initrd memilih DynFileFS. Ini tidak mengonversi sesi yang sudah ada. Jika backend Persistence Plugin Ventoy dipilih, permintaan persistence menggunakan satu image ext4 tersebut, bukan sesi bernomor; `perchdir` pilihan sesi diabaikan. Lihat [Detail internal persistence](/reference/boot-process/Persistence-Internals).

## Pertimbangan keamanan

Baris perintah kernel berupa teks biasa dan biasanya terlihat di konfigurasi bootloader, `/proc/cmdline`, serta diagnostik. Jangan masukkan rahasia yang dapat digunakan kembali ke `root-password=` atau `user-password=`. Sebaiknya gunakan parameter `*-crypted` yang sesuai, tetapi tetap perlakukan hash kata sandi yang terekspos sebagai informasi sensitif.

Hook dijalankan sebagai kode boot dengan hak istimewa. Hook `http://` tidak memiliki enkripsi transport maupun autentikasi server, sehingga siapa pun yang dapat mengubah jalur jaringan bisa menggantinya. Gunakan hanya konten dan mekanisme pengiriman yang tepercaya; jangan gunakan hook HTTP tanpa autentikasi untuk startup yang sensitif dari sisi keamanan.

Pisahkan perintah dengan spasi. Lihat halaman referensi `man bootparam` untuk parameter kernel tambahan yang umum digunakan di semua distribusi Linux.

Untuk informasi terperinci tentang parameter live-config, lihat [live-config](/reference/configuration/live-config).

Untuk memuat MiniOS melalui jaringan (PXE dan ISO HTTP), lihat [Boot jaringan](/reference/boot-process/Network-Boot).

## Parameter cache dan log sesi persistence

| Parameter | Aplikasi | Deskripsi | Contoh |
|---|---|---|---|
| `log-storage` atau `live-config.log-storage` | Setiap boot dengan persistence tervalidasi | `persistent` (default) atau `volatile`. Dalam mode volatil, journald menggunakan hingga 32 MiB dan `/var/log` biasa menggunakan tmpfs 32 MiB. Diagnostik boot disimpan secara terpisah; dengan persistence tahan lama, diagnostik tetap tersimpan di media. Jika filesystem log RAM penuh, data tidak akan melimpah ke perangkat USB. | `log-storage=volatile` |
| `apt-cache` atau `live-config.apt-cache` | Setiap boot dengan persistence tervalidasi | `persistent` (default) atau `volatile` untuk `/var/cache/apt/archives`. Ukuran tmpfs adalah 256 MiB jika tersedia setidaknya 1 GiB, atau 512 MiB jika tersedia setidaknya 2 GiB. Swap selain zRAM menonaktifkannya; unduhan besar dapat memenuhinya. Daftar repositori dan status dpkg tetap berada di lapisan sesi. | `apt-cache=volatile` |
| `browser-cache` atau `live-config.browser-cache` | Setiap boot dengan persistence tervalidasi | `persistent` (default) atau `volatile`. Jika tersedia setidaknya 1 GiB dan tidak ada swap selain zRAM, direktori cache browser pengguna live standar menggunakan tmpfs bersama berukuran 512 MiB. Kebijakan Firefox terkelola menonaktifkan caching disk jika tidak ada berkas kebijakan lain. Profil dan cache lain yang tidak terkait tetap berada di lapisan sesi. | `browser-cache=volatile` |

Tiga parameter kebijakan penyimpanan diuraikan oleh `minios-boot` sebelum sistem init normal, **bukan** oleh pemilih persistence awal. Parameter tersebut tidak mengaktifkan `perch`. Agar dapat digunakan, aktivasi pada penyimpanan tahan lama atau sesi RAM yang dapat ditulisi dengan informasi `ram-origin` terlindungi harus berhasil; parameter ini tidak membuat perubahan RAM menjadi tahan lama tanpa menyimpannya. Initrd yang kompatibel mengiklankan `perch-storage-v1` di `/run/initramfs/etc/minios-initramfs-storage`. Configurator dan `config.conf` menyediakan pilihan yang sama; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk batasan, prioritas, dan catatan terkait pemasangan browser.
