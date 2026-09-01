---
updated: 2026-08-31
---

# Rede

MiniOS utiliza o **NetworkManager** para conexões de rede cabeada e Wi-Fi normais. MiniOS não substitui seu modelo de conexão por um sistema de configuração de rede separado.

Para uso comum, abra o ícone de rede no painel da área de trabalho. As ferramentas padrão do NetworkManager também estão disponíveis:

```bash
nmtui
nmcli
```

Use essas ferramentas para conectar-se ao Wi-Fi, alternar redes, configurar endereços DHCP ou estáticos, DNS, conexões VPN e outras tarefas normais de rede em tempo de execução. Para informações completas sobre o funcionamento dessas ferramentas, consulte a documentação e as páginas de manual do NetworkManager.

Em uma sessão persistente do MiniOS, os perfis de conexão do NetworkManager são salvos como parte dessa sessão. Em **Iniciar sem salvar**, as alterações desaparecem ao desligar.

## Pré-configuração de rede

As configurações de rede específicas do MiniOS são principalmente de **pré-configuração**. Elas são úteis quando uma imagem, instalador ou implantação automatizada precisa iniciar com uma configuração de rede cabeada conhecida antes do usuário abrir o NetworkManager.

O componente de rede MiniOS `live-config` oferece suporte à pré-configuração de IPv4 cabeado. Não faz pré-configuração de Wi-Fi.

Um exemplo estático em `config.conf` é:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` aceita `dhcp`, `static` ou `off`. Se não definido e `dhcp`, a configuração de rede existente da imagem é preservada, em vez de substituir o comportamento padrão do NetworkManager. `static` grava uma configuração estática de IPv4 cabeada; `off` prepara a interface cabeada selecionada para não se conectar automaticamente. Com `LIVE_NETWORK_BACKEND="auto"`, MiniOS prefere o NetworkManager e recorre ao ifupdown quando necessário. Se nenhuma interface for especificada, a pré-configuração só será aplicada quando exatamente uma interface cabeada elegível puder ser identificada.

Veja [Arquivo de configuração](/reference/configuration/config.conf) para saber onde essas configurações são armazenadas e [live-config](/reference/configuration/live-config) para a referência completa de variáveis e componentes.

## Quando a pré-configuração se aplica

O componente de rede é uma etapa de configuração `live-config` única. Depois de executado com sucesso em uma sessão persistente, alterações comuns de rede devem ser feitas pelo NetworkManager, e não editando repetidamente a pré-configuração.

Se for necessário aplicar uma pré-configuração de rede MiniOS alterada na mesma sessão persistente, remova o selo de conclusão e reinicie:

```bash
sudo rm -f /var/lib/live/config/network
```

Faça isso apenas quando realmente quiser que `live-config` gere novamente a política de rede cabeada. Alterar conexões normais de Wi-Fi ou Ethernet não exige esse procedimento.

## Pré-configuração do instalador

A etapa de rede do Instalador do MiniOS também realiza a pré-configuração do sistema de destino. Ela oferece suporte a DHCP cabeado ou configurações IPv4 estáticas. A configuração de Wi-Fi fica a cargo do NetworkManager após a inicialização do sistema instalado.

## Rede no início do boot é diferente

O NetworkManager configura o sistema MiniOS em execução. A rede utilizada pelo initramfs para obter o próprio MiniOS é um mecanismo separado.

O parâmetro de boot `ip=`, downloads via PXE e `from=http://...` não criam perfis do NetworkManager e não devem ser usados para configurar a rede normal do desktop. Veja [Boot pela rede](/reference/boot-process/Network-Boot).

## Solução de problemas

Para um problema comum de conexão, comece pelo próprio NetworkManager:

```bash
nmcli device status
nmcli connection show --active
```

Use o editor de conexões da área de trabalho, `nmtui`, ou os logs e documentação padrão do NetworkManager para problemas normais de Wi-Fi, DHCP, DNS, VPN ou Ethernet.

Diagnósticos específicos do MiniOS são relevantes quando o problema envolve pré-configuração de rede ou boot pela rede. O log `live-config` é `/var/log/live/config.log`; problemas iniciais de boot pela rede são abordados no guia [Boot pela rede](/reference/boot-process/Network-Boot).

## Documentação relacionada

- [Arquivo de configuração](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Boot pela rede](/reference/boot-process/Network-Boot)
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence)
