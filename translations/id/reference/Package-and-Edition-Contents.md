---
updated: 2026-08-31
---

# Isi paket dan edisi

Isi paket MiniOS dihasilkan dari daftar sumber bersyarat. Set akhir tergantung pada suite distribusi, arsitektur, sistem init, lingkungan desktop, lokal, opsi kernel, dan ketersediaan repositori. Halaman ini mendokumentasikan paket-paket yang terlihat oleh pengguna yang diminta oleh manifest Flux dan Xfce yang dikelola. Toolchain khusus build dan dependensi yang ditarik oleh APT tidak dicantumkan di sini.

`Yes` berarti manifest saat ini meminta paket tersebut untuk edisi tersebut.
`Conditional` berarti nama paket atau inklusinya tergantung pada opsi build atau target platform. Tanda strip berarti edisi tersebut tidak memintanya.
Image yang telah selesai tetap menjadi referensi utama.

## Tata letak edisi

Edisi Xfce yang dikelola dibangun secara berurutan: Standard adalah desktop harian yang ringkas, Toolbox ditujukan untuk administrasi sistem profesional, diagnostik, dan pemulihan, sedangkan Ultra mengubah basis tersebut menjadi desktop lengkap untuk pekerjaan umum, kreativitas, dan pengembangan. Flux adalah konfigurasi Fluxbox ultra-ringan yang terpisah untuk penggunaan sumber daya minimal dan perangkat keras lama; ini bukan sekadar daftar paket Xfce yang diperkecil.

| Edisi | Varian paket dan lingkungan | Tujuan utama |
|---|---|---|
| **Standard** | `standard` dengan `xfce` | Desktop Xfce minimal untuk penggunaan sehari-hari dengan fungsionalitas dasar |
| **Toolbox** | `toolbox` dengan `xfce` | Administrasi sistem profesional, diagnostik, dan pemulihan |
| **Ultra** | `ultra` dengan `xfce` | Desktop lengkap untuk pekerjaan umum, kreativitas, dan pengembangan |
| **Flux** | `minimum` dengan `flux` | Desktop Fluxbox ultra-ringan untuk penggunaan sumber daya minimal dan perangkat keras lama |

Lingkungan lain yang didukung memiliki rantai modul tersendiri dan harus diperiksa secara terpisah. Secara khusus, ketersediaan paket pada build LXQt atau konsol tidak boleh diasumsikan dari tabel Xfce di bawah ini.

## Paket inti MiniOS dan sistem

Paket-paket ini menyediakan runtime live-system, konfigurasi, pelokalan, penanganan hak istimewa, dan lingkungan command-line dasar.

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `minios-tools` | Ya | Ya | Ya | Ya | Pembuatan modul, konversi, inspeksi, aktivasi, dan pencatatan perubahan |
| `minios-image-compose` | Ya | Ya | Ya | Ya | Komposisi ISO command-line MiniOS |
| `minios-live-config` | Ya | Ya | Ya | Ya | Komponen konfigurasi sesi live |
| `minios-live-config-systemd` / `minios-live-config-sysvinit` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Integrasi sistem init; satu implementasi dipilih |
| `minios-live-config-doc` | Ya | Ya | Ya | Ya | Referensi live-config terpasang |
| `minios-welcome` | Ya | Ya | Ya | Ya | Halaman sambutan dan peluncur MiniOS |
| `user-setup` | Ya | Ya | Ya | Ya | Pengaturan akun pengguna live |
| `linux-base` | Ya | Ya | Ya | Ya | Skrip image Linux umum dan sistem |
| `kbd`, `keyboard-configuration`, `console-setup` | Ya | Ya | Ya | Ya | Konfigurasi keyboard dan tampilan konsol |
| `locales` | Ya | Ya | Ya | Ya | Data lokal dan pembuatan lokal |
| `network-manager` | Ya | Ya | Ya | Ya | Manajemen koneksi jaringan |
| `netplan.io` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Diminta hanya pada suite Ubuntu yang didukung |
| `dracut-core` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Diminta jika Dracut adalah pembuat initramfs |
| `gpg`, `gnupg` | Ya | Ya | Ya | Ya | Alat tanda tangan paket dan file |
| `file`, `cpio` | Ya | Ya | Ya | Ya | Identifikasi file dan penanganan arsip |
| `gettext-base` / `gettext` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Utilitas penerjemahan dipilih berdasarkan ketersediaan |
| `polkitd` / `policykit-1`, `pkexec` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Otorisasi dan peningkatan hak istimewa |
| `bash-completion` | Ya | Ya | Ya | Ya | Pelengkapan perintah shell |
| `man-db` | Ya | Ya | Ya | Ya | Pembaca dan basis data manual-page |
| `mc` | Ya | Ya | Ya | Ya | Manajer file Midnight Commander |
| `gpm` | Ya | Ya | Ya | Ya | Dukungan mouse di konsol |
| `ssh` | Ya | Ya | Ya | Ya | Paket klien dan server OpenSSH yang dipilih oleh APT |
| `systemd-timesyncd` / `chrony` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Sinkronisasi waktu dipilih berdasarkan suite dan sistem init |
| `tlp` | Ya | Ya | Ya | Ya | Manajemen daya laptop |

