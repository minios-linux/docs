---
updated: 2026-09-17
program_commits:
    minios-session-manager: 69436959d893a9870aca23e91b346d06b49eb98d
    minios-tools: 7cdd0e10c0f610ebc581efa82105b747437a6125
---

# Sessões e persistência

As sessões MiniOS mantêm as alterações feitas no sistema ativo após reinicializações. Cada sessão é um diretório numerado dentro de `minios/changes/`; os módulos MiniOS somente leitura permanecem inalterados e a sessão selecionada fornece a camada gravável do sistema de arquivos union.

Use o Gerenciador de sessões MiniOS a partir de um sistema MiniOS em execução:

```bash
minios-session-manager
```

A ferramenta equivalente de linha de comando é `minios-session`. Seus comandos de modificação exigem privilégios administrativos, então os exemplos abaixo utilizam `sudo`.

## Modos de sessão

| Modo | Armazenamento | Principais restrições | Camada MiniOS LUKS2 |
|------|---------|------------------|--------------------|
| `native` | Alterações armazenadas diretamente no diretório da sessão | Requer um sistema de arquivos gravável que preserve os metadados do Linux e as operações para as quais MiniOS faz sondagens. A capacidade acompanha o espaço livre de armazenamento de base; `perchsize` não se aplica. | Não |
| `dynfilefs` | ext4 expansível `virtual.dat`com arquivos de segmento format-400 como base | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. O payload é enxuto, mas o índice de mapeamento cresce conforme a capacidade lógica declarada. | Sim |
| `dynblk` | Sistema de arquivos ext4 enxuto em um dispositivo de bloco do kernel, baseado em `volumeNNN.db`arquivos | Requer o CLI DynBlk, módulo do kernel e capacidade initrd. O tamanho criado na inicialização é de até 16 GiB por padrão; o máximo é informado por `dynblk limits`. Os mapeamentos residentes em disco usam um cache de metadados limitado. | Sim |
| `vmdk` | Sistema de arquivos ext4 enxuto em um VMDK sparse padrão dividido, exposto pelo driver DynBlk | Utiliza `volume.vmdk` e `volume-sNNN.vmdk`. Sem compressão. Requer `vmdk-session-v1` no marcador de capacidade initrd em execução. Mesmo padrão manual de 16 GiB que DynBlk; consulte `dynblk limits --format vmdk` para limites. | Sim |
| `raw` | Arquivo único `changes.img`contendo ext4 | Capacidade lógica fixa, com crescimento apenas explícito. Funciona em POSIX gravável, FAT32, NTFS e exFAT; FAT32 é limitado a 4000 MiB. | Sim |
| `squashfs` | Snapshot compactado em `changes.sb`; camada superior gravável em tempo de execução é reconstruída em RAM | `perchsize` não se aplica. Snapshots existentes podem ser restaurados de mídias graváveis compatíveis, enquanto o salvamento exato requer um sistema de arquivos POSIX para staging. | Não |

Raw, DynFileFS, DynBlk e VMDK podem opcionalmente utilizar uma camada de criptografia LUKS2. O backend de armazenamento permanece o modo de sessão, e os metadados da sessão registram a criptografia separadamente. DynFileFS e raw criados com `minios-session` têm padrão de 4000 MiB; DynBlk e VMDK têm padrão de 16 GiB. Os valores de tamanho são alocados em MiB; `GB` e `TB`sufixos convertem para 1000 e 1.000.000 MiB. Raw é limitado a 4000 MiB em FAT32, criptografado ou não. Os dados do payload DynFileFS crescem sob demanda, mas seu índice format-400 é dimensionado para a capacidade lógica total e consome cerca de 2 MiB de RAM mais cerca de 2 MiB de armazenamento de base por GiB. DynBlk mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM, com padrão de 1 MiB em vez de uma porcentagem de RAM. Seus vetores de extensão/arquivo e diretórios crescem conforme as partes declaradas, enquanto o preenchimento do payload não exige um mapa residente completo. Consulte o limite de capacidade instalada com `dynblk limits --format dynblk`. As gravações reais permanecem limitadas pelo espaço livre do sistema de arquivos subjacente e pela admissão de recursos do backend. As operações de redimensionamento de contêiner só permitem aumentar a sessão; redução não é suportada.

