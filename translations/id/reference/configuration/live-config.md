---
updated: 2026-10-06
program_commits:
    minios-live-config: cf3ae490e5df92581483ec6345a5f56bdaa812d8
---

# live-config

**Komponen Konfigurasi Sistem** - Komponen Konfigurasi Sistem

**live-config** berisi komponen yang mengonfigurasi sistem live selama proses boot (late userspace).

Kebijakan cache sesi-persisten dan log ditentukan lebih awal oleh `minios-boot`, setelah live root dan konfigurasinya disiapkan namun sebelum layanan utama dijalankan. Komponen `browser-cache` live-config menerapkan mount per pengguna setelah pembuatan user. Kebijakan ini memerlukan sesi `perch` yang sehat dan initrd terbaru yang mengiklankan `perch-storage-v1`; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) untuk efek dan batasannya.

Boot jaringan di initramfs (`ip=`, PXE, `from=http://…`) merupakan lapisan LiveKit terpisah dan **tidak** dikelola oleh live-config. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

**live-config** dapat dikonfigurasi melalui parameter boot atau file konfigurasi runtime yang disiapkan oleh initramfs. Kernel command line yang sebenarnya akan ditambahkan setelah nilai yang disediakan oleh file, sehingga parameter boot yang cocok di akhir akan menjadi prioritas. Komponen yang mencatat status di bawah `LIVE_CONFIG_CMDLINE` biasanya hanya dijalankan sekali; komponen sinkronisasi dan stateless dapat berjalan setiap kali dipanggil.`/var/lib/live/config`

Jika *live-build*(7) digunakan untuk membangun sistem live, parameter live-config yang digunakan secara default dapat diatur melalui opsi `--bootappend-live`, lihat *lb_config*(1) halaman manual.

## Parameter Boot (komponen)

**live-config** hanya diaktifkan jika `boot=live` digunakan sebagai parameter boot. Secara default, semua komponen dijalankan. Parameter `live-config.components` dapat membatasi komponen mana yang dijalankan, dan `live-config.nocomponents` dapat mengecualikan komponen tertentu. Jika kedua parameter digunakan, atau salah satunya disebutkan lebih dari satu kali, yang terakhir akan diutamakan.

- **live-config.components | components**: Semua komponen dijalankan. Ini adalah pengaturan default pada live image.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Hanya komponen yang disebutkan yang dijalankan. Komponen akan dieksekusi sesuai urutan pada nama file mereka di bawah `/usr/lib/live/config`, terlepas dari urutan pada daftar ini.
- **live-config.nocomponents | nocomponents**: Tidak ada komponen yang dijalankan.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Semua komponen dijalankan, kecuali yang disebutkan.

## Parameter Boot (opsi)

