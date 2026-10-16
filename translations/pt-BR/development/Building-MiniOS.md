---
updated: 2026-10-15
program_commits:
    minios-live: a70af61230d2891ed9ca2447019bd7210a670694
---

# Criando MiniOS

MiniOS é montada a partir de uma imagem SquashFS principal, módulos de extensão ordenados, arquivos do kernel e de inicialização e configurações geradas. Esta página descreve as interfaces de build da árvore de código-fonte atual e as dependências entre as saídas.

Execute `./minios-cmd --help`, `./minios-live --help` e confira o `build.conf` selecionado antes de iniciar o build. Esses arquivos são a fonte oficial para a versão em uso.

## Requisitos

Faça o build no Debian ou Ubuntu, com espaço livre suficiente abaixo de `BUILD_DIR` e `/tmp`.
Um sistema desktop típico precisa de pelo menos 20 GiB. As operações de build exigem root para usar o debootstrap, chroots, montagens, dispositivos de loop e criar imagens; a exibição da ajuda não exige.

A lista oficial de pacotes do host está em `linux-live/prerequisites.list`. No checkout atual, ela pode ser instalada com:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Em um checkout do código-fonte, `minios-live` verifica essa lista antes do build, a menos que `SKIP_SETUP_HOST=true`. Em um host comum, ele informa quais pacotes estão faltando e encerra; a instalação automática é usada somente no fluxo de build do contêiner.

A configuração padrão verifica a conectividade com a Internet. É possível desativar essa verificação com `CHECK_INTERNET_CONNECTION=false` e ela é ignorada quando há um repositório de cache do APT preparado. Ainda assim, todas as entradas necessárias de pacotes e arquivos de inicialização devem estar disponíveis nos repositórios ou caches configurados.

Se `USE_APT_CACHER=true`, um serviço apt-cacher-ng acessível já precisa estar configurado em `APT_CACHER_ADDRESS`; caso contrário, defina a opção como `false` antes de iniciar o build.

::: danger Confiança no bootstrap
O fluxo de bootstrap atual chama o debootstrap com `--no-check-gpg` e baixa a chave de arquivo MiniOS por HTTP sem autenticação. Não use a imagem resultante como artefato de lançamento confiável até que esses caminhos do código-fonte implementem a verificação autenticada da chave e do bootstrap.
:::

## Build rápido

Clone o repositório e execute o frontend a partir da raiz:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

As quatro opções de destino são obrigatórias quando nenhum arquivo de configuração é selecionado:

| Opção | Configuração |
| --- | --- |
| `-d`, `--distribution` | Suite da distribuição de destino |
| `-a`, `--architecture` | Arquitetura de destino |
| `-de`, `--desktop-environment` | Ambiente do módulo |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox`, ou `ultra` |

Os valores de distribuição, arquitetura, desktop, compactação e variante atualmente compatíveis estão listados em `linux-live/build.conf`. Não presuma compatibilidade com base em um exemplo de comando antigo.

## Interfaces de build

### `minios-cmd`

`minios-cmd` copia o modelo de configuração para o diretório de trabalho de destino, grava as configurações do frontend nessa cópia e inicia o pipeline completo`minios-live -` As opções comuns incluem:

| Opção | Efeito |
| --- | --- |
| `-b`, `--build-dir` | Seleciona a raiz de saída do build |
| `-c`, `--compression-type` | Seleciona a compactação SquashFS |
| `-kp`, `--kernel-provider` | Seleciona `distribution` ou `minios` |
| `-kf`, `--kernel-flavour` | Seleciona uma variante do kernel de distribuição |
| `-mk`, `--minios-kernel` | Seleciona o provedor de kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Seleciona `auto`, `6.1`, ou `6.12` e implica o provedor MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleciona `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Compila drivers opcionais para o kernel selecionado |
| `-l`, `--locale` | Define a localidade do sistema |
| `-ml`, `--multilingual` | Gera várias localidades |
| `-kl`, `--keep-locales` | Mantém as localidades disponíveis |
| `-tz`, `--timezone` | Define o fuso horário do sistema live |
| `-ib`, `--initramfs-builder` | Seleciona `livekit` ou `dracut` |
| `-mln`, `--menu-language` | Seleciona o idioma do menu de inicialização |

