---
updated: 2026-08-26
---

# Mode boot MiniOS

Mode boot menjelaskan asal sistem live, apakah lapisan writable-nya bersifat sementara atau persisten, dan apakah MiniOS menyalin sumbernya ke RAM. Mode ini tidak menggambarkan firmware atau protokol bootloader yang berbeda. GRUB, Syslinux, Ventoy, atau PXE loader akan memulai pipeline early-userspace MiniOS yang sama dengan memuat kernel dan initramfs beserta kernel command line.

Gunakan halaman ini untuk memilih mode dan memahami dependensi yang dihasilkan. Untuk opsi command-line secara individual, lihat [Parameter Boot](/configuration/Boot-Parameters.md). Untuk entri yang disediakan oleh image, lihat [Menu Boot](/configuration/Boot-Menus.md).

## Firmware, bootloader, dan early userspace

Firmware dan bootloader berjalan sebelum MiniOS dapat mendeteksi modul live atau sesi. BIOS atau UEFI akan memulai bootloader lokal, atau firmware jaringan menjalankan PXE loader. Loader ini memilih dan memuat kernel MiniOS serta initramfs, lalu meneruskan command line-nya. Ventoy juga termasuk pada lapisan ini: Ventoy menyajikan ISO melalui lingkungan boot miliknya sebelum early userspace MiniOS mendeteksinya.

Kernel kemudian menjalankan initramfs MiniOS. Early userspace ini mendeteksi sumber live, menyiapkan penyalinan ke RAM dan persistensi opsional, me-mount modul, dan membangun root filesystem. Label menu seperti Fresh Start atau Resume Previous Session pada dasarnya hanyalah pilihan parameter initramfs yang praktis, bukan implementasi bootloader yang berbeda.

Instalasi native berbeda. Instalasi ini melakukan boot pada root Linux konvensional yang telah diekstrak dengan GRUB dan initramfs sistem terpasang. Instalasi native tidak menggunakan pipeline live modular yang dijelaskan di bawah ini.

## Urutan boot live

Pipeline live berjalan dengan urutan berikut:

1. **Muat kernel dan initramfs.** Bootloader yang dipilih firmware memuat kedua file tersebut dan memberikan kernel command line. Pada tahap ini, root SquashFS MiniOS belum dirakit.
2. **Deteksi sumber.** Initramfs mencari perangkat blok lokal, mengikuti lokasi `from=` eksplisit, melakukan loop-mount pada ISO lokal, me-mount ISO HTTP, atau mengunduh data set PXE. Deteksi sumber dan deteksi persistensi adalah operasi yang terkait namun berbeda.
3. **Salin ke RAM jika diminta.** `toram` dan `toram=full` akan menyalin seluruh pohon data MiniOS, tergantung pada penanganan persistensi. `toram=trim` hanya menyalin modul yang dipilih dan konfigurasi yang diperlukan. Initramfs kemudian mencoba melepaskan sumber aslinya. Penyalinan yang selesai tidak menjamin pelepasan sumber berhasil.
4. **Pilih persistensi.** Jika persistensi diminta, initramfs menentukan lokasi dan sesi persistensi, memeriksanya, lalu menyiapkan lapisan writable. Resume, new, dan pemilihan interaktif hanya berbeda pada cara sesi tersebut dipilih atau dibuat. Tanpa permintaan persistensi, lapisan writable akan berbasis memori.
5. **Rekonsiliasi set kernel yang berjalan.** Kernel sudah berjalan dan tidak dapat diubah pada tahap ini. MiniOS memeriksa apakah pohon data aktif memiliki modul `01-kernel`, image kernel, dan initramfs yang sesuai dengan kernel yang sedang berjalan. Jika set yang cocok lengkap tersedia di repository kernel tidak aktif, MiniOS mencoba mengaktifkannya dan memindahkan set kernel aktif lainnya ke repository. Ini adalah rekonsiliasi file, bukan fallback kernel atau pergantian kernel secara langsung.
6. **Mount modul.** File `.sb` yang dipilih dari pohon data MiniOS dan store modul writable yang berlaku akan diurutkan, difilter dengan `load=` dan `noload=`, lalu di-mount read-only secara loop.
7. **Bangun AUFS atau OverlayFS.** MiniOS menggabungkan modul yang telah di-mount dengan satu lapisan writable. AUFS menambahkan mount modul yang terurut sebagai cabang read-only. OverlayFS menerima daftar direktori lower yang terurut lengkap beserta direktori upper dan work saat root di-mount. Hasil akhirnya adalah root filesystem live.
8. **Terapkan `rootcopy` dan jalankan `minios-boot`.** File di bawah direktori sumber `rootcopy/` akan disalin ke root yang telah dirakit. Initramfs kemudian menjalankan `minios-boot` di chroot untuk menyinkronkan konfigurasi MiniOS dan menerapkan pengaturan userspace awal saat boot. Initramfs juga menyiapkan `fstab` dan menjalankan hook opsional `rootcopy/run/preinit.sh` sebelum handoff.
9. **Handover ke userspace normal.** LiveKit menggunakan `pivot_root` untuk handoff akhir, sementara dracut menyiapkan root yang sama dan melakukan `switch_root` terakhir. Init system terpasang kemudian memulai layanan normal serta sesi desktop atau konsol. Pengaturan network-fetch awal tidak sama dengan konfigurasi jaringan userspace yang bersifat permanen.