Beberapa komponen tertentu dapat mengubah perilakunya melalui parameter boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menerapkan satu atau lebih file preseed debconf. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`. Kata kunci `filesystem` akan mengekspansi file di `/usr/lib/live/config-preseed/`; `medium` mengekspansi file di `minios/config-preseed/` pada media live yang terdeteksi. File lokal eksplisit dapat menggunakan path seperti `file:///run/initramfs/memory/data/minios/config-preseed/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan pipa akan diproses sesuai urutan; file yang diekspansi dengan kata kunci menggunakan urutan glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Mengatur hostname sistem. Default-nya adalah `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Memilih kebijakan jaringan kabel. Jika tidak diatur dan `dhcp` tidak diubah, pengaturan image tetap. `static` menulis konfigurasi untuk backend yang dipilih; `off` menonaktifkan konfigurasi IPv4 otomatis untuk interface yang dipilih.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Memilih interface kabel. Jika tidak diisi untuk `static` atau `off`, satu-satunya interface kabel non-loopback akan dipilih otomatis; jika ada nol atau lebih dari satu kandidat, harus diisi secara eksplisit.
- **live-config.network-address=IPV4 | network-address=IPV4**: Mengatur alamat IPv4 statik.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Mengatur panjang prefix IPv4 dari 0 sampai 32. Default statik adalah `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Mengatur gateway IPv4 opsional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Mengatur alamat server DNS opsional yang dipisahkan koma.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Memilih backend jaringan. `auto` memilih NetworkManager dan akan fallback ke ifupdown. Jika dipaksa, `ifupdown` akan menandai interface sebagai unmanaged oleh NetworkManager jika kedua stack terpasang.
- **live-config.username=USERNAME | username=USERNAME**: Mengatur nama pengguna yang akan dibuat untuk autologin. Default-nya adalah `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Mengatur grup tambahan untuk user yang dibuat untuk autologin. Nama grup dapat dipisahkan dengan koma atau spasi. Default MiniOS adalah `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Mengatur nama lengkap user yang dibuat untuk autologin. Default MiniOS adalah `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Mengatur password root dalam bentuk teks biasa.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Mengatur password root dalam bentuk terenkripsi.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Mengatur password user dalam bentuk teks biasa.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Mengatur password user dalam bentuk terenkripsi.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Mengatur locale sistem, misal `de_CH.UTF-8`. Default-nya adalah `en_US.UTF-8`. Jika locale yang dipilih belum tersedia di sistem, akan dibuat otomatis saat boot.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Mengatur zona waktu sistem, misal `Europe/Zurich`. Default-nya adalah `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Mengubah model keyboard. Tidak ada nilai default.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Mengubah tata letak keyboard. Jika lebih dari satu ditentukan, tools pada desktop environment akan memungkinkan penggantian di X11. Tidak ada nilai default.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Mengubah varian keyboard. Jika lebih dari satu ditentukan, jumlahnya harus sama dengan nilai keyboard-layouts karena akan dipasangkan satu per satu sesuai urutan. Nilai kosong diperbolehkan. Tools pada desktop environment akan memungkinkan penggantian antar layout dan varian di X11. Tidak ada nilai default.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Mengubah opsi keyboard. Tidak ada nilai default.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Menonaktifkan layanan sysv melalui update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Mengatur apakah sistem mengasumsikan jam hardware diatur ke UTC atau tidak. Default-nya adalah `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Mengatur x-session-manager melalui update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Mengatur driver xorg secara manual, bukan autodetect. Jika PCI ID ditentukan di `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` pada sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ada parameter boot dan override, parameter boot akan diutamakan.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Mengatur resolusi xorg secara manual, misal 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Mengatur driver WLAN secara manual, bukan autodetect. Jika PCI ID ditentukan di `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` pada sistem live, *DRIVER* akan dipaksakan untuk perangkat tersebut. Jika ada parameter boot dan override, parameter boot akan diutamakan.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Mengatur mode modul untuk konfigurasi live. Jika diatur ke `merged`, sistem akan memperbarui akun pengguna, membangun ulang cache, dan menyegarkan pengaturan paket agar perubahan konfigurasi langsung terintegrasi ke sistem yang berjalan.
- **live-config.link-user-dirs | link-user-dirs**: Membuat symlink direktori pengguna yang dikelola ke path yang dikonfigurasi pada media data MiniOS. Tidak dapat digunakan bersamaan dengan mode bind dan tidak tersedia pada mode `toram` apa pun atau jika sesi persistensi aktif dienkripsi LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Melakukan bind-mount direktori pengguna yang dikelola dari path yang dikonfigurasi pada media data MiniOS. Tidak dapat digunakan bersamaan dengan mode link dan memiliki batasan `toram` serta enkripsi sesi aktif yang sama.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Mengatur path relatif media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Default-nya adalah `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menjalankan file arbitrary dari file sementara pada sistem live yang berjalan. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`; interpreter dan dependensi yang dibutuhkan harus sudah terpasang. Kata kunci `filesystem` akan mengekspansi file di `/usr/lib/live/config-hooks/`; `medium` mengekspansi file di `minios/config-hooks/` pada media live yang terdeteksi (fallback ISO-path pada komponen hook). File lokal eksplisit dapat menggunakan `file:///run/initramfs/memory/data/minios/config-hooks/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan pipa akan dijalankan sesuai urutan; file yang diekspansi dengan kata kunci menggunakan urutan glob shell. Contoh terpasang di bawah `/usr/share/doc/live-config/examples/hooks/`.

> **Peringatan keamanan:** `live-config` dijalankan sebagai root. Hook dibuat executable dan dijalankan sebagai root, dan preseed mengubah database debconf sistem dengan hak akses root. HTTP dan FTP biasa tidak mengautentikasi konten yang diunduh dan tidak memberikan perlindungan integritas. Sebaiknya gunakan file lokal yang telah ditinjau atau transportasi terautentikasi yang terpercaya dengan verifikasi integritas independen; jangan gunakan hook atau preseed jarak jauh dari jaringan yang tidak dipercaya.

### Opsi storage awal MiniOS

Opsi-opsi ini dibaca oleh `minios-boot` sebelum layanan biasa dijalankan. Opsi ini memerlukan sesi `perch` yang sehat dan tidak mengaktifkan sesi tersebut secara otomatis.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` menempatkan journal systemd dan file `/var/log` biasa ke dalam RAM terbatas; diagnostik boot tetap di storage yang tahan lama. Default: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` menempatkan arsip APT yang diunduh ke tmpfs terbatas jika kondisi RAM dan swap memungkinkan. Database paket dan daftar repository tetap persisten. Default: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` meminta cache browser native pada RAM. Komponen `browser-cache` akan me-mount direktori cache yang dipilih user live setelah akun dibuat. Default: `persistent`.

