---
updated: 2026-10-15
---

# Modos de inicialização

O modo de inicialização determina se MiniOS inicia sem persistência, abre uma sessão salva ou funciona como um sistema convencional instalado. Você não precisa entender o processo interno de inicialização para fazer essa escolha.

Os nomes das opções do menu podem variar um pouco entre versões, modos de firmware e ferramentas de inicialização. Escolha de acordo com o resultado desejado, não com o texto exato da opção.

## Escolha rápida

A opção padrão normal é **Iniciar MiniOS**. Ela usa a seleção automática de persistência: MiniOS tenta retomar uma sessão padrão compatível e pode criar uma sessão compatível substituta quando não há uma sessão utilizável e existe armazenamento gravável adequado.

| Opção do menu | Quando usar | As alterações são salvas? | É preciso manter o USB conectado? |
|---|---|---|---|
| **Iniciar MiniOS** (padrão) | Uso portátil normal | Sim, se a ativação automática da persistência for bem-sucedida | Sim |
| **Iniciar nova sessão** | Você quer um novo espaço de trabalho separado | Somente se a nova sessão for criada e ativada com sucesso | Sim |
| **Escolher uma sessão salva** | Você quer escolher um entre vários espaços de trabalho existentes | Somente se a sessão selecionada for ativada com sucesso | Sim |
| **Iniciar sem salvar** | Você quer uma inicialização temporária limpa, sem persistência | Não | Sim |
| **Executar a partir da RAM** | Você quer copiar os dados do sistema MiniOS para RAM nesta inicialização | As alterações armazenadas em RAM são temporárias, a menos que uma sessão de persistência compatível seja explicitamente salva de volta ou como nova | Até que MiniOS tenha desconectado com sucesso a origem e qualquer armazenamento de que você ainda precise |

Na primeira inicialização normal, mantenha **Iniciar MiniOS** selecionada. Use **Iniciar sem salvar** quando precisar especificamente de uma sessão temporária limpa para testar o hardware ou fazer uma recuperação, sem abrir nem criar persistência.

::: warning Confirme se a persistência está ativa
Escolher uma opção de menu persistente solicita uma sessão, mas não garante que ela possa ser aberta. Se o armazenamento for somente leitura, estiver cheio, danificado ou for incompatível, MiniOS poderá continuar sem salvar as alterações. Confira o aviso de inicialização antes de começar um trabalho que precisa ser mantido.
:::

## Iniciar MiniOS

**Iniciar MiniOS** é a primeira opção do menu e a padrão. Ela foi projetada para o uso normal, inclusive na primeira inicialização de um dispositivo MiniOS preparado recentemente.

MiniOS procura automaticamente uma sessão persistente compatível. Se houver uma sessão padrão utilizável, ela será retomada. Se não houver, MiniOS poderá criar uma sessão compatível automaticamente, desde que haja armazenamento gravável adequado.

Se não for possível criar ou ativar a persistência porque o armazenamento é somente leitura, está cheio, danificado ou é inadequado por outro motivo, MiniOS continuará com uma camada gravável temporária e informará que a sessão não é persistente. Confira esse aviso antes de realizar um trabalho que precisa ser mantido após uma reinicialização.

Em uma sessão persistente em funcionamento, o Configurador do MiniOS pode manter registros e caches comuns selecionados em RAM, enquanto conserva os diagnósticos de inicialização e os dados do usuário no armazenamento. As três configurações e seus limites de RAM estão descritos em [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Elas não têm efeito em uma inicialização **Iniciar sem salvar**.

## Iniciar nova sessão

MiniOS abre o menu de configuração da persistência, permite escolher um backend de armazenamento compatível e as opções aplicáveis de criptografia ou compactação de DynBlk e, em seguida, cria uma sessão persistente numerada adicional sem alterar as sessões existentes. Esse é o comportamento atual de `perchdir=setup`. Use essa opção para manter espaços de trabalho separados ou testar uma nova configuração sem substituir a sessão atual em funcionamento.

A criação exige armazenamento gravável compatível e espaço livre suficiente. As opções de backend disponíveis dependem do sistema de arquivos, do estado do Secure Boot, dos drivers e das ferramentas instalados e dos recursos do initrd. Uma sessão nova não é um backup de uma sessão existente.

## Escolher uma sessão salva

MiniOS exibe as sessões salvas disponíveis e permite selecionar uma. Use esse recurso quando um dispositivo tiver vários espaços de trabalho. Se o armazenamento de persistência selecionado estiver vazio, o`ask` caminho inicia automaticamente a configuração da persistência para que você possa criar a primeira sessão.

Uma sessão pode ser incompatível se vier de outra versão ou edição do MiniOS. Uma configuração diferente de`union=` também pode tornar uma sessão incompatível.
A seleção interativa não torna segura uma sessão incompatível.

A caixa de diálogo de incompatibilidade pode redefinir o software instalado no sistema, mantendo os dados e, opcionalmente, as configurações do sistema. Os dois modos de redefinição preservam as pastas pessoais, as configurações pessoais, as contas e as senhas. É necessário ter espaço livre para armazenar temporariamente os dados mantidos; uma redefinição de SquashFS só se torna permanente após salvar. Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) antes de redefinir.

## Iniciar sem salvar

