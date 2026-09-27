---
updated: 2026-09-26
program_commits:
    minios-live-config: 069fa46ba4601f41966e479f63d90b2888e4df50
---

# live-config

**live-config** - Komponen Konfigurasi Sistem

**live-config** berisi komponen yang mengonfigurasi sistem live selama proses boot (late userspace).

Kebijakan cache dan log persistent-session ditentukan sebelumnya oleh `minios-boot`, setelah live root dan konfigurasinya disiapkan namun sebelum layanan utama dijalankan. Komponen `browser-cache` live-config menerapkan mount per pengguna setelah pembuatan user. Kebijakan ini membutuhkan session yang tahan lama dan sehat serta initrd terbaru yang mengumumkan `perch` session dan initrd terkini yang mengiklankan `perch-storage-v1`; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk efek dan batasannya.

Network boot pada initramfs (`ip=`, PXE, `from=http://…`) adalah layer LiveKit terpisah dan **tidak** dikelola oleh live-config. Lihat [Network boot](/reference/boot-process/Network-Boot).

**live-config** dapat dikonfigurasi melalui parameter boot atau file konfigurasi runtime yang disiapkan oleh initramfs. Kernel command line yang sebenarnya akan ditambahkan setelah nilai dari file, sehingga parameter boot yang lebih akhir akan diutamakan. Komponen yang mencatat status di bawah `LIVE_CONFIG_CMDLINE` biasanya hanya berjalan sekali; komponen sinkronisasi dan stateless dapat berjalan setiap kali dipanggil.`/var/lib/live/config`

Jika *live-build*(7) digunakan untuk membangun sistem live, parameter live-config yang digunakan secara default dapat diatur melalui opsi `--bootappend-live`, lihat *lb_config*(1) halaman manual.

## Parameter Boot (komponen)

**live-config** hanya akan diaktifkan jika `boot=live` digunakan sebagai parameter boot. Secara default, semua komponen dijalankan. Parameter `live-config.components` dapat membatasi komponen mana saja yang dijalankan, dan `live-config.nocomponents` dapat mengecualikan komponen tertentu. Jika kedua parameter digunakan, atau salah satunya disebutkan beberapa kali, kemunculan terakhir yang akan diutamakan.

- **live-config.components | components**: Semua komponen dijalankan. Ini adalah pengaturan default pada live image.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Hanya komponen yang disebutkan yang dijalankan. Komponen akan dieksekusi sesuai urutan pada nama file mereka di bawah `/usr/lib/live/config`, terlepas dari urutan pada daftar ini.
- **live-config.nocomponents | nocomponents**: Tidak ada komponen yang dijalankan.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Semua komponen dijalankan, kecuali yang disebutkan.

## Parameter Boot (opsi)

