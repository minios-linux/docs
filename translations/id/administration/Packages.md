# Daftar Paket MiniOS

Dokumen ini memberikan gambaran lengkap tentang semua paket yang disertakan dalam berbagai edisi MiniOS. MiniOS hadir dalam tiga edisi utama, masing-masing dengan kumpulan perangkat lunak pra-instal yang berbeda:

- **Standard** - Sistem minimal dengan fungsionalitas dasar
- **Toolbox** - Alat administrasi sistem dan diagnostik
- **Ultra** - Lingkungan desktop lengkap dengan aplikasi

## Utilitas Konsol dan Paket Sistem

### ⚙️ Paket Sistem Inti

| Paket                          | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                         |
| :----------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------- |
| minios-tools                   |    ✅     |    ✅    |   ✅   | Alat inti dan skrip untuk MiniOS.                         |
| minios-welcome                 |    ✅     |    ✅    |   ✅   | Pesan sambutan di browser.                                |
| minios-live-config             |    ✅     |    ✅    |   ✅   | Skrip konfigurasi untuk sistem Live.                      |
| minios-live-config-systemd     |    ✅     |    ✅    |   ✅   | Konfigurasi sistem Live untuk systemd.                    |
| minios-live-config-doc         |    ✅     |    ✅    |   ✅   | Dokumentasi untuk minios-live-config.                     |
| user-setup                     |    ✅     |    ✅    |   ✅   | Utilitas konfigurasi pengguna.                            |
| linux-base                     |    ✅     |    ✅    |   ✅   | Skrip dasar untuk sistem Linux.                           |
| kbd                            |    ✅     |    ✅    |   ✅   | Utilitas untuk mengelola tata letak keyboard di konsol.   |
| keyboard-configuration         |    ✅     |    ✅    |   ✅   | Sistem konfigurasi keyboard.                              |
| locales                        |    ✅     |    ✅    |   ✅   | Pustaka dan data untuk lokalisasi (dukungan bahasa).      |
| console-setup                  |    ✅     |    ✅    |   ✅   | Konfigurasi font dan encoding konsol.                     |
| systemd-timesyncd              |    ✅     |    ✅    |   ✅   | Layanan untuk sinkronisasi waktu jaringan.                |
| polkitd / policykit-1 / pkexec |    ✅     |    ✅    |   ✅   | Framework untuk mengelola hak akses layanan sistem.       |

### 📦 Manajemen Paket dan Perangkat Lunak

| Paket               | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :------------------ | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| apt-transport-https |    ✅     |    ✅    |   ✅   | Memungkinkan penggunaan repository melalui protokol HTTPS.       |
| gettext-base        |    ✅     |    ✅    |   ✅   | Utilitas untuk internasionalisasi dan lokalisasi perangkat lunak.|
| man-db              |    ✅     |    ✅    |   ✅   | Sistem untuk melihat halaman manual (man).                      |
| bash-completion     |    ✅     |    ✅    |   ✅   | Menyediakan fitur auto-completion perintah di shell Bash.       |

### 🌐 Utilitas Jaringan

| Paket                      | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| network-manager / connman  |    ✅     |    ✅    |   ✅   | Manajer koneksi jaringan.                                       |
| dnsmasq-base               |    ✅     |    ✅    |   ✅   | Server DNS dan DHCP ringan (berkas dasar).                      |
| wpasupplicant              |    ✅     |    ✅    |   ✅   | Utilitas untuk menghubungkan ke jaringan Wi-Fi aman (WPA/WPA2). |
| iputils-ping               |    ✅     |    ✅    |   ✅   | Utilitas `ping` untuk memeriksa ketersediaan host.              |
| ssh                        |    ✅     |    ✅    |   ✅   | Klien dan server untuk koneksi remote aman (SSH).               |
| wget                       |    ✅     |    ✅    |   ✅   | Utilitas untuk mengunduh berkas dari jaringan.                  |
| curl                       |    ✅     |    ✅    |   ✅   | Utilitas untuk transfer data menggunakan berbagai protokol.     |
| ipset                      |    ✅     |    ✅    |   ✅   | Utilitas untuk mengelola kumpulan alamat IP di kernel.          |
| whois                      |    ✅     |    ✅    |   ✅   | Klien untuk mendapatkan informasi domain dan IP.                |
| nmap                       |    ❌     |    ✅    |   ✅   | Pemindai jaringan dan alat audit keamanan yang kuat.            |
| ncat                       |    ❌     |    ✅    |   ✅   | Versi `netcat` yang ditingkatkan dari paket nmap.               |
| ndiff                      |    ❌     |    ✅    |   ✅   | Utilitas untuk membandingkan hasil pemindaian nmap.             |
| iperf3                     |    ❌     |    ✅    |   ✅   | Alat untuk mengukur bandwidth jaringan.                         |
| netcat                     |    ❌     |    ✅    |   ✅   | Utilitas jaringan untuk membaca/menulis data melalui TCP/IP.    |
| netcat-openbsd             |    ❌     |    ✅    |   ✅   | Implementasi alternatif `netcat` dari OpenBSD.                  |
| open-iscsi                 |    ❌     |    ❌    |   ✅   | Klien (initiator) untuk bekerja dengan penyimpanan iSCSI.       |
| tgt                        |    ❌     |    ❌    |   ✅   | Server (target) untuk menyediakan penyimpanan iSCSI.            |

