# CondinAPT: Um Guia Completo para Instalação Condicional de Pacotes

**CondinAPT** é uma ferramenta versátil para automatizar a instalação de pacotes em qualquer sistema baseado em Debian (Debian, Ubuntu e seus derivados). Seu principal diferencial é a capacidade de definir condições e regras complexas para instalar cada pacote com base em configurações arbitrárias do sistema.

**Áreas de Aplicação:**
- Sistemas de build de distribuições Linux
- Automação de configuração de servidores e estações de trabalho
- Deploy de diversas configurações de sistema
- Gerenciamento de pacotes em containers Docker
- Pipelines de CI/CD para preparação de ambientes
- Criação de imagens de instalação personalizadas

## Índice

### Fundamentos

- [Como Funciona e Componentes Principais](#how-it-works-and-core-components)
- [Início Rápido](#quick-start)
- [Uso](#usage)

### Sintaxe e Capacidades

- [Sintaxe do Arquivo de Lista de Pacotes](#package-list-file-syntax)
- [Filtros e Condições](#filters-and-conditions)
- [Filas de Instalação](#installation-queues)
- [Fila de Prioridade](#priority-queue)

### Modos de Operação

- [Modos de Operação e Depuração](#operating-modes-and-debugging)
- [Tratamento de Erros e Recuperação](#error-handling-and-recovery)

### Uso Avançado

- [Recursos Avançados](#advanced-features)
- [Integração com Sistemas de Build](#integration-with-build-systems)

### Exemplos Práticos

- [Exemplos de Cenários Reais](#examples-of-real-world-scenarios)
- [Dicas de Otimização](#optimization-tips)
- [Solução de Problemas](#troubleshooting)

**Principais Recursos:**

*   **Instalação Condicional:** Instale pacotes com base em filtros flexíveis (+, -).
*   **Configuração Externa:** Separação completa da lógica (lista de pacotes) dos dados (parâmetros do sistema).
*   **Filas de Instalação:** Divida o processo em etapas sequenciais para resolver dependências.
*   **Fila de Prioridade:** Instalação garantida dos pacotes críticos primeiro.
*   **Lógica Complexa:** Suporte aos operadores "AND" (`&&`), "OR" (`||`), além de filtros em grupo (`+{a|b}`, `-{a&b}`).
*   **Legibilidade:** Suporte a comentários e linhas em branco para estruturar as listas.
*   **Compatibilidade Retroativa:** Suporta listas simples de pacotes sem condições.

## Como Funciona e Componentes Principais

O CondinAPT opera com quatro arquivos principais:

1.  **Script `condinapt`:** O núcleo, contendo toda a lógica de processamento.

2.  **Arquivo principal de configuração (`-c`):** Um arquivo com variáveis bash que descrevem o ambiente atual.

    Exemplo (`system.conf`):

    ```bash
    DISTRIBUTION="bookworm"
    SYSTEM_TYPE="server"
    ENVIRONMENT="production"
    LOCALE="en_US"
    FEATURES="web,database"
    ```

3.  **Arquivo de mapeamento de filtros (`-m`):** Liga prefixos curtos (usados na lista de pacotes) a nomes de variáveis do arquivo principal de configuração. Este arquivo é **opcional**. Se um filtro não estiver presente no arquivo de mapeamento, será usado como nome de variável do arquivo principal de configuração. Se a variável não for encontrada, o CondinAPT a declara vazia.

    Exemplo (`filters.map`):

    ```text
    d=DISTRIBUTION
    st=SYSTEM_TYPE
    env=ENVIRONMENT
    arch=ARCHITECTURE
    feat=FEATURES
    ```

4.  **Arquivo de lista de pacotes (`-l`):** O arquivo principal que descreve o que instalar e sob quais condições.

## Início Rápido

Para conhecer rapidamente o CondinAPT, crie um exemplo simples:

**1. Crie o arquivo de configuração `config.conf`:**
```bash
# Basic system parameters
DISTRIBUTION="bookworm"
SYSTEM_TYPE="server"
ENVIRONMENT="production"
```

**2. Crie a lista de pacotes `packages.list`:**
```text
# Base packages - always installed
vim
curl

# Packages only for servers
nginx +SYSTEM_TYPE=server
mysql-server +SYSTEM_TYPE=server

# Exclude packages for production environment
debug-tools -ENVIRONMENT=production
```

**3. Execute a instalação:**
```bash
bash
./condinapt -l packages.list -c config.conf
```

**4. Ou teste no modo simulação:**
```bash
bash
./condinapt -l packages.list -c config.conf -s
```

## Uso

### Linha de Comando

```bash
./condinapt [OPTIONS]
```

| Flag         | Flag Longa                     | Argumento | Descrição                                           |
| :----------- | :----------------------------- | :-------- | :-------------------------------------------------- |
| `-l`         | `--package-list`               | `PATH`    | **(Obrigatório)** Caminho para o arquivo de lista de pacotes.       |
| `-c`         | `--config`                     | `PATH`    | **(Obrigatório)** Caminho para o arquivo principal de configuração. |
| `-m`         | `--filter-mapping`             | `PATH`    | (Opcional) Caminho para o arquivo de mapeamento de filtros.         |
| `-P`         | `--priority-list`              | `PATH`    | (Opcional) Caminho para um arquivo de filtros de prioridade. O arquivo contém padrões regex para casar pacotes. Os pacotes correspondentes são movidos para a fila de prioridade (mantendo os filtros). |
| `-s`         | `--simulation`                 |           | Modo simulação. Os pacotes não serão instalados.    |
| `-C`         | `--check-only`                 |           | Apenas verifica se os pacotes já estão instalados. Retorna código de saída 1 se houver pacotes não instalados. Ao final, exibe um comando para instalar os pacotes ausentes. |
| `-v` / `-vv` | `--verbose` / `--very-verbose` |           | Saída detalhada / muito detalhada.                  |
| `-x`         | `--xtrace`                     |           | Ativa rastreamento de comandos com `set -x`.        |
| `-f`         | `--force`                      |           | Força atualização das listas de pacotes antes da instalação. Por padrão, a atualização é pulada se `/var/cache/apt/pkgcache.bin` existir. |
| `-h`         | `--help`                       |           | Exibe a ajuda.                                      |

## Sintaxe do Arquivo de Lista de Pacotes

### Estrutura Básica

Este é o coração do CondinAPT. Toda a lógica é descrita aqui.

Cada linha no arquivo de lista de pacotes consiste em duas partes principais:

1. **Nome do pacote com especificação opcional de versão e release**
2. **Filtros de condição** – definem as condições sob as quais o pacote será instalado

> **Base para todos os exemplos abaixo:**
> Para todos os exemplos a seguir, vamos assumir que os arquivos `system.conf` e `filters.map` da seção [Como Funciona e Componentes Principais](#how-it-works-and-core-components) estão sendo usados.
>
> *   `DISTRIBUTION` = "bookworm"
> *   `SYSTEM_TYPE` = "server"
> *   `ENVIRONMENT` = "production"

### Estrutura do Nome do Pacote

**Nome simples:**
```
vim
```

**Versão do pacote:**
- `package=version` — requisito de versão flexível. Se a versão necessária não estiver disponível, será instalada uma versão disponível.
  ```
  git=2.25.1
  ```
- `package==version` — requisito estrito. Se a versão não for encontrada, a instalação é abortada com erro.
  ```
  curl==7.68.0
  ```

**Especificação de release:**
O release é especificado usando o símbolo `@`, que permite vincular a instalação a um branch específico do repositório.
```
telegram@bookworm-backports
kernel-image-6.5.0@trixie-backports
```

### Estrutura do Arquivo

*   **Nomes de pacotes:** Cada pacote ou condição é escrito em uma nova linha.
*   **Comentários:** Linhas iniciadas com `#`, ou texto após `#` em uma linha, são completamente ignorados.
*   **Linhas em branco:** Ignoradas e servem para separação visual.

```bash
#=== Multimedia ===
vlc          # Excellent media player
audacious    # Another media player

#=== Graphics ===
gimp
```

## Filtros e Condições

Os filtros permitem definir condições adicionais para seleção de pacotes. Eles comparam os valores das variáveis do sistema (arquitetura, distribuição, ambiente de trabalho) com os definidos no arquivo de configuração.

#### Filtros Individuais

*   **`+` (Positivo):** A condição é verdadeira se o valor da variável **corresponde**.
    **Formato:** `+<prefix>=<valor>`
    
    *   **Linha:** `nginx +st=server`
    *   **Análise:** `SYSTEM_TYPE` é igual a "server". A condição é verdadeira.
    *   **Resultado:** `nginx` será instalado.

*   **Múltiplos filtros positivos com o mesmo prefixo:**
    Funcionam como condições OR.
    **Formato:** `+<prefix>=<valor1> +<prefix>=<valor2>`
    
    *   **Linha:** `debug-tools +env=development +env=testing`
    *   **Análise:** `ENVIRONMENT` é igual a "production", que não corresponde a "development" nem "testing". A condição é falsa.
    *   **Resultado:** `debug-tools` não será instalado.

*   **`-` (Negativo):** A condição é verdadeira se o valor da variável **não corresponde**.
    **Formato:** `-<prefix>=<valor>`

    *   **Linha:** `monitoring-tools -st=desktop`
    *   **Análise:** `SYSTEM_TYPE` é igual a "server", que não é igual a "desktop". A condição é verdadeira.
    *   **Resultado:** `monitoring-tools` será instalado.

*   **Múltiplos filtros negativos:**
    O pacote é excluído se QUALQUER condição corresponder.
    **Formato:** `-<prefix>=<valor1> -<prefix>=<valor2>`
    
    *   **Linha:** `realtek-driver -d=trixie -d=sid`
    *   **Análise:** `DISTRIBUTION` é igual a "bookworm", que não é igual a "trixie" nem "sid". As condições de exclusão não são acionadas.
    *   **Resultado:** `realtek-driver` será instalado.

#### Filtros em Grupo

*   **`+{a|b}` (OR para inclusão):** Verdadeiro se **ao menos uma** das condições do grupo for verdadeira.

    *   **Linha:** `web-server +{st=server|st=web-server}`
    *   **Análise:** `SYSTEM_TYPE` é igual a "server". A primeira condição é verdadeira, o que é suficiente.
    *   **Resultado:** O pacote será instalado.

*   **`+{a&b}` (AND para inclusão):** Verdadeiro somente se **todas** as condições do grupo forem verdadeiras.

    *   **Linha:** `database-tools +{d=bookworm&st=server}`
    *   **Análise:** `DISTRIBUTION` é igual a "bookworm" (verdadeiro) E `SYSTEM_TYPE` é igual a "server" (verdadeiro).
    *   **Resultado:** O pacote será instalado.

*   **`-{a|b}` (OR para exclusão):** O pacote é excluído se **ao menos uma** das condições for verdadeira.

    *   **Linha:** `debug-tools -{env=production|st=minimal}`
    *   **Análise:** `ENVIRONMENT` é igual a "production". A primeira condição é verdadeira, então o pacote é excluído.
    *   **Resultado:** O pacote não será instalado.

*   **`-{a&b}` (AND para exclusão):** O pacote é excluído somente se **todas** as condições forem verdadeiras.

    *   **Linha:** `development-tools -{env=production&st=minimal}`
    *   **Análise:** `ENVIRONMENT` é igual a "production" (verdadeiro), mas `SYSTEM_TYPE` não é igual a "minimal". A segunda condição é falsa. O grupo não aciona a exclusão.
    *   **Resultado:** O pacote será instalado (se não houver outros filtros).

### Alternativas

Pacotes diferentes podem ser oferecidos para a mesma funcionalidade e instalados dependendo das condições. As alternativas são separadas pelo operador `||`.

**Importante:** Cada alternativa deve conter uma descrição completa — nome do pacote (com versão e release opcionais) e conjunto de filtros.

**Exemplo:**
```
postgresql +st=database-server || mysql-server +st=web-server
```
- Se `SYSTEM_TYPE` for `database-server`, **postgresql** será selecionado.
- Se `SYSTEM_TYPE` for `web-server`, **mysql-server** será instalado.

### Operadores Lógicos para Pacotes

*   **`||` (OR / Fallback):** Tenta instalar a parte à esquerda. Se falhar (pacote não encontrado ou filtrado), tenta instalar a parte à direita.

    *   **Linha:** `exfatprogs -d=bookworm || exfat-utils`
    *   **Análise:** `DISTRIBUTION` não é igual a "bookworm", a parte esquerda é filtrada. O CondinAPT passa para a parte direita. `exfat-utils` não tem filtros, então será instalado.
    *   **Resultado:** `exfat-utils` será instalado.

*   **`&&` (AND / Conjunção):** Todas as partes devem passar nos filtros para serem adicionadas à fila.

    *   **Linha:** `nginx +st=web-server && php-fpm`
    *   **Análise:** `SYSTEM_TYPE` é igual a "server", mas a condição exige "web-server". A parte esquerda falha.
    *   **Resultado:** Nenhum pacote será instalado.

    *   **Exemplo complexo:** `monitoring-tools +env=production && prometheus +env=production && grafana +env=production`
    *   **Resultado:** Todos os três pacotes só serão instalados se `ENVIRONMENT` for `production`.

### Modificadores Especiais

*   **`!` (Pacote Obrigatório):** Se um pacote for marcado com `!`, mas não for encontrado nos repositórios, o CondinAPT aborta a execução com erro.

    *   **Linha:** `!essential-package`

*   **`@` (Especificação de Release):** Instala um pacote de um release específico do Debian/Ubuntu (ex: `bookworm-backports`).

    *   **Linha:** `kernel-image-6.5.0 @trixie-backports`

### Especificação de Versão do Pacote

O CondinAPT permite controle preciso sobre as versões dos pacotes instalados.

*   **Sintaxe:**
    *   `package=VERSAO`: Tenta instalar a versão especificada (`VERSAO`). Se não estiver disponível nos repositórios, o CondinAPT instalará qualquer versão disponível do pacote.
        *   Exemplo: `my-app=1.2.3` (tenta instalar a 1.2.3, se não, instala, por exemplo, a 1.2.4)
    *   `package==VERSAO`: Instalação **estrita** de uma versão específica. Se essa versão não estiver disponível nos repositórios, o pacote **não será instalado**. Se o pacote também for obrigatório (`!`), o script encerra com erro.
        *   Exemplo: `another-app==2.0.0` (instala apenas a 2.0.0, caso contrário, ignora ou gera erro se obrigatório)

*   **Comportamento:**
    1.  O CondinAPT primeiro verifica se a versão requerida do pacote já está instalada no sistema. Se sim, o pacote é considerado instalado e ignorado.
    2.  Depois verifica se a versão especificada está disponível nos repositórios (`apt-cache madison`).
    3.  **Ao usar `=` (versão flexível):**
        *   Se a versão especificada não estiver disponível, o CondinAPT emitirá um aviso de que a versão exata não foi encontrada.
        *   Mesmo assim, tentará instalar qualquer versão disponível do pacote nos repositórios.
    4.  **Ao usar `==` (versão estrita):**
        *   Se a versão especificada não estiver disponível, o CondinAPT **não** instalará o pacote.
        *   Se o pacote for obrigatório (`!`), o script aborta a execução com erro.
    5.  **Bloqueio de versão (`apt-mark hold`):**
        *   Se um pacote for instalado com **a versão exata especificada** (ou seja, se `package==VERSAO` foi bem-sucedido, ou `package=VERSAO` encontrou exatamente aquela versão e a instalou), o CondinAPT aplicará automaticamente o comando `apt-mark hold` para esse pacote.
        *   Isso impede atualizações automáticas do pacote para uma nova versão em operações futuras de `apt upgrade`.

### Exemplos de Filtros Complexos

#### Exemplo 1: Filtros complexos para um único pacote

**Tarefa:** Instalar `database-tools` para a distribuição `bookworm`, mas apenas se o tipo de sistema for `server` ou `database-server`, e não para o ambiente `minimal`.

**`packages.list`:**

```bash
database-tools +d=bookworm +{st=server|st=database-server} -env=minimal
```

**Análise (com nossa configuração):**

1.  `+d=bookworm`: Verdadeiro.
2.  `+{st=server|st=database-server}`: Verdadeiro, pois `SYSTEM_TYPE` é "server".
3.  `-env=minimal`: Verdadeiro, pois `ENVIRONMENT` é "production".
    **Resultado:** Todas as condições são verdadeiras. O pacote será instalado.

#### Exemplo 2: Cadeia de fallback com condições diferentes

**Tarefa:** Para o Debian `trixie`, instalar `firefox-esr`. Para `bookworm`, instalar `firefox`. Para todos os outros casos, instalar `w3m`.

**`packages.list`:**

```bash
firefox-esr +d=trixie || firefox +d=bookworm || w3m
```

**Análise:**

1.  `firefox-esr +d=trixie`: Parte esquerda. `DISTRIBUTION` é "bookworm", condição falsa.
2.  `firefox +d=bookworm`: Parte do meio. `DISTRIBUTION` é "bookworm", condição verdadeira.
3.  Como a segunda parte da cadeia `||` funcionou, a terceira (`w3m`) será ignorada.
    **Resultado:** `firefox` será instalado.

#### Exemplo 3: Interação entre fila de prioridade e pacote obrigatório

**Tarefa:** `dkms` é crítico para a construção de módulos; deve ser instalado primeiro. Na lista principal, está marcado como obrigatório, mas com uma condição.

*   **`priority.list`:**

    ```text
^dkms$
^build-essential$
```

*   **`packages.list`:**

    ```text
!dkms +pv=standard # Mandatory, but with a condition
vim
```

**Análise:**

1.  O CondinAPT lê os padrões de prioridade `^dkms$` e `^build-essential$`.
2.  A linha `!dkms +pv=standard` corresponde ao padrão `^dkms$` e é movida para a fila de prioridade **com todas as suas propriedades**: o flag obrigatório (`!`) e o filtro (`+pv=standard`).
3.  **Plano de Execução:**

    *   **Fila de Prioridade:** Instalar `!dkms +pv=standard` (flag obrigatório e filtro mantidos).
    *   **Fila Normal:** `vim`.

**Resultado:** `dkms` será instalado primeiro, mas o filtro `+pv=standard` ainda será avaliado. Se a condição do filtro não for atendida, a instalação falhará por causa do flag obrigatório (`!`).

## Filas de Instalação

O separador `---` em uma linha separada divide a lista em grupos (filas). Pacotes de uma fila são instalados juntos em uma única chamada do `apt`. As filas são executadas estritamente em sequência.

### Filas Normais

**Exemplo:**

```text
# Queue 1: Base system
systemd
network-manager
---
# Queue 2: Web server
nginx
php-fpm
---
# Queue 3: Monitoring
prometheus
```

### Filas de Destino (com especificação de release)

Pacotes com `@release` são automaticamente agrupados em filas separadas por release:

```text
# Regular packages
vim
git
---
# Packages from backports (create a separate queue)
linux-image-amd64 @bookworm-backports
nvidia-driver @bookworm-backports
```

## Fila de Prioridade

Esse mecanismo serve para instalação prioritária de pacotes críticos, preservando seus filtros e condições.

*   **Princípio:** O arquivo especificado pela flag `-P` contém padrões regex (um por linha, sem filtros). O CondinAPT varre todas as filas, encontra pacotes que correspondem a esses padrões e os move (com todos os seus filtros e condições) para uma "Fila de Prioridade" especial, que é executada primeiro.
*   **Casamento de Padrões:** Utiliza correspondência regex do bash (operador `=~`). Os padrões podem ser nomes simples de pacotes ou expressões regex complexas.
*   **Preservação de Contexto:** Diferente de listas simples de prioridade, esse mecanismo preserva todas as condições, filtros e especificações de release dos pacotes da lista original.
*   **Override:** Pacotes correspondentes são automaticamente removidos de suas filas originais (tanto normais quanto de destino com `@release`) e movidos para as filas de prioridade. Releases de destino são preservados em filas de prioridade separadas.

**Exemplo 1: Casamento simples de nome de pacote**

*   **`packages.list`:**

    ```text
git +st=full-server   # Will only be installed for full servers
gpg -st=minimal       # Will be installed in all types except minimal
curl                  # Always installed
wget +d=trixie        # Only for trixie
vim +env=development  # Only for development environment
```

*   **`priority.list`:**

    ```text
^gpg$
^git$
```

*   **Análise:**

    1.  O CondinAPT lê o `priority.list` e sabe que pacotes que correspondem aos padrões `^gpg$` e `^git$` devem ser instalados primeiro.
    2.  Ele varre o `packages.list` e encontra a linha `git +st=full-server`. Como `git` corresponde ao padrão, essa linha inteira (com o filtro `+st=full-server`) é movida para a fila de prioridade.
    3.  Da mesma forma, `gpg -st=minimal` é movido para a fila de prioridade com seu filtro `-st=minimal` preservado.
    4.  **Plano Final:**

        *   **Fila de Prioridade:** Instalar `git +st=full-server` e `gpg -st=minimal` (filtros preservados e avaliados).
        *   **Fila Normal:** `curl`, `wget +d=trixie`, `vim +env=development`.

**Exemplo 2: Casamento por padrão regex**

*   **`packages.list`:**

    ```text
linux-image-6.1.0-amd64 +arch=amd64
linux-headers-6.1.0-amd64 +arch=amd64
firmware-linux
build-essential
nginx +st=server
```

*   **`priority.list`:**

    ```text
^linux-.*
^firmware-.*
```

*   **Análise:**

    1.  O padrão `^linux-.*` corresponde a `linux-image-6.1.0-amd64` e `linux-headers-6.1.0-amd64`.
    2.  O padrão `^firmware-.*` corresponde a `firmware-linux`.
    3.  **Plano Final:**

        *   **Fila de Prioridade:** `linux-image-6.1.0-amd64 +arch=amd64`, `linux-headers-6.1.0-amd64 +arch=amd64`, `firmware-linux`.
        *   **Fila Normal:** `build-essential`, `nginx +st=server`.

## Modos de Operação e Depuração

#### Modo Simulação (`-s`)

Permite visualizar quais pacotes serão instalados sem realmente instalá-los:

```bash
./condinapt -l packages.list -c system.conf -s
```

**Saída de Exemplo:**
```text
I: Installation Queue #1:
I: Simulation mode ON. These packages would be installed: firefox-esr vlc htop
I: Simulation mode ON. No installation will be performed.
```

**Nota:** No modo simulação, o script sai com código de saída 1.

#### Modo Verificação (`-C`)

Verifica quais pacotes da lista já estão instalados no sistema:

```bash
./condinapt -l packages.list -c system.conf -C
```

**Comportamento:**
- Exibe erros para pacotes não instalados
- Retorna código de saída 1 se houver pacotes não instalados
- Ao final, exibe um comando para instalar os pacotes ausentes

#### Modos de Depuração

**Saída Detalhada (`-v`):**
- Mostra informações detalhadas sobre as verificações de filtros
- Exibe resultados para cada pacote

**Saída Muito Detalhada (`-vv`):**
- Máximo detalhamento do processo
- Mostra todos os passos intermediários

**Rastreamento de Comandos (`-x`):**
- Ativa o `set -x` para depuração do script
- Mostra cada comando executado

**Exemplo com Depuração:**
```bash
./condinapt -l packages.list -c system.conf -vv -x
```

#### Forçar Atualização do Cache (`-f`)

Força o CondinAPT a executar `apt update` antes da instalação:

```bash
./condinapt -l packages.list -c system.conf -f
```

## Recursos Avançados

### Suporte a Arrays na Configuração

O CondinAPT pode trabalhar com variáveis do tipo array no arquivo de configuração:

**`system.conf`:**
```bash
SUPPORTED_ARCHITECTURES=("amd64" "i386" "arm64")
AVAILABLE_ENVIRONMENTS=("production" "staging" "development")
```

**`filters.map`:**
```text
arch=SUPPORTED_ARCHITECTURES
env=AVAILABLE_ENVIRONMENTS
```

**`packages.list`:**
```text
# Install for any supported architecture
multilib-support +arch=amd64
# Install for any available environment
monitoring-tools +env=production
```

### Pacotes Especiais

O CondinAPT possui suporte interno para pacotes especiais que exigem tratamento diferenciado:

**Pacotes Virtuais:**
- `qemu-kvm` - tratado como pacote virtual

**Mecanismo de Tratamento:**
1. O CondinAPT verifica se o pacote é virtual usando o comando `apt-cache show`
2. Se o pacote for marcado como "puramente virtual", é considerado disponível para instalação
3. A lista de pacotes especiais é definida no array `SPECIAL_PACKAGES` dentro do script:
   ```bash
   SPECIAL_PACKAGES=("qemu-kvm")
   ```

**Estendendo a Lista:** Para adicionar novos pacotes especiais, é necessário editar o array `SPECIAL_PACKAGES` no código do CondinAPT.

## Tratamento de Erros e Recuperação

### Pacotes Obrigatórios (`!`)

Se um pacote for marcado como obrigatório mas não for encontrado nos repositórios, o CondinAPT:
1. Exibe uma mensagem de erro
2. Aborta a execução (exceto no modo simulação)
3. Retorna código de saída 1

**Exemplo:**
```text
!essential-package +pv=standard
```

Se `essential-package` não for encontrado nos repositórios, a execução será abortada.

### Lidando com Versões Indisponíveis

**Versões Flexíveis (`=`):**
- Se a versão exata não estiver disponível, qualquer versão disponível será instalada
- Um aviso será emitido sobre a indisponibilidade da versão solicitada

**Versões Estritas (`==`):**
- Se a versão exata não estiver disponível, o pacote será ignorado
- Se o pacote for obrigatório (`!`), a execução será abortada

### Retenção de Versão (`apt-mark hold`)

O CondinAPT mantém automaticamente as versões dos pacotes nos seguintes casos:
- Quando a versão solicitada exatamente foi instalada
- Para pacotes com `==VERSÃO`, se a versão foi encontrada e instalada
- Para pacotes com `=VERSÃO`, se exatamente aquela versão foi encontrada e instalada

## Integração com Sistemas de Build

### Uso em Scripts de Automação

O CondinAPT se integra facilmente a sistemas de build e scripts de automação. Para mais detalhes sobre a sintaxe do arquivo de pacotes, consulte a seção [Sintaxe do Arquivo de Lista de Pacotes](#package-list-file-syntax).

### Exemplo Geral de Integração:

**Em um script de automação (`install.sh`):**
```bash
#!/bin/bash
set -e

# Define base paths
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Install packages via CondinAPT
./condinapt \
    -l "${SCRIPT_DIR}/packages.list" \
    -c "${CONFIG_DIR}/system.conf" \
    -m "${CONFIG_DIR}/filters.map"
```

### Exemplos de Configuração Universal

**Exemplo de arquivo de mapeamento de filtros (`filters.map`):**
```text
# Basic system parameters
d=DISTRIBUTION
arch=ARCHITECTURE
st=SYSTEM_TYPE
env=ENVIRONMENT

# Additional features
feat=FEATURES
locale=LOCALE
version=VERSION
```

**Exemplo de configuração (`system.conf`):**
```bash
# Basic parameters
DISTRIBUTION="bookworm"
ARCHITECTURE="amd64"
SYSTEM_TYPE="server"
ENVIRONMENT="production"

# System capabilities
FEATURES="web,database,monitoring"
LOCALE="en_US"
VERSION="1.0"
```

## Exemplos de Cenários Reais

### Exemplo 1: Servidor Multimídia

**`packages.list`:**
```text
# Basic multimedia codecs - always
gstreamer1.0-plugins-base
gstreamer1.0-plugins-good

# Additional codecs - not for minimal installation
gstreamer1.0-plugins-bad -st=minimal
gstreamer1.0-plugins-ugly -st=minimal
gstreamer1.0-libav -st=minimal

# Professional tools - only for full configuration
ffmpeg +st=media-server
vlc +st=media-server

---

# Distribution-specific packages from backports for older distributions
ffmpeg @bookworm-backports +d=bookworm
```

### Exemplo 2: Servidor Web com Várias Configurações

**`packages.list`:**
```text
# Basic web server components
nginx
openssl

# Database - only for full installations
mysql-server +st=full-server -{env=minimal}
postgresql +st=database-server

# PHP - for web servers
php-fpm +feat=php
php-mysql +{feat=php&st=full-server}

# Monitoring - not for development environment
prometheus-node-exporter -env=development
htop +env=production
```

### Exemplo 3: Plataforma de Containers

**`packages.list`:**
```text
# Basic containerization tools
docker.io
containerd

# Kubernetes - only for cluster installations
kubectl +st=k8s-node
kubelet +st=k8s-master
kubeadm +st=k8s-master

# Container monitoring
docker-compose +env=development
portainer +feat=gui

# Network tools - exclude for minimal installations
bridge-utils -st=minimal
iptables-persistent -st=minimal
```

### Exemplo 4: Uso Avançado de Filtros

**`packages.list`:**
```text
# Complex conditions for databases
postgresql +{st=database-server&env=production} +arch=amd64
mysql-server +{st=web-server|st=full-server} -env=minimal

# Monitoring with exclusions
prometheus +env=production -st=desktop
grafana +{env=production|env=staging} +feat=monitoring

# Alternatives with conditions
nginx +st=web-server || apache2 +st=legacy-server || lighttpd -st=full-server

# Localization for different environments
language-pack-en +locale=en_US +env=production
language-pack-ru +locale=ru_RU -{env=minimal&st=embedded}
fonts-dejavu +{locale=ru_RU|locale=de_DE} +feat=gui
```

## Dicas de Otimização

### Organização das Listas de Pacotes

1. **Agrupamento por funcionalidade:**
```text
#=== System ===
systemd
dbus

#=== Network ===
network-manager
wireless-tools

#=== Multimedia ===
pulseaudio
alsa-utils
```

2. **Uso de filas para dependências:**
```text
# Base system - first queue
build-essential
pkg-config
---
# Development libraries - second queue
libgtk-3-dev
libqt5-dev
---
# Applications - third queue
gedit
qtcreator
```

3. **Otimização de condições:**
```text
# Inefficient
package1 +st=server +env=production
package2 +st=server +env=production
package3 +st=server +env=production

# Better to group
package1 +{st=server&env=production}
package2 +{st=server&env=production}
package3 +{st=server&env=production}
```

### Desempenho

- Use filas de prioridade para pacotes críticos
- Minimize o número de filas
- Agrupe pacotes relacionados em uma única fila
- Utilize cache do APT para builds grandes

## Solução de Problemas

### Problemas Comuns

**Problema:** Pacote não instala mesmo com as condições corretas
**Solução:** Verifique com a flag `-vv` para informações detalhadas dos filtros

**Problema:** CondinAPT aborta em um pacote obrigatório
**Solução:** Verifique a disponibilidade do pacote nos repositórios ou utilize fallback. Veja a seção [Tratamento de Erros e Recuperação](#error-handling-and-recovery)

**Problema:** Comportamento inesperado com versões de pacotes
**Solução:** Utilize o [modo de simulação](#operating-modes-and-debugging) (`-s`) para verificação

### Depuração de Filtros

```bash
# Check a specific package
echo "package-name +condition" | ./condinapt -l /dev/stdin -c system.conf -s -vv

# Check the entire list in simulation mode
./condinapt -l packages.list -c system.conf -s -vv
```

### Verificando Disponibilidade de Pacotes

```bash
# Check without installation
./condinapt -l packages.list -c system.conf -C

# View package information
apt-cache policy package-name
apt-cache madison package-name
```
