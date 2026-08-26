---
updated: 2026-08-26
---

# Konfigurasi jaringan

Setelah MiniOS berjalan, NetworkManager biasanya mengelola koneksi kabel dan Wi-Fi.
Ini terpisah dari jaringan initramfs yang digunakan untuk mengunduh sistem PXE atau HTTP-ISO.
Secara khusus, parameter PXE `ip=` tidak membuat profil NetworkManager atau menetapkan alamat sesi permanen.
Lihat [Network boot](/installation/Network-Boot.md) untuk penjelasan jaringan saat boot awal.

## Konfigurasi desktop

Gunakan ikon jaringan di panel desktop untuk memilih jaringan Wi-Fi, memutuskan atau menyambungkan ulang perangkat, atau membuka editor koneksi. Untuk alamat statis kabel, edit koneksi kabel dan atur metode IPv4 ke Manual, lalu masukkan alamat dan prefix, gateway, serta server DNS. Atur metode ke Automatic (DHCP) untuk menggunakan DHCP.

Antarmuka teks menyediakan operasi umum yang sama:

```bash
nmtui
```

Pilih **Edit a connection** untuk mengubah profil dan **Activate a connection** untuk mengaktifkannya.

## NetworkManager command line

Tampilkan perangkat dan profil yang tersimpan:

```bash
nmcli device status
nmcli connection show
```

Pindai Wi-Fi dan sambungkan:

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

Perintah terakhir akan meminta kata sandi tanpa menampilkannya di command line.
Jangan memasukkan kata sandi Wi-Fi langsung ke dalam perintah, karena dapat tersimpan di riwayat shell dan mungkin terlihat oleh proses lain.

Untuk mengubah profil kabel yang ada menjadi DHCP:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Untuk menetapkan alamat IPv4 statis:

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Ganti nama profil dan alamat dengan nilai yang sesuai jaringan lokal. Koneksi jarak jauh dapat terputus segera setelah profil aktifnya diubah.

## Persistensi

NetworkManager menyimpan profil sistem di
`/etc/NetworkManager/system-connections/`. Pada live boot tanpa persistensi,
perubahan yang dilakukan melalui desktop, `nmcli`, atau `nmtui` akan hilang saat shutdown. Pada sesi persisten, perubahan tersebut tetap ada di sesi tersebut setelah reboot. Lihat [Session management](/configuration/Session-Management.md) untuk memilih dan menyimpan sesi.

Profil tidak dibagikan secara otomatis antar sesi persisten yang terpisah.
Profil Wi-Fi dapat berisi kredensial, jadi lindungi media sesi dan hapus kredensial sebelum membagikan arsip sesi atau output diagnostik.

## Pra-konfigurasi koneksi kabel

Komponen jaringan live-config MiniOS dapat membuat kebijakan IPv4 statis kabel sebelum layanan jaringan dimulai. Fitur ini ditujukan untuk sistem tanpa pengawasan atau yang telah diinstal. Fitur ini tidak mengonfigurasi Wi-Fi.

Tambahkan assignment bergaya shell ke `minios/config.conf` pada media MiniOS atau ke `/etc/live/config.conf` di sistem live:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Kutip nilai sebagai string shell dan jangan tambahkan spasi di sekitar `=`. Lihat [Configuration file](/configuration/Configuration-File.md) untuk lokasi file dan urutan prioritas, serta [live-config](/configuration/live-config.md) untuk aktivasi komponen dan opsi umum.

Opsi boot yang setara adalah:

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

Bentuk panjang `live-config.network-*` juga diterima. Ini adalah opsi live-config userspace tahap akhir, bukan sintaks PXE `ip=`.

### Metode

| Metode | Perilaku |
|--------|----------|
| Tidak diatur atau `dhcp` | Tidak melakukan perubahan dan mempertahankan pengaturan jaringan yang sudah ada pada image. Tidak membuat konfigurasi DHCP atau menghapus profil statis MiniOS sebelumnya. |
| `static` | Menulis profil IPv4 statis kabel. Prefix default ke `24`; gateway dan DNS opsional. |
| `off` | Menulis profil NetworkManager yang tidak otomatis terhubung dengan IPv4 dinonaktifkan, atau stanza ifupdown `manual`. Ini bukan saklar radio Wi-Fi. |

