---
updated: 2026-10-06
---

# Modos de boot

O modo de boot determina se MiniOS inicia do zero, abre uma sessão salva ou executa como um sistema instalado convencional. Você não precisa entender o processo interno de boot para fazer essa escolha.

Os rótulos do menu podem variar um pouco entre versões, modos de firmware e ferramentas de boot. Escolha pelo resultado desejado, não pela redação exata.

## Escolha rápida

A opção padrão é **Iniciar MiniOS**. Ela utiliza seleção automática de persistência: MiniOS tenta retomar uma sessão padrão compatível e pode criar uma substituta compatível quando não existe uma sessão utilizável e há armazenamento gravável disponível.

| Entrada do menu | Use quando | As alterações são salvas? | Manter o USB conectado? |
|---|---|---|---|
| **Iniciar MiniOS** (padrão) | Uso portátil normal | Sim, se a ativação automática da persistência for bem-sucedida | Sim |
| **Iniciar nova sessão** | Você quer um novo espaço de trabalho separado | Somente se a nova sessão for criada e ativada com sucesso | Sim |
| **Escolher uma sessão salva** | Você quer selecionar um dos vários espaços de trabalho existentes | Somente se a sessão selecionada for ativada com sucesso | Sim |
| **Iniciar sem salvar** | Você quer um boot temporário limpo sem persistência | Não | Sim |
| **Executar a partir da RAM** | Você quer copiar os dados do sistema MiniOS para RAM neste boot | As alterações feitas com suporte RAM são temporárias, a menos que uma sessão de persistência compatível seja explicitamente salva de volta ou salva como nova | Até que MiniOS tenha desconectado com sucesso a origem e qualquer armazenamento que você ainda precise |

Para o primeiro boot normal, deixe **Iniciar MiniOS** selecionado. Use **Iniciar sem salvar** quando você precisar especificamente de um teste de hardware temporário limpo ou de uma sessão de recuperação que não deve abrir nem criar persistência.

::: warning Confirme se a persistência está ativa
Escolher uma entrada de menu persistente solicita uma sessão; não garante que a sessão possa ser aberta. Se o armazenamento estiver somente leitura, cheio, danificado ou incompatível, MiniOS pode continuar sem salvar alterações. Verifique o aviso de inicialização antes de começar um trabalho que precisa ser mantido.
:::

## Iniciar MiniOS

**Iniciar MiniOS** é a primeira e a entrada padrão do menu. É indicada para uso normal, incluindo o primeiro boot de um dispositivo MiniOS recém-preparado.

MiniOS procura automaticamente por uma sessão persistente compatível. Se existir uma sessão padrão utilizável, ela será retomada. Se não houver, MiniOS pode criar uma sessão compatível automaticamente quando houver armazenamento gravável disponível.

Se a persistência não puder ser criada ou ativada porque o armazenamento está somente leitura, cheio, danificado ou inadequado, MiniOS continua com uma camada temporária gravável e informa que a sessão não é persistente. Verifique esse aviso antes de realizar tarefas que precisam sobreviver a um reboot.

