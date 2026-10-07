---
updated: 2026-10-06
---

# Internos de persistência

Esta página explica os `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, e `perchtoram` parâmetros de boot. Esses parâmetros controlam onde as alterações de uma sessão live são armazenadas, como uma nova sessão é criada e se o armazenamento de sessão suportado é copiado para RAM. Para uso normal, selecione uma entrada persistente no menu de boot ou utilize o Gerenciador de sessões MiniOS em vez de editá-los manualmente.

MiniOS constrói o root live a partir de módulos somente leitura e uma camada superior gravável.
O initrd decide se essa camada superior será uma sessão persistente numerada ou um diretório temporário em RAM. Esta página descreve essa decisão e o caminho de ativação no boot. Para os controles voltados ao usuário, veja [Modos de boot](/using-minios/Boot-Modes) e [Parâmetros de boot](/reference/Boot-Parameters).

## Em linguagem simples

Sem um parâmetro de persistência, MiniOS coloca as alterações em RAM e as descarta ao desligar. Um parâmetro de persistência solicita que MiniOS localize um armazenamento gravável, selecione ou crie uma sessão numerada, verifique a compatibilidade e use essa sessão como camada gravável.

Solicitar persistência não garante que ela foi ativada. Se o destino estiver somente leitura, cheio, danificado ou incompatível, MiniOS pode continuar com uma camada RAM temporária. Leia o aviso de inicialização antes de confiar nas alterações salvas.

## Parâmetros explicados

| Parâmetro | O que informa MiniOS | Escolha típica |
|---|---|---|
| `perchdir=resume` | Abre a sessão padrão compatível e, quando possível, cria uma substituta caso não possa ser utilizada. | Uso diário normal. |
| `perchdir=setup` | Permite escolher interativamente o backend de persistência e suas opções de criptografia/compactação suportadas, depois cria uma nova sessão numerada. | Atual **Iniciar nova sessão** entrada do menu de boot. |
| `perchdir=new` | Cria diretamente uma nova sessão numerada usando o `perchmode` solicitado/padrão, criptografia, compactação e tamanho, sem exibir o seletor de backend. | Entradas de boot automatizadas ou avançadas com opções de armazenamento já definidas. |
| `perchdir=ask` | Exibe as sessões salvas e permite escolher uma. Se não houver sessão salva, o seletor inicia o mesmo fluxo de configuração usado por `perchdir=setup`. | Vários ambientes de trabalho em um único dispositivo, incluindo a primeira configuração interativa em armazenamento vazio. |
| `perchdir=NUMBER` | Solicita uma sessão numerada específica. | Entrada de boot personalizada estável após verificar o ID da sessão. |
| `perchmode=MODE` | Selecionar `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Corresponde ao sistema de arquivos de base e ao modelo de persistência desejado. |
| `perchencrypt=luks` | Adiciona uma camada LUKS2 ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. | Criptografa um backend de container compatível. |
| `perchsize=SIZE` | Solicita o tamanho de uma sessão de container nova ou em expansão. | DynFileFS, DynBlk, VMDK ou raw; a criptografia não altera a semântica de tamanho do backend. |
| `perchcomp=CODEC` | Seleciona a compactação do backend DynBlk para uma sessão DynBlk recém-criada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`; a disponibilidade ainda depende do kernel em execução. A compactação é desativada quando LUKS encapsula DynBlk. |
| `perchreserve=MB` | Subtrai uma margem ao dimensionar um container novo ou em expansão e define o limite de aviso de pouco espaço. | Reserva espaço de trabalho ao alocar um container; não é uma cota de tempo de execução. |
| `perch` | Utiliza o comportamento antigo de retomada, sem criação automática de substitutos. | Compatibilidade com uma entrada personalizada existente; prefira `perchdir=resume` para menus atuais. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Controla a cópia da persistência independentemente do sistema `toram`. | `off` mantém o armazenamento original ativo; `trim` copia apenas a sessão suportada selecionada; `full` copia todas as sessões de container/SquashFS suportadas. |

Quando a persistência é solicitada, o sistema `toram` define `perchtoram=trim` como padrão, a menos que um modo de persistência-RAM explícito seja fornecido. Sem o sistema `toram`, a persistência permanece no armazenamento por padrão. Uma sessão copiada é não durável enquanto estiver em execução, mas o Session Manager atual pode salvar explicitamente o estado suportado com backend RAM no armazenamento original ou publicá-lo como uma nova sessão quando o armazenamento original estiver disponível e corresponder à sua identidade de inicialização.

## Persistência é explícita

O initrd ativa o tratamento de persistência somente quando a linha de comando do kernel contém um destes tokens reconhecidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Sem nenhum desses tokens, inclusive quando apenas um nome `perch...` não reconhecido está presente, MiniOS cria uma nova camada superior gravável em RAM. As alterações feitas durante esse boot são descartadas ao desligar.

Os seletores não são todos equivalentes:

| Seletor | Comportamento do initrd |
|---|---|
| `perch` | Tenta retomar o padrão de metadados. Não cria automaticamente uma sessão quando nenhuma é utilizável ou quando as verificações de compatibilidade falham. |
| `perchdir=resume` | Tenta o padrão de metadados e pode criar automaticamente uma nova substituta compatível. Este é o comportamento atual de retomada do menu de boot. |
| `perchdir=setup` | Abre primeiro o seletor de backend, registra o backend/criptografia/compactação selecionados e segue o caminho de alocação de nova sessão. |
| `perchdir=new` | Aloca um diretório cujo ID numérico é um maior que o maior ID existente. Nunca reutiliza um diretório existente e não abre o seletor de backend. |
| `perchdir=ask` | Oferece sessões existentes quando presentes; uma sessão existente incompatível requer confirmação. Se não houver padrão/sessão no armazenamento, muda para `setup` para que a primeira sessão possa ser criada interativamente. |
| `perchdir=NUMBER` | Usa esse diretório quando existe. Se não existir, a seleção pode recorrer ao padrão registrado nos metadados; não reserva o número solicitado. |

Outros parâmetros de persistência reconhecidos sem seletor entram no mesmo caminho legado de retomada que o `perch`: eles solicitam persistência, mas não habilitam a criação automática. Se a seleção ou ativação não produzir uma camada superior utilizável, o boot continua normalmente com a camada superior RAM e exibe um aviso de falha.

## Armazenamento de sessão e localização

O armazenamento padrão é o diretório `changes` ao lado dos dados de MiniOS, com diretórios de sessão numerados e `session.conf` ou `session.json` metadados:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

O armazenamento pode ser selecionado como um dispositivo mais um caminho opcional. Formatos aceitos incluem um caminho `/dev/...` direto, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk`, e `askdisk:custom:path`. O sufixo delimitado por dois pontos se torna um caminho abaixo do dispositivo selecionado; a sintaxe de barra após `askdisk` ignora silenciosamente esse caminho personalizado. Um subdiretório selecionado é montado via bind como armazenamento de sessão. MiniOS também pode detectar uma partição de persistência no mesmo disco e armazenamento de persistência Ventoy suportado.

