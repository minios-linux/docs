---
updated: 2026-10-06
program_commits:
    minios-kernel-manager: 77ec4226a5abf53fe85e34d6dcf3e09af76f0dad
---

# Gerenciamento de kernels

O Gerenciador de kernels MiniOS empacota, inspeciona, ativa e remove conjuntos de kernels para o sistema live modular MiniOS. Um kernel MiniOS é um conjunto coordenado: a imagem do kernel, seu initramfs e o módulo correspondente`01-kernel-<version>.sb` devem permanecer juntos.

Este fluxo de trabalho se aplica apenas à arquitetura live. Uma instalação nativa utiliza os pacotes de kernel padrão do Debian ou Ubuntu, as ferramentas normais de initramfs e o bootloader instalado.

## O que o Gerenciador de kernels faz

A interface gráfica**Gerenciador de kernels MiniOS** e a`minios-kernel` CLI utilizam o mesmo backend. Elas podem:

- listar os kernels empacotados e identificar as versões em execução, ativas e inativas;
- empacotar um kernel versionado real a partir dos repositórios APT configurados;
- empacotar um conjunto coerente de arquivos locais de kernel`.deb`;
- adicionar opcionalmente drivers selecionados do catálogo MiniOS DKMS ao empacotar um kernel de repositório;
- gerar o initramfs correspondente MiniOS e o módulo de kernel SquashFS;
- preparar bundles concluídos no repositório de kernels MiniOS;
- ativar um bundle completo para o próximo boot e atualizar a configuração do bootloader suportado;
- remover um kernel empacotado inativo.

O Gerenciador de kernels não compila qualquer árvore de código-fonte de kernel. Se você precisar alterar os próprios insumos de build do kernel MiniOS, utilize o fluxo de trabalho de build a partir do código-fonte MiniOS.

## Iniciar o gerenciador gráfico

Abra pelo menu de aplicativos MiniOS ou execute:

```bash
minios-kernel-manager
```

O aplicativo separa o gerenciamento de kernels instalados do empacotamento. É possível buscar kernels de repositório pelo nome do pacote ou pela versão exibida do kernel. Os controles de pacote ficam indisponíveis quando a raiz MiniOS detectada não é gravável.

Operações privilegiadas de backend utilizam o PolicyKit. O`minios-kernel` CLI independente requer root para todos os comandos, exceto ajuda.

## Empacotar um kernel de repositório

Escolha**Repositório** na visualização de empacotamento e selecione um pacote de kernel versionado real, por exemplo:

```text
linux-image-6.12.107+deb13-amd64
```

Metapacotes de rastreamento como`linux-image-amd64` não são aceitos como fonte do pacote. O modo repositório utiliza as fontes APT configuradas do sistema em execução, configuração de confiança e listas de pacotes. Dependências divididas de kernel versionado são resolvidas automaticamente quando a distribuição as utiliza.

A interface gráfica não executa`apt update` apenas porque as listas de pacotes estão desatualizadas. Atualize-as manualmente quando necessário ou use`--force-update` com a CLI.

### Adicionar drivers DKMS selecionados

O empacotamento de repositório pode adicionar drivers selecionados do catálogo MiniOS`01-kernel` DKMS. A interface gráfica mostra as opções compatíveis para o kernel selecionado; a CLI aceita a opção`--dkms-driver` repetidamente:

```bash
sudo minios-kernel package \
  --repo linux-image-6.12.107+deb13-amd64 \
  --dkms-driver rtl8821au \
  -o /tmp/kernel-output
```

Os drivers selecionados são compilados em um overlay/chroot isolado com headers correspondentes. O backend verifica se os módulos gerados correspondem ao kernel de destino antes de incluí-los e registra a procedência do driver dentro do bundle em`/usr/share/minios/kernel-dkms/`.

Este é um recurso de compatibilidade selecionada, não uma interface genérica para DKMS. Pacotes de kernel locais criados manualmente não permitem seleção de drivers porque não é possível inferir headers de repositório compatíveis de forma confiável.

## Empacotar kernels locais

Para um kernel local, forneça todos os arquivos necessários de`.deb` do mesmo build de kernel:

```bash
sudo minios-kernel package \
  --deb linux-image.deb linux-modules.deb \
  -o /tmp/kernel-output
```

Debian e Ubuntu podem dividir um kernel em vários pacotes. O backend verifica se a imagem, módulos, base e pacotes opcionais modules-extra fornecidos formam uma versão coerente, em vez de combinar revisões não relacionadas.

## Saída e compressão do empacotamento

