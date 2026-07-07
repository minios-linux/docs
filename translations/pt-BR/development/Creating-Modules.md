# Criando módulos

Os módulos no MiniOS são pacotes autônomos de arquivos e configurações que estendem a funcionalidade do sistema base. Eles são semelhantes aos pacotes em outras distribuições Linux, mas foram projetados para serem empilhados uns sobre os outros, permitindo um sistema flexível e personalizável. Essa abordagem em camadas possibilita fácil customização, reversão de alterações e compartilhamento de configurações.

Para o processo completo de build do MiniOS e contexto da arquitetura do sistema, consulte o [Guia de Construção do MiniOS](/development/Building-MiniOS.md). Para informações sobre o sistema de gerenciamento de pacotes CondinAPT utilizado nos módulos, veja a [Documentação do CondinAPT](/development/CondinAPT.md).

Existem diversas utilitários para criação de módulos no MiniOS. Todos são projetados para uso no terminal e exigem privilégios de root.

**Utilitários para Criação de Módulos:**

**apt2sb** – instala pacotes dos repositórios e empacota em um módulo.<br>
**script2sb** – executa as ações descritas em um script e empacota o resultado em um módulo.<br>
**chroot2sb** – abre um chroot, permitindo que você realize qualquer ação nele; ao sair, salva o resultado no módulo.<br>

**Utilitários Adicionais de Gerenciamento de Módulos:**

**dir2sb** – converte um diretório existente em um módulo compactado.<br>
**sb2dir** – converte um módulo compactado em um diretório para inspeção.<br>
**rmsbdir** – remove um diretório de módulo criado pelo sb2dir.<br>
**savechanges** – salva todos os arquivos alterados no sistema em um bundle de sistema de arquivos compactado.<br>
**sb2iso** – gera uma imagem ISO do MiniOS, podendo adicionar ou excluir módulos.<br>
**sb** – interface completa para gerenciar bundles do MiniOS (ativar, desativar, listar, converter).<br>

**Características comuns dos utilitários de criação de módulos:**
- Suporte a diferentes tipos de compressão: zstd (padrão), gzip, lzo, xz
- Extensão do arquivo do módulo personalizável (padrão: sb)
- Filtro por nível para controlar quais módulos existentes incluir como dependências
- Nome personalizado para os módulos de saída
- Todos os utilitários devem ser executados como root

## apt2sb

Para criar um módulo usando o apt2sb, basta listar os pacotes que deseja incluir no módulo, por exemplo: `apt2sb install chromium chromium-sandbox`. Executando esse comando na pasta onde ele foi chamado, será gerado um módulo chromium.sb que conterá o navegador Chromium. Esse módulo será construído levando em conta todos os módulos carregados no sistema, ou seja, ele irá depender deles para funcionar, já que as bibliotecas necessárias para o programa podem já estar instaladas no sistema e presentes nos módulos inferiores.

Usando a opção `-l`/`--level` podemos especificar sobre qual módulo superior queremos construir nosso módulo. Por exemplo, o comando `apt2sb install -l 4 chromium chromium-sandbox` irá filtrar todos os módulos numerados 04 e acima durante a construção, ou seja, o módulo será baseado nos módulos 00-03. Como resultado, teremos o módulo 04-chromium.sb na pasta onde o comando foi executado. Esse módulo terá um tamanho maior do que o do exemplo anterior, pois incluirá todas as bibliotecas necessárias para rodar o programa, que poderiam estar nos módulos 04 ou superiores, mas poderá funcionar tanto com os módulos 04-xx presentes quanto ausentes.

O nome do módulo é criado automaticamente, baseado no nome do primeiro pacote especificado (no caso, chromium) e, se a opção --level for usada, no número do nível. Caso queira definir o nome do módulo manualmente, utilize a opção `-n`/`--name`, por exemplo: `apt2sb install -l 4 chromium chromium-sandbox -n 10-browser.sb`.

