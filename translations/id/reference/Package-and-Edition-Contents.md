---
updated: 2026-10-15
---

# Isi paket dan edisi

Isi paket MiniOS dihasilkan dari daftar sumber bersyarat. Set akhir bergantung pada suite distribusi, arsitektur, sistem init, lingkungan desktop, lokal, opsi kernel, dan ketersediaan repositori. Halaman ini mendokumentasikan paket yang terlihat oleh pengguna dan diminta oleh manifest Flux dan Xfce yang dipelihara. Toolchain khusus build dan dependensi yang ditarik oleh APT tidak disertakan.

`Yes` berarti manifest saat ini meminta paket tersebut untuk edisi itu.
`Conditional` berarti nama paket atau penyertaannya bergantung pada opsi build atau platform target. Tanda pisah berarti edisi tersebut tidak memintanya.
Image yang telah selesai tetap menjadi acuan.

## Susunan edisi

Edisi Xfce yang dipelihara dibangun secara bertingkat: Standard adalah desktop harian yang ringkas, Toolbox ditujukan untuk administrasi sistem profesional, diagnostik, dan pemulihan, sedangkan Ultra mengembangkan basis tersebut menjadi desktop berfitur lengkap untuk pekerjaan umum, kreativitas, dan pengembangan. Flux adalah konfigurasi Fluxbox ultra-ringan yang terpisah untuk penggunaan sumber daya minimal dan perangkat keras lama; ini bukan sekadar daftar paket Xfce yang lebih kecil.

| Edisi | Varian paket dan lingkungan | Tujuan utama |
|---|---|---|
| **Standard** | `standard` dengan `xfce` | Desktop Xfce harian minimal dengan fungsi dasar |
| **Toolbox** | `toolbox` dengan `xfce` | Administrasi sistem profesional, diagnostik, dan pemulihan |
| **Ultra** | `ultra` dengan `xfce` | Desktop berfitur lengkap untuk pekerjaan umum, kreativitas, dan pengembangan |
| **Flux** | `minimum` dengan `flux` | Desktop Fluxbox ultra-ringan untuk penggunaan sumber daya minimal dan perangkat keras lama |

Lingkungan lain yang didukung memiliki rangkaian modul sendiri dan harus diperiksa secara terpisah. Khususnya, ketersediaan paket pada build LXQt atau konsol tidak boleh disimpulkan dari tabel Xfce di bawah.

## Paket inti MiniOS dan sistem

Paket-paket ini menyediakan runtime sistem live, konfigurasi, pelokalan, penanganan hak akses, dan lingkungan baris perintah dasar.

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Ya | Ya | Ya | Ya | Pembuatan, konversi, pemeriksaan, aktivasi, dan pencatatan perubahan modul |
| `minios-image-compose` | - | Ya | Ya | Ya | Penyusunan ISO MiniOS melalui baris perintah |
| `minios-deploy`, `minios-kernel`, `minios-session` | - | Ya | Ya | Ya | Backend deployment, kernel, dan sesi melalui baris perintah, terlepas dari aplikasi grafis |
| `minios-live-config` | Ya | Ya | Ya | Ya | Komponen konfigurasi sesi live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Integrasi sistem init; salah satu implementasi dipilih |
| `minios-live-config-doc` | Ya | Ya | Ya | Ya | Referensi live-config yang terpasang |
| `minios-welcome` | Ya | Ya | Ya | Ya | Halaman sambutan dan peluncur MiniOS |
| `user-setup` | Ya | Ya | Ya | Ya | Penyiapan akun pengguna live |
| `linux-base` | Ya | Ya | Ya | Ya | Image Linux umum dan skrip sistem |
| `kbd`, `keyboard-configuration`, `console-setup` | Ya | Ya | Ya | Ya | Konfigurasi keyboard dan tampilan konsol |
| `locales` | Ya | Ya | Ya | Ya | Data dan pembuatan lokal |
| `network-manager` | Ya | Ya | Ya | Ya | Pengelolaan koneksi jaringan |
| `netplan.io` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Hanya diminta pada suite Ubuntu yang didukung |
| `dracut-core` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Diminta jika Dracut digunakan sebagai pembuat initramfs |
| `gpg`, `gnupg` | Ya | Ya | Ya | Ya | Alat tanda tangan paket dan file |
| `file`, `cpio` | Ya | Ya | Ya | Ya | Identifikasi file dan penanganan arsip |
| `gettext-base` / `gettext` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Utilitas terjemahan yang dipilih berdasarkan ketersediaan |
| `polkitd` / `policykit-1`, `pkexec` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Otorisasi dan peningkatan hak akses |
| `bash-completion` | Ya | Ya | Ya | Ya | Pelengkapan perintah shell |
| `man-db` | Ya | Ya | Ya | Ya | Pembaca halaman manual dan basis data |
| `mc` | Ya | Ya | Ya | Ya | Manajer file Midnight Commander |
| `gpm` | Ya | Ya | Ya | Ya | Dukungan mouse konsol |
| `ssh` | Ya | Ya | Ya | Ya | Paket klien dan server OpenSSH yang dipilih oleh APT |
| `systemd-timesyncd` / `chrony` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Sinkronisasi waktu yang dipilih berdasarkan suite dan sistem init |
| `tlp` | Ya | Ya | Ya | Ya | Pengelolaan daya laptop |

