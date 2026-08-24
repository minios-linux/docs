# Paket dan edisi

Konten paket MiniOS dihasilkan dari daftar sumber bersyarat. Daftar ini dapat berbeda tergantung pada suite distribusi, arsitektur, sistem init, lingkungan desktop, lokal, opsi kernel, dan ketersediaan repositori. Halaman ini menjelaskan pewarisan edisi dan contoh isi representatif; ini bukanlah tabel paket rilis yang lengkap.

## Pewarisan edisi

Varian paket membentuk urutan aditif:

1. **Minimum** menyediakan sistem live umum dan desktop terkecil yang dipilih.
2. **Standard** mewarisi Minimum dan menambahkan alat administrasi umum, desktop, dan manajemen MiniOS.
3. **Toolbox** mewarisi Standard dan menambahkan alat pemulihan, diagnostik, penyimpanan, jaringan, dan virtualisasi.
4. **Ultra** mewarisi Toolbox dan menambahkan perangkat lunak workstation, media, perkantoran, dan kontainer yang lebih luas.

Ekspresi bersyarat dapat memilih alternatif atau menghilangkan paket untuk suite, arsitektur, lingkungan, atau opsi build tertentu. Nama paket yang disebutkan di bawah ini adalah representatif dari daftar sumber saat ini, bukan jaminan bahwa nama paket biner Debian yang sama tersedia di setiap rilis MiniOS.

## Cakupan desktop dan lingkungan

Paket desktop berasal dari rantai modul berurutan lingkungan yang dipilih. Lingkungan Xfce, Fluxbox, LXQt, core, dan debug tidak memiliki set modul atau paket yang identik. Contoh di bawah ini menggunakan daftar Xfce saat ini kecuali jika suatu kemampuan berasal dari daftar core bersama. Build konsol atau desktop lain harus diperiksa secara terpisah.

## Contoh isi representatif

### Minimum

Komposisi Minimum umum mencakup konfigurasi live MiniOS dan alat pembuatan image, NetworkManager, SSH, dukungan keyboard dan lokal, firmware yang dipilih untuk target, serta utilitas untuk inspeksi perangkat keras dan tugas penyimpanan umum. Paket representatif meliputi `minios-tools`, `minios-image-compose`, `minios-live-config`, `pciutils`, `usbutils`, `smartmontools`, `dosfstools`, `ntfs-3g`, `btrfs-progs`, `xorriso`, `squashfs-tools`, `zstd`, `rfkill`, dan `wpasupplicant`.

Rantai Minimum Xfce menambahkan Xorg, Blackbox atau Openbox sesuai pilihan daftar sumber, Thunar, Mousepad, panel Xfce, sesi, pengaturan, komponen desktop dan window manager, applet desktop NetworkManager, kontrol ALSA, Xarchiver, dukungan baterai, serta Firefox atau Firefox ESR sesuai keluarga distribusi.

Utilitas MiniOS yang ada di setiap edisi, termasuk Xfce Minimum, adalah `minios-tools`, `minios-image-compose`, `minios-live-config`, integrasi systemd atau SysV init yang sesuai, `minios-live-config-doc`, dan `minios-welcome`.

### Standard

Standard menambahkan kapabilitas bersama seperti dukungan DNS, alat kompresi dan sistem berkas tambahan, klien sistem berkas jaringan, FUSE, partisi, dan pembuatan ISO. Paket representatif meliputi `dnsmasq-base`, `ncdu`, `lsof`, `xfsprogs`, `exfatprogs` atau alternatif khusus suite-nya, `cifs-utils`, `nfs-common`, `parted`, `7zip`, dan `genisoimage`.

Pada Xfce, edisi Standard dan selanjutnya menambahkan utilitas grafis dan administrasi MiniOS terkini: `minios-configurator`, `minios-installer`, `minios-session-manager`, `minios-kernel-manager`, `minios-store`, `minios-store-gui`, `minios-image-builder`, `minios-module-manager`, dan `driveutility`. Juga ditambahkan LightDM, integrasi audio desktop dan Bluetooth, screenshot, manajemen tugas, notifikasi, dan terminal Xfce.

### Toolbox

Toolbox menambahkan kapabilitas command-line untuk penyimpanan, pemulihan, performa, jaringan, dan mesin virtual. Contoh saat ini termasuk alat LVM dan LUKS, Clonezilla, Partclone, TestDisk, `gddrescue`, alat ZFS jika build mendukungnya, Nmap, iperf3, QEMU, libvirt, guest agent, fio, sysbench, dan pelaporan perangkat keras.

Modul aplikasi Xfce menambahkan alat representatif seperti GParted, GSmartControl, Guymager, utilitas Rescue dan disk, Wireshark, Remmina, Virt Manager, VLC, KeePassXC, PDF Arranger, Codium, BleachBit, dan alat enkripsi grafis. Nama pasti bergantung pada suite; misalnya, daftar sumber dapat menggunakan salah satu dari beberapa alternatif paket.

### Ultra

Ultra mempertahankan set Toolbox dan menambahkan perangkat lunak kontainer serta workstation. Penambahan bersama yang representatif meliputi paket Docker yang dipilih untuk repositori target, dukungan Compose, `lazydocker`, alat iSCSI, dan utilitas user-namespace. Daftar aplikasi Xfce saat ini menambahkan LibreOffice, GIMP, Inkscape, Blender, Audacity, OBS Studio, RawTherapee, Synaptic, dan paket integrasi desktop terkait.

## Periksa isi rilis secara tepat

Sistem yang sedang berjalan adalah referensi utama untuk paket yang benar-benar terpasang pada rilis tersebut. Daftar nama dan versi paket dengan:

```bash
dpkg-query -W -f='${binary:Package}\t${Version}\n' | sort
```

Periksa modul berurutan yang membentuk root berjalan secara terpisah dari file yang dipilih untuk boot berikutnya. MiniOS Module Manager menampilkan ini sebagai **Sedang berjalan** dan **Boot berikutnya**. Dari shell, mount SquashFS runtime dapat dilihat dengan:

```bash
findmnt -rn -t squashfs -o TARGET,SOURCE
```

Untuk media offline atau ISO yang sudah di-mount, inventarisasi file modul sumber secara langsung:

```bash
find /path/to/media/minios -type f -name '*.sb' -printf '%P\n' | sort -n
```

Untuk build sumber, file dan direktori berikut adalah manifest sumber dan input seleksi yang sah:

- `linux-live/environments/<environment>/` untuk rantai modul berurutan.
- `linux-live/scripts/00-core/packages.list` untuk seleksi edisi bersama.
- `linux-live/scripts/01-kernel/packages.list` dan `02-firmware/packages.list` untuk penambahan kernel dan firmware bersyarat.
- `packages.list` pada setiap modul desktop dan aplikasi yang dipilih.
- `linux-live/build.conf` untuk suite, arsitektur, lingkungan, varian paket, sistem init, kernel, lokal, dan nilai filter lainnya.
- `linux-live/condinapt.map` untuk arti prefiks filter daftar paket.

Daftar sumber menjelaskan paket dan alternatif yang diminta. Hanya image yang telah selesai dan `dpkg-query` yang menampilkan set dependensi dan versi yang telah ter-resolve secara pasti untuk rilis tertentu. Ketersediaan dan nama paket dapat berubah antara suite Debian, Ubuntu, dan Devuan serta antar lingkungan desktop.

Lihat [Arsitektur sistem](/about/System-Architecture.md) untuk urutan modul dan [CondinAPT di MiniOS](/development/CondinAPT-MiniOS.md) untuk seleksi paket bersyarat.
