---
updated: 2026-10-15
---

# Aplicativos MiniOS

MiniOS oferece ferramentas gráficas e de linha de comando para configuração, instalação, sessões, módulos, kernels, software e remasterização de imagens. Essas ferramentas foram projetadas com base na arquitetura modular live descrita em [Sobre MiniOS](/getting-started/About-MiniOS).

## Disponibilidade

As ferramentas disponíveis dependem dos pacotes incluídos na imagem MiniOS. Verifique um sistema live em execução com `dpkg-query`, ou consulte os módulos da imagem e os [manifestos de pacotes](/reference/Package-and-Edition-Contents).

Uma instalação nativa mantém a experiência familiar do desktop MiniOS — sua identidade visual, o ambiente de desktop selecionado e os aplicativos comuns —, mas não inclui o software de gerenciamento específico do MiniOS projetado para a arquitetura live. Sessões,`.sb` módulos, gerenciamento modular de kernels e fluxos de trabalho semelhantes deixam de se aplicar; por isso, o sistema instalado usa as ferramentas padrão do Debian para pacotes, kernels, configuração e bootloader.

## Ferramentas gráficas

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Editar as configurações de inicialização e de novas sessões MiniOS | **Configurador do MiniOS** | Para o modelo de configuração live MiniOS. Grava configurações para uma inicialização live posterior e não reconfigura o sistema em execução imediatamente. | [Configurador do MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) |
| Implantar MiniOS em outro disco | **Instalador do MiniOS** | Executado em uma sessão live MiniOS. O modo live mantém o ambiente live completo MiniOS; o modo nativo cria um desktop Debian convencional e remove o software específico do MiniOS destinado à operação live. | [Instalador do MiniOS](/installing-minios/MiniOS-Installer) |
| Criar, selecionar, montar, redimensionar, salvar, recuperar, criptografar ou remover sessões persistentes | **Gerenciador de sessões MiniOS** | Apenas sistemas live MiniOS. Pode gravar sessões compatíveis com RAM no armazenamento original, alterar frases secretas LUKS de sessões desconectadas e montar sessões em contêineres inativas para acessar arquivos. | [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) |
| Empacotar, ativar, inspecionar ou remover kernels MiniOS | **Gerenciador de kernels MiniOS** | Apenas sistemas live modulares MiniOS. O empacotamento de repositórios também pode adicionar drivers compatíveis do catálogo DKMS selecionado MiniOS. | [Gerenciamento de kernels](/preparing-and-customizing/Managing-Kernels) |
| Instalar aplicativos ou criar módulos de aplicativos com base em receitas do catálogo | **Loja de aplicativos MiniOS** | Sistemas live MiniOS. A criação de módulos pode manter o nível da receita ou usar um nível base de compilação explícito; as receitas podem exigir a aceitação da licença. | [Loja de aplicativos MiniOS](/using-minios/Installing-Software) |
| Remasterizar uma imagem MiniOS existente por meio de um projeto guiado | **Construtor de imagens MiniOS** | Usa a sessão em execução, um ISO ou uma mídia óptica. A captura da sessão exige que a origem seja a sessão em execução, com todo o conjunto de módulos de origem e módulos externos ativos; não está disponível para origens ISO/ópticas selecionadas separadamente. | [Construtor de imagens MiniOS](/preparing-and-customizing/Creating-Custom-MiniOS-Images) |
| Inspecionar, criar, ativar e selecionar `.sb` módulos | **Gerenciador de módulos MiniOS** | Apenas sistemas live MiniOS; a composição dos módulos e a ativação em tempo de execução dependem do modelo de raiz em camadas`.sb` root. | [Gerenciador de módulos MiniOS](/preparing-and-customizing/Managing-Modules) |
| Gravar/ler imagens de disco, formatar armazenamento ou apagar um dispositivo | **Utilitário de disco** | Utilitário genérico de armazenamento incluído no MiniOS. A gravação de imagens brutas não faz uma implantação gerenciada como o Instalador do MiniOS. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) |
| Consultar a documentação instalada offline | **Ajuda MiniOS** | Visualizador GTK nativo de um pacote de documentação pré-compilado; não requer o site, WebKit nem conexão de rede durante a execução. | [Documentação do MiniOS](/) |
| Exibir a introdução localizada da primeira execução | **Boas-vindas do MiniOS** | Página de boas-vindas local, exibida no navegador, com Mio, links do projeto, ajuda, comunidade e opções de suporte. É um conteúdo introdutório, não uma ferramenta de configuração do sistema. | [Início rápido](/getting-started/Quick-Start) |

## Ferramentas de linha de comando

A maioria das ferramentas gráficas tem uma alternativa pública de linha de comando ou um backend. O manifesto principal solicita `minios-tools` para cada edição e `minios-image-compose`, `minios-deploy`, `minios-kernel` e `minios-session` para as variantes que não são mínimas, independentemente das ferramentas gráficas do desktop. Flux usa a variante `minimum` e, por padrão, não solicita esses quatro backends complementares. Verifique os pacotes realmente instalados; dependências e imagens personalizadas podem incluir ferramentas além das previstas no manifesto.

