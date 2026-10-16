---
updated: 2026-10-15
program_commits:
    minios-image-builder: 8592ec061393e48e6bdfbd43d5b4365a94c73a67
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Criando imagens personalizadas MiniOS

O Construtor de imagens MiniOS é um aplicativo GTK para remasterizar uma imagem MiniOS existente. Ele seleciona conteúdo de uma sessão MiniOS atual, de um arquivo ISO ou de um disco óptico, aplica personalizações declarativas e usa `minios-image-compose` para gerar uma ISO inicializável verificada.

O construtor é executado dentro de MiniOS. Ele não modifica a mídia de origem selecionada.

## Escolha o fluxo de trabalho correto

O Construtor de imagens MiniOS remasteriza uma imagem binária MiniOS existente. Ele não substitui nenhum destes fluxos de trabalho:

- **Compile MiniOS a partir do código-fonte:** use o sistema de compilação `minios-live` ao alterar as listas de pacotes da distribuição, a configuração de compilação, a camada do kernel, os artefatos de inicialização ou a cadeia reproduzível de módulos compilados a partir do código-fonte. Consulte [Compilando MiniOS](/development/Building-MiniOS).
- **Crie um módulo reutilizável:** use `apt2sb`, `script2sb`, `chroot2sb` ou as outras ferramentas de módulo quando o resultado desejado for uma camada `.sb`. Consulte [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules).
- **Remasterize uma imagem:** use o Construtor de imagens MiniOS para selecionar módulos existentes, adicionar módulos externos concluídos, alterar configurações de imagem compatíveis, opcionalmente capturar alterações da sessão e publicar outra ISO.

A camada do sistema de arquivos do projeto serve para arquivos declarativos na raiz da imagem. Ela não executa scripts, instala pacotes nem abre um chroot. Softwares que serão reutilizados devem ser preparados como módulos antes de serem adicionados a um projeto do Construtor de imagens MiniOS.

## Opções de origem

A página Origem aceita:

- A sessão atual do LiveKit ou do dracut MiniOS.
- Um arquivo ISO MiniOS.
- Um disco óptico MiniOS.

As origens ISO e em disco óptico são montadas como somente leitura com `udisksctl`. O inventário da origem registra a versão de lançamento, a versão, a arquitetura, o suporte ao carregador de inicialização, o tamanho, o inventário de módulos e uma impressão digital da origem. Se uma origem mudar após o planejamento, a compilação será bloqueada em vez de continuar com uma entrada diferente.

No construtor gráfico, a captura da sessão só está disponível quando **a sessão MiniOS em execução** é usada como origem, incluindo todos os módulos da origem e todos os módulos externos ativos. Ela não está disponível para uma ISO ou um disco óptico selecionado separadamente, mesmo que contenha a mesma versão. Não desmarque as camadas da origem ao capturar a sessão gravável, pois as alterações dependem dessa base completa em execução.

## Requisitos

O Construtor de imagens MiniOS requer o `minios-image-compose`backend correspondente. Origens em arquivo ISO e em disco óptico exigem `udisks2`. A leitura de um `/etc/live/config.conf` somente para root e a captura de uma sessão gravável podem exigir `pkexec` e um agente PolicyKit de desktop. A captura da sessão requer um `savechanges` compatível fornecido pelo `minios-tools` versão 1.5.0 ou posterior.

O aplicativo e o backend de composição não têm privilégios. A autorização se limita ao leitor de configuração ativa fixo e, quando selecionados, aos módulos `/usr/bin/savechanges` confiáveis.

## Fluxo de trabalho do projeto

### Selecionar a origem

Escolha uma origem e aguarde a conclusão do inventário. Confira a identidade, a arquitetura, o suporte à inicialização, os diagnósticos e a quantidade de módulos. Resolva os erros da origem antes de continuar.

### Selecionar conteúdo

Escolha os módulos da origem que deseja incluir e adicione quaisquer módulos`.sb` externos. Os módulos essenciais e do kernel obrigatórios ficam bloqueados. Módulos externos comuns, ativos na sessão atual, mas ausentes da origem selecionada, são exibidos separadamente e precisam ser selecionados explicitamente.

