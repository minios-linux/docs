---
updated: 2026-08-31
---

# Rede

MiniOS usa o **NetworkManager** para conexões com e sem fio. MiniOS não substitui seu modelo de conexão por um sistema separado de configuração de rede.

Para o uso cotidiano, abra o ícone de rede no painel da área de trabalho. As ferramentas padrão do NetworkManager também estão disponíveis:

```bash
nmtui
nmcli
```

Use essas ferramentas para se conectar ao Wi-Fi, trocar de rede, configurar DHCP ou endereços estáticos, DNS, conexões VPN e outras tarefas comuns de rede em tempo de execução. Para conhecer todos os recursos, consulte a documentação e as páginas de manual do NetworkManager.

Em uma sessão persistente MiniOS, os perfis de conexão do NetworkManager são salvos como parte da sessão. Em **Iniciar sem salvar**, as alterações são perdidas ao desligar.

## Pré-configuração de rede

As configurações de rede específicas de MiniOS são, principalmente, **pré-configurações**. Elas são úteis quando uma imagem, um instalador ou uma implantação autônoma precisa iniciar com uma configuração de rede cabeada conhecida antes de o usuário abrir o NetworkManager.

O componente de rede do MiniOS `live-config` oferece suporte à pré-configuração de IPv4 cabeado. Ele não pré-configura o Wi-Fi.

Um exemplo de configuração estática em `config.conf` é:

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` aceita `dhcp`, `static` ou `off`. As opções não definidas e `dhcp` mantêm a configuração de rede existente na imagem, em vez de substituir o comportamento normal do NetworkManager. `static` grava uma configuração IPv4 estática cabeada; `off` prepara a interface cabeada selecionada para não se conectar automaticamente. Com `LIVE_NETWORK_BACKEND="auto"`, MiniOS dá preferência ao NetworkManager e usa o ifupdown como alternativa quando necessário. Se nenhuma interface for especificada, a pré-configuração só será aplicada quando for possível identificar exatamente uma interface cabeada elegível.

Consulte [Arquivo de configuração](/reference/configuration/config.conf) para saber onde essas configurações são armazenadas e [live-config](/reference/configuration/live-config) para consultar a referência completa de variáveis e componentes.

## Quando a pré-configuração é aplicada

O componente de rede executa uma etapa única de configuração `live-config`. Depois que ela é executada com sucesso em uma sessão persistente, as alterações comuns de rede devem ser feitas pelo NetworkManager, em vez de editar repetidamente a pré-configuração.

Se você precisar aplicar intencionalmente uma pré-configuração de rede MiniOS alterada à mesma sessão persistente, remova o marcador de conclusão e reinicie:

```bash
sudo rm -f /var/lib/live/config/network
```

Faça isso somente se quiser que `live-config` gere novamente a política de rede cabeada. Não é necessário fazer isso para alterar conexões Wi-Fi ou Ethernet comuns.

## Pré-configuração do instalador

A etapa de rede do Instalador do MiniOS também realiza a pré-configuração do sistema de destino. Ela oferece suporte a DHCP cabeado ou a configurações IPv4 estáticas. O Wi-Fi fica a cargo do NetworkManager após a inicialização do sistema instalado.

## A rede no início da inicialização é diferente

O NetworkManager configura o sistema MiniOS em execução. A rede usada pelo initramfs para obter o próprio MiniOS é um mecanismo separado.

O parâmetro de inicialização `ip=` boot, os downloads via PXE e `from=http://...` não criam perfis do NetworkManager e não devem ser usados para configurar a rede normal da área de trabalho. Consulte [Inicialização pela rede](/reference/boot-process/Network-Boot).

## Solução de problemas

Para problemas comuns de conexão, comece pelo próprio NetworkManager:

```bash
nmcli device status
nmcli connection show --active
```

Use o editor de conexões da área de trabalho, `nmtui`, ou os logs e a documentação padrão do NetworkManager para problemas comuns de Wi-Fi, DHCP, DNS, VPN ou Ethernet.

Os diagnósticos específicos de MiniOS são relevantes quando o problema envolve pré-configuração da rede ou inicialização pela rede. O log `live-config` do `/var/log/live/config.log`; os problemas de inicialização precoce pela rede são abordados no guia de [Inicialização pela rede](/reference/boot-process/Network-Boot).

## Documentação relacionada

- [Arquivo de configuração](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Inicialização pela rede](/reference/boot-process/Network-Boot)
- [Gerenciamento de sessões](/using-minios/Sessions-and-Persistence)
