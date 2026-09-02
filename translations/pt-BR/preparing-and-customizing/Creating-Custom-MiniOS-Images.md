---
updated: 2026-08-26
program_commits:
    minios-image-builder: 48f882998f2f8f3cd9fdd0367697f999fa3b402c
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Criando imagens personalizadas do MiniOS

O Construtor de imagens MiniOS é um aplicativo GTK para remasterizar uma imagem existente do MiniOS. Ele seleciona conteúdo de uma sessão atual do MiniOS, arquivo ISO ou disco óptico, aplica personalizações declarativas e utiliza `minios-image-compose` para produzir um ISO inicializável e verificado.

O construtor roda dentro do MiniOS. Ele não modifica a mídia de origem selecionada.

## Escolha o fluxo de trabalho correto

O Construtor de imagens MiniOS remasteriza uma imagem binária existente MiniOS. Ele não substitui nenhum destes fluxos de trabalho:

- **Compilar MiniOS a partir do código-fonte:** use o `minios-live` sistema de build ao alterar as listas de pacotes da distribuição, configuração de build, camada do kernel, artefatos de boot ou cadeia de módulos reproduzíveis construídos a partir do código-fonte. Consulte [Compilando MiniOS](/development/Building-MiniOS).
- **Criar um módulo reutilizável:** use `apt2sb`, `script2sb`, `chroot2sb`, ou outras ferramentas de módulo quando o objetivo for um `.sb` layer independente. Consulte [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remasterizar uma imagem:** use o Construtor de imagens MiniOS ao selecionar módulos existentes, adicionar módulos externos prontos, alterar configurações suportadas da imagem, capturar alterações de sessão (opcionalmente) e publicar outro ISO.

A camada de sistema de arquivos do projeto serve para arquivos declarativos na raiz da imagem. Não executa scripts, não instala pacotes nem abre chroot. Softwares destinados à reutilização devem ser preparados como módulos antes de serem adicionados a um projeto do Construtor de imagens MiniOS.

## Opções de origem

A página Origem aceita:

- A sessão atual do MiniOS via LiveKit ou dracut.
- Um arquivo ISO do MiniOS.
- Um disco óptico do MiniOS.

Fontes ISO e disco óptico são montadas como somente leitura com `udisksctl`. O inventário da origem registra a release, versão, arquitetura, suporte a bootloader, tamanho, inventário de módulos e uma impressão digital da origem. Se a origem mudar após o planejamento, a build é bloqueada em vez de continuar com uma entrada diferente.

A captura de sessão sempre descreve alterações na sessão do MiniOS atualmente em execução. Quando um ISO ou disco óptico é selecionado, a captura só está disponível se a impressão digital do módulo base dessa origem corresponder ao base montado da sessão em execução. Selecionar mídia externa não captura alterações feitas em outro sistema.

## Requisitos

O Construtor de imagens MiniOS requer o backend `minios-image-compose` correspondente. Fontes de arquivos ISO e discos ópticos exigem `udisks2`. Ler um `/etc/live/config.conf` exclusivo para root e capturar uma sessão gravável podem exigir `pkexec` e um agente PolicyKit de desktop. A captura de sessão requer um `savechanges` compatível fornecido pelo `minios-tools` 1.5.0 ou superior.

O aplicativo e o backend de composição permanecem sem privilégios. A autorização é limitada ao leitor fixo de configuração ao vivo e, quando selecionado, `/usr/bin/savechanges` confiável.

## Fluxo de trabalho do projeto

### Selecione a origem

Escolha uma origem e aguarde o término do inventário. Revise sua identidade, arquitetura, suporte a boot, diagnósticos e contagem de módulos. Resolva erros de origem antes de prosseguir.

### Selecione o conteúdo

Escolha os módulos de origem para incluir e adicione quaisquer módulos externos `.sb`. Módulos essenciais e de kernel são bloqueados. Módulos ativos na sessão atual, mas ausentes na origem selecionada, são exibidos separadamente e não são incluídos automaticamente.

Módulos adicionais devem ser arquivos regulares legíveis com dados SquashFS válidos. Nomes duplicados ou com diferença apenas de caixa e colisões de destino são rejeitados, pois o runtime resolve camadas pelo basename.

### Configure as configurações

Escolha o caminho de saída e a configuração atual obrigatória do MiniOS. Campos de personalização vazios ou `Keep current` preservam o comportamento da origem. Configure apenas as substituições necessárias para a nova imagem e decida se a camada de sessão gravável deve ser capturada.

Os bytes de `/etc/live/config.conf` são copiados para um armazenamento privado da build com modo 0600. Eles não são interpretados, exibidos ou registrados em log. Projetos atuais devem incluir essa configuração; um projeto antigo que a desabilite explicitamente não pode prosseguir para Revisão até ser corrigido.

### Revise o plano

A revisão cria um novo plano a partir das identidades atuais de entrada. Verifique módulos selecionados, excluídos e adicionais, local de saída, espaço estimado, resumo de personalização, perfil de captura, avisos e limite de privilégios.

A revisão omite intencionalmente valores de configuração, argumentos brutos do kernel, caminhos privados de personalização e caminhos de captura selecionados. Mostra contagens, basenames, impressões digitais e digests quando isso é suficiente para vincular o plano.

Se a saída já existir, a substituição requer confirmação. A confirmação está vinculada ao dispositivo, inode, tamanho, timestamp e SHA-256 observados desse arquivo. Mudança de destino, cancelamento ou tentativa falha limpa a aprovação e exige nova revisão.

### Construir e verificar

A construção revalida todas as entradas efetivas e executa `minios-image-compose` com uma lista de argumentos em um diretório de trabalho privado. O ISO permanece privado até que a verificação estrutural seja bem-sucedida. A publicação para o destino selecionado é atômica.

Salve o projeto se sua origem, seleção de módulos, saída e intenção de personalização forem reutilizados. Os arquivos de projeto são em formato JSON. Alterações não salvas exigem confirmação antes de abrir outro projeto ou fechar o aplicativo.

## Captura de sessão e privacidade

Módulos de origem, `/etc/live/config.conf` e captura de sessão são entradas independentes. Se a seleção de módulos e a personalização declarativa forem suficientes, não capture a sessão gravável.

### Não incluir alterações da sessão

Esta é a opção padrão recomendada. O builder utiliza os módulos selecionados, configuração atual, ajustes de boot e outras personalizações da imagem sem copiar a camada de sessão gravável.

### Incluir todas as alterações da sessão

Este perfil preserva toda alteração gravável suportada pelo provedor OverlayFS ou AUFS detectado. Pode incluir senhas, chaves, tokens, dados de navegador, identidade da máquina, arquivos pessoais, logs e estado de arquivos excluídos. Requer reconhecimento explícito e não deve ser usado para uma imagem destinada a outras pessoas sem uma auditoria separada.

### Incluir apenas alterações reutilizáveis

Este perfil utiliza uma lista restrita de caminhos permitidos para softwares e padrões seguros, omitindo amplamente estados pessoais, de identidade, cache e logs. Reduz a exposição, mas não garante que os arquivos permitidos não contenham segredos. Inspecione a imagem finalizada antes de compartilhá-la.

### Escolha manualmente as alterações de sessão

Execute `Analyze session changes` e selecione pelo menos um caminho normalizado do inventário em memória. Um diretório selecionado representa todos os seus descendentes. Exclusões exatas ou de ancestrais têm prioridade sobre seleções correspondentes.

O inventário contém metadados, incluindo nomes de arquivos, e portanto é sensível mesmo não contendo o conteúdo dos arquivos. Ele permanece apenas na memória e não é gravado no projeto nem copiado para Revisão ou logs. As regras explícitas de inclusão e exclusão refletem a intenção do projeto e são salvas; a Revisão mostra apenas a contagem e o resumo delas.

Iniciar outra análise, atualizar ou trocar a fonte, cancelar ou falhar, e abrir ou criar um projeto limpa o inventário em tempo de execução. Análise e captura podem solicitar autorização de administrador, mas o processo do Construtor de imagens MiniOS e a composição do ISO não são elevados.

## Personalização da imagem

As configurações suportadas são restritas e validadas pelo backend:

- **Padrões do sistema:** hostname, fuso horário, target padrão do systemd e serviços ativados ou desativados.
- **Segurança e acesso:** modos permitidos de sudo, PolicyKit, SSH, XRDP, X11, bloqueio de tela e dica de issue.
- **Dados do usuário:** diretórios de usuário validados relativos à raiz, com comportamento de link ou bind, não ambos.
- **Comportamento de boot:** timeout de 0 a 300 segundos, menu de origem ou menu construído e entrada padrão selecionada.
- **Entradas de boot:** modelos resume, new, choose, fresh e copy-to-RAM podem ser ocultados, reordenados, duplicados e configurados por controles tipados de persistência, módulo, inicialização, localização, zRAM e diagnóstico.
- **Configurações avançadas de boot:** argumentos do kernel globais e por entrada validados para opções não representadas por controles tipados.
- **Aparência:** fundo de boot PNG validado.
- **Camada de sistema de arquivos do projeto:** um diretório real interpretado relativo à raiz da imagem e empacotado como módulo SquashFS de propriedade root.

A camada de sistema de arquivos suporta arquivos regulares, links simbólicos relativos seguros, diretórios vazios, bits de execução e timestamps. Nós de dispositivo, sockets, FIFOs, cruzamentos de sistemas de arquivos, links absolutos ou de escape e nomes inseguros são rejeitados. Bits de privilégio são limpos e a propriedade no módulo gerado é normalizada.

A personalização de boot suporta GRUB reconhecido do MiniOS, SYSLINUX nativo e a cadeia padrão SYSLINUX-para-GRUB. Configuração de boot não suportada ou ambígua é rejeitada em vez de ser presumida. Uma build sem personalização de boot pode preservar um layout de origem que o parser de personalização não entende.

## Verificação da saída

Antes da publicação, `minios-image-compose` verifica o ISO gerado em vez de confiar apenas em uma saída bem-sucedida de `xorriso`. As verificações incluem:

- A árvore do sistema de arquivos ISO e o rótulo do volume.
- Registros de boot BIOS e UEFI e a área do sistema.
- Arquivos de boot obrigatórios, kernel, initramfs, configuração e conteúdo de módulos.
- Personalizações embutidas e atestados de captura de sessão, quando presentes.
- Resumos e estrutura dos overlays gerados e módulos de sessão capturados.
- Alvos de fundo do boot e configuração de boot transformada, quando personalizado.

Identidade do caminho de entrada, modo, data de modificação e SHA-256 são registrados antes da build. Entradas mutáveis são capturadas privadamente com reflinks quando suportado; caso contrário, são verificadas quanto a alterações antes e depois da gravação do ISO. Uma divergência ou falha de verificação impede a publicação.

Após uma build bem-sucedida, registre um checksum separadamente:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste de boot. Inicialize o ISO em uma máquina virtual descartável e teste tanto BIOS quanto UEFI quando ambos forem suportados. O Construtor de imagens MiniOS pode informar se QEMU ou VirtualBox está instalado, mas não inicia nem configura um hipervisor.

## Segurança e cancelamento

- Mantenha a mídia de origem como somente leitura e grave a saída em um sistema de arquivos com espaço livre suficiente para o estimado e para arquivos temporários.
- Não gere a build diretamente sobre o único ISO considerado estável. Use um novo nome de saída, a menos que a substituição seja intencional e confirmada.
- Verifique módulos externos antes de adicioná-los. O Construtor de imagens MiniOS valida sua estrutura SquashFS, mas não estabelece quem criou seu conteúdo.
- Prefira não capturar sessões para imagens distribuíveis. Se a captura for necessária, audite o sistema de arquivos resultante, não apenas o nome do perfil.
- Considere os arquivos do projeto como sensíveis quando contiverem caminhos explícitos de origem, módulos, saída ou regras de captura selecionadas.

Inventário, build e subprocessos de verificação rodam em grupos de processos dedicados. O cancelamento solicita a finalização e é escalonado após um período de tolerância. Uma etapa de hash pode ser concluída antes que o cancelamento alcance um ponto seguro, mas resultados antigos são descartados. Uma vez iniciada a publicação atômica, ela é permitida até o fim para que o destino não fique propositalmente incompleto.

Uma build cancelada ou com falha não publica seu ISO privado. Qualquer destino anterior permanece no lugar, a menos que uma substituição verificada tenha sido publicada de forma atômica.

## Documentação relacionada

- [Compilando MiniOS](/development/Building-MiniOS)
- [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Compondo imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

## Compondo imagens ISO do MiniOS pela linha de comando

`minios-image-compose` é o backend de linha de comando fornecido com o Construtor de imagens MiniOS. Ele substitui o utilitário `sb2iso` descontinuado. O comando remasteriza uma árvore de conteúdo MiniOS existente, opcionalmente altera o conjunto de módulos e configurações suportadas, verifica o resultado e publica um ISO inicializável.

Use a interface gráfica do [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para um fluxo de trabalho guiado. Use este comando diretamente para scripts, automação ou builds reprodutíveis via linha de comando. Para uma build completa a partir do código-fonte, utilize [Construindo MiniOS](/development/Building-MiniOS).

### Uso básico

A partir de uma sessão live do MiniOS em execução, crie uma ISO com a fonte MiniOS detectada e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Não anteponha o comando completo com `sudo` ou `pkexec`. A composição, verificação e publicação são executadas como o usuário atual. Apenas a captura de sessão opcional pode invocar o backend confiável `/usr/bin/savechanges` via PolicyKit.

O nome padrão do arquivo de saída é `minios-YYYYMMDD_HHMM.iso`. Um destino já existente será recusado, a menos que `--overwrite` seja informado explicitamente.

### Selecione uma fonte

Sem `--source`, o comando descobre o conteúdo MiniOS utilizado pela sessão atual do LiveKit ou dracut. Para remasterizar outra árvore MiniOS montada, especifique o diretório que contém `boot/` e os módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

A fonte é apenas leitura e nunca é modificada. Arquivos ISO e mídias ópticas devem ser montados antes de usar sua árvore de conteúdo MiniOS com a CLI. O Construtor de imagens MiniOS gráfico pode montar essas fontes via `udisksctl`.

### Selecionar módulos

Módulos adicionais `.sb` são argumentos posicionais:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

O comando valida cada módulo como um arquivo SquashFS legível e que não seja um link simbólico.
Módulos cujos nomes começam com dois dígitos e um hífen são colocados no nível superior MiniOS. Outros módulos adicionados são colocados em `minios/modules/`. Colisões de nomes base duplicados ou que diferem apenas por maiúsculas/minúsculas são rejeitadas.

Exclua caminhos de origem usando uma expressão regular estendida POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Arquivos de boot obrigatórios, arquivos de kernel e initramfs, módulos principais, o menu de boot selecionado e a configuração selecionada não podem ser excluídos.

Crie módulos reutilizáveis antes de compor o ISO. Consulte [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuração e manifesto

`--config FILE` instala o arquivo regular selecionado como `minios/config.conf`. O padrão é `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

O manifesto opcional deve ser um objeto JSON. Rótulos de volume podem conter de 1 a 32 caracteres ASCII imprimíveis; rótulos fora do conjunto restrito ISO 9660 (maiúsculas, dígitos e sublinhado) geram um aviso.

### Capturar alterações de sessão

A captura de sessão é opcional e se aplica à camada gravável da sessão MiniOS atualmente em execução. Ela é aceita para uma fonte explícita apenas quando essa fonte possui a mesma impressão digital do módulo base do sistema em execução.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Os perfis disponíveis são:

- `exact` captura toda alteração representável e pode incluir credenciais, dados pessoais, logs, estado do navegador e identidade da máquina.
- `clean` utiliza uma lista restrita voltada para software. Reduz a exposição, mas não garante que o resultado esteja livre de segredos.
- `selected` utiliza uma seleção de inventário produzida por uma interface compatível ou fluxo de trabalho `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefira módulos e configuração declarativa em vez de captura de sessão quando o ISO for compartilhado. Veja [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para o modelo de privacidade e fluxo de revisão.

### Personalizar o comportamento de boot

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
`--menu` aceita `multilang` ou um locale suportado, como `en_US`, `ru_RU` ou `de_DE`. Argumentos do kernel são validados e adicionados sem avaliação pelo shell. Layouts de menu de boot não suportados ou ambíguos são rejeitados, em vez de serem modificados por tentativa e erro.

### Adicionar arte ou overlay de sistema de arquivos

Substitua o fundo do boot por um PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empacote uma árvore de diretórios preparada como um módulo de overlay de imagem com propriedade root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

O overlay é interpretado em relação à raiz da imagem. Ele não executa scripts, não instala pacotes nem abre chroot. Links inseguros, arquivos especiais, travessias de sistemas de arquivos e colisões de destino são rejeitados.

### Verificação e publicação

Antes da publicação, `minios-image-compose` verifica a árvore do sistema de arquivos ISO, o rótulo do volume, registros de boot BIOS e UEFI, área do sistema, arquivos de boot, módulos e personalizações solicitadas. Módulos de overlay gerados e módulos de sessão capturada são extraídos e verificados em relação aos seus metadados e hashes registrados.

A ISO é construída em um diretório privado no sistema de arquivos de destino e só é publicada de forma atômica após a verificação ser bem-sucedida. Alteração dos dados de entrada, falha na verificação, cancelamento ou espaço insuficiente no destino impedem a publicação. Um destino anterior permanece inalterado, a menos que um build `--overwrite` explicitamente aprovado chegue à publicação atômica.

Crie um checksum e faça um teste de boot separado após uma build bem-sucedida:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste dos caminhos de boot BIOS e UEFI pretendidos em uma máquina virtual descartável ou em hardware apropriado.

### Referência de comandos

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
| `--manifest FILE` | Inclui um manifesto JSON validado de build. |
| `--capture-changes MODE` | Captura alterações de sessão `exact`, `clean` ou `selected`. |
| `--boot-timeout SECONDS` | Define o tempo limite do menu de boot de 0 a 300 segundos. |
| `--default-boot MODE` | Seleciona a ação padrão da sessão MiniOS. |
| `--kernel-args TEXT` | Adiciona argumentos globais do kernel validados. |
| `--boot-background PNG` | Substitui a arte de boot suportada. |
| `--overlay-directory DIR` | Adiciona uma camada de sistema de arquivos declarativa. |
| `--menu TYPE` | Seleciona um menu multilíngue ou localizado. |
| `--overwrite` | Permite explicitamente a substituição de uma saída existente. |

O comando retorna código diferente de zero quando as verificações de fonte, módulo, personalização, armazenamento, verificação ou publicação falham. Não distribua uma saída a menos que o comando tenha sido concluído com sucesso e o checksum e os caminhos de boot resultantes tenham sido testados.
