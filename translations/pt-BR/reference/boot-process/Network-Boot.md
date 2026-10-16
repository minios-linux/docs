---
updated: 2026-08-26
---

# Inicialização pela rede

Esta página descreve **como carregar MiniOS pela rede**: PXE (kernel + initrd + dados de MiniOS) e ISO via HTTP (`from=http://…`). Essa é a única finalidade da rede no initramfs MiniOS.

Isso **não** se refere a:

- Configurar o NetworkManager ou um endereço IP estático permanente após a inicialização do sistema
- Wi-Fi no initrd
- [live-config](/reference/configuration/live-config) (espaço de usuário tardio)

A rede da sessão após a inicialização é independente. Para definir um IP estático cabeado permanente, use a etapa Rede do instalador, o NetworkManager ou o ifupdown — não o parâmetro PXE`ip=` parâmetro.

Relacionado: [Parâmetros de inicialização](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Visão geral

| Modo | O que é inicializado | Como os dados de MiniOS são obtidos |
|------|----------------|-----------------------------|
| **PXE** | Kernel + initrd de um servidor de inicialização pela rede | Não vazio `ip=` sem `from=http://…` → o initrd baixa os arquivos MiniOS do servidor de dados PXE |
| **ISO via HTTP** | Kernel + initrd de mídia local **ou** PXE | `from=http://…/minios.iso` → o initrd ativa a rede e monta a ISO com `httpfs2` |
| **Mídia local** | USB / ISO / disco | Sem rede no initrd; busca apenas em mídia local |

Criadores de initramfs: **LiveKit** (`livekit-mos`) ou **dracut** (`dracut-mos`). Ambos usam os mesmos auxiliares de rede do LiveKit para buscar arquivos no início da inicialização.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` tem precedência sobre `ip=`. Nesse modo, `ip=` fornece endereçamento estático para a conexão da ISO via HTTP. Caso contrário, qualquer valor não vazio de `ip=` seleciona o caminho de dados **PXE** e ignora a mídia local. Não adicione `ip=` em uma inicialização normal por USB/ISO apenas para "definir um endereço estático". Nenhum dos caminhos de rede recorre à mídia local se a descoberta ou o download falhar.

## Requisitos

| Requisito | Observações |
|-------------|--------|
| Ethernet cabeada (ou virtio/vmxnet em máquinas virtuais) | É usada a primeira interface detectada que não seja loopback; não há verificação do link ou da conectividade, nem `BOOTIF` / `ethdevice` para seleção no initrd |
| Initrd com módulos de rede | Criado para variantes de pacote diferentes do valor interno de `minimum` (`--network`, geralmente `--cloud`) |
| Não depende de Wi-Fi | A rede sem fio não é compatível com a inicialização pela rede |
| Prefira placas de rede sem blobs de firmware | Placas que dependem de firmware frequentemente falham no initrd |
| Prefira imagens **Standard** ou maiores | A edição **Flux** não inclui módulos de placas de rede, portanto PXE / ISO via HTTP não é compatível na prática |
| Somente HTTP para URL da ISO | `from=http://…` funciona; **`https://` não é compatível** |

Ferramentas no initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` e `@mount.httpfs2`. O initrd não inclui o NetworkManager.

## Inicialização PXE

### Fluxo

1. O firmware / servidor PXE carrega o MiniOS **kernel** e **initrd** (pxelinux, iPXE etc. — fora do próprio MiniOS).
2. A linha de comando do kernel inclui um **`ip=`** (e normalmente `boot=live` para uma inicialização completa de MiniOS).
3. O initrd configura um endereço estático a partir de `ip=`, contata o **servidor** do campo, baixa uma lista de arquivos e, em seguida, MiniOS pacotes/arquivos.
4. O sistema continua para o root do ambiente live normalmente.

### Parâmetro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Função |
|-------|------|
| client-ip | Endereço atribuído com `ifconfig` |
| server-ip | Host dos dados HTTP/TFTP MiniOS; também definido como servidor DNS no initrd |
| gateway-ip | Rota padrão; também definido como servidor DNS |
| netmask | Máscara de rede IPv4 em notação decimal pontuada (não o tamanho do prefixo CIDR) |
| port | Porta HTTP opcional para a lista de arquivos e os arquivos (padrão **7529**) |

Exemplos:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Como os arquivos são obtidos

1. **HTTP** (preferencial): `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` e, em seguida, cada caminho listado nesse arquivo, do mesmo host/porta.
2. **TFTP**: o `tftp` só é selecionado se a solicitação HTTP inicial de `PXEFILELIST` falhar. Uma falha posterior no download de um arquivo via HTTP não muda a transferência para TFTP.

A porta padrão é **7529** quando o quinto campo é omitido.

### O que `ip=` não é

| Expectativa | Realidade |
|-------------|---------|
| Formatos do kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Não compatível** — interpretado incorretamente como endereço do cliente |
| IP estático durante toda a sessão live | **Não compatível** — após a inicialização, o NetworkManager (ou similar) controla a interface |
| IP estático durante o carregamento de dados MiniOS de USB/ISO | **Não use** — sem `from=http://…`, força o download de dados via PXE |
| Lista de DNS dedicada | Somente gateway + servidor são usados como servidores DNS no initrd |

## Inicialização ISO HTTP (`from=http://…`)

Carrega dados de MiniOS de uma ISO remota sem uma lista completa de arquivos PXE:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamento:

1. O initrd configura a rede:
   - Se **`ip=`** estiver definido → configuração estática, como acima
   - Se **`ip=`** não estiver definido → **DHCP** via busybox `udhcpc`
2. Monta a ISO remota com **`httpfs2`**
3. Continua procurando conteúdo de MiniOS nesse ponto de montagem

O **`cache=`** (megabytes) opcional ativa um cache de download httpfs, por exemplo `cache=512`.

Só **`http://`** é aceito para esse caminho de ISO remota. **`https://` não é compatível.**

## Depois que o sistema live é iniciado

| Item | Após switch\_root |
|------|-------------------|
| IP/rotas do kernel na NIC | Podem permanecer até que o userspace reconfigure a interface |
| DNS do initrd (`resolv.conf`) | Não é uma política de sessão persistente |
| Rede da sessão | Normalmente **NetworkManager** nas imagens padrão de MiniOS |
| Significado de `ip=` | Apenas para busca inicial — não é um perfil estático salvo |

Se a raiz ainda estiver sendo fornecida por **httpfs**, a reconfiguração da NIC pelo NetworkManager pode interromper a raiz ativa. Planeje as implantações com inicialização pela rede levando isso em conta (por exemplo, copie para RAM / evite, sempre que possível, substituir a interface usada para buscar os arquivos).

O **live-config** do userspace pode configurar a rede brevemente apenas para baixar hooks/preseeds remotos (`Setup_network`). Isso não tem relação com PXE/`ip=` endereçamento persistente.

## Erros comuns

1. Definir `ip=` na linha de comando de USB/ISO "para usar IP estático" → o sistema tenta baixar via PXE em vez de usar a mídia local, a menos que `from=http://…` tenha selecionado primeiro a inicialização ISO HTTP.
2. Usar `ip=dhcp` ou outra sintaxe de `ip=` kernel → parser incorreto e configuração de endereço com falha.
3. Esperar seleção de Wi-Fi ou de múltiplas NICs `BOOTIF` no initrd → não implementado.
4. Usar uma imagem **Flux** para PXE/ISO HTTP → faltam módulos de rede no initrd.
5. Disponibilizar a ISO apenas por HTTPS → `from=http://…` não corresponderá.
6. Confundir isso com a configuração estática do instalador/NetworkManager após o login.

## Resumo de confiabilidade

| Cenário | Avaliação |
|----------|------------|
| PXE + `ip=…` + lista HTTP na porta 7529 (ou TFTP se a solicitação da lista HTTP falhar), rede cabeada simples / virtio | Alvo compatível |
| `from=http://…iso` + DHCP (ou `ip=`), mesma classe de NIC | Geralmente funciona |
| Inicialização normal por USB/ISO | Rede do initrd não utilizada |
| Sessão estática via `ip=` | Não compatível |
| Múltiplas NICs / NIC de firmware / Wi-Fi / `https://` / edição Flux | Instável ou não compatível |

## Referência de implementação

| Componente | Localização na árvore MiniOS |
|-------|-----------------------------|
| Entrada de init | `linux-live/initramfs/livekit-mos/init` |
| Rede + PXE + ISO HTTP | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Construtor do LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Módulo Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quando `-n` é passado | `linux-live/build-initramfs` (não mínimo) |

## Consulte também

- [Parâmetros de inicialização](/reference/Boot-Parameters) — tabela completa de parâmetros (`ip`, `from`, `cache`, …)
- [Descoberta do sistema initrd](/reference/boot-process/System-Discovery) — precedência das fontes, descoberta local e comportamento em caso de falha
- [live-config](/reference/configuration/live-config) — configuração tardia do espaço de usuário (não é inicialização pela rede)
- [Arquitetura do sistema](/reference/System-Architecture)
- [Compilação de MiniOS](/development/Building-MiniOS) — construtor de initramfs (`livekit` / `dracut`)
