---
updated: 2026-08-26
---

# Memverifikasi unduhan

Rilis MiniOS dipublikasikan di halaman resmi [GitHub Releases](https://github.com/minios-linux/minios-live/releases) dan [SourceForge](https://sourceforge.net/projects/minios-linux/). Setiap ISO memiliki file pasangan dengan nama yang diakhiri `.iso.sha256`.

Verifikasi SHA-256 mendeteksi unduhan yang tidak lengkap atau telah diubah. Verifikasi ini tidak membuktikan siapa yang membuat file tersebut. Rilis saat ini menyediakan checksum, bukan file tanda tangan kriptografis, jadi halaman ini tidak menjelaskan verifikasi tanda tangan.

## Unduh kedua file

Unduh ISO dan file pasangan `.sha256` dari rilis yang sama di GitHub atau SourceForge. Simpan kedua file di direktori yang sama. Nama dasar keduanya harus sama, contohnya:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Gunakan nama dari rilis yang Anda unduh dalam perintah di bawah ini.

## Linux

Buka terminal di direktori unduhan, lalu jalankan:

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

Buka PowerShell di direktori unduhan, lalu jalankan:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Bandingkan nilai yang dihitung dengan nilai di awal file `.sha256`. Perbandingan ini tidak peka huruf besar-kecil.

## Jika verifikasi gagal

Jangan menulis ISO ke media atau melakukan boot darinya. Pastikan file ISO dan checksum berasal dari rilis dan edisi yang sama, hapus file ISO yang gagal diverifikasi, lalu unduh kembali dari situs resmi [MiniOS rilis](https://github.com/minios-linux/minios-live/releases).
