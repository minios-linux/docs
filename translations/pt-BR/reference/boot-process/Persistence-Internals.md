---
updated: 2026-09-26
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
| `perchdir=resume` | Abre a sessão padrão compatível e, quando possível, cria uma substituta caso não possa ser usada. | Trabalho diário normal. |
| `perchdir=new` | Cria uma nova sessão numerada. | Mantém um workspace existente inalterado. |
| `perchdir=ask` | Exibe sessões salvas após encontrar um armazenamento retomável e permite escolher uma. Não pode criar a primeira sessão em um armazenamento vazio. | Vários workspaces existentes em um mesmo dispositivo; use `perchdir=new` para a primeira sessão. |
| `perchdir=NUMBER` | Solicita uma sessão numerada específica. | Entrada de boot personalizada estável após verificar o ID da sessão. |
| `perchmode=MODE` | Selecione `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Combine o sistema de arquivos de base e o modelo de persistência desejado. |
| `perchencrypt=luks` | Adicione uma camada LUKS2 ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. | Criptografa um backend de container compatível. |
| `perchsize=SIZE` | Solicita o tamanho de uma nova sessão de container ou de um container em expansão. | DynFileFS, DynBlk, VMDK ou raw; a criptografia não altera a semântica de tamanho do backend. |
| `perchcomp=CODEC` | Seleciona a compactação do backend DynBlk para uma sessão DynBlk recém-criada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`; a disponibilidade ainda depende do kernel em execução. A compactação é desativada quando LUKS envolve DynBlk. |
| `perchreserve=MB` | Subtrai uma margem ao definir o tamanho de um novo container ou de um container em expansão e define o limite de aviso de pouco espaço. | Reserva espaço de trabalho ao alocar um container; não é uma cota de tempo de execução. |
| `perch` | Utiliza o comportamento antigo de retomada, sem criação automática de substitutos. | Compatibilidade com uma entrada personalizada existente; prefira `perchdir=resume` para os menus atuais. |

Não combine persistência com `toram` quando você espera que alterações sejam gravadas de volta no dispositivo original. MiniOS ativa a sessão copiada em RAM, e as alterações nessa cópia são perdidas ao desligar.

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

MiniOS utiliza 256 MiB como margem padrão de alocação e limite de aviso de pouco espaço. O cálculo usa blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem sinal e sem unidade, limitado a 4096, e retorna para 256 quando ausente ou inválido. A margem reduz o espaço oferecido a um novo container ou a um container em expansão. Não é uma cota: uma sessão nativa ou gravações posteriores ainda podem consumir o espaço restante do sistema de arquivos. O boot avisa quando o espaço livre atual está igual ou abaixo do limite.

Os tamanhos dos containers usam valores inteiros alocados em MiB:

- Um número simples, `M`, ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- Containers Raw são limitados a 1.000.000 MiB e pelo espaço disponível após a reserva. DynFileFS possui um limite próprio, compatível com RAM, e um teto rígido de 2.000.000 MiB. DynBlk obtém seu limite de geometria no formato nativo de `dynblk limits --format dynblk`; MiniOS não impõe um teto separado de 512 GiB.
- Raw é um único arquivo de base, então o FAT32 limita a 4000 MiB em MiniOS. O mesmo limite se aplica quando Raw está envolto em LUKS2.
- Uma nova sessão raw tem padrão de 4000 MiB. A criptografia não cria uma política de tamanho LUKS separada: uma sessão Raw, DynFileFS, DynBlk ou VMDK criptografada mantém as regras de tamanho do backend subjacente.
- Uma nova sessão DynFileFS criada pelo initrd sem `perchsize` utiliza até 16 GiB de capacidade lógica. Se o armazenamento de base não puder comportar esse valor após `perchreserve` e sobrecarga de índice DynFileFS, o padrão é reduzido para a capacidade disponível. Seu índice format-400 consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de base por GiB de capacidade lógica declarada, mesmo com o payload vazio. MiniOS também limita a capacidade de DynFileFS a partir do RAM físico e por um teto rígido testado de 2.000.000 MiB.
- Uma nova sessão DynBlk sem `perchsize` segue o mesmo teto automático de 16 GiB e é reduzida quando resta menos espaço de base após `perchreserve`. O tamanho explícito DynBlk é um pedido de capacidade thin verificado contra o limite do backend instalado. Os metadados das partes declaradas são criados inicialmente, mas o espaço de payload cresce sob demanda. DynBlk mantém um cache de metadados limitado, independente do preenchimento do payload.

