# Backup e recuperação

Nenhum backup único protege todas as partes de um sistema MiniOS. Arquivos pessoais, configurações, sessões persistentes, módulos e o dispositivo de armazenamento possuem procedimentos de restauração diferentes. Mantenha mais de uma cópia, guarde pelo menos uma cópia em outro dispositivo e teste a restauração antes que seja realmente necessária.

## Use uma estratégia de backup em camadas

Um conjunto de backup prático possui as seguintes camadas:

1. Faça backup frequente de arquivos pessoais insubstituíveis, de forma independente da sessão do MiniOS.
2. Registre as configurações e escolhas de módulos sempre que forem alteradas.
3. Exporte cada sessão saudável e não ativa em um modo suportado.
4. Mantenha uma cópia offline de dados que o Session Manager não consegue exportar.
5. Crie uma imagem completa do dispositivo de tempos em tempos, após desligar a origem e garantir que não está mais recebendo gravações.

Use destinos versionados em vez de substituir o último backup conhecido como bom. Registre a versão do MiniOS, edição, arquitetura, data do backup, modo da sessão e status de criptografia junto com cada backup. Uma imagem completa do dispositivo é uma última camada de segurança útil, mas não deve ser a única cópia dos arquivos pessoais.

## Faça backup dos dados pessoais primeiro

Sempre que possível, faça backup do diretório home completo, incluindo as configurações ocultas dos aplicativos. No mínimo, inclua trabalhos salvos em Desktop, Documents, Downloads, Music, Pictures, Public, Templates e Videos, além de qualquer diretório de projetos ou dados criado fora desses locais padrão.

O suporte a user-media do MiniOS pode vincular ou montar os diretórios padrão do usuário em um local separado no meio gravável do MiniOS. O caminho configurado por padrão é `/minios/userdata`, mas `LIVE_USER_DIRS_PATH` permite selecionar outro caminho seguro. Os dados ali ficam fora da camada normal da sessão e precisam ser salvos separadamente. Verifique os alvos reais de links ou pontos de montagem, em vez de assumir que exportar uma sessão inclui esses dados. Faça backup também dos arquivos armazenados intencionalmente em outros volumes montados.

Feche aplicativos que gravam bancos de dados, caixas de e-mail, perfis de navegador ou imagens de máquinas virtuais antes de copiar seus dados. Para dados importantes, prefira um método de backup que preserve propriedade, permissões, links, atributos estendidos e timestamps, quando o destino suportar esses recursos.

## Faça backup das configurações

Preserve as configurações que controlam os próximos boots, não apenas os arquivos vistos no sistema de arquivos root atual. Locais relevantes podem incluir:

- `minios/config.conf` e `minios/config.conf.d/` em mídias MiniOS graváveis.
- `/etc/live/config.conf` e `/etc/live/config.conf.d/` em um sistema persistente ou nativo.
- Hooks revisados, preseeds, alterações no menu de boot e uma anotação dos parâmetros de boot personalizados.
- Configurações de usuário no diretório home e configurações de sistema selecionadas em `/etc` para uma instalação nativa.

As configurações podem conter hashes de senhas, credenciais de rede, chaves e configurações de serviços. Proteja o backup dessas informações de acordo. Não armazene frases secretas em texto simples junto ao backup de uma sessão criptografada. Veja [Reforço de segurança](/administration/Security-Hardening.md) para orientações sobre criptografia e manipulação de mídias.

## Faça backup dos módulos

Faça backup dos arquivos `.sb` personalizados do armazenamento durável de módulos e registre sua ordem, origem, versão do MiniOS e finalidade. Não deduza o próximo boot apenas pelo que está visível no sistema de arquivos root atual:

- **Em Execução Agora** é o conjunto de módulos que compõe o sistema ao vivo atual.
- **Próximo Boot** é o conjunto de módulos selecionado pelas regras de boot atuais.

Um módulo ativado apenas para a sessão atual pode não estar presente no armazenamento durável. Um módulo adicionado para o próximo boot pode não estar ativo agora. Revise e registre ambos os estados antes do backup. Filtros de boot como `load`, `noload` e `bext` também podem alterar o conjunto efetivo do próximo boot. Veja [Gerenciador de Módulos](/administration/Module-Manager.md).

## Exporte sessões persistentes

Use o [Gerenciamento de Sessões](/configuration/Session-Management.md) para identificar a sessão Em Execução Agora e a sessão selecionada para o próximo boot. Ativar uma sessão diferente altera apenas o próximo boot; isso não torna a sessão atual segura para exportação. Reinicie em outra sessão ou inicialize sem persistência antes de fazer backup da sessão que estava em execução.

O Session Manager pode exportar uma sessão `native`, `dynfilefs`, `raw` ou `luks` não ativa como um arquivo `.tar.zst` compactado. A exportação é um backup lógico dos arquivos da sessão, não necessariamente uma cópia bit a bit do seu contêiner de armazenamento. Guarde o arquivo exportado em outro dispositivo. A importação cria uma nova sessão numerada; inspecione e ative-a explicitamente somente após validação.

Uma exportação LUKS contém os dados lógicos da sessão descriptografados, não o contêiner `changes.luks` criptografado. Criptografe o destino do backup ou o arquivo exportado por um método separado e revisado se os dados exportados precisarem permanecer confidenciais. Importar para LUKS cria um novo contêiner criptografado e exige uma nova senha de destino.

Não copie manualmente um diretório de sessão montado. A sessão pode estar sendo alterada e um sistema de arquivos baseado em contêiner pode não ser representado por um conjunto consistente de arquivos enquanto estiver ativo.