Para uma sessão persistente funcional, o Configurador do MiniOS pode manter logs e caches comuns selecionados em RAM, enquanto mantém diagnósticos de boot e dados do usuário no armazenamento. As três configurações e seus limites de RAM são descritos em [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Elas não têm efeito em um **Iniciar sem salvar** boot.

## Iniciar nova sessão

MiniOS abre o menu de configuração de persistência, permite escolher um backend de armazenamento compatível e opções aplicáveis de criptografia ou compressão DynBlk, e então cria uma sessão persistente adicional numerada, mantendo as sessões existentes inalteradas. Este é o comportamento atual do `perchdir=setup` sistema. Use para manter espaços de trabalho separados ou testar uma nova configuração sem substituir sua sessão de trabalho atual.

A criação exige armazenamento compatível gravável e espaço livre suficiente. As opções de backend disponíveis dependem do sistema de arquivos, estado do Secure Boot, drivers/ferramentas instalados e capacidades do initrd. Uma nova sessão não é um backup de uma já existente.

## Escolher uma sessão salva

MiniOS exibe as sessões salvas disponíveis e permite selecionar uma delas. Use quando um dispositivo contém vários espaços de trabalho. Se o armazenamento de persistência selecionado estiver vazio, o caminho `ask` entra automaticamente na configuração de persistência para que você possa criar a primeira sessão.

Uma sessão pode ser incompatível se vier de outra edição ou versão do MiniOS. Uma configuração diferente de `union=` também pode tornar uma sessão incompatível.
A seleção interativa não torna uma sessão incompatível segura.

## Iniciar sem salvar

Este modo desativa deliberadamente a persistência para o boot atual. MiniOS usa uma área temporária gravável em RAM, então arquivos criados no sistema live, pacotes instalados e configurações alteradas desaparecem ao desligar.

Use este modo quando você quiser especificamente:

- testar hardware sem abrir ou criar uma sessão persistente;
- diagnosticar um problema sem alterar o estado salvo;
- trabalhar temporariamente quando nada precisa ser mantido.

Iniciar sem salvar não significa que o meio de boot pode ser removido. O sistema em execução normalmente continua lendo seus módulos de sistema a partir desse meio.

## Executar a partir da RAM

Este modo copia os dados do sistema MiniOS para RAM para reduzir leituras da origem. É necessário ter memória suficiente para o sistema copiado e para a carga de trabalho em execução.

A cópia do sistema e a cópia da persistência agora são separadas. Com um pedido de persistência, `toram` o padrão `perchtoram` é `trim`, então a sessão selecionada e suportada Raw, DynFileFS, DynBlk, VMDK ou SquashFS é copiada para RAM, enquanto sessões salvas não relacionadas permanecem no armazenamento original. Use `perchtoram=off` quando você quiser o sistema em RAM, mas a sessão de persistência ativa deve continuar gravando diretamente no armazenamento, ou `perchtoram=full` quando todas as sessões salvas suportadas devem ser copiadas. Sessões de diretório nativas não são copiadas por `perchtoram`.

Uma sessão de persistência suportada por RAM não é durável enquanto está em execução. O Gerenciador de sessões MiniOS atual pode gravar explicitamente as alterações suportadas por RAM de volta ao armazenamento original usando **Salvar agora**, ou salvá-las como uma nova sessão numerada, desde que o armazenamento original esteja presente, gravável e ainda corresponda à identidade registrada no boot. Até que esse salvamento seja bem-sucedido, alterações RAM não salvas serão perdidas ao desligar. As políticas de salvamento automático SquashFS usam o mesmo backend de sessão quando o armazenamento original está disponível.

Não remova o dispositivo de boot apenas porque **Executar a partir da RAM** foi selecionado. Só é seguro após MiniOS ter desconectado com sucesso o sistema de arquivos de origem, loop ISO, mapeamentos Ventoy e qualquer dependência de persistência que você ainda precise. Se a desconexão falhar, a origem continua em uso.

## Instalação nativa

::: warning A instalação nativa altera o modelo do sistema
Uma instalação nativa mantém a experiência de desktop familiar do MiniOS — sua identidade visual, ambiente de desktop selecionado e aplicativos comuns — mas converte a imagem live em um desktop Debian convencional. As ferramentas específicas do MiniOS para sessões, módulos, kernels modulares e outros fluxos de trabalho live são removidas, pois esses recursos não se aplicam mais.
:::

Após a conversão nativa, utilize as ferramentas normais de pacotes, kernel, configuração e bootloader do Debian. O resultado permanece visualmente familiar e mantém os aplicativos de desktop da edição selecionada, mas o conjunto de recursos live específico do MiniOS não está mais presente. A arquitetura live MiniOS é descrita em [Sobre o MiniOS](/getting-started/About-MiniOS).

Use [Instalador do MiniOS](/installing-minios/MiniOS-Installer) somente quando você realmente quiser essa conversão e a imagem selecionada suportar implantação nativa.

## Quando você precisar de mais detalhes

- [Menus de boot](/preparing-and-customizing/Customizing-the-Boot-Menu) explica a navegação e a edição temporária de uma entrada do menu.
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) explica os modos de armazenamento, criação, redimensionamento e remoção de sessões.
- [Parâmetros de boot](/reference/Boot-Parameters) é a referência completa de linha de comando.
- [Descoberta do sistema initrd](/reference/boot-process/System-Discovery), [carregamento de módulos](/reference/boot-process/Module-Loading), e [persistência](/reference/boot-process/Persistence-Internals) explicam como os grupos de parâmetros relacionados são processados durante a inicialização.
