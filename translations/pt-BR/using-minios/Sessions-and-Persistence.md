---
updated: 2026-10-06
program_commits:
    minios-session-manager: 3ec8b706ff661eb7f8f3fa5306a14f7fd7bc5cd3
    minios-tools: be508248395979c27cb8036a7d8cc69bdfc82c42
---

# Sessões e persistência

As sessões MiniOS mantêm as alterações feitas no sistema ativo mesmo após reinicializações. Cada sessão é um diretório numerado em `minios/changes/`; os módulos MiniOS somente leitura permanecem inalterados e a sessão selecionada fornece a camada gravável do sistema de arquivos em união.

Use o Gerenciador de sessões MiniOS a partir de um sistema MiniOS em execução:

```bash
minios-session-manager
```

A ferramenta equivalente na linha de comando é `minios-session`. Seus comandos de modificação exigem privilégios administrativos, então os exemplos abaixo usam `sudo`.

## Modos de sessão

| Modo | Armazenamento | Principais restrições | Camada MiniOS LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Alterações armazenadas diretamente no diretório da sessão | Requer um sistema de arquivos gravável que preserve os metadados e operações do Linux para os quais MiniOS faz sondagens. A capacidade segue o espaço livre de base; `perchsize` não se aplica. | Não |
| `dynfilefs` | ext4 expansível `virtual.dat`com suporte por arquivos de segmento format-400 | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. O payload é enxuto, mas o índice de mapeamento escala conforme a capacidade lógica declarada. | Sim |
| `dynblk` | Sistema de arquivos ext4 enxuto em um dispositivo de bloco do kernel suportado por `volumeNNN.db` arquivos | Requer o CLI DynBlk, módulo do kernel e capacidade initrd. O tamanho criado na inicialização é de até 16 GiB por padrão; o máximo é informado por `dynblk limits`. Os mapeamentos residentes em disco usam um cache de metadados limitado. | Sim |
| `vmdk` | Sistema de arquivos ext4 enxuto em um VMDK sparse padrão dividido, exposto pelo driver DynBlk | Utiliza `volume.vmdk` e `volume-sNNN.vmdk`. Sem compressão. Requer `vmdk-session-v1` no marcador de capacidade initrd em execução. Mesmo padrão manual de 16 GiB que DynBlk; consulte `dynblk limits --format vmdk` para limites. | Sim |
| `raw` | Arquivo único `changes.img` contendo ext4 | Capacidade lógica fixa, com crescimento apenas explícito. Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT; FAT32 é limitado a 4000 MiB. | Sim |
| `squashfs` | Snapshot compactado em `changes.sb`; camada superior gravável em tempo de execução é reconstruída em RAM | `perchsize` não se aplica. Snapshots existentes podem ser restaurados a partir de mídias graváveis compatíveis; o salvamento exato requer um armazenamento persistente compatível com POSIX. | Não |

Raw, DynFileFS, DynBlk e VMDK podem opcionalmente ter uma camada de criptografia LUKS2. O backend de armazenamento permanece o modo de sessão, e os metadados da sessão registram a criptografia separadamente. DynFileFS e raw criados com `minios-session` têm padrão de 4000 MiB; DynBlk e VMDK têm padrão de 16 GiB. Os valores de tamanho são alocados em MiB; `GB` e `TB` sufixos convertem para 1000 e 1.000.000 MiB. Raw é limitado a 4000 MiB no FAT32, criptografado ou não. Os dados do payload DynFileFS crescem sob demanda, mas seu índice format-400 é dimensionado para a capacidade lógica total e consome cerca de 2 MiB de RAM mais cerca de 2 MiB de armazenamento de base por GiB. DynBlk mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM, com padrão de 1 MiB em vez de uma porcentagem de RAM. Seus vetores de extensão/arquivo e diretórios crescem conforme as partes declaradas, enquanto o preenchimento do payload não exige um mapa residente completo. Consulte o limite de capacidade instalada com `dynblk limits --format dynblk`. As gravações reais permanecem limitadas pelo espaço livre do sistema de arquivos subjacente e pela admissão de recursos do backend. As operações de redimensionamento do container só permitem crescer a sessão; redução não é suportada.

