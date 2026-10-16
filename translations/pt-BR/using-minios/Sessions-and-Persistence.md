---
updated: 2026-10-15
program_commits:
    minios-session-manager: 120fdba6a6fe1838f1aaa3c153aafc080829798d
    minios-tools: bc6de2e7649ef7629fe6491b906de2290e394fd0
---

# Sessões e persistência

As sessões MiniOS mantêm as alterações feitas no sistema em execução após as reinicializações. Cada sessão é um diretório numerado em`minios/changes/`; os módulos MiniOS somente leitura permanecem inalterados, e a sessão selecionada fornece a camada gravável do sistema de arquivos union.

Use o Gerenciador de sessões MiniOS em um sistema MiniOS em execução:

```bash
minios-session-manager
```

A ferramenta equivalente de linha de comando é `minios-session`. Todos os comandos, exceto help, exigem privilégios administrativos; execute os exemplos com `sudo`.

Esses fluxos de trabalho com sessões numeradas não estão disponíveis quando uma imagem **Ventoy** está selecionada. Essa imagem fornece um ambiente persistente selecionado em Ventoy, sem metadados de sessão MiniOS. Inicializações comuns de Ventoy sem um backend de plugin selecionado mantêm sessões MiniOS; consulte [Ventoy](/installing-minios/installation-tools/Ventoy).

## Modos de sessão

| Modo | Armazenamento | Principais restrições | Camada LUKS2 MiniOS |
|------|---------|------------------|--------------------|
| `native` | As alterações são armazenadas diretamente no diretório da sessão | Requer um sistema de arquivos gravável que preserve os metadados e as operações do Linux que MiniOS verifica. A capacidade depende do espaço livre no armazenamento subjacente; `perchsize` não se aplica. | Não |
| `dynfilefs` | ext4 expansível `virtual.dat` com suporte de arquivos de segmento format-400 | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. A carga de dados é alocada sob demanda, mas o índice de mapeamento cresce de acordo com a capacidade lógica declarada. | Sim |
| `dynblk` | Sistema de arquivos ext4 alocado sob demanda em um dispositivo de bloco do kernel, com suporte de arquivos `volumeNNN.db` | Requer a CLI DynBlk, o módulo do kernel e suporte no initrd. Por padrão, o tamanho criado na inicialização é de até 16 GiB; o limite máximo é informado por `dynblk limits`. Os mapeamentos armazenados em disco usam um cache de metadados limitado. | Sim |
| `vmdk` | Sistema de arquivos ext4 alocado sob demanda em um VMDK esparso dividido padrão, exposto pelo driver DynBlk | Usa `volume.vmdk` e `volume-sNNN.vmdk`. Sem compactação. Requer `vmdk-session-v1` no marcador de suporte do initrd em execução. O mesmo padrão manual de 16 GiB que DynBlk; consulte `dynblk limits --format vmdk` para ver os limites. | Sim |
| `raw` | Um único arquivo `changes.img` contendo ext4 | Capacidade lógica fixa, com expansão somente explícita. Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT; no FAT32, o limite é 4000 MiB. | Sim |
| `squashfs` | Snapshot compactado em `changes.sb`; a camada gravável superior em tempo de execução é reconstruída em RAM | `perchsize` não se aplica. Snapshots existentes podem ser restaurados de mídias graváveis compatíveis; para salvar exatamente, é necessário um armazenamento de persistência compatível com POSIX. | Não |

