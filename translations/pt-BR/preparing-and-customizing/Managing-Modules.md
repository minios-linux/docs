---
updated: 2026-10-06
program_commits:
    minios-module-manager: fbe617f2955ddbef97f9ee3e5856b7d58439a565
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Gerenciamento de módulos

O Gerenciador de módulos MiniOS é o aplicativo gráfico para inspecionar, criar e gerenciar módulos MiniOS `.sb` . Ele possui dois ambientes de trabalho: **Módulos** para composição do sistema e **Criar** para criar novos módulos.

Inicie pelo menu de aplicativos ou execute:

```bash
minios-module-manager
```

O aplicativo é executado como seu usuário do desktop. Ele solicita autenticação de administrador apenas quando uma operação solicitada exige.

## Em execução agora e no próximo boot

O ambiente de trabalho Módulos mantém duas visualizações separadas:

- **Em execução agora** é o conjunto ordenado de módulos que atualmente compõem o sistema em uso.
- **Próximo boot** é o conjunto ordenado selecionado pelas regras atuais de boot MiniOS.

Alterar uma visualização não modifica a outra automaticamente. Por exemplo, **Ativar para esta sessão** afeta apenas o sistema em execução, enquanto **Adicionar ao próximo boot** copia um módulo para o armazenamento persistente de módulos sem ativá-lo agora.

Para as regras autoritativas de boot, incluindo camadas candidatas, substituição por nome exato, ordenação numérica e `load=`, `noload=`, e `bext=` filtragem, consulte [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading). Esse guia também explica por que Em execução agora e Próximo boot podem ser diferentes.

A ativação e desativação em tempo de execução estão disponíveis apenas quando o sistema de arquivos raiz está usando AUFS no momento. Não estão disponíveis em um root OverlayFS, mesmo que o kernel ofereça suporte a AUFS. Módulos base não podem ser desativados pelo aplicativo.

As alterações para o próximo boot só estão disponíveis quando MiniOS encontra um armazenamento de módulos durável e gravável adequado. Módulos base e módulos em armazenamento somente leitura ou volátil não podem ser removidos. Filtros de boot como `load`, `noload`, e `bext` ainda determinam quais módulos são selecionados.

## Inspecionando um módulo

Selecione um módulo para ver a localização do arquivo de origem, o tamanho compactado e o conteúdo do sistema de arquivos. Se o arquivo de origem estiver disponível, **Extrair para pasta** cria um novo diretório contendo os arquivos do módulo.

A inspeção não exige privilégios de administrador. **Extrair para pasta** solicita autenticação de administrador para manter proprietários, permissões e arquivos especiais. A extração nunca substitui um destino existente nem altera o módulo de origem.

Você também pode abrir um arquivo local `.sb` pelo gerenciador de arquivos. Abrir um arquivo apenas inspeciona; não ativa nem adiciona ao Próximo boot. Em sistemas Xfce com integração Thunar MiniOS instalada, as ações do gerenciador de arquivos usam o mesmo backend de módulos para ativação e desativação explícitas; não ignoram a distinção entre Em execução agora e Próximo boot.

## Criando um módulo

O ambiente Criar utiliza um fluxo de etapas: **Configurar**, **Revisar**, **Executar**, e **Resultado**. Um módulo criado com sucesso permanece como um arquivo no local de saída. Ele não é ativado nem adicionado ao Próximo boot automaticamente.

Os métodos disponíveis são:

- **Pacotes** instala pacotes do repositório e arquivos locais `.deb` , incluindo suas dependências, em um ambiente de build isolado MiniOS. A instalação de pacotes exige autenticação de administrador.
- **Script de instalação** executa um script revisado sem terminal interativo. Uma pasta opcional pode fornecer arquivos iniciais. O script é executado com privilégios de administrador, mas não é armazenado no módulo resultante.
- **Chroot interativo** abre um shell root temporário no terminal embutido. Digite `exit` ao finalizar, então crie o módulo, reabra o shell ou descarte as alterações. Fechar ou descartar a sessão não altera o sistema em execução.
- **Pasta** empacota o conteúdo de um diretório existente. O diretório de origem não é aninhado dentro do módulo. O fluxo gráfico solicita autenticação de administrador para ler arquivos protegidos e preservar atributos do sistema de arquivos; a origem permanece inalterada. Pastas extraídas com preservação de propriedade são reconhecidas automaticamente e mantêm seus proprietários. Para uma pasta extraída antiga sem registro de origem, selecione **Preservar propriedade da origem** se for necessário manter os proprietários.
- **Alterações da sessão atual** captura arquivos elegíveis e exclusões da camada gravável atual. Utiliza a política padrão MiniOS `savechanges` , que omite logs, caches, dados de boot e caminhos temporários de execução. Ler toda a camada gravável exige autenticação de administrador.

