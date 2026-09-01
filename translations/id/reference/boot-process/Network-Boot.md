---
updated: 2026-08-26
---

# Network boot

Halaman ini menjelaskan **cara memuat MiniOS melalui jaringan**: PXE (kernel + initrd + data MiniOS) dan HTTP ISO (`from=http://…`). Ini adalah satu-satunya tujuan penggunaan jaringan di dalam initramfs MiniOS.

Ini **bukan** membahas tentang:

- Konfigurasi NetworkManager atau pengaturan IP statis permanen setelah sistem berjalan
- Wi‑Fi di initrd
- [live-config](/reference/configuration/live-config) (userspace tahap akhir)

Jaringan sesi setelah boot terpisah. Untuk IP statis kabel yang tahan lama, gunakan langkah Network pada installer, NetworkManager, atau ifupdown—bukan parameter PXE `ip=`.

Terkait: [Boot parameters](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Ikhtisar

| Mode | Apa yang di-boot | Cara data MiniOS diperoleh |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd dari server boot jaringan | `ip=` yang tidak kosong tanpa `from=http://…` → initrd mengunduh file MiniOS dari server data PXE |
| **HTTP ISO** | Kernel + initrd dari media lokal **atau** PXE | `from=http://…/minios.iso` → initrd mengaktifkan jaringan dan me-mount ISO dengan `httpfs2` |
| **Media lokal** | USB / ISO / disk | Tidak ada jaringan initrd; hanya pencarian lokal |

Builder initramfs: **LiveKit** (`livekit-mos`) atau **dracut** (`dracut-mos`). Keduanya menggunakan helper jaringan LiveKit yang sama untuk pengambilan awal.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` memiliki prioritas dibanding `ip=`. Dalam mode ini, `ip=` menyediakan alamat statis untuk koneksi HTTP ISO. Jika tidak, setiap `ip=` yang tidak kosong akan memilih **jalur data PXE** dan melewati media lokal. Jangan tambahkan `ip=` pada boot USB/ISO normal hanya untuk "mengatur alamat statis." Kedua jalur jaringan tidak akan kembali ke media lokal jika proses penemuan atau pengunduhan gagal.

## Persyaratan

| Persyaratan | Catatan |
|-------------|--------|
| Ethernet kabel (atau virtio/vmxnet di VM) | Antarmuka non-loopback pertama yang terdeteksi akan digunakan; link dan keterjangkauan tidak diperiksa, dan tidak ada pemilihan `BOOTIF` / `ethdevice` di initrd |
| Initrd dengan modul jaringan | Dibangun untuk varian paket selain nilai internal `minimum` (`--network`, sering `--cloud`) |
| Tidak bergantung pada Wi‑Fi | Wireless tidak didukung pada jalur boot jaringan |
| Disarankan NIC tanpa firmware blob | Kartu yang bergantung pada firmware sering gagal di initrd |
| Disarankan gambar **Standard** atau lebih besar | Edisi **Flux** tidak menyertakan modul NIC jaringan, sehingga PXE / HTTP ISO pada dasarnya tidak didukung |
| Hanya HTTP untuk URL ISO | `from=http://…` berfungsi; **`https://` tidak didukung** |

Alat di initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, dan `@mount.httpfs2`. Tidak ada NetworkManager di initrd.

## Boot PXE

### Alur

1. Firmware / server PXE memuat **kernel** dan **initrd** MiniOS (pxelinux, iPXE, dll.—di luar MiniOS itu sendiri).
2. Kernel cmdline menyertakan **`ip=`** yang tidak kosong (dan biasanya `boot=live` untuk boot MiniOS penuh).
3. Initrd mengonfigurasi alamat statis dari `ip=`, menghubungi field **server**, mengunduh daftar file, lalu bundle/file MiniOS.
4. Sistem melanjutkan ke live root seperti biasa.

### Parameter `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Field | Peran |
|-------|------|
| client-ip | Alamat yang diberikan dengan busybox `ifconfig` |
| server-ip | Host untuk data MiniOS HTTP/TFTP; juga ditulis sebagai nameserver DNS di initrd |
| gateway-ip | Default route; juga ditulis sebagai nameserver DNS |
| netmask | Netmask IPv4 bertitik (bukan panjang prefix CIDR) |
| port | Port HTTP opsional untuk daftar file dan file (default **7529**) |

Contoh:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Cara file diambil

1. **HTTP** (disarankan): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` lalu setiap path yang terdaftar di file tersebut dari host/port yang sama.
2. **TFTP**: busybox `tftp` dipilih hanya jika permintaan HTTP awal untuk `PXEFILELIST` gagal. Kegagalan pengunduhan file HTTP berikutnya tidak akan mengalihkan transfer ke TFTP.

Port default adalah **7529** jika field kelima tidak diisi.

### Apa itu `ip=` bukan

| Ekspektasi | Kenyataan |
|-------------|---------|
| Bentuk kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Tidak didukung** — salah diparse sebagai alamat klien |
| IP statis untuk seluruh sesi live | **Tidak didukung** — setelah boot, NetworkManager (atau sejenisnya) yang mengelola antarmuka |
| IP statis saat memuat data MiniOS dari USB/ISO | **Jangan gunakan** — tanpa `from=http://…`, ini memaksa unduh data PXE |
| Daftar DNS khusus | Hanya gateway + server yang digunakan sebagai nameserver di initrd |

## Boot HTTP ISO (`from=http://…`)

Memuat data MiniOS dari ISO jarak jauh tanpa daftar file PXE penuh:

```text
from=http://192.168.1.1/path/minios.iso
```

Perilaku:

1. Initrd mengaktifkan jaringan:
   - Jika **`ip=`** diatur → konfigurasi statis seperti di atas
   - Jika **`ip=`** tidak diisi → **DHCP** via busybox `udhcpc`
2. Me-mount ISO jarak jauh dengan **`httpfs2`**
3. Melanjutkan pencarian konten MiniOS pada mount tersebut

Opsional **`cache=`** (dalam megabyte) mengaktifkan cache unduhan httpfs, misalnya `cache=512`.

Hanya **`http://`** yang diterima untuk jalur ISO jarak jauh ini. **`https://` tidak didukung.**

## Setelah sistem live berjalan

| Item | Setelah switch_root |
|------|-------------------|
| IP/kernel/routes pada NIC | Bisa tetap ada sampai userspace mengonfigurasi ulang antarmuka |
| DNS initrd (`resolv.conf`) | Bukan kebijakan sesi yang tahan lama |
| Jaringan sesi | Biasanya **NetworkManager** pada image MiniOS standar |
| Arti `ip=` | Hanya untuk pengambilan awal — bukan profil statis yang diingat |

Jika root masih menggunakan **httpfs**, NetworkManager yang mengonfigurasi ulang NIC dapat mengganggu live root. Rencanakan deployment network-boot dengan pertimbangan ini (misal: copy ke RAM / hindari mengubah antarmuka fetch jika memungkinkan).

Userspace akhir **live-config** mungkin akan mengaktifkan jaringan sebentar hanya untuk mengunduh remote hooks/preseed (`Setup_network`). Hal ini tidak terkait dengan pengalamatan PXE/`ip=` yang tahan lama.

## Kesalahan umum

1. Menempatkan `ip=` pada cmdline USB/ISO "untuk IP statis" → sistem mencoba unduh PXE alih-alih media lokal kecuali `from=http://…` memilih boot HTTP ISO terlebih dahulu.
2. Menggunakan `ip=dhcp` atau sintaks kernel `ip=` lainnya → parser salah, pengaturan alamat gagal.
3. Mengharapkan Wi‑Fi atau seleksi multi-NIC `BOOTIF` di initrd → tidak diimplementasikan.
4. Menggunakan image **Flux** untuk PXE/HTTP ISO → modul jaringan hilang dari initrd.
5. Menyajikan ISO hanya melalui HTTPS → `from=http://…` tidak akan cocok.
6. Bingung dengan konfigurasi statis installer/NetworkManager setelah login.

## Ringkasan keandalan

| Skenario | Penilaian |
|----------|------------|
| PXE + `ip=…` + daftar HTTP di :7529 (atau TFTP setelah permintaan daftar HTTP gagal), kabel sederhana / virtio | Target didukung |
| `from=http://…iso` + DHCP (atau `ip=`), kelas NIC yang sama | Biasanya berfungsi |
| Boot USB/ISO normal | Jaringan initrd tidak digunakan |
| Sesi statis via `ip=` | Tidak didukung |
| Multi-NIC / NIC firmware / Wi‑Fi / `https://` / edisi Flux | Lemah atau tidak didukung |

## Referensi implementasi

| Komponen | Lokasi di pohon MiniOS |
|-------|-----------------------------|
| Init entry | `linux-live/initramfs/livekit-mos/init` |
| Network + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| LiveKit builder (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Modul MiniOS Dracut | `linux-live/initramfs/dracut-mos/90minios/` |
| Saat `-n` diberikan | `linux-live/build-initramfs` (non-minimum) |

## Lihat juga

- [Boot parameters](/reference/Boot-Parameters) — tabel parameter lengkap (`ip`, `from`, `cache`, …)
- [Initrd system discovery](/reference/boot-process/System-Discovery) — prioritas sumber, penemuan lokal, dan perilaku saat gagal
- [live-config](/reference/configuration/live-config) — konfigurasi userspace tahap akhir (bukan network boot)
- [System architecture](/reference/System-Architecture)
- [Building MiniOS](/development/Building-MiniOS) — builder initramfs (`livekit` / `dracut`)