O modo nativo é a opção mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não puder representar metadados do Linux.
Use DynBlk quando desejar um dispositivo de bloco real do kernel com arquivos de base thin; o driver pode manter vários volumes DynBlk independentes conectados ao mesmo tempo, e o Gerenciador de Sessão usa o caminho do dispositivo retornado pelo driver em vez de assumir que `/dev/dynblk0` está livre. DynBlk e VMDK não estão disponíveis enquanto o UEFI Secure Boot estiver ativado porque MiniOS não assina o módulo externo do kernel DynBlk. O instalador e o Gerenciador de Sessão, portanto, ocultam esses modos e rejeitam solicitações explícitas de criação antes de tentar carregar o módulo.
Use raw quando for necessário alocação fixa, adicione LUKS2 quando a sessão precisar ser criptografada e use SquashFS para um snapshot compactado exato.

Execute os seguintes comandos para inspecionar o sistema de arquivos de persistência real e os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Nenhuma sessão pode ser criada em mídia somente leitura. O initrd pode ler e ativar um snapshot SquashFS existente armazenado em FAT, exFAT ou NTFS gravável, pois extrai o snapshot para uma camada superior ext4 temporária. Criar ou salvar exatamente um snapshot é diferente: o armazenamento de persistência deve suportar os metadados POSIX necessários e a publicação privada e durável. A árvore de trabalho de captura exata utiliza RAM confiável quando disponível, com fallback para espaço em disco se RAM for insuficiente.

## Seleção de boot

Qualquer parâmetro de persistência reconhecido ativa o gerenciamento de persistência. Os menus de boot MiniOS normalmente oferecem opções para retomar, novo, seleção e entradas não persistentes. A descrição canônica dos seletores, compatibilidade, fallback e semânticas de ativação está em [Persistência initrd](/reference/boot-process/Persistence-Internals).

