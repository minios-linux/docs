---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# CondinAPT

CondinAPT seleciona e instala pacotes APT a partir de uma lista cujas entradas podem depender de variáveis de configuração do Bash. MiniOS o utiliza para verificações de pré-requisitos do host, conjunto principal de pacotes e módulos comuns de SquashFS.

Esta página documenta a implementação em `linux-live/condinapt`. CondinAPT não é um solucionador de dependências geral: ele avalia primeiro os filtros e a disponibilidade dos repositórios, monta as filas do APT e, em seguida, instala cada fila selecionada em uma única chamada de `apt-get`.

## Sinopse

```bash
sudo bash linux-live/condinapt \
  -l packages.list \
  -c system.conf \
  -m filters.map
```

A lista de pacotes e a configuração devem ser arquivos regulares e legíveis. Os arquivos de mapeamento e prioridade são opcionais.

| Opção | Significado |
| --- | --- |
| `-l`, `--package-list PATH` | Arquivo de lista de pacotes |
| `-c`, `--config PATH` | Configuração Bash confiável |
| `-m`, `--filter-mapping PATH` | Mapeamento de prefixo para variável |
| `-P`, `--priority-list PATH` | Expressões regulares Bash para extração de prioridade |
| `-s`, `--simulation` | Seleciona e exibe pacotes sem instalá-los |
| `-C`, `--check-only` | Verifica nomes de pacotes instalados sem instalação |
| `-v`, `--verbose` | Diagnóstico de filtros e filas |
| `-vv`, `--very-verbose` | Diagnóstico adicional de filas de prioridade |
| `-x`, `--xtrace` | Ativa rastreamento do shell |
| `-f`, `--force` | Executa `apt-get update` mesmo quando `pkgcache.bin` existe |
| `-h`, `--help` | Exibe ajuda |

CondinAPT executa `apt-get update` quando não está no modo apenas de verificação e quando `-f` foi usado ou `/var/cache/apt/pkgcache.bin` não existe. Isso inclui simulação, então `-s` não é uma execução a seco sem efeitos colaterais.

A instalação normal requer root. O modo apenas de verificação pode ser executado sem privilégios; a simulação também exige root quando aciona uma atualização do APT. A implementação atual não propaga uma falha em `apt-get update` de forma confiável, portanto, trate um erro de atualização como uma execução falha mesmo que CondinAPT retorne `0` posteriormente.

## Arquivos de entrada

### Configuração

O arquivo `-c` é carregado via Bash. Ele contém código executável, não é um formato de dados inerte, então utilize apenas arquivos confiáveis.

```bash
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
FEATURES=(web database monitoring)
```

Arrays indexados fornecem filtros de associação. Um escalar contendo vírgulas ainda é uma única string exata: `FEATURES="web,database"` não corresponde a `+feat=web`.

A implementação atual analisa as opções da CLI antes de carregar este arquivo.
Variáveis de configuração que reutilizam nomes internos do CondinAPT, como `VERBOSITY_LEVEL`, podem sobrescrever o estado da CLI. Evite esses nomes em configurações genéricas.

### Mapeamento de filtros

O arquivo opcional `-m` mapeia prefixos curtos para nomes de variáveis Bash:

```text
d=DISTRIBUTION
st=SYSTEM_TYPE
feat=FEATURES
```

O formato é exatamente `prefix=VariableName`; espaços em branco ao redor não são removidos. Linhas vazias e linhas cujo primeiro campo começa com `#` são ignoradas.
Prefixos duplicados usam o último valor.

Sem uma entrada de mapeamento, o próprio prefixo é tratado como nome da variável. Um escalar não definido se comporta como uma string vazia. Portanto, um filtro negativo digitado incorretamente pode incluir silenciosamente um pacote; prefira um mapeamento e utilize simulação detalhada ao adicionar filtros.

### Lista de pacotes

A gramática segura para linhas é:

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

