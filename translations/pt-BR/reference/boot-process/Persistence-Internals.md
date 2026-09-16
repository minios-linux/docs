---
updated: 2026-09-16
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
| `perchdir=resume` | Abre a sessão compatível padrão e, quando não for possível utilizá-la, cria uma substituta nas condições suportadas. | Uso diário normal. |
| `perchdir=new` | Cria uma nova sessão numerada. | Mantém um workspace existente inalterado. |
| `perchdir=ask` | Exibe sessões salvas após encontrar um armazenamento que pode ser retomado e permite escolher uma delas. Não é possível criar a primeira sessão em um armazenamento vazio. | Vários workspaces existentes em um dispositivo; use `perchdir=new` para a primeira sessão. |
| `perchdir=NUMBER` | Solicita uma sessão numerada específica. | Entrada personalizada estável após verificar o ID da sessão. |
| `perchmode=MODE` | Selecione `native`, `dynfilefs`, `dynblk`, `raw` ou `squashfs`. | Corresponde ao sistema de arquivos de base e ao modelo de persistência desejado. |
| `perchencrypt=luks` | Adiciona uma camada LUKS2 ao criar uma sessão Raw, DynFileFS ou DynBlk. | Criptografa um backend de container compatível. |
| `perchsize=SIZE` | Solicita o tamanho de uma sessão de container nova ou em expansão. | DynFileFS, DynBlk ou raw; a criptografia não altera a semântica de tamanho do backend. |
| `perchcomp=CODEC` | Seleciona a compactação do backend DynBlk para uma sessão DynBlk recém-criada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate` ou `842`; a disponibilidade ainda depende do kernel em execução. A compactação é desativada quando LUKS envolve DynBlk. |
| `perchreserve=MB` | Subtrai uma margem ao dimensionar um container novo ou em expansão e define o limite de aviso de pouco espaço. | Reserva espaço de trabalho ao alocar um container; não é uma cota de uso em tempo de execução. |
| `perch` | Utiliza o comportamento antigo de retomada, sem criação automática de substitutos. | Compatibilidade com uma entrada personalizada existente; prefira `perchdir=resume` para os menus atuais. |

Não combine persistência com `toram` quando você espera que as alterações sejam gravadas de volta no dispositivo original. MiniOS ativa a sessão copiada em RAM, e as alterações nessa cópia são perdidas ao desligar.

## Persistência é explícita

O initrd só habilita o gerenciamento de persistência quando a linha de comando do kernel contém um destes tokens reconhecidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Sem nenhum desses tokens, inclusive quando apenas um nome `perch...` não reconhecido está presente, MiniOS cria um novo "upper" gravável em RAM. As alterações feitas durante esse boot são descartadas ao desligar.

Os seletores não são todos equivalentes:

| Seletor | Comportamento do initrd |
|---|---|
| `perch` | Tenta retomar o padrão de metadados. Não cria automaticamente uma sessão quando nenhuma está utilizável ou quando as verificações de compatibilidade falham. |
| `perchdir=resume` | Tenta o padrão de metadados e pode criar automaticamente um novo substituto compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=new` | Aloca um diretório cujo ID numérico é um a mais que o maior ID numérico existente. Nunca reutiliza um diretório já existente. |
| `perchdir=ask` | Oferece sessões existentes após encontrar um armazenamento retomável e o padrão. Uma sessão existente incompatível exige confirmação. Em armazenamento vazio, use `perchdir=new` para criar a primeira sessão. |
| `perchdir=NUMBER` | Usa esse diretório quando ele existe. Se não existir, a seleção pode recorrer ao padrão registrado nos metadados; não reserva o número solicitado. |

Outros parâmetros de persistência reconhecidos sem seletor entram no mesmo caminho legado de retomada que `perch`: eles solicitam persistência, mas não habilitam a criação automática. Se a seleção ou ativação não conseguir produzir um "upper" utilizável, o boot continua normalmente com o "upper" RAM e exibe um aviso de falha.

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

MiniOS utiliza 256 MiB como margem de alocação padrão e limite de aviso de pouco espaço. O cálculo usa blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem sinal e sem unidade, limitado a 4096, e retorna para 256 quando está ausente ou inválido. A margem reduz o espaço oferecido a um novo contêiner ou em crescimento. Não é uma cota: uma sessão nativa ou gravações posteriores ainda podem consumir o espaço restante do sistema de arquivos. O Boot exibe um aviso quando o espaço livre atual está igual ou abaixo do limite.

Os tamanhos dos contêineres usam valores inteiros alocados em MiB:

