---
updated: 2026-10-15
---

# Descoberta do sistema

Esta página explica como `from`, `ip`, `cache`, `bext`, `toram` e `toram=full` alteram os parâmetros de inicialização. Ela se destina a entradas de inicialização personalizadas, inicialização pela rede e solução de problemas. A maioria dos usuários pode selecionar uma entrada normal no menu de inicialização sem definir esses parâmetros manualmente.

Depois que o carregador de inicialização carrega o kernel e o initramfs, o initramfs precisa localizar a árvore de dados MiniOS que fornece os módulos do sistema `.sb`. Isso acontece antes que a pilha de rede normal do espaço do usuário, o ambiente de desktop e a sessão persistente estejam ativos.

## Em termos simples

MiniOS precisa encontrar o diretório que contém os módulos do sistema. Normalmente, ele procura em unidades conectadas por um diretório `minios/`. O parâmetro `from=` aponta para outro diretório ou ISO. Os parâmetros de rede substituem essa busca local pelo download de um ISO via HTTP ou PXE.

Encontrar uma unidade não garante que o conjunto de módulos esteja completo, e encontrar os arquivos do sistema não ativa a persistência. Essas são etapas de inicialização distintas.

## Parâmetros explicados

| Parâmetro | O que informa ao MiniOS | Uso típico |
|---|---|---|
| `from=PATH` | Procura MiniOS em um diretório ou ISO específico, em vez de aceitar a primeira origem local correspondente. | Inicializar um ISO armazenado em um disco ou usar um diretório não padrão. |
| `from=askdisk` | Abre um seletor interativo para a partição que contém MiniOS. | Várias unidades conectadas contêm possíveis origens. |
| `from=http://...` | Monta um ISO de um servidor HTTP simples. | Inicialização controlada pela rede, em que o sistema em execução pode continuar dependendo do servidor. |
| `ip=...` | Usa rede estática antecipada. Sem um `from=` HTTP, seleciona o download de dados via PXE e ignora as unidades locais. | Implantação PXE ou endereçamento estático para um ISO HTTP. |
| `cache=MB` | Aloca um cache httpfs para um ISO HTTP. Isso não garante que o ISO completo seja baixado. | Reduz leituras repetidas de uma origem HTTP. |
| `bext=EXTENSION` | Procura nomes de arquivos de módulos com outra extensão, em vez de `.sb`. | Somente para imagens especializadas; não converte módulos. |
| `toram` ou `toram=full` | Copia os dados de sistema MiniOS encontrados, incluindo entradas ocultas no nível superior, mas excluindo `changes/`, para RAM e tenta desconectar a origem. A cópia da sessão usa `perchtoram` separadamente. A forma sem argumentos significa `full`. | operação RAM em uma máquina com memória suficiente. |

Se a inicialização local por USB parar antes de a área de trabalho aparecer, primeiro remova os valores personalizados de `from=` e `ip=`. Um valor não vazio acidental em `ip=` impede a descoberta em unidades locais, enquanto um valor incorreto de `from=` pode fazer com que MiniOS procure um caminho inexistente.

## Prioridade das origens

A seleção da origem segue uma ordem de prioridade fixa:

1. Um valor literal de `from=http://...` seleciona um ISO HTTP.
2. Caso contrário, qualquer valor não vazio de `ip=` seleciona o download via PXE.
3. Caso contrário, `from=askdisk` ou `from=askdisk:...` abre o seletor de disco.
4. Caso contrário, o initramfs verifica os dispositivos de bloco locais.

Os dois caminhos de rede não recorrem à mídia local. Depois de uma tentativa de ISO HTTP ou PXE, a descoberta retorna o resultado da rede, em vez de tentar usar discos; um resultado inutilizável ou incompleto falha na validação ou em uma etapa posterior da configuração.

Esta ordem tem duas consequências importantes:

- `from=http://...` prevalece sobre `ip=`. O `ip=` opcional fornece o endereçamento estático para a conexão com o ISO HTTP.
- Um valor não vazio de `ip=` prevalece sobre qualquer valor local de `from=`, incluindo um dispositivo, diretório, caminho de ISO ou `askdisk`. Não use `ip=` apenas para configurar a rede de um sistema inicializado localmente.

