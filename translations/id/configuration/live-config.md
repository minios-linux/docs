# LIVE-CONFIG

**live-config** - Komponen Konfigurasi Sistem

**live-config** berisi komponen yang mengonfigurasi sistem live selama proses booting (late userspace).

**live-config** dapat dikonfigurasi melalui parameter boot atau berkas konfigurasi. Jika kedua mekanisme digunakan untuk opsi tertentu, parameter boot akan memiliki prioritas dibandingkan berkas konfigurasi. Saat menggunakan persistensi, komponen **live-config** hanya dijalankan satu kali.

Jika *live-build*(7) digunakan untuk membangun sistem live, parameter live-config yang digunakan secara default dapat diatur melalui opsi `--bootappend-live`, lihat halaman manual *lb_config*(1).

## Parameter Boot (komponen)

**live-config** hanya akan diaktifkan jika `boot=live` digunakan sebagai parameter boot. Selain itu, **live-config** perlu diberitahu komponen mana yang akan dijalankan melalui parameter `live-config.components` atau komponen mana yang tidak dijalankan melalui parameter `live-config.nocomponents`. Jika keduanya, `live-config.components` dan `live-config.nocomponents`, digunakan, atau salah satunya disebutkan beberapa kali, maka yang disebutkan terakhir akan memiliki prioritas dibandingkan yang sebelumnya.

- **live-config.components | components**: Semua komponen dijalankan. Ini adalah pengaturan default pada live image.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Hanya komponen yang disebutkan yang dijalankan. Perhatikan bahwa urutan sangat penting, misalnya, `live-config.components=sudo,user-setup` tidak akan berfungsi karena user harus ditambahkan sebelum dapat dikonfigurasi untuk sudo. Lihat nama file komponen di `/usr/lib/live/config` untuk urutan eksekusinya.
- **live-config.nocomponents | nocomponents**: Tidak ada komponen yang dijalankan. Ini sama dengan tidak menggunakan `live-config.components` maupun `live-config.nocomponents`.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Semua komponen dijalankan kecuali yang disebutkan.

## Parameter Boot (opsi)

