# MiniOS Image Builder

O MiniOS Image Builder é um aplicativo GTK para remasterizar uma imagem existente do MiniOS. Ele seleciona conteúdo de uma sessão atual do MiniOS, arquivo ISO ou disco óptico, aplica personalizações declarativas e utiliza `minios-image-compose` para produzir um ISO inicializável e verificado.

O builder roda dentro do MiniOS. Ele não modifica a mídia de origem selecionada.

## Escolha o fluxo de trabalho correto

O Image Builder remasteriza uma imagem binária existente do MiniOS. Ele não substitui nenhum destes fluxos de trabalho:

- **Compilar o MiniOS a partir do código-fonte:** utilize o sistema de build `minios-live` ao alterar listas de pacotes da distribuição, configuração de build, camada do kernel, artefatos de boot ou cadeia de módulos reproduzíveis compilados a partir do código-fonte. Veja [Building MiniOS](/development/Building-MiniOS.md).
- **Criar um módulo reutilizável:** utilize `apt2sb`, `script2sb`, `chroot2sb` ou outras ferramentas de módulo quando o resultado desejado for uma camada `.sb` independente. Veja [Creating modules](/development/Creating-Modules.md).
- **Remasterizar uma imagem:** utilize o Image Builder ao selecionar módulos existentes, adicionar módulos externos prontos, alterar configurações suportadas da imagem, capturar alterações da sessão (opcionalmente) e publicar outro ISO.

A camada de sistema de arquivos do projeto é para arquivos declarativos na raiz da imagem. Não executa scripts, instala pacotes ou abre chroot. Softwares destinados à reutilização devem ser preparados como módulo antes de serem adicionados a um projeto do Image Builder.

## Opções de origem

A página Origem aceita:

- A sessão atual do MiniOS LiveKit ou dracut.
- Um arquivo ISO do MiniOS.
- Um disco óptico do MiniOS.

Fontes ISO e disco óptico são montadas como somente leitura com `udisksctl`. O inventário da origem registra a release, versão, arquitetura, suporte ao bootloader, tamanho, inventário de módulos e uma impressão digital da origem. Se uma origem mudar após o planejamento, a build é bloqueada em vez de continuar com uma entrada diferente.

A captura de sessão sempre descreve alterações na sessão MiniOS em execução. Quando um ISO ou disco óptico é selecionado, a captura só está disponível se a impressão digital do módulo base dessa origem corresponder ao base montado da sessão em execução. Selecionar mídia externa não captura alterações feitas em outro sistema.

## Requisitos

O Image Builder requer o backend correspondente `minios-image-compose`. Fontes de arquivo ISO e disco óptico requerem `udisks2`. A leitura de um `/etc/live/config.conf` exclusivo para root e a captura de uma sessão gravável podem exigir `pkexec` e um agente PolicyKit de desktop. A captura de sessão requer um `savechanges` compatível fornecido pelo `minios-tools` 1.5.0 ou superior.

O aplicativo e o backend de composição permanecem sem privilégios. A autorização é limitada ao leitor fixo de configuração live e, quando selecionado, ao `/usr/bin/savechanges` confiável.

## Fluxo de trabalho do projeto

### Selecione a origem

Escolha uma origem e aguarde o término do inventário. Revise sua identidade, arquitetura, suporte de boot, diagnósticos e contagem de módulos. Resolva erros de origem antes de prosseguir.

### Selecione o conteúdo

Escolha os módulos de origem a serem incluídos e adicione quaisquer módulos externos `.sb`. Módulos principais e de kernel obrigatórios são bloqueados. Módulos ativos na sessão atual, mas ausentes na origem selecionada, são exibidos separadamente e não são incluídos automaticamente.

Módulos adicionais devem ser arquivos regulares legíveis com dados SquashFS válidos. Nomes de arquivos duplicados ou equivalentes por caixa e colisões de destino são rejeitados, pois o runtime resolve camadas pelo nome base.

### Configurar as definições

Escolha o caminho de saída e a configuração atual necessária do MiniOS. Campos de personalização vazios ou `Keep current` preservam o comportamento da origem. Configure apenas as substituições necessárias para a nova imagem e decida se a camada de sessão gravável deve ser capturada.

