# Criando módulos

Os módulos do MiniOS são imagens de sistema de arquivos SquashFS somente leitura, normalmente nomeadas com a extensão `.sb`. Na inicialização, o MiniOS organiza os módulos selecionados em um sistema de arquivos raiz em camadas. Arquivos em uma camada de prioridade superior podem complementar ou ocultar arquivos das camadas inferiores.

Este guia documenta os fluxos de trabalho atuais da linha de comando das Ferramentas MiniOS. Para o aplicativo gráfico, consulte o [MiniOS Module Manager](/administration/Module-Manager.md). Para o processo completo de construção de imagens e arquitetura do sistema, veja [Building MiniOS](/development/Building-MiniOS.md). As listas de pacotes utilizadas na construção do MiniOS estão descritas na [documentação do CondinAPT](/development/CondinAPT.md).

## Limites de segurança e privilégios

Nem toda operação de módulo exige root:

| Operação | Privilégio |
|---|---|
| Listar em execução agora ou no próximo boot com `sb` | Sem root |
| Inspecionar um módulo com `sb inspect` | Sem root |
| Conversão comum `dir2sb` e `sb2dir` | Sem root |
| Preservar propriedade ou permitir arquivos especiais durante a conversão | Root |
| Construir com `apt2sb`, `script2sb` ou `chroot2sb` | Root |
| Capturar a sessão com `savechanges` | Root |
| Ativar, desativar, adicionar ao próximo boot ou remover do próximo boot | Root |

Os construtores utilizam uma união isolada e não instalam pacotes nem aplicam scripts no sistema raiz em execução. A criação também não ativa o resultado nem o seleciona para o próximo boot.

Os conversores e construtores atuais utilizam publicação sem substituição. Um destino já existente, incluindo links simbólicos, não é sobrescrito. Escolha um novo caminho de saída ou revise e remova manualmente a saída antiga.

Use a saída `--help` de cada comando como referência da versão instalada. As opções padrão de compressão do construtor são `zstd` (padrão), `gzip`, `lzo` e `xz`; `dir2sb` também suporta `lz4`.

## Nomes de módulos e níveis de filtro

Os nomes geralmente começam com um número como `06-browser.sb`, pois a ordem das camadas afeta a resolução de conflitos. Um módulo deve conter caminhos relativos à raiz do sistema, como `usr/bin/example`, e não um diretório extra contendo essa árvore.

A opção `--level LEVEL` em `apt2sb`, `script2sb` e `chroot2sb` limita as camadas base usadas para construir a união de build. Com `--level 3`, as camadas numeradas até `03` são usadas e as de número superior são filtradas. Isso pode tornar o módulo menos dependente de camadas opcionais superiores, ao custo de incluir mais dependências no resultado.

## Criar um módulo a partir de pacotes

`apt2sb` instala pacotes do repositório ou arquivos locais `.deb` legíveis em uma união de build privada e captura o resultado. Requer uma sessão ao vivo do MiniOS suportada e privilégios de root.

```bash
sudo apt2sb install chromium chromium-sandbox
sudo apt2sb install -y --level 3 -n 06-browser.sb chromium chromium-sandbox
sudo apt2sb install -y --no-install-recommends ./example_amd64.deb -n 06-example.sb
```

Sem `--name`, o nome de saída é derivado do primeiro pacote. Opções úteis do APT incluem `--install-recommends`, `--no-install-recommends`, `--install-suggests`, `--no-install-suggests`, `--allow-downgrades` e `--target-release RELEASE`. A opção de release-alvo se aplica apenas a `install`.

Para capturar atualizações de pacotes já instalados:

```bash
sudo apt2sb upgrade -y -n upgrades.sb
```

## Criar um módulo a partir de um script

`script2sb` copia um script de instalação para um chroot privado, torna-o executável, executa como root sem terminal interativo, remove o script e captura as alterações resultantes no sistema de arquivos. Se o script falhar, nenhum módulo é criado.