Beberapa paket bootstrap parity hanya diminta untuk suite basis tertentu.
Paket-paket ini merupakan dependensi implementasi, bukan fitur edisi, dan tidak dicantumkan satu per satu di sini.

## Alat jaringan

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan |
|---|:---:|:---:|:---:|:---:|---|
| `wpasupplicant` | Ya | Ya | Ya | Ya | Otentikasi nirkabel WPA/WPA2 |
| `rfkill` | Ya | Ya | Ya | Ya | Kontrol status perangkat nirkabel |
| `usb-modeswitch` | Ya | Ya | Ya | Ya | Pengalihan modem USB dan perangkat multi-mode |
| `dnsmasq-base` | - | Ya | Ya | Ya | Dukungan DNS dan DHCP untuk workflow jaringan |
| `cifs-utils` | - | Ya | Ya | Ya | Klien filesystem jaringan SMB/CIFS |
| `nfs-common` | - | Ya | Ya | Ya | Dukungan klien NFS |
| `ipset` | - | Ya | Ya | Ya | Administrasi IP set kernel |
| `whois` | - | Ya | Ya | Ya | Lookup registrasi domain dan alamat |
| `netcat`, `netcat-openbsd` | - | - | Ya | Ya | Alat pengujian stream TCP dan UDP |
| `nmap`, `ncat`, `ndiff` | - | - | Ya | Ya | Penemuan jaringan, transfer, dan perbandingan scan |
| `iw` | - | - | Ya | Ya | Konfigurasi perangkat dan link nirkabel |
| `iperf3` | - | - | Ya | Ya | Pengujian throughput jaringan |
| `aria2` | - | - | Ya | Ya | Utilitas unduhan multi-protokol |
| `davfs2` | - | - | Ya | Ya | Klien filesystem WebDAV |
| `sshfs` | - | - | Ya | Ya | Akses filesystem melalui SSH |
| `open-iscsi` | - | - | - | Ya | Inisiator iSCSI |
| `tgt` | - | - | - | Ya | Layanan target iSCSI |