### 💾 Manajemen Disk dan Filesystem

| Paket           | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :-------------- | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| parted          |    ✅     |    ✅    |   ✅   | Program untuk membuat dan memodifikasi partisi disk.            |
| dosfstools      |    ✅     |    ✅    |   ✅   | Utilitas untuk membuat dan memeriksa filesystem FAT.            |
| ntfs-3g         |    ✅     |    ✅    |   ✅   | Driver untuk membaca dan menulis partisi NTFS.                  |
| mdadm           |    ✅     |    ✅    |   ✅   | Utilitas untuk mengelola array RAID berbasis perangkat lunak.   |
| hdparm          |    ✅     |    ✅    |   ✅   | Utilitas untuk mengatur dan melihat parameter hard disk.        |
| sdparm          |    ✅     |    ✅    |   ✅   | Utilitas untuk mengakses parameter perangkat SCSI/SATA/SAS.     |
| btrfs-progs     |    ✅     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem Btrfs.                 |
| xfsprogs        |    ✅     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem XFS.                   |
| exfat-utils     |    ✅     |    ✅    |   ✅   | Utilitas untuk filesystem exFAT (implementasi lama).            |
| exfat-fuse      |    ✅     |    ✅    |   ✅   | Modul FUSE untuk dukungan filesystem exFAT.                     |
| exfatprogs      |    ✅     |    ✅    |   ✅   | Utilitas untuk membuat dan memeriksa filesystem exFAT.          |
| cifs-utils      |    ✅     |    ✅    |   ✅   | Utilitas untuk mount network share Windows (Samba/CIFS).        |
| nfs-common      |    ✅     |    ✅    |   ✅   | Berkas umum untuk dukungan filesystem NFS (klien).              |
| smartmontools   |    ✅     |    ✅    |   ✅   | Utilitas untuk memantau kesehatan disk melalui S.M.A.R.T.       |
| gpart           |    ❌     |    ✅    |   ✅   | Utilitas untuk "menebak" tabel partisi pada disk rusak.         |
| mtools          |    ❌     |    ✅    |   ✅   | Kumpulan utilitas untuk mengakses floppy dan partisi MS-DOS.    |
| gddrescue       |    ❌     |    ✅    |   ✅   | Alat untuk menyalin data dari media yang rusak.                 |
| zfsutils-linux  |    ❌     |    ✅    |   ✅   | Utilitas untuk mengelola pool dan filesystem ZFS.               |
| davfs2          |    ❌     |    ✅    |   ✅   | Memungkinkan mount sumber daya WebDAV sebagai filesystem lokal. |
| f2fs-tools      |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem F2FS.                  |
| hfsutils        |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem Apple "klasik" (HFS).  |
| hfsprogs        |    ❌     |    ✅    |   ✅   | Utilitas untuk membuat dan memeriksa filesystem HFS+.           |
| jfsutils        |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem JFS.                   |
| reiserfsprogs   |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem ReiserFS (v3).         |
| reiser4progs    |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan filesystem Reiser4.               |
| udftools        |    ❌     |    ✅    |   ✅   | Utilitas untuk filesystem UDF (DVD/Blu-ray).                    |
| nilfs-tools     |    ❌     |    ✅    |   ✅   | Utilitas untuk filesystem log-structured NILFS2.                |
| sshfs           |    ❌     |    ✅    |   ✅   | Mount filesystem remote melalui SSH.                            |
| lvm2            |    ❌     |    ✅    |   ✅   | Logical Volume Manager.                                         |
| cryptsetup      |    ❌     |    ✅    |   ✅   | Utilitas untuk membuat partisi terenkripsi (LUKS).              |
| zulucrypt-cli   |    ❌     |    ✅    |   ✅   | CLI untuk mengelola volume terenkripsi (LUKS, VeraCrypt, dll).  |
| zulumount-cli   |    ❌     |    ✅    |   ✅   | CLI untuk mount volume yang dikelola oleh zulucrypt.            |

### 💻 Utilitas Sistem dan Monitoring