Raw, DynFileFS, DynBlk e VMDK podem opcionalmente incluir uma camada de criptografia LUKS2. O backend de armazenamento continua sendo o modo da sessão, e os metadados da sessão registram a criptografia separadamente. DynFileFS e raw criados com `minios-session` têm como padrão 4000 MiB; DynBlk e VMDK têm como padrão 16 GiB. Os tamanhos são alocados em MiB; sufixos `GB` e `TB` convertem para 1000 e 1.000.000 MiB. O tamanho de raw é limitado a 4000 MiB em FAT32, com ou sem criptografia. Os dados de carga de DynFileFS crescem sob demanda, mas o índice format-400 é dimensionado para toda a capacidade lógica e consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento subjacente por GiB. DynBlk mantém as tabelas de mapeamento em disco e um cache de metadados limitado em RAM, com padrão de 1 MiB, em vez de uma porcentagem de RAM. Seus vetores de extensões/arquivos e diretórios crescem de acordo com as partes declaradas, enquanto o preenchimento da carga de dados não exige um mapa inteiro residente na memória. Consulte o limite de capacidade da instalação com `dynblk limits --format dynblk`. As gravações reais continuam limitadas pelo espaço livre no sistema de arquivos subjacente e pela disponibilidade de recursos do backend. As operações de redimensionamento do contêiner só podem aumentar uma sessão; não há suporte para redução.

O modo nativo é a opção mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não puder representar metadados do Linux.
Use DynBlk quando precisar de um dispositivo de bloco real do kernel com arquivos de suporte alocados sob demanda; o driver pode manter vários volumes DynBlk independentes conectados ao mesmo tempo, e o Gerenciador de sessões usa o caminho do dispositivo retornado pelo driver, em vez de presumir que `/dev/dynblk0` esteja livre. DynBlk e VMDK não estão disponíveis quando o UEFI Secure Boot está habilitado, pois MiniOS não assina o módulo externo do kernel DynBlk. Por isso, o instalador e o Gerenciador de sessões ocultam esses modos e rejeitam solicitações explícitas de criação antes de tentar carregar o módulo.
Use raw quando for necessária uma alocação fixa, adicione LUKS2 se a sessão precisar ser criptografada e use SquashFS para obter um snapshot compactado exato.

Execute os comandos a seguir para verificar o sistema de arquivos de persistência real e os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Não é possível criar sessões em mídias somente leitura. O initrd pode ler e ativar um snapshot SquashFS existente, armazenado em FAT, exFAT ou NTFS gravável, pois extrai o snapshot para uma camada superior ext4 temporária. A criação ou o salvamento exato de um snapshot é diferente: o armazenamento de persistência precisa oferecer suporte aos metadados POSIX necessários e à publicação privada e durável. A árvore de trabalho de captura exata usa RAM confiável quando disponível, com uma alternativa de área de trabalho em disco se RAM for insuficiente.

## Seleção na inicialização

Qualquer parâmetro de persistência reconhecido habilita o tratamento de persistência. Os menus de inicialização MiniOS normalmente oferecem opções para retomar, criar, selecionar e iniciar sem persistência. A descrição canônica do seletor, da compatibilidade, da alternativa e da semântica de ativação está em [Persistência no initrd](/reference/boot-process/Persistence-Internals).

| Parâmetro | Significado |
|-----------|---------|
| `perch` | Usa o caminho legado de retomada por melhor esforço. Tenta usar o padrão definido nos metadados, mas não cria uma substituição quando nenhum padrão é utilizável. |
| `perchdir=resume` | Retoma a sessão padrão dos metadados e, se ela estiver ausente ou for incompatível, permite que o initrd crie uma substituição nova e compatível. Esse é o comportamento atual da opção de retomada no menu de inicialização. |
| `perchdir=setup` | Abre o seletor interativo de backend de persistência e, em seguida, aloca uma nova sessão numerada. Esse é o comportamento atual de **Iniciar nova sessão**. |
| `perchdir=new` | Aloca diretamente uma nova sessão numerada usando as configurações de backend, criptografia, compactação e tamanho solicitadas ou padrão, sem abrir o seletor de backend. |
| `perchdir=ask` | Seleciona uma sessão existente; se o armazenamento estiver vazio, inicia automaticamente o mesmo fluxo de configuração usado por `perchdir=setup`. |
| `perchdir=<id>` | Seleciona diretamente essa sessão numerada. |
| `perchdir=<device/path>` | Usa um local de persistência em um dispositivo, incluindo formatos `/dev/...` e `label:...` tratados pelo initrd. |
| `perchmode=<mode>` | Defina `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw` ou `squashfs`. |
| `perchencrypt=luks` | Criptografa com LUKS2 uma sessão Raw, DynFileFS, DynBlk ou VMDK recém-criada. A criptografia das sessões existentes é determinada apenas pelos metadados. |
| `perchcomp=<codec>` | Seleciona a compactação do backend DynBlk para uma nova sessão DynBlk. A compactação é forçada para `none` quando DynBlk é encapsulado em LUKS2. |
| `perchsize=<size>` | Define um tamanho novo ou maior para o contêiner; valores sem sufixo são alocados em MiB, e os sufixos `MB`, `GB` e `TB` são aceitos. |

