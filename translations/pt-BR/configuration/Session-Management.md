# Gerenciamento de sessões no MiniOS

As sessões do MiniOS mantêm as alterações feitas no sistema live após reinicializações. Cada sessão é um diretório numerado dentro de `minios/changes/`; os módulos do MiniOS permanecem somente leitura e a sessão selecionada fornece a camada gravável do sistema de arquivos union.

Use o Gerenciador de Sessões a partir de um sistema MiniOS em execução:

```bash
minios-session-manager
```

A ferramenta equivalente na linha de comando é `minios-session`. Seus comandos de modificação exigem privilégios administrativos, então os exemplos abaixo usam `sudo`.

## Modos de sessão

| Modo | Armazenamento | Principais restrições |
|------|---------------|----------------------|
| `native` | Alterações armazenadas diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável, como ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Contêiner ext4 expansível dividido em arquivos de apoio | Funciona em POSIX gravável, FAT32, NTFS e exFAT. Requer o backend DynFileFS. |
| `raw` | `changes.img` de tamanho fixo contendo ext4 | Funciona em POSIX gravável, FAT32, NTFS e exFAT. |
| `luks` | `changes.luks` criptografado com LUKS2 contendo ext4 | Requer `cryptsetup`, suporte a loop e o hook LUKS do initrd do MiniOS. |
| `squashfs` | Snapshot compactado em `changes.sb` | O salvamento requer um sistema de arquivos de persistência POSIX capaz de preservar links, propriedade, permissões, xattrs, ACLs, capabilities e whiteouts. |

`dynfilefs`, `raw` e `luks` criados com `minios-session` têm tamanho padrão de 4000
MiB. Os valores de tamanho são alocados em MiB; os sufixos `GB` e `TB` convertem para 1000
e 1.000.000 MiB. O Gerenciador de Sessões limita arquivos raw e LUKS a 4000 MiB em
FAT32. Não confie nisso como uma
garantia geral do initrd: um pedido de boot raw acima do limite pode chegar a alocar
e falhar, em vez de ser reduzido. Operações de redimensionamento de contêiner só permitem aumentar
a sessão; redução não é suportada.

O modo nativo é a escolha mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não puder representar metadados do Linux.
Use raw quando for necessário alocação fixa, LUKS quando a sessão precisar ser
criptografada e SquashFS para um snapshot compactado exato.

Execute os comandos abaixo para inspecionar o sistema de arquivos de persistência real e
os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Nenhuma sessão pode ser criada em mídia somente leitura. O initrd pode ler e ativar
um snapshot SquashFS existente armazenado em FAT, exFAT ou NTFS gravável porque ele
extrai o snapshot para um ext4 temporário. Criar ou salvar exatamente um
snapshot é diferente: seu espaço de trabalho privado deve estar em um sistema de arquivos POSIX adequado que preserve metadados do Linux e whiteouts de união.

## Seleção de boot

Qualquer parâmetro de persistência reconhecido habilita o gerenciamento de persistência. Os menus de boot do MiniOS normalmente oferecem opções de retomar, novo, seleção e entradas não persistentes. A descrição canônica dos comportamentos de seleção, compatibilidade, fallback e ativação está em [Persistência do Initrd](./Initrd-Persistence.md).

| Parâmetro | Significado |
|-----------|------------|
| `perch` | Usa o caminho legado de retomada best-effort. Tenta o padrão de metadados, mas não cria um substituto quando nenhum está utilizável. |
| `perchdir=resume` | Retoma o padrão de metadados e, quando ausente ou incompatível, permite que o initrd crie um novo substituto compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca uma nova sessão numerada. |
| `perchdir=ask` | Seleciona uma sessão existente ou cria uma durante o boot. |
| `perchdir=<id>` | Seleciona diretamente aquela sessão numerada. |
| `perchdir=<device/path>` | Usa um local de persistência em um dispositivo, incluindo as formas `/dev/...` e `label:...` tratadas pelo initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `raw`, `luks` ou `squashfs`. |
| `perchsize=<size>` | Define um novo tamanho de contêiner ou aumenta o existente; valores simples são alocados em MiB e os sufixos `MB`, `GB` e `TB` são aceitos. |