Beberapa komponen individual dapat mengubah perilakunya berdasarkan parameter boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menerapkan satu atau beberapa file preseed debconf. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`. Kata kunci `filesystem` mengekspansi file di `/usr/lib/live/config-preseed/`; `medium` mengekspansi file di `minios/config-preseed/` pada media live yang terdeteksi. File lokal eksplisit dapat menggunakan path seperti `file:///run/initramfs/memory/data/minios/config-preseed/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan dengan tanda pipa akan diproses sesuai urutan yang ditentukan; file yang diekspansi dengan kata kunci menggunakan urutan glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Memungkinkan Anda mengatur hostname sistem. Nilai default adalah `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Memilih kebijakan jaringan kabel. Jika tidak diatur dan `dhcp` membiarkan pengaturan default image tidak berubah. `static` menulis konfigurasi untuk backend yang dipilih; `off` menonaktifkan konfigurasi IPv4 otomatis untuk interface yang dipilih.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Memilih interface kabel. Jika tidak diisi untuk `static` atau `off`, maka satu-satunya interface kabel non-loopback akan dipilih secara otomatis; jika ada nol atau lebih dari satu kandidat, nilai eksplisit diperlukan.
- **live-config.network-address=IPV4 | network-address=IPV4**: Mengatur alamat IPv4 statis.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Mengatur panjang prefix IPv4 dari 0 hingga 32. Default statis adalah `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Mengatur gateway IPv4 opsional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Mengatur alamat server DNS opsional yang dipisahkan dengan koma.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Memilih backend jaringan. `auto` lebih memilih NetworkManager dan akan menggunakan ifupdown jika gagal. Jika dipaksa, `ifupdown` menandai interface sebagai tidak dikelola oleh NetworkManager saat kedua stack terpasang.
- **live-config.username=USERNAME | username=USERNAME**: Memungkinkan Anda mengatur username yang akan dibuat untuk autologin. Default-nya adalah `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Mengatur grup tambahan untuk pengguna yang dibuat untuk autologin. Nama grup dapat dipisahkan dengan koma atau spasi. Default MiniOS adalah `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Memungkinkan Anda mengatur nama lengkap pengguna yang dibuat untuk autologin. Default MiniOS adalah `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Memungkinkan pengaturan password root dalam bentuk teks biasa.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Memungkinkan pengaturan password root dalam bentuk terenkripsi.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Memungkinkan pengaturan password pengguna dalam bentuk teks biasa.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Memungkinkan pengaturan password pengguna dalam bentuk terenkripsi.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Memungkinkan Anda mengatur locale sistem, misalnya `de_CH.UTF-8`. Default-nya adalah `en_US.UTF-8`. Jika locale yang dipilih belum tersedia di sistem, akan dibuat secara otomatis saat itu juga.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Memungkinkan Anda mengatur zona waktu sistem, misalnya `Europe/Zurich`. Default-nya adalah `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Memungkinkan Anda mengubah model keyboard. Tidak ada nilai default yang diatur.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Memungkinkan Anda mengubah layout keyboard. Jika lebih dari satu ditentukan, alat pada desktop environment akan memungkinkan Anda beralih di bawah X11. Tidak ada nilai default yang diatur.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Memungkinkan Anda mengubah varian keyboard. Jika lebih dari satu ditentukan, jumlah nilainya harus sama dengan jumlah layout keyboard karena akan dipasangkan satu per satu sesuai urutan. Nilai kosong diperbolehkan. Alat pada desktop environment akan memungkinkan Anda berpindah antar pasangan layout dan varian di bawah X11. Tidak ada nilai default yang diatur.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Memungkinkan Anda mengubah opsi keyboard. Tidak ada nilai default yang diatur.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Memungkinkan Anda menonaktifkan layanan sysv melalui update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Memungkinkan Anda mengubah apakah sistem mengasumsikan jam hardware diatur ke UTC atau tidak. Default-nya adalah `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Memungkinkan Anda mengatur x-session-manager melalui update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Memungkinkan Anda mengatur driver xorg daripada mendeteksi secara otomatis. Jika PCI ID ditentukan di `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ditemukan parameter boot dan override, parameter boot akan diutamakan.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Memungkinkan Anda mengatur resolusi xorg daripada mendeteksi otomatis, misal 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Memungkinkan Anda mengatur driver WLAN daripada mendeteksi otomatis. Jika PCI ID ditentukan di `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ditemukan parameter boot dan override, parameter boot akan diutamakan.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Memungkinkan Anda menentukan mode modul untuk konfigurasi live. Jika diatur ke `merged`, sistem akan memperbarui akun pengguna, membangun ulang cache, dan menyegarkan pengaturan paket sehingga perubahan konfigurasi terintegrasi secara dinamis ke sistem yang sedang berjalan.
- **live-config.link-user-dirs | link-user-dirs**: Menautkan direktori pengguna yang dikelola ke path yang dikonfigurasi pada media data MiniOS. Opsi ini tidak dapat digunakan bersamaan dengan mode bind dan tidak tersedia jika `toram` mode atau saat sesi persistensi aktif dienkripsi dengan LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Melakukan bind-mount direktori pengguna yang dikelola dari path yang dikonfigurasi pada media data MiniOS. Opsi ini tidak dapat digunakan bersamaan dengan mode link dan memiliki pembatasan `toram` dan enkripsi sesi aktif yang sama.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Mengatur path relatif media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Default-nya adalah `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan mengeksekusi file apa pun dari file sementara di sistem live yang sedang berjalan. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`; interpreter yang dibutuhkan dan dependensi lainnya harus sudah terpasang. Kata kunci `filesystem` mengekspansi file di `/usr/lib/live/config-hooks/`; `medium` mengekspansi file di `minios/config-hooks/` pada media live yang terdeteksi (dengan fallback path ISO pada komponen hook). File lokal eksplisit dapat menggunakan `file:///run/initramfs/memory/data/minios/config-hooks/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan pipa akan dieksekusi sesuai urutan yang ditentukan; file yang diekspansi dengan kata kunci menggunakan urutan glob shell. Contoh terpasang di bawah `/usr/share/doc/live-config/examples/hooks/`.

> **Peringatan keamanan:** `live-config` dijalankan sebagai root. Hook akan dibuat dapat dieksekusi dan dijalankan sebagai root, dan preseed akan mengubah database debconf sistem dengan hak akses root. HTTP dan FTP biasa tidak melakukan autentikasi konten yang diunduh dan tidak memberikan perlindungan integritas. Sebaiknya gunakan file lokal yang telah ditinjau atau transportasi yang terautentikasi dan tepercaya dengan verifikasi integritas independen; jangan gunakan hook atau preseed jarak jauh dari jaringan yang tidak tepercaya.

### MiniOS opsi penyimpanan awal

Opsi ini dibaca oleh `minios-boot` sebelum layanan utama berjalan. Opsi ini membutuhkan penyimpanan yang tahan lama dan sehat `perch` sesi dan tidak mengaktifkan sesi secara otomatis.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` menempatkan jurnal systemd dan file log biasa `/var/log` pada RAM yang terbatas; diagnostik boot tetap berada di penyimpanan tahan lama. Default: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` menempatkan arsip APT yang diunduh ke tmpfs terbatas jika kondisi RAM dan swap memungkinkan. Basis data paket dan daftar repositori tetap persisten. Default: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` meminta cache browser-native di RAM.`browser-cache` Komponen ini me-mount direktori cache yang dipilih pengguna live setelah akun dibuat. Default: `persistent`.

