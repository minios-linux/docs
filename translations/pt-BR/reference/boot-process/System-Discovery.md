---
updated: 2026-08-28
---

# Descoberta do sistema

Esta página explica o que os parâmetros de boot `from`, `ip`, `cache`, `bext`, `toram` e `toram=full` alteram. Ela é destinada a entradas de boot personalizadas, boot em rede e solução de problemas. A maioria dos usuários pode selecionar uma entrada normal no menu de boot sem definir esses parâmetros manualmente.

Após o bootloader carregar o kernel e o initramfs, o initramfs precisa localizar a árvore de dados MiniOS que fornece os módulos de sistema `.sb`. Isso ocorre antes de a pilha de rede do userspace, o desktop e a sessão persistente estarem ativos.

## Em linguagem simples

O MiniOS precisa localizar o diretório que contém seus módulos de sistema. Normalmente, ele procura em discos conectados por um diretório `minios/`. O parâmetro `from=` aponta para um diretório ou ISO diferente. Parâmetros de rede substituem essa busca local por um download HTTP de ISO ou PXE.

Encontrar um disco não garante que o conjunto de módulos está completo, e localizar os arquivos de sistema não habilita a persistência. Essas são etapas separadas do processo de inicialização.

## Parâmetros explicados

| Parâmetro | O que informa ao MiniOS | Uso típico |
|---|---|---|
| `from=PATH` | Procura por MiniOS em um diretório específico ou ISO em vez de aceitar a primeira fonte local correspondente. | Inicializar um ISO armazenado em disco ou usar um diretório não padrão. |
| `from=askdisk` | Abre um seletor interativo para a partição que contém MiniOS. | Vários discos conectados contêm fontes possíveis. |
| `from=http://...` | Monta um ISO a partir de um servidor HTTP simples. | Boot controlado via rede onde o sistema em execução pode continuar dependendo do servidor. |
| `ip=...` | Usa rede estática antecipada. Sem um HTTP `from=`, seleciona o download de dados PXE e ignora discos locais. | Implantação via PXE ou endereçamento estático para um ISO HTTP. |
| `cache=MB` | Aloca um cache httpfs para um ISO HTTP. Não garante que o ISO completo será baixado. | Reduz leituras repetidas de uma fonte HTTP. |
| `bext=EXTENSION` | Procura por nomes de arquivos de módulos com outra extensão em vez de `.sb`. | Apenas para imagens especializadas; não converte módulos. |
| `toram` ou `toram=full` | Copia toda a árvore de dados MiniOS descoberta para RAM e tenta desconectar a fonte. A forma simples significa `full`. | Operação temporária de RAM em uma máquina com memória suficiente. |

Se um boot local via USB parar antes da área de trabalho aparecer, primeiro remova valores personalizados de `from=` e `ip=`. Um `ip=` acidentalmente não vazio impede a descoberta de discos locais, enquanto um `from=` incorreto pode fazer o MiniOS procurar por um caminho inexistente.

## Ordem de precedência das fontes

A seleção de fonte segue uma ordem fixa:

1. Um valor literal de `from=http://...` seleciona um ISO HTTP.
2. Caso contrário, qualquer valor não vazio de `ip=` seleciona download via PXE.
3. Caso contrário, `from=askdisk` ou `from=askdisk:...` abre o seletor de disco.
4. Caso contrário, o initramfs escaneia dispositivos de bloco locais.

Os dois caminhos de rede não voltam para a mídia local. Após uma tentativa de ISO HTTP ou PXE, a descoberta retorna o resultado de rede em vez de tentar os discos; um resultado inutilizável ou incompleto falha na validação ou configuração posterior.

Essa ordem tem duas consequências importantes:

- `from=http://...` tem prioridade sobre `ip=`. O parâmetro opcional `ip=` então fornece endereçamento estático para a conexão do ISO HTTP.
- Um `ip=` não vazio tem prioridade sobre qualquer valor local de `from=`, incluindo dispositivo, diretório, caminho de ISO ou `askdisk`. Não use `ip=` apenas para configurar a rede de um sistema inicializado localmente.

