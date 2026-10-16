---
updated: 2026-10-15
---

# Componentes internos da persistência

Esta página explica os `perch`, `perchdir`, `perchmode`, `perchsize`, `perchreserve`, `perchencrypt`, `perchcomp`, e `perchtoram` parâmetros de inicialização. Esses parâmetros controlam onde as alterações de uma sessão ao vivo são armazenadas, como uma nova sessão é criada e se o armazenamento de sessão compatível é copiado para RAM. Para uso normal, selecione uma entrada persistente no menu de inicialização ou use o Gerenciador de sessões MiniOS em vez de editá-los manualmente.

MiniOS monta a raiz do sistema ao vivo a partir de módulos somente leitura e de uma camada superior gravável.
O initrd decide se essa camada superior será uma sessão persistente numerada ou um diretório temporário em RAM. Esta página descreve essa decisão durante a inicialização e o processo de ativação. Para conhecer os controles disponíveis para o usuário, consulte [Modos de inicialização](/using-minios/Boot-Modes) e [Parâmetros de inicialização](/reference/Boot-Parameters).

## Em termos simples

Sem um parâmetro de persistência, MiniOS armazena as alterações em RAM e as descarta ao ser encerrado. Um parâmetro de persistência solicita que MiniOS localize um armazenamento gravável, selecione ou crie uma sessão numerada, verifique a compatibilidade e use essa sessão como camada gravável.

Solicitar persistência não garante que ela tenha sido ativada. Se o destino for somente leitura, estiver cheio, danificado ou for incompatível, MiniOS poderá continuar com uma camada RAM temporária. Leia o aviso de inicialização antes de confiar que as alterações foram salvas.

## Explicação dos parâmetros

| Parâmetro | O que informa MiniOS | Escolha típica |
|---|---|---|
| `perchdir=resume` | Abre a sessão compatível padrão e, em condições compatíveis, cria uma sessão substituta quando ela não pode ser usada. | Uso diário normal. |
| `perchdir=setup` | Permite escolher interativamente o backend de persistência e as opções de criptografia/compactação compatíveis e, em seguida, cria uma nova sessão numerada. | Atual **Iniciar nova sessão** entrada do menu de inicialização. |
| `perchdir=new` | Cria diretamente uma nova sessão numerada usando o `perchmode`, a criptografia, a compactação e o tamanho solicitados ou padrão, sem exibir o seletor de backend. | Entradas de inicialização com script ou para especialistas, cujas opções de armazenamento já foram especificadas. |
| `perchdir=ask` | Exibe as sessões salvas e permite escolher uma. Se o armazenamento não tiver sessões salvas, o seletor inicia o mesmo fluxo de configuração usado por `perchdir=setup`. | Vários espaços de trabalho em um dispositivo, incluindo a primeira configuração interativa em um armazenamento vazio. |
| `perchdir=NUMBER` | Solicita uma sessão numerada específica. | Entrada de inicialização personalizada e estável, após verificar o ID da sessão. |
| `perchmode=MODE` | Selecione `native`, `dynfilefs`, `dynblk`, `vmdk`, `raw`, ou `squashfs`. | Compatível com o sistema de arquivos subjacente e o modelo de persistência desejado. |
| `perchencrypt=luks` | Adiciona uma camada LUKS2 ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. | Criptografa um backend de contêiner compatível. |
| `perchsize=SIZE` | Solicita o tamanho de uma sessão de contêiner nova ou em expansão. | DynFileFS, DynBlk, VMDK ou raw; a criptografia não altera a semântica de tamanho do backend. |
| `perchcomp=CODEC` | Seleciona a compactação do backend DynBlk para uma sessão DynBlk recém-criada. | `none`, `lz4`, `lz4hc`, `lzo`, `lzo-rle`, `zstd`, `deflate`, ou `842`; a disponibilidade ainda depende do kernel em execução. A compactação é desativada quando o LUKS encapsula DynBlk. |
| `perchreserve=MB` | Subtrai uma margem ao dimensionar um contêiner novo ou em expansão e define o limite de aviso de pouco espaço. | Deixe espaço disponível ao alocar um contêiner; isso não é uma cota em tempo de execução. |
| `perch` | Usa o comportamento de retomada antigo, sem criação automática de uma sessão substituta. | Compatibilidade com uma entrada personalizada existente; prefira `perchdir=resume` nos menus atuais. |
| `perchtoram=off`, `perchtoram=trim`, `perchtoram=full` | Controla a cópia dos dados de persistência independentemente da `toram` do sistema. | `off` mantém o armazenamento original ativo; `trim` copia apenas a sessão compatível selecionada; `full` copia todas as sessões de contêiner/SquashFS compatíveis. |

Quando a persistência é solicitada, a `toram` do sistema torna `perchtoram=trim` o padrão, a menos que seja especificado um modo explícito de persistência-RAM. Sem a `toram` do sistema, por padrão a persistência permanece no armazenamento. Uma sessão copiada não é durável enquanto está em execução, mas o Session Manager atual pode salvar explicitamente no armazenamento original o estado compatível baseado em RAM ou publicá-lo como uma nova sessão, quando o armazenamento original estiver disponível e corresponder à identidade registrada na inicialização.

