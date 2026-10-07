---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitário de disco

O Utilitário de disco é um utilitário de disco geral GTK incluído com MiniOS. Ele pode gravar uma imagem de disco existente, criar uma imagem a partir de um dispositivo físico, formatar um dispositivo inteiro ou apagá-lo. Não é limitado a mídias MiniOS e não substitui o Instalador do MiniOS.

Abra pelo menu de aplicativos em **Sistema**, ou execute:

```bash
driveutility
```

## Segurança

Gravar uma imagem, formatar e apagar são operações destrutivas. Verifique o destino pelo dispositivo, modelo e capacidade antes de confirmar. Mantenha backups de tudo que for importante e desconecte outros dispositivos removíveis quando possível.

Discos montados são ocultados por padrão. Você pode exibi-los explicitamente, mas o Utilitário de disco avisa antes de operações destrutivas e o backend tenta desmontar o dispositivo selecionado e suas partições antes de alterá-lo. Se o estado de montagem for ambíguo ou algum sistema de arquivos permanecer montado, a operação falha em vez de continuar por baixo de um sistema de arquivos ativo.

## Gravar uma imagem

**Gravar** copia uma imagem byte a byte para o dispositivo selecionado. Entradas de imagem compactadas são detectadas pelo backend quando suportado.

Usos típicos incluem gravar um ISO MiniOS em um USB ou SD, ou restaurar uma imagem de dispositivo inteiro criada anteriormente.
Para um ISO MiniOS, trata-se de uma gravação bruta da imagem. Isso copia a partição e o layout de boot do ISO exatamente como estão na imagem. Não **cria** uma partição adicional de dados gravável, não cria sessão de persistência nem realiza uma implantação gerenciada pelo Instalador do MiniOS.

A persistência após uma gravação bruta ainda depende do modo de boot e do armazenamento gravável que a imagem resultante disponibiliza. Para um layout de destino gerenciado ou sessão pré-criada, use [Instalador do MiniOS](/installing-minios/MiniOS-Installer).

Exemplo de CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Criar uma imagem do dispositivo

**Criar imagem** lê um dispositivo físico e salva em um arquivo de imagem. A saída pode permanecer bruta ou ser compactada durante a gravação.

As opções de compactação suportadas são:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) quando o suporte Python zstd necessário está instalado

O aplicativo gráfico também pode atribuir o arquivo resultante ao usuário da área de trabalho, assim um backup criado como root já fica utilizável sem precisar corrigir permissões.
Exemplo de CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

A extensão específica da compactação é adicionada automaticamente pelo leitor de linha de comando.

## Formatar um dispositivo

**Formatar** cria um novo layout de sistema de arquivos único no dispositivo selecionado. As opções atuais de sistema de arquivos são:

- FAT32
- exFAT
- NTFS
- ext4

Você pode definir um rótulo de volume. Para ext4, o Utilitário de disco pode atribuir o diretório raiz ao usuário e grupo selecionados.

A formatação é independente da gravação de um ISO MiniOS. As opções de sistema de arquivos nesta página se referem à operação de formatação do Utilitário de disco; elas não alteram o layout de sistema de arquivos embutido em uma gravação bruta de ISO.

Exemplo de CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Apagar um dispositivo

**Apagar** seleciona entre operações de apagamento nativas do controlador, descarte/TRIM e sobrescritas pelo host, de acordo com o dispositivo selecionado e o método solicitado.

Backends atuais incluem:

- **Apagamento seguro** — seleciona automaticamente um método suportado pelo controlador quando disponível.
- **ATA Secure Erase / Enhanced Secure Erase** — executado via UDisks2 para drives SATA/ATA suportados; dispositivos congelados ou não suportados são rejeitados.
- **NVMe User Data Erase / Cryptographic Erase** — usa NVMe Format NVM apenas quando o controlador informa a capacidade solicitada.
- **Descartar / descarte seguro** — usa `blkdiscard` quando o dispositivo de bloco suporta descarte.
- **Sobrescrita com zeros** — grava zeros a partir do host.
- **Sobrescrita aleatória** — grava dados aleatórios pelo número de passagens solicitado e pode adicionar uma passagem final de zeros.

O apagamento seguro pelo controlador não equivale a sobrescrever repetidamente cada bloco lógico pelo host. A disponibilidade depende do firmware do dispositivo, das interfaces do kernel, do UDisks2, `nvme-cli` e do suporte a `blkdiscard`.
Para dispositivos NVMe, o Utilitário de disco preserva o formato LBA do namespace ativo, a configuração de metadados e de informações de proteção ao emitir o Format NVM. Também recusa operações de controlador cujo escopo possa afetar múltiplos namespaces quando não for possível garantir que a operação é segura para um único namespace.

Exemplos:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Use os controles de número de passagens e tamanho parcial apenas para os métodos tradicionais de sobrescrita zero/aleatória. O apagamento pelo controlador e o descarte funcionam conforme o comando do dispositivo, não por contagem de bytes do host.

## Ferramentas de linha de comando

O Utilitário de disco instala quatro comandos de baixo nível:

| Comando | Finalidade |
|---|---|
| `driveutility-write` | Grava uma imagem bruta ou compactada suportada em um dispositivo de bloco. |
| `driveutility-read` | Cria uma imagem bruta ou compactada a partir de um dispositivo de bloco. |
| `driveutility-format` | Cria armazenamento FAT32, exFAT, NTFS ou ext4 em um dispositivo. |
| `driveutility-wipe` | Apaga usando métodos do controlador, descarte ou sobrescrita. |

Todos os comandos destrutivos devem ser executados somente após verificar exatamente o dispositivo de destino. Consulte as páginas de manual instaladas e a saída do comando `--help` para opções específicas da versão.

## Utilitário de disco versus Instalador do MiniOS

Use **Utilitário de disco** quando a operação desejada for uma ação genérica de disco: gravação bruta de imagem, criação de imagem de dispositivo, formatação ou apagamento.

Use **Instalador do MiniOS** quando você quiser uma implantação com reconhecimento de MiniOS, com controle de local de instalação, escolha de sistema de arquivos e layout de boot, seleção de módulos, configuração ou criação opcional de sessão live.

Para outras formas de colocar o MiniOS na mídia, veja [Métodos de instalação](/installing-minios/Installation-Methods). Para salvar alterações após o boot, veja [Modos de boot](/using-minios/Boot-Modes) e [Sessões e persistência](/using-minios/Sessions-and-Persistence).
