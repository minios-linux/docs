---
updated: 2026-08-26
---

# Verifica dei download

MiniOS è disponibile nella pagina ufficiale [GitHub Releases](https://github.com/minios-linux/minios-live/releases) e su [SourceForge](https://sourceforge.net/projects/minios-linux/). A ogni file ISO corrisponde un file con lo stesso nome che termina con `.iso.sha256`.

La verifica SHA-256 rileva download incompleti o modificati. Non consente di verificare chi ha creato i file. La release include attualmente checksum, ma non file di firma crittografica; per questo motivo, questa pagina non descrive la verifica delle firme.

## Scarica entrambi i file

Scarica il file ISO e il relativo file `.sha256` dalla stessa release su GitHub o SourceForge. Salva entrambi i file nella stessa directory. I nomi senza estensione devono corrispondere, ad esempio:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Nei comandi seguenti, usa i nomi dei file della release che hai scaricato.

## Linux

Apri un terminale nella directory di download ed esegui:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Se il download è valido, viene visualizzato il nome del file ISO seguito da `OK`.

## macOS

Calcola il checksum del file ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Visualizza il checksum previsto:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Confronta esattamente i due valori esadecimali di 64 caratteri.

## Windows PowerShell

Apri PowerShell nella directory di download ed esegui:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Confronta il valore calcolato con quello all’inizio del `.sha256` file. Il confronto non distingue tra maiuscole e minuscole.

## Se la verifica non riesce

Non scrivere né avviare l’ISO. Verifica che l’ISO e il file di checksum appartengano alla stessa release e alla stessa edizione, elimina l’ISO non verificato e scaricalo di nuovo dalle [MiniOS release](https://github.com/minios-linux/minios-live/releases).