Um módulo externo que substitui ativamente um módulo da origem no caminho original desse módulo no sistema recebe um tratamento diferente: o Image Builder atual identifica o arquivo de origem pelo dispositivo e pelo inode, mantém a função original no sistema e inclui essa substituição como o módulo efetivo da origem, em vez de apresentá-la como uma duplicata opcional sem relação. Isso também se aplica a caminhos realocados de arquivos de origem do initramfs. A seleção dos demais módulos externos ainda precisa ser feita explicitamente.

Os módulos adicionais precisam ser arquivos regulares legíveis com dados válidos de SquashFS. Nomes de arquivo duplicados ou que diferem apenas entre maiúsculas e minúsculas, assim como conflitos de destino, são rejeitados porque o runtime resolve as camadas pelo nome do arquivo.

### Configurar definições

Escolha o caminho de saída e a configuração atual obrigatória de MiniOS`Keep current`. Campos de personalização vazios ou mantêm o comportamento da origem. Configure apenas as substituições necessárias para a nova imagem e decida se a camada gravável da sessão deve ser capturada.

Os bytes de `/etc/live/config.conf` são copiados para um armazenamento de compilação privado com permissões 0600. Eles não são interpretados, exibidos nem registrados em logs. Os projetos atuais precisam incluir essa configuração; um projeto antigo que a desative explicitamente não poderá avançar para a etapa de revisão até que isso seja corrigido.

### Revise o plano

A revisão cria um novo plano com base nas identidades das entradas atuais. Confira os módulos selecionados, excluídos e adicionais, o local de saída, o espaço estimado, o resumo das personalizações, o perfil de captura, os avisos e os limites de privilégios.

A revisão omite intencionalmente valores de configuração, argumentos brutos do kernel, caminhos de personalização privados e caminhos de captura selecionados. Ela exibe contagens, nomes de arquivos, fingerprints e hashes quando essas informações são suficientes para identificar o plano.

Se o arquivo de saída já existir, será necessário confirmar a substituição. A confirmação está vinculada ao dispositivo, inode, tamanho, data e hora e hash SHA-256 observados desse arquivo. Se o destino mudar, a operação for cancelada ou uma tentativa falhar, a aprovação será removida e será necessário fazer outra revisão.

### Crie e verifique

A criação valida novamente todas as entradas efetivas e executa `minios-image-compose` com uma lista de argumentos em um diretório de trabalho privado. O ISO permanece privado até que a verificação estrutural seja concluída com sucesso. A publicação no destino selecionado é atômica.

Salve o projeto se for reutilizar a origem, a seleção de módulos, a saída e as personalizações. Os arquivos de projeto estão no formato JSON. É necessário confirmar antes de abrir outro projeto ou fechar o aplicativo se houver alterações não salvas.

## Captura da sessão e privacidade

Os módulos de origem, `/etc/live/config.conf` e a captura da sessão são entradas independentes. Se a seleção de módulos e as personalizações declarativas forem suficientes, não capture a sessão gravável.

### Não inclua as alterações da sessão

Esta é a opção padrão recomendada. O criador usa os módulos selecionados, a configuração atual, as configurações de inicialização e outras personalizações da imagem sem copiar a camada gravável da sessão.

### Incluir todas as alterações da sessão

Este perfil preserva todas as alterações graváveis compatíveis do provedor OverlayFS ou AUFS detectado. Ele pode incluir senhas, chaves, tokens, dados do navegador, identidade da máquina, arquivos pessoais, logs e o estado de arquivos excluídos. Requer confirmação explícita e não deve ser usado em uma imagem destinada a outras pessoas sem uma auditoria separada.

### Incluir apenas alterações reutilizáveis

Este perfil usa uma lista de permissões estrita de caminhos para softwares e configurações seguras, omitindo dados pessoais, de identidade, cache e logs. Isso reduz a exposição, mas não garante que os arquivos permitidos não contenham segredos. Inspecione a imagem final antes de compartilhá-la.

### Escolher manualmente as alterações da sessão

