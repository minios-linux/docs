---
updated: 2026-10-15
program_commits:
    minios-live-config: 2a798c533b2980a40e8457205cabfa24ccad2d10
---

# live-config

**live-config** - Komponen Konfigurasi Sistem

**live-config** berisi komponen yang mengonfigurasi sistem live selama proses boot (late userspace).

Kebijakan cache sesi persisten dan log ditentukan lebih awal oleh `minios-boot`, setelah root live dan konfigurasinya disiapkan, tetapi sebelum layanan biasa dimulai. Komponen `browser-cache` menerapkan mount per pengguna setelah pengguna dibuat. Kebijakan ini memerlukan aktivasi persistensi yang berhasil di penyimpanan permanen atau sebagai sesi yang dapat ditulisi dan disalin oleh RAM dengan informasi asal yang terlindungi, serta initrd yang mendukung `perch-storage-v1`. Sesi yang disalin oleh RAM tetap tidak permanen hingga disimpan; lihat [Performa](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Boot jaringan di initramfs (`ip=`, PXE, `from=http://…`) adalah lapisan LiveKit terpisah dan **tidak** dikelola oleh live-config. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

**live-config** dapat dikonfigurasi melalui parameter boot atau file konfigurasi runtime yang disiapkan oleh initramfs. Baris perintah kernel yang sebenarnya ditambahkan setelah nilai `LIVE_CONFIG_CMDLINE` yang berasal dari file, sehingga parameter boot yang cocok dan muncul belakangan akan diutamakan. Komponen yang mencatat status di `/var/lib/live/config` biasanya hanya dijalankan sekali; komponen sinkronisasi dan tanpa status dapat dijalankan setiap kali dipanggil.

Jika *live-build*(7) digunakan untuk membangun sistem live, parameter live-config yang digunakan secara default dapat diatur melalui opsi `--bootappend-live`, lihat halaman manual *lb_config*(1).

## Parameter Boot (komponen)

**live-config** hanya diaktifkan jika `boot=live` digunakan sebagai parameter boot. Secara default, semua komponen dijalankan. Parameter `live-config.components` dapat membatasi komponen yang dijalankan, sedangkan `live-config.nocomponents` dapat mengecualikan komponen. Jika kedua parameter digunakan, atau salah satunya ditentukan beberapa kali, kemunculan terakhir yang berlaku.

- **live-config.components | components**: Semua komponen dijalankan. Inilah pengaturan default untuk live image.
- **live-config.components=COMPONENT1,COMPONENT2,...COMPONENTn | components=COMPONENT1,COMPONENT2,...COMPONENTn**: Hanya komponen yang ditentukan yang dijalankan. Komponen dieksekusi sesuai urutan yang tercantum dalam nama filenya di `/usr/lib/live/config`, terlepas dari urutannya dalam daftar ini.
- **live-config.nocomponents | nocomponents**: Tidak ada komponen yang dijalankan.
- **live-config.nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn | nocomponents=COMPONENT1,COMPONENT2,...COMPONENTn**: Semua komponen dijalankan, kecuali yang ditentukan.

## Parameter Boot (opsi)

Beberapa komponen tertentu dapat mengubah perilakunya berdasarkan parameter boot.

- **live-config.debconf-preseed=filesystem|medium|URL1|URL2|...|URLn | debconf-preseed=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menerapkan satu atau beberapa file preseed debconf. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`. Kata kunci `filesystem` memperluas file di `/usr/lib/live/config-preseed/`; `medium` memperluas file di `minios/config-preseed/` pada media live yang terdeteksi. File lokal yang ditentukan secara eksplisit dapat menggunakan jalur seperti `file:///run/initramfs/memory/data/minios/config-preseed/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan tanda pipa diproses sesuai urutan yang ditentukan; file yang diperluas oleh kata kunci mengikuti urutan glob shell.
- **live-config.hostname=HOSTNAME | hostname=HOSTNAME**: Menetapkan nama host sistem. Nilai defaultnya adalah `minios`.
- **live-config.network-method=dhcp|static|off | network-method=dhcp|static|off**: Memilih kebijakan jaringan berkabel. Jika tidak disetel atau menggunakan `dhcp` , pengaturan default image tidak berubah. `static` menulis konfigurasi untuk backend yang dipilih; `off` menonaktifkan konfigurasi IPv4 otomatis untuk antarmuka yang dipilih.
- **live-config.network-interface=INTERFACE | network-interface=INTERFACE**: Memilih antarmuka berkabel. Jika tidak ditentukan untuk `static` atau `off`, satu-satunya antarmuka berkabel non-loopback akan dipilih secara otomatis; jika tidak ada atau ada beberapa kandidat, nilai harus ditentukan secara eksplisit.
- **live-config.network-address=IPV4 | network-address=IPV4**: Menetapkan alamat IPv4 statis.
- **live-config.network-prefix=PREFIX | network-prefix=PREFIX**: Menetapkan panjang prefiks IPv4 dari 0 hingga 32. Nilai default statisnya adalah `24`.
- **live-config.network-gateway=IPV4 | network-gateway=IPV4**: Menetapkan gateway IPv4 opsional.
- **live-config.network-dns=ADDRESS1,ADDRESS2 | network-dns=ADDRESS1,ADDRESS2**: Menetapkan alamat server DNS opsional yang dipisahkan koma.
- **live-config.network-backend=auto|nm|ifupdown | network-backend=auto|nm|ifupdown**: Memilih backend jaringan. `auto` mengutamakan NetworkManager dan beralih ke ifupdown jika tidak tersedia. `ifupdown` memaksa antarmuka tidak dikelola oleh NetworkManager jika kedua stack terpasang.
- **live-config.username=USERNAME | username=USERNAME**: Menetapkan nama pengguna yang dibuat untuk login otomatis. Nilai defaultnya adalah `live`.
- **live-config.user-default-groups=GROUP1,GROUP2,...GROUPn | user-default-groups=GROUP1,GROUP2,...GROUPn**: Menetapkan grup tambahan untuk pengguna yang dibuat untuk login otomatis. Nama grup dapat dipisahkan dengan koma atau spasi. Nilai default MiniOS adalah `dialout cdrom floppy audio video plugdev users fuse plugdev netdev powerdev scanner bluetooth weston-launch kvm libvirt libvirt-qemu vboxusers lpadmin dip sambashare docker wireshark`.
- **live-config.user-fullname="USER FULLNAME" | user-fullname="USER FULLNAME"**: Menetapkan nama lengkap pengguna yang dibuat untuk login otomatis. Nilai default MiniOS adalah `MiniOS Live User`.
- **live-config.root-password=PASSWORD | root-password=PASSWORD**: Menetapkan kata sandi root dalam teks biasa.
- **live-config.root-password-crypted=PASSWORD | root-password-crypted=PASSWORD**: Menetapkan kata sandi root dalam bentuk terenkripsi.
- **live-config.user-password=PASSWORD | user-password=PASSWORD**: Menetapkan kata sandi pengguna dalam teks biasa.
- **live-config.user-password-crypted=PASSWORD | user-password-crypted=PASSWORD**: Menetapkan kata sandi pengguna dalam bentuk terenkripsi.
- **live-config.locales=LOCALE1,LOCALE2,...LOCALEn | locales=LOCALE1,LOCALE2,...LOCALEn**: Menetapkan lokal sistem, misalnya `de_CH.UTF-8`. Nilai defaultnya adalah `en_US.UTF-8`. Jika lokal yang dipilih belum tersedia di sistem, lokal tersebut akan dibuat secara otomatis saat diperlukan.
- **live-config.timezone=TIMEZONE | timezone=TIMEZONE**: Menetapkan zona waktu sistem, misalnya `Europe/Zurich`. Nilai defaultnya adalah `UTC`.
- **live-config.keyboard-model=KEYBOARD_MODEL | keyboard-model=KEYBOARD_MODEL**: Mengubah model keyboard. Tidak ada nilai default yang ditetapkan.
- **live-config.keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn | keyboard-layouts=KEYBOARD_LAYOUT1,KEYBOARD_LAYOUT2,...KEYBOARD_LAYOUTn**: Mengubah tata letak keyboard. Jika ditentukan lebih dari satu, alat lingkungan desktop memungkinkan Anda beralih di antaranya di X11. Tidak ada nilai default yang ditetapkan.
- **live-config.keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn | keyboard-variants=KEYBOARD_VARIANT1,KEYBOARD_VARIANT2,...KEYBOARD_VARIANTn**: Mengubah varian keyboard. Jika ditentukan lebih dari satu, jumlah nilainya harus sama dengan jumlah nilai tata letak keyboard karena keduanya akan dipasangkan satu per satu sesuai urutan yang ditentukan. Nilai kosong diperbolehkan. Alat lingkungan desktop memungkinkan Anda beralih di antara setiap pasangan tata letak dan varian di X11. Tidak ada nilai default yang ditetapkan.
- **live-config.keyboard-options=KEYBOARD_OPTIONS | keyboard-options=KEYBOARD_OPTIONS**: Mengubah opsi keyboard. Tidak ada nilai default yang ditetapkan.
- **live-config.sysv-rc=SERVICE1,SERVICE2,...SERVICEn | sysv-rc=SERVICE1,SERVICE2,...SERVICEn**: Menonaktifkan layanan sysv melalui update-rc.d.
- **live-config.utc=yes|no | utc=yes|no**: Mengubah pengaturan apakah sistem menganggap jam perangkat keras menggunakan UTC atau tidak. Nilai defaultnya adalah `yes`.
- **live-config.xorg-xsession-manager=X_SESSION_MANAGER | x-session-manager=X_SESSION_MANAGER**: Menetapkan x-session-manager melalui update-alternatives.
- **live-config.xorg-driver=XORG_DRIVER | xorg-driver=XORG_DRIVER**: Menetapkan driver xorg alih-alih mendeteksinya secara otomatis. Jika ID PCI ditentukan di `/usr/share/live/config/xserver-xorg/*DRIVER*.ids` dalam sistem live, *DRIVER* akan diwajibkan untuk perangkat tersebut. Jika parameter boot dan penggantian sama-sama ditemukan, parameter boot yang diutamakan.
- **live-config.xorg-resolution=XORG_RESOLUTION | xorg-resolution=XORG_RESOLUTION**: Menetapkan resolusi xorg alih-alih mendeteksinya secara otomatis, misalnya 1024x768.
- **live-config.wlan-driver=WLAN_DRIVER | wlan-driver=WLAN_DRIVER**: Menetapkan driver WLAN alih-alih mendeteksinya secara otomatis. Jika ID PCI ditentukan di `/usr/share/live/config/broadcom-sta/*DRIVER*.ids` dalam sistem live, *DRIVER* akan diwajibkan untuk perangkat tersebut. Jika parameter boot dan penggantian sama-sama ditemukan, parameter boot yang diutamakan.
- **live-config.module-mode=simple|merged | module-mode=simple|merged**: Menentukan mode modul untuk konfigurasi live. Jika disetel ke `merged`, sistem akan memperbarui akun pengguna, membangun ulang cache, dan menyegarkan pengaturan paket agar perubahan konfigurasi diterapkan secara dinamis ke sistem yang sedang berjalan.
- **live-config.link-user-dirs | link-user-dirs**: Menautkan direktori pengguna yang dikelola ke jalur yang dikonfigurasi pada media data MiniOS. Opsi ini tidak dapat digunakan bersama mode bind dan tidak tersedia dengan mode `toram` apa pun atau saat sesi persistensi aktif dienkripsi dengan LUKS.
- **live-config.bind-user-dirs | bind-user-dirs**: Memasang direktori pengguna yang dikelola dengan bind mount dari jalur yang dikonfigurasi pada media data MiniOS. Opsi ini tidak dapat digunakan bersama mode link dan memiliki batasan `toram` serta batasan enkripsi sesi aktif yang sama.
- **live-config.user-dirs-path=PATH | user-dirs-path=PATH**: Menetapkan jalur relatif terhadap media yang digunakan oleh `link-user-dirs` atau `bind-user-dirs`. Nilai defaultnya adalah `/minios/userdata`.
- **live-config.hooks=filesystem|medium|URL1|URL2|...|URLn | hooks=medium|filesystem|URL1|URL2|...|URLn**: Mengambil dan menjalankan file arbitrer dari file sementara di sistem live yang sedang berjalan. URL ditangani oleh `wget` dan dapat menggunakan HTTP, FTP, atau `file://`; interpreter dan dependensi lain yang diperlukan harus sudah terpasang. Kata kunci `filesystem` memperluas file di `/usr/lib/live/config-hooks/`; `medium` memperluas file di `minios/config-hooks/` pada media live yang terdeteksi (dengan fallback jalur ISO di komponen hook). File lokal yang ditentukan secara eksplisit dapat menggunakan `file:///run/initramfs/memory/data/minios/config-hooks/FILE` atau `file:///PATH` di root live. Entri yang dipisahkan tanda pipa dijalankan sesuai urutan yang ditentukan; file yang diperluas oleh kata kunci mengikuti urutan glob shell. Contoh tersedia di `/usr/share/doc/live-config/examples/hooks/`.

> **Peringatan keamanan:** `live-config` dijalankan sebagai root. Hook dibuat agar dapat dieksekusi dan dijalankan sebagai root, sedangkan preseed mengubah database debconf sistem dengan hak akses root. HTTP dan FTP biasa tidak mengautentikasi konten yang diunduh dan tidak menyediakan perlindungan integritas. Utamakan file lokal yang telah ditinjau atau transportasi terautentikasi tepercaya dengan verifikasi integritas independen; jangan gunakan hook atau preseed jarak jauh dari jaringan yang tidak tepercaya.

### Opsi penyimpanan MiniOS awal

Opsi ini dibaca oleh `minios-boot` sebelum layanan biasa dimulai. Opsi ini memerlukan aktivasi persistensi yang berhasil pada penyimpanan permanen atau sesi RAM yang dapat ditulis dengan informasi `ram-origin`. Opsi ini tidak mengaktifkan persistensi secara mandiri dan tidak dapat membuat perubahan RAM menjadi permanen tanpa menyimpannya.

- **live-config.log-storage=persistent|volatile | log-storage=persistent|volatile**: `volatile` menempatkan journal systemd dan file `/var/log` biasa di RAM yang dibatasi; diagnostik boot tetap disimpan di penyimpanan permanen. Default: `persistent`.
- **live-config.apt-cache=persistent|volatile | apt-cache=persistent|volatile**: `volatile` menempatkan arsip APT yang diunduh di tmpfs terbatas jika kondisi RAM dan swap memungkinkan. Database paket dan daftar repositori tetap persisten. Default: `persistent`.
- **live-config.browser-cache=persistent|volatile | browser-cache=persistent|volatile**: `volatile` meminta cache browser native di RAM. Komponen `browser-cache` memasang direktori cache pilihan pengguna live setelah akun tersedia. Default: `persistent`.

## Parameter Boot (singkatan)

Untuk beberapa kebutuhan umum yang memerlukan penggabungan beberapa parameter terpisah, **live-config** menyediakan singkatan. Dengan begitu, Anda tetap dapat mengatur setiap opsi secara terperinci sekaligus menjaga konfigurasi tetap sederhana.

- **live-config.noroot | noroot**: Menonaktifkan penyiapan kata sandi root serta pemberian hak istimewa MiniOS sudo dan PolicyKit.
- **live-config.sudo-mode=passwordless|password|disabled | sudo-mode=passwordless|password|disabled**: Mengontrol konfigurasi sudo untuk pengguna live. Nilai default dan perilaku MiniOS sebelumnya jika tidak ditentukan adalah `passwordless`. Mode `password` mempertahankan akses sudo, tetapi mengharuskan pengguna live memasukkan kata sandinya. Mode `disabled` menghapus pemberian hak MiniOS sudo dan memastikan pengguna live tidak dimasukkan ke grup sudo saat dibuat. Singkatan lama `noroot` menimpa pengaturan ini dan menonaktifkan penyiapan hak istimewa root secara lebih menyeluruh.
- **live-config.polkit-mode=passwordless|password|disabled | polkit-mode=passwordless|password|disabled**: Mengontrol aturan kemudahan MiniOS PolicyKit. Nilai default dan perilaku MiniOS sebelumnya jika tidak ditentukan adalah `passwordless`. Mode `password` dan `disabled` menghapus aturan tersebut sehingga autentikasi PolicyKit standar distribusi berlaku. `disabled` bukan kebijakan yang sepenuhnya menolak akses; gunakan `noroot` jika pengguna live tidak boleh memperoleh hak istimewa administratif.
- **live-config.ssh-permit-root-login=true|false | ssh-permit-root-login=true|false**: Menulis kebijakan OpenSSH `PermitRootLogin` jika ditetapkan secara eksplisit dan openssh-server terinstal.
- **live-config.ssh-password-authentication=true|false | ssh-password-authentication=true|false**: Menulis kebijakan OpenSSH `PasswordAuthentication` jika ditetapkan secara eksplisit dan openssh-server terinstal.
- **live-config.xrdp-mode=relaxed|hardened|disabled | xrdp-mode=relaxed|hardened|disabled**: Mengontrol konfigurasi keamanan XRDP jika xrdp terinstal. `relaxed` mempertahankan pengaturan default MiniOS sebelumnya. `hardened` mengikat XRDP ke localhost, memulihkan pengaturan keamanan negotiated/high, dan menonaktifkan login root XRDP. `disabled` menonaktifkan dan menghentikan XRDP melalui `minios-svc` jika tersedia.
- **live-config.x11-mode=relaxed|hardened | x11-mode=relaxed|hardened**: Mengontrol konfigurasi kemudahan MiniOS X11. `relaxed` mempertahankan kompatibilitas sebelumnya. `hardened` menghapus opsi server X `-ac` yang permisif dan memperketat `Xwrapper.config` jika tersedia.
- **live-config.issue-password-hints=true|false | issue-password-hints=true|false**: Mengontrol apakah `/etc/issue` menampilkan petunjuk kata sandi root/live default MiniOS.
- **live-config.lockscreen-mode=relaxed|hardened | lockscreen-mode=relaxed|hardened**: Mengontrol apakah live-config melonggarkan penguncian layar. `relaxed` mempertahankan kemudahan sesi live sebelumnya. `hardened` mencegah penonaktifan penguncian GNOME dan mengaktifkan penguncian xscreensaver jika berkas tersebut tersedia.
- **live-config.noautologin | noautologin**: Mencegah live-config menyiapkan autologin konsol dan grafis. Fitur ini tidak menghapus autologin yang sudah dikonfigurasi dalam sesi persisten.
- **live-config.nottyautologin | nottyautologin**: Mencegah live-config menyiapkan autologin konsol tanpa memengaruhi konfigurasi grafis. Konfigurasi persisten yang sudah ada tidak dihapus.
- **live-config.nox11autologin | nox11autologin**: Mencegah live-config menyiapkan autologin pengelola tampilan tanpa memengaruhi konfigurasi TTY. Konfigurasi persisten yang sudah ada tidak dihapus.

## Parameter Boot (opsi khusus)

Untuk kasus penggunaan khusus, tersedia beberapa parameter boot khusus.

- **live-config.debug | debug**: Mengaktifkan output debug di live-config.

## File Konfigurasi

**live-config** dapat dikonfigurasi (tetapi tidak diaktifkan) melalui file konfigurasi. Parameter boot yang didukung dapat ditempatkan di `LIVE_CONFIG_CMDLINE`, dan sebagian besar opsi juga dapat diatur melalui variabel terpisah. Parameter `boot=live` tetap diperlukan untuk mengaktifkan **live-config**.

**Catatan:** Jika menggunakan file konfigurasi, sebaiknya semua parameter boot dimasukkan ke variabel **LIVE_CONFIG_CMDLINE**, atau variabel-variabel terpisah dapat diatur. Jika menggunakan variabel terpisah, pengguna harus memastikan semua variabel yang diperlukan telah diatur agar konfigurasi valid.

`live-config` sendiri memuat `/etc/live/config.conf` lalu `/etc/live/config.conf.d/*.conf` sesuai urutan glob shell. Karena itu, fragmen yang dimuat belakangan dapat mengganti nilai dari file utama atau fragmen sebelumnya. File ini tidak memuat lapisan konfigurasi media kedua secara terpisah.

Pada media MiniOS, file sumbernya adalah `minios/config.conf` dan `minios/config.conf.d/*.conf`. Sebelum `live-config` dimulai, initramfs MiniOS menyinkronkan file-file ini dengan file runtime `/etc/live/` berdasarkan waktu modifikasi. File sumber yang lebih baru menggantikan file runtime yang terkait; file runtime yang lebih baru disalin kembali hanya jika direktori data MiniOS yang dipilih dapat ditulisi. Jika stempel waktunya sama, tidak ada file yang disalin; file yang hilang akan disalin, dan file tidak dihapus. Sinkronisasi ini dilakukan saat boot, bukan pemantauan berkelanjutan. Lihat [File konfigurasi](/reference/configuration/config.conf) untuk mengetahui aturan lengkap sinkronisasi dan prioritas baris perintah.

Sebagai langkah cadangan untuk implementasi initramfs yang tidak menyiapkan file runtime, wrapper startup systemd dan SysV menyalin `minios/config.conf` dari media yang terdeteksi hanya jika `/etc/live/config.conf` tidak ada. Langkah cadangan ini tidak menyalin fragmen `config.conf.d`. Initramfs LiveKit MiniOS standar saat ini melakukan sinkronisasi sebelumnya.

Nama file fragmen harus cocok dengan `*.conf`. Nama seperti `vendor.conf` atau `project.conf` disarankan; pilih nama leksikal dengan cermat karena fragmen yang dimuat belakangan akan menggantikan fragmen sebelumnya.

Isi file konfigurasi terdiri dari satu atau beberapa variabel berikut.

- **LIVE_CONFIG_CMDLINE=PARAMETER1 PARAMETER2...PARAMETERn**: Variabel ini sesuai dengan baris perintah bootloader.
- **LIVE_CONFIG_COMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.components**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_CONFIG_NOCOMPONENTS=COMPONENT1,COMPONENT2,...COMPONENTn**: Variabel ini sesuai dengan parameter `**live-config.nocomponents**=*COMPONENT1*,*COMPONENT2*,...*COMPONENTn*`.
- **LIVE_DEBCONF_PRESEED=filesystem|medium|URL1|URL2|...|URLn**: Variabel ini sesuai dengan parameter `**live-config.debconf-preseed**=filesystem|medium|*URL1*\|*URL2*\|...|*URLn*`.
- **LIVE_HOSTNAME=HOSTNAME**: Variabel ini sesuai dengan parameter `**live-config.hostname**=*HOSTNAME*`. Nilai default-nya adalah `minios`.
- **LIVE_NETWORK_METHOD=dhcp|static|off**: Memilih kebijakan jaringan kabel. `dhcp` dan nilai yang tidak ditetapkan tidak melakukan apa pun serta tidak menghapus profil statis MiniOS yang sudah dibuat.
- **LIVE_NETWORK_INTERFACE=INTERFACE**: Memilih antarmuka kabel untuk kebijakan `static` atau `off`.
- **LIVE_NETWORK_ADDRESS=IPV4**: Mengatur alamat IPv4 statis.
- **LIVE_NETWORK_PREFIX=PREFIX**: Mengatur panjang prefiks statis; nilai default-nya `24`.
- **LIVE_NETWORK_GATEWAY=IPV4**: Mengatur gateway statis opsional.
- **LIVE_NETWORK_DNS=ADDRESS1,ADDRESS2**: Mengatur server DNS opsional yang dipisahkan koma.
- **LIVE_NETWORK_BACKEND=auto|nm|ifupdown**: Memilih backend yang diterapkan.

Komponen jaringan mencatat `/var/lib/live/config/network` setelah berhasil menulis kebijakan. Hapus penanda tersebut untuk menerapkan kebijakan yang diubah pada sistem persisten. Untuk menghapus profil statis sebelumnya, gunakan `network-method=off` atau hapus profil yang dikelola oleh MiniOS beserta penandanya secara manual.

- **LIVE_USERNAME=USERNAME**: Variabel ini sesuai dengan parameter `**live-config.username**=*USERNAME*`. Nilai default-nya adalah `live`.
- **LIVE_USER_DEFAULT_GROUPS=GROUP1,GROUP2,...GROUPn**: Variabel ini sesuai dengan parameter `**live-config.user-default-groups**="*GROUP1*,*GROUP2*...*GROUPn*"`.
- **LIVE_USER_FULLNAME="USER FULLNAME"**: Variabel ini sesuai dengan parameter `**live-config.user-fullname**="*USER FULLNAME*"`.
- **LIVE_ROOT_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password**=*PASSWORD*`. Variabel ini menetapkan kata sandi root dalam teks biasa.
- **LIVE_ROOT_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.root-password-crypted**=*PASSWORD*`. Variabel ini menetapkan kata sandi root dalam bentuk terenkripsi.
- **LIVE_USER_PASSWORD=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password**=*PASSWORD*`. Variabel ini menetapkan kata sandi pengguna dalam teks biasa.
- **LIVE_USER_PASSWORD_CRYPTED=PASSWORD**: Variabel ini sesuai dengan parameter `**live-config.user-password-crypted**=*PASSWORD*`. Variabel ini menetapkan kata sandi pengguna dalam bentuk terenkripsi.
- **LIVE_CONFIG_NOROOT=true|false**: Variabel ini sesuai dengan parameter `**live-config.noroot**` dan menonaktifkan penyiapan hak istimewa root, sudo, dan PolicyKit jika nilainya `true`.
- **LIVE_SUDO_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.sudo-mode**=...`. Jika tidak ditetapkan, MiniOS mempertahankan perilaku sudo tanpa kata sandi yang digunakan sebelumnya.
- **LIVE_POLKIT_MODE=passwordless|password|disabled**: Variabel ini sesuai dengan parameter `**live-config.polkit-mode**=...`. `password` dan `disabled` menghapus aturan tanpa kata sandi MiniOS dan memulihkan autentikasi PolicyKit normal distribusi.
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
- **LIVE_LINK_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan tautan dari direktori data standar pengguna ke drive MiniOS yang dapat ditulisi. Parameter boot terkait adalah flag `live-config.link-user-dirs` tanpa nilai. Mode tautan tidak dapat digabungkan dengan mode bind atau mode `toram` apa pun.
- **LIVE_BIND_USER_DIRS=true|false**: Mengaktifkan atau menonaktifkan bind mount direktori data standar pengguna dari drive MiniOS yang dapat ditulisi. Parameter boot terkait adalah flag `live-config.bind-user-dirs` tanpa nilai. Mode bind tidak dapat digabungkan dengan mode tautan atau mode `toram` apa pun.
- **LIVE_USER_DIRS_PATH=PATH**: Variabel ini sesuai dengan parameter `**live-config.user-dirs-path**=*PATH*`. Variabel ini menentukan jalur aman di dalam drive MiniOS FAT32, exFAT, atau NTFS. Nilai default-nya adalah `/minios/userdata`; segmen titik dan direktori induk ditolak.

Penyiapan media pengguna tidak pernah menggabungkan dua direktori yang sama-sama tidak kosong secara otomatis. Direktori lokal yang tidak kosong hanya dimigrasikan jika lokasi tujuannya di media kosong. Jika fitur dinonaktifkan, data media yang dikelola akan disalin kembali sebelum tautan dihapus. Aktivasi media pengguna dan penyalinan kembali diblokir saat sesi persistensi aktif dienkripsi dengan LUKS, sehingga data sesi tidak dipindahkan ke media MiniOS yang tidak terenkripsi. Keputusan ini didasarkan pada status enkripsi aktual: `perchencrypt=luks` hanya meminta enkripsi saat membuat sesi baru dan tidak menunjukkan status sesi yang sudah ada. Jika validasi atau penyalinan gagal, direktori pengguna yang ada tetap dipertahankan dan alasannya dicatat di `/var/lib/live/config/user-media.status`.
- **LIVE_MODULE_MODE=simple|merged**: Variabel ini menyimpan status yang ditentukan oleh parameter `live-config.module-mode` (atau `module-mode`). Jika nilainya `merged`, sistem live menerapkan pembaruan (melalui minios-update-users, minios-update-cache, dan minios-update-dpkg) untuk menggabungkan konfigurasi kustom dengan lingkungan dasar.
- **LIVE_CONFIG_DEBUG=true|false**: Variabel ini sesuai dengan parameter `**live-config.debug**`.

## MiniOS variabel cache dan log

- **LIVE_LOG_STORAGE=persistent|volatile**, **LIVE_APT_CACHE=persistent|volatile**, dan **LIVE_BROWSER_CACHE=persistent|volatile**: Kebijakan independen saat boot untuk MiniOS. Kebijakan ini juga berfungsi di `config.conf.d` dan `LIVE_CONFIG_CMDLINE`. Kebijakan ini tidak dengan sendirinya mengaktifkan persistensi. Lihat [File konfigurasi](/reference/configuration/config.conf#cache-and-log-policy-for-a-persistent-session).

Komponen `browser-cache` membaca kebijakan `minios-boot` yang telah divalidasi setelah pengguna live tersedia, lalu memasang direktori cache browser native standar menggunakan bind mount ke sistem berkas RAM bersama yang dibatasi, dengan mempertimbangkan pemeriksaan memori/swap. Kebijakan Firefox yang dibuat secara terpisah menonaktifkan cache disk tanpa memindahkan profil browser. Jika komponen ini dikecualikan oleh `components=` atau `nocomponents=`, permintaan cache browser awal saja tidak menyiapkan mount per pengguna.

Helper mode gabungan tetap menampilkan error normal, tetapi hanya membuat rekaman perintah terperinci dan salinan debug jika `LIVE_CONFIG_DEBUG=true`.

# KUSTOMISASI

**live-config** dapat dengan mudah disesuaikan untuk proyek turunan atau penggunaan lokal.

## Menambahkan komponen konfigurasi baru

Proyek turunan dapat menempatkan komponennya di /usr/lib/live/config tanpa perlu melakukan hal lain. Komponen tersebut akan dipanggil secara otomatis saat boot.

Sebaiknya komponen ditempatkan dalam paket Debian tersendiri. Contoh paket yang berisi komponen dapat ditemukan di /usr/share/doc/live-config/examples.

## Menghapus komponen konfigurasi yang ada

Saat ini, komponen itu sendiri belum dapat dihapus dengan cara yang aman tanpa harus mengirimkan **live-config** yang dimodifikasi secara lokal atau menggunakan dpkg-divert. Namun, hasil yang sama dapat dicapai dengan menonaktifkan komponen terkait melalui mekanisme live-config.nocomponents. Lihat bagian di atas. Agar tidak perlu selalu mencantumkan komponen yang dinonaktifkan melalui parameter boot, sebaiknya gunakan file konfigurasi. Lihat bagian di atas.

File konfigurasi untuk sistem live sebaiknya disimpan dalam paket Debian tersendiri. Contoh paket yang berisi contoh konfigurasi tersedia di /usr/share/doc/live-config/examples.

# KOMPONEN

**live-config** saat ini menyediakan komponen berikut di /usr/lib/live/config.

- **nss-systemd**: menghapus atau memulihkan modul NSS systemd di /etc/nsswitch.conf untuk mengatasi masalah systemd yang telah diketahui.
- **debconf**: memungkinkan penerapan file preseed sebarang yang ditempatkan di media live atau server HTTP/FTP.
- **hostname**: mengonfigurasi /etc/hostname dan /etc/hosts.
- **issue-setup**: menyiapkan file /etc/issue dengan banner sambutan dan informasi distribusi.
- **live-debconfig_passwd**: mengonfigurasi kata sandi pengguna dan root melalui live-debconfig.
- **user-setup**: menambahkan akun pengguna live.
- **user-groups**: menambahkan pengguna live ke grup tambahan yang dinyatakan oleh modul terpasang. Grup yang sudah ada dan tercantum di `/usr/share/live/config/user-default-groups.d/*.groups` diterapkan setelah pengguna dibuat dan pada proses live-config berikutnya.
- **root-setup**: menetapkan atau memperbarui kata sandi root serta mengonfigurasi lingkungan pengguna root.
- **sudo**: memberikan hak sudo kepada pengguna live.
- **user-ssh-keys**: menyinkronkan file `authorized_keys.<username>` khusus pengguna antara media live dan direktori home masing-masing pengguna. Mendukung beberapa pengguna sekaligus (misalnya, `authorized_keys.root`, `authorized_keys.live`, `authorized_keys.admin`) serta mengenali `toram`, `toram=trim`, dan `toram=full` sebagai bentuk RAM-boot saat menentukan apakah media live dapat diperbarui dengan aman.
- **user-media**: menautkan atau memasang dengan bind-mount direktori pengguna yang telah divalidasi pada media data MiniOS yang sudah dapat ditulis, dengan migrasi aman dan penyalinan kembali saat fitur dinonaktifkan.
- **locales**: mengonfigurasi lokal.
- **tzdata**: mengonfigurasi /etc/timezone.
- **xorg-service**: mengonfigurasi nama pengguna di xorg.service dan menerapkan posture X11 jika didukung.
- **gdm3**: mengonfigurasi login otomatis di gdm3.
- **sddm**: mengonfigurasi login otomatis di sddm.
- **kdm**: mengonfigurasi login otomatis di kdm.
- **lightdm**: mengonfigurasi login otomatis di lightdm.
- **lxdm**: mengonfigurasi login otomatis di lxdm.
- **nodm**: mengonfigurasi login otomatis di nodm.
- **slim**: mengonfigurasi login otomatis di slim.
- **xinit**: mengonfigurasi login otomatis dengan xinit.
- **keyboard-configuration**: mengonfigurasi keyboard.
- **sysvinit**: mengonfigurasi login otomatis konsol melalui `/etc/inittab` saat sysvinit terpasang. Pintasan `noautologin` dan `nottyautologin` menonaktifkan penyiapan tersebut.
- **sysv-rc**: mengonfigurasi sysv-rc dengan menonaktifkan layanan yang tercantum.
- **apport**: menonaktifkan apport.
- **gnome-panel-data**: menonaktifkan tombol kunci layar.
- **gnome-power-manager**: menonaktifkan hibernasi.
- **gnome-screensaver**: mengontrol penguncian layar GNOME sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **kaboom**: menonaktifkan wizard migrasi KDE (squeeze dan versi lebih baru).
- **kde-services**: menonaktifkan beberapa layanan KDE yang tidak diinginkan (squeeze dan versi lebih baru).
- **policykit**: memberikan hak istimewa kepada pengguna melalui PolicyKit.
- **ssl-cert**: membuat ulang sertifikat SSL snake-oil.
- **xrdp**: mengonfigurasi posture XRDP ke mode longgar, diperketat, atau dinonaktifkan saat XRDP terpasang.
- **anacron**: menonaktifkan anacron.
- **util-linux**: menonaktifkan layanan hwclock util-linux.
- **login**: menonaktifkan lastlog.
- **xserver-xorg**: mengonfigurasi xserver-xorg.
- **network**: mengonfigurasi kebijakan IPv4 kabel permanen melalui file key NetworkManager yang aman atau stanza ifupdown. Proses ini berjalan sebelum layanan jaringan, memvalidasi semua nilai, dan mencatat status hanya setelah penulisan berhasil.
- **openssh-server**: membuat ulang kunci host OpenSSH dan menulis kebijakan login root atau autentikasi kata sandi yang diminta secara eksplisit.
- **xfce4-panel**: mengatur xfce4-panel ke setelan default.
- **xscreensaver**: mengontrol penguncian xscreensaver sesuai dengan `LIVE_LOCKSCREEN_MODE`.
- **broadcom-sta**: mengonfigurasi driver WLAN broadcom-sta.
- **hyperv**: mengonfigurasi setelan X11 untuk meningkatkan kompatibilitas di platform Microsoft Hyper-V.
- **ntfs3**: mengelola aturan udev untuk dukungan NTFS3.
- **config-module-mode**: mengonfigurasi mode modul sistem dan memperbarui cache, setelan pengguna, serta dpkg.
- **browser-cache**: menerapkan kebijakan cache browser yang telah divalidasi setelah pengguna dibuat, dengan mempertimbangkan memori dan swap yang tersedia, jalur cache yang aman, serta file kebijakan Firefox yang sudah ada.
- **hooks**: memungkinkan eksekusi perintah sebarang dari file yang ditempatkan di media live atau server HTTP/FTP.

# FILE

- `minios/config.conf` di media data yang dipilih (MiniOS, salinan sumber)
- `minios/config.conf.d/*.conf` di media data yang dipilih (MiniOS, fragmen sumber)
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
- `minios/log/YYYYMMDD_HHMMSS/` di media data terpilih yang dapat ditulis saat ekspor log diaktifkan
- `/usr/lib/live/config-hooks/*` (`filesystem` hook)
- `minios/config-hooks/*` di media aktif yang terdeteksi (`medium` hook)
- `/usr/lib/live/config-preseed/*` (`filesystem` praseed)
- `minios/config-preseed/*` di media aktif yang terdeteksi (`medium` praseed)

# LIHAT JUGA

- *live-boot*(7)
- *live-build*(7)
- *live-tools*(7)

# BERANDA

Informasi selengkapnya tentang **minios-live-config** dapat ditemukan di [repositori GitHub](https://github.com/minios-linux/minios-live-config). Informasi umum MiniOS tersedia di [minios.dev](https://minios.dev).

# BUG

Laporkan bug melalui [pelacak masalah minios-live-config](https://github.com/minios-linux/minios-live-config/issues).

# PENULIS

**live-config** awalnya ditulis oleh Daniel Baumann ([mail@daniel-baumann.ch](mailto:mail@daniel-baumann.ch)). Sejak 2016, pengembangannya dilanjutkan oleh tim Debian Live. Sejak 2025, pengembangan versi modifikasi **minios-live-config** dilanjutkan oleh tim Live MiniOS.
