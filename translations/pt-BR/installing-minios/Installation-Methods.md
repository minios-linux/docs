---
updated: 2026-10-15
---

# Métodos de instalação

MiniOS é um sistema operacional live-first. Instalar o MiniOS normalmente significa colocar seu sistema live modular em uma mídia removível ou em outro disco. Assim, gravar ou copiar o MiniOS em um pendrive já é um método de instalação, e não apenas uma preparação para uma instalação posterior.

Há duas grandes categorias de instalação:

- **Instalação live** mantém a pilha de módulos do MiniOS, a configuração de inicialização, a persistência da sessão e os fluxos de gerenciamento do MiniOS. A gravação de imagem em modo bruto, a instalação baseada em arquivos, o Ventoy e o modo Live do Instalador do MiniOS oferecem maneiras de executar o sistema live do MiniOS.
- **Instalação nativa** é uma conversão opcional realizada por [Instalador do MiniOS](/installing-minios/MiniOS-Installer). Ela cria um desktop Debian convencional a partir da imagem MiniOS selecionada, mantendo o ambiente de desktop, a identidade visual e os aplicativos comuns, enquanto remove os softwares específicos do MiniOS que existem para a arquitetura live.

## Baixar e verificar a ISO

Baixe uma ISO do [site oficial](https://minios.dev), da página oficial de [lançamentos do GitHub](https://github.com/minios-linux/minios-live/releases) ou do [SourceForge](https://sourceforge.net/projects/minios-linux/). Verifique-a antes de gravá-la em um dispositivo; consulte [Verificar downloads](/installing-minios/Verifying-Downloads).

## Instalar MiniOS em uma mídia removível

Escolha o método de acordo com o layout desejado no dispositivo de destino:

| Resultado | Método | O que você obtém |
|---|---|---|
| Sistema de arquivos gravável normal que também inicializa o MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) em modo ISO ou [instalação manual baseada em arquivos](/installing-minios/Manual-File-Based-Installation) | Arquivos MiniOS e carregador de inicialização em um sistema de arquivos normal; o espaço restante continua disponível para arquivos comuns |
| Dispositivo multiboot com suporte à persistência do MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partição de dados Ventoy para arquivos ISO, além de suporte a sessões persistentes MiniOS |
| Instalação modular gerenciada do MiniOS | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) em modo **Live** mode | Layout de módulos do MiniOS com armazenamento persistente opcional configurado pelo instalador |
| Cópia exata, bloco a bloco, da ISO publicada | [Rufus](/installing-minios/installation-tools/Rufus) em modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility), ou [`dd`](/installing-minios/installation-tools/dd) | O layout de blocos da ISO permanece exatamente igual; é simples e previsível, mas o dispositivo de destino deixa de funcionar como um pendrive comum de uso geral |

::: danger A gravação de imagem em modo bruto substitui o layout do dispositivo de destino
O modo DD do Rufus, o Etcher, a gravação de imagem com o Utilitário de disco e `dd` substituem o layout de blocos existente no dispositivo. Confirme o modelo e a capacidade do dispositivo de destino e faça backup de tudo o que for importante antes de começar. Este aviso não se aplica ao modo ISO do Rufus, ao Ventoy nem à instalação baseada em arquivos.
:::

## Iniciar a sessão live

1. Reinicie o computador e abra o menu de inicialização do firmware.
2. Selecione o dispositivo USB ou outra mídia inicializável.
3. Inicie o MiniOS e verifique se o armazenamento, a rede e os dispositivos de entrada funcionam como esperado.

As configurações de firmware variam de um computador para outro. Uma imagem MiniOS pode inicializar via BIOS ou UEFI; a implantação posterior do Instalador do MiniOS não se limita ao MBR.

Use [Modos de inicialização](/using-minios/Boot-Modes) como guia de referência para o comportamento da inicialização live. Se a inicialização inicial não encontrar a imagem ou os módulos, consulte [Detecção de sistema pelo Initrd](/reference/boot-process/System-Discovery).

## Escolha um layout instalado

Na sessão live, inicie [Instalador do MiniOS](/installing-minios/MiniOS-Installer) quando quiser instalar o sistema em outra unidade USB, SSD ou disco rígido.

- **Modo live** mantém a pilha de módulos compactados, o layout de inicialização MiniOS, as ferramentas de gerenciamento MiniOS e a persistência opcional da sessão. Escolha esta opção se quiser instalar o próprio MiniOS no disco de destino.
- **Modo nativo**expande a imagem selecionada para criar um desktop Debian convencional e gravável. O sistema instalado mantém o ambiente de desktop, a identidade visual e os aplicativos comuns da edição selecionada, enquanto o runtime live MiniOS e o software de gerenciamento específico do modo live são removidos. O sistema instalado usa um initramfs, um carregador de inicialização, pacotes de kernel e um fluxo de gerenciamento de pacotes convencionais do Debian.

::: warning A instalação nativa usa um modelo de sistema diferente
A característica que define a arquitetura MiniOS é o sistema live modular descrito em [Sobre MiniOS](/getting-started/About-MiniOS). O modo nativo mantém a experiência familiar do desktop MiniOS, incluindo sua identidade visual, ambiente de desktop e aplicativos comuns, mas converte o sistema em uma instalação convencional do Debian. As ferramentas específicas de MiniOS para sessões, módulos, kernels modulares e outros fluxos de trabalho live são removidas, pois esses recursos deixam de se aplicar. Escolha uma instalação live se quiser o conjunto completo de recursos do MiniOS.
:::

A persistência live pode ser criada previamente no destino pelo Instalador do MiniOS ou preparada durante a inicialização. Os detalhes estão em [Persistência no Initrd](/reference/boot-process/Persistence-Internals). Ela não se aplica após a conversão para o modo nativo.

O instalador oferece suporte a layouts BIOS/MBR, UEFI/MBR e UEFI/GPT. A instalação live automática no disco inteiro usa MBR com suporte à inicialização por BIOS e UEFI; discos de 2 TiB ou mais exigem a seleção explícita de UEFI/GPT. BIOS em GPT não é compatível. Os fluxos de trabalho nativo e com tabela existente seguem políticas próprias. Consulte [Usando o Instalador do MiniOS](/installing-minios/MiniOS-Installer) para informações sobre limites de posicionamento, sistema de arquivos, persistência e particionamento.