## Manipule sessões SquashFS offline

Antes de fazer backup de uma sessão SquashFS em execução, use **Salvar Agora** e aguarde a conclusão do salvamento e validação. O salvamento reconstrói `changes.sb` e substitui atomicamente o snapshot anterior; não mantém uma geração de rollback. Em seguida, desligue o sistema corretamente.

A implementação atual do Session Manager não permite exportar ou copiar sessões SquashFS. Após salvar, inicialize sem persistência ou use outro sistema Linux e copie a sessão SquashFS do armazenamento de sessões inativo. Preserve o diretório numerado completo da sessão e os metadados do armazenamento de sessões juntos. Não substitua nem renumere entradas em um armazenamento `minios/changes` ativo. Veja [Recuperação de boot](/administration/Boot-Recovery.md) antes de alterar estruturas de boot ou disco durante uma restauração.

## Preserve todos os segmentos DynFileFS

Uma sessão DynFileFS é um contêiner lógico dividido em um conjunto completo de arquivos de apoio. Uma cópia offline deve incluir `changes.dat` e todos os segmentos numerados, como `changes.dat.0`, `changes.dat.1` e segmentos posteriores. Copiar apenas o primeiro arquivo não gera um backup utilizável. Não crie um segmento ausente nem tente reparar a única cópia.

A exportação normal pelo Session Manager evita essa preocupação em nível de contêiner ao exportar os arquivos lógicos da sessão. Para cópias interrompidas, segmentos ausentes, mídia cheia e reparo de sistema de arquivos, siga as orientações em [Recuperação DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md).

## Crie uma imagem completa do dispositivo

A [Drive Utility](/installation/tools/Drive-Utility.md) pode usar **Criar Imagem** para ler todo o dispositivo em uma imagem bruta, opcionalmente com compressão. Isso captura a tabela de partições, arquivos de boot, módulos, configurações, armazenamento de sessões, dados user-media e blocos não utilizados conforme estão no dispositivo de origem. O arquivo de imagem, portanto, exige espaço de destino adequado e pode conter dados e segredos excluídos recuperáveis.

Crie a imagem offline. Desligue o MiniOS e conecte o meio de origem a outro sistema em funcionamento, ou inicialize a partir de outro dispositivo. Certifique-se de que nenhuma partição de origem esteja montada e que não haja persistência, swap, banco de dados ou serviço em segundo plano gravando nela. O Drive Utility normalmente oculta dispositivos montados, mas exibir um dispositivo na interface não garante uma imagem bruta consistente.

Verifique a origem pelo modelo, tamanho e nome do dispositivo. Salve a imagem em um dispositivo físico diferente, nunca em um sistema de arquivos no próprio dispositivo de origem. Para restauração, **Gravar Imagem** faz uma sobrescrita bruta do dispositivo de destino selecionado. Confirme o destino com o mesmo cuidado; todos os dados existentes no destino serão perdidos. Use um destino pelo menos do mesmo tamanho da origem, a menos que a imagem tenha sido preparada explicitamente para um dispositivo menor.

## Faça backup de instalações nativas

Uma instalação nativa não utiliza uma sessão ao vivo persistente como seu sistema de arquivos root, portanto a exportação pelo Session Manager não é um backup completo do sistema nativo. Faça backup dos diretórios home dos usuários, configurações de sistema selecionadas, dados de aplicativos, arquivos mantidos localmente e credenciais de recuperação usando um método de backup que reconheça o sistema de arquivos. Registre a versão do MiniOS, layout de partições, seleção de pacotes instalados, modo de boot e quaisquer módulos ou kernels personalizados.

Para recuperação bare-metal, crie uma imagem offline do disco inteiro ou utilize um produto de backup testado que suporte os sistemas de arquivos e layout de partições nativos. Mantenha um backup separado em nível de arquivos para que arquivos individuais possam ser restaurados sem sobrescrever o disco. Veja [Recuperação de boot](/administration/Boot-Recovery.md) para diagnóstico de arquivos de boot e bootloader.

## Valide os backups e teste as restaurações

Uma cópia concluída ainda não é um backup comprovado. Para cada ciclo de backup:

1. Confirme que o backup está em outro dispositivo e tem a data e o tamanho esperados.
2. Registre e depois compare um checksum criptográfico para arquivos compactados e imagens de disco.
3. Abra uma amostra de arquivos pessoais, incluindo pelo menos um arquivo grande e um arquivo de cada conjunto importante de dados de aplicativos.
4. Importe um arquivo de sessão como uma nova sessão inativa e inspecione seus arquivos. Teste o boot somente após preservar a seleção de sessão conhecida como boa.
5. Verifique se uma cópia offline DynFileFS contém toda a sequência de segmentos.
6. Restaure uma imagem completa do dispositivo apenas para um dispositivo descartável ou reserva de tamanho adequado, depois teste tanto o boot quanto o acesso aos dados importantes.
7. Teste a restauração de arquivos nativos para um local separado e verifique permissões, propriedade, links e leitura por aplicativos.

Realize testes de restauração após alterar o modo de persistência, criptografia, layout de partições, versão do MiniOS ou software de backup. Mantenha o último backup conhecido como bom até que o substituto tenha passado no teste de restauração. Para diagnósticos mais amplos, veja [Recuperação de boot](/administration/Boot-Recovery.md), [Recuperação DynFileFS e dynblk](/configuration/DynFileFS-Recovery.md) e [Reforço de segurança](/administration/Security-Hardening.md).
