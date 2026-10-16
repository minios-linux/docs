---
updated: 2026-08-31
---

# Jaringan

MiniOS menggunakan **NetworkManager** untuk jaringan kabel dan Wi-Fi biasa. MiniOS tidak mengganti model koneksinya dengan sistem konfigurasi jaringan terpisah.

Untuk penggunaan sehari-hari, buka ikon jaringan di panel desktop. Alat NetworkManager standar juga tersedia:

```bash
nmtui
nmcli
```

Gunakan alat-alat ini untuk terhubung ke Wi-Fi, beralih jaringan, mengonfigurasi DHCP atau alamat statis, DNS, koneksi VPN, serta kebutuhan jaringan lainnya saat sistem berjalan. Untuk mengetahui semua fungsinya, lihat dokumentasi dan halaman manual NetworkManager.

Dalam sesi MiniOS yang persisten, profil koneksi NetworkManager disimpan sebagai bagian dari sesi tersebut. Di **Mulai tanpa menyimpan**, perubahan akan hilang saat sistem dimatikan.

## Pra-konfigurasi jaringan

Pengaturan jaringan khusus MiniOS terutama dilakukan melalui **pra-konfigurasi**. Pengaturan ini berguna ketika image, penginstal, atau deployment tanpa pengawasan perlu memulai dengan konfigurasi kabel yang sudah ditentukan sebelum pengguna membuka NetworkManager.

Komponen MiniOS `live-config` jaringan mendukung pra-konfigurasi IPv4 kabel. Wi-Fi tidak dikonfigurasi sebelumnya.

Contoh konfigurasi statis di `config.conf` adalah:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD`menerima `dhcp`, `static`, atau `off`. Nilai yang tidak ditetapkan dan `dhcp` mempertahankan konfigurasi jaringan yang sudah ada pada image, alih-alih mengganti perilaku NetworkManager biasa. `static`menulis konfigurasi IPv4 statis kabel; `off`menyiapkan antarmuka kabel yang dipilih agar tidak terhubung secara otomatis. Dengan `LIVE_NETWORK_BACKEND="auto"`, MiniOS mengutamakan NetworkManager dan menggunakan ifupdown sebagai alternatif bila diperlukan. Jika antarmuka tidak ditentukan, pra-konfigurasi hanya diterapkan jika tepat satu antarmuka kabel yang memenuhi syarat dapat diidentifikasi.

Lihat [File konfigurasi](/reference/configuration/config.conf) untuk mengetahui lokasi penyimpanan pengaturan ini, dan [live-config](/reference/configuration/live-config) untuk referensi lengkap variabel dan komponennya.

## Kapan pra-konfigurasi diterapkan

Komponen jaringan merupakan langkah penyiapan `live-config` satu kali. Setelah berhasil dijalankan dalam sesi persisten, perubahan jaringan sehari-hari sebaiknya dilakukan melalui NetworkManager, bukan dengan mengedit pra-konfigurasi berulang kali.

Jika Anda memang perlu menerapkan pra-konfigurasi jaringan MiniOS yang telah diubah ke sesi persisten yang sama, hapus penanda penyelesaiannya lalu reboot:

```bash
sudo rm -f /var/lib/live/config/network
```

Lakukan ini hanya jika Anda memang ingin `live-config` membuat ulang kebijakan jaringan kabel. Perubahan koneksi Wi-Fi atau Ethernet biasa tidak memerlukannya.

## Pra-konfigurasi penginstal

Langkah jaringan pada Penginstal MiniOS juga melakukan pra-konfigurasi untuk sistem target. Langkah ini mendukung DHCP kabel atau pengaturan IPv4 statis. Wi-Fi akan ditangani oleh NetworkManager setelah sistem terpasang dijalankan.

## Jaringan saat proses boot awal berbeda

NetworkManager mengonfigurasi sistem MiniOS yang sedang berjalan. Jaringan yang digunakan initramfs untuk mendapatkan MiniOS itu sendiri menggunakan mekanisme terpisah.

Parameter boot `ip=`, unduhan PXE, dan `from=http://...` karena itu tidak membuat profil NetworkManager dan tidak boleh digunakan untuk mengonfigurasi jaringan desktop biasa. Lihat [Boot jaringan](/reference/boot-process/Network-Boot).

## Pemecahan masalah

Untuk masalah koneksi biasa, mulailah dengan NetworkManager itu sendiri:

```bash
nmcli device status
nmcli connection show --active
```

Gunakan editor koneksi desktop, `nmtui`, atau log dan dokumentasi standar NetworkManager untuk masalah Wi-Fi, DHCP, DNS, VPN, atau Ethernet biasa.

Diagnostik khusus MiniOS relevan jika masalahnya berkaitan dengan prakonfigurasi jaringan atau boot jaringan. Log `live-config` tersimpan di `/var/log/live/config.log`; masalah boot jaringan awal dibahas dalam panduan [Boot jaringan](/reference/boot-process/Network-Boot).

## Dokumentasi terkait

- [File konfigurasi](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Boot jaringan](/reference/boot-process/Network-Boot)
- [Pengelolaan sesi](/using-minios/Sessions-and-Persistence)