- Um número simples, `M`, ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- Contêineres Raw são limitados a 1.000.000 MiB e pelo espaço disponível após a reserva. DynFileFS possui um limite separado, compatível com RAM, e um teto rígido de 2.000.000 MiB. DynBlk tem seu próprio limite de 512 GiB para formato/ABI.
- Raw é um único arquivo de backend, então o FAT32 limita a 4000 MiB em MiniOS. O mesmo limite se aplica quando Raw está encapsulado em LUKS2.
- Uma nova sessão Raw tem padrão de 4000 MiB. A criptografia não cria uma política de tamanho LUKS separada: um Raw criptografado, DynFileFS ou DynBlk mantém as regras de tamanho do backend subjacente.
- Uma nova sessão DynFileFS criada pelo initrd sem `perchsize` utiliza até 16 GiB de capacidade lógica. Se o armazenamento de backend não puder comportar esse valor após `perchreserve` e a sobrecarga de índice DynFileFS, o padrão é reduzido para a capacidade disponível. Seu índice format-400 consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de backend por GiB de capacidade lógica declarada, mesmo quando o payload está vazio. MiniOS também limita a capacidade DynFileFS pelo espaço físico RAM e por um teto rígido testado de 2.000.000 MiB.
- Uma nova sessão DynBlk sem `perchsize` segue o mesmo teto automático de 16 GiB e é reduzida quando resta menos espaço de backend após `perchreserve`. O tamanho virtual explícito DynBlk ainda é uma solicitação de capacidade thin e é limitado apenas pelo teto de 512 GiB do formato/ABI; arquivos de backend físicos são criados sob demanda. DynBlk possui sua própria política de mapeamento de memória esparsa e não exige que MiniOS dimensione esse orçamento.

O crescimento do contêiner é feito por melhor esforço e a redução de tamanho não é suportada. `perchsize` não define o tamanho de sessões nativas ou SquashFS. O Gerenciador de sessões MiniOS define o padrão de contêineres Raw e DynFileFS criados manualmente para 4000 MiB e DynBlk para 16 GiB; variantes criptografadas usam os mesmos padrões do backend. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação de armazenamento

Todos os backends bem-sucedidos devem fornecer o upper gravável esperado pelo sistema de arquivos em união selecionado. Montar um backend, por si só, não comprova que a persistência está ativa. Nativo, DynFileFS, DynBlk e raw podem atualizar os metadados persistentes da sessão antes da validação da união; SquashFS adia esse commit de metadados. Raw, DynFileFS e DynBlk também podem utilizar criptografia LUKS2. O estado protegido do boot atual só é publicado após a confirmação de que a união raiz final utiliza o upper esperado.

| Backend | Representação persistente | Modelo de capacidade | Requisitos do armazenamento de apoio | Camada LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Arquivos e diretórios diretamente no diretório de sessão numerado | Utiliza o espaço do sistema de arquivos de apoio diretamente; `perchsize` não se aplica | Sistema de arquivos gravável que passa no teste de comportamento POSIX | Não |
| `dynfilefs` | Formato-400 `changes.dat` mais arquivos de segmento expondo um ext4 `virtual.dat` | Payload enxuto com índice denso do tamanho da capacidade | Armazenamento gravável POSIX, FAT32, NTFS ou exFAT | Sim |
| `dynblk` | Formato-1 `volumeNNN.db` arquivos expondo `/dev/dynblkN`, com ext4 sobreposto | Dispositivo de bloco virtual enxuto com mapeamentos esparsos em tempo de execução | Sistema de arquivos aceito pelo backend do kernel DynBlk e recursos de backend suficientes | Sim |
| `raw` | Único arquivo de tamanho fixo `changes.img` contendo ext4 | O arquivo é criado com o tamanho lógico solicitado; apenas crescimento | Sistema de arquivos gravável capaz de armazenar a imagem; FAT32 é limitado a 4000 MiB | Sim |
| `squashfs` | Snapshot `changes.sb` compactado; upper gravável em tempo de execução é reconstruído em RAM | O tamanho do snapshot acompanha as alterações capturadas; `perchsize` não se aplica | Snapshots existentes podem ser lidos de mídias graváveis suportadas, mas o salvamento exato exige um sistema de arquivos de staging compatível com POSIX | Não |

### Nativo

O modo nativo armazena o conteúdo gravável da união diretamente no diretório de sessão numerado. Não há imagem interna, dispositivo de loop, contêiner FUSE ou sistema de arquivos em bloco separado, então a capacidade simplesmente acompanha o espaço livre no sistema de arquivos de origem e `perchsize` não se aplica. Isso gera a menor sobrecarga de contêiner e mantém a visibilidade normal dos arquivos para recuperação e backup.

