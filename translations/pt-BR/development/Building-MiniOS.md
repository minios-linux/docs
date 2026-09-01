---
updated: 2026-08-31
program_commits:
    minios-live: f59faa38c0667fbeefdc6dbe899a2db6e131e462
---

# Compilando MiniOS

MiniOS é montado a partir de uma imagem base SquashFS, módulos de extensão ordenados, arquivos de kernel e boot, e configuração gerada. Esta página descreve as interfaces de build do source tree atual e as dependências entre suas saídas.

Execute `./minios-cmd --help`, `./minios-live --help` e inspecione o `build.conf` selecionado antes de compilar. Esses arquivos são a referência para a versão em uso.

## Requisitos

Compile no Debian ou Ubuntu com espaço livre suficiente abaixo de `BUILD_DIR` e `/tmp`.
Um desktop típico precisa de pelo menos 20 GiB. As operações de build requerem root para debootstrap, chroots, montagens, dispositivos de loop e criação de imagens; exibir a ajuda não requer.

A lista oficial de pacotes do host está em `linux-live/prerequisites.list`. Para o checkout atual, ela pode ser instalada com:

```bash
sudo apt-get update
sudo apt-get install \
  sudo binutils debootstrap squashfs-tools xorriso mtools rsync \
  grub-common gpg curl openssl sbsigntool
```

Em um checkout do código-fonte, `minios-live` verifica essa lista antes de compilar, a menos que `SKIP_SETUP_HOST=true`. Em um host normal, ele relata pacotes ausentes e interrompe; a instalação automática é usada apenas no caminho de build por container.

A configuração padrão verifica a conectividade com a Internet. A verificação pode ser desativada com `CHECK_INTERNET_CONNECTION=false` e é ignorada para um repositório de cache APT preparado, mas todos os pacotes e arquivos de boot necessários ainda devem estar disponíveis nos repositórios ou caches configurados.

Se `USE_APT_CACHER=true`, um serviço apt-cacher-ng acessível já deve estar configurado em `APT_CACHER_ADDRESS`; caso contrário, defina a opção para `false` antes de compilar.

::: danger Bootstrap trust
O caminho de bootstrap atual chama o debootstrap com `--no-check-gpg` e busca a chave de arquivo MiniOS via HTTP não autenticado. Não utilize a imagem resultante como artefato confiável de release até que esses caminhos de origem exijam verificação autenticada de chave e bootstrap.
:::

## Compilação rápida

Clone o repositório e execute o frontend a partir da raiz:

```bash
git clone https://github.com/minios-linux/minios-live.git
cd minios-live
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

As quatro opções de destino são obrigatórias quando nenhum arquivo de configuração é selecionado:

| Opção | Configuração |
| --- | --- |
| `-d`, `--distribution` | Suite de distribuição alvo |
| `-a`, `--architecture` | Arquitetura alvo |
| `-de`, `--desktop-environment` | Ambiente do módulo |
| `-pv`, `--package-variant` | `minimum`, `standard`, `toolbox` ou `ultra` |

Os valores atualmente suportados de distribuição, arquitetura, desktop, compressão e variante estão listados em `linux-live/build.conf`. Não infira suporte a partir de exemplos antigos de comandos.

## Interfaces de build

### `minios-cmd`

`minios-cmd` copia o template de configuração para o diretório de trabalho de destino, grava as configurações do frontend nessa cópia e inicia o pipeline completo `minios-live -`. Opções comuns incluem:

| Opção | Efeito |
| --- | --- |
| `-b`, `--build-dir` | Seleciona o diretório raiz de saída do build |
| `-c`, `--compression-type` | Seleciona compressão SquashFS |
| `-kp`, `--kernel-provider` | Seleciona `distribution` ou `minios` |
| `-kf`, `--kernel-flavour` | Seleciona um flavor de kernel da distribuição |
| `-mk`, `--minios-kernel` | Seleciona o provedor de kernel MiniOS |
| `-mks`, `--minios-kernel-series` | Seleciona `auto`, `6.1` ou `6.12` e implica o provedor MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleciona `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Compila drivers opcionais para o kernel selecionado |
| `-l`, `--locale` | Define o locale do sistema |
| `-ml`, `--multilingual` | Gera múltiplos locales |
| `-kl`, `--keep-locales` | Mantém os locales disponíveis |
| `-tz`, `--timezone` | Define o fuso horário do sistema live |
| `-ib`, `--initramfs-builder` | Seleciona `livekit` ou `dracut` |
| `-mln`, `--menu-language` | Seleciona o idioma do menu de boot |

