# Pemuatan modul initrd

MiniOS memilih dan me-mount set modulnya di initrd, sebelum root union diserahkan ke sistem init yang terpasang. Halaman ini menjelaskan perilaku initrd saat ini. Informasi ini berguna jika ada modul yang ditampilkan pada media boot namun tidak muncul di `noload=`, `bext=`, atau `toram=trim` sehingga menyebabkan boot berubah secara tak terduga.

## Tingkatan kandidat

Setelah menemukan direktori data MiniOS, biasanya `minios/`, initrd memindai kandidat modul dengan urutan berikut:

1. Entri yang langsung berada di dalam `minios/`. Pemindaian ini tidak rekursif.
2. Entri secara rekursif di bawah `minios/modules/`.
3. Entri secara rekursif di bawah `minios/modules/` pada sumber persistence yang dapat ditulis yang tercatat oleh initrd.

Tingkatan ketiga terpisah dari direktori `minios/modules/` pada pohon data read-only yang dipilih. Ini memungkinkan modul pengguna yang bersifat tahan lama untuk menimpa file dari ISO atau sumber read-only lainnya. Fitur ini hanya tersedia jika penemuan persistence telah mempublikasikan root yang dapat ditulis yang berisi direktori tersebut.

Path kandidat diratakan menjadi basename persis saat di-mount. Misalnya, `modules/work/50-extra.sb` dan `modules/test/50-extra.sb` sama-sama menggunakan mountpoint bernama `50-extra.sb`. Keduanya tidak menjadi dua layer yang dapat diakses secara independen. Kandidat pada tingkatan berikutnya dengan basename yang sama akan di-mount pada mountpoint yang sama dan menggantikan kandidat sebelumnya yang terlihat oleh proses penyusunan union. Oleh karena itu, basename yang sama harus diperlakukan sebagai satu slot pengganti, bukan sebagai cara untuk memuat beberapa modul dari direktori berbeda.

Format modul normal adalah image filesystem SquashFS reguler. Pemindaian initrd itu sendiri berbasis nama file: ia memilih path yang berakhiran ekstensi yang dikonfigurasi dan tidak terlebih dahulu memastikan bahwa setiap path adalah file reguler atau SquashFS yang valid. Pemindaian rekursif karenanya dapat menemukan objek filesystem lain dengan nama yang cocok. Kegagalan mount loop atau SquashFS akan dilaporkan oleh `mount`, namun kegagalan kandidat loop tersebut tidak langsung menyebabkan boot gagal dan proses boot dapat berlanjut dengan layer yang hilang. Validasi file yang meragukan dapat dilakukan dengan alur kerja inspeksi di [Membuat modul](/development/Creating-Modules.md).

## Urutan dan prioritas

Dalam proses penemuan, path diurutkan secara numerik berdasarkan basename. Angka di depan nama seperti `00-core.sb`, `01-kernel-VERSION.sb`, dan `50-extra.sb` adalah urutan modul. Basename tanpa angka di depan akan diurutkan secara numerik sebagai nol. Gunakan awalan angka yang eksplisit dan berbeda, jangan mengandalkan urutan yang sama.

Union akhir memberikan prioritas pada modul dengan nomor lebih besar (lebih baru) dibandingkan modul dengan nomor lebih kecil (lebih awal). Jika dua modul yang dipilih berisi path root-relative yang sama, file dari modul dengan prioritas lebih tinggi yang akan terlihat. Layer perubahan yang dapat ditulis memiliki prioritas di atas semua modul read-only.

Penggantian tingkatan terjadi sebelum urutan modul efektif ini. `50-extra.sb` pada tingkatan berikutnya akan menggantikan file dari tingkatan sebelumnya dengan basename yang sama persis, lalu awalan `50` menentukan di mana mount yang tersisa tersebut berada dalam union.

## Ekstensi bundle

Parameter boot `bext=` memilih ekstensi nama file yang digunakan untuk penemuan data, penyaringan kandidat, dan mounting modul. Nilai default-nya adalah `sb`, sehingga sufiks kandidat yang umum adalah `.sb`:

```text
bext=sb
```

Mengubah `bext` hanya mengubah sufiks nama file yang dipilih; tidak mengonversi file atau memverifikasi format filesystem-nya. Koordinasi kernel saat ini memang terbatas: kernel masih menggunakan nama literal `.sb` untuk `01-kernel-VERSION.sb`. Custom `bext` karenanya tidak mengganti nama atau mengoordinasikan fakta bahwa pemindaian kandidat non-`sb` tidak akan memilih file tersebut.

## Filter load dan noload

`load=` dan `noload=` adalah regular expression extended yang tidak terikat dan diterapkan pada string path kandidat yang dihasilkan oleh setiap tingkatan. Ini bukan daftar nama persis. Nilai sederhana seperti `kernel` akan cocok dengan teks tersebut di mana saja dalam path, sedangkan anchor harus ditulis secara eksplisit jika posisi tepat diperlukan. Path berbeda tergantung tingkatan: kandidat tingkat atas adalah basename, kandidat data rekursif menyertakan `modules/`, dan kandidat persistence adalah path absolut.