Se nenhum modo for especificado para uma nova sessão, o boot usa o modo nativo. Em
FAT32/NTFS/exFAT, a criação nativa de boot recai para DynFileFS. Um novo contêiner raw ou LUKS tem tamanho padrão de 4000 MiB; uma nova sessão DynFileFS de boot sem
`perchsize` é dimensionada conforme o espaço disponível, mantendo uma reserva de segurança.
Sessões SquashFS são capturadas do sistema em execução com o Gerenciador de Sessões ou
`minios-session create squashfs`; `perchdir=new perchmode=squashfs` não
cria um snapshot no initrd.

Ao retomar, o MiniOS verifica a versão registrada, edição, sistema de arquivos de união
e modo. `perchdir=resume` literal pode criar uma nova sessão em vez de usar um
default ausente ou incompatível. `perch` simples, seleção numérica direta e
outros pedidos de retomada legados não criam automaticamente esse substituto.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível.
Se a seleção ou ativação ainda falhar, o boot normalmente continua com um upper em RAM e um aviso de persistência.

O armazenamento de sessões tem esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra os IDs padrão e em execução e, por sessão, modo,
versão, edição, sistema de arquivos de união, tamanho, estado e configurações específicas do modo.
É metadado persistente comprometido pela implementação de boot, não sendo por si só
prova do estado atual em tempo de execução. Não edite nem mova dados de sessões numeradas
enquanto uma sessão estiver montada; use o Gerenciador de Sessões ou `minios-session`.

## Sessões ativas e em execução

Esses termos descrevem estados diferentes:

- A sessão **ativa** é a selecionada por padrão para o próximo boot.
- Conceitualmente, a sessão **em execução** é aquela cuja camada gravável
  realmente fornece persistência para o boot atual.

O campo persistente `running=` registra esse relacionamento pretendido. Uma falha,
construção de união malsucedida, armazenamento copiado ou desligamento interrompido pode deixá-lo
desatualizado, mesmo quando o boot atual está usando RAM ou outra sessão. Operações
como o salvamento SquashFS, portanto, exigem o estado protegido do initrd, vinculado ao ID do boot
atual, e o upper verificado montado; elas não confiam apenas em `running=`.
Veja [Estado ativo, em execução e de boot atual](./Initrd-Persistence.md).

Ativar uma sessão altera o próximo boot e não troca o sistema de arquivos union atual:

```bash
sudo minios-session active
sudo minios-session running
sudo minios-session activate <id>
```

A sessão ativa não pode ser excluída ou convertida no local. Uma sessão em execução normalmente não pode ser excluída, exportada, copiada, redimensionada ou convertida. A limpeza também protege ambos os IDs.

## Referência de comandos

Liste sessões e inspecione o repositório:

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
sudo minios-session create luks 4GB
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sem um modo seleciona o modo nativo. A criação de SquashFS captura as alterações atuais em tempo real e não possui tamanho fixo. A política de desligamento padrão é `shutdown`;
o salvamento periódico vem desativado por padrão.

Salve e configure uma sessão SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Os intervalos periódicos válidos são `30`, `60`, `120`, `240` e `480` minutos;
`0` desativa o salvamento periódico. As configurações de desligamento e periódicas são independentes.

Exporte e importe arquivos de backup `.tar.zst`:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
```

Somente importações `.tar.zst` são aceitas. Caminhos e membros do arquivo são validados, e a extração é limitada. `--auto-convert` escolhe um modo compatível para o sistema de arquivos atual. `--force-mode <mode>` seleciona explicitamente um modo disponível. Exportação, cópia e conversão não são suportadas para sessões SquashFS;
salve o snapshot e copie todo o diretório da sessão inativa em vez disso.

Copie ou converta uma sessão:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` sempre atribui um novo ID de sessão. `convert` substitui a origem por padrão; use `--new-session` para preservar a origem. O tamanho só é relevante para um destino do tipo container.