## A persistência é explícita

O initrd só habilita o gerenciamento de persistência quando a linha de comando do kernel contém um destes tokens reconhecidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchencrypt=...`
- `perchsize=...`
- `perchcomp=...`
- `perchreserve=...`

Sem nenhum desses tokens, inclusive quando há apenas um nome não reconhecido `perch...` presente, MiniOS cria uma nova camada superior gravável em RAM. As alterações feitas durante essa inicialização são descartadas ao desligar.

Os seletores não são todos equivalentes:

| Seletor | Comportamento do initrd |
|---|---|
| `perch` | Tenta retomar o padrão dos metadados. Não cria automaticamente uma sessão quando nenhuma está disponível ou quando as verificações de compatibilidade falham. |
| `perchdir=resume` | Tenta usar o padrão dos metadados e pode criar automaticamente uma nova sessão compatível como substituta. Esse é o comportamento atual de retomada do menu de inicialização. |
| `perchdir=setup` | Abre primeiro o seletor de backend, registra a solicitação de backend/criptografia/compactação selecionada e, em seguida, segue o fluxo de alocação de uma nova sessão. |
| `perchdir=new` | Aloca um diretório cujo ID numérico é um a mais que o maior ID numérico existente. Nunca reutiliza um diretório existente e não abre o seletor de backend. |
| `perchdir=ask` | Oferece as sessões existentes, se houver; uma sessão existente incompatível exige confirmação. Se não houver padrão/sessão no armazenamento, muda para `setup` para que a primeira sessão possa ser criada interativamente. |
| `perchdir=NUMBER` | Usa esse diretório quando ele existe. Caso contrário, a seleção pode recorrer ao padrão registrado nos metadados; o número solicitado não fica reservado. |

Outros parâmetros de persistência reconhecidos, sem seletor, seguem o mesmo fluxo legado de retomada que `perch`: eles solicitam persistência, mas não habilitam a criação automática. `perchtoram` sozinho não é uma solicitação de persistência. Se a seleção ou ativação não conseguir disponibilizar uma camada superior utilizável, a inicialização normalmente continua com a camada superior RAM e exibe um aviso de falha.

## Armazenamento e localização da sessão

O armazenamento padrão é o `changes` diretório ao lado dos dados MiniOS, com diretórios de sessão numerados e `session.conf` ou `session.json` metadados:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

O armazenamento também pode ser selecionado como um dispositivo com um caminho opcional. Entre as formas aceitas estão um caminho `/dev/...` direto, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` e `askdisk:custom:path`. O sufixo separado por dois-pontos se torna um caminho abaixo do dispositivo selecionado; a sintaxe com barra após `askdisk` descarta silenciosamente esse caminho personalizado. Um subdiretório selecionado é montado por bind como armazenamento da sessão. MiniOS também pode localizar uma partição de persistência no mesmo drive e armazenamento de persistência Ventoy compatível.

Antes da seleção da sessão, o initrd precisa montar o local com permissão de escrita e comprovar que consegue criar e remover um marcador no armazenamento. Se não for possível abrir um dispositivo de bloco para escrita, se a montagem for somente leitura, se o caminho estiver indisponível ou se o teste de gravação falhar, a persistência será rejeitada nessa inicialização. As sessões existentes não são consideradas confiáveis apenas porque seus arquivos podem ser lidos.

## Seleção e compatibilidade

Os metadados da sessão registram o modo de armazenamento e podem registrar a versão, a edição, o sistema de arquivos union e o tamanho do contêiner de MiniOS. Ao retomar, o sistema compara o modo, a versão, a edição e o union registrados com o modo solicitado e o sistema atual.
Campos de compatibilidade legados ausentes não são considerados incompatibilidades.

Literal `perchdir=resume` cria uma nova sessão numerada quando o padrão está ausente ou quando uma incompatibilidade entre o modo, a versão, a edição ou o union registrados torna esse padrão inadequado. Bare `perch`, uma seleção numérica direta e outras solicitações legadas de retomada não permitem a substituição automática e continuam em RAM após uma falha na seleção. `perchdir=ask` mostra informações de compatibilidade e permite uma substituição explícita. Uma nova sessão usa `native` por padrão, a menos que outro modo tenha sido solicitado.

O modo de armazenamento faz parte da compatibilidade. Se a seleção chegar ao despacho do backend, um modo solicitado desconhecido será substituído por `native`, cuja verificação pode selecionar DynBlk ou DynFileFS se o armazenamento não for adequado. Uma sessão existente com um modo registrado diferente pode falhar na verificação de compatibilidade anterior; nesse caso, uma solicitação legada de retomada continua em RAM em vez de chegar a esse fallback.

### Redefinindo uma sessão incompatível