| Paket          | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                      |
| :------------- | :------: | :-----: | :---: | :--------------------------------------------------------------------- |
| pciutils       |    ✅     |    ✅    |   ✅   | Utilitas untuk melihat informasi perangkat PCI.                        |
| usbutils       |    ✅     |    ✅    |   ✅   | Utilitas untuk melihat informasi perangkat USB.                        |
| psmisc         |    ✅     |    ✅    |   ✅   | Kumpulan utilitas untuk mengelola proses (`fuser`, `killall`).         |
| lsof           |    ✅     |    ✅    |   ✅   | Menampilkan berkas yang digunakan oleh proses tertentu.                |
| htop           |    ✅     |    ✅    |   ✅   | Monitor proses interaktif.                                             |
| rfkill         |    ✅     |    ✅    |   ✅   | Alat untuk mengaktifkan/menonaktifkan perangkat nirkabel.              |
| file           |    ✅     |    ✅    |   ✅   | Menentukan tipe berkas.                                                |
| usb-modeswitch |    ✅     |    ✅    |   ✅   | Mengubah mode perangkat USB (misal: modem).                            |
| ncdu           |    ✅     |    ✅    |   ✅   | Analisis penggunaan disk dengan antarmuka ncurses.                     |
| lshw           |    ❌     |    ✅    |   ✅   | Menampilkan informasi perangkat keras secara detail.                   |
| screen         |    ❌     |    ✅    |   ✅   | Terminal multiplexer, memungkinkan pengelolaan sesi terminal.          |
| nmon           |    ❌     |    ✅    |   ✅   | Utilitas untuk memantau performa sistem.                               |
| inxi           |    ❌     |    ✅    |   ✅   | Skrip untuk mengumpulkan dan menampilkan informasi sistem secara rinci.|

### 🗜️ Arsip dan Kompresi

| Paket         | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :------------ | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| zip           |    ✅     |    ✅    |   ✅   | Arsip untuk membuat dan mengekstrak berkas .zip.                |
| unzip         |    ✅     |    ✅    |   ✅   | Utilitas untuk mengekstrak arsip .zip.                          |
| xz-utils      |    ✅     |    ✅    |   ✅   | Utilitas untuk kompresi data dengan algoritma LZMA/XZ.          |
| zstd          |    ✅     |    ✅    |   ✅   | Utilitas untuk kompresi data dengan Zstandard.                  |
| lz4           |    ✅     |    ✅    |   ✅   | Utilitas untuk kompresi data sangat cepat.                      |
| liblz4-tools  |    ✅     |    ✅    |   ✅   | Alat tambahan untuk format lz4.                                 |
| bzip2         |    ✅     |    ✅    |   ✅   | Utilitas untuk kompresi data dengan algoritma bzip2.            |
| 7zip          |    ✅     |    ✅    |   ✅   | Arsip kuat dengan dukungan banyak format, termasuk 7z.          |
| pv            |    ❌     |    ✅    |   ✅   | Utilitas untuk memantau progres transfer data melalui pipe.     |
| pigz          |    ❌     |    ✅    |   ✅   | Implementasi gzip paralel (multi-threaded).                     |
| pixz          |    ❌     |    ✅    |   ✅   | Implementasi xz paralel yang dapat diindeks.                    |
| plzip         |    ❌     |    ✅    |   ✅   | Implementasi paralel untuk lzip.                                |
| lrzip         |    ❌     |    ✅    |   ✅   | Arsip long-range, efisien untuk berkas besar.                   |
| lzop          |    ❌     |    ✅    |   ✅   | Utilitas kompresi sangat cepat.                                 |
| pbzip2        |    ❌     |    ✅    |   ✅   | Implementasi paralel untuk bzip2.                               |
| cabextract    |    ❌     |    ✅    |   ✅   | Utilitas untuk mengekstrak arsip Microsoft .cab.                |

### 🕵️ Pemulihan dan Forensik

| Paket      | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                 |
| :--------- | :------: | :-----: | :---: | :----------------------------------------------- |
| clonezilla |    ❌     |    ✅    |   ✅   | Alat untuk kloning dan backup disk.              |
| testdisk   |    ❌     |    ✅    |   ✅   | Utilitas untuk memulihkan partisi dan berkas yang terhapus. |
| chntpw     |    ❌     |    ✅    |   ✅   | Utilitas untuk mereset password Windows.         |
| reglookup  |    ❌     |    ✅    |   ✅   | Utilitas untuk membaca dan menganalisis registry Windows. |
| hexedit    |    ❌     |    ✅    |   ✅   | Editor heksadesimal sederhana untuk konsol.      |

### ☁️ Virtualisasi dan Kontainer