O crescimento do container é feito por melhor esforço e a redução de tamanho não é suportada. `perchsize` não define o tamanho de sessões nativas ou SquashFS. O Gerenciador de sessões MiniOS define containers raw e DynFileFS criados manualmente para 4000 MiB e DynBlk para 16 GiB; variantes criptografadas usam os mesmos padrões do backend. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação de armazenamento

Todos os backends bem-sucedidos devem fornecer o upper gravável esperado pelo sistema de arquivos union selecionado. Montar um backend, por si só, não comprova que a persistência está ativa. Os formatos Native, DynFileFS, DynBlk, VMDK e raw podem atualizar os metadados persistentes da sessão antes da validação do union; SquashFS adia esse commit de metadados. Raw, DynFileFS, DynBlk e VMDK também podem utilizar criptografia LUKS2. O estado protegido do boot atual só é publicado após a confirmação de que o union root final está usando o upper esperado.

| Backend | Representação persistente | Modelo de capacidade | Requisitos do armazenamento de base | Camada LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Arquivos e diretórios diretamente no diretório de sessão numerado | Utiliza o espaço do sistema de arquivos de base diretamente; `perchsize` não se aplica | Sistema de arquivos gravável que passa no teste de comportamento POSIX | Não |
| `dynfilefs` | Formato-400 `changes.dat` mais arquivos de segmento expondo um ext4 `virtual.dat` | Payload enxuto com um índice denso do tamanho da capacidade | Armazenamento gravável POSIX, FAT32, NTFS ou exFAT | Sim |
| `dynblk` | Formato-1 `volumeNNN.db` arquivos expondo `/dev/dynblkN`, com ext4 sobreposto | Dispositivo de bloco virtual enxuto com mapeamentos residentes em disco e cache limitado | Sistema de arquivos aceito pelo backend do kernel DynBlk e recursos de backend suficientes | Sim |
| `raw` | Arquivo único de tamanho fixo `changes.img` contendo ext4 | Arquivo é criado com o tamanho lógico solicitado; crescimento apenas | Sistema de arquivos gravável capaz de armazenar a imagem; FAT32 é limitado a 4000 MiB | Sim |
| `squashfs` | Snapshot `changes.sb` compactado; o upper gravável de runtime é reconstruído em RAM | O tamanho do snapshot acompanha as alterações capturadas; `perchsize` não se aplica | Snapshots existentes podem ser lidos de mídias graváveis suportadas; a gravação exata requer um armazenamento de persistência compatível com POSIX | Não |

### Nativo

O modo nativo armazena o conteúdo gravável da união diretamente no diretório de sessão numerado. Não há imagem interna, dispositivo de loop, contêiner FUSE ou sistema de arquivos em bloco separado, então a capacidade simplesmente acompanha o espaço livre no sistema de arquivos de origem e `perchsize` não se aplica. Isso gera a menor sobrecarga de contêiner e mantém a visibilidade normal dos arquivos para recuperação e backup.

MiniOS primeiro exclui sistemas de arquivos não POSIX conhecidos, como FAT, exFAT e NTFS. Em seguida, testa o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e verificando alterações no modo executável. Se o teste for bem-sucedido, o diretório de sessão numerado é montado diretamente como área gravável. Se o sistema de arquivos for considerado inadequado ou o teste POSIX falhar, o modo nativo recorre a DynFileFS. Uma falha após a ativação do modo nativo é revertida; um novo candidato vazio é removido quando pode ser removido com segurança.

A camada de persistência MiniOS LUKS2 não envolve o modo nativo porque o modo nativo não possui contêiner ou limite de dispositivo de bloco para criptografar. A persistência nativa ainda pode residir em um armazenamento criptografado fora desta camada de persistência.

### DynFileFS

DynFileFS é o backend de contêiner format-400 baseado em FUSE. Ele expõe uma imagem lógica única `virtual.dat` enquanto armazena os dados em `changes.dat` mais arquivos de segmento numerados. O helper deve montar corretamente e expor `virtual.dat`; caso contrário, a ativação falha em vez de criar acidentalmente um arquivo apenas RAM com um nome que parece persistente.