```bash
sudo script2sb --script ./install-example.sh -n 06-example.sb
sudo script2sb --script ./install-example.sh --directory ./seed-root --level 3 -n 06-example.sb
```

A opção `--directory DIR` copia todo o conteúdo da fonte, incluindo arquivos ocultos, para a raiz do módulo antes da execução do script. Organize o diretório seed como uma árvore de sistema de arquivos:

```text
seed-root/
`-- usr/
    `-- share/
        `-- applications/
            `-- example.desktop
```

Revise o script antes de executá-lo. Ele será executado com privilégios de administrador e pode rodar comandos arbitrários. Use `chroot2sb` se a instalação exigir prompts ou intervenção manual.

## Criar um módulo de forma interativa

`chroot2sb` cria uma união de build privada e abre um shell root dentro dela. Instale pacotes ou edite arquivos e, ao sair do shell, as alterações serão capturadas:

```bash
sudo chroot2sb --level 3 -n 06-custom.sb
sudo chroot2sb --directory ./seed-root -c xz -n 06-custom.sb
```

Os comandos digitados no shell não são reproduzidos quando o módulo é carregado; o módulo é um instantâneo do estado final do sistema de arquivos. O histórico do shell é removido do resultado. Se nenhum nome for fornecido, o nome gerado utiliza a data e hora atuais.

O ciclo de vida dividido `prepare`, `shell`, `finish` e `cancel` existe para frontends gráficos protegidos. Para uso normal no terminal, utilize o comando interativo único mostrado acima.

## Criar um módulo a partir de um diretório

`dir2sb` empacota o conteúdo de um diretório preparado em um novo módulo. Ambos os operandos são obrigatórios:

```bash
dir2sb my-app-root 06-my-app.sb
dir2sb --comp xz my-app-root 06-my-app-xz.sb
```

A conversão comum não exige root. O diretório de origem permanece inalterado, a propriedade dentro do módulo é normalizada para root, nós de dispositivo, sockets e FIFOs são rejeitados, e o destino nunca é sobrescrito. Use `--keep-ownership` ou `--allow-special` apenas quando essas semânticas privilegiadas forem necessárias.

## Capturar alterações da sessão atual

`savechanges` lê a camada gravável autoritativa de uma sessão MiniOS em execução. Requer root, pois essa camada pode conter arquivos acessíveis apenas pelo root. O local padrão das alterações é detectado automaticamente:

```bash
sudo savechanges session-changes.sb
sudo savechanges --comp xz session-changes-xz.sb
```

Sem `--profile`, a política histórica do MiniOS omite diretórios vazios, caches, logs, dados de boot, caminhos de runtime, pseudo-sistemas de arquivos e arquivos de sessão e sistema selecionados. Isso é conveniente para a criação tradicional de módulos, mas não é uma garantia explícita de privacidade.

Os perfis explícitos são:

- `exact` preserva alterações representáveis, incluindo dados de usuário, logs, caches, arquivos de identidade, credenciais e metadados de exclusão suportados. Objetos de sistema de arquivos não suportados são rejeitados, em vez de serem descartados silenciosamente.
- `clean` utiliza uma lista de caminhos permitidos voltada para software. Exclui dados de home e root, logs, caches, identidades, configuração de rede, credenciais, configuração arbitrária do sistema e `/usr/local`. Reduz a exposição de privacidade, mas não pode garantir que um arquivo de software permitido não contenha segredos.
- `selected` inclui apenas caminhos relativos revisados a partir de um arquivo de inventário e seleção. Exclusões explícitas têm prioridade. Este é o perfil apropriado quando o módulo deve conter um subconjunto controlado das alterações da sessão.

Exemplos:

```bash
sudo savechanges --profile exact exact-session.sb
sudo savechanges --profile clean --comp xz software-session.sb
sudo savechanges --inventory-json session-inventory.json
sudo savechanges --profile selected --selection selection.json selected-session.sb
```