MiniOS primeiro exclui sistemas de arquivos não POSIX conhecidos, como FAT, exFAT e NTFS. Em seguida, testa o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e verificando alterações no modo executável. Se o teste for bem-sucedido, o diretório de sessão numerado é montado diretamente como área gravável. Se o sistema de arquivos for considerado inadequado ou o teste POSIX falhar, o modo nativo recorre a DynFileFS. Uma falha após a ativação do modo nativo é revertida; um novo candidato vazio é removido quando pode ser removido com segurança.

A camada de persistência MiniOS LUKS2 não envolve o modo nativo porque o modo nativo não possui contêiner ou limite de dispositivo de bloco para criptografar. A persistência nativa ainda pode residir em um armazenamento criptografado fora desta camada de persistência.

### DynFileFS

DynFileFS é o backend de contêiner format-400 baseado em FUSE. Ele expõe uma imagem lógica única `virtual.dat` enquanto armazena os dados em `changes.dat` mais arquivos de segmento numerados. O helper deve montar corretamente e expor `virtual.dat`; caso contrário, a ativação falha em vez de criar acidentalmente um arquivo apenas RAM com um nome que parece persistente.

Seu índice de mapeamento é denso em relação à capacidade lógica declarada: cada bloco lógico de 4 KiB possui um deslocamento de 8 bytes. Isso representa cerca de 2 MiB de índice RAM por GiB de capacidade virtual, e aproximadamente a mesma quantidade é armazenada nos índices dos segmentos de apoio, mesmo antes de os dados de payload serem gravados. A alocação do payload em si permanece dinâmica. Como o binário initrd estático é i686, MiniOS também aplica um limite de tamanho lógico compatível com RAM e um teto rígido de 2.000.000 MiB abaixo do ponto de falha do espaço de endereçamento testado.

A imagem lógica contém ext4. Imagens existentes são verificadas antes do montagem em modo gravável; resultados do fsck acima do status de erros corrigidos rejeitam a sessão em vez de montá-la como gravável. O redimensionamento é apenas para aumento, e o sistema de arquivos ext4 interno é expandido quando possível. Para diagnóstico voltado ao usuário, consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

O `dynblk` modo é um backend de bloco de dispositivo do kernel, separado de DynFileFS. Cada sessão numerada possui um `volume000.db` namespace com criação sob demanda de `volume001.db` até `volume063.db` irmãos. Ao anexar um volume via `/dev/dynblk-control` retorna um dispositivo de disco inteiro alocado dinamicamente, como `/dev/dynblk0` ou `/dev/dynblk3`; MiniOS deve usar o dispositivo retornado e não deve assumir que `dynblk0` está livre. Vários volumes DynBlk podem ser anexados ao mesmo tempo.

MiniOS cria ext4 diretamente no dispositivo de disco inteiro DynBlk, verifica ext4 existente antes do uso em modo de gravação e suporta expansão até o limite do formato 1 de 512 GiB. Redução de tamanho não é suportada. O registro protegido de estado de boot armazena exatamente o `/dev/dynblkN` usado pela sessão persistente em execução, para que o desligamento desanexe esse mesmo dispositivo após o sistema de arquivos ser desmontado. Isso permanece correto mesmo quando o Gerenciador de Sessão anexa temporariamente outra sessão DynBlk em paralelo.

A capacidade virtual é fina: não é espaço pré-alocado no host nem mapeamento RAM. DynBlk mantém 128 mapeamentos lógicos de 4 KiB em cada bloco de 4 KiB em tempo de execução, então a memória de mapeamento denso é cerca de 8 MiB/GiB. Ponteiros de árvore de nível 0 ficam junto desses blocos esparsos; o índice fixo de nó interno é de 396.312 bytes por dispositivo anexado, e os contadores de referência de página física são alocados sob demanda em blocos de 4 KiB que cobrem 8 MiB de espaço de armazenamento. Quando nenhum orçamento explícito de mapeamento é fornecido, o próprio driver DynBlk seleciona aproximadamente 25% do RAM utilizável reportado pelo kernel após normalização de 64 MiB, limitado a 4096 MiB. MiniOS deixa essa política a cargo do driver.

