---
updated: 2026-09-16
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
| `native` | Alterações armazenadas diretamente no diretório da sessão | Requer um sistema de arquivos gravável que preserve os metadados do Linux e as operações para as quais MiniOS faz sondagens. A capacidade acompanha o espaço livre do armazenamento de base; `perchsize` não se aplica. | Não |
| `dynfilefs` | ext4 expansível `virtual.dat`com arquivos de segmento formato-400 como backend | Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT. O payload é enxuto, mas o índice de mapeamento escala conforme a capacidade lógica declarada. | Sim |
| `dynblk` | Sistema de arquivos ext4 fino em um dispositivo de bloco do kernel com backend de `volumeNNN.db` arquivos | Requer o CLI DynBlk, módulo do kernel e suporte no initrd. O tamanho criado na inicialização é de até 16 GiB por padrão; o limite do formato é 512 GiB. O mapeamento esparso RAM é orçado separadamente. | Sim |
| `raw` | Arquivo único `changes.img` contendo ext4 | Capacidade lógica fixa, com crescimento apenas explícito. Funciona em sistemas de arquivos POSIX graváveis, FAT32, NTFS e exFAT; no FAT32 o limite é 4000 MiB. | Sim |
| `squashfs` | Snapshot compactado em `changes.sb`; a camada superior gravável em tempo de execução é reconstruída em RAM | `perchsize` não se aplica. Snapshots existentes podem ser restaurados a partir de mídias graváveis compatíveis, enquanto o salvamento exato exige um sistema de arquivos POSIX para staging. | Não |

Raw, DynFileFS e DynBlk podem opcionalmente usar uma camada de criptografia LUKS2. O backend de armazenamento permanece conforme o modo de sessão, e os metadados da sessão registram a criptografia separadamente. DynFileFS e raw criados com `minios-session` têm padrão de 4000 MiB; DynBlk tem padrão de 16 GiB. Os valores de tamanho são alocados em MiB; `GB` e `TB` sufixos convertem para 1000 e 1.000.000 MiB. Raw é limitado a 4000 MiB no FAT32, criptografado ou não. O payload de DynFileFS cresce sob demanda, mas seu índice formato-400 é dimensionado para a capacidade lógica total e consome cerca de 2 MiB de RAM mais cerca de 2 MiB de armazenamento de backend por GiB. A capacidade de DynBlk é fina e seu mapeamento em tempo de execução é esparso: mapeamentos densos consomem cerca de 8 MiB/GiB, enquanto capacidade virtual não utilizada não consome chunk de mapeamento. O driver DynBlk seleciona automaticamente seu orçamento de mapeamento em cerca de 25% do RAM utilizável, limitado a 4096 MiB; MiniOS não altera essa política. As gravações reais continuam limitadas pelo espaço livre do sistema de arquivos subjacente e pela admissão de recursos do backend. As operações de redimensionamento de contêiner só permitem aumentar a sessão; redução não é suportada.

O modo nativo é a opção mais simples e rápida em um sistema de arquivos compatível.
Use DynFileFS quando o sistema de arquivos de persistência não puder representar os metadados do Linux.
Use DynBlk quando desejar um dispositivo de bloco real do kernel com arquivos de backend finos; o driver pode manter vários volumes DynBlk independentes conectados ao mesmo tempo, e o Gerenciador de Sessão usa o caminho do dispositivo retornado pelo driver em vez de assumir que `/dev/dynblk0` está livre.
Use raw quando for necessário alocação fixa, adicione LUKS2 quando a sessão precisar ser criptografada e utilize SquashFS para um snapshot compactado exato.

Execute os comandos a seguir para inspecionar o sistema de arquivos de persistência real e os modos disponíveis nele:

```bash
sudo minios-session info
sudo minios-session status
```

Nenhuma sessão pode ser criada em mídia somente leitura. O initrd pode ler e ativar um snapshot SquashFS existente armazenado em FAT, exFAT ou NTFS graváveis, pois extrai o snapshot para uma camada superior ext4 temporária. Criar ou salvar exatamente um snapshot é diferente: seu espaço de trabalho privado de staging deve estar em um sistema de arquivos POSIX adequado que preserve os metadados do Linux e whiteouts de união.

