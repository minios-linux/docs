---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# CondinAPT

CondinAPT seleciona e instala pacotes APT de uma lista cujas entradas podem depender de variáveis de configuração do Bash. MiniOS usa esse recurso para verificar pré-requisitos do host, o conjunto básico de pacotes e módulos comuns de SquashFS.

Esta página documenta a implementação em `linux-live/condinapt`. CondinAPT não é um resolvedor de dependências genérico: primeiro avalia os filtros e a disponibilidade dos repositórios, monta filas do APT e, em seguida, instala cada fila selecionada em uma única `apt-get` chamada.

## Sinopse

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

A lista de pacotes e o arquivo de configuração devem ser arquivos regulares e legíveis. Os arquivos de mapeamento e de prioridade são opcionais.

| Opção | Descrição |
| --- | --- |
| `-l`, `--package-list PATH` | Arquivo da lista de pacotes |
| `-c`, `--config PATH` | Configuração Bash confiável |
| `-m`, `--filter-mapping PATH` | Mapeamento de prefixos para variáveis |
| `-P`, `--priority-list PATH` | Expressões regulares do Bash para extrair prioridades |
| `-s`, `--simulation` | Seleciona e exibe pacotes sem instalá-los |
| `-C`, `--check-only` | Verifica os nomes dos pacotes instalados sem instalar nada |
| `-v`, `--verbose` | Diagnóstico de filtros e filas |
| `-vv`, `--very-verbose` | Diagnóstico adicional das filas de prioridade |
| `-x`, `--xtrace` | Ativa o rastreamento do shell |
| `-f`, `--force` | Executa `apt-get update` mesmo quando `pkgcache.bin` existe |
| `-h`, `--help` | Exibe a ajuda |

CondinAPT é executado `apt-get update` quando não está no modo de verificação e quando `-f` foi usado ou `/var/cache/apt/pkgcache.bin` não existe. Isso inclui a simulação; portanto, `-s` não é uma execução de teste sem efeitos colaterais.

A instalação normal exige privilégios de root. O modo de verificação pode ser executado sem privilégios; a simulação também exige root quando aciona uma atualização do APT. A implementação atual não propaga corretamente falhas de `apt-get update`; portanto, considere um erro de atualização como uma execução com falha, mesmo que CondinAPT retorne `0` depois.

## Arquivos de entrada

### Configuração

O arquivo `-c` é carregado pelo Bash. Ele contém código executável, não dados inertes; use apenas arquivos confiáveis.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Arrays indexados definem filtros de associação. Um escalar contendo vírgulas continua sendo uma única string exata: `FEATURES="web,database"` não corresponde a `+feat=web`.

A implementação atual analisa as opções da CLI antes de carregar este arquivo.
Variáveis de configuração que reutilizam nomes internos de CondinAPT, como `VERBOSITY_LEVEL`, podem, portanto, substituir o estado da CLI. Evite esses nomes em configurações genéricas.

### Mapeamento de filtros

O arquivo opcional `-m` mapeia prefixos curtos para nomes de variáveis Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

O formato deve ser exatamente `prefix=VariableName`; espaços em branco ao redor não são removidos. Linhas vazias e linhas cujo primeiro campo começa com `#` são ignoradas.
Em caso de prefixos duplicados, prevalece o último valor.

Sem uma entrada de mapeamento, o próprio prefixo é tratado como nome da variável. Uma variável escalar não definida se comporta como uma string vazia. Portanto, um filtro negativo com erro de digitação pode incluir um pacote sem aviso; por isso, prefira usar um mapeamento e simular no modo detalhado ao adicionar filtros.

### Lista de pacotes

A sintaxe segura para cada linha é:

```text
[!] package[=version|==version] filters... [&& ...] [|| ...] [@release] [# comment]
```

Exemplos:

```text
curl
firefox-esr +dp=debian
firefox +dp=ubuntu
tool -pv=minimum
exfatprogs -pv=minimum || exfat-utils -pv=minimum && exfat-fuse -pv=minimum
!required-package
package=preferred-version
package==strict-version
systemd-timesyncd +d=buster @buster-backports
```