Um novo volume DynBlk pode usar compressão no backend selecionada com `perchcomp`. A compressão é uma propriedade do formato de armazenamento DynBlk e é fixa para o volume após a criação. Se LUKS2 encapsular DynBlk, MiniOS força a compressão DynBlk para `none`, pois a camada de criptografia fica acima do dispositivo DynBlk. Gravações reais ainda podem falhar por falta de espaço livre no sistema de arquivos inferior, pelo namespace de 64 partes de backend ou pela admissão de mapeamento DynBlk. Um dispositivo com falha ou isolado só é desanexado após o sistema de arquivos superior não estar mais montado; a recuperação valida o formato armazenado no próximo anexo.

### Raw

O modo Raw utiliza um único `changes.img` arquivo contendo ext4. O tamanho do arquivo é definido conforme a capacidade lógica solicitada no momento da criação, então, diferente dos backends dinâmicos, a capacidade é fixa até que uma operação explícita de expansão seja realizada. O sistema de arquivos subjacente pode representar extensões não gravadas de forma esparsa, mas MiniOS ainda trata Raw como um armazenamento de capacidade fixa e verifica o espaço disponível antes de criar ou expandir. Como tudo fica em um único arquivo no host, o FAT32 é limitado a 4000 MiB.

Imagens Raw existentes são verificadas com `e2fsck` antes de montar em modo gravável. A expansão aumenta `changes.img` e depois expande o ext4 com `resize2fs`; a redução de tamanho não é suportada. Caso a verificação ou montagem falhe, a imagem é preservada para recuperação e o boot continua em RAM. Raw não possui daemon FUSE nem metadados personalizados de armazenamento em bloco, o que torna o modelo de recuperação simples, mas não oferece o comportamento de capacidade dinâmica de DynFileFS e DynBlk.

### Camada de criptografia LUKS

LUKS2 é uma camada de criptografia opcional, selecionada com `perchencrypt=luks` ao criar uma sessão Raw, DynFileFS ou DynBlk. Sessões já existentes mantêm seu estado de criptografia conforme os metadados da sessão; especificar `perchencrypt` posteriormente não reinterpreta nem converte uma sessão existente em texto simples.

O limite da criptografia depende do backend: Raw conecta `changes.img` via dispositivo de loop e coloca o LUKS2 dentro desse arquivo; DynFileFS conecta sua imagem `virtual.dat` via dispositivo de loop e criptografa essa imagem lógica; DynBlk utiliza o `/dev/dynblkN` dispositivo de bloco diretamente como fonte do LUKS2. Em todos os três casos, MiniOS cria ext4 dentro de `/dev/mapper/...`, portanto, o conteúdo e os metadados do sistema de arquivos dentro do mapper ficam criptografados em repouso. Metadados do backend fora do limite do LUKS, arquivos de boot, metadados da sessão e outros arquivos no meio de persistência permanecem sem criptografia.

Os padrões de tamanho, limites de crescimento, restrições do FAT32 e o comportamento de alocação thin/fixed continuam pertencendo ao backend subjacente. O initrd autentica antes de expandir um backend criptografado existente, fecha o mapper antes do crescimento do backend, reabre, verifica o ext4 e expande o sistema de arquivos antes de montá-lo. Para DynBlk criptografado, a compactação do backend é forçada para `none`.

Na criação, a senha é solicitada duas vezes. Sessões criptografadas já existentes permitem três tentativas de desbloqueio no console de boot. Três senhas rejeitadas acionam um caminho de inicialização fatal: MiniOS não continua em RAM, não reinterpreta a mesma sessão como texto simples, não seleciona outro backend nem cria um substituto. Outras falhas de criação, verificação, redimensionamento ou montagem mantêm o comportamento de recuperação específico do backend, sem fallback para texto simples. As senhas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando. As exportações lógicas contêm arquivos da sessão descriptografados, e não uma imagem criptografada do backend.

Consulte [Segurança](/maintenance-and-recovery/Security) para informações sobre limites de proteção e considerações de backup.

### SquashFS

O initrd normalmente ativa uma sessão existente de SquashFS. A configuração interativa cria metadados de geração zero com salvamento no desligamento habilitado, mas não cria `changes.sb`; a camada superior gravável existe apenas em RAM até que o sistema em execução realize o primeiro salvamento sob demanda ou no desligamento. Uma sessão de geração zero é válida somente quando os campos de artefato de snapshot e `changes.sb` estão ausentes. Para gerações posteriores, a ativação valida metadados rigorosos e de valor único para o snapshot, incluindo seu hash, tamanhos compactados e descompactados, contagem de entradas, tipo de união e política de salvamento. Também verifica o tipo e o tamanho exato do arquivo, a RAM e swap disponíveis, o hash SHA-256 antes e depois da extração, e a compatibilidade atual da união.