## Seleção de boot

Qualquer parâmetro de persistência reconhecido ativa o gerenciamento de persistência. Os menus de boot MiniOS normalmente oferecem opções para retomar, criar nova sessão, selecionar e inicializar sem persistência. A descrição padrão dos comportamentos de seleção, compatibilidade, fallback e ativação está em [Persistência initrd](/reference/boot-process/Persistence-Internals).

| Parâmetro | Significado |
|-----------|---------|
| `perch` | Usa o caminho de retomada legado, com melhor esforço. Tenta o padrão do metadado, mas não cria um substituto caso nenhum esteja disponível. |
| `perchdir=resume` | Retoma o padrão do metadado e, quando ausente ou incompatível, permite que o initrd crie um novo substituto compatível. Esse é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca uma nova sessão numerada. |
| `perchdir=ask` | Seleciona uma sessão existente ou cria uma durante o boot. |
| `perchdir=<id>` | Seleciona diretamente essa sessão numerada. |
| `perchdir=<device/path>` | Utiliza um local de persistência em um dispositivo, incluindo `/dev/...` e `label:...` formatos gerenciados pelo initrd. |
| `perchmode=<mode>` | Define `native`, `dynfilefs`, `dynblk`, `raw`, ou `squashfs`. |
| `perchencrypt=luks` | Criptografa uma sessão recém-criada Raw, DynFileFS ou DynBlk com LUKS2. Sessões já existentes só herdam criptografia a partir dos metadados. |
| `perchcomp=<codec>` | Seleciona compressão de backend DynBlk para uma nova sessão DynBlk. A compressão é forçada para `none` quando DynBlk está protegida por LUKS2. |
| `perchsize=<size>` | Define um novo tamanho de container ou aumenta o existente; valores simples são alocados em MiB e `MB`, `GB`, e `TB` sufixos são aceitos. |

Se nenhum modo for especificado para uma nova sessão, o boot utiliza o modo nativo. Em FAT32/NTFS/exFAT, a criação nativa recai para DynFileFS. Um novo container raw tem tamanho padrão de 4000 MiB. Novas sessões de boot DynFileFS e DynBlk sem `perchsize` usam até 16 GiB; se restar menos espaço disponível após a reserva de segurança, o tamanho automático é reduzido. DynFileFS também considera a sobrecarga do índice e o limite RAM. O crescimento explícito de DynBlk é limitado a 512 GiB.
Sessões SquashFS podem ser capturadas do sistema em execução pelo Gerenciador de sessões MiniOS ou `minios-session create squashfs`. A configuração do initrd cria apenas os metadados da sessão de geração zero e mantém a camada superior gravável em RAM. O sistema em execução cria o primeiro `changes.sb` snapshot sob demanda ou no desligamento.

Ao retomar, MiniOS verifica a versão registrada, edição, sistema de arquivos union e modo. O uso literal de `perchdir=resume` pode criar uma nova sessão em vez de usar o padrão ausente ou incompatível. O uso simples de `perch`, seleção numérica direta e outras solicitações de retomada legadas não criam automaticamente esse substituto.
A seleção interativa exibe um aviso antes de permitir uma sessão incompatível. Se a seleção ou ativação ainda falhar, o boot normalmente continua com uma camada superior RAM e um aviso de persistência.

O armazenamento de sessões tem esta estrutura:

```text
minios/changes/
|-- session.conf
|-- 1/
|-- 2/
`-- N/
```

`session.conf` registra os IDs padrão e em uso, além do modo, versão, edição, sistema de arquivos union, tamanho, estado e configurações específicas de modo para cada sessão.
São metadados persistentes gravados pela implementação de boot, mas não servem como prova do estado atual de execução. Não edite nem mova dados de sessões numeradas enquanto uma sessão estiver montada; utilize o Gerenciador de sessões MiniOS ou `minios-session`.

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

Listar sessões e inspecionar o repositório:

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
sudo minios-session create raw 4GB
sudo minios-session create raw 4GB --encryption luks
sudo minios-session create squashfs --policy shutdown
sudo minios-session create squashfs --policy manual --autosave 60
```

