---
updated: 2026-09-13
---

# Internos de persistência

Esta página explica os parâmetros de boot `perch`, `perchdir`, `perchmode`, `perchsize` e `perchreserve`. Esses parâmetros controlam onde as alterações de uma sessão live são armazenadas. Para uso normal, selecione uma entrada persistente no menu de boot ou utilize o Gerenciador de sessões MiniOS em vez de editá-los manualmente.

MiniOS constrói o root live a partir de módulos somente leitura e uma camada superior gravável.
O initrd decide se essa camada superior será uma sessão persistente numerada ou um diretório temporário em RAM. Esta página descreve essa decisão e o caminho de ativação durante o boot. Para os controles voltados ao usuário, veja [Modos de boot](/using-minios/Boot-Modes) e [Parâmetros de boot](/reference/Boot-Parameters).

## Em linguagem simples

Sem um parâmetro de persistência, o MiniOS coloca as alterações em RAM e as descarta ao desligar. Um parâmetro de persistência faz com que o MiniOS localize um armazenamento gravável, selecione ou crie uma sessão numerada, verifique a compatibilidade e utilize essa sessão como camada gravável.

Solicitar persistência não garante que ela foi ativada. Se o destino estiver somente leitura, cheio, danificado ou incompatível, o MiniOS pode continuar com uma camada temporária em RAM. Leia o aviso de inicialização antes de confiar nas alterações salvas.

## Parâmetros explicados

| Parâmetro | O que informa MiniOS | Escolha típica |
|---|---|---|
| `perchdir=resume` | Abre a sessão padrão compatível e, sob condições suportadas, cria uma substituta quando não pode ser usada. | Trabalho diário normal. |
| `perchdir=new` | Cria uma nova sessão numerada. | Mantém um workspace existente inalterado. |
| `perchdir=ask` | Exibe sessões salvas após encontrar um armazenamento retomável e permite escolher uma. Não pode criar a primeira sessão em um armazenamento vazio. | Vários workspaces existentes em um dispositivo; use `perchdir=new` para a primeira sessão. |
| `perchdir=NUMBER` | Solicita uma sessão numerada específica. | Entrada de boot personalizada estável após verificar o ID da sessão. |
| `perchmode=MODE` | Selecione `native`, `dynfilefs`, `dynblk`, `raw`, `luks`, ou uma `squashfs` sessão existente. | Corresponde ao sistema de arquivos de armazenamento, comportamento do contêiner em bloco e requisito de criptografia. |
| `perchsize=SIZE` | Solicita o tamanho de uma sessão de contêiner nova ou em expansão. | DynFileFS, dynblk, raw ou armazenamento LUKS. |
| `perchreserve=MB` | Subtrai uma margem ao dimensionar um contêiner novo ou em expansão e define o limite de aviso de pouco espaço. | Reserva espaço de trabalho ao alocar um contêiner; não é uma cota de tempo de execução. |
| `perch` | Usa o comportamento de retomada antigo sem criação automática de substituto. | Compatibilidade com uma entrada personalizada existente; prefira `perchdir=resume` para menus atuais. |

Não combine persistência com `toram` quando você espera que as alterações sejam gravadas de volta no dispositivo original. MiniOS ativa a sessão copiada em RAM, e as alterações nessa cópia são perdidas ao desligar.

## Persistência é explícita

O initrd só ativa o gerenciamento de persistência quando a linha de comando do kernel contém um destes tokens reconhecidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Sem nenhum desses tokens, inclusive quando apenas um nome `perch...` não reconhecido está presente, o MiniOS cria uma nova camada superior gravável em RAM. As alterações feitas durante esse boot são descartadas ao desligar.

Os seletores não são todos equivalentes:

| Seletor | Comportamento do initrd |
|---|---|
| `perch` | Tenta retomar o padrão dos metadados. Não cria automaticamente uma sessão quando nenhuma está disponível ou quando as verificações de compatibilidade falham. |
| `perchdir=resume` | Tenta o padrão dos metadados e pode criar automaticamente uma nova substituta compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca um diretório cujo ID numérico é um a mais que o maior ID existente. Nunca reutiliza um diretório existente. |
| `perchdir=ask` | Oferece sessões existentes após encontrar um armazenamento retomável e o padrão. Uma sessão existente incompatível exige confirmação. Em armazenamento vazio, use `perchdir=new` para criar a primeira sessão. |
| `perchdir=NUMBER` | Usa esse diretório quando ele existe. Se não existir, a seleção pode recorrer ao padrão registrado nos metadados; não reserva o número solicitado. |

