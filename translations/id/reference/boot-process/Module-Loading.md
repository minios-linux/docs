---
updated: 2026-10-15
---

# Pemuatan modul

Halaman ini menjelaskan perubahan pada `load`, `noload`, `bext`, `union`, dan `toram=trim` parameter boot. Ini adalah kontrol lanjutan. Proses boot normal otomatis memuat kumpulan modul yang disediakan oleh image MiniOS yang dipilih.

MiniOS memilih dan memasang kumpulan modulnya di initrd, sebelum root union diserahkan ke sistem init yang terpasang. Gunakan halaman ini jika modul pada media boot tidak muncul di sistem yang sedang berjalan atau jika filter mengubah proses startup secara tidak terduga.

## Penjelasan sederhana

MiniOS dirakit dari modul hanya-baca bernomor`.sb`. Nomor yang lebih kecil dimuat lebih dahulu; nomor yang lebih besar dapat menggantikan file dari modul bernomor lebih kecil. Jika aktif, sesi yang dapat ditulis berada di atas semua modul hanya-baca.

Parameter `load=` dan `noload=` memfilter jalur modul sebelum perakitan. Parameter ini menggunakan pencocokan ekspresi reguler, bukan daftar nama persis yang aman, sehingga filter yang terlalu luas dapat mengecualikan modul inti atau kernel yang diperlukan dari kumpulan boot.

## Penjelasan parameter

| Parameter | Fungsinya bagi MiniOS | Risiko utama |
|---|---|---|
| `load=PATTERN` | Hanya menyertakan kandidat modul dengan jalur yang cocok dengan pola. | Pola yang tidak lengkap dapat mengecualikan modul yang diperlukan. |
| `noload=PATTERN` | Mengecualikan kandidat yang cocok setelah `load=` diterapkan. | Modul inti, kernel, firmware, atau desktop yang diperlukan dapat dikecualikan saat startup. |
| `bext=EXTENSION` | Menganggap ekstensi nama file lain sebagai akhiran kandidat modul. | Tidak mengonversi file atau mengoordinasikan modul kernel secara menyeluruh. |
| `union=aufs` atau `union=overlayfs` | Meminta filesystem yang digunakan untuk menggabungkan modul dengan lapisan yang dapat ditulis. | Aktivasi modul saat runtime berbeda antara AUFS dan OverlayFS. |
| `toram=trim` | Menyalin hanya modul yang dipilih dan data terbatas yang diperlukan ke RAM. | Modul dan direktori yang tidak disertakan tidak akan tersedia setelah sumber dilepas. |

Sebelum mengubah filter, catat baris perintah dan kumpulan modul saat ini. Uji satu perubahan setiap kali dan siapkan entri boot yang diketahui berfungsi.

<a id="candidate-tiers"></a>

## Tingkat kandidat

Setelah menemukan direktori data MiniOS, biasanya `minios/`, initrd akan menemukan pohon MiniOS eksternal opsional sebelum penyalinan RAM atau aktivasi sesi. Partisi persistensi pada drive yang sama atau tata letak data Ventoy yang dapat ditulis dapat menyediakan pohon tersebut, bahkan saat boot tanpa sesi tersimpan. Backend Persistence Plugin Ventoy yang dipilih merupakan model terpisah dan tidak menyediakan pohon modul eksternal ini.

Kandidat terbagi menjadi dua kelompok:

1. Nama modul tingkat teratas dari pohon data yang dipilih dan pohon `minios/` eksternal, diurutkan dan dideduplikasi berdasarkan nama relatif.
2. File dan tautan simbolis secara rekursif di bawah `modules/` pada kedua pohon, diurutkan dan dideduplikasi berdasarkan jalur relatif.

Untuk jalur relatif yang sama, file reguler eksternal lebih diutamakan daripada ISO atau sumber lain yang dipilih. Ini berlaku untuk modul sistem pengganti maupun modul tambahan. Filter diterapkan pada jalur relatif yang telah digabungkan sebelum pemasangan atau penyalinan RAM yang dipangkas. Root partisi persistensi tetap terpisah dari penyimpanan sesi bernomornya.

Titik pemasangan tetap diratakan menjadi nama dasar yang persis. Misalnya, `modules/work/50-extra.sb` dan `modules/test/50-extra.sb` sama-sama merujuk ke `50-extra.sb`; keduanya bukan lapisan union yang terpisah. Gunakan nama dasar yang berbeda, kecuali jika memang ingin mengganti jalur yang persis sama. Jangan mengandalkan nama dasar duplikat di direktori berbeda sebagai mekanisme penggantian.

