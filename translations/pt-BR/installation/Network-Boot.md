# Inicialização pela rede

Esta página descreve **como carregar o MiniOS pela rede**: PXE (kernel + initrd + dados do MiniOS) e HTTP ISO (`from=http://…`). Esse é o único objetivo do uso de rede dentro do initramfs do MiniOS.

Não se trata de:

- Configurar o NetworkManager ou um IP estático permanente após o sistema estar iniciado
- Wi‑Fi no initrd
- [live-config](/configuration/live-config.md) (userspace tardio)

A rede da sessão após o boot é separada. Para IP estático cabeado e persistente, utilize o passo de Rede do instalador, o NetworkManager ou o ifupdown—não o parâmetro `ip=` do PXE.

Relacionado: [Parâmetros de boot](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Visão geral

| Modo | O que é inicializado | Como os dados do MiniOS são obtidos |
|------|---------------------|-------------------------------------|
| **PXE** | Kernel + initrd a partir de um servidor de boot via rede | `ip=` não vazio → initrd baixa arquivos do MiniOS do servidor de dados PXE (HTTP preferencial, TFTP como alternativa) |
| **HTTP ISO** | Kernel + initrd de mídia local **ou** PXE | `from=http://…/minios.iso` → initrd ativa a rede e monta o ISO com `httpfs2` |
| **Mídia local** | USB / ISO / disco | Sem rede no initrd; busca apenas local |

Construtores de initramfs: **LiveKit** (`livekit-mos`) ou **dracut** (`dracut-mos`). Ambos usam os mesmos utilitários de rede do LiveKit para busca antecipada.

```text
find_data()
  ├─ from=http://…     → configure network → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

**Importante:** qualquer `ip=` não vazio seleciona o **caminho de dados PXE** e **ignora a mídia local**. Não adicione `ip=` em um boot normal por USB/ISO apenas para “definir um endereço estático”.

## Requisitos

| Requisito | Observações |
|-----------|------------|
| Ethernet cabeado (ou virtio/vmxnet em VMs) | Primeira interface utilizável não-loopback é usada; sem seleção `BOOTIF` / `ethdevice` no initrd |
| Initrd com módulos de rede | Construído para variantes de pacotes diferentes do **minimum** (`--network`, geralmente `--cloud`) |
| Sem dependência de Wi‑Fi | Wireless não é suportado no caminho de boot pela rede |
| Prefira NICs sem blobs de firmware | Placas dependentes de firmware frequentemente falham no initrd |
| Prefira imagens **standard+** | **minimum** omite módulos de NIC de rede → PXE / HTTP ISO ficam efetivamente sem suporte |
| Apenas HTTP para URL do ISO | `from=http://…` funciona; **`https://` não é suportado** |

Ferramentas no initrd: busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` e `@mount.httpfs2`. Não há NetworkManager no initrd.

## Inicialização PXE

### Fluxo

1. Firmware / servidor PXE carrega o **kernel** e o **initrd** do MiniOS (pxelinux, iPXE, etc.—fora do próprio MiniOS).
2. A linha de comando do kernel inclui um **`ip=`** não vazio (e normalmente `boot=live` para um boot completo do MiniOS).
3. O initrd configura um endereço estático a partir do `ip=`, contata o campo **server**, baixa a lista de arquivos e, em seguida, os pacotes/arquivos do MiniOS.
4. O sistema continua para o root live normalmente.

### Parâmetro `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Campo | Função |
|-------|--------|
| client-ip | Endereço atribuído com busybox `ifconfig` |
| server-ip | Host para dados do MiniOS via HTTP/TFTP; também escrito como servidor DNS no initrd |
| gateway-ip | Rota padrão; também escrito como servidor DNS |
| netmask | Máscara de rede IPv4 pontilhada (não prefixo CIDR) |
| port | Porta HTTP opcional para lista de arquivos e arquivos (padrão **7529**) |

Exemplos:

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Como os arquivos são baixados

1. **HTTP** (preferencial):  
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`  
   depois cada caminho listado nesse arquivo, do mesmo host/porta.
2. **TFTP** (alternativa caso HTTP falhe): busybox `tftp` para `PXEFILELIST` e arquivos listados.

A porta padrão é **7529** quando o quinto campo é omitido.

### O que `ip=` não é

| Expectativa | Realidade |
|-------------|----------|
| Formas do kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Não suportado** — interpretado erroneamente como endereço do cliente |
| IP estático para toda a sessão live | **Não suportado** — após o boot, o NetworkManager (ou similar) gerencia a interface |
| IP estático ainda durante boot por USB/ISO | **Não use** — força download de dados via PXE |
| Lista dedicada de DNS | Apenas gateway + servidor são usados como DNS no initrd |

## Inicialização HTTP ISO (`from=http://…`)

Carregue os dados do MiniOS a partir de um ISO remoto sem uma lista completa de arquivos PXE:

```text
from=http://192.168.1.1/path/minios.iso
```

Comportamento:

1. O initrd ativa a rede:
   - Se **`ip=`** estiver definido → configuração estática conforme acima
   - Se **`ip=`** for omitido → **DHCP** via busybox `udhcpc`
2. Monta o ISO remoto com **`httpfs2`**
3. Continua buscando o conteúdo do MiniOS nesse ponto de montagem

O parâmetro opcional **`cache=`** (em megabytes) ativa um cache de download httpfs, por exemplo `cache=512`.

Apenas **`http://`** é aceito para esse caminho de ISO remoto. **`https://` não é suportado.**

## Após o início do sistema live

| Item | Após switch_root |
|------|------------------|
| IP/rotas do kernel na NIC | Podem permanecer até o userspace reconfigurar a interface |
| DNS do initrd (`resolv.conf`) | Não é política de sessão permanente |
| Rede da sessão | Normalmente **NetworkManager** nas imagens padrão do MiniOS |
| Significado de `ip=` | Busca antecipada apenas — não é um perfil estático salvo |

Se o root ainda estiver sendo alimentado por **httpfs**, a reconfiguração da NIC pelo NetworkManager pode interromper o root live. Planeje implantações por boot de rede considerando isso (ex.: copie para RAM / evite sobrescrever a interface de busca sempre que possível).

O **live-config** no userspace tardio pode ativar a rede brevemente apenas para baixar hooks/preseeds remotos (`Setup_network`). Isso não está relacionado ao endereço persistente PXE/`ip=`.

## Erros comuns

1. Colocar `ip=` na linha de comando do USB/ISO “para IP estático” → o sistema tenta baixar via PXE em vez de usar a mídia local.
2. Usar `ip=dhcp` ou outra sintaxe de `ip=` do kernel → parser incorreto, configuração de endereço quebrada.
3. Esperar suporte a Wi‑Fi ou seleção multi-NIC `BOOTIF` no initrd → não implementado.
4. Usar imagem **minimum** para PXE/HTTP ISO → módulos de rede ausentes no initrd.
5. Servir o ISO apenas via HTTPS → `from=http://…` não funcionará.
6. Confundir isso com configuração estática do instalador/NetworkManager após login.

## Resumo de confiabilidade

| Cenário | Avaliação |
|---------|-----------|
| PXE + `ip=…` + lista HTTP na porta :7529 (ou TFTP), cabeado simples / virtio | Alvo suportado |
| `from=http://…iso` + DHCP (ou `ip=`), mesma classe de NIC | Normalmente funciona |
| Boot normal por USB/ISO | Rede do initrd não é usada |
| Sessão estática via `ip=` | Não suportado |
| Multi-NIC / NIC com firmware / Wi‑Fi / `https://` / edição minimum | Fraco ou sem suporte |

## Referência de implementação

| Componente | Localização na árvore do MiniOS |
|------------|-------------------------------|
| Entrada do init | `linux-live/initramfs/livekit-mos/init` |
| Rede + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Builder LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Módulo Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quando passado `-n` | `linux-live/build-initramfs` (não-minimum) |

## Veja também

- [Parâmetros de boot](/configuration/Boot-Parameters.md) — tabela completa de parâmetros (`ip`, `from`, `cache`, …)
- [live-config](/configuration/live-config.md) — configuração tardia no userspace (não boot pela rede)
- [Arquitetura do sistema](/about/System-Architecture.md)
- [Compilando o MiniOS](/development/Building-MiniOS.md) — builder de initramfs (`livekit` / `dracut`)
