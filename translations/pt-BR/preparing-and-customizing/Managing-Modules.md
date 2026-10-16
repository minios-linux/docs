---
updated: 2026-10-15
program_commits:
    minios-module-manager: 356c7582cf81884d606da388c93c674bf32049ba
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Gerenciando módulos

MiniOS é o aplicativo gráfico para inspecionar, criar e gerenciar MiniOS`.sb` módulos. Ele tem dois espaços de trabalho: **Módulos** para compor o sistema e **Criar** para criar novos módulos.

Abra-o pelo menu de aplicativos ou execute:

```bash
minios-module-manager
```

O aplicativo é executado com seu usuário da área de trabalho. Ele solicita autenticação de administrador somente quando uma operação solicitada exige isso.

## Em execução agora e na próxima inicialização

O espaço de trabalho Módulos mantém duas visualizações separadas:

- **Em execução agora** é o conjunto ordenado de módulos que compõe o sistema em execução.
- **Próxima inicialização** é o conjunto ordenado selecionado pelas regras de inicialização atuais MiniOS.

Alterar uma visualização não altera a outra silenciosamente. Por exemplo, **Ativar nesta sessão** afeta apenas o sistema em execução, enquanto **Adicionar à próxima inicialização** copia um módulo para o armazenamento persistente de módulos sem ativá-lo agora.

Para conhecer as regras oficiais de inicialização, incluindo níveis de prioridade das fontes candidatas, substituição por nome de arquivo exato, ordenação numérica e `load=`, `noload=` e `bext=` filtragem, consulte [Carregamento de módulos no initrd](/reference/boot-process/Module-Loading). Esse guia também explica por que Em execução agora e Próxima inicialização podem ser diferentes.

A ativação e a desativação em tempo de execução só estão disponíveis quando o sistema de arquivos raiz está usando AUFS no momento. Elas não estão disponíveis em um sistema de arquivos raiz OverlayFS, mesmo que o kernel ofereça suporte a AUFS. Não é possível desativar módulos básicos pelo aplicativo.

As alterações para a próxima inicialização só estão disponíveis quando há armazenamento de módulos persistente e gravável adequado. Desativar um módulo do usuário o move para o armazenamento `modules-disabled/` irmão, em vez de excluí-lo; ele pode ser restaurado mais tarde. A exclusão permanente é uma ação separada para módulos desativados. Não é possível desativar módulos básicos nem módulos em armazenamento somente leitura ou volátil. Filtros de inicialização, como `load`, `noload` e `bext` continuam determinando quais módulos são selecionados.

## Inspecionar um módulo

Selecione um módulo para ver a localização do arquivo que o contém, o tamanho compactado e o conteúdo do sistema de arquivos. Se o arquivo que o contém estiver disponível, **Extrair para pasta** cria um novo diretório com os arquivos do módulo.

A inspeção não exige privilégios de administrador. **Extrair para pasta** solicita autenticação de administrador para preservar proprietários, permissões e arquivos especiais. A extração nunca substitui um destino existente nem altera o módulo de origem.

Você também pode abrir um arquivo `.sb` local pelo gerenciador de arquivos. Abrir um arquivo apenas o inspeciona; não o ativa nem o adiciona a Next Boot. Em sistemas Xfce com a integração do Thunar MiniOS instalada, as ações do gerenciador de arquivos usam o mesmo backend de módulos para ativação e desativação explícitas; elas não ignoram a distinção entre Running Now e Next Boot.

## Criando um módulo

O espaço de trabalho Criar usa um fluxo de **Configurar**, **Revisar**, **Executar** e **Resultado**. Um módulo criado com sucesso permanece como arquivo no local de saída. Ele não é ativado nem adicionado automaticamente à Próxima inicialização.

Os métodos disponíveis são:

- **Pacotes** instala pacotes de repositórios e arquivos locais `.deb`, incluindo suas dependências, em um ambiente de compilação isolado MiniOS. A instalação de pacotes requer autenticação de administrador.
- **Script de instalação** executa um script revisado sem um terminal interativo. Uma pasta inicial opcional pode fornecer arquivos iniciais. O script é executado com privilégios de administrador, mas não é armazenado no módulo resultante.
- **Chroot interativo** abre um shell temporário de root no terminal incorporado. Digite `exit` ao terminar; depois, crie o módulo, reabra o shell ou descarte as alterações. Fechar ou descartar a sessão não altera o sistema em execução.
- **Pasta** empacota o conteúdo de um diretório existente. O diretório de origem não é incluído dentro do módulo. O fluxo de trabalho gráfico solicita autenticação de administrador para ler arquivos protegidos e preservar os atributos do sistema de arquivos; a origem não é alterada. Pastas extraídas com a preservação de propriedade ativada são reconhecidas automaticamente e mantêm seus proprietários. Para uma pasta extraída anteriormente sem um registro de origem, selecione **Preservar propriedade da origem** se for necessário manter os proprietários.
- **Alterações da sessão atual** captura arquivos elegíveis e exclusões da camada gravável da sessão atual. Ela usa a política padrão MiniOS `savechanges`, que omite registros, caches, dados de inicialização e caminhos temporários de execução. A leitura de toda a camada gravável requer autenticação de administrador.

Escolha um novo caminho de saída para cada fluxo de trabalho. Arquivos existentes nunca são substituídos. O progresso e os diagnósticos do backend permanecem visíveis durante a operação, e a captura da sessão atual pode ser cancelada.

Para outras pastas, o fluxo de trabalho padrão de Pasta altera IDs comuns de usuário e grupo (1000–60000) para root, exceto em `/home` e `/opt`, mantém os IDs do sistema e define os diretórios padrão de nível superior como pertencentes ao root. A propriedade perdida durante uma extração anterior sem privilégios não pode ser recuperada com essa opção.