| Parâmetro | Significado |
|-----------|---------|
| `perch` | Usa o caminho legado de retomada best-effort. Tenta o padrão de metadados, mas não cria um substituto quando nenhum está disponível. |
| `perchdir=resume` | Retoma o padrão de metadados e, quando ausente ou incompatível, permite que o initrd crie um novo substituto compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=setup` | Abre o seletor interativo de backend de persistência e então aloca uma nova sessão numerada. Este é o comportamento atual do **Iniciar nova sessão** . |
| `perchdir=new` | Aloca uma nova sessão numerada diretamente do backend solicitado/padrão, com configurações de criptografia, compactação e tamanho, sem abrir o seletor de backend. |
| `perchdir=ask` | Seleciona uma sessão existente; se o armazenamento estiver vazio, entra automaticamente no mesmo fluxo de configuração usado por `perchdir=setup`. |
| `perchdir=<id>` | Seleciona diretamente essa sessão numerada. |
| `perchdir=<device/path>` | Utiliza um local de persistência em um dispositivo, incluindo `/dev/...` e `label:...` formatos tratados pelo initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. |
| `perchencrypt=luks` | Criptografa uma sessão recém-criada Raw, DynFileFS, DynBlk ou VMDK com LUKS2. Sessões existentes derivam a criptografia apenas dos metadados. |
| `perchcomp=<codec>` | Seleciona a compactação do backend DynBlk para uma nova sessão DynBlk. A compactação é forçada para `none` quando DynBlk está envolto em LUKS2. |
| `perchsize=<size>` | Define um novo tamanho de container ou aumenta o existente; valores simples são alocados em MiB e `MB`, `GB`, e `TB` sufixos são aceitos. |

Se nenhum modo for especificado para uma nova sessão, o boot utiliza o modo nativo. Em FAT32/NTFS/exFAT, a criação nativa de boot recorre ao DynFileFS. Um novo container raw tem padrão de 4000 MiB. Novas sessões de boot DynFileFS, DynBlk e VMDK sem `perchsize` usam até 16 GiB; quando resta menos espaço de armazenamento após a reserva de segurança, o tamanho automático é reduzido. DynFileFS também considera sua sobrecarga de índice e o limite de RAM. O crescimento explícito de DynBlk segue o limite do backend instalado, consultado com `dynblk limits --format dynblk`. Com Secure Boot, o initrd não oferece DynBlk/VMDK e trata uma sessão DynBlk/VMDK explícita ou retomada como indisponível, em vez de tentar carregar o módulo não assinado.
Sessões SquashFS podem ser capturadas do sistema em execução com o Gerenciador de sessões MiniOS ou `minios-session create squashfs`. A configuração do initrd cria apenas metadados de sessão de geração zero e mantém a camada superior gravável em RAM. O sistema em execução cria o primeiro `changes.sb` snapshot sob demanda ou no desligamento.

Ao retomar, MiniOS verifica a versão registrada, edição, sistema de arquivos union e modo. O literal `perchdir=resume` pode criar uma nova sessão em vez de usar um padrão ausente ou incompatível. `perch` , seleção numérica direta e outras solicitações de retomada legadas não criam automaticamente esse substituto.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível. Se a seleção ou ativação ainda falhar, o boot normalmente continua com uma camada superior RAM e um aviso de persistência.

O armazenamento de sessões tem este formato:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra os IDs padrão e em execução, além do modo por sessão, versão, edição, sistema de arquivos union, tamanho, estado e configurações específicas do modo.
São metadados persistentes gravados pela implementação de boot, não servindo por si só como prova do estado de execução atual. Não edite nem mova dados de sessão numerados enquanto uma sessão estiver montada; utilize o Gerenciador de sessões MiniOS ou `minios-session`.

## Sessões ativas e em execução

Estes termos descrevem estados diferentes:

- A sessão **ativa** é a padrão selecionada para o próximo boot.
- Conceitualmente, a sessão **em execução** é aquela cuja camada gravável realmente fornece persistência para o boot atual.

O campo persistente `running=` registra essa relação pretendida. Uma falha, erro na construção da união, cópia do armazenamento ou desligamento interrompido pode deixá-lo desatualizado mesmo quando o boot atual está usando RAM ou outra sessão. Operações como SquashFS exigem, portanto, o estado protegido do boot atual vinculado ao ID de boot do initrd e o upper montado verificado; não confiam apenas em `running=` sozinho. Veja [Estado ativo, em execução e do boot atual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Ativar uma sessão altera o próximo boot e não troca o sistema de arquivos union atual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

A sessão ativa não pode ser excluída ou convertida no local. Uma sessão em execução normalmente não pode ser excluída, exportada, copiada, redimensionada ou convertida. A limpeza também protege ambos os IDs.

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

`create` sem um modo seleciona o nativo. A criação de SquashFS captura as alterações atuais em tempo real e não possui tamanho fixo. Sua política de desligamento é padrão para `shutdown`; o salvamento periódico vem desativado por padrão.

Salve uma sessão SquashFS em execução ou uma sessão de persistência compatível que o boot atual copiou para RAM:

```bash
sudo minios-session save <running-session-id>
sudo minios-session save <running-ram-session-id> --as-new
```

Para SquashFS, `save` reconstrói o snapshot atual. Para uma sessão Raw baseada em RAM, DynFileFS, DynBlk, VMDK ou SquashFS, ele grava a cópia RAM de volta no armazenamento de persistência original. `--as-new` preserva a sessão armazenada original e publica o estado RAM sob um novo número de sessão. O meio original deve continuar presente, gravável e corresponder à identidade do sistema de arquivos registrada no boot.

Configure o salvamento automático de SquashFS separadamente:

```bash
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Os intervalos periódicos válidos são `30`, `60`, `120`, `240`, e `480` minutos; `0` desativa o salvamento periódico. As configurações de desligamento e periódicas são independentes.

Exportar e importar `.tar.zst` arquivos de backup:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Somente `.tar.zst` importações são aceitas. Caminhos e membros do arquivo são validados, e a extração é limitada. `--auto-convert` escolhe um modo compatível para o sistema de arquivos atual. `--force-mode <mode>` seleciona explicitamente um modo disponível. Exportação, cópia/clonagem genérica e conversão não são suportadas para sessões SquashFS; utilize o fluxo de salvamento dela e siga [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) em vez de reconstruir ou copiar manualmente os dados internos da sessão ativa.

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

`copy` é uma cópia lógica do sistema de arquivos e sempre atribui um novo ID de sessão. É possível alterar backend, capacidade ou criptografia, criando novas identidades ext4 e LUKS.`clone` copia fisicamente um backend destacado e preserva o header LUKS, keyslots, UUID LUKS e UUID ext4.`convert` substitui a origem por padrão; use `--new-session` para preservar a origem. O tamanho só é relevante para um destino em container.