## Penyimpanan dan filesystem

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `hdparm`, `sdparm` | Ya | Ya | Ya | Ya | Inspeksi dan tuning perangkat ATA dan SCSI |
| `mdadm` | Ya | Ya | Ya | Ya | Manajemen RAID perangkat lunak Linux |
| `smartmontools` | Ya | Ya | Ya | Ya | Pemantauan dan pengujian S.M.A.R.T. |
| `dosfstools` | Ya | Ya | Ya | Ya | Pembuatan dan pemeriksaan filesystem FAT |
| `ntfs-3g` | Ya | Ya | Ya | Ya | Driver dan alat NTFS berbasis userspace |
| `btrfs-progs` | Ya | Ya | Ya | Ya | Administrasi Btrfs |
| `xfsprogs` | - | Ya | Ya | Ya | Administrasi XFS |
| `exfatprogs` / `exfat-utils` dengan `exfat-fuse` | - | Bersyarat | Bersyarat | Bersyarat | Implementasi exFAT dipilih berdasarkan ketersediaan paket |
| `fuse3` / `fuse`, `libfuse2` | - | Bersyarat | Bersyarat | Bersyarat | Runtime FUSE dan library kompatibilitas |
| `dynfilefs` | - | Bersyarat | Bersyarat | Bersyarat | Penyimpanan persisten tersegmentasi pada suite yang didukung |
| `parted` | - | Ya | Ya | Ya | Pembuatan dan pengeditan tabel partisi |
| `gpart` | - | - | Ya | Ya | Pemulihan tabel partisi |
| `mtools` | - | - | Ya | Ya | Alat media FAT dan DOS |
| `gddrescue` | - | - | Ya | Ya | Penyalinan perangkat blok tahan gangguan |
| `lvm2` | - | - | Ya | Ya | Logical Volume Manager |
| `cryptsetup` | - | - | Ya | Ya | Manajemen volume LUKS |
| `zulucrypt-cli`, `zulumount-cli` | - | - | Ya | Ya | Manajemen dan mounting volume terenkripsi |
| `f2fs-tools` | - | - | Ya | Ya | Administrasi F2FS |
| `hfsutils`, `hfsprogs` | - | - | Ya | Ya | Alat HFS dan HFS+, jika tersedia |
| `jfsutils` | - | - | Ya | Ya | Administrasi JFS |
| `reiserfsprogs`, `reiser4progs` | - | - | Ya | Ya | Alat ReiserFS dan Reiser4, jika tersedia |
| `udftools` | - | - | Ya | Ya | Alat filesystem media optik UDF |
| `nilfs-tools` | - | - | Ya | Ya | Administrasi NILFS2 |
| `zfsutils-linux` | - | - | Bersyarat | Bersyarat | Alat ZFS userspace jika build kernel mendukung ZFS |

## Arsip dan format image

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `xz-utils`, `zstd` | Ya | Ya | Ya | Ya | Kompresi yang digunakan oleh paket, modul, dan image |
| `zip`, `unzip` | Ya | Ya | Ya | Ya | Pembuatan dan ekstraksi arsip ZIP |
| `xorriso` | Ya | Ya | Ya | Ya | Pembuatan dan inspeksi ISO |
| `squashfs-tools` | Ya | Ya | Ya | Ya | Pembuatan dan ekstraksi modul SquashFS |
| `lz4` / `liblz4-tools` | - | Bersyarat | Bersyarat | Bersyarat | Implementasi LZ4 dipilih berdasarkan ketersediaan |
| `bzip2` | - | Ya | Ya | Ya | Kompresi bzip2 |
| `7zip` | - | Ya | Ya | Ya | Format arsip 7z dan sejenisnya |
| `genisoimage` | - | Ya | Ya | Ya | Pembuatan image ISO-9660 |
| `pv` | - | - | Ya | Ya | Tampilan progres pipeline |
| `pigz`, `pixz`, `plzip`, `pbzip2` | - | - | Ya | Ya | Alat kompresi paralel |
| `lrzip`, `lzop` | - | - | Ya | Ya | Format kompresi tambahan |
| `cabextract` | - | - | Ya | Ya | Ekstraksi arsip Microsoft Cabinet |
| `xmount` | - | - | Ya | Ya | Konversi dan mounting format image disk |

## Pemulihan, diagnostik, dan performa

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan |
|---|:---:|:---:|:---:|:---:|---|
| `pciutils`, `usbutils` | Ya | Ya | Ya | Ya | Inspeksi perangkat PCI dan USB |
| `psmisc` | Ya | Ya | Ya | Ya | Alat proses seperti `fuser` dan `killall` |
| `htop` | - | Ya | Ya | Ya | Monitor proses interaktif |
| `ncdu` | - | Ya | Ya | Ya | Analisis penggunaan disk di terminal |
| `lsof` | - | Ya | Ya | Ya | Inspeksi file terbuka dan proses |
| `clonezilla` | - | - | Ya | Ya | Workflow kloning disk dan partisi |
| `partclone`, `partimage` | - | - | Ya | Ya | Alat imaging yang mengenali filesystem |
| `testdisk` | - | - | Ya | Ya | Pemulihan partisi dan file |
| `chntpw`, `reglookup` | - | - | Ya | Ya | Alat akun Windows offline dan registry |
| `hexedit` | - | - | Ya | Ya | Editor heksadesimal di terminal |
| `lshw`, `inxi` | - | - | Ya | Ya | Laporan perangkat keras dan sistem detail |
| `screen` | - | - | Ya | Ya | Multiplexer terminal |
| `nmon` | - | - | Ya | Ya | Monitor performa interaktif |
| `fio`, `bonnie++`, `iozone3` | - | - | Ya | Ya | Benchmark penyimpanan dan filesystem |
| `stress`, `sysbench` | - | - | Ya | Ya | Benchmark CPU, memori, dan sistem |
| `memtest86+` | - | - | Ya | Ya | Pengujian memori saat boot |
| `rsync` | - | - | Ya | Ya | Utilitas sinkronisasi dan penyalinan file |

