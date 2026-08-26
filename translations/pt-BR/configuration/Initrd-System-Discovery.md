# Descoberta do sistema Initrd

Após o bootloader carregar o kernel e o initramfs, o initramfs precisa localizar a árvore de dados do MiniOS que fornece os módulos do sistema `.sb`. Isso ocorre antes que a pilha de rede do espaço de usuário, o desktop e a sessão persistente estejam ativos.

## Precedência das fontes

A seleção da fonte segue uma ordem fixa de precedência:

1. Um valor literal `from=http://...` seleciona um ISO HTTP.
2. Caso contrário, qualquer valor `ip=` não vazio seleciona o download via PXE.
3. Caso contrário, `from=askdisk` ou `from=askdisk:...` abre o seletor de disco.
4. Caso contrário, o initramfs faz uma varredura nos dispositivos de bloco locais.

Os dois caminhos de rede não fazem fallback para mídia local. Após uma tentativa de ISO HTTP ou PXE, a descoberta retorna o resultado de rede correspondente em vez de tentar discos; um resultado inutilizável ou incompleto falha na validação ou na configuração posterior.

Essa ordem tem duas consequências importantes:

- `from=http://...` tem prioridade sobre `ip=`. O parâmetro opcional `ip=` então fornece o endereçamento estático para a conexão ISO HTTP.
- Um valor `ip=` não vazio tem prioridade sobre qualquer valor local `from=`, incluindo dispositivo, diretório, caminho ISO ou `askdisk`. Não use `ip=` apenas para configurar a rede de um sistema inicializado localmente.

## Descoberta local

Sem uma fonte HTTP ou `ip=` não vazio, o MiniOS realiza 45 tentativas de descoberta, aproximadamente uma por segundo. Cada tentativa atualiza os nós de dispositivo, obtém candidatos de dispositivos de bloco a partir de `blkid`, ordena seus nomes e os testa nessa ordem. O primeiro candidato que contiver uma fonte MiniOS qualificada é mantido; os dispositivos seguintes não são considerados.

Se `from=` estiver vazio, o caminho testado em cada sistema de arquivos é `minios`. Uma fonte é considerada qualificada quando esse diretório ou seu subdiretório imediato `modules/` contiver pelo menos um arquivo cuja extensão seja `.sb` por padrão. O parâmetro `bext=` altera a extensão usada nesse teste. A descoberta não valida se o conjunto de módulos encontrado está completo ou inicializável.

Cada candidato é montado inicialmente como somente leitura. Após ser qualificado, o MiniOS tenta tornar o ponto de montagem selecionado gravável, mas a incapacidade de fazê-lo não invalida uma fonte válida.

### Formatos locais de `from=`

Um caminho relativo ou absoluto comum é interpretado dentro de cada sistema de arquivos candidato. Barras iniciais são normalizadas pela construção do caminho, então ambos procuram o mesmo diretório:

```text
from=minios
from=/minios
```

Se o caminho solicitado for um arquivo regular em um sistema de arquivos candidato, o MiniOS o trata como um ISO, monta-o via loop como somente leitura e testa o diretório `minios` dentro do ISO:

```text
from=/images/minios.iso
```

Caminhos qualificados por dispositivo suportam apenas estes formatos:

```text
from=/dev/sdb1/minios
from=/dev/sr0/minios
from=/dev/disk/by-label/MINIOS/minios
```

`/dev/<name>/path` aceita um nome simples de dispositivo seguido de um caminho. O formato de rótulo deve ser exatamente `/dev/disk/by-label/LABEL/path`; o rótulo é resolvido com `blkid`, depois o caminho restante é testado nesse sistema de arquivos.

Não há parser correspondente para caminhos UUID, PARTUUID ou by-id. Formatos como os seguintes não são suportados:

```text
from=/dev/disk/by-uuid/UUID/minios
from=/dev/disk/by-partuuid/PARTUUID/minios
from=/dev/disk/by-id/ID/minios
```

### Seleção interativa

Use `askdisk` para selecionar uma partição e depois testar um caminho nela:

```text
from=askdisk
from=askdisk:custom:dir
```

O primeiro formato testa `minios` na partição selecionada. No segundo formato, os dois-pontos viram separadores de caminho, então `askdisk:custom:dir` testa `custom/dir`.
A sintaxe com barra, como `from=askdisk/custom/dir`, ainda abre o seletor, mas ignora silenciosamente o caminho personalizado e testa `minios`; não utilize esse método.

A lista de dispositivos exibida é atualizada enquanto o seletor está aberto e exclui sistemas de arquivos de swap. A seleção ainda realiza o teste normal de presença de módulos; apenas escolher uma partição não é suficiente.

## ISO HTTP

Uma fonte ISO HTTP tem este formato:

```text
from=http://server.example/path/minios.iso
```

