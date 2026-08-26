---
updated: 2026-08-26
---

# Aplicativos e ferramentas MiniOS

O MiniOS inclui ferramentas para configurar, instalar, manter e remasterizar sistemas MiniOS. Use esta página para escolher uma ferramenta e, em seguida, siga o guia vinculado para requisitos, limites de segurança e detalhes dos comandos.

## Verifique o que está instalado

Os manifestos de pacotes atuais do Xfce incluem o conjunto gráfico nas edições Standard, Toolbox e Ultra: Configurador, Instalador, Gerenciador de Sessão, Gerenciador de Kernel, Loja, Construtor de Imagem, Gerenciador de Módulos, Ajuda do MiniOS e Utilitário de Disco.
A edição Flux não inclui esse conjunto de interface gráfica, e builds usando outros ambientes desktop ou console podem não incluí-lo. A seleção condicional de pacotes também varia conforme a suíte de distribuição e as opções de build.

O conjunto de pacotes instalado ou a imagem finalizada é a referência principal. Verifique um sistema em execução com `dpkg-query`, ou inspecione os módulos e manifestos da imagem conforme descrito em [Pacotes e edições](/administration/Packages.md).

## Escolha uma ferramenta gráfica

| Tarefa | Ferramenta | Aplicabilidade em modo live e nativo | Documentação |
|---|---|---|---|
| Editar configurações de inicialização e de nova sessão do MiniOS | **MiniOS Configurator** | Para o modelo de configuração live do MiniOS. Ele grava configurações para um próximo boot live e não reconfigura imediatamente o sistema em execução. | [MiniOS Configurator](/configuration/MiniOS-Configurator.md) |
| Implantar o MiniOS em outro disco | **MiniOS Installer** | Execute a partir de uma sessão live do MiniOS. Pode criar uma instalação live modular ou uma instalação nativa convencional quando a imagem suporta implantação nativa. | [MiniOS Installer](/installation/MiniOS-Installer.md) |
| Criar, selecionar, redimensionar, salvar ou remover sessões persistentes | **MiniOS Session Manager** | Apenas para sistemas live. Instalações nativas gravam diretamente no sistema de arquivos raiz e não usam sessões live do MiniOS. | [Gerenciamento de sessões](/configuration/Session-Management.md) |
| Empacotar, ativar, inspecionar ou remover kernels do MiniOS | **MiniOS Kernel Manager** | Destinado a instalações live modulares e ao repositório de kernels do MiniOS. Em instalações nativas, utilize o fluxo normal de pacotes de kernel da distribuição. | [Gerenciamento de kernel](/administration/Kernel-Management.md) |
| Instalar aplicativos ou construir módulos de aplicativos a partir de receitas do catálogo | **MiniOS Store** | Em sistemas live, escolha entre instalação por módulo ou direta no sistema; a persistência determina se as alterações diretas permanecem após reiniciar. Instalações nativas usam o modo direto no sistema. | [MiniOS Store](/administration/MiniOS-Store.md) |
| Remasterizar uma imagem MiniOS existente por meio de um projeto guiado | **MiniOS Image Builder** | Funciona com o conteúdo da imagem live do MiniOS a partir da sessão live em execução, de um ISO ou de mídia óptica. Cria outro ISO live; não mantém uma instalação nativa nem substitui um build de origem. | [MiniOS Image Builder](/development/Image-Builder.md) |
| Inspecionar, criar, ativar e selecionar módulos `.sb` | **MiniOS Module Manager** | A composição e ativação de módulos em tempo de execução são recursos do sistema live. Instalações nativas não utilizam o modelo de root `.sb` em camadas. | [MiniOS Module Manager](/administration/Module-Manager.md) |
| Ler a documentação instalada do MiniOS | **MiniOS Help** | Visualizador de documentação local. Pode ser usado onde o pacote `minios-help` e seu conjunto de documentação estiverem instalados. | [Documentação do MiniOS](/) |
| Gravar um ISO do MiniOS em um pen drive USB | **Drive Utility** | Pode ser executado em um sistema gráfico live ou nativo quando instalado. Grava mídia inicializável; não realiza implantação live ou nativa como o MiniOS Installer. | [Drive Utility](/installation/tools/Drive-Utility.md) |

## Escolha uma ferramenta de linha de comando

O manifesto de núcleo compartilhado atualmente inclui `minios-tools` e `minios-image-compose`, inclusive na edição Flux. A presença deles em qualquer sistema ou imagem instalada deve ser verificada diretamente.

### Trabalhe com módulos e alterações de sessão

Use as ferramentas CLI principais do MiniOS quando precisar de um fluxo de trabalho de módulos automatizável:

- `sb` inspeciona módulos e gerencia os conjuntos de módulos ativos e para o próximo boot.
- `apt2sb`, `script2sb` e `chroot2sb` constroem módulos em um ambiente isolado.
- `dir2sb` e `sb2dir` convertem entre árvores de diretórios e módulos `.sb`.
- `savechanges` captura alterações elegíveis de uma sessão live gravável em um módulo.
- `rmsbdir` remove um diretório de extração de módulo com as verificações de segurança necessárias.

A maioria das operações de build, captura, ativação e próximo boot depende do layout de módulos live do MiniOS. Conversão básica de arquivos e inspeção podem ser úteis fora de uma sessão live em execução, desde que as ferramentas e arquivos de entrada necessários estejam disponíveis.
Veja [Criação de módulos](/development/Creating-Modules.md) para privilégios, regras de saída e fluxos de comando atuais.

### Compor um ISO do MiniOS

Use `minios-image-compose` para scripts, automação ou remasterização reprodutível via linha de comando de uma árvore de conteúdo MiniOS existente. Ele pode selecionar módulos, aplicar configurações de imagem suportadas, opcionalmente capturar alterações compatíveis de sessões live, verificar o resultado e publicar um ISO inicializável. Opera sobre o conteúdo de imagem live do MiniOS e não converte ou atualiza uma instalação nativa. Veja [Compondo imagens ISO do MiniOS pela linha de comando](/development/Rebuilding-ISO.md).

Para alterações em listas de pacotes de origem, kernels, artefatos de boot ou toda a cadeia de módulos, utilize o sistema de build de origem em vez de qualquer ferramenta de remasterização de imagem. Veja [Compilando o MiniOS](/development/Building-MiniOS.md).