### Implantação e sessões

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Listar discos de destino, visualizar um plano de implantação ou instalar MiniOS sem interação | **`minios-deploy`** | É executado a partir de uma sessão ativa MiniOS. A instalação requer root e confirmação explícita; quando compatível, o modo nativo cria um desktop Debian convencional com base na imagem selecionada. | [Implantação pela linha de comando](/installing-minios/MiniOS-Installer#command-line-deployment); `man minios-deploy` |
| Criar, ativar, salvar, montar, redimensionar, recuperar espaço, alterar credenciais de criptografia, exportar, importar ou remover sessões persistentes | **`minios-session`** | Requer root e um sistema ativo MiniOS com um armazenamento de persistência compatível. As operações de salvamento com RAM, montagens desacopladas e operações específicas do backend dependem dos recursos disponíveis. | [Referência de comandos de sessão](/using-minios/Sessions-and-Persistence#command-reference); `man minios-session` |

### Kernels e imagens

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Listar, empacotar, ativar, inspecionar ou remover kernels | **`minios-kernel`** | Requer root e uma instalação modular ativa de MiniOS com uma raiz MiniOS gravável. | [`minios-kernel` CLI](/preparing-and-customizing/Managing-Kernels#command-line-reference); `man minios-kernel` |
| Remasterizar uma árvore de conteúdo MiniOS existente usando scripts ou automação | **`minios-image-compose`** | Opera sobre o conteúdo da imagem ativa MiniOS e gera uma ISO inicializável. | [Montar imagens ISO pela linha de comando](/preparing-and-customizing/Creating-Custom-MiniOS-Images#composing-minios-iso-images-from-the-command-line); `man minios-image-compose` |

### Fluxos de trabalho com módulos

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Inspecionar módulos e gerenciar os conjuntos de módulos em execução ou para a próxima inicialização | **`sb`** | A inspeção de módulos também funciona fora de uma sessão ativa MiniOS. As operações em execução e para a próxima inicialização requerem um layout de módulos ativos MiniOS; alterações exigem root. | [Inspecionar e extrair módulos](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules); [gerenciar módulos em execução e para a próxima inicialização](/preparing-and-customizing/Managing-Modules#manage-running-and-next-boot-modules); `man sb` |
| Criar um módulo com pacotes de repositórios ou arquivos `.deb` locais | **`apt2sb`** | Requer root e uma sessão ativa MiniOS compatível. Os pacotes são instalados em um ambiente de compilação isolado, não na raiz em execução. | [Criar um módulo com pacotes](/preparing-and-customizing/Managing-Modules#create-a-module-from-packages); `man apt2sb` |
| Criar um módulo executando um script de instalação | **`script2sb`** | Requer root e uma sessão ativa MiniOS compatível. O script é executado sem interação em um ambiente de compilação isolado. | [Criar um módulo com um script](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-script); `man script2sb` |
| Criar um módulo de forma interativa em um ambiente preparado | **`chroot2sb`** | Requer root e uma sessão ativa MiniOS compatível. Use essa opção quando a instalação exigir prompts ou alterações manuais. | [Criar um módulo de forma interativa](/preparing-and-customizing/Managing-Modules#create-a-module-interactively); `man chroot2sb` |
| Converter entre uma árvore de diretórios e um módulo `.sb` | **`dir2sb`**, **`sb2dir`** | A conversão comum não requer root e pode ser executada fora de uma sessão ativa. A extração e o reempacotamento fiéis, que preservam os proprietários originais e os arquivos especiais, exigem root; os fluxos de trabalho gráficos solicitam autenticação de administrador. | [Criar](/preparing-and-customizing/Managing-Modules#create-a-module-from-a-directory) ou [extrair](/preparing-and-customizing/Managing-Modules#inspect-and-extract-modules) um módulo; `man dir2sb`, `man sb2dir` |
| Capturar em um módulo as alterações compatíveis da camada gravável da sessão | **`savechanges`** | Requer root e uma sessão ativa MiniOS em execução com um backend compatível de camada gravável. | [Capturar alterações da sessão atual](/preparing-and-customizing/Managing-Modules#capture-current-session-changes); `man savechanges` |

### Fluxos de trabalho de armazenamento

| Tarefa | Ferramenta | Escopo | Documentação |
|---|---|---|---|
| Ler ou gravar imagens de disco, formatar um dispositivo ou apagar armazenamento | **`driveutility-read`**, **`driveutility-write`**, **`driveutility-format`**, **`driveutility-wipe`** | Operações genéricas de disco. A limpeza oferece métodos de apagamento pelo controlador, descarte e sobrescrita pelo host quando compatíveis com o dispositivo e as ferramentas necessárias. Operações destrutivas normalmente exigem root. | [Utilitário de disco](/installing-minios/installation-tools/Drive-Utility); `man driveutility-read`, `man driveutility-write`, `man driveutility-format`, `man driveutility-wipe` |

Para alterar listas de pacotes de origem, kernels, artefatos de inicialização ou toda a cadeia de módulos, use o sistema de compilação da origem em vez de qualquer uma das ferramentas de remasterização de imagem. Consulte [Compilação de MiniOS](/development/Building-MiniOS).