O modo nativo é a escolha mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não puder representar metadados do Linux.
Use DynBlk quando desejar um dispositivo de bloco real do kernel com arquivos de base thin; o driver pode manter vários volumes DynBlk independentes conectados ao mesmo tempo, e o Gerenciador de Sessões usa o caminho do dispositivo retornado pelo driver em vez de assumir que `/dev/dynblk0` está livre.
Use raw quando for necessário alocação fixa, adicione LUKS2 quando a sessão precisar ser criptografada e use SquashFS para um snapshot compactado exato.

Execute os comandos a seguir para inspecionar o sistema de arquivos de persistência real e os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Nenhuma sessão pode ser criada em mídia somente leitura. O initrd pode ler e ativar um snapshot SquashFS existente armazenado em FAT, exFAT ou NTFS gravável porque extrai o snapshot para uma camada superior ext4 temporária. Criar ou salvar exatamente um snapshot é diferente: seu espaço de trabalho privado de staging deve estar em um sistema de arquivos POSIX adequado que preserve metadados do Linux e whiteouts de união.

## Seleção de boot

Qualquer parâmetro de persistência reconhecido habilita o gerenciamento de persistência. Os menus de boot MiniOS normalmente oferecem opções de retomar, novo, seleção e entradas não persistentes. A descrição canônica dos comportamentos de seletor, compatibilidade, fallback e ativação está em [Persistência do initrd](/reference/boot-process/Persistence-Internals).

| Parâmetro | Significado |
|-----------|---------|
| `perch` | Usa o caminho de retomada legado best-effort. Tenta o padrão dos metadados, mas não cria um substituto quando nenhum está utilizável. |
| `perchdir=resume` | Retoma o padrão dos metadados e, quando ausente ou incompatível, permite que o initrd crie um novo substituto compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca uma nova sessão numerada. |
| `perchdir=ask` | Seleciona uma sessão existente ou cria uma durante o boot. |
| `perchdir=<id>` | Seleciona diretamente aquela sessão numerada. |
| `perchdir=<device/path>` | Usa um local de persistência em um dispositivo, incluindo `/dev/...` e `label:...`formas tratadas pelo initrd. |
| `perchmode=<mode>` | Defina `native`, `dynfilefs`, `dynblk`, `vmdk`, ou `raw` .`squashfs` |
| `perchencrypt=luks` | Criptografe uma sessão Raw, DynFileFS, DynBlk ou VMDK recém-criada com LUKS2. Sessões existentes derivam a criptografia apenas dos metadados. |
| `perchcomp=<codec>` | Seleciona compressão de backend DynBlk para uma nova sessão DynBlk. A compressão é forçada para `none` quando DynBlk está envolvido em LUKS2. |
| `perchsize=<size>` | Define um novo tamanho de contêiner ou aumenta o existente; valores simples são alocados em MiB e `MB`, `GB`, e `TB`sufixos são aceitos. |

Se nenhum modo for especificado para uma nova sessão, o boot usa o modo nativo. Em FAT32/NTFS/exFAT, a criação nativa no boot recai para DynFileFS. Um novo contêiner raw tem padrão de 4000 MiB. Novas sessões de boot DynFileFS, DynBlk e VMDK sem `perchsize` usam até 16 GiB; quando resta menos espaço de base após a reserva de segurança, o tamanho automático é reduzido. DynFileFS também considera a sobrecarga do índice e o limite RAM. O crescimento explícito de DynBlk segue o limite do backend instalado, consultado com `dynblk limits --format dynblk`.
Sessões SquashFS podem ser capturadas do sistema em execução com o Gerenciador de sessões MiniOS ou `minios-session create squashfs`. A configuração do initrd cria apenas metadados de sessão de geração zero e mantém a camada superior gravável em RAM. O sistema em execução cria o primeiro `changes.sb` snapshot sob demanda ou no desligamento.

