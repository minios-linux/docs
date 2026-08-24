# Network boot

Halaman ini menjelaskan **cara memuat MiniOS melalui jaringan**: PXE (kernel + initrd + data MiniOS) dan HTTP ISO (`from=http://…`). Ini adalah satu-satunya tujuan penggunaan jaringan di dalam initramfs MiniOS.

Ini **bukan** membahas:

- Konfigurasi NetworkManager atau IP statis permanen setelah sistem berjalan
- Wi‑Fi di initrd
- [live-config](/configuration/live-config.md) (userspace tahap akhir)

Jaringan sesi setelah boot terpisah. Untuk IP statis kabel yang permanen, gunakan langkah Network pada installer, NetworkManager, atau ifupdown—bukan parameter PXE `ip=`.

Terkait: [Boot parameters](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Ikhtisar

| Mode | Apa yang di-boot | Cara memperoleh data MiniOS |
|------|------------------|------------------------------|
| **PXE** | Kernel + initrd dari server boot jaringan | `ip=` tidak kosong → initrd mengunduh file MiniOS dari server data PXE (HTTP lebih disarankan, fallback ke TFTP) |
| **HTTP ISO** | Kernel + initrd dari media lokal **atau** PXE | `from=http://…/minios.iso` → initrd mengaktifkan jaringan dan me-mount ISO dengan `httpfs2` |
| **Media lokal** | USB / ISO / disk | Tidak ada jaringan di initrd; hanya pencarian lokal |

Builder initramfs: **LiveKit** (`livekit-mos`) atau **dracut** (`dracut-mos`). Keduanya menggunakan helper jaringan LiveKit yang sama untuk pengambilan awal.

```text
find_data()
  ├─ from=http://…     → configure network → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

**Penting:** setiap `ip=` yang tidak kosong akan memilih **jalur data PXE** dan **melewati media lokal**. Jangan tambahkan `ip=` pada boot USB/ISO normal hanya untuk “mengatur alamat statis.”

## Persyaratan

| Persyaratan | Catatan |
|-------------|--------|
| Ethernet kabel (atau virtio/vmxnet di VM) | Antarmuka pertama yang dapat digunakan selain loopback yang dipakai; tidak ada pemilihan `BOOTIF` / `ethdevice` di initrd |
| Initrd dengan modul jaringan | Dibangun untuk varian paket non-**minimum** (`--network`, seringkali `--cloud`) |
| Tidak bergantung pada Wi‑Fi | Wireless tidak didukung pada jalur boot jaringan |
| Disarankan NIC tanpa firmware blob | Kartu yang bergantung pada firmware sering gagal di initrd |
| Disarankan image **standard+** | **minimum** tidak menyertakan modul NIC jaringan → PXE / HTTP ISO pada dasarnya tidak didukung |
| Hanya HTTP untuk URL ISO | `from=http://…` berfungsi; **`https://` tidak didukung** |

Alat di initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, dan `@mount.httpfs2`. Tidak ada NetworkManager di initrd.

## Boot PXE

### Alur

1. Firmware / server PXE memuat **kernel** dan **initrd** MiniOS (pxelinux, iPXE, dll.—di luar MiniOS sendiri).
2. Kernel cmdline menyertakan **`ip=`** yang tidak kosong (dan biasanya `boot=live` untuk boot MiniOS penuh).
3. Initrd mengonfigurasi alamat statis dari `ip=`, menghubungi field **server**, mengunduh daftar file, lalu bundle/file MiniOS.
4. Sistem melanjutkan ke live root seperti biasa.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Field | Peran |
|-------|-------|
| client-ip | Alamat yang diberikan dengan busybox `ifconfig` |
| server-ip | Host untuk data MiniOS HTTP/TFTP; juga ditulis sebagai nameserver DNS di initrd |
| gateway-ip | Rute default; juga ditulis sebagai nameserver DNS |
| netmask | Netmask IPv4 bertitik (bukan panjang prefix CIDR) |
| port | Port HTTP opsional untuk daftar file dan file (default **7529**) |

Contoh:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Cara file diambil

1. **HTTP** (disarankan):  
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`  
   lalu setiap path yang terdaftar di file tersebut dari host/port yang sama.
2. **TFTP** (fallback jika HTTP gagal): busybox `tftp` untuk `PXEFILELIST` dan file yang terdaftar.

Port default adalah **7529** jika field kelima tidak diisi.

### Apa yang **bukan** `ip=`

| Ekspektasi | Realita |
|------------|---------|
| Bentuk kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Tidak didukung** — salah parsing sebagai alamat klien |
| IP statis untuk seluruh sesi live | **Tidak didukung** — setelah boot, NetworkManager (atau serupa) yang mengelola antarmuka |
| IP statis saat masih boot dari USB/ISO | **Jangan gunakan** — memaksa unduh data PXE |
| Daftar DNS khusus | Hanya gateway + server yang digunakan sebagai nameserver di initrd |

## Boot HTTP ISO (`from=http://…`)

Memuat data MiniOS dari ISO remote tanpa daftar file PXE penuh:

```text
from=http://192.168.1.1/path/minios.iso
```

Perilaku:

1. Initrd mengaktifkan jaringan:
   - Jika **`ip=`** diatur → konfigurasi statis seperti di atas
   - Jika **`ip=`** tidak diatur → **DHCP** via busybox `udhcpc`
2. Me-mount ISO remote dengan **`httpfs2`**
3. Melanjutkan pencarian konten MiniOS di mount tersebut

Opsional **`cache=`** (dalam megabyte) mengaktifkan cache unduhan httpfs, misal `cache=512`.

Hanya **`http://`** yang diterima untuk jalur ISO remote ini. **`https://` tidak didukung.**

## Setelah sistem live berjalan

| Item | Setelah switch_root |
|------|---------------------|
| IP/rute kernel pada NIC | Bisa tetap ada sampai userspace mengonfigurasi ulang antarmuka |
| DNS initrd (`resolv.conf`) | Bukan kebijakan sesi yang permanen |
| Jaringan sesi | Biasanya **NetworkManager** pada image MiniOS default |
| Arti `ip=` | Hanya untuk pengambilan awal — bukan profil statis yang diingat |

Jika root masih menggunakan **httpfs**, NetworkManager yang mengonfigurasi ulang NIC dapat mengganggu live root. Rencanakan deployment boot jaringan dengan pertimbangan ini (misal salin ke RAM / hindari mengubah antarmuka fetch jika memungkinkan).

**live-config** di userspace akhir mungkin sesekali mengaktifkan jaringan hanya untuk mengunduh hook/preseed remote (`Setup_network`). Itu tidak terkait dengan alamat PXE/`ip=` yang permanen.

## Kesalahan umum

1. Menambahkan `ip=` pada cmdline USB/ISO “untuk IP statis” → sistem mencoba unduh PXE, bukan dari media lokal.
2. Menggunakan `ip=dhcp` atau sintaks `ip=` kernel lain → parser salah, pengaturan alamat gagal.
3. Mengharapkan Wi‑Fi atau pemilihan multi-NIC `BOOTIF` di initrd → belum diimplementasikan.
4. Menggunakan image **minimum** untuk PXE/HTTP ISO → modul jaringan tidak ada di initrd.
5. Menyajikan ISO hanya lewat HTTPS → `from=http://…` tidak akan cocok.
6. Mengira ini sama dengan konfigurasi statis installer/NetworkManager setelah login.

## Ringkasan keandalan

| Skenario | Penilaian |
|----------|-----------|
| PXE + `ip=…` + daftar HTTP di :7529 (atau TFTP), kabel sederhana / virtio | Target yang didukung |
| `from=http://…iso` + DHCP (atau `ip=`), kelas NIC yang sama | Umumnya berfungsi |
| Boot USB/ISO normal | Jaringan initrd tidak digunakan |
| Sesi statis via `ip=` | Tidak didukung |
| Multi-NIC / NIC firmware / Wi‑Fi / `https://` / edisi minimum | Lemah atau tidak didukung |

## Referensi implementasi

| Komponen | Lokasi di pohon MiniOS |
|----------|------------------------|
| Init entry | `linux-live/initramfs/livekit-mos/init` |
| Network + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| LiveKit builder (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modul Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Saat `-n` dipakai | `linux-live/build-initramfs` (non-minimum) |

## Lihat juga

- [Boot parameters](/configuration/Boot-Parameters.md) — tabel parameter lengkap (`ip`, `from`, `cache`, …)
- [live-config](/configuration/live-config.md) — konfigurasi userspace tahap akhir (bukan boot jaringan)
- [System architecture](/about/System-Architecture.md)
- [Building MiniOS](/development/Building-MiniOS.md) — builder initramfs (`livekit` / `dracut`)
