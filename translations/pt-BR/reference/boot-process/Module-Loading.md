---
updated: 2026-08-28
---

# Carregamento de módulos

Esta página explica o que os parâmetros de boot `load`, `noload`, `bext`, `union` e `toram=trim` alteram. Estes são controles avançados. Um boot normal carrega automaticamente o conjunto de módulos fornecido pela imagem MiniOS selecionada.

MiniOS seleciona e monta seu conjunto de módulos no initrd, antes que o root unificado seja entregue ao sistema init instalado. Use esta página quando um módulo no meio de boot não aparecer no sistema em execução ou quando um filtro alterar a inicialização de forma inesperada.

## Em linguagem simples

MiniOS é montado a partir de módulos `.sb` numerados e somente leitura. Números menores são carregados primeiro; números maiores podem substituir arquivos de módulos com números menores. Uma sessão gravável, quando ativa, fica acima de todos os módulos somente leitura.

Os parâmetros `load=` e `noload=` filtram os caminhos dos módulos antes da montagem. Eles utilizam correspondência por expressões regulares, e não uma lista segura de nomes exatos, então um filtro amplo pode deixar módulos essenciais do core ou do kernel fora do conjunto de boot.

## Parâmetros explicados

| Parâmetro | O que informa ao MiniOS | Principal risco |
|---|---|---|
| `load=PATTERN` | Mantém apenas candidatos a módulo cujos caminhos correspondam ao padrão. | Um padrão incompleto pode omitir módulos necessários. |
| `noload=PATTERN` | Remove candidatos correspondentes após a aplicação de `load=`. | Módulos essenciais do core, kernel, firmware ou desktop podem ser excluídos da inicialização. |
| `bext=EXTENSION` | Trata outra extensão de arquivo como sufixo de candidato a módulo. | Não converte arquivos nem coordena completamente módulos do kernel. |
| `union=aufs` ou `union=overlayfs` | Solicita o sistema de arquivos usado para combinar módulos com a camada gravável. | A ativação de módulos em tempo de execução difere entre AUFS e OverlayFS. |
| `toram=trim` | Copia apenas módulos selecionados e dados obrigatórios limitados para RAM. | Módulos e diretórios omitidos ficam indisponíveis após o desanexamento da origem. |

Antes de alterar filtros, registre a linha de comando atual e o conjunto de módulos. Teste uma alteração por vez e mantenha uma entrada de boot conhecida e funcional disponível.

## Níveis de candidatos

Após localizar o diretório de dados MiniOS, normalmente `minios/`, o initrd escaneia os candidatos a módulo nesta ordem:

1. Entradas imediatamente dentro de `minios/`. Esta varredura não é recursiva.
2. Entradas recursivamente abaixo de `minios/modules/`.
3. Entradas recursivamente abaixo de `minios/modules/` na fonte de persistência gravável registrada pelo initrd.

O terceiro nível é separado do diretório `minios/modules/` na árvore de dados somente leitura selecionada. Ele permite que módulos de usuário duráveis sobrescrevam arquivos de uma ISO ou outra fonte somente leitura. Só está disponível quando a descoberta de persistência publica um root gravável contendo esse diretório.