## Descoberta local

Sem uma fonte HTTP nem um `ip=`, MiniOS realiza 45 ciclos de descoberta, aproximadamente um por segundo. Cada ciclo atualiza os nós de dispositivo e obtém candidatos a dispositivos de bloco de `blkid`. Se `/dev/mapper/ventoy` existir, esse mapeamento ISO será testado primeiro; os candidatos restantes serão classificados pelo nome do dispositivo e as duplicatas serão removidas. A primeira fonte MiniOS que atender aos critérios será mantida. Isso evita que módulos de substituição na partição de dados Ventoy sejam confundidos com a fonte ISO principal.

Se `from=` estiver vazio, o caminho testado em cada sistema de arquivos será `minios`. Uma fonte atende aos critérios quando esse diretório ou seu subdiretório imediato `modules/` contém pelo menos um arquivo cuja extensão é `.sb` por padrão. O parâmetro `bext=` altera a extensão usada nesse teste. A descoberta não valida se o conjunto de módulos encontrado está completo ou pode ser inicializado.

Cada candidato é montado inicialmente como somente leitura. Depois que ele atende aos critérios, MiniOS tenta tornar gravável essa montagem de dados selecionada, mas a impossibilidade de fazê-lo não invalida uma fonte que, de outra forma, seria válida.

### Formulários `from=`locais

Um caminho relativo comum ou com aparência de absoluto é interpretado dentro de cada sistema de arquivos candidato. As barras iniciais são normalizadas durante a construção do caminho; portanto, ambos procuram o mesmo diretório:

```text
from=minios
from=/minios
```

Se o caminho solicitado for um arquivo regular em um sistema de arquivos candidato, MiniOS o tratará como um ISO, montará em loop como somente leitura e testará o diretório `minios` dentro do ISO:

```text
from=/images/minios.iso
```

Caminhos com dispositivo especificado aceitam apenas estes formatos:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` aceita um nome de dispositivo simples seguido de um caminho. O formato com rótulo deve ser exatamente `/dev/disk/by-label/LABEL/path`; o rótulo é resolvido com `blkid`, e então o caminho restante é testado nesse sistema de arquivos.

Não há um analisador equivalente para caminhos UUID, PARTUUID ou by-id. Formatos como os seguintes não são aceitos:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Seleção interativa

Use `askdisk` para selecionar uma partição e testar um caminho nela:

```text
from=askdisk
from=askdisk:custom:dir
```

O primeiro formato testa `minios` na partição selecionada. No segundo formato, os dois-pontos são convertidos em separadores de caminho; assim, `askdisk:custom:dir` testa `custom/dir`.
A sintaxe com barras, como `from=askdisk/custom/dir` ainda abre o seletor, mas descarta silenciosamente o caminho personalizado e testa `minios`; não a use.

A lista de dispositivos exibida é atualizada enquanto o seletor está aberto e não inclui sistemas de arquivos de swap. A seleção ainda executa o teste normal de presença dos módulos; escolher apenas uma partição não é suficiente.

## ISO HTTP

Uma fonte ISO HTTP tem este formato:

```text
from=http://server.example/path/minios.iso
```

Somente HTTP simples é reconhecido. HTTPS e outros esquemas de URL não são aceitos.
O initramfs encontra a primeira interface de rede detectada que não seja loopback, ativa a rede e monta o ISO remoto por meio de `httpfs2`. A seleção da interface não verifica o link, a acessibilidade nem se essa é a interface utilizável em um sistema com várias placas de rede.

Quando `ip=` não está presente, a inicialização por ISO HTTP solicita DHCP com `udhcpc`. Quando `ip=` está presente, usa os campos estáticos esperados pelo analisador PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Na inicialização por ISO HTTP, a URL ainda determina o servidor HTTP. Os campos estáticos configuram o endereço do cliente, a máscara de rede, o gateway padrão e as entradas DNS iniciais; o campo de porta opcional pertence ao download de arquivos PXE e não substitui a porta na URL do ISO.

`cache=<MB>` ativa um cache httpfs do tamanho solicitado em `/tmp`. Trata-se de um cache, não de um download completo garantido. O sistema em execução continua dependendo do ISO remoto e da rede, a menos que uma cópia RAM seja concluída com sucesso e desacople a fonte.

## Download de dados via PXE

Qualquer `ip=` seleciona o download de dados via PXE, a menos que `from=http://...` tenha sido selecionado primeiro. A sintaxe compatível é:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

