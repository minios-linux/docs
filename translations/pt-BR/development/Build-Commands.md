---
updated: 2026-08-28
program_commits:
    minios-live: 039ddd0f3e82651069756370e5f3addebce43984
---

# Comandos de build

O MiniOS possui duas interfaces de linha de comando para build. Execute os comandos a partir do diretório-fonte `minios-live`, a menos que esteja usando uma cópia instalada.

- `minios-cmd` é o frontend. Ele aceita opções comuns de destino, gera uma configuração funcional e inicia um build completo.
- `minios-live` é o backend em etapas. Ele lê uma configuração de build e executa uma etapa, um intervalo de etapas ou todo o pipeline.

Use `./minios-cmd --help`, `./minios-live --help` e o `build.conf` ativo para a versão instalada. Eles são a referência quando exemplos ou documentações antigas divergem. Os valores de destino suportados podem mudar, então esta página não define uma matriz de suporte.

## Requisitos de root

Exibir a ajuda não exige permissões de root:

```bash
./minios-cmd --help
./minios-live --help
```

As operações de build exigem root porque utilizam debootstrap, chroots, montagens e ferramentas de criação de imagens. O frontend atual também verifica se há permissões de root antes de gravar uma configuração com `--config-only`.

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

O backend verifica e instala os pré-requisitos do host listados em `linux-live/prerequisites.list`, a menos que `SKIP_SETUP_HOST=true` esteja definido na configuração.

## Builds do frontend

Uma chamada normal de `minios-cmd` exige todas as quatro opções de seleção de destino:

- `-d`, `--distribution`
- `-a`, `--architecture`
- `-de`, `--desktop-environment`
- `-pv`, `--package-variant`

Por exemplo:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

Configurações opcionais comuns incluem compressão, comportamento do kernel, localidade, fuso horário, construtor do initramfs, idioma do menu de boot e diretório de build. Verifique `./minios-cmd --help` em vez de assumir que uma opção existe.

### Seleção do kernel

O frontend expõe diretamente as configurações atuais do kernel:

| Opção | Efeito |
| --- | --- |
| `-kp`, `--kernel-provider` | Seleciona `distribution` ou `minios` |
| `-mk`, `--minios-kernel` | Seleciona o kernel do MiniOS com AUFS ativado e seleção automática da série |
| `-mks`, `--minios-kernel-series` | Seleciona `auto`, `6.1` ou `6.12` e implica o provedor MiniOS |
| `-kpm`, `--kernel-payload-mode` | Seleciona o payload do módulo de kernel `runtime` ou `full` |
| `-dkms`, `--kernel-build-dkms` | Compila os drivers DKMS opcionais selecionados para o kernel real |

Por exemplo:

```bash
sudo ./minios-cmd -d bookworm -a amd64 -de xfce -pv standard \
  -mks 6.1 -kpm runtime -dkms
```

O provedor `distribution` resolve um pacote de kernel assinado em um ambiente APT isolado. Quando o DKMS está ativado, esse pacote também fornece headers compatíveis com o kernel selecionado; a etapa posterior do DKMS não os substitui pelo metapacote genérico de headers da distribuição do userspace. Os endpoints normais de arquivos do kernel usam HTTP para que o apt-cacher-ng possa armazenar o conteúdo dos pacotes em cache. O APT ainda valida os metadados assinados `InRelease` e os hashes dos pacotes.

O provedor `minios` instala `linux-image-SERIES-mos-ARCH`, verifica se o kernel tem suporte a AUFS e usa `linux-headers-SERIES-mos-ARCH` para DKMS.
`KERNEL_FLAVOUR` deve ser `none`, as arquiteturas do pacote de userspace e do kernel devem coincidir, e a política de atualização é congelada. A seleção automática da série usa 6.1 para i386, Buster, Bullseye, Bookworm e Jammy; outros destinos suportados usam 6.12. Kernels MiniOS i386 suportam apenas a série 6.1.

`KERNEL_PAYLOAD_MODE=runtime` publica a árvore de módulos do kernel, configuração do kernel, System.map, metadados de implantação e arquivos de integração de runtime em `modprobe.d`, `modules-load.d` e `udev/rules.d`. São excluídos o banco de dados dpkg em uso, headers, links de build, fontes do DKMS, toolchain do compilador, pacotes initramfs e firmware. O firmware pertence a `02-firmware`. O modo `full` mantém um payload de diagnóstico mais amplo.

O frontend copia o template de configuração, grava os valores fornecidos do frontend na cópia e executa `minios-live -`. Por padrão, a cópia de trabalho para este exemplo é:

```text
build/trixie-standard-amd64/build.conf
```

Gere uma configuração sem iniciar o build:

```bash
sudo ./minios-cmd --config-only \
  -d trixie -a amd64 -de xfce -pv standard
```

Sem outro destino, isso grava em `build/build.conf`.

`--config-file FILE` seleciona um arquivo de configuração. A ajuda do comando atual informa que todas as outras opções são ignoradas neste modo, então não combine com opções de destino ou ajuste:

```bash
sudo ./minios-cmd --config-file /absolute/path/build-trixie.conf
```