Ao retomar, MiniOS verifica a versão registrada, edição, sistema de arquivos union e modo. O literal `perchdir=resume` pode criar uma nova sessão em vez de usar um padrão ausente ou incompatível. `perch`seleção numérica direta e outras solicitações de retomada legadas não criam automaticamente esse substituto.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível. Se a seleção ou ativação ainda falhar, o boot normalmente continua com uma camada superior RAM e um aviso de persistência.

O armazenamento de sessões tem esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf`registra os IDs padrão e em execução, além do modo, versão, edição, sistema de arquivos union, tamanho, estado e configurações específicas de modo por sessão.
São metadados persistentes comprometidos pela implementação de boot, não prova do estado atual de execução. Não edite nem mova dados de sessões numeradas enquanto uma sessão estiver montada; use o Gerenciador de sessões MiniOS ou `minios-session`.

## Sessões ativas e em execução

Estes termos descrevem estados diferentes:

- A sessão **ativa** é a padrão selecionada para a próxima inicialização.
- Conceitualmente, a sessão **em execução** é aquela cuja camada gravável realmente fornece persistência para a inicialização atual.

O campo persistente `running=` registra essa relação pretendida. Uma falha, erro na construção da união, cópia do armazenamento ou desligamento interrompido pode deixá-lo desatualizado, mesmo quando a inicialização atual está usando RAM ou outra sessão. Por isso, operações como SquashFS exigem o estado protegido do initrd, vinculado ao boot-ID e o upper montado e verificado; não confiam apenas em `running=` sozinho. Veja [Estado ativo, em execução e de inicialização atual](/reference/boot-process/Persistence-Internals#estado-ativo-em-execução-e-de-inicialização-atual).

Ativar uma sessão altera a próxima inicialização, mas não troca o sistema de arquivos union atual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

A sessão ativa não pode ser excluída ou convertida no local. Uma sessão em execução normalmente não pode ser excluída, exportada, copiada, redimensionada ou convertida. A limpeza também protege ambos os IDs.

## Referência de comandos

Liste sessões e inspecione o armazenamento:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session info
sudo minios-session status
```

Crie sessões:

```bash
sudo minios-session create
sudo minios-session create native
sudo minios-session create dynfilefs
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create`sem modo seleciona nativo. A criação SquashFS captura as alterações atuais ao vivo e não tem tamanho fixo. A política de desligamento padrão é `shutdown`; o salvamento periódico vem desativado por padrão.

Salve e configure uma sessão SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Os intervalos periódicos válidos são `30`, `60`, `120`, `240`, e `480`minutos; `0`desativa o salvamento periódico. As configurações de desligamento e periódicas são independentes.

Exporte e importe `.tar.zst`arquivos de sessão:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Apenas `.tar.zst`importações são aceitas. Caminhos e membros do arquivo são validados e a extração é limitada. `--auto-convert`escolhe um modo compatível para o sistema de arquivos atual. `--force-mode <mode>`seleciona explicitamente um modo disponível. Exportação, cópia e conversão não são suportadas para sessões SquashFS; salve o snapshot e copie o diretório completo da sessão inativa.