Se nenhum modo for especificado para uma nova sessão, a inicialização usa o modo nativo. Em FAT32/NTFS/exFAT, ou quando as verificações do sistema de arquivos nativo falham, a inicialização prefere DynBlk quando o respectivo auxiliar está disponível e o Secure Boot permite; caso contrário, usa DynFileFS. Uma falha de ativação não converte silenciosamente uma sessão existente. O tamanho padrão de um novo contêiner raw é 4000 MiB. Sessões de inicialização novas DynFileFS, DynBlk e VMDK, sem `perchsize`, usam até 16 GiB; quando resta menos espaço de armazenamento subjacente após a reserva de segurança, o tamanho automático é reduzido. DynFileFS também considera a sobrecarga do índice e o limite RAM. A expansão explícita de DynBlk respeita o limite do backend instalado, consultado com `dynblk limits --format dynblk`. Com o Secure Boot habilitado, o initrd não oferece DynBlk/VMDK e considera indisponível uma sessão DynBlk/VMDK selecionada explicitamente ou retomada, em vez de tentar carregar o módulo não assinado.
Sessões SquashFS podem ser capturadas no sistema em execução com o Gerenciador de sessões MiniOS ou `minios-session create squashfs`. A configuração do initrd cria apenas metadados da sessão de geração zero e mantém a camada superior gravável em RAM. O sistema em execução cria o primeiro snapshot `changes.sb` sob demanda ou no desligamento.

Ao retomar uma sessão, MiniOS verifica a versão, a edição, o sistema de arquivos union e o modo registrados. O valor literal `perchdir=resume` pode criar uma nova sessão em vez de usar uma sessão padrão ausente ou incompatível. Uma solicitação simples de `perch`, uma seleção numérica direta e outras solicitações legadas de retomada não criam automaticamente essa substituição.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível. Se a seleção ou ativação ainda assim falhar, a inicialização normalmente prossegue com uma camada superior RAM e um aviso de persistência.

O armazenamento de sessões tem o seguinte formato:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra os IDs padrão e em execução, além do modo, da versão, da edição, do sistema de arquivos union, do tamanho, do estado e das configurações específicas do modo de cada sessão.
Esses são metadados persistentes confirmados pela implementação de inicialização, mas não constituem, por si só, uma prova do estado atual em tempo de execução. Não edite esses metadados nem mova dados de sessões numeradas enquanto uma sessão estiver montada; use o Gerenciador de sessões MiniOS ou `minios-session`.

## Sessões ativas e em execução

Estes termos descrevem estados diferentes:

- A sessão **ativa** é a selecionada por padrão para a próxima inicialização.
- Conceitualmente, a sessão **em execução** é aquela cuja camada gravável fornece a persistência usada pela inicialização atual.

