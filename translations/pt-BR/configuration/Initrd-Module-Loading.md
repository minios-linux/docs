---
updated: 2026-08-26
---

# Carregamento de módulos no initrd

O MiniOS seleciona e monta seu conjunto de módulos no initrd, antes de entregar o root unificado para o sistema init instalado. Esta página descreve o comportamento atual do initrd. Isso é útil quando um módulo exibido na mídia de boot não aparece em `noload=`, `bext=` ou `toram=trim`, ou altera o boot de forma inesperada.

## Camadas candidatas

Após localizar o diretório de dados do MiniOS, normalmente `minios/`, o initrd escaneia os módulos candidatos nesta ordem:

1. Entradas imediatamente dentro de `minios/`. Esta varredura não é recursiva.
2. Entradas recursivamente abaixo de `minios/modules/`.
3. Entradas recursivamente abaixo de `minios/modules/` na fonte de persistência gravável registrada pelo initrd.

A terceira camada é separada do diretório `minios/modules/` na árvore de dados somente leitura selecionada. Ela permite que módulos de usuário duráveis sobrescrevam arquivos de uma ISO ou outra fonte somente leitura. Está disponível apenas quando a descoberta de persistência publica uma raiz gravável contendo esse diretório.

Os caminhos candidatos são achatados para seu basename exato ao serem montados. Por exemplo, `modules/work/50-extra.sb` e `modules/test/50-extra.sb` usam ambos o ponto de montagem chamado `50-extra.sb`. Eles não se tornam duas camadas endereçáveis independentemente. Um candidato em uma camada posterior com o mesmo basename é montado no mesmo ponto de montagem e substitui o candidato anterior visível para a montagem unificada. Portanto, o mesmo basename deve ser tratado como um slot de substituição, não como uma forma de carregar múltiplos módulos de diretórios diferentes.

O formato normal de módulo é uma imagem de sistema de arquivos SquashFS regular. A varredura do initrd é baseada no nome do arquivo: seleciona caminhos que terminam com a extensão configurada e não verifica previamente se cada caminho é um arquivo regular ou um SquashFS válido. Varreduras recursivas podem, portanto, encontrar outro tipo de objeto de sistema de arquivos com um nome correspondente. Uma montagem de loop ou SquashFS que falha é relatada por `mount`, mas o loop candidato não torna essa falha fatal por si só e o boot pode continuar com uma camada ausente. Valide arquivos duvidosos com o fluxo de inspeção em [Criando módulos](/development/Creating-Modules.md).

## Ordenação e precedência

Durante a descoberta, os caminhos são ordenados numericamente pelo basename. O número inicial em nomes como `00-core.sb`, `01-kernel-VERSION.sb` e `50-extra.sb` indica a ordem do módulo. Um basename sem número inicial é ordenado como zero. Use prefixos numéricos explícitos e distintos em vez de depender da ordem de empate.

A união final dá precedência aos módulos posteriores, de número mais alto, sobre os anteriores, de número mais baixo. Se dois módulos selecionados contiverem o mesmo caminho relativo à raiz, o arquivo do módulo de maior prioridade será visível. A camada de alterações graváveis tem precedência sobre todos os módulos somente leitura.

A substituição de camadas ocorre antes desta ordenação efetiva dos módulos. Um `50-extra.sb` de camada posterior substitui um arquivo de camada anterior com o mesmo basename exato, depois seu prefixo `50` determina onde esse ponto de montagem sobrevivente pertence na união.

## Extensão de pacote

O parâmetro de boot `bext=` seleciona a extensão de arquivo usada para descoberta de dados, filtragem de candidatos e montagem de módulos. O padrão é `sb`, então o sufixo usual do candidato é `.sb`:

```text
bext=sb
```

Alterar `bext` muda o sufixo de arquivo selecionado; não converte um arquivo nem verifica seu formato de sistema de arquivos. A coordenação com o kernel é uma limitação atual deliberada: ele ainda usa nomes `.sb` literais para `01-kernel-VERSION.sb`. Um `bext` personalizado, portanto, não renomeia ou coordena pelo fato de que uma varredura de candidatos diferente de `sb` não os selecionará.

## Filtros load e noload

`load=` e `noload=` são expressões regulares estendidas não ancoradas aplicadas às strings de caminho dos candidatos produzidos por cada camada. Não são listas de nomes exatos. Um valor simples como `kernel` corresponde a esse texto em qualquer lugar do caminho, enquanto âncoras devem ser fornecidas explicitamente quando for necessário corresponder a uma posição exata.
Os caminhos variam conforme a camada: candidatos de nível superior são basenames, candidatos de dados recursivos incluem `modules/`, e candidatos de persistência são caminhos absolutos.