Tudo a partir do primeiro `#` até o fim da linha é removido. Os espaços em branco restantes são normalizados. Aspas, caracteres de escape, parênteses, grupos aninhados e espaços em branco dentro de um único token de filtro não são aceitos. Tokens extras no fim da linha não são rejeitados; portanto, considere a sintaxe acima uma restrição, em vez de confiar na análise permissiva.

Use um destino de lançamento por linha física e coloque-o no final. CondinAPT extrai o destino antes de avaliar as alternativas de pacotes; por isso, valores diferentes de `@release` não podem ser atribuídos a alternativas na mesma linha.

## Filtros

Um filtro compara um valor de configuração usando igualdade exata de strings, que diferencia maiúsculas de minúsculas. Se a variável mapeada for um array indexado, a igualdade com qualquer elemento do array é suficiente. Arrays associativos não são conjuntos de associação.

| Formato | Efeito |
| --- | --- |
| `+x=value` | Incluir somente quando `x` corresponder |
| `-x=value` | Excluir quando `x` corresponder |
| `+{a|b}` | Require at least one member to match |
| `+{a&b}` | Exigir que todos os membros correspondam |
| `-{a|b}` | Exclude when any member matches |
| `-{a&b}` | Excluir somente quando todos os membros corresponderem |

Filtros positivos simples repetidos com o mesmo prefixo são alternativas:

```text
audacity +pv=toolbox +pv=ultra
```

Todos os filtros positivos com prefixos diferentes devem ser aprovados. Cada filtro negativo simples funciona como um veto independente:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Os membros de um grupo devem usar apenas um tipo de operador. Não misture `|` e `&` no mesmo grupo; não há precedência nem aninhamento dentro dos grupos. Expresse "excluir Flux ou exigir no mínimo Xfce" como dois filtros:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternativas e conjunções

`&&` tem precedência maior que `||`. CondinAPT separa primeiro as alternativas e, em seguida, avalia todos os membros de uma conjunção. Portanto:

```text
A || B && C
```

significa `A || (B && C)`.

CondinAPT seleciona a primeira alternativa cujos filtros e verificações de disponibilidade de pacotes são todos aprovados. Se um membro de uma conjunção falhar, os pacotes já selecionados para essa conjunção são revertidos e a próxima alternativa é avaliada.

Essa é uma seleção prévia, não uma nova tentativa de instalação nem uma transação. Se a etapa posterior de `apt-get install` na fila falhar para a alternativa escolhida, CondinAPT não volta para uma `||` alternativa posterior.

Cada alternativa deve repetir seus próprios filtros:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Pacotes obrigatórios

`!` é reconhecido apenas no início da expressão física completa e se aplica a todas as alternativas:

```text
!preferred-package || fallback-package
```

A expressão só causa falha no modo normal quando nenhuma alternativa é válida e um pacote ativo ou uma versão estrita não está disponível. Os filtros podem desativar uma linha obrigatória sem causar falha. Uma falha normal de instalação do APT interrompe a fila, independentemente de `!`.

Na simulação, um erro de disponibilidade de pacote obrigatório é informado, mas não interrompe o processamento da fila; a simulação ainda termina com o status diferente de zero documentado.

## Versões

| Sintaxe | Comportamento |
| --- | --- |
| `package=VERSION` | Prefere a versão exata; recorre a uma versão candidata sem especificação de versão |
| `package==VERSION` | Aceita apenas a versão exata do repositório |

A disponibilidade exata é comparada com o campo de versão completo de `apt-cache madison`. Se uma versão estrita não obrigatória não estiver disponível, essa condição falha; uma alternativa `||` posterior ainda pode ser válida; caso contrário, a linha é ignorada. Prefixe a expressão com `!` para que uma falha de disponibilidade ativa seja fatal.

Quando CondinAPT instala a versão exata solicitada, ele agenda `apt-mark hold` após o sucesso de toda a fila do APT. Uma versão exata já instalada é considerada satisfeita e não é marcada como retida novamente. Falhas ao marcar pacotes como retidos não são propagadas como status de saída do CondinAPT.

