# LIVE-CONFIG

**live-config** - Komponen Konfigurasi Sistem

**live-config** berisi komponen yang mengonfigurasi sistem live selama proses booting (late userspace).

Boot jaringan di initramfs (`ip=`, PXE, `from=http://…`) merupakan lapisan LiveKit terpisah dan **tidak** dikelola oleh live-config. Lihat [Boot jaringan](/installation/Network-Boot.md).

**live-config** dapat dikonfigurasi melalui parameter boot atau file konfigurasi runtime yang disiapkan oleh initramfs. Baris perintah kernel yang sebenarnya akan ditambahkan setelah nilai `LIVE_CONFIG_CMDLINE` yang disediakan oleh file, sehingga parameter boot yang cocok di akhir akan memiliki prioritas lebih tinggi. Saat menggunakan persistensi, komponen **live-config** biasanya hanya dijalankan sekali.

Jika *live-build*(7) digunakan untuk membangun sistem live, parameter live-config yang digunakan secara default dapat diatur melalui opsi `--bootappend-live`, lihat halaman manual *lb_config*(1).

## Parameter Boot (komponen)

**live-config** hanya akan diaktifkan jika `boot=live` digunakan sebagai parameter boot. Selain itu, **live-config** perlu diberitahu komponen mana yang akan dijalankan melalui parameter `live-config.components` atau komponen mana yang tidak dijalankan melalui parameter `live-config.nocomponents`. Jika keduanya, `live-config.components` dan `live-config.nocomponents`, digunakan, atau salah satunya disebutkan beberapa kali, maka yang disebutkan terakhir akan memiliki prioritas dibandingkan yang sebelumnya.