| Paket                   | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :---------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| open-vm-tools           |    ❌     |    ✅    |   ✅   | Kumpulan utilitas untuk integrasi VMware yang lebih baik.        |
| hyperv-daemons          |    ❌     |    ✅    |   ✅   | Layanan untuk integrasi dengan hypervisor Microsoft Hyper-V.     |
| qemu-system-x86         |    ❌     |    ✅    |   ✅   | Emulator untuk menjalankan sistem operasi x86/x86_64.            |
| qemu-utils              |    ❌     |    ✅    |   ✅   | Utilitas untuk bekerja dengan image disk QEMU.                   |
| libvirt-daemon-system   |    ❌     |    ✅    |   ✅   | Daemon untuk mengelola mesin virtual.                            |
| virt-what               |    ❌     |    ✅    |   ✅   | Skrip untuk mendeteksi apakah sistem berjalan di VM.             |
| uidmap                  |    ❌     |    ❌    |   ✅   | Utilitas untuk bekerja dengan user namespaces.                   |
| docker.io               |    ❌     |    ❌    |   ✅   | Platform kontainerisasi aplikasi.                                |
| docker-compose          |    ❌     |    ❌    |   ✅   | Alat untuk mengelola aplikasi Docker multi-kontainer.            |
| lazydocker              |    ❌     |    ❌    |   ✅   | UI terminal untuk mengelola Docker dan Docker Compose.           |
| selinux-policy-default  |    ❌     |    ❌    |   ✅   | Kebijakan keamanan SELinux default.                              |

### 🧩 Lain-lain

| Paket           | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                        |
| :-------------- | :------: | :-----: | :---: | :----------------------------------------------------------------------- |
| mc              |    ✅     |    ✅    |   ✅   | Manajer berkas Midnight Commander.                                      |
| gpg             |    ✅     |    ✅    |   ✅   | GNU Privacy Guard - utilitas enkripsi dan penandatanganan.              |
| gnupg           |    ✅     |    ✅    |   ✅   | Suite GNU Privacy Guard lengkap.                                        |
| squashfs-tools  |    ✅     |    ✅    |   ✅   | Utilitas untuk membuat dan mengekstrak image SquashFS.                  |
| xorriso         |    ✅     |    ✅    |   ✅   | Utilitas untuk membuat dan membakar image ISO-9660.                     |
| genisoimage     |    ✅     |    ✅    |   ✅   | Membuat image filesystem ISO-9660.                                      |
| eject           |    ✅     |    ✅    |   ✅   | Utilitas untuk mengeluarkan media lepas (CD/DVD/USB).                   |
| fuse3 / fuse    |    ✅     |    ✅    |   ✅   | Framework untuk membuat filesystem userspace.                           |
| libfuse2        |    ✅     |    ✅    |   ✅   | Library kompatibilitas untuk aplikasi FUSE lama.                        |
| memtest86+      |    ❌     |    ✅    |   ✅   | Program untuk menguji RAM.                                              |
| xmount          |    ❌     |    ✅    |   ✅   | Alat untuk mount image disk berbagai format.                            |
| aria2           |    ❌     |    ✅    |   ✅   | Manajer unduhan multi-protokol.                                         |
| fio             |    ❌     |    ✅    |   ✅   | Alat lanjutan untuk pengujian performa I/O disk (Flexible I/O Tester).  |
| bonnie++        |    ❌     |    ✅    |   ✅   | Benchmark untuk menguji performa filesystem.                            |
| iozone3         |    ❌     |    ✅    |   ✅   | Benchmark untuk menguji performa I/O disk.                              |
| stress          |    ❌     |    ✅    |   ✅   | Alat untuk membebani sistem (CPU, memori, I/O).                         |
| sysbench        |    ❌     |    ✅    |   ✅   | Benchmark komprehensif untuk menguji CPU, memori, I/O, database.        |

## Firmware dan Driver

### 📦 Driver (DKMS)

| Paket                    | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                                |
| :----------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------- |
| broadcom-sta-dkms        |    ✅     |    ✅    |   ✅   | Driver Broadcom 802.11 STA proprietary untuk kartu Wi-Fi. Diperlukan untuk banyak laptop dengan chip Broadcom. |
| zfs-dkms                 |    ❌     |    ✅    |   ✅   | Modul kernel untuk dukungan filesystem ZFS.                                      |
| realtek-rtl8821au-dkms   |    ✅     |    ✅    |   ✅   | Driver DKMS untuk chipset Wi-Fi Realtek RTL8812AU/8821AU.                        |
| realtek-rtl88xxau-dkms   |    ✅     |    ✅    |   ✅   | Driver DKMS untuk berbagai chipset Wi-Fi Realtek seri RTL88xxAU.                 |
| realtek-rtl8188eus-dkms  |    ✅     |    ✅    |   ✅   | Driver DKMS untuk chipset Wi-Fi Realtek RTL8188EUS.                              |
| realtek-rtl8814au-dkms   |    ✅     |    ✅    |   ✅   | Driver DKMS untuk chipset Wi-Fi Realtek RTL8814AU.                               |

