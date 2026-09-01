---
updated: 2026-08-31
program_commits:
    minios-module-manager: e277da00c0b2f5fa5f41af140af118e361d2044c
---

# Gerenciando módulos

Gerenciador de módulos MiniOS é o aplicativo gráfico para inspecionar, criar e gerenciar MiniOS módulos `.sb`. Ele possui dois ambientes de trabalho: **Módulos** para composição do sistema e **Criar** para criação de novos módulos.

Inicie-o pelo menu de aplicativos ou execute:

```bash
minios-module-manager
```

O aplicativo em si roda como seu usuário de desktop. Ele solicita autenticação de administrador apenas quando uma operação requisitada exige isso.

## Em execução agora e no próximo boot

O workspace de Módulos mantém duas visualizações separadas:

- **Em Execução Agora** é o conjunto ordenado de módulos que atualmente compõem o sistema em uso.
- **Próximo Boot** é o conjunto ordenado selecionado pelas regras atuais de boot MiniOS.

Alterar uma visualização não muda silenciosamente a outra. Por exemplo, **Ativar para Esta Sessão** afeta apenas o sistema em execução, enquanto **Adicionar ao Próximo Boot** copia um módulo para o armazenamento durável de módulos sem ativá-lo imediatamente.

Para as regras autoritativas de boot, incluindo níveis de origem candidatos, substituição exata de basename, ordenação numérica e filtragem por `load=`, `noload=` e `bext=`, consulte [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading). Esse guia também explica por que Em Execução Agora e Próximo Boot podem ser diferentes.

A ativação e desativação em tempo de execução estão disponíveis somente quando o sistema de arquivos raiz está usando AUFS atualmente. Elas não estão disponíveis em um root OverlayFS, mesmo que o kernel ofereça suporte a AUFS. Módulos base não podem ser desativados pelo aplicativo.

Alterações para o próximo boot estão disponíveis apenas quando MiniOS encontra um armazenamento de módulos durável e gravável adequado. Módulos base e módulos em armazenamento somente leitura ou volátil não podem ser removidos. Filtros de boot como `load`, `noload` e `bext` ainda determinam quais módulos são selecionados.

## Inspecionando um módulo

Selecione um módulo para ver sua origem, tamanho compactado e conteúdo do sistema de arquivos. Se o arquivo de origem estiver disponível, **Extrair para Pasta** cria um novo diretório contendo os arquivos do módulo.

A inspeção e a extração comum não exigem privilégios de administrador. A extração nunca substitui um destino existente.

Você também pode abrir um arquivo local `.sb` pelo gerenciador de arquivos. Abrir um arquivo apenas inspeciona; não ativa nem adiciona ao Próximo Boot.

## Criando um módulo

O ambiente Criar utiliza um fluxo de **Configuração**, **Revisão**, **Execução** e **Resultado**. Um módulo criado com sucesso permanece como um arquivo no local de saída. Ele não é ativado nem adicionado automaticamente ao Próximo Boot.

Os métodos disponíveis são:

- **Pacotes** instala pacotes de repositório e arquivos `.deb` locais selecionados, incluindo dependências, em um ambiente de build isolado do MiniOS. A instalação de pacotes requer autenticação de administrador.
- **Script de Instalação** executa um script revisado sem terminal interativo. Uma pasta semente opcional pode fornecer arquivos iniciais. O script é executado com privilégios de administrador, mas não é armazenado no módulo resultante.
- **Chroot Interativo** abre um shell root temporário no terminal embutido. Digite `exit` ao finalizar, então crie o módulo, reabra o shell ou descarte as alterações. Fechar ou descartar a sessão não altera o sistema em execução.
- **Pasta** empacota o conteúdo de um diretório existente. O diretório de origem não é aninhado dentro do módulo. A conversão comum de pastas não exige root, mantém a origem inalterada e normaliza a propriedade para root dentro do módulo.
- **Alterações da Sessão Atual** captura arquivos elegíveis e exclusões da camada gravável da sessão atual. Utiliza a política padrão de `savechanges` do MiniOS, que omite logs, caches, dados de boot e caminhos temporários de execução. Ler toda a camada gravável requer autenticação de administrador.