A seleção interativa oferece **Redefinir, manter configurações** e **Redefinir, manter dados**, além de voltar à lista ou continuar explicitamente sem redefinir. A redefinição é executada antes da ativação da união. Ela remove árvores de programas e bibliotecas do sistema, o estado do gerenciador de pacotes do sistema, softwares Flatpak/Snap instalados para todo o sistema e caches. As listas de arquivos dos pacotes ajudam a identificar softwares instalados em outros locais; arquivos não listados são mantidos por precaução.

Ambos os modos mantêm `/home` e `/root`, incluindo configurações ocultas, caches, perfis de navegador e programas instalados no diretório pessoal. Eles também mantêm contas, mapeamentos de UID/GID, senhas, chaves de host SSH, chaves privadas TLS e dados preservados fora das árvores do diretório pessoal. O modo que mantém as configurações preserva as `/etc` comuns e a configuração dos pacotes; o modo que mantém apenas os dados redefine essas configurações do sistema, preservando as configurações pessoais nas árvores do diretório pessoal. Isso não identifica todos os programas instalados manualmente em locais arbitrários.

Uma nova camada superior é preparada ao lado da original, exigindo espaço livre para uma segunda cópia dos dados preservados. Se a cópia ou a substituição falhar, as alterações serão revertidas; transações interrompidas serão recuperadas na próxima montagem. SquashFS reset modifica apenas a camada superior RAM reconstruída: o snapshot antigo e os metadados de compatibilidade continuam sendo a referência até que uma gravação da camada superior redefinida seja concluída com sucesso. Uma redefinição de sessão nativa desativa `perchtoram` nessa inicialização para evitar substituir os dados preservados por um contêiner RAM vazio. A retomada automática nunca redefine uma sessão silenciosamente.

## Reserva de espaço e tamanhos

MiniOS usa 256 MiB como margem de alocação padrão e limite de aviso de pouco espaço. O cálculo usa blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem sinal e sem unidade, limitado a 4096, e usa 256 como padrão quando o valor está ausente ou é inválido. A margem reduz o espaço oferecido a um contêiner novo ou em expansão. Ela não é uma cota: uma sessão nativa ou gravações posteriores ainda podem consumir o espaço restante do sistema de arquivos. Durante a inicialização, é exibido um aviso quando o espaço livre atual é igual ou inferior ao limite.

Os tamanhos dos contêineres são números inteiros alocados em MiB:

- Um número sem unidade, `M`, ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- Contêineres Raw têm limite de 1.000.000 MiB e são limitados pelo espaço disponível após a reserva. DynFileFS tem um limite separado que leva em conta RAM e um teto rígido de 2.000.000 MiB. DynBlk obtém seu limite de geometria no formato nativo de `dynblk limits --format dynblk`; MiniOS não impõe um teto separado de 512 GiB.
- Raw é um único arquivo de armazenamento, por isso o FAT32 o limita a 4000 MiB em MiniOS. O mesmo limite se aplica quando Raw é encapsulado em LUKS2.
- Uma nova sessão Raw usa 4000 MiB por padrão. A criptografia não cria uma política de tamanho LUKS separada: uma sessão Raw criptografada, DynFileFS, DynBlk ou VMDK mantém as regras de tamanho do backend subjacente.
- Uma nova sessão DynFileFS criada pelo initrd, sem `perchsize` usa até 16 GiB de capacidade lógica. Se o armazenamento subjacente não puder comportar esse volume após `perchreserve` e a sobrecarga do índice DynFileFS, o tamanho padrão será reduzido à capacidade disponível. Seu índice no formato 400 consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento subjacente por GiB de capacidade lógica declarada, mesmo quando a carga está vazia. Portanto, MiniOS também limita a capacidade de DynFileFS com base em RAM físico e em um teto rígido testado de 2.000.000 MiB.
- Uma nova sessão DynBlk, sem `perchsize` segue o mesmo teto automático de 16 GiB e é reduzida quando resta menos espaço de armazenamento subjacente após `perchreserve`. Um tamanho DynBlk explícito é uma solicitação de capacidade thin, verificada em relação ao limite instalado do backend. Os metadados das partes declaradas são criados inicialmente, mas o espaço para a carga aumenta conforme a demanda. DynBlk mantém um cache de metadados limitado, independente do preenchimento da carga.

A expansão do contêiner é feita conforme possível; não há suporte para redução. `perchsize` não define o tamanho de sessões nativas nem de sessões SquashFS. O Gerenciador de sessões MiniOS define 4000 MiB como padrão para contêineres Raw e DynFileFS criados manualmente, e 16 GiB para contêineres DynBlk/VMDK; as variantes criptografadas usam os mesmos padrões do backend. Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Ativação do armazenamento

Todos os backends que funcionarem corretamente devem fornecer a camada superior gravável esperada pelo sistema de arquivos de união selecionado. Montar um backend não comprova, por si só, que a persistência está ativa. Native, DynFileFS, DynBlk, VMDK e raw podem atualizar os metadados persistentes da sessão antes da validação da união; SquashFS adia a confirmação desses metadados. Raw, DynFileFS, DynBlk e VMDK também podem usar criptografia LUKS2. O estado protegido da inicialização atual só é publicado após a confirmação de que a união final da raiz usa a camada superior esperada.