Apenas HTTP simples é reconhecido. HTTPS e outros esquemas de URL não são suportados. O initramfs encontra a primeira interface de rede detectada que não seja loopback, ativa a rede e monta o ISO remoto via `httpfs2`. A seleção da interface não verifica link, conectividade ou se aquela interface é a utilizável em sistemas com múltiplas NICs.

Quando `ip=` está ausente, o boot via ISO HTTP solicita DHCP com `udhcpc`. Quando `ip=` está presente, utiliza os campos estáticos esperados pelo parser PXE:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

Para o boot via ISO HTTP, a URL ainda determina o servidor HTTP. Os campos estáticos configuram o endereço do cliente, máscara de rede, gateway padrão e entradas DNS iniciais; o campo de porta opcional pertence ao download de arquivos PXE e não substitui a porta da URL do ISO.

`cache=<MB>` ativa um cache httpfs do tamanho solicitado em `/tmp`. É um cache, não um download completo garantido. O sistema em execução continua dependendo do ISO remoto e da rede, a menos que uma cópia bem-sucedida para a RAM desconecte a fonte.

## Download de dados via PXE

Qualquer valor `ip=` não vazio seleciona o download de dados PXE, a menos que `from=http://...` tenha sido selecionado antes. A sintaxe suportada é:

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

A máscara de rede está no formato IPv4 pontilhado. A porta HTTP opcional padrão é `7529`.
Formas genéricas de kernel ou dracut como `ip=dhcp` e `ip=:::::eth0:dhcp` não são suportadas. O download de dados PXE em si não possui um formato DHCP neste parser.

O MiniOS configura a primeira interface detectada que não seja loopback sem garantir que ela tenha um link funcional. Ele solicita primeiro `PXEFILELIST` e os arquivos MiniOS listados via HTTP do campo servidor. TFTP é um fallback limitado: é selecionado apenas quando a solicitação HTTP inicial para `PXEFILELIST` falha. Não é failover geral de interface, fallback para mídia local ou recuperação de toda falha parcial de download HTTP.

## Cópia e desconexão com `toram=full`

`toram=full` é importante para a descoberta porque pode remover a dependência contínua da fonte selecionada. Após a descoberta, o MiniOS copia a árvore de dados para a RAM e então tenta desmontar a fonte e mover a cópia em RAM para o seu lugar. Somente um desmontar e mover bem-sucedidos desconectam a mídia local, um ISO montado em loop ou um ISO HTTP.

Limitações importantes:

- Não há verificação prévia se a RAM disponível pode comportar a cópia.
- Quando a persistência é solicitada, a cópia de nível superior `*` omite arquivos ocultos.
- Quando a persistência não é solicitada, a entrada `changes` é omitida propositalmente. Esse ramo copia outros itens de nível superior, incluindo arquivos ocultos.
- Falhas na cópia, desmontagem ou movimentação podem deixar a fonte original montada. Não presuma que especificar `toram=full` torna seguro remover a mídia ou perder a conexão de rede; verifique se a desconexão foi bem-sucedida.

Consulte [Persistência no Initrd](/configuration/Initrd-Persistence.md) antes de combinar `toram` com `perch` ou `perchdir`.

## Falha e diagnóstico

Se todas as 45 tentativas locais falharem, o MiniOS entra no caminho de erro fatal e abre um shell do initramfs em vez de iniciar o sistema live. Caminhos de rede não realizam a busca local de 45 tentativas nem fazem fallback para mídia local; dependendo do resultado parcial, podem falhar na verificação dos dados ou na configuração posterior. Sair de um shell fatal não corrige a fonte ausente e pode apenas permitir que a configuração posterior falhe de forma menos clara.

Parâmetros úteis de diagnóstico:

- `debug` ativa rastreamento do shell, diagnósticos adicionais e shells interativos em vários pontos do initramfs. Saia do shell de checkpoint para continuar.
- `timing` exibe o tempo decorrido entre os estágios do initramfs e um total final.
- `rd.break` solicita um shell do initramfs próximo à transição para o root real; saia dele para continuar a inicialização.

No shell, inspecione `/proc/cmdline`, `/proc/net/dev`, `blkid`, sistemas de arquivos montados e `/var/log/livedbg`. Comece com os valores exatos de `from=`, `ip=` e `bext=` mostrados em `/proc/cmdline`.

## Documentação relacionada

- [Modos de boot](/configuration/Boot-Modes.md)
- [Carregamento de módulos](/configuration/Initrd-Module-Loading.md)
- [Persistência](/configuration/Initrd-Persistence.md)
- [Boot pela rede](/installation/Network-Boot.md)
- [Parâmetros de boot](/configuration/Boot-Parameters.md)
- [Solução de problemas](/administration/Troubleshooting.md)