Detail kontrak deteksi sumber, modul, dan persistensi didokumentasikan di [Deteksi sistem Initrd](/configuration/Initrd-System-Discovery.md), [Pemuatan modul Initrd](/configuration/Initrd-Module-Loading.md), dan [Persistensi Initrd](/configuration/Initrd-Persistence.md).

## Matriks mode

| Mode | Sumber live | Lapisan writable | Ketergantungan sumber setelah boot |
|------|-------------|------------------|------------------------------|
| Fresh local | Pohon `minios/` lokal atau ISO lokal | RAM sementara | Tetap ada kecuali salinan `toram` nonpersisten yang diminta berhasil melepaskannya. |
| Persistent resume | Store persistensi lokal atau yang dipilih secara eksplisit | Sesi kompatibel yang sudah ada jika tersedia | Sumber dan storage persistensi biasanya tetap digunakan. Resume tidak menjamin setiap sesi yang hilang atau rusak akan dipulihkan. |
| Persistent new | Store persistensi writable | Sesi baru bernomor yang dialokasikan | Sumber dan storage persistensi tetap digunakan. Pembuatan membutuhkan storage writable yang kompatibel dan ruang yang cukup. |
| Persistent choose | Pilihan lokasi dan sesi persistensi secara interaktif | Sesi yang dipilih atau baru dibuat | Bergantung pada sumber dan store persistensi yang dipilih. Pemilihan tidak membuat sesi yang tidak kompatibel menjadi aman. |
| Bare atau full `toram` | Sumber live apa pun yang dapat dideteksi | RAM sementara kecuali persistensi juga diminta | `toram` berarti `toram=full`. Media dapat dilepas hanya setelah pelepasan sumber nonpersisten berhasil. |
| Trim `toram` | Sumber live apa pun yang dapat dideteksi | RAM sementara kecuali persistensi juga diminta | Hanya menyalin set modul yang telah difilter dan data yang diperlukan. Kondisi pelepasan yang sama berlaku. |
| Local ISO atau Ventoy | ISO yang di-mount secara loop atau ISO yang disajikan Ventoy | RAM sementara atau sesi yang dipilih secara terpisah | ISO dan mapping dasarnya tetap dibutuhkan kecuali `toram` nonpersisten berhasil melepaskannya. |
| HTTP ISO | ISO yang di-mount melalui `httpfs2` lewat HTTP | RAM sementara atau sesi yang dipilih secara terpisah | Jalur fetch dan jaringan tetap relevan selama root didukung oleh httpfs; `toram` hanya dapat menghapus ketergantungan jika pelepasan berhasil. |
| PXE | Kernel dan initramfs dari loader, data MiniOS diunduh oleh initramfs | RAM sementara atau sesi yang dipilih secara terpisah | Jaringan awal hanya untuk memuat data, bukan kebijakan jaringan sesi. Ketergantungan pasti bergantung pada apa yang diunduh dan di-mount. |
| Native installation | Root terpasang yang telah diekstrak, bukan modul live `.sb` | Filesystem terpasang normal | Tidak menggunakan deteksi live, sesi live, `toram`, perakitan union modul, atau pipeline handoff live ini. |

## Kombinasi dan batasan

Pilihan sumber, persistensi, dan salin ke RAM adalah sumbu yang terpisah. Direktori lokal, ISO lokal, ISO HTTP, atau sumber data PXE dapat menyediakan modul live. Persistensi kemudian bisa diabaikan, dilanjutkan, dibuat baru, atau dipilih secara interaktif jika didukung. `toram=full` atau `toram=trim` dapat diminta dengan sumber live yang didukung.

Persistensi dan `toram` dapat digunakan bersamaan, tetapi ini bukan kontrak yang sama dengan operasi persisten biasa. MiniOS menyalin data sesi yang diminta ke pohon data RAM sebelum setup persistensi. Jangan berasumsi bahwa penulisan berikutnya akan disimpan kembali ke store asli, dan jangan lepaskan medianya hanya berdasarkan opsi `toram` saja. Batas media yang dapat dilepas lebih sempit: pelepasan hanya aman setelah MiniOS berhasil melepaskan salinan RAM **nonpersisten** dari sumber aslinya. Jika pelepasan gagal, sumber tetap di-mount. Untuk Ventoy, MiniOS hanya melepaskan mapping setelah pelepasan nonpersisten yang berhasil; pembersihan mapping bersifat best-effort.