Seu índice de mapeamento é denso em relação à capacidade lógica declarada: cada bloco lógico de 4 KiB possui um deslocamento de 8 bytes. Isso representa cerca de 2 MiB de índice RAM por GiB de capacidade virtual, e aproximadamente a mesma quantidade é armazenada nos índices dos segmentos de apoio, mesmo antes de os dados de payload serem gravados. A alocação do payload em si permanece dinâmica. Como o binário initrd estático é i686, MiniOS também aplica um limite de tamanho lógico compatível com RAM e um teto rígido de 2.000.000 MiB abaixo do ponto de falha do espaço de endereçamento testado.

A imagem lógica contém ext4. Imagens existentes são verificadas antes do montagem em modo gravável; resultados do fsck acima do status de erros corrigidos rejeitam a sessão em vez de montá-la como gravável. O redimensionamento é apenas para aumento, e o sistema de arquivos ext4 interno é expandido quando possível. Para diagnóstico voltado ao usuário, consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

O modo `dynblk` utiliza um dispositivo de bloco do kernel, separado de DynFileFS. Cada sessão numerada possui `volume000.db` e todos os seus irmãos numerados (`volume001.db`, ..., `volume1000.db`, e assim por diante). O layout nativo é `DBSPRS01`, formato de disco **1**. Layouts não suportados são rejeitados em vez de convertidos silenciosamente. Mantenha as versões do CLI e do módulo instaladas compatíveis.

MiniOS cria ext4 em todo o disco retornado por `/dev/dynblk-control`, como `/dev/dynblk3`; não assume que `dynblk0` está livre. Um ext4 existente é verificado antes do uso gravável. O registro protegido do estado de boot grava exatamente esse dispositivo, então o desligamento só o desconecta após seus usuários e o sistema de arquivos upper serem fechados. Vários dispositivos independentes podem coexistir.

Gerenciador de sessões, instalador e initramfs consultam `dynblk limits --format dynblk` para o limite de geometria do backend instalado. O guardião de recursos atual permite 65536 partes: spans lógicos padrão de 1 GiB permitem até 64 TiB. Limites físicos menores reduzem o teto virtual. Este é um teto de geometria, não uma garantia de que o host pode abrir tantos arquivos ou possui espaço/dispositivos RAM. O crescimento é suportado; a redução não.

As tabelas de mapeamento ficam no disco. `--map-memory-mb` controla um cache de metadados por dispositivo (padrão 1 MiB, faixa 1..64 MiB), não mais uma porcentagem de RAM ou um limite de dados mapeados. Descrições de extensão, vetores de arquivos abertos e diretórios pequenos crescem conforme a geometria declarada, não conforme o preenchimento do payload. O attach escaneia os metadados de mapeamento e reconstrói temporariamente o estado de alocação parte por parte; não lê todos os payloads. O full `dynblk check` lê os payloads. `engine_memory_bytes` exclui cache de página do sistema de arquivos, internos do codec e outras alocações do kernel.

Os arquivos de metadados de todas as partes declaradas são inicializados ao criar/expandir; os dados reais permanecem thin. As partes são limitadas a 4000 MiB. Faça backup de todo o namespace destacado, sem assumir números de três dígitos ou uma parte final fixa. Um novo volume pode selecionar compactação com `perchcomp`; cargas posteriores usam o codec armazenado. LUKS2 acima de DynBlk força a compactação para `none`. Gravações parciais em dados compactados atualmente recompõem o respectivo bloco de 64 KiB. Falta de armazenamento ou recursos ainda pode causar falha nas gravações; o sistema de arquivos upper deve ser desmontado antes do detach.

### Sessões VMDK

O modo de sessão `vmdk` utiliza o mesmo driver com imagens reais de `twoGbMaxExtentSparse`
. O primário é `volume.vmdk`, com `volume-s001.vmdk` e subsequentes
partes; cada parte cobre até 2 GiB de espaço lógico. O descritor é limitado
a menos de 1 MiB, então o comprimento do nome do arquivo e a quantidade de extensões restringem a capacidade.
Gerenciador de sessões, Instalador e initramfs consultam `dynblk limits --format vmdk`.
O modo nativo continua usando `volume000.db`; nenhum dos modos reinterpreta os arquivos do outro
modo. Sessões gerenciadas não importam um VMDK particionado externamente qualquer
como metadados de sessão.