## Parameter Boot (shortcut)

Untuk beberapa kasus penggunaan umum yang memerlukan kombinasi beberapa parameter individual, **live-config** menyediakan shortcut. Ini memungkinkan kontrol penuh atas semua opsi sekaligus tetap sederhana.

- **live-config.noroot | noroot**: Menonaktifkan pengaturan password root dan pemberian hak istimewa sudo serta PolicyKit MiniOS.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Mengatur konfigurasi sudo untuk user live. Default dan perilaku MiniOS historis jika tidak diatur adalah `passwordless`. Mode `password` tetap memberikan akses sudo namun memerlukan password user live. Mode `disabled` menghapus grant sudo MiniOS dan memastikan user live tidak masuk grup sudo saat dibuat. Shortcut lama `noroot` akan menonaktifkan pengaturan hak istimewa root secara lebih luas.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Mengatur aturan kemudahan PolicyKit MiniOS. Default dan perilaku MiniOS historis jika tidak diatur adalah `passwordless`. Mode `password` dan `disabled` akan menghapus aturan tersebut, sehingga autentikasi PolicyKit distribusi normal berlaku. `disabled` bukan kebijakan tolak total; gunakan `noroot` jika user live tidak boleh mendapatkan hak admin.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Menulis kebijakan OpenSSH `PermitRootLogin` jika diatur secara eksplisit dan openssh-server terpasang.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Menulis kebijakan OpenSSH `PasswordAuthentication` jika diatur secara eksplisit dan openssh-server terpasang.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Mengatur postur XRDP saat xrdp terpasang. `relaxed` menjaga default MiniOS historis. `hardened` mengikat XRDP ke localhost, mengaktifkan pengaturan keamanan tinggi/negosiasi, dan menonaktifkan login root XRDP. `disabled` menonaktifkan dan menghentikan XRDP melalui `minios-svc` jika tersedia.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Mengatur postur kemudahan X11 MiniOS. `relaxed` menjaga kompatibilitas historis. `hardened` menghapus opsi X server `-ac` yang permisif dan memperketat `Xwrapper.config` jika ada.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Mengatur apakah `/etc/issue` akan menampilkan hint password root/live MiniOS default.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Mengatur apakah live-config melonggarkan penguncian layar. `relaxed` menjaga kemudahan sesi live. `hardened` menghindari menonaktifkan penguncian GNOME dan mengaktifkan penguncian xscreensaver jika file tersebut ada.
- **live-config.noautologin | noautologin**: Mencegah live-config mengatur autologin konsol dan grafis. Tidak menghapus autologin yang sudah dikonfigurasi pada sesi persisten.
- **live-config.nottyautologin | nottyautologin**: Mencegah live-config mengatur autologin konsol, tanpa memengaruhi pengaturan grafis. Konfigurasi persisten yang sudah ada tidak dihapus.
- **live-config.nox11autologin | nox11autologin**: Mencegah live-config mengatur autologin display-manager, tanpa memengaruhi pengaturan TTY. Konfigurasi persisten yang sudah ada tidak dihapus.

