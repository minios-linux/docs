---
updated: 2026-08-26
---

# Instalando o MiniOS

Existem duas tarefas distintas que costumam ser chamadas de instalação:

- Gravar o ISO em uma mídia removível cria a mídia inicializável usada para iniciar uma sessão live do MiniOS. Ferramentas de gravação de imagem sobrescrevem o dispositivo selecionado com a estrutura do ISO.
- Executar o [MiniOS Installer](/installation/MiniOS-Installer.md) a partir de uma sessão live implanta o MiniOS em outro disco. Ele pode criar uma instalação live modular ou uma instalação Linux nativa convencional.

## Baixe e verifique o ISO

Baixe um ISO no [site oficial](https://minios.dev) ou na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases). Verifique o arquivo antes de gravá-lo em um dispositivo; veja [Verificando downloads](/installation/Verifying-Downloads.md).

## Gravar mídia inicializável

Escolha um método para o seu sistema operacional:

- [Rufus](/installation/tools/Rufus.md) no Windows
- [Ventoy](/installation/tools/Ventoy.md) no Windows ou Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) no Windows, Linux ou macOS
- [`dd`](/installation/tools/dd.md) no Linux ou macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) no Linux
- [UNetbootin](/installation/tools/UNetbootin.md) no Windows, Linux ou macOS
- [Instalação USB baseada em arquivos](/installation/tools/File-Based-USB-Installation.md) para um layout MiniOS preparado manualmente

Gravar uma imagem com Rufus, Etcher, `dd` ou Drive Utility é um processo destrutivo. Confirme o caminho, modelo e capacidade do dispositivo antes de começar. A gravação de imagem bruta reproduz o layout da imagem; ela não configura persistência nem realiza uma implantação live ou nativa com o Instalador do MiniOS.

Ventoy é diferente: instale o Ventoy no dispositivo e depois copie o ISO para a partição de dados. Isso mantém o layout multiboot do Ventoy.

## Inicializar a sessão live

1. Reinicie o computador e abra o menu de boot do firmware.
2. Selecione o dispositivo USB ou outra mídia inicializável.
3. Inicie o MiniOS e verifique se armazenamento, rede e dispositivos de entrada funcionam como esperado.

As configurações de firmware variam conforme o computador. Uma imagem MiniOS pode inicializar via BIOS ou UEFI; o destino de uma futura implantação pelo Instalador MiniOS não está restrito a MBR.

Use [Modos de boot](/configuration/Boot-Modes.md) como referência principal para o comportamento do boot live. Se o boot inicial não encontrar a imagem ou seus módulos, consulte [Descoberta do sistema Initrd](/configuration/Initrd-System-Discovery.md).

## Escolha um layout de instalação

A partir da sessão live, inicie o [Instalador MiniOS](/installation/MiniOS-Installer.md) quando quiser instalar o MiniOS em outro pendrive, SSD ou disco rígido.

- O modo live preserva a pilha de módulos compactados e o layout de boot live. Ele suporta persistência opcional de sessão e é indicado para instalações portáteis.
- O modo nativo expande os módulos selecionados em um sistema de arquivos raiz Linux convencional, gera o initramfs e instala um bootloader compatível. O modo nativo só está disponível quando a imagem inicializada fornece os metadados necessários do instalador.

A persistência live é preparada durante o boot inicial; o comportamento detalhado está em [Persistência Initrd](/configuration/Initrd-Persistence.md). Ela não se aplica ao sistema de arquivos raiz convencional usado pelo modo nativo.

O instalador oferece suporte automático para layouts BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS em GPT não é suportado pelo instalador atual. Veja [Usando o Instalador MiniOS](/installation/MiniOS-Installer.md) para informações sobre posicionamento, sistema de arquivos, persistência e limites de particionamento.