Por exemplo:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Gera uma configuração sem iniciar o build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sem outro destino, isso grava `build/build.conf`. Nesse modo, o frontend ainda exige root.

`--config-file FILE` seleciona uma configuração para copiar. A implementação atual então grava os valores analisados da linha de comando e os valores padrão não vazios do frontend na cópia de trabalho, apesar da descrição mais curta em `--help`. Para usar uma configuração exata, mantida manualmente, execute `minios-live` diretamente e verifique o arquivo ativo, em vez de confiar na mesclagem do frontend.

Não combine `--config-only` com `--config-file` apontando para uma configuração existente: o modo somente configuração copia o modelo padrão para esse caminho.
Use `-b DIR --config-only` para escolher um destino gerado separado.

### `minios-live`

`minios-live` é o backend preparado. Em um checkout do código-fonte, ele lê `linux-live/build.conf` por padrão; uma cópia instalada lê `/etc/minios-live/build.conf`. Selecione outro arquivo e outra raiz de saída usando variáveis de ambiente:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Use um caminho `BUILD_CONF` absoluto em `sudo`. Os arquivos de configuração são executados como Bash; use apenas arquivos confiáveis. O backend não tem flags para substituir variáveis de configuração individuais.

## Etapas do build

O pipeline é executado nesta ordem:

1. `build-bootstrap` cria a raiz mínima de destino com o debootstrap.
2. `build-chroot` instala e configura o sistema principal.
3. `build-live` cria o módulo `00-core` SquashFS.
4. `build-modules` compila os módulos ordenados do ambiente selecionado.
5. `build-boot` gera initramfs, kernel, EFI e arquivos do bootloader.
6. `build-config` gera MiniOS e a configuração de inicialização.
7. `build-iso` publica a ISO inicializável e o checksum.
8. `remove-sources` exclui o diretório de trabalho selecionado, se configurado.

Os nomes com hífen mostrados acima e as formas com sublinhado são aceitos.

```bash
# Complete pipeline
sudo ./minios-live -

# One stage only
sudo ./minios-live build-iso

# Inclusive range
sudo ./minios-live build-chroot - build-live

# First stage through build-live
sudo ./minios-live - build-live

# build-modules through remove-sources
sudo ./minios-live build-modules -
```

Um comando parcial não recria as entradas omitidas. `build-iso` apenas empacota a árvore de imagem preparada, e `build-modules` não consegue recriar `00-core`. Após alterar um estágio produtor anterior, refaça o build até o último estágio dependente.

Um pipeline completo começa com `build-bootstrap`, que remove os diretórios `core/` e `image/` existentes no destino selecionado. Preserve qualquer conteúdo que não possa ser regenerado antes de começar; árvores de destino geradas são saídas do build, não armazenamento permanente de código-fonte.

Se `REMOVE_SOURCES=true`, o estágio final `remove-sources` exclui e recria todo o diretório de trabalho `build/<distribution>-<variant>-<architecture>/`, não apenas os arquivos-fonte baixados. ISOs publicadas, caches compartilhados e logs fora desse diretório permanecem.

## Configuração