Escolha um novo caminho de saída para cada fluxo de trabalho. Arquivos existentes nunca são sobrescritos. O progresso e os diagnósticos do backend permanecem visíveis enquanto uma operação está em andamento, e a captura da sessão atual pode ser cancelada.

Para outras pastas, o fluxo padrão Pasta altera IDs de usuário e grupo comuns (1000–60000) para root fora de `/home` e `/opt`, mantém IDs de sistema e torna diretórios padrão de nível superior pertencentes ao root. Propriedade perdida em uma extração sem privilégios anterior não pode ser recuperada por esta opção.

Alterações da sessão atual são indicadas para captura padrão conveniente, não para revisar cada caminho incluído. Uma camada gravável pode conter dados pessoais ou confidenciais. Para políticas explícitas de `exact`, `clean`, ou seleção de caminhos para privacidade, use o fluxo de linha de comando `savechanges` descrito em [Capturar alterações da sessão atual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes).

## Arrastar e soltar

Arrastar e soltar apenas preenche um campo de entrada ou abre a inspeção:

- Um módulo abre seus detalhes.
- `.deb` arquivos são adicionados a Pacotes.
- Um diretório é selecionado para Pasta.
- Outro arquivo comum é selecionado como Script de Instalação.

Soltar um item não executa código nem altera Em execução agora ou Próximo boot.

## Documentação relacionada

- [Criando módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading)
- [Modos de boot](/using-minios/Boot-Modes)
- [Compondo imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line)
- [Parâmetros de boot](/reference/Boot-Parameters)

## Criando módulos

Módulos MiniOS são imagens de sistema de arquivos SquashFS somente leitura, normalmente nomeadas com a extensão `.sb`. Na inicialização, MiniOS organiza os módulos selecionados em um sistema de arquivos raiz em camadas. Arquivos em uma camada de prioridade superior podem complementar ou ocultar arquivos de camadas inferiores. Esse pipeline modular ao vivo faz parte da arquitetura definidora MiniOS descrita em [Sobre MiniOS](/getting-started/About-MiniOS) e [Modos de boot](/using-minios/Boot-Modes). Após a conversão nativa, o root em camadas `.sb` é substituído por um sistema de arquivos Debian convencional e gravável. O software de gerenciamento de módulos MiniOS é removido, pois os fluxos de trabalho de módulos não se aplicam mais, enquanto o ambiente de desktop selecionado e os aplicativos comuns permanecem instalados como pacotes normais.

Este guia documenta os fluxos de trabalho atuais de linha de comando das Ferramentas MiniOS. Para o aplicativo gráfico, consulte [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules). Para o processo completo de construção de imagem e arquitetura do sistema, veja [Construindo MiniOS](/development/Building-MiniOS). As listas de pacotes usadas ao construir MiniOS são descritas na [documentação CondinAPT](/development/CondinAPT).

### Segurança e limites de privilégio

Nem toda operação de módulo exige root:

| Operação | Privilégio |
|---|---|
| Listar Em execução agora ou Próximo boot com `sb` | Sem root |
| Inspecionar um módulo com `sb inspect` | Sem root |
| Conversão comum pela linha de comando `dir2sb` e `sb2dir` conversão | Sem root |
| Preservar propriedade ou permitir arquivos especiais durante a conversão | Root |
| Construir com `apt2sb`, `script2sb`, ou `chroot2sb` | Root |
| Capturar a sessão com `savechanges` | Root |
| Ativar, desativar, adicionar ao Próximo boot ou remover do Próximo boot | Root |

Os construtores usam uma união isolada e não instalam pacotes ou alterações de script no root em execução. A criação também não ativa o resultado nem o seleciona para o próximo boot.

Os fluxos gráficos Pasta e Extrair para pasta solicitam autenticação de administrador para lidar com arquivos protegidos e preservar atributos do sistema de arquivos.

Os conversores e construtores atuais usam publicação sem substituição. Um destino já existente, incluindo link simbólico, não é sobrescrito. Escolha um novo caminho de saída ou revise e remova a saída antiga manualmente.

Use a saída `--help` de cada comando como referência da versão instalada. Os fluxos atuais de `apt2sb`, `script2sb`, `chroot2sb`, `dir2sb`, e `savechanges` aceitam `zstd` (padrão), `gzip`, `lzo`, `lz4`, e `xz` . O compressor selecionado deve estar disponível no sistema em execução.

