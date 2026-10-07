---
updated: 2026-10-06
program_commits:
    minios-image-builder: bf84d50bfe9461f4e9300033c5855ec8fa387552
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Criando imagens personalizadas MiniOS

O Construtor de imagens MiniOS é um aplicativo GTK para remasterizar uma imagem MiniOS existente. Ele seleciona conteúdo de uma sessão MiniOS atual, arquivo ISO ou disco óptico, aplica personalizações declarativas e usa`minios-image-compose` para gerar um ISO inicializável e verificado.

O construtor é executado dentro do MiniOS. Ele não modifica a mídia de origem selecionada.

## Escolha o fluxo de trabalho correto

O Construtor de imagens MiniOS remasteriza uma imagem binária MiniOS existente. Ele não substitui nenhum destes fluxos de trabalho:

- **Compilar MiniOS a partir do código-fonte:** use o `minios-live` sistema de build ao alterar listas de pacotes da distribuição, configuração de build, camada do kernel, artefatos de boot ou cadeia de módulos reproduzível compilada do código-fonte. Veja [Compilando MiniOS](/development/Building-MiniOS).
- **Criar um módulo reutilizável:** use `apt2sb`, `script2sb`, `chroot2sb`, ou outras ferramentas de módulo quando o objetivo for um `.sb` camada independente. Veja [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remasterizar uma imagem:** use o Construtor de imagens MiniOS ao selecionar módulos existentes, adicionar módulos externos prontos, alterar configurações suportadas da imagem, capturar alterações da sessão (opcionalmente) e publicar outro ISO.

A camada de sistema de arquivos do projeto é para arquivos declarativos na raiz da imagem. Não executa scripts, instala pacotes ou abre chroot. Softwares para reutilização devem ser preparados como módulo antes de serem adicionados a um projeto do Construtor de imagens MiniOS.

## Opções de origem

A página Origem aceita:

- A sessão atual do LiveKit ou dracut MiniOS.
- Um arquivo ISO MiniOS.
- Um disco óptico MiniOS.

Fontes ISO e disco óptico são montadas somente leitura com `udisksctl`. O inventário da origem registra a distribuição, versão, arquitetura, suporte a bootloader, tamanho, inventário de módulos e uma impressão digital da origem. Se a origem mudar após o planejamento, a build é bloqueada em vez de continuar com uma entrada diferente.

A captura de sessão sempre descreve alterações na sessão MiniOS em execução. Quando um ISO ou disco óptico é selecionado, a captura só está disponível se a impressão digital do módulo base dessa origem corresponder à base montada da sessão em execução. Selecionar mídia externa não captura alterações feitas em outro sistema.

## Requisitos

O Construtor de imagens MiniOS requer o backend correspondente `minios-image-compose`. Fontes de arquivo ISO e disco óptico requerem `udisks2`. Ler um `/etc/live/config.conf` somente root e capturar uma sessão gravável pode exigir `pkexec` e um agente PolicyKit de desktop. A captura de sessão requer um `savechanges` compatível fornecido por `minios-tools` 1.5.0 ou mais recente.

O aplicativo e o backend de composição permanecem sem privilégios. A autorização é limitada ao leitor de configuração ao vivo fixo e, quando selecionado, aos `/usr/bin/savechanges` confiáveis.

## Fluxo de trabalho do projeto

### Selecione a origem

Escolha uma origem e aguarde o término do inventário. Revise sua identidade, arquitetura, suporte a boot, diagnósticos e quantidade de módulos. Resolva erros de origem antes de continuar.

### Selecione o conteúdo

Escolha os módulos de origem a serem incluídos e adicione quaisquer módulos externos `.sb`. Módulos principais e de kernel obrigatórios são bloqueados. Módulos externos comuns ativos na sessão atual mas ausentes na origem selecionada são exibidos separadamente e permanecem opcionais.

Um módulo externo que substitui ativamente um módulo de origem no caminho original do sistema é tratado de forma diferente: o Image Builder atual resolve o arquivo de origem por dispositivo e inode, mantém o papel original do sistema e inclui essa substituição como módulo de origem efetivo em vez de apresentá-lo como duplicata opcional não relacionada. Isso também cobre caminhos de initramfs realocados. Outros módulos externos ainda exigem seleção explícita.

Módulos adicionais devem ser arquivos regulares legíveis com dados SquashFS válidos. Nomes duplicados ou com diferença apenas de maiúsculas/minúsculas e colisões de destino são rejeitados porque o tempo de execução resolve camadas pelo nome base.

### Configurar definições

Escolha o caminho de saída e a configuração MiniOS atual obrigatória. Campos de personalização vazios ou `Keep current` preservam o comportamento da origem. Configure apenas os ajustes necessários para a nova imagem e decida se a camada de sessão gravável deve ser capturada.

Os bytes de `/etc/live/config.conf` são copiados para o armazenamento privado de build com modo 0600. Não são interpretados, exibidos ou registrados. Projetos atuais devem incluir essa configuração; um projeto antigo que a desativa explicitamente não pode avançar para Revisão até ser corrigido.

### Revisar o plano

A revisão cria um novo plano a partir das identidades de entrada atuais. Verifique módulos selecionados, excluídos e adicionais, local de saída, espaço estimado, resumo das personalizações, perfil de captura, avisos e limite de privilégios.

A revisão omite intencionalmente valores de configuração, argumentos brutos do kernel, caminhos privados de personalização e caminhos de captura selecionados. Mostra contagens, nomes base, impressões digitais e digests quando isso é suficiente para vincular o plano.

Se a saída já existir, a substituição exige confirmação. A confirmação está vinculada ao dispositivo, inode, tamanho, data/hora e SHA-256 observados desse arquivo. Mudança de destino, cancelamento ou tentativa falha limpa a aprovação e exige nova revisão.

### Compilar e verificar

A compilação revalida todas as entradas efetivas e executa `minios-image-compose` com uma lista de argumentos em um diretório de trabalho privado. O ISO permanece privado até a verificação estrutural ser bem-sucedida. A publicação no destino selecionado é atômica.

Salve o projeto se a origem, seleção de módulos, saída e intenção de personalização forem reutilizados. Os arquivos de projeto são em JSON. Alterações não salvas exigem confirmação antes de abrir outro projeto ou fechar o aplicativo.

## Captura de sessão e privacidade

Módulos de origem, `/etc/live/config.conf`, e a captura de sessão são entradas independentes. Se a seleção de módulos e a personalização declarativa forem suficientes, não capture a sessão gravável.

### Não incluir alterações da sessão

Esta é a opção padrão recomendada. O construtor usa os módulos selecionados, configuração atual, definições de boot e outras personalizações da imagem sem copiar a camada de sessão gravável.

### Incluir todas as alterações da sessão

Este perfil preserva toda alteração gravável suportada do provedor OverlayFS ou AUFS detectado. Pode incluir senhas, chaves, tokens, dados de navegador, identidade da máquina, arquivos pessoais, logs e estado de arquivos excluídos. Requer confirmação explícita e não deve ser usado para uma imagem destinada a outras pessoas sem auditoria separada.

### Incluir apenas alterações reutilizáveis

Este perfil usa uma lista de caminhos permitidos restrita para softwares e padrões seguros, omitindo dados pessoais, identidade, cache e logs. Reduz a exposição, mas não garante que os arquivos permitidos estejam livres de segredos. Inspecione a imagem finalizada antes de compartilhá-la.

### Escolher manualmente as alterações da sessão

Execute `Analyze session changes`, depois selecione pelo menos um caminho normalizado do inventário em memória. Um diretório selecionado representa seus descendentes. Exclusões exatas ou ancestrais sobrescrevem seleções correspondentes.

O inventário contém metadados, incluindo nomes de arquivos, e por isso é sensível mesmo sem conter o conteúdo dos arquivos. Ele permanece em memória e não é gravado no projeto ou copiado para Revisão ou logs. As regras explícitas de inclusão e exclusão representam a intenção do projeto e são salvas; a Revisão mostra apenas sua contagem e digest.

Iniciar outra análise, atualizar ou trocar a origem, cancelar ou falhar, abrir ou criar um projeto limpa o inventário em tempo de execução. Análise e captura podem solicitar autorização de administrador, mas o processo do Construtor de imagens MiniOS e a composição do ISO não são elevados.

## Personalização da imagem

As definições suportadas são restritas e validadas pelo backend:

- **Padrões do sistema:** hostname, fuso horário, target padrão do systemd e serviços ativados ou desativados.
- **Segurança e acesso:** modos sudo, PolicyKit, SSH, XRDP, X11, bloqueio de tela e dica de issue permitidos.
- **Dados do usuário:** diretórios de usuário validados relativos à raiz, com comportamento de link ou bind, não ambos.
- **Comportamento de boot:** tempo limite de 0 a 300 segundos, menu de origem ou menu construído e entrada padrão selecionada.
- **Entradas de boot:** modelos resume, new, choose, fresh e copy-to-RAM podem ser ocultados, reordenados, duplicados e configurados por persistência tipada, módulo, inicialização, localização, zRAM e controles de diagnóstico. Os modelos de nova sessão atuais usam `perchdir=setup` para que o backend de persistência possa ser selecionado na inicialização; quando uma origem antiga já usa `perchdir=new`, esse seletor legado é preservado em vez de ser reescrito silenciosamente.
- **Comportamento RAM:** cópia do sistema (`toram`) e cópia da sessão de persistência (`perchtoram`) são controles independentes. `perchtoram=off` mantém a persistência no armazenamento, `trim` copia a sessão suportada selecionada e `full` solicita cópia completa da sessão suportada. Com persistência ativada, menus atuais usam `trim` com boot do sistema RAM e `off` caso contrário, a menos que você escolha outro valor. Sessões de diretório nativas não são copiadas por `perchtoram`.
- **Configurações avançadas de boot:** argumentos de kernel globais e por entrada validados para opções não representadas por controles tipados.
- **Aparência:** fundo de boot PNG validado.
- **Camada de sistema de arquivos do projeto:** um diretório real interpretado relativo à raiz da imagem e empacotado como módulo de overlay SquashFS de propriedade do root.

A camada de sistema de arquivos suporta arquivos regulares, links simbólicos relativos seguros, diretórios vazios, bits de execução e timestamps. Nós de dispositivo, sockets, FIFOs, travessias de sistema de arquivos, links absolutos ou que escapam e nomes inseguros são rejeitados. Bits de privilégio são limpos e a propriedade no módulo gerado é normalizada.

A personalização de boot suporta GRUB MiniOS reconhecido, SYSLINUX nativo e a cadeia padrão SYSLINUX-para-GRUB. Configuração de boot não suportada ou ambígua é rejeitada em vez de ser presumida. Uma build sem personalização de boot pode preservar um layout de origem que o analisador de personalização não compreende.

## Verificação da saída

Antes da publicação, `minios-image-compose` verifica o ISO gerado em vez de confiar apenas na saída `xorriso` de sucesso. As verificações incluem:

- A árvore de sistema de arquivos do ISO e o rótulo do volume.
- Registros de boot BIOS e UEFI e a área do sistema.
- Conteúdo obrigatório de boot, kernel, initramfs, configuração e módulos.
- Personalizações embutidas e atestados de captura de sessão quando presentes.
- Digests e estrutura dos módulos de overlay gerados e módulos de sessão capturados.
- Alvos de fundo de boot e configuração de boot transformada quando personalizada.

Identidade do caminho de entrada, modo, data/hora de modificação e SHA-256 são registrados antes da build. Entradas mutáveis são snapshotadas privadamente com reflinks quando suportado; caso contrário, são verificadas quanto a mutação antes e depois da gravação do ISO. Inconsistência ou falha de verificação impede a publicação.

Após build bem-sucedida, registre um checksum separadamente:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste de boot. Inicialize o ISO em uma máquina virtual descartável e teste tanto BIOS quanto UEFI quando ambos forem suportados. O Construtor de imagens MiniOS pode informar se QEMU ou VirtualBox está instalado, mas não inicia nem configura um hipervisor.

## Segurança e cancelamento

- Mantenha a mídia de origem como somente leitura e grave a saída em um sistema de arquivos com espaço livre suficiente para a estimativa e margem temporária.
- Não compile diretamente sobre o único ISO conhecido como bom. Use um novo nome de saída, a menos que a substituição seja intencional e confirmada.
- Verifique módulos externos antes de adicioná-los. O Construtor de imagens MiniOS valida sua estrutura SquashFS, mas não estabelece quem é o autor do conteúdo.
- Prefira não capturar sessão para imagens distribuíveis. Se a captura for necessária, audite o sistema de arquivos resultante, não apenas o nome do perfil.
- Considere arquivos de projeto como sensíveis quando contiverem caminhos explícitos de origem, módulos, saída ou regras de captura selecionadas.

Inventário, build e subprocessos de verificação rodam em grupos de processos dedicados. O cancelamento solicita término e escala após um período de carência. Uma etapa de hash pode terminar antes do cancelamento alcançar um ponto seguro, mas resultados antigos são descartados. Uma vez iniciada a publicação atômica, ela é permitida até o fim para não deixar o destino parcialmente gravado.

Uma build cancelada ou com falha não publica seu ISO privado. Qualquer destino anterior permanece no lugar, a menos que uma substituição verificada tenha sido publicada de forma atômica.

## Documentação relacionada

- [Compilando MiniOS](/development/Building-MiniOS)
- [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Compondo imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Compondo imagens ISO MiniOS pela linha de comando

`minios-image-compose` é o backend de linha de comando fornecido com o Construtor de imagens MiniOS. Ele substitui o antigo `sb2iso` utilitário. O comando remasteriza uma árvore de conteúdo MiniOS existente, opcionalmente altera o conjunto de módulos e configuração suportada, verifica o resultado e publica um ISO inicializável.

Use a interface gráfica [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para um fluxo de trabalho guiado. Use este comando diretamente para scripts, automação ou builds de linha de comando reproduzíveis. Para uma build completa a partir do código-fonte, use [Compilando MiniOS](/development/Building-MiniOS) em vez disso.

### Uso básico

A partir de uma sessão ao vivo MiniOS, crie um ISO com a origem MiniOS detectada e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Não prefixe o comando completo com `sudo` ou `pkexec`. Composição, verificação e publicação rodam como o usuário atual. Apenas a captura de sessão opcional pode invocar o backend confiável `/usr/bin/savechanges` via PolicyKit.

O nome padrão de saída é `minios-YYYYMMDD_HHMM.iso`. Um destino existente é recusado a menos que `--overwrite` seja informado explicitamente.

### Selecione uma origem

Sem `--source`, o comando descobre o conteúdo MiniOS usado pela sessão LiveKit ou dracut atual. Para remasterizar outra árvore MiniOS montada, especifique o diretório que contém `boot/` e os módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

A origem é entrada somente leitura e nunca é modificada. Arquivos ISO e mídias ópticas devem ser montados antes de usar sua árvore de conteúdo MiniOS com o CLI. O Construtor de imagens MiniOS gráfico pode montar essas fontes via `udisksctl`.

### Selecionar módulos

Módulos adicionais `.sb` são argumentos posicionais:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

O comando valida cada módulo como arquivo SquashFS legível e não-symlink.
Módulos cujos nomes começam com dois dígitos e um hífen são colocados no topo MiniOS. Outros módulos adicionados vão para `minios/modules/`. Colisões de nomes base duplicados ou com diferença apenas de maiúsculas/minúsculas são rejeitadas.

Exclua caminhos de origem com uma expressão regular POSIX estendida:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Arquivos de boot obrigatórios, kernel e initramfs, módulos principais, menu de boot selecionado e configuração selecionada não podem ser excluídos.

Crie módulos reutilizáveis antes de compor o ISO. Veja [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuração e manifesto

`--config FILE` instala o arquivo regular selecionado como `minios/config.conf`. O padrão é `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

O manifesto opcional deve ser um objeto JSON. Rótulos de volume contêm de 1 a 32 caracteres ASCII imprimíveis; rótulos fora do conjunto estrito ISO 9660 (maiúsculas, dígitos e sublinhado) geram um aviso.

### Capturar alterações da sessão

A captura de sessão é opcional e se aplica à camada gravável da sessão MiniOS em execução. É aceita para uma origem explícita somente quando essa origem tem a mesma impressão digital do módulo base do sistema em execução.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Perfis disponíveis:

- `exact` captura toda alteração representável e pode incluir credenciais, dados pessoais, logs, estado do navegador e identidade da máquina.
- `clean` usa uma lista restrita voltada para software. Reduz a exposição, mas não garante que o resultado não contenha segredos.
- `selected` usa uma seleção de inventário produzida por uma interface compatível ou `savechanges` fluxo de trabalho.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefira módulos e configuração declarativa em vez de captura de sessão quando o ISO for compartilhado. Veja [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para o modelo de privacidade e fluxo de revisão.

### Personalizar comportamento de boot

O CLI pode alterar layouts GRUB e SYSLINUX suportados:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` aceita `resume`, `new`, `choose`, `fresh`, ou `toram`. O modelo semântico `new` mapeia para `perchdir=setup` nos menus MiniOS atuais, enquanto entradas de origem legadas `perchdir=new` permanecem reconhecíveis. O construtor gráfico de menus de boot também preserva `perchtoram=off|trim|full` independentemente da configuração do sistema `toram`.
`--menu` aceita `multilang` ou um locale suportado como `en_US`, `ru_RU`, ou `de_DE`. Argumentos de kernel são validados e anexados sem avaliação de shell. Layouts de menu de boot não suportados ou ambíguos são rejeitados em vez de serem modificados por suposição.

### Adicionar arte ou overlay de sistema de arquivos

Substitua o fundo de boot por um PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empacote uma árvore de diretório preparada como módulo de overlay de imagem de propriedade do root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

O overlay é interpretado relativo à raiz da imagem. Não executa scripts, instala pacotes ou abre chroot. Links inseguros, arquivos especiais, travessias de sistema de arquivos e colisões de destino são rejeitados.

### Verificação e publicação

Antes da publicação, `minios-image-compose`são verificados a árvore do sistema de arquivos ISO, o rótulo do volume, os registros de boot BIOS e UEFI, a área do sistema, arquivos de boot, módulos e personalizações solicitadas. Os overlays gerados e módulos de sessão capturada são extraídos e conferidos com seus metadados e somas de verificação registrados.

O ISO é criado em um diretório privado no sistema de arquivos de destino e só é publicado de forma atômica após a verificação ser concluída com sucesso. Alterações na entrada, falha na verificação, cancelamento ou espaço insuficiente no destino impedem a publicação. O destino anterior permanece inalterado, a menos que uma `--overwrite`build seja explicitamente aprovada e publicada de forma atômica.

Crie uma soma de verificação e realize um teste de boot separado após uma build bem-sucedida:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste dos caminhos BIOS e UEFI pretendidos em uma máquina virtual descartável ou em hardware adequado.

### Referência de comandos

Use o manual instalado e a saída de ajuda para a versão exata do backend:

```bash
minios-image-compose --help
man minios-image-compose
```

Opções comuns incluem:

| Opção | Finalidade |
|---|---|
| `-n`, `--name FILE` | Definir o caminho de saída. |
| `-e`, `--exclude REGEX` | Excluir caminhos de origem correspondentes. |
| `--source DIR` | Selecionar uma árvore de conteúdo MiniOS explícita. |
| `--config FILE` | Selecionar a configuração ao vivo embutida no ISO. |
| `--manifest FILE` | Incluir um manifesto de build JSON validado. |
| `--capture-changes MODE` | Capturar `exact`, `clean`, ou `selected` alterações da sessão. |
| `--boot-timeout SECONDS` | Definir tempo limite do menu de boot de 0 a 300 segundos. |
| `--default-boot MODE` | Selecionar a ação padrão da sessão MiniOS. |
| `--kernel-args TEXT` | Anexar argumentos globais de kernel validados. |
| `--boot-background PNG` | Substituir arte de boot suportada. |
| `--overlay-directory DIR` | Adicionar uma camada de sistema de arquivos declarativa. |
| `--menu TYPE` | Selecionar menu multilíngue ou localizado. |
| `--overwrite` | Permitir explicitamente a substituição de uma saída existente. |

O comando retorna código diferente de zero quando verificações de origem, módulo, personalização, armazenamento, verificação ou publicação falham. Não distribua uma saída a menos que o comando tenha sido concluído com sucesso e o checksum resultante e os caminhos de boot tenham sido testados.