## Virtualisasi dan kontainer

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `open-vm-tools`, `qemu-guest-agent` | - | - | Ya | Ya | Integrasi guest VMware dan QEMU |
| `virtualbox-guest-utils` | - | - | Bersyarat | Bersyarat | Integrasi guest VirtualBox pada suite tertentu |
| `hyperv-daemons` | - | - | Ya | Ya | Layanan guest Microsoft Hyper-V |
| `qemu-system-x86`, `qemu-utils` | - | - | Ya | Ya | Alat runtime dan image mesin virtual |
| `libvirt-daemon-system` | - | - | Ya | Ya | Layanan libvirt sistem |
| `virt-what` | - | - | Ya | Ya | Deteksi hypervisor |
| `uidmap` | - | - | - | Ya | Mapping ID namespace pengguna |
| Docker CE stack / `docker.io` dengan `docker-compose` | - | - | - | Bersyarat | Runtime kontainer dipilih dari repositori yang tersedia |
| `lazydocker` | - | - | - | Ya | Antarmuka terminal untuk Docker |
| `selinux-policy-default` | - | - | - | Ya | Paket kebijakan SELinux default |

## Firmware dan driver kernel

Pemilihan firmware mengikuti profil distribusi: build Debian dan Devuan menggunakan paket firmware terpisah, sedangkan build Ubuntu menggunakan `linux-firmware`. Driver DKMS juga difilter berdasarkan arsitektur, penyedia kernel, seri kernel, dan fitur yang sudah disediakan oleh kernel terpilih.

| Paket | Edisi | Tujuan atau kondisi |
|---|---|---|
| `firmware-linux-free`, `firmware-linux-nonfree` | Bersyarat, semua | Koleksi firmware Debian dan Devuan |
| `firmware-atheros`, `firmware-iwlwifi`, `firmware-zd1211` | Bersyarat, semua | Firmware nirkabel untuk perangkat Atheros, Intel, dan ZyDAS |
| `firmware-realtek`, `firmware-mediatek` | Bersyarat, semua | Firmware Realtek dan MediaTek; MediaTek tergantung pada suite |
| `firmware-bnx2`, `firmware-brcm80211`, `firmware-cavium` | Bersyarat, semua | Firmware jaringan Broadcom dan Cavium |
| `firmware-ipw2x00`, `firmware-libertas`, `firmware-ti-connectivity` | Bersyarat, semua | Keluarga firmware nirkabel tambahan |
| `firmware-b43-installer` | Bersyarat, semua | Installer firmware Broadcom B43 lawas |
| `firmware-sof-signed` | Bersyarat, semua | Image Sound Open Firmware |
| `linux-firmware` | Bersyarat, semua | Koleksi firmware Ubuntu |
| `ntfs3-dkms` | Bersyarat, semua | Driver NTFS3 jika tidak tersedia di kernel terpilih |
| `aufs-dkms` / `aufs-ng-dkms` | Bersyarat, semua | Driver AUFS dipilih berdasarkan suite dan kernel |
| `broadcom-sta-dkms` | Bersyarat, semua | Driver nirkabel Broadcom STA pada target yang didukung |
| `realtek-rtl8723cs-dkms`, `realtek-rtl8821au-dkms`, `realtek-rtl8821cu-dkms`, `realtek-rtl8814au-dkms` | Bersyarat, semua | Driver nirkabel vendor difilter berdasarkan kemampuan kernel in-tree dan platform target |
| `realtek-rtl88xxau-dkms`, `realtek-rtl8188eus-dkms`, `realtek-rtl88x2bu-dkms` | Bersyarat, semua | Driver vendor dipertahankan pada target yang didukung untuk perangkat atau fitur tambahan |
| `zfs-dkms` | Bersyarat, Toolbox dan Ultra | Modul kernel ZFS pada build amd64 yang didukung |