Por exemplo:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv toolbox \
  -c zstd -mks 6.1 -kpm runtime -dkms
```

Gere uma configuração sem iniciar o build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sem outro destino, isso grava `build/build.conf`. O frontend ainda requer root neste modo.

`--config-file FILE` seleciona uma configuração para copiar. A implementação atual então grava valores analisados da linha de comando e padrões não vazios do frontend na cópia de trabalho, apesar da redação resumida em `--help`. Para uma configuração exata e mantida manualmente, invoque `minios-live` diretamente e inspecione o arquivo ativo em vez de confiar na mesclagem do frontend.

Não combine `--config-only` com `--config-file` apontando para uma configuração existente: o modo apenas-configuração copia o template padrão sobre esse caminho.
Use `-b DIR --config-only` para escolher um destino gerado separado.

### `minios-live`

`minios-live` é o backend em estágio. Em um checkout do código-fonte, ele lê `linux-live/build.conf` por padrão; uma cópia instalada lê `/etc/minios-live/build.conf`. Selecione um arquivo diferente e o diretório de saída via variáveis de ambiente:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Use um caminho absoluto `BUILD_CONF` entre `sudo`. Arquivos de configuração são interpretados como Bash, então utilize apenas arquivos confiáveis. O backend não possui flags para sobrescrever variáveis individuais de configuração.

## Estágios do build

O pipeline executa nesta ordem:

1. `build-bootstrap` cria o root mínimo de destino com debootstrap.
2. `build-chroot` instala e configura o sistema principal.
3. `build-live` cria o módulo `00-core` SquashFS.
4. `build-modules` compila os módulos ordenados do ambiente selecionado.
5. `build-boot` gera initramfs, kernel, EFI e arquivos de bootloader.
6. `build-config` gera MiniOS e configuração de boot.
7. `build-iso` publica o ISO bootável e o checksum.
8. `remove-sources` apaga o diretório de trabalho selecionado quando configurado.

Nomes com hífen mostrados acima e formas com underline são aceitos.

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

Um comando parcial não recria entradas omitidas. `build-iso` apenas empacota a árvore de imagem preparada, e `build-modules` não pode recriar `00-core`. Recompile até o último estágio dependente após alterar um produtor anterior.

Um pipeline completo começa com `build-bootstrap`, que remove os diretórios `core/` e `image/` existentes do destino selecionado. Preserve qualquer conteúdo não regenerável antes de iniciar; árvores de destino geradas são saídas do build, não armazenamento fonte durável.

Se `REMOVE_SOURCES=true`, o estágio final `remove-sources` apaga e recria todo o diretório de trabalho `build/<distribution>-<variant>-<architecture>/`, não apenas os arquivos fonte baixados. ISOs publicados, caches compartilhados e logs fora desse diretório permanecem.

## Configuração

`linux-live/build.conf` controla a identidade do destino, kernel, locale, bootloader, usuário live, serviços, caches, snapshots, limpeza e publicação. Grupos importantes incluem:

- `DISTRIBUTION`, `DISTRIBUTION_ARCH`, `DESKTOP_ENVIRONMENT` e `PACKAGE_VARIANT` selecionam o destino e a cadeia de módulos.
- `COMP_TYPE` controla a compressão SquashFS.
- `KERNEL_*` e `MINIOS_KERNEL_SERIES` controlam aquisição e payload do kernel.
- `INITRAMFS_BUILDER`, `INITRAMFS_CRYPT`, `BOOTLOADER`, `MENU_LANG` e `SERIAL_CONSOLE` controlam artefatos de boot.
- `USE_ROOTFS`, `USE_APT_CACHE`, `USE_SHARED_APT_CACHE`, `USE_APT_CACHE_REPO` e `USE_APT_CACHER` controlam entradas reutilizáveis.
- `VERBOSITY_LEVEL` aceita `0`, `1` ou `2`.
- `REMOVE_OLD_ISO`, `REMOVE_SOURCES` e `BUILD_TEST_ISO` controlam publicação e limpeza.

Não edite um `build/<target>/build.conf` gerado como substituto para manter a configuração fonte selecionada.

### Seleção de kernel

O provedor `distribution` resolve o kernel Debian ou Ubuntu selecionado e, quando DKMS está ativado, os headers correspondentes em um estado APT assinado e isolado.
`KERNEL_AUTO_SELECT=true` deriva sua suite e arquitetura de origem do destino do userspace. Defina como `false` para usar os campos manuais de distribuição, arquitetura, versão, snapshot e política de atualização em `build.conf`.

O provedor `minios` instala `linux-image-SERIES-mos-ARCH`, verifica suporte a AUFS e usa os headers MiniOS correspondentes para DKMS. Requer `KERNEL_FLAVOUR=none` e arquiteturas de pacote de userspace e kernel compatíveis.
No código atual, `MINIOS_KERNEL_SERIES=auto` resolve para `6.12`; use `6.1` explicitamente quando essa série for necessária.

`KERNEL_PAYLOAD_MODE=runtime` mantém a árvore de módulos do kernel, configuração do kernel, `System.map`, metadados de implantação e integração em tempo de execução em `modprobe.d`, `modules-load.d` e `udev/rules.d`. Remove estado de pacote apenas de build, headers, fontes DKMS, ferramentas de compilação e pacotes initramfs. Firmware permanece sob propriedade de `02-firmware`. `full` mantém um payload de diagnóstico mais amplo.

## Sistema de módulos

Os fontes dos módulos ficam em `linux-live/scripts/`. Um ambiente em `linux-live/environments/<desktop>/` contém links simbólicos ordenados para os fontes que utiliza. O nome local do ambiente controla a ordem de build e pode renumerar um fonte compartilhado, por exemplo:

```text
linux-live/environments/xfce/06-firefox -> ../../scripts/10-firefox
```

`00-core` é produzido por `build-live` e não é um link de ambiente comum.
Módulos `01` e acima são cumulativos: cada um é construído sobre os módulos inferiores aplicáveis. `skip_conditions.conf` pode omitir entradas para um alvo, então inspecione o ambiente selecionado em vez de assumir uma cadeia universal.

Use `linux-live/scripts/10-example/` como template de autoria atual. Um módulo pode conter:

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

Somente os arquivos necessários para o módulo são obrigatórios. `build`, `postinstall`, condições de skip, patches e árvores rootcopy são opcionais. `build` e `patches/` não estão disponíveis para `00-core`.

A propriedade do host em árvores rootcopy não é preservada; arquivos copiados normalmente se tornam `root:root`. Um manifesto `.minios-ownership` dentro de uma árvore rootcopy usa:

```text
owner:group relative/path
```

Os caminhos devem permanecer dentro da árvore. O host aplica o manifesto imediatamente e resolve nomes usando o banco de dados de contas do host. Use valores numéricos `UID:GID` para contas apenas do destino, ou defina a propriedade a partir de `install` ou `postinstall` dentro do chroot. Mover o manifesto para `rootcopy-postinstall/` não altera a resolução de nomes.

Como a verificação de contenção atual não canonicaliza o caminho de destino, nunca use componentes `..` ou componentes de symlink em caminhos de manifesto. Inspecione árvores rootcopy antes de um build privilegiado; um caminho manipulado pode fazer o `chown` do host escapar da árvore copiada.

Para pacotes, scripts de instalação comuns do módulo usam os arquivos copiados para o chroot por `build-modules`:

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

Veja [CondinAPT](/development/CondinAPT) para sintaxe de lista de pacotes e o mapa de filtros MiniOS atual.

### Adicionando um módulo

Copie o template e então faça o link em cada ambiente desejado na posição local do ambiente:

```bash
cp -a linux-live/scripts/10-example linux-live/scripts/10-my-module
ln -s ../../scripts/10-my-module \
  linux-live/environments/xfce/07-my-module