Copie ou converta uma sessão:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session clone <id>
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> raw --to-encryption luks --size 4GB --new-session
```

`copy`é uma cópia lógica do sistema de arquivos e sempre atribui um novo ID de sessão. Pode alterar backend, capacidade ou criptografia e cria identidades ext4 e LUKS novas. `clone`copia fisicamente um backend desconectado e preserva seu cabeçalho LUKS, keyslots, UUID LUKS e UUID ext4. `convert`substitui a origem por padrão; use `--new-session`para preservar a origem. Um tamanho só é relevante para destino tipo contêiner.

Aumente, exclua ou limpe sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento suporta sessões DynFileFS, DynBlk, VMDK e raw, inclusive formas criptografadas, e exige um tamanho maior que o atual. O redimensionamento DynBlk aumenta primeiro o dispositivo de bloco virtual e depois expande o sistema de arquivos ext4; não pré-aloca a nova capacidade virtual. A limpeza padrão é para sessões com mais de 30 dias.

Todos os comandos aceitam `--json`, e um armazenamento de sessões diferente pode ser selecionado com `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamento de salvamento SquashFS

Uma sessão SquashFS é descompactada em RAM para a camada gravável em execução. O salvamento reconstrói e valida um snapshot exato, substituindo então de forma atômica `changes.sb`.
Nenhuma geração de rollback é mantida. O Salvar Agora está disponível pelo ícone da bandeja, Gerenciador de sessões MiniOS ou `minios-session save` independentemente da política automática.

O salvamento no desligamento é realizado pelo gatilho de desligamento principal MiniOS e pelo backend `minios-squashfs-save`, portanto não depende do Gerenciador de sessões MiniOS estar aberto ou instalado. O salvamento periódico é verificado a cada 30 minutos por um timer do systemd ou um worker SysV, ambos chamando o mesmo backend de autosave. A reconstrução do snapshot consome CPU e grava o snapshot completo; recomenda-se intervalos de uma hora ou mais.

Durante a operação RAM-backed SquashFS, um novo snapshot SquashFS capturado e ativado pode assumir o controle do destino de salvamento em execução. Após essa transferência, o snapshot antigo pode ser removido sem reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Essa exceção se aplica apenas a uma transferência válida do boot atual SquashFS. Outros modos de persistência em execução permanecem protegidos contra exclusão.

## Criptografia

LUKS2 é uma camada opcional sobre Raw `changes.img`, DynFileFS `virtual.dat`, ou diretamente no dispositivo DynBlk. Está disponível apenas quando `/run/initramfs/etc/minios-initramfs-crypt` contém `luks-layer-v1` e as ferramentas e recursos do backend selecionado estão disponíveis.

A criação interativa do LUKS solicita a senha duas vezes. Operações que leem ou criam dados LUKS podem receber a senha pela entrada padrão com `--password-stdin`.
As senhas não são inseridas em argumentos de comando ou metadados de sessão. Na inicialização, o initrd solicita a senha no console. Três tentativas incorretas interrompem a inicialização de forma fatal; MiniOS não continua com texto simples, RAM, outro backend ou uma nova sessão de substituição na mesma solicitação.

Exportações criptografadas contêm arquivos de sessão lógica descriptografados, e não o backend criptografado. Ao importar, copiar ou converter para LUKS, é criado um novo backend criptografado com novas identidades.

## Backups e sessões com falha