### 🔌 Firmware

| Paket                    | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                              |
| :----------------------- | :------: | :-----: | :---: | :------------------------------------------------------------- |
| firmware-linux-free      |    ✅     |    ✅    |   ✅   | Kumpulan firmware gratis (berdasarkan lisensi) untuk berbagai perangkat keras.    |
| firmware-linux-nonfree   |    ✅     |    ✅    |   ✅   | Metapackage yang mencakup semua firmware non-free (proprietary).                 |
| firmware-atheros         |    ✅     |    ✅    |   ✅   | Firmware untuk kartu jaringan nirkabel berbasis chip Atheros.                     |
| firmware-iwlwifi         |    ✅     |    ✅    |   ✅   | Firmware untuk kartu jaringan Intel Wireless (Wi-Fi).                             |
| firmware-zd1211          |    ✅     |    ✅    |   ✅   | Firmware untuk perangkat Wi-Fi berbasis ZyDAS ZD1211/ZD1211B.                     |
| firmware-realtek         |    ✅     |    ✅    |   ✅   | Firmware untuk berbagai perangkat Realtek (kartu jaringan, Bluetooth, dll).       |
| firmware-bnx2            |    ✅     |    ✅    |   ✅   | Firmware untuk adapter jaringan Broadcom NetXtreme II.                            |
| firmware-brcm80211       |    ✅     |    ✅    |   ✅   | Firmware untuk kartu nirkabel Broadcom/Cypress 802.11.                            |
| firmware-cavium          |    ✅     |    ✅    |   ✅   | Firmware untuk prosesor dan adapter jaringan Cavium.                              |
| firmware-ipw2x00         |    ✅     |    ✅    |   ✅   | Firmware untuk kartu Intel Pro/Wireless 2100/2200/2915 lawas.                     |
| firmware-libertas        |    ✅     |    ✅    |   ✅   | Firmware untuk kartu nirkabel Marvell Libertas 8xxx.                              |
| firmware-ti-connectivity |    ✅     |    ✅    |   ✅   | Firmware untuk chip combo Texas Instruments (Wi-Fi, Bluetooth).                   |
| firmware-b43-installer   |    ✅     |    ✅    |   ✅   | Installer untuk firmware kartu nirkabel Broadcom B43 lawas.                       |
| firmware-sof-signed      |    ✅     |    ✅    |   ✅   | Firmware bertanda tangan untuk platform Sound Open Firmware (audio DSP).           |

## GUI Dasar

### 🖥️ Sistem Grafis (Xorg)

| Paket                      | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                               |
| :------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------- |
| xserver-xorg               |    ✅     |    ✅    |   ✅   | Server utama sistem grafis X.Org.                               |
| xserver-xorg-video-all     |    ✅     |    ✅    |   ✅   | Metapackage untuk menginstal semua driver video 2D untuk X.Org. |
| xserver-xorg-video-intel   |    ✅     |    ✅    |   ✅   | Driver video untuk grafis terintegrasi Intel.                   |
| xserver-xorg-input-all     |    ✅     |    ✅    |   ✅   | Metapackage untuk menginstal semua driver perangkat input (mouse, keyboard). |
| xinit                      |    ✅     |    ✅    |   ✅   | Utilitas untuk memulai X server.                                |
| xterm                      |    ✅     |    ✅    |   ✅   | Emulator terminal standar untuk X.                              |
| blackbox or openbox        |    ✅     |    ✅    |   ✅   | Window manager ringan.                                          |
| libxcursor1                |    ✅     |    ✅    |   ✅   | Library untuk bekerja dengan kursor X11.                        |
| breeze-cursor-theme        |    ✅     |    ✅    |   ✅   | Tema kursor Breeze dari KDE.                                    |
| x11-utils                  |    ✅     |    ✅    |   ✅   | Kumpulan utilitas dasar X11.                                    |
| wmctrl                     |    ✅     |    ✅    |   ✅   | Utilitas untuk mengontrol jendela dari command line.            |
| xdotool                    |    ✅     |    ✅    |   ✅   | Utilitas untuk mensimulasikan input keyboard dan mouse.         |
| libdrm-intel1              |    ✅     |    ✅    |   ✅   | Library userspace untuk Intel DRM (Direct Rendering Manager).   |
| libgl1-mesa-dri            |    ✅     |    ✅    |   ✅   | Implementasi OpenGL gratis untuk direct rendering.              |
| libglu1-mesa               |    ✅     |    ✅    |   ✅   | Library utilitas Mesa OpenGL (GLU).                             |