## Basis grafis

Lingkungan grafis berbagi basis Xorg dan rendering di bawah ini. Flux kemudian menggunakan daftar desktopnya sendiri; Standard, Toolbox, dan Ultra menggunakan daftar Xfce yang dikelola.

| Paket | Flux | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|:---:|---|
| `xserver-xorg`, `xinit` | Ya | Ya | Ya | Ya | Server X.Org dan alat startup |
| `xserver-xorg-video-all`, `xserver-xorg-video-intel` | Ya | Ya | Ya | Ya | Driver video X.Org |
| `xserver-xorg-input-all`, `xserver-xorg-legacy` | Ya | Ya | Ya | Ya | Driver input dan dukungan peluncuran lawas |
| `xterm` | Ya | Ya | Ya | Ya | Terminal X dasar |
| `blackbox` / `openbox` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Window manager ringan sebagai fallback yang dipilih berdasarkan lingkungan |
| `x11-utils`, `wmctrl`, `xdotool` | Ya | Ya | Ya | Ya | Inspeksi X11 dan otomasi jendela |
| `libdrm-intel1`, `libgl1-mesa-dri`, `libglu1-mesa` | Ya | Ya | Ya | Ya | Library rendering DRM dan Mesa |
| `breeze-cursor-theme`, `adwaita-icon-theme-antix` | Ya | Ya | Ya | Ya | Tema kursor dan ikon |
| `elementary-minios-icon-theme` | Ya | Ya | Ya | Ya | Tema ikon MiniOS di luar LXQt |
| `librsvg2-common` | Ya | Ya | Ya | Ya | Dukungan rendering SVG |
| `policykit-1-gnome` / `mate-polkit` / `xfce-polkit` | Bersyarat | Bersyarat | Bersyarat | Bersyarat | Agen PolicyKit grafis dipilih berdasarkan ketersediaan |
| `xrdp`, `xorgxrdp` | - | - | Ya | Ya | Login grafis jarak jauh melalui RDP |

## Desktop dan aplikasi Flux

| Paket | Tujuan atau kondisi |
|---|---|
| `fluxbox-flux` | Konfigurasi window manager MiniOS Fluxbox |
| `xfce4-panel`, `xfce4-xkb-plugin` | Panel dan indikator layout keyboard |
| `xwallpaper`, `gpicview` / `feh` | Wallpaper dan penampil gambar |
| `compton` | X compositor |
| `alsa-utils`, `volumeicon-alsa` | Kontrol audio ALSA |
| `systrayicon`, `cbatticon` | Indikator tray dan baterai |
| `xlunch`, `gtkask`, `flux-tools` | Launcher dan helper desktop MiniOS Flux |
| `scrot` | Utilitas screenshot |
| `mousepad`, `pcmanfm` | Editor teks dan manajer file |
| `galculator`, `lxtask`, `xarchiver` | Kalkulator, task manager, dan manajer arsip |
| `network-manager-gnome` | Applet desktop NetworkManager |
| `firefox` / `firefox-esr` | Browser dipilih berdasarkan suite, dengan paket lokal yang dipilih |

## Desktop Xfce dan aplikasi MiniOS