Vírgulas são convertidas em alternância de expressão regular. Por exemplo:

```text
load=core,kernel,firmware
```

é avaliado como `core|kernel|firmware`. Outros caracteres de expressão regular não são escapados.

Um intervalo numérico é expandido apenas quando todo o filtro é um intervalo ascendente correspondente a `^[0-9]+-[0-9]+$`. Por exemplo, `load=04-06` se torna as alternativas `04|05|06`, com cada valor gerado preenchido para pelo menos dois dígitos. Um intervalo embutido em uma lista separada por vírgula ou outra expressão não é expandido e mantém seu significado ERE comum.

Quando ambos os parâmetros estão presentes, o initrd aplica primeiro `load=` e depois remove as correspondências com `noload=`. Assim, `noload=` prevalece. Não há conjunto protegido de módulos principais ou do kernel: filtros podem excluir `00-core`, o `01-kernel` coordenado ou qualquer outro candidato. Tal seleção pode construir uma raiz incompleta ou impedir o boot.

## Coordenação do kernel em execução

A versão do kernel em execução é obtida de um token `vmlinuz-VERSION` na linha de comando do kernel quando disponível, com `uname -r` como alternativa. Antes de montar os módulos, o initrd coordena este triplo de arquivos de nível superior:

```text
minios/01-kernel-VERSION.sb
minios/boot/vmlinuz-VERSION
minios/boot/initrfs-VERSION.img
```

Se algum membro estiver ausente, o initrd procura pelos três arquivos em:

```text
minios/kernels/VERSION/
```

Quando o triplo do repositório está completo, ele copia o módulo para `minios/` e os arquivos de boot para `minios/boot/`. Uma cópia parcial é removida. Se o triplo não estiver completo, a configuração do kernel retorna falha, mas o processo continua para a etapa normal de montagem de módulos; o sistema resultante ainda pode falhar depois porque os módulos de userspace do kernel em execução estão ausentes.

Outros arquivos de nível superior que correspondem a `01-kernel-*.sb` são tratados como inativos. O initrd tenta mover cada módulo inativo e seus arquivos `vmlinuz` e `initrfs` correspondentes para `minios/kernels/VERSION/`. Essas operações de fallback e realocação de repositório exigem uma árvore de dados gravável; falhas individuais de realocação não são fatais. Elas sempre usam `.sb`, independentemente de `bext=`. Veja [Gerenciamento de kernel](/administration/Kernel-Management.md) para fluxos de trabalho suportados de instalação e ativação de kernel.

## Construção de união

MiniOS seleciona `AUFS` quando o kernel em execução oferece suporte e, caso contrário, utiliza
OverlayFS. `union=overlayfs` seleciona OverlayFS. `union=aufs` solicita `AUFS`, mas
recorre ao OverlayFS se `AUFS` não estiver disponível.

Com `AUFS`, o initrd primeiro monta uma união vazia com o branch de alterações graváveis,
em seguida insere cada módulo montado como um branch somente leitura. Uma falha ao
criar a união é fatal. Uma falha ao adicionar um branch individual `AUFS`
é tratada como melhor esforço: a inicialização continua com os branches que foram adicionados, enquanto
a autoridade de persistência não é publicada para uma união incompleta.

Com OverlayFS, o conjunto completo de módulos é fornecido como uma lista `lowerdir` invertida
quando a união é montada. A camada gravável fornece seu `upperdir` e
`workdir`. Falha ao montar essa união é fatal. A ordenação inferior da esquerda para a direita
e a ordem de inserção `AUFS` implementam a mesma regra: módulos posteriores,
de número mais alto, ocultam caminhos conflitantes de módulos anteriores.

Essa composição em tempo de boot é distinta da ativação em tempo de execução. Após a inicialização,
`sb activate` e `sb deactivate` só podem alterar uma raiz que está atualmente
montada como `AUFS`. As camadas inferiores do OverlayFS não podem ser alteradas em tempo real. A ativação em tempo de execução não altera a seleção do Próximo Boot, e adicionar um módulo de Próximo Boot
não o ativa na raiz atual. Veja
[Gerenciador de Módulos](/administration/Module-Manager.md).

## Toram trim

`toram=trim` cria uma árvore de dados na RAM antes da persistência e da coordenação do kernel. Ele copia exatamente estes itens da árvore de dados MiniOS selecionada:

- `config.conf`, que é obrigatório por este caminho de cópia.
- `authorized_keys` quando existe como arquivo regular.
- Candidatos de extensão no nível superior selecionados por `load=` e `noload=`.
- Candidatos de extensão selecionados recursivamente abaixo de `modules/`, com seus diretórios relativos preservados.
- A árvore `changes/` completa quando a linha de comando solicita persistência.