Tanda koma diubah menjadi alternasi regular expression. Contohnya:

```text
load=core,kernel,firmware
```

dievaluasi sebagai `core|kernel|firmware`. Karakter regular expression lainnya tidak di-escape.

Rentang numerik hanya akan diekspansi jika seluruh filter berupa satu rentang naik yang cocok dengan `^[0-9]+-[0-9]+$`. Misalnya, `load=04-06` akan menjadi alternatif `04|05|06`, dengan setiap nilai yang dihasilkan dipad paling sedikit dua digit. Rentang yang disisipkan dalam daftar koma atau ekspresi lain tidak akan diekspansi dan tetap bermakna ERE biasa.

Jika kedua parameter ada, initrd menerapkan `load=` terlebih dahulu lalu menghapus yang cocok dengan `noload=`. Jadi `noload=` yang berlaku. Tidak ada set modul inti atau kernel yang dilindungi: filter dapat mengecualikan `00-core`, `01-kernel` yang terkoordinasi, atau kandidat lain mana pun. Seleksi seperti ini dapat membangun root yang tidak lengkap atau mencegah boot.

## Koordinasi kernel yang sedang berjalan

Versi kernel yang sedang berjalan diambil dari token `vmlinuz-VERSION` pada command line kernel jika tersedia, dengan `uname -r` sebagai cadangan. Sebelum me-mount modul, initrd mengoordinasikan triplet tingkat atas berikut:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Jika ada anggota yang hilang, initrd akan mencari ketiga file tersebut di:

```text
minios/kernels/VERSION/
```

Jika triplet repository lengkap, modul akan disalin ke `minios/` dan file boot ke `minios/boot/`. Salinan parsial akan dibersihkan. Jika triplet tidak lengkap, setup kernel akan gagal, namun proses akan tetap lanjut ke tahap mounting modul normal; sistem yang dihasilkan masih bisa gagal di kemudian hari karena modul userspace kernel yang berjalan tidak ada.

File tingkat atas lain yang cocok dengan `01-kernel-*.sb` dianggap tidak aktif. Initrd akan mencoba memindahkan setiap modul tidak aktif beserta file `vmlinuz` dan `initrfs` yang cocok ke `minios/kernels/VERSION/`. Operasi fallback repository dan relokasi ini memerlukan pohon data yang dapat ditulis; kegagalan relokasi individual tidak fatal. Selalu menggunakan `.sb`, terlepas dari `bext=`. Lihat [Manajemen Kernel](/administration/Kernel-Management.md) untuk alur kerja instalasi dan aktivasi kernel yang didukung.

## Konstruksi Union

MiniOS memilih `AUFS` ketika kernel yang berjalan mendukungnya, dan jika tidak, akan menggunakan OverlayFS. `union=overlayfs` memilih OverlayFS. `union=aufs` meminta `AUFS`, namun akan kembali ke OverlayFS jika `AUFS` tidak tersedia.

Dengan `AUFS`, initrd pertama-tama me-mount union kosong dengan branch perubahan yang dapat ditulis, lalu memasukkan setiap modul yang ter-mount sebagai branch hanya-baca. Kegagalan membuat union bersifat fatal. Kegagalan saat menambahkan branch `AUFS` secara individual akan dianggap sebagai upaya terbaik: proses boot tetap berlanjut dengan branch yang sudah ditambahkan, namun otoritas persistensi tidak dipublikasikan untuk union yang tidak lengkap.

Dengan OverlayFS, seluruh set modul diberikan sebagai satu daftar `lowerdir` yang diurutkan terbalik saat union di-mount. Layer yang dapat ditulis menyediakan `upperdir` dan `workdir`. Kegagalan me-mount union tersebut bersifat fatal. Urutan lower dari kiri ke kanan dan urutan penyisipan `AUFS` keduanya menerapkan aturan yang sama: modul dengan nomor lebih tinggi yang muncul belakangan akan menyembunyikan path yang bertabrakan dari modul sebelumnya.

Komposisi saat boot ini berbeda dengan aktivasi saat runtime. Setelah startup, `sb activate` dan `sb deactivate` hanya dapat mengubah root yang saat ini di-mount sebagai `AUFS`. Layer lower OverlayFS tidak dapat diubah secara langsung. Aktivasi saat runtime tidak mengubah pilihan Next Boot, dan menambahkan modul Next Boot tidak akan mengaktifkannya di root saat ini. Lihat [Module Manager](/administration/Module-Manager.md).

## Toram trim

`toram=trim` membuat pohon data RAM sebelum persistence dan koordinasi kernel. Ia menyalin tepat item berikut dari pohon data MiniOS yang dipilih:

- `config.conf`, yang diwajibkan oleh jalur salinan ini.
- `authorized_keys` jika ada sebagai file reguler.
- Kandidat tingkat atas yang cocok ekstensi yang dipilih oleh `load=` dan `noload=`.
- Kandidat yang cocok ekstensi secara rekursif di bawah `modules/`, dengan direktori relatifnya dipertahankan.
- Seluruh pohon `changes/` jika command line meminta persistence.

Ia tidak menyalin `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, log, data nonmodul lain, modul yang tidak terpilih, atau tingkatan modul writable-persistence yang terpisah. Secara khusus, fallback repository tidak dapat menggunakan direktori `kernels/` yang dihilangkan dari pohon RAM yang sudah dipangkas. Set modul yang disalin akan difilter sebelum tingkatan modul persistence ditemukan.

Tidak ada pemeriksaan kapasitas RAM sebelumnya. Kegagalan menyalin `config.conf` atau `changes/` yang diminta akan keluar dari konteks eksekusi fungsi salin, namun pemanggilnya tidak selalu mengonversi status itu menjadi penghentian boot yang bersih. Kegagalan menyalin `authorized_keys` akan dilaporkan tetapi tidak menghentikan proses salin. Modul yang dipilih disalin melalui pipeline; kegagalan salin modul individual akan dilaporkan, namun statusnya tidak selalu diteruskan untuk menghentikan jalur boot luar. Tidak ada rollback transaksional pada pohon RAM yang terisi sebagian.

Setelah penyalinan, initrd mencoba untuk unmount sumber mount, menghapus path data lama, dan memindahkan pohon RAM ke path tersebut. Hanya keberhasilan seluruh rangkaian ini yang menandai sumber telah terlepas. Jika rangkaian gagal, boot akan berlanjut menggunakan path staging RAM sebagai gantinya. Operasi detach ISO dan Ventoy terkait bersifat best effort. Akibatnya, `toram=trim` bukanlah bukti bahwa perangkat boot dapat dicabut. Jangan cabut kecuali diagnostik memastikan filesystem, loop device, dan pemetaan device-mapper-nya sudah tidak di-mount atau digunakan.

## Rootcopy dan root handoff

Setelah mounting modul dan konstruksi union, initrd menyalin isi yang terlihat dari `minios/rootcopy/` langsung ke union yang telah dirakit. Glob shell `*` mengabaikan entri yang diawali titik di dalam `rootcopy/`, meskipun file tersembunyi di dalam direktori yang disalin tetap menjadi bagian dari salinan direktori tersebut. Ini adalah penyalinan file ke tampilan yang dapat ditulis, bukan layer modul read-only lain, sehingga dapat menimpa path yang disediakan oleh modul. Error penyalinan tidak dijadikan fatal oleh fungsi ini.

MiniOS kemudian melakukan setup awal, menulis `fstab` root baru, dan menjalankan `rootcopy/run/preinit.sh` jika ada, dengan path union sebagai argumen pertama. Skrip ini berjalan di lingkungan initrd sebelum root handoff dan harus diperlakukan sebagai kode boot yang memiliki hak istimewa.

Pada batas akhir, LiveKit initrd mem-pivot union yang telah dirakit ke `/`, menjaga initrd lama di bawah `/run/initramfs` untuk tugas shutdown, dan mengeksekusi `init` root baru. Path Dracut menyiapkan union yang sama dan membiarkan Dracut melakukan `switch_root` terakhir. Setelah batas ini dilewati, startup biasa berjalan di dalam root yang telah disusun; mengubah file pada media boot tidak lagi membangun ulang set layer lower yang dipilih untuk boot tersebut.

## Diagnostik Aman

Utamakan inspeksi hanya-baca dan catat command line asli sebelum mengubah filter:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` menampilkan seleksi berbasis aturan saat ini, sedangkan `sb list` menampilkan layer yang benar-benar membentuk root yang sedang berjalan. Perbedaan bisa menunjukkan kegagalan mount, penggantian basename, perubahan `AUFS` saat runtime, atau sumber seleksi yang berubah setelah boot.

Untuk kegagalan awal, tambahkan `debug` untuk menampilkan tracing shell, `timing` untuk timing setiap tahap, atau `rd.break` untuk membuka shell setelah setup initrd dan sebelum root final diambil alih. Pada shell tersebut, periksa `/memory/data`, `/memory/bundles`, mount, dan `/proc/cmdline`; jangan memperbaiki filesystem atau mengeluarkan media selama masih ter-mount. Tangkap error mount atau copy pertama, bukan hanya gejala yang muncul belakangan. Lihat [Troubleshooting](/administration/Troubleshooting.md) untuk alur kerja diagnostik aman yang lebih luas.

## Dokumentasi terkait

- [Boot modes](/configuration/Boot-Modes.md)
- [System discovery](/configuration/Initrd-System-Discovery.md)
- [Persistence](/configuration/Initrd-Persistence.md)
- [Module Manager](/administration/Module-Manager.md)
- [Creating modules](/development/Creating-Modules.md)
- [Kernel management](/administration/Kernel-Management.md)
- [Troubleshooting](/administration/Troubleshooting.md)