O snapshot é extraído com tratamento rigoroso de erros e xattr em uma imagem ext4 temporária e limitada em RAM. Para OverlayFS, essa imagem contém diretórios separados de `changes` e `workdir`; para AUFS, sua raiz é o ramo gravável.
Metadados malformados, memória insuficiente, alteração de hash, erros de extração ou uma política inválida impedem a ativação e deixam a inicialização em sua camada superior padrão RAM.

Uma sessão marcada como `dirty` indica que a inicialização anterior não completou a transição de desligamento limpo. SquashFS então avisa e restaura o último `changes.sb` salvo com sucesso; alterações não salvas do boot interrompido não constituem uma segunda geração de rollback.

O Gerenciador de sessões MiniOS e o backend de salvamento do sistema criam e substituem atomicamente snapshots SquashFS usando captura exata. A ativação do boot pode ler um snapshot existente de um armazenamento FAT, exFAT ou NTFS gravável porque a extração ocorre na camada superior ext4 temporária. A criação e o salvamento exato continuam restritos ao sistema de arquivos: sua área de preparação privada deve preservar links, propriedade, permissões, xattrs, ACLs, capacidades e whiteouts de união, então o salvamento atual exige um sistema de arquivos POSIX adequado.

SquashFS não possui `perchsize`: seu tamanho armazenado segue as alterações capturadas e compactadas, enquanto a memória em tempo de execução é determinada pela camada superior gravável extraída. A camada de persistência LUKS MiniOS não envolve `changes.sb`; se for necessária confidencialidade do snapshot, o armazenamento de base deve ser criptografado fora desta camada. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação da união e limite de recuperação

Para AUFS, a raiz de alterações ativada se torna o branch zero gravável. Para OverlayFS, o initrd constrói `upperdir` e `workdir` abaixo da raiz de alterações ativada e monta os módulos somente leitura como diretórios inferiores. O initrd então verifica o branch AUFS live ou o OverlayFS `upperdir` antes de publicar a persistência como ativa.

Se um backend de persistência, atualização de metadados ou essa verificação falhar, seus pontos de montagem são desfeitos quando possível, nenhum estado de persistência bem-sucedido é publicado e o boot gravável continua em RAM. Falha ao construir a união root entra no shell fatal do initramfs. Sair desse shell pode permitir que a configuração continue com uma root inválida; isso não é um reparo nem um fallback seguro. O AUFS mantém anexos de branch de módulo conforme possível, mas uma união incompleta cruza o limite de recuperação: MiniOS não marca a persistência como ativa.

Falhas na verificação de containers evitam deliberadamente montar uma sessão suspeita como gravável.
Não substitua nem reconstrua arquivos de sessão durante o boot. Preserve primeiro o armazenamento afetado; veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado ativo, em execução e de inicialização atual

Nos metadados duráveis da sessão, `default=` é a sessão **ativa** selecionada para o próximo retorno, enquanto `running=` é a sessão registrada como fornecedora da inicialização atual. A ativação grava ambos os campos e marca essa sessão como `dirty`.
Após os pontos de montagem de persistência desaparecerem durante um desligamento limpo, MiniOS remove `running=` e marca a sessão como `clean`.

Esses campos de metadados podem ficar desatualizados após uma falha, erro na gravação dos metadados, falha na construção da união, cópia do armazenamento ou desligamento interrompido. Os componentes em tempo de execução que permitem salvamento não confiam apenas em `running=`. Eles utilizam o estado protegido de inicialização atual do initrd, vinculado ao ID de inicialização, sessão numérica, modo, identidade real do armazenamento, status de gravação, durabilidade, geração ativa verificada e, para DynBlk, o dispositivo anexado exato.`/dev/dynblkN` Um registro de inicialização atual ausente ou com falha significa que a persistência não deve ser tratada como destino aprovado para salvamento.

Com `toram` e uma solicitação de persistência reconhecida, o armazenamento da sessão é copiado para RAM antes da ativação. A sessão copiada pode ser gravável e fornecer a camada superior em execução, mas seu estado de inicialização atual é marcado como não durável. Alterações nessa cópia em RAM não retornam ao dispositivo original e são perdidas no desligamento.

Para orientações operacionais relacionadas, consulte [Modos de inicialização](/using-minios/Boot-Modes), [Parâmetros de inicialização](/reference/Boot-Parameters), [Sessões e persistência](/using-minios/Sessions-and-Persistence), [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Segurança](/maintenance-and-recovery/Security), e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).