Antes da seleção da sessão, o initrd deve montar o local como gravável e provar que pode criar e remover um marcador no armazenamento. Um dispositivo de bloco que não pode ser aberto para gravação, uma montagem somente leitura, um caminho indisponível ou uma falha no teste de gravação rejeitam a persistência para aquele boot. Sessões existentes não são confiáveis apenas porque seus arquivos podem ser lidos.

## Seleção e compatibilidade

Os metadados da sessão registram o modo de armazenamento e podem registrar a versão, edição, sistema de arquivos union e tamanho do container MiniOS. A retomada compara o modo, versão, edição e union registrados com o modo solicitado e o sistema atual.
Campos de compatibilidade legados ausentes não são tratados como incompatibilidades.

O literal `perchdir=resume` cria uma nova sessão numerada quando o padrão está ausente ou quando um modo, versão, edição ou union registrado torna esse padrão inadequado. O bare `perch`, uma seleção numérica direta e outras solicitações legadas de retomada recusam substituição automática e continuam em RAM após falha na seleção. `perchdir=ask` mostra informações de compatibilidade e permite uma substituição explícita. Uma nova sessão usa por padrão `native` salvo se outro modo for solicitado.

O modo de armazenamento faz parte da compatibilidade. Se a seleção chegar ao despacho do backend, um modo solicitado desconhecido recai para `native`, cujo probe pode então selecionar DynFileFS em armazenamento inadequado. Uma sessão existente com modo registrado diferente pode falhar na verificação de compatibilidade anterior; uma retomada legada então continua em RAM em vez de chegar a esse fallback.