O empacotamento gera a imagem do kernel, o initramfs e o módulo de kernel SquashFS. Alguns metadados do pacote selecionado são mantidos dentro do módulo em`/usr/share/minios/kernel-dpkg/`.

A compressão padrão SquashFS é`zstd`. Outros métodos são oferecidos apenas quando as ferramentas necessárias estão disponíveis; atualmente há suporte para`lz4`,`lzo`,`gzip`,`lzma`,`xz`, e`bzip2`.

Quando uma raiz MiniOS gravável é detectada e a saída solicitada está em outro local, o bundle concluído é movido de forma atômica para:

```text
<MiniOS-root>/kernels/<version>/
```

Downloads de repositório são insumos temporários de build e são removidos após uma operação de empacotamento concluída ou falha tratada. Entradas locais de`.deb` permanecem sob responsabilidade do usuário.

## Compatibilidade com persistência criptografada

Se o initramfs MiniOS em execução anunciar persistência LUKS em camadas, um kernel de substituição deve preservar o caminho de boot dm-crypt. O initramfs gerado é verificado quanto ao suporte necessário ao cryptsetup, módulo dm-crypt e marcador de capacidade cripto MiniOS.

O empacotamento falha em vez de gerar um bundle de kernel que tornaria a sessão de persistência criptografada ininicializável.

## Ativar e remover kernels

A visualização de gerenciamento diferencia:

- **EM EXECUÇÃO** — o kernel em execução no boot atual;
- **ATIVO** — o bundle completo selecionado para o próximo boot;
- **DISPONÍVEL** — outro bundle empacotado no repositório MiniOS.

A ativação requer uma entrada completa no repositório. Ela prepara a imagem do kernel, o initramfs, o módulo ativo SquashFS, o marcador de versão ativa e as alterações no bootloader como uma única operação coordenada. A configuração do GRUB é obrigatória; a configuração nativa do SYSLINUX é atualizada quando presente. Se a ativação falhar, os arquivos de boot preparados são revertidos.

A ativação altera apenas o próximo boot; não reinicia o sistema atual. Mantenha pelo menos um bundle completo conhecido e funcional até que o novo tenha inicializado com sucesso.

Exclua apenas um kernel empacotado inativo que não seja mais necessário. Não misture manualmente imagem de kernel, initramfs ou`01-kernel-*.sb` de bundles diferentes.

## Referência de linha de comando

Comandos típicos incluem:

```bash
sudo minios-kernel list
sudo minios-kernel info
sudo minios-kernel info <version>
sudo minios-kernel status
sudo minios-kernel activate <version>
sudo minios-kernel delete <version>
```
Empacotar a partir de um repositório ou arquivos locais:

```bash
sudo minios-kernel package --repo <versioned-package> -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --force-update -o /tmp/kernel-output
sudo minios-kernel package --deb /path/to/kernel-image.deb /path/to/kernel-modules.deb -o /tmp/kernel-output
sudo minios-kernel package --repo <versioned-package> --sqfs-comp lz4 -o /tmp/kernel-output
```

Adicione`--json` para saída estruturada. Utilize a ajuda e o manual instalados para ver as opções exatas fornecidas pela versão em execução:

```bash
minios-kernel --help
sudo minios-kernel package --help
man minios-kernel
```

## Layout de armazenamento

O Gerenciador de kernels descobre a raiz de conteúdo MiniOS em vez de assumir um nome específico de dispositivo de bloco. Os caminhos gerenciados são relativos a essa raiz:

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
O caminho canônico do módulo em tempo de execução é`/lib/modules/<version>`. Em sistemas usrmerged, isso resolve para`/usr/lib/modules/<version>`; layouts antigos podem armazená-lo fisicamente em`/lib`. O empacotamento recusa uma árvore de módulos da mesma versão já existente em vez de misturá-la com uma revisão diferente do pacote.

## Recuperação após kernel com falha

Se um kernel recém-ativado falhar, inicialize um conjunto de kernel completo e conhecido MiniOS se ainda estiver disponível. Não tente reparar a instalação copiando arquivos individuais de kernel, initramfs ou SquashFS de outra imagem: esses arquivos formam um bundle coordenado.

Se não restar nenhum bundle completo conhecido, inicialize uma mídia de resgate confiável, salve os dados importantes e reinstale ou restaure a instalação MiniOS afetada. Veja[Solução de problemas](/maintenance-and-recovery/Troubleshooting) e[Backup do MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

## Documentação relacionada

- [Arquitetura do sistema MiniOS](/reference/System-Architecture)
- [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading)
- [Compilando MiniOS](/development/Building-MiniOS)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