| Backend | Representação persistente | Modelo de capacidade | Requisitos de armazenamento subjacente | Camada LUKS2 MiniOS |
|---|---|---|---|---|
| `native` | Arquivos e diretórios diretamente no diretório da sessão numerado | Usa diretamente o espaço do sistema de arquivos subjacente; `perchsize` não se aplica | Sistema de arquivos gravável aprovado no teste de comportamento POSIX | Não |
| `dynfilefs` | Format-400 `changes.dat` mais arquivos de segmentos que expõem um `virtual.dat` | Payload esparso com índice denso dimensionado para a capacidade | Armazenamento gravável POSIX, FAT32, NTFS ou exFAT | Sim |
| `dynblk` | Format-1 `volumeNNN.db` arquivos que expõem `/dev/dynblkN`, com ext4 por cima | Dispositivo de bloco virtual esparso com mapeamentos armazenados no disco e cache limitado | Sistema de arquivos aceito pelo backend de kernel DynBlk e recursos suficientes do backend | Sim |
| `vmdk` | `volume.vmdk` mais `volume-sNNN.vmdk` extensões esparsas divididas expostas pelo driver DynBlk, com ext4 por cima | Dispositivo de bloco virtual esparso dividido | Sistema de arquivos aceito pelo backend VMDK DynBlk e pelo recurso `vmdk-session-v1` | Sim |
| `raw` | Um único arquivo `changes.img` de tamanho fixo contendo ext4 | O arquivo é criado no tamanho lógico solicitado; só pode crescer | Sistema de arquivos gravável capaz de armazenar a imagem; FAT32 tem limite de 4000 MiB | Sim |
| `squashfs` | Snapshot `changes.sb` compactado; a camada superior gravável do ambiente de execução é reconstruída em RAM | O tamanho do snapshot acompanha as alterações capturadas; `perchsize` não se aplica | Snapshots existentes podem ser lidos em mídias graváveis compatíveis; para salvar exatamente, é necessário um armazenamento de persistência compatível com POSIX | Não |

### Nativo

O modo nativo armazena diretamente o conteúdo gravável da união no diretório da sessão numerado. Não há imagem interna, dispositivo de loop, contêiner FUSE nem sistema de arquivos de bloco separado. Assim, a capacidade acompanha simplesmente o espaço livre no sistema de arquivos subjacente, e `perchsize` não se aplica. Esse modo tem a menor sobrecarga de contêiner e mantém os arquivos visíveis normalmente para recuperação e backup.

MiniOS primeiro exclui sistemas de arquivos conhecidos por não serem POSIX, como FAT, exFAT e NTFS. Em seguida, verifica o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e conferindo as alterações no modo executável. Se a verificação for bem-sucedida, o diretório da sessão numerado será montado diretamente como a área gravável. Em armazenamento inadequado ou se a verificação falhar, a criação no modo nativo dá preferência a DynBlk quando a CLI está disponível e o Secure Boot permite seu uso; caso contrário, usa DynFileFS. Essa alternativa inicial não garante que o driver selecionado consiga anexar o dispositivo nem que todos os sistemas de arquivos subjacentes sejam compatíveis. Uma falha após a ativação do modo nativo é revertida; um novo candidato vazio é removido quando isso pode ser feito com segurança.

A camada de persistência LUKS2 MiniOS não envolve o modo nativo, pois ele não tem contêiner nem limite de dispositivo de bloco para criptografar. Ainda assim, a persistência nativa pode ficar em um armazenamento criptografado fora dessa camada de persistência.

### DynFileFS

DynFileFS é o backend de contêiner format-400 baseado em FUSE. Ele expõe uma única imagem lógica`virtual.dat` de imagem`changes.dat` enquanto armazena os dados em`virtual.dat` e em arquivos de segmento numerados. O auxiliar precisa ser montado com sucesso e expor; caso contrário, a ativação falha, em vez de criar acidentalmente um arquivo somente RAM com nome que parece persistente.

O índice de mapeamento é denso em relação à capacidade lógica declarada: cada bloco lógico de 4 KiB tem um offset de 8 bytes. Isso representa cerca de 2 MiB de RAM de índice por GiB de capacidade virtual, e aproximadamente a mesma quantidade é armazenada nos índices dos segmentos de apoio, mesmo antes de os dados de payload serem gravados. A alocação do payload em si permanece dinâmica. Como o binário do initrd estático é i686, MiniOS também aplica um limite de tamanho lógico compatível com RAM e um teto rígido de 2.000.000 MiB, abaixo do ponto de falha do espaço de endereçamento testado.

A imagem lógica contém ext4. As imagens existentes são verificadas antes da montagem com permissão de gravação; resultados da verificação do sistema de arquivos acima do status de erros corrigidos rejeitam a sessão, em vez de montá-la com permissão de gravação. O redimensionamento só aumenta o tamanho, e o sistema de arquivos ext4 interno é expandido quando possível. Para orientações de diagnóstico voltadas ao usuário, consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

### DynBlk