Beberapa paket bootstrap untuk kesetaraan hanya diminta pada suite basis tertentu.
Paket-paket tersebut merupakan dependensi implementasi, bukan fitur edisi, sehingga tidak dicantumkan satu per satu di sini.

## Alat jaringan

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Ya | Ya | Ya | Ya | Autentikasi nirkabel WPA/WPA2 |
| `rfkill` | Ya | Ya | Ya | Ya | Kontrol status perangkat nirkabel |
| `usb-modeswitch` | Ya | Ya | Ya | Ya | Modem USB dan peralihan perangkat multi-mode |
| `dnsmasq-base` | - | Ya | Ya | Ya | Dukungan DNS dan DHCP untuk alur kerja jaringan |
| `cifs-utils` | - | Ya | Ya | Ya | Klien sistem file jaringan SMB/CIFS |
| `nfs-common` | - | Ya | Ya | Ya | Dukungan klien NFS |
| `ipset` | - | Ya | Ya | Ya | Administrasi set IP kernel |
| `whois` | - | Ya | Ya | Ya | Pencarian domain dan registrasi alamat |
| `netcat`, `netcat-openbsd` | - | - | Ya | Ya | Alat pengujian aliran TCP dan UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Ya | Ya | Penemuan jaringan, transfer, dan perbandingan pemindaian |
| `iw` | - | - | Ya | Ya | Konfigurasi perangkat nirkabel dan koneksi |
| `iperf3` | - | - | Ya | Ya | Pengujian throughput jaringan |
| `aria2` | - | - | Ya | Ya | Utilitas unduhan multi-protokol |
| `davfs2` | - | - | Ya | Ya | Klien sistem file WebDAV |
| `sshfs` | - | - | Ya | Ya | Akses sistem file melalui SSH |
| `open-iscsi` | - | - | - | Ya | Inisiator iSCSI |
| `tgt` | - | - | - | Ya | Layanan target iSCSI |

