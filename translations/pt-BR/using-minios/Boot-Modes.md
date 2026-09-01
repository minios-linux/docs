---
updated: 2026-08-31
---

# Modos de inicialização

O modo de inicialização determina se o MiniOS inicia do zero, abre uma sessão salva ou executa como um sistema convencional instalado. Você não precisa entender o processo interno de inicialização para fazer essa escolha.

Os rótulos do menu podem variar um pouco entre versões, modos de firmware e ferramentas de boot. Escolha pela finalidade desejada, não pela redação exata.

## Escolha rápida

A entrada padrão é **Iniciar MiniOS**. Ela utiliza seleção automática de persistência: MiniOS tenta retomar uma sessão padrão compatível e pode criar uma substituta compatível caso não exista uma sessão utilizável e haja armazenamento gravável disponível.

| Entrada do menu | Quando usar | As alterações são salvas? | Manter o USB conectado? |
|---|---|---|---|
| **Iniciar MiniOS** (padrão) | Uso portátil normal | Sim, se a ativação automática da persistência for bem-sucedida | Sim |
| **Iniciar uma nova sessão** | Você deseja um novo espaço de trabalho separado | Somente se a nova sessão for criada e ativada com sucesso | Sim |
| **Escolher uma sessão salva** | Você deseja selecionar um dos vários espaços de trabalho existentes | Somente se a sessão selecionada for ativada com sucesso | Sim |
| **Iniciar sem salvar** | Você deseja um boot limpo e temporário sem persistência | Não | Sim |
| **Executar a partir de RAM** | Você deseja copiar MiniOS para RAM nesta inicialização | Não; trate a cópia RAM como temporária | Até que MiniOS tenha desconectado a origem com sucesso |

Para o primeiro boot normal, mantenha **Iniciar MiniOS** selecionado. Use **Iniciar sem salvar** quando precisar de um teste de hardware temporário ou sessão de recuperação que não deve abrir nem criar persistência.

::: warning Confirme se a persistência está ativa
Escolher uma entrada persistente no menu solicita uma sessão; não garante que ela será aberta. Se o armazenamento estiver somente leitura, cheio, danificado ou incompatível, MiniOS pode continuar sem salvar alterações. Verifique o aviso de inicialização antes de começar um trabalho que precisa ser mantido.
:::

## Iniciar MiniOS

**Iniciar MiniOS** é a primeira e padrão entrada do menu. É indicada para uso normal, incluindo o primeiro boot de um dispositivo MiniOS recém-preparado.

MiniOS procura automaticamente por uma sessão persistente compatível. Se existir uma sessão padrão utilizável, ela será retomada. Caso não exista, MiniOS pode criar uma sessão compatível automaticamente, se houver armazenamento gravável disponível.

Se a persistência não puder ser criada ou ativada porque o armazenamento está somente leitura, cheio, danificado ou inadequado, MiniOS continua com uma camada temporária gravável e informa que a sessão não é persistente. Verifique esse aviso antes de realizar trabalhos que precisam sobreviver a uma reinicialização.

## Iniciar uma nova sessão

MiniOS cria uma sessão persistente adicional numerada e mantém as sessões existentes inalteradas. Use esta opção para manter espaços de trabalho separados ou testar uma nova configuração sem substituir sua sessão atual.

A criação exige armazenamento compatível gravável e espaço livre suficiente. Uma nova sessão não é um backup de uma existente.

## Escolher uma sessão salva

MiniOS exibe as sessões salvas disponíveis e permite que você selecione uma delas. Use esta opção quando um dispositivo contém vários espaços de trabalho. Para criar a primeira sessão em um armazenamento vazio, escolha **Iniciar uma nova sessão**.

Uma sessão pode ser incompatível se vier de outra versão ou edição do MiniOS. Uma configuração diferente de `union=` também pode tornar uma sessão incompatível.
A seleção interativa não torna uma sessão incompatível segura.

## Iniciar sem salvar

Este modo desativa deliberadamente a persistência para o boot atual. MiniOS utiliza uma área temporária gravável na RAM, portanto arquivos criados no sistema live, pacotes instalados e configurações alteradas desaparecem ao desligar.

Use este modo quando você quiser especificamente:

- testar hardware sem abrir ou criar uma sessão persistente;
- diagnosticar um problema sem alterar o estado salvo;
- trabalhar temporariamente quando nada precisa ser mantido.

Iniciar sem salvar não significa que o meio de boot pode ser removido. O sistema em execução normalmente continua lendo seus módulos a partir desse meio.

## Executar a partir de RAM

Este modo copia os dados de MiniOS para a RAM para reduzir leituras da fonte. É necessário ter memória suficiente para o sistema copiado e para a carga de trabalho em execução.

Considere uma sessão carregada via RAM como temporária. Ao combinar `toram` com persistência, os dados da sessão selecionada são copiados para RAM; alterações posteriores não são copiadas de volta para o armazenamento de persistência original.

Não remova o dispositivo de boot apenas porque **Executar a partir de RAM** foi selecionado. Só é seguro após MiniOS desconectar com sucesso o sistema de arquivos de origem, o loop ISO e quaisquer mapeamentos Ventoy. Se essa operação falhar, a origem permanecerá em uso.

## Instalação nativa

::: warning A instalação nativa altera o modelo do sistema
Uma instalação nativa mantém a experiência de desktop familiar do MiniOS — sua identidade visual, ambiente de área de trabalho selecionado e aplicativos comuns — mas converte a imagem live em um desktop Debian convencional. As ferramentas específicas do MiniOS para sessões, módulos, kernels modulares e outros fluxos de trabalho live são removidas, pois esses recursos deixam de se aplicar.
:::

Após a conversão nativa, utilize as ferramentas normais do Debian para pacotes, kernel, configuração e bootloader. O resultado permanece visualmente familiar e mantém os aplicativos de desktop comuns da edição selecionada, mas o conjunto de recursos live específicos do MiniOS não estará mais presente. A arquitetura live do MiniOS é descrita em [Sobre MiniOS](/getting-started/About-MiniOS).

Use o [Instalador do MiniOS](/installing-minios/MiniOS-Installer) apenas quando desejar deliberadamente essa conversão e a imagem selecionada oferecer suporte à implantação nativa.

## Quando você precisar de mais detalhes

- [Menus de boot](/preparing-and-customizing/Customizing-the-Boot-Menu) explica a navegação e a edição temporária de uma entrada do menu.
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) explica modos de armazenamento, criação, redimensionamento e remoção de sessões.
- [Parâmetros de boot](/reference/Boot-Parameters) é a referência completa da linha de comando.
- [Descoberta do sistema no initrd](/reference/boot-process/System-Discovery), [carregamento de módulos](/reference/boot-process/Module-Loading) e [persistência](/reference/boot-process/Persistence-Internals) explicam como os grupos de parâmetros relacionados são processados durante a inicialização.
