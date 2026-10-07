---
updated: 2026-10-06
---

# Aplicativos MiniOS

MiniOS oferece ferramentas gráficas e de linha de comando para configuração, instalação, sessões, módulos, kernels, softwares e remasterização de imagens. Essas ferramentas são baseadas na arquitetura modular live descrita em [Sobre MiniOS](/getting-started/About-MiniOS).

## Disponibilidade

As ferramentas disponíveis dependem dos pacotes incluídos na imagem MiniOS. Verifique em um sistema live em execução com `dpkg-query`, ou inspecione os módulos da imagem e [manifests de pacotes](/reference/Package-and-Edition-Contents).

Uma instalação nativa mantém a experiência de desktop familiar do MiniOS — sua identidade visual, ambiente de desktop selecionado e aplicativos usuais — mas não mantém o software de gerenciamento específico do MiniOS projetado para a arquitetura live. Sessões, `.sb` módulos, gerenciamento modular de kernel e fluxos de trabalho semelhantes deixam de ser aplicáveis, então o sistema instalado utiliza as ferramentas padrão do Debian para pacotes, kernel, configuração e bootloader.

## Ferramentas gráficas

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Edite as configurações de inicialização e de nova sessão do MiniOS | **Configurador do MiniOS** | Para o modelo de configuração live MiniOS. Ele grava configurações para um próximo boot live e não reconfigura o sistema em execução imediatamente. | [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Implantar MiniOS em outro disco | **Instalador do MiniOS** | Executa a partir de uma sessão live MiniOS. O modo live mantém todo o ambiente live MiniOS; o modo nativo cria um desktop Debian convencional e remove o software específico do MiniOS voltado para operação live. | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) |
| Criar, selecionar, montar, redimensionar, salvar, recuperar, criptografar ou remover sessões persistentes | **Gerenciador de sessões MiniOS** | Apenas para sistemas live MiniOS. Pode gravar sessões suportadas baseadas em RAM no armazenamento original, alterar senhas LUKS destacadas e montar sessões de contêiner inativas para acesso a arquivos. | [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) |
| Empacotar, ativar, inspecionar ou remover kernels MiniOS | **Gerenciador de kernels MiniOS** | Somente para sistemas live modulares MiniOS. O empacotamento de repositório também pode adicionar drivers compatíveis do catálogo DKMS MiniOS selecionado. | [Gerenciamento de kernel](/preparing-and-customizing/Managing-Kernels) |
| Instalar aplicativos ou construir módulos de aplicativos a partir de receitas do catálogo | **Loja de aplicativos MiniOS** | Para sistemas live MiniOS. A construção de módulos pode manter um nível de receita ou usar um nível de base de compilação explícito; algumas receitas podem exigir aceitação de licença. | [Loja de aplicativos MiniOS](/using-minios/Installing-Software) |
| Remasterizar uma imagem MiniOS existente por meio de um projeto guiado | **Construtor de imagens MiniOS** | Funciona com conteúdo de imagem live MiniOS da sessão live em execução, de um ISO ou de mídia óptica. Permite selecionar módulos, capturar alterações da sessão e definir o comportamento do menu de boot antes de gerar outro ISO live verificado. | [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspecionar, criar, ativar e selecionar `.sb` módulos | **Gerenciador de módulos MiniOS** | Apenas para sistemas live MiniOS; a composição e ativação de módulos em tempo de execução dependem do modelo de `.sb` root em camadas. | [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules) |
| Gravar/ler imagens de disco, formatar armazenamento ou apagar um dispositivo | **Utilitário de disco** | Utilitário genérico de armazenamento incluído no MiniOS. A gravação de imagem bruta não realiza implantação gerenciada como o Instalador do MiniOS. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) |
| Navegar pela documentação instalada offline | **Ajuda MiniOS** | Visualizador nativo GTK para um pacote de documentação pré-compilado; não requer site, WebKit ou conexão de rede em tempo de execução. | [Documentação MiniOS](/) |
| Exibir a introdução localizada na primeira execução | **Boas-vindas MiniOS** | Página de boas-vindas baseada em navegador local com Mio, links do projeto, ajuda, comunidade e suporte. É um conteúdo introdutório, não um configurador do sistema. | [Primeiros passos](/getting-started/Quick-Start) |

