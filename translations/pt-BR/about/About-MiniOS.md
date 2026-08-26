---
updated: 2026-08-26
---

# Sobre o MiniOS

O MiniOS é uma distribuição Linux baseada no Debian, projetada para rodar a partir de mídia removível ou disco local. Seu sistema somente leitura é montado a partir de módulos SquashFS, com sessões opcionais graváveis para arquivos, configurações e pacotes instalados. O MiniOS oferece suporte a sistemas x86 de 64 bits e pode inicializar via UEFI ou BIOS legado.

## Modelo de sistema

- O sistema base e os softwares opcionais são módulos separados. Os módulos podem ser
  selecionados na inicialização ou adicionados sem a necessidade de reconstruir todo o sistema.
- Uma sessão live nova mantém os módulos base inalterados.
- A persistência pode armazenar alterações em um diretório nativo, em um contêiner
  DynFileFS expansível, em uma imagem bruta de tamanho fixo ou em um contêiner LUKS criptografado,
  dependendo da instalação e do sistema de arquivos de destino.
- O Instalador do MiniOS pode realizar uma instalação live modular ou, quando a imagem
  oferece suporte, implantar uma instalação Linux nativa convencional.

Consulte [Modos de boot](/configuration/Boot-Modes.md) para o guia oficial sobre o comportamento do boot
live e [Arquitetura do sistema](/about/System-Architecture.md) para a estrutura de boot e módulos.
Os contratos detalhados do início do boot estão documentados em
[descoberta do sistema no initrd](/configuration/Initrd-System-Discovery.md),
[carregamento de módulos no initrd](/configuration/Initrd-Module-Loading.md) e
[persistência no initrd](/configuration/Initrd-Persistence.md).

## Edições

As edições disponíveis dependem da versão e da distribuição base:

- **Flux** utiliza o ambiente Flux e um conjunto reduzido de pacotes. É indicada
  para sistemas onde se prefere uma seleção menor de softwares.
- **Standard** é a edição de uso geral. As versões atuais do Debian e Ubuntu
  padrão utilizam o Xfce.
- **Toolbox** adiciona ferramentas de administração do sistema, armazenamento, diagnóstico e recuperação.
- **Ultra** inclui um conjunto mais amplo de aplicativos em relação às demais edições.

O Xfce é o desktop padrão nas imagens Standard, Toolbox e Ultra, mas não é o único ambiente do MiniOS. A edição Flux utiliza o Fluxbox, e configurações de build suportadas podem oferecer outros ambientes. Verifique a descrição da versão antes de baixar, caso o ambiente de desktop seja importante para você.

Para saber quais softwares estão incluídos em cada edição, consulte a
[lista de pacotes](/administration/Packages.md) e [aplicativos e ferramentas do MiniOS](/about/MiniOS-Applications.md).

## Instalação e persistência

Uma ISO pode ser gravada como imagem de boot, copiada para um dispositivo multiboot ou
instalada com o Instalador do MiniOS. Esses métodos não apresentam o mesmo comportamento de armazenamento.
Ferramentas de gravação de imagem como `dd` e Etcher reproduzem o layout da ISO;
Ventoy inicializa o arquivo ISO; o Instalador do MiniOS pode alocar e configurar o armazenamento
gravável da sessão. Não presuma que o método de gravação cria persistência.

Comece pelo [Guia rápido](/installation/Quick-Start.md) e utilize o guia correspondente ao método de instalação escolhido.
A persistência também pode ser selecionada a partir de um menu de boot apropriado ou configurada com os parâmetros de boot documentados quando houver armazenamento gravável disponível.
Consulte [Modos de boot](/configuration/Boot-Modes.md)
para o comportamento da sessão live resultante e
[Gerenciamento de sessão](/configuration/Session-Management.md) para opções de armazenamento.

## Recursos do projeto

- [Site do MiniOS](https://minios.dev)
- [Código-fonte](https://github.com/minios-linux/minios-live)
- [Rastreador de issues](https://github.com/minios-linux/minios-live/issues)
- [Perguntas frequentes](/about/FAQ.md)
