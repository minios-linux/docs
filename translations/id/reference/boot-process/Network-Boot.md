---
updated: 2026-08-26
---

# Boot jaringan

Halaman ini menjelaskan **cara memuat MiniOS melalui jaringan**: PXE (kernel + initrd + data MiniOS) dan ISO HTTP (`from=http://…`). Itulah satu-satunya fungsi jaringan di initramfs MiniOS.

Ini **bukan** tentang:

- Mengonfigurasi NetworkManager atau IP statis permanen setelah sistem aktif
- Wi-Fi di initrd
- [live-config](/reference/configuration/live-config) (userspace tahap akhir)

Jaringan sesi setelah boot merupakan hal terpisah. Untuk IP statis kabel yang persisten, gunakan langkah Jaringan di installer, NetworkManager, atau ifupdown—bukan parameter PXE `ip=` parameter.

Terkait: [Parameter boot](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Ringkasan

| Mode | Yang di-boot | Cara memperoleh data MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd dari server boot jaringan | Tidak kosong `ip=` tanpa `from=http://…` → initrd mengunduh file MiniOS dari server data PXE |
| **ISO HTTP** | Kernel + initrd dari media lokal **atau** PXE | `from=http://…/minios.iso` → initrd mengaktifkan jaringan dan memasang ISO menggunakan `httpfs2` |
| **Media lokal** | USB / ISO / disk | Tidak ada jaringan initrd; hanya pencarian lokal |

Pembuat initramfs: **LiveKit** (`livekit-mos`) atau **dracut** (`dracut-mos`). Keduanya menggunakan helper jaringan LiveKit yang sama untuk pengambilan data tahap awal.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` lebih diprioritaskan daripada `ip=`. Dalam mode tersebut, `ip=` menyediakan konfigurasi alamat statis untuk koneksi ISO HTTP. Jika tidak, nilai `ip=` yang tidak kosong akan memilih **jalur data PXE** dan melewati media lokal. Jangan tambahkan `ip=` saat boot USB/ISO biasa hanya untuk "mengatur alamat statis." Kedua jalur jaringan tidak akan beralih ke media lokal jika penemuan atau pengunduhan gagal.

## Persyaratan

| Persyaratan | Catatan |
|-------------|--------|
| Ethernet kabel (atau virtio/vmxnet di VM) | Antarmuka non-loopback pertama yang terdeteksi akan digunakan; status koneksi dan keterjangkauan tidak diperiksa, serta tidak ada pemilihan `BOOTIF` / `ethdevice` di initrd |
| Initrd dengan modul jaringan | Dibuat untuk varian paket selain nilai internal `minimum` (`--network`, biasanya `--cloud`) |
| Tidak bergantung pada Wi-Fi | Jaringan nirkabel tidak didukung pada jalur boot jaringan |
| Sebaiknya gunakan NIC tanpa firmware blob | Kartu yang bergantung pada firmware sering gagal di initrd |
| Sebaiknya gunakan **Standard** atau image yang lebih besar | Edisi **Flux** tidak menyertakan modul NIC jaringan, sehingga PXE / ISO HTTP pada praktiknya tidak didukung |
| Hanya HTTP untuk URL ISO | `from=http://…` berfungsi; **`https://` tidak didukung** |

Tool di initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, dan `@mount.httpfs2`. Tidak ada NetworkManager di initrd.

## Boot PXE

### Alur

1. Firmware / server PXE memuat MiniOS **kernel** dan **initrd** (pxelinux, iPXE, dll.—di luar MiniOS itu sendiri).
2. Baris perintah kernel menyertakan **`ip=`** (dan biasanya `boot=live` untuk boot MiniOS lengkap).
3. Initrd mengonfigurasi alamat statis dari `ip=`, menghubungi **server** field, mengunduh daftar file, lalu MiniOS bundel/file.
4. Sistem melanjutkan ke root live seperti biasa.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Kolom | Fungsi |
|-------|------|
| client-ip | Alamat yang ditetapkan menggunakan busybox `ifconfig` |
| server-ip | Host untuk data MiniOS HTTP/TFTP; juga ditulis sebagai nameserver DNS di initrd |
| gateway-ip | Rute default; juga ditulis sebagai nameserver DNS |
| netmask | Netmask IPv4 bertitik (bukan panjang prefiks CIDR) |
| port | Port HTTP opsional untuk daftar file dan file (default **7529**) |

Contoh:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Cara mengambil file

1. **HTTP** (direkomendasikan): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` lalu setiap jalur yang tercantum dalam file tersebut dari host/port yang sama.
2. **TFTP**: busybox `tftp` hanya dipilih jika permintaan HTTP awal untuk `PXEFILELIST` gagal. Kegagalan pengunduhan file melalui HTTP setelahnya tidak akan mengalihkan transfer ke TFTP.

Port default adalah **7529** jika kolom kelima tidak diisi.

### Yang `ip=` bukan

| Ekspektasi | Kenyataan |
|-------------|---------|
| Format kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Tidak didukung** — salah diurai sebagai alamat klien |
| IP statis untuk seluruh sesi live | **Tidak didukung** — setelah boot, NetworkManager (atau sejenisnya) mengelola antarmuka |
| IP statis saat memuat data MiniOS dari USB/ISO | **Jangan gunakan** — tanpa `from=http://…`, pemaksaan pengunduhan data PXE akan terjadi |
| Daftar DNS khusus | Hanya gateway + server yang digunakan sebagai nameserver di initrd |

## Boot ISO HTTP (`from=http://…`)

Muat data MiniOS dari ISO jarak jauh tanpa daftar file PXE lengkap:

```text
from=http://192.168.1.1/path/minios.iso
```

Cara kerja:

1. Initrd mengaktifkan jaringan:
   - Jika **`ip=`** disetel → konfigurasi statis seperti di atas
   - Jika **`ip=`** tidak ditentukan → **DHCP** melalui busybox `udhcpc`
2. Mengaitkan ISO jarak jauh menggunakan **`httpfs2`**
3. Terus mencari konten MiniOS pada mount tersebut

Opsional **`cache=`** (megabyte) mengaktifkan cache unduhan httpfs, misalnya `cache=512`.

Hanya **`http://`** yang diterima untuk jalur ISO jarak jauh ini. **`https://` tidak didukung.**

## Setelah sistem live dimulai

| Item | Setelah switch\_root |
|------|-------------------|
| IP/rute kernel pada NIC | Mungkin tetap ada hingga userspace mengonfigurasi ulang antarmuka |
| DNS initrd (`resolv.conf`) | Bukan kebijakan sesi yang persisten |
| Jaringan sesi | Biasanya **NetworkManager** pada image MiniOS default |
| Arti `ip=` | Hanya untuk pengambilan awal — bukan profil statis yang disimpan |

Jika root masih disediakan oleh **httpfs**, NetworkManager yang mengonfigurasi ulang NIC dapat mengganggu root live. Rencanakan deployment boot jaringan dengan mempertimbangkan hal ini (misalnya, salin ke RAM / hindari menimpa antarmuka pengambilan jika memungkinkan).

Userspace yang berjalan belakangan, **live-config** mungkin hanya mengaktifkan jaringan sebentar untuk mengunduh hook/preseed jarak jauh (`Setup_network`). Hal ini tidak terkait dengan PXE/`ip=` pengalamatan persisten.

## Kesalahan umum

1. Menambahkan `ip=` pada baris perintah USB/ISO "untuk IP statis" → sistem mencoba mengunduh melalui PXE alih-alih menggunakan media lokal, kecuali `from=http://…` memilih boot ISO HTTP terlebih dahulu.
2. Menggunakan `ip=dhcp` atau sintaks kernel `ip=` lainnya → parser yang salah, konfigurasi alamat gagal.
3. Mengharapkan pemilihan `BOOTIF` Wi-Fi atau multi-NIC di initrd → belum diimplementasikan.
4. Menggunakan image **Flux** untuk PXE/ISO HTTP → modul jaringan tidak ada di initrd.
5. Menyediakan ISO hanya melalui HTTPS → `from=http://…` tidak akan cocok.
6. Mengira ini sama dengan konfigurasi statis installer/NetworkManager setelah login.

## Ringkasan keandalan

| Skenario | Penilaian |
|----------|------------|
| PXE + `ip=…` + daftar HTTP pada port 7529 (atau TFTP jika permintaan daftar HTTP gagal), kabel sederhana / virtio | Target yang didukung |
| `from=http://…iso` + DHCP (atau `ip=`), kelas NIC yang sama | Biasanya berfungsi |
| Boot USB/ISO biasa | Jaringan initrd tidak digunakan |
| Statis sesi melalui `ip=` | Tidak didukung |
| Multi-NIC / NIC firmware / Wi-Fi / `https://` / edisi Flux | Kurang andal atau tidak didukung |

## Referensi implementasi

| Bagian | Lokasi dalam tree MiniOS |
|-------|-----------------------------|
| Entri init | `linux-live/initramfs/livekit-mos/init` |
| Jaringan + PXE + ISO HTTP | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Builder LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modul Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Saat `-n` diteruskan | `linux-live/build-initramfs` (non-minimal) |

## Lihat juga

- [Parameter boot](/reference/Boot-Parameters) — tabel parameter lengkap (`ip`, `from`, `cache`, …)
- [Penemuan sistem initrd](/reference/boot-process/System-Discovery) — prioritas sumber, penemuan lokal, dan perilaku saat terjadi kegagalan
- [live-config](/reference/configuration/live-config) — konfigurasi userspace tahap akhir (bukan boot jaringan)
- [Arsitektur sistem](/reference/System-Architecture)
- [Membangun MiniOS](/development/Building-MiniOS) — builder initramfs (`livekit` / `dracut`)
