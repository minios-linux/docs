---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gerenciando kernels

O Gerenciador de kernels MiniOS empacota, inspeciona, ativa e remove bundles de kernel para o sistema modular MiniOS live. Um kernel MiniOS é um conjunto coordenado: a imagem do kernel, seu initramfs e o`01-kernel-<version>.sb` módulo correspondente devem permanecer juntos.

Este fluxo de trabalho se aplica somente à arquitetura live. Uma instalação nativa usa pacotes de kernel comuns do Debian ou Ubuntu, as ferramentas padrão de initramfs e o bootloader instalado.

## O que o Kernel Manager faz

A interface gráfica **Gerenciador de kernels MiniOS** e a `minios-kernel` CLI usam o mesmo backend. Elas permitem:

- listar os kernels empacotados e diferenciar as versões em execução, ativas e inativas;
- empacotar um kernel de versão específica disponível nos repositórios APT configurados;
- empacotar um conjunto coerente de arquivos locais de kernel `.deb`;
- opcionalmente, adicionar drivers selecionados do catálogo DKMS MiniOS curado ao empacotar um kernel do repositório;
- criar o initramfs MiniOS e o módulo de kernel SquashFS correspondentes;
- preparar os bundles concluídos no repositório de kernel MiniOS;
- ativar um bundle completo para a próxima inicialização e atualizar a configuração do bootloader compatível;
- remover um kernel empacotado inativo.

O Kernel Manager não compila uma árvore de código-fonte de kernel arbitrária. Se precisar alterar os próprios parâmetros de compilação do kernel MiniOS, use o fluxo de compilação a partir do código-fonte MiniOS.

## Iniciar o gerenciador gráfico

Abra-o pelo menu de aplicativos MiniOS ou execute:

```bash
minios-kernel-manager
```

O aplicativo separa o gerenciamento dos kernels instalados do empacotamento. É possível pesquisar kernels dos repositórios pelo nome do pacote ou pela versão exibida do kernel. Os controles de pacote ficam indisponíveis quando a raiz MiniOS detectada não permite gravação.

As operações privilegiadas do backend usam PolicyKit. A `minios-kernel` CLI independente exige acesso root para todos os comandos, exceto help.

## Empacotar um kernel do repositório

Selecione **Repositório** na tela de empacotamento e escolha um pacote de kernel de versão específica, por exemplo:

```text
linux-image-6.12.107+deb13-amd64
```

Metapacotes de acompanhamento, como `linux-image-amd64`, não são aceitos como origem do pacote. O modo de repositório usa as fontes APT, a configuração de confiança e as listas de pacotes configuradas no sistema em execução. As dependências correspondentes de kernel dividido em pacotes com versões específicas são resolvidas automaticamente quando a distribuição as utiliza.

A interface gráfica não executa `apt update` apenas porque as listas de pacotes estão desatualizadas. Atualize-as explicitamente quando necessário ou use `--force-update` com a CLI.

### Adicionar drivers DKMS selecionados

O empacotamento do repositório pode adicionar drivers selecionados do MiniOS `01-kernel` catálogo DKMS. A interface gráfica mostra opções compatíveis com o kernel selecionado; a CLI aceita uma opção `--dkms-driver` repetível:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Os drivers selecionados são compilados em um overlay/chroot isolado, com os headers correspondentes. O backend verifica se os módulos produzidos correspondem ao kernel de destino antes de incluí-los e registra a proveniência dos drivers no bundle, em `/usr/share/minios/kernel-dkms/`.

Este é um recurso de compatibilidade com opções selecionadas, não uma interface genérica para DKMS. Pacotes de kernel locais instalados manualmente não oferecem seleção de drivers porque não é possível inferir com segurança quais headers do repositório correspondem a eles.

## Empacotar pacotes de kernel locais

Para um kernel local, forneça todos os arquivos `.deb` necessários da mesma compilação do kernel:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

No Debian e no Ubuntu, um kernel pode ser dividido em vários pacotes. O backend verifica se os pacotes de imagem, módulos, base e módulos extras opcionais fornecidos formam uma versão coerente, em vez de combinar silenciosamente revisões não relacionadas.

## Saída do empacotamento e compressão

O empacotamento gera a imagem do kernel, o initramfs e o módulo de kernel SquashFS. Os metadados dos pacotes selecionados são mantidos dentro do módulo, em `/usr/share/minios/kernel-dpkg/`.