## Reserva de espaço e tamanhos

MiniOS usa 256 MiB como margem de alocação padrão e limite de aviso de pouco espaço. O cálculo utiliza blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem sinal e sem unidade, limitado a 4096, e volta para 256 quando está ausente ou inválido. A margem reduz o espaço oferecido a um container novo ou em expansão. Não é uma cota: uma sessão nativa ou gravações posteriores ainda podem consumir o espaço restante do sistema de arquivos. O boot avisa quando o espaço livre atual está igual ou abaixo do limite.

Os tamanhos dos containers usam contagens inteiras alocadas em MiB:

- Um número simples, `M`, ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- Containers Raw são limitados a 1.000.000 MiB e pelo espaço disponível após a reserva. DynFileFS tem um limite separado, sensível a RAM, e um teto rígido de 2.000.000 MiB. DynBlk obtém seu limite de geometria de formato nativo de `dynblk limits --format dynblk`; MiniOS não impõe um teto separado de 512 GiB.
- Raw é um único arquivo de base, então o FAT32 limita a 4000 MiB em MiniOS. O mesmo limite se aplica quando Raw é envolto em LUKS2.
- Uma nova sessão raw usa 4000 MiB por padrão. A criptografia não cria uma política de tamanho LUKS separada: um Raw criptografado, DynFileFS, DynBlk ou sessão VMDK segue as regras de tamanho do backend subjacente.
- Uma nova sessão DynFileFS criada pelo initrd sem `perchsize` utiliza até 16 GiB de capacidade lógica. Se o armazenamento de base não puder comportar tudo isso após `perchreserve` e a sobrecarga de índice DynFileFS, o padrão é reduzido à capacidade disponível. Seu índice format-400 consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de base por GiB de capacidade lógica declarada, mesmo com o payload vazio. MiniOS também limita a capacidade DynFileFS a partir do RAM físico e por um teto rígido testado de 2.000.000 MiB.
- Uma nova sessão DynBlk sem `perchsize` segue o mesmo teto automático de 16 GiB e é reduzida quando resta menos espaço de base após `perchreserve`. O tamanho explícito DynBlk é um pedido de capacidade thin verificado contra o limite do backend instalado. Metadados para partes declaradas são criados inicialmente, mas o espaço de payload cresce sob demanda. DynBlk mantém um cache de metadados limitado, independente do preenchimento do payload.

O crescimento do container é melhor esforço e a redução não é suportada. `perchsize` não dimensiona sessões nativas ou SquashFS. O Gerenciador de sessões MiniOS define containers raw e DynFileFS criados manualmente em 4000 MiB e containers DynBlk/VMDK em 16 GiB; variantes criptografadas usam os mesmos padrões do backend. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação do armazenamento

Todos os backends bem-sucedidos devem fornecer a camada superior gravável esperada pelo sistema de arquivos union selecionado. Montar um backend não prova, por si só, que a persistência está ativa. Native, DynFileFS, DynBlk, VMDK e raw podem atualizar os metadados da sessão persistente antes da validação da union; SquashFS adia esse commit de metadados. Raw, DynFileFS, DynBlk e VMDK também podem usar criptografia LUKS2. O estado protegido do boot atual só é publicado após a confirmação de que a união root final usa a camada superior esperada.