Tudo a partir do primeiro `#` até o final da linha é removido. Espaços em branco restantes são normalizados. Não há suporte para aspas, escape, parênteses, grupos aninhados ou espaços dentro de um único token de filtro. Tokens desconhecidos ao final da linha não são rejeitados, então trate a gramática acima como uma restrição, não confiando em uma análise permissiva.

Use um alvo de release por linha física e coloque-o ao final. CondinAPT extrai o alvo antes de avaliar alternativas de pacotes, então valores diferentes de `@release` não podem ser atribuídos a alternativas na mesma linha.

## Filtros

Um filtro compara um valor de configuração usando igualdade exata de strings, sensível a maiúsculas e minúsculas. Se a variável mapeada for um array indexado, a igualdade com qualquer elemento do array é considerada válida. Arrays associativos não são conjuntos de associação.

| Forma | Efeito |
| --- | --- |
| `+x=value` | Inclui apenas quando `x` corresponde |
| `-x=value` | Exclui quando `x` corresponde |
| `+{a|b}` | Requer pelo menos um membro correspondente |
| `+{a&b}` | Requer que todos os membros correspondam |
| `-{a|b}` | Exclui quando qualquer membro corresponde |
| `-{a&b}` | Exclui apenas quando todos os membros correspondem |

Filtros positivos simples repetidos com o mesmo prefixo são alternativas:

```text
audacity +pv=toolbox +pv=ultra
```

Filtros positivos com prefixos diferentes devem passar todos. Cada filtro negativo simples é um veto independente:

```text
driver +da=amd64 -d=bookworm -d=bullseye
```

Os membros de um grupo devem usar apenas um tipo de operador. Não misture `|` e `&` em um mesmo grupo; não há precedência ou aninhamento dentro dos grupos. Expresse "excluir Flux, ou mínimo Xfce" como dois filtros:

```text
htop -de=flux -{pv=minimum&de=xfce}
```

## Alternativas e conjunções

`&&` tem precedência maior que `||`. CondinAPT divide as alternativas primeiro e depois avalia cada membro de uma conjunção, então:

```text
A || B && C
```

significa `A || (B && C)`.

CondinAPT seleciona a primeira alternativa cujos filtros e verificações de disponibilidade de pacotes passam todos. Se um membro de uma conjunção falhar, os pacotes já selecionados dessa conjunção são revertidos e a próxima alternativa é avaliada.

Esta é uma seleção prévia, não uma repetição de instalação ou transação. Se a verificação posterior de fila em `apt-get install` falhar para a alternativa escolhida, CondinAPT não retorna para um ramo posterior de `||`.

Cada alternativa deve repetir seus próprios filtros:

```text
firefox-esr +dp=debian || firefox +dp=ubuntu
```

## Pacotes obrigatórios

`!` é reconhecido apenas no início da expressão física completa e se aplica a todas as suas alternativas:

```text
!preferred-package || fallback-package
```

A expressão é fatal no modo normal apenas quando nenhuma alternativa tem sucesso e um pacote ativo ou versão estrita está indisponível. Filtros podem desabilitar uma linha obrigatória sem falha. Uma falha de instalação normal do APT aborta sua fila independentemente de `!`.

Na simulação, um erro de disponibilidade obrigatória é relatado, mas não interrompe o processamento das filas; a simulação ainda termina com o status documentado diferente de zero.

## Versões

| Sintaxe | Comportamento |
| --- | --- |
| `package=VERSION` | Prefere a versão exata; recorre a um candidato sem versão |
| `package==VERSION` | Aceita apenas a versão exata do repositório |

A disponibilidade exata é verificada contra o campo completo de versão de `apt-cache madison`. Se uma versão estrita não obrigatória estiver indisponível, essa condição falha; uma alternativa posterior em `||` ainda pode passar, caso contrário a linha é ignorada. Prefixe a expressão com `!` para tornar fatal a falha de disponibilidade ativa.

Quando CondinAPT instala a versão exata solicitada, ele agenda `apt-mark hold` após toda a fila do APT ser concluída com sucesso. Uma versão exata já instalada é considerada satisfeita e não é retida novamente. Falhas ao reter não são propagadas como status de saída do CondinAPT.