Este modo desativa intencionalmente a persistência na inicialização atual. MiniOS usa uma área temporária gravável em RAM, então os arquivos criados no sistema live, os pacotes instalados e as configurações alteradas desaparecem quando o sistema é desligado.

Use este modo quando quiser especificamente:

- testar o hardware sem abrir nem criar uma sessão persistente;
- diagnosticar um problema sem alterar o estado salvo;
- trabalhar temporariamente quando nada precisar ser mantido.

Iniciar sem salvar não significa que a mídia de inicialização possa ser removida. Normalmente, o sistema em execução continua lendo os módulos do sistema nessa mídia.

## Executar a partir da RAM

Este modo copia os dados do sistema MiniOS para RAM a fim de reduzir as leituras da origem. É preciso ter memória suficiente para armazenar o sistema copiado e executar as tarefas em andamento.

A cópia do sistema e a cópia da persistência são processos separados. Quando há uma solicitação de persistência, `toram` por padrão `perchtoram` para `trim`, de modo que a sessão compatível selecionada, em formato Raw, DynFileFS, DynBlk, VMDK ou SquashFS, seja copiada para RAM, enquanto as demais sessões salvas permanecem no armazenamento original. Use `perchtoram=off` quando quiser o sistema em RAM, mas preferir que a sessão de persistência ativa continue gravando diretamente no armazenamento, ou `perchtoram=full` quando todas as sessões armazenadas compatíveis precisarem ser copiadas. Os dados de diretório nativo não são copiados: uma solicitação bem-sucedida de RAM nativo inicia, em vez disso, um novo contêiner vazio. Durante a redefinição de uma sessão nativa, a cópia é desativada para preservar os dados mantidos. Se não houver memória suficiente para copiar uma sessão ou se a cópia falhar, MiniOS informa sobre a alternativa e mantém a sessão no armazenamento.

Uma sessão de persistência apoiada por RAM não é durável enquanto está em execução. O Gerenciador de sessões MiniOS atual pode gravar explicitamente no armazenamento original as alterações compatíveis apoiadas por RAM usando **Salvar agora**, ou salvá-las como uma nova sessão numerada, desde que o armazenamento original esteja presente, possa ser gravado e ainda corresponda à identidade registrada na inicialização. Até que o salvamento seja concluído, as alterações não salvas de RAM serão perdidas quando o sistema for desligado. As políticas de salvamento automático de SquashFS usam o mesmo backend de sessão quando o armazenamento original está disponível.

Não remova o dispositivo de inicialização só porque **Executar a partir da RAM** foi selecionado. Isso só é seguro depois que MiniOS tiver desanexado com sucesso o sistema de arquivos de origem, o loop ISO, os mapeamentos Ventoy e qualquer dependência de persistência ainda necessária. Se a desanexação falhar, a origem continuará em uso.

## Imagens de persistência Ventoy

Com um backend de plugin de persistência Ventoy selecionado, uma inicialização persistente usa um ambiente ext4 gravável nessa imagem, em vez de sessões numeradas de MiniOS. **Iniciar nova sessão** e **Escolher uma sessão salva** não podem criar nem selecionar sessões numeradas nesse modo; selecione outro backend em Ventoy. O Gerenciador de sessões e `perchtoram` ficam indisponíveis, então até mesmo uma inicialização do sistema RAM mantém a imagem em uso. **Iniciar sem salvar** ainda usa uma camada superior RAM temporária. Inicializações comuns de Ventoy sem uma imagem de plugin selecionada mantêm o comportamento normal das sessões MiniOS. Consulte [Ventoy](/installing-minios/installation-tools/Ventoy).

## Instalação nativa

::: warning A instalação nativa altera o modelo do sistema
Uma instalação nativa mantém a experiência familiar do desktop MiniOS — sua identidade visual, o ambiente de desktop escolhido e os aplicativos comuns —, mas converte a imagem live em um desktop Debian convencional. As ferramentas específicas do MiniOS para sessões, módulos, kernels modulares e outros fluxos de trabalho live são removidas, pois esses recursos deixam de se aplicar.
:::

Após a conversão nativa, use as ferramentas padrão do Debian para pacotes, kernel, configuração e carregador de inicialização. O resultado mantém a aparência familiar e os aplicativos comuns do ambiente de desktop da edição escolhida, mas não inclui mais o conjunto de recursos live específicos do MiniOS. A arquitetura live do MiniOS é descrita em [Sobre MiniOS](/getting-started/About-MiniOS).

Use [Instalador do MiniOS](/installing-minios/MiniOS-Installer) somente quando quiser deliberadamente fazer essa conversão e a imagem escolhida oferecer suporte à implantação nativa.

## Para mais detalhes

- [Menus de inicialização](/preparing-and-customizing/Customizing-the-Boot-Menu) explica como navegar pelo menu e editar temporariamente uma entrada.
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence) explica os modos de armazenamento, a criação, o redimensionamento e a remoção de sessões.
- [Parâmetros de inicialização](/reference/Boot-Parameters) é a referência completa da linha de comando.
- [Descoberta do sistema no initrd](/reference/boot-process/System-Discovery), [carregamento de módulos](/reference/boot-process/Module-Loading) e [persistência](/reference/boot-process/Persistence-Internals) explicam como os grupos de parâmetros relacionados são processados durante a inicialização.