| Backend | Representação persistente | Modelo de capacidade | Requisitos de armazenamento de base | Camada LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Arquivos e diretórios diretamente no diretório numerado da sessão | Usa o espaço do sistema de arquivos de base diretamente; `perchsize` não se aplica | Sistema de arquivos gravável que passa no teste de comportamento POSIX | Não |
| `dynfilefs` | Format-400 `changes.dat` mais arquivos de segmento expondo um `virtual.dat` | Payload thin com índice denso do tamanho da capacidade | Armazenamento POSIX, FAT32, NTFS ou exFAT gravável | Sim |
| `dynblk` | Format-1 `volumeNNN.db` arquivos expondo `/dev/dynblkN`, com ext4 por cima | Dispositivo de bloco virtual thin com mapeamentos residentes em disco e cache limitado | Sistema de arquivos aceito pelo backend do kernel DynBlk e recursos de backend suficientes | Sim |
| `vmdk` | `volume.vmdk` mais `volume-sNNN.vmdk` extensões sparse divididas expostas pelo driver DynBlk, com ext4 por cima | Dispositivo de bloco virtual split-sparse thin | Sistema de arquivos aceito pelo backend VMDK DynBlk e pela `vmdk-session-v1`capacidade | Sim |
| `raw` | Arquivo único de tamanho fixo `changes.img` contendo ext4 | Arquivo é criado com o tamanho lógico solicitado; só cresce | Sistema de arquivos gravável capaz de armazenar a imagem; FAT32 é limitado a 4000 MiB | Sim |
| `squashfs` | Snapshot `changes.sb` compactado; a camada superior gravável em tempo de execução é reconstruída em RAM | O tamanho do snapshot segue as alterações capturadas; `perchsize` não se aplica | Snapshots existentes podem ser lidos de mídias graváveis suportadas; o salvamento exato requer um armazenamento de persistência POSIX adequado | Não |

### Nativo

O modo nativo armazena o conteúdo gravável da união diretamente no diretório numerado da sessão. Não há imagem interna, dispositivo loop, container FUSE ou sistema de arquivos de bloco separado, então a capacidade simplesmente segue o espaço livre no sistema de arquivos de base e `perchsize` não se aplica. Isso gera a menor sobrecarga de container e preserva a visibilidade normal dos arquivos para recuperação e backup.

MiniOS primeiro exclui sistemas de arquivos conhecidos como não POSIX, como FAT, exFAT e NTFS. Em seguida, testa o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e verificando alterações no modo executável. Se o teste for bem-sucedido, o diretório numerado da sessão é montado via bind diretamente como área gravável. Se o sistema de arquivos for conhecido como inadequado ou o teste POSIX falhar, o modo nativo recai para DynFileFS. Uma falha após a ativação nativa é revertida; um novo candidato vazio é removido quando pode ser removido com segurança.

A camada de persistência LUKS2 MiniOS não envolve o modo nativo porque o nativo não tem container ou limite de dispositivo de bloco para criptografar. A persistência nativa ainda pode residir em um armazenamento criptografado fora desta camada de persistência.

### DynFileFS

DynFileFS é o backend de container format-400 baseado em FUSE. Ele expõe uma única imagem lógica `virtual.dat` enquanto armazena dados em `changes.dat` mais arquivos de segmento numerados. O auxiliar deve montar com sucesso e expor `virtual.dat`; caso contrário, a ativação falha em vez de criar acidentalmente um arquivo apenas RAM com nome de aparência persistente.

Seu índice de mapeamento é denso em relação à capacidade lógica declarada: cada bloco lógico de 4 KiB tem um deslocamento de 8 bytes. Isso representa cerca de 2 MiB de RAM de índice por GiB de capacidade virtual, e aproximadamente o mesmo é armazenado nos índices de segmento de base mesmo antes de dados de payload serem gravados. A alocação do payload permanece dinâmica. Como o binário initrd estático é i686, MiniOS também aplica um limite de tamanho lógico sensível a RAM e um teto rígido de 2.000.000 MiB abaixo do ponto de falha de espaço de endereçamento testado.

A imagem lógica contém ext4. Imagens existentes são verificadas antes da montagem gravável; resultados de fsck acima do status de erros corrigidos rejeitam a sessão em vez de montá-la gravável. O redimensionamento só permite crescimento, e o sistema de arquivos ext4 interno é expandido quando possível. Para diagnóstico voltado ao usuário, veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

