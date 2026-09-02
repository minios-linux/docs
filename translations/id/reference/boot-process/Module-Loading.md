---
updated: 2026-08-28
---

# Pemuatan modul

Halaman ini menjelaskan perubahan yang dilakukan oleh parameter boot `load`, `noload`, `bext`, `union`, dan `toram=trim`. Ini adalah kontrol tingkat lanjut. Proses boot normal secara otomatis memuat set modul yang disediakan oleh image MiniOS yang dipilih.

MiniOS memilih dan me-mount set modulnya di initrd, sebelum root union diserahkan ke sistem init yang terpasang. Gunakan halaman ini jika modul pada media boot tidak muncul di sistem yang berjalan atau jika filter mengubah proses startup secara tak terduga.

## Penjelasan sederhana

MiniOS disusun dari modul `.sb` hanya-baca yang diberi nomor. Nomor lebih rendah dimuat lebih dulu; nomor lebih tinggi dapat menggantikan file dari modul bernomor lebih rendah. Sesi yang dapat ditulis, jika aktif, berada di atas semua modul hanya-baca.

Parameter `load=` dan `noload=` memfilter path modul sebelum perakitan. Mereka menggunakan pencocokan regular-expression, bukan daftar nama persis yang aman, sehingga filter yang terlalu luas dapat menyebabkan modul inti atau kernel yang dibutuhkan tidak masuk ke set boot.

## Penjelasan parameter

| Parameter | Instruksi untuk MiniOS | Risiko utama |
|---|---|---|
| `load=PATTERN` | Hanya mempertahankan kandidat modul yang path-nya cocok dengan pola. | Pola yang tidak lengkap bisa melewatkan modul yang diperlukan. |
| `noload=PATTERN` | Mengeluarkan kandidat yang cocok setelah `load=` diterapkan. | Modul inti, kernel, firmware, atau desktop yang diperlukan bisa tidak dimuat saat startup. |
| `bext=EXTENSION` | Perlakukan ekstensi nama file lain sebagai akhiran kandidat modul. | Tidak mengonversi file atau sepenuhnya mengoordinasikan modul kernel. |
| `union=aufs` atau `union=overlayfs` | Meminta filesystem yang digunakan untuk menggabungkan modul dengan layer writable. | Aktivasi modul saat runtime berbeda antara AUFS dan OverlayFS. |
| `toram=trim` | Hanya menyalin modul terpilih dan data penting terbatas ke RAM. | Modul dan direktori yang tidak disalin tidak tersedia setelah sumber dilepas. |

Sebelum mengubah filter, catat command line dan set modul saat ini. Uji satu perubahan dalam satu waktu dan pastikan ada entri boot yang sudah terbukti berfungsi.

## Tingkat kandidat

Setelah menemukan direktori data MiniOS, biasanya `minios/`, initrd akan memindai kandidat modul dengan urutan berikut:

1. Entri yang langsung berada di dalam `minios/`. Pemindaian ini tidak dilakukan secara rekursif.
2. Entri yang berada secara rekursif di bawah `minios/modules/`.
3. Entri yang berada secara rekursif di bawah `minios/modules/` pada sumber persistence yang dapat ditulis dan telah dicatat oleh initrd.

Tingkat ketiga ini terpisah dari direktori `minios/modules/` pada pohon data hanya-baca yang dipilih. Ini memungkinkan modul pengguna yang bersifat tahan lama untuk menimpa file dari ISO atau sumber hanya-baca lainnya. Fitur ini hanya tersedia jika penemuan persistence telah mempublikasikan root yang dapat ditulis dan berisi direktori tersebut.

Setiap jalur kandidat akan diratakan menjadi nama berkas persis saat dipasang. Sebagai contoh, `modules/work/50-extra.sb` dan `modules/test/50-extra.sb` keduanya akan menggunakan mountpoint bernama `50-extra.sb`. Keduanya tidak menjadi dua lapisan yang dapat diakses secara independen. Kandidat pada tingkat berikutnya dengan nama berkas yang sama akan dipasang pada mountpoint yang sama dan menggantikan kandidat sebelumnya yang terlihat oleh union assembly.
Oleh karena itu, nama berkas yang sama harus diperlakukan sebagai satu slot pengganti, bukan sebagai cara untuk memuat beberapa modul dari direktori yang berbeda.