Para sessões nativas, DynFileFS, DynBlk, VMDK e raw, inclusive criptografadas, use `export`para backups lógicos em vez de copiar o diretório da sessão montada. Mantenha o arquivo resultante em outro dispositivo e verifique se pode ser importado antes de confiar nele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso.
Para procedimentos de backup SquashFS e de dispositivo inteiro, veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se uma sessão falhar após o preenchimento do armazenamento, uma gravação for interrompida ou sessões vazias forem criadas repetidamente, pare de modificar o armazenamento afetado. Exporte primeiro uma sessão não ativa legível, quando possível, e siga [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos de contêiner são verificados antes da ativação gravável. Falhas graves na verificação do sistema de arquivos preservam o contêiner para recuperação em vez de montá-lo como gravável. SquashFS detecta um estado anterior não limpo e restaura o último snapshot salvo com sucesso. Exclua sessões apenas pelo Gerenciador de sessões MiniOS ou `minios-session delete`; não remova diretórios de sessão manualmente.

## Devolvendo armazenamento não utilizado de DynBlk e VMDK

No Gerenciador de Sessões, clique com o botão direito em uma sessão DynBlk ou VMDK e escolha **Liberar espaço...**.
A janela funciona tanto para a sessão em execução quanto para uma sessão inativa. Para uma
sessão plaintext, ela faz o trim do ext4 interno antes de pedir ao driver para recuperar
espaço. Uma sessão inativa é conectada temporariamente e depois desconectada; o
dispositivo da sessão em execução permanece conectado.

```sh
minios-session reclaim 3 --json
# Explicitly permit live-data relocation (additional flash writes):
minios-session reclaim 3 --compact --json
```

A caixa de seleção de compactação vem **desmarcada por padrão**, inclusive no exFAT. Não há
fallback automático de compactação. Sessões criptografadas recuperam apenas o espaço já
conhecido pelo driver; esta operação não ativa o descarte via LUKS nem
revela o padrão de alocação. Erros de dispositivo e falha no trim interrompem a operação.

### Comandos de driver de baixo nível

Com o backend atual DynBlk nativo ou VMDK dividido, o descarte de grains completos
torna seu espaço reutilizável. Em um sistema de arquivos ext4 de base, intervalos aposentados
também podem ser liberados automaticamente (hole-punch). No exFAT, a limpeza automática só trunca
caudas de arquivos completamente livres. **A limpeza automática nunca move dados ativos.**

Use `fstrim`no sistema de arquivos interno de alterações montado (não o root combinado AUFS/OverlayFS
raiz) para relatar blocos excluídos, depois `dynblk reclaim /dev/dynblkN --execute`para
limpeza sem movimentação. Selecione o dispositivo real da sessão, não um índice presumido.
Para solicitar manualmente a compactação in-place intensiva em gravação, adicione `--compact`.
Funciona sem converter a imagem ou alterar o tamanho do sistema de arquivos virtual;
outras leituras/gravações podem ocorrer entre as etapas de recuperação. Não é fallback automático.
A opção `--scan-zeroes`lê grains mapeados e não vem ativada por padrão.

Esses comandos também estão disponíveis no CLI DynBlk do initrd reconstruído. Nenhuma
compactação automática na inicialização é ativada. Sessões criptografadas mantêm sua política de descarte existente; as ferramentas não ativam silenciosamente o descarte dm-crypt.
Anexos somente leitura ou 
não podem ser recuperados. Os intervalos liberados`cache=unsafe`e comprimentos truncados relatados não são iguais ao espaço livre medido do sistema de arquivos.
.

## Fluxos de trabalho de sessão VMDK

VMDK é um modo de sessão separado, não um novo codec de compressão. As operações de criar, ativar,
redimensionar, exportar/importar, copiar, clonar e conversão usam os mesmos comandos do Gerenciador de Sessões
que outros modos de contêiner:

```sh
minios-session create vmdk 16384 --activate
minios-session copy 3 --to-mode vmdk --size 16384
minios-session import /path/to/session.tar.zst --force-mode vmdk
```

Arquivos de sessão contêm arquivos lógicos e metadados, não um anexo VMDK externo arbitrário.
Sessões VMDK gerenciadas usam o `volume.vmdk`descritor
canônico e todos os seus `volume-sNNN.vmdk`pares. Não renomeie partes nem copie uma imagem ativa
por fora do driver. Alternar entre DynBlk nativo e VMDK exige uma
cópia/conversão explícita; alterar `session_mode`manualmente não é conversão.

O instalador só oferece VMDK quando suportado pelo runtime e rejeita imagens de origem
cujo initrd copiado não tenha a capacidade `vmdk-session-v1`. Atualize o CLI,
driver, ferramentas de sessão e scripts de boot juntos antes de criar sessões VMDK.