Outros parâmetros de persistência reconhecidos sem seletor entram no mesmo caminho legado de retomada que o `perch` isolado: solicitam persistência, mas não permitem criação automática. Se a seleção ou ativação não produzir uma camada superior utilizável, o boot continua normalmente com a camada superior RAM e publica um aviso de falha.

## Armazenamento e localização da sessão

O armazenamento padrão fica no diretório `changes` ao lado dos dados MiniOS, com diretórios de sessão numerados e `session.conf` ou `session.json` metadados:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

O armazenamento também pode ser selecionado como um dispositivo mais um caminho opcional. As formas aceitas incluem um caminho direto `/dev/...` , `/dev/disk/by-label/LABEL/...` , `/dev/mapper/...` , `label:LABEL/...` , `askdisk` e `askdisk:custom:path`. O sufixo separado por dois-pontos se torna um caminho abaixo do dispositivo selecionado; a sintaxe com barra após `askdisk` descarta silenciosamente esse caminho personalizado. Um subdiretório selecionado é montado via bind como o armazenamento da sessão. MiniOS também pode detectar uma partição de persistência no mesmo disco e armazenamento de persistência Ventoy compatível.

Antes da seleção da sessão, o initrd deve montar o local como gravável e comprovar que consegue criar e remover um marcador no armazenamento. Um dispositivo de bloco que não pode ser aberto para gravação, uma montagem somente leitura, um caminho indisponível ou uma falha no teste de gravação impedem a persistência para essa inicialização. Sessões existentes não são consideradas confiáveis apenas porque seus arquivos podem ser lidos.

## Seleção e compatibilidade

Os metadados da sessão registram o modo de armazenamento e podem registrar a versão, edição, sistema de arquivos de união e tamanho do container MiniOS. A retomada compara o modo, versão, edição e união registrados com o modo solicitado e o sistema atual.
Campos de compatibilidade legados ausentes não são tratados como incompatibilidades.

O `perchdir=resume` literal cria uma nova sessão numerada quando o padrão está ausente ou quando um modo, versão, edição ou união registrados tornam o padrão inadequado. O `perch` isolado, uma seleção numérica direta e outras solicitações legadas de retomada recusam substituição automática e continuam em RAM após falha na seleção. O `perchdir=ask` exibe informações de compatibilidade e permite uma substituição explícita. Uma nova sessão usa `native` como padrão, a menos que outro modo tenha sido solicitado.

O modo de armazenamento faz parte da compatibilidade. Se a seleção chegar ao despacho do backend, um modo solicitado desconhecido recai para `native`, cujo teste pode então selecionar DynFileFS em um armazenamento inadequado. Uma sessão existente com modo registrado diferente pode falhar na verificação de compatibilidade anterior; uma retomada legada então continua em RAM em vez de chegar a esse fallback.

## Reserva de espaço e tamanhos

MiniOS usa 256 MiB como margem de alocação padrão e limite de aviso de pouco espaço. O cálculo utiliza blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem sinal e sem unidade, limitado a 4096, e retorna ao valor 256 quando ausente ou inválido. A margem reduz o espaço oferecido para um contêiner novo ou em expansão. Não é uma cota: uma sessão nativa ou gravações posteriores ainda podem consumir o espaço restante do sistema de arquivos. O boot avisa quando o espaço livre atual está igual ou abaixo do limite.

Os tamanhos dos contêineres usam valores inteiros alocados em MiB:

- Um número simples, `M`, ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- O pedido lógico máximo é de 1.000.000 MiB, limitado ainda pelo espaço disponível após a reserva.
- Gerenciador de sessões MiniOS limita arquivos raw e LUKS a 4000 MiB em FAT32. Durante a ativação no initrd, o limite é aplicado de forma confiável ao LUKS, enquanto um pedido raw acima do limite pode chegar a ser alocado e falhar, em vez de ser reduzido.
- Novas sessões raw e LUKS usam 4000 MiB por padrão.
- Uma nova sessão DynFileFS criada pelo initrd usa, por padrão, a capacidade disponível após a reserva, arredondada para baixo para um múltiplo de 1000 MiB quando possível.
- Uma nova sessão dynblk usa, por padrão, um dispositivo de bloco virtual thin de 16 GiB quando `perchsize` não é especificado. O tamanho virtual dynblk explícito é limitado a 512 GiB; os arquivos físicos de apoio são criados sob demanda e dependem do espaço livre no host e da admissão de memória dynblk.