Format modul yang umum adalah image filesystem SquashFS biasa. Pemindaian initrd sendiri berbasis nama file: hanya memilih jalur yang berakhiran ekstensi yang dikonfigurasi dan tidak memverifikasi terlebih dahulu apakah jalur tersebut adalah file reguler atau SquashFS yang valid. Pemindaian rekursif dapat menemukan objek filesystem lain dengan nama yang cocok. Kegagalan loop atau mount SquashFS akan dilaporkan oleh `mount`, namun kegagalan pada loop kandidat tidak langsung menyebabkan boot gagal dan proses boot dapat berlanjut meskipun ada lapisan yang hilang. Validasi file yang meragukan dengan alur kerja di [Inspeksi dan ekstrak modul](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Urutan dan prioritas

Dalam proses penemuan, path diurutkan secara numerik berdasarkan basename. Angka di depan nama seperti `00-core.sb`, `01-kernel-VERSION.sb`, dan `50-extra.sb` adalah urutan modul. Basename tanpa angka di depan akan diurutkan sebagai nol.
Gunakan awalan angka yang eksplisit dan berbeda, jangan mengandalkan urutan imbang.

Union akhir memberikan prioritas pada modul dengan nomor lebih tinggi (lebih baru) dibandingkan modul dengan nomor lebih rendah (lebih lama). Jika dua modul terpilih memuat path root-relatif yang sama, file dari modul dengan prioritas lebih tinggi yang akan terlihat. Layer perubahan writable memiliki prioritas di atas semua modul hanya-baca.

Penggantian tier terjadi sebelum urutan modul efektif ini. `50-extra.sb` pada tier berikutnya akan menggantikan file pada tier sebelumnya dengan basename yang sama persis, lalu awalan `50` menentukan posisi mount yang bertahan dalam union.

## Ekstensi bundle

Parameter boot `bext=` memilih ekstensi nama file yang digunakan untuk penemuan data, pemfilteran kandidat, dan mounting modul. Nilai default-nya adalah `sb`, sehingga akhiran kandidat yang umum adalah `.sb`:

```text
bext=sb
```

Mengubah `bext` hanya mengubah ekstensi nama file yang dipilih; ini tidak mengonversi file atau memverifikasi format filesystem-nya. Koordinasi kernel adalah pengecualian: selalu mencari `01-kernel-VERSION.sb`. Dengan ekstensi kustom, pemindaian kandidat normal tidak akan memilih modul kernel `.sb` tersebut.

## Filter load dan noload

`load=` dan `noload=` adalah regular expression extended tak berjangkar yang diterapkan pada string path kandidat dari setiap tier. Ini bukan daftar nama persis. Nilai sederhana seperti `kernel` akan cocok di mana saja dalam path, sedangkan anchor harus ditulis secara eksplisit jika ingin posisi persis.
Path berbeda di setiap tier: kandidat tingkat atas adalah basename, kandidat data rekursif menyertakan `modules/`, dan kandidat persistence adalah path absolut.

Tanda koma diubah menjadi alternasi regular expression. Contoh:

```text
load=core,kernel,firmware
```

dievaluasi sebagai `core|kernel|firmware`. Karakter regular expression lain tidak di-escape.

Rentang numerik hanya diperluas jika seluruh filter adalah satu rentang naik yang cocok dengan `^[0-9]+-[0-9]+$`. Misalnya, `load=04-06` menjadi alternatif `04|05|06`, dengan setiap nilai yang dihasilkan dipad setidaknya dua digit. Rentang di dalam daftar koma atau ekspresi lain tidak diperluas dan tetap bermakna ERE biasa.

Jika kedua parameter ada, initrd menerapkan `load=` lebih dulu lalu menghapus kecocokan dengan `noload=`. Jadi `noload=` yang menang. Tidak ada set modul inti atau kernel yang dilindungi: filter bisa mengecualikan `00-core`, `01-kernel` yang terkoordinasi, atau kandidat lain. Seleksi seperti ini bisa membangun root yang tidak lengkap atau mencegah boot.

## Koordinasi kernel yang berjalan

Versi kernel yang berjalan diambil dari token `vmlinuz-VERSION` pada command line kernel jika tersedia, dengan `uname -r` sebagai cadangan. Sebelum me-mount modul, initrd mengoordinasikan triplet tingkat atas berikut:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Jika ada anggota yang hilang, initrd akan mencari ketiga file tersebut di:

```text
minios/kernels/VERSION/
```

Jika triplet repositori lengkap, modul akan disalin ke `minios/` dan file boot ke `minios/boot/`. Salinan parsial akan dibersihkan. Jika triplet tidak lengkap, setup kernel mengembalikan kegagalan, namun proses tetap berlanjut ke tahap mounting modul normal. Sistem yang dihasilkan masih bisa gagal nanti karena root filesystem tidak memiliki file pendukung untuk kernel yang berjalan.

File tingkat atas lain yang cocok dengan `01-kernel-*.sb` dianggap tidak aktif. Initrd akan mencoba memindahkan setiap modul tidak aktif beserta file `vmlinuz` dan `initrfs` yang cocok ke `minios/kernels/VERSION/`. Operasi fallback dan relokasi repositori ini memerlukan pohon data yang dapat ditulis; kegagalan relokasi individu tidak fatal. Selalu menggunakan `.sb`, terlepas dari `bext=`. Lihat [Manajemen kernel](/preparing-and-customizing/Managing-Kernels) untuk alur instalasi dan aktivasi kernel yang didukung.

## Konstruksi union

MiniOS memilih `AUFS` jika kernel yang berjalan mendukungnya, dan jika tidak, akan menggunakan OverlayFS. `union=overlayfs` memilih OverlayFS. `union=aufs` meminta `AUFS`, tetapi akan kembali ke OverlayFS jika `AUFS` tidak tersedia.

Dengan `AUFS`, initrd pertama-tama melakukan mount union kosong dengan cabang perubahan yang dapat ditulis, lalu memasukkan setiap modul yang sudah di-mount sebagai cabang hanya-baca. Kegagalan membuat union bersifat fatal. Jika gagal saat menambahkan cabang `AUFS` secara individual, sistem akan berusaha semaksimal mungkin: proses boot tetap berlanjut dengan cabang yang sudah berhasil ditambahkan, sementara MiniOS tidak menandai persistensi sebagai aktif jika union tidak lengkap.

Dengan OverlayFS, seluruh set modul diberikan sebagai satu daftar `lowerdir` yang dibalik saat union di-mount. Layer yang dapat ditulis menyediakan `upperdir` dan `workdir`. Kegagalan melakukan mount union tersebut bersifat fatal. Urutan lower dari kiri ke kanan dan urutan penyisipan `AUFS` keduanya menerapkan aturan yang sama: modul dengan nomor lebih tinggi yang ditambahkan belakangan akan menyembunyikan path yang konflik dari modul sebelumnya.

Komposisi saat boot ini berbeda dengan aktivasi saat runtime. Setelah startup, `sb activate` dan `sb deactivate` hanya dapat mengubah root yang saat ini di-mount sebagai `AUFS`. Layer bawah OverlayFS tidak dapat diubah secara langsung. Aktivasi saat runtime tidak mengubah pilihan Next Boot, dan menambahkan modul Next Boot tidak mengaktifkannya pada root saat ini. Lihat [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` membuat pohon data RAM sebelum persistence dan koordinasi kernel.
Ia menyalin item berikut secara persis dari pohon data MiniOS yang dipilih:

- `config.conf`, yang wajib untuk jalur penyalinan ini.
- `authorized_keys` jika ada sebagai file reguler.
- Kandidat tingkat atas yang cocok dengan ekstensi yang dipilih oleh `load=` dan `noload=`.
- Kandidat yang cocok dengan ekstensi secara rekursif di bawah `modules/`, dengan direktori relatifnya tetap dipertahankan.
- Seluruh pohon `changes/` jika command line meminta persistence.

Ia tidak menyalin `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lain, modul yang tidak terpilih, atau tier modul persistence writable yang terpisah. Secara khusus, fallback repositori tidak dapat menggunakan direktori `kernels/` yang dihilangkan dari pohon RAM yang sudah dipangkas. Set modul yang disalin difilter sebelum tier modul persistence ditemukan.

Tidak ada preflight kapasitas RAM. Kegagalan menyalin `config.conf` atau `changes/` yang diminta akan keluar dari konteks eksekusi fungsi copy, namun pemanggilnya tidak selalu mengubah status itu menjadi penghentian boot yang bersih. Kegagalan menyalin `authorized_keys` akan dilaporkan tapi tidak menghentikan proses copy. Modul yang dipilih disalin melalui pipeline; kegagalan penyalinan modul individual akan dilaporkan, namun statusnya tidak selalu diteruskan untuk menghentikan jalur boot luar. Tidak ada rollback transaksional pada pohon RAM yang hanya terisi sebagian.

Setelah penyalinan, initrd mencoba melepaskan mount sumber, menghapus path data lamanya, dan memindahkan pohon RAM ke path tersebut. Hanya keberhasilan seluruh rangkaian ini yang menandai sumber sudah dilepas. Jika rangkaian gagal, boot tetap berlanjut menggunakan path staging RAM. Operasi detach ISO dan Ventoy terkait bersifat best effort.
Akibatnya, `toram=trim` bukan bukti bahwa perangkat boot dapat dicabut. Jangan cabut kecuali diagnostik memastikan filesystem, loop device, dan mapping device-mapper-nya sudah tidak di-mount atau tidak digunakan lagi.

## Rootcopy dan penyerahan root

Setelah mounting modul dan konstruksi union, initrd menyalin isi `minios/rootcopy/` yang terlihat langsung ke union yang telah dirakit. Glob shell `*` mengabaikan entri yang diawali titik di dalam `rootcopy/`, meskipun file tersembunyi di dalam direktori yang disalin tetap menjadi bagian dari salinan direktori tersebut. Ini adalah penyalinan file ke tampilan writable, bukan layer modul hanya-baca lain, sehingga dapat menimpa path yang disediakan oleh modul. Error penyalinan tidak dianggap fatal oleh fungsi ini.

MiniOS kemudian melakukan setup awal, menulis `fstab` root baru, dan mengeksekusi `rootcopy/run/preinit.sh` jika ada, dengan path union sebagai argumen pertama. Skrip ini berjalan di lingkungan initrd sebelum penyerahan root dan harus diperlakukan sebagai kode boot yang memiliki hak istimewa.

Pada batas akhir, initrd LiveKit memutar union yang telah dirakit ke `/`, menjaga initrd lama di bawah `/run/initramfs` untuk proses shutdown, dan mengeksekusi `init` root baru. Jalur Dracut menyiapkan union yang sama dan membiarkan Dracut melakukan `switch_root` terakhir. Setelah batas ini dilewati, startup biasa berjalan di dalam root yang telah disusun; perubahan file pada media boot tidak lagi membangun ulang set layer bawah yang dipilih untuk boot tersebut.

## Diagnostik aman

Utamakan inspeksi hanya-baca dan catat command line asli sebelum mengubah filter:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` menampilkan seleksi berbasis aturan saat ini, sedangkan `sb list` menampilkan layer yang benar-benar membentuk root yang berjalan. Perbedaan bisa menunjukkan kegagalan mount, penggantian basename, perubahan `AUFS` saat runtime, atau sumber seleksi yang berubah setelah boot.

Untuk kegagalan awal, tambahkan `debug` untuk menampilkan tracing shell, `timing` untuk timing tiap tahap, atau `rd.break` untuk membuka shell setelah setup initrd dan sebelum penyerahan root akhir. Pada shell tersebut, periksa `/memory/data`, `/memory/bundles`, mount, dan `/proc/cmdline`; jangan memperbaiki filesystem atau melepas media saat masih di-mount. Tangkap error mount atau copy pertama, bukan hanya gejala berikutnya. Lihat [Troubleshooting](/maintenance-and-recovery/Troubleshooting) untuk alur diagnostik aman yang lebih luas.

## Dokumentasi terkait

- [Mode boot](/using-minios/Boot-Modes)
- [Deteksi sistem](/reference/boot-process/System-Discovery)
- [Persistence](/reference/boot-process/Persistence-Internals)
- [Manajer Modul MiniOS](/preparing-and-customizing/Managing-Modules)
- [Membuat modul](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Manajemen kernel](/preparing-and-customizing/Managing-Kernels)
- [Pemecahan masalah](/maintenance-and-recovery/Troubleshooting)