A máscara de rede usa a notação IPv4 decimal pontuada. A porta HTTP é opcional e, por padrão, `7529`.
Formatos genéricos de kernel ou dracut, como `ip=dhcp` e `ip=:::::eth0:dhcp`, não são compatíveis. Neste parser, o download de dados via PXE não tem uma forma DHCP.

MiniOS configura a primeira interface detectada que não seja loopback, sem verificar se ela tem um link ativo. Primeiro, solicita `PXEFILELIST` e os arquivos MiniOS listados via HTTP, usando o campo do servidor. O TFTP é uma alternativa limitada: só é selecionado quando a solicitação HTTP inicial de `PXEFILELIST` falha. Não se trata de failover geral de interface, alternativa de mídia local ou recuperação de toda e qualquer falha parcial de download HTTP.

## Cópia e desvinculação com `toram=full`

`toram=full` é importante para a descoberta, pois pode eliminar a dependência contínua da origem selecionada. Depois de descobrir a origem e qualquer árvore externa de MiniOS, o sistema copia os dados do sistema para RAM e, em seguida, tenta desmontar a origem e mover a cópia de RAM para o lugar dela. Somente a desmontagem e a movimentação bem-sucedidas desvinculam essa origem; também é necessário liberar os sistemas de arquivos host do ISO e os mapeamentos de Ventoy.

Limitações importantes:

- Não há uma verificação prévia para confirmar se o RAM disponível é suficiente para armazenar a cópia.
- A cópia completa do sistema inclui entradas ocultas no nível superior e omite `changes/`, independentemente de a persistência ter sido solicitada. Uma árvore externa de MiniOS descoberta é copiada sobre a árvore de origem, incluindo a substituição de módulos.
- Os contêineres de sessão compatíveis são copiados separadamente com `perchtoram=trim|full`; `perchtoram=off` mantém a dependência do armazenamento. As sessões nativas têm uma limitação diferente, descrita em [Modos de inicialização](/using-minios/Boot-Modes).
- Erros ao copiar o sistema levam ao caminho fatal do initramfs. Uma falha ao desmontar ou mover pode deixar a origem original montada enquanto a inicialização usa o caminho de preparação RAM. Não presuma que `toram=full` torna segura a remoção ou a perda da rede; verifique se a origem foi desvinculada.

Consulte [Persistência do initrd](/reference/boot-process/Persistence-Internals) antes de combinar `toram` com `perch` ou `perchdir`.

## Falhas e diagnóstico

Se todas as 45 tentativas locais falharem, MiniOS segue o caminho de erro fatal e abre um shell do initramfs em vez de iniciar o sistema live. Os caminhos de rede não fazem a busca local de 45 tentativas nem recorrem à mídia local; dependendo do resultado parcial, podem falhar na verificação dos dados ou em etapas posteriores da configuração. Sair de um shell de erro fatal não corrige a ausência da origem e pode apenas fazer com que uma etapa posterior falhe de forma menos clara.

Parâmetros úteis para diagnóstico:

- `debug` ativa o rastreamento do shell, diagnósticos adicionais e shells interativos em vários pontos de verificação do initramfs. Saia do shell de um ponto de verificação para continuar.
- `timing` exibe o tempo decorrido entre as etapas do initramfs e o total final.
- `rd.break` solicita um shell do initramfs perto da transferência para a raiz real; saia dele para continuar a inicialização.

Em um shell, verifique `/proc/cmdline`, `/proc/net/dev`, `blkid`, os sistemas de arquivos montados e `/var/log/livedbg`. Comece pelos valores exatos de `from=`, `ip=` e `bext=` exibidos em `/proc/cmdline`.

## Documentação relacionada

- [Modos de inicialização](/using-minios/Boot-Modes)
- [Carregamento de módulos](/reference/boot-process/Module-Loading)
- [Persistência](/reference/boot-process/Persistence-Internals)
- [Inicialização pela rede](/reference/boot-process/Network-Boot)
- [Parâmetros de inicialização](/reference/Boot-Parameters)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