O modo `dynblk` usa um dispositivo de bloco do kernel, separado de DynFileFS. Cada sessão numerada é proprietária de `volume000.db` e de todas as partes numeradas correspondentes (`volume001.db`, ..., `volume1000.db` e além). O layout nativo é `DBSPRS01`, formato de disco **1**. Layouts não compatíveis são rejeitados, em vez de convertidos silenciosamente. Mantenha as versões instaladas da CLI e do módulo compatíveis entre si.

MiniOS cria ext4 em todo o disco retornado por `/dev/dynblk-control`, como `/dev/dynblk3`; não presume que `dynblk0` esteja livre. A existência de ext4 é verificada antes de permitir gravações. Registros protegidos do estado de inicialização identificam esse dispositivo exato, para que, no desligamento, ele seja desconectado somente depois que seus usuários e o sistema de arquivos superior forem fechados. Vários dispositivos independentes podem coexistir.

O Session Manager, o instalador e o initramfs consultam `dynblk limits --format dynblk` para obter o limite de geometria do backend instalado. O limite atual de recursos permite 65536 partes: extensões lógicas padrão de 1 GiB comportam até 64 TiB. Limites menores de partes físicas reduzem o limite virtual. Esse é um limite de geometria, não uma garantia de que o host consiga manter tantos arquivos abertos ou tenha RAM/armazenamento suficiente. É possível aumentar o tamanho, mas não reduzi-lo.

As tabelas de mapeamento ficam no disco. `--map-memory-mb` controla um cache de metadados por dispositivo (padrão de 1 MiB, intervalo de 1 a 64 MiB); esse valor não é mais uma porcentagem de RAM nem um limite para os dados mapeados. As descrições de extensão, os vetores de arquivos abertos e os diretórios pequenos aumentam conforme a geometria declarada, não conforme a quantidade de dados gravados. A conexão examina os metadados de mapeamento e reconstrói temporariamente o estado de alocação, uma parte por vez; não lê todos os dados. A operação completa de `dynblk check` lê os dados. `engine_memory_bytes` não inclui o cache de páginas do sistema de arquivos, os mecanismos internos do codec nem outras alocações do kernel.

Os arquivos de metadados de todas as partes declaradas são inicializados ao criar ou aumentar o volume; os dados propriamente ditos continuam sendo alocados sob demanda. As partes têm limite de 4000 MiB. Faça backup de todo o namespace desconectado, sem presumir números de três dígitos nem uma última parte fixa. Ao criar um volume, é possível selecionar a compactação com `perchcomp`; nas cargas seguintes, é usado o codec armazenado. O LUKS2 acima de DynBlk força a compactação para `none`. Atualmente, gravações parciais em dados compactados recomprimem o bloco de 64 KiB correspondente. Ainda pode haver falhas de gravação por falta de armazenamento ou de recursos; o sistema de arquivos superior precisa ser desmontado antes de desconectar.

### Sessões VMDK

O modo de sessão `vmdk` usa o mesmo driver com imagens `twoGbMaxExtentSparse`
reais. Seu primário é `volume.vmdk`, com `volume-s001.vmdk` e partes subsequentes
; cada parte cobre até 2 GiB de espaço lógico. O descritor é limitado
a menos de 1 MiB, então o tamanho do nome do arquivo e a quantidade de extensões restringem a capacidade.
O Session Manager, o Installer e o initramfs consultam `dynblk limits --format vmdk`.
O formato nativo DynBlk continua usando `volume000.db`; nenhum dos formatos reinterpreta os
arquivos do outro. Sessões gerenciadas não importam um VMDK particionado externamente de forma arbitrária
como metadados de sessão.

O suporte a sessões VMDK é anunciado por `vmdk-session-v1` em
`/etc/minios-initramfs-dynblk` dentro do initrd. O runtime atual e todos os initrds de origem copiados pelo Installer
precisam oferecer suporte a esse recurso. O VMDK não tem compactação nativa;
`perchcomp` é ignorado com um aviso durante a inicialização, e o Session Manager rejeita um codec VMDK
não-`none` VMDK. O LUKS2 continua sendo uma camada de criptografia separada e opcional. Ambos os modos publicam
o modo de sessão real e o `dynblk_device`responsável pelo dispositivo no estado de inicialização protegido,
e ambas as implementações de desligamento fecham o dispositivo depois que seus usuários saem.

Os dois formatos de driver oferecem suporte a `writeback`, `writethrough`, `none`, `directsync` e políticas explícitas de `unsafe`anexação. Atualmente, os modos diretos exigem ext2/ext4 como sistema de arquivos subjacente. `mount -t dynblk /path/to/image /mnt -o inner-fstype=ext4,cache=writeback`anexa um sistema de arquivos existente; `umount`libera o dispositivo gerenciado pelo auxiliar depois que o último usuário o fecha. O `dynblk load`manual tem tempo de vida explícito. Isso não cria um sistema de arquivos nem desbloqueia o LUKS.