## Penyimpanan dan sistem file

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Ya | Ya | Ya | Ya | Pemeriksaan dan penyetelan perangkat ATA dan SCSI |
| `mdadm` | Ya | Ya | Ya | Ya | Pengelolaan RAID perangkat lunak Linux |
| `smartmontools` | Ya | Ya | Ya | Ya | Pemantauan dan pengujian S.M.A.R.T. |
| `dosfstools` | Ya | Ya | Ya | Ya | Pembuatan dan pemeriksaan sistem file FAT |
| `ntfs-3g` | Ya | Ya | Ya | Ya | Driver dan alat NTFS di ruang pengguna |
| `btrfs-progs` | Ya | Ya | Ya | Ya | Administrasi Btrfs |
| `xfsprogs` | - | Ya | Ya | Ya | Administrasi XFS |
| `exfatprogs` / `exfat-utils` dengan `exfat-fuse` | - | Bersyarat | Bersyarat | Bersyarat | Implementasi exFAT dipilih berdasarkan ketersediaan paket |
| `fuse3` / `fuse`, `libfuse2` | - | Bersyarat | Bersyarat | Bersyarat | Runtime FUSE dan pustaka kompatibilitas |
| `dynfilefs` | - | Bersyarat | Bersyarat | Bersyarat | Penyimpanan persistensi tersegmentasi pada suite yang didukung |
| `dynblk` | - | Ya | Ya | Ya | CLI untuk penyimpanan thin DynBlk berbasis kernel dan VMDK terpisah; sesi yang dapat digunakan juga memerlukan driver dan initrd yang kompatibel |
| `parted` | - | Ya | Ya | Ya | Pembuatan dan pengeditan tabel partisi |
| `gpart` | - | - | Ya | Ya | Pemulihan tabel partisi |
| `mtools` | - | - | Ya | Ya | Alat media FAT dan DOS |
| `gddrescue` | - | - | Ya | Ya | Penyalinan perangkat blok yang toleran terhadap kesalahan |
| `lvm2` | - | - | Ya | Ya | Logical Volume Manager |
| `cryptsetup` | - | - | Ya | Ya | Pengelolaan volume LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Ya | Ya | Pengelolaan dan pemasangan volume terenkripsi |
| `f2fs-tools` | - | - | Ya | Ya | Administrasi F2FS |
| `hfsutils`, `hfsprogs` | - | - | Ya | Ya | Alat HFS dan HFS+, jika tersedia |
| `jfsutils` | - | - | Ya | Ya | Administrasi JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Ya | Ya | Alat ReiserFS dan Reiser4, jika tersedia |
| `udftools` | - | - | Ya | Ya | Alat sistem file media optik UDF |
| `nilfs-tools` | - | - | Ya | Ya | Administrasi NILFS2 |
| `zfsutils-linux` | - | - | Bersyarat | Bersyarat | Alat ruang pengguna ZFS jika build kernel mendukung ZFS |

## Arsip dan format image

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Ya | Ya | Ya | Ya | Kompresi yang digunakan oleh paket, modul, dan image |
| `zip`, `unzip` | Ya | Ya | Ya | Ya | Pembuatan dan ekstraksi arsip ZIP |
| `xorriso` | Ya | Ya | Ya | Ya | Pembuatan dan pemeriksaan ISO |
| `squashfs-tools` | Ya | Ya | Ya | Ya | Pembuatan dan ekstraksi modul SquashFS |
| `lz4` / `liblz4-tools` | - | Bersyarat | Bersyarat | Bersyarat | Implementasi LZ4 dipilih berdasarkan ketersediaan |
| `bzip2` | - | Ya | Ya | Ya | Kompresi bzip2 |
| `7zip` | - | Ya | Ya | Ya | Format arsip 7z dan format terkait |
| `genisoimage` | - | Ya | Ya | Ya | Pembuatan image ISO-9660 |
| `pv` | - | - | Ya | Ya | Tampilan progres pipeline |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Ya | Ya | Alat kompresi paralel |
| `lrzip`, `lzop` | - | - | Ya | Ya | Format kompresi tambahan |
| `cabextract` | - | - | Ya | Ya | Ekstraksi arsip Microsoft Cabinet |
| `xmount` | - | - | Ya | Ya | Konversi dan pemasangan format image disk |

## Pemulihan, diagnostik, dan performa

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Ya | Ya | Ya | Ya | Pemeriksaan perangkat PCI dan USB |
| `psmisc` | Ya | Ya | Ya | Ya | Alat proses seperti `fuser` dan `killall` |
| `htop` | - | Ya | Ya | Ya | Pemantau proses interaktif |
| `ncdu` | - | Ya | Ya | Ya | Penganalisis penggunaan disk di terminal |
| `lsof` | - | Ya | Ya | Ya | Pemeriksaan file terbuka dan proses |
| `clonezilla` | - | - | Ya | Ya | Alur kerja kloning disk dan partisi |
| `partclone`, `partimage` | - | - | Ya | Ya | Alat pencitraan yang memahami sistem file |
| `testdisk` | - | - | Ya | Ya | Pemulihan partisi dan file |
| `chntpw`, `reglookup` | - | - | Ya | Ya | Alat akun Windows offline dan registry |
| `hexedit` | - | - | Ya | Ya | Editor heksadesimal terminal |
| `lshw`, `inxi` | - | - | Ya | Ya | Laporan perangkat keras dan sistem terperinci |
| `screen` | - | - | Ya | Ya | Multiplexer terminal |
| `nmon` | - | - | Ya | Ya | Pemantau performa interaktif |
| `fio`, `bonnie++`, `iozone3` | - | - | Ya | Ya | Benchmark penyimpanan dan sistem file |
| `stress`, `sysbench` | - | - | Ya | Ya | Benchmark CPU, memori, dan sistem |
| `memtest86+` | - | - | Ya | Ya | Pengujian memori saat boot |
| `rsync` | - | - | Ya | Ya | Utilitas sinkronisasi dan penyalinan file |
| `git` | - | - | Ya | Ya | Klien kontrol versi |