## Parameter Boot (opsi khusus)

Untuk kebutuhan khusus, tersedia beberapa parameter boot khusus.

- **live-config.debug | debug**: Mengaktifkan output debug pada live-config.

## File Konfigurasi

**live-config** dapat dikonfigurasi (namun tidak diaktifkan) melalui file konfigurasi. Setiap parameter boot yang didukung dapat ditempatkan di `LIVE_CONFIG_CMDLINE`, dan sebagian besar opsi juga dapat diatur melalui variabel individual. Parameter `boot=live` tetap diperlukan untuk mengaktifkan **live-config**.

**Catatan:** Jika menggunakan file konfigurasi, sebaiknya (lebih disarankan) semua parameter boot dimasukkan ke dalam variabel **LIVE_CONFIG_CMDLINE**, atau variabel individual dapat diatur. Jika menggunakan variabel individual, pengguna harus memastikan semua variabel yang diperlukan telah diatur agar konfigurasi valid.

`live-config` sendiri akan me-load `/etc/live/config.conf` lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Fragmen yang lebih akhir dapat menggantikan nilai dari file utama atau fragmen sebelumnya. Tidak akan me-load lapisan konfigurasi media kedua secara terpisah.

Pada media MiniOS, file sumbernya adalah `minios/config.conf` dan `minios/config.conf.d/*.conf`. Sebelum `live-config` berjalan, initramfs MiniOS akan menyinkronkan file-file ini dengan file runtime `/etc/live/` berdasarkan waktu modifikasi. File sumber yang lebih baru akan menggantikan file runtime; file runtime yang lebih baru hanya akan disalin kembali jika direktori data MiniOS yang dipilih dapat ditulis. Jika timestamp sama, tidak ada penyalinan, file yang hilang akan diisi, dan file tidak dihapus. Ini adalah sinkronisasi saat boot, bukan monitoring berkelanjutan. Lihat [File konfigurasi](/reference/configuration/config.conf) untuk aturan sinkronisasi lengkap dan prioritas command-line.

Sebagai fallback untuk implementasi initramfs yang tidak menyiapkan file runtime, wrapper startup systemd dan SysV akan menyalin `minios/config.conf` dari media yang terdeteksi hanya jika `/etc/live/config.conf` tidak ada. Fallback ini tidak menyalin fragmen `config.conf.d`. Initramfs LiveKit MiniOS standar saat ini melakukan sinkronisasi lebih awal.

File fragmen harus sesuai dengan `*.conf`. Nama seperti `vendor.conf` atau `project.conf` disarankan; pilih nama secara urut karena fragmen yang lebih akhir akan menimpa yang sebelumnya.

