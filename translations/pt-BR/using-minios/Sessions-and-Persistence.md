---
updated: 2026-09-13
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

| Modo | Armazenamento | Principais restrições |
|------|---------|------------------|
| `native` | Alterações salvas diretamente no diretório da sessão | Requer um sistema de arquivos POSIX gravável, como ext2/3/4, Btrfs, XFS, F2FS ou ReiserFS. |
| `dynfilefs` | Container ext4 expansível dividido em arquivos de apoio | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. Requer o backend DynFileFS. |
| `dynblk` | Sistema de arquivos ext4 fino em um dispositivo de bloco do kernel suportado por `volumeNNN.db` arquivos | Requer o CLI dynblk, módulo do kernel e suporte initrd. O tamanho virtual padrão é 16 GiB e o limite é 512 GiB. |
| `raw` | Arquivo de tamanho fixo `changes.img` contendo ext4 | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. |
| `luks` | Arquivo LUKS2 criptografado `changes.luks` contendo ext4 | Requer `cryptsetup`, suporte a loop e o gancho initrd LUKS MiniOS. |
| `squashfs` | Snapshot compactado em `changes.sb` | Para salvar, é necessário um sistema de arquivos POSIX persistente que preserve links, propriedades, modos, xattrs, ACLs, capacidades e whiteouts. |

`dynfilefs`, `raw`, e `luks` criados com `minios-session` têm padrão de 4000 MiB; `dynblk` tem padrão de 16 GiB. Os valores de tamanho são alocados em MiB; `GB` e `TB` sufixos convertem para 1000 e 1.000.000 MiB. O Gerenciador de sessões MiniOS limita arquivos raw e LUKS a 4000 MiB em FAT32. A capacidade do dynblk é virtual e fina, não pré-alocada, mas as gravações reais continuam limitadas pelo espaço livre do sistema de arquivos inferior e pela admissão de recursos do dynblk. Operações de redimensionamento de container só permitem aumentar a sessão; reduzir não é suportado.

O modo nativo é a escolha mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não conseguir representar metadados do Linux.
Use dynblk quando você precisar de um dispositivo de bloco real do kernel com arquivos de apoio finos; o driver pode manter vários volumes dynblk independentes conectados ao mesmo tempo, e o Gerenciador de sessões utiliza o caminho do dispositivo retornado pelo driver, em vez de assumir que `/dev/dynblk0` está livre.
Use raw quando for necessário alocação fixa, LUKS quando a sessão precisar ser criptografada e SquashFS para um snapshot compactado exato.

Execute os comandos a seguir para inspecionar o sistema de arquivos de persistência real e os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Nenhuma sessão pode ser criada em mídia somente leitura. O initrd pode ler e ativar um snapshot SquashFS existente armazenado em FAT, exFAT ou NTFS gravável, pois ele extrai o snapshot para um ext4 temporário superior. Criar ou salvar exatamente um snapshot é diferente: seu espaço de trabalho privado de preparação deve estar em um sistema de arquivos POSIX adequado que preserve metadados do Linux e whiteouts de união.

## Seleção de boot

Qualquer parâmetro de persistência reconhecido habilita o gerenciamento de persistência. Os menus de boot MiniOS normalmente oferecem opções de retomar, novo, seleção e entradas não persistentes. A descrição canônica dos comportamentos de seleção, compatibilidade, fallback e ativação está em [Persistência initrd](/reference/boot-process/Persistence-Internals).

| Parâmetro | Significado |
|-----------|---------|
| `perch` | Usa o caminho legado de retomada best-effort. Tenta o padrão de metadados, mas não cria um substituto quando nenhum está utilizável. |
| `perchdir=resume` | Retoma o padrão de metadados e, quando ausente ou incompatível, permite que o initrd crie um novo compatível. Esse é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca uma nova sessão numerada. |
| `perchdir=ask` | Seleciona uma sessão existente ou cria uma durante o boot. |
| `perchdir=<id>` | Seleciona diretamente essa sessão numerada. |
| `perchdir=<device/path>` | Usa um local de persistência em um dispositivo, incluindo `/dev/...` e `label:...` formatos tratados pelo initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, ou `squashfs`. |
| `perchsize=<size>` | Define um novo tamanho de container ou aumenta o existente; valores simples são alocados em MiB e `MB`, `GB`, e `TB` sufixos são aceitos. |

Se nenhum modo for especificado para uma nova sessão, o boot usa o modo nativo. Em FAT32/NTFS/exFAT, a criação nativa recai para DynFileFS. Um novo container raw ou LUKS tem padrão de 4000 MiB; uma nova sessão DynFileFS de boot sem `perchsize` é dimensionada pelo espaço disponível, mantendo uma reserva de segurança. Uma nova sessão dynblk de boot sem `perchsize` usa o padrão de 16 GiB do driver; o crescimento explícito do dynblk é limitado a 512 GiB.
Sessões SquashFS são capturadas do sistema em execução com o Gerenciador de sessões MiniOS ou `minios-session create squashfs`; `perchdir=new perchmode=squashfs` não cria um snapshot no initrd.

Ao retomar, MiniOS verifica a versão registrada, edição, sistema de arquivos union e modo. O `perchdir=resume` pode criar uma nova sessão em vez de usar um padrão ausente ou incompatível. Seleção numérica direta e outras solicitações de retomada legadas não criam automaticamente esse substituto.`perch`, seleção numérica direta e outras solicitações de retomada legadas não criam automaticamente esse substituto.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível. Se a seleção ou ativação ainda falhar, o boot normalmente continua com um upper RAM e um aviso de persistência.