Hanya `static` dan `off` yang memilih antarmuka dan menulis konfigurasi. Jika `LIVE_NETWORK_INTERFACE` tidak diisi, live-config hanya akan berjalan jika hanya ada satu antarmuka kabel non-loopback yang tersedia. Antarmuka nirkabel tidak termasuk. Gunakan `ip link` atau `nmcli device status` untuk mendapatkan nama antarmuka sebenarnya pada sistem multi-antarmuka.

### Backend dan validasi

`LIVE_NETWORK_BACKEND` menerima:

| Backend | Perilaku |
|---------|----------|
| `auto` atau tidak diatur | Memilih NetworkManager dan akan menggunakan ifupdown jika diperlukan. |
| `nm` | Memerlukan NetworkManager dan menulis `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Memerlukan ifupdown dan menulis `/etc/network/interfaces.d/minios-static`. Jika NetworkManager terpasang, juga menandai antarmuka yang dipilih sebagai unmanaged di `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

Nama antarmuka hanya boleh berisi huruf, angka, `_`, `.`, `:`, dan `-`.
Alamat statis dan gateway harus berupa alamat IPv4 yang valid. Prefix harus berupa bilangan bulat dari `0` hingga `32`. DNS berupa daftar alamat IPv4 atau IPv6 yang dipisahkan koma. Nilai tidak valid, pemilihan antarmuka ambigu, dan backend yang tidak tersedia akan dilaporkan dan tidak ada stamp sukses yang ditulis.

## Mengubah kebijakan live-config persisten

Pada sistem live persisten, komponen jaringan biasanya diterapkan sekali dan mencatat keberhasilan di `/var/lib/live/config/network`. Untuk menerapkan pengaturan statis atau off yang diubah:

1. Edit `/etc/live/config.conf` persisten yang efektif.
2. Hapus stamp dengan `sudo rm /var/lib/live/config/network`.
3. Reboot.

Mengubah hanya konfigurasi pada media removable tidak akan menimpa `/etc/live/config.conf` persisten yang sudah ada.

Mengatur `LIVE_NETWORK_METHOD="dhcp"` bukanlah reset profil. Untuk kembali dari profil statis yang dikelola MiniOS ke DHCP NetworkManager normal, hapus kebijakan statis `LIVE_NETWORK_*` dari konfigurasi efektif, hapus profil yang dikelola dan stamp, lalu reboot:

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Untuk backend ifupdown, hapus `/etc/network/interfaces.d/minios-static` dan `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. Setelah itu, buat atau aktifkan profil DHCP dengan editor desktop, `nmtui`, atau `nmcli` jika NetworkManager tidak membuatnya secara otomatis.

## Perilaku installer

Langkah Network pada installer hanya berlaku untuk jaringan kabel. Pengaturan IPv4 statis yang dipilih akan ditulis untuk sistem yang diinstal. Memilih DHCP akan mempertahankan pengaturan default normal tanpa menulis reset profil. Profil Wi-Fi dan pengaturan Wi-Fi yang ada tidak diubah.

## Diagnostik

Mulailah dengan memeriksa perangkat, alamat, rute, dan status NetworkManager:

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Periksa log boot saat ini untuk error perangkat, firmware, DHCP, dan live-config:

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Untuk kebijakan live-config, juga verifikasi pengaturan efektif, file yang dihasilkan, dan stamp. Log utama live-config adalah `/var/log/live/config.log`.

Uji kegagalan secara berurutan: status link, alamat pada antarmuka, rute dan gateway default, alamat IP eksternal, dan terakhir nama DNS. Ini membantu memisahkan masalah perangkat atau firmware dari masalah DHCP, routing, dan DNS. Lihat [Troubleshooting](/administration/Troubleshooting.md) untuk pemeriksaan lebih lanjut dan pengumpulan log.

## Lihat juga

- [Network boot](/installation/Network-Boot.md)
- [Configuration file](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Troubleshooting](/administration/Troubleshooting.md)
- [Session management](/configuration/Session-Management.md)