Para um pacote instalado sem versão especificada, CondinAPT compara a versão instalada com a versão candidata do repositório. Uma versão candidata diferente é enfileirada novamente; o APT é chamado com `--allow-downgrades`.

## Filas

`---` encerra a fila normal atual. Todos os pacotes selecionados em uma fila são passados em uma única chamada não interativa de `apt-get install` com `--force-confdef`, `--force-confold`, `--allow-downgrades` e `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

As linhas direcionadas a uma versão de destino são removidas do fluxo normal das filas e agrupadas globalmente por versão. As linhas para a mesma versão são combinadas mesmo quando separadas por `---`.
A ordem efetiva de execução é:

1. Fila prioritária sem destino.
2. Filas prioritárias para versões de destino.
3. Filas normais na ordem de origem.
4. Filas restantes para versões de destino, na ordem em que cada versão apareceu pela primeira vez.

Assim, uma linha direcionada a uma versão de destino escrita entre duas linhas normais não cria uma barreira, e as filas direcionadas a versões de destino são processadas após todas as filas normais, a menos que sejam extraídas como trabalho prioritário.

A verificação prévia de disponibilidade nos repositórios não considera a versão de destino; apenas a `apt-get install` recebe `-t RELEASE`. Verifique se os pacotes direcionados estão disponíveis nos repositórios configurados.

## Lista de prioridades

`-P` lê uma expressão regular estendida do Bash por linha. Um padrão é comparado com o primeiro nome de pacote em cada expressão de lista de pacotes. Se houver correspondência, a expressão completa, incluindo filtros, alternativas, estado obrigatório e versão de destino, é movida para uma fila prioritária.

```text
^dkms$
^linux-.*
```

Os padrões não são ancorados, a menos que contenham âncoras. Uma correspondência com um pacote `&&` ou `||` posterior não tem efeito; apenas o primeiro token de pacote é verificado. A extração prioritária também combina correspondências de filas normais separadas. Portanto, não a use para entradas que dependam dos limites originais de `---` para organizar dependências em etapas.

Prioridade significa avaliação e instalação antecipadas, não instalação garantida. Os filtros e as verificações de disponibilidade continuam sendo aplicados.

## Modos de operação e código de saída

### Simulação

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

A simulação avalia filtros, versões, alternativas e filas e, em seguida, exibe os pacotes que seriam passados para o APT. Ela não comprova que a instalação posterior seria bem-sucedida. Uma simulação válida termina intencionalmente com o status `1`, mesmo quando a seleção de pacotes é bem-sucedida.

### Somente verificação

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

O modo somente verificação avalia filtros e operadores, mas verifica apenas se os nomes dos pacotes estão instalados por meio de `dpkg-query`. Ele não valida as versões solicitadas, os pacotes candidatos nos repositórios nem os destinos de lançamento. Retorna `0` quando todas as expressões ativas são atendidas e `1` caso contrário.

O comando `sudo apt install ...` exibido é um diagnóstico aproximado. Ele não mantém as versões nem os lançamentos de destino, pode incluir várias alternativas não atendidas e não há garantia de que reproduza a expressão original.

### Resumo dos status

| Caso | Status |
| --- | --- |
| Ajuda | `0` |
| Execução normal bem-sucedida | `0` |
| Entrada inválida, falha na disponibilidade obrigatória ou falha na fila do APT | `1` |
| Simulação válida | `1` |
| Somente verificação com pacotes ativos ausentes | `1` |

## Tratamento especial de pacotes

A implementação tem um nome de pacote especial: `qemu-kvm`. Ele é aceito quando `apt-cache show qemu-kvm` informa que ele é puramente virtual. Outros pacotes virtuais não têm resolução genérica de provedores. Quando a portabilidade for importante, prefira alternativas explícitas de provedores.

## MiniOS integração

### Invocação de módulo

Para um módulo comum, `build-modules` copia o script de instalação para `/install`, CondinAPT para `/condinapt`, a configuração gerada para `/minios_build.conf` e o mapa para `/condinapt.map`. Um script de instalação convencional é:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
console_colors
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Use `SCRIPT_DIR`; `$CWD` não faz parte do contrato de módulos comuns.
`00-core` é uma etapa de compilação especial, executada antes, e invoca a cópia da árvore de código-fonte em `/linux-live` em vez disso.

O compilador atual de módulos comuns copia automaticamente apenas um arquivo chamado `packages.list`. Módulos que usam nomes de arquivos de listas adicionais devem providenciar explicitamente essas entradas; não presuma que todos os arquivos junto de `install` aparecem na raiz do chroot.

### Mapa de filtros MiniOS

`linux-live/condinapt.map` define atualmente:

| Prefixo | Variável | Significado |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite de destino |
| `da` | `DISTRIBUTION_ARCH` | Arquitetura de destino |
| `dp` | `DISTRIBUTION_PROFILE` | `debian` ou `ubuntu`família de pacotes |
| `is` | `INIT_SYSTEM` | Sistema init selecionado |
| `de` | `DESKTOP_ENVIRONMENT` | Ambiente do módulo |
| `pv` | `PACKAGE_VARIANT` | Variante do pacote |
| `ik` | `INSTALL_KERNEL` | Alternância da instalação do kernel |
| `kf` | `KERNEL_FLAVOUR` | Variante do kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` ou `minios` |
| `ks` | `KERNEL_SERIES` | Série real do kernel durante a `01-kernel` seleção do DKMS |
| `kc` | `KERNEL_CAPABILITIES` | Matriz de recursos detectados durante a `01-kernel` seleção do DKMS |
| `kbd` | `KERNEL_BUILD_DKMS` | Alternância da compilação do DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementação do initramfs |
| `lo` | `LOCALE` | Localidade do sistema |
| `ml` | `MULTILINGUAL` | Alternância de vários idiomas |
| `kl` | `KEEP_LOCALES` | Alternância da retenção de localidades |