Isi file konfigurasi terdiri dari satu atau lebih variabel berikut.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Variabel ini sesuai dengan command line bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Variabel ini sesuai dengan parameter `**live-config.hostname**=*HOSTNAME*` . Default-nya adalah `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Memilih kebijakan jaringan kabel. `dhcp` dan nilai kosong tidak melakukan apa-apa dan tidak menghapus profil statik MiniOS yang sudah ada.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Memilih interface kabel untuk kebijakan `static` atau `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Mengatur alamat IPv4 statik.
- **LIVE_NETWORK_PREFIX=PREFIX**: Mengatur panjang prefix statik; default-nya `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Mengatur gateway statik opsional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Mengatur server DNS opsional yang dipisahkan koma.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Memilih backend yang diimplementasikan.

Komponen jaringan mencatat `/var/lib/live/config/network` setelah berhasil menulis kebijakan. Hapus stamp tersebut untuk menerapkan perubahan kebijakan pada sistem persisten. Untuk menghapus profil statik sebelumnya, gunakan `network-method=off` atau hapus profil dan stamp yang dikelola MiniOS secara manual.

- **LIVE_USERNAME=USERNAME**: Variabel ini sesuai dengan parameter `**live-config.username**=*USERNAME*` . Default-nya adalah `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Variabel ini sesuai dengan parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Variabel ini sesuai dengan parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password**=*PASSWORD*`. Ini menentukan password root dalam bentuk teks biasa.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password-crypted**=*PASSWORD*`. Ini menentukan password root dalam bentuk terenkripsi.
- **LIVE_USER_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password**=*PASSWORD*`. Ini menentukan password user dalam bentuk teks biasa.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password-crypted**=*PASSWORD*`. Ini menentukan password user dalam bentuk terenkripsi.
- **LIVE_CONFIG_NOROOT=true|false**: Variabel ini sesuai dengan parameter `**live-config.noroot**` dan menonaktifkan pengaturan root, sudo, dan PolicyKit jika diatur ke `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.sudo-mode**=...`. Jika tidak diatur, MiniOS akan tetap menggunakan perilaku sudo tanpa password historis.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.polkit-mode**=...`. `password` dan `disabled` menghapus aturan passwordless MiniOS dan mengembalikan autentikasi PolicyKit distribusi normal.
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
- **LIVE_LINK_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan link dari direktori data standar user ke drive MiniOS yang dapat ditulis. Parameter boot yang sesuai adalah flag `live-config.link-user-dirs` . Mode link tidak dapat digabungkan dengan mode bind atau mode `toram`.
- **LIVE_BIND_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan bind mount direktori data standar user dari drive MiniOS yang dapat ditulis. Parameter boot yang sesuai adalah flag `live-config.bind-user-dirs` . Mode bind tidak dapat digabungkan dengan mode link atau mode `toram`.
- **LIVE_USER_DIRS_PATH=PATH**: Variabel ini sesuai dengan parameter `**live-config.user-dirs-path**=*PATH*`. Ini menentukan path aman di dalam drive FAT32, exFAT, atau NTFS MiniOS. Default-nya adalah `/minios/userdata`; segmen dot dan parent-directory ditolak.

Setup user-media tidak pernah menggabungkan dua direktori non-kosong secara otomatis. Direktori lokal non-kosong hanya akan dipindahkan jika tujuan di media kosong. Ketika fitur dinonaktifkan, data media yang dikelola akan disalin kembali sebelum link dihapus. Aktivasi dan copy-back user-media diblokir jika sesi persistensi aktif dienkripsi LUKS, untuk mencegah data sesi dipindahkan ke media MiniOS yang tidak terenkripsi. Keputusan ini menggunakan status enkripsi aktif: `perchencrypt=luks` hanya meminta enkripsi saat membuat sesi baru dan tidak menggambarkan sesi yang sudah ada. Validasi atau penyalinan yang gagal akan membiarkan direktori user tetap dan alasannya dicatat di `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Variabel ini menyimpan status yang ditentukan oleh parameter `live-config.module-mode` (atau `module-mode`). Jika diatur ke `merged`, sistem live akan menerapkan pembaruan (melalui minios-update-users, minios-update-cache, dan minios-update-dpkg) untuk menggabungkan konfigurasi kustom dengan lingkungan dasar.
- **LIVE_CONFIG_DEBUG=true|false**: Variabel ini sesuai dengan parameter `**live-config.debug**`.