O campo persistente `running=` registra essa relação prevista. Uma falha, um problema ao criar o sistema de arquivos union, uma cópia do armazenamento ou uma interrupção no desligamento podem deixá-lo desatualizado, mesmo quando a inicialização atual está usando RAM ou outra sessão. Por isso, operações como salvar SquashFS exigem o estado protegido da inicialização atual, vinculado ao ID de inicialização e mantido pelo initrd, além de uma camada superior montada e verificada; elas não confiam apenas em `running=`. Consulte [Estado ativo, em execução e da inicialização atual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Ativar uma sessão altera a próxima inicialização, mas não troca o sistema de arquivos union da inicialização atual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

A sessão ativa não pode ser excluída nem convertida no próprio local. Normalmente, uma sessão em execução não pode ser excluída, exportada, copiada, redimensionada nem convertida. A limpeza também protege os dois IDs.

<a id="command-reference"></a>

## Referência de comandos

Listar sessões e inspecionar o armazenamento:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Criar sessões:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create dynblk 16GB
sudo minios-session create vmdk 16GB
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sem um modo seleciona o nativo. A criação de SquashFS captura as alterações ativas no momento e não tem tamanho fixo. A política de desligamento usa `shutdown` como padrão; o salvamento periódico fica desativado por padrão.

Salvar uma sessão SquashFS em execução ou uma sessão de persistência compatível que a inicialização atual copiou para RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Para SquashFS, `save` recria o snapshot atual. Para uma sessão Raw baseada em RAM, DynFileFS, DynBlk, VMDK ou SquashFS, grava a cópia RAM de volta no armazenamento de persistência original. `--as-new` preserva a sessão armazenada original e publica o estado RAM com um novo número de sessão. A mídia original ainda precisa estar presente, ser gravável e corresponder à identidade do sistema de arquivos registrada na inicialização.

Configure separadamente o salvamento automático de SquashFS:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Os intervalos periódicos válidos são `30`, `60`, `120`, `240`, e `480` minutos; `0` desativa o salvamento periódico. As configurações de desligamento e de periodicidade são independentes.

Exportar e importar arquivos `.tar.zst` compactados:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Somente `.tar.zst` são aceitos para importação. Os caminhos e os arquivos do pacote são validados, e a extração tem limites. `--auto-convert` seleciona um modo compatível com o sistema de arquivos atual. `--force-mode <mode>` seleciona explicitamente um modo disponível. Não há suporte para exportação, cópia/clonagem genérica nem conversão de sessões SquashFS; use o fluxo de salvamento e siga [Fazer backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) em vez de reconstruir ou copiar manualmente os componentes internos de sessões ativas.

Copiar ou converter uma sessão:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy` é uma cópia lógica do sistema de arquivos e sempre atribui um novo ID de sessão. Pode alterar o backend, a capacidade ou a criptografia e cria novas identidades ext4 e LUKS. `clone` copia fisicamente um backend desconectado e preserva o cabeçalho LUKS, os keyslots, o UUID LUKS e o UUID ext4. `convert` substitui a origem por padrão; use `--new-session` para preservar a origem. O tamanho só se aplica a um destino em contêiner.

Aumentar, excluir ou limpar sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento é compatível com sessões DynFileFS, DynBlk, VMDK e raw, inclusive as criptografadas, e exige um tamanho maior que o atual. O redimensionamento de DynBlk aumenta primeiro o dispositivo de bloco virtual e, em seguida, expande o sistema de arquivos ext4; ele não pré-aloca a nova capacidade virtual. Por padrão, a limpeza remove sessões com mais de 30 dias.

Todos os comandos aceitam `--json`, e é possível selecionar outro armazenamento de sessões com `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Gravação de volta de sessão baseada em RAM

Quando o initrd copia uma sessão de persistência compatível para RAM com `perchtoram`, a sessão em execução deixa de gravar diretamente no backend original. MiniOS registra o armazenamento original pelo UUID do sistema de arquivos e pelo número da sessão, em vez de depender do nome de um `/dev/sdX`. O Gerenciador de sessões mantém essa sessão RAM visível, mesmo que o dispositivo original esteja temporariamente desconectado.

Se o armazenamento original estiver presente, gravável e inalterado, **Salvar agora** grava o estado RAM de volta na sessão original. **Salvar no armazenamento como nova sessão** mantém a sessão de origem armazenada intacta e publica o estado RAM como uma nova sessão numerada. Os comandos equivalentes da CLI são `minios-session save <id>` e `minios-session save <id> --as-new`. O salvamento informa o progresso da cópia e pode ser cancelado antes da etapa de publicação; depois de iniciada, a publicação é concluída atomicamente.

Se a mídia original estiver ausente, for somente leitura, não corresponder mais à identidade registrada na inicialização ou a sessão original tiver sido alterada de forma independente, a gravação de volta será recusada para evitar o uso de outro dispositivo com o mesmo nome. Reconecte a mídia original e tente novamente ou use a opção de salvar como nova sessão se a sessão original tiver divergido. Sessões de diretório nativas não são copiadas por `perchtoram`: uma solicitação RAM bem-sucedida inicia um novo contêiner vazio, sem importar dados nativos. Use `perchtoram=off` para manter essa sessão nativa. Durante a redefinição de uma sessão nativa, a cópia fica desativada nessa inicialização para preservar os dados mantidos.

## Redefinir uma sessão incompatível

O menu **Escolher uma sessão salva** da inicialização permite redefinir uma sessão incompatível antes da ativação. **Redefinir, manter configurações** remove os softwares instalados pelo sistema, mantendo as configurações e os dados do sistema. **Redefinir, manter dados** também redefine as configurações comuns do sistema. Ambas as opções preservam `/home` e `/root`, incluindo configurações pessoais e aplicativos instalados no diretório pessoal, contas, senhas e chaves. Arquivos instalados manualmente em outros locais que não estejam listados também podem permanecer; isso não é uma remoção completa dos softwares.

A redefinição exige espaço livre para uma segunda cópia dos dados mantidos. Se a substituição do diretório falhar ou for interrompida, ela será revertida ou recuperada na próxima montagem. A retomada automática nunca redefine uma sessão sem aviso. Para SquashFS, a redefinição afeta apenas a camada RAM restaurada até que um salvamento bem-sucedido publique o novo snapshot e suas informações de compatibilidade. Faça backup dos dados importantes antes de redefinir; consulte [Detalhes internos da persistência](/reference/boot-process/Persistence-Internals).

## Comportamento de salvamento de SquashFS

Uma sessão SquashFS é descompactada em RAM para formar a camada gravável em execução. O salvamento recria e valida um snapshot exato e, em seguida, substitui atomicamente `changes.sb`.
Não é mantida nenhuma versão para reversão. A opção Salvar agora está disponível no ícone da bandeja do sistema, no Gerenciador de sessões MiniOS ou `minios-session save` independentemente da política automática.

A cada salvamento, MiniOS copia uma visualização estável da árvore modificada para um armazenamento RAM privado, quando há memória disponível. A compactação grava **uma** imagem em um diretório privado dentro da sessão numerada. Só depois de verificar o conteúdo do sistema de arquivos, o resumo, a identidade e a sincronização persistente, o processo de salvamento substitui `changes.sb`. Não há uma segunda imagem compactada completa em RAM nem uma segunda gravação dessa imagem no dispositivo de persistência. Se não houver RAM suficiente para a árvore, somente essa árvore de trabalho será armazenada em disco; ainda será necessária uma gravação do candidato compactado. Consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para ver as políticas de gravação de cache e logs.

Os diagnósticos de inicialização de uma sessão persistente SquashFS são armazenados nos diretórios `boot-logs/minios/` e `boot-logs/live/` correspondentes. Eles não dependem de um snapshot de desligamento bem-sucedido e continuam disponíveis mesmo quando não foi possível salvar as últimas alterações na camada superior RAM. O armazenamento de apoio ainda precisa permitir gravações; os arquivos de journal comuns podem ser temporários se `LIVE_LOG_STORAGE=volatile` estiver selecionado.

O salvamento no desligamento é implementado pelo gatilho de desligamento do núcleo MiniOS e pelo backend `minios-squashfs-save`; portanto, não depende de o Gerenciador de sessões MiniOS estar aberto ou instalado. O salvamento periódico é verificado a cada 30 minutos por um timer do systemd ou por um processo SysV; ambos chamam o mesmo backend de salvamento automático. A recriação do snapshot consome CPU e grava o snapshot completo; recomenda-se usar intervalos de uma hora ou mais.

Durante a operação RAM baseada em SquashFS, um snapshot SquashFS recém-capturado e ativado pode assumir o destino de salvamento em execução. Após essa transferência, é possível remover o snapshot antigo em execução sem reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Essa exceção se aplica somente a uma transferência SquashFS válida na inicialização atual. Os demais modos de persistência em execução continuam protegidos contra exclusão.

## Criptografia

O LUKS2 é uma camada opcional de criptografia sobre o armazenamento de sessão Raw, DynFileFS, DynBlk ou VMDK; não é um modo de sessão separado. Ele só está disponível quando `/run/initramfs/etc/minios-initramfs-crypt` contém `luks-layer-v1` e as ferramentas e os recursos do backend selecionado estão disponíveis. A compactação do backend DynBlk é desativada quando o LUKS2 é selecionado.

Na criação interativa de LUKS, a frase secreta é solicitada duas vezes. As operações que leem ou criam dados LUKS podem recebê-la pela entrada padrão com `--password-stdin`. As frases secretas não são incluídas nos argumentos do comando nem nos metadados da sessão. Na inicialização, o initrd solicita a frase secreta no console. Três tentativas recusadas interrompem a inicialização com erro fatal; MiniOS não continua com texto simples, RAM, outro backend ou uma sessão substituta para a mesma solicitação.

Para uma sessão Raw, DynFileFS, DynBlk ou VMDK criptografada, inativa e desconectada, o Gerenciador de sessões oferece a opção **Alterar frase secreta...**. O comando equivalente na CLI é:

```bash
sudo minios-session change-passphrase <id>
```

Ele solicita a frase secreta atual, a nova frase secreta e a confirmação. Com `--password-stdin`, informe essas três linhas nessa ordem. O keyslot selecionado é substituído sem reformatar nem criptografar novamente todos os arquivos. Sessões ativas, em execução ou montadas precisam ser desconectadas primeiro; keyslots LUKS adicionais gerenciados fora do Gerenciador de sessões não são alterados.

As exportações criptografadas contêm os arquivos lógicos da sessão descriptografados, não o backend criptografado. Importar, copiar ou converter para LUKS cria um novo backend criptografado com novas identidades.

## Montar uma sessão inativa

O Gerenciador de sessões pode montar uma sessão Raw, DynFileFS, DynBlk ou VMDK inativa e parada com acesso de leitura e gravação, sem torná-la a sessão padrão de inicialização. Clique com o botão direito na sessão e selecione **Montar sessão**; para sessões criptografadas, será solicitada a frase secreta do LUKS. É possível montar ao mesmo tempo várias sessões com IDs diferentes. **Abrir pasta montada** abre o sistema de arquivos anexado, enquanto **Abrir pasta da sessão** abre o diretório numerado que contém os arquivos de suporte.

Fechar o Gerenciador de sessões não desmonta uma unidade montada pela interface gráfica. Abra o aplicativo novamente para vê-la e selecione **Desmontar sessão**. Se a desmontagem estiver bloqueada, MiniOS mantém conectado o daemon de suporte, o dispositivo de loop ou o dispositivo DynBlk, em vez de desconectar o armazenamento por baixo de um sistema de arquivos em uso.

A CLI independente mantém a montagem ativa até que a entrada padrão seja fechada ou que Ctrl+C seja recebido:

```bash
sudo minios-session mount <id>
```

O comando recusa a sessão ativa ou em execução e nunca formata um sistema de arquivos existente caso a montagem falhe.

## Backups e sessões com falha

Para sessões nativas, DynFileFS, DynBlk, VMDK e Raw, inclusive as criptografadas, use `export` para fazer backups lógicos, em vez de copiar o diretório de uma sessão montada. Guarde o arquivo resultante em outro dispositivo e verifique se ele pode ser importado antes de depender dele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso.
Para SquashFS e procedimentos de backup de dispositivos inteiros, consulte [Fazendo backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se uma sessão falhar após o armazenamento ficar cheio, uma gravação for interrompida ou sessões vazias forem criadas repetidamente, pare de modificar o armazenamento afetado. Se possível, primeiro exporte uma sessão legível que não esteja em execução e, em seguida, siga as instruções de [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos do contêiner são verificados antes da ativação para gravação. Falhas graves na verificação do sistema de arquivos preservam o contêiner para recuperação, em vez de montá-lo com acesso de gravação. SquashFS detecta um estado anterior encerrado incorretamente e restaura o último snapshot salvo com sucesso. Exclua sessões somente pelo Gerenciador de sessões MiniOS ou `minios-session delete`; não remova os diretórios das sessões manualmente.

## Devolver espaço não utilizado do armazenamento DynFileFS, DynBlk e VMDK

No Gerenciador de sessões, clique com o botão direito em uma sessão DynFileFS, DynBlk ou VMDK e selecione **Liberar espaço...**. A caixa de diálogo funciona com sessões compatíveis em execução ou inativas e também reutiliza sessões já montadas pelo Gerenciador de sessões. Em uma sessão sem criptografia, MiniOS executa o FITRIM no sistema de arquivos ext4 interno e, em seguida, solicita ao backend responsável que devolva o espaço de suporte reconhecido como livre. Sessões desconectadas são anexadas temporariamente e liberadas somente depois que o sistema de arquivos é desmontado corretamente.

A recuperação de DynFileFS requer DynFileFS 4.6.0 ou posterior. Se o pacote foi atualizado enquanto um daemon DynFileFS antigo continua ativo, reinicie no backend atualizado antes de recuperar espaço da sessão em execução.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

A caixa de seleção de compactação fica **desmarcada por padrão**, inclusive no exFAT. Não há
alternativa de compactação automática. Em sessões criptografadas, só é recuperado o espaço já
reconhecido como livre pelo backend; essa operação não habilita o discard pelo LUKS nem
revela o padrão de alocação. Erros do dispositivo e falhas no trim interrompem a operação.

### Comandos de driver de baixo nível

Com o backend VMDK DynBlk nativo ou dividido atual, descarte de grãos completos
torna sua localização reutilizável. Em um sistema de arquivos ext4 usado como base, os intervalos liberados
também podem ser removidos automaticamente com hole punching. No exFAT, a limpeza automática apenas trunca
as partes finais totalmente livres do arquivo. **A limpeza automática nunca move dados em uso.**

Use `fstrim` no sistema de arquivos interno montado (não na raiz combinada AUFS/OverlayFS
 para informar os blocos excluídos e, em seguida, `dynblk reclaim /dev/dynblkN --execute` para
fazer a limpeza sem mover dados. Selecione o dispositivo da sessão em uso, não presuma um índice.
Para solicitar manualmente a compactação no local, que exige muitas gravações, adicione `--compact`.
Isso funciona sem converter a imagem nem alterar o tamanho do sistema de arquivos virtual;
outras operações de leitura e gravação podem ocorrer entre as etapas de recuperação. Esse processo não é uma alternativa automática.
O comando opcional `--scan-zeroes`lê os grãos mapeados e não vem ativado por padrão.

Esses comandos também estão disponíveis na CLI do initrd recriado DynBlk. A compactação automática na
inicialização não está ativada. As sessões criptografadas mantêm a política de discard existente;
as ferramentas não ativam silenciosamente o repasse de discard do dm-crypt.
Anexos somente leitura ou `cache=unsafe` não podem ser recuperados. Os intervalos removidos informados
e os comprimentos truncados não correspondem ao espaço livre medido no sistema de arquivos.

## Fluxos de trabalho de sessões VMDK

VMDK é um modo de sessão separado, não um novo codec de compactação. Criar, ativar,
redimensionar, exportar/importar, copiar, clonar e converter usam os mesmos comandos do Session Manager
que os outros modos de contêiner:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Os arquivos de sessão contêm arquivos lógicos e metadados, não um anexo VMDK
externo arbitrário. As sessões VMDK gerenciadas usam o descritor `volume.vmdk` canônico
e todos os arquivos `volume-sNNN.vmdk` relacionados. Não renomeie as partes nem copie uma imagem em uso
por fora do driver. Alternar entre DynBlk nativo e VMDK exige uma cópia/conversão explícita; alterar
 manualmente o `session_mode` não é uma conversão.

O instalador só oferece VMDK quando há suporte no ambiente de execução e rejeita imagens de origem
cujos initrds copiados não têm o recurso `vmdk-session-v1`. Atualize a CLI,
o driver, as ferramentas de sessão e os scripts de inicialização em conjunto antes de criar sessões VMDK.