- **live-config.components | components**: Semua komponen dijalankan. Ini adalah pengaturan default pada live image.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Hanya komponen yang disebutkan yang dijalankan. Perhatikan bahwa urutan sangat penting, misalnya, `live-config.components=sudo,user-setup` tidak akan berfungsi karena user harus ditambahkan sebelum dapat dikonfigurasi untuk sudo. Lihat nama file komponen di `/usr/lib/live/config` untuk urutan eksekusinya.
- **live-config.nocomponents | nocomponents**: Tidak ada komponen yang dijalankan. Ini sama dengan tidak menggunakan `live-config.components` maupun `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Semua komponen dijalankan kecuali yang disebutkan.

## Parameter Boot (opsi)

Beberapa komponen individual dapat mengubah perilakunya berdasarkan parameter boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menerapkan satu atau lebih file preseed debconf. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`. Kata kunci `filesystem` mengekstrak file di `/usr/lib/live/config-preseed/`; `medium` mengekstrak file di `minios/config-preseed/` pada media live yang terdeteksi. File lokal eksplisit dapat menggunakan path seperti `file:///run/initramfs/memory/data/minios/config-preseed/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan dengan pipa akan diproses sesuai urutan yang ditentukan; file yang diekstrak berdasarkan kata kunci menggunakan urutan glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Memungkinkan Anda mengatur hostname sistem. Default-nya adalah `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Memungkinkan Anda mengatur username yang dibuat untuk autologin. Default-nya adalah `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Memungkinkan Anda mengatur grup default untuk pengguna yang dibuat untuk autologin. Default-nya adalah `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Memungkinkan Anda mengatur nama lengkap pengguna yang dibuat untuk autologin. Di MiniOS, default-nya adalah `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Memungkinkan pengaturan password root dalam bentuk teks biasa.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Memungkinkan pengaturan password root dalam bentuk terenkripsi.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Memungkinkan pengaturan password pengguna dalam bentuk teks biasa.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Memungkinkan pengaturan password pengguna dalam bentuk terenkripsi.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Memungkinkan Anda mengatur locale sistem, misalnya `de_CH.UTF-8`. Default-nya adalah `en_US.UTF-8`. Jika locale yang dipilih belum tersedia di sistem, maka akan dibuat secara otomatis saat itu juga.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Memungkinkan Anda mengatur zona waktu sistem, misalnya `Europe/Zurich`. Default-nya adalah `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Memungkinkan Anda mengubah model keyboard. Tidak ada nilai default.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Memungkinkan Anda mengubah layout keyboard. Jika lebih dari satu ditentukan, tools dari desktop environment akan memungkinkan Anda untuk beralih di bawah X11. Tidak ada nilai default.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Memungkinkan Anda mengubah varian keyboard. Jika lebih dari satu ditentukan, jumlah nilainya harus sama dengan nilai keyboard-layouts karena akan dipasangkan satu-satu sesuai urutan yang ditentukan. Nilai kosong diperbolehkan. Tools desktop environment akan memungkinkan Anda beralih antar pasangan layout dan varian di bawah X11. Tidak ada nilai default.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Memungkinkan Anda mengubah opsi keyboard. Tidak ada nilai default.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Memungkinkan Anda menonaktifkan layanan sysv melalui update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Memungkinkan Anda mengatur apakah sistem mengasumsikan jam perangkat keras diatur ke UTC atau tidak. Default-nya adalah `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Memungkinkan Anda mengatur x-session-manager melalui update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Memungkinkan Anda mengatur driver xorg alih-alih mendeteksinya secara otomatis. Jika PCI ID ditentukan di `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ditemukan parameter boot dan override, parameter boot akan diutamakan.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Memungkinkan Anda mengatur resolusi xorg alih-alih mendeteksinya secara otomatis, misalnya 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Memungkinkan Anda mengatur driver WLAN alih-alih mendeteksinya secara otomatis. Jika PCI ID ditentukan di `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ditemukan parameter boot dan override, parameter boot akan diutamakan.
- **live-config.module-mode=MODE | module-mode=MODE**: Memungkinkan Anda menentukan mode modul untuk konfigurasi live. Jika diatur ke "merged", sistem akan memperbarui akun pengguna, membangun ulang cache, dan menyegarkan pengaturan paket sehingga perubahan konfigurasi dapat diintegrasikan secara dinamis ke dalam sistem yang sedang berjalan.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menjalankan file arbitrer dari file sementara di sistem live yang sedang berjalan. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`; interpreter dan dependensi yang dibutuhkan harus sudah terpasang. Kata kunci `filesystem` mengekstrak file di `/usr/lib/live/config-hooks/`; `medium` mengekstrak file di `minios/config-hooks/` pada media live yang terdeteksi (dengan fallback ISO-path di komponen hook). File lokal eksplisit dapat menggunakan `file:///run/initramfs/memory/data/minios/config-hooks/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan dengan pipa akan dieksekusi sesuai urutan yang ditentukan; file yang diekstrak berdasarkan kata kunci menggunakan urutan glob shell. Contoh terpasang di `/usr/share/doc/live-config/examples/hooks/`.

> **Peringatan keamanan:** `live-config` dijalankan sebagai root. Hook dibuat executable dan dijalankan sebagai root, dan preseed mengubah database debconf sistem dengan hak akses root. HTTP dan FTP biasa tidak melakukan autentikasi konten yang diunduh dan tidak menyediakan perlindungan integritas. Sebaiknya gunakan file lokal yang sudah ditinjau atau transportasi terautentikasi yang tepercaya dengan verifikasi integritas independen; jangan gunakan hook atau preseed jarak jauh dari jaringan yang tidak tepercaya.

## Parameter Boot (shortcut)

Untuk beberapa kasus penggunaan umum yang biasanya membutuhkan kombinasi beberapa parameter individual, **live-config** menyediakan shortcut. Ini memungkinkan Anda tetap memiliki kontrol penuh atas semua opsi, sekaligus menjaga agar tetap sederhana.

- **live-config.noroot | noroot**: Menonaktifkan sudo dan policykit, sehingga user tidak dapat memperoleh hak akses root pada sistem.
- **live-config.noautologin | noautologin**: Menonaktifkan login otomatis baik di konsol maupun secara grafis.
- **live-config.nottyautologin | nottyautologin**: Menonaktifkan login otomatis di konsol, tanpa memengaruhi autologin grafis.
- **live-config.nox11autologin | nox11autologin**: Menonaktifkan login otomatis dengan display manager apa pun, tanpa memengaruhi tty autologin.

## Parameter Boot (opsi khusus)

Untuk kasus penggunaan khusus, terdapat beberapa parameter boot khusus.

- **live-config.debug | debug**: Mengaktifkan output debug di live-config.

## Berkas Konfigurasi

**live-config** dapat dikonfigurasi (namun tidak diaktifkan) melalui berkas konfigurasi. Semua hal selain pintasan yang dapat dikonfigurasi dengan parameter boot juga dapat dikonfigurasi secara alternatif melalui satu atau lebih berkas. Jika berkas konfigurasi digunakan, parameter `boot=live` tetap diperlukan untuk mengaktifkan **live-config**.

**Catatan:** Jika berkas konfigurasi digunakan, sebaiknya semua parameter boot dimasukkan ke dalam variabel **LIVE_CONFIG_CMDLINE**, atau variabel individual dapat diatur. Jika variabel individual digunakan, pengguna harus memastikan bahwa semua variabel yang diperlukan telah diatur untuk membuat konfigurasi yang valid.

`live-config` sendiri melakukan sourcing terhadap `/etc/live/config.conf` lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Fragmen yang muncul belakangan dapat menggantikan nilai dari berkas utama atau fragmen sebelumnya. Tidak ada sourcing terpisah untuk lapisan konfigurasi media kedua.

Pada media MiniOS, berkas sumber adalah `minios/config.conf` dan `minios/config.conf.d/*.conf`. Sebelum `live-config` dimulai, initramfs MiniOS melakukan sinkronisasi berkas-berkas ini dengan berkas runtime `/etc/live/` berdasarkan waktu modifikasi. Berkas sumber yang lebih baru akan menggantikan berkas runtime-nya; berkas runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis. Jika timestamp sama, tidak ada penyalinan; berkas yang hilang akan diisi, dan berkas tidak dihapus. Ini adalah sinkronisasi saat boot, bukan pemantauan terus-menerus. Lihat [Berkas Konfigurasi](/configuration/Configuration-File.md) untuk aturan lengkap sinkronisasi dan prioritas command-line.

Sebagai cadangan untuk implementasi initramfs yang tidak menyiapkan berkas runtime, wrapper startup systemd dan SysV akan menyalin `minios/config.conf` dari media yang terdeteksi hanya jika `/etc/live/config.conf` tidak ada. Cadangan ini tidak menyalin fragmen `config.conf.d`. Initramfs MiniOS LiveKit standar saat ini melakukan sinkronisasi seperti dijelaskan sebelumnya.

Berkas fragmen harus sesuai dengan `*.conf`. Nama seperti `vendor.conf` atau `project.conf` direkomendasikan; pilih nama leksikal dengan sengaja karena fragmen yang muncul belakangan akan menimpa yang sebelumnya.

Isi sebenarnya dari berkas konfigurasi terdiri dari satu atau lebih variabel berikut.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Variabel ini sesuai dengan command line bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Variabel ini sesuai dengan parameter `**live-config.hostname**=*HOSTNAME*`. Default-nya adalah `minios`.
- **LIVE_USERNAME=USERNAME**: Variabel ini sesuai dengan parameter `**live-config.username**=*USERNAME*`. Default-nya adalah `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Variabel ini sesuai dengan parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Variabel ini sesuai dengan parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password**=*PASSWORD*`. Ini menentukan password root dalam bentuk teks biasa.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password-crypted**=*PASSWORD*`. Ini menentukan password root dalam bentuk terenkripsi.
- **LIVE_USER_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password**=*PASSWORD*`. Ini menentukan password user dalam bentuk teks biasa.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password-crypted**=*PASSWORD*`. Ini menentukan password user dalam bentuk terenkripsi.
- **LIVE_LOCALES=LOCALE1,LOCALE2,...LOCALEn**: Variabel ini sesuai dengan parameter `**live-config.locales**=*LOCALE1*,*LOCALE2*...*LOCALEn*`.
- **LIVE_TIMEZONE=TIMEZONE**: Variabel ini sesuai dengan parameter `**live-config.timezone**=*TIMEZONE*`.
- **LIVE_KEYBOARD_MODEL=KEYBOARD_MODEL**: Variabel ini sesuai dengan parameter `**live-config.keyboard-model**=*KEYBOARD_MODEL*`.
- **LIVE_KEYBOARD_LAYOUTS=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Variabel ini sesuai dengan parameter `**live-config.keyboard-layouts**=*KEYBOARD_LAYOUT1*,*KEYBOARD_LAYOUT2*...*KEYBOARD_LAYOUTn*`.
- **LIVE_KEYBOARD_VARIANTS=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Variabel ini sesuai dengan parameter `**live-config.keyboard-variants**=*KEYBOARD_VARIANT1*,*KEYBOARD_VARIANT2*...*KEYBOARD_VARIANTn*`.
- **LIVE_KEYBOARD_OPTIONS=KEYBOARD_OPTIONS**: Variabel ini sesuai dengan parameter `**live-config.keyboard-options**=*KEYBOARD_OPTIONS*`.
- **LIVE_SYSV_RC=SERVICE1,SERVICE2,...SERVICEn**: Variabel ini sesuai dengan parameter `**live-config.sysv-rc**=*SERVICE1*,*SERVICE2*...*SERVICEn*`.
- **LIVE_UTC=yes|no**: Variabel ini sesuai dengan parameter `**live-config.utc**=**yes**|no`.
- **LIVE_X_SESSION_MANAGER=X_SESSION_MANAGER**: Variabel ini sesuai dengan parameter `**live-config.x-session-manager**=*X_SESSION_MANAGER*`.
- **LIVE_XORG_DRIVER=XORG_DRIVER**: Variabel ini sesuai dengan parameter `**live-config.xorg-driver**=*XORG_DRIVER*`.
- **LIVE_XORG_RESOLUTION=XORG_RESOLUTION**: Variabel ini sesuai dengan parameter `**live-config.xorg-resolution**=*XORG_RESOLUTION*`.
- **LIVE_WLAN_DRIVER=WLAN_DRIVER**: Variabel ini sesuai dengan parameter `**live-config.wlan-driver**=*WLAN_DRIVER*`.
- **LIVE_HOOKS=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.hooks**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_LINK_USER_DIRS=true|false**: Variabel ini sesuai dengan parameter `**live-config.link-user-dirs**=true|false`. Ini menghubungkan direktori data standar user ke drive MiniOS yang dapat ditulis. Tidak dapat digabungkan dengan mode bind atau mode `toram` mana pun.
- **LIVE_BIND_USER_DIRS=true|false**: Variabel ini sesuai dengan parameter `**live-config.bind-user-dirs**=true|false`. Ini melakukan bind-mount direktori data standar user dari drive MiniOS yang dapat ditulis. Tidak dapat digabungkan dengan mode link atau mode `toram` mana pun.
- **LIVE_USER_DIRS_PATH=PATH**: Variabel ini sesuai dengan parameter `**live-config.user-dirs-path**=*PATH*`. Ini menentukan path yang aman di dalam drive MiniOS FAT32, exFAT, atau NTFS. Default-nya adalah `/minios/userdata`; segmen titik dan direktori induk akan ditolak.

Pengaturan media user tidak pernah menggabungkan dua direktori non-kosong secara otomatis. Direktori lokal non-kosong hanya akan dimigrasikan jika tujuan media kosong. Jika fitur dinonaktifkan, data media yang dikelola akan disalin kembali sebelum link dihapus. Validasi atau penyalinan yang gagal akan membiarkan direktori user yang ada tetap dan mencatat alasan di `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE**: Variabel ini menyimpan status yang ditentukan oleh parameter `live-config.module-mode` (atau `module-mode`). Jika diatur ke "merged", sistem live akan menerapkan pembaruan (melalui minios-update-users, minios-update-cache, dan minios-update-dpkg) untuk menggabungkan konfigurasi kustom dengan lingkungan dasar.
- **LIVE_CONFIG_DEBUG=true|false**: Variabel ini sesuai dengan parameter `**live-config.debug**`.

# KUSTOMISASI

**live-config** dapat dengan mudah dikustomisasi untuk proyek turunan atau penggunaan lokal.

## Menambah komponen konfigurasi baru

Proyek turunan dapat menempatkan komponen mereka di /usr/lib/live/config dan tidak perlu melakukan apa pun lagi, karena komponen tersebut akan dijalankan secara otomatis saat boot.

Komponen paling baik ditempatkan dalam paket debian tersendiri. Contoh paket yang berisi contoh komponen dapat ditemukan di /usr/share/doc/live-config/examples.

## Menghapus komponen konfigurasi yang ada

Saat ini belum memungkinkan untuk menghapus komponen secara langsung dengan cara yang aman tanpa harus mengirimkan paket **live-config** yang dimodifikasi secara lokal atau menggunakan dpkg-divert. Namun, hal yang sama dapat dicapai dengan menonaktifkan komponen terkait melalui mekanisme live-config.nocomponents, lihat di atas. Untuk menghindari harus selalu menentukan komponen yang dinonaktifkan melalui parameter boot, sebaiknya gunakan berkas konfigurasi, lihat di atas.

Berkas konfigurasi untuk sistem live itu sendiri paling baik ditempatkan dalam paket debian tersendiri. Contoh paket yang berisi contoh konfigurasi dapat ditemukan di /usr/share/doc/live-config/examples.

# KOMPONEN

**live-config** saat ini menyediakan komponen berikut di /usr/lib/live/config.

- **nss-systemd**: menghapus atau mengembalikan modul NSS systemd di /etc/nsswitch.conf untuk mengatasi masalah systemd yang sudah diketahui.
- **debconf**: memungkinkan untuk menerapkan file preseed secara bebas yang diletakkan di media live atau server http/ftp.
- **hostname**: mengonfigurasi /etc/hostname dan /etc/hosts.
- **issue-setup**: menyiapkan file /etc/issue dengan banner sambutan dan informasi distribusi.
- **live-debconfig (passwd)**: mengonfigurasi password user dan root melalui live-debconfig.
- **user-setup**: menambahkan akun user live.
- **root-setup**: mengatur atau memperbarui password root dan mengonfigurasi environment user root.
- **sudo**: memberikan hak sudo ke user live.
- **user-media**: mengonfigurasi mounting media serta pembuatan link atau bind direktori user untuk data persisten.
- **user-ssh-keys**: menyinkronkan SSH key dari file `authorized_keys.<username>` spesifik user di media live ke home directory masing-masing user. Mendukung banyak user sekaligus (misal, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`).
- **locales**: mengonfigurasi locale.
- **tzdata**: mengonfigurasi /etc/timezone.
- **xorg-service**: mengonfigurasi username di xorg.service.
- **gdm3**: mengonfigurasi autologin di gdm3.
- **kdm**: mengonfigurasi autologin di kdm.
- **lightdm**: mengonfigurasi autologin di lightdm.
- **lxdm**: mengonfigurasi autologin di lxdm.
- **nodm**: mengonfigurasi autologin di nodm.
- **slim**: mengonfigurasi autologin di slim.
- **xinit**: mengonfigurasi autologin dengan xinit.
- **keyboard-configuration**: mengonfigurasi keyboard.
- **sysvinit**: mengonfigurasi sysvinit.
- **sysv-rc**: mengonfigurasi sysv-rc dengan menonaktifkan layanan yang disebutkan.
- **login**: menonaktifkan lastlog.
- **anacron**: menonaktifkan anacron.
- **util-linux**: menonaktifkan hwclock dari util-linux.
- **apport**: menonaktifkan apport.
- **gnome-panel-data**: menonaktifkan tombol kunci layar.
- **gnome-power-manager**: menonaktifkan hibernasi.
- **gnome-screensaver**: menonaktifkan screensaver yang mengunci layar.
- **kaboom**: menonaktifkan wizard migrasi KDE (squeeze dan lebih baru).
- **kde-services**: menonaktifkan beberapa layanan KDE yang tidak diinginkan (squeeze dan lebih baru).
- **policykit**: memberikan hak akses user melalui policykit.
- **ssl-cert**: regenerasi sertifikat ssl snake-oil.
- **xrdp**: mengonfigurasi xrdp untuk konektivitas remote desktop.
- **xfce4-panel**: mengonfigurasi xfce4-panel ke pengaturan default.
- **xscreensaver**: menonaktifkan screensaver yang mengunci layar.
- **broadcom-sta**: mengonfigurasi driver WLAN broadcom-sta.
- **xserver-xorg**: mengonfigurasi xserver-xorg.
- **openssh-server**: membuat ulang host key openssh-server.
- **hyperv**: mengonfigurasi pengaturan X11 untuk meningkatkan kompatibilitas pada platform Microsoft Hyper-V.
- **ntfs3**: mengelola aturan udev untuk dukungan NTFS3.
- **config-module-mode**: mengonfigurasi mode modul sistem dan memperbarui cache, pengaturan user, dan dpkg.
- **hooks**: memungkinkan menjalankan perintah bebas dari file yang diletakkan di media live atau server http/ftp.

# FILES

- `minios/config.conf` pada media data MiniOS yang dipilih (salinan sumber)
- `minios/config.conf.d/*.conf` pada media data MiniOS yang dipilih (fragmen sumber)
- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/var/log/minios/minios-boot.log`
- `minios/log/YYYYMMDD_HHMMSS/` pada media data yang dipilih yang dapat ditulis saat ekspor log diaktifkan
- `/usr/lib/live/config-hooks/*` (hook `filesystem`)
- `minios/config-hooks/*` pada media live yang terdeteksi (hook `medium`)
- `/usr/lib/live/config-preseed/*` (preseed `filesystem`)
- `minios/config-preseed/*` pada media live yang terdeteksi (preseed `medium`)

# LIHAT JUGA

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# HOMEPAGE

Informasi lebih lanjut tentang **minios-live-config** dan proyek MiniOS dapat ditemukan di [minios.dev](https://minios.dev) dan [GitHub repository](https://github.com/minios-linux/minios-live).

# BUG

Bug dapat dilaporkan dengan membuat issue di repository GitHub pada [MiniOS Issues](https://github.com/minios-linux/minios-live/issues).

# PENULIS

**live-config** awalnya ditulis oleh Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Sejak 2016, pengembangan dilanjutkan oleh tim Debian Live. Sejak 2025, pengembangan versi **minios-live-config** yang dimodifikasi dilanjutkan oleh tim MiniOS Live.