O crescimento do contêiner é feito por melhor esforço e a redução de tamanho não é suportada. `perchsize` não dimensiona sessões nativas ou SquashFS. Gerenciador de sessões MiniOS usa 4000 MiB por padrão para criação raw/DynFileFS/LUKS e 16 GiB para dynblk; veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação do armazenamento

Todos os modos bem-sucedidos devem fornecer o upper gravável esperado pelo sistema de arquivos union selecionado. Montar um backend não prova, por si só, que a persistência está ativa. Native, DynFileFS, dynblk, raw e LUKS podem atualizar os metadados persistentes da sessão antes da validação do union; SquashFS adia esse commit de metadados. O estado protegido do boot atual só é publicado após a confirmação de que o union root final usa o upper esperado.

### Native

O modo Native primeiro exclui sistemas de arquivos conhecidos por não serem POSIX, como FAT, exFAT e NTFS. Em seguida, testa o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e verificando alterações no modo executável. Se o teste for bem-sucedido, o diretório da sessão numerada é montado via bind diretamente como área gravável.

Se o sistema de arquivos for considerado inadequado ou o teste POSIX falhar, o modo Native recai para DynFileFS. Uma falha após a ativação do Native é revertida; um novo candidato vazio é removido quando pode ser removido com segurança.

### DynFileFS

DynFileFS é o backend de contêiner baseado em FUSE. Ele armazena uma imagem de bloco lógica em `changes.dat` mais seus arquivos de segmento numerados. O auxiliar deve montar com sucesso e expor `virtual.dat`; caso contrário, a ativação falha em vez de criar acidentalmente um arquivo apenas RAM com nome que parece persistente.

A imagem lógica contém ext4. Imagens existentes são verificadas antes da montagem gravável; resultados do fsck acima do status de erros corrigidos rejeitam a sessão em vez de montá-la como gravável. O redimensionamento é apenas para crescimento, e o sistema de arquivos ext4 interno é expandido quando possível. Para diagnóstico voltado ao usuário, veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### dynblk

O `dynblk` modo é um backend de dispositivo de bloco do kernel, separado do DynFileFS. Cada sessão numerada possui um `volume000.db` namespace com arquivos `volume001.db` criados sob demanda como `volume063.db` irmãos. Anexar um volume via `/dev/dynblk-control` retorna um dispositivo de disco inteiro alocado dinamicamente, como `/dev/dynblk0` ou `/dev/dynblk3`; MiniOS deve usar o dispositivo retornado e não deve assumir que `dynblk0` está livre. Vários volumes dynblk podem ser anexados ao mesmo tempo.

MiniOS cria ext4 diretamente no dispositivo de disco inteiro dynblk, verifica o ext4 existente antes do uso gravável e suporta crescimento até o limite do formato 1 de 512 GiB. Redução de tamanho não é suportada. O estado protegido de boot registra exatamente o `/dev/dynblkN` usado pela sessão persistente em execução, para que o desligamento desanexe esse mesmo dispositivo após o sistema de arquivos ser desmontado. Isso permanece correto mesmo quando o Gerenciador de Sessões anexa temporariamente outra sessão dynblk em paralelo.

A capacidade virtual é thin: não é espaço do host pré-alocado. Gravações reais ainda podem falhar por falta de espaço livre no sistema de arquivos inferior, pelo namespace de 64 partes de apoio ou pela admissão de memória dynblk. Um dispositivo com falha ou isolado só é desanexado após o sistema de arquivos upper não estar mais montado; a recuperação valida o formato armazenado no próximo anexo.

### Raw

O modo Raw utiliza uma imagem ext4 fixa em `changes.img`. Novas imagens são alocadas e formatadas antes do uso. Imagens existentes são verificadas antes da montagem, podem ser expandidas para um tamanho maior solicitado e têm o ext4 expandido para usar toda a imagem. Uma verificação ou montagem com falha deixa o container disponível para recuperação e continua o boot em RAM.

### LUKS

O modo LUKS utiliza um container LUKS2 `changes.luks` com ext4 diretamente dentro dele.
Está disponível apenas quando o initrd inclui o marcador de suporte a criptografia e as ferramentas necessárias. A criação solicita confirmação de entrada correspondente. Um container existente permite três tentativas de desbloqueio no console do boot.

O initrd autentica antes de expandir um arquivo criptografado existente, então verifica e expande o ext4 antes de montá-lo. Se a criação, desbloqueio, verificação, redimensionamento ou montagem falhar, o MiniOS limpa o mapeamento e continua em RAM. Nunca recai para native, DynFileFS, raw ou qualquer outra persistência não criptografada.
As senhas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando.
Veja [Segurança](/maintenance-and-recovery/Security).

