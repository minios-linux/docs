# Instalando o MiniOS

Existem duas tarefas distintas que costumam ser chamadas de instalação:

- Gravar o ISO em uma mídia removível cria a mídia inicializável usada para iniciar uma sessão live do MiniOS. Ferramentas de gravação de imagem sobrescrevem o dispositivo selecionado com a estrutura do ISO.
- Executar o [MiniOS Installer](/installation/MiniOS-Installer.md) a partir de uma sessão live implanta o MiniOS em outro disco. Ele pode criar uma instalação live modular ou uma instalação Linux nativa convencional.

## Baixe e verifique o ISO

Baixe um ISO no [site oficial](https://minios.dev) ou na página oficial de [Releases do GitHub](https://github.com/minios-linux/minios-live/releases). Verifique o arquivo antes de gravá-lo em um dispositivo; veja [Verificando downloads](/installation/Verifying-Downloads.md).

## Grave a mídia inicializável

Escolha um método para o seu sistema operacional:

- [Rufus](/installation/tools/Rufus.md) no Windows
- [Ventoy](/installation/tools/Ventoy.md) no Windows ou Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) no Windows, Linux ou macOS
- [`dd`](/installation/tools/dd.md) no Linux ou macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) no Linux
- [UNetbootin](/installation/tools/UNetbootin.md) no Windows, Linux ou macOS
- [Método original](/installation/tools/Original-Method.md) para uma estrutura MiniOS baseada em arquivos

A gravação de uma imagem com Rufus, Etcher, `dd` ou Drive Utility é destrutiva. Confirme o caminho do dispositivo, modelo e capacidade antes de começar. Essas ferramentas criam a mídia inicializável; elas não realizam uma implantação live ou nativa com o MiniOS Installer.

O Ventoy é diferente: instale o Ventoy no dispositivo e depois copie o ISO para a partição de dados dele. Isso mantém a estrutura multiboot do Ventoy.

## Inicialize a sessão live

1. Reinicie o computador e abra o menu de boot do firmware.
2. Selecione o dispositivo USB ou outra mídia inicializável.
3. Inicie o MiniOS e verifique se o armazenamento, rede e dispositivos de entrada funcionam como esperado.

As configurações de firmware variam conforme o computador. Uma imagem do MiniOS pode inicializar via BIOS ou UEFI; o destino de uma futura implantação pelo MiniOS Installer não está restrito ao MBR.

## Escolha um layout de instalação

A partir da sessão live, inicie o [MiniOS Installer](/installation/MiniOS-Installer.md) quando quiser instalar o MiniOS em outro pendrive, SSD ou HD.

- O modo live preserva a pilha de módulos compactados e o layout de boot live. Ele suporta persistência opcional da sessão e é indicado para instalações portáteis.
- O modo nativo expande os módulos selecionados em um sistema de arquivos raiz Linux convencional, gera o initramfs e instala um bootloader compatível. O modo nativo só está disponível quando a imagem inicializada fornece os metadados necessários do instalador.

O instalador suporta layouts automáticos BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS em GPT não é suportado pelo instalador atual. Veja [Usando o MiniOS Installer](/installation/MiniOS-Installer.md) para informações sobre posicionamento, sistema de arquivos, persistência e limites de particionamento.