## Parameter Boot (shortcut)

Untuk beberapa kasus penggunaan umum yang biasanya membutuhkan kombinasi beberapa parameter individual, **live-config** menyediakan shortcut. Ini memungkinkan Anda tetap memiliki kontrol penuh atas semua opsi, namun tetap sederhana.

- **live-config.noroot | noroot**: Menonaktifkan pengaturan password root serta hak istimewa sudo dan PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Mengatur konfigurasi sudo untuk pengguna live. Default-nya, dan perilaku MiniOS sebelumnya jika tidak diatur, adalah `passwordless`. Mode `password` tetap memberikan akses sudo tetapi membutuhkan password pengguna live. Mode `disabled` menghapus hak sudo MiniOS dan memastikan pengguna live tidak masuk ke grup sudo saat dibuat. Shortcut lama `noroot` akan menimpa ini dan menonaktifkan pengaturan hak root secara lebih luas.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Mengatur aturan PolicyKit MiniOS. Default-nya, dan perilaku MiniOS sebelumnya jika tidak diatur, adalah `passwordless`. Mode `password` dan `disabled` menghapus aturan tersebut, sehingga autentikasi PolicyKit distribusi normal berlaku. `disabled` bukan kebijakan deny-all secara total; gunakan `noroot` jika pengguna live tidak boleh mendapatkan hak administratif.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Menulis kebijakan `PermitRootLogin` OpenSSH jika diatur secara eksplisit dan openssh-server terpasang.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Menulis kebijakan `PasswordAuthentication` OpenSSH jika diatur secara eksplisit dan openssh-server terpasang.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Mengatur postur XRDP saat xrdp terpasang. `relaxed` mempertahankan default MiniOS sebelumnya. `hardened` mengikat XRDP ke localhost, mengembalikan pengaturan keamanan tinggi/negosiasi, dan menonaktifkan login root XRDP. `disabled` menonaktifkan dan menghentikan XRDP melalui `minios-svc` jika tersedia.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Mengatur postur X11 MiniOS. `relaxed` mempertahankan kompatibilitas historis. `hardened` menghapus opsi X server permisif `-ac` dan memperketat `Xwrapper.config` jika ada.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Mengatur apakah `/etc/issue` akan menampilkan hint password root/live MiniOS default.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Mengatur apakah live-config akan melonggarkan penguncian layar. `relaxed` mempertahankan kenyamanan sesi live secara historis. `hardened` menghindari menonaktifkan penguncian GNOME dan mengaktifkan penguncian xscreensaver jika file tersebut ada.
- **live-config.noautologin | noautologin**: Mencegah live-config mengatur autologin konsol dan grafis. Tidak menghapus autologin yang sudah dikonfigurasi pada sesi persisten.
- **live-config.nottyautologin | nottyautologin**: Mencegah live-config mengatur autologin konsol, tanpa memengaruhi pengaturan grafis. Konfigurasi persisten yang sudah ada tidak dihapus.
- **live-config.nox11autologin | nox11autologin**: Mencegah live-config mengatur autologin display-manager, tanpa memengaruhi pengaturan TTY. Konfigurasi persisten yang sudah ada tidak dihapus.

