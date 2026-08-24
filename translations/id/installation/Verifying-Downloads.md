# Memverifikasi unduhan

Rilis MiniOS dipublikasikan di [Halaman Rilis GitHub resmi](https://github.com/minios-linux/minios-live/releases). Setiap aset rilis ISO memiliki file pendamping dengan nama yang diakhiri `.iso.sha256`.

Verifikasi SHA-256 mendeteksi unduhan yang tidak lengkap atau telah diubah. Namun, ini tidak membuktikan siapa pembuat file tersebut. Rilis saat ini hanya menyediakan checksum, bukan file tanda tangan kriptografi, sehingga halaman ini tidak membahas verifikasi tanda tangan.

## Unduh kedua file

Unduh file ISO dan file `.sha256` yang sesuai dari rilis GitHub yang sama. Simpan kedua file tersebut di direktori yang sama. Nama dasar keduanya harus sama, misalnya:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Gunakan nama dari rilis yang Anda unduh pada perintah di bawah ini.

## Linux

Buka terminal di direktori unduhan dan jalankan:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Unduhan yang valid akan menampilkan nama ISO diikuti oleh `OK`.

## macOS

Hitung checksum ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Tampilkan checksum yang diharapkan:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Bandingkan kedua nilai heksadesimal 64 karakter tersebut secara persis.

## Windows PowerShell

Buka PowerShell di direktori unduhan dan jalankan:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Bandingkan nilai yang dihitung dengan nilai di awal file `.sha256`. Perbandingan ini tidak sensitif terhadap huruf besar/kecil.

## Jika verifikasi gagal

Jangan menulis atau melakukan boot pada ISO tersebut. Pastikan file ISO dan file checksum berasal dari rilis dan edisi yang sama, hapus ISO yang gagal, lalu unduh kembali dari [rilis MiniOS](https://github.com/minios-linux/minios-live/releases) resmi.