Format modul yang umum adalah image filesystem SquashFS. Nama file yang cocok tidak menjamin isinya valid. Pemindaian rekursif memeriksa file dan tautan simbolis, sedangkan pemindaian tingkat teratas hanya menggunakan nama file. Jika pengikatan pengganti eksternal atau pemasangan modul yang dipilih gagal, proses akan masuk ke jalur initramfs fatal, bukan mengabaikan lapisan tersebut secara diam-diam. Validasi file yang meragukan dengan [Memeriksa dan mengekstrak modul](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Urutan dan prioritas

Dalam proses discovery, path diurutkan secara numerik berdasarkan nama dasarnya. Angka di awal nama seperti `00-core.sb`, `01-kernel-VERSION.sb`, dan `50-extra.sb` menentukan urutan modul. Nama dasar tanpa angka di awal dianggap bernilai nol dalam pengurutan numerik.
Gunakan awalan angka yang eksplisit dan berbeda, jangan mengandalkan urutan saat nilainya sama.

Union akhir memprioritaskan modul bernomor lebih tinggi daripada modul bernomor lebih rendah. Jika dua modul yang dipilih memiliki path relatif terhadap root yang sama, file dari modul dengan prioritas lebih tinggi yang akan terlihat. Lapisan perubahan yang dapat ditulis memiliki prioritas di atas semua modul hanya-baca.

Penggantian eksternal berdasarkan path relatif dilakukan sebelum urutan modul efektif ini diterapkan. File pengganti `modules/50-extra.sb` menempati slot terpilih yang sama dengan file sumber, dan awalan `50` menentukan prioritasnya dalam union.

## Ekstensi bundle

Parameter boot `bext=` menentukan ekstensi nama file yang digunakan untuk discovery data, pemfilteran kandidat, dan pemasangan modul. Nilai default-nya adalah `sb`, sehingga akhiran kandidat yang umum adalah `.sb`:

```text
bext=sb
```

Mengubah `bext` akan mengubah akhiran nama file yang dipilih; perubahan ini tidak mengonversi file atau memverifikasi format sistem filenya. Koordinasi kernel merupakan pengecualian: proses ini selalu mencari `01-kernel-VERSION.sb`. Dengan ekstensi khusus, pemindaian kandidat normal tidak akan memilih modul kernel `.sb` ini.

## Filter load dan noload

`load=` dan `noload=` adalah regular expression extended tanpa jangkar yang diterapkan pada string path kandidat yang dihasilkan oleh setiap tingkat. Keduanya bukan daftar nama yang harus cocok persis. Nilai sederhana seperti `kernel` akan cocok dengan teks tersebut di bagian mana pun dalam path, sedangkan jangkar harus ditentukan secara eksplisit jika posisi yang tepat diperlukan.
Kandidat tingkat teratas berupa nama dasar, sedangkan kandidat rekursif mencakup `modules/`. Kandidat eksternal menggunakan format path relatif yang sama, bukan path absolut titik pemasangan persistence.

Koma diubah menjadi operator alternatif regular expression. Contoh:

```text
load=core,kernel,firmware
```

dievaluasi sebagai `core|kernel|firmware`. Karakter regular expression lainnya tidak di-escape.

Rentang angka hanya diperluas jika seluruh filter berupa satu rentang naik yang cocok dengan `^[0-9]+-[0-9]+$`. Contohnya, `load=04-06` menjadi beberapa alternatif `04|05|06`, dengan setiap nilai yang dihasilkan dilengkapi nol di depan hingga minimal dua digit. Rentang yang disisipkan dalam daftar koma atau ekspresi lain tidak diperluas dan tetap mengikuti makna ERE biasa.

Jika kedua parameter tersedia, initrd menerapkan `load=` terlebih dahulu, lalu menghapus kecocokan dengan `noload=`. Jadi, `noload=` yang menjadi prioritas. Tidak ada kumpulan modul inti atau kernel yang dilindungi: filter dapat mengecualikan `00-core`, `01-kernel` yang dikoordinasikan, atau kandidat lainnya. Pilihan seperti ini dapat membentuk root yang tidak lengkap atau membuat sistem gagal boot.

## Koordinasi kernel yang sedang berjalan

Versi kernel yang sedang berjalan diambil dari token `vmlinuz-VERSION` pada command line kernel jika tersedia, dengan `uname -r` sebagai nilai fallback. Sebelum memasang modul, initrd mengoordinasikan triplet tingkat teratas berikut:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Jika ada anggota yang tidak tersedia, initrd mencari ketiga file di:

```text
minios/kernels/VERSION/
```

Jika triplet repositori lengkap, modul disalin ke `minios/` dan file boot disalin ke `minios/boot/`. Salinan yang tidak lengkap akan dibersihkan. Jika triplet tidak lengkap, penyiapan kernel mengembalikan kegagalan, tetapi pemanggil tetap melanjutkan ke tahap pemasangan modul normal. Sistem yang dihasilkan masih dapat mengalami kegagalan di kemudian hari karena filesystem root tidak memiliki file pendukung untuk kernel yang sedang berjalan.

File tingkat teratas lainnya yang cocok dengan `01-kernel-*.sb` dianggap tidak aktif. Initrd mencoba memindahkan setiap modul tidak aktif beserta file `vmlinuz` dan `initrfs` yang cocok ke `minios/kernels/VERSION/`. Operasi fallback repositori dan pemindahan ini memerlukan pohon data yang dapat ditulis; kegagalan pemindahan satu per satu tidak bersifat fatal. Operasi tersebut selalu menggunakan `.sb`, terlepas dari `bext=`. Pemindaian kandidat gabungan juga mengecualikan modul `01-kernel-*` yang tidak cocok dengan kernel yang sedang berjalan, termasuk kandidat eksternal. Lihat [Manajemen kernel](/preparing-and-customizing/Managing-Kernels) untuk alur kerja pemasangan dan aktivasi kernel yang didukung.

<a id="union-construction"></a>

## Pembuatan union

MiniOS memilih `AUFS` jika kernel yang sedang berjalan mendukungnya, dan jika tidak, menggunakan OverlayFS. `union=overlayfs` memilih OverlayFS. `union=aufs` meminta `AUFS`, tetapi beralih ke OverlayFS jika `AUFS` tidak tersedia. Jika UEFI Secure Boot diaktifkan, initrd tidak memuat modul unsigned `aufs-ng`; jika belum ada implementasi AUFS lain yang dapat digunakan, OverlayFS akan digunakan meskipun `union=aufs` diminta.

Dengan `AUFS`, initrd terlebih dahulu memasang union kosong dengan branch perubahan yang dapat ditulis, lalu menyisipkan setiap modul yang telah dipasang sebagai branch hanya-baca. Kegagalan membuat union bersifat fatal. Jika penambahan branch `AUFS` tertentu gagal, proses boot tetap dilanjutkan dengan branch yang berhasil ditambahkan; namun, MiniOS tidak menandai persistence sebagai aktif jika union tidak lengkap.

Dengan OverlayFS, seluruh modul diberikan sebagai satu daftar `lowerdir` terbalik saat union dipasang. Lapisan yang dapat ditulis menyediakan `upperdir` dan `workdir`. Kegagalan memasang union tersebut bersifat fatal. Urutan lower dari kiri ke kanan dan urutan penyisipan `AUFS` sama-sama menerapkan aturan yang sama: modul bernomor lebih tinggi yang ditambahkan belakangan menyembunyikan path yang bertentangan dari modul sebelumnya.

Komposisi saat boot ini berbeda dari aktivasi saat runtime. Setelah startup, `sb activate` dan `sb deactivate` hanya dapat mengubah root yang saat ini dipasang sebagai `AUFS`. Lapisan lower OverlayFS tidak dapat diubah di tempat. Aktivasi saat runtime tidak mengubah pilihan Next Boot, dan penambahan modul Next Boot tidak mengaktifkannya di root saat ini. Lihat [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules).

## Pemangkasan Toram

`toram=trim` membuat pohon system-data RAM setelah penemuan modul eksternal dan sebelum aktivasi sesi serta koordinasi kernel. Yang disalin:

- `config.conf`, yang wajib ada agar jalur penyalinan ini dapat digunakan.
- `authorized_keys` jika berupa file biasa.
- Kandidat tingkat teratas yang cocok dengan ekstensi, dipilih oleh `load=`, `noload=`, dan filter kernel yang sedang berjalan.
- Kandidat yang cocok dengan ekstensi dan dipilih secara rekursif di bawah `modules/`, dengan direktori relatifnya tetap dipertahankan.
- Penggantian dan penambahan dari sumber eksternal yang dipilih dengan aturan yang sama, lalu disalin ke path relatif masing-masing.

Ini membuat direktori `changes/` kosong; penyalinan sesi ditangani secara terpisah oleh `perchtoram`. Ini tidak menyalin `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lainnya, atau modul yang tidak dipilih. Secara khusus, fallback repositori tidak dapat menggunakan direktori `kernels/` yang tidak disertakan dalam pohon RAM yang telah dipangkas. Modul eksternal sudah disertakan, jadi boot RAM tidak membuka kembali file aslinya setelah penyalinan.

Penyalinan sistem tidak melakukan pemeriksaan awal kapasitas RAM. Kegagalan menyalin `config.conf` atau modul yang dipilih akan diteruskan ke entri init dan menjalankan jalur fatalnya. Kegagalan menyalin `authorized_keys` opsional dilaporkan tanpa membatalkan proses. Tidak ada rollback transaksional untuk pohon system-data yang baru terisi sebagian. Penyalinan sesi memiliki pemeriksaan awal memori tersendiri dan kembali menggunakan sesi asli di media penyimpanan jika salinan tidak dapat disiapkan; lihat [Internal persistence](/reference/boot-process/Persistence-Internals).

Setelah penyalinan, initrd mencoba melepas mount sumber, menghapus path data lamanya, lalu memindahkan pohon RAM ke path tersebut. Sumber hanya ditandai sebagai terlepas jika seluruh rangkaian berhasil. Jika rangkaian tersebut gagal, boot tetap dilanjutkan menggunakan path staging RAM. Operasi pelepasan ISO dan Ventoy terkait juga dilakukan semampunya.
Karena itu, `toram=trim` bukan bukti bahwa perangkat boot dapat dilepas. Jangan mencabutnya kecuali diagnostik memastikan bahwa sistem file, perangkat loop, dan pemetaan device-mapper-nya tidak lagi dipasang atau digunakan.

## Rootcopy dan pengalihan root

Setelah modul dipasang dan union dibuat, initrd menyalin konten yang terlihat dari `minios/rootcopy/` langsung ke union yang telah disusun. Glob shell `*` tidak menyertakan entri berawalan titik yang berada langsung di dalam `rootcopy/`, meskipun file tersembunyi di dalam direktori yang disalin tetap menjadi bagian dari salinan direktori tersebut. Ini adalah penyalinan file ke tampilan yang dapat ditulis, bukan lapisan modul hanya-baca tambahan, sehingga dapat menimpa path yang disediakan oleh modul. Fungsi ini tidak menjadikan kesalahan penyalinan sebagai kegagalan fatal.

MiniOS kemudian melakukan penyiapan awalnya, menulis `fstab` milik root baru, dan memuat `rootcopy/run/preinit.sh` jika tersedia, dengan path union sebagai argumen pertamanya. Skrip ini berjalan di lingkungan initrd sebelum pengalihan root dan harus diperlakukan sebagai kode boot dengan hak istimewa.

Pada tahap akhir, initrd LiveKit memindahkan union yang telah disusun menjadi root di `/`, mempertahankan initrd lama di bawah `/run/initramfs` untuk keperluan shutdown, lalu menjalankan `init` milik root baru. Jalur Dracut menyiapkan union yang sama dan membiarkan Dracut melakukan `switch_root` akhir. Setelah tahap ini dilewati, startup biasa berjalan di dalam root yang telah disusun; mengubah file di media boot tidak lagi menyusun ulang set lapisan lower yang dipilih untuk boot tersebut.

## Diagnostik aman

Utamakan pemeriksaan hanya-baca dan catat command line asli sebelum mengubah filter:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` menampilkan pilihan saat ini berdasarkan aturan, sedangkan `sb list` menampilkan lapisan yang benar-benar menyusun root yang sedang berjalan. Perbedaan dapat menunjukkan kegagalan mount, penggantian basename, perubahan `AUFS` saat runtime, atau sumber pilihan yang berubah setelah boot.

Jika terjadi kegagalan dini, tambahkan `debug` untuk menampilkan pelacakan shell, `timing` untuk melihat waktu setiap tahap, atau `rd.break` untuk membuka shell setelah penyiapan initrd dan sebelum pengalihan root terakhir. Di shell tersebut, periksa `/memory/data`, `/memory/bundles`, mount, dan `/proc/cmdline`; jangan memperbaiki sistem file atau melepas media saat masih terpasang. Catat kesalahan mount atau penyalinan yang pertama, bukan hanya gejala yang muncul belakangan. Lihat [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting) untuk alur kerja diagnostik aman yang lebih lengkap.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Penemuan sistem](/reference/boot-process/System-Discovery)
- [Persistensi](/reference/boot-process/Persistence-Internals)
- [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Manajemen kernel](/preparing-and-customizing/Managing-Kernels)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