## Parameter Boot (opsi khusus)

Untuk kebutuhan khusus, tersedia beberapa parameter boot khusus.

- **live-config.debug | debug**: Mengaktifkan output debug pada live-config.

## Berkas Konfigurasi

**live-config** dapat dikonfigurasi (namun tidak diaktifkan) melalui berkas konfigurasi. Setiap parameter boot yang didukung dapat dimasukkan ke dalam `LIVE_CONFIG_CMDLINE`, dan sebagian besar opsi juga dapat diatur melalui variabel individual. `boot=live` Parameter masih diperlukan untuk mengaktifkan **live-config**.

**Catatan:** Jika berkas konfigurasi digunakan, sebaiknya (lebih disarankan) semua parameter boot dimasukkan ke dalam variabel **LIVE_CONFIG_CMDLINE**, atau bisa juga diatur melalui variabel individual. Jika menggunakan variabel individual, pengguna harus memastikan semua variabel yang diperlukan sudah diatur agar konfigurasi valid.

`live-config` sendiri mengambil sumber dari `/etc/live/config.conf` lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Fragmen yang lebih akhir dapat menggantikan nilai dari berkas utama atau fragmen sebelumnya. Tidak mengambil sumber lapisan konfigurasi media kedua secara terpisah.

Pada media MiniOS, berkas sumbernya adalah `minios/config.conf` dan `minios/config.conf.d/*.conf`. Sebelum `live-config` berjalan, initramfs MiniOS akan menyinkronkan berkas-berkas ini dengan berkas runtime `/etc/live/` berdasarkan waktu modifikasi. Berkas sumber yang lebih baru akan menggantikan berkas runtime; berkas runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis. Jika stempel waktunya sama, tidak ada penyalinan; berkas yang hilang akan dilengkapi, dan berkas tidak dihapus. Ini adalah sinkronisasi saat boot, bukan pemantauan terus-menerus. Lihat [Berkas konfigurasi](/reference/configuration/config.conf) untuk aturan lengkap sinkronisasi dan prioritas baris perintah.

Sebagai cadangan untuk implementasi initramfs yang tidak menyiapkan berkas runtime, wrapper startup systemd dan SysV akan menyalin `minios/config.conf` dari media yang terdeteksi hanya jika `/etc/live/config.conf` tidak ada. Fallback ini tidak menyalin fragmen `config.conf.d`. Initramfs LiveKit MiniOS standar saat ini melakukan sinkronisasi seperti dijelaskan sebelumnya.

Berkas fragmen harus sesuai dengan `*.conf`. Nama seperti `vendor.conf` atau `project.conf` direkomendasikan; pilih nama secara berurutan karena fragmen yang lebih akhir akan menimpa yang lebih awal.

Isi berkas konfigurasi terdiri dari satu atau beberapa variabel berikut.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Variabel ini sesuai dengan baris perintah bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Variabel ini sesuai dengan parameter `**live-config.hostname**=*HOSTNAME*` Default-nya adalah `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Memilih kebijakan jaringan kabel. `dhcp` dan nilai yang tidak diatur tidak melakukan apa-apa dan tidak menghapus profil statis MiniOS yang sudah dibuat sebelumnya.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Memilih antarmuka kabel untuk kebijakan `static` atau `off` .
- **LIVE_NETWORK_ADDRESS=IPV4**: Mengatur alamat IPv4 statis.
- **LIVE_NETWORK_PREFIX=PREFIX**: Mengatur panjang prefix statis; default-nya `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Mengatur gateway statis opsional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Mengatur server DNS opsional, dipisahkan koma.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Memilih backend yang digunakan.

Komponen jaringan akan mencatat `/var/lib/live/config/network` setelah kebijakan berhasil ditulis. Hapus stempel tersebut untuk menerapkan perubahan kebijakan pada sistem persisten. Untuk menghapus profil statis sebelumnya, gunakan `network-method=off` atau hapus profil dan stempel yang dikelola MiniOS secara manual.