Para um pacote instalado sem versão definida, CondinAPT compara a versão instalada com o candidato do repositório. Se houver diferença, o candidato é enfileirado novamente; o APT é chamado com `--allow-downgrades`.

## Filas

`---` encerra a fila normal atual. Cada pacote selecionado em uma fila é passado para uma chamada não interativa de `apt-get install` com `--force-confdef`, `--force-confold`, `--allow-downgrades` e `--no-install-suggests`.

```text
build-essential
pkg-config
---
application
```

Linhas direcionadas para releases são removidas do fluxo normal das filas e agrupadas globalmente por release. Linhas para o mesmo release são mescladas mesmo quando separadas por `---`.
A ordem efetiva de execução é:

1. Fila de prioridade sem alvo.
2. Filas de prioridade para release alvo.
3. Filas normais na ordem do arquivo fonte.
4. Demais filas de release alvo na ordem do primeiro release encontrado.

Assim, uma linha de alvo escrita entre duas linhas normais não forma uma barreira, e filas de alvo são executadas após todas as filas normais, a menos que sejam extraídas como prioridade.

A verificação prévia de disponibilidade do repositório não é sensível ao alvo; apenas o `apt-get install` final recebe `-t RELEASE`. Verifique os pacotes direcionados em relação aos repositórios configurados.

## Lista de prioridade

`-P` lê uma expressão regular estendida do Bash por linha. Um padrão é comparado com o primeiro nome de pacote em cada expressão da lista de pacotes. Se houver correspondência, a expressão completa, incluindo filtros, alternativas, estado obrigatório e alvo de release, é movida para uma fila de prioridade.

```text
^dkms$
^linux-.*
```

Os padrões não são ancorados, a menos que contenham âncoras. A correspondência com um pacote posterior `&&` ou `||` não faz nada; apenas o primeiro token de pacote é inspecionado. A extração de prioridade também mescla correspondências de filas normais separadas, portanto, não a utilize para entradas cuja separação original de `---` seja necessária para o encadeamento de dependências.

Prioridade significa avaliação e instalação antecipadas, não instalação garantida. Filtros e verificações de disponibilidade ainda se aplicam.

## Modos de operação e status de saída

### Simulação

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -s -v
```

A simulação avalia filtros, versões, alternativas e filas, depois imprime os pacotes que seriam passados ao APT. Não garante que a instalação posterior terá sucesso. Uma simulação válida encerra intencionalmente com status `1`, mesmo quando a seleção de pacotes é bem-sucedida.

### Apenas verificação

```bash
bash linux-live/condinapt \
  -l packages.list -c system.conf -m filters.map -C
```

Apenas verificação avalia filtros e operadores, mas verifica apenas se os nomes dos pacotes estão instalados via `dpkg-query`. Não valida versões solicitadas, candidatos de repositório ou alvos de release. Retorna `0` quando toda expressão ativa está satisfeita e `1` caso contrário.

O comando `sudo apt install ...` impresso é apenas um diagnóstico aproximado. Ele perde versões e alvos de release, pode incluir várias alternativas falhas e não garante a reprodução da expressão original.

### Resumo de status

| Caso | Status |
| --- | --- |
| Ajuda | `0` |
| Execução normal bem-sucedida | `0` |
| Entrada inválida, falha de disponibilidade obrigatória ou falha na fila do APT | `1` |
| Simulação válida | `1` |
| Apenas verificação com pacotes ativos ausentes | `1` |

## Tratamento especial de pacotes

A implementação possui um nome de pacote especial: `qemu-kvm`. Ele é aceito quando `apt-cache show qemu-kvm` o relata como puramente virtual. Outros pacotes virtuais não têm resolução genérica de provedor. Prefira alternativas de provedores explícitos quando a portabilidade for importante.

## Integração com MiniOS

### Invocação de módulo

Para um módulo comum, `build-modules` copia o script de instalação para `/install`, CondinAPT para `/condinapt`, a configuração gerada para `/minios_build.conf` e o mapa para `/condinapt.map`. Um script de instalação convencional é:

```bash
#!/bin/bash
set -e
set -o pipefail
set -u