| Paket | Standard | Toolbox | Ultra | Tujuan atau kondisi |
|---|:---:|:---:|:---:|---|
| `thunar`, `thunar-volman` | Ya | Ya | Ya | Manajer file dan integrasi media lepas-pasang |
| `xfce4-panel`, `xfce4-session`, `xfce4-settings` | Ya | Ya | Ya | Panel Xfce, sesi, dan layanan pengaturan |
| `xfdesktop4`, `xfwm4`, `xfconf` | Ya | Ya | Ya | Desktop, window manager, dan layanan konfigurasi |
| `xfce4-appfinder`, `xfce4-xkb-plugin` | Ya | Ya | Ya | Pencari aplikasi dan indikator keyboard |
| `mousepad`, `ristretto` | Ya | Ya | Ya | Editor teks dan penampil gambar |
| `at-spi2-core`, `dbus-x11` | Ya | Ya | Ya | Dukungan aksesibilitas dan message-bus desktop |
| `gvfs-backends` | Ya | Ya | Ya | Integrasi filesystem remote dan removable untuk manajer file |
| `lightdm`, `lightdm-gtk-greeter` | Ya | Ya | Ya | Manajer login grafis |
| `network-manager-gnome`, `blueman` | Ya | Ya | Ya | Kontrol desktop jaringan dan Bluetooth |
| `avahi-daemon` | Ya | Ya | Ya | Penemuan layanan jaringan lokal |
| PipeWire stack / PulseAudio stack | Bersyarat | Bersyarat | Bersyarat | Audio desktop dipilih berdasarkan suite |
| `pavucontrol` | Ya | Ya | Ya | Mixer audio grafis |
| `engrampa`, `thunar-archive-plugin` | Ya | Ya | Ya | Manajer arsip dan integrasi manajer file |
| `xfce4-screensaver`, `xfce4-screenshooter` | Ya | Ya | Ya | Pengunci layar dan screenshot |
| `xfce4-power-manager-plugins` | Ya | Ya | Ya | Integrasi manajemen daya Xfce |
| `xfce4-taskmanager`, `xfce4-terminal` | Ya | Ya | Ya | Task manager dan terminal emulator |
| `xfce4-whiskermenu-plugin`, `xfce4-notifyd` | Ya | Ya | Ya | Menu aplikasi dan notifikasi |
| `minios-configurator` | Ya | Ya | Ya | Editor konfigurasi boot dan sesi MiniOS |
| `minios-installer` | Ya | Ya | Ya | Installer grafis dan `minios-deploy` CLI |
| `minios-session-manager` | Ya | Ya | Ya | Manajer sesi persisten dan `minios-session` CLI |
| `minios-kernel-manager` | Ya | Ya | Ya | Manajer kernel modular dan `minios-kernel` CLI |
| `minios-store`, `minios-store-gui` | Ya | Ya | Ya | Katalog aplikasi MiniOS dan installer |
| `minios-image-builder` | Ya | Ya | Ya | Workspace remastering ISO grafis |
| `minios-module-manager` | Ya | Ya | Ya | Manajer modul `.sb` grafis |
| `minios-help` | Ya | Ya | Ya | Penampil dokumentasi MiniOS terpasang |
| `driveutility` | Ya | Ya | Ya | Penulisan, pembacaan, format, dan penghapusan image disk |
| `firefox` / `firefox-esr` | Bersyarat | Bersyarat | Bersyarat | Browser dan lokal dipilih berdasarkan suite dan lokal |
| `menulibre` | - | Ya | Ya | Editor menu grafis |
| `open-vm-tools-desktop` | - | Ya | Ya | Integrasi desktop VMware |
| `virtualbox-guest-x11` | - | Bersyarat | Bersyarat | Integrasi desktop VirtualBox pada suite tertentu |
| Qt GTK platform themes | - | Ya | Ya | Integrasi tampilan GTK untuk aplikasi Qt |

## Aplikasi grafis Toolbox

Modul `05-apps` Xfce disertakan untuk Toolbox dan Ultra serta dilewati untuk Standard.