## Variabel cache dan log MiniOS

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, dan **LIVE_BROWSER_CACHE=persistent|volatile**: Kebijakan boot-time MiniOS yang independen. Juga berlaku pada `config.conf.d` dan `LIVE_CONFIG_CMDLINE`. Tidak mengaktifkan persistensi secara otomatis. Lihat [File konfigurasi](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Komponen `browser-cache` membaca kebijakan `minios-boot` yang tahan lama setelah user live dibuat dan melakukan bind-mount direktori cache browser native ke filesystem RAM terbatas bersama. Kebijakan Firefox yang dibuat terpisah akan menonaktifkan cache disk tanpa memindahkan profil browser. Jika komponen ini dikecualikan oleh `components=` atau `nocomponents=`, permintaan browser-cache awal saja tidak akan menyiapkan mount per user.

Helper merged-mode tetap mencatat error normal, tetapi hanya membuat trace perintah detail dan salinan debug jika `LIVE_CONFIG_DEBUG=true`.

# KUSTOMISASI

**live-config** dapat dengan mudah dikustomisasi untuk proyek turunan atau penggunaan lokal.

## Menambah komponen konfigurasi baru

Proyek turunan dapat meletakkan komponennya di /usr/lib/live/config dan tidak perlu melakukan apa pun lagi, komponen akan dijalankan otomatis saat boot.

Komponen sebaiknya dikemas dalam paket debian tersendiri. Contoh paket berisi contoh komponen dapat ditemukan di /usr/share/doc/live-config/examples.

## Menghapus komponen konfigurasi yang ada

Saat ini belum memungkinkan untuk menghapus komponen secara langsung dengan cara yang aman tanpa harus mengirimkan paket **live-config** yang telah dimodifikasi secara lokal atau menggunakan dpkg-divert. Namun, hal yang sama dapat dicapai dengan menonaktifkan komponen terkait melalui mekanisme live-config.nocomponents, lihat di atas. Untuk menghindari harus selalu menentukan komponen yang dinonaktifkan melalui parameter boot, sebaiknya gunakan file konfigurasi, lihat di atas.

File konfigurasi untuk sistem live sebaiknya juga dikemas dalam paket debian tersendiri. Contoh paket berisi contoh konfigurasi dapat ditemukan di /usr/share/doc/live-config/examples.

# KOMPONEN

**live-config** saat ini menyediakan komponen berikut di /usr/lib/live/config.

- **nss-systemd**: menghapus atau mengembalikan modul NSS systemd di /etc/nsswitch.conf untuk mengatasi masalah systemd yang diketahui.
- **debconf**: memungkinkan penerapan file preseed arbitrary yang ditempatkan di media live atau server http/ftp.
- **hostname**: mengonfigurasi /etc/hostname dan /etc/hosts.
- **issue-setup**: menyiapkan file /etc/issue dengan banner selamat datang dan informasi distribusi.
- **live-debconfig_passwd**: mengonfigurasi password user dan root melalui live-debconfig.
- **user-setup**: menambahkan akun user live.
- **user-groups**: menambahkan user live ke grup tambahan yang dideklarasikan oleh modul yang terpasang. Grup yang sudah ada pada `/usr/share/live/config/user-default-groups.d/*.groups` akan diterapkan setelah pembuatan user dan pada live-config berikutnya.
- **root-setup**: mengatur atau memperbarui password root dan mengonfigurasi environment user root.
- **sudo**: memberikan hak sudo ke user live.
- **user-ssh-keys**: menyinkronkan file `authorized_keys.<username>` spesifik user antara media live dan direktori home user. Mendukung banyak user sekaligus (misal `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) dan mengenali `toram`, `toram=trim`, dan `toram=full` sebagai bentuk RAM-boot saat menentukan apakah media live dapat diperbarui dengan aman.
- **user-media**: membuat link atau bind-mount direktori user yang tervalidasi pada media data MiniOS yang dapat ditulis, dengan migrasi dan copy-back yang aman saat dinonaktifkan.
- **locales**: mengonfigurasi locale.
- **tzdata**: mengonfigurasi /etc/timezone.
- **xorg-service**: mengonfigurasi username di xorg.service dan menerapkan postur X11 jika didukung.
- **gdm3**: mengonfigurasi autologin di gdm3.
- **sddm**: mengonfigurasi autologin di sddm.
- **kdm**: mengonfigurasi autologin di kdm.
- **lightdm**: mengonfigurasi autologin di lightdm.
- **lxdm**: mengonfigurasi autologin di lxdm.
- **nodm**: mengonfigurasi autologin di nodm.
- **slim**: mengonfigurasi autologin di slim.
- **xinit**: mengonfigurasi autologin dengan xinit.
- **keyboard-configuration**: mengonfigurasi keyboard.
- **sysvinit**: mengonfigurasi autologin konsol melalui `/etc/inittab` jika sysvinit terpasang. Shortcut `noautologin` dan `nottyautologin` akan menonaktifkan pengaturan tersebut.
- **sysv-rc**: mengonfigurasi sysv-rc dengan menonaktifkan layanan yang disebutkan.
- **apport**: menonaktifkan apport.
- **gnome-panel-data**: menonaktifkan tombol kunci layar.
- **gnome-power-manager**: menonaktifkan hibernasi.
- **gnome-screensaver**: mengontrol penguncian layar GNOME sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: menonaktifkan wizard migrasi KDE (squeeze dan lebih baru).
- **kde-services**: menonaktifkan beberapa layanan KDE yang tidak diinginkan (squeeze dan lebih baru).
- **policykit**: memberikan hak user melalui PolicyKit.
- **ssl-cert**: membuat ulang sertifikat SSL snake-oil.
- **xrdp**: mengonfigurasi postur XRDP relaxed, hardened, atau disabled saat XRDP terpasang.
- **anacron**: menonaktifkan anacron.
- **util-linux**: menonaktifkan layanan hwclock util-linux.
- **login**: menonaktifkan lastlog.
- **xserver-xorg**: mengonfigurasi xserver-xorg.
- **network**: mengonfigurasi kebijakan IPv4 kabel yang tahan lama melalui keyfile NetworkManager yang aman atau stanza ifupdown. Berjalan sebelum layanan jaringan, memvalidasi semua nilai, dan hanya membuat stamp setelah penulisan berhasil.
- **openssh-server**: membuat ulang kunci host OpenSSH dan menulis kebijakan root-login atau password-authentication jika diminta secara eksplisit.
- **xfce4-panel**: mengonfigurasi xfce4-panel ke pengaturan default.
- **xscreensaver**: mengontrol penguncian xscreensaver sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: mengonfigurasi driver WLAN broadcom-sta.
- **hyperv**: mengonfigurasi pengaturan X11 untuk meningkatkan kompatibilitas pada platform Microsoft Hyper-V.
- **ntfs3**: mengelola aturan udev untuk dukungan NTFS3.
- **config-module-mode**: mengonfigurasi mode modul sistem dan memperbarui cache, pengaturan user, dan dpkg.
- **hooks**: memungkinkan menjalankan perintah arbitrary dari file yang ditempatkan di media live atau server http/ftp.

# FILE

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
- `minios/log/YYYYMMDD_HHMMSS/` pada media data yang dipilih yang dapat ditulis saat ekspor log diaktifkan
- `/usr/lib/live/config-hooks/*` (`filesystem` hooks)
- `minios/config-hooks/*` pada media live yang terdeteksi (`medium` hooks)
- `/usr/lib/live/config-preseed/*` (`filesystem` preseeds)
- `minios/config-preseed/*` pada media live yang terdeteksi (`medium` preseeds)

# LIHAT JUGA

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# BERANDA

Informasi lebih lanjut tentang **minios-live-config** dapat ditemukan di [Repositori GitHub](https://github.com/minios-linux/minios-live-config). Informasi umum MiniOS tersedia di [minios.dev](https://minios.dev).

# BUG

Bug dapat dilaporkan melalui [pelacak isu minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# PENULIS

**live-config** awalnya ditulis oleh Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Sejak 2016, pengembangan dilanjutkan oleh tim Debian Live. Sejak 2025, pengembangan versi modifikasi **minios-live-config** dilanjutkan oleh tim Live MiniOS.
