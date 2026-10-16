---
updated: 2026-10-06
program_commits:
    driveutility: a6d89354822576b4ca83320ca1c8415aca7e8a78
---

# Utilitário de disco

O Utilitário de disco é um utilitário de disco GTK de uso geral, incluído com MiniOS. Ele pode gravar uma imagem de disco existente, criar uma imagem a partir de um dispositivo físico, formatar um dispositivo inteiro ou apagá-lo. Não se limita a mídias MiniOS e não substitui o Instalador do MiniOS.

Abra-o no menu de aplicativos, em **Sistema**, ou execute:

```bash
driveutility
```

## Segurança

Gravar uma imagem, formatar e apagar são operações destrutivas. Antes de confirmar, verifique o dispositivo de destino, o modelo e a capacidade. Mantenha cópias de segurança de tudo que for importante e, se possível, desconecte unidades removíveis que não estejam relacionadas à operação.

Por padrão, os discos montados ficam ocultos. Você pode exibi-los explicitamente, mas o Utilitário de disco avisa antes de uma operação destrutiva, e o backend tenta desmontar o dispositivo selecionado e suas partições antes de alterá-lo. Se o estado de montagem for ambíguo ou um sistema de arquivos continuar montado, a operação falhará em vez de prosseguir com um sistema de arquivos ativo.

## Gravar uma imagem

**Gravar** copia uma imagem, byte a byte, para o dispositivo selecionado. Quando há suporte, o backend detecta imagens compactadas.

Entre os usos comuns estão gravar uma ISO MiniOS em uma mídia USB ou SD e restaurar uma imagem de dispositivo inteiro criada anteriormente.
Para uma ISO MiniOS, a gravação da imagem é feita em modo raw. A partição e o layout de inicialização da ISO são copiados exatamente como estão armazenados na imagem. Isso **não** cria uma partição de dados gravável adicional, cria uma sessão de persistência nem realiza uma implantação gerenciada do Instalador do MiniOS.

Após uma gravação em modo raw, a persistência ainda depende do modo de inicialização e do armazenamento gravável disponibilizado pela imagem resultante. Para um layout de destino gerenciado ou uma sessão pré-criada, use [Instalador do MiniOS](/installing-minios/MiniOS-Installer).

Exemplo de CLI:

```bash
sudo driveutility-write -s /path/to/minios.iso -t /dev/sdX
```

## Criar uma imagem de dispositivo

**Criar imagem** lê os dados de um dispositivo físico e os salva em um arquivo de imagem. O arquivo resultante pode permanecer sem compactação ou ser compactado durante a gravação.

As opções de compactação disponíveis são:

- gzip (`.gz`)
- bzip2 (`.bz2`)
- XZ (`.xz`)
- LZ4 (`.lz4`)
- Zstandard (`.zst`) quando o suporte necessário a zstd para Python estiver instalado

O aplicativo gráfico também pode atribuir o arquivo resultante ao usuário da área de trabalho, para que um backup criado como root possa ser usado imediatamente, sem precisar corrigir as permissões de propriedade separadamente.
Exemplo de CLI:

```bash
sudo driveutility-read -s /dev/sdX -t /path/to/backup.img -c zstd
```

A extensão correspondente à compactação é adicionada automaticamente pelo leitor da linha de comando.

## Formatar um dispositivo

**A formatação** cria um novo layout com um único sistema de arquivos no dispositivo selecionado. Os sistemas de arquivos disponíveis são:

- FAT32
- exFAT
- NTFS
- ext4

Você pode definir um rótulo para o volume. No caso do ext4, o Utilitário de disco pode atribuir o diretório raiz ao usuário e ao grupo selecionados.

A formatação é independente da gravação de uma ISO MiniOS. Os sistemas de arquivos disponíveis nesta página se aplicam à operação de formatação do Utilitário de disco; eles não alteram o layout do sistema de arquivos incorporado à gravação de uma ISO bruta.

Exemplo de CLI:

```bash
sudo driveutility-format -d /dev/sdX -f ext4 -u 1000 -g 1000 MYDISK
```

## Apagar um dispositivo

**O apagamento** seleciona entre operações de apagamento nativas do controlador, discard/TRIM e sobrescritas feitas pelo sistema, de acordo com o dispositivo selecionado e o método solicitado.

Os métodos disponíveis incluem:

- **Apagamento seguro** — seleciona automaticamente um método compatível com o controlador, quando disponível.
- **ATA Secure Erase / Enhanced Secure Erase** — executado pelo UDisks2 em unidades SATA/ATA compatíveis; dispositivos congelados ou sem suporte são rejeitados.
- **NVMe User Data Erase / Cryptographic Erase** — usa o NVMe Format NVM somente quando o controlador informa que oferece o recurso solicitado.
- **Discard / secure discard** — usa `blkdiscard` quando o dispositivo de blocos oferece suporte a discard.
- **Sobrescrita com zeros** — grava zeros a partir do sistema.
- **Sobrescrita com dados aleatórios** — grava dados aleatórios pelo número de passagens solicitado e pode adicionar uma passagem final com zeros.

O apagamento seguro feito pelo controlador não equivale a sobrescrever repetidamente cada bloco lógico a partir do sistema. A disponibilidade depende do firmware do dispositivo, das interfaces do kernel, do UDisks2, `nvme-cli` e do suporte a `blkdiscard`.
Em dispositivos NVMe, o Utilitário de disco preserva o formato LBA do namespace ativo, a configuração de metadados e a configuração de informações de proteção ao executar o Format NVM. Ele também recusa operações do controlador que possam afetar vários namespaces quando não é possível comprovar que o destino é seguro como uma operação de namespace único.

Exemplos:

```bash
sudo driveutility-wipe -d /dev/nvme0n1 -m secure
sudo driveutility-wipe -d /dev/sdX -m discard
sudo driveutility-wipe -d /dev/sdX -p 3 -t random -z
```

Use os controles de número de passagens de sobrescrita e tamanho parcial somente com os métodos tradicionais de zeros/aleatórios. O apagamento pelo controlador e o discard seguem o comando do dispositivo, e não uma quantidade de bytes definida pelo sistema.

## Ferramentas de linha de comando

O Utilitário de disco instala quatro comandos de baixo nível:

| Comando | Finalidade |
|---|---|
| `driveutility-write` | Grava uma imagem bruta ou compactada compatível em um dispositivo de blocos. |
| `driveutility-read` | Cria uma imagem bruta ou compactada a partir de um dispositivo de blocos. |
| `driveutility-format` | Cria armazenamento FAT32, exFAT, NTFS ou ext4 em um dispositivo. |
| `driveutility-wipe` | Apaga usando métodos de controlador, discard ou sobrescrita. |

Execute comandos destrutivos somente depois de verificar o dispositivo de destino exato. Consulte as páginas man instaladas e a saída de `--help` para ver as opções específicas de cada versão.

## Utilitário de disco versus MiniOS

Use **Utilitário de disco** quando a operação desejada for uma ação genérica de disco: gravação de imagem bruta, criação de imagem de dispositivo, formatação ou apagamento.

Use **Instalador do MiniOS** quando quiser uma implantação compatível com MiniOS, com controle sobre o posicionamento, as opções de sistema de arquivos e layout de inicialização, a seleção de módulos, a configuração ou a criação opcional de uma sessão live.

Para conhecer outras maneiras de gravar MiniOS em uma mídia, consulte [Métodos de instalação](/installing-minios/Installation-Methods). Para salvar alterações após a inicialização, consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Sessões e persistência](/using-minios/Sessions-and-Persistence).