## Virtualisasi dan container

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Ya | Ya | Integrasi guest VMware dan QEMU |
| `virtualbox-guest-utils` | - | - | Bersyarat | Bersyarat | Integrasi guest VirtualBox pada suite tertentu |
| `hyperv-daemons` | - | - | Ya | Ya | Layanan guest Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Ya | Ya | Runtime mesin virtual dan alat image |
| `libvirt-daemon-system` | - | - | Ya | Ya | Layanan libvirt sistem |
| `virt-what` | - | - | Ya | Ya | Deteksi hypervisor |
| `uidmap` | - | - | - | Ya | Pemetaan ID namespace pengguna |
| Tumpukan Docker CE / `docker.io` dengan `docker-compose` | - | - | - | Bersyarat | Runtime container dipilih dari repositori yang tersedia |
| `lazydocker` | - | - | - | Ya | Antarmuka terminal untuk Docker |
| `selinux-policy-default` | - | - | - | Ya | Paket kebijakan SELinux default |

## Firmware dan driver kernel

Pemilihan firmware mengikuti profil distribusi: build Debian dan Devuan menggunakan paket firmware terpisah, sedangkan build Ubuntu menggunakan `linux-firmware`. Driver DKMS juga difilter berdasarkan arsitektur, penyedia kernel, seri kernel, dan fitur yang sudah tersedia di kernel pilihan.

| Paket | Edisi | Tujuan atau kondisi |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Bersyarat, semua | Kumpulan firmware Debian dan Devuan |
| `firmware-intel-graphics` | Bersyarat, semua | Firmware grafis Intel di Trixie dan Excalibur |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Bersyarat, semua | Firmware nirkabel untuk perangkat Atheros, Intel, dan ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Bersyarat, semua | Firmware Realtek dan MediaTek; MediaTek bergantung pada suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Bersyarat, semua | Firmware jaringan Broadcom dan Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Bersyarat, semua | Keluarga firmware nirkabel tambahan |
| `firmware-b43-installer` | Bersyarat, semua | Penginstal firmware Broadcom B43 lawas |
| `firmware-sof-signed` | Bersyarat, semua | Image Sound Open Firmware |
| `linux-firmware-minimal` / `linux-firmware` dan paket firmware vendor | Bersyarat, semua | Alternatif firmware dasar Ubuntu serta paket AMD, Intel, Broadcom, MediaTek, Qualcomm, Marvell, dan Realtek khusus suite |
| `ntfs3-dkms` | Bersyarat, semua | Driver NTFS3 jika tidak tersedia di kernel pilihan |
| `aufs-dkms` / `aufs-ng-dkms` | Bersyarat, semua | AUFS driver yang dipilih berdasarkan suite dan kernel |
| `dynblk-dkms` | Bersyarat, semua | DynBlk driver yang dipilih untuk Linux 6.12 saat build DKMS diaktifkan; tidak ditandatangani dan tidak tersedia dengan Secure Boot |
| `broadcom-sta-dkms` | Bersyarat, semua | Driver nirkabel Broadcom STA pada target yang didukung |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Bersyarat, semua | Driver nirkabel vendor yang difilter berdasarkan kemampuan kernel bawaan dan platform target |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Bersyarat, semua | Driver vendor yang disertakan pada target yang didukung untuk perangkat atau fitur tambahan |
| `zfs-dkms` | Bersyarat, Toolbox dan Ultra | Modul kernel ZFS pada build amd64 yang didukung |