. /minioslib || exit 1
. /minios_build.conf || exit 1

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
/condinapt \
  -l "${SCRIPT_DIR}/packages.list" \
  -c "${SCRIPT_DIR}/minios_build.conf" \
  -m "${SCRIPT_DIR}/condinapt.map"
```

Use `SCRIPT_DIR`; `$CWD` não faz parte do contrato de módulos comuns.
`00-core` é um estágio especial de build anterior e invoca a cópia da árvore-fonte sob `/linux-live` em vez disso.

O construtor atual de módulos comuns copia automaticamente apenas um arquivo chamado `packages.list`. Módulos que utilizam nomes de arquivos de listas adicionais devem organizar essas entradas explicitamente; não assuma que todo arquivo ao lado de `install` estará presente na raiz do chroot.

### Mapa de filtros MiniOS

Atualmente, `linux-live/condinapt.map` define:

| Prefixo | Variável | Significado |
| --- | --- | --- |
| `d` | `DISTRIBUTION` | Suite de destino |
| `da` | `DISTRIBUTION_ARCH` | Arquitetura de destino |
| `dp` | `DISTRIBUTION_PROFILE` | Família de pacotes `debian` ou `ubuntu` |
| `is` | `INIT_SYSTEM` | Sistema init selecionado |
| `de` | `DESKTOP_ENVIRONMENT` | Ambiente do módulo |
| `pv` | `PACKAGE_VARIANT` | Variante do pacote |
| `ik` | `INSTALL_KERNEL` | Alternância de instalação do kernel |
| `kf` | `KERNEL_FLAVOUR` | Flavor do kernel |
| `kp` | `KERNEL_PROVIDER` | `distribution` ou `minios` |
| `ks` | `KERNEL_SERIES` | Série real do kernel durante seleção DKMS em `01-kernel` |
| `kc` | `KERNEL_CAPABILITIES` | Array de capacidades detectadas durante seleção DKMS em `01-kernel` |
| `kbd` | `KERNEL_BUILD_DKMS` | Alternância de build DKMS |
| `ib` | `INITRAMFS_BUILDER` | Implementação do initramfs |
| `lo` | `LOCALE` | Localidade do sistema |
| `ml` | `MULTILINGUAL` | Alternância multilíngue |
| `kl` | `KEEP_LOCALES` | Alternância de retenção de localidade |

`ks` e `kc` são filtros especiais `01-kernel`. Quando a compilação DKMS está ativada, esse módulo detecta `KERNEL_SERIES` do kernel instalado e cria o array indexado `KERNEL_CAPABILITIES` em uma configuração temporária usada para seleção de pacotes DKMS. Eles não estão presentes em configurações de módulos comuns; usá-los nesses casos faz com que filtros positivos falhem e filtros negativos possam passar.
`KERNEL_SERIES` não é a preferência `MINIOS_KERNEL_SERIES`. Capacidades detectadas atualmente incluem `aufs`, `ntfs3`, `btf_modules` e drivers in-tree suportados `rtw88_*`.

Exemplos da lista de pacotes do kernel atual:

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

Não utilize `/dev/stdin`; `-l` requer um arquivo regular.

- Se um filtro passar inesperadamente, verifique o mapeamento exato do prefixo, tipo de variável, maiúsculas/minúsculas e valor. Confira se há variável não definida ou digitada incorretamente.
- Se um fallback não for selecionado, lembre-se de que o fallback ocorre durante a pré-seleção, não após uma falha de fila do APT.
- Se um pacote direcionado falhar, inspecione as fontes configuradas e execute `apt-cache policy PACKAGE`; a pré-seleção não aplica `-t RELEASE`.
- Se uma versão estrita for ignorada, compare o campo de versão exato com `apt-cache madison PACKAGE`.
- Se a ordem das filas surpreender, leve em conta o agrupamento global de alvos e a extração de prioridade antes das filas normais.

Para o fluxo de build mais amplo, veja [Building MiniOS](/development/Building-MiniOS).