**Opções adicionais disponíveis no apt2sb:**

- `-c`/`--comp` – Tipo de compressão (zstd, gzip, lzo, xz). Padrão: zstd
- `-b`/`--bext` – Extensão do bundle. Padrão: sb
- `-y`/`--yes` – Responde sim automaticamente às perguntas
- `--allow-downgrades` – Permite downgrade de pacotes
- `--install-recommends` – Considera pacotes recomendados como dependência para instalação
- `--install-suggests` – Considera pacotes sugeridos como dependência para instalação
- `--no-install-recommends` – Não considera pacotes recomendados como dependência
- `--no-install-suggests` – Não considera pacotes sugeridos como dependência
- `-t`/`--target-release` – Release padrão de onde instalar os pacotes

O apt2sb também possui o comando `upgrade`, que permite atualizar pacotes já instalados. O comando upgrade utiliza as mesmas opções do install.

## script2sb

Para criar um módulo usando o script2sb, você precisa escrever um script bash que descreva os passos necessários para construir seu módulo. Isso é útil caso precise executar ações no sistema de arquivos, importar chaves, adicionar um repositório, etc., antes ou depois da instalação. Veja um exemplo de script:
```bash
#!/bin/bash
# Install the keys to access the Debian repository and the apt add-on to access the repository via https
apt install -y debian-keyring debian-archive-keyring apt-transport-https
# Adding a GPG key for the Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Add the Caddy repository to the package source list
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
# Updating the list of packages
apt update
# Installing Caddy
apt install caddy
# Remove keys to access the Debian repository
apt remove -y debian-keyring debian-archive-keyring apt-transport-https
# Deleting the source list file and GPG key for the Caddy repository
rm /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```
Para executar a build desse script (vamos chamá-lo de caddy.sh), execute o comando `script2sb -s ./caddy.sh`.

**Opções disponíveis para script2sb:**

- `-s`/`--script` – Usa o ARQUIVO como script de instalação (obrigatório)
- `-l`/`--level` – Usa o NÍVEL como filtro de nível
- `-n`/`--name` – Usa NOME como nome do arquivo do módulo
- `-c`/`--comp` – Tipo de compressão (zstd, gzip, lzo, xz). Padrão: zstd
- `-b`/`--bext` – Extensão do bundle. Padrão: sb
- `-d`/`--directory` – Copia o conteúdo de DIR para a raiz do módulo

Se nenhum nome de módulo for especificado, o nome é criado baseado no número do nível, se informado, e no nome do script. Um exemplo de execução usando essas opções é: `script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb`.

Além dessas opções, você pode usar a opção `-d`/`--directory`. Se essa opção for especificada, o conteúdo da pasta indicada será copiado para a raiz do módulo antes da execução do script. Os arquivos nessa pasta devem estar organizados como se estivessem na raiz do sistema. Por exemplo, se você precisa adicionar um atalho de algum programa no menu, crie uma pasta mymodule e monte a estrutura nela em relação à raiz do sistema:
```
mkdir -p /home/user/mymodule/usr/share/applications
```
Na pasta mymodule/usr/share/applications você deve colocar o arquivo .desktop que será empacotado no módulo após a build e executar o comando de build:
```
script2sb -s ./caddy.sh -l 1 -n 01-caddy.sb -d /home/user/mymodule
```

## chroot2sb

O utilitário `chroot2sb` é usado para criar um ambiente chroot interativo. Isso permite que você realize *qualquer* ação necessária para construir seu módulo (instalar pacotes, editar arquivos, executar comandos, etc.). Quando você sair do ambiente chroot, as alterações feitas serão empacotadas em um módulo.

**Opções disponíveis para chroot2sb:**

- `-l`/`--level` – Usa NÍVEL como filtro de nível  
- `-n`/`--name` – Usa NOME como nome do arquivo do módulo
- `-c`/`--comp` – Tipo de compressão (zstd, gzip, lzo, xz). Padrão: zstd
- `-b`/`--bext` – Extensão do bundle. Padrão: sb
- `-d`/`--directory` – Copia o conteúdo de DIR para a raiz do módulo