O armazenamento de apoio em tmpfs é compatível com os dois formatos, usando `writeback`, `writethrough` e `unsafe`; os modos de E/S direta são rejeitados, em vez de serem alterados silenciosamente. A ordem de gravação não torna durável após o desligamento uma sessão apoiada em tmpfs. Esse suporte viabiliza sessões DynBlk/VMDK RAM, cujas alterações precisam ser salvas explicitamente no armazenamento original.

### Raw

O modo Raw usa um único `changes.img` arquivo que contém ext4. O tamanho do arquivo é definido como a capacidade lógica solicitada no momento da criação. Assim, ao contrário dos back-ends dinâmicos, a capacidade em si permanece fixa até uma operação explícita de expansão. O sistema de arquivos subjacente pode representar extensões não gravadas de forma esparsa, mas MiniOS ainda trata Raw como armazenamento de capacidade fixa e verifica o espaço disponível no dispositivo de armazenamento antes de criá-lo ou expandi-lo. Como tudo fica em um único arquivo no host, o FAT32 tem um limite de 4000 MiB.

As imagens Raw existentes são verificadas com `e2fsck` antes da montagem com permissão de escrita. A expansão aumenta `changes.img` e, em seguida, expande o ext4 com `resize2fs`; não é possível reduzir o tamanho. Se uma verificação ou montagem falhar, a imagem é preservada para recuperação, e a inicialização continua em RAM. Raw não usa daemon FUSE nem metadados personalizados de armazenamento em blocos, o que simplifica o processo de recuperação, mas não oferece o comportamento de capacidade thin de DynFileFS e DynBlk.

### Camada de criptografia LUKS

O LUKS2 é uma camada de criptografia opcional selecionada com `perchencrypt=luks` ao criar uma sessão Raw, DynFileFS, DynBlk ou VMDK. Sessões existentes obtêm o estado de criptografia dos metadados da sessão; especificar `perchencrypt` posteriormente não altera a interpretação nem converte uma sessão existente sem criptografia.

O limite da criptografia depende do backend: o Raw anexa `changes.img` por meio de um dispositivo loop e coloca o LUKS2 dentro desse arquivo; DynFileFS anexa seu `virtual.dat` exposto por meio de um dispositivo loop e criptografa essa imagem lógica; DynBlk usa diretamente o dispositivo de bloco `/dev/dynblkN` alocado; o VMDK usa o dispositivo de bloco exposto pelo mesmo driver DynBlk para sua imagem esparsa dividida. Nos quatro casos, MiniOS cria um sistema de arquivos ext4 dentro de `/dev/mapper/...`, de modo que o conteúdo e os metadados do sistema de arquivos dentro do mapeador ficam criptografados em repouso. Os metadados do backend fora do limite do LUKS, os descritores VMDK, os arquivos de inicialização, os metadados da sessão e outros arquivos no meio de persistência permanecem sem criptografia.

Os valores padrão de tamanho, os limites de expansão, as restrições do FAT32 e o comportamento de alocação dinâmica ou fixa continuam sendo definidos pelo backend subjacente. O initrd autentica antes de expandir um backend criptografado existente, fecha o mapeador antes da expansão do backend e, em seguida, reabre o mapeador, verifica o ext4 e expande o sistema de arquivos antes de montá-lo. Para DynBlk criptografado, a compactação do backend é forçada para `none`.

Durante a criação, a frase secreta é solicitada duas vezes. Sessões criptografadas existentes permitem três tentativas de desbloqueio no console de inicialização. Três frases secretas rejeitadas acionam um processo de inicialização com falha fatal: MiniOS não continua em RAM, não interpreta a mesma sessão como sem criptografia, não seleciona outro backend nem cria uma substituta. Falhas em outras operações de criação, verificação, redimensionamento ou montagem mantêm o comportamento de recuperação específico de cada backend, sem recorrer a uma alternativa sem criptografia. As frases secretas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando. As exportações lógicas contêm arquivos da sessão descriptografados, e não uma imagem de backend criptografada.

Consulte [Segurança](/maintenance-and-recovery/Security) para saber mais sobre o limite de proteção e as considerações sobre backups.

### SquashFS

O initrd normalmente ativa uma sessão SquashFS existente. A configuração interativa cria metadados da geração zero com o salvamento no desligamento ativado, mas não cria `changes.sb`; a camada superior gravável existe apenas em RAM até que o sistema em execução faça o primeiro salvamento sob demanda ou no desligamento. Uma sessão da geração zero só é válida quando os campos de artefato do snapshot e `changes.sb` estão ausentes. Nas gerações seguintes, a ativação valida metadados estritos e de valor único do snapshot, incluindo seu digest, tamanhos comprimido e descomprimido, número de entradas, tipo de união e política de salvamento. Também verifica o tipo de arquivo e o tamanho exato, a RAM e a swap disponíveis, o digest SHA-256 antes e depois da extração e a compatibilidade da união atual.

O snapshot é extraído com tratamento rigoroso de erros e xattrs para uma imagem ext4 temporária de tamanho limitado em RAM. Para OverlayFS, essa imagem contém diretórios `changes` e `workdir` separados; para AUFS, sua raiz é a ramificação gravável.
Metadados malformados, memória insuficiente, alterações no digest, erros de extração ou uma política inválida impedem a ativação e mantêm a inicialização na camada superior RAM comum.