Alterações da sessão atual destina-se à captura padrão conveniente, não à revisão de todos os caminhos incluídos. Uma camada gravável ativa pode conter dados pessoais ou confidenciais. Para políticas explícitas de `exact`, `clean` ou privacidade com seleção de caminhos, use o fluxo de trabalho da linha de comando `savechanges` descrito em [Capturar alterações da sessão atual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Arrastar e soltar

Arrastar e soltar apenas preenche um campo ou abre a inspeção:

- Um módulo abre os detalhes.
- `.deb` arquivos são adicionados a Pacotes.
- Um diretório é selecionado para Pasta.
- Outro arquivo comum é selecionado como Script de instalação.

Soltar um item não executa código nem altera Em execução agora ou Próxima inicialização.

## Documentação relacionada

- [Criar módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Carregamento de módulos do initrd](/reference/boot-process/Module-Loading)
- [Modos de inicialização](/using-minios/Boot-Modes)
- [Compor imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parâmetros de inicialização](/reference/Boot-Parameters)

<a id="creating-modules"></a>

## Criando módulos

MiniOS são imagens de sistema de arquivos somente leitura SquashFS, normalmente identificadas pela extensão `.sb`. Durante a inicialização, MiniOS organiza os módulos selecionados em um sistema de arquivos raiz em camadas. Os arquivos de uma camada de prioridade mais alta podem complementar ou ocultar arquivos de camadas inferiores. Esse pipeline modular em modo live faz parte da arquitetura MiniOS que define o sistema, descrita em [Sobre MiniOS](/getting-started/About-MiniOS) e [Modos de inicialização](/using-minios/Boot-Modes). Após a conversão nativa, o sistema de arquivos raiz em camadas `.sb` é substituído por um sistema de arquivos Debian convencional e gravável. O software de gerenciamento de módulos MiniOS é removido, pois os fluxos de trabalho com módulos deixam de se aplicar, enquanto o ambiente de desktop selecionado e os aplicativos comuns permanecem instalados como pacotes normais.

Este guia documenta os fluxos de trabalho atuais de linha de comando do MiniOS Tools. Para o aplicativo gráfico, consulte [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules). Para ver o processo completo de criação da imagem e a arquitetura do sistema, consulte [Criando MiniOS](/development/Building-MiniOS). As listas de pacotes usadas durante a criação de MiniOS são descritas na [documentação de CondinAPT](/development/CondinAPT).

### Limites de segurança e privilégios

Nem toda operação do módulo exige acesso root:

| Operação | Privilégio |
|---|---|
| Listar o que está em execução agora ou no próximo boot com `sb` | Sem root |
| Inspecionar um módulo com `sb inspect` | Sem root |
| Comandos de linha de comando comuns`dir2sb` e `sb2dir` conversão | Sem root |
| Preservar a propriedade ou permitir arquivos especiais durante a conversão | Root |
| Compilar com `apt2sb`, `script2sb`, ou `chroot2sb` | Root |
| Capturar a sessão com `savechanges` | Root |
| Ativar, desativar, adicionar ao próximo boot ou remover do próximo boot | Root |

Os compiladores usam uma união isolada e não instalam pacotes nem alterações em scripts no root em execução. A criação também não ativa o resultado nem o seleciona para o próximo boot.

Os fluxos de trabalho gráficos Pasta e Extrair para pasta solicitam autenticação de administrador para que possam manipular arquivos protegidos e preservar os atributos do sistema de arquivos.

Os conversores e compiladores atuais usam publicação sem substituição. Um destino que já existe, inclusive um link simbólico, não é substituído. Escolha um novo caminho de saída ou revise e remova explicitamente a saída antiga.

Use a saída do comando `--help` como referência da versão instalada. Os fluxos de trabalho atuais `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb` e `savechanges` aceitam `zstd` (o padrão), `gzip`, `lzo`, `lz4` e `xz`. O compressor selecionado precisa estar disponível no sistema em execução.

### Nomes de módulos e níveis de filtro

Os nomes geralmente começam com um número, como `06-browser.sb` porque a ordem das camadas afeta a resolução de conflitos. Um módulo deve conter caminhos relativos à raiz do sistema, como `usr/bin/example`, e não um diretório extra contendo essa árvore.

Para saber exatamente quais são os níveis de origem candidatos, como funciona a colisão de nomes de arquivo, a ordenação numérica e a semântica de `bext=`, `load=`, e `noload=` consulte [Carregamento de módulos do initrd](/reference/boot-process/Module-Loading). Em particular, use um nome de arquivo exclusivo, a menos que o módulo deva substituir o slot de mesmo nome de um nível de origem anterior.

A opção `--level LEVEL` em `apt2sb`, `script2sb` e `chroot2sb` limita as camadas base usadas para montar a união da compilação. Com `--level 3`, são usadas as camadas numeradas até `03`, e as camadas com números maiores são filtradas. Isso pode reduzir a dependência do módulo em relação a camadas opcionais superiores, ao custo de incluir mais dependências no resultado.

<a id="create-a-module-from-packages"></a>

### Criar um módulo a partir de pacotes

`apt2sb` instala pacotes do repositório ou `.deb` arquivos locais legíveis em uma união de build privada e captura o resultado. Isso requer uma sessão ativa compatível com MiniOS e acesso root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sem `--name`, o nome da saída é derivado do primeiro pacote. Entre as opções úteis do APT estão `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, e `--target-release RELEASE`. A opção de versão de destino se aplica somente a `install`.

Para capturar atualizações de pacotes já instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

<a id="create-a-module-from-a-script"></a>

### Criar um módulo a partir de um script

`script2sb` copia um script de instalação para um chroot privado, torna-o executável, executa-o como root sem um terminal interativo, remove-o e captura as alterações resultantes no sistema de arquivos. Se o script falhar, nenhum módulo será criado.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

O `--directory DIR` opcional copia todo o conteúdo de origem, incluindo arquivos ocultos, para a raiz do módulo antes da execução do script. Organize o diretório inicial como uma árvore do sistema de arquivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revise o script antes de executá-lo. Ele é executado com privilégios de administrador e pode executar comandos arbitrários. Use `chroot2sb` em vez disso se a instalação exigir interação ou trabalho manual.

<a id="create-a-module-interactively"></a>

### Crie um módulo de forma interativa

`chroot2sb` cria uma união de build privada e abre um shell root dentro dela. Instale pacotes ou edite arquivos e, em seguida, saia do shell para capturar as alterações:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Os comandos digitados no shell não são reproduzidos quando o módulo é carregado; o módulo é um snapshot do estado resultante do sistema de arquivos. O histórico do shell é removido do resultado. Se nenhum nome for informado, será gerado um nome com a data e a hora atuais.

A separação `prepare`, `shell`, `finish`, e `cancel` do ciclo de vida existe para frontends gráficos protegidos. Para uso normal no terminal, use o único comando interativo mostrado acima.

<a id="create-a-module-from-a-directory"></a>

### Criar um módulo a partir de um diretório

`dir2sb` empacota o conteúdo de um diretório preparado em um novo módulo. Os dois operandos são obrigatórios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

A conversão comum não exige privilégios de root. Ela mantém a origem inalterada, converte IDs de usuário e grupo comuns (1000–60000) em root fora de `/home` e `/opt`, mantém os IDs do sistema e define o root como proprietário dos diretórios padrão de nível superior. Ela rejeita nós de dispositivo, sockets e FIFOs, e nunca substitui o destino. `--keep-ownership` mantém todos os proprietários da origem e `--allow-special` permite arquivos especiais; ambos exigem privilégios de root.

`sb2dir` grava `.minios-module-origin.json` no diretório extraído. Se a extração preservou os proprietários, `dir2sb` reconhece esse registro e preserva automaticamente os proprietários e os arquivos especiais ao reempacotar; o próprio registro não é incluído no novo módulo. Não é possível reempacotar um diretório extraído sem preservar os proprietários, pois já não se sabe quem eram os proprietários originais. Extraia novamente o módulo original usando as opções privilegiadas.

<a id="capture-current-session-changes"></a>

### Capturar alterações da sessão atual

`savechanges` lê a camada gravável oficial de uma sessão MiniOS em execução. É necessário ter acesso root, pois essa camada pode conter arquivos exclusivos do root. O local padrão das alterações é detectado automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sem `--profile`, a política histórica MiniOS omite diretórios vazios, caches, logs, dados de inicialização, caminhos de runtime, pseudo-sistemas de arquivos e determinados arquivos da sessão e do sistema. Isso é conveniente para a criação tradicional de módulos, mas não é uma garantia explícita de privacidade.

Os perfis explícitos são:

- `exact` preserva as alterações que podem ser representadas, incluindo dados do usuário, logs, caches, arquivos de identidade, credenciais e metadados de exclusão compatíveis. Ele rejeita objetos do sistema de arquivos sem suporte, em vez de descartá-los silenciosamente.
- `clean` usa uma lista de permissões restrita de caminhos voltada a software. Exclui dados de home e root, logs, caches, identidades, configurações de rede, credenciais, configurações arbitrárias do sistema e `/usr/local`. Reduz a exposição de dados privados, mas não garante que um arquivo de software permitido não contenha segredos.
- `selected` inclui apenas caminhos relativos revisados de um inventário e de um arquivo de seleção. As exclusões explícitas têm prioridade. Este é o perfil adequado quando o módulo precisa conter um subconjunto controlado das alterações da sessão.

Exemplos:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Um arquivo de seleção tem esta estrutura JSON estrita:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Os caminhos são normalizados, não vazios e relativos à raiz das alterações. Primeiro, gere e revise o inventário; cada inclusão deve corresponder aos dados do inventário. Os registros do inventário incluem metadados como caminho, tipo, categoria, sensibilidade e tamanho, mas não leem nem emitem o conteúdo dos arquivos, os destinos de links simbólicos ou valores secretos. As saídas e os inventários dos perfis explícitos têm modo `0600`; os módulos com política legada têm modo `0644`.

A captura da sessão pode preservar exclusões de arquivos compatíveis e a opacidade de diretórios no backend AUFS ou OverlayFS ativo. Ela exclui montagens de runtime, sistemas de arquivos aninhados, metadados internos de union e o próprio arquivo de saída. Um destino existente nunca é substituído.

<a id="inspect-and-extract-modules"></a>

### Inspecionar e extrair módulos

Inspecione um módulo sem montá-lo nem extraí-lo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

A inspeção não exige acesso root e também funciona fora de uma sessão ativa do MiniOS.

Extraia um módulo para um novo diretório:

```bash
sb2dir 06-example.sb example-root
```

A extração comum não exige acesso root nem modifica a origem. O diretório de destino não pode existir. Arquivos especiais são rejeitados, a menos que `--allow-special` seja solicitado com privilégios suficientes.

Para obter um diretório que possa ser reempacotado fielmente, extraia com privilégios de administrador e preserve a propriedade e os arquivos especiais:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

A extração registra a origem do módulo em `.minios-module-origin.json` dentro do novo diretório. A extração sem acesso root registra que a propriedade não foi preservada; esse diretório não pode ser passado de volta para `dir2sb`. Mantenha o registro de origem de uma extração com privilégios até reempacotar.

Os diretórios gerados pela versão atual do `sb2dir` são diretórios comuns. `rmsbdir`, `sb rm` e `sb rmdir` são comandos de compatibilidade descontinuados que sempre se recusam a remover; eles não desmontam nem excluem nada recursivamente. Revise o caminho extraído e seu conteúdo antes de removê-lo usando ferramentas padrão do sistema de arquivos.

<a id="manage-running-and-next-boot-modules"></a>

### Gerenciar módulos em execução e da próxima inicialização

Em execução agora e Próxima inicialização são composições independentes. Consulte [construção de union e ativação em tempo de execução](/reference/boot-process/Module-Loading#union-construction) para entender a divisão entre inicialização e execução e por que as duas listas podem ser diferentes.

Liste os módulos que realmente compõem a raiz atual AUFS ou OverlayFS, da menor para a maior prioridade:

```bash
sb list
sb list --json
```

Liste os módulos selecionados pelas regras de inicialização atuais:

```bash
sb next-boot
sb next-boot --json
```

Estas consultas não dependem de uma raiz. As regras canônicas de [nível de candidato e substituição](/reference/boot-process/Module-Loading#candidate-tiers) determinam qual origem fornece cada nome de base da Próxima inicialização.

Para disponibilizar um módulo de usuário na próxima inicialização:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS usa armazenamento gravável durável adequado, prepara e valida a cópia e a publica atomicamente sem substituir um módulo existente. O nome do arquivo deve atender aos filtros de inicialização atuais. Desative um módulo de usuário selecionado usando seu nome de base exato:

```bash
sudo sb next-boot disable 50-extra.sb
```

A desativação mantém o arquivo em `modules-disabled/`. O comando mais antigo `next-boot remove` é um alias para desativar, não para excluir permanentemente. Restaure o arquivo ou exclua-o permanentemente com:

```bash
sudo sb next-boot enable 50-extra.sb
# To delete it permanently, disable it first:
sudo sb next-boot disable 50-extra.sb
sudo sb next-boot delete 50-extra.sb
```

Não é possível desativar módulos base nem módulos em origens somente leitura ou voláteis. A exclusão permanente também é recusada para módulos ativos. Confira `sb next-boot` e a lista de módulos desativados antes de excluir o arquivo mantido.

A ativação em tempo de execução é uma operação separada, válida apenas durante a sessão:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

A ativação e a desativação só funcionam quando `/` é atualmente uma union AUFS. Elas não estão disponíveis em OverlayFS, e o suporte do kernel a AUFS por si só não é suficiente. Nenhum dos comandos altera a Próxima inicialização.

O dispatcher de conversão de compatibilidade exige os dois operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

O uso direto de `dir2sb` e `sb2dir` é preferível, pois a conversão comum pode ser executada sem uma raiz.

### Documentação relacionada

- [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carregamento de módulos initrd](/reference/boot-process/Module-Loading)
- [Modos de inicialização](/using-minios/Boot-Modes)
- [Reconstrução de imagens ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Como compilar MiniOS](/development/Building-MiniOS)
- [Parâmetros de inicialização](/reference/Boot-Parameters)