O suporte a sessões VMDK é anunciado por `vmdk-session-v1` em
`/etc/minios-initramfs-dynblk` dentro do initrd. O runtime atual e todo
initrd de origem copiado pelo Instalador devem suportar isso. VMDK não possui compactação nativa;
`perchcomp` é ignorado com aviso no boot e o Gerenciador de sessões rejeita um
codec VMDK não-`none`. LUKS continua sendo uma camada opcional separada. Ambos os modos publicam
seu modo de sessão real e o `dynblk_device` proprietário no boot protegido,
e ambas as implementações de desligamento fecham esse dispositivo após o último usuário sair.

Ambos os formatos de driver suportam `writeback`, `writethrough`, `none`, `directsync` e políticas explícitas de `unsafe`anexação. Modos diretos atualmente exigem ext2/ext4 como base. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` anexa um sistema de arquivos existente; `umount` libera o dispositivo gerenciado pelo helper após o último usuário fechar. O manual `dynblk load` tem tempo de vida explícito. Isso não cria sistema de arquivos nem desbloqueia LUKS.

### Raw

O modo Raw utiliza um único `changes.img` arquivo contendo ext4. O tamanho do arquivo é definido conforme a capacidade lógica solicitada no momento da criação, então, diferente dos backends dinâmicos, a capacidade é fixa até que uma operação explícita de expansão seja realizada. O sistema de arquivos subjacente pode representar extensões não gravadas de forma esparsa, mas MiniOS ainda trata Raw como um armazenamento de capacidade fixa e verifica o espaço disponível antes de criar ou expandir. Como tudo fica em um único arquivo no host, o FAT32 é limitado a 4000 MiB.

Imagens Raw existentes são verificadas com `e2fsck` antes de montar em modo gravável. A expansão aumenta `changes.img` e depois expande o ext4 com `resize2fs`; a redução de tamanho não é suportada. Caso a verificação ou montagem falhe, a imagem é preservada para recuperação e o boot continua em RAM. Raw não possui daemon FUSE nem metadados personalizados de armazenamento em bloco, o que torna o modelo de recuperação simples, mas não oferece o comportamento de capacidade dinâmica de DynFileFS e DynBlk.

### Camada de criptografia LUKS

LUKS2 é uma camada de criptografia opcional, selecionada com `perchencrypt=luks` ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. Sessões existentes mantêm seu estado de criptografia nos metadados da sessão; especificar `perchencrypt` posteriormente não reinterpreta nem converte uma sessão plaintext existente.

O limite de criptografia depende do backend: Raw conecta `changes.img` via loop device e coloca o LUKS2 dentro desse arquivo; DynFileFS conecta sua imagem `virtual.dat` via loop device e criptografa essa imagem lógica; DynBlk usa o dispositivo de bloco `/dev/dynblkN` diretamente como fonte LUKS2. Nos três casos, MiniOS cria ext4 dentro de `/dev/mapper/...`, então o conteúdo e os metadados do sistema de arquivos dentro do mapper ficam criptografados em repouso. Metadados do backend fora do limite LUKS, arquivos de boot, metadados da sessão e outros arquivos no meio de persistência permanecem não criptografados.

Padrões de tamanho, limites de crescimento, restrições do FAT32 e comportamento de alocação thin/fixa continuam pertencendo ao backend subjacente. O initrd autentica antes de expandir um backend criptografado existente, fecha o mapper antes do crescimento do backend, depois reabre, verifica o ext4 e expande o sistema de arquivos antes de montá-lo. Para DynBlk criptografado, a compactação do backend é forçada para `none`.

A criação solicita a senha duas vezes. Sessões criptografadas existentes permitem três tentativas de desbloqueio no console de boot. Três senhas rejeitadas acionam um caminho de boot fatal: MiniOS não continua em RAM, não reinterpreta a mesma sessão como plaintext, não seleciona outro backend nem cria substituto. Outras falhas de criação, verificação, redimensionamento ou montagem mantêm o comportamento de recuperação específico do backend, sem fallback para plaintext. Senhas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando. Exports lógicos contêm arquivos de sessão descriptografados, e não uma imagem de backend criptografada.

Veja [Segurança](/maintenance-and-recovery/Security) para informações sobre limites de proteção e considerações de backup.

### SquashFS

O initrd normalmente ativa uma sessão SquashFS existente. A configuração interativa cria metadados de geração zero com salvamento no desligamento habilitado, mas não cria `changes.sb`; a camada upper gravável existe apenas em RAM até que o sistema em execução realize o primeiro salvamento sob demanda ou no desligamento. Uma sessão de geração zero é válida somente quando os campos de artefato de snapshot e `changes.sb` estão ausentes. Para gerações posteriores, a ativação valida metadados rigorosos e de valor único para o snapshot, incluindo seu digest, tamanhos comprimido e descomprimido, contagem de entradas, tipo de union e política de salvamento. Também verifica o tipo e tamanho exatos do arquivo, o espaço disponível em RAM e swap, o hash SHA-256 antes e depois da extração, e a compatibilidade atual do union.

O snapshot é extraído com tratamento rigoroso de erros e xattr para uma imagem ext4 temporária e limitada em RAM. Para OverlayFS, essa imagem contém diretórios separados de `changes` e `workdir`; para AUFS, sua raiz é o branch gravável.
Metadados malformados, memória insuficiente, alterações no hash, erros de extração ou uma política inválida impedem a ativação e mantêm o boot no upper padrão RAM.

Uma sessão marcada como `dirty` significa que o boot anterior não completou a transição de desligamento limpo. SquashFS então avisa e restaura o último `changes.sb` salvo com sucesso; alterações não salvas do boot interrompido não constituem uma segunda geração de rollback.

O Gerenciador de sessões MiniOS e o backend de salvamento do sistema criam e substituem snapshots SquashFS de forma atômica usando captura exata. A ativação do boot pode ler um snapshot existente de mídias FAT, exFAT ou NTFS graváveis, pois a extração ocorre no upper ext4 temporário. A criação e o salvamento exato continuam restritos ao sistema de arquivos: o armazenamento da sessão deve suportar criação de workspace privado, metadados Linux e publicação durável em um sistema de arquivos POSIX adequado.

Durante o salvamento, o backend primeiro captura uma árvore de arquivos estável em armazenamento de memória privada de root quando o initrd fornece um tmpfs confiável com espaço suficiente. Quando RAM é insuficiente, essa árvore utiliza o workspace de disco anterior. O compressor grava diretamente em um diretório privado modo-0700 no sistema de arquivos da sessão, e não em uma imagem RAM adicional seguida de outra cópia em disco. MiniOS verifica o resultado comprimido e sua identidade, sincroniza, move para um nome candidato privado e revalida o candidato antes de substituir atômica e ativamente o `changes.sb`. Cópias ou compressões com falha não substituem o último snapshot bem-sucedido.

Com uma sessão durável saudável, `/var/log/minios` e `/var/log/live` são montados por bind a partir de `boot-logs/` dentro da sessão numerada. Esses diagnósticos de inicialização são gravados independentemente do upper RAM e do snapshot de desligamento. Um boot cujo armazenamento de persistência não foi ativado de forma durável não pode garantir que esses logs sobreviverão a um reinício. Logs e caches comuns podem ser configurados separadamente; veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS não possui `perchsize`: seu tamanho armazenado segue as alterações comprimidas capturadas, enquanto a memória em tempo de execução é determinada pelo upper gravável extraído. A camada de persistência LUKS MiniOS não encapsula `changes.sb`; se confidencialidade do snapshot for necessária, o armazenamento de base deve ser criptografado fora desta camada. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

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

## Reclamação de espaço com reconhecimento de sessão

`minios-session reclaim ID` opera em ambos os formatos de bloco. Para sessões plaintext
relata intervalos livres do ext4 com FITRIM e, em seguida, chama `dynblk reclaim`.
Para uma sessão ativa, o dispositivo é vinculado ao estado protegido de boot atual e
o ponto de montagem ext4 real é verificado; o root union nunca é compactado diretamente.
Sessões inativas são temporariamente anexadas e montadas para essa operação.

Nem o boot nem o desligamento executam a compactação automaticamente. `--compact` é uma
escolha explícita do usuário na CLI ou na opção de diálogo não marcada do Gerenciador de sessões.
Sem ela, apenas o hole punching (onde suportado) e truncamento do final livre são realizados.
A política de descarte do LUKS não é alterada pelo comando da sessão.