Execute `Analyze session changes` e selecione pelo menos um caminho normalizado do inventário mantido em memória. Um diretório selecionado representa seus descendentes. Exclusões exatas ou de diretórios ancestrais têm precedência sobre as seleções correspondentes.

O inventário contém metadados, incluindo nomes de arquivos, e por isso é confidencial, embora não contenha o conteúdo dos arquivos. Ele permanece na memória e não é gravado no projeto nem copiado para a Revisão ou os logs. As regras explícitas de inclusão e exclusão representam as intenções do projeto e são salvas; a Revisão mostra apenas a quantidade e o resumo criptográfico dessas regras.

Iniciar outra análise, atualizar ou alterar a origem, cancelar ou ocorrer uma falha, bem como abrir ou criar um projeto, limpa o inventário em tempo de execução. A análise e a captura podem solicitar autorização de administrador, mas o processo MiniOS Construtor de imagens e a composição do ISO não são executados com privilégios elevados.

## Personalização da imagem

As configurações compatíveis são limitadas e validadas pelo backend:

- **Padrões do sistema:** nome do host, fuso horário, destino padrão do systemd e serviços ativados ou desativados.
- **Segurança e acesso:** modos permitidos para sudo, PolicyKit, SSH, XRDP, X11, tela de bloqueio e mensagem informativa.
- **Dados do usuário:** diretórios do usuário validados e relativos à raiz, com comportamento de link ou bind, mas não ambos.
- **Comportamento de inicialização:** um tempo limite de 0 a 300 segundos, o menu da origem ou um menu montado e uma entrada padrão selecionada.
- **Entradas de inicialização:** Os modelos resume, new, choose, fresh e copy-to-RAM podem ser ocultados, reordenados, duplicados e configurados por meio de controles tipados de persistência, módulos, inicialização, localização, zRAM e diagnóstico. Os modelos atuais de nova sessão usam `perchdir=setup` para que o backend de persistência possa ser selecionado na inicialização; quando uma origem mais antiga já usa `perchdir=new`, esse seletor legado é preservado, em vez de ser reescrito silenciosamente.
- **Comportamento de RAM:** a cópia do sistema (`toram`) e a cópia da sessão de persistência (`perchtoram`) são controles independentes. `perchtoram=off` mantém a persistência no armazenamento, `trim` copia a sessão compatível selecionada e `full` solicita a cópia completa da sessão compatível. Quando há uma solicitação de persistência, a inicialização do sistema RAM usa como padrão `trim` a menos que outro valor seja escolhido. Os dados do diretório nativo não são copiados: normalmente, o initrd inicia um novo contêiner vazio para essa solicitação. Use `perchtoram=off` para manter os dados nativos no armazenamento.
- **Configurações avançadas de inicialização:** argumentos do kernel globais e por entrada, validados, para opções não representadas por controles tipados.
- **Aparência:** uma imagem PNG validada para o plano de fundo da inicialização.
- **Camada do sistema de arquivos do projeto:** um diretório real, interpretado em relação à raiz da imagem e empacotado como um módulo de sobreposição SquashFS pertencente ao usuário root.

A camada do sistema de arquivos é compatível com arquivos comuns, links simbólicos relativos seguros, diretórios vazios, bits de execução e marcas de tempo. Nós de dispositivo, sockets, FIFOs, travessias entre sistemas de arquivos, links absolutos ou que escapem do diretório e nomes não seguros são rejeitados. Os bits de privilégio são removidos e a propriedade dos arquivos no módulo gerado é normalizada.

A personalização da inicialização é compatível com MiniOS GRUB reconhecido, SYSLINUX nativo e a cadeia padrão SYSLINUX-para-GRUB. Configurações de inicialização incompatíveis ou ambíguas são rejeitadas, em vez de serem presumidas. Uma compilação sem personalização de inicialização pode preservar um layout de origem que o analisador de personalização não compreende.

## Verificação da saída

Antes da publicação, `minios-image-compose` verifica o ISO gerado, em vez de confiar apenas em uma saída `xorriso` bem-sucedida. As verificações incluem:

- A árvore do sistema de arquivos ISO e o rótulo do volume.
- Os registros de inicialização BIOS e UEFI e a área do sistema.
- Os arquivos necessários de inicialização, kernel, initramfs, configuração e módulos.
- As atestações incorporadas de personalização e captura de sessão, quando presentes.
- Os hashes e a estrutura dos módulos de sobreposição e de sessão capturada gerados.
- Os destinos das imagens de fundo da inicialização e a configuração de inicialização transformada, quando personalizados.

O caminho, o modo, a data de modificação e o SHA-256 da entrada são registrados antes da compilação. As entradas mutáveis são copiadas para um snapshot privado usando reflinks quando há suporte; caso contrário, são verificadas quanto a alterações antes e depois da gravação do ISO. Qualquer divergência ou falha na verificação impede a publicação.

Após uma compilação bem-sucedida, registre o checksum separadamente:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum -c custom-minios.iso.sha256
```

A verificação estrutural não substitui um teste de inicialização. Inicialize o ISO em uma máquina virtual descartável e teste BIOS e UEFI se ambos forem compatíveis. O Construtor de imagens MiniOS pode informar se QEMU ou VirtualBox está instalado, mas não inicia nem configura um hipervisor.

## Segurança e cancelamento

- Mantenha a mídia de origem somente leitura e grave a saída em um sistema de arquivos com espaço livre suficiente para a estimativa e uma margem temporária.
- Não compile diretamente sobre o único ISO que você sabe que está funcionando. Use um novo nome de saída, a menos que a substituição seja intencional e confirmada.
- Verifique os módulos externos antes de adicioná-los. O Construtor de imagens MiniOS valida a estrutura SquashFS deles, mas não determina quem criou seu conteúdo.
- Para imagens destinadas à distribuição, prefira não capturar sessões. Se a captura for necessária, audite o sistema de arquivos resultante, não apenas o nome do perfil.
- Trate os arquivos do projeto como confidenciais quando contiverem caminhos explícitos de origem, de módulos ou de saída, ou regras de captura selecionadas.

Os subprocessos de inventário, compilação e verificação são executados em grupos de processos dedicados. Uma solicitação de cancelamento tenta encerrar os processos e, após um período de espera, intensifica a ação. Uma etapa de cálculo de hash pode terminar antes que o cancelamento alcance um ponto seguro, mas os resultados desatualizados são descartados. Depois que a publicação atômica começa, ela pode ser concluída para evitar deixar o destino parcialmente gravado.

Uma compilação cancelada ou com falha não publica o ISO privado. Qualquer destino anterior permanece intacto, a menos que uma substituição verificada tenha sido publicada atomicamente.

## Documentação relacionada

- [Compilar MiniOS](/development/Building-MiniOS)
- [Criar módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Compor imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)

<a id="composing-minios-iso-images-from-the-command-line"></a>

## Compor imagens ISO MiniOS pela linha de comando

`minios-image-compose` é o back-end de linha de comando fornecido pelo Construtor de imagens MiniOS. Ele substitui o utilitário `sb2iso` aposentado. O comando remasteriza uma árvore de conteúdo MiniOS existente, permite alterar o conjunto de módulos e as configurações compatíveis, verifica o resultado e publica um ISO inicializável.

Use a interface gráfica [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para seguir um fluxo de trabalho guiado por projeto. Use este comando diretamente para scripts, automação ou compilações reproduzíveis pela linha de comando. Para compilar todo o código-fonte, use [Compilar MiniOS](/development/Building-MiniOS) em vez disso.

### Uso básico

A partir de uma sessão ativa do MiniOS, crie uma ISO com a origem MiniOS descoberta e `/etc/live/config.conf`:

```bash
minios-image-compose --name ./custom-minios.iso
```

Não use `sudo` nem `pkexec` como prefixo do comando completo. A composição, a verificação e a publicação são executadas como o usuário atual. Somente a captura opcional da sessão pode invocar o backend confiável `/usr/bin/savechanges` por meio do PolicyKit.

O nome de saída padrão é `minios-YYYYMMDD_HHMM.iso`. Um destino existente é recusado, a menos que `--overwrite` seja informado explicitamente.

### Selecionar uma origem

Sem `--source`, o comando detecta o conteúdo MiniOS usado pela sessão atual do LiveKit ou do dracut. Para remasterizar outra árvore MiniOS montada, especifique o diretório que contém `boot/` e os módulos MiniOS:

```bash
minios-image-compose \
  --source /media/minios \
  --config ./config.conf \
  --name ./custom-minios.iso