Se nenhum nome de módulo for especificado, o nome é criado baseado no número do nível, se informado, e na data e hora atuais no formato YYYYMMDD-HHMM.

Você também pode usar a opção `-d`/`--directory`, assim como no `script2sb`. Se essa opção for especificada, o conteúdo da pasta indicada será copiado para a raiz do módulo *antes* de entrar no ambiente chroot. Isso fornece um ponto de partida para suas customizações.

**Exemplo de uso:**

- Chroot básico, nome automático do módulo: `chroot2sb`
- Especificar nível e compressão: `chroot2sb -l 3 -c gzip`
- Especificar nível, nome e compressão: `chroot2sb -l 3 -n 04-meu-modulo.sb -c xz`
- Copiar arquivos de um diretório antes de entrar no chroot: `chroot2sb -d /caminho/para/meus/arquivos`

Após executar o comando `chroot2sb`, você será colocado em um ambiente chroot. A partir daí, pode realizar todas as ações necessárias. Quando terminar, digite `exit` para sair do chroot. O `chroot2sb` irá então empacotar as alterações em um módulo. Os comandos executados no chroot *não* são salvos como parte do processo de instalação do módulo final. É um snapshot do estado final do sistema de arquivos. O histórico do bash é removido automaticamente do módulo.

## Utilitários Adicionais de Gerenciamento de Módulos

Além dos utilitários de criação de módulos, o MiniOS oferece diversas ferramentas para gerenciar e trabalhar com módulos existentes:

### dir2sb

O utilitário `dir2sb` é usado para converter um diretório existente em um módulo compactado. Isso é útil quando você já preparou uma estrutura de diretórios com todos os arquivos necessários e deseja empacotar em um módulo sem executar processos de instalação.

**Opções disponíveis para dir2sb:**

- `-c`/`--comp` – Tipo de compressão (zstd, gzip, lzo, xz). Padrão: zstd
- `-b`/`--bext` – Extensão do bundle. Padrão: sb

**Uso:**

`dir2sb [OPÇÕES] DIRETÓRIO_ORIGEM [ARQUIVO_DESTINO]`

**Comportamento:**

- Se o `DIRETÓRIO_ORIGEM` não tiver extensão .sb e não se chamar 'squashfs-root', o próprio diretório é incluído no módulo e o `ARQUIVO_DESTINO` é obrigatório.
- Se o `ARQUIVO_DESTINO` não for especificado, o `DIRETÓRIO_ORIGEM` é substituído pelo novo arquivo de módulo.

**Exemplos:**

- Converter um diretório preparado em módulo: `dir2sb /caminho/para/meus/arquivos/preparados meu-modulo.sb`
- Converter diretório squashfs-root (substitui o original): `dir2sb squashfs-root`
- Usar compressão diferente: `dir2sb -c xz /caminho/para/arquivos modulo-personalizado.sb`

Este utilitário é especialmente útil quando você deseja:
- Empacotar arquivos e diretórios pré-configurados
- Converter o conteúdo extraído de um módulo de volta para módulo
- Criar módulos a partir de estruturas de diretórios preparadas manualmente

### sb2dir

O utilitário `sb2dir` converte um módulo compactado (.sb) em um diretório com o mesmo nome. Isso é útil para extrair e examinar o conteúdo de um módulo.

**Uso:**

`sb2dir [arquivo_origem.sb] [diretório_destino_opcional]`

**Comportamento:**

- Se o diretório de destino for especificado, ele deve existir
- Se o diretório de destino não for especificado, o nome arquivo_origem.sb é usado e o diretório é montado sobre tmpfs

**Exemplos:**

- Extrair um módulo para examinar o conteúdo: `sb2dir meu-modulo.sb`
- Extrair para um diretório específico: `sb2dir meu-modulo.sb /tmp/extracao`