Os caminhos dos candidatos são achatados para o basename exato ao serem montados. Por exemplo, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` usam ambos o ponto de montagem chamado `50-extra.sb`. Eles não se tornam duas camadas independentes. Um candidato em um nível posterior com o mesmo basename é montado no mesmo ponto e substitui o candidato anterior visível para a montagem da união.
Portanto, o mesmo basename deve ser tratado como um único slot de substituição, e não como uma forma de carregar múltiplos módulos de diretórios diferentes.

O formato normal de módulo é uma imagem de sistema de arquivos SquashFS regular. A varredura do initrd é baseada no nome do arquivo: seleciona caminhos que terminam com a extensão configurada e não verifica antes se cada caminho é um arquivo regular ou um SquashFS válido. Varreduras recursivas podem, portanto, encontrar outro tipo de objeto de sistema de arquivos com nome correspondente. Uma montagem de loop ou SquashFS com falha é relatada por `mount`, mas o loop do candidato não torna essa falha fatal por si só e o boot pode continuar com uma camada ausente. Valide arquivos duvidosos com o fluxo de inspeção em [Criando módulos](/preparing-and-customizing/Managing-Modules).

## Ordenação e precedência

Durante a descoberta, os caminhos são ordenados numericamente pelo basename. O número inicial em nomes como `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` define a ordem do módulo. Um basename sem número inicial é ordenado como zero.
Use prefixos numéricos explícitos e distintos em vez de depender da ordem de empate.

A união final dá precedência aos módulos posteriores, de número mais alto, sobre os anteriores, de número mais baixo. Se dois módulos selecionados contiverem o mesmo caminho relativo à raiz, o arquivo do módulo de maior prioridade será visível. A camada de alterações graváveis tem precedência sobre todos os módulos somente leitura.

A substituição por nível ocorre antes desta ordenação efetiva dos módulos. Um `50-extra.sb` de nível posterior substitui um arquivo de nível anterior com o mesmo basename exato, e então seu prefixo `50` determina onde esse ponto de montagem sobrevivente pertence na união.

## Extensão do pacote

O parâmetro de boot `bext=` seleciona a extensão de arquivo usada para descoberta de dados, filtragem de candidatos e montagem de módulos. O padrão é `sb`, então o sufixo usual do candidato é `.sb`:

```text
bext=sb
```

Alterar `bext` muda o sufixo de arquivo selecionado; não converte um arquivo nem verifica seu formato de sistema de arquivos. A coordenação do kernel é uma exceção: sempre procura por `01-kernel-VERSION.sb`. Com uma extensão personalizada, a varredura normal de candidatos não seleciona esses módulos de kernel `.sb`.

## Filtros de load e noload

`load=` e `noload=` são expressões regulares estendidas e não ancoradas aplicadas às strings de caminho dos candidatos produzidas por cada nível. Não são listas de nomes exatos. Um valor simples como `kernel` corresponde a esse texto em qualquer lugar do caminho, enquanto âncoras devem ser fornecidas explicitamente quando for necessário corresponder a uma posição exata.
Os caminhos variam por nível: candidatos de nível superior são basenames, candidatos de dados recursivos incluem `modules/`, e candidatos de persistência são caminhos absolutos.

Vírgulas são convertidas em alternância de expressões regulares. Por exemplo:

```text
load=core,kernel,firmware
```

é avaliado como `core|kernel|firmware`. Outros caracteres de expressão regular não são escapados.

Um intervalo numérico é expandido apenas quando todo o filtro é um intervalo ascendente que corresponde a `^[0-9]+-[0-9]+$`. Por exemplo, `load=04-06` se torna as alternativas `04|05|06`, com cada valor gerado preenchido com pelo menos dois dígitos. Um intervalo embutido em uma lista separada por vírgulas ou outra expressão não é expandido e mantém seu significado ERE comum.

Quando ambos os parâmetros estão presentes, o initrd aplica `load=` primeiro e depois remove as correspondências com `noload=`. Assim, `noload=` prevalece. Não há conjunto protegido de módulos core ou kernel: filtros podem excluir `00-core`, o `01-kernel` coordenado ou qualquer outro candidato. Tal seleção pode construir um root incompleto ou impedir o boot.

## Coordenação do kernel em execução

A versão do kernel em execução é obtida de um token `vmlinuz-VERSION` na linha de comando do kernel quando disponível, com `uname -r` como alternativa. Antes de montar os módulos, o initrd coordena este triplo de nível superior:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se algum membro estiver ausente, o initrd procura pelos três arquivos em:

```text
minios/kernels/VERSION/
```

Quando o triplo do repositório está completo, ele copia o módulo para `minios/` e os arquivos de boot para `minios/boot/`. Uma cópia parcial é limpa. Se o triplo não estiver completo, a configuração do kernel retorna uma falha, mas o processo continua para a etapa normal de montagem dos módulos. O sistema resultante ainda pode falhar depois porque o sistema de arquivos root não tem os arquivos de suporte para o kernel em execução.

Outros arquivos de nível superior que correspondam a `01-kernel-*.sb` são tratados como inativos. O initrd tenta mover cada módulo inativo e seus arquivos `vmlinuz` e `initrfs` correspondentes para `minios/kernels/VERSION/`. Essas operações de fallback e realocação do repositório exigem uma árvore de dados gravável; falhas individuais de realocação não são fatais. Sempre utilizam `.sb`, independentemente de `bext=`. Veja [Gerenciamento de kernel](/preparing-and-customizing/Managing-Kernels) para fluxos de trabalho suportados de instalação e ativação do kernel.

## Construção da união

MiniOS seleciona `AUFS` quando o kernel em execução oferece suporte, e caso contrário utiliza OverlayFS. `union=overlayfs` seleciona OverlayFS. `union=aufs` solicita `AUFS`, mas recorre a OverlayFS se `AUFS` não estiver disponível.

Com `AUFS`, o initrd primeiro monta uma união vazia com o branch de alterações graváveis e, em seguida, insere cada módulo montado como um branch somente leitura. Uma falha ao criar a união é fatal. Uma falha ao adicionar um branch `AUFS` individual é tratada como melhor esforço: a inicialização continua com os branches que foram adicionados, enquanto MiniOS não marca a persistência como ativa para uma união incompleta.

Com OverlayFS, o conjunto completo de módulos é fornecido como uma lista `lowerdir` invertida quando a união é montada. A camada gravável fornece seu `upperdir` e `workdir`. Falha ao montar essa união é fatal. A ordenação inferior da esquerda para a direita e a ordem de inserção `AUFS` implementam a mesma regra: módulos posteriores, com números mais altos, ocultam caminhos conflitantes de módulos anteriores.

Essa composição em tempo de boot é distinta da ativação em tempo de execução. Após a inicialização, `sb activate` e `sb deactivate` só podem alterar uma raiz que está montada atualmente como `AUFS`. Camadas inferiores OverlayFS não podem ser alteradas no local. A ativação em tempo de execução não altera a seleção do Próximo Boot, e adicionar um módulo de Próximo Boot não o ativa na raiz atual. Veja [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules).

## Toram trim

`toram=trim` cria uma árvore de dados RAM antes da persistência e da coordenação do kernel.
Copia exatamente estes itens da árvore de dados MiniOS selecionada:

- `config.conf`, que é obrigatório por este caminho de cópia.
- `authorized_keys` quando existir como arquivo regular.
- Candidatos de extensão correspondente no nível superior selecionados por `load=` e `noload=`.
- Candidatos de extensão correspondente selecionados recursivamente abaixo de `modules/`, com seus diretórios relativos preservados.
- A árvore completa `changes/` quando a linha de comando solicitar persistência.

Não copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados não relacionados a módulos, módulos não selecionados ou o nível separado de módulos de persistência gravável. Em particular, o fallback do repositório não pode usar um diretório `kernels/` que foi omitido da árvore RAM reduzida. O conjunto de módulos copiado é filtrado antes que o nível de módulo de persistência seja descoberto.

Não há verificação prévia de capacidade de RAM. Uma falha ao copiar `config.conf` ou `changes/` solicitados encerra o contexto de execução da função de cópia, mas seus chamadores nem sempre convertem esse status em uma parada limpa do boot. Uma falha ao copiar `authorized_keys` é relatada, mas não interrompe a cópia. Os módulos selecionados são copiados por um pipeline; uma falha individual de cópia de módulo é relatada, mas seu status nem sempre é propagado para interromper o caminho externo do boot. Não há rollback transacional de uma árvore RAM parcialmente populada.

Após a cópia, o initrd tenta desmontar o ponto de montagem de origem, remover seu caminho de dados antigo e mover a árvore RAM para esse caminho. Só o sucesso dessa cadeia completa marca a origem como desanexada. Se a cadeia falhar, o boot continua usando o caminho de staging RAM. Operações relacionadas de desanexação de ISO e Ventoy são tratadas como melhor esforço.
Consequentemente, `toram=trim` não é prova de que o dispositivo de boot é removível. Não o desconecte a menos que os diagnósticos confirmem que seu sistema de arquivos, dispositivo de loop e mapeamentos device-mapper não estão mais montados ou em uso.

## Rootcopy e a transferência do root

Após a montagem dos módulos e a construção da união, o initrd copia o conteúdo visível de `minios/rootcopy/` diretamente para a união montada. O glob do shell `*` omite entradas com ponto no início diretamente dentro de `rootcopy/`, embora arquivos ocultos dentro de um diretório copiado continuem fazendo parte dessa cópia. Trata-se de uma cópia de arquivos para a visualização gravável, não outra camada de módulo somente leitura, portanto, pode sobrescrever caminhos fornecidos pelos módulos. Erros de cópia não são considerados fatais por esta função.

MiniOS então executa sua configuração inicial, grava o `fstab` do novo root e executa o `rootcopy/run/preinit.sh`, quando presente, passando o caminho da união como seu primeiro argumento. Este script é executado no ambiente do initrd antes da transferência do root e deve ser tratado como código privilegiado de boot.

Na etapa final, o initrd do LiveKit faz o pivot da união montada para `/`, mantém o antigo initrd em `/run/initramfs` para tarefas de desligamento e executa o `init` do novo root. O caminho do Dracut prepara a mesma união e permite que o Dracut realize o `switch_root` final. Após essa etapa, a inicialização normal ocorre dentro do root composto; modificar arquivos no meio de boot não reconstrói mais o conjunto de camadas inferiores selecionadas para aquele boot.

## Diagnóstico seguro

Prefira inspeção somente leitura e registre a linha de comando original antes de alterar filtros:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra a seleção atual baseada em regras, enquanto `sb list` mostra as camadas que realmente compõem o root em execução. Uma diferença pode indicar falha de montagem, substituição por basename, alteração em tempo de execução de `AUFS` ou uma fonte de seleção que mudou após o boot.

Para uma falha inicial, adicione `debug` para mostrar o rastreamento do shell, `timing` para tempos de cada etapa ou `rd.break` para abrir um shell após a configuração do initrd e antes da entrega final do root. Nesse shell, inspecione `/memory/data`, `/memory/bundles`, pontos de montagem e `/proc/cmdline`; não repare sistemas de arquivos nem remova mídias enquanto estiverem montadas. Capture o primeiro erro de montagem ou cópia, não apenas o sintoma posterior. Veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting) para um fluxo de diagnóstico seguro mais amplo.

## Documentação relacionada

- [Modos de boot](/using-minios/Boot-Modes)
- [Descoberta do sistema](/reference/boot-process/System-Discovery)
- [Persistência](/reference/boot-process/Persistence-Internals)
- [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules)
- [Criação de módulos](/preparing-and-customizing/Managing-Modules)
- [Gerenciamento de kernel](/preparing-and-customizing/Managing-Kernels)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