| Paket | Tujuan atau kondisi |
|---|---|
| `gparted` | Editor partisi grafis |
| `gsmartcontrol`, `qdiskinfo` | Pemeriksaan kesehatan disk dan informasi perangkat |
| `guymager`, `qphotorec` | Imaging forensik dan pemulihan file; `qphotorec` dikecualikan pada Buster dan Beowulf |
| `kdiskmark` | Benchmark disk |
| `isomaster` | Editor image ISO |
| `hardinfo`, `mesa-utils`, `vulkan-tools` | Diagnostik perangkat keras dan grafis |
| `baobab` | Analisis penggunaan disk grafis |
| `doublecmd-gtk` | Manajer file dua panel |
| `grsync` | Frontend grafis untuk `rsync` |
| `bleachbit` | Pembersihan cache dan file sementara |
| `czkawka` / `czkawka-gui` | Pencari file duplikat dan tidak diinginkan |
| `gtkhash` | Kalkulator checksum |
| `wxhexeditor` | Editor heksadesimal untuk file besar |
| `keepassxc` | Manajer kata sandi |
| `veracrypt` | Manajemen kontainer terenkripsi dan disk; dikecualikan pada Buster dan Beowulf |
| `zulucrypt-gui`, `zulumount-gui` | Alat volume terenkripsi grafis |
| `virt-manager`, `gir1.2-spiceclientgtk-3.0` | Manajemen mesin virtual dan dukungan tampilan SPICE |
| `remmina`, `remmina-plugin-rdp`, `remmina-plugin-vnc` | Klien desktop jarak jauh |
| `wireshark`, `zenmap`, `gnome-nettool` | Analisis dan diagnostik jaringan grafis |
| `x11vnc` | Akses VNC ke sesi X saat ini |
| `uget` | Manajer unduhan grafis |
| `android-file-transfer` | Transfer file Android MTP |
| `vlc` dan plugin terpilih | Pemutaran media, pelokalan, Samba, dan dukungan BitTorrent |
| `pdfarranger` | Pengaturan halaman PDF |
| `codium` | Editor kode |
| `onboard` | Keyboard di layar |
| `galculator` | Kalkulator |

## Aplikasi Ultra

Ultra mencakup semua aplikasi Toolbox dan menambahkan:

| Paket | Tujuan |
|---|---|
| `libreoffice`, `libreoffice-gtk3`, `libreoffice-style-elementary` | Suite perkantoran dan integrasi desktop |
| `gimp` | Editor grafis raster |
| `inkscape` | Editor grafis vektor |
| `blender` | Suite kreasi 3D |
| `audacity` | Editor audio |
| `obs-studio`, `obs-plugins` | Perekaman layar dan streaming |
| `rawtherapee` | Pemroses foto RAW |
| `synaptic` | Manajer paket grafis |
| `eddy`, `eddy-handler` | Installer paket Debian lokal, jika tersedia |
| `fonts-open-sans` | Keluarga font Open Sans |

## Inspeksi paket terpasang

Sistem yang sedang berjalan adalah acuan utama untuk paket yang benar-benar terpasang.
Daftar nama dan versi paket dengan:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

## Manifest build sumber

Tabel paket di atas diambil dari [sistem build `minios-live`](https://github.com/minios-linux/minios-live). Path di bawah ini relatif terhadap root repositori sumber tersebut dan relevan saat membangun atau menyesuaikan image dari sumber:

- `linux-live/environments/<environment>/` mendefinisikan rantai modul berurutan.
- `linux-live/scripts/00-core/packages.list` mendefinisikan basis bersama dan tambahan varian paket.
- `linux-live/scripts/01-kernel/packages.list` mendefinisikan build kernel bersyarat dan paket DKMS.
- `linux-live/scripts/02-firmware/packages.list` mendefinisikan firmware khusus distribusi.
- `linux-live/scripts/03-gui-base/packages.list` mendefinisikan basis grafis bersama.
- `linux-live/scripts/04-flux-desktop/packages.list` dan `05-flux-apps/packages.list` mendefinisikan Flux.
- `linux-live/scripts/04-xfce-desktop/packages.list` mendefinisikan Xfce dan alat desktop MiniOS.
- `linux-live/scripts/05-apps/packages.list` mendefinisikan aplikasi grafis Toolbox dan Ultra.
- `linux-live/scripts/10-firefox/packages.list` mendefinisikan paket browser khusus suite dan lokal.
- File `install` dan `skip_conditions.conf` pada setiap modul menentukan apakah dan bagaimana daftar paketnya digunakan.
- `linux-live/build.conf` memilih suite, arsitektur, lingkungan, varian paket, sistem init, kernel, dan lokal.
- `linux-live/condinapt.map` mendefinisikan awalan kondisi daftar paket.

Daftar sumber menjelaskan paket yang diminta dan alternatifnya. Hanya image yang telah selesai dan `dpkg-query` yang menunjukkan set dependensi yang telah terselesaikan dan versi pasti untuk rilis tertentu.

Lihat [Arsitektur sistem](/reference/System-Architecture) untuk urutan modul dan [CondinAPT di MiniOS](/development/CondinAPT) untuk pemilihan paket bersyarat.