O modo `dynblk` utiliza um dispositivo de bloco do kernel, separado de DynFileFS. Cada sessão numerada possui `volume000.db` e todos os seus irmãos numerados (`volume001.db`, ..., `volume1000.db`, e além). O layout nativo é `DBSPRS01`, formato de disco **1**. Layouts não suportados são rejeitados em vez de convertidos silenciosamente. Mantenha as versões do CLI e dos módulos instalados compatíveis.

MiniOS cria ext4 em todo o disco retornado por `/dev/dynblk-control`, como `/dev/dynblk3`; não assume que `dynblk0` está livre. Ext4 existente é verificado antes do uso gravável. O estado protegido do boot registra exatamente esse dispositivo para que o desligamento o desconecte apenas após seus usuários e o sistema de arquivos superior terem sido fechados. Vários dispositivos independentes podem coexistir.

Gerenciador de sessões, instalador e initramfs consultam `dynblk limits --format dynblk` para o limite de geometria do backend instalado. O guardião de recursos atual permite 65536 partes: intervalos lógicos padrão de 1 GiB permitem até 64 TiB. Limites físicos menores reduzem o limite virtual. Este é um teto de geometria, não uma promessa de que o host pode manter tantos arquivos abertos ou tem espaço suficiente de RAM/armazenamento. O crescimento é suportado; a redução não.

As tabelas de mapeamento residem em disco. `--map-memory-mb` controla um cache de metadados por dispositivo (padrão 1 MiB, faixa 1..64 MiB), não mais uma porcentagem de RAM ou um limite de dados mapeados. Descrições de extensão, vetores de arquivos abertos e pequenos diretórios crescem com a geometria declarada, não com o preenchimento do payload. O attach escaneia metadados de mapeamento e reconstrói temporariamente o estado de alocação uma parte por vez; não lê todo o payload. O `dynblk check` completo lê os payloads. `engine_memory_bytes` exclui cache de página do sistema de arquivos, internos do codec e outras alocações do kernel.

Arquivos de metadados para todas as partes declaradas são inicializados ao criar/crescer; os dados reais permanecem thin. As partes são limitadas a 4000 MiB. Faça backup do namespace destacado completo, sem assumir números de três dígitos ou uma parte final fixa. Um novo volume pode selecionar compactação com `perchcomp`; carregamentos posteriores usam o codec armazenado. LUKS2 acima de DynBlk força a compactação para `none`. Gravações parciais em dados compactados atualmente recomprimem o respectivo bloco de 64 KiB. Falta de armazenamento ou recursos ainda pode causar falhas nas gravações; o sistema de arquivos superior deve ser desmontado antes do detach.

### Sessões VMDK

O modo de sessão `vmdk` utiliza o mesmo driver com imagens reais `twoGbMaxExtentSparse`
sua primária é `volume.vmdk`, com `volume-s001.vmdk` e subsequentes
partes; cada parte cobre até 2 GiB de espaço lógico. O descritor é limitado
a menos de 1 MiB, então o comprimento do nome do arquivo e a contagem de extensões restringem a capacidade.
Gerenciador de sessões, Instalador e initramfs consultam `dynblk limits --format vmdk`.
O modo nativo continua usando `volume000.db`; nenhum dos modos reinterpreta os arquivos do outro
modo. Sessões gerenciadas não importam um VMDK particionado externamente arbitrário
como metadados de sessão.

O suporte a sessões VMDK é anunciado por `vmdk-session-v1` em
`/etc/minios-initramfs-dynblk` dentro do initrd. O runtime atual e todo
initrd de origem copiado pelo Instalador devem suportá-lo. VMDK não possui compactação nativa;
`perchcomp` é ignorado com aviso no boot e o Gerenciador de sessões rejeita um
codec VMDK não-`none`. LUKS2 continua sendo uma camada de criptografia separada opcional. Ambos os modos publicam
seu modo de sessão real e o `dynblk_device` proprietário no estado protegido do boot,
e ambas as implementações de desligamento fecham esse dispositivo após a saída dos usuários.