`create` sem um modo seleciona o nativo. A criação de SquashFS captura as alterações em tempo real e não possui tamanho fixo. A política de desligamento padrão é `shutdown`; o salvamento periódico vem desativado por padrão.

Salvar e configurar uma sessão SquashFS:

```bash
sudo minios-session save <running-squashfs-id>
sudo minios-session settings <squashfs-id> --shutdown on
sudo minios-session settings <squashfs-id> --shutdown off --autosave 0
sudo minios-session settings <squashfs-id> --shutdown on --autosave 60
```

Os intervalos periódicos válidos são `30`, `60`, `120`, `240`, e `480` minutos; `0` desativa o salvamento periódico. As configurações de desligamento e de salvamento periódico são independentes.

Exportar e importar `.tar.zst`arquivos de backup:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst
sudo minios-session import /path/to/session.tar.zst --auto-convert
sudo minios-session import /path/to/session.tar.zst --force-mode dynfilefs
sudo minios-session import /path/to/session.tar.zst --force-mode dynblk
sudo minios-session import /path/to/session.tar.zst --force-mode raw --force-encryption luks
```

Apenas `.tar.zst` importações são aceitas. Os caminhos e membros do arquivo são validados, e a extração é limitada. `--auto-convert` escolhe um modo compatível com o sistema de arquivos atual. `--force-mode <mode>` seleciona explicitamente um modo disponível. Exportação, cópia e conversão não são suportadas para sessões SquashFS; salve o snapshot e copie todo o diretório da sessão inativa.

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

`copy` é uma cópia lógica do sistema de arquivos e sempre gera um novo ID de sessão. Permite alterar backend, capacidade ou criptografia e cria novas identidades ext4 e LUKS. `clone` copia fisicamente um backend destacado e preserva o header LUKS, keyslots, UUID LUKS e UUID ext4. `convert` substitui a origem por padrão; use `--new-session` para manter a origem. O tamanho só é relevante para um destino do tipo container.

Expandir, excluir ou limpar sessões:

```bash
sudo minios-session resize <id> 8GB
sudo minios-session delete <id>
sudo minios-session cleanup
sudo minios-session cleanup --days 30
```

O redimensionamento suporta sessões DynFileFS, DynBlk e raw, inclusive criptografadas, e exige um tamanho maior que o atual. O redimensionamento DynBlk aumenta primeiro o dispositivo de bloco virtual e depois expande o sistema de arquivos ext4; não pré-aloca a nova capacidade virtual. A limpeza padrão remove sessões com mais de 30 dias.

Todos os comandos aceitam `--json`, e é possível selecionar um repositório de sessões diferente com `--sessions-dir PATH`:

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

Para sessões nativas, DynFileFS, DynBlk e sessões brutas, incluindo as criptografadas, utilize `export` para backups lógicos em vez de copiar o diretório de sessão montado. Armazene o arquivo gerado em outro dispositivo e verifique se ele pode ser importado antes de confiar nele. A importação sempre cria uma nova sessão numerada; ative-a explicitamente quando estiver pronta para uso.
Para procedimentos de backup de SquashFS e de dispositivo inteiro, consulte [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).

Se uma sessão falhar após o armazenamento encher, uma gravação for interrompida ou sessões vazias forem criadas repetidamente, pare de modificar o armazenamento afetado. Exporte primeiro uma sessão legível e não ativa, se possível, e depois siga para [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

Inicie o diagnóstico sem modificar os dados da sessão:

```bash
sudo minios-session list
sudo minios-session active
sudo minios-session running
sudo minios-session status
sudo minios-session info
```

Na inicialização, os sistemas de arquivos dos containers são verificados antes da ativação como graváveis. Falhas graves na verificação do sistema de arquivos preservam o container para recuperação, em vez de montá-lo como gravável. SquashFS detecta um estado anterior não limpo e restaura o último snapshot salvo com sucesso. Exclua sessões apenas pelo Gerenciador de sessões MiniOS ou `minios-session delete`; não remova diretórios de sessão manualmente.