```

A origem é somente leitura e nunca é modificada. Arquivos ISO e mídias ópticas devem ser montados antes de usar a árvore de conteúdo MiniOS com a CLI. O Construtor de imagens MiniOS gráfico pode montar essas origens por meio de `udisksctl`.

### Selecionar módulos

Módulos adicionais `.sb` são argumentos posicionais:

```bash
minios-image-compose 06-development.sb 10-site-config.sb \
  --name ./minios-development.iso
```

O comando valida se cada módulo é um arquivo SquashFS legível e não é um link simbólico.
Módulos cujos nomes começam com dois dígitos e um hífen são colocados no nível superior MiniOS. Os demais módulos adicionados são colocados em `minios/modules/`. Nomes de arquivo base duplicados ou que diferem apenas entre maiúsculas e minúsculas são rejeitados.

Exclua caminhos da origem usando uma expressão regular estendida POSIX:

```bash
minios-image-compose --exclude 'firefox|libreoffice|gimp' \
  --name ./minios-lite.iso
```

Não é possível excluir arquivos de inicialização obrigatórios, arquivos do kernel e do initramfs, módulos essenciais, o menu de inicialização selecionado nem a configuração selecionada.

Crie módulos reutilizáveis antes de compor a ISO. Consulte [Criar módulos](/preparing-and-customizing/Managing-Modules#creating-modules) e [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules).

### Configuração e manifesto

`--config FILE` instala o arquivo regular selecionado como `minios/config.conf`. O padrão é `/etc/live/config.conf`.

```bash
minios-image-compose --config ./config.conf \
  --manifest ./build.json \
  --volume-label 'MINIOS_LAB' \
  --name ./minios-lab.iso
```

O manifesto opcional deve ser um objeto JSON. Os rótulos de volume devem ter de 1 a 32 caracteres ASCII imprimíveis; rótulos fora do conjunto estrito de letras maiúsculas, dígitos e sublinhado do ISO 9660 geram um aviso.

### Capturar alterações da sessão

A captura da sessão é opcional e se aplica à camada gravável da sessão MiniOS em execução. Ela só é aceita para uma origem explícita quando essa origem tem a mesma impressão digital do módulo base que o sistema em execução.

```bash
minios-image-compose --capture-changes clean \
  --name ./minios-with-software.iso
```

Os perfis disponíveis são:

- `exact` captura todas as alterações que podem ser representadas e pode incluir credenciais, dados pessoais, registros, estado do navegador e identidade da máquina.
- `clean` usa uma lista de permissões restrita a software. Isso reduz a exposição, mas não garante que o resultado não contenha segredos.
- `selected` usa uma seleção de inventário gerada por um frontend compatível ou por um fluxo de trabalho `savechanges`.

```bash
minios-image-compose --capture-changes selected \
  --capture-selection ./session-selection.json \
  --capture-compression zstd \
  --name ./selected-session.iso
```

Prefira módulos e configurações declarativas à captura da sessão quando o ISO for compartilhado. Consulte [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) para saber mais sobre o modelo de privacidade e o fluxo de revisão.

### Personalizar o comportamento de inicialização

A CLI pode alterar layouts compatíveis do GRUB e do SYSLINUX:

```bash
minios-image-compose \
  --boot-timeout 5 \
  --default-boot fresh \
  --kernel-args 'audit=1 mitigations=auto' \
  --menu multilang \
  --name ./custom-boot.iso