### SquashFS

O initrd só pode ativar uma sessão SquashFS existente; não pode criar uma nova `changes.sb`. A ativação valida metadados estritos e de valor único para o snapshot, incluindo seu digest, tamanhos compactados e descompactados, contagem de entradas, tipo de união e política de salvamento. Também verifica o tipo e tamanho exato do arquivo, RAM e swap disponíveis, o digest SHA-256 antes e depois da extração e a compatibilidade atual da união.

O snapshot é extraído com tratamento rigoroso de erros e xattr para uma imagem ext4 temporária e limitada em RAM. Para OverlayFS, essa imagem contém diretórios `changes` e `workdir` separados; para AUFS, sua raiz é o branch gravável.
Metadados malformados, memória insuficiente, alterações no digest, erros de extração ou uma política inválida fazem a ativação falhar e deixam o boot na camada superior RAM padrão.

Uma sessão marcada como `dirty` indica que o boot anterior não completou a transição de desligamento limpo. SquashFS então exibe um aviso e restaura o último `changes.sb` salvo com sucesso; alterações não salvas do boot interrompido não são consideradas uma segunda geração de rollback.

O Gerenciador de sessões MiniOS e o backend de salvamento do sistema criam e substituem snapshots SquashFS de forma atômica, usando captura exata. A ativação no boot pode ler um snapshot existente de FAT, exFAT ou NTFS graváveis porque a extração ocorre na camada superior ext4 temporária. A criação e o salvamento exato continuam restritos ao sistema de arquivos: sua área de preparação privada deve preservar links, propriedade, modos, xattrs, ACLs, capacidades e whiteouts de união, então o salvamento atual requer um sistema de arquivos POSIX adequado. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação da união e limite de recuperação

Para AUFS, a raiz de alterações ativada se torna o branch zero gravável. Para OverlayFS, o initrd constrói `upperdir` e `workdir` abaixo da raiz de alterações ativada e monta os módulos somente leitura como diretórios inferiores. O initrd então verifica o branch AUFS live ou o OverlayFS `upperdir` antes de publicar a persistência como ativa.

Se um backend de persistência, atualização de metadados ou essa verificação falhar, seus pontos de montagem são desfeitos quando possível, nenhum estado de persistência bem-sucedido é publicado e o boot gravável continua em RAM. Falha ao construir a união root entra no shell fatal do initramfs. Sair desse shell pode permitir que a configuração continue com uma root inválida; isso não é um reparo nem um fallback seguro. O AUFS mantém anexos de branch de módulo conforme possível, mas uma união incompleta cruza o limite de recuperação: MiniOS não marca a persistência como ativa.

Falhas na verificação de containers evitam deliberadamente montar uma sessão suspeita como gravável.
Não substitua nem reconstrua arquivos de sessão durante o boot. Preserve primeiro o armazenamento afetado; veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado ativo, em execução e de boot atual

Nos metadados persistentes da sessão, `default=` é a sessão **ativa** selecionada para o próximo resume, enquanto `running=` é a sessão registrada como fornecedora do boot atual. A ativação grava ambos os campos e marca essa sessão como `dirty`.
Após os pontos de montagem de persistência desaparecerem durante um desligamento limpo, MiniOS remove `running=` e marca a sessão como `clean`.

Esses campos de metadados podem ficar desatualizados após uma falha, gravação de metadados malsucedida, falha na construção do union, cópia do armazenamento ou desligamento interrompido. Componentes em tempo de execução que permitem salvar não confiam apenas em `running=`. Eles usam o estado protegido de boot atual do initrd, vinculado ao ID do boot, sessão numérica, modo, identidade real do armazenamento, status de gravação, durabilidade, geração ativa verificada e, para dynblk, o exato dispositivo anexado `/dev/dynblkN`. Uma falha ou ausência do registro de boot atual significa que a persistência não deve ser tratada como destino de salvamento aprovado.

Com `toram` e uma solicitação de persistência reconhecida, o armazenamento da sessão é copiado para RAM antes da ativação. A sessão copiada pode ser gravável e fornecer o upper em execução, mas seu estado de boot atual é marcado como não durável. Alterações nessa cópia RAM não retornam ao dispositivo original e são perdidas ao desligar.

Para orientações operacionais relacionadas, veja [Modos de boot](/using-minios/Boot-Modes), [Parâmetros de boot](/reference/Boot-Parameters), [Sessões e persistência](/using-minios/Sessions-and-Persistence), [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Segurança](/maintenance-and-recovery/Security), e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).
