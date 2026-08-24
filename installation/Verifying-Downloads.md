# Verifying downloads

MiniOS releases are published on the official [GitHub Releases page](https://github.com/minios-linux/minios-live/releases). Each ISO release asset has a matching file whose name ends in `.iso.sha256`.

SHA-256 verification detects an incomplete or altered download. It does not prove who created the files. The release currently provides checksums, not cryptographic signature files, so this page does not describe signature verification.

## Download both files

Download the ISO and its matching `.sha256` file from the same GitHub release. Keep both files in the same directory. Their base names must match, for example:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Use the names from the release you downloaded in the commands below.

## Linux

Open a terminal in the download directory and run:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

A valid download reports the ISO name followed by `OK`.

## macOS

Calculate the ISO checksum:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Display the expected checksum:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compare the two 64-character hexadecimal values exactly.

## Windows PowerShell

Open PowerShell in the download directory and run:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compare the calculated value with the value at the start of the `.sha256` file. The comparison is not case-sensitive.

## If verification fails

Do not write or boot the ISO. Check that the ISO and checksum file belong to the same release and edition, delete the failed ISO, and download it again from the official [MiniOS releases](https://github.com/minios-linux/minios-live/releases).