### rmsbdir

O utilitário `rmsbdir` remove um diretório de módulo que foi criado pelo `sb2dir`. Isso faz a limpeza correta do ponto de montagem tmpfs, se utilizado.

**Uso:**

`rmsbdir [diretorio_origem.sb]`

**Exemplo:**

- Remover diretório de módulo extraído: `rmsbdir meu-modulo.sb`

### savechanges

O utilitário `savechanges` salva todos os arquivos alterados no sistema em um bundle de sistema de arquivos compactado. Isso é útil para criar módulos a partir de alterações feitas em tempo de execução.

**Opções disponíveis:**

- `-c`/`--comp` – Tipo de compressão (zstd, gzip, lzo, xz). Padrão: zstd
- `-b`/`--bext` – Extensão do bundle. Padrão: sb

**Uso:**

`savechanges [OPÇÕES] arquivo_destino.sb [diretório_de_alterações]`

Se o diretório_de_alterações não for especificado, será usado `/run/initramfs/memory/changes`.

**Exemplos:**

- Salvar todas as alterações atuais: `savechanges minhas-alteracoes.sb`
- Salvar com compressão diferente: `savechanges -c xz minhas-alteracoes.sb`

### sb2iso

O utilitário `sb2iso` gera uma imagem ISO do MiniOS, podendo adicionar módulos especificados ou excluir existentes.

**Opções disponíveis:**

- `-e`/`--exclude` – Exclui qualquer caminho ou arquivo existente que corresponda ao REGEX
- `-n`/`--name` – Especifica o nome do arquivo ISO de saída (padrão: minios-YYYYMMDD_HHMM.iso)

**Uso:**

`sb2iso [OPÇÕES]... [MODULO.SB]...`

**Exemplos:**

- Criar ISO do MiniOS sem o módulo firefox.sb: `sb2iso -e 'firefox' -n minios_sem_firefox.iso`
- Criar apenas o core em modo texto do MiniOS: `sb2iso --exclude='firmware|xorg|desktop|apps|firefox' --name=minios_textmode.iso`

### sb

O utilitário `sb` oferece uma interface completa para gerenciar bundles do MiniOS, incluindo operações de ativação, desativação e conversão.

**Importante:** O utilitário `sb` requer suporte ao kernel AUFS (Advanced multi layered UniFication FileSystem) para a maioria das operações. Se o AUFS não estiver disponível no seu kernel, muitos comandos não funcionarão.

**Comandos disponíveis:**

- `activate BUNDLE` – Ativa um bundle do MiniOS
- `deactivate BUNDLE` – Desativa um bundle ativo do MiniOS  
- `list` – Lista os bundles ativos do MiniOS
- `savechanges` – Salva as alterações feitas em tempo de execução no bundle
- `rm DIR` / `rmdir DIR` – Remove um diretório de bundle descompactado
- `conv PATH` – Converte um bundle .sb para diretório ou vice-versa

**Exemplos:**

- Ativar um módulo: `sb activate meu-modulo.sb`
- Desativar um módulo: `sb deactivate meu-modulo.sb`
- Listar módulos ativos: `sb list`
- Converter módulo para diretório: `sb conv meu-modulo.sb`
- Converter diretório para módulo: `sb conv meu-modulo/`

**Nota:** Os comandos `activate`, `deactivate` e `list` exigem suporte ao kernel AUFS e privilégios de root. Os comandos `conv`, `rm` e `rmdir` funcionam sem AUFS, mas ainda exigem privilégios de root.

## Documentação Relacionada

- **[Reconstruindo ISO](/development/Rebuilding-ISO.md)** – Aprenda a empacotar seus módulos personalizados em imagens ISO bootáveis usando o `sb2iso`
- **[Construindo o MiniOS](/development/Building-MiniOS.md)** – Guia completo para construir o MiniOS a partir do código-fonte com configurações personalizadas