`linux-live/build.conf` controla a identidade do destino, o kernel, a localidade, o bootloader, o usuário live, os serviços, os caches, os snapshots, a limpeza e a publicação. Entre os grupos importantes estão:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT`, e `PACKAGE_VARIANT` selecionam o destino e a cadeia de módulos.
- `COMP_TYPE` controla a compactação SquashFS.
- `LIVE_MODULE_MODE` seleciona `merged` (o padrão atual para todas as variantes) ou `simple` a integração de live-config; agora ela não é mais inferida apenas com base no tamanho da edição.
- `KERNEL_*` e `MINIOS_KERNEL_SERIES` controlam a obtenção do kernel e o payload.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG`, e `SERIAL_CONSOLE` controlam os artefatos de inicialização.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO`, e `USE_APT_CACHER` controlam as entradas reutilizáveis.
- `VERBOSITY_LEVEL` aceita `0`, `1`, ou `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES`, e `BUILD_TEST_ISO` controlam a publicação e a limpeza.

Não edite um `build/<target>/build.conf` gerado como substituto da manutenção da configuração de origem selecionada.

### Seleção do kernel

O `distribution` provider resolve o kernel Debian ou Ubuntu selecionado e, quando o DKMS está habilitado, os headers correspondentes em um estado APT isolado e assinado.
`KERNEL_AUTO_SELECT=true` obtém a suite de origem e a arquitetura do destino do userspace. Defina como `false` para usar os campos manuais de distribuição, arquitetura, versão, snapshot e política de atualização em `build.conf`.

O `minios` provider instala `linux-image-SERIES-mos-ARCH`, verifica o suporte a AUFS e usa os headers MiniOS correspondentes para o DKMS. Ele requer `KERNEL_FLAVOUR=none` e arquiteturas correspondentes para os pacotes do userspace e do kernel.
No código atual, `MINIOS_KERNEL_SERIES=auto` resolve para `6.12`; use `6.1` explicitamente quando essa série for necessária.

`KERNEL_PAYLOAD_MODE=runtime` mantém a árvore de módulos do kernel, a configuração do kernel, `System.map`, os metadados de implantação e a integração em tempo de execução em `modprobe.d`, `modules-load.d` e `udev/rules.d`. Remove o estado de pacotes usado apenas na compilação, headers, fontes do DKMS, ferramentas de compilação e pacotes do initramfs. O firmware continua sob responsabilidade de `02-firmware`. `full` mantém um conjunto de diagnóstico mais abrangente.

## Sistema de módulos

As fontes dos módulos ficam em `linux-live/scripts/`. Um ambiente em `linux-live/environments/<desktop>/` contém links simbólicos ordenados para as fontes que utiliza. O nome local do ambiente controla a ordem de compilação e pode renumerar uma fonte compartilhada, por exemplo:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` é gerado por `build-live` e não é um link de ambiente comum.
Os módulos `01` e superiores são cumulativos: cada um é compilado sobre os módulos inferiores aplicáveis. `skip_conditions.conf` pode omitir entradas para um destino; portanto, inspecione o ambiente selecionado em vez de presumir que existe uma sequência universal.

Use `linux-live/scripts/10-example/` como modelo de criação atual. Um módulo pode conter:

```text
NN-module-name/
├── packages.list
├── install
├── build
├── postinstall
├── skip_conditions.conf
├── patches/
├── rootcopy-install/
└── rootcopy-postinstall/
```

São necessários apenas os arquivos usados pelo módulo. `build`, `postinstall`, condições de ignorar, patches e árvores rootcopy são opcionais. `build` e `patches/` não estão disponíveis para `00-core`.

A propriedade do host nas árvores rootcopy não é preservada; os arquivos copiados normalmente passam a pertencer a `root:root`. Um manifesto `.minios-ownership` dentro de uma árvore rootcopy usa:

```text
owner:group relative/path
```

Os caminhos devem permanecer dentro da árvore. O host aplica o manifesto imediatamente e resolve os nomes usando o banco de contas do host. Use valores numéricos de `UID:GID` para contas existentes apenas no destino ou defina a propriedade a partir de `install` ou `postinstall` dentro do chroot. Mover o manifesto para `rootcopy-postinstall/` não altera a resolução de nomes.

Como a verificação de contenção atual não canonicaliza o caminho de destino, nunca use componentes `..` nem componentes de links simbólicos nos caminhos do manifesto. Inspecione as árvores rootcopy antes de uma compilação com privilégios; um caminho malicioso pode fazer com que `chown` do lado do host escape da árvore copiada.

Para pacotes, os scripts comuns de instalação de módulos usam os arquivos copiados para o chroot por `build-modules`:

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

Consulte [CondinAPT](/development/CondinAPT) para ver a sintaxe da lista de pacotes e o mapa de filtros MiniOS atual.

### Adicionar um módulo