Um arquivo de seleção possui esta estrutura JSON rigorosa:

```json
{
  "product_kind": "minios-session-selection",
  "schema_version": 1,
  "include_paths": ["etc/default", "opt/my-app"],
  "exclude_paths": ["opt/my-app/private"]
}
```

Os caminhos são normalizados, não vazios e relativos à raiz das alterações. Gere e revise o inventário primeiro; cada inclusão deve corresponder aos dados do inventário. O inventário registra metadados como caminho, tipo, categoria, sensibilidade e tamanho, mas não lê ou emite conteúdos de arquivos, destinos de links simbólicos ou valores secretos. Saídas de perfil explícito e inventários são modo `0600`; módulos de política legada são modo `0644`.

A captura de sessão pode reter exclusões de arquivos suportadas e opacidade de diretórios para o backend AUFS ou OverlayFS ativo. Montagens de runtime, sistemas de arquivos aninhados, registros da união e o próprio arquivo de saída são excluídos. Um destino já existente nunca é substituído.

## Inspecionar e extrair módulos

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

A extração comum não exige root e não modifica a fonte. O diretório de destino não deve existir. Arquivos especiais são rejeitados, a menos que `--allow-special` seja solicitado com privilégio suficiente.

Os diretórios produzidos pelos atuais `sb2dir` são diretórios comuns. `rmsbdir`, `sb rm` e `sb rmdir` são comandos de compatibilidade obsoletos que sempre recusam remoção; eles não desmontam nem apagam nada recursivamente. Revise um caminho extraído e seu conteúdo antes de removê-lo com as ferramentas padrão do sistema de arquivos.

## Gerenciar módulos em execução e para o próximo boot

Running Now e Next Boot são composições independentes.

Liste os módulos que realmente compõem o root AUFS ou OverlayFS atual, da menor para a maior prioridade:

```bash
sb list
sb list --json
```

Liste os módulos selecionados pelas regras de boot atuais, incluindo `bext`, `load` e `noload`:

```bash
sb next-boot
sb next-boot --json
```

Essas consultas não exigem root. Um módulo de próximo boot pode vir da árvore de dados base, de seu diretório `modules/` ou de um armazenamento separado de módulos persistentes. Uma fonte posterior com o mesmo nome substitui a seleção anterior.

Para disponibilizar um módulo de usuário no próximo boot:

```bash
sudo sb next-boot add 50-extra.sb
```

O MiniOS utiliza armazenamento gravável adequado e durável, prepara e valida a cópia, e publica de forma atômica sem substituir um módulo existente. O nome do arquivo deve atender aos filtros de boot atuais. Remova um módulo de usuário selecionado pelo nome exato do arquivo:

```bash
sudo sb next-boot remove 50-extra.sb
```

A remoção é recusada para módulos base e módulos em fontes somente leitura ou voláteis.

A ativação em tempo de execução é uma operação separada, válida apenas para a sessão atual:

```bash
sudo sb activate 50-extra.sb
sudo sb deactivate 50-extra.sb
```

A ativação e desativação só funcionam quando `/` é atualmente uma união AUFS. Não estão disponíveis no OverlayFS, e apenas o suporte ao AUFS no kernel não é suficiente. Nenhum desses comandos altera o Next Boot.

O despachante de conversão de compatibilidade exige ambos os operandos:

```bash
sudo sb conv my-app-root 06-my-app.sb
sudo sb conv 06-my-app.sb example-root
```

O uso direto de `dir2sb` e `sb2dir` é preferível, pois a conversão comum pode ser feita sem root.

## Documentação relacionada

- [MiniOS Module Manager](/administration/Module-Manager.md)
- [Reconstruindo imagens ISO](/development/Rebuilding-ISO.md)
- [Building MiniOS](/development/Building-MiniOS.md)
- [Parâmetros de boot](/configuration/Boot-Parameters.md)