Não copia `boot/`, `kernels/`, `rootcopy/`, `config.conf.d/`, logs, outros dados não relacionados a módulos, módulos não selecionados ou a camada separada de módulos de persistência gravável. Em especial, o fallback de repositório não pode usar um diretório `kernels/` que foi omitido da árvore RAM reduzida. O conjunto de módulos copiado é filtrado antes da descoberta da camada de módulos de persistência.

Não há verificação prévia da capacidade de RAM. Uma falha ao copiar `config.conf` ou `changes/` solicitados encerra o contexto de execução da função de cópia, mas seus chamadores nem sempre convertem esse status em uma parada limpa do boot. Uma falha ao copiar `authorized_keys` é relatada, mas não interrompe a cópia. Os módulos selecionados são copiados por um pipeline; uma falha individual na cópia de módulo é relatada, mas seu status nem sempre é propagado para interromper o caminho externo do boot. Não há rollback transacional de uma árvore RAM parcialmente populada.

Após a cópia, o initrd tenta desmontar o ponto de montagem de origem, remover seu caminho de dados antigo e mover a árvore RAM para esse caminho. Apenas o sucesso de toda essa cadeia marca a origem como destacada. Se a cadeia falhar, o boot continua usando o caminho de staging da RAM. Operações relacionadas de detach de ISO e Ventoy são tratadas como melhor esforço. Consequentemente, `toram=trim` não é prova de que o dispositivo de boot é removível. Não o desconecte a menos que diagnósticos confirmem que seu sistema de arquivos, dispositivo de loop e mapeamentos device-mapper não estão mais montados ou em uso.

## Rootcopy e a transferência da raiz

Após a montagem dos módulos e a construção da união, o initrd copia o conteúdo visível de `minios/rootcopy/` diretamente para a união montada. O glob de shell `*` omite entradas com ponto no início diretamente dentro de `rootcopy/`, embora arquivos ocultos dentro de um diretório copiado permaneçam parte dessa cópia. Esta é uma cópia de arquivos para a visão gravável, não outra camada de módulo somente leitura, então pode sobrescrever caminhos fornecidos por módulos. Erros de cópia não são tornados fatais por esta função.

O MiniOS então executa sua configuração inicial, grava o novo `fstab` da raiz e executa `rootcopy/run/preinit.sh` quando presente, passando o caminho da união como primeiro argumento. Esse script roda no ambiente do initrd antes da transferência da raiz e deve ser tratado como código de boot privilegiado.

Na fronteira final, o initrd do LiveKit pivota a união montada para `/`, mantém o antigo initrd em `/run/initramfs` para tarefas de desligamento e executa o `init` da nova raiz. O caminho Dracut prepara a mesma união e permite que o Dracut realize o `switch_root` final. Uma vez cruzada essa fronteira, a inicialização normal ocorre dentro da raiz composta; alterar arquivos na mídia de boot não reconstrói mais o conjunto de camadas inferiores selecionado para esse boot.

## Diagnóstico seguro

Prefira inspeção somente leitura e registre a linha de comando original antes de
alterar filtros:

```bash
cat /proc/cmdline
sb next-boot
sb list
findmnt -no FSTYPE,OPTIONS /
findmnt -R /run/initramfs 2>/dev/null
```

`sb next-boot` mostra a seleção atual baseada em regras, enquanto `sb list` mostra as
camadas que realmente compõem a raiz em execução. Uma diferença pode indicar uma falha de montagem, substituição de basename, uma alteração em tempo de execução `AUFS` ou uma fonte de seleção
que mudou após o boot.

Para uma falha inicial, adicione `debug` para mostrar o rastreamento do shell, `timing` para tempos de cada etapa, ou `rd.break` para abrir um shell após a configuração do initrd e antes da transferência final para a raiz. Nesse shell, inspecione `/memory/data`, `/memory/bundles`, montagens
e `/proc/cmdline`; não repare sistemas de arquivos nem remova mídias enquanto estiverem
montadas. Capture o primeiro erro de montagem ou cópia, não apenas o sintoma posterior. Veja
[Solução de Problemas](/administration/Troubleshooting.md) para um fluxo de trabalho de diagnóstico seguro mais amplo.

## Documentação relacionada

- [Modos de boot](/configuration/Boot-Modes.md)
- [Descoberta do sistema](/configuration/Initrd-System-Discovery.md)
- [Persistência](/configuration/Initrd-Persistence.md)
- [Gerenciador de Módulos](/administration/Module-Manager.md)
- [Criando módulos](/development/Creating-Modules.md)
- [Gerenciamento de kernel](/administration/Kernel-Management.md)
- [Solução de problemas](/administration/Troubleshooting.md)
