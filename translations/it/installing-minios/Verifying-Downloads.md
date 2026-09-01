---
updated: 2026-08-26
---

# Verifica dei download

Le release di MiniOS sono pubblicate sulla [pagina ufficiale delle release su GitHub](https://github.com/minios-linux/minios-live/releases) e su [SourceForge](https://sourceforge.net/projects/minios-linux/). Ogni ISO ha un file corrispondente il cui nome termina con `.iso.sha256`.

La verifica SHA-256 rileva un download incompleto o alterato. Non prova chi ha creato i file. Attualmente la release fornisce checksum, non file di firma crittografica, quindi questa pagina non descrive la verifica delle firme.

## Scarica entrambi i file

Scarica l’ISO e il relativo file `.sha256` dalla stessa release su GitHub o SourceForge. Conserva entrambi i file nella stessa cartella. I loro nomi base devono corrispondere, ad esempio:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Utilizza i nomi della release che hai scaricato nei comandi qui sotto.

## Linux

Apri un terminale nella cartella di download ed esegui:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Un download valido mostra il nome dell’ISO seguito da `OK`.

## macOS

Calcola il checksum dell’ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Visualizza il checksum atteso:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Confronta esattamente i due valori esadecimali di 64 caratteri.

## Windows PowerShell

Apri PowerShell nella cartella di download ed esegui:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Confronta il valore calcolato con quello all’inizio del file `.sha256`. Il confronto non è sensibile alle maiuscole/minuscole.

## Se la verifica fallisce

Non scrivere né avviare l’ISO. Controlla che l’ISO e il file checksum appartengano alla stessa release e edizione, elimina l’ISO non valido e scaricalo nuovamente dalle [release ufficiali di MiniOS](https://github.com/minios-linux/minios-live/releases).
