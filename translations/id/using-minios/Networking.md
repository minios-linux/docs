---
updated: 2026-08-31
---

# Jaringan

MiniOS menggunakan **NetworkManager** untuk koneksi jaringan kabel dan Wi-Fi secara normal. MiniOS tidak menggantikan model koneksi tersebut dengan sistem konfigurasi jaringan terpisah.

Untuk penggunaan sehari-hari, buka ikon jaringan di panel desktop. Alat standar NetworkManager juga tersedia:

```bash
nmtui
nmcli
```

Gunakan alat ini untuk menghubungkan ke Wi-Fi, berpindah jaringan, mengatur DHCP atau alamat statis, DNS, koneksi VPN, dan pengaturan jaringan lain saat runtime. Untuk perilaku lengkapnya, silakan lihat dokumentasi dan manual NetworkManager.

Pada sesi persisten MiniOS, profil koneksi NetworkManager akan disimpan sebagai bagian dari sesi tersebut. Pada **Mulai tanpa menyimpan**, perubahan akan hilang saat shutdown.

## Pra-konfigurasi jaringan

Pengaturan jaringan khusus MiniOS terutama berupa **pra-konfigurasi**. Ini berguna ketika sebuah image, installer, atau deployment tanpa pengawasan perlu memulai dengan konfigurasi kabel yang sudah diketahui sebelum pengguna membuka NetworkManager.

Komponen jaringan MiniOS `live-config` mendukung pra-konfigurasi IPv4 kabel. Tidak mendukung pra-konfigurasi Wi-Fi.

Contoh statis di `config.conf` adalah:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` menerima `dhcp`, `static`, atau `off`. Jika tidak diatur dan `dhcp`, maka pengaturan jaringan yang sudah ada pada image akan dipertahankan, bukan menggantikan perilaku normal NetworkManager. `static` menulis konfigurasi IPv4 statis kabel; `off` menyiapkan antarmuka kabel terpilih agar tidak terhubung otomatis. Dengan `LIVE_NETWORK_BACKEND="auto"`, MiniOS akan lebih memilih NetworkManager dan menggunakan ifupdown jika diperlukan. Jika tidak ada antarmuka yang ditentukan, pra-konfigurasi hanya diterapkan jika hanya ada satu antarmuka kabel yang memenuhi syarat.

Lihat [Berkas konfigurasi](/reference/configuration/config.conf) untuk lokasi penyimpanan pengaturan ini dan [live-config](/reference/configuration/live-config) untuk referensi lengkap variabel dan komponen.

## Kapan pra-konfigurasi diterapkan

Komponen jaringan adalah langkah setup `live-config` satu kali. Setelah berhasil dijalankan dalam sesi persisten, perubahan jaringan selanjutnya sebaiknya dilakukan melalui NetworkManager, bukan dengan terus-menerus mengedit pra-konfigurasi.

Jika Anda memang perlu menerapkan perubahan pra-konfigurasi jaringan MiniOS pada sesi persisten yang sama, hapus penanda penyelesaian dan reboot:

```bash
sudo rm -f /var/lib/live/config/network
```

Lakukan ini hanya jika Anda benar-benar ingin `live-config` membuat kebijakan kabel ulang. Mengubah koneksi Wi-Fi atau Ethernet biasa tidak memerlukannya.

## Pra-konfigurasi penginstal

Langkah jaringan MiniOS juga melakukan pra-konfigurasi untuk sistem target. Mendukung pengaturan DHCP kabel atau IPv4 statis. Pengaturan Wi-Fi akan dikelola oleh NetworkManager setelah sistem terpasang dijalankan.

## Jaringan saat boot awal berbeda

NetworkManager mengonfigurasi sistem MiniOS yang sedang berjalan. Jaringan yang digunakan initramfs untuk mendapatkan MiniOS sendiri merupakan mekanisme terpisah.

Parameter boot `ip=`, unduhan PXE, dan `from=http://...` tidak membuat profil NetworkManager dan tidak boleh digunakan untuk mengatur jaringan desktop normal. Lihat [Network boot](/reference/boot-process/Network-Boot).

## Pemecahan masalah

Untuk masalah koneksi biasa, mulai dengan NetworkManager itu sendiri:

```bash
nmcli device status
nmcli connection show --active
```

Gunakan editor koneksi desktop, `nmtui`, atau log dan dokumentasi NetworkManager standar untuk masalah Wi-Fi, DHCP, DNS, VPN, atau Ethernet.

Diagnostik khusus MiniOS relevan jika masalah berkaitan dengan pra-konfigurasi jaringan atau network boot. Log `live-config` adalah `/var/log/live/config.log`; masalah network boot awal dibahas di panduan [Network boot](/reference/boot-process/Network-Boot).

## Dokumentasi terkait

- [Berkas konfigurasi](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Network boot](/reference/boot-process/Network-Boot)
- [Manajemen sesi](/using-minios/Sessions-and-Persistence)