Paket layar/kamera MateBook E tersedia untuk instalasi terpisah, dengan batasan yang dijelaskan di [Kompatibilitas perangkat keras](/getting-started/Hardware-Compatibility). Daftar paket pengembangan dapat memilih driver ini, tetapi bukan berarti driver tersebut pasti disertakan dalam image rilis final.

## Basis grafis

Lingkungan grafis menggunakan basis Xorg dan rendering berikut. Flux menggunakan daftar desktop tersendiri; Standard, Toolbox, dan Ultra menggunakan daftar Xfce yang dipelihara.

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Ya | Ya | Ya | Ya | Server X.Org dan alat startup |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Ya | Ya | Ya | Ya | Driver video X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Ya | Ya | Ya | Ya | Driver input dan dukungan peluncuran lama |
| `xterm` | Ya | Ya | Ya | Ya | Terminal X dasar |
| `blackbox` / `openbox` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Pengelola jendela cadangan ringan yang dipilih oleh lingkungan |
| `x11-utils`, `wmctrl`, `xdotool` | Ya | Ya | Ya | Ya | Inspeksi X11 dan otomatisasi jendela |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Ya | Ya | Ya | Ya | Pustaka rendering DRM dan Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Ya | Ya | Ya | Ya | Tema kursor dan ikon |
| `elementary-minios-icon-theme` | Ya | Ya | Ya | Ya | MiniOS tema ikon di luar LXQt |
| `librsvg2-common` | Ya | Ya | Ya | Ya | Dukungan rendering SVG |
| `fonts-inter-minimal`, `fonts-jetbrains-mono-minimal` | Ya | Ya | Ya | Ya | Font antarmuka dan monospace |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Agen PolicyKit grafis yang dipilih berdasarkan ketersediaan |
| `xrdp`, `xorgxrdp` | - | - | Ya | Ya | Login grafis jarak jauh melalui RDP |

## Desktop Flux dan aplikasi

| Paket | Tujuan atau kondisi |
|---|---|
| `fluxbox-flux` | Konfigurasi pengelola jendela Fluxbox MiniOS |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panel dan indikator tata letak keyboard |
| `xwallpaper`, `gpicview` / `feh` | Wallpaper dan tampilan gambar |
| `compton` | Kompositor X |
| `alsa-utils`, `volumeicon-alsa` | Kontrol audio ALSA |
| `systrayicon`, `cbatticon` | Indikator baki sistem dan baterai |
| `xlunch`, `gtkask`, `flux-tools` | Peluncur dan alat bantu desktop Flux MiniOS |
| `scrot` | Utilitas tangkapan layar |
| `mousepad`, `pcmanfm` | Editor teks dan pengelola file |
| `galculator`, `lxtask`, `xarchiver` | Kalkulator, pengelola tugas, dan pengelola arsip |
| `network-manager-gnome` | Applet desktop NetworkManager |
| `firefox` / `firefox-esr` | Browser yang dipilih berdasarkan suite, beserta paket pelokalan yang dipilih |

## Desktop Xfce dan aplikasi MiniOS

