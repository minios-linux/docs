# Compondo imagens ISO do MiniOS pela linha de comando

`minios-image-compose` é o backend de linha de comando fornecido com o MiniOS Image Builder. Ele substitui a antiga ferramenta `sb2iso`. O comando remasteriza uma árvore de conteúdo MiniOS existente, podendo alterar o conjunto de módulos e a configuração suportada, verifica o resultado e publica uma ISO inicializável.

Use o [MiniOS Image Builder](/development/Image-Builder.md) gráfico para um fluxo de trabalho guiado. Utilize este comando diretamente para scripts, automação ou builds reproduzíveis via linha de comando. Para uma compilação completa a partir do código-fonte, utilize [Building MiniOS](/development/Building-MiniOS.md).

## Uso básico

A partir de uma sessão live do MiniOS em execução, crie uma ISO com a fonte MiniOS detectada e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Não prefixe o comando completo com `sudo` ou `pkexec`. A composição, verificação e publicação são executadas como o usuário atual. Apenas a captura de sessão opcional pode invocar o backend confiável `/usr/bin/savechanges` via PolicyKit.

O nome padrão do arquivo de saída é `minios-YYYYMMDD_HHMM.iso`. Um destino já existente será recusado, a menos que `--overwrite` seja informado explicitamente.

## Selecionar uma fonte

Sem `--source`, o comando detecta o conteúdo MiniOS utilizado pela sessão atual do LiveKit ou dracut. Para remasterizar outra árvore MiniOS montada, especifique o diretório que contém `boot/` e os módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

A fonte é apenas leitura e nunca é modificada. Arquivos ISO e mídias ópticas devem ser montados antes de usar sua árvore de conteúdo MiniOS pela CLI. O Image Builder gráfico pode montar essas fontes via `udisksctl`.

## Selecionar módulos

Módulos adicionais `.sb` são argumentos posicionais:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

O comando valida cada módulo como um arquivo SquashFS legível e que não seja link simbólico. Módulos cujos nomes começam com dois dígitos e um hífen são posicionados no nível superior do MiniOS. Outros módulos adicionados são colocados em `minios/modules/`. Colisões de nomes base duplicados ou que diferem apenas por maiúsculas/minúsculas são rejeitadas.

Exclua caminhos de origem com uma expressão regular POSIX estendida:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Arquivos de boot obrigatórios, kernel e initramfs, módulos principais, o menu de boot selecionado e a configuração escolhida não podem ser excluídos.

Crie módulos reutilizáveis antes de compor a ISO. Veja
[Criando módulos](/development/Creating-Modules.md) e
[MiniOS Module Manager](/administration/Module-Manager.md).

## Configuração e manifesto

`--config FILE` instala o arquivo regular selecionado como `minios/config.conf`. O padrão é `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

O manifesto opcional deve ser um objeto JSON. Rótulos de volume devem conter de 1 a 32 caracteres ASCII imprimíveis; rótulos fora do conjunto estrito ISO 9660 (maiúsculas, dígitos e sublinhado) geram um aviso.

## Capturar alterações da sessão

A captura de sessão é opcional e se aplica à camada gravável da sessão MiniOS em execução. Ela é aceita para uma fonte explícita apenas quando essa fonte possui a mesma impressão digital do módulo base do sistema em execução.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Perfis disponíveis:

- `exact` captura toda alteração representável e pode incluir credenciais, dados pessoais, logs, estado do navegador e identidade da máquina.
- `clean` utiliza uma lista restrita voltada a software. Reduz a exposição, mas não garante que o resultado não contenha segredos.
- `selected` usa uma seleção de inventário produzida por uma interface compatível ou fluxo de trabalho `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefira módulos e configuração declarativa à captura de sessão quando a ISO for compartilhada. Veja [MiniOS Image Builder](/development/Image-Builder.md) para o modelo de privacidade e fluxo de revisão.

## Personalizar o comportamento de boot

A CLI pode alterar layouts suportados do GRUB e SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` aceita `resume`, `new`, `choose`, `fresh` ou `toram`.
`--menu` aceita `multilang` ou um locale suportado como `en_US`, `ru_RU` ou `de_DE`. Argumentos do kernel são validados e adicionados sem avaliação de shell. Layouts de menu de boot não suportados ou ambíguos são rejeitados em vez de serem modificados por tentativa.

## Adicionar arte ou overlay de sistema de arquivos

Substitua o fundo do boot por um PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empacote uma árvore de diretórios preparada como um módulo de overlay de imagem de propriedade do root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

O overlay é interpretado em relação à raiz da imagem. Ele não executa scripts, instala pacotes ou abre um chroot. Links inseguros, arquivos especiais, cruzamentos de sistemas de arquivos e colisões de destino são rejeitados.

## Verificação e publicação

Antes da publicação, `minios-image-compose` verifica a árvore de sistema de arquivos da ISO, rótulo de volume, registros de boot BIOS e UEFI, área do sistema, arquivos de boot, módulos e personalizações solicitadas. Módulos de overlay gerados e módulos de sessão capturada são extraídos e conferidos com seus metadados e somas registrados.

A ISO é construída em um diretório privado no sistema de arquivos de destino e publicada de forma atômica apenas após a verificação ser concluída com sucesso. Alteração de entrada, falha de verificação, cancelamento ou espaço insuficiente no destino impedem a publicação. Um destino anterior permanece inalterado, a menos que uma build `--overwrite` explicitamente aprovada atinja a publicação atômica.

Crie uma soma de verificação e realize um teste de boot separado após uma build bem-sucedida:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste dos caminhos de boot BIOS e UEFI pretendidos em uma máquina virtual descartável ou em hardware adequado.

## Referência de comandos

Use o manual instalado e a saída de ajuda para a versão exata do backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Opções comuns incluem:

| Opção | Finalidade |
|---|---|
| `-n`, `--name FILE` | Define o caminho de saída. |
| `-e`, `--exclude REGEX` | Exclui caminhos de origem correspondentes. |
| `--source DIR` | Seleciona uma árvore de conteúdo MiniOS explícita. |
| `--config FILE` | Seleciona a configuração live embutida na ISO. |
| `--manifest FILE` | Inclui um manifesto JSON validado para o build. |
| `--capture-changes MODE` | Captura alterações de sessão `exact`, `clean` ou `selected`. |
| `--boot-timeout SECONDS` | Define o tempo limite do menu de boot de 0 a 300 segundos. |
| `--default-boot MODE` | Seleciona a ação padrão da sessão MiniOS. |
| `--kernel-args TEXT` | Adiciona argumentos globais validados ao kernel. |
| `--boot-background PNG` | Substitui a arte de boot suportada. |
| `--overlay-directory DIR` | Adiciona uma camada de sistema de arquivos declarativa. |
| `--menu TYPE` | Seleciona um menu multilíngue ou localizado. |
| `--overwrite` | Permite explicitamente substituir uma saída existente. |

O comando retorna código diferente de zero caso falhem as verificações de fonte, módulo, personalização, armazenamento, verificação ou publicação. Não distribua uma saída a menos que o comando tenha sido concluído com sucesso e a soma de verificação e os caminhos de boot resultantes tenham sido testados.