- **LIVE_USERNAME=USERNAME**: Variabel ini sesuai dengan parameter `**live-config.username**=*USERNAME*` Default-nya adalah `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Variabel ini sesuai dengan parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Variabel ini sesuai dengan parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password**=*PASSWORD*`. Digunakan untuk mengatur password root dalam bentuk teks biasa.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password-crypted**=*PASSWORD*`. Digunakan untuk mengatur password root dalam bentuk terenkripsi.
- **LIVE_USER_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password**=*PASSWORD*`. Digunakan untuk mengatur password pengguna dalam bentuk teks biasa.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password-crypted**=*PASSWORD*`. Digunakan untuk mengatur password pengguna dalam bentuk terenkripsi.
- **LIVE_CONFIG_NOROOT=true|false**: Variabel ini sesuai dengan parameter `**live-config.noroot**` dan akan menonaktifkan root, sudo, serta pengaturan hak istimewa PolicyKit jika diatur ke `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.sudo-mode**=...`. Jika tidak diatur, MiniOS akan mempertahankan perilaku sudo tanpa password seperti sebelumnya.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.polkit-mode**=...`. `password` dan `disabled` akan menghapus aturan passwordless MiniOS dan mengembalikan autentikasi PolicyKit distribusi seperti semula.
- **LIVE_SSH_PERMIT_ROOT_LOGIN=true|false**: Variabel ini sesuai dengan parameter `**live-config.ssh-permit-root-login**=...`.
- **LIVE_SSH_PASSWORD_AUTHENTICATION=true|false**: Variabel ini sesuai dengan parameter `**live-config.ssh-password-authentication**=...`.
- **LIVE_XRDP_MODE=relaxed|hardened|disabled**: Variabel ini sesuai dengan parameter `**live-config.xrdp-mode**=...`.
- **LIVE_X11_MODE=relaxed|hardened**: Variabel ini sesuai dengan parameter `**live-config.x11-mode**=...`.
- **LIVE_ISSUE_PASSWORD_HINTS=true|false**: Variabel ini sesuai dengan parameter `**live-config.issue-password-hints**=...`.
- **LIVE_LOCKSCREEN_MODE=relaxed|hardened**: Variabel ini sesuai dengan parameter `**live-config.lockscreen-mode**=...`.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Variabel ini sesuai dengan parameter `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Variabel ini sesuai dengan parameter `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Variabel ini sesuai dengan parameter `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Variabel ini sesuai dengan parameter `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Variabel ini sesuai dengan parameter `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Variabel ini sesuai dengan parameter `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Variabel ini sesuai dengan parameter `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Variabel ini sesuai dengan parameter `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Variabel ini sesuai dengan parameter `**live-config.xorg-xsession-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Variabel ini sesuai dengan parameter `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Variabel ini sesuai dengan parameter `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Variabel ini sesuai dengan parameter `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan tautan dari direktori data standar pengguna ke drive MiniOS yang dapat ditulis. Parameter boot yang sesuai adalah flag `live-config.link-user-dirs` . Mode tautan tidak dapat digabungkan dengan mode bind atau mode `toram` manapun.
- **LIVE_BIND_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan bind mount untuk direktori data standar pengguna dari drive MiniOS yang dapat ditulis. Parameter boot yang sesuai adalah flag `live-config.bind-user-dirs` . Mode bind tidak dapat digabungkan dengan mode tautan atau mode `toram` manapun.
- **LIVE_USER_DIRS_PATH=PATH**: Variabel ini sesuai dengan parameter `**live-config.user-dirs-path**=*PATH*`. Menentukan path yang aman di dalam drive MiniOS FAT32, exFAT, atau NTFS. Default-nya adalah `/minios/userdata`; segmen titik dan direktori induk akan ditolak.