| Paket | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Ya | Ya | Ya | Integrasi pengelola file dan media lepas-pasang |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Ya | Ya | Ya | Pengaturan menggunakan paket yang disesuaikan untuk MiniOS dengan penskalaan antarmuka otomatis di Trixie/Excalibur |
| `xfdesktop4`, `xfconf` | Ya | Ya | Ya | Layanan desktop dan konfigurasi; Trixie/Excalibur menggunakan integrasi menu desktop MiniOS |
| `xfwm4-gl` / `xfwm4` | Bersyarat | Bersyarat | Bersyarat | Trixie/Excalibur memilih `xfwm4-gl` dengan OpenGL/XRender, efek, dan Peek; suite lain memilih `xfwm4` |
| `xfce4-tasklist-minios-plugin`, `xfce4-showdesktop-minios-plugin` | Bersyarat | Bersyarat | Bersyarat | Bilah tugas yang disematkan MiniOS, pratinjau yang dikelompokkan, dan strip Tampilkan Desktop di Trixie/Excalibur |
| `greybird-minios-gtk-theme` / `greybird-gtk-theme` | Bersyarat | Bersyarat | Bersyarat | Tema terang/gelap MiniOS, dengan tema distribusi sebagai cadangan jika tidak tersedia |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Ya | Ya | Ya | Pencari aplikasi dan indikator keyboard |
| `mousepad`, `ristretto` | Ya | Ya | Ya | Editor teks dan penampil gambar |
| `at-spi2-core`, `dbus-x11` | Ya | Ya | Ya | Dukungan aksesibilitas dan bus pesan desktop |
| `gvfs-backends` | Ya | Ya | Ya | Integrasi sistem file jarak jauh dan media lepas-pasang untuk pengelola file |
| `lightdm`, `lightdm-gtk-greeter` | Ya | Ya | Ya | Pengelola login grafis |
| `network-manager-gnome`, `blueman` | Ya | Ya | Ya | Kontrol desktop jaringan dan Bluetooth |
| `avahi-daemon` | Ya | Ya | Ya | Penemuan layanan jaringan lokal |
| Stack PipeWire / stack PulseAudio | Bersyarat | Bersyarat | Bersyarat | Audio desktop yang dipilih berdasarkan suite |
| `pavucontrol` | Ya | Ya | Ya | Mixer audio grafis |
| `engrampa`, `thunar-archive-plugin` | Ya | Ya | Ya | Pengelola arsip dan integrasi pengelola file |
| `xfce4-screensaver`, `xfce4-screenshooter` | Ya | Ya | Ya | Penguncian layar dan tangkapan layar |
| `xfce4-power-manager-plugins` | Ya | Ya | Ya | Integrasi manajemen daya Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Ya | Ya | Ya | Pengelola tugas dan emulator terminal |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Ya | Ya | Ya | Menu aplikasi dan notifikasi |
| `minios-configurator` | Ya | Ya | Ya | Editor konfigurasi boot dan sesi MiniOS |
| `minios-installer` | Ya | Ya | Ya | Penginstal grafis dan `minios-deploy` CLI |
| `minios-session-manager` | Ya | Ya | Ya | Pengelola sesi persisten dan `minios-session` CLI |
| `minios-kernel-manager` | Ya | Ya | Ya | Pengelola kernel modular dan `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Ya | Ya | Ya | Katalog aplikasi dan penginstal MiniOS |
| `minios-image-builder` | Ya | Ya | Ya | Ruang kerja remastering ISO grafis |
| `minios-module-manager` | Ya | Ya | Ya | Grafis `.sb` pengelola modul |
| `minios-help` | Ya | Ya | Ya | Penampil dokumentasi MiniOS yang terpasang |
| `driveutility` | Ya | Ya | Ya | Menulis, membaca, memformat, dan menghapus image disk |
| `firefox` / `firefox-esr` | Bersyarat | Bersyarat | Bersyarat | Browser dan pelokalan yang dipilih berdasarkan suite dan lokal |
| `menulibre` | - | Ya | Ya | Editor menu grafis |
| `open-vm-tools-desktop` | - | Ya | Ya | Integrasi desktop VMware |
| `virtualbox-guest-x11` | - | Bersyarat | Bersyarat | Integrasi desktop VirtualBox pada suite tertentu |
| Tema platform Qt GTK | - | Ya | Ya | Integrasi tampilan GTK untuk aplikasi Qt |

## Aplikasi grafis Toolbox

Modul Xfce `05-apps` disertakan untuk Toolbox dan Ultra, tetapi tidak disertakan untuk Standard.

| Paket | Tujuan atau kondisi |
|---|---|
| `gparted` | Editor partisi grafis |
| `gsmartcontrol`, `qdiskinfo` | Kesehatan disk dan informasi perangkat |
| `guymager`, `qphotorec` | Pencitraan forensik dan pemulihan file; `qphotorec` tidak disertakan pada Buster dan Beowulf |
| `kdiskmark` | Benchmark disk |
| `isomaster` | Editor image ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostik perangkat keras dan grafis |
| `baobab` | Penganalisis penggunaan disk grafis |
| `doublecmd-gtk` | Manajer file dua panel |
| `grsync` | Antarmuka `rsync` grafis |
| `bleachbit` | Pembersihan cache dan file sementara |
| `czkawka` / `czkawka-gui` | Pencari file duplikat dan yang tidak diinginkan |
| `gtkhash` | Kalkulator checksum |
| `wxhexeditor` | Editor heksadesimal untuk file berukuran besar |
| `keepassxc` | Manajer kata sandi |
| `veracrypt` | Pengelolaan container terenkripsi dan disk; tidak disertakan pada Buster dan Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Alat volume terenkripsi grafis |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Pengelolaan mesin virtual dan dukungan tampilan SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Klien desktop jarak jauh |
| `rescuezilla` | Pencadangan, pemulihan, dan kloning disk secara grafis |
| `transume` | Pencadangan, pemulihan, kloning, dan penelusuran image berbasis Clonezilla; memerlukan paket repositori yang kompatibel |
| `wireshark`, `zenmap`, `gnome-nettool` | Analisis dan diagnostik jaringan secara grafis |
| `x11vnc` | Akses VNC ke sesi X saat ini |
| `uget` | Manajer unduhan grafis |
| `android-file-transfer` | Transfer file MTP Android |
| `vlc` dan plugin pilihan | Dukungan pemutaran media, lokalisasi, Samba, dan BitTorrent |
| `pdfarranger` | Pengaturan halaman PDF |
| `codium` | Editor kode untuk amd64, diinstal dari repositori pihak ketiga yang ditandatangani |
| `onboard` | Keyboard layar |
| `galculator` | Kalkulator |

## Aplikasi Ultra

Ultra mencakup semua aplikasi Toolbox dan menambahkan:

| Paket | Tujuan |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Paket aplikasi perkantoran dan integrasi desktop |
| `gimp` | Editor grafis raster |
| `inkscape` | Editor grafis vektor |
| `blender` | Paket pembuatan 3D |
| `audacity` | Editor audio |
| `obs-studio`, `obs-plugins` | Perekaman dan streaming layar |
| `rawtherapee` | Pemroses foto RAW |
| `synaptic` | Manajer paket grafis |
| `eddy`, `eddy-handler` | Penginstal paket Debian lokal, jika tersedia |
| `fonts-open-sans` | Keluarga font Open Sans |

## Periksa paket yang terinstal

Sistem yang sedang berjalan menjadi acuan untuk paket yang benar-benar terinstal.
Tampilkan nama dan versi paket dengan:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifest build sumber

Tabel paket di atas diturunkan dari sistem [`minios-live`build](https://github.com/minios-linux/minios-live). Jalur di bawah ini relatif terhadap root repositori sumber tersebut dan relevan saat membangun atau menyesuaikan image dari sumber:

- `linux-live/environments/<environment>/` menentukan urutan rantai modul.
- `linux-live/scripts/00-core/packages.list` menentukan basis bersama dan penambahan varian paket.
- `linux-live/scripts/01-kernel/packages.list` menentukan paket kernel build bersyarat dan DKMS.
- `linux-live/scripts/02-firmware/packages.list` menentukan firmware khusus distribusi.
- `linux-live/scripts/03-gui-base/packages.list` menentukan basis grafis bersama.
- `linux-live/scripts/04-flux-desktop/packages.list` dan `05-flux-apps/packages.list` menentukan Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` menentukan alat desktop Xfce dan MiniOS.
- `linux-live/scripts/05-apps/packages.list` menentukan aplikasi grafis Toolbox dan Ultra.
- `linux-live/scripts/10-firefox/packages.list` menentukan paket browser khusus suite dan lokal.
- File `install` dan `skip_conditions.conf` setiap modul menentukan apakah dan bagaimana daftar paketnya digunakan.
- `linux-live/build.conf` memilih suite, arsitektur, lingkungan, varian paket, sistem init, kernel, dan lokal.
- `linux-live/condinapt.map` menentukan prefiks kondisi daftar paket.

Daftar sumber menjelaskan paket yang diminta dan alternatifnya. Hanya image yang telah selesai dan `dpkg-query` yang menunjukkan kumpulan dependensi yang terselesaikan dan versi tepat untuk rilis tertentu.

Lihat [Arsitektur sistem](/reference/System-Architecture) untuk urutan modul dan [CondinAPT di MiniOS](/development/CondinAPT) untuk pemilihan paket bersyarat.