### 🔌 Akses Jarak Jauh (XRDP)

| Paket              | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                       |
| :----------------- | :------: | :-----: | :---: | :------------------------------------------------------ |
| xrdp and xorgxrdp  |    ❌     |    ✅    |   ✅   | Server untuk menghubungkan ke desktop grafis via protokol RDP. |

### 🎨 Komponen Antarmuka

| Paket                          | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                        |
| :----------------------------- | :------: | :-----: | :---: | :--------------------------------------- |
| librsvg2-common                |    ✅     |    ✅    |   ✅   | Library untuk merender gambar SVG.       |
| adwaita-icon-theme-antix       |    ✅     |    ✅    |   ✅   | Tema ikon Adwaita.                      |
| elementary-minios-icon-theme   |    ✅     |    ✅    |   ✅   | Tema ikon elementary khusus untuk MiniOS.|

## XFCE

### 🖼️ Lingkungan Desktop (XFCE)

| Paket                | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                                   |
| :------------------- | :------: | :-----: | :---: | :---------------------------------------------------------------------------------- |
| dbus-x11             |    ✅     |    ✅    |   ✅   | Menjalankan D-Bus message bus di sesi X11, diperlukan untuk komunikasi antar aplikasi.|
| libxfce4ui-utils     |    ✅     |    ✅    |   ✅   | Library dengan widget dan utilitas umum untuk antarmuka XFCE.                       |
| thunar               |    ✅     |    ✅    |   ✅   | Manajer berkas default di XFCE.                                                     |
| thunar-volman        |    ✅     |    ✅    |   ✅   | Mengelola mount otomatis media lepas di Thunar.                                     |
| xfce4-appfinder      |    ✅     |    ✅    |   ✅   | Utilitas untuk mencari dan menjalankan aplikasi dengan cepat.                       |
| xfce4-panel          |    ✅     |    ✅    |   ✅   | Panel desktop XFCE.                                                                 |
| xfce4-session        |    ✅     |    ✅    |   ✅   | Manajer sesi XFCE, mengatur startup dan shutdown sesi.                              |
| xfce4-settings       |    ✅     |    ✅    |   ✅   | Pusat kontrol pengaturan XFCE.                                                      |
| xfconf               |    ✅     |    ✅    |   ✅   | Sistem konfigurasi untuk XFCE.                                                      |
| xfdesktop4           |    ✅     |    ✅    |   ✅   | Mengelola desktop: wallpaper, ikon, menu.                                          |
| xfwm4                |    ✅     |    ✅    |   ✅   | Window manager XFCE.                                                                |
| greybird-gtk-theme   |    ✅     |    ✅    |   ✅   | Tema GTK yang populer dan bersih, sering digunakan di XFCE.                         |
| xfce4-xkb-plugin     |    ✅     |    ✅    |   ✅   | Plugin panel untuk mengganti tata letak keyboard.                                   |
| xfce4-notifyd        |    ❌     |    ✅    |   ✅   | Daemon untuk menampilkan notifikasi desktop.                                        |
| menulibre            |    ❌     |    ✅    |   ✅   | Editor menu lanjutan untuk lingkungan GTK.                                          |
| network-manager-gnome|    ✅     |    ✅    |   ✅   | Applet grafis untuk mengelola koneksi jaringan (NetworkManager).                    |

### 🛠️ Utilitas Sistem dan GUI

| Paket                       | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                                 |
| :-------------------------- | :------: | :-----: | :---: | :------------------------------------------------------------------------------- |
| gvfs-backends               |    ✅     |    ✅    |   ✅   | Backend untuk GVfs, menyediakan akses ke FTP, SFTP, SMB, dll. melalui file manager.|
| open-vm-tools-desktop       |    ❌     |    ✅    |   ✅   | Komponen untuk integrasi guest OS dengan VMware (clipboard, perubahan resolusi).   |
| gtk-update-icon-cache       |    ❌     |    ✅    |   ✅   | Utilitas untuk memperbarui cache tema ikon GTK.                                   |
| libglib2.0-bin              |    ✅     |    ✅    |   ✅   | Utilitas biner untuk library GLib 2.0.                                            |
| at-spi2-core                |    ✅     |    ✅    |   ✅   | Protokol dan library untuk dukungan aksesibilitas (screen reader, dll.).          |
| qt5/qt6-gtk-platformtheme   |    ❌     |    ✅    |   ✅   | Plugin agar aplikasi Qt5/Qt6 menggunakan tema GTK untuk tampilan konsisten.        |
| policykit-1-gnome           |    ✅     |    ✅    |   ✅   | Agen autentikasi PolicyKit untuk lingkungan GTK, meminta password untuk aksi privileged.|
| libxml2-utils               |    ✅     |    ✅    |   ✅   | Utilitas command-line untuk bekerja dengan berkas XML (misal, `xmllint`).          |
| xmlstarlet                  |    ✅     |    ✅    |   ✅   | Alat command-line kuat untuk parsing, transformasi, dan edit XML.                  |