Pengaturan media pengguna tidak pernah menggabungkan dua direktori yang tidak kosong secara otomatis. Direktori lokal yang tidak kosong hanya akan dipindahkan jika tujuan di media kosong. Jika fitur ini dinonaktifkan, data media yang dikelola akan disalin kembali sebelum tautan dihapus. Aktivasi media pengguna dan penyalinan balik akan diblokir jika sesi persistensi aktif dienkripsi LUKS, sehingga data sesi tidak dipindahkan ke media MiniOS yang tidak terenkripsi. Keputusan ini menggunakan status enkripsi aktif sebenarnya: `perchencrypt=luks` hanya meminta enkripsi saat membuat sesi baru dan tidak menggambarkan sesi yang sudah ada. Jika validasi atau penyalinan gagal, direktori pengguna yang ada tetap dipertahankan dan alasan kegagalan dicatat di `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Variabel ini menyimpan status yang ditentukan oleh parameter `live-config.module-mode` (atau `module-mode`). Jika diatur ke `merged`, sistem live akan menerapkan pembaruan (melalui minios-update-users, minios-update-cache, dan minios-update-dpkg) untuk menggabungkan konfigurasi kustom dengan lingkungan dasar.
- **LIVE_CONFIG_DEBUG=true|false**: Variabel ini sesuai dengan parameter `**live-config.debug**`.

## Variabel cache dan log MiniOS

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, dan **LIVE_BROWSER_CACHE=persistent|volatile**: Kebijakan boot-time MiniOS yang berdiri sendiri. Ini juga berfungsi di `config.conf.d` dan `LIVE_CONFIG_CMDLINE`. Variabel ini tidak otomatis mengaktifkan persistensi. Lihat [Berkas konfigurasi](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Komponen `browser-cache` ini membaca kebijakan `minios-boot` yang tahan lama setelah live user aktif dan melakukan bind-mount direktori cache browser native standar ke filesystem RAM bersama yang terbatas. Kebijakan Firefox yang dibuat terpisah akan menonaktifkan disk cache tanpa memindahkan profil browser. Jika komponen ini tidak disertakan oleh `components=` atau `nocomponents=`, permintaan browser-cache awal saja tidak akan menyiapkan mount per pengguna.

Helper mode gabungan tetap menyimpan error normal, tetapi hanya membuat jejak perintah dan salinan debug secara rinci saat `LIVE_CONFIG_DEBUG=true`.

# KUSTOMISASI

**live-config** dapat dengan mudah dikustomisasi untuk proyek turunan atau penggunaan lokal.

## Menambahkan komponen konfigurasi baru

Proyek turunan dapat menempatkan komponennya di /usr/lib/live/config dan tidak perlu melakukan apa pun lagi, komponen tersebut akan dijalankan secara otomatis saat boot.

Komponen sebaiknya ditempatkan dalam paket debian tersendiri. Contoh paket yang berisi contoh komponen dapat ditemukan di /usr/share/doc/live-config/examples.

## Menghapus komponen konfigurasi yang ada

Saat ini belum memungkinkan untuk menghapus komponen secara langsung dengan cara yang aman tanpa harus mengirimkan paket **live-config** yang telah dimodifikasi secara lokal atau menggunakan dpkg-divert. Namun, hal yang sama dapat dicapai dengan menonaktifkan komponen terkait melalui mekanisme live-config.nocomponents, lihat di atas. Untuk menghindari harus selalu menentukan komponen yang dinonaktifkan melalui parameter boot, sebaiknya gunakan file konfigurasi, lihat di atas.

File konfigurasi untuk sistem live itu sendiri sebaiknya ditempatkan dalam paket debian tersendiri. Contoh paket yang berisi contoh konfigurasi dapat ditemukan di /usr/share/doc/live-config/examples.

# KOMPONEN

**live-config** saat ini memiliki komponen berikut di /usr/lib/live/config.

- **nss-systemd**: menghapus atau mengembalikan modul NSS systemd di /etc/nsswitch.conf untuk mengatasi masalah systemd yang sudah diketahui.
- **debconf**: memungkinkan penggunaan file preseed apa pun yang ditempatkan di media live atau server http/ftp.
- **hostname**: mengatur /etc/hostname dan /etc/hosts.
- **issue-setup**: menyiapkan file /etc/issue dengan banner sambutan dan informasi distribusi.
- **live-debconfig_passwd**: mengatur password user dan root melalui live-debconfig.
- **user-setup**: menambahkan akun user live.
- **user-groups**: menambahkan user live ke grup tambahan yang dideklarasikan oleh modul yang terpasang. Grup yang sudah ada dan tercantum di `/usr/share/live/config/user-default-groups.d/*.groups` akan diterapkan setelah pembuatan user dan pada proses live-config berikutnya.
- **root-setup**: mengatur atau memperbarui password root dan mengonfigurasi lingkungan user root.
- **sudo**: memberikan hak sudo kepada user live.
- **user-ssh-keys**: menyinkronkan `authorized_keys.<username>` file khusus user antara media live dan direktori home user masing-masing. Mendukung beberapa user sekaligus (misal, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **user-media**: melakukan link atau bind-mount direktori user yang sudah divalidasi pada media data MiniOS yang writable, dengan migrasi aman dan copy-back saat dinonaktifkan.
- **locales**: mengatur locales.
- **tzdata**: mengatur /etc/timezone.
- **xorg-service**: mengatur username di xorg.service dan menerapkan posture X11 jika didukung.
- **gdm3**: mengatur autologin di gdm3.
- **sddm**: mengatur autologin di sddm.
- **kdm**: mengatur autologin di kdm.
- **lightdm**: mengatur autologin di lightdm.
- **lxdm**: mengatur autologin di lxdm.
- **nodm**: mengatur autologin di nodm.
- **slim**: mengatur autologin di slim.
- **xinit**: mengatur autologin dengan xinit.
- **keyboard-configuration**: mengatur konfigurasi keyboard.
- **sysvinit**: mengatur autologin konsol melalui `/etc/inittab` saat sysvinit terpasang. `noautologin` dan `nottyautologin` pintasan akan menonaktifkan pengaturan tersebut.
- **sysv-rc**: mengatur sysv-rc dengan menonaktifkan layanan yang terdaftar.
- **apport**: menonaktifkan apport.
- **gnome-panel-data**: menonaktifkan tombol kunci layar.
- **gnome-power-manager**: menonaktifkan hibernasi.
- **gnome-screensaver**: mengatur penguncian layar GNOME sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: menonaktifkan wizard migrasi KDE (squeeze dan yang lebih baru).
- **kde-services**: menonaktifkan beberapa layanan KDE yang tidak diinginkan (squeeze dan yang lebih baru).
- **policykit**: memberikan hak akses pengguna melalui PolicyKit.
- **ssl-cert**: menghasilkan ulang sertifikat SSL snake-oil.
- **xrdp**: mengatur mode XRDP menjadi relaxed, hardened, atau dinonaktifkan saat XRDP terpasang.
- **anacron**: menonaktifkan anacron.
- **util-linux**: menonaktifkan layanan hwclock util-linux.
- **login**: menonaktifkan lastlog.
- **xserver-xorg**: mengatur konfigurasi xserver-xorg.
- **network**: mengatur kebijakan IPv4 kabel yang tahan lama melalui keyfile NetworkManager yang aman atau stanza ifupdown. Proses ini dijalankan sebelum layanan jaringan, memvalidasi semua nilai, dan hanya menandai setelah penulisan berhasil.
- **openssh-server**: membuat ulang kunci host OpenSSH dan menulis kebijakan root-login atau autentikasi sandi yang diminta secara eksplisit.
- **xfce4-panel**: mengatur xfce4-panel ke pengaturan default.
- **xscreensaver**: mengatur penguncian xscreensaver sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: mengatur driver WLAN broadcom-sta.
- **hyperv**: mengatur konfigurasi X11 untuk meningkatkan kompatibilitas pada platform Microsoft Hyper-V.
- **ntfs3**: mengelola aturan udev untuk dukungan NTFS3.
- **config-module-mode**: mengatur mode modul sistem dan memperbarui cache, pengaturan pengguna, serta dpkg.
- **hooks**: memungkinkan menjalankan perintah apa pun dari file yang ditempatkan di media live atau server http/ftp.

# BERKAS

- `minios/config.conf` pada media data MiniOS yang dipilih (salinan sumber)
- `minios/config.conf.d/*.conf` pada media data MiniOS yang dipilih (fragmen sumber)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/usr/lib/live/init-config.sh`
- `/usr/lib/live/config.sh`
- `/usr/lib/live/config/`
- `/usr/share/live/config/user-default-groups.d/*.groups`
- `/usr/share/minios/capabilities/minios-live-config.json`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` pada media data yang dapat ditulis yang dipilih saat ekspor log diaktifkan
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` pada media live yang terdeteksi (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` pada media live yang terdeteksi (`medium` preseeds)

# LIHAT JUGA

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Informasi lebih lanjut tentang **minios-live-config** dapat ditemukan di [repositori GitHub](https://github.com/minios-linux/minios-live-config). Informasi umum MiniOS tersedia di [minios.dev](https://minios.dev).

# BUG

Bug dapat dilaporkan melalui [issue tracker minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# PENULIS

**live-config** awalnya ditulis oleh Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Sejak 2016, pengembangan dilanjutkan oleh tim Debian Live. Sejak 2025, pengembangan versi **minios-live-config** yang dimodifikasi dilanjutkan oleh tim MiniOS Live.
