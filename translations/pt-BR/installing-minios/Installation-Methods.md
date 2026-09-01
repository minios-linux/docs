---
updated: 2026-08-31
---

# Métodos de instalação

MiniOS é um sistema operacional live-first. Instalar o MiniOS normalmente significa colocar seu sistema modular live em uma mídia removível ou outro disco, então gravar ou copiar o MiniOS em um pendrive USB já é um método de instalação, e não apenas uma preparação para uma instalação posterior.

Existem duas grandes famílias de instalação:

- **Instalação Live** mantém a pilha de módulos MiniOS, a configuração de boot, a persistência de sessão e os fluxos de trabalho de gerenciamento MiniOS. Escrita de imagem bruta, instalação baseada em arquivos, Ventoy e o modo Live do Instalador MiniOS produzem formas de executar o sistema live MiniOS.
- **Instalação Nativa** é uma conversão opcional realizada pelo [Instalador do MiniOS](/installing-minios/MiniOS-Installer). Ela cria um desktop Debian convencional a partir da imagem MiniOS selecionada, mantendo o ambiente de desktop, identidade visual e aplicativos comuns, enquanto remove o software específico do MiniOS que existe para a arquitetura live.

## Baixe e verifique o ISO

Baixe um ISO no [site oficial](https://minios.dev), na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases) ou no [SourceForge](https://sourceforge.net/projects/minios-linux/). Verifique o arquivo antes de gravá-lo em um dispositivo; veja [Verificando downloads](/installing-minios/Verifying-Downloads).

## Instalar MiniOS em mídia removível

Escolha o método de acordo com o layout desejado no dispositivo de destino:

| Resultado | Método | O que você obtém |
|---|---|---|
| Sistema de arquivos gravável normal que também inicializa o MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) no modo ISO ou [instalação manual baseada em arquivos](/installing-minios/Manual-File-Based-Installation) | Arquivos MiniOS e bootloader em um sistema de arquivos normal; o espaço restante permanece utilizável para arquivos comuns |
| Dispositivo multiboot com suporte à persistência MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partição de dados Ventoy para arquivos ISO mais suporte à sessão persistente MiniOS |
| Instalação modular MiniOS gerenciada | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) no modo **Live** | Layout de módulos MiniOS com armazenamento persistente opcional configurado pelo instalador |
| Cópia exata, bloco a bloco, do ISO publicado | [Rufus](/installing-minios/installation-tools/Rufus) no modo DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) ou [`dd`](/installing-minios/installation-tools/dd) | Layout de blocos ISO exatamente igual; simples e previsível, mas o dispositivo de destino deixa de funcionar como um pendrive comum de uso geral |

::: danger A gravação de imagem bruta sobrescreve o layout do destino
O modo DD Rufus, Etcher, gravação de imagem pelo Utilitário de disco e `dd` substituem o layout de blocos existente do dispositivo. Confirme o modelo e a capacidade do destino e faça backup de tudo que for importante antes de começar. Este aviso não se aplica ao modo ISO Rufus, Ventoy ou a uma instalação baseada em arquivos.
:::

## Inicializar a sessão live

1. Reinicie o computador e abra o menu de boot do firmware.
2. Selecione o dispositivo USB ou outra mídia inicializável.
3. Inicie o MiniOS e verifique se armazenamento, rede e dispositivos de entrada funcionam como esperado.

As configurações de firmware variam conforme o computador. Uma imagem MiniOS pode inicializar via BIOS ou UEFI; o destino de uma implantação posterior pelo Instalador do MiniOS não está restrito ao MBR.

Use [Modos de boot](/using-minios/Boot-Modes) como guia oficial para o comportamento do boot live. Se o boot inicial não localizar a imagem ou seus módulos, consulte [Descoberta do sistema Initrd](/reference/boot-process/System-Discovery).

## Escolha um layout de instalação

A partir da sessão live, inicie o [Instalador do MiniOS](/installing-minios/MiniOS-Installer) quando quiser instalar o sistema em outro pendrive USB, SSD ou disco rígido.

- **Modo Live** preserva a pilha de módulos comprimidos, o layout de boot MiniOS, as ferramentas de gerenciamento MiniOS e a persistência de sessão opcional. Escolha esta opção se quiser o próprio MiniOS no disco de destino.
- **Modo Nativo** expande a imagem selecionada em um desktop Debian gravável convencional. O destino mantém o ambiente de desktop, identidade visual e aplicativos comuns da edição selecionada, enquanto o runtime live MiniOS e o software de gerenciamento específico do live são removidos. O sistema instalado utiliza um initramfs Debian convencional, bootloader, pacotes de kernel e fluxo de trabalho de gerenciamento de pacotes.

::: warning A instalação nativa utiliza um modelo de sistema diferente
A arquitetura definidora MiniOS é o sistema modular live descrito em [Sobre o MiniOS](/getting-started/About-MiniOS). O modo nativo mantém a experiência de desktop familiar do MiniOS, incluindo identidade visual, ambiente de desktop e aplicativos comuns, mas converte o sistema para uma instalação Debian convencional. As ferramentas específicas do MiniOS para sessões, módulos, kernels modulares e outros fluxos de trabalho live são removidas, pois esses recursos não se aplicam mais. Escolha a instalação live se quiser o conjunto completo de recursos do MiniOS.
:::

A persistência live é preparada durante o boot inicial; o comportamento detalhado está em [Persistência no Initrd](/reference/boot-process/Persistence-Internals). Não se aplica após a conversão nativa.

O instalador oferece suporte automático para layouts BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS em GPT não é suportado pelo instalador atual. Veja [Usando o Instalador do MiniOS](/installing-minios/MiniOS-Installer) para informações sobre posicionamento, sistema de arquivos, persistência e limites de particionamento.