## Descoberta local

Sem uma fonte HTTP ou `ip=` não vazio, o MiniOS faz 45 tentativas de descoberta, aproximadamente uma por segundo. Cada tentativa atualiza os nós de dispositivos, obtém candidatos de dispositivos de bloco a partir de `blkid`, ordena seus nomes de dispositivo e os testa nessa ordem. O primeiro candidato que contiver uma fonte MiniOS qualificada é mantido; dispositivos posteriores não são considerados.

Se `from=` estiver vazio, o caminho testado em cada sistema de arquivos é `minios`. Uma fonte é qualificada quando esse diretório ou seu subdiretório `modules/` imediato contém pelo menos um arquivo cuja extensão é `.sb` por padrão. O parâmetro `bext=` altera a extensão usada nesse teste. A descoberta não valida se o conjunto de módulos encontrado está completo ou inicializável.

Cada candidato é inicialmente montado como somente leitura. Após ser qualificado, o MiniOS tenta tornar esse ponto de montagem de dados selecionado gravável, mas a incapacidade de fazê-lo não rejeita uma fonte válida.

### Formatos locais de `from=`

Um caminho relativo ou absoluto comum é interpretado dentro de cada sistema de arquivos candidato. Barras iniciais são normalizadas pela construção do caminho, então ambos procuram o mesmo diretório:

```text
from=minios
from=/minios
```

Se o caminho solicitado for um arquivo regular em um sistema de arquivos candidato, o MiniOS o trata como um ISO, monta-o em loop como somente leitura e testa o diretório `minios` dentro do ISO:

```text
from=/images/minios.iso
```

Caminhos qualificados por dispositivo suportam apenas estes formatos:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` aceita um nome simples de dispositivo seguido de um caminho. O formato de label deve ser exatamente `/dev/disk/by-label/LABEL/path`; o label é resolvido com `blkid`, depois o caminho restante é testado nesse sistema de arquivos.

Não há um parser correspondente para caminhos UUID, PARTUUID ou by-id. Formatos como os seguintes não são suportados:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Seleção interativa

Use `askdisk` para selecionar uma partição e então testar um caminho nela:

```text
from=askdisk
from=askdisk:custom:dir
```

O primeiro formato testa `minios` na partição selecionada. No segundo formato, os dois-pontos tornam-se separadores de caminho, então `askdisk:custom:dir` testa `custom/dir`.
A sintaxe com barra, como `from=askdisk/custom/dir`, ainda abre o seletor, mas perde silenciosamente o caminho personalizado e testa `minios`; não use.

A lista de dispositivos exibida é atualizada enquanto o seletor está aberto e exclui sistemas de arquivos de swap. A seleção ainda realiza o teste normal de presença de módulo; apenas escolher uma partição não é suficiente.

## ISO HTTP

Uma fonte ISO HTTP tem este formato:

```text
from=http://server.example/path/minios.iso
```

Apenas HTTP simples é reconhecido. HTTPS e outros esquemas de URL não são suportados.
O initramfs encontra a primeira interface de rede detectada que não seja loopback, ativa a rede e monta o ISO remoto via `httpfs2`. A seleção de interface não verifica link, conectividade ou se aquela interface é a utilizável em sistemas com múltiplas placas de rede.

Quando `ip=` está ausente, o boot via ISO HTTP solicita DHCP com `udhcpc`. Quando `ip=` está presente, utiliza os campos estáticos esperados pelo parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Para boot via ISO HTTP, a URL ainda determina o servidor HTTP. Os campos estáticos configuram o endereço do cliente, máscara de rede, gateway padrão e entradas DNS antecipadas; o campo de porta opcional pertence ao download de arquivos PXE e não substitui a porta da URL do ISO.

`cache=<MB>` habilita um cache httpfs do tamanho solicitado em `/tmp`. É um cache, não um download garantido completo. O sistema em execução continua dependendo do ISO remoto e da rede, a menos que uma cópia bem-sucedida com RAM desanexe a fonte.

## Download de dados PXE

Qualquer valor não vazio de `ip=` seleciona download de dados via PXE, a menos que `from=http://...` tenha sido selecionado primeiro. A sintaxe suportada é:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

