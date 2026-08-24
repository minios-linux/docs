# MiniOS Module Manager

MiniOS Module Manager é o aplicativo gráfico para inspecionar, criar e gerenciar módulos `.sb` do MiniOS. Ele possui dois ambientes de trabalho: **Módulos**, para composição do sistema, e **Criar**, para criação de novos módulos.

Inicie pelo menu de aplicativos ou execute:

```bash
minios-module-manager
```

O aplicativo é executado como seu usuário do desktop. Ele solicita autenticação de administrador apenas quando uma operação solicitada exige isso.

## Em execução agora e no próximo boot

O ambiente de trabalho Módulos mantém duas visualizações separadas:

- **Em Execução Agora** é o conjunto ordenado de módulos que atualmente compõem o sistema ativo.
- **Próximo Boot** é o conjunto ordenado selecionado pelas regras de boot atuais do MiniOS.

Alterar uma visualização não modifica silenciosamente a outra. Por exemplo, **Ativar para Esta Sessão** afeta apenas o sistema em execução, enquanto **Adicionar ao Próximo Boot** copia um módulo para o armazenamento durável de módulos sem ativá-lo agora.

A ativação e desativação em tempo real estão disponíveis somente quando o sistema de arquivos raiz está usando AUFS. Elas não estão disponíveis em um root OverlayFS, mesmo que o kernel suporte AUFS. Módulos base não podem ser desativados pelo aplicativo.

Alterações para o próximo boot só estão disponíveis quando o MiniOS encontra armazenamento de módulos durável e gravável adequado. Módulos base e módulos em armazenamento somente leitura ou volátil não podem ser removidos. Filtros de boot como `load`, `noload` e `bext` ainda determinam quais módulos são selecionados.

## Inspecionando um módulo

Selecione um módulo para ver sua origem, tamanho compactado e conteúdo do sistema de arquivos. Se o arquivo de origem estiver disponível, **Extrair para Pasta** cria um novo diretório contendo os arquivos do módulo.

A inspeção e a extração comum não exigem privilégios de administrador. A extração nunca substitui um destino existente.

Você também pode abrir um arquivo local `.sb` pelo gerenciador de arquivos. Abrir um arquivo apenas inspeciona; não ativa nem adiciona ao Próximo Boot.

## Criando um módulo

O ambiente Criar utiliza um fluxo de **Configurar**, **Revisar**, **Executar** e **Resultado**. Um módulo criado com sucesso permanece como um arquivo no local de saída. Ele não é ativado nem adicionado automaticamente ao Próximo Boot.

Os métodos disponíveis são:

- **Pacotes** instala pacotes do repositório e arquivos `.deb` locais selecionados, incluindo suas dependências, em um ambiente de build isolado do MiniOS. A instalação de pacotes requer autenticação de administrador.
- **Script de Instalação** executa um script revisado sem terminal interativo. Uma pasta de origem opcional pode fornecer arquivos iniciais. O script é executado com privilégios de administrador, mas não é armazenado no módulo resultante.
- **Chroot Interativo** abre um shell root temporário no terminal embutido. Digite `exit` ao finalizar, então crie o módulo, reabra o shell ou descarte as alterações. Fechar ou descartar a sessão não altera o sistema em execução.
- **Pasta** empacota o conteúdo de um diretório existente. O diretório de origem não é aninhado dentro do módulo. A conversão comum de pasta não exige root, mantém a origem inalterada e normaliza a propriedade dos arquivos no módulo para root.
- **Alterações da Sessão Atual** captura arquivos elegíveis e exclusões da camada gravável da sessão atual. Utiliza a política padrão `savechanges` do MiniOS, que omite logs, caches, dados de boot e caminhos temporários de execução. Ler toda a camada gravável requer autenticação de administrador.

Escolha um novo caminho de saída para cada fluxo de trabalho. Arquivos existentes nunca são sobrescritos. O progresso e diagnósticos do backend ficam visíveis durante a execução, e a captura da sessão atual pode ser cancelada.

Alterações da Sessão Atual são destinadas à captura padrão e conveniente, não para revisão detalhada de cada caminho incluído. Uma camada gravável ativa pode conter dados pessoais ou confidenciais. Para políticas explícitas de `exact`, `clean` ou seleção de caminhos para privacidade, utilize o fluxo de trabalho via linha de comando `savechanges` descrito em [Criando módulos](/development/Creating-Modules.md).

## Arrastar e soltar

Arrastar e soltar apenas preenche um campo de entrada ou abre a inspeção:

- Um módulo abre seus detalhes.
- Arquivos `.deb` são adicionados a Pacotes.
- Um diretório é selecionado para Pasta.
- Outro arquivo comum é selecionado como Script de Instalação.

Soltar um item não executa código nem altera Em Execução Agora ou Próximo Boot.

## Documentação relacionada

- [Criando módulos](/development/Creating-Modules.md)
- [Reconstruindo imagens ISO](/development/Rebuilding-ISO.md)
- [Parâmetros de boot](/configuration/Boot-Parameters.md)
