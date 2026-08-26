# Persistência do Initrd

O MiniOS constrói o sistema raiz ao vivo a partir de módulos somente leitura e uma camada superior gravável. O initrd decide se essa camada superior será uma sessão persistente numerada ou um diretório temporário em RAM. Esta página descreve essa decisão e o caminho de ativação durante a inicialização. Para os controles voltados ao usuário, consulte [Modos de Inicialização](./Boot-Modes.md) e [Parâmetros de Inicialização](./Boot-Parameters.md).

## Persistência é explícita

O initrd só habilita o gerenciamento de persistência quando a linha de comando do kernel contém um destes tokens reconhecidos:

- `perch`
- `perchdir=...`
- `perchmode=...`
- `perchsize=...`
- `perchreserve=...`

Se nenhum desses tokens estiver presente, inclusive quando houver apenas um nome `perch...` não reconhecido, o MiniOS cria uma nova camada superior gravável em RAM. As alterações feitas durante esse boot são descartadas no desligamento.

Os seletores não são todos equivalentes:

| Seletor | Comportamento do Initrd |
|---|---|
| `perch` | Tenta retomar o padrão de metadados. Não cria automaticamente uma sessão quando nenhuma está disponível ou quando as verificações de compatibilidade falham. |
| `perchdir=resume` | Tenta o padrão de metadados e pode criar automaticamente um novo substituto compatível. Este é o comportamento atual do menu de inicialização ao retomar. |
| `perchdir=new` | Aloca um diretório cujo ID numérico é um a mais que o maior ID existente. Nunca reutiliza um diretório existente. |
| `perchdir=ask` | Oferece sessões existentes e a opção de nova sessão. Uma sessão existente incompatível exige confirmação. |
| `perchdir=NUMBER` | Usa esse diretório quando ele existe. Se não existir, a seleção pode recair para o padrão registrado nos metadados; não reserva o número solicitado. |

Outros parâmetros de persistência reconhecidos sem um seletor entram no mesmo caminho legado de retomada que `perch` isolado: solicitam persistência, mas não permitem criação automática. Se a seleção ou ativação não conseguir produzir uma camada superior utilizável, o boot continua normalmente com a camada em RAM e exibe um aviso de falha.

## Armazenamento de sessões e localização

O armazenamento padrão é o diretório `changes` ao lado dos dados do MiniOS, com diretórios de sessões numerados e metadados `session.conf` ou `session.json`:

```text
minios/changes/
|-- session.conf
|-- session.json
|-- 1/
`-- 2/
```

O armazenamento pode ser selecionado como um dispositivo mais um caminho opcional. Formatos aceitos incluem um caminho `/dev/...` direto, `/dev/disk/by-label/LABEL/...`, `/dev/mapper/...`, `label:LABEL/...`, `askdisk` e `askdisk:custom:path`. O sufixo delimitado por dois-pontos torna-se um caminho abaixo do dispositivo selecionado; a sintaxe com barra após `askdisk` perde silenciosamente esse caminho personalizado. Um subdiretório selecionado é montado via bind como o armazenamento de sessões. O MiniOS também pode detectar uma partição de persistência no mesmo disco e armazenamento de persistência compatível com Ventoy.

Antes da seleção da sessão, o initrd deve montar o local como gravável e provar que pode criar e remover um marcador no armazenamento. Um dispositivo de bloco que não pode ser aberto para gravação, uma montagem somente leitura, um caminho indisponível ou uma falha no teste de gravação rejeitam a persistência para aquele boot. Sessões existentes não são confiáveis apenas porque seus arquivos podem ser lidos.

## Seleção e compatibilidade

Os metadados da sessão registram o modo de armazenamento e podem registrar a versão do MiniOS, edição, sistema de arquivos em união e tamanho do contêiner. A retomada compara o modo, versão, edição e união registrados com o modo solicitado e o sistema atual. Campos de compatibilidade legados ausentes não são tratados como incompatibilidades.

O `perchdir=resume` literal cria uma nova sessão numerada quando seu padrão está ausente ou quando um modo, versão, edição ou união registrados tornam esse padrão inadequado. `perch` isolado, uma seleção numérica direta e outras solicitações legadas de retomada recusam substituição automática e continuam em RAM após falha na seleção. `perchdir=ask` exibe informações de compatibilidade e permite uma substituição explícita. Uma nova sessão usa `native` como padrão, a menos que outro modo seja solicitado.

O modo de armazenamento faz parte da compatibilidade. Se a seleção chegar ao despacho do backend, um modo solicitado desconhecido recai para `native`, cuja detecção pode então selecionar DynFileFS em armazenamento inadequado. Uma sessão existente com modo registrado diferente pode falhar na verificação de compatibilidade anterior; uma solicitação de retomada legada então continua em RAM em vez de chegar a esse fallback.

## Reserva de espaço e tamanhos

O MiniOS mantém 256 MiB livres no sistema de arquivos de persistência por padrão. A reserva e as verificações de espaço livre usam blocos de sistema de arquivos de 1024 bytes. `perchreserve` aceita um número inteiro sem unidade, é limitado a 4096 e volta para 256 quando está ausente ou inválido. Novas alocações e expansões solicitadas são limitadas para que essa reserva permaneça livre. O boot também avisa quando o espaço livre atual está igual ou abaixo da reserva.

Os tamanhos dos contêineres usam valores inteiros alocados em MiB:

- Um número isolado, `M` ou `MB` significa MiB.
- `G` ou `GB` multiplica o número por 1000 MiB.
- `T` ou `TB` multiplica o número por 1.000.000 MiB.
- O pedido lógico máximo é de 1.000.000 MiB, limitado ainda pelo espaço disponível após a reserva.
- O Gerenciador de Sessões limita arquivos raw e LUKS a 4000 MiB em FAT32. Durante a ativação do initrd, o limite é aplicado de forma confiável ao LUKS, enquanto um pedido raw superdimensionado pode chegar à alocação e falhar em vez de ser reduzido.
- Novas sessões raw e LUKS usam 4000 MiB como padrão.
- Uma nova sessão DynFileFS criada pelo initrd usa como padrão a capacidade disponível após a reserva, arredondada para baixo para um múltiplo de 1000 MiB quando possível.

O crescimento do contêiner é feito por melhor esforço e a redução não é suportada. `perchsize` não dimensiona sessões nativas ou SquashFS. O Gerenciador de Sessões usa seu próprio padrão de 4000 MiB para sessões de contêiner recém-criadas; veja [Gerenciamento de Sessões](./Session-Management.md).

## Ativação do armazenamento

Todos os modos bem-sucedidos devem fornecer a camada superior gravável esperada pelo sistema de arquivos em união selecionado. Apenas montar o backend não é autoridade final em tempo de execução. Nativo, DynFileFS, raw e LUKS podem atualizar os metadados da sessão persistente antes da validação da união; SquashFS adia esse commit de metadados. O estado protegido do boot atual só é publicado após a confirmação de que a união raiz final está usando a camada superior esperada.

### Nativo

O modo nativo primeiro exclui sistemas de arquivos não POSIX conhecidos, como FAT, exFAT e NTFS. Em seguida, testa o comportamento real do sistema de arquivos criando um arquivo e um link simbólico e verificando alterações no modo executável. Se o teste for bem-sucedido, o diretório de sessão numerado é montado via bind diretamente como área gravável.

Se o sistema de arquivos for conhecido como inadequado ou o teste POSIX falhar, o modo nativo recai para DynFileFS. Uma falha após a ativação nativa é revertida; um novo candidato vazio é removido quando pode ser removido com segurança.

### DynFileFS

O DynFileFS, implementado pelo utilitário compatível com `dynblk`, armazena uma imagem lógica de bloco em `changes.dat` mais seus arquivos de segmento numerados. O utilitário deve montar com sucesso e expor `virtual.dat`; caso contrário, a ativação falha em vez de criar acidentalmente um arquivo apenas em RAM com nome que parece persistente.

A imagem lógica contém ext4. Imagens existentes são verificadas antes da montagem gravável; resultados do fsck acima do status de erros corrigidos rejeitam a sessão e a preservam para recuperação. O redimensionamento é apenas para crescimento, e o sistema de arquivos ext4 interno é expandido quando possível. Veja [Recuperação do DynFileFS](./DynFileFS-Recovery.md) para detalhes sobre segmentos e reparo.

### Raw

O modo raw utiliza uma imagem ext4 `changes.img` fixa. Novas imagens são alocadas e formatadas antes do uso. Imagens existentes são verificadas antes da montagem, podem ser expandidas para um tamanho maior solicitado e têm o ext4 expandido para usar toda a imagem. Uma verificação ou montagem com falha deixa o contêiner disponível para recuperação e continua o boot em RAM.

### LUKS

O modo LUKS utiliza um contêiner LUKS2 `changes.luks` com ext4 diretamente dentro dele. Só está disponível quando o initrd inclui o marcador de suporte a criptografia e as ferramentas necessárias. A criação solicita confirmação de entrada correspondente. Um contêiner existente permite três tentativas de desbloqueio no console de boot.

O initrd autentica antes de expandir um arquivo criptografado existente, depois verifica e expande o ext4 antes de montá-lo. Se a criação, desbloqueio, verificação, redimensionamento ou montagem falhar, o MiniOS limpa o mapeamento e continua em RAM. Nunca recai para nativo, DynFileFS, raw ou qualquer outra persistência não criptografada. As senhas não são armazenadas nos metadados da sessão nem passadas como argumentos de comando. Veja [Segurança](../administration/Security-Hardening.md).

### SquashFS

O initrd só pode ativar uma sessão SquashFS existente; não pode criar um novo `changes.sb`. A ativação valida metadados rigorosos e de valor único para o snapshot, incluindo seu hash, tamanhos comprimido e descomprimido, quantidade de entradas, tipo de união e política de salvamento. Também verifica o tipo e tamanho exato do arquivo, RAM e swap disponíveis, o hash SHA-256 antes e depois da extração e a compatibilidade da união atual.

O snapshot é extraído com tratamento rigoroso de erros e xattr para uma imagem ext4 temporária e limitada em RAM. Para OverlayFS, essa imagem contém diretórios `changes` e `workdir` separados; para AUFS, sua raiz é o branch gravável. Metadados malformados, memória insuficiente, alteração do hash, erros de extração ou uma política inválida fazem a ativação falhar e deixam o boot na camada RAM padrão.

Uma sessão marcada como `dirty` significa que o boot anterior não completou a transição de desligamento limpo. O SquashFS então avisa e restaura o último `changes.sb` salvo com sucesso; alterações não salvas do boot interrompido não constituem uma segunda geração de rollback.

O Gerenciador de Sessões e o backend de salvamento do sistema criam e substituem snapshots SquashFS de forma atômica usando captura exata. A ativação no boot pode ler um snapshot existente de armazenamento FAT, exFAT ou NTFS gravável porque a extração ocorre na camada superior ext4 temporária. A criação e o salvamento exato continuam restritos ao sistema de arquivos: sua área de preparação privada deve preservar links, propriedade, modos, xattrs, ACLs, capacidades e whiteouts de união, então o salvamento atual requer um sistema de arquivos POSIX adequado. Veja [Gerenciamento de Sessões](./Session-Management.md).

## Ativação da união e limite de recuperação

Para AUFS, a raiz de alterações ativada torna-se o branch gravável zero. Para OverlayFS, o initrd constrói `upperdir` e `workdir` abaixo da raiz de alterações ativada e monta os módulos somente leitura como diretórios inferiores. O initrd então verifica o branch AUFS ativo ou o `upperdir` do OverlayFS antes de publicar a persistência como ativa.

Se um backend de persistência, atualização de metadados ou essa verificação falhar, as montagens são desfeitas quando possível, nenhuma autoridade de tempo de execução bem-sucedida é publicada e o boot gravável continua em RAM. Falha ao construir a união raiz entra no shell fatal do initramfs. Sair desse shell pode permitir que a configuração continue com uma raiz inválida; isso não é um reparo nem um fallback seguro. O AUFS mantém a melhor tentativa de anexar módulos, mas uma união incompleta cruza o limite de recuperação: o MiniOS não publica autoridade de persistência bem-sucedida.

Falhas de verificação de contêiner evitam deliberadamente a recuperação gravável. Preserve a sessão e siga [Recuperação de backup](../administration/Backup-Recovery.md), [Recuperação do DynFileFS](./DynFileFS-Recovery.md) ou [Solução de problemas](../administration/Troubleshooting.md) em vez de substituir arquivos de sessão durante o boot.

## Estado ativo, em execução e do boot atual

Nos metadados duráveis da sessão, `default=` é a sessão **ativa** selecionada para a próxima retomada, enquanto `running=` é a sessão registrada como fornecedora do boot atual. A ativação grava ambos os campos e marca essa sessão como `dirty`. Após os pontos de montagem de persistência desaparecerem durante um desligamento limpo, o MiniOS remove `running=` e marca a sessão como `clean`.

Esses campos de metadados podem ficar desatualizados após uma falha, falha na gravação dos metadados, falha na construção da união, cópia do armazenamento ou desligamento interrompido. Consumidores em tempo de execução que precisam autorizar salvamento não confiam apenas em `running=`. Eles usam o estado protegido do boot atual do initrd, vinculado ao ID do boot, sessão numérica, modo, identidade real do armazenamento, status de gravação, durabilidade e geração ativa verificada. Um registro de boot atual com falha ou ausente significa que a persistência não deve ser tratada como destino autorizado de salvamento.

Com `toram` e uma solicitação de persistência reconhecida, o armazenamento de sessões é copiado para a RAM antes da ativação. A sessão copiada pode ser gravável e pode fornecer a camada superior em execução, mas seu estado de boot atual é marcado como não durável. Alterações nessa cópia em RAM não retornam ao dispositivo original e são perdidas no desligamento.

Para orientações operacionais relacionadas, veja [Modos de Inicialização](./Boot-Modes.md), [Parâmetros de Inicialização](./Boot-Parameters.md), [Gerenciamento de Sessões](./Session-Management.md), [Recuperação do DynFileFS](./DynFileFS-Recovery.md), [Recuperação de Backup](../administration/Backup-Recovery.md), [Segurança](../administration/Security-Hardening.md) e [Solução de problemas](../administration/Troubleshooting.md).