`ks` e `kc` são filtros `01-kernel` especiais. Quando a compilação do DKMS está habilitada, esse módulo detecta `KERNEL_SERIES` do kernel instalado e cria a matriz indexada `KERNEL_CAPABILITIES` em uma configuração temporária usada para selecionar pacotes DKMS. Esses filtros não estão presentes nas configurações de módulos comuns; usá-los nesses casos faz com que os filtros positivos falhem e pode fazer com que os negativos sejam aprovados.
`KERNEL_SERIES` não é a preferência `MINIOS_KERNEL_SERIES`. Os recursos detectados atualmente incluem `aufs`, `ntfs3`, `btf_modules` e drivers `rtw88_*` integrados ao kernel com suporte.

Exemplos da lista atual de pacotes do kernel:

```text
pahole +kc=btf_modules || dwarves +kc=btf_modules
ntfs3-dkms -kc=ntfs3
aufs-ng-dkms +kp=distribution +ks=6.12 -da=i386 -kc=aufs
zfs-dkms +pv=toolbox +pv=ultra +da=amd64
```

## Solução de problemas

Use a simulação detalhada para inspecionar a seleção:

```bash
tmp_list="$(mktemp)"
printf '%s\n' 'package-name +pv=standard' >"$tmp_list"
bash linux-live/condinapt \
  -l "$tmp_list" -c system.conf -m filters.map -s -vv
rm -f "$tmp_list"
```

Não use `/dev/stdin`; `-l` requer um arquivo regular.

- Se um filtro for aplicado inesperadamente, verifique o mapeamento exato do prefixo, o tipo da variável, as maiúsculas e minúsculas e o valor. Confira se a variável não está definida ou se o nome está escrito incorretamente.
- Se um fallback não for selecionado, lembre-se de que ele ocorre durante a verificação prévia, e não após uma falha do APT na fila.
- Se a instalação de um pacote específico falhar, inspecione as fontes configuradas e execute `apt-cache policy PACKAGE`; a verificação prévia não se aplica a `-t RELEASE`.
- Se uma versão estrita for ignorada, compare o campo de versão exato com `apt-cache madison PACKAGE`.
- Se a ordem da fila parecer inesperada, leve em conta o agrupamento global por destino e a extração de prioridades antes das filas normais.

Para saber mais sobre o fluxo de trabalho de build, consulte [Building MiniOS](/development/Building-MiniOS).