Copie o modelo e, em seguida, crie um link para ele em cada ambiente desejado, usando a posição local pretendida no ambiente:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adapte `packages.list`, os scripts, os metadados e o conteúdo rootcopy antes de compilar.
Valide cada desktop, variante, distribuição e arquitetura declarados.

## Reconstrução segura

Os artefatos de módulos existentes são ignorados. Quando um módulo cumulativo inferior muda, remova o artefato dele e todos os módulos posteriores antes de executar `build-modules`; manter os módulos posteriores preservaria conteúdo compilado com base na camada inferior antiga. Identifique os artefatos pela ordem do ambiente selecionado e pelo nome do módulo, pois as condições de ignorar podem criar lacunas na numeração.

A camada do kernel é um caso especial. Para reconstruir apenas `01-kernel`, remova o artefato correspondente ao destino selecionado e reconstrua desde os módulos até a publicação:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Confirme o caminho do destino antes de remover. Não aplique este atalho a `00-core` nem suponha que seja seguro para os módulos `02` e superiores.

Para um módulo comum, como `03-gui-base`, remova o artefato dele e todos os artefatos dos módulos aplicáveis posteriores e, em seguida, execute o mesmo intervalo de `build-modules -`. Para alterações apenas no initramfs, EFI ou boot, mantenha os módulos SquashFS no lugar e execute:

```bash
sudo ./minios-live build-boot -
```

Faça uma compilação completa após alterações em `00-core`, na configuração de bootstrap/chroot, na identidade do destino, na política do repositório ou em qualquer outra entrada que não possa ser isolada em uma etapa posterior.

## Saídas e logs

Com a configuração padrão, `BUILD_DIR`, os caminhos importantes são:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` e `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Os nomes ISO dependem das configurações de compilação, do modo de lançamento e dos timestamps. Use o caminho exibido pela compilação bem-sucedida em vez de tentar prever o nome completo do arquivo.

## Segredos e artefatos de depuração

Não inclua um token do Ubuntu Pro no controle de versão, na documentação, no histórico do shell ou em logs compartilhados. Prefira um arquivo de configuração privado fora do repositório:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Defina `USE_UBUNTU_PRO=true` e `UBUNTU_PRO_TOKEN=...` somente nesse arquivo. A compilação remove o estado do Pro da imagem, mas o arquivo no host ainda contém o segredo.

`DEBUG_SSH_KEYS=true` gera material de chave privada para depuração. Considere a imagem resultante descartável e nunca a publique sem verificar se a chave foi removida.

Alterar a opção de volta para `false` não remove as chaves já geradas em `build/<target>/image/minios/debug_ssh_key`, nos arquivos `authorized_keys.*` adjacentes ou em `build/<target>/debug_ssh_key`. Use um destino limpo ou remova esses arquivos explicitamente e, em seguida, inspecione a estrutura da ISO antes de publicar.

## Solução de problemas

- Falhas de bootstrap geralmente estão relacionadas à acessibilidade dos repositórios, ao suporte do debootstrap, à arquitetura, aos snapshots ou à ausência de pré-requisitos no host.
- Falhas no Core e nos módulos geralmente estão relacionadas à disponibilidade de pacotes, aos filtros CondinAPT, aos scripts do mantenedor, ao conteúdo do rootcopy ou a um módulo inferior desatualizado.
- Falhas de inicialização geralmente estão relacionadas ao kernel selecionado, ao criador do initramfs, à obtenção do EFI, à geração do GRUB/SYSLINUX ou à ausência de arquivos necessários para a inicialização.
- Falhas na ISO geralmente estão relacionadas à estrutura preparada da imagem, ao xorriso, ao espaço de saída ou às configurações de limpeza.

Após uma compilação privilegiada interrompida, inspecione as montagens abaixo do diretório de trabalho de destino antes de tentar novamente. Leia o `build/log/build-*.log` correspondente; não tente corrigir sobreposições geradas nem arquivos `.sb` no local.

## Documentação relacionada

- [Gerenciar módulos](/preparing-and-customizing/Managing-Modules)
- [Criar imagens personalizadas](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