`toram=trim` menghormati filter pemilihan modul, jadi modul yang dikecualikan tidak akan tersedia hanya karena media asli masih ada. Full `toram` membutuhkan RAM yang cukup untuk data yang disalin, sedangkan trim tetap membutuhkan RAM yang cukup untuk set terpilih dan beban kerja writable. Tidak ada mode yang menjamin mesin dengan RAM terbatas akan boot dengan aman.

ISO HTTP dan jaringan PXE adalah bagian dari initramfs. `from=http://...` literal akan diutamakan dan dapat menggunakan `ip=` untuk pengalamatan awal statis. Tanpa sumber ISO HTTP tersebut, `ip=` yang tidak kosong akan memilih jalur data PXE dan melewati deteksi media lokal. Ini bukan alamat statis untuk desktop yang berjalan. ISO HTTP mendukung `http://`, bukan `https://`. Jika root HTTP tidak dilepaskan ke RAM, re-konfigurasi jaringan berikutnya dapat memutus sumbernya. Lihat [Boot jaringan](/installation/Network-Boot.md) sebelum menggabungkan pemuatan jaringan dengan perubahan jaringan userspace.

Persistensi membutuhkan target writable dan mode yang sesuai. Media read-only tidak dapat menjadi host sesi baru, persistensi terenkripsi tidak otomatis menjadi tidak terenkripsi jika aktivasi gagal, dan penerimaan interaktif tidak menghilangkan risiko ketidakcocokan sesi. Gunakan [Manajemen sesi](/configuration/Session-Management.md) untuk mode storage, kompatibilitas, dan aturan pemulihan.

## Panduan keputusan

| Tujuan | Mulai dengan | Periksa sebelum mengandalkannya |
|--------|-------------|------------------------------|
| Uji MiniOS tanpa menyimpan perubahan | Fresh local | Sesi yang ada tidak dipilih; media sumber biasa tetap digunakan. |
| Lanjutkan pekerjaan normal | Persistent resume | Target persistensi writable dan sesi kompatibel. |
| Simpan sesi lama dan mulai baru | Persistent new | Tersedia ruang yang cukup dan filesystem mendukung mode persistensi yang dipilih. |
| Pilih di antara beberapa workspace | Persistent choose | Anda dapat mengidentifikasi perangkat dan sesi yang dimaksud; tinjau peringatan kompatibilitas. |
| Lepaskan media boot lokal setelah startup | Nonpersistent `toram` atau `toram=trim` | Tunggu hingga pelepasan sumber berhasil. Jangan menyimpulkan keberhasilan hanya dari label menu. |
| Kurangi penggunaan RAM saat menyalin ke RAM | `toram=trim` | Hasil `load=` dan `noload=` memuat semua modul yang dibutuhkan sistem. |
| Boot ISO yang disimpan di disk lokal atau perangkat Ventoy | Penemuan ISO lokal | Jaga filesystem host dan mapping tetap tersedia kecuali pelepasan dikonfirmasi. |
| Muat ISO dari web server | HTTP ISO | Jaringan initramfs kabel, ketersediaan HTTP biasa, dan akses sumber yang berkelanjutan. |
| Muat data MiniOS dari infrastruktur deployment | PXE | Sintaks `ip=` MiniOS yang benar dan interface kabel yang didukung; jangan perlakukan sebagai konfigurasi jaringan userspace. |
| Jalankan MiniOS sebagai sistem terpasang konvensional | Native installation | Ikuti dokumentasi instalasi dan pemulihan native, bukan prosedur sesi live atau `toram`. |

Jika boot gagal sebelum root live dirakit, identifikasi terlebih dahulu apakah kegagalan terjadi pada startup firmware/bootloader, deteksi sumber, persistensi, mounting modul, atau konstruksi root. Hindari perintah perbaikan sebelum mengetahui layout storage. Lihat [Pemulihan boot](/administration/Boot-Recovery.md).

## Dokumentasi terkait

- [Deteksi sistem Initrd](/configuration/Initrd-System-Discovery.md)
- [Pemuatan modul Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistensi Initrd](/configuration/Initrd-Persistence.md)
- [Parameter Boot](/configuration/Boot-Parameters.md)
- [Menu Boot](/configuration/Boot-Menus.md)
- [Boot jaringan](/installation/Network-Boot.md)
- [Manajemen sesi](/configuration/Session-Management.md)
- [Arsitektur sistem](/about/System-Architecture.md)
- [Pemulihan boot](/administration/Boot-Recovery.md)