Expandir, excluir ou limpar sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento suporta sessões DynFileFS, DynBlk, VMDK e raw, inclusive criptografadas, e exige um tamanho maior que o atual. O redimensionamento DynBlk aumenta primeiro o dispositivo de bloco virtual e depois expande o sistema de arquivos ext4; não pré-aloca a nova capacidade virtual. A limpeza remove por padrão sessões com mais de 30 dias.

Todos os comandos aceitam `--json`, e um armazenamento de sessões diferente pode ser selecionado com `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## gravação de sessão com write-back baseada em RAM

Quando o initrd copia uma sessão de persistência compatível para RAM com `perchtoram`, a sessão em execução deixa de gravar diretamente em seu backend original. MiniOS registra o armazenamento original pelo UUID do sistema de arquivos e número da sessão, em vez de depender de um `/dev/sdX` nome. O Session Manager mantém essa sessão RAM visível mesmo que o dispositivo original seja temporariamente desconectado.

Se o armazenamento original estiver presente, gravável e inalterado, **Salvar agora** grava o estado RAM de volta na sessão original. **Salvar no armazenamento como nova sessão** mantém a fonte armazenada intacta e publica o estado RAM como uma nova sessão numerada. Os equivalentes na CLI são `minios-session save <id>` e `minios-session save <id> --as-new`. O salvamento exibe o progresso da cópia e pode ser cancelado antes da fase de publicação; a publicação em si é concluída de forma atômica assim que iniciada.

Se a mídia original estiver ausente, somente leitura, não corresponder mais à identidade do momento da inicialização ou a sessão original tiver sido alterada independentemente, o write-back será recusado em vez de direcionar outro dispositivo pelo nome. Reconecte a mídia original e tente novamente, ou utilize salvar como nova sessão caso a sessão original tenha divergido. Sessões nativas de diretório não são copiadas pela implementação atual do `perchtoram`, portanto, esse caminho de write-back se aplica às sessões Raw, DynFileFS, DynBlk, VMDK e SquashFS.

## comportamento de salvamento SquashFS

Uma sessão SquashFS é descompactada em RAM para a camada gravável em execução. Ao salvar, é gerada e validada uma captura exata, que então substitui de forma atômica `changes.sb`.
Nenhuma geração de rollback é mantida. Salvar agora está disponível pelo ícone da bandeja, Gerenciador de sessões MiniOS, ou `minios-session save` independentemente da política automática.

A cada salvamento, MiniOS copia uma visualização estável da árvore modificada para o armazenamento privado RAM quando há memória disponível. A compactação grava **uma** imagem em um diretório privado dentro da sessão numerada. Somente após verificar o conteúdo do sistema de arquivos, o hash, a identidade e a sincronização durável é que o salvamento substitui `changes.sb`. Não há uma segunda imagem compactada completa em RAM nem uma segunda gravação dessa imagem no dispositivo de persistência. Se houver pouca RAM para a árvore, apenas essa árvore de trabalho é movida para o disco; a candidata compactada ainda precisa de uma gravação. Veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) para políticas de gravação de cache e log.

Os diagnósticos de inicialização para uma sessão durável SquashFS são armazenados em seu `boot-logs/minios/` e `boot-logs/live/` diretórios. Eles não dependem de uma captura de desligamento bem-sucedida e permanecem disponíveis mesmo quando as últimas alterações no upper RAM não puderam ser salvas. O armazenamento de apoio ainda precisa ser gravável; arquivos de log comuns podem ser temporários caso `LIVE_LOG_STORAGE=volatile` seja selecionado.

O salvamento no desligamento é implementado pelo gatilho de desligamento principal MiniOS e pelo `minios-squashfs-save` backend, portanto não depende do Gerenciador de sessões MiniOS estar aberto ou instalado. O salvamento periódico é verificado a cada 30 minutos por um timer do systemd ou um worker SysV, ambos chamando o mesmo backend de salvamento automático. A reconstrução da captura consome CPU e grava a captura completa; recomenda-se intervalos de uma hora ou mais.

Durante a operação RAM-backed SquashFS, uma nova captura SquashFS capturada e ativada pode assumir o controle do destino de salvamento em execução. Após essa transferência, a captura em execução anterior pode ser removida sem reinicialização:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Essa exceção se aplica apenas a uma transferência válida de SquashFS do boot atual. Outros modos de persistência em execução permanecem protegidos contra exclusão.

## Criptografia

LUKS2 é uma camada opcional de criptografia sobre Raw, DynFileFS, DynBlk ou armazenamento de sessão VMDK; não é um modo de sessão separado. Está disponível apenas quando `/run/initramfs/etc/minios-initramfs-crypt` contém `luks-layer-v1` e as ferramentas e capacidades do backend selecionado estão disponíveis. A compactação do backend DynBlk é desativada quando LUKS2 é selecionado.

A criação interativa do LUKS solicita a senha duas vezes. Operações que leem ou criam dados LUKS podem recebê-los da entrada padrão com `--password-stdin`. As senhas não são inseridas em argumentos de comando nem em metadados da sessão. Na inicialização, o initrd solicita a senha no console. Três tentativas rejeitadas interrompem a inicialização de forma fatal; MiniOS não continua com texto simples, RAM, outro backend ou uma sessão substituta sob a mesma solicitação.

Para uma sessão Raw, DynFileFS, DynBlk ou VMDK criptografada, inativa e desconectada, o Gerenciador de Sessões oferece **Alterar senha...**. O equivalente na CLI é:

```bash
sudo minios-session change-passphrase <id>
```

Solicita a senha atual, a nova senha e a confirmação. Com `--password-stdin`, forneça essas três linhas nessa ordem. O keyslot selecionado é substituído sem reformatar ou recriptografar todos os arquivos. Sessões ativas, em execução ou montadas devem ser desconectadas primeiro; keyslots LUKS adicionais gerenciados fora do Gerenciador de Sessões não são alterados.

Exportações criptografadas contêm arquivos lógicos da sessão descriptografados, não o backend criptografado. Ao importar, copiar ou converter para LUKS, um novo backend criptografado com novas identidades é criado.

## Montando uma sessão inativa

O Gerenciador de Sessões pode montar uma sessão Raw, DynFileFS, DynBlk ou VMDK que esteja inativa e não em execução, em modo leitura e escrita, sem defini-la como padrão de inicialização. Clique com o botão direito na sessão e escolha **Montar Sessão**; sessões criptografadas solicitarão sua senha LUKS. É possível montar vários IDs de sessão diferentes ao mesmo tempo. **Abrir Pasta Montada** abre o sistema de arquivos anexado, enquanto **Abrir Pasta da Sessão** abre o diretório numerado que contém seus arquivos de suporte.

Fechar o Gerenciador de Sessões não desmonta um ponto de montagem gerenciado pela interface gráfica. Reabra o aplicativo para visualizá-lo e escolha **Desmontar Sessão**. Se o processo de desmontagem estiver ocupado, MiniOS mantém o daemon de suporte, o dispositivo loop ou o dispositivo DynBlk conectados, em vez de desconectar o armazenamento sob um sistema de arquivos ativo.

A CLI independente mantém o ponto de montagem ativo até que sua entrada padrão seja fechada ou receba Ctrl+C:

```bash
sudo minios-session mount <id>
```

O comando recusa a sessão ativa ou em execução e nunca formata um sistema de arquivos existente porque a montagem falhou.

## Backups e sessões com falha

Para sessões nativas, DynFileFS, DynBlk, VMDK e raw, incluindo formas criptografadas, utilize `export` para backups lógicos em vez de copiar o diretório da sessão montada. Mantenha o arquivo gerado em outro dispositivo e verifique se ele pode ser importado antes de confiar nele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso.
Para procedimentos de backup de SquashFS e de dispositivo inteiro, consulte [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se uma sessão falhar após o armazenamento encher, uma gravação for interrompida ou sessões vazias forem criadas repetidamente, pare de modificar o armazenamento afetado. Exporte primeiro uma sessão legível e não em execução, se possível, e depois siga para [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos dos containers são verificados antes da ativação em modo de escrita. Falhas graves na verificação do sistema de arquivos preservam o container para recuperação, em vez de montá-lo como gravável. SquashFS detecta um estado anterior não limpo e restaura o último snapshot salvo com sucesso. Exclua sessões apenas pelo Gerenciador de sessões MiniOS ou `minios-session delete`; não remova diretórios de sessão manualmente.

## Devolvendo DynFileFS, DynBlk e armazenamento VMDK não utilizados

No Session Manager, clique com o botão direito em uma sessão DynFileFS, DynBlk ou VMDK e selecione **Liberar espaço...**. A caixa de diálogo funciona tanto para sessões suportadas em execução quanto inativas, e também reutiliza uma sessão já montada pelo Session Manager. Para uma sessão em texto simples, MiniOS executa o FITRIM no sistema de arquivos ext4 interno e, em seguida, solicita ao backend proprietário que devolva o espaço de armazenamento já identificado como livre. Sessões desconectadas são anexadas temporariamente e liberadas apenas após o sistema de arquivos ser desmontado corretamente.

A liberação de DynFileFS requer DynFileFS 4.6.0 ou superior. Se o pacote foi atualizado enquanto um daemon DynFileFS mais antigo ainda estiver ativo, reinicie no backend atualizado antes de liberar essa sessão em execução.

```sh
sudo minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
sudo minios-session reclaim 3 --compact --json
```

A caixa de seleção de compactação vem **desmarcada por padrão**, inclusive no exFAT. Não há
fallback automático de compactação. Sessões criptografadas liberam apenas o espaço já
conhecido pelo backend; esta operação não ativa o descarte via LUKS nem
revela o padrão de alocação. Erros de dispositivo e falha no trim interrompem a operação.

### Comandos de driver de baixo nível

Com o backend VMDK nativo ou dividido atual DynBlk, o descarte de grains completos
torna o espaço deles reutilizável. Em um sistema de arquivos ext4, os intervalos aposentados
também podem ser automaticamente liberados (hole-punch). No exFAT, a limpeza automática só trunca
caudas de arquivos totalmente livres. **A limpeza automática nunca move dados ativos.**

Use `fstrim` no sistema de arquivos de alterações interno montado (não na raiz combinada AUFS/OverlayFS
root) para relatar blocos excluídos, depois `dynblk reclaim /dev/dynblkN --execute` para
limpeza sem movimentação. Selecione o dispositivo de sessão real, não um índice presumido.
Para solicitar manualmente a compactação in-place intensiva em gravação, adicione `--compact`.
Funciona sem converter a imagem ou alterar o tamanho do sistema de arquivos virtual;
outras leituras/gravações podem ocorrer entre as etapas de recuperação. Não é uma alternativa automática.
O parâmetro opcional `--scan-zeroes` lê grains mapeados e não é ativado por padrão.

Esses comandos também estão disponíveis no CLI do initrd DynBlk reconstruído. Nenhuma
compactação de inicialização automática está habilitada. Sessões criptografadas mantêm sua política de descarte existente;
as ferramentas não ativam silenciosamente o passthrough de descarte do dm-crypt.
Anexos somente leitura ou `cache=unsafe` não podem ser recuperados. Os intervalos liberados relatados
e os comprimentos truncados não são iguais ao espaço livre medido do sistema de arquivos.

## Fluxos de trabalho de sessão VMDK

VMDK é um modo de sessão separado, não um novo codec de compactação. Crie, ative,
redimensione, exporte/import, copie, clone e converta usando os mesmos comandos do Gerenciador de Sessão
que outros modos de contêiner:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Arquivos de sessão contêm arquivos lógicos e metadados, não um anexo externo arbitrário
VMDK. Sessões VMDK gerenciadas usam o `volume.vmdk`descritor canônico
e todos os seus `volume-sNNN.vmdk`companheiros. Não renomeie partes nem copie uma imagem ativa
por fora do driver. Alternar entre DynBlk nativo e VMDK exige uma
cópia/conversão explícita; alterar o `session_mode`manualmente não é conversão.

O instalador oferece VMDK apenas quando suportado pelo runtime e rejeita imagens de origem
cujas initrds copiadas não possuem a capacidade de `vmdk-session-v1`. Atualize o CLI,
driver, ferramentas de sessão e scripts de boot juntos antes de criar sessões VMDK.
