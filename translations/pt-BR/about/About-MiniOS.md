# Sobre o MiniOS

O MiniOS é uma distribuição Linux baseada no Debian, projetada para rodar a partir de mídia removível ou disco local. Seu sistema somente leitura é montado a partir de módulos SquashFS, com sessões opcionais graváveis para arquivos, configurações e pacotes instalados. O MiniOS oferece suporte a sistemas x86 de 64 bits e pode inicializar via UEFI ou BIOS legado.

## Modelo de sistema

- O sistema base e os softwares opcionais são módulos separados. Os módulos podem ser selecionados na inicialização ou adicionados sem a necessidade de reconstruir todo o sistema.
- Uma sessão live nova mantém os módulos base inalterados.
- A persistência pode armazenar alterações em um diretório nativo, em um contêiner DynFileFS expansível, em uma imagem bruta de tamanho fixo ou em um contêiner LUKS criptografado, dependendo da instalação e do sistema de arquivos de destino.
- O Instalador do MiniOS pode fazer uma instalação live modular ou, quando a imagem oferece suporte, implantar uma instalação Linux nativa convencional.

Veja [Arquitetura do sistema](/about/System-Architecture.md) para o layout de inicialização e módulos, e [Gerenciamento de sessões](/configuration/Session-Management.md) para sessões persistentes.

## Edições

As edições disponíveis dependem do lançamento e da distribuição base:

- **Minimum** utiliza o ambiente Flux e um conjunto reduzido de pacotes. É indicada para sistemas onde se prefere uma seleção de software mais enxuta.
- **Standard** é a edição de uso geral. As versões atuais baseadas em Debian e Ubuntu utilizam o Xfce.
- **Toolbox** adiciona ferramentas de administração de sistema, armazenamento, diagnóstico e recuperação.
- **Ultra** inclui um conjunto mais amplo de aplicativos além das outras edições.

O Xfce é o desktop padrão nas imagens Standard, Toolbox e Ultra, mas não é o único ambiente do MiniOS. A edição Minimum utiliza o Flux, e configurações de build suportadas podem oferecer outros ambientes. Verifique a descrição do lançamento antes de baixar, caso o ambiente gráfico seja importante para você.

Para saber quais softwares estão incluídos em cada edição, consulte a [lista de pacotes](/administration/Packages.md).

## Instalação e persistência

Um ISO pode ser gravado como imagem inicializável, copiado para um dispositivo multiboot ou instalado com o Instalador do MiniOS. Esses métodos não apresentam o mesmo comportamento de armazenamento. Ferramentas de gravação de imagem como `dd` e Etcher reproduzem o layout do ISO; o Ventoy inicializa o arquivo ISO; o Instalador do MiniOS pode alocar e configurar o armazenamento de sessão gravável. Não presuma que um método de gravação cria persistência.

Comece pelo [Guia rápido](/installation/Quick-Start.md) e utilize o tutorial correspondente ao método de instalação escolhido. A persistência também pode ser selecionada em um menu de boot apropriado ou configurada com os parâmetros de inicialização documentados quando houver armazenamento gravável disponível.

## Recursos do projeto

- [Site do MiniOS](https://minios.dev)
- [Código-fonte](https://github.com/minios-linux/minios-live)
- [Rastreador de issues](https://github.com/minios-linux/minios-live/issues)