Escolha um novo caminho de saída para cada fluxo de trabalho. Arquivos existentes nunca são sobrescritos. O progresso e diagnósticos do backend permanecem visíveis durante a execução, e a captura da sessão atual pode ser cancelada.

Alterações da Sessão Atual são destinadas à captura padrão conveniente, não para revisão de cada caminho incluído. Uma camada gravável ao vivo pode conter dados pessoais ou confidenciais. Para políticas explícitas de `exact`, `clean` ou seleção de caminhos para privacidade, utilize o fluxo de trabalho em linha de comando `savechanges` descrito em [Criando módulos](/preparing-and-customizing/Managing-Modules).

## Arrastar e soltar

Arrastar e soltar apenas preenche um campo de entrada ou abre a inspeção:

- Um módulo abre seus detalhes.
- Arquivos `.deb` são adicionados a Pacotes.
- Um diretório é selecionado para Pasta.
- Outro arquivo comum é selecionado como Script de Instalação.

Soltar um item não executa código nem altera Em Execução Agora ou Próximo Boot.

## Documentação relacionada

- [Criando módulos](/preparing-and-customizing/Managing-Modules)
- [Carregamento de módulos no Initrd](/reference/boot-process/Module-Loading)
- [Modos de boot](/using-minios/Boot-Modes)
- [Compondo imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Parâmetros de boot](/reference/Boot-Parameters)

## Criando módulos

Os módulos MiniOS são imagens de sistema de arquivos SquashFS somente leitura, normalmente nomeadas com a extensão `.sb`. Na inicialização, o MiniOS organiza os módulos selecionados em um sistema de arquivos raiz em camadas. Arquivos em uma camada de maior prioridade podem complementar ou ocultar arquivos das camadas inferiores. Esse pipeline modular ao vivo faz parte da arquitetura definidora do MiniOS, descrita em [Sobre MiniOS](/getting-started/About-MiniOS) e [Modos de boot](/using-minios/Boot-Modes). Após a conversão nativa, o root em camadas `.sb` é substituído por um sistema de arquivos Debian tradicional e gravável. O software de gerenciamento de módulos MiniOS é removido porque os fluxos de trabalho de módulos deixam de se aplicar, enquanto o ambiente de área de trabalho selecionado e os aplicativos comuns permanecem instalados como pacotes normais.

Este guia documenta os fluxos de trabalho atuais do MiniOS Tools na linha de comando. Para o aplicativo gráfico, consulte o [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules). Para o processo completo de construção de imagem e arquitetura do sistema, veja [Construindo MiniOS](/development/Building-MiniOS). As listas de pacotes usadas durante a construção do MiniOS são descritas na [documentação CondinAPT](/development/CondinAPT).

### Segurança e limites de privilégio

Nem toda operação de módulo exige root:

| Operação | Privilégio |
|---|---|
| Listar Em Execução Agora ou Próximo Boot com `sb` | Sem root |
| Inspecionar um módulo com `sb inspect` | Sem root |
| Conversão comum `dir2sb` e `sb2dir` | Sem root |
| Preservar propriedade ou permitir arquivos especiais na conversão | Root |
| Construir com `apt2sb`, `script2sb` ou `chroot2sb` | Root |
| Capturar a sessão com `savechanges` | Root |
| Ativar, desativar, adicionar ao Próximo Boot ou remover do Próximo Boot | Root |

Os construtores usam uma união isolada e não instalam pacotes nem alterações de scripts no root em execução. A criação também não ativa o resultado nem o seleciona para o próximo boot.

Os conversores e construtores atuais usam publicação sem substituição. Um destino já existente, incluindo links simbólicos, não é sobrescrito. Escolha um novo caminho de saída ou revise e remova explicitamente a saída antiga.