## Ferramentas de linha de comando

A maioria das ferramentas gráficas possui um equivalente público de linha de comando ou backend. Esses comandos são fornecidos no mesmo pacote do aplicativo gráfico ou em um pacote complementar obrigatório. O manifesto central compartilhado inclui `minios-tools` e `minios-image-compose`. Os demais comandos seguem a disponibilidade dos pacotes gráficos correspondentes. A presença em um sistema ou imagem instalada deve ser verificada diretamente.

### Implantação e sessões

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Listar discos de destino, visualizar um plano de implantação ou instalar MiniOS de forma não interativa | **`minios-deploy`** | Executa a partir de uma sessão live MiniOS. A instalação requer root e confirmação explícita; o modo nativo, quando suportado, cria um desktop Debian convencional a partir da imagem selecionada. | [Implantação por linha de comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Criar, ativar, salvar, montar, redimensionar, recuperar, alterar credenciais de criptografia, exportar, importar ou remover sessões persistentes | **`minios-session`** | Requer root e um sistema live MiniOS com armazenamento de persistência compatível. Salvamento baseado em RAM, montagens destacadas e operações específicas do backend dependem de permissões. | [Referência de comandos de sessão](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels e imagens

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Listar, empacotar, ativar, inspecionar ou remover kernels | **`minios-kernel`** | Requer root e uma instalação modular live MiniOS com root MiniOS gravável. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remasterizar uma árvore de conteúdo MiniOS existente a partir de scripts ou automação | **`minios-image-compose`** | Opera sobre o conteúdo da imagem live MiniOS e publica um ISO inicializável. | [Composição de imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Fluxos de trabalho de módulos

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Inspecionar módulos e gerenciar os conjuntos de módulos em execução ou para o próximo boot | **`sb`** | A inspeção de módulos também funciona fora de uma sessão MiniOS em execução. Operações de execução e de próximo boot exigem um layout de módulos live MiniOS; alterações requerem root. | [Inspecionar e extrair módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gerenciar módulos em execução e no próximo boot](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Construir um módulo a partir de pacotes do repositório ou arquivos locais `.deb` | **`apt2sb`** | Requer root e uma sessão live MiniOS suportada. Os pacotes são instalados em um ambiente de build isolado, não no root em execução. | [Criar um módulo a partir de pacotes](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Construir um módulo executando um script de instalação | **`script2sb`** | Requer root e uma sessão live MiniOS suportada. O script é executado de forma não interativa em um ambiente de build isolado. | [Criar um módulo a partir de script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Construir um módulo de forma interativa em um ambiente preparado | **`chroot2sb`** | Requer root e uma sessão live MiniOS suportada. Use quando a instalação exigir prompts ou alterações manuais. | [Criar um módulo de forma interativa](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Converter entre uma árvore de diretórios e um `.sb` módulo | **`dir2sb`**, **`sb2dir`** | Conversão comum não requer root e pode ser feita fora de uma sessão live. Extração fiel e reempacotamento com donos originais e arquivos especiais requerem root; fluxos de trabalho gráficos solicitam autenticação de administrador. | [Criar](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extrair](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) um módulo; `man dir2sb`, `man sb2dir` |
| Capturar alterações elegíveis da camada de sessão gravável em um módulo | **`savechanges`** | Requer root e uma sessão live MiniOS em execução com backend de camada gravável suportado. | [Capturar alterações da sessão atual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Fluxos de trabalho de armazenamento

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Ler ou gravar imagens de disco, formatar um dispositivo ou apagar armazenamento | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operações genéricas de disco. A limpeza suporta métodos de apagar pelo controlador, descartar e sobrescrever pelo host quando o dispositivo e as ferramentas necessárias permitem. Operações destrutivas normalmente requerem root. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Para alterações em listas de pacotes fonte, kernels, artefatos de boot ou toda a cadeia de módulos, utilize o sistema de build de fontes em vez de qualquer ferramenta de remasterização de imagem. Veja [Compilando MiniOS](/development/Building-MiniOS).