Uma sessão marcada como `dirty` indica que a inicialização anterior não concluiu a transição de desligamento normal. Nesse caso, SquashFS avisa e restaura o último `changes.sb` salvo com sucesso; as alterações não salvas da inicialização interrompida não constituem uma segunda geração de reversão.

O MiniOS Gerenciador de sessões e o backend de salvamento do sistema criam e substituem atomicamente snapshots SquashFS usando captura exata. A ativação na inicialização pode ler um snapshot existente em armazenamento FAT, exFAT ou NTFS gravável, pois a extração ocorre na camada superior ext4 temporária. A criação e o salvamento exato continuam condicionados ao sistema de arquivos: o armazenamento da sessão deve oferecer suporte à criação de áreas de trabalho privadas, a metadados do Linux e à publicação durável em um sistema de arquivos POSIX adequado.

Durante o salvamento, o backend primeiro captura uma árvore de arquivos estável em um armazenamento de memória privado, de propriedade do root, quando o initrd fornece um tmpfs confiável com espaço suficiente. Quando RAM é insuficiente, essa árvore usa o espaço de trabalho em disco anterior. O compressor grava diretamente em um único diretório privado com modo 0700 no sistema de arquivos da sessão, sem criar uma imagem RAM adicional seguida de outra cópia em disco. MiniOS verifica o resultado comprimido e sua identidade, sincroniza os dados, move o arquivo para um nome de candidato privado e valida novamente o candidato antes de substituir atomicamente o `changes.sb`. Falhas na cópia ou na compressão não substituem o último snapshot salvo com sucesso.