Use a saída `--help` de cada comando como referência da versão instalada. As opções padrão de compressão do construtor são `zstd` (padrão), `gzip`, `lzo` e `xz`; `dir2sb` também suporta `lz4`.

### Nomes de módulos e níveis de filtro

Os nomes geralmente começam com um número como `06-browser.sb` porque a ordem das camadas afeta a resolução de conflitos. Um módulo deve conter caminhos relativos à raiz do sistema, como `usr/bin/example`, e não um diretório extra contendo essa árvore.

Para detalhes sobre os níveis de origem candidatos, comportamento de colisão de basename, ordenação numérica e as semânticas de `bext=`, `load=` e `noload=`, consulte [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading). Em especial, use um basename único, a menos que o módulo seja destinado a substituir o slot de mesmo nome de um nível de origem anterior.

A opção `--level LEVEL` em `apt2sb`, `script2sb` e `chroot2sb` limita as camadas base usadas para construir a união de build. Com `--level 3`, camadas numeradas até `03` são usadas e camadas com números maiores são filtradas. Isso pode tornar um módulo menos dependente de camadas opcionais superiores, ao custo de incluir mais dependências no resultado.

### Criar um módulo a partir de pacotes

`apt2sb` instala pacotes de repositório ou arquivos `.deb` locais legíveis em uma união de build privada e captura o resultado. Requer uma sessão ao vivo do MiniOS compatível e root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sem `--name`, o nome de saída é derivado do primeiro pacote. Opções úteis do APT incluem `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` e `--target-release RELEASE`. A opção de release-alvo se aplica apenas a `install`.

Para capturar upgrades de pacotes já instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

### Criar um módulo a partir de um script

`script2sb` copia um script de instalação para um chroot privado, torna-o executável, executa como root sem terminal interativo, remove o script e captura as alterações resultantes no sistema de arquivos. Um script com falha não cria módulo.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

A opção `--directory DIR` copia todo o conteúdo de origem, incluindo arquivos ocultos, para a raiz do módulo antes da execução do script. Organize o diretório semente como uma árvore de sistema de arquivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revise o script antes de executá-lo. Ele é executado com privilégios de administrador e pode rodar comandos arbitrários. Use `chroot2sb` se a instalação exigir prompts ou trabalho manual.

### Criar um módulo interativamente

`chroot2sb` cria uma união de build privada e abre um shell root dentro dela. Instale pacotes ou edite arquivos, depois saia do shell para capturar as alterações:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Os comandos digitados no shell não são reexecutados quando o módulo é carregado; o módulo é um instantâneo do estado final do sistema de arquivos. O histórico do shell é removido do resultado. Se nenhum nome for fornecido, o nome gerado usa a data e hora atuais.

O ciclo dividido `prepare`, `shell`, `finish` e `cancel` existe para frontends gráficos protegidos. Para uso normal no terminal, utilize o comando interativo único mostrado acima.

### Criar um módulo a partir de um diretório

`dir2sb` empacota o conteúdo de um diretório preparado em um novo módulo. Ambos os operandos são obrigatórios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

A conversão comum não exige root. Mantém a origem inalterada, normaliza a propriedade para root dentro do módulo, rejeita nós de dispositivo, sockets e FIFOs, e nunca sobrescreve o destino. Use `--keep-ownership` ou `--allow-special` apenas quando essas semânticas privilegiadas forem necessárias.

### Capturar alterações da sessão atual

`savechanges` lê a camada gravável oficial de uma sessão MiniOS em execução. Requer root, pois essa camada pode conter arquivos acessíveis apenas ao root. O local padrão das alterações é detectado automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sem `--profile`, a política histórica do MiniOS omite diretórios vazios, caches, logs, dados de boot, caminhos de runtime, pseudo-filesystems e arquivos de sessão e sistema selecionados. Isso é conveniente para criação tradicional de módulos, mas não garante privacidade explícita.

Os perfis explícitos são:

- `exact` preserva alterações representáveis, incluindo dados de usuário, logs, caches, arquivos de identidade, credenciais e metadados de exclusão suportados. Objetos de sistema de arquivos não suportados são rejeitados em vez de serem perdidos silenciosamente.
- `clean` utiliza uma lista restrita de caminhos orientada a software. Exclui dados de home e root, logs, caches, identidades, configuração de rede, credenciais, configuração arbitrária do sistema e `/usr/local`. Reduz a exposição de privacidade, mas não garante que um arquivo de software permitido não contenha segredo.
- `selected` inclui apenas caminhos relativos revisados a partir de um arquivo de inventário e seleção. Exclusões explícitas têm prioridade. Este é o perfil adequado quando o módulo deve conter um subconjunto controlado das alterações da sessão.

Exemplos:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Um arquivo de seleção possui esta estrutura JSON estrita:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Os caminhos são normalizados, não vazios e relativos à raiz das alterações. Gere e revise o inventário primeiro; cada inclusão deve corresponder aos dados do inventário. O inventário registra metadados como caminho, tipo, categoria, sensibilidade e tamanho, mas não lê ou emite conteúdo de arquivos, alvos de links simbólicos ou valores secretos. Saídas de perfil explícito e inventários são modo `0600`; módulos de política legada são modo `0644`.

A captura da sessão pode reter exclusões de arquivos suportados e opacidade de diretórios para AUFS ou OverlayFS ativos. Exclui montagens de runtime, sistemas de arquivos aninhados, registros da união e o próprio arquivo de saída. Um destino existente nunca é substituído.

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

Diretórios produzidos pelos comandos atuais `sb2dir` são diretórios comuns. `rmsbdir`, `sb rm` e `sb rmdir` são comandos de compatibilidade obsoletos que sempre recusam remoção; eles não desmontam nem apagam recursivamente nada. Revise um caminho extraído e seu conteúdo antes de removê-lo com ferramentas padrão do sistema de arquivos.

### Gerencie módulos em execução e de próximo boot

Em Execução Agora e Próximo Boot são composições independentes. Veja [construção de união e ativação em tempo de execução](/reference/boot-process/Module-Loading) para entender o limite entre boot/tempo de execução e por que as duas listas podem ser diferentes.

Liste os módulos que realmente compõem o root AUFS ou OverlayFS atual, da menor para a maior prioridade:

```bash
sb list
sb list --json
```

Liste os módulos selecionados pelas regras atuais de boot:

```bash
sb next-boot
sb next-boot --json
```

Essas consultas não exigem root. As regras canônicas de [níveis candidatos e substituição](/reference/boot-process/Module-Loading) determinam qual origem fornece cada basename do Próximo Boot.

Para disponibilizar um módulo de usuário no próximo boot:

```bash
sudo sb next-boot add 50-extra.sb
```

MiniOS usa armazenamento durável e gravável adequado, prepara e valida a cópia, e publica de forma atômica sem substituir um módulo existente. O nome do arquivo deve atender aos filtros de boot atuais. Remova um módulo de usuário selecionado pelo basename exato:

```bash
sudo sb next-boot remove 50-extra.sb
```

A remoção é recusada para módulos base e módulos em fontes somente leitura ou voláteis.

A ativação em tempo de execução é uma operação separada, válida apenas para a sessão:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

Ativação e desativação funcionam apenas quando `/` é atualmente uma união AUFS. Não estão disponíveis em OverlayFS, e o suporte do kernel a AUFS sozinho não é suficiente. Nenhum desses comandos altera o Próximo Boot.

O despachante do conversor de compatibilidade exige ambos os operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

O uso direto de `dir2sb` e `sb2dir` é preferível porque a conversão comum pode ser executada sem root.

### Documentação relacionada

- [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules)
- [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading)
- [Modos de inicialização](/using-minios/Boot-Modes)
- [Reconstruindo imagens ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [Compilando MiniOS](/development/Building-MiniOS)
- [Parâmetros de inicialização](/reference/Boot-Parameters)