Beberapa komponen individual dapat mengubah perilakunya melalui parameter boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Memungkinkan untuk mengambil dan menerapkan satu atau lebih file preseed debconf ke database debconf. Perhatikan bahwa URL harus dapat diakses oleh wget (http, ftp, atau file://). Jika file diletakkan di media live, file dapat diambil dengan `file:///run/initramfs/memory/data/FILE`, atau dengan `file:///FILE` jika berada di root filesystem sistem live itu sendiri. Semua file preseed di `/usr/lib/live/config-preseed/` pada root filesystem sistem live dapat diaktifkan otomatis dengan kata kunci `filesystem`. Semua file preseed di `/minios/config-preseed/` pada media live dapat diaktifkan otomatis dengan kata kunci `medium`. Jika beberapa mekanisme digabungkan, maka file preseed filesystem diterapkan terlebih dahulu, lalu file preseed medium, dan terakhir file preseed dari jaringan.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Memungkinkan untuk mengatur hostname sistem. Default-nya adalah `minios`.
- **live-config.username=USERNAME | username=USERNAME**: Memungkinkan untuk mengatur username yang dibuat untuk autologin. Default-nya adalah `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Memungkinkan untuk mengatur grup default untuk user yang dibuat untuk autologin. Default-nya adalah `audio cdrom dip floppy video plugdev netdev powerdev scanner bluetooth`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Memungkinkan untuk mengatur nama lengkap user yang dibuat untuk autologin. Pada MiniOS, default-nya adalah `MiniOS Live user`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Memungkinkan mengatur password root dalam bentuk teks biasa.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Memungkinkan mengatur password root dalam bentuk terenkripsi.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Memungkinkan mengatur password user dalam bentuk teks biasa.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Memungkinkan mengatur password user dalam bentuk terenkripsi.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Memungkinkan untuk mengatur locale sistem, misal `de_CH.UTF-8`. Default-nya adalah `en_US.UTF-8`. Jika locale yang dipilih belum tersedia di sistem, akan dibuat secara otomatis.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Memungkinkan untuk mengatur zona waktu sistem, misal `Europe/Zurich`. Default-nya adalah `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Memungkinkan untuk mengubah model keyboard. Tidak ada nilai default.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Memungkinkan untuk mengubah layout keyboard. Jika lebih dari satu ditentukan, tools dari desktop environment akan memungkinkan untuk beralih di bawah X11. Tidak ada nilai default.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Memungkinkan untuk mengubah varian keyboard. Jika lebih dari satu ditentukan, jumlah nilai harus sama dengan jumlah keyboard-layouts karena akan dipasangkan satu per satu sesuai urutan. Nilai kosong diperbolehkan. Tools dari desktop environment akan memungkinkan beralih antar layout dan varian di bawah X11. Tidak ada nilai default.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Memungkinkan untuk mengubah opsi keyboard. Tidak ada nilai default.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Memungkinkan untuk menonaktifkan layanan sysv melalui update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Memungkinkan untuk mengatur apakah sistem mengasumsikan jam hardware diatur ke UTC atau tidak. Default-nya adalah `yes`.
- **live-config.x-session-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Memungkinkan untuk mengatur x-session-manager melalui update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Memungkinkan untuk mengatur driver xorg secara manual, bukan autodetect. Jika PCI ID ditentukan di `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika parameter boot dan override ditemukan, parameter boot akan diutamakan.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Memungkinkan untuk mengatur resolusi xorg secara manual, misal 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Memungkinkan untuk mengatur driver WLAN secara manual, bukan autodetect. Jika PCI ID ditentukan di `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dalam sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika parameter boot dan override ditemukan, parameter boot akan diutamakan.
- **live-config.module-mode=MODE | module-mode=MODE**: Memungkinkan Anda menentukan mode modul untuk konfigurasi live. Jika diatur ke "merged", sistem akan memperbarui akun user, membangun ulang cache, dan menyegarkan pengaturan paket sehingga perubahan konfigurasi terintegrasi secara dinamis ke sistem yang sedang berjalan.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Memungkinkan untuk mengambil dan mengeksekusi satu atau lebih file secara bebas. Perhatikan bahwa URL harus dapat diakses oleh wget (http, ftp, atau file://), file dieksekusi di /tmp dari sistem live yang berjalan, dan file harus memiliki dependensi yang diperlukan, misal jika skrip python ingin dijalankan maka python harus sudah terpasang. Beberapa hooks untuk kasus penggunaan umum tersedia di `/usr/share/doc/live-config/examples/hooks/`. Jika file diletakkan di media live, file dapat diambil dengan `file:///run/initramfs/memory/data/FILE`, atau dengan `file:///FILE` jika berada di root filesystem sistem live itu sendiri. Semua hooks di `/usr/lib/live/config-hooks/` pada root filesystem sistem live dapat diaktifkan otomatis dengan kata kunci `filesystem`. Semua hooks di `/minios/config-hooks/` pada media live dapat diaktifkan otomatis dengan kata kunci `medium`. Jika beberapa mekanisme digabungkan, maka hooks filesystem dijalankan terlebih dahulu, lalu hooks medium, dan terakhir hooks dari jaringan.

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

**live-config** dapat dikonfigurasi (namun tidak diaktifkan) melalui berkas konfigurasi. Semua pengaturan, kecuali pintasan yang dapat dikonfigurasi melalui parameter boot, juga dapat diatur melalui satu atau beberapa berkas. Jika menggunakan berkas konfigurasi, parameter `boot=live` tetap diperlukan untuk mengaktifkan **live-config**.

**Catatan:** Jika menggunakan berkas konfigurasi, sebaiknya semua parameter boot dimasukkan ke dalam variabel **LIVE_CONFIG_CMDLINE**, atau variabel individual dapat diatur secara terpisah. Jika menggunakan variabel individual, pengguna harus memastikan semua variabel yang diperlukan sudah diatur agar konfigurasi valid.

Berkas konfigurasi dapat ditempatkan di root filesystem (`/etc/live/config.conf`, `/etc/live/config.conf.d/*.conf`), atau pada media live (`minios/config.conf`, `minios/config.conf.d/*.conf`). Jika opsi tertentu ada di kedua lokasi, konfigurasi dari media live akan memiliki prioritas dibandingkan yang ada di root filesystem.

Meskipun nama berkas konfigurasi di direktori konfigurasi tidak harus tertentu, demi konsistensi disarankan menggunakan skema penamaan `vendor.conf` atau `project.conf` (di mana `vendor` atau `project` diganti dengan nama sebenarnya, misal `progress-linux.conf`).

Isi berkas konfigurasi terdiri dari satu atau beberapa variabel berikut.

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
- **LIVE_LINK_USER_DIRS=true|false**: Variabel ini sesuai dengan parameter `**live-config.link-user-dirs**=true|false`. Opsi ini menghubungkan direktori data standar pengguna ke drive MiniOS yang dapat ditulis. Tidak dapat digabungkan dengan mode bind atau mode `toram` apa pun.
- **LIVE_BIND_USER_DIRS=true|false**: Variabel ini sesuai dengan parameter `**live-config.bind-user-dirs**=true|false`. Opsi ini melakukan bind-mount direktori data standar pengguna dari drive MiniOS yang dapat ditulis. Tidak dapat digabungkan dengan mode link atau mode `toram` apa pun.
- **LIVE_USER_DIRS_PATH=PATH**: Variabel ini sesuai dengan parameter `**live-config.user-dirs-path**=*PATH*`. Ini menentukan path aman di dalam drive MiniOS FAT32, exFAT, atau NTFS. Default-nya adalah `/minios/userdata`; segmen dot dan parent-directory akan ditolak.

Pengaturan media pengguna tidak pernah menggabungkan dua direktori non-kosong secara otomatis. Direktori lokal non-kosong hanya akan dimigrasikan jika tujuan media-nya kosong. Saat fitur ini dinonaktifkan, data media yang dikelola akan disalin kembali sebelum tautan dihapus. Jika validasi atau penyalinan gagal, direktori pengguna yang ada tetap dipertahankan dan alasan kegagalan dicatat di `/var/lib/live/config/user-media.status`.
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

# BERKAS

- `/etc/live/config.conf`
- `/etc/live/config.conf.d/*.conf`
- `minios/config.conf`
- `minios/config.conf.d/*.conf`
- `/lib/live/config.sh`
- `/lib/live/config/`
- `/var/lib/live/config/`
- `/var/log/live/config.log`
- `/minios/config-hooks/*`
- `minios/config-hooks/*`
- `/minios/config-preseed/*`
- `minios/config-preseed/*`

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