```

`--default-boot` aceita `resume`, `new`, `choose`, `fresh`, ou `toram`. O modelo semântico `new` é mapeado para `perchdir=setup` nos menus atuais do MiniOS, enquanto as entradas de origem legadas `perchdir=new` continuam reconhecíveis. O construtor gráfico do menu de inicialização também preserva `perchtoram=off|trim|full` independentemente da configuração do sistema `toram`.
`--menu` aceita `multilang` ou uma localidade compatível, como `en_US`, `ru_RU`, ou `de_DE`. Os argumentos do kernel são validados e adicionados sem avaliação pelo shell. Layouts de menu de inicialização incompatíveis ou ambíguos são rejeitados, em vez de serem modificados com base em suposições.

### Adicionar arte ou uma sobreposição do sistema de arquivos

Substitua o plano de fundo da inicialização por um PNG validado:

```bash
minios-image-compose --boot-background ./art/boot.png \
  --name ./custom-art.iso
```

Empacote uma árvore de diretórios preparada como um módulo de sobreposição de imagem pertencente ao root:

```bash
minios-image-compose --overlay-directory "$PWD/image-overlay" \
  --name ./custom-overlay.iso
```

A sobreposição é interpretada em relação à raiz da imagem. Ela não executa scripts, instala pacotes nem abre um chroot. Links inseguros, arquivos especiais, cruzamentos de sistemas de arquivos e colisões de destino são rejeitados.

### Verificação e publicação

Antes da publicação, `minios-image-compose` verifica a árvore do sistema de arquivos ISO, o rótulo do volume, os registros de inicialização BIOS e UEFI, a área do sistema, os arquivos de inicialização, os módulos e as personalizações solicitadas. Os módulos de sobreposição gerados e os módulos de sessão capturada são extraídos e verificados em relação aos metadados e resumos criptográficos registrados.

O ISO é criado em um diretório privado no sistema de arquivos de destino e publicado atomicamente somente após a verificação ser concluída com sucesso. Alterações na entrada, falha na verificação, cancelamento ou espaço insuficiente no destino impedem a publicação. O destino anterior permanece inalterado, a menos que uma compilação de `--overwrite` aprovada explicitamente chegue à publicação atômica.

Crie um checksum e faça um teste de inicialização separado após uma compilação bem-sucedida:

```bash
sha256sum custom-minios.iso > custom-minios.iso.sha256
sha256sum --check custom-minios.iso.sha256
```

A verificação estrutural não substitui o teste dos caminhos de inicialização pretendidos para BIOS e UEFI em uma máquina virtual descartável ou em hardware adequado.

### Referência de comandos

Use o manual instalado e a saída da ajuda para consultar a versão exata do backend:

```bash
minios-image-compose --help
man minios-image-compose
```

As opções mais comuns incluem:

| Opção | Finalidade |
|---|---|
| `-n`, `--name FILE` | Definir o caminho de saída. |
| `-e`, `--exclude REGEX` | Excluir os caminhos de origem correspondentes. |
| `--source DIR` | Selecionar uma árvore de conteúdo MiniOS explícita. |
| `--config FILE` | Selecionar a configuração ativa incorporada à ISO. |
| `--manifest FILE` | Incluir um manifesto de build JSON validado. |
| `--capture-changes MODE` | Capturar `exact`, `clean`, ou `selected` alterações da sessão. |
| `--boot-timeout SECONDS` | Definir o tempo limite do menu de inicialização entre 0 e 300 segundos. |
| `--default-boot MODE` | Selecionar a ação padrão da sessão MiniOS. |
| `--kernel-args TEXT` | Anexar argumentos globais de kernel validados. |
| `--boot-background PNG` | Substituir os elementos gráficos de inicialização compatíveis. |
| `--overlay-directory DIR` | Adicionar uma camada declarativa de sistema de arquivos. |
| `--menu TYPE` | Selecionar um menu multilíngue ou localizado. |
| `--overwrite` | Permitir explicitamente a substituição de uma saída existente. |

O comando retorna um código diferente de zero quando as verificações de origem, módulo, personalização, armazenamento, verificação ou publicação falham. Não distribua uma saída a menos que o comando tenha sido concluído com sucesso e que o checksum e os caminhos de inicialização resultantes tenham sido testados.
