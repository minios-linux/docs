---
updated: 2026-10-15
---

# Carregamento de módulos

Esta página explica o que os parâmetros `load`, `noload`, `bext`, `union` e `toram=trim` de inicialização alteram. Esses são controles avançados. Uma inicialização normal carrega automaticamente o conjunto de módulos fornecido pela imagem MiniOS selecionada.

MiniOS seleciona e monta seu conjunto de módulos no initrd, antes de o sistema init instalado receber a raiz union. Use esta página quando um módulo da mídia de inicialização não aparecer no sistema em execução ou quando um filtro alterar a inicialização inesperadamente.

## Em termos simples

MiniOS é composto por módulos somente leitura `.sb` numerados. Os números menores são carregados primeiro; os maiores podem substituir arquivos de módulos com numeração menor. Quando ativa, uma sessão gravável fica acima de todos os módulos somente leitura.

Os parâmetros `load=` e `noload=` filtram os caminhos dos módulos antes da montagem. Eles usam correspondência por expressão regular, em vez de uma lista segura de nomes exatos; por isso, um filtro abrangente pode excluir módulos essenciais do sistema ou do kernel do conjunto de inicialização.

## Parâmetros explicados

| Parâmetro | O que informa ao MiniOS | Principal risco |
|---|---|---|
| `load=PATTERN` | Manter apenas os candidatos a módulo cujos caminhos correspondam ao padrão. | Um padrão incompleto pode excluir módulos necessários. |
| `noload=PATTERN` | Excluir os candidatos correspondentes depois que `load=` tiver sido aplicado. | Módulos essenciais do sistema, do kernel, de firmware ou da área de trabalho podem ser excluídos da inicialização. |
| `bext=EXTENSION` | Tratar outra extensão de arquivo como um sufixo de candidato a módulo. | Isso não converte arquivos nem coordena totalmente os módulos do kernel. |
| `union=aufs` ou `union=overlayfs` | Solicitar o sistema de arquivos usado para combinar módulos com a camada gravável. | A ativação de módulos em tempo de execução difere entre AUFS e OverlayFS. |
| `toram=trim` | Copiar apenas os módulos selecionados e os dados necessários limitados para RAM. | Módulos e diretórios excluídos ficam indisponíveis após a desconexão da origem. |

Antes de alterar os filtros, registre a linha de comando atual e o conjunto de módulos. Teste uma alteração por vez e mantenha disponível uma entrada de inicialização que você sabe que funciona.

<a id="candidate-tiers"></a>

## Níveis de candidatos

Depois de localizar o diretório de dados do MiniOS, normalmente `minios/`, o initrd detecta uma árvore externa opcional de MiniOS antes de copiar RAM ou ativar a sessão. Uma partição de persistência na mesma unidade ou uma estrutura de dados gravável de Ventoy pode fornecer essa árvore, mesmo em uma inicialização sem sessão salva. O backend do Persistence Plugin selecionado, Ventoy, é um modelo separado e não fornece essa árvore de módulos externos.

Os candidatos formam dois grupos:

1. Nomes de módulos no nível superior da árvore de dados selecionada e da árvore externa de `minios/`, classificados e sem duplicatas por nome relativo.
2. Arquivos e links simbólicos encontrados recursivamente abaixo de `modules/` nas duas árvores, classificados e sem duplicatas por caminho relativo.

Para o mesmo caminho relativo, um arquivo comum externo tem prioridade sobre a ISO ou outra origem selecionada. Isso se aplica tanto à substituição de módulos do sistema quanto a módulos adicionais. Os filtros são aplicados aos caminhos relativos mesclados antes da montagem ou da cópia reduzida de RAM. A raiz da partição de persistência permanece separada do armazenamento de sessões numeradas.