A compressão SquashFS padrão é `zstd`. Outros métodos são oferecidos somente quando as ferramentas necessárias estão disponíveis; o suporte atual inclui `lz4`, `lzo`, `gzip`, `lzma`, `xz` e `bzip2`.

Quando uma raiz MiniOS gravável é detectada e o destino solicitado está em outro local, o bundle concluído é transferido atomicamente para:

```text
<MiniOS-root>/kernels/<version>/
```

Os downloads do repositório são entradas temporárias da compilação e são removidos após uma operação de empacotamento concluída ou com falha tratada. As entradas `.deb` locais permanecem sob responsabilidade de quem as forneceu.

## Compatibilidade com persistência criptografada

Se o initramfs MiniOS em execução anunciar suporte à persistência LUKS em camadas, o kernel substituto deverá preservar o caminho de inicialização dm-crypt. O initramfs gerado é verificado para confirmar o suporte necessário ao cryptsetup, o módulo dm-crypt e o marcador de capacidade criptográfica MiniOS.

O empacotamento falha em vez de gerar um bundle de kernel que impediria a inicialização de uma sessão com persistência criptografada.

## Ativar e remover kernels

A tela de gerenciamento diferencia:

- **EM EXECUÇÃO** — o kernel em execução na inicialização atual;
- **ATIVO** — o pacote completo selecionado para a próxima inicialização;
- **DISPONÍVEL** — outro pacote disponível no repositório MiniOS.

A ativação exige uma entrada completa no repositório. Ela prepara a imagem do kernel, o initramfs, o módulo SquashFS ativo, o marcador da versão ativa e as alterações no bootloader como uma única operação coordenada. A configuração do GRUB é obrigatória; a configuração nativa do SYSLINUX é atualizada quando presente. Se a ativação falhar, os arquivos de inicialização preparados serão revertidos.

A ativação altera apenas a próxima inicialização; ela não reinicia o sistema atual. Mantenha pelo menos um pacote completo que você saiba que funciona até que o substituto tenha iniciado com sucesso.

Exclua somente um kernel empacotado inativo de que você não precisa mais. Não misture manualmente uma imagem de kernel, um initramfs ou `01-kernel-*.sb` de pacotes diferentes.

<a id="command-line-reference"></a>

## Referência da linha de comando

Os comandos mais comuns são:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Pacote de um repositório ou de arquivos locais:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Adicione `--json` para obter uma saída estruturada. Consulte a ajuda e o manual instalados para ver as opções exatas disponíveis na versão em execução:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Organização do armazenamento

O Kernel Manager localiza a raiz de conteúdo MiniOS, sem presumir um nome específico de dispositivo de bloco. Os caminhos gerenciados são relativos a essa raiz:

```text
<MiniOS-root>/
├── 01-kernel-<version>.sb
├── boot/
│   ├── vmlinuz-<version>
│   ├── initrfs-<version>.img
│   └── active-kernel
└── kernels/
    └── <version>/
        ├── 01-kernel-<version>.sb
        ├── vmlinuz-<version>
        └── initrfs-<version>.img
```
O caminho canônico do módulo em tempo de execução é `/lib/modules/<version>`. Em sistemas com usrmerge, esse caminho aponta para `/usr/lib/modules/<version>`; em organizações mais antigas, ele pode estar armazenado fisicamente em `/lib`. O empacotamento não permite que uma árvore de módulos da mesma versão já existente seja combinada com uma revisão de pacote diferente.

## Recuperação após falha do kernel

Se um kernel recém-ativado falhar, inicialize com um conjunto completo e confiável do kernel MiniOS, caso ainda haja um disponível. Não tente reparar a instalação copiando arquivos individuais de kernel, initramfs ou SquashFS de outra imagem: esses arquivos formam um único pacote coordenado.

Se não houver mais nenhum pacote completo e confiável, inicialize por uma mídia de recuperação confiável, preserve os dados importantes e reinstale ou restaure a instalação MiniOS afetada. Consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting) e [Como fazer backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentação relacionada

- [Arquitetura do MiniOS](/reference/System-Architecture)
- [Carregamento de módulos initrd](/reference/boot-process/Module-Loading)
- [Como compilar MiniOS](/development/Building-MiniOS)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