### Nomes de módulos e níveis de filtro

Os nomes geralmente começam com um número como `06-browser.sb` porque a ordem das camadas afeta a resolução de conflitos. Um módulo deve conter caminhos relativos à raiz do sistema, como `usr/bin/example`, e não um diretório extra contendo essa árvore.

Para as camadas candidatas exatas, comportamento de colisão de nome base, ordenação numérica e `bext=`, `load=`, e `noload=` semântica, veja [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading). Em especial, use um nome base único, a menos que o módulo deva substituir o slot de mesmo nome de uma camada anterior.

A opção `--level LEVEL` em `apt2sb`, `script2sb`, e `chroot2sb` limita as camadas base usadas para construir a união do build. Com `--level 3`, camadas numeradas até `03` são usadas e camadas de número maior são filtradas. Isso pode tornar um módulo menos dependente de camadas opcionais superiores, ao custo de incluir mais dependências no resultado.

### Criar um módulo a partir de pacotes

`apt2sb` instala pacotes do repositório ou arquivos locais legíveis `.deb` em uma união de build privada e captura o resultado. Requer uma sessão live MiniOS suportada e root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sem `--name`, o nome de saída é derivado do primeiro pacote. Opções úteis do APT incluem `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades`, e `--target-release RELEASE`. A opção target-release se aplica apenas a `install` .

Para capturar upgrades de pacotes já instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Criar um módulo a partir de um script

`script2sb` copia um script de instalação para um chroot privado, torna-o executável, executa como root sem terminal interativo, remove o script e captura as alterações resultantes no sistema de arquivos. Um script com falha não gera módulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

O parâmetro opcional `--directory DIR` copia todo o conteúdo de origem, incluindo arquivos ocultos, para a raiz do módulo antes da execução do script. Organize o diretório seed como uma árvore de sistema de arquivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revise o script antes de executá-lo. Ele roda com privilégios de administrador e pode executar comandos arbitrários. Use `chroot2sb` caso a instalação exija prompts ou intervenção manual.

### Criar um módulo interativamente

`chroot2sb` cria uma união de build privada e abre um shell root dentro dela. Instale pacotes ou edite arquivos, depois saia do shell para capturar as alterações:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Os comandos digitados no shell não são reexecutados ao carregar o módulo; o módulo é um instantâneo do estado do sistema de arquivos resultante. O histórico do shell é removido do resultado. Se nenhum nome for fornecido, o nome gerado usa a data e hora atuais.

O ciclo de vida dividido de `prepare`, `shell`, `finish`, e `cancel` existe para interfaces gráficas protegidas. Para uso normal em terminal, utilize o comando interativo único mostrado acima.

### Criar um módulo a partir de um diretório

`dir2sb` empacota o conteúdo de um diretório preparado em um novo módulo. Ambos os operandos são obrigatórios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

A conversão comum não exige root. Ela mantém a origem inalterada, altera IDs de usuário e grupo comuns (1000–60000) para root fora de `/home` e `/opt`, mantém IDs de sistema e torna diretórios padrão de nível superior pertencentes ao root. Ela rejeita nós de dispositivo, sockets e FIFOs, e nunca sobrescreve o destino. `--keep-ownership` preserva todos os proprietários da origem e `--allow-special` permite arquivos especiais; ambos exigem root.

`sb2dir` grava `.minios-module-origin.json` no diretório extraído. Se a extração preservou a propriedade, `dir2sb` reconhece esse registro e preserva automaticamente proprietários e arquivos especiais ao reempacotar; o registro em si não é incluído no novo módulo. Um diretório extraído sem preservação de propriedade não pode ser reempacotado, pois os proprietários originais não são mais conhecidos. Extraia o módulo original novamente com as opções privilegiadas.

### Capturar alterações da sessão atual

`savechanges` lê a camada gravável autoritativa de uma sessão MiniOS em execução. Requer root, pois essa camada pode conter arquivos acessíveis apenas pelo root. O local padrão das alterações é detectado automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sem `--profile`, a política histórica MiniOS omite diretórios vazios, caches, logs, dados de boot, caminhos de execução, pseudo-sistemas de arquivos e arquivos de sessão e sistema selecionados. Isso é conveniente para criação tradicional de módulos, mas não é uma garantia explícita de privacidade.

Os perfis explícitos são:

- `exact` preserva alterações representáveis, incluindo dados de usuário, logs, caches, arquivos de identidade, credenciais e metadados de exclusão suportados. Ele rejeita objetos de sistema de arquivos não suportados em vez de descartá-los silenciosamente.
- `clean` usa uma lista restrita de caminhos voltada para software. Exclui dados de home e root, logs, caches, identidades, configuração de rede, credenciais, configuração arbitrária do sistema e `/usr/local`. Reduz a exposição de privacidade, mas não garante que um arquivo de software permitido não contenha segredos.
- `selected` inclui apenas caminhos relativos revisados a partir de um arquivo de inventário e seleção. Exclusões explícitas prevalecem. Este é o perfil apropriado quando o módulo deve conter um subconjunto controlado das alterações da sessão.

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

Os caminhos são normalizados, não vazios e relativos à raiz das alterações. Gere e revise o inventário primeiro; cada inclusão deve corresponder aos dados do inventário. O inventário registra metadados como caminho, tipo, categoria, sensibilidade e tamanho, mas não lê ou emite conteúdos de arquivos, alvos de links simbólicos ou valores secretos. Saídas e inventários de perfil explícito são modo `0600`; módulos de política legada são modo `0644`.

A captura de sessão pode reter exclusões de arquivos suportados e opacidade de diretório para o backend ativo AUFS ou OverlayFS. Ela exclui montagens de tempo de execução, sistemas de arquivos aninhados, registros de união e o próprio arquivo de saída. Um destino existente nunca é substituído.

### Inspecionar e extrair módulos

Inspecione um módulo sem montá-lo ou extraí-lo:

```bash
sb inspect 06-example.sb
sb inspect 06-example.sb --json
```

A inspeção não exige root e também funciona fora de uma sessão MiniOS em execução.

Extraia um módulo para um novo diretório:

```bash
sb2dir 06-example.sb example-root
```

A extração comum não exige root e não modifica a origem. O diretório de destino não deve existir. Arquivos especiais são rejeitados, a menos que `--allow-special` seja solicitado com privilégio suficiente.

Para um diretório que possa ser reempacotado fielmente, extraia com privilégios de administrador e mantenha propriedade e arquivos especiais:

```bash
sudo sb2dir --keep-ownership --allow-special 06-example.sb example-root
```

A extração registra a origem do módulo em `.minios-module-origin.json` dentro do novo diretório. Extração sem root registra que a propriedade não foi preservada; tal diretório não pode ser passado de volta para `dir2sb`. Mantenha o registro de origem em uma extração privilegiada até o reempacotamento.

Diretórios produzidos pelos atuais `sb2dir` são diretórios comuns. `rmsbdir`, `sb rm`, e `sb rmdir` são comandos de compatibilidade descontinuados que sempre recusam remoção; eles não desmontam nem excluem recursivamente nada. Revise um caminho extraído e seu conteúdo antes de removê-lo com ferramentas padrão do sistema de arquivos.

### Gerenciar módulos em execução e de próximo boot

Em execução agora e Próximo boot são composições independentes. Veja [construção de união e ativação em tempo de execução](/reference/boot-process/Module-Loading#union-construction) para a fronteira boot/tempo de execução e por que as duas listas podem ser diferentes.

Liste os módulos que realmente compõem o root atual AUFS ou OverlayFS, do menor ao maior prioridade:

```bash
sb list
sb list --json
```

Liste os módulos selecionados pelas regras atuais de boot:

```bash
sb next-boot
sb next-boot --json
```

Essas consultas não exigem root. As regras canônicas de [camada candidata e substituição](/reference/boot-process/Module-Loading#candidate-tiers) determinam qual origem fornece cada nome base do Próximo boot.

Para disponibilizar um módulo de usuário no próximo boot:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS usa armazenamento durável e gravável adequado, prepara e valida a cópia e publica de forma atômica sem substituir um módulo existente. O nome do arquivo deve atender aos filtros de boot atuais. Remova um módulo de usuário selecionado pelo nome base exato:

```bash
sudo sb next-boot remove 50-extra.sb
```

A remoção é recusada para módulos base e módulos em fontes somente leitura ou voláteis.

A ativação em tempo de execução é uma operação separada, válida apenas para a sessão atual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

A ativação e desativação funcionam apenas quando `/` é atualmente uma união AUFS. Não estão disponíveis em OverlayFS, e apenas o suporte do kernel a AUFS não é suficiente. Nenhum comando altera o Próximo boot.

O despachante de conversão de compatibilidade exige ambos os operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

O uso direto de `dir2sb` e `sb2dir` é preferível, pois a conversão comum pode ser feita sem root.

### Documentação relacionada

- [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading)
- [Modos de boot](/using-minios/Boot-Modes)
- [Reconstruindo imagens ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Construindo MiniOS](/development/Building-MiniOS)
- [Parâmetros de boot](/reference/Boot-Parameters)
