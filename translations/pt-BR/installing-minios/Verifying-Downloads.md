---
updated: 2026-08-26
---

# Verificação de downloads

MiniOS são publicados na página oficial de [lançamentos do GitHub](https://github.com/minios-linux/minios-live/releases) e no [SourceForge](https://sourceforge.net/projects/minios-linux/). Cada arquivo ISO tem um arquivo correspondente cujo nome termina em `.iso.sha256`.

A verificação SHA-256 detecta downloads incompletos ou alterados. Ela não comprova quem criou os arquivos. No momento, o lançamento fornece somas de verificação, mas não arquivos de assinatura criptográfica; por isso, esta página não descreve a verificação de assinaturas.

## Baixe os dois arquivos

Baixe o arquivo ISO e o arquivo `.sha256` correspondente do mesmo lançamento no GitHub ou no SourceForge. Mantenha os dois arquivos no mesmo diretório. Os nomes-base devem corresponder, por exemplo:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Use os nomes do lançamento que você baixou nos comandos abaixo.

## Linux

Abra um terminal no diretório de download e execute:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Um download válido exibe o nome do arquivo ISO seguido de `OK`.

## macOS

Calcule a soma de verificação do arquivo ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Exiba a soma de verificação esperada:

```bash
cat minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compare exatamente os dois valores hexadecimais de 64 caracteres.

## Windows PowerShell

Abra o PowerShell no diretório de download e execute:

```powershell
(Get-FileHash .\minios-trixie-xfce-standard-amd64-5.1.1.iso -Algorithm SHA256).Hash.ToLower()
Get-Content .\minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Compare o valor calculado com o valor no início do `.sha256` arquivo. A comparação não diferencia maiúsculas de minúsculas.

## Se a verificação falhar

Não grave nem inicialize a ISO. Verifique se a ISO e o arquivo de checksum pertencem à mesma versão e edição, exclua a ISO com falha e baixe-a novamente na página oficial de [MiniOS lançamentos](https://github.com/minios-linux/minios-live/releases).