### 🧰 Aplikasi

| Paket                             | Standard | Toolbox | Ultra | ℹ️ Informasi Paket                                                                                          |
| :-------------------------------- | :------: | :-----: | :---: | :-------------------------------------------------------------------------------------------------------- |
| minios-installer                  |    ✅     |    ✅    |   ✅   | Installer sistem MiniOS berbasis grafis.                                                                  |
| minios-configurator               |    ✅     |    ✅    |   ✅   | Konfigurator sistem MiniOS.                                                                               |
| mintstick                         |    ✅     |    ✅    |   ✅   | Utilitas untuk memformat USB dan menulis image ISO.                                                      |
| mousepad                          |    ✅     |    ✅    |   ✅   | Editor teks sederhana dan cepat untuk XFCE.                                                              |
| ristretto                         |    ✅     |    ✅    |   ✅   | Penampil gambar sederhana dan cepat untuk XFCE.                                                          |
| **Web browsers**                  |
| firefox-esr                       |    ✅     |    ✅    |   ✅   | Peramban web Firefox dengan Extended Support Release (ESR). Versi stabil dengan update keamanan jangka panjang. |
| **Multimedia**                    |
| vlc                               |    ❌     |    ✅    |   ✅   | Pemutar media yang kuat dan populer dengan dukungan banyak format.                                       |
| vlc-plugin-bittorrent             |    ❌     |    ✅    |   ✅   | Plugin VLC untuk memutar video langsung dari berkas torrent.                                             |
| vlc-plugin-samba                  |    ❌     |    ✅    |   ✅   | Plugin VLC untuk mengakses berkas di network share Samba (Windows).                                      |
| vlc-l10n                          |    ❌     |    ✅    |   ✅   | Paket lokalisasi untuk antarmuka VLC.                                                                    |
| gimp                              |    ❌     |    ❌    |   ✅   | Editor grafis raster yang kuat, alternatif Adobe Photoshop.                                              |
| obs-studio                        |    ❌     |    ❌    |   ✅   | Program untuk merekam dan streaming video dari layar dan sumber lain.                                    |
| obs-plugins                       |    ❌     |    ❌    |   ✅   | Plugin dan efek tambahan untuk OBS Studio.                                                              |
| inkscape                          |    ❌     |    ❌    |   ✅   | Editor grafis vektor profesional, alternatif Adobe Illustrator.                                          |
| blender                           |    ❌     |    ❌    |   ✅   | Suite profesional untuk grafis 3D, animasi, dan pembuatan video.                                        |
| audacity                          |    ❌     |    ❌    |   ✅   | Editor audio populer untuk merekam dan memproses suara.                                                  |
| rawtherapee                       |    ❌     |    ❌    |   ✅   | Editor lanjutan untuk memproses foto RAW.                                                               |
| **Office and Documents**          |
| pdfarranger                       |    ❌     |    ✅    |   ✅   | Utilitas sederhana untuk menggabungkan, memisah, dan mengatur ulang halaman PDF.                        |
| libreoffice                       |    ❌     |    ❌    |   ✅   | Suite perkantoran lengkap (pengolah kata, spreadsheet, presentasi).                                     |
| libreoffice-gtk3                  |    ❌     |    ❌    |   ✅   | Integrasi LibreOffice dengan tema GTK3 untuk tampilan konsisten.                                        |
| libreoffice-style-elementary      |    ❌     |    ❌    |   ✅   | Tema ikon elementary untuk LibreOffice.                                                                 |
| fonts-open-sans                   |    ❌     |    ❌    |   ✅   | Font Open Sans yang populer dan mudah dibaca.                                                          |
| **System utilities (GUI)**        |
| gparted                           |    ❌     |    ✅    |   ✅   | Editor partisi disk berbasis grafis.                                                                   |
| gsmartcontrol                     |    ❌     |    ✅    |   ✅   | Antarmuka grafis untuk utilitas smartmontools (monitoring disk).                                       |
| baobab                            |    ❌     |    ✅    |   ✅   | Analisis penggunaan disk berbasis grafis.                                                              |
| hardinfo                          |    ❌     |    ✅    |   ✅   | Utilitas untuk mengumpulkan dan menampilkan informasi sistem dan perangkat keras secara detail.         |
| virt-manager                      |    ❌     |    ✅    |   ✅   | Antarmuka grafis untuk mengelola mesin virtual via libvirt.                                            |
| gir1.2-spiceclientgtk-3.0         |    ❌     |    ✅    |   ✅   | Library untuk integrasi protokol SPICE (akses VM remote).                                              |
| doublecmd-gtk                     |    ❌     |    ✅    |   ✅   | File manager dua panel mirip Total Commander.                                                          |
| onboard                           |    ❌     |    ✅    |   ✅   | Keyboard di layar untuk penyandang disabilitas.                                                        |
| grsync                            |    ❌     |    ✅    |   ✅   | Antarmuka grafis untuk utilitas sinkronisasi `rsync` yang kuat.                                        |
| rescuezilla                       |    ❌     |    ✅    |   ✅   | Alat sederhana untuk backup dan pemulihan disk, alternatif Clonezilla.                                 |
| kdiskmark                         |    ❌     |    ✅    |   ✅   | Alat untuk menguji performa disk, alternatif CrystalDiskMark.                                          |
| qdiskinfo                         |    ❌     |    ✅    |   ✅   | Alat untuk menampilkan informasi disk, alternatif CrystalDiskInfo.                                     |
| bleachbit                         |    ❌     |    ✅    |   ✅   | Utilitas untuk membersihkan sistem dari berkas sementara dan tidak perlu.                              |
| gtkhash                           |    ❌     |    ✅    |   ✅   | Utilitas sederhana untuk menghitung hash sum berkas.                                                   |
| czkawka / czkawka-gui             |    ❌     |    ✅    |   ✅   | Utilitas untuk mencari dan menghapus file duplikat, folder kosong, dll.                                |
| zulucrypt-gui                     |    ❌     |    ✅    |   ✅   | Antarmuka grafis untuk mengelola volume terenkripsi.                                                   |
| zulumount-gui                     |    ❌     |    ✅    |   ✅   | Antarmuka grafis untuk mount volume terenkripsi.                                                       |
| keepassxc                         |    ❌     |    ✅    |   ✅   | Manajer password lintas platform.                                                                      |
| guymager                          |    ❌     |    ✅    |   ✅   | Alat untuk penyalinan disk forensik (membuat image).                                                  |
| isomaster                         |    ❌     |    ✅    |   ✅   | Editor grafis untuk image disk ISO.                                                                    |
| qphotorec                         |    ❌     |    ✅    |   ✅   | Shell grafis untuk utilitas PhotoRec (pemulihan file).                                                |
| veracrypt                         |    ❌     |    ✅    |   ✅   | Program untuk membuat dan mengelola kontainer dan disk terenkripsi.                                    |
| wxhexeditor                       |    ❌     |    ✅    |   ✅   | Editor heksadesimal lanjutan untuk berkas besar.                                                      |
| synaptic                          |    ❌     |    ❌    |   ✅   | Manajer paket grafis klasik untuk Debian/Ubuntu.                                                      |
| eddy / eddy-handler               |    ❌     |    ❌    |   ✅   | Installer grafis sederhana untuk paket .deb lokal.                                                    |
| **Network applications (GUI)**    |
| wireshark                         |    ❌     |    ✅    |   ✅   | Analisis lalu lintas jaringan yang kuat.                                                              |
| remmina                           |    ❌     |    ✅    |   ✅   | Klien desktop jarak jauh dengan dukungan protokol RDP, VNC, SSH, dan lainnya.                         |
| remmina-plugin-rdp                |    ❌     |    ✅    |   ✅   | Plugin dukungan protokol RDP di Remmina.                                                              |
| remmina-plugin-vnc                |    ❌     |    ✅    |   ✅   | Plugin dukungan protokol VNC di Remmina.                                                              |
| gnome-nettool                     |    ❌     |    ✅    |   ✅   | Kumpulan utilitas jaringan grafis (ping, traceroute, port scan).                                      |
| zenmap                            |    ❌     |    ✅    |   ✅   | Antarmuka grafis resmi untuk pemindai jaringan nmap.                                                  |
| x11vnc                            |    ❌     |    ✅    |   ✅   | Server VNC yang memungkinkan kontrol jarak jauh sesi X saat ini.                                      |
| uget                              |    ❌     |    ✅    |   ✅   | Manajer unduhan berbasis grafis.                                                                      |
| android-file-transfer             |    ❌     |    ✅    |   ✅   | Utilitas untuk transfer file dari perangkat Android via protokol MTP.                                 |
| **Development**                   |
| codium                            |    ❌     |    ✅    |   ✅   | Build gratis dari editor VS Code tanpa telemetry Microsoft.                                           |