Expanda, exclua ou limpe sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento é compatível com sessões DynFileFS, raw e LUKS e requer um tamanho maior que o atual. A limpeza remove sessões com mais de 30 dias por padrão.

Todos os comandos aceitam `--json`, e um repositório de sessões diferente pode ser selecionado com `--sessions-dir PATH`:

```bash
sudo minios-session --json list
sudo minios-session --sessions-dir /mnt/store/minios/changes list
```

## Comportamento de salvamento do SquashFS

Uma sessão SquashFS é descompactada na RAM para a camada gravável em execução. Ao salvar, um snapshot exato é reconstruído e validado, substituindo `changes.sb` de forma atômica. Não há geração de rollback. O comando Salvar Agora está disponível pelo ícone da bandeja, Gerenciador de Sessões ou `minios-session save`, independentemente da política automática.

O salvamento no desligamento é implementado pelo gatilho de desligamento principal do MiniOS e pelo backend `minios-squashfs-save`, portanto não depende do Gerenciador de Sessões estar aberto ou instalado. O salvamento periódico é verificado a cada 30 minutos por um timer do systemd ou um worker SysV, ambos chamando o mesmo backend de autosave. A reconstrução do snapshot consome CPU e grava o snapshot completo; intervalos de uma hora ou mais são recomendados.

Durante a operação SquashFS baseada em RAM, um snapshot SquashFS recém-capturado e ativado pode assumir a propriedade do destino de salvamento em execução. Após essa transferência, o snapshot antigo em execução pode ser removido sem reiniciar:

```bash
sudo minios-session activate <new-squashfs-id>
sudo minios-session delete <old-running-squashfs-id> --handoff
```

Essa exceção se aplica apenas a uma transferência válida de SquashFS do boot atual. Outros modos de persistência em execução continuam protegidos contra exclusão.

## Criptografia

O modo LUKS armazena um sistema de arquivos ext4 diretamente em um arquivo `changes.luks` LUKS2; não há tabela de partição nem container DynFileFS aninhado. As opções LUKS estão disponíveis apenas quando `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` e `losetup` estão presentes.

A criação interativa LUKS solicita a senha duas vezes. Operações que leem ou criam dados LUKS podem ler a senha da entrada padrão com `--password-stdin`. As senhas não são colocadas em argumentos de comando ou metadados de sessão. No boot, o initrd solicita a senha no console e não faz fallback para persistência não criptografada caso a ativação falhe.

Exportações LUKS contêm arquivos lógicos de sessão descriptografados, não `changes.luks`. Importar ou converter para LUKS cria um novo container criptografado.

## Backups e recuperação

Para sessões nativas, DynFileFS, raw e LUKS, use `export` para backups em vez de copiar o diretório de uma sessão montada. Mantenha o arquivo de backup resultante em outro dispositivo e verifique se ele pode ser listado ou importado antes de confiar nele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso. Para procedimentos de backup de SquashFS e de dispositivo inteiro, consulte [Backup e recuperação](/administration/Backup-Recovery.md).

Para recuperação após falha total do dispositivo de armazenamento, gravação interrompida ou criação repetida de sessões vazias, siga o guia dedicado de [recuperação do DynFileFS e dynblk](./DynFileFS-Recovery.md).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos de containers são verificados antes da ativação como graváveis. Falhas graves na verificação do sistema de arquivos preservam o container para recuperação em vez de montá-lo como gravável. SquashFS detecta um estado anterior não limpo e restaura o último snapshot salvo com sucesso. Exclua sessões apenas pelo Gerenciador de Sessões ou `minios-session delete`; não remova diretórios de sessão manualmente.
