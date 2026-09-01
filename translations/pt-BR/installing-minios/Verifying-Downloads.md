---
updated: 2026-08-26
---

# Verificando downloads

As versões do MiniOS são publicadas na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases) e no [SourceForge](https://sourceforge.net/projects/minios-linux/). Cada ISO possui um arquivo correspondente cujo nome termina com `.iso.sha256`.

A verificação SHA-256 detecta downloads incompletos ou alterados. Ela não comprova quem criou os arquivos. Atualmente, a versão fornece apenas checksums, e não arquivos de assinatura criptográfica, portanto, esta página não descreve a verificação de assinaturas.

## Baixe ambos os arquivos

Baixe a ISO e seu respectivo arquivo `.sha256` da mesma versão no GitHub ou SourceForge. Mantenha ambos os arquivos no mesmo diretório. Os nomes base devem ser iguais, por exemplo:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Use os nomes da versão que você baixou nos comandos abaixo.

## Linux

Abra um terminal no diretório de download e execute:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Um download válido exibe o nome da ISO seguido de `OK`.

## macOS

Calcule o checksum da ISO:

```bash
shasum -a 256 minios-trixie-xfce-standard-amd64-5.1.1.iso
```

Exiba o checksum esperado:

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

Compare o valor calculado com o valor no início do arquivo `.sha256`. A comparação não diferencia maiúsculas de minúsculas.

## Se a verificação falhar

Não grave nem inicialize a ISO. Verifique se a ISO e o arquivo de checksum pertencem à mesma versão e edição, exclua a ISO com falha e faça o download novamente a partir das [releases oficiais do MiniOS](https://github.com/minios-linux/minios-live/releases).