Com uma sessão durável e funcionando corretamente, `/var/log/minios` e `/var/log/live` são montados por bind a partir de `boot-logs/` dentro da sessão numerada. Portanto, esses registros de diagnóstico da inicialização são gravados independentemente da camada superior RAM e do snapshot de desligamento. Se o armazenamento de persistência não tiver sido ativado de forma durável durante a inicialização, não há garantia de que esses registros serão mantidos após uma reinicialização. Os registros comuns e os caches podem ser configurados separadamente; consulte [Desempenho](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

SquashFS não tem `perchsize`: o tamanho armazenado acompanha as alterações capturadas e comprimidas, enquanto a memória em tempo de execução é determinada pela camada superior gravável extraída. A camada de persistência LUKS MiniOS não protege `changes.sb`; se for necessário garantir a confidencialidade do snapshot, o armazenamento subjacente deve ser criptografado fora desta camada. Consulte [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence).

## Limite de ativação e recuperação da união

Para AUFS, a raiz de alterações ativada passa a ser a ramificação gravável zero. Para OverlayFS, o initrd cria `upperdir` e `workdir` abaixo da raiz de alterações ativada e monta os módulos somente leitura como diretórios inferiores. Em seguida, o initrd verifica a ramificação ativa AUFS ou OverlayFS `upperdir` antes de publicar a persistência como ativa.

Se um backend de persistência, uma atualização de metadados ou essa verificação falhar, as montagens são desfeitas quando possível, nenhum estado de persistência bem-sucedido é publicado e a inicialização gravável continua em RAM. Se não for possível construir a raiz da união, o sistema entra no shell fatal do initramfs. Sair desse shell pode permitir que a configuração continue com uma raiz inválida; isso não é um reparo nem uma alternativa segura. AUFS mantém as adições de ramificações de módulos em melhor esforço, mas uma união incompleta ultrapassa o limite de recuperação: MiniOS não marca a persistência como ativa.

Falhas na verificação do contêiner evitam deliberadamente montar uma sessão suspeita com permissão de escrita.
Não substitua nem reconstrua os arquivos da sessão durante a inicialização. Preserve primeiro o armazenamento afetado; consulte [Fazer backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Ventoy Plugin de persistência

Um backend selecionado pelo Plugin de persistência de Ventoy ignora a detecção de sessões numeradas. MiniOS resolve o mapeamento de dispositivos de Ventoy`vtoy_persistent` do dispositivo, exige uma imagem ext4 montada com permissão de gravação e usa um diretório `changes/` como camada superior do AUFS ou `changes/` mais `workdir/` para OverlayFS. Ele não cria `minios/changes/`, `session.conf`, nem sessões numeradas dentro dessa imagem. A persistência ainda exige uma solicitação de persistência reconhecida; **Iniciar sem salvar** permanece temporário.

O primeiro uso registra o formato de união em `.minios-union`. Um backend de união diferente, dispositivo ausente, sistema de arquivos incorreto, imagem sem permissão de gravação ou falha na ativação da união gera um aviso e uma nova camada superior RAM. Ele nunca substitui a imagem por outra apenas porque o sistema de arquivos dela tem um rótulo correspondente.

`perchdir` seleção de sessão e `perchtoram` são ignorados para uma imagem de plugin selecionada; as alterações permanecem nessa imagem mesmo com o sistema `toram`. O Session Manager e `minios-session` recusam operações, inclusive em diretórios de sessão personalizados. Selecione outra imagem em Ventoy para mudar de ambiente. Sem um backend de plugin selecionado, as inicializações normais de Ventoy usam o modelo padrão de sessões numeradas de MiniOS. Consulte [Ventoy](/installing-minios/installation-tools/Ventoy).

<a id="active-running-and-current-boot-state"></a>

## Estado ativo, em execução e da inicialização atual

Nos metadados persistentes da sessão, `default=` é a sessão **ativa** selecionada para a próxima retomada, enquanto `running=` é a sessão registrada como fornecedora da inicialização atual. A ativação grava os dois campos e marca essa sessão como `dirty`.
Depois que os pontos de montagem persistentes desaparecem durante um desligamento normal, MiniOS remove `running=` e marca a sessão como `clean`.

Esses campos de metadados podem estar desatualizados após uma falha, uma gravação de metadados malsucedida, uma montagem de união malsucedida, a cópia do armazenamento ou um desligamento interrompido. Os componentes de runtime que permitem salvar não confiam apenas em `running=`. Eles usam o estado protegido da inicialização atual no initrd, vinculado ao ID da inicialização, à sessão numérica, ao modo, à identidade real do armazenamento, ao status de gravação, à durabilidade, à geração ativa verificada e, para DynBlk, ao dispositivo `/dev/dynblkN`exatamente anexado. Se o registro da inicialização atual estiver ausente ou não puder ser validado, o armazenamento persistente não deve ser tratado como um destino de gravação aprovado.

Com `perchtoram=trim` ou `full`, os contêineres de sessão compatíveis são copiados para um tmpfs dedicado antes da ativação. A cópia só é permitida quando a memória disponível e o espaço livre no tmpfs comportam os tamanhos dos arquivos de apoio mais uma reserva; se a cópia falhar, a operação no armazenamento continua com um aviso. A sessão copiada pode fornecer a camada superior gravável, mas o estado protegido da inicialização atual a marca como não durável e registra uma identidade separada de `ram-origin` para o armazenamento original. `trim` copia apenas a sessão compatível selecionada e os metadados correspondentes; `full` copia todas as sessões Raw, DynFileFS, DynBlk, VMDK ou SquashFS compatíveis no armazenamento. Os dados de diretório nativo não são copiados: uma solicitação nativa bem-sucedida de RAM inicia um novo contêiner DynBlk ou DynFileFS vazio, exceto durante uma redefinição, que desativa a cópia. O Current Session Manager localiza o armazenamento original pelo UUID do sistema de arquivos e pode salvar explicitamente a sessão baseada em RAM de volta no armazenamento ou como uma nova sessão numerada. As alterações não salvas em RAM são perdidas quando não ocorre uma gravação de retorno bem-sucedida.

Para orientações operacionais relacionadas, consulte [Modos de inicialização](/using-minios/Boot-Modes), [Parâmetros de inicialização](/reference/Boot-Parameters), [Sessões e persistência](/using-minios/Sessions-and-Persistence), [Fazendo backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS), [Segurança](/maintenance-and-recovery/Security) e [Solução de problemas](/maintenance-and-recovery/Troubleshooting).

## Recuperação de espaço com reconhecimento de sessão

`minios-session reclaim ID` oferece suporte a DynFileFS, DynBlk e sessões VMDK. Em uma sessão de texto simples, executa FITRIM no sistema de arquivos ext4 interno real, nunca na raiz combinada AUFS/OverlayFS, e então chama a operação de recuperação do backend de armazenamento responsável. A recuperação de DynFileFS requer DynFileFS 4.6.0 ou posterior.

Em uma sessão DynFileFS em execução, o Session Manager entra em um namespace de montagem privado e temporário para acessar `virtual.dat` por baixo da montagem sobreposta do ext4 ativo, sem afetar o daemon ativo do sistema, o dispositivo de loop ou as montagens union. Dispositivos DynBlk/VMDK em execução são validados com base no estado protegido da inicialização atual. Sessões inativas são anexadas e montadas temporariamente; uma sessão já montada pelo Session Manager reutiliza essa conexão existente. Se a desmontagem estiver ocupada, o processo de encerramento é interrompido em vez de desconectar o armazenamento sob um sistema de arquivos ativo.

Nem a inicialização nem o desligamento executam a compactação automaticamente. `--compact` é uma opção explícita do usuário na CLI ou na opção desmarcada da caixa de diálogo do Session Manager e pode realocar dados em uso, aumentando as gravações no flash. Sem essa opção, os backends recuperam apenas o espaço que podem devolver sem mover dados em uso, como intervalos que permitem liberação de blocos ou finais de arquivo totalmente livres; em sistemas de arquivos como exFAT, intervalos internos liberados podem continuar reutilizáveis dentro do contêiner, mesmo que não possam ser devolvidos ao sistema de arquivos do host. Sessões criptografadas recuperam apenas o espaço já conhecido pelo backend e não ativam o discard silenciosamente por meio do dm-crypt.