```

Adapte `packages.list`, scripts, metadados e conteúdo rootcopy antes de compilar.
Valide cada desktop, variante, distribuição e arquitetura declarados.

## Reconstruindo com segurança

Artefatos de módulos já existentes são ignorados. Quando um módulo cumulativo inferior é alterado, remova seu artefato e toda a cadeia superior de módulos antes de executar `build-modules`; manter módulos superiores preservaria conteúdo compilado sobre a camada antiga. Identifique artefatos pela ordem do ambiente selecionado e nome do módulo, pois condições de skip podem criar lacunas na numeração.

A camada do kernel é um caso especial. Para reconstruir apenas `01-kernel`, remova seu artefato para o destino selecionado e reconstrua dos módulos até a publicação:

```bash
rm build/trixie-standard-amd64/image/minios/01-kernel-*.sb
sudo ./minios-live build-modules -
```

Confirme o caminho de destino antes de remover. Não aplique este atalho para `00-core` nem assuma que é seguro para módulos `02` e superiores.

Para um módulo comum como `03-gui-base`, remova seu artefato e todos os artefatos de módulos aplicáveis posteriores, depois execute o mesmo intervalo `build-modules -`. Para alterações apenas em initramfs, EFI ou boot, mantenha os módulos SquashFS e execute:

```bash
sudo ./minios-live build-boot -
```

Use um build completo após alterações em `00-core`, configuração de bootstrap/chroot, identidade do destino, política de repositório ou outra entrada que não possa ser isolada para um estágio posterior.

## Saídas e logs

Com o padrão `BUILD_DIR`, os caminhos importantes são:

- `build/rootfs/<distribution>-<architecture>-rootfs.tar.gz`
- `build/aptcache/<distribution>/`
- `build/<distribution>-<variant>-<architecture>/core/`
- `build/<distribution>-<variant>-<architecture>/image/`
- `build/<distribution>-<variant>-<architecture>/image/minios/`
- `build/<distribution>-<variant>-<architecture>/overlays/`
- `build/cache/kernel/`
- `build/iso/*.iso` e `build/iso/*.iso.sha256`
- `build/log/build-*.log`

Os nomes dos ISOs dependem das configurações de build, modo de release e timestamps. Use o caminho impresso pelo build bem-sucedido em vez de prever o nome base completo.

## Segredos e artefatos de debug

Não coloque um token do Ubuntu Pro em controle de versão, documentação, histórico do shell ou logs compartilhados. Prefira uma configuração privada fora do repositório:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Defina `USE_UBUNTU_PRO=true` e `UBUNTU_PRO_TOKEN=...` apenas nesse arquivo. O build remove o estado Pro da imagem, mas o arquivo do host ainda contém o segredo.

`DEBUG_SSH_KEYS=true` gera material de chave privada para debug. Trate a imagem resultante como descartável e nunca publique sem verificar se a chave está ausente.

Alterar a opção de volta para `false` não remove chaves já geradas em `build/<target>/image/minios/debug_ssh_key`, arquivos `authorized_keys.*` adjacentes ou `build/<target>/debug_ssh_key`. Use um destino limpo ou remova esses arquivos explicitamente, depois inspecione a árvore ISO antes de publicar.

## Solução de problemas

- Falhas no bootstrap geralmente envolvem acessibilidade do repositório, suporte do debootstrap, arquitetura, snapshots ou pré-requisitos ausentes no host.
- Falhas no core e nos módulos geralmente envolvem disponibilidade de pacotes, filtros CondinAPT, scripts de mantenedor, conteúdo rootcopy ou um módulo inferior desatualizado.
- Falhas no boot geralmente envolvem o kernel selecionado, builder do initramfs, aquisição de EFI, geração do GRUB/SYSLINUX ou entradas de boot ausentes.
- Falhas no ISO geralmente envolvem a árvore de imagem preparada, xorriso, espaço de saída ou configurações de limpeza.

Após uma build privilegiada interrompida, inspecione os pontos de montagem abaixo do diretório de trabalho de destino antes de tentar novamente. Leia o respectivo `build/log/build-*.log`; não repare overlays gerados ou arquivos `.sb` no local.

## Documentação relacionada

- [Gerenciando módulos](/preparing-and-customizing/Managing-Modules)
- [Compondo imagens personalizadas](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
- [CondinAPT](/development/CondinAPT)
