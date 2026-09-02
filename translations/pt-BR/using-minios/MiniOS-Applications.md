---
updated: 2026-08-31
---

# Aplicativos MiniOS

MiniOS oferece ferramentas gráficas e de linha de comando para configuração, instalação, sessões, módulos, kernels, softwares e remasterização de imagens. Essas ferramentas são desenvolvidas com base na arquitetura modular live descrita em [Sobre MiniOS](/getting-started/About-MiniOS).

## Disponibilidade

As ferramentas disponíveis dependem dos pacotes incluídos na imagem MiniOS. Verifique um sistema live em execução com `dpkg-query` ou inspecione os módulos da imagem e os [manifests de pacotes](/reference/Package-and-Edition-Contents).

Uma instalação nativa mantém a experiência de desktop familiar do MiniOS — sua identidade visual, ambiente de desktop selecionado e aplicativos usuais — mas não mantém o software de gerenciamento específico do MiniOS projetado para a arquitetura live. Sessões, módulos `.sb`, gerenciamento modular de kernel e fluxos de trabalho semelhantes deixam de se aplicar, então o sistema instalado utiliza as ferramentas padrão do Debian para pacotes, kernel, configuração e bootloader.

## Ferramentas gráficas

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Editar configurações de inicialização e de novas sessões do MiniOS | **Configurador do MiniOS** | Para o modelo de configuração live do MiniOS. Ele grava configurações para um próximo boot live e não reconfigura o sistema em execução imediatamente. | [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Implantar MiniOS em outro disco | **Instalador do MiniOS** | Executa a partir de uma sessão live MiniOS. O modo live mantém o ambiente live completo do MiniOS; o modo nativo cria um desktop Debian convencional e remove o software específico do MiniOS destinado à operação live. | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) |
| Criar, selecionar, redimensionar, salvar ou remover sessões persistentes | **Gerenciador de sessões MiniOS** | Apenas para sistemas live MiniOS. | [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) |
| Empacotar, ativar, inspecionar ou remover kernels MiniOS | **Gerenciador de kernels MiniOS** | Apenas para sistemas live modulares MiniOS. | [Gerenciamento de kernels](/preparing-and-customizing/Managing-Kernels) |
| Instalar aplicativos ou criar módulos de aplicativos a partir de receitas do catálogo | **Loja de aplicativos MiniOS** | Sistemas live MiniOS. Escolha entre instalação via módulo ou direta no sistema; a persistência determina se as alterações diretas permanecem após reiniciar. | [Loja de aplicativos MiniOS](/using-minios/Installing-Software) |
| Remasterizar uma imagem MiniOS existente por meio de um projeto guiado | **Construtor de imagens MiniOS** | Funciona com o conteúdo da imagem live MiniOS da sessão live em execução, de um ISO ou de mídia óptica. Cria outro ISO live. | [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspecionar, criar, ativar e selecionar módulos `.sb` | **Gerenciador de módulos MiniOS** | Apenas para sistemas live MiniOS; a composição e ativação de módulos em tempo de execução dependem do modelo de root em camadas `.sb`. | [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules) |
| Gravar um ISO MiniOS em um pendrive USB | **Utilitário de disco** | Ferramenta genérica de manipulação de imagens de disco inclusa no MiniOS. Cria mídias inicializáveis; não realiza implantação gerenciada como o Instalador do MiniOS. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) |
| Navegar pela documentação instalada offline | **Ajuda MiniOS** | Lê a documentação empacotada sem necessidade de conexão com a rede. | [Documentação do MiniOS](/) |

## Ferramentas de linha de comando

A maioria das ferramentas gráficas possui uma contraparte pública de linha de comando ou backend. Esses comandos são fornecidos no mesmo pacote da aplicação gráfica ou em um pacote complementar obrigatório. O manifesto central compartilhado inclui `minios-tools` e `minios-image-compose`. Os demais comandos seguem a disponibilidade de seus respectivos pacotes gráficos. A presença deles em qualquer sistema instalado ou imagem específica ainda deve ser verificada diretamente.

### Implantação e sessões

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Liste discos de destino, visualize um plano de implantação ou instale MiniOS de forma não interativa | **`minios-deploy`** | Executa a partir de uma sessão ao vivo MiniOS. A instalação exige root e confirmação explícita; o modo nativo, quando disponível, cria um desktop Debian convencional a partir da imagem selecionada. | [Implantação via linha de comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Crie, ative, salve, redimensione, exporte, importe ou remova sessões persistentes | **`minios-session`** | Requer root e um sistema ao vivo MiniOS com um armazenamento de persistência compatível. | [Referência de comandos de sessão](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels e imagens

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Liste, empacote, ative, inspecione ou remova kernels | **`minios-kernel`** | Requer root e uma instalação ao vivo modular MiniOS com root MiniOS gravável. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#method-2-using-minios-kernel-cli); `man minios-kernel` |
| Remasterize uma árvore de conteúdo MiniOS existente a partir de scripts ou automação | **`minios-image-compose`** | Opera sobre o conteúdo da imagem ao vivo MiniOS e publica um ISO inicializável. | [Compor imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Fluxos de trabalho de módulos

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Inspecione módulos e gerencie os conjuntos de módulos em execução ou para o próximo boot | **`sb`** | A inspeção de módulos também funciona fora de uma sessão MiniOS em execução. As operações de execução e próximo boot exigem um layout de módulos ao vivo MiniOS; alterações exigem root. | [Inspecionar e extrair módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gerenciar módulos em execução e no próximo boot](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Construa um módulo a partir de pacotes do repositório ou arquivos locais`.deb` arquivos | **`apt2sb`** | Requer root e uma sessão ao vivo MiniOS compatível. Os pacotes são instalados em um ambiente de build isolado, não no root em execução. | [Criar módulo a partir de pacotes](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Construa um módulo executando um script de instalação | **`script2sb`** | Requer root e uma sessão ao vivo MiniOS compatível. O script é executado de forma não interativa em um ambiente de build isolado. | [Criar módulo a partir de script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Construa um módulo interativamente em um ambiente preparado | **`chroot2sb`** | Requer root e uma sessão ao vivo MiniOS compatível. Use quando a instalação exigir prompts ou alterações manuais. | [Criar módulo de forma interativa](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Converta entre uma árvore de diretórios e um`.sb` módulo | **`dir2sb`**, **`sb2dir`** | A conversão comum não exige root e pode ser feita fora de uma sessão ao vivo em execução, desde que as ferramentas e arquivos de entrada necessários estejam disponíveis. | [Criar](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extrair](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) um módulo; `man dir2sb`, `man sb2dir` |
| Capture as alterações elegíveis da camada de sessão gravável em um módulo | **`savechanges`** | Requer root e uma sessão ao vivo MiniOS em execução com um backend de camada gravável compatível. | [Capturar alterações da sessão atual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Fluxos de trabalho de armazenamento

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Ler ou gravar imagens de disco, formatar um dispositivo ou sobrescrever um dispositivo | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operações genéricas de disco. Escrita, formatação e limpeza são destrutivas e normalmente exigem root. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Para alterações nas listas de pacotes-fonte, kernels, artefatos de boot ou toda a cadeia de módulos, utilize o sistema de build de fontes em vez de qualquer ferramenta de remasterização de imagem. Veja [Compilando MiniOS](/development/Building-MiniOS).