Ambos os formatos de driver suportam `writeback`, `writethrough`, `none`, `directsync` e políticas explícitas de anexação `unsafe`. Modos diretos atualmente requerem ext2/ext4 por baixo. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback` anexa um sistema de arquivos existente; `umount` libera o dispositivo gerenciado pelo auxiliar após o fechamento do último usuário. O `dynblk load` manual tem tempo de vida explícito. Isso não cria um sistema de arquivos nem desbloqueia LUKS.

### Raw

O modo Raw utiliza um único `changes.img` arquivo contendo ext4. O tamanho do arquivo é definido para a capacidade lógica solicitada no momento da criação, então, ao contrário dos backends dinâmicos, a capacidade é fixa até uma operação explícita de crescimento. O sistema de arquivos inferior pode representar extensões não gravadas de forma esparsa, mas MiniOS ainda trata Raw como armazenamento de capacidade fixa e verifica o espaço de base disponível antes de criar ou expandir. Como tudo fica em um único arquivo do host, o FAT32 é limitado a 4000 MiB.

Imagens Raw existentes são verificadas com `e2fsck` antes da montagem gravável. O crescimento expande `changes.img` e depois expande o ext4 com `resize2fs`; a redução não é suportada. Uma verificação ou montagem com falha preserva a imagem para recuperação e continua o boot em RAM. Raw não possui daemon FUSE ou metadados de armazenamento de bloco personalizados, o que torna seu modelo de recuperação simples, mas não tem o comportamento de capacidade thin do DynFileFS e DynBlk.

### Camada de criptografia LUKS

LUKS2 é uma camada opcional de criptografia selecionada com `perchencrypt=luks` ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. Sessões existentes assumem seu estado de criptografia a partir dos metadados da sessão; especificar `perchencrypt` posteriormente não reinterpreta nem converte uma sessão plaintext existente.

O limite de criptografia depende do backend: Raw conecta `changes.img` via dispositivo loop e coloca LUKS2 dentro desse arquivo; DynFileFS conecta sua imagem `virtual.dat` via dispositivo loop e criptografa essa imagem lógica; DynBlk usa seu dispositivo de bloco `/dev/dynblkN` alocado diretamente; VMDK usa o dispositivo de bloco exposto pelo mesmo driver DynBlk para sua imagem split sparse. Em todos os quatro casos, MiniOS cria ext4 dentro de `/dev/mapper/...`, então o conteúdo e os metadados do sistema de arquivos dentro do mapper ficam criptografados em repouso. Metadados do backend fora do limite LUKS, descritores VMDK, arquivos de boot, metadados de sessão e outros arquivos no meio de persistência permanecem não criptografados.

Padrões de tamanho, limites de crescimento, restrições do FAT32 e comportamento de alocação thin/fixa ainda pertencem ao backend subjacente. O initrd autentica antes de expandir um backend criptografado existente, fecha o mapper antes do crescimento do backend, depois reabre, verifica o ext4 e expande o sistema de arquivos antes de montá-lo. Para DynBlk criptografado, a compactação do backend é forçada para `none`.

A criação solicita a senha duas vezes. Sessões criptografadas existentes permitem três tentativas de desbloqueio no console do boot. Três senhas rejeitadas invocam um caminho fatal de boot: MiniOS não continua em RAM, não reinterpreta a mesma sessão como plaintext, não seleciona outro backend nem cria substituto. Outras falhas de criação, verificação, redimensionamento ou montagem mantêm seu comportamento de recuperação específico do backend sem fallback para plaintext. As senhas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando. Exportações lógicas contêm arquivos de sessão descriptografados em vez de uma imagem de backend criptografada.

Veja [Segurança](/maintenance-and-recovery/Security) para o limite de proteção e considerações de backup.

### SquashFS

O initrd normalmente ativa uma sessão SquashFS existente. A configuração interativa cria metadados de geração zero com salvamento no desligamento ativado, mas não cria `changes.sb`; a camada superior gravável existe apenas em RAM até que o sistema em execução realize o primeiro salvamento sob demanda ou no desligamento. Uma sessão de geração zero é válida apenas quando campos de artefato de snapshot e `changes.sb` estão ausentes. Para gerações posteriores, a ativação valida metadados estritos e de valor único para o snapshot, incluindo seu digest, tamanhos compactado e descompactado, contagem de entradas, tipo de union e política de salvamento. Também verifica o tipo e tamanho exatos do arquivo, RAM e swap disponíveis, o hash SHA-256 antes e depois da extração e a compatibilidade atual da union.

O snapshot é extraído com tratamento rigoroso de erros e xattr para uma imagem ext4 temporária e limitada em RAM. Para OverlayFS, essa imagem contém diretórios separados `changes` e `workdir`; para AUFS, sua raiz é o branch gravável.
Metadados malformados, memória insuficiente, alterações de digest, erros de extração ou política inválida fazem a ativação falhar e deixam o boot com a camada superior RAM padrão.

Uma sessão marcada como `dirty` significa que o boot anterior não completou a transição de desligamento limpo. SquashFS então avisa e restaura o último `changes.sb`salvamento bem-sucedido; alterações não salvas do boot interrompido não são uma segunda geração de rollback.

O Gerenciador de sessões MiniOS e o backend de salvamento do sistema criam e substituem atomicamente snapshots SquashFS usando captura exata. A ativação do boot pode ler um snapshot existente de mídias FAT, exFAT ou NTFS graváveis porque a extração ocorre na camada superior ext4 temporária. Criação e salvamento exato continuam dependentes do sistema de arquivos: o armazenamento de sessão deve suportar criação de área de trabalho privada, metadados Linux e publicação durável em um sistema de arquivos POSIX adequado.

Durante o salvamento, o backend primeiro captura uma árvore de arquivos estável em armazenamento de memória privada de root quando o initrd fornece um tmpfs confiável com espaço suficiente. Quando RAM é insuficiente, essa árvore usa o workspace de disco anterior. O compressor grava diretamente em um diretório privado modo-0700 no sistema de arquivos da sessão, não em uma imagem RAM adicional seguida de outra cópia em disco. MiniOS verifica o resultado compactado e sua identidade, sincroniza, move para um nome de candidato privado e revalida o candidato antes de substituir atomicamente o `changes.sb`snapshot ativo. Cópias ou compactações com falha não substituem o último snapshot bem-sucedido.

Com uma sessão durável saudável, `/var/log/minios` e `/var/log/live` são montados via bind de `boot-logs/` dentro da sessão numerada. Esses diagnósticos de inicialização são escritos independentemente da camada superior RAM e do snapshot de desligamento. Um boot cujo armazenamento de persistência não foi ativado de forma durável não pode garantir que esses logs sobreviverão a um reinício. Logs e caches comuns podem ser configurados separadamente; veja [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS não possui `perchsize`: seu tamanho armazenado segue as alterações capturadas compactadas, enquanto a memória em tempo de execução é determinada pela camada superior gravável extraída. A camada de persistência LUKS MiniOS não envolve `changes.sb`; se for necessária confidencialidade do snapshot, o armazenamento de base deve ser criptografado fora desta camada. Veja [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação da union e limite de recuperação

Para AUFS, a raiz de alterações ativada se torna o branch gravável zero. Para OverlayFS, o initrd constrói `upperdir` e `workdir` abaixo da raiz de alterações ativada e monta os módulos somente leitura como diretórios inferiores. O initrd então verifica o branch live AUFS ou OverlayFS `upperdir` antes de publicar a persistência como ativa.

Se um backend de persistência, atualização de metadados ou essa verificação falhar, seus pontos de montagem são desfeitos quando possível, nenhum estado de persistência bem-sucedido é publicado e o boot gravável continua em RAM. Falha ao construir a union root entra no shell fatal do initramfs. Sair desse shell pode permitir que a configuração continue com uma root inválida; isso não é um reparo nem um fallback seguro. AUFS mantém anexos de branch de módulo melhor esforço, mas uma union incompleta cruza o limite de recuperação: MiniOS não marca a persistência como ativa.

Falhas na verificação do container evitam deliberadamente montar uma sessão suspeita como gravável.
Não substitua nem reconstrua arquivos de sessão durante o boot. Preserve primeiro o armazenamento afetado; veja [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Estado ativo, em execução e do boot atual

Nos metadados de sessão duráveis, `default=` é a sessão **ativa** selecionada para a próxima retomada, enquanto `running=` é a sessão registrada como fornecedora do boot atual. A ativação grava ambos os campos e marca essa sessão como `dirty`.
Após os pontos de montagem de persistência desaparecerem durante um desligamento limpo, MiniOS remove `running=` e marca a sessão como `clean`.

Esses campos de metadados podem ficar desatualizados após uma falha, falha na gravação de metadados, falha na construção da union, armazenamento copiado ou desligamento interrompido. Componentes em tempo de execução que permitem salvamento não confiam apenas em `running=`. Eles usam o estado protegido do boot atual do initrd, vinculado ao ID do boot, sessão numérica, modo, identidade real do armazenamento, status gravável, durabilidade, geração ativa verificada e, para DynBlk, o dispositivo `/dev/dynblkN` anexado exato. Um registro de boot atual com falha ou ausente significa que a persistência não deve ser tratada como destino de salvamento aprovado.

Com `perchtoram=trim` ou `full`, containers de sessão suportados são copiados para um tmpfs dedicado antes da ativação. A sessão copiada pode ser gravável e fornecer a camada superior em execução, mas o estado protegido do boot atual a marca como não durável e registra uma identidade `ram-origin` separada para o armazenamento original. `trim` copia apenas a sessão suportada selecionada e os metadados correspondentes; `full` copia todas as sessões Raw, DynFileFS, DynBlk, VMDK ou SquashFS suportadas no armazenamento. Sessões de diretório nativas são excluídas. O Gerenciador de sessões atual usa `ram-origin` para resolver o armazenamento original pelo UUID do sistema de arquivos e pode salvar explicitamente a sessão com RAM de volta ou como uma nova sessão numerada. Alterações RAM não salvas ainda são perdidas quando não ocorre gravação bem-sucedida.

Para orientações operacionais relacionadas, veja [Modos de boot](/using-minios/Boot-Modes), [Parâmetros de boot](/reference/Boot-Parameters), [Sessões e persistência](/using-minios/Sessions-and-Persistence), [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Segurança](/maintenance-and-recovery/Security), e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Liberação de espaço com reconhecimento de sessão

`minios-session reclaim ID` oferece suporte a sessões DynFileFS, DynBlk e VMDK. Para uma sessão plaintext, executa FITRIM no sistema de arquivos ext4 interno real, nunca na raiz combinada AUFS/OverlayFS, e depois chama a operação de liberação do backend de armazenamento proprietário. A liberação DynFileFS requer DynFileFS 4.6.0 ou superior.

Para uma sessão DynFileFS em execução, o Gerenciador de sessões entra em um namespace de montagem privado de curta duração para acessar `virtual.dat` abaixo do overlay ext4 ativo sem afetar o daemon do sistema, dispositivo loop ou montagens de union. Dispositivos DynBlk/VMDK em execução são validados contra o estado protegido do boot atual. Sessões inativas são temporariamente anexadas e montadas; uma sessão já montada pelo Gerenciador de sessões reutiliza esse anexo existente. Uma desmontagem ocupada interrompe o teardown em vez de desconectar o armazenamento sob um sistema de arquivos ativo.

Nem o boot nem o desligamento executam a compactação automaticamente. `--compact` é uma escolha explícita do usuário na CLI ou na opção de diálogo não marcada do Gerenciador de sessões e pode realocar dados ativos, aumentando as gravações em flash. Sem ela, os backends liberam apenas o espaço que podem devolver sem mover dados ativos, como intervalos furáveis ou finais de arquivos completamente livres; em sistemas de arquivos como exFAT, intervalos internos liberados podem continuar reutilizáveis dentro do container mesmo quando não podem ser devolvidos ao sistema de arquivos do host. Sessões criptografadas liberam apenas o espaço já conhecido pelo backend e não habilitam descarte silenciosamente via dm-crypt.