O repositório de sessões tem esta forma:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra os IDs padrão e em execução, além do modo, versão, edição, sistema de arquivos union, tamanho, estado e configurações específicas de modo por sessão.
São metadados persistentes gravados pela implementação de boot, não sendo por si só prova do estado atual de execução. Não edite nem mova dados de sessões numeradas enquanto uma sessão estiver montada; utilize o Gerenciador de sessões MiniOS ou `minios-session`.

## Sessões ativas e em execução

Estes termos descrevem estados diferentes:

- A sessão **ativa** é a padrão selecionada para a próxima inicialização.
- Conceitualmente, a sessão **em execução** é aquela cuja camada gravável realmente fornece persistência para a inicialização atual.

O campo persistente `running=` registra essa relação pretendida. Uma falha, erro na construção da união, cópia do armazenamento ou desligamento interrompido pode deixá-lo desatualizado, mesmo quando a inicialização atual está usando RAM ou outra sessão. Por isso, operações como SquashFS exigem o estado protegido do initrd, vinculado ao boot-ID e o upper montado e verificado; não confiam apenas em `running=` sozinho. Veja [Estado ativo, em execução e de inicialização atual](/reference/boot-process/Persistence-Internals#active-running-and-current-boot-state).

Ativar uma sessão altera a próxima inicialização, mas não troca o sistema de arquivos union atual:

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

`create` sem modo seleciona o nativo. A criação SquashFS captura as alterações ao vivo atuais e não tem tamanho fixo. A política de desligamento padrão é `shutdown`; o salvamento periódico vem desativado por padrão.

Salve e configure uma sessão SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Intervalos periódicos válidos são `30`, `60`, `120`, `240`, e `480` minutos; `0` desativa o salvamento periódico. As configurações de desligamento e periódicas são independentes.

Exporte e importe `.tar.zst` arquivos de backup:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
```

Apenas `.tar.zst` importações são aceitas. Caminhos e membros do arquivo são validados e a extração é limitada. `--auto-convert` escolhe um modo compatível para o sistema de arquivos atual. `--force-mode <mode>` seleciona explicitamente um modo disponível. Exportação, cópia e conversão não são suportadas para sessões SquashFS; salve o snapshot e copie o diretório completo da sessão inativa.

Copie ou converta uma sessão:

```bash
sudo minios-session copy <id>
sudo minios-session copy <id> --to-mode raw --size 4GB
sudo minios-session copy <id> --to-mode dynblk --size 16GB
sudo minios-session convert <id> dynfilefs --size 4GB
sudo minios-session convert <id> dynblk --size 16GB --new-session
sudo minios-session convert <id> luks --size 4GB --new-session
```

`copy` sempre atribui um novo ID de sessão. `convert` substitui a origem por padrão; use `--new-session` para preservar a origem. O tamanho é relevante apenas para destino em container.

Aumente, exclua ou limpe sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento suporta sessões DynFileFS, dynblk, raw e LUKS e requer um tamanho maior que o atual. O redimensionamento do dynblk aumenta primeiro o dispositivo de bloco virtual e depois expande seu sistema de arquivos ext4; ele não pré-aloca a nova capacidade virtual. A limpeza remove sessões com mais de 30 dias por padrão.

Todos os comandos aceitam `--json`, e um repositório de sessões diferente pode ser selecionado com `--sessions-dir PATH`:

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

O modo LUKS armazena um sistema de arquivos ext4 diretamente em um arquivo LUKS2 `changes.luks`; não há tabela de partição nem contêiner DynFileFS aninhado. As opções LUKS estão disponíveis apenas quando `/run/initramfs/etc/minios-initramfs-crypt`, `cryptsetup` e `losetup` estão presentes.

A criação interativa de LUKS solicita a senha duas vezes. Operações que leem ou criam dados LUKS podem ler a senha da entrada padrão usando `--password-stdin`.
Senhas não são colocadas em argumentos de comando nem em metadados da sessão. No boot, o initrd solicita a senha no console e não recai para persistência não criptografada se a ativação falhar.

Exportações LUKS contêm arquivos lógicos da sessão descriptografados, não `changes.luks`.
Importar ou converter para LUKS cria um novo contêiner criptografado.

## Backups e sessões com falha

Para sessões nativas, DynFileFS, dynblk, raw e LUKS, use `export` para backups em vez de copiar o diretório da sessão montada. Mantenha o arquivo resultante em outro dispositivo e verifique se ele pode ser importado antes de confiar nele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso.
Para procedimentos de backup SquashFS e de disco inteiro, veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se uma sessão falhar após o armazenamento encher, uma gravação for interrompida ou sessões vazias forem criadas repetidamente, pare de modificar o armazenamento afetado. Exporte primeiro uma sessão não ativa e legível, se possível, depois siga para [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos dos containers são verificados antes da ativação gravável. Falhas graves de verificação preservam o container para recuperação em vez de montá-lo como gravável. SquashFS detecta um estado anterior não limpo e restaura o último snapshot salvo com sucesso. Exclua sessões apenas pelo Gerenciador de sessões MiniOS ou `minios-session delete`; não remova diretórios de sessão manualmente.