Os bytes de `/etc/live/config.conf` são copiados para um armazenamento privado de build com modo 0600. Eles não são interpretados, exibidos ou registrados. Projetos atuais devem incluir esta configuração; um projeto antigo que a desabilite explicitamente não pode avançar para Revisão até ser corrigido.

### Revisar o plano

A revisão cria um novo plano a partir das identidades de entrada atuais. Verifique módulos selecionados, excluídos e adicionais, local de saída, espaço estimado, resumo de personalização, perfil de captura, avisos e limite de privilégios.

A revisão omite intencionalmente valores de configuração, argumentos brutos do kernel, caminhos de personalização privados e caminhos de captura selecionados. Mostra contagens, nomes base, impressões digitais e digests quando estes são suficientes para vincular o plano.

Se a saída já existir, a substituição requer confirmação. A confirmação está vinculada ao dispositivo, inode, tamanho, timestamp e SHA-256 observados desse arquivo. Mudança de destino, cancelamento ou tentativa falha limpa a aprovação e exige nova revisão.

### Construir e verificar

A build revalida cada entrada efetiva e executa `minios-image-compose` com uma lista de argumentos em um diretório de trabalho privado. O ISO permanece privado até que a verificação estrutural seja concluída com sucesso. A publicação para o destino selecionado é atômica.

Salve o projeto se a origem, seleção de módulos, saída e intenção de personalização forem reutilizados. Os arquivos de projeto são em JSON. Alterações não salvas exigem confirmação antes de abrir outro projeto ou fechar o aplicativo.

## Captura de sessão e privacidade

Módulos de origem, `/etc/live/config.conf` e captura de sessão são entradas independentes. Se a seleção de módulos e a personalização declarativa forem suficientes, não capture a sessão gravável.

### Não incluir alterações da sessão

Esta é a opção padrão recomendada. O builder utiliza os módulos selecionados, configuração atual, definições de boot e outras personalizações da imagem sem copiar a camada de sessão gravável.

### Incluir todas as alterações da sessão

Este perfil preserva toda alteração gravável suportada do provedor OverlayFS ou AUFS detectado. Pode incluir senhas, chaves, tokens, dados de navegador, identidade da máquina, arquivos pessoais, logs e estado de arquivos excluídos. Requer reconhecimento explícito e não deve ser usado para uma imagem destinada a outras pessoas sem uma auditoria separada.

### Incluir apenas alterações reutilizáveis

Este perfil utiliza uma lista de permissões de caminhos estrita para softwares e padrões seguros, omitindo amplos estados pessoais, de identidade, cache e logs. Reduz a exposição, mas não garante que os arquivos permitidos não contenham segredos. Inspecione a imagem finalizada antes de compartilhá-la.

### Escolher manualmente as alterações da sessão

Execute `Analyze session changes` e selecione pelo menos um caminho normalizado do inventário em memória. Um diretório selecionado representa seus descendentes. Exclusões exatas ou de ancestrais substituem seleções correspondentes.

O inventário contém metadados, incluindo nomes de arquivos, e portanto é sensível mesmo sem conter o conteúdo dos arquivos. Ele permanece em memória e não é gravado no projeto nem copiado para Revisão ou logs. Regras explícitas de inclusão e exclusão representam a intenção do projeto e são salvas; a Revisão mostra apenas sua contagem e digest.

Iniciar outra análise, atualizar ou mudar a origem, cancelamento ou falha, e abrir ou criar um projeto limpam o inventário em tempo de execução. Análise e captura podem solicitar autorização de administrador, mas o processo do Image Builder e a composição do ISO não são elevados.

## Personalização da imagem

As configurações suportadas são restritas e validadas pelo backend:

- **Padrões do sistema:** hostname, fuso horário, target padrão do systemd e serviços ativados ou desativados.
- **Segurança e acesso:** sudo, PolicyKit, SSH, XRDP, X11, bloqueio de tela e modos de dica de issue permitidos por lista.
- **Dados do usuário:** diretórios de usuário validados relativos à raiz, com comportamento de link ou bind, mas não ambos.
- **Comportamento de boot:** timeout de 0 a 300 segundos, menu de origem ou menu construído, e entrada padrão selecionada.
- **Entradas de boot:** modelos resume, new, choose, fresh e copy-to-RAM podem ser ocultados, reordenados, duplicados e configurados por controles tipados de persistência, módulo, inicialização, localização, zRAM e diagnóstico.
- **Configurações avançadas de boot:** argumentos de kernel globais e por entrada validados para opções não representadas por controles tipados.
- **Aparência:** fundo de boot PNG validado.
- **Camada de sistema de arquivos do projeto:** um diretório real interpretado relativo à raiz da imagem e empacotado como módulo overlay SquashFS de propriedade root.

A camada de sistema de arquivos suporta arquivos regulares, links simbólicos relativos seguros, diretórios vazios, bits de execução e timestamps. Nós de dispositivo, sockets, FIFOs, cruzamentos de sistemas de arquivos, links absolutos ou de escape e nomes inseguros são rejeitados. Bits de privilégio são limpos e a propriedade no módulo gerado é normalizada.

A personalização de boot suporta GRUB MiniOS reconhecido, SYSLINUX nativo e a cadeia padrão SYSLINUX-para-GRUB. Configurações de boot não suportadas ou ambíguas são rejeitadas em vez de serem presumidas. Uma build sem personalização de boot pode preservar um layout de origem que o parser de personalização não compreende.

## Verificação da saída

Antes da publicação, `minios-image-compose` verifica o ISO gerado em vez de confiar apenas na saída bem-sucedida de `xorriso`. As verificações incluem:

- A árvore do sistema de arquivos ISO e o rótulo do volume.
- Registros de boot BIOS e UEFI e a área do sistema.
- Conteúdo obrigatório de boot, kernel, initramfs, configuração e módulos.
- Personalizações incorporadas e atestados de captura de sessão, quando presentes.
- Digests e estrutura dos módulos overlay gerados e módulos de sessão capturados.
- Alvos de fundo de boot e configuração de boot transformada quando personalizada.

Identidade do caminho de entrada, modo, horário de modificação e SHA-256 são registrados antes da build. Entradas mutáveis são snapshotadas privadamente com reflinks quando suportado; caso contrário, são verificadas quanto a mutações antes e depois da gravação do ISO. Inconsistências ou falhas de verificação impedem a publicação.

Após uma build bem-sucedida, registre um checksum separadamente:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste de boot. Inicialize o ISO em uma máquina virtual descartável e teste tanto BIOS quanto UEFI quando ambos forem suportados. O Image Builder pode informar se QEMU ou VirtualBox está instalado, mas não inicia nem configura um hipervisor.

## Segurança e cancelamento

- Mantenha a mídia de origem como somente leitura e grave a saída em um sistema de arquivos com espaço livre suficiente para a estimativa e margem temporária.
- Não construa diretamente sobre o único ISO conhecido como bom. Use um novo nome de saída, a menos que a substituição seja intencional e confirmada.
- Verifique módulos externos antes de adicioná-los. O Image Builder valida sua estrutura SquashFS, mas não determina quem é o autor do conteúdo.
- Prefira não capturar a sessão para imagens distribuíveis. Se a captura for necessária, audite o sistema de arquivos resultante, não apenas o nome do perfil.
- Trate arquivos de projeto como sensíveis quando contiverem caminhos explícitos de origem, módulos, saída ou regras de captura selecionadas.

Inventário, build e subprocessos de verificação rodam em grupos de processos dedicados. Pedidos de cancelamento solicitam término e escalam após um período de carência. Uma passagem de hash pode terminar antes que o cancelamento alcance um ponto seguro, mas resultados obsoletos são descartados. Uma vez iniciada a publicação atômica, ela é concluída para que o destino não fique propositalmente pela metade.

Uma build cancelada ou com falha não publica seu ISO privado. Qualquer destino anterior permanece intacto, a menos que uma substituição verificada tenha sido publicada atomicamente.

## Documentação relacionada

- [Building MiniOS](/development/Building-MiniOS.md)
- [Creating modules](/development/Creating-Modules.md)
- [Rebuilding ISO](/development/Rebuilding-ISO.md)