Os pontos de montagem ainda são reduzidos aos nomes de base exatos. Por exemplo, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` apontam ambos para `50-extra.sb`; eles não são camadas union independentes. Use nomes de base distintos, a menos que a intenção seja substituir um caminho exato. Não conte com nomes de base duplicados em diretórios diferentes como mecanismo de substituição.

O formato normal de módulo é uma imagem de sistema de arquivos SquashFS. Um nome de arquivo correspondente não valida seu conteúdo. As verificações recursivas consideram arquivos e links simbólicos, enquanto a verificação do nível superior é baseada nos nomes dos arquivos. Se não for possível vincular uma substituição externa ou montar um módulo selecionado, o processo agora entra no caminho fatal do initramfs em vez de omitir silenciosamente essa camada. Valide arquivos suspeitos com [Inspecionar e extrair módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules).

## Ordenação e prioridade

Durante a descoberta, os caminhos são classificados numericamente pelo nome base. O número inicial em nomes como `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` define a ordem dos módulos. Um nome base sem número inicial é classificado numericamente como zero.
Use prefixos numéricos explícitos e distintos em vez de depender da ordem de desempate.

A união final dá prioridade aos módulos posteriores, com números mais altos, em relação aos anteriores, com números mais baixos. Se dois módulos selecionados contiverem o mesmo caminho relativo à raiz, o arquivo do módulo de maior prioridade ficará visível. A camada de alterações graváveis tem prioridade sobre todos os módulos somente leitura.

A substituição externa por caminho relativo ocorre antes dessa ordenação efetiva dos módulos. Uma substituição `modules/50-extra.sb` ocupa o mesmo slot selecionado que o arquivo de origem, e seu prefixo `50` determina sua prioridade na união.

## Extensão do pacote

O parâmetro de inicialização `bext=` seleciona a extensão de nome de arquivo usada para descoberta de dados, filtragem de candidatos e montagem de módulos. O padrão é `sb`, então o sufixo usual dos candidatos é `.sb`:

```text
bext=sb
```

Alterar `bext` altera o sufixo do nome de arquivo selecionado; isso não converte um arquivo nem verifica seu formato no sistema de arquivos. A coordenação do kernel é uma exceção: ela sempre procura por `01-kernel-VERSION.sb`. Com uma extensão personalizada, a verificação normal de candidatos não seleciona esses módulos de kernel `.sb`.

## Filtros load e noload

`load=` e `noload=` são expressões regulares estendidas não ancoradas, aplicadas às strings de caminho dos candidatos geradas por cada nível. Elas não são listas de nomes exatos. Um valor simples como `kernel` corresponde a esse texto em qualquer parte do caminho; para exigir uma posição exata, é necessário fornecer âncoras explicitamente.
Os candidatos do nível superior são nomes base, e os candidatos recursivos incluem `modules/`. Os candidatos externos usam o mesmo formato de caminho relativo, não caminhos absolutos de montagem persistente.

As vírgulas são convertidas em alternância de expressão regular. Por exemplo:

```text
load=core,kernel,firmware
```

é avaliado como `core|kernel|firmware`. Outros caracteres de expressão regular não são escapados.

Um intervalo numérico só é expandido quando todo o filtro consiste em um único intervalo crescente que corresponde a `^[0-9]+-[0-9]+$`. Por exemplo, `load=04-06` se transforma nas alternativas `04|05|06`, com cada valor gerado preenchido com zeros à esquerda até ter pelo menos dois dígitos. Um intervalo inserido em uma lista separada por vírgulas ou em outra expressão não é expandido e mantém o significado comum em ERE.

Quando os dois parâmetros estão presentes, o initrd aplica `load=` primeiro e depois remove as correspondências com `noload=`. Assim, `noload=` prevalece. Não há um conjunto protegido de módulos essenciais ou do kernel: os filtros podem excluir `00-core`, o `01-kernel` coordenado ou qualquer outro candidato. Essa seleção pode montar uma raiz incompleta ou impedir a inicialização.

## Coordenação com o kernel em execução

A versão do kernel em execução é obtida de um token `vmlinuz-VERSION` na linha de comando do kernel, quando disponível, usando `uname -r` como alternativa. Antes de montar os módulos, o initrd coordena este conjunto de três arquivos no nível superior:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se algum dos arquivos estiver ausente, o initrd procura os três arquivos em:

```text
minios/kernels/VERSION/
```

Quando o conjunto de três arquivos do repositório está completo, ele copia o módulo para `minios/` e os arquivos de inicialização para `minios/boot/`. Uma cópia parcial é removida. Se o conjunto de três arquivos não estiver completo, a configuração do kernel retorna uma falha, mas o chamador continua para a etapa normal de montagem dos módulos. O sistema resultante ainda pode falhar mais tarde porque o sistema de arquivos raiz não tem os arquivos de suporte do kernel em execução.

Outros arquivos no nível superior que correspondam a `01-kernel-*.sb` são tratados como inativos. O initrd tenta mover cada módulo inativo e seus arquivos correspondentes `vmlinuz` e `initrfs` para `minios/kernels/VERSION/`. Essas operações de fallback do repositório e realocação exigem uma árvore de dados gravável; falhas individuais de realocação não são fatais. Elas sempre usam `.sb`, independentemente de `bext=`. A verificação de candidatos mesclada também exclui `01-kernel-*` módulos que não correspondem ao kernel em execução, incluindo candidatos externos. Consulte [Gerenciamento do kernel](/preparing-and-customizing/Managing-Kernels) para ver os fluxos de trabalho compatíveis de instalação e ativação do kernel.

<a id="union-construction"></a>

## Construção da união

MiniOS seleciona `AUFS` quando o kernel em execução oferece suporte; caso contrário, usa OverlayFS. `union=overlayfs` seleciona OverlayFS. `union=aufs` solicita `AUFS`, mas recorre a OverlayFS se `AUFS` não estiver disponível. Quando o UEFI Secure Boot está ativado, o initrd não carrega o módulo `aufs-ng`; se nenhuma outra implementação utilizável de AUFS já estiver disponível, será usado OverlayFS, mesmo que `union=aufs` tenha sido solicitado.

Com `AUFS`, o initrd primeiro monta uma união vazia com a ramificação de alterações graváveis e, em seguida, insere cada módulo montado como uma ramificação somente leitura. Uma falha ao criar a união é fatal. Se ocorrer uma falha ao adicionar uma ramificação individual de `AUFS`, o processo tenta prosseguir da melhor forma possível: a inicialização continua com as ramificações adicionadas, mas MiniOS não indica que a persistência está ativa quando a união está incompleta.

Com OverlayFS, o conjunto completo de módulos é fornecido como uma única lista invertida de `lowerdir` no momento da montagem da união. A camada gravável fornece seu `upperdir` e `workdir`. Se a montagem dessa união falhar, o erro é fatal. A ordenação das camadas inferiores da esquerda para a direita e a ordem de inserção de `AUFS` implementam a mesma regra: módulos posteriores, com números mais altos, ocultam caminhos conflitantes dos módulos anteriores.

Essa composição durante a inicialização é diferente da ativação em tempo de execução. Após a inicialização, `sb activate` e `sb deactivate` só podem alterar uma raiz que esteja montada atualmente como `AUFS`. As camadas inferiores de OverlayFS não podem ser alteradas no local. A ativação em tempo de execução não altera a seleção para a próxima inicialização, e adicionar um módulo para a próxima inicialização não o ativa na raiz atual. Consulte [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules).

## Enxugamento Toram

`toram=trim` cria uma árvore de dados do sistema RAM após a descoberta de módulos externos e antes da ativação da sessão e da coordenação do kernel. Ela copia:

- `config.conf`, necessário para este processo de cópia.
- `authorized_keys` quando existe como arquivo regular.
- Candidatos de nível superior com extensão correspondente, selecionados por `load=`, `noload=` e pelo filtro do kernel em execução.
- Candidatos com extensão correspondente selecionados recursivamente abaixo de `modules/`, preservando os diretórios relativos.
- Substituições e adições externas selecionadas pelas mesmas regras e copiadas para os caminhos relativos correspondentes.

Ele cria um diretório `changes/` vazio; a cópia da sessão é feita separadamente por `perchtoram`. Ele não copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados que não sejam de módulos nem módulos não selecionados. Em particular, a alternativa de repositório não pode usar um diretório `kernels/` que tenha sido omitido da árvore RAM enxugada. Os módulos externos já estão incluídos, portanto a inicialização RAM não reabre os arquivos originais após a cópia.

A cópia do sistema não verifica previamente a capacidade de RAM. Se houver falha ao copiar `config.conf` ou um módulo selecionado, o erro é propagado para a entrada do init e aciona o caminho fatal. Uma falha ao copiar `authorized_keys` opcional é informada, mas não interrompe o processo. Não há reversão transacional de uma árvore de dados do sistema parcialmente preenchida. A cópia da sessão tem sua própria verificação prévia de memória e, se não for possível prepará-la, usa a sessão original armazenada; consulte [Detalhes internos da persistência](/reference/boot-process/Persistence-Internals).

Após a cópia, o initrd tenta desmontar a montagem de origem, remover o caminho antigo dos dados e mover a árvore RAM para esse caminho. A origem só é considerada desconectada se toda essa sequência for concluída com sucesso. Se houver falha, a inicialização continua usando o caminho de preparação RAM. As operações relacionadas de desconexão de ISO e Ventoy são tentativas sem garantia de sucesso.
Portanto, `toram=trim` não prova que o dispositivo de inicialização possa ser removido. Não o desconecte, a menos que os diagnósticos confirmem que o sistema de arquivos, o dispositivo de loop e os mapeamentos do device-mapper não estão mais montados nem em uso.

## Rootcopy e transferência da raiz

Após a montagem dos módulos e a construção da união, o initrd copia o conteúdo visível de `minios/rootcopy/` diretamente para a união montada. O padrão glob do shell `*` omite entradas com nomes iniciados por ponto diretamente dentro de `rootcopy/`, embora os arquivos ocultos dentro de um diretório copiado continuem fazendo parte dessa cópia. Trata-se de uma cópia de arquivos para a visão gravável, não de outra camada de módulo somente leitura; por isso, ela pode substituir caminhos fornecidos pelos módulos. Esta função não considera fatais os erros de cópia.

Em seguida, MiniOS executa a configuração inicial, grava o `fstab` da nova raiz e executa o script `rootcopy/run/preinit.sh` quando disponível, passando o caminho da união como primeiro argumento. Esse script é executado no ambiente initrd antes da transferência da raiz e deve ser tratado como código privilegiado de inicialização.

Na etapa final, o initrd do LiveKit transfere a união montada para `/`, mantém o initrd antigo em `/run/initramfs` para as tarefas de desligamento e executa o `init` da nova raiz. O caminho do Dracut prepara a mesma união e deixa o Dracut realizar a `switch_root` final. Depois dessa etapa, a inicialização normal ocorre dentro da raiz composta; alterar arquivos na mídia de inicialização não recria o conjunto de camadas inferiores selecionado para aquela inicialização.

## Diagnósticos seguros

Prefira a inspeção somente leitura e registre a linha de comando original antes de alterar os filtros:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra a seleção atual baseada em regras, enquanto `sb list` mostra as camadas que compõem de fato a raiz em execução. Uma diferença pode indicar falha de montagem, substituição por nome de arquivo, alteração em tempo de execução de `AUFS` ou uma fonte de seleção que mudou após a inicialização.

Se ocorrer uma falha inicial, adicione `debug` para exibir o rastreamento do shell, `timing` para ver a duração das etapas ou `rd.break` para abrir um shell após a configuração do initrd e antes da transferência final da raiz. Nesse shell, inspecione `/memory/data`, `/memory/bundles`, as montagens e `/proc/cmdline`; não repare sistemas de arquivos nem remova mídias enquanto estiverem montados. Registre o primeiro erro de montagem ou cópia, não apenas o sintoma posterior. Consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting) para ver um fluxo de trabalho de diagnóstico seguro mais abrangente.

## Documentação relacionada

- [Modos de inicialização](/using-minios/Boot-Modes)
- [Descoberta do sistema](/reference/boot-process/System-Discovery)
- [Persistência](/reference/boot-process/Persistence-Internals)
- [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules)
- [Criação de módulos](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Gerenciamento do kernel](/preparing-and-customizing/Managing-Kernels)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