A máscara de rede deve estar na notação IPv4 pontuada. A porta HTTP opcional é `7529` por padrão.
Formas genéricas de kernel ou dracut como `ip=dhcp` e `ip=:::::eth0:dhcp` não são suportadas. O download de dados PXE em si não possui forma DHCP neste parser.

O MiniOS configura a primeira interface detectada que não seja loopback sem garantir que ela tenha link ativo. Ele primeiro solicita `PXEFILELIST` e os arquivos listados MiniOS via HTTP do campo servidor. TFTP é um fallback limitado: é selecionado apenas quando a requisição HTTP inicial para `PXEFILELIST` falha. Não é failover geral de interface, fallback para mídia local ou recuperação de toda falha parcial de download HTTP.

## Copiando e desanexando com `toram=full`

O `toram=full` é importante para a descoberta porque pode remover a dependência contínua da fonte selecionada. Após a descoberta, o MiniOS copia a árvore de dados para RAM e então tenta desmontar a fonte e mover a cópia RAM para o lugar. Apenas um desmontar e mover bem-sucedidos desanexarão a mídia local, um ISO montado em loop ou um ISO HTTP.

Limitações importantes:

- Não há verificação prévia se o RAM disponível comporta a cópia.
- Quando a persistência é solicitada, a cópia `*` de nível superior omite arquivos ocultos (dotfiles).
- Quando a persistência não é solicitada, a entrada `changes` é omitida de propósito. Esse ramo copia outros itens do nível superior, incluindo arquivos ocultos.
- Uma falha ao copiar, desmontar ou mover pode deixar a fonte original montada. Não presuma que especificar `toram=full` torna a remoção da mídia ou a perda de rede segura; verifique se o desanexamento foi bem-sucedido.

Consulte [Persistência do Initrd](/reference/boot-process/Persistence-Internals) antes de combinar `toram` com `perch` ou `perchdir`.

## Falha e diagnóstico

Se todas as 45 tentativas locais falharem, o MiniOS entra em modo de erro fatal e abre um shell do initramfs em vez de iniciar o sistema live. Caminhos de rede não realizam as 45 tentativas locais nem retornam para a mídia local; dependendo do resultado parcial, podem falhar na verificação dos dados ou na configuração posterior. Sair de um shell fatal não corrige a fonte ausente e pode apenas permitir que a configuração posterior falhe de forma menos clara.

Parâmetros úteis para diagnóstico:

- `debug` ativa rastreamento de shell, diagnósticos adicionais e shells interativos em vários pontos do initramfs. Saia de um shell de checkpoint para continuar.
- `timing` exibe o tempo decorrido entre estágios do initramfs e um total final.
- `rd.break` solicita um shell do initramfs próximo à transição para o root real; saia dele para continuar o boot.

No shell, inspecione `/proc/cmdline`, `/proc/net/dev`, `blkid`, sistemas de arquivos montados e `/var/log/livedbg`. Comece com os valores exatos de `from=`, `ip=` e `bext=` exibidos em `/proc/cmdline`.

## Documentação relacionada

- [Modos de boot](/using-minios/Boot-Modes)
- [Carregamento de módulos](/reference/boot-process/Module-Loading)
- [Persistência](/reference/boot-process/Persistence-Internals)
- [Boot em rede](/reference/boot-process/Network-Boot)
- [Parâmetros de boot](/reference/Boot-Parameters)
- [Solução de problemas](/maintenance-and-recovery/Troubleshooting)