No modo de opções do frontend, valores explícitos de linha de comando sobrescrevem os valores correspondentes do template. No modo de arquivo de configuração, trate o arquivo selecionado como entrada da configuração em vez de tentar sobrescrevê-lo com outras flags do frontend.

## Configuração do backend

Em um checkout do código-fonte, `minios-live` lê `linux-live/build.conf` por padrão. Uma cópia instalada usa `/etc/minios-live/build.conf`. O backend carrega o arquivo selecionado antes de calcular os caminhos de destino e não possui flags de linha de comando para sobrescrever configurações individuais.

Selecione um arquivo diferente usando `BUILD_CONF`. Use um caminho absoluto ao cruzar o limite de `sudo`:

```bash
sudo env BUILD_CONF=/absolute/path/build-trixie.conf ./minios-live -
```

`BUILD_DIR` seleciona outra raiz de saída do build:

```bash
sudo env \
  BUILD_CONF=/absolute/path/build-trixie.conf \
  BUILD_DIR=/absolute/path/minios-build \
  ./minios-live -
```

Não edite arquivos gerados em um diretório de trabalho de destino como substituto para manter a configuração selecionada. Veja `linux-live/build.conf` para opções avançadas de kernel, bootloader, localidade, cache, snapshot, módulos, limpeza e publicação.

## Estágios do backend

Os estágios são executados nesta ordem:

1. `build-bootstrap`
2. `build-chroot`
3. `build-live`
4. `build-modules`
5. `build-boot`
6. `build-config`
7. `build-iso`
8. `remove-sources`

Nomes de estágios com hífen mostrados pela ajuda são aceitos pelo script.

Execute o pipeline completo:

```bash
sudo ./minios-live -
```

Execute apenas um estágio:

```bash
sudo ./minios-live build-iso
```

Execute um intervalo inclusivo:

```bash
sudo ./minios-live build-chroot - build-live
```

Execute do primeiro estágio até um estágio selecionado:

```bash
sudo ./minios-live - build-live
```

Execute de um estágio selecionado até o estágio final:

```bash
sudo ./minios-live build-modules -
```

Esses exemplos de backend usam o destino selecionado na configuração ativa. Para os exemplos desta página, defina `DISTRIBUTION="trixie"`, `DISTRIBUTION_ARCH="amd64"`, `DESKTOP_ENVIRONMENT="xfce"` e `PACKAGE_VARIANT="standard"` primeiro.

## Dependências entre estágios

Um comando parcial não recria saídas de estágios anteriores omitidos. Estágios posteriores consomem o sistema de arquivos raiz, módulos SquashFS, arquivos de boot e configurações produzidas pelos estágios anteriores.

Reconstruir um estágio anterior pode, portanto, tornar obsoleta toda saída dependente posterior. Reconstrua até o último estágio afetado e não mantenha módulos de número superior após alterar um módulo inferior sobre o qual foram construídos. Em especial, `build-iso` empacota dados de imagem previamente preparados; ele não reconstrói esses dados.

Use um build completo para um novo destino ou quando as saídas anteriores necessárias não existirem:

```bash
sudo ./minios-cmd -d trixie -a amd64 -de xfce -pv standard
```

## Saídas e logs

Com a configuração padrão do checkout e raiz de build, o exemplo trixie utiliza estes locais verificados:

- `build/trixie-standard-amd64/core/` para o sistema de arquivos principal mutável
- `build/trixie-standard-amd64/image/` para a árvore ISO preparada
- `build/trixie-standard-amd64/image/minios/` para módulos e payload gerados do MiniOS
- `build/iso/` para arquivos ISO e seus sidecars `.iso.sha256`
- `build/log/build-YYYYMMDD-HHMMSS.log` para o log de build capturado

Todos os caminhos são relativos a `BUILD_DIR`. Os nomes base dos ISOs incluem configurações de build e, para builds que não são de release, um timestamp; use o caminho impresso pelo build bem-sucedido em vez de tentar prever o nome completo do arquivo.

## Tokens do Ubuntu Pro

`--ubuntu-pro-token` ativa o uso do Ubuntu Pro durante um build do frontend. O código de build anexa dentro do chroot, depois remove e limpa o estado Pro, autenticação de repositório, preferências e rastros do keyring antes de criar a imagem. Essa limpeza não torna o token seguro para exposição no host.

Não coloque um token real em documentação, controle de versão, histórico do shell, saída de CI ou linha de comando compartilhada. Prefira um arquivo de configuração privado fora do repositório, restrinja-o ao proprietário e passe apenas o caminho dele:

```bash
install -m 600 linux-live/build.conf /private/path/build-trixie.conf
sudo env BUILD_CONF=/private/path/build-trixie.conf ./minios-live -
```

Defina `USE_UBUNTU_PRO="true"` e `UBUNTU_PRO_TOKEN="..."` nesse arquivo privado. Proteja e remova qualquer configuração de trabalho no host que contenha o token quando não for mais necessária e verifique se nenhum token ou dado de autenticação Pro está presente em artefatos publicados.
