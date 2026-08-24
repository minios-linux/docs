# Verificando downloads

As versões do MiniOS são publicadas na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases). Cada arquivo ISO lançado possui um arquivo correspondente cujo nome termina com `.iso.sha256`.

A verificação SHA-256 detecta downloads incompletos ou alterados. Ela não comprova quem criou os arquivos. Atualmente, a versão fornece apenas checksums, não arquivos de assinatura criptográfica, portanto esta página não descreve a verificação de assinaturas.

## Baixe ambos os arquivos

Baixe o ISO e seu arquivo correspondente `.sha256` da mesma release no GitHub. Mantenha ambos os arquivos no mesmo diretório. Os nomes base devem ser iguais, por exemplo:

```text
minios-trixie-xfce-standard-amd64-5.1.1.iso
minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Use os nomes da release que você baixou nos comandos abaixo.

## Linux

Abra um terminal no diretório de download e execute:

```bash
sha256sum --check minios-trixie-xfce-standard-amd64-5.1.1.iso.sha256
```

Um download válido exibe o nome do ISO seguido por `OK`.

## macOS

Calcule o checksum do ISO:

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

Não grave nem inicialize o ISO. Verifique se o ISO e o arquivo de checksum pertencem à mesma release e edição, exclua o ISO com falha e faça o download novamente a partir dos [releases oficiais do MiniOS](https://github.com/minios-linux/minios-live/releases).
